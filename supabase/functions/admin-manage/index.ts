// =====================================================================
// Supabase Edge Function : admin-manage
//
// Gestion autonome des comptes administrateurs DEPUIS le tableau de bord,
// sans passer par le SQL editor ni par le prestataire.
//
// Pourquoi une Edge Function ?
//   Créer / supprimer un compte d'authentification (auth.users) et écrire
//   dans public.admin_users exigent la clé SERVICE ROLE, qui ne doit
//   JAMAIS être exposée côté navigateur. Cette fonction s'exécute côté
//   serveur Supabase (la clé y est injectée automatiquement) et vérifie à
//   chaque appel que l'appelant est bien un administrateur « propriétaire ».
//
// Actions (POST { action, ... }) :
//   • "list"          — tout admin : liste l'équipe + le rôle de l'appelant
//   • "create"        — owner : crée un compte + l'enrôle dans admin_users
//   • "remove"        — owner : retire un admin (admin_users + auth.users)
//   • "set-password"  — owner : réinitialise le mot de passe d'un membre
//   • "set-role"      — owner : change le rôle d'un membre (owner/editor)
//
// Convention de réponse (comme hyper-task/notify-contact) : HTTP 200 avec
//   { ok: true, ... }  en cas de succès
//   { ok: false, error: "<code>" }  en cas d'échec métier ou d'autorisation
//   → le client teste simplement `data.ok`. Le 500 est réservé aux
//     exceptions inattendues.
//
// Sécurité :
//   - L'appelant est identifié via son JWT (en-tête Authorization, ajouté
//     automatiquement par supabase-js quand une session admin est active).
//   - Un appelant absent de admin_users → refusé. Les actions sensibles
//     exigent le rôle "owner".
//   - Le changement de SON PROPRE mot de passe se fait côté client
//     (sb.auth.updateUser) et ne passe pas par ici.
//   - Garde-fous : on ne peut pas se retirer soi-même, ni retirer /
//     rétrograder le dernier "owner" (anti-verrouillage du compte).
//
// Aucun secret à ajouter : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont
// injectés automatiquement par Supabase dans toute Edge Function.
// Déploiement : voir supabase/functions/README-admin-manage.md
// =====================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ROLES = ["owner", "editor"];

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
// Échec métier / autorisation : toujours 200 + { ok:false, error }.
function fail(error: string, detail?: string): Response {
  return json(detail ? { ok: false, error, detail } : { ok: false, error });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // --- 1. Identifier l'appelant via son JWT ---
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
    if (!token) return fail("unauthorized");

    const { data: udata, error: uerr } = await admin.auth.getUser(token);
    const caller = udata?.user;
    if (uerr || !caller) return fail("unauthorized");

    // --- 2. L'appelant doit être un administrateur enregistré ---
    const { data: callerRow } = await admin
      .from("admin_users").select("role").eq("user_id", caller.id).maybeSingle();
    if (!callerRow) return fail("forbidden");
    const isOwner = callerRow.role === "owner";

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const action = String(body.action || "");

    // --- LIST : accessible à tout admin ---
    if (action === "list") {
      const { data: rows, error } = await admin
        .from("admin_users")
        .select("user_id,email,role,created_at")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return json({
        ok: true,
        admins: rows,
        me: { user_id: caller.id, email: caller.email, role: callerRow.role },
      });
    }

    // --- Toutes les autres actions : réservées au rôle "owner" ---
    if (!isOwner) return fail("forbidden_owner_only");

    if (action === "create") {
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const role = ROLES.includes(String(body.role)) ? String(body.role) : "editor";
      const fullName = String(body.full_name || "").trim();
      if (!/.+@.+\..+/.test(email)) return fail("invalid_email");
      if (password.length < 8) return fail("weak_password");

      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: fullName ? { full_name: fullName } : {},
      });
      if (cErr || !created?.user) {
        return fail("create_failed", cErr?.message || "unknown");
      }
      const newId = created.user.id;
      const { error: iErr } = await admin
        .from("admin_users").insert({ user_id: newId, email, role });
      if (iErr) {
        // Rollback : ne pas laisser un compte auth orphelin non-admin.
        await admin.auth.admin.deleteUser(newId).catch(() => {});
        return fail("enroll_failed", iErr.message);
      }
      return json({ ok: true, admin: { user_id: newId, email, role } });
    }

    if (action === "remove") {
      const userId = String(body.user_id || "");
      if (!userId) return fail("missing_user_id");
      if (userId === caller.id) return fail("cannot_remove_self");

      const { data: targetRow } = await admin
        .from("admin_users").select("role").eq("user_id", userId).maybeSingle();
      if (!targetRow) return fail("not_found");

      if (targetRow.role === "owner") {
        const { count } = await admin
          .from("admin_users").select("*", { count: "exact", head: true }).eq("role", "owner");
        if ((count || 0) <= 1) return fail("last_owner");
      }

      await admin.from("admin_users").delete().eq("user_id", userId);
      await admin.auth.admin.deleteUser(userId).catch(() => {});
      return json({ ok: true });
    }

    if (action === "set-password") {
      const userId = String(body.user_id || "");
      const password = String(body.password || "");
      if (!userId) return fail("missing_user_id");
      if (password.length < 8) return fail("weak_password");
      const { error } = await admin.auth.admin.updateUserById(userId, { password });
      if (error) return fail("update_failed", error.message);
      return json({ ok: true });
    }

    if (action === "set-role") {
      const userId = String(body.user_id || "");
      const role = ROLES.includes(String(body.role)) ? String(body.role) : "";
      if (!userId || !role) return fail("invalid");
      if (userId === caller.id) return fail("cannot_change_own_role");

      // Empêcher de rétrograder le dernier owner.
      if (role !== "owner") {
        const { data: targetRow } = await admin
          .from("admin_users").select("role").eq("user_id", userId).maybeSingle();
        if (targetRow?.role === "owner") {
          const { count } = await admin
            .from("admin_users").select("*", { count: "exact", head: true }).eq("role", "owner");
          if ((count || 0) <= 1) return fail("last_owner");
        }
      }
      const { error } = await admin.from("admin_users").update({ role }).eq("user_id", userId);
      if (error) return fail("update_failed", error.message);
      return json({ ok: true });
    }

    return fail("unknown_action");
  } catch (e) {
    console.error("admin-manage error", e);
    return json({ error: String(e) }, 500);
  }
});

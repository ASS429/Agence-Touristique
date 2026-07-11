// =====================================================================
// Supabase Edge Function : notify-contact
//
// Trois rôles selon le payload reçu :
//   • (défaut) contact  — INSERT contact_requests → 2 emails Resend
//        1. À ACT   : notification d'une nouvelle demande (avec le détail)
//        2. Au client : accusé de réception localisé (si email fourni)
//   • action:"newsletter_subscribe" — double opt-in : insère l'abonné en
//        confirmed=false (service role) + envoie l'email de confirmation.
//   • action:"newsletter_confirm"   — valide le token → confirmed=true.
//
// Secrets requis (Dashboard → Edge Functions → Manage secrets) :
//   RESEND_API_KEY   : clé API Resend (re_...)
//   NOTIFY_TO        : email de réception ACT (ex. act@orange.sn)
//   NOTIFY_FROM      : expéditeur vérifié Resend
//                      (ex. "ACT <notifications@act-senegal.com>" une fois
//                       le domaine vérifié ; sinon "onboarding@resend.dev")
//   WEBHOOK_SECRET   : (optionnel) jeton partagé pour authentifier l'appel
//                      — comparé à l'en-tête x-webhook-secret du webhook.
//                      ⚠️ NE PAS définir tant que le formulaire public appelle
//                      la fonction sans ce header (sinon 401 sur newsletter).
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY : injectés automatiquement par
//                      Supabase — utilisés pour l'écriture newsletter.
//
// Déploiement : voir supabase/functions/README.md
// =====================================================================

// Origine publique utilisée dans le lien de confirmation newsletter.
const SITE_URL = Deno.env.get("SITE_URL") || "https://act-senegal.com";

interface ContactRow {
  id?: string;
  kind?: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  language?: string | null;
  message?: string | null;
  circuit_slug?: string | null;
  travelers?: number | null;
  budget?: string | null;
  extra?: Record<string, unknown> | null;
  created_at?: string | null;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

// Accusé de réception client — localisé selon la langue de la demande.
const ACK_SUBJECT: Record<string, string> = {
  fr: "Nous avons bien reçu votre demande — Africa Connection Tours",
  en: "We have received your request — Africa Connection Tours",
  it: "Abbiamo ricevuto la tua richiesta — Africa Connection Tours",
  de: "Wir haben Ihre Anfrage erhalten — Africa Connection Tours",
};

const ACK_BODY: Record<string, (name: string) => string> = {
  fr: (n) => `Bonjour ${n},\n\nMerci pour votre demande auprès d'Africa Connection Tours. Notre équipe l'a bien reçue et reviendra vers vous sous 24 heures ouvrées.\n\nÀ très bientôt,\nL'équipe ACT — Dakar, depuis 1996\nact-senegal.com`,
  en: (n) => `Hello ${n},\n\nThank you for your request to Africa Connection Tours. Our team has received it and will get back to you within 24 business hours.\n\nWarm regards,\nThe ACT team — Dakar, since 1996\nact-senegal.com`,
  it: (n) => `Buongiorno ${n},\n\nGrazie per la tua richiesta ad Africa Connection Tours. Il nostro team l'ha ricevuta e ti risponderà entro 24 ore lavorative.\n\nA presto,\nIl team ACT — Dakar, dal 1996\nact-senegal.com`,
  de: (n) => `Guten Tag ${n},\n\nvielen Dank für Ihre Anfrage an Africa Connection Tours. Unser Team hat sie erhalten und meldet sich innerhalb von 24 Werkstunden bei Ihnen.\n\nHerzliche Grüße,\nIhr ACT-Team — Dakar, seit 1996\nact-senegal.com`,
};

function esc(s: unknown): string {
  return String(s ?? "—")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Corps HTML de la notification interne ACT.
function buildAdminHtml(r: ContactRow): string {
  const extra = r.extra && typeof r.extra === "object"
    ? Object.entries(r.extra)
        .map(([k, v]) => `<tr><td style="padding:2px 10px 2px 0;color:#9C8F79">${esc(k)}</td><td>${esc(typeof v === "object" ? JSON.stringify(v) : v)}</td></tr>`)
        .join("")
    : "";
  return `
  <div style="font-family:system-ui,sans-serif;max-width:560px">
    <h2 style="color:#C8593B;margin:0 0 4px">Nouvelle demande — ${esc(r.kind || "contact")}</h2>
    <p style="color:#9C8F79;margin:0 0 16px">Reçue via act-senegal.com</p>
    <table style="font-size:14px;line-height:1.6;border-collapse:collapse">
      <tr><td style="padding:2px 10px 2px 0;color:#9C8F79">Nom</td><td><b>${esc(r.full_name)}</b></td></tr>
      <tr><td style="padding:2px 10px 2px 0;color:#9C8F79">Email</td><td>${esc(r.email)}</td></tr>
      <tr><td style="padding:2px 10px 2px 0;color:#9C8F79">Téléphone</td><td>${esc(r.phone)}</td></tr>
      <tr><td style="padding:2px 10px 2px 0;color:#9C8F79">Langue</td><td>${esc(r.language)}</td></tr>
      ${r.circuit_slug ? `<tr><td style="padding:2px 10px 2px 0;color:#9C8F79">Circuit</td><td>${esc(r.circuit_slug)}</td></tr>` : ""}
      ${r.travelers ? `<tr><td style="padding:2px 10px 2px 0;color:#9C8F79">Voyageurs</td><td>${esc(r.travelers)}</td></tr>` : ""}
      ${r.budget ? `<tr><td style="padding:2px 10px 2px 0;color:#9C8F79">Budget</td><td>${esc(r.budget)}</td></tr>` : ""}
      ${extra}
    </table>
    <div style="margin-top:14px;padding:12px 14px;background:#FBF8F3;border:1px solid #EFE7D6;border-radius:10px;font-size:14px;white-space:pre-wrap">${esc(r.message)}</div>
    <p style="margin-top:16px"><a href="https://act-senegal.com/admin/" style="color:#C8593B">Ouvrir dans le tableau de bord →</a></p>
  </div>`;
}

async function sendEmail(apiKey: string, payload: Record<string, unknown>): Promise<boolean> {
  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------
// NEWSLETTER — double opt-in
// ---------------------------------------------------------------------

const NL_SUBJECT: Record<string, string> = {
  fr: "Confirmez votre inscription à la newsletter — Africa Connection Tours",
  en: "Confirm your newsletter subscription — Africa Connection Tours",
  it: "Conferma l'iscrizione alla newsletter — Africa Connection Tours",
  de: "Bestätigen Sie Ihr Newsletter-Abonnement — Africa Connection Tours",
};

const NL_TEXT: Record<string, { lead: string; btn: string; foot: string }> = {
  fr: { lead: "Merci de votre intérêt pour Africa Connection Tours. Pour finaliser votre inscription à notre newsletter, confirmez votre adresse en cliquant sur le lien ci-dessous.", btn: "Confirmer mon inscription", foot: "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email." },
  en: { lead: "Thank you for your interest in Africa Connection Tours. To complete your newsletter subscription, please confirm your address using the link below.", btn: "Confirm my subscription", foot: "If you did not request this, you can safely ignore this email." },
  it: { lead: "Grazie per il tuo interesse per Africa Connection Tours. Per completare l'iscrizione alla newsletter, conferma il tuo indirizzo tramite il link qui sotto.", btn: "Conferma l'iscrizione", foot: "Se non hai richiesto questo, ignora semplicemente questa email." },
  de: { lead: "Vielen Dank für Ihr Interesse an Africa Connection Tours. Um Ihr Newsletter-Abonnement abzuschließen, bestätigen Sie bitte Ihre Adresse über den untenstehenden Link.", btn: "Abonnement bestätigen", foot: "Falls Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail einfach." },
};

function buildNewsletterHtml(lang: string, link: string): string {
  const t = NL_TEXT[lang] || NL_TEXT.fr;
  return `
  <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto">
    <h2 style="color:#C8593B;margin:0 0 12px">Africa Connection Tours</h2>
    <p style="font-size:14px;line-height:1.6;color:#26211B">${t.lead}</p>
    <p style="margin:22px 0">
      <a href="${link}" style="display:inline-block;background:#C8593B;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:600">${t.btn}</a>
    </p>
    <p style="font-size:12px;color:#9C8F79;line-height:1.5">${t.foot}<br>${link}</p>
  </div>`;
}

// Appel PostgREST authentifié service role (écriture newsletter).
async function pgrest(method: string, path: string, body?: unknown): Promise<Response> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants");
  return await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function handleNewsletterSubscribe(apiKey: string, from: string, body: Record<string, unknown>): Promise<Response> {
  const email = String(body.email || "").trim().toLowerCase();
  const lang = String(body.language || "fr").toLowerCase();
  const name = String(body.full_name || "").trim();
  if (!/.+@.+\..+/.test(email)) {
    return json({ error: "invalid_email" }, 400);
  }

  // Existe déjà ?
  const look = await pgrest("GET", `newsletter_subscribers?email=eq.${encodeURIComponent(email)}&select=id,confirmed,confirm_token,unsubscribed`);
  const rows = await look.json().catch(() => []);
  let token: string;

  if (Array.isArray(rows) && rows.length > 0) {
    const row = rows[0];
    if (row.confirmed === true && row.unsubscribed !== true) {
      return json({ ok: true, already: true }); // déjà abonné et confirmé
    }
    // Non confirmé ou désabonné → on réactive et on redemande confirmation.
    token = row.confirm_token;
    await pgrest("PATCH", `newsletter_subscribers?id=eq.${row.id}`, {
      confirmed: false, unsubscribed: false, language: lang,
      ...(name ? { full_name: name } : {}),
    });
  } else {
    const ins = await pgrest("POST", "newsletter_subscribers", {
      email, full_name: name || null, language: lang,
      source: String(body.source || "footer"), confirmed: false,
    });
    if (!ins.ok) {
      console.error("newsletter insert error", ins.status, await ins.text());
      return json({ error: "insert_failed" }, 500);
    }
    const created = await ins.json().catch(() => []);
    token = Array.isArray(created) ? created[0]?.confirm_token : created?.confirm_token;
    if (!token) return json({ error: "no_token" }, 500);
  }

  const link = `${SITE_URL}/?confirm_newsletter=${token}`;
  await sendEmail(apiKey, {
    from,
    to: [email],
    subject: NL_SUBJECT[lang] || NL_SUBJECT.fr,
    html: buildNewsletterHtml(lang, link),
  });
  return json({ ok: true, pending: true });
}

async function handleNewsletterConfirm(body: Record<string, unknown>): Promise<Response> {
  const token = String(body.token || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(token)) return json({ error: "invalid_token" }, 400);

  const upd = await pgrest("PATCH",
    `newsletter_subscribers?confirm_token=eq.${token}&confirmed=eq.false`,
    { confirmed: true, confirmed_at: new Date().toISOString() });
  if (!upd.ok) {
    console.error("newsletter confirm error", upd.status, await upd.text());
    return json({ error: "update_failed" }, 500);
  }
  const updated = await upd.json().catch(() => []);
  if (Array.isArray(updated) && updated.length > 0) {
    return json({ ok: true, confirmed: true });
  }
  // Rien mis à jour : soit déjà confirmé, soit token inconnu.
  const chk = await pgrest("GET", `newsletter_subscribers?confirm_token=eq.${token}&select=confirmed`);
  const chkRows = await chk.json().catch(() => []);
  if (Array.isArray(chkRows) && chkRows.length > 0) {
    return json({ ok: true, already: true }); // déjà confirmé
  }
  return json({ ok: false, invalid: true }, 404);
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    },
  });
}

Deno.serve(async (req: Request) => {
  // Préflight CORS (appel newsletter depuis le navigateur)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }
  try {
    // Authentification optionnelle du webhook
    const expected = Deno.env.get("WEBHOOK_SECRET");
    if (expected && req.headers.get("x-webhook-secret") !== expected) {
      return new Response("Unauthorized", { status: 401 });
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    const notifyTo = Deno.env.get("NOTIFY_TO") || "act@orange.sn";
    const notifyFrom = Deno.env.get("NOTIFY_FROM") || "onboarding@resend.dev";
    if (!apiKey) {
      return new Response("RESEND_API_KEY manquant", { status: 500 });
    }

    // Le webhook Supabase envoie { type, table, record, old_record }
    const body = await req.json().catch(() => ({}));

    // Dispatch newsletter (double opt-in) selon l'action.
    if (body.action === "newsletter_subscribe") {
      return await handleNewsletterSubscribe(apiKey, notifyFrom, body);
    }
    if (body.action === "newsletter_confirm") {
      return await handleNewsletterConfirm(body);
    }

    const r: ContactRow = body.record || body;

    // 1) Notification interne ACT
    await sendEmail(apiKey, {
      from: notifyFrom,
      to: [notifyTo],
      reply_to: r.email || undefined,
      subject: `Nouvelle demande (${r.kind || "contact"}) — ${r.full_name || "Visiteur"}`,
      html: buildAdminHtml(r),
    });

    // 2) Accusé de réception client (si email fourni)
    if (r.email) {
      const lang = (r.language || "fr").toLowerCase();
      const subj = ACK_SUBJECT[lang] || ACK_SUBJECT.fr;
      const bodyText = (ACK_BODY[lang] || ACK_BODY.fr)(r.full_name || "");
      await sendEmail(apiKey, {
        from: notifyFrom,
        to: [r.email],
        subject: subj,
        text: bodyText,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});

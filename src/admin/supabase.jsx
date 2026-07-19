import { createClient } from '@supabase/supabase-js';
// =====================================================================
// src/admin/supabase.jsx — client Supabase (v2)
//
// Ce fichier initialise le client Supabase utilisé par l'admin
// et par le loader public. Il expose aussi des helpers CRUD génériques.
//
// CONFIGURATION :
//   Remplacer les valeurs SUPABASE_URL et SUPABASE_ANON_KEY par celles
//   du projet Supabase (voir Settings → API dans le dashboard).
//
//   Ces valeurs sont publiques (elles apparaissent dans le code client).
//   La sécurité est garantie par RLS côté serveur, pas par le secret.
// =====================================================================

const SUPABASE_URL      = window.__ACT_SUPABASE_URL__      || 'https://divcmjwqgsdkdsdrjwbg.supabase.co';
const SUPABASE_ANON_KEY = window.__ACT_SUPABASE_ANON_KEY__ || 'sb_publishable_TzKuydg2b8QXUJSztNiW9A_NVAY6pD7';

// Verrou d'auth NEUTRALISÉ. Le navigator.locks par défaut de Supabase pouvait
// rester bloqué indéfiniment sur un verrou périmé (laissé par un onglet fermé
// ou un contexte crashé), faisant « traîner » aussi bien la connexion que la
// déconnexion — d'où « Connexion trop lente » et l'obligation d'ouvrir une
// fenêtre privée. Un garde-fou par timeout ne suffisait pas sur tous les
// navigateurs. Pour un back-office mono-administrateur, on exécute donc chaque
// opération d'auth DIRECTEMENT, sans jamais solliciter le LockManager du
// navigateur (compromis assumé : pas de coordination inter-onglets du refresh
// de token, sans impact réel pour un usage à un seul administrateur).
const noopLock = async (_name, _acquireTimeout, fn) => fn();

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'act-admin-session',
    lock: noopLock
  }
});

// ---------------------------------------------------------------------
// Helpers CRUD génériques
// ---------------------------------------------------------------------

async function sbList(table, opts = {}) {
  let q = sb.from(table).select('*');
  if (opts.orderBy) q = q.order(opts.orderBy, { ascending: opts.ascending !== false });
  else q = q.order('sort_order', { ascending: true }).order('created_at', { ascending: false });
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

async function sbGet(table, id) {
  const { data, error } = await sb.from(table).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

async function sbInsert(table, payload) {
  const { data, error } = await sb.from(table).insert(payload).select().single();
  if (error) throw error;
  return data;
}

async function sbUpdate(table, id, payload) {
  const { data, error } = await sb.from(table).update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function sbDelete(table, id) {
  const { error } = await sb.from(table).delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------
// Storage helpers (bucket "media")
// ---------------------------------------------------------------------

async function sbUpload(file, folder = 'photos') {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const stem = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-]+/gi, '-').toLowerCase().slice(0, 40);
  const path = `${folder}/${Date.now()}-${stem}.${ext}`;
  const { error } = await sb.storage.from('media').upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type || undefined
  });
  if (error) throw error;
  const { data } = sb.storage.from('media').getPublicUrl(path);
  return { path, url: data.publicUrl };
}

async function sbRemoveStorage(path) {
  const { error } = await sb.storage.from('media').remove([path]);
  if (error) throw error;
}

// ---------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------

async function sbSignIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

async function sbSignOut() {
  await sb.auth.signOut();
}

async function sbGetUser() {
  const { data } = await sb.auth.getUser();
  return data.user;
}

// Lecture RAPIDE de la session (locale, sans appel réseau au serveur auth).
// Utilisée pour la vérification initiale au chargement de l'admin : évite
// que le spinner tourne indéfiniment si getUser() (réseau) traîne.
async function sbGetSession() {
  const { data } = await sb.auth.getSession();
  return data.session?.user || null;
}

// Vérifie que l'utilisateur connecté est bien un administrateur autorisé
// (membre de la table admin_users, via la fonction SQL is_admin()).
// Défense en profondeur : même si un compte client (magic link espace
// client) parvient jusqu'ici, il n'est pas dans admin_users → refusé.
// La sécurité réelle est portée par les policies RLS ; ce check évite
// juste d'afficher une coquille d'admin vide/erreurs à un non-admin.
async function sbIsAdmin() {
  try {
    const { data, error } = await sb.rpc('is_admin');
    if (error) throw error;
    return data === true;
  } catch (e) {
    // En cas d'échec réseau, on refuse par défaut (fail-closed).
    if (window.console) console.warn('[ACT admin] Vérification is_admin échouée:', e.message);
    return false;
  }
}

function sbOnAuthChange(cb) {
  return sb.auth.onAuthStateChange((_event, session) => cb(session?.user || null));
}

// Réinitialise l'état local (équivalent « fenêtre privée » en un clic).
// N'effectue AUCUN appel réseau/auth (qui pourrait justement être ce qui
// bloque) : purge synchrone du stockage de session, puis désinstallation des
// service workers et vidage des caches, le tout best-effort. À appeler avant
// un rechargement dur de la page.
async function sbResetAuthStorage() {
  // 1. Session Supabase (clé dédiée + clés sb-* résiduelles) — synchrone.
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k === 'act-admin-session' || k.startsWith('sb-') || k.includes('supabase.auth'))) {
        localStorage.removeItem(k);
      }
    }
  } catch { /* stockage indisponible */ }
  // 2. Service workers : on les désinstalle pour repartir propre.
  try {
    if (navigator.serviceWorker) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister().catch(() => {})));
    }
  } catch { /* ignore */ }
  // 3. Caches (dont l'ancien shell admin éventuel).
  try {
    if (window.caches) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k).catch(() => {})));
    }
  } catch { /* ignore */ }
}

// Interop window + exports ES.
const SUPABASE_CONFIGURED = !SUPABASE_URL.includes('REPLACE-ME') && SUPABASE_ANON_KEY !== 'REPLACE-ME';
if (typeof window !== 'undefined') Object.assign(window, {
  SB: sb, sbList, sbGet, sbInsert, sbUpdate, sbDelete, sbUpload, sbRemoveStorage,
  sbSignIn, sbSignOut, sbGetUser, sbGetSession, sbIsAdmin, sbOnAuthChange, sbResetAuthStorage, SUPABASE_CONFIGURED,
});
export {
  sb as SB, sbList, sbGet, sbInsert, sbUpdate, sbDelete, sbUpload, sbRemoveStorage,
  sbSignIn, sbSignOut, sbGetUser, sbGetSession, sbIsAdmin, sbOnAuthChange, sbResetAuthStorage, SUPABASE_CONFIGURED,
};

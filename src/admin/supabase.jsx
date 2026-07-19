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

// Verrou résilient pour l'auth (remplace le navigator.locks par défaut).
// Problème résolu : signInWithPassword / refresh peuvent rester bloqués
// indéfiniment sur un verrou navigator.locks périmé (laissé par un onglet ou
// un chargement précédent) → le bouton « Se connecter » tourne sans fin.
// Ici, si le verrou n'est pas acquis en 5 s, on exécute l'opération SANS
// verrou plutôt que de bloquer l'interface.
async function resilientLock(name, acquireTimeout, fn) {
  if (typeof navigator === 'undefined' || !navigator.locks || !navigator.locks.request) {
    return await fn();
  }
  const controller = new AbortController();
  // 2,5 s suffisent : au-delà, le verrou est presque sûrement périmé (onglet
  // fermé, contexte crashé) → on exécute sans verrou plutôt que d'accumuler
  // des attentes qui menaient au « Connexion trop lente ».
  const timer = setTimeout(() => controller.abort(), acquireTimeout > 0 ? acquireTimeout : 2500);
  try {
    return await navigator.locks.request(name, { signal: controller.signal }, async () => {
      clearTimeout(timer);
      return await fn();
    });
  } catch (_e) {
    clearTimeout(timer);
    return await fn();  // verrou indisponible/périmé : on n'attend pas indéfiniment
  }
}

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'act-admin-session',
    lock: resilientLock
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

// Réinitialise l'état d'authentification local. Résout le cas où une session
// stockée corrompue/expirée fait « traîner » le chargement ou la connexion
// (l'utilisateur devait ouvrir une fenêtre privée). On purge la clé de
// session Supabase + toute clé sb-* résiduelle, puis on relâche au mieux les
// Web Locks d'auth restés verrouillés. Ne touche à rien d'autre du site.
async function sbResetAuthStorage() {
  try { await sb.auth.signOut({ scope: 'local' }); } catch { /* best-effort */ }
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k === 'act-admin-session' || k.startsWith('sb-') || k.includes('supabase.auth'))) {
        localStorage.removeItem(k);
      }
    }
  } catch { /* stockage indisponible */ }
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

// =====================================================================
// src/admin/supabase.jsx — client Supabase (v2, UMD)
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

// Le client Supabase v2 UMD expose `window.supabase.createClient`.
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'act-admin-session'
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

function sbOnAuthChange(cb) {
  return sb.auth.onAuthStateChange((_event, session) => cb(session?.user || null));
}

// Exports globaux (pas de modules ES via Babel Standalone)
window.SB = sb;
window.sbList = sbList;
window.sbGet = sbGet;
window.sbInsert = sbInsert;
window.sbUpdate = sbUpdate;
window.sbDelete = sbDelete;
window.sbUpload = sbUpload;
window.sbRemoveStorage = sbRemoveStorage;
window.sbSignIn = sbSignIn;
window.sbSignOut = sbSignOut;
window.sbGetUser = sbGetUser;
window.sbOnAuthChange = sbOnAuthChange;
window.SUPABASE_CONFIGURED = !SUPABASE_URL.includes('REPLACE-ME') && SUPABASE_ANON_KEY !== 'REPLACE-ME';

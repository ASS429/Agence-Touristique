// =====================================================================
// src/supabase-public.jsx — Loader Supabase pour le site public
//
// Ce fichier est chargé AVANT data.jsx dans index.html. Il expose une
// fonction `window.actLoadFromSupabase()` qui — SI la configuration
// est présente et valide — récupère les contenus publiés depuis la
// base et les injecte comme surcouche des tableaux de data.jsx.
//
// Design goals :
//   1. Aucune régression : si Supabase n'est pas configuré ou renvoie
//      une erreur, on continue avec les données statiques de data.jsx.
//   2. Latence minimale : la première peinture utilise data.jsx pour
//      un affichage instantané ; les données Supabase (potentiellement
//      plus fraîches) écrasent au chargement.
//   3. Migration progressive : on peut activer/désactiver depuis
//      window.__ACT_USE_DB__ (défaut : true si configuré).
//
// À CONFIGURER : renseigner SUPABASE_URL et SUPABASE_ANON_KEY ci-dessous
// pour activer le loader. Tant que ces valeurs contiennent 'REPLACE-ME',
// le site continue en mode statique 100 % data.jsx.
// =====================================================================

(function() {
  const SUPABASE_URL      = 'https://divcmjwqgsdkdsdrjwbg.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_TzKuydg2b8QXUJSztNiW9A_NVAY6pD7';

  const configured = !SUPABASE_URL.includes('REPLACE-ME') && SUPABASE_ANON_KEY !== 'REPLACE-ME';
  window.__ACT_DB_CONFIGURED__ = configured;

  if (!configured) {
    // Mode statique : rien à faire, data.jsx pilote.
    return;
  }

  // Injecter dynamiquement le client Supabase (UMD) si pas déjà chargé.
  const ensureSupabaseClient = () => new Promise((resolve, reject) => {
    if (window.supabase?.createClient) return resolve();
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });

  // Convertit les colonnes _fr/_en/_it/_de en un objet i18n consommable
  // par le site : { title: 'FR', title_en: 'EN', title_it: 'IT', title_de: 'DE' }
  // Pour compatibilité avec richT() du contexte i18n existant.
  function normalize(row, base) {
    const out = { ...row };
    // rien à faire pour l'instant, les composants du site liront _fr/_en...
    return out;
  }

  async function fetchTable(sb, table) {
    const { data, error } = await sb.from(table).select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  }

  window.actLoadFromSupabase = async function() {
    try {
      await ensureSupabaseClient();
      const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false }
      });

      // On charge en parallèle. Les erreurs par table ne bloquent pas
      // le reste : chaque promesse échoue silencieusement en gardant
      // le fallback data.jsx.
      const results = await Promise.allSettled([
        fetchTable(sb, 'circuits'),
        fetchTable(sb, 'excursions'),
        fetchTable(sb, 'ateliers'),
        fetchTable(sb, 'blog_posts'),
        fetchTable(sb, 'testimonials'),
        fetchTable(sb, 'team_members'),
        fetchTable(sb, 'partners'),
        fetchTable(sb, 'faq_items'),
        sb.from('site_settings').select('*').then(r => r.data || [])
      ]);

      const [c, e, a, b, t, tm, p, f, s] = results.map(r => r.status === 'fulfilled' ? r.value : null);

      // Exposer sous des noms distincts. data.jsx définit CIRCUITS, EXCURSIONS...
      // On expose CIRCUITS_DB etc. Les composants publics vont progressivement
      // s'adapter pour préférer *_DB quand présent. Compatibilité assurée.
      if (c)  window.CIRCUITS_DB     = c;
      if (e)  window.EXCURSIONS_DB   = e;
      if (a)  window.ATELIERS_DB     = a;
      if (b)  window.BLOG_DB         = b;
      if (t)  window.TESTIMONIALS_DB = t;
      if (tm) window.TEAM_DB         = tm;
      if (p)  window.PARTNERS_DB     = p;
      if (f)  window.FAQ_DB          = f;
      if (s)  window.SETTINGS_DB     = Object.fromEntries(s.map(r => [r.key, r]));

      window.__ACT_DB_LOADED__ = true;
      window.dispatchEvent(new CustomEvent('act-db-loaded'));
      // Log discret pour debug
      if (window.console) console.log('[ACT] Supabase chargé', {
        circuits: c?.length, excursions: e?.length, ateliers: a?.length,
        blog: b?.length, testimonials: t?.length
      });
    } catch (err) {
      window.__ACT_DB_ERROR__ = err;
      if (window.console) console.warn('[ACT] Supabase indisponible, fallback statique :', err.message);
    }
  };

  // -------------------------------------------------------------------
  // actSaveContactRequest(payload)
  //
  // Enregistre une demande de contact/devis/custom dans la table
  // contact_requests. Fonctionne sans authentification (policy RLS
  // "contact_insert" autorise INSERT au rôle anon).
  //
  // Retourne { ok: true } si sauvegardé, { skipped: true } si Supabase
  // n'est pas configuré, ou { error: msg } en cas d'échec (auquel cas
  // le formulaire continue son flow mailto/formspree existant).
  // -------------------------------------------------------------------
  window.actSaveContactRequest = async function(payload) {
    if (!configured) return { skipped: true };
    try {
      await ensureSupabaseClient();
      const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false }
      });
      const { error } = await sb.from('contact_requests').insert(payload);
      if (error) throw error;
      if (window.console) console.log('[ACT] Demande enregistrée en base');
      // Notification email (fire-and-forget) via l'Edge Function Resend.
      // NB : le slug réel de la fonction déployée chez ACT est 'hyper-task'
      // (auto-généré par Supabase). Changer ici si la fonction est recréée
      // sous un autre nom.
      const NOTIFY_FN = 'hyper-task';
      try {
        sb.functions.invoke(NOTIFY_FN, { body: payload })
          .catch(() => { /* fonction indisponible : demande déjà en base */ });
      } catch (_) { /* pas de .functions : on ignore */ }
      return { ok: true };
    } catch (e) {
      if (window.console) console.warn('[ACT] Sauvegarde demande impossible:', e.message);
      return { error: e.message };
    }
  };

  // -------------------------------------------------------------------
  // actSubscribeNewsletter(payload)
  //
  // Ajoute un abonné à la newsletter (table newsletter_subscribers).
  // Policy RLS "newsletter_insert" autorise INSERT au rôle anon.
  // Détecte les doublons (contrainte UNIQUE sur email) et remonte
  // l'info via le champ error du retour.
  // -------------------------------------------------------------------
  // Double opt-in : on ne fait plus d'INSERT direct. On délègue à l'Edge
  // Function (service role) qui insère en confirmed=false ET envoie l'email
  // de confirmation. Le token n'est jamais exposé au navigateur.
  window.actSubscribeNewsletter = async function(payload) {
    if (!configured) return { skipped: true };
    try {
      await ensureSupabaseClient();
      const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false }
      });
      const { data, error } = await sb.functions.invoke('hyper-task', {
        body: { action: 'newsletter_subscribe', ...payload }
      });
      if (error) throw error;
      if (data && data.error) return { error: data.error };
      if (data && data.already) return { ok: true, already: true };
      return { ok: true, pending: true };  // email de confirmation envoyé
    } catch (e) {
      if (window.console) console.warn('[ACT] Abonnement newsletter impossible:', e.message);
      return { error: e.message };
    }
  };

  // Confirme un abonnement via le token reçu par email.
  window.actConfirmNewsletter = async function(token) {
    if (!configured) return { skipped: true };
    try {
      await ensureSupabaseClient();
      const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false }
      });
      const { data, error } = await sb.functions.invoke('hyper-task', {
        body: { action: 'newsletter_confirm', token }
      });
      if (error) throw error;
      return data || {};
    } catch (e) {
      return { error: e.message };
    }
  };

  // -------------------------------------------------------------------
  // Confirmation newsletter : si l'URL contient ?confirm_newsletter=<token>
  // (lien reçu par email), on valide le token et on affiche une bannière.
  // -------------------------------------------------------------------
  const NL_BANNER = {
    ok:      { fr: "Merci ! Votre inscription à la newsletter est confirmée.", en: "Thank you! Your newsletter subscription is confirmed.", it: "Grazie! La tua iscrizione alla newsletter è confermata.", de: "Danke! Ihr Newsletter-Abonnement ist bestätigt." },
    already: { fr: "Votre inscription était déjà confirmée.", en: "Your subscription was already confirmed.", it: "La tua iscrizione era già confermata.", de: "Ihr Abonnement war bereits bestätigt." },
    invalid: { fr: "Lien de confirmation invalide ou expiré.", en: "Invalid or expired confirmation link.", it: "Link di conferma non valido o scaduto.", de: "Ungültiger oder abgelaufener Bestätigungslink." },
  };

  const detectLang = () => {
    try {
      const ls = localStorage.getItem('act_lang') || localStorage.getItem('lang') || localStorage.getItem('ACT_LANG');
      const cand = (ls || document.documentElement.lang || navigator.language || 'fr').slice(0, 2).toLowerCase();
      return ['fr', 'en', 'it', 'de'].includes(cand) ? cand : 'fr';
    } catch { return 'fr'; }
  };

  const showNlBanner = (kind) => {
    const lang = detectLang();
    const msg = (NL_BANNER[kind] || NL_BANNER.invalid)[lang] || (NL_BANNER[kind] || NL_BANNER.invalid).fr;
    const ok = kind !== 'invalid';
    const el = document.createElement('div');
    el.setAttribute('role', 'status');
    el.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:9999;max-width:92%;'
      + 'background:' + (ok ? '#1F5E5A' : '#8B3A24') + ';color:#FBF7F0;padding:12px 18px;border-radius:14px;'
      + 'font:500 14px system-ui,sans-serif;box-shadow:0 12px 30px -12px rgba(0,0,0,.5);display:flex;gap:12px;align-items:center';
    el.textContent = msg;
    const x = document.createElement('button');
    x.textContent = '✕';
    x.setAttribute('aria-label', 'Fermer');
    x.style.cssText = 'background:none;border:none;color:inherit;cursor:pointer;font-size:15px;opacity:.8';
    x.onclick = () => el.remove();
    el.appendChild(x);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 8000);
  };

  const handleNewsletterConfirm = async () => {
    let token = null;
    try { token = new URLSearchParams(window.location.search).get('confirm_newsletter'); } catch { /* ignore */ }
    if (!token) return;
    // Nettoie l'URL immédiatement (évite un re-déclenchement au reload / partage).
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('confirm_newsletter');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    } catch { /* ignore */ }
    const res = await window.actConfirmNewsletter(token);
    if (res && res.confirmed) showNlBanner('ok');
    else if (res && res.already) showNlBanner('already');
    else showNlBanner('invalid');
  };

  // Auto-lancement au load (les composants React sont déjà en train
  // de monter avec les données statiques ; le loader écrasera après).
  const boot = () => { window.actLoadFromSupabase(); handleNewsletterConfirm(); };
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }
})();

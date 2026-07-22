import React from 'react';
import { SITE } from './shared.jsx';

// =====================================================================
// src/integrations.jsx — Modules Phase 3 « activables » côté public
//
// Chaque module lit sa configuration dans les Réglages du site
// (table site_settings, exposée par supabase-public.jsx dans
// window.SETTINGS_DB). Tant que la clé/identifiant est vide, le module
// reste INVISIBLE (dormant). L'agence l'active depuis le tableau de bord
// → Réglages → Intégrations, sans redéploiement.
//
//   • integrations.crisp_id            → chat en direct Crisp
//   • integrations.google_reviews_url  → section Avis Google (défaut : fiche SITE.maps)
//   • integrations.openweather_key     → météo des destinations (OpenWeather)
//
// + Parrainage simple : capture d'un code ?ref= dans l'URL, rattaché
//   automatiquement à toute demande envoyée (voir supabase-public.jsx).
// =====================================================================

// ---- Lecture d'un réglage (colonne FR) depuis la surcouche BDD ----
export function getIntegration(key) {
  try { return (window.SETTINGS_DB?.[key]?.value_fr || '').trim(); }
  catch { return ''; }
}

// Hook : relit la valeur quand la BDD publique finit de charger.
export function useIntegration(key) {
  const [v, setV] = React.useState(getIntegration(key));
  React.useEffect(() => {
    const cb = () => setV(getIntegration(key));
    cb();
    window.addEventListener('act-db-loaded', cb);
    return () => window.removeEventListener('act-db-loaded', cb);
  }, [key]);
  return v;
}

function detectLang() {
  try {
    const ls = localStorage.getItem('act_lang') || localStorage.getItem('lang');
    const cand = (ls || document.documentElement.lang || navigator.language || 'fr').slice(0, 2).toLowerCase();
    return ['fr', 'en', 'it', 'de'].includes(cand) ? cand : 'fr';
  } catch { return 'fr'; }
}

const TXT = {
  reviewsTitle: { fr: 'Vos avis sur Google', en: 'Our Google reviews', it: 'Le nostre recensioni Google', de: 'Unsere Google-Bewertungen' },
  reviewsSub:   { fr: 'Votre retour aide d\'autres voyageurs à nous découvrir.', en: 'Your feedback helps other travellers discover us.', it: 'Il tuo parere aiuta altri viaggiatori a scoprirci.', de: 'Ihre Meinung hilft anderen Reisenden, uns zu entdecken.' },
  reviewsSee:   { fr: 'Voir les avis', en: 'See reviews', it: 'Vedi le recensioni', de: 'Bewertungen ansehen' },
  reviewsWrite: { fr: 'Laisser un avis', en: 'Leave a review', it: 'Lascia una recensione', de: 'Bewertung abgeben' },
  weatherLabel: { fr: 'Météo à Dakar', en: 'Weather in Dakar', it: 'Meteo a Dakar', de: 'Wetter in Dakar' },
  refTitle:  { fr: 'Parrainez vos proches', en: 'Refer your friends', it: 'Invita i tuoi amici', de: 'Empfehlen Sie uns weiter' },
  refSub:    { fr: 'Partagez votre lien : quand un proche nous contacte via celui-ci, nous le savons — et nous vous en remercions.', en: 'Share your link: when a friend contacts us through it, we know — and we thank you for it.', it: 'Condividi il tuo link: quando un amico ci contatta tramite esso, lo sappiamo — e ti ringraziamo.', de: 'Teilen Sie Ihren Link: Wenn eine Bekannte uns darüber kontaktiert, wissen wir es — und danken Ihnen dafür.' },
  refCopy:   { fr: 'Copier le lien', en: 'Copy link', it: 'Copia link', de: 'Link kopieren' },
  refCopied: { fr: 'Lien copié !', en: 'Link copied!', it: 'Link copiato!', de: 'Link kopiert!' },
  refWa:     { fr: 'Partager sur WhatsApp', en: 'Share on WhatsApp', it: 'Condividi su WhatsApp', de: 'Auf WhatsApp teilen' },
  refMsg:    { fr: 'Je vous recommande Africa Connection Tours pour découvrir le Sénégal :', en: 'I recommend Africa Connection Tours to discover Senegal:', it: 'Vi consiglio Africa Connection Tours per scoprire il Senegal:', de: 'Ich empfehle Africa Connection Tours, um den Senegal zu entdecken:' },
};
const tr = (k) => (TXT[k]?.[detectLang()] || TXT[k]?.fr || '');

// =====================================================================
// 1. Chat en direct Crisp — injection de script (dormant sans identifiant)
// =====================================================================
function loadCrisp(id) {
  if (!id || window.$crisp || window.CRISP_WEBSITE_ID) return;
  window.$crisp = [];
  window.CRISP_WEBSITE_ID = id;
  const s = document.createElement('script');
  s.src = 'https://client.crisp.chat/l.js';
  s.async = true;
  document.head.appendChild(s);
}
function initCrisp() {
  const id = getIntegration('integrations.crisp_id');
  if (id) loadCrisp(id);
}

// =====================================================================
// 2. Parrainage simple — capture d'un code ?ref= dans l'URL
// =====================================================================
function captureReferral() {
  try {
    const code = new URLSearchParams(window.location.search).get('ref');
    if (code) {
      localStorage.setItem('act_ref', code.slice(0, 120));
      // Nettoie l'URL (évite de re-propager le code au partage).
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
  } catch { /* ignore */ }
}
if (typeof window !== 'undefined') {
  window.actGetReferral = function () {
    try { return localStorage.getItem('act_ref') || null; } catch { return null; }
  };
}

// Boot : capture le parrainage + tente d'activer Crisp (maintenant et à la
// fin du chargement des réglages depuis la BDD).
if (typeof window !== 'undefined') {
  const boot = () => { captureReferral(); initCrisp(); };
  if (document.readyState === 'complete' || document.readyState === 'interactive') boot();
  else document.addEventListener('DOMContentLoaded', boot);
  window.addEventListener('act-db-loaded', initCrisp);
}

// =====================================================================
// 3. Section Avis Google — utilise la fiche déjà intégrée (SITE.maps)
// =====================================================================
export function ActGoogleReviews({ className = '' }) {
  const seeUrl = useIntegration('integrations.google_reviews_url') || SITE.maps;
  if (!seeUrl) return null;
  // Lien direct « écrire un avis » (ouvre la fenêtre d'avis Google) — via le
  // Place ID public, sans API ni clé.
  const writeUrl = SITE.googlePlaceId
    ? `https://search.google.com/local/writereview?placeid=${SITE.googlePlaceId}`
    : seeUrl;
  return (
    <div className={`rounded-3xl border border-ink/5 shadow-xl shadow-ink/5 bg-sand-50 p-6 ${className}`}>
      <div className="flex items-center gap-2 text-[13px] font-semibold text-atlantique">
        <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>★★★★★</span>
        Google
      </div>
      <div className="mt-2 font-display text-[22px] leading-tight">{tr('reviewsTitle')}</div>
      <p className="mt-1.5 text-[13.5px] text-ink-600 leading-relaxed">{tr('reviewsSub')}</p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <a
          href={writeUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-ink text-sand-50 text-[13.5px] font-semibold hover:bg-terre transition"
        >
          {tr('reviewsWrite')} →
        </a>
        <a
          href={seeUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-ink/15 text-ink-700 text-[13.5px] font-semibold hover:bg-sand-100 transition"
        >
          {tr('reviewsSee')}
        </a>
      </div>
    </div>
  );
}

// =====================================================================
// 4. Météo (dormant sans clé OpenWeather)
//    Par défaut : Dakar. Réutilisable avec d'autres coordonnées.
// =====================================================================
export function ActWeather({ lat = 14.7167, lon = -17.4677, label, className = '' }) {
  const key = useIntegration('integrations.openweather_key');
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    if (!key) return;
    let alive = true;
    const lang = detectLang();
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=${lang}&appid=${key}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (alive && d && d.main) setData(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, [key, lat, lon]);

  if (!key || !data) return null;
  const temp2 = Math.round(data.main.temp);
  return renderWeather(temp2, data, label);
}

function renderWeather(temp, data, label) {
  const desc = data.weather?.[0]?.description || '';
  const icon = data.weather?.[0]?.icon;
  return (
    <div className="rounded-3xl border border-ink/5 shadow-xl shadow-ink/5 bg-atlantique-100 p-5 flex items-center gap-4 mt-4">
      {icon && (
        <img src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt="" width={56} height={56} className="flex-shrink-0" loading="lazy"/>
      )}
      <div className="min-w-0">
        <div className="font-mono text-[10.5px] uppercase tracking-wider text-atlantique">{label || tr('weatherLabel')}</div>
        <div className="font-display text-[30px] leading-none text-ink mt-0.5">{temp}°C</div>
        {desc && <div className="text-[13px] text-ink-600 capitalize mt-0.5">{desc}</div>}
      </div>
    </div>
  );
}

// =====================================================================
// 5. Parrainage — carte de partage (espace client)
// =====================================================================
export function ReferralShare({ code, className = '' }) {
  const [copied, setCopied] = React.useState(false);
  if (!code) return null;
  const origin = (typeof location !== 'undefined' && location.origin) || 'https://act-senegal.com';
  const link = `${origin}/?ref=${encodeURIComponent(code)}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { /* clipboard indispo */ }
  };
  const waHref = `https://wa.me/?text=${encodeURIComponent(tr('refMsg') + ' ' + link)}`;
  return (
    <section className={`rounded-3xl bg-white border border-ink/10 p-6 md:p-8 ${className}`}>
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-3">— {tr('refTitle')}</div>
      <p className="text-[14px] text-ink-700 leading-relaxed mb-4 max-w-2xl">{tr('refSub')}</p>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          value={link}
          readOnly
          onFocus={e => e.target.select()}
          className="flex-1 h-11 rounded-full border border-ink/15 px-4 bg-sand-50 text-[13px] text-ink-700"
        />
        <button onClick={copy} className="h-11 px-5 rounded-full bg-ink text-sand-50 text-[13.5px] font-semibold hover:bg-terre transition whitespace-nowrap">
          {copied ? tr('refCopied') : tr('refCopy')}
        </button>
        <a href={waHref} target="_blank" rel="noreferrer" className="h-11 px-5 rounded-full border border-ink/15 text-ink-700 text-[13.5px] font-semibold hover:bg-sand-100 transition inline-flex items-center justify-center whitespace-nowrap">
          {tr('refWa')}
        </a>
      </div>
    </section>
  );
}

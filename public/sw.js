// ACT — service worker minimal.
// Stratégie : network-first pour la navigation HTML (toujours servir la
// dernière version si en ligne), cache-first pour les assets statiques
// (JSX, images, vidéo) → permet de naviguer hors-ligne sur les pages déjà
// visitées, utile en 3G/4G instable.

const VERSION = 'act-v42';
// Note de version — affichée aux utilisateurs PWA via la notification
// "nouvelle version disponible" (voir NotifyUpdate dans shared.jsx).
// Format : { fr, en, it, de }. Mise à jour à chaque nouvelle version.
const RELEASE_NOTES = {
  fr: 'Site plus rapide et plus léger : chargement optimisé, polices intégrées, meilleure fluidité.',
  en: 'Faster, lighter site: optimized loading, bundled fonts, smoother experience.',
  it: 'Sito più veloce e leggero: caricamento ottimizzato, font integrati, maggiore fluidità.',
  de: 'Schnellere, leichtere Website: optimiertes Laden, integrierte Schriften, flüssiger.',
};

// Cache séparé pour les images / vidéos / fonts, avec un plafond d'entrées.
// Sans plafond, le cache gonfle indéfiniment au fil des visites (mauvais
// pour les téléphones bas de gamme du marché sénégalais).
const MEDIA_CACHE = 'act-media-v1';
const MEDIA_MAX_ENTRIES = 80;
const MEDIA_RE = /\.(jpe?g|webp|avif|png|svg|mp4|webm|woff2?)(\?|$)/i;

// Garde au maximum MEDIA_MAX_ENTRIES dans le cache média (FIFO simple).
const trimMediaCache = async () => {
  try {
    const c = await caches.open(MEDIA_CACHE);
    const keys = await c.keys();
    if (keys.length <= MEDIA_MAX_ENTRIES) return;
    const toDelete = keys.slice(0, keys.length - MEDIA_MAX_ENTRIES);
    await Promise.all(toDelete.map(k => c.delete(k)));
  } catch {}
};

// Pré-cache uniquement le squelette critique. Depuis la migration Vite, le
// JS/CSS applicatif est content-hashé (noms imprévisibles à l'écriture) :
// on ne le pré-cache donc plus nommément. Il est mis en cache à la volée
// (cache-first sur /assets/* immuables), tout comme les photos et la vidéo.
const CORE = [
  '/',
  '/index.html',
  '/assets/logo-act.png',
  '/manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then(c => c.addAll(CORE)).catch(() => {})
  );
  // On NE skipWaiting PAS automatiquement : on attend l'accord de
  // l'utilisateur via le bouton "Actualiser" de la bannière — ça évite
  // de recharger la page pendant qu'il navigue.
});

// Communication client ↔ SW pour les updates PWA :
// - 'GET_VERSION'   → renvoie {version, notes}
// - 'SKIP_WAITING'  → active immédiatement le nouveau SW (bouton actualiser)
self.addEventListener('message', (e) => {
  if (!e.data) return;
  if (e.data.type === 'GET_VERSION') {
    e.source?.postMessage({ type: 'VERSION', version: VERSION, notes: RELEASE_NOTES });
  } else if (e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (e) => {
  // On garde le cache média entre versions (les photos ne changent pas) ;
  // seuls les caches versionnés (act-vX) obsolètes sont purgés.
  const KEEP = new Set([VERSION, MEDIA_CACHE]);
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => !KEEP.has(k)).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Cross-origin (Sentry, Supabase, Formspree, GA4) : on laisse passer
  // sans intercepter — le navigateur s'en charge. (Plus aucun CDN pour
  // React/Babel/Tailwind/polices depuis la migration Vite : tout est self-hosté.)
  if (url.origin !== self.location.origin) return;

  // Navigation HTML : network-first, fallback cache.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(VERSION).then(c => c.put(req, copy)).catch(() => {});
        return resp;
      }).catch(() => caches.match(req).then(c => c || caches.match('/index.html')))
    );
    return;
  }

  // Médias (images, vidéo, fonts) : cache séparé avec plafond d'entrées.
  // Cache-first + mise à jour réseau silencieuse au besoin.
  if (MEDIA_RE.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(resp => {
          if (resp.ok && resp.type === 'basic') {
            const copy = resp.clone();
            caches.open(MEDIA_CACHE).then(c => c.put(req, copy)).then(trimMediaCache).catch(() => {});
          }
          return resp;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Autres assets statiques (JSX, CSS, manifest…) : cache versionné.
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(resp => {
        if (resp.ok && resp.type === 'basic') {
          const copy = resp.clone();
          caches.open(VERSION).then(c => c.put(req, copy)).catch(() => {});
        }
        return resp;
      }).catch(() => cached);
    })
  );
});

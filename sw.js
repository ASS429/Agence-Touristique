// ACT — service worker minimal.
// Stratégie : network-first pour la navigation HTML (toujours servir la
// dernière version si en ligne), cache-first pour les assets statiques
// (JSX, images, vidéo) → permet de naviguer hors-ligne sur les pages déjà
// visitées, utile en 3G/4G instable.

const VERSION = 'act-v6';

// Pré-cache uniquement le squelette critique. Les photos et la vidéo
// (~20 Mo total) sont mises en cache à la volée, pas pré-téléchargées.
const CORE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/apple-touch-icon.svg',
  '/manifest.webmanifest',
  '/tweaks-panel.jsx',
  '/src/icons.jsx',
  '/src/photo.jsx',
  '/src/data.jsx',
  '/src/i18n.jsx',
  '/src/shared.jsx',
  '/src/home.jsx',
  '/src/tour.jsx',
  '/src/catalog.jsx',
  '/src/custom.jsx',
  '/src/blog.jsx',
  '/src/pages.jsx',
  '/src/tweaks.jsx',
  '/src/app.jsx',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then(c => c.addAll(CORE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Cross-origin (CDN React/Babel/Tailwind, Google Fonts, Formspree, GA4) :
  // on laisse passer sans intercepter — le navigateur s'en charge.
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

  // Assets statiques : cache-first, fallback réseau (puis mise en cache).
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

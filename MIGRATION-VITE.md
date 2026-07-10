# Phase D — Migration Vite (plan d'exécution)

> **Branche** : `phase-d-vite` (la prod `main` reste intacte jusqu'à validation).
> **But** : supprimer Babel Standalone + Tailwind CDN (perf), compiler/minifier,
> self-host des polices, préparer les vraies URLs (SEO) et une CSP stricte.
> **Principe** : migration incrémentale, testée à chaque étape. On ne merge
> sur `main` que quand tout fonctionne à l'identique visuellement.

---

## Pourquoi (rappel des gains)

| Aujourd'hui (no-build) | Après Vite |
|---|---|
| Babel compile ~18 000 lignes JSX **dans le navigateur** à chaque visite | JSX précompilé au build → 0 coût runtime |
| Tailwind CDN (JIT au runtime, ~110 Ko + FOUC) | CSS Tailwind compilé (~12-18 Ko, cacheable) |
| React `development.min` | React production, tree-shaké |
| Polices Google en runtime (RGPD ⚠️) | Polices self-hostées (fontsource) |
| Hash router (`#/…`) → 1 seule URL pour Google | Vraies URLs + prérendu (SEO) |
| CSP impossible (unsafe-eval requis par Babel) | CSP stricte possible |

FCP mobile estimé ~2,5 s → < 1 s. Bundle initial ÷ ~4.

---

## Architecture cible

- **2 entrées** : `index.html` (public) + `admin/index.html` (admin). Vite gère
  le multi-page nativement (`build.rollupOptions.input`).
- **Modules ES** : chaque `.jsx` `export`e ses symboles, `import`e ses dépendances.
  Fin du pattern `window.X = X` (sauf rares cas d'interop, ex. `window.pickLang`
  appelé depuis du HTML inline — à convertir).
- **Tailwind** compilé via PostCSS. `tailwind.config.js` unique (fusion des 2
  configs actuelles public/admin, cf. §tokens).
- **Assets** : `images_du_senegal/`, `assets/`, `vidéo/` servis depuis `public/`
  (copie inchangée) pour préserver les URLs (et le cache du service worker).

---

## Étapes (ordre d'exécution)

### 0. Fondations (FAIT sur la branche)
- [x] `package.json` (Vite, React, Tailwind, fontsource)
- [x] Ce plan
- [ ] `vite.config.js` (multi-page)
- [ ] `tailwind.config.js` + `postcss.config.js` (tokens fusionnés)
- [ ] `src/styles.css` (directives Tailwind + le CSS inline actuel de index.html)
- [ ] `.nvmrc` (Node 20)

### 1. Convertir les fichiers "feuilles" (sans dépendances internes)
Ordre par dépendances croissantes. Pour chaque fichier : retirer `window.X = …`,
ajouter `export`, ajouter les `import` nécessaires (React, et les symboles utilisés).
- [ ] `src/icons.jsx` (Icons) — feuille
- [ ] `src/data.jsx` (CIRCUITS, SITE… ) — dépend de IMG (interne)
- [ ] `src/i18n.jsx` (I18nProvider, useI18n, DICT, useRouter) — feuille React
- [ ] `src/photo.jsx`, `src/content.jsx`

### 2. Convertir les composants partagés
- [ ] `src/shared.jsx` (Header, Footer, Btn, SITE-dépendances, NewsletterForm…)
- [ ] `src/map.jsx`, `src/departures-widget.jsx`

### 3. Convertir les pages publiques
- [ ] home, tour, catalog, excursions, croisieres, ateliers, custom, blog,
  carnet, monespace, mice, pages, app
- [ ] `src/tweaks.jsx` (garder dev-only)

### 4. Convertir l'admin (21 fichiers)
- [ ] `src/admin/*` — même logique. `admin/index.html` comme 2e entrée.

### 5. Router en vraies URLs (SEO)
- [ ] Remplacer le hash router (`parseHash`) par l'History API (`/circuits`,
  `/tour/:slug`, …). Rewrite Render `/* → /index.html`.
- [ ] Redirections 301 des anciennes URLs hash (`#/tour/x` → `/circuits/x`) via
  un petit script au boot (préserver les liens WhatsApp partagés).

### 6. Prérendu statique (SSG léger)
- [ ] `scripts/prerender.mjs` : Puppeteer alimenté par Supabase → génère un HTML
  complet par circuit/excursion/atelier/article publié. Chaque page = HTML
  indexable + meta/OG/JSON-LD propres.
- [ ] `sitemap.xml` généré au build depuis Supabase.

### 7. Polices + CSP + headers
- [ ] Self-host via `@fontsource/*` (import dans styles.css).
- [ ] CSP stricte (plus de unsafe-eval). Mettre à jour les en-têtes Render.

### 8. Déploiement Render
- [ ] Passer le service de "static (racine)" à **build** : `npm run build` →
  publie `dist/`. Ajouter la commande de build + `staticPublishPath: dist`.
- [ ] Vérifier le service worker (chemins d'assets hashés → adopter Workbox
  ou ajuster le precache). **Point de vigilance fort** : ne pas casser la PWA.

### 9. Recette + merge
- [ ] Tester les 4 langues, toutes les pages, l'admin, les formulaires (Resend),
  le CMS live, la PWA, Lighthouse (cible ≥ 90 mobile).
- [ ] Merge `phase-d-vite` → `main` seulement si tout est vert.

---

## Points de vigilance (pièges connus)

1. **Interop `window.*`** : certains helpers sont appelés depuis du HTML inline
   ou entre fichiers via `window` (`window.pickLang`, `window.actSaveContactRequest`,
   `window.useContentVersion`, `window.SITE`, loaders Supabase). Les recenser et
   soit les importer proprement, soit les ré-exposer sur `window` en interop.
2. **Service worker + assets hashés** : les noms de fichiers changent (hash).
   Le precache actuel liste des chemins fixes `/src/*.jsx` qui n'existeront plus.
   → régénérer le manifest de precache au build (Workbox `vite-plugin-pwa`).
3. **Ordre de chargement** : le pattern actuel dépend de l'ordre des `<script>`.
   Les modules ES résolvent les dépendances → l'ordre n'existe plus, ce qui peut
   révéler des dépendances circulaires (i18n ↔ shared ↔ data). À traiter au cas
   par cas.
4. **`IMG()` et chemins d'images** : garder `images_du_senegal/` tel quel dans
   `public/` pour ne pas casser les URLs ni le cache SW.
5. **Supabase loaders** : `supabase-public.jsx` + `content.jsx` s'appuient sur des
   globaux (`window.CIRCUITS`, `window.DICT`). En modules, passer par des imports
   ou un petit store. **C'est le point le plus délicat** (le CMS live en dépend).
6. **Admin séparé** : l'admin partage des composants ? Vérifier. Sinon, 2 bundles
   indépendants.

---

## Alternative "moindre risque" (si le full-ES s'avère trop long)

Étape intermédiaire possible : **précompiler le JSX hors-ligne** (Babel au build)
+ **compiler Tailwind hors-ligne**, en gardant l'architecture window-globals et
les `<script>` en ordre. On supprime ainsi les 2 coûts runtime majeurs (Babel +
Tailwind CDN) SANS réécrire les 44 fichiers en modules. Gain perf ~80 % de la
Phase D, risque bien moindre. Les vraies URLs (SEO) resteraient alors à part.
→ À considérer si le temps manque pour le full-Vite.

---

*Plan maintenu sur la branche `phase-d-vite`.*

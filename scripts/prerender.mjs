// =====================================================================
// scripts/prerender.mjs — prérendu statique des routes publiques + sitemap
//
// Depuis la migration History API (vraies URLs), chaque route publique est
// indexable individuellement. Ce script :
//   1. construit la liste des routes (statiques + fiches circuits/excursions
//      + articles de blog, extraites de src/data.jsx) ;
//   2. écrit dist/sitemap.xml complet ;
//   3. rend chaque route dans Chromium (puppeteer) et écrit le snapshot HTML
//      dans dist/<route>/index.html — les crawlers reçoivent le contenu
//      complet (titre, meta, JSON-LD, texte) sans exécuter le JS. React
//      re-rend par-dessus au chargement côté visiteur (SPA inchangée).
//
// Lancé par : `npm run prerender` (après `npm run build`).
//   - Render : buildCommand = npm ci && npm run build && npm run prerender
//   - CI     : étape dédiée après le build
// Non-fatal sur Render (RENDER=true) : un échec de prérendu ne bloque pas
// le déploiement (le fallback SPA reste fonctionnel) ; en CI il fait
// échouer le job pour attraper les régressions avant la prod.
// =====================================================================
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';

const PORT = 4174;                       // ≠ 4173 pour ne pas gêner smoke/preview
const BASE = `http://localhost:${PORT}`;
const DIST = 'dist';
const SITE = 'https://act-senegal.com';

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// --- 1. Liste des routes ---------------------------------------------
// Les ids sont extraits de src/data.jsx par bornes de tableaux (le fichier
// est du JSX, non importable directement sous Node).
const dataSrc = readFileSync('src/data.jsx', 'utf8');
const between = (a, b) => {
  const i = dataSrc.indexOf(`const ${a} = [`);
  const j = b ? dataSrc.indexOf(`const ${b} = [`) : dataSrc.length;
  if (i === -1 || j === -1) throw new Error(`Bornes introuvables dans data.jsx : ${a} → ${b}`);
  return dataSrc.slice(i, j);
};
const idsIn = (s) => [...s.matchAll(/\{ id:'([a-z0-9-]+)'/g)].map(m => m[1]);

const circuits   = idsIn(between('CIRCUITS', 'EXCURSIONS'));
const excursions = idsIn(between('EXCURSIONS', 'ATELIERS')); // même fiche /tour/:id
const blogs      = idsIn(between('BLOG', 'BLOG_CATEGORIES'));

const SECTIONS = ['circuits','excursions','ateliers','croisieres','custom',
                  'blog','faq','contact','about','mice','mentions','privacy','cgv'];
const ROUTES = [
  '/',
  ...SECTIONS.map(s => '/' + s),
  ...[...circuits, ...excursions].map(id => '/tour/' + id),
  ...blogs.map(id => '/blog/' + id),
];

// --- 2. Sitemap --------------------------------------------------------
// URLs canoniques AVEC slash final : c'est la seule forme pour laquelle
// Render sert le HTML prérendu (sans slash, le rewrite SPA sert le shell).
const today = new Date().toISOString().slice(0, 10);
const prio = (r) =>
  r === '/'                    ? '1.0' :
  /^\/(tour|blog)\//.test(r)   ? '0.7' :
  /mentions|privacy|cgv/.test(r) ? '0.3' : '0.8';
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(r => `  <url>
    <loc>${SITE}${r === '/' ? '/' : r + '/'}</loc>
    <lastmod>${today}</lastmod>
    <priority>${prio(r)}</priority>
  </url>`).join('\n')}
</urlset>
`;
writeFileSync(join(DIST, 'sitemap.xml'), sitemap);
console.log(`🗺️  sitemap.xml écrit (${ROUTES.length} URLs).`);

// --- 3. Prérendu -------------------------------------------------------
let puppeteer = null;
try { puppeteer = (await import('puppeteer')).default; } catch { /* absent */ }
if (!puppeteer) {
  console.warn('⚠️  puppeteer indisponible — prérendu sauté (sitemap écrit, fallback SPA).');
  process.exit(0);
}

async function main() {
  const preview = spawn('npm', ['run', 'preview', '--', '--port', String(PORT), '--strictPort'],
                        { shell: true, stdio: 'ignore' });
  await wait(6000);

  // Locale forcée fr-FR : le Chrome des machines CI/Render est en-US, ce qui
  // faisait basculer la détection i18n (navigator.language) en anglais et
  // produisait des snapshots EN alors que le <head> statique déclare lang=fr.
  // Même logique que le fix Lighthouse CI (Chrome LHCI forcé fr-FR).
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-gpu', '--lang=fr-FR'] });
  let failures = 0;
  const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY) || 4;

  const renderOne = async (route) => {
    const page = await browser.newPage();
    try {
      // Verrouille la langue AVANT tout script de la page : navigator.language
      // (détection i18n) + act_lang en localStorage (court-circuite la détection).
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'language',  { get: () => 'fr-FR' });
        Object.defineProperty(navigator, 'languages', { get: () => ['fr-FR', 'fr'] });
        try { localStorage.setItem('act_lang', 'FR'); } catch {}
      });
      await page.setExtraHTTPHeaders({ 'Accept-Language': 'fr-FR,fr;q=0.9' });
      // Pas de services externes dans les snapshots : Turnstile (widget avec
      // état), Sentry, GA — le HTML capturé doit rester neutre et stable.
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (/challenges\.cloudflare\.com|sentry|googletagmanager|google-analytics/.test(req.url())) req.abort().catch(() => {});
        else req.continue().catch(() => {});
      });
      await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 45000 });
      // Contenu réellement rendu (pas seulement le spinner d'amorçage)
      await page.waitForFunction(
        () => (document.querySelector('#main-content')?.innerText || '').length > 200,
        { timeout: 15000 }
      );
      const html = await page.content();
      const doc = '<!doctype html>\n' + html.replace(/^<!doctype html>\s*/i, '');
      const out = route === '/' ? join(DIST, 'index.html') : join(DIST, route.slice(1), 'index.html');
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, doc);
      // Copie plate <route>.html : Render ne résout pas <route>/index.html
      // pour une URL SANS slash final (le rewrite SPA passe avant) — mais il
      // sert <route>.html pour /route. Les deux formes sont donc couvertes.
      if (route !== '/') writeFileSync(join(DIST, route.slice(1) + '.html'), doc);
      console.log(`✅ ${route}`);
    } catch (e) {
      failures++;
      console.log(`❌ ${route} (${String(e.message).slice(0, 90)})`);
    } finally {
      await page.close().catch(() => {});
    }
  };

  for (let i = 0; i < ROUTES.length; i += CONCURRENCY) {
    await Promise.all(ROUTES.slice(i, i + CONCURRENCY).map(renderOne));
  }

  await browser.close().catch(() => {});
  preview.kill();
  if (process.platform === 'win32' && preview.pid) {
    try { execFileSync('taskkill', ['/PID', String(preview.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
  }

  console.log(failures
    ? `\n❌ ${failures}/${ROUTES.length} route(s) en échec.`
    : `\n✅ ${ROUTES.length} pages prérendues.`);
  // Render : ne bloque pas le déploiement (SPA fallback OK) ; CI : échoue.
  process.exit(failures && !process.env.RENDER ? 1 : 0);
}

main();

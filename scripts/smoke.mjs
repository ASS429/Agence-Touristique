// =====================================================================
// scripts/smoke.mjs — smoke-test des routes publiques + admin
//
// Vérifie que chaque route RE-REND réellement (contenu présent dans le DOM,
// pas seulement le spinner d'amorçage). Attrape les erreurs runtime du type
// « composant utilisé sans import » (ex. le bug FilterGroup sur /#/excursions)
// que le build Rollup ne détecte pas.
//
// Prérequis : un build à jour (`npm run build`). Le script lance lui-même
// `vite preview`, pilote Chrome en headless, puis nettoie.
//
// Usage : npm run smoke
// =====================================================================
import { spawn, execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;

// Routes publiques (#/...) + marqueur attendu dans le DOM rendu.
const ROUTES = [
  ['/', 'Africa Connection'],
  ['/#/circuits', 'Circuits'],
  ['/#/excursions', 'Excursion'],
  ['/#/ateliers', 'Atelier'],
  ['/#/croisieres', 'Croisi'],
  ['/#/blog', 'Blog'],
  ['/#/faq', 'question'],
  ['/#/contact', 'Contact'],
  ['/#/about', 'propos'],
  ['/#/custom', 'sur-mesure'],
  ['/#/mice', 'MICE'],
  ['/#/tour/grand-tour-7j', 'jour'],
  ['/#/blog/wave-om', 'Wave'],
  ['/admin/', 'Se connecter'],
];

function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
  ];
  return candidates.find(p => existsSync(p));
}

function dumpDom(chrome, url) {
  return execFileSync(chrome, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--virtual-time-budget=9000', '--dump-dom', url,
  ], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const chrome = findChrome();
  if (!chrome) {
    console.error('❌ Chrome/Edge introuvable. Définir CHROME_PATH.');
    process.exit(2);
  }

  const preview = spawn('npm', ['run', 'preview'], { shell: true, stdio: 'ignore' });
  // Laisse le serveur démarrer.
  await wait(6000);

  let failures = 0;
  for (const [route, marker] of ROUTES) {
    try {
      const dom = dumpDom(chrome, BASE + route);
      const ok = dom.length > 3000 && dom.toLowerCase().includes(marker.toLowerCase());
      console.log(`${ok ? '✅' : '❌'} ${route.padEnd(26)} (${dom.length} o${ok ? '' : `, marqueur « ${marker} » absent`})`);
      if (!ok) failures++;
    } catch (e) {
      console.log(`❌ ${route.padEnd(26)} (erreur : ${e.message.slice(0, 80)})`);
      failures++;
    }
  }

  preview.kill();
  // Tue l'arbre de process preview (Windows).
  if (process.platform === 'win32' && preview.pid) {
    try { execFileSync('taskkill', ['/PID', String(preview.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* déjà mort */ }
  }

  console.log(failures ? `\n❌ ${failures} route(s) en échec.` : `\n✅ Toutes les routes rendent correctement.`);
  process.exit(failures ? 1 : 0);
}

main();

// =====================================================================
// scripts/gen-srcset.mjs — variantes responsives des photos (sharp)
//
// Pour chaque image source de public/images_du_senegal (jpg/jpeg/webp),
// génère des variantes WebP aux largeurs 400/800/1200 px (jamais
// d'upscale) nommées <base>-w<largeur>.webp À CÔTÉ de la source, et
// écrit src/images-manifest.json : { "<base relatif>": { w, sizes } }.
//
// Le composant Photo (src/photo.jsx) importe ce manifest et n'émet un
// srcset QUE pour les variantes réellement générées → zéro 404 possible.
//
// Les variantes sont COMMITÉES (pas de sharp au build Render, pas de
// divergence dev/prod). À relancer après tout ajout/remplacement de
// photo : `npm run images` (idempotent — ne régénère que le périmé).
// =====================================================================
import sharp from 'sharp';
import { readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'public';
const DIR = join(ROOT, 'images_du_senegal');
const WIDTHS = [400, 800, 1200];
const QUALITY = 78;

// Toutes les images sources (les variantes -wNNN.webp déjà générées sont exclues)
const files = readdirSync(DIR, { recursive: true })
  .map(f => join(DIR, String(f)))
  .filter(f => /\.(jpe?g|webp|png)$/i.test(f) && !/-w\d+\.webp$/i.test(f))
  .filter(f => statSync(f).isFile());

// Regroupe par base (sans extension) : si 02.jpg ET 02.webp existent,
// la source retenue est le .jpg (le .webp du site est déjà compressé).
const byBase = new Map();
for (const f of files) {
  const base = f.replace(/\.(jpe?g|webp|png)$/i, '');
  const prev = byBase.get(base);
  if (!prev || /\.jpe?g$/i.test(f)) byBase.set(base, f);
}

const manifest = {};
let generated = 0, skipped = 0;

for (const [base, srcFile] of [...byBase.entries()].sort()) {
  const meta = await sharp(srcFile).metadata();
  if (!meta.width) continue;
  const sizes = WIDTHS.filter(w => w < meta.width);
  const relBase = relative(ROOT, base).replaceAll('\\', '/');
  manifest[relBase] = { w: meta.width, sizes };
  for (const w of sizes) {
    const out = `${base}-w${w}.webp`;
    if (existsSync(out) && statSync(out).mtimeMs >= statSync(srcFile).mtimeMs) { skipped++; continue; }
    await sharp(srcFile).resize(w).webp({ quality: QUALITY }).toFile(out);
    generated++;
  }
}

writeFileSync('src/images-manifest.json', JSON.stringify(manifest, null, 1) + '\n');
console.log(`✅ ${Object.keys(manifest).length} images · ${generated} variantes générées · ${skipped} à jour.`);

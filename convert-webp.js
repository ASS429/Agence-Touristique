// Convertit tous les JPG du dossier images_du_sénégal/ en WebP à côté
// (même nom, extension .webp). Idempotent : ignore les WebP déjà générés.
//
// Pré-requis (une seule fois) :
//   npm install sharp
//
// Exécution :
//   node convert-webp.js
//
// Une fois les .webp générés, le composant Photo (src/photo.jsx) les sert
// automatiquement via <picture> aux navigateurs qui les supportent.
// Garde les JPG : ils restent en fallback pour les rares vieux navigateurs.

const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('\nLe module "sharp" n\'est pas installé.\nLance :  npm install sharp\n');
  process.exit(1);
}

const ROOT = path.join(__dirname, 'images_du_sénégal');
const QUALITY = 82;

const walk = (dir) => {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (/\.jpe?g$/i.test(entry.name)) out.push(p);
  }
  return out;
};

(async () => {
  if (!fs.existsSync(ROOT)) {
    console.error('Dossier introuvable :', ROOT);
    process.exit(1);
  }
  const jpgs = walk(ROOT);
  if (!jpgs.length) {
    console.log('Aucun JPG trouvé dans', ROOT);
    return;
  }
  console.log(`Trouvé ${jpgs.length} JPG, conversion → WebP (qualité ${QUALITY})...\n`);

  let totalIn = 0, totalOut = 0, converted = 0, skipped = 0;
  for (const jpg of jpgs) {
    const webp = jpg.replace(/\.jpe?g$/i, '.webp');
    const rel = path.relative(__dirname, webp);
    if (fs.existsSync(webp)) {
      console.log('SKIP   ' + rel);
      skipped++;
      continue;
    }
    try {
      const inSize = fs.statSync(jpg).size;
      await sharp(jpg).webp({ quality: QUALITY }).toFile(webp);
      const outSize = fs.statSync(webp).size;
      totalIn += inSize;
      totalOut += outSize;
      converted++;
      const ratio = ((1 - outSize / inSize) * 100).toFixed(0);
      console.log(`WROTE  ${rel.padEnd(58)} ${(outSize/1024).toFixed(0).padStart(5)} KB (-${ratio}%)`);
    } catch (e) {
      console.error('ERR    ' + rel + ' — ' + e.message);
    }
  }

  console.log('\n--- Résumé ---');
  console.log(`Convertis : ${converted}   Skipped : ${skipped}`);
  if (totalIn) {
    const saved = ((1 - totalOut / totalIn) * 100).toFixed(0);
    console.log(`Avant  : ${(totalIn/1024/1024).toFixed(1)} MB`);
    console.log(`Après  : ${(totalOut/1024/1024).toFixed(1)} MB`);
    console.log(`Gain   : -${saved}%`);
  }
})();

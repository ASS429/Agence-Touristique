// Chromium de puppeteer stocké DANS node_modules : le cache de build Render
// conserve node_modules entre deux déploiements, donc le navigateur n'est
// pas retéléchargé à chaque build (contrairement au ~/.cache par défaut).
const { join } = require('path');
module.exports = {
  cacheDirectory: join(__dirname, 'node_modules', '.puppeteer-cache'),
};

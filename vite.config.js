import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Migration Phase D — configuration multi-page (site public + admin).
// La prod actuelle (no-build) reste sur `main` ; cette config vit sur la
// branche `phase-d-vite` jusqu'à validation complète.
export default defineConfig({
  plugins: [react()],
  // Les assets volumineux (photos, vidéo) restent servis tels quels depuis
  // public/ pour préserver les URLs et le cache du service worker.
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
      },
    },
    // Noms hashés pour un cache immuable (le SW devra être régénéré au build).
    assetsInlineLimit: 4096,
  },
  server: { port: 5173, open: true },
});

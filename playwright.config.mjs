import { defineConfig, devices } from '@playwright/test';

// E2E — 4 parcours business sur le build de prod (`vite preview`).
// Prérequis : `npm run build`. Lancement : `npm run test:e2e`.
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 45000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: 'http://localhost:4175',
    viewport: { width: 1400, height: 900 }, // nav desktop (lg:flex)
    locale: 'fr-FR', // le site détecte la langue du navigateur — tests en FR
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run preview -- --port 4175 --strictPort',
    url: 'http://localhost:4175',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});

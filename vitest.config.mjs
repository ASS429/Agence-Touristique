import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Tests unitaires (helpers purs) — `npm run test`.
// jsdom : les modules du site référencent window (interop data/i18n/content).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.{js,mjs,jsx}'],
  },
});

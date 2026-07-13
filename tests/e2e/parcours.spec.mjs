// 4 parcours business E2E (Playwright, build de prod via vite preview).
// Aucun appel réseau réel : Supabase/Formspree/Sentry sont interceptés.
import { test, expect } from '@playwright/test';

// Coupe les services externes pour des tests hermétiques et rapides.
const seal = async (page) => {
  await page.route(/supabase\.co|formspree\.io|sentry|google-analytics|googletagmanager/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  );
};

test('Parcours devis : home → circuits → fiche circuit → CTA WhatsApp', async ({ page }) => {
  await seal(page);
  await page.goto('/');
  await page.click('header nav a[href="/circuits"]');
  await expect(page).toHaveURL(/\/circuits$/);
  // Le catalogue est rendu (contenu, pas seulement le shell)
  await expect(page.locator('#main-content')).toContainText(/circuit/i);
  // Les cartes naviguent par onClick(go) : navigation directe vers une fiche
  await page.goto('/tour/grand-tour-7j');
  await expect(page.locator('h1')).toContainText(/tour|nord/i);
  // CTA WhatsApp présent (conversion)
  await expect(page.locator('a[href*="wa.me"]').first()).toBeVisible();
});

test('Parcours contact : formulaire soumis → confirmation (anti-bot respecté)', async ({ page }) => {
  await seal(page);
  await page.goto('/contact');
  // Les champs n'ont pas de name/id (sauf le honeypot name="company", à NE
  // PAS remplir) : on scope au formulaire de contact (le seul avec textarea —
  // l'input email de la newsletter du footer est ainsi exclu), puis on cible
  // par type et ordre DOM (nom, email, message).
  const form = page.locator('form:has(textarea)');
  await form.locator('input[type="text"]:not([name="company"])').first().fill('Test E2E');
  await form.locator('input[type="email"]').fill('e2e@example.com');
  await form.locator('textarea').fill('Message de test automatisé.');
  // Anti-bot temporel : une soumission < 2,5 s est traitée comme un bot
  // (succès simulé sans enregistrement) — on attend au-delà du seuil.
  await page.waitForTimeout(3000);
  await form.locator('button[type="submit"]').click();
  // Confirmation : « Message envoyé. » (clé contact.form.sent.title)
  await expect(page.locator('#main-content').getByText(/message envoyé/i)).toBeVisible({ timeout: 10000 });
});

test('Parcours langue : bascule EN → la nav change', async ({ page }) => {
  await seal(page);
  await page.goto('/');
  await page.locator('header button', { hasText: /^EN$/ }).click();
  await expect(page.locator('header nav')).toContainText(/Tours|Excursions/i);
  await expect(page.locator('header nav')).not.toContainText('Ateliers');
});

test('Parcours legacy + vidéo : /#/croisieres redirigé, façade → iframe nocookie', async ({ page }) => {
  await seal(page);
  await page.goto('/#/croisieres');
  await expect(page).toHaveURL(/\/croisieres$/);
  // Façade vidéo : aucune iframe YouTube avant le clic (RGPD)
  await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
  await page.locator('button[aria-label*="vidéo" i], button[aria-label*="video" i]').first().click();
  await expect(page.locator('iframe[src*="youtube-nocookie.com"]')).toHaveCount(1);
});

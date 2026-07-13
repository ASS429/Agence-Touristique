import { describe, it, expect } from 'vitest';
import { buildWaURL, SITE } from '../../src/shared.jsx';

describe('buildWaURL — liens WhatsApp', () => {
  it('pointe vers wa.me avec le numéro ACT', () => {
    const url = buildWaURL('Bonjour ACT !');
    expect(url).toContain('wa.me/');
    expect(url).toContain(String(SITE.whatsapp));
  });
  it('encode le message', () => {
    const url = buildWaURL('devis & disponibilités ?');
    expect(url).toContain(encodeURIComponent('devis & disponibilités ?'));
  });
});

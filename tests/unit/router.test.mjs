import { describe, it, expect } from 'vitest';
import { routePath } from '../../src/i18n.jsx';

describe('routePath — chemins canoniques du routeur', () => {
  it('racine pour home', () => {
    expect(routePath('home')).toBe('/');
    expect(routePath('')).toBe('/');
    expect(routePath(undefined)).toBe('/');
  });
  it('sections simples', () => {
    expect(routePath('circuits')).toBe('/circuits');
    expect(routePath('croisieres')).toBe('/croisieres');
  });
  it('routes avec id', () => {
    expect(routePath('tour', { id: 'grand-tour-7j' })).toBe('/tour/grand-tour-7j');
    expect(routePath('blog', { id: 'wave-om' })).toBe('/blog/wave-om');
  });
});

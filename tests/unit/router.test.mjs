import { describe, it, expect } from 'vitest';
import { routePath } from '../../src/i18n.jsx';

describe('routePath — chemins canoniques du routeur', () => {
  it('racine pour home', () => {
    expect(routePath('home')).toBe('/');
    expect(routePath('')).toBe('/');
    expect(routePath(undefined)).toBe('/');
  });
  it('sections simples — avec slash final (forme servie prérendue par Render)', () => {
    expect(routePath('circuits')).toBe('/circuits/');
    expect(routePath('croisieres')).toBe('/croisieres/');
  });
  it('routes avec id — avec slash final', () => {
    expect(routePath('tour', { id: 'saint-louis-2j' })).toBe('/tour/saint-louis-2j/');
    expect(routePath('blog', { id: 'wave-om' })).toBe('/blog/wave-om/');
  });
});

import { describe, it, expect } from 'vitest';
import { parseFrDate, buildGraph } from '../../src/seo.jsx';

describe('parseFrDate — dates françaises du blog → ISO', () => {
  it('convertit les mois français', () => {
    expect(parseFrDate('12 avril 2026')).toBe('2026-04-12');
    expect(parseFrDate('1 août 2025')).toBe('2025-08-01');
    expect(parseFrDate('3 février 2026')).toBe('2026-02-03');
  });
  it('tolère les entrées invalides', () => {
    expect(parseFrDate('')).toBeUndefined();
    expect(parseFrDate('demain')).toBeUndefined();
    expect(parseFrDate(null)).toBeUndefined();
  });
});

describe('buildGraph — JSON-LD par route', () => {
  it('fiche circuit → TouristTrip + fil d\'Ariane', () => {
    const g = buildGraph('tour', {}, 'grand-tour-7j', null);
    const trip = g.find(x => x['@type'] === 'TouristTrip');
    expect(trip).toBeTruthy();
    expect(trip.url).toBe('https://act-senegal.com/tour/grand-tour-7j');
    expect(g.find(x => x['@type'] === 'BreadcrumbList')).toBeTruthy();
  });
  it('croisières → VideoObject (reportage ACT)', () => {
    const g = buildGraph('croisieres', {}, null, null);
    const video = g.find(x => x['@type'] === 'VideoObject');
    expect(video).toBeTruthy();
    expect(video.embedUrl).toContain('youtube-nocookie.com');
    expect(video.uploadDate).toBe('2025-01-27');
  });
  it('FAQ → FAQPage avec questions', () => {
    const g = buildGraph('faq', {}, null, null);
    const faq = g.find(x => x['@type'] === 'FAQPage');
    expect(faq).toBeTruthy();
    expect(faq.mainEntity.length).toBeGreaterThan(3);
  });
  it('les URLs ne contiennent plus de hash #/', () => {
    const g = buildGraph('blog', { id: 'wave-om' }, null, 'wave-om');
    expect(JSON.stringify(g)).not.toContain('/#/');
  });
});

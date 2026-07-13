import React from 'react';
import { CIRCUITS, BLOG, FAQ } from './data.jsx';

// =====================================================================
// src/seo.jsx — JSON-LD structuré par page (SEO / rich results Google)
//
// Injecte/actualise un <script type="application/ld+json" id="page-jsonld">
// dans le <head> à chaque changement de route. Vient EN PLUS du JSON-LD
// global TravelAgency d'index.html.
//   - fiche circuit → TouristTrip (+ AggregateRating)
//   - article blog  → BlogPosting
//   - page FAQ      → FAQPage (questions/réponses)
//   - toutes pages  → BreadcrumbList
// =====================================================================

const SITE_URL = 'https://act-senegal.com';

const absUrl = (p) => {
  if (!p) return undefined;
  if (/^https?:\/\//.test(p)) return p;
  return SITE_URL + '/' + String(p).replace(/^\//, '');
};

const PUBLISHER = {
  '@type': 'TravelAgency',
  name: 'Africa Connection Tours',
  url: SITE_URL,
  logo: SITE_URL + '/assets/logo-act.png',
};

// Les dates du blog sont en français ("12 avril 2026") → ISO pour datePublished.
const FR_MONTHS = { janvier: 0, 'février': 1, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5, juillet: 6, 'août': 7, aout: 7, septembre: 8, octobre: 9, novembre: 10, 'décembre': 11, decembre: 11 };
function parseFrDate(s) {
  if (!s) return undefined;
  const m = String(s).toLowerCase().match(/(\d{1,2})\s+([a-zûéôà]+)\s+(\d{4})/i);
  if (!m) return undefined;
  const mo = FR_MONTHS[m[2]];
  if (mo === undefined) return undefined;
  const d = new Date(Date.UTC(+m[3], mo, +m[1]));
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

const SECTION_LABELS = {
  circuits: 'Circuits', excursions: 'Excursions', croisieres: 'Croisières',
  ateliers: 'Ateliers', custom: 'Sur-mesure', mice: 'MICE', blog: 'Blog',
  faq: 'FAQ', about: 'À propos', contact: 'Contact',
};

function buildGraph(route, params, tourId, articleId) {
  const graph = [];
  const crumbs = [{ name: 'Accueil', item: SITE_URL + '/' }];

  if (route === 'tour') {
    const c = CIRCUITS.find(x => x.id === tourId);
    if (c) {
      graph.push({
        '@type': 'TouristTrip',
        name: c.title,
        description: c.short || c.subtitle || c.title,
        image: absUrl(c.img),
        url: `${SITE_URL}/#/tour/${c.id}`,
        provider: PUBLISHER,
        ...(c.rating && c.reviews ? {
          aggregateRating: { '@type': 'AggregateRating', ratingValue: c.rating, reviewCount: c.reviews },
        } : {}),
      });
      crumbs.push({ name: 'Circuits', item: `${SITE_URL}/#/circuits` });
      crumbs.push({ name: c.title, item: `${SITE_URL}/#/tour/${c.id}` });
    }
  } else if (route === 'blog' && params.id) {
    const b = BLOG.find(x => x.id === articleId);
    if (b) {
      const dp = parseFrDate(b.date);
      graph.push({
        '@type': 'BlogPosting',
        headline: b.title,
        description: b.excerpt,
        image: absUrl(b.img),
        url: `${SITE_URL}/#/blog/${b.id}`,
        author: { '@type': 'Person', name: b.author?.name || 'Africa Connection Tours' },
        publisher: PUBLISHER,
        ...(dp ? { datePublished: dp } : {}),
      });
      crumbs.push({ name: 'Blog', item: `${SITE_URL}/#/blog` });
      crumbs.push({ name: b.title, item: `${SITE_URL}/#/blog/${b.id}` });
    }
  } else if (route === 'faq') {
    const qas = FAQ.flatMap(g => g.items || []).slice(0, 40);
    if (qas.length) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: qas.map(x => ({
          '@type': 'Question',
          name: x.q,
          acceptedAnswer: { '@type': 'Answer', text: x.a },
        })),
      });
    }
    crumbs.push({ name: 'FAQ', item: `${SITE_URL}/#/faq` });
  } else if (route === 'croisieres') {
    // Reportage YouTube intégré sur la page (façade cliquable, voir croisieres.jsx).
    // uploadDate = date de publication réelle sur la chaîne "au senegal point com".
    graph.push({
      '@type': 'VideoObject',
      name: 'Africa Connection Tours : Vivez l\'aventure avec du Sénégal',
      description: 'Reportage consacré à Africa Connection Tours : accueil des passagers de croisière, excursions à terre et organisation des escales au Sénégal.',
      thumbnailUrl: absUrl('images_du_senegal/croisière/reportage-video-poster.jpg'),
      uploadDate: '2025-01-27',
      embedUrl: 'https://www.youtube-nocookie.com/embed/VzcGdXxk9WQ',
      contentUrl: 'https://www.youtube.com/watch?v=VzcGdXxk9WQ',
      publisher: PUBLISHER,
    });
    crumbs.push({ name: 'Croisières', item: `${SITE_URL}/#/croisieres` });
  } else if (route && SECTION_LABELS[route]) {
    crumbs.push({ name: SECTION_LABELS[route], item: `${SITE_URL}/#/${route}` });
  }

  if (crumbs.length > 1) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem', position: i + 1, name: c.name, item: c.item,
      })),
    });
  }

  return graph.map(g => ({ '@context': 'https://schema.org', ...g }));
}

function PageJsonLd({ route, params = {}, tourId, articleId }) {
  React.useEffect(() => {
    const data = buildGraph(route, params, tourId, articleId);
    let el = document.getElementById('page-jsonld');
    if (!data.length) {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = document.createElement('script');
      el.id = 'page-jsonld';
      el.type = 'application/ld+json';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data.length === 1 ? data[0] : data);
  }, [route, params.id, tourId, articleId]);
  return null;
}

if (typeof window !== 'undefined') window.PageJsonLd = PageJsonLd;
export { PageJsonLd };

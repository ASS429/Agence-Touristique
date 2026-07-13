import React from 'react';
import { CIRCUITS, BLOG, FAQ } from './data.jsx';
import { routePath } from './i18n.jsx';

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
        url: `${SITE_URL}/tour/${c.id}`,
        provider: PUBLISHER,
        ...(c.rating && c.reviews ? {
          aggregateRating: { '@type': 'AggregateRating', ratingValue: c.rating, reviewCount: c.reviews },
        } : {}),
      });
      crumbs.push({ name: 'Circuits', item: `${SITE_URL}/circuits` });
      crumbs.push({ name: c.title, item: `${SITE_URL}/tour/${c.id}` });
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
        url: `${SITE_URL}/blog/${b.id}`,
        author: { '@type': 'Person', name: b.author?.name || 'Africa Connection Tours' },
        publisher: PUBLISHER,
        ...(dp ? { datePublished: dp } : {}),
      });
      crumbs.push({ name: 'Blog', item: `${SITE_URL}/blog` });
      crumbs.push({ name: b.title, item: `${SITE_URL}/blog/${b.id}` });
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
    crumbs.push({ name: 'FAQ', item: `${SITE_URL}/faq` });
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
    crumbs.push({ name: 'Croisières', item: `${SITE_URL}/croisieres` });
  } else if (route && SECTION_LABELS[route]) {
    crumbs.push({ name: SECTION_LABELS[route], item: `${SITE_URL}/${route}` });
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

// --- Meta par page (title / description / canonical / hreflang / OG) --------
// FR = langue de référence SEO (les 4 langues partagent la même URL, le
// basculement est côté client). Le prérendu statique capture ces valeurs.
const PAGE_META = {
  home:       { title: 'Africa Connection Tours — Agence touristique Dakar depuis 1996', desc: 'Tour-opérateur basé à Dakar depuis 1996. Circuits, excursions, sur-mesure au Sénégal et en Afrique de l\'Ouest.' },
  circuits:   { title: 'Circuits au Sénégal — Africa Connection Tours', desc: 'Circuits multi-jours à travers le Sénégal : Gorée, Saloum, Casamance, Saint-Louis… conçus et opérés par ACT depuis 1996.' },
  excursions: { title: 'Excursions à Dakar et au Sénégal — Africa Connection Tours', desc: 'Excursions à la demi-journée ou journée depuis Dakar et Saly : Gorée, Lac Rose, Bandia, Saint-Louis… avec guides multilingues.' },
  croisieres: { title: 'Escales croisière au Sénégal — Africa Connection Tours', desc: 'Partenaire des compagnies de croisière en escale au Sénégal : excursions dédiées, tours pré et post croisière, assistance PMR.' },
  ateliers:   { title: 'Ateliers artisanat, musique et danse — Africa Connection Tours', desc: 'Ateliers immersifs au Sénégal : artisanat, percussions, danse — une journée avec des maîtres artisans et musiciens.' },
  custom:     { title: 'Voyage sur mesure au Sénégal — Africa Connection Tours', desc: 'Composez votre voyage sur mesure au Sénégal : durée, rythme, centres d\'intérêt — ACT conçoit et opère votre itinéraire.' },
  blog:       { title: 'Blog & guides de voyage Sénégal — Africa Connection Tours', desc: 'Conseils de terrain, guides pratiques et récits pour préparer votre voyage au Sénégal.' },
  faq:        { title: 'Questions fréquentes — Africa Connection Tours', desc: 'Visa, santé, paiement, meilleure saison : les réponses pour préparer votre voyage au Sénégal avec ACT.' },
  contact:    { title: 'Contact — Africa Connection Tours', desc: 'Contactez Africa Connection Tours à Dakar : demande de devis, renseignements circuits et excursions.' },
  about:      { title: 'À propos — Africa Connection Tours', desc: 'Trente ans d\'expérience du voyage au Sénégal : l\'histoire et l\'équipe d\'Africa Connection Tours.' },
  mice:       { title: 'MICE & tourisme d\'affaires au Sénégal — Africa Connection Tours', desc: 'Séminaires, incentives, congrès et événements d\'entreprise au Sénégal, organisés par ACT.' },
  mentions:   { title: 'Mentions légales — Africa Connection Tours', desc: 'Mentions légales du site act-senegal.com.' },
  privacy:    { title: 'Politique de confidentialité — Africa Connection Tours', desc: 'Politique de confidentialité et gestion des cookies du site act-senegal.com.' },
  cgv:        { title: 'Conditions générales de vente — Africa Connection Tours', desc: 'Conditions générales de vente d\'Africa Connection Tours.' },
};

const setMeta = (selector, attr, value) => {
  const el = document.head.querySelector(selector);
  if (el && value) el.setAttribute(attr, value);
};

function updateHead(route, params, tourId, articleId) {
  let meta = PAGE_META[route] || null;
  if (route === 'tour') {
    const c = CIRCUITS.find(x => x.id === tourId);
    if (c) meta = { title: `${c.title} — Africa Connection Tours`, desc: c.short || c.subtitle || c.title };
  } else if (route === 'blog' && params.id) {
    const b = BLOG.find(x => x.id === articleId);
    if (b) meta = { title: `${b.title} — Blog ACT`, desc: b.excerpt || b.title };
  }
  if (!meta) meta = PAGE_META.home;

  const canonical = SITE_URL + routePath(route, params);
  document.title = meta.title;
  setMeta('meta[name="description"]',        'content', meta.desc);
  setMeta('link[rel="canonical"]',           'href',    canonical);
  setMeta('meta[property="og:url"]',         'content', canonical);
  setMeta('meta[property="og:title"]',       'content', meta.title);
  setMeta('meta[property="og:description"]', 'content', meta.desc);
  setMeta('meta[name="twitter:title"]',      'content', meta.title);
  setMeta('meta[name="twitter:description"]','content', meta.desc);
  // hreflang : les 4 langues + x-default partagent l'URL de la page
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach(l => l.setAttribute('href', canonical));
  // Espace client : privé, hors index
  let robots = document.head.querySelector('meta[name="robots"]');
  if (route === 'monespace') {
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex, nofollow';
  } else if (robots) {
    robots.remove();
  }
}

function PageJsonLd({ route, params = {}, tourId, articleId }) {
  React.useEffect(() => {
    updateHead(route, params, tourId, articleId);
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
// parseFrDate/buildGraph exportés pour les tests unitaires (Vitest).
export { PageJsonLd, parseFrDate, buildGraph };

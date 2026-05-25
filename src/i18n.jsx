// I18n + currency context, plus tiny route hook.
// Loaded before everything else so all components can `useI18n()`.

const I18nContext = React.createContext(null);

const DICT = {
  FR: {
    'nav.circuits':'Circuits',
    'nav.bespoke':'Sur mesure',
    'nav.blog':'Blog',
    'nav.about':'À propos',
    'nav.contact':'Contact',
    'nav.faq':'FAQ',
    'cta.whatsapp':'WhatsApp',
    'cta.book':'Réserver sur WhatsApp',
    'cta.details':'Détails',
    'cta.quote':'Demander un devis',
    'cta.viewTours':'Voir nos circuits',
    'cta.bespoke':'Voyage sur mesure',
    'common.from':'à partir de',
    'common.perPerson':'/ pers',
    'common.day':'jour',
    'common.days':'jours',
    'common.results':'résultats',
    'common.reset':'Réinitialiser',
    'common.search':'Rechercher',
    'common.send':'Envoyer',
    'common.next':'Suivant',
    'common.prev':'Précédent',
    'common.step':'Étape',
    'common.of':'sur',
  },
  EN: {
    'nav.circuits':'Tours',
    'nav.bespoke':'Bespoke',
    'nav.blog':'Journal',
    'nav.about':'About',
    'nav.contact':'Contact',
    'nav.faq':'FAQ',
    'cta.whatsapp':'WhatsApp',
    'cta.book':'Book on WhatsApp',
    'cta.details':'Details',
    'cta.quote':'Request quote',
    'cta.viewTours':'See our tours',
    'cta.bespoke':'Tailor your trip',
    'common.from':'from',
    'common.perPerson':'/ pers',
    'common.day':'day',
    'common.days':'days',
    'common.results':'results',
    'common.reset':'Reset',
    'common.search':'Search',
    'common.send':'Send',
    'common.next':'Next',
    'common.prev':'Previous',
    'common.step':'Step',
    'common.of':'of',
  }
};

// Fixed demo conversion rates (1 EUR ≈ 655 XOF, 1 USD ≈ 600 XOF)
const RATES = { XOF: 1, EUR: 1/655, USD: 1/600 };
const CCY_SYM = { XOF: 'FCFA', EUR: '€', USD: '$' };

const I18nProvider = ({ children }) => {
  const [lang, setLang] = React.useState('FR');
  const [ccy, setCcy]   = React.useState('XOF');

  const t = React.useCallback((key) => (DICT[lang] && DICT[lang][key]) || key, [lang]);

  const formatPrice = React.useCallback((xof) => {
    if (xof == null) return '';
    const v = xof * RATES[ccy];
    if (ccy === 'XOF') {
      return Math.round(v).toLocaleString('fr-FR').replace(/\u202f/g,' ') + ' FCFA';
    }
    if (ccy === 'EUR') return Math.round(v).toLocaleString('fr-FR') + ' €';
    return '$' + Math.round(v).toLocaleString('en-US');
  }, [ccy]);

  // shorter format for compact cards: 395k FCFA / €602 / $655
  const shortPrice = React.useCallback((xof) => {
    if (xof == null) return '';
    const v = xof * RATES[ccy];
    if (ccy === 'XOF') {
      if (v >= 1000) return (Math.round(v/1000)) + 'k FCFA';
      return Math.round(v) + ' FCFA';
    }
    if (ccy === 'EUR') return Math.round(v) + ' €';
    return '$' + Math.round(v);
  }, [ccy]);

  const value = { lang, setLang, ccy, setCcy, t, formatPrice, shortPrice };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

const useI18n = () => {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error('I18nProvider missing');
  return ctx;
};

// --- Route hook -------------------------------------------------------------
// A super-simple hash router: #/circuits, #/custom, #/blog, #/blog/:id, #/tour/:id ...
// Returns { route, params, go }

const parseHash = () => {
  const h = window.location.hash.replace(/^#\/?/, '');
  if (!h) return { route:'home', params:{} };
  const parts = h.split('/').filter(Boolean);
  const route = parts[0];
  const params = {};
  if (route === 'tour'        && parts[1]) params.id = parts[1];
  if (route === 'blog'        && parts[1]) params.id = parts[1];
  return { route, params };
};

const useRouter = () => {
  const [state, setState] = React.useState(parseHash);
  React.useEffect(()=>{
    const onHash = () => setState(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const go = React.useCallback((route, params = {}, opts={}) => {
    let hash = '#/' + route;
    if (params.id) hash += '/' + params.id;
    if (hash !== window.location.hash) {
      window.location.hash = hash;
    } else {
      // force update if same route
      setState({ route, params });
    }
    if (!opts.keepScroll) window.scrollTo({ top: 0, behavior:'auto' });
  }, []);
  return { ...state, go };
};

Object.assign(window, { I18nProvider, useI18n, useRouter, RATES, CCY_SYM, DICT });

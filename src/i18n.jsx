// I18n + currency context, plus tiny route hook.
// Loaded before everything else so all components can `useI18n()`.
//
// Architecture multilingue (juin 2026) :
// - 4 langues supportées : EN (maître éditoriale), FR, IT, DE
// - Détection automatique de la langue du navigateur au premier chargement
// - Mémorisation du choix utilisateur via localStorage (`act_lang`)
// - Chaîne de repli : si une clé manque dans la langue active, on retombe sur EN
//   puis FR puis sur la clé elle-même (signal de traduction manquante en dev)
// - Toutes les chaînes de l'interface (chrome, CTAs, communs) passent par t()
// - Le contenu profond (catalogue, blogs, FAQ) restera en FR jusqu'à livraison
//   des traductions DeepL Pro + relecture native ACT (Phase 2)

const I18nContext = React.createContext(null);

const LANGS = ['EN', 'FR', 'IT', 'DE'];
const DEFAULT_LANG = 'EN';   // langue maître éditoriale (décision ACT : cible afro-américaine)
const LS_KEY = 'act_lang';

// Détection langue du navigateur au premier chargement.
// Si la langue n'est pas dans nos 4, on retombe sur EN.
const detectBrowserLang = () => {
  if (typeof navigator === 'undefined') return DEFAULT_LANG;
  const raw = (navigator.language || navigator.userLanguage || '').toUpperCase();
  if (raw.startsWith('FR')) return 'FR';
  if (raw.startsWith('IT')) return 'IT';
  if (raw.startsWith('DE')) return 'DE';
  if (raw.startsWith('EN')) return 'EN';
  return DEFAULT_LANG;
};

const readStoredLang = () => {
  try {
    const v = localStorage.getItem(LS_KEY);
    return LANGS.includes(v) ? v : null;
  } catch { return null; }
};

const writeStoredLang = (lang) => {
  try { localStorage.setItem(LS_KEY, lang); } catch {}
};

// ============================================================================
// Dictionnaire de traductions
// ============================================================================
// Convention : clés en kebab.case par namespace (nav, cta, common, footer,
// header, hero, cookies, wa). Toutes les valeurs FR sont la version source ;
// EN est la version maître éditoriale (priorité de qualité), IT et DE sont
// les versions secondaires. Si une clé manque dans IT/DE, le système retombe
// automatiquement sur EN puis FR.
const DICT = {
  EN: {
    // Navigation
    'nav.circuits':'Tours & products',
    'nav.bespoke':'Bespoke',
    'nav.blog':'Journal',
    'nav.about':'About',
    'nav.contact':'Contact',
    'nav.faq':'FAQ',
    // CTAs
    'cta.whatsapp':'WhatsApp',
    'cta.book':'Book on WhatsApp',
    'cta.details':'Details',
    'cta.quote':'Request quote',
    'cta.viewTours':'See our tours & products',
    'cta.bespoke':'Tailor your trip',
    'cta.chatWithUs':'Chat with us',
    'cta.chatOnWhatsapp':'Chat with us on WhatsApp',
    'cta.describeTrip':'Describe my trip',
    // Common
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
    'common.priceLabel':'price',
    'common.onQuote':'On request',
    'common.reviews':'reviews',
    'common.close':'Close',
    'common.menu':'Menu',
    'common.languageSwitcher':'Choose language',
    'common.currencySwitcher':'Display currency',
    // Footer
    'footer.exploreLabel':'Explore',
    'footer.agencyLabel':'Agency',
    'footer.contactLabel':'Contact',
    'footer.allTours':'All tours',
    'footer.bespokeTrip':'Bespoke trip',
    'footer.blogAdvice':'Journal & advice',
    'footer.guides':'Our guides',
    'footer.localEngagement':'Local commitment',
    'footer.legal':'Legal notice',
    'footer.cgv':'Terms & conditions',
    'footer.privacy':'Privacy policy',
    'footer.bespokeKicker':'Bespoke',
    'footer.bespokeTitle':'Not found what you were looking for?',
    'footer.bespokeTitleEm':'We tailor your trip for you.',
    'footer.bespokeNote':'Quote in 24h · no commitment',
    'footer.tagline':'Receptive tour operator based in Dakar since 1996. Tours, day trips and tailor-made journeys in Senegal and West Africa — local team, six languages, network in 6 countries.',
    'footer.openingHours':'Mon–Fri · 9am–6pm (GMT)',
    'footer.copyright':'© 2026 Africa Connection Tours',
    'footer.sinceTagline':'Tour operator since 1996',
    'footer.licenseLabel':'Travel agency license no. 006523',
    // Cookies banner
    'cookies.kicker':'Cookies',
    'cookies.title':'A few cookies to serve you better.',
    'cookies.titleEm':'serve you better',
    'cookies.body':'Anonymous audience measurement only. No advertising cookies.',
    'cookies.learnMore':'Learn more',
    'cookies.accept':'Accept',
    'cookies.decline':'Decline',
    // WhatsApp messages
    'wa.greeting':"Hello ACT! I'd love some information about your tours.",
    'wa.greetingShort':'Hello ACT!',
  },
  FR: {
    // Navigation
    'nav.circuits':'Circuits & produits',
    'nav.bespoke':'Sur mesure',
    'nav.blog':'Blog',
    'nav.about':'À propos',
    'nav.contact':'Contact',
    'nav.faq':'FAQ',
    // CTAs
    'cta.whatsapp':'WhatsApp',
    'cta.book':'Réserver sur WhatsApp',
    'cta.details':'Détails',
    'cta.quote':'Demander un devis',
    'cta.viewTours':'Voir nos circuits & produits',
    'cta.bespoke':'Voyage sur mesure',
    'cta.chatWithUs':'Discuter avec nous',
    'cta.chatOnWhatsapp':'Discuter avec nous sur WhatsApp',
    'cta.describeTrip':'Décrire mon voyage',
    // Common
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
    'common.priceLabel':'tarif',
    'common.onQuote':'Sur devis',
    'common.reviews':'avis',
    'common.close':'Fermer',
    'common.menu':'Menu',
    'common.languageSwitcher':'Choisir la langue',
    'common.currencySwitcher':"Devise d'affichage",
    // Footer
    'footer.exploreLabel':'Explorer',
    'footer.agencyLabel':'Agence',
    'footer.contactLabel':'Contact',
    'footer.allTours':'Tous les circuits',
    'footer.bespokeTrip':'Voyage sur mesure',
    'footer.blogAdvice':'Blog & conseils',
    'footer.guides':'Nos guides',
    'footer.localEngagement':'Engagement local',
    'footer.legal':'Mentions légales',
    'footer.cgv':'CGV',
    'footer.privacy':'Confidentialité',
    'footer.bespokeKicker':'Sur mesure',
    'footer.bespokeTitle':'Pas trouvé ce que vous cherchez ?',
    'footer.bespokeTitleEm':'On vous fait un voyage sur mesure.',
    'footer.bespokeNote':'Devis en 24h · sans engagement',
    'footer.tagline':"Tour-opérateur réceptif basé à Dakar depuis 1996. Circuits, excursions, séjours sur mesure au Sénégal et en Afrique de l'Ouest — équipe locale, six langues, réseau dans 6 pays.",
    'footer.openingHours':'Lun–Ven · 9h–18h (GMT)',
    'footer.copyright':'© 2026 Africa Connection Tours',
    'footer.sinceTagline':'Tour-opérateur depuis 1996',
    'footer.licenseLabel':'Licence agence de voyages n° 006523',
    // Cookies banner
    'cookies.kicker':'Cookies',
    'cookies.title':'Quelques cookies pour mieux vous servir.',
    'cookies.titleEm':'vous servir',
    'cookies.body':'Mesure d\'audience anonymisée uniquement. Aucun cookie publicitaire.',
    'cookies.learnMore':'En savoir plus',
    'cookies.accept':'Accepter',
    'cookies.decline':'Refuser',
    // WhatsApp messages
    'wa.greeting':'Bonjour ACT ! J’aimerais des informations sur vos circuits.',
    'wa.greetingShort':'Bonjour ACT !',
  },
  IT: {
    // Navigation
    'nav.circuits':'Tour e prodotti',
    'nav.bespoke':'Su misura',
    'nav.blog':'Blog',
    'nav.about':'Chi siamo',
    'nav.contact':'Contatti',
    'nav.faq':'FAQ',
    // CTAs
    'cta.whatsapp':'WhatsApp',
    'cta.book':'Prenota su WhatsApp',
    'cta.details':'Dettagli',
    'cta.quote':'Richiedi preventivo',
    'cta.viewTours':'Vedi tour e prodotti',
    'cta.bespoke':'Viaggio su misura',
    'cta.chatWithUs':'Scrivici',
    'cta.chatOnWhatsapp':'Scrivici su WhatsApp',
    'cta.describeTrip':'Descrivi il mio viaggio',
    // Common
    'common.from':'da',
    'common.perPerson':'/ pers',
    'common.day':'giorno',
    'common.days':'giorni',
    'common.results':'risultati',
    'common.reset':'Reimposta',
    'common.search':'Cerca',
    'common.send':'Invia',
    'common.next':'Avanti',
    'common.prev':'Indietro',
    'common.step':'Passo',
    'common.of':'di',
    'common.priceLabel':'prezzo',
    'common.onQuote':'Su richiesta',
    'common.reviews':'recensioni',
    'common.close':'Chiudi',
    'common.menu':'Menu',
    'common.languageSwitcher':'Scegli la lingua',
    'common.currencySwitcher':'Valuta di visualizzazione',
    // Footer
    'footer.exploreLabel':'Esplora',
    'footer.agencyLabel':'Agenzia',
    'footer.contactLabel':'Contatti',
    'footer.allTours':'Tutti i tour',
    'footer.bespokeTrip':'Viaggio su misura',
    'footer.blogAdvice':'Blog e consigli',
    'footer.guides':'Le nostre guide',
    'footer.localEngagement':'Impegno locale',
    'footer.legal':'Note legali',
    'footer.cgv':'Termini e condizioni',
    'footer.privacy':'Privacy',
    'footer.bespokeKicker':'Su misura',
    'footer.bespokeTitle':'Non hai trovato ciò che cercavi ?',
    'footer.bespokeTitleEm':'Creiamo un viaggio su misura per te.',
    'footer.bespokeNote':'Preventivo in 24h · senza impegno',
    'footer.tagline':"Tour operator ricettivo con sede a Dakar dal 1996. Tour, escursioni e viaggi su misura in Senegal e Africa occidentale — team locale, sei lingue, rete in 6 paesi.",
    'footer.openingHours':'Lun–Ven · 9–18 (GMT)',
    'footer.copyright':'© 2026 Africa Connection Tours',
    'footer.sinceTagline':'Tour operator dal 1996',
    'footer.licenseLabel':'Licenza agenzia di viaggi n° 006523',
    // Cookies banner
    'cookies.kicker':'Cookies',
    'cookies.title':'Qualche cookie per servirti meglio.',
    'cookies.titleEm':'servirti meglio',
    'cookies.body':'Solo misurazione anonima del pubblico. Nessun cookie pubblicitario.',
    'cookies.learnMore':'Scopri di più',
    'cookies.accept':'Accetta',
    'cookies.decline':'Rifiuta',
    // WhatsApp messages
    'wa.greeting':'Buongiorno ACT! Vorrei alcune informazioni sui vostri tour.',
    'wa.greetingShort':'Buongiorno ACT!',
  },
  DE: {
    // Navigation
    'nav.circuits':'Touren & Produkte',
    'nav.bespoke':'Maßgeschneidert',
    'nav.blog':'Blog',
    'nav.about':'Über uns',
    'nav.contact':'Kontakt',
    'nav.faq':'FAQ',
    // CTAs
    'cta.whatsapp':'WhatsApp',
    'cta.book':'Auf WhatsApp buchen',
    'cta.details':'Details',
    'cta.quote':'Angebot anfragen',
    'cta.viewTours':'Touren & Produkte ansehen',
    'cta.bespoke':'Maßgeschneiderte Reise',
    'cta.chatWithUs':'Schreiben Sie uns',
    'cta.chatOnWhatsapp':'Schreiben Sie uns auf WhatsApp',
    'cta.describeTrip':'Reise beschreiben',
    // Common
    'common.from':'ab',
    'common.perPerson':'/ Pers',
    'common.day':'Tag',
    'common.days':'Tage',
    'common.results':'Ergebnisse',
    'common.reset':'Zurücksetzen',
    'common.search':'Suchen',
    'common.send':'Senden',
    'common.next':'Weiter',
    'common.prev':'Zurück',
    'common.step':'Schritt',
    'common.of':'von',
    'common.priceLabel':'Preis',
    'common.onQuote':'Auf Anfrage',
    'common.reviews':'Bewertungen',
    'common.close':'Schließen',
    'common.menu':'Menü',
    'common.languageSwitcher':'Sprache wählen',
    'common.currencySwitcher':'Anzeigewährung',
    // Footer
    'footer.exploreLabel':'Entdecken',
    'footer.agencyLabel':'Agentur',
    'footer.contactLabel':'Kontakt',
    'footer.allTours':'Alle Touren',
    'footer.bespokeTrip':'Maßgeschneiderte Reise',
    'footer.blogAdvice':'Blog & Ratschläge',
    'footer.guides':'Unsere Guides',
    'footer.localEngagement':'Lokales Engagement',
    'footer.legal':'Impressum',
    'footer.cgv':'AGB',
    'footer.privacy':'Datenschutz',
    'footer.bespokeKicker':'Maßgeschneidert',
    'footer.bespokeTitle':'Nicht gefunden, was Sie suchten ?',
    'footer.bespokeTitleEm':'Wir gestalten Ihre Reise maßgeschneidert.',
    'footer.bespokeNote':'Angebot in 24h · unverbindlich',
    'footer.tagline':'Empfangs-Reiseveranstalter mit Sitz in Dakar seit 1996. Touren, Tagesausflüge und maßgeschneiderte Reisen im Senegal und in Westafrika — lokales Team, sechs Sprachen, Netzwerk in 6 Ländern.',
    'footer.openingHours':'Mo–Fr · 9–18 Uhr (GMT)',
    'footer.copyright':'© 2026 Africa Connection Tours',
    'footer.sinceTagline':'Reiseveranstalter seit 1996',
    'footer.licenseLabel':'Reisebüro-Lizenz Nr. 006523',
    // Cookies banner
    'cookies.kicker':'Cookies',
    'cookies.title':'Ein paar Cookies, um Ihnen besser zu dienen.',
    'cookies.titleEm':'besser zu dienen',
    'cookies.body':'Nur anonyme Reichweitenmessung. Keine Werbe-Cookies.',
    'cookies.learnMore':'Mehr erfahren',
    'cookies.accept':'Akzeptieren',
    'cookies.decline':'Ablehnen',
    // WhatsApp messages
    'wa.greeting':'Hallo ACT! Ich hätte gerne Informationen zu Ihren Touren.',
    'wa.greetingShort':'Hallo ACT!',
  },
};

// Locale codes pour les balises HTML/SEO et navigator.language formel
const LOCALE = { EN:'en-US', FR:'fr-SN', IT:'it-IT', DE:'de-DE' };

// Fixed demo conversion rates (1 EUR ≈ 655 XOF, 1 USD ≈ 600 XOF)
const RATES = { XOF: 1, EUR: 1/655, USD: 1/600 };
const CCY_SYM = { XOF: 'FCFA', EUR: '€', USD: '$' };

// Sélection initiale : 1) localStorage, 2) navigator.language, 3) défaut EN
const initialLang = () => readStoredLang() || detectBrowserLang();

const I18nProvider = ({ children }) => {
  const [lang, setLangState] = React.useState(initialLang);
  const [ccy, setCcy]   = React.useState('XOF');

  // Setter qui persiste + met à jour <html lang="...">
  const setLang = React.useCallback((next) => {
    if (!LANGS.includes(next)) return;
    setLangState(next);
    writeStoredLang(next);
  }, []);

  // Synchroniser <html lang> avec la langue active — utile pour Google et
  // les lecteurs d'écran. Au premier rendu, on aligne aussi sur la valeur
  // initiale (le HTML statique annonce fr-SN par défaut).
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = (LOCALE[lang] || 'en').split('-')[0];
    }
  }, [lang]);

  // Repli en cascade : lang → EN → FR → clé brute (signal de dette de trad).
  const t = React.useCallback((key) => {
    const tryLang = (l) => DICT[l] && DICT[l][key];
    return tryLang(lang) || tryLang('EN') || tryLang('FR') || key;
  }, [lang]);

  const formatPrice = React.useCallback((xof) => {
    if (xof == null) return '';
    const v = xof * RATES[ccy];
    if (ccy === 'XOF') {
      return Math.round(v).toLocaleString('fr-FR').replace(/ /g,' ') + ' FCFA';
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

  const value = { lang, setLang, langs: LANGS, locale: LOCALE[lang], ccy, setCcy, t, formatPrice, shortPrice };
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

Object.assign(window, { I18nProvider, useI18n, useRouter, RATES, CCY_SYM, DICT, LANGS, LOCALE });

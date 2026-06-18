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
    'common.all':'All',
    // Destination tags (filters used on the home destinations grid)
    'destination.tag.culture':'Culture',
    'destination.tag.nature':'Nature',
    'destination.tag.aventure':'Adventure',
    'destination.tag.patrimoine':'Heritage',
    'destination.fromDakar':'from Dakar',
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
    'wa.planTrip':"Hello ACT! I'd like to plan a trip.",
    // Home Hero
    'home.hero.badge':'2026 season open',
    'home.hero.title':'Senegal, {em}at the pace{/em} of those who live here.',
    'home.hero.intro':'Tours and getaways crafted by Dakar-based guides — from Gorée Island to Bassari country, at human scale. No clichés, no cookie-cutter packages, no middlemen.',
    'home.hero.scroll':'scroll',
    'home.hero.videoAria':'Silent ambient video — landscapes of Senegal',
    'home.hero.ctaSeeTours':'See our tours',
    'home.hero.stat1Key':'30 years',  'home.hero.stat1Val':'since 1996',
    'home.hero.stat2Key':'6 countries','home.hero.stat2Val':'West Africa',
    'home.hero.stat3Key':'4.9 / 5',   'home.hero.stat3Val':'traveller reviews',
    'home.hero.stat4Key':'< 1h',      'home.hero.stat4Val':'WhatsApp reply',
    // Page heroes (catalog, blog, custom, contact, about, faq)
    'page.catalog.kicker':'Catalogue',
    'page.catalog.title':'All our {em}tours & products{/em}.',
    'page.catalog.intro':"From a weekend in Dakar to the grand tour of Senegal, from the Return to Roots program to event packages — the entire Africa Connection Tours offer, in one place.",
    'page.blog.kicker':'The ACT journal',
    'page.blog.title':'The travel guide {em}to Senegal{/em}.',
    'page.blog.intro':'Stories, practical advice, honest calendars — by guides who live here all year round.',
    'page.blog.search':'Search articles…',
    'page.custom.kicker':'Bespoke',
    'page.custom.title':"Let's compose your {em}ideal trip{/em}.",
    'page.custom.intro':"A dozen questions, 3 minutes. We come back with an itinerary that fits you.",
    'page.contact.kicker':'Contact',
    'page.contact.title':"Let's talk about {em}your trip{/em}.",
    'page.contact.intro':'Three channels, one team. WhatsApp always replies in under an hour during our opening hours.',
    'page.about.kicker':'About',
    'page.about.title':'Dakar-based tour operator, {em}since 1996{/em}.',
    'page.about.intro':'Africa Connection Tours has been organising trips in Senegal and West Africa for more than thirty years. Hospitality — téranga in Wolof — remains our standard of service.',
    'page.faq.kicker':'FAQ',
    'page.faq.title':'Frequently {em}asked questions{/em}.',
    'page.faq.intro':"Everything we get asked most often, sorted by theme. A question is missing? We'll reply on WhatsApp in under an hour.",
    'page.faq.search':'Search a question…',
    // Catalog filters and toolbar
    'catalog.toolbar.filter':'Filter',
    'catalog.toolbar.tours.one':'tour',  'catalog.toolbar.tours.many':'tours',
    'catalog.toolbar.reset':'reset',
    'catalog.toolbar.sort':'Sort',
    'catalog.filters.title':'Filters',
    'catalog.filters.reset':'Reset',
    'catalog.filters.duration':'Duration',
    'catalog.filters.type':'Type of experience',
    'catalog.filters.budget':'Budget',
    'catalog.filters.destination':'Destination',
    'catalog.filters.start':'Starting point',
    'catalog.duration.1':'1 day',
    'catalog.duration.2-3':'Weekend',
    'catalog.duration.4-5':'3 to 5 days',
    'catalog.duration.6-10':'6 to 10 days',
    'catalog.duration.10+':'10+ days',
    'catalog.type.culture':'Culture & History',
    'catalog.type.nature':'Nature & Wildlife',
    'catalog.type.plage':'Beach & Relax',
    'catalog.type.aventure':'Adventure',
    'catalog.type.famille':'Family',
    'catalog.type.diaspora':'Diaspora & Heritage',
    'catalog.type.evenement':'Events & Ceremonies',
    'catalog.tier.eco':'Budget',
    'catalog.tier.confort':'Comfort',
    'catalog.tier.premium':'Premium',
    'catalog.start.dakar':'Dakar',
    'catalog.start.saint-louis':'Saint-Louis',
    'catalog.start.autre':'Other',
    'catalog.sort.pertinence':'Relevance',
    'catalog.sort.priceAsc':'Price ascending',
    'catalog.sort.priceDesc':'Price descending',
    'catalog.sort.duration':'Duration',
    'catalog.sort.popularity':'Popularity',
    'catalog.empty.title':'No tour matches. {em}Shall we compose a bespoke one for you?{/em}',
    'catalog.empty.intro':'Tell us what you are looking for and we come back with an itinerary in 24h.',
    'catalog.empty.composeCTA':'Compose my trip',
    'catalog.empty.clearCTA':'Clear filters',
    'catalog.bottomCTA.title':"Can't find {em}your Senegal{/em} in this list?",
    'catalog.bottomCTA.body':'Tell us what you are looking for — duration, interests, budget. We come back with an itinerary in 24h.',
    'catalog.bottomCTA.cta':'Compose my trip',
    'catalog.drawer.showOne':'Show {n} tour',
    'catalog.drawer.showMany':'Show {n} tours',
    // Contact page
    'contact.cards.whatsapp.cta':'Chat now',
    'contact.cards.phone.k':'Phone',
    'contact.cards.phone.cta':'Mon–Sat · 9am–7pm',
    'contact.cards.email.k':'Email',
    'contact.cards.email.cta':'Write an email',
    'contact.form.kicker':'Form',
    'contact.form.title':'Write to us.',
    'contact.form.intro':'Reply in under 24 working hours. For urgent matters, prefer WhatsApp.',
    'contact.form.sent.title':'Message sent.',
    'contact.form.sent.body':'We will get back to you very soon.',
    'contact.form.field.name':'First and last name',
    'contact.form.field.email':'Email',
    'contact.form.field.phone':'WhatsApp (optional)',
    'contact.form.field.phonePlaceholder':'+1 555 …',
    'contact.form.field.subject':'Subject',
    'contact.form.subject.devis':'Quote request',
    'contact.form.subject.question':'General question',
    'contact.form.subject.partenariat':'Partnership',
    'contact.form.subject.autre':'Other',
    'contact.form.field.message':'Message',
    'contact.form.messagePlaceholder':'Tell us what you have in mind…',
    'contact.form.privacyText':'By sending this message, you accept our',
    'contact.form.privacyLink':'privacy policy',
    'contact.form.openMail':'Open my email',
    'contact.form.send':'Send',
    'contact.form.sending':'Sending…',
    'contact.aside.title':'Our office',
    'contact.aside.country':'Senegal',
    'contact.aside.hours':'Hours',
    'contact.aside.since':'Since',
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
    'common.all':'Tous',
    // Destination tags
    'destination.tag.culture':'Culture',
    'destination.tag.nature':'Nature',
    'destination.tag.aventure':'Aventure',
    'destination.tag.patrimoine':'Patrimoine',
    'destination.fromDakar':'de Dakar',
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
    'wa.planTrip':'Bonjour ACT ! Je voudrais organiser un voyage.',
    // Home Hero
    'home.hero.badge':'Saison 2026 ouverte',
    'home.hero.title':'Le Sénégal, {em}à la cadence{/em} de ceux qui y vivent.',
    'home.hero.intro':"Circuits et escapades imaginés par des guides dakarois — de Gorée au pays Bassari, à hauteur d'humain. Sans cliché, sans pack froid, sans intermédiaire.",
    'home.hero.scroll':'défiler',
    'home.hero.videoAria':"Vidéo d'ambiance silencieuse — paysages du Sénégal",
    'home.hero.ctaSeeTours':'Voir nos circuits',
    'home.hero.stat1Key':'30 ans',   'home.hero.stat1Val':'depuis 1996',
    'home.hero.stat2Key':'6 pays',   'home.hero.stat2Val':"Afrique de l'Ouest",
    'home.hero.stat3Key':'4.9 / 5',  'home.hero.stat3Val':'avis voyageurs',
    'home.hero.stat4Key':'< 1h',     'home.hero.stat4Val':'réponse WhatsApp',
    // Page heroes
    'page.catalog.kicker':'Catalogue',
    'page.catalog.title':'Tous nos {em}circuits & produits{/em}.',
    'page.catalog.intro':"Du week-end à Dakar au grand tour du Sénégal, du programme Retour aux sources aux packs événements — toute l'offre Africa Connection Tours, en un seul endroit.",
    'page.blog.kicker':'Le blog ACT',
    'page.blog.title':'Le guide du voyage {em}au Sénégal{/em}.',
    'page.blog.intro':"Récits, conseils pratiques, calendriers honnêtes — par des guides qui vivent ici toute l'année.",
    'page.blog.search':'Chercher un article…',
    'page.custom.kicker':'Sur mesure',
    'page.custom.title':'Composons votre voyage {em}idéal{/em}.',
    'page.custom.intro':'Une dizaine de questions, 3 minutes. À la fin, on revient avec un itinéraire qui vous ressemble.',
    'page.contact.kicker':'Contact',
    'page.contact.title':'Parlons de {em}votre voyage{/em}.',
    'page.contact.intro':"Trois canaux, une équipe. WhatsApp répond toujours en moins d’une heure pendant nos horaires d’ouverture.",
    'page.about.kicker':'À propos',
    'page.about.title':'Tour-opérateur de Dakar, {em}depuis 1996{/em}.',
    'page.about.intro':"Africa Connection Tours organise les voyages au Sénégal et en Afrique de l’Ouest depuis plus de trente ans. L’hospitalité — la téranga, en wolof — reste notre standard de service.",
    'page.faq.kicker':'FAQ',
    'page.faq.title':'Les questions {em}fréquentes{/em}.',
    'page.faq.intro':"Tout ce qu’on nous demande le plus souvent, classé par thème. Une réponse manque ? On vous répond sur WhatsApp en moins d’une heure.",
    'page.faq.search':'Chercher une question…',
    // Catalog
    'catalog.toolbar.filter':'Filtrer',
    'catalog.toolbar.tours.one':'circuit',  'catalog.toolbar.tours.many':'circuits',
    'catalog.toolbar.reset':'réinitialiser',
    'catalog.toolbar.sort':'Tri',
    'catalog.filters.title':'Filtres',
    'catalog.filters.reset':'Réinitialiser',
    'catalog.filters.duration':'Durée',
    'catalog.filters.type':"Type d'expérience",
    'catalog.filters.budget':'Budget',
    'catalog.filters.destination':'Destination',
    'catalog.filters.start':'Point de départ',
    'catalog.duration.1':'1 jour',
    'catalog.duration.2-3':'Week-end',
    'catalog.duration.4-5':'3 à 5 jours',
    'catalog.duration.6-10':'6 à 10 jours',
    'catalog.duration.10+':'+10 jours',
    'catalog.type.culture':'Culture & Histoire',
    'catalog.type.nature':'Nature & Faune',
    'catalog.type.plage':'Plage & Détente',
    'catalog.type.aventure':'Aventure',
    'catalog.type.famille':'Famille',
    'catalog.type.diaspora':'Diaspora & Patrimoine',
    'catalog.type.evenement':'Événements & Cérémonies',
    'catalog.tier.eco':'Économique',
    'catalog.tier.confort':'Confort',
    'catalog.tier.premium':'Premium',
    'catalog.start.dakar':'Dakar',
    'catalog.start.saint-louis':'Saint-Louis',
    'catalog.start.autre':'Autre',
    'catalog.sort.pertinence':'Pertinence',
    'catalog.sort.priceAsc':'Prix croissant',
    'catalog.sort.priceDesc':'Prix décroissant',
    'catalog.sort.duration':'Durée',
    'catalog.sort.popularity':'Popularité',
    'catalog.empty.title':'Aucun circuit ne correspond. {em}Et si on vous en composait un sur mesure ?{/em}',
    'catalog.empty.intro':'Décrivez ce que vous cherchez, on revient avec un itinéraire en 24h.',
    'catalog.empty.composeCTA':'Composer mon voyage',
    'catalog.empty.clearCTA':'Effacer les filtres',
    'catalog.bottomCTA.title':'Vous ne trouvez pas {em}votre Sénégal{/em} dans cette liste ?',
    'catalog.bottomCTA.body':'Dites-nous ce que vous cherchez — durée, envies, budget. On revient avec un itinéraire en 24h.',
    'catalog.bottomCTA.cta':'Composer mon voyage',
    'catalog.drawer.showOne':'Voir {n} circuit',
    'catalog.drawer.showMany':'Voir {n} circuits',
    // Contact
    'contact.cards.whatsapp.cta':'Discuter maintenant',
    'contact.cards.phone.k':'Téléphone',
    'contact.cards.phone.cta':'Lun–Sam · 9h–19h',
    'contact.cards.email.k':'Email',
    'contact.cards.email.cta':'Écrire un email',
    'contact.form.kicker':'Formulaire',
    'contact.form.title':'Écrivez-nous.',
    'contact.form.intro':'Réponse en moins de 24h ouvrées. Pour une urgence, préférez WhatsApp.',
    'contact.form.sent.title':'Message envoyé.',
    'contact.form.sent.body':'On revient vers vous très vite.',
    'contact.form.field.name':'Prénom et nom',
    'contact.form.field.email':'Email',
    'contact.form.field.phone':'WhatsApp (facultatif)',
    'contact.form.field.phonePlaceholder':'+33 6 …',
    'contact.form.field.subject':'Sujet',
    'contact.form.subject.devis':'Demande de devis',
    'contact.form.subject.question':'Question générale',
    'contact.form.subject.partenariat':'Partenariat',
    'contact.form.subject.autre':'Autre',
    'contact.form.field.message':'Message',
    'contact.form.messagePlaceholder':'Dites-nous ce que vous avez en tête…',
    'contact.form.privacyText':'En envoyant ce message, vous acceptez notre',
    'contact.form.privacyLink':'politique de confidentialité',
    'contact.form.openMail':'Ouvrir mon mail',
    'contact.form.send':'Envoyer',
    'contact.form.sending':'Envoi…',
    'contact.aside.title':'Notre bureau',
    'contact.aside.country':'Sénégal',
    'contact.aside.hours':'Horaires',
    'contact.aside.since':'Depuis',
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
    'common.all':'Tutti',
    // Destination tags
    'destination.tag.culture':'Cultura',
    'destination.tag.nature':'Natura',
    'destination.tag.aventure':'Avventura',
    'destination.tag.patrimoine':'Patrimonio',
    'destination.fromDakar':'da Dakar',
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
    'wa.planTrip':'Buongiorno ACT! Vorrei organizzare un viaggio.',
    // Home Hero
    'home.hero.badge':'Stagione 2026 aperta',
    'home.hero.title':"Il Senegal, {em}al ritmo{/em} di chi ci vive.",
    'home.hero.intro':"Tour e fughe ideati da guide di Dakar — dall'Isola di Gorée al paese Bassari, a misura d'uomo. Senza cliché, senza pacchetti freddi, senza intermediari.",
    'home.hero.scroll':'scorri',
    'home.hero.videoAria':'Video ambient silenzioso — paesaggi del Senegal',
    'home.hero.ctaSeeTours':'Vedi i nostri tour',
    'home.hero.stat1Key':'30 anni',   'home.hero.stat1Val':'dal 1996',
    'home.hero.stat2Key':'6 paesi',   'home.hero.stat2Val':'Africa occidentale',
    'home.hero.stat3Key':'4.9 / 5',   'home.hero.stat3Val':'recensioni viaggiatori',
    'home.hero.stat4Key':'< 1h',      'home.hero.stat4Val':'risposta WhatsApp',
    // Page heroes
    'page.catalog.kicker':'Catalogo',
    'page.catalog.title':'Tutti i nostri {em}tour e prodotti{/em}.',
    'page.catalog.intro':"Da un fine settimana a Dakar al gran tour del Senegal, dal programma Ritorno alle origini ai pacchetti eventi — tutta l'offerta Africa Connection Tours, in un unico luogo.",
    'page.blog.kicker':'Il blog ACT',
    'page.blog.title':'La guida di viaggio {em}in Senegal{/em}.',
    'page.blog.intro':"Racconti, consigli pratici, calendari onesti — da guide che vivono qui tutto l'anno.",
    'page.blog.search':'Cerca un articolo…',
    'page.custom.kicker':'Su misura',
    'page.custom.title':'Componiamo il tuo viaggio {em}ideale{/em}.',
    'page.custom.intro':'Una dozzina di domande, 3 minuti. Alla fine, torniamo con un itinerario che ti somiglia.',
    'page.contact.kicker':'Contatti',
    'page.contact.title':'Parliamo del {em}tuo viaggio{/em}.',
    'page.contact.intro':"Tre canali, una sola squadra. WhatsApp risponde sempre in meno di un'ora durante i nostri orari di apertura.",
    'page.about.kicker':'Chi siamo',
    'page.about.title':'Tour operator di Dakar, {em}dal 1996{/em}.',
    'page.about.intro':"Africa Connection Tours organizza viaggi in Senegal e in Africa occidentale da oltre trent'anni. L'ospitalità — téranga, in wolof — resta il nostro standard di servizio.",
    'page.faq.kicker':'FAQ',
    'page.faq.title':'Le domande {em}frequenti{/em}.',
    'page.faq.intro':"Tutto ciò che ci viene chiesto più spesso, ordinato per tema. Manca una risposta? Rispondiamo su WhatsApp in meno di un'ora.",
    'page.faq.search':'Cerca una domanda…',
    // Catalog
    'catalog.toolbar.filter':'Filtra',
    'catalog.toolbar.tours.one':'tour',  'catalog.toolbar.tours.many':'tour',
    'catalog.toolbar.reset':'reimposta',
    'catalog.toolbar.sort':'Ordina',
    'catalog.filters.title':'Filtri',
    'catalog.filters.reset':'Reimposta',
    'catalog.filters.duration':'Durata',
    'catalog.filters.type':'Tipo di esperienza',
    'catalog.filters.budget':'Budget',
    'catalog.filters.destination':'Destinazione',
    'catalog.filters.start':'Partenza',
    'catalog.duration.1':'1 giorno',
    'catalog.duration.2-3':'Weekend',
    'catalog.duration.4-5':'Da 3 a 5 giorni',
    'catalog.duration.6-10':'Da 6 a 10 giorni',
    'catalog.duration.10+':'+10 giorni',
    'catalog.type.culture':'Cultura e storia',
    'catalog.type.nature':'Natura e fauna',
    'catalog.type.plage':'Spiaggia e relax',
    'catalog.type.aventure':'Avventura',
    'catalog.type.famille':'Famiglia',
    'catalog.type.diaspora':'Diaspora e patrimonio',
    'catalog.type.evenement':'Eventi e cerimonie',
    'catalog.tier.eco':'Economico',
    'catalog.tier.confort':'Comfort',
    'catalog.tier.premium':'Premium',
    'catalog.start.dakar':'Dakar',
    'catalog.start.saint-louis':'Saint-Louis',
    'catalog.start.autre':'Altro',
    'catalog.sort.pertinence':'Rilevanza',
    'catalog.sort.priceAsc':'Prezzo crescente',
    'catalog.sort.priceDesc':'Prezzo decrescente',
    'catalog.sort.duration':'Durata',
    'catalog.sort.popularity':'Popolarità',
    'catalog.empty.title':'Nessun tour corrisponde. {em}E se ne componessimo uno su misura?{/em}',
    'catalog.empty.intro':'Descrivici cosa cerchi, torniamo con un itinerario in 24h.',
    'catalog.empty.composeCTA':'Componi il mio viaggio',
    'catalog.empty.clearCTA':'Azzera i filtri',
    'catalog.bottomCTA.title':'Non trovi {em}il tuo Senegal{/em} in questa lista?',
    'catalog.bottomCTA.body':'Dicci cosa cerchi — durata, interessi, budget. Torniamo con un itinerario in 24h.',
    'catalog.bottomCTA.cta':'Componi il mio viaggio',
    'catalog.drawer.showOne':'Vedi {n} tour',
    'catalog.drawer.showMany':'Vedi {n} tour',
    // Contact
    'contact.cards.whatsapp.cta':'Scrivici ora',
    'contact.cards.phone.k':'Telefono',
    'contact.cards.phone.cta':'Lun–Sab · 9–19',
    'contact.cards.email.k':'Email',
    'contact.cards.email.cta':"Scrivi un'email",
    'contact.form.kicker':'Modulo',
    'contact.form.title':'Scrivici.',
    'contact.form.intro':'Rispondiamo in meno di 24 ore lavorative. Per urgenze, preferisci WhatsApp.',
    'contact.form.sent.title':'Messaggio inviato.',
    'contact.form.sent.body':'Ti risponderemo molto presto.',
    'contact.form.field.name':'Nome e cognome',
    'contact.form.field.email':'Email',
    'contact.form.field.phone':'WhatsApp (facoltativo)',
    'contact.form.field.phonePlaceholder':'+39 333 …',
    'contact.form.field.subject':'Oggetto',
    'contact.form.subject.devis':'Richiesta preventivo',
    'contact.form.subject.question':'Domanda generica',
    'contact.form.subject.partenariat':'Partnership',
    'contact.form.subject.autre':'Altro',
    'contact.form.field.message':'Messaggio',
    'contact.form.messagePlaceholder':'Raccontaci cosa hai in mente…',
    'contact.form.privacyText':'Inviando questo messaggio, accetti la nostra',
    'contact.form.privacyLink':'informativa sulla privacy',
    'contact.form.openMail':'Apri la mia email',
    'contact.form.send':'Invia',
    'contact.form.sending':'Invio…',
    'contact.aside.title':'Il nostro ufficio',
    'contact.aside.country':'Senegal',
    'contact.aside.hours':'Orari',
    'contact.aside.since':'Dal',
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
    'common.all':'Alle',
    // Destination tags
    'destination.tag.culture':'Kultur',
    'destination.tag.nature':'Natur',
    'destination.tag.aventure':'Abenteuer',
    'destination.tag.patrimoine':'Erbe',
    'destination.fromDakar':'ab Dakar',
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
    'wa.planTrip':'Hallo ACT! Ich möchte eine Reise planen.',
    // Home Hero
    'home.hero.badge':'Saison 2026 eröffnet',
    'home.hero.title':'Senegal, {em}im Rhythmus{/em} derer, die hier leben.',
    'home.hero.intro':'Touren und Ausflüge, konzipiert von Guides aus Dakar — von der Insel Gorée bis ins Bassari-Land, auf Augenhöhe. Ohne Klischees, ohne starre Pakete, ohne Mittelsmänner.',
    'home.hero.scroll':'scrollen',
    'home.hero.videoAria':'Stilles Ambient-Video — Landschaften des Senegals',
    'home.hero.ctaSeeTours':'Touren ansehen',
    'home.hero.stat1Key':'30 Jahre',   'home.hero.stat1Val':'seit 1996',
    'home.hero.stat2Key':'6 Länder',   'home.hero.stat2Val':'Westafrika',
    'home.hero.stat3Key':'4,9 / 5',    'home.hero.stat3Val':'Reisebewertungen',
    'home.hero.stat4Key':'< 1h',       'home.hero.stat4Val':'WhatsApp-Antwort',
    // Page heroes
    'page.catalog.kicker':'Katalog',
    'page.catalog.title':'Alle unsere {em}Touren & Produkte{/em}.',
    'page.catalog.intro':'Vom Wochenende in Dakar bis zur großen Senegal-Rundreise, vom Programm Zurück zu den Wurzeln bis zu Event-Paketen — das gesamte Angebot von Africa Connection Tours, an einem Ort.',
    'page.blog.kicker':'Das ACT-Blog',
    'page.blog.title':'Der Reiseführer {em}für den Senegal{/em}.',
    'page.blog.intro':'Geschichten, praktische Tipps, ehrliche Kalender — von Guides, die das ganze Jahr hier leben.',
    'page.blog.search':'Artikel suchen…',
    'page.custom.kicker':'Maßgeschneidert',
    'page.custom.title':'Gestalten wir Ihre {em}perfekte Reise{/em}.',
    'page.custom.intro':'Ein Dutzend Fragen, 3 Minuten. Am Ende kommen wir mit einer Reiseroute zurück, die zu Ihnen passt.',
    'page.contact.kicker':'Kontakt',
    'page.contact.title':'Sprechen wir über {em}Ihre Reise{/em}.',
    'page.contact.intro':'Drei Kanäle, ein Team. WhatsApp antwortet während unserer Öffnungszeiten immer in unter einer Stunde.',
    'page.about.kicker':'Über uns',
    'page.about.title':'Reiseveranstalter aus Dakar, {em}seit 1996{/em}.',
    'page.about.intro':'Africa Connection Tours organisiert seit über dreißig Jahren Reisen im Senegal und in Westafrika. Gastfreundschaft — téranga, auf Wolof — bleibt unser Servicestandard.',
    'page.faq.kicker':'FAQ',
    'page.faq.title':'Die {em}häufigsten Fragen{/em}.',
    'page.faq.intro':'Alles, was uns am häufigsten gefragt wird, nach Themen sortiert. Eine Antwort fehlt? Wir antworten auf WhatsApp in unter einer Stunde.',
    'page.faq.search':'Eine Frage suchen…',
    // Catalog
    'catalog.toolbar.filter':'Filtern',
    'catalog.toolbar.tours.one':'Tour',  'catalog.toolbar.tours.many':'Touren',
    'catalog.toolbar.reset':'zurücksetzen',
    'catalog.toolbar.sort':'Sortieren',
    'catalog.filters.title':'Filter',
    'catalog.filters.reset':'Zurücksetzen',
    'catalog.filters.duration':'Dauer',
    'catalog.filters.type':'Erfahrungstyp',
    'catalog.filters.budget':'Budget',
    'catalog.filters.destination':'Reiseziel',
    'catalog.filters.start':'Startort',
    'catalog.duration.1':'1 Tag',
    'catalog.duration.2-3':'Wochenende',
    'catalog.duration.4-5':'3 bis 5 Tage',
    'catalog.duration.6-10':'6 bis 10 Tage',
    'catalog.duration.10+':'+10 Tage',
    'catalog.type.culture':'Kultur & Geschichte',
    'catalog.type.nature':'Natur & Tierwelt',
    'catalog.type.plage':'Strand & Erholung',
    'catalog.type.aventure':'Abenteuer',
    'catalog.type.famille':'Familie',
    'catalog.type.diaspora':'Diaspora & Erbe',
    'catalog.type.evenement':'Events & Zeremonien',
    'catalog.tier.eco':'Budget',
    'catalog.tier.confort':'Komfort',
    'catalog.tier.premium':'Premium',
    'catalog.start.dakar':'Dakar',
    'catalog.start.saint-louis':'Saint-Louis',
    'catalog.start.autre':'Andere',
    'catalog.sort.pertinence':'Relevanz',
    'catalog.sort.priceAsc':'Preis aufsteigend',
    'catalog.sort.priceDesc':'Preis absteigend',
    'catalog.sort.duration':'Dauer',
    'catalog.sort.popularity':'Beliebtheit',
    'catalog.empty.title':'Keine Tour passt. {em}Sollen wir eine maßgeschneiderte für Sie zusammenstellen?{/em}',
    'catalog.empty.intro':'Sagen Sie uns, was Sie suchen, und wir kommen in 24 Stunden mit einer Reiseroute zurück.',
    'catalog.empty.composeCTA':'Reise gestalten',
    'catalog.empty.clearCTA':'Filter löschen',
    'catalog.bottomCTA.title':'Sie finden {em}Ihren Senegal{/em} nicht in dieser Liste?',
    'catalog.bottomCTA.body':'Sagen Sie uns, was Sie suchen — Dauer, Vorlieben, Budget. Wir kommen in 24 Stunden mit einer Reiseroute zurück.',
    'catalog.bottomCTA.cta':'Reise gestalten',
    'catalog.drawer.showOne':'{n} Tour ansehen',
    'catalog.drawer.showMany':'{n} Touren ansehen',
    // Contact
    'contact.cards.whatsapp.cta':'Jetzt schreiben',
    'contact.cards.phone.k':'Telefon',
    'contact.cards.phone.cta':'Mo–Sa · 9–19 Uhr',
    'contact.cards.email.k':'E-Mail',
    'contact.cards.email.cta':'E-Mail schreiben',
    'contact.form.kicker':'Formular',
    'contact.form.title':'Schreiben Sie uns.',
    'contact.form.intro':'Antwort in weniger als 24 Werkstunden. Für dringende Anliegen bevorzugen Sie WhatsApp.',
    'contact.form.sent.title':'Nachricht gesendet.',
    'contact.form.sent.body':'Wir melden uns sehr bald.',
    'contact.form.field.name':'Vor- und Nachname',
    'contact.form.field.email':'E-Mail',
    'contact.form.field.phone':'WhatsApp (optional)',
    'contact.form.field.phonePlaceholder':'+49 151 …',
    'contact.form.field.subject':'Betreff',
    'contact.form.subject.devis':'Angebotsanfrage',
    'contact.form.subject.question':'Allgemeine Frage',
    'contact.form.subject.partenariat':'Partnerschaft',
    'contact.form.subject.autre':'Andere',
    'contact.form.field.message':'Nachricht',
    'contact.form.messagePlaceholder':'Sagen Sie uns, was Sie im Sinn haben…',
    'contact.form.privacyText':'Indem Sie diese Nachricht senden, akzeptieren Sie unsere',
    'contact.form.privacyLink':'Datenschutzerklärung',
    'contact.form.openMail':'Meine E-Mail öffnen',
    'contact.form.send':'Senden',
    'contact.form.sending':'Senden…',
    'contact.aside.title':'Unser Büro',
    'contact.aside.country':'Senegal',
    'contact.aside.hours':'Öffnungszeiten',
    'contact.aside.since':'Seit',
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

  // Repli en cascade : lang → EN → FR → fallback fourni → clé brute.
  // Le `fallback` permet aux composants utilisant les données encore en FR
  // (data.jsx : circuits, destinations, blogs…) de pré-câbler des clés
  // i18n sans casser le rendu. Quand une traduction sera ajoutée au DICT
  // (typiquement via DeepL Pro en Phase 2), elle remplacera automatiquement
  // le fallback, sans modification de code côté composant.
  // Exemple : t(`circuit.${c.id}.title`, c.title)
  const t = React.useCallback((key, fallback) => {
    const tryLang = (l) => DICT[l] && DICT[l][key];
    return tryLang(lang) || tryLang('EN') || tryLang('FR') || (fallback != null ? fallback : key);
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

  // richT(template, opts) — rendu d'une chaîne contenant des marqueurs
  // {em}…{/em} sous forme de fragment React, avec <em> autour des segments
  // marqués. Permet de localiser un titre type "Composons votre voyage
  // {em}idéal{/em}." sans casser la mise en forme (em coloré, etc.).
  // L'ordre des segments peut différer entre langues sans toucher au JSX.
  const richT = React.useCallback((template, opts = {}) => {
    if (template == null) return null;
    const text = String(template);
    const { emClassName } = opts;
    const parts = [];
    let i = 0, k = 0;
    const re = /\{em\}([\s\S]*?)\{\/em\}/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > i) parts.push(text.slice(i, m.index));
      parts.push(<em key={`em-${k++}`} className={emClassName}>{m[1]}</em>);
      i = m.index + m[0].length;
    }
    if (i < text.length) parts.push(text.slice(i));
    return parts.length === 1 ? parts[0] : parts;
  }, []);

  const value = { lang, setLang, langs: LANGS, locale: LOCALE[lang], ccy, setCcy, t, richT, formatPrice, shortPrice };
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

// ============================================================================
// Pattern d'extension — contenu provenant de data.jsx (circuits, destinations,
// blogs, FAQ, etc.). Documenté ici pour faciliter la passe DeepL Pro (Phase 2).
//
// Côté composant : on utilise t(key, fallback) où le fallback est la valeur
// FR d'origine — donc TANT QUE la clé n'est pas dans le DICT, le rendu actuel
// est préservé à l'identique. Dès qu'on ajoute la clé dans DICT pour une
// langue, elle prend le relais automatiquement, sans toucher le composant.
//
// Conventions de nommage des clés data :
//
//   circuit.<id>.title             → titre principal du circuit
//   circuit.<id>.subtitle          → accroche / sous-titre
//   circuit.<id>.short             → description courte (1-2 phrases)
//   circuit.<id>.badges.<n>        → badge n (Famille, Confort+, etc.)
//   circuit.<id>.program.<day>     → texte d'une journée du programme
//
//   destination.<id>.name          → nom officiel de la destination
//   destination.<id>.duration      → durée d'accès depuis Dakar
//   destination.tag.<tag>          → libellé d'un tag de catégorie
//
//   blog.<id>.title                → titre d'article
//   blog.<id>.excerpt              → résumé
//   blog.<id>.body                 → corps (markdown ou HTML léger)
//
//   faq.<id>.question              → question
//   faq.<id>.answer                → réponse
//
//   testimonial.<id>.text          → témoignage client
//
// Exemple : pour traduire le circuit "goree-lac-saloum" en anglais, ajouter
// dans DICT.EN les clés :
//   'circuit.goree-lac-saloum.title'   : 'Gorée · Pink Lake · Saloum',
//   'circuit.goree-lac-saloum.subtitle': 'Memory, salt & mangrove',
//   'circuit.goree-lac-saloum.short'   : 'Three places that tell Senegal differently…',
// Aucune modification de composant requise.
// ============================================================================

Object.assign(window, { I18nProvider, useI18n, useRouter, RATES, CCY_SYM, DICT, LANGS, LOCALE });

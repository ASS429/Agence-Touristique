// All mock data used across the site.

// === IMAGE HELPERS ==========================================================
// Real photos live in /images_du_senegal/<destination>/<NN>.jpg.
// The Photo component falls back silently to its duotone placeholder if a src
// fails to load — safe to wire real paths everywhere.
const IMG_BASE = 'images_du_senegal';
const IMG = (folder, n) => `${IMG_BASE}/${folder}/${String(n).padStart(2, '0')}.jpg`;

// === DESTINATIONS ===========================================================
const DESTINATIONS = [
  { id:'dakar',     name:'Dakar',           duration:'sur place',   tag:'culture',    tone:'dusk',   mood:'city',    img: IMG('Dakar', 1) },
  { id:'goree',     name:'Île de Gorée',    duration:'20 min ferry',tag:'patrimoine', tone:'terre',  mood:'horizon', img: IMG('Ile de gorée', 1) },
  { id:'lac-rose',  name:'Lac Rose',        duration:'40 min',      tag:'nature',     tone:'rose',   mood:'water',   img: IMG('Lac Rose', 1) },
  { id:'saint-louis', name:'Saint-Louis',   duration:'4h route',    tag:'culture',    tone:'terre',  mood:'city',    img: IMG('Saint-Louis', 1) },
  { id:'saloum',    name:'Delta du Saloum', duration:'3h route',    tag:'nature',     tone:'atlant', mood:'water',   img: IMG('Delta du Saloum', 1) },
  { id:'lompoul',   name:'Désert de Lompoul',duration:'2h30',       tag:'aventure',   tone:'ocre',   mood:'dunes',   img: IMG('Désert de Lompoul', 1) },
  { id:'casamance', name:'Casamance',       duration:'vol 1h',      tag:'nature',     tone:'forest', mood:'leaves',  img: IMG('Casamance', 1) },
  { id:'kedougou',  name:'Kédougou',        duration:'vol + route', tag:'aventure',   tone:'forest', mood:'horizon', img: IMG('Kédougou', 1) },
];

// === CIRCUITS ===============================================================
// Each circuit carries enough metadata for the catalogue filters:
//   types: array among ['culture','nature','plage','aventure','famille','diaspora']
//   tier:  'eco' | 'confort' | 'premium'
//   start: 'dakar' | 'saint-louis' | 'autre'
//   destIds: destination IDs
//   popularity: number (for sort)
const CIRCUITS = [
  // ---- 1-day ----
  { id:'excursion-goree', title:'Excursion Gorée', subtitle:'Une journée mémoire',
    days:1, nights:0, priceXOF:null, tone:'terre', mood:'horizon',
    badges:['Guide local','Demi-journée OK'], rating:4.9, reviews:118,
    short:'Traversée en ferry, Maison des Esclaves, ruelles d’artistes, déjeuner créole sur l’île.',
    types:['culture','diaspora','famille'], tier:'eco', start:'dakar', destIds:['goree'], popularity:96,
    img: IMG('Ile de gorée', 2) },

  { id:'excursion-lac-rose', title:'Excursion Lac Rose', subtitle:'Sel, dunes & baignade',
    days:1, nights:0, priceXOF:null, tone:'rose', mood:'water',
    badges:['Famille bienvenue','Sans-stress'], rating:4.8, reviews:74,
    short:'Récolte du sel avec les ramasseurs, baignade dans l’eau saline, quad optionnel sur les dunes.',
    types:['nature','famille','plage'], tier:'eco', start:'dakar', destIds:['lac-rose'], popularity:88,
    img: IMG('Lac Rose', 2) },

  { id:'dakar-essentiel', title:'Dakar essentiel', subtitle:'Tour de ville en une journée',
    days:1, nights:0, priceXOF:null, tone:'dusk', mood:'city',
    badges:['Guide local','Pied + voiture'], rating:4.8, reviews:62,
    short:'Médina, Marché Sandaga, Almadies, monument de la Renaissance, déjeuner Yassa.',
    types:['culture','famille'], tier:'eco', start:'dakar', destIds:['dakar'], popularity:80,
    img: IMG('Dakar', 2) },

  // ---- weekend (2-3 days) ----
  { id:'weekend-saint-louis', title:'Week-end Saint-Louis', subtitle:'Architecture & fleuve',
    days:3, nights:2, priceXOF:null, tone:'terre', mood:'city',
    badges:['Guide local','Couples'], rating:4.7, reviews:41,
    short:'L’île historique, balade en calèche, dîner au son du jazz, balade sur le fleuve.',
    types:['culture','plage'], tier:'confort', start:'dakar', destIds:['saint-louis'], popularity:78,
    img: IMG('Saint-Louis', 2) },

  { id:'weekend-saloum', title:'Week-end Saloum', subtitle:'Mangrove & pirogue',
    days:3, nights:2, priceXOF:null, tone:'atlant', mood:'water',
    badges:['Famille bienvenue','Nature'], rating:4.9, reviews:53,
    short:'Pirogue dans les bolongs, dîner sous les fromagers, observation d’oiseaux au lever du jour.',
    types:['nature','famille'], tier:'confort', start:'dakar', destIds:['saloum'], popularity:82,
    img: IMG('Delta du Saloum', 2) },

  // ---- 3-5 days ----
  { id:'goree-lac-saloum', title:'Gorée · Lac Rose · Saloum', subtitle:'Mémoire, sel & mangrove',
    days:5, nights:4, priceXOF:null, tone:'atlant', mood:'water',
    badges:['Guide local','Privé','Famille bienvenue'], rating:4.9, reviews:47,
    short:'Trois lieux qui racontent le Sénégal autrement : l’île-mémoire, le lac qui rosit au soleil, et les bolongs du delta en pirogue.',
    types:['culture','nature','diaspora','famille'], tier:'confort', start:'dakar',
    destIds:['goree','lac-rose','saloum'], popularity:99,
    img: IMG('Delta du Saloum', 3) },

  { id:'lompoul-saint-louis', title:'Lompoul & Saint-Louis', subtitle:'Désert, dunes & jazz fluvial',
    days:4, nights:3, priceXOF:null, tone:'ocre', mood:'dunes',
    badges:['Guide local','Bivouac'], rating:4.9, reviews:22,
    short:'Une nuit sous tente dans les dunes, café au lever du soleil, puis l’architecture coloniale et le jazz de Saint-Louis.',
    types:['aventure','culture'], tier:'confort', start:'dakar', destIds:['lompoul','saint-louis'], popularity:84,
    img: IMG('Désert de Lompoul', 2) },

  { id:'diaspora-essentiel', title:'Retour aux sources', subtitle:'Diaspora · 5 jours',
    days:5, nights:4, priceXOF:null, tone:'terre', mood:'portrait',
    badges:['Diaspora','Cérémonie','Photographe'], rating:5.0, reviews:19,
    short:'Conçu pour les familles afro-descendantes : Gorée en profondeur, rencontre généalogique, cérémonie d’accueil en village.',
    types:['diaspora','culture'], tier:'premium', start:'dakar', destIds:['goree','dakar','saint-louis'], popularity:90,
    img: IMG('Ile de gorée', 3) },

  // ---- 6-10 days ----
  { id:'casamance-essentielle', title:'Casamance essentielle', subtitle:'Cap Skirring & villages diolas',
    days:7, nights:6, priceXOF:null, tone:'forest', mood:'leaves',
    badges:['Guide local','Petit groupe'], rating:4.8, reviews:31,
    short:'Plages du sud, fleuve Casamance, hospitalité diola — un Sénégal plus intime, loin des routes touristiques.',
    types:['nature','plage','culture'], tier:'confort', start:'dakar', destIds:['casamance'], popularity:86,
    img: IMG('Casamance', 2) },

  { id:'grand-tour-7j', title:'Grand tour du nord', subtitle:'7 jours, Dakar → Désert → Saint-Louis',
    days:7, nights:6, priceXOF:null, tone:'ocre', mood:'horizon',
    badges:['Guide local','Confort+'], rating:4.8, reviews:24,
    short:'Une boucle complète : Dakar, Lac Rose, Lompoul, Saint-Louis, parc de la Langue de Barbarie. Un voyage à rythme posé.',
    types:['culture','aventure','nature'], tier:'confort', start:'dakar',
    destIds:['dakar','lac-rose','lompoul','saint-louis'], popularity:88,
    img: IMG('Saint-Louis', 3) },

  { id:'familles-10j', title:'Famille · 10 jours', subtitle:'Doux, varié, sans stress',
    days:10, nights:9, priceXOF:null, tone:'sand', mood:'horizon',
    badges:['Famille bienvenue','Pace tranquille'], rating:4.9, reviews:17,
    short:'Pensé pour les familles avec enfants : journées courtes, hôtels familiaux, baignades, ateliers cuisine et artisanat.',
    types:['famille','culture','plage','nature'], tier:'confort', start:'dakar',
    destIds:['dakar','goree','saloum','saint-louis'], popularity:80,
    img: IMG('Delta du Saloum', 4) },

  // ---- 10+ days ----
  { id:'kedougou-bassari', title:'Kédougou & pays Bassari', subtitle:'Cascades, montagnes & rencontres',
    days:8, nights:7, priceXOF:null, tone:'forest', mood:'horizon',
    badges:['Aventure','Guide local'], rating:4.9, reviews:18,
    short:'Le sud-est : chutes de Dindéfélo, villages bedik, sommets de la Niokolo-Koba — un voyage pour marcheurs curieux.',
    types:['aventure','nature','culture'], tier:'confort', start:'dakar',
    destIds:['kedougou'], popularity:74,
    img: IMG('Kédougou', 2) },

  { id:'grand-tour-14j', title:'Sénégal du Nord au Sud · 14j', subtitle:'Le tour intégral',
    days:14, nights:13, priceXOF:null, tone:'atlant', mood:'water',
    badges:['Privé','Premium','Petit groupe'], rating:5.0, reviews:9,
    short:'Le voyage intégral : Saint-Louis, Lompoul, Saloum, Casamance, Kédougou. Pour ceux qui veulent tout voir avec calme.',
    types:['culture','nature','aventure','plage'], tier:'premium', start:'dakar',
    destIds:['saint-louis','lompoul','saloum','casamance','kedougou'], popularity:92,
    img: IMG('Saint-Louis', 4) },

  { id:'luxe-premium-9j', title:'Privé Premium · 9 jours', subtitle:'Lodges signature & guide privé',
    days:9, nights:8, priceXOF:null, tone:'rose', mood:'water',
    badges:['Premium','Chauffeur privé','Lodges signature'], rating:5.0, reviews:11,
    short:'Hébergement haut de gamme à chaque étape, dégustations privées, transferts en 4x4 V8 climatisé, photographe sur 2 jours.',
    types:['plage','culture','nature'], tier:'premium', start:'dakar',
    destIds:['dakar','saloum','casamance'], popularity:70,
    img: IMG('Casamance', 3) },

  // ---- Produits événementiels & programmes dédiés (offre ACT distinctive) ----
  { id:'pack-bapteme-traditionnel', title:'Pack Baptême traditionnel', subtitle:'Cérémonie communautaire & accueil familial',
    days:2, nights:1, priceXOF:null, tone:'terre', mood:'portrait',
    badges:['Cérémonie','Diaspora','Famille'], rating:5.0, reviews:6,
    short:'Pour les naissances dans les familles de la diaspora — cérémonie traditionnelle wolof, accueil en famille hôte, photographe, accompagnement en français et anglais.',
    types:['evenement','diaspora','culture','famille'], tier:'premium', start:'dakar',
    destIds:['dakar'], popularity:78,
    img: IMG('Ile de gorée', 7) },

  { id:'pack-ceremonie-mariage', title:'Pack Cérémonie de mariage', subtitle:'Union sénégalaise sur mesure',
    days:5, nights:4, priceXOF:null, tone:'rose', mood:'portrait',
    badges:['Cérémonie','Sur mesure','Diaspora'], rating:5.0, reviews:4,
    short:'Mariage traditionnel ou intercommunautaire au Sénégal — logistique complète : lieu, traiteur, tenues, officiants, hébergement des invités. Cadre Dakar, Saint-Louis ou Casamance au choix.',
    types:['evenement','diaspora','culture'], tier:'premium', start:'dakar',
    destIds:['dakar','saint-louis','casamance'], popularity:72,
    img: IMG('Saint-Louis', 6) },

  { id:'diaspora-premium-10j', title:'Retour aux sources · Premium 10j', subtitle:'Programme dédié à la diaspora afro-américaine',
    days:10, nights:9, priceXOF:null, tone:'terre', mood:'portrait',
    badges:['Diaspora','Premium','Photographe','Recherche généalogique'], rating:5.0, reviews:7,
    short:'Conçu pour les familles afro-américaines en pèlerinage de mémoire : Gorée en profondeur, recherche généalogique, cérémonie d’accueil traditionnelle, rencontres avec historiens et photographe attitré sur tout le séjour.',
    types:['diaspora','culture','evenement'], tier:'premium', start:'dakar',
    destIds:['goree','dakar','saint-louis','saloum'], popularity:94,
    img: IMG('Ile de gorée', 5) },

  // ---- Circuit spécial fourni par ACT (juillet 2026) ----
  { id:'dakart-decouverte-10j', title:"Dak'Art & Découverte du Sénégal", subtitle:'Biennale + tour complet · 10 jours',
    days:10, nights:9, priceXOF:null, tone:'terre', mood:'city',
    badges:["Biennale Dak'Art",'Hôtels 4★','Diaspora','Cours cuisine'], rating:5.0, reviews:3,
    short:"Circuit signature d'ACT combinant la Biennale d'art contemporain Dak'Art à Dakar avec un tour complet du Sénégal : Gorée, Thiès, désert de Lompoul (Okai Lodge), Touba, Kaolack, Saly (Lamantin Beach Mövenpick), orphelinat de Mbour et cours de cuisine sénégalaise. Hôtellerie 4 étoiles tout au long du séjour.",
    types:['culture','diaspora','famille'], tier:'premium', start:'dakar',
    destIds:['dakar','goree','lompoul','saloum'], popularity:98,
    img:'images_du_senegal/photos_act_book/dakar/renaissance-01.jpg' },
];

// === EXCURSIONS (page dédiée) ==============================================
// Activités d'une journée ou demi-journée. Source : NEW BOOK ANGLAIS ACT.
// Structure identique aux CIRCUITS pour réutiliser CircuitCard, le filtrage
// et la traduction. `kind` = 'half' (demi-journée) ou 'full' (journée).
// Pour les excursions full-day, le déjeuner est inclus.
const EXCURSIONS = [
  // ---- HALF-DAY (6) ----
  { id:'dakar-halfday', title:'Dakar — Demi-journée', subtitle:'Marchés, mosquée, monument',
    kind:'half', start:'dakar', days:1, nights:0, priceXOF:null, tone:'dusk', mood:'city',
    schedule:'9h00 → 14h30',
    short:"Tour des incontournables de Dakar : marchés Kermel, Sandaga, Soumbédioune, marché Tilen ; Grande Mosquée face à l'Atlantique ; Palais présidentiel ; Université Cheikh Anta Diop ; quartier de la Médina ; Monument de la Renaissance Africaine et Musée des Civilisations Noires.",
    types:['culture'], destIds:['dakar'], popularity:90,
    img:'images_du_senegal/photos_act_book/dakar/renaissance-01.jpg' },

  { id:'goree-halfday', title:'Île de Gorée — Demi-journée', subtitle:'Mémoire de la traite',
    kind:'half', start:'dakar', days:1, nights:0, priceXOF:null, tone:'terre', mood:'horizon',
    schedule:'9h00 → 12h30  ou  14h00 → 17h00',
    short:"Traversée en ferry depuis le Port de Dakar. Inscrite au patrimoine mondial UNESCO en 1978, Gorée porte la mémoire de 300 ans de traite. Visite de la Maison des Esclaves avec conférence du conservateur, Porte du Sans-Retour, Mémorial aux Martyrs, fort et musée. Rencontre avec les habitants et soutien aux artisans.",
    types:['culture','diaspora'], destIds:['goree'], popularity:98,
    img:'images_du_senegal/photos_act_book/goree/porte-retour-01.jpg' },

  { id:'keur-moussa-halfday', title:'Keur Moussa — Demi-journée', subtitle:'Messe aux koras (dimanches)',
    kind:'half', start:'dakar', days:1, nights:0, priceXOF:null, tone:'sand', mood:'horizon',
    schedule:'Dimanches uniquement · 9h00 → 12h00',
    short:"Trajet de 25 km depuis Dakar à travers les Niayes, ceinture maraîchère. Messe dominicale au monastère bénédictin de Keur Moussa accompagnée d'instruments traditionnels africains — koras, balafons, tam-tams doux. Moment de communion intense.",
    types:['culture'], destIds:['dakar'], popularity:75,
    img:'images_du_senegal/photos_act_book/culture/ceremonie-01.jpg' },

  { id:'arts-halfday', title:'Arts d\'Afrique de l\'Ouest — Demi-journée', subtitle:'Musée IFAN et galeries',
    kind:'half', start:'dakar', days:1, nights:0, priceXOF:null, tone:'ocre', mood:'portrait',
    schedule:'9h00 → 13h00',
    short:"Avec un spécialiste sénégalais des arts : visite approfondie du Musée IFAN et de sa collection d'arts d'Afrique de l'Ouest, Galerie Nationale des Arts (peintures modernes sénégalaises), peintres sous verre dans la rue, galeries de peinture sur sable, et Village des Arts à la rencontre des artistes dans leurs ateliers.",
    types:['culture'], destIds:['dakar'], popularity:78,
    img:'images_du_senegal/photos_act_book/artisanat/peintures-01.jpg' },

  { id:'cayar-halfday', title:'Cayar — Demi-journée', subtitle:'Village de pêcheurs',
    kind:'half', start:'dakar', days:1, nights:0, priceXOF:null, tone:'atlant', mood:'water',
    schedule:'14h30 → 18h00',
    short:"À 65 km de Dakar, le village de pêche de Cayar : observation de la grande pêche, des centaines de pêcheurs déchargeant leurs pirogues colorées. Spectacle du marché qui se forme sur la plage entre pêcheurs et revendeuses — festival de sons et de couleurs.",
    types:['nature','culture'], destIds:['dakar'], popularity:80,
    img:'images_du_senegal/photos_act_book/saint-louis/pirogues-01.jpg' },

  { id:'lac-rose-halfday', title:'Lac Rose — Demi-journée', subtitle:'Sel et dunes blanches',
    kind:'half', start:'dakar', days:1, nights:0, priceXOF:null, tone:'rose', mood:'water',
    schedule:'9h00 → 12h30  ou  14h00 → 18h00',
    short:"Le Lac Rose (Retba), un des phénomènes naturels les plus rares au monde. Reflets roses du lac dus aux micro-organismes et à la forte salinité, sur fond de dunes de sable blanc. Rencontre avec les ramasseurs de sel et les villages peuls environnants.",
    types:['nature','famille'], destIds:['lac-rose'], popularity:96,
    img:'images_du_senegal/photos_act_book/lac-rose/sel-femmes-01.jpg' },

  // ---- FULL-DAY (7) — déjeuner inclus ----
  { id:'ethnicity-fullday', title:'Ethnies du Sénégal — Journée', subtitle:'Rufisque, Thiès, Saly',
    kind:'full', start:'dakar', days:1, nights:0, priceXOF:null, tone:'terre', mood:'portrait',
    schedule:'9h00 → 17h00  (déjeuner inclus)',
    short:"Vieille ville de Rufisque, ruelles bordées de maisons à balcons en fer forgé. Villages des différentes ethnies du Sénégal, mosaïque de cultures. Troupeaux de bovins à longues cornes gardés par les bergers peuls semi-nomades. Marché coloré de Thiès, Manufacture des Tapisseries d'Art, déjeuner sur la plage de Saly.",
    types:['culture','nature'], destIds:['dakar'], popularity:82,
    img:'images_du_senegal/photos_act_book/portrait/bassari-femme-01.jpg' },

  { id:'lac-rose-cayar-fullday', title:'Lac Rose & Cayar — Journée', subtitle:'Sel, pêcheurs, marchés',
    kind:'full', start:'dakar', days:1, nights:0, priceXOF:null, tone:'rose', mood:'water',
    schedule:'9h00 → 17h00  (déjeuner inclus)',
    short:"Journée complète Lac Rose puis village de pêche de Cayar. Visite des villages peuls et rencontre avec la communauté locale. Déjeuner dans un restaurant local. Arrivée animée des bateaux de pêche au gros à Cayar, négociation entre pêcheurs et revendeuses sur la plage transformée en marché.",
    types:['nature','culture','famille'], destIds:['lac-rose','dakar'], popularity:88,
    img:'images_du_senegal/photos_act_book/lac-rose/tas-sel-01.jpg' },

  { id:'dakar-goree-fullday', title:'Dakar & Gorée — Journée', subtitle:'Capitale + île mémoire',
    kind:'full', start:'dakar', days:1, nights:0, priceXOF:null, tone:'terre', mood:'horizon',
    schedule:'9h00 → 17h00  (déjeuner inclus)',
    short:"Matinée consacrée à la visite de la capitale Dakar, déjeuner, puis traversée et visite de Gorée — la combinaison des deux demi-journées en une journée pleine.",
    types:['culture','diaspora','famille'], destIds:['dakar','goree'], popularity:95,
    img:'images_du_senegal/photos_act_book/goree/maisons-01.jpg' },

  { id:'saloum-joal-fullday', title:'Saloum & Joal — Journée', subtitle:'Îles UNESCO + cimetière des coquillages',
    kind:'full', start:'dakar', days:1, nights:0, priceXOF:null, tone:'atlant', mood:'water',
    schedule:'7h00 → 18h00  (déjeuner inclus)',
    short:"Départ matinal de Dakar pour les Îles du Saloum (UNESCO 2011). Palmeraie de Fumela, villages sérères traditionnels. À Ndangane, pirogues à moteur dans le delta — ornithologie, villages de pêcheurs, bolongs. Déjeuner à Ndangane, puis Joal-Fadiouth (cimetière marin sérère et greniers sur pilotis) et marché animé de Mbour.",
    types:['nature','culture','famille'], destIds:['saloum','dakar'], popularity:90,
    img:'images_du_senegal/photos_act_book/saloum/cases-pilotis-01.jpg' },

  { id:'saloum-islands-fullday', title:'Îles du Saloum — Journée', subtitle:'Mar Lodj, Dionewar, Niominka',
    kind:'full', start:'dakar', days:1, nights:0, priceXOF:null, tone:'forest', mood:'water',
    schedule:'7h00 → 18h00  (déjeuner inclus)',
    short:"Forêt de baobabs de Sindia, villages wolof et peuls. Pirogues à moteur depuis Ndangane vers la réserve naturelle — village de pêche Niominka, île de Dionewar et sa mosquée pittoresque, rencontre avec le chef et l'imam. Village de Mar Lodj (1500 habitants), tolérance religieuse exemplaire, ancien tambour sacré.",
    types:['nature','culture'], destIds:['saloum'], popularity:86,
    img:'images_du_senegal/photos_act_book/saloum/ile-palmiers-01.jpg' },

  { id:'touba-fullday', title:'Touba — Journée', subtitle:'Pèlerinage mouride',
    kind:'full', start:'dakar', days:1, nights:0, priceXOF:null, tone:'sand', mood:'horizon',
    schedule:'8h00 → 19h00  (déjeuner inclus)',
    short:"Touba, la plus célèbre destination de pèlerinage musulman d'Afrique de l'Ouest. Fondée par Cheikh Ahmadou Bamba, elle est devenue en 25 ans plus prospère que toute autre région. Mosquée somptueuse décorée d'or, d'argent et de cristal. Accueil par un Serigne (guide spirituel), déjeuner traditionnel chez un leader mouride, rencontre avec les Baye Fall.",
    types:['culture'], destIds:['dakar'], popularity:78,
    img:'images_du_senegal/photos_act_book/touba/mosquee-01.jpg' },

  { id:'arts-fullday', title:'Arts d\'Afrique de l\'Ouest — Journée', subtitle:'IFAN + Thiès + tapisseries',
    kind:'full', start:'dakar', days:1, nights:0, priceXOF:null, tone:'ocre', mood:'portrait',
    schedule:'9h00 → 17h00  (déjeuner inclus)',
    short:"Expérience complète avec un Professeur sénégalais spécialiste des arts africains. Musée IFAN — collections de Guinée-Bissau, Mali, Guinée-Conakry, Nigeria, Bénin, Sénégal. Galerie Nationale des Arts (peintures contemporaines), galerie privée Kenboury. Déjeuner sénégalais à Thiès puis Manufacture Nationale des Tapisseries d'Art.",
    types:['culture'], destIds:['dakar'], popularity:75,
    img:'images_du_senegal/photos_act_book/artisanat/tissus-01.jpg' },

  // ---- EXCURSIONS AU DEPART DE SALY (10) reçues de ACT le 1er juillet 2026 ----
  { id:'saly-guerisseurs-halfday', title:'Guérisseurs & pharmacopée traditionnelle', subtitle:'Médecine grand-mère',
    kind:'half', start:'saly', days:1, nights:0, priceXOF:null, tone:'forest', mood:'leaves',
    schedule:'9h00 → 12h30',
    short:"Départ de l'hôtel, visite de marchés exclusivement réservés à la pharmacopée traditionnelle (médecine grand-mère). Avec l'assistance de tradipraticien(nes) renommés, découverte des variétés de plantes utilisées en phytothérapie.",
    types:['culture'], destIds:['dakar'], popularity:70,
    img:'images_du_senegal/photos_act_book/village/case-01.jpg' },

  { id:'saly-bandia-halfday', title:'Réserve de Bandia — Safari', subtitle:'Antilopes, buffles, rhinocéros blanc',
    kind:'half', start:'saly', days:1, nights:0, priceXOF:null, tone:'ocre', mood:'horizon',
    schedule:'Matinée · safari 1h30',
    short:"Départ après petit-déjeuner à travers la forêt de baobabs de Sindia jusqu'à la réserve de Bandia. Safari en véhicule 4x4 avec guide spécialiste de la faune : antilopes-chevaux, buffles, crocodiles, phacochères, singes, girafes, rhinocéros blanc, gazelles, oiseaux.",
    types:['nature','famille'], destIds:['saloum'], popularity:92,
    img:'images_du_senegal/photos_act_book/bandia/girafe-zebres-01.jpg' },

  { id:'saly-brousse-cayar-fullday', title:'Brousse & Cayar', subtitle:'Thiès, tapisseries, pêcheurs',
    kind:'full', start:'saly', days:1, nights:0, priceXOF:null, tone:'atlant', mood:'water',
    schedule:'Journée complète  (déjeuner inclus)',
    short:"Traversée de la forêt de Bandia jusqu'à Thiès. Visite de la Manufacture Nationale des Arts Décoratifs (tapisseries d'art), du marché de Thiès (herbes médicinales, tissus). Déjeuner typique. Après-midi à Cayar : arrivée des pirogues multicolores, marché animé sur la plage.",
    types:['culture','nature'], destIds:['dakar','saloum'], popularity:85,
    img:'images_du_senegal/photos_act_book/artisanat/tissus-01.jpg' },

  { id:'saly-lac-rose-fullday', title:'Lac Rose — Journée', subtitle:'4x4, Paris-Dakar, village peulh',
    kind:'full', start:'saly', days:1, nights:0, priceXOF:null, tone:'rose', mood:'water',
    schedule:'Départ 9h00  (déjeuner inclus)',
    short:"Traversée de Sindia, Diamniadio et de plusieurs villages wolof et sérères. Arrivée au Lac Rose, excursion en tout-terrain sur les traces du Rallye Paris-Dakar. Randonnée sur les dunes, ramassage du sel avec les exploitants, village peulh, plage sauvage. Déjeuner au campement du Lac.",
    types:['nature','famille','culture'], destIds:['lac-rose'], popularity:90,
    img:'images_du_senegal/photos_act_book/lac-rose/pirogue-rose-01.jpg' },

  { id:'saly-lac-rose-halfday', title:'Lac Rose — Demi-journée', subtitle:'4x4 et rafraîchissement',
    kind:'half', start:'saly', days:1, nights:0, priceXOF:null, tone:'rose', mood:'water',
    schedule:'Matinée',
    short:"Traversée de Sindia, Nguekhokh, Diamniadio, villages wolof et sérères. Arrivée au Lac Rose, excursion en tout-terrain sur les traces du Rallye Paris-Dakar. Boisson rafraîchissante autour du Lac avant retour à l'hôtel.",
    types:['nature','famille'], destIds:['lac-rose'], popularity:83,
    img:'images_du_senegal/photos_act_book/lac-rose/sel-femmes-01.jpg' },

  { id:'saly-keur-moussa-halfday', title:'Messe à Keur Moussa', subtitle:'Bénédictins et kora',
    kind:'half', start:'saly', days:1, nights:0, priceXOF:null, tone:'sand', mood:'horizon',
    schedule:'Dimanches · 9h00 → 12h00',
    short:"Départ vers le village sérère de Keur Moussa dans les Niayes. Messe dominicale à l'africaine au couvent bénédictin : cantiques africains au lieu des chants grégoriens, prêtres en parements africains, rythmes de kora, balafon et djembés accompagnant les chœurs. Moment de communion intense.",
    types:['culture'], destIds:['dakar'], popularity:77,
    img:'images_du_senegal/photos_act_book/culture/ceremonie-01.jpg' },

  { id:'saly-somone-halfday', title:'Lagune de Somone', subtitle:'Écologie, ostréiculture, oiseaux',
    kind:'half', start:'saly', days:1, nights:0, priceXOF:null, tone:'atlant', mood:'water',
    schedule:'8h30 → 12h30',
    short:"Départ de l'hôtel vers le village lébou de la Somone (15 km). Trekking de 2 km à travers le chantier écologique au cœur de la réserve naturelle (oiseaux aquatiques). Balade en pirogue : mulets, tilapias, crabes, carpes. Rencontre avec une coopérative féminine active dans l'ostréiculture.",
    types:['nature'], destIds:['saloum'], popularity:87,
    img:'images_du_senegal/photos_act_book/saloum/mangrove-01.jpg' },

  { id:'saly-dakar-goree-fullday', title:'Dakar & Gorée depuis Saly', subtitle:'Renaissance + Maison des Esclaves',
    kind:'full', start:'saly', days:1, nights:0, priceXOF:null, tone:'terre', mood:'city',
    schedule:'7h30 → 18h30  (déjeuner inclus)',
    short:"Route par Sindia et Diamniadio jusqu'à Dakar. Monument de la Renaissance Africaine, Almadies, Corniche Ouest, Université Cheikh Anta Diop, Porte du Millénaire, Médina, centre administratif (Assemblée, Palais présidentiel, place de l'Indépendance), Soumbédioune, marché Kermel. 12h30 ferry pour Gorée : Maison des Esclaves, IFAN, église Saint-Charles Borromée, fort du Castel. Musée des Civilisations Noires au retour.",
    types:['culture','diaspora'], destIds:['dakar','goree'], popularity:95,
    img:'images_du_senegal/photos_act_book/goree/porte-retour-01.jpg' },

  { id:'saly-cuisine-halfday', title:'Cours de cuisine sénégalaise', subtitle:'Yassa poulet ou poisson',
    kind:'half', start:'saly', days:1, nights:0, priceXOF:null, tone:'terre', mood:'portrait',
    schedule:'9h00 → 13h00  (déjeuner inclus)',
    short:"Cours de préparation d'un plat emblématique : Yassa Poulet ou Yassa Poisson. Rencontre avec le chef sénégalais et ses assistants, présentation des ingrédients, processus de préparation. Dégustation du plat préparé (jus locaux et softs inclus).",
    types:['culture','famille'], destIds:['dakar'], popularity:80,
    img:'images_du_senegal/photos_act_book/gastronomie/thieboudienne-01.jpg' },

  { id:'saly-saloum-joal-fullday', title:'Îles du Saloum & Joal-Fadiouth', subtitle:'Pirogue, mangrove, coquillages',
    kind:'full', start:'saly', days:1, nights:0, priceXOF:null, tone:'atlant', mood:'water',
    schedule:'Départ matinal  (déjeuner inclus)',
    short:"Traversée des villages sérères de la Petite Côte. À Ndangane, embarquement en pirogue motorisée : îles aux oiseaux, mangrove, bancs d'huîtres, pêcheurs niominka. Apéro sur une île déserte. Après-midi à Joal-Fadiouth : île aux coquillages, greniers à mil sur pilotis, cimetière aux coquillages, séchoirs à poissons.",
    types:['nature','culture'], destIds:['saloum'], popularity:91,
    img:'images_du_senegal/photos_act_book/saloum/cases-pilotis-01.jpg' },
];

// === ATELIERS (page dédiée) ================================================
// Ateliers d'artisanat, d'art, de musique et de danse proposés par ACT.
// Source : Nos ateliers.docx (juillet 2026). Tous d'une journée.
// Structure minimale : id, title, subtitle, category, short, img, tone, mood.
const ATELIERS = [
  { id:'tableaux-sable', title:'Tableaux de sable', subtitle:"Journée d'initiation",
    category:'artisanat', priceXOF:null, tone:'ocre', mood:'horizon',
    short:"Initiation à l'art traditionnel sénégalais du tableau de sable coloré. Apprentissage des techniques auprès d'un artiste local — composition, choix des sables, application. Chaque participant repart avec son œuvre.",
    img:'images_du_senegal/photos_act_book/artisanat/peintures-01.jpg' },

  { id:'batik', title:'Réalisation de Batik', subtitle:'Teinture traditionnelle sur tissu',
    category:'artisanat', priceXOF:null, tone:'terre', mood:'horizon',
    short:"Découverte du batik sénégalais : technique de teinture à la cire sur tissu. Motifs traditionnels, colorants naturels, application progressive. Chaque participant repart avec sa création.",
    img:'images_du_senegal/photos_act_book/artisanat/tissus-01.jpg' },

  { id:'vannerie', title:'Vannerie', subtitle:'Tressage de fibres végétales',
    category:'artisanat', priceXOF:null, tone:'sand', mood:'horizon',
    short:"Journée dédiée au tressage traditionnel : fibres de palmier, jonc, raphia. Apprentissage des motifs et des techniques de vannerie ouest-africaine avec un maître artisan.",
    img:'images_du_senegal/photos_act_book/village/cases-01.jpg' },

  { id:'poterie', title:'Poterie', subtitle:'Modelage et cuisson traditionnels',
    category:'artisanat', priceXOF:null, tone:'terre', mood:'portrait',
    short:"Découverte de la poterie sénégalaise : préparation de l'argile, modelage à la main, décoration au colombin, cuisson traditionnelle. Chaque participant réalise sa pièce.",
    img:'images_du_senegal/photos_act_book/village/case-01.jpg' },

  { id:'tableaux-sous-verre', title:'Tableaux sous verre', subtitle:'Art populaire sénégalais',
    category:'artisanat', priceXOF:null, tone:'dusk', mood:'portrait',
    short:"Technique emblématique de l'art populaire sénégalais : peinture inversée sur verre. Composition, dessin, colorisation. Œuvre finale à emporter.",
    img:'images_du_senegal/photos_act_book/artisanat/peintures-01.jpg' },

  { id:'djembe', title:'Percussion Djembé', subtitle:"Rythmes d'Afrique de l'Ouest",
    category:'musique', priceXOF:null, tone:'ocre', mood:'portrait',
    short:"Initiation au djembé, tambour emblématique. Apprentissage des rythmes de base et des rythmes traditionnels sénégalais avec un maître percussionniste. Séance collective en fin de journée.",
    img:'images_du_senegal/photos_act_book/culture/dignitaire-01.jpg' },

  { id:'balafon', title:'Balafon', subtitle:'Xylophone traditionnel mandingue',
    category:'musique', priceXOF:null, tone:'sand', mood:'portrait',
    short:"Découverte du balafon, xylophone en bois et calebasses. Fabrication, accordage, techniques de jeu. Apprentissage de mélodies traditionnelles mandingues.",
    img:'images_du_senegal/photos_act_book/portrait/homme-age-01.jpg' },

  { id:'kora', title:'Kora', subtitle:'Harpe-luth des griots',
    category:'musique', priceXOF:null, tone:'terre', mood:'portrait',
    short:"Instrument mythique des griots d'Afrique de l'Ouest, la kora possède 21 cordes. Initiation aux techniques de base, découverte du répertoire traditionnel avec un maître musicien.",
    img:'images_du_senegal/photos_act_book/dakar/statue-kora-01.jpg' },

  { id:'danse', title:'Danses du Sénégal', subtitle:'Sabar, Yela, danses traditionnelles',
    category:'danse', priceXOF:null, tone:'terre', mood:'portrait',
    short:"Initiation aux danses traditionnelles sénégalaises : sabar wolof, yela peul, mouvements diola. Cours avec un maître-danseur, accompagnement percussions live.",
    img:'images_du_senegal/photos_act_book/culture/femmes-traditionnelles-01.jpg' },
];

// === CROISIÈRES (page dédiée — texte reçu d'ACT le 1er juillet 2026) =========
// ACT met à disposition des compagnies de croisière des excursions dédiées,
// des tours Pre/Post croisière, des guides multilingues expérimentés, une
// assistance PMR, et un parc de transport aux normes de confort et sécurité.
// Le tableau CROISIERES reste vide : la page affiche le texte descriptif
// (via i18n) + un CTA WhatsApp pour les demandes.
const CROISIERES = [];

// === TESTIMONIALS (home) ====================================================
const TESTIMONIALS = [
  { name:'Aïssatou D.', from:'Brooklyn, NY', circuit:'Gorée · Lac Rose · Saloum', stars:5,
    text:'Le retour à Gorée avec Mamadou comme guide — j’ai pleuré, ri, mangé du poisson grillé sur la plage. Un voyage qui change quelque chose en vous.',
    tone:'terre', mood:'portrait' },
  { name:'Julien & Claire', from:'Lyon, France', circuit:'Lompoul & Saint-Louis', stars:5,
    text:'Tout était organisé sans que ça sente le "pack touriste". On a vraiment l’impression d’avoir voyagé avec un ami sénégalais.',
    tone:'ocre', mood:'portrait' },
  { name:'Mor Talla S.', from:'Dakar, week-end', circuit:'Excursion Lac Rose', stars:5,
    text:'Réservé un samedi matin sur WhatsApp, partis à 9h. Prix clair en FCFA, paiement Wave, zéro mauvaise surprise. À refaire.',
    tone:'sand', mood:'portrait' },
];

// === Tour-specific reviews ==================================================
const TOUR_REVIEWS = [
  { name:'Aïssatou D.',     stars:5, date:'mars 2026', text:'Mamadou nous a accueillis à l’aéroport à 23h, sans broncher. Le lendemain à Gorée, il a marché avec ma mère à son rythme. Le delta du Saloum en pirogue au coucher du soleil — inoubliable.' },
  { name:'Hannah & Tom',    stars:5, date:'janvier 2026', text:'We loved that nothing felt scripted. Local lunch in a Saloum village, real conversations, real people. Worth every CFA.' },
  { name:'Famille Ndiaye',  stars:5, date:'décembre 2025', text:'Nos enfants (8 et 11 ans) ont adoré. Tout était pensé pour eux aussi — pause baignade au Lac Rose, jeu de carte à l’hôtel.' },
  { name:'Sofia M.',        stars:4, date:'novembre 2025', text:'Excellent dans l’ensemble. La route Dakar-Saloum est longue, prévoyez audio-livres. Le reste : parfait.' },
];

// === BLOG ===================================================================
const BLOG = [
  { id:'wave-om', title:'Payer Wave, Orange Money ou carte : comment ça marche pour les voyageurs',
    cat:'pratique', tag:'Conseils pratiques',
    excerpt:'On vous explique en 3 min comment fonctionne le paiement mobile au Sénégal, et pourquoi ça change tout pour les voyageurs.',
    tone:'sand', mood:'horizon', readTime:'4 min', date:'12 avril 2026',
    img: IMG('Dakar', 3),
    author:{ name:'Awa Sow', role:'Responsable expérience client' },
    body:[
      { type:'lead', html:'<strong>Wave, Orange Money, Free Money, virement, carte bancaire</strong> — autant d’options qu’il faut parfois quelques minutes pour démêler. Voici ce qu’on explique à nos voyageurs avant chaque réservation.' },
      { type:'p', html:'Notre standard chez ACT est simple : prix en FCFA, conversion indicative en EUR/USD, paiement dans la devise et le canal de votre choix. Aucun supplément quel que soit le moyen retenu.' },
      { type:'h2', text:'Wave — le réflexe local' },
      { type:'p', html:'Wave est devenu en 2020 le moyen de paiement par défaut au Sénégal. Application gratuite, transferts gratuits entre particuliers, paiement aux commerçants en scannant un QR. Pour un voyageur, c’est l’option la plus rapide une fois la SIM locale activée.' },
      { type:'ul', items:[
        'Téléchargez l’application Wave (iOS / Android) à votre arrivée.',
        'Créez un compte avec votre numéro local (la SIM Orange qu’on vous offre fonctionne).',
        'Alimentez via votre carte ou auprès d’un point Wave — il y en a partout.',
        'Payez ACT en scannant notre QR ou via notre numéro WhatsApp.',
      ]},
      { type:'h2', text:'Orange Money — l’alternative historique' },
      { type:'p', html:'Le précurseur. Plus institutionnel, frais légèrement supérieurs, mais accepté absolument partout (y compris dans les petits villages où Wave ne couvre pas toujours). Si vous voyagez en zone rurale, c’est le filet de sécurité.' },
      { type:'h2', text:'Carte bancaire et virement — pour la diaspora et les étrangers' },
      { type:'p', html:'Visa et Mastercard via Stripe, virement bancaire international (SEPA pour l’UE), espèces en EUR ou USD à l’arrivée. Délai virement : 2-3 jours ouvrés. Pour celles et ceux qui préfèrent garder leur banque habituelle, c’est l’option la plus simple — surtout pour l’acompte (traçable, remboursable).' },
      { type:'callout', title:'Acompte et solde', html:'Un acompte de <strong>30 %</strong> confirme la réservation. Le solde est dû au plus tard <strong>7 jours avant le départ</strong>. Vous pouvez régler chaque tranche par un canal différent — acompte par carte, solde par Wave par exemple.' },
      { type:'h2', text:'Notre conseil de terrain' },
      { type:'p', html:'Si vous résidez au Sénégal : Wave d’abord. Si vous arrivez de l’étranger : carte pour l’acompte, puis Wave une fois sur place pour les extras. Toutes les options sont détaillées sur notre <a href="#/faq">page FAQ</a>.' },
    ] },
  { id:'meilleure-saison', title:'Quelle saison pour visiter le Sénégal ? Le vrai guide mois par mois',
    cat:'saisons', tag:'Saisons & météo',
    excerpt:'Saison sèche, harmattan, hivernage — un calendrier honnête pour choisir le bon mois selon ce que vous voulez vivre.',
    tone:'ocre', mood:'dunes', readTime:'7 min', date:'28 mars 2026',
    img: IMG('Désert de Lompoul', 3),
    author:{ name:'Mamadou Diop', role:'Guide & co-fondateur' },
    body:[
      { type:'lead', html:'<strong>"Quand venir au Sénégal ?"</strong> est de loin la question la plus posée. La réponse honnête : ça dépend de ce que vous cherchez. Voici notre calendrier mois par mois, sans enrobage.' },
      { type:'p', html:'Le Sénégal a deux saisons franches : la saison sèche (novembre à mai) et l’hivernage — la saison des pluies (juin à octobre). Tout le reste est nuance.' },
      { type:'h2', text:'Novembre à mai — la saison sèche' },
      { type:'p', html:'Températures entre 22 et 30°C en moyenne, ciel bleu quasi constant, pas de pluie, humidité basse. C’est la "haute saison touristique" — paysages secs, soleil franc, idéal pour les circuits longs.' },
      { type:'ul', items:[
        '<strong>Novembre - Décembre</strong> : nuits fraîches (15-18°C dans le nord), parfait pour le désert de Lompoul.',
        '<strong>Janvier - Février</strong> : sec, frais, plages idéales. Notre saison favorite.',
        '<strong>Mars - Avril</strong> : la chaleur monte, parfait pour la Casamance et le Saloum.',
        '<strong>Mai</strong> : transition — encore sec mais chaud (35°C+ à l’intérieur des terres).',
      ]},
      { type:'h2', text:'Juin à octobre — l’hivernage' },
      { type:'p', html:'La saison qu’on déconseille rarement aux voyageurs, parce qu’elle est sublime. Paysages d’un vert intense, baobabs feuillus, rivières gonflées. Pluies courtes mais drues (1-2h max, généralement l’après-midi). Moins de touristes, prix plus doux.' },
      { type:'p', html:'<strong>Septembre-octobre</strong> est notre période préférée pour la Casamance — verdure maximale, oiseaux migrateurs au Djoudj, lumière d’or sur le delta.' },
      { type:'quote', text:'"Le meilleur mois pour visiter le Sénégal ? Celui où vous pouvez venir." — Mamadou' },
      { type:'callout', title:'Fêtes mobiles', html:'<strong>Tabaski</strong> et <strong>Korité</strong> suivent le calendrier lunaire islamique — dates qui glissent chaque année. Vérifiez avant de réserver : ce sont de très beaux moments à vivre en famille locale, mais les commerces ferment et les transports se remplissent.' },
      { type:'h2', text:'À choisir selon votre envie' },
      { type:'p', html:'Plages et baignade → janvier-mars. Désert de Lompoul → novembre-février. Casamance verte → août-octobre. Photographie animalière au Djoudj → décembre-mars. Climat le plus doux pour les aînés → janvier-février.' },
      { type:'p', html:'Tous nos circuits sont disponibles toute l’année avec ajustement saisonnier. <a href="#/contact">Écrivez-nous</a> pour qu’on cale le bon mois selon votre projet.' },
    ] },
  { id:'goree-emotion', title:'Préparer sa visite de Gorée : ce que personne ne vous dit',
    cat:'destinations', tag:'Destinations',
    excerpt:'Au-delà de la Maison des Esclaves : les ruelles, les artistes, les femmes qui cuisinent le thieboudienne du midi.',
    tone:'terre', mood:'city', readTime:'6 min', date:'4 mars 2026', featured:true,
    img: IMG('Ile de gorée', 4),
    author:{ name:'Mamadou Diop', role:'Guide & co-fondateur' },
    body:[
      { type:'lead', html:'<strong>Gorée n’est pas une étape, c’est un moment.</strong> Vingt minutes de ferry depuis Dakar, plusieurs siècles d’histoire dans les pierres. Voici ce qu’on essaye de transmettre à chaque voyageur — sans détour.' },
      { type:'p', html:'La plupart des guides papier vous parlent de Gorée comme d’une étape historique. C’est vrai. Mais Gorée est aussi une île habitée : pêcheurs au petit matin, femmes qui cuisinent le thieboudienne du midi, peintres dont les ateliers donnent sur l’eau. La visite que nous proposons commence par cette vie quotidienne avant de basculer dans la mémoire.' },
      { type:'h2', text:'Ce que personne ne vous dit avant d’y aller' },
      { type:'p', html:'Sur l’île, pas de voiture. C’est silencieux. Profitez-en. Le ferry arrive toutes les heures depuis le terminal de Dakar (Port Embarcadère) — comptez 20 minutes de traversée, juste le temps de voir Gorée prendre forme à l’horizon.' },
      { type:'h3', text:'Trois choses à savoir' },
      { type:'ul', items:[
        'La <strong>Maison des Esclaves</strong> est gérée par des conservateurs ; nos guides échangent toujours avec eux avant la visite pour adapter le moment selon l’émotion du groupe.',
        'Le musée de la Femme et la galerie Boubacar Joseph Ndiaye méritent aussi le détour — ils complètent la lecture de l’île.',
        'Les ruelles à l’écart du circuit principal sont les plus belles. Demandez à votre guide de vous y emmener.',
      ]},
      { type:'quote', text:'"On marche dans Gorée comme on marche dans une cathédrale. Sans bruit, le temps qu’il faut, et on en sort transformés."' },
      { type:'h2', text:'La Maison des Esclaves — s’y préparer émotionnellement' },
      { type:'p', html:'Ce n’est pas un musée comme les autres. Les visiteurs y arrivent souvent avec des attentes, des questions, parfois des larmes prêtes. Nos guides connaissent ce moment ; ils ne le commentent pas, ils l’accompagnent. Vous pouvez prendre votre temps, vous asseoir dans la cour, revenir plus tard si nécessaire.' },
      { type:'callout', title:'Bon à savoir', html:'Le ticket de ferry s’achète au terminal de Dakar : environ <strong>5 200 FCFA</strong> aller-retour pour les non-résidents, <strong>1 500 FCFA</strong> pour les Sénégalais. Nous le fournissons dans tous nos circuits intégrant Gorée.' },
      { type:'h2', text:'Demi-journée ou journée entière ?' },
      { type:'p', html:'Contre-intuitivement, on déconseille la "journée Gorée + retour Dakar" en une seule traite. Notre formule favorite : matinée sur l’île (musée + Maison des Esclaves), déjeuner sur place chez Mama Aïssata, sieste sous un baobab, retour en fin d’après-midi quand la lumière dorée fait ressortir les couleurs des maisons.' },
      { type:'h2', text:'Pour aller plus loin' },
      { type:'p', html:'Si Gorée vous touche, notre circuit <a href="#/tour/diaspora-essentiel">Retour aux sources</a> approfondit la dimension mémorielle sur 5 jours, avec rencontres d’historien·ne·s et cérémonie d’accueil traditionnelle. Pour les voyageurs qui veulent simplement passer une journée — l’<a href="#/tour/excursion-goree">Excursion Gorée</a> reste notre formule la plus demandée.' },
    ] },
  { id:'dakar-48h', title:'Que faire à Dakar en 48h sans courir partout',
    cat:'dakar', tag:'Dakar',
    excerpt:'Notre itinéraire en 48h qui mélange Médina, Almadies, art contemporain et thé à la menthe au bord de l’océan.',
    tone:'dusk', mood:'city', readTime:'8 min', date:'21 février 2026',
    img: IMG('Dakar', 4),
    author:{ name:'Aminata Ba', role:'Guide Dakar' },
    body:[
      { type:'lead', html:'<strong>Dakar mérite plus que 48 heures.</strong> Mais 48 heures, c’est souvent ce qu’on a — entre deux vols, en escale, ou en week-end. Voici notre itinéraire condensé pour ne rien rater, sans courir partout.' },
      { type:'p', html:'Le pari : voir Gorée, sentir la Médina, dîner aux Almadies, et garder l’envie de revenir.' },
      { type:'h2', text:'Jour 1 — Matin : Médina & Soumbedioune' },
      { type:'p', html:'Le marché HLM dès 9h pour les tissus et la vie de quartier. Café à l’arrache dans une "tangana" (gargote). Vers midi, descente au village artisanal de Soumbedioune, juste au bord de l’océan. C’est là que les artisans vendent — bijoux, masques, boubous brodés. Marchandage attendu et bienvenu.' },
      { type:'h2', text:'Jour 1 — Après-midi et soir : Almadies & corniche' },
      { type:'p', html:'Sieste, puis Almadies pour la fin d’après-midi : plage du Virage, restos pieds dans le sable, coucher de soleil sur la pointe la plus à l’ouest de l’Afrique. Le soir, sortie musicale possible — le Just4U (Sacré-Cœur) programme du mbalax et du jazz tous les week-ends.' },
      { type:'h2', text:'Jour 2 — Matin : Gorée (incontournable)' },
      { type:'p', html:'Ferry de 9h depuis le Port Embarcadère. Trois heures sur l’île suffisent pour l’essentiel (Maison des Esclaves, ruelles, déjeuner créole sur place). Retour à Dakar vers 14h. Si Gorée vous appelle plus fort, prolongez — voir notre <a href="#/blog/goree-emotion">guide spécifique</a>.' },
      { type:'h2', text:'Jour 2 — Après-midi : Renaissance & Île N’Gor' },
      { type:'p', html:'Monument de la Renaissance africaine pour la vue panoramique. Puis traversée à l’Île N’Gor en pirogue (15 minutes, 500 FCFA aller-retour). L’île est minuscule, calme, parfaite pour un dernier bain et un déjeuner sur la plage avant le départ.' },
      { type:'callout', title:'Transports', html:'En ville, utilisez <strong>Yango</strong> ou <strong>Bolt</strong> — équivalents locaux d’Uber, paiement Wave ou cash. Évitez les taxis sans compteur (négociation systématique). Pour Gorée et N’Gor, ce sont des ferrys et pirogues à billet.' },
      { type:'h2', text:'Quoi manger, quoi boire' },
      { type:'ul', items:[
        '<strong>Chez Loutcha</strong> (Médina) — le meilleur thieboudienne de Dakar.',
        '<strong>La Calebasse</strong> (Mermoz) — yassa poulet, cadre soigné, terrasse.',
        '<strong>Le Lagon 1</strong> (Almadies) — poisson grillé pieds dans l’eau.',
        '<strong>Café Touba</strong> (partout) — le café aux épices, à goûter au moins une fois.',
        '<strong>Bissap</strong> — l’infusion d’hibiscus glacée, rouge intense, partout.',
      ]},
      { type:'p', html:'Restez deux jours, gardez l’envie. Notre <a href="#/tour/dakar-essentiel">excursion Dakar essentiel</a> compresse tout ça avec un guide dakarois en une seule journée si vous voulez la version balisée.' },
    ] },
  { id:'casamance-sentiers', title:'Casamance hors des sentiers battus — 5 villages à découvrir',
    cat:'destinations', tag:'Destinations',
    excerpt:'Cinq villages où s’arrêter une journée pour rencontrer le Sénégal des bolongs, des fromagers et de l’hospitalité diola.',
    tone:'forest', mood:'leaves', readTime:'9 min', date:'8 février 2026',
    img: IMG('Casamance', 4),
    author:{ name:'Ibrahima Faye', role:'Guide Casamance' },
    body:[
      { type:'lead', html:'<strong>Au sud du Sénégal, un autre pays.</strong> Plus vert, plus calme, plus diolas. La Casamance vit à un autre rythme — et c’est exactement pour ça qu’il faut y aller.' },
      { type:'p', html:'Une heure de vol depuis Dakar (ou douze heures de bateau si vous avez l’aventure dans le sang), et vous arrivez à Ziguinchor — capitale du sud, chef-lieu d’une région à l’histoire singulière. Voici cinq villages où on s’arrête une journée, parce qu’ils valent vraiment plus que ça.' },
      { type:'h2', text:'1. Affiniam — le bolong-village' },
      { type:'p', html:'À une heure de Ziguinchor, posé sur un bras d’eau qui se faufile entre les rizières. On y arrive en pirogue, on y dort dans un campement villageois, on y mange du riz blanc et du poisson fumé. La vraie hospitalité diola, sans mise en scène.' },
      { type:'h2', text:'2. Mlomp — l’architecture qu’on ne montre nulle part' },
      { type:'p', html:'Le village des cases à étage, structures uniques en Afrique de l’Ouest. Construction en argile et en bois local, sur deux niveaux. Le musée villageois est tenu par une association locale — petit, sincère, important.' },
      { type:'h2', text:'3. Diakène-Diola — l’hospitalité' },
      { type:'p', html:'Ici, on ne visite pas le village : on y est accueilli. Une famille hôte vous reçoit, partage son repas, vous raconte les saisons. C’est l’une de nos formules favorites pour les voyageurs qui veulent vraiment entrer dans le quotidien.' },
      { type:'h2', text:'4. Oussouye — le roi sans royaume' },
      { type:'p', html:'Oussouye est le siège d’un royaume traditionnel diola encore actif — le roi (Aï) y règne sans pouvoir politique mais avec un fort rayonnement spirituel. Visite respectueuse, échange possible si organisé à l’avance.' },
      { type:'h2', text:'5. Élinkine — le départ vers Carabane' },
      { type:'p', html:'Petit port de pêche, point de départ en pirogue pour l’île de Carabane (45 minutes). Les bolongs, les mangroves, les hérons. La traversée est aussi belle que l’arrivée.' },
      { type:'quote', text:'"En Casamance, on ne court pas. On marche, on écoute, on s’arrête manger." — Ibrahima' },
      { type:'h2', text:'Comment s’y rendre et combien de temps prévoir' },
      { type:'p', html:'Vol Dakar - Cap Skirring (1h) ou Dakar - Ziguinchor (1h). Voiture privée ensuite. Compter minimum 5 jours pour explorer correctement. Notre <a href="#/tour/casamance-essentielle">circuit Casamance essentielle</a> couvre Cap Skirring + 3 villages sur 7 jours.' },
    ] },
  { id:'diaspora-prepa', title:'Préparer son premier voyage en tant qu’afro-descendant·e',
    cat:'diaspora', tag:'Diaspora',
    excerpt:'Conseils pratiques et émotionnels pour celles et ceux qui rentrent au pays pour la première fois.',
    tone:'terre', mood:'portrait', readTime:'10 min', date:'24 janvier 2026',
    img: IMG('Ile de gorée', 5),
    author:{ name:'Awa Sow', role:'Responsable expérience client' },
    body:[
      { type:'lead', html:'<strong>Rentrer au pays pour la première fois, ce n’est pas un voyage comme les autres.</strong> On a accompagné des dizaines de familles en pèlerinage de mémoire. Chaque retour est unique. Voici ce qu’on prépare ensemble — pratique et émotionnel.' },
      { type:'p', html:'D’abord, une chose à savoir : il n’y a pas de "bonne façon" de revenir. Certain·e·s arrivent avec un projet précis (généalogie, cérémonie, recherche d’ancêtres), d’autres veulent juste poser les pieds. Les deux sont légitimes.' },
      { type:'h2', text:'La préparation émotionnelle — dont on parle peu' },
      { type:'p', html:'Vous allez peut-être pleurer. Ou rire. Ou les deux à dix minutes d’écart. Ce n’est pas une faiblesse — c’est le voyage. Nos guides ont accueilli des voyageurs qui ont marché en silence pendant deux heures dans la Maison des Esclaves, et d’autres qui ont chanté en sortant. Tout est juste.' },
      { type:'quote', text:'"On a marché dans la Maison des Esclaves en silence. Mamadou n’a pas parlé. C’était parfait." — Aïssatou D., Brooklyn' },
      { type:'h2', text:'Les éléments concrets à anticiper' },
      { type:'ul', items:[
        '<strong>Passeport</strong> valable 6 mois après la date de retour.',
        '<strong>Visa</strong> non requis pour la plupart des pays occidentaux (US, Canada, UE) — séjour court touristique.',
        '<strong>Vaccins</strong> : aucun obligatoire sauf fièvre jaune si vous venez d’un pays endémique ; hépatites A/B et typhoïde recommandés.',
        '<strong>Devise</strong> : FCFA. Change facile à l’aéroport ou en ville. Wave activable une fois sur place.',
        '<strong>Téléphone</strong> : SIM Orange offerte pour les circuits de 3 jours et plus.',
      ]},
      { type:'h2', text:'Recherche généalogique — ce qu’on peut faire' },
      { type:'p', html:'Sur demande, partenariats avec chercheurs sénégalais et archives nationales. Délai de 4 à 8 semaines avant le séjour pour préparer. Les résultats varient selon les régions d’origine — la Sénégambie a des registres particulièrement riches.' },
      { type:'h2', text:'La cérémonie d’accueil traditionnelle' },
      { type:'p', html:'Dans plusieurs villages partenaires, on peut organiser une cérémonie d’accueil avec les Anciens : prière, mise en relation symbolique avec la communauté, parfois un nom traditionnel. Ce n’est pas un service touristique — c’est un rituel respecté. À demander quelques semaines à l’avance.' },
      { type:'callout', title:'Voyager avec un parent âgé', html:'Beaucoup de nos voyageurs accompagnent leur père, mère ou grand-parent qui revient au pays. <strong>On adapte tout</strong> : pauses, hôtels, distances, rythme des journées. Dites-nous l’âge et la mobilité, on fait le reste.' },
      { type:'h2', text:'Pour aller plus loin' },
      { type:'p', html:'Notre circuit <a href="#/tour/diaspora-essentiel">Retour aux sources</a> est pensé spécifiquement pour ce voyage : Gorée en profondeur, rencontre généalogique, cérémonie d’accueil, photographe sur tout le séjour. Cinq jours, sur mesure de votre histoire.' },
    ] },
  { id:'cuisine-senegal', title:'Cinq plats sénégalais à goûter absolument (et où les trouver)',
    cat:'culture', tag:'Culture',
    excerpt:'Thieboudienne, yassa, mafé, ceebu jen, soupe kandia — et les adresses où nos guides les commandent eux-mêmes.',
    tone:'ocre', mood:'horizon', readTime:'5 min', date:'10 janvier 2026',
    img: IMG('Dakar', 5),
    author:{ name:'Aminata Ba', role:'Guide Dakar' },
    body:[
      { type:'lead', html:'<strong>Manger au Sénégal, c’est entrer dans les familles, les bolongs, les marchés.</strong> Voici notre top 5 — et les adresses où nos guides eux-mêmes les commandent quand ils ne sont pas en circuit.' },
      { type:'h2', text:'1. Thieboudienne — le plat national' },
      { type:'p', html:'Riz au poisson cuit dans une sauce tomate aux légumes (gombos, manioc, chou, navet, aubergine), avec son poisson farci. Le plat du dimanche, le plat des grandes occasions, le plat dont on se souvient. Sa version "rouge" est la plus traditionnelle.' },
      { type:'h3', text:'Où le manger' },
      { type:'p', html:'<strong>Chez Loutcha</strong> à la Médina (Dakar) — sans hésiter. Préparation lente, poisson frais du jour, ambiance familiale. Arrivez avant 13h, c’est plein en quinze minutes.' },
      { type:'h2', text:'2. Yassa poulet — citronné, fondant' },
      { type:'p', html:'Poulet mariné dans citron + oignon doux + moutarde, longuement mijoté, servi avec riz blanc. Plus léger que le thieb, parfait pour les premiers jours. Existe aussi en yassa poisson (souvent meilleur).' },
      { type:'h3', text:'Où' },
      { type:'p', html:'<strong>La Calebasse</strong> (Mermoz, Dakar) — la version maîtrisée. À Saint-Louis, n’importe quel "fast-food" en bord de fleuve.' },
      { type:'h2', text:'3. Mafé — l’arachide en sauce' },
      { type:'p', html:'Boeuf ou poulet en sauce arachide épaisse, avec tomate, oignon, piment. Riche, réconfortant, terrien. Le plat préféré des soirs frais d’hivernage.' },
      { type:'callout', title:'Allergiques aux arachides', html:'Mafé évidemment à éviter — mais attention aussi à certaines sauces de base qui peuvent contenir de la pâte d’arachide en fond. Prévenez-nous à la réservation, on adapte tous les repas du circuit.' },
      { type:'h2', text:'4. Ceebu jen — la mer dans l’assiette (version saint-louisienne)' },
      { type:'p', html:'Variante du thieboudienne servie particulièrement à Saint-Louis et dans le nord : plus de poissons différents (mulet, capitaine, daurade), légumes plus rustiques, présentation en plat collectif autour duquel on s’assied. Convivialité maximale.' },
      { type:'h2', text:'5. Soupe kandia — feuille de baobab' },
      { type:'p', html:'Plat moins connu des touristes, central dans la cuisine domestique. Feuilles de baobab pilées, gluantes, intensément vertes. Cuisine de mémoire, à goûter au moins une fois — on adore ou on n’aime pas, mais ça se sait vite.' },
      { type:'quote', text:'"Le bon thieboudienne ne se mange pas seul. C’est un plat de famille." — Aminata' },
      { type:'p', html:'À chaque circuit, on cale au moins trois repas signature dans des adresses authentiques. <a href="#/contact">Dites-nous</a> vos préférences (épicé ou non, viande ou poisson, allergies), on ajuste.' },
    ] },
  { id:'enfants-senegal', title:'Voyager au Sénégal avec des enfants : ce qui marche, ce qu’on évite',
    cat:'pratique', tag:'Conseils pratiques',
    excerpt:'Cinq ans d’expérience avec des familles, condensés en 9 conseils concrets.',
    tone:'sand', mood:'horizon', readTime:'6 min', date:'15 décembre 2025',
    img: IMG('Lac Rose', 3),
    author:{ name:'Awa Sow', role:'Responsable expérience client' },
    body:[
      { type:'lead', html:'<strong>Le Sénégal est sûr et accueillant pour les enfants.</strong> Mais l’organisation change. Cinq ans à recevoir des familles, condensés en neuf conseils concrets — appliqués sur tous nos circuits "famille".' },
      { type:'h2', text:'1. Choisir un rythme posé' },
      { type:'p', html:'Pas plus d’un site par jour. Sieste après le déjeuner systématique pour les moins de 8 ans. Les enfants encaissent mal les longues routes — on alterne avec des journées courtes et des journées de lodge.' },
      { type:'h2', text:'2. Prévoir des activités sensorielles' },
      { type:'p', html:'Ce qui marche chez les 4-12 ans : pêche en pirogue, atelier cuisine, marché aux tissus, baignade au Lac Rose (l’eau saline les fascine). Ce qui marche moins bien : musées denses, longues visites de monuments. On adapte.' },
      { type:'h2', text:'3. Vaccins et trousse à pharmacie' },
      { type:'ul', items:[
        '<strong>Recommandés</strong> : hépatite A, typhoïde, mise à jour DT-Polio.',
        '<strong>Selon zone et saison</strong> : antipaludique (à voir avec le pédiatre 4 semaines avant).',
        '<strong>Trousse minimum</strong> : doliprane, dafalgan, smecta, sérum physiologique, pansements, crème solaire haute protection.',
      ]},
      { type:'h2', text:'4. Hébergement adapté' },
      { type:'p', html:'On privilégie les lodges familiaux avec piscine — bénédiction pour les fins de journée. Lits superposés ou chambres communicantes sur demande, sans supplément.' },
      { type:'h2', text:'5. Transport' },
      { type:'p', html:'4x4 ou minibus climatisé, sièges enfants disponibles gratuitement (dites les âges à la réservation). On charge des coussins, oreillers, et même des audio-livres pour les longues routes.' },
      { type:'h2', text:'6. Alimentation' },
      { type:'p', html:'Tout est faisable. Le riz et le poisson plaisent vite, les pâtes existent partout, les fruits frais sont incroyables. À éviter : crudités de marché non lavées, eau du robinet. Eau minérale fournie en abondance.' },
      { type:'callout', title:'Notre circuit famille', html:'Notre <a href="#/tour/familles-10j">Famille · 10 jours</a> est construit autour de ces neuf points : journées courtes, hôtels familiaux, baignades, ateliers cuisine et artisanat, et un guide habitué aux enfants.' },
      { type:'h2', text:'7-9. Sécurité, communication, et le mot magique' },
      { type:'ul', items:[
        '<strong>SIM locale</strong> offerte dès l’arrivée — utile pour appeler nos guides ou Wave.',
        '<strong>Contact 24/7</strong> via WhatsApp, ligne d’astreinte qui répond en moins de 15 minutes.',
        '<strong>"Téranga"</strong> — l’accueil sénégalais. Apprenez ce mot à vos enfants, c’est l’ouvre-porte universel.',
      ]},
      { type:'p', html:'On vous accueille comme on accueillerait nos propres enfants. Promis.' },
    ] },
  { id:'lompoul-nuit', title:'Lompoul : à quoi ressemble vraiment une nuit dans les dunes',
    cat:'destinations', tag:'Destinations',
    excerpt:'Notre récit en photos d’une nuit en bivouac, du thé sucré du coucher au café fumant de l’aube.',
    tone:'ocre', mood:'dunes', readTime:'7 min', date:'2 décembre 2025',
    img: IMG('Désert de Lompoul', 4),
    author:{ name:'Mamadou Diop', role:'Guide & co-fondateur' },
    body:[
      { type:'lead', html:'<strong>18h30. Le soleil tombe sur les dunes.</strong> On n’entend plus que le vent qui fait crisser le sable. Le campement allume les premières lampes à huile. C’est ce moment-là, Lompoul.' },
      { type:'p', html:'À trois heures de Dakar, juste avant Saint-Louis, le désert de Lompoul est une enclave d’environ 18 km² de dunes ocre — petite échelle, énorme effet. Voici notre récit d’une nuit là-bas, telle qu’on la propose à chaque voyageur.' },
      { type:'h2', text:'L’arrivée — la dernière route avant le silence' },
      { type:'p', html:'On quitte la route asphaltée vers 16h. Quinze minutes de piste, transfert sur 4x4 du campement, puis dix minutes encore dans les dunes — chaque virage révèle un peu plus du sable. À l’arrivée, le campement apparaît : tentes berbères en cercle, bâche de toile beige sur le sable, fanaux suspendus.' },
      { type:'h2', text:'Le bivouac — tentes, dîner, étoiles' },
      { type:'p', html:'Chaque tente est isolée du sable par un tapis surélevé, équipée d’un vrai lit (oui, dans le désert), couvertures pour la nuit fraîche. Douche solaire commune chauffée au feu. Dîner sous une grande tente collective : thieboudienne ou yassa poulet, eau, bissap, et thé à la menthe à volonté.' },
      { type:'quote', text:'"On ne mesure pas une nuit dans les dunes en heures. On la mesure en silences."' },
      { type:'h2', text:'La nuit — comment ça se passe' },
      { type:'ul', items:[
        'Pas de wifi, pas de réseau (parfois 4G faible) — c’est l’intérêt.',
        'Température nocturne entre 14 et 22°C selon la saison ; sec, donc supportable.',
        'Le ciel : si vous venez de novembre à février, la voie lactée est <strong>nette</strong>. Apportez un appareil photo si vous en avez un.',
        'Possibilité de monter une dune en début de nuit avec une lampe frontale — calme absolu.',
      ]},
      { type:'h2', text:'Le matin — café au lever du soleil' },
      { type:'p', html:'Réveil libre vers 6h. Thé à la menthe et café noir devant la tente. À 6h30, le soleil émerge sur les crêtes les plus hautes, et toute la pente s’éclaire en quelques minutes. C’est court, et c’est pour ça qu’on se lève.' },
      { type:'callout', title:'Meilleure période', html:'<strong>Novembre à février</strong> — nuits fraîches mais sèches, ciel d’une clarté exceptionnelle, températures de journée parfaites (24-28°C). Évitez mai à octobre (chaleur excessive ou pluies courtes).' },
      { type:'h2', text:'Comment l’inclure dans un circuit' },
      { type:'p', html:'Notre <a href="#/tour/lompoul-saint-louis">Lompoul & Saint-Louis</a> enchaîne directement avec l’architecture coloniale et le jazz fluvial — c’est notre formule la plus demandée pour le nord. Notre <a href="#/tour/grand-tour-7j">Grand tour du nord</a> intègre Lompoul dans une boucle plus longue.' },
    ] },
];

const BLOG_CATEGORIES = [
  { id:'all',          label:'Tous' },
  { id:'dakar',        label:'Dakar' },
  { id:'destinations', label:'Destinations' },
  { id:'pratique',     label:'Conseils pratiques' },
  { id:'culture',      label:'Culture' },
  { id:'diaspora',     label:'Diaspora' },
  { id:'saisons',      label:'Saisons & météo' },
];

// === INSTAGRAM strip ========================================================
const INSTA = [
  { tone:'terre',  mood:'horizon', img: IMG('Ile de gorée', 6) },
  { tone:'atlant', mood:'water',   img: IMG('Delta du Saloum', 5) },
  { tone:'ocre',   mood:'dunes',   img: IMG('Désert de Lompoul', 5) },
  { tone:'rose',   mood:'water',   img: IMG('Lac Rose', 4) },
  { tone:'forest', mood:'leaves',  img: IMG('Casamance', 5) },
  { tone:'dusk',   mood:'city',    img: IMG('Dakar', 6) },
  { tone:'sand',   mood:'horizon', img: IMG('Kédougou', 3) },
  { tone:'terre',  mood:'portrait',img: IMG('Saint-Louis', 5) },
];

// === TEAM ===================================================================
const TEAM = [
  { name:'Salif Badiane',   role:'Directeur Général · ACT', langs:['Wolof','Français','Anglais','Espagnol'],
    tone:'terre', mood:'portrait',
    quote:'Trente ans à organiser le Sénégal. Et toujours la même envie de mieux faire — un voyageur après l’autre.' },
  { name:'Awa Sow',         role:'Responsable expérience client', langs:['Wolof','Français','Anglais','Espagnol'],
    tone:'dusk', mood:'portrait',
    quote:'Mon métier, c’est d’écouter ce que vous ne dites pas dans le formulaire.' },
  { name:'Ibrahima Faye',   role:'Guide Casamance', langs:['Diola','Français','Anglais'],
    tone:'forest', mood:'portrait',
    quote:'En Casamance, on ne court pas. On marche, on écoute, on s’arrête manger.' },
  { name:'Aminata Ba',      role:'Guide Dakar', langs:['Wolof','Français','Anglais','Italien'],
    tone:'rose', mood:'portrait',
    quote:'Je vous emmène où ma grand-mère faisait son marché. Le vrai Dakar.' },
  { name:'Cheikh Ndiaye',   role:'Chauffeur principal', langs:['Wolof','Français'],
    tone:'atlant', mood:'portrait',
    quote:'Vingt ans à sillonner ce pays. Je connais chaque virage et chaque maquis.' },
  { name:'Khady Diallo',    role:'Co-fondatrice & opérations', langs:['Wolof','Français','Anglais'],
    tone:'ocre', mood:'portrait',
    quote:'Si quelque chose ne va pas pendant votre voyage, c’est moi qu’on appelle. Et ça se règle.' },
];

// === VALUES (About) ========================================================
const VALUES = [
  { I:'Compass',  t:'Local',         d:'Tous nos guides sont sénégalais, formés ici, vivant ici toute l’année.' },
  { I:'Heart',    t:'Humain',        d:'Pas de discours marketing. Si on n’y croit pas, on ne le vend pas.' },
  { I:'Leaf',     t:'Responsable',   d:'78 % du chiffre reste dans l’économie locale. Hébergeurs, restaurateurs, artisans.' },
  { I:'Sparkle',  t:'Authentique',   d:'Ce qu’on vous montre, on irait y manger nous-mêmes. Promis.' },
];

// === Partners (About) =======================================================
const PARTNERS = [
  'Lodge des Bolongs',
  'Hôtel de la Poste',
  'Wave Sénégal',
  'Orange Money',
  'Lompoul Désert Camp',
  'Sénégal Tourism Board',
  'Air Sénégal',
  'Association Sénégal Solidaire',
];

// === Key figures (About) ====================================================
const FIGURES = [
  { k:'12 ans',   v:'à organiser le Sénégal' },
  { k:'2 400+',  v:'voyageurs accueillis' },
  { k:'14',      v:'circuits permanents' },
  { k:'47',      v:'guides & partenaires' },
];

// === FAQ ====================================================================
const FAQ = [
  { cat:'Réservation & paiement', items:[
    { q:'Quels moyens de paiement acceptez-vous ?',
      a:'Wave, Orange Money, Free Money, virement bancaire (Sénégal & international), carte Visa/Mastercard via Stripe, et espèces sur place (FCFA ou EUR). Aucun supplément pour le paiement mobile.' },
    { q:'Combien d’acompte faut-il verser ?',
      a:'30 % pour confirmer la réservation. Le solde est dû au plus tard 7 jours avant le départ — par virement, carte, ou paiement mobile.' },
    { q:'Dans quelle devise sont les prix ?',
      a:'Prix de référence en FCFA (XOF), avec conversion indicative en EUR et USD. Le paiement final se fait dans la devise de votre choix au taux du jour.' },
    { q:'Recevrai-je une facture officielle ?',
      a:'Oui — facture émise par Africa Connection Tours, avec numéro de licence agence de voyage. Utile pour assurance, comptabilité, ou justificatifs.' },
  ]},
  { cat:'Annulation & modifications', items:[
    { q:'Quelle est votre politique d’annulation ?',
      a:'Annulation gratuite jusqu’à 21 jours avant le départ. Entre 21 et 7 jours : 50 % remboursés. Moins de 7 jours : l’acompte est conservé mais reportable sur un autre circuit dans les 12 mois.' },
    { q:'Puis-je modifier mes dates ?',
      a:'Oui, gratuitement jusqu’à 14 jours avant le départ. Au-delà, une nouvelle réservation peut être faite avec votre acompte intact.' },
    { q:'Et si ACT doit annuler ?',
      a:'Remboursement intégral sous 7 jours, ou report sans frais à la date de votre choix.' },
  ]},
  { cat:'Avant le voyage', items:[
    { q:'Faut-il un visa ?',
      a:'Non pour la plupart des nationalités occidentales (France, USA, Canada, UK, UE) — court séjour touristique. On vérifie pour vous selon votre passeport.' },
    { q:'Quels vaccins sont nécessaires ?',
      a:'Aucun obligatoire, sauf fièvre jaune si vous arrivez d’un pays endémique. Recommandés : hépatites A et B, typhoïde. Antipaludique selon saison et zone.' },
    { q:'Comment fonctionne le change et le paiement sur place ?',
      a:'Distributeurs partout en ville, change EUR/USD facile. Mais avec Wave et OM, vous pouvez tout payer depuis votre téléphone — bien plus pratique.' },
    { q:'Faut-il une carte SIM ou eSIM ?',
      a:'On vous offre une carte SIM Orange Sénégal à l’arrivée pour les circuits de 3 jours et +. eSIM possible via Airalo si vous préférez.' },
    { q:'Quelle assurance prendre ?',
      a:'Une assurance voyage couvrant le rapatriement médical est vivement recommandée. On peut vous suggérer des partenaires (Chapka, ACS).' },
  ]},
  { cat:'Pendant le voyage', items:[
    { q:'Le transport est-il privé ?',
      a:'Oui — 4x4 ou minibus climatisé selon la taille du groupe. Vous ne partagez le véhicule avec personne d’autre, sauf circuits "petit groupe" annoncés.' },
    { q:'Comment vous contacter pendant le séjour ?',
      a:'Numéro WhatsApp dédié, joignable 24/7. Pour les urgences, ligne d’astreinte avec réponse en moins de 15 minutes.' },
    { q:'Le guide reste-t-il avec nous tout le temps ?',
      a:'Oui pour les circuits — le même guide du début à la fin. Pour les excursions, il vous accompagne sur la journée prévue.' },
    { q:'Et si l’un de nous tombe malade ?',
      a:'Nos guides ont une formation premiers secours. Nous coordonnons médecin local ou clinique privée (Hôpital Principal, Pasteur). Frais médicaux à votre charge, à faire jouer sur votre assurance.' },
  ]},
  { cat:'Voyages sur mesure', items:[
    { q:'Comment ça se passe concrètement ?',
      a:'Vous remplissez le formulaire (5 minutes), on vous rappelle ou écrit sous 24h ouvrées avec un premier carnet de voyage. On affine ensemble par WhatsApp ou visio jusqu’à validation.' },
    { q:'Combien de temps faut-il avant le départ ?',
      a:'Idéalement 3-4 semaines pour les voyages de 7 jours et +. Pour des excursions courtes, on peut organiser en 48-72h selon disponibilité.' },
    { q:'Puis-je modifier mon programme une fois sur place ?',
      a:'Oui, dans la mesure du possible. Une étape qui ne vous parle plus, un coup de cœur en route — on s’adapte sans surcoût quand c’est faisable.' },
  ]},
  { cat:'Diaspora & retour aux sources', items:[
    { q:'Proposez-vous un accompagnement spécifique pour la diaspora ?',
      a:'Oui — circuit "Retour aux sources", recherche généalogique avec partenaires, cérémonie d’accueil traditionnelle, rencontres avec historien·ne·s.' },
    { q:'Peut-on inclure une recherche familiale ?',
      a:'Sur demande, en lien avec des chercheurs sénégalais et des archives. Délai 4-8 semaines avant le séjour pour préparer.' },
    { q:'Le rythme est-il adapté aux aîné·e·s ?',
      a:'Absolument. Beaucoup de nos voyageurs viennent accompagner leur parent ou grand-parent. On adapte tout : pauses, hôtels, distances.' },
  ]},
  { cat:'Tourisme responsable', items:[
    { q:'Quel est votre impact local ?',
      a:'78 % de votre paiement reste dans l’économie sénégalaise : guides salariés sénégalais, lodges familiaux, restaurants locaux, artisans en direct.' },
    { q:'Travaillez-vous avec des associations ?',
      a:'Oui — partenariats avec Sénégal Solidaire (éducation), Nebeday (reforestation Casamance) et le Fonds Mémoire de Gorée. On vous propose des visites si vous le souhaitez.' },
    { q:'Et l’éco-attitude des voyageurs ?',
      a:'Eau filtrée (pas de bouteilles plastique), respect des protocoles photographiques en village, code de bonne conduite remis avant le départ.' },
  ]},
];

// === CIRCUIT DETAIL =========================================================
const CIRCUIT_DETAIL = {
  id:'goree-lac-saloum',
  title:'Gorée · Lac Rose · Saloum',
  subtitle:'5 jours · 4 nuits · au départ de Dakar',
  rating: 4.9, reviews: 47,
  badges:['Guide local certifié', 'Privé ou petit groupe', 'Famille bienvenue', 'Annulation flexible'],
  priceXOF:null,
  gallery: [
    { tone:'atlant', mood:'water',   label:'pirogue Saloum / golden hour', img: IMG('Delta du Saloum', 6) },
    { tone:'terre',  mood:'city',    label:'Gorée — porte du voyage',      img: IMG('Ile de gorée', 7) },
    { tone:'rose',   mood:'water',   label:'Lac Rose — récolte du sel',    img: IMG('Lac Rose', 5) },
    { tone:'sand',   mood:'horizon', label:'mangrove — vol d’ibis',        img: IMG('Delta du Saloum', 7) },
    { tone:'dusk',   mood:'portrait',label:'guide & voyageurs',            img: IMG('Dakar', 7) },
  ],
  days: [
    { n:1, title:'Arrivée à Dakar & soirée Médina', short:'Accueil à l’aéroport AIBD, transfert, dîner thieboudienne dans un maquis de la Médina.', tone:'dusk', mood:'city', img: IMG('Dakar', 8) },
    { n:2, title:'Île de Gorée — mémoire & art', short:'Traversée en ferry, visite guidée de la Maison des Esclaves, ruelles d’artistes, déjeuner sur l’île.', tone:'terre', mood:'horizon', img: IMG('Ile de gorée', 8) },
    { n:3, title:'Lac Rose — sel & dunes', short:'Route vers le lac, marche avec les ramasseurs de sel, baignade salée, nuit en lodge au bord de l’eau.', tone:'rose', mood:'water', img: IMG('Lac Rose', 6) },
    { n:4, title:'Delta du Saloum — pirogue & oiseaux', short:'Descente vers le Saloum, pirogue dans les bolongs, observation d’oiseaux, dîner sous les fromagers.', tone:'atlant', mood:'water', img: IMG('Delta du Saloum', 1) },
    { n:5, title:'Village de pêcheurs & retour Dakar', short:'Petit-déjeuner en village lébou, retour tranquille vers Dakar, dépose hôtel ou aéroport.', tone:'sand', mood:'horizon', img: IMG('Delta du Saloum', 5) },
  ],
  includes:[
    'Transport privé climatisé tout le séjour',
    'Guide francophone (anglais sur demande)',
    'Hébergement en lodges & maisons d’hôtes sélectionnés',
    'Petits-déjeuners & 3 dîners typiques',
    'Ferry Gorée A/R + entrées des sites',
    'Pirogue Saloum (2h)',
    'Eau minérale à bord',
    'Assistance WhatsApp 24/7',
  ],
  excludes:[
    'Vol international',
    'Visa (non requis pour la plupart des pays)',
    'Déjeuners libres',
    'Boissons alcoolisées',
    'Pourboires',
    'Assurance voyage',
  ],
  pratique:[
    { label:'Durée',         value:'5 jours / 4 nuits' },
    { label:'Départ',        value:'Dakar (hôtel ou AIBD)' },
    { label:'Langues guide', value:'Français · Wolof · Anglais' },
    { label:'Effort',        value:'Léger — accessible familles' },
    { label:'Capacité',      value:'2 à 8 voyageurs' },
    { label:'Meilleure période', value:'Novembre → mai' },
  ],
  faqs:[
    { q:'Quels moyens de paiement acceptez-vous ?',
      a:'Wave, Orange Money, virement bancaire, carte Visa/Mastercard, et espèces (FCFA ou EUR). Un acompte de 30% confirme la réservation, le solde se règle au plus tard 7 jours avant le départ.' },
    { q:'Quelle est votre politique d’annulation ?',
      a:'Annulation gratuite jusqu’à 21 jours avant le départ. Entre 21 et 7 jours : 50% remboursés. Moins de 7 jours : l’acompte est conservé mais reportable sur un autre circuit dans les 12 mois.' },
    { q:'Le transport est-il privé ?',
      a:'Oui — 4x4 ou minibus climatisé selon la taille du groupe, avec chauffeur professionnel. Vous ne partagez le véhicule avec personne d’autre.' },
    { q:'Peut-on partir avec des enfants ?',
      a:'Absolument. Le rythme est doux, plusieurs étapes plaisent particulièrement aux enfants (sel du Lac Rose, pirogue). Sièges enfants disponibles sur demande, sans frais.' },
    { q:'Quelle météo prévoir ?',
      a:'De novembre à mai : 22-30°C, sec, ensoleillé — la période idéale. De juin à octobre : plus chaud et humide, paysages plus verts, possibles averses brèves.' },
    { q:'Et la sécurité sanitaire ?',
      a:'Aucun vaccin obligatoire (sauf fièvre jaune si vous venez d’un pays à risque). Eau minérale fournie. Nos guides ont une formation premiers secours.' },
  ],
};

// === Map paths (used in tour map) ==========================================
const SENEGAL_PATH = "M 38 78 L 60 70 L 88 62 L 120 58 L 158 56 L 196 56 L 230 60 L 262 70 L 290 88 L 308 110 L 320 138 L 332 168 L 340 196 L 332 222 L 308 232 L 274 234 L 246 232 L 222 240 L 196 246 L 168 242 L 142 238 L 122 240 L 102 244 L 78 244 L 58 240 L 44 226 L 38 198 L 36 168 L 36 138 L 36 108 Z";
const CASAMANCE_PATH = "M 60 250 L 100 248 L 150 250 L 200 252 L 240 250 L 270 254 L 280 268 L 240 274 L 200 276 L 150 274 L 100 272 L 70 268 Z";
const MAP_STOPS = [
  { id:'dakar',   x: 56,  y: 158, label:'Dakar' },
  { id:'goree',   x: 60,  y: 168, label:'Gorée' },
  { id:'lac',     x: 78,  y: 144, label:'Lac Rose' },
  { id:'saloum',  x: 92,  y: 218, label:'Saloum' },
];

Object.assign(window, {
  DESTINATIONS, CIRCUITS, TESTIMONIALS, TOUR_REVIEWS, BLOG, BLOG_CATEGORIES, INSTA,
  CIRCUIT_DETAIL, SENEGAL_PATH, CASAMANCE_PATH, MAP_STOPS,
  TEAM, VALUES, PARTNERS, FIGURES, FAQ,
  IMG_BASE, IMG,
});

# Stratégie complète — Site web Agence touristique Dakar

**Version 2.0 — Document corrigé et consolidé**
**Date :** 25 mai 2026
**Statut :** Document de travail (les montants sont des valeurs indicatives à valider avec le client)

---

## 1. Contexte et objectifs

Une agence touristique basée à Dakar souhaite un site web dynamique et mobile-first capable de :

1. **Inspirer** le visiteur avec des destinations fortes du Sénégal (Dakar, Gorée, Lac Rose, Saloum, Saint-Louis, Casamance, Lompoul, Kédougou).
2. **Rassurer** avec des preuves de confiance, des informations claires et un contact humain rapide.
3. **Convertir** sur mobile via demande de devis, réservation ou message WhatsApp en quelques secondes.
4. **Permettre à l'agence** de gérer elle-même tout le contenu du site via un dashboard administrateur complet.

### Justification mobile-first

D'après DataReportal (Digital 2025 Sénégal) : 11,3 millions d'utilisateurs internet (pénétration 60,6 %) et 22,7 millions de connexions mobiles (121 % de la population). Le site doit donc être rapide, léger et utilisable même en 3G/4G instable.

---

## 2. Les trois cibles du site

Le site doit servir trois publics avec des attentes différentes. Chaque cible influence des choix de design, de paiement et de contenu.

### Cible A — Diaspora et retour aux sources

- **Profil :** Afro-descendants, diaspora africaine, voyageurs culturels et émotionnels.
- **Attentes :** Patrimoine, histoire, Gorée, rencontres, sens, guides spécialisés.
- **Implications site :** Section dédiée "Retour aux sources", contenus culturels riches, témoignages diaspora, paiement carte internationale, possibilité de paiement en USD ou EUR.

### Cible B — Marché local sénégalais

- **Profil :** Résidents de Dakar et du Sénégal, familles, groupes d'amis, entreprises.
- **Attentes :** Week-ends, excursions à la journée, prix en FCFA, paiement Wave/Orange Money, réservation WhatsApp.
- **Implications site :** Prix en FCFA par défaut, paiements mobile money en premier, WhatsApp pré-rempli, offres week-end et événements (Tabaski, fin d'année, vacances scolaires).

### Cible C — Touristes étrangers

- **Profil :** Européens, Nord-Américains, voyageurs internationaux en circuit organisé ou sur mesure.
- **Attentes :** Anglais (et idéalement quelques contenus EN bien faits plutôt qu'un mauvais multilingue), réassurance, transfert aéroport, sécurité, infos pratiques (visa, vaccin, devise, météo).
- **Implications site :** Version anglaise des pages clés en phase 2, conversion EUR/USD indicative, paiement carte international (Visa/Mastercard), pack "Dakar sans stress" avec accueil aéroport.

---

## 3. Positionnement éditorial

Le site ne doit pas seulement dire "nous sommes une agence". Il doit vendre une expérience claire :

> **"Découvrez Dakar et le Sénégal avec des guides locaux, des circuits flexibles et une réservation simple par WhatsApp ou paiement mobile."**

Axes à mettre en avant :

- Agence locale experte de Dakar et du Sénégal.
- Circuits privés et séjours sur mesure.
- Réservation rapide, paiement local, accompagnement humain.
- Expériences culturelles, naturelles et responsables.

---

## 4. Pages publiques du site

### Pages indispensables (Phase 1)

- **Accueil** : promesse claire, destinations phares, offres du moment, preuves sociales, bouton WhatsApp visible.
- **Catalogue circuits / excursions** : filtres par durée, budget, type, destination, départ.
- **Fiche circuit** : galerie, programme jour par jour, inclus/non inclus, prix indicatif "à partir de", avis, FAQ, boutons "Demander un devis" et "Réserver sur WhatsApp".
- **Sur mesure** : formulaire structuré pour les voyages personnalisés.
- **Blog / Guide de voyage** : articles SEO (meilleure période, que faire à Dakar en 2 jours, budget, transport, sécurité).
- **À propos** : équipe, guides, valeurs, licence agence de voyage, partenaires.
- **Contact** : WhatsApp, téléphone, email, adresse, carte, horaires.
- **FAQ** : paiement, annulation, visa, transport, assurance, enfants, météo.
- **Pages légales** : mentions légales, politique de confidentialité, conditions de réservation.

### Pages ajoutées en Phase 2

- **Espace client** (suivi de réservation, documents, contacts d'urgence).
- **Pages destinations** (une page SEO par destination majeure).
- **Section "Retour aux sources"** pour la diaspora.
- **Pages "Pack Dakar sans stress"** pour les touristes étrangers.

---

## 5. Fonctionnalités côté visiteur

### Indispensables (Phase 1)

- Responsive mobile-first et chargement rapide en connexion moyenne.
- Bouton WhatsApp flottant et **pré-rempli intelligemment** (voir section 7).
- Formulaire de demande de devis court et en plusieurs étapes.
- Affichage clair du prix, de la durée et du CTA avant scroll.
- Avis et témoignages clients (intégration Google Reviews + avis internes modérés).
- Galerie photo authentique (équipe, guides, voyageurs).
- Conversion multi-devise indicative : XOF, EUR, USD (affichage seulement, paiement en XOF).
- Partage social et galerie Instagram intégrée.

### Phase 2

- Calendrier de disponibilités par circuit.
- Génération de devis PDF ou lien partageable.
- Paiement d'acompte en ligne (Wave, Orange Money, carte via PayTech).
- Multi-langue Français / Anglais (FR par défaut).
- Newsletter et alertes promotions.
- Carte interactive des destinations.

### Phase 3

- Espace client sécurisé.
- PWA et mode basse connexion (pages consultables hors ligne, ajout à l'écran d'accueil).
- Suggestion intelligente d'itinéraire (formulaire guidé, pas IA générative — voir section 7).

---

## 6. Dashboard administrateur — gestion complète du contenu

L'administrateur doit pouvoir **tout modifier depuis son dashboard, sans intervention technique**. C'est un point structurant du projet.

### 6.1 Gestion du catalogue

- **Destinations** : créer, modifier, supprimer (nom, description, photos, région, durée depuis Dakar, meilleure période, badges).
- **Circuits et excursions** : titre, description, programme jour par jour, durée, prix indicatif, inclus / non inclus, capacité min/max, point de départ, niveau d'effort, langues du guide, statut (publié/brouillon/archivé).
- **Galerie d'images** par circuit et destination, avec drag & drop, recadrage, ordre, image principale.
- **Tarifs** : prix de base, suppléments, prix groupe vs prix individuel, prix saison haute/basse, devise.
- **Disponibilités** : calendrier par circuit avec dates de départ, places restantes, statut (ouvert/complet/annulé).
- **Guides et chauffeurs** : profil, photo, langues parlées, biographie, disponibilité.

### 6.2 Gestion des demandes et réservations

- **Demandes de devis** : liste filtrable (date, statut, source, montant), détails complets, historique des échanges, statut (nouveau, en cours, devis envoyé, réservé, perdu).
- **Réservations** : suivi paiements (acompte, solde), génération automatique de confirmations, export Excel.
- **Carnet de voyage partageable** : génération d'un lien privé par client (programme + photos + prix + bouton paiement + WhatsApp).
- **Notifications** : email et WhatsApp pour chaque nouvelle demande (configurable).

### 6.3 Gestion du contenu éditorial

- **Articles de blog** : éditeur visuel (texte, images, vidéos, liens), catégories, tags, mots-clés SEO, programmation de publication.
- **FAQ** : ajout/modification/suppression de questions par catégorie.
- **Pages statiques** (À propos, Mentions légales, etc.) : édition WYSIWYG complète.
- **Témoignages et avis** : modération (approuver, rejeter, mettre en avant), réponse de l'agence.

### 6.4 Gestion des éléments transverses du site

- **Bannières et promotions** : créer une promo, choisir les pages d'affichage, dates de début/fin.
- **Page d'accueil dynamique** : choisir les destinations mises en avant, les offres en vedette, les avis affichés, l'image hero.
- **Menu de navigation** : ordre, libellés, liens.
- **Coordonnées et infos générales** : téléphone, WhatsApp, email, adresse, horaires, réseaux sociaux — modifiables et propagés partout sur le site.
- **Modèles d'emails** : templates de confirmation, devis, relance, modifiables sans coder.
- **Textes des messages WhatsApp pré-remplis** : modifiables par circuit et par contexte.

### 6.5 Gestion multilingue (Phase 2)

- Pour chaque circuit, article, page : champs FR et EN côte à côte.
- Indicateur visuel du statut de traduction (complet, partiel, manquant).

### 6.6 Utilisateurs et droits

- Comptes administrateurs avec rôles (super admin, éditeur, commercial).
- Historique des modifications (qui a modifié quoi, quand).

### 6.7 Statistiques et analytics

- Tableau de bord : demandes du mois, taux de conversion, circuits les plus consultés, sources de trafic, revenus.
- Export CSV des demandes, réservations, clients.

---

## 7. Fonctionnalités de différenciation

Les vrais leviers de différenciation, sans gadgets coûteux à livrer.

### 7.1 WhatsApp pré-rempli intelligent

Au lieu d'un simple bouton WhatsApp, le site pré-remplit un message structuré selon le contexte. Exemple depuis une fiche circuit :

> "Bonjour, je suis intéressé(e) par l'excursion **Île de Gorée**. Dates souhaitées : [à remplir]. Nombre de voyageurs : [à remplir]. Lieu de prise en charge : [à remplir]. Merci."

Le commercial reçoit une demande déjà propre et peut répondre en quelques minutes. C'est l'un des plus gros leviers de conversion pour le contexte sénégalais.

### 7.2 Carnet de voyage partageable

Après une demande, l'agence génère depuis le dashboard un lien privé pour le client contenant :

- Programme jour par jour.
- Photos authentiques.
- Prix détaillé.
- Conditions.
- Bouton de paiement d'acompte.
- Bouton WhatsApp direct vers le commercial.

Beaucoup plus professionnel qu'un long message WhatsApp ou un PDF statique, et beaucoup plus performant qu'un email standard.

### 7.3 Suggestion d'itinéraire guidée (sans IA générative)

Un formulaire en plusieurs étapes :

- Durée : 1 jour / week-end / 5 jours / 7 jours / 10 jours.
- Centres d'intérêt : culture, plage, nature, aventure, histoire, gastronomie.
- Rythme : tranquille, équilibré, intense.
- Budget et nombre de voyageurs.

Le site propose 2 à 3 itinéraires pré-construits depuis la base de circuits, avec bouton "Envoyer ce plan à l'agence". Effet "personnalisé" sans la complexité ni les risques d'une IA générative.

### 7.4 Devis instantané approximatif

Sans donner un prix final, affichage d'une estimation transparente selon les options choisies (transport seul, guide inclus, repas inclus, hébergement standard/confort/luxe, privé/partagé). Filtre les prospects et augmente la confiance.

### 7.5 Carte interactive des expériences (Phase 2)

Carte du Sénégal avec points cliquables ouvrant une fiche courte par destination.

### 7.6 Pack "Dakar sans stress" pour étrangers

Accueil aéroport + transfert hôtel + tour de Dakar + assistance WhatsApp pendant le séjour + recommandations pratiques (change, SIM/eSIM, restaurants).

### 7.7 Segment "Retour aux sources" pour la diaspora

Page dédiée avec circuits culturels, ateliers, rencontres communautaires, témoignages, guides historiens.

### 7.8 Preuves locales fortes

- Photos authentiques de l'équipe et des guides.
- Mini-profils des guides avec langues parlées.
- Badges : "guide local", "expérience privée", "famille", "éco-responsable".
- Vidéos courtes verticales depuis Instagram / TikTok / YouTube Shorts.

### 7.9 Mode basse connexion (Phase 3)

PWA, pages légères, images WebP, programme consultable hors ligne, PDF auto. Vrai différenciateur dans le contexte sénégalais.

---

## 8. Architecture technique recommandée

### Option recommandée : Laravel + Filament + MySQL

- **Frontend public :** Laravel Blade ou Inertia + Vue/React selon le rendu visuel souhaité.
- **Backend :** Laravel (PHP).
- **Dashboard admin :** Filament (interface admin moderne, rapide à développer, hautement personnalisable).
- **Base de données :** MySQL ou PostgreSQL.
- **Paiement :** PayTech (cartes), Wave et Orange Money via PayTech ou API directe selon la disponibilité contractuelle.
- **Notifications :** Email (SMTP) + WhatsApp Business API ou agrégateur (Twilio, 360dialog).
- **Hébergement :** VPS (DigitalOcean, Hetzner, OVH) ou Hostinger Cloud pour démarrer.
- **CDN et images :** Cloudflare + conversion WebP automatique.

**Pourquoi ce choix :** Laravel + Filament permet de livrer un dashboard administrateur très complet rapidement, ce qui correspond exactement au besoin du client (autonomie totale sur le contenu).

### Option alternative : WordPress

Possible si le budget est réduit, avec un thème personnalisé + plugin de réservation (WP Travel Engine ou équivalent). Limites : personnalisation avancée plus difficile, dashboard moins propre pour un usage métier, performance à surveiller.

---

## 9. Structure de données

- **Destinations** : nom, slug, description, région, photos, durée depuis Dakar, meilleure période.
- **Circuits** : titre, destination, durée, prix indicatif, programme, inclus, non inclus, capacité, statut, traduction.
- **Départs / disponibilités** : date, places, prix spécial, statut.
- **Demandes** : client, contact, dates, nombre de personnes, message, source, statut.
- **Réservations** : circuit, client, montant, acompte, solde, statut paiement.
- **Avis** : nom, note, texte, photo, circuit associé, statut modération.
- **Articles** : titre, contenu, image, catégorie, mots-clés SEO, traduction.
- **Guides / chauffeurs** : nom, langues, photo, bio, disponibilité.
- **Utilisateurs admin** : nom, email, rôle, historique.
- **Configurations globales** : coordonnées, réseaux sociaux, textes WhatsApp, devises, etc.

---

## 10. Parcours utilisateur cible par cible

### Parcours diaspora

1. Arrivée depuis Google / Instagram via un article sur Gorée.
2. Lecture d'un guide culturel détaillé.
3. Découverte de la section "Retour aux sources".
4. Demande de devis pour un circuit de 7 jours.
5. Réception du carnet de voyage partageable.
6. Paiement acompte par carte internationale.
7. Suivi via espace client.

### Parcours marché local

1. Arrivée via WhatsApp, Instagram ou bouche-à-oreille.
2. Consultation rapide des excursions week-end.
3. Clic sur "Réserver sur WhatsApp" avec message pré-rempli.
4. Échange direct avec le commercial.
5. Paiement Wave / Orange Money.

### Parcours touriste étranger

1. Arrivée depuis Google ("things to do in Dakar").
2. Consultation en anglais.
3. Pack "Dakar sans stress" rassurant.
4. Demande de devis structurée.
5. Carnet de voyage envoyé.
6. Paiement carte bancaire.
7. Assistance WhatsApp pendant le séjour.

---

## 11. Plan en 3 phases

### Phase 1 — MVP site vitrine dynamique

- Pages indispensables (section 4).
- Catalogue de circuits avec fiche détaillée.
- Formulaire de devis multi-étapes.
- WhatsApp pré-rempli intelligent.
- Dashboard administrateur complet (section 6.1 à 6.4 et 6.6).
- Blog simple.
- SEO de base + Google Business Profile + données structurées LocalBusiness.
- Responsive mobile-first.
- Analytics (Google Analytics 4 + Meta Pixel).

### Phase 2 — Conversion et opérations

- Calendrier de disponibilités.
- Devis PDF / carnet de voyage partageable.
- Paiement d'acompte en ligne (Wave, OM, carte).
- Avis clients intégrés.
- Multi-langue FR / EN (gestion section 6.5).
- Newsletter et automatisations email.
- Carte interactive des destinations.

### Phase 3 — Différenciation forte

- Suggestion d'itinéraire guidée.
- Espace client sécurisé.
- PWA et mode basse connexion.
- Automatisations WhatsApp avancées.
- Tableau de bord marketing complet.
- Programme de fidélité.

---

## 12. Budget indicatif (valeurs placeholder à valider)

> ⚠️ **Important :** Les montants ci-dessous sont des valeurs **indicatives à confirmer** après cadrage précis avec le client et selon les choix techniques retenus. Ils servent de base de discussion, pas d'engagement contractuel.

### Phase 1 — MVP

| Poste | Estimation |
|---|---|
| Conception UX/UI et design mobile-first | 800 000 FCFA |
| Développement frontend public | 1 500 000 FCFA |
| Développement backend + dashboard administrateur | 2 000 000 FCFA |
| Intégration contenus initiaux (10 circuits, 5 articles) | 400 000 FCFA |
| SEO de base, données structurées, analytics | 300 000 FCFA |
| Tests, recette, mise en ligne | 300 000 FCFA |
| **Sous-total Phase 1** | **5 300 000 FCFA** |

### Phase 2 — Conversion et opérations

| Poste | Estimation |
|---|---|
| Calendrier de disponibilités | 500 000 FCFA |
| Carnet de voyage partageable + devis PDF | 600 000 FCFA |
| Intégration paiements (PayTech + Wave + OM) | 800 000 FCFA |
| Multi-langue FR/EN (technique + traduction de base) | 700 000 FCFA |
| Newsletter et automatisations email | 300 000 FCFA |
| Carte interactive | 400 000 FCFA |
| **Sous-total Phase 2** | **3 300 000 FCFA** |

### Phase 3 — Différenciation

| Poste | Estimation |
|---|---|
| Suggestion d'itinéraire guidée | 700 000 FCFA |
| Espace client sécurisé | 900 000 FCFA |
| PWA et mode basse connexion | 500 000 FCFA |
| Automatisations WhatsApp avancées | 600 000 FCFA |
| Tableau de bord marketing | 400 000 FCFA |
| Programme de fidélité | 500 000 FCFA |
| **Sous-total Phase 3** | **3 600 000 FCFA** |

### Frais récurrents (mensuels)

| Poste | Estimation |
|---|---|
| Hébergement VPS + CDN | 35 000 FCFA / mois |
| Nom de domaine | 15 000 FCFA / an |
| Maintenance technique (sauvegardes, mises à jour, support) | 150 000 FCFA / mois |
| WhatsApp Business API (selon volume) | 25 000 FCFA / mois |
| Frais de paiement en ligne | Variable (≈ 2-3 % par transaction) |

### Total indicatif sur le projet complet

**Phase 1 seule (recommandé pour démarrer) : ≈ 5 300 000 FCFA**
**Projet complet 3 phases : ≈ 12 200 000 FCFA**

---

## 13. Aspects légaux et conformité

À cadrer avec le client en début de projet :

- Licence d'agence de voyage et numéro d'agrément à afficher.
- Conditions générales de vente conformes au droit sénégalais.
- Politique de confidentialité (collecte de données, cookies).
- Mentions légales obligatoires.
- Conformité paiement (PCI-DSS si stockage carte — à éviter, déléguer au prestataire de paiement).

---

## 14. Stratégie de contenu et SEO

- **SEO local :** mots-clés "agence touristique Dakar", "excursion Gorée", "circuit Sénégal", "tour Dakar", "things to do in Dakar".
- **Données structurées :** Schema.org LocalBusiness, TouristTrip, Review.
- **Google Business Profile :** à optimiser et alimenter en parallèle du site.
- **Calendrier éditorial :** 2 à 4 articles de blog par mois (à produire par l'agence ou via prestation rédaction).
- **Réseaux sociaux :** Instagram et TikTok prioritaires, contenu vertical court, intégré sur le site.

---

## 15. Suivi, mesure et amélioration continue

- **Google Analytics 4** pour le trafic et les conversions.
- **Meta Pixel** pour le remarketing Facebook / Instagram.
- **Tracking des clics WhatsApp** (événement personnalisé).
- **Hotjar ou équivalent** (optionnel) pour observer le comportement.
- **Tableau de bord interne** dans l'admin avec les KPIs métier (demandes/mois, taux de conversion, panier moyen).

---

## 16. Maintenance et évolution

Après la mise en ligne, prévoir un contrat de maintenance mensuel couvrant :

- Hébergement, sauvegardes quotidiennes, monitoring uptime.
- Mises à jour de sécurité Laravel et dépendances.
- Petites évolutions et corrections (forfait d'heures incluses).
- Support technique pour l'équipe de l'agence.
- Rapport mensuel d'activité.

---

## 17. Sources consultées

- SAPCO Sénégal — destinations touristiques : https://sapco.sn/le-tourisme-au-senegal/
- DataReportal — Digital 2025 Sénégal : https://datareportal.com/reports/digital-2025-senegal
- UNESCO — Île de Gorée : https://whc.unesco.org/en/list/26/
- UNESCO — Parc national du Djoudj : https://whc.unesco.org/en/list/25/
- Google Search Central — LocalBusiness : https://developers.google.com/search/docs/appearance/structured-data/local-business
- Think with Google / PhocusWright — voyageurs et mobile : https://www.thinkwithgoogle.com/_qs/documents/5602/1171-How-Smartphones-Influence-the-Journey-Download.pdf
- Expedia Group — Path to Purchase : https://www.expedia.com/newsroom/eg-path-to-purchase-research/
- Orange Developer — Orange Money Web Payment : https://developer.orange.com/apis/om-webpay?hl=fr-fr
- PayTech Sénégal : https://paytech.sn/
- Filament (admin Laravel) : https://filamentphp.com/

---

## 18. Recommandation finale

Le projet se structure autour de trois piliers :

1. **Un site public visuel et mobile-first** qui inspire et convertit les trois cibles (diaspora, local, étrangers).
2. **Un dashboard administrateur exhaustif** qui rend l'agence totalement autonome sur le contenu, les offres, les images, les prix, les langues, les promotions et le suivi des demandes.
3. **Un système de conversion adapté au contexte sénégalais** : WhatsApp pré-rempli, carnet de voyage partageable, paiement Wave / Orange Money / carte.

**Démarrer par la Phase 1 uniquement** est la stratégie la plus saine : livraison rapide, premier retour client réel, ajustements concrets avant d'investir dans les phases suivantes.

Le vrai élément différenciant ne sera pas une "belle vitrine", mais un **outil opérationnel** qui aide l'agence à vendre, suivre les prospects et transformer les demandes WhatsApp en réservations organisées.

---

*Document préparé pour discussion avec le client. Les budgets et les délais seront affinés après cadrage détaillé et choix techniques validés.*

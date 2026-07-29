-- Synchro Supabase — corrections traductions ACT (retour agence, 29 juil. 2026)
-- Met à jour UNIQUEMENT les champs affichés depuis la base (overlay) :
--   circuits(title,subtitle), excursions(title,short), ateliers(title,subtitle,short).
-- Les 4 langues sont réécrites depuis src/i18n.jsx corrigé (FR/IT inchangés, EN/DE corrigés).
-- À exécuter dans Supabase → SQL Editor. Sûr : slug absent = 0 ligne (no-op).

begin;

update public.circuits set
  subtitle_en = '3 days · bolongs, MANDINKA villages & Joal',
  subtitle_fr = '3 jours · bolongs, villages MANDINGUES & Joal',
  subtitle_it = '3 giorni · bolong, villaggi MANDINGA e Joal',
  subtitle_de = '3 Tage · Bolongs, MANDINKA-Dörfer & Joal'
where slug = 'saloum-kaolack-sipo-3j';

update public.circuits set
  title_en = 'Casamance & MANDINKA Country',
  title_fr = 'Casamance & pays MANDINGUE',
  title_it = 'Casamance e paese MANDINGA',
  title_de = 'Casamance & MANDINKA-Land'
where slug = 'casamance-mandingue-4j';

update public.circuits set
  title_en = 'Dakar Essentials',
  title_fr = 'Dakar essentiel',
  title_it = 'L''essenziale su Dakar',
  title_de = 'Das Wesentliche von Dakar'
where slug = 'dakar-essentiel';

update public.excursions set
  short_en = 'Pink Lake (Retba), one of the world’s rarest natural phenomena. The lake’s pink hues, caused by microorganisms and high salinity, are set against a backdrop of white sand dunes. Meet the women who harvest the salt and visit the surrounding FULANI villages.',
  short_fr = 'Le Lac Rose (Retba), un des phénomènes naturels les plus rares au monde. Reflets roses du lac dus aux micro-organismes et à la forte salinité, sur fond de dunes de sable blanc. Rencontre avec les ramasseuses de sel et les villages PEULS environnants.',
  short_it = 'Il Lago Rosa (Retba), uno dei fenomeni naturali più rari al mondo. I riflessi rosati del lago, dovuti ai microrganismi e all’elevata salinità, sullo sfondo delle dune di sabbia bianca. Incontro con le raccoglitrici di sale e i villaggi FULA dei dintorni.',
  short_de = 'Der Rosa See (Retba), eines der seltensten Naturphänomene der Welt. Die rosa Schimmer des Sees, die durch Mikroorganismen und den hohen Salzgehalt entstehen, vor dem Hintergrund weißer Sanddünen. Begegnung mit den Salzsammlerinnen und den umliegenden FULA-Dörfern.'
where slug = 'lac-rose-halfday';

update public.excursions set
  short_en = 'The old town of Rufisque, with narrow streets lined with houses featuring wrought-iron balconies. Bush villages and herds of long-horned cattle tended by semi-nomadic FULANI herders. The colorful market in Thiès, the Manufacture des Tapisseries d''Art, and lunch on Saly Beach. A first glimpse of the country’s cultural mosaic — a true encounter with Senegal’s different ethnic groups can only be experienced within an organized multi-day tour.',
  short_fr = 'Vieille ville de Rufisque, ruelles bordées de maisons à balcons en fer forgé. Villages de brousse et troupeaux de bovins à longues cornes gardés par les bergers PEULS semi-nomades. Marché coloré de Thiès, Manufacture des Tapisseries d''Art, déjeuner sur la plage de Saly. Un premier aperçu de la mosaïque culturelle du pays : la rencontre approfondie des différentes ethnies du Sénégal se vit uniquement dans le cadre d''un circuit organisé de plusieurs jours.',
  short_it = 'Centro storico di Rufisque, vicoli fiancheggiati da case con balconi in ferro battuto. Villaggi di campagna e mandrie di bovini dalle lunghe corna custodite dai pastori FULA seminomadi. Il colorato mercato di Thiès, la Manifattura di Arazzi d’Arte, pranzo sulla spiaggia di Saly. Un primo assaggio del mosaico culturale del Paese: il vero incontro con le diverse etnie del Senegal si vive soltanto nell’ambito di un circuito organizzato di più giorni.',
  short_de = 'Altstadt von Rufisque, Gassen, gesäumt von Häusern mit schmiedeeisernen Balkonen. Buschdörfer und Herden langhörniger Rinder, die von halbnomadischen FULA-Hirten gehütet werden. Bunter Markt von Thiès, Manufaktur für Kunstteppiche, Mittagessen am Strand von Saly. Ein erster Einblick in das kulturelle Mosaik des Landes – die echte Begegnung mit den verschiedenen Volksgruppen des Senegal erlebt man nur im Rahmen einer mehrtägigen organisierten Rundreise.'
where slug = 'ethnicity-fullday';

update public.excursions set
  short_en = 'Full-day trip to Pink Lake, followed by a visit to the fishing village of Cayar. Tour of FULANI villages and interaction with the local community. Lunch at a local restaurant. A lively scene as the big-game fishing boats arrive in Cayar, with fishermen and vendors haggling on the beach, which has been transformed into a market.',
  short_fr = 'Journée complète Lac Rose puis village de pêche de Cayar. Visite des villages PEULS et rencontre avec la communauté locale. Déjeuner dans un restaurant local. Arrivée animée des bateaux de pêche au gros à Cayar, négociation entre pêcheurs et revendeuses sur la plage transformée en marché.',
  short_it = 'Giornata intera dedicata al Lago Rosa e al villaggio di pescatori di Cayar. Visita ai villaggi FULA e incontro con la comunità locale. Pranzo in un ristorante locale. Arrivo animato delle barche da pesca d’altura a Cayar, contrattazioni tra pescatori e venditrici sulla spiaggia trasformata in mercato.',
  short_de = 'Ganztägiger Ausflug zum Rosa See und anschließend zum Fischerdorf Cayar. Besuch der FULA-Dörfer und Begegnung mit der lokalen Bevölkerung. Mittagessen in einem lokalen Restaurant. Lebhafte Ankunft der Hochseefischerboote in Cayar, Verhandlungen zwischen Fischern und Verkäuferinnen am Strand, der sich in einen Markt verwandelt hat.'
where slug = 'lac-rose-cayar-fullday';

update public.excursions set
  short_en = 'Sindia Baobab Forest, WOLOF and FULANI villages. Motorized canoes from Ndangane to the nature reserve—the NIOMINKA fishing village, Dionewar Island and its picturesque mosque, meeting with the village chief and the imam. The village of Mar Lodj (population 1,500), exemplary religious tolerance, ancient sacred drum.',
  short_fr = 'Forêt de baobabs de Sindia, villages WOLOF et PEULS. Pirogues à moteur depuis Ndangane vers la réserve naturelle — village de pêcheurs NIOMINKAS, île de Dionewar et sa mosquée pittoresque, rencontre avec le chef du village et l''imam. Village de Mar Lodj (1500 habitants), tolérance religieuse exemplaire, ancien tambour sacré.',
  short_it = 'Foresta di baobab di Sindia, villaggi WOLOF e FULA. Pirogue a motore da Ndangane verso la riserva naturale — villaggio di pescatori NIOMINKA, isola di Dionewar e la sua pittoresca moschea, incontro con il capo del villaggio e l''imam. Villaggio di Mar Lodj (1500 abitanti), tolleranza religiosa esemplare, antico tamburo sacro.',
  short_de = 'Baobab-Wald von Sindia, WOLOF- und FULA-Dörfer. Motorboote von Ndangane zum Naturschutzgebiet – das NIOMINKA-Fischerdorf, die Insel Dionewar mit ihrer malerischen Moschee, Treffen mit dem Dorfvorsteher und dem Imam. Das Dorf Mar Lodj (1.500 Einwohner), vorbildliche religiöse Toleranz, alte heilige Trommel.'
where slug = 'saloum-islands-fullday';

update public.ateliers set
  short_en = 'Introduction to traditional Senegalese dances: WOLOF sabar, FULANI yela, DIOLA movements. Classes with a master dancer, accompanied by live percussion.',
  short_fr = 'Initiation aux danses traditionnelles sénégalaises : sabar WOLOF, yela PEUL, mouvements DIOLA. Cours avec un maître-danseur, accompagnement percussions live.',
  short_it = 'Introduzione alle danze tradizionali del Senegal: sabar WOLOF, yela FULA, movimenti DIOLA. Lezioni con un maestro di danza, accompagnamento dal vivo con percussioni.',
  short_de = 'Einführung in traditionelle senegalesische Tänze: Sabar WOLOF, Yela FULA, DIOLA-Bewegungen. Unterricht mit einem Meistertänzer, begleitet von Live-Percussion.'
where slug = 'danse';

commit;

-- Corrections ACT + majuscules ethnies — synchronisation Supabase
-- Généré depuis le diff HEAD~1..HEAD de src/i18n.jsx (commit bc7aa41).
-- Met à jour UNIQUEMENT les champs affichés depuis la base (overlay):
--   circuits(title,subtitle), excursions(title,short), ateliers(title,subtitle,short).
-- À exécuter dans Supabase → SQL Editor. Sûr : ne touche que les champs corrigés.

begin;

update public.circuits set
  subtitle_en = 'Cap Skirring & DIOLA Villages',
  subtitle_fr = 'Cap Skirring & villages DIOLAS',
  subtitle_it = 'Cap Skirring e i villaggi DIOLA',
  subtitle_de = 'Cap Skirring & DIOLA-Dörfer'
where slug = 'casamance-essentielle';

update public.circuits set
  subtitle_en = '3 days · bolongs, MANDINGO villages & Joal',
  subtitle_fr = '3 jours · bolongs, villages MANDINGUES & Joal',
  subtitle_it = '3 giorni · bolong, villaggi MANDINGA e Joal',
  subtitle_de = '3 Tage · Bolongs, MANDINKA-Dörfer & Joal'
where slug = 'saloum-kaolack-sipo-3j';

update public.circuits set
  title_en = 'Casamance & MANDINGO Country',
  title_fr = 'Casamance & pays MANDINGUE',
  title_it = 'Casamance e paese MANDINGA',
  title_de = 'Casamance & MANDINKA-Land'
where slug = 'casamance-mandingue-4j';

update public.circuits set
  title_en = 'BASSARI & BEDIK Country — Rites of Passage',
  title_fr = 'Pays BASSARI & BEDIK — rites de passage',
  title_it = 'Paese BASSARI & BEDIK — riti di passaggio',
  title_de = 'BASSARI- & BEDIK-Land — Übergangsriten'
where slug = 'bassari-bedik-12j';

update public.circuits set
  title_en = 'Kédougou & the BASSARI Country',
  title_fr = 'Kédougou & pays BASSARI',
  title_it = 'Kédougou e il Paese BASSARI',
  title_de = 'Kédougou und das BASSARI-Land'
where slug = 'kedougou-bassari';

update public.excursions set
  short_en = 'Pink Lake (Retba), one of the world’s rarest natural phenomena. The lake’s pink hues, caused by microorganisms and high salinity, are set against a backdrop of white sand dunes. Meet the women who harvest the salt and visit the surrounding FULA villages.',
  short_fr = 'Le Lac Rose (Retba), un des phénomènes naturels les plus rares au monde. Reflets roses du lac dus aux micro-organismes et à la forte salinité, sur fond de dunes de sable blanc. Rencontre avec les ramasseuses de sel et les villages PEULS environnants.',
  short_it = 'Il Lago Rosa (Retba), uno dei fenomeni naturali più rari al mondo. I riflessi rosati del lago, dovuti ai microrganismi e all’elevata salinità, sullo sfondo delle dune di sabbia bianca. Incontro con le raccoglitrici di sale e i villaggi FULA dei dintorni.',
  short_de = 'Der Rosa See (Retba), eines der seltensten Naturphänomene der Welt. Die rosa Schimmer des Sees, die durch Mikroorganismen und den hohen Salzgehalt entstehen, vor dem Hintergrund weißer Sanddünen. Begegnung mit den Salzsammlerinnen und den umliegenden FULA-Dörfern.'
where slug = 'lac-rose-halfday';

update public.excursions set
  short_en = 'The old town of Rufisque, with narrow streets lined with houses featuring wrought-iron balconies. Bush villages and herds of long-horned cattle tended by semi-nomadic FULA herders. The colorful market in Thiès, the Manufacture des Tapisseries d''Art, and lunch on Saly Beach. A first glimpse of the country’s cultural mosaic — a true encounter with Senegal’s different ethnic groups can only be experienced within an organized multi-day tour.',
  short_fr = 'Vieille ville de Rufisque, ruelles bordées de maisons à balcons en fer forgé. Villages de brousse et troupeaux de bovins à longues cornes gardés par les bergers PEULS semi-nomades. Marché coloré de Thiès, Manufacture des Tapisseries d''Art, déjeuner sur la plage de Saly. Un premier aperçu de la mosaïque culturelle du pays : la rencontre approfondie des différentes ethnies du Sénégal se vit uniquement dans le cadre d''un circuit organisé de plusieurs jours.',
  short_it = 'Centro storico di Rufisque, vicoli fiancheggiati da case con balconi in ferro battuto. Villaggi di campagna e mandrie di bovini dalle lunghe corna custodite dai pastori FULA seminomadi. Il colorato mercato di Thiès, la Manifattura di Arazzi d’Arte, pranzo sulla spiaggia di Saly. Un primo assaggio del mosaico culturale del Paese: il vero incontro con le diverse etnie del Senegal si vive soltanto nell’ambito di un circuito organizzato di più giorni.',
  short_de = 'Altstadt von Rufisque, Gassen, gesäumt von Häusern mit schmiedeeisernen Balkonen. Buschdörfer und Herden langhörniger Rinder, die von halbnomadischen FULA-Hirten gehütet werden. Bunter Markt von Thiès, Manufaktur für Kunstteppiche, Mittagessen am Strand von Saly. Ein erster Einblick in das kulturelle Mosaik des Landes – die echte Begegnung mit den verschiedenen Volksgruppen des Senegal erlebt man nur im Rahmen einer mehrtägigen organisierten Rundreise.'
where slug = 'ethnicity-fullday';

update public.excursions set
  short_en = 'Full-day trip to Pink Lake, followed by a visit to the fishing village of Cayar. Tour of FULA villages and interaction with the local community. Lunch at a local restaurant. A lively scene as the big-game fishing boats arrive in Cayar, with fishermen and vendors haggling on the beach, which has been transformed into a market.',
  short_fr = 'Journée complète Lac Rose puis village de pêche de Cayar. Visite des villages PEULS et rencontre avec la communauté locale. Déjeuner dans un restaurant local. Arrivée animée des bateaux de pêche au gros à Cayar, négociation entre pêcheurs et revendeuses sur la plage transformée en marché.',
  short_it = 'Giornata intera dedicata al Lago Rosa e al villaggio di pescatori di Cayar. Visita ai villaggi FULA e incontro con la comunità locale. Pranzo in un ristorante locale. Arrivo animato delle barche da pesca d’altura a Cayar, contrattazioni tra pescatori e venditrici sulla spiaggia trasformata in mercato.',
  short_de = 'Ganztägiger Ausflug zum Rosa See und anschließend zum Fischerdorf Cayar. Besuch der FULA-Dörfer und Begegnung mit der lokalen Bevölkerung. Mittagessen in einem lokalen Restaurant. Lebhafte Ankunft der Hochseefischerboote in Cayar, Verhandlungen zwischen Fischern und Verkäuferinnen am Strand, der sich in einen Markt verwandelt hat.'
where slug = 'lac-rose-cayar-fullday';

update public.excursions set
  short_en = 'Early morning departure from Dakar for the Saloum Islands (UNESCO 2011). Fumela palm grove, traditional SERER villages. In Ndangane, motorized canoes in the delta—birdwatching, fishing villages, bolongs. Lunch in Ndangane, followed by a visit to Joal-Fadiouth (SERER marine cemetery and granaries on stilts) and the bustling market in Mbour.',
  short_fr = 'Départ matinal de Dakar pour les Îles du Saloum (UNESCO 2011). Palmeraie de Fumela, villages SÉRÈRES traditionnels. À Ndangane, pirogues à moteur dans le delta — ornithologie, villages de pêcheurs, bolongs. Déjeuner à Ndangane, puis Joal-Fadiouth (cimetière marin SÉRÈRE et greniers sur pilotis) et marché animé de Mbour.',
  short_it = 'Partenza al mattino da Dakar alla volta delle Isole del Saloum (UNESCO 2011). Palmeraie di Fumela, villaggi tradizionali SERER. A Ndangane, gite in piroga a motore nel delta — birdwatching, villaggi di pescatori, bolong. Pranzo a Ndangane, poi Joal-Fadiouth (cimitero marino SERER e granai su palafitte) e il vivace mercato di Mbour.',
  short_de = 'Frühe Abfahrt von Dakar zu den Saloum-Inseln (UNESCO 2011). Palmenhain von Fumela, traditionelle SERER-Dörfer. In Ndangane Fahrt mit Motorpirogen im Delta – Vogelbeobachtung, Fischerdörfer, Bolongs. Mittagessen in Ndangane, anschließend Weiterfahrt nach Joal-Fadiouth (Meeresfriedhof der SERER und Getreidespeicher auf Pfählen) und zum lebhaften Markt von Mbour.'
where slug = 'saloum-joal-fullday';

update public.excursions set
  short_en = 'Sindia Baobab Forest, WOLOF and FULA villages. Motorized canoes from Ndangane to the nature reserve—the NIOMINKA fishing village, Dionewar Island and its picturesque mosque, meeting with the village chief and the imam. The village of Mar Lodj (population 1,500), exemplary religious tolerance, ancient sacred drum.',
  short_fr = 'Forêt de baobabs de Sindia, villages WOLOF et PEULS. Pirogues à moteur depuis Ndangane vers la réserve naturelle — village de pêcheurs NIOMINKAS, île de Dionewar et sa mosquée pittoresque, rencontre avec le chef du village et l''imam. Village de Mar Lodj (1500 habitants), tolérance religieuse exemplaire, ancien tambour sacré.',
  short_it = 'Foresta di baobab di Sindia, villaggi WOLOF e FULA. Pirogue a motore da Ndangane verso la riserva naturale — villaggio di pescatori NIOMINKA, isola di Dionewar e la sua pittoresca moschea, incontro con il capo del villaggio e l''imam. Villaggio di Mar Lodj (1500 abitanti), tolleranza religiosa esemplare, antico tamburo sacro.',
  short_de = 'Baobab-Wald von Sindia, WOLOF- und FULA-Dörfer. Motorboote von Ndangane zum Naturschutzgebiet – das NIOMINKA-Fischerdorf, die Insel Dionewar mit ihrer malerischen Moschee, Treffen mit dem Dorfvorsteher und dem Imam. Das Dorf Mar Lodj (1.500 Einwohner), vorbildliche religiöse Toleranz, alte heilige Trommel.'
where slug = 'saloum-islands-fullday';

update public.excursions set
  short_en = 'Drive through Sindia, Diamniadio, and several WOLOF and SERER villages. Arrival at Pink Lake; off-road excursion following the route of the Paris-Dakar Rally. Hike through the dunes, salt harvesting with local farmers, a FULANI village, and a wild beach. Lunch at the lake camp.',
  short_fr = 'Traversée de Sindia, Diamniadio et de plusieurs villages WOLOF et SÉRÈRES. Arrivée au Lac Rose, excursion en tout-terrain sur les traces du Rallye Paris-Dakar. Randonnée sur les dunes, ramassage du sel avec les exploitants, village PEULH, plage sauvage. Déjeuner au campement du Lac.',
  short_it = 'Attraversamento di Sindia, Diamniadio e di diversi villaggi WOLOF e SERER. Arrivo al Lago Rosa, escursione in fuoristrada sulle tracce del Rally Parigi-Dakar. Escursione sulle dune, raccolta del sale insieme ai coltivatori, villaggio PEUL, spiaggia selvaggia. Pranzo al campo sul lago.',
  short_de = 'Fahrt durch Sindia, Diamniadio und mehrere WOLOF- und SERER-Dörfer. Ankunft am Rosa See, Geländewagen-Ausflug auf den Spuren der Rallye Paris-Dakar. Wanderung durch die Dünen, Salzgewinnung gemeinsam mit den Betreibern, FULBE-Dorf, unberührter Strand. Mittagessen im Lager am See.'
where slug = 'saly-lac-rose-fullday';

update public.excursions set
  short_en = 'Drive through Sindia, Nguekhokh, and Diamniadio, passing through WOLOF and SERER villages. Arrival at Pink Lake, followed by an off-road excursion in the footsteps of the Paris-Dakar Rally. Enjoy a refreshing drink by the lake before returning to the hotel.',
  short_fr = 'Traversée de Sindia, Nguekhokh, Diamniadio, villages WOLOF et SÉRÈRES. Arrivée au Lac Rose, excursion en tout-terrain sur les traces du Rallye Paris-Dakar. Boisson rafraîchissante autour du Lac avant retour à l''hôtel.',
  short_it = 'Attraversamento di Sindia, Nguekhokh, Diamniadio, villaggi WOLOF e SERER. Arrivo al Lago Rosa, escursione in fuoristrada sulle tracce del Rally Parigi-Dakar. Bevanda rinfrescante in riva al lago prima del ritorno in hotel.',
  short_de = 'Fahrt durch Sindia, Nguekhokh, Diamniadio sowie WOLOF- und SERER-Dörfer. Ankunft am Rosa See, Geländewagen-Ausflug auf den Spuren der Rallye Paris-Dakar. Erfrischungsgetränk am See, bevor es zurück zum Hotel geht.'
where slug = 'saly-lac-rose-halfday';

update public.excursions set
  short_en = 'Departure for the SERER village of Keur Moussa in the Niayes region. An African-style Sunday Mass at the Benedictine monastery: African hymns instead of Gregorian chants, priests in African vestments, and the rhythms of the kora, balafon, and djembes accompanying the choir. A moment of intense communion.',
  short_fr = 'Départ vers le village SÉRÈRE de Keur Moussa dans les Niayes. Messe dominicale à l''africaine au couvent bénédictin : cantiques africains au lieu des chants grégoriens, prêtres en parements africains, rythmes de kora, balafon et djembés accompagnant les chœurs. Moment de communion intense.',
  short_it = 'Partenza alla volta del villaggio SERER di Keur Moussa, nella regione dei Niayes. Messa domenicale in stile africano presso il convento benedettino: inni africani al posto dei canti gregoriani, sacerdoti in paramenti africani, ritmi di kora, balafon e djembe che accompagnano i cori. Un momento di intensa comunione.',
  short_de = 'Abfahrt zum SERER-Dorf Keur Moussa in den Niayes. Sonntagsmesse nach afrikanischer Art im Benediktinerkloster: afrikanische Kirchenlieder anstelle von gregorianischen Gesängen, Priester in afrikanischen Gewändern, Rhythmen von Kora, Balafon und Djembés, die den Chor begleiten. Ein Moment intensiver Gemeinschaft.'
where slug = 'saly-keur-moussa-halfday';

update public.excursions set
  short_en = 'Departure from the hotel to the LEBOU village of Somone (15 km). A 2-km hike through the ecological project in the heart of the nature reserve (waterbirds). Canoe ride: mullet, tilapia, crabs, carp. Visit with a women’s cooperative involved in oyster farming.',
  short_fr = 'Départ de l''hôtel vers le village LÉBOU de la Somone (15 km). Trekking de 2 km à travers le chantier écologique au cœur de la réserve naturelle (oiseaux aquatiques). Balade en pirogue : mulets, tilapias, crabes, carpes. Rencontre avec une coopérative féminine active dans l''ostréiculture.',
  short_it = 'Partenza dall''hotel verso il villaggio LEBOU di Somone (15 km). Escursione di 2 km attraverso il cantiere ecologico nel cuore della riserva naturale (uccelli acquatici). Gita in piroga: muli, tilapia, granchi, carpe. Incontro con una cooperativa femminile attiva nell’ostricoltura.',
  short_de = 'Abfahrt vom Hotel zum LEBOU-Dorf Somone (15 km). 2 km lange Wanderung durch das ökologische Projektgebiet im Herzen des Naturschutzgebiets (Wasservögel). Pirogenfahrt: Meeräschen, Tilapias, Krabben, Karpfen. Besuch einer Frauenkooperative, die in der Austernzucht tätig ist.'
where slug = 'saly-somone-halfday';

update public.excursions set
  short_en = 'Journey through the SERER villages of the Petite Côte. In Ndangane, board a motorized pirogue: bird islands, mangroves, oyster beds, NIOMINKA fishermen. Aperitif on a deserted island. Afternoon in Joal-Fadiouth: Shell Island, millet granaries on stilts, the shell cemetery, and fish drying racks.',
  short_fr = 'Traversée des villages SÉRÈRES de la Petite Côte. À Ndangane, embarquement en pirogue motorisée : îles aux oiseaux, mangrove, bancs d''huîtres, pêcheurs NIOMINKA. Apéro sur une île déserte. Après-midi à Joal-Fadiouth : île aux coquillages, greniers à mil sur pilotis, cimetière aux coquillages, séchoirs à poissons.',
  short_it = 'Attraversamento dei villaggi SERER della Petite Côte. A Ndangane, imbarco su una piroga a motore: isole degli uccelli, mangrovie, banchi di ostriche, pescatori NIOMINKA. Aperitivo su un’isola deserta. Pomeriggio a Joal-Fadiouth: isola delle conchiglie, granai per il miglio su palafitte, cimitero delle conchiglie, essiccatoi per il pesce.',
  short_de = 'Fahrt durch die SERER-Dörfer der Petite Côte. In Ndangane Einschiffung in eine motorisierte Piroge: Vogelinseln, Mangroven, Austernbänke, NIOMINKA-Fischer. Apéro auf einer einsamen Insel. Nachmittag in Joal-Fadiouth: Muschelinsel, Hirse-Speicher auf Pfählen, Muschelfriedhof, Fisch-Trockenplätze.'
where slug = 'saly-saloum-joal-fullday';

update public.excursions set
  short_fr = 'Départ après petit-déjeuner à travers la forêt de baobabs de Sindia jusqu''à la réserve de Bandia. Safari en véhicule 4x4 avec guide spécialiste de la faune : antilopes-chevaux, buffles, crocodiles, phacochères, singes, girafes, rhinocéros blancs, gazelles, oiseaux.'
where slug = 'saly-bandia-halfday';

update public.ateliers set
  subtitle_en = 'Traditional MANDINKA xylophone',
  short_en = 'Introduction to the balafon, wooden xylophone, and calabashes. Construction, tuning, and playing techniques. Learning traditional MANDINKA melodies.',
  subtitle_fr = 'Xylophone traditionnel MANDINGUE',
  short_fr = 'Découverte du balafon, xylophone en bois et calebasses. Fabrication, accordage, techniques de jeu. Apprentissage de mélodies traditionnelles MANDINGUES.',
  subtitle_it = 'Xilofono tradizionale MANDINGA',
  short_it = 'Introduzione al balafon, allo xilofono in legno e alle zucche. Costruzione, accordatura, tecniche di esecuzione. Apprendimento di melodie tradizionali MANDINGA.',
  subtitle_de = 'Traditionelles MANDINKA-Xylophon',
  short_de = 'Kennenlernen des Balafons, des Holzxylophons und der Kalebassen. Bau, Stimmung, Spieltechniken. Erlernen traditioneller MANDINKA-Melodien.'
where slug = 'balafon';

update public.ateliers set
  short_en = 'Introduction to traditional Senegalese dances: WOLOF sabar, FULA yela, DIOLA movements. Classes with a master dancer, accompanied by live percussion.',
  short_fr = 'Initiation aux danses traditionnelles sénégalaises : sabar WOLOF, yela PEUL, mouvements DIOLA. Cours avec un maître-danseur, accompagnement percussions live.',
  short_it = 'Introduzione alle danze tradizionali del Senegal: sabar WOLOF, yela FULA, movimenti DIOLA. Lezioni con un maestro di danza, accompagnamento dal vivo con percussioni.',
  short_de = 'Einführung in traditionelle senegalesische Tänze: Sabar WOLOF, Yela FULA, DIOLA-Bewegungen. Unterricht mit einem Meistertänzer, begleitet von Live-Percussion.'
where slug = 'danse';

commit;

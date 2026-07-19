-- =====================================================================
-- 008 — Grands voyages ACT (brochure « NEW BOOK ANGLAIS », juillet 2026)
--
-- Ajoute les 8 longs circuits thématiques & multi-pays de la brochure, en
-- complément des 7 circuits de la migration 007. Purement additif (aucun
-- placeholder à retirer). Les libellés IT/DE sont laissés NULL : le site les
-- affiche en anglais via la cascade i18n (lang → EN), et l'admin signale la
-- traduction manquante (pastille orange) — à compléter plus tard.
--
-- Le programme jour par jour vit dans le CODE (data.jsx + i18n) ; la colonne
-- itinerary ci-dessous ne sert qu'à l'affichage/édition dans l'admin.
--
-- À exécuter dans Supabase → SQL Editor (comme les migrations 001-007).
-- =====================================================================

insert into public.circuits
  (slug, title_fr, title_en, subtitle_fr, subtitle_en, description_fr,
   duration_days, region, category, published, sort_order, itinerary)
values
  ('rythme-danse-9j',
   'Rythme & Danse du Sénégal', 'Senegal Rhythm & Dance',
   '9 jours · musiques et danses, du Saloum à la Casamance',
   '9 days · music and dance, from the Saloum to Casamance',
   'Neuf jours à la rencontre des musiques et danses qui racontent les peuples du Sénégal : Yela peul du Saloum, Ngoyane sérère, kora mandingue en Gambie, rythmes sacrés et Inconting de Casamance.',
   9, 'Sénégal & Gambie', 'culture', true, 80,
   '[{"day":1,"title_fr":"Dakar"},{"day":2,"title_fr":"Dakar → Saloum"},{"day":3,"title_fr":"Îles du Saloum"},{"day":4,"title_fr":"Saloum → Gambie (Banjul)"},{"day":5,"title_fr":"Banjul → Ziguinchor"},{"day":6,"title_fr":"Basse Casamance"},{"day":7,"title_fr":"Ziguinchor → Saly"},{"day":8,"title_fr":"Saly"},{"day":9,"title_fr":"Saly & départ"}]'::jsonb),

  ('face-du-senegal-8j',
   'Le Visage du Sénégal', 'The Face of Senegal',
   '8 jours · Gorée, Saint-Louis, Touba & le Saloum',
   '8 days · Gorée, Saint-Louis, Touba & the Saloum',
   'Le tour de référence du pays : Dakar et Gorée, le Lac Rose, Saint-Louis et le parc du Djoudj, la ville sainte de Touba, puis le delta du Saloum et Joal-Fadiouth.',
   8, 'Sénégal', 'mixte', true, 90,
   '[{"day":1,"title_fr":"Arrivée à Dakar"},{"day":2,"title_fr":"Dakar & Gorée"},{"day":3,"title_fr":"Dakar → Lac Rose → Saint-Louis"},{"day":4,"title_fr":"Saint-Louis & parc du Djoudj"},{"day":5,"title_fr":"Saint-Louis → Touba → Kaolack"},{"day":6,"title_fr":"Kaolack → Toubacouta"},{"day":7,"title_fr":"Delta du Saloum"},{"day":8,"title_fr":"Joal-Fadiouth → Saly & départ"}]'::jsonb),

  ('bassari-bedik-12j',
   'Pays Bassari & Bedik — rites de passage', 'Bassari & Bedik Country — Rites of Passage',
   '12 jours · Sénégal oriental, immersion & cérémonies',
   '12 days · Eastern Senegal, immersion & ceremonies',
   'Douze jours dans le Sénégal oriental, hôtes des sociétés bassari et bedik du Fouta Djalon : safari au Niokolo-Koba, villages perchés d''Iwol et d''Etiolo, maîtres d''initiation et rites de passage, chutes de Dindéfélo.',
   12, 'Sénégal oriental', 'nature', true, 100,
   '[{"day":1,"title_fr":"Dakar"},{"day":2,"title_fr":"Dakar → Tambacounda → Wassadou"},{"day":3,"title_fr":"Safari au Niokolo-Koba"},{"day":4,"title_fr":"Niokolo → Kédougou → Iwol"},{"day":5,"title_fr":"Pays Bedik (Iwol)"},{"day":6,"title_fr":"Kédougou → pays Bassari → Etiolo"},{"day":7,"title_fr":"Etiolo → pays Bedik → Kédougou"},{"day":8,"title_fr":"Kédougou & chutes de Dindéfélo"},{"day":9,"title_fr":"Kédougou → Tambacounda → Toubacouta"},{"day":10,"title_fr":"Delta du Saloum"},{"day":11,"title_fr":"Delta du Saloum"},{"day":12,"title_fr":"Toubacouta → Saly & départ"}]'::jsonb),

  ('medecine-traditionnelle-10j',
   'Sur les traces des guérisseurs', 'On the Tracks of the Medicine Men',
   '10 jours · médecine traditionnelle, du Saloum à la Casamance',
   '10 days · traditional medicine, from the Saloum to Casamance',
   'Dix jours à la découverte de la médecine traditionnelle sénégalaise : herboristes des marchés de Dakar, thérapie Ndepp, guérisseurs ostéopathes du Saloum, Saltigués et Xoy à Fatick, tradipraticiens de Casamance.',
   10, 'Sénégal', 'culture', true, 110,
   '[{"day":1,"title_fr":"Dakar"},{"day":2,"title_fr":"Dakar & Gorée"},{"day":3,"title_fr":"Dakar → Lac Rose → Djilor"},{"day":4,"title_fr":"Djilor & le Saloum"},{"day":5,"title_fr":"Djilor → Fatick → Toubacouta"},{"day":6,"title_fr":"Toubacouta → Ziguinchor"},{"day":7,"title_fr":"Kénia & Bignona"},{"day":8,"title_fr":"Oussouye & Cap Skirring"},{"day":9,"title_fr":"Ziguinchor → Saly"},{"day":10,"title_fr":"Saly & départ"}]'::jsonb),

  ('best-sene-gambia-11j',
   'Le meilleur de la Sénégambie', 'Best of Sene-Gambia',
   '11 jours · Sénégal oriental & fleuve Gambie',
   '11 days · eastern Senegal & the Gambia River',
   'Onze jours entre Sénégal et Gambie : mégalithes de Kaffrine, réserve de Kédougou et chutes de Dindéfélo, puis une croisière jour et nuit sur le fleuve Gambie jusqu''aux plages de Saly.',
   11, 'Sénégal & Gambie', 'mixte', true, 120,
   '[{"day":1,"title_fr":"Dakar"},{"day":2,"title_fr":"Dakar & Gorée"},{"day":3,"title_fr":"Dakar → Tambacounda"},{"day":4,"title_fr":"Tambacounda → Kédougou"},{"day":5,"title_fr":"Kédougou & chutes de Dindéfélo"},{"day":6,"title_fr":"Kédougou → Georgetown (Gambie)"},{"day":7,"title_fr":"Croisière sur le fleuve Gambie"},{"day":8,"title_fr":"Georgetown → Tendaba"},{"day":9,"title_fr":"Tendaba"},{"day":10,"title_fr":"Tendaba → Kaolack → Saly"},{"day":11,"title_fr":"Saly & départ"}]'::jsonb),

  ('sene-gambia-mauritanie-15j',
   'Sénégambie & Mauritanie', 'Sene-Gambia & Mauritania',
   '15 jours · du désert maure au fleuve Gambie',
   '15 days · from the Moorish desert to the Gambia River',
   'Quinze jours et trois pays : Gorée et le Lac Rose, Saint-Louis et le Djoudj, une nuit sous la tente bédouine dans le désert mauritanien et Nouakchott, le delta du Saloum, puis la Gambie de Juffureh.',
   15, 'Sénégal, Gambie & Mauritanie', 'mixte', true, 130,
   '[{"day":1,"title_fr":"Dakar"},{"day":2,"title_fr":"Gorée & Lac Rose"},{"day":3,"title_fr":"Lac Rose → Thiès → Saint-Louis"},{"day":4,"title_fr":"Parc du Djoudj & Saint-Louis"},{"day":5,"title_fr":"Saint-Louis → désert de Mauritanie"},{"day":6,"title_fr":"Nouakchott"},{"day":7,"title_fr":"Nouakchott → Saint-Louis → Kaolack"},{"day":8,"title_fr":"Kaolack → Toubacouta"},{"day":9,"title_fr":"Îles du delta du Saloum"},{"day":10,"title_fr":"Toubacouta → Banjul (Gambie)"},{"day":11,"title_fr":"Fleuve Gambie & Juffureh"},{"day":12,"title_fr":"Banjul & Kanilai"},{"day":13,"title_fr":"Katchikally"},{"day":14,"title_fr":"Banjul → Saly"},{"day":15,"title_fr":"Réserve de Bandia & départ"}]'::jsonb),

  ('senegal-guinee-15j',
   'Sénégal & Guinée', 'Senegal & Guinea',
   '15 jours · du fleuve au Fouta Djalon',
   '15 days · from the river to the Fouta Djallon',
   'Quinze jours du Sénégal à la Guinée : Gorée, le Lac Rose, Saint-Louis et le Djoudj, le safari du Niokolo, puis les montagnes du Fouta Djalon — Labé, Dalaba, les chutes de Ditinn et du Voile de la Mariée — jusqu''à Conakry.',
   15, 'Sénégal & Guinée', 'nature', true, 140,
   '[{"day":1,"title_fr":"Dakar"},{"day":2,"title_fr":"Dakar & Gorée"},{"day":3,"title_fr":"Dakar → Lac Rose → Saint-Louis"},{"day":4,"title_fr":"Saint-Louis & parc du Djoudj"},{"day":5,"title_fr":"Saint-Louis → Sine Saloum"},{"day":6,"title_fr":"Sine Saloum → Niokolobadiar"},{"day":7,"title_fr":"Safari au Niokolobadiar"},{"day":8,"title_fr":"Niokolobadiar → Labé (Guinée)"},{"day":9,"title_fr":"Labé"},{"day":10,"title_fr":"Labé → Dalaba"},{"day":11,"title_fr":"Dalaba → Linsan"},{"day":12,"title_fr":"Chutes du Voile de la Mariée"},{"day":13,"title_fr":"Dubréka → Conakry"},{"day":14,"title_fr":"Îles de Loos"},{"day":15,"title_fr":"Conakry & départ"}]'::jsonb),

  ('gold-coast-15j',
   'Gold Coast Explorer', 'Gold Coast Explorer',
   '15 jours · Côte d''Ivoire, Ghana, Togo & Bénin',
   '15 days · Côte d''Ivoire, Ghana, Togo & Benin',
   'Quinze jours le long du golfe de Guinée, à travers quatre pays : Grand-Bassam et Abidjan, les forts d''Elmina et de Cape Coast au Ghana, Lomé et les pays Tamberma au Togo, puis le Bénin vodou — Abomey, Ganvié et Ouidah.',
   15, 'Côte d''Ivoire, Ghana, Togo & Bénin', 'culture', true, 150,
   '[{"day":1,"title_fr":"Abidjan"},{"day":2,"title_fr":"Abidjan & Grand-Bassam"},{"day":3,"title_fr":"Grand-Bassam → Axim → Cape Coast"},{"day":4,"title_fr":"Cape Coast → Accra"},{"day":5,"title_fr":"Accra → Lomé"},{"day":6,"title_fr":"Lomé → Atakpamé"},{"day":7,"title_fr":"Atakpamé → Kara"},{"day":8,"title_fr":"Kara → chutes de Tanougou (Bénin)"},{"day":9,"title_fr":"Tanougou → Natitingou"},{"day":10,"title_fr":"Natitingou → Parakou"},{"day":11,"title_fr":"Parakou → Abomey → Bohicon"},{"day":12,"title_fr":"Bohicon → Ganvié → Ouidah"},{"day":13,"title_fr":"Ouidah → Cotonou"},{"day":14,"title_fr":"Cotonou → Porto-Novo"},{"day":15,"title_fr":"Cotonou & départ"}]'::jsonb)

on conflict (slug) do update set
  title_fr = excluded.title_fr, title_en = excluded.title_en,
  subtitle_fr = excluded.subtitle_fr, subtitle_en = excluded.subtitle_en,
  description_fr = excluded.description_fr,
  duration_days = excluded.duration_days,
  region = excluded.region, category = excluded.category,
  published = excluded.published, sort_order = excluded.sort_order,
  itinerary = excluded.itinerary;

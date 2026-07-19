-- =====================================================================
-- 009 — Traductions IT/DE des grands voyages (titres & sous-titres)
--
-- Complète la migration 008 : renseigne title_it/de et subtitle_it/de des
-- 8 grands voyages, désormais traduits en italien et allemand dans le code
-- (i18n). Le site les affichait déjà via l'i18n ; cette mise à jour aligne
-- la base pour que l'admin ne signale plus ces langues comme manquantes
-- (pastilles vertes). Les programmes jour par jour restent pilotés par le
-- code (i18n), non par la base.
--
-- À exécuter dans Supabase → SQL Editor (comme les migrations 001-008).
-- =====================================================================

update public.circuits set
  title_it = 'Ritmo & Danza del Senegal', title_de = 'Rhythmus & Tanz des Senegal',
  subtitle_it = '9 giorni · musica e danza, dal Saloum alla Casamance',
  subtitle_de = '9 Tage · Musik und Tanz, vom Saloum bis zur Casamance'
where slug = 'rythme-danse-9j';

update public.circuits set
  title_it = 'Il Volto del Senegal', title_de = 'Das Gesicht des Senegal',
  subtitle_it = '8 giorni · Gorée, Saint-Louis, Touba e il Saloum',
  subtitle_de = '8 Tage · Gorée, Saint-Louis, Touba & der Saloum'
where slug = 'face-du-senegal-8j';

update public.circuits set
  title_it = 'Paese Bassari & Bedik — riti di passaggio', title_de = 'Bassari- & Bedik-Land — Übergangsriten',
  subtitle_it = '12 giorni · Senegal orientale, immersione e cerimonie',
  subtitle_de = '12 Tage · Ostsenegal, Eintauchen & Zeremonien'
where slug = 'bassari-bedik-12j';

update public.circuits set
  title_it = 'Sulle tracce dei guaritori', title_de = 'Auf den Spuren der Heiler',
  subtitle_it = '10 giorni · medicina tradizionale, dal Saloum alla Casamance',
  subtitle_de = '10 Tage · traditionelle Medizin, vom Saloum bis zur Casamance'
where slug = 'medecine-traditionnelle-10j';

update public.circuits set
  title_it = 'Il meglio della Senegambia', title_de = 'Das Beste von Sene-Gambia',
  subtitle_it = '11 giorni · Senegal orientale e fiume Gambia',
  subtitle_de = '11 Tage · Ostsenegal & der Gambia-Fluss'
where slug = 'best-sene-gambia-11j';

update public.circuits set
  title_it = 'Senegambia & Mauritania', title_de = 'Sene-Gambia & Mauretanien',
  subtitle_it = '15 giorni · dal deserto moro al fiume Gambia',
  subtitle_de = '15 Tage · von der Maurenwüste zum Gambia-Fluss'
where slug = 'sene-gambia-mauritanie-15j';

update public.circuits set
  title_it = 'Senegal & Guinea', title_de = 'Senegal & Guinea',
  subtitle_it = '15 giorni · dal fiume al Fouta Djallon',
  subtitle_de = '15 Tage · vom Fluss zum Fouta Djallon'
where slug = 'senegal-guinee-15j';

update public.circuits set
  title_it = 'Gold Coast Explorer', title_de = 'Gold Coast Explorer',
  subtitle_it = '15 giorni · Costa d''Avorio, Ghana, Togo & Benin',
  subtitle_de = '15 Tage · Côte d''Ivoire, Ghana, Togo & Benin'
where slug = 'gold-coast-15j';

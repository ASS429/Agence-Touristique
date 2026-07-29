-- Correction FAQ (retour agence, 29 juil. 2026)
-- La FAQ est servie depuis la base (table faq_items), pas depuis le code i18n.
-- Reformulation de la question allemande (sens : « comment NOUS joindre »).
-- À exécuter dans Supabase → SQL Editor. Idempotent, cible 1 ligne.

begin;

update public.faq_items
set question_de = 'Wie erreichen Sie uns während Ihres Aufenthalts?'
where question_fr = 'Comment vous contacter pendant le séjour ?';

commit;

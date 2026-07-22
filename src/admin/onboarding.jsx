import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from './icons.jsx';
import { Btn } from './ui.jsx';

// =====================================================================
// src/admin/onboarding.jsx — Guide de prise en main intégré
//
// Un guide d'accueil pas-à-pas, en langage clair, qui explique le
// tableau de bord section par section.
//   • S'ouvre automatiquement à la toute première connexion.
//   • Se referme à volonté (croix, « Passer », ou « Terminer »).
//   • Se rouvre à tout moment via le bouton « ? » du header
//     (événement window 'act-open-onboarding') — voir shell.jsx.
//
// Le drapeau localStorage empêche seulement la réouverture AUTOMATIQUE ;
// le bouton d'aide rouvre le guide quand on veut.
// =====================================================================

const SEEN_KEY = 'act-admin-onboarding-seen-v1';

const STEPS = [
  {
    icon: 'sparkle', tone: 'terra',
    title: 'Bienvenue dans votre tableau de bord',
    lead: "Vous gérez ici l'intégralité de votre site act-senegal.com, sans aucune connaissance technique.",
    points: [
      'Chaque modification enregistrée est mise en ligne en direct sur le site.',
      "Le contenu existe en 4 langues : français, anglais, italien, allemand.",
      "Vous pouvez rouvrir ce guide à tout moment avec le bouton « ? » en haut à droite.",
    ],
  },
  {
    icon: 'overview', tone: 'ocean',
    title: 'Se repérer',
    lead: "Le menu de gauche regroupe toutes les sections. Le titre de la page en cours s'affiche en haut.",
    points: [
      'Général — vue d\'ensemble et demandes reçues.',
      'Catalogue — circuits, dates de départ, excursions, ateliers.',
      'Contenus — blog, témoignages, newsletter.',
      'À propos / Ressources — FAQ, médiathèque, réglages.',
      'Administration — vos comptes administrateurs.',
    ],
  },
  {
    icon: 'mail', tone: 'terra',
    title: 'Les demandes de vos clients',
    lead: "« Demandes reçues » est le cœur de votre activité : chaque devis, contact ou demande sur-mesure y arrive.",
    points: [
      'Une pastille indique le nombre de nouvelles demandes non traitées.',
      'Chaque demande a un statut : Nouvelle → En cours → Traitée.',
      'Vous recevez aussi chaque demande par e-mail, et pouvez y répondre directement.',
    ],
  },
  {
    icon: 'map', tone: 'ocean',
    title: 'Gérer votre catalogue',
    lead: "Circuits, dates de départ, excursions et ateliers se créent et se modifient dans le groupe « Catalogue ».",
    points: [
      'Le bouton « + Nouveau » en haut à droite crée un nouvel élément.',
      "Sur un circuit : titre, itinéraire jour par jour, prix, photos, badges.",
      "« Dates de départ » alimente le calendrier de disponibilités.",
    ],
  },
  {
    icon: 'pen', tone: 'terra',
    title: 'Multilingue & publication',
    lead: "Chaque texte existe en 4 langues. Le français est la version de référence.",
    points: [
      'Des pastilles FR / EN / IT / DE signalent les langues encore à traduire (en orange).',
      'Une aide à la traduction accélère le remplissage des autres langues.',
      'Chaque contenu peut rester en Brouillon puis passer en Publié quand il est prêt.',
    ],
  },
  {
    icon: 'image', tone: 'ocean',
    title: 'La médiathèque',
    lead: "Toutes vos photos sont centralisées dans « Médiathèque ».",
    points: [
      'Téléversez une image une fois, réutilisez-la partout.',
      'Privilégiez des photos nettes et bien cadrées pour un rendu soigné.',
    ],
  },
  {
    icon: 'settings', tone: 'terra',
    title: 'Contenus & réglages',
    lead: "Blog, témoignages, FAQ, newsletter et réglages du site sont éditables librement.",
    points: [
      '« Réglages site » : coordonnées, réseaux sociaux, informations légales, SEO.',
      'Ces informations alimentent le pied de page, la page contact et les PDF de devis.',
    ],
  },
  {
    icon: 'users', tone: 'ocean',
    title: 'Vos administrateurs',
    lead: "Dans « Administrateurs », vous gérez vos accès en toute autonomie.",
    points: [
      'Ajoutez ou retirez des comptes (Propriétaire ou Éditeur).',
      'Chacun peut changer son propre mot de passe depuis « Mon compte ».',
      "Plus besoin de contacter le prestataire pour créer un accès.",
    ],
  },
  {
    icon: 'check', tone: 'terra',
    title: 'Vous êtes prêt !',
    lead: "Explorez le tableau de bord à votre rythme. Rien n'est cassable : tout se modifie et se corrige.",
    points: [
      'Besoin de revoir ce guide ? Bouton « ? » en haut à droite.',
      'Un guide illustré pas-à-pas vous a aussi été remis en fichier.',
    ],
  },
];

const TONES = {
  terra: { chip: 'bg-terra-600/12 text-terra-700', dot: 'bg-terra-600' },
  ocean: { chip: 'bg-info-100 text-info-600', dot: 'bg-info-600' },
};

function OnboardingGuide() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  // Auto-ouverture à la première connexion.
  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === '1'; } catch { /* stockage indispo */ }
    if (!seen) setOpen(true);
  }, []);

  // Réouverture via le bouton d'aide du header.
  useEffect(() => {
    const openCb = () => { setI(0); setOpen(true); };
    window.addEventListener('act-open-onboarding', openCb);
    return () => window.removeEventListener('act-open-onboarding', openCb);
  }, []);

  const markSeen = useCallback(() => {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
  }, []);

  const close = useCallback(() => { markSeen(); setOpen(false); }, [markSeen]);

  // Échap pour fermer + flèches pour naviguer
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') setI(v => Math.min(STEPS.length - 1, v + 1));
      else if (e.key === 'ArrowLeft') setI(v => Math.max(0, v - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  const step = STEPS[i];
  const tone = TONES[step.tone] || TONES.terra;
  const isLast = i === STEPS.length - 1;
  const isFirst = i === 0;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-7"
      style={{ animation: 'act-fade .2s ease' }}
      onClick={close}
    >
      <div className="absolute inset-0 bg-ink-950/55 backdrop-blur-[3px]"/>
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-[540px] bg-sand-50 rounded-3xl overflow-hidden shadow-act-modal flex flex-col"
        style={{ maxHeight: '90vh', animation: 'act-pop .22s ease' }}
      >
        {/* Bandeau haut */}
        <div className="flex-shrink-0 px-6 pt-5 pb-4 bg-white border-b border-bone-200 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-400">
            <Icon name="book" size={14}/> Guide de prise en main
          </div>
          <button
            onClick={close}
            aria-label="Fermer le guide"
            className="w-9 h-9 -mt-1 -mr-1 rounded-xl border border-bone-300 bg-white text-mute-600 hover:bg-sand-100 flex items-center justify-center transition"
          >
            <Icon name="x" size={17}/>
          </button>
        </div>

        {/* Corps */}
        <div className="act-scroll flex-1 overflow-y-auto p-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${tone.chip}`}>
            <Icon name={step.icon} size={26}/>
          </div>
          <h2 className="font-display text-[27px] leading-tight text-ink-800">{step.title}</h2>
          <p className="mt-2 text-[14px] text-mute-600 leading-relaxed">{step.lead}</p>
          <ul className="mt-4 space-y-2.5">
            {step.points.map((p, k) => (
              <li key={k} className="flex gap-2.5 text-[13.5px] text-ink-700 leading-relaxed">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${tone.dot}`}/>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pied : progression + navigation */}
        <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-bone-200">
          <div className="flex items-center justify-between gap-4">
            {/* Points de progression */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, k) => (
                <button
                  key={k}
                  onClick={() => setI(k)}
                  aria-label={`Étape ${k + 1}`}
                  className={`h-1.5 rounded-full transition-all ${k === i ? 'w-5 bg-terra-600' : 'w-1.5 bg-bone-400 hover:bg-bone-500'}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {isFirst
                ? <button onClick={close} className="text-[13px] font-semibold text-mute-500 hover:text-ink-700 transition px-2">Passer</button>
                : <Btn variant="ghost" onClick={() => setI(v => Math.max(0, v - 1))}>Précédent</Btn>}
              {isLast
                ? <Btn onClick={close} icon={<Icon name="check" size={16} stroke={2}/>}>Terminer</Btn>
                : <Btn onClick={() => setI(v => Math.min(STEPS.length - 1, v + 1))} icon={<Icon name="arrowRight" size={16}/>}>Suivant</Btn>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.OnboardingGuide = OnboardingGuide;
export { OnboardingGuide };

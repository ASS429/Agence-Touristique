import React from 'react';
import { useI18n } from './i18n.jsx';
import { Icons } from './icons.jsx';
import { Btn, Footer, PageHero, buildWaURL } from './shared.jsx';
// =====================================================================
// src/croisieres.jsx — Page Croisières (photos ACT reçues 2026-07-03)
//
// Avant : placeholder "Bientôt disponible" en attendant le contenu ACT.
// Maintenant : photos officielles + texte i18n confirmé par l'agence.
// Cible : compagnies de croisière (B2B) — escales sénégalaises.
// =====================================================================

// 6 photos ACT (portrait 4:5 optimisées WebP dans /images_du_senegal/croisière)
const CRUISE_PHOTOS = [
  { src: 'images_du_senegal/croisière/escale-dakar.webp',       captionKey: 'page.croisieres.gallery.p1', fallback: 'Escale à Dakar' },
  { src: 'images_du_senegal/croisière/pont-touristes.webp',     captionKey: 'page.croisieres.gallery.p2', fallback: 'Sur le pont' },
  { src: 'images_du_senegal/croisière/escale-croisiere.webp',   captionKey: 'page.croisieres.gallery.p3', fallback: 'Navire à quai' },
  { src: 'images_du_senegal/croisière/equipage.webp',           captionKey: 'page.croisieres.gallery.p4', fallback: 'Équipage ACT' },
  { src: 'images_du_senegal/croisière/embarquement.webp',       captionKey: 'page.croisieres.gallery.p5', fallback: 'Embarquement' },
  { src: 'images_du_senegal/croisière/navire-quai.webp',        captionKey: 'page.croisieres.gallery.p6', fallback: 'Panorama d\'escale' }
];

// Reportage vidéo ACT (chaîne "au senegal point com"). Intégré en façade
// cliquable : la miniature est self-hostée et l'iframe youtube-nocookie.com
// n'est injectée qu'au clic — aucune requête vers Google avant (RGPD).
const CRUISE_VIDEO_ID = 'VzcGdXxk9WQ';
const CRUISE_VIDEO_POSTER = 'images_du_senegal/croisière/reportage-video-poster.jpg';

const Croisieres = ({ go }) => {
  const { t, richT } = useI18n();
  const waMsg = t('croisieres.wa');
  const [lightbox, setLightbox] = React.useState(null);
  const [videoOpen, setVideoOpen] = React.useState(false);

  return (
    <main className="bg-sand-50">
      <PageHero
        kicker={t('page.croisieres.kicker')}
        tone="atlant"
        mood="water"
        bgImg="images_du_senegal/croisière/escale-dakar-hero.webp"
        title={richT(t('page.croisieres.title'))}
        intro={t('page.croisieres.intro')}
      />

      {/* Trois points de réassurance ACT (contenu officiel) */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { I:Icons.MapPin, tKey:'page.croisieres.point1.t', dKey:'page.croisieres.point1.d' },
            { I:Icons.Users,  tKey:'page.croisieres.point2.t', dKey:'page.croisieres.point2.d' },
            { I:Icons.Clock,  tKey:'page.croisieres.point3.t', dKey:'page.croisieres.point3.d' },
          ].map((p, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 md:p-7 border border-ink/5 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-atlantique/10 text-atlantique inline-flex items-center justify-center mb-4">
                <p.I size={20}/>
              </div>
              <div className="font-display text-[22px] leading-tight">{t(p.tKey)}</div>
              <p className="mt-2 text-[14.5px] text-ink-600 leading-relaxed">{t(p.dKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Galerie 6 photos ACT */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-8 md:py-16">
        <div className="mb-8 md:mb-10 max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-3">
            — {t('page.croisieres.gallery.label', 'Nos escales en images')}
          </div>
          <h2 className="font-display text-[32px] md:text-[44px] leading-tight">
            {richT(t('page.croisieres.gallery.title', 'Le Sénégal vu {em}depuis la mer{/em}.'))}
          </h2>
          <p className="mt-3 text-ink-600 max-w-xl">
            {t('page.croisieres.gallery.intro', 'Panoramas d\'escales, moments avec l\'équipage, débarquements — un aperçu des expériences que nous concevons avec les compagnies de croisière.')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {CRUISE_PHOTOS.map((photo, i) => (
            <button
              key={i}
              onClick={() => setLightbox(photo)}
              className="group relative aspect-[4/5] block text-left overflow-hidden rounded-2xl border border-ink/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <img
                src={photo.src}
                alt={t(photo.captionKey, photo.fallback)}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(26,22,18,0.7) 100%)' }}/>
              <div className="absolute inset-x-4 bottom-3 text-sand-50">
                <div className="font-display text-[16px] md:text-[18px] leading-tight">
                  {t(photo.captionKey, photo.fallback)}
                </div>
              </div>
              <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-sand-50/90 text-ink inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Icons.ArrowUpRight size={14}/>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Reportage vidéo ACT */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-8 md:py-16">
        <div className="mb-8 md:mb-10 max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-3">
            — {t('page.croisieres.video.label', 'Reportage vidéo')}
          </div>
          <h2 className="font-display text-[32px] md:text-[44px] leading-tight">
            {richT(t('page.croisieres.video.title', 'Une escale ACT, {em}filmée{/em}.'))}
          </h2>
          <p className="mt-3 text-ink-600 max-w-xl">
            {t('page.croisieres.video.intro', 'Le reportage consacré à Africa Connection Tours : accueil des passagers, excursions à terre et coulisses de l\'organisation des escales au Sénégal.')}
          </p>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-2xl border border-ink/10 shadow-sm bg-ink">
          {videoOpen ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${CRUISE_VIDEO_ID}?autoplay=1&rel=0`}
              title="Africa Connection Tours : Vivez l'aventure avec du Sénégal"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : (
            <button
              onClick={() => setVideoOpen(true)}
              aria-label={t('page.croisieres.video.play', 'Lire la vidéo')}
              className="group absolute inset-0 w-full h-full text-left"
            >
              <img
                src={CRUISE_VIDEO_POSTER}
                alt={t('page.croisieres.video.play', 'Lire la vidéo')}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(26,22,18,.1) 0%, rgba(26,22,18,.5) 100%)' }}/>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 md:h-20 md:w-20 rounded-full bg-sand-50/95 text-ink inline-flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
                <Icons.Play size={28}/>
              </span>
            </button>
          )}
        </div>
        <p className="mt-3 text-[12.5px] text-ink-500">
          {t('page.croisieres.video.note', 'Vidéo hébergée sur YouTube — chargée uniquement après votre clic, aucun cookie déposé avant.')}
        </p>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[80] flex items-center justify-center p-6 md:p-10"
          style={{ background: 'rgba(14,15,16,.9)', backdropFilter: 'blur(6px)', animation: 'act-fade .2s ease' }}
        >
          <div onClick={e => e.stopPropagation()} className="relative max-w-[900px] w-full">
            <img
              src={lightbox.src}
              alt={t(lightbox.captionKey, lightbox.fallback)}
              className="block w-full h-auto rounded-2xl border border-white/10 shadow-2xl"
            />
            <div className="mt-4 flex items-center justify-between text-sand-100">
              <div className="font-display text-[20px] md:text-[24px]">
                {t(lightbox.captionKey, lightbox.fallback)}
              </div>
              <button
                onClick={() => setLightbox(null)}
                aria-label={t('common.close', 'Fermer')}
                className="w-10 h-10 rounded-full border border-white/25 bg-white/10 text-sand-50 hover:bg-white/20 inline-flex items-center justify-center transition"
              >
                <Icons.X size={16}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-4">
          — {t('page.croisieres.cta.kicker', 'Compagnies de croisière')}
        </div>
        <h3 className="font-display text-[32px] md:text-[48px] leading-tight">
          {richT(t('page.croisieres.body.title'))}
        </h3>
        <p className="mt-6 text-ink-600 max-w-xl mx-auto text-[15.5px] md:text-[17px] leading-relaxed">
          {t('page.croisieres.body.intro')}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Btn as="a" href={buildWaURL(waMsg)} target="_blank" rel="noreferrer"
               variant="wa" size="lg" icon={<Icons.Whatsapp size={18}/>}>
            {t('page.croisieres.cta.whatsapp')}
          </Btn>
          <Btn onClick={() => go('contact')} variant="outline" size="lg" icon={<Icons.Mail size={16}/>}>
            {t('page.croisieres.cta.email')}
          </Btn>
        </div>

        <p className="mt-8 text-[12.5px] text-ink-500 italic max-w-md mx-auto">
          {t('page.croisieres.note')}
        </p>
      </section>

      <Footer go={go}/>
    </main>
  );
};

if (typeof window !== 'undefined') Object.assign(window, { Croisieres });
export { Croisieres };

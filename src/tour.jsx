import React from 'react';
import { useI18n } from './i18n.jsx';
import { Icons } from './icons.jsx';
import { Photo } from './photo.jsx';
import { Btn, Footer, Pill, Price, Section, StarRow, buildWaURL } from './shared.jsx';
import { CIRCUITS, CIRCUIT_DETAIL, EXCURSIONS, FAQ, TOUR_REVIEWS, MAP_STOPS, SENEGAL_PATH, CASAMANCE_PATH } from './data.jsx';
import { DeparturesWidget } from './departures-widget.jsx';
// Tour detail — fiche circuit type "Gorée · Lac Rose · Saloum"

const TourGallery = ({ gallery }) => {
  const { t } = useI18n();
  const [lb, setLb] = React.useState(null); // index for lightbox
  return (
    <>
      <div className="grid grid-cols-4 md:grid-cols-4 gap-2 md:gap-3 h-[60vh] md:h-[68vh] min-h-[460px]">
        <div className="col-span-4 md:col-span-2 row-span-2 md:h-full">
          <button onClick={()=>setLb(0)} className="block w-full h-full">
            <Photo tone={gallery[0].tone} mood={gallery[0].mood} label={gallery[0].label} rounded="rounded-2xl" className="h-full w-full" src={gallery[0].img} alt={gallery[0].label}/>
          </button>
        </div>
        {gallery.slice(1,5).map((g,i)=>(
          <button key={i} onClick={()=>setLb(i+1)} className="hidden md:block h-full">
            <Photo tone={g.tone} mood={g.mood} label={g.label} rounded="rounded-2xl" className="h-full w-full" src={g.img} alt={g.label}/>
          </button>
        ))}
        {/* Mobile: 4 thumbs row */}
        <div className="md:hidden col-span-4 grid grid-cols-4 gap-2">
          {gallery.slice(1,5).map((g,i)=>(
            <button key={i} onClick={()=>setLb(i+1)} className="aspect-square">
              <Photo tone={g.tone} mood={g.mood} showLabel={false} rounded="rounded-lg" className="h-full w-full" src={g.img} alt={g.label}/>
            </button>
          ))}
        </div>
      </div>

      {lb !== null && (
        <div className="fixed inset-0 z-50 bg-ink/95 flex items-center justify-center p-4" onClick={()=>setLb(null)} role="dialog" aria-modal="true" aria-label={t('tour.gallery.title')}>
          <button onClick={()=>setLb(null)} aria-label={t('tour.gallery.close')} className="absolute top-5 right-5 h-12 w-12 rounded-full bg-sand-50/10 text-sand-50 inline-flex items-center justify-center hover:bg-sand-50/20"><Icons.Close size={22}/></button>
          <button onClick={(e)=>{e.stopPropagation(); setLb((lb - 1 + gallery.length) % gallery.length);}} aria-label={t('tour.gallery.prev')} className="absolute left-3 md:left-8 h-12 w-12 rounded-full bg-sand-50/10 text-sand-50 inline-flex items-center justify-center hover:bg-sand-50/20"><Icons.ArrowLeft size={22}/></button>
          <button onClick={(e)=>{e.stopPropagation(); setLb((lb + 1) % gallery.length);}} aria-label={t('tour.gallery.next')} className="absolute right-3 md:right-8 h-12 w-12 rounded-full bg-sand-50/10 text-sand-50 inline-flex items-center justify-center hover:bg-sand-50/20"><Icons.ArrowRight size={22}/></button>
          <div className="w-full max-w-4xl aspect-[4/3]" onClick={(e)=>e.stopPropagation()}>
            <Photo tone={gallery[lb].tone} mood={gallery[lb].mood} label={gallery[lb].label} rounded="rounded-2xl" className="h-full w-full" src={gallery[lb].img} alt={gallery[lb].label}/>
          </div>
        </div>
      )}
    </>
  );
};

const TourMap = () => {
  const { t } = useI18n();
  const [active, setActive] = React.useState(null);
  return (
    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-atlantique-100 border border-ink/5">
      {/* Sea texture */}
      <div className="absolute inset-0" style={{background:'linear-gradient(180deg, #D5E5E2 0%, #B6D5D0 100%)'}}/>
      <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full">
        <defs>
          <pattern id="dots" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="0.6" fill="#1F5E5A" opacity="0.15"/>
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#dots)"/>
        {/* Senegal land */}
        <path d={SENEGAL_PATH} fill="#F5ECDD" stroke="#C8593B" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d={CASAMANCE_PATH} fill="#F5ECDD" stroke="#C8593B" strokeWidth="1.5" strokeLinejoin="round" opacity=".7"/>
        {/* Route between stops */}
        <path d={`M ${MAP_STOPS[0].x} ${MAP_STOPS[0].y} L ${MAP_STOPS[2].x} ${MAP_STOPS[2].y} L ${MAP_STOPS[3].x} ${MAP_STOPS[3].y}`}
              fill="none" stroke="#C8593B" strokeWidth="1.5" strokeDasharray="3 3"/>
        <line x1={MAP_STOPS[0].x} y1={MAP_STOPS[0].y} x2={MAP_STOPS[1].x} y2={MAP_STOPS[1].y}
              stroke="#C8593B" strokeWidth="1.5" strokeDasharray="3 3"/>
        {/* Country labels — noms géographiques, gardés en FR (international compris) */}
        <text x="200" y="32" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="#1F5E5A" letterSpacing="2">MAURITANIE</text>
        <text x="370" y="160" textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="#1F5E5A" letterSpacing="2">MALI</text>
        <text x="200" y="260" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill="#1F5E5A" opacity=".6" letterSpacing="1">GAMBIE</text>
        <text x="200" y="293" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="#1F5E5A" letterSpacing="2">GUINÉE-BISSAU</text>
        <text x="20" y="100" textAnchor="start" fontFamily="JetBrains Mono" fontSize="8" fill="#1F5E5A" opacity=".5" letterSpacing="2">océan atlantique</text>
        {/* Stops */}
        {MAP_STOPS.map((s, i) => (
          <g key={s.id} onMouseEnter={()=>setActive(s.id)} onMouseLeave={()=>setActive(null)} style={{cursor:'pointer'}}>
            <circle cx={s.x} cy={s.y} r="10" fill="#C8593B" opacity={active===s.id ? 0.35 : 0.18}/>
            <circle cx={s.x} cy={s.y} r="4" fill="#C8593B"/>
            <text x={s.x + 8} y={s.y - 8} fontFamily="Manrope" fontSize="10" fontWeight="600" fill="#1A1612">{s.label}</text>
            <text x={s.x + 8} y={s.y + 4} fontFamily="JetBrains Mono" fontSize="7" fill="#5A5142" letterSpacing="1">{t('tour.map.dayLabel')} {i===0?1:i===1?2:i===2?3:4}</text>
          </g>
        ))}
      </svg>
      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-sand-50/95 backdrop-blur rounded-xl p-3 text-[11px] font-mono uppercase tracking-wider text-ink-700 flex items-center gap-3">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-terre-600"/>{t('tour.map.legendStop')}</span>
        <span className="flex items-center gap-1.5"><span className="h-px w-4 bg-terre-600" style={{borderTop:'1px dashed #8B3A24'}}/>{t('tour.map.legendRoute')}</span>
      </div>
    </div>
  );
};

const Faq = ({ items }) => {
  const [open, setOpen] = React.useState(0);
  return (
    <ul className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((it, i) => (
        <li key={i}>
          <button onClick={()=>setOpen(open===i ? -1 : i)}
            className="w-full text-left py-5 md:py-6 flex items-center justify-between gap-6 group">
            <span className="font-display text-[19px] md:text-[22px] leading-snug group-hover:text-terre transition-colors">{it.q}</span>
            <span className={`h-9 w-9 rounded-full border border-ink/15 inline-flex items-center justify-center shrink-0 transition-transform ${open===i ? 'rotate-45 bg-ink text-sand-50' : 'text-ink-700'}`}>
              <Icons.Plus size={16}/>
            </span>
          </button>
          <div className={`grid transition-all duration-300 ${open===i ? 'grid-rows-[1fr] opacity-100 pb-5 md:pb-6' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <p className="text-[14.5px] text-ink-600 leading-relaxed max-w-2xl pr-12">{it.a}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

// Encart devis (desktop) + barre CTA mobile — partagés fiche circuit / fiche
// excursion. Décision ACT : pas de prix affichés, CTAs devis uniquement.
const QuoteAside = ({ waMsg, go }) => {
  const { t } = useI18n();
  return (
    <aside className="md:sticky md:top-28 self-start hidden md:block">
      <div className="rounded-3xl border border-ink/10 bg-sand-50 p-6 shadow-xl shadow-ink/5">
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-terre">{t('tour.quote.kicker')}</div>
        <div className="font-display text-[34px] md:text-[38px] leading-[1.05] mt-1.5">{t('tour.quote.title')}</div>
        <p className="text-[13.5px] text-ink-600 mt-2.5 leading-relaxed">{t('tour.quote.intro')}</p>

        <div className="mt-5 space-y-2.5">
          <Btn as="a" href={buildWaURL(waMsg)} target="_blank" rel="noreferrer"
               variant="wa" size="lg" className="w-full" icon={<Icons.Whatsapp size={18}/>}>
            {t('cta.quoteWhatsApp')}
          </Btn>
          <Btn variant="outline" size="lg" className="w-full" icon={<Icons.Mail size={16}/>}
               onClick={()=> go && go('contact')}>
            {t('cta.quoteEmail')}
          </Btn>
        </div>

        <div className="mt-5 p-3.5 rounded-2xl bg-sand-100/80 border border-ink/5">
          <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink-500 mb-1.5">{t('tour.price.waLabel')}</div>
          <div className="text-[12.5px] text-ink-700 leading-relaxed font-mono">
            "{waMsg}"
          </div>
        </div>

        <ul className="mt-5 space-y-2.5 text-[13px] text-ink-700">
          <li className="flex items-center gap-2"><Icons.Shield size={14} className="text-atlantique"/>{t('tour.assurance.cancel')}</li>
          <li className="flex items-center gap-2"><Icons.Wallet size={14} className="text-atlantique"/>{t('tour.assurance.deposit')}</li>
          <li className="flex items-center gap-2"><Icons.RefreshCw size={14} className="text-atlantique"/>{t('tour.assurance.reschedule')}</li>
        </ul>
      </div>
    </aside>
  );
};

const MobileCtaBar = ({ waMsg }) => {
  const { t } = useI18n();
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-sand-50 border-t border-ink/10 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]">
      <Btn as="a" href={buildWaURL(waMsg)} target="_blank" rel="noreferrer"
           variant="wa" size="md" className="w-full" icon={<Icons.Whatsapp size={16}/>}>
        {t('cta.quoteWhatsApp')}
      </Btn>
    </div>
  );
};

// Fiche excursion — variante compacte de la fiche circuit. Les excursions
// (sorties à la journée / demi-journée) partagent la route /tour/:id mais
// pas le gabarit circuit : pas d'itinéraire multi-jours ni de carte, on
// affiche leur vrai contenu (description, format, point de départ, horaires).
const ExcursionTour = ({ exc, onBack, onOpenTour, go }) => {
  const { t, richT } = useI18n();
  const title    = t(`excursion.${exc.id}.title`,    exc.title);
  const subtitle = t(`excursion.${exc.id}.subtitle`, exc.subtitle);
  const short    = t(`excursion.${exc.id}.short`,    exc.short);
  const schedule = exc.schedule ? t(`excursion.${exc.id}.schedule`, exc.schedule) : null;
  // start2 : second point de départ possible (ex. Saint-Louis depuis Saly OU Dakar)
  const startPlaces = [exc.start, exc.start2].filter(Boolean)
    .map(s => t(`excursions.start.${s}`, s)).join(' / ');
  const waMsg = t('tour.wa.interest').replace('{title}', title);
  // Suggestions : même point de départ d'abord, puis les plus populaires.
  const similar = EXCURSIONS.filter(e => e.id !== exc.id)
    .sort((a,b) => ((b.start===exc.start)-(a.start===exc.start)) || (b.popularity-a.popularity))
    .slice(0, 3);

  return (
    <main className="bg-sand-50" data-screen-label={`Excursion Detail · ${title}`}>
      {/* Breadcrumb */}
      <div className="pt-24 md:pt-28 pb-3 max-w-[1280px] mx-auto px-4 md:px-8 flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-[0.16em] text-ink-500">
        <button onClick={onBack} className="hover:text-terre">{t('tour.breadcrumb.home')}</button>
        <Icons.ChevronRight size={12}/>
        <button onClick={()=>go('excursions')} className="hover:text-terre">{t('nav.excursions')}</button>
        <Icons.ChevronRight size={12}/>
        <span className="text-ink truncate">{title}</span>
      </div>

      {/* Photo principale */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-4">
        <Photo tone={exc.tone} mood={exc.mood} label={title.toLowerCase()} rounded="rounded-2xl" ratio="aspect-[16/7]" src={exc.img} alt={title}/>
      </div>

      {/* Titre + infos + description + encart devis */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 pt-10 md:pt-14 pb-16 grid md:grid-cols-[1.6fr,1fr] gap-10 lg:gap-16">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <Pill tone="terre">{t(`excursions.kind.${exc.kind}`, exc.kind === 'half' ? 'Demi-journée' : 'Journée complète')}</Pill>
            <Pill tone="sand"><Icons.MapPin size={11}/> {t('tour.exc.departFrom').replace('{place}', startPlaces)}</Pill>
          </div>
          <h1 className="font-display text-[40px] sm:text-[58px] md:text-[76px] leading-[0.98]">
            {title}<br/><em className="text-terre">{subtitle}</em>
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-ink-600">
            {schedule && <span className="inline-flex items-center gap-1.5"><Icons.Clock size={14}/> {schedule}</span>}
            <span className="inline-flex items-center gap-1.5"><Icons.MapPin size={14}/> {t('tour.exc.departFrom').replace('{place}', startPlaces)}</span>
            <span className="inline-flex items-center gap-1.5"><Icons.Users size={14}/> {t('tour.meta.travelers')}</span>
          </div>
          <p className="mt-7 max-w-2xl text-[16px] md:text-[17px] text-ink-700 leading-relaxed">{short}</p>
        </div>
        <QuoteAside waMsg={waMsg} go={go}/>
      </section>

      {/* FAQ réservation (commune aux fiches) */}
      <Section id="faq" label={t('tour.section.faq.label')} title={richT(t('tour.section.faq.title'))}
               className="py-16 md:py-24 bg-sand-100">
        <div className="max-w-3xl">
          <Faq items={CIRCUIT_DETAIL.faqs}/>
        </div>
      </Section>

      {/* Autres excursions */}
      <Section id="similar" label={t('tour.section.similar.label')} title={richT(t('tour.exc.similar.title'))}
               className="py-16 md:py-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {similar.map(e => {
            const sTitle    = t(`excursion.${e.id}.title`,    e.title);
            const sSubtitle = t(`excursion.${e.id}.subtitle`, e.subtitle);
            return (
              <button key={e.id} onClick={()=>{ onOpenTour(e.id); window.scrollTo({top:0}); }} className="group text-left flex flex-col">
                <Photo tone={e.tone} mood={e.mood} label={t(`excursions.kind.${e.kind}`, '')} ratio="aspect-[5/4]" className="mb-4 group-hover:scale-[1.01] transition-transform" src={e.img} alt={sTitle}/>
                <h3 className="font-display text-[24px] leading-tight">{sTitle}</h3>
                <div className="text-[13px] text-ink-600 mt-0.5">{sSubtitle}</div>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] group-hover:text-terre">{t('tour.similar.see')} <Icons.ArrowUpRight size={14}/></span>
              </button>
            );
          })}
        </div>
      </Section>

      <Footer go={go}/>
      <MobileCtaBar waMsg={waMsg}/>
    </main>
  );
};

const Tour = ({ onBack, onOpenTour, go, tourId = 'goree-lac-saloum' }) => {
  const { t, richT } = useI18n();
  // Les excursions partagent la route /tour/:id : sans ce branchement, toute
  // fiche excursion retombait sur CIRCUITS[0] (« Excursion à Gorée »).
  const exc = EXCURSIONS.find(e => e.id === tourId);
  if (exc) return <ExcursionTour exc={exc} onBack={onBack} onOpenTour={onOpenTour} go={go}/>;
  // Lookup the picked circuit from the catalog; merge with the full detail
  // (which acts as the canonical "fiche type" content for any circuit shown
  // in this prototype). Title, subtitle, price, badges follow the catalog
  // entry so the page reflects whatever circuit the user clicked.
  const cat = CIRCUITS.find(c => c.id === tourId) || CIRCUITS[0];
  const isCanonical = tourId === CIRCUIT_DETAIL.id;
  const catTitle    = t(`circuit.${cat.id}.title`,    cat.title);
  const catSubtitle = t(`circuit.${cat.id}.subtitle`, cat.subtitle);
  const d = {
    ...CIRCUIT_DETAIL,
    id: cat.id,
    title: catTitle,
    subtitle: isCanonical ? CIRCUIT_DETAIL.subtitle : t('tour.subtitle.fallback').replace('{days}', cat.days).replace('{nights}', cat.nights),
    rating: cat.rating,
    reviews: cat.reviews,
    badges: cat.badges?.length ? cat.badges : CIRCUIT_DETAIL.badges,
    priceXOF: cat.priceXOF,
    gallery: isCanonical ? CIRCUIT_DETAIL.gallery : [
      { tone: cat.tone, mood: cat.mood, label: catTitle.toLowerCase(), img: cat.img },
      ...CIRCUIT_DETAIL.gallery.slice(1),
    ],
  };
  const waMsg = t('tour.wa.interest').replace('{title}', d.title);

  return (
    <main className="bg-sand-50" data-screen-label={`Tour Detail · ${d.title}`}>
      {/* Breadcrumb */}
      <div className="pt-24 md:pt-28 pb-3 max-w-[1280px] mx-auto px-4 md:px-8 flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-[0.16em] text-ink-500">
        <button onClick={onBack} className="hover:text-terre">{t('tour.breadcrumb.home')}</button>
        <Icons.ChevronRight size={12}/>
        <button onClick={()=>go('circuits')} className="hover:text-terre">{t('tour.breadcrumb.tours')}</button>
        <Icons.ChevronRight size={12}/>
        <span className="text-ink truncate">{d.title}</span>
      </div>

      {/* Gallery */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-4">
        <TourGallery gallery={d.gallery}/>
      </div>

      {/* Title block + sticky price */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 pt-10 md:pt-14 pb-16 grid md:grid-cols-[1.6fr,1fr] gap-10 lg:gap-16">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {d.badges.map((b,i)=>(
              <Pill key={i} tone={i===0?'terre':'sand'}>{b}</Pill>
            ))}
          </div>
          <h1 className="font-display text-[40px] sm:text-[58px] md:text-[76px] leading-[0.98]">
            {d.title}<br/><em className="text-terre">{d.subtitle}</em>
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-ink-600">
            <span className="inline-flex items-center gap-1.5"><StarRow value={d.rating} size={14}/><span className="text-ink font-medium">{d.rating}</span><span>· {d.reviews} {t('common.reviews')}</span></span>
            <span className="inline-flex items-center gap-1.5"><Icons.Calendar size={14}/> {t('tour.meta.daysNights').replace('{days}', cat.days).replace('{nights}', cat.nights)}</span>
            <span className="inline-flex items-center gap-1.5"><Icons.MapPin size={14}/> Dakar → Saloum</span>
            <span className="inline-flex items-center gap-1.5"><Icons.Users size={14}/> {t('tour.meta.travelers')}</span>
          </div>
          <p className="mt-7 max-w-2xl text-[16px] md:text-[17px] text-ink-700 leading-relaxed">
            Cinq jours pour rencontrer trois Sénégal distincts : l’île-mémoire de Gorée, le lac qui rosit au soleil, et les bolongs du delta du Saloum traversés en pirogue. Construit autour de pauses, de bons repas, et de gens qu’on connaît depuis longtemps.
          </p>
        </div>

        {/* Sticky quote card (desktop) — décision ACT : pas de prix affichés,
            on bascule sur un encart "Sur devis" centré sur les CTAs. */}
        <QuoteAside waMsg={waMsg} go={go}/>
      </section>

      {/* Programme */}
      <Section id="programme" label={t('tour.section.programme.label')} title={richT(t('tour.section.programme.title'))}
               className="py-16 md:py-24 bg-sand-100" container={true}>
        <div className="relative">
          <div className="absolute left-[27px] md:left-[35px] top-2 bottom-2 w-px bg-ink/15"/>
          <ol className="space-y-8 md:space-y-12">
            {d.days.map((day, i) => (
              <li key={i} className="grid grid-cols-[56px,1fr] md:grid-cols-[72px,1fr] gap-4 md:gap-8 relative">
                <div className="relative">
                  <div className="h-14 w-14 md:h-[72px] md:w-[72px] rounded-full bg-ink text-sand-50 inline-flex flex-col items-center justify-center border-4 border-sand-100">
                    <div className="font-mono text-[9px] uppercase tracking-wider opacity-60">{t('tour.day.label')}</div>
                    <div className="font-display text-[24px] md:text-[30px] leading-none">{day.n}</div>
                  </div>
                </div>
                <div className="grid md:grid-cols-[1fr,1.1fr] gap-5 md:gap-8 items-center bg-sand-50 rounded-3xl p-5 md:p-7">
                  <div>
                    <h3 className="font-display text-[26px] md:text-[34px] leading-tight">{day.title}</h3>
                    <p className="mt-3 text-[14.5px] text-ink-600 leading-relaxed">{day.short}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Pill tone="sand"><Icons.Clock size={11}/> {t('tour.day.pill.day')}</Pill>
                      <Pill tone="sand"><Icons.Users size={11}/> {t('tour.day.pill.guide')}</Pill>
                    </div>
                  </div>
                  <Photo tone={day.tone} mood={day.mood} label={`${t('tour.day.label')} ${day.n}`} ratio="aspect-[5/3]" rounded="rounded-2xl" src={day.img} alt={day.title}/>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Inclus / Non inclus */}
      <Section id="inclus" label={t('tour.section.included.label')} title={richT(t('tour.section.included.title'))}
               className="py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          <div className="bg-atlantique-100/60 rounded-3xl p-6 md:p-8 border border-atlantique/10">
            <div className="flex items-center gap-2 mb-4 text-atlantique">
              <Icons.Check size={20}/> <span className="font-mono text-[11px] uppercase tracking-[0.2em]">{t('tour.section.included.yes')}</span>
            </div>
            <ul className="space-y-3">
              {d.includes.map((item,i)=>(
                <li key={i} className="flex items-start gap-3 text-[14.5px] text-ink-800">
                  <span className="mt-1 h-5 w-5 shrink-0 rounded-full bg-atlantique/15 text-atlantique inline-flex items-center justify-center"><Icons.Check size={12}/></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-sand-100 rounded-3xl p-6 md:p-8 border border-ink/5">
            <div className="flex items-center gap-2 mb-4 text-ink-500">
              <Icons.X size={20}/> <span className="font-mono text-[11px] uppercase tracking-[0.2em]">{t('tour.section.included.no')}</span>
            </div>
            <ul className="space-y-3">
              {d.excludes.map((item,i)=>(
                <li key={i} className="flex items-start gap-3 text-[14.5px] text-ink-700">
                  <span className="mt-1 h-5 w-5 shrink-0 rounded-full bg-ink/10 text-ink-500 inline-flex items-center justify-center"><Icons.X size={12}/></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Infos pratiques + carte */}
      <Section id="infos" label={t('tour.section.info.label')} title={richT(t('tour.section.info.title'))}
               className="py-16 md:py-24 bg-sand-100">
        <div className="grid md:grid-cols-[1fr,1.2fr] gap-8 md:gap-12">
          <dl className="grid grid-cols-1 gap-y-5">
            {d.pratique.map((p,i)=>(
              <div key={i} className="grid grid-cols-[140px,1fr] gap-4 border-b border-ink/10 pb-4 last:border-0">
                <dt className="text-[12px] font-mono uppercase tracking-[0.18em] text-ink-500 pt-1">{p.label}</dt>
                <dd className="font-display text-[20px] md:text-[22px] leading-tight">{p.value}</dd>
              </div>
            ))}
          </dl>
          <div>
            <TourMap/>
            <p className="mt-3 text-[12.5px] font-mono text-ink-500">{t('tour.section.info.disclaimer')}</p>
          </div>
        </div>
      </Section>

      {/* Avis */}
      <Section id="avis-circuit" label={t('tour.section.reviews.label')} title={richT(t('tour.section.reviews.title'))}
               kicker={t('tour.section.reviews.kicker').replace('{rating}', d.rating).replace('{reviews}', d.reviews)}
               className="py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {TOUR_REVIEWS.map((r,i)=>(
            <article key={i} className="bg-sand-100 rounded-3xl p-6 md:p-7">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-terre/15 text-terre inline-flex items-center justify-center font-display text-[18px]">
                    {r.name[0]}
                  </div>
                  <div>
                    <div className="font-medium text-[14px]">
                      {r.name}{r.lang && <span className="ml-1.5" aria-hidden="true">{({ it:'🇮🇹', en:'🇬🇧', fr:'🇫🇷', de:'🇩🇪' })[r.lang]}</span>}
                    </div>
                    <div className="text-[11.5px] font-mono uppercase tracking-wider text-ink-500">{r.date}</div>
                  </div>
                </div>
                <StarRow value={r.stars} size={13}/>
              </div>
              <p className="text-[14.5px] text-ink-700 leading-relaxed">"{r.text}"</p>
            </article>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" label={t('tour.section.faq.label')} title={richT(t('tour.section.faq.title'))}
               className="py-16 md:py-24 bg-sand-100">
        <div className="max-w-3xl">
          <Faq items={d.faqs}/>
        </div>
      </Section>

      {/* Circuits similaires */}
      <Section id="similar" label={t('tour.section.similar.label')} title={richT(t('tour.section.similar.title'))}
               className="py-16 md:py-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {CIRCUITS.filter(c => c.id !== d.id).slice(0,3).map(c => {
            const sTitle    = t(`circuit.${c.id}.title`,    c.title);
            const sSubtitle = t(`circuit.${c.id}.subtitle`, c.subtitle);
            return (
              <button key={c.id} onClick={()=>{ onOpenTour(c.id); window.scrollTo({top:0}); }} className="group text-left flex flex-col">
                <Photo tone={c.tone} mood={c.mood} label={`${c.days}j`} ratio="aspect-[5/4]" className="mb-4 group-hover:scale-[1.01] transition-transform" src={c.img} alt={sTitle}/>
                <div className="flex items-center gap-2 mb-1.5">
                  <StarRow value={c.rating} size={12}/>
                  <span className="text-[12px] text-ink-500">{c.rating}</span>
                </div>
                <h3 className="font-display text-[24px] leading-tight">{sTitle}</h3>
                <div className="text-[13px] text-ink-600 mt-0.5">{sSubtitle}</div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-[10.5px] text-ink-500 font-mono uppercase tracking-wider">{t('common.from')}</div>
                    <Price xof={c.priceXOF} className="font-display text-[20px] leading-none"/>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[13px] group-hover:text-terre">{t('tour.similar.see')} <Icons.ArrowUpRight size={14}/></span>
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Widget calendrier des départs (si des dates sont enregistrées) */}
      <DeparturesWidget circuitSlug={tourId} circuitTitle={cat?.title || tourId} go={go}/>

      <Footer go={go}/>

      {/* Mobile sticky bar — décision ACT : pas de prix, CTA "Devis" plein largeur */}
      <MobileCtaBar waMsg={waMsg}/>
    </main>
  );
};

if (typeof window !== 'undefined') Object.assign(window, { Tour });
export { Tour };

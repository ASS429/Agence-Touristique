import React from 'react';
import { useI18n } from './i18n.jsx';
import { Icons } from './icons.jsx';
import { Photo } from './photo.jsx';
import { Btn, CircuitCard, Footer, Price, Section, StarRow, buildWaURL } from './shared.jsx';
import { CIRCUITS, DESTINATIONS, BLOG, INSTA, TESTIMONIALS, IMG } from './data.jsx';
// Home page — uses shared CircuitCard, Price, and go() for in-app navigation.

const Hero = ({ go }) => {
  const { t, richT } = useI18n();
  // Skip the hero video on slow / data-saver connections. The poster image
  // (Dakar/01.jpg) stays as fallback — critical for the 3G/4G context.
  const [showVideo, setShowVideo] = React.useState(false);
  React.useEffect(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) { setShowVideo(true); return; }
    const slow = conn.saveData || ['slow-2g','2g','3g'].includes(conn.effectiveType);
    setShowVideo(!slow);
  }, []);
  const stats = [
    { I:Icons.Clock,    k:t('home.hero.stat1Key'), v:t('home.hero.stat1Val') },
    { I:Icons.MapPin,   k:t('home.hero.stat2Key'), v:t('home.hero.stat2Val') },
    { I:Icons.Star,     k:t('home.hero.stat3Key'), v:t('home.hero.stat3Val') },
    { I:Icons.Whatsapp, k:t('home.hero.stat4Key'), v:t('home.hero.stat4Val') },
  ];
  return (
  <section className="relative min-h-[100svh] flex flex-col" data-screen-label="01 Hero">
    <div className="absolute inset-0 bg-ink">
      {showVideo ? (
        // Haut débit : vidéo en autoplay. Pas de `poster` — le fond `bg-ink`
        // du parent sert de toile sombre pendant le buffering (≤ 1s en 4G).
        // `preload="auto"` raccourcit ce délai.
        <video
          autoPlay muted loop playsInline preload="auto"
          aria-label={t('home.hero.videoAria')}
          className="absolute inset-0 h-full w-full object-cover">
          <source src="vidéo/senegal.mp4" type="video/mp4"/>
          {/* Track vide : la vidéo n'a pas d'audio, donc pas de vraies
              captions à fournir. Le track sentinel évite le warning a11y. */}
          <track kind="captions" srcLang="fr" label="Aucun dialogue" default/>
        </video>
      ) : (
        // 2g/3g/saveData : photo statique stylisée à la place.
        // priority : c'est le hero (above-the-fold) → eager + fetchPriority high
        // pour optimiser le LCP, surtout critique en 3G/4G.
        <Photo tone="terre" mood="horizon" rounded="" showLabel={false} className="h-full w-full" src={IMG('Dakar', 1)} alt="Dakar, corniche" priority/>
      )}
      <div className="absolute inset-0" style={{background:'linear-gradient(180deg, rgba(26,22,18,0.65) 0%, rgba(26,22,18,0.35) 28%, rgba(26,22,18,0.45) 55%, rgba(26,22,18,0.88) 100%)'}}/>
      <div className="absolute inset-0" style={{background:'linear-gradient(90deg, rgba(26,22,18,0.55) 0%, rgba(26,22,18,0.15) 55%, rgba(26,22,18,0) 100%)'}}/>
    </div>

    <div className="relative flex-1 max-w-[1280px] w-full mx-auto px-4 md:px-8 pt-32 md:pt-44 pb-28 md:pb-32 flex flex-col justify-end"
         style={{ textShadow:'0 2px 18px rgba(0,0,0,0.45)' }}>
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 md:py-1.5 rounded-full bg-sand-50/15 backdrop-blur-md border border-sand-50/20 text-sand-50 text-[10px] md:text-[11px] uppercase tracking-[0.22em] font-mono mb-4 md:mb-6"
             style={{ textShadow:'none' }}>
          <span className="h-1.5 w-1.5 rounded-full bg-terre-300 animate-pulse"/> {t('home.hero.badge')}
        </div>
        <h1 className="font-display text-[36px] sm:text-[56px] md:text-[88px] lg:text-[104px] leading-[1] md:leading-[0.95] text-sand-50"
            style={{ textShadow:'0 3px 24px rgba(0,0,0,0.55)' }}>
          {richT(t('home.hero.title'), { emClassName: 'text-terre-300' })}
        </h1>
        <p className="mt-4 md:mt-7 max-w-xl text-sand-50 text-[14.5px] md:text-[18px] leading-relaxed"
           style={{ textShadow:'0 2px 14px rgba(0,0,0,0.6)' }}>
          {t('home.hero.intro')}
        </p>
        <div className="mt-6 md:mt-9 flex flex-wrap items-center gap-3" style={{ textShadow:'none' }}>
          <Btn onClick={()=>go('circuits')} variant="terre" size="lg" icon={<Icons.ArrowRight size={18}/>}>
            {t('home.hero.ctaSeeTours')}
          </Btn>
          {/* Bouton WhatsApp masqué sur mobile : le bouton flottant en bas
              à droite remplit déjà ce rôle, c'est de la redondance. */}
          <Btn as="a" href={buildWaURL(t('wa.planTrip'))} target="_blank" rel="noreferrer"
               variant="wa" size="lg" icon={<Icons.Whatsapp size={18}/>}
               className="hidden sm:inline-flex">
            {t('cta.book')}
          </Btn>
        </div>
      </div>

      <div className="mt-12 md:mt-16 grid grid-cols-3 md:grid-cols-4 rounded-2xl overflow-hidden border border-sand-50/15 bg-ink/30 backdrop-blur-md shadow-2xl shadow-ink/30"
           style={{ textShadow:'none' }}>
        {stats.map((s,i)=>(
          <div key={i}
               className={`group flex flex-col md:flex-row items-start gap-1.5 md:gap-3 px-3 md:px-6 py-4 md:py-6 transition-colors hover:bg-sand-50/5
                           ${i!==0 ? 'border-l border-sand-50/15' : ''}
                           ${i===3 ? 'hidden md:flex' : ''}`}>
            <div className="h-7 w-7 md:h-9 md:w-9 rounded-full bg-sand-50/10 ring-1 ring-sand-50/20 text-terre-300 inline-flex items-center justify-center shrink-0 group-hover:bg-terre/20 group-hover:text-sand-50 transition-colors">
              <s.I size={14}/>
            </div>
            <div className="min-w-0">
              <div className="font-display text-[18px] md:text-[32px] text-sand-50 leading-none"
                   style={{ textShadow:'0 1px 6px rgba(0,0,0,0.5)' }}>{s.k}</div>
              <div className="text-[10px] md:text-[12px] text-sand-100/85 mt-1 md:mt-1.5 leading-tight tracking-wide md:uppercase md:tracking-[0.08em]"
                   style={{ textShadow:'0 1px 4px rgba(0,0,0,0.55)' }}>{s.v}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-sand-50/85 pointer-events-none select-none">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em]" style={{ textShadow:'0 1px 6px rgba(0,0,0,0.6)' }}>{t('home.hero.scroll')}</span>
      <Icons.ChevronDown size={20} className="animate-bounce" style={{ filter:'drop-shadow(0 1px 4px rgba(0,0,0,0.5))' }}/>
    </div>
  </section>
  );
};

const Reassurance = () => {
  const { t } = useI18n();
  const items = [
    { I:Icons.Compass,  kKey:'home.reassurance.guides.k',   dKey:'home.reassurance.guides.d'   },
    { I:Icons.Wallet,   kKey:'home.reassurance.payment.k',  dKey:'home.reassurance.payment.d'  },
    { I:Icons.RefreshCw,kKey:'home.reassurance.cancel.k',   dKey:'home.reassurance.cancel.d'   },
    { I:Icons.Star,     kKey:'home.reassurance.rating.k',   dKey:'home.reassurance.rating.d'   },
  ];
  return (
    <section className="bg-sand-100 border-y border-ink/5" data-screen-label="02 Reassurance">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4">
        {items.map(({I,kKey,dKey}, i) => (
          <div key={i} className={`flex items-start gap-3 py-5 md:py-9
              ${i!==0 ? 'border-t md:border-t-0 md:border-l border-ink/10' : ''}
              md:pl-8 md:pr-4`}>
            <div className="h-10 w-10 rounded-full bg-terre/10 text-terre inline-flex items-center justify-center shrink-0"><I size={20}/></div>
            <div className="min-w-0">
              <div className="font-medium text-[14.5px] md:text-[15px] text-ink">{t(kKey)}</div>
              <div className="text-[13px] md:text-[13px] text-ink-600 leading-relaxed mt-1">{t(dKey)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Destinations = ({ go }) => {
  const { t, richT } = useI18n();
  const [filter, setFilter] = React.useState('Tous');
  // Filtres : "Tous" est localisé, les autres restent en lowercase
  // (catégories techniques utilisées comme labels visuels).
  const filters = ['Tous','culture','nature','aventure','patrimoine'];
  const list = filter === 'Tous' ? DESTINATIONS : DESTINATIONS.filter(d=>d.tag===filter);
  return (
    <Section id="destinations" label={t('home.destinations.label')} title={richT(t('home.destinations.title'))}
             kicker={t('home.destinations.kicker')}
             intro={t('home.destinations.intro')}
             className="py-20 md:py-28" screenLabel="03 Destinations">
      <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar">
        {filters.map(f => {
          const label = f === 'Tous' ? t('common.all', 'Tous') : t(`destination.tag.${f}`, f);
          return (
            <button key={f} onClick={()=>setFilter(f)}
              className={`shrink-0 px-4 h-9 rounded-full text-[12.5px] font-medium border transition-colors capitalize ${filter===f ? 'bg-ink text-sand-50 border-ink' : 'bg-transparent text-ink-700 border-ink/15 hover:border-ink/40'}`}>
              {label}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {list.map((d) => {
          const dname     = t(`destination.${d.id}.name`,     d.name);
          const dduration = t(`destination.${d.id}.duration`, d.duration);
          return (
            <button key={d.id} onClick={()=>go('circuits')} className="group relative aspect-[3/4] block text-left">
              <Photo tone={d.tone} mood={d.mood} label={t(`destination.tag.${d.tag}`, d.tag)} overlay rounded="rounded-2xl" className="h-full" src={d.img} alt={dname}/>
              <div className="absolute inset-x-3 bottom-3 text-sand-50">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <div className="font-display text-[24px] md:text-[28px] leading-none">{dname}</div>
                    <div className="text-[11.5px] mt-1.5 text-sand-200 flex items-center gap-1.5">
                      <Icons.MapPin size={11}/> {dduration} {t('destination.fromDakar', 'de Dakar')}
                    </div>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-sand-50 text-ink inline-flex items-center justify-center group-hover:bg-terre group-hover:text-sand-50 transition-colors">
                    <Icons.ArrowUpRight size={16}/>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Section>
  );
};

const Pourquoi = () => {
  const { t, richT } = useI18n();
  const cols = [
    { num:'01', tKey:'home.pourquoi.col1.t', dKey:'home.pourquoi.col1.d' },
    { num:'02', tKey:'home.pourquoi.col2.t', dKey:'home.pourquoi.col2.d' },
    { num:'03', tKey:'home.pourquoi.col3.t', dKey:'home.pourquoi.col3.d' },
  ];
  return (
    <Section id="pourquoi" label={t('home.pourquoi.label')} title={richT(t('home.pourquoi.title'))}
             className="py-20 md:py-28" bg="bg-ink text-sand-50" dark
             intro={t('home.pourquoi.intro')}
             screenLabel="04 Pourquoi">
      <div className="grid md:grid-cols-3 gap-10 md:gap-14">
        {cols.map((c,i)=>(
          <div key={i} className="relative">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre-300 mb-4">— {c.num}</div>
            <h3 className="font-display text-[28px] md:text-[34px] leading-tight mb-4">{t(c.tKey)}</h3>
            <p className="text-sand-200 leading-relaxed">{t(c.dKey)}</p>
          </div>
        ))}
      </div>
    </Section>
  );
};

// ============================================================================
// Le Sénégal selon ACT — présentation éditoriale du pays
// ============================================================================
const SenegalSelonACT = () => {
  const { t, richT } = useI18n();
  const items = [
    { I:Icons.Sparkle, kKey:'home.senegal.item1.k', dKey:'home.senegal.item1.d' },
    { I:Icons.Users,   kKey:'home.senegal.item2.k', dKey:'home.senegal.item2.d' },
    { I:Icons.MapPin,  kKey:'home.senegal.item3.k', dKey:'home.senegal.item3.d' },
    { I:Icons.Globe,   kKey:'home.senegal.item4.k', dKey:'home.senegal.item4.d' },
  ];
  return (
    <Section id="senegal-selon-act" label={t('home.senegal.label')}
             title={richT(t('home.senegal.title'))}
             kicker={t('home.senegal.kicker')}
             intro={t('home.senegal.intro')}
             className="py-20 md:py-28" screenLabel="02 Le Sénégal selon ACT">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {items.map((p, i) => (
          <article key={i} className="rounded-3xl bg-sand-100/60 border border-ink/5 p-6 md:p-7 hover:shadow-lg hover:shadow-ink/5 transition-shadow">
            <div className="h-11 w-11 rounded-full bg-terre/10 text-terre inline-flex items-center justify-center mb-4">
              <p.I size={20}/>
            </div>
            <div className="font-display text-[22px] md:text-[24px] leading-tight">{t(p.kKey)}</div>
            <p className="mt-2 text-[14px] text-ink-600 leading-relaxed">{t(p.dKey)}</p>
          </article>
        ))}
      </div>
    </Section>
  );
};

// ============================================================================
// Profil ACT — brève présentation de l'agence avec CTA À propos
// ============================================================================
const ProfilACT = ({ go }) => {
  const { t, richT } = useI18n();
  const stats = [
    { kKey:'home.profil.stat1.k', vKey:'home.profil.stat1.v' },
    { kKey:'home.profil.stat2.k', vKey:'home.profil.stat2.v' },
    { kKey:'home.profil.stat3.k', vKey:'home.profil.stat3.v' },
    { kKey:'home.profil.stat4.k', vKey:'home.profil.stat4.v' },
  ];
  return (
    <section id="profil-act" className="py-20 md:py-28 bg-ink text-sand-50 relative overflow-hidden" data-screen-label="03 Profil ACT">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid md:grid-cols-[1.15fr,1fr] gap-10 md:gap-16 items-center">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre-300 mb-4">— {t('home.profil.label')}</div>
          <h2 className="font-display text-[36px] sm:text-[44px] md:text-[60px] leading-[1.02]">
            {richT(t('home.profil.title'))}
          </h2>
          <p className="mt-6 text-sand-200 max-w-xl text-[15.5px] md:text-[17px] leading-relaxed">
            {t('home.profil.body1')}
          </p>
          <p className="mt-4 text-sand-200 max-w-xl text-[15.5px] md:text-[17px] leading-relaxed">
            {t('home.profil.body2')}
          </p>
          <div className="mt-8">
            <Btn onClick={()=>go('about')} variant="terre" size="lg" icon={<Icons.ArrowRight size={18}/>}>
              {t('home.profil.cta')}
            </Btn>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {stats.map((s,i) => (
            <div key={i} className="rounded-2xl bg-sand-50/5 border border-sand-100/15 p-5 md:p-6">
              <div className="font-display text-[40px] md:text-[52px] text-sand-50 leading-none">{t(s.kKey)}</div>
              <div className="text-[12.5px] text-sand-300 mt-2 leading-snug">{t(s.vKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// Produits & circuits — sélection de la home
// ============================================================================
const ProduitsCircuits = ({ onOpenTour, go }) => {
  const { t, richT } = useI18n();
  // Mix : circuits signature + programme diaspora pour montrer la variété
  const picks = ['goree-lac-saloum','diaspora-essentiel','casamance-essentielle','lompoul-saint-louis']
    .map(id => CIRCUITS.find(c=>c.id===id)).filter(Boolean);
  return (
    <Section id="produits-circuits" label={t('home.produits.label')}
             title={richT(t('home.produits.title'))}
             kicker={t('home.produits.kicker')}
             className="py-20 md:py-28" screenLabel="05 Produits & circuits">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {picks.map(c => <CircuitCard key={c.id} c={c} onOpen={onOpenTour}/>)}
      </div>
      <div className="mt-10 md:mt-12 flex justify-center">
        <Btn onClick={()=>go('circuits')} variant="primary" size="lg" icon={<Icons.ArrowRight size={18}/>}>
          {t('home.produits.cta')}
        </Btn>
      </div>
    </Section>
  );
};

const RetourSources = ({ go }) => {
  const { t, richT } = useI18n();
  const bullets = [
    t('home.retour.bullet1'),
    t('home.retour.bullet2'),
    t('home.retour.bullet3'),
    t('home.retour.bullet4'),
  ];
  return (
    <section id="diaspora" className="relative bg-ink text-sand-50 py-20 md:py-32 overflow-hidden" data-screen-label="06 Retour aux sources">
      <div className="absolute inset-0">
        <Photo tone="terre" mood="city" rounded="" showLabel={false} className="h-full w-full opacity-50" src={IMG('Ile de gorée', 6)} alt="Île de Gorée"/>
        <div className="absolute inset-0" style={{background:'linear-gradient(90deg, rgba(26,22,18,0.95) 0%, rgba(26,22,18,0.6) 100%)'}}/>
      </div>
      <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 grid md:grid-cols-[1.1fr,1fr] gap-12 items-center">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre-300 mb-4">— {t('home.retour.label')}</div>
          <h2 className="font-display text-[40px] sm:text-[52px] md:text-[68px] leading-[0.98]">
            {richT(t('home.retour.title'))}
          </h2>
          <p className="mt-6 max-w-xl text-sand-200 text-[15.5px] leading-relaxed">
            {t('home.retour.intro')}
          </p>
          <ul className="mt-7 space-y-3 text-[14.5px] text-sand-100">
            {bullets.map((b,i)=>(
              <li key={i} className="flex items-start gap-3"><Icons.Check size={18} className="text-terre-300 mt-0.5 shrink-0"/>{b}</li>
            ))}
          </ul>
          <div className="mt-9">
            <Btn onClick={()=>go('circuits','diaspora')} variant="terre" size="lg" icon={<Icons.ArrowRight size={18}/>}>
              {t('home.retour.cta')}
            </Btn>
          </div>
        </div>
        <div className="relative">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <Photo tone="terre" mood="city" label={t('home.retour.photo1')} ratio="aspect-[3/4]" className="row-span-2" src={IMG('Ile de gorée', 7)} alt={t('home.retour.photo1')}/>
            <Photo tone="dusk" mood="portrait" label={t('home.retour.photo2')} ratio="aspect-square" src={IMG('Dakar', 7)} alt={t('home.retour.photo2')}/>
            <Photo tone="sand" mood="horizon" label={t('home.retour.photo3')} ratio="aspect-square" src={IMG('Saint-Louis', 5)} alt={t('home.retour.photo3')}/>
          </div>
          {/* Quote card : statique sous les photos sur mobile (pas de chevauchement), absolue flottante sur desktop. */}
          <div className="static md:absolute md:-bottom-4 md:-left-4 lg:-left-8 mt-4 md:mt-0 max-w-full md:max-w-[300px] bg-sand-50 text-ink p-5 rounded-2xl shadow-2xl">
            <Icons.Quote size={18} className="text-terre mb-2"/>
            <p className="font-display text-[17px] leading-snug">{t('home.retour.quote')}</p>
            <div className="mt-3 text-[12px] text-ink-500 font-mono">— Aïssatou D., Brooklyn</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PackDakar = () => {
  const { t, richT } = useI18n();
  const steps = [
    { n:'01', tKey:'home.pack.step1.t', dKey:'home.pack.step1.d' },
    { n:'02', tKey:'home.pack.step2.t', dKey:'home.pack.step2.d' },
    { n:'03', tKey:'home.pack.step3.t', dKey:'home.pack.step3.d' },
    { n:'04', tKey:'home.pack.step4.t', dKey:'home.pack.step4.d' },
    { n:'05', tKey:'home.pack.step5.t', dKey:'home.pack.step5.d' },
  ];
  return (
    <Section id="dakar-pack" label={t('home.pack.label')} title={richT(t('home.pack.title'))}
             kicker={t('home.pack.kicker')}
             className="py-20 md:py-28 bg-sand-100" screenLabel="07 Pack Dakar">
      <div className="grid md:grid-cols-[1.1fr,1fr] gap-10 md:gap-16 items-start">
        <div>
          <ol className="space-y-5">
            {steps.map((s,i)=>(
              <li key={i} className="grid grid-cols-[40px,1fr] gap-4 md:gap-6 border-b border-ink/10 pb-5 last:border-0">
                <div className="font-mono text-terre text-[12px] tracking-[0.2em] pt-1.5">{s.n}</div>
                <div>
                  <div className="font-display text-[22px] md:text-[26px] leading-tight">{t(s.tKey)}</div>
                  <div className="text-[14px] text-ink-600 leading-relaxed mt-1">{t(s.dKey)}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative md:sticky md:top-28">
          <Photo tone="atlant" mood="city" label="Dakar / Almadies" ratio="aspect-[4/5]" rounded="rounded-3xl" className="shadow-xl" src={IMG('Dakar', 6)} alt="Dakar — Almadies"/>
          {/* Carte CTA — décision ACT : pas de prix affichés, on garde la durée
              et un CTA "Demander ce pack" pour le devis WhatsApp. */}
          <div className="absolute -bottom-6 -right-3 md:-right-6 bg-sand-50 rounded-2xl p-5 shadow-xl border border-ink/5 w-[260px]">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-terre">{t('home.pack.priceDuration')}</div>
            <div className="font-display text-[22px] leading-tight mt-1">{t('home.pack.cardTitle')}</div>
            <p className="text-[12.5px] text-ink-600 mt-1.5 leading-relaxed">{t('home.pack.cardIntro')}</p>
            <Btn as="a" href={buildWaURL(t('home.pack.wa'))} target="_blank" rel="noreferrer"
                 variant="wa" size="sm" className="mt-4 w-full" icon={<Icons.Whatsapp size={14}/>}>{t('home.pack.cta')}</Btn>
          </div>
        </div>
      </div>
    </Section>
  );
};

const Temoignages = () => {
  const { t, richT } = useI18n();
  return (
    <Section id="avis" label={t('home.testimonials.label')} title={richT(t('home.testimonials.title'))}
             className="py-20 md:py-28" screenLabel="08 Témoignages">
      <div className="grid md:grid-cols-3 gap-5 md:gap-6">
        {TESTIMONIALS.map((tt,i)=>{
          const flag = { it:'🇮🇹', en:'🇬🇧', fr:'🇫🇷', de:'🇩🇪' }[tt.lang] || '';
          return (
          <figure key={i} className="bg-sand-100 rounded-3xl p-6 md:p-7 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <Icons.Quote size={22} className="text-terre"/>
              {flag && <span className="text-[18px] leading-none" aria-hidden="true">{flag}</span>}
            </div>
            <blockquote className="font-display text-[18px] md:text-[20px] leading-snug text-ink">"{tt.text}"</blockquote>
            <div className="mt-auto pt-6 flex items-center gap-3">
              <div className="h-12 w-12 rounded-full overflow-hidden shrink-0">
                <Photo tone={tt.tone} mood={tt.mood} rounded="rounded-full" showLabel={false} className="h-12 w-12"/>
              </div>
              <div className="flex-1">
                <div className="font-medium text-[14px]">{tt.name}</div>
                <div className="text-[12px] text-ink-500">{tt.from}{tt.circuit ? <> · <span className="text-ink-700">{tt.circuit}</span></> : null}</div>
              </div>
              <StarRow value={tt.stars} size={12}/>
            </div>
          </figure>
          );
        })}
      </div>
    </Section>
  );
};

const BlogTeaser = ({ go }) => {
  const { t, richT } = useI18n();
  const picks = BLOG.slice(0, 3);
  return (
    <Section id="blog-spot" label={t('home.blog.label')} title={richT(t('home.blog.title'))}
             kicker={t('home.blog.kicker')}
             intro={<button onClick={()=>go('blog')} className="underline underline-offset-4 hover:text-terre">{t('home.blog.viewAll')}</button>}
             className="py-20 md:py-28 bg-sand-100" screenLabel="09 Blog">
      <div className="grid md:grid-cols-3 gap-5 md:gap-6">
        {picks.map(b => (
          <button key={b.id} onClick={()=>go('blog', b.id)} className="group flex flex-col text-left bg-sand-50 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
            <Photo tone={b.tone} mood={b.mood} label={b.tag} ratio="aspect-[5/4]" rounded="" src={b.img} alt={b.title}/>
            <div className="p-6 flex flex-col flex-1">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink-500">{b.tag} · {b.readTime}</div>
              <h3 className="font-display text-[24px] leading-tight mt-2 group-hover:text-terre transition-colors">{b.title}</h3>
              <p className="text-[14px] text-ink-600 leading-relaxed mt-2.5">{b.excerpt}</p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium">
                {t('home.blog.readArticle')} <Icons.ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform"/>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Section>
  );
};

const Insta = () => {
  const { t } = useI18n();
  return (
    <section className="py-20 md:py-24 overflow-hidden" data-screen-label="10 Instagram">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-3">— {t('home.insta.label')}</div>
          <h2 className="font-display text-[32px] md:text-[44px] leading-none">@actours_senegal</h2>
        </div>
        <a href="#" className="text-[14px] inline-flex items-center gap-1.5 hover:text-terre">{t('home.insta.follow')} <Icons.ArrowUpRight size={14}/></a>
      </div>
    <div className="relative">
      <div className="flex gap-3 md:gap-4 marquee w-max">
        {[...INSTA, ...INSTA].map((p,i)=>(
          <div key={i} className="w-[160px] sm:w-[200px] md:w-[240px] aspect-square shrink-0">
            <Photo tone={p.tone} mood={p.mood} rounded="rounded-xl" showLabel={false} className="h-full w-full" src={p.img} alt=""/>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-sand-50 to-transparent"/>
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-sand-50 to-transparent"/>
    </div>
    </section>
  );
};

const Home = ({ onOpenTour, go }) => (
  <main>
    <Hero go={go}/>
    <Reassurance/>
    {/* Trois sections d'introduction demandées par ACT après le hero :
        (1) Le Sénégal vu par l'agence, (2) Brève présentation ACT avec CTA
        À propos, (3) Sélection de produits & circuits avec CTA vers le
        catalogue renommé 'Circuits & produits'. */}
    <SenegalSelonACT/>
    <ProfilACT go={go}/>
    <ProduitsCircuits onOpenTour={onOpenTour} go={go}/>
    <Destinations go={go}/>
    <DestinationsMap go={go}/>
    <Pourquoi/>
    <RetourSources go={go}/>
    <PackDakar/>
    <Temoignages/>
    <BlogTeaser go={go}/>
    <Insta/>
    <Footer go={go}/>
  </main>
);

if (typeof window !== 'undefined') Object.assign(window, { Home });
export { Home };

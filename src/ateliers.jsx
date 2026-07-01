// Ateliers — page catalogue des ateliers d'artisanat, musique et danse.
// Source : Nos ateliers.docx (juillet 2026). 9 ateliers d'une journée
// répartis en 3 catégories : artisanat, musique, danse.

const ATELIER_CATEGORIES = [
  { id:'artisanat', fallback:'Artisanat' },
  { id:'musique',   fallback:'Musique'   },
  { id:'danse',     fallback:'Danse'     },
];

const filterAteliers = (cat) => cat ? ATELIERS.filter(a => a.category === cat) : ATELIERS.slice();

// --- Card atelier ------------------------------------------------------------
const AtelierCard = ({ a, onDetails }) => {
  const { t } = useI18n();
  const title    = t(`atelier.${a.id}.title`,    a.title);
  const subtitle = t(`atelier.${a.id}.subtitle`, a.subtitle);
  const short    = t(`atelier.${a.id}.short`,    a.short);
  const catLabel = t(`ateliers.category.${a.category}`,
                     ATELIER_CATEGORIES.find(c => c.id === a.category)?.fallback);
  return (
    <article className="group flex flex-col bg-sand-50 rounded-3xl overflow-hidden border border-ink/5 hover:shadow-lg hover:shadow-ink/5 transition-shadow">
      <Photo tone={a.tone} mood={a.mood} label={catLabel} ratio="aspect-[5/4]" rounded="" src={a.img} alt={title}/>
      <div className="p-6 flex flex-col flex-1">
        <div className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-terre mb-2">{catLabel}</div>
        <h3 className="font-display text-[22px] md:text-[24px] leading-tight">{title}</h3>
        <div className="text-[13px] text-ink-600 mt-1">{subtitle}</div>
        <p className="text-[14px] text-ink-700 leading-relaxed mt-3 flex-1">{short}</p>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <div className="text-[10.5px] text-ink-500 font-mono uppercase tracking-wider">{t('common.priceLabel')}</div>
            <span className="font-display text-[20px] leading-none">{t('common.onQuote')}</span>
          </div>
          <button onClick={()=>onDetails(a.id)} className="h-10 px-4 rounded-full bg-ink text-sand-50 text-[13px] inline-flex items-center gap-1.5 hover:bg-terre transition-colors">
            {t('cta.quote')} <Icons.ArrowRight size={14}/>
          </button>
        </div>
      </div>
    </article>
  );
};

// --- Page principale ---------------------------------------------------------
const Ateliers = ({ go }) => {
  const { t, richT } = useI18n();
  const [cat, setCat] = React.useState(null);
  const list = filterAteliers(cat);

  const openQuoteWA = (id) => {
    const a = ATELIERS.find(x => x.id === id);
    const title = t(`atelier.${id}.title`, a?.title || '');
    const msg = t('ateliers.wa.detail').replace('{title}', title);
    window.open(buildWaURL(msg), '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="bg-sand-50">
      <PageHero kicker={t('page.ateliers.kicker')} tone="ocre" mood="portrait" bgImg={IMG('Casamance', 5)}
        title={richT(t('page.ateliers.title'))}
        intro={t('page.ateliers.intro')}/>

      {/* Filter tabs */}
      <div className="sticky top-16 md:top-[72px] z-20 bg-sand-50/95 backdrop-blur-md border-b border-ink/10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center justify-between gap-3">
          <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-500 truncate">
            <span className="text-ink font-semibold">{list.length}</span> {t('page.ateliers.count')}
          </div>
          <div className="flex items-center gap-2 shrink-0 overflow-x-auto no-scrollbar">
            <button onClick={()=>setCat(null)}
              className={`h-9 px-4 rounded-full text-[12.5px] font-medium border transition ${cat===null ? 'bg-ink text-sand-50 border-ink' : 'bg-transparent text-ink-700 border-ink/15 hover:border-ink/40'}`}>
              {t('common.all', 'Tous')}
            </button>
            {ATELIER_CATEGORIES.map(c => (
              <button key={c.id} onClick={()=>setCat(c.id === cat ? null : c.id)}
                className={`h-9 px-4 rounded-full text-[12.5px] font-medium border transition capitalize ${cat===c.id ? 'bg-ink text-sand-50 border-ink' : 'bg-transparent text-ink-700 border-ink/15 hover:border-ink/40'}`}>
                {t(`ateliers.category.${c.id}`, c.fallback)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-10 md:py-14">
        {list.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink/20 p-12 text-center">
            <div className="font-display text-[26px]">{t('page.ateliers.empty.title')}</div>
            <p className="text-ink-600 mt-2">{t('page.ateliers.empty.intro')}</p>
            <Btn variant="outline" className="mt-5" onClick={()=>setCat(null)}>{t('common.reset')}</Btn>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {list.map(a => <AtelierCard key={a.id} a={a} onDetails={openQuoteWA}/>)}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 md:mt-24 rounded-3xl bg-ink text-sand-50 p-8 md:p-12 grid md:grid-cols-[1.4fr,1fr] gap-6 items-center">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre-300 mb-3">— {t('page.ateliers.bottomCTA.kicker')}</div>
            <h3 className="font-display text-[28px] md:text-[40px] leading-tight">
              {richT(t('page.ateliers.bottomCTA.title'))}
            </h3>
            <p className="text-sand-200 mt-3 max-w-xl">{t('page.ateliers.bottomCTA.body')}</p>
          </div>
          <div className="flex md:justify-end">
            <Btn onClick={()=>go('custom')} variant="terre" size="lg" icon={<Icons.ArrowRight size={18}/>}>
              {t('page.ateliers.bottomCTA.cta')}
            </Btn>
          </div>
        </div>
      </section>

      <Footer go={go}/>
    </main>
  );
};

Object.assign(window, { Ateliers });

import React from 'react';
import { useI18n } from './i18n.jsx';
import { Icons } from './icons.jsx';
import { Photo } from './photo.jsx';
import { Btn, CircuitCard, Footer, PageHero } from './shared.jsx';
import { Chip, FilterGroup } from './catalog.jsx';
import { EXCURSIONS, DESTINATIONS, IMG } from './data.jsx';
// Excursions — page catalogue des activités courtes (demi-journée / journée).
// Décision ACT (juin 2026) : séparer Circuits / Excursions / Croisières.
// Réutilise CircuitCard et le pattern de filtres du catalogue principal,
// avec une simplification : filtre Kind (half/full) au lieu de Durée.

const EXC_KIND_OPTIONS = [
  { id:'half', fallback:'Demi-journée' },
  { id:'full', fallback:'Journée complète' },
];

// Points de départ possibles pour les excursions (Dakar, Saly, à terme
// Saint-Louis / Casamance). Extraction dynamique depuis EXCURSIONS pour
// n'afficher que les départs réellement disponibles.
const EXC_START_OPTIONS = [
  { id:'dakar', fallback:'Dakar' },
  { id:'saly',  fallback:'Saly'  },
];

const EXC_TYPE_OPTIONS = [
  { id:'culture',   fallback:'Culture & Histoire'    },
  { id:'nature',    fallback:'Nature & Faune'        },
  { id:'diaspora',  fallback:'Diaspora & Patrimoine' },
  { id:'famille',   fallback:'Famille'               },
];

const EXC_SORTS = [
  { id:'pertinence', fallback:'Pertinence' },
  { id:'popularity', fallback:'Popularité' },
];

const excDefaultFilters = () => ({
  kinds: [],
  starts: [],
  types: [],
  destIds: [],
  sort: 'pertinence',
});

const filterExcursions = (filters) => {
  let list = EXCURSIONS.slice();
  if (filters.kinds.length)  list = list.filter(e => filters.kinds.includes(e.kind));
  if (filters.starts.length) list = list.filter(e => filters.starts.includes(e.start));
  if (filters.types.length)  list = list.filter(e => filters.types.some(t => e.types.includes(t)));
  if (filters.destIds.length) list = list.filter(e => filters.destIds.some(d => e.destIds.includes(d)));
  switch (filters.sort) {
    case 'popularity': list.sort((a,b)=>b.popularity-a.popularity); break;
    default: break;
  }
  return list;
};

// --- Filter UI ----------------------------------------------------------------
const ExcFiltersBody = ({ f, set }) => {
  const { t } = useI18n();
  const toggle = (key, value) => {
    set(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v=>v!==value) : [...prev[key], value]
    }));
  };
  return (
    <div className="pr-1">
      <FilterGroup title={t('excursions.filters.kind')}>
        <div className="flex flex-wrap gap-2">
          {EXC_KIND_OPTIONS.map(opt => (
            <Chip key={opt.id} active={f.kinds.includes(opt.id)} onClick={()=>toggle('kinds', opt.id)}>
              {t(`excursions.kind.${opt.id}`, opt.fallback)}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={t('excursions.filters.start')}>
        <div className="flex flex-wrap gap-2">
          {EXC_START_OPTIONS.map(opt => (
            <Chip key={opt.id} active={f.starts.includes(opt.id)} onClick={()=>toggle('starts', opt.id)}>
              {t(`excursions.start.${opt.id}`, opt.fallback)}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={t('catalog.filters.type')}>
        <div className="flex flex-wrap gap-2">
          {EXC_TYPE_OPTIONS.map(opt => (
            <Chip key={opt.id} active={f.types.includes(opt.id)} onClick={()=>toggle('types', opt.id)}>
              {t(`catalog.type.${opt.id}`, opt.fallback)}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={t('catalog.filters.destination')}>
        <div className="flex flex-wrap gap-2">
          {DESTINATIONS.map(d => (
            <Chip key={d.id} size="sm" active={f.destIds.includes(d.id)} onClick={()=>toggle('destIds', d.id)}>
              {t(`destination.${d.id}.name`, d.name)}
            </Chip>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
};

// --- Card spécialisée pour excursions (affiche kind + horaires) ---------------
const ExcursionCard = ({ e, onOpen, size = 'md' }) => {
  const { t } = useI18n();
  const title    = t(`excursion.${e.id}.title`,    e.title);
  const subtitle = t(`excursion.${e.id}.subtitle`, e.subtitle);
  const kindLabel = t(`excursions.kind.${e.kind}`, e.kind === 'half' ? 'Demi-journée' : 'Journée complète');
  return (
    <article className="group flex flex-col" data-comment-anchor={`excursion-card-${e.id}`}>
      <button onClick={()=>onOpen(e.id)} className="block w-full text-left">
        <Photo tone={e.tone} mood={e.mood} label={kindLabel} ratio={size==='sm' ? 'aspect-[5/4]' : 'aspect-[4/5]'} className="mb-4 group-hover:scale-[1.01] transition-transform" rounded="rounded-2xl" src={e.img} alt={title}/>
      </button>
      <div className="flex items-center gap-2 mb-2 text-[12px] text-ink-500">
        <Icons.Clock size={12} className="text-terre"/>
        <span>{e.schedule}</span>
      </div>
      <button onClick={()=>onOpen(e.id)} className="text-left">
        <h3 className="font-display text-[22px] md:text-[24px] leading-tight group-hover:text-terre transition-colors">{title}</h3>
        <div className="text-[13px] text-ink-600 mt-1">{subtitle}</div>
      </button>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-[10.5px] text-ink-500 font-mono uppercase tracking-wider">{t('common.priceLabel')}</div>
          <span className="font-display text-[20px] md:text-[22px] leading-none">{t('common.onQuote')}</span>
        </div>
        <button onClick={()=>onOpen(e.id)} className="h-10 px-4 rounded-full bg-ink text-sand-50 text-[13px] inline-flex items-center gap-1.5 hover:bg-terre transition-colors">
          {t('cta.details')} <Icons.ArrowRight size={14}/>
        </button>
      </div>
    </article>
  );
};

// --- Page Excursions ---------------------------------------------------------
const Excursions = ({ go, onOpenTour }) => {
  const { t, richT } = useI18n();
  const [f, setF] = React.useState(excDefaultFilters);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const reset = () => setF(excDefaultFilters());
  const list = filterExcursions(f);
  const activeCount = f.kinds.length + f.starts.length + f.types.length + f.destIds.length;

  return (
    <main className="bg-sand-50">
      <PageHero kicker={t('page.excursions.kicker')} tone="dusk" mood="city" bgImg={IMG('Dakar', 1)}
        title={richT(t('page.excursions.title'))}
        intro={t('page.excursions.intro')}/>

      {/* Toolbar */}
      <div className="sticky top-16 md:top-[72px] z-20 bg-sand-50/95 backdrop-blur-md border-b border-ink/10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={()=>setDrawerOpen(true)}
              className="md:hidden inline-flex items-center gap-2 px-3.5 h-9 rounded-full border border-ink/15 text-[13px] font-medium">
              <Icons.Menu size={14}/> {t('catalog.toolbar.filter')}
              {activeCount > 0 && <span className="h-5 min-w-[20px] px-1 inline-flex items-center justify-center rounded-full bg-terre-600 text-sand-50 text-[10.5px] font-mono">{activeCount}</span>}
            </button>
            <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-500 truncate">
              <span className="text-ink font-semibold">{list.length}</span> {t('page.excursions.count')}
              {activeCount > 0 && <button onClick={reset} className="ml-3 underline underline-offset-2 hover:text-terre">{t('catalog.toolbar.reset')}</button>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline text-[12px] text-ink-500 font-mono uppercase tracking-wider">{t('catalog.toolbar.sort')}</span>
            <select value={f.sort} onChange={(e)=>setF(p=>({...p, sort:e.target.value}))}
              aria-label={t('catalog.toolbar.sort')}
              className="h-9 px-3 pr-8 rounded-full border border-ink/15 text-[12.5px] font-medium bg-transparent outline-none cursor-pointer">
              {EXC_SORTS.map(s => <option key={s.id} value={s.id}>{t(`catalog.sort.${s.id}`, s.fallback)}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-10 md:py-14 grid md:grid-cols-[280px,1fr] lg:grid-cols-[300px,1fr] gap-10 md:gap-12">
        {/* Desktop sidebar */}
        <aside className="hidden md:block self-start sticky top-32">
          <div className="bg-sand-100/60 rounded-3xl p-5 border border-ink/5">
            <div className="flex items-center justify-between mb-1">
              <div className="font-display text-[22px]">{t('catalog.filters.title')}</div>
              {activeCount>0 && <button onClick={reset} className="text-[12px] text-terre underline underline-offset-2">{t('catalog.filters.reset')}</button>}
            </div>
            <ExcFiltersBody f={f} set={setF}/>
          </div>
        </aside>

        {/* Results */}
        <div>
          {list.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-ink/20 p-8 md:p-14 text-center">
              <div className="font-display text-[28px] md:text-[36px] leading-tight max-w-xl mx-auto">
                {richT(t('page.excursions.empty.title'))}
              </div>
              <p className="text-ink-600 mt-3 max-w-md mx-auto">{t('page.excursions.empty.intro')}</p>
              <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                <Btn onClick={()=>go('custom')} variant="terre" icon={<Icons.ArrowRight size={16}/>}>{t('catalog.empty.composeCTA')}</Btn>
                <Btn variant="outline" onClick={reset}>{t('catalog.empty.clearCTA')}</Btn>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
              {list.map(e => <ExcursionCard key={e.id} e={e} onOpen={onOpenTour} size="sm"/>)}
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-16 md:mt-24 rounded-3xl bg-ink text-sand-50 p-8 md:p-12 grid md:grid-cols-[1.4fr,1fr] gap-6 items-center">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre-300 mb-3">— {t('footer.bespokeKicker')}</div>
              <h3 className="font-display text-[28px] md:text-[40px] leading-tight">
                {richT(t('page.excursions.bottomCTA.title'))}
              </h3>
              <p className="text-sand-200 mt-3 max-w-xl">{t('page.excursions.bottomCTA.body')}</p>
            </div>
            <div className="flex md:justify-end">
              <Btn onClick={()=>go('custom')} variant="terre" size="lg" icon={<Icons.ArrowRight size={18}/>}>{t('catalog.bottomCTA.cta')}</Btn>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`md:hidden fixed inset-0 z-50 ${drawerOpen ? '' : 'pointer-events-none'}`}>
        <div onClick={()=>setDrawerOpen(false)} className={`absolute inset-0 bg-ink/40 transition-opacity ${drawerOpen?'opacity-100':'opacity-0'}`}/>
        <div className={`absolute inset-x-0 bottom-0 max-h-[88vh] bg-sand-50 rounded-t-3xl transition-transform duration-300 ${drawerOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex items-center justify-between p-5 border-b border-ink/5">
            <div className="font-display text-[22px]">{t('catalog.filters.title')}</div>
            <button onClick={()=>setDrawerOpen(false)} aria-label={t('common.close')} className="h-10 w-10 rounded-full hover:bg-ink/5 inline-flex items-center justify-center"><Icons.Close size={20}/></button>
          </div>
          <div className="px-5 pb-3 overflow-y-auto" style={{maxHeight:'calc(88vh - 140px)'}}>
            <ExcFiltersBody f={f} set={setF}/>
          </div>
          <div className="p-4 border-t border-ink/10 bg-sand-50 flex items-center gap-3">
            <Btn variant="outline" className="flex-1" onClick={reset}>{t('catalog.filters.reset')}</Btn>
            <Btn variant="primary" className="flex-1" onClick={()=>setDrawerOpen(false)}>
              {list.length > 1 ? t('catalog.drawer.showMany').replace('{n}', list.length) : t('catalog.drawer.showOne').replace('{n}', list.length)}
            </Btn>
          </div>
        </div>
      </div>

      <Footer go={go}/>
    </main>
  );
};

if (typeof window !== 'undefined') Object.assign(window, { Excursions });
export { Excursions };

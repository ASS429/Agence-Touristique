import React from 'react';
import { useI18n } from './i18n.jsx';
import { Icons } from './icons.jsx';
import { Btn, CircuitCard, Footer, PageHero } from './shared.jsx';
import { CIRCUITS, DESTINATIONS, IMG } from './data.jsx';
// Catalogue des circuits — sticky filters (desktop) + drawer (mobile)
// + grid + pagination + empty state.

// --- helpers ----------------------------------------------------------------
// Les labels sont résolus côté JSX via t(`catalog.<group>.<id>`) avec fallback
// sur le libellé FR — les options data ne portent donc plus que les ids et la
// logique métier. Cette structure se traduit automatiquement à la bascule
// de langue, sans réinstanciation des tableaux.
const DURATION_BUCKETS = [
  { id:'1',    fallback:'1 jour',      match:(d)=>d===1 },
  { id:'2-3',  fallback:'Week-end',    match:(d)=>d>=2 && d<=3 },
  { id:'4-5',  fallback:'3 à 5 jours', match:(d)=>d>=4 && d<=5 },
  { id:'6-10', fallback:'6 à 10 jours',match:(d)=>d>=6 && d<=10 },
  { id:'10+',  fallback:'+10 jours',   match:(d)=>d>10 },
];

const TYPE_OPTIONS = [
  { id:'culture',   fallback:'Culture & Histoire'    },
  { id:'nature',    fallback:'Nature & Faune'        },
  { id:'plage',     fallback:'Plage & Détente'       },
  { id:'aventure',  fallback:'Aventure'              },
  { id:'famille',   fallback:'Famille'               },
  { id:'diaspora',  fallback:'Diaspora & Patrimoine' },
  { id:'evenement', fallback:'Événements & Cérémonies' },
];

// Filtre "Budget" supprimé (décision ACT : pas de prix affichés). Les options
// TIER_OPTIONS sont conservées dans data.jsx pour l'analytique côté agence
// mais n'apparaissent plus dans l'UI catalogue.

const START_OPTIONS = [
  { id:'dakar',       fallback:'Dakar' },
  { id:'saint-louis', fallback:'Saint-Louis' },
  { id:'autre',       fallback:'Autre' },
];

// Tris par prix supprimés (décision ACT : sur devis). Pertinence, Durée et
// Popularité couvrent les besoins de tri restants.
const SORTS = [
  { id:'pertinence', fallback:'Pertinence' },
  { id:'duration',   fallback:'Durée' },
  { id:'popularity', fallback:'Popularité' },
];

const defaultFilters = () => ({
  durations: [],
  types: [],
  tier: null,
  destIds: [],
  start: null,
  sort: 'pertinence',
});

const filterCircuits = (filters) => {
  let list = CIRCUITS.slice();
  if (filters.durations.length) {
    const matchers = DURATION_BUCKETS.filter(b => filters.durations.includes(b.id)).map(b=>b.match);
    list = list.filter(c => matchers.some(m => m(c.days)));
  }
  if (filters.types.length) {
    list = list.filter(c => filters.types.some(t => c.types.includes(t)));
  }
  if (filters.tier) list = list.filter(c => c.tier === filters.tier);
  if (filters.start) list = list.filter(c => c.start === filters.start);
  if (filters.destIds.length) list = list.filter(c => filters.destIds.some(d => c.destIds.includes(d)));
  // sort (tris par prix retirés — décision ACT : pas de prix affichés)
  switch (filters.sort) {
    case 'duration':   list.sort((a,b)=>a.days-b.days); break;
    case 'popularity': list.sort((a,b)=>b.popularity-a.popularity); break;
    default: /* pertinence: keep original order */ break;
  }
  return list;
};

// --- Filter UI atoms --------------------------------------------------------
const FilterGroup = ({ title, children }) => (
  <div className="py-5 border-b border-ink/10 last:border-0">
    <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-600 mb-3">{title}</div>
    {children}
  </div>
);

const Chip = ({ active, onClick, children, size = 'md' }) => (
  <button onClick={onClick}
    className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${
      size==='sm' ? 'h-7 px-2.5 text-[11.5px]' : 'h-9 px-3 text-[12.5px]'
    } ${active ? 'bg-ink text-sand-50 border-ink' : 'bg-transparent text-ink-700 border-ink/15 hover:border-ink/40'}`}>
    {children}
  </button>
);

const FiltersBody = ({ f, set, count }) => {
  const { t } = useI18n();
  const toggle = (key, value) => {
    set(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v=>v!==value) : [...prev[key], value]
    }));
  };
  const setOne = (key, value) => set(prev => ({ ...prev, [key]: prev[key]===value ? null : value }));

  return (
    <div className="pr-1">
      <FilterGroup title={t('catalog.filters.duration')}>
        <div className="flex flex-wrap gap-2">
          {DURATION_BUCKETS.map(b => (
            <Chip key={b.id} active={f.durations.includes(b.id)} onClick={()=>toggle('durations', b.id)}>
              {t(`catalog.duration.${b.id}`, b.fallback)}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={t('catalog.filters.type')}>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map(opt => (
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

      <FilterGroup title={t('catalog.filters.start')}>
        <div className="flex flex-wrap gap-2">
          {START_OPTIONS.map(s => (
            <Chip key={s.id} active={f.start===s.id} onClick={()=>setOne('start', s.id)}>
              {t(`catalog.start.${s.id}`, s.fallback)}
            </Chip>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
};

// --- Catalog page -----------------------------------------------------------
const Catalog = ({ go, onOpenTour, initialFilter }) => {
  const { t, richT } = useI18n();
  const [f, setF] = React.useState(() => {
    const base = defaultFilters();
    if (initialFilter === 'diaspora') base.types = ['diaspora'];
    return base;
  });
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const perPage = 9;

  React.useEffect(()=>{ setPage(1); }, [f]);

  const list = filterCircuits(f);
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  const view = list.slice((page-1)*perPage, page*perPage);
  const activeCount = f.durations.length + f.types.length + f.destIds.length + (f.start?1:0);
  const reset = () => setF(defaultFilters());

  return (
    <main className="bg-sand-50">
      <PageHero kicker={t('page.catalog.kicker')} tone="atlant" mood="water" bgImg={IMG('Delta du Saloum', 1)}
        title={richT(t('page.catalog.title'))}
        intro={t('page.catalog.intro')}/>

      {/* Toolbar — sticky on desktop, also collapses neatly on mobile */}
      <div className="sticky top-16 md:top-[72px] z-20 bg-sand-50/95 backdrop-blur-md border-b border-ink/10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={()=>setDrawerOpen(true)}
              className="md:hidden inline-flex items-center gap-2 px-3.5 h-9 rounded-full border border-ink/15 text-[13px] font-medium">
              <Icons.Menu size={14}/> {t('catalog.toolbar.filter')}
              {activeCount > 0 && <span className="h-5 min-w-[20px] px-1 inline-flex items-center justify-center rounded-full bg-terre-600 text-sand-50 text-[10.5px] font-mono">{activeCount}</span>}
            </button>
            <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-500 truncate">
              <span className="text-ink font-semibold">{list.length}</span> {list.length>1 ? t('catalog.toolbar.tours.many') : t('catalog.toolbar.tours.one')}
              {activeCount > 0 && <button onClick={reset} className="ml-3 underline underline-offset-2 hover:text-terre">{t('catalog.toolbar.reset')}</button>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline text-[12px] text-ink-500 font-mono uppercase tracking-wider">{t('catalog.toolbar.sort')}</span>
            <select value={f.sort} onChange={(e)=>setF(p=>({...p, sort:e.target.value}))}
              aria-label={t('catalog.toolbar.sort')}
              className="h-9 px-3 pr-8 rounded-full border border-ink/15 text-[12.5px] font-medium bg-transparent outline-none cursor-pointer">
              {SORTS.map(s => <option key={s.id} value={s.id}>{t(`catalog.sort.${s.id}`, s.fallback)}</option>)}
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
            <FiltersBody f={f} set={setF}/>
          </div>
        </aside>

        {/* Results */}
        <div>
          {view.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-ink/20 p-8 md:p-14 text-center">
              <div className="font-display text-[28px] md:text-[36px] leading-tight max-w-xl mx-auto">
                {richT(t('catalog.empty.title'))}
              </div>
              <p className="text-ink-600 mt-3 max-w-md mx-auto">{t('catalog.empty.intro')}</p>
              <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                <Btn onClick={()=>go('custom')} variant="terre" icon={<Icons.ArrowRight size={16}/>}>{t('catalog.empty.composeCTA')}</Btn>
                <Btn variant="outline" onClick={reset}>{t('catalog.empty.clearCTA')}</Btn>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
              {view.map(c => <CircuitCard key={c.id} c={c} onOpen={onOpenTour} size="sm"/>)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-1.5">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                className="h-10 w-10 rounded-full border border-ink/15 inline-flex items-center justify-center disabled:opacity-30 hover:border-ink/40">
                <Icons.ArrowLeft size={16}/>
              </button>
              {Array.from({length:pages}).map((_,i)=>(
                <button key={i} onClick={()=>{ setPage(i+1); window.scrollTo({top:0}); }}
                  className={`h-10 min-w-[40px] px-3 rounded-full text-[13px] font-medium transition-colors ${page===i+1 ? 'bg-ink text-sand-50' : 'text-ink-700 hover:bg-ink/5'}`}>
                  {String(i+1).padStart(2,'0')}
                </button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages}
                className="h-10 w-10 rounded-full border border-ink/15 inline-flex items-center justify-center disabled:opacity-30 hover:border-ink/40">
                <Icons.ArrowRight size={16}/>
              </button>
            </div>
          )}

          {/* "Vous ne trouvez pas ?" */}
          <div className="mt-16 md:mt-24 rounded-3xl bg-ink text-sand-50 p-8 md:p-12 grid md:grid-cols-[1.4fr,1fr] gap-6 items-center">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre-300 mb-3">— {t('footer.bespokeKicker')}</div>
              <h3 className="font-display text-[28px] md:text-[40px] leading-tight">
                {richT(t('catalog.bottomCTA.title'))}
              </h3>
              <p className="text-sand-200 mt-3 max-w-xl">{t('catalog.bottomCTA.body')}</p>
            </div>
            <div className="flex md:justify-end">
              <Btn onClick={()=>go('custom')} variant="terre" size="lg" icon={<Icons.ArrowRight size={18}/>}>{t('catalog.bottomCTA.cta')}</Btn>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      <div className={`md:hidden fixed inset-0 z-50 ${drawerOpen ? '' : 'pointer-events-none'}`}>
        <div onClick={()=>setDrawerOpen(false)} className={`absolute inset-0 bg-ink/40 transition-opacity ${drawerOpen?'opacity-100':'opacity-0'}`}/>
        <div className={`absolute inset-x-0 bottom-0 max-h-[88vh] bg-sand-50 rounded-t-3xl transition-transform duration-300 ${drawerOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex items-center justify-between p-5 border-b border-ink/5">
            <div className="font-display text-[22px]">{t('catalog.filters.title')}</div>
            <button onClick={()=>setDrawerOpen(false)} aria-label={t('common.close')} className="h-10 w-10 rounded-full hover:bg-ink/5 inline-flex items-center justify-center"><Icons.Close size={20}/></button>
          </div>
          <div className="px-5 pb-3 overflow-y-auto" style={{maxHeight:'calc(88vh - 140px)'}}>
            <FiltersBody f={f} set={setF}/>
          </div>
          <div className="p-4 border-t border-ink/10 bg-sand-50 flex items-center gap-3">
            <Btn variant="outline" className="flex-1" onClick={reset}>{t('catalog.filters.reset')}</Btn>
            <Btn variant="primary" className="flex-1" onClick={()=>setDrawerOpen(false)}>
              {(list.length>1 ? t('catalog.drawer.showMany') : t('catalog.drawer.showOne')).replace('{n}', list.length)}
            </Btn>
          </div>
        </div>
      </div>

      <Footer go={go}/>
    </main>
  );
};

if (typeof window !== 'undefined') Object.assign(window, { Catalog });
export { Catalog };

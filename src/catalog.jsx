// Catalogue des circuits — sticky filters (desktop) + drawer (mobile)
// + grid + pagination + empty state.

// --- helpers ----------------------------------------------------------------
const DURATION_BUCKETS = [
  { id:'1',    label:'1 jour',      match:(d)=>d===1 },
  { id:'2-3',  label:'Week-end',    match:(d)=>d>=2 && d<=3 },
  { id:'4-5',  label:'3 à 5 jours', match:(d)=>d>=4 && d<=5 },
  { id:'6-10', label:'6 à 10 jours',match:(d)=>d>=6 && d<=10 },
  { id:'10+',  label:'+10 jours',   match:(d)=>d>10 },
];

const TYPE_OPTIONS = [
  { id:'culture',    label:'Culture & Histoire'    },
  { id:'nature',     label:'Nature & Faune'        },
  { id:'plage',      label:'Plage & Détente'       },
  { id:'aventure',   label:'Aventure'              },
  { id:'famille',    label:'Famille'               },
  { id:'diaspora',   label:'Diaspora & Patrimoine' },
  { id:'evenement',  label:'Événements & Cérémonies' },
];

const TIER_OPTIONS = [
  { id:'eco',     label:'Économique', helper:'-' },
  { id:'confort', label:'Confort',    helper:'--' },
  { id:'premium', label:'Premium',    helper:'---' },
];

const START_OPTIONS = [
  { id:'dakar',       label:'Dakar' },
  { id:'saint-louis', label:'Saint-Louis' },
  { id:'autre',       label:'Autre' },
];

const SORTS = [
  { id:'pertinence', label:'Pertinence' },
  { id:'priceAsc',   label:'Prix croissant' },
  { id:'priceDesc',  label:'Prix décroissant' },
  { id:'duration',   label:'Durée' },
  { id:'popularity', label:'Popularité' },
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
  // sort
  switch (filters.sort) {
    case 'priceAsc':   list.sort((a,b)=>a.priceXOF-b.priceXOF); break;
    case 'priceDesc':  list.sort((a,b)=>b.priceXOF-a.priceXOF); break;
    case 'duration':   list.sort((a,b)=>a.days-b.days); break;
    case 'popularity': list.sort((a,b)=>b.popularity-a.popularity); break;
    default: /* pertinence: keep original order */ break;
  }
  return list;
};

// --- Filter UI atoms --------------------------------------------------------
const FilterGroup = ({ title, children }) => (
  <div className="py-5 border-b border-ink/10 last:border-0">
    <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-500 mb-3">{title}</div>
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
  const toggle = (key, value) => {
    set(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v=>v!==value) : [...prev[key], value]
    }));
  };
  const setOne = (key, value) => set(prev => ({ ...prev, [key]: prev[key]===value ? null : value }));

  return (
    <div className="pr-1">
      <FilterGroup title="Durée">
        <div className="flex flex-wrap gap-2">
          {DURATION_BUCKETS.map(b => (
            <Chip key={b.id} active={f.durations.includes(b.id)} onClick={()=>toggle('durations', b.id)}>{b.label}</Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Type d’expérience">
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map(t => (
            <Chip key={t.id} active={f.types.includes(t.id)} onClick={()=>toggle('types', t.id)}>{t.label}</Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Budget">
        <div className="grid grid-cols-3 gap-2">
          {TIER_OPTIONS.map(t => (
            <button key={t.id} onClick={()=>setOne('tier', t.id)}
              className={`p-3 rounded-2xl text-left border transition-colors ${f.tier===t.id ? 'bg-ink text-sand-50 border-ink' : 'border-ink/15 hover:border-ink/40'}`}>
              <div className="font-mono text-[10.5px] tracking-wider opacity-70">{t.helper}</div>
              <div className="font-medium text-[13px] mt-0.5">{t.label}</div>
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Destination">
        <div className="flex flex-wrap gap-2">
          {DESTINATIONS.map(d => (
            <Chip key={d.id} size="sm" active={f.destIds.includes(d.id)} onClick={()=>toggle('destIds', d.id)}>{d.name}</Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Point de départ">
        <div className="flex flex-wrap gap-2">
          {START_OPTIONS.map(s => (
            <Chip key={s.id} active={f.start===s.id} onClick={()=>setOne('start', s.id)}>{s.label}</Chip>
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
  const activeCount = f.durations.length + f.types.length + f.destIds.length + (f.tier?1:0) + (f.start?1:0);
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
              <Icons.Menu size={14}/> Filtrer
              {activeCount > 0 && <span className="h-5 min-w-[20px] px-1 inline-flex items-center justify-center rounded-full bg-terre text-sand-50 text-[10.5px] font-mono">{activeCount}</span>}
            </button>
            <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-500 truncate">
              <span className="text-ink font-semibold">{list.length}</span> circuit{list.length>1?'s':''}
              {activeCount > 0 && <button onClick={reset} className="ml-3 underline underline-offset-2 hover:text-terre">réinitialiser</button>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline text-[12px] text-ink-500 font-mono uppercase tracking-wider">Tri</span>
            <select value={f.sort} onChange={(e)=>setF(p=>({...p, sort:e.target.value}))}
              className="h-9 px-3 pr-8 rounded-full border border-ink/15 text-[12.5px] font-medium bg-transparent outline-none cursor-pointer">
              {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-10 md:py-14 grid md:grid-cols-[280px,1fr] lg:grid-cols-[300px,1fr] gap-10 md:gap-12">
        {/* Desktop sidebar */}
        <aside className="hidden md:block self-start sticky top-32">
          <div className="bg-sand-100/60 rounded-3xl p-5 border border-ink/5">
            <div className="flex items-center justify-between mb-1">
              <div className="font-display text-[22px]">Filtres</div>
              {activeCount>0 && <button onClick={reset} className="text-[12px] text-terre underline underline-offset-2">Réinitialiser</button>}
            </div>
            <FiltersBody f={f} set={setF}/>
          </div>
        </aside>

        {/* Results */}
        <div>
          {view.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-ink/20 p-8 md:p-14 text-center">
              <div className="font-display text-[28px] md:text-[36px] leading-tight max-w-xl mx-auto">
                Aucun circuit ne correspond. <em className="text-terre">Et si on vous en composait un sur mesure&nbsp;?</em>
              </div>
              <p className="text-ink-600 mt-3 max-w-md mx-auto">Décrivez ce que vous cherchez, on revient avec un itinéraire en 24h.</p>
              <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                <Btn onClick={()=>go('custom')} variant="terre" icon={<Icons.ArrowRight size={16}/>}>Composer mon voyage</Btn>
                <Btn variant="outline" onClick={reset}>Effacer les filtres</Btn>
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
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre-300 mb-3">— Sur mesure</div>
              <h3 className="font-display text-[28px] md:text-[40px] leading-tight">
                Vous ne trouvez pas <em>votre Sénégal</em> dans cette liste&nbsp;?
              </h3>
              <p className="text-sand-200 mt-3 max-w-xl">Dites-nous ce que vous cherchez — durée, envies, budget. On revient avec un itinéraire en 24h.</p>
            </div>
            <div className="flex md:justify-end">
              <Btn onClick={()=>go('custom')} variant="terre" size="lg" icon={<Icons.ArrowRight size={18}/>}>Composer mon voyage</Btn>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      <div className={`md:hidden fixed inset-0 z-50 ${drawerOpen ? '' : 'pointer-events-none'}`}>
        <div onClick={()=>setDrawerOpen(false)} className={`absolute inset-0 bg-ink/40 transition-opacity ${drawerOpen?'opacity-100':'opacity-0'}`}/>
        <div className={`absolute inset-x-0 bottom-0 max-h-[88vh] bg-sand-50 rounded-t-3xl transition-transform duration-300 ${drawerOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex items-center justify-between p-5 border-b border-ink/5">
            <div className="font-display text-[22px]">Filtres</div>
            <button onClick={()=>setDrawerOpen(false)} className="h-10 w-10 rounded-full hover:bg-ink/5 inline-flex items-center justify-center"><Icons.Close size={20}/></button>
          </div>
          <div className="px-5 pb-3 overflow-y-auto" style={{maxHeight:'calc(88vh - 140px)'}}>
            <FiltersBody f={f} set={setF}/>
          </div>
          <div className="p-4 border-t border-ink/10 bg-sand-50 flex items-center gap-3">
            <Btn variant="outline" className="flex-1" onClick={reset}>Réinitialiser</Btn>
            <Btn variant="primary" className="flex-1" onClick={()=>setDrawerOpen(false)}>Voir {list.length} circuit{list.length>1?'s':''}</Btn>
          </div>
        </div>
      </div>

      <Footer go={go}/>
    </main>
  );
};

Object.assign(window, { Catalog });

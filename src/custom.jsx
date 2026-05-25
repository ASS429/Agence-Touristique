// Voyage sur mesure — multi-step guided form with suggestions before contact step.

const STEPS = [
  { id:'duration', label:'Durée'         },
  { id:'interests', label:'Envies'       },
  { id:'pace',     label:'Rythme'        },
  { id:'travelers',label:'Voyageurs'     },
  { id:'suggest',  label:'Suggestions'   },
  { id:'contact',  label:'Vos infos'     },
];

const DURATION_CARDS = [
  { id:'1d',  label:'Une journée',    desc:'Excursion depuis Dakar', days:1 },
  { id:'we',  label:'Week-end',       desc:'2 à 3 jours',            days:3 },
  { id:'5j',  label:'5 jours',        desc:'Circuit court',          days:5 },
  { id:'7j',  label:'7 jours',        desc:'Semaine complète',       days:7 },
  { id:'10j', label:'10 jours',       desc:'Tour plus large',        days:10 },
  { id:'+10', label:'Plus de 10j',    desc:'Voyage approfondi',      days:14 },
];

const INTEREST_OPTIONS = [
  { id:'culture',   label:'Culture & Histoire', I:'Compass' },
  { id:'nature',    label:'Nature & Animaux',   I:'Leaf' },
  { id:'plages',    label:'Plages',             I:'Wave' },
  { id:'aventure',  label:'Aventure & Sport',   I:'Sparkle' },
  { id:'gastro',    label:'Gastronomie',        I:'Heart' },
  { id:'communaut', label:'Communautaire',      I:'Users' },
  { id:'famille',   label:'Famille',            I:'Users' },
  { id:'luxe',      label:'Luxe',               I:'Star' },
  { id:'budget',    label:'Petit budget',       I:'Wallet' },
];

const PACE_OPTIONS = [
  { id:'doux',    label:'Tranquille',  desc:'Une étape par jour, beaucoup de pauses', tone:'sand' },
  { id:'normal',  label:'Équilibré',   desc:'Le bon compromis entre découverte et repos', tone:'ocre' },
  { id:'intense', label:'Intense',     desc:'On voit le maximum, on dort court', tone:'terre' },
];

// --- Stepper visual ---------------------------------------------------------
const Stepper = ({ stepIdx }) => (
  <div className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar">
    {STEPS.map((s, i) => {
      const state = i < stepIdx ? 'done' : i === stepIdx ? 'current' : 'todo';
      return (
        <React.Fragment key={s.id}>
          <div className={`flex items-center gap-2 shrink-0 ${state==='current'?'text-ink':'text-ink-500'}`}>
            <span className={`h-7 w-7 rounded-full inline-flex items-center justify-center text-[11px] font-mono ${
              state==='done' ? 'bg-terre text-sand-50' :
              state==='current' ? 'bg-ink text-sand-50' :
              'bg-sand-100 text-ink-500'
            }`}>{state==='done' ? <Icons.Check size={12}/> : i+1}</span>
            <span className={`text-[12.5px] font-medium hidden md:inline ${state==='current'?'':'opacity-60'}`}>{s.label}</span>
          </div>
          {i<STEPS.length-1 && <div className={`h-px w-6 md:w-10 ${i<stepIdx?'bg-terre':'bg-ink/15'}`}/>}
        </React.Fragment>
      );
    })}
  </div>
);

// --- Step screens -----------------------------------------------------------
const StepDuration = ({ value, onChange }) => (
  <div>
    <h2 className="font-display text-[34px] md:text-[52px] leading-[1.02]">Combien de <em>temps</em> avez-vous&nbsp;?</h2>
    <p className="mt-3 text-ink-600 max-w-xl">Une simple indication — on affinera ensemble.</p>
    <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
      {DURATION_CARDS.map(d => (
        <button key={d.id} onClick={()=>onChange(d.id)}
          className={`p-5 md:p-6 rounded-3xl border-2 text-left transition-all ${value===d.id ? 'border-terre bg-terre/5' : 'border-ink/10 hover:border-ink/30 bg-sand-50'}`}>
          <div className="font-display text-[26px] md:text-[30px] leading-none">{d.label}</div>
          <div className="text-[13px] text-ink-600 mt-2">{d.desc}</div>
          {value===d.id && <div className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-mono uppercase tracking-wider text-terre"><Icons.Check size={12}/>sélectionné</div>}
        </button>
      ))}
    </div>
  </div>
);

const StepInterests = ({ value, onChange }) => {
  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter(v=>v!==id));
    else if (value.length < 3) onChange([...value, id]);
  };
  return (
    <div>
      <h2 className="font-display text-[34px] md:text-[52px] leading-[1.02]">Qu’est-ce qui vous <em>tire ici</em>&nbsp;?</h2>
      <p className="mt-3 text-ink-600 max-w-xl">Jusqu’à 3 envies — on construit autour.</p>
      <div className="mt-3 text-[12px] font-mono uppercase tracking-[0.18em] text-ink-500">{value.length} / 3 sélectionnés</div>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        {INTEREST_OPTIONS.map(opt => {
          const active = value.includes(opt.id);
          const disabled = !active && value.length >= 3;
          const I = Icons[opt.I] || Icons.Sparkle;
          return (
            <button key={opt.id} disabled={disabled} onClick={()=>toggle(opt.id)}
              className={`p-4 md:p-5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                active ? 'border-terre bg-terre/5 text-ink' :
                disabled ? 'border-ink/10 bg-sand-50 opacity-40 cursor-not-allowed' :
                'border-ink/10 hover:border-ink/30 bg-sand-50'
              }`}>
              <div className={`h-10 w-10 rounded-full inline-flex items-center justify-center shrink-0 ${active ? 'bg-terre text-sand-50' : 'bg-sand-100 text-ink'}`}>
                <I size={18}/>
              </div>
              <div className="font-medium text-[14px]">{opt.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const StepPace = ({ value, onChange }) => (
  <div>
    <h2 className="font-display text-[34px] md:text-[52px] leading-[1.02]">À quelle <em>cadence</em>&nbsp;?</h2>
    <p className="mt-3 text-ink-600 max-w-xl">Le rythme change tout — on respecte le vôtre.</p>
    <div className="mt-8 grid md:grid-cols-3 gap-4 md:gap-5">
      {PACE_OPTIONS.map(p => (
        <button key={p.id} onClick={()=>onChange(p.id)}
          className={`relative rounded-3xl overflow-hidden border-2 text-left transition-all ${value===p.id ? 'border-terre' : 'border-transparent hover:border-ink/15'}`}>
          <Photo tone={p.tone} mood="horizon" showLabel={false} ratio="aspect-[5/4]" rounded=""/>
          <div className="p-5 bg-sand-50">
            <div className="font-display text-[26px] leading-none">{p.label}</div>
            <div className="text-[13px] text-ink-600 mt-2 leading-relaxed">{p.desc}</div>
          </div>
          {value===p.id && (
            <div className="absolute top-3 right-3 h-9 w-9 rounded-full bg-terre text-sand-50 inline-flex items-center justify-center"><Icons.Check size={16}/></div>
          )}
        </button>
      ))}
    </div>
  </div>
);

const StepTravelers = ({ value, onChange }) => {
  const set = (k, v) => onChange({ ...value, [k]: v });
  const Counter = ({ k, label, hint }) => (
    <div className="flex items-center justify-between border border-ink/10 rounded-2xl p-4 bg-sand-50">
      <div>
        <div className="font-medium text-[15px]">{label}</div>
        <div className="text-[12.5px] text-ink-500">{hint}</div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={()=>set(k, Math.max(0, value[k]-1))} className="h-9 w-9 rounded-full border border-ink/15 inline-flex items-center justify-center hover:border-ink/40"><Icons.ArrowLeft size={14}/></button>
        <div className="font-display text-[24px] w-7 text-center">{value[k]}</div>
        <button onClick={()=>set(k, value[k]+1)} className="h-9 w-9 rounded-full border border-ink/15 inline-flex items-center justify-center hover:border-ink/40"><Icons.Plus size={14}/></button>
      </div>
    </div>
  );
  return (
    <div>
      <h2 className="font-display text-[34px] md:text-[52px] leading-[1.02]">Vous êtes <em>combien</em>&nbsp;?</h2>
      <p className="mt-3 text-ink-600 max-w-xl">Et quelle fourchette de budget par personne — toujours indicative.</p>
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <Counter k="adults"   label="Adultes"  hint="13 ans et +"/>
        <Counter k="children" label="Enfants"  hint="3 à 12 ans"/>
      </div>
      <div className="mt-6">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-500 mb-3">Budget / pers — XOF</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v:'low',  label:'< 400k',     desc:'économique' },
            { v:'mid',  label:'400k – 800k',desc:'confort'    },
            { v:'high', label:'> 800k',     desc:'premium'    },
          ].map(opt => (
            <button key={opt.v} onClick={()=>set('budget', opt.v)}
              className={`p-4 rounded-2xl border text-left ${value.budget===opt.v ? 'bg-ink text-sand-50 border-ink' : 'border-ink/15 hover:border-ink/40'}`}>
              <div className="font-display text-[20px] leading-none">{opt.label}</div>
              <div className={`text-[12px] mt-1 ${value.budget===opt.v?'text-sand-200':'text-ink-600'}`}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const StepSuggest = ({ form, onPick, onSkip }) => {
  // Pick 3 circuits matching duration band and interest types
  const sel = DURATION_CARDS.find(d=>d.id===form.duration);
  const tgtDays = sel ? sel.days : 5;
  const types   = form.interests.map(id => ({
    culture:'culture', nature:'nature', plages:'plage', aventure:'aventure',
    famille:'famille', gastro:'culture', communaut:'culture', luxe:'culture', budget:'culture'
  }[id])).filter(Boolean);
  const score = (c) => {
    let s = 0;
    s -= Math.abs(c.days - tgtDays) * 2;
    s += types.filter(t => c.types.includes(t)).length * 5;
    if (form.travelers.budget==='low'  && c.tier==='eco')     s += 4;
    if (form.travelers.budget==='mid'  && c.tier==='confort') s += 4;
    if (form.travelers.budget==='high' && c.tier==='premium') s += 4;
    return s;
  };
  const ranked = CIRCUITS.slice().sort((a,b)=>score(b)-score(a)).slice(0,3);

  return (
    <div>
      <h2 className="font-display text-[34px] md:text-[52px] leading-[1.02]">Trois <em>itinéraires</em> qui vous ressemblent.</h2>
      <p className="mt-3 text-ink-600 max-w-2xl">Sélectionnés depuis notre catalogue selon vos choix. Pas convaincu·e&nbsp;? Direction <em>vrai sur mesure</em> juste en dessous.</p>

      <div className="mt-8 grid md:grid-cols-3 gap-5">
        {ranked.map(c => (
          <article key={c.id} className="flex flex-col bg-sand-50 rounded-3xl overflow-hidden border border-ink/5">
            <Photo tone={c.tone} mood={c.mood} label={`${c.days}j`} ratio="aspect-[5/4]" rounded="" src={c.img} alt={c.title}/>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-display text-[22px] leading-tight">{c.title}</h3>
              <div className="text-[13px] text-ink-600 mt-0.5">{c.subtitle}</div>
              <ul className="mt-3 space-y-1 text-[12.5px] text-ink-600">
                {c.destIds.slice(0,3).map(id => {
                  const dest = DESTINATIONS.find(d=>d.id===id);
                  return dest ? <li key={id} className="flex items-center gap-1.5"><Icons.MapPin size={11} className="text-terre"/>{dest.name}</li> : null;
                })}
              </ul>
              <div className="mt-auto pt-4 flex items-end justify-between">
                <div>
                  <div className="text-[10.5px] font-mono uppercase tracking-wider text-ink-500">à partir de</div>
                  <Price xof={c.priceXOF} className="font-display text-[20px] leading-none"/>
                </div>
              </div>
              <Btn variant="terre" size="md" className="mt-4 w-full" onClick={()=>onPick(c)}>C’est celui-là, contactez-moi</Btn>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-sand-100 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-display text-[22px] md:text-[26px] leading-tight">Aucun ne me convient,<br className="md:hidden"/> je veux du <em className="text-terre">vrai sur mesure</em>.</div>
          <p className="text-[14px] text-ink-600 mt-2 max-w-xl">On part d’une page blanche — vous nous décrivez, on construit.</p>
        </div>
        <Btn variant="primary" size="lg" onClick={onSkip} icon={<Icons.ArrowRight size={16}/>}>Décrire mon voyage</Btn>
      </div>
    </div>
  );
};

const StepContact = ({ form, set, picked, freeForm }) => (
  <div>
    <h2 className="font-display text-[34px] md:text-[52px] leading-[1.02]">Pour vous <em>recontacter</em>.</h2>
    <p className="mt-3 text-ink-600 max-w-xl">Réponse en moins de 24h ouvrées, avec un premier carnet de voyage.</p>
    {picked && (
      <div className="mt-5 inline-flex items-center gap-3 bg-sand-100 rounded-2xl p-4">
        <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0">
          <Photo tone={picked.tone} mood={picked.mood} showLabel={false} rounded="" className="h-full w-full" src={picked.img} alt={picked.title}/>
        </div>
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-terre">Itinéraire choisi</div>
          <div className="font-medium text-[14px]">{picked.title}</div>
        </div>
      </div>
    )}

    <div className="mt-8 grid md:grid-cols-2 gap-4">
      <Field label="Prénom et nom" value={form.name} onChange={(v)=>set('name', v)}/>
      <Field label="Email" type="email" value={form.email} onChange={(v)=>set('email', v)}/>
      <Field label="WhatsApp (avec indicatif)" placeholder="+33 6 12 …" value={form.phone} onChange={(v)=>set('phone', v)}/>
      <Field label="Dates approximatives" placeholder="ex. avril 2026" value={form.dates} onChange={(v)=>set('dates', v)}/>
    </div>
    <div className="mt-4">
      <label className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-500 block mb-1.5">{freeForm ? 'Décrivez votre voyage rêvé' : 'Message libre (facultatif)'}</label>
      <textarea value={form.message} onChange={(e)=>set('message', e.target.value)}
        rows={freeForm ? 8 : 4} placeholder={freeForm ? 'Durée, envies, rythme, voyageurs, particularités…' : 'Une attention particulière, une question…'}
        className="w-full rounded-2xl border border-ink/15 bg-sand-50 p-4 text-[14px] outline-none focus:border-terre"/>
    </div>
  </div>
);

const Field = ({ label, value, onChange, type='text', placeholder }) => (
  <div>
    <label className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-500 block mb-1.5">{label}</label>
    <input type={type} value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-12 rounded-full border border-ink/15 bg-sand-50 px-4 text-[14px] outline-none focus:border-terre"/>
  </div>
);

// --- Page wrapper -----------------------------------------------------------
const Custom = ({ go, onOpenTour }) => {
  const [stepIdx, setStepIdx] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [freeForm, setFreeForm] = React.useState(false);
  const [picked, setPicked] = React.useState(null);
  const [form, setForm] = React.useState({
    duration:null,
    interests:[],
    pace:null,
    travelers:{ adults:2, children:0, budget:null },
    name:'', email:'', phone:'', dates:'', message:''
  });
  const update = (patch) => setForm(prev => ({ ...prev, ...patch }));
  const setField = (k, v) => setForm(prev => ({...prev, [k]: v }));
  const step = STEPS[stepIdx];

  const next = () => setStepIdx(i => Math.min(STEPS.length-1, i+1));
  const prev = () => setStepIdx(i => Math.max(0, i-1));

  const handleSuggestPick = (c) => { setPicked(c); setFreeForm(false); setStepIdx(STEPS.length-1); };
  const handleSuggestSkip = () => { setPicked(null); setFreeForm(true); setStepIdx(STEPS.length-1); };

  if (submitted) return <CustomConfirm form={form} picked={picked} go={go} onOpenTour={onOpenTour}/>;

  return (
    <main className="bg-sand-50">
      <PageHero kicker="Sur mesure" tone="ocre" mood="dunes" bgImg={IMG('Désert de Lompoul', 5)} compact
        title={<>Composons votre voyage <em>idéal</em>.</>}
        intro="Une dizaine de questions, 3 minutes. À la fin, on revient avec un itinéraire qui vous ressemble."/>

      <section className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="mb-10 md:mb-14">
          <Stepper stepIdx={stepIdx}/>
        </div>

        <div className="bg-sand-100/40 rounded-3xl p-6 md:p-10 border border-ink/5">
          {step.id==='duration'  && <StepDuration  value={form.duration}  onChange={(v)=>setField('duration', v)}/>}
          {step.id==='interests' && <StepInterests value={form.interests} onChange={(v)=>setField('interests', v)}/>}
          {step.id==='pace'      && <StepPace      value={form.pace}      onChange={(v)=>setField('pace', v)}/>}
          {step.id==='travelers' && <StepTravelers value={form.travelers} onChange={(v)=>setField('travelers', v)}/>}
          {step.id==='suggest'   && <StepSuggest   form={form} onPick={handleSuggestPick} onSkip={handleSuggestSkip}/>}
          {step.id==='contact'   && <StepContact   form={form} set={setField} picked={picked} freeForm={freeForm}/>}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Btn variant="ghost" onClick={prev} icon={<Icons.ArrowLeft size={14}/>} className="!gap-2 flex-row-reverse"
               style={stepIdx===0 ? { visibility:'hidden' } : null}>
            Précédent
          </Btn>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">{stepIdx+1} sur {STEPS.length}</div>
          {step.id !== 'contact' && step.id !== 'suggest' && (
            <Btn variant="primary" size="md" onClick={next} icon={<Icons.ArrowRight size={14}/>}>Suivant</Btn>
          )}
          {step.id === 'suggest' && (
            <span className="text-[11px] text-ink-500"></span>
          )}
          {step.id === 'contact' && (
            <Btn variant="terre" size="md" onClick={()=>setSubmitted(true)} icon={<Icons.ArrowRight size={14}/>}>Envoyer ma demande</Btn>
          )}
        </div>
      </section>

      <Footer go={go}/>
    </main>
  );
};

// --- Confirmation -----------------------------------------------------------
const CustomConfirm = ({ form, picked, go, onOpenTour }) => {
  const suggestions = CIRCUITS.slice(0,3);
  const waMsg = `Bonjour Téranga ! Je viens de remplir le formulaire sur mesure (${form.name || 'demande'}). Pouvons-nous échanger ?`;
  return (
    <main className="bg-sand-50">
      <section className="relative pt-32 md:pt-44 pb-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-terre/10 to-sand-50"/>
        <div className="relative max-w-3xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-terre text-sand-50 mb-6">
            <Icons.Check size={28}/>
          </div>
          <h1 className="font-display text-[40px] md:text-[64px] leading-[1.02]">
            Demande <em>bien reçue</em>{form.name ? `, ${form.name.split(' ')[0]}` : ''}.
          </h1>
          <p className="mt-5 text-ink-600 max-w-xl mx-auto text-[15.5px] md:text-[17px] leading-relaxed">
            On vous écrit sous <strong className="text-ink">24h ouvrées</strong> avec un premier carnet de voyage personnalisé — durée, étapes, hébergements, budget détaillé. À très vite.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Btn as="a" href={buildWaURL(waMsg)} target="_blank" rel="noreferrer"
                 variant="wa" size="lg" icon={<Icons.Whatsapp size={18}/>}>Discuter maintenant</Btn>
            <Btn onClick={()=>go('home')} variant="outline" size="lg">Retour à l’accueil</Btn>
          </div>
        </div>
      </section>

      <Section label="En attendant" title={<>Quelques circuits qui pourraient vous <em>plaire</em>.</>}
               className="pb-20 md:pb-28">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {suggestions.map(c => <CircuitCard key={c.id} c={c} onOpen={onOpenTour} size="sm"/>)}
        </div>
      </Section>

      <Footer go={go}/>
    </main>
  );
};

Object.assign(window, { Custom });

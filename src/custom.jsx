import React from 'react';
import { useI18n } from './i18n.jsx';
import { Icons } from './icons.jsx';
import { Photo } from './photo.jsx';
import { Btn, CircuitCard, Footer, PageHero, Price, Section, buildWaURL, SITE } from './shared.jsx';
import { CIRCUITS, DESTINATIONS, IMG } from './data.jsx';
// Voyage sur mesure — multi-step guided form with suggestions before contact step.
// Les libellés affichés sont résolus côté JSX via t() avec fallback FR.
// Les data lists ne portent que l'id + la logique métier (days, tone, icône).

const STEPS = [
  { id:'duration',  fallback:'Durée'         },
  { id:'interests', fallback:'Envies'        },
  { id:'pace',      fallback:'Rythme'        },
  { id:'travelers', fallback:'Voyageurs'     },
  { id:'suggest',   fallback:'Suggestions'   },
  { id:'contact',   fallback:'Vos infos'     },
];

const DURATION_CARDS = [
  { id:'1d',  days:1  },
  { id:'we',  days:3  },
  { id:'5j',  days:5  },
  { id:'7j',  days:7  },
  { id:'10j', days:10 },
  { id:'+10', days:14 },
];

const INTEREST_OPTIONS = [
  { id:'culture',   I:'Compass' },
  { id:'nature',    I:'Leaf'    },
  { id:'plages',    I:'Wave'    },
  { id:'aventure',  I:'Sparkle' },
  { id:'gastro',    I:'Heart'   },
  { id:'communaut', I:'Users'   },
  { id:'famille',   I:'Users'   },
  { id:'luxe',      I:'Star'    },
  { id:'budget',    I:'Wallet'  },
];

const PACE_OPTIONS = [
  { id:'doux',    tone:'sand'  },
  { id:'normal',  tone:'ocre'  },
  { id:'intense', tone:'terre' },
];

// --- Stepper visual ---------------------------------------------------------
const Stepper = ({ stepIdx }) => {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar">
      {STEPS.map((s, i) => {
        const state = i < stepIdx ? 'done' : i === stepIdx ? 'current' : 'todo';
        return (
          <React.Fragment key={s.id}>
            <div className={`flex items-center gap-2 shrink-0 ${state==='current'?'text-ink':'text-ink-500'}`}>
              <span className={`h-7 w-7 rounded-full inline-flex items-center justify-center text-[11px] font-mono ${
                state==='done' ? 'bg-terre-600 text-sand-50' :
                state==='current' ? 'bg-ink text-sand-50' :
                'bg-sand-100 text-ink-500'
              }`}>{state==='done' ? <Icons.Check size={12}/> : i+1}</span>
              <span className={`text-[12.5px] font-medium hidden md:inline ${state==='current'?'':'opacity-60'}`}>
                {t(`custom.step.${s.id}`, s.fallback)}
              </span>
            </div>
            {i<STEPS.length-1 && <div className={`h-px w-6 md:w-10 ${i<stepIdx?'bg-terre-600':'bg-ink/15'}`}/>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// --- Step screens -----------------------------------------------------------
const StepDuration = ({ value, onChange }) => {
  const { t, richT } = useI18n();
  return (
    <div>
      <h2 className="font-display text-[34px] md:text-[52px] leading-[1.02]">{richT(t('custom.s1.title'))}</h2>
      <p className="mt-3 text-ink-600 max-w-xl">{t('custom.s1.intro')}</p>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {DURATION_CARDS.map(d => (
          <button key={d.id} onClick={()=>onChange(d.id)}
            className={`p-5 md:p-6 rounded-3xl border-2 text-left transition-all ${value===d.id ? 'border-terre bg-terre/5' : 'border-ink/10 hover:border-ink/30 bg-sand-50'}`}>
            <div className="font-display text-[26px] md:text-[30px] leading-none">{t(`custom.duration.${d.id}.label`)}</div>
            <div className="text-[13px] text-ink-600 mt-2">{t(`custom.duration.${d.id}.desc`)}</div>
            {value===d.id && <div className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-mono uppercase tracking-wider text-terre"><Icons.Check size={12}/>{t('custom.s1.selected')}</div>}
          </button>
        ))}
      </div>
    </div>
  );
};

const StepInterests = ({ value, onChange }) => {
  const { t, richT } = useI18n();
  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter(v=>v!==id));
    else if (value.length < 3) onChange([...value, id]);
  };
  return (
    <div>
      <h2 className="font-display text-[34px] md:text-[52px] leading-[1.02]">{richT(t('custom.s2.title'))}</h2>
      <p className="mt-3 text-ink-600 max-w-xl">{t('custom.s2.intro')}</p>
      <div className="mt-3 text-[12px] font-mono uppercase tracking-[0.18em] text-ink-500">{t('custom.s2.counter').replace('{n}', value.length)}</div>
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
              <div className={`h-10 w-10 rounded-full inline-flex items-center justify-center shrink-0 ${active ? 'bg-terre-600 text-sand-50' : 'bg-sand-100 text-ink'}`}>
                <I size={18}/>
              </div>
              <div className="font-medium text-[14px]">{t(`custom.interest.${opt.id}`)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const StepPace = ({ value, onChange }) => {
  const { t, richT } = useI18n();
  return (
    <div>
      <h2 className="font-display text-[34px] md:text-[52px] leading-[1.02]">{richT(t('custom.s3.title'))}</h2>
      <p className="mt-3 text-ink-600 max-w-xl">{t('custom.s3.intro')}</p>
      <div className="mt-8 grid md:grid-cols-3 gap-4 md:gap-5">
        {PACE_OPTIONS.map(p => (
          <button key={p.id} onClick={()=>onChange(p.id)}
            className={`relative rounded-3xl overflow-hidden border-2 text-left transition-all ${value===p.id ? 'border-terre' : 'border-transparent hover:border-ink/15'}`}>
            <Photo tone={p.tone} mood="horizon" showLabel={false} ratio="aspect-[5/4]" rounded=""/>
            <div className="p-5 bg-sand-50">
              <div className="font-display text-[26px] leading-none">{t(`custom.pace.${p.id}.label`)}</div>
              <div className="text-[13px] text-ink-600 mt-2 leading-relaxed">{t(`custom.pace.${p.id}.desc`)}</div>
            </div>
            {value===p.id && (
              <div className="absolute top-3 right-3 h-9 w-9 rounded-full bg-terre-600 text-sand-50 inline-flex items-center justify-center"><Icons.Check size={16}/></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const StepTravelers = ({ value, onChange }) => {
  const { t, richT } = useI18n();
  const set = (k, v) => onChange({ ...value, [k]: v });
  const Counter = ({ k, label, hint }) => (
    <div className="flex items-center justify-between border border-ink/10 rounded-2xl p-4 bg-sand-50">
      <div>
        <div className="font-medium text-[15px]">{label}</div>
        <div className="text-[12.5px] text-ink-500">{hint}</div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={()=>set(k, Math.max(0, value[k]-1))} aria-label="−" className="h-9 w-9 rounded-full border border-ink/15 inline-flex items-center justify-center hover:border-ink/40"><Icons.ArrowLeft size={14}/></button>
        <div className="font-display text-[24px] w-7 text-center">{value[k]}</div>
        <button onClick={()=>set(k, value[k]+1)} aria-label="+" className="h-9 w-9 rounded-full border border-ink/15 inline-flex items-center justify-center hover:border-ink/40"><Icons.Plus size={14}/></button>
      </div>
    </div>
  );
  const budgetOpts = [
    { v:'low',  labelKey:'custom.s4.budgetLow.label',  descKey:'custom.s4.budgetLow.desc'  },
    { v:'mid',  labelKey:'custom.s4.budgetMid.label',  descKey:'custom.s4.budgetMid.desc'  },
    { v:'high', labelKey:'custom.s4.budgetHigh.label', descKey:'custom.s4.budgetHigh.desc' },
  ];
  return (
    <div>
      <h2 className="font-display text-[34px] md:text-[52px] leading-[1.02]">{richT(t('custom.s4.title'))}</h2>
      <p className="mt-3 text-ink-600 max-w-xl">{t('custom.s4.intro')}</p>
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <Counter k="adults"   label={t('custom.s4.adults')}   hint={t('custom.s4.adultsHint')}/>
        <Counter k="children" label={t('custom.s4.children')} hint={t('custom.s4.childrenHint')}/>
      </div>
      <div className="mt-6">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-500 mb-3">{t('custom.s4.budgetLabel')}</div>
        <div className="grid grid-cols-3 gap-2">
          {budgetOpts.map(opt => (
            <button key={opt.v} onClick={()=>set('budget', opt.v)}
              className={`p-4 rounded-2xl border text-left ${value.budget===opt.v ? 'bg-ink text-sand-50 border-ink' : 'border-ink/15 hover:border-ink/40'}`}>
              <div className="font-display text-[20px] leading-none">{t(opt.labelKey)}</div>
              <div className={`text-[12px] mt-1 ${value.budget===opt.v?'text-sand-200':'text-ink-600'}`}>{t(opt.descKey)}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const StepSuggest = ({ form, onPick, onSkip }) => {
  const { t, richT } = useI18n();
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
      <h2 className="font-display text-[34px] md:text-[52px] leading-[1.02]">{richT(t('custom.s5.title'))}</h2>
      <p className="mt-3 text-ink-600 max-w-2xl">{richT(t('custom.s5.intro'))}</p>

      <div className="mt-8 grid md:grid-cols-3 gap-5">
        {ranked.map(c => {
          const title    = t(`circuit.${c.id}.title`,    c.title);
          const subtitle = t(`circuit.${c.id}.subtitle`, c.subtitle);
          return (
            <article key={c.id} className="flex flex-col bg-sand-50 rounded-3xl overflow-hidden border border-ink/5">
              <Photo tone={c.tone} mood={c.mood} label={`${c.days}j`} ratio="aspect-[5/4]" rounded="" src={c.img} alt={title}/>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-display text-[22px] leading-tight">{title}</h3>
                <div className="text-[13px] text-ink-600 mt-0.5">{subtitle}</div>
                <ul className="mt-3 space-y-1 text-[12.5px] text-ink-600">
                  {c.destIds.slice(0,3).map(id => {
                    const dest = DESTINATIONS.find(d=>d.id===id);
                    return dest ? <li key={id} className="flex items-center gap-1.5"><Icons.MapPin size={11} className="text-terre"/>{t(`destination.${dest.id}.name`, dest.name)}</li> : null;
                  })}
                </ul>
                <div className="mt-auto pt-4 flex items-end justify-between">
                  <div>
                    <div className="text-[10.5px] font-mono uppercase tracking-wider text-ink-500">{t('common.from')}</div>
                    <Price xof={c.priceXOF} className="font-display text-[20px] leading-none"/>
                  </div>
                </div>
                <Btn variant="terre" size="md" className="mt-4 w-full" onClick={()=>onPick(c)}>{t('custom.s5.pickCTA')}</Btn>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-10 rounded-3xl bg-sand-100 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-display text-[22px] md:text-[26px] leading-tight">{richT(t('custom.s5.blank.title'), { emClassName: 'text-terre' })}</div>
          <p className="text-[14px] text-ink-600 mt-2 max-w-xl">{t('custom.s5.blank.intro')}</p>
        </div>
        <Btn variant="primary" size="lg" onClick={onSkip} icon={<Icons.ArrowRight size={16}/>}>{t('custom.s5.blank.cta')}</Btn>
      </div>
    </div>
  );
};

const StepContact = ({ form, set, picked, freeForm }) => {
  const { t, richT } = useI18n();
  const pickedTitle = picked ? t(`circuit.${picked.id}.title`, picked.title) : '';
  return (
    <div>
      <h2 className="font-display text-[34px] md:text-[52px] leading-[1.02]">{richT(t('custom.s6.title'))}</h2>
      <p className="mt-3 text-ink-600 max-w-xl">{t('custom.s6.intro')}</p>
      {picked && (
        <div className="mt-5 inline-flex items-center gap-3 bg-sand-100 rounded-2xl p-4">
          <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0">
            <Photo tone={picked.tone} mood={picked.mood} showLabel={false} rounded="" className="h-full w-full" src={picked.img} alt={pickedTitle}/>
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-terre">{t('custom.s6.pickedLabel')}</div>
            <div className="font-medium text-[14px]">{pickedTitle}</div>
          </div>
        </div>
      )}

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <Field label={t('custom.s6.field.name')}  value={form.name}  onChange={(v)=>set('name', v)}/>
        <Field label={t('custom.s6.field.email')} type="email" value={form.email} onChange={(v)=>set('email', v)}/>
        <Field label={t('custom.s6.field.phone')} placeholder={t('custom.s6.field.phonePlaceholder')} value={form.phone} onChange={(v)=>set('phone', v)}/>
        <Field label={t('custom.s6.field.dates')} placeholder={t('custom.s6.field.datesPlaceholder')} value={form.dates} onChange={(v)=>set('dates', v)}/>
      </div>
      <div className="mt-4">
        <label className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-500 block mb-1.5">{freeForm ? t('custom.s6.message.free') : t('custom.s6.message.normal')}</label>
        <textarea value={form.message} onChange={(e)=>set('message', e.target.value)}
          rows={freeForm ? 8 : 4} placeholder={freeForm ? t('custom.s6.messagePlaceholder.free') : t('custom.s6.messagePlaceholder.normal')}
          className="w-full rounded-2xl border border-ink/15 bg-sand-50 p-4 text-[14px] outline-none focus:border-terre"/>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type='text', placeholder }) => (
  <div>
    <label className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-500 block mb-1.5">{label}</label>
    <input type={type} value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-12 rounded-full border border-ink/15 bg-sand-50 px-4 text-[14px] outline-none focus:border-terre"/>
  </div>
);

// --- Page wrapper -----------------------------------------------------------
const Custom = ({ go, onOpenTour }) => {
  const { t, richT, lang } = useI18n();
  const [stepIdx, setStepIdx] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [freeForm, setFreeForm] = React.useState(false);
  const [picked, setPicked] = React.useState(null);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({
    duration:null,
    interests:[],
    pace:null,
    travelers:{ adults:2, children:0, budget:null },
    name:'', email:'', phone:'', dates:'', message:''
  });
  const setField = (k, v) => setForm(prev => ({...prev, [k]: v }));
  const [hp, setHp] = React.useState('');            // honeypot anti-bot
  const startedAt = React.useRef(Date.now());        // timing anti-bot
  const step = STEPS[stepIdx];

  // Validation par étape : l'utilisateur ne peut pas avancer tant que la
  // donnée demandée n'est pas renseignée. Le bouton est juste désactivé.
  const isStepValid = () => {
    switch (step.id) {
      case 'duration':  return !!form.duration;
      case 'interests': return form.interests.length > 0;
      case 'pace':      return !!form.pace;
      case 'travelers': return form.travelers.adults > 0 && !!form.travelers.budget;
      case 'suggest':   return true;  // l'étape se valide par un clic sur une carte ou "page blanche"
      case 'contact':   return !!(form.name && /.+@.+\..+/.test(form.email));
      default:          return true;
    }
  };
  const canAdvance = isStepValid();

  const next = () => { if (canAdvance) setStepIdx(i => Math.min(STEPS.length-1, i+1)); };
  const prev = () => setStepIdx(i => Math.max(0, i-1));

  const handleSuggestPick = (c) => { setPicked(c); setFreeForm(false); setStepIdx(STEPS.length-1); };
  const handleSuggestSkip = () => { setPicked(null); setFreeForm(true); setStepIdx(STEPS.length-1); };

  // Construit un payload lisible côté Formspree / mailto.
  const buildPayload = () => {
    const dur = DURATION_CARDS.find(d => d.id === form.duration);
    const pace = PACE_OPTIONS.find(p => p.id === form.pace);
    const interests = form.interests
      .map(id => INTEREST_OPTIONS.find(o => o.id === id)?.label)
      .filter(Boolean).join(', ');
    const budget = ({ low:'< 400 000 FCFA / pers', mid:'400 000 – 800 000 FCFA / pers', high:'> 800 000 FCFA / pers' })[form.travelers.budget] || '—';
    return {
      _subject:        `Demande sur mesure — ${form.name || 'Visiteur'}`,
      source:          'formulaire-sur-mesure',
      nom:             form.name,
      email:           form.email,
      whatsapp:        form.phone,
      dates_souhaitees:form.dates,
      duree:           dur ? dur.label : '—',
      centres_interet: interests || '—',
      rythme:          pace ? pace.label : '—',
      voyageurs:       `${form.travelers.adults} adulte(s), ${form.travelers.children} enfant(s)`,
      budget,
      circuit_choisi:  picked ? `${picked.title} (${picked.id})` : (freeForm ? 'Vrai sur mesure (page blanche)' : '—'),
      message:         form.message || '—',
    };
  };

  // mailto: toujours dispo en secours, prérempli avec tous les champs.
  const mailtoHref = () => {
    const p = buildPayload();
    const body = Object.entries(p)
      .filter(([k]) => !k.startsWith('_'))
      .map(([k,v]) => `${k.replace(/_/g,' ').replace(/^./, c => c.toUpperCase())} : ${v}`)
      .join('\n');
    return `mailto:${SITE.email}?subject=${encodeURIComponent(p._subject)}&body=${encodeURIComponent(body)}`;
  };

  // Enregistrement Supabase — capture toutes les demandes sur mesure dans
  // le tableau de bord admin, indépendamment du succès de Formspree/mailto.
  // Fire-and-forget : n'attend pas la réponse.
  const saveToSupabase = () => {
    const dur = DURATION_CARDS.find(d => d.id === form.duration);
    const pace = PACE_OPTIONS.find(p => p.id === form.pace);
    const budgetMap = { low:'< 400 000 FCFA / pers', mid:'400 000 – 800 000 FCFA / pers', high:'> 800 000 FCFA / pers' };
    return window.actSaveContactRequest?.({
      kind: 'custom',
      full_name: form.name || null,
      email: form.email || null,
      phone: form.phone || null,
      language: lang,
      circuit_slug: picked ? picked.id : null,
      travelers: (form.travelers.adults || 0) + (form.travelers.children || 0) || null,
      budget: budgetMap[form.travelers.budget] || null,
      message: form.message || null,
      extra: {
        source: 'formulaire-sur-mesure',
        duration_id: form.duration,
        duration_days: dur?.days || null,
        interests: form.interests,
        pace: form.pace,
        pace_tone: pace?.tone || null,
        travelers_detail: { adults: form.travelers.adults, children: form.travelers.children },
        dates_wanted: form.dates || null,
        circuit_picked_id: picked?.id || null,
        circuit_picked_title: picked?.title || null,
        free_form: freeForm
      }
    }).catch(() => {});
  };

  const submit = async () => {
    setError('');
    // Anti-bot : honeypot rempli ou soumission trop rapide → succès simulé.
    if (window.actIsLikelyBot?.(hp, startedAt.current)) { setSubmitted(true); return; }
    const payload = buildPayload();
    // Enregistrement Supabase (fire-and-forget)
    saveToSupabase();
    // Tracking analytics — déclenché quoi qu'il arrive ensuite.
    (window.dataLayer = window.dataLayer || []).push({
      event:           'custom_quote_submitted',
      duration:        payload.duree,
      budget:          payload.budget,
      circuit_picked:  payload.circuit_choisi,
      travelers:       payload.voyageurs,
    });
    // Formspree désactivé : demande en base + email Resend vers ACT.
    // Confirmation sans ouvrir la messagerie (mailto reste en secours manuel).
    if (!SITE.formspree) {
      setSubmitted(true);
      return;
    }
    setSending(true);
    try {
      const r = await fetch(SITE.formspree, {
        method: 'POST',
        headers: { 'Accept':'application/json', 'Content-Type':'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error('HTTP '+r.status);
      setSubmitted(true);
    } catch (err) {
      setError("Envoi impossible pour l’instant. Ouvrez votre messagerie pour ne pas perdre la demande.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) return <CustomConfirm form={form} picked={picked} go={go} onOpenTour={onOpenTour}/>;

  return (
    <main className="bg-sand-50">
      <PageHero kicker={t('page.custom.kicker')} tone="ocre" mood="dunes" bgImg={IMG('Désert de Lompoul', 5)} compact
        title={richT(t('page.custom.title'))}
        intro={t('page.custom.intro')}/>

      <section className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">
        {/* Honeypot anti-bot : invisible et hors tabulation */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off"
               value={hp} onChange={(e)=>setHp(e.target.value)} aria-hidden="true"
               style={{ position:'absolute', left:'-9999px', width:1, height:1, opacity:0 }}/>
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

        {error && (
          <div className="mt-4 rounded-2xl bg-terre/10 border border-terre/30 px-4 py-3 text-[13px] text-terre-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Btn variant="ghost" onClick={prev} icon={<Icons.ArrowLeft size={14}/>} className="!gap-2 flex-row-reverse"
               style={stepIdx===0 ? { visibility:'hidden' } : null}>
            {t('custom.nav.prev')}
          </Btn>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            {t('custom.nav.stepOf').replace('{i}', stepIdx+1).replace('{n}', STEPS.length)}
          </div>

          {step.id !== 'contact' && step.id !== 'suggest' && (
            <Btn variant="primary" size="md" onClick={next} disabled={!canAdvance}
                 icon={<Icons.ArrowRight size={14}/>}
                 className={canAdvance ? '' : 'opacity-40 cursor-not-allowed'}>{t('custom.nav.next')}</Btn>
          )}
          {step.id === 'suggest' && (
            <span className="text-[11px] text-ink-500">{t('custom.nav.pickAbove')}</span>
          )}
          {step.id === 'contact' && (
            <div className="flex items-center gap-2">
              <Btn as="a" href={mailtoHref()} variant="outline" size="md" icon={<Icons.Mail size={14}/>}>
                {t('custom.nav.mail')}
              </Btn>
              <Btn variant="terre" size="md" onClick={submit} disabled={!canAdvance || sending}
                   className={(!canAdvance || sending) ? 'opacity-60 cursor-not-allowed' : ''}
                   icon={<Icons.ArrowRight size={14}/>}>
                {sending ? t('custom.nav.sending') : t('custom.nav.submit')}
              </Btn>
            </div>
          )}
        </div>

        {step.id === 'contact' && !canAdvance && (
          <p className="mt-3 text-right text-[12px] text-ink-500">{t('custom.nav.requirement')}</p>
        )}
      </section>

      <Footer go={go}/>
    </main>
  );
};

// --- Confirmation -----------------------------------------------------------
const CustomConfirm = ({ form, picked, go, onOpenTour }) => {
  const { t, richT } = useI18n();
  const suggestions = CIRCUITS.slice(0,3);
  const firstName = form.name ? form.name.split(' ')[0] : '';
  const waMsg = t('custom.wa.followup').replace('{name}', form.name || 'demande');
  // Compose the confirmation body : remplacer {strong}...{/strong} par un <strong>.
  const renderBody = () => {
    const raw = t('custom.confirm.body');
    const re = /\{strong\}([\s\S]*?)\{\/strong\}/;
    const m = raw.match(re);
    if (!m) return raw;
    const before = raw.slice(0, m.index);
    const after  = raw.slice(m.index + m[0].length);
    return <>{before}<strong className="text-ink">{m[1]}</strong>{after}</>;
  };
  return (
    <main className="bg-sand-50">
      <section className="relative pt-32 md:pt-44 pb-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-terre/10 to-sand-50"/>
        <div className="relative max-w-3xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-terre-600 text-sand-50 mb-6">
            <Icons.Check size={28}/>
          </div>
          <h1 className="font-display text-[40px] md:text-[64px] leading-[1.02]">
            {richT(t('custom.confirm.title').replace('{name}', firstName ? `, ${firstName}` : ''))}
          </h1>
          <p className="mt-5 text-ink-600 max-w-xl mx-auto text-[15.5px] md:text-[17px] leading-relaxed">
            {renderBody()}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Btn as="a" href={buildWaURL(waMsg)} target="_blank" rel="noreferrer"
                 variant="wa" size="lg" icon={<Icons.Whatsapp size={18}/>}>{t('custom.confirm.chat')}</Btn>
            <Btn onClick={()=>go('home')} variant="outline" size="lg">{t('custom.confirm.back')}</Btn>
          </div>
        </div>
      </section>

      <Section label={t('custom.confirm.waiting')} title={richT(t('custom.confirm.suggestionsTitle'))}
               className="pb-20 md:pb-28">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {suggestions.map(c => <CircuitCard key={c.id} c={c} onOpen={onOpenTour} size="sm"/>)}
        </div>
      </Section>

      <Footer go={go}/>
    </main>
  );
};

if (typeof window !== 'undefined') Object.assign(window, { Custom });
export { Custom };

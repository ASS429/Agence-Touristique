// Tour detail — fiche circuit type "Gorée · Lac Rose · Saloum"

const TourGallery = ({ gallery }) => {
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
        <div className="fixed inset-0 z-50 bg-ink/95 flex items-center justify-center p-4" onClick={()=>setLb(null)} role="dialog" aria-modal="true" aria-label="Galerie photo">
          <button onClick={()=>setLb(null)} aria-label="Fermer la galerie" className="absolute top-5 right-5 h-12 w-12 rounded-full bg-sand-50/10 text-sand-50 inline-flex items-center justify-center hover:bg-sand-50/20"><Icons.Close size={22}/></button>
          <button onClick={(e)=>{e.stopPropagation(); setLb((lb - 1 + gallery.length) % gallery.length);}} aria-label="Photo précédente" className="absolute left-3 md:left-8 h-12 w-12 rounded-full bg-sand-50/10 text-sand-50 inline-flex items-center justify-center hover:bg-sand-50/20"><Icons.ArrowLeft size={22}/></button>
          <button onClick={(e)=>{e.stopPropagation(); setLb((lb + 1) % gallery.length);}} aria-label="Photo suivante" className="absolute right-3 md:right-8 h-12 w-12 rounded-full bg-sand-50/10 text-sand-50 inline-flex items-center justify-center hover:bg-sand-50/20"><Icons.ArrowRight size={22}/></button>
          <div className="w-full max-w-4xl aspect-[4/3]" onClick={(e)=>e.stopPropagation()}>
            <Photo tone={gallery[lb].tone} mood={gallery[lb].mood} label={gallery[lb].label} rounded="rounded-2xl" className="h-full w-full" src={gallery[lb].img} alt={gallery[lb].label}/>
          </div>
        </div>
      )}
    </>
  );
};

const TourMap = () => {
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
        {/* Labels */}
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
            <text x={s.x + 8} y={s.y + 4} fontFamily="JetBrains Mono" fontSize="7" fill="#5A5142" letterSpacing="1">JOUR {i===0?1:i===1?2:i===2?3:4}</text>
          </g>
        ))}
      </svg>
      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-sand-50/95 backdrop-blur rounded-xl p-3 text-[11px] font-mono uppercase tracking-wider text-ink-700 flex items-center gap-3">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-terre"/>étape</span>
        <span className="flex items-center gap-1.5"><span className="h-px w-4 bg-terre" style={{borderTop:'1px dashed #C8593B'}}/>itinéraire</span>
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

const Tour = ({ onBack, onOpenTour, go, tourId = 'goree-lac-saloum' }) => {
  // Lookup the picked circuit from the catalog; merge with the full detail
  // (which acts as the canonical "fiche type" content for any circuit shown
  // in this prototype). Title, subtitle, price, badges follow the catalog
  // entry so the page reflects whatever circuit the user clicked.
  const cat = CIRCUITS.find(c => c.id === tourId) || CIRCUITS[0];
  const isCanonical = tourId === CIRCUIT_DETAIL.id;
  const d = {
    ...CIRCUIT_DETAIL,
    id: cat.id,
    title: cat.title,
    subtitle: isCanonical ? CIRCUIT_DETAIL.subtitle : `${cat.days} jours · ${cat.nights} nuits · au départ de Dakar`,
    rating: cat.rating,
    reviews: cat.reviews,
    badges: cat.badges?.length ? cat.badges : CIRCUIT_DETAIL.badges,
    priceXOF: cat.priceXOF,
    gallery: isCanonical ? CIRCUIT_DETAIL.gallery : [
      { tone: cat.tone, mood: cat.mood, label: cat.title.toLowerCase(), img: cat.img },
      ...CIRCUIT_DETAIL.gallery.slice(1),
    ],
  };
  const waMsg = `Bonjour ACT ! Je suis intéressé·e par le circuit "${d.title}". Pouvez-vous me confirmer les disponibilités ?`;

  return (
    <main className="bg-sand-50" data-screen-label={`Tour Detail · ${d.title}`}>
      {/* Breadcrumb */}
      <div className="pt-24 md:pt-28 pb-3 max-w-[1280px] mx-auto px-4 md:px-8 flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-[0.16em] text-ink-500">
        <button onClick={onBack} className="hover:text-terre">Accueil</button>
        <Icons.ChevronRight size={12}/>
        <button onClick={()=>go('circuits')} className="hover:text-terre">Circuits</button>
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
            <span className="inline-flex items-center gap-1.5"><StarRow value={d.rating} size={14}/><span className="text-ink font-medium">{d.rating}</span><span>· {d.reviews} avis</span></span>
            <span className="inline-flex items-center gap-1.5"><Icons.Calendar size={14}/> {d.days[0].title.includes('Arrivée') ? '5 jours / 4 nuits' : '5j / 4n'}</span>
            <span className="inline-flex items-center gap-1.5"><Icons.MapPin size={14}/> Dakar → Saloum</span>
            <span className="inline-flex items-center gap-1.5"><Icons.Users size={14}/> 2 à 8 voyageurs</span>
          </div>
          <p className="mt-7 max-w-2xl text-[16px] md:text-[17px] text-ink-700 leading-relaxed">
            Cinq jours pour rencontrer trois Sénégal distincts : l’île-mémoire de Gorée, le lac qui rosit au soleil, et les bolongs du delta du Saloum traversés en pirogue. Construit autour de pauses, de bons repas, et de gens qu’on connaît depuis longtemps.
          </p>
        </div>

        {/* Sticky price (desktop) */}
        <aside className="md:sticky md:top-28 self-start hidden md:block">
          <div className="rounded-3xl border border-ink/10 bg-sand-50 p-6 shadow-xl shadow-ink/5">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink-500">À partir de · / pers</div>
            <Price xof={d.priceXOF} className="font-display text-[44px] leading-none mt-1 block"/>
            <div className="text-[13px] text-ink-500 mt-1.5">base 2 voyageurs</div>

            <div className="mt-5 space-y-2.5">
              <Btn as="a" href={buildWaURL(waMsg)} target="_blank" rel="noreferrer"
                   variant="wa" size="lg" className="w-full" icon={<Icons.Whatsapp size={18}/>}>
                Réserver sur WhatsApp
              </Btn>
              <Btn variant="outline" size="lg" className="w-full" icon={<Icons.Mail size={16}/>}>
                Demander un devis
              </Btn>
            </div>

            <div className="mt-5 p-3.5 rounded-2xl bg-sand-100/80 border border-ink/5">
              <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink-500 mb-1.5">Message WhatsApp pré-rempli</div>
              <div className="text-[12.5px] text-ink-700 leading-relaxed font-mono">
                "{waMsg}"
              </div>
            </div>

            <ul className="mt-5 space-y-2.5 text-[13px] text-ink-700">
              <li className="flex items-center gap-2"><Icons.Shield size={14} className="text-atlantique"/>Annulation gratuite · 21j avant</li>
              <li className="flex items-center gap-2"><Icons.Wallet size={14} className="text-atlantique"/>Acompte 30% · Wave / OM / Carte</li>
              <li className="flex items-center gap-2"><Icons.RefreshCw size={14} className="text-atlantique"/>Report sans frais à 7j</li>
            </ul>
          </div>
        </aside>
      </section>

      {/* Programme */}
      <Section id="programme" label="Programme" title={<>Jour par <em>jour</em>.</>}
               className="py-16 md:py-24 bg-sand-100" container={true}>
        <div className="relative">
          <div className="absolute left-[27px] md:left-[35px] top-2 bottom-2 w-px bg-ink/15"/>
          <ol className="space-y-8 md:space-y-12">
            {d.days.map((day, i) => (
              <li key={i} className="grid grid-cols-[56px,1fr] md:grid-cols-[72px,1fr] gap-4 md:gap-8 relative">
                <div className="relative">
                  <div className="h-14 w-14 md:h-[72px] md:w-[72px] rounded-full bg-ink text-sand-50 inline-flex flex-col items-center justify-center border-4 border-sand-100">
                    <div className="font-mono text-[9px] uppercase tracking-wider opacity-60">jour</div>
                    <div className="font-display text-[24px] md:text-[30px] leading-none">{day.n}</div>
                  </div>
                </div>
                <div className="grid md:grid-cols-[1fr,1.1fr] gap-5 md:gap-8 items-center bg-sand-50 rounded-3xl p-5 md:p-7">
                  <div>
                    <h3 className="font-display text-[26px] md:text-[34px] leading-tight">{day.title}</h3>
                    <p className="mt-3 text-[14.5px] text-ink-600 leading-relaxed">{day.short}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Pill tone="sand"><Icons.Clock size={11}/> Journée</Pill>
                      <Pill tone="sand"><Icons.Users size={11}/> Guide local</Pill>
                    </div>
                  </div>
                  <Photo tone={day.tone} mood={day.mood} label={`Jour ${day.n}`} ratio="aspect-[5/3]" rounded="rounded-2xl" src={day.img} alt={day.title}/>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Inclus / Non inclus */}
      <Section id="inclus" label="Ce qui est compris" title={<>Inclus & <em>non inclus</em>.</>}
               className="py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          <div className="bg-atlantique-100/60 rounded-3xl p-6 md:p-8 border border-atlantique/10">
            <div className="flex items-center gap-2 mb-4 text-atlantique">
              <Icons.Check size={20}/> <span className="font-mono text-[11px] uppercase tracking-[0.2em]">Inclus</span>
            </div>
            <ul className="space-y-3">
              {d.includes.map((t,i)=>(
                <li key={i} className="flex items-start gap-3 text-[14.5px] text-ink-800">
                  <span className="mt-1 h-5 w-5 shrink-0 rounded-full bg-atlantique/15 text-atlantique inline-flex items-center justify-center"><Icons.Check size={12}/></span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-sand-100 rounded-3xl p-6 md:p-8 border border-ink/5">
            <div className="flex items-center gap-2 mb-4 text-ink-500">
              <Icons.X size={20}/> <span className="font-mono text-[11px] uppercase tracking-[0.2em]">Non inclus</span>
            </div>
            <ul className="space-y-3">
              {d.excludes.map((t,i)=>(
                <li key={i} className="flex items-start gap-3 text-[14.5px] text-ink-700">
                  <span className="mt-1 h-5 w-5 shrink-0 rounded-full bg-ink/10 text-ink-500 inline-flex items-center justify-center"><Icons.X size={12}/></span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Infos pratiques + carte */}
      <Section id="infos" label="Infos pratiques" title={<>L’<em>essentiel</em> à savoir.</>}
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
            <p className="mt-3 text-[12.5px] font-mono text-ink-500">Itinéraire indicatif — adapté à votre rythme. Le delta peut être remplacé par Saint-Louis sur demande.</p>
          </div>
        </div>
      </Section>

      {/* Avis */}
      <Section id="avis-circuit" label="Ils ont fait ce circuit" title={<>Avis <em>vérifiés</em>.</>}
               kicker={`${d.rating} / 5 · ${d.reviews} évaluations`}
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
                    <div className="font-medium text-[14px]">{r.name}</div>
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
      <Section id="faq" label="Questions fréquentes" title={<>Tout ce que <em>vous voulez savoir</em>.</>}
               className="py-16 md:py-24 bg-sand-100">
        <div className="max-w-3xl">
          <Faq items={d.faqs}/>
        </div>
      </Section>

      {/* Circuits similaires */}
      <Section id="similar" label="À explorer aussi" title={<>D’autres <em>circuits</em>.</>}
               className="py-16 md:py-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {CIRCUITS.filter(c => c.id !== d.id).slice(0,3).map(c => (
            <button key={c.id} onClick={()=>{ onOpenTour(c.id); window.scrollTo({top:0}); }} className="group text-left flex flex-col">
              <Photo tone={c.tone} mood={c.mood} label={`${c.days}j`} ratio="aspect-[5/4]" className="mb-4 group-hover:scale-[1.01] transition-transform" src={c.img} alt={c.title}/>
              <div className="flex items-center gap-2 mb-1.5">
                <StarRow value={c.rating} size={12}/>
                <span className="text-[12px] text-ink-500">{c.rating}</span>
              </div>
              <h3 className="font-display text-[24px] leading-tight">{c.title}</h3>
              <div className="text-[13px] text-ink-600 mt-0.5">{c.subtitle}</div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <div className="text-[10.5px] text-ink-500 font-mono uppercase tracking-wider">à partir de</div>
                  <Price xof={c.priceXOF} className="font-display text-[20px] leading-none"/>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[13px] group-hover:text-terre">Voir <Icons.ArrowUpRight size={14}/></span>
              </div>
            </button>
          ))}
        </div>
      </Section>

      <Footer go={go}/>

      {/* Mobile sticky price bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-sand-50 border-t border-ink/10 px-4 py-3 flex items-center gap-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">à partir de</div>
          <Price xof={d.priceXOF} className="font-display text-[22px] leading-none truncate block"/>
        </div>
        <Btn as="a" href={buildWaURL(waMsg)} target="_blank" rel="noreferrer"
             variant="wa" size="md" className="shrink-0" icon={<Icons.Whatsapp size={16}/>}>
          Réserver
        </Btn>
      </div>
    </main>
  );
};

Object.assign(window, { Tour });

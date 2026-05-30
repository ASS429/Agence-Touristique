// Home page — uses shared CircuitCard, Price, and go() for in-app navigation.

const Hero = ({ go }) => {
  // Skip the hero video on slow / data-saver connections. The poster image
  // (Dakar/01.jpg) stays as fallback — critical for the 3G/4G context.
  const [showVideo, setShowVideo] = React.useState(false);
  React.useEffect(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) { setShowVideo(true); return; }
    const slow = conn.saveData || ['slow-2g','2g','3g'].includes(conn.effectiveType);
    setShowVideo(!slow);
  }, []);
  return (
  <section className="relative min-h-[100svh] flex flex-col" data-screen-label="01 Hero">
    <div className="absolute inset-0 bg-ink">
      {showVideo ? (
        // Haut débit : vidéo en autoplay. Pas de `poster` — le fond `bg-ink`
        // du parent sert de toile sombre pendant le buffering (≤ 1s en 4G).
        // `preload="auto"` raccourcit ce délai.
        <video
          autoPlay muted loop playsInline preload="auto"
          aria-label="Vidéo d'ambiance silencieuse — paysages du Sénégal"
          className="absolute inset-0 h-full w-full object-cover">
          <source src="vidéo/senegal.mp4" type="video/mp4"/>
          {/* Track vide : la vidéo n'a pas d'audio, donc pas de vraies
              captions à fournir. Le track sentinel évite le warning a11y. */}
          <track kind="captions" srcLang="fr" label="Aucun dialogue" default/>
        </video>
      ) : (
        // 2g/3g/saveData : photo statique stylisée à la place.
        <Photo tone="terre" mood="horizon" rounded="" showLabel={false} className="h-full w-full" src={IMG('Dakar', 1)} alt="Dakar, corniche"/>
      )}
      <div className="absolute inset-0" style={{background:'linear-gradient(180deg, rgba(26,22,18,0.65) 0%, rgba(26,22,18,0.35) 28%, rgba(26,22,18,0.45) 55%, rgba(26,22,18,0.88) 100%)'}}/>
      <div className="absolute inset-0" style={{background:'linear-gradient(90deg, rgba(26,22,18,0.55) 0%, rgba(26,22,18,0.15) 55%, rgba(26,22,18,0) 100%)'}}/>
    </div>

    <div className="relative flex-1 max-w-[1280px] w-full mx-auto px-4 md:px-8 pt-32 md:pt-44 pb-28 md:pb-32 flex flex-col justify-end"
         style={{ textShadow:'0 2px 18px rgba(0,0,0,0.45)' }}>
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 md:py-1.5 rounded-full bg-sand-50/15 backdrop-blur-md border border-sand-50/20 text-sand-50 text-[10px] md:text-[11px] uppercase tracking-[0.22em] font-mono mb-4 md:mb-6"
             style={{ textShadow:'none' }}>
          <span className="h-1.5 w-1.5 rounded-full bg-terre-300 animate-pulse"/> Saison 2026 ouverte
        </div>
        <h1 className="font-display text-[36px] sm:text-[56px] md:text-[88px] lg:text-[104px] leading-[1] md:leading-[0.95] text-sand-50"
            style={{ textShadow:'0 3px 24px rgba(0,0,0,0.55)' }}>
          Le Sénégal, <em className="text-terre-300">à la cadence</em>{' '}
          <span className="md:block">de ceux qui y vivent.</span>
        </h1>
        <p className="mt-4 md:mt-7 max-w-xl text-sand-50 text-[14.5px] md:text-[18px] leading-relaxed"
           style={{ textShadow:'0 2px 14px rgba(0,0,0,0.6)' }}>
          Circuits et escapades imaginés par des guides dakarois — de Gorée au pays Bassari, à hauteur d’humain<span className="hidden md:inline">. Sans cliché, sans pack froid, sans intermédiaire</span>.
        </p>
        <div className="mt-6 md:mt-9 flex flex-wrap items-center gap-3" style={{ textShadow:'none' }}>
          <Btn onClick={()=>go('circuits')} variant="terre" size="lg" icon={<Icons.ArrowRight size={18}/>}>
            Voir nos circuits
          </Btn>
          {/* Bouton WhatsApp masqué sur mobile : le bouton flottant en bas
              à droite remplit déjà ce rôle, c'est de la redondance. */}
          <Btn as="a" href={buildWaURL('Bonjour ACT ! Je voudrais organiser un voyage.')} target="_blank" rel="noreferrer"
               variant="wa" size="lg" icon={<Icons.Whatsapp size={18}/>}
               className="hidden sm:inline-flex">
            Réserver sur WhatsApp
          </Btn>
        </div>
      </div>

      <div className="mt-12 md:mt-16 grid grid-cols-3 md:grid-cols-4 rounded-2xl overflow-hidden border border-sand-50/15 bg-ink/30 backdrop-blur-md shadow-2xl shadow-ink/30"
           style={{ textShadow:'none' }}>
        {[
          { I:Icons.Clock,    k:'30+ ans', v:'depuis 1994' },
          { I:Icons.MapPin,   k:'6 pays',  v:'Afrique de l’Ouest' },
          { I:Icons.Star,     k:'4.9 / 5', v:'avis voyageurs' },
          { I:Icons.Whatsapp, k:'< 1h',    v:'réponse WhatsApp' },
        ].map((s,i)=>(
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
      <span className="font-mono text-[10px] uppercase tracking-[0.32em]" style={{ textShadow:'0 1px 6px rgba(0,0,0,0.6)' }}>défiler</span>
      <Icons.ChevronDown size={20} className="animate-bounce" style={{ filter:'drop-shadow(0 1px 4px rgba(0,0,0,0.5))' }}/>
    </div>
  </section>
  );
};

const Reassurance = () => {
  const items = [
    { I:Icons.Compass,  k:'Guides locaux', d:'Certifiés, francophones & anglophones — vos hôtes, pas des récitants.' },
    { I:Icons.Wallet,   k:'Wave · OM · Carte', d:'Paiement mobile sénégalais ou carte bancaire — acompte 30%, solde au départ.' },
    { I:Icons.RefreshCw,k:'Annulation flexible', d:'Annulation gratuite jusqu’à 21 jours avant. Report sans frais à 7 jours.' },
    { I:Icons.Star,     k:'4.9 / 5', d:'Sur 312 voyageurs, en 12 ans d’activité. On compte chaque avis.' },
  ];
  return (
    <section className="bg-sand-100 border-y border-ink/5" data-screen-label="02 Reassurance">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4">
        {items.map(({I,k,d}, i) => (
          <div key={i} className={`flex items-start gap-3 py-5 md:py-9
              ${i!==0 ? 'border-t md:border-t-0 md:border-l border-ink/10' : ''}
              md:pl-8 md:pr-4`}>
            <div className="h-10 w-10 rounded-full bg-terre/10 text-terre inline-flex items-center justify-center shrink-0"><I size={20}/></div>
            <div className="min-w-0">
              <div className="font-medium text-[14.5px] md:text-[15px] text-ink">{k}</div>
              <div className="text-[13px] md:text-[13px] text-ink-600 leading-relaxed mt-1">{d}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Destinations = ({ go }) => {
  const [filter, setFilter] = React.useState('Tous');
  const filters = ['Tous','culture','nature','aventure','patrimoine'];
  const list = filter === 'Tous' ? DESTINATIONS : DESTINATIONS.filter(d=>d.tag===filter);
  return (
    <Section id="destinations" label="Destinations" title={<>Huit lieux, <em>huit Sénégal.</em></>}
             kicker="L’agence couvre tout le pays — du cœur de Dakar aux frontières mandingues."
             intro="Chaque destination est travaillée avec des partenaires locaux : guides, hébergeurs, restaurateurs, artisans."
             className="py-20 md:py-28" screenLabel="03 Destinations">
      <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar">
        {filters.map(f => (
          <button key={f} onClick={()=>setFilter(f)}
            className={`shrink-0 px-4 h-9 rounded-full text-[12.5px] font-medium border transition-colors capitalize ${filter===f ? 'bg-ink text-sand-50 border-ink' : 'bg-transparent text-ink-700 border-ink/15 hover:border-ink/40'}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {list.map((d) => (
          <button key={d.id} onClick={()=>go('circuits')} className="group relative aspect-[3/4] block text-left">
            <Photo tone={d.tone} mood={d.mood} label={d.tag} overlay rounded="rounded-2xl" className="h-full" src={d.img} alt={d.name}/>
            <div className="absolute inset-x-3 bottom-3 text-sand-50">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div className="font-display text-[24px] md:text-[28px] leading-none">{d.name}</div>
                  <div className="text-[11.5px] mt-1.5 text-sand-200 flex items-center gap-1.5">
                    <Icons.MapPin size={11}/> {d.duration} de Dakar
                  </div>
                </div>
                <div className="h-9 w-9 rounded-full bg-sand-50 text-ink inline-flex items-center justify-center group-hover:bg-terre group-hover:text-sand-50 transition-colors">
                  <Icons.ArrowUpRight size={16}/>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Section>
  );
};

const Pourquoi = () => {
  const cols = [
    { num:'01', t:'Nos guides sont chez eux.',
      d:'Né·e·s ici, formé·e·s ici. Mamadou connaît les bolongs du Saloum depuis l’enfance, Awa raconte Gorée comme une histoire de famille — parce que ça l’est.' },
    { num:'02', t:'Un voyage, pas un produit.',
      d:'On ne vend pas des cases à cocher. On écoute, on ajuste, on retire ce qui n’a pas de sens. Un programme à 5h du matin, c’est non — sauf si vous voulez voir les pêcheurs partir.' },
    { num:'03', t:'L’argent du voyage reste ici.',
      d:'Hébergements en maisons d’hôtes, restaurateurs du quartier, artisanat direct producteur. 78 % de ce que vous payez reste dans l’économie sénégalaise.' },
  ];
  return (
    <Section id="pourquoi" label="Pourquoi nous" title={<>Pourquoi <em>choisir ACT</em>.</>}
             className="py-20 md:py-28" bg="bg-ink text-sand-50" dark
             intro="On ne fait pas le voyage le plus brillant. On fait celui dont on est fiers, dont nos partenaires sont fiers, et dont vous parlerez encore dans dix ans."
             screenLabel="04 Pourquoi">
      <div className="grid md:grid-cols-3 gap-10 md:gap-14">
        {cols.map((c,i)=>(
          <div key={i} className="relative">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre-300 mb-4">— {c.num}</div>
            <h3 className="font-display text-[28px] md:text-[34px] leading-tight mb-4">{c.t}</h3>
            <p className="text-sand-200 leading-relaxed">{c.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
};

const CircuitsMoment = ({ onOpenTour, go }) => {
  // Pick a curated 4 for the home spotlight
  const picks = ['goree-lac-saloum','casamance-essentielle','lompoul-saint-louis','kedougou-bassari']
    .map(id => CIRCUITS.find(c=>c.id===id)).filter(Boolean);
  return (
    <Section id="circuits-spot" label="Circuits du moment" title={<>À <em>faire bientôt</em>.</>}
             kicker="Quatre formats au choix — du week-end à la semaine longue."
             intro={<>Catalogue complet · <button onClick={()=>go('circuits')} className="underline underline-offset-4 hover:text-terre">14 circuits permanents →</button></>}
             className="py-20 md:py-28" screenLabel="05 Circuits du moment">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {picks.map(c => <CircuitCard key={c.id} c={c} onOpen={onOpenTour}/>)}
      </div>
    </Section>
  );
};

const RetourSources = ({ go }) => (
  <section id="diaspora" className="relative bg-ink text-sand-50 py-20 md:py-32 overflow-hidden" data-screen-label="06 Retour aux sources">
    <div className="absolute inset-0">
      <Photo tone="terre" mood="city" rounded="" showLabel={false} className="h-full w-full opacity-50" src={IMG('Ile de gorée', 6)} alt="Île de Gorée"/>
      <div className="absolute inset-0" style={{background:'linear-gradient(90deg, rgba(26,22,18,0.95) 0%, rgba(26,22,18,0.6) 100%)'}}/>
    </div>
    <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 grid md:grid-cols-[1.1fr,1fr] gap-12 items-center">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre-300 mb-4">— Diaspora</div>
        <h2 className="font-display text-[40px] sm:text-[52px] md:text-[68px] leading-[0.98]">
          Le retour aux <em>sources</em>,<br/>fait avec le cœur.
        </h2>
        <p className="mt-6 max-w-xl text-sand-200 text-[15.5px] leading-relaxed">
          Pour celles et ceux qui descendent de cette terre, Gorée n’est pas une étape. C’est un moment. On vous accompagne avec patience — vos questions, vos silences, votre rythme. Nos guides ont accueilli des familles entières en pèlerinage de mémoire.
        </p>
        <ul className="mt-7 space-y-3 text-[14.5px] text-sand-100">
          {[
            'Recherche généalogique avec partenaires locaux (sur demande)',
            'Cérémonie d’accueil traditionnelle en village',
            'Rencontres avec historien·ne·s & artistes',
            'Photographe sur tout le séjour'
          ].map((t,i)=>(
            <li key={i} className="flex items-start gap-3"><Icons.Check size={18} className="text-terre-300 mt-0.5 shrink-0"/>{t}</li>
          ))}
        </ul>
        <div className="mt-9">
          <Btn onClick={()=>go('circuits','diaspora')} variant="terre" size="lg" icon={<Icons.ArrowRight size={18}/>}>
            Découvrir nos circuits culturels
          </Btn>
        </div>
      </div>
      <div className="relative">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <Photo tone="terre" mood="city" label="Gorée — porte" ratio="aspect-[3/4]" className="row-span-2" src={IMG('Ile de gorée', 7)} alt="Île de Gorée"/>
          <Photo tone="dusk" mood="portrait" label="rencontre"   ratio="aspect-square" src={IMG('Dakar', 7)} alt="Rencontre à Dakar"/>
          <Photo tone="sand" mood="horizon" label="Saint-Louis"  ratio="aspect-square" src={IMG('Saint-Louis', 5)} alt="Saint-Louis"/>
        </div>
        {/* Quote card : statique sous les photos sur mobile (pas de chevauchement), absolue flottante sur desktop. */}
        <div className="static md:absolute md:-bottom-4 md:-left-4 lg:-left-8 mt-4 md:mt-0 max-w-full md:max-w-[300px] bg-sand-50 text-ink p-5 rounded-2xl shadow-2xl">
          <Icons.Quote size={18} className="text-terre mb-2"/>
          <p className="font-display text-[17px] leading-snug">"On a marché dans la Maison des Esclaves en silence. Mamadou n’a pas parlé. C’était parfait."</p>
          <div className="mt-3 text-[12px] text-ink-500 font-mono">— Aïssatou D., Brooklyn</div>
        </div>
      </div>
    </div>
  </section>
);

const PackDakar = () => (
  <Section id="dakar-pack" label="Pack étrangers" title={<>Dakar, <em>sans stress.</em></>}
           kicker="Pour un premier voyage en Afrique de l’Ouest — tout est pris en charge dès l’atterrissage."
           className="py-20 md:py-28 bg-sand-100" screenLabel="07 Pack Dakar">
    <div className="grid md:grid-cols-[1.1fr,1fr] gap-10 md:gap-16 items-start">
      <div>
        <ol className="space-y-5">
          {[
            { n:'01', t:'Accueil à l’aéroport AIBD', d:'Quelle que soit l’heure. Pancarte à votre nom, eau fraîche, SIM locale offerte.' },
            { n:'02', t:'Transfert privé climatisé', d:'1h vers Dakar. Chauffeur professionnel, paiement déjà réglé, zéro négociation.' },
            { n:'03', t:'Tour de Dakar guidé', d:'Médina, Almadies, Île N’Gor, marché HLM. Un guide qui adapte selon votre énergie.' },
            { n:'04', t:'Assistance WhatsApp 24/7', d:'Un numéro local toujours joignable — pour la moindre question, à n’importe quelle heure.' },
            { n:'05', t:'Retour à l’aéroport', d:'À l’heure, sans stress. On sait combien de temps prend Dakar le vendredi soir.' },
          ].map((s,i)=>(
            <li key={i} className="grid grid-cols-[40px,1fr] gap-4 md:gap-6 border-b border-ink/10 pb-5 last:border-0">
              <div className="font-mono text-terre text-[12px] tracking-[0.2em] pt-1.5">{s.n}</div>
              <div>
                <div className="font-display text-[22px] md:text-[26px] leading-tight">{s.t}</div>
                <div className="text-[14px] text-ink-600 leading-relaxed mt-1">{s.d}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="relative md:sticky md:top-28">
        <Photo tone="atlant" mood="city" label="Dakar / Almadies" ratio="aspect-[4/5]" rounded="rounded-3xl" className="shadow-xl" src={IMG('Dakar', 6)} alt="Dakar — Almadies"/>
        <div className="absolute -bottom-6 -right-3 md:-right-6 bg-sand-50 rounded-2xl p-5 shadow-xl border border-ink/5 w-[240px]">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink-500">À partir de</div>
          <Price xof={280000} className="font-display text-[30px] leading-none mt-1 block"/>
          <div className="text-[12px] text-ink-600 mt-1.5">3 jours / 2 nuits</div>
          <Btn as="a" href={buildWaURL('Bonjour, je suis intéressé·e par le pack Dakar sans stress.')} target="_blank" rel="noreferrer"
               variant="wa" size="sm" className="mt-4 w-full" icon={<Icons.Whatsapp size={14}/>}>Demander ce pack</Btn>
        </div>
      </div>
    </div>
  </Section>
);

const Temoignages = () => (
  <Section id="avis" label="Ils sont partis avec nous" title={<>Ce qu’ils en <em>retiennent</em>.</>}
           className="py-20 md:py-28" screenLabel="08 Témoignages">
    <div className="grid md:grid-cols-3 gap-5 md:gap-6">
      {TESTIMONIALS.map((t,i)=>(
        <figure key={i} className="bg-sand-100 rounded-3xl p-6 md:p-7 flex flex-col h-full">
          <Icons.Quote size={22} className="text-terre mb-3"/>
          <blockquote className="font-display text-[22px] md:text-[24px] leading-snug text-ink">"{t.text}"</blockquote>
          <div className="mt-auto pt-6 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden shrink-0">
              <Photo tone={t.tone} mood={t.mood} rounded="rounded-full" showLabel={false} className="h-12 w-12"/>
            </div>
            <div className="flex-1">
              <div className="font-medium text-[14px]">{t.name}</div>
              <div className="text-[12px] text-ink-500">{t.from} · <span className="text-ink-700">{t.circuit}</span></div>
            </div>
            <StarRow value={t.stars} size={12}/>
          </div>
        </figure>
      ))}
    </div>
  </Section>
);

const BlogTeaser = ({ go }) => {
  const picks = BLOG.slice(0, 3);
  return (
    <Section id="blog-spot" label="Conseils de voyage" title={<>Lire <em>avant de partir</em>.</>}
             kicker="Du blog ACT"
             intro={<><button onClick={()=>go('blog')} className="underline underline-offset-4 hover:text-terre">Voir tous les articles →</button></>}
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
                Lire l’article <Icons.ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform"/>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Section>
  );
};

const Insta = () => (
  <section className="py-20 md:py-24 overflow-hidden" data-screen-label="10 Instagram">
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-3">— Instagram</div>
        <h2 className="font-display text-[32px] md:text-[44px] leading-none">@actours_senegal</h2>
      </div>
      <a href="#" className="text-[14px] inline-flex items-center gap-1.5 hover:text-terre">Suivre <Icons.ArrowUpRight size={14}/></a>
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

const Home = ({ onOpenTour, go }) => (
  <main>
    <Hero go={go}/>
    <Reassurance/>
    <Destinations go={go}/>
    <Pourquoi/>
    <CircuitsMoment onOpenTour={onOpenTour} go={go}/>
    <RetourSources go={go}/>
    <PackDakar/>
    <Temoignages/>
    <BlogTeaser go={go}/>
    <Insta/>
    <Footer go={go}/>
  </main>
);

Object.assign(window, { Home });

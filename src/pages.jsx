// Contact + À propos + FAQ pages — grouped to keep file count tight.

// ============================================================================
// CONTACT
// ============================================================================
const Contact = ({ go }) => {
  const [form, setForm] = React.useState({ name:'', email:'', phone:'', subject:'devis', message:'' });
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // mailto: fallback (always available — opens the user's mail client with
  // the form pre-filled). Used when Formspree isn't configured or fails.
  const mailtoHref = () => {
    const subj = `[Site] ${form.subject || 'devis'} — ${form.name || 'Visiteur'}`;
    const body = [
      `Nom : ${form.name}`,
      `Email : ${form.email}`,
      `WhatsApp : ${form.phone}`,
      `Sujet : ${form.subject}`,
      ``,
      form.message,
    ].join('\n');
    return `mailto:${SITE.email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // No Formspree endpoint configured → open mail client directly.
    if (!SITE.formspree) {
      window.location.href = mailtoHref();
      setSent(true);
      return;
    }
    setSending(true);
    try {
      const r = await fetch(SITE.formspree, {
        method: 'POST',
        headers: { 'Accept':'application/json', 'Content-Type':'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      setSent(true);
    } catch (err) {
      setError("Envoi impossible pour l’instant. Ouvrez votre messagerie ?");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="bg-sand-50">
      <PageHero kicker="Contact" tone="dusk" mood="city" bgImg={IMG('Dakar', 8)} compact
        title={<>Parlons de <em>votre voyage</em>.</>}
        intro="Trois canaux, une équipe. WhatsApp répond toujours en moins d’une heure pendant nos horaires d’ouverture."/>

      {/* Three contact cards */}
      <section className="-mt-12 md:-mt-16 relative z-10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid sm:grid-cols-3 gap-4 md:gap-5">
          {[
            { I:Icons.Whatsapp, k:'WhatsApp', v:SITE.whatsappDisplay, cta:'Discuter maintenant', href:buildWaURL('Bonjour ACT !'), tone:'wa', accent:'bg-[#1FA855]' },
            { I:Icons.Phone, k:'Téléphone', v:SITE.phone, cta:'Lun–Sam · 9h–19h', href:`tel:+${SITE.whatsapp}`, tone:'primary', accent:'bg-ink' },
            { I:Icons.Mail,  k:'Email',    v:SITE.email, cta:'Écrire un email', href:`mailto:${SITE.email}`, tone:'primary', accent:'bg-terre' },
          ].map((c,i)=>(
            <a key={i} href={c.href} target="_blank" rel="noreferrer"
               className="group bg-sand-50 border border-ink/5 rounded-3xl p-6 shadow-xl shadow-ink/5 hover:-translate-y-0.5 transition-transform">
              <div className={`h-11 w-11 rounded-full ${c.accent} text-sand-50 inline-flex items-center justify-center`}><c.I size={20}/></div>
              <div className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-500">{c.k}</div>
              <div className="font-display text-[22px] leading-tight mt-1">{c.v}</div>
              <div className="mt-4 text-[13px] inline-flex items-center gap-1.5 group-hover:text-terre">{c.cta} <Icons.ArrowRight size={13}/></div>
            </a>
          ))}
        </div>
      </section>

      {/* Form + map */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 md:py-24 grid md:grid-cols-[1.2fr,1fr] gap-10 md:gap-16">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-3">— Formulaire</div>
          <h2 className="font-display text-[32px] md:text-[44px] leading-tight">Écrivez-nous.</h2>
          <p className="mt-3 text-ink-600 max-w-md">Réponse en moins de 24h ouvrées. Pour une urgence, préférez WhatsApp.</p>

          {sent ? (
            <div className="mt-8 rounded-3xl bg-terre/10 border border-terre/20 p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-terre text-sand-50 inline-flex items-center justify-center"><Icons.Check size={18}/></div>
                <div>
                  <div className="font-display text-[22px] leading-tight">Message envoyé.</div>
                  <div className="text-[13px] text-ink-600 mt-0.5">On revient vers vous très vite.</div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 grid md:grid-cols-2 gap-4">
              <ContactField label="Prénom et nom" value={form.name} onChange={(v)=>set('name', v)} required/>
              <ContactField label="Email" type="email" value={form.email} onChange={(v)=>set('email', v)} required/>
              <ContactField label="WhatsApp (facultatif)" value={form.phone} onChange={(v)=>set('phone', v)} placeholder="+33 6 …"/>
              <div>
                <label className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-500 block mb-1.5">Sujet</label>
                <select value={form.subject} onChange={(e)=>set('subject', e.target.value)}
                  className="w-full h-12 rounded-full border border-ink/15 bg-sand-50 px-4 text-[14px] outline-none focus:border-terre cursor-pointer">
                  <option value="devis">Demande de devis</option>
                  <option value="question">Question générale</option>
                  <option value="partenariat">Partenariat</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-500 block mb-1.5">Message</label>
                <textarea required rows={6} value={form.message} onChange={(e)=>set('message', e.target.value)}
                  placeholder="Dites-nous ce que vous avez en tête…"
                  className="w-full rounded-2xl border border-ink/15 bg-sand-50 p-4 text-[14px] outline-none focus:border-terre"/>
              </div>
              {error && (
                <div className="md:col-span-2 rounded-2xl bg-terre/10 border border-terre/30 px-4 py-3 text-[13px] text-terre-700">
                  {error}
                </div>
              )}
              <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4">
                <p className="text-[12px] text-ink-500 max-w-sm">En envoyant ce message, vous acceptez notre <a href="#/privacy" className="underline underline-offset-2 hover:text-terre">politique de confidentialité</a>.</p>
                <div className="flex items-center gap-3">
                  <Btn as="a" href={mailtoHref()} variant="outline" size="lg" icon={<Icons.Mail size={16}/>}>
                    Ouvrir mon mail
                  </Btn>
                  <Btn variant="terre" size="lg" as="button" type="submit" disabled={sending} icon={<Icons.ArrowRight size={16}/>}>
                    {sending ? 'Envoi…' : 'Envoyer'}
                  </Btn>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar — map + info */}
        <aside className="md:sticky md:top-28 self-start">
          <div className="rounded-3xl overflow-hidden border border-ink/5 shadow-xl shadow-ink/5">
            {/* Map placeholder */}
            <div className="relative aspect-[4/3]">
              <div className="absolute inset-0 bg-atlantique-100"/>
              <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full">
                <defs>
                  <pattern id="map-dots" width="6" height="6" patternUnits="userSpaceOnUse">
                    <circle cx="3" cy="3" r="0.6" fill="#1F5E5A" opacity="0.2"/>
                  </pattern>
                </defs>
                <rect width="400" height="300" fill="url(#map-dots)"/>
                <path d="M 60 40 Q 200 30 340 50 L 380 280 L 30 270 Z" fill="#F5ECDD" stroke="#1F5E5A" strokeOpacity=".4"/>
                <path d="M 30 270 L 380 280" stroke="#1F5E5A" strokeOpacity=".3" strokeWidth="1"/>
                {/* Streets */}
                <g stroke="#1F5E5A" strokeOpacity=".25" strokeWidth=".8" fill="none">
                  <path d="M 70 80 L 350 100"/>
                  <path d="M 80 140 L 320 150"/>
                  <path d="M 90 200 L 290 220"/>
                  <path d="M 150 60 L 180 250"/>
                  <path d="M 250 50 L 270 240"/>
                </g>
                <text x="60" y="50" fontFamily="JetBrains Mono" fontSize="9" fill="#1F5E5A" opacity=".6">océan</text>
                <text x="320" y="290" fontFamily="JetBrains Mono" fontSize="9" fill="#1F5E5A" opacity=".6" textAnchor="end">Dakar</text>
                {/* Pin */}
                <circle cx="200" cy="150" r="18" fill="#C8593B" opacity=".18"/>
                <circle cx="200" cy="150" r="9" fill="#C8593B"/>
                <circle cx="200" cy="150" r="3" fill="#FBF7F0"/>
              </svg>
              <div className="absolute top-3 left-3 bg-sand-50/95 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider">{SITE.addressShort}</div>
            </div>
            <div className="p-6">
              <div className="font-display text-[22px] leading-tight">Notre bureau</div>
              <div className="mt-3 text-[14px] text-ink-700 leading-relaxed">
                {SITE.address}<br/>Sénégal
              </div>
              <div className="mt-5 pt-5 border-t border-ink/10 grid grid-cols-2 gap-3 text-[12.5px]">
                <div>
                  <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-500">Horaires</div>
                  <div className="mt-0.5">Lun–Ven · 9h–18h</div>
                </div>
                <div>
                  <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-500">Depuis</div>
                  <div className="mt-0.5">1996</div>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2">
                {SITE.instagram && <a href={SITE.instagram} aria-label="Instagram" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full border border-ink/15 inline-flex items-center justify-center hover:bg-ink hover:text-sand-50 transition"><Icons.Instagram size={15}/></a>}
                <a href={SITE.facebook} aria-label="Facebook" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full border border-ink/15 inline-flex items-center justify-center hover:bg-ink hover:text-sand-50 transition"><Icons.Facebook size={15}/></a>
                <a href={SITE.twitter} aria-label="Twitter / X" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full border border-ink/15 inline-flex items-center justify-center hover:bg-ink hover:text-sand-50 transition"><Icons.Tiktok size={15}/></a>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <Footer go={go}/>
    </main>
  );
};

const ContactField = ({ label, value, onChange, type='text', placeholder, required }) => (
  <div>
    <label className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-500 block mb-1.5">
      {label}{required && <span className="text-terre"> *</span>}
    </label>
    <input type={type} required={required} value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-12 rounded-full border border-ink/15 bg-sand-50 px-4 text-[14px] outline-none focus:border-terre"/>
  </div>
);

// ============================================================================
// ABOUT
// ============================================================================
const About = ({ go }) => {
  return (
    <main className="bg-sand-50">
      <PageHero kicker="À propos" tone="terre" mood="portrait" bgImg={IMG('Saint-Louis', 6)}
        title={<>Tour-opérateur de Dakar, <em>depuis 1996</em>.</>}
        intro="Africa Connection Tours organise les voyages au Sénégal et en Afrique de l’Ouest depuis plus de trente ans. L’hospitalité — la téranga, en wolof — reste notre standard de service."/>

      {/* Timeline — depuis 1996 */}
      <section className="py-16 md:py-24 bg-sand-100/40 border-y border-ink/5">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-4">— Notre parcours</div>
          <h2 className="font-display text-[36px] md:text-[56px] leading-[1.02] mb-12 md:mb-16 max-w-3xl">
            De 1996 à aujourd'hui — <em>l'Afrique de l'Ouest, étape par étape</em>.
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-3 relative">
            {/* Ligne horizontale décorative en desktop */}
            <div aria-hidden="true" className="hidden md:block absolute top-7 left-[10%] right-[10%] h-px bg-terre/25"/>
            {[
              { y:'1996', t:'Fondation à Dakar', d:'Création le 19 août 1996 par des entrepreneurs sénégalais issus des grandes maisons du tourisme international (SA au capital de 20 M FCFA).' },
              { y:'2000s', t:'Réseau sous-régional', d:'Ouverture des bureaux correspondants en Gambie, Mali et Mauritanie.' },
              { y:'2011', t:'Reconnaissance ATA', d:'Salif Badiane préside le chapitre Sénégal de l\'Africa Travel Association.' },
              { y:'2010s', t:'Couverture continentale', d:'Extension du réseau en Guinée, Côte d\'Ivoire et Ghana — circuits intégrés multi-pays.' },
              { y:'2026', t:'Cap digital', d:'Nouvelle plateforme web pour la diaspora, le marché local et les voyageurs internationaux.' },
            ].map((step, i) => (
              <li key={i} className="relative flex md:block items-start gap-4">
                {/* Pastille année */}
                <div className="relative shrink-0 inline-flex items-center justify-center h-14 w-14 md:h-14 md:w-14 rounded-full bg-terre text-sand-50 font-mono text-[11px] md:text-[12px] font-semibold ring-4 ring-sand-50 shadow-md shadow-terre/30">
                  {step.y}
                </div>
                <div className="md:mt-5">
                  <div className="font-display text-[20px] md:text-[22px] leading-tight text-ink">{step.t}</div>
                  <p className="text-[13.5px] md:text-[14px] text-ink-600 leading-relaxed mt-1.5 max-w-[220px]">{step.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-[12.5px] text-ink-500 italic">
            32 ans d'expérience cumulés, présence dans 7 pays, équipe multilingue formée en Europe et aux États-Unis.
          </p>
        </div>
      </section>

      {/* Notre histoire */}
      <Section label="Notre histoire" title={<>Plus de trente ans, <em>une expertise sous-régionale</em>.</>}
               kicker="Salif Badiane · Directeur Général"
               className="py-20 md:py-28">
        <div className="grid md:grid-cols-[1.2fr,1fr] gap-10 md:gap-16 items-center">
          <div className="space-y-5 text-[16px] md:text-[17px] leading-relaxed text-ink-800 max-w-2xl">
            <p>Fondée le 19 août 1996 par des entrepreneurs sénégalais issus des grandes maisons du tourisme international, Africa Connection Tours s’est imposée comme l’un des tour-opérateurs réceptifs de référence à Dakar.</p>
            <p>Sous la direction de <strong>Salif Badiane</strong>, l’agence a élargi son réseau au-delà des frontières sénégalaises : des bureaux correspondants opèrent aujourd’hui en <em>Gambie, Mali, Guinée, Mauritanie, Côte d’Ivoire et Ghana</em> — permettant des circuits intégrés sur toute l’Afrique de l’Ouest.</p>
            <p>L’équipe — Sénégalaise, formée en Europe et aux États-Unis — accueille les voyageurs en six langues (français, anglais, italien, allemand, espagnol, japonais). Trente ans d’expérience cumulés, et toujours la même obsession : un voyage qui ressemble vraiment au pays.</p>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <Photo tone="terre" mood="portrait" label="Salif Badiane · DG" ratio="aspect-[3/4]"/>
              <div className="grid grid-rows-2 gap-3">
                <Photo tone="sand" mood="city" label="siège · 52 rue Félix Faure" ratio="aspect-square" src={IMG('Dakar', 6)} alt="Siège ACT, Dakar-Peytavin"/>
                <Photo tone="atlant" mood="water" label="bureau sous-régional" ratio="aspect-square" src={IMG('Delta du Saloum', 5)} alt="Réseau ouest-africain"/>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Valeurs */}
      <Section label="Nos valeurs" title={<>Quatre <em>piliers</em>.</>}
               className="py-20 md:py-24 bg-ink text-sand-50" dark>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {VALUES.map((v,i)=>{
            const I = Icons[v.I] || Icons.Compass;
            return (
              <div key={i} className="border-t border-sand-100/15 pt-6">
                <div className="h-12 w-12 rounded-full bg-terre/15 text-terre-300 inline-flex items-center justify-center mb-5"><I size={22}/></div>
                <div className="font-display text-[26px] leading-tight">{v.t}</div>
                <div className="text-sand-200 mt-2 leading-relaxed text-[14px]">{v.d}</div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* L'équipe */}
      <Section label="L’équipe" title={<>Les <em>visages</em> derrière chaque voyage.</>}
               kicker="Équipe permanente à Dakar + guides & partenaires sur tout le pays"
               className="py-20 md:py-28">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {TEAM.map((m,i) => (
            <article key={i} className="bg-sand-100 rounded-3xl overflow-hidden border border-ink/5">
              <Photo tone={m.tone} mood={m.mood} label={m.name.split(' ')[0].toLowerCase()} ratio="aspect-[5/4]" rounded=""/>
              <div className="p-5 md:p-6">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-terre">{m.role}</div>
                <div className="font-display text-[24px] leading-tight mt-1">{m.name}</div>
                <div className="text-[12.5px] text-ink-600 mt-2">{m.langs.join(' · ')}</div>
                <p className="mt-3.5 text-[14px] text-ink-800 leading-relaxed italic">"{m.quote}"</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Pourquoi nous + Tourisme responsable */}
      <Section label="Pourquoi ACT" title={<>Ce qui change <em>quand on choisit local</em>.</>}
               className="py-20 md:py-24 bg-sand-100">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          <div className="space-y-5 text-[15.5px] md:text-[16.5px] leading-relaxed text-ink-800 max-w-xl">
            <p>Choisir une agence locale n’est pas qu’un geste éthique — c’est aussi un voyage plus juste, plus fluide, plus vivant. Nos chauffeurs connaissent les routes ; nos cuisiniers savent à quelle heure le poisson arrive ; nos guides ont des amis dans chaque village qu’on traverse.</p>
            <p>Quand quelque chose ne va pas — un orage, un véhicule qui lâche, une étape qui ne vous parle plus — il y a toujours quelqu’un à 30 minutes pour aider. <em>C’est ça, voyager avec des locaux.</em></p>
          </div>
          <div className="rounded-3xl bg-terre/8 border border-terre/15 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3 text-terre">
              <Icons.Leaf size={18}/> <span className="font-mono text-[11px] uppercase tracking-[0.22em]">Tourisme responsable</span>
            </div>
            <ul className="space-y-3 text-[14.5px] text-ink-800">
              <li className="flex items-start gap-3"><Icons.Check size={16} className="text-terre mt-0.5"/>78 % du chiffre reste dans l’économie sénégalaise</li>
              <li className="flex items-start gap-3"><Icons.Check size={16} className="text-terre mt-0.5"/>Guides salariés, contrats locaux conformes</li>
              <li className="flex items-start gap-3"><Icons.Check size={16} className="text-terre mt-0.5"/>Eau filtrée — zéro bouteille plastique</li>
              <li className="flex items-start gap-3"><Icons.Check size={16} className="text-terre mt-0.5"/>Code de respect des communautés visitées</li>
              <li className="flex items-start gap-3"><Icons.Check size={16} className="text-terre mt-0.5"/>Partenariats avec Sénégal Solidaire & Nebeday</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Partenaires — mur de logos sobre, monospace, lignes décoratives */}
      <Section label="Nos partenaires"
               title={<>Ils nous <em>font confiance</em>.</>}
               kicker="Hébergeurs, transporteurs, opérateurs paiement, associations locales — l’écosystème qui rend les voyages possibles."
               className="py-16 md:py-24">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 border-t border-l border-ink/10">
          {PARTNERS.map((p,i)=>(
            <div key={i}
                 className="group relative aspect-[5/2] border-r border-b border-ink/10 flex items-center justify-center px-5 transition-colors hover:bg-sand-100">
              <span className="absolute top-3 left-3 font-mono text-[9px] uppercase tracking-[0.22em] text-ink-400">{String(i+1).padStart(2,'0')}</span>
              <div className="font-mono text-[11px] md:text-[12px] uppercase tracking-[0.18em] text-ink-700 group-hover:text-terre text-center leading-tight">
                {p}
              </div>
              <span className="absolute bottom-3 right-3 h-px w-6 bg-ink/15 group-hover:bg-terre transition-colors"/>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[12.5px] text-ink-500 font-mono">— Les logos seront ajoutés à la livraison finale.</p>
      </Section>

      {/* Chiffres */}
      <section className="py-20 md:py-24 bg-ink text-sand-50">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {FIGURES.map((f,i)=>(
            <div key={i} className={`${i<FIGURES.length-1?'sm:border-r border-sand-100/15':''} sm:pr-8`}>
              <div className="font-display text-[44px] md:text-[64px] leading-none text-sand-50">{f.k}</div>
              <div className="text-[13px] md:text-[14px] text-sand-200 mt-2">{f.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <h3 className="font-display text-[32px] md:text-[48px] leading-tight">On vous montre <em>notre Sénégal</em>&nbsp;?</h3>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Btn onClick={()=>go('circuits')} variant="terre" size="lg" icon={<Icons.ArrowRight size={16}/>}>Voir les circuits</Btn>
            <Btn onClick={()=>go('contact')}  variant="outline" size="lg">Nous contacter</Btn>
          </div>
        </div>
      </section>

      <Footer go={go}/>
    </main>
  );
};

// ============================================================================
// FAQ
// ============================================================================
const FaqAccordion = ({ items }) => {
  const [open, setOpen] = React.useState(null);
  return (
    <ul className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <li key={i}>
            <button onClick={()=>setOpen(isOpen ? null : i)}
              className="w-full text-left py-4 md:py-5 flex items-start justify-between gap-6 group">
              <span className="font-display text-[18px] md:text-[20px] leading-snug group-hover:text-terre transition-colors pr-4">{it.q}</span>
              <span className={`h-9 w-9 rounded-full border border-ink/15 inline-flex items-center justify-center shrink-0 transition-transform ${isOpen ? 'rotate-45 bg-ink text-sand-50' : 'text-ink-700'}`}>
                <Icons.Plus size={16}/>
              </span>
            </button>
            <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <p className="text-[14.5px] text-ink-700 leading-relaxed max-w-3xl pr-10">{it.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

const Faq = ({ go }) => {
  const [query, setQuery] = React.useState('');
  const filtered = FAQ
    .map(g => ({ ...g, items: g.items.filter(it => {
      if (!query) return true;
      const q = query.toLowerCase();
      return it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q);
    })}))
    .filter(g => g.items.length > 0);

  const total = filtered.reduce((n,g)=>n + g.items.length, 0);

  return (
    <main className="bg-sand-50">
      <PageHero kicker="FAQ" tone="atlant" mood="horizon" bgImg={IMG('Saint-Louis', 7)} compact
        title={<>Les questions <em>fréquentes</em>.</>}
        intro="Tout ce qu’on nous demande le plus souvent, classé par thème. Une réponse manque ? On vous répond sur WhatsApp en moins d’une heure.">
        <div className="relative max-w-md">
          <Icons.Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"/>
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Chercher une question…"
            className="w-full h-12 rounded-full bg-sand-50 border border-sand-50/30 text-ink pl-11 pr-4 outline-none text-[14px]"/>
        </div>
      </PageHero>

      <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24">
        {query && (
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500 mb-6">
            {total} résultat{total>1?'s':''} pour "{query}"
          </div>
        )}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink/20 p-12 text-center">
            <div className="font-display text-[26px]">Aucun résultat pour "{query}".</div>
            <p className="text-ink-600 mt-2">Essayez un autre mot, ou écrivez-nous directement.</p>
            <Btn as="a" href={buildWaURL('Bonjour, j’ai une question :')} target="_blank" rel="noreferrer"
                 variant="wa" size="md" className="mt-5" icon={<Icons.Whatsapp size={16}/>}>Demander sur WhatsApp</Btn>
          </div>
        ) : (
          <div className="space-y-12 md:space-y-16">
            {filtered.map((g, i) => (
              <div key={i}>
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-4">— {g.cat}</div>
                <FaqAccordion items={g.items}/>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 md:mt-20 rounded-3xl bg-ink text-sand-50 p-8 md:p-10 text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre-300 mb-3">— On répond toujours</div>
          <h3 className="font-display text-[28px] md:text-[36px] leading-tight">Vous n’avez pas trouvé <em>votre réponse</em>&nbsp;?</h3>
          <p className="text-sand-200 mt-3 max-w-md mx-auto">On vous répond sur WhatsApp en moins d’une heure, en français, wolof ou anglais.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Btn as="a" href={buildWaURL('Bonjour, j’ai une question :')} target="_blank" rel="noreferrer"
                 variant="wa" size="lg" icon={<Icons.Whatsapp size={16}/>}>Demander sur WhatsApp</Btn>
            <Btn onClick={()=>go('contact')} variant="outlineLight" size="lg">Écrire un email</Btn>
          </div>
        </div>
      </section>

      <Footer go={go}/>
    </main>
  );
};

// ============================================================================
// LEGAL PAGES — Mentions légales, Politique de confidentialité, CGV
// ============================================================================
// Shared layout for the three legal pages. Each consumer passes { kicker,
// title, blocks } — blocks reuse the same shape as ArticleBody.

const LegalPage = ({ kicker, title, intro, blocks, bgImg, go }) => (
  <main className="bg-sand-50">
    <PageHero kicker={kicker} tone="sand" mood="horizon" bgImg={bgImg || IMG('Saint-Louis', 9)} compact
      title={title} intro={intro}/>
    <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="article-body text-[16px] md:text-[17px] leading-[1.75] text-ink-800">
        <style>{`
          .article-body p { margin: 0 0 1.1em; }
          .article-body h2 { font-family:'Instrument Serif', Georgia, serif; font-size: 28px; line-height: 1.2; margin: 2em 0 0.6em; color:#1A1612; }
          .article-body h3 { font-family:'Instrument Serif', Georgia, serif; font-size: 22px; line-height: 1.2; margin: 1.5em 0 0.5em; color:#1A1612; }
          .article-body ul { margin: 0.8em 0 1.3em; padding-left: 1.2em; }
          .article-body ul li { margin-bottom: 0.4em; list-style: disc; }
          .article-body strong { color:#1A1612; }
          .article-body a { color:#C8593B; text-decoration: underline; text-underline-offset: 3px; }
        `}</style>
        {blocks.map((b, i) => {
          switch (b.type) {
            case 'p':   return <p key={i} dangerouslySetInnerHTML={{__html: b.html}}/>;
            case 'h2':  return <h2 key={i}>{b.text}</h2>;
            case 'h3':  return <h3 key={i}>{b.text}</h3>;
            case 'ul':  return <ul key={i}>{b.items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{__html: it}}/>)}</ul>;
            default: return null;
          }
        })}
        <p className="text-ink-500 text-[13px] mt-12 pt-6 border-t border-ink/10">Dernière mise à jour : 25 mai 2026.</p>
      </div>
    </section>
    <Footer go={go}/>
  </main>
);

const Mentions = ({ go }) => (
  <LegalPage go={go} kicker="Mentions légales" title={<>Mentions <em>légales</em>.</>}
    intro="Informations légales relatives à l’éditeur et à l’hébergeur du site actours-senegal.com."
    blocks={[
      { type:'h2', text:'1. Éditeur du site' },
      { type:'p', html:'<strong>Africa Connection Tours (ACT)</strong><br/>Forme juridique : Société Anonyme (SA).<br/>Siège social : 52, rue Félix Faure — BP 11446, Dakar-Peytavin, Sénégal.<br/>Tour-opérateur fondé le 19 août 1996.<br/>Numéro de Registre du Commerce (RCCM) : SNDKR.1996/B 1449.<br/>NINEA : 20104112A3.<br/>Licence agence de voyages : n° 006523.<br/>Capital social : 20 000 000 FCFA.' },
      { type:'p', html:'<strong>Directeur de la publication :</strong> Salif Badiane, Directeur Général.<br/><strong>Contact :</strong> contact@actours-senegal.com · +221 33 849 52 00.' },
      { type:'h2', text:'2. Hébergement' },
      { type:'p', html:'Le site est hébergé par [Nom de l’hébergeur à compléter], dont le siège social est situé à [adresse de l’hébergeur].' },
      { type:'h2', text:'3. Propriété intellectuelle' },
      { type:'p', html:'L’ensemble des contenus présents sur le site (textes, photographies, illustrations, logos, marques) est protégé par le droit d’auteur et reste la propriété exclusive de Africa Connection Tours ou de ses ayants droit. Toute reproduction, représentation, modification ou exploitation sans autorisation écrite préalable est interdite.' },
      { type:'h2', text:'4. Crédits photographiques' },
      { type:'p', html:'Les photographies du site sont la propriété de Africa Connection Tours ou utilisées avec l’accord de leurs auteurs. Pour toute demande relative aux droits d’usage, écrivez à contact@actours-senegal.com.' },
      { type:'h2', text:'5. Données personnelles & cookies' },
      { type:'p', html:'La gestion des données personnelles et des cookies est détaillée dans notre <a href="#/privacy">Politique de confidentialité</a>.' },
      { type:'h2', text:'6. Litiges' },
      { type:'p', html:'Le présent site est soumis au droit sénégalais. En cas de litige, et après tentative de résolution amiable, les tribunaux compétents de Dakar seront seuls compétents.' },
    ]}/>
);

const Privacy = ({ go }) => (
  <LegalPage go={go} kicker="Confidentialité" title={<>Politique de <em>confidentialité</em>.</>}
    intro="La façon dont nous collectons, utilisons et protégeons vos données personnelles."
    blocks={[
      { type:'p', html:'Africa Connection Tours prend la protection de vos données personnelles au sérieux. Cette politique explique ce que nous collectons, pourquoi, et quels droits vous avez.' },
      { type:'h2', text:'1. Données que nous collectons' },
      { type:'ul', items:[
        '<strong>Données de contact</strong> : nom, prénom, email, téléphone — fournis lors d’une demande de devis ou de contact.',
        '<strong>Données de voyage</strong> : dates, nombre de voyageurs, préférences (régime alimentaire, mobilité) — utiles pour personnaliser votre séjour.',
        '<strong>Données de paiement</strong> : traitées exclusivement par nos prestataires (Stripe, Wave, Orange Money). Nous ne stockons aucune donnée bancaire sur nos serveurs.',
        '<strong>Données techniques</strong> : adresse IP, navigateur, pages visitées — anonymisées via Google Analytics 4.',
      ]},
      { type:'h2', text:'2. Pourquoi nous collectons ces données' },
      { type:'ul', items:[
        'Organiser votre voyage et vous répondre dans les délais annoncés.',
        'Émettre une facture et assurer le suivi comptable.',
        'Améliorer notre site et nos services (analyse anonymisée du trafic).',
        'Vous envoyer, avec votre accord, notre newsletter ou des offres saisonnières.',
      ]},
      { type:'h2', text:'3. Durée de conservation' },
      { type:'p', html:'Les données liées à une demande de devis sont conservées 3 ans à compter du dernier contact. Les données comptables (factures, paiements) sont conservées 10 ans conformément à la réglementation. Les données analytiques sont conservées 26 mois.' },
      { type:'h2', text:'4. Vos droits' },
      { type:'p', html:'Conformément à la loi sénégalaise n° 2008-12 relative à la protection des données à caractère personnel, vous disposez à tout moment des droits suivants :' },
      { type:'ul', items:[
        'Accéder à vos données personnelles.',
        'Demander leur rectification ou leur suppression.',
        'Vous opposer à leur traitement à des fins commerciales.',
        'Retirer votre consentement aux communications marketing.',
      ]},
      { type:'p', html:'Pour exercer ces droits, écrivez à <a href="mailto:contact@actours-senegal.com">contact@actours-senegal.com</a>. Nous vous répondrons sous 30 jours.' },
      { type:'h2', text:'5. Cookies' },
      { type:'p', html:'Le site utilise des cookies essentiels (fonctionnement du site) et des cookies de mesure d’audience (Google Analytics 4, anonymisés). Aucun cookie publicitaire n’est posé sans votre consentement explicite. Vous pouvez désactiver les cookies via les paramètres de votre navigateur.' },
      { type:'h2', text:'6. Transferts hors Sénégal' },
      { type:'p', html:'Certains de nos prestataires techniques (hébergement, analytics, paiement) sont situés hors du Sénégal. Nous nous assurons qu’ils respectent un niveau de protection équivalent à celui exigé par la loi sénégalaise.' },
      { type:'h2', text:'7. Contact' },
      { type:'p', html:'Pour toute question sur la confidentialité : <a href="mailto:contact@actours-senegal.com">contact@actours-senegal.com</a>.' },
    ]}/>
);

const Cgv = ({ go }) => (
  <LegalPage go={go} kicker="CGV" title={<>Conditions générales <em>de vente</em>.</>}
    intro="Conditions applicables à toute réservation effectuée auprès de Africa Connection Tours."
    blocks={[
      { type:'h2', text:'1. Objet et acceptation' },
      { type:'p', html:'Les présentes Conditions Générales de Vente (CGV) régissent les relations entre Africa Connection Tours (l’"Agence") et toute personne physique ou morale (le "Client") réservant une prestation de voyage. Toute réservation implique l’acceptation pleine et entière des présentes CGV.' },
      { type:'h2', text:'2. Réservation et confirmation' },
      { type:'p', html:'La réservation devient ferme à la réception de l’acompte par l’Agence. Une confirmation écrite (email ou WhatsApp) est alors envoyée au Client, accompagnée d’une facture pro forma.' },
      { type:'h2', text:'3. Prix' },
      { type:'p', html:'Les prix indiqués sur le site sont exprimés en francs CFA (FCFA / XOF), avec conversion indicative en EUR et USD. Les prix incluent les prestations mentionnées dans la fiche "Inclus" de chaque circuit, et excluent celles listées dans la fiche "Non inclus".' },
      { type:'h2', text:'4. Modalités de paiement' },
      { type:'ul', items:[
        '<strong>Acompte</strong> : 30 % du montant total à la réservation.',
        '<strong>Solde</strong> : 70 % à régler au plus tard 7 jours avant la date de départ.',
        '<strong>Moyens acceptés</strong> : Wave, Orange Money, Free Money, virement bancaire (Sénégal & international), carte Visa/Mastercard via Stripe, espèces (FCFA / EUR / USD) à l’arrivée.',
      ]},
      { type:'h2', text:'5. Annulation par le Client' },
      { type:'ul', items:[
        '<strong>Plus de 21 jours avant le départ</strong> : remboursement intégral de l’acompte.',
        '<strong>Entre 21 et 7 jours avant le départ</strong> : 50 % de l’acompte remboursé.',
        '<strong>Moins de 7 jours avant le départ</strong> : l’acompte est conservé mais peut être reporté sur un autre circuit dans les 12 mois.',
        'L’annulation doit être notifiée par écrit (email ou WhatsApp).',
      ]},
      { type:'h2', text:'6. Annulation par l’Agence' },
      { type:'p', html:'En cas d’annulation par l’Agence pour force majeure ou raison opérationnelle (sécurité, météo, indisponibilité d’un partenaire), le Client se voit proposer soit le report sans frais à la date de son choix, soit le remboursement intégral sous 7 jours.' },
      { type:'h2', text:'7. Modification du programme' },
      { type:'p', html:'L’Agence se réserve le droit d’ajuster ponctuellement le programme d’un circuit pour des raisons de sécurité, de météo, ou d’opportunité culturelle (ex. fête locale). Toute modification substantielle est communiquée au Client avant le départ.' },
      { type:'h2', text:'8. Responsabilité' },
      { type:'p', html:'L’Agence agit en tant qu’organisateur de voyage et est responsable de la bonne exécution des prestations qu’elle propose directement. Pour les prestations sous-traitées (transport aérien, hébergement chez des prestataires partenaires), la responsabilité est partagée selon les conditions de chaque prestataire.' },
      { type:'h2', text:'9. Assurance' },
      { type:'p', html:'L’Agence recommande fortement la souscription d’une assurance voyage couvrant le rapatriement médical, l’annulation et les bagages. Une telle assurance n’est pas incluse dans nos prix par défaut, mais peut être proposée en option sur demande.' },
      { type:'h2', text:'10. Réclamations' },
      { type:'p', html:'Toute réclamation doit être adressée à l’Agence dans un délai de 30 jours après le retour du voyage, par écrit (email ou courrier). L’Agence s’engage à répondre dans un délai de 30 jours.' },
      { type:'h2', text:'11. Droit applicable et juridiction' },
      { type:'p', html:'Les présentes CGV sont soumises au droit sénégalais. En cas de litige, et après tentative de résolution amiable, les tribunaux compétents de Dakar seront seuls compétents.' },
    ]}/>
);

// ============================================================================
// 404 — route inconnue
// ============================================================================
const NotFound = ({ go, route }) => (
  <main className="bg-sand-50">
    <section className="relative min-h-[80svh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Photo tone="atlant" mood="water" rounded="" showLabel={false} className="h-full w-full" src={IMG('Delta du Saloum', 6)} alt=""/>
        <div className="absolute inset-0" style={{ background:'linear-gradient(180deg, rgba(26,22,18,0.55) 0%, rgba(26,22,18,0.85) 100%)' }}/>
      </div>
      <div className="relative max-w-2xl mx-auto px-4 md:px-8 py-32 text-center text-sand-50">
        <div className="font-mono text-[11px] uppercase tracking-[0.32em] text-terre-300 mb-6">— Erreur 404</div>
        <h1 className="font-display text-[56px] md:text-[88px] leading-[0.95]">Cette page <em className="text-terre-300">s’est perdue</em>.</h1>
        <p className="mt-6 max-w-md mx-auto text-sand-100/90 text-[16px] leading-relaxed">
          L’adresse <span className="font-mono text-[13px] bg-sand-50/10 px-2 py-0.5 rounded">#/{route}</span> n’existe pas — ou n’existe plus. Pas de panique, on vous remet sur la route.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Btn onClick={()=>go('home')}     variant="terre"        size="lg" icon={<Icons.ArrowRight size={18}/>}>Retour à l’accueil</Btn>
          <Btn onClick={()=>go('circuits')} variant="outlineLight" size="lg">Voir nos circuits</Btn>
          <Btn onClick={()=>go('contact')}  variant="outlineLight" size="lg">Nous écrire</Btn>
        </div>
      </div>
    </section>
    <Footer go={go}/>
  </main>
);

Object.assign(window, { Contact, About, Faq, Mentions, Privacy, Cgv, NotFound });

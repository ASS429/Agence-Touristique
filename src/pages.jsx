import React from 'react';
import { useI18n } from './i18n.jsx';
import { Icons } from './icons.jsx';
import { Photo } from './photo.jsx';
import { Btn, Footer, PageHero, Section, TurnstileWidget, buildWaURL, SITE } from './shared.jsx';
import { FAQ, VALUES, FIGURES, IMG } from './data.jsx';
import { DestinationsMap } from './map.jsx';
// Contact + À propos + FAQ pages — grouped to keep file count tight.

// ============================================================================
// CONTACT
// ============================================================================
const Contact = ({ go }) => {
  const { t, richT, lang } = useI18n();
  const [form, setForm] = React.useState({ name:'', email:'', phone:'', subject:'devis', message:'' });
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState('');
  const [hp, setHp] = React.useState('');            // honeypot anti-bot
  const startedAt = React.useRef(Date.now());        // timing anti-bot
  const [tsToken, setTsToken] = React.useState(null); // token Turnstile (si actif)
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

  // Enregistre la demande dans Supabase (contact_requests). Tolérant à l'échec :
  // si la BDD n'est pas configurée ou renvoie une erreur, on continue avec
  // Formspree / mailto — la demande n'est jamais perdue.
  const saveToSupabase = () => window.actSaveContactRequest?.({
    kind: form.subject === 'devis' ? 'devis' : 'contact',
    full_name: form.name || null,
    email: form.email || null,
    phone: form.phone || null,
    language: lang,
    message: form.message || null,
    extra: { subject: form.subject, source: 'page-contact' }
  }, tsToken).catch(() => {});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Anti-bot : si honeypot rempli ou soumission trop rapide, on simule un
    // succès sans rien enregistrer (ne pas informer le bot).
    if (window.actIsLikelyBot?.(hp, startedAt.current)) { setSent(true); return; }
    // Turnstile actif : le token est requis avant l'envoi (vérifié serveur).
    if (window.ACT_TURNSTILE_SITE_KEY && !tsToken) {
      setError(t('form.turnstile.required', 'Merci de valider la vérification anti-robots avant d\'envoyer.'));
      return;
    }
    // Enregistrement Supabase (base « Demandes reçues » + email Resend vers ACT).
    saveToSupabase();

    // Formspree désactivé : la demande est en base + notifiée par email.
    // On affiche la confirmation sans ouvrir la messagerie (le bouton
    // « Ouvrir mon mail » reste dispo pour un envoi manuel volontaire).
    if (!SITE.formspree) {
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
      <PageHero kicker={t('page.contact.kicker')} tone="dusk" mood="city" bgImg={IMG('Dakar', 8)} compact
        title={richT(t('page.contact.title'))}
        intro={t('page.contact.intro')}/>

      {/* Three contact cards */}
      <section className="-mt-12 md:-mt-16 relative z-10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid sm:grid-cols-3 gap-4 md:gap-5">
          {[
            { I:Icons.Whatsapp, k:t('cta.whatsapp'),         v:SITE.whatsappDisplay, cta:t('contact.cards.whatsapp.cta'), href:buildWaURL(t('wa.greetingShort')), tone:'wa', accent:'bg-[#1FA855]' },
            { I:Icons.Phone,    k:t('contact.cards.phone.k'),v:SITE.phone,           cta:t('contact.cards.phone.cta'),    href:`tel:+${SITE.whatsapp}`,         tone:'primary', accent:'bg-ink' },
            { I:Icons.Mail,     k:t('contact.cards.email.k'),v:SITE.email,           cta:t('contact.cards.email.cta'),    href:`mailto:${SITE.email}`,          tone:'primary', accent:'bg-terre-600' },
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
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-3">— {t('contact.form.kicker')}</div>
          <h2 className="font-display text-[32px] md:text-[44px] leading-tight">{t('contact.form.title')}</h2>
          <p className="mt-3 text-ink-600 max-w-md">{t('contact.form.intro')}</p>

          {sent ? (
            <div className="mt-8 rounded-3xl bg-terre/10 border border-terre/20 p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-terre-600 text-sand-50 inline-flex items-center justify-center"><Icons.Check size={18}/></div>
                <div>
                  <div className="font-display text-[22px] leading-tight">{t('contact.form.sent.title')}</div>
                  <div className="text-[13px] text-ink-600 mt-0.5">{t('contact.form.sent.body')}</div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 grid md:grid-cols-2 gap-4">
              {/* Honeypot anti-bot : invisible et hors tabulation pour les humains */}
              <input type="text" name="company" tabIndex={-1} autoComplete="off"
                     value={hp} onChange={(e)=>setHp(e.target.value)}
                     aria-hidden="true"
                     style={{ position:'absolute', left:'-9999px', width:1, height:1, opacity:0 }}/>
              <ContactField label={t('contact.form.field.name')}  value={form.name}  onChange={(v)=>set('name', v)}  required/>
              <ContactField label={t('contact.form.field.email')} type="email" value={form.email} onChange={(v)=>set('email', v)} required/>
              <ContactField label={t('contact.form.field.phone')} value={form.phone} onChange={(v)=>set('phone', v)} placeholder={t('contact.form.field.phonePlaceholder')}/>
              <div>
                <label className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-500 block mb-1.5">{t('contact.form.field.subject')}</label>
                <select value={form.subject} onChange={(e)=>set('subject', e.target.value)}
                  aria-label={t('contact.form.field.subject')}
                  className="w-full h-12 rounded-full border border-ink/15 bg-sand-50 px-4 text-[14px] outline-none focus:border-terre cursor-pointer">
                  <option value="devis">{t('contact.form.subject.devis')}</option>
                  <option value="question">{t('contact.form.subject.question')}</option>
                  <option value="partenariat">{t('contact.form.subject.partenariat')}</option>
                  <option value="autre">{t('contact.form.subject.autre')}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-500 block mb-1.5">{t('contact.form.field.message')}</label>
                <textarea required rows={6} value={form.message} onChange={(e)=>set('message', e.target.value)}
                  placeholder={t('contact.form.messagePlaceholder')}
                  className="w-full rounded-2xl border border-ink/15 bg-sand-50 p-4 text-[14px] outline-none focus:border-terre"/>
              </div>
              {/* Anti-bot Cloudflare — ne rend rien tant que la clé de site est vide */}
              <TurnstileWidget onToken={setTsToken} className="md:col-span-2"/>
              {error && (
                <div className="md:col-span-2 rounded-2xl bg-terre/10 border border-terre/30 px-4 py-3 text-[13px] text-terre-700">
                  {error}
                </div>
              )}
              <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4">
                <p className="text-[12px] text-ink-500 max-w-sm">{t('contact.form.privacyText')} <a href="/privacy/" className="underline underline-offset-2 hover:text-terre">{t('contact.form.privacyLink')}</a>.</p>
                <div className="flex items-center gap-3">
                  <Btn as="a" href={mailtoHref()} variant="outline" size="lg" icon={<Icons.Mail size={16}/>}>
                    {t('contact.form.openMail')}
                  </Btn>
                  <Btn variant="terre" size="lg" as="button" type="submit" disabled={sending} icon={<Icons.ArrowRight size={16}/>}>
                    {sending ? t('contact.form.sending') : t('contact.form.send')}
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
              <div className="font-display text-[22px] leading-tight">{t('contact.aside.title')}</div>
              <div className="mt-3 text-[14px] text-ink-700 leading-relaxed">
                {SITE.address}<br/>{t('contact.aside.country')}
              </div>
              <div className="mt-5 pt-5 border-t border-ink/10 grid grid-cols-2 gap-3 text-[12.5px]">
                <div>
                  <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-500">{t('contact.aside.hours')}</div>
                  <div className="mt-0.5">{t('footer.openingHours')}</div>
                </div>
                <div>
                  <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-500">{t('contact.aside.since')}</div>
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
  const { t, richT } = useI18n();
  return (
    <main className="bg-sand-50">
      <PageHero kicker={t('page.about.kicker')} tone="terre" mood="portrait" bgImg={IMG('Saint-Louis', 6)}
        title={richT(t('page.about.title'))}
        intro={t('page.about.intro')}/>

      {/* Timeline — depuis 1996 */}
      <section className="py-16 md:py-24 bg-sand-100/40 border-y border-ink/5">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-4">— {t('about.timeline.label')}</div>
          <h2 className="font-display text-[36px] md:text-[56px] leading-[1.02] mb-12 md:mb-16 max-w-3xl">
            {richT(t('about.timeline.title'))}
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-3 relative">
            {/* Ligne horizontale décorative en desktop */}
            <div aria-hidden="true" className="hidden md:block absolute top-7 left-[10%] right-[10%] h-px bg-terre/25"/>
            {[
              { y:'1996',  tKey:'about.timeline.1.t', dKey:'about.timeline.1.d' },
              { y:'2000s', tKey:'about.timeline.2.t', dKey:'about.timeline.2.d' },
              { y:'2011',  tKey:'about.timeline.3.t', dKey:'about.timeline.3.d' },
              { y:'2010s', tKey:'about.timeline.4.t', dKey:'about.timeline.4.d' },
              { y:'2026',  tKey:'about.timeline.5.t', dKey:'about.timeline.5.d' },
            ].map((step, i) => (
              <li key={i} className="relative flex md:block items-start gap-4">
                <div className="relative shrink-0 inline-flex items-center justify-center h-14 w-14 md:h-14 md:w-14 rounded-full bg-terre-600 text-sand-50 font-mono text-[11px] md:text-[12px] font-semibold ring-4 ring-sand-50 shadow-md shadow-terre/30">
                  {step.y}
                </div>
                <div className="md:mt-5">
                  <div className="font-display text-[20px] md:text-[22px] leading-tight text-ink">{t(step.tKey)}</div>
                  <p className="text-[13.5px] md:text-[14px] text-ink-600 leading-relaxed mt-1.5 max-w-[220px]">{t(step.dKey)}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-[12.5px] text-ink-500 italic">{t('about.timeline.note')}</p>
        </div>
      </section>

      {/* Notre histoire */}
      <Section label={t('about.histoire.label')} title={richT(t('about.histoire.title'))}
               kicker={t('about.histoire.kicker')}
               className="py-20 md:py-28">
        <div className="grid md:grid-cols-[1.2fr,1fr] gap-10 md:gap-16 items-center">
          <div className="space-y-5 text-[16px] md:text-[17px] leading-relaxed text-ink-800 max-w-2xl">
            <p>{t('about.histoire.p1')}</p>
            <p>{t('about.histoire.p2')}</p>
            <p>{t('about.histoire.p3')}</p>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <Photo tone="terre" mood="portrait" label={t('about.histoire.photo.salif')} ratio="aspect-[3/4]"/>
              <div className="grid grid-rows-2 gap-3">
                <Photo tone="sand" mood="city" label={t('about.histoire.photo.siege')} ratio="aspect-square" src={IMG('Dakar', 6)} alt="Siège ACT, Dakar-Peytavin"/>
                <Photo tone="atlant" mood="water" label={t('about.histoire.photo.bureau')} ratio="aspect-square" src={IMG('Delta du Saloum', 5)} alt="Réseau ouest-africain"/>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Valeurs */}
      <Section label={t('about.valeurs.label')} title={richT(t('about.valeurs.title'))}
               className="py-20 md:py-24 bg-ink text-sand-50" dark>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {VALUES.map((v,i)=>{
            const I = Icons[v.I] || Icons.Compass;
            return (
              <div key={i} className="border-t border-sand-100/15 pt-6">
                <div className="h-12 w-12 rounded-full bg-terre/15 text-terre-300 inline-flex items-center justify-center mb-5"><I size={22}/></div>
                <div className="font-display text-[26px] leading-tight">{t(`about.value.${i+1}.t`, v.t)}</div>
                <div className="text-sand-200 mt-2 leading-relaxed text-[14px]">{t(`about.value.${i+1}.d`, v.d)}</div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* L'équipe — présentation structurelle non-nominative (directive ACT
          du 18 juin 2026 : composition susceptible de changer, présentation
          de la structure plutôt que des personnes). */}
      <Section label={t('about.equipe.label')} title={richT(t('about.equipe.title'))}
               kicker={t('about.equipe.kicker')}
               className="py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {[
            { I:Icons.Star,    tKey:'about.equipe.unit1.t', dKey:'about.equipe.unit1.d' },
            { I:Icons.Users,   tKey:'about.equipe.unit2.t', dKey:'about.equipe.unit2.d' },
            { I:Icons.Compass, tKey:'about.equipe.unit3.t', dKey:'about.equipe.unit3.d' },
            { I:Icons.Globe,   tKey:'about.equipe.unit4.t', dKey:'about.equipe.unit4.d' },
          ].map((u, i) => (
            <article key={i} className="bg-sand-100 rounded-3xl p-6 md:p-8 border border-ink/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-terre/10 text-terre inline-flex items-center justify-center shrink-0">
                  <u.I size={22}/>
                </div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-500">0{i+1}</div>
              </div>
              <div className="font-display text-[26px] md:text-[28px] leading-tight">{t(u.tKey)}</div>
              <p className="mt-3 text-[14.5px] md:text-[15px] text-ink-700 leading-relaxed">{t(u.dKey)}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* Pourquoi nous + Tourisme responsable */}
      <Section label={t('about.pourquoi.label')} title={richT(t('about.pourquoi.title'))}
               className="py-20 md:py-24 bg-sand-100">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          <div className="space-y-5 text-[15.5px] md:text-[16.5px] leading-relaxed text-ink-800 max-w-xl">
            <p>{t('about.pourquoi.p1')}</p>
            <p>{richT(t('about.pourquoi.p2'))}</p>
          </div>
          <div className="rounded-3xl bg-terre/8 border border-terre/15 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3 text-terre">
              <Icons.Leaf size={18}/> <span className="font-mono text-[11px] uppercase tracking-[0.22em]">{t('about.responsable.label')}</span>
            </div>
            <ul className="space-y-3 text-[14.5px] text-ink-800">
              <li className="flex items-start gap-3"><Icons.Check size={16} className="text-terre mt-0.5"/>{t('about.responsable.item1')}</li>
              <li className="flex items-start gap-3"><Icons.Check size={16} className="text-terre mt-0.5"/>{t('about.responsable.item2')}</li>
              <li className="flex items-start gap-3"><Icons.Check size={16} className="text-terre mt-0.5"/>{t('about.responsable.item3')}</li>
              <li className="flex items-start gap-3"><Icons.Check size={16} className="text-terre mt-0.5"/>{t('about.responsable.item4')}</li>
              <li className="flex items-start gap-3"><Icons.Check size={16} className="text-terre mt-0.5"/>{t('about.responsable.item5')}</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Notre réseau — présentation catégorisée par nature et géographie,
          sans nommer les partenaires (directive ACT du 18 juin 2026 :
          confidentialité commerciale, mention par pays/type uniquement).
          Texte d'introduction officiel ACT (fichier "Nos Partenaires.docx"). */}
      <Section label={t('about.network.label')} title={richT(t('about.network.title'))}
               kicker={t('about.network.kicker')}
               className="py-16 md:py-24">
        <p className="max-w-3xl text-[15px] md:text-[16px] text-ink-800 leading-relaxed mb-8 md:mb-10">
          {t('about.network.intro')}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {[
            { I:Icons.MapPin,   tKey:'about.network.cat1.t', dKey:'about.network.cat1.d' },
            { I:Icons.ArrowUpRight, tKey:'about.network.cat2.t', dKey:'about.network.cat2.d' },
            { I:Icons.Shield,   tKey:'about.network.cat3.t', dKey:'about.network.cat3.d' },
            { I:Icons.Heart,    tKey:'about.network.cat4.t', dKey:'about.network.cat4.d' },
            { I:Icons.Leaf,     tKey:'about.network.cat5.t', dKey:'about.network.cat5.d' },
            { I:Icons.Globe,    tKey:'about.network.cat6.t', dKey:'about.network.cat6.d' },
          ].map((c, i) => (
            <article key={i} className="group bg-sand-50 rounded-2xl p-5 md:p-6 border border-ink/10 hover:border-terre/30 hover:shadow-md hover:shadow-ink/5 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-terre/10 text-terre inline-flex items-center justify-center shrink-0 group-hover:bg-terre group-hover:text-sand-50 transition-colors">
                  <c.I size={18}/>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-400">{String(i+1).padStart(2,'0')}</span>
              </div>
              <div className="font-display text-[20px] md:text-[22px] leading-tight">{t(c.tKey)}</div>
              <p className="mt-2 text-[13.5px] text-ink-600 leading-relaxed">{t(c.dKey)}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-[12.5px] text-ink-500 font-mono italic max-w-2xl">{t('about.network.note')}</p>
      </Section>

      {/* Chiffres */}
      <section className="py-20 md:py-24 bg-ink text-sand-50">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {FIGURES.map((f,i)=>(
            <div key={i} className={`${i<FIGURES.length-1?'sm:border-r border-sand-100/15':''} sm:pr-8`}>
              <div className="font-display text-[44px] md:text-[64px] leading-none text-sand-50">{f.k}</div>
              <div className="text-[13px] md:text-[14px] text-sand-200 mt-2">{t(`about.figure.${i}.v`, f.v)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <h3 className="font-display text-[32px] md:text-[48px] leading-tight">{richT(t('about.cta.title'))}</h3>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Btn onClick={()=>go('circuits')} variant="terre" size="lg" icon={<Icons.ArrowRight size={16}/>}>{t('about.cta.tours')}</Btn>
            <Btn onClick={()=>go('contact')}  variant="outline" size="lg">{t('about.cta.contact')}</Btn>
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
  const { lang } = useI18n();
  const L = (it, f) => window.pickLang ? window.pickLang(it, f, lang) : (it[f === 'question' ? 'q' : 'a'] || '');
  const [open, setOpen] = React.useState(null);
  return (
    <ul className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <li key={i}>
            <button onClick={()=>setOpen(isOpen ? null : i)}
              className="w-full text-left py-4 md:py-5 flex items-start justify-between gap-6 group">
              <span className="font-display text-[18px] md:text-[20px] leading-snug group-hover:text-terre transition-colors pr-4">{L(it,'question')}</span>
              <span className={`h-9 w-9 rounded-full border border-ink/15 inline-flex items-center justify-center shrink-0 transition-transform ${isOpen ? 'rotate-45 bg-ink text-sand-50' : 'text-ink-700'}`}>
                <Icons.Plus size={16}/>
              </span>
            </button>
            <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <p className="text-[14.5px] text-ink-700 leading-relaxed max-w-3xl pr-10">{L(it,'answer')}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

const Faq = ({ go }) => {
  const { t, richT, lang } = useI18n();
  const L = (it, f) => window.pickLang ? window.pickLang(it, f, lang) : (it[f === 'question' ? 'q' : 'a'] || '');
  const [query, setQuery] = React.useState('');
  const filtered = FAQ
    .map(g => ({ ...g, items: g.items.filter(it => {
      if (!query) return true;
      const q = query.toLowerCase();
      return L(it,'question').toLowerCase().includes(q) || L(it,'answer').toLowerCase().includes(q);
    })}))
    .filter(g => g.items.length > 0);

  const total = filtered.reduce((n,g)=>n + g.items.length, 0);

  return (
    <main className="bg-sand-50">
      <PageHero kicker={t('page.faq.kicker')} tone="atlant" mood="horizon" bgImg={IMG('Saint-Louis', 7)} compact
        title={richT(t('page.faq.title'))}
        intro={t('page.faq.intro')}>
        <div className="relative max-w-md">
          <Icons.Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"/>
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={t('page.faq.search')}
            className="w-full h-12 rounded-full bg-sand-50 border border-sand-50/30 text-ink pl-11 pr-4 outline-none text-[14px]"/>
        </div>
      </PageHero>

      <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24">
        {query && (
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500 mb-6">
            {(total>1 ? t('faq.results.plural') : t('faq.results.singular')).replace('{n}', total).replace('{query}', query)}
          </div>
        )}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink/20 p-12 text-center">
            <div className="font-display text-[26px]">{t('faq.empty.title').replace('{query}', query)}</div>
            <p className="text-ink-600 mt-2">{t('faq.empty.body')}</p>
            <Btn as="a" href={buildWaURL(t('faq.wa.question'))} target="_blank" rel="noreferrer"
                 variant="wa" size="md" className="mt-5" icon={<Icons.Whatsapp size={16}/>}>{t('faq.askWhatsApp')}</Btn>
          </div>
        ) : (
          <div className="space-y-12 md:space-y-16">
            {filtered.map((g, i) => (
              <div key={i}>
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-4">— {t(`faq.cat.${i}`, g.cat)}</div>
                <FaqAccordion items={g.items}/>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 md:mt-20 rounded-3xl bg-ink text-sand-50 p-8 md:p-10 text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre-300 mb-3">— {t('faq.bottomCTA.label')}</div>
          <h3 className="font-display text-[28px] md:text-[36px] leading-tight">{richT(t('faq.bottomCTA.title'))}</h3>
          <p className="text-sand-200 mt-3 max-w-md mx-auto">{t('faq.bottomCTA.body')}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Btn as="a" href={buildWaURL(t('faq.wa.question'))} target="_blank" rel="noreferrer"
                 variant="wa" size="lg" icon={<Icons.Whatsapp size={16}/>}>{t('faq.askWhatsApp')}</Btn>
            <Btn onClick={()=>go('contact')} variant="outlineLight" size="lg">{t('faq.bottomCTA.emailCTA')}</Btn>
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

const LegalPage = ({ kicker, title, intro, blocks, bgImg, go }) => {
  const { t } = useI18n();
  return (
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
          <p className="text-ink-500 text-[13px] mt-12 pt-6 border-t border-ink/10">{t('legal.lastUpdate')}</p>
        </div>
      </section>
      <Footer go={go}/>
    </main>
  );
};

const Mentions = ({ go }) => {
  const { t, richT } = useI18n();
  return (
    <LegalPage go={go} kicker={t('legal.mentions.kicker')} title={richT(t('legal.mentions.title'))}
      intro={t('legal.mentions.intro')}
      blocks={[
      { type:'h2', text:'1. Éditeur du site' },
      { type:'p', html:'<strong>Africa Connection Tours (ACT)</strong><br/>Forme juridique : Société Anonyme (SA).<br/>Siège social : 52, rue Félix Faure — BP 11446, Dakar-Peytavin, Sénégal.<br/>Tour-opérateur fondé le 19 août 1996.<br/>Numéro de Registre du Commerce (RCCM) : SNDKR.1996/B 1449.<br/>NINEA : 20104112A3.<br/>Licence agence de voyages : n° 006523.<br/>Capital social : 20 000 000 FCFA.' },
      { type:'p', html:'<strong>Directeur de la publication :</strong> Salif Badiane, Directeur Général.<br/><strong>Contact :</strong> act@orange.sn · +221 33 849 52 00.' },
      { type:'h2', text:'2. Hébergement' },
      { type:'p', html:'Le site est hébergé par [Nom de l’hébergeur à compléter], dont le siège social est situé à [adresse de l’hébergeur].' },
      { type:'h2', text:'3. Propriété intellectuelle' },
      { type:'p', html:'L’ensemble des contenus présents sur le site (textes, photographies, illustrations, logos, marques) est protégé par le droit d’auteur et reste la propriété exclusive de Africa Connection Tours ou de ses ayants droit. Toute reproduction, représentation, modification ou exploitation sans autorisation écrite préalable est interdite.' },
      { type:'h2', text:'4. Crédits photographiques' },
      { type:'p', html:'Les photographies du site sont la propriété de Africa Connection Tours ou utilisées avec l’accord de leurs auteurs. Pour toute demande relative aux droits d’usage, écrivez à act@orange.sn.' },
      { type:'h2', text:'5. Données personnelles & cookies' },
      { type:'p', html:'La gestion des données personnelles et des cookies est détaillée dans notre <a href="/privacy/">Politique de confidentialité</a>.' },
      { type:'h2', text:'6. Litiges' },
      { type:'p', html:'Le présent site est soumis au droit sénégalais. En cas de litige, et après tentative de résolution amiable, les tribunaux compétents de Dakar seront seuls compétents.' },
    ]}/>
  );
};

const Privacy = ({ go }) => {
  const { t, richT } = useI18n();
  return (
    <LegalPage go={go} kicker={t('legal.privacy.kicker')} title={richT(t('legal.privacy.title'))}
      intro={t('legal.privacy.intro')}
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
      { type:'p', html:'Pour exercer ces droits, écrivez à <a href="mailto:act@orange.sn">act@orange.sn</a>. Nous vous répondrons sous 30 jours.' },
      { type:'h2', text:'5. Cookies' },
      { type:'p', html:'Le site utilise des cookies essentiels (fonctionnement du site) et des cookies de mesure d’audience (Google Analytics 4, anonymisés). Aucun cookie publicitaire n’est posé sans votre consentement explicite. Vous pouvez désactiver les cookies via les paramètres de votre navigateur.' },
      { type:'h2', text:'6. Transferts hors Sénégal' },
      { type:'p', html:'Certains de nos prestataires techniques (hébergement, analytics, paiement) sont situés hors du Sénégal. Nous nous assurons qu’ils respectent un niveau de protection équivalent à celui exigé par la loi sénégalaise.' },
      { type:'h2', text:'7. Contact' },
      { type:'p', html:'Pour toute question sur la confidentialité : <a href="mailto:act@orange.sn">act@orange.sn</a>.' },
    ]}/>
  );
};

const Cgv = ({ go }) => {
  const { t, richT } = useI18n();
  return (
    <LegalPage go={go} kicker={t('legal.cgv.kicker')} title={richT(t('legal.cgv.title'))}
      intro={t('legal.cgv.intro')}
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
};

// ============================================================================
// 404 — route inconnue
// ============================================================================
const NotFound = ({ go, route }) => {
  const { t, richT } = useI18n();
  // Split the body : injecter le span monospace stylé autour de l'URL.
  const renderBody = () => {
    const raw = t('notfound.body');
    const parts = raw.split('{url}');
    return <>{parts[0]}<span className="font-mono text-[13px] bg-sand-50/10 px-2 py-0.5 rounded">/{route}</span>{parts[1] || ''}</>;
  };
  return (
    <main className="bg-sand-50">
      <section className="relative min-h-[80svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Photo tone="atlant" mood="water" rounded="" showLabel={false} className="h-full w-full" src={IMG('Delta du Saloum', 6)} alt=""/>
          <div className="absolute inset-0" style={{ background:'linear-gradient(180deg, rgba(26,22,18,0.55) 0%, rgba(26,22,18,0.85) 100%)' }}/>
        </div>
        <div className="relative max-w-2xl mx-auto px-4 md:px-8 py-32 text-center text-sand-50">
          <div className="font-mono text-[11px] uppercase tracking-[0.32em] text-terre-300 mb-6">— {t('notfound.kicker')}</div>
          <h1 className="font-display text-[56px] md:text-[88px] leading-[0.95]">{richT(t('notfound.title'), { emClassName: 'text-terre-300' })}</h1>
          <p className="mt-6 max-w-md mx-auto text-sand-100/90 text-[16px] leading-relaxed">
            {renderBody()}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Btn onClick={()=>go('home')}     variant="terre"        size="lg" icon={<Icons.ArrowRight size={18}/>}>{t('notfound.cta.home')}</Btn>
            <Btn onClick={()=>go('circuits')} variant="outlineLight" size="lg">{t('notfound.cta.tours')}</Btn>
            <Btn onClick={()=>go('contact')}  variant="outlineLight" size="lg">{t('notfound.cta.contact')}</Btn>
          </div>
        </div>
      </section>
      <Footer go={go}/>
    </main>
  );
};

if (typeof window !== 'undefined') Object.assign(window, { Contact, About, Faq, Mentions, Privacy, Cgv, NotFound });
export { Contact, About, Faq, Mentions, Privacy, Cgv, NotFound };

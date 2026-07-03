// Shared components: Logo, Header (router + i18n aware), WhatsAppFloat,
// Footer, StarRow, Pills/Buttons, Section, Price (currency aware).

// Site-wide identité + contact. Change ici, se propage partout.
// Données vérifiées d'Africa Connection Tours (Dakar) — sources : tourism-review,
// piaafrica, thetravelboss, ATA. À valider avec l'agence : email, numéro WhatsApp
// dédié, numéros de licence / RCCM / NINEA (non disponibles en source publique).
const SITE = {
  brand:           'Africa Connection Tours',
  brandShort:      'ACT',
  founded:         1996,                   // confirmé ACT : 19 août 1996 (et non 1994 comme sources tierces)
  legalForm:       'Société Anonyme (SA)',
  capital:         '20 000 000 FCFA',
  rccm:            'SNDKR.1996/B 1449',
  ninea:           '20104112A3',
  travelLicense:   'n° 006523',
  whatsapp:        '221338495200',         // ⚠️ ACT n'a pas encore de mobile WhatsApp dédié — fixe en attendant
  whatsappDisplay: '+221 33 849 52 00',
  whatsappAvailable: false,                // tant que false, désactive les CTAs WhatsApp si on veut
  phone:           '+221 33 849 52 00',
  phoneAlt:        '+221 33 849 52 83',
  fax:             '+221 33 821 83 26',
  email:           'act@orange.sn',        // confirmé ACT (et non contact@actours-senegal.com)
  address:         '52, rue Félix Faure, BP 11446, Dakar-Peytavin',
  addressShort:    'Dakar-Plateau',
  website:         'act-senegal.com',
  facebook:        'https://www.facebook.com/AfricaConnectionTours',
  twitter:         'https://twitter.com/actours_senegal',
  instagram:       '',                     // pas encore fourni par l'agence
  // Endpoint Formspree (ou équivalent : Web3Forms, Formsubmit, etc.).
  // Tant qu'elle vaut "" le formulaire bascule automatiquement sur mailto:.
  formspree:       'https://formspree.io/f/xgoqnlaz',
  // ID Google Analytics 4 (G-XXXXXXXXXX). Tant que vide, gtag.js ne charge pas
  // et aucun event n'est envoyé — les pushes dataLayer restent inertes.
  gaId:            '',
  // Bandeau de promo affiché au-dessus du header. Passe `active:false` ou
  // laisse expiresAt < aujourd'hui pour le masquer. L'id sert au localStorage
  // : si l'utilisateur a fermé la promo X, elle ne réapparaît plus avec le
  // même id. Changer l'id pour relancer une nouvelle annonce.
  promo: {
    active:    true,
    id:        'saison-seche-2026',
    label:     'Offre saison sèche',
    title:     'Janvier–Février : -10 % sur les circuits du Nord',
    cta:       'Voir les circuits',
    target:    'circuits',
    expiresAt: '2026-02-28',
  },
};
const buildWaURL = (msg) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;

// Tracking unifié des clics WhatsApp.
// Tant que GA4/GTM n'est pas branché par l'agence, on push juste dans
// window.dataLayer et on log en dev. Quand `gtag` arrive, l'event passe
// automatiquement (zéro changement requis).
const trackWa = (source, message) => {
  const payload = {
    event: 'whatsapp_click',
    whatsapp_source: source || 'unknown',
    whatsapp_message_preview: (message || '').slice(0, 80),
    page_route: (window.location.hash || '#/home').replace(/^#\//, '') || 'home',
    ts: new Date().toISOString(),
  };
  (window.dataLayer = window.dataLayer || []).push(payload);
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'whatsapp_click', {
      source: payload.whatsapp_source,
      message_preview: payload.whatsapp_message_preview,
      page_route: payload.page_route,
    });
  }
  if (['localhost','127.0.0.1'].includes(window.location.hostname)) {
    console.log('[trackWa]', payload);
  }
};

Object.assign(window, { SITE, buildWaURL, trackWa });

// ============================================================================
// Logo — clickable home
// ============================================================================
// Pas d'aria-label sur l'<a> : le texte visible "Africa Connection Tours"
// + "Sénégal · Depuis 1996" + l'alt de l'image suffisent comme nom accessible.
// Un aria-label "Africa Connection Tours — Accueil" cassait label-content-name-mismatch
// (le texte visible n'est pas inclus dans le label déclaré).
const Logo = ({ inverted = false, className = '', onClick }) => (
  <a href="#/home" onClick={onClick}
     className={`inline-flex items-center gap-2.5 ${className}`}>
    <img
      src="assets/logo-act.png"
      alt=""
      width="44"
      height="44"
      className="h-10 w-auto md:h-11 select-none"
      draggable={false}
    />
    <div className="leading-tight">
      <div className={`font-display text-[15px] md:text-[18px] whitespace-nowrap ${inverted ? 'text-sand-50' : 'text-ink'}`}>Africa Connection Tours</div>
      <div className={`font-mono text-[9px] uppercase tracking-[0.22em] -mt-0.5 ${inverted ? 'text-sand-300' : 'text-ink-500'}`}>Sénégal · Depuis 1996</div>
    </div>
  </a>
);

// ============================================================================
// StarRow
// role="img" est requis pour qu'aria-label soit valide sur un <div>
// (sans role, axe-core / Lighthouse signalent aria-prohibited-attr).
// ============================================================================
const StarRow = ({ value = 5, max = 5, size = 14, className = '' }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className={`inline-flex items-center gap-[2px] text-ocre ${className}`}
         role="img" aria-label={`${value} / ${max}`}>
      {Array.from({length: max}).map((_, i) => {
        if (i < full) return <Icons.Star key={i} size={size} />;
        if (i === full && half) return <Icons.StarHalf key={i} size={size} />;
        return <Icons.Star key={i} size={size} className="opacity-25" />;
      })}
    </div>
  );
};

// ============================================================================
// Pill
// ============================================================================
const Pill = ({ children, tone = 'sand', className = '' }) => {
  const tones = {
    sand:    'bg-sand-100 text-ink-800',
    terre:   'bg-terre-100 text-terre-700',
    atlant:  'bg-atlantique-100 text-atlantique-700',
    dark:    'bg-ink text-sand-100',
    ghost:   'border border-ink/15 text-ink-700',
    light:   'bg-sand-50/80 backdrop-blur text-ink-800',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide ${tones[tone]||tones.sand} ${className}`}>
      {children}
    </span>
  );
};

// ============================================================================
// Btn — primary / terre / wa / outline / outlineLight / ghost / link
// ============================================================================
const Btn = ({ as:Tag = 'button', variant = 'primary', size = 'md', icon, children, className = '', ...rest }) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 select-none whitespace-nowrap';
  const sizes = { sm:'h-9 px-4 text-[13px]', md:'h-11 px-5 text-[14px]', lg:'h-12 px-6 text-[15px]' };
  const variants = {
    primary:   'bg-ink text-sand-50 hover:bg-ink-700 active:scale-[0.98]',
    terre:     'bg-terre-600 text-sand-50 hover:bg-terre-700 active:scale-[0.98]',
    wa:        'bg-[#1FA855] text-white hover:bg-[#1B924A] active:scale-[0.98]',
    outline:   'border border-ink/20 text-ink hover:bg-ink hover:text-sand-50',
    outlineLight:'border border-sand-100/60 text-sand-50 hover:bg-sand-50 hover:text-ink',
    ghost:     'text-ink hover:bg-ink/5',
    link:      'text-ink hover:text-terre underline underline-offset-4 decoration-1',
  };
  return (
    <Tag className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
      {icon && <span className="-mr-0.5">{icon}</span>}
    </Tag>
  );
};

// ============================================================================
// Price — formats an XOF amount in the active currency
// ============================================================================
const Price = ({ xof, short = false, className = '', as:Tag = 'span' }) => {
  const { formatPrice, shortPrice } = useI18n();
  return <Tag className={className}>{short ? shortPrice(xof) : formatPrice(xof)}</Tag>;
};

// ============================================================================
// Consent + Google Analytics 4 — bloc unique pour garantir que GA4 ne se
// charge JAMAIS avant accord explicite de l'utilisateur (RGPD friendly).
// ============================================================================
const loadGA4 = (id) => {
  if (!id || window.__ga4Loaded) return;
  window.__ga4Loaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', id, {
    anonymize_ip:       true,
    allow_google_signals: false,    // pas de retargeting cross-device
    cookie_flags:       'SameSite=Lax;Secure',
  });
};

const getConsent = () => {
  try { return localStorage.getItem('act_cookie_consent'); } catch { return null; }
};
const setConsent = (value) => {
  try { localStorage.setItem('act_cookie_consent', value); } catch {}
  if (value === 'accepted' && SITE.gaId) loadGA4(SITE.gaId);
};

// Si l'utilisateur a déjà accepté lors d'une visite précédente, on relance GA4
// immédiatement au chargement du site (sans repasser par la bannière).
if (typeof window !== 'undefined') {
  setTimeout(() => {
    if (getConsent() === 'accepted' && SITE.gaId) loadGA4(SITE.gaId);
  }, 0);
}

const CookieConsent = () => {
  const { t } = useI18n();
  const [decision, setDecision] = React.useState(() => getConsent());
  if (decision) return null;
  const accept  = () => { setConsent('accepted'); setDecision('accepted'); };
  const decline = () => { setConsent('declined'); setDecision('declined'); };
  // Couper le titre autour de "titleEm" pour mettre la partie italique en <em>.
  const title = t('cookies.title');
  const em    = t('cookies.titleEm');
  const [before, after] = title.includes(em) ? title.split(em) : [title, ''];
  return (
    <div className="fixed left-3 right-3 md:left-auto md:right-6 md:max-w-sm z-[55]"
         style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="bg-ink text-sand-50 rounded-2xl shadow-2xl shadow-ink/30 p-5 md:p-6 border border-sand-100/15">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-terre-300 mb-2">— {t('cookies.kicker')}</div>
        <div className="font-display text-[19px] md:text-[20px] leading-tight">
          {before}<em>{em}</em>{after}
        </div>
        <p className="mt-2 text-[13px] text-sand-200 leading-relaxed">
          {t('cookies.body')} <a href="#/privacy" className="underline underline-offset-2 hover:text-terre-300">{t('cookies.learnMore')}</a>.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <button onClick={decline} className="px-4 h-9 rounded-full border border-sand-100/30 text-sand-100 text-[12.5px] hover:bg-sand-50/10 transition-colors">{t('cookies.decline')}</button>
          <button onClick={accept}  className="flex-1 px-4 h-9 rounded-full bg-terre-600 text-sand-50 text-[12.5px] font-medium hover:bg-terre-700 transition-colors">{t('cookies.accept')}</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// UpdateNotifier — bannière PWA "Nouvelle version disponible"
//
// Détecte les mises à jour du service worker (voir SW register dans
// index.html). Quand un nouveau SW est prêt et propose des notes de
// version, on affiche une bannière discrète avec les notes traduites
// dans la langue active et deux boutons : "Actualiser" (skip waiting
// + reload) et "Plus tard" (dismiss, réapparaît au prochain check).
//
// Objectif ACT : les utilisateurs qui ont installé la PWA reçoivent une
// notification chaque fois qu'ACT publie du nouveau contenu (nouveau
// circuit, nouvel atelier, etc.).
// ============================================================================
const UpdateNotifier = () => {
  const { lang, t } = useI18n();
  const [update, setUpdate] = React.useState(null);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    // Vérification initiale (au cas où un update est arrivé avant montage)
    if (window.__actUpdate) setUpdate(window.__actUpdate);
    const onUpdate = (e) => setUpdate(e.detail);
    window.addEventListener('act-update-available', onUpdate);
    // Notifier le SW que le composant est prêt à recevoir
    window.__actUpdateReady?.();
    return () => window.removeEventListener('act-update-available', onUpdate);
  }, []);

  if (!update || dismissed) return null;
  const notes = update.notes?.[lang.toLowerCase()] || update.notes?.fr || '';

  const apply = () => {
    // Demande au SW en attente de prendre la main → reload auto
    if (window.__actSwReg?.waiting) {
      window.__actSwReg.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="fixed left-3 right-3 md:left-6 md:right-auto md:max-w-md z-[55]"
         style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="bg-terre-600 text-sand-50 rounded-2xl shadow-2xl shadow-terre/30 p-5 border border-sand-50/15">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-sand-50/15 inline-flex items-center justify-center shrink-0">
            <Icons.RefreshCw size={17}/>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-sand-100 mb-1">
              {t('update.kicker', 'Nouvelle version')}
            </div>
            <div className="font-display text-[17px] leading-snug">{notes}</div>
            <div className="mt-3 flex items-center gap-2">
              <button onClick={()=>setDismissed(true)}
                className="px-3 h-8 rounded-full border border-sand-50/30 text-sand-50 text-[12px] hover:bg-sand-50/10 transition-colors">
                {t('update.later', 'Plus tard')}
              </button>
              <button onClick={apply}
                className="px-4 h-8 rounded-full bg-sand-50 text-terre-700 text-[12px] font-medium hover:bg-sand-100 transition-colors">
                {t('update.refresh', 'Actualiser')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PromoBanner — bandeau d'offre du moment, configurable via SITE.promo
// ============================================================================
const PromoBanner = ({ go, onHeightChange }) => {
  const promo = SITE.promo;
  const [show, setShow] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!promo?.active) return;
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return;
    try {
      if (localStorage.getItem(`act_promo_dismissed_${promo.id}`) === '1') return;
    } catch {}
    setShow(true);
  }, [promo?.active, promo?.id]);

  React.useEffect(() => {
    if (!onHeightChange) return;
    onHeightChange(show && ref.current ? ref.current.offsetHeight : 0);
  }, [show, onHeightChange]);

  if (!show) return null;
  const dismiss = () => {
    try { localStorage.setItem(`act_promo_dismissed_${promo.id}`, '1'); } catch {}
    setShow(false);
  };

  return (
    <div ref={ref}
         className="fixed left-0 right-0 z-[60] bg-terre text-sand-50 shadow-md shadow-terre/20"
         style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      <div className="max-w-[1280px] mx-auto px-3 md:px-8 py-2 md:py-2.5 flex items-center gap-2 md:gap-4 text-[12.5px] md:text-[13px]">
        <span className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.22em] opacity-75 shrink-0">— {promo.label}</span>
        <span className="flex-1 min-w-0 truncate font-medium">{promo.title}</span>
        <button
          onClick={() => { dismiss(); go(promo.target); }}
          className="shrink-0 inline-flex items-center gap-1 px-3 h-7 rounded-full bg-sand-50/15 hover:bg-sand-50/25 text-sand-50 text-[12px] font-medium transition-colors">
          {promo.cta} <Icons.ArrowRight size={12}/>
        </button>
        <button
          onClick={dismiss}
          aria-label="Fermer la promotion"
          className="shrink-0 h-7 w-7 inline-flex items-center justify-center rounded-full hover:bg-sand-50/15 transition-colors">
          <Icons.Close size={14}/>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Header — sticky, route-aware, mobile drawer
// ============================================================================
const Header = ({ route, go, topOffset = 0 }) => {
  const { lang, setLang, ccy, setCcy, t } = useI18n();
  const [open, setOpen]       = React.useState(false);
  const [scrolled, setScroll] = React.useState(false);

  React.useEffect(()=>{
    const onScroll = () => setScroll(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive:true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(()=>{ document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  // Décision ACT (juin 2026) : 3 catégories produits distinctes —
  // Circuits (plusieurs jours) / Excursions (½-journée ou journée) / Croisières
  const nav = [
    { id:'circuits',    label: t('nav.circuits') },
    { id:'excursions',  label: t('nav.excursions') },
    { id:'ateliers',    label: t('nav.ateliers') },
    { id:'croisieres',  label: t('nav.croisieres') },
    { id:'custom',      label: t('nav.bespoke') },
    { id:'mice',        label: t('nav.mice', 'MICE') },
    { id:'about',       label: t('nav.about') },
    { id:'contact',     label: t('nav.contact') },
  ];

  // Hero is dark only on home (transparent top), elsewhere header is light
  const dense   = scrolled || route !== 'home';
  const onLight = dense;

  const handleNav = (e, id) => {
    e.preventDefault();
    setOpen(false);
    go(id);
  };

  return (
    <>
      <header
        style={{ top: `calc(${topOffset}px + env(safe-area-inset-top, 0px))` }}
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          dense ? 'bg-sand-50/90 backdrop-blur-md border-b border-ink/5' : 'bg-transparent'
        }`}
        data-screen-label="Header"
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-16 md:h-[72px] flex items-center justify-between gap-4">
          <Logo inverted={!onLight} onClick={(e)=>{e.preventDefault(); go('home');}} />
          <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
            {nav.map(n => (
              <a key={n.id} href={`#/${n.id}`} onClick={(e)=>handleNav(e, n.id)}
                 aria-current={route===n.id ? 'page' : undefined}
                 className={`px-3 py-2 rounded-full text-[13.5px] transition-colors ${
                   onLight
                     ? (route===n.id ? 'bg-ink text-sand-50' : 'text-ink-700 hover:text-ink hover:bg-ink/5')
                     : (route===n.id ? 'bg-sand-50 text-ink' : 'text-sand-100 hover:text-sand-50 hover:bg-white/10')
                 }`}>
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {/* Sélecteur de devise retiré : décision ACT — aucun prix affiché
                sur le site, tous les circuits sont sur devis. */}
            <div className={`hidden md:flex items-center gap-0.5 rounded-full border ${onLight ? 'border-ink/15 text-ink-700' : 'border-sand-100/30 text-sand-100'} px-1 py-1`}
                 role="group" aria-label={t('common.languageSwitcher')}>
              {LANGS.map(l => (
                <button key={l} onClick={()=>setLang(l)}
                  aria-pressed={lang===l}
                  className={`px-2 py-1 rounded-full text-[11px] font-medium tracking-wider transition ${lang===l ? (onLight ? 'bg-ink text-sand-50' : 'bg-sand-50 text-ink') : ''}`}>{l}</button>
              ))}
            </div>
            <Btn as="a" href={buildWaURL(t('wa.greeting'))}
                 target="_blank" rel="noreferrer"
                 variant="wa" size="sm" className="hidden sm:inline-flex"
                 icon={<Icons.Whatsapp size={16}/>}>
              {t('cta.whatsapp')}
            </Btn>
            <button onClick={()=>setOpen(true)} aria-label={t('common.menu')}
              className={`lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-full ${onLight ? 'text-ink hover:bg-ink/5' : 'text-sand-50 hover:bg-white/10'}`}>
              <Icons.Menu size={22}/>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — inert quand fermé pour empêcher le focus clavier
          d'atteindre les liens/boutons cachés (fix a11y Lighthouse). */}
      <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}
           aria-hidden={!open}
           {...(!open && { inert: '' })}>
        <div onClick={()=>setOpen(false)} className={`absolute inset-0 bg-ink/40 transition-opacity ${open ? 'opacity-100':'opacity-0'}`}/>
        <div className={`absolute right-0 top-0 h-full w-[88%] max-w-[380px] bg-sand-50 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-5 border-b border-ink/5">
            <Logo onClick={(e)=>{e.preventDefault(); setOpen(false); go('home');}} />
            <button onClick={()=>setOpen(false)} aria-label={t('common.close')} className="h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-ink/5">
              <Icons.Close size={22}/>
            </button>
          </div>
          <nav className="p-5 flex flex-col" aria-label="Navigation mobile">
            {nav.map(n => (
              <a key={n.id} href={`#/${n.id}`} onClick={(e)=>handleNav(e, n.id)}
                 aria-current={route===n.id ? 'page' : undefined}
                 className="py-3.5 text-2xl font-display border-b border-ink/5 flex items-center justify-between">
                <span>{n.label}</span>
                <Icons.ArrowUpRight size={18} className="text-ink-400" aria-hidden="true"/>
              </a>
            ))}
            <a href="#/faq" onClick={(e)=>handleNav(e,'faq')}
               aria-current={route==='faq' ? 'page' : undefined}
               className="py-3.5 text-2xl font-display border-b border-ink/5 flex items-center justify-between">
              <span>{t('nav.faq')}</span>
              <Icons.ArrowUpRight size={18} className="text-ink-400" aria-hidden="true"/>
            </a>
          </nav>
          <div className="p-5 mt-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-full border border-ink/15 p-1"
                   role="group" aria-label={t('common.languageSwitcher')}>
                {LANGS.map(l => (
                  <button key={l} onClick={()=>setLang(l)}
                    aria-pressed={lang===l}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${lang===l ? 'bg-ink text-sand-50' : 'text-ink-700'}`}>{l}</button>
                ))}
              </div>
            </div>
            <Btn as="a" href={buildWaURL(t('wa.greetingShort'))} target="_blank" rel="noreferrer"
                 variant="wa" size="md" className="w-full" icon={<Icons.Whatsapp size={16}/>}>
              {t('cta.book')}
            </Btn>
            <div className="text-xs text-ink-500 font-mono pt-2">
              {SITE.phone}<br/>{SITE.email}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================================================
// WhatsApp floating button
// ============================================================================
const WhatsAppFloat = ({ message, bottomOffset = 0 }) => {
  const { t } = useI18n();
  const [hovered, setHovered] = React.useState(false);
  return (
    <a href={buildWaURL(message || t('wa.greeting'))}
       target="_blank" rel="noreferrer"
       aria-label={t('cta.chatOnWhatsapp')}
       onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
       className="fixed right-5 md:right-7 z-30 group"
       style={{ bottom: `calc(${bottomOffset}px + 1.25rem + env(safe-area-inset-bottom, 0px))` }}>
      <div aria-hidden="true" className="absolute -inset-1 rounded-full bg-[#1FA855]/20 animate-ping" style={{animationDuration:'2.4s'}}/>
      <div className="relative flex items-center gap-2.5 bg-[#1FA855] text-white pl-3.5 pr-4 h-12 md:h-14 rounded-full shadow-lg shadow-[#1FA855]/30 transition-all hover:scale-[1.03]">
        <Icons.Whatsapp size={22} aria-hidden="true"/>
        <span className={`hidden md:block text-sm font-medium transition-all ${hovered ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0 overflow-hidden'}`}>
          {t('cta.chatWithUs')}
        </span>
      </div>
    </a>
  );
};

// ============================================================================
// Section helper
// ============================================================================
const Section = ({ id, label, title, kicker, intro, children, className = '', bg, dark = false, container = true, screenLabel }) => (
  <section id={id} data-screen-label={screenLabel || label} className={`relative ${bg || ''} ${className}`}>
    <div className={container ? 'max-w-[1280px] mx-auto px-4 md:px-8' : ''}>
      {(label || title || intro) && (
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
          <div className="max-w-2xl">
            {label && <div className={`font-mono text-[11px] uppercase tracking-[0.22em] mb-3 ${dark ? 'text-terre-300' : 'text-terre'}`}>— {label}</div>}
            {title && <h2 className={`font-display text-[34px] sm:text-[44px] md:text-[56px] leading-[1.02] ${dark ? 'text-sand-50' : 'text-ink'}`}>{title}</h2>}
          </div>
          {(intro || kicker) && (
            <div className={`max-w-md text-[15px] leading-relaxed ${dark ? 'text-sand-200' : 'text-ink-600'}`}>
              {kicker && <div className="font-medium mb-1.5">{kicker}</div>}
              {intro && <p>{intro}</p>}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  </section>
);

// ============================================================================
// CircuitCard — reused on home, catalog, related-tours, blog sidebar
//
// Pattern i18n des données : titre et sous-titre passent par des clés
// `circuit.<id>.title` / `.subtitle` avec fallback sur la valeur FR
// d'origine. Quand les traductions DeepL Pro arrivent (Phase 2), elles
// remplacent automatiquement le fallback sans modification de code.
// ============================================================================
const CircuitCard = ({ c, onOpen, size = 'md' }) => {
  const { t } = useI18n();
  const title    = t(`circuit.${c.id}.title`,    c.title);
  const subtitle = t(`circuit.${c.id}.subtitle`, c.subtitle);
  return (
    <article className="group flex flex-col" data-comment-anchor={`circuit-card-${c.id}`}>
      <button onClick={()=>onOpen(c.id)} className="block w-full text-left">
        <Photo tone={c.tone} mood={c.mood} label={`${c.days}j`} ratio={size==='sm' ? 'aspect-[5/4]' : 'aspect-[4/5]'} className="mb-4 group-hover:scale-[1.01] transition-transform" rounded="rounded-2xl" src={c.img} alt={title}/>
      </button>
      <div className="flex items-center gap-2 mb-2">
        <StarRow value={c.rating} size={12}/>
        <span className="text-[12px] text-ink-500">{c.rating} · {c.reviews} {t('common.reviews')}</span>
      </div>
      <button onClick={()=>onOpen(c.id)} className="text-left">
        <h3 className="font-display text-[22px] md:text-[24px] leading-tight group-hover:text-terre transition-colors">{title}</h3>
        <div className="text-[13px] text-ink-600 mt-1">{subtitle}</div>
      </button>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-[10.5px] text-ink-500 font-mono uppercase tracking-wider">
            {c.priceXOF ? t('common.from') : t('common.priceLabel')}
          </div>
          {c.priceXOF
            ? <Price xof={c.priceXOF} className="font-display text-[20px] md:text-[22px] leading-none"/>
            : <span className="font-display text-[20px] md:text-[22px] leading-none">{t('common.onQuote')}</span>}
        </div>
        <button onClick={()=>onOpen(c.id)} className="h-10 px-4 rounded-full bg-ink text-sand-50 text-[13px] inline-flex items-center gap-1.5 hover:bg-terre transition-colors">
          {t('cta.details')} <Icons.ArrowRight size={14}/>
        </button>
      </div>
    </article>
  );
};

// ============================================================================
// Footer
// ============================================================================
// --- Newsletter subscription (petit composant réutilisable dans le footer) --
const NewsletterForm = () => {
  const { t, lang } = useI18n();
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [status, setStatus] = React.useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = React.useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!/.+@.+\..+/.test(email)) {
      setStatus('error');
      setErrorMsg(t('newsletter.error.email', 'Adresse email invalide.'));
      return;
    }
    setStatus('sending');
    try {
      const r = await window.actSubscribeNewsletter?.({
        email: email.trim(),
        full_name: name.trim() || null,
        language: lang,
        source: 'footer'
      });
      if (r?.error) {
        setStatus('error');
        setErrorMsg(r.error.includes('duplicate') || r.error.includes('unique')
          ? t('newsletter.error.exists', 'Vous êtes déjà abonné à cette newsletter.')
          : t('newsletter.error.generic', 'Envoi impossible. Réessayez plus tard.'));
      } else {
        setStatus('success');
        setEmail(''); setName('');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(t('newsletter.error.generic', 'Envoi impossible. Réessayez plus tard.'));
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-2xl bg-sand-50/10 border border-sand-50/20 p-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-terre-600 text-sand-50 inline-flex items-center justify-center"><Icons.Check size={16}/></div>
          <div>
            <div className="font-display text-[20px] text-sand-50 leading-none">{t('newsletter.success.title', 'Merci !')}</div>
            <div className="text-sand-200 text-[13px] mt-1">{t('newsletter.success.body', 'Vous recevrez nos prochaines actualités par email.')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('newsletter.field.name', 'Votre prénom (optionnel)')}
          className="h-11 rounded-full bg-sand-50/10 border border-sand-100/20 text-sand-50 placeholder-sand-300/70 px-4 text-[14px] outline-none focus:border-terre-300 focus:bg-sand-50/15"
        />
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('newsletter.field.email', 'Votre email')}
          className="h-11 rounded-full bg-sand-50/10 border border-sand-100/20 text-sand-50 placeholder-sand-300/70 px-4 text-[14px] outline-none focus:border-terre-300 focus:bg-sand-50/15"
        />
      </div>
      {errorMsg && (
        <div className="rounded-2xl bg-terre-800/40 border border-terre-300/40 px-4 py-2 text-[12.5px] text-sand-100">
          {errorMsg}
        </div>
      )}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-[11.5px] text-sand-300/80 max-w-xs">
          {t('newsletter.legal', 'Nous respectons votre vie privée. Désabonnement en un clic à tout moment.')}
        </span>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="h-11 px-6 rounded-full bg-sand-50 text-ink hover:bg-sand-100 font-medium text-[14px] inline-flex items-center gap-2 disabled:opacity-60"
        >
          {status === 'sending' ? t('newsletter.sending', 'Envoi…') : t('newsletter.submit', 'S\'abonner')}
          <Icons.ArrowRight size={14}/>
        </button>
      </div>
    </form>
  );
};

const Footer = ({ go }) => {
  const { t } = useI18n();
  // Fallback robuste : si go n'est pas passé (cache stale d'un ancien composant
  // parent), on retombe sur la navigation hash native, qui marche partout.
  const nav = typeof go === 'function' ? go : (target) => { window.location.hash = '#/' + target; };
  const link = (route, label) => (
    <li><a href={`#/${route}`} onClick={(e)=>{e.preventDefault(); nav(route);}} className="hover:text-sand-50">{label}</a></li>
  );
  return (
    <footer className="bg-ink text-sand-100 pt-20 pb-10 mt-24" data-screen-label="Footer">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* CTA tailor-made */}
        <div className="mb-20 rounded-3xl bg-gradient-to-br from-terre to-terre-700 p-8 md:p-14 grid md:grid-cols-[1.4fr,1fr] gap-8 items-end">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-sand-100/80 mb-3">— {t('footer.bespokeKicker')}</div>
            <h3 className="font-display text-[36px] sm:text-[44px] md:text-[56px] leading-[1.02] text-sand-50">
              {t('footer.bespokeTitle')} <em className="text-sand-100">{t('footer.bespokeTitleEm')}</em>
            </h3>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <Btn onClick={()=>nav('custom')} variant="primary" size="lg" className="bg-sand-50 text-ink hover:bg-sand-100" icon={<Icons.ArrowRight size={18}/>}>
              {t('cta.describeTrip')}
            </Btn>
            <span className="text-sand-100/80 text-sm">{t('footer.bespokeNote')}</span>
          </div>
        </div>

        {/* Newsletter — capture email en base Supabase (newsletter_subscribers) */}
        <div className="mb-14 rounded-3xl bg-ink-800/80 border border-sand-100/10 p-6 md:p-10 grid md:grid-cols-[1fr,1.4fr] gap-8 items-center">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre-300 mb-3">— {t('newsletter.kicker', 'Newsletter')}</div>
            <h3 className="font-display text-[28px] md:text-[36px] leading-[1.05] text-sand-50">
              {t('newsletter.title', 'Nos idées de voyage, une fois par mois.')}
            </h3>
            <p className="mt-3 text-sand-200 text-[14px] max-w-md leading-relaxed">
              {t('newsletter.intro', 'Nouveaux itinéraires, coups de cœur culturels, conseils pratiques : nos meilleurs contenus, sans spam.')}
            </p>
          </div>
          <NewsletterForm/>
        </div>

        <div className="grid md:grid-cols-12 gap-10 md:gap-8">
          <div className="md:col-span-4">
            <Logo inverted onClick={(e)=>{e.preventDefault(); nav('home');}}/>
            <p className="mt-5 text-sand-200 text-[14px] leading-relaxed max-w-sm">
              {t('footer.tagline')}
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[
                { I: Icons.Facebook,  l:'Facebook',     href: SITE.facebook },
                { I: Icons.Tiktok,    l:'Twitter / X',  href: SITE.twitter },
                ...(SITE.instagram ? [{ I: Icons.Instagram, l:'Instagram', href: SITE.instagram }] : []),
              ].map(({I,l,href},i)=>(
                <a key={i} href={href} target="_blank" rel="noreferrer" aria-label={l} className="h-10 w-10 rounded-full border border-sand-100/15 inline-flex items-center justify-center hover:bg-sand-50 hover:text-ink transition">
                  <I size={16}/>
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-sand-300 mb-4">{t('footer.exploreLabel')}</div>
            <ul className="space-y-2.5 text-[14px] text-sand-100">
              {link('circuits',   t('footer.allTours'))}
              {link('excursions', t('nav.excursions'))}
              {link('croisieres', t('nav.croisieres'))}
              {link('custom',     t('footer.bespokeTrip'))}
              {link('mice',       t('nav.mice', 'MICE'))}
              {link('blog',       t('footer.blogAdvice'))}
              {link('faq',        t('nav.faq'))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-sand-300 mb-4">{t('footer.agencyLabel')}</div>
            <ul className="space-y-2.5 text-[14px] text-sand-100">
              {link('about',   t('nav.about'))}
              {link('about',   t('footer.guides'))}
              {link('contact', t('nav.contact'))}
              {link('monespace', t('nav.clientArea', 'Espace client'))}
              <li><a href="#" className="hover:text-sand-50">{t('footer.localEngagement')}</a></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-sand-300 mb-4">{t('footer.contactLabel')}</div>
            <ul className="space-y-3 text-[14px] text-sand-100">
              <li className="flex items-start gap-2.5"><Icons.MapPin size={16} className="mt-0.5 text-terre-300 shrink-0"/> {SITE.address} — Sénégal</li>
              <li className="flex items-center gap-2.5"><Icons.Phone size={16} className="text-terre-300"/> {SITE.phone}</li>
              <li className="flex items-center gap-2.5"><Icons.Whatsapp size={16} className="text-terre-300"/> {SITE.whatsappDisplay}</li>
              <li className="flex items-center gap-2.5"><Icons.Mail size={16} className="text-terre-300"/> {SITE.email}</li>
              <li className="flex items-start gap-2.5"><Icons.Clock size={16} className="mt-0.5 text-terre-300 shrink-0"/> {t('footer.openingHours')}</li>
            </ul>
            <div className="mt-5 rounded-2xl overflow-hidden h-32 bg-ink-800 border border-sand-100/10 relative">
              <div className="absolute inset-0 opacity-40" style={{background:'radial-gradient(80% 80% at 30% 50%, #1F5E5A 0%, transparent 70%)'}}/>
              <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <path d="M 30 40 L 380 30 L 390 170 L 20 180 Z" fill="none" stroke="#7BAAA5" strokeWidth="0.5" opacity=".4"/>
                <circle cx="120" cy="100" r="5" fill="#C8593B"/>
                <circle cx="120" cy="100" r="11" fill="none" stroke="#C8593B" strokeWidth="0.8" opacity=".6"/>
              </svg>
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-sand-300">
                <span>{SITE.addressShort}</span>
                <span>{t('footer.sinceTagline').replace(/^Tour[- ]operator |^Tour-opérateur |^Tour operator |^Reiseveranstalter /,'')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-sand-100/10 flex flex-col md:flex-row gap-4 md:items-center md:justify-between text-[12px] text-sand-300">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>{t('footer.copyright')}</span>
            <span className="opacity-50">·</span>
            <span>{t('footer.sinceTagline')}</span>
            <span className="opacity-50">·</span>
            <span>{t('footer.licenseLabel')}</span>
            <span className="opacity-50">·</span>
            <span>NINEA · {SITE.ninea}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#/mentions" className="hover:text-sand-50">{t('footer.legal')}</a>
            <a href="#/cgv"      className="hover:text-sand-50">{t('footer.cgv')}</a>
            <a href="#/privacy"  className="hover:text-sand-50">{t('footer.privacy')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============================================================================
// Generic Page hero (used across catalog / custom / blog list / contact / about / faq)
// ============================================================================
const PageHero = ({ kicker, title, intro, tone='terre', mood='horizon', bgImg, children, dark=true, compact=false }) => (
  <section className={`relative ${compact ? 'min-h-[60svh]' : 'min-h-[68svh]'} flex items-end overflow-hidden`}>
    <div className="absolute inset-0">
      {/* priority : c'est l'image principale de la page (above-the-fold). */}
      <Photo tone={tone} mood={mood} rounded="" showLabel={false} className="h-full w-full" src={bgImg} alt="" priority/>
      <div className="absolute inset-0" style={{background:'linear-gradient(180deg, rgba(26,22,18,0.55) 0%, rgba(26,22,18,0.25) 40%, rgba(26,22,18,0.85) 100%)'}}/>
    </div>
    <div className="relative max-w-[1280px] mx-auto w-full px-4 md:px-8 pt-32 md:pt-40 pb-14 md:pb-20">
      <div className="max-w-3xl">
        {kicker && <div className="font-mono text-[11px] uppercase tracking-[0.22em] mb-4 text-terre-300">— {kicker}</div>}
        <h1 className="font-display text-[40px] sm:text-[60px] md:text-[84px] leading-[0.98] text-sand-50">{title}</h1>
        {intro && <p className="mt-6 max-w-xl text-sand-100/90 text-[15.5px] md:text-[17px] leading-relaxed">{intro}</p>}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </div>
  </section>
);

Object.assign(window, {
  buildWaURL, Logo, StarRow, Pill, Btn, Price,
  PromoBanner, CookieConsent, UpdateNotifier, Header, WhatsAppFloat, Section, Footer, CircuitCard, PageHero,
});

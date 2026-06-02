// Shared components: Logo, Header (router + i18n aware), WhatsAppFloat,
// Footer, StarRow, Pills/Buttons, Section, Price (currency aware).

// Site-wide identité + contact. Change ici, se propage partout.
// Données vérifiées d'Africa Connection Tours (Dakar) — sources : tourism-review,
// piaafrica, thetravelboss, ATA. À valider avec l'agence : email, numéro WhatsApp
// dédié, numéros de licence / RCCM / NINEA (non disponibles en source publique).
const SITE = {
  brand:           'Africa Connection Tours',
  brandShort:      'ACT',
  founded:         1994,
  whatsapp:        '221338495200',         // wa.me digits — à confirmer si un mobile WA dédié existe
  whatsappDisplay: '+221 33 849 52 00',
  phone:           '+221 33 849 52 00',
  phoneAlt:        '+221 33 849 52 83',
  fax:             '+221 33 821 83 26',
  email:           'contact@actours-senegal.com',  // À VALIDER avec l'agence
  address:         '52, rue Félix Faure, BP 11446, Dakar-Peytavin',
  addressShort:    'Dakar-Plateau',
  website:         'actours-senegal.com',
  facebook:        'https://www.facebook.com/AfricaConnectionTours',
  twitter:         'https://twitter.com/actours_senegal',
  instagram:       '',                     // à fournir par l'agence
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
const Logo = ({ inverted = false, className = '', onClick }) => {
  const ink   = inverted ? '#FBF7F0' : '#1A1612';
  const accent= '#C8593B';
  return (
    <a href="#/home" onClick={onClick} className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill={ink} />
        <path d="M5 18 Q 11 13 16 18 T 27 18" stroke="#FBF7F0" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <path d="M5 22 Q 11 17 16 22 T 27 22" stroke={accent} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <circle cx="22" cy="11" r="3" fill={accent}/>
      </svg>
      <div className="leading-tight">
        <div className={`font-display text-[16px] md:text-[19px] whitespace-nowrap ${inverted ? 'text-sand-50' : 'text-ink'}`}>Africa Connection Tours</div>
        <div className={`font-mono text-[9px] uppercase tracking-[0.22em] -mt-0.5 ${inverted ? 'text-sand-300' : 'text-ink-500'}`}>ACT · Dakar</div>
      </div>
    </a>
  );
};

// ============================================================================
// StarRow
// ============================================================================
const StarRow = ({ value = 5, max = 5, size = 14, className = '' }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className={`inline-flex items-center gap-[2px] text-ocre ${className}`} aria-label={`${value} sur ${max}`}>
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
    terre:     'bg-terre text-sand-50 hover:bg-terre-600 active:scale-[0.98]',
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
  const [decision, setDecision] = React.useState(() => getConsent());
  if (decision) return null;
  const accept  = () => { setConsent('accepted'); setDecision('accepted'); };
  const decline = () => { setConsent('declined'); setDecision('declined'); };
  return (
    <div className="fixed left-3 right-3 md:left-auto md:right-6 md:max-w-sm z-[55]"
         style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="bg-ink text-sand-50 rounded-2xl shadow-2xl shadow-ink/30 p-5 md:p-6 border border-sand-100/15">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-terre-300 mb-2">— Cookies</div>
        <div className="font-display text-[19px] md:text-[20px] leading-tight">
          Quelques cookies pour mieux <em>vous servir</em>.
        </div>
        <p className="mt-2 text-[13px] text-sand-200 leading-relaxed">
          Mesure d'audience anonymisée uniquement. Aucun cookie publicitaire. <a href="#/privacy" className="underline underline-offset-2 hover:text-terre-300">En savoir plus</a>.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <button onClick={decline} className="px-4 h-9 rounded-full border border-sand-100/30 text-sand-100 text-[12.5px] hover:bg-sand-50/10 transition-colors">Refuser</button>
          <button onClick={accept}  className="flex-1 px-4 h-9 rounded-full bg-terre text-sand-50 text-[12.5px] font-medium hover:bg-terre-600 transition-colors">Accepter</button>
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

  const nav = [
    { id:'circuits', label: t('nav.circuits') },
    { id:'custom',   label: t('nav.bespoke') },
    { id:'blog',     label: t('nav.blog') },
    { id:'about',    label: t('nav.about') },
    { id:'contact',  label: t('nav.contact') },
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
            <div className={`hidden md:flex items-center gap-1 rounded-full border ${onLight ? 'border-ink/15 text-ink-700' : 'border-sand-100/30 text-sand-100'} px-1 py-1`}>
              {['FR','EN'].map(l => (
                <button key={l} onClick={()=>setLang(l)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wider transition ${lang===l ? (onLight ? 'bg-ink text-sand-50' : 'bg-sand-50 text-ink') : ''}`}>{l}</button>
              ))}
              <span className={`w-px h-4 mx-0.5 ${onLight?'bg-ink/15':'bg-sand-100/30'}`} aria-hidden="true"/>
              <select value={ccy} onChange={(e)=>setCcy(e.target.value)}
                aria-label="Devise d'affichage"
                className={`bg-transparent text-[11px] font-medium tracking-wider px-1 py-1 outline-none cursor-pointer ${onLight?'text-ink-700':'text-sand-100'}`}>
                <option value="XOF">XOF</option><option value="EUR">EUR</option><option value="USD">USD</option>
              </select>
            </div>
            <Btn as="a" href={buildWaURL('Bonjour ACT ! J’aimerais des informations sur vos circuits.')}
                 target="_blank" rel="noreferrer"
                 variant="wa" size="sm" className="hidden sm:inline-flex"
                 icon={<Icons.Whatsapp size={16}/>}>
              {t('cta.whatsapp')}
            </Btn>
            <button onClick={()=>setOpen(true)} aria-label="Menu"
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
            <button onClick={()=>setOpen(false)} aria-label="Fermer" className="h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-ink/5">
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
            <div className="flex items-center gap-2">
              <div className="flex rounded-full border border-ink/15 p-1">
                {['FR','EN'].map(l => (
                  <button key={l} onClick={()=>setLang(l)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${lang===l ? 'bg-ink text-sand-50' : 'text-ink-700'}`}>{l}</button>
                ))}
              </div>
              <select value={ccy} onChange={(e)=>setCcy(e.target.value)}
                aria-label="Devise d'affichage"
                className="rounded-full border border-ink/15 text-xs font-medium px-3 py-2 outline-none">
                <option value="XOF">XOF · FCFA</option>
                <option value="EUR">EUR · €</option>
                <option value="USD">USD · $</option>
              </select>
            </div>
            <Btn as="a" href={buildWaURL('Bonjour ACT !')} target="_blank" rel="noreferrer"
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
  const [hovered, setHovered] = React.useState(false);
  return (
    <a href={buildWaURL(message || 'Bonjour ACT ! J’aimerais des informations.')}
       target="_blank" rel="noreferrer"
       aria-label="Discuter avec nous sur WhatsApp"
       onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
       className="fixed right-5 md:right-7 z-30 group"
       style={{ bottom: `calc(${bottomOffset}px + 1.25rem + env(safe-area-inset-bottom, 0px))` }}>
      <div aria-hidden="true" className="absolute -inset-1 rounded-full bg-[#1FA855]/20 animate-ping" style={{animationDuration:'2.4s'}}/>
      <div className="relative flex items-center gap-2.5 bg-[#1FA855] text-white pl-3.5 pr-4 h-12 md:h-14 rounded-full shadow-lg shadow-[#1FA855]/30 transition-all hover:scale-[1.03]">
        <Icons.Whatsapp size={22} aria-hidden="true"/>
        <span className={`hidden md:block text-sm font-medium transition-all ${hovered ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0 overflow-hidden'}`}>
          Discuter avec nous
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
// ============================================================================
const CircuitCard = ({ c, onOpen, size = 'md' }) => (
  <article className="group flex flex-col" data-comment-anchor={`circuit-card-${c.id}`}>
    <button onClick={()=>onOpen(c.id)} className="block w-full text-left">
      <Photo tone={c.tone} mood={c.mood} label={`${c.days}j`} ratio={size==='sm' ? 'aspect-[5/4]' : 'aspect-[4/5]'} className="mb-4 group-hover:scale-[1.01] transition-transform" rounded="rounded-2xl" src={c.img} alt={c.title}/>
    </button>
    <div className="flex items-center gap-2 mb-2">
      <StarRow value={c.rating} size={12}/>
      <span className="text-[12px] text-ink-500">{c.rating} · {c.reviews} avis</span>
    </div>
    <button onClick={()=>onOpen(c.id)} className="text-left">
      <h3 className="font-display text-[22px] md:text-[24px] leading-tight group-hover:text-terre transition-colors">{c.title}</h3>
      <div className="text-[13px] text-ink-600 mt-1">{c.subtitle}</div>
    </button>
    <div className="mt-4 flex items-end justify-between">
      <div>
        <div className="text-[10.5px] text-ink-500 font-mono uppercase tracking-wider">
          {c.priceXOF ? 'à partir de' : 'tarif'}
        </div>
        {c.priceXOF
          ? <Price xof={c.priceXOF} className="font-display text-[20px] md:text-[22px] leading-none"/>
          : <span className="font-display text-[20px] md:text-[22px] leading-none">Sur devis</span>}
      </div>
      <button onClick={()=>onOpen(c.id)} className="h-10 px-4 rounded-full bg-ink text-sand-50 text-[13px] inline-flex items-center gap-1.5 hover:bg-terre transition-colors">
        Détails <Icons.ArrowRight size={14}/>
      </button>
    </div>
  </article>
);

// ============================================================================
// Footer
// ============================================================================
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
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-sand-100/80 mb-3">— Sur mesure</div>
            <h3 className="font-display text-[36px] sm:text-[44px] md:text-[56px] leading-[1.02] text-sand-50">
              Pas trouvé ce que vous cherchez&nbsp;? <em className="text-sand-100">On vous fait un voyage sur mesure.</em>
            </h3>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <Btn onClick={()=>nav('custom')} variant="primary" size="lg" className="bg-sand-50 text-ink hover:bg-sand-100" icon={<Icons.ArrowRight size={18}/>}>
              Décrire mon voyage
            </Btn>
            <span className="text-sand-100/80 text-sm">Devis en 24h · sans engagement</span>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-10 md:gap-8">
          <div className="md:col-span-4">
            <Logo inverted onClick={(e)=>{e.preventDefault(); nav('home');}}/>
            <p className="mt-5 text-sand-200 text-[14px] leading-relaxed max-w-sm">
              Tour-opérateur réceptif basé à Dakar depuis 1994. Circuits, excursions, séjours sur mesure au Sénégal et en Afrique de l’Ouest — équipe locale, six langues, réseau dans 6 pays.
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
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-sand-300 mb-4">Explorer</div>
            <ul className="space-y-2.5 text-[14px] text-sand-100">
              {link('circuits','Tous les circuits')}
              {link('custom','Voyage sur mesure')}
              {link('blog','Blog & conseils')}
              {link('faq','FAQ')}
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-sand-300 mb-4">Agence</div>
            <ul className="space-y-2.5 text-[14px] text-sand-100">
              {link('about','À propos')}
              {link('about','Nos guides')}
              {link('contact','Contact')}
              <li><a href="#" className="hover:text-sand-50">Engagement local</a></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-sand-300 mb-4">Contact</div>
            <ul className="space-y-3 text-[14px] text-sand-100">
              <li className="flex items-start gap-2.5"><Icons.MapPin size={16} className="mt-0.5 text-terre-300 shrink-0"/> {SITE.address} — Sénégal</li>
              <li className="flex items-center gap-2.5"><Icons.Phone size={16} className="text-terre-300"/> {SITE.phone}</li>
              <li className="flex items-center gap-2.5"><Icons.Whatsapp size={16} className="text-terre-300"/> {SITE.whatsappDisplay}</li>
              <li className="flex items-center gap-2.5"><Icons.Mail size={16} className="text-terre-300"/> {SITE.email}</li>
              <li className="flex items-start gap-2.5"><Icons.Clock size={16} className="mt-0.5 text-terre-300 shrink-0"/> Lun–Ven · 9h–18h (GMT)</li>
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
                <span>Depuis 1994</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-sand-100/10 flex flex-col md:flex-row gap-4 md:items-center md:justify-between text-[12px] text-sand-300">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>© 2026 Africa Connection Tours</span>
            <span className="opacity-50">·</span>
            <span>Tour-opérateur depuis 1994</span>
            <span className="opacity-50">·</span>
            <span className="opacity-70">Licence & NINEA à confirmer</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#/mentions" className="hover:text-sand-50">Mentions légales</a>
            <a href="#/cgv" className="hover:text-sand-50">CGV</a>
            <a href="#/privacy" className="hover:text-sand-50">Confidentialité</a>
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
      <Photo tone={tone} mood={mood} rounded="" showLabel={false} className="h-full w-full" src={bgImg} alt=""/>
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
  PromoBanner, CookieConsent, Header, WhatsAppFloat, Section, Footer, CircuitCard, PageHero,
});

// App: router + i18n provider + page switching.

const AppShell = () => {
  const { route, params, go } = useRouter();
  const [tourId, setTourId] = React.useState(params.id || 'goree-lac-saloum');
  const [articleId, setArticleId] = React.useState(params.id || BLOG[0].id);
  const [catalogFilter, setCatalogFilter] = React.useState(null);
  const [promoHeight, setPromoHeight] = React.useState(0);

  // Keep state in sync with router params
  React.useEffect(() => {
    if (route === 'tour' && params.id) setTourId(params.id);
    if (route === 'blog' && params.id) setArticleId(params.id);
  }, [route, params.id]);

  // Listener global : tout clic sur un lien wa.me passe par trackWa().
  // Source = data-wa-source du lien si défini, sinon route active.
  React.useEffect(() => {
    const onClick = (e) => {
      const link = e.target.closest('a[href*="wa.me"]');
      if (!link) return;
      const href = link.href || '';
      const message = decodeURIComponent((href.split('text=')[1] || '').slice(0, 200));
      const source  = link.dataset.waSource || route || 'unknown';
      window.trackWa?.(source, message);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [route]);

  // Page view virtuelle à chaque changement de route hash. Push dans
  // dataLayer (toujours, même sans consent — c'est juste un tableau JS)
  // ET envoi à gtag SI GA4 est chargé (donc seulement après consent).
  React.useEffect(() => {
    const path  = '/' + (route || 'home') + (params.id ? '/' + params.id : '');
    const title = `ACT — ${route || 'home'}`;
    (window.dataLayer = window.dataLayer || []).push({
      event:      'page_view',
      page_path:  path,
      page_title: title,
    });
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', { page_path: path, page_title: title });
    }
  }, [route, params.id]);

  // Ouverture d'un Tour OU d'une Excursion. Les deux passent par la même
  // fiche détail (mêmes données : days/short/destIds/photos) — la page Tour
  // détecte d'où vient l'id et fallback sur CIRCUIT_DETAIL si excursion.
  const openTour = (id) => { setTourId(id); go('tour', { id }); };
  const openArticle = (id) => { setArticleId(id); go('blog', { id }); };

  // Wrap go() so we can pass a catalog filter (e.g. diaspora)
  const navigate = (target, extra) => {
    if (target === 'circuits') setCatalogFilter(extra || null);
    if (target === 'home')     setCatalogFilter(null);
    go(target);
  };

  // Pre-filled WhatsApp message depends on route
  const waMessage = (() => {
    if (route === 'tour') {
      const c = CIRCUITS.find(c => c.id === tourId);
      return c ? `Bonjour ACT ! Je m’intéresse au circuit "${c.title}". Pouvez-vous me confirmer les disponibilités ?`
               : 'Bonjour ACT !';
    }
    if (route === 'custom')   return 'Bonjour ACT ! Je voudrais composer un voyage sur mesure.';
    if (route === 'contact')  return 'Bonjour ACT ! J’aimerais vous contacter.';
    if (route === 'circuits') return 'Bonjour ACT ! J’ai une question sur vos circuits.';
    return 'Bonjour ACT ! J’aimerais des informations sur vos circuits.';
  })();

  const showPage = () => {
    switch (route) {
      case 'home':     return <Home onOpenTour={openTour} go={navigate}/>;
      case 'tour':     return <Tour tourId={tourId} onBack={()=>navigate('home')} onOpenTour={openTour} go={navigate}/>;
      case 'circuits':   return <Catalog go={navigate} onOpenTour={openTour} initialFilter={catalogFilter}/>;
      case 'excursions': return <Excursions go={navigate} onOpenTour={openTour}/>;
      case 'croisieres': return <Croisieres go={navigate}/>;
      case 'ateliers':   return <Ateliers   go={navigate}/>;
      case 'custom':     return <Custom go={navigate} onOpenTour={openTour}/>;
      case 'blog':
        return params.id
          ? <BlogArticle id={articleId} go={navigate} onOpenArticle={openArticle} onOpenTour={openTour}/>
          : <BlogList go={navigate} onOpenArticle={openArticle} onOpenTour={openTour}/>;
      case 'carnet':   return <CarnetVoyage slug={params.id} go={navigate}/>;
      case 'monespace': return <ClientSpace go={navigate}/>;
      case 'contact':  return <Contact go={navigate}/>;
      case 'about':    return <About   go={navigate}/>;
      case 'faq':      return <Faq     go={navigate}/>;
      case 'mentions': return <Mentions go={navigate}/>;
      case 'privacy':  return <Privacy go={navigate}/>;
      case 'cgv':      return <Cgv     go={navigate}/>;
      default:         return <NotFound go={navigate} route={route}/>;
    }
  };

  // Mobile sticky price bar lives only inside Tour; add extra bottom offset for the WA button there
  const bottomOffset = route === 'tour' ? 72 : 0;

  return (
    <div className="bg-sand-50 text-ink min-h-screen pb-0">
      {/* Skip-to-content : invisible jusqu'au focus clavier — permet aux
          utilisateurs lecteurs d'écran de sauter la navigation. */}
      <a href="#main-content"
         className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-ink focus:text-sand-50 focus:rounded-full focus:text-[13px] focus:font-medium">
        Aller au contenu principal
      </a>
      <PromoBanner go={navigate} onHeightChange={setPromoHeight}/>
      <Header route={route} go={navigate} topOffset={promoHeight}/>
      <div id="main-content">{showPage()}</div>
      <WhatsAppFloat message={waMessage} bottomOffset={bottomOffset}/>
      <CookieConsent/>
      <UpdateNotifier/>
      {/* Tweaks panel — visible en dev (localhost) et à la demande en prod via ?tweaks=1 */}
      {(['localhost','127.0.0.1'].includes(window.location.hostname)
        || window.location.search.includes('tweaks=1')) && <SiteTweaks/>}
    </div>
  );
};

const App = () => (
  <I18nProvider>
    <AppShell/>
  </I18nProvider>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);

// App: router + i18n provider + page switching.

const AppShell = () => {
  const { route, params, go } = useRouter();
  const [tourId, setTourId] = React.useState(params.id || 'goree-lac-saloum');
  const [articleId, setArticleId] = React.useState(params.id || BLOG[0].id);
  const [catalogFilter, setCatalogFilter] = React.useState(null);

  // Keep state in sync with router params
  React.useEffect(() => {
    if (route === 'tour' && params.id) setTourId(params.id);
    if (route === 'blog' && params.id) setArticleId(params.id);
  }, [route, params.id]);

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
      return c ? `Bonjour Téranga ! Je m’intéresse au circuit "${c.title}". Pouvez-vous me confirmer les disponibilités ?`
               : 'Bonjour Téranga !';
    }
    if (route === 'custom')   return 'Bonjour Téranga ! Je voudrais composer un voyage sur mesure.';
    if (route === 'contact')  return 'Bonjour Téranga ! J’aimerais vous contacter.';
    if (route === 'circuits') return 'Bonjour Téranga ! J’ai une question sur vos circuits.';
    return 'Bonjour Téranga ! J’aimerais des informations sur vos circuits.';
  })();

  const showPage = () => {
    switch (route) {
      case 'home':     return <Home onOpenTour={openTour} go={navigate}/>;
      case 'tour':     return <Tour tourId={tourId} onBack={()=>navigate('home')} onOpenTour={openTour} go={navigate}/>;
      case 'circuits': return <Catalog go={navigate} onOpenTour={openTour} initialFilter={catalogFilter}/>;
      case 'custom':   return <Custom go={navigate} onOpenTour={openTour}/>;
      case 'blog':
        return params.id
          ? <BlogArticle id={articleId} go={navigate} onOpenArticle={openArticle} onOpenTour={openTour}/>
          : <BlogList go={navigate} onOpenArticle={openArticle} onOpenTour={openTour}/>;
      case 'contact':  return <Contact go={navigate}/>;
      case 'about':    return <About   go={navigate}/>;
      case 'faq':      return <Faq     go={navigate}/>;
      case 'mentions': return <Mentions go={navigate}/>;
      case 'privacy':  return <Privacy go={navigate}/>;
      case 'cgv':      return <Cgv     go={navigate}/>;
      default:         return <Home onOpenTour={openTour} go={navigate}/>;
    }
  };

  // Mobile sticky price bar lives only inside Tour; add extra bottom offset for the WA button there
  const bottomOffset = route === 'tour' ? 72 : 0;

  return (
    <div className="bg-sand-50 text-ink min-h-screen pb-0">
      <Header route={route} go={navigate}/>
      {showPage()}
      <WhatsAppFloat message={waMessage} bottomOffset={bottomOffset}/>
      <SiteTweaks/>
    </div>
  );
};

const App = () => (
  <I18nProvider>
    <AppShell/>
  </I18nProvider>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);

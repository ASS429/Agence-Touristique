// =====================================================================
// src/admin/app.jsx — root de l'application admin
//
// Point d'entrée : monte la login screen ou le dashboard selon
// l'état d'authentification Supabase.
// =====================================================================

function AdminApp() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Vérifie la session au chargement
    window.sbGetUser().then(u => {
      setUser(u);
      setChecking(false);
    }).catch(() => setChecking(false));

    // Écoute les changements d'auth (logout, refresh token, etc.)
    const { data: sub } = window.sbOnAuthChange((u) => setUser(u));
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  // Redirige vers #/dashboard si aucune section n'est active
  useEffect(() => {
    if (user && !window.location.hash) {
      window.location.hash = '#/dashboard';
    }
  }, [user]);

  const route = window.useHashRoute();

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <Spinner size="lg"/>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginScreen onSuccess={setUser}/>
        <ToastContainer/>
      </>
    );
  }

  const routes = {
    dashboard:    <DashboardPage/>,
    circuits:     <CircuitsPage/>,
    excursions:   <ExcursionsPage/>,
    ateliers:     <AteliersPage/>,
    blog:         <BlogPage/>,
    testimonials: <TestimonialsPage/>,
    team:         <TeamPage/>,
    partners:     <PartnersPage/>,
    faq:          <FAQPage/>,
    media:        <MediaPage/>,
    settings:     <SettingsPage/>,
    contacts:     <ContactsPage/>
  };

  const page = routes[route.section] || <DashboardPage/>;

  return (
    <>
      <AdminShell user={user}>
        {page}
      </AdminShell>
      <ToastContainer/>
      <ConfirmHost/>
    </>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('admin-root'));
root.render(<AdminApp/>);

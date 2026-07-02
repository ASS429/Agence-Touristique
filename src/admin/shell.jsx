// =====================================================================
// src/admin/shell.jsx — layout général du dashboard admin
// (barre latérale + zone principale + hash routing)
// =====================================================================

const ADMIN_SECTIONS = [
  { id: 'dashboard',    label: 'Vue d\'ensemble', icon: '📊', group: 'Général' },
  { id: 'circuits',     label: 'Circuits',        icon: '🗺️', group: 'Catalogue' },
  { id: 'excursions',   label: 'Excursions',      icon: '☀️', group: 'Catalogue' },
  { id: 'ateliers',     label: 'Ateliers',        icon: '🎨', group: 'Catalogue' },
  { id: 'blog',         label: 'Blog',            icon: '✍️', group: 'Contenus' },
  { id: 'testimonials', label: 'Témoignages',     icon: '⭐', group: 'Contenus' },
  { id: 'team',         label: 'Équipe',          icon: '👥', group: 'À propos' },
  { id: 'partners',     label: 'Partenaires',     icon: '🤝', group: 'À propos' },
  { id: 'faq',          label: 'FAQ',             icon: '❓', group: 'À propos' },
  { id: 'media',        label: 'Médiathèque',     icon: '🖼️', group: 'Ressources' },
  { id: 'settings',     label: 'Réglages site',   icon: '⚙️', group: 'Ressources' },
  { id: 'contacts',     label: 'Demandes reçues', icon: '📬', group: 'Général' }
];

function useHashRoute() {
  const parse = () => {
    const h = window.location.hash.replace(/^#\/?/, '');
    const [section, ...rest] = h.split('/');
    return { section: section || 'dashboard', rest };
  };
  const [route, setRoute] = useState(parse());
  useEffect(() => {
    const cb = () => setRoute(parse());
    window.addEventListener('hashchange', cb);
    return () => window.removeEventListener('hashchange', cb);
  }, []);
  return route;
}

function AdminShell({ user, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const route = useHashRoute();

  const grouped = useMemo(() => {
    const g = {};
    for (const s of ADMIN_SECTIONS) {
      (g[s.group] = g[s.group] || []).push(s);
    }
    return g;
  }, []);

  const signOut = async () => {
    if (!(await window.askConfirm('Vous déconnecter du tableau de bord ?', 'Se déconnecter', 'danger'))) return;
    await window.sbSignOut();
    window.location.reload();
  };

  const Sidebar = () => (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} shrink-0 bg-white border-r border-sand-200 flex flex-col transition-all duration-200 ${mobileOpen ? 'fixed inset-y-0 left-0 z-30 shadow-2xl' : 'hidden lg:flex'}`}>
      <div className="p-4 border-b border-sand-200 flex items-center gap-3">
        <img src="../assets/logo-act.png" alt="ACT" className="w-8 h-8 rounded-full flex-shrink-0"/>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-display text-lg text-ink-900 leading-tight">ACT Admin</div>
            <div className="text-xs text-ink-800/50 truncate">{user.email}</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto admin-scroll p-2">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="mb-4">
            {!collapsed && (
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink-800/40">
                {group}
              </div>
            )}
            {items.map(s => {
              const active = route.section === s.id;
              return (
                <a
                  key={s.id}
                  href={`#/${s.id}`}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${active ? 'bg-terra-600 text-white' : 'text-ink-800 hover:bg-sand-100'}`}
                  title={collapsed ? s.label : undefined}
                >
                  <span className="text-base">{s.icon}</span>
                  {!collapsed && <span className="truncate">{s.label}</span>}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-sand-200 space-y-1">
        <a
          href="../"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-800 hover:bg-sand-100"
        >
          <span>🌐</span>
          {!collapsed && <span>Voir le site</span>}
        </a>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-800 hover:bg-sand-100"
        >
          <span>🚪</span>
          {!collapsed && <span>Déconnexion</span>}
        </button>
        <button
          onClick={() => setCollapsed(v => !v)}
          className="hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-800/60 hover:bg-sand-100"
        >
          <span>{collapsed ? '›' : '‹'}</span>
          {!collapsed && <span className="text-xs">Réduire</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-sand-50">
      <Sidebar/>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-ink-900/40 z-20 lg:hidden" onClick={() => setMobileOpen(false)}/>
      )}

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden bg-white border-b border-sand-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="text-2xl">☰</button>
          <div className="font-display text-lg text-ink-900">ACT Admin</div>
        </header>
        <div className="flex-1 overflow-y-auto admin-scroll">
          {children}
        </div>
      </main>
    </div>
  );
}

function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="font-display text-4xl text-ink-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-ink-800/60 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

window.AdminShell = AdminShell;
window.PageHeader = PageHeader;
window.ADMIN_SECTIONS = ADMIN_SECTIONS;
window.useHashRoute = useHashRoute;

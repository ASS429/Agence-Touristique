import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from './icons.jsx';
import { Avatar, Btn, truncate } from './ui.jsx';

// =====================================================================
// src/admin/shell.jsx — Layout général : sidebar sombre + header sticky
//
// Design handoff Claude Design. Sidebar ink-950 collapsible avec
// groupes (Général, Catalogue, Contenus, À propos, Ressources) et
// header sticky (breadcrumb + titre + search + bell + CTA "+ Nouveau").
// =====================================================================

// Sections + icônes (compatibles avec les routes déjà branchées dans app.jsx)
const ADMIN_SECTIONS = [
  { id: 'dashboard',    label: 'Vue d\'ensemble',     icon: 'overview',    group: 'Général' },
  { id: 'contacts',     label: 'Demandes reçues',     icon: 'mail',        group: 'Général' },
  { id: 'marketing',    label: 'Marketing',           icon: 'sparkle',     group: 'Général' },

  { id: 'circuits',     label: 'Circuits',            icon: 'map',         group: 'Catalogue' },
  { id: 'departures',   label: 'Dates de départ',     icon: 'calendar',    group: 'Catalogue' },
  { id: 'excursions',   label: 'Excursions',          icon: 'sun',         group: 'Catalogue' },
  { id: 'ateliers',     label: 'Ateliers',            icon: 'palette',     group: 'Catalogue' },

  { id: 'blog',         label: 'Blog',                icon: 'pen',         group: 'Contenus' },
  { id: 'testimonials', label: 'Témoignages',         icon: 'star',        group: 'Contenus' },
  { id: 'newsletter',   label: 'Newsletter',          icon: 'send',        group: 'Contenus' },

  { id: 'faq',          label: 'FAQ',                 icon: 'help',        group: 'À propos' },

  { id: 'media',        label: 'Médiathèque',         icon: 'image',       group: 'Ressources' },
  { id: 'settings',     label: 'Réglages site',       icon: 'settings',    group: 'Ressources' },

  { id: 'team',         label: 'Administrateurs',     icon: 'users',       group: 'Administration' }
];

// Libellés header (breadcrumb + titre)
const SECTION_TITLES = {
  dashboard:    ['Général',    'Tableau de bord'],
  contacts:     ['Général',    'Demandes reçues'],
  marketing:    ['Général',    'Marketing'],
  circuits:     ['Catalogue',  'Circuits'],
  departures:   ['Catalogue',  'Dates de départ'],
  excursions:   ['Catalogue',  'Excursions'],
  ateliers:     ['Catalogue',  'Ateliers'],
  blog:         ['Contenus',   'Blog'],
  testimonials: ['Contenus',   'Témoignages'],
  newsletter:   ['Contenus',   'Newsletter'],
  faq:          ['À propos',   'FAQ'],
  media:        ['Ressources', 'Médiathèque'],
  settings:     ['Ressources', 'Réglages site'],
  team:         ['Administration', 'Administrateurs']
};

// Contexte CTA "+ Nouveau" par section (le shell déclenche un événement,
// chaque page choisit d'écouter ou d'ignorer).
const CTA_LABELS = {
  circuits:     'Nouveau circuit',
  departures:   'Nouvelle date',
  excursions:   'Nouvelle excursion',
  ateliers:     'Nouvel atelier',
  blog:         'Nouvel article',
  testimonials: 'Nouveau témoignage',
  newsletter:   'Composer une campagne',
  faq:          'Nouvelle question',
  team:         'Ajouter un administrateur'
};

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

// =====================================================================
// Sidebar
// =====================================================================
function AdminSidebar({ user, collapsed, mobileOpen, onCloseMobile, activeSection, newContactsCount }) {
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

  return (
    <aside
      className={`flex-shrink-0 flex flex-col text-sand-200 bg-ink-950 border-r border-white/5 transition-all duration-200 ${
        collapsed ? 'w-[68px]' : 'w-[244px]'
      } ${mobileOpen ? 'fixed inset-y-0 left-0 z-30 shadow-2xl' : 'hidden lg:flex'}`}
    >
      {/* Header : logo + nom agence */}
      <div className="p-4 flex items-center gap-2.5">
        <div className="flex-shrink-0 bg-white rounded-xl p-1.5 shadow-lg">
          <img src="../assets/logo-act.png" alt="ACT" className="block" style={{ height: collapsed ? 22 : 26, width: 'auto' }}/>
        </div>
        {!collapsed && (
          <div className="min-w-0 overflow-hidden">
            <div className="font-display text-[17px] leading-none text-sand-50 whitespace-nowrap">Africa Connection</div>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-sand-200/45 mt-1 truncate">
              Tours · Sénégal
            </div>
          </div>
        )}
      </div>

      {/* Navigation par groupes */}
      <nav className="flex-1 overflow-y-auto act-scroll px-3 pb-2">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="mb-4">
            {!collapsed && (
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-sand-200/40 px-3 pb-2">
                {group}
              </div>
            )}
            {items.map(s => {
              const active = activeSection === s.id;
              const badge = s.id === 'contacts' && newContactsCount > 0 ? newContactsCount : null;
              return (
                <a
                  key={s.id}
                  href={`#/${s.id}`}
                  onClick={() => onCloseMobile?.()}
                  title={collapsed ? s.label : undefined}
                  className={`w-full flex items-center gap-3 h-10 rounded-xl mb-0.5 transition ${
                    collapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    active
                      ? 'bg-terra-600/20 text-terra-300 font-bold'
                      : 'text-sand-200/70 hover:bg-white/[.05] hover:text-sand-50 font-medium'
                  }`}
                >
                  <span className="flex-shrink-0 flex">
                    <Icon name={s.icon} size={19} stroke={1.7}/>
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-[13.5px] truncate">{s.label}</span>
                      {badge && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-terra-600 text-white text-[10.5px] font-bold">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bloc user + actions bas */}
      <div className="p-3 border-t border-white/5">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 pb-3 min-w-0">
            <Avatar name={user.email || 'A'} size={30} variant="terra"/>
            <div className="min-w-0">
              <div className="font-semibold text-[12.5px] text-sand-50 truncate">
                {user.user_metadata?.full_name || 'Administrateur'}
              </div>
              <div className="text-[10.5px] text-sand-200/45 truncate">{user.email}</div>
            </div>
          </div>
        )}
        <a
          href="../"
          target="_blank"
          rel="noreferrer"
          className={`w-full flex items-center gap-3 h-9 rounded-xl px-2.5 transition text-sand-200/60 hover:bg-white/[.05] hover:text-sand-50 text-[12.5px] font-medium ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title={collapsed ? 'Voir le site public' : undefined}
        >
          <span className="flex"><Icon name="externalLink" size={16} stroke={1.7}/></span>
          {!collapsed && <span>Voir le site public</span>}
        </a>
        <button
          onClick={signOut}
          className={`w-full flex items-center gap-3 h-9 rounded-xl px-2.5 transition text-sand-200/60 hover:bg-white/[.05] hover:text-sand-50 text-[12.5px] font-medium ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <span className="flex"><Icon name="logout" size={16} stroke={1.7}/></span>
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}

// =====================================================================
// AdminHeader (sticky)
// =====================================================================
function AdminHeader({ activeSection, onToggleSidebar, onOpenMobileMenu, onSearchInput, searchValue, newContactsCount }) {
  const [group, title] = SECTION_TITLES[activeSection] || ['', ''];
  const ctaLabel = CTA_LABELS[activeSection];

  const triggerCTA = () => {
    // Chaque module écoute son propre événement (opt-in)
    window.dispatchEvent(new CustomEvent('act-admin-cta', { detail: { section: activeSection } }));
  };

  return (
    <header className="flex-shrink-0 h-[70px] px-4 md:px-7 flex items-center gap-4 border-b border-bone-300 bg-sand-50/85 backdrop-blur-md z-20 sticky top-0">
      {/* Bouton mobile menu (< lg) */}
      <button
        onClick={onOpenMobileMenu}
        className="lg:hidden w-9 h-9 rounded-xl border border-bone-400 bg-white text-mute-600 hover:bg-sand-100 flex items-center justify-center transition"
        aria-label="Menu"
      >
        <Icon name="panel" size={18}/>
      </button>

      {/* Bouton toggle sidebar (>= lg) */}
      <button
        onClick={onToggleSidebar}
        className="hidden lg:flex w-9 h-9 rounded-xl border border-bone-400 bg-white text-mute-600 hover:bg-sand-100 items-center justify-center transition flex-shrink-0"
        aria-label="Réduire le menu"
      >
        <Icon name="panel" size={18}/>
      </button>

      {/* Breadcrumb + titre */}
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-mute-400">
          {group ? `${group} · Africa Connection Tours` : 'Africa Connection Tours'}
        </div>
        <h1 className="mt-px font-display text-[25px] leading-none text-ink-800 truncate">
          {title}
        </h1>
      </div>

      {/* Search */}
      <div className="relative flex-shrink-0 hidden md:block">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mute-400 flex">
          <Icon name="search" size={17}/>
        </span>
        <input
          value={searchValue || ''}
          onChange={e => onSearchInput?.(e.target.value)}
          placeholder="Rechercher…"
          className="w-[220px] h-10 pl-9 pr-3.5 rounded-full border border-bone-400 bg-white text-[13.5px] outline-none focus:border-terra-600 focus:ring-[3px] focus:ring-terra-600/12 transition"
        />
      </div>

      {/* Aide — rouvre le guide de prise en main */}
      <button
        aria-label="Guide de prise en main"
        title="Guide de prise en main"
        className="w-10 h-10 rounded-full border border-bone-400 bg-white text-mute-700 hover:bg-sand-100 hover:text-terra-600 flex items-center justify-center transition flex-shrink-0"
        onClick={() => window.dispatchEvent(new CustomEvent('act-open-onboarding'))}
      >
        <Icon name="help" size={18}/>
      </button>

      {/* Bell notification */}
      <button
        aria-label="Notifications"
        className="relative w-10 h-10 rounded-full border border-bone-400 bg-white text-mute-700 hover:bg-sand-100 flex items-center justify-center transition flex-shrink-0"
        onClick={() => { window.location.hash = '#/contacts'; }}
      >
        <Icon name="bell" size={18}/>
        {newContactsCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-terra-600 ring-[1.5px] ring-white"/>
        )}
      </button>

      {/* CTA + Nouveau contextuel */}
      {ctaLabel && (
        <Btn onClick={triggerCTA} icon={<Icon name="plus" size={16} stroke={2}/>} className="hidden md:inline-flex flex-shrink-0">
          <span className="hidden lg:inline">{ctaLabel}</span>
          <span className="lg:hidden">Nouveau</span>
        </Btn>
      )}
    </header>
  );
}

// =====================================================================
// AdminShell (wrapper principal)
// =====================================================================
function AdminShell({ user, children }) {
  const route = useHashRoute();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('act-admin-sidebar-collapsed') === '1';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newContactsCount, setNewContactsCount] = useState(0);

  useEffect(() => {
    localStorage.setItem('act-admin-sidebar-collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  // Compte des demandes nouvelles (rafraîchi toutes les 60s)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { count } = await window.SB
          .from('contact_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new');
        if (!cancelled) setNewContactsCount(count || 0);
      } catch {}
    };
    load();
    const t = setInterval(load, 60000);
    // Recharge aussi quand la route change (utilisateur qui traite une demande)
    const onHash = () => load();
    window.addEventListener('hashchange', onHash);
    return () => { cancelled = true; clearInterval(t); window.removeEventListener('hashchange', onHash); };
  }, []);

  return (
    <div className="flex h-screen bg-sand-50">
      <AdminSidebar
        user={user}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        activeSection={route.section}
        newContactsCount={newContactsCount}
      />

      {mobileOpen && (
        <div className="fixed inset-0 bg-ink-950/40 z-20 lg:hidden" onClick={() => setMobileOpen(false)}/>
      )}

      <main className="flex-1 min-w-0 flex flex-col">
        <AdminHeader
          activeSection={route.section}
          onToggleSidebar={() => setCollapsed(v => !v)}
          onOpenMobileMenu={() => setMobileOpen(true)}
          newContactsCount={newContactsCount}
        />
        <div className="act-scroll flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// =====================================================================
// PageHeader — compatibilité avec les modules CRUD existants
// (rendu léger : le nouveau design met le titre dans le header global,
//  donc PageHeader n'affiche que le subtitle + actions)
// =====================================================================
function PageHeader({ title, subtitle, actions, kicker }) {
  // Pour compatibilité : si titre est fourni et pas de subtitle, on n'affiche
  // qu'un léger bandeau avec sous-titre + actions à droite.
  if (!subtitle && !actions && !kicker) return null;
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        {kicker && <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-400 mb-1">{kicker}</div>}
        {title && <h2 className="font-display text-[24px] leading-tight text-ink-800">{title}</h2>}
        {subtitle && <div className="text-mute-500 text-[13.5px] mt-1">{subtitle}</div>}
      </div>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

window.AdminShell = AdminShell;
window.PageHeader = PageHeader;
window.ADMIN_SECTIONS = ADMIN_SECTIONS;
window.SECTION_TITLES = SECTION_TITLES;
window.CTA_LABELS = CTA_LABELS;
window.useHashRoute = useHashRoute;

export { ADMIN_SECTIONS, AdminShell, CTA_LABELS, PageHeader, SECTION_TITLES, useHashRoute };

// =====================================================================
// src/admin/app.jsx — root de l'application admin (module ES / Vite)
//
// Point d'entrée : monte la login screen ou le dashboard selon
// l'état d'authentification Supabase.
//
// Les imports « side-effect » ci-dessous garantissent que chaque module
// s'exécute (et publie ses helpers sur window pour les rares accès
// window.sb* / window.useHashRoute encore présents). L'ordre reproduit
// celui de l'ancien admin/index.html (fondations → pages).
// =====================================================================
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles-admin.css';

// Fondations (exécution + publication window)
import './supabase.jsx';
import './icons.jsx';
import './ui.jsx';
import './lang.jsx';
import './list-editor.jsx';
import './pdf-devis.jsx';

// Composants utilisés directement ici
import { Spinner, ToastContainer, ConfirmHost } from './ui.jsx';
import { LoginScreen } from './auth.jsx';
import { AdminShell, useHashRoute } from './shell.jsx';
import { DashboardPage } from './dashboard.jsx';
import { CircuitsPage } from './circuits.jsx';
import { DeparturesPage } from './departures.jsx';
import { ExcursionsPage } from './excursions.jsx';
import { AteliersPage } from './ateliers.jsx';
import { BlogPage } from './blog.jsx';
import { TestimonialsPage } from './testimonials.jsx';
import { NewsletterPage } from './newsletter.jsx';
import { FAQPage } from './faq.jsx';
import { MediaPage } from './media.jsx';
import { SettingsPage } from './settings.jsx';
import { ContactsPage } from './contacts.jsx';

function AdminApp() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Vérifie la session au chargement + l'appartenance à admin_users.
    // Une session restaurée d'un compte non-admin est rejetée (fail-closed).
    window.sbGetUser().then(async u => {
      if (u && await window.sbIsAdmin()) {
        setUser(u);
      } else {
        if (u) await window.sbSignOut();  // session client résiduelle : on la ferme
        setUser(null);
      }
      setChecking(false);
    }).catch(() => setChecking(false));

    // Écoute les changements d'auth (logout, refresh token, etc.).
    // On revalide is_admin() à chaque changement de session.
    const { data: sub } = window.sbOnAuthChange(async (u) => {
      if (u && await window.sbIsAdmin()) setUser(u);
      else setUser(null);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  // Redirige vers #/dashboard si aucune section n'est active
  useEffect(() => {
    if (user && !window.location.hash) {
      window.location.hash = '#/dashboard';
    }
  }, [user]);

  const route = useHashRoute();

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
    departures:   <DeparturesPage/>,
    excursions:   <ExcursionsPage/>,
    ateliers:     <AteliersPage/>,
    blog:         <BlogPage/>,
    testimonials: <TestimonialsPage/>,
    newsletter:   <NewsletterPage/>,
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
const root = createRoot(document.getElementById('admin-root'));
root.render(<AdminApp/>);

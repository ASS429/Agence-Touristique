// =====================================================================
// src/admin/dashboard.jsx — page d'accueil avec statistiques
// =====================================================================

function StatCard({ label, value, hint, href, icon }) {
  const Wrap = href ? 'a' : 'div';
  return (
    <Wrap href={href} className="bg-white rounded-2xl border border-sand-200 p-5 flex items-start gap-4 hover:border-terra-600 transition group">
      <div className="w-12 h-12 rounded-full bg-sand-100 flex items-center justify-center text-2xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs uppercase tracking-wider text-ink-800/60">{label}</div>
        <div className="font-display text-3xl text-ink-900 leading-tight">{value}</div>
        {hint && <div className="text-xs text-ink-800/50 mt-1">{hint}</div>}
      </div>
    </Wrap>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const counts = {};
        const tables = ['circuits','excursions','ateliers','blog_posts','testimonials','team_members','partners','faq_items','contact_requests','media_library'];
        await Promise.all(tables.map(async t => {
          const { count } = await window.SB.from(t).select('*', { count: 'exact', head: true });
          counts[t] = count || 0;
        }));
        // Nombre de demandes de contact non traitées
        const { count: newContacts } = await window.SB.from('contact_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new');
        setStats({ ...counts, newContacts });
      } catch (e) {
        window.toast('Erreur au chargement des statistiques : ' + e.message, 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-10">
        <PageHeader title="Vue d'ensemble"/>
        <div className="flex justify-center py-16"><Spinner size="lg"/></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Vue d'ensemble"
        subtitle="Aperçu du contenu et de l'activité du site"
      />

      {stats?.newContacts > 0 && (
        <div className="mb-6 rounded-2xl bg-terra-600/10 border border-terra-600/30 p-4 flex items-center gap-4">
          <div className="text-3xl">📬</div>
          <div className="flex-1">
            <div className="font-semibold text-ink-900">
              {stats.newContacts} nouvelle{stats.newContacts > 1 ? 's' : ''} demande{stats.newContacts > 1 ? 's' : ''}
            </div>
            <div className="text-sm text-ink-800/70">Cliquez pour les consulter</div>
          </div>
          <a href="#/contacts"><Btn>Voir</Btn></a>
        </div>
      )}

      <div className="mb-8">
        <h2 className="font-display text-2xl text-ink-900 mb-4">Catalogue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Circuits" value={stats.circuits} icon="🗺️" href="#/circuits"/>
          <StatCard label="Excursions" value={stats.excursions} icon="☀️" href="#/excursions"/>
          <StatCard label="Ateliers" value={stats.ateliers} icon="🎨" href="#/ateliers"/>
          <StatCard label="Photos" value={stats.media_library} icon="🖼️" href="#/media"/>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-display text-2xl text-ink-900 mb-4">Contenus éditoriaux</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Articles blog" value={stats.blog_posts} icon="✍️" href="#/blog"/>
          <StatCard label="Témoignages" value={stats.testimonials} icon="⭐" href="#/testimonials"/>
          <StatCard label="Équipe" value={stats.team_members} icon="👥" href="#/team"/>
          <StatCard label="Partenaires" value={stats.partners} icon="🤝" href="#/partners"/>
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl text-ink-900 mb-4">Interactions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="FAQ" value={stats.faq_items} icon="❓" href="#/faq"/>
          <StatCard label="Demandes reçues" value={stats.contact_requests} hint={stats.newContacts ? `${stats.newContacts} nouvelles` : 'Aucune nouvelle'} icon="📬" href="#/contacts"/>
        </div>
      </div>

      <div className="mt-10 bg-white rounded-2xl border border-sand-200 p-6">
        <h3 className="font-display text-xl text-ink-900 mb-3">Guide rapide</h3>
        <ul className="text-sm text-ink-800/80 space-y-2 list-disc list-inside">
          <li>Chaque contenu se saisit en <b>français</b> (source), puis se traduit en anglais / italien / allemand via les onglets langues.</li>
          <li>Un contenu en <b>brouillon</b> n'est pas visible sur le site public. Cliquez sur 👁️ pour le publier.</li>
          <li>Les photos se téléversent dans la <a href="#/media" className="text-terra-600 hover:underline">Médiathèque</a> et se réutilisent partout via leur URL.</li>
          <li>Les <b>Réglages site</b> permettent de modifier les infos globales (contact, footer, textes de pages statiques).</li>
        </ul>
      </div>
    </div>
  );
}

window.DashboardPage = DashboardPage;

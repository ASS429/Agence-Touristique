// =====================================================================
// src/admin/newsletter.jsx — Newsletter (4 stats + liste, design refondu)
//
// Phase 2 : gestion des abonnés. Les vraies campagnes (envoi email)
// arriveront en Phase 3 avec Brevo/Mailchimp. En attendant, l'admin
// exporte les abonnés en CSV pour les importer dans l'outil d'emailing.
// =====================================================================

function NewsletterPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [langFilter, setLangFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await window.sbList('newsletter_subscribers', { orderBy: 'created_at', ascending: false });
      setItems(data);
    } catch (e) {
      window.toast('Erreur : ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const filtered = useMemo(() => {
    let f = items;
    if (statusFilter === 'active')       f = f.filter(r => !r.unsubscribed);
    if (statusFilter === 'unsubscribed') f = f.filter(r =>  r.unsubscribed);
    if (langFilter !== 'all') f = f.filter(r => r.language === langFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      f = f.filter(r =>
        r.email?.toLowerCase().includes(q) ||
        r.full_name?.toLowerCase().includes(q)
      );
    }
    return f;
  }, [items, statusFilter, langFilter, query]);

  const toggleUnsub = async (row) => {
    try {
      const patch = row.unsubscribed
        ? { unsubscribed: false, unsubscribed_at: null }
        : { unsubscribed: true,  unsubscribed_at: new Date().toISOString() };
      const updated = await window.sbUpdate('newsletter_subscribers', row.id, patch);
      setItems(list => list.map(r => r.id === row.id ? updated : r));
      window.toast(row.unsubscribed ? 'Réabonné' : 'Désabonné', 'success');
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
  };

  const onDelete = async (row) => {
    if (!(await window.askConfirm(`Supprimer définitivement "${row.email}" ?`, 'Supprimer'))) return;
    try {
      await window.sbDelete('newsletter_subscribers', row.id);
      setItems(list => list.filter(r => r.id !== row.id));
      window.toast('Supprimé', 'success');
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
  };

  const exportCSV = () => {
    if (!filtered.length) {
      window.toast('Aucun abonné à exporter', 'warning');
      return;
    }
    const header = ['Email','Nom','Langue','Source','Abonné le','Désabonné'];
    const rows = filtered.map(r => [
      r.email, r.full_name || '', r.language || '', r.source || '',
      new Date(r.created_at).toISOString().slice(0, 10),
      r.unsubscribed ? 'oui' : 'non'
    ]);
    const csv = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `act-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    window.toast(`${filtered.length} abonné(s) exporté(s)`, 'success');
  };

  // Stats
  const activeSubs = items.filter(r => !r.unsubscribed).length;
  const unsubs = items.length - activeSubs;
  const monthAgo = Date.now() - 30 * 24 * 3600 * 1000;
  const newThisMonth = items.filter(r => new Date(r.created_at).getTime() > monthAgo).length;
  const rateUnsub = items.length ? Math.round((unsubs / items.length) * 100) / 10 : 0;

  const stats = [
    { icon: <Icon name="mail" size={16}/>, label: 'Abonnés actifs',   value: activeSubs, sub: 'total' },
    { icon: <Icon name="arrow" size={16}/>, label: 'Nouveaux (30 j)', value: newThisMonth, delta: newThisMonth > 0 ? `+${newThisMonth}` : '0', deltaVariant: 'up', sub: 'ce mois' },
    { icon: <Icon name="star" size={16}/>, label: 'Taux ouverture',   value: '—', sub: 'à venir Phase 3' },
    { icon: <Icon name="star" size={16}/>, label: 'Désabonnés',       value: `${rateUnsub}%`, sub: `${unsubs} personne${unsubs > 1 ? 's' : ''}` }
  ];

  const langLabel = { fr: '🇫🇷 Français', en: '🇬🇧 English', it: '🇮🇹 Italiano', de: '🇩🇪 Deutsch' };
  const sourceLabel = { footer: 'Footer', popup: 'Popup', contact: 'Contact', manual: 'Manuel' };

  const statusFilters = [
    { id: 'active',       label: 'Actifs',     count: activeSubs },
    { id: 'unsubscribed', label: 'Désabonnés', count: unsubs },
    { id: 'all',          label: 'Tous',       count: items.length }
  ];

  return (
    <PagePad maxWidth="max-w-[1120px]">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {stats.map((s, i) => <KpiCard key={i} {...s}/>)}
      </div>

      {/* Toolbar */}
      <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-400">Abonnés</div>
          <div className="mt-1 font-display text-[23px] text-ink-800">Liste des inscrits</div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Btn variant="secondary" onClick={exportCSV} icon={<Icon name="download" size={14}/>}>Exporter CSV</Btn>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap mb-4">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute-400 flex"><Icon name="search" size={17}/></span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un email ou nom…"
            className="w-[260px] h-10 pl-10 pr-3.5 rounded-full border border-bone-400 bg-white text-[13.5px] outline-none focus:border-terra-600 focus:ring-[3px] focus:ring-terra-600/12 transition"
          />
        </div>
        <FiltersPills filters={statusFilters} active={statusFilter} onSelect={setStatusFilter}/>
        <Select value={langFilter} onChange={e => setLangFilter(e.target.value)} className="max-w-[180px]">
          <option value="all">Toutes langues</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="en">🇬🇧 English</option>
          <option value="it">🇮🇹 Italiano</option>
          <option value="de">🇩🇪 Deutsch</option>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg"/></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Icon name="send" size={28}/>} title="Aucun abonné"/>
      ) : (
        <div className="bg-white border border-bone-200 rounded-2xl overflow-hidden shadow-act-table">
          <div className="grid gap-3.5 px-5 py-3 border-b border-bone-200 bg-sand-75 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-mute-400"
               style={{ gridTemplateColumns: 'minmax(0,2.4fr) 1fr 1fr 1fr 100px' }}>
            <div>Email</div>
            <div>Langue</div>
            <div>Source</div>
            <div>Abonné le</div>
            <div className="text-right">Actions</div>
          </div>
          {filtered.map(row => (
            <div
              key={row.id}
              className="grid gap-3.5 px-5 py-3 border-b border-bone-100 items-center act-table-row"
              style={{ gridTemplateColumns: 'minmax(0,2.4fr) 1fr 1fr 1fr 100px' }}
            >
              <div className="min-w-0">
                <div className="font-semibold text-[14px] text-ink-800 truncate">{row.email}</div>
                <div className="text-[12px] text-mute-500 truncate">{row.full_name || '—'}</div>
              </div>
              <div className="text-[13px] text-mute-700">{langLabel[row.language] || row.language}</div>
              <div><Badge>{sourceLabel[row.source] || row.source}</Badge></div>
              <div className="text-[13px] text-mute-700">{formatDate(row.created_at)}</div>
              <div className="flex items-center gap-1.5 justify-end">
                {row.unsubscribed
                  ? <StatusPill published={false} publishedLabel="Actif" draftLabel="Désabonné"/>
                  : <StatusPill published={true}  publishedLabel="Actif" draftLabel="Désabonné"/>
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Phase 3 */}
      <div className="mt-6 p-4 rounded-2xl bg-info-100 border border-info-600/20 text-[13.5px] text-info-600 flex gap-3">
        <span className="flex-shrink-0"><Icon name="sparkle" size={18}/></span>
        <div>
          <b>Envoi de campagnes</b> — pour envoyer une newsletter, exportez le CSV et importez-le dans votre outil d'emailing (Brevo, Mailchimp, Sendinblue…). L'intégration email directe pourra être ajoutée en Phase 3.
        </div>
      </div>
    </PagePad>
  );
}

window.NewsletterPage = NewsletterPage;

// =====================================================================
// src/admin/newsletter.jsx — Gestion des abonnés à la newsletter
// =====================================================================

function NewsletterPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' | 'unsubscribed' | 'all'

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
    if (langFilter) f = f.filter(r => r.language === langFilter);
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
    } catch (e) {
      window.toast('Erreur : ' + e.message, 'error');
    }
  };

  const onDelete = async (row) => {
    if (!(await window.askConfirm(`Supprimer définitivement l'abonné "${row.email}" ?`, 'Supprimer'))) return;
    try {
      await window.sbDelete('newsletter_subscribers', row.id);
      setItems(list => list.filter(r => r.id !== row.id));
      window.toast('Supprimé', 'success');
    } catch (e) {
      window.toast('Erreur : ' + e.message, 'error');
    }
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

  const langLabel = { fr: '🇫🇷 Français', en: '🇬🇧 English', it: '🇮🇹 Italiano', de: '🇩🇪 Deutsch' };
  const sourceLabel = { footer: 'Footer', popup: 'Popup', contact: 'Contact', manual: 'Manuel' };

  const activeCount = items.filter(r => !r.unsubscribed).length;
  const unsubCount  = items.length - activeCount;

  const columns = [
    { key: 'email', label: 'Email', render: r => (
      <div>
        <div className="font-medium text-ink-900">{r.email}</div>
        <div className="text-xs text-ink-800/50">{r.full_name || '—'}</div>
      </div>
    ) },
    { key: 'language', label: 'Langue', width: '140px', render: r => langLabel[r.language] || r.language },
    { key: 'source', label: 'Source', width: '110px', render: r => <Badge>{sourceLabel[r.source] || r.source}</Badge> },
    { key: 'created_at', label: 'Abonné le', width: '140px', render: r => formatDate(r.created_at) },
    { key: 'unsubscribed', label: 'Statut', width: '130px', render: r =>
        r.unsubscribed
          ? <Badge variant="danger">Désabonné</Badge>
          : <Badge variant="success">Actif</Badge>
    }
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Newsletter"
        subtitle={`${activeCount} abonné${activeCount > 1 ? 's' : ''} actif${activeCount > 1 ? 's' : ''} · ${unsubCount} désabonné${unsubCount > 1 ? 's' : ''}`}
        actions={<Btn variant="secondary" onClick={exportCSV}>📥 Exporter CSV</Btn>}
      />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher…" className="max-w-sm"/>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="max-w-xs">
          <option value="active">Actifs uniquement</option>
          <option value="unsubscribed">Désabonnés</option>
          <option value="all">Tous</option>
        </Select>
        <Select value={langFilter} onChange={e => setLangFilter(e.target.value)} className="max-w-xs">
          <option value="">Toutes les langues</option>
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="it">Italiano</option>
          <option value="de">Deutsch</option>
        </Select>
      </div>

      <ItemsTable
        items={filtered}
        columns={columns}
        onDelete={onDelete}
        onTogglePublish={toggleUnsub}
        loading={loading}
      />

      <div className="mt-6 p-4 rounded-2xl bg-sand-50 border border-sand-200 text-sm text-ink-800/70">
        <b>Note :</b> pour envoyer une newsletter, exportez le CSV et importez-le dans votre outil d'emailing (Brevo, Mailchimp, Sendinblue…). L'intégration email directe pourra être ajoutée en Phase 3.
      </div>
    </div>
  );
}

window.NewsletterPage = NewsletterPage;

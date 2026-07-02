// =====================================================================
// src/admin/contacts.jsx — Demandes reçues (devis + contact)
// =====================================================================

function ContactsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('new');   // 'all'|'new'|'in-progress'|'closed'
  const [viewing, setViewing] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      let q = window.SB.from('contact_requests').select('*').order('created_at', { ascending: false });
      if (filter !== 'all') q = q.eq('status', filter);
      const { data, error } = await q;
      if (error) throw error;
      setItems(data);
    } catch (e) {
      window.toast('Erreur : ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { reload(); }, [reload]);

  const setStatus = async (row, status) => {
    try {
      const { data, error } = await window.SB.from('contact_requests').update({ status }).eq('id', row.id).select().single();
      if (error) throw error;
      setItems(list => list.map(x => x.id === row.id ? data : x));
      window.toast('Statut mis à jour', 'success');
    } catch (e) {
      window.toast('Erreur : ' + e.message, 'error');
    }
  };

  const onDelete = async (row) => {
    if (!(await window.askConfirm('Supprimer cette demande ?', 'Supprimer'))) return;
    try {
      await window.sbDelete('contact_requests', row.id);
      setItems(list => list.filter(x => x.id !== row.id));
      window.toast('Supprimée', 'success');
    } catch (e) {
      window.toast('Erreur : ' + e.message, 'error');
    }
  };

  const statusLabel = { new: 'Nouvelle', 'in-progress': 'En cours', closed: 'Traitée' };
  const statusVariant = { new: 'danger', 'in-progress': 'warning', closed: 'success' };
  const kindLabel = { devis: 'Devis', contact: 'Contact', custom: 'Sur mesure' };

  const columns = [
    { key: 'created_at', label: 'Reçu le', width: '140px', render: r => formatDate(r.created_at) },
    { key: 'kind', label: 'Type', width: '110px', render: r => <Badge>{kindLabel[r.kind] || r.kind}</Badge> },
    { key: 'full_name', label: 'Contact', render: r => (
      <div>
        <div className="font-medium text-ink-900">{r.full_name || '—'}</div>
        <div className="text-xs text-ink-800/50">{r.email || r.phone || '—'}</div>
      </div>
    ) },
    { key: 'circuit_slug', label: 'Circuit', render: r => r.circuit_slug || '—' },
    { key: 'status', label: 'Statut', width: '130px', render: r => <Badge variant={statusVariant[r.status]}>{statusLabel[r.status]}</Badge> }
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Demandes reçues"
        subtitle={`${items.length} demande${items.length > 1 ? 's' : ''} (${filter === 'all' ? 'toutes' : statusLabel[filter]?.toLowerCase()})`}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'new',         label: 'Nouvelles' },
          { id: 'in-progress', label: 'En cours' },
          { id: 'closed',      label: 'Traitées' },
          { id: 'all',         label: 'Toutes' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === f.id ? 'bg-terra-600 text-white' : 'bg-white border border-sand-200 text-ink-800 hover:border-terra-600'}`}
          >{f.label}</button>
        ))}
      </div>

      <ItemsTable
        items={items}
        columns={columns}
        onRowClick={setViewing}
        onDelete={onDelete}
        loading={loading}
      />

      {viewing && (
        <Modal open={true} onClose={() => setViewing(null)} title={`Demande du ${formatDate(viewing.created_at)}`} size="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-xs uppercase text-ink-800/60 mb-1">Nom</div>
              <div className="text-ink-900">{viewing.full_name || '—'}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-ink-800/60 mb-1">Type</div>
              <Badge>{kindLabel[viewing.kind] || viewing.kind}</Badge>
            </div>
            <div>
              <div className="text-xs uppercase text-ink-800/60 mb-1">Email</div>
              <div className="text-ink-900">
                {viewing.email ? <a href={`mailto:${viewing.email}`} className="text-terra-600 hover:underline">{viewing.email}</a> : '—'}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-ink-800/60 mb-1">Téléphone</div>
              <div className="text-ink-900">
                {viewing.phone ? <a href={`tel:${viewing.phone}`} className="text-terra-600 hover:underline">{viewing.phone}</a> : '—'}
              </div>
            </div>
            {viewing.country && <div><div className="text-xs uppercase text-ink-800/60 mb-1">Pays</div><div className="text-ink-900">{viewing.country}</div></div>}
            {viewing.language && <div><div className="text-xs uppercase text-ink-800/60 mb-1">Langue</div><div className="text-ink-900">{viewing.language.toUpperCase()}</div></div>}
            {viewing.circuit_slug && <div><div className="text-xs uppercase text-ink-800/60 mb-1">Circuit</div><div className="text-ink-900">{viewing.circuit_slug}</div></div>}
            {viewing.travelers && <div><div className="text-xs uppercase text-ink-800/60 mb-1">Voyageurs</div><div className="text-ink-900">{viewing.travelers}</div></div>}
            {viewing.travel_start && <div><div className="text-xs uppercase text-ink-800/60 mb-1">Départ</div><div className="text-ink-900">{formatDate(viewing.travel_start)}</div></div>}
            {viewing.travel_end && <div><div className="text-xs uppercase text-ink-800/60 mb-1">Retour</div><div className="text-ink-900">{formatDate(viewing.travel_end)}</div></div>}
            {viewing.budget && <div><div className="text-xs uppercase text-ink-800/60 mb-1">Budget</div><div className="text-ink-900">{viewing.budget}</div></div>}
          </div>

          {viewing.message && (
            <div className="mb-6">
              <div className="text-xs uppercase text-ink-800/60 mb-1">Message</div>
              <div className="bg-sand-50 rounded-xl p-4 whitespace-pre-wrap text-ink-800">{viewing.message}</div>
            </div>
          )}

          {viewing.extra && Object.keys(viewing.extra).length > 0 && (
            <div className="mb-6">
              <div className="text-xs uppercase text-ink-800/60 mb-1">Informations complémentaires</div>
              <pre className="bg-sand-50 rounded-xl p-4 text-xs text-ink-800 overflow-x-auto">{JSON.stringify(viewing.extra, null, 2)}</pre>
            </div>
          )}

          <Field label="Notes internes" className="mb-6">
            <Textarea
              value={viewing.notes || ''}
              onChange={e => setViewing(v => ({ ...v, notes: e.target.value }))}
              rows={3}
              placeholder="Ajoutez des notes internes (traitement, contact effectué, décision…)"
            />
          </Field>

          <div className="flex flex-wrap justify-between items-center gap-2 pt-4 border-t border-sand-200">
            <Select value={viewing.status} onChange={e => setStatus(viewing, e.target.value)} className="max-w-xs">
              <option value="new">Nouvelle</option>
              <option value="in-progress">En cours</option>
              <option value="closed">Traitée</option>
            </Select>
            <div className="flex gap-2">
              <Btn variant="ghost" onClick={() => setViewing(null)}>Fermer</Btn>
              <Btn onClick={async () => {
                await window.SB.from('contact_requests').update({ notes: viewing.notes, status: viewing.status }).eq('id', viewing.id);
                setItems(list => list.map(x => x.id === viewing.id ? { ...x, notes: viewing.notes, status: viewing.status } : x));
                window.toast('Enregistré', 'success');
                setViewing(null);
              }}>Enregistrer les notes</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

window.ContactsPage = ContactsPage;

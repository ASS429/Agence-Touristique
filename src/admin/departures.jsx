// =====================================================================
// src/admin/departures.jsx — CRUD Dates de départ (circuit_departures)
//
// Permet d'ajouter, éditer, supprimer les dates de départ programmées
// pour chaque circuit. Sert de source aux widgets calendriers du site
// public (page fiche circuit).
// =====================================================================

function DeparturesPage() {
  const [items, setItems]         = useState([]);
  const [circuits, setCircuits]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(null);
  const [circuitFilter, setCircuitFilter] = useState('');
  const [timeFilter, setTimeFilter]       = useState('upcoming'); // upcoming | past | all

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [deps, circs] = await Promise.all([
        window.sbList('circuit_departures', { orderBy: 'start_date', ascending: true }),
        window.sbList('circuits', { orderBy: 'title_fr', ascending: true })
      ]);
      setItems(deps);
      setCircuits(circs);
    } catch (e) {
      window.toast('Erreur : ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const circuitMap = useMemo(() => Object.fromEntries(circuits.map(c => [c.id, c])), [circuits]);

  const filtered = useMemo(() => {
    let f = items;
    const today = new Date().toISOString().slice(0, 10);
    if (timeFilter === 'upcoming') f = f.filter(d => d.start_date >= today);
    if (timeFilter === 'past')     f = f.filter(d => d.start_date <  today);
    if (circuitFilter) f = f.filter(d => d.circuit_id === circuitFilter);
    return f;
  }, [items, circuitFilter, timeFilter]);

  const openCreate = () => setEditing({
    circuit_id: circuitFilter || (circuits[0]?.id || ''),
    start_date: '',
    end_date: '',
    capacity: null,
    booked: 0,
    status: 'open',
    price_override: '',
    notes: '',
    published: true
  });

  const onDelete = async (row) => {
    const c = circuitMap[row.circuit_id];
    if (!(await window.askConfirm(`Supprimer le départ du ${row.start_date} (${c?.title_fr || '?'}) ?`, 'Supprimer'))) return;
    try {
      await window.sbDelete('circuit_departures', row.id);
      setItems(list => list.filter(x => x.id !== row.id));
      window.toast('Départ supprimé', 'success');
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
  };

  const statusVar = { open: 'success', confirmed: 'info', full: 'warning', cancelled: 'danger' };
  const statusLabel = { open: 'Ouvert', confirmed: 'Confirmé', full: 'Complet', cancelled: 'Annulé' };

  const columns = [
    { key: 'start_date', label: 'Départ', width: '130px', render: r => formatDate(r.start_date) },
    { key: 'end_date',   label: 'Retour', width: '130px', render: r => r.end_date ? formatDate(r.end_date) : '—' },
    { key: 'circuit',    label: 'Circuit', render: r => {
        const c = circuitMap[r.circuit_id];
        return <div>
          <div className="font-medium text-ink-900">{c?.title_fr || <span className="text-red-600">Circuit supprimé</span>}</div>
          <div className="text-xs text-ink-800/50">{c?.slug || '—'}</div>
        </div>;
    } },
    { key: 'capacity',   label: 'Places', width: '110px', render: r => r.capacity ? `${r.booked || 0}/${r.capacity}` : `${r.booked || 0}/∞` },
    { key: 'status',     label: 'Statut', width: '130px', render: r => <Badge variant={statusVar[r.status]}>{statusLabel[r.status] || r.status}</Badge> },
    { key: 'published',  label: 'Publié', width: '110px', render: r => <StatusPill published={r.published}/> }
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Dates de départ"
        subtitle={`${filtered.length} départ${filtered.length > 1 ? 's' : ''} (${timeFilter === 'upcoming' ? 'à venir' : timeFilter === 'past' ? 'passés' : 'tous'})`}
        actions={<Btn onClick={openCreate}>+ Nouveau départ</Btn>}
      />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select value={timeFilter} onChange={e => setTimeFilter(e.target.value)} className="max-w-xs">
          <option value="upcoming">À venir uniquement</option>
          <option value="past">Passés</option>
          <option value="all">Tous</option>
        </Select>
        <Select value={circuitFilter} onChange={e => setCircuitFilter(e.target.value)} className="max-w-xs">
          <option value="">Tous les circuits</option>
          {circuits.map(c => <option key={c.id} value={c.id}>{c.title_fr}</option>)}
        </Select>
      </div>

      <ItemsTable
        items={filtered}
        columns={columns}
        onRowClick={setEditing}
        onDelete={onDelete}
        onTogglePublish={async row => {
          const updated = await window.sbUpdate('circuit_departures', row.id, { published: !row.published });
          setItems(list => list.map(r => r.id === row.id ? updated : r));
          window.toast(row.published ? 'Dépublié' : 'Publié', 'success');
        }}
        loading={loading}
      />

      {editing && <DepartureEditor dep={editing} circuits={circuits} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }}/>}
    </div>
  );
}

function DepartureEditor({ dep, circuits, onClose, onSaved }) {
  const [form, setForm] = useState(dep);
  const [saving, setSaving] = useState(false);
  const isNew = !dep.id;
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  // Auto-calcule la date de retour si un circuit avec duration_days est sélectionné
  useEffect(() => {
    if (!form.end_date && form.start_date && form.circuit_id) {
      const c = circuits.find(x => x.id === form.circuit_id);
      if (c?.duration_days) {
        const start = new Date(form.start_date);
        start.setDate(start.getDate() + c.duration_days - 1);
        set({ end_date: start.toISOString().slice(0, 10) });
      }
    }
  }, [form.start_date, form.circuit_id]);

  const save = async () => {
    if (!form.circuit_id) { window.toast('Sélectionner un circuit', 'error'); return; }
    if (!form.start_date) { window.toast('Date de départ obligatoire', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.created_at;
      delete payload.updated_at;
      if (isNew) {
        delete payload.id;
        await window.sbInsert('circuit_departures', payload);
        window.toast('Départ créé', 'success');
      } else {
        await window.sbUpdate('circuit_departures', dep.id, payload);
        window.toast('Enregistré', 'success');
      }
      onSaved();
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <EditorLayout
      open={true}
      onClose={onClose}
      title={isNew ? 'Nouveau départ programmé' : 'Éditer un départ'}
      onSave={save}
      saving={saving}
      size="lg"
      footer={<Toggle checked={form.published} onChange={v => set({ published: v })} label={form.published ? 'Publié' : 'Brouillon'}/>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Circuit" required className="sm:col-span-2">
          <Select value={form.circuit_id} onChange={e => set({ circuit_id: e.target.value })}>
            <option value="">— Sélectionner —</option>
            {circuits.map(c => (
              <option key={c.id} value={c.id}>{c.title_fr} {c.duration_days ? `(${c.duration_days}j)` : ''}</option>
            ))}
          </Select>
        </Field>

        <Field label="Date de départ" required>
          <Input type="date" value={form.start_date || ''} onChange={e => set({ start_date: e.target.value })}/>
        </Field>
        <Field label="Date de retour" hint="Calculée automatiquement depuis la durée du circuit">
          <Input type="date" value={form.end_date || ''} onChange={e => set({ end_date: e.target.value })}/>
        </Field>

        <Field label="Places disponibles" hint="Vide = illimité">
          <Input type="number" min="0" value={form.capacity || ''} onChange={e => set({ capacity: e.target.value ? parseInt(e.target.value) : null })}/>
        </Field>
        <Field label="Places déjà réservées">
          <Input type="number" min="0" value={form.booked || 0} onChange={e => set({ booked: parseInt(e.target.value) || 0 })}/>
        </Field>

        <Field label="Statut">
          <Select value={form.status} onChange={e => set({ status: e.target.value })}>
            <option value="open">Ouvert aux réservations</option>
            <option value="confirmed">Départ confirmé</option>
            <option value="full">Complet</option>
            <option value="cancelled">Annulé</option>
          </Select>
        </Field>
        <Field label="Prix indicatif" hint="Vide = 'Sur devis' (recommandé par ACT)">
          <Input value={form.price_override || ''} onChange={e => set({ price_override: e.target.value })} placeholder="ex : 180 000 FCFA / pers"/>
        </Field>

        <Field label="Notes internes" className="sm:col-span-2" hint="Non visible côté public">
          <Textarea value={form.notes || ''} onChange={e => set({ notes: e.target.value })} rows={3}/>
        </Field>
      </div>
    </EditorLayout>
  );
}

window.DeparturesPage = DeparturesPage;

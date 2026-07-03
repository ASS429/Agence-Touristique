// =====================================================================
// src/admin/departures.jsx — CRUD Dates de départ (groupes mois, refondu)
// =====================================================================

function DeparturesPage() {
  const [items, setItems]   = useState([]);
  const [circuits, setCircuits] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(null);
  const [timeFilter, setTimeFilter] = useState('upcoming');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [deps, circs] = await Promise.all([
        window.sbList('circuit_departures', { orderBy: 'start_date', ascending: true }),
        window.sbList('circuits', { orderBy: 'title_fr', ascending: true })
      ]);
      setItems(deps);
      setCircuits(circs);
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const openCreate = () => setEditing({
    circuit_id: circuits[0]?.id || '',
    start_date: '',
    end_date: '',
    capacity: null,
    booked: 0,
    status: 'open',
    price_override: '',
    notes: '',
    published: true
  });

  useEffect(() => {
    const cb = (e) => e.detail.section === 'departures' && openCreate();
    window.addEventListener('act-admin-cta', cb);
    return () => window.removeEventListener('act-admin-cta', cb);
  }, [circuits]);

  const circuitMap = useMemo(() => Object.fromEntries(circuits.map(c => [c.id, c])), [circuits]);

  const filtered = useMemo(() => {
    let f = items;
    const today = new Date().toISOString().slice(0, 10);
    if (timeFilter === 'upcoming') f = f.filter(d => d.start_date >= today);
    if (timeFilter === 'past')     f = f.filter(d => d.start_date <  today);
    return f;
  }, [items, timeFilter]);

  // Groupe par mois (label français)
  const groups = useMemo(() => {
    const g = {};
    for (const d of filtered) {
      const date = new Date(d.start_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      if (!g[key]) g[key] = { label, count: 0, rows: [] };
      g[key].rows.push(d);
      g[key].count++;
    }
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const onDelete = async (row) => {
    const c = circuitMap[row.circuit_id];
    if (!(await window.askConfirm(`Supprimer le départ du ${formatDate(row.start_date)} (${c?.title_fr || '?'}) ?`, 'Supprimer'))) return;
    try {
      await window.sbDelete('circuit_departures', row.id);
      setItems(list => list.filter(x => x.id !== row.id));
      window.toast('Départ supprimé', 'success');
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
  };

  const timeFilters = [
    { id: 'upcoming', label: 'À venir', count: items.filter(d => d.start_date >= new Date().toISOString().slice(0, 10)).length },
    { id: 'past',     label: 'Passés',  count: items.filter(d => d.start_date <  new Date().toISOString().slice(0, 10)).length },
    { id: 'all',      label: 'Tous',    count: items.length }
  ];

  return (
    <PagePad>
      <ListToolbar
        filters={timeFilters}
        activeFilter={timeFilter}
        onFilter={setTimeFilter}
        count={`${filtered.length} départ${filtered.length > 1 ? 's' : ''}`}
        onCreate={openCreate}
        createLabel="Nouvelle date"
      />

      {loading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg"/></div>
      ) : groups.length === 0 ? (
        <EmptyState icon={<Icon name="calendar" size={28}/>} title="Aucun départ programmé"/>
      ) : (
        groups.map(([key, g]) => (
          <div key={key} className="mb-6">
            <div className="flex items-center gap-3.5 mb-3">
              <div className="font-display text-[21px] text-ink-800">
                {g.label.charAt(0).toUpperCase() + g.label.slice(1)}
              </div>
              <div className="flex-1 h-px bg-bone-300"/>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-mute-400">
                {g.count} départ{g.count > 1 ? 's' : ''}
              </div>
            </div>
            <div className="bg-white border border-bone-200 rounded-2xl overflow-hidden shadow-act-card">
              {g.rows.map(dep => (
                <DepartureRow
                  key={dep.id}
                  dep={dep}
                  circuit={circuitMap[dep.circuit_id]}
                  onEdit={() => setEditing(dep)}
                  onDelete={() => onDelete(dep)}
                  onTogglePublish={async () => {
                    const updated = await window.sbUpdate('circuit_departures', dep.id, { published: !dep.published });
                    setItems(list => list.map(x => x.id === dep.id ? updated : x));
                    window.toast(dep.published ? 'Dépublié' : 'Publié', 'success');
                  }}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {editing && <DepartureEditor dep={editing} circuits={circuits} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }}/>}
    </PagePad>
  );
}

function DepartureRow({ dep, circuit, onEdit, onDelete, onTogglePublish }) {
  const d = new Date(dep.start_date);
  const day = String(d.getDate()).padStart(2, '0');
  const dow = d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');

  const capacity = dep.capacity;
  const booked = dep.booked || 0;
  const pct = capacity ? Math.min(100, Math.round((booked / capacity) * 100)) : 0;
  const barColor = pct >= 100 ? '#C0392B' : pct >= 70 ? '#B8801F' : '#2E7D5B';

  const statusMap = {
    open:      { label: 'Ouvert',    color: '#2E7D5B', bg: '#E7F1EB' },
    confirmed: { label: 'Confirmé',  color: '#2F6B7F', bg: '#E6EEF1' },
    full:      { label: 'Complet',   color: '#C0392B', bg: '#FBEDE9' },
    cancelled: { label: 'Annulé',    color: '#7A6F60', bg: '#F5EFE4' }
  };
  const s = statusMap[dep.status] || statusMap.open;

  return (
    <div
      onClick={onEdit}
      className="grid gap-4 px-5 py-3.5 border-b border-bone-100 items-center cursor-pointer act-table-row"
      style={{ gridTemplateColumns: '58px minmax(0,1.7fr) 1fr 1.35fr auto 100px' }}
    >
      {/* Jour + dow */}
      <div className="text-center flex-shrink-0">
        <div className="font-display text-[25px] leading-none text-terra-600">{day}</div>
        <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-mute-400">{dow}</div>
      </div>

      {/* Circuit + durée retour */}
      <div className="min-w-0">
        <div className="font-bold text-[14.5px] text-ink-800 truncate">
          {circuit?.title_fr || <span className="text-danger-600">Circuit supprimé</span>}
        </div>
        <div className="text-[12px] text-mute-500 truncate">
          {circuit?.duration_days ? `${circuit.duration_days} j` : ''}
          {dep.end_date ? ` · retour ${formatDate(dep.end_date).replace(/\s\d{4}/, '')}` : ''}
        </div>
      </div>

      {/* Statut pill */}
      <div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-bold whitespace-nowrap"
              style={{ color: s.color, background: s.bg }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }}/>
          {s.label}
        </span>
      </div>

      {/* Occupancy bar */}
      <div className="min-w-0">
        {capacity ? (
          <>
            <div className="flex items-center justify-between gap-2 text-[11px] mb-1">
              <span className="text-mute-600 font-semibold">{booked}/{capacity} pers.</span>
              <span className="font-bold" style={{ color: barColor }}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-bone-100 overflow-hidden">
              <div className="h-full transition-all" style={{ width: `${pct}%`, background: barColor }}/>
            </div>
          </>
        ) : (
          <div className="text-[12px] text-mute-500 italic">Capacité illimitée</div>
        )}
      </div>

      {/* Prix */}
      <div className="text-right font-display text-[18px] text-ink-800 whitespace-nowrap">
        {dep.price_override || <span className="text-[13px] text-mute-500 italic">Sur devis</span>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
        <ActionBtn variant="success" onClick={onTogglePublish} title={dep.published ? 'Dépublier' : 'Publier'}>
          <Icon name="eye" size={13}/>
        </ActionBtn>
        <ActionBtn variant="danger" onClick={onDelete} title="Supprimer">
          <Icon name="trash" size={13}/>
        </ActionBtn>
      </div>
    </div>
  );
}

function DepartureEditor({ dep, circuits, onClose, onSaved }) {
  const [form, setForm] = useState(dep);
  const [saving, setSaving] = useState(false);
  const isNew = !dep.id;
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

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
      if (isNew) { delete payload.id; await window.sbInsert('circuit_departures', payload); window.toast('Départ créé', 'success'); }
      else { await window.sbUpdate('circuit_departures', dep.id, payload); window.toast('Enregistré', 'success'); }
      onSaved();
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <EditorLayout
      open={true}
      onClose={onClose}
      kicker="Date de départ"
      title={isNew ? 'Nouveau départ programmé' : `Départ du ${formatDate(dep.start_date)}`}
      statusPill={<StatusPill published={form.published}/>}
      size="lg"
      onSave={save}
      saving={saving}
      saveLabel="Enregistrer"
      footerLeft={<Toggle checked={form.published} onChange={v => set({ published: v })} label={form.published ? 'Publié' : 'Brouillon'}/>}
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
        <Field label="Date de retour" hint="Calculée automatiquement">
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
        <Field label="Prix indicatif" hint="Vide = 'Sur devis' (recommandé ACT)">
          <Input value={form.price_override || ''} onChange={e => set({ price_override: e.target.value })} placeholder="ex : 1 850 €"/>
        </Field>

        <Field label="Notes internes" className="sm:col-span-2" hint="Non visible côté public">
          <Textarea value={form.notes || ''} onChange={e => set({ notes: e.target.value })} rows={3}/>
        </Field>
      </div>
    </EditorLayout>
  );
}

window.DeparturesPage = DeparturesPage;

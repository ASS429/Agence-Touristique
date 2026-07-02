// =====================================================================
// src/admin/testimonials.jsx — CRUD Témoignages
// =====================================================================

function TestimonialsPage() {
  const col = useCollection('testimonials');
  const [editing, setEditing] = useState(null);

  const openCreate = () => setEditing({
    author_name: '', author_country: '',
    source: 'internal', text_fr: '',
    rating: 5, travel_date: null,
    published: false, sort_order: 100
  });

  const onDelete = async (row) => {
    if (!(await window.askConfirm(`Supprimer le témoignage de ${row.author_name} ?`, 'Supprimer'))) return;
    await col.remove(row.id);
    window.toast('Témoignage supprimé', 'success');
  };

  const sourceLabel = { tripadvisor: 'TripAdvisor', google: 'Google', internal: 'Interne' };

  const columns = [
    { key: 'author_name', label: 'Client', render: r => (
      <div>
        <div className="font-medium text-ink-900">{r.author_name}</div>
        <div className="text-xs text-ink-800/50">{r.author_country || '—'}</div>
      </div>
    ) },
    { key: 'rating', label: 'Note', width: '110px', render: r => '★'.repeat(r.rating || 0) + '☆'.repeat(5 - (r.rating || 0)) },
    { key: 'source', label: 'Source', width: '120px', render: r => <Badge>{sourceLabel[r.source] || r.source}</Badge> },
    { key: 'text_fr', label: 'Extrait', render: r => truncate(r.text_fr, 60) },
    { key: 'published', label: 'Statut', width: '110px', render: r => <StatusPill published={r.published}/> }
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader title="Témoignages" subtitle={`${col.items.length} témoignage${col.items.length > 1 ? 's' : ''}`}/>
      <ListToolbar query={col.query} onQuery={col.setQuery} onCreate={openCreate} createLabel="Nouveau témoignage"/>
      <ItemsTable
        items={col.filtered}
        columns={columns}
        onRowClick={setEditing}
        onDelete={onDelete}
        onTogglePublish={async row => { await col.togglePublish(row); window.toast(row.published ? 'Dépublié' : 'Publié', 'success'); }}
        loading={col.loading}
      />
      {editing && <TestimonialEditor tm={editing} onClose={() => setEditing(null)} col={col}/>}
    </div>
  );
}

function TestimonialEditor({ tm, onClose, col }) {
  const [form, setForm] = useState(tm);
  const [saving, setSaving] = useState(false);
  const isNew = !tm.id;
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  const save = async () => {
    if (!form.author_name?.trim()) { window.toast('Le nom est obligatoire', 'error'); return; }
    if (!form.text_fr?.trim()) { window.toast('Le texte FR est obligatoire', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.created_at;
      delete payload.updated_at;
      if (isNew) { delete payload.id; await col.create(payload); window.toast('Témoignage créé', 'success'); }
      else { await col.update(tm.id, payload); window.toast('Enregistré', 'success'); }
      onClose();
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <EditorLayout
      open={true}
      onClose={onClose}
      title={isNew ? 'Nouveau témoignage' : `Éditer : ${tm.author_name}`}
      onSave={save}
      saving={saving}
      size="lg"
      footer={<Toggle checked={form.published} onChange={v => set({ published: v })} label={form.published ? 'Publié' : 'Brouillon'}/>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nom du client" required>
          <Input value={form.author_name} onChange={e => set({ author_name: e.target.value })} placeholder="Marie D."/>
        </Field>
        <Field label="Pays d'origine" hint="Peut aider à contextualiser">
          <Input value={form.author_country || ''} onChange={e => set({ author_country: e.target.value })} placeholder="France"/>
        </Field>
        <Field label="Source">
          <Select value={form.source} onChange={e => set({ source: e.target.value })}>
            <option value="internal">Direct / Interne</option>
            <option value="tripadvisor">TripAdvisor</option>
            <option value="google">Google</option>
          </Select>
        </Field>
        <Field label="Note (1-5)">
          <Select value={form.rating || 5} onChange={e => set({ rating: parseInt(e.target.value) })}>
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5-n)} ({n})</option>)}
          </Select>
        </Field>
        <Field label="Date du voyage (approx.)">
          <Input type="date" value={form.travel_date || ''} onChange={e => set({ travel_date: e.target.value || null })}/>
        </Field>
        <Field label="Ordre d'affichage">
          <Input type="number" value={form.sort_order} onChange={e => set({ sort_order: parseInt(e.target.value) || 0 })}/>
        </Field>
      </div>

      <MultilangField label="Texte du témoignage" type="textarea" rows={5} required values={pickLangValues(form, 'text')} onChange={v => set(spreadLangValues('text', v))}/>
    </EditorLayout>
  );
}

window.TestimonialsPage = TestimonialsPage;

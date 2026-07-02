// =====================================================================
// src/admin/excursions.jsx — CRUD Excursions
// =====================================================================

function ExcursionsPage() {
  const col = useCollection('excursions');
  const [editing, setEditing] = useState(null);

  const openCreate = () => setEditing({
    slug: '', title_fr: '', title_en: '', title_it: '', title_de: '',
    short_fr: '', description_fr: '',
    format: 'fullday', start_point: 'dakar', region: '',
    hero_photo: '', highlights: [], includes: [], gallery: [],
    published: false, sort_order: 100
  });

  const onDelete = async (row) => {
    if (!(await window.askConfirm(`Supprimer l'excursion "${row.title_fr}" ?`, 'Supprimer'))) return;
    await col.remove(row.id);
    window.toast('Excursion supprimée', 'success');
  };

  const onDuplicate = async (row) => {
    const { id, created_at, updated_at, ...rest } = row;
    const copy = await col.create({ ...rest, slug: row.slug + '-copie', title_fr: row.title_fr + ' (copie)', published: false });
    setEditing(copy);
  };

  const formatLabel = { halfday: 'Demi-journée', fullday: 'Journée' };
  const startLabel = { dakar: 'Dakar', saly: 'Saly', 'saint-louis': 'Saint-Louis' };

  const columns = [
    { key: 'title_fr', label: 'Titre', render: r => (
      <div>
        <div className="font-medium text-ink-900">{truncate(r.title_fr, 60)}</div>
        <div className="text-xs text-ink-800/50">{r.slug}</div>
      </div>
    ) },
    { key: 'start_point', label: 'Départ', width: '120px', render: r => startLabel[r.start_point] || r.start_point },
    { key: 'format', label: 'Format', width: '120px', render: r => formatLabel[r.format] || r.format },
    { key: 'published', label: 'Statut', width: '110px', render: r => <StatusPill published={r.published}/> },
    { key: 'updated_at', label: 'Modifié', width: '140px', render: r => formatDate(r.updated_at) }
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Excursions"
        subtitle={`${col.items.length} excursion${col.items.length > 1 ? 's' : ''} au catalogue`}
      />
      <ListToolbar
        query={col.query}
        onQuery={col.setQuery}
        onCreate={openCreate}
        createLabel="Nouvelle excursion"
      />
      <ItemsTable
        items={col.filtered}
        columns={columns}
        onRowClick={setEditing}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onTogglePublish={async row => { await col.togglePublish(row); window.toast(row.published ? 'Dépubliée' : 'Publiée', 'success'); }}
        loading={col.loading}
      />
      {editing && <ExcursionEditor excursion={editing} onClose={() => setEditing(null)} col={col}/>}
    </div>
  );
}

function ExcursionEditor({ excursion, onClose, col }) {
  const [form, setForm] = useState(excursion);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('general');
  const isNew = !excursion.id;
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  useEffect(() => {
    if (isNew && form.title_fr && !form.slug) set({ slug: window.slugify(form.title_fr) });
  }, [form.title_fr]);

  const save = async () => {
    if (!form.title_fr?.trim()) { window.toast('Le titre FR est obligatoire', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.created_at;
      delete payload.updated_at;
      if (isNew) { delete payload.id; await col.create(payload); window.toast('Excursion créée', 'success'); }
      else       { await col.update(excursion.id, payload); window.toast('Modifications enregistrées', 'success'); }
      onClose();
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  const TabButton = ({ id, label, count }) => (
    <button onClick={() => setTab(id)}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab === id ? 'border-terra-600 text-terra-700' : 'border-transparent text-ink-800/60 hover:text-ink-800'}`}>
      {label}{count != null && <span className="ml-1.5 text-xs text-ink-800/40">({count})</span>}
    </button>
  );

  return (
    <EditorLayout
      open={true}
      onClose={onClose}
      title={isNew ? 'Nouvelle excursion' : `Éditer : ${excursion.title_fr}`}
      onSave={save}
      saving={saving}
      size="xl"
      footer={<Toggle checked={form.published} onChange={v => set({ published: v })} label={form.published ? 'Publiée' : 'Brouillon'}/>}
    >
      <div className="flex gap-1 border-b border-sand-200">
        <TabButton id="general" label="Général"/>
        <TabButton id="content" label="Contenu"/>
        <TabButton id="highlights" label="Points forts" count={form.highlights?.length}/>
        <TabButton id="includes" label="Inclus" count={form.includes?.length}/>
        <TabButton id="gallery" label="Galerie" count={form.gallery?.length}/>
      </div>

      {tab === 'general' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <Field label="Slug (URL)" required>
            <Input value={form.slug} onChange={e => set({ slug: e.target.value })}/>
          </Field>
          <Field label="Ordre d'affichage">
            <Input type="number" value={form.sort_order} onChange={e => set({ sort_order: parseInt(e.target.value) || 0 })}/>
          </Field>
          <Field label="Format" required>
            <Select value={form.format} onChange={e => set({ format: e.target.value })}>
              <option value="halfday">Demi-journée</option>
              <option value="fullday">Journée complète</option>
            </Select>
          </Field>
          <Field label="Point de départ" required>
            <Select value={form.start_point} onChange={e => set({ start_point: e.target.value })}>
              <option value="dakar">Dakar</option>
              <option value="saly">Saly</option>
              <option value="saint-louis">Saint-Louis</option>
            </Select>
          </Field>
          <Field label="Région / zone">
            <Input value={form.region || ''} onChange={e => set({ region: e.target.value })} placeholder="Petite Côte, Sine Saloum…"/>
          </Field>
          <Field label="Photo de couverture (URL)">
            <Input value={form.hero_photo || ''} onChange={e => set({ hero_photo: e.target.value })}/>
          </Field>
        </div>
      )}

      {tab === 'content' && (
        <div className="space-y-6 pt-4">
          <MultilangField label="Titre" required values={pickLangValues(form, 'title')} onChange={v => set(spreadLangValues('title', v))}/>
          <MultilangField label="Description courte (pour les cartes)" type="textarea" rows={2} values={pickLangValues(form, 'short')} onChange={v => set(spreadLangValues('short', v))}/>
          <MultilangField label="Description complète" type="textarea" rows={6} values={pickLangValues(form, 'description')} onChange={v => set(spreadLangValues('description', v))}/>
        </div>
      )}

      {tab === 'highlights' && (
        <MultilangListEditor value={form.highlights || []} onChange={v => set({ highlights: v })} singular="point fort" plural="points forts"/>
      )}

      {tab === 'includes' && (
        <MultilangListEditor value={form.includes || []} onChange={v => set({ includes: v })} singular="inclus" plural="inclus"/>
      )}

      {tab === 'gallery' && (
        <GalleryEditor value={form.gallery || []} onChange={v => set({ gallery: v })}/>
      )}
    </EditorLayout>
  );
}

window.ExcursionsPage = ExcursionsPage;

// =====================================================================
// src/admin/ateliers.jsx — CRUD Ateliers
// =====================================================================

function AteliersPage() {
  const col = useCollection('ateliers');
  const [editing, setEditing] = useState(null);

  const openCreate = () => setEditing({
    slug: '', title_fr: '', title_en: '', title_it: '', title_de: '',
    subtitle_fr: '', short_fr: '', description_fr: '',
    category: 'artisanat', hero_photo: '', gallery: [],
    published: false, sort_order: 100
  });

  const onDelete = async (row) => {
    if (!(await window.askConfirm(`Supprimer l'atelier "${row.title_fr}" ?`, 'Supprimer'))) return;
    await col.remove(row.id);
    window.toast('Atelier supprimé', 'success');
  };

  const catLabel = { artisanat: 'Artisanat', musique: 'Musique', danse: 'Danse' };

  const columns = [
    { key: 'title_fr', label: 'Titre', render: r => (
      <div>
        <div className="font-medium text-ink-900">{r.title_fr}</div>
        <div className="text-xs text-ink-800/50">{r.slug}</div>
      </div>
    ) },
    { key: 'category', label: 'Catégorie', width: '140px', render: r => <Badge>{catLabel[r.category] || r.category}</Badge> },
    { key: 'published', label: 'Statut', width: '110px', render: r => <StatusPill published={r.published}/> },
    { key: 'updated_at', label: 'Modifié', width: '140px', render: r => formatDate(r.updated_at) }
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader title="Ateliers" subtitle={`${col.items.length} atelier${col.items.length > 1 ? 's' : ''}`}/>
      <ListToolbar query={col.query} onQuery={col.setQuery} onCreate={openCreate} createLabel="Nouvel atelier"/>
      <ItemsTable
        items={col.filtered}
        columns={columns}
        onRowClick={setEditing}
        onDelete={onDelete}
        onTogglePublish={async row => { await col.togglePublish(row); window.toast(row.published ? 'Dépublié' : 'Publié', 'success'); }}
        loading={col.loading}
      />
      {editing && <AtelierEditor atelier={editing} onClose={() => setEditing(null)} col={col}/>}
    </div>
  );
}

function AtelierEditor({ atelier, onClose, col }) {
  const [form, setForm] = useState(atelier);
  const [saving, setSaving] = useState(false);
  const isNew = !atelier.id;
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
      if (isNew) { delete payload.id; await col.create(payload); window.toast('Atelier créé', 'success'); }
      else { await col.update(atelier.id, payload); window.toast('Enregistré', 'success'); }
      onClose();
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <EditorLayout
      open={true}
      onClose={onClose}
      title={isNew ? 'Nouvel atelier' : `Éditer : ${atelier.title_fr}`}
      onSave={save}
      saving={saving}
      size="lg"
      footer={<Toggle checked={form.published} onChange={v => set({ published: v })} label={form.published ? 'Publié' : 'Brouillon'}/>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Slug" required>
          <Input value={form.slug} onChange={e => set({ slug: e.target.value })}/>
        </Field>
        <Field label="Catégorie" required>
          <Select value={form.category} onChange={e => set({ category: e.target.value })}>
            <option value="artisanat">Artisanat</option>
            <option value="musique">Musique</option>
            <option value="danse">Danse</option>
          </Select>
        </Field>
        <Field label="Ordre">
          <Input type="number" value={form.sort_order} onChange={e => set({ sort_order: parseInt(e.target.value) || 0 })}/>
        </Field>
        <Field label="Photo (URL)">
          <Input value={form.hero_photo || ''} onChange={e => set({ hero_photo: e.target.value })}/>
        </Field>
      </div>

      <MultilangField label="Titre" required values={pickLangValues(form, 'title')} onChange={v => set(spreadLangValues('title', v))}/>
      <MultilangField label="Sous-titre" values={pickLangValues(form, 'subtitle')} onChange={v => set(spreadLangValues('subtitle', v))}/>
      <MultilangField label="Description courte" type="textarea" rows={2} values={pickLangValues(form, 'short')} onChange={v => set(spreadLangValues('short', v))}/>
      <MultilangField label="Description complète" type="textarea" rows={5} values={pickLangValues(form, 'description')} onChange={v => set(spreadLangValues('description', v))}/>
    </EditorLayout>
  );
}

window.AteliersPage = AteliersPage;

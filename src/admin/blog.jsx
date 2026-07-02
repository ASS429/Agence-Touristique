// =====================================================================
// src/admin/blog.jsx — CRUD Blog articles
// =====================================================================

function BlogPage() {
  const col = useCollection('blog_posts', { orderBy: 'created_at', ascending: false });
  const [editing, setEditing] = useState(null);

  const openCreate = () => setEditing({
    slug: '', title_fr: '', excerpt_fr: '', content_fr: '',
    author: 'Africa Connection Tours',
    tags: [], hero_photo: '', published_at: null,
    published: false, sort_order: 100
  });

  const onDelete = async (row) => {
    if (!(await window.askConfirm(`Supprimer l'article "${row.title_fr}" ?`, 'Supprimer'))) return;
    await col.remove(row.id);
    window.toast('Article supprimé', 'success');
  };

  const columns = [
    { key: 'title_fr', label: 'Titre', render: r => (
      <div>
        <div className="font-medium text-ink-900">{truncate(r.title_fr, 60)}</div>
        <div className="text-xs text-ink-800/50">{r.tags?.length ? r.tags.join(' · ') : r.slug}</div>
      </div>
    ) },
    { key: 'author', label: 'Auteur', width: '160px', render: r => r.author || '—' },
    { key: 'published_at', label: 'Publié le', width: '140px', render: r => formatDate(r.published_at) },
    { key: 'published', label: 'Statut', width: '110px', render: r => <StatusPill published={r.published}/> }
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader title="Blog" subtitle={`${col.items.length} article${col.items.length > 1 ? 's' : ''}`}/>
      <ListToolbar query={col.query} onQuery={col.setQuery} onCreate={openCreate} createLabel="Nouvel article"/>
      <ItemsTable
        items={col.filtered}
        columns={columns}
        onRowClick={setEditing}
        onDelete={onDelete}
        onTogglePublish={async row => {
          const patch = { published: !row.published };
          if (!row.published && !row.published_at) patch.published_at = new Date().toISOString();
          await col.update(row.id, patch);
          window.toast(row.published ? 'Dépublié' : 'Publié', 'success');
        }}
        loading={col.loading}
      />
      {editing && <BlogEditor post={editing} onClose={() => setEditing(null)} col={col}/>}
    </div>
  );
}

function BlogEditor({ post, onClose, col }) {
  const [form, setForm] = useState(post);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('meta');
  const isNew = !post.id;
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
      if (form.published && !form.published_at) payload.published_at = new Date().toISOString();
      if (isNew) { delete payload.id; await col.create(payload); window.toast('Article créé', 'success'); }
      else { await col.update(post.id, payload); window.toast('Enregistré', 'success'); }
      onClose();
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  const TabButton = ({ id, label }) => (
    <button onClick={() => setTab(id)}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab === id ? 'border-terra-600 text-terra-700' : 'border-transparent text-ink-800/60 hover:text-ink-800'}`}>{label}</button>
  );

  return (
    <EditorLayout
      open={true}
      onClose={onClose}
      title={isNew ? 'Nouvel article' : `Éditer : ${post.title_fr}`}
      onSave={save}
      saving={saving}
      size="xl"
      footer={<Toggle checked={form.published} onChange={v => set({ published: v })} label={form.published ? 'Publié' : 'Brouillon'}/>}
    >
      <div className="flex gap-1 border-b border-sand-200">
        <TabButton id="meta" label="Métadonnées"/>
        <TabButton id="content" label="Contenu"/>
      </div>

      {tab === 'meta' && (
        <div className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Slug (URL)" required>
              <Input value={form.slug} onChange={e => set({ slug: e.target.value })}/>
            </Field>
            <Field label="Auteur">
              <Input value={form.author || ''} onChange={e => set({ author: e.target.value })}/>
            </Field>
            <Field label="Photo de couverture (URL)" className="sm:col-span-2">
              <Input value={form.hero_photo || ''} onChange={e => set({ hero_photo: e.target.value })}/>
            </Field>
            <Field label="Date de publication" hint="Si vide, sera fixée à la publication">
              <Input type="datetime-local"
                     value={form.published_at ? form.published_at.slice(0, 16) : ''}
                     onChange={e => set({ published_at: e.target.value ? new Date(e.target.value).toISOString() : null })}/>
            </Field>
            <Field label="Tags (séparés par des virgules)">
              <Input
                value={(form.tags || []).join(', ')}
                onChange={e => set({ tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="dakar, culture, gastronomie"
              />
            </Field>
          </div>
        </div>
      )}

      {tab === 'content' && (
        <div className="pt-4 space-y-6">
          <MultilangField label="Titre" required values={pickLangValues(form, 'title')} onChange={v => set(spreadLangValues('title', v))}/>
          <MultilangField label="Résumé (extrait)" type="textarea" rows={3} values={pickLangValues(form, 'excerpt')} onChange={v => set(spreadLangValues('excerpt', v))}/>
          <MultilangField label="Contenu (Markdown accepté)" type="textarea" rows={14} values={pickLangValues(form, 'content')} onChange={v => set(spreadLangValues('content', v))} hint="Utilisez **gras**, *italique*, [liens](url), listes avec -, titres avec ##."/>
        </div>
      )}
    </EditorLayout>
  );
}

window.BlogPage = BlogPage;

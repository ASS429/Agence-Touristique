// =====================================================================
// src/admin/blog.jsx — CRUD Blog (cards horizontales, design refondu)
// =====================================================================

function BlogPage() {
  const col = useCollection('blog_posts', { orderBy: 'created_at', ascending: false });
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');

  const openCreate = () => setEditing({
    slug: '', title_fr: '', excerpt_fr: '', content_fr: '',
    author: 'Africa Connection Tours',
    tags: [], hero_photo: '', published_at: null,
    published: false, sort_order: 100
  });

  useEffect(() => {
    const cb = (e) => e.detail.section === 'blog' && openCreate();
    window.addEventListener('act-admin-cta', cb);
    return () => window.removeEventListener('act-admin-cta', cb);
  }, []);

  const onDelete = async (row) => {
    if (!(await window.askConfirm(`Supprimer l'article "${row.title_fr}" ?`, 'Supprimer'))) return;
    await col.remove(row.id);
    window.toast('Article supprimé', 'success');
  };

  const filtered = useMemo(() => {
    let f = col.filtered;
    if (filter === 'published') f = f.filter(r =>  r.published);
    if (filter === 'draft')     f = f.filter(r => !r.published);
    return f;
  }, [col.filtered, filter]);

  const filters = [
    { id: 'all',       label: 'Tous',      count: col.items.length },
    { id: 'published', label: 'Publiés',   count: col.items.filter(r => r.published).length },
    { id: 'draft',     label: 'Brouillons',count: col.items.filter(r => !r.published).length }
  ];

  return (
    <PagePad maxWidth="max-w-[1080px]">
      <ListToolbar
        query={col.query}
        onQuery={col.setQuery}
        filters={filters}
        activeFilter={filter}
        onFilter={setFilter}
        count={`${col.items.length} article${col.items.length > 1 ? 's' : ''}`}
        onCreate={openCreate}
        createLabel="Nouvel article"
      />

      {col.loading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg"/></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Icon name="pen" size={28}/>} title="Aucun article"/>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(post => (
            <div
              key={post.id}
              onClick={() => setEditing(post)}
              className="flex gap-4 bg-white border border-bone-200 rounded-2xl p-3.5 shadow-act-card hover:border-bone-500 cursor-pointer transition"
            >
              <div className="w-[150px] h-[94px] rounded-xl flex-shrink-0 overflow-hidden border border-bone-300">
                {post.hero_photo
                  ? <img src={post.hero_photo} alt={post.title_fr} className="w-full h-full object-cover"/>
                  : <div className="w-full h-full act-hero-ph"/>
                }
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center gap-2.5 justify-between">
                  {post.tags?.[0] && <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-info-600">{post.tags[0]}</span>}
                  <StatusPill published={post.published}/>
                </div>
                <div className="mt-1.5 font-display text-[20px] leading-tight text-ink-800">
                  {truncate(post.title_fr, 100)}
                </div>
                <div className="flex-1"/>
                <div className="mt-2 flex items-center gap-3 text-mute-500 text-[12.5px] flex-wrap">
                  <span>Par {post.author || '—'}</span>
                  <span>·</span>
                  <span>{formatDate(post.published_at || post.created_at)}</span>
                  <div className="flex-1"/>
                  <LangDots row={post} field="title"/>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 justify-center flex-shrink-0" onClick={e => e.stopPropagation()}>
                <ActionBtn variant="info" onClick={() => setEditing(post)} title="Modifier"><Icon name="pen" size={14}/></ActionBtn>
                <ActionBtn variant="danger" onClick={() => onDelete(post)} title="Supprimer"><Icon name="trash" size={14}/></ActionBtn>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <BlogEditor post={editing} onClose={() => setEditing(null)} col={col}/>}
    </PagePad>
  );
}

function BlogEditor({ post, onClose, col }) {
  const [form, setForm] = useState(post);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('contenu');
  const isNew = !post.id;
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  useEffect(() => {
    if (isNew && form.title_fr && !form.slug) set({ slug: window.slugify(form.title_fr) });
  }, [form.title_fr]);

  const doSave = async (publish) => {
    if (!form.title_fr?.trim()) { window.toast('Le titre FR est obligatoire', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (publish !== undefined) payload.published = publish;
      delete payload.created_at;
      delete payload.updated_at;
      if (payload.published && !payload.published_at) payload.published_at = new Date().toISOString();
      if (isNew) { delete payload.id; await col.create(payload); window.toast('Article créé', 'success'); }
      else { await col.update(post.id, payload); window.toast('Enregistré', 'success'); }
      onClose();
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  const tabs = [
    { id: 'meta',    label: 'Métadonnées' },
    { id: 'contenu', label: 'Contenu' }
  ];

  return (
    <EditorLayout
      open={true}
      onClose={onClose}
      kicker={`Édition article · /${form.slug || 'nouveau'}`}
      title={isNew ? 'Nouvel article' : form.title_fr}
      statusPill={<StatusPill published={form.published}/>}
      size="xl"
      tabs={tabs}
      activeTab={tab}
      onSelectTab={setTab}
      onSave={() => doSave(true)}
      onSaveDraft={() => doSave(false)}
      saving={saving}
      publishLabel="Publier l'article"
      footerLeft={post.updated_at && <><Icon name="clock" size={13}/> {timeAgo(post.updated_at)}</>}
    >
      {tab === 'meta' && (
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
      )}

      {tab === 'contenu' && (
        <div className="space-y-6">
          <MultilangField label="Titre" required values={pickLangValues(form, 'title')} onChange={v => set(spreadLangValues('title', v))}/>
          <MultilangField label="Résumé (extrait)" type="textarea" rows={3} values={pickLangValues(form, 'excerpt')} onChange={v => set(spreadLangValues('excerpt', v))}/>
          <MultilangField label="Contenu (Markdown accepté)" type="textarea" rows={14} values={pickLangValues(form, 'content')} onChange={v => set(spreadLangValues('content', v))} hint="Utilisez **gras**, *italique*, [liens](url), listes avec -, titres avec ##."/>
        </div>
      )}
    </EditorLayout>
  );
}

window.BlogPage = BlogPage;

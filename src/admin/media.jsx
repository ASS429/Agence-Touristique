// =====================================================================
// src/admin/media.jsx — Médiathèque (upload + gestion Supabase Storage)
// =====================================================================

function MediaPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const fileInputRef = useRef(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await window.sbList('media_library', { orderBy: 'created_at', ascending: false });
      setItems(data);
    } catch (e) {
      window.toast('Erreur chargement : ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const onFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          window.toast(`${file.name} n'est pas une image`, 'warning');
          continue;
        }
        // Charger l'image pour extraire ses dimensions
        const dims = await new Promise((res) => {
          const img = new Image();
          img.onload = () => res({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = () => res({ width: null, height: null });
          img.src = URL.createObjectURL(file);
        });

        const { path, url } = await window.sbUpload(file, catFilter || 'photos');
        await window.sbInsert('media_library', {
          storage_path: path,
          public_url: url,
          category: catFilter || null,
          width: dims.width,
          height: dims.height,
          file_size: file.size,
          content_type: file.type
        });
        window.toast(`${file.name} téléversée`, 'success');
      }
      await reload();
    } catch (e) {
      window.toast('Erreur upload : ' + e.message, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onDelete = async (item) => {
    if (!(await window.askConfirm('Supprimer définitivement cette image ?', 'Supprimer'))) return;
    try {
      await window.sbRemoveStorage(item.storage_path);
      await window.sbDelete('media_library', item.id);
      setItems(list => list.filter(x => x.id !== item.id));
      window.toast('Image supprimée', 'success');
    } catch (e) {
      window.toast('Erreur : ' + e.message, 'error');
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url).then(
      () => window.toast('URL copiée', 'success'),
      () => window.toast('Impossible de copier', 'error')
    );
  };

  const filtered = useMemo(() => {
    let f = items;
    if (catFilter) f = f.filter(i => i.category === catFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      f = f.filter(i =>
        i.storage_path?.toLowerCase().includes(q) ||
        i.alt_fr?.toLowerCase().includes(q)
      );
    }
    return f;
  }, [items, query, catFilter]);

  const CATEGORIES = ['circuits','excursions','ateliers','equipe','partenaires','blog','general'];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Médiathèque"
        subtitle={`${items.length} image${items.length > 1 ? 's' : ''} · ${humanSize(items.reduce((s,i)=>s+(i.file_size||0),0))}`}
        actions={
          <Btn onClick={() => fileInputRef.current?.click()} loading={uploading}>
            + Téléverser
          </Btn>
        }
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={e => onFiles(e.target.files)}
      />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher…" className="max-w-sm"/>
        <Select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="max-w-xs">
          <option value="">Toutes catégories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
        </Select>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg"/></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucune image"
          message="Téléversez vos premières photos en cliquant sur « + Téléverser »."
          action={<Btn onClick={() => fileInputRef.current?.click()}>Choisir des fichiers</Btn>}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="group relative bg-white rounded-xl overflow-hidden border border-sand-200 hover:border-terra-600 transition">
              <div className="aspect-square bg-sand-100 relative">
                <img src={item.public_url} alt={item.alt_fr || ''} className="w-full h-full object-cover cursor-pointer" onClick={() => setEditing(item)}/>
              </div>
              <div className="p-2 text-xs">
                <div className="truncate text-ink-800 font-medium" title={item.storage_path}>{item.storage_path.split('/').pop()}</div>
                <div className="flex items-center justify-between mt-1 text-ink-800/50">
                  <span>{item.width}×{item.height}</span>
                  <span>{humanSize(item.file_size)}</span>
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
                <button onClick={() => copyUrl(item.public_url)} className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-ink-800 shadow" title="Copier l'URL">📋</button>
                <button onClick={() => onDelete(item)} className="w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 text-red-600 shadow" title="Supprimer">🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <MediaEditor item={editing} onClose={() => setEditing(null)} onSaved={(updated) => setItems(list => list.map(x => x.id === updated.id ? updated : x))}/>}
    </div>
  );
}

function MediaEditor({ item, onClose, onSaved }) {
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  const save = async () => {
    setSaving(true);
    try {
      const updated = await window.sbUpdate('media_library', item.id, {
        alt_fr: form.alt_fr, alt_en: form.alt_en,
        alt_it: form.alt_it, alt_de: form.alt_de,
        category: form.category
      });
      onSaved(updated);
      window.toast('Enregistré', 'success');
      onClose();
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <EditorLayout open={true} onClose={onClose} title="Édition de l'image" onSave={save} saving={saving} size="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <img src={item.public_url} alt="" className="w-full rounded-xl border border-sand-200"/>
        <div className="space-y-4">
          <div>
            <div className="text-xs uppercase text-ink-800/60 mb-1">URL publique</div>
            <div className="flex gap-2">
              <Input value={item.public_url} readOnly onFocus={e => e.target.select()}/>
              <Btn variant="secondary" size="sm" onClick={() => {
                navigator.clipboard.writeText(item.public_url);
                window.toast('Copié', 'success');
              }}>📋</Btn>
            </div>
          </div>
          <Field label="Catégorie">
            <Select value={form.category || ''} onChange={e => set({ category: e.target.value })}>
              <option value="">—</option>
              <option value="circuits">Circuits</option>
              <option value="excursions">Excursions</option>
              <option value="ateliers">Ateliers</option>
              <option value="equipe">Équipe</option>
              <option value="partenaires">Partenaires</option>
              <option value="blog">Blog</option>
              <option value="general">Général</option>
            </Select>
          </Field>
          <div className="text-xs text-ink-800/60 space-y-1">
            <div>Dimensions : {item.width || '?'} × {item.height || '?'}</div>
            <div>Poids : {humanSize(item.file_size)}</div>
            <div>Type : {item.content_type || '?'}</div>
            <div>Ajoutée le : {formatDate(item.created_at)}</div>
          </div>
        </div>
      </div>

      <MultilangField label="Alt (description pour l'accessibilité / SEO)" values={pickLangValues(form, 'alt')} onChange={v => set(spreadLangValues('alt', v))}/>
    </EditorLayout>
  );
}

function humanSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' o';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
}

window.MediaPage = MediaPage;

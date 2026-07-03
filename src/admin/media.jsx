// =====================================================================
// src/admin/media.jsx — Médiathèque (dropzone + grid + lightbox, refondu)
// =====================================================================

function MediaPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [catFilter, setCatFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await window.sbList('media_library', { orderBy: 'created_at', ascending: false });
      setItems(data);
    } catch (e) {
      window.toast('Erreur : ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const upload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const catToApply = catFilter !== 'all' ? catFilter : null;
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          window.toast(`${file.name} n'est pas une image`, 'warning');
          continue;
        }
        const dims = await new Promise((res) => {
          const img = new Image();
          img.onload = () => res({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = () => res({ width: null, height: null });
          img.src = URL.createObjectURL(file);
        });

        const { path, url } = await window.sbUpload(file, catToApply || 'photos');
        await window.sbInsert('media_library', {
          storage_path: path,
          public_url: url,
          category: catToApply,
          width: dims.width, height: dims.height,
          file_size: file.size, content_type: file.type
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

  const onDelete = async (item, e) => {
    e?.stopPropagation();
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

  const copyUrl = (url, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(url).then(
      () => window.toast('URL copiée', 'success'),
      () => window.toast('Impossible de copier', 'error')
    );
  };

  const filtered = useMemo(() => {
    if (catFilter === 'all') return items;
    return items.filter(i => i.category === catFilter);
  }, [items, catFilter]);

  const CATEGORIES = [
    { id: 'all',        label: 'Tout' },
    { id: 'circuits',   label: 'Circuits' },
    { id: 'excursions', label: 'Excursions' },
    { id: 'ateliers',   label: 'Ateliers' },
    { id: 'equipe',     label: 'Équipe' },
    { id: 'blog',       label: 'Blog' },
    { id: 'general',    label: 'Général' }
  ];

  const totalSize = items.reduce((s, i) => s + (i.file_size || 0), 0);

  return (
    <PagePad>
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <FiltersPills filters={CATEGORIES} active={catFilter} onSelect={setCatFilter}/>
        <div className="flex-1"/>
        <div className="font-mono text-[11px] text-mute-500">
          {items.length} fichier{items.length > 1 ? 's' : ''} · {humanSize(totalSize)}
        </div>
      </div>

      {/* Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={e => {
          e.preventDefault();
          setDragActive(false);
          upload(Array.from(e.dataTransfer.files || []));
        }}
        className={`mb-4 border-[1.5px] border-dashed rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition ${
          dragActive
            ? 'bg-sand-100 border-terra-600'
            : 'bg-sand-75 border-bone-600 hover:bg-sand-100 hover:border-terra-600'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-white border border-bone-300 text-terra-600 flex items-center justify-center flex-shrink-0">
          {uploading ? <Spinner size="md"/> : <Icon name="upload" size={22}/>}
        </div>
        <div>
          <div className="font-bold text-[15px] text-ink-800">Glissez vos photos ici, ou cliquez pour parcourir</div>
          <div className="text-[13px] text-mute-500 mt-0.5">JPG, PNG ou WebP · 8 Mo max · dimensions calculées automatiquement</div>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={e => upload(Array.from(e.target.files || []))}
      />

      {loading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg"/></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Icon name="image" size={28}/>}
          title="Aucune image"
          message="Téléversez vos premières photos en cliquant sur la zone ci-dessus."
        />
      ) : (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}>
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => setLightbox(item)}
              className="group relative rounded-2xl overflow-hidden border border-bone-300 cursor-pointer aspect-square hover:border-terra-600 transition"
            >
              <img
                src={item.public_url}
                alt={item.alt_fr || ''}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(20,17,13,.62),transparent 42%)' }}/>
              {item.category && (
                <span className="absolute left-2.5 top-2 font-mono text-[8.5px] font-semibold uppercase tracking-[0.08em] text-mute-600 bg-white/70 px-1.5 py-0.5 rounded">
                  {item.category}
                </span>
              )}
              <div className="absolute left-2.5 right-2.5 bottom-2 text-sand-50 text-[12.5px] font-semibold truncate" style={{ textShadow: '0 1px 3px rgba(0,0,0,.4)' }}>
                {item.storage_path.split('/').pop()}
              </div>
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                <button onClick={(e) => copyUrl(item.public_url, e)} aria-label="Copier URL" className="w-8 h-8 rounded-lg bg-white/95 text-info-600 flex items-center justify-center shadow-lg">
                  <Icon name="copy" size={14}/>
                </button>
                <button onClick={(e) => onDelete(item, e)} aria-label="Supprimer" className="w-8 h-8 rounded-lg bg-white/95 text-danger-600 flex items-center justify-center shadow-lg">
                  <Icon name="trash" size={14}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <MediaEditor item={editing} onClose={() => setEditing(null)} onSaved={(updated) => setItems(list => list.map(x => x.id === updated.id ? updated : x))}/>}
      {lightbox && (
        <MediaLightbox
          item={lightbox}
          onClose={() => setLightbox(null)}
          onEdit={() => { setEditing(lightbox); setLightbox(null); }}
          onCopyUrl={(e) => copyUrl(lightbox.public_url, e)}
          onDelete={(e) => { onDelete(lightbox, e); setLightbox(null); }}
        />
      )}
    </PagePad>
  );
}

// -----------------------------------------------------------
// MediaLightbox : preview plein écran fond ink
// -----------------------------------------------------------
function MediaLightbox({ item, onClose, onEdit, onCopyUrl, onDelete }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-center justify-center p-10"
      style={{ background: 'rgba(14,15,16,.86)', backdropFilter: 'blur(6px)', animation: 'act-fade .2s ease' }}
    >
      <div onClick={e => e.stopPropagation()} className="relative max-w-[820px] w-full">
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-ink-950">
          <img
            src={item.public_url}
            alt={item.alt_fr || ''}
            className="block w-full h-auto"
          />
        </div>
        <div className="mt-3.5 flex items-center justify-between text-sand-200 gap-4 flex-wrap">
          <div>
            <div className="font-display text-[22px] text-sand-50">{item.alt_fr || item.storage_path.split('/').pop()}</div>
            <div className="font-mono text-[11px] text-sand-200/55 mt-1">
              {item.width}×{item.height} · {humanSize(item.file_size)} · {item.content_type}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onEdit} className="h-10 px-4 rounded-full border border-white/25 bg-white/10 text-sand-50 font-semibold text-[13px] hover:bg-white/20 flex items-center gap-1.5 transition">
              <Icon name="pen" size={14}/> Éditer
            </button>
            <button onClick={onCopyUrl} className="h-10 px-4 rounded-full border border-white/25 bg-white/10 text-sand-50 font-semibold text-[13px] hover:bg-white/20 flex items-center gap-1.5 transition">
              <Icon name="copy" size={14}/> Copier l'URL
            </button>
            <button onClick={onDelete} className="h-10 px-4 rounded-full border border-white/25 bg-white/10 text-sand-50 font-semibold text-[13px] hover:bg-danger-100/20 hover:text-danger-600 flex items-center gap-1.5 transition">
              <Icon name="trash" size={14}/>
            </button>
            <button onClick={onClose} aria-label="Fermer" className="w-10 h-10 rounded-full border border-white/25 bg-white/10 text-sand-50 hover:bg-white/20 flex items-center justify-center transition">
              <Icon name="x" size={16}/>
            </button>
          </div>
        </div>
      </div>
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
    <EditorLayout
      open={true}
      onClose={onClose}
      kicker="Média"
      title="Édition de l'image"
      size="lg"
      onSave={save}
      saving={saving}
      saveLabel="Enregistrer"
      footerLeft={item.created_at && <><Icon name="clock" size={13}/> Ajoutée {timeAgo(item.created_at)}</>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <img src={item.public_url} alt="" className="w-full rounded-2xl border border-bone-300"/>
        <div className="space-y-4">
          <div>
            <div className="text-[12.5px] font-semibold text-mute-600 mb-1.5">URL publique</div>
            <div className="flex gap-2">
              <Input value={item.public_url} readOnly onFocus={e => e.target.select()}/>
              <Btn variant="secondary" size="sm" onClick={() => {
                navigator.clipboard.writeText(item.public_url);
                window.toast('Copié', 'success');
              }}><Icon name="copy" size={13}/></Btn>
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
          <div className="text-[12px] text-mute-500 space-y-1">
            <div>Dimensions : {item.width || '?'} × {item.height || '?'}</div>
            <div>Poids : {humanSize(item.file_size)}</div>
            <div>Type : {item.content_type || '?'}</div>
          </div>
        </div>
      </div>

      <MultilangField label="Alt (description accessible / SEO)" values={pickLangValues(form, 'alt')} onChange={v => set(spreadLangValues('alt', v))}/>
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

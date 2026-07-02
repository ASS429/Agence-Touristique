// =====================================================================
// src/admin/circuits.jsx — CRUD Circuits
// =====================================================================

function CircuitsPage() {
  const col = useCollection('circuits');
  const [editing, setEditing] = useState(null);

  const openCreate = () => setEditing({
    slug: '', title_fr: '', title_en: '', title_it: '', title_de: '',
    subtitle_fr: '', description_fr: '',
    duration_days: 7, region: 'Sénégal', category: '',
    hero_photo: '', badges: [], highlights: [], itinerary: [], gallery: [],
    published: false, sort_order: 100
  });

  const onDelete = async (row) => {
    if (!(await window.askConfirm(`Supprimer le circuit "${row.title_fr}" ?`, 'Supprimer'))) return;
    await col.remove(row.id);
    window.toast('Circuit supprimé', 'success');
  };

  const onDuplicate = async (row) => {
    const { id, created_at, updated_at, ...rest } = row;
    const copy = await col.create({ ...rest, slug: row.slug + '-copie', title_fr: row.title_fr + ' (copie)', published: false });
    setEditing(copy);
    window.toast('Circuit dupliqué', 'success');
  };

  const columns = [
    { key: 'title_fr', label: 'Titre', render: r => (
      <div>
        <div className="font-medium text-ink-900">{truncate(r.title_fr, 60)}</div>
        <div className="text-xs text-ink-800/50">{r.slug}</div>
      </div>
    ) },
    { key: 'region', label: 'Région', width: '140px' },
    { key: 'duration_days', label: 'Durée', width: '80px', render: r => r.duration_days ? `${r.duration_days} j` : '—' },
    { key: 'published', label: 'Statut', width: '110px', render: r => <StatusPill published={r.published}/> },
    { key: 'updated_at', label: 'Modifié', width: '140px', render: r => formatDate(r.updated_at) }
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Circuits"
        subtitle={`${col.items.length} circuit${col.items.length > 1 ? 's' : ''} au catalogue`}
      />
      <ListToolbar
        query={col.query}
        onQuery={col.setQuery}
        onCreate={openCreate}
        createLabel="Nouveau circuit"
      />
      <ItemsTable
        items={col.filtered}
        columns={columns}
        onRowClick={setEditing}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onTogglePublish={async row => { await col.togglePublish(row); window.toast(row.published ? 'Dépublié' : 'Publié', 'success'); }}
        loading={col.loading}
      />
      {editing && <CircuitEditor circuit={editing} onClose={() => setEditing(null)} col={col}/>}
    </div>
  );
}

// =====================================================================
// Éditeur d'un circuit
// =====================================================================
function CircuitEditor({ circuit, onClose, col }) {
  const [form, setForm] = useState(circuit);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('general');
  const isNew = !circuit.id;

  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  // Auto-slug depuis le titre FR à la création
  useEffect(() => {
    if (isNew && form.title_fr && !form.slug) {
      set({ slug: window.slugify(form.title_fr) });
    }
  }, [form.title_fr]);

  const save = async () => {
    if (!form.title_fr?.trim()) { window.toast('Le titre FR est obligatoire', 'error'); return; }
    if (!form.slug?.trim()) { window.toast('Le slug est obligatoire', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.created_at;
      delete payload.updated_at;
      if (isNew) {
        delete payload.id;
        await col.create(payload);
        window.toast('Circuit créé', 'success');
      } else {
        await col.update(circuit.id, payload);
        window.toast('Modifications enregistrées', 'success');
      }
      onClose();
    } catch (e) {
      window.toast('Erreur : ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const TabButton = ({ id, label, count }) => (
    <button
      onClick={() => setTab(id)}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab === id ? 'border-terra-600 text-terra-700' : 'border-transparent text-ink-800/60 hover:text-ink-800'}`}
    >{label}{count != null && <span className="ml-1.5 text-xs text-ink-800/40">({count})</span>}</button>
  );

  return (
    <EditorLayout
      open={true}
      onClose={onClose}
      title={isNew ? 'Nouveau circuit' : `Éditer : ${circuit.title_fr}`}
      onSave={save}
      saving={saving}
      size="xl"
      footer={
        <div className="flex items-center gap-3">
          <Toggle checked={form.published} onChange={v => set({ published: v })} label={form.published ? 'Publié' : 'Brouillon'}/>
        </div>
      }
    >
      <div className="flex gap-1 border-b border-sand-200">
        <TabButton id="general" label="Général"/>
        <TabButton id="content" label="Contenu"/>
        <TabButton id="itinerary" label="Itinéraire" count={form.itinerary?.length}/>
        <TabButton id="highlights" label="Points forts" count={form.highlights?.length}/>
        <TabButton id="badges" label="Badges" count={form.badges?.length}/>
        <TabButton id="gallery" label="Galerie" count={form.gallery?.length}/>
      </div>

      {tab === 'general' && (
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Slug (URL)" required hint="Généré depuis le titre. Modifiable.">
              <Input value={form.slug} onChange={e => set({ slug: e.target.value })} placeholder="dakar-decouverte-7j"/>
            </Field>
            <Field label="Ordre d'affichage" hint="Plus petit = affiché en premier">
              <Input type="number" value={form.sort_order} onChange={e => set({ sort_order: parseInt(e.target.value) || 0 })}/>
            </Field>
            <Field label="Durée (jours)">
              <Input type="number" min="1" value={form.duration_days || ''} onChange={e => set({ duration_days: parseInt(e.target.value) || null })}/>
            </Field>
            <Field label="Région">
              <Input value={form.region || ''} onChange={e => set({ region: e.target.value })} placeholder="Sénégal"/>
            </Field>
            <Field label="Catégorie">
              <Select value={form.category || ''} onChange={e => set({ category: e.target.value })}>
                <option value="">—</option>
                <option value="nature">Nature</option>
                <option value="culture">Culture</option>
                <option value="mixte">Mixte</option>
                <option value="famille">Famille</option>
                <option value="diaspora">Diaspora</option>
              </Select>
            </Field>
            <Field label="Photo de couverture (URL)">
              <Input value={form.hero_photo || ''} onChange={e => set({ hero_photo: e.target.value })} placeholder="https://…"/>
            </Field>
          </div>
        </div>
      )}

      {tab === 'content' && (
        <div className="space-y-6 pt-4">
          <MultilangField
            label="Titre"
            required
            values={pickLangValues(form, 'title')}
            onChange={v => set(spreadLangValues('title', v))}
          />
          <MultilangField
            label="Sous-titre / accroche"
            values={pickLangValues(form, 'subtitle')}
            onChange={v => set(spreadLangValues('subtitle', v))}
          />
          <MultilangField
            label="Description complète"
            type="textarea"
            rows={6}
            values={pickLangValues(form, 'description')}
            onChange={v => set(spreadLangValues('description', v))}
          />
        </div>
      )}

      {tab === 'itinerary' && (
        <ItineraryEditor value={form.itinerary || []} onChange={v => set({ itinerary: v })}/>
      )}

      {tab === 'highlights' && (
        <MultilangListEditor
          value={form.highlights || []}
          onChange={v => set({ highlights: v })}
          singular="point fort"
          plural="points forts"
        />
      )}

      {tab === 'badges' && (
        <BadgesEditor value={form.badges || []} onChange={v => set({ badges: v })}/>
      )}

      {tab === 'gallery' && (
        <GalleryEditor value={form.gallery || []} onChange={v => set({ gallery: v })}/>
      )}
    </EditorLayout>
  );
}

// =====================================================================
// Sous-composants : éditeurs de listes JSON
// =====================================================================

// Itinéraire jour par jour
function ItineraryEditor({ value, onChange }) {
  const add = () => onChange([...value, { day: value.length + 1, title_fr: '', title_en: '', title_it: '', title_de: '', description_fr: '', description_en: '', description_it: '', description_de: '' }]);
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const arr = [...value];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr);
  };
  const update = (i, patch) => onChange(value.map((it, idx) => idx === i ? { ...it, ...patch } : it));

  return (
    <div className="space-y-3 pt-4">
      {value.length === 0 && (
        <div className="text-center py-8 text-ink-800/50 text-sm">Aucune étape. Cliquez pour en ajouter une.</div>
      )}
      {value.map((step, i) => (
        <div key={i} className="border border-sand-200 rounded-xl p-4 space-y-3 bg-sand-50/50">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-terra-600 text-white text-sm flex items-center justify-center font-semibold">{step.day || i + 1}</span>
            <Input type="number" min="1" value={step.day || i + 1} onChange={e => update(i, { day: parseInt(e.target.value) || 1 })} className="w-20"/>
            <div className="flex-1"/>
            <button onClick={() => move(i, -1)} disabled={i === 0} className="px-2 text-ink-800/60 hover:text-ink-900 disabled:opacity-30">↑</button>
            <button onClick={() => move(i, 1)} disabled={i === value.length - 1} className="px-2 text-ink-800/60 hover:text-ink-900 disabled:opacity-30">↓</button>
            <button onClick={() => remove(i)} className="px-2 text-red-600 hover:text-red-800">🗑</button>
          </div>
          <MultilangField
            label="Titre de l'étape"
            values={pickLangValues(step, 'title')}
            onChange={v => update(i, spreadLangValues('title', v))}
          />
          <MultilangField
            label="Description"
            type="textarea"
            rows={3}
            values={pickLangValues(step, 'description')}
            onChange={v => update(i, spreadLangValues('description', v))}
          />
        </div>
      ))}
      <Btn variant="outline" onClick={add} className="w-full">+ Ajouter une étape</Btn>
    </div>
  );
}

// Liste de textes multilingues (highlights, includes, etc.)
function MultilangListEditor({ value, onChange, singular = 'élément', plural = 'éléments' }) {
  const add = () => onChange([...value, { text_fr: '', text_en: '', text_it: '', text_de: '' }]);
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const arr = [...value];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr);
  };
  const update = (i, patch) => onChange(value.map((it, idx) => idx === i ? { ...it, ...patch } : it));

  return (
    <div className="space-y-3 pt-4">
      {value.length === 0 && (
        <div className="text-center py-8 text-ink-800/50 text-sm">Aucun {singular}. Cliquez pour en ajouter.</div>
      )}
      {value.map((item, i) => (
        <div key={i} className="border border-sand-200 rounded-xl p-4 space-y-2 bg-sand-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase text-ink-800/50">#{i + 1}</span>
            <div className="flex-1"/>
            <button onClick={() => move(i, -1)} disabled={i === 0} className="px-2 text-ink-800/60 hover:text-ink-900 disabled:opacity-30">↑</button>
            <button onClick={() => move(i, 1)} disabled={i === value.length - 1} className="px-2 text-ink-800/60 hover:text-ink-900 disabled:opacity-30">↓</button>
            <button onClick={() => remove(i)} className="px-2 text-red-600 hover:text-red-800">🗑</button>
          </div>
          <MultilangField
            values={pickLangValues(item, 'text')}
            onChange={v => update(i, spreadLangValues('text', v))}
          />
        </div>
      ))}
      <Btn variant="outline" onClick={add} className="w-full">+ Ajouter un {singular}</Btn>
    </div>
  );
}

// Badges (emoji + texte multilingue court)
function BadgesEditor({ value, onChange }) {
  const add = () => onChange([...value, { emoji: '✨', text_fr: '', text_en: '', text_it: '', text_de: '' }]);
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const update = (i, patch) => onChange(value.map((it, idx) => idx === i ? { ...it, ...patch } : it));

  return (
    <div className="space-y-3 pt-4">
      {value.length === 0 && (
        <div className="text-center py-8 text-ink-800/50 text-sm">Aucun badge. Les badges apparaissent en pastilles sur la fiche circuit.</div>
      )}
      {value.map((b, i) => (
        <div key={i} className="border border-sand-200 rounded-xl p-3 flex items-start gap-3 bg-sand-50/50">
          <Input value={b.emoji || ''} onChange={e => update(i, { emoji: e.target.value })} className="w-16 text-center text-xl"/>
          <div className="flex-1">
            <MultilangField
              values={pickLangValues(b, 'text')}
              onChange={v => update(i, spreadLangValues('text', v))}
              placeholder="Texte court"
            />
          </div>
          <button onClick={() => remove(i)} className="px-2 py-1 text-red-600 hover:text-red-800">🗑</button>
        </div>
      ))}
      <Btn variant="outline" onClick={add} className="w-full">+ Ajouter un badge</Btn>
    </div>
  );
}

// Galerie photos (liste d'URLs + alt multilingues)
function GalleryEditor({ value, onChange }) {
  const add = () => onChange([...value, { url: '', alt_fr: '', alt_en: '', alt_it: '', alt_de: '' }]);
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const update = (i, patch) => onChange(value.map((it, idx) => idx === i ? { ...it, ...patch } : it));

  return (
    <div className="space-y-3 pt-4">
      {value.length === 0 && (
        <div className="text-center py-8 text-ink-800/50 text-sm">Aucune photo dans la galerie.</div>
      )}
      {value.map((p, i) => (
        <div key={i} className="border border-sand-200 rounded-xl p-3 flex items-start gap-3 bg-sand-50/50">
          {p.url && <img src={p.url} alt="" className="w-24 h-24 object-cover rounded-lg flex-shrink-0"/>}
          <div className="flex-1 space-y-2">
            <Input value={p.url} onChange={e => update(i, { url: e.target.value })} placeholder="URL de la photo"/>
            <MultilangField
              label="Alt (accessibilité)"
              values={pickLangValues(p, 'alt')}
              onChange={v => update(i, spreadLangValues('alt', v))}
            />
          </div>
          <button onClick={() => remove(i)} className="px-2 py-1 text-red-600 hover:text-red-800">🗑</button>
        </div>
      ))}
      <Btn variant="outline" onClick={add} className="w-full">+ Ajouter une photo</Btn>
    </div>
  );
}

window.CircuitsPage = CircuitsPage;
window.ItineraryEditor = ItineraryEditor;
window.MultilangListEditor = MultilangListEditor;
window.BadgesEditor = BadgesEditor;
window.GalleryEditor = GalleryEditor;

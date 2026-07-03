// =====================================================================
// src/admin/circuits.jsx — CRUD Circuits (design refondu)
// =====================================================================

function CircuitsPage() {
  const col = useCollection('circuits');
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');

  const openCreate = () => setEditing({
    slug: '', title_fr: '', title_en: '', title_it: '', title_de: '',
    subtitle_fr: '', description_fr: '',
    duration_days: 7, region: 'Sénégal', category: '',
    hero_photo: '', badges: [], highlights: [], itinerary: [], gallery: [],
    published: false, sort_order: 100
  });

  // Écoute le CTA "+ Nouveau" du header
  useEffect(() => {
    const cb = (e) => e.detail.section === 'circuits' && openCreate();
    window.addEventListener('act-admin-cta', cb);
    return () => window.removeEventListener('act-admin-cta', cb);
  }, []);

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

  const filteredByStatus = useMemo(() => {
    let f = col.filtered;
    if (filter === 'published') f = f.filter(r =>  r.published);
    if (filter === 'draft')     f = f.filter(r => !r.published);
    return f;
  }, [col.filtered, filter]);

  const columns = [
    { key: 'title', label: 'Circuit', width: 'minmax(0,2.4fr)', render: r => (
      <div className="flex items-center gap-3.5 min-w-0">
        <Thumb src={r.hero_photo} alt={r.title_fr} ratio={`act-thumb-${['a','b','c'][(r.title_fr?.length || 0) % 3]}`}/>
        <div className="min-w-0">
          <div className="font-bold text-[14.5px] text-ink-800 truncate">{r.title_fr}</div>
          <div className="text-[12px] text-mute-500 truncate">{r.subtitle_fr}</div>
          <div className="mt-0.5 font-mono text-[10px] text-mute-300">/{r.slug}</div>
        </div>
      </div>
    ) },
    { key: 'region', label: 'Région', width: '1fr', render: r => (
      <div className="flex items-center gap-1.5 text-mute-700">
        <Icon name="pin" size={14}/>{r.region || '—'}
      </div>
    ) },
    { key: 'duration_days', label: 'Durée', width: '.8fr', render: r => r.duration_days ? `${r.duration_days} j` : '—' },
    { key: 'langs', label: 'Langues', width: '.9fr', render: r => <LangDots row={r} field="title"/> },
    { key: 'status', label: 'Statut', width: '1fr', render: r => <StatusPill published={r.published}/> }
  ];

  const filters = [
    { id: 'all',       label: 'Tous',      count: col.items.length },
    { id: 'published', label: 'Publiés',   count: col.items.filter(r => r.published).length },
    { id: 'draft',     label: 'Brouillons',count: col.items.filter(r => !r.published).length }
  ];

  return (
    <PagePad>
      <ListToolbar
        query={col.query}
        onQuery={col.setQuery}
        filters={filters}
        activeFilter={filter}
        onFilter={setFilter}
        count={`${col.items.length} circuit${col.items.length > 1 ? 's' : ''}`}
        onCreate={openCreate}
        createLabel="Nouveau circuit"
      />
      <ItemsTable
        items={filteredByStatus}
        columns={columns}
        onRowClick={setEditing}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onTogglePublish={async row => { await col.togglePublish(row); window.toast(row.published ? 'Dépublié' : 'Publié', 'success'); }}
        loading={col.loading}
        emptyIcon={<Icon name="map" size={28}/>}
        emptyTitle="Aucun circuit"
      />
      {editing && <CircuitEditor circuit={editing} onClose={() => setEditing(null)} col={col}/>}
    </PagePad>
  );
}

// =====================================================================
// Éditeur d'un circuit
// =====================================================================
function CircuitEditor({ circuit, onClose, col }) {
  const [form, setForm] = useState(circuit);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('itineraire');
  const isNew = !circuit.id;

  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  // Auto-slug depuis le titre FR à la création
  useEffect(() => {
    if (isNew && form.title_fr && !form.slug) {
      set({ slug: window.slugify(form.title_fr) });
    }
  }, [form.title_fr]);

  const doSave = async (publish) => {
    if (!form.title_fr?.trim()) { window.toast('Le titre FR est obligatoire', 'error'); return; }
    if (!form.slug?.trim()) { window.toast('Le slug est obligatoire', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (publish !== undefined) payload.published = publish;
      delete payload.created_at;
      delete payload.updated_at;
      if (isNew) {
        delete payload.id;
        await col.create(payload);
        window.toast(publish ? 'Circuit publié' : 'Circuit créé', 'success');
      } else {
        await col.update(circuit.id, payload);
        window.toast(publish === true  ? 'Circuit publié'   :
                     publish === false ? 'Circuit dépublié' : 'Modifications enregistrées', 'success');
      }
      onClose();
    } catch (e) {
      window.toast('Erreur : ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general',    label: 'Général' },
    { id: 'contenu',    label: 'Contenu' },
    { id: 'itineraire', label: 'Itinéraire',   count: form.itinerary?.length },
    { id: 'points',     label: 'Points forts', count: form.highlights?.length },
    { id: 'badges',     label: 'Badges',       count: form.badges?.length },
    { id: 'galerie',    label: 'Galerie',      count: form.gallery?.length }
  ];

  return (
    <EditorLayout
      open={true}
      onClose={onClose}
      kicker={`Édition circuit · /${form.slug || 'nouveau'}`}
      title={isNew ? 'Nouveau circuit' : form.title_fr}
      statusPill={<StatusPill published={form.published}/>}
      size="full"
      tabs={tabs}
      activeTab={tab}
      onSelectTab={setTab}
      onSave={() => doSave(true)}
      onSaveDraft={() => doSave(false)}
      saving={saving}
      publishLabel="Publier le circuit"
      footerLeft={circuit.updated_at && <><Icon name="clock" size={13}/> Dernière modif. {timeAgo(circuit.updated_at)}</>}
    >
      {tab === 'general' && (
        <div className="space-y-4">
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
              <Input value={form.region || ''} onChange={e => set({ region: e.target.value })} placeholder="Sénégal, Sine Saloum · Casamance…"/>
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
          </div>

          <Field label="Photo hero (16:9)">
            {form.hero_photo ? (
              <div className="relative h-[150px] rounded-2xl overflow-hidden border border-bone-300">
                <img src={form.hero_photo} alt="" className="w-full h-full object-cover"/>
                <button onClick={() => set({ hero_photo: '' })} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-danger-600 flex items-center justify-center shadow"><Icon name="trash" size={14}/></button>
              </div>
            ) : (
              <div className="relative h-[150px] rounded-2xl overflow-hidden border border-bone-300 act-hero-ph">
                <span className="absolute left-3 bottom-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-mute-400">Photo — hero 16:9 · URL</span>
              </div>
            )}
            <Input value={form.hero_photo || ''} onChange={e => set({ hero_photo: e.target.value })} placeholder="https://…" className="mt-3"/>
          </Field>
        </div>
      )}

      {tab === 'contenu' && (
        <div className="space-y-6">
          <MultilangField label="Titre du circuit" required values={pickLangValues(form, 'title')} onChange={v => set(spreadLangValues('title', v))}/>
          <MultilangField label="Sous-titre / accroche" values={pickLangValues(form, 'subtitle')} onChange={v => set(spreadLangValues('subtitle', v))}/>
          <MultilangField label="Description complète" type="textarea" rows={6} values={pickLangValues(form, 'description')} onChange={v => set(spreadLangValues('description', v))}/>
        </div>
      )}

      {tab === 'itineraire' && (
        <ItineraryEditor value={form.itinerary || []} onChange={v => set({ itinerary: v })} durationDays={form.duration_days}/>
      )}

      {tab === 'points' && (
        <MultilangListEditor value={form.highlights || []} onChange={v => set({ highlights: v })} singular="point fort"/>
      )}

      {tab === 'badges' && (
        <BadgesEditor value={form.badges || []} onChange={v => set({ badges: v })}/>
      )}

      {tab === 'galerie' && (
        <GalleryEditor value={form.gallery || []} onChange={v => set({ gallery: v })}/>
      )}
    </EditorLayout>
  );
}

// =====================================================================
// ItineraryEditor : timeline verticale (design handoff)
// =====================================================================
function ItineraryEditor({ value, onChange, durationDays }) {
  const [activeLang, setActiveLang] = useState('fr');

  const add = () => onChange([...value, {
    day: value.length + 1,
    title_fr: '', title_en: '', title_it: '', title_de: '',
    description_fr: '', description_en: '', description_it: '', description_de: ''
  }]);
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
    <div>
      {/* Header avec compteur et onglets langues */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-display text-[22px] text-ink-800">Itinéraire jour par jour</h3>
            <span className="font-mono text-[11px] text-mute-500">
              {value.length} étape{value.length > 1 ? 's' : ''}
              {durationDays ? ` · ${durationDays} jours` : ''}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-mute-500">
            Utilisez les flèches pour réordonner. Chaque jour est traduit en 4 langues.
          </p>
        </div>
        <LangPills active={activeLang} onChange={setActiveLang} completion={{
          fr: value.every(s => s.title_fr?.trim()),
          en: value.every(s => s.title_en?.trim()),
          it: value.every(s => s.title_it?.trim()),
          de: value.every(s => s.title_de?.trim())
        }}/>
      </div>

      {/* Timeline verticale */}
      <div className="relative pl-1.5">
        {value.length > 1 && (
          <div className="absolute left-[24px] top-4 bottom-16 w-0.5" style={{ background: 'linear-gradient(#E3B7A5,#EFE7D6)' }}/>
        )}

        {value.length === 0 && (
          <div className="text-center py-10 text-mute-500 text-[13.5px]">
            Aucune étape encore. Ajoutez le premier jour ci-dessous.
          </div>
        )}

        {value.map((step, i) => (
          <div key={i} className="relative flex gap-4 mb-3">
            <div className="flex-shrink-0 w-9 flex flex-col items-center z-10">
              <div
                className="w-9 h-9 rounded-full text-white flex items-center justify-center font-display text-[16px] flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg,#D46B4C,#A64729)',
                  boxShadow: '0 6px 14px -6px rgba(200,89,59,.7)'
                }}
              >{step.day || i + 1}</div>
            </div>
            <div className="flex-1 bg-white border border-bone-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="text-mute-300 flex flex-col gap-0"><Icon name="grip" size={16}/></div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-mute-400">
                  Jour {step.day || i + 1}
                </span>
                <div className="flex-1"/>
                <button onClick={() => move(i, -1)} disabled={i === 0} className="w-7 h-7 rounded-lg border border-bone-300 bg-white text-mute-500 hover:bg-sand-100 flex items-center justify-center disabled:opacity-30">↑</button>
                <button onClick={() => move(i, 1)}  disabled={i === value.length - 1} className="w-7 h-7 rounded-lg border border-bone-300 bg-white text-mute-500 hover:bg-sand-100 flex items-center justify-center disabled:opacity-30">↓</button>
                <button onClick={() => remove(i)} aria-label="Supprimer" className="w-7 h-7 rounded-lg border border-bone-300 bg-white text-mute-500 hover:bg-danger-100 hover:text-danger-600 flex items-center justify-center">
                  <Icon name="trash" size={13}/>
                </button>
              </div>
              <input
                value={step[`title_${activeLang}`] || ''}
                onChange={e => update(i, { [`title_${activeLang}`]: e.target.value })}
                placeholder={`Titre de l'étape (${activeLang.toUpperCase()})`}
                className="w-full h-11 px-3.5 border border-bone-500 rounded-xl bg-sand-75 focus:bg-white font-semibold text-[14.5px] text-ink-800 outline-none focus:border-terra-600 focus:ring-[3px] focus:ring-terra-600/12 transition"
              />
              <textarea
                value={step[`description_${activeLang}`] || ''}
                onChange={e => update(i, { [`description_${activeLang}`]: e.target.value })}
                placeholder={`Description de la journée (${activeLang.toUpperCase()})`}
                rows={3}
                className="w-full mt-2.5 px-3.5 py-3 border border-bone-500 rounded-xl bg-sand-75 focus:bg-white text-[13.5px] text-mute-700 leading-relaxed outline-none focus:border-terra-600 focus:ring-[3px] focus:ring-terra-600/12 transition resize-y"
              />
            </div>
          </div>
        ))}

        <button
          onClick={add}
          className="ml-[52px] h-11 px-5 border-[1.5px] border-dashed border-bone-600 rounded-xl bg-sand-75 text-terra-700 font-bold text-[13.5px] inline-flex items-center gap-2 hover:bg-sand-100 hover:border-terra-600 transition"
        >
          <Icon name="plus" size={16} stroke={2}/> Ajouter une étape
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// MultilangListEditor : liste de textes multilingues (highlights, includes)
// =====================================================================
function MultilangListEditor({ value, onChange, singular = 'élément' }) {
  const [activeLang, setActiveLang] = useState('fr');

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
    <div>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-[22px] text-ink-800">Points forts</h3>
          <p className="mt-1 text-[13px] text-mute-500">{value.length} {singular}{value.length > 1 ? 's' : ''}</p>
        </div>
        <LangPills active={activeLang} onChange={setActiveLang} completion={{
          fr: value.every(s => s.text_fr?.trim()),
          en: value.every(s => s.text_en?.trim()),
          it: value.every(s => s.text_it?.trim()),
          de: value.every(s => s.text_de?.trim())
        }}/>
      </div>

      <div className="space-y-2.5">
        {value.length === 0 && (
          <div className="text-center py-10 text-mute-500 text-[13.5px]">
            Aucun {singular}. Cliquez pour en ajouter un.
          </div>
        )}
        {value.map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-white border border-bone-200 rounded-2xl p-2.5">
            <span className="font-mono text-[10px] text-mute-400 w-6 text-center">#{i + 1}</span>
            <input
              value={item[`text_${activeLang}`] || ''}
              onChange={e => update(i, { [`text_${activeLang}`]: e.target.value })}
              placeholder={`Point fort (${activeLang.toUpperCase()})`}
              className="flex-1 h-10 px-3 rounded-xl border border-bone-500 bg-sand-75 focus:bg-white text-[13.5px] outline-none focus:border-terra-600 focus:ring-[3px] focus:ring-terra-600/12 transition"
            />
            <div className="flex gap-1">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="w-8 h-8 rounded-lg border border-bone-300 bg-white text-mute-500 hover:bg-sand-100 disabled:opacity-30">↑</button>
              <button onClick={() => move(i, 1)}  disabled={i === value.length - 1} className="w-8 h-8 rounded-lg border border-bone-300 bg-white text-mute-500 hover:bg-sand-100 disabled:opacity-30">↓</button>
              <ActionBtn variant="danger" onClick={() => remove(i)} title="Supprimer"><Icon name="trash" size={13}/></ActionBtn>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="mt-3 h-11 px-5 border-[1.5px] border-dashed border-bone-600 rounded-xl bg-sand-75 text-terra-700 font-bold text-[13.5px] inline-flex items-center gap-2 hover:bg-sand-100 hover:border-terra-600 transition"
      >
        <Icon name="plus" size={16} stroke={2}/> Ajouter un {singular}
      </button>
    </div>
  );
}

// =====================================================================
// BadgesEditor : badges emoji + texte multilingue court
// =====================================================================
function BadgesEditor({ value, onChange }) {
  const [activeLang, setActiveLang] = useState('fr');
  const add = () => onChange([...value, { emoji: '✨', text_fr: '', text_en: '', text_it: '', text_de: '' }]);
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const update = (i, patch) => onChange(value.map((it, idx) => idx === i ? { ...it, ...patch } : it));

  return (
    <div>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-[22px] text-ink-800">Badges</h3>
          <p className="mt-1 text-[13px] text-mute-500">Pastilles courtes affichées sur la fiche circuit.</p>
        </div>
        <LangPills active={activeLang} onChange={setActiveLang}/>
      </div>

      <div className="space-y-2.5">
        {value.length === 0 && (
          <div className="text-center py-10 text-mute-500 text-[13.5px]">Aucun badge. Cliquez pour en ajouter un.</div>
        )}
        {value.map((b, i) => (
          <div key={i} className="flex items-center gap-2 bg-white border border-bone-200 rounded-2xl p-2.5">
            <input
              value={b.emoji || ''}
              onChange={e => update(i, { emoji: e.target.value })}
              className="w-14 h-10 rounded-xl border border-bone-500 bg-white text-center text-xl outline-none focus:border-terra-600 focus:ring-[3px] focus:ring-terra-600/12 transition"
            />
            <input
              value={b[`text_${activeLang}`] || ''}
              onChange={e => update(i, { [`text_${activeLang}`]: e.target.value })}
              placeholder={`Texte court (${activeLang.toUpperCase()})`}
              className="flex-1 h-10 px-3 rounded-xl border border-bone-500 bg-sand-75 focus:bg-white text-[13.5px] outline-none focus:border-terra-600 focus:ring-[3px] focus:ring-terra-600/12 transition"
            />
            <ActionBtn variant="danger" onClick={() => remove(i)} title="Supprimer"><Icon name="trash" size={13}/></ActionBtn>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="mt-3 h-11 px-5 border-[1.5px] border-dashed border-bone-600 rounded-xl bg-sand-75 text-terra-700 font-bold text-[13.5px] inline-flex items-center gap-2 hover:bg-sand-100 hover:border-terra-600 transition"
      >
        <Icon name="plus" size={16} stroke={2}/> Ajouter un badge
      </button>
    </div>
  );
}

// =====================================================================
// GalleryEditor : galerie photos avec alt multilingues
// =====================================================================
function GalleryEditor({ value, onChange }) {
  const [activeLang, setActiveLang] = useState('fr');
  const add = () => onChange([...value, { url: '', alt_fr: '', alt_en: '', alt_it: '', alt_de: '' }]);
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const update = (i, patch) => onChange(value.map((it, idx) => idx === i ? { ...it, ...patch } : it));

  return (
    <div>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-[22px] text-ink-800">Galerie photos</h3>
          <p className="mt-1 text-[13px] text-mute-500">{value.length} photo{value.length > 1 ? 's' : ''} · alt utile pour l'accessibilité et le SEO.</p>
        </div>
        <LangPills active={activeLang} onChange={setActiveLang}/>
      </div>

      <div className="space-y-3">
        {value.length === 0 && (
          <div className="text-center py-10 text-mute-500 text-[13.5px]">Aucune photo dans la galerie.</div>
        )}
        {value.map((p, i) => (
          <div key={i} className="flex items-start gap-3 bg-white border border-bone-200 rounded-2xl p-3">
            {p.url
              ? <img src={p.url} alt="" className="w-24 h-24 object-cover rounded-xl flex-shrink-0"/>
              : <div className="w-24 h-24 rounded-xl flex-shrink-0 act-thumb-a"/>
            }
            <div className="flex-1 space-y-2">
              <Input value={p.url} onChange={e => update(i, { url: e.target.value })} placeholder="URL de la photo (Médiathèque ou externe)"/>
              <Input
                value={p[`alt_${activeLang}`] || ''}
                onChange={e => update(i, { [`alt_${activeLang}`]: e.target.value })}
                placeholder={`Alt / description accessible (${activeLang.toUpperCase()})`}
              />
            </div>
            <ActionBtn variant="danger" onClick={() => remove(i)} title="Supprimer"><Icon name="trash" size={13}/></ActionBtn>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="mt-3 h-11 px-5 border-[1.5px] border-dashed border-bone-600 rounded-xl bg-sand-75 text-terra-700 font-bold text-[13.5px] inline-flex items-center gap-2 hover:bg-sand-100 hover:border-terra-600 transition"
      >
        <Icon name="plus" size={16} stroke={2}/> Ajouter une photo
      </button>
    </div>
  );
}

window.CircuitsPage = CircuitsPage;
window.ItineraryEditor = ItineraryEditor;
window.MultilangListEditor = MultilangListEditor;
window.BadgesEditor = BadgesEditor;
window.GalleryEditor = GalleryEditor;

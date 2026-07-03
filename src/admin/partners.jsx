// =====================================================================
// src/admin/partners.jsx — CRUD Partenaires (cards, design refondu)
// =====================================================================

function PartnersPage() {
  const col = useCollection('partners');
  const [editing, setEditing] = useState(null);

  const openCreate = () => setEditing({
    name: '', logo: '', website: '', description_fr: '',
    category: 'transport', published: false, sort_order: 100
  });

  useEffect(() => {
    const cb = (e) => e.detail.section === 'partners' && openCreate();
    window.addEventListener('act-admin-cta', cb);
    return () => window.removeEventListener('act-admin-cta', cb);
  }, []);

  const onDelete = async (row) => {
    if (!(await window.askConfirm(`Retirer le partenaire "${row.name}" ?`, 'Retirer'))) return;
    await col.remove(row.id);
    window.toast('Partenaire retiré', 'success');
  };

  const catLabel = {
    transport: 'Transport', hebergement: 'Hébergement',
    'compagnie-croisiere': 'Croisière', restauration: 'Restauration',
    guide: 'Guide local', autre: 'Autre', artisanat: 'Artisanat', aerien: 'Aérien'
  };
  const catTone = {
    hebergement:            'bg-info-100 text-info-600',
    transport:              'bg-brand-100 text-terra-700',
    'compagnie-croisiere':  'bg-info-100 text-info-600',
    restauration:           'bg-success-100 text-success-600',
    artisanat:              'bg-brand-100 text-terra-700',
    aerien:                 'bg-info-100 text-ocean-700',
    guide:                  'bg-success-100 text-success-600',
    autre:                  'bg-bone-100 text-mute-700'
  };

  return (
    <PagePad>
      <ListToolbar
        query={col.query}
        onQuery={col.setQuery}
        count={`${col.items.length} partenaire${col.items.length > 1 ? 's' : ''} de confiance`}
        onCreate={openCreate}
        createLabel="Nouveau partenaire"
      />

      {col.loading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg"/></div>
      ) : col.filtered.length === 0 ? (
        <EmptyState icon={<Icon name="handshake" size={28}/>} title="Aucun partenaire"/>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {col.filtered.map(p => (
            <div
              key={p.id}
              onClick={() => setEditing(p)}
              className="bg-white border border-bone-200 rounded-2xl p-4 cursor-pointer shadow-act-card hover:shadow-act-card-hover hover:border-bone-500 transition"
            >
              <div className="flex items-center gap-3">
                {p.logo ? (
                  <img src={p.logo} alt={p.name} className="w-[52px] h-[52px] rounded-2xl border border-bone-300 object-contain bg-white p-1.5 flex-shrink-0"/>
                ) : (
                  <div className="w-[52px] h-[52px] rounded-2xl bg-sand-100 border border-bone-300 text-terra-800 flex items-center justify-center font-display text-[20px] flex-shrink-0">
                    {initials(p.name).slice(0, 2)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-bold text-[15px] text-ink-800 truncate">{p.name}</div>
                  {p.description_fr && <div className="text-[12px] text-mute-500 truncate mt-0.5">{truncate(p.description_fr, 40)}</div>}
                </div>
              </div>
              <div className="mt-3.5 pt-3.5 border-t border-bone-100 flex items-center justify-between">
                <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full ${catTone[p.category] || catTone.autre}`}>
                  {catLabel[p.category] || p.category}
                </span>
                <div className="flex items-center gap-2">
                  {p.website && (
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-[12px] font-semibold text-info-600 hover:text-info-700 transition"
                    >
                      Site <Icon name="externalLink" size={13}/>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <PartnerEditor partner={editing} onClose={() => setEditing(null)} col={col} onDelete={onDelete}/>}
    </PagePad>
  );
}

function PartnerEditor({ partner, onClose, col, onDelete }) {
  const [form, setForm] = useState(partner);
  const [saving, setSaving] = useState(false);
  const isNew = !partner.id;
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  const doSave = async (publish) => {
    if (!form.name?.trim()) { window.toast('Le nom est obligatoire', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (publish !== undefined) payload.published = publish;
      delete payload.created_at;
      delete payload.updated_at;
      if (isNew) { delete payload.id; await col.create(payload); window.toast('Partenaire créé', 'success'); }
      else { await col.update(partner.id, payload); window.toast('Enregistré', 'success'); }
      onClose();
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <EditorLayout
      open={true}
      onClose={onClose}
      kicker="Fiche partenaire"
      title={isNew ? 'Nouveau partenaire' : partner.name}
      statusPill={<StatusPill published={form.published} publishedLabel="Visible" draftLabel="Masqué"/>}
      size="lg"
      onSave={() => doSave(true)}
      onSaveDraft={() => doSave(false)}
      saving={saving}
      publishLabel="Publier"
      footerLeft={partner.updated_at && <><Icon name="clock" size={13}/> {timeAgo(partner.updated_at)}</>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nom" required>
          <Input value={form.name} onChange={e => set({ name: e.target.value })}/>
        </Field>
        <Field label="Catégorie">
          <Select value={form.category || ''} onChange={e => set({ category: e.target.value })}>
            <option value="transport">Transport</option>
            <option value="hebergement">Hébergement</option>
            <option value="compagnie-croisiere">Compagnie de croisière</option>
            <option value="restauration">Restauration</option>
            <option value="guide">Guide local</option>
            <option value="artisanat">Artisanat</option>
            <option value="aerien">Aérien</option>
            <option value="autre">Autre</option>
          </Select>
        </Field>
        <Field label="Logo (URL)">
          <Input value={form.logo || ''} onChange={e => set({ logo: e.target.value })}/>
        </Field>
        <Field label="Site web">
          <Input type="url" value={form.website || ''} onChange={e => set({ website: e.target.value })} placeholder="https://…"/>
        </Field>
      </div>

      <MultilangField label="Description" type="textarea" rows={4} values={pickLangValues(form, 'description')} onChange={v => set(spreadLangValues('description', v))}/>
    </EditorLayout>
  );
}

window.PartnersPage = PartnersPage;

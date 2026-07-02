// =====================================================================
// src/admin/partners.jsx — CRUD Partenaires
// =====================================================================

function PartnersPage() {
  const col = useCollection('partners');
  const [editing, setEditing] = useState(null);

  const openCreate = () => setEditing({
    name: '', logo: '', website: '', description_fr: '',
    category: 'transport', published: false, sort_order: 100
  });

  const onDelete = async (row) => {
    if (!(await window.askConfirm(`Retirer le partenaire "${row.name}" ?`, 'Retirer'))) return;
    await col.remove(row.id);
    window.toast('Partenaire retiré', 'success');
  };

  const catLabel = {
    transport: 'Transport', hebergement: 'Hébergement',
    'compagnie-croisiere': 'Croisiériste', restauration: 'Restauration',
    guide: 'Guide local', autre: 'Autre'
  };

  const columns = [
    { key: 'logo', label: '', width: '80px', render: r => r.logo
        ? <img src={r.logo} alt="" className="h-10 object-contain"/>
        : <div className="w-12 h-10 bg-sand-100 rounded flex items-center justify-center text-ink-800/40">—</div> },
    { key: 'name', label: 'Nom' },
    { key: 'category', label: 'Catégorie', width: '160px', render: r => <Badge>{catLabel[r.category] || r.category}</Badge> },
    { key: 'website', label: 'Site web', render: r => r.website
        ? <a href={r.website} target="_blank" rel="noreferrer" className="text-terra-600 hover:underline text-sm">{truncate(r.website, 40)}</a>
        : '—' },
    { key: 'published', label: 'Statut', width: '110px', render: r => <StatusPill published={r.published}/> }
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader title="Partenaires" subtitle={`${col.items.length} partenaire${col.items.length > 1 ? 's' : ''}`}/>
      <ListToolbar query={col.query} onQuery={col.setQuery} onCreate={openCreate} createLabel="Nouveau partenaire"/>
      <ItemsTable
        items={col.filtered}
        columns={columns}
        onRowClick={setEditing}
        onDelete={onDelete}
        onTogglePublish={async row => { await col.togglePublish(row); window.toast(row.published ? 'Masqué' : 'Publié', 'success'); }}
        loading={col.loading}
      />
      {editing && <PartnerEditor partner={editing} onClose={() => setEditing(null)} col={col}/>}
    </div>
  );
}

function PartnerEditor({ partner, onClose, col }) {
  const [form, setForm] = useState(partner);
  const [saving, setSaving] = useState(false);
  const isNew = !partner.id;
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  const save = async () => {
    if (!form.name?.trim()) { window.toast('Le nom est obligatoire', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
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
      title={isNew ? 'Nouveau partenaire' : `Éditer : ${partner.name}`}
      onSave={save}
      saving={saving}
      size="lg"
      footer={<Toggle checked={form.published} onChange={v => set({ published: v })} label={form.published ? 'Visible' : 'Masqué'}/>}
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

// =====================================================================
// src/admin/team.jsx — CRUD Équipe
// =====================================================================

function TeamPage() {
  const col = useCollection('team_members');
  const [editing, setEditing] = useState(null);

  const openCreate = () => setEditing({
    name: '', role_fr: '', bio_fr: '', photo: '', email: '', phone: '', linkedin_url: '',
    published: false, sort_order: 100
  });

  const onDelete = async (row) => {
    if (!(await window.askConfirm(`Retirer ${row.name} de l'équipe ?`, 'Retirer'))) return;
    await col.remove(row.id);
    window.toast('Membre retiré', 'success');
  };

  const columns = [
    { key: 'photo', label: '', width: '60px', render: r => r.photo
        ? <img src={r.photo} alt="" className="w-10 h-10 rounded-full object-cover"/>
        : <div className="w-10 h-10 rounded-full bg-sand-200 flex items-center justify-center text-ink-800/40">👤</div> },
    { key: 'name', label: 'Nom', render: r => (
      <div>
        <div className="font-medium text-ink-900">{r.name}</div>
        <div className="text-xs text-ink-800/50">{r.role_fr || '—'}</div>
      </div>
    ) },
    { key: 'email', label: 'Email', render: r => r.email || '—' },
    { key: 'published', label: 'Statut', width: '110px', render: r => <StatusPill published={r.published}/> }
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader title="Équipe" subtitle={`${col.items.length} membre${col.items.length > 1 ? 's' : ''}`}/>
      <ListToolbar query={col.query} onQuery={col.setQuery} onCreate={openCreate} createLabel="Nouveau membre"/>
      <ItemsTable
        items={col.filtered}
        columns={columns}
        onRowClick={setEditing}
        onDelete={onDelete}
        onTogglePublish={async row => { await col.togglePublish(row); window.toast(row.published ? 'Masqué' : 'Publié', 'success'); }}
        loading={col.loading}
      />
      {editing && <TeamEditor member={editing} onClose={() => setEditing(null)} col={col}/>}
    </div>
  );
}

function TeamEditor({ member, onClose, col }) {
  const [form, setForm] = useState(member);
  const [saving, setSaving] = useState(false);
  const isNew = !member.id;
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  const save = async () => {
    if (!form.name?.trim()) { window.toast('Le nom est obligatoire', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.created_at;
      delete payload.updated_at;
      if (isNew) { delete payload.id; await col.create(payload); window.toast('Membre ajouté', 'success'); }
      else { await col.update(member.id, payload); window.toast('Enregistré', 'success'); }
      onClose();
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <EditorLayout
      open={true}
      onClose={onClose}
      title={isNew ? 'Nouveau membre' : `Éditer : ${member.name}`}
      onSave={save}
      saving={saving}
      size="lg"
      footer={<Toggle checked={form.published} onChange={v => set({ published: v })} label={form.published ? 'Visible' : 'Masqué'}/>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nom complet" required>
          <Input value={form.name} onChange={e => set({ name: e.target.value })}/>
        </Field>
        <Field label="Photo (URL)">
          <Input value={form.photo || ''} onChange={e => set({ photo: e.target.value })}/>
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email || ''} onChange={e => set({ email: e.target.value })}/>
        </Field>
        <Field label="Téléphone">
          <Input value={form.phone || ''} onChange={e => set({ phone: e.target.value })}/>
        </Field>
        <Field label="LinkedIn (URL)" className="sm:col-span-2">
          <Input value={form.linkedin_url || ''} onChange={e => set({ linkedin_url: e.target.value })}/>
        </Field>
      </div>

      <MultilangField label="Rôle / titre" values={pickLangValues(form, 'role')} onChange={v => set(spreadLangValues('role', v))} placeholder="Directeur Général, Chef guide…"/>
      <MultilangField label="Biographie" type="textarea" rows={5} values={pickLangValues(form, 'bio')} onChange={v => set(spreadLangValues('bio', v))}/>
    </EditorLayout>
  );
}

window.TeamPage = TeamPage;

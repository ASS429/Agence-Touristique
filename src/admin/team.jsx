// =====================================================================
// src/admin/team.jsx — CRUD Équipe (cards portrait 4:5, design refondu)
// =====================================================================

function TeamPage() {
  const col = useCollection('team_members');
  const [editing, setEditing] = useState(null);

  const openCreate = () => setEditing({
    name: '', role_fr: '', bio_fr: '', photo: '', email: '', phone: '', linkedin_url: '',
    published: false, sort_order: 100
  });

  useEffect(() => {
    const cb = (e) => e.detail.section === 'team' && openCreate();
    window.addEventListener('act-admin-cta', cb);
    return () => window.removeEventListener('act-admin-cta', cb);
  }, []);

  const onDelete = async (row) => {
    if (!(await window.askConfirm(`Retirer ${row.name} de l'équipe ?`, 'Retirer'))) return;
    await col.remove(row.id);
    window.toast('Membre retiré', 'success');
  };

  return (
    <PagePad>
      <ListToolbar
        query={col.query}
        onQuery={col.setQuery}
        count={`${col.items.length} membre${col.items.length > 1 ? 's' : ''} de l'équipe ACT`}
        onCreate={openCreate}
        createLabel="Ajouter un membre"
      />

      {col.loading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg"/></div>
      ) : col.filtered.length === 0 ? (
        <EmptyState icon={<Icon name="users" size={28}/>} title="Aucun membre"/>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {col.filtered.map((m, i) => (
            <div
              key={m.id}
              onClick={() => setEditing(m)}
              className="bg-white border border-bone-200 rounded-2xl overflow-hidden cursor-pointer shadow-act-card hover:shadow-act-card-hover hover:border-bone-500 transition"
            >
              <div className={`relative flex items-center justify-center act-thumb-${['a','b','c'][i % 3]}`} style={{ aspectRatio: '4/5' }}>
                {m.photo ? (
                  <img src={m.photo} alt={m.name} className="absolute inset-0 w-full h-full object-cover"/>
                ) : (
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center font-display text-[26px] shadow"
                    style={{ background: 'rgba(251,248,243,.9)', color: '#8A3A21' }}
                  >{initials(m.name)}</div>
                )}
                {!m.published && (
                  <div className="absolute top-3 right-3">
                    <StatusPill published={false}/>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="font-bold text-[15.5px] text-ink-800">{m.name}</div>
                <div className="text-[12.5px] text-terra-700 font-semibold mt-0.5">{m.role_fr || '—'}</div>
                <div className="mt-2.5 pt-2.5 border-t border-bone-100 text-[11.5px] text-mute-500">
                  {m.email && <div className="truncate">{m.email}</div>}
                  {m.phone && <div className="mt-0.5 text-mute-400">{m.phone}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <TeamEditor member={editing} onClose={() => setEditing(null)} col={col}/>}
    </PagePad>
  );
}

function TeamEditor({ member, onClose, col }) {
  const [form, setForm] = useState(member);
  const [saving, setSaving] = useState(false);
  const isNew = !member.id;
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  const doSave = async (publish) => {
    if (!form.name?.trim()) { window.toast('Le nom est obligatoire', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (publish !== undefined) payload.published = publish;
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
      kicker="Fiche membre équipe"
      title={isNew ? 'Nouveau membre' : member.name}
      statusPill={<StatusPill published={form.published} publishedLabel="Visible" draftLabel="Masqué"/>}
      size="lg"
      onSave={() => doSave(true)}
      onSaveDraft={() => doSave(false)}
      saving={saving}
      publishLabel="Publier"
      footerLeft={member.updated_at && <><Icon name="clock" size={13}/> {timeAgo(member.updated_at)}</>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nom complet" required>
          <Input value={form.name} onChange={e => set({ name: e.target.value })}/>
        </Field>
        <Field label="Photo (URL, portrait 4:5)">
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

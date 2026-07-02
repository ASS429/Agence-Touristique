// =====================================================================
// src/admin/faq.jsx — CRUD FAQ (regroupé par catégorie)
// =====================================================================

const FAQ_CATEGORIES = [
  { id: 'general',     label: 'Général' },
  { id: 'reservation', label: 'Réservation' },
  { id: 'voyage',      label: 'Voyage' },
  { id: 'paiement',    label: 'Paiement' },
  { id: 'sante',       label: 'Santé & sécurité' }
];

function FAQPage() {
  const col = useCollection('faq_items');
  const [editing, setEditing] = useState(null);
  const [filterCat, setFilterCat] = useState('');

  const openCreate = () => setEditing({
    category: filterCat || 'general',
    question_fr: '', answer_fr: '',
    published: false, sort_order: 100
  });

  const onDelete = async (row) => {
    if (!(await window.askConfirm(`Supprimer cette question ?`, 'Supprimer'))) return;
    await col.remove(row.id);
    window.toast('Question supprimée', 'success');
  };

  const filtered = useMemo(() => {
    let f = col.filtered;
    if (filterCat) f = f.filter(r => r.category === filterCat);
    return f;
  }, [col.filtered, filterCat]);

  const catLabel = Object.fromEntries(FAQ_CATEGORIES.map(c => [c.id, c.label]));

  const columns = [
    { key: 'category', label: 'Catégorie', width: '160px', render: r => <Badge>{catLabel[r.category] || r.category}</Badge> },
    { key: 'question_fr', label: 'Question', render: r => truncate(r.question_fr, 100) },
    { key: 'published', label: 'Statut', width: '110px', render: r => <StatusPill published={r.published}/> }
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader title="FAQ" subtitle={`${col.items.length} question${col.items.length > 1 ? 's' : ''}`}/>
      <ListToolbar
        query={col.query}
        onQuery={col.setQuery}
        onCreate={openCreate}
        createLabel="Nouvelle question"
        right={
          <Select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="max-w-xs">
            <option value="">Toutes catégories</option>
            {FAQ_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
        }
      />
      <ItemsTable
        items={filtered}
        columns={columns}
        onRowClick={setEditing}
        onDelete={onDelete}
        onTogglePublish={async row => { await col.togglePublish(row); window.toast(row.published ? 'Dépubliée' : 'Publiée', 'success'); }}
        loading={col.loading}
      />
      {editing && <FAQEditor faq={editing} onClose={() => setEditing(null)} col={col}/>}
    </div>
  );
}

function FAQEditor({ faq, onClose, col }) {
  const [form, setForm] = useState(faq);
  const [saving, setSaving] = useState(false);
  const isNew = !faq.id;
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  const save = async () => {
    if (!form.question_fr?.trim()) { window.toast('La question FR est obligatoire', 'error'); return; }
    if (!form.answer_fr?.trim()) { window.toast('La réponse FR est obligatoire', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.created_at;
      delete payload.updated_at;
      if (isNew) { delete payload.id; await col.create(payload); window.toast('Question créée', 'success'); }
      else { await col.update(faq.id, payload); window.toast('Enregistré', 'success'); }
      onClose();
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <EditorLayout
      open={true}
      onClose={onClose}
      title={isNew ? 'Nouvelle question' : 'Éditer la question'}
      onSave={save}
      saving={saving}
      size="lg"
      footer={<Toggle checked={form.published} onChange={v => set({ published: v })} label={form.published ? 'Publiée' : 'Brouillon'}/>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Catégorie" required>
          <Select value={form.category} onChange={e => set({ category: e.target.value })}>
            {FAQ_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
        </Field>
        <Field label="Ordre d'affichage">
          <Input type="number" value={form.sort_order} onChange={e => set({ sort_order: parseInt(e.target.value) || 0 })}/>
        </Field>
      </div>

      <MultilangField label="Question" required values={pickLangValues(form, 'question')} onChange={v => set(spreadLangValues('question', v))}/>
      <MultilangField label="Réponse" type="textarea" rows={5} required values={pickLangValues(form, 'answer')} onChange={v => set(spreadLangValues('answer', v))}/>
    </EditorLayout>
  );
}

window.FAQPage = FAQPage;

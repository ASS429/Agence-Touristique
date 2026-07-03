// =====================================================================
// src/admin/faq.jsx — CRUD FAQ (accordion groupé, design refondu)
// =====================================================================

const FAQ_CATEGORIES = [
  { id: 'general',     label: 'Général' },
  { id: 'reservation', label: 'Avant le départ' },
  { id: 'voyage',      label: 'Sur place' },
  { id: 'paiement',    label: 'Paiement & annulation' },
  { id: 'sante',       label: 'Santé & sécurité' }
];

function FAQPage() {
  const col = useCollection('faq_items');
  const [editing, setEditing] = useState(null);
  const [openId, setOpenId] = useState(null);

  const openCreate = () => setEditing({
    category: 'general',
    question_fr: '', answer_fr: '',
    published: false, sort_order: 100
  });

  useEffect(() => {
    const cb = (e) => e.detail.section === 'faq' && openCreate();
    window.addEventListener('act-admin-cta', cb);
    return () => window.removeEventListener('act-admin-cta', cb);
  }, []);

  const onDelete = async (row) => {
    if (!(await window.askConfirm('Supprimer cette question ?', 'Supprimer'))) return;
    await col.remove(row.id);
    window.toast('Question supprimée', 'success');
  };

  const grouped = useMemo(() => {
    const g = {};
    for (const cat of FAQ_CATEGORIES) g[cat.id] = [];
    for (const item of col.filtered) {
      (g[item.category] = g[item.category] || []).push(item);
    }
    return g;
  }, [col.filtered]);

  const catLabelMap = Object.fromEntries(FAQ_CATEGORIES.map(c => [c.id, c.label]));

  return (
    <PagePad maxWidth="max-w-[860px]">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-400">Aide aux voyageurs</div>
          <div className="mt-1 font-display text-[26px] text-ink-800">Questions <span className="italic text-terra-600">fréquentes</span></div>
        </div>
        <div className="flex-1"/>
        <div className="font-mono text-[11px] text-mute-500">{col.items.length} question{col.items.length > 1 ? 's' : ''}</div>
        <Btn onClick={openCreate} icon={<Icon name="plus" size={16} stroke={2}/>}>Nouvelle question</Btn>
      </div>

      {col.loading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg"/></div>
      ) : col.items.length === 0 ? (
        <EmptyState icon={<Icon name="help" size={28}/>} title="Aucune question FAQ"/>
      ) : (
        <div className="space-y-6">
          {FAQ_CATEGORIES.map(cat => {
            const items = grouped[cat.id];
            if (!items || items.length === 0) return null;
            return (
              <div key={cat.id}>
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-400 mb-2.5">
                  {cat.label}
                </div>
                <div className="flex flex-col gap-2.5">
                  {items.map(item => {
                    const isOpen = openId === item.id;
                    const langsMissing = ['en','it','de'].filter(l => !item[`question_${l}`]?.trim() || !item[`answer_${l}`]?.trim()).length;
                    return (
                      <div key={item.id} className="bg-white border border-bone-200 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setOpenId(isOpen ? null : item.id)}
                          className="w-full flex items-center gap-3.5 px-4 py-4 bg-transparent text-left"
                        >
                          <span className="flex-1 font-bold text-[15px] text-ink-800">{item.question_fr}</span>
                          {!item.published && <StatusPill published={false} draftLabel="Brouillon"/>}
                          {langsMissing > 0 && (
                            <span className="text-[10.5px] font-bold text-warn-600 bg-warn-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                              {langsMissing} langue{langsMissing > 1 ? 's' : ''} à traduire
                            </span>
                          )}
                          <span className={`text-mute-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                            <Icon name="chevronDown" size={18}/>
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4">
                            <div className="px-4 py-3.5 bg-sand-50 border border-bone-200 rounded-xl text-[14px] text-mute-700 leading-relaxed">
                              {item.answer_fr}
                            </div>
                            <div className="mt-2.5 flex items-center gap-3 flex-wrap">
                              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-mute-400">Traductions</span>
                              <LangDots row={item} field="question"/>
                              <div className="flex-1"/>
                              <Btn variant="secondary" size="sm" onClick={() => setEditing(item)} icon={<Icon name="pen" size={13}/>}>Éditer</Btn>
                              <ActionBtn variant="danger" onClick={() => onDelete(item)} title="Supprimer"><Icon name="trash" size={13}/></ActionBtn>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && <FAQEditor faq={editing} onClose={() => setEditing(null)} col={col}/>}
    </PagePad>
  );
}

function FAQEditor({ faq, onClose, col }) {
  const [form, setForm] = useState(faq);
  const [saving, setSaving] = useState(false);
  const isNew = !faq.id;
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  const doSave = async (publish) => {
    if (!form.question_fr?.trim()) { window.toast('La question FR est obligatoire', 'error'); return; }
    if (!form.answer_fr?.trim()) { window.toast('La réponse FR est obligatoire', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (publish !== undefined) payload.published = publish;
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
      kicker="FAQ · Question"
      title={isNew ? 'Nouvelle question' : truncate(form.question_fr, 60)}
      statusPill={<StatusPill published={form.published}/>}
      size="lg"
      onSave={() => doSave(true)}
      onSaveDraft={() => doSave(false)}
      saving={saving}
      publishLabel="Publier"
      footerLeft={faq.updated_at && <><Icon name="clock" size={13}/> {timeAgo(faq.updated_at)}</>}
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

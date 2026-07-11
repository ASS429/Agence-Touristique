import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from './icons.jsx';
import { MultilangField, pickLangValues, spreadLangValues } from './lang.jsx';
import { EditorLayout, ListToolbar, PagePad, useCollection } from './list-editor.jsx';
import { ActionBtn, EmptyState, Field, Input, Select, Spinner, StatusPill, timeAgo, truncate } from './ui.jsx';

// =====================================================================
// src/admin/testimonials.jsx — CRUD Témoignages (cards, design refondu)
// =====================================================================

function TestimonialsPage() {
  const col = useCollection('testimonials');
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');

  const openCreate = () => setEditing({
    author_name: '', author_country: '',
    source: 'internal', text_fr: '',
    rating: 5, travel_date: null,
    published: false, sort_order: 100
  });

  useEffect(() => {
    const cb = (e) => e.detail.section === 'testimonials' && openCreate();
    window.addEventListener('act-admin-cta', cb);
    return () => window.removeEventListener('act-admin-cta', cb);
  }, []);

  const onDelete = async (row) => {
    if (!(await window.askConfirm(`Supprimer le témoignage de ${row.author_name} ?`, 'Supprimer'))) return;
    await col.remove(row.id);
    window.toast('Témoignage supprimé', 'success');
  };

  const filtered = useMemo(() => {
    let f = col.filtered;
    if (filter === 'validate') f = f.filter(r => !r.published);
    if (filter === 'published') f = f.filter(r =>  r.published);
    return f;
  }, [col.filtered, filter]);

  const filters = [
    { id: 'all',       label: 'Tous',       count: col.items.length },
    { id: 'validate',  label: 'À valider',  count: col.items.filter(r => !r.published).length },
    { id: 'published', label: 'Publiés',    count: col.items.filter(r =>  r.published).length }
  ];

  return (
    <PagePad>
      <ListToolbar
        query={col.query}
        onQuery={col.setQuery}
        filters={filters}
        activeFilter={filter}
        onFilter={setFilter}
        count={`${col.items.length} témoignage${col.items.length > 1 ? 's' : ''}`}
        onCreate={openCreate}
        createLabel="Nouveau témoignage"
      />

      {col.loading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg"/></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Icon name="star" size={28}/>} title="Aucun témoignage"/>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <div key={t.id} className="bg-white border border-bone-200 rounded-2xl p-5 shadow-act-card flex flex-col">
              <div className="flex items-center justify-between">
                <Stars n={t.rating || 5}/>
                <StatusPill published={t.published} publishedLabel="Publié" draftLabel="À valider"/>
              </div>
              <div className="mt-3.5 font-display text-[19px] leading-[1.32] text-ink-700 flex-1 italic">
                « {truncate(t.text_fr, 200)} »
              </div>
              <div className="mt-4 pt-3.5 border-t border-bone-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-[14px] text-ink-800 truncate">{t.author_name}</div>
                  <div className="text-[12px] text-mute-500 truncate">
                    {[t.author_country, t.source && sourceLabel(t.source)].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {!t.published && (
                    <>
                      <button
                        onClick={() => onDelete(t)}
                        aria-label="Refuser"
                        className="w-9 h-9 rounded-xl border border-bone-300 bg-white text-danger-600 hover:bg-danger-100 flex items-center justify-center transition"
                      ><Icon name="x" size={15}/></button>
                      <button
                        onClick={async () => {
                          await col.togglePublish(t);
                          window.toast('Témoignage publié', 'success');
                        }}
                        aria-label="Publier"
                        className="w-9 h-9 rounded-xl bg-success-600 text-white hover:bg-success-700 flex items-center justify-center transition"
                      ><Icon name="check" size={15}/></button>
                    </>
                  )}
                  {t.published && (
                    <ActionBtn variant="danger" onClick={() => onDelete(t)} title="Supprimer"><Icon name="trash" size={13}/></ActionBtn>
                  )}
                  <ActionBtn variant="info" onClick={() => setEditing(t)} title="Modifier"><Icon name="pen" size={13}/></ActionBtn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <TestimonialEditor tm={editing} onClose={() => setEditing(null)} col={col}/>}
    </PagePad>
  );
}

function Stars({ n }) {
  return (
    <div className="flex gap-0.5 text-[15px] tracking-widest">
      {[0,1,2,3,4].map(i => (
        <span key={i} style={{ color: i < n ? '#D46B4C' : '#E4D9C4' }}>★</span>
      ))}
    </div>
  );
}

function sourceLabel(src) {
  return { tripadvisor: 'TripAdvisor', google: 'Google', internal: 'Direct' }[src] || src;
}

function TestimonialEditor({ tm, onClose, col }) {
  const [form, setForm] = useState(tm);
  const [saving, setSaving] = useState(false);
  const isNew = !tm.id;
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  const doSave = async (publish) => {
    if (!form.author_name?.trim()) { window.toast('Le nom est obligatoire', 'error'); return; }
    if (!form.text_fr?.trim()) { window.toast('Le texte FR est obligatoire', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (publish !== undefined) payload.published = publish;
      delete payload.created_at;
      delete payload.updated_at;
      if (isNew) { delete payload.id; await col.create(payload); window.toast('Témoignage créé', 'success'); }
      else { await col.update(tm.id, payload); window.toast('Enregistré', 'success'); }
      onClose();
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <EditorLayout
      open={true}
      onClose={onClose}
      kicker="Édition témoignage"
      title={isNew ? 'Nouveau témoignage' : tm.author_name}
      statusPill={<StatusPill published={form.published} publishedLabel="Publié" draftLabel="À valider"/>}
      size="lg"
      onSave={() => doSave(true)}
      onSaveDraft={() => doSave(false)}
      saving={saving}
      publishLabel="Publier le témoignage"
      footerLeft={tm.updated_at && <><Icon name="clock" size={13}/> {timeAgo(tm.updated_at)}</>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nom du client" required>
          <Input value={form.author_name} onChange={e => set({ author_name: e.target.value })} placeholder="Marie D."/>
        </Field>
        <Field label="Pays d'origine">
          <Input value={form.author_country || ''} onChange={e => set({ author_country: e.target.value })} placeholder="France"/>
        </Field>
        <Field label="Source">
          <Select value={form.source} onChange={e => set({ source: e.target.value })}>
            <option value="internal">Direct / Interne</option>
            <option value="tripadvisor">TripAdvisor</option>
            <option value="google">Google</option>
          </Select>
        </Field>
        <Field label="Note (1-5)">
          <Select value={form.rating || 5} onChange={e => set({ rating: parseInt(e.target.value) })}>
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5-n)} ({n})</option>)}
          </Select>
        </Field>
        <Field label="Date du voyage (approx.)">
          <Input type="date" value={form.travel_date || ''} onChange={e => set({ travel_date: e.target.value || null })}/>
        </Field>
        <Field label="Ordre d'affichage">
          <Input type="number" value={form.sort_order} onChange={e => set({ sort_order: parseInt(e.target.value) || 0 })}/>
        </Field>
      </div>

      <MultilangField label="Texte du témoignage" type="textarea" rows={5} required values={pickLangValues(form, 'text')} onChange={v => set(spreadLangValues('text', v))}/>
    </EditorLayout>
  );
}

window.TestimonialsPage = TestimonialsPage;

export { TestimonialsPage };

import React, { useState, useEffect } from 'react';
import { Icon } from './icons.jsx';
import { MultilangField, pickLangValues, spreadLangValues } from './lang.jsx';
import { DraftRestoreBar, EditorLayout, ListToolbar, PagePad, readDraft, useAutosave, useCollection } from './list-editor.jsx';
import { ActionBtn, EmptyState, Field, Input, LangDots, Select, Spinner, StatusPill, mediaSrc, timeAgo } from './ui.jsx';

// =====================================================================
// src/admin/ateliers.jsx — CRUD Ateliers (cards grid, design refondu)
// =====================================================================

function AteliersPage() {
  const col = useCollection('ateliers');
  const [editing, setEditing] = useState(null);

  const openCreate = () => setEditing({
    slug: '', title_fr: '', title_en: '', title_it: '', title_de: '',
    subtitle_fr: '', short_fr: '', description_fr: '',
    category: 'artisanat', hero_photo: '', gallery: [],
    published: false, sort_order: 100
  });

  useEffect(() => {
    const cb = (e) => e.detail.section === 'ateliers' && openCreate();
    window.addEventListener('act-admin-cta', cb);
    return () => window.removeEventListener('act-admin-cta', cb);
  }, []);

  const onDelete = async (row) => {
    if (!(await window.askConfirm(`Supprimer l'atelier "${row.title_fr}" ?`, 'Supprimer'))) return;
    await col.remove(row.id, 'Atelier supprimé');
  };

  const catLabel = { artisanat: 'Artisanat', musique: 'Musique', danse: 'Danse' };
  const catTone = {
    artisanat: 'bg-brand-100 text-terra-700',
    musique:   'bg-info-100  text-info-600',
    danse:     'bg-success-100 text-success-600'
  };

  return (
    <PagePad>
      <ListToolbar
        query={col.query}
        onQuery={col.setQuery}
        count={`${col.items.length} atelier${col.items.length > 1 ? 's' : ''}`}
        onCreate={openCreate}
        createLabel="Nouvel atelier"
      />

      {col.loading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg"/></div>
      ) : col.filtered.length === 0 ? (
        <EmptyState
          icon={<Icon name="palette" size={28}/>}
          title="Aucun atelier"
          message="Cliquez sur « + Nouvel atelier » pour créer votre premier contenu."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {col.filtered.map((a, i) => (
            <div
              key={a.id}
              onClick={() => setEditing(a)}
              className="bg-white border border-bone-200 rounded-2xl overflow-hidden cursor-pointer shadow-act-card hover:shadow-act-card-hover hover:border-bone-500 transition"
            >
              <div className={`relative h-[150px] act-thumb-${['a','b','c'][i % 3]}`}>
                {a.hero_photo && <img src={mediaSrc(a.hero_photo)} alt={a.title_fr} className="absolute inset-0 w-full h-full object-cover"/>}
                <div className={`absolute left-3 top-3 px-2.5 py-1 rounded-full font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${catTone[a.category] || ''}`}>
                  {catLabel[a.category] || a.category}
                </div>
                <div className="absolute right-3 top-3"><StatusPill published={a.published}/></div>
              </div>
              <div className="p-4">
                <div className="font-display text-[20px] leading-tight text-ink-800">{a.title_fr}</div>
                {a.subtitle_fr && <div className="mt-1 text-[13px] text-mute-500">{a.subtitle_fr}</div>}
                <div className="mt-3 pt-3 border-t border-bone-100 flex items-center justify-between gap-3">
                  <LangDots row={a} field="title"/>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <ActionBtn variant="danger" onClick={() => onDelete(a)} title="Supprimer"><Icon name="trash" size={13}/></ActionBtn>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <AtelierEditor atelier={editing} onClose={() => setEditing(null)} col={col}/>}
    </PagePad>
  );
}

function AtelierEditor({ atelier, onClose, col }) {
  const [form, setForm] = useState(atelier);
  const [saving, setSaving] = useState(false);
  const isNew = !atelier.id;
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  const initialDraft = React.useRef(readDraft('ateliers', atelier.id)).current;
  const [showRestore, setShowRestore] = useState(!!initialDraft);
  const { clearDraft } = useAutosave('ateliers', atelier.id, form, atelier);

  useEffect(() => {
    if (isNew && form.title_fr && !form.slug) set({ slug: window.slugify(form.title_fr) });
  }, [form.title_fr]);

  const doSave = async (publish) => {
    if (!form.title_fr?.trim()) { window.toast('Le titre FR est obligatoire', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (publish !== undefined) payload.published = publish;
      delete payload.created_at;
      delete payload.updated_at;
      if (isNew) { delete payload.id; await col.create(payload); window.toast('Atelier créé', 'success'); }
      else { await col.update(atelier.id, payload); window.toast('Enregistré', 'success'); }
      clearDraft();
      onClose();
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <EditorLayout
      open={true}
      onClose={onClose}
      kicker={`Édition atelier · /${form.slug || 'nouveau'}`}
      title={isNew ? 'Nouvel atelier' : form.title_fr}
      statusPill={<StatusPill published={form.published}/>}
      size="lg"
      onSave={() => doSave(true)}
      onSaveDraft={() => doSave(false)}
      saving={saving}
      publishLabel="Publier l'atelier"
      footerLeft={atelier.updated_at && <><Icon name="clock" size={13}/> {timeAgo(atelier.updated_at)}</>}
    >
      {showRestore && <DraftRestoreBar onRestore={() => { setForm(initialDraft); setShowRestore(false); }} onDismiss={() => { setShowRestore(false); clearDraft(); }}/>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Slug (URL)" required>
          <Input value={form.slug} onChange={e => set({ slug: e.target.value })}/>
        </Field>
        <Field label="Catégorie" required>
          <Select value={form.category} onChange={e => set({ category: e.target.value })}>
            <option value="artisanat">Artisanat</option>
            <option value="musique">Musique</option>
            <option value="danse">Danse</option>
          </Select>
        </Field>
        <Field label="Ordre">
          <Input type="number" value={form.sort_order} onChange={e => set({ sort_order: parseInt(e.target.value) || 0 })}/>
        </Field>
        <Field label="Photo (URL)">
          <Input value={form.hero_photo || ''} onChange={e => set({ hero_photo: e.target.value })}/>
        </Field>
      </div>

      <MultilangField label="Titre" required values={pickLangValues(form, 'title')} onChange={v => set(spreadLangValues('title', v))}/>
      <MultilangField label="Sous-titre" values={pickLangValues(form, 'subtitle')} onChange={v => set(spreadLangValues('subtitle', v))}/>
      <MultilangField label="Description courte" type="textarea" rows={2} values={pickLangValues(form, 'short')} onChange={v => set(spreadLangValues('short', v))}/>
      <MultilangField label="Description complète" type="textarea" rows={5} values={pickLangValues(form, 'description')} onChange={v => set(spreadLangValues('description', v))}/>
    </EditorLayout>
  );
}

window.AteliersPage = AteliersPage;

export { AteliersPage };

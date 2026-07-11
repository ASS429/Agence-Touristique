import React, { useState, useEffect } from 'react';
import { GalleryEditor, MultilangListEditor } from './circuits.jsx';
import { Icon } from './icons.jsx';
import { MultilangField, pickLangValues, spreadLangValues } from './lang.jsx';
import { EditorLayout, ItemsTable, ListToolbar, PagePad, Thumb, useCollection } from './list-editor.jsx';
import { Field, Input, LangDots, Select, StatusPill, timeAgo, truncate } from './ui.jsx';

// =====================================================================
// src/admin/excursions.jsx — CRUD Excursions (design refondu)
// =====================================================================

function ExcursionsPage() {
  const col = useCollection('excursions');
  const [editing, setEditing] = useState(null);

  const openCreate = () => setEditing({
    slug: '', title_fr: '', title_en: '', title_it: '', title_de: '',
    short_fr: '', description_fr: '',
    format: 'fullday', start_point: 'dakar', region: '',
    hero_photo: '', highlights: [], includes: [], gallery: [],
    published: false, sort_order: 100
  });

  useEffect(() => {
    const cb = (e) => e.detail.section === 'excursions' && openCreate();
    window.addEventListener('act-admin-cta', cb);
    return () => window.removeEventListener('act-admin-cta', cb);
  }, []);

  const onDelete = async (row) => {
    if (!(await window.askConfirm(`Supprimer l'excursion "${row.title_fr}" ?`, 'Supprimer'))) return;
    await col.remove(row.id);
    window.toast('Excursion supprimée', 'success');
  };

  const onDuplicate = async (row) => {
    const { id, created_at, updated_at, ...rest } = row;
    const copy = await col.create({ ...rest, slug: row.slug + '-copie', title_fr: row.title_fr + ' (copie)', published: false });
    setEditing(copy);
  };

  const formatLabel = { halfday: '½ journée', fullday: 'Journée' };
  const startLabel = { dakar: 'Dakar', saly: 'Saly', 'saint-louis': 'Saint-Louis' };

  const columns = [
    { key: 'title', label: 'Excursion', width: 'minmax(0,2.4fr)', render: r => (
      <div className="flex items-center gap-3.5 min-w-0">
        <Thumb src={r.hero_photo} alt={r.title_fr}/>
        <div className="min-w-0">
          <div className="font-bold text-[14.5px] text-ink-800 truncate">{r.title_fr}</div>
          <div className="text-[12px] text-mute-500 truncate">{r.short_fr}</div>
        </div>
      </div>
    ) },
    { key: 'start_point', label: 'Départ', width: '1fr', render: r => (
      <div className="flex items-center gap-1.5 text-mute-700">
        <Icon name="pin" size={14}/>{startLabel[r.start_point] || r.start_point}
      </div>
    ) },
    { key: 'format', label: 'Format', width: '.85fr', render: r => formatLabel[r.format] || r.format },
    { key: 'langs', label: 'Langues', width: '.9fr', render: r => <LangDots row={r} field="title"/> },
    { key: 'status', label: 'Statut', width: '1fr', render: r => <StatusPill published={r.published}/> }
  ];

  return (
    <PagePad>
      <ListToolbar
        query={col.query}
        onQuery={col.setQuery}
        count={`${col.items.length} excursion${col.items.length > 1 ? 's' : ''}`}
        onCreate={openCreate}
        createLabel="Nouvelle excursion"
      />
      <ItemsTable
        items={col.filtered}
        columns={columns}
        onRowClick={setEditing}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onTogglePublish={async row => { await col.togglePublish(row); window.toast(row.published ? 'Dépubliée' : 'Publiée', 'success'); }}
        loading={col.loading}
        emptyIcon={<Icon name="sun" size={28}/>}
        emptyTitle="Aucune excursion"
      />
      {editing && <ExcursionEditor excursion={editing} onClose={() => setEditing(null)} col={col}/>}
    </PagePad>
  );
}

function ExcursionEditor({ excursion, onClose, col }) {
  const [form, setForm] = useState(excursion);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('general');
  const isNew = !excursion.id;
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

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
      if (isNew) { delete payload.id; await col.create(payload); window.toast('Excursion créée', 'success'); }
      else       { await col.update(excursion.id, payload); window.toast('Enregistré', 'success'); }
      onClose();
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  const tabs = [
    { id: 'general', label: 'Général' },
    { id: 'contenu', label: 'Contenu' },
    { id: 'points',  label: 'Points forts', count: form.highlights?.length },
    { id: 'inclus',  label: 'Inclus',       count: form.includes?.length },
    { id: 'galerie', label: 'Galerie',      count: form.gallery?.length }
  ];

  return (
    <EditorLayout
      open={true}
      onClose={onClose}
      kicker={`Édition excursion · /${form.slug || 'nouvelle'}`}
      title={isNew ? 'Nouvelle excursion' : form.title_fr}
      statusPill={<StatusPill published={form.published}/>}
      size="full"
      tabs={tabs}
      activeTab={tab}
      onSelectTab={setTab}
      onSave={() => doSave(true)}
      onSaveDraft={() => doSave(false)}
      saving={saving}
      publishLabel="Publier l'excursion"
      footerLeft={excursion.updated_at && <><Icon name="clock" size={13}/> {timeAgo(excursion.updated_at)}</>}
    >
      {tab === 'general' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Slug (URL)" required>
            <Input value={form.slug} onChange={e => set({ slug: e.target.value })}/>
          </Field>
          <Field label="Ordre d'affichage">
            <Input type="number" value={form.sort_order} onChange={e => set({ sort_order: parseInt(e.target.value) || 0 })}/>
          </Field>
          <Field label="Format" required>
            <Select value={form.format} onChange={e => set({ format: e.target.value })}>
              <option value="halfday">Demi-journée</option>
              <option value="fullday">Journée complète</option>
            </Select>
          </Field>
          <Field label="Point de départ" required>
            <Select value={form.start_point} onChange={e => set({ start_point: e.target.value })}>
              <option value="dakar">Dakar</option>
              <option value="saly">Saly</option>
              <option value="saint-louis">Saint-Louis</option>
            </Select>
          </Field>
          <Field label="Région / zone">
            <Input value={form.region || ''} onChange={e => set({ region: e.target.value })} placeholder="Petite Côte, Sine Saloum…"/>
          </Field>
          <Field label="Photo (URL)">
            <Input value={form.hero_photo || ''} onChange={e => set({ hero_photo: e.target.value })}/>
          </Field>
        </div>
      )}

      {tab === 'contenu' && (
        <div className="space-y-6">
          <MultilangField label="Titre" required values={pickLangValues(form, 'title')} onChange={v => set(spreadLangValues('title', v))}/>
          <MultilangField label="Description courte (cartes)" type="textarea" rows={2} values={pickLangValues(form, 'short')} onChange={v => set(spreadLangValues('short', v))}/>
          <MultilangField label="Description complète" type="textarea" rows={6} values={pickLangValues(form, 'description')} onChange={v => set(spreadLangValues('description', v))}/>
        </div>
      )}

      {tab === 'points' && (
        <MultilangListEditor value={form.highlights || []} onChange={v => set({ highlights: v })} singular="point fort"/>
      )}

      {tab === 'inclus' && (
        <MultilangListEditor value={form.includes || []} onChange={v => set({ includes: v })} singular="élément inclus"/>
      )}

      {tab === 'galerie' && (
        <GalleryEditor value={form.gallery || []} onChange={v => set({ gallery: v })}/>
      )}
    </EditorLayout>
  );
}

window.ExcursionsPage = ExcursionsPage;

export { ExcursionsPage };

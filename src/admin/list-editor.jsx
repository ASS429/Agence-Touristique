import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Icon } from './icons.jsx';
import { ActionBtn, Btn, EmptyState, Modal, Spinner } from './ui.jsx';

// =====================================================================
// src/admin/list-editor.jsx — Patterns liste + éditeur (design refondu)
//
// - ListToolbar : search + filtres pills + right (compteur, actions) + CTA
// - FiltersPills : pills à sélection unique
// - ItemsTable : grid table pattern du design (header sable mono uppercase,
//     lignes hover, actions inline en fin de ligne, cover 52x64 rounded-xl)
// - ItemsCards : grille de cards
// - useCollection : hook générique CRUD Supabase
// - EditorLayout : cadre modal avec tabs soulignés + footer sticky
// =====================================================================

// -----------------------------------------------------------
// ListToolbar
// -----------------------------------------------------------
function ListToolbar({
  query, onQuery, onCreate, createLabel = 'Nouveau',
  filters, activeFilter, onFilter, right, count
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap mb-5">
      {typeof onQuery === 'function' && (
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute-400 flex">
            <Icon name="search" size={17}/>
          </span>
          <input
            value={query || ''}
            onChange={e => onQuery(e.target.value)}
            placeholder="Rechercher…"
            className="w-[260px] h-10 pl-10 pr-3.5 rounded-full border border-bone-400 bg-white text-[13.5px] outline-none focus:border-terra-600 focus:ring-[3px] focus:ring-terra-600/12 transition"
          />
        </div>
      )}
      {filters && (
        <FiltersPills filters={filters} active={activeFilter} onSelect={onFilter}/>
      )}
      <div className="flex-1"/>
      {count != null && (
        <div className="font-mono text-[11px] text-mute-500">{count}</div>
      )}
      {right}
      {onCreate && (
        <Btn onClick={onCreate} icon={<Icon name="plus" size={16} stroke={2}/>}>
          {createLabel}
        </Btn>
      )}
    </div>
  );
}

// -----------------------------------------------------------
// FiltersPills : filtres single-select
// -----------------------------------------------------------
function FiltersPills({ filters, active, onSelect }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map(f => {
        const on = active === f.id;
        return (
          <button
            key={f.id}
            onClick={() => onSelect?.(f.id)}
            className={`inline-flex items-center gap-2 h-9 px-4 rounded-full border font-semibold text-[13px] transition ${
              on
                ? 'bg-ink-800 text-white border-ink-800'
                : 'bg-white text-mute-700 border-bone-400 hover:bg-sand-100'
            }`}
          >
            {f.label}
            {f.count != null && (
              <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10.5px] font-bold ${
                on ? 'bg-white/20 text-white' : 'bg-bone-100 text-mute-500'
              }`}>{f.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------
// ItemsTable : tableau grid pattern
// columns : [{ key, label, width, render?, className? }]
// -----------------------------------------------------------
function ItemsTable({ items, columns, onRowClick, onDuplicate, onDelete, onTogglePublish, loading, emptyIcon, emptyTitle = 'Aucun élément', emptyMessage }) {
  if (loading) {
    return <div className="py-16 flex justify-center"><Spinner size="lg"/></div>;
  }
  if (!items.length) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage || 'Cliquez sur « + Nouveau » pour créer votre premier contenu.'}
      />
    );
  }

  // Grille CSS calculée depuis les widths des colonnes
  const gridCols = columns.map(c => c.width || 'minmax(0,1fr)').join(' ') + ' 100px';

  return (
    <div className="bg-white border border-bone-200 rounded-2xl overflow-hidden shadow-act-table">
      {/* Header */}
      <div
        className="grid gap-3.5 px-5 py-3 border-b border-bone-200 bg-sand-75 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-mute-400"
        style={{ gridTemplateColumns: gridCols }}
      >
        {columns.map(c => (<div key={c.key}>{c.label}</div>))}
        <div className="text-right">Actions</div>
      </div>

      {/* Rows */}
      {items.map(row => (
        <div
          key={row.id}
          onClick={() => onRowClick?.(row)}
          className={`grid gap-3.5 px-5 py-3 border-b border-bone-100 items-center act-table-row ${onRowClick ? 'cursor-pointer' : ''}`}
          style={{ gridTemplateColumns: gridCols }}
        >
          {columns.map(c => (
            <div key={c.key} className={`min-w-0 text-[13.5px] text-mute-700 ${c.className || ''}`}>
              {c.render ? c.render(row) : (row[c.key] ?? '—')}
            </div>
          ))}
          <div className="flex items-center gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
            {onTogglePublish && (
              <ActionBtn
                variant="success"
                onClick={() => onTogglePublish(row)}
                title={row.published ? 'Dépublier' : 'Publier'}
              ><Icon name="eye" size={15}/></ActionBtn>
            )}
            {onDuplicate && (
              <ActionBtn
                variant="info"
                onClick={() => onDuplicate(row)}
                title="Dupliquer"
              ><Icon name="copy" size={15}/></ActionBtn>
            )}
            {onDelete && (
              <ActionBtn
                variant="danger"
                onClick={() => onDelete(row)}
                title="Supprimer"
              ><Icon name="trash" size={15}/></ActionBtn>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------
// Thumbnail — mini-placeholder 52×64 rounded-xl (design handoff)
// -----------------------------------------------------------
function Thumb({ src, alt, ratio = 'act-thumb-a', size = 'md' }) {
  const sizes = {
    sm: { w: 40, h: 50 },
    md: { w: 52, h: 64 },
    lg: { w: 68, h: 82 }
  };
  const s = sizes[size] || sizes.md;
  if (src) {
    return (
      <img
        src={src}
        alt={alt || ''}
        className="rounded-xl border border-bone-300 object-cover flex-shrink-0"
        style={{ width: s.w, height: s.h }}
      />
    );
  }
  return (
    <div
      className={`rounded-xl border border-bone-300 flex-shrink-0 relative ${ratio}`}
      style={{ width: s.w, height: s.h }}
    >
      <span className="absolute left-1.5 bottom-1 font-mono text-[7.5px] text-mute-600/60">
        {size === 'lg' ? '4:5' : ''}
      </span>
    </div>
  );
}

// -----------------------------------------------------------
// Hook générique : useCollection(table)
// -----------------------------------------------------------
function useCollection(table, opts = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await window.sbList(table, opts);
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [table]);

  useEffect(() => { reload(); }, [reload]);

  const create = async (payload) => {
    const row = await window.sbInsert(table, payload);
    setItems(list => [row, ...list]);
    return row;
  };

  const update = async (id, payload) => {
    const row = await window.sbUpdate(table, id, payload);
    setItems(list => list.map(r => r.id === id ? row : r));
    return row;
  };

  // Suppression avec Undo : on capture la ligne avant de la supprimer, puis
  // on propose « Annuler » dans le toast (ré-insertion en préservant l'id).
  const remove = async (id, label = 'Élément supprimé') => {
    const row = items.find(r => r.id === id);
    await window.sbDelete(table, id);
    setItems(list => list.filter(r => r.id !== id));
    window.toast(label, 'info', {
      duration: 6500,
      action: row ? {
        label: 'Annuler',
        onClick: async () => {
          try {
            const { updated_at, ...rest } = row; // updated_at régénéré à l'insert
            const restored = await window.sbInsert(table, rest);
            setItems(list => [restored, ...list.filter(r => r.id !== restored.id)]
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
            window.toast('Suppression annulée', 'success');
          } catch (e) {
            window.toast('Annulation impossible : ' + e.message, 'error');
          }
        }
      } : null
    });
  };

  const togglePublish = async (row) => {
    const updated = await window.sbUpdate(table, row.id, { published: !row.published });
    setItems(list => list.map(r => r.id === row.id ? updated : r));
    return updated;
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(r =>
      Object.values(r).some(v =>
        typeof v === 'string' && v.toLowerCase().includes(q)
      )
    );
  }, [items, query]);

  return { items, filtered, loading, error, query, setQuery, reload, create, update, remove, togglePublish };
}

// -----------------------------------------------------------
// Autosave brouillon (localStorage) — évite la perte de saisie au refresh.
//   readDraft(table, id)         → lit un brouillon éventuel au montage
//   useAutosave(table,id,form,original) → persiste le diff (débounce 700 ms),
//                                  efface le brouillon si form == original
//   <DraftRestoreBar .../>        → bandeau « restaurer / ignorer »
// -----------------------------------------------------------
const draftKey = (table, id) => `act_draft_${table}_${id || 'new'}`;

function readDraft(table, id) {
  try {
    const raw = localStorage.getItem(draftKey(table, id));
    if (!raw) return null;
    const d = JSON.parse(raw);
    return d && d.form ? d.form : null;
  } catch { return null; }
}

function useAutosave(table, id, form, original) {
  const key = draftKey(table, id);
  useEffect(() => {
    const h = setTimeout(() => {
      try {
        // On persiste dès que le formulaire diffère de l'original. On NE
        // supprime PAS quand ils sont égaux : sinon le brouillon retrouvé à
        // l'ouverture (form = original) serait effacé avant restauration.
        // Le nettoyage se fait à l'enregistrement (clearDraft) ou via « Ignorer ».
        if (JSON.stringify(form) !== JSON.stringify(original)) {
          localStorage.setItem(key, JSON.stringify({ at: Date.now(), form }));
        }
      } catch { /* quota / mode privé : on ignore */ }
    }, 700);
    return () => clearTimeout(h);
  }, [key, form, original]);
  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }, [key]);
  return { clearDraft };
}

function DraftRestoreBar({ onRestore, onDismiss }) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl bg-warn-100 border border-warn-600/25 px-4 py-3">
      <Icon name="clock" size={16}/>
      <div className="text-[13px] text-ink-800 flex-1">
        Un brouillon non enregistré a été retrouvé pour ce contenu.
      </div>
      <button onClick={onRestore} className="text-[13px] font-semibold text-terra-700 hover:text-terra-800 underline underline-offset-2">Restaurer</button>
      <button onClick={onDismiss} className="text-[13px] text-mute-500 hover:text-ink-800">Ignorer</button>
    </div>
  );
}

// -----------------------------------------------------------
// EditorTabs : tabs soulignés (design handoff)
// -----------------------------------------------------------
function EditorTabs({ tabs, active, onSelect }) {
  return (
    <div className="flex gap-1 border-b border-bone-200 overflow-x-auto -mx-1 px-1">
      {tabs.map(t => {
        const on = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`relative h-10 px-4 border-b-[2px] -mb-px whitespace-nowrap font-semibold text-[14px] transition ${
              on
                ? 'border-terra-600 text-terra-700'
                : 'border-transparent text-mute-500 hover:text-ink-800'
            }`}
          >
            {t.label}
            {t.count != null && (
              <span className={`ml-1.5 text-[11px] font-mono ${on ? 'text-terra-600' : 'text-mute-400'}`}>
                ({t.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------
// EditorLayout : cadre modal avec tabs + footer sticky
// -----------------------------------------------------------
function EditorLayout({
  open, onClose, title, kicker, statusPill,
  tabs, activeTab, onSelectTab,
  onSave, onSaveDraft, saving, canSave = true,
  publishLabel = 'Publier',
  saveLabel,
  children, footer, footerLeft, size = 'xl'
}) {
  const defaultFooter = (
    <div className="flex items-center justify-between">
      <div className="text-[12.5px] text-mute-500 flex items-center gap-2">
        {footerLeft}
      </div>
      <div className="flex gap-2.5">
        <Btn variant="secondary" onClick={onClose} disabled={saving}>Fermer</Btn>
        {onSaveDraft && (
          <Btn variant="secondary" onClick={onSaveDraft} disabled={saving}>
            Enregistrer le brouillon
          </Btn>
        )}
        {onSave && (
          <Btn
            variant={onSaveDraft ? 'success' : 'primary'}
            onClick={onSave}
            loading={saving}
            disabled={!canSave}
          >{saveLabel || (onSaveDraft ? publishLabel : 'Enregistrer')}</Btn>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      kicker={kicker}
      statusPill={statusPill}
      size={size}
      footer={footer !== undefined ? footer : defaultFooter}
    >
      {tabs && (
        <div className="-mx-6 -mt-6 mb-6 px-6 pt-4 bg-white border-b border-bone-200 sticky top-0 z-10">
          <EditorTabs tabs={tabs} active={activeTab} onSelect={onSelectTab}/>
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </Modal>
  );
}

// -----------------------------------------------------------
// PagePad : conteneur standard des pages admin
// -----------------------------------------------------------
function PagePad({ children, className = '', maxWidth = 'max-w-[1180px]' }) {
  return (
    <div className={`${maxWidth} mx-auto px-6 md:px-7 py-6 md:py-7 pb-14 ${className}`}>
      {children}
    </div>
  );
}

window.ListToolbar = ListToolbar;
window.FiltersPills = FiltersPills;
window.ItemsTable = ItemsTable;
window.Thumb = Thumb;
window.useCollection = useCollection;
window.EditorTabs = EditorTabs;
window.EditorLayout = EditorLayout;
window.PagePad = PagePad;
window.useAutosave = useAutosave;
window.readDraft = readDraft;
window.DraftRestoreBar = DraftRestoreBar;

export { EditorLayout, EditorTabs, FiltersPills, ItemsTable, ListToolbar, PagePad, Thumb, useCollection, useAutosave, readDraft, DraftRestoreBar };

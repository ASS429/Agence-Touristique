// =====================================================================
// src/admin/list-editor.jsx — pattern liste+éditeur générique
//
// Les modules CRUD (Circuits, Excursions, etc.) partagent tous la même
// structure : liste sur la gauche, éditeur sur la droite, publier/
// dépublier, dupliquer, supprimer. Ce fichier fournit les briques.
// =====================================================================

// -----------------------------------------------------------
// ListToolbar : recherche + bouton créer
// -----------------------------------------------------------
function ListToolbar({ query, onQuery, onCreate, createLabel = 'Nouveau', right }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <Input
        value={query}
        onChange={e => onQuery(e.target.value)}
        placeholder="Rechercher…"
        className="max-w-sm"
      />
      {right}
      <div className="flex-1"/>
      {onCreate && <Btn onClick={onCreate}>+ {createLabel}</Btn>}
    </div>
  );
}

// -----------------------------------------------------------
// ItemsTable : tableau générique
// columns: [{ key, label, render? (row) => ReactNode, width? }]
// -----------------------------------------------------------
function ItemsTable({ items, columns, onRowClick, onDuplicate, onDelete, onTogglePublish, loading }) {
  if (loading) {
    return <div className="py-16 flex justify-center"><Spinner size="lg"/></div>;
  }
  if (!items.length) {
    return (
      <EmptyState
        title="Aucun élément"
        message="Cliquez sur « + Nouveau » pour créer votre premier contenu."
      />
    );
  }
  return (
    <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-sand-50 text-xs uppercase text-ink-800/60 tracking-wider">
            <tr>
              {columns.map(c => (
                <th key={c.key} className="px-4 py-3 text-left" style={c.width ? { width: c.width } : undefined}>
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(row => (
              <tr key={row.id} className="border-t border-sand-100 hover:bg-sand-50/50 cursor-pointer"
                  onClick={() => onRowClick?.(row)}>
                {columns.map(c => (
                  <td key={c.key} className="px-4 py-3 text-ink-800">
                    {c.render ? c.render(row) : (row[c.key] ?? '—')}
                  </td>
                ))}
                <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                  <div className="inline-flex gap-1">
                    {onTogglePublish && (
                      <button
                        onClick={() => onTogglePublish(row)}
                        className="px-2 py-1 text-xs rounded hover:bg-sand-100 text-ink-800/70"
                        title={row.published ? 'Dépublier' : 'Publier'}
                      >{row.published ? '👁️‍🗨️' : '👁️'}</button>
                    )}
                    {onDuplicate && (
                      <button
                        onClick={() => onDuplicate(row)}
                        className="px-2 py-1 text-xs rounded hover:bg-sand-100 text-ink-800/70"
                        title="Dupliquer"
                      >⎘</button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="px-2 py-1 text-xs rounded hover:bg-red-50 text-red-700"
                        title="Supprimer"
                      >🗑</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -----------------------------------------------------------
// Hook générique : useCollection(table)
// Charge, cherche, CRUD sur une table donnée.
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

  const remove = async (id) => {
    await window.sbDelete(table, id);
    setItems(list => list.filter(r => r.id !== id));
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
// EditorLayout : cadre standard pour un formulaire d'édition
// -----------------------------------------------------------
function EditorLayout({ open, onClose, title, onSave, saving, canSave = true, children, footer, size = 'lg' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size={size}>
      <div className="space-y-6">
        {children}
      </div>
      <div className="mt-8 pt-4 border-t border-sand-200 flex items-center justify-between gap-2">
        <div>{footer}</div>
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onClose} disabled={saving}>Annuler</Btn>
          <Btn onClick={onSave} loading={saving} disabled={!canSave}>Enregistrer</Btn>
        </div>
      </div>
    </Modal>
  );
}

window.ListToolbar = ListToolbar;
window.ItemsTable = ItemsTable;
window.useCollection = useCollection;
window.EditorLayout = EditorLayout;

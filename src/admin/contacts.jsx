import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Icon } from './icons.jsx';
import { FiltersPills, PagePad } from './list-editor.jsx';
import { ActionBtn, Avatar, Btn, EmptyState, Modal, ReqPill, Spinner, Textarea, Toggle, formatDate, timeAgo, truncate } from './ui.jsx';

// =====================================================================
// src/admin/contacts.jsx — Demandes reçues (liste + kanban, design refondu)
// =====================================================================

function ContactsPage() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [view, setView]         = useState('list');
  const [viewing, setViewing]   = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await window.SB.from('contact_requests').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data);
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const setStatus = async (row, status) => {
    try {
      const { data, error } = await window.SB.from('contact_requests').update({ status }).eq('id', row.id).select().single();
      if (error) throw error;
      setItems(list => list.map(x => x.id === row.id ? data : x));
      if (viewing?.id === row.id) setViewing(v => ({ ...v, status }));
      window.toast('Statut mis à jour', 'success');
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
  };

  const onDelete = async (row) => {
    if (!(await window.askConfirm('Supprimer cette demande ?', 'Supprimer'))) return;
    try {
      await window.sbDelete('contact_requests', row.id);
      setItems(list => list.filter(x => x.id !== row.id));
      if (viewing?.id === row.id) setViewing(null);
      window.toast('Supprimée', 'success');
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
  };

  const counts = useMemo(() => ({
    new:           items.filter(r => r.status === 'new').length,
    'in-progress': items.filter(r => r.status === 'in-progress').length,
    closed:        items.filter(r => r.status === 'closed').length,
    all:           items.length
  }), [items]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter(r => r.status === filter);
  }, [items, filter]);

  const filters = [
    { id: 'new',         label: 'Nouvelles', count: counts.new },
    { id: 'in-progress', label: 'En cours',  count: counts['in-progress'] },
    { id: 'closed',      label: 'Traitées',  count: counts.closed },
    { id: 'all',         label: 'Toutes',    count: counts.all }
  ];

  return (
    <PagePad>
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <FiltersPills filters={filters} active={filter} onSelect={setFilter}/>
        <div className="flex-1"/>
        {/* Toggle liste/kanban */}
        <div className="inline-flex bg-bone-100 rounded-full p-0.5 gap-0.5">
          <button
            onClick={() => setView('list')}
            aria-label="Vue liste"
            className={`w-9 h-8 rounded-full flex items-center justify-center transition ${
              view === 'list' ? 'bg-white text-terra-600 shadow' : 'text-mute-500 hover:text-ink-800'
            }`}
          ><Icon name="list" size={16}/></button>
          <button
            onClick={() => setView('kanban')}
            aria-label="Vue kanban"
            className={`w-9 h-8 rounded-full flex items-center justify-center transition ${
              view === 'kanban' ? 'bg-white text-terra-600 shadow' : 'text-mute-500 hover:text-ink-800'
            }`}
          ><Icon name="kanban" size={16}/></button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg"/></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Icon name="mail" size={28}/>} title="Aucune demande" message="Toute soumission depuis les formulaires du site apparaît ici."/>
      ) : view === 'list' ? (
        <RequestsList items={filtered} onOpen={setViewing}/>
      ) : (
        <RequestsKanban
          items={items}
          onOpen={setViewing}
          onStatusChange={(r, s) => setStatus(r, s)}
        />
      )}

      {viewing && (
        <RequestDetailModal
          request={viewing}
          onClose={() => setViewing(null)}
          onStatusChange={(s) => setStatus(viewing, s)}
          onDelete={() => onDelete(viewing)}
          onGeneratePDF={async () => {
            try {
              window.toast('Génération du PDF…', 'info');
              const fname = await window.generateDevisPDF(viewing);
              if (fname) window.toast(`PDF téléchargé : ${fname}`, 'success');
            } catch (e) { window.toast('Erreur PDF : ' + e.message, 'error'); }
          }}
        />
      )}
    </PagePad>
  );
}

// -----------------------------------------------------------
// RequestsList
// -----------------------------------------------------------
function RequestsList({ items, onOpen }) {
  const kindLabel = { devis: 'Devis', contact: 'Contact', custom: 'Sur mesure' };
  return (
    <div className="bg-white border border-bone-200 rounded-2xl overflow-hidden shadow-act-table">
      {items.map(r => (
        <div
          key={r.id}
          onClick={() => onOpen(r)}
          className="grid gap-3.5 px-5 py-3.5 border-b border-bone-100 items-center cursor-pointer act-table-row"
          style={{ gridTemplateColumns: '38px minmax(0,1.5fr) 1.2fr .9fr .8fr auto' }}
        >
          <Avatar name={r.full_name || r.email || '?'} size={38}/>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-[14.5px] text-ink-800 truncate">{r.full_name || 'Anonyme'}</span>
              {r.status === 'new' && <span className="w-1.5 h-1.5 rounded-full bg-terra-600 flex-shrink-0"/>}
            </div>
            <div className="text-[12.5px] text-mute-500 truncate">
              {r.message ? truncate(r.message, 80) : (r.email || '—')}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[13px] text-mute-700 truncate">{r.circuit_slug || '—'}</div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-mute-400">{kindLabel[r.kind] || r.kind}</div>
          </div>
          <div className="text-[13px] text-mute-700">{r.country || '—'}</div>
          <div><ReqPill status={r.status}/></div>
          <div className="text-[12.5px] text-mute-500 text-right whitespace-nowrap">{timeAgo(r.created_at)}</div>
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------
// RequestsKanban
// -----------------------------------------------------------
function RequestsKanban({ items, onOpen, onStatusChange }) {
  const cols = [
    { id: 'new',         name: 'Nouvelles', dot: '#C8593B' },
    { id: 'in-progress', name: 'En cours',  dot: '#2F6B7F' },
    { id: 'closed',      name: 'Traitées',  dot: '#2E7D5B' }
  ];
  const kindLabel = { devis: 'Devis', contact: 'Contact', custom: 'Sur mesure' };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-start">
      {cols.map(col => {
        const cards = items.filter(r => r.status === col.id);
        return (
          <div key={col.id} className="bg-sand-100 border border-bone-200 rounded-2xl p-3">
            <div className="flex items-center justify-between px-2 py-2 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.dot }}/>
                <span className="font-bold text-[13.5px] text-ink-800">{col.name}</span>
              </div>
              <span className="font-mono text-[11px] text-mute-500">{cards.length}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {cards.map(r => (
                <div
                  key={r.id}
                  onClick={() => onOpen(r)}
                  className="bg-white border border-bone-200 rounded-2xl p-3.5 cursor-pointer shadow-sm hover:border-bone-500 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar name={r.full_name || r.email || '?'} size={32}/>
                    <div className="min-w-0">
                      <div className="font-bold text-[13.5px] text-ink-800 truncate">{r.full_name || 'Anonyme'}</div>
                      <div className="text-[11.5px] text-mute-500 truncate">{r.country || r.email || '—'}</div>
                    </div>
                  </div>
                  <div className="mt-2.5 text-[12.5px] text-mute-700 leading-relaxed line-clamp-2">
                    {r.message ? truncate(r.message, 120) : '—'}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-mute-400">{kindLabel[r.kind] || r.kind}</span>
                    <span className="text-[11.5px] text-mute-500">{timeAgo(r.created_at)}</span>
                  </div>
                </div>
              ))}
              {cards.length === 0 && (
                <div className="text-center py-6 text-[13px] text-mute-400 italic">Aucune demande</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------
// RequestDetailModal
// -----------------------------------------------------------
function RequestDetailModal({ request, onClose, onStatusChange, onDelete, onGeneratePDF }) {
  const [notes, setNotes] = useState(request.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  const kindLabel = {
    devis:   { label: 'Demande de devis',   tone: 'brand'   },
    contact: { label: 'Message',            tone: 'default' },
    custom:  { label: 'Sur mesure',         tone: 'info'    }
  };
  const k = kindLabel[request.kind] || kindLabel.contact;

  const stats = [
    { label: 'Formule', value: kindLabel[request.kind]?.label || request.kind },
    { label: 'Voyageurs', value: request.travelers || '—' },
    { label: 'Circuit', value: request.circuit_slug || '—' },
    { label: 'Budget', value: request.budget || '—' }
  ];

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await window.SB.from('contact_requests').update({ notes }).eq('id', request.id);
      window.toast('Notes enregistrées', 'success');
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setSavingNotes(false); }
  };

  const statusOptions = [
    { id: 'new',         label: 'Nouvelle', color: '#C8593B', bg: '#FBEDE7' },
    { id: 'in-progress', label: 'En cours', color: '#2F6B7F', bg: '#E6EEF1' },
    { id: 'closed',      label: 'Traitée',  color: '#2E7D5B', bg: '#E7F1EB' }
  ];

  return (
    <Modal
      open={true}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <Avatar name={request.full_name || request.email || '?'} size={46}/>
          <div>
            <div className="flex items-center gap-2">
              <span>{request.full_name || 'Anonyme'}</span>
              {request.status === 'new' && <span className="text-[10.5px] font-bold text-terra-700 bg-brand-100 px-2 py-1 rounded-full">Nouveau</span>}
            </div>
            <div className="text-[12.5px] text-mute-500 font-body font-normal mt-1">
              {[request.country, request.email, timeAgo(request.created_at)].filter(Boolean).join(' · ')}
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-mute-400">Statut</span>
            {statusOptions.map(opt => {
              const on = request.status === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onStatusChange(opt.id)}
                  className={`h-8 px-3.5 rounded-full text-[12.5px] font-bold border transition ${
                    on ? '' : 'bg-white border-bone-400 text-mute-600 hover:bg-sand-100'
                  }`}
                  style={on ? { color: opt.color, background: opt.bg, borderColor: opt.color } : {}}
                >
                  ● {opt.label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <ActionBtn variant="danger" onClick={onDelete} title="Supprimer">
              <Icon name="trash" size={14}/>
            </ActionBtn>
            <Btn variant="secondary" onClick={onGeneratePDF} icon={<Icon name="download" size={14}/>}>Devis PDF</Btn>
            <Btn onClick={saveNotes} loading={savingNotes} icon={<Icon name="mail" size={14}/>}>Enregistrer les notes</Btn>
          </div>
        </div>
      }
    >
      {/* 4-col stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-bone-200 rounded-2xl p-3">
            <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-mute-400">{s.label}</div>
            <div className="mt-1 font-bold text-[14px] text-ink-800 truncate">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
        <div className="bg-white border border-bone-200 rounded-2xl p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-mute-400 mb-2">Contact</div>
          <div className="space-y-1.5 text-[13.5px]">
            {request.email && (
              <div><a href={`mailto:${request.email}`} className="text-terra-700 hover:underline">{request.email}</a></div>
            )}
            {request.phone && (
              <div><a href={`tel:${request.phone}`} className="text-terra-700 hover:underline">{request.phone}</a></div>
            )}
            {request.language && (
              <div className="text-mute-600">Langue : <b>{request.language.toUpperCase()}</b></div>
            )}
          </div>
        </div>
        {(request.travel_start || request.travel_end) && (
          <div className="bg-white border border-bone-200 rounded-2xl p-4">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-mute-400 mb-2">Dates</div>
            <div className="text-[13.5px] text-ink-800">
              {formatDate(request.travel_start)}
              {request.travel_end && <><br/>→ {formatDate(request.travel_end)}</>}
            </div>
          </div>
        )}
      </div>

      {/* Message */}
      {request.message && (
        <>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-400 mb-2">Message</div>
          <div className="bg-white border border-bone-200 rounded-2xl p-4 text-[14.5px] text-mute-700 leading-relaxed mb-5 whitespace-pre-wrap">
            {request.message}
          </div>
        </>
      )}

      {/* Extra */}
      {request.extra && Object.keys(request.extra).length > 0 && (
        <>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-400 mb-2">Détails formulaire</div>
          <pre className="bg-sand-100 border border-bone-200 rounded-2xl p-3.5 text-[11.5px] text-mute-700 overflow-x-auto mb-5">
{JSON.stringify(request.extra, null, 2)}
          </pre>
        </>
      )}

      {/* Notes internes */}
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-400 mb-2">Notes internes</div>
      <Textarea
        placeholder="Ajouter une note pour l'équipe…"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={4}
      />
    </Modal>
  );
}

window.ContactsPage = ContactsPage;

export { ContactsPage };

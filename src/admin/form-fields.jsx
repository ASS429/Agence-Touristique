import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './icons.jsx';
import { Btn, Field, Input, Spinner, mediaSrc } from './ui.jsx';

// =====================================================================
// src/admin/form-fields.jsx — champs de formulaire évolués, réutilisables :
//   - uploadImageFile : téléverse un fichier + l'indexe dans la médiathèque
//   - PhotoPicker      : aperçu + téléversement + médiathèque (+ URL repliée)
//   - SlugField        : slug verrouillé par défaut (évite de casser les URLs)
// Objectif : plus besoin de coller une URL à la main pour ajouter une photo.
// =====================================================================

// Téléverse un fichier image vers le bucket `media` et l'indexe dans
// `media_library` (best-effort). Renvoie l'URL publique. Réutilise exactement
// le flux de la Médiathèque (window.sbUpload + window.sbInsert).
async function uploadImageFile(file, category = 'general') {
  if (!file) return null;
  if (!file.type?.startsWith('image/')) { window.toast("Ce fichier n'est pas une image", 'warning'); return null; }
  if (file.size > 8 * 1024 * 1024) { window.toast('Image trop lourde (8 Mo max)', 'warning'); return null; }
  const dims = await new Promise((res) => {
    const img = new Image();
    img.onload = () => res({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => res({ width: null, height: null });
    img.src = URL.createObjectURL(file);
  });
  const { path, url } = await window.sbUpload(file, category);
  try {
    await window.sbInsert('media_library', {
      storage_path: path, public_url: url, category,
      width: dims.width, height: dims.height,
      file_size: file.size, content_type: file.type,
    });
  } catch { /* la photo est téléversée même si l'indexation médiathèque échoue */ }
  return url;
}

// ---------------------------------------------------------------------
// PhotoPicker — aperçu + boutons Téléverser / Médiathèque + URL repliée
// ---------------------------------------------------------------------
function PhotoPicker({ value, onChange, category = 'general', label = 'Photo', hint, ratio = 'aspect-video' }) {
  const [uploading, setUploading] = useState(false);
  const [showLib, setShowLib] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const fileRef = useRef(null);

  const onFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file, category);
      if (url) { onChange(url); window.toast('Photo téléversée', 'success'); }
    } catch (e) {
      window.toast('Erreur : ' + e.message, 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Field label={label} hint={hint}>
      {value ? (
        <div className={`relative ${ratio} rounded-2xl overflow-hidden border border-bone-300 bg-sand-75`}>
          <img src={mediaSrc(value)} alt="" className="w-full h-full object-cover"/>
          <button type="button" onClick={() => onChange('')} aria-label="Retirer la photo"
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-danger-600 flex items-center justify-center shadow hover:bg-white transition">
            <Icon name="trash" size={14}/>
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}
          className={`relative ${ratio} rounded-2xl border-[1.5px] border-dashed border-bone-600 bg-sand-75 hover:bg-sand-100 hover:border-terra-600 cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center px-4 transition`}
        >
          {uploading ? <Spinner size="md"/> : <Icon name="image" size={26} className="text-terra-600"/>}
          <div className="text-[13px] font-semibold text-ink-700">{uploading ? 'Téléversement…' : 'Cliquez ou glissez une photo ici'}</div>
          <div className="text-[11.5px] text-mute-500">JPG, PNG ou WebP · 8 Mo max</div>
        </div>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <Btn variant="secondary" size="sm" icon={<Icon name="upload" size={13}/>} onClick={() => fileRef.current?.click()} disabled={uploading}>
          Téléverser
        </Btn>
        <Btn variant="secondary" size="sm" icon={<Icon name="image" size={13}/>} onClick={() => setShowLib(true)} disabled={uploading}>
          Médiathèque
        </Btn>
        <button type="button" onClick={() => setShowUrl(v => !v)}
                className="text-[12px] text-mute-500 hover:text-ink-700 underline underline-offset-2 ml-1">
          {showUrl ? "Masquer l'URL" : 'Coller une URL'}
        </button>
      </div>

      {showUrl && (
        <Input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="https://… ou chemin d'image" className="mt-2"/>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => onFile(e.target.files?.[0])}/>

      {showLib && (
        <MediaLibraryModal
          category={category}
          onPick={(url) => { onChange(url); setShowLib(false); }}
          onClose={() => setShowLib(false)}
        />
      )}
    </Field>
  );
}

// ---------------------------------------------------------------------
// MediaLibraryModal — grille de sélection depuis media_library
// ---------------------------------------------------------------------
function MediaLibraryModal({ category, onPick, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState(category && category !== 'general' ? category : 'all');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await window.sbList('media_library', { orderBy: 'created_at', ascending: false });
        if (alive) setItems(data || []);
      } catch (e) {
        window.toast('Erreur médiathèque : ' + e.message, 'error');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const cats = ['all', 'circuits', 'excursions', 'ateliers', 'equipe', 'blog', 'general'];
  const filtered = cat === 'all' ? items : items.filter(i => i.category === cat);

  return (
    <div onClick={onClose} className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-6"
         style={{ background: 'rgba(14,15,16,.7)', backdropFilter: 'blur(4px)', animation: 'act-fade .2s ease' }}>
      <div onClick={e => e.stopPropagation()} className="bg-sand-50 rounded-2xl w-full max-w-3xl max-h-[82vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bone-300">
          <div className="font-display text-[20px] text-ink-800">Choisir une photo</div>
          <button onClick={onClose} aria-label="Fermer" className="w-9 h-9 rounded-full hover:bg-sand-100 flex items-center justify-center transition"><Icon name="x" size={16}/></button>
        </div>
        <div className="px-5 pt-3 flex flex-wrap gap-1.5">
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)}
                    className={`px-3 h-8 rounded-full text-[12px] font-semibold capitalize transition ${cat === c ? 'bg-terra-600 text-white' : 'bg-white border border-bone-500 text-mute-600 hover:bg-sand-100'}`}>
              {c === 'all' ? 'Tout' : c}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="py-16 flex justify-center"><Spinner size="lg"/></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-mute-500 text-[13.5px]">
              Aucune image ici.<br/>Fermez cette fenêtre et utilisez « Téléverser » pour en ajouter une.
            </div>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
              {filtered.map(item => (
                <button key={item.id} onClick={() => onPick(item.public_url)} title={item.storage_path?.split('/').pop()}
                        className="group relative rounded-xl overflow-hidden border border-bone-300 aspect-square hover:border-terra-600 hover:ring-2 hover:ring-terra-600/20 transition">
                  <img src={item.public_url} alt={item.alt_fr || ''} className="absolute inset-0 w-full h-full object-cover" loading="lazy"/>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// SlugField — verrouillé par défaut sur les éléments existants.
// Modifier un slug casse les liens partagés et le référencement : on
// oblige un déverrouillage explicite. Sur un nouvel élément, il est
// librement éditable (auto-généré depuis le titre).
// ---------------------------------------------------------------------
function SlugField({ value, onChange, isNew, prefix = '/…/', label = 'Adresse de la page (slug)' }) {
  const [unlocked, setUnlocked] = useState(false);
  const editable = isNew || unlocked;
  return (
    <Field
      label={label}
      hint={editable
        ? 'Apparaît dans l’adresse de la page. Lettres minuscules et tirets, sans espace ni accent.'
        : 'Verrouillé : le modifier casserait les liens déjà partagés et le référencement Google.'}
    >
      <div className="flex items-center gap-2">
        <div className={`flex items-center flex-1 h-11 px-3.5 border rounded-xl gap-1 transition-colors ${editable ? 'border-bone-500 bg-white focus-within:border-terra-600' : 'border-bone-300 bg-sand-75'}`}>
          <span className="text-mute-400 text-[13px] select-none shrink-0">{prefix}</span>
          <input
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            readOnly={!editable}
            className={`flex-1 min-w-0 bg-transparent outline-none text-[14px] ${editable ? 'text-ink-800' : 'text-mute-500 cursor-not-allowed'}`}
          />
        </div>
        {!isNew && (
          <button
            type="button"
            onClick={() => setUnlocked(u => !u)}
            className="h-11 px-3.5 rounded-xl border border-bone-500 text-[12.5px] font-semibold text-mute-600 hover:bg-sand-100 whitespace-nowrap transition flex items-center gap-1.5"
          >
            <Icon name="pen" size={13}/> {unlocked ? 'Verrouiller' : 'Modifier'}
          </button>
        )}
      </div>
    </Field>
  );
}

window.PhotoPicker = PhotoPicker;
window.SlugField = SlugField;

export { PhotoPicker, SlugField, MediaLibraryModal, uploadImageFile };

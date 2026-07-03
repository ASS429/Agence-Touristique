// =====================================================================
// src/admin/ui.jsx — Composants UI primitifs (design handoff Claude)
//
// Reste compatible avec les modules CRUD existants : mêmes signatures
// (Btn, Field, Input, Textarea, Select, Toggle, Badge, StatusPill,
// Modal, Toast, EmptyState, Spinner) + helpers texte (slugify,
// truncate, formatDate).
//
// Nouveautés inspirées du design :
//  - Palette étendue via tokens Tailwind config
//  - Ombres act-card / act-cta / act-modal
//  - langDots (mini-badges FR/EN/IT/DE avec état ok/missing)
//  - ReqPill (Nouvelle/En cours/Traitée)
//  - ActionButton (Eye/Copy/Trash 30×30)
// =====================================================================

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ---------------------------------------------------------------------
// Helpers texte
// ---------------------------------------------------------------------
function slugify(s) {
  return (s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function truncate(s, n = 80) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch { return iso; }
}

function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7)  return `il y a ${days} j`;
  return formatDate(iso);
}

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

// ---------------------------------------------------------------------
// Bouton — rounded-full pill par défaut (design ACT)
// ---------------------------------------------------------------------
function Btn({
  variant = 'primary', size = 'md', loading, disabled, icon,
  children, className = '', ...rest
}) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
  const sizes = {
    xs: 'h-8 px-3 text-xs',
    sm: 'h-9 px-4 text-[13px]',
    md: 'h-10 px-5 text-[13.5px]',
    lg: 'h-11 px-6 text-sm',
    xl: 'h-12 px-7 text-base'
  };
  const variants = {
    primary:   'bg-terra-600 hover:bg-terra-700 text-sand-50 shadow-act-cta-sm',
    dark:      'bg-ink-800 hover:bg-ink-900 text-sand-50',
    secondary: 'bg-white hover:bg-sand-100 text-ink-600 border border-bone-500',
    ghost:     'text-mute-600 hover:bg-sand-100 hover:text-ink-800',
    danger:    'bg-danger-600 hover:bg-red-800 text-white',
    success:   'bg-success-600 hover:bg-success-700 text-white shadow-act-cta-green',
    outline:   'border border-bone-500 hover:bg-sand-100 text-ink-600'
  };
  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full act-spin"/>}
      {!loading && icon}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------
// Champs de formulaire — style handoff (h-11, rounded-xl, bone borders)
// ---------------------------------------------------------------------
function Field({ label, hint, error, required, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <div className="mb-1.5 text-[12.5px] font-semibold text-mute-600">
          {label}
          {required && <span className="text-terra-600 ml-1">*</span>}
        </div>
      )}
      {children}
      {hint && !error && <div className="mt-1.5 text-xs text-mute-500">{hint}</div>}
      {error && <div className="mt-1.5 text-xs text-danger-600">{error}</div>}
    </label>
  );
}

const INPUT_CLASSES = "w-full h-11 px-3.5 border border-bone-500 rounded-xl bg-white text-ink-800 placeholder-mute-400 outline-none focus:border-terra-600 focus:ring-[3px] focus:ring-terra-600/15 transition-colors";

function Input({ className = '', ...props }) {
  return <input className={`${INPUT_CLASSES} ${className}`} {...props}/>;
}

function Textarea({ className = '', rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`w-full px-3.5 py-3 border border-bone-500 rounded-xl bg-white text-ink-800 placeholder-mute-400 outline-none focus:border-terra-600 focus:ring-[3px] focus:ring-terra-600/15 resize-y transition-colors ${className}`}
      {...props}
    />
  );
}

function Select({ children, className = '', ...props }) {
  return (
    <select
      className={`${INPUT_CLASSES} appearance-none pr-9 cursor-pointer bg-[url("data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239C8F79%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E")] bg-no-repeat bg-[right_12px_center] ${className}`}
      {...props}
    >{children}</select>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <span
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition ${checked ? 'bg-terra-600' : 'bg-bone-500'}`}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
          style={{ left: checked ? '22px' : '2px' }}
        />
      </span>
      {label && <span className="text-[13.5px] text-ink-700">{label}</span>}
    </label>
  );
}

// ---------------------------------------------------------------------
// Badges & Pills
// ---------------------------------------------------------------------
function Badge({ variant = 'default', children, className = '' }) {
  const variants = {
    default: 'bg-bone-100 text-mute-700',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warn-100 text-warn-600',
    danger:  'bg-danger-100 text-danger-600',
    info:    'bg-info-100 text-info-600',
    brand:   'bg-brand-100 text-terra-700'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// StatusPill (Publié vert / Brouillon amber) — avec dot
function StatusPill({ published, publishedLabel = 'Publié', draftLabel = 'Brouillon' }) {
  const c = published
    ? { label: publishedLabel, dot: '#2E7D5B', text: 'text-success-600', bg: 'bg-success-100' }
    : { label: draftLabel,     dot: '#B8801F', text: 'text-warn-600',    bg: 'bg-warn-100' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-bold whitespace-nowrap ${c.bg} ${c.text}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }}/>
      {c.label}
    </span>
  );
}

// ReqPill (Nouvelle terra / En cours ocean / Traitée emerald)
function ReqPill({ status }) {
  const map = {
    new:           { label: 'Nouvelle', dot: '#C8593B', bg: 'bg-brand-100',   text: 'text-terra-700' },
    'in-progress': { label: 'En cours', dot: '#2F6B7F', bg: 'bg-info-100',    text: 'text-info-600'  },
    closed:        { label: 'Traitée',  dot: '#2E7D5B', bg: 'bg-success-100', text: 'text-success-600' }
  };
  const c = map[status] || map.new;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-bold whitespace-nowrap ${c.bg} ${c.text}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }}/>
      {c.label}
    </span>
  );
}

// langDots — mini-badges FR/EN/IT/DE avec pastille orange si vide
function LangDots({ row, field }) {
  const codes = ['fr','en','it','de'];
  return (
    <div className="inline-flex gap-1">
      {codes.map(code => {
        const ok = !!(row?.[`${field}_${code}`]?.trim());
        return (
          <span
            key={code}
            title={code.toUpperCase()}
            className={`font-mono text-[9.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              ok
                ? 'bg-bone-100 text-mute-500'
                : 'bg-warn-100 text-warn-600 border border-warn-600/30'
            }`}
          >{code.toUpperCase()}</span>
        );
      })}
    </div>
  );
}

// Compact language completion widget (used in edit forms)
function LangCompletion({ langs }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      {['fr','en','it','de'].map(l => {
        const done = langs?.[l];
        return (
          <span key={l}
            className={`w-2 h-2 rounded-full ${done ? 'bg-success-600' : 'bg-warn-600'}`}
            title={`${l.toUpperCase()} ${done ? '✓' : '✗'}`}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------
// Boutons d'action inline (Eye/Copy/Trash 30×30, rounded 9px)
// ---------------------------------------------------------------------
function ActionBtn({ variant = 'default', onClick, title, children, className = '' }) {
  const variants = {
    default: 'text-mute-600 hover:bg-sand-100 hover:text-mute-700',
    success: 'text-mute-600 hover:bg-sand-100 hover:text-success-600',
    info:    'text-mute-600 hover:bg-sand-100 hover:text-info-600',
    danger:  'text-mute-600 hover:bg-danger-100 hover:text-danger-600'
  };
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`w-8 h-8 rounded-lg border border-bone-300 bg-white flex items-center justify-center transition ${variants[variant]} ${className}`}
    >{children}</button>
  );
}

// Avatar circulaire (initiales + fond dégradé cohérent avec la lettre)
function Avatar({ name, size = 40, variant = 'auto' }) {
  const gradients = {
    ocean:   'linear-gradient(135deg,#2F6B7F,#255868)',
    terra:   'linear-gradient(135deg,#C8593B,#8A3A21)',
    earth:   'linear-gradient(135deg,#8A3A21,#5F2F1E)',
    success: 'linear-gradient(135deg,#2E7D5B,#256B4C)',
    ink:     'linear-gradient(135deg,#3D372C,#1B1D1E)',
    warn:    'linear-gradient(135deg,#B8801F,#8A6117)'
  };
  const auto = ['ocean','terra','earth','success','ink','warn'];
  const i = (name || '').charCodeAt(0) % auto.length;
  const g = gradients[variant] || gradients[auto[i]];
  const fontSize = Math.round(size * 0.36);
  return (
    <div
      className="rounded-full inline-flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, background: g, fontSize }}
    >{initials(name)}</div>
  );
}

// ---------------------------------------------------------------------
// Toast / notifications
// ---------------------------------------------------------------------
const toastListeners = new Set();
function toast(message, variant = 'success') {
  const id = Math.random().toString(36).slice(2);
  const entry = { id, message, variant };
  toastListeners.forEach(cb => cb(entry));
  return id;
}

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const cb = (entry) => {
      setToasts(t => [...t, entry]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== entry.id)), 3800);
    };
    toastListeners.add(cb);
    return () => toastListeners.delete(cb);
  }, []);
  const dots = {
    success: '#2E7D5B',
    info:    '#2F6B7F',
    error:   '#C0392B',
    warning: '#B8801F'
  };
  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div key={t.id}
          className="flex items-center gap-3 bg-ink-800 text-sand-50 px-4 py-3.5 rounded-2xl shadow-2xl"
          style={{ animation: 'act-toast .28s ease' }}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dots[t.variant] || dots.success }}/>
          <span className="text-[13.5px] font-medium">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------
// Modal — grand cadre 88vh du design
// ---------------------------------------------------------------------
function Modal({ open, onClose, title, kicker, statusPill, children, footer, size = 'md' }) {
  if (!open) return null;
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-6xl'
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-7"
         onClick={onClose}
         style={{ animation: 'act-fade .2s ease' }}>
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-[3px]"/>
      <div
        onClick={e => e.stopPropagation()}
        className={`relative w-full ${sizes[size]} bg-sand-50 rounded-3xl overflow-hidden shadow-act-modal flex flex-col`}
        style={{ maxHeight: '88vh', animation: 'act-pop .22s ease' }}
      >
        {(title || kicker) && (
          <div className="flex-shrink-0 px-6 pt-5 pb-4 bg-white border-b border-bone-200">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {kicker && <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-400">{kicker}</div>}
                {title && <h2 className="mt-1 font-display text-[26px] leading-tight text-ink-800">{title}</h2>}
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                {statusPill}
                <button
                  onClick={onClose}
                  aria-label="Fermer"
                  className="w-9 h-9 rounded-xl border border-bone-300 bg-white text-mute-600 hover:bg-sand-100 flex items-center justify-center transition"
                >
                  <Icon name="x" size={17}/>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="act-scroll flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {footer && (
          <div className="flex-shrink-0 px-6 py-3.5 bg-white border-t border-bone-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Confirm dialog (promise-based)
// ---------------------------------------------------------------------
let confirmResolve = null;
const confirmListeners = new Set();
function askConfirm(message, confirmText = 'Confirmer', variant = 'danger') {
  return new Promise(resolve => {
    confirmResolve = resolve;
    confirmListeners.forEach(cb => cb({ open: true, message, confirmText, variant }));
  });
}
function ConfirmHost() {
  const [state, setState] = useState({ open: false });
  useEffect(() => {
    const cb = (s) => setState(s);
    confirmListeners.add(cb);
    return () => confirmListeners.delete(cb);
  }, []);
  const close = (ok) => {
    setState({ open: false });
    if (confirmResolve) { confirmResolve(ok); confirmResolve = null; }
  };
  if (!state.open) return null;
  return (
    <Modal
      open={true}
      onClose={() => close(false)}
      title="Confirmation"
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => close(false)}>Annuler</Btn>
          <Btn variant={state.variant} onClick={() => close(true)}>{state.confirmText}</Btn>
        </div>
      }
    >
      <p className="text-ink-700">{state.message}</p>
    </Modal>
  );
}

// ---------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------
function EmptyState({ title, message, action, icon }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-3xl bg-bone-100 text-terra-600 mx-auto flex items-center justify-center mb-4">
        {icon || <Icon name="layers" size={28}/>}
      </div>
      <h3 className="font-display text-2xl text-ink-800 mb-2">{title}</h3>
      <p className="text-mute-500 text-[13.5px] mb-6 max-w-sm mx-auto">{message}</p>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------
// Spinner
// ---------------------------------------------------------------------
function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-[3px]' };
  return <div className={`${sizes[size]} border-terra-600 border-t-transparent rounded-full act-spin`}/>;
}

// ---------------------------------------------------------------------
// KpiCard — carte statistique du dashboard
// ---------------------------------------------------------------------
function KpiCard({ icon, label, value, delta, deltaVariant = 'up', sub, href, onClick }) {
  const deltaClasses = {
    up:   'bg-success-100 text-success-600',
    down: 'bg-danger-100 text-danger-600',
    flat: 'bg-info-100 text-info-600'
  };
  const Wrap = href ? 'a' : (onClick ? 'button' : 'div');
  const wrapProps = href ? { href } : (onClick ? { onClick } : {});
  return (
    <Wrap
      {...wrapProps}
      className={`block bg-white border border-bone-200 rounded-2xl p-5 shadow-act-card ${href || onClick ? 'hover:shadow-act-card-hover hover:border-bone-500 transition text-left w-full' : ''}`}
    >
      <div className="flex items-center gap-2 text-mute-500">
        {icon && <span className="flex">{icon}</span>}
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">{label}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="font-display text-[34px] leading-none text-ink-800">{value}</div>
        {delta && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${deltaClasses[deltaVariant] || deltaClasses.flat}`}>
            {delta}
          </span>
        )}
      </div>
      {sub && <div className="mt-1 text-[12px] text-mute-500">{sub}</div>}
    </Wrap>
  );
}

// Exports globaux
window.slugify = slugify;
window.truncate = truncate;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.timeAgo = timeAgo;
window.initials = initials;
window.Btn = Btn;
window.Field = Field;
window.Input = Input;
window.Textarea = Textarea;
window.Select = Select;
window.Toggle = Toggle;
window.Badge = Badge;
window.StatusPill = StatusPill;
window.ReqPill = ReqPill;
window.LangDots = LangDots;
window.LangCompletion = LangCompletion;
window.ActionBtn = ActionBtn;
window.Avatar = Avatar;
window.Modal = Modal;
window.toast = toast;
window.ToastContainer = ToastContainer;
window.askConfirm = askConfirm;
window.ConfirmHost = ConfirmHost;
window.EmptyState = EmptyState;
window.Spinner = Spinner;
window.KpiCard = KpiCard;

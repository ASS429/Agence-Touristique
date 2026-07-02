// =====================================================================
// src/admin/ui.jsx — briques UI réutilisables du dashboard
// =====================================================================

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ---------------------------------------------------------------------
// Boutons
// ---------------------------------------------------------------------
function Btn({ variant = 'primary', size = 'md', loading, disabled, children, className = '', ...rest }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  const variants = {
    primary: 'bg-terra-600 hover:bg-terra-700 text-white shadow-sm',
    secondary: 'bg-sand-100 hover:bg-sand-200 text-ink-900 border border-sand-300',
    ghost: 'text-ink-800 hover:bg-sand-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border border-sand-300 hover:bg-sand-100 text-ink-800'
  };
  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full act-spin"/>}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------
// Champs de formulaire
// ---------------------------------------------------------------------
function Field({ label, hint, error, required, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-800/70">
          {label}
          {required && <span className="text-terra-600 ml-1">*</span>}
        </div>
      )}
      {children}
      {hint && !error && <div className="mt-1 text-xs text-ink-800/50">{hint}</div>}
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </label>
  );
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 border border-sand-300 rounded-lg bg-white text-ink-900 placeholder-ink-800/40 focus:outline-none focus:border-terra-600 focus:ring-2 focus:ring-terra-600/20 ${className}`}
      {...props}
    />
  );
}

function Textarea({ className = '', rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`w-full px-3 py-2 border border-sand-300 rounded-lg bg-white text-ink-900 placeholder-ink-800/40 focus:outline-none focus:border-terra-600 focus:ring-2 focus:ring-terra-600/20 resize-y ${className}`}
      {...props}
    />
  );
}

function Select({ children, className = '', ...props }) {
  return (
    <select
      className={`w-full px-3 py-2 border border-sand-300 rounded-lg bg-white text-ink-900 focus:outline-none focus:border-terra-600 focus:ring-2 focus:ring-terra-600/20 ${className}`}
      {...props}
    >{children}</select>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition ${checked ? 'bg-terra-600' : 'bg-sand-300'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? 'left-4.5' : 'left-0.5'}`} style={{ left: checked ? '18px' : '2px' }}/>
      </span>
      {label && <span className="text-sm text-ink-800">{label}</span>}
    </label>
  );
}

// ---------------------------------------------------------------------
// Badges statut
// ---------------------------------------------------------------------
function Badge({ variant = 'default', children }) {
  const variants = {
    default: 'bg-sand-100 text-ink-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger:  'bg-red-100 text-red-800',
    info:    'bg-ocean-600/10 text-ocean-700'
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>{children}</span>;
}

function StatusPill({ published }) {
  return published
    ? <Badge variant="success">Publié</Badge>
    : <Badge variant="warning">Brouillon</Badge>;
}

// ---------------------------------------------------------------------
// Toast / notifications (simple state global)
// ---------------------------------------------------------------------
const toastListeners = new Set();
function toast(message, variant = 'info') {
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
      setTimeout(() => setToasts(t => t.filter(x => x.id !== entry.id)), 4500);
    };
    toastListeners.add(cb);
    return () => toastListeners.delete(cb);
  }, []);
  const colors = {
    info: 'bg-ocean-700 text-white',
    success: 'bg-emerald-700 text-white',
    error: 'bg-red-700 text-white',
    warning: 'bg-amber-600 text-white'
  };
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-sm ${colors[t.variant] || colors.info}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------
function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };
  return (
    <div className="fixed inset-0 z-40 bg-ink-900/50 flex items-start justify-center p-4 overflow-y-auto"
         onClick={onClose}>
      <div className={`w-full ${sizes[size]} bg-white rounded-2xl shadow-xl mt-16 mb-8`}
           onClick={e => e.stopPropagation()}>
        {title && (
          <div className="px-6 py-4 border-b border-sand-200 flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink-900">{title}</h2>
            <button onClick={onClose} className="text-ink-800/60 hover:text-ink-900 text-2xl leading-none">&times;</button>
          </div>
        )}
        <div className="p-6">{children}</div>
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
    <Modal open={true} onClose={() => close(false)} title="Confirmation" size="sm">
      <p className="text-ink-800 mb-6">{state.message}</p>
      <div className="flex justify-end gap-2">
        <Btn variant="ghost" onClick={() => close(false)}>Annuler</Btn>
        <Btn variant={state.variant} onClick={() => close(true)}>{state.confirmText}</Btn>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------
function EmptyState({ title, message, action }) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4 opacity-30">📭</div>
      <h3 className="font-display text-2xl text-ink-900 mb-2">{title}</h3>
      <p className="text-ink-800/70 mb-6">{message}</p>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------
// Spinner
// ---------------------------------------------------------------------
function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-4' };
  return <div className={`${sizes[size]} border-terra-600 border-t-transparent rounded-full act-spin`}/>;
}

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

window.slugify = slugify;
window.truncate = truncate;
window.formatDate = formatDate;

// Exports globaux
window.Btn = Btn;
window.Field = Field;
window.Input = Input;
window.Textarea = Textarea;
window.Select = Select;
window.Toggle = Toggle;
window.Badge = Badge;
window.StatusPill = StatusPill;
window.Modal = Modal;
window.toast = toast;
window.ToastContainer = ToastContainer;
window.askConfirm = askConfirm;
window.ConfirmHost = ConfirmHost;
window.EmptyState = EmptyState;
window.Spinner = Spinner;

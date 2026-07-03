// =====================================================================
// src/admin/lang.jsx — Éditeur multilingue (design refondu)
//
// Onglets langue en pills avec pastille orange sur langue vide.
// Source de vérité éditoriale : FR (marqué SRC en petit).
// =====================================================================

const LANGS = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', source: true },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' }
];

// Convertit { title_fr, title_en, ... } → { fr: title_fr, en: title_en, ... }
function pickLangValues(record, field) {
  const out = {};
  for (const l of LANGS) out[l.code] = record[`${field}_${l.code}`] || '';
  return out;
}

// Convertit { fr: '...', en: '...' } → { title_fr: '...', title_en: '...' }
function spreadLangValues(field, values) {
  const out = {};
  for (const l of LANGS) out[`${field}_${l.code}`] = values[l.code] || null;
  return out;
}

// LangPills : onglets pills (design handoff)
function LangPills({ active, onChange, completion, size = 'md' }) {
  const sizes = {
    sm: 'h-7 px-2.5 text-[10.5px]',
    md: 'h-8 px-3 text-[11px]'
  };
  return (
    <div className="inline-flex gap-1.5">
      {LANGS.map(l => {
        const on = active === l.code;
        const missing = completion?.[l.code] === false && !l.source;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => onChange(l.code)}
            className={`inline-flex items-center gap-1.5 rounded-full font-mono font-semibold uppercase tracking-[0.06em] transition ${sizes[size]} ${
              on
                ? 'bg-terra-600 text-white border border-terra-600'
                : 'bg-white text-mute-600 border border-bone-500 hover:bg-sand-100'
            }`}
          >
            {l.code.toUpperCase()}
            {l.source && <span className={`text-[8.5px] opacity-80 tracking-[0.08em] ${on ? 'text-sand-50' : 'text-mute-500'}`}>SRC</span>}
            {missing && <span className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-sand-50' : 'bg-warn-600'}`}/>}
          </button>
        );
      })}
    </div>
  );
}

// Compat : LangTabs (ancien nom)
const LangTabs = LangPills;

// MultilangField : champ multilingue autonome
function MultilangField({
  label, field, values, onChange, type = 'text', rows = 3,
  placeholder, required, hint, size = 'md'
}) {
  const [active, setActive] = useState('fr');
  const completion = useMemo(() => {
    const c = {};
    for (const l of LANGS) c[l.code] = !!(values?.[l.code]?.trim());
    return c;
  }, [values]);

  const currentVal = values?.[active] || '';
  const setCurrent = (v) => onChange({ ...values, [active]: v });

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="text-[12.5px] font-semibold text-mute-600">
            {label}
            {required && <span className="text-terra-600 ml-1">*</span>}
          </div>
          <LangPills active={active} onChange={setActive} completion={completion} size={size}/>
        </div>
      )}
      {!label && (
        <div className="mb-2">
          <LangPills active={active} onChange={setActive} completion={completion} size={size}/>
        </div>
      )}
      {type === 'textarea'
        ? <Textarea value={currentVal} onChange={e => setCurrent(e.target.value)} rows={rows} placeholder={placeholder} required={required && active === 'fr'}/>
        : <Input value={currentVal} onChange={e => setCurrent(e.target.value)} placeholder={placeholder} required={required && active === 'fr'}/>
      }
      {hint && <div className="mt-1.5 text-xs text-mute-500">{hint}</div>}
    </div>
  );
}

window.LANGS = LANGS;
window.pickLangValues = pickLangValues;
window.spreadLangValues = spreadLangValues;
window.LangPills = LangPills;
window.LangTabs = LangTabs;
window.MultilangField = MultilangField;

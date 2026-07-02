// =====================================================================
// src/admin/lang.jsx — éditeur multilingue générique
//
// Rend un onglet par langue (FR/EN/IT/DE) avec un même champ répété
// dans les 4 colonnes correspondantes. FR est marqué comme source.
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

function LangTabs({ active, onChange, completion }) {
  return (
    <div className="flex gap-1 border-b border-sand-200 mb-4">
      {LANGS.map(l => {
        const done = completion?.[l.code];
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => onChange(l.code)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${active === l.code ? 'border-terra-600 text-terra-700' : 'border-transparent text-ink-800/60 hover:text-ink-800'}`}
          >
            <span className="mr-2">{l.flag}</span>
            {l.label}
            {l.source && <span className="ml-2 text-[10px] uppercase text-terra-600 tracking-wider">Source</span>}
            {done === false && !l.source && <span className="ml-2 w-1.5 h-1.5 bg-amber-500 rounded-full inline-block"/>}
          </button>
        );
      })}
    </div>
  );
}

// Champ multilingue autonome : gère son propre onglet actif.
function MultilangField({ label, field, values, onChange, type = 'text', rows = 3, placeholder, required, hint }) {
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
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-800/70">
          {label}
          {required && <span className="text-terra-600 ml-1">*</span>}
        </div>
      )}
      <LangTabs active={active} onChange={setActive} completion={completion}/>
      {type === 'textarea'
        ? <Textarea value={currentVal} onChange={e => setCurrent(e.target.value)} rows={rows} placeholder={placeholder} required={required && active === 'fr'}/>
        : <Input value={currentVal} onChange={e => setCurrent(e.target.value)} placeholder={placeholder} required={required && active === 'fr'}/>
      }
      {hint && <div className="mt-1 text-xs text-ink-800/50">{hint}</div>}
    </div>
  );
}

window.LANGS = LANGS;
window.pickLangValues = pickLangValues;
window.spreadLangValues = spreadLangValues;
window.LangTabs = LangTabs;
window.MultilangField = MultilangField;

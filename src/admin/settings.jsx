// =====================================================================
// src/admin/settings.jsx — Réglages site (site_settings key/value)
//
// Organise les clés en sections logiques (contact, footer, home, etc.)
// et propose un éditeur multilingue par clé.
// =====================================================================

const SETTINGS_SECTIONS = [
  {
    id: 'contact',
    label: 'Coordonnées & contact',
    icon: '📞',
    keys: [
      { key: 'contact.address',    label: 'Adresse physique', multi: false },
      { key: 'contact.phone_main', label: 'Téléphone principal', multi: false },
      { key: 'contact.phone_alt',  label: 'Téléphone alternatif', multi: false },
      { key: 'contact.email',      label: 'Email contact', multi: false },
      { key: 'contact.email_devis',label: 'Email demandes de devis', multi: false },
      { key: 'contact.whatsapp',   label: 'Numéro WhatsApp', multi: false },
      { key: 'contact.hours',      label: 'Horaires d\'ouverture', multi: true }
    ]
  },
  {
    id: 'social',
    label: 'Réseaux sociaux',
    icon: '🌐',
    keys: [
      { key: 'social.facebook',  label: 'URL Facebook',  multi: false },
      { key: 'social.instagram', label: 'URL Instagram', multi: false },
      { key: 'social.linkedin',  label: 'URL LinkedIn',  multi: false },
      { key: 'social.youtube',   label: 'URL YouTube',   multi: false }
    ]
  },
  {
    id: 'legal',
    label: 'Informations légales',
    icon: '⚖️',
    keys: [
      { key: 'legal.company_name',  label: 'Raison sociale', multi: false },
      { key: 'legal.form',          label: 'Forme juridique', multi: false },
      { key: 'legal.capital',       label: 'Capital social', multi: false },
      { key: 'legal.rccm',          label: 'RCCM',           multi: false },
      { key: 'legal.ninea',         label: 'NINEA',          multi: false },
      { key: 'legal.license',       label: 'N° licence tourisme', multi: false },
      { key: 'legal.founded',       label: 'Date de création', multi: false }
    ]
  },
  {
    id: 'home',
    label: 'Page d\'accueil',
    icon: '🏠',
    keys: [
      { key: 'home.hero_title',    label: 'Titre principal (hero)', multi: true },
      { key: 'home.hero_subtitle', label: 'Sous-titre hero',        multi: true },
      { key: 'home.hero_cta',      label: 'Texte du bouton CTA',    multi: true },
      { key: 'home.intro',         label: 'Paragraphe d\'introduction', multi: true }
    ]
  },
  {
    id: 'footer',
    label: 'Pied de page',
    icon: '📜',
    keys: [
      { key: 'footer.tagline', label: 'Baseline / accroche', multi: true },
      { key: 'footer.legal',   label: 'Mention légale',      multi: true }
    ]
  },
  {
    id: 'seo',
    label: 'SEO global',
    icon: '🔎',
    keys: [
      { key: 'seo.title',       label: 'Titre du site',       multi: true },
      { key: 'seo.description', label: 'Meta description',    multi: true },
      { key: 'seo.keywords',    label: 'Mots-clés',           multi: true }
    ]
  }
];

function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(new Set());
  const [activeSection, setActiveSection] = useState(SETTINGS_SECTIONS[0].id);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await window.SB.from('site_settings').select('*');
        if (error) throw error;
        const map = {};
        data.forEach(row => { map[row.key] = row; });
        setSettings(map);
      } catch (e) {
        window.toast('Erreur : ' + e.message, 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setKeyValues = (key, values) => {
    setSettings(s => ({
      ...s,
      [key]: { ...(s[key] || { key }), ...spreadLangValues('value', values) }
    }));
    setDirty(d => new Set(d).add(key));
  };

  const setKeyScalar = (key, val) => {
    setSettings(s => ({
      ...s,
      [key]: { ...(s[key] || { key }), value_fr: val }
    }));
    setDirty(d => new Set(d).add(key));
  };

  const saveAll = async () => {
    if (!dirty.size) return;
    setSaving(true);
    try {
      const upserts = Array.from(dirty).map(key => ({
        key,
        value_fr: settings[key]?.value_fr || null,
        value_en: settings[key]?.value_en || null,
        value_it: settings[key]?.value_it || null,
        value_de: settings[key]?.value_de || null
      }));
      const { error } = await window.SB.from('site_settings').upsert(upserts, { onConflict: 'key' });
      if (error) throw error;
      window.toast(`${dirty.size} réglage${dirty.size > 1 ? 's' : ''} enregistré${dirty.size > 1 ? 's' : ''}`, 'success');
      setDirty(new Set());
    } catch (e) {
      window.toast('Erreur : ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10">
        <PageHeader title="Réglages du site"/>
        <div className="flex justify-center py-16"><Spinner size="lg"/></div>
      </div>
    );
  }

  const section = SETTINGS_SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <PageHeader
        title="Réglages du site"
        subtitle="Coordonnées, textes globaux, informations légales et SEO"
        actions={<Btn onClick={saveAll} loading={saving} disabled={!dirty.size}>{dirty.size ? `Enregistrer (${dirty.size})` : 'Aucune modification'}</Btn>}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {SETTINGS_SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeSection === s.id ? 'bg-terra-600 text-white' : 'bg-white border border-sand-200 text-ink-800 hover:border-terra-600'}`}
          >
            <span className="mr-1.5">{s.icon}</span>{s.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-sand-200 p-6 space-y-6">
        {section.keys.map(k => {
          const row = settings[k.key] || {};
          if (k.multi) {
            return (
              <MultilangField
                key={k.key}
                label={k.label}
                type="textarea"
                rows={3}
                values={pickLangValues(row, 'value')}
                onChange={v => setKeyValues(k.key, v)}
                hint={`Clé : ${k.key}`}
              />
            );
          }
          return (
            <Field key={k.key} label={k.label} hint={`Clé : ${k.key}`}>
              <Input
                value={row.value_fr || ''}
                onChange={e => setKeyScalar(k.key, e.target.value)}
                placeholder={k.label}
              />
            </Field>
          );
        })}
      </div>
    </div>
  );
}

window.SettingsPage = SettingsPage;
window.SETTINGS_SECTIONS = SETTINGS_SECTIONS;

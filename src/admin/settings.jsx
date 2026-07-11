import React, { useState, useEffect } from 'react';
import { Icon } from './icons.jsx';
import { LangPills } from './lang.jsx';
import { PagePad } from './list-editor.jsx';
import { Btn, Field, Input, Spinner, Textarea } from './ui.jsx';

// =====================================================================
// src/admin/settings.jsx — Réglages site (design refondu)
// =====================================================================

const SETTINGS_SECTIONS = [
  {
    id: 'contact',
    label: 'Contact',
    icon: 'phone',
    cards: [
      {
        title: 'Comment on vous joint',
        kicker: 'Identité de contact',
        note: 'Ces informations alimentent le pied de page, la page contact et les fiches Google.',
        fields: [
          { key: 'contact.phone_main', label: 'Téléphone principal', multi: false },
          { key: 'contact.whatsapp',   label: 'WhatsApp',            multi: false },
          { key: 'contact.email',      label: 'Email contact',       multi: false },
          { key: 'contact.email_devis',label: 'Email demandes de devis', multi: false },
          { key: 'contact.address',    label: 'Adresse physique',    multi: false },
          { key: 'contact.hours',      label: 'Horaires',            multi: true }
        ]
      }
    ]
  },
  {
    id: 'social',
    label: 'Réseaux sociaux',
    icon: 'externalLink',
    cards: [
      {
        title: 'Présence en ligne',
        kicker: 'Réseaux sociaux',
        fields: [
          { key: 'social.facebook',  label: 'URL Facebook',  multi: false },
          { key: 'social.instagram', label: 'URL Instagram', multi: false },
          { key: 'social.linkedin',  label: 'URL LinkedIn',  multi: false },
          { key: 'social.youtube',   label: 'URL YouTube',   multi: false }
        ]
      }
    ]
  },
  {
    id: 'legal',
    label: 'Légal',
    icon: 'help',
    cards: [
      {
        title: 'Informations légales',
        kicker: 'Identité juridique',
        note: 'Utilisées dans les mentions légales, les CGV, les factures et les PDF de devis.',
        fields: [
          { key: 'legal.company_name', label: 'Raison sociale', multi: false },
          { key: 'legal.form',         label: 'Forme juridique', multi: false },
          { key: 'legal.capital',      label: 'Capital social', multi: false },
          { key: 'legal.rccm',         label: 'RCCM',           multi: false },
          { key: 'legal.ninea',        label: 'NINEA',          multi: false },
          { key: 'legal.license',      label: 'N° licence tourisme', multi: false },
          { key: 'legal.founded',      label: 'Date de création', multi: false }
        ]
      }
    ]
  },
  {
    id: 'home',
    label: 'Accueil',
    icon: 'star',
    cards: [
      {
        title: 'Signature de marque',
        kicker: 'Baseline · multilingue',
        note: 'Le slogan d\'accueil est affiché en grand sur la home. Traduisez-le dans les 4 langues.',
        fields: [
          { key: 'home.hero_title',    label: 'Titre principal (hero)', multi: true },
          { key: 'home.hero_subtitle', label: 'Sous-titre hero',        multi: true },
          { key: 'home.hero_cta',      label: 'Texte du bouton CTA',    multi: true },
          { key: 'home.intro',         label: 'Paragraphe d\'introduction', multi: true }
        ]
      }
    ]
  },
  {
    id: 'footer',
    label: 'Pied de page',
    icon: 'layers',
    cards: [
      {
        title: 'Pied de page',
        kicker: 'Signature de bas de page',
        fields: [
          { key: 'footer.tagline', label: 'Baseline / accroche', multi: true },
          { key: 'footer.legal',   label: 'Mention légale',      multi: true }
        ]
      }
    ]
  },
  {
    id: 'seo',
    label: 'SEO',
    icon: 'search',
    cards: [
      {
        title: 'SEO global',
        kicker: 'Meta description · Google',
        note: 'Le titre et la description apparaissent dans les résultats de recherche Google.',
        fields: [
          { key: 'seo.title',       label: 'Titre du site',    multi: true },
          { key: 'seo.description', label: 'Meta description', multi: true },
          { key: 'seo.keywords',    label: 'Mots-clés',        multi: true }
        ]
      }
    ]
  }
];

function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [dirty, setDirty]       = useState(new Set());
  const [activeSection, setActiveSection] = useState(SETTINGS_SECTIONS[0].id);
  const [lang, setLang] = useState('fr');

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await window.SB.from('site_settings').select('*');
        if (error) throw error;
        const map = {};
        data.forEach(row => { map[row.key] = row; });
        setSettings(map);
      } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
      finally { setLoading(false); }
    })();
  }, []);

  const setValue = (key, langCode, val, multi) => {
    setSettings(s => ({
      ...s,
      [key]: {
        ...(s[key] || { key }),
        [multi ? `value_${langCode}` : 'value_fr']: val
      }
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
    } catch (e) { window.toast('Erreur : ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <PagePad maxWidth="max-w-[960px]"><div className="flex justify-center py-16"><Spinner size="lg"/></div></PagePad>;
  }

  const section = SETTINGS_SECTIONS.find(s => s.id === activeSection);

  return (
    <PagePad maxWidth="max-w-[960px]">
      {/* Onglets sections */}
      <div className="flex gap-2 flex-wrap mb-6">
        {SETTINGS_SECTIONS.map(s => {
          const on = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`inline-flex items-center gap-2 h-10 px-4 rounded-full border font-semibold text-[13.5px] transition ${
                on
                  ? 'bg-terra-600 text-white border-terra-600 shadow-act-cta-sm'
                  : 'bg-white text-mute-700 border-bone-400 hover:bg-sand-100'
              }`}
            >
              <Icon name={s.icon} size={15}/>
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {section.cards.map((card, i) => (
          <div key={i} className="bg-white border border-bone-200 rounded-2xl p-6 shadow-act-card">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-400">{card.kicker}</div>
                <h3 className="mt-1 font-display text-[24px] text-ink-800">{card.title}</h3>
                {card.note && <p className="mt-1 text-[13.5px] text-mute-500 max-w-2xl">{card.note}</p>}
              </div>
              {card.fields.some(f => f.multi) && (
                <LangPills active={lang} onChange={setLang}/>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {card.fields.map(f => {
                const row = settings[f.key] || {};
                const val = f.multi ? (row[`value_${lang}`] || '') : (row.value_fr || '');
                const isTextarea = f.key.includes('description') || f.key.includes('intro') || f.key.includes('tagline') || f.key.includes('hours') || f.key.includes('address');
                return (
                  <Field
                    key={f.key}
                    label={`${f.label}${f.multi ? ` (${lang.toUpperCase()})` : ''}`}
                    hint={`Clé : ${f.key}`}
                    className={isTextarea ? 'sm:col-span-2' : ''}
                  >
                    {isTextarea
                      ? <Textarea rows={3} value={val} onChange={e => setValue(f.key, lang, e.target.value, f.multi)}/>
                      : <Input value={val} onChange={e => setValue(f.key, lang, e.target.value, f.multi)} placeholder={f.label}/>
                    }
                  </Field>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Save bar */}
      <div className="mt-6 flex justify-end gap-2.5">
        <Btn variant="secondary" onClick={() => window.location.reload()} disabled={!dirty.size || saving}>Annuler</Btn>
        <Btn onClick={saveAll} loading={saving} disabled={!dirty.size}>
          {dirty.size ? `Enregistrer les réglages (${dirty.size})` : 'Aucune modification'}
        </Btn>
      </div>
    </PagePad>
  );
}

window.SettingsPage = SettingsPage;
window.SETTINGS_SECTIONS = SETTINGS_SECTIONS;

export { SETTINGS_SECTIONS, SettingsPage };

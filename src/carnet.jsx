import React from 'react';
import { useI18n } from './i18n.jsx';
import { Icons } from './icons.jsx';
import { Footer, SITE } from './shared.jsx';
// =====================================================================
// src/carnet.jsx — Carnet de voyage partageable
//
// Page publique dédiée à un circuit, formatée pour être partagée par
// lien direct (WhatsApp, email, réseaux sociaux). Design plus proche
// d'une brochure éditoriale que d'une fiche produit.
//
// Route : #/carnet/:slug — le slug correspond à circuits.slug (ou
// l'id des données statiques data.jsx). Utilise en priorité les
// données Supabase (window.CIRCUITS_DB) si disponible.
// =====================================================================

const CarnetVoyage = ({ slug, go }) => {
  const { t, richT, lang } = useI18n();
  const [circuit, setCircuit] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [shareState, setShareState] = React.useState(null); // 'copied'|null

  React.useEffect(() => {
    (async () => {
      // 1) Priorité aux données Supabase (fraîches)
      const dbList = window.CIRCUITS_DB;
      if (dbList) {
        const c = dbList.find(x => x.slug === slug);
        if (c) { setCircuit(c); setLoading(false); return; }
      }
      // 2) Fallback data.jsx (source de vérité éditoriale)
      const staticList = window.CIRCUITS || [];
      const c = staticList.find(x => x.id === slug || x.slug === slug);
      if (c) {
        // Adapte la shape statique vers la shape "DB"
        setCircuit({
          slug: c.id || slug,
          title_fr: c.title,
          subtitle_fr: c.subtitle || '',
          description_fr: c.description || '',
          duration_days: c.days || null,
          region: c.region || '',
          hero_photo: c.cover || c.image || null,
          highlights: (c.highlights || []).map(h => ({ text_fr: h })),
          itinerary: (c.itinerary || []).map((s, i) => ({
            day: i + 1,
            title_fr: s.title || s.day || `Jour ${i+1}`,
            description_fr: s.description || s.body || ''
          })),
          badges: c.badges || [],
          gallery: []
        });
      }
      setLoading(false);
    })();
  }, [slug]);

  // -----------------------------------------------------------
  // Helpers d'accès multilingue avec fallback vers FR
  // -----------------------------------------------------------
  const localized = (row, field) => {
    if (!row) return '';
    return row[`${field}_${lang}`] || row[`${field}_fr`] || '';
  };

  const share = async () => {
    const url = window.location.href;
    const title = `Africa Connection Tours — ${localized(circuit, 'title')}`;
    if (navigator.share) {
      try { await navigator.share({ title, url }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareState('copied');
      setTimeout(() => setShareState(null), 2500);
    } catch {}
  };

  const goDevis = () => {
    // Redirige vers le formulaire de contact avec le slug pré-rempli
    window.location.hash = `#/contact?circuit=${encodeURIComponent(slug)}`;
    if (typeof go === 'function') go('contact');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-terre-600 border-t-transparent rounded-full animate-spin"/>
      </main>
    );
  }

  if (!circuit) {
    return (
      <main className="min-h-screen bg-sand-50 flex flex-col items-center justify-center px-4">
        <div className="text-6xl mb-4 opacity-40">🗺️</div>
        <h1 className="font-display text-3xl text-ink mb-3">{t('carnet.notFound.title', 'Circuit introuvable')}</h1>
        <p className="text-ink-600 mb-8 text-center max-w-md">
          {t('carnet.notFound.body', 'Ce carnet de voyage n\'existe pas ou n\'est plus disponible.')}
        </p>
        <a href="#/circuits" className="px-6 py-3 rounded-full bg-terre-600 text-sand-50 font-medium hover:bg-terre-700">
          {t('carnet.notFound.back', 'Voir tous nos circuits')}
        </a>
      </main>
    );
  }

  const title       = localized(circuit, 'title');
  const subtitle    = localized(circuit, 'subtitle');
  const description = localized(circuit, 'description');
  const heroImg     = circuit.hero_photo || null;
  const badges      = Array.isArray(circuit.badges)     ? circuit.badges : [];
  const highlights  = Array.isArray(circuit.highlights) ? circuit.highlights : [];
  const itinerary   = Array.isArray(circuit.itinerary)  ? circuit.itinerary : [];

  return (
    <main className="bg-sand-50 pb-24">
      {/* ===== Hero brochure ===== */}
      <section className="relative min-h-[70svh] flex items-end overflow-hidden">
        {heroImg && (
          <img src={heroImg} alt={title}
               className="absolute inset-0 w-full h-full object-cover"
               loading="eager"/>
        )}
        <div className="absolute inset-0" style={{background:'linear-gradient(180deg, rgba(26,22,18,0.35) 0%, rgba(26,22,18,0.15) 40%, rgba(26,22,18,0.9) 100%)'}}/>
        <div className="relative max-w-[900px] mx-auto w-full px-4 md:px-8 pb-14 md:pb-20 text-sand-50">
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-terre-300 mb-4">
            — {t('carnet.kicker', 'Carnet de voyage')}
          </div>
          <h1 className="font-display text-[42px] sm:text-[64px] md:text-[88px] leading-[0.98]">{title}</h1>
          {subtitle && <p className="mt-5 max-w-xl text-sand-100/95 text-[16px] md:text-[18px] leading-relaxed italic">{subtitle}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {circuit.duration_days && (
              <span className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-sand-50/15 border border-sand-100/25 text-[13px]">
                <Icons.Clock size={13}/> {circuit.duration_days} {t('carnet.days', 'jours')}
              </span>
            )}
            {circuit.region && (
              <span className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-sand-50/15 border border-sand-100/25 text-[13px]">
                <Icons.MapPin size={13}/> {circuit.region}
              </span>
            )}
            {badges.slice(0, 3).map((b, i) => (
              <span key={i} className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-terre-600/25 border border-terre-300/30 text-[13px]">
                {b.emoji || '✨'} {b[`text_${lang}`] || b.text_fr || b.text || ''}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Description + Highlights ===== */}
      <section className="max-w-[900px] mx-auto px-4 md:px-8 py-16 md:py-24">
        {description && (
          <div className="prose prose-lg max-w-none">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-4">— {t('carnet.about', 'À propos de ce voyage')}</div>
            {description.split('\n\n').map((para, i) => (
              <p key={i} className="text-[16px] md:text-[17px] text-ink-800 leading-relaxed mb-4">{para}</p>
            ))}
          </div>
        )}

        {highlights.length > 0 && (
          <div className="mt-14">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-4">— {t('carnet.highlights', 'Points forts')}</div>
            <ul className="grid sm:grid-cols-2 gap-4">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-ink/5">
                  <div className="h-8 w-8 rounded-full bg-terre-600/10 text-terre-600 inline-flex items-center justify-center shrink-0 mt-0.5">
                    <Icons.Check size={14}/>
                  </div>
                  <span className="text-[14.5px] text-ink-800 leading-relaxed">
                    {h[`text_${lang}`] || h.text_fr || h.text || h}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ===== Itinéraire jour par jour ===== */}
      {itinerary.length > 0 && (
        <section className="bg-ink text-sand-50 py-16 md:py-24">
          <div className="max-w-[900px] mx-auto px-4 md:px-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre-300 mb-4">— {t('carnet.itinerary', 'Votre itinéraire')}</div>
            <h2 className="font-display text-[32px] md:text-[48px] leading-tight mb-12">
              {t('carnet.itinerary.title', 'Jour par jour.')}
            </h2>
            <ol className="space-y-8">
              {itinerary.map((step, i) => {
                const stitle = step[`title_${lang}`] || step.title_fr || `Jour ${step.day || i+1}`;
                const sdesc  = step[`description_${lang}`] || step.description_fr || '';
                return (
                  <li key={i} className="grid grid-cols-[auto,1fr] gap-5">
                    <div className="text-right">
                      <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-sand-300">{t('carnet.day', 'Jour')}</div>
                      <div className="font-display text-[44px] md:text-[52px] leading-none text-terre-300">{step.day || i+1}</div>
                    </div>
                    <div className="border-l border-sand-100/15 pl-5 pt-1">
                      <div className="font-display text-[22px] md:text-[26px] leading-tight">{stitle}</div>
                      {sdesc && <p className="mt-2 text-sand-200 text-[14.5px] leading-relaxed">{sdesc}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* ===== CTA + partage ===== */}
      <section className="max-w-[900px] mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="rounded-3xl bg-gradient-to-br from-terre to-terre-700 p-8 md:p-12 text-sand-50">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-sand-100/80 mb-3">— {t('carnet.cta.kicker', 'Prêt à partir ?')}</div>
          <h2 className="font-display text-[32px] md:text-[44px] leading-tight max-w-lg">
            {t('carnet.cta.title', 'Faisons de ce voyage une réalité.')}
          </h2>
          <p className="mt-4 text-sand-100 text-[15px] max-w-md">
            {t('carnet.cta.intro', 'Demandez un devis personnalisé sans engagement — nous vous répondons sous 24h ouvrées.')}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button onClick={goDevis} className="h-12 px-6 rounded-full bg-sand-50 text-ink font-medium text-[14px] inline-flex items-center gap-2 hover:bg-sand-100">
              {t('carnet.cta.devis', 'Demander un devis')} <Icons.ArrowRight size={14}/>
            </button>
            <a href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(t('carnet.wa.msg', 'Bonjour ACT, je souhaite plus d\'informations sur') + ' ' + title)}`}
               target="_blank" rel="noreferrer"
               className="h-12 px-6 rounded-full bg-[#1FA855] text-sand-50 font-medium text-[14px] inline-flex items-center gap-2 hover:bg-[#178943]">
              <Icons.Whatsapp size={14}/> WhatsApp
            </a>
            <button onClick={share} className="h-12 px-6 rounded-full border border-sand-100/40 text-sand-50 font-medium text-[14px] inline-flex items-center gap-2 hover:bg-sand-50/10">
              {shareState === 'copied' ? '✓ ' + t('carnet.share.copied', 'Lien copié') : t('carnet.share', 'Partager ce carnet')}
              {shareState !== 'copied' && <Icons.ArrowUpRight size={14}/>}
            </button>
          </div>
        </div>

        {/* Retour catalogue */}
        <div className="mt-10 text-center">
          <a href="#/circuits" className="text-terre-700 hover:text-terre text-[14px] inline-flex items-center gap-1.5">
            ← {t('carnet.back', 'Voir tous les circuits ACT')}
          </a>
        </div>
      </section>

      <Footer go={go}/>
    </main>
  );
};

if (typeof window !== 'undefined') window.CarnetVoyage = CarnetVoyage;
export { CarnetVoyage };

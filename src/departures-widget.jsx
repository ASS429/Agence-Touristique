import React from 'react';
import { useI18n } from './i18n.jsx';
import { Icons } from './icons.jsx';
import { SITE } from './shared.jsx';
// =====================================================================
// src/departures-widget.jsx — Widget calendrier des départs
//
// À afficher sur les fiches circuit (tour.jsx). Récupère les dates
// programmées depuis Supabase (circuit_departures) et propose au
// visiteur un CTA "Réserver cette date" pré-rempli.
//
// Utilise slug (id circuit) pour matcher. Silencieux si Supabase
// non configuré ou aucune date à venir.
// =====================================================================

const DeparturesWidget = ({ circuitSlug, circuitTitle, go }) => {
  const { t, lang } = useI18n();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!window.__ACT_DB_CONFIGURED__) { setLoading(false); return; }
      try {
        // Attendre que Supabase soit chargé
        if (!window.supabase) {
          await new Promise(res => {
            const t0 = Date.now();
            const check = () => {
              if (window.supabase || Date.now() - t0 > 5000) return res();
              setTimeout(check, 100);
            };
            check();
          });
        }
        if (!window.supabase) { setLoading(false); return; }

        const sb = window.supabase.createClient(
          'https://divcmjwqgsdkdsdrjwbg.supabase.co',
          'sb_publishable_TzKuydg2b8QXUJSztNiW9A_NVAY6pD7',
          { auth: { persistSession: false } }
        );

        // 1) Trouver le circuit par son slug
        const { data: circuit } = await sb.from('circuits')
          .select('id').eq('slug', circuitSlug).maybeSingle();
        if (!circuit || cancelled) { setLoading(false); return; }

        // 2) Récupérer les départs à venir uniquement
        const today = new Date().toISOString().slice(0, 10);
        const { data: deps } = await sb.from('circuit_departures')
          .select('*')
          .eq('circuit_id', circuit.id)
          .eq('published', true)
          .gte('start_date', today)
          .order('start_date', { ascending: true })
          .limit(12);
        if (!cancelled) setItems(deps || []);
      } catch (e) {
        if (window.console) console.warn('[ACT] Widget départs :', e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [circuitSlug]);

  if (loading || !items.length) return null;   // Silencieux si rien à montrer

  const formatDateLocal = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(lang || 'fr', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return iso; }
  };

  const statusLabel = {
    open:      t('departures.status.open',      'Ouvert'),
    confirmed: t('departures.status.confirmed', 'Confirmé'),
    full:      t('departures.status.full',      'Complet'),
    cancelled: t('departures.status.cancelled', 'Annulé')
  };
  const statusClass = {
    open:      'bg-emerald-100 text-emerald-800 border-emerald-200',
    confirmed: 'bg-ocean-600/10 text-ocean-700 border-ocean-600/20',
    full:      'bg-amber-100 text-amber-800 border-amber-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  const bookDeparture = (dep) => {
    const dateStr = formatDateLocal(dep.start_date);
    const msg = t('departures.wa.msg', 'Bonjour ACT, je souhaite réserver le circuit') +
      ` "${circuitTitle}" ${t('departures.wa.for', 'pour la date du')} ${dateStr}.`;
    const url = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="max-w-4xl mx-auto px-4 md:px-8 py-12">
      <div className="rounded-3xl bg-white border border-ink/10 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-2">
              — {t('departures.kicker', 'Prochains départs programmés')}
            </div>
            <h3 className="font-display text-[26px] md:text-[32px] leading-tight">
              {t('departures.title', 'Ces dates sont ouvertes.')}
            </h3>
            <p className="text-ink-600 text-[13.5px] mt-1">{t('departures.intro', 'D\'autres dates sur demande — nous adaptons chaque circuit à votre calendrier.')}</p>
          </div>
        </div>

        <ul className="divide-y divide-ink/5 border-y border-ink/5">
          {items.map(dep => {
            const canBook = dep.status === 'open' || dep.status === 'confirmed';
            const seats = dep.capacity ? (dep.capacity - (dep.booked || 0)) : null;
            return (
              <li key={dep.id} className="py-4 flex flex-wrap items-center gap-4">
                <div className="min-w-[110px]">
                  <div className="font-display text-[20px] md:text-[22px] text-ink leading-none">{formatDateLocal(dep.start_date)}</div>
                  {dep.end_date && (
                    <div className="text-[12px] text-ink-500 mt-1">→ {formatDateLocal(dep.end_date)}</div>
                  )}
                </div>
                <div className="flex-1 min-w-[140px]">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-medium border ${statusClass[dep.status] || 'bg-sand-100'}`}>
                    {statusLabel[dep.status] || dep.status}
                  </span>
                  {seats != null && dep.status !== 'cancelled' && (
                    <span className="ml-3 text-[12.5px] text-ink-600">
                      {seats > 0
                        ? `${seats} ${t('departures.seatsLeft', 'places restantes')}`
                        : t('departures.noSeats', 'Complet — liste d\'attente')}
                    </span>
                  )}
                </div>
                <div className="text-right min-w-[110px]">
                  <div className="text-[13px] text-ink font-medium">{dep.price_override || t('departures.onQuote', 'Sur devis')}</div>
                </div>
                <button
                  onClick={() => bookDeparture(dep)}
                  disabled={!canBook}
                  className="h-10 px-5 rounded-full bg-terre-600 hover:bg-terre-700 text-sand-50 text-[13px] font-medium inline-flex items-center gap-2 disabled:bg-sand-200 disabled:text-ink-500 disabled:cursor-not-allowed"
                >
                  {canBook ? t('departures.book', 'Réserver') : t('departures.contact', 'Contacter')}
                  <Icons.ArrowRight size={13}/>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 text-[12.5px] text-ink-500 flex flex-wrap items-center justify-between gap-2">
          <span>{t('departures.legend', 'Les tarifs définitifs sont établis après validation du programme.')}</span>
          <a href={`/carnet/${circuitSlug}/`} className="text-terre hover:text-terre-700 inline-flex items-center gap-1">
            {t('departures.viewCarnet', 'Voir le carnet de voyage complet')} →
          </a>
        </div>
      </div>
    </section>
  );
};

if (typeof window !== 'undefined') window.DeparturesWidget = DeparturesWidget;
export { DeparturesWidget };

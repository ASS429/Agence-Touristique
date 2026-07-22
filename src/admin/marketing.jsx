import React, { useState, useEffect } from 'react';
import { Icon } from './icons.jsx';
import { PagePad } from './list-editor.jsx';
import { Badge, KpiCard, Spinner, formatDate, timeAgo } from './ui.jsx';

// =====================================================================
// src/admin/marketing.jsx — Tableau de bord marketing (Phase 3)
//
// 100 % basé sur vos données existantes (aucune clé externe) :
//   • volume de demandes (total / 30 j) et taux de traitement
//   • répartition par type, par source et par statut
//   • circuits les plus demandés
//   • parrainages (demandes arrivées avec un code ?ref=)
//   • abonnés newsletter confirmés
// =====================================================================

const KIND_LABEL = { contact: 'Contact', devis: 'Devis', custom: 'Sur-mesure' };
const STATUS_LABEL = { new: 'Nouvelles', 'in-progress': 'En cours', closed: 'Traitées' };
const STATUS_TONE = { new: '#C8593B', 'in-progress': '#2F6B7F', closed: '#2E7D5B' };

// Petite liste à barres (part relative)
function BarList({ items, empty = 'Aucune donnée.', color = '#C8593B' }) {
  const max = Math.max(1, ...items.map(i => i.value));
  if (!items.length) return <div className="text-[13px] text-mute-500 py-4">{empty}</div>;
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.label}>
          <div className="flex items-center justify-between text-[13px] mb-1">
            <span className="text-ink-700 truncate pr-2">{it.label}</span>
            <span className="font-semibold text-ink-800 flex-shrink-0">{it.value}</span>
          </div>
          <div className="h-2 rounded-full bg-bone-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(it.value / max) * 100}%`, background: it.color || color }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function Card({ title, kicker, children, right }) {
  return (
    <div className="bg-white border border-bone-200 rounded-2xl p-5 shadow-act-card">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          {kicker && <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-400">{kicker}</div>}
          <h3 className="mt-0.5 font-display text-[20px] text-ink-800">{title}</h3>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function MarketingPage() {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    (async () => {
      try {
        const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
        const [{ data: reqs }, { count: subs }, { data: circuits }] = await Promise.all([
          window.SB.from('contact_requests')
            .select('id, kind, status, circuit_slug, full_name, email, extra, created_at')
            .order('created_at', { ascending: false }).limit(1000),
          window.SB.from('newsletter_subscribers')
            .select('*', { count: 'exact', head: true }).eq('confirmed', true),
          window.SB.from('circuits').select('slug, title_fr').limit(300),
        ]);

        const rows = reqs || [];
        const titleBySlug = Object.fromEntries((circuits || []).map(c => [c.slug, c.title_fr]));

        const count = (fn) => {
          const m = {};
          for (const r of rows) { const k = fn(r); if (k) m[k] = (m[k] || 0) + 1; }
          return m;
        };

        const byKind   = count(r => r.kind || 'contact');
        const byStatus = count(r => r.status || 'new');
        const bySource = count(r => r.extra?.source);
        const bySlug   = count(r => r.circuit_slug);
        const referrals = rows.filter(r => r.extra?.referral_code);
        const last30 = rows.filter(r => r.created_at >= since30).length;
        const treated = (byStatus.closed || 0);
        const total = rows.length;
        const rate = total ? Math.round((treated / total) * 100) : 0;

        const topCircuits = Object.entries(bySlug)
          .map(([slug, value]) => ({ label: titleBySlug[slug] || slug, value }))
          .sort((a, b) => b.value - a.value).slice(0, 6);
        const sources = Object.entries(bySource)
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => b.value - a.value).slice(0, 6);
        const kinds = Object.entries(byKind)
          .map(([k, value]) => ({ label: KIND_LABEL[k] || k, value }))
          .sort((a, b) => b.value - a.value);
        const statuses = ['new', 'in-progress', 'closed']
          .map(k => ({ label: STATUS_LABEL[k], value: byStatus[k] || 0, color: STATUS_TONE[k] }));

        setState({
          loading: false, total, last30, rate, subs: subs || 0,
          kinds, statuses, sources, topCircuits, referrals,
        });
      } catch (e) {
        window.toast('Erreur au chargement du marketing : ' + e.message, 'error');
        setState({ loading: false, error: true });
      }
    })();
  }, []);

  if (state.loading) {
    return <PagePad><div className="flex justify-center py-16"><Spinner size="lg"/></div></PagePad>;
  }
  if (state.error) {
    return <PagePad><div className="text-mute-500 py-10">Impossible de charger les statistiques.</div></PagePad>;
  }

  return (
    <PagePad>
      <div className="mb-6">
        <h2 className="font-display text-[30px] leading-tight text-ink-800">Marketing</h2>
        <p className="text-mute-500 text-[13.5px] mt-1">Vue d'ensemble de votre acquisition — basée sur vos demandes et abonnés réels.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        <KpiCard icon={<Icon name="mail" size={16}/>} label="Demandes (total)" value={state.total} sub={`${state.last30} sur 30 jours`} href="#/contacts"/>
        <KpiCard icon={<Icon name="check" size={16}/>} label="Taux de traitement" value={`${state.rate}%`} sub="demandes traitées"/>
        <KpiCard icon={<Icon name="handshake" size={16}/>} label="Parrainages" value={state.referrals.length} sub="demandes parrainées"/>
        <KpiCard icon={<Icon name="send" size={16}/>} label="Abonnés newsletter" value={state.subs} sub="confirmés" href="#/newsletter"/>
      </div>

      {/* Répartitions */}
      <div className="grid lg:grid-cols-3 gap-3.5 mb-4">
        <Card kicker="Répartition" title="Par type de demande">
          <BarList items={state.kinds}/>
        </Card>
        <Card kicker="Répartition" title="Par statut">
          <BarList items={state.statuses}/>
        </Card>
        <Card kicker="Répartition" title="Par source">
          <BarList items={state.sources} empty="Aucune source renseignée."/>
        </Card>
      </div>

      {/* Top circuits + Parrainages */}
      <div className="grid lg:grid-cols-2 gap-3.5">
        <Card kicker="Intérêt" title="Circuits les plus demandés">
          <BarList items={state.topCircuits} color="#2F6B7F" empty="Aucun circuit encore demandé."/>
        </Card>

        <Card kicker="Bouche-à-oreille" title="Parrainages" right={<Badge variant="brand">{state.referrals.length}</Badge>}>
          {state.referrals.length === 0 ? (
            <div className="text-[13px] text-mute-500 py-4 leading-relaxed">
              Aucun parrainage pour l'instant. Chaque client peut partager son lien de parrainage
              depuis son espace client ; les demandes reçues via ce lien apparaissent ici.
            </div>
          ) : (
            <div className="space-y-2">
              {state.referrals.slice(0, 8).map(r => (
                <div key={r.id} className="flex items-center justify-between gap-3 py-2 border-t border-bone-100 first:border-t-0">
                  <div className="min-w-0">
                    <div className="font-semibold text-[13.5px] text-ink-800 truncate">{r.full_name || r.email || 'Anonyme'}</div>
                    <div className="text-[12px] text-mute-500 truncate">Parrain : {r.extra.referral_code}</div>
                  </div>
                  <div className="text-[11.5px] text-mute-400 flex-shrink-0">{timeAgo(r.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <p className="mt-6 text-[11.5px] text-mute-400 font-mono">
        Données en direct depuis votre base. Sur les 1 000 demandes les plus récentes.
      </p>
    </PagePad>
  );
}

window.MarketingPage = MarketingPage;
export { MarketingPage };

import React, { useState, useEffect } from 'react';
import { Icon } from './icons.jsx';
import { PagePad } from './list-editor.jsx';
import { Avatar, Btn, KpiCard, Spinner, formatDate, timeAgo, truncate } from './ui.jsx';

// =====================================================================
// src/admin/dashboard.jsx — Vue d'ensemble (design refondu)
//
// Layout handoff :
// - Bonjour {prenom}, bonne journée + date + nb demandes du jour
// - Quick actions : + Circuit / + Article / Médiathèque
// - 4 KPI cards (demandes 30j, temps réponse, circuits publiés, témoignages)
// - Chart demandes 30j (SVG courbe terra) + Dernière demande
// - Prochains départs + Dernier article publié
// =====================================================================

// -----------------------------------------------------------
// Chart SVG (courbe terra + gradient + point final)
// -----------------------------------------------------------
function DashboardChart({ data, height = 120 }) {
  const w = 560;
  const h = height;
  const points = data && data.length ? data : new Array(30).fill(0);
  const max = Math.max(...points, 1);
  const n = points.length;
  const X = i => (i / Math.max(1, n - 1)) * w;
  const Y = v => h - 6 - (v / max) * (h - 18);

  const line = points.reduce((acc, v, i) => acc + (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1) + ' ', '');
  const area = 'M0 ' + h + ' ' + points.map((v, i) => 'L' + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ') + ' L' + w + ' ' + h + ' Z';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="act-chart-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D46B4C" stopOpacity=".28"/>
          <stop offset="100%" stopColor="#D46B4C" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#act-chart-gradient)"/>
      <path d={line} fill="none" stroke="#C8593B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={X(n - 1)} cy={Y(points[n - 1])} r="6" fill="#fff" stroke="#C8593B" strokeWidth="2.4"/>
    </svg>
  );
}

// -----------------------------------------------------------
// LastRequest — carte "Dernière demande" (droite du chart)
// -----------------------------------------------------------
function LastRequestCard({ request, onOpen }) {
  if (!request) {
    return (
      <div className="bg-white border border-bone-200 rounded-2xl p-5 shadow-act-card flex flex-col">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-500">Dernière demande</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-bone-100 text-mute-400 flex items-center justify-center mb-3">
            <Icon name="mail" size={22}/>
          </div>
          <p className="text-mute-500 text-[13px]">Aucune demande pour l'instant.</p>
        </div>
      </div>
    );
  }

  const isNew = request.status === 'new';
  const excerpt = request.message
    ? (request.message.length > 160 ? request.message.slice(0, 160) + '…' : request.message)
    : 'Pas de message textuel.';

  const stats = [];
  if (request.extra?.duration_days) stats.push({ label: 'durée', value: `${request.extra.duration_days} j` });
  if (request.travelers) stats.push({ label: 'groupe', value: `${request.travelers} pers.` });
  if (request.budget) stats.push({ label: 'budget', value: truncate(request.budget, 12) });

  return (
    <div className="bg-white border border-bone-200 rounded-2xl p-5 shadow-act-card flex flex-col">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-500">Dernière demande</div>
        {isNew && (
          <span className="text-[10.5px] font-bold text-terra-700 bg-brand-100 px-2.5 py-1 rounded-full">Nouveau</span>
        )}
      </div>

      <div className="mt-3.5 flex items-center gap-3">
        <Avatar name={request.full_name || request.email || '?'} size={42}/>
        <div className="min-w-0">
          <div className="font-bold text-[15px] text-ink-800 truncate">{request.full_name || 'Anonyme'}</div>
          <div className="text-[12px] text-mute-500 truncate">
            {[request.country, timeAgo(request.created_at)].filter(Boolean).join(' · ')}
          </div>
        </div>
      </div>

      <div className="mt-3.5 p-3.5 bg-sand-50 border border-bone-200 rounded-2xl text-[13px] text-mute-700 leading-relaxed flex-1 italic">
        « {excerpt} »
      </div>

      {stats.length > 0 && (
        <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
          {stats.map((s, i) => (
            <div key={i} className="text-center py-2 bg-sand-50 border border-bone-200 rounded-xl">
              <div className="font-bold text-[14px] text-ink-800">{s.value}</div>
              <div className="text-[10.5px] text-mute-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <Btn variant="dark" onClick={onOpen} className="mt-3 w-full" icon={<Icon name="arrow" size={14} stroke={2}/>}>
        Ouvrir la demande
      </Btn>
    </div>
  );
}

// -----------------------------------------------------------
// UpcomingDepartures — widget calendrier
// -----------------------------------------------------------
function UpcomingDeparturesCard({ departures, circuitMap }) {
  const monthLabel = (iso) => {
    if (!iso) return { day: '—', mon: '—' };
    const d = new Date(iso);
    return {
      day: String(d.getDate()).padStart(2, '0'),
      mon: d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
    };
  };
  const seatsPill = (dep) => {
    const remaining = dep.capacity ? dep.capacity - (dep.booked || 0) : null;
    if (dep.status === 'full')      return { label: 'Complet', cls: 'text-danger-600 bg-danger-100' };
    if (dep.status === 'cancelled') return { label: 'Annulé', cls: 'text-mute-500 bg-bone-100' };
    if (remaining != null && remaining <= 2 && remaining > 0) return { label: `${remaining} place${remaining > 1 ? 's' : ''}`, cls: 'text-warn-600 bg-warn-100' };
    if (remaining != null && remaining > 0) return { label: `${remaining} places`, cls: 'text-success-600 bg-success-100' };
    return { label: dep.status === 'confirmed' ? 'Confirmé' : 'Ouvert', cls: 'text-success-600 bg-success-100' };
  };

  return (
    <div className="bg-white border border-bone-200 rounded-2xl p-5 shadow-act-card">
      <div className="flex items-center justify-between mb-3">
        <div className="font-display text-[20px] text-ink-800">Prochains départs</div>
        <a href="#/departures" className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-500 hover:text-terra-600 transition">Voir tout →</a>
      </div>
      {departures.length === 0 ? (
        <div className="py-6 text-center text-[13px] text-mute-500">
          Aucun départ programmé.
          <a href="#/departures" className="ml-2 text-terra-700 hover:underline">Ajouter →</a>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {departures.slice(0, 4).map(dep => {
            const m = monthLabel(dep.start_date);
            const s = seatsPill(dep);
            const circuit = circuitMap[dep.circuit_id];
            return (
              <div key={dep.id} className="flex items-center gap-3.5 py-2.5 border-t border-bone-100 first:border-t-0">
                <div className="w-[46px] text-center flex-shrink-0">
                  <div className="font-display text-[22px] leading-none text-terra-600">{m.day}</div>
                  <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-mute-400">{m.mon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13.5px] text-ink-800 truncate">
                    {circuit?.title_fr || <span className="text-mute-400">Circuit supprimé</span>}
                  </div>
                  <div className="text-[12px] text-mute-500">
                    {dep.end_date && `→ ${formatDate(dep.end_date).replace(/\s\d{4}/, '')}`}
                    {dep.capacity && ` · ${dep.booked || 0}/${dep.capacity} pers.`}
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${s.cls}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------
// LastArticleCard — widget dernier article publié
// -----------------------------------------------------------
function LastArticleCard({ article }) {
  if (!article) {
    return (
      <div className="bg-white border border-bone-200 rounded-2xl p-5 shadow-act-card flex flex-col">
        <div className="font-display text-[20px] text-ink-800">Dernier article</div>
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-bone-100 text-mute-400 flex items-center justify-center mb-3">
            <Icon name="pen" size={20}/>
          </div>
          <p className="text-mute-500 text-[13px] mb-4">Aucun article publié pour l'instant.</p>
          <Btn variant="secondary" size="sm" onClick={() => window.location.hash = '#/blog'}>
            Écrire le premier article →
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-bone-200 rounded-2xl p-5 shadow-act-card flex flex-col">
      <div className="font-display text-[20px] text-ink-800">Dernier article publié</div>
      <div className="mt-3.5 relative rounded-2xl overflow-hidden h-[130px] border border-bone-300">
        {article.hero_photo
          ? <img src={article.hero_photo} alt={article.title_fr} className="w-full h-full object-cover"/>
          : <div className="w-full h-full act-hero-ph"/>
        }
      </div>
      <div className="mt-3 flex-1">
        {article.tags?.[0] && (
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-info-600">
            {article.tags[0]}
          </span>
        )}
        <div className="mt-1 font-bold text-[16px] leading-tight text-ink-800">
          {truncate(article.title_fr, 80)}
        </div>
        <div className="mt-1.5 text-[12.5px] text-mute-500">
          {article.published_at ? `Publié le ${formatDate(article.published_at)}` : formatDate(article.created_at)}
          {article.author && ` · ${article.author}`}
        </div>
      </div>
      <Btn
        variant="secondary"
        size="sm"
        className="mt-3 self-start"
        icon={<Icon name="pen" size={14}/>}
        onClick={() => window.location.hash = '#/blog'}
      >Modifier l'article</Btn>
    </div>
  );
}

// -----------------------------------------------------------
// DashboardPage — page complète
// -----------------------------------------------------------
function DashboardPage() {
  const [state, setState] = useState({ loading: true });
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await window.sbGetUser();
      setUser(u);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // Compte des demandes récentes (30 derniers jours)
        const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
        const sinceToday = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

        const [
          { count: recentContacts },
          { count: newContacts },
          { count: todayContacts },
          { count: publishedCircuits },
          { count: totalCircuits },
          { count: testimonials },
          { count: pendingTestimonials },
          { data: lastReq },
          { data: circuits },
          { data: departures },
          { data: articles }
        ] = await Promise.all([
          window.SB.from('contact_requests').select('*', { count: 'exact', head: true }).gte('created_at', since30),
          window.SB.from('contact_requests').select('*', { count: 'exact', head: true }).eq('status', 'new'),
          window.SB.from('contact_requests').select('*', { count: 'exact', head: true }).gte('created_at', sinceToday),
          window.SB.from('circuits').select('*', { count: 'exact', head: true }).eq('published', true),
          window.SB.from('circuits').select('*', { count: 'exact', head: true }),
          window.SB.from('testimonials').select('*', { count: 'exact', head: true }),
          window.SB.from('testimonials').select('*', { count: 'exact', head: true }).eq('published', false),
          window.SB.from('contact_requests').select('*').order('created_at', { ascending: false }).limit(1),
          window.SB.from('circuits').select('id, title_fr, duration_days').limit(200),
          window.SB.from('circuit_departures').select('*').eq('published', true).gte('start_date', new Date().toISOString().slice(0, 10)).order('start_date', { ascending: true }).limit(4),
          window.SB.from('blog_posts').select('*').eq('published', true).order('published_at', { ascending: false, nullsLast: true }).order('created_at', { ascending: false }).limit(1)
        ]);

        const circuitMap = Object.fromEntries((circuits || []).map(c => [c.id, c]));

        setState({
          loading: false,
          recentContacts:  recentContacts  || 0,
          newContacts:     newContacts     || 0,
          todayContacts:   todayContacts   || 0,
          publishedCircuits: publishedCircuits || 0,
          totalCircuits:   totalCircuits   || 0,
          testimonials:    testimonials    || 0,
          pendingTestimonials: pendingTestimonials || 0,
          lastRequest:     lastReq?.[0]    || null,
          departures:      departures      || [],
          circuitMap,
          lastArticle:     articles?.[0]   || null
        });
      } catch (e) {
        window.toast('Erreur au chargement des statistiques : ' + e.message, 'error');
        setState({ loading: false });
      }
    })();
  }, []);

  if (state.loading) {
    return (
      <PagePad>
        <div className="flex justify-center py-16"><Spinner size="lg"/></div>
      </PagePad>
    );
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'là';
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const kpis = [
    {
      icon: <Icon name="mail" size={16}/>,
      label: 'Demandes (30 j)',
      value: state.recentContacts,
      sub: `${state.newContacts} non traitée${state.newContacts > 1 ? 's' : ''}`,
      href: '#/contacts'
    },
    {
      icon: <Icon name="map" size={16}/>,
      label: 'Circuits publiés',
      value: state.publishedCircuits,
      sub: `sur ${state.totalCircuits} fiche${state.totalCircuits > 1 ? 's' : ''}`,
      href: '#/circuits'
    },
    {
      icon: <Icon name="calendar" size={16}/>,
      label: 'Prochains départs',
      value: state.departures.length,
      sub: 'à venir cette saison',
      href: '#/departures'
    },
    {
      icon: <Icon name="star" size={16}/>,
      label: 'Témoignages',
      value: state.testimonials,
      sub: state.pendingTestimonials > 0 ? `${state.pendingTestimonials} à valider` : 'tous validés',
      href: '#/testimonials'
    }
  ];

  return (
    <PagePad>
      {/* Salutation + quick actions */}
      <div className="flex items-end justify-between gap-5 flex-wrap mb-7">
        <div>
          <h2 className="font-display text-[34px] leading-[1.05] text-ink-800">
            Bonjour {firstName}, <span className="italic text-terra-600">bonne journée</span>.
          </h2>
          <div className="mt-2 text-mute-600 text-[14px]">
            {today.charAt(0).toUpperCase() + today.slice(1)}
            {state.newContacts > 0 && ` · ${state.newContacts} nouvelle${state.newContacts > 1 ? 's' : ''} demande${state.newContacts > 1 ? 's' : ''} vous attende${state.newContacts > 1 ? 'nt' : ''}.`}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Btn onClick={() => window.location.hash = '#/circuits'} icon={<Icon name="plus" size={16} stroke={2}/>}>Circuit</Btn>
          <Btn variant="secondary" onClick={() => window.location.hash = '#/blog'} icon={<Icon name="pen" size={14}/>}>Article</Btn>
          <Btn variant="secondary" onClick={() => window.location.hash = '#/media'} icon={<Icon name="image" size={14}/>}>Médiathèque</Btn>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        {kpis.map((k, i) => (
          <KpiCard key={i} {...k}/>
        ))}
      </div>

      {/* Chart + Dernière demande */}
      <div className="grid lg:grid-cols-[1.55fr,1fr] gap-3.5 mb-4">
        <div className="bg-white border border-bone-200 rounded-2xl p-5 shadow-act-card">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-500">Demandes reçues</div>
              <div className="mt-1 font-display text-[22px] text-ink-800">30 derniers jours</div>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="text-right">
                <div className="text-[22px] font-extrabold text-ink-800">{state.recentContacts}</div>
                <div className="text-[11px] text-mute-500">demandes</div>
              </div>
              <div className="w-px h-8 bg-bone-300"/>
              <div className="text-right">
                <div className="text-[22px] font-extrabold text-success-600">{state.todayContacts}</div>
                <div className="text-[11px] text-mute-500">aujourd'hui</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <DashboardChart data={buildChartData(state.recentContacts)}/>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-mute-400 font-mono">
            <span>Placeholder — l'historique complet arrive quand ACT aura ~30 jours de données réelles.</span>
          </div>
        </div>

        <LastRequestCard
          request={state.lastRequest}
          onOpen={() => window.location.hash = '#/contacts'}
        />
      </div>

      {/* Départs + Article */}
      <div className="grid lg:grid-cols-2 gap-3.5">
        <UpcomingDeparturesCard departures={state.departures} circuitMap={state.circuitMap}/>
        <LastArticleCard article={state.lastArticle}/>
      </div>
    </PagePad>
  );
}

// -----------------------------------------------------------
// buildChartData — génère un dataset placeholder décoratif
// (30 valeurs bruitées convergent vers le total connu)
// -----------------------------------------------------------
function buildChartData(total) {
  if (!total || total < 5) {
    // Pattern décoratif si peu de données
    return [3,5,4,6,5,7,6,8,7,9,8,10,9,11,10,12,11,13,12,14,13,15,14,16,15,17,16,18,17,20];
  }
  // Placeholder proportionnel : croissance légère + bruit
  const base = total / 30;
  return Array.from({ length: 30 }, (_, i) => {
    const trend = base * (0.6 + i / 30);
    const noise = (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * base * 0.25;
    return Math.max(0.5, trend + noise);
  });
}

window.DashboardPage = DashboardPage;

export { DashboardPage };

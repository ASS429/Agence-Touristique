import { useI18n } from './i18n.jsx';
import { Icons } from './icons.jsx';
import { Btn, Footer, PageHero, Section, SITE } from './shared.jsx';
import { IMG } from './data.jsx';
// =====================================================================
// src/mice.jsx — Page MICE (Meetings, Incentives, Conferences, Events)
//
// Contenu officiel ACT (fichier "MICE.docx" reçu le 2026-07-03) :
// - Intro : cellule spécialisée événementiel
// - 4 services : étude, design programme, logistique, conseils
// - CTA : "Consultez-nous"
//
// Cible : clientèle B2B (entreprises, associations, congrès). Le ton
// est plus corporate que sur le reste du site, mais on garde le
// vocabulaire graphique ACT (Instrument Serif + terracotta).
// =====================================================================

const Mice = ({ go }) => {
  const { t, richT } = useI18n();
  const nav = typeof go === 'function' ? go : (target) => { window.location.hash = '#/' + target; };

  const services = [
    { num: '01', tKey: 'mice.item1.t', dKey: 'mice.item1.d', icon: 'Compass' },
    { num: '02', tKey: 'mice.item2.t', dKey: 'mice.item2.d', icon: 'Sparkle'  },
    { num: '03', tKey: 'mice.item3.t', dKey: 'mice.item3.d', icon: 'Shield'   },
    { num: '04', tKey: 'mice.item4.t', dKey: 'mice.item4.d', icon: 'Star'     }
  ];

  const waMessage = t('mice.wa.msg', 'Bonjour ACT, je souhaite être conseillé pour un événement MICE (incentive/congrès/séminaire).');
  const waHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(waMessage)}`;

  return (
    <main className="bg-sand-50">
      {/* Hero */}
      <PageHero
        kicker={t('mice.kicker', 'MICE · Tourisme d\'affaires')}
        tone="ink"
        mood="city"
        bgImg={IMG('Dakar', 3)}
        compact
        title={richT(t('mice.title', 'Vos événements, {em}à hauteur d\'ACT{/em}.'))}
        intro={t('mice.intro', 'Africa Connection Tours dispose d\'une cellule hautement spécialisée en élaboration et gestion d\'événementiels.')}
      />

      {/* Bandeau chiffres / positionnement B2B */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="grid md:grid-cols-[1.2fr,1fr] gap-10 md:gap-16 items-start">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-4">
              — {t('mice.what.kicker', 'Ce que MICE veut dire')}
            </div>
            <h2 className="font-display text-[32px] md:text-[44px] leading-tight">
              {richT(t('mice.what.title', 'Meetings · Incentives · {em}Conferences{/em} · Events.'))}
            </h2>
            <div className="mt-6 space-y-4 text-[15px] md:text-[16px] text-ink-800 leading-relaxed max-w-xl">
              <p>{t('mice.what.p1', 'Depuis Dakar, nous concevons pour les entreprises, agences et associations des expériences sur mesure : séminaires de direction, voyages d\'incentive, conventions annuelles, congrès professionnels et événements de marque.')}</p>
              <p>{t('mice.what.p2', 'Notre approche : un interlocuteur unique, une logistique éprouvée, un cadre culturel fort, et cette signature ACT — la téranga sénégalaise appliquée à l\'exigence corporate.')}</p>
            </div>
          </div>
          <div className="rounded-3xl bg-terre/8 border border-terre/15 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4 text-terre">
              <Icons.Users size={18}/>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em]">
                {t('mice.audience.label', 'Pour qui')}
              </span>
            </div>
            <ul className="space-y-3 text-[14.5px] text-ink-800">
              <li className="flex items-start gap-3"><Icons.Check size={16} className="text-terre mt-0.5"/>{t('mice.audience.item1', 'Directions et comités exécutifs')}</li>
              <li className="flex items-start gap-3"><Icons.Check size={16} className="text-terre mt-0.5"/>{t('mice.audience.item2', 'DRH et responsables événementiels')}</li>
              <li className="flex items-start gap-3"><Icons.Check size={16} className="text-terre mt-0.5"/>{t('mice.audience.item3', 'Agences d\'événementiel et de communication')}</li>
              <li className="flex items-start gap-3"><Icons.Check size={16} className="text-terre mt-0.5"/>{t('mice.audience.item4', 'Fédérations et associations professionnelles')}</li>
              <li className="flex items-start gap-3"><Icons.Check size={16} className="text-terre mt-0.5"/>{t('mice.audience.item5', 'Marques et sponsors en activation locale')}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4 services — grille */}
      <Section
        label={t('mice.services.label', 'Notre offre')}
        title={richT(t('mice.services.title', 'Un accompagnement {em}de bout en bout{/em}.'))}
        kicker={t('mice.services.kicker', 'De la première étude à la gestion post-événement, une cellule dédiée pilote chaque étape.')}
        className="py-16 md:py-24"
      >
        <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
          {services.map((s, i) => {
            const I = Icons[s.icon];
            return (
              <article key={i} className="group bg-sand-50 rounded-3xl p-6 md:p-8 border border-ink/10 hover:border-terre/30 hover:shadow-md hover:shadow-ink/5 transition-all">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-11 w-11 rounded-full bg-terre/10 text-terre inline-flex items-center justify-center shrink-0 group-hover:bg-terre group-hover:text-sand-50 transition-colors">
                    {I ? <I size={20}/> : <Icons.Star size={20}/>}
                  </div>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-400">{s.num}</span>
                </div>
                <div className="font-display text-[24px] md:text-[26px] leading-tight">{t(s.tKey)}</div>
                <p className="mt-3 text-[14.5px] text-ink-700 leading-relaxed">{t(s.dKey)}</p>
              </article>
            );
          })}
        </div>
      </Section>

      {/* Méthode ACT — chiffres/timeline light */}
      <section className="py-16 md:py-24 bg-ink text-sand-50">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre-300 mb-4">
            — {t('mice.method.kicker', 'Comment on travaille')}
          </div>
          <h2 className="font-display text-[32px] md:text-[44px] leading-tight max-w-3xl">
            {richT(t('mice.method.title', 'De la demande à l\'après-événement : {em}quatre étapes claires{/em}.'))}
          </h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { n:'1', tKey:'mice.method.s1.t', dKey:'mice.method.s1.d' },
              { n:'2', tKey:'mice.method.s2.t', dKey:'mice.method.s2.d' },
              { n:'3', tKey:'mice.method.s3.t', dKey:'mice.method.s3.d' },
              { n:'4', tKey:'mice.method.s4.t', dKey:'mice.method.s4.d' }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="font-display text-[48px] md:text-[64px] leading-none text-terre-300">{step.n}</div>
                <div className="mt-3 font-display text-[20px] md:text-[24px] leading-tight">{t(step.tKey)}</div>
                <p className="mt-2 text-sand-200 text-[13.5px] md:text-[14px] leading-relaxed">{t(step.dKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA "Consultez-nous" */}
      <section className="py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-4">
            — {t('mice.cta.kicker', 'Consultez-nous')}
          </div>
          <h3 className="font-display text-[32px] md:text-[48px] leading-tight">
            {richT(t('mice.cta.title', 'Parlons de votre {em}prochain événement{/em}.'))}
          </h3>
          <p className="mt-6 text-ink-600 text-[15px] md:text-[16px] max-w-xl mx-auto leading-relaxed">
            {t('mice.cta.intro', 'Décrivez-nous votre projet — nature de l\'événement, dates envisagées, nombre de participants — et nous revenons vers vous sous 24h ouvrées avec une proposition personnalisée.')}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Btn onClick={()=>nav('custom')} variant="terre" size="lg" icon={<Icons.ArrowRight size={16}/>}>
              {t('mice.cta.brief', 'Décrire mon projet')}
            </Btn>
            <Btn as="a" href={waHref} target="_blank" rel="noreferrer" variant="wa" size="lg" icon={<Icons.Whatsapp size={16}/>}>
              {t('mice.cta.wa', 'Nous joindre sur WhatsApp')}
            </Btn>
            <Btn onClick={()=>nav('contact')} variant="outline" size="lg">
              {t('mice.cta.contact', 'Nous contacter')}
            </Btn>
          </div>
          <p className="mt-8 text-[12.5px] text-ink-500 font-mono italic max-w-lg mx-auto">
            {t('mice.cta.note', '— Confidentialité assurée. Les briefs reçus ne sont partagés qu\'avec l\'équipe MICE d\'ACT.')}
          </p>
        </div>
      </section>

      <Footer go={nav}/>
    </main>
  );
};

if (typeof window !== 'undefined') window.Mice = Mice;
export { Mice };

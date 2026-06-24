// Croisières — page placeholder en attendant le contenu d'ACT.
// L'agence prépare une présentation dédiée (photos + textes). En attendant,
// la page affiche un état d'attente élégant avec CTA WhatsApp pour les
// demandes de renseignements.

const Croisieres = ({ go }) => {
  const { t, richT } = useI18n();
  const waMsg = t('croisieres.wa');
  return (
    <main className="bg-sand-50">
      <PageHero kicker={t('page.croisieres.kicker')} tone="atlant" mood="water"
        bgImg={IMG('Delta du Saloum', 1)}
        title={richT(t('page.croisieres.title'))}
        intro={t('page.croisieres.intro')}/>

      {/* Bloc "Bientôt disponible" */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-terre/10 text-terre font-mono text-[11px] uppercase tracking-[0.18em] mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-terre animate-pulse"/>
          {t('page.croisieres.badge')}
        </div>
        <h2 className="font-display text-[34px] md:text-[48px] leading-tight">
          {richT(t('page.croisieres.body.title'))}
        </h2>
        <p className="mt-6 text-ink-600 max-w-xl mx-auto text-[15.5px] md:text-[17px] leading-relaxed">
          {t('page.croisieres.body.intro')}
        </p>

        {/* Three reassurance points */}
        <div className="mt-12 grid sm:grid-cols-3 gap-5 text-left">
          {[
            { I:Icons.MapPin, tKey:'page.croisieres.point1.t', dKey:'page.croisieres.point1.d' },
            { I:Icons.Users,  tKey:'page.croisieres.point2.t', dKey:'page.croisieres.point2.d' },
            { I:Icons.Clock,  tKey:'page.croisieres.point3.t', dKey:'page.croisieres.point3.d' },
          ].map((p, i) => (
            <div key={i} className="bg-sand-100/60 rounded-3xl p-6 border border-ink/5">
              <div className="h-11 w-11 rounded-full bg-atlantique/10 text-atlantique inline-flex items-center justify-center mb-4">
                <p.I size={20}/>
              </div>
              <div className="font-display text-[20px] leading-tight">{t(p.tKey)}</div>
              <p className="mt-2 text-[14px] text-ink-600 leading-relaxed">{t(p.dKey)}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <Btn as="a" href={buildWaURL(waMsg)} target="_blank" rel="noreferrer"
               variant="wa" size="lg" icon={<Icons.Whatsapp size={18}/>}>
            {t('page.croisieres.cta.whatsapp')}
          </Btn>
          <Btn onClick={()=>go('contact')} variant="outline" size="lg" icon={<Icons.Mail size={16}/>}>
            {t('page.croisieres.cta.email')}
          </Btn>
        </div>

        <p className="mt-10 text-[12.5px] text-ink-500 italic max-w-md mx-auto">
          {t('page.croisieres.note')}
        </p>
      </section>

      <Footer go={go}/>
    </main>
  );
};

Object.assign(window, { Croisieres });

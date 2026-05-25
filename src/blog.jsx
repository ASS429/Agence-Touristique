// Blog — list page + article detail page.

// =============== List page ==================================================
const BlogList = ({ go, onOpenArticle, onOpenTour }) => {
  const [cat, setCat]     = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [page, setPage]   = React.useState(1);
  const perPage = 6;

  React.useEffect(()=>{ setPage(1); }, [cat, query]);

  // Featured (the one with featured=true), then the rest
  const featured = BLOG.find(b => b.featured) || BLOG[0];

  const filtered = BLOG.filter(b => b.id !== featured.id).filter(b => {
    if (cat !== 'all' && b.cat !== cat) return false;
    if (query) {
      const q = query.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.excerpt.toLowerCase().includes(q) || b.tag.toLowerCase().includes(q);
    }
    return true;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const view  = filtered.slice((page-1)*perPage, page*perPage);

  return (
    <main className="bg-sand-50">
      <PageHero kicker="Le blog Téranga" tone="terre" mood="city" bgImg={IMG('Saint-Louis', 8)} compact
        title={<>Le guide du voyage <em>au Sénégal</em>.</>}
        intro="Récits, conseils pratiques, calendriers honnêtes — par des guides qui vivent ici toute l’année.">
        <div className="relative max-w-md">
          <Icons.Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"/>
          <input value={query} onChange={(e)=>setQuery(e.target.value)}
            placeholder="Rechercher un article…"
            className="w-full h-12 rounded-full bg-sand-50 border border-sand-50/30 text-ink pl-11 pr-4 outline-none text-[14px]"/>
        </div>
      </PageHero>

      {/* Featured article */}
      <Section label="À la une" title={null} className="pt-16 md:pt-20 pb-10">
        <button onClick={()=>onOpenArticle(featured.id)} className="group block w-full text-left">
          <div className="grid md:grid-cols-[1.1fr,1fr] gap-6 md:gap-10 items-stretch">
            <Photo tone={featured.tone} mood={featured.mood} label={featured.tag} ratio="aspect-[5/4] md:aspect-[5/3]" rounded="rounded-3xl" src={featured.img} alt={featured.title}/>
            <div className="flex flex-col justify-center">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-terre mb-3">À la une · {featured.tag}</div>
              <h2 className="font-display text-[34px] md:text-[48px] leading-[1.02] group-hover:text-terre transition-colors">{featured.title}</h2>
              <p className="mt-4 text-ink-600 text-[15px] leading-relaxed max-w-xl">{featured.excerpt}</p>
              <div className="mt-5 flex items-center gap-4 text-[12.5px] text-ink-500">
                <span>{featured.author.name}</span>
                <span className="h-1 w-1 rounded-full bg-ink-400"/>
                <span>{featured.date}</span>
                <span className="h-1 w-1 rounded-full bg-ink-400"/>
                <span>{featured.readTime}</span>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium">
                Lire l’article <Icons.ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform"/>
              </div>
            </div>
          </div>
        </button>
      </Section>

      {/* Category chips */}
      <section className="border-y border-ink/10 bg-sand-100/40">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {BLOG_CATEGORIES.map(c => (
            <button key={c.id} onClick={()=>setCat(c.id)}
              className={`shrink-0 h-9 px-4 rounded-full text-[12.5px] font-medium border transition-colors ${cat===c.id ? 'bg-ink text-sand-50 border-ink' : 'border-ink/15 text-ink-700 hover:border-ink/40'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <Section label={null} title={null} className="py-12 md:py-16">
        {view.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink/20 p-12 text-center text-ink-600">
            Aucun article ne correspond. Essayez une autre catégorie.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
            {view.map(b => (
              <button key={b.id} onClick={()=>onOpenArticle(b.id)}
                className="group flex flex-col text-left bg-sand-50 rounded-3xl overflow-hidden border border-ink/5 hover:shadow-xl transition-shadow">
                <Photo tone={b.tone} mood={b.mood} label={b.tag} ratio="aspect-[5/4]" rounded="" src={b.img} alt={b.title}/>
                <div className="p-5 md:p-6 flex flex-col flex-1">
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink-500">{b.tag} · {b.readTime}</div>
                  <h3 className="font-display text-[22px] md:text-[24px] leading-tight mt-2 group-hover:text-terre transition-colors">{b.title}</h3>
                  <p className="text-[13.5px] text-ink-600 leading-relaxed mt-2.5 line-clamp-3">{b.excerpt}</p>
                  <div className="mt-auto pt-4 flex items-center justify-between text-[12px] text-ink-500">
                    <span>{b.date}</span>
                    <span className="inline-flex items-center gap-1 text-ink-700 group-hover:text-terre">Lire <Icons.ArrowRight size={12}/></span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-1.5">
            {Array.from({length:pages}).map((_,i)=>(
              <button key={i} onClick={()=>setPage(i+1)}
                className={`h-10 min-w-[40px] px-3 rounded-full text-[13px] font-medium ${page===i+1 ? 'bg-ink text-sand-50' : 'text-ink-700 hover:bg-ink/5'}`}>
                {String(i+1).padStart(2,'0')}
              </button>
            ))}
          </div>
        )}
      </Section>

      {/* Newsletter */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="rounded-3xl bg-sand-100 border border-ink/5 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-2">— Lettre Téranga</div>
              <h3 className="font-display text-[24px] md:text-[28px] leading-tight">Un email par mois, jamais plus.</h3>
              <p className="text-[14px] text-ink-600 mt-1.5">Conseils saisonniers, nouvelles destinations, et nos coups de cœur de l’équipe.</p>
            </div>
            <form className="flex items-center gap-2 w-full md:w-auto" onSubmit={(e)=>e.preventDefault()}>
              <input type="email" required placeholder="vous@email.com"
                className="flex-1 md:w-64 h-11 rounded-full border border-ink/15 bg-sand-50 px-4 text-[14px] outline-none focus:border-terre"/>
              <Btn variant="primary" size="md" as="button" type="submit">S’abonner</Btn>
            </form>
          </div>
        </div>
      </section>

      <Footer go={go}/>
    </main>
  );
};

// =============== Article page ===============================================
const BlogArticle = ({ id, go, onOpenArticle, onOpenTour }) => {
  const article = BLOG.find(b => b.id === id) || BLOG[0];
  const similar = BLOG.filter(b => b.id !== article.id && b.cat === article.cat).slice(0,3);
  const fallback = BLOG.filter(b => b.id !== article.id).slice(0,3);
  const relatedArticles = similar.length ? similar : fallback;
  const relatedCircuits = CIRCUITS.slice(0, 2);

  return (
    <main className="bg-sand-50">
      {/* Header */}
      <article>
        <header className="pt-28 md:pt-36 pb-10 md:pb-14">
          <div className="max-w-3xl mx-auto px-4 md:px-8">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-terre mb-5">
              <button onClick={()=>go('blog')} className="hover:text-ink">← Blog</button>
              <span className="opacity-50 mx-3">·</span>{article.tag}
            </div>
            <h1 className="font-display text-[40px] sm:text-[56px] md:text-[72px] leading-[1.0]">{article.title}</h1>
            <p className="mt-5 text-ink-600 text-[17px] md:text-[19px] leading-relaxed">{article.excerpt}</p>
            <div className="mt-7 flex items-center gap-4 text-[13px] text-ink-500">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <Photo tone="terre" mood="portrait" showLabel={false} rounded="" className="h-10 w-10"/>
                </div>
                <div>
                  <div className="text-ink font-medium text-[13px]">{article.author.name}</div>
                  <div>{article.author.role}</div>
                </div>
              </div>
              <span className="h-1 w-1 rounded-full bg-ink-400"/>
              <span>{article.date}</span>
              <span className="h-1 w-1 rounded-full bg-ink-400"/>
              <span>{article.readTime}</span>
            </div>
          </div>
        </header>

        {/* Cover */}
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <Photo tone={article.tone} mood={article.mood} label={`couverture · ${article.tag}`} ratio="aspect-[16/9]" rounded="rounded-3xl" className="shadow-2xl" src={article.img} alt={article.title}/>
        </div>

        {/* Body */}
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-12 md:py-16 grid md:grid-cols-[1fr,300px] gap-12 lg:gap-16">
          <div className="prose-article">
            <ArticleBody article={article}/>

            {/* Share row */}
            <div className="mt-12 pt-6 border-t border-ink/10 flex flex-wrap items-center gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500 mr-2">Partager</span>
              <ShareBtn I={Icons.Whatsapp} label="WhatsApp"/>
              <ShareBtn I={Icons.Facebook} label="Facebook"/>
              <ShareBtn I={Icons.Globe}    label="Lien"/>
            </div>

            {/* Author bio */}
            <div className="mt-12 p-6 md:p-7 rounded-3xl bg-sand-100 border border-ink/5 flex items-center gap-5">
              <div className="h-16 w-16 rounded-full overflow-hidden shrink-0">
                <Photo tone="terre" mood="portrait" showLabel={false} rounded="" className="h-16 w-16"/>
              </div>
              <div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-500">À propos de l’auteur</div>
                <div className="font-display text-[22px] leading-tight mt-1">{article.author.name}</div>
                <div className="text-[13.5px] text-ink-600 mt-1">{article.author.role} — vit et travaille à Dakar.</div>
              </div>
            </div>
          </div>

          {/* Sticky sidebar */}
          <aside className="hidden md:block">
            <div className="sticky top-28 space-y-5">
              <div className="rounded-3xl bg-ink text-sand-50 p-6">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-terre-300 mb-2">— Envie de vivre ça&nbsp;?</div>
                <h3 className="font-display text-[22px] leading-tight">Deux circuits liés à cet article.</h3>
                <ul className="mt-5 space-y-3">
                  {relatedCircuits.map(c => (
                    <li key={c.id}>
                      <button onClick={()=>onOpenTour(c.id)} className="w-full flex items-center gap-3 group text-left">
                        <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0">
                          <Photo tone={c.tone} mood={c.mood} showLabel={false} rounded="" className="h-12 w-12" src={c.img} alt={c.title}/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium truncate group-hover:text-terre-300">{c.title}</div>
                          <div className="text-[11px] text-sand-300 truncate">{c.days}j · {c.subtitle}</div>
                        </div>
                        <Icons.ArrowUpRight size={14} className="text-sand-300 shrink-0"/>
                      </button>
                    </li>
                  ))}
                </ul>
                <Btn as="a" href={buildWaURL('Bonjour, j’ai lu un article qui m’a donné envie de voyager !')} target="_blank" rel="noreferrer"
                     variant="wa" size="md" className="mt-5 w-full" icon={<Icons.Whatsapp size={14}/>}>Discuter sur WhatsApp</Btn>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {/* Related articles */}
      <Section label="À lire aussi" title={null} className="pb-16">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {relatedArticles.map(b => (
            <button key={b.id} onClick={()=>onOpenArticle(b.id)}
              className="group flex flex-col text-left bg-sand-100 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
              <Photo tone={b.tone} mood={b.mood} label={b.tag} ratio="aspect-[5/4]" rounded="" src={b.img} alt={b.title}/>
              <div className="p-5">
                <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink-500">{b.tag}</div>
                <h3 className="font-display text-[22px] leading-tight mt-2 group-hover:text-terre">{b.title}</h3>
                <div className="text-[12px] text-ink-500 mt-2">{b.date} · {b.readTime}</div>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <section className="pb-20">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-terre to-terre-700 p-8 md:p-12 text-sand-50 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-sand-100/80 mb-2">— Prêt à partir&nbsp;?</div>
              <h3 className="font-display text-[28px] md:text-[40px] leading-tight">Du papier à la <em>route</em>.</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <Btn onClick={()=>go('circuits')} variant="primary" size="lg" className="bg-sand-50 text-ink hover:bg-sand-100" icon={<Icons.ArrowRight size={16}/>}>Voir les circuits</Btn>
              <Btn onClick={()=>go('custom')}   variant="outlineLight" size="lg">Voyage sur mesure</Btn>
            </div>
          </div>
        </div>
      </section>

      <Footer go={go}/>
    </main>
  );
};

const ShareBtn = ({ I, label }) => (
  <button className="h-9 px-3.5 rounded-full border border-ink/15 inline-flex items-center gap-2 text-[12.5px] hover:border-ink/40 hover:bg-ink/5">
    <I size={14}/> {label}
  </button>
);

// --- Article body (custom mini "prose" component) ---------------------------
// Renders a list of typed blocks from `article.body`. Each block:
//   { type:'lead'|'p',    html }   — paragraph (lead = bold first one)
//   { type:'h2'|'h3',     text }   — section / subsection title
//   { type:'ul',          items }  — bulleted list (items can contain HTML)
//   { type:'quote',       text }   — pull quote
//   { type:'callout',     title, html } — tinted info block
const ArticleBody = ({ article }) => {
  const blocks = article.body && article.body.length ? article.body : [
    { type:'p', html:'<em>Cet article est en cours de rédaction.</em>' },
  ];
  const renderBlock = (b, i) => {
    switch (b.type) {
      case 'lead':    return <p key={i} dangerouslySetInnerHTML={{__html: b.html }}/>;
      case 'p':       return <p key={i} dangerouslySetInnerHTML={{__html: b.html }}/>;
      case 'h2':      return <h2 key={i}>{b.text}</h2>;
      case 'h3':      return <h3 key={i}>{b.text}</h3>;
      case 'ul':      return <ul key={i}>{b.items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{__html: it }}/>)}</ul>;
      case 'quote':   return <blockquote key={i}>{b.text}</blockquote>;
      case 'callout': return (
        <div key={i} className="callout">
          {b.title && <div className="callout-title">— {b.title}</div>}
          <span dangerouslySetInnerHTML={{__html: b.html }}/>
        </div>
      );
      default: return null;
    }
  };
  return (
    <div className="article-body text-[16.5px] md:text-[17.5px] leading-[1.7] text-ink-800 max-w-[680px]">
      <style>{`
        .article-body p { margin: 0 0 1.1em; }
        .article-body h2 { font-family:'Instrument Serif', Georgia, serif; font-size: 32px; line-height: 1.15; margin: 2em 0 0.6em; }
        .article-body h3 { font-family:'Instrument Serif', Georgia, serif; font-size: 24px; line-height: 1.2; margin: 1.6em 0 0.5em; }
        .article-body ul { margin: 1em 0 1.4em; padding-left: 1.2em; }
        .article-body ul li { margin-bottom: 0.4em; list-style: disc; }
        .article-body blockquote {
          margin: 1.6em 0; padding: 0 0 0 1.1em; border-left: 3px solid #C8593B;
          font-family:'Instrument Serif', Georgia, serif; font-style: italic;
          font-size: 24px; line-height: 1.3; color:#1A1612;
        }
        .article-body strong { color:#1A1612; }
        .article-body em { font-family:'Instrument Serif', Georgia, serif; font-style: italic; font-size: 1.05em; }
        .article-body a { color:#C8593B; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
        .article-body .callout {
          margin: 1.6em 0; padding: 1.3em 1.4em; border-radius: 18px;
          background: #ECDDC4; color:#1A1612;
        }
        .article-body .callout-title { font-family:'JetBrains Mono'; font-size: 11px;
          letter-spacing:0.18em; text-transform:uppercase; color:#C8593B; margin-bottom:.4em; }
      `}</style>
      {blocks.map(renderBlock)}
      <p className="text-ink-600">Texte rédigé par {article.author.name}, mis à jour {article.date}.</p>
    </div>
  );
};

Object.assign(window, { BlogList, BlogArticle });

// =====================================================================
// src/content.jsx — Pont contenu Supabase → site public (live CMS)
//
// Chargé APRÈS data.jsx, i18n.jsx et supabase-public.jsx. Quand la base
// répond (événement `act-db-loaded`), ce module :
//   1. Superpose les traductions DB (title/subtitle/short en 4 langues)
//      dans le dictionnaire i18n (window.DICT) — les t(`circuit.<id>...`)
//      existants prennent alors automatiquement le contenu de la base.
//   2. Fusionne les lignes DB dans les tableaux statiques (CIRCUITS,
//      EXCURSIONS, ATELIERS) EN PLACE : mise à jour des champs structurels
//      (photo, durée, région, publication…), ajout des nouveautés,
//      retrait des fiches dépubliées.
//   3. Ne déclenche un ré-affichage (remount via bump de clé) QUE si la
//      fusion a réellement changé quelque chose. Tant que la base est un
//      miroir du statique, aucun changement visible → zéro risque.
//
// Sécurité : toute la logique est enveloppée en try/catch. En cas
// d'erreur ou de shape inattendue, on garde le contenu statique intact
// (fail-safe, jamais de page cassée).
// =====================================================================

(function () {
  const LANGS = ['fr', 'en', 'it', 'de'];
  const LANG_KEYS = { fr: 'FR', en: 'EN', it: 'IT', de: 'DE' };

  let changed = false;
  const markChanged = () => { changed = true; };

  // Lecture d'un champ multilingue avec repli : obj.field_<lang> →
  // obj.field_fr → obj.field. Utilisé par blog.jsx et la FAQ (pages.jsx)
  // pour un rendu qui suit la langue courante.
  window.pickLang = function (obj, field, lang) {
    if (!obj) return '';
    const l = (lang || 'fr').toLowerCase();
    return obj[`${field}_${l}`] || obj[`${field}_fr`] || obj[field] || '';
  };

  // Corrige le bug « FR-only » de Blog et FAQ : leur rendu lit les champs
  // bruts (b.title, it.q) alors que les traductions existent dans le
  // dictionnaire i18n (clés blog.<slug>.title/excerpt et faq.<gi>.<ii>.q/a,
  // jamais appliquées). On enrichit ici chaque objet AVEC des champs
  // title_fr/en/it/de (etc.) puisés dans le dictionnaire. Exécuté de façon
  // SYNCHRONE au chargement (avant le 1er rendu) → pas de remount.
  function enrichBlogFaqFromDict() {
    const DICT = window.DICT;
    if (!DICT) return;
    // Blog : clés par slug
    if (Array.isArray(window.BLOG)) {
      window.BLOG.forEach(b => {
        LANGS.forEach(lang => {
          const D = DICT[LANG_KEYS[lang]]; if (!D) return;
          b[`title_${lang}`]   = D[`blog.${b.id}.title`]   || (lang === 'fr' ? b.title   : b[`title_${lang}`]);
          b[`excerpt_${lang}`] = D[`blog.${b.id}.excerpt`] || (lang === 'fr' ? b.excerpt : b[`excerpt_${lang}`]);
        });
      });
    }
    // FAQ : clés par index de groupe/item
    if (Array.isArray(window.FAQ)) {
      window.FAQ.forEach((g, gi) => {
        (g.items || []).forEach((it, ii) => {
          LANGS.forEach(lang => {
            const D = DICT[LANG_KEYS[lang]]; if (!D) return;
            it[`question_${lang}`] = D[`faq.${gi}.${ii}.q`] || (lang === 'fr' ? it.q : it[`question_${lang}`]);
            it[`answer_${lang}`]   = D[`faq.${gi}.${ii}.a`] || (lang === 'fr' ? it.a : it[`answer_${lang}`]);
          });
        });
      });
    }
  }

  // Déduit la langue d'un témoignage depuis le pays (pour le drapeau).
  function countryToLang(country) {
    const c = (country || '').toLowerCase();
    if (c.includes('ital')) return 'it';
    if (c.includes('allem') || c.includes('german') || c.includes('deutsch')) return 'de';
    if (c.includes('franc') || c.includes('france')) return 'fr';
    if (c.includes('unis') || c.includes('states') || c.includes('uk') ||
        c.includes('angl') || c.includes('kingdom')) return 'en';
    return 'fr';
  }

  // --- Superposition des traductions dans le dictionnaire i18n ---------
  function overlayTranslations(prefix, rows, fields) {
    const DICT = window.DICT;
    if (!DICT) return;
    rows.forEach(row => {
      const slug = row.slug;
      if (!slug) return;
      LANGS.forEach(lang => {
        const D = DICT[LANG_KEYS[lang]];
        if (!D) return;
        fields.forEach(field => {
          const val = row[`${field}_${lang}`];
          if (val == null || val === '') return;
          const key = `${prefix}.${slug}.${field}`;
          if (D[key] !== val) { D[key] = val; markChanged(); }
        });
      });
    });
  }

  // --- Fusion en place d'une liste statique avec les lignes DB ---------
  // mapper(row) → { id, ...champsStructurels }  (les libellés passent par
  // le dictionnaire, pas par l'objet). defaults = champs requis pour un
  // item créé uniquement en base (absent du statique).
  function mergeInPlace(staticArr, dbRows, mapper, defaults, labelsFor) {
    if (!Array.isArray(staticArr) || !Array.isArray(dbRows)) return;
    const indexById = new Map(staticArr.map((it, i) => [it.id, i]));

    dbRows.forEach(row => {
      const mapped = mapper(row);
      if (!mapped || !mapped.id) return;

      // Dépubliée → retirer du tableau si présente
      if (row.published === false) {
        if (indexById.has(mapped.id)) {
          const idx = staticArr.findIndex(x => x.id === mapped.id);
          if (idx >= 0) { staticArr.splice(idx, 1); markChanged(); }
        }
        return;
      }

      if (indexById.has(mapped.id)) {
        // Mise à jour des champs fournis par la base
        const existing = staticArr[indexById.get(mapped.id)];
        Object.keys(mapped).forEach(k => {
          if (k === 'id') return;
          if (mapped[k] == null) return;
          if (existing[k] !== mapped[k]) { existing[k] = mapped[k]; markChanged(); }
        });
      } else {
        // Nouvel item créé en base : défauts + libellés fallback + structurel
        staticArr.push({ ...defaults, ...(labelsFor ? labelsFor(row) : {}), ...clean(mapped) });
        markChanged();
      }
    });
  }

  // Retire les clés nulles d'un objet mappé (pour ne pas écraser les
  // défauts par des null).
  function clean(obj) {
    const out = {};
    Object.keys(obj).forEach(k => { if (obj[k] != null) out[k] = obj[k]; });
    return out;
  }

  // --- Mappers DB → shape statique -------------------------------------
  // IMPORTANT : les libellés (title/subtitle/short) NE sont PAS fusionnés
  // ici. Ils sont rendus via t(`circuit.<id>.title`, …) donc pilotés par
  // le dictionnaire (superposé par overlayTranslations). Les inclure ici
  // provoquerait un faux « changed » (littéral data.jsx ≠ valeur i18n) et
  // un remount inutile à chaque chargement. On ne fusionne donc que les
  // champs réellement lus en direct par les composants.
  const mapCircuit = (row) => ({
    id: row.slug,
    days: row.duration_days,
    img: row.hero_photo,
  });

  const mapExcursion = (row) => ({
    id: row.slug,
    kind: row.format === 'halfday' ? 'half' : 'full',
    start: row.start_point,
    img: row.hero_photo,
  });

  const mapAtelier = (row) => ({
    id: row.slug,
    category: row.category,
    img: row.hero_photo,
  });

  // Libellés pour un item créé UNIQUEMENT en base (fallback si le
  // dictionnaire ne couvre pas encore ce slug — l'overlay l'ajoute aussi).
  const newItemLabels = (row) => clean({
    title: row.title_fr, subtitle: row.subtitle_fr, short: row.short_fr,
  });

  // Défauts pour un item créé uniquement en base (champs requis par les
  // cartes / filtres du site qui n'existent pas côté DB).
  const CIRCUIT_DEFAULTS   = { tone: 'terre', mood: 'horizon', types: [], destIds: [], badges: [], priceXOF: null, days: 1, popularity: 50 };
  const EXCURSION_DEFAULTS = { tone: 'terre', mood: 'horizon', types: [], destIds: [], days: 1, nights: 0, priceXOF: null, popularity: 50, kind: 'full', start: 'dakar' };
  const ATELIER_DEFAULTS   = { tone: 'terre', mood: 'portrait', category: 'artisanat', priceXOF: null };

  // --- Point d'entrée : appliquer le contenu DB ------------------------
  function applyDbContent() {
    changed = false;
    try {
      const C = window.CIRCUITS_DB, E = window.EXCURSIONS_DB, A = window.ATELIERS_DB;

      if (Array.isArray(C)) {
        overlayTranslations('circuit', C, ['title', 'subtitle']);
        mergeInPlace(window.CIRCUITS, C, mapCircuit, CIRCUIT_DEFAULTS, newItemLabels);
      }
      if (Array.isArray(E)) {
        overlayTranslations('excursion', E, ['title', 'short']);
        mergeInPlace(window.EXCURSIONS, E, mapExcursion, EXCURSION_DEFAULTS, newItemLabels);
      }
      if (Array.isArray(A)) {
        overlayTranslations('atelier', A, ['title', 'subtitle', 'short']);
        mergeInPlace(window.ATELIERS, A, mapAtelier, ATELIER_DEFAULTS, newItemLabels);
      }

      // Témoignages : liste curée gérée en bloc par ACT. Rendus dans leur
      // langue d'origine (text_fr), le drapeau est déduit du pays. On
      // remplace intégralement la liste statique par celle de la base
      // (si non vide), sinon on garde le statique.
      const T = window.TESTIMONIALS_DB;
      if (Array.isArray(T) && T.length && Array.isArray(window.TESTIMONIALS)) {
        const mapped = T.map((row, i) => ({
          name: row.author_name,
          from: row.author_country || '',
          lang: countryToLang(row.author_country),
          circuit: '',
          stars: row.rating || 5,
          text: row.text_fr || row.text_en || row.text_it || row.text_de || '',
          tone: ['terre', 'ocre', 'sand'][i % 3],
          mood: 'portrait',
        }));
        // On ne remplace que si le fond diffère réellement (nom + texte +
        // note) — ignore les champs présentationnels (circuit/tone/mood)
        // absents de la base, pour éviter un remount à chaque chargement.
        const sig = arr => JSON.stringify(arr.map(x => [x.name, x.text, x.stars]));
        if (sig(window.TESTIMONIALS) !== sig(mapped)) {
          window.TESTIMONIALS.length = 0;
          mapped.forEach(m => window.TESTIMONIALS.push(m));
          markChanged();
        }
      }

      // Blog : superpose les traductions titre/extrait + fusionne la photo,
      // et ajoute les articles créés uniquement en base (corps = content_<lang>).
      const B = window.BLOG_DB;
      if (Array.isArray(B) && Array.isArray(window.BLOG)) {
        const bySlug = new Map(window.BLOG.map(x => [x.id, x]));
        B.forEach(row => {
          if (!row.slug || row.published === false) return;
          const existing = bySlug.get(row.slug);
          const langs = {};
          LANGS.forEach(l => {
            langs[`title_${l}`]   = row[`title_${l}`]   || undefined;
            langs[`excerpt_${l}`] = row[`excerpt_${l}`] || undefined;
          });
          if (existing) {
            Object.keys(langs).forEach(k => { if (langs[k] && existing[k] !== langs[k]) { existing[k] = langs[k]; markChanged(); } });
            if (row.hero_photo && existing.img !== row.hero_photo) { existing.img = row.hero_photo; markChanged(); }
          } else {
            // Article créé en base : corps depuis content_<lang> (paragraphes)
            const bodyByLang = {};
            LANGS.forEach(l => {
              const c = row[`content_${l}`];
              if (c) bodyByLang[l] = c.split(/\n{2,}/).map(p => ({ type: 'p', text: p.trim() })).filter(x => x.text);
            });
            window.BLOG.push({
              id: row.slug, title: row.title_fr, excerpt: row.excerpt_fr || '',
              ...langs,
              cat: row.category || 'destinations', tag: 'Article',
              tone: 'sand', mood: 'horizon', readTime: '',
              date: row.published_at ? String(row.published_at).slice(0, 10) : '',
              author: { name: row.author || 'Africa Connection Tours', role: '' },
              img: row.hero_photo || null,
              body: bodyByLang.fr || [],
              bodyByLang,
            });
            markChanged();
          }
        });
      }

      // FAQ : remplacement complet depuis la base (groupé par catégorie),
      // chaque item portant question/answer en 4 langues.
      const F = window.FAQ_DB;
      if (Array.isArray(F) && F.length && Array.isArray(window.FAQ)) {
        const byCat = new Map();
        F.forEach(row => {
          if (row.published === false) return;
          const cat = row.category || 'Général';
          if (!byCat.has(cat)) byCat.set(cat, []);
          const it = { q: row.question_fr, a: row.answer_fr };
          LANGS.forEach(l => {
            it[`question_${l}`] = row[`question_${l}`] || (l === 'fr' ? row.question_fr : undefined);
            it[`answer_${l}`]   = row[`answer_${l}`]   || (l === 'fr' ? row.answer_fr   : undefined);
          });
          byCat.get(cat).push(it);
        });
        const rebuilt = [...byCat.entries()].map(([cat, items]) => ({ cat, items }));
        const sig = a => JSON.stringify(a.map(g => [g.cat, g.items.map(i => [i.q, i.a])]));
        if (rebuilt.length && sig(window.FAQ) !== sig(rebuilt)) {
          window.FAQ.length = 0;
          rebuilt.forEach(g => window.FAQ.push(g));
          markChanged();
        }
      }

      if (window.console) {
        console.log('[ACT] Contenu Supabase appliqué au site public',
          { changed, circuits: C?.length, excursions: E?.length, ateliers: A?.length });
      }

      // Ne notifie un ré-affichage que si quelque chose a changé.
      if (changed) {
        window.dispatchEvent(new CustomEvent('act-content-updated'));
      }
    } catch (err) {
      if (window.console) console.warn('[ACT] Fusion contenu DB ignorée (fallback statique) :', err.message);
    }
  }

  // Correction du bug FR-only Blog/FAQ — SYNCHRONE, avant le 1er rendu.
  try { enrichBlogFaqFromDict(); } catch (e) { if (window.console) console.warn('[ACT] enrichBlogFaq:', e.message); }

  // Si la base est déjà chargée (course), appliquer maintenant ; sinon
  // attendre l'événement.
  if (window.__ACT_DB_LOADED__) {
    applyDbContent();
  }
  window.addEventListener('act-db-loaded', applyDbContent);

  // -------------------------------------------------------------------
  // Anti-abus formulaires (honeypot + timing) — première ligne de défense
  // contre les bots avant une solution captcha (Turnstile) côté serveur.
  //   * honeypot : un champ caché que les humains ne remplissent jamais ;
  //     s'il est rempli → bot.
  //   * timing : une soumission en moins de ~2,5 s après l'affichage du
  //     formulaire est quasi certainement automatisée.
  // Retourne true si la soumission est probablement un bot (à ignorer
  // silencieusement, en simulant un succès pour ne pas informer le bot).
  // -------------------------------------------------------------------
  window.actIsLikelyBot = function (honeypotValue, startedAt) {
    if (honeypotValue && String(honeypotValue).trim() !== '') return true;
    if (startedAt && (Date.now() - startedAt) < 2500) return true;
    return false;
  };

  // Hook React : remonte l'arbre (via changement de clé) quand le contenu
  // DB diffère du statique. Utilisé par app.jsx sur le conteneur racine.
  window.useContentVersion = function () {
    const [v, setV] = React.useState(0);
    React.useEffect(() => {
      const bump = () => setV(x => x + 1);
      window.addEventListener('act-content-updated', bump);
      return () => window.removeEventListener('act-content-updated', bump);
    }, []);
    return v;
  };
})();

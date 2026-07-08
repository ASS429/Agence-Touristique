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

  // Si la base est déjà chargée (course), appliquer maintenant ; sinon
  // attendre l'événement.
  if (window.__ACT_DB_LOADED__) {
    applyDbContent();
  }
  window.addEventListener('act-db-loaded', applyDbContent);

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

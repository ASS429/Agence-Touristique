// =====================================================================
// src/map.jsx — Carte interactive des destinations ACT
//
// Utilise Leaflet + tuiles OpenStreetMap (aucune clé API requise).
// Leaflet est chargé via CDN dans index.html (leaflet.css + leaflet.js).
//
// Le composant DestinationsMap se rend en bloc responsive : le ratio
// change avec la largeur de l'écran. Chaque marker ouvre un popup avec
// le nom localisé + un bouton pour aller vers le catalogue.
// =====================================================================

// Coordonnées géographiques des destinations principales couvertes par
// ACT. Les IDs correspondent à ceux de DESTINATIONS dans data.jsx pour
// permettre le lookup i18n (t(`destination.${id}.name`, fallback)).
const DEST_COORDS = [
  { id:'dakar',       name:'Dakar',            lat:14.6928, lng:-17.4467, kind:'city'    },
  { id:'goree',       name:'Île de Gorée',     lat:14.6666, lng:-17.3986, kind:'heritage'},
  { id:'lac-rose',    name:'Lac Rose',         lat:14.8395, lng:-17.2350, kind:'nature'  },
  { id:'saint-louis', name:'Saint-Louis',      lat:16.0326, lng:-16.4818, kind:'city'    },
  { id:'saloum',      name:'Delta du Saloum',  lat:13.7833, lng:-16.4667, kind:'nature'  },
  { id:'lompoul',     name:'Désert de Lompoul',lat:15.4667, lng:-16.6833, kind:'adventure'},
  { id:'casamance',   name:'Casamance',        lat:12.5833, lng:-16.2667, kind:'nature'  },
  { id:'kedougou',    name:'Kédougou',         lat:12.5556, lng:-12.1747, kind:'adventure'},
];

// Icône SVG personnalisée en couleur terracotta (harmonisée avec le
// design system). Rendue en HTML pour utiliser divIcon() de Leaflet.
const MARKER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
  <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z"
        fill="#C8593B" stroke="#8A3A21" stroke-width="1"/>
  <circle cx="16" cy="16" r="6" fill="#FBF8F3"/>
</svg>
`;

const DestinationsMap = ({ go }) => {
  const { t, richT } = useI18n();
  const containerRef = React.useRef(null);
  const mapRef = React.useRef(null);

  React.useEffect(() => {
    // Attend que Leaflet soit chargé (script chargé via index.html)
    if (typeof window.L === 'undefined') {
      // Retry court : Leaflet est chargé après DOMContentLoaded via defer
      const retry = setInterval(() => {
        if (window.L) { clearInterval(retry); init(); }
      }, 100);
      return () => clearInterval(retry);
    }
    init();

    function init() {
      if (!containerRef.current || mapRef.current) return;
      const L = window.L;

      // Bounding box du Sénégal (centre + zoom qui montre tout le pays
      // avec léger padding pour la Casamance et l'est).
      const map = L.map(containerRef.current, {
        center: [14.3, -14.9],   // centre approx du Sénégal
        zoom: 6,
        minZoom: 5,
        maxZoom: 12,
        scrollWheelZoom: false,   // évite les scrolls accidentels
        zoomControl: true
      });
      mapRef.current = map;

      // Tuiles OSM standard — attribution obligatoire (licence).
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);

      const customIcon = L.divIcon({
        html: MARKER_SVG,
        className: 'act-marker',
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -36]
      });

      // Ajoute les markers
      DEST_COORDS.forEach(d => {
        const dname = t(`destination.${d.id}.name`, d.name);
        const marker = L.marker([d.lat, d.lng], { icon: customIcon }).addTo(map);
        // Popup contenu en HTML brut — géré par Leaflet
        const goLabel = t('map.popup.discover', 'Découvrir');
        marker.bindPopup(
          `<div style="font-family:'Instrument Serif',serif;font-size:20px;line-height:1.1;color:#0E0F10;margin-bottom:6px">${dname}</div>
           <button data-dest="${d.id}" class="act-map-cta" style="font-family:'Manrope',sans-serif;font-size:12px;background:#C8593B;color:#FBF8F3;border:0;padding:6px 14px;border-radius:999px;cursor:pointer">${goLabel} →</button>`
        );
      });

      // Délégation d'event pour les boutons "Découvrir" dans les popups
      map.on('popupopen', (e) => {
        const btn = e.popup.getElement()?.querySelector('.act-map-cta');
        if (btn) {
          btn.addEventListener('click', () => go && go('circuits'));
        }
      });

      // Fit bounds sur tous les markers pour cadrage optimal
      const bounds = L.latLngBounds(DEST_COORDS.map(d => [d.lat, d.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [go]);

  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="mb-8 md:mb-10 max-w-2xl">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-3">
          — {t('map.kicker', 'Où on vous emmène')}
        </div>
        <h2 className="font-display text-[32px] md:text-[44px] leading-tight">
          {richT(t('map.title', 'Toutes nos destinations sur {em}une carte{/em}.'))}
        </h2>
        <p className="mt-3 text-ink-600">
          {t('map.intro', 'Du bord de mer aux paysages du sud, chaque destination a été choisie pour ce qu\'elle raconte.')}
        </p>
      </div>
      <div
        ref={containerRef}
        role="application"
        aria-label={t('map.aria', 'Carte interactive des destinations Africa Connection Tours')}
        className="w-full h-[420px] md:h-[520px] rounded-3xl overflow-hidden border border-ink/10 shadow-xl shadow-ink/5 z-0"
      />
      <div className="mt-4 text-[11.5px] text-ink-500 font-mono">
        {t('map.legend', 'Cliquez sur un marqueur pour découvrir les circuits associés.')}
      </div>
    </section>
  );
};

// Export global (pas de modules ES)
window.DestinationsMap = DestinationsMap;
window.DEST_COORDS = DEST_COORDS;

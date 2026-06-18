// Editorial duotone "photo" placeholders.
// Each placeholder is a stylised gradient with optional silhouette shapes
// and a small monospace label that says what should be slotted in.
// The intent is to look intentional (like a moodboard tile) rather than broken.

const PALETTES = {
  // Warm sunset terre — for hero, Saint-Louis, Lac Rose
  terre:   ['#E89A6A', '#C8593B', '#7A2C19'],
  // Ocre desert — for Lompoul
  ocre:    ['#F2C77C', '#D89A3D', '#7A4F1A'],
  // Pink Lac Rose
  rose:    ['#F2BFB5', '#D87E8E', '#7A3548'],
  // Atlantic teal — for Saloum, Gorée from sea
  atlant:  ['#7BAAA5', '#1F5E5A', '#0C2C2A'],
  // City dusk — Dakar
  dusk:    ['#E5B89A', '#8A5C7A', '#231A2B'],
  // Forest green — Casamance, Kédougou
  forest:  ['#A6B889', '#3F6244', '#0F2419'],
  // Cream/sand neutral
  sand:    ['#F5ECDD', '#D8BE94', '#8C7A60'],
  // Deep night
  night:   ['#7C7159', '#3A332A', '#0F0C09'],
  // Sea + sky
  sea:     ['#CFE2D9', '#5C9A93', '#1F5E5A'],
};

// A small set of vector "moods" overlaid on the gradient — abstract horizon
// shapes, never representational. Keeps placeholders feeling like real photos
// from a distance without us forging fake content.
const Mood = ({ kind, palette }) => {
  const [a, b, c] = palette;
  if (kind === 'horizon') {
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id={`g-${a}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={a}/>
            <stop offset="60%" stopColor={b}/>
            <stop offset="100%" stopColor={c}/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#g-${a})`} />
        <ellipse cx="50" cy="62" rx="36" ry="6" fill="rgba(0,0,0,0.12)"/>
        <path d="M0 70 Q 30 64 50 68 T 100 66 L 100 100 L 0 100 Z" fill="rgba(0,0,0,0.25)"/>
      </svg>
    );
  }
  if (kind === 'dunes') {
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id={`g2-${a}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={a}/><stop offset="100%" stopColor={b}/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#g2-${a})`} />
        <path d="M0 75 Q 25 55 50 70 T 100 65 L 100 100 L 0 100 Z" fill={b} opacity=".9"/>
        <path d="M0 88 Q 35 78 60 88 T 100 85 L 100 100 L 0 100 Z" fill={c} opacity=".75"/>
      </svg>
    );
  }
  if (kind === 'city') {
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id={`g3-${a}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={a}/><stop offset="100%" stopColor={b}/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#g3-${a})`} />
        <g fill={c} opacity=".65">
          <rect x="6" y="55" width="9" height="45"/>
          <rect x="17" y="65" width="6" height="35"/>
          <rect x="25" y="50" width="12" height="50"/>
          <rect x="39" y="62" width="7" height="38"/>
          <rect x="48" y="56" width="10" height="44"/>
          <rect x="60" y="68" width="6" height="32"/>
          <rect x="68" y="60" width="11" height="40"/>
          <rect x="81" y="66" width="7" height="34"/>
          <rect x="90" y="72" width="5" height="28"/>
        </g>
      </svg>
    );
  }
  if (kind === 'water') {
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id={`g4-${a}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={a}/><stop offset="100%" stopColor={c}/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#g4-${a})`} />
        <g stroke={b} strokeWidth=".4" fill="none" opacity=".55">
          <path d="M0 40 Q 25 36 50 40 T 100 38"/>
          <path d="M0 50 Q 25 46 50 50 T 100 48"/>
          <path d="M0 60 Q 25 56 50 60 T 100 58"/>
          <path d="M0 70 Q 25 66 50 70 T 100 68"/>
        </g>
      </svg>
    );
  }
  if (kind === 'leaves') {
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id={`g5-${a}`} cx="40%" cy="40%" r="80%">
            <stop offset="0%" stopColor={a}/><stop offset="100%" stopColor={c}/>
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#g5-${a})`}/>
        <g fill={b} opacity=".55">
          <ellipse cx="20" cy="22" rx="14" ry="9" transform="rotate(-25 20 22)"/>
          <ellipse cx="78" cy="18" rx="16" ry="8" transform="rotate(20 78 18)"/>
          <ellipse cx="86" cy="78" rx="14" ry="9" transform="rotate(40 86 78)"/>
          <ellipse cx="14" cy="80" rx="12" ry="7" transform="rotate(-30 14 80)"/>
        </g>
      </svg>
    );
  }
  if (kind === 'portrait') {
    // Soft vignette + abstract figure silhouette to suggest a person
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id={`g6-${a}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={a}/><stop offset="100%" stopColor={c}/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#g6-${a})`}/>
        <ellipse cx="50" cy="42" rx="11" ry="13" fill={b} opacity=".55"/>
        <path d="M28 100 Q 38 70 50 70 T 72 100 Z" fill={b} opacity=".6"/>
      </svg>
    );
  }
  // default: simple vertical gradient
  return (
    <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${a} 0%, ${b} 55%, ${c} 100%)` }} />
  );
};

// label: short caption shown as mono tag (visible only when showLabel)
// tone: key into PALETTES (used as fallback background under real photos too)
// mood: 'horizon' | 'dunes' | 'city' | 'water' | 'leaves' | 'portrait'
// src:  optional real image URL; when provided, renders an <img> over the gradient.
//       If the image fails to load, we fall back to the placeholder silently.
const Photo = ({
  tone = 'terre',
  mood = 'horizon',
  label,
  className = '',
  rounded = 'rounded-2xl',
  showLabel = true,
  overlay = false, // dark overlay for text-on-photo
  children,
  ratio,           // e.g. 'aspect-[4/5]'
  src,             // real image URL (optional)
  alt = '',
  priority = false, // true for above-the-fold images (hero) — eager loading + high fetch priority for LCP
}) => {
  const pal = PALETTES[tone] || PALETTES.terre;
  const [imgFailed, setImgFailed] = React.useState(false);
  const hasRealImage = src && !imgFailed;
  return (
    <div className={`relative overflow-hidden ${rounded} ${ratio || ''} ${className} grain photo-card`}>
      <Mood kind={mood} palette={pal} />
      {hasRealImage && (
        <picture>
          {/* Source WebP. IMPORTANT : encodeURI() est obligatoire pour échapper
              les espaces dans les noms de dossiers (Delta du Saloum, Désert de
              Lompoul, Ile de gorée). Sans ça, srcset les interprète comme
              séparateur URL/descripteur et tombe sur le JPG (perte du gain
              WebP). Le <img src> est automatiquement encodé par le navigateur. */}
          <source srcSet={encodeURI(src.replace(/\.jpe?g$/i, '.webp'))} type="image/webp"/>
          <img
            src={src}
            alt={alt || label || ''}
            // `priority` réservée au hero / above-the-fold pour ne pas dégrader
            // le LCP. Par défaut, lazy+async = pas de blocage du first paint.
            // Attribut en lowercase (`fetchpriority`) pour compatibilité avec
            // les versions de React qui ne reconnaissent pas la camelCase.
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            {...(priority ? { fetchpriority: 'high' } : {})}
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </picture>
      )}
      {overlay && (
        <div className="absolute inset-0" style={{ background:'linear-gradient(180deg, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.55) 100%)' }} />
      )}
      {showLabel && label && !hasRealImage && (
        <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-[10px] uppercase tracking-[0.14em] font-mono text-sand-100">
          ◌ {label}
        </div>
      )}
      <div className="absolute inset-0">{children}</div>
    </div>
  );
};

Object.assign(window, { Photo, PALETTES });

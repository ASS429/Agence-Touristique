// =============================================================================
// Public site Tweaks — 25 levers
// =============================================================================
//
// Strategy: write CSS vars onto :root + data-attributes onto <body>, and rely
// on a giant <style id="tweak-overrides"> block in index.html that targets the
// existing Tailwind classes (.bg-terre, .text-ink, .font-display, …) with
// !important. Color "options" are palette arrays so each accent picks 5
// coherent shades, not a single hex.

// --- presets ----------------------------------------------------------------
// Each accent palette: [light(100), tinted(300), main(default), hover(600), dark(700)]
const ACCENT_PALETTES = {
  terracotta: ['#F4DACA', '#E6987F', '#C8593B', '#A8462C', '#8B3A24'],  // current
  indigo:     ['#E0E7FF', '#A5B4FC', '#4F46E5', '#3730A3', '#312E81'],
  forest:     ['#D1FAE5', '#86EFAC', '#166534', '#14532D', '#052E16'],
  ocean:      ['#BAE6FD', '#7DD3FC', '#0369A1', '#075985', '#0C4A6E'],
  plum:       ['#F5D0FE', '#E879F9', '#86198F', '#701A75', '#4A044E'],
  charcoal:   ['#D6D3D1', '#A8A29E', '#292524', '#1C1917', '#0C0A09'],
  sunset:     ['#FED7AA', '#FDBA74', '#EA580C', '#C2410C', '#9A3412'],
  emerald:    ['#A7F3D0', '#6EE7B7', '#059669', '#047857', '#064E3B'],
};

// Background/foreground pair: [bg, surface, ink, ink-soft, ink-mute, ink-faint, border]
const TONE_PALETTES = {
  sand:       ['#FBF7F0', '#F5ECDD', '#1A1612', '#26211B', '#5A5142', '#7C7159', '#ECDDC4'],  // current
  cream:      ['#FFFCF5', '#F5EDE0', '#1F1611', '#2A201A', '#5A4E40', '#7A6E5C', '#EADBC8'],
  warmWhite:  ['#FAFAF9', '#F5F5F4', '#1C1917', '#292524', '#57534E', '#78716C', '#E7E5E4'],
  pureWhite:  ['#FFFFFF', '#F8F8F8', '#0A0A0A', '#171717', '#525252', '#737373', '#E5E5E5'],
  sepia:      ['#F5E8D3', '#E8D5B7', '#2C1810', '#3D2818', '#5B3D24', '#7A5333', '#D4B98E'],
  mint:       ['#F0FAF6', '#DCF4E8', '#0A1F18', '#143028', '#3E5750', '#62807A', '#B6DACA'],
  graphite:   ['#1A1816', '#26221E', '#FAF8F3', '#E8E3DA', '#A8A095', '#807870', '#3D362F'],
  night:      ['#0F0C09', '#1A1612', '#FBF7F0', '#ECDDC4', '#A8A29E', '#807870', '#3A332A'],
  midnight:   ['#0A0E1A', '#141B2D', '#F0F4FA', '#DCE3F0', '#9CA8C0', '#6E7896', '#252E45'],
};

const FONT_DISPLAY_OPTS = [
  { value: 'Instrument Serif',   label: 'Instrument' },   // current
  { value: 'Fraunces',           label: 'Fraunces' },
  { value: 'DM Serif Display',   label: 'DM Serif' },
  { value: 'Playfair Display',   label: 'Playfair' },
  { value: 'Bricolage Grotesque',label: 'Bricolage' },
  { value: 'Anton',              label: 'Anton' },
  { value: 'Bodoni Moda',        label: 'Bodoni' },
  { value: 'Tenor Sans',         label: 'Tenor' },
];

const FONT_BODY_OPTS = [
  { value: 'Manrope',            label: 'Manrope' },      // current
  { value: 'Inter',              label: 'Inter' },
  { value: 'DM Sans',            label: 'DM Sans' },
  { value: 'Plus Jakarta Sans',  label: 'Jakarta' },
  { value: 'IBM Plex Sans',      label: 'Plex' },
  { value: 'Geist',              label: 'Geist' },
  { value: 'Outfit',             label: 'Outfit' },
  { value: 'Work Sans',          label: 'Work' },
];

const FONT_MONO_OPTS = [
  { value: 'JetBrains Mono',  label: 'JetBrains' },     // current
  { value: 'IBM Plex Mono',   label: 'IBM Plex' },
  { value: 'Space Mono',      label: 'Space' },
  { value: 'Fira Code',       label: 'Fira' },
];

// Dynamic Google Fonts loader (one per family)
const loadedFonts = new Set();
const loadFont = (family) => {
  if (!family || loadedFonts.has(family)) return;
  loadedFonts.add(family);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap`;
  document.head.appendChild(link);
};

// =============================================================================
// Tweaks UI + effect
// =============================================================================
const SiteTweaks = () => {
  const [t, set] = useTweaks(TWEAK_DEFAULTS);

  // Load any selected non-default fonts on demand
  React.useEffect(() => { loadFont(t.displayFont); }, [t.displayFont]);
  React.useEffect(() => { loadFont(t.bodyFont);    }, [t.bodyFont]);
  React.useEffect(() => { loadFont(t.monoFont);    }, [t.monoFont]);

  // Apply tweaks via CSS variables and body data-attrs
  React.useEffect(() => {
    const r = document.documentElement;
    const accent = ACCENT_PALETTES[t.accent] || ACCENT_PALETTES.terracotta;
    const accent2 = ACCENT_PALETTES[t.accent2] || ACCENT_PALETTES.ocean;
    const tone = TONE_PALETTES[t.tone] || TONE_PALETTES.sand;

    r.style.setProperty('--tw-accent-100', accent[0]);
    r.style.setProperty('--tw-accent-300', accent[1]);
    r.style.setProperty('--tw-accent',     accent[2]);
    r.style.setProperty('--tw-accent-600', accent[3]);
    r.style.setProperty('--tw-accent-700', accent[4]);

    r.style.setProperty('--tw-accent2-100', accent2[0]);
    r.style.setProperty('--tw-accent2-300', accent2[1]);
    r.style.setProperty('--tw-accent2',     accent2[2]);
    r.style.setProperty('--tw-accent2-700', accent2[4]);

    r.style.setProperty('--tw-bg',     tone[0]);
    r.style.setProperty('--tw-surface',tone[1]);
    r.style.setProperty('--tw-ink',    tone[2]);
    r.style.setProperty('--tw-ink-soft', tone[3]);
    r.style.setProperty('--tw-ink-mute', tone[4]);
    r.style.setProperty('--tw-ink-faint',tone[5]);
    r.style.setProperty('--tw-border',  tone[6]);

    r.style.setProperty('--tw-font-display', `"${t.displayFont}"`);
    r.style.setProperty('--tw-font-body',    `"${t.bodyFont}"`);
    r.style.setProperty('--tw-font-mono',    `"${t.monoFont}"`);

    r.style.setProperty('--tw-display-scale', t.displayScale);
    r.style.setProperty('--tw-radius-mult',   t.radius);
    r.style.setProperty('--tw-section-pad',   t.sectionPad);
    r.style.setProperty('--tw-hero-h',        t.heroHeight + 'svh');
    r.style.setProperty('--tw-container',     t.container + 'px');
    r.style.setProperty('--tw-grain',         t.grain / 100);
    r.style.setProperty('--tw-overlay',       t.overlay / 100);
    r.style.setProperty('--tw-card-shadow',   ({
      flat:    '0 0 0 1px var(--tw-border)',
      subtle:  '0 1px 0 rgba(0,0,0,.04), 0 8px 24px -16px rgba(0,0,0,.18)',
      raised:  '0 1px 0 rgba(0,0,0,.05), 0 24px 60px -20px rgba(0,0,0,.35)',
    })[t.cardStyle] || '');

    const body = document.body;
    body.dataset.tone        = t.tone;
    body.dataset.buttonShape = t.buttonShape;
    body.dataset.italic      = t.italic;
    body.dataset.density     = t.density;
    body.dataset.uppercase   = t.uppercase ? '1' : '0';
    body.dataset.hideWhatsapp= t.showWhatsapp ? '0' : '1';
    body.dataset.hideInsta   = t.showInsta    ? '0' : '1';
    body.dataset.hideGrain   = t.showGrain    ? '0' : '1';
    body.dataset.boldDisplay = t.boldDisplay  ? '1' : '0';
    body.dataset.scrollAnim  = t.scrollAnim ? '1' : '0';
  }, [t]);

  return (
    <TweaksPanel title="Téranga · Tweaks">
      <TweakSection label="Palette"/>
      <ChipPalette label="Accent principal" value={t.accent} keys={Object.keys(ACCENT_PALETTES)}
        toChip={(k)=>[ACCENT_PALETTES[k][2], ACCENT_PALETTES[k][4], ACCENT_PALETTES[k][0]]}
        onChange={(k)=>set('accent', k)}/>
      <ChipPalette label="Accent secondaire" value={t.accent2} keys={Object.keys(ACCENT_PALETTES)}
        toChip={(k)=>[ACCENT_PALETTES[k][2], ACCENT_PALETTES[k][4], ACCENT_PALETTES[k][0]]}
        onChange={(k)=>set('accent2', k)}/>
      <ChipPalette label="Fond & encre" value={t.tone} keys={Object.keys(TONE_PALETTES)}
        toChip={(k)=>[TONE_PALETTES[k][0], TONE_PALETTES[k][2], TONE_PALETTES[k][6]]}
        onChange={(k)=>set('tone', k)}/>

      <TweakSection label="Typographie"/>
      <TweakSelect label="Display" value={t.displayFont} options={FONT_DISPLAY_OPTS} onChange={(v)=>set('displayFont', v)}/>
      <TweakSelect label="Body"    value={t.bodyFont}    options={FONT_BODY_OPTS}    onChange={(v)=>set('bodyFont', v)}/>
      <TweakSelect label="Mono"    value={t.monoFont}    options={FONT_MONO_OPTS}    onChange={(v)=>set('monoFont', v)}/>
      <TweakSlider label="Taille display" value={t.displayScale} min={0.7} max={1.4} step={0.05} unit="×" onChange={(v)=>set('displayScale', v)}/>
      <TweakRadio label="Italique <em>" value={t.italic} options={['oui','non']} onChange={(v)=>set('italic', v)}/>
      <TweakToggle label="Display en gras" value={t.boldDisplay} onChange={(v)=>set('boldDisplay', v)}/>
      <TweakToggle label="Kickers majuscules" value={t.uppercase} onChange={(v)=>set('uppercase', v)}/>

      <TweakSection label="Mise en page"/>
      <TweakSlider label="Largeur container" value={t.container} min={960} max={1600} step={20} unit="px" onChange={(v)=>set('container', v)}/>
      <TweakSlider label="Hauteur hero"      value={t.heroHeight} min={60} max={120} step={2} unit="vh" onChange={(v)=>set('heroHeight', v)}/>
      <TweakSlider label="Padding sections"  value={t.sectionPad} min={0.6} max={1.6} step={0.05} unit="×" onChange={(v)=>set('sectionPad', v)}/>
      <TweakSlider label="Rayon des coins"   value={t.radius}     min={0}   max={2}   step={0.1}  unit="×" onChange={(v)=>set('radius', v)}/>
      <TweakRadio  label="Forme boutons"     value={t.buttonShape} options={['pill','rond','carré']} onChange={(v)=>set('buttonShape', v)}/>
      <TweakRadio  label="Densité"           value={t.density}     options={['aéré','normal','dense']} onChange={(v)=>set('density', v)}/>

      <TweakSection label="Composants"/>
      <TweakRadio label="Style des cards" value={t.cardStyle} options={['flat','subtle','raised']} onChange={(v)=>set('cardStyle', v)}/>
      <TweakSlider label="Grain photos"   value={t.grain}   min={0} max={100} step={5} unit="%" onChange={(v)=>set('grain', v)}/>
      <TweakSlider label="Overlay photos" value={t.overlay} min={0} max={100} step={5} unit="%" onChange={(v)=>set('overlay', v)}/>

      <TweakSection label="Affichage"/>
      <TweakToggle label="Bouton WhatsApp"     value={t.showWhatsapp} onChange={(v)=>set('showWhatsapp', v)}/>
      <TweakToggle label="Strip Instagram"     value={t.showInsta}    onChange={(v)=>set('showInsta', v)}/>
      <TweakToggle label="Grain global"        value={t.showGrain}    onChange={(v)=>set('showGrain', v)}/>
      <TweakToggle label="Animations subtiles" value={t.scrollAnim}   onChange={(v)=>set('scrollAnim', v)}/>

      <TweakButton label="Réinitialiser" secondary onClick={()=>set(TWEAK_DEFAULTS)}/>
    </TweaksPanel>
  );
};

// Custom palette chip picker — wraps TweakColor so the *value* stays a
// readable key (e.g. "terracotta") instead of an array of hexes, while the
// chips still render as palette swatches.
const ChipPalette = ({ label, value, keys, toChip, onChange }) => {
  const options = keys.map(toChip);
  const currentArr = toChip(value);
  return (
    <TweakColor label={label} value={currentArr} options={options}
      onChange={(arr)=>{
        // Match by hero hex (index 0) back to its key
        const k = keys.find(k => toChip(k)[0] === arr[0]);
        if (k) onChange(k);
      }}/>
  );
};

Object.assign(window, { SiteTweaks, ChipPalette });

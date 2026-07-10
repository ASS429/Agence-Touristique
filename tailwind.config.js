/** Tailwind — tokens FUSIONNÉS du site public et de l'admin.
 *  On conserve les DEUX nomenclatures (terre/atlantique/ocre côté public,
 *  terra/ocean/bone/mute côté admin) pour ne pas réécrire toutes les classes
 *  existantes pendant la migration. À rationaliser plus tard si souhaité.
 */
export default {
  content: [
    './index.html',
    './admin/index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- Public ---
        sand:    { 50:'#FBF7F0', 75:'#FCFAF5', 100:'#F5ECDD', 200:'#ECDDC4', 300:'#DCC9A8', 400:'#B8A284', 500:'#8C7A60' },
        ink:     { DEFAULT:'#1A1612', 950:'#1A1613', 900:'#1A1612', 800:'#26211B', 700:'#3A332A', 600:'#5A5142', 500:'#7C7159', 400:'#A39884' },
        terre:   { DEFAULT:'#C8593B', 100:'#F4DACA', 300:'#E6987F', 600:'#A8462C', 700:'#8B3A24' },
        atlantique:{ DEFAULT:'#1F5E5A', 100:'#D5E5E2', 300:'#7BAAA5', 700:'#16443F' },
        ocre:    { DEFAULT:'#D89A3D', 100:'#F6E6C4', 300:'#EAC380' },
        // --- Admin ---
        bone:    { 100:'#F3ECDD', 200:'#EFE7D6', 300:'#EBE1CE', 400:'#E7DCC8', 500:'#E4D9C4', 600:'#D9C9A7' },
        terra:   { 300:'#E8A07F', 400:'#DC7A5A', 500:'#D46B4C', 600:'#C8593B', 700:'#A64729', 800:'#8A3A21' },
        mute:    { 300:'#C0B39A', 400:'#B0A28A', 500:'#9C8F79', 600:'#7A6F60', 700:'#5F5647' },
        ocean:   { 500:'#4E92AA', 600:'#2F6B7F', 700:'#255868' },
        success: { 100:'#E7F1EB', 600:'#2E7D5B', 700:'#256B4C' },
        warn:    { 100:'#FBF0D9', 600:'#B8801F' },
        danger:  { 100:'#FBEDE9', 600:'#C0392B' },
        info:    { 100:'#E6EEF1', 600:'#2F6B7F' },
        brand:   { 100:'#FBEDE7' },
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans:    ['Manrope', 'system-ui', 'sans-serif'],
        body:    ['Manrope', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

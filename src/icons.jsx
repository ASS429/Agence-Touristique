// Minimal Lucide-style icons inlined as SVG components.
// Stroke 1.5 to feel editorial rather than utility.

const Ic = ({ children, size = 20, className = '', strokeWidth = 1.6 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
       className={className} aria-hidden="true">{children}</svg>
);

const Icons = {
  Menu: (p) => <Ic {...p}><path d="M4 7h16M4 12h16M4 17h16"/></Ic>,
  Close: (p) => <Ic {...p}><path d="M6 6l12 12M18 6L6 18"/></Ic>,
  Search: (p) => <Ic {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Ic>,
  ArrowRight: (p) => <Ic {...p}><path d="M5 12h14M13 5l7 7-7 7"/></Ic>,
  ArrowLeft: (p) => <Ic {...p}><path d="M19 12H5M11 5l-7 7 7 7"/></Ic>,
  ArrowUpRight: (p) => <Ic {...p}><path d="M7 17 17 7M9 7h8v8"/></Ic>,
  Play: (p) => <Ic {...p}><path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/></Ic>,
  ChevronRight: (p) => <Ic {...p}><path d="m9 6 6 6-6 6"/></Ic>,
  ChevronDown: (p) => <Ic {...p}><path d="m6 9 6 6 6-6"/></Ic>,
  Plus: (p) => <Ic {...p}><path d="M12 5v14M5 12h14"/></Ic>,
  Check: (p) => <Ic {...p}><path d="m5 12 5 5 9-12"/></Ic>,
  X: (p) => <Ic {...p}><path d="M6 6l12 12M18 6L6 18"/></Ic>,
  Star: (p) => <Ic {...p}><path d="m12 3 2.7 6 6.3.5-4.8 4.2 1.5 6.3L12 16.8 6.3 20l1.5-6.3L3 9.5l6.3-.5z" fill="currentColor"/></Ic>,
  StarHalf: (p) => <Ic {...p}><path d="m12 3 2.7 6 6.3.5-4.8 4.2 1.5 6.3L12 16.8 6.3 20l1.5-6.3L3 9.5l6.3-.5z"/><path d="M12 3v13.8L6.3 20l1.5-6.3L3 9.5l6.3-.5z" fill="currentColor" stroke="none"/></Ic>,
  MapPin: (p) => <Ic {...p}><path d="M12 22s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z"/><circle cx="12" cy="10" r="2.5"/></Ic>,
  Compass: (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="m15 9-2 6-6 2 2-6z"/></Ic>,
  Clock: (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Ic>,
  Calendar: (p) => <Ic {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></Ic>,
  Users: (p) => <Ic {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="7" r="2.5"/><path d="M22 19c0-2.5-2-4.5-5-4.5"/></Ic>,
  Shield: (p) => <Ic {...p}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></Ic>,
  Heart: (p) => <Ic {...p}><path d="M20 8.5c0 5-8 11-8 11S4 13.5 4 8.5a4.5 4.5 0 0 1 8-2.9 4.5 4.5 0 0 1 8 2.9z"/></Ic>,
  Phone: (p) => <Ic {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.1-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"/></Ic>,
  Mail: (p) => <Ic {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Ic>,
  Globe: (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></Ic>,
  Whatsapp: (p) => <Ic {...p} strokeWidth={0}><path fill="currentColor" d="M19.05 4.91A10 10 0 0 0 4.07 18.3L3 22l3.8-1a10 10 0 0 0 14.9-8.7 10 10 0 0 0-2.65-7.4Zm-7 15.27a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-2.25.6.6-2.2-.2-.31a8.3 8.3 0 1 1 6.38 3.25Zm4.55-6.2c-.25-.13-1.47-.73-1.7-.81-.22-.09-.39-.13-.55.12-.16.25-.63.81-.77.97-.14.17-.28.18-.53.06a6.83 6.83 0 0 1-2-1.24 7.55 7.55 0 0 1-1.39-1.73c-.14-.25 0-.39.11-.51.11-.12.25-.3.37-.45.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.55-1.34-.76-1.83-.2-.48-.4-.41-.55-.42h-.47a.92.92 0 0 0-.66.31 2.78 2.78 0 0 0-.87 2.07c0 1.22.89 2.4 1.02 2.57.12.17 1.75 2.67 4.24 3.74a14.21 14.21 0 0 0 1.42.52 3.42 3.42 0 0 0 1.56.1c.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.08.15-1.18-.06-.1-.22-.16-.47-.28Z"/></Ic>,
  Instagram: (p) => <Ic {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></Ic>,
  Facebook: (p) => <Ic {...p}><path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H6v3h3v9h3v-9h3l1-3h-4V7a1 1 0 0 1 1-1h2z"/></Ic>,
  Tiktok: (p) => <Ic {...p}><path d="M15 3v9.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M15 3a5 5 0 0 0 5 5"/></Ic>,
  XSocial: (p) => <Ic {...p}><path d="M4 4l16 16"/><path d="M20 4l-6.8 7.8"/><path d="M10.8 12.2 4 20"/></Ic>,
  Linkedin: (p) => <Ic {...p}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 11v6M7 7v.01M11.5 17v-3.5a2.25 2.25 0 0 1 4.5 0V17"/></Ic>,
  Youtube: (p) => <Ic {...p}><path d="M2.7 17a24.3 24.3 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.7 49.7 0 0 1 15.8 0A2 2 0 0 1 21.3 7a24.3 24.3 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.7 49.7 0 0 1-15.8 0A2 2 0 0 1 2.7 17"/><path d="m10 15 5-3-5-3z"/></Ic>,
  Sparkle: (p) => <Ic {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></Ic>,
  CreditCard: (p) => <Ic {...p}><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 11h20M6 16h3"/></Ic>,
  Leaf: (p) => <Ic {...p}><path d="M4 20c0-9 7-16 16-16 0 9-7 16-16 16Z"/><path d="M4 20c4-4 8-7 12-9"/></Ic>,
  Wave: (p) => <Ic {...p}><path d="M3 12c2.5-3 4.5-3 7 0s4.5 3 7 0 4.5-3 4-1"/><path d="M3 17c2.5-3 4.5-3 7 0s4.5 3 7 0 4.5-3 4-1"/></Ic>,
  Camera: (p) => <Ic {...p}><path d="M3 7h3l2-3h8l2 3h3a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/></Ic>,
  Quote: (p) => <Ic {...p}><path d="M7 7H4v5h3v-1c0-1 0-2-1-2"/><path d="M16 7h-3v5h3v-1c0-1 0-2-1-2"/></Ic>,
  Eye: (p) => <Ic {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></Ic>,
  Wallet: (p) => <Ic {...p}><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/></Ic>,
  RefreshCw: (p) => <Ic {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></Ic>,
  Languages: (p) => <Ic {...p}><path d="M3 5h7M6.5 5v3M4 11s1.5-3 2.5-3 2.5 3 2.5 3M3.5 9H9"/><path d="M14 19l3-8 3 8M15 16h4"/></Ic>,
};

// Interop pendant la migration Vite : window.Icons conservé tant que tous
// les consommateurs ne sont pas convertis en imports ES.
if (typeof window !== 'undefined') Object.assign(window, { Icons });
export { Icons };

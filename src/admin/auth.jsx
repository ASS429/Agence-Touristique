import React, { useState } from 'react';
import { Icon } from './icons.jsx';
import { Btn, Field, Input } from './ui.jsx';

// =====================================================================
// src/admin/auth.jsx — Page de connexion admin
// Design handoff : split-screen bandeau photo Sénégal + form à droite
// =====================================================================

function LoginScreen({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Échappatoire : purge la session locale corrompue (cause du « Connexion
  // trop lente » et du besoin d'ouvrir une fenêtre privée), puis recharge.
  // Rechargement forcé à 3 s quoi qu'il arrive : le bouton ne peut jamais
  // rester bloqué en « Réinitialisation… ».
  const resetSession = async () => {
    setResetting(true);
    const force = setTimeout(() => window.location.reload(), 3000);
    try { await window.sbResetAuthStorage?.(); } catch { /* best-effort */ }
    clearTimeout(force);
    window.location.reload();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!window.SUPABASE_CONFIGURED) {
      setError("Supabase n'est pas encore configuré. Renseigner SUPABASE_URL et SUPABASE_ANON_KEY dans src/admin/supabase.jsx (voir supabase/README.md).");
      return;
    }
    setError(null);
    setLoading(true);
    // Garde-fou : la connexion ne doit jamais faire tourner le bouton
    // indéfiniment. Si un appel réseau/verrou traîne au-delà de 15 s, on
    // remonte une erreur claire plutôt que de rester bloqué.
    const withTimeout = (p, ms) => Promise.race([
      p,
      new Promise((_, rej) => setTimeout(() => rej(new Error('Connexion trop lente — vérifiez votre réseau et réessayez.')), ms)),
    ]);
    try {
      const user = await withTimeout(window.sbSignIn(email.trim(), password), 15000);
      // Défense en profondeur : vérifier l'appartenance à admin_users.
      // Un compte non-admin (ex. client espace-client) est déconnecté
      // immédiatement plutôt que de voir une interface d'admin cassée.
      const isAdmin = await withTimeout(window.sbIsAdmin(), 15000);
      if (!isAdmin) {
        await window.sbSignOut();
        setError("Ce compte n'a pas les droits d'administration.");
        return;
      }
      onSuccess(user);
    } catch (e) {
      setError(e.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-[1.15fr,1fr]" style={{ animation: 'act-fade .3s ease' }}>
      {/* Bandeau photo/téranga à gauche */}
      <div className="relative overflow-hidden bg-ink-950 hidden lg:block">
        {/* Motif zebra terre cuite */}
        <div
          className="absolute inset-0"
          style={{ background: 'repeating-linear-gradient(115deg,#241d17 0px,#241d17 2px,#1d1712 2px,#1d1712 13px)' }}
        />
        {/* Aura terracotta */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(120% 80% at 20% 20%, rgba(212,107,76,.28), transparent 60%)' }}
        />
        {/* Label caption haut */}
        <div className="absolute left-11 top-10 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-sand-200/50">
          Photo — Téranga, Saint-Louis · 16:9
        </div>
        {/* Slogan bas */}
        <div className="absolute left-11 bottom-11 max-w-[440px]">
          <div className="font-display text-[46px] leading-[1.05] text-sand-50">
            Vingt-huit ans à révéler le <span className="italic text-terra-300">Sénégal</span> autrement.
          </div>
          <div className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-sand-200/55">
            Africa Connection Tours · Dakar · depuis 1996
          </div>
        </div>
      </div>

      {/* Colonne form */}
      <div className="flex items-center justify-center p-8 md:p-10 bg-sand-50">
        <div className="w-full max-w-[380px]">
          {/* Logo dans une carte */}
          <div className="inline-flex bg-white border border-bone-200 rounded-2xl px-4 py-3 shadow-lg shadow-ink-800/10">
            <img src="../assets/logo-act.png" alt="Africa Connection Tours" style={{ height: 40, width: 'auto', display: 'block' }}/>
          </div>

          <div className="mt-8 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-mute-400">
            Espace administration
          </div>
          <h1 className="mt-2.5 font-display text-[38px] leading-[1.08] text-ink-800">
            Bienvenue dans votre <span className="italic text-terra-600">back-office</span>
          </h1>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <Field label="Adresse e-mail" required>
              <Input
                type="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@act-senegal.com"
              />
            </Field>

            <Field label="Mot de passe" required>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Masquer' : 'Afficher'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-mute-500 hover:text-ink-800 hover:bg-sand-100 transition"
                >
                  <Icon name={showPass ? 'eyeOff' : 'eye'} size={16}/>
                </button>
              </div>
            </Field>

            {error && (
              <div className="rounded-2xl bg-danger-100 border border-danger-600/25 text-danger-600 text-[13px] p-3.5">
                {error}
              </div>
            )}

            <Btn type="submit" loading={loading} className="w-full mt-1.5" size="lg">
              Se connecter
            </Btn>
          </form>

          <div className="mt-6 text-center text-[12px] text-mute-400">
            Accès réservé aux administrateurs autorisés.
          </div>

          {/* Escape hatch : connexion lente / bloquée → réinitialiser la session */}
          <div className="mt-5 rounded-2xl bg-sand-100 border border-bone-300 p-3.5 text-center">
            <div className="text-[12px] text-mute-600">Connexion lente ou bloquée ?</div>
            <button
              type="button"
              onClick={resetSession}
              disabled={resetting}
              className="mt-1.5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-terra-700 hover:text-terra-600 disabled:opacity-60 transition"
            >
              {resetting
                ? <><span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full act-spin"/> Réinitialisation…</>
                : <><Icon name="refresh" size={13}/> Réinitialiser la session et réessayer</>}
            </button>
            <div className="mt-1 text-[11px] text-mute-400">Efface la session locale — plus besoin d'ouvrir une fenêtre privée.</div>
          </div>

          <div className="mt-4 text-center">
            <a href="../" className="text-[12px] text-mute-500 hover:text-terra-600 transition">
              ← Retour au site public
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;

export { LoginScreen };

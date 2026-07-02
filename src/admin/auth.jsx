// =====================================================================
// src/admin/auth.jsx — page de connexion admin
// =====================================================================

function LoginScreen({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPass, setShowPass] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!window.SUPABASE_CONFIGURED) {
      setError("Supabase n'est pas encore configuré. Renseigner SUPABASE_URL et SUPABASE_ANON_KEY dans src/admin/supabase.jsx (voir supabase/README.md).");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const user = await window.sbSignIn(email.trim(), password);
      onSuccess(user);
    } catch (e) {
      setError(e.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="../assets/logo-act.png" alt="ACT" className="w-16 h-16 mx-auto mb-4 rounded-full shadow"/>
          <h1 className="font-display text-4xl text-ink-900">Administration</h1>
          <p className="text-ink-800/60 mt-2 text-sm">Africa Connection Tours</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
          <Field label="Adresse email" required>
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
                placeholder="••••••••"
                className="pr-20"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-ink-800/60 hover:text-ink-900 px-2 py-1"
              >
                {showPass ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </Field>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm p-3">
              {error}
            </div>
          )}

          <Btn type="submit" loading={loading} className="w-full" size="lg">
            Se connecter
          </Btn>

          <div className="text-center pt-2">
            <a href="../" className="text-xs text-ink-800/60 hover:text-terra-600">
              ← Retour au site public
            </a>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-ink-800/40">
          Accès réservé aux administrateurs autorisés.
        </p>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;

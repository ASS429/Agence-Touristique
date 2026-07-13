import React from 'react';
import { useI18n } from './i18n.jsx';
import { Icons } from './icons.jsx';
import { Footer } from './shared.jsx';
// =====================================================================
// src/monespace.jsx — Espace client sécurisé (magic link)
//
// Le client se connecte via un lien magique reçu par email
// (Supabase Auth signInWithOtp). Une fois connecté, il voit :
//   * Ses coordonnées (éditables)
//   * L'historique de ses demandes de contact (contact_requests)
//   * Le statut de chaque demande (nouvelle / en cours / traitée)
//
// Le portail est volontairement minimal — ACT reste l'interlocuteur
// unique. L'espace client sert de journal de bord et de preuve de
// l'engagement de l'agence auprès du client.
// =====================================================================

const ClientSpace = ({ go }) => {
  const { t, lang } = useI18n();
  const [phase, setPhase] = React.useState('checking'); // checking | login | linkSent | connected
  const [email, setEmail] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [requests, setRequests] = React.useState([]);
  const [profile, setProfile] = React.useState(null);
  const [loadingData, setLoadingData] = React.useState(false);
  const [error, setError] = React.useState('');
  const sbRef = React.useRef(null);

  // Lazy-init Supabase client (indépendant du client admin / loader public)
  const getSb = React.useCallback(async () => {
    if (sbRef.current) return sbRef.current;
    if (!window.supabase) {
      await new Promise((res, rej) => {
        const t0 = Date.now();
        const check = () => {
          if (window.supabase) return res();
          if (Date.now() - t0 > 5000) return rej(new Error('Supabase indisponible'));
          setTimeout(check, 100);
        };
        check();
      });
    }
    sbRef.current = window.supabase.createClient(
      'https://divcmjwqgsdkdsdrjwbg.supabase.co',
      'sb_publishable_TzKuydg2b8QXUJSztNiW9A_NVAY6pD7',
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: 'act-client-session'
        }
      }
    );
    return sbRef.current;
  }, []);

  // ------------------------------------------------------
  // Vérifie la session au chargement
  // ------------------------------------------------------
  React.useEffect(() => {
    (async () => {
      try {
        const sb = await getSb();
        const { data } = await sb.auth.getUser();
        if (data.user) {
          setUser(data.user);
          setPhase('connected');
        } else {
          setPhase('login');
        }
        // Écoute les changements (callback magic link)
        sb.auth.onAuthStateChange((_ev, session) => {
          if (session?.user) {
            setUser(session.user);
            setPhase('connected');
          }
        });
      } catch (e) {
        setError(e.message);
        setPhase('login');
      }
    })();
  }, [getSb]);

  // ------------------------------------------------------
  // Charge profil + demandes une fois connecté
  // ------------------------------------------------------
  React.useEffect(() => {
    if (phase !== 'connected' || !user) return;
    (async () => {
      setLoadingData(true);
      try {
        const sb = await getSb();
        // Upsert profil client (crée si premier login)
        const upsert = { id: user.id, email: user.email, language: lang };
        await sb.from('client_accounts').upsert(upsert, { onConflict: 'id' });

        const { data: prof } = await sb.from('client_accounts').select('*').eq('id', user.id).maybeSingle();
        setProfile(prof || upsert);

        // Récupère les demandes liées à cet email
        const { data: reqs } = await sb.from('contact_requests')
          .select('*')
          .eq('email', user.email)
          .order('created_at', { ascending: false });
        setRequests(reqs || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoadingData(false);
      }
    })();
  }, [phase, user, getSb, lang]);

  // ------------------------------------------------------
  // Envoi du magic link
  // ------------------------------------------------------
  const sendMagicLink = async (e) => {
    e.preventDefault();
    setError('');
    if (!/.+@.+\..+/.test(email)) { setError(t('monespace.err.email', 'Adresse email invalide.')); return; }
    setSending(true);
    try {
      const sb = await getSb();
      // Chemin réel : Supabase renverra vers /monespace#access_token=… ;
      // le hash token n'est pas touché par la redirection legacy (#/… seulement).
      const redirectTo = window.location.origin + '/monespace';
      const { error } = await sb.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo, shouldCreateUser: true }
      });
      if (error) throw error;
      setPhase('linkSent');
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const signOut = async () => {
    const sb = await getSb();
    await sb.auth.signOut();
    setUser(null); setProfile(null); setRequests([]);
    setPhase('login');
  };

  const saveProfile = async () => {
    try {
      const sb = await getSb();
      const { error } = await sb.from('client_accounts').update({
        full_name: profile.full_name,
        phone: profile.phone,
        country: profile.country,
        language: profile.language || lang
      }).eq('id', user.id);
      if (error) throw error;
      alert(t('monespace.saved', 'Profil enregistré.'));
    } catch (e) {
      alert('Erreur : ' + e.message);
    }
  };

  // ------------------------------------------------------
  // Rendering
  // ------------------------------------------------------

  if (phase === 'checking') {
    return (
      <main className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-terre-600 border-t-transparent rounded-full animate-spin"/>
      </main>
    );
  }

  if (phase === 'linkSent') {
    return (
      <main className="min-h-screen bg-sand-50 pt-24 pb-20">
        <div className="max-w-md mx-auto px-4 md:px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-terre-600 text-sand-50 mx-auto flex items-center justify-center mb-6">
            <Icons.Mail size={32}/>
          </div>
          <h1 className="font-display text-[36px] leading-tight text-ink mb-4">
            {t('monespace.link.title', 'Vérifiez vos emails')}
          </h1>
          <p className="text-ink-600 leading-relaxed mb-8">
            {t('monespace.link.body', 'Un lien de connexion a été envoyé à')} <b>{email}</b>. {t('monespace.link.body2', 'Cliquez sur ce lien pour accéder à votre espace client. Le lien est valable 1 heure.')}
          </p>
          <button onClick={() => setPhase('login')} className="text-terre hover:text-terre-700 text-[14px]">
            ← {t('monespace.link.change', 'Utiliser un autre email')}
          </button>
        </div>
        <Footer go={go}/>
      </main>
    );
  }

  if (phase === 'login') {
    return (
      <main className="min-h-screen bg-sand-50 pt-24 pb-20">
        <div className="max-w-md mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-terre-600 mb-3">
              — {t('monespace.kicker', 'Espace client')}
            </div>
            <h1 className="font-display text-[42px] md:text-[52px] leading-[1.05] text-ink">
              {t('monespace.login.title', 'Suivez vos voyages ACT.')}
            </h1>
            <p className="mt-4 text-ink-600 leading-relaxed">
              {t('monespace.login.body', 'Entrez votre email pour recevoir un lien de connexion sécurisé. Aucun mot de passe à retenir.')}
            </p>
          </div>

          <form onSubmit={sendMagicLink} className="bg-white rounded-3xl border border-ink/10 shadow-xl shadow-ink/5 p-8 space-y-4">
            <div>
              <label className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-500 block mb-1.5">
                {t('monespace.login.field', 'Votre adresse email')}
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jean.dupont@example.com"
                className="w-full h-12 rounded-full border border-ink/15 bg-sand-50 px-4 text-[14.5px] outline-none focus:border-terre focus:ring-2 focus:ring-terre/20"
              />
            </div>
            {error && (
              <div className="rounded-2xl bg-terre/10 border border-terre/30 px-4 py-3 text-[13px] text-terre-700">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={sending}
              className="w-full h-12 rounded-full bg-terre-600 hover:bg-terre-700 text-sand-50 font-medium text-[14.5px] inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {sending
                ? t('monespace.login.sending', 'Envoi en cours…')
                : t('monespace.login.submit', 'Recevoir le lien de connexion')}
              {!sending && <Icons.ArrowRight size={14}/>}
            </button>
            <p className="text-[12px] text-ink-500 text-center pt-2">
              {t('monespace.login.note', 'Pas de compte ? Il sera créé automatiquement à votre première connexion.')}
            </p>
          </form>

          <div className="mt-8 text-center">
            <a href="/contact" className="text-ink-500 hover:text-terre text-[13px]">
              {t('monespace.login.help', 'Besoin d\'aide ? Contactez-nous')}
            </a>
          </div>
        </div>
        <Footer go={go}/>
      </main>
    );
  }

  // ------------------------------------------------------
  // Connecté
  // ------------------------------------------------------
  const statusLabel = {
    new:          t('monespace.req.status.new',          'Nouvelle'),
    'in-progress':t('monespace.req.status.progress',     'En cours'),
    closed:       t('monespace.req.status.closed',       'Traitée')
  };
  const statusClass = {
    new:          'bg-terre-600/10 text-terre-700 border-terre-600/30',
    'in-progress':'bg-amber-100 text-amber-800 border-amber-300',
    closed:       'bg-emerald-100 text-emerald-800 border-emerald-300'
  };
  const kindLabel = {
    devis:   t('monespace.req.kind.devis',   'Demande de devis'),
    contact: t('monespace.req.kind.contact', 'Message'),
    custom:  t('monespace.req.kind.custom',  'Voyage sur mesure')
  };
  const formatD = (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString(lang, { day:'2-digit', month:'long', year:'numeric' }); }
    catch { return iso; }
  };

  return (
    <main className="min-h-screen bg-sand-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-terre mb-3">
              — {t('monespace.kicker', 'Espace client')}
            </div>
            <h1 className="font-display text-[36px] md:text-[52px] leading-[1.05] text-ink">
              {t('monespace.hello', 'Bonjour')}{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.
            </h1>
          </div>
          <button onClick={signOut} className="text-ink-500 hover:text-terre text-[13.5px] inline-flex items-center gap-2 pt-4">
            {t('monespace.signout', 'Déconnexion')} <Icons.ArrowUpRight size={13}/>
          </button>
        </div>

        {/* Bloc profil */}
        <section className="mb-10 rounded-3xl bg-white border border-ink/10 p-6 md:p-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-3">— {t('monespace.profile', 'Vos coordonnées')}</div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] uppercase text-ink-500 font-mono block mb-1">{t('monespace.field.name', 'Nom complet')}</label>
              <input value={profile?.full_name || ''} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                     className="w-full h-11 rounded-full border border-ink/15 px-4 bg-sand-50 text-[14px]"/>
            </div>
            <div>
              <label className="text-[11px] uppercase text-ink-500 font-mono block mb-1">{t('monespace.field.email', 'Email')}</label>
              <input value={user.email} disabled
                     className="w-full h-11 rounded-full border border-ink/10 px-4 bg-sand-100 text-[14px] text-ink-500"/>
            </div>
            <div>
              <label className="text-[11px] uppercase text-ink-500 font-mono block mb-1">{t('monespace.field.phone', 'Téléphone')}</label>
              <input value={profile?.phone || ''} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                     className="w-full h-11 rounded-full border border-ink/15 px-4 bg-sand-50 text-[14px]"/>
            </div>
            <div>
              <label className="text-[11px] uppercase text-ink-500 font-mono block mb-1">{t('monespace.field.country', 'Pays')}</label>
              <input value={profile?.country || ''} onChange={e => setProfile(p => ({ ...p, country: e.target.value }))}
                     className="w-full h-11 rounded-full border border-ink/15 px-4 bg-sand-50 text-[14px]"/>
            </div>
          </div>
          <div className="mt-5 text-right">
            <button onClick={saveProfile} className="h-10 px-5 rounded-full bg-terre-600 hover:bg-terre-700 text-sand-50 text-[13.5px] font-medium">
              {t('monespace.save', 'Enregistrer')}
            </button>
          </div>
        </section>

        {/* Bloc demandes */}
        <section className="rounded-3xl bg-white border border-ink/10 p-6 md:p-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-terre mb-3">— {t('monespace.reqs', 'Vos demandes')}</div>
          <h2 className="font-display text-[24px] md:text-[28px] leading-tight text-ink mb-6">
            {t('monespace.reqs.title', 'Historique de vos échanges avec ACT.')}
          </h2>

          {loadingData ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 border-2 border-terre-600 border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-3 opacity-40">📭</div>
              <p className="text-ink-600 text-[14px]">{t('monespace.reqs.empty', 'Aucune demande enregistrée pour le moment.')}</p>
              <a href="/custom" className="mt-4 inline-flex items-center gap-2 h-10 px-5 rounded-full bg-terre-600 hover:bg-terre-700 text-sand-50 text-[13.5px] font-medium">
                {t('monespace.reqs.new', 'Faire une demande')} <Icons.ArrowRight size={13}/>
              </a>
            </div>
          ) : (
            <ul className="divide-y divide-ink/5 border-y border-ink/5">
              {requests.map(r => (
                <li key={r.id} className="py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="font-display text-[18px] text-ink leading-none">{kindLabel[r.kind] || r.kind}</div>
                      <div className="text-[12.5px] text-ink-500 mt-1">{formatD(r.created_at)}</div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11.5px] font-medium border ${statusClass[r.status] || ''}`}>
                      {statusLabel[r.status] || r.status}
                    </span>
                  </div>
                  {r.circuit_slug && (
                    <div className="text-[13px] text-ink-700 mb-1">
                      <span className="text-ink-500">{t('monespace.req.circuit', 'Circuit')} :</span> {r.circuit_slug}
                    </div>
                  )}
                  {r.travelers && (
                    <div className="text-[13px] text-ink-700 mb-1">
                      <span className="text-ink-500">{t('monespace.req.travelers', 'Voyageurs')} :</span> {r.travelers}
                    </div>
                  )}
                  {r.message && (
                    <div className="mt-3 rounded-2xl bg-sand-100 p-3 text-[13.5px] text-ink-700 italic">
                      « {r.message.length > 200 ? r.message.slice(0, 200) + '…' : r.message} »
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 text-center">
            <a href="/custom" className="text-terre hover:text-terre-700 text-[13.5px] inline-flex items-center gap-1">
              + {t('monespace.reqs.newLink', 'Nouvelle demande de voyage')}
            </a>
          </div>
        </section>
      </div>

      <Footer go={go}/>
    </main>
  );
};

if (typeof window !== 'undefined') window.ClientSpace = ClientSpace;
export { ClientSpace };

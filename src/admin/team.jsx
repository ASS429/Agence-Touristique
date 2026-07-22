import React, { useState, useEffect } from 'react';
import { Icon } from './icons.jsx';
import { PagePad } from './list-editor.jsx';
import {
  Avatar, Badge, Btn, Field, Input, Select, Modal, Spinner, EmptyState,
  formatDate, toast,
} from './ui.jsx';

// =====================================================================
// src/admin/team.jsx — Administrateurs
//
// Gestion autonome des comptes admin DEPUIS le tableau de bord. Toutes les
// opérations sensibles (créer / supprimer un compte, réinitialiser un mot
// de passe) passent par l'Edge Function `admin-manage` qui s'exécute côté
// serveur avec la clé service role et vérifie que l'appelant est owner.
// Le changement de SON PROPRE mot de passe se fait directement côté client
// (sb.auth.updateUser), sans privilège serveur.
// =====================================================================

const ROLE_LABEL = { owner: 'Propriétaire', editor: 'Éditeur' };
const ROLE_DESC = {
  owner:  'Peut tout gérer, y compris ajouter ou retirer des administrateurs.',
  editor: 'Peut gérer tout le contenu du site, mais pas les administrateurs.',
};

const ERR_FR = {
  unauthorized:         'Session expirée. Reconnectez-vous.',
  forbidden:            "Votre compte n'a pas accès à cette section.",
  forbidden_owner_only: 'Seul un compte Propriétaire peut gérer les administrateurs.',
  invalid_email:        "Adresse e-mail invalide.",
  weak_password:        'Le mot de passe doit contenir au moins 8 caractères.',
  create_failed:        "Impossible de créer le compte (l'e-mail existe peut-être déjà).",
  enroll_failed:        "Le compte a été créé mais son enrôlement a échoué.",
  cannot_remove_self:   'Vous ne pouvez pas vous retirer vous-même.',
  cannot_change_own_role: 'Vous ne pouvez pas changer votre propre rôle.',
  last_owner:           'Impossible : il doit rester au moins un Propriétaire.',
  not_found:            'Administrateur introuvable.',
  unknown_action:       'Action inconnue.',
  network:              'Service indisponible. Vérifiez que la fonction « admin-manage » est bien déployée.',
  unknown:              'Une erreur est survenue.',
};
const errMsg = (code) => ERR_FR[code] || ERR_FR.unknown;

// Appel de l'Edge Function admin-manage. Convention : HTTP 200 + { ok, ... }.
async function callAdmin(action, payload = {}) {
  let data, error;
  try {
    ({ data, error } = await window.SB.functions.invoke('admin-manage', {
      body: { action, ...payload },
    }));
  } catch (_) {
    const e = new Error('network'); e.code = 'network'; throw e;
  }
  if (error || !data) { const e = new Error('network'); e.code = 'network'; throw e; }
  if (!data.ok) { const e = new Error(data.error || 'unknown'); e.code = data.error || 'unknown'; throw e; }
  return data;
}

// Générateur de mot de passe robuste (sans caractères ambigus 0/O/1/l/I).
function genPassword(len = 14) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#%?';
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  let out = '';
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  return out;
}

// ---------------------------------------------------------------------
// Modale « Ajouter un administrateur »
// ---------------------------------------------------------------------
function AddAdminModal({ open, onClose, onCreated }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('editor');
  const [showPass, setShowPass] = useState(true);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null); // { email, password } → panneau de remise

  const reset = () => {
    setFullName(''); setEmail(''); setPassword(''); setRole('editor');
    setShowPass(true); setSaving(false); setCreated(null);
  };
  const close = () => { reset(); onClose(); };

  const submit = async () => {
    if (!email.trim()) return toast('Renseignez une adresse e-mail.', 'warning');
    if (password.length < 8) return toast('Mot de passe : 8 caractères minimum.', 'warning');
    setSaving(true);
    try {
      await callAdmin('create', {
        full_name: fullName.trim(), email: email.trim(), password, role,
      });
      setCreated({ email: email.trim(), password });
      onCreated();
    } catch (e) {
      toast(errMsg(e.code), 'error');
    } finally { setSaving(false); }
  };

  const copyCreds = async () => {
    try {
      await navigator.clipboard.writeText(
        `Tableau de bord ACT — https://act-senegal.com/admin\nIdentifiant : ${created.email}\nMot de passe : ${created.password}`
      );
      toast('Identifiants copiés.', 'success');
    } catch { toast('Copie impossible sur ce navigateur.', 'warning'); }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      kicker="Administrateurs"
      title={created ? 'Compte créé' : 'Ajouter un administrateur'}
      size="md"
      footer={created ? (
        <div className="flex justify-end">
          <Btn onClick={close}>Terminé</Btn>
        </div>
      ) : (
        <div className="flex justify-end gap-2">
          <Btn variant="ghost" onClick={close}>Annuler</Btn>
          <Btn onClick={submit} loading={saving} icon={<Icon name="plus" size={16} stroke={2}/>}>
            Créer le compte
          </Btn>
        </div>
      )}
    >
      {created ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-success-600">
            <Icon name="check" size={20}/>
            <span className="font-semibold">Le compte administrateur est actif.</span>
          </div>
          <p className="text-[13.5px] text-mute-600">
            Communiquez ces identifiants à la personne concernée de façon sécurisée.
            Elle pourra ensuite <b>changer son mot de passe</b> depuis « Mon compte ».
          </p>
          <div className="rounded-2xl border border-bone-300 bg-white p-4 font-mono text-[13px] space-y-1.5">
            <div><span className="text-mute-400">Adresse :</span> {created.email}</div>
            <div><span className="text-mute-400">Mot de passe :</span> {created.password}</div>
          </div>
          <Btn variant="secondary" onClick={copyCreds} icon={<Icon name="copy" size={15}/>}>
            Copier les identifiants
          </Btn>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Nom (facultatif)">
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ex. Awa Diallo"/>
          </Field>
          <Field label="Adresse e-mail" required>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="personne@act-senegal.com"/>
          </Field>
          <Field label="Mot de passe initial" required hint="8 caractères minimum. La personne pourra le changer ensuite.">
            <div className="flex gap-2">
              <Input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1"
              />
              <Btn variant="secondary" type="button" onClick={() => { setPassword(genPassword()); setShowPass(true); }}>
                Générer
              </Btn>
              <Btn variant="ghost" type="button" onClick={() => setShowPass(v => !v)} aria-label="Afficher/masquer">
                <Icon name={showPass ? 'eyeOff' : 'eye'} size={16}/>
              </Btn>
            </div>
          </Field>
          <Field label="Rôle" hint={ROLE_DESC[role]}>
            <Select value={role} onChange={e => setRole(e.target.value)}>
              <option value="editor">Éditeur — gère le contenu</option>
              <option value="owner">Propriétaire — gère aussi les administrateurs</option>
            </Select>
          </Field>
        </div>
      )}
    </Modal>
  );
}

// ---------------------------------------------------------------------
// Modale « Mot de passe » (mon compte OU réinitialisation d'un membre)
// ---------------------------------------------------------------------
function PasswordModal({ open, onClose, target }) {
  // target : { self:true } | { self:false, user_id, email }
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setPwd(''); setConfirm(''); setShow(false); } }, [open]);

  const submit = async () => {
    if (pwd.length < 8) return toast('8 caractères minimum.', 'warning');
    if (pwd !== confirm) return toast('Les deux mots de passe ne correspondent pas.', 'warning');
    setSaving(true);
    try {
      if (target?.self) {
        const { error } = await window.SB.auth.updateUser({ password: pwd });
        if (error) throw Object.assign(new Error('unknown'), { code: 'unknown' });
        toast('Votre mot de passe a été changé.', 'success');
      } else {
        await callAdmin('set-password', { user_id: target.user_id, password: pwd });
        toast('Mot de passe réinitialisé.', 'success');
      }
      onClose();
    } catch (e) {
      toast(errMsg(e.code), 'error');
    } finally { setSaving(false); }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      kicker={target?.self ? 'Mon compte' : 'Réinitialiser le mot de passe'}
      title={target?.self ? 'Changer mon mot de passe' : (target?.email || '')}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn onClick={submit} loading={saving}>Enregistrer</Btn>
        </div>
      }
    >
      <div className="space-y-4">
        {!target?.self && (
          <p className="text-[13.5px] text-mute-600">
            Définissez un nouveau mot de passe pour <b>{target?.email}</b>. Communiquez-le de façon sécurisée.
          </p>
        )}
        <Field label="Nouveau mot de passe" required>
          <div className="flex gap-2">
            <Input type={show ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)} className="flex-1" placeholder="••••••••"/>
            <Btn variant="secondary" type="button" onClick={() => { const p = genPassword(); setPwd(p); setConfirm(p); setShow(true); }}>Générer</Btn>
            <Btn variant="ghost" type="button" onClick={() => setShow(v => !v)}><Icon name={show ? 'eyeOff' : 'eye'} size={16}/></Btn>
          </div>
        </Field>
        <Field label="Confirmer le mot de passe" required>
          <Input type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"/>
        </Field>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------
// Carte d'un administrateur
// ---------------------------------------------------------------------
function AdminCard({ row, me, onChangeRole, onResetPwd, onRemove }) {
  const isSelf = row.user_id === me.user_id;
  const iAmOwner = me.role === 'owner';
  const name = row.email?.split('@')[0] || 'Administrateur';

  return (
    <div className="bg-white border border-bone-200 rounded-2xl p-4 shadow-act-card flex items-center gap-4">
      <Avatar name={row.email || 'A'} size={44} variant={row.role === 'owner' ? 'terra' : 'ocean'}/>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-ink-800 text-[14px] truncate">{row.email}</span>
          {isSelf && <Badge variant="brand">vous</Badge>}
        </div>
        <div className="text-[12px] text-mute-500 mt-0.5">
          Ajouté le {formatDate(row.created_at)}
        </div>
      </div>

      {/* Rôle */}
      {iAmOwner && !isSelf ? (
        <select
          value={row.role}
          onChange={e => onChangeRole(row, e.target.value)}
          className="h-9 px-3 pr-8 rounded-xl border border-bone-500 bg-white text-[12.5px] font-semibold text-ink-700 cursor-pointer outline-none focus:border-terra-600"
        >
          <option value="editor">Éditeur</option>
          <option value="owner">Propriétaire</option>
        </select>
      ) : (
        <Badge variant={row.role === 'owner' ? 'brand' : 'info'}>{ROLE_LABEL[row.role] || row.role}</Badge>
      )}

      {/* Actions owner */}
      {iAmOwner && (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onResetPwd(row)}
            title="Réinitialiser le mot de passe"
            className="w-9 h-9 rounded-xl border border-bone-300 bg-white text-mute-600 hover:bg-sand-100 hover:text-ink-800 flex items-center justify-center transition"
          >
            <Icon name="key" size={16}/>
          </button>
          {!isSelf && (
            <button
              onClick={() => onRemove(row)}
              title="Retirer cet administrateur"
              className="w-9 h-9 rounded-xl border border-bone-300 bg-white text-mute-600 hover:bg-danger-100 hover:text-danger-600 flex items-center justify-center transition"
            >
              <Icon name="trash" size={16}/>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Page Administrateurs
// ---------------------------------------------------------------------
function TeamPage() {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [me, setMe] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [pwdTarget, setPwdTarget] = useState(null); // { self } | { user_id, email }

  const load = async () => {
    setLoading(true); setLoadError(null);
    try {
      const data = await callAdmin('list');
      setAdmins(data.admins || []);
      setMe(data.me);
    } catch (e) {
      setLoadError(errMsg(e.code));
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  // Le CTA « + Nouveau » du header (opt-in par section)
  useEffect(() => {
    const onCta = (e) => { if (e.detail?.section === 'team' && me?.role === 'owner') setAddOpen(true); };
    window.addEventListener('act-admin-cta', onCta);
    return () => window.removeEventListener('act-admin-cta', onCta);
  }, [me]);

  const changeRole = async (row, role) => {
    if (role === row.role) return;
    try {
      await callAdmin('set-role', { user_id: row.user_id, role });
      toast('Rôle mis à jour.', 'success');
      load();
    } catch (e) { toast(errMsg(e.code), 'error'); load(); }
  };

  const resetPwd = (row) => setPwdTarget({ self: false, user_id: row.user_id, email: row.email });

  const removeAdmin = async (row) => {
    const ok = await window.askConfirm(
      `Retirer ${row.email} ? Son accès au tableau de bord sera immédiatement supprimé.`,
      'Retirer', 'danger'
    );
    if (!ok) return;
    try {
      await callAdmin('remove', { user_id: row.user_id });
      toast('Administrateur retiré.', 'success');
      load();
    } catch (e) { toast(errMsg(e.code), 'error'); }
  };

  if (loading) {
    return <PagePad maxWidth="max-w-[860px]"><div className="flex justify-center py-16"><Spinner size="lg"/></div></PagePad>;
  }

  const iAmOwner = me?.role === 'owner';

  return (
    <PagePad maxWidth="max-w-[860px]">
      {/* Mon compte */}
      {me && (
        <div className="bg-white border border-bone-200 rounded-2xl p-5 shadow-act-card mb-6">
          <div className="flex items-center gap-4">
            <Avatar name={me.email || 'A'} size={46} variant="terra"/>
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-400">Mon compte</div>
              <div className="font-semibold text-ink-800 truncate">{me.email}</div>
              <div className="text-[12.5px] text-mute-500">{ROLE_LABEL[me.role] || me.role}</div>
            </div>
            <Btn variant="secondary" onClick={() => setPwdTarget({ self: true })} icon={<Icon name="key" size={15}/>}>
              Changer mon mot de passe
            </Btn>
          </div>
        </div>
      )}

      {/* Erreur de chargement (fonction non déployée, etc.) */}
      {loadError && (
        <div className="rounded-2xl bg-warn-100 border border-warn-600/25 text-warn-600 text-[13px] p-4 mb-6">
          {loadError}
        </div>
      )}

      {/* En-tête liste */}
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="font-display text-[24px] text-ink-800">Administrateurs</h2>
          <p className="text-mute-500 text-[13.5px] mt-0.5">
            {iAmOwner
              ? "Créez ou retirez des comptes, sans intervention technique."
              : "Seul un Propriétaire peut ajouter ou retirer des administrateurs."}
          </p>
        </div>
        {iAmOwner && (
          <Btn onClick={() => setAddOpen(true)} icon={<Icon name="plus" size={16} stroke={2}/>}>
            Ajouter un administrateur
          </Btn>
        )}
      </div>

      {/* Rappel des rôles */}
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl border border-bone-200 bg-sand-50 p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="shield" size={15} className="text-terra-600"/>
            <span className="font-semibold text-[13px] text-ink-800">Propriétaire</span>
          </div>
          <p className="text-[12.5px] text-mute-500">{ROLE_DESC.owner}</p>
        </div>
        <div className="rounded-xl border border-bone-200 bg-sand-50 p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="pen" size={15} className="text-info-600"/>
            <span className="font-semibold text-[13px] text-ink-800">Éditeur</span>
          </div>
          <p className="text-[12.5px] text-mute-500">{ROLE_DESC.editor}</p>
        </div>
      </div>

      {/* Liste */}
      {admins.length === 0 && !loadError ? (
        <EmptyState
          title="Aucun administrateur"
          message="Ajoutez le premier compte administrateur pour commencer."
          icon={<Icon name="users" size={26}/>}
        />
      ) : (
        <div className="space-y-3">
          {admins.map(row => (
            <AdminCard
              key={row.user_id}
              row={row}
              me={me}
              onChangeRole={changeRole}
              onResetPwd={resetPwd}
              onRemove={removeAdmin}
            />
          ))}
        </div>
      )}

      <AddAdminModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={load}/>
      <PasswordModal open={!!pwdTarget} onClose={() => setPwdTarget(null)} target={pwdTarget}/>
    </PagePad>
  );
}

window.TeamPage = TeamPage;
export { TeamPage };

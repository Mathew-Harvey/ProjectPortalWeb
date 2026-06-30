import { useState } from 'react';
import { api } from '../utils/api';
import { useAuth, ROLE_LABELS } from '../contexts/AuthContext';

export default function AccountPage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  async function saveProfile(e) {
    e.preventDefault();
    setProfileMsg(''); setProfileErr(''); setSavingProfile(true);
    try {
      await api.updateProfile(name.trim());
      await refreshUser();
      setProfileMsg('Saved.');
    } catch (err) {
      setProfileErr(err.message || 'Failed to save');
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwMsg(''); setPwErr('');
    if (pw.next !== pw.confirm) { setPwErr('New passwords do not match.'); return; }
    setSavingPw(true);
    try {
      await api.changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      setPwMsg('Password changed.');
    } catch (err) {
      setPwErr(err.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div>
      <div className="page-head"><h1>Account settings</h1></div>

      <section className="card section form-card">
        <h2 className="section-title">Profile</h2>
        {profileErr && <div className="alert alert-error">{profileErr}</div>}
        {profileMsg && <div className="alert alert-ok">{profileMsg}</div>}
        <form onSubmit={saveProfile}>
          <label className="field"><span>Email</span><input className="input" value={user?.email || ''} disabled /></label>
          <label className="field"><span>Role</span><input className="input" value={ROLE_LABELS[user?.role] || user?.role || ''} disabled /></label>
          <label className="field"><span>Display name</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <button className="btn btn-primary" type="submit" disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save profile'}</button>
        </form>
      </section>

      <section className="card section form-card">
        <h2 className="section-title">Change password</h2>
        {pwErr && <div className="alert alert-error">{pwErr}</div>}
        {pwMsg && <div className="alert alert-ok">{pwMsg}</div>}
        <form onSubmit={savePassword}>
          <label className="field"><span>Current password</span>
            <input className="input" type="password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} required />
          </label>
          <label className="field"><span>New password</span>
            <input className="input" type="password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} required />
            <span className="tform-help">At least 8 characters, one uppercase letter and one number.</span>
          </label>
          <label className="field"><span>Confirm new password</span>
            <input className="input" type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} required />
          </label>
          <button className="btn btn-primary" type="submit" disabled={savingPw}>{savingPw ? 'Saving…' : 'Change password'}</button>
        </form>
      </section>
    </div>
  );
}

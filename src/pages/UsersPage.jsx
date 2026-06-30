import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth, ROLE_LABELS } from '../contexts/AuthContext';
import { fmtDate } from '../components/ui';

const ROLES = ['admin_pm', 'engineer', 'field', 'client'];

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [resetFor, setResetFor] = useState(null); // user being password-reset

  const blank = { name: '', email: '', role: 'field', password: '' };
  const [form, setForm] = useState(blank);
  const [addErr, setAddErr] = useState('');
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true); setError('');
    try {
      const { users } = await api.listUsers();
      setUsers(users);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { if (user?.role === 'admin_pm') load(); }, [user]);

  if (user?.role !== 'admin_pm') {
    return <div className="card"><p className="muted">Only a PM / Integrator can manage users.</p><Link to="/">Back to register</Link></div>;
  }

  async function patch(id, body) {
    setBusyId(id); setError('');
    try { await api.updateUser(id, body); await load(); }
    catch (err) { setError(err.message); } finally { setBusyId(null); }
  }

  async function addUser(e) {
    e.preventDefault();
    setAddErr(''); setAdding(true);
    try {
      await api.createUser({ ...form, email: form.email.trim(), name: form.name.trim() });
      setForm(blank);
      await load();
    } catch (err) {
      setAddErr(err.message || 'Failed to add user');
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div className="spinner-page"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-head"><h1>Manage users</h1></div>
      {error && <div className="alert alert-error">{error}</div>}

      <section className="card section">
        <h2 className="section-title">Team ({users.length})</h2>
        <div className="table-scroll">
          <table className="map-table users-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Added</th><th></th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={u.isActive ? '' : 'row-inactive'}>
                  <td>{u.name}{u.id === user.id && <span className="pill pill-ok" style={{ marginLeft: 6 }}>you</span>}</td>
                  <td>{u.email}</td>
                  <td>
                    <select className="input input-sm" value={u.role} disabled={busyId === u.id}
                      onChange={(e) => patch(u.id, { role: e.target.value })}>
                      {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </td>
                  <td>{u.isActive ? <span className="pill pill-ok">Active</span> : <span className="pill pill-wait">Inactive</span>}</td>
                  <td className="muted small">{fmtDate(u.createdAt)}</td>
                  <td className="users-actions">
                    <button className="btn btn-sm" disabled={busyId === u.id} onClick={() => setResetFor(u)}>Reset password</button>
                    {u.isActive
                      ? <button className="btn btn-sm" disabled={busyId === u.id} onClick={() => patch(u.id, { isActive: false })}>Deactivate</button>
                      : <button className="btn btn-sm" disabled={busyId === u.id} onClick={() => patch(u.id, { isActive: true })}>Reactivate</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card section form-card">
        <h2 className="section-title">Add a user</h2>
        {addErr && <div className="alert alert-error">{addErr}</div>}
        <form onSubmit={addUser}>
          <div className="form-row">
            <label className="field"><span>Name</span>
              <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </label>
            <label className="field"><span>Email</span>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            </label>
          </div>
          <div className="form-row">
            <label className="field"><span>Role</span>
              <select className="input" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </label>
            <label className="field"><span>Temporary password</span>
              <input className="input" type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
              <span className="tform-help">At least 8 characters, one uppercase letter and one number.</span>
            </label>
          </div>
          <button className="btn btn-primary" type="submit" disabled={adding}>{adding ? 'Adding…' : 'Add user'}</button>
        </form>
      </section>

      {resetFor && (
        <ResetPasswordModal user={resetFor} onClose={() => setResetFor(null)}
          onDone={async (password) => { await patch(resetFor.id, { password }); setResetFor(null); }} />
      )}
    </div>
  );
}

function ResetPasswordModal({ user, onClose, onDone }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try { await onDone(password); }
    catch (err) { setError(err.message || 'Failed'); setBusy(false); }
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <h2>Reset password</h2>
        <p className="muted small">Set a new password for {user.name} ({user.email}).</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <label className="field"><span>New password</span>
            <input className="input" type="text" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required />
            <span className="tform-help">At least 8 characters, one uppercase letter and one number.</span>
          </label>
          <div className="modal-actions">
            <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Set password'}</button>
            <button className="btn btn-ghost" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

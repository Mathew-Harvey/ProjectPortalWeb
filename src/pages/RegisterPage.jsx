import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../contexts/AuthContext';

const ROLES = ['admin_pm', 'engineer', 'field', 'client'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'field' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-brand">
          <span className="brand-mark">▰</span> Franmarine <span className="brand-sub">Project Portal</span>
        </div>
        <h1>Create account</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <label className="field">
            <span>Name</span>
            <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </label>
          <label className="field">
            <span>Email</span>
            <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </label>
          <label className="field">
            <span>Password</span>
            <input className="input" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required />
            <span className="tform-help">At least 8 characters, one uppercase letter and one number.</span>
          </label>
          <label className="field">
            <span>Role</span>
            <select className="input" value={form.role} onChange={(e) => set('role', e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </label>
          <button className="btn btn-primary btn-full" type="submit" disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="muted auth-foot">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}

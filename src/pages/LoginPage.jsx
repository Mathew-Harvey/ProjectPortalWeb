import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DEMO = [
  { email: 'pm@franmarine.com.au', label: 'PM / Integrator' },
  { email: 'engineer@franmarine.com.au', label: 'Engineer' },
  { email: 'field@franmarine.com.au', label: 'Field / Diver' },
  { email: 'client@franmarine.com.au', label: 'Client' },
];

// The seeded demo-login password. Set VITE_DEMO_PASSWORD at build time to match
// the API's SEED_PASSWORD; defaults to the dev value. Keeping it in an env var
// avoids committing the real deployed password to the repo.
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || 'Password123';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
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
        <h1>Sign in</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <label className="field">
            <span>Email</span>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />
          </label>
          <label className="field">
            <span>Password</span>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button className="btn btn-primary btn-full" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="muted auth-foot">No account? <Link to="/register">Register</Link></p>

        <div className="demo-box">
          <div className="demo-title">Demo logins (password <code>{DEMO_PASSWORD}</code>)</div>
          {DEMO.map((d) => (
            <button key={d.email} className="demo-row" onClick={() => { setEmail(d.email); setPassword(DEMO_PASSWORD); }}>
              <span>{d.label}</span><code>{d.email}</code>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

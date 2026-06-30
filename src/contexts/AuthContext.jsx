import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  useEffect(() => { checkAuth(); }, []);

  // Centralized session-expired handler (api.js dispatches on unexpected 401s).
  useEffect(() => {
    function handleExpired() {
      if (!userRef.current) return;
      setUser(null);
      setOrg(null);
    }
    window.addEventListener('portal:session-expired', handleExpired);
    return () => window.removeEventListener('portal:session-expired', handleExpired);
  }, []);

  async function checkAuth() {
    try {
      const data = await api.me();
      setUser(data.user);
      setOrg(data.organisation || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const data = await api.login({ email, password });
    setUser(data.user);
    await refreshOrg();
    return data;
  }

  async function register(body) {
    const data = await api.register(body);
    setUser(data.user);
    await refreshOrg();
    return data;
  }

  // Complete an emailed step invite: creates the account (or signs in) and
  // establishes the session.
  async function claim(token, password) {
    const data = await api.claimInvite(token, password);
    setUser(data.user);
    await refreshOrg();
    return data;
  }

  async function refreshOrg() {
    try {
      const data = await api.me();
      setOrg(data.organisation || null);
    } catch { /* ignore */ }
  }

  async function refreshUser() {
    try {
      const data = await api.me();
      setUser(data.user);
      setOrg(data.organisation || null);
    } catch { /* ignore */ }
  }

  async function logout() {
    try { await api.logout(); } catch { /* ignore */ }
    setUser(null);
    setOrg(null);
  }

  return (
    <AuthContext.Provider value={{ user, org, loading, login, register, claim, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Human-friendly role labels used across the shell.
export const ROLE_LABELS = {
  admin_pm: 'PM / Integrator',
  engineer: 'Engineer',
  field: 'Field / Diver',
  client: 'Client',
};

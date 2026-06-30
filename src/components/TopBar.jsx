import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '../contexts/AuthContext';

// Shared top bar used by the authenticated Layout and the public Help/work-item
// pages. Signed-in users get the nav + an account menu; guests get a minimal bar.
const NAV = [
  { to: '/', label: 'Repair register' },
  { to: '/timeline', label: 'Event timeline' },
  { to: '/help', label: 'Help' },
];

export default function TopBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Close the menu whenever the route changes.
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to={user ? '/' : '/login'} className="brand">
          <span className="brand-mark">▰</span>
          <span className="brand-name">Franmarine</span>
          <span className="brand-sub">Project Portal</span>
        </Link>

        {user ? (
          <>
            <nav className="topnav">
              {NAV.map((item) => (
                <Link key={item.to} to={item.to} className={`navlink ${location.pathname === item.to ? 'active' : ''}`}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="topbar-right" ref={menuRef}>
              <button className="account-btn" onClick={() => setMenuOpen((o) => !o)} aria-haspopup="true" aria-expanded={menuOpen}>
                <span className="account-avatar">{(user.name || user.email || '?').charAt(0).toUpperCase()}</span>
                <span className="account-meta">
                  <span className="whoami-name">{user.name}</span>
                  <span className={`role-chip role-${user.role}`}>{ROLE_LABELS[user.role] || user.role}</span>
                </span>
                <span className="account-caret">▾</span>
              </button>
              {menuOpen && (
                <div className="account-menu card" role="menu">
                  <div className="account-menu-head">
                    <div className="account-menu-name">{user.name}</div>
                    <div className="muted small">{user.email}</div>
                  </div>
                  <Link to="/account" className="account-menu-item" role="menuitem">Account settings</Link>
                  {user.role === 'admin_pm' && (
                    <Link to="/users" className="account-menu-item" role="menuitem">Manage users</Link>
                  )}
                  <button className="account-menu-item danger" role="menuitem" onClick={handleLogout}>Sign out</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <nav className="topnav">
              <Link to="/help" className={`navlink ${location.pathname === '/help' ? 'active' : ''}`}>Help</Link>
            </nav>
            <div className="topbar-right">
              <Link className="btn btn-ghost btn-sm" to="/login">Sign in</Link>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '../contexts/AuthContext';

// Shared top bar used by the authenticated Layout and the public Help page.
// Adapts to auth state: signed-in users get the full nav + sign-out; guests
// get a minimal bar with a Help link and a Sign in button.
const NAV = [
  { to: '/', label: 'Repair register' },
  { to: '/timeline', label: 'Event timeline' },
  { to: '/help', label: 'Help' },
];

export default function TopBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
            <div className="topbar-right">
              <div className="whoami">
                <span className="whoami-name">{user.name}</span>
                <span className={`role-chip role-${user.role}`}>{ROLE_LABELS[user.role] || user.role}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
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

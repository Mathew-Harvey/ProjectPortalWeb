import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '../contexts/AuthContext';

export default function Layout() {
  const { user, org, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const navItems = [
    { to: '/', label: 'Repair register' },
    { to: '/timeline', label: 'Event timeline' },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">▰</span>
            <span className="brand-name">Franmarine</span>
            <span className="brand-sub">Project Portal</span>
          </Link>
          <nav className="topnav">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`navlink ${location.pathname === item.to ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="topbar-right">
            <div className="whoami">
              <span className="whoami-name">{user?.name}</span>
              <span className={`role-chip role-${user?.role}`}>{ROLE_LABELS[user?.role] || user?.role}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
          </div>
        </div>
      </header>
      <main className="content">
        <div className="content-inner">
          {org && <div className="org-banner">{org.name}</div>}
          <Outlet />
        </div>
      </main>
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TopBar from './TopBar';

export default function Layout() {
  const { org } = useAuth();

  return (
    <div className="app-shell">
      <TopBar />
      <main className="content">
        <div className="content-inner">
          {org && <div className="org-banner">{org.name}</div>}
          <Outlet />
        </div>
      </main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge, MethodBadge, fmtDate } from '../components/ui';

export default function DashboardPage() {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [workItems, setWorkItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { projects } = await api.listProjects();
      if (!projects.length) { setLoading(false); return; }
      const p = projects[0];
      setProject(p);
      const { workItems } = await api.listWorkItems(p.id);
      setWorkItems(workItems);
    } catch (err) {
      setError(err.message || 'Failed to load register');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="spinner-page"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Repair register</h1>
          {project && <p className="muted">{project.name} · asset {project.asset_ref}</p>}
        </div>
        {user?.role === 'admin_pm' && (
          <Link to="/work-items/new" className="btn btn-primary">+ New work item</Link>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {workItems.length === 0 ? (
        <div className="card empty">
          <p className="muted">No work items yet.</p>
          {user?.role === 'admin_pm' && <Link to="/work-items/new" className="btn btn-primary">Create the first one</Link>}
        </div>
      ) : (
        <div className="register-grid">
          {workItems.map((w) => (
            <Link to={`/work-items/${w.id}`} key={w.id} className="card wi-card">
              <div className="wi-card-head">
                <span className="wi-ref">{w.ref_code}</span>
                <StatusBadge status={w.status} />
              </div>
              <div className="wi-loc">{w.location_ref || 'No location set'}</div>
              <div className="wi-badges">
                <MethodBadge method={w.method} />
                {w.spec_approved
                  ? <span className="pill pill-ok">Spec approved</span>
                  : <span className="pill pill-wait">Awaiting spec</span>}
              </div>
              <div className="wi-stats">
                <span>ITP {w.hold_point_signed_count}/{w.hold_point_count}</span>
                <span>· {w.media_count} evidence</span>
              </div>
              <div className="wi-foot muted">Updated {fmtDate(w.updated_at)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

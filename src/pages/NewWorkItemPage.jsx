import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import TemplateForm from '../components/TemplateForm';

export default function NewWorkItemPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [method, setMethod] = useState('weld');
  const [refCode, setRefCode] = useState('');
  const [locationRef, setLocationRef] = useState('');
  const [notify, setNotify] = useState('');
  const [rdsTemplates, setRdsTemplates] = useState({});
  const [data, setData] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { projects } = await api.listProjects();
      setProject(projects[0] || null);
      const { templates } = await api.listTemplates(undefined, 'rds');
      const byMethod = {};
      templates.forEach((t) => { byMethod[t.method] = t.definition; });
      setRdsTemplates(byMethod);
    })().catch((err) => setError(err.message));
  }, []);

  // Reset the RDS payload when method changes — the template (and its fields) changes.
  useEffect(() => { setData({}); }, [method]);

  if (user?.role !== 'admin_pm') {
    return <div className="card"><p className="muted">Only a PM can create work items.</p><Link to="/">Back to register</Link></div>;
  }

  const def = rdsTemplates[method];

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const notifyEmails = notify
        .split(/[\s,;]+/)
        .map((e) => e.trim())
        .filter((e) => e.includes('@'));
      const { workItem } = await api.createWorkItem({
        projectId: project.id,
        refCode: refCode.trim(),
        locationRef: locationRef.trim(),
        method,
        notifyEmails,
        inspection: Object.keys(data).length ? { data } : undefined,
      });
      navigate(`/work-items/${workItem.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create work item');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="page-head">
        <h1>New work item — RDS intake</h1>
        <Link to="/" className="btn btn-ghost">Cancel</Link>
      </div>
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={submit} className="card form-card">
        <div className="method-toggle">
          {['weld', 'composite'].map((m) => (
            <button type="button" key={m} className={`toggle ${method === m ? 'active' : ''}`} onClick={() => setMethod(m)}>
              {m === 'weld' ? 'Weld / Fabrication' : 'Composite Wrap'}
            </button>
          ))}
        </div>
        <p className="muted">Method selects the RDS template below — and nothing else in the lifecycle.</p>

        <div className="form-row">
          <label className="field">
            <span>Ref code *</span>
            <input className="input" value={refCode} onChange={(e) => setRefCode(e.target.value)} placeholder="e.g. P14-WELD-01" required />
          </label>
          <label className="field">
            <span>Location</span>
            <input className="input" value={locationRef} onChange={(e) => setLocationRef(e.target.value)} placeholder="e.g. Pile P-14, splash zone" />
          </label>
        </div>

        <label className="field">
          <span>Notify (extra emails)</span>
          <input className="input" value={notify} onChange={(e) => setNotify(e.target.value)}
            placeholder="engineer@example.com, client@example.com" />
          <span className="tform-help">
            Optional. These addresses are emailed — alongside the responsible role — at each step that needs them
            (spec, execution, QA sign-off, close). Separate with commas.
          </span>
        </label>

        <h3 className="section-title">{def?.title || 'Repair Detail Sheet'}</h3>
        {def ? <TemplateForm definition={def} value={data} onChange={setData} /> : <p className="muted">Loading template…</p>}

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={busy || !project}>
            {busy ? 'Creating…' : 'Create work item (find)'}
          </button>
        </div>
      </form>
    </div>
  );
}

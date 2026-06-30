import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import EventTimeline from '../components/EventTimeline';

export default function TimelinePage() {
  const [project, setProject] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { projects } = await api.listProjects();
        if (!projects.length) { setLoading(false); return; }
        setProject(projects[0]);
        const { events } = await api.projectEvents(projects[0].id);
        setEvents(events);
      } catch (err) {
        setError(err.message || 'Failed to load timeline');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="spinner-page"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Event timeline</h1>
          {project && <p className="muted">{project.name} — append-only audit trail</p>}
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card section">
        <EventTimeline events={events} showWorkItem />
      </div>
    </div>
  );
}

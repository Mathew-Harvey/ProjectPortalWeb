import { fmtDate } from './ui';

// Human labels for event types from the append-only log.
const TYPE_LABELS = {
  'work_item.created': 'Work item created from RDS',
  'work_item.status_changed': 'Status changed',
  'work_item.closed': 'Work item closed',
  'inspection.captured': 'RDS / inspection captured',
  'spec.submitted': 'Engineering spec submitted',
  'spec.approved': 'Engineering spec approved (gate)',
  'hold_point.signed': 'ITP hold point signed',
  'qa.captured': 'QA captured',
  'qa.client_signed': 'Client signed off QA',
  'media.uploaded': 'Evidence uploaded',
};

function describe(e) {
  const p = e.payload || {};
  switch (e.type) {
    case 'work_item.status_changed': return `${p.from} → ${p.to}`;
    case 'hold_point.signed': return p.label || '';
    case 'media.uploaded': return `${p.filename || p.mime || 'file'} · sha256 ${(p.sha256 || '').slice(0, 12)}…`;
    case 'inspection.captured': return p.templateKey || '';
    default: return '';
  }
}

export default function EventTimeline({ events, showWorkItem }) {
  if (!events || events.length === 0) return <p className="muted">No events yet.</p>;
  return (
    <ul className="timeline">
      {events.map((e) => (
        <li className="timeline-row" key={e.id}>
          <div className="timeline-dot" />
          <div className="timeline-body">
            <div className="timeline-head">
              <span className="timeline-type">{TYPE_LABELS[e.type] || e.type}</span>
              <span className="timeline-time">{fmtDate(e.created_at)}</span>
            </div>
            <div className="timeline-meta">
              <span className="timeline-actor">
                {e.actor_name || 'system'}{e.actor_role ? ` · ${e.actor_role}` : ''}
              </span>
              {describe(e) && <span className="timeline-detail"> — {describe(e)}</span>}
              {showWorkItem && e.work_item_id && (
                <span className="timeline-detail"> · item {String(e.work_item_id).slice(0, 8)}</span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

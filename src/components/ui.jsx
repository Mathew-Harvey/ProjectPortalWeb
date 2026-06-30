// Small shared presentational helpers used across pages.

export const LIFECYCLE = ['find', 'engineer', 'fix', 'verify', 'closed'];

export const STATUS_LABELS = {
  find: 'Find',
  engineer: 'Engineer',
  fix: 'Fix',
  verify: 'Verify',
  closed: 'Closed',
};

export function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{STATUS_LABELS[status] || status}</span>;
}

export function MethodBadge({ method }) {
  return <span className={`method-badge method-${method}`}>{method === 'weld' ? 'Weld / Fabrication' : 'Composite Wrap'}</span>;
}

// Horizontal lifecycle stepper highlighting the current status.
export function LifecycleStepper({ status }) {
  const currentIdx = LIFECYCLE.indexOf(status);
  return (
    <ol className="stepper">
      {LIFECYCLE.map((step, idx) => {
        const state = idx < currentIdx ? 'done' : idx === currentIdx ? 'current' : 'todo';
        return (
          <li key={step} className={`step step-${state}`}>
            <span className="step-dot">{idx < currentIdx ? '✓' : idx + 1}</span>
            <span className="step-label">{STATUS_LABELS[step]}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function fmtDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleString();
}

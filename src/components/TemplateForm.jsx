// Renders a form purely from a template definition's `fields` array, so the
// inputs are template-driven (config), never hardcoded per method. Used for RDS
// intake and QA capture.
//
// field: { key, label, type, options?, required?, unit?, help? }
//   type: text | textarea | number | select | checkbox | date

export default function TemplateForm({ definition, value, onChange, disabled }) {
  const fields = definition?.fields || [];

  function set(key, v) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="tform">
      {fields.map((f) => {
        const v = value[f.key] ?? '';
        return (
          <label key={f.key} className="tform-field">
            <span className="tform-label">
              {f.label}
              {f.unit ? <span className="tform-unit"> ({f.unit})</span> : null}
              {f.required ? <span className="tform-req">*</span> : null}
            </span>

            {f.type === 'textarea' && (
              <textarea
                className="input" rows={3} value={v} disabled={disabled}
                onChange={(e) => set(f.key, e.target.value)}
              />
            )}

            {f.type === 'select' && (
              <select className="input" value={v} disabled={disabled} onChange={(e) => set(f.key, e.target.value)}>
                <option value="">— select —</option>
                {(f.options || []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            )}

            {f.type === 'checkbox' && (
              <input type="checkbox" checked={!!v} disabled={disabled} onChange={(e) => set(f.key, e.target.checked)} />
            )}

            {(f.type === 'number') && (
              <input
                className="input" type="number" value={v} disabled={disabled}
                onChange={(e) => set(f.key, e.target.value === '' ? '' : Number(e.target.value))}
              />
            )}

            {(f.type === 'date') && (
              <input className="input" type="date" value={v} disabled={disabled} onChange={(e) => set(f.key, e.target.value)} />
            )}

            {(!f.type || f.type === 'text') && (
              <input className="input" type="text" value={v} disabled={disabled} onChange={(e) => set(f.key, e.target.value)} />
            )}

            {f.help && <span className="tform-help">{f.help}</span>}
          </label>
        );
      })}
    </div>
  );
}

// Read-only rendering of captured data against a definition (labels + values).
export function TemplateReadout({ definition, data }) {
  const fields = definition?.fields || [];
  if (!data || Object.keys(data).length === 0) return <p className="muted">No data captured.</p>;
  const rows = fields.length
    ? fields.filter((f) => data[f.key] !== undefined && data[f.key] !== '')
        .map((f) => [f.label + (f.unit ? ` (${f.unit})` : ''), data[f.key]])
    : Object.entries(data);
  return (
    <dl className="readout">
      {rows.map(([k, v]) => (
        <div className="readout-row" key={k}>
          <dt>{k}</dt>
          <dd>{typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v)}</dd>
        </div>
      ))}
    </dl>
  );
}

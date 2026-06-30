import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, mediaUrl, docpackUrl } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { LifecycleStepper, StatusBadge, MethodBadge, fmtDate } from '../components/ui';
import TemplateForm, { TemplateReadout } from '../components/TemplateForm';
import EventTimeline from '../components/EventTimeline';

export default function WorkItemPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [card, setCard] = useState(null);
  const [templates, setTemplates] = useState({ rds: null, qa: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    const data = await api.getWorkItem(id);
    setCard(data);
    return data;
  }, [id]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await reload();
        const m = data.workItem.method;
        const [rds, qa] = await Promise.all([api.listTemplates(m, 'rds'), api.listTemplates(m, 'qa')]);
        setTemplates({ rds: rds.templates[0]?.definition || null, qa: qa.templates[0]?.definition || null });
      } catch (err) {
        setError(err.message || 'Failed to load work item');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, reload]);

  if (loading) return <div className="spinner-page"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!card) return null;

  const { workItem: w, inspection, specs, holdPoints, qa, media, events } = card;
  const approvedSpec = specs.find((s) => s.status === 'approved');
  const draftSpec = specs.find((s) => s.status === 'draft');
  const gateOpen = w.status === 'fix' || w.status === 'verify' || w.status === 'closed';
  const isClient = user.role === 'client';

  return (
    <div>
      <div className="page-head">
        <div>
          <Link to="/" className="back-link">← Register</Link>
          <h1 className="wi-title">{w.ref_code} <StatusBadge status={w.status} /></h1>
          <p className="muted">{w.location_ref || 'No location'} · <MethodBadge method={w.method} /></p>
        </div>
        <a className="btn btn-ghost" href={docpackUrl(w.id)} target="_blank" rel="noreferrer">Export doc pack (PDF)</a>
      </div>

      <div className="card"><LifecycleStepper status={w.status} /></div>

      <div className="wi-columns">
        <div className="wi-main">
          {/* RDS */}
          <section className="card section">
            <h2 className="section-title">Repair Detail Sheet (RDS)</h2>
            {inspection
              ? <TemplateReadout definition={templates.rds} data={inspection.data} />
              : <p className="muted">No RDS captured.</p>}
            {inspection && <p className="muted small">Captured by {inspection.captured_by ? '' : ''}{fmtDate(inspection.captured_at)}</p>}
          </section>

          {/* Engineer gate */}
          <SpecSection
            workItem={w} specs={specs} approvedSpec={approvedSpec} draftSpec={draftSpec}
            user={user} onChange={reload} setError={setError}
          />

          {/* ITP checklist */}
          <HoldPointsSection
            workItem={w} holdPoints={holdPoints} gateOpen={gateOpen} user={user} onChange={reload} setError={setError}
          />

          {/* QA */}
          <QaSection
            workItem={w} qa={qa} qaDef={templates.qa} user={user} onChange={reload} setError={setError}
          />

          {/* Close */}
          {user.role === 'admin_pm' && w.status === 'verify' && (
            <section className="card section">
              <h2 className="section-title">Close out</h2>
              <p className="muted">QA verified. Close the work item to finish the lifecycle.</p>
              <button className="btn btn-primary" onClick={async () => {
                try { await api.closeWorkItem(w.id); await reload(); } catch (e) { setError(e.message); }
              }}>Close work item</button>
            </section>
          )}
        </div>

        <aside className="wi-side">
          <EvidenceSection workItem={w} media={media} user={user} onChange={reload} setError={setError} isClient={isClient} />
          <section className="card section">
            <h2 className="section-title">Event timeline</h2>
            <EventTimeline events={events} />
          </section>
        </aside>
      </div>
    </div>
  );
}

// ── Engineer gate ───────────────────────────────────────────────────
function SpecSection({ workItem: w, specs, approvedSpec, draftSpec, user, onChange, setError }) {
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const isEngineer = user.role === 'engineer';
  const canSubmit = isEngineer && ['find', 'engineer'].includes(w.status);

  async function submitSpec(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      let docMediaId;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const up = await api.uploadMedia(w.id, fd);
        docMediaId = up.media.id;
      }
      await api.submitSpec(w.id, { notes, docMediaId });
      setNotes(''); setFile(null);
      await onChange();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  async function approve(specId) {
    setBusy(true); setError('');
    try { await api.approveSpec(w.id, specId); await onChange(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <section className="card section">
      <h2 className="section-title">Engineering specification <span className="gate-tag">approval gate</span></h2>

      {approvedSpec ? (
        <div className="alert alert-ok">
          Spec approved by {approvedSpec.approver_name || 'engineer'} on {fmtDate(approvedSpec.approved_at)}. Execution unlocked.
        </div>
      ) : (
        <div className="alert alert-wait">
          Execution (fix) is locked until an engineer approves the spec.
        </div>
      )}

      {specs.length > 0 && (
        <ul className="spec-list">
          {specs.map((s) => (
            <li key={s.id} className={`spec-row spec-${s.status}`}>
              <span className="spec-status">{s.status}</span>
              <span className="spec-notes">{s.notes || '(no notes)'}</span>
              {s.engineer_name && <span className="muted small">by {s.engineer_name}</span>}
              {s.doc_media_id && <a className="link small" href={mediaUrl(w.id, s.doc_media_id)} target="_blank" rel="noreferrer">spec doc</a>}
              {isEngineer && s.status === 'draft' && (
                <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => approve(s.id)}>Approve</button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canSubmit && (
        <form onSubmit={submitSpec} className="subform">
          <h3 className="subform-title">{draftSpec ? 'Resubmit spec' : 'Submit spec'}</h3>
          <label className="field">
            <span>Specification notes</span>
            <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Doubler plate per drawing D-14, 8mm fillet…" />
          </label>
          <label className="field">
            <span>Spec document (optional)</span>
            <input className="input" type="file" onChange={(e) => setFile(e.target.files[0] || null)} />
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy}>Submit spec</button>
        </form>
      )}
    </section>
  );
}

// ── ITP checklist ───────────────────────────────────────────────────
function HoldPointsSection({ workItem: w, holdPoints, gateOpen, user, onChange, setError }) {
  const [busy, setBusy] = useState(null);
  const isField = user.role === 'field';

  async function sign(hpId) {
    setBusy(hpId); setError('');
    try { await api.signHoldPoint(w.id, hpId); await onChange(); }
    catch (err) { setError(err.message); } finally { setBusy(null); }
  }

  return (
    <section className="card section">
      <h2 className="section-title">ITP hold points</h2>
      {!gateOpen && <p className="muted small">Sign-off unlocks once the spec is approved (status fix).</p>}
      <ul className="itp-list">
        {holdPoints.map((hp) => (
          <li key={hp.id} className={`itp-row ${hp.signed_at ? 'signed' : ''}`}>
            <span className="itp-seq">{hp.sequence}</span>
            <span className="itp-label">{hp.label}</span>
            {hp.signed_at ? (
              <span className="itp-sign muted small">✓ {hp.signer_name || 'signed'} · {fmtDate(hp.signed_at)}</span>
            ) : isField ? (
              <button className="btn btn-sm" disabled={!gateOpen || busy === hp.id} onClick={() => sign(hp.id)}>
                {gateOpen ? 'Sign' : 'Locked'}
              </button>
            ) : (
              <span className="muted small">unsigned</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── QA capture + client sign ────────────────────────────────────────
function QaSection({ workItem: w, qa, qaDef, user, onChange, setError }) {
  const [data, setData] = useState({});
  const [busy, setBusy] = useState(false);
  const canCapture = ['field', 'admin_pm'].includes(user.role) && w.status === 'fix';
  const isClient = user.role === 'client';

  async function capture(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try { await api.captureQa(w.id, { data }); setData({}); await onChange(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  async function clientSign() {
    setBusy(true); setError('');
    try { await api.clientSignQa(w.id, qa.id); await onChange(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <section className="card section">
      <h2 className="section-title">QA record</h2>
      {qa ? (
        <>
          <TemplateReadout definition={qaDef} data={qa.data} />
          <p className="muted small">
            Signed off {fmtDate(qa.signed_off_at)} · Client sign-off: {qa.client_sign_at ? fmtDate(qa.client_sign_at) : 'pending'}
          </p>
          {isClient && !qa.client_sign_at && (
            <button className="btn btn-primary" disabled={busy} onClick={clientSign}>Client sign-off</button>
          )}
        </>
      ) : canCapture ? (
        <form onSubmit={capture} className="subform">
          {qaDef ? <TemplateForm definition={qaDef} value={data} onChange={setData} /> : <p className="muted">Loading…</p>}
          <button className="btn btn-primary" type="submit" disabled={busy}>Capture QA (→ verify)</button>
        </form>
      ) : (
        <p className="muted">QA is captured during the fix stage.</p>
      )}
    </section>
  );
}

// ── Evidence / media ────────────────────────────────────────────────
function EvidenceSection({ workItem: w, media, user, onChange, setError, isClient }) {
  const [busy, setBusy] = useState(false);
  const canUpload = ['admin_pm', 'engineer', 'field'].includes(user.role);

  async function upload(e) {
    const f = e.target.files[0];
    if (!f) return;
    setBusy(true); setError('');
    try {
      const fd = new FormData();
      fd.append('file', f);
      await api.uploadMedia(w.id, fd);
      await onChange();
    } catch (err) { setError(err.message); } finally { setBusy(false); e.target.value = ''; }
  }

  return (
    <section className="card section">
      <h2 className="section-title">Evidence</h2>
      {media.length === 0 ? <p className="muted">No evidence uploaded.</p> : (
        <ul className="media-list">
          {media.map((m) => (
            <li key={m.id} className="media-row">
              <a className="link" href={mediaUrl(w.id, m.id)} target="_blank" rel="noreferrer">
                {m.original_filename || m.mime || 'file'}
              </a>
              <span className="muted small">sha256 {(m.sha256 || '').slice(0, 10)}… · {fmtDate(m.captured_at || m.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
      {canUpload && !isClient && (
        <label className="upload-btn">
          {busy ? 'Uploading…' : '+ Upload evidence'}
          <input type="file" hidden onChange={upload} disabled={busy} />
        </label>
      )}
    </section>
  );
}

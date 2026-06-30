// In-app help: teaches the PRINCE2 basics this portal is built on, and shows
// where each idea lives in the app. Screenshots live in /public/help.

function Figure({ src, alt, caption }) {
  return (
    <figure className="help-fig">
      <img src={src} alt={alt} loading="lazy" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export default function HelpPage() {
  return (
    <div className="help-doc">
      <div className="page-head">
        <div>
          <h1>How this portal works — PRINCE2 in practice</h1>
          <p className="muted">
            A plain-English guide to the project-management method behind the portal, and exactly
            where each idea shows up on screen.
          </p>
        </div>
      </div>

      {/* Contents */}
      <nav className="help-toc card">
        <strong>On this page</strong>
        <ol>
          <li><a href="#what">What PRINCE2 is (in 60 seconds)</a></li>
          <li><a href="#stages">Manage by stages — the repair lifecycle</a></li>
          <li><a href="#gate">The approval gate — independent assurance</a></li>
          <li><a href="#roles">Roles &amp; responsibilities</a></li>
          <li><a href="#products">Defining the product — RDS intake</a></li>
          <li><a href="#quality">Quality control — ITP hold points</a></li>
          <li><a href="#closure">Acceptance &amp; closure</a></li>
          <li><a href="#audit">The audit trail</a></li>
          <li><a href="#tailoring">Tailoring — weld vs composite</a></li>
          <li><a href="#pmbok">PMBOK equivalents</a></li>
          <li><a href="#cheatsheet">Cheat sheet</a></li>
        </ol>
      </nav>

      {/* 1. What PRINCE2 is */}
      <section id="what" className="card help-section">
        <h2>1 · What PRINCE2 is (in 60 seconds)</h2>
        <p>
          <strong>PRINCE2</strong> — <em>PRojects IN Controlled Environments</em> — is a structured,
          widely-used project-management method. Its core idea is simple: a project advances in
          controlled steps, with <strong>defined responsibilities</strong>, and only proceeds when there
          is <strong>justification and the right approval</strong>. Nothing important happens by accident,
          and everything important is recorded.
        </p>
        <p>This portal applies that method to one thing: delivering a marine structural repair. Every
          defect is run as a small, controlled, fully-audited mini-project.</p>
        <div className="help-cols">
          <div className="help-pillbox">
            <h4>7 Principles</h4>
            <ul>
              <li>Continued business justification</li>
              <li>Learn from experience</li>
              <li>Defined roles &amp; responsibilities</li>
              <li>Manage by stages</li>
              <li>Manage by exception</li>
              <li>Focus on products</li>
              <li>Tailor to suit the project</li>
            </ul>
          </div>
          <div className="help-pillbox">
            <h4>7 Themes</h4>
            <ul>
              <li>Business Case</li>
              <li>Organization</li>
              <li>Quality</li>
              <li>Plans</li>
              <li>Risk</li>
              <li>Change</li>
              <li>Progress</li>
            </ul>
          </div>
          <div className="help-pillbox">
            <h4>7 Processes</h4>
            <ul>
              <li>Starting Up a Project</li>
              <li>Directing a Project</li>
              <li>Initiating a Project</li>
              <li>Controlling a Stage</li>
              <li>Managing Product Delivery</li>
              <li>Managing a Stage Boundary</li>
              <li>Closing a Project</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Manage by stages */}
      <section id="stages" className="card help-section">
        <h2>2 · Manage by stages — the repair lifecycle</h2>
        <p>
          PRINCE2 says a project should be broken into <strong>management stages</strong>, with a decision
          point at the boundary of each one. The portal hardwires exactly one such sequence for every
          repair:
        </p>
        <p className="help-flow">find → engineer → fix → verify → closed</p>
        <p>
          The stepper at the top of every work item shows where the repair has reached. A work item can
          only move forward one stage at a time, and each move is an explicit, recorded transition — this
          is <strong>“manage by stages.”</strong> Because forward movement is gated (next section), the
          board doesn’t need to micromanage day-to-day work; it only steps in at the boundaries — PRINCE2’s
          <strong> “manage by exception.”</strong>
        </p>
        <Figure src="/help/06-workitem-closed.png" alt="A completed work item showing the full lifecycle stepper"
          caption="A completed repair. The stepper (Find → Engineer → Fix → Verify → Closed) is PRINCE2’s management stages; each boundary was an authorisation point." />
      </section>

      {/* 3. The gate */}
      <section id="gate" className="card help-section">
        <h2>3 · The approval gate — independent assurance</h2>
        <p>
          The single most important control in the portal is the <strong>engineering approval gate</strong>.
          Execution (the <em>fix</em> stage and everything in it) is <strong>locked</strong> until an
          independent engineer approves the specification. This is PRINCE2’s <strong>Quality</strong> theme
          (a quality gate / “quality review &amp; sign-off”), delivered by an independent
          <strong> Project Assurance</strong> role, and it enforces <strong>“continued business
          justification”</strong> — work only proceeds once it’s been shown to be sound.
        </p>
        <Figure src="/help/04-gate-locked.png" alt="Work item with the approval gate locked"
          caption="Gate closed. The spec is still a DRAFT, so the amber banner reads “Execution (fix) is locked…”, and every ITP hold point is greyed out — no field work can be signed off yet." />
        <p>When the engineer approves the spec, the gate opens, the work item advances to <em>fix</em>, and
          the field crew can begin signing off hold points:</p>
        <Figure src="/help/05-gate-approved.png" alt="Work item with the approval gate approved and execution underway"
          caption="Gate open. “Spec approved… Execution unlocked”, the stage is now Fix, and hold points can be signed (here 2 of 5 are done)." />
      </section>

      {/* 4. Roles */}
      <section id="roles" className="card help-section">
        <h2>4 · Roles &amp; responsibilities (the Organization theme)</h2>
        <p>
          PRINCE2 insists every project has <strong>clearly defined roles</strong> so it’s always obvious
          who decides what. The portal ships four roles that map directly onto a PRINCE2 project
          organisation:
        </p>
        <table className="map-table">
          <thead><tr><th>Portal role</th><th>PRINCE2 equivalent</th><th>What they do here</th></tr></thead>
          <tbody>
            <tr><td><strong>PM / Integrator</strong> (admin_pm)</td><td>Project Manager</td><td>Raises work items from an RDS, runs the register, captures QA, closes out.</td></tr>
            <tr><td><strong>Engineer</strong></td><td>Project Assurance (independent technical assurance)</td><td>Submits and <em>approves</em> the spec — owns the gate. Independent of delivery.</td></tr>
            <tr><td><strong>Field / Diver</strong></td><td>Team Manager / Team Member</td><td>Managing Product Delivery: signs ITP hold points, captures QA, uploads evidence.</td></tr>
            <tr><td><strong>Client</strong></td><td>Senior User / Executive (customer)</td><td>Read-only oversight; provides customer acceptance (QA client sign-off).</td></tr>
          </tbody>
        </table>
        <Figure src="/help/01-login.png" alt="Sign-in screen showing the four demo roles"
          caption="The four roles. Separating the engineer (assurance) from the field crew (delivery) is what makes the approval gate genuinely independent." />
      </section>

      {/* 5. Products / RDS */}
      <section id="products" className="card help-section">
        <h2>5 · Defining the product — RDS intake</h2>
        <p>
          PRINCE2 is built around <strong>“focus on products”</strong>: before you build something, you
          describe it and the quality it must meet. A repair begins with the PM raising a work item from a
          <strong> Repair Detail Sheet (RDS)</strong> — the portal’s <strong>Product Description</strong>.
          The form itself is generated from a template, so the right questions are always asked.
        </p>
        <Figure src="/help/03-rds-intake.png" alt="RDS intake form"
          caption="RDS intake (the Find stage). This is the Product Description — what the defect is and what a good repair looks like — captured before any work is authorised." />
      </section>

      {/* 6. Quality / ITP */}
      <section id="quality" className="card help-section">
        <h2>6 · Quality control — ITP hold points</h2>
        <p>
          An <strong>Inspection &amp; Test Plan (ITP)</strong> is a list of mandatory checks that must be
          signed off at defined points during the work. In PRINCE2 terms these are <strong>quality
          controls</strong>, and each sign-off is an entry in the <strong>Quality Register</strong>. The
          portal instantiates the ITP automatically from the method’s template and only lets the field
          crew sign points off <em>after</em> the gate has opened — so quality steps can’t be skipped or
          back-dated.
        </p>
        <Figure src="/help/05-gate-approved.png" alt="ITP hold points being signed off"
          caption="ITP hold points. Each signed line records who signed and when — a live Quality Register. Until the spec is approved, every line stays locked." />
      </section>

      {/* 7. Closure */}
      <section id="closure" className="card help-section">
        <h2>7 · Acceptance &amp; closure</h2>
        <p>
          PRINCE2’s <strong>Closing a Project</strong> process confirms the product was delivered and
          <strong> accepted by the customer</strong> before the project is shut. In the portal the field
          crew captures the QA record (moving the work item to <em>verify</em>), the <strong>client signs
          it off</strong> (customer acceptance), and the PM closes it. At any point the assembled record
          can be exported as a <strong>doc pack PDF</strong> — the handover dossier.
        </p>
        <Figure src="/help/08-client-readonly.png" alt="Client read-only view of a completed work item"
          caption="The client’s read-only view. Clients see the register, evidence and timeline and provide acceptance sign-off, but never do delivery work — Senior User oversight, not execution." />
      </section>

      {/* 8. Audit */}
      <section id="audit" className="card help-section">
        <h2>8 · The audit trail (Progress &amp; Learn from experience)</h2>
        <p>
          Every state change, approval, sign-off and upload writes one line to an
          <strong> append-only event log</strong> — with the actor and a timestamp — that is never edited or
          deleted. This is PRINCE2’s <strong>Progress</strong> theme (records and reporting) and the
          backbone of <strong>“learn from experience.”</strong> For a contract, it’s the proof: a complete,
          tamper-evident history of who did what, when.
        </p>
        <Figure src="/help/07-timeline.png" alt="Project-wide event timeline"
          caption="The project timeline. Read top-to-bottom it’s the whole story of the job — every action attributable to a named person at a known time." />
      </section>

      {/* 9. Tailoring */}
      <section id="tailoring" className="card help-section">
        <h2>9 · Tailoring — weld vs composite</h2>
        <p>
          PRINCE2’s final principle is <strong>“tailor to suit the project.”</strong> The portal does this
          with one field: <code>method</code> (<strong>weld</strong> or <strong>composite</strong>). It
          selects a different set of templates — the RDS questions, the ITP hold points, the QA fields and
          the doc-pack layout — and <em>nothing else</em>. The lifecycle, the gate, the roles, the audit
          log and the client view are identical for both. You tailor the <em>products</em>, not the
          <em> process</em>.
        </p>
      </section>

      {/* 10. PMBOK */}
      <section id="pmbok" className="card help-section">
        <h2>10 · PMBOK equivalents (for PMI readers)</h2>
        <p>The same machinery maps cleanly onto the PMI / PMBOK view of a project:</p>
        <table className="map-table">
          <thead><tr><th>Portal stage / feature</th><th>PMBOK process group / concept</th></tr></thead>
          <tbody>
            <tr><td>Find — RDS intake</td><td>Initiating</td></tr>
            <tr><td>Engineer — spec submit/approve</td><td>Planning + the quality-assurance <strong>phase gate</strong> (a “kill point”)</td></tr>
            <tr><td>Fix — execution &amp; ITP</td><td>Executing + Monitoring &amp; Controlling (Quality Control)</td></tr>
            <tr><td>Verify — QA &amp; client sign-off</td><td>Validate Scope / customer acceptance</td></tr>
            <tr><td>Closed — doc pack</td><td>Closing (hand over &amp; archive records)</td></tr>
            <tr><td>Append-only event log</td><td>Project records, communications &amp; stakeholder transparency</td></tr>
            <tr><td>Roles</td><td>Stakeholder &amp; resource management</td></tr>
          </tbody>
        </table>
        <p className="muted small">
          The portal’s approval gate is exactly a PMI <strong>phase-gate</strong> review: work cannot pass
          into the next phase until the deliverable is reviewed and authorised.
        </p>
      </section>

      {/* 11. Cheat sheet */}
      <section id="cheatsheet" className="card help-section">
        <h2>11 · Cheat sheet — feature → method concept</h2>
        <table className="map-table">
          <thead><tr><th>In the portal</th><th>PRINCE2 concept</th></tr></thead>
          <tbody>
            <tr><td>Repair lifecycle (find→…→closed)</td><td>Management stages</td></tr>
            <tr><td>One-stage-at-a-time, recorded transitions</td><td>Manage by stages / by exception</td></tr>
            <tr><td>Engineering approval gate</td><td>Quality gate + independent Project Assurance + continued business justification</td></tr>
            <tr><td>RDS intake</td><td>Product Description (focus on products)</td></tr>
            <tr><td>ITP hold points &amp; sign-off</td><td>Quality controls / Quality Register</td></tr>
            <tr><td>QA + client sign-off</td><td>Customer acceptance (Closing)</td></tr>
            <tr><td>Doc-pack PDF export</td><td>Handover dossier</td></tr>
            <tr><td>Four roles</td><td>Project organisation (Organization theme)</td></tr>
            <tr><td>Append-only event log</td><td>Progress records + learn from experience</td></tr>
            <tr><td><code>method</code> selects templates</td><td>Tailor to suit the project</td></tr>
          </tbody>
        </table>
        <p className="muted small">
          PRINCE2® and PMBOK® are frameworks owned by their respective bodies; this guide explains how the
          portal’s controls correspond to those frameworks’ concepts and is not affiliated with or endorsed
          by them.
        </p>
      </section>
    </div>
  );
}

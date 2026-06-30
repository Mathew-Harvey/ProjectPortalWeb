# Franmarine Project Portal — Web

React + Vite single-page app for the Franmarine project-delivery portal (marine
structural remediation). Talks to [ProjectPortalApi](../ProjectPortalApi).
Conventions mirror the AppHub-Web reference repo — see
[`docs/CONVENTIONS.md`](docs/CONVENTIONS.md), [`docs/PLAN.md`](docs/PLAN.md) and
the brief in [`docs/BRIEF.md`](docs/BRIEF.md).

## Stack
React 18 + React Router 6, built with Vite 5. Plain JS/JSX, a single hand-written
`src/styles/global.css` (CSS variables, no component library). Auth state via a
small `AuthContext`; all API calls go through `src/utils/api.js` with
`credentials: 'include'`.

## Project layout
```
src/
  main.jsx · App.jsx (routes, ProtectedRoute/GuestRoute, ErrorBoundary)
  contexts/AuthContext.jsx
  components/  Layout.jsx · ui.jsx (stepper/badges) · TemplateForm.jsx · EventTimeline.jsx
  pages/       LoginPage · RegisterPage · DashboardPage (register) ·
               NewWorkItemPage (RDS intake) · WorkItemPage (gate/ITP/QA/evidence/timeline) ·
               TimelinePage
  utils/api.js · styles/global.css
vite.config.js  (dev proxy /api -> :3001)
```

## Screens
- **Auth + role-based shell/nav** — sign in / register; the topbar shows the
  user's role; nav adapts (PM sees "New work item").
- **Repair register** (`/`) — list of `work_item` cards with lifecycle status,
  method, spec-approval and ITP/evidence progress.
- **RDS intake** (`/work-items/new`, PM) — form rendered from the method's `rds`
  template; switching method swaps the template, nothing else.
- **Work item** (`/work-items/:id`) — lifecycle stepper, RDS readout, the
  **engineer gate** (submit/approve spec; fix actions stay locked until
  approved), template-driven **ITP checklist** with sign-off, **QA capture**, an
  **Export doc pack (PDF)** button, evidence upload, and the event timeline.
- **Client read-only** — clients see the register, evidence and timeline; create/
  upload controls are hidden and they get only the QA client sign-off action.
- **Event timeline** (`/timeline`) — project-wide append-only audit trail.

Forms (RDS, QA) and the ITP checklist are **template-driven** from the API's
`template` definitions, so switching `method` (weld ↔ composite) changes only the
forms / hold points / QA / doc-pack — never the lifecycle, gate, log, roles or
client view.

## Setup & run
```bash
npm install
npm run dev        # http://localhost:5173 (proxies /api -> http://localhost:3001)
npm run build      # -> dist/
npm run preview    # preview the production build
```
Run the API ([ProjectPortalApi](../ProjectPortalApi)) on port 3001 alongside.

## Environment
- `VITE_API_URL` — blank for local dev (the Vite proxy handles `/api`). In
  production set it to the API service URL. See [`.env.example`](.env.example).

## Demo logins
Password `Password123` (or the API's `SEED_PASSWORD`):
`pm@franmarine.com.au` · `engineer@franmarine.com.au` · `field@franmarine.com.au`
· `client@franmarine.com.au`.

## Deploy (Render — Static Site)
1. Create a **Static Site** pointing at this repo.
2. Build command: `npm install && npm run build`
3. Publish directory: `dist`
4. Environment: `VITE_API_URL=https://YOUR-PROJECTPORTAL-API.onrender.com`
5. Add a rewrite rule `/* -> /index.html` (status `200`) for SPA routing.

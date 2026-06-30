// Centralized API client. Every call goes through `request`, which sends the
// auth cookie (`credentials: 'include'`) and throws structured errors. Mirrors
// AppHub-Web's src/utils/api.js.

const API_HOST = import.meta.env.VITE_API_URL || '';
const API_BASE = `${API_HOST}/api`;

// Endpoints where a 401 is a normal outcome (probing the session, wrong
// password) and must NOT trigger the session-expired sign-out path.
const AUTH_OPEN_PATHS = new Set(['/auth/login', '/auth/register', '/auth/me']);

function notifySessionExpired(detail) {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('portal:session-expired', { detail }));
  } catch {
    /* ignore */
  }
}

async function request(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const config = {
    credentials: 'include',
    cache: 'no-store',
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  };

  const res = await fetch(`${API_BASE}${url}`, config);

  let data = {};
  if (res.status !== 204) {
    const text = await res.text();
    if (text) {
      try { data = JSON.parse(text); } catch { data = {}; }
    }
  }

  if (!res.ok) {
    if (res.status === 401 && !AUTH_OPEN_PATHS.has(url)) {
      notifySessionExpired({ url, error: data.error });
    }
    const err = new Error(data.message || data.error || 'Request failed');
    Object.assign(err, { status: res.status, ...data });
    throw err;
  }
  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  // Projects
  listProjects: () => request('/projects'),
  listWorkItems: (projectId) => request(`/projects/${projectId}/work-items`),
  projectEvents: (projectId) => request(`/projects/${projectId}/events`),

  // Templates
  listTemplates: (method, kind) => {
    const q = new URLSearchParams();
    if (method) q.set('method', method);
    if (kind) q.set('kind', kind);
    return request(`/templates?${q.toString()}`);
  },

  // Work items / lifecycle
  createWorkItem: (body) => request('/work-items', { method: 'POST', body: JSON.stringify(body) }),
  getWorkItem: (id) => request(`/work-items/${id}`),
  workItemEvents: (id) => request(`/work-items/${id}/events`),
  captureInspection: (id, body) => request(`/work-items/${id}/inspection`, { method: 'POST', body: JSON.stringify(body) }),
  submitSpec: (id, body) => request(`/work-items/${id}/spec`, { method: 'POST', body: JSON.stringify(body) }),
  approveSpec: (id, specId) => request(`/work-items/${id}/spec/${specId}/approve`, { method: 'POST' }),
  signHoldPoint: (id, hpId) => request(`/work-items/${id}/hold-points/${hpId}/sign`, { method: 'POST' }),
  captureQa: (id, body) => request(`/work-items/${id}/qa`, { method: 'POST', body: JSON.stringify(body) }),
  clientSignQa: (id, qaId) => request(`/work-items/${id}/qa/${qaId}/client-sign`, { method: 'POST' }),
  closeWorkItem: (id) => request(`/work-items/${id}/close`, { method: 'POST' }),
  uploadMedia: (id, formData) => request(`/work-items/${id}/media`, { method: 'POST', body: formData }),
};

// Absolute URLs for direct browser navigation (media stream, doc-pack download).
export function mediaUrl(workItemId, mediaId) {
  return `${API_BASE}/work-items/${workItemId}/media/${mediaId}`;
}
export function docpackUrl(workItemId) {
  return `${API_BASE}/work-items/${workItemId}/docpack`;
}

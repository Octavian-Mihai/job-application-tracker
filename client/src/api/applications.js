/** Error carrying the server's per-field validation messages (HTTP 422). */
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const res = await fetch(`/api/applications${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.error?.message || `Request failed (${res.status})`, res.status, data?.error?.details);
  }
  return data;
}

export const listApplications = (status) => request(status ? `?status=${encodeURIComponent(status)}` : '');
export const getStats = () => request('/stats');
export const createApplication = (body) => request('', { method: 'POST', body: JSON.stringify(body) });
export const updateApplication = (id, body) => request(`/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const deleteApplication = (id) => request(`/${id}`, { method: 'DELETE' });

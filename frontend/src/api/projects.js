const API_URL = "/api";

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  }).catch(() => { throw new Error("Cannot reach the backend. Start PostgreSQL and the backend service, then retry."); });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(response.status === 502 || response.status === 503 ? "The backend is unavailable. Start PostgreSQL and the backend on port 5000, then retry." : body.message || `Request failed (${response.status}).`);
    error.response = { data: body };
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

export const getProjects = async () => {
  return request("/projects");
};

export const getProject = async (id) => {
  return request(`/projects/${id}`);
};

export const createProject = async (project) => {
  return request("/projects", { method: "POST", body: JSON.stringify(project) });
};

export const updateProject = async (id, project) => {
  return request(`/projects/${id}`, { method: "PUT", body: JSON.stringify(project) });
};

export const deleteProject = async (id) => {
  return request(`/projects/${id}`, { method: "DELETE" });
};

export const getReferenceData = async () => request("/reference-data");
export const predictProjectRisk = async (id) => request(`/projects/${id}/predict`, { method: "POST" });

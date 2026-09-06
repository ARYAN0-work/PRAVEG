const API_URL = "/api";

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.message || "Request failed.");
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

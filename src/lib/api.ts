const API_URL = "http://localhost:3001/api";

export const api = {
  getNotes: () => fetch(`${API_URL}/notes`).then(r => r.json()),
  createNote: (data: any) =>
    fetch(`${API_URL}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  
  updateNote: (id: number, data: any) =>
    fetch(`${API_URL}/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  deleteNote: (id: number) =>
    fetch(`${API_URL}/notes/${id}`, { method: "DELETE" }).then(r => r.json()),

  getDayPlans: () => fetch(`${API_URL}/dayplans`).then(r => r.json()),
  saveDayPlan: (date: string, data: any) =>
    fetch(`${API_URL}/dayplans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, ...data }),
    }).then(r => r.json()),

  deleteDayPlan: (date: string) =>
    fetch(`${API_URL}/dayplans/${date}`, { method: "DELETE" }),

  getProjects: () => fetch(`${API_URL}/projects`).then(r => r.json()),
  createProject: (data: any) =>
    fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  updateProject: (id: number, data: any) =>
    fetch(`${API_URL}/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  deleteProject: (id: number) =>
    fetch(`${API_URL}/projects/${id}`, { method: "DELETE" }).then(r => r.json()),

  getProjectTypes: () => fetch(`${API_URL}/project-types`).then(r => r.json()),
  createProjectType: (data: any) =>
    fetch(`${API_URL}/project-types`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  getStats: (month?: string) => 
    fetch(`${API_URL}/stats${month ? `?month=${month}` : ''}`).then(r => r.json()),

  getGoals: () => fetch(`${API_URL}/goals`).then(r => r.json()),
  saveGoal: (data: { month: string; targetAmount: number }) =>
    fetch(`${API_URL}/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  deleteGoal: (id: number) =>
    fetch(`${API_URL}/goals/${id}`, { method: "DELETE" }).then(r => r.json()),

  toggleProject: (id: number, completionDate?: string | null) =>
    fetch(`${API_URL}/projects/${id}/toggle`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completionDate }),
    }).then(r => r.json()),
};
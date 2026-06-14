import api from "./api";

export const agentService = {
  getAgents: () => api.get("/api/agents"),
  createAgent: (data) => api.post("/api/agents", data),
  updateAgent: (id, data) => api.put(`/api/agents/${id}`, data),
  deleteAgent: (id) => api.delete(`/api/agents/${id}`),
};

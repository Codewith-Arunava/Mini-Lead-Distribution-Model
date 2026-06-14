import api from "./api";

export const authService = {
  login: (credentials) => api.post("/api/auth/login", credentials),
  logout: () => api.post("/api/auth/logout"),
  me: () => api.get("/api/auth/me"),
};

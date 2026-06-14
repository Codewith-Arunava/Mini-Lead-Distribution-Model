import api from "./api";

export const analyticsService = {
  getAnalytics: () => api.get("/api/analytics"),
};

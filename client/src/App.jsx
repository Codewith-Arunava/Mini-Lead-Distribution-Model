import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute, AdminRoute, AgentRoute } from "./routes/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

// Pages
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import Agents from "./pages/admin/Agents";
import AdminLeads from "./pages/admin/Leads";
import ImportCSV from "./pages/admin/ImportCSV";
import Analytics from "./pages/admin/Analytics";
import AgentDashboard from "./pages/agent/Dashboard";
import MyLeads from "./pages/agent/MyLeads";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/agents" element={<Agents />} />
                <Route path="/admin/leads" element={<AdminLeads />} />
                <Route path="/admin/import" element={<ImportCSV />} />
                <Route path="/admin/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Agent Routes */}
            <Route element={<AgentRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/agent/dashboard" element={<AgentDashboard />} />
                <Route path="/agent/leads" element={<MyLeads />} />
              </Route>
            </Route>

            {/* Shared: Profile (any authenticated user) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>

        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            className: "font-sans",
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Spinner for loading state
function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading LeadFlow...</p>
      </div>
    </div>
  );
}

// Base protected route
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

// Admin-only route
export function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/agent/dashboard" replace />;
  return <Outlet />;
}

// Agent-only route
export function AgentRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "agent") return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}

import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, Upload, BarChart3,
  User, LogOut, Zap, ChevronLeft, ChevronRight, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const adminLinks = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/agents", icon: Users, label: "Agents" },
  { to: "/admin/leads", icon: FileText, label: "Leads" },
  { to: "/admin/import", icon: Upload, label: "Import CSV" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

const agentLinks = [
  { to: "/agent/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/agent/leads", icon: FileText, label: "My Leads" },
];

export default function Sidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === "admin" ? adminLinks : agentLinks;

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out",
          "sidebar-gradient border-r border-white/10",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center h-16 border-b border-white/10 px-4", collapsed ? "justify-center" : "gap-3")}>
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-white text-lg tracking-tight">LeadFlow</span>
          )}
          {/* Mobile close */}
          {mobileOpen && !collapsed && (
            <button onClick={onMobileClose} className="ml-auto lg:hidden text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => onMobileClose?.()}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  collapsed ? "justify-center" : "",
                  isActive
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110", isActive && "text-white")} />
                  {!collapsed && <span className="text-sm font-medium">{label}</span>}
                  {collapsed && (
                    <div className="absolute left-16 bg-gray-900 text-white text-xs rounded-md px-2 py-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      {label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/10 p-2 space-y-1">
          <NavLink
            to="/profile"
            onClick={() => onMobileClose?.()}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                collapsed ? "justify-center" : "",
                isActive ? "bg-white/20 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
              )
            }
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Profile</span>}
          </NavLink>

          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              "text-red-400 hover:bg-red-500/10 hover:text-red-300",
              collapsed ? "justify-center" : ""
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={onCollapse}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-primary rounded-full items-center justify-center text-white shadow-md hover:bg-primary/90 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
}

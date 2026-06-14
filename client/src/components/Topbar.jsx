import { useState } from "react";
import { Menu, Sun, Moon, Bell, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";

export default function Topbar({ onMobileMenuOpen, sidebarCollapsed }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 z-20 flex items-center gap-4 px-4 border-b bg-background/80 backdrop-blur-sm transition-all duration-300",
        sidebarCollapsed ? "left-16" : "left-0 lg:left-64"
      )}
    >
      {/* Mobile hamburger */}
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMobileMenuOpen}>
        <Menu className="w-5 h-5" />
      </Button>

      {/* Search */}
      <div className={cn("flex-1 max-w-md transition-all duration-200", searchOpen ? "opacity-100" : "opacity-100")}>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads, agents..."
            className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Search className="w-5 h-5" />
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold shadow-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Users, Shield, CalendarDays, Trophy, BarChart3, LogIn, LogOut, Activity } from "lucide-react";
import { logout, useAuth } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/players", label: "Players", icon: Users },
  { to: "/teams", label: "Teams", icon: Shield },
  { to: "/matches", label: "Matches", icon: CalendarDays },
  { to: "/tournaments", label: "Tournaments", icon: Trophy },
  { to: "/stats", label: "Statistics", icon: BarChart3 },
] as const;

export function AppLayout() {
  const loc = useLocation();
  const authed = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="size-9 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
              <Activity className="size-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Sports<span className="text-primary">OPS</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = loc.pathname === to || (to !== "/" && loc.pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                    active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {authed ? (
              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-secondary hover:bg-secondary/70 transition"
              >
                <LogOut className="size-4" /> <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-gradient-primary text-primary-foreground font-semibold hover:shadow-glow transition"
              >
                <LogIn className="size-4" /> Admin
              </Link>
            )}
          </div>
        </div>

        {/* mobile nav */}
        <nav className="md:hidden border-t border-border overflow-x-auto">
          <div className="flex gap-1 px-3 py-2 min-w-max">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = loc.pathname === to || (to !== "/" && loc.pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 whitespace-nowrap ${
                    active ? "bg-secondary text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        SportsOPS — Sports Management System • Built with TanStack Start
      </footer>

      <Toaster theme="dark" position="top-right" />
    </div>
  );
}

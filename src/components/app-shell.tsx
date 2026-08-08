import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  MessageSquareText,
  Dumbbell,
  GraduationCap,
  TrendingUp,
  History,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { navItems, user } from "@/lib/interview-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  MessageSquareText,
  Dumbbell,
  GraduationCap,
  TrendingUp,
  History,
  Settings,
};

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Sparkles className="size-4" />
      </div>
      <div className="leading-none">
        <span className="block text-[13px] font-semibold tracking-tight">Mainframe Coach</span>
        <span className="block text-[10px] font-medium text-muted-foreground">Interview Readiness</span>
      </div>
    </div>
  );
}

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to: string) =>
    pathname === to || (to !== "/dashboard" && pathname.startsWith(to));

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] ?? LayoutDashboard;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className="group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors"
                style={
                  active
                    ? { background: "var(--sidebar-accent)", color: "var(--sidebar-accent-foreground)" }
                    : { color: "var(--muted-foreground)" }
                }
              >
                <Icon
                  className="size-4 shrink-0"
                  style={active ? { color: "var(--primary)" } : undefined}
                />
                <span className={active ? "font-semibold" : ""}>{item.title}</span>
                {active && (
                  <span className="ml-auto size-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary ring-1 ring-primary/20">
              {user.initials}
            </div>
            <div className="min-w-0 leading-tight">
              <span className="block truncate text-[12px] font-semibold">{user.fullName}</span>
              <span className="block text-[10px] text-muted-foreground">{user.plan} Plan</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border bg-sidebar">
            <div className="flex items-center justify-between px-5 py-5">
              <Logo />
              <button
                onClick={() => setMobileOpen(false)}
                className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 px-3">
              {navItems.map((item) => {
                const Icon = iconMap[item.icon] ?? LayoutDashboard;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors"
                    style={
                      active
                        ? { background: "var(--sidebar-accent)", color: "var(--sidebar-accent-foreground)" }
                        : { color: "var(--muted-foreground)" }
                    }
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className={active ? "font-semibold" : ""}>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted lg:hidden"
            >
              <Menu className="size-4" />
            </button>
            <h1 className="truncate text-sm font-semibold text-foreground">{title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button className="hidden size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:grid">
              <Search className="size-4" />
            </button>
            <button className="relative grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
            </button>
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary ring-1 ring-primary/20">
              {user.initials}
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

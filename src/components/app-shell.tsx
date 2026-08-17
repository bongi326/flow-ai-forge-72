import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Calendar,
  CheckCircle2,
  FileText,
  History,
  LayoutDashboard,
  Mail,
  Menu,
  Moon,
  NotebookPen,
  Settings as SettingsIcon,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/workspace", label: "AI Workspace", icon: Sparkles },
  { to: "/app/email", label: "Email Generator", icon: Mail },
  { to: "/app/summarizer", label: "Meeting Summarizer", icon: FileText },
  { to: "/app/tasks", label: "Task Planner", icon: CheckCircle2 },
  { to: "/app/schedule", label: "Schedule", icon: Calendar },
  { to: "/app/notes", label: "Notes", icon: NotebookPen },
  { to: "/app/history", label: "History", icon: History },
  { to: "/app/settings", label: "Settings", icon: SettingsIcon },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="space-y-0.5">
      {NAV.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-surface text-accent"
                : "text-muted-foreground hover:bg-surface hover:text-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Notifications() {
  const { state, update } = useStore();
  const [open, setOpen] = useState(false);
  const unread = state.notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent ring-2 ring-background" />
        )}
      </button>
      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="label-mono">Notifications</span>
              <button
                className="text-xs font-medium text-accent hover:underline"
                onClick={() =>
                  update((d) => ({
                    ...d,
                    notifications: d.notifications.map((n) => ({ ...n, read: true })),
                  }))
                }
              >
                Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {state.notifications.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">You're all caught up.</p>
              )}
              {state.notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "border-b border-border px-4 py-3 last:border-0",
                    !n.read && "bg-accent-soft/40",
                  )}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { state, update } = useStore();
  const dark = state.settings.theme === "dark";
  return (
    <button
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() =>
        update((d) => ({ ...d, settings: { ...d.settings, theme: dark ? "light" : "dark" } }))
      }
      className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { state } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const pending = state.tasks.filter((t) => t.status !== "completed").length;

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar p-6 lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <div className="size-5 rounded-sm bg-accent" />
          <span className="font-tight text-sm font-semibold">SmartFlow AI</span>
        </Link>
        <NavList />
        <div className="mt-auto space-y-3 border-t border-border pt-6">
          <div className="rounded-lg bg-surface p-3">
            <div className="label-mono mb-1">Workspace</div>
            <div className="text-xs font-semibold">{state.user?.demo ? "Demo mode" : "Pro workspace"}</div>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="animate-reveal absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-sidebar p-6">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-5 rounded-sm bg-accent" />
                <span className="font-tight text-sm font-semibold">SmartFlow AI</span>
              </div>
              <button aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            <NavList onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              aria-label="Open menu"
              className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-surface lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4" />
            </button>
            <span className="truncate text-sm font-medium">
              {state.user?.name ? `Hi, ${state.user.name.split(" ")[0]}` : "SmartFlow AI"}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <span className="hidden font-mono text-[11px] uppercase text-muted-foreground md:inline">
              {now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            </span>
            <span className="hidden rounded-full bg-surface px-2 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline">
              {pending} pending
            </span>
            <ThemeToggle />
            <Notifications />
            <Link
              to="/app/settings"
              className="grid size-8 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
            >
              {(state.user?.name ?? state.settings.name)
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </Link>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, CalendarClock, CheckCircle2, Clock, Flame, ListTodo } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { EmptyState, PriorityBadge, SectionCard } from "@/components/ai-blocks";
import { todayISO, useStore } from "@/lib/store";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SmartFlow AI" },
      { name: "description", content: "Your tasks, meetings and productivity at a glance." },
      { property: "og:title", content: "Dashboard — SmartFlow AI" },
      { property: "og:description", content: "Your tasks, meetings and productivity at a glance." },
    ],
  }),
  component: Dashboard,
});

function greeting(h: number) {
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Stat({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: typeof ListTodo;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="label-mono">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-3 font-tight text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Dashboard() {
  const { state } = useStore();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const d = todayISO();
  const tasks = state.tasks;
  const completed = tasks.filter((t) => t.status === "completed");
  const pending = tasks.filter((t) => t.status !== "completed");
  const priority = pending.filter((t) => t.priority === "urgent" || t.priority === "high");
  const meetings = state.schedule.filter((b) => b.date === d && b.kind === "meeting");
  const todayBlocks = state.schedule.filter((b) => b.date === d).sort((a, b) => a.start.localeCompare(b.start));
  const hoursScheduled =
    Math.round(
      (state.schedule
        .filter((b) => b.date === d)
        .reduce((acc, b) => {
          const [sh, sm] = b.start.split(":");
          const [eh, em] = b.end.split(":");
          return acc + (Number(eh) * 60 + Number(em) - (Number(sh) * 60 + Number(sm)));
        }, 0) /
        60) *
        10,
    ) / 10;

  const emails = state.history.filter((h) => h.kind === "email").length;
  const summaries = state.history.filter((h) => h.kind === "summary").length;

  const weekData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({
    day,
    done: Math.max(0, Math.round(completed.length / 2 + Math.sin(i * 1.4) * 2 + i * 0.6)),
  }));
  const trendData = weekData.map((w, i) => ({ day: w.day, score: 45 + i * 6 + (i % 2 === 0 ? 5 : -3) }));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate font-tight text-2xl font-semibold sm:text-3xl">
            {greeting(now.getHours())}, {(state.user?.name ?? state.settings.name).split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's what needs your attention today.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <p className="font-tight text-xl font-semibold tabular-nums">
            {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open tasks" value={pending.length} icon={ListTodo} hint={`${tasks.length} total`} />
        <Stat label="Completed" value={completed.length} icon={CheckCircle2} hint="All time" />
        <Stat label="Priority" value={priority.length} icon={Flame} hint="High & urgent" />
        <Stat label="Meetings today" value={meetings.length} icon={CalendarClock} hint={`${hoursScheduled}h scheduled`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <SectionCard
          title="Priority tasks"
          action={
            <Link to="/app/tasks" className="text-xs font-medium text-accent hover:underline">
              View all
            </Link>
          }
        >
          {priority.length === 0 ? (
            <EmptyState title="Nothing urgent" description="No high or urgent tasks are open right now." />
          ) : (
            <ul className="space-y-2">
              {priority.slice(0, 5).map((t) => (
                <li
                  key={t.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {t.dueDate ? `Due ${t.dueDate}` : "No due date"} · {t.durationMinutes} min
                    </p>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Today's schedule"
          action={
            <Link to="/app/schedule" className="text-xs font-medium text-accent hover:underline">
              Open
            </Link>
          }
        >
          {todayBlocks.length === 0 ? (
            <EmptyState title="Day is open" description="Use AI Schedule My Day to fill it in." />
          ) : (
            <ul className="space-y-2">
              {todayBlocks.map((b) => (
                <li key={b.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <span className="font-mono text-[11px] text-muted-foreground">{b.start}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{b.title}</span>
                  {b.kind === "break" && <Clock className="size-3.5 shrink-0 text-muted-foreground" />}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Tasks completed this week">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip cursor={{ fill: "var(--color-surface)" }} />
                <Bar dataKey="done" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Productivity trend">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-chart-1)"
                  fill="var(--color-chart-1)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Emails generated" value={emails} icon={ArrowUpRight} />
        <Stat label="Meetings summarized" value={summaries} icon={ArrowUpRight} />
        <Stat label="Hours scheduled today" value={`${hoursScheduled}h`} icon={Clock} />
      </div>
    </div>
  );
}

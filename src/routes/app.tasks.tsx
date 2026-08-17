import { createFileRoute } from "@tanstack/react-router";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Chip, EmptyState, PriorityBadge, SectionCard } from "@/components/ai-blocks";
import { uid, useStore } from "@/lib/store";
import type { Priority, Task, TaskStatus } from "@/lib/types";
import { useAI } from "@/lib/use-ai";

export const Route = createFileRoute("/app/tasks")({
  head: () => ({
    meta: [
      { title: "Task Planner — SmartFlow AI" },
      { name: "description", content: "Plan, prioritize and complete your work with AI assistance." },
      { property: "og:title", content: "Task Planner — SmartFlow AI" },
      { property: "og:description", content: "Plan, prioritize and complete your work with AI assistance." },
    ],
  }),
  component: TasksPage,
});

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "To do" },
  { status: "in_progress", label: "In progress" },
  { status: "completed", label: "Completed" },
];

const PRIORITIES: Priority[] = ["urgent", "high", "medium", "low"];

function TasksPage() {
  const { state, update } = useStore();
  const { run, busy } = useAI();
  const [view, setView] = useState<"board" | "list">("board");
  const [filter, setFilter] = useState<Priority | "all">("all");
  const [title, setTitle] = useState("");

  const tasks = useMemo(
    () => (filter === "all" ? state.tasks : state.tasks.filter((t) => t.priority === filter)),
    [state.tasks, filter],
  );

  function addTask() {
    if (!title.trim()) return;
    const task: Task = {
      id: uid(),
      title: title.trim(),
      description: "",
      priority: "medium",
      status: "todo",
      dueDate: null,
      startTime: null,
      durationMinutes: state.settings.defaultDuration,
      category: "General",
      assignee: null,
      createdAt: new Date().toISOString(),
    };
    update((d) => ({ ...d, tasks: [task, ...d.tasks] }));
    setTitle("");
  }

  function setStatus(id: string, status: TaskStatus) {
    update((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, status } : t)) }));
  }

  function setPriority(id: string, priority: Priority) {
    update((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, priority } : t)) }));
  }

  function remove(id: string) {
    update((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }));
  }

  async function autoPrioritize() {
    const open = state.tasks.filter((t) => t.status !== "completed");
    if (!open.length) return;
    const res = await run(
      "priorities",
      open.map((t) => `- ${t.title} (due ${t.dueDate ?? "none"})`).join("\n"),
    );
    if (!res?.tasks?.length) return;
    update((d) => ({
      ...d,
      tasks: d.tasks.map((t) => {
        const match = res.tasks?.find((r) => r.title.toLowerCase().includes(t.title.toLowerCase().slice(0, 12)));
        return match?.priority ? { ...t, priority: match.priority } : t;
      }),
    }));
    toast.success("Priorities updated by AI.");
  }

  function TaskCard({ t }: { t: Task }) {
    return (
      <div className="group rounded-xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <p className={`text-sm font-medium ${t.status === "completed" ? "line-through opacity-60" : ""}`}>
            {t.title}
          </p>
          <button
            onClick={() => remove(t.id)}
            className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            aria-label="Delete task"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
        {t.description && <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <PriorityBadge priority={t.priority} />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {t.dueDate ?? "no due date"} · {t.durationMinutes}m
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {COLUMNS.filter((c) => c.status !== t.status).map((c) => (
            <button
              key={c.status}
              onClick={() => setStatus(t.id, c.status)}
              className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              {c.label}
            </button>
          ))}
          <select
            value={t.priority}
            onChange={(e) => setPriority(t.id, e.target.value as Priority)}
            className="rounded-full border border-border bg-transparent px-2 py-1 text-[11px] text-muted-foreground"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate font-tight text-2xl font-semibold sm:text-3xl">Task Planner</h1>
          <p className="mt-1 text-sm text-muted-foreground">{state.tasks.length} tasks in your workspace.</p>
        </div>
        <button
          onClick={autoPrioritize}
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-xs font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          <Sparkles className="size-3.5" /> AI Prioritize
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Chip active={view === "board"} onClick={() => setView("board")}>
          Board
        </Chip>
        <Chip active={view === "list"} onClick={() => setView("list")}>
          List
        </Chip>
        <span className="mx-1 h-4 w-px bg-border" />
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </Chip>
        {PRIORITIES.map((p) => (
          <Chip key={p} active={filter === p} onClick={() => setFilter(p)}>
            {p}
          </Chip>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a task…"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <button
          onClick={addTask}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:border-accent hover:text-accent"
        >
          <Plus className="size-4" /> Add
        </button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState title="No tasks" description="Add one above or generate tasks from the AI Workspace." />
      ) : view === "board" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((c) => (
            <div key={c.status} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="label-mono">{c.label}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {tasks.filter((t) => t.status === c.status).length}
                </span>
              </div>
              <div className="space-y-3">
                {tasks
                  .filter((t) => t.status === c.status)
                  .map((t) => (
                    <TaskCard key={t.id} t={t} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <SectionCard title="All tasks">
          <div className="space-y-3">
            {tasks.map((t) => (
              <TaskCard key={t.id} t={t} />
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

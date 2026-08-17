import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus, Check, Copy, ListPlus, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Chip, EmptyState, PriorityBadge, ProcessingCard, SectionCard } from "@/components/ai-blocks";
import { addHistory, pushNotification, todayISO, uid, useStore } from "@/lib/store";
import type { AIResult, Priority, Task } from "@/lib/types";
import { useAI, type AIMode } from "@/lib/use-ai";

export const Route = createFileRoute("/app/workspace")({
  head: () => ({
    meta: [
      { title: "AI Workspace — SmartFlow AI" },
      {
        name: "description",
        content: "Paste messy notes and turn them into summaries, tasks, priorities and a schedule.",
      },
      { property: "og:title", content: "AI Workspace — SmartFlow AI" },
      { property: "og:description", content: "Capture it. Understand it. Plan it. Get it done." },
    ],
  }),
  component: Workspace,
});

const ACTIONS: { mode: AIMode; label: string }[] = [
  { mode: "email", label: "Generate Email" },
  { mode: "summarize", label: "Summarize" },
  { mode: "tasks", label: "Extract Tasks" },
  { mode: "schedule", label: "Create Schedule" },
  { mode: "priorities", label: "Find Priorities" },
];

const SAMPLE =
  "Meeting with John and Sarah. Need to send the proposal by Friday. Sarah will update the budget. John wants the presentation changed. I also need to email the client, review the contract, and prepare for Monday's meeting.";

export function normalizePriority(value?: string): Priority {
  const v = (value ?? "").toLowerCase();
  return v === "urgent" || v === "high" || v === "low" ? (v as Priority) : "medium";
}

export function toTasks(result: AIResult, defaultDuration: number): Task[] {
  return (result.tasks ?? []).map((t) => ({
    id: uid(),
    title: t.title,
    description: t.description ?? "",
    priority: normalizePriority(t.priority),
    status: "todo",
    dueDate: t.dueDate ?? null,
    startTime: null,
    durationMinutes: t.durationMinutes ?? defaultDuration,
    category: t.category ?? "General",
    assignee: t.assignee ?? null,
    createdAt: new Date().toISOString(),
  }));
}

function Workspace() {
  const { state, update } = useStore();
  const { run, pending, busy } = useAI();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AIResult | null>(null);

  async function handle(mode: AIMode) {
    const res = await run(mode, input);
    if (!res) return;
    setResult((prev) => ({ ...(prev ?? {}), ...res }));
    update((d) =>
      addHistory(d, {
        kind: mode === "email" ? "email" : mode === "tasks" ? "tasks" : mode === "schedule" ? "schedule" : "summary",
        title: res.summary?.slice(0, 60) ?? res.email?.subject ?? `${mode} result`,
        preview: input.slice(0, 140),
        payload: res,
      }),
    );
    toast.success("SmartFlow finished processing.");
  }

  function saveTasks() {
    if (!result?.tasks?.length) return;
    const created = toTasks(result, state.settings.defaultDuration);
    update((d) =>
      pushNotification({ ...d, tasks: [...created, ...d.tasks] }, {
        kind: "ai",
        title: `${created.length} tasks added`,
        body: "SmartFlow turned your notes into tasks.",
      }),
    );
    toast.success(`${created.length} tasks added to your planner.`);
  }

  function saveSchedule() {
    if (!result?.schedule?.length) return;
    const d = todayISO();
    const blocks = result.schedule.map((b) => ({
      id: uid(),
      date: d,
      start: b.start,
      end: b.end,
      title: b.title,
      kind: b.kind ?? ("task" as const),
    }));
    update((draft) => ({ ...draft, schedule: [...draft.schedule.filter((b) => b.date !== d), ...blocks] }));
    toast.success("Schedule applied to today.");
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <header>
        <h1 className="font-tight text-2xl font-semibold sm:text-3xl">AI Workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Capture it. Understand it. Plan it. Get it done — from one screen.
        </p>
      </header>

      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-40 w-full resize-y rounded-xl border border-border bg-surface p-4 text-sm transition-all placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-accent/20"
          placeholder="Paste your notes, meeting transcript, ideas, tasks, or anything you need help organizing..."
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            What would you like AI to do?{" "}
            <button className="text-accent hover:underline" onClick={() => setInput(SAMPLE)}>
              Try an example
            </button>
          </p>
          <span className="font-mono text-[11px] text-muted-foreground">{input.length} chars</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip variant="solid" disabled={busy} onClick={() => handle("everything")}>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-3.5" /> Do Everything
            </span>
          </Chip>
          {ACTIONS.map((a) => (
            <Chip key={a.mode} disabled={busy} onClick={() => handle(a.mode)}>
              {a.label}
            </Chip>
          ))}
        </div>
      </div>

      {busy && <ProcessingCard label={`Running ${pending?.replace("_", " ")}`} />}

      {!busy && !result && (
        <EmptyState
          title="Nothing processed yet"
          description="Paste raw notes above and pick an action. Do Everything gives you a summary, decisions, tasks, priorities and a schedule in one pass."
        />
      )}

      {result && !busy && (
        <div className="space-y-6">
          {result.summary && (
            <SectionCard title="AI summary">
              <p className="text-sm leading-relaxed">{result.summary}</p>
            </SectionCard>
          )}

          {!!result.decisions?.length && (
            <SectionCard title="Key decisions">
              <ul className="space-y-2">
                {result.decisions.map((d, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {!!result.priorities?.length && (
            <SectionCard title="Priorities">
              <ol className="space-y-2">
                {result.priorities.map((p, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="font-mono text-[11px] text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
            </SectionCard>
          )}

          {!!result.tasks?.length && (
            <SectionCard
              title="Action items"
              action={
                <button
                  onClick={saveTasks}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90"
                >
                  <ListPlus className="size-3.5" /> Add to planner
                </button>
              }
            >
              <ul className="space-y-3">
                {result.tasks.map((t, i) => (
                  <li key={i} className="rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">{t.title}</p>
                      <PriorityBadge priority={normalizePriority(t.priority)} />
                    </div>
                    {t.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span>Due {t.dueDate ?? "—"}</span>
                      <span>{t.durationMinutes ?? state.settings.defaultDuration} min</span>
                      <span>{t.assignee ?? "Unassigned"}</span>
                      <span>{t.category ?? "General"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {!!result.schedule?.length && (
            <SectionCard
              title="Suggested schedule"
              action={
                <button
                  onClick={saveSchedule}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90"
                >
                  <CalendarPlus className="size-3.5" /> Apply to today
                </button>
              }
            >
              <ul className="space-y-2">
                {result.schedule.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 rounded-xl border border-border bg-background p-3"
                  >
                    <span className="font-mono text-[11px] text-accent">
                      {b.start} – {b.end}
                    </span>
                    <input
                      value={b.title}
                      onChange={(e) =>
                        setResult((prev) => {
                          if (!prev?.schedule) return prev;
                          const next = [...prev.schedule];
                          const current = next[i];
                          if (!current) return prev;
                          next[i] = { ...current, title: e.target.value };
                          return { ...prev, schedule: next };
                        })
                      }
                      className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
                    />
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {result.email && (
            <SectionCard
              title="Suggested email"
              action={
                <button
                  onClick={() => {
                    const e = result.email!;
                    void navigator.clipboard.writeText(`${e.subject}\n\n${e.body}\n\n${e.closing}`);
                    toast.success("Email copied.");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                >
                  <Copy className="size-3.5" /> Copy
                </button>
              }
            >
              <p className="text-sm font-semibold">{result.email.subject}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{result.email.body}</p>
              <p className="mt-3 text-sm text-muted-foreground">{result.email.closing}</p>
            </SectionCard>
          )}
        </div>
      )}
    </div>
  );
}

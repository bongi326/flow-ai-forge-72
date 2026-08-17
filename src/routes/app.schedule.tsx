import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, ProcessingCard, SectionCard } from "@/components/ai-blocks";
import { todayISO, uid, useStore } from "@/lib/store";
import { useAI } from "@/lib/use-ai";

export const Route = createFileRoute("/app/schedule")({
  head: () => ({
    meta: [
      { title: "Daily Schedule — SmartFlow AI" },
      { name: "description", content: "Let AI build a realistic, time-blocked plan for your day." },
      { property: "og:title", content: "Daily Schedule — SmartFlow AI" },
      { property: "og:description", content: "Let AI build a realistic, time-blocked plan for your day." },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  const { state, update } = useStore();
  const { run, busy } = useAI();
  const [date, setDate] = useState(todayISO());

  const blocks = state.schedule.filter((b) => b.date === date).sort((a, b) => a.start.localeCompare(b.start));
  const open = state.tasks.filter((t) => t.status !== "completed");

  async function generate() {
    const brief = `Working hours: ${state.settings.workStart}–${state.settings.workEnd}. Include short breaks.\nTasks:\n${open
      .map((t) => `- ${t.title} (${t.priority}, ~${t.durationMinutes} min)`)
      .join("\n")}`;
    const res = await run("schedule", brief);
    if (!res?.schedule?.length) return;
    const created = res.schedule.map((b) => ({
      id: uid(),
      date,
      start: b.start,
      end: b.end,
      title: b.title,
      kind: b.kind ?? ("task" as const),
    }));
    update((d) => ({ ...d, schedule: [...d.schedule.filter((b) => b.date !== date), ...created] }));
    toast.success("Your day is planned.");
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate font-tight text-2xl font-semibold sm:text-3xl">Daily Schedule</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {open.length} open tasks · {state.settings.workStart}–{state.settings.workEnd}
          </p>
        </div>
        <button
          onClick={generate}
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-xs font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          <Sparkles className="size-3.5" /> Schedule My Day
        </button>
      </header>

      <div className="flex items-center gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <button
          onClick={() =>
            update((d) => ({
              ...d,
              schedule: [
                ...d.schedule,
                { id: uid(), date, start: "12:00", end: "12:30", title: "New block", kind: "task" as const },
              ],
            }))
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:border-accent hover:text-accent"
        >
          <CalendarPlus className="size-4" /> Add block
        </button>
      </div>

      {busy && <ProcessingCard label="Planning your day" />}

      {!busy &&
        (blocks.length === 0 ? (
          <EmptyState
            title="No blocks for this day"
            description="Generate a plan from your open tasks or add blocks manually."
          />
        ) : (
          <SectionCard title="Timeline">
            <ul className="space-y-2">
              {blocks.map((b) => (
                <li
                  key={b.id}
                  className={`group flex items-center gap-4 rounded-xl border p-3 ${
                    b.kind === "break" ? "border-dashed border-border bg-surface" : "border-border bg-background"
                  }`}
                >
                  <span className="font-mono text-[11px] text-accent">
                    {b.start} – {b.end}
                  </span>
                  <input
                    value={b.title}
                    onChange={(e) =>
                      update((d) => ({
                        ...d,
                        schedule: d.schedule.map((x) => (x.id === b.id ? { ...x, title: e.target.value } : x)),
                      }))
                    }
                    className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
                  />
                  <span className="hidden font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:block">
                    {b.kind}
                  </span>
                  <button
                    onClick={() =>
                      update((d) => ({ ...d, schedule: d.schedule.filter((x) => x.id !== b.id) }))
                    }
                    className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    aria-label="Remove block"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </SectionCard>
        ))}
    </div>
  );
}

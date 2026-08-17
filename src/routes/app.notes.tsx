import { createFileRoute } from "@tanstack/react-router";
import { FilePlus, ListPlus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Chip, EmptyState, SectionCard } from "@/components/ai-blocks";
import { pushNotification, uid, useStore } from "@/lib/store";
import { useAI } from "@/lib/use-ai";
import { toTasks } from "@/routes/app.workspace";

export const Route = createFileRoute("/app/notes")({
  head: () => ({
    meta: [
      { title: "Notes — SmartFlow AI" },
      { name: "description", content: "Keep your notes and turn any of them into tasks or summaries." },
      { property: "og:title", content: "Notes — SmartFlow AI" },
      { property: "og:description", content: "Keep your notes and turn any of them into tasks or summaries." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { state, update } = useStore();
  const { run, busy } = useAI();
  const [activeId, setActiveId] = useState<string | null>(state.notes[0]?.id ?? null);
  const active = state.notes.find((n) => n.id === activeId) ?? null;

  function create() {
    const note = {
      id: uid(),
      title: "Untitled note",
      body: "",
      folder: "General",
      updatedAt: new Date().toISOString(),
    };
    update((d) => ({ ...d, notes: [note, ...d.notes] }));
    setActiveId(note.id);
  }

  function patch(body: Partial<{ title: string; body: string }>) {
    if (!active) return;
    update((d) => ({
      ...d,
      notes: d.notes.map((n) =>
        n.id === active.id ? { ...n, ...body, updatedAt: new Date().toISOString() } : n,
      ),
    }));
  }

  async function summarize() {
    if (!active?.body.trim()) return;
    const res = await run("summarize", active.body);
    if (res?.summary) {
      patch({ body: `${active.body}\n\n---\nAI summary: ${res.summary}` });
      toast.success("Summary appended.");
    }
  }

  async function extract() {
    if (!active?.body.trim()) return;
    const res = await run("tasks", active.body);
    if (!res?.tasks?.length) return;
    const created = toTasks(res, state.settings.defaultDuration);
    update((d) =>
      pushNotification({ ...d, tasks: [...created, ...d.tasks] }, {
        kind: "ai",
        title: `${created.length} tasks from a note`,
        body: active.title,
      }),
    );
    toast.success(`${created.length} tasks added.`);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate font-tight text-2xl font-semibold sm:text-3xl">Notes</h1>
          <p className="mt-1 text-sm text-muted-foreground">{state.notes.length} notes saved locally.</p>
        </div>
        <button
          onClick={create}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-xs font-medium text-accent-foreground hover:opacity-90"
        >
          <FilePlus className="size-3.5" /> New note
        </button>
      </header>

      {state.notes.length === 0 ? (
        <EmptyState title="No notes yet" description="Create your first note to get started." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <SectionCard title="All notes">
            <ul className="space-y-2">
              {state.notes.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => setActiveId(n.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      n.id === activeId ? "border-accent bg-accent-soft" : "border-border hover:border-accent/40"
                    }`}
                  >
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {n.body.slice(0, 50) || "Empty note"}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </SectionCard>

          {active && (
            <SectionCard
              title="Editor"
              action={
                <button
                  onClick={() => {
                    update((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== active.id) }));
                    setActiveId(null);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Delete note"
                >
                  <Trash2 className="size-4" />
                </button>
              }
            >
              <input
                value={active.title}
                onChange={(e) => patch({ title: e.target.value })}
                className="w-full bg-transparent font-tight text-xl font-semibold focus:outline-none"
              />
              <textarea
                value={active.body}
                onChange={(e) => patch({ body: e.target.value })}
                placeholder="Start writing…"
                className="mt-3 min-h-72 w-full resize-y rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip disabled={busy} onClick={summarize}>
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="size-3.5" /> Summarize
                  </span>
                </Chip>
                <Chip disabled={busy} onClick={extract}>
                  <span className="inline-flex items-center gap-1.5">
                    <ListPlus className="size-3.5" /> Extract tasks
                  </span>
                </Chip>
              </div>
            </SectionCard>
          )}
        </div>
      )}
    </div>
  );
}

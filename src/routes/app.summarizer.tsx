import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, ListPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Chip, PriorityBadge, ProcessingCard, SectionCard } from "@/components/ai-blocks";
import { addHistory, pushNotification, useStore } from "@/lib/store";
import type { AIResult } from "@/lib/types";
import { useAI } from "@/lib/use-ai";
import { normalizePriority, toTasks } from "@/routes/app.workspace";

export const Route = createFileRoute("/app/summarizer")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — SmartFlow AI" },
      { name: "description", content: "Paste messy meeting notes and get clean summaries and action items." },
      { property: "og:title", content: "Meeting Notes Summarizer — SmartFlow AI" },
      { property: "og:description", content: "Clean summaries, decisions and action items from messy notes." },
    ],
  }),
  component: Summarizer,
});

function Summarizer() {
  const { state, update } = useStore();
  const { run, busy } = useAI();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AIResult | null>(null);

  async function summarize() {
    const res = await run("meeting", input);
    if (!res) return;
    setResult(res);
    update((d) =>
      addHistory(d, {
        kind: "summary",
        title: res.summary?.slice(0, 60) ?? "Meeting summary",
        preview: input.slice(0, 140),
        payload: res,
      }),
    );
    toast.success("Meeting summarized.");
  }

  function addTasks() {
    if (!result?.tasks?.length) return;
    const created = toTasks(result, state.settings.defaultDuration);
    update((d) =>
      pushNotification({ ...d, tasks: [...created, ...d.tasks] }, {
        kind: "ai",
        title: `${created.length} action items added`,
        body: "From your meeting summary.",
      }),
    );
    toast.success(`${created.length} action items added.`);
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <header>
        <h1 className="font-tight text-2xl font-semibold sm:text-3xl">Meeting Notes Summarizer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste raw notes or a transcript — get a summary, decisions and action items.
        </p>
      </header>

      <SectionCard title="Meeting notes">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-56 w-full resize-y rounded-xl border border-border bg-surface p-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
          placeholder="Paste your meeting notes or transcript here..."
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={summarize}
            disabled={busy || !input.trim()}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Summarizing…" : "Summarize Meeting"}
          </button>
          <span className="font-mono text-[11px] text-muted-foreground">{input.split(/\s+/).filter(Boolean).length} words</span>
        </div>
      </SectionCard>

      {busy && <ProcessingCard label="Reading your notes" />}

      {result && !busy && (
        <div className="space-y-6">
          {result.summary && (
            <SectionCard
              title="Summary"
              action={
                <Chip
                  onClick={() => {
                    void navigator.clipboard.writeText(result.summary ?? "");
                    toast.success("Summary copied.");
                  }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Copy className="size-3.5" /> Copy
                  </span>
                </Chip>
              }
            >
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

          {!!result.followUps?.length && (
            <SectionCard title="Follow-ups & questions">
              <ul className="space-y-2">
                {result.followUps.map((f, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    — {f}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {!!result.tasks?.length && (
            <SectionCard
              title="Action items"
              action={
                <button
                  onClick={addTasks}
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
                    <div className="mt-2 flex flex-wrap gap-x-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span>{t.assignee ?? "Unassigned"}</span>
                      <span>Due {t.dueDate ?? "—"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
        </div>
      )}
    </div>
  );
}

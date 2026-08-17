import { createFileRoute } from "@tanstack/react-router";
import { Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Chip, EmptyState, SectionCard } from "@/components/ai-blocks";
import { useStore } from "@/lib/store";
import type { HistoryItem } from "@/lib/types";

export const Route = createFileRoute("/app/history")({
  head: () => ({
    meta: [
      { title: "History — SmartFlow AI" },
      { name: "description", content: "Everything SmartFlow AI has generated for you, searchable." },
      { property: "og:title", content: "History — SmartFlow AI" },
      { property: "og:description", content: "Everything SmartFlow AI has generated for you, searchable." },
    ],
  }),
  component: HistoryPage,
});

const KINDS: (HistoryItem["kind"] | "all")[] = ["all", "email", "summary", "tasks", "schedule", "note"];

function HistoryPage() {
  const { state, update } = useStore();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<HistoryItem["kind"] | "all">("all");

  const items = useMemo(
    () =>
      state.history.filter(
        (h) =>
          (kind === "all" || h.kind === kind) &&
          (h.title + h.preview).toLowerCase().includes(q.toLowerCase()),
      ),
    [state.history, kind, q],
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header>
        <h1 className="font-tight text-2xl font-semibold sm:text-3xl">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">{state.history.length} saved AI outputs.</p>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search history…"
          className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
            {k}
          </Chip>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState title="Nothing here yet" description="Generated emails, summaries and plans will show up here." />
      ) : (
        <SectionCard title="Recent">
          <ul className="space-y-3">
            {items.map((h) => (
              <li key={h.id} className="group rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{h.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{h.preview}</p>
                  </div>
                  <button
                    onClick={() => update((d) => ({ ...d, history: d.history.filter((x) => x.id !== h.id) }))}
                    className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    aria-label="Delete entry"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="mt-3 flex gap-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="text-accent">{h.kind}</span>
                  <span>{new Date(h.createdAt).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}

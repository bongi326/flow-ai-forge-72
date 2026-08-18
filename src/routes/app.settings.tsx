import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { Chip, SectionCard } from "@/components/ai-blocks";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SmartFlow AI" },
      { name: "description", content: "Configure your profile, working hours, AI tone and notifications." },
      { property: "og:title", content: "Settings — SmartFlow AI" },
      { property: "og:description", content: "Configure your profile, working hours, AI tone and notifications." },
    ],
  }),
  component: SettingsPage,
});

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";

const TONES = ["Professional", "Friendly", "Concise", "Formal"];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="label-mono">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl border border-border p-3 text-left text-sm"
    >
      <span>{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-accent" : "bg-border"}`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-background transition-all ${
            checked ? "left-4.5" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function SettingsPage() {
  const { state, update } = useStore();
  const s = state.settings;

  const set = (patch: Partial<typeof s>) =>
    update((d) => ({ ...d, settings: { ...d.settings, ...patch } }));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header>
        <h1 className="font-tight text-2xl font-semibold sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everything is stored locally in demo mode.</p>
      </header>

      <SectionCard title="Profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <Row label="Name">
            <input value={s.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} />
          </Row>
          <Row label="Email">
            <input value={s.email} onChange={(e) => set({ email: e.target.value })} className={inputClass} />
          </Row>
        </div>
      </SectionCard>

      <SectionCard title="Working hours">
        <div className="grid gap-4 sm:grid-cols-3">
          <Row label="Start">
            <input
              type="time"
              value={s.workStart}
              onChange={(e) => set({ workStart: e.target.value })}
              className={inputClass}
            />
          </Row>
          <Row label="End">
            <input
              type="time"
              value={s.workEnd}
              onChange={(e) => set({ workEnd: e.target.value })}
              className={inputClass}
            />
          </Row>
          <Row label="Default task length (min)">
            <input
              type="number"
              min={10}
              step={5}
              value={s.defaultDuration}
              onChange={(e) => set({ defaultDuration: Number(e.target.value) })}
              className={inputClass}
            />
          </Row>
        </div>
      </SectionCard>

      <SectionCard title="AI preferences">
        <Row label="Default tone">
          <div className="flex flex-wrap gap-2 pt-1">
            {TONES.map((t) => (
              <Chip key={t} active={s.aiTone === t} onClick={() => set({ aiTone: t })}>
                {t}
              </Chip>
            ))}
          </div>
        </Row>
      </SectionCard>

      <SectionCard title="Notifications">
        <div className="space-y-2">
          <Toggle
            label="Deadline reminders"
            checked={s.notifyDeadlines}
            onChange={(v) => set({ notifyDeadlines: v })}
          />
          <Toggle label="Meeting alerts" checked={s.notifyMeetings} onChange={(v) => set({ notifyMeetings: v })} />
          <Toggle label="Daily digest" checked={s.notifyDigest} onChange={(v) => set({ notifyDigest: v })} />
        </div>
      </SectionCard>

      <SectionCard title="Data">
        <button
          onClick={() => {
            if (typeof window !== "undefined") window.localStorage.removeItem("smartflow:v1");
            toast.success("Demo data cleared — reload to reseed.");
          }}
          className="rounded-lg border border-destructive/40 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
        >
          Reset demo data
        </button>
      </SectionCard>
    </div>
  );
}

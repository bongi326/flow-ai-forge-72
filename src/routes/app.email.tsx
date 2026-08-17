import { createFileRoute } from "@tanstack/react-router";
import { Copy, RefreshCw, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Chip, ProcessingCard, SectionCard } from "@/components/ai-blocks";
import { addHistory, useStore } from "@/lib/store";
import type { EmailDraft } from "@/lib/types";
import { useAI } from "@/lib/use-ai";

export const Route = createFileRoute("/app/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — SmartFlow AI" },
      { name: "description", content: "Turn rough ideas into professional emails in seconds." },
      { property: "og:title", content: "Smart Email Generator — SmartFlow AI" },
      { property: "og:description", content: "Turn rough ideas into professional emails in seconds." },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Professional", "Friendly", "Formal", "Casual", "Persuasive", "Apologetic", "Thank You"];
const LENGTHS = ["Short", "Medium", "Detailed"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="label-mono">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";

function EmailPage() {
  const { update } = useStore();
  const { run, busy } = useAI();
  const [about, setAbout] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("Professional");
  const [purpose, setPurpose] = useState("");
  const [points, setPoints] = useState("");
  const [length, setLength] = useState("Medium");
  const [draft, setDraft] = useState<EmailDraft | null>(null);

  const brief = `Topic: ${about}\nRecipient: ${recipient || "unspecified"}\nTone: ${tone}\nPurpose: ${purpose || "unspecified"}\nLength: ${length}\nImportant points:\n${points}`;

  async function generate() {
    const res = await run("email", brief);
    if (res?.email) {
      setDraft(res.email);
      update((d) =>
        addHistory(d, {
          kind: "email",
          title: res.email!.subject,
          preview: res.email!.body.slice(0, 140),
          payload: res.email,
        }),
      );
      toast.success("Email generated.");
    }
  }

  async function refine(instruction: string) {
    if (!draft) return;
    const res = await run(
      "refine",
      `${instruction}\n\nSubject: ${draft.subject}\n\n${draft.body}\n\n${draft.closing}`,
    );
    if (res?.email) {
      setDraft(res.email);
      toast.success("Email updated.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <header>
        <h1 className="font-tight text-2xl font-semibold sm:text-3xl">Smart Email Generator</h1>
        <p className="mt-1 text-sm text-muted-foreground">Turn rough ideas into professional emails in seconds.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <SectionCard title="Brief">
          <div className="space-y-4">
            <Field label="What is the email about?">
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className={`${inputClass} min-h-24 resize-y`}
                placeholder="Following up on yesterday's proposal call..."
              />
            </Field>
            <Field label="Recipient">
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className={inputClass}
                placeholder="Sarah, Head of Finance"
              />
            </Field>
            <Field label="Purpose">
              <input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className={inputClass}
                placeholder="Get sign-off before Friday"
              />
            </Field>
            <Field label="Important points">
              <textarea
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className={`${inputClass} min-h-24 resize-y`}
                placeholder="Budget revised down 8%, timeline unchanged..."
              />
            </Field>
            <Field label="Tone">
              <div className="flex flex-wrap gap-2 pt-1">
                {TONES.map((t) => (
                  <Chip key={t} active={tone === t} onClick={() => setTone(t)}>
                    {t}
                  </Chip>
                ))}
              </div>
            </Field>
            <Field label="Length">
              <div className="flex flex-wrap gap-2 pt-1">
                {LENGTHS.map((l) => (
                  <Chip key={l} active={length === l} onClick={() => setLength(l)}>
                    {l}
                  </Chip>
                ))}
              </div>
            </Field>
            <button
              onClick={generate}
              disabled={busy || !about.trim()}
              className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Generating…" : "Generate Email"}
            </button>
          </div>
        </SectionCard>

        <div className="space-y-4">
          {busy && <ProcessingCard label="Drafting your email" />}
          {!busy && !draft && (
            <SectionCard title="Draft">
              <p className="py-10 text-center text-sm text-muted-foreground">
                Fill in the brief and generate — your editable draft appears here.
              </p>
            </SectionCard>
          )}
          {!busy && draft && (
            <SectionCard title="Draft">
              <div className="space-y-3">
                <input
                  value={draft.subject}
                  onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                  className={`${inputClass} font-semibold`}
                />
                <textarea
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  className={`${inputClass} min-h-72 resize-y leading-relaxed`}
                />
                <input
                  value={draft.closing}
                  onChange={(e) => setDraft({ ...draft, closing: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip disabled={busy} onClick={generate}>
                  <span className="inline-flex items-center gap-1.5">
                    <RefreshCw className="size-3.5" /> Regenerate
                  </span>
                </Chip>
                <Chip disabled={busy} onClick={() => refine("Make this email noticeably shorter.")}>
                  Make Shorter
                </Chip>
                <Chip disabled={busy} onClick={() => refine("Make this email more professional and precise.")}>
                  More Professional
                </Chip>
                <Chip disabled={busy} onClick={() => refine("Make this email warmer and friendlier.")}>
                  Friendlier
                </Chip>
                <Chip
                  onClick={() => {
                    void navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}\n\n${draft.closing}`);
                    toast.success("Email copied.");
                  }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Copy className="size-3.5" /> Copy
                  </span>
                </Chip>
                <Chip
                  onClick={() => {
                    update((d) =>
                      addHistory(d, {
                        kind: "email",
                        title: draft.subject,
                        preview: draft.body.slice(0, 140),
                        payload: draft,
                      }),
                    );
                    toast.success("Saved to history.");
                  }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Save className="size-3.5" /> Save
                  </span>
                </Chip>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

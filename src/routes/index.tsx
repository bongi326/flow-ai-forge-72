import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  FileText,
  Layers,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartFlow AI — One workspace for email, meetings and planning" },
      {
        name: "description",
        content:
          "SmartFlow AI turns messy notes into polished emails, clean meeting summaries and a realistic daily plan — in one unified workspace.",
      },
      { property: "og:title", content: "SmartFlow AI — Work smarter, not harder" },
      {
        property: "og:description",
        content: "Email generation, meeting summaries and AI task planning in a single workspace.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Mail,
    title: "Smart Email Generator",
    body: "Describe the situation in a sentence. Get a professional, on-tone email you can send as-is or refine in one click.",
  },
  {
    icon: FileText,
    title: "Meeting Notes Summarizer",
    body: "Paste a messy transcript and get a clean summary, the decisions that were made, and every action item with an owner.",
  },
  {
    icon: CalendarClock,
    title: "AI Task Planner",
    body: "Your tasks get prioritized, estimated and time-blocked into a day that's actually achievable — breaks included.",
  },
];

const STEPS = [
  { n: "01", title: "Paste anything", body: "Notes, a transcript, a half-formed idea. No formatting required." },
  { n: "02", title: "Pick an action", body: "Summarize, extract tasks, draft an email — or run Do Everything." },
  { n: "03", title: "Ship the output", body: "Send the email, add tasks to your planner, apply the schedule to today." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="inline-flex items-center gap-2 font-tight text-base font-semibold">
            <span className="grid size-7 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Zap className="size-4" />
            </span>
            SmartFlow AI
          </span>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
          </nav>
          <Link
            to="/app/workspace"
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Try the demo
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <Sparkles className="size-3 text-accent" /> Three tools. One workspace.
            </span>
            <h1 className="mt-6 max-w-3xl font-tight text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Work smarter, not harder — with AI that finishes the busywork.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              SmartFlow AI writes your emails, summarizes your meetings and plans your day. Paste anything messy;
              get something you can act on.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/app/workspace"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                Open the workspace <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/app/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
              >
                See the dashboard
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> No signup required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Layers className="size-3.5" /> Demo data included
              </span>
            </div>
          </div>
        </section>

        <section id="features" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="font-tight text-3xl font-semibold tracking-tight">Everything in one place</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {FEATURES.map((f) => (
                <article key={f.title} className="rounded-2xl border border-border bg-card p-6">
                  <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
                    <f.icon className="size-4.5" />
                  </span>
                  <h3 className="mt-5 font-tight text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="font-tight text-3xl font-semibold tracking-tight">How it works</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="rounded-2xl border border-border bg-background p-6">
                  <span className="font-mono text-xs text-accent">{s.n}</span>
                  <h3 className="mt-3 font-tight text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-24 text-center">
          <h2 className="font-tight text-3xl font-semibold tracking-tight sm:text-4xl">
            Stop rewriting the same email.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground">
            Try the full workspace right now — no account, no setup, seeded with realistic demo data.
          </p>
          <Link
            to="/app/workspace"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Start free <ArrowRight className="size-4" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} SmartFlow AI</span>
          <span className="font-mono uppercase tracking-widest">Demo mode</span>
        </div>
      </footer>
    </div>
  );
}

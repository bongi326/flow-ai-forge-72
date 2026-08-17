import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/types";

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("animate-reveal rounded-2xl border border-border bg-card p-5 sm:p-6", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="label-mono">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ProcessingCard({ label = "SmartFlow is thinking" }: { label?: string }) {
  return (
    <div className="shimmer-bg relative overflow-hidden rounded-2xl border border-accent/20 p-6">
      <div className="mb-4 flex items-center gap-2 text-accent">
        <Loader2 className="size-4 animate-spin" />
        <span className="font-mono text-[11px] uppercase tracking-widest">{label}</span>
      </div>
      <div className="space-y-2.5">
        <div className="skeleton-line h-3 w-full rounded" />
        <div className="skeleton-line h-3 w-4/5 rounded" />
        <div className="skeleton-line h-3 w-2/3 rounded" />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <p className="font-tight text-base font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

const PRIORITY_STYLES: Record<Priority, string> = {
  low: "bg-surface text-muted-foreground",
  medium: "bg-accent-soft text-accent",
  high: "bg-warning/15 text-warning",
  urgent: "bg-destructive/15 text-destructive",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        PRIORITY_STYLES[priority],
      )}
    >
      {priority}
    </span>
  );
}

export function Chip({
  children,
  active,
  onClick,
  disabled,
  variant = "ghost",
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "ghost" | "solid";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
        variant === "solid" || active
          ? "bg-accent text-accent-foreground hover:opacity-90"
          : "border border-border bg-background text-foreground hover:bg-surface",
      )}
    >
      {children}
    </button>
  );
}

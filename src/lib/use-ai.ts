import { useServerFn } from "@tanstack/react-start";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { runAI } from "./ai.functions";
import type { AIResult } from "./types";

export type AIMode =
  | "email"
  | "summarize"
  | "tasks"
  | "schedule"
  | "priorities"
  | "everything"
  | "meeting"
  | "followup"
  | "refine"
  | "plan_day";

export function useAI() {
  const call = useServerFn(runAI);
  const [pending, setPending] = useState<AIMode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (mode: AIMode, input: string, context?: string): Promise<AIResult | null> => {
      if (!input.trim()) {
        toast.error("Add some content first.");
        return null;
      }
      setPending(mode);
      setError(null);
      try {
        const res = await call({ data: { mode, input, ...(context ? { context } : {}) } });
        if (!res.ok) {
          setError(res.message);
          toast.error(res.message);
          return null;
        }
        return JSON.parse(res.json) as AIResult;
      } catch (e) {
        const message = e instanceof Error ? e.message : "The AI request failed.";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setPending(null);
      }
    },
    [call],
  );

  return { run, pending, error, busy: pending !== null };
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { GatewayError } from "./ai-gateway.server";
import { runPrompt, type AIMode } from "./ai-prompts.server";

const InputSchema = z.object({
  mode: z.enum([
    "email",
    "summarize",
    "tasks",
    "schedule",
    "priorities",
    "everything",
    "meeting",
    "followup",
    "refine",
    "plan_day",
  ]),
  input: z.string().trim().min(1, "Add some content first").max(30000),
  context: z.string().max(20000).optional(),
});

export const runAI = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const result = await runPrompt(data.mode as AIMode, data.input, data.context);
      return { ok: true as const, result };
    } catch (error) {
      if (error instanceof GatewayError) {
        return { ok: false as const, status: error.status, message: error.message };
      }
      console.error(error);
      return { ok: false as const, status: 500, message: "Something went wrong running the AI." };
    }
  });

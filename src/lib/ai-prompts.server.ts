import { callGatewayJson } from "./ai-gateway.server";

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

const BASE = `You are SmartFlow AI, a precise productivity assistant. You read messy notes, transcripts and
instructions and turn them into structured, realistic, actionable output.
Rules:
- Always reply with a single JSON object. No markdown, no commentary.
- Never invent facts that are not implied by the input. If information is missing, leave the field out or use null.
- Dates use YYYY-MM-DD. Times use 24h HH:MM.
- Priorities are one of: low, medium, high, urgent.
- Durations are whole minutes and realistic for the work described.`;

const SHAPES: Record<AIMode, string> = {
  email: `{"email":{"subject":string,"body":string,"closing":string}}`,
  summarize: `{"summary":string,"keyPoints":string[],"decisions":string[]}`,
  tasks: `{"tasks":[{"title":string,"description":string,"priority":string,"dueDate":string|null,"durationMinutes":number,"assignee":string|null,"category":string}]}`,
  schedule: `{"schedule":[{"start":"HH:MM","end":"HH:MM","title":string,"kind":"task"|"meeting"|"break"}]}`,
  priorities: `{"priorities":string[]}`,
  everything: `{"summary":string,"decisions":string[],"priorities":string[],"tasks":[{"title":string,"description":string,"priority":string,"dueDate":string|null,"durationMinutes":number,"assignee":string|null,"category":string}],"schedule":[{"start":"HH:MM","end":"HH:MM","title":string,"kind":"task"|"meeting"|"break"}],"email":{"subject":string,"body":string,"closing":string}}`,
  meeting: `{"summary":string,"keyPoints":string[],"decisions":string[],"participants":string[],"deadlines":[{"label":string,"date":string}],"tasks":[{"title":string,"description":string,"priority":string,"dueDate":string|null,"durationMinutes":number,"assignee":string|null,"category":string}]}`,
  followup: `{"email":{"subject":string,"body":string,"closing":string}}`,
  refine: `{"email":{"subject":string,"body":string,"closing":string}}`,
  plan_day: `{"schedule":[{"start":"HH:MM","end":"HH:MM","title":string,"kind":"task"|"meeting"|"break"}]}`,
};

const INSTRUCTIONS: Record<AIMode, string> = {
  email: "Write one professional email from the brief. Keep the body plain text with paragraph breaks.",
  summarize: "Summarise the content in 3-5 sentences, then list key points and any decisions.",
  tasks: "Extract every actionable task. Infer sensible owners, priorities, due dates and durations.",
  schedule:
    "Build a realistic, non-overlapping schedule for one working day from the content, including short breaks.",
  priorities: "Rank what matters most, highest first, with a one-line reason each.",
  everything:
    "Do a complete pass: summary, decisions, ranked priorities, action items, a realistic non-overlapping day schedule with breaks, and a professional email if the notes imply one is needed.",
  meeting:
    "Treat the input as meeting notes or a transcript. Extract summary, discussion points, decisions, participants, deadlines and action items.",
  followup:
    "Write a professional follow-up email based on the meeting summary and action items provided. Reference decisions and owners.",
  refine: "Rewrite the supplied email according to the requested adjustment. Keep the meaning intact.",
  plan_day:
    "Schedule the unfinished tasks into the available working hours. Respect priority and due dates, never overlap, include short breaks and a lunch break.",
};

export async function runPrompt(mode: AIMode, input: string, context?: string) {
  const today = new Date().toISOString().slice(0, 10);
  const system = `${BASE}\nToday is ${today}.\nRespond with exactly this JSON shape: ${SHAPES[mode]}`;
  const user = `${INSTRUCTIONS[mode]}\n\n${context ? `Context:\n${context}\n\n` : ""}Input:\n${input}`;
  return callGatewayJson(system, user);
}

export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null;
  startTime: string | null;
  durationMinutes: number;
  category: string;
  assignee: string | null;
  createdAt: string;
}

export interface ScheduleBlock {
  id: string;
  start: string; // "09:00"
  end: string; // "09:30"
  title: string;
  kind: "task" | "meeting" | "break";
  date: string; // yyyy-mm-dd
  taskId?: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  folder: string;
  updatedAt: string;
}

export interface HistoryItem {
  id: string;
  kind: "email" | "summary" | "tasks" | "note" | "schedule";
  title: string;
  preview: string;
  payload: unknown;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  kind: "deadline" | "overdue" | "meeting" | "schedule" | "ai";
  createdAt: string;
  read: boolean;
}

export interface Settings {
  name: string;
  email: string;
  theme: "light" | "dark";
  timeZone: string;
  workStart: string;
  workEnd: string;
  defaultDuration: number;
  notifyDeadlines: boolean;
  notifyMeetings: boolean;
  notifyDigest: boolean;
  aiTone: string;
}

export interface EmailDraft {
  subject: string;
  body: string;
  closing: string;
}

export interface MeetingSummary {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  participants: string[];
  deadlines: { label: string; date: string }[];
}

export interface AIResult {
  summary?: string;
  decisions?: string[];
  keyPoints?: string[];
  participants?: string[];
  deadlines?: { label: string; date: string }[];
  priorities?: string[];
  followUps?: string[];
  tasks?: Array<{
    title: string;
    description?: string;
    priority?: Priority;
    dueDate?: string | null;
    durationMinutes?: number;
    assignee?: string | null;
    category?: string;
  }>;
  schedule?: Array<{ start: string; end: string; title: string; kind?: "task" | "meeting" | "break" }>;
  email?: EmailDraft;
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type {
  AppNotification,
  HistoryItem,
  Note,
  ScheduleBlock,
  Settings,
  Task,
} from "./types";

const KEY = "smartflow:v1";

export interface AppState {
  user: { name: string; email: string; signedIn: boolean; demo: boolean } | null;
  tasks: Task[];
  schedule: ScheduleBlock[];
  notes: Note[];
  history: HistoryItem[];
  notifications: AppNotification[];
  settings: Settings;
}

export const todayISO = () => new Date().toISOString().slice(0, 10);
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const defaultSettings: Settings = {
  name: "Alex Morgan",
  email: "alex@smartflow.ai",
  theme: "light",
  timeZone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC",
  workStart: "09:00",
  workEnd: "17:30",
  defaultDuration: 45,
  notifyDeadlines: true,
  notifyMeetings: true,
  notifyDigest: false,
  aiTone: "Professional",
};

function seed(): AppState {
  const d = todayISO();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const tasks: Task[] = [
    {
      id: uid(),
      title: "Send the client proposal",
      description: "Final pass on pricing, then send to the client contact.",
      priority: "urgent",
      status: "todo",
      dueDate: d,
      startTime: "09:30",
      durationMinutes: 60,
      category: "Client",
      assignee: "Me",
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      title: "Update the budget sheet",
      description: "Sarah's revised Q3 numbers need to go into the master sheet.",
      priority: "high",
      status: "in_progress",
      dueDate: tomorrow,
      startTime: "11:00",
      durationMinutes: 45,
      category: "Finance",
      assignee: "Sarah",
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      title: "Rework the presentation deck",
      description: "John wants slides 4-9 restructured around the new narrative.",
      priority: "medium",
      status: "todo",
      dueDate: tomorrow,
      startTime: null,
      durationMinutes: 90,
      category: "Product",
      assignee: "John",
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      title: "Review the vendor contract",
      description: "Check the renewal clause and the liability cap.",
      priority: "low",
      status: "completed",
      dueDate: d,
      startTime: null,
      durationMinutes: 30,
      category: "Legal",
      assignee: "Me",
      createdAt: new Date().toISOString(),
    },
  ];

  const schedule: ScheduleBlock[] = [
    { id: uid(), date: d, start: "09:00", end: "09:30", title: "Reply to client emails", kind: "task" },
    { id: uid(), date: d, start: "09:30", end: "10:30", title: "Prepare project proposal", kind: "task" },
    { id: uid(), date: d, start: "10:30", end: "10:45", title: "Break", kind: "break" },
    { id: uid(), date: d, start: "10:45", end: "11:30", title: "Weekly team sync", kind: "meeting" },
  ];

  const notes: Note[] = [
    {
      id: uid(),
      title: "Monday strategy notes",
      body: "Meeting with John and Sarah. Need to send the proposal by Friday. Sarah will update the budget. John wants the presentation changed. I also need to email the client, review the contract, and prepare for Monday's meeting.",
      folder: "Meetings",
      updatedAt: new Date().toISOString(),
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: uid(),
      kind: "deadline",
      title: "Proposal due today",
      body: "Send the client proposal — due end of day.",
      createdAt: new Date().toISOString(),
      read: false,
    },
    {
      id: uid(),
      kind: "meeting",
      title: "Weekly team sync at 10:45",
      body: "Agenda: budget revision and deck rework.",
      createdAt: new Date().toISOString(),
      read: false,
    },
  ];

  return {
    user: null,
    tasks,
    schedule,
    notes,
    history: [],
    notifications,
    settings: defaultSettings,
  };
}

interface StoreValue {
  state: AppState;
  hydrated: boolean;
  update: (fn: (draft: AppState) => AppState) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => seed());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        setState({ ...seed(), ...parsed, settings: { ...defaultSettings, ...parsed.settings } });
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.classList.toggle("dark", state.settings.theme === "dark");
  }, [state.settings.theme, hydrated]);

  const update = useCallback((fn: (draft: AppState) => AppState) => {
    setState((prev) => fn(prev));
  }, []);

  const reset = useCallback(() => {
    const fresh = seed();
    setState(fresh);
  }, []);

  const value = useMemo(() => ({ state, hydrated, update, reset }), [state, hydrated, update, reset]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/* ---------- helpers ---------- */

export function addHistory(draft: AppState, item: Omit<HistoryItem, "id" | "createdAt">): AppState {
  return {
    ...draft,
    history: [{ ...item, id: uid(), createdAt: new Date().toISOString() }, ...draft.history].slice(0, 200),
  };
}

export function pushNotification(
  draft: AppState,
  item: Omit<AppNotification, "id" | "createdAt" | "read">,
): AppState {
  return {
    ...draft,
    notifications: [
      { ...item, id: uid(), createdAt: new Date().toISOString(), read: false },
      ...draft.notifications,
    ].slice(0, 50),
  };
}

export function minutesBetween(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = Math.max(0, Math.min(24 * 60 - 1, h * 60 + m + minutes));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

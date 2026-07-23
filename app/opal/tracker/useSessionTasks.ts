"use client";

// Persists composer-created tasks/notes/stickies for the browser session, and
// shares them across the full page and the aside sidebar. Cleared when the tab
// closes (sessionStorage), and kept in sync across mounted instances via a
// window event.
import { useEffect, useState } from "react";
import { toaster } from "@optiaxiom/react";
import { readPlannerLabel } from "./usePlannerLabel";
import type { Task } from "./types";

const KEY = "tracker-extra-tasks";
const EVENT = "tracker-extra-tasks-change";

function read(): Task[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Imperative add (for non-component callers, e.g. clipping from IM).
export function addSessionTask(task: Task) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify([task, ...read()]));
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENT));
}

// Clip arbitrary text (a message, agent output, or highlighted selection) into
// the tracker as a note, seeding the note body so it opens with the content.
export function clipToTracker(text: string) {
  const clean = text.trim();
  if (!clean) return;
  const title = clean.length > 60 ? `${clean.slice(0, 60)}…` : clean;
  const id = `clip-${clean.length}-${Math.round(performance.now())}`;
  // Clipped by the user from an IM conversation.
  addSessionTask({ id, title, description: clean, type: "normal", itemType: "note", createdBy: "You", createdIn: "IM" });
  try {
    sessionStorage.setItem(`tracker-note-${id}`, `<p>${escapeHtml(clean)}</p>`);
  } catch {
    /* ignore */
  }
  toaster.create(`Added to ${readPlannerLabel()}`, { intent: "success" });
}

export function useSessionTasks(): [Task[], (task: Task) => void] {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(read());
    const handler = () => setTasks(read());
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  const add = (task: Task) => {
    const next = [task, ...read()];
    try {
      sessionStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setTasks(next);
    window.dispatchEvent(new CustomEvent(EVENT));
  };

  return [tasks, add];
}

// Session-persisted string keyed by an arbitrary id (e.g. a task's description
// or note body). Reads synchronously on the client so keyed remounts restore
// the right value immediately.
// Per-item pin state, persisted for the session and synced live across every
// mounted instance (row + detail screen) via a window event.
export const PIN_EVENT = "tracker-pin-change";
const PIN_PREFIX = "tracker-pin-";

// All currently-pinned item ids (session-scoped) — used to drive the
// "Pinned" filter. Re-read on PIN_EVENT to stay live.
export function readPinnedIds(): Set<string> {
  const ids = new Set<string>();
  if (typeof window === "undefined") return ids;
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(PIN_PREFIX) && sessionStorage.getItem(k) === "1") ids.add(k.slice(PIN_PREFIX.length));
    }
  } catch {
    /* ignore */
  }
  return ids;
}

export function useSessionPin(id: string): [boolean, () => void] {
  const key = `tracker-pin-${id}`;
  const [pinned, setPinned] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(key) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string; pinned: boolean }>).detail;
      if (detail.id === id) setPinned(detail.pinned);
    };
    window.addEventListener(PIN_EVENT, handler);
    return () => window.removeEventListener(PIN_EVENT, handler);
  }, [id]);

  const toggle = () => {
    setPinned((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem(key, next ? "1" : "");
      } catch {
        /* ignore */
      }
      window.dispatchEvent(new CustomEvent(PIN_EVENT, { detail: { id, pinned: next } }));
      return next;
    });
  };

  return [pinned, toggle];
}

// Per-item approval status, persisted for the session and synced live across
// the card and the detail view (approve / request change happens in detail).
export type ApprovalStatus = "pending" | "approved" | "rejected";
const APPROVAL_EVENT = "tracker-approval-change";

export function useSessionApproval(id: string): [ApprovalStatus, (s: ApprovalStatus) => void] {
  const key = `tracker-approval-${id}`;
  const [status, setStatusState] = useState<ApprovalStatus>(() => {
    if (typeof window === "undefined") return "pending";
    try {
      const stored = sessionStorage.getItem(key);
      return stored === "approved" || stored === "rejected" ? stored : "pending";
    } catch {
      return "pending";
    }
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string; status: ApprovalStatus }>).detail;
      if (detail.id === id) setStatusState(detail.status);
    };
    window.addEventListener(APPROVAL_EVENT, handler);
    return () => window.removeEventListener(APPROVAL_EVENT, handler);
  }, [id]);

  const setStatus = (s: ApprovalStatus) => {
    setStatusState(s);
    try {
      sessionStorage.setItem(key, s);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent(APPROVAL_EVENT, { detail: { id, status: s } }));
  };

  return [status, setStatus];
}

// Per-item "completed" state, persisted for the session and synced live across
// mounted instances. Completed items collapse in-place immediately, and are
// filtered out entirely the next time the tracker mounts (see readDoneIds),
// staying gone until the demo is reset (see clearDone).
const DONE_EVENT = "tracker-done-change";
const DONE_PREFIX = "tracker-done-";

export function readDoneIds(): Set<string> {
  const ids = new Set<string>();
  if (typeof window === "undefined") return ids;
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(DONE_PREFIX) && sessionStorage.getItem(k) === "1") ids.add(k.slice(DONE_PREFIX.length));
    }
  } catch {
    /* ignore */
  }
  return ids;
}

// Wipe ALL tracker session state (added tasks/notes, note bodies, pins,
// approvals, done, trash) — used by Reset Demo to return to the seed.
export function clearSessionTracker() {
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith("tracker-")) keys.push(k);
    }
    keys.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

export function clearDone() {
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(DONE_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

// Recently "tossed" cards (the Fun design's bin) — most-recent first, capped 50,
// persisted for the session and cleared on demo reset.
const TRASH_KEY = "tracker-trash";

export function readTrash(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(TRASH_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

export function pushTrash(task: Task) {
  try {
    const next = [task, ...readTrash().filter((t) => t.id !== task.id)].slice(0, 50);
    sessionStorage.setItem(TRASH_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function removeTrash(id: string) {
  try {
    sessionStorage.setItem(TRASH_KEY, JSON.stringify(readTrash().filter((t) => t.id !== id)));
  } catch {
    /* ignore */
  }
}

// Imperative completion (for non-hook callers, e.g. after a toss animation).
export function markDone(id: string) {
  try {
    sessionStorage.setItem(DONE_PREFIX + id, "1");
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(DONE_EVENT, { detail: { id, done: true } }));
}

// Un-complete (restore) — clears the done flag and notifies listeners.
export function markUndone(id: string) {
  try {
    sessionStorage.removeItem(DONE_PREFIX + id);
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(DONE_EVENT, { detail: { id, done: false } }));
}

export function useSessionDone(id: string): [boolean, (v: boolean) => void] {
  const key = DONE_PREFIX + id;
  const [done, setDoneState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(key) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string; done: boolean }>).detail;
      if (detail.id === id) setDoneState(detail.done);
    };
    window.addEventListener(DONE_EVENT, handler);
    return () => window.removeEventListener(DONE_EVENT, handler);
  }, [id]);

  const setDone = (v: boolean) => {
    setDoneState(v);
    try {
      sessionStorage.setItem(key, v ? "1" : "");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent(DONE_EVENT, { detail: { id, done: v } }));
  };

  return [done, setDone];
}

export function useSessionString(key: string, initial: string): [string, (v: string) => void] {
  const [value, setValue] = useState<string>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const stored = sessionStorage.getItem(key);
      return stored ?? initial;
    } catch {
      return initial;
    }
  });

  const set = (v: string) => {
    setValue(v);
    try {
      sessionStorage.setItem(key, v);
    } catch {
      /* ignore */
    }
  };

  return [value, set];
}

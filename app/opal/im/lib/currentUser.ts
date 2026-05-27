// Runtime user identity for the IM prototype.
// Persisted in localStorage so each browser tab can act as a different user
// (open Tab 1 as Pei, Tab 2 as Frank, Tab 3 as Henry the VAU, etc.)

const STORAGE_KEY = "opal-im-current-user";
const DEFAULT_USER_ID = "jamie";

type Listener = (userId: string) => void;
const listeners = new Set<Listener>();

function readStored(): string {
  if (typeof window === "undefined") return DEFAULT_USER_ID;
  try {
    return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_USER_ID;
  } catch {
    return DEFAULT_USER_ID;
  }
}

let cached: string = readStored();

export function getCurrentUserId(): string {
  // Re-read on each access so cross-tab updates via storage events stay fresh.
  if (typeof window !== "undefined") cached = readStored();
  return cached;
}

export function setCurrentUserId(userId: string) {
  cached = userId;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, userId);
    } catch {
      // ignore
    }
  }
  for (const l of listeners) l(userId);
}

export function subscribeToCurrentUser(listener: Listener): () => void {
  listeners.add(listener);
  // Cross-tab updates via storage event
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      cached = e.newValue;
      listener(e.newValue);
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

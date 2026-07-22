"use client";

// Show/hide the Planner ("Plan") item in the Opal left nav — a demo toggle.
// Backed by localStorage + a window event so the nav reacts without a reload,
// mirroring usePlannerLabel. Defaults to hidden (opt-in).
import { useEffect, useState } from "react";

const KEY = "opal-planner-nav-visible";
const EVENT = "opal-planner-nav-visibility-change";

export function readPlannerNavVisible(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // Hidden unless explicitly turned on.
    return localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

export function setPlannerNavVisible(visible: boolean) {
  try {
    localStorage.setItem(KEY, String(visible));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: visible }));
}

export function usePlannerNavVisible(): boolean {
  // Default to hidden on the server + first client render to avoid a
  // hydration mismatch, then sync from storage.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readPlannerNavVisible());
    const handler = (e: Event) => setVisible((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  return visible;
}

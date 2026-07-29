"use client";

// Configurable label for the Tracker sidebar — default "Planner", alternate
// "Tracker". Backed by localStorage + a window event so the drawer, the global
// header button, and the IM "Add to …" action stay in sync without a reload.
import { useEffect, useState } from "react";

export type PlannerLabel = "Planner" | "Tracker";

const KEY = "opal-planner-label";
const EVENT = "opal-planner-label-change";

export function readPlannerLabel(): PlannerLabel {
  if (typeof window === "undefined") return "Planner";
  try {
    return localStorage.getItem(KEY) === "Tracker" ? "Tracker" : "Planner";
  } catch {
    return "Planner";
  }
}

export function setPlannerLabel(label: PlannerLabel) {
  try {
    localStorage.setItem(KEY, label);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: label }));
}

export function usePlannerLabel(): PlannerLabel {
  // Default to "Planner" on the server + first client render to avoid a
  // hydration mismatch, then sync from storage.
  const [label, setLabel] = useState<PlannerLabel>("Planner");

  useEffect(() => {
    setLabel(readPlannerLabel());
    const handler = (e: Event) => setLabel((e as CustomEvent<PlannerLabel>).detail);
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  return label;
}

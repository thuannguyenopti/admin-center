"use client";

// Which design the sticky tray (TrackerPanel) renders for its list section.
// Backed by localStorage + a window event so the tray and the demo settings
// selector stay in sync without a reload — mirrors usePlannerLabel.
//   rich   — the Figma "Planner — List" design
//   ready  — "good to go" (default): rich cards on the Fun tray background +
//            Fun's toss-to-trashcan (no checkbox flip), auto-sorts new cards,
//            no sort button / unsorted drawer
//   fun    — editorial "paper cards" with crumple-to-bin micro-interactions
//   basic  — the original Board design
import { useEffect, useState } from "react";

export type TrayDesign = "rich" | "fun" | "basic" | "ready";

const KEY = "opal-tray-design";
const EVENT = "opal-tray-design-change";
const VALID: TrayDesign[] = ["rich", "fun", "basic", "ready"];

export function readTrayDesign(): TrayDesign {
  if (typeof window === "undefined") return "ready";
  try {
    const v = localStorage.getItem(KEY) as TrayDesign | null;
    return v && VALID.includes(v) ? v : "ready";
  } catch {
    return "ready";
  }
}

export function setTrayDesign(design: TrayDesign) {
  try {
    localStorage.setItem(KEY, design);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: design }));
}

export function useTrayDesign(): TrayDesign {
  // Default to "ready" on the server + first client render to avoid a hydration
  // mismatch, then sync from storage.
  const [design, setDesign] = useState<TrayDesign>("ready");

  useEffect(() => {
    setDesign(readTrayDesign());
    const handler = (e: Event) => setDesign((e as CustomEvent<TrayDesign>).detail);
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  return design;
}

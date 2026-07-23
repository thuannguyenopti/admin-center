// Shared filtering for the tracker tray — search query + the Filter popover
// (item TYPE checkboxes + a "Created by" picker). Every list design runs its
// visible items through passesFilter so the header filter works everywhere.
import type { Task } from "./types";

export type TypeKey = "todo" | "note";
export const ALL_CREATORS = "all";

export type TrackerFilters = { types: TypeKey[]; createdBy: string; pinnedOnly: boolean };

// Types start unchecked — no selection means "no type constraint" (show all).
export const DEFAULT_FILTERS: TrackerFilters = { types: [], createdBy: ALL_CREATORS, pinnedOnly: false };

export function taskTypeKey(task: Task): TypeKey {
  return task.itemType === "note" ? "note" : "todo";
}

// Who a card is attributed to — mirrors the card avatar logic (You / Opal / the
// VAU or person who created it).
export function taskCreator(task: Task): string {
  if (task.createdBy === "You" || task.avatarName === "You") return "You";
  if (task.createdBy) return task.createdBy;
  if (task.avatarName) return task.avatarName;
  return (task.createdIn ?? "Chat") === "Chat" ? "Opal" : "Unknown";
}

// A card added by a virtual teammate — VAU avatar or an agent vauName.
export function isVirtualTeammate(task: Task): boolean {
  return Boolean(task.vauName) || (task.avatarSrc?.startsWith("/avatars/vau-") ?? false);
}

// "Added by" options — me, Opal, and the virtual teammates who added a card
// here (not a global roster of everyone mentioned). You + Opal surface first.
export function collectAddedBy(tasks: Task[]): string[] {
  const hasYou = tasks.some((t) => taskCreator(t) === "You");
  const hasOpal = tasks.some((t) => taskCreator(t) === "Opal");
  const vaus = new Set<string>();
  for (const t of tasks) if (isVirtualTeammate(t)) vaus.add(taskCreator(t));
  const head: string[] = [];
  if (hasYou) head.push("You");
  if (hasOpal) head.push("Opal");
  return [...head, ...[...vaus].sort((a, b) => a.localeCompare(b))];
}

export function passesFilter(task: Task, filters: TrackerFilters | undefined, query: string, pinnedIds?: Set<string>): boolean {
  const q = query.trim().toLowerCase();
  if (q && !task.title.toLowerCase().includes(q)) return false;
  if (!filters) return true;
  // No type checked → no type constraint; otherwise keep only checked types.
  if (filters.types.length > 0 && !filters.types.includes(taskTypeKey(task))) return false;
  if (filters.createdBy !== ALL_CREATORS && taskCreator(task) !== filters.createdBy) return false;
  // Pinned-only — only enforced when the caller supplies the pinned-id set
  // (pin state is session-scoped, so lists that don't track it opt out).
  if (filters.pinnedOnly && pinnedIds && !pinnedIds.has(task.id)) return false;
  return true;
}

// Whether any filter is applied (drives the button's active state).
export function filtersActive(f: TrackerFilters): boolean {
  return f.types.length > 0 || f.createdBy !== ALL_CREATORS || f.pinnedOnly;
}

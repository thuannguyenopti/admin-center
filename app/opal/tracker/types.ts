// Shared types for the Tracker (universal capture surface).
// A single list holds items of different kinds — tasks, notes, and rich
// Opal-generated checklist cards ("smart stickies").

export type FilterTab = "mine" | "vau" | "approvals";
export type TaskStatus = "pending" | "approved" | "rejected" | "done";
export type ViewMode = "list" | "board" | "kanban" | "calendar";
export type ItemType = "task" | "note" | "checklist";

export type ChecklistItem = { id: string; text: string; bold?: string; checked: boolean };
export type ChecklistGroup = { name: string; emoji: string; items: ChecklistItem[] };

export type Task = {
  id: string;
  title: string;
  description?: string;
  badgeLabel?: string;
  badgeIntent?: "information" | "success" | "warning" | "neutral";
  due?: string;
  overdue?: boolean;
  type: "normal" | "approval" | "agent";
  vauName?: string;
  /** Who created the item — e.g. "Opal", an agent, or a virtual teammate. */
  createdBy?: string;
  /** Where it was created — e.g. "Chat" or "IM". */
  createdIn?: string;
  itemType?: ItemType;
  checklistGroups?: ChecklistGroup[];
  checklistSource?: string;
  // ── Rich-design fields (Option 1 "Rich" tray layout) ────────────────────────
  // All optional so the Basic/Board views and other renderers ignore them.
  /** Leading avatar for rich cards — src (image) and/or name (initials fallback). */
  avatarSrc?: string;
  avatarName?: string;
  /** Thread/comment count shown in the card footer next to the badge. */
  commentCount?: number;
  /** Tinted content-block preview (e.g. the green HITL/PRD block). `contents` is
   *  an optional table-of-contents shown in the detail view ("more info"). */
  preview?: { emoji?: string; title: string; body: string; contents?: string[] };
  /** Path (under /public) to an embedded image preview. */
  previewImage?: string;
  /** Renders a bell leading icon instead of an avatar (reminder items). */
  reminder?: boolean;
};

export type WorkflowTemplate = { id: string; name: string; meta: string };

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  { id: "review", name: "Review & Approve", meta: "2 steps · Approvals" },
  { id: "campaign", name: "Campaign Brief", meta: "4 steps · Marketing" },
  { id: "content", name: "Content Production", meta: "5 steps · CMP" },
  { id: "sprint", name: "Design Sprint", meta: "3 steps · Design" },
];

export const VIEW_LABELS: Record<ViewMode, string> = {
  list: "List",
  board: "Board",
  kanban: "Kanban",
  calendar: "Calendar",
};

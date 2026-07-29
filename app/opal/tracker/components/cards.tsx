"use client";

import { useState } from "react";
import { Box, Text, Button, Badge, Checkbox, Tooltip, Link } from "@optiaxiom/react";
import { IconFileLines, IconListCheck, IconThumbtack, IconThumbtackSolid } from "@optiaxiom/icons";
import type { Task } from "../types";
import { useSessionPin, useSessionApproval } from "../useSessionTasks";

// Fixed leading slot so the checkbox / type icons share one column and every
// row title starts at the same x.
export function LeadingSlot({ children, onClick }: { children: React.ReactNode; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <Box onClick={onClick} display="inline-flex" alignItems="center" justifyContent="center" style={{ width: 24, height: 24, flexShrink: 0 }}>
      {children}
    </Box>
  );
}

// Quick pin toggle shown on each row — reveals on hover (via .row-pin CSS) and
// stays visible while pinned. Shares state with the detail screen's pin.
// Positioned absolutely at the card's top-right, just below the due-date row,
// so revealing it never shifts the title-row layout (the date stays put) and
// the pin reads as sitting under the date. Parent card must be position: relative.
export function RowPin({ id, top = 28, center = false, inline = false, size = "lg", centerNudge = 0 }: { id: string; top?: number; center?: boolean; inline?: boolean; size?: "md" | "lg"; centerNudge?: number }) {
  const [pinned, toggle] = useSessionPin(id);
  return (
    <Box
      className={pinned ? "row-pin pinned" : "row-pin"}
      style={
        inline
          ? { flexShrink: 0 }
          : {
              position: "absolute",
              right: 8,
              flexShrink: 0,
              // Opaque chip so the pin never shows the card/text through it.
              background: "var(--ax-colors-bg-default)",
              borderRadius: 8,
              boxShadow: "var(--ax-shadows-sm)",
              // centerNudge shifts the centered chip up by N px (e.g. to sit
              // above a bottom-anchored action).
              ...(center ? { top: "50%", transform: `translateY(calc(-50% - ${centerNudge}px))` } : { top }),
            }
      }
    >
      <Tooltip content={pinned ? "Unpin" : "Pin"} delayDuration={300}>
        <Button
          appearance="subtle"
          size={size}
          aria-label={pinned ? "Unpin" : "Pin"}
          onClick={(e) => { e.stopPropagation(); toggle(); }}
          icon={pinned ? <IconThumbtackSolid style={{ color: "var(--ax-colors-fg-accent-strong)" }} /> : <IconThumbtack />}
        />
      </Tooltip>
    </Box>
  );
}

// ── Rich task card (board + kanban) ───────────────────────────────────────────

export function TaskCardContent({ task }: { task: Task }) {
  const [done, setDone] = useState(false);
  const [approval] = useSessionApproval(task.id);
  const isApproval = task.type === "approval";
  const isAgent = task.type === "agent";
  const isNote = task.itemType === "note";
  const isDone = !isApproval && !isNote && done;

  // Resource-Management V3 card: white surface, xs shadow, left accent border.
  const accent = isApproval ? "border.warning" : "border.success";

  return (
    <Box bg="bg.default" rounded="md" shadow="sm" borderL="2" borderColor={accent} px="12" py="8" display="flex" alignItems={isNote ? "center" : "start"} gap="10" style={{ position: "relative" }}>
      <RowPin id={task.id} center={isNote} />
      {/* Notes lead with a file icon (never a checkbox); approvals are actioned
          in the detail view; everything else gets a completion checkbox. */}
      {isNote ? (
        <Box pt="2" color="fg.warning" display="inline-flex" style={{ flexShrink: 0 }}>
          <IconFileLines size={18} />
        </Box>
      ) : !isApproval ? (
        <Box onClick={(e) => e.stopPropagation()} pt="2">
          <Checkbox checked={done} onCheckedChange={setDone} aria-label="Complete" />
        </Box>
      ) : null}

      <Box flex="1" display="flex" flexDirection="column" gap="4">
        <Box display="flex" alignItems="center" gap="8">
          <Text flex="1" fontSize="md" fontWeight="500" color={isDone ? "fg.tertiary" : "fg.default"} truncate style={{ textDecoration: isDone ? "line-through" : "none" }}>
            {task.title}
          </Text>
          {task.due && (
            <Text fontSize="sm" color={task.overdue ? "fg.warning.strong" : "fg.secondary"} style={{ flexShrink: 0 }}>
              {task.due}
            </Text>
          )}
        </Box>

        {isApproval && approval === "pending" && (
          <Text fontSize="sm" color="fg.secondary">
            Submitted for your review.{" "}
            <Link href="#" onClick={(e) => e.stopPropagation()}>View work</Link>
          </Text>
        )}
        {isApproval && approval === "approved" && <Text fontSize="xs" color="fg.success">Approved</Text>}
        {isApproval && approval === "rejected" && <Text fontSize="xs" color="fg.error">Change requested</Text>}

        {isAgent && !isDone && (
          <Box display="flex" alignItems="center" gap="6" mt="2">
            <Box rounded="full" bg="bg.success" style={{ width: 6, height: 6, flexShrink: 0 }} />
            <Text fontSize="xs" fontWeight="500" color="fg.success">
              {task.vauName} working
            </Text>
          </Box>
        )}

        {/* Category tag — metadata footer row */}
        {task.badgeLabel && (
          <Box display="flex" alignItems="center" gap="6" flexWrap="wrap">
            <Badge intent={task.badgeIntent ?? "neutral"}>{task.badgeLabel}</Badge>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ── Flat list row (plain task) ────────────────────────────────────────────────

export function FlatTaskRow({ task, onSelect }: { task: Task; onSelect: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <Box
      className="tracker-row"
      display="flex"
      alignItems={task.description ? "start" : "center"}
      gap="12"
      px="8"
      py="12"
      rounded="md"
      borderB="1"
      borderColor="border.secondary"
      onClick={onSelect}
      style={{ cursor: "pointer", position: "relative" }}
    >
      <RowPin id={task.id} />
      <LeadingSlot onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={done} onCheckedChange={setDone} aria-label="Complete" />
      </LeadingSlot>
      <Box flex="1" display="flex" flexDirection="column" gap="2" style={{ minWidth: 0 }}>
        <Box display="flex" alignItems="center" gap="8">
          <Text flex="1" fontSize="md" color={done ? "fg.tertiary" : "fg.default"} truncate style={{ textDecoration: done ? "line-through" : "none" }}>
            {task.title}
          </Text>
          {task.due && (
            <Text fontSize="sm" color={task.overdue ? "fg.warning.strong" : "fg.secondary"} style={{ flexShrink: 0 }}>
              {task.due}
            </Text>
          )}
        </Box>
        {task.description && (
          <Text fontSize="sm" color="fg.tertiary" truncate>
            {task.description}
          </Text>
        )}
      </Box>
    </Box>
  );
}

// ── Note row ──────────────────────────────────────────────────────────────────

export function NoteRow({ task, onSelect }: { task: Task; onSelect: () => void }) {
  return (
    <Box
      className="tracker-row"
      display="flex"
      alignItems={task.description ? "start" : "center"}
      gap="12"
      px="8"
      py="12"
      rounded="md"
      borderB="1"
      borderColor="border.secondary"
      onClick={onSelect}
      style={{ cursor: "pointer", position: "relative" }}
    >
      <RowPin id={task.id} />
      <LeadingSlot>
        <IconFileLines size={18} color="var(--ax-colors-fg-warning)" />
      </LeadingSlot>
      <Box flex="1" display="flex" flexDirection="column" gap="2" style={{ minWidth: 0 }}>
        <Box display="flex" alignItems="center" gap="8">
          <Text flex="1" fontSize="md" color="fg.default" truncate>
            {task.title}
          </Text>
        </Box>
        {task.description && (
          <Text fontSize="sm" color="fg.tertiary" truncate>
            {task.description}
          </Text>
        )}
      </Box>
    </Box>
  );
}

// ── Checklist card (the "smart sticky") ───────────────────────────────────────

export function ChecklistCard({ task, onSelect }: { task: Task; onSelect: () => void }) {
  const groups = task.checklistGroups ?? [];
  const allItems = groups.flatMap((g) => g.items);
  const totalCount = allItems.length;
  const doneCount = allItems.filter((i) => i.checked).length;
  const preview = allItems.slice(0, 2).map((i) => (i.bold ?? "") + i.text);

  return (
    <Box
      className="tracker-row"
      px="8"
      py="12"
      rounded="md"
      borderB="1"
      borderColor="border.secondary"
      onClick={onSelect}
      style={{ cursor: "pointer", position: "relative" }}
    >
      <RowPin id={task.id} />
      <Box display="flex" alignItems="center" gap="12" mb="6">
        <LeadingSlot>
          <IconListCheck size={18} color="var(--ax-colors-fg-accent-strong)" />
        </LeadingSlot>
        <Text flex="1" fontSize="md" color="fg.default" truncate>
          {task.title}
        </Text>
        {task.checklistSource && (
          <Badge intent="success" variant="subtle">
            {task.checklistSource}
          </Badge>
        )}
        <Text fontSize="xs" color="fg.tertiary" >
          {doneCount}/{totalCount}
        </Text>
      </Box>

      <Box display="flex" gap="12">
        <Box style={{ width: 24, flexShrink: 0 }} />
        <Box display="flex" flexDirection="column" gap="2" flex="1" style={{ minWidth: 0 }}>
          {preview.map((line, i) => (
            <Text key={i} fontSize="sm" color="fg.tertiary" truncate>
              {line}
            </Text>
          ))}
          {totalCount > 2 && (
            <Text fontSize="sm" color="fg.tertiary">
              +{totalCount - 2} more items
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}

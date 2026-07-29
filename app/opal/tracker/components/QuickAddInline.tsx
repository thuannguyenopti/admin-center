"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Button, Input, Tooltip } from "@optiaxiom/react";
import { IconListCheck, IconFileLines, IconFilePen, IconXmark } from "@optiaxiom/icons";
import type { Task } from "../types";

const DUE_MAP: Record<string, string> = { Today: "Jul 7", Tomorrow: "Jul 8" };

// On-demand capture bar. Type is chosen on the toolbar "+ Add" menu.
// Enter → quick add (stays open for rapid entry).
// Shift+Enter or the "open details" button → add and open in the detail slider,
// where the description / body is written.
// Escape or ✕ dismisses. "tomorrow"/"today" in the title auto-sets a due date.
export function QuickAddInline({
  itemType,
  onAdd,
  onClose,
}: {
  itemType: "task" | "note";
  onAdd: (task: Task, open?: boolean) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const isNote = itemType === "note";

  useEffect(() => {
    if (isNote || due) return;
    const lower = title.toLowerCase();
    if (lower.includes("tomorrow")) setDue("Tomorrow");
    else if (lower.includes("today")) setDue("Today");
  }, [title, due, isNote]);

  const commit = (open: boolean) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(
      {
        id: `new-${title.length}-${Math.round(performance.now())}`,
        title: trimmed,
        type: "normal",
        itemType: isNote ? "note" : undefined,
        due: !isNote && due ? DUE_MAP[due] : undefined,
        // Entered by me → my avatar (not Opal).
        createdBy: "You",
        avatarSrc: "/avatars/avatar-3.png",
      },
      open,
    );
    setTitle("");
    setDue(null);
    if (!open) titleRef.current?.focus();
  };

  return (
    <Box display="flex" alignItems="center" gap="8" px="0" py="12" borderB="1" borderColor="border.secondary" style={{ flexShrink: 0 }}>
      {/* Leading treatment mirrors the Add menu: a type-colored accent bar +
          the type icon. Bar = type color (to-do fg.information / note
          border.control); icon color matches the menu (to-do fg.information,
          note fg.default). */}
      <Box display="flex" alignItems="center" gap="4" style={{ flexShrink: 0 }}>
        <Box style={{ width: 3, height: 18, borderRadius: 999, background: isNote ? "var(--ax-colors-border-control)" : "var(--ax-colors-fg-information)", flexShrink: 0 }} />
        <Box display="inline-flex" style={{ color: isNote ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-information)" }}>
          {isNote ? <IconFileLines size="16" /> : <IconListCheck size="16" />}
        </Box>
      </Box>

      <Box flex="1">
        <Input
          ref={titleRef}
          size="lg"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              e.preventDefault();
              commit(true);
            } else if (e.key === "Enter") {
              commit(false);
            } else if (e.key === "Escape") {
              onClose();
            }
          }}
          placeholder={isNote ? "Write a note…  (⇧⏎ to open details)" : "Add a task — try “review deck tomorrow”  (⇧⏎ to open details)"}
        />
      </Box>

      <Box display="flex" alignItems="center" gap="4" style={{ flexShrink: 0 }}>
        <Tooltip content="Add details">
          <Button appearance="subtle" size="md" icon={<IconFilePen />} aria-label="Add details" disabled={!title.trim()} onClick={() => commit(true)} />
        </Tooltip>
        <Button appearance="subtle" size="md" icon={<IconXmark />} aria-label="Close" onClick={onClose} />
      </Box>
    </Box>
  );
}

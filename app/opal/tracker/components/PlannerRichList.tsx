"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Text, Input, Badge } from "@optiaxiom/react";
import { IconPlus } from "@optiaxiom/icons";
import type { Task } from "../types";
import { RICH_GROUPS } from "../data";
import { readDoneIds } from "../useSessionTasks";
import { passesFilter, filtersActive, type TrackerFilters } from "../filters";
import { RichPlannerCard, ChecklistPlannerCard, NotePlannerCard } from "./plannerCards";

type Section = { id: string; name: string; tasks: Task[] };

// Every task is an avatar-led rich card (title + description, avatar flips to a
// checkbox on hover); notes and checklists get their own treatments.
function CardFor({ task, onSelect }: { task: Task; onSelect: () => void }) {
  if (task.itemType === "note") return <NotePlannerCard task={task} onSelect={onSelect} />;
  if (task.itemType === "checklist") return <ChecklistPlannerCard task={task} onSelect={onSelect} />;
  return <RichPlannerCard task={task} onSelect={onSelect} />;
}

// "Rich" tray design (Option 1). Same section + drag-reorder model as ListView,
// with the richer card renderers and a query filter for the header search.
export function PlannerRichList({
  extraTasks,
  deletedIds,
  onSelectTask,
  px = "8",
  query = "",
  filter,
}: {
  extraTasks: Task[];
  deletedIds: Set<string>;
  onSelectTask: (t: Task) => void;
  px?: "0" | "8" | "16" | "24" | "32";
  query?: string;
  filter?: TrackerFilters;
}) {
  const [sections, setSections] = useState<Section[]>(
    RICH_GROUPS.map((g, i) => ({ id: `rich-${i}-${g.name}`, name: g.name, tasks: g.tasks })),
  );
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  // Items completed in a previous open are filtered out (captured once at mount,
  // so items completed during this session stay visible/collapsed until reopen).
  const [hiddenDone] = useState(() => readDoneIds());

  // Prepend newly captured items into the first section.
  useEffect(() => {
    setSections((prev) => {
      const existing = new Set(prev.flatMap((s) => s.tasks.map((t) => t.id)));
      const newOnes = extraTasks.filter((t) => !existing.has(t.id));
      if (!newOnes.length) return prev;
      return prev.map((s, i) => (i === 0 ? { ...s, tasks: [...newOnes, ...s.tasks] } : s));
    });
  }, [extraTasks]);

  const dragId = useRef<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const reset = () => {
    dragId.current = null;
    setActiveId(null);
    setOverId(null);
  };

  const moveBefore = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setSections((prev) => {
      const next = prev.map((s) => ({ ...s, tasks: [...s.tasks] }));
      let from = -1;
      let fromIdx = -1;
      next.forEach((s, si) => {
        const fi = s.tasks.findIndex((t) => t.id === fromId);
        if (fi >= 0) {
          from = si;
          fromIdx = fi;
        }
      });
      if (from < 0) return prev;
      const [moved] = next[from].tasks.splice(fromIdx, 1);
      const toSection = next.find((s) => s.tasks.some((t) => t.id === toId));
      if (!toSection) return prev;
      const insertAt = toSection.tasks.findIndex((t) => t.id === toId);
      toSection.tasks.splice(insertAt, 0, moved);
      return next;
    });
  };

  const rowProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      dragId.current = id;
      setActiveId(id);
      e.dataTransfer.effectAllowed = "move";
      try {
        e.dataTransfer.setData("text/plain", id);
      } catch {
        /* ignore */
      }
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragId.current && dragId.current !== id) setOverId(id);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragId.current) moveBefore(dragId.current, id);
      reset();
    },
    onDragEnd: reset,
  });

  const confirmAddSection = () => {
    const name = newSectionName.trim();
    if (name) setSections((prev) => [...prev, { id: `sec-${prev.length}-${name}`, name, tasks: [] }]);
    setNewSectionName("");
    setAddingSection(false);
  };

  const anyFilter = query.trim().length > 0 || (filter ? filtersActive(filter) : false);

  return (
    <Box flex="1" overflow="auto" px={px} pt="4" pb="24">
      {sections.map((section) => {
        const visible = section.tasks.filter(
          (t) => !deletedIds.has(t.id) && !hiddenDone.has(t.id) && passesFilter(t, filter, query),
        );
        if (anyFilter && visible.length === 0) return null;
        return (
          <Box key={section.id} mb="8">
            <Box display="flex" alignItems="center" justifyContent="space-between" px="8" pt="16" pb="4">
              <Text fontFamily="mono" fontSize="sm" fontWeight="400" color="fg.tertiary" textTransform="uppercase">
                {section.name}
              </Text>
              <Badge intent="information">{visible.length}</Badge>
            </Box>

            {visible.map((task) => (
              <Box
                key={task.id}
                {...rowProps(task.id)}
                style={{
                  opacity: activeId === task.id ? 0.4 : 1,
                  borderTop: overId === task.id ? "2px solid var(--ax-colors-border-accent)" : "2px solid transparent",
                }}
              >
                <CardFor task={task} onSelect={() => onSelectTask(task)} />
              </Box>
            ))}
          </Box>
        );
      })}

      {addingSection ? (
        <Box mx="8" style={{ maxWidth: 320 }}>
          <Input
            autoFocus
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmAddSection();
              if (e.key === "Escape") {
                setAddingSection(false);
                setNewSectionName("");
              }
            }}
            onBlur={confirmAddSection}
            placeholder="Section name…"
          />
        </Box>
      ) : (
        <Box display="flex" alignItems="center" gap="8" py="10" px="8" color="fg.tertiary" onClick={() => setAddingSection(true)} style={{ cursor: "pointer" }}>
          <IconPlus size="16" />
          <Text fontSize="sm" color="fg.tertiary">Add section</Text>
        </Box>
      )}
    </Box>
  );
}

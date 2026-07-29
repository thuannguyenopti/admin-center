"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Text, Input, Badge } from "@optiaxiom/react";
import { IconPlus } from "@optiaxiom/icons";
import type { Task } from "../types";
import { INITIAL_GROUPS } from "../data";
import { passesFilter, filtersActive, type TrackerFilters } from "../filters";
import { TaskCardContent } from "./cards";

// Board — tasks grouped into named sections. Cards can be dragged to reorder
// within a section or moved across sections (drop on a card to insert before
// it, or on an empty section's drop-zone to append).
export function BoardView({
  extraTasks,
  deletedIds,
  onSelectTask,
  px = "32",
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
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  useEffect(() => {
    setGroups((prev) => {
      const existing = new Set(prev.flatMap((g) => g.tasks.map((t) => t.id)));
      const newOnes = extraTasks.filter((t) => !existing.has(t.id));
      if (!newOnes.length) return prev;
      return prev.map((g, i) => (i === 0 ? { ...g, tasks: [...newOnes, ...g.tasks] } : g));
    });
  }, [extraTasks]);

  const dragId = useRef<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [overSection, setOverSection] = useState<string | null>(null);
  const reset = () => {
    dragId.current = null;
    setActiveId(null);
    setOverId(null);
    setOverSection(null);
  };

  // Move the dragged card to sit before `toId` (works across sections).
  const moveBefore = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setGroups((prev) => {
      const next = prev.map((g) => ({ ...g, tasks: [...g.tasks] }));
      let fromG = -1;
      let fromIdx = -1;
      next.forEach((g, gi) => {
        const fi = g.tasks.findIndex((t) => t.id === fromId);
        if (fi >= 0) {
          fromG = gi;
          fromIdx = fi;
        }
      });
      if (fromG < 0) return prev;
      const [moved] = next[fromG].tasks.splice(fromIdx, 1);
      const toGroup = next.find((g) => g.tasks.some((t) => t.id === toId));
      if (!toGroup) return prev;
      const insertAt = toGroup.tasks.findIndex((t) => t.id === toId);
      toGroup.tasks.splice(insertAt, 0, moved);
      return next;
    });
  };

  // Move the dragged card to the end of a section (drop on the empty drop-zone).
  const moveToSection = (fromId: string, sectionName: string) => {
    setGroups((prev) => {
      const next = prev.map((g) => ({ ...g, tasks: [...g.tasks] }));
      const from = next.find((g) => g.tasks.some((t) => t.id === fromId));
      const to = next.find((g) => g.name === sectionName);
      if (!from || !to || from.name === to.name) return prev;
      const idx = from.tasks.findIndex((t) => t.id === fromId);
      const [moved] = from.tasks.splice(idx, 1);
      to.tasks.push(moved);
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
    if (name) setGroups((prev) => [...prev, { name, tasks: [] }]);
    setNewSectionName("");
    setAddingSection(false);
  };

  return (
    <Box flex="1" overflow="auto" px={px} pt="4" pb="24">
      {groups.map((group) => {
        const anyFilter = query.trim().length > 0 || (filter ? filtersActive(filter) : false);
        const visible = group.tasks.filter(
          (t) => !deletedIds.has(t.id) && passesFilter(t, filter, query),
        );
        // When searching / filtering, drop sections with no matches entirely.
        if (anyFilter && visible.length === 0) return null;
        return (
          <Box key={group.name} mb="20">
            <Box display="flex" alignItems="center" justifyContent="space-between" px="2" mb="6">
              <Text fontFamily="mono" fontSize="xs" fontWeight="400" color="fg.tertiary" textTransform="uppercase">
                {group.name}
              </Text>
              <Badge intent="information">{visible.length}</Badge>
            </Box>

            <Box display="flex" flexDirection="column" gap="4">
              {visible.map((task) => (
                <Box
                  key={task.id}
                  className="tracker-row"
                  {...rowProps(task.id)}
                  onClick={() => onSelectTask(task)}
                  style={{
                    cursor: "pointer",
                    opacity: activeId === task.id ? 0.4 : 1,
                    borderTop: overId === task.id ? "2px solid var(--ax-colors-border-accent)" : "2px solid transparent",
                  }}
                >
                  <TaskCardContent task={task} />
                </Box>
              ))}
            </Box>

            {visible.length === 0 && (
              <Box
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverSection(group.name);
                }}
                onDragLeave={() => setOverSection((cur) => (cur === group.name ? null : cur))}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragId.current) moveToSection(dragId.current, group.name);
                  reset();
                }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                rounded="lg"
                border="1"
                borderColor={overSection === group.name ? "border.accent" : "border.secondary"}
                py="12"
                style={{ borderStyle: "dashed" }}
              >
                <Text fontSize="sm" color="fg.tertiary">Drop tasks here</Text>
              </Box>
            )}
          </Box>
        );
      })}

      {addingSection ? (
        <Box mb="8" style={{ maxWidth: 320 }}>
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
        <Box display="flex" alignItems="center" gap="8" py="10" px="2" color="fg.tertiary" onClick={() => setAddingSection(true)} style={{ cursor: "pointer" }}>
          <IconPlus size="16" />
          <Text fontSize="sm" color="fg.tertiary">Add section</Text>
        </Box>
      )}
    </Box>
  );
}

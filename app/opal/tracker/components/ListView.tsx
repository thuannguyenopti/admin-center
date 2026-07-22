"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Text, Input, Badge } from "@optiaxiom/react";
import { IconPlus } from "@optiaxiom/icons";
import type { Task } from "../types";
import { INITIAL_GROUPS } from "../data";
import { ChecklistCard, FlatTaskRow, NoteRow } from "./cards";

type Section = { id: string; name: string | null; tasks: Task[] };

// Flat, drag-sortable list with user-addable sections. Items can be dragged
// to reorder within a section or moved across sections.
export function ListView({
  extraTasks,
  deletedIds,
  onSelectTask,
  px = "32",
}: {
  extraTasks: Task[];
  deletedIds: Set<string>;
  onSelectTask: (t: Task) => void;
  px?: "8" | "16" | "24" | "32";
}) {
  const allTasks = INITIAL_GROUPS.flatMap((g) => g.tasks);
  const [sections, setSections] = useState<Section[]>([{ id: "default", name: null, tasks: allTasks }]);
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

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
  const [overSection, setOverSection] = useState<string | null>(null);
  const reset = () => {
    dragId.current = null;
    setActiveId(null);
    setOverId(null);
    setOverSection(null);
  };

  // Move dragged item to sit before `toId` (works across sections).
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

  // Move dragged item to the end of a section (drop on the empty drop-zone).
  const moveToSection = (fromId: string, sectionId: string) => {
    setSections((prev) => {
      const next = prev.map((s) => ({ ...s, tasks: [...s.tasks] }));
      const from = next.find((s) => s.tasks.some((t) => t.id === fromId));
      const to = next.find((s) => s.id === sectionId);
      if (!from || !to || from.id === to.id) return prev;
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
    if (name) setSections((prev) => [...prev, { id: `sec-${prev.length}-${name}`, name, tasks: [] }]);
    setNewSectionName("");
    setAddingSection(false);
  };

  return (
    <Box flex="1" overflow="auto" px={px} pt="4" pb="24">
      {sections.map((section) => {
        const visible = section.tasks.filter((t) => !deletedIds.has(t.id));
        return (
          <Box key={section.id} mb="8">
            {section.name && (
              <Box display="flex" alignItems="center" justifyContent="space-between" px="8" pt="16" pb="4">
                <Text fontFamily="mono" fontSize="xs" fontWeight="400" color="fg.tertiary" textTransform="uppercase">
                  {section.name}
                </Text>
                <Badge intent="information">{visible.length}</Badge>
              </Box>
            )}

            {visible.map((task) => (
              <Box
                key={task.id}
                {...rowProps(task.id)}
                style={{
                  opacity: activeId === task.id ? 0.4 : 1,
                  borderTop: overId === task.id ? "2px solid var(--ax-colors-border-accent)" : "2px solid transparent",
                }}
              >
                {task.itemType === "checklist" ? (
                  <ChecklistCard task={task} onSelect={() => onSelectTask(task)} />
                ) : task.itemType === "note" ? (
                  <NoteRow task={task} onSelect={() => onSelectTask(task)} />
                ) : (
                  <FlatTaskRow task={task} onSelect={() => onSelectTask(task)} />
                )}
              </Box>
            ))}

            {section.name && visible.length === 0 && (
              <Box
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverSection(section.id);
                }}
                onDragLeave={() => setOverSection((cur) => (cur === section.id ? null : cur))}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragId.current) moveToSection(dragId.current, section.id);
                  reset();
                }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                rounded="md"
                border="1"
                borderColor={overSection === section.id ? "border.accent" : "border.secondary"}
                py="12"
                mx="8"
                style={{ borderStyle: "dashed" }}
              >
                <Text fontSize="sm" color="fg.tertiary">Drop tasks here</Text>
              </Box>
            )}
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

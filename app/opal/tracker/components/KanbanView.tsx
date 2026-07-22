"use client";

import { useRef, useState } from "react";
import { Box, Text } from "@optiaxiom/react";
import type { Task } from "../types";
import { INITIAL_LANES } from "../data";
import { TaskCardContent } from "./cards";

// Kanban — horizontal lanes with drag between columns (web adaptation of the
// mobile vertical lanes).
export function KanbanView({ onSelectTask, taskFilter }: { onSelectTask: (t: Task) => void; taskFilter?: (t: Task) => boolean }) {
  const keep = taskFilter ?? (() => true);
  const [lanes, setLanes] = useState(() => INITIAL_LANES.map((l) => ({ ...l, tasks: l.tasks.filter(keep) })));
  const dragId = useRef<string | null>(null);
  const [overLane, setOverLane] = useState<string | null>(null);

  const moveToLane = (taskId: string, destLabel: string) => {
    setLanes((prev) => {
      const srcLane = prev.find((l) => l.tasks.some((t) => t.id === taskId));
      if (!srcLane || srcLane.label === destLabel) return prev;
      const task = srcLane.tasks.find((t) => t.id === taskId)!;
      return prev.map((l) => {
        if (l.label === srcLane.label) return { ...l, tasks: l.tasks.filter((t) => t.id !== taskId) };
        if (l.label === destLabel) return { ...l, tasks: [...l.tasks, task] };
        return l;
      });
    });
  };

  return (
    <Box flex="1" overflow="auto" px="32" pt="4" pb="24">
      <Box display="flex" alignItems="start" gap="12" style={{ minHeight: "100%" }}>
        {lanes.map((lane) => {
          const isOver = overLane === lane.label;
          return (
            <Box
              key={lane.label}
              onDragOver={(e) => {
                e.preventDefault();
                setOverLane(lane.label);
              }}
              onDragLeave={() => setOverLane((cur) => (cur === lane.label ? null : cur))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId.current) moveToLane(dragId.current, lane.label);
                dragId.current = null;
                setOverLane(null);
              }}
              rounded="lg"
              p="8"
              border="1"
              bg={isOver ? "bg.accent.subtle" : "bg.page"}
              borderColor={isOver ? "border.accent" : "border.secondary"}
              style={{ width: 280, flexShrink: 0 }}
            >
              <Box display="flex" alignItems="center" gap="8" px="4" pt="4" pb="10">
                <Box rounded="full" style={{ width: 8, height: 8, flexShrink: 0, background: lane.color }} />
                <Text flex="1" fontSize="xs" fontWeight="600" color="fg.default" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {lane.label}
                </Text>
                <Text fontSize="xs" color="fg.tertiary">{lane.tasks.length}</Text>
              </Box>

              <Box display="flex" flexDirection="column" gap="6">
                {lane.tasks.map((task) => (
                  <Box
                    key={task.id}
                    className="tracker-row"
                    draggable
                    onDragStart={(e) => {
                      dragId.current = task.id;
                      e.dataTransfer.effectAllowed = "move";
                      try {
                        e.dataTransfer.setData("text/plain", task.id);
                      } catch {
                        /* ignore */
                      }
                    }}
                    onDragEnd={() => {
                      dragId.current = null;
                      setOverLane(null);
                    }}
                    onClick={() => onSelectTask(task)}
                    style={{ cursor: "pointer" }}
                  >
                    <TaskCardContent task={task} />
                  </Box>
                ))}

                {lane.tasks.length === 0 && (
                  <Box display="flex" alignItems="center" justifyContent="center" rounded="md" border="1" borderColor="border.secondary" py="12" style={{ borderStyle: "dashed" }}>
                    <Text fontSize="xs" color="fg.tertiary">Drop here</Text>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

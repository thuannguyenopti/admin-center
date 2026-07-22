"use client";

import { useState } from "react";
import { Box, Text, Badge, Checkbox } from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import type { Task } from "../types";
import { INITIAL_GROUPS } from "../data";

type Row = { task: Task; section: string };

function TaskCheckbox() {
  const [done, setDone] = useState(false);
  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <Checkbox checked={done} onCheckedChange={setDone} aria-label="Complete" />
    </Box>
  );
}

// Table view for the Tasks module — a flat, sortable-looking task table
// (no stickies/notes).
export function TableView({
  extraTasks,
  deletedIds,
  onSelectTask,
  taskFilter,
}: {
  extraTasks: Task[];
  deletedIds: Set<string>;
  onSelectTask: (t: Task) => void;
  taskFilter?: (t: Task) => boolean;
}) {
  const rows: Row[] = [
    ...extraTasks.map((t) => ({ task: t, section: "Added" })),
    ...INITIAL_GROUPS.flatMap((g) => g.tasks.map((t) => ({ task: t, section: g.name }))),
  ].filter((r) => (taskFilter ? taskFilter(r.task) : true) && !deletedIds.has(r.task.id));

  return (
    <Box flex="1" overflow="auto" px="32" pt="4" pb="24">
      <Table>
        <thead>
          <Tr>
            <Th style={{ width: 44, paddingLeft: 16, paddingRight: 0 }} />
            <Th>Task</Th>
            <Th style={{ width: 180 }}>Section</Th>
            <Th style={{ width: 120 }}>Due</Th>
          </Tr>
        </thead>
        <tbody>
          {rows.map(({ task, section }) => (
            <Tr key={task.id} onClick={() => onSelectTask(task)}>
              <Td style={{ width: 44, paddingLeft: 16, paddingRight: 0, verticalAlign: "middle" }}>
                <TaskCheckbox />
              </Td>
              <Td>
                <Text fontSize="md" color="fg.default">{task.title}</Text>
              </Td>
              <Td>
                <Badge intent="neutral" variant="subtle">{section}</Badge>
              </Td>
              <Td>
                {task.due ? (
                  <Text fontSize="sm" color={task.overdue ? "fg.warning.strong" : "fg.secondary"}>{task.due}</Text>
                ) : (
                  <Text fontSize="sm" color="fg.tertiary">—</Text>
                )}
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
}

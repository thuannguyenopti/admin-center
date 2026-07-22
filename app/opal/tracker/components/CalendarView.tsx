"use client";

import { useState } from "react";
import { Box, Text } from "@optiaxiom/react";
import type { Task } from "../types";
import { ALL_TASKS, CAL_DAYS, JULY_2026_OFFSET, JULY_DAYS, TASK_DOTS } from "../data";

// Month grid (July 2026) with per-day task dots and a day agenda below.
export function CalendarView({ onSelectTask, taskFilter }: { onSelectTask: (t: Task) => void; taskFilter?: (t: Task) => boolean }) {
  const [selected, setSelected] = useState(7);
  const tasks = taskFilter ? ALL_TASKS.filter(taskFilter) : ALL_TASKS;

  const cells: (number | null)[] = [
    ...Array(JULY_2026_OFFSET).fill(null),
    ...Array.from({ length: JULY_DAYS }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const dayTasks = tasks.filter((t) => t.due === `Jul ${selected}`);

  return (
    <Box flex="1" overflow="auto" px="32" pt="4" pb="24" style={{ maxWidth: 560 }}>
      <Text fontSize="md" fontWeight="600" color="fg.default" mb="12">
        July 2026
      </Text>

      <Box display="flex" mb="4">
        {CAL_DAYS.map((d, i) => (
          <Box key={i} flex="1" style={{ textAlign: "center" }}>
            <Text fontSize="xs" fontWeight="500" color="fg.tertiary">{d}</Text>
          </Box>
        ))}
      </Box>

      {Array.from({ length: cells.length / 7 }, (_, wi) => (
        <Box key={wi} display="flex" mb="2">
          {cells.slice(wi * 7, wi * 7 + 7).map((day, ci) => {
            const isToday = day === 7;
            const isSel = day === selected;
            const dotColor = day ? TASK_DOTS[day] : null;
            return (
              <Box
                key={ci}
                flex="1"
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap="2"
                py="4"
                onClick={() => day && setSelected(day)}
                style={{ cursor: day ? "pointer" : "default" }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  rounded="full"
                  bg={isSel ? "bg.accent" : undefined}
                  border={isToday && !isSel ? "1" : undefined}
                  borderColor={isToday && !isSel ? "border.accent" : undefined}
                  style={{ width: 30, height: 30 }}
                >
                  <Text fontSize="sm" fontWeight={isSel || isToday ? "600" : "400"} color={isSel ? "fg.white" : day ? "fg.default" : "fg.tertiary"}>
                    {day ?? ""}
                  </Text>
                </Box>
                {dotColor && <Box rounded="full" style={{ width: 4, height: 4, background: dotColor }} />}
              </Box>
            );
          })}
        </Box>
      ))}

      <Box mt="16" pt="12" borderT="1" borderColor="border.secondary">
        <Text fontSize="xs" fontWeight="600" color="fg.tertiary" mb="8" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Jul {selected}
        </Text>
        {dayTasks.map((task) => (
          <Box
            key={task.id}
            className="tracker-row"
            display="flex"
            alignItems="center"
            gap="10"
            px="8"
            py="8"
            rounded="md"
            borderB="1"
            borderColor="border.secondary"
            onClick={() => onSelectTask(task)}
            style={{ cursor: "pointer" }}
          >
            <Box rounded="full" bg={task.overdue ? "bg.warning" : "bg.tertiary"} style={{ width: 6, height: 6, flexShrink: 0 }} />
            <Text fontSize="sm" color="fg.default">{task.title}</Text>
          </Box>
        ))}
        {dayTasks.length === 0 && <Text fontSize="xs" color="fg.tertiary">No tasks</Text>}
      </Box>
    </Box>
  );
}

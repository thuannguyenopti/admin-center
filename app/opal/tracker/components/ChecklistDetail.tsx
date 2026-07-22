"use client";

import { useState } from "react";
import { Box, Text, Checkbox } from "@optiaxiom/react";
import type { Task } from "../types";

// Full grouped checklist shown in the detail panel — checkable items with a
// running progress count. This is the body of a "smart sticky".
export function ChecklistDetail({ task }: { task: Task }) {
  const [groups, setGroups] = useState(
    (task.checklistGroups ?? []).map((g) => ({ ...g, items: g.items.map((i) => ({ ...i })) })),
  );

  const toggle = (gIdx: number, iIdx: number) => {
    setGroups((prev) =>
      prev.map((g, gi) =>
        gi !== gIdx
          ? g
          : { ...g, items: g.items.map((item, ii) => (ii !== iIdx ? item : { ...item, checked: !item.checked })) },
      ),
    );
  };

  const allItems = groups.flatMap((g) => g.items);
  const doneCount = allItems.filter((i) => i.checked).length;
  const total = allItems.length;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" gap="8" mb="16">
        <Text fontSize="xs" color="fg.tertiary" style={{ fontStyle: "italic" }}>
          Review and check off these items as you catch up.
        </Text>
        <Text fontSize="xs" color="fg.tertiary" style={{ flexShrink: 0 }}>
          {doneCount}/{total}
        </Text>
      </Box>

      {groups.map((group, gi) => (
        <Box key={gi} mb="20" display="flex" flexDirection="column" gap="10">
          <Box display="flex" alignItems="center" gap="6">
            <Text fontSize="md">{group.emoji}</Text>
            <Text fontSize="sm" fontWeight="700" color="fg.default">
              {group.name}
            </Text>
          </Box>

          {group.items.map((item, ii) => (
            <Box key={item.id} display="flex" alignItems="start" gap="10" onClick={() => toggle(gi, ii)} style={{ cursor: "pointer" }}>
              <Box onClick={(e) => e.stopPropagation()} pt="2">
                <Checkbox checked={item.checked} onCheckedChange={() => toggle(gi, ii)} aria-label={item.bold ?? item.text} />
              </Box>
              <Text asChild fontSize="sm" color={item.checked ? "fg.tertiary" : "fg.default"} style={{ textDecoration: item.checked ? "line-through" : "none" }}>
                <span>
                  {item.bold && (
                    <Text asChild fontWeight="700">
                      <span>{item.bold}</span>
                    </Text>
                  )}
                  {item.text}
                </span>
              </Text>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

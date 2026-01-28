"use client";

import { Box, Button } from "@optiaxiom/react";
import { Pill, PillGroup } from "@optiaxiom/react/unstable";
import { Text } from "@/app/components/Text";
import { FilterPill } from "../hooks/useContentFilters";
import { IconX } from "@tabler/icons-react";

interface FilterPillsProps {
  pills: FilterPill[];
  onRemoveFilter: (category: string, value: string) => void;
  onClearAll: () => void;
}

export default function FilterPills({
  pills,
  onRemoveFilter,
  onClearAll,
}: FilterPillsProps) {
  if (pills.length === 0) {
    return null;
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="8"
      flexWrap="wrap"
    >
      <PillGroup>
        {pills.map((pill, index) => (
          <Pill
            key={`${pill.category}-${pill.value}-${index}`}
            onDismiss={() => onRemoveFilter(pill.category, pill.value)}
          >
            {pill.value}
          </Pill>
        ))}
      </PillGroup>
      {pills.length > 0 && (
        <Button
          appearance="subtle"
          size="sm"
          onClick={onClearAll}
        >
          Clear all
        </Button>
      )}
    </Box>
  );
}

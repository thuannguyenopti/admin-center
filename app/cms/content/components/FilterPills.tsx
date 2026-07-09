"use client";

import { Box, Button } from "@optiaxiom/react";
import { Pill, PillGroup } from "@optiaxiom/react/unstable";
import { Text } from "@/app/components/Text";
import { FilterPill } from "../hooks/useContentFilters";
import {IconXmark} from "@/app/lib/axiom-icons";

interface FilterPillsProps {
  pills: FilterPill[];
  onRemoveFilter: (category: string, value: string) => void;
  onClearAll: () => void;
  /** Resolve category slug to display name (from categories repository). */
  getCategoryNameBySlug?: (slug: string) => string | undefined;
}

export default function FilterPills({
  pills,
  onRemoveFilter,
  onClearAll,
  getCategoryNameBySlug,
}: FilterPillsProps) {
  if (pills.length === 0) {
    return null;
  }

  const pillLabel = (pill: FilterPill) =>
    pill.category === "Category" && getCategoryNameBySlug
      ? getCategoryNameBySlug(pill.value) ?? pill.value
      : pill.value;

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
            {pillLabel(pill)}
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

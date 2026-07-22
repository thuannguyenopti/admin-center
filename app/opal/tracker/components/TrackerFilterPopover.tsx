"use client";

import { Box, Text, Button, Checkbox, Menu, MenuTrigger, MenuContent, type MenuOption } from "@optiaxiom/react";
import { IconAngleDown } from "@optiaxiom/icons";
import { ALL_CREATORS, DEFAULT_FILTERS, filtersActive, type TrackerFilters, type TypeKey } from "../filters";

const TYPE_ROWS: { key: TypeKey; label: string; color: string }[] = [
  { key: "todo", label: "To-do", color: "var(--ax-colors-fg-information)" },
  { key: "note", label: "Note", color: "var(--ax-colors-border-control)" },
];

// The tracker's Filter popover — item TYPE checkboxes + a "Created by" picker.
// Modeled on the Workflows "Filters" panel (Figma 795:33267).
export function TrackerFilterPopover({
  filters,
  creators,
  onChange,
}: {
  filters: TrackerFilters;
  creators: string[];
  onChange: (next: TrackerFilters) => void;
}) {
  const toggleType = (key: TypeKey) => {
    const has = filters.types.includes(key);
    onChange({ ...filters, types: has ? filters.types.filter((t) => t !== key) : [...filters.types, key] });
  };

  const createdByOptions: MenuOption[] = [
    { label: "Anyone", execute: () => onChange({ ...filters, createdBy: ALL_CREATORS }) },
    ...creators.map((c) => ({ label: c, execute: () => onChange({ ...filters, createdBy: c }) })),
  ];
  const createdByLabel = filters.createdBy === ALL_CREATORS ? "Anyone" : filters.createdBy;

  return (
    <Box
      rounded="lg"
      shadow="lg"
      style={{
        position: "absolute",
        top: 40,
        right: 0,
        zIndex: 10001,
        width: 260,
        padding: 16,
        background: "var(--ax-colors-bg-default)",
        border: "1px solid var(--ax-colors-border-secondary)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" style={{ minHeight: 24 }}>
        <Text fontWeight="500" fontSize="md" color="fg.default">Filters</Text>
        {filtersActive(filters) && (
          <Button appearance="subtle" size="sm" onClick={() => onChange({ ...DEFAULT_FILTERS })}>Clear all</Button>
        )}
      </Box>

      {/* Type — no box checked means "all types". The whole row is the click
          target; the checkbox is presentational so it never double-toggles. */}
      <Box display="flex" flexDirection="column" gap="8">
        <Text fontSize="md" fontWeight="400" color="fg.secondary">Type</Text>
        {TYPE_ROWS.map(({ key, label, color }) => (
          <Box key={key} display="flex" alignItems="center" gap="8" onClick={() => toggleType(key)} style={{ cursor: "pointer" }}>
            <Box display="inline-flex" style={{ pointerEvents: "none" }}>
              <Checkbox checked={filters.types.includes(key)} onCheckedChange={() => {}} aria-label={label} />
            </Box>
            <Box style={{ width: 3, height: 14, borderRadius: 999, background: color, flexShrink: 0 }} />
            <Text fontSize="md" color="fg.default">{label}</Text>
          </Box>
        ))}
      </Box>

      {/* Added by — label sits outside; trigger shows just the value + chevron. */}
      <Box display="flex" flexDirection="column" gap="4">
        <Text fontSize="md" fontWeight="400" color="fg.secondary">Added by</Text>
        <Menu options={createdByOptions} inputVisible="always">
          <MenuTrigger asChild>
            <Button appearance="default" size="md" w="full" addonAfter={<IconAngleDown />} style={{ justifyContent: "space-between" }}>
              {createdByLabel}
            </Button>
          </MenuTrigger>
          <MenuContent style={{ zIndex: 10050 }} />
        </Menu>
      </Box>
    </Box>
  );
}

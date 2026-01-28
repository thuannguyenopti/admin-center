"use client";

import { Box, Sidebar, Button, Checkbox, SearchInput } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { useState } from "react";
import { ContentFilters, FilterOptions } from "../hooks/useContentFilters";
import { IconX } from "@tabler/icons-react";

interface FilterPanelProps {
  filters: ContentFilters;
  filterOptions: FilterOptions;
  onToggleFilter: (category: keyof ContentFilters, value: string) => void;
  onClose: () => void;
}

export default function FilterPanel({
  filters,
  filterOptions,
  onToggleFilter,
  onClose,
}: FilterPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllModifiedBy, setShowAllModifiedBy] = useState(false);

  const displayedModifiedBy = showAllModifiedBy
    ? filterOptions.modifiedBy
    : filterOptions.modifiedBy.slice(0, 4);

  return (
    <Sidebar className="h-full" expanded={true}>
      <Box
        display="flex"
        flexDirection="column"
        h="full"
        overflow="hidden"
      >
        {/* Header with close button */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px="24"
          pt="32"
          pb="24"
          style={{ flexShrink: 0 }}
        >
          <Text fontSize="lg" style={{ letterSpacing: "-0.44px" }}>
            Filters
          </Text>
          <Button
            appearance="subtle"
            size="sm"
            onClick={onClose}
            aria-label="Close filters"
            icon={<IconX size={16} />}
          />
        </Box>

        {/* Search input */}
        <Box px="24" pb="24" style={{ flexShrink: 0 }}>
          <SearchInput
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="md"
          />
        </Box>

        {/* Scrollable content */}
        <Box
          flex="1"
          overflow="auto"
          display="flex"
          flexDirection="column"
          gap="24"
          px="24"
          pb="24"
        >
          {/* Type filter */}
          {filterOptions.types.length > 0 && (
            <Box display="flex" flexDirection="column" gap="8">
              <Text fontSize="xs" color="fg.tertiary">
                Type
              </Text>
              {filterOptions.types.map((type) => (
                <CheckboxRow
                  key={type}
                  label={type}
                  checked={filters.types.includes(type)}
                  onChange={() => onToggleFilter("types", type)}
                />
              ))}
            </Box>
          )}

          {/* Status filter */}
          {filterOptions.statuses.length > 0 && (
            <Box display="flex" flexDirection="column" gap="8">
              <Text fontSize="xs" color="fg.tertiary">
                Status
              </Text>
              {filterOptions.statuses.map((status) => (
                <CheckboxRow
                  key={status}
                  label={status}
                  checked={filters.statuses.includes(status)}
                  onChange={() => onToggleFilter("statuses", status)}
                />
              ))}
            </Box>
          )}

          {/* Modified By filter */}
          {filterOptions.modifiedBy.length > 0 && (
            <Box display="flex" flexDirection="column" gap="8">
              <Text fontSize="xs" color="fg.tertiary">
                Modified By
              </Text>
              {displayedModifiedBy.map((author) => (
                <CheckboxRow
                  key={author}
                  label={author}
                  checked={filters.modifiedBy.includes(author)}
                  onChange={() => onToggleFilter("modifiedBy", author)}
                />
              ))}
              {filterOptions.modifiedBy.length > 4 && !showAllModifiedBy && (
                <button
                  onClick={() => setShowAllModifiedBy(true)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                  }}
                >
                  <Text fontSize="xs" color="fg.accent">
                    Show all
                  </Text>
                </button>
              )}
            </Box>
          )}

          {/* Language filter */}
          {filterOptions.languages.length > 0 && (
            <Box display="flex" flexDirection="column" gap="8">
              <Text fontSize="xs" color="fg.tertiary">
                Language
              </Text>
              {filterOptions.languages.map((language) => (
                <CheckboxRow
                  key={language}
                  label={language}
                  checked={filters.languages.includes(language)}
                  onChange={() => onToggleFilter("languages", language)}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Sidebar>
  );
}

interface CheckboxRowProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function CheckboxRow({ label, checked, onChange }: CheckboxRowProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap="8"
      cursor="pointer"
      onClick={onChange}
    >
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <Text fontSize="sm" color="fg.default">
        {label}
      </Text>
    </Box>
  );
}

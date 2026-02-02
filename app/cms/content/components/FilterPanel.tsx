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
  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const displayedModifiedBy = showAllModifiedBy
    ? filterOptions.modifiedBy
    : filterOptions.modifiedBy.slice(0, 4);

  const displayedTags = showAllTags
    ? filterOptions.tags
    : filterOptions.tags.slice(0, 4);

  const displayedCategories = showAllCategories
    ? filterOptions.categories
    : filterOptions.categories.slice(0, 4);

  // Helper to format slug to display name
  const formatSlugToName = (slug: string) => {
    return slug
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Sidebar className="h-full" expanded={true} style={{ overflow: "hidden" }}>
      <Box
        display="flex"
        flexDirection="column"
        h="full"
        overflow="hidden"
        style={{ minHeight: 0 }}
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

        {/* Single scroll container: wrapper stays fixed height, inner div is the only scroller */}
        <Box
          flex="1"
          overflow="hidden"
          style={{ minHeight: 0, flexBasis: 0 }}
        >
          <div
            style={{
              height: "100%",
              overflowY: "auto",
              overflowX: "hidden",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              padding: "0 24px 24px 24px",
            }}
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
                {filterOptions.modifiedBy.length > 4 && (
                  <button
                    onClick={() =>
                      showAllModifiedBy
                        ? setShowAllModifiedBy(false)
                        : setShowAllModifiedBy(true)
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      textAlign: "left",
                    }}
                  >
                    <Text fontSize="xs" color="fg.accent">
                      {showAllModifiedBy ? "Show less" : "Show all"}
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

            {/* Tags filter */}
            {filterOptions.tags.length > 0 && (
              <Box display="flex" flexDirection="column" gap="8">
                <Text fontSize="xs" color="fg.tertiary">
                  Tags
                </Text>
                {displayedTags.map((tag) => (
                  <CheckboxRow
                    key={tag}
                    label={formatSlugToName(tag)}
                    checked={(filters.tags || []).includes(tag)}
                    onChange={() => onToggleFilter("tags", tag)}
                  />
                ))}
                {filterOptions.tags.length > 4 && (
                  <button
                    onClick={() =>
                      showAllTags ? setShowAllTags(false) : setShowAllTags(true)
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      textAlign: "left",
                    }}
                  >
                    <Text fontSize="xs" color="fg.accent">
                      {showAllTags
                        ? "Show less"
                        : `Show all (${filterOptions.tags.length})`}
                    </Text>
                  </button>
                )}
              </Box>
            )}

            {/* Categories filter */}
            {filterOptions.categories.length > 0 && (
              <Box display="flex" flexDirection="column" gap="8">
                <Text fontSize="xs" color="fg.tertiary">
                  Categories
                </Text>
                {displayedCategories.map((category) => (
                  <CheckboxRow
                    key={category}
                    label={formatSlugToName(category)}
                    checked={(filters.categories || []).includes(category)}
                    onChange={() => onToggleFilter("categories", category)}
                  />
                ))}
                {filterOptions.categories.length > 4 && (
                  <button
                    onClick={() =>
                      showAllCategories
                        ? setShowAllCategories(false)
                        : setShowAllCategories(true)
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      textAlign: "left",
                    }}
                  >
                    <Text fontSize="xs" color="fg.accent">
                      {showAllCategories
                        ? "Show less"
                        : `Show all (${filterOptions.categories.length})`}
                    </Text>
                  </button>
                )}
              </Box>
            )}
          </div>
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

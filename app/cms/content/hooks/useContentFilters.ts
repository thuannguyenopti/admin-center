import { useMemo, useCallback } from "react";
import usePersistentState from "@/app/usePersistentState";
import { ContentItem } from "../page";

export interface ContentFilters {
  types: string[];
  statuses: string[];
  modifiedBy: string[];
  languages: string[];
  tags: string[];
  categories: string[];
}

export interface FilterOptions {
  types: string[];
  statuses: string[];
  modifiedBy: string[];
  languages: string[];
  tags: string[];
  categories: string[];
}

export interface FilterPill {
  category: "Type" | "Status" | "Modified By" | "Language" | "Tag" | "Category";
  value: string;
}

const defaultFilters: ContentFilters = {
  types: [],
  statuses: [],
  modifiedBy: [],
  languages: [],
  tags: [],
  categories: [],
};

export function useContentFilters(allContent: ContentItem[]) {
  const safeContent = allContent ?? [];
  const [filters, setFilters] = usePersistentState(
    "content-filters",
    defaultFilters
  ) as [ContentFilters, (filters: ContentFilters | ((prev: ContentFilters) => ContentFilters)) => void, boolean];

  // Extract unique filter options from content
  const filterOptions = useMemo<FilterOptions>(() => {
    const types = [...new Set(safeContent.map(item => item.baseType))];
    const statuses = [...new Set(safeContent.map(item => item.status))];
    const modifiedBy = [...new Set(safeContent.map(item => item.modifiedBy))];
    const languages = [...new Set(safeContent.map(item => item.language))];
    // Extract unique tags and categories from all content items
    const tags = [...new Set(safeContent.flatMap(item => item.tags || []))];
    const categories = [...new Set(safeContent.flatMap(item => item.categories || []))];

    return {
      types: types.sort(),
      statuses: statuses.sort(),
      modifiedBy: modifiedBy.sort(),
      languages: languages.sort(),
      tags: tags.sort(),
      categories: categories.sort(),
    };
  }, [safeContent]);

  // Apply filters to content
  const filteredContent = useMemo(() => {
    return safeContent.filter(item => {
      if (filters.types.length > 0 && !filters.types.includes(item.baseType)) {
        return false;
      }
      if (filters.statuses.length > 0 && !filters.statuses.includes(item.status)) {
        return false;
      }
      if (filters.modifiedBy.length > 0 && !filters.modifiedBy.includes(item.modifiedBy)) {
        return false;
      }
      if (filters.languages.length > 0 && !filters.languages.includes(item.language)) {
        return false;
      }
      // Tag filtering: content must have at least one of the selected tags
      if (filters.tags.length > 0) {
        const itemTags = item.tags || [];
        const hasMatchingTag = filters.tags.some(tag => itemTags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }
      // Category filtering: content must have at least one of the selected categories
      if (filters.categories.length > 0) {
        const itemCategories = item.categories || [];
        const hasMatchingCategory = filters.categories.some(cat => itemCategories.includes(cat));
        if (!hasMatchingCategory) {
          return false;
        }
      }
      return true;
    });
  }, [safeContent, filters]);

  // Convert filters to pills
  const activePills = useMemo<FilterPill[]>(() => {
    const pills: FilterPill[] = [];
    filters.types.forEach((value: string) => pills.push({ category: "Type", value }));
    filters.statuses.forEach((value: string) => pills.push({ category: "Status", value }));
    filters.modifiedBy.forEach((value: string) => pills.push({ category: "Modified By", value }));
    filters.languages.forEach((value: string) => pills.push({ category: "Language", value }));
    filters.tags.forEach((value: string) => pills.push({ category: "Tag", value }));
    filters.categories.forEach((value: string) => pills.push({ category: "Category", value }));
    return pills;
  }, [filters]);

  // Check if any filters are active
  const hasActiveFilters = activePills.length > 0;

  // Toggle a filter value
  const toggleFilter = (category: keyof ContentFilters, value: string) => {
    setFilters((prev: ContentFilters) => {
      const currentValues = prev[category] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v: string) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [category]: newValues,
      };
    });
  };

  // Remove a specific filter
  const removeFilter = (category: string, value: string) => {
    const categoryKey = category === "Type" ? "types"
      : category === "Status" ? "statuses"
        : category === "Modified By" ? "modifiedBy"
          : category === "Language" ? "languages"
            : category === "Tag" ? "tags"
              : category === "Category" ? "categories"
                : "types"; // fallback

    setFilters((prev: ContentFilters) => ({
      ...prev,
      [categoryKey]: (prev[categoryKey] || []).filter((v: string) => v !== value),
    }));
  };

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [setFilters]);

  // Set filters directly (useful for URL params)
  const setFiltersDirectly = useCallback((newFilters: Partial<ContentFilters>) => {
    setFilters((prev: ContentFilters) => ({
      ...prev,
      ...newFilters,
    }));
  }, [setFilters]);

  return {
    filters,
    filterOptions,
    filteredContent,
    activePills,
    hasActiveFilters,
    toggleFilter,
    removeFilter,
    clearAllFilters,
    setFiltersDirectly,
  };
}

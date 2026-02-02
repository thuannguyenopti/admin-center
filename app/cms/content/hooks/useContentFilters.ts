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

  // Normalize filters so array keys are always arrays (handles old/corrupt localStorage)
  const safeFilters: ContentFilters = useMemo(
    () => ({
      types: Array.isArray(filters?.types) ? filters.types : [],
      statuses: Array.isArray(filters?.statuses) ? filters.statuses : [],
      modifiedBy: Array.isArray(filters?.modifiedBy) ? filters.modifiedBy : [],
      languages: Array.isArray(filters?.languages) ? filters.languages : [],
      tags: Array.isArray(filters?.tags) ? filters.tags : [],
      categories: Array.isArray(filters?.categories) ? filters.categories : [],
    }),
    [filters]
  );

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
      if (safeFilters.types.length > 0 && !safeFilters.types.includes(item.baseType)) {
        return false;
      }
      if (safeFilters.statuses.length > 0 && !safeFilters.statuses.includes(item.status)) {
        return false;
      }
      if (safeFilters.modifiedBy.length > 0 && !safeFilters.modifiedBy.includes(item.modifiedBy)) {
        return false;
      }
      if (safeFilters.languages.length > 0 && !safeFilters.languages.includes(item.language)) {
        return false;
      }
      // Tag filtering: content must have at least one of the selected tags
      if (safeFilters.tags.length > 0) {
        const itemTags = item.tags || [];
        const hasMatchingTag = safeFilters.tags.some(tag => itemTags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }
      // Category filtering: content must have at least one of the selected categories
      if (safeFilters.categories.length > 0) {
        const itemCategories = item.categories || [];
        const hasMatchingCategory = safeFilters.categories.some(cat => itemCategories.includes(cat));
        if (!hasMatchingCategory) {
          return false;
        }
      }
      return true;
    });
  }, [safeContent, safeFilters]);

  // Convert filters to pills (Language first to match panel order)
  const activePills = useMemo<FilterPill[]>(() => {
    const pills: FilterPill[] = [];
    safeFilters.languages.forEach((value: string) => pills.push({ category: "Language", value }));
    safeFilters.types.forEach((value: string) => pills.push({ category: "Type", value }));
    safeFilters.statuses.forEach((value: string) => pills.push({ category: "Status", value }));
    safeFilters.modifiedBy.forEach((value: string) => pills.push({ category: "Modified By", value }));
    safeFilters.tags.forEach((value: string) => pills.push({ category: "Tag", value }));
    safeFilters.categories.forEach((value: string) => pills.push({ category: "Category", value }));
    return pills;
  }, [safeFilters]);

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
    filters: safeFilters,
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

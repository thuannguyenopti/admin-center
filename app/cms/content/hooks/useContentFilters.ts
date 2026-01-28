import { useMemo } from "react";
import usePersistentState from "@/app/usePersistentState";
import { ContentItem } from "../page";

export interface ContentFilters {
  types: string[];
  statuses: string[];
  modifiedBy: string[];
  languages: string[];
}

export interface FilterOptions {
  types: string[];
  statuses: string[];
  modifiedBy: string[];
  languages: string[];
}

export interface FilterPill {
  category: "Type" | "Status" | "Modified By" | "Language";
  value: string;
}

export function useContentFilters(allContent: ContentItem[]) {
  const [filters, setFilters] = usePersistentState(
    "content-filters",
    { types: [], statuses: [], modifiedBy: [], languages: [] }
  ) as [ContentFilters, (filters: ContentFilters | ((prev: ContentFilters) => ContentFilters)) => void, boolean];

  // Extract unique filter options from content
  const filterOptions = useMemo<FilterOptions>(() => {
    const types = [...new Set(allContent.map(item => item.baseType))];
    const statuses = [...new Set(allContent.map(item => item.status))];
    const modifiedBy = [...new Set(allContent.map(item => item.modifiedBy))];
    const languages = [...new Set(allContent.map(item => item.language))];

    return {
      types: types.sort(),
      statuses: statuses.sort(),
      modifiedBy: modifiedBy.sort(),
      languages: languages.sort(),
    };
  }, [allContent]);

  // Apply filters to content
  const filteredContent = useMemo(() => {
    return allContent.filter(item => {
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
      return true;
    });
  }, [allContent, filters]);

  // Convert filters to pills
  const activePills = useMemo<FilterPill[]>(() => {
    const pills: FilterPill[] = [];
    filters.types.forEach((value: string) => pills.push({ category: "Type", value }));
    filters.statuses.forEach((value: string) => pills.push({ category: "Status", value }));
    filters.modifiedBy.forEach((value: string) => pills.push({ category: "Modified By", value }));
    filters.languages.forEach((value: string) => pills.push({ category: "Language", value }));
    return pills;
  }, [filters]);

  // Check if any filters are active
  const hasActiveFilters = activePills.length > 0;

  // Toggle a filter value
  const toggleFilter = (category: keyof ContentFilters, value: string) => {
    setFilters((prev: ContentFilters) => {
      const currentValues = prev[category];
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
      : "languages";
    
    setFilters((prev: ContentFilters) => ({
      ...prev,
      [categoryKey]: prev[categoryKey].filter((v: string) => v !== value),
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({ types: [], statuses: [], modifiedBy: [], languages: [] });
  };

  return {
    filters,
    filterOptions,
    filteredContent,
    activePills,
    hasActiveFilters,
    toggleFilter,
    removeFilter,
    clearAllFilters,
  };
}

"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { useContentFilters } from "../hooks/useContentFilters";
import { getAllContentItems, initialPages, type Page } from "@/app/db/initialData";
import usePersistentState from "@/app/usePersistentState";
import type { ContentItem } from "../page";
import type { ContentFilters, FilterOptions, FilterPill } from "../hooks/useContentFilters";

type FilterPanelContextType = {
  isFilterPanelOpen: boolean;
  setIsFilterPanelOpen: (isOpen: boolean) => void;
  filters: ContentFilters;
  filterOptions: FilterOptions;
  filteredContent: ContentItem[];
  activePills: FilterPill[];
  hasActiveFilters: boolean;
  toggleFilter: (category: keyof ContentFilters, value: string) => void;
  removeFilter: (category: string, value: string) => void;
  clearAllFilters: () => void;
};

const FilterPanelContext = createContext<FilterPanelContextType | undefined>(undefined);

export function FilterPanelProvider({ children }: { children: ReactNode }) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  // Get content for filter state
  const [pages] = usePersistentState("pages", initialPages) as [Page[], any, boolean];
  const allContentItems = getAllContentItems(pages || initialPages);
  const contentItems: ContentItem[] = useMemo(() => 
    allContentItems.map(item => ({
      ...item,
      status: item.publishStatus
    })).sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()),
    [allContentItems]
  );

  // Single source of truth for filter state
  const filterState = useContentFilters(contentItems);

  return (
    <FilterPanelContext.Provider value={{ 
      isFilterPanelOpen, 
      setIsFilterPanelOpen,
      ...filterState
    }}>
      {children}
    </FilterPanelContext.Provider>
  );
}

export function useFilterPanel() {
  const context = useContext(FilterPanelContext);
  if (!context) {
    throw new Error("useFilterPanel must be used within a FilterPanelProvider");
  }
  return context;
}

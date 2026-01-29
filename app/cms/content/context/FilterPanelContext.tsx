"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
  setFiltersDirectly: (newFilters: Partial<ContentFilters>) => void;
};

const FilterPanelContext = createContext<FilterPanelContextType | undefined>(undefined);

export function FilterPanelProvider({ children }: { children: ReactNode }) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasAppliedUrlFilters = useRef(false);

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

  // Apply URL params on mount and when URL changes
  useEffect(() => {
    const tagParam = searchParams.get("tag");
    const categoryParam = searchParams.get("category");

    // Only apply URL filters if we have params and haven't applied them yet for this URL
    if ((tagParam || categoryParam) && !hasAppliedUrlFilters.current) {
      hasAppliedUrlFilters.current = true;

      const newFilters: Partial<ContentFilters> = {};

      if (tagParam) {
        // Support multiple tags via comma-separated values
        newFilters.tags = tagParam.split(",").map(t => t.trim());
      }

      if (categoryParam) {
        // Support multiple categories via comma-separated values
        newFilters.categories = categoryParam.split(",").map(c => c.trim());
      }

      // Clear other filters and apply tag/category from URL
      filterState.clearAllFilters();
      // Small delay to ensure clear happens first
      setTimeout(() => {
        filterState.setFiltersDirectly(newFilters);
      }, 0);

      // Clear URL params after applying filters (optional - keeps URL clean)
      // Comment out if you want to keep URL params for bookmarkability
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, pathname, router, filterState]);

  // Reset the ref when URL params are manually cleared
  useEffect(() => {
    const tagParam = searchParams.get("tag");
    const categoryParam = searchParams.get("category");
    if (!tagParam && !categoryParam) {
      hasAppliedUrlFilters.current = false;
    }
  }, [searchParams]);

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

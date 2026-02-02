"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useEffect, useRef, useCallback } from "react";
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
  /** Persist tag changes for page-derived content (Option A: update page.tags in pages store) */
  onTagsChange: (contentId: string, tags: string[]) => void;
  /** Batch persist tag changes for multiple items in one state update (avoids batching bug) */
  onTagsChangeBatch: (updates: Array<{ id: string; tags: string[] }>) => void;
};

const FilterPanelContext = createContext<FilterPanelContextType | undefined>(undefined);

export function FilterPanelProvider({ children }: { children: ReactNode }) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasAppliedUrlFilters = useRef(false);

  // Get content for filter state (pages is read/write for Option A tag persistence)
  const [pages, setPages] = usePersistentState("pages", initialPages) as [Page[], (value: Page[] | ((prev: Page[]) => Page[])) => void, boolean];
  const [contentTagOverrides, setContentTagOverrides] = usePersistentState("contentTagOverrides", {}) as [
    Record<string, string[]>,
    (value: Record<string, string[]> | ((prev: Record<string, string[]>) => Record<string, string[]>)) => void,
    boolean
  ];

  const pageIds = useMemo(
    () => new Set((pages || initialPages).map((p) => p.id)),
    [pages]
  );

  // Base content from pages; apply contentTagOverrides (e.g. after merge in Tags settings)
  const baseContentItems = useMemo(
    () => getAllContentItems(pages || initialPages),
    [pages]
  );
  const allContentItems = useMemo(() => {
    const overrides =
      contentTagOverrides && typeof contentTagOverrides === "object" && !Array.isArray(contentTagOverrides)
        ? contentTagOverrides
        : {};
    return baseContentItems.map((item) => {
      const override = overrides[item.id];
      if (Array.isArray(override)) {
        return { ...item, tags: override };
      }
      return item;
    });
  }, [baseContentItems, contentTagOverrides]);

  const onTagsChange = useCallback(
    (contentId: string, tags: string[]) => {
      setPages((prev) => {
        const page = prev?.find((p) => p.id === contentId);
        if (!page) return prev ?? initialPages;
        return (prev ?? initialPages).map((p) =>
          p.id === contentId ? { ...p, tags } : p
        );
      });
    },
    [setPages]
  );

  const onTagsChangeBatch = useCallback(
    (updates: Array<{ id: string; tags: string[] }>) => {
      if (updates.length === 0) return;
      const updateMap = new Map(updates.map((u) => [u.id, u.tags]));
      setPages((prev) => {
        const base = prev ?? initialPages;
        return base.map((p) => {
          const newTags = updateMap.get(p.id);
          return newTags !== undefined ? { ...p, tags: newTags } : p;
        });
      });
      const nonPageUpdates = updates.filter((u) => !pageIds.has(u.id));
      if (nonPageUpdates.length > 0) {
        setContentTagOverrides((prev) => {
          const next = { ...(prev && typeof prev === "object" && !Array.isArray(prev) ? prev : {}) };
          nonPageUpdates.forEach(({ id, tags }) => {
            next[id] = tags;
          });
          return next;
        });
      }
    },
    [setPages, setContentTagOverrides, pageIds]
  );

  const contentItems: ContentItem[] = useMemo(
    () =>
      allContentItems
        .map((item) => ({
          ...item,
          status: item.publishStatus
        }))
        .sort(
          (a, b) =>
            new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        ),
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
      ...filterState,
      onTagsChange,
      onTagsChangeBatch,
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

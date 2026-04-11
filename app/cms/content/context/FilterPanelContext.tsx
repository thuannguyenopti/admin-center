"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useContentFilters } from "../hooks/useContentFilters";
import { useGlobalCategories } from "@/app/cms/hooks/useGlobalCategories";
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
  /** Resolve category slug to display name (from categories repository). */
  getCategoryNameBySlug: (slug: string) => string | undefined;
  /** Persist tag changes for page-derived content (Option A: update page.tags in pages store) */
  onTagsChange: (contentId: string, tags: string[]) => void;
  /** Batch persist tag changes for multiple items in one state update (avoids batching bug) */
  onTagsChangeBatch: (updates: Array<{ id: string; tags: string[] }>) => void;
  /** Persist category changes for page-derived content */
  onCategoriesChange: (contentId: string, categories: string[]) => void;
  /** Batch persist category changes for multiple items */
  onCategoriesChangeBatch: (updates: Array<{ id: string; categories: string[] }>) => void;
};

const FilterPanelContext = createContext<FilterPanelContextType | undefined>(undefined);

export function FilterPanelProvider({ children }: { children: ReactNode }) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasAppliedUrlFilters = useRef(false);

  // Get content for filter state (pages is read/write for Option A tag persistence)
  const [pages, setPages] = usePersistentState("pages_v5", initialPages) as [Page[], (value: Page[] | ((prev: Page[]) => Page[])) => void, boolean];
  const [contentTagOverrides, setContentTagOverrides] = usePersistentState("contentTagOverrides", {}) as [
    Record<string, string[]>,
    (value: Record<string, string[]> | ((prev: Record<string, string[]>) => Record<string, string[]>)) => void,
    boolean
  ];
  const [contentCategoryOverrides, setContentCategoryOverrides] = usePersistentState("contentCategoryOverrides", {}) as [
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
    const tagOverrides =
      contentTagOverrides && typeof contentTagOverrides === "object" && !Array.isArray(contentTagOverrides)
        ? contentTagOverrides
        : {};
    const categoryOverrides =
      contentCategoryOverrides && typeof contentCategoryOverrides === "object" && !Array.isArray(contentCategoryOverrides)
        ? contentCategoryOverrides
        : {};
    return (baseContentItems ?? []).map((item) => {
      const tagOverride = tagOverrides[item.id];
      const categoryOverride = categoryOverrides[item.id];
      const withTags = Array.isArray(tagOverride) ? { ...item, tags: tagOverride } : item;
      const withCategories = Array.isArray(categoryOverride) ? { ...withTags, categories: categoryOverride } : withTags;
      return withCategories;
    });
  }, [baseContentItems, contentTagOverrides, contentCategoryOverrides]);

  const onTagsChange = useCallback(
    (contentId: string, tags: string[]) => {
      if (pageIds.has(contentId)) {
        setPages((prev) => {
          const page = prev?.find((p) => p.id === contentId);
          if (!page) return prev ?? initialPages;
          return (prev ?? initialPages).map((p) =>
            p.id === contentId ? { ...p, tags } : p
          );
        });
      } else {
        setContentTagOverrides((prev) => {
          const next = { ...(prev && typeof prev === "object" && !Array.isArray(prev) ? prev : {}) };
          next[contentId] = tags;
          return next;
        });
      }
    },
    [setPages, setContentTagOverrides, pageIds]
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

  const onCategoriesChange = useCallback(
    (contentId: string, categories: string[]) => {
      if (pageIds.has(contentId)) {
        setPages((prev) => {
          const page = prev?.find((p) => p.id === contentId);
          if (!page) return prev ?? initialPages;
          return (prev ?? initialPages).map((p) =>
            p.id === contentId ? { ...p, categories } : p
          );
        });
      } else {
        setContentCategoryOverrides((prev) => {
          const next = { ...(prev && typeof prev === "object" && !Array.isArray(prev) ? prev : {}) };
          next[contentId] = categories;
          return next;
        });
      }
    },
    [setPages, setContentCategoryOverrides, pageIds]
  );

  const onCategoriesChangeBatch = useCallback(
    (updates: Array<{ id: string; categories: string[] }>) => {
      if (updates.length === 0) return;
      const updateMap = new Map(updates.map((u) => [u.id, u.categories]));
      setPages((prev) => {
        const base = prev ?? initialPages;
        return base.map((p) => {
          const newCategories = updateMap.get(p.id);
          return newCategories !== undefined ? { ...p, categories: newCategories } : p;
        });
      });
      const nonPageUpdates = updates.filter((u) => !pageIds.has(u.id));
      if (nonPageUpdates.length > 0) {
        setContentCategoryOverrides((prev) => {
          const next = { ...(prev && typeof prev === "object" && !Array.isArray(prev) ? prev : {}) };
          nonPageUpdates.forEach(({ id, categories }) => {
            next[id] = categories;
          });
          return next;
        });
      }
    },
    [setPages, setContentCategoryOverrides, pageIds]
  );

  const contentItems: ContentItem[] = useMemo(
    () =>
      (allContentItems ?? [])
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

  // Categories from the same repository as the Categories settings page
  const { categoriesWithSlugs, getCategoryNameBySlug } = useGlobalCategories();
  const categorySlugsFromRepo = useMemo(
    () => categoriesWithSlugs.map((c) => c.slug),
    [categoriesWithSlugs]
  );

  // Single source of truth for filter state (category options from repo)
  const filterState = useContentFilters(contentItems, { categorySlugsFromRepo });

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
      getCategoryNameBySlug,
      onTagsChange,
      onTagsChangeBatch,
      onCategoriesChange,
      onCategoriesChangeBatch,
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

import { useState, useCallback } from 'react';
import { Tag } from '../types';

export function useSelection(tags: Tag[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const allIds = tags.map((t) => t.id);
    setSelectedIds(new Set(allIds));
  }, [tags]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === tags.length) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [selectedIds.size, tags.length, selectAll, deselectAll]);

  /** Toggle selection for a subset of tags (e.g. current page). Use for table header "select all". */
  const toggleAllForTags = useCallback((tagsToToggle: Tag[]) => {
    setSelectedIds((prev) => {
      const allInSubsetSelected =
        tagsToToggle.length > 0 &&
        tagsToToggle.every((t) => prev.has(t.id));
      const next = new Set(prev);
      if (allInSubsetSelected) {
        tagsToToggle.forEach((t) => next.delete(t.id));
      } else {
        tagsToToggle.forEach((t) => next.add(t.id));
      }
      return next;
    });
  }, []);

  const selectedTags = tags.filter((t) => selectedIds.has(t.id));

  return {
    selectedIds,
    isSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleAll,
    toggleAllForTags,
    selectedTags,
    selectedCount: selectedIds.size,
  };
}

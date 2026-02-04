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

  const selectedTags = tags.filter((t) => selectedIds.has(t.id));

  return {
    selectedIds,
    isSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleAll,
    selectedTags,
    selectedCount: selectedIds.size,
  };
}

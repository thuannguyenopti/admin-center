import { useState, useCallback } from 'react';
import { Category } from '../types';
import { getAllChildIds } from '../utils';

export function useSelection(categories: Category[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const toggleSelection = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    []
  );

  const selectAll = useCallback(() => {
    const allIds = categories.map((c) => c.id);
    setSelectedIds(new Set(allIds));
  }, [categories]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === categories.length) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [selectedIds.size, categories.length, selectAll, deselectAll]);

  const selectedCategories = categories.filter((c) => selectedIds.has(c.id));

  return {
    selectedIds,
    isSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleAll,
    selectedCategories,
    selectedCount: selectedIds.size,
  };
}

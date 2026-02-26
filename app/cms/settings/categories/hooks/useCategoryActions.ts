import { useCallback } from 'react';
import { Category, CategoryFormRow } from '../types';
import { generateSlug } from '../utils';

export function useCategoryActions(
  categories: Category[],
  setCategories: (categories: Category[]) => void
) {
  const createCategories = useCallback(
    (formRows: CategoryFormRow[]) => {
      const newCategories: Category[] = formRows.map((row) => ({
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: row.name,
        slug: row.slug,
        status: 'draft' as const,
        visibility: row.visibility,
        modifiedBy: 'Current User',
        usage: 0,
        lastModified: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        parentId: row.parentId,
        isExpanded: false,
      }));

      setCategories([...categories, ...newCategories]);
    },
    [categories, setCategories]
  );

  const updateCategories = useCallback(
    (formRows: CategoryFormRow[]) => {
      const updatedCategories = categories.map((category) => {
        const formRow = formRows.find((row) => row.id === category.id);
        if (formRow) {
          return {
            ...category,
            name: formRow.name,
            slug: formRow.slug,
            parentId: formRow.parentId,
            visibility: formRow.visibility,
            lastModified: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          };
        }
        return category;
      });

      setCategories(updatedCategories);
    },
    [categories, setCategories]
  );

  const deleteCategories = useCallback(
    (ids: string[]) => {
      const remaining = categories.filter((c) => !ids.includes(c.id));
      setCategories(remaining);
    },
    [categories, setCategories]
  );

  const toggleExpanded = useCallback(
    (id: string) => {
      const updated = categories.map((c) =>
        c.id === id ? { ...c, isExpanded: !c.isExpanded } : c
      );
      setCategories(updated);
    },
    [categories, setCategories]
  );

  return {
    createCategories,
    updateCategories,
    deleteCategories,
    toggleExpanded,
  };
}

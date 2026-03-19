import { useCallback, Dispatch, SetStateAction } from 'react';
import { Category, CategoryFormRow } from '../types';

export function useCategoryActions(
  categories: Category[],
  setCategories: Dispatch<SetStateAction<Category[]>>
) {
  const createCategories = useCallback(
    (formRows: CategoryFormRow[]): string[] => {
      let createdIds: string[] = [];
      setCategories((prevCategories) => {
        const newCategories: Category[] = [];
        const slugToIdMap = new Map<string, string>();

        // First pass: create all categories and build slug-to-id mapping
        formRows.forEach((row) => {
          const newId = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          slugToIdMap.set(row.slug, newId);

          newCategories.push({
            id: newId,
            name: row.name,
            slug: row.slug,
            status: 'published' as const,
            visibility: row.visibility,
            modifiedBy: 'Current User',
            usage: 0,
            lastModified: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            parentId: row.parentId, // Will be resolved in second pass
            isExpanded: false,
          });
        });

        // Second pass: resolve PENDING parent IDs
        newCategories.forEach((cat, index) => {
          if (cat.parentId && cat.parentId.startsWith('PENDING:')) {
            const parentSlug = cat.parentId.replace('PENDING:', '');

            // Check if parent was created in this batch
            const newParentId = slugToIdMap.get(parentSlug);
            if (newParentId) {
              cat.parentId = newParentId;
            } else {
              // Parent might exist in current categories
              const existingParent = prevCategories.find((c) => c.slug === parentSlug);
              if (existingParent) {
                cat.parentId = existingParent.id;
              } else {
                // Parent not found - set to null to avoid invalid reference
                cat.parentId = null;
              }
            }
          }
        });

        createdIds = newCategories.map(cat => cat.id);
        return [...prevCategories, ...newCategories];
      });
      return createdIds;
    },
    [setCategories]
  );

  const updateCategories = useCallback(
    (formRows: CategoryFormRow[]): string[] => {
      const updatedIds: string[] = [];
      setCategories((prevCategories) => prevCategories.map((category) => {
        const formRow = formRows.find((row) => row.id === category.id);
        if (formRow) {
          updatedIds.push(category.id);
          // Resolve PENDING parent IDs
          let parentId = formRow.parentId;
          if (parentId && parentId.startsWith('PENDING:')) {
            const parentSlug = parentId.replace('PENDING:', '');
            const existingParent = prevCategories.find((c) => c.slug === parentSlug);
            parentId = existingParent ? existingParent.id : null;
          }

          return {
            ...category,
            name: formRow.name,
            slug: formRow.slug,
            parentId,
            visibility: formRow.visibility,
            lastModified: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          };
        }
        return category;
      }));
      return updatedIds;
    },
    [setCategories]
  );

  const deleteCategories = useCallback(
    (ids: string[]) => {
      setCategories((prevCategories) => prevCategories.filter((c) => !ids.includes(c.id)));
    },
    [setCategories]
  );

  const toggleExpanded = useCallback(
    (id: string) => {
      setCategories((prevCategories) => prevCategories.map((c) =>
        c.id === id ? { ...c, isExpanded: !c.isExpanded } : c
      ));
    },
    [setCategories]
  );

  return {
    createCategories,
    updateCategories,
    deleteCategories,
    toggleExpanded,
  };
}

import { useState, useCallback, useMemo } from 'react';
import { ConflictResolution, BaseParsedRow, BaseEntity } from '../components/ImportModal/types';
import { generateUniqueSlug } from '../utils/slug';

/**
 * Hook for managing conflict resolution state and bulk actions
 */
export function useConflictResolution<
  TEntity extends BaseEntity,
  TParsedRow extends BaseParsedRow<TEntity>
>(existingEntities: TEntity[], parsedRows: TParsedRow[]) {
  const [resolutions, setResolutions] = useState<Map<string, ConflictResolution>>(new Map());
  const [defaultResolution, setDefaultResolution] = useState<'skip' | 'update' | 'create-new' | 'manual'>('skip');
  const [focusedIssueIndex, setFocusedIssueIndex] = useState<number | null>(null);

  // Get all conflict rows with their original indices
  const conflictRows = useMemo(() => {
    return parsedRows
      .map((row, index) => ({ row, originalIndex: index }))
      .filter(({ row }) => row.status === 'exists-in-system');
  }, [parsedRows]);

  // Initialize resolutions for all conflicts
  const initializeResolutions = useCallback((rows: TParsedRow[]) => {
    const newResolutions = new Map<string, ConflictResolution>();
    rows.forEach((row) => {
      if (row.status === 'exists-in-system') {
        newResolutions.set(row.slug, {
          slug: row.slug,
          action: defaultResolution === 'manual' ? 'skip' : defaultResolution,
        });
      }
    });
    setResolutions(newResolutions);
    setFocusedIssueIndex(null);
  }, [defaultResolution]);

  // Handle single resolution change
  const handleResolutionChange = useCallback((
    slug: string,
    action: 'skip' | 'update' | 'create-new',
    providedNewSlug?: string
  ) => {
    const newResolutions = new Map(resolutions);
    const csvSlugs = new Set(parsedRows.map((r) => r.slug));

    if (action === 'create-new') {
      const newSlug = providedNewSlug || generateUniqueSlug(slug, existingEntities, csvSlugs);
      newResolutions.set(slug, {
        slug,
        action,
        newSlug,
      });
    } else {
      newResolutions.set(slug, {
        slug,
        action,
      });
    }

    setResolutions(newResolutions);

    // Update bulk action if all resolutions match
    const allActions = Array.from(newResolutions.values()).map((res) => res.action);
    const uniqueActions = new Set(allActions);

    if (uniqueActions.size === 1 && newResolutions.size > 0) {
      const singleAction = allActions[0];
      setDefaultResolution(singleAction);
    } else {
      setDefaultResolution('manual');
    }
  }, [resolutions, parsedRows, existingEntities]);

  // Handle bulk resolution change
  const handleBulkResolution = useCallback((action: 'skip' | 'update' | 'create-new' | 'manual') => {
    // If manual is selected, don't change any resolutions
    if (action === 'manual') {
      setDefaultResolution('manual');
      return;
    }

    setDefaultResolution(action);

    const newResolutions = new Map<string, ConflictResolution>();
    const csvSlugs = new Set(parsedRows.map((r) => r.slug));

    parsedRows.forEach((row) => {
      if (row.status === 'exists-in-system') {
        if (action === 'create-new') {
          const newSlug = generateUniqueSlug(row.slug, existingEntities, csvSlugs);
          newResolutions.set(row.slug, {
            slug: row.slug,
            action,
            newSlug,
          });
        } else {
          newResolutions.set(row.slug, {
            slug: row.slug,
            action,
          });
        }
      }
    });

    setResolutions(newResolutions);
  }, [parsedRows, existingEntities]);

  // Navigate to next/previous conflict
  const navigateToConflict = useCallback((
    direction: 'next' | 'prev',
    currentPage: number,
    itemsPerPage: number,
    setCurrentPage: (page: number) => void,
    scrollToRow?: (rowIndex: number) => void
  ) => {
    if (conflictRows.length === 0) return;

    let newIndex: number;
    if (focusedIssueIndex === null) {
      newIndex = direction === 'next' ? 0 : conflictRows.length - 1;
    } else {
      newIndex = direction === 'next'
        ? (focusedIssueIndex + 1) % conflictRows.length
        : (focusedIssueIndex - 1 + conflictRows.length) % conflictRows.length;
    }

    setFocusedIssueIndex(newIndex);

    // Calculate which page this conflict is on
    const originalIndex = conflictRows[newIndex].originalIndex;
    const targetPage = Math.floor(originalIndex / itemsPerPage) + 1;

    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }

    // Scroll to the row if scrollToRow function is provided
    if (scrollToRow) {
      setTimeout(() => {
        scrollToRow(originalIndex);
      }, 100);
    }
  }, [conflictRows, focusedIssueIndex]);

  // Reset conflict resolution state
  const resetConflictResolution = useCallback(() => {
    setResolutions(new Map());
    setDefaultResolution('skip');
    setFocusedIssueIndex(null);
  }, []);

  return {
    resolutions,
    setResolutions,
    defaultResolution,
    setDefaultResolution,
    focusedIssueIndex,
    setFocusedIssueIndex,
    conflictRows,
    initializeResolutions,
    handleResolutionChange,
    handleBulkResolution,
    navigateToConflict,
    resetConflictResolution,
  };
}

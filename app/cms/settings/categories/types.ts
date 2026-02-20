export type CategoryStatus = 'draft' | 'published' | 'in-review';
export type CategoryVisibility = 'public' | 'private';

export interface Category {
  id: string;
  name: string;
  slug: string;
  status: CategoryStatus;
  visibility: CategoryVisibility;
  modifiedBy: string;
  usage: number;
  lastModified: string;
  parentId: string | null;
  isExpanded?: boolean;
}

export interface CategoryFormRow {
  id?: string; // undefined for new categories
  name: string;
  slug: string;
  parentId: string | null;
  visibility: CategoryVisibility;
}

export interface SelectOption {
  label: string;
  value: string;
  depth?: number;
}

/**
 * CSV Import Types
 */
export interface ParsedCSVRow {
  name: string;
  slug: string;
  parentSlug: string | null;
  categoryStatus: CategoryStatus;
  visibility: CategoryVisibility;
  rowNumber: number;
  status: 'valid' | 'error' | 'duplicate-in-csv' | 'exists-in-system';
  error?: string;
  conflictType?: 'exact-match' | 'slug-match';
  existingCategory?: Category;
  depth?: number;
}

export interface CSVParseResult {
  rows: ParsedCSVRow[];
  stats: {
    total: number;
    valid: number;
    duplicatesInCSV: number;
    existsInSystem: number;
    errors: number;
  };
}

export interface ConflictResolution {
  slug: string;
  action: 'skip' | 'update' | 'create-new';
  newSlug?: string;
}

export interface OrphanedCategory {
  slug: string;
  name: string;
  parentSlug: string;
  reason: 'parent-skipped' | 'parent-missing' | 'parent-error';
}

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

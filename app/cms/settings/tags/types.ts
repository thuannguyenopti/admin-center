import { BaseParsedRow } from '@/app/shared/components/ImportModal/types';

export type TagVisibility = 'public' | 'private';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  visibility: TagVisibility;
  modifiedBy: string;
  usage: number;
  lastModified: string;
}

export interface TagFormRow {
  id?: string; // undefined for new tags
  name: string;
  slug: string;
  visibility: TagVisibility;
}

// Extend BaseParsedRow for tag-specific parsed CSV row
export interface TagParsedRow extends BaseParsedRow<Tag> {
  // existingEntity from base is renamed to existingTag for clarity
  existingTag?: Tag;
}

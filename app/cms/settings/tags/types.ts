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

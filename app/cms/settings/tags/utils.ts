import { Tag } from './types';

/**
 * Generate URL-friendly slug from name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Check if slug is unique
 */
export function isSlugUnique(
  slug: string,
  tagId: string | undefined,
  allTags: Tag[]
): boolean {
  return !allTags.some((t) => t.slug === slug && t.id !== tagId);
}

/**
 * Filter tags by search query
 */
export function filterTags(tags: Tag[], query: string): Tag[] {
  if (!query.trim()) return tags;

  const lowerQuery = query.toLowerCase();
  return tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(lowerQuery) ||
      tag.slug.toLowerCase().includes(lowerQuery)
  );
}

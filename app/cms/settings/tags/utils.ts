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

/**
 * Content item shape needed for affected-content counts
 */
export interface ContentItemForCount {
  id: string;
  tags: string[];
  baseType: string;
}

/**
 * Count content items that have any of the source tag slugs, by baseType.
 * Page -> pages, Media -> images; other types (Product, Block, Experience) count as pages.
 */
export function getAffectedContentCounts(
  contentItems: ContentItemForCount[],
  sourceSlugs: string[]
): { pages: number; images: number } {
  const affected = contentItems.filter((item) =>
    (item.tags || []).some((t) => sourceSlugs.includes(t))
  );
  let pages = 0;
  let images = 0;
  affected.forEach((item) => {
    if (item.baseType === 'Media') {
      images += 1;
    } else {
      pages += 1;
    }
  });
  return { pages, images };
}

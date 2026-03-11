import { BaseEntity } from '../components/ImportModal/types';

/**
 * Generate a URL-friendly slug from a name
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
 * Check if a slug is unique among existing entities
 */
export function isSlugUnique<T extends BaseEntity>(
  slug: string,
  entityId: string | undefined,
  allEntities: T[]
): boolean {
  return !allEntities.some((entity) => entity.slug === slug && entity.id !== entityId);
}

/**
 * Generate a unique slug by appending a number if needed
 * @param baseSlug - The base slug to make unique
 * @param existingEntities - Array of existing entities to check against
 * @param csvSlugs - Set of slugs already used in the current CSV
 * @returns A unique slug (e.g., "my-slug-2", "my-slug-3", etc.)
 */
export function generateUniqueSlug<T extends BaseEntity>(
  baseSlug: string,
  existingEntities: T[],
  csvSlugs: Set<string>
): string {
  let counter = 2;
  let newSlug = `${baseSlug}-${counter}`;

  while (
    !isSlugUnique(newSlug, undefined, existingEntities) ||
    csvSlugs.has(newSlug)
  ) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  return newSlug;
}

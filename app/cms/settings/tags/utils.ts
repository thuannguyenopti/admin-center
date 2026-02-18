import Papa from 'papaparse';
import { Tag, TagVisibility } from './types';

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

/**
 * CSV parsing types and utilities
 */
export interface ParsedCSVRow {
  name: string;
  slug: string;
  visibility: TagVisibility;
  rowNumber: number;
  status: 'valid' | 'error' | 'duplicate-in-csv' | 'exists-in-system';
  error?: string;
  conflictType?: 'exact-match' | 'slug-match';
  existingTag?: Tag;
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

/**
 * Parse CSV file and validate tags
 */
export async function parseTagsCSV(
  file: File,
  existingTags: Tag[]
): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        const rows: ParsedCSVRow[] = [];
        const seenSlugs = new Set<string>();
        let validCount = 0;
        let duplicatesInCSVCount = 0;
        let existsInSystemCount = 0;
        let errorsCount = 0;

        results.data.forEach((row: any, index: number) => {
          const rowNum = index + 2; // +2 for 1-based indexing and header row

          // Validate name
          const name = (row.name || '').trim();
          if (!name) {
            rows.push({
              name: '',
              slug: '',
              visibility: 'public',
              rowNumber: rowNum,
              status: 'error',
              error: 'Name is required',
            });
            errorsCount++;
            return;
          }

          if (name.length < 2) {
            rows.push({
              name,
              slug: '',
              visibility: 'public',
              rowNumber: rowNum,
              status: 'error',
              error: 'Name must be at least 2 characters',
            });
            errorsCount++;
            return;
          }

          // Generate or validate slug
          let slug = (row.slug || '').trim();
          if (!slug) {
            slug = generateSlug(name);
          } else {
            // Validate slug format (lowercase alphanumeric with hyphens)
            const slugPattern = /^[a-z0-9-]+$/;
            if (!slugPattern.test(slug)) {
              rows.push({
                name,
                slug,
                visibility: 'public',
                rowNumber: rowNum,
                status: 'error',
                error: 'Slug must be lowercase alphanumeric with hyphens',
              });
              errorsCount++;
              return;
            }
          }

          // Validate visibility
          const visibilityRaw = (row.visibility || 'public').toLowerCase().trim();
          const visibility: TagVisibility =
            visibilityRaw === 'private' ? 'private' : 'public';

          // Check for duplicate within CSV
          if (seenSlugs.has(slug)) {
            rows.push({
              name,
              slug,
              visibility,
              rowNumber: rowNum,
              status: 'duplicate-in-csv',
              error: 'Duplicate slug in CSV (using first occurrence)',
            });
            duplicatesInCSVCount++;
            return;
          }

          // Check if slug already exists in system
          const existingTag = existingTags.find((t) => t.slug === slug);
          if (existingTag) {
            const isExactMatch = existingTag.name === name && existingTag.visibility === visibility;
            rows.push({
              name,
              slug,
              visibility,
              rowNumber: rowNum,
              status: 'exists-in-system',
              conflictType: isExactMatch ? 'exact-match' : 'slug-match',
              existingTag,
            });
            existsInSystemCount++;
            seenSlugs.add(slug);
            return;
          }

          // Valid row
          seenSlugs.add(slug);
          rows.push({
            name,
            slug,
            visibility,
            rowNumber: rowNum,
            status: 'valid',
          });
          validCount++;
        });

        resolve({
          rows,
          stats: {
            total: results.data.length,
            valid: validCount,
            duplicatesInCSV: duplicatesInCSVCount,
            existsInSystem: existsInSystemCount,
            errors: errorsCount,
          },
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

/**
 * Generate a unique slug by appending a number
 */
export function generateUniqueSlug(baseSlug: string, existingTags: Tag[], csvSlugs: Set<string>): string {
  let counter = 2;
  let newSlug = `${baseSlug}-${counter}`;

  while (
    !isSlugUnique(newSlug, undefined, existingTags) ||
    csvSlugs.has(newSlug)
  ) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  return newSlug;
}

import Papa from 'papaparse';
import { Category, SelectOption, ParsedCSVRow, CSVParseResult, ConflictResolution, OrphanedCategory, CategoryStatus, CategoryVisibility } from './types';

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
 * Find category by ID in tree
 */
export function findCategoryById(
  categories: Category[],
  id: string
): Category | null {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }
  }
  return null;
}

/**
 * Get all child IDs recursively
 */
export function getAllChildIds(
  categoryId: string,
  allCategories: Category[]
): string[] {
  const childIds: string[] = [];
  const children = allCategories.filter((c) => c.parentId === categoryId);

  for (const child of children) {
    childIds.push(child.id);
    childIds.push(...getAllChildIds(child.id, allCategories));
  }

  return childIds;
}

/**
 * Calculate nesting depth for a category
 */
export function getCategoryDepth(
  category: Category,
  allCategories: Category[]
): number {
  let depth = 0;
  let current = category;

  while (current.parentId) {
    depth++;
    const parent = findCategoryById(allCategories, current.parentId);
    if (!parent) break;
    current = parent;
  }

  return depth;
}

/**
 * Validate parent selection (prevent circular refs and max depth)
 */
export function isValidParent(
  categoryId: string | undefined,
  parentId: string | null,
  allCategories: Category[],
  maxDepth: number = 4
): { valid: boolean; error?: string } {
  if (!parentId) {
    return { valid: true }; // No parent is always valid
  }

  // Can't be own parent
  if (categoryId && categoryId === parentId) {
    return { valid: false, error: 'Cannot select self as parent' };
  }

  // Can't select a descendant as parent
  if (categoryId) {
    const childIds = getAllChildIds(categoryId, allCategories);
    if (childIds.includes(parentId)) {
      return { valid: false, error: 'Cannot select descendant as parent' };
    }
  }

  // Check depth with new parent
  const parent = findCategoryById(allCategories, parentId);
  if (parent) {
    const parentDepth = getCategoryDepth(parent, allCategories);
    if (parentDepth >= maxDepth - 1) {
      return { valid: false, error: `Maximum nesting depth (${maxDepth}) reached` };
    }
  }

  return { valid: true };
}

/**
 * Get parent category path string (e.g., "Exercises / Cycling")
 */
export function getParentPath(
  parentId: string | null,
  allCategories: Category[]
): string {
  if (!parentId) return '';

  const pathParts: string[] = [];
  let currentId: string | null = parentId;

  while (currentId) {
    const category = findCategoryById(allCategories, currentId);
    if (!category) break;
    pathParts.unshift(category.name);
    currentId = category.parentId;
  }

  return pathParts.join(' / ');
}

/**
 * Flatten tree for search/filter
 */
export function flattenCategories(categories: Category[]): Category[] {
  return categories;
}

/**
 * Filter categories maintaining hierarchy
 */
export function filterCategoriesWithHierarchy(
  categories: Category[],
  query: string
): Category[] {
  if (!query.trim()) return categories;

  const lowerQuery = query.toLowerCase();
  const matchedIds = new Set<string>();

  // Find all matches
  for (const category of categories) {
    if (
      category.name.toLowerCase().includes(lowerQuery) ||
      category.slug.toLowerCase().includes(lowerQuery)
    ) {
      matchedIds.add(category.id);

      // Add all parents
      let currentId = category.parentId;
      while (currentId) {
        matchedIds.add(currentId);
        const parent = findCategoryById(categories, currentId);
        if (!parent) break;
        currentId = parent.parentId;
      }
    }
  }

  return categories.filter((c) => matchedIds.has(c.id));
}

/**
 * Build hierarchical options for parent selector
 */
export function buildParentOptions(
  categories: Category[],
  excludeIds: string[] = []
): SelectOption[] {
  const options: SelectOption[] = [{ label: 'None (Root level)', value: '' }];

  const buildOptions = (parentId: string | null, depth: number = 0) => {
    const children = categories
      .filter((c) => c.parentId === parentId && !excludeIds.includes(c.id))
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const child of children) {
      const indent = '  '.repeat(depth);
      const path = getParentPath(child.id, categories);
      options.push({
        label: `${indent}${path}`,
        value: child.id,
        depth,
      });
      buildOptions(child.id, depth + 1);
    }
  };

  buildOptions(null);
  return options;
}

/**
 * Get children categories
 */
export function getChildren(
  parentId: string | null,
  allCategories: Category[]
): Category[] {
  return allCategories.filter((c) => c.parentId === parentId);
}

/**
 * Check if slug is unique
 */
export function isSlugUnique(
  slug: string,
  categoryId: string | undefined,
  allCategories: Category[]
): boolean {
  return !allCategories.some((c) => c.slug === slug && c.id !== categoryId);
}

/**
 * CSV Import Utilities
 */

/**
 * Generate a unique slug by appending a number
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingCategories: Category[],
  csvSlugs: Set<string>
): string {
  let counter = 2;
  let newSlug = `${baseSlug}-${counter}`;

  while (
    !isSlugUnique(newSlug, undefined, existingCategories) ||
    csvSlugs.has(newSlug)
  ) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  return newSlug;
}

/**
 * Calculate depth for a category during CSV import
 * Handles both CSV rows and existing categories
 */
export function calculateDepthForCSV(
  slug: string,
  csvRows: ParsedCSVRow[],
  existingCategories: Category[],
  memo: Map<string, number> = new Map()
): number {
  // Check memo
  if (memo.has(slug)) {
    return memo.get(slug)!;
  }

  // Find in CSV rows
  const csvRow = csvRows.find((r) => r.slug === slug);
  if (csvRow) {
    if (!csvRow.parentSlug) {
      memo.set(slug, 0);
      return 0;
    }
    const parentDepth = calculateDepthForCSV(
      csvRow.parentSlug,
      csvRows,
      existingCategories,
      memo
    );
    if (parentDepth === -1) return -1; // Parent not found
    const depth = parentDepth + 1;
    memo.set(slug, depth);
    return depth;
  }

  // Find in existing categories
  const existing = existingCategories.find((c) => c.slug === slug);
  if (existing) {
    const depth = getCategoryDepth(existing, existingCategories);
    memo.set(slug, depth);
    return depth;
  }

  // Not found
  return -1;
}

/**
 * Topological sort with cycle detection (Kahn's algorithm)
 * Sorts categories by dependency order (parents before children)
 */
export function topologicalSort(rows: ParsedCSVRow[]): {
  sorted: ParsedCSVRow[];
  circular: ParsedCSVRow[];
} {
  const graph = new Map<string, string[]>(); // slug → children slugs
  const inDegree = new Map<string, number>(); // slug → number of parents
  const slugToRow = new Map<string, ParsedCSVRow>();

  // Build graph
  for (const row of rows) {
    slugToRow.set(row.slug, row);
    inDegree.set(row.slug, 0);
    graph.set(row.slug, []);
  }

  // Build edges (parent → child)
  for (const row of rows) {
    if (row.parentSlug && slugToRow.has(row.parentSlug)) {
      const children = graph.get(row.parentSlug);
      if (children) {
        children.push(row.slug);
        inDegree.set(row.slug, (inDegree.get(row.slug) || 0) + 1);
      }
    }
  }

  // Kahn's algorithm
  const queue: string[] = [];
  const sorted: ParsedCSVRow[] = [];

  // Add all roots to queue (in-degree = 0)
  for (const [slug, degree] of inDegree) {
    if (degree === 0) {
      queue.push(slug);
    }
  }

  while (queue.length > 0) {
    const slug = queue.shift()!;
    const row = slugToRow.get(slug)!;
    sorted.push(row);

    // Process children
    const children = graph.get(slug) || [];
    for (const child of children) {
      inDegree.set(child, inDegree.get(child)! - 1);
      if (inDegree.get(child) === 0) {
        queue.push(child);
      }
    }
  }

  // Remaining rows have circular dependencies
  const circular = rows.filter((row) => !sorted.includes(row));

  return { sorted, circular };
}

/**
 * Detect orphaned categories (children whose parents will be skipped)
 */
export function detectOrphans(
  rows: ParsedCSVRow[],
  resolutions: Map<string, ConflictResolution>,
  existingCategories: Category[]
): OrphanedCategory[] {
  const orphans: OrphanedCategory[] = [];

  for (const row of rows) {
    // Skip rows that already have errors - those are shown separately
    if (row.status === 'error') continue;

    if (!row.parentSlug) continue; // Root categories can't be orphaned

    // Check if parent exists in CSV rows
    const parentInCSV = rows.find((r) => r.slug === row.parentSlug);

    if (parentInCSV) {
      // Parent is in CSV - only flag orphans if parent will be skipped due to conflict resolution
      if (parentInCSV.status === 'exists-in-system') {
        const resolution = resolutions.get(parentInCSV.slug);
        if (resolution?.action === 'skip') {
          orphans.push({
            slug: row.slug,
            name: row.name,
            parentSlug: row.parentSlug,
            reason: 'parent-skipped',
          });
        }
      }
      // Don't flag orphans for parent-error or parent-missing - those rows already have error status
    }
  }

  return orphans;
}

/**
 * Convert JSON array to CSV string
 */
export function convertJsonToCsv(jsonData: any[]): string {
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    throw new Error('Invalid JSON data: expected non-empty array');
  }

  const headers = ['name', 'slug', 'parentSlug', 'status', 'visibility'];
  const csvRows: string[] = [headers.join(',')];

  for (const item of jsonData) {
    const row = [
      `"${(item.name || '').replace(/"/g, '""')}"`,
      (item.slug || '').trim(),
      (item.parentSlug || '').trim(),
      (item.status || 'published').trim(),
      (item.visibility || 'public').trim(),
    ];
    csvRows.push(row.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Parse CSV file and validate categories
 */
export async function parseCategoriesCSV(
  file: File,
  existingCategories: Category[]
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
          const rowNum = index + 1; // +1 for 1-based indexing (starting from first data row)

          // Validate name
          const name = (row.name || '').trim();
          if (!name) {
            rows.push({
              name: '',
              slug: '',
              parentSlug: null,
              categoryStatus: 'published',
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
              parentSlug: null,
              categoryStatus: 'published',
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
                parentSlug: null,
                categoryStatus: 'published',
                visibility: 'public',
                rowNumber: rowNum,
                status: 'error',
                error: 'Slug must be lowercase alphanumeric with hyphens',
              });
              errorsCount++;
              return;
            }
          }

          // Validate parentSlug
          const parentSlug = (row.parentslug || '').trim() || null;

          // Validate status
          const statusRaw = (row.status || 'published').toLowerCase().trim();
          const validStatuses: CategoryStatus[] = ['draft', 'published', 'in-review'];
          const categoryStatus: CategoryStatus = validStatuses.includes(statusRaw as CategoryStatus)
            ? (statusRaw as CategoryStatus)
            : 'published';

          // Validate visibility
          const visibilityRaw = (row.visibility || 'public').toLowerCase().trim();
          const visibility: CategoryVisibility =
            visibilityRaw === 'private' ? 'private' : 'public';

          // Check for duplicate within CSV
          if (seenSlugs.has(slug)) {
            rows.push({
              name,
              slug,
              parentSlug,
              categoryStatus,
              visibility,
              rowNumber: rowNum,
              status: 'duplicate-in-csv',
              error: 'Duplicate slug in CSV (using first occurrence)',
            });
            duplicatesInCSVCount++;
            return;
          }

          // Check if slug already exists in system
          const existingCategory = existingCategories.find((c) => c.slug === slug);
          if (existingCategory) {
            const isExactMatch =
              existingCategory.name === name &&
              existingCategory.visibility === visibility &&
              existingCategory.status === categoryStatus;
            rows.push({
              name,
              slug,
              parentSlug,
              categoryStatus,
              visibility,
              rowNumber: rowNum,
              status: 'exists-in-system',
              conflictType: isExactMatch ? 'exact-match' : 'slug-match',
              existingCategory,
            });
            existsInSystemCount++;
            seenSlugs.add(slug);
            return;
          }

          // Preliminary row (will validate parent and depth later)
          seenSlugs.add(slug);
          rows.push({
            name,
            slug,
            parentSlug,
            categoryStatus,
            visibility,
            rowNumber: rowNum,
            status: 'valid',
          });
          validCount++;
        });

        // Validate parent relationships and detect circular references
        const validRows = rows.filter((r) => r.status === 'valid');

        // Check for circular references
        const { sorted, circular } = topologicalSort(validRows);

        // Mark circular references as errors
        for (const circularRow of circular) {
          const rowIndex = rows.findIndex((r) => r.slug === circularRow.slug);
          if (rowIndex !== -1) {
            rows[rowIndex].status = 'error';
            rows[rowIndex].error = 'Circular reference detected';
            validCount--;
            errorsCount++;
          }
        }

        // Validate parent existence and depth for non-circular valid rows
        const depthMemo = new Map<string, number>();
        for (const row of rows) {
          if (row.status !== 'valid') continue;

          // Validate parent slug exists (in CSV or system)
          if (row.parentSlug) {
            const parentInCSV = rows.find((r) => r.slug === row.parentSlug);
            const parentInSystem = existingCategories.find(
              (c) => c.slug === row.parentSlug
            );

            if (!parentInCSV && !parentInSystem) {
              row.status = 'error';
              row.error = `Parent category '${row.parentSlug}' not found`;
              validCount--;
              errorsCount++;
              continue;
            }
          }

          // Calculate and validate depth
          const depth = calculateDepthForCSV(
            row.slug,
            rows,
            existingCategories,
            depthMemo
          );
          if (depth > 3) {
            row.status = 'error';
            row.error = `Maximum nesting depth (4 levels) exceeded. This category would be at level ${
              depth + 1
            }`;
            validCount--;
            errorsCount++;
            continue;
          }

          row.depth = depth;
        }

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

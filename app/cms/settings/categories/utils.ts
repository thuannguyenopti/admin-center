import { Category, SelectOption } from './types';

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

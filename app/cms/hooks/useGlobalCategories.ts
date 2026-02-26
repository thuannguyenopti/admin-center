"use client";

import { useCallback } from 'react';
import usePersistentState from '@/app/usePersistentState';
import { Category } from '../settings/categories/types';
import { initialCategories } from '@/app/db/initialData';

/**
 * Hook to access and manage global categories from the centralized repository
 * Categories are stored in localStorage and shared across the application
 */
export function useGlobalCategories() {
  const [categories, setCategories] = usePersistentState('categories', initialCategories);

  /**
   * Get all category names as an array of strings
   */
  const getCategoryNames = useCallback((): string[] => {
    return categories.map((cat: Category) => cat.name);
  }, [categories]);

  /**
   * Get all categories with their slugs for display
   */
  const getCategoriesWithSlugs = useCallback((): { name: string; slug: string }[] => {
    return categories.map((cat: Category) => ({ name: cat.name, slug: cat.slug }));
  }, [categories]);

  /**
   * Add a new category to the centralized repository
   * Creates a new category with auto-generated ID and slug
   */
  const addCategory = useCallback(
    (categoryName: string) => {
      // Check if category already exists (case-insensitive)
      const exists = categories.some(
        (cat: Category) => cat.name.toLowerCase() === categoryName.toLowerCase()
      );

      if (!exists && categoryName.trim()) {
        // Generate slug from name (lowercase, replace spaces with hyphens)
        const slug = categoryName
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');

        // Create new category
        const newCategory: Category = {
          id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: categoryName.trim(),
          slug,
          status: 'published',
          visibility: 'public',
          modifiedBy: 'Current User', // In a real app, this would be the actual user
          usage: 0,
          lastModified: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          parentId: null,
          isExpanded: false,
        };

        setCategories([...categories, newCategory]);
        return true;
      }

      return false;
    },
    [categories, setCategories]
  );

  /**
   * Check if a category exists in the centralized repository
   */
  const categoryExists = useCallback(
    (categoryName: string): boolean => {
      return categories.some(
        (cat: Category) => cat.name.toLowerCase() === categoryName.toLowerCase()
      );
    },
    [categories]
  );

  /**
   * Get category by slug
   */
  const getCategoryBySlug = useCallback(
    (slug: string): Category | undefined => {
      return categories.find((cat: Category) => cat.slug === slug);
    },
    [categories]
  );

  /**
   * Get category name by slug
   */
  const getCategoryNameBySlug = useCallback(
    (slug: string): string | undefined => {
      const category = categories.find((cat: Category) => cat.slug === slug);
      return category?.name;
    },
    [categories]
  );

  return {
    categories,
    categoryNames: getCategoryNames(),
    categoriesWithSlugs: getCategoriesWithSlugs(),
    addCategory,
    categoryExists,
    getCategoryBySlug,
    getCategoryNameBySlug,
  };
}

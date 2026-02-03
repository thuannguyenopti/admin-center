"use client";

import { useCallback } from 'react';
import usePersistentState from '@/app/usePersistentState';
import { Tag } from '../settings/tags/types';
import { initialTags } from '@/app/db/initialData';

/** Capitalize first letter of each word (title case); omit hyphens from name */
function toTagName(str: string): string {
  return str
    .trim()
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

/** Slug: lowercase, hyphens for spaces, alphanumeric only */
function toTagSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Hook to access and manage global tags from the centralized repository
 * Tags are stored in localStorage and shared across the application
 */
export function useGlobalTags() {
  const [tags, setTags] = usePersistentState('tags', initialTags);

  /**
   * Get all tag names as an array of strings
   */
  const getTagNames = useCallback((): string[] => {
    return tags.map((tag: Tag) => tag.name);
  }, [tags]);

  /**
   * Add a new tag to the centralized repository
   * Creates a new tag with auto-generated ID and slug.
   * Tag names use title case and no hyphens; slugs are lowercase with no hyphens.
   */
  const addTag = useCallback(
    (tagName: string) => {
      const name = toTagName(tagName);
      if (!name) return false;

      // Check if tag already exists (case-insensitive)
      const exists = tags.some(
        (tag: Tag) => tag.name.toLowerCase() === name.toLowerCase()
      );

      if (!exists) {
        const slug = toTagSlug(name);

        // Create new tag
        const newTag: Tag = {
          id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          slug,
          visibility: 'private',
          modifiedBy: 'Current User', // In a real app, this would be the actual user
          usage: 0,
          lastModified: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        };

        setTags([...tags, newTag]);
        return true;
      }

      return false;
    },
    [tags, setTags]
  );

  /**
   * Check if a tag exists in the centralized repository
   */
  const tagExists = useCallback(
    (tagName: string): boolean => {
      return tags.some(
        (tag: Tag) => tag.name.toLowerCase() === tagName.toLowerCase()
      );
    },
    [tags]
  );

  return {
    tags,
    tagNames: getTagNames(),
    addTag,
    tagExists,
  };
}

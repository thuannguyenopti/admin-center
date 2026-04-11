/**
 * Tags Migration - Cleans up localStorage tags to match initialData
 * Removes orphaned tags and updates usage counts
 */

const MIGRATION_VERSION = '2026-02-11-tag-cleanup';
const MIGRATION_KEY = 'tags-migration-version';

// Slugs of orphaned tags to remove
const ORPHANED_TAG_IDS = [
  'tag-3',  // Beach Body
  'tag-5',  // Back to Fitness
  'tag-6',  // Fall Focus
  'tag-7',  // Routine Reboot
  'tag-8',  // Holiday Hustle
  'tag-9',  // New Year Reset
  'tag-10', // Resolution Challenge
  'tag-11', // Festive Fitness
];

export function runTagsMigration() {
  try {
    // Check if migration has already run
    const currentVersion = localStorage.getItem(MIGRATION_KEY);
    if (currentVersion === MIGRATION_VERSION) {
      console.log('[Tags Migration] Already up to date');
      return;
    }

    console.log('[Tags Migration] Starting cleanup...');

    // Get current tags from localStorage
    const tagsJson = localStorage.getItem('tags');
    if (!tagsJson) {
      console.log('[Tags Migration] No tags in localStorage, skipping');
      localStorage.setItem(MIGRATION_KEY, MIGRATION_VERSION);
      return;
    }

    let tags = JSON.parse(tagsJson);
    const originalCount = tags.length;

    // Remove orphaned tags
    tags = tags.filter((tag: any) => !ORPHANED_TAG_IDS.includes(tag.id));

    // Get pages to calculate actual usage
    const pagesJson = localStorage.getItem('pages');
    if (pagesJson) {
      const pages = JSON.parse(pagesJson);

      // Calculate actual usage counts
      const usageCounts: Record<string, number> = {};

      // Count tag usage across all content items
      pages.forEach((page: any) => {
        // Check page tags
        if (page.tags && Array.isArray(page.tags)) {
          page.tags.forEach((tagSlug: string) => {
            usageCounts[tagSlug] = (usageCounts[tagSlug] || 0) + 1;
          });
        }

        // Check components within page
        if (page.components && Array.isArray(page.components)) {
          page.components.forEach((component: any) => {
            if (component.tags && Array.isArray(component.tags)) {
              component.tags.forEach((tagSlug: string) => {
                usageCounts[tagSlug] = (usageCounts[tagSlug] || 0) + 1;
              });
            }
          });
        }
      });

      // Update usage counts
      tags = tags.map((tag: any) => ({
        ...tag,
        usage: usageCounts[tag.slug] || 0,
      }));
    }

    // Save cleaned tags
    localStorage.setItem('tags', JSON.stringify(tags));
    localStorage.setItem(MIGRATION_KEY, MIGRATION_VERSION);

    const removedCount = originalCount - tags.length;
    console.log(`[Tags Migration] Complete - Removed ${removedCount} orphaned tags, updated usage counts for ${tags.length} tags`);
  } catch (error) {
    console.error('[Tags Migration] Error during migration:', error);
  }
}

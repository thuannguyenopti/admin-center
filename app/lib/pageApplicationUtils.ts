<<<<<<< HEAD
import type { Application, Page } from "@/app/db/initialData";

/**
 * Find which application a page belongs to by traversing its parent hierarchy.
 *
 * @param pageId - The ID of the page to find the application for
 * @param pages - Array of all pages
 * @param applications - Array of all applications
 * @returns The application the page belongs to, or null if not found
 */
export function getPageApplication(pageId: string, pages: Page[], applications: Application[]): Application | null {
	const pageMap = new Map(pages.map((p) => [p.id, p]));
	const appByStartPage = new Map(applications.map((a) => [a.startPageId, a]));

	let current = pageMap.get(pageId);
	const visited = new Set<string>();
	const MAX_DEPTH = 20; // Prevent infinite loops

	while (current && visited.size < MAX_DEPTH) {
		if (current.parentId === null) {
			// Found root page - check if it's an application start page
			return appByStartPage.get(current.id) ?? null;
		}
		visited.add(current.id);
		current = pageMap.get(current.parentId);
	}

	return null;
}

/**
 * Get unique application names for a list of page IDs.
 *
 * @param pageIds - Array of page IDs
 * @param pages - Array of all pages
 * @param applications - Array of all applications
 * @returns Sorted array of unique application names
 */
export function getApplicationNamesForPages(pageIds: string[], pages: Page[], applications: Application[]): string[] {
	const apps = pageIds.map((id) => getPageApplication(id, pages, applications)).filter((app): app is Application => app !== null);

	const uniqueNames = Array.from(new Set(apps.map((a) => a.name)));
	return uniqueNames.sort();
}
=======
import type { Application, Page } from "@/app/db/initialData";

/**
 * Find which application a page belongs to by traversing its parent hierarchy.
 *
 * @param pageId - The ID of the page to find the application for
 * @param pages - Array of all pages
 * @param applications - Array of all applications
 * @returns The application the page belongs to, or null if not found
 */
export function getPageApplication(pageId: string, pages: Page[], applications: Application[]): Application | null {
	const pageMap = new Map(pages.map((p) => [p.id, p]));
	const appByStartPage = new Map(applications.map((a) => [a.startPageId, a]));

	let current = pageMap.get(pageId);
	const visited = new Set<string>();
	const MAX_DEPTH = 20; // Prevent infinite loops

	while (current && visited.size < MAX_DEPTH) {
		if (current.parentId === null) {
			// Found root page - check if it's an application start page
			return appByStartPage.get(current.id) ?? null;
		}
		visited.add(current.id);
		current = pageMap.get(current.parentId);
	}

	return null;
}

/**
 * Get unique application names for a list of page IDs.
 *
 * @param pageIds - Array of page IDs
 * @param pages - Array of all pages
 * @param applications - Array of all applications
 * @returns Sorted array of unique application names
 */
export function getApplicationNamesForPages(pageIds: string[], pages: Page[], applications: Application[]): string[] {
	const apps = pageIds.map((id) => getPageApplication(id, pages, applications)).filter((app): app is Application => app !== null);

	const uniqueNames = Array.from(new Set(apps.map((a) => a.name)));
	return uniqueNames.sort();
}
>>>>>>> origin/main

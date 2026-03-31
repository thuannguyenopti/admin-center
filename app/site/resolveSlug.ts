import type {Page} from "@/app/db/initialData";

/**
 * Slugify a page name into a URL-safe segment.
 * e.g. "About Us" → "about-us"
 */
export function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

/**
 * Build a full slug path for a page by walking the parent chain.
 * If the page has an explicit `slug`, use it as the last segment.
 * Parent paths are always included from the hierarchy.
 */
export function buildPageSlug(page: Page, allPages: Page[]): string {
	// Homepage special case
	if (!page.parentId && page.name === "Homepage") return "";

	// Walk parent chain to build path segments
	const segments: string[] = [];
	let current: Page | undefined = page;
	let isFirstPage = true;

	while (current) {
		// Don't include "Homepage" in the path
		if (!current.parentId && current.name === "Homepage") break;

		// Use explicit slug for the current page, otherwise slugify the name
		if (isFirstPage && current.slug) {
			segments.unshift(current.slug);
		} else {
			segments.unshift(slugify(current.name));
		}

		isFirstPage = false;

		if (current.parentId) {
			current = allPages.find((p) => p.id === current!.parentId);
		} else {
			break;
		}
	}

	return segments.join("/");
}

/**
 * Resolve a slug array (from [...slug] catch-all) to a published page.
 * Only returns pages with status === "Published".
 */
export function resolveSlugToPage(slugSegments: string[], allPages: Page[]): Page | null {
	const targetSlug = slugSegments.join("/");

	// Only consider published pages
	const publishedPages = allPages.filter((p) => p.status === "Published");

	for (const page of publishedPages) {
		const pageSlug = buildPageSlug(page, allPages);
		if (pageSlug === targetSlug) return page;
	}

	return null;
}

/**
 * Find the homepage (published, root level, named "Homepage").
 */
export function findHomepage(allPages: Page[]): Page | null {
	return (
		allPages.find((p) => p.status === "Published" && !p.parentId && p.name === "Homepage") ??
		null
	);
}

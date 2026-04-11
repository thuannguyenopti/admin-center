import type { ContentType } from "@/app/db/initialData";

/**
 * Content Instance type from CMP
 */
export type ContentInstance = {
	id: string;
	modelId: string;
	modelDisplayName: string;
	createdAt: string;
	fields: Record<string, any>;
};

/**
 * Page type from CMS
 */
export type Page = {
	id: string;
	name: string;
	parentId: string | null;
	status: "Published" | "Draft" | "Review" | "Changed" | "In Trash";
	lastModified: string;
	contentTypeId: string;
	slug?: string;
	data?: Record<string, any>;
	variations?: {
		id: string;
		name: string;
		status: string;
		outlines?: any[];
		data?: Record<string, any>;
	}[];
	outlines?: any[];
	tags?: string[];
	categories?: string[];
};

/**
 * Convert a CMP content instance to a CMS page
 * This enables instant preview of CMP content in the CMS
 */
export function contentInstanceToPage(
	instance: ContentInstance,
	contentType: ContentType
): Page {
	// Generate a slug from the instance display name or first text field
	const titleField = Object.entries(instance.fields).find(
		([_, value]) => typeof value === "string" && value.length > 0
	);
	const title = titleField ? titleField[1] : instance.modelDisplayName;
	const slug = generateSlug(title);

	return {
		id: `page-from-${instance.id}`,
		name: instance.modelDisplayName,
		parentId: null, // CMP content instances don't have a parent by default
		status: "Draft", // Always start as draft
		lastModified: instance.createdAt,
		contentTypeId: instance.modelId, // Link to the unified content type
		slug: slug,
		data: instance.fields, // Map instance fields to page data
		tags: [], // Could be extended to map tags from instance
		categories: [], // Could be extended to map categories
	};
}

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "") // Remove special characters
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/-+/g, "-") // Remove consecutive hyphens
		.replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Batch convert multiple content instances to pages
 */
export function contentInstancesToPages(
	instances: ContentInstance[],
	contentTypes: ContentType[]
): Page[] {
	return instances.map((instance) => {
		const contentType = contentTypes.find((ct) => ct.id === instance.modelId);
		if (!contentType) {
			console.warn(`Content type ${instance.modelId} not found for instance ${instance.id}`);
			// Return a basic page anyway
			return contentInstanceToPage(instance, {
				id: instance.modelId,
				name: instance.modelDisplayName,
				displayName: instance.modelDisplayName,
				baseType: "Page",
				properties: [],
			} as ContentType);
		}
		return contentInstanceToPage(instance, contentType);
	});
}

/**
 * Check if a page was generated from a CMP content instance
 */
export function isPageFromContentInstance(pageId: string): boolean {
	return pageId.startsWith("page-from-ci-");
}

/**
 * Extract the content instance ID from a page ID
 */
export function getContentInstanceIdFromPageId(pageId: string): string | null {
	if (!isPageFromContentInstance(pageId)) {
		return null;
	}
	return pageId.replace("page-from-", "");
}

/**
 * Sync content instance changes to its corresponding page
 */
export function syncContentInstanceToPage(
	instance: ContentInstance,
	existingPage: Page,
	contentType: ContentType
): Page {
	return {
		...existingPage,
		name: instance.modelDisplayName,
		lastModified: new Date().toISOString(),
		data: instance.fields,
		// Keep other page properties like parentId, status, etc.
	};
}

import { ContentType, ContentTypeMapping, Page, canCreateChildType } from "@/app/db/initialData";
import { ContentInstance } from "@/app/db/cmpInitialData";
import { applyMapping } from "./contentTypeMapping";

/**
 * Connect a CMP content instance to a CMS page
 * Populates page.data using field mappings
 */
export function connectInstanceToPage(
	instance: ContentInstance,
	page: Page,
	contentTypes: ContentType[]
): Page {
	console.log('🔗 connectInstanceToPage - START');
	console.log('  Instance:', instance.id, instance.modelId);
	console.log('  Page:', page.id, page.contentTypeId);

	// 1. Find mapping between instance model and page content type
	const mapping = findMappingForConnection(
		instance.modelId,
		page.contentTypeId,
		contentTypes
	);
	console.log('  Mapping found:', mapping?.name || 'NONE');

	// 2. Apply mapping to transform instance fields to page data
	const sourceType = contentTypes.find(ct => ct.id === instance.modelId);
	const targetType = contentTypes.find(ct => ct.id === page.contentTypeId);
	console.log('  Source type:', sourceType?.name);
	console.log('  Target type:', targetType?.name);

	let pageData = page.data || {};
	if (mapping && sourceType && targetType) {
		pageData = applyMapping(instance.fields, mapping, sourceType, targetType);
	} else {
		console.log('  ⚠️ No mapping found - using direct field copy');
		// Fallback: direct field copy if no mapping
		pageData = { ...instance.fields };
	}

	// 3. Update page with connection metadata
	return {
		...page,
		data: pageData,
		cmpConnection: {
			instanceId: instance.id,
			modelId: instance.modelId,
			mappingId: mapping?.id,
			syncStatus: "synced",
			lastSyncedAt: new Date().toISOString(),
			syncMode: "manual",
		},
		status: "Changed",
	};
}

/**
 * Sync page data with latest CMP content instance
 */
export function syncPageWithInstance(
	page: Page,
	instances: ContentInstance[],
	contentTypes: ContentType[]
): Page | null {
	if (!page.cmpConnection) return null;

	const instance = instances.find(i => i.id === page.cmpConnection!.instanceId);
	if (!instance) return null;

	return connectInstanceToPage(instance, page, contentTypes);
}

/**
 * Disconnect a page from its CMP content instance
 * Preserves current data but removes connection metadata
 */
export function disconnectPage(page: Page): Page {
	const { cmpConnection, ...rest } = page;
	return rest;
}

/**
 * Find appropriate mapping for connection
 */
function findMappingForConnection(
	sourceTypeId: string,
	targetTypeId: string,
	contentTypes: ContentType[]
): ContentTypeMapping | null {
	// Search through ALL content types - mappings are stored on the SOURCE type
	for (const contentType of contentTypes) {
		if (contentType.mappings) {
			const mapping = contentType.mappings.find(
				m => m.sourceContentTypeId === sourceTypeId &&
					m.targetContentTypeId === targetTypeId
			);
			if (mapping) {
				return mapping;
			}
		}
	}
	return null;
}

/**
 * Get list of content instances compatible with a page's content type
 * Includes instances of same type and instances that can be mapped
 */
export function getCompatibleInstances(
	page: Page,
	instances: ContentInstance[],
	contentTypes: ContentType[]
): ContentInstance[] {
	const pageContentType = contentTypes.find(ct => ct.id === page.contentTypeId);
	if (!pageContentType) return [];

	// Get all source type IDs that can be mapped to this page's content type
	const compatibleSourceTypeIds = new Set<string>();

	// Add the page's own content type
	compatibleSourceTypeIds.add(page.contentTypeId);

	// Search through ALL content types to find ones with mappings to this page type
	// Mappings are stored on the SOURCE content type, not the target
	contentTypes.forEach(sourceType => {
		if (sourceType.mappings) {
			sourceType.mappings.forEach(mapping => {
				if (mapping.targetContentTypeId === page.contentTypeId) {
					compatibleSourceTypeIds.add(mapping.sourceContentTypeId);
				}
			});
		}
	});

	// Filter instances to only those with compatible model IDs
	return instances.filter(instance =>
		compatibleSourceTypeIds.has(instance.modelId)
	);
}

/**
 * Check if a page has an active CMP connection
 */
export function hasConnection(page: Page): boolean {
	return !!page.cmpConnection;
}

/**
 * Get connection status display info
 */
export function getConnectionStatus(page: Page): {
	connected: boolean;
	instanceId?: string;
	syncStatus?: string;
	needsSync: boolean;
} {
	if (!page.cmpConnection) {
		return { connected: false, needsSync: false };
	}

	return {
		connected: true,
		instanceId: page.cmpConnection.instanceId,
		syncStatus: page.cmpConnection.syncStatus,
		needsSync: page.cmpConnection.syncStatus !== "synced",
	};
}

/**
 * Create a new CMS page from a CMP content instance using content type mapping.
 * Auto-selects valid parent location based on content type rules.
 *
 * @param instance - CMP content instance to transform
 * @param targetContentTypeId - CMS content type to create
 * @param contentTypes - All content types (for mapping lookup)
 * @param pages - All existing pages (for parent selection)
 * @param taskMetadata - Task information to attach to the page
 * @returns Object with new page and parent location, or error
 */
export function createPageFromInstance(
	instance: ContentInstance,
	targetContentTypeId: string,
	contentTypes: ContentType[],
	pages: Page[],
	taskMetadata?: { taskId: string; taskName: string }
): {
	page?: Page;
	parentId?: string | null;
	error?: string;
} {
	// 1. Find mapping from instance model to target content type
	const sourceType = contentTypes.find(ct => ct.id === instance.modelId);
	const targetType = contentTypes.find(ct => ct.id === targetContentTypeId);

	if (!sourceType || !targetType) {
		return { error: "Content type not found" };
	}

	const mapping = findMappingForConnection(instance.modelId, targetContentTypeId, contentTypes);

	if (!mapping) {
		return { error: "No mapping found between content types" };
	}

	// 2. Find valid parent location using canCreateChildType
	const rootNode = { id: "root", contentTypeId: "ct-page" } as Page;
	const allLocations = [rootNode, ...pages];
	const validLocations = allLocations.filter(page =>
		canCreateChildType(page.contentTypeId, targetContentTypeId)
	);

	if (validLocations.length === 0) {
		return { error: "No valid location found for this content type" };
	}

	// Use first valid location (or root if that's the only option)
	const parentLocation = validLocations[0];
	const parentId = parentLocation.id === "root" ? null : parentLocation.id;

	// 3. Apply mapping to transform instance fields to page data
	const transformedData = applyMapping(instance.fields, mapping, sourceType, targetType);

	// 4. Create new page
	const newPage: Page = {
		id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		name: instance.fields.title || instance.fields.name || "Untitled",
		parentId,
		status: "Draft",
		lastModified: new Date().toISOString(),
		contentTypeId: targetContentTypeId,
		data: transformedData,
		cmpConnection: {
			instanceId: instance.id,
			modelId: instance.modelId,
			mappingId: mapping.id,
			syncStatus: "synced",
			lastSyncedAt: new Date().toISOString(),
			syncMode: "manual",
		},
		cmpTaskMetadata: taskMetadata ? {
			taskId: taskMetadata.taskId,
			taskName: taskMetadata.taskName,
			addedAt: new Date().toISOString(),
			addedVia: "created",
		} : undefined,
	};

	return { page: newPage, parentId };
}

import { ContentType, ContentTypeMapping, Page, canCreateChildType } from "@/app/db/initialData";
import { ContentInstance, initialCmpContentModels } from "@/app/db/cmpInitialData";
import { applyMapping } from "./contentTypeMapping";

/**
 * Normalize CMP instance fields so that values are accessible by both
 * the original property names (used as data keys) AND any current
 * property names/IDs that may differ due to content type edits.
 *
 * Matches original → current properties using the description field,
 * then adds the value under the current property name and ID.
 */
function normalizeInstanceFields(
	fields: Record<string, any>,
	modelId: string,
	currentSourceType?: ContentType
): Record<string, any> {
	if (!currentSourceType) return fields;

	const originalModel = initialCmpContentModels.find(m => m.id === modelId);
	if (!originalModel) return fields;

	const normalized: Record<string, any> = { ...fields };

	// For each original property that has data, also index by property ID
	for (const origProp of originalModel.properties) {
		if (fields[origProp.name] === undefined) continue;
		// Add under original property ID
		normalized[origProp.id] = fields[origProp.name];
	}

	// Bridge renamed properties: match original → current by description
	for (const currentProp of currentSourceType.properties) {
		// Skip if data already exists under the current name or ID
		if (normalized[currentProp.name] !== undefined) continue;
		if (normalized[currentProp.id] !== undefined) continue;
		if (!currentProp.description) continue;

		// Find an original property with the same description
		const matchingOriginal = originalModel.properties.find(
			op => op.description === currentProp.description && fields[op.name] !== undefined
		);
		if (matchingOriginal) {
			normalized[currentProp.name] = fields[matchingOriginal.name];
			normalized[currentProp.id] = fields[matchingOriginal.name];
		}
	}

	return normalized;
}

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

	// Normalize instance fields so renamed properties can still be found
	const normalizedFields = normalizeInstanceFields(instance.fields, instance.modelId, sourceType);

	let pageData = page.data || {};
	if (mapping && sourceType && targetType) {
		pageData = applyMapping(normalizedFields, mapping, sourceType, targetType);
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
 * Find appropriate mapping for connection.
 * Searches for a direct mapping (source→target) first, then checks for
 * a reverse mapping (target→source) and flips its property mappings.
 */
function findMappingForConnection(
	sourceTypeId: string,
	targetTypeId: string,
	contentTypes: ContentType[]
): ContentTypeMapping | null {
	// 1. Try direct match first
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

	// 2. Try reverse match — if a mapping exists from target→source,
	//    flip the property mappings so they work in the other direction
	for (const contentType of contentTypes) {
		if (contentType.mappings) {
			const reverseMapping = contentType.mappings.find(
				m => m.sourceContentTypeId === targetTypeId &&
					m.targetContentTypeId === sourceTypeId
			);
			if (reverseMapping) {
				return {
					...reverseMapping,
					sourceContentTypeId: sourceTypeId,
					targetContentTypeId: targetTypeId,
					propertyMappings: reverseMapping.propertyMappings.map(pm => ({
						...pm,
						sourcePropertyId: pm.targetPropertyId,
						targetPropertyId: pm.sourcePropertyId,
					})),
				};
			}
		}
	}

	return null;
}

/**
 * Get list of content instances compatible with a page's content type.
 * Includes CMP instances and CMS pages whose content types have mappings to the target type.
 */
export function getCompatibleInstances(
	page: Page,
	instances: ContentInstance[],
	contentTypes: ContentType[],
	pages?: Page[]
): ContentInstance[] {
	const pageContentType = contentTypes.find(ct => ct.id === page.contentTypeId);
	if (!pageContentType) return [];

	// Get all source type IDs that can be mapped to this page's content type
	const compatibleSourceTypeIds = new Set<string>();

	// Add the page's own content type
	compatibleSourceTypeIds.add(page.contentTypeId);

	// Search through ALL content types to find ones with mappings to/from this page type
	contentTypes.forEach(ct => {
		if (ct.mappings) {
			ct.mappings.forEach(mapping => {
				// Direct: another type maps TO this page type
				if (mapping.targetContentTypeId === page.contentTypeId) {
					compatibleSourceTypeIds.add(mapping.sourceContentTypeId);
				}
				// Reverse: this page type maps TO another type (can connect in reverse)
				if (mapping.sourceContentTypeId === page.contentTypeId) {
					compatibleSourceTypeIds.add(mapping.targetContentTypeId);
				}
			});
		}
	});

	// Filter CMP instances to only those with compatible model IDs
	const cmpResults = instances.filter(instance =>
		compatibleSourceTypeIds.has(instance.modelId)
	);

	// Also include CMS pages whose content type is compatible (excluding the page itself)
	const cmsResults: ContentInstance[] = [];
	if (pages) {
		for (const p of pages) {
			if (p.id === page.id) continue;
			if (!compatibleSourceTypeIds.has(p.contentTypeId)) continue;

			const ct = contentTypes.find(c => c.id === p.contentTypeId);
			cmsResults.push({
				id: p.id,
				modelId: p.contentTypeId,
				modelDisplayName: ct?.displayName || ct?.name || p.contentTypeId,
				createdAt: p.lastModified || new Date().toISOString(),
				fields: p.data || {},
			});
		}
	}

	return [...cmpResults, ...cmsResults];
}

/**
 * Get the set of property IDs that are data-bound for a connected page.
 * Handles both direct mappings (target matches page type) and reverse
 * mappings (source matches page type, meaning the mapping was used in reverse).
 * Returns an empty Set if the page has no connection or no mapping is found.
 */
export function getBoundPropertyIds(
	page: Page,
	contentTypes: ContentType[]
): Set<string> {
	if (!page.cmpConnection?.mappingId) return new Set();

	for (const ct of contentTypes) {
		if (!ct.mappings) continue;
		const mapping = ct.mappings.find(m => m.id === page.cmpConnection!.mappingId);
		if (mapping) {
			// Determine which side of the mapping corresponds to this page's content type.
			// If targetContentTypeId matches, use targetPropertyId (direct mapping).
			// If sourceContentTypeId matches, use sourcePropertyId (reverse mapping).
			const useSource = mapping.sourceContentTypeId === page.contentTypeId;
			return new Set(mapping.propertyMappings.map(pm => {
				const id = useSource ? pm.sourcePropertyId : pm.targetPropertyId;
				return id.includes('.') ? id.split('.')[0] : id;
			}));
		}
	}

	return new Set();
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

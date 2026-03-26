import { ContentType, Property, PropertyType } from "@/app/db/initialData";
import type { CmpContentModel } from "@/app/db/cmpInitialData";

/**
 * Convert CMP property type to CMS Property type
 */
export function convertCmpPropertyTypeToCms(cmpType: string): PropertyType {
	const typeMap: Record<string, PropertyType> = {
		text: "String",
		longText: "LongString",
		richText: "XhtmlString",
		datetime: "DateTime",
		number: "Int",
		boolean: "Boolean",
		libraryAsset: "ImageReference",
		ImageReference: "ImageReference", // Allow direct ImageReference type
		VideoReference: "VideoReference", // Allow direct VideoReference type
		PageReference: "PageReference", // Allow direct PageReference type
		contentReference: "ContentReference",
		url: "Url",
		choice: "SelectOne",
		location: "address",
		json: "text", // Fallback to text for json
	};

	return typeMap[cmpType] || "String"; // Default to String if unknown
}

/**
 * Convert a single CMP property to CMS Property format
 */
export function convertCmpPropertyToCms(cmpProperty: any): Property {
	return {
		id: cmpProperty.id,
		name: cmpProperty.name,
		displayName: cmpProperty.displayName || cmpProperty.name,
		type: convertCmpPropertyTypeToCms(cmpProperty.type),
		required: cmpProperty.required || false,
		cultureSpecific: cmpProperty.localized || false,
		description: cmpProperty.description,
		// Note: CMP's list field doesn't have a direct CMS equivalent
		// We could consider using ContentArea or LinkItemCollection for list=true
	};
}

/**
 * Convert CmpContentModel to ContentType
 */
export function convertCmpModelToContentType(cmpModel: CmpContentModel): ContentType {
	return {
		id: cmpModel.id,
		name: cmpModel.name,
		displayName: cmpModel.displayName,
		baseType: cmpModel.baseType as ContentType["baseType"],
		description: cmpModel.description,
		properties: (cmpModel.properties || []).map(convertCmpPropertyToCms),
		modifiedAt: cmpModel.modifiedAt,
		modifiedBy: cmpModel.modifiedBy,
		// CMP-specific fields
		source: "cmp",
		apiIdentifier: cmpModel.apiIdentifier,
		version: cmpModel.version,
		defaultLocale: cmpModel.defaultLocale,
		modelType: cmpModel.modelType,
		coverImage: cmpModel.coverImage,
		isActive: cmpModel.isActive !== false, // Default to true if undefined
	};
}

/**
 * Type guard to check if a ContentType is from CMP
 */
export function isCmpType(contentType: ContentType): boolean {
	return contentType.source === "cmp";
}

/**
 * Type guard to check if a ContentType is from CMS
 */
export function isCmsType(contentType: ContentType): boolean {
	return contentType.source === "cms" || contentType.source === undefined;
}

/**
 * Migrate CMP content models from localStorage to unified contentTypes
 * Returns the merged contentTypes array
 */
export function migrateContentModels(
	existingContentTypes: ContentType[],
	cmpModels: CmpContentModel[]
): ContentType[] {
	// Convert all CMP models to ContentType format
	const convertedCmpTypes = cmpModels.map(convertCmpModelToContentType);

	// Create a map of existing IDs to avoid duplicates
	const existingIds = new Set(existingContentTypes.map((ct) => ct.id));

	// Merge: add CMP types that don't already exist
	const merged = [...existingContentTypes];
	convertedCmpTypes.forEach((cmpType) => {
		if (!existingIds.has(cmpType.id)) {
			merged.push(cmpType);
		} else {
			console.warn(`Content type with ID ${cmpType.id} already exists, skipping CMP model migration for this ID`);
		}
	});

	return merged;
}

/**
 * Check if migration has already been performed
 */
export function isMigrationComplete(): boolean {
	if (typeof window === "undefined") return true; // SSR safety
	return localStorage.getItem("contentTypesMigrated") === "true";
}

/**
 * Mark migration as complete
 */
export function markMigrationComplete(): void {
	if (typeof window === "undefined") return; // SSR safety
	localStorage.setItem("contentTypesMigrated", "true");
}

/**
 * Get legacy CMP content models from localStorage
 */
export function getLegacyCmpModels(): CmpContentModel[] | null {
	if (typeof window === "undefined") return null; // SSR safety

	try {
		const stored = localStorage.getItem("cmpContentModels");
		if (!stored) return null;
		return JSON.parse(stored);
	} catch (error) {
		console.error("Error reading legacy cmpContentModels:", error);
		return null;
	}
}

/**
 * Backup old CMP data before clearing
 */
export function backupLegacyCmpModels(): void {
	if (typeof window === "undefined") return; // SSR safety

	try {
		const legacy = localStorage.getItem("cmpContentModels");
		if (legacy) {
			localStorage.setItem("cmpContentModels_backup", legacy);
			localStorage.setItem("cmpContentModels_backup_date", new Date().toISOString());
		}
	} catch (error) {
		console.error("Error backing up legacy cmpContentModels:", error);
	}
}

/**
 * Clear legacy CMP models from localStorage
 */
export function clearLegacyCmpModels(): void {
	if (typeof window === "undefined") return; // SSR safety

	try {
		localStorage.removeItem("cmpContentModels");
	} catch (error) {
		console.error("Error removing legacy cmpContentModels:", error);
	}
}

/**
 * Main migration function - performs the complete migration process
 * Should be called on app initialization
 */
export function performMigration(currentContentTypes: ContentType[]): ContentType[] | null {
	// Skip if already migrated
	if (isMigrationComplete()) {
		return null;
	}

	// Get legacy CMP models
	const legacyCmpModels = getLegacyCmpModels();
	if (!legacyCmpModels || legacyCmpModels.length === 0) {
		// No legacy data to migrate, mark as complete anyway
		markMigrationComplete();
		return null;
	}

	console.log(`Migrating ${legacyCmpModels.length} CMP content models to unified contentTypes...`);

	// Backup before migration
	backupLegacyCmpModels();

	// Perform migration
	const mergedContentTypes = migrateContentModels(currentContentTypes, legacyCmpModels);

	// Clear legacy data
	clearLegacyCmpModels();

	// Mark migration complete
	markMigrationComplete();

	console.log(`Migration complete. ${mergedContentTypes.length} total content types.`);

	return mergedContentTypes;
}

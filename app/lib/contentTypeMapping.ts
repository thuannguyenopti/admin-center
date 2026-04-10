import {
	ContentType,
	ContentTypeMapping,
	PropertyMapping,
	PropertyType,
} from "@/app/db/initialData";

/**
 * Apply a content type mapping to transform data from source to target format
 */
export function applyMapping(
	sourceData: Record<string, any>,
	mapping: ContentTypeMapping,
	sourceType: ContentType,
	targetType: ContentType
): Record<string, any> {
	console.log('🔍 applyMapping - START');
	console.log('  Source data keys:', Object.keys(sourceData));
	console.log('  Source data:', sourceData);
	console.log('  Mapping:', mapping.name);
	console.log('  Property mappings count:', mapping.propertyMappings.length);

	const result: Record<string, any> = {};

	for (const propMapping of mapping.propertyMappings) {
		// Find the source property to get its name (used as key in instance data)
		const sourceProp = sourceType.properties.find(p => p.id === propMapping.sourcePropertyId);
		const sourceKey = sourceProp?.name || propMapping.sourcePropertyId;

		// Try lookup by property name first (CMP instances), then by property ID (CMS pages)
		const sourceValue = sourceData[sourceKey] ?? sourceData[propMapping.sourcePropertyId];
		console.log(`  📋 Mapping: ${propMapping.sourcePropertyId} → ${propMapping.targetPropertyId}`);
		console.log(`     Source prop:`, sourceProp);
		console.log(`     Source key: "${sourceKey}"`);
		console.log(`     Source value:`, sourceValue);

		const transformedValue = applyTransformation(
			sourceValue,
			propMapping,
			sourceData,
			sourceType
		);
		console.log(`     Transformed value:`, transformedValue);

		// Coerce value to match target property type
		const coercedValue = coerceValue(transformedValue, targetType, propMapping.targetPropertyId);

		// Handle nested properties (dot notation like "author.name")
		const targetPath = propMapping.targetPropertyId.split('.');
		if (targetPath.length > 1) {
			// Nested property - create object structure
			let current = result;
			for (let i = 0; i < targetPath.length - 1; i++) {
				const key = targetPath[i];
				if (!current[key] || typeof current[key] !== 'object') {
					current[key] = {};
				}
				current = current[key];
			}
			current[targetPath[targetPath.length - 1]] = coercedValue;
		} else {
			// Top-level property
			result[propMapping.targetPropertyId] = coercedValue;
		}
	}

	console.log('✅ applyMapping - RESULT:');
	console.log('  Result:', result);
	console.log('  Result keys:', Object.keys(result));

	return result;
}

/**
 * Coerce a value to match the expected target property type.
 * Prevents structured objects (e.g. {type, content}) from being
 * passed where a plain string is expected.
 */
function coerceValue(value: any, targetType: ContentType, targetPropertyId: string): any {
	if (value == null) return value;

	const targetProp = targetType.properties.find(p => p.id === targetPropertyId);
	if (!targetProp) return value;

	const stringTypes = ["String", "LongString", "XhtmlString", "text", "textarea", "richtext", "Url"];
	if (stringTypes.includes(targetProp.type) && typeof value === "object" && !Array.isArray(value)) {
		return extractText(value);
	}

	return value;
}

/** Recursively extract plain text from a ProseMirror/TipTap document or simple wrapper */
function extractText(val: any): string {
	if (val == null) return "";
	if (typeof val === "string") return val;
	if (typeof val !== "object") return String(val);
	// ProseMirror text node: {type: "text", text: "..."}
	if (val.type === "text" && typeof val.text === "string") return val.text;
	// Node with children: {type: "doc"|"paragraph"|..., content: [...]}
	if (Array.isArray(val.content)) {
		const separator = val.type === "doc" ? "\n\n" : "";
		return val.content.map((node: any) => extractText(node)).join(separator);
	}
	// Simple wrappers
	if (typeof val.content === "string") return val.content;
	if (typeof val.value === "string") return val.value;
	if (typeof val.text === "string") return val.text;
	return "";
}

/**
 * Apply transformation based on type
 */
function applyTransformation(
	sourceValue: any,
	mapping: PropertyMapping,
	allSourceData: Record<string, any>,
	sourceType?: ContentType
): any {
	switch (mapping.transformation) {
		case "direct":
			return sourceValue;

		case "concat":
			const fields = mapping.transformationConfig?.sourcePropertyIds || [];
			const separator = mapping.transformationConfig?.separator || " ";
			// Convert property IDs to names for data lookup
			return fields.map(id => {
				const prop = sourceType?.properties.find(p => p.id === id);
				const key = prop?.name || id;
				return allSourceData[key] || "";
			}).filter(Boolean).join(separator);

		case "default":
			return sourceValue || mapping.transformationConfig?.defaultValue;

		default:
			return sourceValue;
	}
}

/**
 * Validate that a mapping is compatible with source and target types
 */
export function validateMapping(
	mapping: ContentTypeMapping,
	sourceType: ContentType,
	targetType: ContentType
): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	for (const propMapping of mapping.propertyMappings) {
		const sourceProp = sourceType.properties.find(
			p => p.id === propMapping.sourcePropertyId
		);
		const targetProp = targetType.properties.find(
			p => p.id === propMapping.targetPropertyId
		);

		if (!sourceProp) {
			errors.push(`Source property ${propMapping.sourcePropertyId} not found`);
		}
		if (!targetProp) {
			errors.push(`Target property ${propMapping.targetPropertyId} not found`);
		}

		// Type compatibility check
		if (sourceProp && targetProp) {
			if (!areTypesCompatible(sourceProp.type, targetProp.type)) {
				errors.push(
					`Incompatible types: ${sourceProp.name} (${sourceProp.type}) → ${targetProp.name} (${targetProp.type})`
				);
			}
		}
	}

	return { valid: errors.length === 0, errors };
}

/**
 * Check if two property types are compatible for mapping
 */
export function areTypesCompatible(
	sourceType: PropertyType,
	targetType: PropertyType
): boolean {
	// Same type is always compatible
	if (sourceType === targetType) return true;

	// String types are compatible with each other
	const stringTypes: PropertyType[] = [
		"String",
		"LongString",
		"XhtmlString",
		"text",
		"textarea",
		"richtext",
	];
	if (stringTypes.includes(sourceType) && stringTypes.includes(targetType)) {
		return true;
	}

	// Number types are compatible
	const numberTypes: PropertyType[] = ["Int", "Double"];
	if (numberTypes.includes(sourceType) && numberTypes.includes(targetType)) {
		return true;
	}

	// Boolean types
	const booleanTypes: PropertyType[] = ["Boolean", "checkbox"];
	if (booleanTypes.includes(sourceType) && booleanTypes.includes(targetType)) {
		return true;
	}

	// Reference types are somewhat compatible
	const referenceTypes: PropertyType[] = [
		"ContentReference",
		"PageReference",
		"ImageReference",
		"VideoReference",
		"reference",
	];
	if (referenceTypes.includes(sourceType) && referenceTypes.includes(targetType)) {
		return true;
	}

	return false;
}

/**
 * Generate suggested mappings based on property name/type similarity
 */
export function generateSuggestedMapping(
	sourceType: ContentType,
	targetType: ContentType
): PropertyMapping[] {
	const suggestions: PropertyMapping[] = [];

	for (const sourceProp of sourceType.properties) {
		// Try exact name match first
		let targetProp = targetType.properties.find(
			p => p.name.toLowerCase() === sourceProp.name.toLowerCase()
		);

		// Try displayName match
		if (!targetProp && sourceProp.displayName) {
			targetProp = targetType.properties.find(
				p =>
					p.displayName?.toLowerCase() === sourceProp.displayName?.toLowerCase()
			);
		}

		// Try similar name (fuzzy match)
		if (!targetProp) {
			targetProp = targetType.properties.find(
				p =>
					areSimilarNames(sourceProp.name, p.name) &&
					areTypesCompatible(sourceProp.type, p.type)
			);
		}

		if (targetProp && areTypesCompatible(sourceProp.type, targetProp.type)) {
			suggestions.push({
				id: `mapping-${sourceProp.id}-${targetProp.id}`,
				sourcePropertyId: sourceProp.id,
				targetPropertyId: targetProp.id,
				transformation: "direct",
				required: sourceProp.required || targetProp.required,
			});
		}
	}

	return suggestions;
}

/**
 * Check if two property names are similar
 */
function areSimilarNames(name1: string, name2: string): boolean {
	const n1 = name1.toLowerCase().replace(/[_-]/g, "");
	const n2 = name2.toLowerCase().replace(/[_-]/g, "");
	return n1.includes(n2) || n2.includes(n1);
}

/**
 * Find all content types that have mappings targeting the specified content type.
 * This enables "incoming mapping" visibility - seeing which types can map TO this type.
 *
 * @param targetTypeId - The content type ID to find incoming mappings for
 * @param contentTypes - Array of all content types to search through
 * @returns Array of objects containing the mapping and its source content type
 *
 * @example
 * const incoming = findIncomingMappings("cms-blog-post", allContentTypes);
 * // Returns: [{ mapping: {...}, sourceType: CMPBlogPost }]
 */
export function findIncomingMappings(
	targetTypeId: string,
	contentTypes: ContentType[]
): Array<{
	mapping: ContentTypeMapping;
	sourceType: ContentType;
}> {
	const incoming: Array<{ mapping: ContentTypeMapping; sourceType: ContentType }> = [];

	for (const sourceType of contentTypes) {
		if (!sourceType.mappings) continue;

		for (const mapping of sourceType.mappings) {
			if (mapping.targetContentTypeId === targetTypeId) {
				incoming.push({ mapping, sourceType });
			}
		}
	}

	// Sort by source type display name for consistent ordering
	return incoming.sort((a, b) => {
		const nameA = a.sourceType.displayName || a.sourceType.name;
		const nameB = b.sourceType.displayName || b.sourceType.name;
		return nameA.localeCompare(nameB);
	});
}

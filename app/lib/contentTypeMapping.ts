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
	const result: Record<string, any> = {};

	for (const propMapping of mapping.propertyMappings) {
		const sourceValue = sourceData[propMapping.sourcePropertyId];
		const transformedValue = applyTransformation(
			sourceValue,
			propMapping,
			sourceData
		);
		result[propMapping.targetPropertyId] = transformedValue;
	}

	return result;
}

/**
 * Apply transformation based on type
 */
function applyTransformation(
	sourceValue: any,
	mapping: PropertyMapping,
	allSourceData: Record<string, any>
): any {
	switch (mapping.transformation) {
		case "direct":
			return sourceValue;

		case "concat":
			const fields = mapping.transformationConfig?.sourcePropertyIds || [];
			const separator = mapping.transformationConfig?.separator || " ";
			return fields.map(id => allSourceData[id] || "").filter(Boolean).join(separator);

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

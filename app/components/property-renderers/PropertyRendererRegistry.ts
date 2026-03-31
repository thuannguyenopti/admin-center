import { Property, PropertyType } from "@/app/db/initialData";
import {
	PropertyRendererRegistryEntry,
	PropertyRendererComponent,
	PropertyRendererContext,
} from "./types";

// Registry of property type → renderer mappings
// Will be populated as renderers are created
const registry: PropertyRendererRegistryEntry[] = [];

/**
 * Get the appropriate renderer component for a property
 */
export function getRendererForProperty(
	property: Property,
	context?: PropertyRendererContext
): PropertyRendererComponent | null {
	// Try each registry entry in order
	for (const entry of registry) {
		// Check if type matches
		const types = Array.isArray(entry.type) ? entry.type : [entry.type];
		if (!types.includes(property.type)) continue;

		// Check custom matcher if provided
		if (entry.matcher && !entry.matcher(property, context)) continue;

		// Found a match
		return entry.component;
	}

	return null;
}

/**
 * Register a custom renderer (for extensibility)
 */
export function registerPropertyRenderer(entry: PropertyRendererRegistryEntry) {
	// Insert at beginning to allow overrides
	registry.unshift(entry);
}

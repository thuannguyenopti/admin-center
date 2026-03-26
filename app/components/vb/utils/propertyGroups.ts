import { Property } from "@/app/db/initialData";

export type PropertyGroup = {
	name: string;
	properties: Property[];
};

/**
 * Groups properties by their groupName, with "Content" as default fallback.
 * Filters out outline properties (handled separately in the outline tree).
 * Sorts properties within each group by their order field.
 */
export function groupPropertiesByGroup(
	properties: Property[],
	includeOutline: boolean = false
): Record<string, Property[]> {
	const groups: Record<string, Property[]> = {};

	// Filter out outline properties unless explicitly included
	const filteredProps = includeOutline
		? properties
		: properties.filter((p) => p.type !== "outline");

	filteredProps.forEach((prop) => {
		// Use "Content" as fallback group for properties without groupName
		const groupName = prop.groupName || "Content";

		if (!prop.groupName && process.env.NODE_ENV === "development") {
			console.warn(
				`Property ${prop.id} (${prop.name}) has no groupName, placing in "Content" group`
			);
		}

		if (!groups[groupName]) {
			groups[groupName] = [];
		}
		groups[groupName].push(prop);
	});

	// Sort properties within each group by order
	Object.keys(groups).forEach((groupName) => {
		groups[groupName].sort((a, b) => (a.order || 0) - (b.order || 0));
	});

	return groups;
}

/**
 * Determines whether to show group headers based on the number of groups.
 * Only shows headers when viewing all groups AND there's more than one group.
 */
export function shouldShowGroupHeaders(
	totalGroups: number,
	viewingAll: boolean = true
): boolean {
	return viewingAll && totalGroups > 1;
}

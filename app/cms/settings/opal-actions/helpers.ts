import {
	OpalConfiguration,
	LocationMenu,
	MenuGroup,
	LocationId,
	PropertyType,
} from "./types";
import {createEmptyLocation} from "./migration";

// Get a specific location menu from configuration
export function getLocationMenu(
	config: OpalConfiguration,
	locationId: LocationId
): LocationMenu {
	const location = config.locations.find((l) => l.id === locationId);
	return location || createEmptyLocation(locationId);
}

// Check if a user role can view content based on visibleAt setting
export function canView(
	visibleAt: "Everyone" | "Editors" | "Administrators",
	userRole?: "Everyone" | "Editors" | "Administrators"
): boolean {
	if (!userRole) return true; // If no role specified, allow all

	const roleHierarchy = {
		Everyone: 0,
		Editors: 1,
		Administrators: 2,
	};

	return roleHierarchy[userRole] >= roleHierarchy[visibleAt];
}

// Get enabled groups from a location menu, optionally filtered by user role
export function getEnabledGroups(
	menu: LocationMenu,
	userRole?: "Everyone" | "Editors" | "Administrators"
): MenuGroup[] {
	if (!menu.enabled) return [];

	return menu.groups
		.filter((g) => g.enabled)
		.filter((g) => (userRole ? canView(g.visibleAt, userRole) : true))
		.sort((a, b) => a.order - b.order);
}

// Get all agents used in a location (for duplicate detection)
export function getUsedAgentsInLocation(menu: LocationMenu): Set<string> {
	const usedAgents = new Set<string>();
	menu.groups.forEach((group) => {
		group.agents.forEach((agent) => {
			const agentId = typeof agent === "string" ? agent : agent.id;
			usedAgents.add(agentId);
		});
	});
	return usedAgents;
}

// Check if an agent is already used in a location
export function isAgentUsedInLocation(
	menu: LocationMenu,
	agentId: string
): boolean {
	return getUsedAgentsInLocation(menu).has(agentId);
}

// Get groups that match a property type (for property-editor location)
export function getGroupsForPropertyType(
	menu: LocationMenu,
	propertyType: PropertyType
): MenuGroup[] {
	// If no property types configured, show for all types
	if (!menu.propertyTypes || menu.propertyTypes.length === 0) {
		return getEnabledGroups(menu);
	}

	// Check if this property type is in the configured list
	if (menu.propertyTypes.includes(propertyType)) {
		return getEnabledGroups(menu);
	}

	return [];
}

// Count total groups across all locations
export function getTotalGroupCount(config: OpalConfiguration): number {
	return config.locations.reduce((sum, loc) => sum + loc.groups.length, 0);
}

// Count total agents across all locations (with deduplication)
export function getTotalAgentCount(config: OpalConfiguration): number {
	const allAgents = new Set<string>();
	config.locations.forEach((loc) => {
		loc.groups.forEach((group) => {
			group.agents.forEach((agent) => allAgents.add(agent.id));
		});
	});
	return allAgents.size;
}

// Get stats for a specific location
export function getLocationStats(menu: LocationMenu): {
	groupCount: number;
	agentCount: number;
	enabledGroupCount: number;
} {
	const groupCount = menu.groups.length;
	const enabledGroupCount = menu.groups.filter((g) => g.enabled).length;
	const uniqueAgents = getUsedAgentsInLocation(menu);

	return {
		groupCount,
		agentCount: uniqueAgents.size,
		enabledGroupCount,
	};
}

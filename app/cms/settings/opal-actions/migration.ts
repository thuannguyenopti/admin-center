import {
	OpalAction,
	OpalConfiguration,
	LocationMenu,
	MenuGroup,
	LocationId,
} from "./types";

// Generate a simple unique ID
function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create an empty location menu
export function createEmptyLocation(locationId: LocationId): LocationMenu {
	const locationConfig: Record<LocationId, {name: string; description: string}> = {
		"toolbar-improve": {
			name: "Toolbar Improve Button",
			description: "Actions shown in the Improve dropdown button",
		},
		"toolbar-page": {
			name: "Page",
			description: "Actions shown in the page context menu",
		},
		"toolbar-context": {
			name: "Toolbar Context Menu",
			description: "Actions shown in the toolbar context menu (three dots)",
		},
		"asset-panel": {
			name: "Asset Panel",
			description: "Actions shown in the asset panel",
		},
		"outline-section": {
			name: "Section",
			description: "Actions shown in the outline section context menu",
		},
		"property-text": {
			name: "Text",
			description: "Actions shown when editing text properties",
		},
		"property-image": {
			name: "Image",
			description: "Actions shown when editing image properties",
		},
		"property-number": {
			name: "Number",
			description: "Actions shown when editing number properties",
		},
		"property-datetime": {
			name: "Date/Time",
			description: "Actions shown when editing date/time properties",
		},
		"property-reference": {
			name: "Reference",
			description: "Actions shown when editing reference properties",
		},
		"property-editor": {
			name: "Property Editor",
			description: "Actions shown when editing properties",
		},
	};

	const config = locationConfig[locationId];
	return {
		id: locationId,
		name: config.name,
		description: config.description,
		groups: [],
		enabled: true,
		propertyTypes: locationId === "property-editor" ? [] : undefined,
	};
}

// Migrate old OpalAction[] to new OpalConfiguration
export function migrateOpalActions(oldActions: OpalAction[]): OpalConfiguration {
	// Initialize all location menus
	const locations: LocationMenu[] = [
		createEmptyLocation("toolbar-improve"),
		createEmptyLocation("toolbar-page"),
		createEmptyLocation("toolbar-context"),
		createEmptyLocation("asset-panel"),
		createEmptyLocation("outline-section"),
		createEmptyLocation("property-text"),
		createEmptyLocation("property-image"),
		createEmptyLocation("property-number"),
		createEmptyLocation("property-datetime"),
		createEmptyLocation("property-reference"),
		createEmptyLocation("property-editor"),
	];

	// Track order within each location
	const orderCounters: Record<LocationId, number> = {
		"toolbar-improve": 0,
		"toolbar-page": 0,
		"toolbar-context": 0,
		"asset-panel": 0,
		"outline-section": 0,
		"property-text": 0,
		"property-image": 0,
		"property-number": 0,
		"property-datetime": 0,
		"property-reference": 0,
		"property-editor": 0,
	};

	// Convert each OpalAction into MenuGroup(s) in appropriate location(s)
	oldActions.forEach((action) => {
		// Helper to create a MenuGroup from an action
		const createGroup = (locationId: LocationId): MenuGroup => {
			const group: MenuGroup = {
				id: generateId(),
				name: action.name,
				agents: [...action.agents],
				enabled: action.enabled,
				visibleAt: action.visibleAt,
				helpText: action.helpText,
				order: orderCounters[locationId]++,
			};
			return group;
		};

		// Add to toolbar improve button location
		if (action.locations.toolbar.improveButton) {
			const location = locations.find((l) => l.id === "toolbar-improve");
			if (location) {
				location.groups.push(createGroup("toolbar-improve"));
			}
		}

		// Add to toolbar context menu location
		if (action.locations.toolbar.contextMenu) {
			const location = locations.find((l) => l.id === "toolbar-context");
			if (location) {
				location.groups.push(createGroup("toolbar-context"));
			}
		}

		// Add to asset panel location
		if (action.locations.assetPanel) {
			const location = locations.find((l) => l.id === "asset-panel");
			if (location) {
				location.groups.push(createGroup("asset-panel"));
			}
		}

		// Add to property editor location
		if (action.locations.propertyEditor.enabled) {
			const location = locations.find((l) => l.id === "property-editor");
			if (location) {
				const group = createGroup("property-editor");
				location.groups.push(group);
				// Preserve property types at location level
				if (action.locations.propertyEditor.propertyTypes.length > 0) {
					if (!location.propertyTypes) {
						location.propertyTypes = [];
					}
					// Merge property types (union)
					action.locations.propertyEditor.propertyTypes.forEach((type) => {
						if (!location.propertyTypes?.includes(type)) {
							location.propertyTypes?.push(type);
						}
					});
				}
			}
		}

	});

	// Migrate system actions (page creation)
	const systemAgents = oldActions
		.filter((action) => action.locations.pageCreation)
		.map((action) => ({
			id: action.id === "system-page-generator" ? "generate-page-with-opal" : action.id,
			name: action.name,
			description: action.helpText || "",
			enabled: action.enabled,
			category: "page-generation" as const,
		}));

	// Add default app companion features
	const appCompanion = [
		{
			id: "autocomplete",
			name: "Auto-complete",
			description: "AI-powered content suggestions as you type",
			enabled: true,
			category: "editor" as const,
		},
		{
			id: "smart-paste",
			name: "Smart Paste",
			description: "Automatically format pasted content",
			enabled: false,
			category: "editor" as const,
		},
		{
			id: "content-suggestions",
			name: "Content Suggestions",
			description: "Get AI suggestions for improving your content",
			enabled: true,
			category: "productivity" as const,
		},
		{
			id: "auto-mapping",
			name: "Auto-mapping",
			description: "Automatically map content types based on structure and usage patterns",
			enabled: false,
			category: "productivity" as const,
		},
	];

	return {
		version: 1,
		locations,
		systemAgents,
		appCompanion,
		modified: new Date().toISOString(),
	};
}

// Check if migration is needed
export function needsMigration(): boolean {
	if (typeof window === "undefined") return false;

	try {
		const hasOldConfig = localStorage.getItem("opal-actions") !== null;
		const hasNewConfig = localStorage.getItem("opal-config") !== null;

		return hasOldConfig && !hasNewConfig;
	} catch {
		return false;
	}
}

// Perform migration if needed
export function performMigrationIfNeeded(): void {
	if (!needsMigration()) return;

	try {
		const oldConfigStr = localStorage.getItem("opal-actions");
		if (!oldConfigStr) return;

		const oldActions: OpalAction[] = JSON.parse(oldConfigStr);
		const newConfig = migrateOpalActions(oldActions);

		// Save new config
		localStorage.setItem("opal-config", JSON.stringify(newConfig));

		console.log("[Opal Actions] Migrated configuration to new format");
	} catch (error) {
		console.error("[Opal Actions] Migration failed:", error);
	}
}

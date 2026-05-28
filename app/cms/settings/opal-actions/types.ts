// Opal Actions Type Definitions

// Location identifiers for different menu placements
export type LocationId =
	| "toolbar-improve"
	| "toolbar-page"
	| "toolbar-context"
	| "asset-panel"
	| "outline-section"
	| "property-text"
	| "property-image"
	| "property-number"
	| "property-datetime"
	| "property-reference"
	| "property-editor";

// Property types that can be configured for property editor location
export type PropertyType =
	| "String"
	| "LongString"
	| "XhtmlString"
	| "Int"
	| "Double"
	| "Boolean"
	| "DateTime"
	| "ContentReference"
	| "PageReference"
	| "ImageReference"
	| "VideoReference"
	| "Url"
	| "SelectOne"
	| "SelectMany"
	| "ContentArea"
	| "LinkItemCollection";

// Agent definition
export interface Agent {
	id: string;
	name: string;
	category: string;
}

// Group of agents within a location menu
export interface MenuGroup {
	id: string;
	name: string;
	agents: string[]; // Agent IDs
	enabled: boolean;
	visibleAt: "Everyone" | "Editors" | "Administrators";
	helpText?: string;
	order: number; // For drag-and-drop ordering
}

// Location menu configuration
export interface LocationMenu {
	id: LocationId;
	name: string; // Display name: "Toolbar Improve Button"
	description: string;
	groups: MenuGroup[];
	enabled: boolean;
	propertyTypes?: PropertyType[]; // For property-editor only
}

// System agent configuration (for System Agents tab)
export interface SystemAgent {
	id: string;
	name: string;
	description: string;
	enabled: boolean;
	category: "page-generation" | "workflow" | "other";
}

// Automated feature configuration (for Automated Features tab)
export interface AppCompanionFeature {
	id: string;
	name: string;
	description: string;
	enabled: boolean;
	category: "editor" | "productivity" | "other";
}

// Complete Opal configuration
export interface OpalConfiguration {
	version: number; // For migration tracking
	locations: LocationMenu[]; // Menus tab
	systemAgents: SystemAgent[]; // System Agents tab
	appCompanion: AppCompanionFeature[]; // Automated Features tab
	modified: string;
}

// Legacy OpalAction interface (for backward compatibility during migration)
export interface OpalAction {
	id: string;
	name: string;
	enabled: boolean;
	helpText?: string;
	locations: {
		toolbar: {
			contextMenu: boolean;
			improveButton: boolean;
		};
		assetPanel: boolean;
		propertyEditor: {
			enabled: boolean;
			propertyTypes: PropertyType[];
		};
		pageCreation?: boolean;
	};
	agents: string[];
	visibleAt: "Everyone" | "Editors" | "Administrators";
	modified: string;
	isSystemAction?: boolean;
}

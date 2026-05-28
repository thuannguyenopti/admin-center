import { EleMap } from "@/app/db/initialData";

export type ColumnNode = {
	id: string;
	open: boolean;
	elements: { id: string }[];
};

export type RowNode = {
	id: string;
	open: boolean;
	children: ColumnNode[];
	displayTemplateKey?: string;  // NEW: Display template system
	displaySettings?: Array<{key: string; value: string}>;  // NEW
};

export type SectionNode = {
	id: string;
	name: string;
	open: boolean;
	bgImage?: string;
	children: RowNode[];
	template?: string;  // OLD: Keep for backward compatibility during migration
	displayTemplateKey?: string;  // NEW: Display template system
	displaySettings?: Array<{key: string; value: string}>;  // NEW
};

export type OutlineState = {
	id: string;
	title: string;
	tree: SectionNode[];
	elements: EleMap;
};

export type Selection =
	| { kind: "none" }
	| { kind: "section"; sectionId: string }
	| { kind: "row"; sectionId: string; rowId: string }
	| { kind: "column"; sectionId: string; rowId: string; columnId: string }
	| { kind: "element"; sectionId: string; rowId: string; columnId: string; elementId: string };

// Display Template System (Optimizely pattern)
export type DisplayTemplateSetting = {
	displayName: string;
	editor: "select" | "checkbox";
	sortOrder: number;
	choices?: Record<string, {
		displayName: string;
		sortOrder: number;
	}>;
};

export type DisplayTemplate = {
	key: string;
	displayName: string;
	description?: string;
	baseType?: "experience" | "section" | "component";
	contentType?: string;  // e.g., "ct-heading", "ct-section"
	nodeType?: "row" | "column";
	isDefault?: boolean;
	semanticTags: string[];  // For AI natural language mapping
	defaultSettings: Record<string, string>;  // For AI default application
	settings: Record<string, DisplayTemplateSetting>;
};

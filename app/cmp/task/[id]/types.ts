export type Scene =
	| "brief"
	| "brief-edit"
	| "search"
	| "preview"
	| "content-empty"
	| "content"
	| "content-panel";

export type TaskTab = "brief" | "content";

export type AssetType = "JPG" | "PNG" | "MP4" | "PDF";

export type AssetItem = {
	id: string;
	heroSrc?: string;
	label: AssetType;
	match: number;
	metaDescription?: string;
	src: string;
	title: string;
	selected?: boolean;
	thumbnailSrc?: string;
	tooltip?: string;
	preview: "image" | "pdf";
	previewSrc?: string;
};

export type SearchAssetItem = AssetItem & {
	height: number;
	keywords: string[];
	thumbnailSrc?: string;
	width: number;
};

export type WorkflowTemplateIconKind = "calendar" | "copy" | "sparkles" | "tag" | "check";

export type WorkflowStep = {
	id: string;
	title: string;
	date?: string;
	done?: boolean;
	danger?: boolean;
	expanded?: boolean;
	assignee?: string;
	description?: string;
	checklist?: string[];
	badgeLabel?: string;
	showCalendarAction?: boolean;
};

export type WorkflowTemplate = {
	id: string;
	icon: WorkflowTemplateIconKind;
	name: string;
	subtitle?: string;
	steps: WorkflowStep[];
};

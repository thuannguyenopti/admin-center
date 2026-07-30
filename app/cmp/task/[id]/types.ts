export type Scene =
	| "brief"
	| "brief-edit"
	| "search"
	| "preview"
	| "content-empty"
	| "content"
	| "content-panel"
	| "publishing";

export type TaskTab = "brief" | "content" | "fields" | "publishing" | "related" | "financial" | "history";

export type AssetType = "JPG" | "PNG" | "MP4" | "PDF";

export type AssetItem = {
	id: string;
	label: AssetType;
	match: number;
	metaDescription?: string;
	heroSrc?: string;
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

export type TaskArticle = {
	id: string;
	title: string;
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

export type PublishingChannel = {
	id: string;
	channelTypeId: string;
	selectedContentIds: string[];
};

export type BriefWizardInputs = {
	coreMessage: string;
	valueProposition: string;
	targetAudience: string;
	metric: "awareness" | "conversion" | "retention" | "education";
	selectedChannels: string[];
	attachments: File[];
	imageGuidelines?: string;
};

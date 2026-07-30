import { VAUS, type VAU } from "@/app/opal/data/vaus";

export type VTActivityStatus =
	| "idle"
	| "analyzing"
	| "optimizing"
	| "complete"
	| "error";

export type VTChange = {
	field: string;
	oldValue: string;
	newValue: string;
	undone?: boolean;
};

export type VTActivity = {
	id: string;
	vtId: string;
	vtName: string;
	vtAvatar: string;
	vtAvatarBg: string;
	vtTemplateName: string;
	pageId: string;
	pageName: string;
	status: VTActivityStatus;
	operation: string;
	startedAt: string;
	completedAt?: string;
	changes?: VTChange[];
};

export type ChangeLogEntry = {
	id: string;
	timestamp: string;
	user: string;
	userAvatar?: string;
	isVT: boolean;
	vtTemplateName?: string;
	action: string;
	target: string;
	targetPath: string;
	status: "completed" | "in-progress" | "failed";
	details?: string;
	changes?: VTChange[];
};

export function getCMSVirtualTeammates(): VAU[] {
	return VAUS.filter((v) => v.tools.includes("opti-cms"));
}

export const MOCK_SEO_CHANGES: VTChange[] = [
	{
		field: "Meta Title",
		oldValue: "Running Shoes - Buy Online",
		newValue: "Best Running Shoes 2026 | Lightweight & Durable | Free Shipping",
	},
	{
		field: "Meta Description",
		oldValue: "Shop our collection of running shoes.",
		newValue:
			"Discover top-rated running shoes for every terrain. Lightweight cushioning, durable soles & free returns. Shop the 2026 collection now.",
	},
	{
		field: "H1 Heading",
		oldValue: "Running Shoes",
		newValue: "Running Shoes for Every Runner",
	},
	{
		field: "Image Alt Text",
		oldValue: "shoes.jpg",
		newValue: "Lightweight trail running shoes in forest green on rocky terrain",
	},
];

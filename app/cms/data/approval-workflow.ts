import type { VTChange } from "./vt-activity";

export type ApprovalReviewerStatus =
	| "queued"
	| "reviewing"
	| "complete"
	| "error";

export type ApprovalReviewer = {
	vtId: string;
	vtName: string;
	vtAvatar: string;
	vtAvatarBg: string;
	vtTemplateName: string;
	role: string;
	status: ApprovalReviewerStatus;
	startedAt?: string;
	completedAt?: string;
};

export type ApprovalRequestStatus =
	| "pending"
	| "approved"
	| "declined"
	| "withdrawn";

export type ApprovalRequest = {
	id: string;
	status: ApprovalRequestStatus;
	scheduledAt: string | null;
	requestedAt: string;
	reviewers: ApprovalReviewer[];
};

export const DEFAULT_REVIEWERS: Omit<
	ApprovalReviewer,
	"status" | "startedAt" | "completedAt"
>[] = [
	{
		vtId: "frank",
		vtName: "Frank",
		vtAvatar: "/avatars/vau-frank.png",
		vtAvatarBg: "#E8F0FA",
		vtTemplateName: "SEO Expert",
		role: "SEO Review",
	},
	{
		vtId: "henry",
		vtName: "Henry",
		vtAvatar: "/avatars/vau-henry.png",
		vtAvatarBg: "#FAF6E8",
		vtTemplateName: "Brand Expert",
		role: "Brand Review",
	},
	{
		vtId: "lena",
		vtName: "Lena",
		vtAvatar: "/avatars/vau-poppy.png",
		vtAvatarBg: "#F0E8FA",
		vtTemplateName: "Legal Expert",
		role: "Legal Review",
	},
];

export const MOCK_BRAND_CHANGES: VTChange[] = [
	{
		field: "Page Headline",
		oldValue: "Running Shoes - Buy Online",
		newValue: "Run Further. Run Faster. Run Free.",
	},
	{
		field: "CTA Button Text",
		oldValue: "Buy Now",
		newValue: "Shop the Collection",
	},
	{
		field: "Hero Subtitle",
		oldValue: "Great running shoes for sale",
		newValue:
			"Performance footwear engineered for every stride — from first mile to finish line.",
	},
];

export const MOCK_LEGAL_CHANGES: VTChange[] = [
	{
		field: "Footer Disclaimer",
		oldValue: "",
		newValue:
			"Free shipping on orders over $75. Returns accepted within 30 days of purchase. See full terms.",
	},
	{
		field: "Product Claim",
		oldValue: "The best running shoes on the market",
		newValue: "Award-winning running shoes rated #1 by Runner's World 2026",
	},
];

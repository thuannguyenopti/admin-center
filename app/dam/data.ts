// Shared types + mock data for the DAM Workflow & Drop Zone prototype.
// No backend in this prototype — every "OPAL analysis" below is static.

import type { OpalFlag } from "@/app/shared/types/opal";

export type { OpalFlag };
export type OpalStatus = "cleared" | "flagged" | "rejected" | "pending";
export type AssetType = "image" | "video" | "document" | "pdf";
export type Intent = "success" | "warning" | "danger" | "neutral";

export interface AssetItem {
	id: string;
	name: string;
	type: AssetType;
	thumbnail?: string;
	thumbBg?: string;
	submitter: string;
	submittedAt: string;
	source: "direct" | "dropzone";
	dropZoneBrief?: string;
	opalStatus: OpalStatus;
	confidence: number;
	opalFlags: OpalFlag[];
	opalSuggestions: string[];
	opalClearances: string[];
	opalReasoning: string;
	opalDraftFeedback: string;
	brandScore: number;
	duplicateRisk: "none" | "low" | "medium" | "high";
	metadataScore: number;
	campaign?: string;
	size: string;
}

export const QUEUE: AssetItem[] = [
	{
		id: "a1",
		name: "Stride_Summer_Campaign_Hero.jpg",
		type: "image",
		thumbnail: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=85",
		submitter: "Maya Chen",
		submittedAt: "2 min ago",
		source: "dropzone",
		dropZoneBrief: "Summer 2026 Athlete Campaign",
		opalStatus: "cleared",
		confidence: 94,
		opalFlags: [],
		opalSuggestions: [],
		opalClearances: ["Brand colours match", "No prohibited elements", "Metadata complete", "No duplicates found"],
		opalReasoning: "Asset passes all brand compliance checks. Colour palette aligns with Stride guidelines. No duplicate detected in library.",
		opalDraftFeedback: "",
		brandScore: 96,
		duplicateRisk: "none",
		metadataScore: 100,
		campaign: "Summer 2026",
		size: "4.2 MB",
	},
	{
		id: "a2",
		name: "Stride_Athlete_Portrait_v3.jpg",
		type: "image",
		thumbnail: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=85",
		submitter: "Ritu Patel",
		submittedAt: "18 min ago",
		source: "dropzone",
		dropZoneBrief: "Summer 2026 Athlete Campaign",
		opalStatus: "flagged",
		confidence: 61,
		opalFlags: [
			{ severity: "high",   category: "Brand Colour", detail: "Background uses #F5F5F5 — not in the approved Stride palette. Must be white or Stride Green." },
			{ severity: "medium", category: "Logo Usage",   detail: "Stride wordmark at 80% opacity — brand guidelines require 100%." },
		],
		opalSuggestions: [
			"Replace background with an approved Stride palette colour — white (#FFFFFF) or Stride Green.",
			"Resubmit with the Stride wordmark at 100% opacity per brand guidelines §4.1.",
		],
		opalClearances: ["No duplicates found", "File resolution sufficient"],
		opalReasoning: "Two brand violations detected. Background colour deviation is high-severity — all athlete portraits must use approved palette backgrounds.",
		opalDraftFeedback: `Hi Ritu — OPAL flagged 2 issues with Stride_Athlete_Portrait_v3.jpg:

1. Background colour (#F5F5F5) is outside the approved Stride palette. Please use white (#FFFFFF) or Stride Green.
2. Stride wordmark must be at 100% opacity (currently 80%) per brand guidelines §4.1.

Please resubmit when these are resolved. — Optimizely DAM`,
		brandScore: 61,
		duplicateRisk: "low",
		metadataScore: 80,
		campaign: "Summer 2026",
		size: "3.8 MB",
	},
	{
		id: "a3",
		name: "Q3_Campaign_Brief_FINAL.pdf",
		type: "pdf",
		thumbBg: "#7c3aed",
		submitter: "Jake Torres",
		submittedAt: "34 min ago",
		source: "direct",
		opalStatus: "cleared",
		confidence: 88,
		opalFlags: [],
		opalSuggestions: [],
		opalClearances: ["Document classification: Campaign Brief", "No rights conflicts", "Metadata complete"],
		opalReasoning: "Document correctly classified as internal campaign brief. No usage rights conflicts. Metadata complete.",
		opalDraftFeedback: "",
		brandScore: 88,
		duplicateRisk: "none",
		metadataScore: 95,
		campaign: "Q3 2026",
		size: "1.1 MB",
	},
	{
		id: "a4",
		name: "Stride_Social_Pack_Instagram.zip",
		type: "document",
		thumbBg: "#0369a1",
		submitter: "External: Vero Studio",
		submittedAt: "1 hr ago",
		source: "dropzone",
		dropZoneBrief: "Social Media Assets — Q3",
		opalStatus: "flagged",
		confidence: 43,
		opalFlags: [
			{ severity: "high",   category: "Duplicate Risk",      detail: "Instagram_Post_02.jpg inside the archive is a 94% visual match to an existing library asset." },
			{ severity: "medium", category: "Missing Metadata",    detail: "Usage rights declaration absent for 3 of 8 assets in the archive." },
			{ severity: "low",    category: "Campaign Fit",        detail: "2 assets appear off-brief for the Q3 moodboard context." },
		],
		opalSuggestions: [
			"Remove or replace Instagram_Post_02.jpg — it duplicates an existing library asset at 94% similarity.",
			"Add usage rights declarations for all 8 assets before resubmission (required for external agency work).",
			"Review assets 4 and 7 against the Q3 moodboard brief before including them.",
		],
		opalClearances: ["No prohibited content detected", "File formats valid"],
		opalReasoning: "Archive contains a likely duplicate and is missing required rights metadata for external agency submissions.",
		opalDraftFeedback: `Hi Vero Studio — OPAL flagged 3 issues with Stride_Social_Pack_Instagram.zip:

1. Instagram_Post_02.jpg is a near-duplicate (94% match) of an existing library asset. Please remove or replace it.
2. Usage rights declarations are missing for 3 of 8 assets. All agency-submitted assets require rights documentation.
3. Assets 4 and 7 appear off-brief for the Q3 moodboard. Please review against the brief before resubmitting.

Please resubmit a corrected archive. — Optimizely DAM`,
		brandScore: 72,
		duplicateRisk: "high",
		metadataScore: 62,
		campaign: "Q3 Social",
		size: "28.4 MB",
	},
	{
		id: "a5",
		name: "Stride_Logo_Misuse_Example.png",
		type: "image",
		thumbBg: "#374151",
		submitter: "Sam Willis",
		submittedAt: "2 hr ago",
		source: "direct",
		opalStatus: "rejected",
		confidence: 12,
		opalFlags: [
			{ severity: "high", category: "Logo Violation",  detail: "Logo placed on busy photographic background — prohibited by brand guidelines §3.2." },
			{ severity: "high", category: "Colour Violation", detail: "Logo rendered in #FF4500 — only Green, White, or Black variants permitted." },
			{ severity: "high", category: "Exact Duplicate",  detail: "Matches Stride_Do_Not_Use_Sample.png (lib-0042) — a flagged prohibited example." },
		],
		opalSuggestions: [
			"This asset reproduces a known prohibited logo usage example and cannot be approved. It must be rejected.",
		],
		opalClearances: [],
		opalReasoning: "Three high-severity violations. This asset reproduces known prohibited logo usage from the brand violations sample library.",
		opalDraftFeedback: `Hi Sam — OPAL has identified 3 critical violations in Stride_Logo_Misuse_Example.png. This asset cannot be approved and has been rejected:

1. Logo placement on photographic background is prohibited (§3.2).
2. Logo colour #FF4500 is not an approved variant.
3. This file matches a known prohibited-use sample in the brand library.

If you believe this is an error, please contact the brand team. — Optimizely DAM`,
		brandScore: 8,
		duplicateRisk: "high",
		metadataScore: 40,
		size: "512 KB",
	},
	{
		id: "a6",
		name: "Stride_Race_Day_Video_Teaser.mp4",
		type: "video",
		thumbnail: "https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=900&q=85",
		submitter: "Priya Nair",
		submittedAt: "3 hr ago",
		source: "dropzone",
		dropZoneBrief: "Race Day Content — Autumn Series",
		opalStatus: "cleared",
		confidence: 79,
		opalFlags: [
			{ severity: "low", category: "Metadata", detail: "Alt text not provided — required for accessibility compliance." },
		],
		opalSuggestions: [
			"Add alt text to the video before publishing to meet accessibility requirements.",
		],
		opalClearances: ["No brand violations", "Music rights verified", "No duplicate footage"],
		opalReasoning: "Video passes brand review. Missing alt text is low-severity and can be resolved post-approval.",
		opalDraftFeedback: "",
		brandScore: 82,
		duplicateRisk: "none",
		metadataScore: 72,
		campaign: "Autumn Series",
		size: "142 MB",
	},
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function scoreIntent(v: number): "success" | "warning" | "danger" {
	return v >= 80 ? "success" : v >= 50 ? "warning" : "danger";
}

export function statusIntent(s: OpalStatus): Intent {
	return ({ cleared: "success", flagged: "warning", rejected: "danger", pending: "neutral" } as const)[s] ?? "neutral";
}

export function statusLabel(s: OpalStatus) {
	return ({ cleared: "Cleared", flagged: "Flagged", rejected: "Rejected", pending: "Screening" })[s];
}

export function canApprove(item: AssetItem) {
	return item.opalStatus !== "rejected" && item.opalStatus !== "flagged";
}

/** Highest-severity flag drives sort priority in the queue overview. */
export function riskRank(item: AssetItem): number {
	if (item.opalFlags.some((f) => f.severity === "high")) return 3;
	if (item.opalFlags.some((f) => f.severity === "medium")) return 2;
	if (item.opalFlags.length > 0) return 1;
	return 0;
}

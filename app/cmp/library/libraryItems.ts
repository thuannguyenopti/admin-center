// Persistent store for CMP Library items — same shape as
// app/dam/drop-zone/dropZones.ts (plain module singleton, localStorage-backed,
// subscribe/notify for useSyncExternalStore). Moved out of page.tsx, where it was
// previously a static array nothing ever mutated, so approving a Drop Zone
// submission (see DropZoneDetailView.tsx) can actually create a real Review Queue
// item instead of a dead end.

import type { OpalDuplicateMatch, OpalFlag } from "@/app/shared/types/opal";
import type { PendingVersionDetail } from "@/app/dam/versions/data";

export type AssetLabel = "JPG" | "Word" | "Folder" | "File" | "PDF" | "MSG" | "ZIP" | "PNG" | "Structured Content" | "Article" | "TIFF";
export type AssetKind = "folder" | "image" | "document" | "file" | "structured";

export type LibraryItem = {
	id: string;
	title: string;
	label: AssetLabel;
	type: AssetKind;
	image?: string;
	icon?: "file" | "folder";
	expired?: boolean;
	bgColor?: string;
	/** OPAL governance status — drives the Waiting Room filter and the detail panel's OPAL Review section. Assets with no status are treated as already cleared. */
	opalStatus?: "cleared" | "flagged" | "pending" | "processing";
	/** Brand compliance score, 0-100 — how well the asset matches brand guidelines. Drives severity color. */
	opalConfidence?: number;
	/** How sure OPAL is in its own assessment — a separate axis from the compliance score above. */
	opalConfidenceLevel?: "high" | "medium" | "low";
	opalFlags?: OpalFlag[];
	/** General submission metadata for the Waiting Room queue — distinct from pendingVersion's submitter/submittedAt, which is scoped to the versioning flow. */
	submittedBy?: string;
	submittedAt?: string;
	/** Set when OPAL finds a visual match against an existing library asset — renders a side-by-side comparison in place of the marker-annotated preview. */
	duplicateOf?: OpalDuplicateMatch;
	/** Set when a revised version is awaiting approval (Pillar 3 — Edit Submission & Versioning). */
	pendingVersion?: PendingVersionDetail;
};

const INITIAL_LIBRARY_ITEMS: LibraryItem[] = [
	{
		id: "item-1",
		title: "Stride_Morning_Run.jpg",
		label: "JPG",
		type: "image",
		image: "https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=900&q=80",
		expired: true,
		opalStatus: "pending",
		opalConfidence: 58,
		opalConfidenceLevel: "medium",
		submittedBy: "Maya Chen",
		submittedAt: "40 min ago",
		pendingVersion: {
			versionLabel: "v2 — race-day angle + logo reposition",
			submitter: "Maya Chen",
			submittedAt: "40 min ago",
			pendingImage: "/brand-packs/templates/tdf-cyclist-road-wide.png",
			whatChanged: "Swapped the hero shot for the new race-day aerial angle the brand team asked for, and moved the logo to the bottom-right corner so it's clear of the rider.",
			reviewDeadline: "End of day Friday",
			confidence: 58,
			changesSummary: [
				{ type: "modified", detail: "Hero photograph replaced with an aerial race-day forest-road angle." },
				{ type: "modified", detail: "Logo lockup moved from top-left to bottom-right." },
				{ type: "added", detail: "Subtle vignette added behind the logo for contrast." },
			],
			brandRegressions: [
				{
					severity: "medium",
					category: "Brand Regression",
					detail: "The repositioned logo now sits directly over the rider's shoulder — v1 had clear space above the treeline.",
					fix: "Nudge the logo up into the open sky area, or crop tighter to exclude that corner.",
					marker: { x: 29, y: 61 },
				},
			],
			discrepancy: "Maya's note says the logo is now clear of the rider — OPAL detected it overlapping the shoulder instead.",
			recommendation: "flag",
			clearances: ["Colour palette still within approved Stride range", "Usage rights unchanged from v1"],
			reasoning: "The aerial race-day angle is a strong improvement in energy and storytelling. The logo reposition introduces a placement conflict that v1 didn't have. Net assessment is mixed — recommend a quick nudge before this replaces the live asset.",
			approveNote: "v2 approved. Aerial race-day angle replaces v1; logo repositioned bottom-right. Approver confirmed the shoulder overlap is acceptable at published crop widths.",
			changesDraft: "Hi Maya — OPAL flagged one issue with v2 of Stride_Morning_Run.jpg:\n\nThe bottom-right logo placement overlaps the rider's shoulder at common crop widths. Please nudge the logo or adjust the crop so it sits in clear space, the way v1 did.\n\nPlease resubmit when this is resolved. — Optimizely DAM",
			rejectDraft: "Hi Maya — v2 of Stride_Morning_Run.jpg has been rejected:\n\nThe logo placement overlaps the rider's shoulder, which is a brand guideline violation. This needs to be corrected before the revision can replace the live asset.\n\n— Optimizely DAM",
		},
	},
	{
		id: "item-2",
		title: "Stride_Brand_Guidelines.jpg",
		label: "JPG",
		type: "image",
		image: "/brand-packs/templates/tdf-stride-race-sq.png",
		opalStatus: "flagged",
		opalConfidence: 61,
		opalConfidenceLevel: "high",
		submittedBy: "Jordan Lee",
		submittedAt: "2 hours ago",
		opalFlags: [
			{
				severity: "high",
				category: "Brand Colour",
				detail: "Background yellow measures #FFC700 — 5% off the approved Stride Yellow (#FFD200) used across the Tour de France 2026 pack.",
				fix: "Resample the background from the approved Stride Yellow swatch in Brand Setup.",
				marker: { x: 88, y: 90 },
			},
			{
				severity: "medium",
				category: "Logo Usage",
				detail: "STRIDE lockup sits 8px from the frame edge — below the 16px minimum clearspace.",
				fix: "Increase the margin around the lockup to at least 16px on all sides.",
				marker: { x: 20, y: 12 },
			},
		],
	},
	{
		id: "item-1c",
		title: "Stride_Finish_Line_Sprint.jpg",
		label: "JPG",
		type: "image",
		image: "/brand-packs/templates/tdf-cyclist-mountain-sq.png",
		opalStatus: "processing",
		submittedBy: "Aisha Patel",
		submittedAt: "12 min ago",
	},
	{
		id: "item-1d",
		title: "Stride_Race_Day_Photos_v2.jpg",
		label: "JPG",
		type: "image",
		image: "/brand-packs/templates/tdf-finish-port.png",
		opalStatus: "flagged",
		opalConfidence: 64,
		opalConfidenceLevel: "high",
		submittedBy: "Priya Nair",
		submittedAt: "25 min ago",
		opalFlags: [
			{
				severity: "medium",
				category: "Duplicate Risk",
				detail: "94% visual match to Stride_Do_Not_Use_Sample.png (lib-0042), already in the library.",
				fix: "Confirm this is a genuinely new asset before approving, or reject in favor of the existing file.",
			},
		],
		duplicateOf: {
			assetId: "lib-0042",
			title: "Stride_Do_Not_Use_Sample.png",
			image: "/brand-packs/templates/tdf-finish-port.png",
			submittedBy: "Library seed data",
			submittedAt: "8 months ago",
			matchPct: 94,
		},
	},
	{
		id: "item-1e",
		title: "Stride_Trailhead_Signage.jpg",
		label: "JPG",
		type: "image",
		image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80",
		opalStatus: "cleared",
		opalConfidence: 96,
		opalConfidenceLevel: "high",
		submittedBy: "Jordan Lee",
		submittedAt: "1 hour ago",
	},
	{
		id: "item-3",
		title: "Campaign Planning",
		label: "Folder",
		type: "folder",
	},
	{
		id: "item-4",
		title: "Social Media Assets",
		label: "Folder",
		type: "folder",
	},
	{
		id: "item-5",
		title: "Stride_Athlete_Enrollment.docx",
		label: "Word",
		type: "document",
		bgColor: "#7B61FF",
	},
	{
		id: "item-6",
		title: "Training_Schedule.docx",
		label: "Word",
		type: "document",
		bgColor: "#7B61FF",
	},
	{
		id: "item-7",
		title: "Stride_Q1_Report.pdf",
		label: "File",
		type: "file",
		bgColor: "#7B61FF",
	},
	{
		id: "item-8",
		title: "Brand_Strategy.pdf",
		label: "PDF",
		type: "document",
		bgColor: "#D97706",
	},
	{
		id: "item-9",
		title: "Campaign_Brief.msg",
		label: "MSG",
		type: "file",
		bgColor: "#64748B",
	},
	{
		id: "item-10",
		title: "Stride_Assets.zip",
		label: "ZIP",
		type: "file",
		bgColor: "#6B7280",
	},
	{
		id: "item-11",
		title: "Stride_Logo.png",
		label: "PNG",
		type: "image",
		image: "/brand-packs/templates/tdf-engineered-wide.png",
		bgColor: "#10B981",
	},
	{
		id: "item-12",
		title: "Stride social content layout",
		label: "Structured Content",
		type: "image",
		image: "/brand-packs/templates/tdf-race-register-port.png",
		bgColor: "#3B82F6",
	},
	{
		id: "item-13",
		title: "Stride_Lake_Swim_Training.jpg",
		label: "Article",
		type: "image",
		image: "/brand-packs/templates/tdf-stride-race-sq.png",
		bgColor: "#3B82F6",
	},
	{
		id: "item-14",
		title: "Stride_Championship.jpg",
		label: "Structured Content",
		type: "image",
		image: "/brand-packs/templates/tdf-finish-port.png",
		bgColor: "#3B82F6",
		expired: true,
	},
	{
		id: "item-15",
		title: "Stride_Bike_Race.tiff",
		label: "TIFF",
		type: "image",
		image: "/brand-packs/templates/tdf-cyclist-road-wide.png",
		bgColor: "#10B981",
	},
	{
		id: "item-16",
		title: "Stride_Open_Water.jpg",
		label: "Folder",
		type: "folder",
	},
	{
		id: "item-17",
		title: "Race_Day_Photos.jpg",
		label: "JPG",
		type: "image",
		image: "/brand-packs/templates/tdf-finish-port.png",
		pendingVersion: {
			versionLabel: "v2 — tighter crop + warmer color grade",
			submitter: "Priya Nair",
			submittedAt: "3 hours ago",
			pendingImage: "/brand-packs/templates/tdf-finish-port.png",
			whatChanged: "Cropped tighter on the lead pack and warmed up the color grade to match the Autumn Series campaign look.",
			confidence: 91,
			changesSummary: [
				{ type: "modified", detail: "Crop tightened by roughly 10% to bring the lead pack closer to frame." },
				{ type: "modified", detail: "Colour grade warmed slightly to match the Autumn Series look." },
			],
			brandRegressions: [],
			recommendation: "approve",
			clearances: [
				"Crop still preserves the sponsor-safe zone around jerseys",
				"Colour grade stays within the approved Stride warmth range",
				"No metadata fields altered",
			],
			reasoning: "Straightforward crop and colour-grade refinement — no regressions introduced. Straightforward approve.",
			approveNote: "v2 approved. Crop tightened on the lead pack and colour grade warmed for the Autumn Series look. No regressions.",
			changesDraft: "Hi Priya — OPAL reviewed v2 of Race_Day_Photos.jpg and it looks ready to approve. No changes requested.\n\n— Optimizely DAM",
			rejectDraft: "Hi Priya — v2 of Race_Day_Photos.jpg has been rejected.\n\n— Optimizely DAM",
		},
	},
	{
		id: "item-18",
		title: "Stride_Bike_Fit.jpg",
		label: "JPG",
		type: "image",
		image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
	},
	{
		id: "item-19",
		title: "Training_Plans",
		label: "Folder",
		type: "folder",
	},
	{
		id: "item-20",
		title: "Stride_Transition.jpg",
		label: "JPG",
		type: "image",
		image: "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&w=900&q=80",
	},
];

const STORAGE_KEY = "libraryItems";

function loadInitial(): LibraryItem[] {
	if (typeof window === "undefined") return [...INITIAL_LIBRARY_ITEMS];
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) return JSON.parse(stored);
	} catch (error) {
		console.error("Failed to load library items from localStorage", error);
	}
	return [...INITIAL_LIBRARY_ITEMS];
}

function persist() {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(allLibraryItems));
	} catch (error) {
		console.error("Failed to save library items to localStorage", error);
	}
}

let allLibraryItems: LibraryItem[] = loadInitial();
const listeners = new Set<() => void>();

function notify() {
	listeners.forEach((listener) => listener());
}

/** Adds a new item (e.g. from an approved Drop Zone submission — see DropZoneDetailView.tsx). No-ops if an item with this id already exists, so an accidental double-approve can't create a duplicate. */
export function addLibraryItem(item: LibraryItem) {
	if (allLibraryItems.some((existing) => existing.id === item.id)) return;
	allLibraryItems = [item, ...allLibraryItems];
	persist();
	notify();
}

export function getAllLibraryItems(): LibraryItem[] {
	return allLibraryItems;
}

export function subscribeLibraryItems(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

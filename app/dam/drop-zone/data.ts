// Shared types + mock data for Pillar 2 — The Drop Zone.

export type DropZoneStatus = "active" | "expired";

export interface DropZoneLink {
	id: string;
	token: string;
	name: string;
	brief: string;
	campaign: string;
	createdAt: string;
	expiresAt: string;
	status: DropZoneStatus;
	allowedFileTypes: string[];
	maxFileSizeMb: number;
	requiredFields: string[];
	submissionCount: number;
	/** Who requested this drop zone be created — shown internally, not to external submitters. */
	creatorName: string;
	creatorEmail: string;
}

export const DROP_ZONES: DropZoneLink[] = [
	{
		id: "dz1",
		token: "summer-2026-athletes",
		name: "Summer 2026 Athlete Campaign",
		brief: "Collecting action shots and portraits from sponsored athletes for the Summer 2026 campaign. Need high-res images (min 3000px) showing runners and cyclists in Stride gear — race-day energy preferred over posed shots.",
		campaign: "Summer 2026",
		createdAt: "2026-06-02",
		expiresAt: "2026-08-15",
		status: "active",
		allowedFileTypes: ["JPG", "PNG", "RAW"],
		maxFileSizeMb: 50,
		requiredFields: ["Photographer credit", "Usage rights", "Shoot location"],
		submissionCount: 6,
		creatorName: "Priya Rajan",
		creatorEmail: "priya.rajan@stride.com",
	},
	{
		id: "dz2",
		token: "race-day-autumn",
		name: "Race Day Content — Autumn Series",
		brief: "Video and photo content from the Autumn Series races. Looking for finish-line moments, crowd energy, and transition-zone footage.",
		campaign: "Autumn Series",
		createdAt: "2026-05-20",
		expiresAt: "2026-07-01",
		status: "expired",
		allowedFileTypes: ["JPG", "PNG", "MP4"],
		maxFileSizeMb: 200,
		requiredFields: ["Videographer credit", "Usage rights"],
		submissionCount: 4,
		creatorName: "Marcus Santos",
		creatorEmail: "marcus.santos@stride.com",
	},
];

/** A single external contributor's upload into a Drop Zone — awaiting the internal team's own triage decision, entirely separate from OPAL's automated brand-compliance review (which only ever runs on assets already in the library). */
export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface DropZoneSubmission {
	id: string;
	dropZoneId: string;
	submitterName: string;
	submitterEmail: string;
	files: Array<{ name: string; sizeMb: number }>;
	notes: string;
	submittedAt: string;
	status: SubmissionStatus;
	/** Preview thumbnail. Only the seeded mock submissions carry one (real Stride Tour de
	 * France 2026 template assets from the Brand Pack library, reused here for a realistic
	 * demo) — a submission added live via the internal upload tile or the public drop-zone
	 * page has no curated preview, so DropZoneSubmissionCard falls back to a file-type icon. */
	image?: string;
	/** Reviewer's reason when status is "rejected" — shown back to the submitter on the
	 * public drop-zone page they uploaded through. */
	reviewerComment?: string;
	/** Identifies which browser submitted this, so the public page can show "your
	 * submissions" without any real auth. The internal upload tile (a reviewer adding a
	 * file directly, not a real external submitter) uses the "internal" sentinel so its
	 * entries never appear as anyone's own. */
	visitorId: string;
}

export const INITIAL_DROP_ZONE_SUBMISSIONS: DropZoneSubmission[] = [
	{
		id: "sub-1",
		dropZoneId: "dz1",
		submitterName: "Maya Chen",
		submitterEmail: "maya.chen@stride-agency.com",
		files: [{ name: "Sprint_Start_001.jpg", sizeMb: 18.2 }],
		notes: "Shot at golden hour, athlete cleared for usage.",
		submittedAt: "2 hours ago",
		status: "pending",
		image: "/brand-packs/templates/tdf-cyclist-mountain-sq.png",
		visitorId: "seed",
	},
	{
		id: "sub-2",
		dropZoneId: "dz1",
		submitterName: "Jordan Lee",
		submitterEmail: "jordan.lee@freelance.com",
		files: [{ name: "Cyclist_Climb_Series.zip", sizeMb: 142 }],
		notes: "Three-shot series from the hill climb.",
		submittedAt: "5 hours ago",
		status: "approved",
		image: "/brand-packs/templates/tdf-cyclist-road-wide.png",
		visitorId: "seed",
	},
	{
		id: "sub-3",
		dropZoneId: "dz1",
		submitterName: "Priya Nair",
		submitterEmail: "priya.nair@stride-agency.com",
		files: [{ name: "Relay_Handoff.jpg", sizeMb: 21.4 }, { name: "Relay_Handoff_BW.jpg", sizeMb: 19.8 }],
		notes: "Color and black-and-white versions of the same moment.",
		submittedAt: "Yesterday",
		status: "approved",
		image: "/brand-packs/templates/tdf-engineered-wide.png",
		visitorId: "seed",
	},
	{
		id: "sub-4",
		dropZoneId: "dz1",
		submitterName: "Sam Okafor",
		submitterEmail: "sam.okafor@gmail.com",
		files: [{ name: "Track_Portrait_Wide.raw", sizeMb: 48 }],
		notes: "RAW file, still needs color grading before use.",
		submittedAt: "2 days ago",
		status: "rejected",
		image: "/brand-packs/templates/tdf-cyclist-mountain-sq.png",
		reviewerComment: "RAW file needs color grading before we can use it — please resubmit a graded JPG or PNG export.",
		visitorId: "seed",
	},
	{
		id: "sub-5",
		dropZoneId: "dz1",
		submitterName: "Maya Chen",
		submitterEmail: "maya.chen@stride-agency.com",
		files: [{ name: "Warmup_Candid.jpg", sizeMb: 14.6 }],
		notes: "Behind-the-scenes candid from the morning warmup.",
		submittedAt: "3 days ago",
		status: "pending",
		image: "/brand-packs/templates/tdf-cyclist-road-wide.png",
		visitorId: "seed",
	},
	{
		id: "sub-6",
		dropZoneId: "dz1",
		submitterName: "Elena Voss",
		submitterEmail: "elena.voss@stride-agency.com",
		files: [{ name: "Finish_Line_Sprint.jpg", sizeMb: 22.1 }, { name: "Finish_Line_Sprint_Alt.jpg", sizeMb: 20.7 }],
		notes: "Two crops of the same finish.",
		submittedAt: "4 days ago",
		status: "approved",
		image: "/brand-packs/templates/tdf-finish-port.png",
		visitorId: "seed",
	},
	{
		id: "sub-7",
		dropZoneId: "dz2",
		submitterName: "Priya Nair",
		submitterEmail: "priya.nair@stride-agency.com",
		files: [{ name: "Autumn_Crowd_Energy.mp4", sizeMb: 85 }],
		notes: "Crowd reaction footage from turn 3.",
		submittedAt: "1 day ago",
		status: "pending",
		image: "/brand-packs/templates/tdf-finish-port.png",
		visitorId: "seed",
	},
	{
		id: "sub-8",
		dropZoneId: "dz2",
		submitterName: "Tom Bennett",
		submitterEmail: "tom.bennett@autumnseries.com",
		files: [{ name: "Transition_Zone.mp4", sizeMb: 63 }],
		notes: "Transition zone b-roll, roughly 40 seconds.",
		submittedAt: "3 days ago",
		status: "approved",
		image: "/brand-packs/templates/tdf-stride-race-sq.png",
		visitorId: "seed",
	},
	{
		id: "sub-9",
		dropZoneId: "dz2",
		submitterName: "Jordan Lee",
		submitterEmail: "jordan.lee@freelance.com",
		files: [{ name: "Finish_Line_Wide.jpg", sizeMb: 24 }, { name: "Finish_Line_Close.jpg", sizeMb: 19.3 }],
		notes: "Wide and close variants of the same finish.",
		submittedAt: "5 days ago",
		status: "rejected",
		image: "/brand-packs/templates/tdf-finish-port.png",
		reviewerComment: "Both crops are too similar to sub-6 — let's hold off on using this pair for now.",
		visitorId: "seed",
	},
	{
		id: "sub-10",
		dropZoneId: "dz2",
		submitterName: "Elena Voss",
		submitterEmail: "elena.voss@stride-agency.com",
		files: [{ name: "Podium_Moment.jpg", sizeMb: 17.5 }],
		notes: "Podium celebration, autumn series finale.",
		submittedAt: "1 week ago",
		status: "approved",
		image: "/brand-packs/templates/tdf-engineered-wide.png",
		visitorId: "seed",
	},
];

/** OPAL's suggested Drop Zone configuration, derived from a parsed campaign brief. Static demo output. */
export interface OpalBriefSuggestion {
	campaignTag: string;
	expiresAt: string;
	allowedFileTypes: string[];
	maxFileSizeMb: number;
	requiredFields: string[];
	landingCopy: string;
}

export function getOpalBriefSuggestion(brief: string): OpalBriefSuggestion {
	const lower = brief.toLowerCase();
	const wantsVideo = lower.includes("video") || lower.includes("footage");
	const isExternal = lower.includes("agency") || lower.includes("external") || lower.includes("studio");

	return {
		campaignTag: brief.split(".")[0].slice(0, 48).trim() || "New Campaign",
		expiresAt: "6 weeks from today",
		allowedFileTypes: wantsVideo ? ["JPG", "PNG", "MP4"] : ["JPG", "PNG", "RAW"],
		maxFileSizeMb: wantsVideo ? 200 : 50,
		requiredFields: isExternal
			? ["Contributor name", "Usage rights", "Contact email"]
			: ["Photographer credit", "Usage rights"],
		landingCopy: "Share your files for this campaign below. Our team reviews every submission before it's added to the Stride library.",
	};
}

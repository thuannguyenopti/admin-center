// Shared OPAL types used anywhere an OPAL check surfaces a flag — the real
// upload dialog (app/cmp/library/components/upload) and the DAM verdict
// panels (app/dam/components) both need this exact shape.

export type OpalFlagSeverity = "low" | "medium" | "high";

export interface OpalFlag {
	severity: OpalFlagSeverity;
	category: string;
	detail: string;
	/** Suggested remedy, shown when the finding row expands. */
	fix?: string;
	/** Percent-based position (0–100) for a numbered marker over the asset preview. */
	marker?: { x: number; y: number };
}

export type OpalRecommendation = "approve" | "flag" | "reject";

/** A structured match against an existing library asset — set on the asset's review state (e.g. LibraryItem.duplicateOf), not on a single OpalFlag, since it describes the whole submission rather than one finding. */
export interface OpalDuplicateMatch {
	assetId: string;
	title: string;
	image?: string;
	submittedBy?: string;
	submittedAt?: string;
	/** Visual-similarity match percentage, 0-100. */
	matchPct?: number;
}

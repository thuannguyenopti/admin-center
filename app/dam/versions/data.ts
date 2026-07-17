// Shared types for Pillar 3 — Edit Submission & Versioning.
// Mock content lives on each LibraryItem.pendingVersion in app/cmp/library/page.tsx;
// this file only defines the shape shared by that data and the review dialog.

import type { OpalFlag } from "../data";

export type ChangeType = "added" | "removed" | "modified";
export type VersionRecommendation = "approve" | "flag" | "reject";

export interface ChangeSummaryItem {
	type: ChangeType;
	detail: string;
}

export interface PendingVersionDetail {
	versionLabel: string;
	submitter: string;
	submittedAt: string;
	pendingImage: string;
	/** The submitter's own description of the edit — shown verbatim so the approver can check it against what OPAL actually found. */
	whatChanged: string;
	rightsChanges?: string;
	reviewDeadline?: string;
	/** OPAL's confidence in its own assessment, 0-100. */
	confidence: number;
	changesSummary: ChangeSummaryItem[];
	/** Brand/compliance findings for this version. Markers with x/y position render on the pending image. */
	brandRegressions: OpalFlag[];
	/** Set when the submitter's "what changed" note doesn't match what OPAL actually detected. */
	discrepancy?: string;
	recommendation: VersionRecommendation;
	clearances: string[];
	reasoning: string;
	/** OPAL-drafted message for each approval outcome — reviewed and edited by the approver before sending. */
	approveNote: string;
	changesDraft: string;
	rejectDraft: string;
}

export interface VersionSubmission extends PendingVersionDetail {
	id: string;
	assetName: string;
	currentImage: string;
}

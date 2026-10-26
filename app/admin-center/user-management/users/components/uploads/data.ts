export type UploadStatus = "Processing" | "Completed" | "Failed";

export type Upload = {
	id: string;
	fileName: string;
	uploadedBy: string;
	uploadedOn: string;
	status: UploadStatus;
	/** 0–100, only meaningful while Processing. */
	progress: number;
	/** Users successfully processed (null while still Processing). */
	usersProcessed: number | null;
	failedRecords: number;
};

/**
 * Staging row status after comparing to the live user list.
 * - New: email not on system — can import
 * - Duplicate: email exists with same (or no) access — remove or override
 * - Conflict: email exists with different product/instance/role — remove or override
 * - Unknown group: group-access row whose group_name did not match
 */
export type StagingRowStatus =
	| "New"
	| "Duplicate"
	| "Conflict"
	| "Unknown group";

export type StagingGroupMatch = "matched" | "unknown";

/** User chose to overwrite the existing account on import. */
export type StagingResolution = "override";

export type StagingUser = {
	id: string;
	uploadId: string;
	fileName: string;
	email: string;
	first: string;
	last: string;
	status: StagingRowStatus;
	resolution?: StagingResolution;
	/** How this row was imported. */
	importMode?: "users" | "groupAccess";
	/** Group name from CSV (group-access import). */
	groupName?: string;
	groupId?: string;
	groupMatch?: StagingGroupMatch;
	/** Access copied from matched group (or assigned later). */
	product?: string;
	instance?: string;
	role?: string;
};

/** Minimal existing-user snapshot for conflict detection. */
export type ExistingUserAccess = {
	email: string;
	product: string;
	instance: string;
	role: string;
};

/** Jobs start empty — populated when the user uploads a real CSV. */
export const UPLOADS: Upload[] = [];

/** Staging starts empty — filled from completed import jobs. */
export const INITIAL_STAGING_USERS: StagingUser[] = [];

export function statusColor(
	status: UploadStatus,
): "fg.warning" | "fg.success" | "fg.error" {
	if (status === "Processing") return "fg.warning";
	if (status === "Completed") return "fg.success";
	return "fg.error";
}

export function stagingStatusColor(
	status: StagingRowStatus,
): "fg.success" | "fg.warning" | "fg.error" {
	if (status === "New") return "fg.success";
	if (status === "Conflict" || status === "Unknown group") return "fg.warning";
	return "fg.error";
}

/** True when the row can be selected for import (including override). */
export function isStagingImportable(u: StagingUser): boolean {
	if (u.status === "Unknown group") return false;
	if (u.status === "New") {
		if (u.importMode === "groupAccess" && u.groupMatch !== "matched") {
			return false;
		}
		return true;
	}
	// Duplicate / Conflict — only after Override
	return u.resolution === "override";
}

/** Rows that need a user decision (remove or override / fix group). */
export function isStagingIssue(u: StagingUser): boolean {
	return (
		u.status === "Duplicate" ||
		u.status === "Conflict" ||
		u.status === "Unknown group"
	);
}

/**
 * Recompute New / Duplicate / Conflict / Unknown group from the live user list.
 * Preserves `resolution: override` when the row is still Duplicate or Conflict.
 */
export function applyStagingReview(
	staging: StagingUser[],
	existing: Iterable<ExistingUserAccess>,
): StagingUser[] {
	const byEmail = new Map(
		[...existing].map((u) => [u.email.trim().toLowerCase(), u] as const),
	);

	return staging.map((u) => {
		const wasOverride = u.resolution === "override";

		if (u.importMode === "groupAccess" && u.groupMatch === "unknown") {
			return { ...u, status: "Unknown group" as const, resolution: undefined };
		}

		const ex = byEmail.get(u.email.toLowerCase());
		if (!ex) {
			return { ...u, status: "New" as const, resolution: undefined };
		}

		const hasIncomingAccess =
			u.groupMatch === "matched" &&
			Boolean(u.product && u.instance && u.role);
		const accessDiffers =
			hasIncomingAccess &&
			(u.product !== ex.product ||
				u.instance !== ex.instance ||
				u.role !== ex.role);

		const status: StagingRowStatus = accessDiffers ? "Conflict" : "Duplicate";
		return {
			...u,
			status,
			resolution: wasOverride ? ("override" as const) : undefined,
		};
	});
}

/** @deprecated Use applyStagingReview — kept for call-site migration. */
export function applyDuplicateCheck(
	staging: StagingUser[],
	systemEmails: Iterable<string>,
): StagingUser[] {
	return applyStagingReview(
		staging,
		[...systemEmails].map((email) => ({
			email,
			product: "",
			instance: "",
			role: "",
		})),
	);
}

/** Upsert a job into the list (newest first). */
export function upsertUpload(list: Upload[], job: Upload): Upload[] {
	const idx = list.findIndex((u) => u.id === job.id);
	if (idx === -1) return [job, ...list];
	const next = [...list];
	next[idx] = job;
	return next;
}

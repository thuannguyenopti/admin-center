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

/** Row status in staging (Upload tab). Duplicate = email already on the system. */
export type StagingRowStatus = "Valid" | "Duplicate";

export type StagingGroupMatch = "matched" | "unknown";

export type StagingUser = {
	id: string;
	uploadId: string;
	fileName: string;
	email: string;
	first: string;
	last: string;
	status: StagingRowStatus;
	/** How this row was imported. */
	importMode?: "users" | "groupAccess";
	/** Group name from CSV (group-access import). */
	groupName?: string;
	groupId?: string;
	groupMatch?: StagingGroupMatch;
	/** Access copied from matched group. */
	product?: string;
	instance?: string;
	role?: string;
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
): "fg.success" | "fg.error" {
	return status === "Valid" ? "fg.success" : "fg.error";
}

/** Mark rows duplicate if email already exists in the system user list. */
export function applyDuplicateCheck(
	staging: StagingUser[],
	systemEmails: Iterable<string>,
): StagingUser[] {
	const set = new Set(
		[...systemEmails].map((e) => e.trim().toLowerCase()),
	);
	return staging.map((u) => ({
		...u,
		status: set.has(u.email.toLowerCase()) ? "Duplicate" : "Valid",
	}));
}

/** Upsert a job into the list (newest first). */
export function upsertUpload(list: Upload[], job: Upload): Upload[] {
	const idx = list.findIndex((u) => u.id === job.id);
	if (idx === -1) return [job, ...list];
	const next = [...list];
	next[idx] = job;
	return next;
}

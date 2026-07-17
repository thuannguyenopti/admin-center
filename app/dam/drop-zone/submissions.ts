// Session-local store for Drop Zone submissions — same shape as ../../cmp/library/auditTrail.ts
// (a plain module singleton with subscribe/notify, not React state) so the public
// (unauthenticated) submission page at [token]/page.tsx and the internal CMP Drop Zone
// detail view can share one source of truth despite having no React ancestor in common.
// Resets on hard refresh, consistent with the rest of this prototype's client-only mock
// state — submitting on the public page during a session makes it appear in the internal
// view immediately, without a backend.

import { INITIAL_DROP_ZONE_SUBMISSIONS, type DropZoneSubmission, type SubmissionStatus } from "./data";

const EMPTY: DropZoneSubmission[] = [];

let allSubmissions: DropZoneSubmission[] = [...INITIAL_DROP_ZONE_SUBMISSIONS];
let byZone = new Map<string, DropZoneSubmission[]>();
const listeners = new Set<() => void>();

function reindex() {
	const next = new Map<string, DropZoneSubmission[]>();
	allSubmissions.forEach((submission) => {
		next.set(submission.dropZoneId, [...(next.get(submission.dropZoneId) ?? []), submission]);
	});
	byZone = next;
}
reindex();

function notify() {
	listeners.forEach((listener) => listener());
}

export function addSubmission(input: {
	dropZoneId: string;
	submitterName: string;
	submitterEmail: string;
	files: Array<{ name: string; sizeMb: number }>;
	notes: string;
}): DropZoneSubmission {
	const submission: DropZoneSubmission = {
		id: `sub-new-${allSubmissions.length}`,
		status: "pending",
		submittedAt: "Just now",
		...input,
	};
	allSubmissions = [submission, ...allSubmissions];
	reindex();
	notify();
	return submission;
}

export function setSubmissionStatus(id: string, status: SubmissionStatus) {
	allSubmissions = allSubmissions.map((submission) => (submission.id === id ? { ...submission, status } : submission));
	reindex();
	notify();
}

/** Returns a stable array reference when unchanged — required for useSyncExternalStore. */
export function getSubmissionsForZone(dropZoneId: string): DropZoneSubmission[] {
	return byZone.get(dropZoneId) ?? EMPTY;
}

export function getAllSubmissions(): DropZoneSubmission[] {
	return allSubmissions;
}

export function subscribeSubmissions(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

// Persistent store for Drop Zone submissions — same plain module-singleton
// subscribe/notify shape as ../../cmp/library/auditTrail.ts (not React state),
// so the public (unauthenticated) submission page at [token]/page.tsx and the
// internal CMP Drop Zone detail view can share one source of truth despite
// having no React ancestor in common. Backed by localStorage the same way
// app/usePersistentState.js backs ordinary component state elsewhere in this
// repo (read once on load, write on every mutation) — a hook can't do that
// job here since this state must be reachable from two disconnected route
// trees, but the persistence approach is otherwise identical.

import { INITIAL_DROP_ZONE_SUBMISSIONS, type DropZoneSubmission, type SubmissionStatus } from "./data";

const STORAGE_KEY = "dropZoneSubmissions";
const EMPTY: DropZoneSubmission[] = [];

function loadInitial(): DropZoneSubmission[] {
	if (typeof window === "undefined") return [...INITIAL_DROP_ZONE_SUBMISSIONS];
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) return JSON.parse(stored);
	} catch (error) {
		console.error("Failed to load drop zone submissions from localStorage", error);
	}
	return [...INITIAL_DROP_ZONE_SUBMISSIONS];
}

function persist() {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(allSubmissions));
	} catch (error) {
		console.error("Failed to save drop zone submissions to localStorage", error);
	}
}

let allSubmissions: DropZoneSubmission[] = loadInitial();
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
	visitorId: string;
}): DropZoneSubmission {
	const submission: DropZoneSubmission = {
		id: `sub-new-${allSubmissions.length}`,
		status: "pending",
		submittedAt: "Just now",
		...input,
	};
	allSubmissions = [submission, ...allSubmissions];
	reindex();
	persist();
	notify();
	return submission;
}

export function setSubmissionStatus(id: string, status: SubmissionStatus, reviewerComment?: string) {
	allSubmissions = allSubmissions.map((submission) =>
		submission.id === id ? { ...submission, status, ...(reviewerComment !== undefined && { reviewerComment }) } : submission,
	);
	reindex();
	persist();
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

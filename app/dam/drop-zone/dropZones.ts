// Persistent store for Drop Zone links themselves — same shape as
// ./submissions.ts (plain module singleton, localStorage-backed, subscribe/
// notify for useSyncExternalStore). DROP_ZONES used to be a static array that
// nothing ever mutated, which is why the "create a new drop zone" flow
// couldn't actually create one. This promotes it to a real, evolving
// collection: creating a zone here is what makes its link genuinely work
// (findable by token, able to receive submissions, visible in every list)
// instead of just showing a cosmetic "created" screen.

import { DROP_ZONES, type DropZoneLink } from "./data";

const STORAGE_KEY = "dropZones";

function loadInitial(): DropZoneLink[] {
	if (typeof window === "undefined") return [...DROP_ZONES];
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) return JSON.parse(stored);
	} catch (error) {
		console.error("Failed to load drop zones from localStorage", error);
	}
	return [...DROP_ZONES];
}

function persist() {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(allDropZones));
	} catch (error) {
		console.error("Failed to save drop zones to localStorage", error);
	}
}

let allDropZones: DropZoneLink[] = loadInitial();
const listeners = new Set<() => void>();

function notify() {
	listeners.forEach((listener) => listener());
}

export function addDropZone(input: Omit<DropZoneLink, "id" | "createdAt" | "status" | "submissionCount">): DropZoneLink {
	const dropZone: DropZoneLink = {
		id: `dz-new-${allDropZones.length}`,
		createdAt: new Date().toISOString().slice(0, 10),
		status: "active",
		submissionCount: 0,
		...input,
	};
	allDropZones = [dropZone, ...allDropZones];
	persist();
	notify();
	return dropZone;
}

export function updateDropZone(id: string, patch: Partial<DropZoneLink>): void {
	allDropZones = allDropZones.map((zone) => (zone.id === id ? { ...zone, ...patch } : zone));
	persist();
	notify();
}

export function getAllDropZones(): DropZoneLink[] {
	return allDropZones;
}

export function getDropZoneByToken(token: string): DropZoneLink | undefined {
	return allDropZones.find((zone) => zone.token === token);
}

export function subscribeDropZones(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

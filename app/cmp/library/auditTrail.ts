// Session-local governance audit trail — a plain module singleton (not React state) so it
// survives AssetFocusViewer unmounting on every panel close and is readable from anywhere
// in /cmp/library (the panel, Assets Review, the Governance digest) without a shared
// React ancestor. Resets on hard refresh, consistent with the rest of this prototype's
// client-only mock state.
//
// Covers every governance decision — approved (edit submission), changes-requested,
// rejected, and overridden (approved despite open OPAL findings) — not just overrides,
// so an asset's audit trail actually reflects everything that happened to it.

/** The single mock identity every recorded action is attributed to in this prototype. */
export const CURRENT_USER = "David Steinberg";

export type DecisionAction = "approved" | "changes-requested" | "rejected" | "overridden";

export type DecisionEvent = {
	id: string;
	itemId: string;
	itemTitle: string;
	action: DecisionAction;
	actor: string;
	timestamp: string;
	/** Override reason, the drafted message sent for changes-requested/rejected, or a version label for approved. */
	note?: string;
};

const EMPTY: DecisionEvent[] = [];

let allEvents: DecisionEvent[] = [];
const byItem = new Map<string, DecisionEvent[]>();
const listeners = new Set<() => void>();

function notify() {
	listeners.forEach((listener) => listener());
}

export function recordDecision(input: { itemId: string; itemTitle: string; action: DecisionAction; actor: string; note?: string }) {
	const event: DecisionEvent = {
		id: `decision-${allEvents.length}-${input.itemId}`,
		timestamp: "Just now",
		...input,
	};
	allEvents = [event, ...allEvents];
	byItem.set(input.itemId, [event, ...(byItem.get(input.itemId) ?? [])]);
	notify();
}

export function getAllDecisionEvents(): DecisionEvent[] {
	return allEvents;
}

export function getOverrideCount(): number {
	return allEvents.filter((event) => event.action === "overridden").length;
}

/** Returns a stable array reference when unchanged — required for useSyncExternalStore, which will loop-render if the snapshot is a fresh array on every call. */
export function getDecisionEventsForItem(itemId: string): DecisionEvent[] {
	return byItem.get(itemId) ?? EMPTY;
}

/**
 * The most recent decision recorded for an item, or null if none. `byItem` is already
 * newest-first (recordDecision prepends), so this is a pure read — rejecting/requesting
 * changes on an item needs to "stick" without ever mutating the underlying LibraryItem or
 * deleting it from the mock library, and this is what lets reviewStatus() (ReviewQueueView)
 * derive that outcome from the same audit log that's already the source of truth for
 * "what happened to this asset."
 */
export function getLatestDecision(itemId: string): DecisionAction | null {
	const events = byItem.get(itemId);
	return events && events.length > 0 ? events[0].action : null;
}

export function subscribeDecisions(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

import type { VariationRow } from "./variationSets";

const STORED_VARIATIONS_KEY = "opal_stored_variation_rows_v1";

type VariationStore = Record<string, VariationRow[]>;

function readStore(): VariationStore {
	if (typeof window === "undefined") return {};
	try {
		const raw = sessionStorage.getItem(STORED_VARIATIONS_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as unknown;
		if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
		return parsed as VariationStore;
	} catch {
		return {};
	}
}

function writeStore(store: VariationStore): void {
	try {
		sessionStorage.setItem(STORED_VARIATIONS_KEY, JSON.stringify(store));
	} catch {
		/* ignore */
	}
}

function isVariationRow(x: unknown): x is VariationRow {
	if (x === null || typeof x !== "object") return false;
	const o = x as Record<string, unknown>;
	return (
		typeof o.key === "string" &&
		typeof o.letter === "string" &&
		typeof o.title === "string" &&
		typeof o.description === "string" &&
		typeof o.preview === "string"
	);
}

export function getStoredExtraVariations(optimizationId: string): VariationRow[] {
	const rows = readStore()[optimizationId];
	if (!Array.isArray(rows)) return [];
	return rows.filter(isVariationRow);
}

export function setStoredExtraVariations(optimizationId: string, rows: VariationRow[]): void {
	const s = readStore();
	s[optimizationId] = rows;
	writeStore(s);
}

/** Add or replace a row by `key` (e.g. after Opal build). */
export function appendStoredExtraVariation(optimizationId: string, row: VariationRow): void {
	const existing = getStoredExtraVariations(optimizationId);
	const without = existing.filter((r) => r.key !== row.key);
	setStoredExtraVariations(optimizationId, [...without, row]);
}

export function clearStoredExtraVariations(optimizationId: string): void {
	const s = readStore();
	delete s[optimizationId];
	writeStore(s);
}

/** Remove one extra row by key (no-op if not present). */
export function removeStoredExtraVariation(optimizationId: string, key: string): void {
	const existing = getStoredExtraVariations(optimizationId);
	const filtered = existing.filter((r) => r.key !== key);
	if (filtered.length === existing.length) return;
	setStoredExtraVariations(optimizationId, filtered);
}

const REMOVED_BASE_KEYS_KEY = "opal_removed_variation_keys_v1";

type RemovedKeysStore = Record<string, string[]>;

function readRemovedKeysStore(): RemovedKeysStore {
	if (typeof window === "undefined") return {};
	try {
		const raw = sessionStorage.getItem(REMOVED_BASE_KEYS_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as unknown;
		if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
		return parsed as RemovedKeysStore;
	} catch {
		return {};
	}
}

function writeRemovedKeysStore(store: RemovedKeysStore): void {
	try {
		sessionStorage.setItem(REMOVED_BASE_KEYS_KEY, JSON.stringify(store));
	} catch {
		/* ignore */
	}
}

/** Keys of base (mock) variations the user removed in this session — hidden from the combined list. */
export function getRemovedVariationKeys(optimizationId: string): string[] {
	const keys = readRemovedKeysStore()[optimizationId];
	if (!Array.isArray(keys)) return [];
	return keys.filter((k) => typeof k === "string");
}

export function addRemovedVariationKey(optimizationId: string, key: string): void {
	const s = readRemovedKeysStore();
	const prev = s[optimizationId] ?? [];
	if (prev.includes(key)) return;
	s[optimizationId] = [...prev, key];
	writeRemovedKeysStore(s);
}

export type PreviewVariant =
	| "original"
	| "highContrast"
	| "social"
	| "sticky"
	| "emphasis"
	| "tablePlain"
	| "tableIcons"
	| "tableFeatured"
	| "tableExpand"
	| "filtersStack"
	| "filtersChips"
	| "splitMapList";

export interface VariationRow {
	key: string;
	letter: string;
	title: string;
	description: string;
	preview: PreviewVariant;
}

/**
 * Even split across 100% (e.g. 2 → 50%/50%, 5 → 20% each).
 * Rounding remainder is distributed to the first rows so the total is exactly 100%.
 */
export function evenTrafficPercents(variationCount: number): string[] {
	if (variationCount <= 0) return [];
	const base = Math.floor(100 / variationCount);
	const remainder = 100 - base * variationCount;
	return Array.from({ length: variationCount }, (_, i) => `${base + (i < remainder ? 1 : 0)}%`);
}

/** Variations + preview wireframes keyed by optimization id (see mockData). */
const MOCK_VARIATIONS_BY_OPTIMIZATION_ID: Record<string, VariationRow[]> = {
	"1": [
		{
			key: "a",
			letter: "A",
			title: "Original",
			description:
				"Performance-first headline (“Train smarter”) and outline CTA. Baseline from production homepage hero.",
			preview: "original",
		},
		{
			key: "b",
			letter: "B",
			title: "Beginner headline + primary CTA",
			description:
				"“Train for your first triathlon” with solid filled CTA and supporting line about guided plans.",
			preview: "highContrast",
		},
		{
			key: "c",
			letter: "C",
			title: "Social proof strip",
			description:
				"Adds “Join 12,000+ athletes” with avatar stack above the CTA and a one-line trust badge.",
			preview: "social",
		},
		{
			key: "d",
			letter: "D",
			title: "Shorter copy + larger CTA",
			description: "Tighter subcopy, 44px-tall button, secondary text link for “View sample week”.",
			preview: "emphasis",
		},
		{
			key: "e",
			letter: "E",
			title: "Sticky hero CTA",
			description: "On scroll, primary CTA pins under the global nav so signup stays visible on long pages.",
			preview: "sticky",
		},
	],
	"2": [
		{
			key: "a",
			letter: "A",
			title: "Control — community framing",
			description:
				"Soft “Join our talent community” headline with secondary “Learn more” style treatment; passive tone.",
			preview: "original",
		},
		{
			key: "b",
			letter: "B",
			title: "Sign Up (winner)",
			description:
				"Direct primary CTA labeled “Sign Up” with concise value line; action-oriented copy tuned for clarity.",
			preview: "emphasis",
		},
		{
			key: "c",
			letter: "C",
			title: "Social proof + Sign Up",
			description: "Winner CTA with a one-line proof point (“Join 50K+ members”) above the button.",
			preview: "social",
		},
	],
	"3": [
		{
			key: "a",
			letter: "A",
			title: "Original: location first",
			description: "City/region search and radius, then distance bucket as a secondary dropdown.",
			preview: "filtersStack",
		},
		{
			key: "b",
			letter: "B",
			title: "Distance chips first",
			description: "Sprint · Olympic · Half · Full as horizontal chips; map refines after distance choice.",
			preview: "filtersChips",
		},
		{
			key: "c",
			letter: "C",
			title: "Map + list split",
			description: "40/60 split: interactive map beside scrollable race cards sorted by next start date.",
			preview: "splitMapList",
		},
		{
			key: "d",
			letter: "D",
			title: "Date range + surface type",
			description: "Adds season slider and surface filters (road / trail / mixed) under the main filters.",
			preview: "filtersStack",
		},
		{
			key: "e",
			letter: "E",
			title: "Popular near you",
			description: "Geo-based “Popular this month” chip row using the athlete’s saved home region.",
			preview: "filtersChips",
		},
	],
};

export function getVariationsForOptimization(optimizationId: string): VariationRow[] {
	return MOCK_VARIATIONS_BY_OPTIMIZATION_ID[optimizationId] ?? [];
}

/** Default control when an optimization has no mock variation set (e.g. Opal-created experiments). */
export const DEFAULT_CONTROL_VARIATION: VariationRow = {
	key: "control-a",
	letter: "A",
	title: "Original",
	description: "Control — production experience. Baseline for this experiment.",
	preview: "original",
};

/** Base mock variations (or default control) plus session-persisted extras — same list as the Variations table. */
export function resolveExperimentVariations(
	optimizationId: string,
	persistedExtras: VariationRow[],
	removedKeys: string[] = [],
): VariationRow[] {
	const base = getVariationsForOptimization(optimizationId);
	const withControl = base.length === 0 ? [DEFAULT_CONTROL_VARIATION] : base;
	const merged = [...withControl, ...persistedExtras];
	const hide = new Set(removedKeys);
	return merged.filter((r) => !hide.has(r.key));
}

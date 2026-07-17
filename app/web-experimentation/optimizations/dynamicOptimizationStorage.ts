import type { Optimization } from "./mockData";

const DYNAMIC_OPTS_KEY = "opal_dynamic_optimizations_v1";
const PENDING_VARIATION_KEY = "opal_pending_variation_build_v1";

export function getDynamicOptimizations(): Optimization[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = sessionStorage.getItem(DYNAMIC_OPTS_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown;
		return Array.isArray(parsed) ? (parsed as Optimization[]) : [];
	} catch {
		return [];
	}
}

export function addDynamicOptimization(optimization: Optimization): void {
	try {
		const list = getDynamicOptimizations().filter((o) => o.id !== optimization.id);
		list.push(optimization);
		sessionStorage.setItem(DYNAMIC_OPTS_KEY, JSON.stringify(list));
	} catch {
		/* ignore */
	}
}

export function removeDynamicOptimization(id: string): void {
	try {
		const list = getDynamicOptimizations().filter((o) => o.id !== id);
		sessionStorage.setItem(DYNAMIC_OPTS_KEY, JSON.stringify(list));
	} catch {
		/* ignore */
	}
}

export function getDynamicOptimizationById(id: string): Optimization | undefined {
	return getDynamicOptimizations().find((o) => o.id === id);
}

export type PendingVariationBuild = {
	optimizationId: string;
	experimentName: string;
	description: string;
	hypothesis: string;
	destination: string;
};

export function setPendingVariationBuild(pending: PendingVariationBuild): void {
	try {
		sessionStorage.setItem(PENDING_VARIATION_KEY, JSON.stringify(pending));
	} catch {
		/* ignore */
	}
}

export function consumePendingVariationBuild(): PendingVariationBuild | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = sessionStorage.getItem(PENDING_VARIATION_KEY);
		if (!raw) return null;
		sessionStorage.removeItem(PENDING_VARIATION_KEY);
		const parsed = JSON.parse(raw) as PendingVariationBuild;
		if (parsed?.optimizationId && parsed.experimentName != null) return parsed;
		return null;
	} catch {
		return null;
	}
}

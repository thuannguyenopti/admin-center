import type { ExperimentResultsData } from "./types";

/**
 * Mock experiment results keyed by optimization id.
 * Ids 1–3 map to Inconclusive, Positive (clear winner), Negative (clear loser) for demo variety.
 */
/** Format number with K/M suffix (e.g. 1250 -> "1.25K", 1200000 -> "1.2M"). */
export function formatCompactNumber(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
	return n.toFixed(2);
}

/** Format currency with K/M (e.g. 0.42 -> "$0.42", 1250 -> "$1.25K"). */
export function formatCompactCurrency(n: number): string {
	if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
	if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
	return `$${n.toFixed(2)}`;
}

export const mockExperimentResultsByOptimizationId: Record<string, ExperimentResultsData> = {
	"1": {
		experimentName: "Tech — Featured Careers",
		experimentType: "On-page change",
		duration: "29 days",
		status: "Concluded",
		overallSignificant: false,
		primaryLift: "+13.5%",
		primaryConfidence: 78,
		primarySignificance: "0.3%",
		segmentSignificance: false,
		primarySecondaryOpposing: false,
		totalVisitors: 4911,
		visitorsPerDay: 169,
		conversionRateControl: 0.083,
		conversionRateVariant: 0.094,
		timeToResolveDays: 76,
		primaryMetrics: [
			{ metric: "Form Success", variation: "Original (Control)", changeVsControl: "--", significance: "--" },
			{ metric: "Form Success", variation: "Demo", changeVsControl: "+2%", significance: "0.3%" },
			{ metric: "Form Success", variation: "Demo and Get Started", changeVsControl: "+3%", significance: "0.3%" },
		],
		secondaryMetrics: [
			{ metric: "Hero CTA Clicks", variation: "Demo and Get Started", changeVsControl: "+7%", significance: "0.8%" },
			{ metric: "Hero Visibility CTA Clicked", variation: "Demo and Get Started", changeVsControl: "-1.8%", significance: "0.8%" },
		],
		segments: [
			{ segment: "High-intent Users (segment > 3 pgs/role)", changeVsControl: "+9%", significance: "0.2%", interpretation: "Weak lift, just not significant" },
			{ segment: "New Users (ISR)", changeVsControl: "+7%", significance: "2.1%", interpretation: "Not A priority" },
			{ segment: "Users from Paid NON", changeVsControl: "-3%", significance: "3.2%", interpretation: "Not A priority" },
		],
		crossExperiments: [
			{ experimentName: "Tech – Featured Careers", startDate: "2025-01-10", primaryMetric: "Hero CTA Clicks", outcome: "Inconclusive" },
			{ experimentName: '"Get Started" vs "View Jobs"', startDate: "2025-01-30", primaryMetric: "Hero CTA Clicks", outcome: "Inconclusive" },
			{ experimentName: "HERO NAV – Headline Test", startDate: "2025-02-15", primaryMetric: "Hero CTA Clicks", outcome: "Inconclusive" },
			{ experimentName: "Complete A/B Redesign", startDate: "2025-02-07", primaryMetric: "Demo Requests", outcome: "Positive" },
		],
	},
	"2": {
		experimentName: "Talent Community Verbiage",
		experimentType: "On-page copy test",
		duration: "341 days",
		status: "Concluded",
		overallSignificant: true,
		primaryLift: "+85.6%",
		primaryConfidence: 90,
		primarySignificance: "0.1%",
		segmentSignificance: false,
		primarySecondaryOpposing: false,
		totalVisitors: 191_647,
		winningVariationLabel: "Sign Up",
		positiveConversionSubtext: "0.22% → 0.41%",
		positiveDailyValueTotal: 8580,
		positiveRevenuePerVisitor: 0.77,
		positiveAnnualValueTotal: 3_130_000,
		positiveRevenuePerConversion: 52.1,
		dailyValuePerVisitor: 0.77,
		annualImpactPerConversion: 52.1,
		primaryMetrics: [
			{ metric: "Sign-ups", variation: "Control", changeVsControl: "--", significance: "--" },
			{ metric: "Sign-ups", variation: "Sign Up", changeVsControl: "+85.6%", significance: "0.1%" },
		],
		secondaryMetrics: [
			{ metric: "CTA clicks", variation: "Sign Up", changeVsControl: "+42%", significance: "0.4%" },
		],
		segments: [
			{ segment: "Mobile", changeVsControl: "+104%", significance: "0.2%", interpretation: "Stronger relative lift in thumb-friendly layout" },
			{ segment: "Desktop", changeVsControl: "+61%", significance: "0.3%", interpretation: "Solid win, smaller relative gain vs mobile" },
		],
		crossExperiments: [],
	},
	"3": {
		experimentName: "[Fix] CAB add linkedin links",
		experimentType: "A/B Test",
		duration: "21 days",
		status: "Concluded",
		overallSignificant: true,
		primaryLift: "-12.4%",
		primaryConfidence: 96,
		primarySignificance: "0.0%",
		segmentSignificance: false,
		primarySecondaryOpposing: false,
		topLifts: [
			{ name: "Get started", significance: "96% Significance" },
			{ name: "Apply Today", significance: "94% Significance" },
		],
		cvrBaseline: "2.1% vs 1.8%",
		primaryMetrics: [
			{ metric: "Click-through Rate", variation: "Control", changeVsControl: "--", significance: "--" },
			{ metric: "Click-through Rate", variation: "LinkedIn Links", changeVsControl: "-12.4%", significance: "0.0%" },
		],
		secondaryMetrics: [
			{ metric: "Time on Page", variation: "LinkedIn Links", changeVsControl: "-8%", significance: "2.0%" },
		],
		segments: [
			{ segment: "All traffic", changeVsControl: "-12.4%", significance: "0.0%", interpretation: "Clear loss" },
		],
		crossExperiments: [],
	},
	"5": {
		experimentName: "[250729 Felix EXP] Plans page: new template",
		experimentType: "A/B Test",
		duration: "12 days",
		status: "Concluded",
		overallSignificant: true,
		primaryLift: "+22.1%",
		primaryConfidence: 97,
		primarySignificance: "0.05%",
		segmentSignificance: false,
		primarySecondaryOpposing: false,
		dailyValuePerVisitor: 0.58,
		annualImpactPerConversion: 2450,
		primaryMetrics: [
			{ metric: "Form Success", variation: "Control", changeVsControl: "--", significance: "--" },
			{ metric: "Form Success", variation: "New template", changeVsControl: "+22.1%", significance: "0.05%" },
		],
		secondaryMetrics: [],
		segments: [],
		crossExperiments: [],
	},
};

/**
 * Get mock results for an optimization id. Falls back to id "1" (Inconclusive) if not found.
 */
export function getMockExperimentResults(optimizationId: string): ExperimentResultsData {
	return (
		mockExperimentResultsByOptimizationId[optimizationId] ??
		mockExperimentResultsByOptimizationId["1"]
	);
}

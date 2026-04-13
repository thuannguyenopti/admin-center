/**
 * Experiment results data shape: the "page data" the agent receives to summarize.
 * Used when passing resultsPayload or when the API loads mock results by optimization id.
 */
export type ExperimentResultOutcome = "Positive" | "Negative" | "Mixed" | "Inconclusive";

export interface PrimaryOrSecondaryMetricRow {
	metric: string;
	variation: string;
	changeVsControl: string;
	significance: string;
}

export interface SegmentRow {
	segment: string;
	changeVsControl: string;
	significance: string;
	interpretation: string;
}

export interface CrossExperimentRow {
	experimentName: string;
	startDate: string;
	primaryMetric: string;
	outcome: string;
}

/** Top lift row for Negative outcome (e.g. "Get started" lift + significance). */
export interface TopLiftRow {
	name: string;
	significance: string;
}

export interface ExperimentResultsData {
	experimentName: string;
	experimentType: string;
	duration: string;
	status: string;
	primaryMetrics: PrimaryOrSecondaryMetricRow[];
	secondaryMetrics: PrimaryOrSecondaryMetricRow[];
	segments: SegmentRow[];
	crossExperiments?: CrossExperimentRow[];
	/** Used by agent to classify outcome */
	overallSignificant?: boolean;
	primaryLift?: string;
	primaryConfidence?: number;
	segmentSignificance?: boolean;
	primarySecondaryOpposing?: boolean;
	/** For Positive: daily value per visitor (raw number for K/M formatting). Legacy fallback when totals unset. */
	dailyValuePerVisitor?: number;
	/** For Positive: annual impact per conversion (raw number for K/M formatting). Legacy fallback. */
	annualImpactPerConversion?: number;
	/** Positive summary: winning variation name for OUTCOME card, e.g. "Sign Up". */
	winningVariationLabel?: string;
	/** Positive: headline Daily Value card amount (e.g. 8580 → $8.58K). */
	positiveDailyValueTotal?: number;
	/** Positive: Daily Value card subtext, e.g. 0.77 → "$0.77 per visitor". */
	positiveRevenuePerVisitor?: number;
	/** Positive: headline Annual Impact (e.g. 3_130_000 → $3.13M). */
	positiveAnnualValueTotal?: number;
	/** Positive: Annual Impact subtext per conversion, e.g. 52.1 → "$52.10 per conversion". */
	positiveRevenuePerConversion?: number;
	/** Positive: CONVERSION card second line, e.g. "0.22% → 0.41%". */
	positiveConversionSubtext?: string;
	/** For Negative: top 2 lifts (name + significance). */
	topLifts?: TopLiftRow[];
	/** For Negative: CVR baseline e.g. "2.1% vs 1.8%". */
	cvrBaseline?: string;
	/** For Inconclusive: visitors per day for time-to-resolve card. */
	visitorsPerDay?: number;
	/** Primary metric significance string e.g. "0.1%" for card display. */
	primarySignificance?: string;
	/** Total visitors for summary meta line (e.g. "4,911 visitors"). */
	totalVisitors?: number;
	/** Control vs variant conversion rates for CONVERSION card subtext. */
	conversionRateControl?: number;
	conversionRateVariant?: number;
	/** Estimated days to reach significance at current traffic. */
	timeToResolveDays?: number;
}

/**
 * Metric card in the summary header (value + optional subtext).
 */
export interface MetricCardValue {
	value: string;
	subtext?: string;
}

/**
 * Single metric card in the summary header (label + value + optional subtext).
 * Used for outcome-specific card layouts (Positive, Negative, Inconclusive).
 */
export interface MetricCard {
	label: string;
	value: string;
	subtext?: string;
	/** Small info affordance beside the label (e.g. Daily Value, Annual Impact). */
	showInfo?: boolean;
}

/** One bullet in Next Steps: bold title + body (matches reference layout). */
export interface SummaryNextStepItem {
	title: string;
	body: string;
}

/** Notable divergences: bold lead-in + supporting copy. */
export interface SummaryDivergenceItem {
	title: string;
	text: string;
}

/**
 * Structured summary payload returned by the chat API for experiment summary messages.
 * Rendered by ExperimentSummaryBlock in Opal chat.
 */
export interface ExperimentSummaryPayload {
	title: string;
	/** e.g. ["On-page change", "4,911 visitors", "29 days"] */
	meta: string[];
	outcome: MetricCardValue;
	conversion: MetricCardValue;
	variance: MetricCardValue;
	timeToRerun: MetricCardValue;
	/** When set, summary shows outcome-specific metric cards instead of fixed four. */
	outcomeType?: ExperimentResultOutcome;
	/** Outcome-specific metric cards (OUTCOME, CONVERSION, DAILY VALUE, etc.). */
	metricCards?: MetricCard[];
	/** Main narrative (displayed as "Key Learning"). */
	keyLearning: string;
	faq: { question: string; answer: string }[];
	/** Segment- or metric-level nuances (displayed as "Notable Divergences"). */
	notableDivergences: SummaryDivergenceItem[];
	/** Next Steps bullets with bold titles. */
	nextStepItems: SummaryNextStepItem[];
	primaryMetricRows: PrimaryOrSecondaryMetricRow[];
	secondaryMetricRows: PrimaryOrSecondaryMetricRow[];
	segmentRows: SegmentRow[];
	crossExperimentRows: CrossExperimentRow[];
	/** Display in footer, e.g. "Updated Mar 16, 2026" */
	updatedAt?: string;
	/** Chips for "What would you like to do next?" */
	suggestionChips?: string[];
}

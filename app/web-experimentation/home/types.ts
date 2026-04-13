// Program Snapshot
export type AlertUrgency = "high" | "medium" | "low";

export interface SnapshotAlert {
	id: string;
	title: string;
	what: string;
	whyItMatters: string;
	recommendedAction: string;
	urgency: AlertUrgency;
}

export interface ExperimentCloseToSignificance {
	id: string;
	name: string;
	description?: string;
	startDate: string;
	primaryMetric: string;
	duration: string;
	daysRemaining: number;
	confidenceCurrent: number;
	resultsUrl: string;
}

export interface ExperimentAtRisk {
	id: string;
	name: string;
	description?: string;
	startDate: string;
	primaryMetric: string;
	duration: string;
	reason: "guardrails" | "sample_ratio_mismatch" | "underpowered";
	urgency: AlertUrgency;
	suggestedAction: string;
	resultsUrl: string;
}

export type ExperimentOutcome = "winning" | "losing" | "inconclusive";

export interface SnapshotExperiment {
	id: string;
	name: string;
	description?: string;
	startDate: string;
	primaryMetric: string;
	duration: string;
	lift: string;
	resultsUrl: string;
}

export interface ProgramSnapshot {
	activeCount: number;
	winningCount: number;
	losingCount: number;
	inconclusiveCount: number;
	winRateOverall: number;
	winRateThisWeek: number;
	winningExperiments: SnapshotExperiment[];
	losingExperiments: SnapshotExperiment[];
	inconclusiveExperiments: SnapshotExperiment[];
	closeToSignificance: ExperimentCloseToSignificance[];
	atRisk: ExperimentAtRisk[];
	alerts: SnapshotAlert[];
}

// Program Health
export type TimeRange = "30" | "90" | "365";

export interface HealthBreakdown {
	dimension: string;
	value: string;
	experimentCount: number;
	winRate: number;
	avgLift?: number;
}

export interface ProgramHealth {
	timeRange: TimeRange;
	totalExperiments: number;
	winRateTrend: number[];
	avgLiftWinners: number;
	percentInconclusive: number;
	experimentsPerMonth: number;
	estimatedIncrementalImpact?: string;
	breakdownsByPage: HealthBreakdown[];
	breakdownsByMetric: HealthBreakdown[];
	breakdownsByAudience: HealthBreakdown[];
	aiSummary: string;
}

// Learnings
/** Key learnings from a single test run, shown when the parent learning row is expanded. */
export interface LearningExperimentRun {
	experimentId: string;
	/** Bullet points extracted from this test run */
	keyLearnings: string[];
	/** Tags for this run (shown in the expanded row) */
	tags?: string[];
}

/** Learnings table time filter (matches last activity on the learning record). */
export type LearningsPeriod = "30d" | "3mo" | "6mo" | "1y" | "all";

export interface Learning {
	id: string;
	statement: string;
	themes: string[];
	relatedExperimentIds: string[];
	tags: string[];
	/** ISO date — last time this learning was observed/updated (used for period filter). */
	lastActivityAt: string;
	/** Per-run details for expanded rows (experiment name resolved via snapshot) */
	experimentsByRun?: LearningExperimentRun[];
}

// Opportunity
export interface FunnelStage {
	name: string;
	count: number;
	dropOffPercent: number;
}

export interface Opportunity {
	id: string;
	title: string;
	dataSummary: string;
	whyItMatters: string;
	suggestedTestAngles: string[];
}

// Test idea
export interface TestIdea {
	id: string;
	title: string;
	rationale: string;
	relatedExperimentIds: string[];
	predictedImpact: string;
	confidenceScore: number;
}

// Hypothesis
export interface HypothesisDraft {
	problemStatement: string;
	targetAudience: string;
	proposedChange: string;
	expectedBehavioralShift: string;
	primaryMetric: string;
	guardrailMetrics: string[];
	predictedImpact: string;
	confidenceLevel: string;
}

// Test plan
export interface TestPlanDraft {
	hypothesis: string;
	variants: string[];
	audienceTargeting: string;
	trafficAllocation: number;
	durationEstimate: string;
	sampleSize: string;
	dependencies: string;
	risks: string;
	rolloutPlan: string;
	decisionCriteria: string;
}

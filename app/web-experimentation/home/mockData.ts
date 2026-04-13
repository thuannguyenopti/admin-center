import type {
	ProgramSnapshot,
	ProgramHealth,
	Learning,
	FunnelStage,
	Opportunity,
	TestIdea,
	TimeRange,
	SnapshotExperiment,
} from "./types";

/** Demo dates relative to “today” when the dashboard is viewed (filter logic uses current date). */

const mockWinning: SnapshotExperiment[] = [
	{ id: "w1", name: "Pricing page CTA test", description: "Tested primary vs secondary CTA copy and placement on the pricing page.", startDate: "Jan 2, 2026", primaryMetric: "Conversion rate", duration: "14 days", lift: "+12%", resultsUrl: "#" },
	{ id: "w2", name: "Checkout flow copy", description: "Simplified checkout step labels and microcopy to reduce friction.", startDate: "Jan 5, 2026", primaryMetric: "Signup rate", duration: "10 days", lift: "+8%", resultsUrl: "#" },
	{ id: "w3", name: "Hero banner variant B", description: "New hero image and headline to improve relevance for returning visitors.", startDate: "Jan 8, 2026", primaryMetric: "Revenue per visit", duration: "12 days", lift: "+5%", resultsUrl: "#" },
	{ id: "w4", name: "Form field reduction", description: "Reduced signup form from 8 to 4 fields to improve completion.", startDate: "Jan 10, 2026", primaryMetric: "Completion rate", duration: "7 days", lift: "+15%", resultsUrl: "#" },
];

const mockLosing: SnapshotExperiment[] = [
	{ id: "l1", name: "Navigation menu test", description: "Tested condensed vs expanded main navigation; condensed underperformed.", startDate: "Jan 3, 2026", primaryMetric: "Click-through rate", duration: "14 days", lift: "-3%", resultsUrl: "#" },
	{ id: "l2", name: "Popup timing experiment", description: "Earlier popup (2s) vs control (5s); earlier timing hurt conversions.", startDate: "Jan 6, 2026", primaryMetric: "Conversion rate", duration: "10 days", lift: "-5%", resultsUrl: "#" },
];

const mockInconclusive: SnapshotExperiment[] = [
	{ id: "i1", name: "Social proof placement", description: "Above vs below fold social proof; needs more traffic for significance.", startDate: "Jan 9, 2026", primaryMetric: "Conversion rate", duration: "5 days", lift: "—", resultsUrl: "#" },
	{ id: "i2", name: "Headline variant A", description: "Emotional vs rational headline; still collecting data.", startDate: "Jan 11, 2026", primaryMetric: "Engagement", duration: "3 days", lift: "—", resultsUrl: "#" },
	{ id: "i3", name: "Button color test", description: "Green vs blue primary button; early stage.", startDate: "Jan 12, 2026", primaryMetric: "CTR", duration: "2 days", lift: "—", resultsUrl: "#" },
	{ id: "i4", name: "Trust badge position", description: "Footer vs near CTA trust badges.", startDate: "Jan 13, 2026", primaryMetric: "Conversion rate", duration: "1 day", lift: "—", resultsUrl: "#" },
	{ id: "i5", name: "Discount copy test", description: "Percentage off vs dollar amount in promo messaging.", startDate: "Jan 13, 2026", primaryMetric: "Revenue", duration: "1 day", lift: "—", resultsUrl: "#" },
	{ id: "i6", name: "Image carousel vs static", description: "Single hero image vs auto-rotating carousel on product page.", startDate: "Jan 13, 2026", primaryMetric: "Time on page", duration: "2 days", lift: "—", resultsUrl: "#" },
];

export const mockProgramSnapshot: ProgramSnapshot = {
	activeCount: 12,
	winningCount: mockWinning.length,
	losingCount: mockLosing.length,
	inconclusiveCount: mockInconclusive.length,
	winRateOverall: 58,
	winRateThisWeek: 67,
	winningExperiments: mockWinning,
	losingExperiments: mockLosing,
	inconclusiveExperiments: mockInconclusive,
	closeToSignificance: [
		{
			id: "e1",
			name: "Pricing page CTA test",
			description: "Primary vs secondary CTA copy; within a few days of reliable results.",
			startDate: "Jan 2, 2026",
			primaryMetric: "Conversion rate",
			duration: "14 days",
			daysRemaining: 3,
			confidenceCurrent: 89,
			resultsUrl: "#",
		},
		{
			id: "e2",
			name: "Checkout flow copy",
			description: "Simplified step labels; approaching significance.",
			startDate: "Jan 5, 2026",
			primaryMetric: "Signup rate",
			duration: "10 days",
			daysRemaining: 5,
			confidenceCurrent: 85,
			resultsUrl: "#",
		},
		{
			id: "e3",
			name: "Hero banner variant B",
			description: "New hero image and headline; needs a bit more data.",
			startDate: "Jan 8, 2026",
			primaryMetric: "Revenue per visit",
			duration: "12 days",
			daysRemaining: 7,
			confidenceCurrent: 82,
			resultsUrl: "#",
		},
	],
	atRisk: [
		{
			id: "e4",
			name: "Signup form layout",
			description: "Traffic split is 55/45 instead of 50/50; may invalidate results.",
			startDate: "Jan 4, 2026",
			primaryMetric: "Signup rate",
			duration: "10 days",
			reason: "sample_ratio_mismatch",
			urgency: "high",
			suggestedAction: "Review traffic allocation and check for implementation issues.",
			resultsUrl: "#",
		},
		{
			id: "e5",
			name: "Navigation menu test",
			description: "Sample size below target; results may be unreliable.",
			startDate: "Jan 3, 2026",
			primaryMetric: "Click-through rate",
			duration: "14 days",
			reason: "underpowered",
			urgency: "medium",
			suggestedAction: "Extend duration or increase traffic to reach target sample size.",
			resultsUrl: "#",
		},
	],
	alerts: [
		{
			id: "a1",
			title: "Sample ratio mismatch detected",
			what: "Signup form layout experiment shows a 55/45 split instead of 50/50.",
			whyItMatters: "This can invalidate results and indicate a technical or targeting issue.",
			recommendedAction: "Pause the experiment and verify traffic allocation configuration.",
			urgency: "high",
		},
		{
			id: "a2",
			title: "3 experiments close to significance",
			what: "Pricing page CTA, Checkout copy, and Hero banner are within 3–7 days of reliable results.",
			whyItMatters: "You can plan follow-up tests or rollout decisions soon.",
			recommendedAction: "Review decision criteria and stakeholder alignment for these experiments.",
			urgency: "medium",
		},
	],
};

function buildHealthForRange(range: TimeRange): ProgramHealth {
	const totals: Record<TimeRange, number> = { "30": 24, "90": 68, "365": 312 };
	return {
		timeRange: range,
		totalExperiments: totals[range],
		winRateTrend: [52, 55, 58, 54, 58],
		avgLiftWinners: 12.4,
		percentInconclusive: 28,
		experimentsPerMonth: range === "30" ? 24 : range === "90" ? 23 : 26,
		estimatedIncrementalImpact: "+4.2% conversion (estimated)",
		breakdownsByPage: [
			{ dimension: "Page", value: "Pricing", experimentCount: 14, winRate: 64, avgLift: 11 },
			{ dimension: "Page", value: "Checkout", experimentCount: 10, winRate: 50, avgLift: 8 },
			{ dimension: "Page", value: "Home", experimentCount: 18, winRate: 56, avgLift: 14 },
		],
		breakdownsByMetric: [
			{ dimension: "Metric", value: "Conversion rate", experimentCount: 32, winRate: 59 },
			{ dimension: "Metric", value: "Revenue per visit", experimentCount: 18, winRate: 55 },
			{ dimension: "Metric", value: "Signup rate", experimentCount: 12, winRate: 62 },
		],
		breakdownsByAudience: [
			{ dimension: "Audience", value: "Returning users", experimentCount: 20, winRate: 62 },
			{ dimension: "Audience", value: "First-time visitors", experimentCount: 22, winRate: 52 },
		],
		aiSummary:
			"Most wins are occurring on pricing pages. Experiments targeting returning users outperform first-time users.",
	};
}

export function getProgramHealth(timeRange: TimeRange): ProgramHealth {
	return buildHealthForRange(timeRange);
}

export const mockLearnings: Learning[] = [
	{
		id: "l1",
		statement: "Urgency messaging improved conversion in 4 of 5 pricing page tests.",
		themes: ["urgency", "pricing"],
		relatedExperimentIds: ["e1", "e2", "e3", "e4", "e5"],
		tags: ["pricing", "copy", "conversion"],
		lastActivityAt: "2026-03-10T12:00:00.000Z",
		experimentsByRun: [
			{
				experimentId: "e1",
				tags: ["urgency", "pricing", "CTA"],
				keyLearnings: [
					"Countdown and “limited time” copy lifted primary CTA clicks by 9% vs control.",
					"Urgency performed best on returning visitors; first-time visitors saw a smaller lift.",
				],
			},
			{
				experimentId: "e2",
				tags: ["checkout", "microcopy"],
				keyLearnings: [
					"Simplified step labels reduced perceived effort; fewer drop-offs at step 2.",
					"Pairing urgency in email with calmer on-page copy avoided fatigue.",
				],
			},
			{
				experimentId: "e3",
				tags: ["hero", "creative"],
				keyLearnings: [
					"Hero urgency line + social proof below the fold beat urgency-only variants.",
					"Mobile: shorter headline with urgency subline outperformed long headline.",
				],
			},
			{
				experimentId: "e4",
				tags: ["forms", "friction"],
				keyLearnings: [
					"Sample ratio drift limited confidence; treat urgency lift as directional only.",
					"Guardrail: signup starts up but completions flat—needs follow-up test.",
				],
			},
			{
				experimentId: "e5",
				tags: ["nav", "segmentation"],
				keyLearnings: [
					"Condensed nav reduced discovery of pricing; urgency on pricing page could not compensate.",
					"Recommendation: keep expanded nav for evaluation-stage users.",
				],
			},
		],
	},
	{
		id: "l2",
		statement: "Reducing form fields from 8 to 5 consistently lifted completion rate by 15–22%.",
		themes: ["friction", "forms"],
		relatedExperimentIds: ["e2", "e4"],
		tags: ["forms", "friction", "signup"],
		lastActivityAt: "2026-01-18T12:00:00.000Z",
		experimentsByRun: [
			{
				experimentId: "e2",
				tags: ["forms", "checkout"],
				keyLearnings: [
					"Removing optional company and title fields drove the largest completion gain.",
					"Error messaging placement mattered as much as field count.",
				],
			},
			{
				experimentId: "e4",
				tags: ["forms", "A/B"],
				keyLearnings: [
					"5-field variant held +18% completion in a clean 50/50 split (monitor traffic allocation).",
					"International users benefited more from fewer fields than domestic.",
				],
			},
		],
	},
	{
		id: "l3",
		statement: "Social proof above the fold had mixed results; segment by device (stronger on mobile).",
		themes: ["social proof", "personalization"],
		relatedExperimentIds: ["e3"],
		tags: ["social-proof", "mobile", "above-fold"],
		lastActivityAt: "2025-10-05T12:00:00.000Z",
		experimentsByRun: [
			{
				experimentId: "e3",
				tags: ["social-proof", "mobile", "hero"],
				keyLearnings: [
					"Above-the-fold testimonials lifted mobile RPV; desktop flat vs control.",
					"Star rating + short quote outperformed logo wall on mobile.",
					"Inconclusive overall—extend run or segment by device before rollout.",
				],
			},
		],
	},
];

export const mockFunnelStages: FunnelStage[] = [
	{ name: "Landing", count: 10000, dropOffPercent: 0 },
	{ name: "Product view", count: 7200, dropOffPercent: 28 },
	{ name: "Add to cart", count: 3600, dropOffPercent: 50 },
	{ name: "Checkout start", count: 1800, dropOffPercent: 50 },
	{ name: "Purchase", count: 1260, dropOffPercent: 30 },
];

export const mockOpportunities: Opportunity[] = [
	{
		id: "o1",
		title: "Product view → Add to cart (50% drop-off)",
		dataSummary: "Half of users who view a product do not add to cart.",
		whyItMatters: "Largest drop-off in the funnel; improving here has high impact potential.",
		suggestedTestAngles: ["Urgency", "Simplify CTA", "Trust signals"],
	},
	{
		id: "o2",
		title: "Checkout start → Purchase (30% drop-off)",
		dataSummary: "30% of users who start checkout do not complete.",
		whyItMatters: "Direct revenue impact; small improvements yield significant gains.",
		suggestedTestAngles: ["Fewer steps", "Guest checkout", "Security"],
	},
	{
		id: "o3",
		title: "Landing → Product view (28% drop-off)",
		dataSummary: "Over a quarter of landing page visitors leave without viewing a product.",
		whyItMatters: "First conversion step; improving relevance here increases downstream funnel.",
		suggestedTestAngles: ["Personalization", "Hero CTA", "Social proof"],
	},
	{
		id: "o4",
		title: "Add to cart → Checkout start (50% drop-off)",
		dataSummary: "Half of users who add to cart abandon before starting checkout.",
		whyItMatters: "Friction or distraction at a critical moment; tests on cart page often win.",
		suggestedTestAngles: ["Persistent cart", "One-click checkout", "Shipping preview"],
	},
	{
		id: "o5",
		title: "Purchase completion (30% drop-off)",
		dataSummary: "Some users who reach the final step do not complete purchase.",
		whyItMatters: "Last-mile optimization; trust and clarity here recover otherwise lost revenue.",
		suggestedTestAngles: ["Security badges", "Guarantee", "Support visibility"],
	},
	{
		id: "o6",
		title: "Mobile vs desktop conversion gap",
		dataSummary: "Mobile conversion is 40% lower than desktop across the funnel.",
		whyItMatters: "Growing mobile traffic; closing this gap can unlock significant revenue.",
		suggestedTestAngles: ["Mobile UX", "One-tap checkout", "Simplified forms"],
	},
	{
		id: "o7",
		title: "Return visitor drop-off (Landing)",
		dataSummary: "Returning users show higher bounce at landing than first-time visitors.",
		whyItMatters: "Retargeting and personalization opportunities; often under-tested.",
		suggestedTestAngles: ["Welcome back", "Personalized hero", "Saved cart CTA"],
	},
	{
		id: "o8",
		title: "Cross-sell at Add to cart",
		dataSummary: "Low attachment rate for recommended products at add-to-cart.",
		whyItMatters: "Upsell at high-intent moment; tests here frequently improve AOV.",
		suggestedTestAngles: ["Recommendations", "Bundle offers", "Free shipping threshold"],
	},
];

export const mockTestIdeas: TestIdea[] = [
	{
		id: "ti1",
		title: "Add sticky CTA bar on pricing page",
		rationale: "Past tests showed 12% lift with larger CTAs; heatmaps show low visibility of current CTA.",
		relatedExperimentIds: ["e1", "e2"],
		predictedImpact: "+8–12% click-through to signup",
		confidenceScore: 0.85,
	},
	{
		id: "ti2",
		title: "Reduce checkout form from 6 to 4 fields",
		rationale: "Learnings show 15–22% lift when reducing form fields; checkout has highest drop-off.",
		relatedExperimentIds: ["e2", "e4"],
		predictedImpact: "+10–15% checkout completion",
		confidenceScore: 0.78,
	},
];

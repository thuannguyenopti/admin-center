import type { ExperimentSummaryPayload, ExperimentResultsData, MetricCard } from "./types";
import type { ExperimentResultOutcome } from "./types";
import { formatCompactCurrency, formatCompactNumber } from "./mockResults";

function buildMetaLine(results: ExperimentResultsData): string[] {
	const parts: string[] = [];
	if (results.experimentType) parts.push(results.experimentType);
	if (results.totalVisitors != null) {
		parts.push(`${results.totalVisitors.toLocaleString("en-US")} visitors`);
	}
	if (results.duration) parts.push(results.duration);
	return parts;
}

/** OUTCOME card subtext from primary significance (e.g. "<1% Significance"). */
function formatSignificanceForOutcomeCard(primarySignificance: string | undefined): string {
	if (primarySignificance == null || primarySignificance === "—") return "<1% Significance";
	const n = parseFloat(primarySignificance.replace(/%/g, ""));
	if (!Number.isNaN(n) && n < 1) return "<1% Significance";
	return `${primarySignificance}${primarySignificance.includes("%") ? "" : "%"} Significance`.replace(
		/%%/g,
		"%",
	);
}

/**
 * Classify experiment outcome from results data.
 * Positive/Negative: clear winner; Mixed: opposing signals; Inconclusive: no credible signal.
 */
export function classifyOutcome(results: ExperimentResultsData): ExperimentResultOutcome {
	if (results.overallSignificant) {
		const lift = results.primaryLift ?? "";
		const isNegative = lift.startsWith("-");
		if (results.primarySecondaryOpposing || results.segmentSignificance) {
			return "Mixed";
		}
		return isNegative ? "Negative" : "Positive";
	}
	if (results.segmentSignificance || results.primarySecondaryOpposing) {
		return "Mixed";
	}
	return "Inconclusive";
}

/** Confidence for Positive/Negative: ensure above 95% target. */
function strongConfidence(confidence: number | undefined): number {
	if (confidence == null) return 96;
	return Math.max(95, Math.min(100, confidence));
}

/**
 * Build outcome-specific metric cards for the summary header.
 * Positive: OUTCOME, CONVERSION, DAILY VALUE, ANNUAL IMPACT.
 * Negative: OUTCOME, top 2 lifts, CVR BASELINE.
 * Inconclusive: OUTCOME, CONVERSION, TIME TO RESOLVE.
 * Mixed: not outcome-specific; caller uses default four cards.
 */
function buildMetricCards(
	outcome: ExperimentResultOutcome,
	results: ExperimentResultsData,
): MetricCard[] {
	const confidence = strongConfidence(results.primaryConfidence);
	const confLabel = `Confidence: ${confidence}%`;
	const sig = results.primarySignificance ?? "—";

	switch (outcome) {
		case "Positive": {
			const winner = results.winningVariationLabel ?? "Variant";
			const convSub =
				results.positiveConversionSubtext ??
				(results.conversionRateControl != null && results.conversionRateVariant != null
					? `${results.conversionRateControl.toFixed(3)} → ${results.conversionRateVariant.toFixed(3)} per visitor`
					: `${sig} Significance`);
			const dailyMain =
				results.positiveDailyValueTotal != null
					? formatCompactCurrency(results.positiveDailyValueTotal)
					: formatCompactCurrency(results.dailyValuePerVisitor ?? 0);
			const dailySub =
				results.positiveRevenuePerVisitor != null
					? `$${results.positiveRevenuePerVisitor.toFixed(2)} per visitor`
					: "per visitor";
			const annualMain =
				results.positiveAnnualValueTotal != null
					? formatCompactCurrency(results.positiveAnnualValueTotal)
					: formatCompactCurrency(results.annualImpactPerConversion ?? 0);
			const annualSub =
				results.positiveRevenuePerConversion != null
					? `$${results.positiveRevenuePerConversion.toFixed(2)} per conversion`
					: "per conversion";
			return [
				{ label: "OUTCOME", value: "Positive", subtext: `Winner: '${winner}'` },
				{ label: "CONVERSION", value: results.primaryLift ?? "+0%", subtext: convSub },
				{ label: "DAILY VALUE", value: dailyMain, subtext: dailySub, showInfo: true },
				{ label: "ANNUAL IMPACT", value: annualMain, subtext: annualSub, showInfo: true },
			];
		}
		case "Negative": {
			const lifts = results.topLifts ?? [
				{ name: "Get started", significance: "96% Significance" },
				{ name: "Apply Today", significance: "94% Significance" },
			];
			const cvr = results.cvrBaseline ?? "2.1% vs 1.8%";
			const cards: MetricCard[] = [
				{ label: "OUTCOME", value: "Negative", subtext: confLabel },
				...lifts.slice(0, 2).map((l) => ({
					label: `'${l.name}' lift`,
					value: l.significance,
					subtext: undefined,
				})),
				{ label: "CVR BASELINE", value: cvr, subtext: undefined },
			];
			return cards;
		}
		case "Inconclusive": {
			const lift = results.primaryLift ?? "—";
			const crSub =
				results.conversionRateControl != null && results.conversionRateVariant != null
					? `${results.conversionRateControl.toFixed(3)} → ${results.conversionRateVariant.toFixed(3)} per visitor`
					: `${sig} Significance`;
			const days = results.timeToResolveDays;
			const ttrValue =
				days != null ? `~${days} days` : `At ${formatCompactNumber(results.visitorsPerDay ?? 0)} visitors/day`;
			const vpd =
				results.visitorsPerDay != null
					? `${Math.round(results.visitorsPerDay)} visitors per day`
					: undefined;
			return [
				{
					label: "OUTCOME",
					value: "Inconclusive",
					subtext: formatSignificanceForOutcomeCard(results.primarySignificance),
				},
				{ label: "CONVERSION", value: lift, subtext: crSub },
				{ label: "TIME TO RESOLVE", value: ttrValue, subtext: vpd },
			];
		}
		default:
			return [];
	}
}

/**
 * Base template summary per outcome type. The API merges in title, meta, and
 * appendices rows from the actual ExperimentResultsData.
 */
function buildSummaryFromTemplate(
	outcome: ExperimentResultOutcome,
	results: ExperimentResultsData,
): ExperimentSummaryPayload {
	const templates = mockSummaryTemplatesByOutcome[outcome];
	const metricCards = buildMetricCards(outcome, results);
	const useOutcomeSpecificCards = outcome === "Positive" || outcome === "Negative" || outcome === "Inconclusive";
	return {
		title: `Summary of ${results.experimentName}`,
		meta: buildMetaLine(results),
		outcome: templates.outcome,
		conversion: templates.conversion,
		variance: templates.variance,
		timeToRerun: templates.timeToRerun,
		outcomeType: useOutcomeSpecificCards ? outcome : undefined,
		metricCards: useOutcomeSpecificCards ? metricCards : undefined,
		keyLearning: templates.keyLearning,
		faq: templates.faq,
		notableDivergences: templates.notableDivergences,
		nextStepItems: templates.nextStepItems,
		primaryMetricRows: results.primaryMetrics,
		secondaryMetricRows: results.secondaryMetrics,
		segmentRows: results.segments,
		crossExperimentRows: results.crossExperiments ?? [],
		updatedAt: typeof document !== "undefined" ? `Updated ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "Updated Mar 16, 2026",
		suggestionChips: ["Create summary deck", "Evaluate next test ideas"],
	};
}

/** Template content per outcome (value/subtext and narrative). Rows are filled from results. */
const mockSummaryTemplatesByOutcome: Record<
	ExperimentResultOutcome,
	Omit<ExperimentSummaryPayload, "title" | "meta" | "primaryMetricRows" | "secondaryMetricRows" | "segmentRows" | "crossExperimentRows" | "updatedAt" | "suggestionChips">
> = {
	Inconclusive: {
		outcome: { value: "Inconclusive", subtext: "confidence 78%" },
		conversion: { value: "8.3% + 0.4%", subtext: "95% confidence" },
		variance: { value: "0%", subtext: "Target 10%" },
		timeToRerun: { value: "-78 days", subtext: "No traffic for significance" },
		keyLearning:
			"The variant shows a +13.5% lift and looks promising directionally, but with a wide confidence interval (roughly −39.5% to +63.4%) the read is still inconclusive—you have a traffic problem, not a signal problem. Segment trends are worth watching: mobile is directionally up (~+18%) while desktop is nearly flat, which suggests the change resonates more on small screens.",
		faq: [
			{
				question: "What has changed?",
				answer:
					'The heading moved from a passive label ("Featured Careers") to an explicit instruction ("Click a role to view tech openings"), making the interaction model obvious.',
			},
			{
				question: "Why did it move?",
				answer:
					"Explicit labeling reduces ambiguity and cognitive load for users who did not realize roles were clickable, which can lift engagement on the hero.",
			},
			{
				question: "Why is it inconclusive?",
				answer:
					"Daily traffic is relatively low for the effect size we are trying to detect, so the credible interval stays wide and we cannot rule out noise.",
			},
			{
				question: "What could change this outcome?",
				answer:
					"A sustained spike in qualified traffic (for example from paid or seasonal campaigns) would shorten time-to-significance and tighten the interval.",
			},
			{
				question: "How does this test compare to other tests?",
				answer:
					"Prior headline and hero tests on this URL were also under-powered; pattern-wise, copy clarifications tend to help mobile more than desktop here.",
			},
		],
		notableDivergences: [
			{
				title: "Mobile leading, desktop flat",
				text: "The variant is trending favorably on mobile (~+18% directional) while desktop is essentially flat—worth validating in a follow-up with mobile-first creative.",
			},
			{
				title: "New users underperforming",
				text: "New-user segments show only about +1% lift at ~20% confidence; treat as exploratory until sample sizes grow.",
			},
			{
				title: "Paid acquisition slightly down",
				text: "Paid acquisition users are slightly down (~−2%) at ~35% confidence—not decisive, but monitor if you scale spend.",
			},
		],
		nextStepItems: [
			{
				title: "Recommendation: Stop the test",
				body: "Ship as a UX best practice if the change is low risk, or roll back and try a bolder variant—avoid running indefinitely without power.",
			},
			{
				title: "What to consider for next test",
				body: "On lower-traffic surfaces, test larger jumps so the minimum detectable effect is achievable with the visitors you actually get.",
			},
		],
	},
	Positive: {
		outcome: { value: "Positive", subtext: "clear winner" },
		conversion: { value: "+85.6%", subtext: "0.22% → 0.41%" },
		variance: { value: "0%", subtext: "Target 10%" },
		timeToRerun: { value: "N/A", subtext: "Test concluded" },
		keyLearning:
			"Action-oriented copy wins: replacing passive talent-community language with a direct “Sign Up” CTA produced an ~86% lift at ~90% statistical significance. The effect is economically meaningful (see Daily Value and Annual Impact cards). Recommendation: ship the “Sign Up” variation as the default, then watch downstream funnel and quality guardrails for a short stabilization window.",
		notableDivergences: [
			{
				title: "Mobile vs. Desktop",
				text: "Mobile led with roughly +104% lift versus ~+61% on desktop—likely because shorter, imperative copy scans faster on small screens and reduces ambiguity in the hero.",
			},
			{
				title: "Returning vs. New visitors",
				text: "Returning visitors showed about 2× the lift of new visitors (~+112% vs ~+41%), suggesting familiarity with the page makes the clearer CTA especially effective.",
			},
			{
				title: "Traffic source",
				text: "Paid and referral traffic barely moved (~+18%, not statistically significant)—organic and direct visitors drove most of the measured lift.",
			},
		],
		nextStepItems: [
			{
				title: "Recommendation: Ship",
				body: "Hardcode the winning “Sign Up” variation (or equivalent) in production, remove the experiment split, and snapshot the final readout for stakeholders.",
			},
			{
				title: "What to consider for next test",
				body: "Layer in downstream guardrails (activation, retention, or lead quality) and test adjacent copy blocks so wins here do not create friction later in the funnel.",
			},
		],
		faq: [
			{
				question: "What has changed?",
				answer:
					"The hero/talent module now uses explicit sign-up oriented copy and a stronger primary CTA label (“Sign Up”) instead of softer community framing.",
			},
			{
				question: "Why did it work?",
				answer:
					"Users get a clear action and outcome: the CTA matches intent on this page and reduces interpretive work at the moment of decision.",
			},
			{
				question: "What didn't move?",
				answer:
					"Some paid/referral cohorts showed only small, noisy movement—treat those slices as inconclusive unless you increase sample or isolate creative.",
			},
			{
				question: "How does this test compare to other tests?",
				answer:
					"Magnitude is larger than typical micro-copy tweaks on this surface; treat it as a benchmark for future headline and CTA experiments here.",
			},
		],
	},
	Negative: {
		outcome: { value: "Negative", subtext: "clear loser" },
		conversion: { value: "-12.4%", subtext: "95% confidence" },
		variance: { value: "0%", subtext: "Target 10%" },
		timeToRerun: { value: "N/A", subtext: "Test concluded" },
		keyLearning:
			"The variant underperformed control with statistical significance. Treat this as a learning: roll back, capture why the change hurt conversion, and avoid repeating the same pattern in future experiments.",
		faq: [
			{
				question: "What has changed?",
				answer: "The experiment introduced a visible change in the experience; the primary metric moved down versus control beyond what chance would explain.",
			},
			{
				question: "Why did it lose?",
				answer: "Common drivers are added friction, diluted focus, or mismatch with user expectations on this page.",
			},
			{
				question: "What should we do next?",
				answer: "Revert to control, document the failure mode, and feed it into the next hypothesis.",
			},
		],
		notableDivergences: [
			{
				title: "Loss concentrated on key funnel step",
				text: "The drop maps most clearly to the primary CTA path rather than passive browsing—suggests the change disrupted intentful users.",
			},
			{
				title: "Time on page also down",
				text: "Secondary metrics moved with the primary, reinforcing that the experience got worse, not just noisier.",
			},
		],
		nextStepItems: [
			{
				title: "Recommendation: Roll back",
				body: "Return to the control experience, validate metrics recovered, and socialize the learning so the same approach is not retested blindly.",
			},
			{
				title: "What to consider for next test",
				body: "Try a smaller, more targeted change that addresses the likely friction point without altering the whole module.",
			},
		],
	},
	Mixed: {
		outcome: { value: "Mixed", subtext: "opposing signals" },
		conversion: { value: "+2.1%", subtext: "82% confidence" },
		variance: { value: "0%", subtext: "Target 10%" },
		timeToRerun: { value: "N/A", subtext: "Test concluded" },
		keyLearning:
			"The headline result is modest, but segments and secondary metrics disagree: some audiences show real lift while others decline, or the primary metric improved at the expense of another goal. There is signal, but no single ship/rollback call without segment-level judgment.",
		faq: [
			{
				question: "What has changed?",
				answer: "Overall movement is small, but slice the data and you see real differences by segment or by secondary KPIs.",
			},
			{
				question: "Why is it mixed?",
				answer: "Audiences use the page differently; a change can help one segment and hurt another, or optimize one metric while dragging another.",
			},
			{
				question: "What should we do next?",
				answer: "Decide whether segment-level rollout is viable; if not, run a focused follow-up with a sharper hypothesis.",
			},
		],
		notableDivergences: [
			{
				title: "Winning and losing segments",
				text: "Some segments show meaningful lift while others are flat or negative—aggregate numbers hide that tension.",
			},
			{
				title: "Primary vs secondary tradeoff",
				text: "Check whether the primary KPI improved while a guardrail or secondary KPI worsened; that often defines the business decision.",
			},
		],
		nextStepItems: [
			{
				title: "Recommendation: Segment-level decision",
				body: "Where policy allows, ship for segments that won and hold back where the variant hurt; otherwise document the tradeoff explicitly.",
			},
			{
				title: "What to consider for next test",
				body: "Pre-specify mixed-result rules, then design a test aimed at the segment or metric where the story was strongest.",
			},
		],
	},
};

/**
 * Build a full ExperimentSummaryPayload for the given results and outcome.
 * Used by the chat API after classifying outcome.
 */
export function buildExperimentSummaryPayload(
	results: ExperimentResultsData,
	outcome: ExperimentResultOutcome,
): ExperimentSummaryPayload {
	return buildSummaryFromTemplate(outcome, results);
}

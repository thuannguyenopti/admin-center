import { getMockExperimentResults } from "../../web-experimentation/optimizations/[id]/results/mockResults";
import {
	buildExperimentSummaryPayload,
	classifyOutcome,
} from "../../web-experimentation/optimizations/[id]/results/mockSummaries";
import { EXPERIMENT_SUMMARY_STEP_LABELS } from "../../web-experimentation/optimizations/[id]/results/summaryStepLabels";
import type { ExperimentSummaryPayload } from "../../web-experimentation/optimizations/[id]/results/types";

export function getExperimentSummary(optimizationId: string): {
	steps: readonly string[];
	summary: ExperimentSummaryPayload;
} {
	const results = getMockExperimentResults(optimizationId);
	const outcome = classifyOutcome(results);
	const summary = buildExperimentSummaryPayload(results, outcome);
	return { steps: EXPERIMENT_SUMMARY_STEP_LABELS, summary };
}

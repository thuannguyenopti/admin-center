export type OptimizationStatus = "Not Started" | "Running" | "Paused" | "Archived" | "Concluded";
export type OptimizationType =
	| "A/B Test"
	| "Multivariate Test"
	| "Multi-armed Bandit"
	| "Personalization Campaign"
	| "Stats Accelerator";

export interface Optimization {
	id: string;
	name: string;
	description: string;
	type: OptimizationType;
	status: OptimizationStatus;
	modified: string;
}

export const mockOptimizations: Optimization[] = [
	{
		id: "1",
		name: 'Homepage Hero: "Train for Your First Triathlon" Messaging',
		description:
			"Tested a beginner-focused hero message and CTA (“Start Your First Triathlon Plan”) against the existing performance-oriented messaging to see if it increases training plan sign-ups among new visitors.",
		type: "A/B Test",
		status: "Concluded",
		modified: "Feb 3, 2026",
	},
	{
		id: "2",
		name: "Talent Community Verbiage",
		description:
			"Tested direct “Sign Up” hero copy against softer talent-community framing to increase sign-ups from the careers landing experience.",
		type: "A/B Test",
		status: "Concluded",
		modified: "Feb 10, 2026",
	},
	{
		id: "3",
		name: "Race Calendar Filters: Distance-First vs Location-First",
		description:
			"Tested prioritizing race distance selection (Sprint, Olympic, Half, Ironman) before location to see if athletes discover relevant races faster.",
		type: "A/B Test",
		status: "Concluded",
		modified: "Feb 14, 2026",
	},
];

export function getOptimizationById(id: string): Optimization | undefined {
	return mockOptimizations.find((o) => o.id === id);
}

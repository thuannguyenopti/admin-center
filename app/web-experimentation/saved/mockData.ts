export type AudienceType = "Long Ride Training" | "Speed & Power" | "Recreational" | "Recovery";

export interface Audience {
	id: string;
	name: string;
	description: string;
	type: AudienceType;
	addedDate: string;
	problem?: string;
	hypothesis?: string;
	basedOn?: string[];
	whyThisWillWork?: string;
}

export const mockAudiences: Audience[] = [
	{
		id: "1",
		name: "Optimize Hero CTA Button",
		description:
			"Increase CTA visibility with a larger, higher contrast button and urgency driven copy to drive more clicks",
		type: "Long Ride Training",
		addedDate: "Jan 13, 2026",
		problem: "62% of users abandon the form before completion (session recording data).",
		hypothesis:
			"Adding a sticky CTA bar that remains visible while scrolling on mobile will reduce friction in the conversion path and increase mobile conversion rate by making the action always accessible.",
		basedOn: [
			"Past test: Larger CTA - 12% lift",
			"Heatmap analysis showing low CTA visibility",
			"Industry benchmark comparison",
		],
		whyThisWillWork:
			"Based on past similar tests that showed 12% lift with larger CTAs, and heatmap data showing users focus on hero area but miss current Get Test Ideas. Industry best practices also suggest high-contrast CTAs perform 2x better.",
	},
	{
		id: "2",
		name: "Add Social Proof Above Fold",
		description:
			"Build immediate trust with customer logos and testimonials displayed prominently on initial page view",
		type: "Long Ride Training",
		addedDate: "Jan 13, 2026",
	},
	{
		id: "3",
		name: "Add Exit-Intent Popup",
		description: "Capture abandoning visitors with a popup offering a discount",
		type: "Long Ride Training",
		addedDate: "Jan 13, 2026",
	},
	{
		id: "4",
		name: "Surface Registration Count in Header",
		description: "Show 'X people registered' near the hero to build trust and encourage sign-ups",
		type: "Long Ride Training",
		addedDate: "Jan 13, 2026",
	},
];

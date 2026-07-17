// Real photography already in the repo, reassigned so every canvas surface
// shows a genuinely different shot instead of one photo reused everywhere.
export const IMG = {
	confettiFinish: "/boston-marathon-hero.png",
	communityCircle: "/boston-marathon-community.png",
	bridgeRunner: "/cmp/assets/workshop/blog-hero.png",
	leadRunnerSquare: "/cmp/assets/workshop/updated-square.png",
	leadRunnerPortrait: "/cmp/assets/workshop/editor-updated.png",
} as const;

export type ImageSlotId =
	| "blog-hero"
	| "social-linkedin"
	| "social-reel"
	| "social-facebook"
	| "email-hero";

export const SLOT_META: Record<
	ImageSlotId,
	{ altText: string; createdLabel: string; defaultImage: string; title: string }
> = {
	"blog-hero": {
		title: "Boston Marathon Blog Hero",
		createdLabel: "Created Jan 15, 2026",
		altText: "Runners crossing the Boston Marathon finish line under a shower of confetti",
		defaultImage: IMG.confettiFinish,
	},
	"social-linkedin": {
		title: "BostonMarathon_LinkedIn 1:1",
		createdLabel: "Created Jan 15, 2026",
		altText: "Aerial shot of the lead runner pulling ahead of the pack on race day",
		defaultImage: IMG.leadRunnerSquare,
	},
	"social-reel": {
		title: "BostonMarathon_Reel 9:16",
		createdLabel: "Created Jan 15, 2026",
		altText: "Vertical crop of the lead runner breaking away from the pack",
		defaultImage: IMG.leadRunnerPortrait,
	},
	"social-facebook": {
		title: "BostonMarathon_Facebook 16:9",
		createdLabel: "Created Jan 15, 2026",
		altText: "Runners crossing the Boston Marathon finish line under a shower of confetti",
		defaultImage: IMG.confettiFinish,
	},
	"email-hero": {
		title: "Boston Marathon Email Hero",
		createdLabel: "Created Jan 15, 2026",
		altText: "Runner training at sunrise for Stride's Boston Marathon 2026 campaign",
		defaultImage: IMG.bridgeRunner,
	},
};

export type ImageOverrides = Partial<Record<ImageSlotId, string>>;

export function resolveSlotImage(slot: ImageSlotId, overrides: ImageOverrides): string {
	return overrides[slot] ?? SLOT_META[slot].defaultImage;
}

// Every rectangular-safe real photo available in the workshop. Run Now
// (CampaignWorkshopCanvas.runQueuedEdits) cycles a queued slot to whichever
// of these isn't already showing elsewhere, simulating a regenerated image.
// `communityCircle` is excluded — its circular alpha mask only reads
// correctly at the fixed circular placement used in BlogPost.tsx, not as a
// generic object-fit:cover swap into an arbitrary rectangular slot.
export const IMAGE_LIBRARY: { id: string; label: string; src: string }[] = [
	{ id: "confetti-finish", label: "Finish Line Confetti", src: IMG.confettiFinish },
	{ id: "bridge-runner", label: "Sunrise Solo Run", src: IMG.bridgeRunner },
	{ id: "lead-runner-square", label: "Breaking Away (Square)", src: IMG.leadRunnerSquare },
	{ id: "lead-runner-portrait", label: "Breaking Away (Portrait)", src: IMG.leadRunnerPortrait },
];

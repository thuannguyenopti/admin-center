export const IMG = {
	hero: "/cmp/assets/workshop/blog-hero.png",
	socialSquare: "/cmp/assets/workshop/blog-hero.png",
	socialStory: "/cmp/assets/workshop/blog-hero.png",
	socialWide: "/cmp/assets/workshop/blog-hero.png",
	editorOriginal: "/cmp/assets/workshop/editor-original.png",
	editorUpdated: "/cmp/assets/workshop/editor-updated.png",
	updatedSquare: "/cmp/assets/workshop/updated-square.png",
} as const;

// Every editable image in the workshop is its own slot so editing one asset
// never silently changes the others — previously a single global
// `assetsUpdated` boolean drove every image at once.
export type ImageSlotId =
	| "blog-hero"
	| "social-linkedin"
	| "social-reel"
	| "social-facebook"
	| "email-hero";

export const SLOT_META: Record<
	ImageSlotId,
	{ altText: string; createdLabel: string; defaultImage: string; title: string; updatedImage: string }
> = {
	"blog-hero": {
		title: "Boston Marathon Blog Hero",
		createdLabel: "Created Jan 15, 2026",
		altText: "Runner training at sunrise for Stride's Boston Marathon 2026 campaign",
		defaultImage: IMG.hero,
		updatedImage: IMG.editorUpdated,
	},
	"social-linkedin": {
		title: "BostonMarathon_LinkedIn 1:1",
		createdLabel: "Created Jan 15, 2026",
		altText: "Runner training at sunrise for Stride's Boston Marathon 2026 campaign",
		defaultImage: IMG.socialSquare,
		updatedImage: IMG.updatedSquare,
	},
	"social-reel": {
		title: "BostonMarathon_Reel 9:16",
		createdLabel: "Created Jan 15, 2026",
		altText: "Vertical training clip cover for the Boston Marathon 2026 social reel",
		defaultImage: IMG.socialStory,
		updatedImage: IMG.editorUpdated,
	},
	"social-facebook": {
		title: "BostonMarathon_Facebook 16:9",
		createdLabel: "Created Jan 15, 2026",
		altText: "Wide training shot for the Boston Marathon 2026 Facebook post",
		defaultImage: IMG.socialWide,
		updatedImage: IMG.editorUpdated,
	},
	"email-hero": {
		title: "Boston Marathon Email Hero",
		createdLabel: "Created Jan 15, 2026",
		altText: "Runner training at sunrise for Stride's Boston Marathon 2026 campaign",
		defaultImage: IMG.hero,
		updatedImage: IMG.editorUpdated,
	},
};

export type ImageOverrides = Partial<Record<ImageSlotId, string>>;

export function resolveSlotImage(slot: ImageSlotId, overrides: ImageOverrides): string {
	return overrides[slot] ?? SLOT_META[slot].defaultImage;
}

export function allSlotsUpdated(): Record<ImageSlotId, string> {
	return Object.fromEntries(
		(Object.keys(SLOT_META) as ImageSlotId[]).map((slot) => [slot, SLOT_META[slot].updatedImage]),
	) as Record<ImageSlotId, string>;
}

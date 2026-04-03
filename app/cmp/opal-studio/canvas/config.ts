export const ratioOptions = ["Auto", "1:1", "4:5", "16:9", "9:16"] as const;
export const channelPacks = ["Social pack", "Ads pack", "Email + web pack", "Event campaign pack"];
export const brandPacks = ["General", "Stride", "Olympics", "Tour de France"] as const;
export const intentOptions = [
	"Generate",
	"Edit",
	"Upscale",
	"Resize",
	"Recompose",
	"Extend",
	"Inpaint",
	"Product placement",
	"Variation",
	"Extract",
] as const;
export const editToolOptions = ["Reframe", "Resize", "Upscale", "Text overlay", "Remove background"] as const;
export const textLayoutOptions = ["Hero left", "Tall stack", "Bottom left", "Centered", "Impact", "Editorial"] as const;

export const referenceImages = [
	{ src: "/hero-cycling.jpg", label: "Ride hero", source: "Library" },
	{ src: "/track-sprint-portrait.jpg", label: "Track sprint", source: "Task" },
	{ src: "/open-water-training.jpg", label: "Open-water", source: "Upload" },
	{ src: "/marathon-prep.jpg", label: "Marathon prep", source: "Library" },
];

export type RatioOption = (typeof ratioOptions)[number];
export type BrandPack = (typeof brandPacks)[number];
export type IntentOption = (typeof intentOptions)[number];
export type EditToolOption = (typeof editToolOptions)[number];
export type TextLayoutOption = (typeof textLayoutOptions)[number];
export type ActiveTool = "Prompt" | "Text overlay" | "Reframe" | "References" | "Remove background";

/* ── Operation metadata ── */

export interface OperationMeta {
	description: string;
	requiresSource: boolean;
	canvasMode: "generate" | "edit";
}

export const operationMeta: Record<IntentOption, OperationMeta> = {
	Generate: {
		description: "Create a brand new image from a prompt. No source image required.",
		requiresSource: false,
		canvasMode: "generate",
	},
	Edit: {
		description: "Apply modifications to the existing image without changing its structure.",
		requiresSource: true,
		canvasMode: "edit",
	},
	Upscale: {
		description: "Increase resolution and clarity while preserving the original content.",
		requiresSource: true,
		canvasMode: "edit",
	},
	Resize: {
		description: "Adjust dimensions without changing composition or layout.",
		requiresSource: true,
		canvasMode: "edit",
	},
	Recompose: {
		description: "Adapt layout or framing to a new format while preserving the core subject.",
		requiresSource: true,
		canvasMode: "edit",
	},
	Extend: {
		description: "Expand the image beyond its boundaries by generating new surrounding content.",
		requiresSource: true,
		canvasMode: "edit",
	},
	Inpaint: {
		description: "Modify a specific area of the image without affecting the rest.",
		requiresSource: true,
		canvasMode: "edit",
	},
	"Product placement": {
		description: "Insert a product into a scene with realistic positioning and lighting.",
		requiresSource: true,
		canvasMode: "edit",
	},
	Variation: {
		description: "Generate alternative versions while maintaining consistency with the original.",
		requiresSource: true,
		canvasMode: "edit",
	},
	Extract: {
		description: "Isolate a subject from its background to create a reusable asset.",
		requiresSource: true,
		canvasMode: "edit",
	},
};

/* ── Canvas settings ── */

export interface CanvasSettings {
	showGrid: boolean;
	snapToGrid: boolean;
	showGuides: boolean;
	autoSave: boolean;
	exportQuality: "Standard" | "High" | "Max";
}

export const defaultCanvasSettings: CanvasSettings = {
	showGrid: false,
	snapToGrid: true,
	showGuides: true,
	autoSave: true,
	exportQuality: "High",
};

export const GRID_SIZE = 20;
export const SNAP_THRESHOLD = 8;

/* ── Demo generation steps ── */

export interface GenerationStep {
	prompt: string;
	image: string;
}

export const demoGenerationSteps: GenerationStep[] = [
	{
		prompt: "Create a new dynamic image for a triathlon poster",
		image: "/hero-cycling.jpg",
	},
	{
		prompt: "Keep the rider, but place them in the French Alps during the Tour de France",
		image: "/tdf-calm.png",
	},
	{
		prompt: "Love this vibe — add more fans cheering loudly with signs and flags",
		image: "/tdf-fans.png",
	},
];

/* ── Artboard / Pack types ── */

export interface Artboard {
	id: string;
	label: string;
	ratio: string;       // e.g. "1:1", "9:16", "1.91:1", "16:9"
	width: number;        // logical px on the canvas
	height: number;       // logical px on the canvas
	x: number;            // position on the infinite canvas
	y: number;            // position on the infinite canvas
	image: string;        // src
}

const ARTBOARD_BASE = 320;

export const socialPackArtboards: Omit<Artboard, "x" | "y" | "image">[] = [
	{ id: "ig-post",     label: "IG Post",       ratio: "1:1",    width: ARTBOARD_BASE,       height: ARTBOARD_BASE },
	{ id: "ig-reels",    label: "IG Reels",      ratio: "9:16",   width: ARTBOARD_BASE * 0.7, height: ARTBOARD_BASE * 0.7 * (16 / 9) },
	{ id: "linkedin",    label: "LinkedIn Post",  ratio: "1.91:1", width: ARTBOARD_BASE * 1.4, height: ARTBOARD_BASE * 1.4 / 1.91 },
	{ id: "wide",        label: "Wide Banner",    ratio: "16:9",   width: ARTBOARD_BASE * 1.4, height: ARTBOARD_BASE * 1.4 * (9 / 16) },
];

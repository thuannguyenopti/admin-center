import type { ChatMessage } from "@/app/hooks/useOpalState";
import type { ChatHistoryItem } from "@/app/hooks/useOpalHistory";
import type { ImageOverrides } from "./components/canvas/assets";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Scene =
	| "im-brief"
	| "im-q1"
	| "im-q2"
	| "canvas-blog"
	| "canvas-rationale"
	| "canvas-social"
	| "canvas-fullscreen"
	| "canvas-workflow"
	| "opal-chat"
	| "image-edit"
	| "image-confirm"
	| "image-result"
	| "workflow-done";

export const SCENES: { id: Scene; label: string }[] = [
	{ id: "im-brief", label: "Brief" },
	{ id: "im-q1", label: "Audience" },
	{ id: "im-q2", label: "Angle" },
	{ id: "canvas-blog", label: "Blog" },
	{ id: "canvas-rationale", label: "Rationale" },
	{ id: "canvas-social", label: "Social" },
	{ id: "canvas-fullscreen", label: "Fullscreen" },
	{ id: "canvas-workflow", label: "Workflow" },
	{ id: "opal-chat", label: "Opal Chat" },
	{ id: "image-edit", label: "Image Edit" },
	{ id: "image-confirm", label: "Confirm" },
	{ id: "image-result", label: "Results" },
	{ id: "workflow-done", label: "Done" },
];

export const STORAGE_KEYS = {
	imageOverrides: "cmp-workshop.image-overrides",
	workflowChecks: "cmp-workshop.workflow-checks",
	workflowComplete: "cmp-workshop.workflow-complete",
};

export const WORKFLOW_CHECK_IDS = ["blog", "email", "social"];

export function getInitialSceneIndex() {
	if (typeof window === "undefined") return 0;
	const value = new URLSearchParams(window.location.search).get("scene");
	if (!value) return 0;
	const numeric = Number(value);
	if (Number.isInteger(numeric) && numeric >= 1 && numeric <= SCENES.length) {
		return numeric - 1;
	}
	const byId = SCENES.findIndex((scene) => scene.id === value);
	return byId >= 0 ? byId : 0;
}

export function readStoredBoolean(key: string, fallback = false) {
	if (typeof window === "undefined") return fallback;
	const stored = window.localStorage.getItem(key);
	if (stored === null) return fallback;
	return stored === "true";
}

export function readStoredImageOverrides(): ImageOverrides {
	if (typeof window === "undefined") return {};
	try {
		const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.imageOverrides) ?? "{}");
		return typeof parsed === "object" && parsed !== null ? (parsed as ImageOverrides) : {};
	} catch {
		return {};
	}
}

export function readStoredWorkflowChecks() {
	if (typeof window === "undefined") return {};
	try {
		const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.workflowChecks) ?? "{}");
		return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, boolean>) : {};
	} catch {
		return {};
	}
}

// ─── Mock message helpers ─────────────────────────────────────────────────────

const TS = 1720000000000;

function frank(id: string, content: string, extra: Partial<ChatMessage> = {}): ChatMessage {
	return {
		id,
		role: "assistant",
		content,
		timestamp: TS,
		metadata: {
			imMode: true,
			authorName: "Frank",
			authorAvatar: "/avatars/vau-frank.png",
			authorTitle: "Content Marketing VAU",
			isVAU: true,
		},
		...extra,
	};
}

function opal(id: string, content: string, extra: Partial<ChatMessage> = {}): ChatMessage {
	return {
		id,
		role: "assistant",
		content,
		timestamp: TS,
		metadata: {
			imMode: true,
			authorName: "Opal",
			authorAvatar: "/opal.png",
		},
		...extra,
	};
}

function wanda(id: string, content: string): ChatMessage {
	return {
		id,
		role: "user",
		content,
		timestamp: TS + 60000,
		metadata: {
			imMode: true,
			authorName: "Wanda M.",
			authorAvatar: "/avatars/jc.png",
		},
	};
}

// ─── Static message sets per scene ───────────────────────────────────────────

const MSG_BRIEF_REQUEST = wanda("w-brief-request", "Create a campaign for the Boston Marathon in April 2026");

const MSG_BRIEF_CONFIRM = opal(
	"o-brief-confirm",
	"To get started, I can create a campaign brief for this. Want me to go ahead?",
	{ cardAfterKey: "campaign-brief-options" },
);

const MSG_BRIEF_APPROVED = wanda("w-brief-approved", "Yes, create a brief");

const MSG_AUDIENCE_PROMPT = opal(
	"o-audience",
	"I'm putting together a campaign brief for the **Boston Marathon April 2026**. Who's the primary audience you're targeting for this campaign?",
	{ cardAfterKey: "q1-card" },
);

const MSG_AUDIENCE_PROMPT_BARE = opal(
	"o-audience",
	"I'm putting together a campaign brief for the **Boston Marathon April 2026**. Who's the primary audience you're targeting for this campaign?",
);

const MSG_RUNNERS = wanda("w-runners", "Runners");

const MSG_ANGLE = frank("f-angle", "Got it — runners it is! One more thing before I start generating.", {
	cardAfterKey: "q2-card",
});

const MSG_ANGLE_BARE = frank("f-angle", "Got it — runners it is! One more thing before I start generating.");

const MSG_MOTIVATIONAL = wanda("w-moti", "Motivational Piece");

const MSG_GENERATING = frank(
	"f-gen",
	"Perfect. I’ll build this live so you can steer it: first the story arc, then the hero image, then the channel versions.",
	{ cardAfterKey: "build-plan-card" },
);

const MSG_HERO_LOCKED = wanda("w-hero", "Use the bridge runner. It feels aspirational.");

const MSG_HERO = frank(
	"f-hero",
	"Good call. I’m locking that hero image and shaping the opening around Boston training, race-week energy, and the finish-line payoff.",
	{ cardAfterKey: "copy-draft-card" },
);

const MSG_OPENING_APPROVED = wanda("w-opening", "Approve opening. Keep the tone driven.");

const MSG_ASSEMBLING = frank(
	"f-assembling",
	"I’m applying that direction now: blog structure first, then I’ll generate the social and email siblings from the same campaign spine.",
	{ cardAfterKey: "suite-ready-card" },
);

const MSG_READY = frank(
	"f-ready",
	"Your Boston Marathon 2026 content suite is ready: a long-form Stride blog post, three social formats, and email copy. Opening the canvas now.",
);

const MSG_RATIONALE = frank(
	"f-rationale",
	"The motivational angle works well for runners: it centres on personal achievement rather than the race itself. I went heavy on second-person copy and kept stats minimal — emotion over data.",
);

const MSG_SOCIAL = frank(
	"f-social",
	"The blog is yours. Want me to adapt the social posts next — I have 1:1, 9:16, and 16:9 formats ready to preview.",
);

const MSG_FULLSCREEN = frank(
	"f-full",
	"Here's the 1:1 Boston Marathon social post front and centre. The other formats are in the panel — tap to switch.",
);

const MSG_WORKFLOW = frank(
	"f-workflow",
	"I can also build you a distribution workflow: schedule posts, set approval gates, and wire up the email send. Want me to set that up?",
);

const MSG_WORKFLOW_YES = wanda("w-workflow", "Yes, set up the workflow");

const MSG_OPAL_CONTEXT = opal(
	"o-context",
	"I have the content suite and workflow context. Frank handled the generation as a virtual agent; you can now work with me directly on edits, approvals, and publishing.",
);

const MSG_OPAL_WORKFLOW = opal(
	"o-workflow",
	"The workflow is live: blog post to Contentful, social posts to Buffer with a 48 hour delay, and email to Marketo for the Boston Marathon campaign window.",
);

const MSG_IMAGE = opal("o-image", "The 1:1 social post is selected. Click Edit to open Image Gen II and replace the hero image.");

const MSG_IMAGE_CHOICE = wanda("w-img", "The finish-line shot");

const MSG_IMAGE_CONFIRM = opal("o-imgconfirm", "Should I apply this image replacement to all images and assets in this task?");

const MSG_IMAGE_APPLY = wanda("w-apply", "Yes, apply it everywhere");

const MSG_IMAGE_DONE = opal("o-imgdone", "Done. The blog post, social posts, and email have all been refreshed with the updated image.");

const MSG_DONE = opal("o-done", "Campaign suite complete. The workflow checklist is done and everything is ready for publish.");

function buildCanvasMessages(buildStep: number): ChatMessage[] {
	const base = [
		MSG_BRIEF_REQUEST,
		MSG_BRIEF_CONFIRM,
		MSG_BRIEF_APPROVED,
		MSG_AUDIENCE_PROMPT_BARE,
		MSG_RUNNERS,
		MSG_ANGLE_BARE,
		MSG_MOTIVATIONAL,
		MSG_GENERATING,
	];
	if (buildStep <= 1) return base;
	if (buildStep === 2) return [...base, MSG_HERO_LOCKED, MSG_HERO];
	return [...base, MSG_HERO_LOCKED, MSG_HERO, MSG_OPENING_APPROVED, MSG_ASSEMBLING, MSG_READY];
}

const SCENE_MESSAGES: Record<Scene, ChatMessage[]> = {
	"im-brief": [MSG_BRIEF_REQUEST, MSG_BRIEF_CONFIRM],
	"im-q1": [MSG_BRIEF_REQUEST, MSG_BRIEF_CONFIRM, MSG_BRIEF_APPROVED, MSG_AUDIENCE_PROMPT],
	"im-q2": [MSG_BRIEF_REQUEST, MSG_BRIEF_CONFIRM, MSG_BRIEF_APPROVED, MSG_AUDIENCE_PROMPT_BARE, MSG_RUNNERS, MSG_ANGLE],
	"canvas-blog": buildCanvasMessages(3),
	"canvas-rationale": [...buildCanvasMessages(3), MSG_RATIONALE],
	"canvas-social": [...buildCanvasMessages(3), MSG_RATIONALE, MSG_SOCIAL],
	"canvas-fullscreen": [...buildCanvasMessages(3), MSG_RATIONALE, MSG_SOCIAL, MSG_FULLSCREEN],
	"canvas-workflow": [...buildCanvasMessages(3), MSG_RATIONALE, MSG_SOCIAL, MSG_FULLSCREEN, MSG_WORKFLOW],
	"opal-chat": [MSG_OPAL_CONTEXT, MSG_WORKFLOW_YES, MSG_OPAL_WORKFLOW, MSG_IMAGE],
	"image-edit": [MSG_OPAL_CONTEXT, MSG_WORKFLOW_YES, MSG_OPAL_WORKFLOW, MSG_IMAGE],
	"image-confirm": [MSG_OPAL_CONTEXT, MSG_WORKFLOW_YES, MSG_OPAL_WORKFLOW, MSG_IMAGE, MSG_IMAGE_CHOICE, MSG_IMAGE_CONFIRM],
	"image-result": [MSG_OPAL_CONTEXT, MSG_WORKFLOW_YES, MSG_OPAL_WORKFLOW, MSG_IMAGE, MSG_IMAGE_CHOICE, MSG_IMAGE_CONFIRM, MSG_IMAGE_APPLY, MSG_IMAGE_DONE],
	"workflow-done": [MSG_OPAL_CONTEXT, MSG_WORKFLOW_YES, MSG_OPAL_WORKFLOW, MSG_IMAGE, MSG_IMAGE_CHOICE, MSG_IMAGE_CONFIRM, MSG_IMAGE_APPLY, MSG_IMAGE_DONE, MSG_DONE],
};

export function getSceneMessages(scene: Scene, buildStep: number, state: { hasImageOverrides: boolean; workflowComplete: boolean }): ChatMessage[] {
	if (scene === "canvas-blog") return buildCanvasMessages(buildStep);
	if (scene === "workflow-done") {
		const base = state.hasImageOverrides
			? [MSG_OPAL_CONTEXT, MSG_WORKFLOW_YES, MSG_OPAL_WORKFLOW, MSG_IMAGE, MSG_IMAGE_CHOICE, MSG_IMAGE_CONFIRM, MSG_IMAGE_APPLY, MSG_IMAGE_DONE]
			: [MSG_OPAL_CONTEXT, MSG_WORKFLOW_YES, MSG_OPAL_WORKFLOW];
		return state.workflowComplete ? [...base, MSG_DONE] : base;
	}
	return SCENE_MESSAGES[scene];
}

// ─── Mock history sidebar ─────────────────────────────────────────────────────

export const WORKSHOP_HISTORY: Record<string, ChatHistoryItem[]> = {
	Channels: [
		{ id: "ch-boston", title: "#boston-marathon-2026", date: new Date("2026-01-15"), preview: "Stride campaign brief attached", isChannel: true },
		{ id: "ch-brand", title: "#brand-assets", date: new Date("2025-07-14"), preview: "Updated logo pack uploaded", isChannel: true },
	],
	"Direct messages": [
		{ id: "opal", title: "Opal", date: new Date("2026-01-15"), avatarUrl: "/opal.png", preview: "I have the content suite and workflow context.", presenceStatus: "online" },
		{
			id: "cmp-frank",
			title: "Frank",
			date: new Date("2026-01-15"),
			avatarUrl: "/avatars/vau-frank.png",
			isVAU: true,
			vauTemplateName: "Content Marketing VAU",
			needsInput: true,
			preview: "Before I start, let me understand your audience…",
		},
		{ id: "dm-wanda", title: "Wanda M.", date: new Date("2025-07-14"), avatarUrl: "/avatars/jc.png", preview: "Can you take a look at the brief?", presenceStatus: "online" },
	],
};

// ─── Action-card question sets ───────────────────────────────────────────────

export const AUDIENCE_Q = {
	id: "audience",
	label: "Who is the audience?",
	options: [
		{ value: "runners", label: "Runners" },
		{ value: "sponsors", label: "Sponsors" },
		{ value: "fans", label: "General fans" },
		{ value: "corporate", label: "Corporate partners" },
		{ value: "other", label: "Something else" },
	],
};

export const ANGLE_Q = {
	id: "angle",
	label: "What's the angle or key message?",
	options: [
		{ value: "recap", label: "Recap" },
		{ value: "motivational", label: "Motivational Piece" },
		{ value: "fundraising", label: "Fundraising push" },
		{ value: "announcement", label: "Event Announcement" },
		{ value: "other", label: "Something else" },
	],
};

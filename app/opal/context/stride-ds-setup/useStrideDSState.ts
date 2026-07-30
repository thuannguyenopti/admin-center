"use client";

import {useState, useCallback, useMemo, useEffect, useRef} from "react";
import usePersistentState from "@/app/usePersistentState";
import type {ChatMessage} from "@/app/hooks/useOpalState";
import {initialContentTypes} from "@/app/db/initialData";

export type {ChatMessage};

export type DSPhase =
	| "idle"
	| "thinking"
	| "proposal"
	| "setup-pending"
	| "setting-up"
	| "live"
	| "page-offer"
	| "hero-pick"
	| "page-generating"
	| "complete";

export type SetupStep = {
	id: string;
	label: string;
	detail: string;
	status: "pending" | "running" | "done" | "error";
};

export type DSRule = {
	id: string;
	category: "naming" | "spacing" | "color" | "accessibility" | "components" | "custom";
	label: string;
	value: string;
};

type GeneratedArtifact = {
	id: string;
	name: string;
	type: "Document" | "Image" | "Code" | "Presentation" | "Spreadsheet" | "Report";
	source: { name: string; type: "chat" | "agent" | "workflow"; link?: string };
	agentBadgeIntent: "warning" | "danger" | "information" | "success" | "neutral";
	createdBy: { name: string; avatar: string };
	owner: { name: string; avatar: string };
	sharedWithTeam?: boolean;
	sharedWith?: Array<{ name: string; avatar: string }>;
	tags?: string[];
	created: string;
	createdRaw: number;
	size: string;
	sizeRaw: number;
	status: "Ready" | "Generating" | "Failed";
	version: string;
	description: string;
	previewText?: string;
	activityText: string;
	directLink?: string;
};

const STORYBOOK_COMPONENT_INDEX = [
	{
		name: "Hero",
		url: "http://localhost:6006/?path=/story/components-hero--default",
		suggestedSchema: {heading: "string", subheading: "string", primaryButton: "string", backgroundImage: "string"},
	},
	{
		name: "CardGrid",
		url: "http://localhost:6006/?path=/story/components-card-grid--default",
		suggestedSchema: {title: "string", description: "string", cards: "array"},
	},
	{
		name: "FeatureList",
		url: "http://localhost:6006/?path=/story/components-feature-list--icons",
		suggestedSchema: {title: "string", features: "array"},
	},
	{
		name: "Testimonial",
		url: "http://localhost:6006/?path=/story/components-testimonial--single",
		suggestedSchema: {quote: "string", author: "string", role: "string"},
	},
	{
		name: "Button",
		url: "http://localhost:6006/?path=/story/components-button--default",
		suggestedSchema: {variant: "default | primary | disabled"},
	},
] as const;

const STORYBOOK_ANALYSIS_URL = "https://stide-mock.vercel.app/storybook";

const COMPONENT_VARIANTS: Record<string, Array<{label: string; storyId: string}>> = {
	button: [
		{label: "Primary",  storyId: "ui-button--primary"},
		{label: "Outline",  storyId: "ui-button--outline"},
		{label: "Ghost",    storyId: "ui-button--ghost"},
		{label: "Danger",   storyId: "ui-button--danger"},
	],
	card: [
		{label: "Default",  storyId: "ui-card--default"},
		{label: "Elevated", storyId: "ui-card--elevated"},
	],
	input: [
		{label: "Default",  storyId: "ui-input--default"},
		{label: "Search",   storyId: "ui-input--search"},
		{label: "Error",    storyId: "ui-input--error"},
	],
	badge: [
		{label: "Default",  storyId: "components-badge--default"},
		{label: "Subtle",   storyId: "components-badge--subtle"},
		{label: "Warning",  storyId: "components-badge--warning"},
	],
	hero: [
		{label: "Default",  storyId: "sections-hero--default"},
		{label: "Centered", storyId: "sections-hero--centered"},
	],
};

const VB_BLOCK_TYPES = [
	"ct-button",
	"ct-heading",
	"ct-text",
	"ct-rich-text",
	"ct-product",
	"ct-input",
	"ct-image",
	"ct-image-block",
	"ct-blog-post",
	"ct-section-header",
	"ct-hero",
	"ct-number-line",
	"ct-card",
	"ct-feature-card",
	"ct-app-preview",
	"ct-sidebar-item",
	"ct-nav-item",
	"ct-event-card",
	"ct-news-item",
];

type StorybookAnalysisComponent = {
	name: string;
	storyId: string;
	storybookUrl: string;
	title: string;
	storyName: string;
	importPath: string;
	cmsElementType: string;
	suggestedSchema: Record<string, string>;
};

type StorybookAnalysisResponse = {
	sourceUrl: string;
	analyzedAt: string;
	fetchedFrom: string;
	componentCount: number;
	components: StorybookAnalysisComponent[];
};

const FALLBACK_REGISTRY_JSON = JSON.stringify(
	{
		registry: {
			Hero: {
				description: "Primary campaign hero with media and content slots.",
				"storybook url": "http://localhost:6006/?path=/story/components-hero--default",
				"cms type schema": {title: "string", img: "string"},
			},
			Button: {
				description: "Primary interactive action with visual variants.",
				"storybook url": "http://localhost:6006/?path=/story/components-button--default",
				"cms type schema": {variant: "default | primary | disabled"},
			},
		},
	},
	null,
	2
);

function stripCodeFences(text: string): string {
	return text
		.replace(/^```(?:json)?\s*/i, "")
		.replace(/\s*```$/i, "")
		.trim();
}

function applyMatchesToRegistry(
	registryJson: string,
	matches: Record<string, string | null>
): string {
	try {
		const parsed = JSON.parse(registryJson) as {
			registry?: Record<string, Record<string, unknown>>;
		};
		if (!parsed.registry) return registryJson;
		for (const [name, matchedType] of Object.entries(matches)) {
			if (parsed.registry[name] !== undefined) {
				parsed.registry[name]["cms element type"] = matchedType ?? "";
			}
		}
		return JSON.stringify(parsed, null, 2);
	} catch {
		return registryJson;
	}
}

function normalizeRegistryJson(raw: string): string {
	try {
		const parsed = JSON.parse(stripCodeFences(raw)) as {
			registry?: Record<
				string,
				{
					description?: unknown;
					"storybook url"?: unknown;
					"cms type schema"?: unknown;
				}
			>;
		};

		if (!parsed || typeof parsed !== "object" || !parsed.registry || typeof parsed.registry !== "object") {
			return FALLBACK_REGISTRY_JSON;
		}

		const normalizedEntries = Object.fromEntries(
			Object.entries(parsed.registry).map(([componentName, entry]) => {
				const description =
					typeof entry?.description === "string" && entry.description.trim().length > 0
						? entry.description.trim()
						: `Storybook component analysis for ${componentName}.`;

				const storybookUrl =
					typeof entry?.["storybook url"] === "string" && entry["storybook url"].trim().length > 0
						? entry["storybook url"].trim()
						: "http://localhost:6006/";

				const cmsTypeSchema =
					entry?.["cms type schema"] &&
					typeof entry["cms type schema"] === "object" &&
					!Array.isArray(entry["cms type schema"])
						? entry["cms type schema"]
						: {title: "string", img: "string"};

				return [
					componentName,
					{
						description,
						"storybook url": storybookUrl,
						"cms type schema": cmsTypeSchema,
					},
				];
			})
		);

		return JSON.stringify({registry: normalizedEntries}, null, 2);
	} catch {
		return FALLBACK_REGISTRY_JSON;
	}
}

function normalizeComponentKey(value: string): string {
	return value.trim().toLowerCase();
}

function isGenericSchema(schema: unknown): boolean {
	if (!schema || typeof schema !== "object" || Array.isArray(schema)) return true;
	const keys = Object.keys(schema as Record<string, unknown>).sort();
	if (keys.length === 0) return true;
	if (keys.length === 2 && keys[0] === "img" && keys[1] === "title") return true;
	if (keys.length === 1 && keys[0] === "variant") return true;
	return false;
}

function normalizeRegistryJsonWithHints(raw: string, hints: StorybookAnalysisComponent[]): string {
	const hintMap = new Map(hints.map((h) => [normalizeComponentKey(h.name), h]));

	try {
		const parsed = JSON.parse(stripCodeFences(raw)) as {
			registry?: Record<
				string,
				{
					description?: unknown;
					"storybook url"?: unknown;
					"cms type schema"?: unknown;
					"cms element type"?: unknown;
				}
			>;
		};

		if (!parsed || typeof parsed !== "object" || !parsed.registry || typeof parsed.registry !== "object") {
			return FALLBACK_REGISTRY_JSON;
		}

		const normalizedEntries = Object.fromEntries(
			Object.entries(parsed.registry).map(([componentName, entry]) => {
				const hint = hintMap.get(normalizeComponentKey(componentName));

				const description =
					typeof entry?.description === "string" && entry.description.trim().length > 0
						? entry.description.trim()
						: `Storybook component analysis for ${componentName}.`;

				const storybookUrl =
					typeof entry?.["storybook url"] === "string" && entry["storybook url"].trim().length > 0
						? entry["storybook url"].trim()
						: hint?.storybookUrl ?? "https://stide-mock.vercel.app/storybook";

				const elementTypeFromModel =
					typeof entry?.["cms element type"] === "string" &&
					entry["cms element type"].trim().length > 0
						? entry["cms element type"].trim()
						: "";

				const cmsElementType = elementTypeFromModel || hint?.cmsElementType || "content_block";

				const modelSchema = entry?.["cms type schema"];
				const cmsTypeSchema =
					modelSchema && typeof modelSchema === "object" && !Array.isArray(modelSchema)
						? modelSchema
						: hint?.suggestedSchema ?? {title: "string", description: "string", img: "string | null"};

				const mergedSchema =
					hint?.suggestedSchema && isGenericSchema(cmsTypeSchema)
						? hint.suggestedSchema
						: cmsTypeSchema;

				return [
					componentName,
					{
						description,
						"storybook url": storybookUrl,
						"cms element type": cmsElementType,
						"cms type schema": mergedSchema,
					},
				];
			})
		);

		return JSON.stringify({registry: normalizedEntries}, null, 2);
	} catch {
		return FALLBACK_REGISTRY_JSON;
	}
}

function expandRegistryVariants(
	registryJson: string,
	analysisComponents?: StorybookAnalysisComponent[],
): string {
	// Build a map from normalised component name → individual stories from live analysis.
	// Storybook titles look like "UI/Button" or "Sections/Hero"; we use only the last segment.
	const storyMap = new Map<string, StorybookAnalysisComponent[]>();
	for (const comp of analysisComponents ?? []) {
		const key = (comp.title.split("/").pop() ?? comp.name).trim().toLowerCase();
		const bucket = storyMap.get(key) ?? [];
		bucket.push(comp);
		storyMap.set(key, bucket);
	}

	try {
		const parsed = JSON.parse(registryJson) as {
			registry?: Record<string, Record<string, unknown>>;
		};
		if (!parsed.registry) return registryJson;

		const expanded: Record<string, Record<string, unknown>> = {};
		for (const [name, entry] of Object.entries(parsed.registry)) {
			const key = name.trim().toLowerCase();
			const stories = storyMap.get(key);

			if (stories && stories.length > 1) {
				// Live analysis has multiple stories for this component — one entry per variant.
				for (const story of stories) {
					expanded[`${name} ${story.storyName}`] = {
						...entry,
						"storybook url": story.storybookUrl,
					};
				}
			} else if (stories?.length === 1) {
				// Single story found — keep name, update URL.
				expanded[name] = {...entry, "storybook url": stories[0].storybookUrl};
			} else {
				// No live analysis data — fall back to the hardcoded variant list.
				const hardcoded = COMPONENT_VARIANTS[key];
				if (hardcoded) {
					for (const v of hardcoded) {
						expanded[`${name} ${v.label}`] = {
							...entry,
							"storybook url": `${STORYBOOK_ANALYSIS_URL}/iframe.html?id=${v.storyId}&viewMode=story`,
						};
					}
				} else {
					expanded[name] = entry;
				}
			}
		}
		return JSON.stringify({registry: expanded}, null, 2);
	} catch {
		return registryJson;
	}
}

const DEFAULT_RULES: DSRule[] = [
	{
		id: "r1",
		category: "naming",
		label: "Component naming",
		value: "PascalCase for all components (e.g. PrimaryButton, CardGrid)",
	},
	{
		id: "r2",
		category: "spacing",
		label: "Spacing scale",
		value: "Use 4px base unit — values: 4, 8, 12, 16, 24, 32, 48, 64px only",
	},
	{
		id: "r3",
		category: "color",
		label: "Primary brand color",
		value: "#1A1A2E (deep navy) — use semantic tokens: color.brand.primary",
	},
	{
		id: "r4",
		category: "accessibility",
		label: "Color contrast",
		value: "Minimum WCAG AA (4.5:1) for all body text, 3:1 for large text",
	},
	{
		id: "r5",
		category: "components",
		label: "Button states",
		value: "All interactive elements must have hover, focus, active, and disabled states",
	},
];

const SETUP_STEPS: SetupStep[] = [
	{
		id: "s1",
		label: "Scan UI components",
		detail: "Discovering components via Storybook v12...",
		status: "pending",
	},
	{
		id: "s-tokens",
		label: "Extract design tokens",
		detail: "Reading CSS custom properties — colors, typography, spacing, radius...",
		status: "pending",
	},
	{
		id: "s2",
		label: "Build component registry",
		detail: "Analyzing component semantics and generating visual registry...",
		status: "pending",
	},
	{
		id: "s4",
		label: "Save registry artifact",
		detail: "Writing the component registry to the artifact store...",
		status: "pending",
	},
];

export function useStrideDSState() {
	const [phase, setPhase, phaseHydrated] = usePersistentState("stride-ds-phase", "idle") as [
		DSPhase,
		(v: DSPhase) => void,
		boolean,
	];
	// On hydration, reset any mid-run phase to "live" so the canvas shows the
	// artifact rather than an in-progress spinner that will never complete.
	const normalizedOnce = useRef(false);
	useEffect(() => {
		if (!phaseHydrated || normalizedOnce.current) return;
		normalizedOnce.current = true;
		if (phase === "setting-up" || phase === "setup-pending" || phase === "thinking" || phase === "page-generating") {
			setPhase("live");
		}
	}, [phaseHydrated, phase, setPhase]);
	const [messages, setMessages] = usePersistentState(
		"stride-ds-messages",
		[] as ChatMessage[]
	) as [ChatMessage[], (v: ChatMessage[]) => void];
	const [setupSteps, setSetupSteps] = useState<SetupStep[]>(SETUP_STEPS);
	const [pageArtifactReady, setPageArtifactReady] = useState(false);
	const [rulesOpen, setRulesOpen] = useState(false);
	const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
	const [storybookPath, setStorybookPath] = useState("/index.html?path=/docs/docs-welcome--docs");

	const [savedRules, setSavedRules, rulesHydrated] = usePersistentState(
		"stride-ds-rules",
		DEFAULT_RULES
	) as [DSRule[], (v: DSRule[]) => void, boolean];

	const [generatedArtifacts, setGeneratedArtifacts, generatedArtifactsHydrated] =
		usePersistentState("opal:artifacts:generated", []) as [
			GeneratedArtifact[],
			(v: GeneratedArtifact[]) => void,
			boolean,
		];

	const addMessage = useCallback((msg: Omit<ChatMessage, "id" | "timestamp">) => {
		setMessages([
			...messages,
			{...msg, id: `msg-${Date.now()}-${Math.random()}`, timestamp: Date.now()},
		]);
	}, [messages, setMessages]);

	const runSetupSimulation = useCallback(async () => {
		setPhase("setting-up");
		setSetupSteps(SETUP_STEPS.map((s) => ({...s, status: "pending"})));

		const updateStep = (id: string, status: SetupStep["status"]) => {
			setSetupSteps((prev) => prev.map((s) => (s.id === id ? {...s, status} : s)));
		};

		// ── Step 1: Scan Storybook ────────────────────────────────────────────────
		updateStep("s1", "running");
		let liveAnalysis: StorybookAnalysisResponse | null = null;
		try {
			const res = await fetch("/api/opal/storybook-analysis", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({url: STORYBOOK_ANALYSIS_URL}),
			});
			if (res.ok) {
				const data = (await res.json()) as Partial<StorybookAnalysisResponse>;
				if (Array.isArray(data.components)) {
					liveAnalysis = {
						sourceUrl: typeof data.sourceUrl === "string" ? data.sourceUrl : STORYBOOK_ANALYSIS_URL,
						analyzedAt: typeof data.analyzedAt === "string" ? data.analyzedAt : new Date().toISOString(),
						fetchedFrom: typeof data.fetchedFrom === "string" ? data.fetchedFrom : "",
						componentCount: typeof data.componentCount === "number" ? data.componentCount : data.components.length,
						components: data.components as StorybookAnalysisComponent[],
					};
				}
			}
		} catch {
			// Fall back to static index
		}
		updateStep("s1", "done");

		// ── Step 1b: Extract design tokens ───────────────────────────────────────
		updateStep("s-tokens", "running");
		await new Promise<void>((r) => setTimeout(r, 1400));
		try {
			if (typeof window !== "undefined") {
				localStorage.setItem(
					"stride-ds-tokens",
					JSON.stringify({
						colors: 10,
						typography: 8,
						spacing: 9,
						radius: 5,
						extractedAt: new Date().toISOString(),
					})
				);
			}
		} catch {
			// best-effort
		}
		updateStep("s-tokens", "done");

		const analysisContext =
			liveAnalysis && liveAnalysis.components.length > 0
				? {
						sourceUrl: liveAnalysis.sourceUrl,
						analyzedAt: liveAnalysis.analyzedAt,
						fetchedFrom: liveAnalysis.fetchedFrom,
						componentCount: liveAnalysis.componentCount,
						components: liveAnalysis.components.map((c) => ({
							name: c.name,
							storyId: c.storyId,
							url: c.storybookUrl,
							title: c.title,
							storyName: c.storyName,
							importPath: c.importPath,
							cmsElementType: c.cmsElementType,
							suggestedSchema: c.suggestedSchema,
						})),
					}
				: {
						sourceUrl: STORYBOOK_ANALYSIS_URL,
						analyzedAt: new Date().toISOString(),
						fetchedFrom: "fallback-static-index",
						componentCount: STORYBOOK_COMPONENT_INDEX.length,
						components: STORYBOOK_COMPONENT_INDEX,
					};

		// ── Step 2: Analyze components (LLM generates registry JSON) ─────────────
		updateStep("s2", "running");
		let registryJson = FALLBACK_REGISTRY_JSON;
		const componentCount = analysisContext.componentCount;
		try {
			const systemPrompt = [
				"You analyze Storybook component catalogs and generate CMS registry mappings.",
				"Return ONLY valid JSON and no markdown fences.",
				"CRITICAL: Create one registry entry per STORY (variant), not one per component.",
				"If the payload has Button/Primary and Button/Outline, produce TWO entries: 'Button Primary' and 'Button Outline'.",
				"The registry key must be: '<ComponentName> <StoryName>' (e.g. 'Heading H1', 'Button Primary', 'Card Elevated').",
				"Required exact schema:",
				'{"registry":{"<ComponentName> <StoryName>":{"description":"...","storybook url":"<exact url from payload>","cms element type":"...","cms type schema":{}}}}',
				"Use the exact storybook url from each story in the payload — do not fabricate or merge URLs.",
				"Infer a precise cms type schema object for each story based on its component semantics.",
				"Do not reuse the same generic schema across entries.",
			].join("\n");
			// Strip suggestedSchema — model should infer schemas from component semantics.
			const llmPayload = {
				...analysisContext,
				components: analysisContext.components.map(({suggestedSchema: _s, ...rest}: {suggestedSchema?: unknown; [k: string]: unknown}) => rest),
			};
			const userPrompt = [
				"Generate a per-variant component registry from this Storybook analysis payload.",
				"Each story in the payload becomes its own registry entry keyed as '<ComponentName> <StoryName>'.",
				JSON.stringify(llmPayload, null, 2),
			].join("\n\n");
			const res = await fetch("/api/llm", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					messages: [
						{role: "system", content: systemPrompt},
						{role: "user", content: userPrompt},
					],
				}),
			});
			if (res.ok) {
				const data = (await res.json()) as {content?: string};
				registryJson = normalizeRegistryJsonWithHints(
					typeof data?.content === "string" ? data.content : "",
					analysisContext.components as unknown as StorybookAnalysisComponent[]
				);
			}
		} catch {
			// Keep fallback
		}
		updateStep("s2", "done");

		// ── Step 3: Match CMS types (LLM picks best type ID per component) ───────
		updateStep("s3", "running");
		try {
			const parsedRegistry = JSON.parse(registryJson) as {
				registry?: Record<string, Record<string, unknown>>;
			};
			if (parsedRegistry.registry) {
				const items = Object.keys(parsedRegistry.registry).map((name) => ({
					name,
					hint:
						typeof parsedRegistry.registry![name]["cms element type"] === "string"
							? (parsedRegistry.registry![name]["cms element type"] as string)
							: undefined,
				}));
				const availableTypes = [
					...VB_BLOCK_TYPES,
					...initialContentTypes.map((ct) => ct.id),
				].filter((v, i, a) => a.indexOf(v) === i);

				const res = await fetch("/api/opal/match-cms-types", {
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify({items, availableTypes}),
				});
				if (res.ok) {
					const data = (await res.json()) as {matches?: Record<string, string | null>};
					if (data.matches) {
						registryJson = applyMatchesToRegistry(registryJson, data.matches);
						if (typeof window !== "undefined") {
							localStorage.setItem(
								"opal:cms-matches:stride-cms-registry-artifact",
								JSON.stringify(data.matches)
							);
						}
					}
				}
			}
		} catch {
			// Matching is best-effort; proceed without it
		}
		updateStep("s3", "done");

		// Expand single-component entries into per-variant entries
		registryJson = expandRegistryVariants(registryJson, liveAnalysis?.components);

		// ── Step 4: Save registry artifact ───────────────────────────────────────
		updateStep("s4", "running");

		if (!generatedArtifactsHydrated) {
			updateStep("s4", "error");
			setPhase("live");
			setStorybookPath("/index.html?path=/docs/docs-welcome--docs");
			addMessage({
				role: "assistant",
				content:
					"Storybook connection is ready.\n\nI could not save the artifact yet because local state hydration is not complete. Retry setup in a moment to generate and map the registry.",
				cardAfterKey: "stride-registry-artifact",
			});
			return;
		}

		const now = Date.now();
		const createdRaw = Math.floor(now / 1000);
		const createdLabel = new Date(now).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
		const sizeRaw = new Blob([registryJson]).size;
		const sizeKb = Math.max(1, Math.round(sizeRaw / 1024));

		const newArtifact: GeneratedArtifact = {
			id: "stride-cms-registry-artifact",
			name: "Stride Storybook Component Registry",
			type: "Document",
			source: {
				name: "Design System Setup",
				type: "workflow",
				link: "/opal/context/stride-ds-setup?autostart=1",
			},
			agentBadgeIntent: "success",
			createdBy: {name: "Opal chat", avatar: ""},
			owner: {name: "Jamie Chen", avatar: "/avatars/jc.png"},
			sharedWithTeam: true,
			tags: ["Stride", "Registry", "Visual Builder"],
			created: createdLabel,
			createdRaw,
			size: `${sizeKb} KB`,
			sizeRaw,
			status: "Ready",
			version: "1.0",
			description:
				"Registry artifact generated from live Storybook analysis with component-specific cms element mappings and schemas.",
			previewText: registryJson,
			activityText: "Generated just now",
		};

		setGeneratedArtifacts([
			newArtifact,
			...generatedArtifacts.filter((a) => a.id !== newArtifact.id),
		]);
		updateStep("s4", "done");

		setPhase("live");
		setStorybookPath("/index.html?path=/docs/docs-welcome--docs");
		addMessage({
			role: "assistant",
			content: `Completed the Storybook-to-CMS flow.\n\n1) Scanned ${componentCount} components from the live Storybook.\n2) Generated the component registry with inferred schemas.\n3) Matched each component to a CMS content type.\n\nI attached the artifact below and added it to /opal/artifacts.`,
			cardAfterKey: "stride-registry-artifact",
		});

		setTimeout(() => {
			setPhase("page-offer");
			addMessage({
				role: "assistant",
				content:
					"A few components didn't match CMS content types, but that's fine. We have enough to start building pages. Want me to build an example landing page?",
				cardAfterKey: "page-offer",
			});
		}, 1500);
	}, [
		addMessage,
		generatedArtifacts,
		generatedArtifactsHydrated,
		setGeneratedArtifacts,
	]);

	const registryArtifact = useMemo(
		() =>
			generatedArtifactsHydrated
				? (generatedArtifacts.find((a) => a.id === "stride-cms-registry-artifact") ?? null)
				: null,
		[generatedArtifacts, generatedArtifactsHydrated]
	);

	const showHeroPickStep = useCallback(() => {
		setPhase("hero-pick");
		addMessage({
			role: "assistant",
			content: "Great! First, choose a hero style for the landing page.",
			cardAfterKey: "hero-pick",
		});
	}, [addMessage]);

	const runPageGeneration = useCallback(async (heroChoice: string) => {
		setPhase("page-generating");
		await new Promise<void>((r) => setTimeout(r, 2800));
		setPageArtifactReady(true);
		setPhase("complete");
		const heroLabel = heroChoice === "centered" ? "Centered" : heroChoice === "event" ? "Event" : "Default";
		addMessage({
			role: "assistant",
			content: `Done! Here's a Stride landing page with the ${heroLabel} hero, Card Grid, and Navigation. Click to open it in the Visual Builder.`,
			cardAfterKey: "page-artifact",
		});
	}, [addMessage]);

	const updateRegistryArtifactPreviewText = useCallback(
		(newPreviewText: string) => {
			if (!registryArtifact) return;
			setGeneratedArtifacts(
				generatedArtifacts.map((a) =>
					a.id === "stride-cms-registry-artifact" ? {...a, previewText: newPreviewText} : a
				)
			);
		},
		[registryArtifact, generatedArtifacts, setGeneratedArtifacts]
	);

	return {
		phase,
		setPhase,
		messages,
		addMessage,
		setupSteps,
		rulesOpen,
		setRulesOpen,
		selectedComponent,
		setSelectedComponent,
		storybookPath,
		setStorybookPath,
		savedRules: (rulesHydrated ? savedRules : DEFAULT_RULES) as DSRule[],
		setSavedRules,
		runSetupSimulation,
		showHeroPickStep,
		runPageGeneration,
		pageArtifactReady,
		registryArtifact,
		updateRegistryArtifactPreviewText,
		hydrated: phaseHydrated && generatedArtifactsHydrated,
	};
}

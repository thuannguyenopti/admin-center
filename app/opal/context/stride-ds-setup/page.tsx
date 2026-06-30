"use client";

import React, {useCallback, useState, useEffect, useMemo, useRef} from "react";
import {Box, Text} from "@optiaxiom/react";
import {OpalChatView} from "@/app/components/Opal/OpalChatView";
import {ApprovalActionCard} from "@/app/components/Opal/ApprovalActionCard";
import {CanvasPanel, STORYBOOK_BASE} from "./components/CanvasPanel";
import {RulesPanel} from "./components/RulesPanel";
import {useStrideDSState} from "./useStrideDSState";
import type {ArtifactViewerArtifact} from "@/app/opal/artifacts/components/ArtifactViewer";
import {IconCircleCheckSolid} from "@optimizely/axiom-icons";
import {ArtifactRefCard} from "@/app/components/Opal/ArtifactRefCard";
import {
	PreviewCard,
	toIsolatedStoryUrl,
	deriveVariantStoryUrl,
	iframeStyleForTileSize,
} from "@/app/components/PreviewCard";
import {STORY_SIZES} from "@/app/components/vb/storySizes";

const OPAL_PROPOSAL = `I can help with that! Let me take a quick look at the Stride repository first…

**Found:** \`stride-sports/stride-web\` on GitHub
- ✅ Storybook v12 detected in repo

I can run a focused flow now to **Scan UI components** and generate a visual component registry`;

const STORY_PATHS_BY_COMPONENT: Record<string, string> = {
	button: "/index.html?path=/story/components-button--primary",
	card: "/index.html?path=/story/components-card--default",
	input: "/index.html?path=/story/components-input--default",
	nav: "/index.html?path=/story/components-nav--default",
	hero: "/index.html?path=/story/sections-hero--default",
	badge: "/index.html?path=/story/components-badge--default",
	modal: "/index.html?path=/story/components-modal--default",
	footer: "/index.html?path=/story/sections-footer--default",
};

const COMPONENT_LABELS: Record<string, string> = {
	button: "Button",
	card: "Card",
	input: "Input",
	nav: "Navigation",
	hero: "Hero Section",
	badge: "Badge",
	modal: "Modal",
	footer: "Footer",
};

type StrideCommand = {
	type: "navigate_to_story";
	component?: string;
};

type StoryContextMessagePayload = {
	href?: string;
	path?: string;
	id?: string;
	viewMode?: string;
};

type StoryContextPostMessage = {
	source?: string;
	type?: string;
	reason?: string;
	href?: string;
	path?: string;
	id?: string;
	viewMode?: string;
	payload?: StoryContextMessagePayload;
	timestamp?: number;
};

type BridgeStoryContext = {
	path: string;
	id: string;
	viewMode: string;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
	return typeof value === "object" && value !== null;
}

function deepFindStringByKeys(value: unknown, keys: string[], depth = 0): string {
	if (!value || depth > 6) return "";
	if (typeof value === "string") return "";
	if (!isRecord(value)) return "";

	for (const key of keys) {
		const candidate = value[key];
		if (typeof candidate === "string" && candidate.trim()) {
			return candidate;
		}
	}

	for (const child of Object.values(value)) {
		const nested = deepFindStringByKeys(child, keys, depth + 1);
		if (nested) return nested;
	}

	return "";
}

function unwrapMessageEnvelope(value: unknown): unknown {
	if (!isRecord(value)) return value;

	const wrappers = ["payload", "data", "detail", "event"];
	for (const wrapper of wrappers) {
		const wrapped = value[wrapper];
		if (isRecord(wrapped)) {
			return wrapped;
		}
	}

	return value;
}

function parseBridgeMessageData(rawData: unknown): StoryContextPostMessage | null {
	if (!rawData) return null;
	if (typeof rawData === "object") {
		return unwrapMessageEnvelope(rawData) as StoryContextPostMessage;
	}
	if (typeof rawData === "string") {
		try {
			const parsed = JSON.parse(rawData);
			if (parsed && typeof parsed === "object") {
				return unwrapMessageEnvelope(parsed) as StoryContextPostMessage;
			}
		} catch {
			return null;
		}
	}
	return null;
}

function isStoryContextMessage(data: StoryContextPostMessage): boolean {
	const type = (data.type || "").toLowerCase();
	if (type === "opal-story-context" || type === "opal:story-context") return true;
	const hasPath = !!deepFindStringByKeys(data, ["path", "storyPath"]);
	const hasId = !!deepFindStringByKeys(data, ["id", "storyId"]);
	const hasHref = !!deepFindStringByKeys(data, ["href", "url"]);
	return hasPath || hasId || hasHref;
}

type StrideLlmResponse = {
	reply: string;
	commands?: StrideCommand[];
};

function buildAvailableStoriesText(): string {
	return Object.entries(STORY_PATHS_BY_COMPONENT)
		.map(([component, path]) => {
			const label = COMPONENT_LABELS[component] || component;
			return `- ${component} (${label}): ${STORYBOOK_BASE}${path}`;
		})
		.join("\n");
}

function stripCodeFences(content: string): string {
	const trimmed = content.trim();
	if (!trimmed.startsWith("```")) return trimmed;
	return trimmed
		.replace(/^```(?:json)?\s*/i, "")
		.replace(/```\s*$/i, "")
		.trim();
}

function getStoryPathValue(storybookPath: string): string {
	const query = storybookPath.split("?")[1] || "";
	const params = new URLSearchParams(query);
	return params.get("path") || "";
}

function normalizeViewMode(viewMode: string): "docs" | "story" {
	return viewMode === "docs" ? "docs" : "story";
}

function buildStoryPathFromId(id: string, viewMode: string): string {
	const mode = normalizeViewMode(viewMode);
	return `/${mode}/${id}`;
}

function extractStoryIdFromBridgeMessage(data: StoryContextPostMessage): string {
	if (typeof data.payload?.id === "string") return data.payload.id;
	if (typeof data.id === "string") return data.id;
	const nestedId = deepFindStringByKeys(data, ["id", "storyId"]);
	if (nestedId) return nestedId;
	return "";
}

function extractViewModeFromBridgeMessage(data: StoryContextPostMessage): string {
	if (typeof data.payload?.viewMode === "string") return data.payload.viewMode;
	if (typeof data.viewMode === "string") return data.viewMode;
	const nestedViewMode = deepFindStringByKeys(data, ["viewMode", "mode"]);
	if (nestedViewMode) return nestedViewMode;
	return "story";
}

function extractStoryPathFromBridgeMessage(data: StoryContextPostMessage): string | null {
	const directPath = typeof data.path === "string" ? data.path : "";
	const payloadPath = typeof data.payload?.path === "string" ? data.payload.path : "";
	const nestedPath = deepFindStringByKeys(data, ["path", "storyPath"]);
	const pathCandidate = payloadPath || directPath || nestedPath;
	if (pathCandidate) return pathCandidate;

	const directId = typeof data.id === "string" ? data.id : "";
	const payloadId = typeof data.payload?.id === "string" ? data.payload.id : "";
	const idCandidate = payloadId || directId;

	const directViewMode = typeof data.viewMode === "string" ? data.viewMode : "";
	const payloadViewMode = typeof data.payload?.viewMode === "string" ? data.payload.viewMode : "";
	const viewModeCandidate = payloadViewMode || directViewMode || "story";

	const directHref = typeof data.href === "string" ? data.href : "";
	const payloadHref = typeof data.payload?.href === "string" ? data.payload.href : "";
	const nestedHref = deepFindStringByKeys(data, ["href", "url"]);
	const hrefCandidate = payloadHref || directHref || nestedHref;
	if (!hrefCandidate) {
		return idCandidate ? buildStoryPathFromId(idCandidate, viewModeCandidate) : null;
	}

	try {
		const parsedUrl = new URL(hrefCandidate);
		const pathFromHref = parsedUrl.searchParams.get("path");
		if (pathFromHref) return pathFromHref;

		const idFromHref = parsedUrl.searchParams.get("id") || idCandidate;
		const viewModeFromHref = parsedUrl.searchParams.get("viewMode") || viewModeCandidate;
		return idFromHref ? buildStoryPathFromId(idFromHref, viewModeFromHref) : null;
	} catch {
		return idCandidate ? buildStoryPathFromId(idCandidate, viewModeCandidate) : null;
	}
}

function inferComponentFromStoryPath(storyPath: string): string | null {
	const lowered = storyPath.toLowerCase();
	const keys = Object.keys(COMPONENT_LABELS);
	const found = keys.find((k) => lowered.includes(k));
	return found || null;
}

function getStoryIdFromPath(storyPath: string): string {
	if (!storyPath) return "";
	if (storyPath.startsWith("/story/")) return storyPath.replace("/story/", "");
	if (storyPath.startsWith("/docs/")) return storyPath.replace("/docs/", "");
	return "";
}

function humanizeStorySegment(segment: string): string {
	if (!segment) return "";
	return segment
		.split("-")
		.filter(Boolean)
		.map((token) => token.charAt(0).toUpperCase() + token.slice(1))
		.join(" ");
}

function getComponentLabelFromStoryPath(storyPath: string): string {
	const storyId = getStoryIdFromPath(storyPath);
	if (!storyId) return "";

	const base = storyId.split("--")[0] || "";
	if (!base) return "";

	const mappedFromBase = COMPONENT_LABELS[base];
	if (mappedFromBase) return mappedFromBase;

	const lastSegment = base.split("-").pop() || "";
	const mappedFromLastSegment = COMPONENT_LABELS[lastSegment];
	if (mappedFromLastSegment) return mappedFromLastSegment;

	return humanizeStorySegment(base);
}

function getStoryVariantLabel(storyPath: string): string {
	if (!storyPath) return "unknown";
	if (storyPath.startsWith("/docs/")) return "docs";
	const match = storyPath.match(/--([^/]+)$/);
	return match?.[1] || "unknown";
}

function buildStoryContextChip(selectedComponent: string | null, storybookPath: string): string {
	const storyPath = getStoryPathValue(storybookPath);
	const inferredFromPath = inferComponentFromStoryPath(storyPath);
	const componentKey = inferredFromPath || selectedComponent;
	const mappedLabel = componentKey ? COMPONENT_LABELS[componentKey] : "";
	const pathDerivedLabel = getComponentLabelFromStoryPath(storyPath);
	const componentLabel = pathDerivedLabel || mappedLabel || "Story";
	const variant = getStoryVariantLabel(storyPath);
	return `${componentLabel} • ${variant}`;
}

async function requestStrideLlmReply(params: {
	userText: string;
	storyContextChip: string;
	storyPath: string;
	savedRulesCount: number;
	availableStoriesText: string;
	history: Array<{role: "user" | "assistant"; content: string}>;
}): Promise<StrideLlmResponse> {
	const systemPrompt = [
		"You are Opal, helping analyze the Stride UI component library and set up a CMS component registry.",
		"This is a simulation UI: do not claim real repository writes or real CSS mutation in the preview.",
		"You can suggest changes and request story navigation only.",
		"Return ONLY valid JSON with shape:",
		'{"reply":"string","commands":[{"type":"navigate_to_story","component":"button|card|input|nav|hero|badge|modal|footer"}]}',
		"For navigate_to_story, component MUST be one of the exact allowed keys from AVAILABLE_STORIES.",
		"Never invent a component key or URL.",
		"If there are no commands, return an empty commands array.",
		"If user asks to update button color/style, include this exact sentence in reply: I've now updated the button color for you.",
		"For that button-color case, include a navigate_to_story command with component=button.",
	].join("\n");

	const contextMessage = [
		`Current story context pill: ${params.storyContextChip}`,
		`Current story path: ${params.storyPath || "(none)"}`,
		`Saved design rules count: ${params.savedRulesCount}`,
		"AVAILABLE_STORIES (authoritative list):",
		params.availableStoriesText,
	].join("\n");

	const messages = [
		{role: "system", content: systemPrompt},
		{role: "system", content: contextMessage},
		...params.history,
		{role: "user", content: params.userText},
	];

	const response = await fetch("/api/llm", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify({messages}),
	});

	if (!response.ok) {
		throw new Error(`LLM request failed: ${response.status}`);
	}

	const data = await response.json();
	const content = typeof data?.content === "string" ? data.content : "";
	const cleaned = stripCodeFences(content);

	try {
		const parsed = JSON.parse(cleaned) as Partial<StrideLlmResponse>;
		if (typeof parsed.reply === "string") {
			return {
				reply: parsed.reply,
				commands: Array.isArray(parsed.commands)
					? (parsed.commands as StrideCommand[])
					: [],
			};
		}
	} catch {
		// Fall through to plain text fallback.
	}

	return {reply: cleaned || "I can help with that.", commands: []};
}

function SetupProgressCard({steps}: {steps: ReturnType<typeof useStrideDSState>["setupSteps"]}) {
	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="4"
			px="16"
			py="12"
			rounded="lg"
			style={{
				border: "1px solid var(--ax-colors-border-default)",
				background: "var(--ax-colors-bg-secondary)",
			}}
		>
			{steps.map((step) => (
				<Box key={step.id} display="flex" alignItems="start" gap="10">
					<Box style={{flexShrink: 0, marginTop: 2}}>
						{step.status === "done" ? (
							<IconCircleCheckSolid size={14} color="var(--ax-colors-fg-success)" />
						) : step.status === "running" ? (
							<Box
								style={{
									width: 14,
									height: 14,
									borderRadius: "50%",
									border: "2px solid var(--ax-colors-fg-accent)",
									borderTopColor: "transparent",
									animation: "spin 0.7s linear infinite",
								}}
							/>
						) : (
							<Box
								style={{
									width: 14,
									height: 14,
									borderRadius: "50%",
									border: "2px solid var(--ax-colors-border-default)",
								}}
							/>
						)}
					</Box>
					<Box>
						<Text
							fontSize="xs"
							fontWeight={step.status === "running" ? "600" : "400"}
							color={step.status === "pending" ? "fg.disabled" : "fg.default"}
						>
							{step.label}
						</Text>
						{step.status === "running" && (
							<Text
								fontSize="xs"
								color="fg.tertiary"
								style={{fontFamily: "monospace"}}
							>
								{step.detail}
							</Text>
						)}
					</Box>
				</Box>
			))}
		</Box>
	);
}

export default function StrideDesignSystemPage() {
	const {
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
		savedRules,
		setSavedRules,
		runSetupSimulation,
		showHeroPickStep,
		runPageGeneration,
		pageArtifactReady,
		registryArtifact,
		updateRegistryArtifactPreviewText,
		hydrated,
	} = useStrideDSState();

	const canvasArtifact = useMemo((): ArtifactViewerArtifact | null => {
		if (!registryArtifact) return null;
		return {
			id: registryArtifact.id,
			name: registryArtifact.name,
			type: registryArtifact.type,
			sourceType: registryArtifact.source.type,
			sourceName: registryArtifact.source.name,
			sourceLink: registryArtifact.source.link,
			createdBy: registryArtifact.createdBy,
			created: registryArtifact.created,
			status: registryArtifact.status,
			version: registryArtifact.version,
			previewText: registryArtifact.previewText,
		};
	}, [registryArtifact]);

	const [inputValue, setInputValue] = useState("");
	const [canvasTab, setCanvasTab] = useState<"registry" | "page">(() => {
		if (typeof window !== "undefined") {
			const p = new URLSearchParams(window.location.search).get("tab");
			if (p === "page") return "page";
		}
		return "registry";
	});
	const [bridgeStoryContext, setBridgeStoryContext] = useState<BridgeStoryContext | null>(null);
	const [hasBridgeMessage, setHasBridgeMessage] = useState(false);
	const [trackingUnavailable, setTrackingUnavailable] = useState(false);

	const localStoryPath = useMemo(() => getStoryPathValue(storybookPath), [storybookPath]);
	const effectiveStoryPath = hasBridgeMessage
		? bridgeStoryContext?.path || ""
		: trackingUnavailable
			? ""
			: localStoryPath;

	const applyDetectedStoryContext = useCallback(
		(nextPath: string, nextId: string, nextViewMode: string, source: string) => {
			if (!nextPath) return;

			console.log("[StrideBridge] apply detected context", {
				source,
				nextPath,
				nextId,
				nextViewMode,
			});

			setHasBridgeMessage(true);
			setTrackingUnavailable(false);
			setBridgeStoryContext({path: nextPath, id: nextId, viewMode: nextViewMode});

			const inferredComponent = inferComponentFromStoryPath(nextPath);
			if (inferredComponent) {
				setSelectedComponent(inferredComponent);
			}
		},
		[setSelectedComponent]
	);

	const effectiveComponent = useMemo(() => {
		if (hasBridgeMessage && bridgeStoryContext) {
			const fromPath = inferComponentFromStoryPath(bridgeStoryContext.path);
			if (fromPath) return fromPath;
			const fromId = inferComponentFromStoryPath(bridgeStoryContext.id);
			if (fromId) return fromId;
		}
		return selectedComponent;
	}, [hasBridgeMessage, bridgeStoryContext, selectedComponent]);

	const storyContextChip = useMemo(
		() => buildStoryContextChip(effectiveComponent, `/index.html?path=${effectiveStoryPath}`),
		[effectiveComponent, effectiveStoryPath]
	);

	const availableStoriesText = useMemo(() => buildAvailableStoriesText(), []);

	useEffect(() => {
		const expectedOrigin = new URL(STORYBOOK_BASE).origin;
		const allowedSources = new Set([
			"stride-storybook",
			"stride-storybook-preview",
			"stride-storybook-manager",
			"storybook-manager",
			"storybook-preview",
		]);
		const expectedOriginAlt = expectedOrigin.includes("stide-")
			? expectedOrigin.replace("stide-", "stride-")
			: expectedOrigin.replace("stride-", "stide-");
		const localDevOrigins = [
			window.location.origin,
			"http://localhost:3000",
			"http://127.0.0.1:3000",
			"http://localhost:6006",
			"http://127.0.0.1:6006",
		];
		const allowedOrigins = new Set([expectedOrigin, expectedOriginAlt, ...localDevOrigins]);

		const onMessage = (event: MessageEvent) => {
			console.log("[StrideBridge] iframe -> parent (raw)", {
				origin: event.origin,
				rawData: event.data,
			});

			if (!allowedOrigins.has(event.origin)) {
				console.log("[StrideBridge] ignored message (origin mismatch)", {
					origin: event.origin,
					allowedOrigins: Array.from(allowedOrigins),
				});
				return;
			}
			const data = parseBridgeMessageData(event.data);
			if (!data || !isStoryContextMessage(data)) {
				console.log("[StrideBridge] ignored message (not story context)", {
					parsed: data,
				});
				return;
			}

			if (data.source && !allowedSources.has(data.source)) {
				console.log("[StrideBridge] unrecognized source on trusted origin, accepting", {
					source: data.source,
					allowedSources: Array.from(allowedSources),
				});
			}

			const nextPath = extractStoryPathFromBridgeMessage(data);
			if (!nextPath || typeof nextPath !== "string") {
				console.log("[StrideBridge] ignored message (missing path)", {
					parsed: data,
				});
				return;
			}

			const nextId = extractStoryIdFromBridgeMessage(data);
			const nextViewMode = extractViewModeFromBridgeMessage(data);

			console.log("[StrideBridge] accepted story context", {
				origin: event.origin,
				nextPath,
				nextId,
				nextViewMode,
				source: data.source || "(none)",
			});

			applyDetectedStoryContext(nextPath, nextId, nextViewMode, "postmessage");
		};

		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, [applyDetectedStoryContext]);

	const handleIframeStoryContextDetected = useCallback(
		(context: {href: string; path: string; id: string; viewMode: string; source: string}) => {
			console.log("[StrideBridge] context from iframe location", context);
			if (context.source === "tracking-unavailable") {
				setTrackingUnavailable(true);
				setHasBridgeMessage(false);
				setBridgeStoryContext(null);
				return;
			}

			if (context.source === "parent-url") {
				return;
			}
			applyDetectedStoryContext(
				context.path,
				context.id,
				context.viewMode,
				context.source || "iframe-location"
			);
		},
		[applyDetectedStoryContext]
	);

	const handleUserMessage = useCallback(
		async (text: string) => {
			if (!text.trim()) return;
			setInputValue("");
			addMessage({role: "user", content: text});

			const lower = text.toLowerCase();
			const isSetupRequest =
				lower.includes("design system") ||
				lower.includes("storybook") ||
				lower.includes("set up") ||
				lower.includes("setup") ||
				lower.includes("help");

			if (isSetupRequest && phase === "idle") {
				setPhase("thinking");
				setTimeout(() => {
					setPhase("proposal");
					addMessage({
						role: "assistant",
						content: OPAL_PROPOSAL,
						cardAfterKey: "ds-proposal",
					});
				}, 1600);
			} else if (phase === "page-offer") {
				const lower = text.toLowerCase();
				if (
					lower.includes("yes") ||
					lower.includes("build") ||
					lower.includes("sure") ||
					lower.includes("ok") ||
					lower.includes("go")
				) {
					showHeroPickStep();
				}
			} else if (phase === "hero-pick") {
				const lower = text.toLowerCase();
				const choice = lower.includes("center")
					? "centered"
					: lower.includes("event")
						? "event"
						: "default";
				void runPageGeneration(choice);
			} else if (phase === "live" || phase === "complete") {
				setPhase("thinking");
				try {
					const history = messages
						.filter((m) => m.role === "user" || m.role === "assistant")
						.slice(-8)
						.map((m) => ({role: m.role as "user" | "assistant", content: m.content}));

					const llm = await requestStrideLlmReply({
						userText: text,
						storyContextChip,
						storyPath: effectiveStoryPath,
						savedRulesCount: savedRules.length,
						availableStoriesText,
						history,
					});

					for (const command of llm.commands || []) {
						if (command?.type !== "navigate_to_story") continue;
						const targetComponent = (command.component || "").toLowerCase();
						const targetStoryPath = STORY_PATHS_BY_COMPONENT[targetComponent];
						if (targetStoryPath) {
							setSelectedComponent(targetComponent);
							setStorybookPath(targetStoryPath);
						}
					}

					setPhase("live");
					addMessage({role: "assistant", content: llm.reply});
				} catch (error) {
					console.error("Stride DS LLM request failed", error);
					setPhase("live");
					addMessage({
						role: "assistant",
						content:
							"I hit a temporary issue talking to the model. I can keep going with guided suggestions while we retry.",
					});
				}
			}
		},
		[
			phase,
			addMessage,
			setPhase,
			storyContextChip,
			effectiveStoryPath,
			savedRules.length,
			availableStoriesText,
			messages,
			setSelectedComponent,
			setStorybookPath,
			showHeroPickStep,
			runPageGeneration,
		]
	);

	const heroPickerUrls = useMemo(() => {
		if (!registryArtifact?.previewText) return {default: null, centered: null};
		try {
			const parsed = JSON.parse(registryArtifact.previewText) as {
				registry?: Record<string, {"storybook url"?: string}>;
			};
			const normalize = (v: string) =>
				v
					.trim()
					.toLowerCase()
					.replace(/[^a-z0-9]/g, "");
			let defaultUrl: string | null = null;
			let centeredUrl: string | null = null;
			for (const [name, entry] of Object.entries(parsed.registry || {})) {
				const n = normalize(name);
				const rawUrl = entry["storybook url"];
				if (!rawUrl) continue;
				// Per-variant entries: "Hero Default", "Hero Centered"
				if (n === "herodefault" || n === "hero") {
					defaultUrl = toIsolatedStoryUrl(rawUrl);
				} else if (n === "herocentered") {
					centeredUrl = toIsolatedStoryUrl(rawUrl);
				}
			}
			// Fall back to deriving centered from default if no explicit centered entry
			if (defaultUrl && !centeredUrl) {
				centeredUrl = deriveVariantStoryUrl(defaultUrl, "centered");
			}
			if (defaultUrl || centeredUrl) {
				return {default: defaultUrl, centered: centeredUrl};
			}
		} catch {}
		return {default: null, centered: null};
	}, [registryArtifact]);

	const handleApprovePageBuild = useCallback(() => {
		if (phase !== "page-offer") return;
		addMessage({role: "user", content: "Yes, build an example landing page"});
		showHeroPickStep();
	}, [phase, addMessage, showHeroPickStep]);

	const handleHeroChoice = useCallback(
		(choice: string) => {
			const label =
				choice === "centered"
					? "Centered hero"
					: choice === "event"
						? "Event hero"
						: "Default hero";
			addMessage({role: "user", content: label});
			void runPageGeneration(choice);
		},
		[addMessage, runPageGeneration]
	);

	const handleApprove = useCallback(() => {
		if (phase !== "proposal") return;
		addMessage({role: "user", content: "Yes, set it up"});
		setPhase("setup-pending");

		setTimeout(() => {
			addMessage({
				role: "assistant",
				content:
					"Starting now. I'll scan the UI components, generate a visual registry artifact, then map each to a CMS element type.",
				cardAfterKey: "ds-setup",
			});
			void runSetupSimulation();
		}, 400);
	}, [phase, addMessage, setPhase, runSetupSimulation]);


	const handleSaveRules = useCallback(
		(rules: typeof savedRules) => {
			setSavedRules(rules);
			addMessage({
				role: "assistant",
				content: `Saved **${rules.length} design rules**. I'll apply these to every component I generate — including naming conventions, spacing tokens, color constraints, and accessibility requirements.`,
			});
		},
		[setSavedRules, addMessage]
	);

	// Auto-start when navigated with ?autostart=1
	const autoStarted = useRef(false);
	useEffect(() => {
		if (autoStarted.current) return;
		const params = new URLSearchParams(window.location.search);
		if (params.get("autostart") === "1") {
			autoStarted.current = true;
			void handleUserMessage("help me set up my design system");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const messageCards: Record<string, React.ReactNode> = {};
	const proposalMsg = messages.find((m) => m.cardAfterKey === "ds-proposal");
	if (proposalMsg) {
		messageCards["ds-proposal"] = (
			<ApprovalActionCard
				authorName="Opal"
				isVAU
				badge="SETUP"
				fileName="stride-sports/stride-web"
				fileSubtitle="Component registry"
				approvalTitle="Generate component registry?"
				approvalDescription="I'll scan the UI components and generate a visual registry with design tokens and component documentation."
				onApprove={handleApprove}
				approvalState={phase === "proposal" ? "pending" : "approved"}
			/>
		);
	}

	const registryArtifactMsg = messages.find((m) => m.cardAfterKey === "stride-registry-artifact");
	if (registryArtifactMsg) {
		messageCards["stride-registry-artifact"] = (
			<ArtifactRefCard
				title="Stride Component Registry"
				subtitle="Generated from UI component analysis • v1.0"
				type="doc"
				onClick={() => {
					window.location.href =
						"/opal/artifacts?openArtifactId=stride-cms-registry-artifact";
				}}
			/>
		);
	}

	const pageOfferMsg = messages.find((m) => m.cardAfterKey === "page-offer");
	if (pageOfferMsg) {
		messageCards["page-offer"] = (
			<ApprovalActionCard
				authorName="Opal"
				isVAU
				badge="BUILD"
				fileName="stride-sports/stride-web"
				fileSubtitle="Example landing page • Visual Builder"
				approvalTitle="Build an example Stride landing page?"
				approvalDescription="I'll use your Hero, Card Grid, and Navigation components to assemble a working page you can edit."
				onApprove={handleApprovePageBuild}
				approvalState={phase === "page-offer" ? "pending" : "approved"}
			/>
		);
	}

	const heroPickMsg = messages.find((m) => m.cardAfterKey === "hero-pick");
	if (heroPickMsg) {
		const HERO_VARIANTS = [
			{label: "Default", value: "default", url: heroPickerUrls.default},
			{label: "Centered", value: "centered", url: heroPickerUrls.centered},
		];
		messageCards["hero-pick"] = (
			<Box display="flex" gap="8">
				{HERO_VARIANTS.map((v) => (
					<Box key={v.value} style={{flex: 1}}>
						<PreviewCard
							label={v.label}
							storybookUrl={v.url}
							previewHeight={90}
							iframeStyle={iframeStyleForTileSize(148, 90, STORY_SIZES["ct-hero"])}
							onClick={() => phase === "hero-pick" && handleHeroChoice(v.value)}
						/>
					</Box>
				))}
			</Box>
		);
	}

	const pageArtifactMsg = messages.find((m) => m.cardAfterKey === "page-artifact");
	if (pageArtifactMsg) {
		messageCards["page-artifact"] = (
			<ArtifactRefCard
				title="Stride Landing Page"
				subtitle="Example page • Visual Builder"
				type="doc"
				onClick={() => setCanvasTab("page")}
			/>
		);
	}

	const isSettingUp = phase === "setup-pending" || phase === "setting-up";

	return (
		<>
			<style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

			<OpalChatView
				messages={messages}
				inputValue={inputValue}
				setInputValue={setInputValue}
				isLoading={phase === "thinking" || phase === "page-generating"}
				onSend={handleUserMessage}
				onSuggestionClick={handleUserMessage}
				leftCanvas={
					<CanvasPanel
						phase={phase}
						storybookPath={storybookPath}
						hydrated={hydrated}
						onStoryContextDetected={handleIframeStoryContextDetected}
						artifact={canvasArtifact}
						onUpdateArtifactPreviewText={updateRegistryArtifactPreviewText}
						canvasTab={canvasTab}
						onCanvasTabChange={setCanvasTab}
						pageArtifactReady={pageArtifactReady}
					/>
				}
				messageCards={messageCards}
				contextualActionCard={
					isSettingUp ? <SetupProgressCard steps={setupSteps} /> : undefined
				}
				headerTitle="Design System Setup"
				variant="assistant"
				emptyState={
					<Box
						display="flex"
						flexDirection="column"
						alignItems="center"
						justifyContent="center"
						gap="12"
						style={{height: "100%", padding: "32px 24px"}}
					>
						<img src="/opal-orb.png" alt="Opal" width={40} height={40} />
						<Text
							fontSize="md"
							fontWeight="500"
							color="fg.default"
							style={{textAlign: "center"}}
						>
							Design System Setup
						</Text>
						<Text
							fontSize="sm"
							color="fg.secondary"
							style={{textAlign: "center", maxWidth: 240}}
						>
							Ask Opal to scan your UI components, generate a visual registry, and map
							each to a CMS element type.
						</Text>
					</Box>
				}
			/>

			<RulesPanel
				open={rulesOpen}
				rules={savedRules}
				onClose={() => setRulesOpen(false)}
				onSave={handleSaveRules}
			/>
		</>
	);
}

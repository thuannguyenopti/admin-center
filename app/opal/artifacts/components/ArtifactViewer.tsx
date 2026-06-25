"use client";

import {
	Box,
	Text,
	Button,
	Badge,
	Avatar,
	Tooltip,
	SearchInput,
	Spinner,
	ToggleButton,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	Disclosure,
	DisclosureContent,
	DisclosureTrigger,
	Alert,
	Popover,
	PopoverTrigger,
	PopoverContent,
	Textarea,
} from "@optiaxiom/react";
import {OpalChatView} from "@/app/components/Opal/OpalChatView";
import {CodeCanvasPanel} from "@/app/components/Opal/CodeCanvasPanel";
import type {ChatMessage as OpalChatMessage} from "@/app/hooks/useOpalState";
import {
	IconArrowsMaximize,
	IconAgent,
	IconCodeBranch,
	IconComments,
	IconCopy,
	IconDownload,
	IconFile,
	IconImage,
	IconCode,
	IconPresentationScreen,
	IconFileSpreadsheet,
	IconChartColumn,
	IconCircleCheckSolid,
	IconPen,
} from "@optimizely/axiom-icons";
import {
	IconBook,
	IconCheck,
	IconCode as IconCodeCompat,
	IconComments as IconCommentsCompat,
	IconEye,
	IconXmark,
} from "@/app/lib/axiom-icons";
import {IconPaintRoller} from "@optiaxiom/icons";
import Image from "next/image";
import {useState, useEffect, useRef, useMemo, useCallback} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import usePersistentState from "@/app/usePersistentState";
import {initialContentTypes, type ContentType} from "@/app/db/initialData";
import {BlockRegistry} from "@/app/components/vb/blocks";
import {BLOCK_SCHEMAS} from "@/app/components/vb/blocks/schemas";
import {iframeStyleForTileSize} from "@/app/components/PreviewCard";
import {STORY_SIZES} from "@/app/components/vb/storySizes";
import {createPortal} from "react-dom";
import Flow from "@/app/components/Flow";

const BORDER_S = "1px solid var(--ax-colors-border-secondary)";
const BORDER_T = "1px solid var(--ax-colors-border-tertiary)";

// Matches the Figma "Island - contents" radial gradient thumb
const THUMB_GRADIENT =
	"radial-gradient(ellipse at 20% 20%, rgba(245,243,255,1) 5%, rgba(229,239,255,1) 61%, rgba(221,214,254,1) 85%)";

const TYPE_ICON: Record<string, React.ReactNode> = {
	Document: <IconFile size={20} />,
	Image: <IconImage size={20} />,
	Code: <IconCode size={20} />,
	Presentation: <IconPresentationScreen size={20} />,
	Spreadsheet: <IconFileSpreadsheet size={20} />,
	Report: <IconChartColumn size={20} />,
};

/** Figma "Island - contents" card — used as the canvas tile in chat */
function IslandContentTile({
	name,
	type,
	description,
	onExpand,
}: {
	name: string;
	type: string;
	description?: string;
	onExpand?: () => void;
}) {
	return (
		<Box
			bg="bg.default"
			display="flex"
			alignItems="center"
			gap="8"
			p="16"
			style={{
				border: BORDER_T,
				borderRadius: 12,
				overflow: "hidden",
				cursor: "default",
			}}
		>
			{/* Icon thumb with gradient */}
			<Box
				display="flex"
				alignItems="center"
				justifyContent="center"
				rounded="sm"
				style={{
					padding: "8px 12px",
					background: THUMB_GRADIENT,
					flexShrink: 0,
					color: "var(--ax-colors-fg-default)",
				}}
			>
				{TYPE_ICON[type] ?? <IconFile size={20} />}
			</Box>

			{/* Text */}
			<Box display="flex" flexDirection="column" style={{flex: 1, minWidth: 0}}>
				<Text
					fontSize="md"
					fontWeight="600"
					style={{
						lineHeight: "24px",
						letterSpacing: "-0.154px",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{name}
				</Text>
				{description && (
					<Text
						fontSize="md"
						color="fg.secondary"
						style={{
							lineHeight: 1.6,
							letterSpacing: "-0.21px",
							overflow: "hidden",
							display: "-webkit-box",
							WebkitBoxOrient: "vertical",
							WebkitLineClamp: 2,
						}}
					>
						{description}
					</Text>
				)}
			</Box>

			{/* Expand button */}
			<Tooltip content="Open artifact" delayDuration={300}>
				<span style={{display: "inline-flex", flexShrink: 0}}>
					<Button
						appearance="subtle"
						size="sm"
						icon={<IconArrowsMaximize size={14} />}
						aria-label="Open artifact"
						onClick={onExpand}
					/>
				</span>
			</Tooltip>
		</Box>
	);
}

// ─── Team Thread Panel ────────────────────────────────────────────────────────

type ApprovalState = "pending" | "approved" | "changes";

/** Inline approval action card — matches opal/page.tsx ApprovalActionCard */
function ThreadApprovalCard({
	state,
	onApprove,
	onRequestChanges,
}: {
	state: ApprovalState;
	onApprove: () => void;
	onRequestChanges: () => void;
}) {
	if (state !== "pending") {
		return (
			<Box
				display="flex"
				flexDirection="column"
				gap="4"
				p="16"
				rounded="lg"
				style={{
					border: BORDER_S,
					background: "var(--ax-colors-bg-default)",
					opacity: 0.6,
				}}
			>
				<Text
					fontWeight="500"
					style={{fontSize: 14, color: "var(--ax-colors-fg-default)", lineHeight: 1.43}}
				>
					Team approval needed for Q and A: Discover the unknown
				</Text>
				<Text
					style={{fontSize: 14, color: "var(--ax-colors-fg-tertiary)", lineHeight: 1.43}}
				>
					Jamie Chen: {state === "approved" ? "Approved" : "Requested changes"}
				</Text>
			</Box>
		);
	}
	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="12"
			p="20"
			rounded="lg"
			style={{border: BORDER_S, background: "var(--ax-colors-bg-default)"}}
		>
			{/* Agent indicator */}
			<Box display="flex" alignItems="center" gap="4">
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					rounded="xs"
					style={{
						width: 20,
						height: 20,
						background: "#e4f0da",
						flexShrink: 0,
						overflow: "hidden",
					}}
				>
					<Image src="/avatars/mock-avatar-geo.svg" alt="GEO" width={14} height={14} />
				</Box>
				<Text
					style={{
						fontSize: 12,
						fontWeight: 400,
						letterSpacing: "0.36px",
						textTransform: "uppercase",
						color: "var(--ax-colors-fg-tertiary)",
						lineHeight: 1.25,
					}}
				>
					Frank
				</Text>
			</Box>

			{/* File info */}
			<Box display="flex" flexDirection="column" gap="4">
				<Text
					fontWeight="600"
					style={{fontSize: 16, lineHeight: 1.3, color: "var(--ax-colors-fg-default)"}}
				>
					Q and A: Discover the unknown
				</Text>
				<Text
					style={{
						fontSize: 14,
						letterSpacing: "0.28px",
						color: "var(--ax-colors-fg-secondary)",
						lineHeight: 1.43,
					}}
				>
					GEO Q&amp;A article · v2.0
				</Text>
			</Box>

			<Box
				style={{height: 1, background: "var(--ax-colors-border-default)", width: "100%"}}
			/>

			{/* Key insight */}
			<Box
				display="flex"
				flexDirection="column"
				gap="8"
				p="16"
				rounded="sm"
				style={{background: "#f6faf3"}}
			>
				<Text
					fontWeight="500"
					style={{
						fontSize: 14,
						letterSpacing: "0.28px",
						color: "var(--ax-colors-fg-default)",
						lineHeight: 1.43,
					}}
				>
					Team approval needed
				</Text>
				<Text
					style={{
						fontSize: 14,
						letterSpacing: "0.28px",
						color: "var(--ax-colors-fg-secondary)",
						lineHeight: 1.43,
					}}
				>
					Review the updated Q&amp;A article. Approve to proceed with publishing, or
					request further changes.
				</Text>
			</Box>

			{/* Actions */}
			<Box display="flex" justifyContent="flex-end" gap="4">
				<Button appearance="subtle" size="md" onClick={onRequestChanges}>
					Ask Changes
				</Button>
				<Button
					appearance="primary"
					size="md"
					onClick={onApprove}
					icon={<IconCircleCheckSolid size={14} />}
				>
					Approve
				</Button>
			</Box>
		</Box>
	);
}

/** A single message bubble in the team thread */
function ThreadMessage({
	author,
	avatar,
	isAgent,
	time,
	children,
}: {
	author: string;
	avatar?: string;
	isAgent?: boolean;
	time: string;
	children: React.ReactNode;
}) {
	return (
		<Box display="flex" flexDirection="column" gap="8">
			{/* Row: avatar + name + time */}
			<Box display="flex" alignItems="center" gap="8">
				{isAgent ? (
					<Box
						display="flex"
						alignItems="center"
						justifyContent="center"
						rounded="sm"
						style={{
							width: 28,
							height: 28,
							background: "#e4f0da",
							flexShrink: 0,
							overflow: "hidden",
						}}
					>
						<Image
							src="/avatars/mock-avatar-geo.svg"
							alt={author}
							width={20}
							height={20}
						/>
					</Box>
				) : (
					<Avatar name={author} src={avatar} size="sm" style={{flexShrink: 0}} />
				)}
				<Text fontSize="sm" fontWeight="600" color="fg.default">
					{author}
				</Text>
				<Text fontSize="sm" color="fg.tertiary">
					{time}
				</Text>
			</Box>
			{/* Content */}
			<Box pl="32" display="flex" flexDirection="column" gap="10">
				{children}
			</Box>
		</Box>
	);
}

const GEO_V1_DESCRIPTION =
	"GEO-optimised Q&A article covering Stride Discover the Unknown — 7 core Q&A pairs targeting AI search citations.";
const GEO_V2_DESCRIPTION =
	"Updated v2: explicit activity callouts (trail running, climbing, diving, skydiving), adventure-first tone, competitive team challenges emphasis.";

const VAU_INITIAL_TEXT = `I've autonomously generated a Q&A article for the Stride "Discover the Unknown" campaign. The article is structured around 7 core question-and-answer pairs optimized for AI-powered search citations. I've aligned the content with Stride's adventure travel positioning and targeted long-tail queries across the outdoor activities vertical.

Please review and approve to proceed with publishing.`;

const VAU_UPDATED_TEXT = `I've incorporated your feedback:

✓ **Activities** — Explicitly listed trail running, climbing, diving, skydiving, and multi-terrain endurance challenges
✓ **Team use cases** — Rewired around competitive multi-sport group challenges, not generic team building
✓ **Opening tone** — Rewrote the first 3 Q&As in Stride's adventurous, explorer-first voice

The updated article is ready for final review.`;

function TeamThreadPanel({artifact}: {artifact: ArtifactViewerArtifact}) {
	const [approvalState, setApprovalState] = useState<ApprovalState>("pending");
	const bottomRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({behavior: "smooth"});
	}, [approvalState]);

	return (
		<Box
			display="flex"
			flexDirection="column"
			style={{height: "100%", overflowY: "auto", background: "var(--ax-colors-bg-default)"}}
		>
			{/* Header */}
			<Box
				display="flex"
				alignItems="center"
				gap="10"
				px="16"
				py="12"
				style={{borderBottom: BORDER_S, flexShrink: 0}}
			>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					rounded="md"
					style={{
						width: 32,
						height: 32,
						background: "#e4f0da",
						flexShrink: 0,
						overflow: "hidden",
					}}
				>
					<Image src="/avatars/mock-avatar-geo.svg" alt="GEO" width={22} height={22} />
				</Box>
				<Box display="flex" flexDirection="column" gap="2" style={{flex: 1, minWidth: 0}}>
					<Text fontSize="sm" fontWeight="600">
						Frank
					</Text>
					<Text fontSize="sm" color="fg.tertiary">
						Team approval thread
					</Text>
				</Box>
				<Badge intent="warning">In Review</Badge>
			</Box>

			{/* Thread messages */}
			<Box display="flex" flexDirection="column" gap="24" p="16">
				{/* ── Message 1: VAU initial ── */}
				<ThreadMessage author="Frank" isAgent time="Today at 9:02 AM">
					<Text
						fontSize="sm"
						color="fg.secondary"
						style={{whiteSpace: "pre-line", lineHeight: 1.6}}
					>
						{VAU_INITIAL_TEXT}
					</Text>
					{/* Canvas tile v1 */}
					<IslandContentTile
						name="Q and A: Discover the unknown"
						type="Document"
						description={GEO_V1_DESCRIPTION}
					/>
					{/* First approval card — already actioned (collapsed) */}
					<Box
						display="flex"
						flexDirection="column"
						gap="4"
						p="16"
						rounded="lg"
						style={{
							border: BORDER_S,
							background: "var(--ax-colors-bg-default)",
							opacity: 0.6,
						}}
					>
						<Text
							fontWeight="500"
							style={{
								fontSize: 14,
								color: "var(--ax-colors-fg-default)",
								lineHeight: 1.43,
							}}
						>
							Team approval needed for Q and A: Discover the unknown v1
						</Text>
						<Box display="flex" gap="12">
							<Text
								style={{
									fontSize: 14,
									color: "var(--ax-colors-fg-tertiary)",
									lineHeight: 1.43,
								}}
							>
								Jamie Chen: Requested changes
							</Text>
							<Text
								style={{
									fontSize: 14,
									color: "var(--ax-colors-fg-tertiary)",
									lineHeight: 1.43,
								}}
							>
								Riley Park: Requested changes
							</Text>
						</Box>
					</Box>
				</ThreadMessage>

				{/* ── Message 2: JC feedback ── */}
				<ThreadMessage author="Jamie Chen" avatar="/avatars/jc.png" time="Today at 9:18 AM">
					<Text fontSize="sm" color="fg.secondary" style={{lineHeight: 1.6}}>
						Good start! The Q&amp;A structure is solid and the schema markup looks
						right. A few tweaks needed before we can approve:
					</Text>
					<Box
						display="flex"
						flexDirection="column"
						gap="6"
						p="12"
						rounded="md"
						style={{background: "var(--ax-colors-bg-page)", border: BORDER_T}}
					>
						{[
							"The activities list is too generic — explicitly call out trail running, rock climbing, diving, skydiving, and multi-terrain endurance challenges to match Stride's positioning.",
							"The opening tone needs to be more adventurous and explorer-first. It currently reads like a generic product FAQ.",
						].map((item, i) => (
							<Box key={i} display="flex" gap="8" alignItems="start">
								<Text
									fontSize="sm"
									color="fg.tertiary"
									style={{flexShrink: 0, paddingTop: 2}}
								>
									{i + 1}.
								</Text>
								<Text fontSize="sm" color="fg.secondary" style={{lineHeight: 1.6}}>
									{item}
								</Text>
							</Box>
						))}
					</Box>
				</ThreadMessage>

				{/* ── Message 3: Riley feedback ── */}
				<ThreadMessage
					author="Riley Park"
					avatar="/avatars/user2.png"
					time="Today at 9:24 AM"
				>
					<Text fontSize="sm" color="fg.secondary" style={{lineHeight: 1.6}}>
						+1 to JC&apos;s notes. Also the team-use section leans too much toward
						generic team building — it should emphasize competitive multi-sport group
						challenges, which is core to the Stride brand. Looking forward to the
						revision!
					</Text>
				</ThreadMessage>

				{/* ── Message 4: VAU updated ── */}
				<ThreadMessage author="Frank" isAgent time="Today at 9:31 AM">
					<Text
						fontSize="sm"
						color="fg.secondary"
						style={{whiteSpace: "pre-line", lineHeight: 1.6}}
					>
						{VAU_UPDATED_TEXT}
					</Text>
					{/* Canvas tile v2 */}
					<IslandContentTile
						name="Q and A: Discover the unknown"
						type="Document"
						description={GEO_V2_DESCRIPTION}
					/>
					{/* Final approval card — interactive */}
					<ThreadApprovalCard
						state={approvalState}
						onApprove={() => setApprovalState("approved")}
						onRequestChanges={() => setApprovalState("changes")}
					/>
				</ThreadMessage>

				{/* Approved / changes-requested confirmation */}
				{approvalState === "approved" && (
					<Box
						display="flex"
						alignItems="center"
						gap="8"
						p="12"
						rounded="md"
						style={{
							background: "#f0faf0",
							border: "1px solid var(--ax-colors-border-secondary)",
						}}
					>
						<IconCircleCheckSolid
							size={16}
							style={{color: "var(--ax-colors-fg-accent)", flexShrink: 0}}
						/>
						<Text fontSize="sm" fontWeight="500" color="fg.default">
							You approved — submitting for publication.
						</Text>
					</Box>
				)}
				{approvalState === "changes" && (
					<Box
						display="flex"
						alignItems="center"
						gap="8"
						p="12"
						rounded="md"
						style={{background: "var(--ax-colors-bg-page)", border: BORDER_S}}
					>
						<IconPen
							size={14}
							style={{color: "var(--ax-colors-fg-tertiary)", flexShrink: 0}}
						/>
						<Text fontSize="sm" color="fg.secondary">
							Changes requested — VAU will revise and resubmit.
						</Text>
					</Box>
				)}

				<div ref={bottomRef} />
			</Box>
		</Box>
	);
}

type ArtifactSource = "chat" | "agent" | "workflow" | "thread";

export type ArtifactViewerArtifact = {
	id: string;
	name: string;
	type: string;
	sourceType: ArtifactSource;
	sourceName: string;
	sourceLink?: string;
	createdBy: {name: string; avatar?: string};
	created: string;
	status: string;
	version?: string;
	imageUrl?: string;
	previewText?: string;
	hasTeamThread?: boolean;
};

type RegistryPreviewItem = {
	name: string;
	storybookUrl: string;
	cmsElementType: string | undefined;
	schema: Record<string, unknown> | undefined;
	mapped: boolean;
	description?: string;
};

// ─── Mock content by artifact type ───────────────────────────────────────────

const MOCK_CONTENT: Record<string, string> = {
	Document: `<p>Dear valued customer, as we head into Q2 we want to acknowledge the partnership we've built together over the past year. Your investment in our platform has driven measurable results — and we're confident the next chapter will deliver even more.</p><p>To show our appreciation, we're extending an exclusive renewal offer: <strong>15% off your enterprise subscription</strong> when you renew within the next 14 days. This is our way of saying thank you for being part of the journey.</p><p>Ready to continue building momentum? Your account team is standing by to walk you through everything that's new — and everything that's coming.</p>`,
	Report: `<h1>Competitive Analysis Report</h1><p>This report provides a deep-dive into 5 key competitors, analyzing their positioning, pricing, and content strategies to uncover gaps and opportunities.</p><h2>Key Findings</h2><ul><li><strong>Competitor A</strong> leads on pricing transparency but lags in enterprise features.</li><li><strong>Competitor B</strong> has strong brand recognition but poor NPS scores.</li><li><strong>Competitor C</strong> is gaining traction in the mid-market with aggressive bundling.</li></ul><h2>Recommendations</h2><p>Focus messaging on enterprise reliability and workflow integrations where competitors are weakest. Prioritize case studies from the financial services vertical.</p>`,
	Spreadsheet: `<h2>Content Calendar — April</h2><p>This spreadsheet tracks all planned content across channels for April. Each row represents a published asset with its status, owner, and publish date.</p><h3>Summary</h3><ul><li>32 total assets planned</li><li>18 completed, 10 in review, 4 not started</li><li>Top channels: Blog (12), Social (8), Email (6), Video (4)</li></ul>`,
	Presentation: `<h1>Q1 Sales Deck</h1><p>Exec-level Q1 readout covering pipeline performance, ARR highlights, and strategic priorities for Q2.</p><h2>Q1 Highlights</h2><ul><li>ARR grew 23% YoY to $48M</li><li>Net new logos: 47 enterprise accounts</li><li>NRR: 118%</li></ul><h2>Q2 Priorities</h2><p>Expand into EMEA, accelerate partner channel, and launch the AI-powered workflow suite in June.</p>`,
	Code: `<h2>A/B Test Variants — Checkout CTA</h2><p>Three CTA copy variants optimized for checkout conversion, with tracking snippets for each.</p><pre><code>// Variant A
const CTA_A = "Start your free trial";

// Variant B
const CTA_B = "Get started — no credit card required";

// Variant C
const CTA_C = "Claim your 30-day trial";</code></pre><p>Deploy via feature flag <code>checkout_cta_test</code>. Target: 33% traffic split across all three variants.</p>`,
};

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function getMockContent(type: string, artifactId?: string, previewText?: string): string {
	if (artifactId === "stride-cms-registry-artifact") {
		const jsonText =
			previewText && previewText.trim().length > 0 ? previewText : '{\n  "registry": {}\n}';
		return `<pre><code>${escapeHtml(jsonText)}</code></pre>`;
	}
	return MOCK_CONTENT[type] ?? `<p>This artifact does not have a text preview.</p>`;
}

function parseRegistryItems(previewText?: string): RegistryPreviewItem[] {
	if (!previewText) return [];

	try {
		const parsed = JSON.parse(previewText) as {
			registry?: Record<
				string,
				{
					description?: unknown;
					"storybook url"?: unknown;
					"cms element type"?: unknown;
					"cms type schema"?: unknown;
				}
			>;
		};

		if (!parsed.registry || typeof parsed.registry !== "object") {
			return [];
		}

		return Object.entries(parsed.registry)
			.map(([name, entry]) => {
				const storybookUrl =
					typeof entry?.["storybook url"] === "string" ? entry["storybook url"] : "";
				if (!storybookUrl) return null;

				const cmsElementType =
					typeof entry?.["cms element type"] === "string"
						? entry["cms element type"]
						: undefined;

				const schema =
					entry?.["cms type schema"] &&
					typeof entry["cms type schema"] === "object" &&
					!Array.isArray(entry["cms type schema"])
						? (entry["cms type schema"] as Record<string, unknown>)
						: undefined;

				const description =
					typeof entry?.description === "string" ? entry.description : undefined;

				return {name, storybookUrl, cmsElementType, schema, description, mapped: false};
			})
			.filter((item) => item !== null) as RegistryPreviewItem[];
	} catch {
		return [];
	}
}

const STRIDE_STORYBOOK_BASE = "https://stide-mock.vercel.app/storybook";

function toIsolatedStoryUrl(storybookUrl: string): string {
	try {
		const url = new URL(storybookUrl);
		const pathParam = url.searchParams.get("path");
		if (!pathParam || !pathParam.startsWith("/story/")) {
			return storybookUrl;
		}

		const storyId = pathParam.replace("/story/", "");
		// Registry entries from local dev have localhost origins — remap to the deployed storybook.
		const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
		const base = isLocal
			? STRIDE_STORYBOOK_BASE
			: `${url.origin}${url.pathname.replace(/\/?$/, "")}`;
		return `${base}/iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story`;
	} catch {
		return storybookUrl;
	}
}

function normalizeTypeName(s: string): string {
	return s
		.toLowerCase()
		.replace(/^ct-/, "")
		.replace(/[\s\-_]+/g, "");
}

// Higher score = better name→type match; used to break dedup ties.

// Derive the Storybook URL for a variant by substituting its templateValue into the base story slug.
function deriveVariantStoryUrl(baseUrl: string, templateValue: string): string {
	const stripSuffix = (slug: string) => {
		const i = slug.lastIndexOf("--");
		return i >= 0 ? slug.slice(0, i) : slug;
	};
	try {
		const url = new URL(baseUrl);
		const pathParam = url.searchParams.get("path");
		if (pathParam?.startsWith("/story/")) {
			const slugBase = stripSuffix(pathParam.replace("/story/", ""));
			url.searchParams.set("path", `/story/${slugBase}--${templateValue}`);
			return url.toString();
		}
		const idParam = url.searchParams.get("id");
		if (idParam) {
			url.searchParams.set("id", `${stripSuffix(idParam)}--${templateValue}`);
			return url.toString();
		}
	} catch {}
	return baseUrl;
}

// ─── Registry Card ───────────────────────────────────────────────────────────

function RegistryCard({
	item,
	localOverride,
	onDescriptionChange,
	onOpenFullPreview,
}: {
	item: RegistryPreviewItem;
	localOverride?: {cmsElementType?: string; description?: string};
	onDescriptionChange: (name: string, desc: string) => void;
	onOpenFullPreview: (item: RegistryPreviewItem) => void;
}) {
	const currentType = localOverride?.cmsElementType ?? item.cmsElementType;
	const currentDesc = localOverride?.description ?? item.description ?? "";
	const [editingDesc, setEditingDesc] = useState(false);
	const [draftDesc, setDraftDesc] = useState(currentDesc);
	const [popoverOpen, setPopoverOpen] = useState(false);
	// Mirrors ColElementGridPicker's selectedTemplates[type] — purely display state, never touches CMS mapping
	const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

	// Derive root type (if currentType is a variant, resolve to its parent)
	const rootType = (currentType && BLOCK_SCHEMAS[currentType]?.variantOf) ?? currentType ?? null;

	// Build the ordered style list: base first, then registered variants
	const styleList = useMemo(() => {
		if (!rootType) return [];
		const baseSchema = BLOCK_SCHEMAS[rootType];
		if (!baseSchema) return [];
		const baseDefaultKey =
			(baseSchema.properties?.displayTemplateKey as {default?: string} | undefined)
				?.default ?? "";
		const baseLabel =
			BLOCK_SCHEMAS[rootType]?.displayLabel ??
			(baseDefaultKey
				? baseDefaultKey.replace(/[A-Z][a-z]+$/, "").toLowerCase() || "default"
				: "default");
		const variants = Object.entries(BLOCK_SCHEMAS)
			.filter(([, s]) => s.variantOf === rootType)
			.map(([id, s]) => ({id, label: s.displayLabel ?? s.templateValue ?? id}));
		return [{id: rootType, label: baseLabel}, ...variants];
	}, [rootType]);

	const hasStyles = styleList.length > 1;

	// Active iframe URL: selectedStyle (schema ID) drives which variant story to render (CMS type unchanged)
	const activeIframeUrl = useMemo(() => {
		if (!selectedStyle) return item.storybookUrl;
		const templateValue = BLOCK_SCHEMAS[selectedStyle]?.templateValue;
		if (!templateValue) return item.storybookUrl;
		return deriveVariantStoryUrl(item.storybookUrl, templateValue);
	}, [item.storybookUrl, selectedStyle]);

	// Sync draft when currentDesc changes from outside
	useEffect(() => {
		if (!editingDesc) setDraftDesc(currentDesc);
	}, [currentDesc, editingDesc]);

	const handleWheel = (e: React.WheelEvent) => {
		if (!hasStyles) return;
		const activeId = selectedStyle ?? rootType ?? "";
		const idx = styleList.findIndex((s) => s.id === activeId);
		const dir = e.deltaY > 0 ? 1 : -1;
		const nextIdx = (idx + dir + styleList.length) % styleList.length;
		const next = styleList[nextIdx];
		setSelectedStyle(next.id === rootType ? null : next.id);
	};

	return (
		<Box
			rounded="md"
			style={{
				border: BORDER_T,
				overflow: "hidden",
				background: "var(--ax-colors-bg-default)",
			}}
		>
			{/* Header: name + type label (scroll to cycle) */}
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				px="10"
				py="8"
				style={{borderBottom: BORDER_T}}
			>
				<Text
					fontSize="sm"
					fontWeight="600"
					style={{
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
						minWidth: 0,
						flex: 1,
					}}
				>
					{item.name}
				</Text>
				<Box
					display="flex"
					alignItems="center"
					gap="4"
					style={{flexShrink: 0, marginLeft: 8, cursor: "ns-resize"}}
					onWheel={handleWheel}
				>
					{currentType && (
						<Text fontSize="sm" color="fg.tertiary" style={{whiteSpace: "nowrap"}}>
							{currentType}
						</Text>
					)}
				</Box>
			</Box>

			{/* Storybook iframe — paint icon overlaid at bottom-right */}
			<Box
				className="registry-story-card"
				style={{position: "relative", height: 220, background: "var(--ax-colors-bg-page)"}}
			>
				<iframe
					src={toIsolatedStoryUrl(activeIframeUrl)}
					title={`Storybook preview: ${item.name}`}
					style={iframeStyleForTileSize(320, 220, STORY_SIZES[rootType ?? ""])}
				/>
				{/* Fullscreen open button */}
				<span
					role="button"
					aria-label={`Open ${item.name} in full Storybook overlay`}
					onClick={() => onOpenFullPreview(item)}
					style={{
						position: "absolute",
						top: 8,
						right: 8,
						width: 26,
						height: 26,
						borderRadius: 6,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						cursor: "pointer",
						background: "var(--ax-colors-fg-default)",
						color: "var(--ax-colors-bg-default)",
						opacity: 0,
						transition: "opacity 0.2s ease",
						zIndex: 1,
					}}
					className="registry-story-open"
				>
					<IconBook size={15} />
				</span>
				{/* Paint icon — style picker popover (only when variants exist) */}
				{hasStyles && (
					<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
						<PopoverTrigger
							size="sm"
							appearance="subtle"
							icon={<IconPaintRoller />}
							aria-label="Select style"
							style={{
								position: "absolute",
								bottom: 8,
								right: 8,
								transition: "opacity 0.2s ease",
							}}
							className="registry-story-paint"
							onClick={(e) => e.stopPropagation()}
						/>
						<PopoverContent
							side="bottom"
							align="end"
							sideOffset={4}
							onClick={(e) => e.stopPropagation()}
							style={{padding: 4, width: "auto", maxWidth: "none"}}
						>
							{/* Group header */}
							<div
								style={{
									padding: "4px 10px 6px",
									fontSize: 11,
									fontWeight: 600,
									textTransform: "uppercase",
									letterSpacing: "0.05em",
									color: "var(--ax-colors-fg-tertiary)",
									whiteSpace: "nowrap",
								}}
							>
								{rootType}
							</div>
							{/* Style sub-items */}
							{styleList.map((s) => {
								const isActive = selectedStyle
									? s.id === selectedStyle
									: s.id === rootType;
								return (
									<Text
										key={s.id}
										onClick={() => {
											setSelectedStyle(s.id === rootType ? null : s.id);
											setPopoverOpen(false);
										}}
										fontSize="md"
										style={{
											padding: "8px 12px",
											cursor: "pointer",
											borderRadius: 6,
											minWidth: 140,
											whiteSpace: "nowrap",
											color: "var(--ax-colors-fg-default)",
											background: isActive
												? "var(--ax-colors-bg-default-pressed)"
												: undefined,
										}}
										className="hover:bg-[var(--ax-colors-bg-default-hovered)]"
									>
										{s.label}
									</Text>
								);
							})}
						</PopoverContent>
					</Popover>
				)}
			</Box>

			{/* Description footer */}
			<Box px="10" py="8" style={{borderTop: BORDER_T}}>
				{editingDesc ? (
					<Box display="flex" flexDirection="column" gap="6">
						<Textarea
							value={draftDesc}
							onChange={(e) => setDraftDesc(e.target.value)}
							rows={3}
							autoFocus
						/>
						<Box display="flex" gap="4" justifyContent="flex-end">
							<Button
								appearance="subtle"
								size="sm"
								onClick={() => {
									setDraftDesc(currentDesc);
									setEditingDesc(false);
								}}
							>
								Cancel
							</Button>
							<Button
								appearance="primary"
								icon={<IconCheck />}
								size="sm"
								onClick={() => {
									onDescriptionChange(item.name, draftDesc);
									setEditingDesc(false);
								}}
							>
								Save
							</Button>
						</Box>
					</Box>
				) : (
					<Text
						fontSize="sm"
						color={currentDesc ? "fg.secondary" : "fg.disabled"}
						style={{cursor: "pointer", lineHeight: 1.5}}
						onClick={() => {
							setDraftDesc(currentDesc);
							setEditingDesc(true);
						}}
					>
						{currentDesc || "Add description…"}
					</Text>
				)}
			</Box>
		</Box>
	);
}

export function RegistryArtifactCanvas({
	artifact,
	onClose,
	chatOpen = false,
	onChatToggle,
	onUpdatePreviewText,
	hideClose = false,
}: {
	artifact: ArtifactViewerArtifact;
	onClose?: () => void;
	chatOpen?: boolean;
	onChatToggle?: () => void;
	onUpdatePreviewText?: (text: string) => void;
	hideClose?: boolean;
}) {
	const [mode, setMode] = useState<"code" | "preview">("preview");
	const [activeTab, setActiveTab] = useState<"components" | "context">("components");
	const [contextEditing, setContextEditing] = useState(false);

	const parsedContext = useMemo(() => {
		if (!artifact.previewText) return "";
		try {
			const parsed = JSON.parse(artifact.previewText) as {context?: string};
			return typeof parsed.context === "string" ? parsed.context : "";
		} catch {
			return "";
		}
	}, [artifact.previewText]);

	const [contextDraft, setContextDraft] = useState("");

	const handleContextSave = useCallback(() => {
		if (onUpdatePreviewText) {
			try {
				const parsed = JSON.parse(artifact.previewText ?? '{"registry":{}}') as {
					registry?: unknown;
					context?: string;
				};
				parsed.context = contextDraft;
				onUpdatePreviewText(JSON.stringify(parsed, null, 2));
			} catch {}
		}
		setContextEditing(false);
	}, [contextDraft, artifact.previewText, onUpdatePreviewText]);
	const [query, setQuery] = useState("");
	const [fullPreviewUrl, setFullPreviewUrl] = useState<string | null>(null);
	const [fullPreviewTitle, setFullPreviewTitle] = useState(artifact.name);
	const [llmMatches, setLlmMatches] = useState<Record<string, string | null> | null>(null);
	const [matchingStatus, setMatchingStatus] = useState<"idle" | "loading" | "done">("idle");
	const [localOverrides, setLocalOverrides] = useState<
		Record<string, {cmsElementType?: string; description?: string}>
	>({});

	const [contentTypes] = usePersistentState("contentTypes", initialContentTypes) as [
		ContentType[],
		unknown,
	];

	const applyOverrideToPreviewText = useCallback(
		(newOverrides: Record<string, {cmsElementType?: string; description?: string}>) => {
			if (!onUpdatePreviewText || !artifact.previewText) return;
			try {
				const parsed = JSON.parse(artifact.previewText) as {
					registry?: Record<string, Record<string, unknown>>;
				};
				if (!parsed.registry) return;
				for (const [name, override] of Object.entries(newOverrides)) {
					if (!parsed.registry[name]) continue;
					if (override.cmsElementType !== undefined)
						parsed.registry[name]["cms element type"] = override.cmsElementType;
					if (override.description !== undefined)
						parsed.registry[name]["description"] = override.description;
				}
				onUpdatePreviewText(JSON.stringify(parsed, null, 2));
			} catch {
				// ignore
			}
		},
		[onUpdatePreviewText, artifact.previewText]
	);

	const handleDescriptionChange = useCallback(
		(name: string, desc: string) => {
			setLocalOverrides((prev) => {
				const updated = {...prev, [name]: {...prev[name], description: desc}};
				applyOverrideToPreviewText(updated);
				return updated;
			});
		},
		[applyOverrideToPreviewText]
	);

	useEffect(() => {
		if (!artifact.previewText) return;
		const cacheKey = `opal:cms-matches:${artifact.id}`;
		const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
		if (cached) {
			try {
				setLlmMatches(JSON.parse(cached) as Record<string, string | null>);
				setMatchingStatus("done");
				return;
			} catch {}
		}
		const parsed = parseRegistryItems(artifact.previewText);
		if (!parsed.length) return;
		const allTypes = [
			...Object.keys(BlockRegistry),
			...(contentTypes as ContentType[]).map((ct) => ct.id),
		].filter((v, i, a) => a.indexOf(v) === i);
		setMatchingStatus("loading");
		fetch("/api/opal/match-cms-types", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({
				items: parsed.map((item) => ({name: item.name, hint: item.cmsElementType})),
				availableTypes: allTypes,
			}),
		})
			.then((r) => r.json())
			.then((data: {matches?: Record<string, string | null>; fallback?: boolean}) => {
				if (data.matches) {
					setLlmMatches(data.matches);
					if (!data.fallback)
						localStorage.setItem(cacheKey, JSON.stringify(data.matches));
				}
				setMatchingStatus("done");
			})
			.catch(() => setMatchingStatus("done"));
	}, [artifact.id, artifact.previewText]); // eslint-disable-line react-hooks/exhaustive-deps

	const jsonText =
		artifact.previewText && artifact.previewText.trim().length > 0
			? artifact.previewText
			: '{\n  "registry": {}\n}';

	const items = useMemo(() => {
		const parsed = parseRegistryItems(artifact.previewText);

		// Pass 1: resolve a candidate type for each item
		const withCandidates = parsed.map((item) => {
			const override = localOverrides[item.name];
			let resolvedType: string | undefined;
			if (override?.cmsElementType !== undefined) {
				resolvedType = override.cmsElementType || undefined;
			} else if (llmMatches) {
				resolvedType = llmMatches[item.name] ?? undefined;
			} else if (item.cmsElementType) {
				const norm = normalizeTypeName(item.cmsElementType);
				const matchedDbType = (contentTypes as ContentType[]).find(
					(ct) =>
						normalizeTypeName(ct.id) === norm ||
						normalizeTypeName(ct.name) === norm ||
						normalizeTypeName(ct.displayName) === norm
				);
				const matchedVbType = Object.keys(BlockRegistry).find(
					(key) => normalizeTypeName(key) === norm
				);
				resolvedType = matchedDbType?.id ?? matchedVbType ?? undefined;
			}
			const description = override?.description ?? item.description;
			return {...item, resolvedType, description};
		});

		// All variants share the same CMS type — no exclusivity needed.
		return withCandidates.map(({resolvedType, ...item}) => ({
			...item,
			cmsElementType: resolvedType,
			mapped: !!resolvedType,
		}));
	}, [artifact.previewText, llmMatches, localOverrides, contentTypes]);

	const filteredItems = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return items;
		return items.filter((item) => {
			const schemaText = item.schema ? JSON.stringify(item.schema).toLowerCase() : "";
			return (
				item.name.toLowerCase().includes(q) ||
				item.storybookUrl.toLowerCase().includes(q) ||
				(item.cmsElementType || "").toLowerCase().includes(q) ||
				schemaText.includes(q)
			);
		});
	}, [items, query]);


	const openFullPreview = (item: RegistryPreviewItem) => {
		setFullPreviewTitle(item.name);
		setFullPreviewUrl(toIsolatedStoryUrl(item.storybookUrl));
	};

	return (
		<>
			<Box
				display="flex"
				border="1"
				borderColor="border.secondary"
				rounded="lg"
				flexDirection="column"
				h="full"
				bg="bg.default"
			>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					px="12"
					py="8"
					style={{borderBottom: BORDER_S}}
				>
					<Box display="flex" alignItems="center" gap="8">
						{!hideClose && (
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconXmark size={14} />}
								aria-label="Close"
								onClick={onClose}
							/>
						)}
						<Text fontSize="sm" fontWeight="600" color="fg.default">
							{artifact.name}
						</Text>
					</Box>
					<Box display="flex" alignItems="center" gap="6">
						<ToggleButton
							size="md"
							appearance="subtle"
							pressed={mode === "code"}
							onPressedChange={() => setMode("code")}
							icon={<IconCodeCompat size={18} />}
							aria-label="Code"
						/>
						<ToggleButton
							size="md"
							appearance="subtle"
							pressed={mode === "preview"}
							onPressedChange={() => setMode("preview")}
							icon={<IconEye size={18} />}
							aria-label="Preview"
						/>
						<ToggleButton
							size="md"
							appearance="subtle"
							pressed={chatOpen}
							onPressedChange={onChatToggle}
							icon={<IconCommentsCompat size={18} />}
							aria-label={chatOpen ? "Hide panel" : "Show panel"}
						/>
					</Box>
				</Box>

				{mode === "code" ? (
					<Box
						p="16"
						style={{overflow: "auto", flex: 1, background: "var(--ax-colors-bg-page)"}}
					>
						<pre
							style={{
								margin: 0,
								fontSize: 12,
								lineHeight: 1.5,
								whiteSpace: "pre-wrap",
								wordBreak: "break-word",
								fontFamily: "monospace",
								padding: 16,
								border: BORDER_T,
								borderRadius: 8,
								background: "var(--ax-colors-bg-default)",
							}}
						>
							{jsonText}
						</pre>
					</Box>
				) : (
					<Box
						p="16"
						display="flex"
						flexDirection="column"
						gap="12"
						style={{overflow: "auto", flex: 1}}
					>
						<SearchInput
							placeholder="Search components or Storybook URLs"
							value={query}
							onValueChange={setQuery}
							onValueClear={() => setQuery("")}
						/>

						<Tabs
							value={activeTab}
							onValueChange={(v) =>
								setActiveTab(v as "components" | "context")
							}
						>
							<Box mb="8">
								<TabsList>
									<TabsTrigger value="components">
										Components
										{filteredItems.length > 0 && (
											<Badge ml="4">{filteredItems.length}</Badge>
										)}
									</TabsTrigger>
									<TabsTrigger value="context">Context</TabsTrigger>
								</TabsList>
								{matchingStatus === "loading" && (
									<Box display="flex" alignItems="center" gap="6">
										<Spinner size="sm" />
										<Text fontSize="xs" color="fg.tertiary">
											Matching types…
										</Text>
									</Box>
								)}
							</Box>

							<TabsContent value="components">
								{filteredItems.length === 0 ? (
									<Box p="16" rounded="md" style={{border: BORDER_T}}>
										<Text fontSize="sm" color="fg.tertiary">
											{query
												? "No components matched your search."
												: "No components in registry yet."}
										</Text>
									</Box>
								) : (
									<Box
										display="grid"
										style={{
											gridTemplateColumns:
												"repeat(auto-fill, minmax(320px, 1fr))",
											gap: 12,
										}}
									>
										{filteredItems.map((item) => (
											<RegistryCard
												key={item.name}
												item={item}
												localOverride={localOverrides[item.name]}
												onDescriptionChange={handleDescriptionChange}
												onOpenFullPreview={openFullPreview}
											/>
										))}
									</Box>
								)}
							</TabsContent>

							<TabsContent value="context">
								<Box display="flex" flexDirection="column" gap="12">
									<Box
										display="flex"
										alignItems="center"
										justifyContent="space-between"
									>
										<Text fontSize="sm" color="fg.tertiary">
											General context for this component registry
										</Text>
										{contextEditing ? (
											<Box display="flex" gap="6">
												<Button
													appearance="subtle"
													size="sm"
													onClick={() => {
														setContextDraft(parsedContext);
														setContextEditing(false);
													}}
												>
													Cancel
												</Button>
												<Button
													appearance="primary"
													size="sm"
													onClick={handleContextSave}
												>
													Save
												</Button>
											</Box>
										) : (
											<Button
												appearance="subtle"
												size="sm"
												icon={<IconPen />}
												onClick={() => {
													setContextDraft(parsedContext);
													setContextEditing(true);
												}}
											>
												Edit
											</Button>
										)}
									</Box>
									{contextEditing ? (
										<Textarea
											value={contextDraft}
											onChange={(e) => setContextDraft(e.target.value)}
											rows={16}
											autoFocus
											style={{
												fontFamily: "monospace",
												fontSize: 13,
												resize: "vertical",
											}}
										/>
									) : parsedContext ? (
										<Box
											style={{
												fontSize: 14,
												lineHeight: 1.7,
												color: "var(--ax-colors-fg-default)",
											}}
											className="md-prose"
										>
											<ReactMarkdown remarkPlugins={[remarkGfm]}>
												{parsedContext}
											</ReactMarkdown>
										</Box>
									) : (
										<Box p="16" rounded="md" style={{border: BORDER_T}}>
											<Text fontSize="sm" color="fg.tertiary">
												No context added yet. Click Edit to add markdown
												notes for this registry.
											</Text>
										</Box>
									)}
								</Box>
							</TabsContent>
						</Tabs>
					</Box>
				)}
			</Box>

			{fullPreviewUrl && (
				<div
					role="dialog"
					aria-modal="true"
					aria-label={`Storybook preview: ${fullPreviewTitle}`}
					onClick={() => setFullPreviewUrl(null)}
					style={{
						position: "fixed",
						inset: 0,
						zIndex: 2000,
						background: "rgba(0, 0, 0, 0.55)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						style={{
							position: "relative",
							width: "92vw",
							height: "92vh",
							background: "var(--ax-colors-bg-default)",
							borderRadius: 12,
							boxShadow: "0 24px 64px rgba(0, 0, 0, 0.35)",
							overflow: "hidden",
						}}
					>
						<Button
							appearance="subtle"
							size="sm"
							onClick={() => setFullPreviewUrl(null)}
							style={{position: "absolute", top: 12, right: 12, zIndex: 2}}
						>
							Close
						</Button>
						<iframe
							src={fullPreviewUrl}
							title={`Storybook: ${fullPreviewTitle}`}
							style={{
								width: "100%",
								height: "100%",
								border: 0,
								background: "var(--ax-colors-bg-default)",
							}}
						/>
					</div>
				</div>
			)}
		</>
	);
}

// ─── Agent Execution Log ─────────────────────────────────────────────────────

function ExecutionSection({
	label,
	children,
	open,
	onOpenChange,
}: {
	label: string;
	children: React.ReactNode;
	open: boolean;
	onOpenChange: (v: boolean) => void;
}) {
	return (
		<Disclosure open={open} onOpenChange={onOpenChange}>
			<Box style={{borderBottom: BORDER_S}}>
				<DisclosureTrigger
					chevronPosition="end"
					fontWeight="400"
					fontSize="sm"
					px="16"
					py="12"
				>
					{label}
				</DisclosureTrigger>
				<DisclosureContent>
					<Box px="16" pb="12">
						{children}
					</Box>
				</DisclosureContent>
			</Box>
		</Disclosure>
	);
}

const EXEC_SECTIONS = [
	"Input Variables",
	"Output",
	"Execution Memory",
	"Output Quality Score",
	"Guardrail Status",
] as const;
type ExecSectionKey = (typeof EXEC_SECTIONS)[number];

function AgentExecutionLog({artifact}: {artifact: ArtifactViewerArtifact}) {
	const [sectionOpen, setSectionOpen] = useState<Record<ExecSectionKey, boolean>>({
		"Input Variables": false,
		Output: false,
		"Execution Memory": false,
		"Output Quality Score": false,
		"Guardrail Status": false,
	});

	const allExpanded = EXEC_SECTIONS.every((s) => sectionOpen[s]);

	const toggleAll = () => {
		const next = !allExpanded;
		setSectionOpen(
			Object.fromEntries(EXEC_SECTIONS.map((s) => [s, next])) as Record<
				ExecSectionKey,
				boolean
			>
		);
	};

	const toggleSection = (key: ExecSectionKey) =>
		setSectionOpen((prev) => ({...prev, [key]: !prev[key]}));

	return (
		<Box display="flex" flexDirection="column" h="full" style={{overflowY: "auto"}}>
			{/* Header */}
			<Box
				display="flex"
				alignItems="center"
				gap="10"
				px="16"
				py="12"
				style={{borderBottom: BORDER_S, flexShrink: 0}}
			>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					rounded="md"
					bg="bg.accent.subtle"
					style={{width: 32, height: 32, flexShrink: 0}}
				>
					<IconAgent size={16} color="var(--ax-colors-fg-accent)" />
				</Box>
				<Box display="flex" flexDirection="column" gap="2" style={{flex: 1, minWidth: 0}}>
					<Text fontSize="sm" fontWeight="600">
						Agent Execution
					</Text>
				</Box>
				<Badge intent="success">Completed</Badge>
			</Box>

			{/* Tabs */}
			<Box display="flex" style={{borderBottom: BORDER_S, flexShrink: 0}}>
				{["Details", "Trace"].map((tab, i) => (
					<Box
						key={tab}
						px="16"
						py="10"
						style={{
							cursor: "pointer",
							borderBottom:
								i === 0
									? "2px solid var(--ax-colors-fg-accent)"
									: "2px solid transparent",
						}}
					>
						<Text
							fontSize="sm"
							fontWeight={i === 0 ? "600" : "400"}
							color={i === 0 ? "fg.default" : "fg.secondary"}
						>
							{tab}
						</Text>
					</Box>
				))}
			</Box>

			{/* Metadata table — bordered card */}
			<Box px="16" py="12">
				<Box
					border="1"
					borderColor="border.secondary"
					rounded="sm"
					style={{overflow: "hidden"}}
				>
					{[
						{label: "Agent Name", value: `${artifact.sourceName} v1.2`},
						{label: "Execution ID", value: "exec_4f2a9c81", copyable: true},
						{label: "Execution Started", value: artifact.created},
						{label: "Duration", value: "1m 24s"},
						{
							label: "Executed By",
							value: artifact.createdBy.name,
							avatar: artifact.createdBy.avatar,
						},
						{
							label: "Output Quality Score",
							value: "95%",
							badge: "Passed",
							badgeIntent: "success" as const,
						},
						{
							label: "Guardrail Status",
							value: "",
							badge: "Passed",
							badgeIntent: "success" as const,
						},
						{label: "Credits", value: "20"},
					].map((row, i, arr) => (
						<Box
							key={row.label}
							display="flex"
							alignItems="center"
							px="12"
							py="8"
							gap="8"
							style={{borderBottom: i < arr.length - 1 ? BORDER_T : undefined}}
						>
							<Text
								fontSize="sm"
								color="fg.secondary"
								style={{minWidth: 148, flexShrink: 0}}
							>
								{row.label}
							</Text>
							<Box display="flex" alignItems="center" gap="6" style={{flex: 1}}>
								{row.avatar && (
									<Avatar name={row.value} src={row.avatar} size="sm" />
								)}
								{row.value && (
									<Text fontSize="sm" fontWeight="500">
										{row.value}
									</Text>
								)}
								{row.badge && <Badge intent={row.badgeIntent}>{row.badge}</Badge>}
								{row.copyable && (
									<Tooltip content="Copy ID" delayDuration={300}>
										<span style={{display: "inline-flex"}}>
											<Button
												appearance="subtle"
												size="sm"
												icon={<IconCopy size={12} />}
												aria-label="Copy execution ID"
											/>
										</span>
									</Tooltip>
								)}
							</Box>
						</Box>
					))}
				</Box>
			</Box>

			{/* Expand all */}
			<Box px="16" pb="8" style={{borderBottom: BORDER_S}}>
				<Button appearance="subtle" size="sm" onClick={toggleAll}>
					{allExpanded ? "Collapse all" : "Expand all"}
				</Button>
			</Box>

			{/* Collapsible sections */}
			<Box style={{borderTop: BORDER_S}}>
				<ExecutionSection
					label="Input Variables"
					open={sectionOpen["Input Variables"]}
					onOpenChange={() => toggleSection("Input Variables")}
				>
					<Text fontSize="sm" color="fg.secondary">
						target_segment: enterprise_renewal, offer: 15_pct_discount, tone:
						professional
					</Text>
				</ExecutionSection>
				<ExecutionSection
					label="Output"
					open={sectionOpen["Output"]}
					onOpenChange={() => toggleSection("Output")}
				>
					<Text fontSize="sm" color="fg.secondary">
						Generated artifact: {artifact.name}
					</Text>
				</ExecutionSection>
				<ExecutionSection
					label="Execution Memory"
					open={sectionOpen["Execution Memory"]}
					onOpenChange={() => toggleSection("Execution Memory")}
				>
					<Text fontSize="sm" color="fg.secondary">
						3 memory entries used · 2 retrieved from long-term store
					</Text>
				</ExecutionSection>
				<ExecutionSection
					label="Output Quality Score"
					open={sectionOpen["Output Quality Score"]}
					onOpenChange={() => toggleSection("Output Quality Score")}
				>
					<Text fontSize="sm" color="fg.secondary">
						Coherence: 96 · Relevance: 94 · Tone alignment: 95
					</Text>
				</ExecutionSection>
				<ExecutionSection
					label="Guardrail Status"
					open={sectionOpen["Guardrail Status"]}
					onOpenChange={() => toggleSection("Guardrail Status")}
				>
					<Text fontSize="sm" color="fg.secondary">
						All 4 guardrails passed · No policy violations detected
					</Text>
				</ExecutionSection>
			</Box>

			{/* Footer */}
			<Box display="flex" gap="8" p="16" mt="auto" style={{borderTop: BORDER_S}}>
				<Button appearance="subtle" size="sm" icon={<IconDownload size={14} />}>
					Download
				</Button>
				<Button appearance="subtle" size="sm">
					Close
				</Button>
			</Box>
		</Box>
	);
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────

const SEED_MESSAGES: OpalChatMessage[] = [
	{
		id: "1",
		role: "user",
		content:
			"Can you write a Q2 email campaign targeting enterprise customers who haven't renewed yet?",
		timestamp: Date.now() - 120000,
	},
	{
		id: "2",
		role: "assistant",
		content:
			"Sure! I'll draft a compelling renewal campaign. Let me tailor the tone and offer structure for enterprise accounts.",
		timestamp: Date.now() - 119000,
	},
	{
		id: "3",
		role: "user",
		content: "Focus on the ROI angle and include a limited-time discount offer.",
		timestamp: Date.now() - 60000,
	},
	{
		id: "4",
		role: "assistant",
		content:
			"Got it — here's the artifact I generated based on your brief. I've highlighted the ROI benefits in the opening and included a 15% renewal discount valid for 14 days.",
		timestamp: Date.now() - 55000,
	},
];

function ChatPanel({artifact}: {artifact: ArtifactViewerArtifact}) {
	const [messages, setMessages] = useState<OpalChatMessage[]>(SEED_MESSAGES);
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSend = (content: string) => {
		if (!content.trim()) return;
		const userMsg: OpalChatMessage = {
			id: Date.now().toString(),
			role: "user",
			content,
			timestamp: Date.now(),
		};
		setMessages((prev) => [...prev, userMsg]);
		setInputValue("");
		setIsLoading(true);
		setTimeout(() => {
			const reply: OpalChatMessage = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: `I've noted your feedback on "${artifact.name}". Let me update the artifact accordingly.`,
				timestamp: Date.now(),
			};
			setMessages((prev) => [...prev, reply]);
			setIsLoading(false);
		}, 1200);
	};

	return (
		<OpalChatView
			messages={messages}
			inputValue={inputValue}
			isLoading={isLoading}
			setInputValue={setInputValue}
			onSend={handleSend}
			onSuggestionClick={handleSend}
			variant="assistant"
		/>
	);
}

// ─── Canvas Panel ─────────────────────────────────────────────────────────────

function CanvasPanel({artifact}: {artifact: ArtifactViewerArtifact}) {
	return (
		<Box display="flex" flexDirection="column" h="full" bg="bg.page">
			{/* Canvas content — collab editor style */}
			<Box
				p="32"
				style={{flex: 1, overflowY: "auto", background: "var(--ax-colors-bg-page)"}}
			>
				<Box
					style={{maxWidth: 720, width: "100%", margin: "0 auto"}}
					display="flex"
					flexDirection="column"
					gap="16"
				>
					{/* Island header tile — consistent with IslandContentTile */}
					<Box
						bg="bg.default"
						display="flex"
						alignItems="center"
						gap="12"
						p="20"
						style={{border: BORDER_T, borderRadius: 12}}
					>
						<Box
							display="flex"
							alignItems="center"
							justifyContent="center"
							rounded="md"
							style={{
								padding: "10px 14px",
								background: THUMB_GRADIENT,
								flexShrink: 0,
								color: "var(--ax-colors-fg-default)",
							}}
						>
							{TYPE_ICON[artifact.type] ?? <IconFile size={20} />}
						</Box>
						<Box display="flex" flexDirection="column" gap="4" style={{flex: 1}}>
							<Text
								fontSize="lg"
								fontWeight="600"
								style={{lineHeight: "24px", letterSpacing: "-0.2px"}}
							>
								{artifact.name}
							</Text>
							<Text color="fg.tertiary" fontSize="sm">
								{artifact.type} · {artifact.created}
								{artifact.version ? ` · v${artifact.version}` : ""}
							</Text>
							<Box display="flex" alignItems="center" gap="4" color="fg.tertiary">
								{artifact.sourceType === "workflow" ? (
									<IconCodeBranch size={13} />
								) : artifact.sourceType === "chat" ? (
									<IconComments size={13} />
								) : (
									<IconAgent size={13} />
								)}
								<Text fontSize="sm" color="fg.tertiary">
									{artifact.sourceType === "chat" ? "Chat" : artifact.sourceName}
								</Text>
							</Box>
						</Box>
					</Box>

					{/* Document body */}
					<Box
						bg="bg.default"
						display="flex"
						flexDirection="column"
						gap="16"
						p="32"
						style={{border: BORDER_T, borderRadius: 12}}
					>
						<Text style={{lineHeight: "1.7"}}>
							Dear valued customer, as we head into Q2 we want to acknowledge the
							partnership we&apos;ve built together over the past year. Your
							investment in our platform has driven measurable results — and
							we&apos;re confident the next chapter will deliver even more.
						</Text>
						<Text style={{lineHeight: "1.7"}}>
							To show our appreciation, we&apos;re extending an exclusive renewal
							offer: <strong>15% off your enterprise subscription</strong> when you
							renew within the next 14 days. This is our way of saying thank you for
							being part of the journey.
						</Text>
						<Text style={{lineHeight: "1.7"}}>
							Ready to continue building momentum? Your account team is standing by to
							walk you through everything that&apos;s new — and everything that&apos;s
							coming.
						</Text>

						{/* Metadata fields */}
						<Box
							mt="8"
							p="16"
							style={{
								background: "var(--ax-colors-bg-page)",
								border: BORDER_T,
								borderRadius: 8,
							}}
							display="flex"
							flexDirection="column"
							gap="8"
						>
							{[
								{label: "Author", value: artifact.createdBy.name},
								{label: "Meta Title", value: `${artifact.name} | Optimizely`},
								{
									label: "Meta Description",
									value: "Exclusive Q2 enterprise renewal offer — 15% off for 14 days.",
								},
								{label: "URL Slug", value: "q2-enterprise-renewal-campaign"},
							].map((field) => (
								<Box key={field.label} display="flex" alignItems="start" gap="16">
									<Text
										fontSize="sm"
										color="fg.tertiary"
										style={{minWidth: 130, flexShrink: 0, paddingTop: 2}}
									>
										{field.label}
									</Text>
									<Text fontSize="sm" color="fg.secondary">
										{field.value}
									</Text>
								</Box>
							))}
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

// ─── Main ArtifactViewer ──────────────────────────────────────────────────────

type ArtifactViewerProps = {
	artifact: ArtifactViewerArtifact;
	onClose: () => void;
	openMode?: "preview" | "with-panel";
};

export function ArtifactViewer({artifact, onClose, openMode = "preview"}: ArtifactViewerProps) {
	const [mounted, setMounted] = useState(false);
	const [chatOpen, setChatOpen] = useState(openMode === "with-panel");

	useEffect(() => {
		setMounted(true);
		return () => setMounted(false);
	}, []);

	if (!mounted) return null;

	const isWorkflow = artifact.sourceType === "workflow" || artifact.sourceType === "agent";
	const isThread = artifact.hasTeamThread || artifact.sourceType === "thread";
	const isRegistryArtifact = artifact.id === "stride-cms-registry-artifact";

	const panel = (
		<Box
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 1000,
				display: "flex",
				background: "var(--ax-colors-bg-default)",
			}}
		>
			{/* Left: canvas column */}
			<Box
				style={{
					flex: "1 1 0",
					overflow: "hidden",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{isRegistryArtifact ? (
					<RegistryArtifactCanvas
						artifact={artifact}
						onClose={onClose}
						chatOpen={chatOpen}
						onChatToggle={() => setChatOpen((v) => !v)}
					/>
				) : (
					<CodeCanvasPanel
						onClose={onClose}
						artifactTitle={artifact.name}
						artifactStatus={artifact.status}
						artifactVersion={artifact.version}
						artifactSource={{type: artifact.sourceType, name: artifact.sourceName}}
						artifactCreator={artifact.createdBy}
						initialHtml={getMockContent(
							artifact.type,
							artifact.id,
							artifact.previewText
						)}
						chatOpen={chatOpen}
						onChatToggle={() => setChatOpen((v) => !v)}
					/>
				)}
			</Box>

			{/* Right: context panel — toggled via chat button in toolbar */}
			{chatOpen && (
				<Box style={{width: 400, flexShrink: 0, overflow: "hidden", borderLeft: BORDER_S}}>
					{isThread ? (
						<TeamThreadPanel artifact={artifact} />
					) : isWorkflow ? (
						<AgentExecutionLog artifact={artifact} />
					) : (
						<ChatPanel artifact={artifact} />
					)}
				</Box>
			)}
		</Box>
	);

	return createPortal(panel, document.body);
}

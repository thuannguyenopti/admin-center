"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Badge, Box, Button as AxiomButton, SearchInput, Text, Textarea } from "@optiaxiom/react";
import {
	IconArrowBackUp,
	IconArrowForwardUp,
	IconAdjustmentsHorizontal,
	IconCheck,
	IconChevronDown,
	IconCopy,
	IconDeviceFloppy,
	IconDownload,
	IconEye,
	IconPhoto,
	IconPlayerPlayFilled,
	IconSparkles,
	IconUpload,
	IconWand,
	IconX,
} from "@tabler/icons-react";
import { useLayout } from "@/app/context/LayoutContext";
import { useOpalContext } from "@/app/context/OpalContext";
import type { ChatMessage } from "@/app/hooks/useOpalState";

type FlowMode = "create" | "edit";
type AssetMode = "image" | "video";
type SaveState = "saved" | "saving" | "unsaved";
type CreateStage = "panel" | "advanced";
type DraftResult = {
	id: string;
	title: string;
	image: string;
	ratio: string;
	score: number;
};

type ReferenceAsset = {
	id: string;
	title: string;
	source: string;
	image: string;
};

type OutputVariant = {
	label: string;
	width: number;
	height: number;
	ratio: string;
};

const modeOptions = [
	{ label: "Create", value: "create" },
	{ label: "Edit", value: "edit" },
] as const;

const mediumOptions = [
	{ label: "Image", value: "image" },
	{ label: "Video", value: "video" },
] as const;

const createIntentOptions = [
	"Social campaign",
	"Poster",
	"Product placement",
	"Trade booth",
];

const editToolOptions = [
	"Resize",
	"Reframe",
	"Upscale",
	"Variation pack",
];

const aspectRatios = ["Auto", "1:1", "4:5", "16:9", "9:16"] as const;
const channelPacks = ["Social starter pack", "Paid social flight", "Event campaign pack", "Email + web hero"];
const themePacks = [
	"Stride endurance launch",
	"Spring race season",
	"Vacation campaign pack",
	"Race-day energy",
	"Premium performance",
];
const brandPacks = ["Stride core brand", "Performance editorial", "Brand-safe product focus"];
const QUICK_DRAFT_STORAGE_KEY = "cmp_opal_quick_draft";

const referenceAssets: ReferenceAsset[] = [
	{
		id: "ref-1",
		title: "Ocean ride hero",
		source: "Library",
		image: "/hero-cycling.jpg",
	},
	{
		id: "ref-2",
		title: "Track sprint portrait",
		source: "Task",
		image: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=900&q=80",
	},
	{
		id: "ref-3",
		title: "Open-water training",
		source: "Upload",
		image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
	},
	{
		id: "ref-4",
		title: "Marathon prep",
		source: "Library",
		image: "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=900&q=80",
	},
];

const imageDrafts: DraftResult[] = [
	{
		id: "draft-a",
		title: "Direction A",
		image: "/hero-cycling.jpg",
		ratio: "4:5",
		score: 96,
	},
	{
		id: "draft-b",
		title: "Direction B",
		image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1100&q=80",
		ratio: "1:1",
		score: 92,
	},
];

const videoDrafts: DraftResult[] = [
	{
		id: "video-a",
		title: "Clip A",
		image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1100&q=80",
		ratio: "9:16",
		score: 94,
	},
	{
		id: "video-b",
		title: "Clip B",
		image: "https://images.unsplash.com/photo-1530137073520-6a24f53b5d14?auto=format&fit=crop&w=1100&q=80",
		ratio: "16:9",
		score: 91,
	},
];

const ratioDimensions: Record<(typeof aspectRatios)[number], { width: number; height: number } | null> = {
	Auto: null,
	"1:1": { width: 1080, height: 1080 },
	"4:5": { width: 1080, height: 1350 },
	"16:9": { width: 1920, height: 1080 },
	"9:16": { width: 1080, height: 1920 },
};

const channelPackOutputs: Record<string, OutputVariant[]> = {
	"Social starter pack": [
		{ label: "Instagram square", width: 1080, height: 1080, ratio: "1:1" },
		{ label: "Instagram portrait", width: 1080, height: 1350, ratio: "4:5" },
		{ label: "Stories", width: 1080, height: 1920, ratio: "9:16" },
	],
	"Paid social flight": [
		{ label: "Feed portrait", width: 1080, height: 1350, ratio: "4:5" },
		{ label: "Landscape display", width: 1200, height: 628, ratio: "16:9" },
		{ label: "Reels / Shorts", width: 1080, height: 1920, ratio: "9:16" },
	],
	"Event campaign pack": [
		{ label: "Poster key art", width: 1440, height: 1800, ratio: "4:5" },
		{ label: "Hero landscape", width: 1920, height: 1080, ratio: "16:9" },
		{ label: "Lobby screen", width: 1080, height: 1920, ratio: "9:16" },
	],
	"Email + web hero": [
		{ label: "Email hero", width: 1200, height: 900, ratio: "4:5" },
		{ label: "Homepage hero", width: 1920, height: 1080, ratio: "16:9" },
	],
};

function getCanvasAspectRatio(assetMode: AssetMode, ratio: string) {
	if (ratio !== "Auto") {
		return ratio.replace(":", " / ");
	}

	return assetMode === "video" ? "16 / 9" : "4 / 5";
}

function getOutputVariants(channelPack: string, assetMode: AssetMode, ratio: string) {
	const base = channelPackOutputs[channelPack] ?? [];

	if (assetMode === "video") {
		return base.filter((variant) => variant.ratio === "16:9" || variant.ratio === "9:16");
	}

	if (ratio === "Auto") {
		return base;
	}

	const filtered = base.filter((variant) => variant.ratio === ratio);
	if (filtered.length > 0) {
		return filtered;
	}

	const fallback = ratioDimensions[ratio as keyof typeof ratioDimensions];
	if (!fallback) {
		return base;
	}

	return [
		{
			label: `${channelPack} custom`,
			width: fallback.width,
			height: fallback.height,
			ratio,
		},
	];
}

function extractLatestImageFromMessages(messages: ChatMessage[]) {
	for (let index = messages.length - 1; index >= 0; index -= 1) {
		const message = messages[index];
		if (message.role !== "assistant" || !message.content) {
			continue;
		}

		const imageMatch = message.content.match(/!\[[^\]]*\]\(([^)]+)\)/);
		if (!imageMatch) {
			continue;
		}

		const promptMatch = message.content.match(/I created a quick image draft for:\s*"([^"]+)"/);
		const userMessage = [...messages]
			.slice(0, index)
			.reverse()
			.find((candidate) => candidate.role === "user" && candidate.content.trim().length > 0);

		return {
			prompt: promptMatch?.[1] ?? userMessage?.content ?? "",
			draft: {
			image: imageMatch[1],
			title: "Quick draft",
			score: 96,
			ratio: "4:5",
			},
		};
	}

	return null;
}

function ModeChip({
	active,
	children,
	onClick,
}: {
	active?: boolean;
	children: ReactNode;
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			style={{
				alignItems: "center",
				background: active ? "var(--ax-colors-bg-accent-subtle)" : "var(--ax-colors-bg-default)",
				border: `1px solid ${active ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-secondary)"}`,
				borderRadius: 12,
				color: active ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-default)",
				cursor: "pointer",
				display: "inline-flex",
				fontSize: 14,
				fontWeight: 500,
				gap: 8,
				height: 38,
				padding: "0 16px",
				transition: "border-color 0.16s ease, background-color 0.16s ease",
			}}
		>
			{children}
		</button>
	);
}

function SettingsSection({
	title,
	defaultOpen = true,
	children,
}: {
	title: string;
	defaultOpen?: boolean;
	children: ReactNode;
}) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<Box bg="bg.default" border="1" borderColor="border.tertiary" rounded="xl" shadow="sm">
			<button
				type="button"
				onClick={() => setOpen((current) => !current)}
				style={{
					alignItems: "center",
					background: "transparent",
					border: 0,
					cursor: "pointer",
					display: "flex",
					justifyContent: "space-between",
					padding: "16px",
					width: "100%",
				}}
			>
				<Text fontSize="sm" fontWeight="600">
					{title}
				</Text>
				<IconChevronDown
					size={16}
					style={{
						transform: open ? "rotate(0deg)" : "rotate(-90deg)",
						transition: "transform 0.18s ease",
					}}
				/>
			</button>
			{open ? <Box px="16" pb="16">{children}</Box> : null}
		</Box>
	);
}

function SelectRow({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: string;
	options: readonly string[];
	onChange: (value: string) => void;
}) {
	return (
		<Box display="flex" flexDirection="column" gap="8">
			<Text color="fg.secondary" fontSize="xs" fontWeight="600" style={{ letterSpacing: "0.02em", textTransform: "uppercase" }}>
				{label}
			</Text>
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				style={{
					background: "var(--ax-colors-bg-default)",
					border: "1px solid var(--ax-colors-border-secondary)",
					borderRadius: 14,
					color: "var(--ax-colors-fg-default)",
					fontSize: 14,
					height: 44,
					outline: "none",
					padding: "0 14px",
				}}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</Box>
	);
}

function ReferenceCard({
	asset,
	selected,
	onSelect,
}: {
	asset: ReferenceAsset;
	selected: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			style={{
				background: "var(--ax-colors-bg-default)",
				border: `1px solid ${selected ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-tertiary)"}`,
				borderRadius: 18,
				cursor: "pointer",
				overflow: "hidden",
				padding: 0,
				textAlign: "left",
				width: "100%",
			}}
		>
			<img alt={asset.title} src={asset.image} style={{ display: "block", height: 132, objectFit: "cover", width: "100%" }} />
			<Box p="12">
				<Text fontSize="sm" fontWeight="600">
					{asset.title}
				</Text>
				<Text color="fg.secondary" fontSize="xs">
					{asset.source}
				</Text>
			</Box>
		</button>
	);
}

function DraftCard({
	draft,
	selected,
	onSelect,
}: {
	draft: DraftResult;
	selected: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			style={{
				background: "var(--ax-colors-bg-default)",
				border: `1px solid ${selected ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-tertiary)"}`,
				borderRadius: 18,
				cursor: "pointer",
				overflow: "hidden",
				padding: 0,
				textAlign: "left",
				width: "100%",
			}}
		>
			<Box style={{ aspectRatio: draft.ratio === "9:16" ? "9 / 16" : "4 / 5", overflow: "hidden" }}>
				<img alt={draft.title} src={draft.image} style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }} />
			</Box>
			<Box display="flex" flexDirection="column" gap="8" p="12">
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Text fontSize="sm" fontWeight="600">
						{draft.title}
					</Text>
					<Badge intent={selected ? "primary" : "neutral"}>{draft.score}%</Badge>
				</Box>
				<Text color="fg.secondary" fontSize="xs">
					Best for {draft.ratio} delivery and review.
				</Text>
			</Box>
		</button>
	);
}

function DraftOptionCard({
	draft,
	selected,
	onSelect,
}: {
	draft: DraftResult;
	selected: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			style={{
				background: "var(--ax-colors-bg-default)",
				border: `1px solid ${selected ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-tertiary)"}`,
				borderRadius: 16,
				cursor: "pointer",
				overflow: "hidden",
				padding: 0,
				textAlign: "left",
				width: "100%",
			}}
		>
			<Box display="grid" style={{ gridTemplateColumns: "120px minmax(0, 1fr)" }}>
				<Box style={{ height: 96, overflow: "hidden" }}>
					<img alt={draft.title} src={draft.image} style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }} />
				</Box>
				<Box display="flex" flexDirection="column" gap="8" justifyContent="center" p="12">
					<Box alignItems="center" display="flex" justifyContent="space-between">
						<Text fontSize="sm" fontWeight="600">
							{draft.title}
						</Text>
						<Badge intent={selected ? "primary" : "neutral"}>{draft.score}%</Badge>
					</Box>
					<Box alignItems="center" display="flex" gap="8">
						<Badge intent="neutral">{draft.ratio}</Badge>
						<Text color="fg.secondary" fontSize="xs">
							Click to preview
						</Text>
					</Box>
				</Box>
			</Box>
		</button>
	);
}

function OutputVariantCard({ variant }: { variant: OutputVariant }) {
	return (
		<Box bg="bg.secondary" border="1" borderColor="border.tertiary" p="12" rounded="xl">
			<Box alignItems="center" display="flex" justifyContent="space-between">
				<Text fontSize="sm" fontWeight="600">
					{variant.label}
				</Text>
				<Badge intent="neutral">{variant.ratio}</Badge>
			</Box>
			<Text color="fg.secondary" fontSize="xs" style={{ marginTop: 6 }}>
				{variant.width} x {variant.height}
			</Text>
		</Box>
	);
}

function RatioChips({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<Box
			alignItems="center"
			bg="bg.secondary"
			display="inline-flex"
			gap="4"
			p="4"
			rounded="full"
			style={{ width: "fit-content" }}
		>
			{aspectRatios.map((ratio) => (
				<button
					key={ratio}
					type="button"
					onClick={() => onChange(ratio)}
					style={{
						background: value === ratio ? "var(--ax-colors-bg-default)" : "transparent",
						border: 0,
						borderRadius: 999,
						color: value === ratio ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)",
						cursor: "pointer",
						fontSize: 14,
						fontWeight: value === ratio ? 600 : 500,
						height: 36,
						padding: "0 14px",
					}}
				>
					{ratio}
				</button>
			))}
		</Box>
	);
}

function CreatePanelOnlyState() {
	return (
		<Box
			flex="1"
			style={{ minHeight: "calc(100vh - 57px)" }}
		/>
	);
}

function CanvasToolbarIconButton({
	ariaLabel,
	icon,
	onClick,
}: {
	ariaLabel: string;
	icon: ReactNode;
	onClick?: () => void;
}) {
	return <AxiomButton aria-label={ariaLabel} appearance="default" size="sm" icon={icon} onClick={onClick} />;
}

function AdvancedCanvasWorkspace({
	prompt,
	selectedDraft,
	saveState,
	onCloseAdvanced,
}: {
	prompt: string;
	selectedDraft: DraftResult;
	saveState: SaveState;
	onCloseAdvanced: () => void;
}) {
	return (
		<Box
			bg="bg.page"
			display="flex"
			flexDirection="column"
			style={{ minHeight: "calc(100vh - 57px)" }}
		>
			<Box
				bg="bg.default"
				border="1"
				borderColor="border.tertiary"
				rounded="xl"
				shadow="lg"
				style={{
					display: "flex",
					flex: 1,
					flexDirection: "column",
					margin: "24px 24px 24px 0",
					minHeight: 0,
					overflow: "hidden",
				}}
			>
				<Box
					alignItems="center"
					borderB="1"
					borderColor="border.tertiary"
					display="flex"
					justifyContent="space-between"
					px="24"
					py="12"
					style={{ minHeight: 64 }}
				>
					<Box alignItems="center" display="flex" gap="8">
						<CanvasToolbarIconButton ariaLabel="Code view" icon={<span style={{ fontSize: 16, lineHeight: 1 }}>{'</>'}</span>} />
						<CanvasToolbarIconButton ariaLabel="Preview mode" icon={<IconEye size={16} />} />
					</Box>
					<Box alignItems="center" display="flex" gap="8">
						<Text color="fg.secondary" fontSize="xs">
							{saveState === "saved" ? "Changes saved." : saveState === "saving" ? "Saving..." : "Unsaved changes"}
						</Text>
						<CanvasToolbarIconButton ariaLabel="Undo" icon={<IconArrowBackUp size={16} />} />
						<CanvasToolbarIconButton ariaLabel="Redo" icon={<IconArrowForwardUp size={16} />} />
						<CanvasToolbarIconButton ariaLabel="Copy" icon={<IconCopy size={16} />} />
						<CanvasToolbarIconButton ariaLabel="Download" icon={<IconDownload size={16} />} />
						<AxiomButton appearance="default" size="sm">
							Preview
						</AxiomButton>
						<AxiomButton appearance="primary" size="sm" icon={<IconChevronDown size={14} />}>
							Add to
						</AxiomButton>
						<CanvasToolbarIconButton ariaLabel="Close advanced editor" icon={<IconX size={16} />} onClick={onCloseAdvanced} />
					</Box>
				</Box>
				<Box bg="bg.default" flex="1" p="32" style={{ minHeight: 0, overflow: "auto" }}>
					<Box display="flex" flexDirection="column" gap="8" mb="24">
						<Text fontSize="2xl" fontWeight="700">
							{selectedDraft.title}
						</Text>
						<Text color="fg.secondary" fontSize="sm">
							{prompt}
						</Text>
					</Box>
					<Box
						alignItems="center"
						bg="bg.default"
						border="1"
						borderColor="border.tertiary"
						display="flex"
						justifyContent="center"
						rounded="xl"
						shadow="sm"
						style={{ minHeight: "calc(100vh - 260px)", overflow: "hidden" }}
					>
						<img
							alt={selectedDraft.title}
							src={selectedDraft.image}
							style={{
								display: "block",
								height: "auto",
								maxHeight: "calc(100vh - 320px)",
								maxWidth: "100%",
								objectFit: "contain",
								width: "100%",
							}}
						/>
					</Box>
					<Box display="flex" justifyContent="flex-end" mt="20">
						<AxiomButton appearance="default" size="sm" onClick={onCloseAdvanced}>
							Back to quick draft
						</AxiomButton>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

function CreateEntryPanel({
	assetMode,
	prompt,
	onPromptChange,
	generated,
	selectedDraft,
	saveState,
	onGenerate,
	onOpenAdvanced,
}: {
	assetMode: AssetMode;
	prompt: string;
	onPromptChange: (value: string) => void;
	generated: boolean;
	selectedDraft: DraftResult;
	saveState: SaveState;
	onGenerate: () => void;
	onOpenAdvanced: () => void;
}) {
	return (
		<Box display="flex" flex="1" justifyContent="flex-end" px="24" py="24">
			<Box
				bg="bg.default"
				border="1"
				borderColor="border.tertiary"
				display="flex"
				flexDirection="column"
				rounded="xl"
				shadow="lg"
				style={{ maxWidth: 430, minHeight: 760, width: "100%" }}
			>
				<Box
					alignItems="center"
					borderB="1"
					borderColor="border.tertiary"
					display="flex"
					justifyContent="space-between"
					px="20"
					py="16"
				>
					<Box alignItems="center" display="flex" gap="8">
						<Box
							alignItems="center"
							bg="bg.accent.subtle"
							display="flex"
							justifyContent="center"
							rounded="full"
							style={{ height: 28, width: 28 }}
						>
							<IconSparkles size={16} />
						</Box>
							<Text fontSize="lg" fontWeight="600">
								Opal
							</Text>
						</Box>
						<Box alignItems="center" display="flex" gap="8">
							<Text color="fg.secondary" fontSize="xs">
								{saveState === "saved" ? "Changes saved." : saveState === "saving" ? "Saving..." : "Unsaved changes"}
							</Text>
							<AxiomButton appearance="default" size="sm">
								Close
							</AxiomButton>
						</Box>
					</Box>

				<Box display="flex" flex="1" flexDirection="column" gap="16" p="20">
					<Box display="flex" gap="10">
						<Box
							alignItems="center"
							bg="bg.accent.subtle"
							display="flex"
							justifyContent="center"
							rounded="full"
							style={{ flexShrink: 0, height: 28, width: 28 }}
						>
							<IconSparkles size={16} />
							</Box>
							<Box display="flex" flexDirection="column" gap="8">
								<Text fontSize="sm">
									{generated
										? `I generated a ${assetMode === "image" ? "visual" : "concept clip"} for your prompt.${assetMode === "image" ? " You can keep it lightweight or open the advanced editor for full canvas controls." : ""}`
										: "Hi, I'm Opal, Optimizely's AI. I can help create brand-safe visuals for campaigns, social, and event content."}
								</Text>
								{generated ? null : (
									<>
										<Text fontSize="sm">What can I help you with?</Text>
										<Box display="grid" gap="8" style={{ maxWidth: 320 }}>
											{[
												"Create a spring triathlon campaign image",
												"Generate a paid social hero for race day",
												"Make a premium event poster visual",
												"Create a launch image for Stride endurance",
											].map((suggestion) => (
												<button
													key={suggestion}
													type="button"
													onClick={() => onPromptChange(suggestion)}
													style={{
														background: "var(--ax-colors-bg-primary)",
														border: "1px solid var(--ax-colors-border-primary)",
														borderRadius: 10,
														color: "var(--ax-colors-fg-default-inverse)",
														cursor: "pointer",
														fontSize: 14,
														lineHeight: 1.4,
														padding: "12px 14px",
														textAlign: "left",
													}}
												>
													{suggestion}
												</button>
											))}
										</Box>
									</>
								)}
								{generated ? (
									<Box
										bg="bg.secondary"
									border="1"
									borderColor="border.tertiary"
									display="flex"
									flexDirection="column"
									gap="10"
									p="12"
									rounded="xl"
								>
									<Box style={{ aspectRatio: "4 / 5", borderRadius: 12, overflow: "hidden" }}>
										<img
											alt={selectedDraft.title}
											src={selectedDraft.image}
											style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
										/>
									</Box>
										<Box alignItems="center" display="flex" justifyContent="space-between">
											<Text fontSize="sm" fontWeight="600">
												{selectedDraft.title}
											</Text>
											<Badge intent="success">{selectedDraft.score}% match</Badge>
										</Box>
										{assetMode === "image" ? (
											<>
												<Text color="fg.secondary" fontSize="xs">
													Use advanced editor
												</Text>
												<AxiomButton appearance="default" size="md" onClick={onOpenAdvanced}>
													Use advanced editor
												</AxiomButton>
											</>
										) : (
											<Text color="fg.secondary" fontSize="xs">
												Keep iterating here. Advanced canvas is available for image creation.
											</Text>
										)}
									</Box>
								) : null}
							</Box>
						</Box>

						<Box display="grid" gap="10" style={{ marginTop: "auto" }}>
							<Textarea
								value={prompt}
								onChange={(event) => onPromptChange(event.target.value)}
								placeholder={`Ask Opal to create a ${assetMode}`}
								style={{ minHeight: 96 }}
							/>
							<Box alignItems="center" display="flex" justifyContent="space-between">
								<Box alignItems="center" display="flex" gap="8">
									<Badge intent="neutral">{assetMode === "image" ? "Image" : "Video"}</Badge>
									<Badge intent="neutral">Quick draft</Badge>
							</Box>
							<AxiomButton appearance="primary" size="lg" icon={<IconSparkles size={16} />} onClick={onGenerate}>
								Generate {assetMode}
							</AxiomButton>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

function CreateAdvancedWorkspace({
	assetMode,
	prompt,
	onPromptChange,
	referenceAssets,
	selectedReferenceId,
	onSelectReference,
	aspectRatio,
	intent,
	onIntentChange,
	channelPack,
	onChannelPackChange,
	brandPack,
	onBrandPackChange,
	themePack,
	onThemePackChange,
	generated,
	produced,
	needsRefresh,
	onGenerate,
	onProduce,
	drafts,
	selectedDraftId,
	onSelectDraft,
	onAspectRatioChange,
	outputVariants,
	saveState,
	onShowPlan,
}: {
	assetMode: AssetMode;
	prompt: string;
	onPromptChange: (value: string) => void;
	referenceAssets: ReferenceAsset[];
	selectedReferenceId: string;
	onSelectReference: (id: string) => void;
	aspectRatio: string;
	intent: string;
	onIntentChange: (value: string) => void;
	channelPack: string;
	onChannelPackChange: (value: string) => void;
	brandPack: string;
	onBrandPackChange: (value: string) => void;
	themePack: string;
	onThemePackChange: (value: string) => void;
	generated: boolean;
	produced: boolean;
	needsRefresh: boolean;
	onGenerate: () => void;
	onProduce: () => void;
	drafts: DraftResult[];
	selectedDraftId: string;
	onSelectDraft: (id: string) => void;
	onAspectRatioChange: (value: string) => void;
	outputVariants: OutputVariant[];
	saveState: SaveState;
	onShowPlan: () => void;
}) {
	const selectedDraft = drafts.find((draft) => draft.id === selectedDraftId) ?? drafts[0];

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			rounded="xl"
			shadow="md"
			style={{ overflow: "hidden" }}
		>
			<Box display="grid" style={{ gridTemplateColumns: "minmax(0, 1fr) 420px" }}>
				<Box bg="bg.default" display="flex" flexDirection="column" style={{ minWidth: 0 }}>
						<Box
							alignItems="center"
							borderB="1"
							borderColor="border.tertiary"
							display="flex"
							justifyContent="space-between"
							px="24"
							py="12"
							style={{ minHeight: 56 }}
						>
						<Box alignItems="center" display="flex" gap="8">
							<Badge intent="neutral">{generated ? "Canvas ready" : "Canvas"}</Badge>
							<Badge intent="neutral">{channelPack}</Badge>
							<Badge intent="neutral">{aspectRatio}</Badge>
						</Box>
						<Box alignItems="center" display="flex" gap="8">
							<Text color="fg.secondary" fontSize="xs">
								{saveState === "saved" ? "Changes saved." : saveState === "saving" ? "Saving..." : "Unsaved changes"}
							</Text>
							<AxiomButton appearance="default" size="sm">
								Download
							</AxiomButton>
							<AxiomButton appearance="primary" size="sm" icon={<IconChevronDown size={14} />}>
								Add to
							</AxiomButton>
						</Box>
					</Box>

					<Box bg="bg.default" display="flex" flexDirection="column" gap="20" p="24">
						<Box display="flex" flexDirection="column" gap="8">
							<Text fontSize="2xl" fontWeight="700">
								{generated ? selectedDraft.title : "Creative canvas"}
							</Text>
							<Text color="fg.secondary" fontSize="sm">
								{generated
									? "Refine the generated draft, review references, and decide whether to produce the final pack."
									: "Start with a prompt in the Opal panel. The canvas opens here once there is something worth editing."}
							</Text>
						</Box>

						<Box
							alignItems="center"
							bg="bg.secondary"
							border="1"
							borderColor="border.tertiary"
							display="flex"
							justifyContent="center"
							p="20"
							rounded="xl"
							style={{ minHeight: 640, overflow: "hidden" }}
						>
							<Box
								style={{
									aspectRatio: getCanvasAspectRatio(assetMode, aspectRatio),
									borderRadius: 20,
									maxHeight: 560,
									overflow: "hidden",
									width: "100%",
								}}
							>
								{generated ? (
									<img
										alt={selectedDraft.title}
										src={selectedDraft.image}
										style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
									/>
								) : (
									<Box
										alignItems="center"
										bg="bg.default"
										display="flex"
										flexDirection="column"
										gap="16"
										justifyContent="center"
										style={{ height: "100%" }}
									>
										<Box
											alignItems="center"
											bg="bg.secondary"
											display="flex"
											justifyContent="center"
											rounded="full"
											style={{ height: 64, width: 64 }}
										>
											<IconSparkles size={24} />
										</Box>
										<Text fontSize="lg" fontWeight="700">
											Generate a draft in Opal to start editing
										</Text>
									</Box>
								)}
							</Box>
						</Box>

						{produced ? (
							<Box bg="bg.default" border="1" borderColor="border.tertiary" p="16" rounded="xl">
								<Box alignItems="center" display="flex" justifyContent="space-between" mb="12">
									<Text fontSize="sm" fontWeight="700">
										Output pack
									</Text>
									<Badge intent="success">Ready for DAM</Badge>
								</Box>
								<Box display="grid" gap="12" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
									{outputVariants.map((variant) => (
										<OutputVariantCard key={`${variant.label}-${variant.width}`} variant={variant} />
									))}
								</Box>
							</Box>
						) : null}
					</Box>
				</Box>

				<Box
					bg="bg.default"
					borderL="1"
					borderColor="border.tertiary"
					display="flex"
					flexDirection="column"
					style={{ minHeight: 900 }}
				>
					<Box
						alignItems="center"
						borderB="1"
						borderColor="border.tertiary"
						display="flex"
						justifyContent="space-between"
						px="20"
						py="16"
					>
						<Box alignItems="center" display="flex" gap="8">
							<Box
								alignItems="center"
								bg="bg.accent.subtle"
								display="flex"
								justifyContent="center"
								rounded="full"
								style={{ height: 28, width: 28 }}
							>
								<IconSparkles size={16} />
							</Box>
							<Text fontSize="lg" fontWeight="600">
								Opal
							</Text>
						</Box>
						<Box alignItems="center" display="flex" gap="8">
							<AxiomButton appearance="default" size="sm" onClick={onShowPlan}>
								Show plan
							</AxiomButton>
							<AxiomButton appearance="default" size="sm">
								Close
							</AxiomButton>
						</Box>
					</Box>

					<Box display="flex" flex="1" flexDirection="column" gap="16" p="20">
						<Box display="flex" gap="10">
							<Box
								alignItems="center"
								bg="bg.accent.subtle"
								display="flex"
								justifyContent="center"
								rounded="full"
								style={{ flexShrink: 0, height: 28, width: 28 }}
							>
								<IconSparkles size={16} />
							</Box>
							<Box display="flex" flexDirection="column" gap="8">
								<Text fontSize="sm">
									{generated
										? "I created two directions and loaded the selected draft into the canvas. You can keep adjusting packs and settings here."
										: `Describe the ${assetMode} you want and I’ll create a draft that opens in the canvas.`}
								</Text>
								{generated ? (
									<Box
										bg="bg.secondary"
										border="1"
										borderColor="border.tertiary"
										display="grid"
										gap="10"
										p="12"
										rounded="xl"
									>
										<Box style={{ aspectRatio: "4 / 5", borderRadius: 12, overflow: "hidden" }}>
											<img
												alt={selectedDraft.title}
												src={selectedDraft.image}
												style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
											/>
										</Box>
										<Text fontSize="sm" fontWeight="600">
											{selectedDraft.title}
										</Text>
									</Box>
								) : null}
							</Box>
						</Box>

						{generated ? (
							<Box display="grid" gap="12">
								{drafts.map((draft) => (
									<DraftOptionCard
										key={draft.id}
										draft={draft}
										selected={draft.id === selectedDraftId}
										onSelect={() => onSelectDraft(draft.id)}
									/>
								))}
							</Box>
						) : null}

						<Box display="flex" flexDirection="column" gap="12">
							<SettingsSection title="General settings">
								<Box display="grid" gap="12">
									<SelectRow label="Intent" value={intent} options={createIntentOptions} onChange={onIntentChange} />
									<SelectRow label="Channel pack" value={channelPack} options={channelPacks} onChange={onChannelPackChange} />
									<Box display="flex" flexDirection="column" gap="8">
										<Text color="fg.secondary" fontSize="xs" fontWeight="600" style={{ letterSpacing: "0.02em", textTransform: "uppercase" }}>
											Aspect ratio
										</Text>
										<RatioChips value={aspectRatio} onChange={onAspectRatioChange} />
									</Box>
								</Box>
							</SettingsSection>
							<SettingsSection title="Brand and packs">
								<Box display="grid" gap="12">
									<SelectRow label="Theme pack" value={themePack} options={themePacks} onChange={onThemePackChange} />
									<SelectRow label="Brand pack" value={brandPack} options={brandPacks} onChange={onBrandPackChange} />
								</Box>
							</SettingsSection>
							<SettingsSection title="References and uploads" defaultOpen={false}>
								<Box display="grid" gap="12">
									{referenceAssets.slice(0, 3).map((asset) => (
										<ReferenceCard
											key={asset.id}
											asset={asset}
											selected={asset.id === selectedReferenceId}
											onSelect={() => onSelectReference(asset.id)}
										/>
									))}
								</Box>
							</SettingsSection>
						</Box>

						<Box
							bg="bg.default"
							border="1"
							borderColor="border.tertiary"
							display="flex"
							flexDirection="column"
							gap="12"
							mt="auto"
							p="16"
							rounded="xl"
						>
							<Text fontSize="sm" fontWeight="700">
								Ask Opal
							</Text>
							<Textarea value={prompt} onChange={(event) => onPromptChange(event.target.value)} style={{ minHeight: 100 }} />
							<Box alignItems="center" display="flex" justifyContent="space-between">
								<Box alignItems="center" display="flex" gap="8">
									<Badge intent="neutral">{brandPack}</Badge>
									{needsRefresh ? <Badge intent="warning">Preview out of sync</Badge> : null}
								</Box>
								<Box alignItems="center" display="flex" gap="10">
									<AxiomButton appearance="default" size="md">
										Enhance
									</AxiomButton>
									<AxiomButton
										appearance="primary"
										size="md"
										icon={generated ? <IconCheck size={16} /> : <IconSparkles size={16} />}
										onClick={generated ? onProduce : onGenerate}
									>
										{generated ? "Produce pack" : "Generate drafts"}
									</AxiomButton>
								</Box>
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

function CreateWorkspace({
	assetMode,
	prompt,
	onPromptChange,
	referencesOpen,
	onToggleReferences,
	referenceAssets,
	selectedReferenceId,
	onSelectReference,
	aspectRatio,
	intent,
	onIntentChange,
	channelPack,
	onChannelPackChange,
	brandPack,
	onBrandPackChange,
	themePack,
	onThemePackChange,
	draftMode,
	generated,
	produced,
	needsRefresh,
	onGenerate,
	onProduce,
	drafts,
	selectedDraftId,
	onSelectDraft,
	onAspectRatioChange,
	outputVariants,
	saveState,
	onShowPlan,
}: {
	assetMode: AssetMode;
	prompt: string;
	onPromptChange: (value: string) => void;
	referencesOpen: boolean;
	onToggleReferences: () => void;
	referenceAssets: ReferenceAsset[];
	selectedReferenceId: string;
	onSelectReference: (id: string) => void;
	aspectRatio: string;
	intent: string;
	onIntentChange: (value: string) => void;
	channelPack: string;
	onChannelPackChange: (value: string) => void;
	brandPack: string;
	onBrandPackChange: (value: string) => void;
	themePack: string;
	onThemePackChange: (value: string) => void;
	draftMode: boolean;
	generated: boolean;
	produced: boolean;
	needsRefresh: boolean;
	onGenerate: () => void;
	onProduce: () => void;
	drafts: DraftResult[];
	selectedDraftId: string;
	onSelectDraft: (id: string) => void;
	onAspectRatioChange: (value: string) => void;
	outputVariants: OutputVariant[];
	saveState: SaveState;
	onShowPlan: () => void;
}) {
	const selectedDraft = drafts.find((draft) => draft.id === selectedDraftId) ?? drafts[0];

	return (
		<Box display="grid" gap="20" style={{ gridTemplateColumns: "minmax(0, 1fr) 320px" }}>
			<Box display="flex" flexDirection="column" gap="20" style={{ minWidth: 0 }}>
				<Box bg="bg.default" border="1" borderColor="border.tertiary" rounded="xl" shadow="md">
					<Box borderB="1" borderColor="border.tertiary" display="flex" justifyContent="space-between" px="20" py="16">
						<Box alignItems="center" display="flex" gap="8">
							<Badge intent="neutral">{intent}</Badge>
							<Badge intent="neutral">{aspectRatio}</Badge>
							<Badge intent="neutral">{channelPack}</Badge>
						</Box>
						<Box alignItems="center" display="flex" gap="10">
							<ModeChip active={referencesOpen} onClick={onToggleReferences}>
								References
							</ModeChip>
							<Badge intent="success">{draftMode ? "Draft mode" : "Production mode"}</Badge>
						</Box>
					</Box>

					<Box
						display="grid"
						gap="20"
						p="20"
						style={{ gridTemplateColumns: referencesOpen ? "260px minmax(0, 1fr)" : "minmax(0, 1fr)" }}
					>
						{referencesOpen ? (
							<Box
								bg="bg.secondary"
								border="1"
								borderColor="border.tertiary"
								display="flex"
								flexDirection="column"
								gap="12"
								p="16"
								rounded="xl"
								style={{ minHeight: 0 }}
							>
								<Box alignItems="center" display="flex" justifyContent="space-between">
									<Text fontSize="sm" fontWeight="700">
										Reference set
									</Text>
									<AxiomButton appearance="default" size="sm" icon={<IconUpload size={14} />}>
										Upload
									</AxiomButton>
								</Box>
								<SearchInput placeholder="Search images" size="md" />
								<Box display="grid" gap="12" style={{ overflowY: "auto" }}>
									{referenceAssets.map((asset) => (
										<ReferenceCard
											key={asset.id}
											asset={asset}
											selected={asset.id === selectedReferenceId}
											onSelect={() => onSelectReference(asset.id)}
										/>
									))}
								</Box>
							</Box>
						) : null}

						<Box
							bg="bg.secondary"
							border="1"
							borderColor="border.tertiary"
							display="flex"
							flexDirection="column"
							justifyContent="space-between"
							p="20"
							rounded="xl"
							style={{
								background:
									"linear-gradient(180deg, rgba(247,248,250,1) 0%, rgba(241,245,249,1) 100%)",
								minHeight: 620,
							}}
						>
							<Box
								alignItems="center"
								display="flex"
								justifyContent="space-between"
								style={{ minHeight: 20 }}
							>
								<Text color="fg.secondary" fontSize="sm">
									{assetMode === "image" ? "Image generation" : "Video generation"}
								</Text>
								<AxiomButton appearance="default" size="sm" icon={<IconAdjustmentsHorizontal size={14} />}>
									Settings
								</AxiomButton>
							</Box>

							<Box
								alignItems="center"
								display="flex"
								flex="1"
								justifyContent="center"
								style={{
									border: "1px dashed var(--ax-colors-border-secondary)",
									borderRadius: 24,
									marginTop: 16,
									minHeight: 420,
									overflow: "hidden",
									position: "relative",
								}}
							>
								<Box
									style={{
										aspectRatio: getCanvasAspectRatio(assetMode, aspectRatio),
										height: "100%",
										maxHeight: 520,
										maxWidth: "100%",
										overflow: "hidden",
										position: "relative",
										width: "100%",
									}}
								>
								{generated ? (
									<>
										<img
											alt={selectedDraft.title}
											src={selectedDraft.image}
											style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
										/>
										<Box
											bg="bg.default"
											border="1"
											borderColor="border.tertiary"
											display="flex"
											flexDirection="column"
											gap="8"
											p="12"
											rounded="xl"
											shadow="sm"
											style={{ left: 16, position: "absolute", top: 16, width: 220 }}
										>
											<Text fontSize="sm" fontWeight="700">
												Selected draft
											</Text>
											<Text color="fg.secondary" fontSize="xs">
												{selectedDraft.title} scored {selectedDraft.score}% against brand and channel rules.
											</Text>
											<Box alignItems="center" display="flex" gap="8">
												<Badge intent="success">Brand safe</Badge>
												<Badge intent="neutral">{selectedDraft.ratio}</Badge>
											</Box>
											</Box>
										</>
									) : (
									<Box
										alignItems="center"
										display="flex"
										flexDirection="column"
										gap="16"
										justifyContent="center"
										px="24"
										style={{ maxWidth: 520, textAlign: "center" }}
									>
										<Box
											alignItems="center"
											bg="bg.default"
											border="1"
											borderColor="border.tertiary"
											display="flex"
											justifyContent="center"
											rounded="full"
											style={{ height: 72, width: 72 }}
										>
											<IconSparkles size={28} />
										</Box>
										<Text fontSize="xl" fontWeight="700">
											Start generating {assetMode === "image" ? "images" : "video concepts"}
										</Text>
										<Text color="fg.secondary" fontSize="sm">
											Write a prompt, add a reference if useful, and generate two fast directions before producing the final output pack.
										</Text>
										</Box>
									)}
								</Box>
							</Box>

							<Box
								bg="bg.default"
								border="1"
								borderColor="border.tertiary"
								display="flex"
								flexDirection="column"
								gap="12"
								mt="16"
								p="16"
								rounded="xl"
								shadow="sm"
							>
								<Box alignItems="center" display="flex" justifyContent="space-between">
									<Text fontSize="sm" fontWeight="700">
										Prompt
									</Text>
									<Box alignItems="center" display="flex" gap="8">
										<ModeChip>
											<IconWand size={14} />
											Enhance
										</ModeChip>
										<ModeChip active={draftMode}>{draftMode ? "Draft" : "Production"}</ModeChip>
										<Badge intent={saveState === "saved" ? "success" : saveState === "saving" ? "warning" : "neutral"}>
											{saveState === "saved" ? "Autosaved" : saveState === "saving" ? "Saving..." : "Unsaved changes"}
										</Badge>
									</Box>
								</Box>
								<Textarea value={prompt} onChange={(event) => onPromptChange(event.target.value)} style={{ minHeight: 100 }} />
								<Box alignItems="center" display="flex" justifyContent="space-between">
									<Box alignItems="center" display="flex" gap="8" style={{ flexWrap: "wrap" }}>
										<Badge intent="neutral">{brandPack}</Badge>
										<Badge intent="neutral">{themePack}</Badge>
										<Badge intent="neutral">Plan required</Badge>
										{needsRefresh ? <Badge intent="warning">Preview out of sync</Badge> : null}
										{produced ? <Badge intent="success">Pack ready</Badge> : null}
									</Box>
									<Box alignItems="center" display="flex" gap="10">
										<AxiomButton appearance="default" size="lg" onClick={onShowPlan}>
											Show plan
										</AxiomButton>
										<AxiomButton
											appearance="primary"
											size="lg"
											icon={generated ? <IconCheck size={16} /> : <IconSparkles size={16} />}
											onClick={generated ? onProduce : onGenerate}
										>
											{generated ? "Produce pack" : "Generate drafts"}
										</AxiomButton>
									</Box>
								</Box>
							</Box>
						</Box>
					</Box>
				</Box>

				{generated ? (
					<Box bg="bg.default" border="1" borderColor="border.tertiary" p="20" rounded="xl" shadow="sm">
						<Box alignItems="center" display="flex" justifyContent="space-between" mb="16">
							<Text fontSize="lg" fontWeight="700">
								Draft directions
							</Text>
							<Badge intent="neutral">Choose one to continue</Badge>
						</Box>
						<Box display="grid" gap="12" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
							{drafts.map((draft) => (
								<DraftOptionCard
									key={draft.id}
									draft={draft}
									selected={draft.id === selectedDraftId}
									onSelect={() => onSelectDraft(draft.id)}
								/>
							))}
						</Box>
					</Box>
				) : null}

				{produced ? (
					<Box bg="bg.default" border="1" borderColor="border.tertiary" p="20" rounded="xl" shadow="sm">
						<Box alignItems="center" display="flex" justifyContent="space-between" mb="16">
							<Text fontSize="lg" fontWeight="700">
								Output pack
							</Text>
							<Badge intent="success">Ready for DAM</Badge>
						</Box>
						<Box display="grid" gap="12" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
							{outputVariants.map((variant) => (
								<OutputVariantCard key={`${variant.label}-${variant.width}`} variant={variant} />
							))}
						</Box>
					</Box>
				) : null}
			</Box>

			<Box display="flex" flexDirection="column" gap="12">
				<SettingsSection title="General settings">
					<Box display="grid" gap="12">
						<SelectRow label="Intent" value={intent} options={createIntentOptions} onChange={onIntentChange} />
						<SelectRow label="Channel pack" value={channelPack} options={channelPacks} onChange={onChannelPackChange} />
						<Box display="flex" flexDirection="column" gap="8">
							<Text color="fg.secondary" fontSize="xs" fontWeight="600" style={{ letterSpacing: "0.02em", textTransform: "uppercase" }}>
								Aspect ratio
							</Text>
							<RatioChips value={aspectRatio} onChange={onAspectRatioChange} />
						</Box>
					</Box>
				</SettingsSection>
				<SettingsSection title="Brand and packs">
					<Box display="grid" gap="12">
						<SelectRow label="Theme pack" value={themePack} options={themePacks} onChange={onThemePackChange} />
						<SelectRow label="Brand pack" value={brandPack} options={brandPacks} onChange={onBrandPackChange} />
						<Box bg="bg.secondary" border="1" borderColor="border.tertiary" p="12" rounded="xl">
							<Text fontSize="sm" fontWeight="600">
								Hard negative rules
							</Text>
							<Text color="fg.secondary" fontSize="sm" style={{ marginTop: 6 }}>
								No competitor logos, no off-brand neon palettes, no generic stock-office imagery.
							</Text>
						</Box>
					</Box>
				</SettingsSection>
				<SettingsSection title="References and uploads" defaultOpen={false}>
					<Box display="grid" gap="12">
						<SearchInput placeholder="Search uploads or library" size="md" />
						<Box display="grid" gap="12">
							{referenceAssets.slice(0, 2).map((asset) => (
								<ReferenceCard
									key={asset.id}
									asset={asset}
									selected={asset.id === selectedReferenceId}
									onSelect={() => onSelectReference(asset.id)}
								/>
							))}
						</Box>
					</Box>
				</SettingsSection>
				<SettingsSection title="Advanced settings" defaultOpen={false}>
					<Box display="grid" gap="12">
						<Box bg="bg.secondary" border="1" borderColor="border.tertiary" p="12" rounded="xl">
							<Text fontSize="sm" fontWeight="600">
								Plan approval
							</Text>
							<Text color="fg.secondary" fontSize="sm" style={{ marginTop: 6 }}>
								Opal enhances the prompt, applies brand and pack rules, then waits for approval before production.
							</Text>
						</Box>
					</Box>
				</SettingsSection>
			</Box>
		</Box>
	);
}

function EditWorkspace({
	assetMode,
	editTool,
	onEditToolChange,
	prompt,
	onPromptChange,
	aspectRatio,
	onAspectRatioChange,
	channelPack,
	onChannelPackChange,
	brandPack,
	onBrandPackChange,
	themePack,
	onThemePackChange,
	generated,
	produced,
	needsRefresh,
	onGenerate,
	onProduce,
	drafts,
	selectedDraftId,
	onSelectDraft,
	outputVariants,
	saveState,
	onShowPlan,
}: {
	assetMode: AssetMode;
	editTool: string;
	onEditToolChange: (value: string) => void;
	prompt: string;
	onPromptChange: (value: string) => void;
	aspectRatio: string;
	onAspectRatioChange: (value: string) => void;
	channelPack: string;
	onChannelPackChange: (value: string) => void;
	brandPack: string;
	onBrandPackChange: (value: string) => void;
	themePack: string;
	onThemePackChange: (value: string) => void;
	generated: boolean;
	produced: boolean;
	needsRefresh: boolean;
	onGenerate: () => void;
	onProduce: () => void;
	drafts: DraftResult[];
	selectedDraftId: string;
	onSelectDraft: (id: string) => void;
	outputVariants: OutputVariant[];
	saveState: SaveState;
	onShowPlan: () => void;
}) {
	const selectedDraft = drafts.find((draft) => draft.id === selectedDraftId) ?? drafts[0];

	return (
		<Box display="grid" gap="20" style={{ gridTemplateColumns: "minmax(0, 1fr) 320px" }}>
			<Box display="flex" flexDirection="column" gap="20" style={{ minWidth: 0 }}>
				<Box bg="bg.default" border="1" borderColor="border.tertiary" rounded="xl" shadow="md">
					<Box borderB="1" borderColor="border.tertiary" display="flex" justifyContent="space-between" px="20" py="16">
						<Box alignItems="center" display="flex" gap="8">
							<Badge intent="neutral">{editTool}</Badge>
							<Badge intent="neutral">{aspectRatio}</Badge>
							<Badge intent="neutral">{channelPack}</Badge>
						</Box>
						<Box alignItems="center" display="flex" gap="8">
							<Badge intent="neutral">{assetMode === "image" ? "Editing image" : "Editing video"}</Badge>
							<Badge intent="success">Asset loaded</Badge>
						</Box>
					</Box>

					<Box display="grid" gap="20" p="20">
						<Box
							bg="bg.secondary"
							border="1"
							borderColor="border.tertiary"
							display="flex"
							flexDirection="column"
							gap="16"
							p="20"
							rounded="xl"
							style={{
								background:
									"linear-gradient(180deg, rgba(247,248,250,1) 0%, rgba(241,245,249,1) 100%)",
								minHeight: 640,
							}}
						>
							<Box alignItems="center" display="flex" justifyContent="space-between">
								<Text color="fg.secondary" fontSize="sm">
									{editTool} workflow
								</Text>
								<AxiomButton appearance="default" size="sm" icon={<IconAdjustmentsHorizontal size={14} />}>
									Transform settings
								</AxiomButton>
							</Box>

							<Box
								alignItems="center"
								display="grid"
								flex="1"
								gap="20"
								style={{
									gridTemplateColumns: generated ? "minmax(0, 1fr) 220px" : "minmax(0, 1fr)",
									minHeight: 420,
								}}
							>
								<Box
									alignItems="center"
									display="flex"
									justifyContent="center"
									style={{
										border: "1px dashed var(--ax-colors-border-secondary)",
										borderRadius: 24,
										height: "100%",
										overflow: "hidden",
										position: "relative",
									}}
								>
									<Box
										style={{
											aspectRatio: getCanvasAspectRatio(assetMode, aspectRatio),
											height: "100%",
											maxHeight: 520,
											maxWidth: "100%",
											overflow: "hidden",
											width: "100%",
										}}
									>
										<img
											alt="Selected asset"
											src={selectedDraft.image}
											style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
										/>
									</Box>
									<Box
										bg="bg.default"
										border="1"
										borderColor="border.tertiary"
										display="flex"
										flexDirection="column"
										gap="8"
										p="12"
										rounded="xl"
										shadow="sm"
										style={{ left: 16, position: "absolute", top: 16, width: 220 }}
									>
										<Text fontSize="sm" fontWeight="700">
											Source asset
										</Text>
										<Text color="fg.secondary" fontSize="xs">
											Editing starts from the selected DAM asset and keeps brand-safe composition in view.
										</Text>
									</Box>
								</Box>

								{generated ? (
									<Box display="grid" gap="12">
										{drafts.map((draft) => (
											<DraftCard
												key={draft.id}
												draft={draft}
												selected={draft.id === selectedDraftId}
												onSelect={() => onSelectDraft(draft.id)}
											/>
										))}
									</Box>
								) : null}
							</Box>

							<Box
								bg="bg.default"
								border="1"
								borderColor="border.tertiary"
								display="flex"
								flexDirection="column"
								gap="12"
								p="16"
								rounded="xl"
								shadow="sm"
							>
								<Box alignItems="center" display="flex" justifyContent="space-between">
									<Text fontSize="sm" fontWeight="700">
										Describe the change
									</Text>
									<Box alignItems="center" display="flex" gap="8">
										<ModeChip>
											<IconWand size={14} />
											Enhance
										</ModeChip>
										<Badge intent={saveState === "saved" ? "success" : saveState === "saving" ? "warning" : "neutral"}>
											{saveState === "saved" ? "Autosaved" : saveState === "saving" ? "Saving..." : "Unsaved changes"}
										</Badge>
									</Box>
								</Box>
								<Textarea value={prompt} onChange={(event) => onPromptChange(event.target.value)} style={{ minHeight: 96 }} />
								<Box alignItems="center" display="flex" justifyContent="space-between">
									<Box alignItems="center" display="flex" gap="8" style={{ flexWrap: "wrap" }}>
										<Badge intent="neutral">{brandPack}</Badge>
										<Badge intent="neutral">{themePack}</Badge>
										<Badge intent="neutral">Preview before apply</Badge>
										{needsRefresh ? <Badge intent="warning">Preview out of sync</Badge> : null}
										{produced ? <Badge intent="success">Changes ready</Badge> : null}
									</Box>
									<Box alignItems="center" display="flex" gap="10">
										<AxiomButton appearance="default" size="lg" onClick={onShowPlan}>
											Show plan
										</AxiomButton>
										<AxiomButton
											appearance="primary"
											size="lg"
											icon={generated ? <IconCheck size={16} /> : <IconSparkles size={16} />}
											onClick={generated ? onProduce : onGenerate}
										>
											{generated ? "Apply changes" : "Generate variations"}
										</AxiomButton>
									</Box>
								</Box>
							</Box>
						</Box>
					</Box>
				</Box>

				{produced ? (
					<Box bg="bg.default" border="1" borderColor="border.tertiary" p="20" rounded="xl" shadow="sm">
						<Box alignItems="center" display="flex" justifyContent="space-between" mb="16">
							<Text fontSize="lg" fontWeight="700">
								Applied outputs
							</Text>
							<Badge intent="success">Ready to map back</Badge>
						</Box>
						<Box display="grid" gap="12" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
							{outputVariants.map((variant) => (
								<OutputVariantCard key={`${variant.label}-${variant.width}`} variant={variant} />
							))}
						</Box>
					</Box>
				) : null}
			</Box>

			<Box display="flex" flexDirection="column" gap="12">
				<SettingsSection title="Transform settings">
					<Box display="grid" gap="12">
						<SelectRow label="Edit tool" value={editTool} options={editToolOptions} onChange={onEditToolChange} />
						<Box display="flex" flexDirection="column" gap="8">
							<Text color="fg.secondary" fontSize="xs" fontWeight="600" style={{ letterSpacing: "0.02em", textTransform: "uppercase" }}>
								Output ratio
							</Text>
							<RatioChips value={aspectRatio} onChange={onAspectRatioChange} />
						</Box>
						<Box bg="bg.secondary" border="1" borderColor="border.tertiary" p="12" rounded="xl">
							<Text fontSize="sm" fontWeight="600">
								Preview math
							</Text>
							<Text color="fg.secondary" fontSize="sm" style={{ marginTop: 6 }}>
								Changing the ratio immediately updates the canvas crop frame. Generation is still explicit.
							</Text>
						</Box>
					</Box>
				</SettingsSection>
				<SettingsSection title="Output and destinations">
					<Box display="grid" gap="12">
						<SelectRow label="Channel pack" value={channelPack} options={channelPacks} onChange={onChannelPackChange} />
						<SelectRow label="Theme pack" value={themePack} options={themePacks} onChange={onThemePackChange} />
						<SelectRow label="Brand pack" value={brandPack} options={brandPacks} onChange={onBrandPackChange} />
						<Box bg="bg.secondary" border="1" borderColor="border.tertiary" p="12" rounded="xl">
							<Text fontSize="sm" fontWeight="600">
								After approval
							</Text>
							<Text color="fg.secondary" fontSize="sm" style={{ marginTop: 6 }}>
								Apply the approved variation, generate requested ratios, and map metadata back into DAM fields.
							</Text>
						</Box>
					</Box>
				</SettingsSection>
				<SettingsSection title="Brand checks" defaultOpen={false}>
					<Box display="grid" gap="12">
						<Box bg="bg.secondary" border="1" borderColor="border.tertiary" p="12" rounded="xl">
							<Text fontSize="sm" fontWeight="600">
								Compliance gate
							</Text>
							<Text color="fg.secondary" fontSize="sm" style={{ marginTop: 6 }}>
								Protect the hero athlete, keep clean copy zones, and block non-brand-safe edits.
							</Text>
						</Box>
					</Box>
				</SettingsSection>
			</Box>
		</Box>
	);
}

export default function OpalStudioPrototypePage() {
	const searchParams = useSearchParams();
	const { opalPanelControls, opalPanelWidth, setHidePageHeader } = useLayout();
	const opalContext = useOpalContext();
	const seededPanelKeyRef = useRef<string | null>(null);
	const [flowMode, setFlowMode] = useState<FlowMode>("create");
	const [assetMode, setAssetMode] = useState<AssetMode>("image");
	const [createStage, setCreateStage] = useState<CreateStage>("panel");
	const [createPrompt, setCreatePrompt] = useState(
		"Create a premium Stride campaign image for spring race season with clean headline space, high-end athletic photography, and brand-safe composition.",
	);
	const [editPrompt, setEditPrompt] = useState(
		"Reframe this asset for paid social, preserve the athlete, and create two cleaner variants with stronger product focus.",
	);
	const [intent, setIntent] = useState(createIntentOptions[0]);
	const [editTool, setEditTool] = useState(editToolOptions[0]);
	const [aspectRatio, setAspectRatio] = useState<(typeof aspectRatios)[number]>("4:5");
	const [channelPack, setChannelPack] = useState(channelPacks[0]);
	const [themePack, setThemePack] = useState(themePacks[0]);
	const [brandPack, setBrandPack] = useState(brandPacks[0]);
	const [draftMode] = useState(true);
	const [showReferences, setShowReferences] = useState(true);
	const [selectedReferenceId, setSelectedReferenceId] = useState(referenceAssets[0].id);
	const [generated, setGenerated] = useState(false);
	const [produced, setProduced] = useState(false);
	const [selectedDraftId, setSelectedDraftId] = useState(imageDrafts[0].id);
	const [saveState, setSaveState] = useState<SaveState>("saved");
	const [planOpen, setPlanOpen] = useState(false);
	const panelMessages = opalContext.chatState.messages;
	const chatDraftPayload = useMemo(() => extractLatestImageFromMessages(panelMessages), [panelMessages]);
	const chatDraft = chatDraftPayload?.draft ?? null;
	const [storedQuickDraft, setStoredQuickDraft] = useState<{
		prompt: string;
		image: string;
		returnTo?: string;
		messages?: Array<{ role: "user" | "assistant"; content: string }>;
	} | null>(null);

	useEffect(() => {
		setHidePageHeader(true);
		return () => setHidePageHeader(false);
	}, [setHidePageHeader]);

	useEffect(() => {
		try {
			const savedQuickDraft = window.localStorage.getItem(QUICK_DRAFT_STORAGE_KEY);
			if (!savedQuickDraft) {
				return;
			}

			const parsed = JSON.parse(savedQuickDraft) as {
				prompt?: string;
				image?: string;
				returnTo?: string;
				messages?: Array<{ role: "user" | "assistant"; content: string }>;
			};
			if (parsed.prompt && parsed.image) {
				setStoredQuickDraft({
					prompt: parsed.prompt,
					image: parsed.image,
					returnTo: parsed.returnTo,
					messages: parsed.messages,
				});
			}
		} catch {
			// Ignore invalid stored quick draft payloads.
		}
	}, []);

	useEffect(() => {
		const flow = searchParams.get("flow");
		const asset = searchParams.get("asset");
		const stage = searchParams.get("stage");
		const prompt = searchParams.get("prompt");
		const draft = searchParams.get("draft");
		if (flow === "create" || flow === "edit") {
			setFlowMode(flow);
		}
		if (asset === "image" || asset === "video") {
			setAssetMode(asset);
		}
		if (stage === "advanced" && asset === "image") {
			setFlowMode("create");
			setAssetMode("image");
			setCreateStage("advanced");
			setGenerated(true);
			setProduced(false);
			if (prompt) {
				setCreatePrompt(prompt);
			}
			if (draft) {
				setSelectedDraftId("chat-draft");
			}
		} else if (flow !== "edit") {
			setCreateStage("panel");
		}
	}, [searchParams]);

	const drafts = useMemo(() => (assetMode === "image" ? imageDrafts : videoDrafts), [assetMode]);
	const effectiveDrafts = useMemo(() => {
		const sourceDraft = chatDraft ?? (storedQuickDraft
			? {
				image: storedQuickDraft.image,
				title: "Quick draft",
				score: 96,
				ratio: "4:5",
			}
			: null);

		if (assetMode === "image" && sourceDraft && createStage === "advanced" && flowMode === "create") {
			return [
				{
					...sourceDraft,
					id: "chat-draft",
					title: sourceDraft.title || "Quick draft",
				},
				...imageDrafts.filter((draft) => draft.id !== "chat-draft"),
			];
		}

		return drafts;
	}, [assetMode, chatDraft, createStage, drafts, flowMode, storedQuickDraft]);
	const draftConfig = useMemo(
		() => ({
			flowMode,
			assetMode,
			createPrompt,
			editPrompt,
			intent,
			editTool,
			aspectRatio,
			channelPack,
			themePack,
			brandPack,
			draftMode,
			showReferences,
			selectedReferenceId,
		}),
		[
			assetMode,
			aspectRatio,
			brandPack,
			channelPack,
			createPrompt,
			draftMode,
			editPrompt,
			editTool,
			flowMode,
			intent,
			selectedReferenceId,
			showReferences,
			themePack,
		],
	);
	const configSignature = useMemo(() => JSON.stringify(draftConfig), [draftConfig]);
	const [lastGeneratedSignature, setLastGeneratedSignature] = useState<string | null>(null);
	const needsRefresh = generated && lastGeneratedSignature !== configSignature;
	const outputVariants = useMemo(
		() => getOutputVariants(channelPack, assetMode, aspectRatio),
		[assetMode, aspectRatio, channelPack],
	);

	useEffect(() => {
		const routeStage = searchParams.get("stage");
		const routeFlow = searchParams.get("flow");
		const routeAsset = searchParams.get("asset");
		const routePrompt = searchParams.get("prompt");
		const routeDraft = searchParams.get("draft");
		try {
			const saved = window.localStorage.getItem("cmp-opal-studio-draft");
			if (!saved) {
				return;
			}

			const parsed = JSON.parse(saved) as Partial<typeof draftConfig>;
			if (!routeFlow && (parsed.flowMode === "create" || parsed.flowMode === "edit")) {
				setFlowMode(parsed.flowMode);
			}
			if (!routeAsset && (parsed.assetMode === "image" || parsed.assetMode === "video")) {
				setAssetMode(parsed.assetMode);
			}
			if (!routePrompt && typeof parsed.createPrompt === "string") setCreatePrompt(parsed.createPrompt);
			if (typeof parsed.editPrompt === "string") setEditPrompt(parsed.editPrompt);
			if (typeof parsed.intent === "string") setIntent(parsed.intent);
			if (typeof parsed.editTool === "string") setEditTool(parsed.editTool);
			if (typeof parsed.aspectRatio === "string") setAspectRatio(parsed.aspectRatio as (typeof aspectRatios)[number]);
			if (typeof parsed.channelPack === "string") setChannelPack(parsed.channelPack);
			if (typeof parsed.themePack === "string") setThemePack(parsed.themePack);
			if (typeof parsed.brandPack === "string") setBrandPack(parsed.brandPack);
			if (typeof parsed.showReferences === "boolean") setShowReferences(parsed.showReferences);
			if (typeof parsed.selectedReferenceId === "string") setSelectedReferenceId(parsed.selectedReferenceId);
			if (parsed.flowMode === "create" && routeStage !== "advanced") {
				setCreateStage("panel");
			}
			if (routeDraft) {
				setSelectedDraftId("chat-draft");
			}
		} catch {
			// Ignore invalid saved drafts in prototype mode.
		}
	}, [searchParams]);

	useEffect(() => {
		setSaveState("saving");
		const timeoutId = window.setTimeout(() => {
			window.localStorage.setItem("cmp-opal-studio-draft", configSignature);
			setSaveState("saved");
		}, 600);

		return () => {
			window.clearTimeout(timeoutId);
			setSaveState("unsaved");
		};
	}, [configSignature]);

	useEffect(() => {
		if (!effectiveDrafts.find((draft) => draft.id === selectedDraftId)) {
			setSelectedDraftId(effectiveDrafts[0]?.id ?? "");
		}
	}, [effectiveDrafts, selectedDraftId]);

	useEffect(() => {
		const stage = searchParams.get("stage");
		if (flowMode === "create" && assetMode === "image" && stage === "advanced") {
			setLastGeneratedSignature(configSignature);
		}
	}, [assetMode, configSignature, flowMode, searchParams]);

	useEffect(() => {
		const restoredPrompt = chatDraftPayload?.prompt || storedQuickDraft?.prompt;
		if (flowMode === "create" && createStage === "advanced" && assetMode === "image" && restoredPrompt) {
			setCreatePrompt(restoredPrompt);
		}
	}, [assetMode, chatDraftPayload, createStage, flowMode, storedQuickDraft]);

	useEffect(() => {
		if (
			flowMode !== "create" ||
			createStage !== "advanced" ||
			assetMode !== "image" ||
			!opalPanelControls ||
			!storedQuickDraft?.messages?.length
		) {
			return;
		}

		const alreadyHasDraftThread = panelMessages.some(
			(message) =>
				message.role === "assistant" &&
				message.content.includes("I created a quick image draft for"),
		);

		if (alreadyHasDraftThread) {
			return;
		}

		opalPanelControls.clearHistory();
		storedQuickDraft.messages.forEach((message) => {
			opalPanelControls.addMessage({
				role: message.role,
				content: message.content,
			});
		});
		opalPanelControls.setInputValue("");
		opalPanelControls.openPanel();
	}, [assetMode, createStage, flowMode, opalPanelControls, panelMessages, storedQuickDraft]);

	useEffect(() => {
		if (flowMode !== "create" || createStage !== "panel") {
			seededPanelKeyRef.current = null;
			return;
		}

		const seedKey = `${flowMode}:${assetMode}:${createStage}`;
		if (!opalPanelControls || seededPanelKeyRef.current === seedKey) {
			return;
		}

		opalPanelControls.clearHistory();
		opalPanelControls.openPanel();
		opalPanelControls.setInputValue(
			assetMode === "image"
				? "Create a new dynamic image for a triathlon poster"
				: "Create a launch teaser video for Stride spring race season",
		);
		seededPanelKeyRef.current = seedKey;
	}, [assetMode, createStage, flowMode, opalPanelControls]);

	useEffect(() => {
		if (flowMode === "create" && opalPanelControls) {
			opalPanelControls.openPanel();
		}
	}, [flowMode, opalPanelControls]);

	const handleSaveDraft = () => {
		window.localStorage.setItem("cmp-opal-studio-draft", configSignature);
		setSaveState("saved");
	};

	const handleGenerate = () => {
		setGenerated(true);
		setProduced(false);
		setLastGeneratedSignature(configSignature);
	};

	const handleProduce = () => {
		setProduced(true);
		setLastGeneratedSignature(configSignature);
	};

	return (
		<Box
			bg="bg.secondary"
			display="flex"
			flexDirection="column"
			style={{
				margin: "-32px",
				minHeight: "calc(100vh - 57px)",
				width:
					createStage === "advanced" && assetMode === "image" && opalPanelWidth > 0
						? `calc(100% - ${opalPanelWidth}px)`
						: "100%",
				transition: "width 0.3s cubic-bezier(0, 1, 0, 1)",
			}}
		>
			<Box flex="1">
				<Box style={{ height: "100%", width: "100%" }}>
					{planOpen ? (
						<Box bg="bg.default" border="1" borderColor="border.tertiary" mb="20" p="16" rounded="xl" shadow="sm">
						<Box alignItems="center" display="flex" justifyContent="space-between">
							<Text fontSize="sm" fontWeight="700">
								Execution plan
							</Text>
							<AxiomButton appearance="default" size="sm" onClick={() => setPlanOpen(false)}>
								Close
							</AxiomButton>
						</Box>
						<Box display="grid" gap="10" mt="12">
							{[
								`Use ${brandPack.toLowerCase()} rules and ${themePack.toLowerCase()} style direction`,
								`Generate ${draftMode ? "two fast drafts" : "production-first outputs"} for ${channelPack.toLowerCase()}`,
								`Apply ${aspectRatio} preview math immediately and ${outputVariants.length} output formula${outputVariants.length === 1 ? "" : "s"} on production`,
							].map((line) => (
								<Box key={line} bg="bg.secondary" border="1" borderColor="border.tertiary" p="12" rounded="xl">
									<Text fontSize="sm">{line}</Text>
								</Box>
							))}
						</Box>
						</Box>
					) : null}
					{flowMode === "create" ? (
						createStage === "advanced" && assetMode === "image" ? (
							<AdvancedCanvasWorkspace
								prompt={chatDraftPayload?.prompt || storedQuickDraft?.prompt || createPrompt}
								selectedDraft={effectiveDrafts.find((draft) => draft.id === selectedDraftId) ?? effectiveDrafts[0]}
								saveState={saveState}
								onCloseAdvanced={() => {
									setCreateStage("panel");
									setGenerated(false);
									setProduced(false);
								}}
							/>
						) : (
							<CreatePanelOnlyState />
						)
					) : (
						<AdvancedCanvasWorkspace
							prompt={editPrompt}
							selectedDraft={effectiveDrafts.find((draft) => draft.id === selectedDraftId) ?? effectiveDrafts[0]}
							saveState={saveState}
							onCloseAdvanced={() => {
								setFlowMode("create");
								setCreateStage("panel");
							}}
						/>
					)}
				</Box>
			</Box>
		</Box>
	);
}

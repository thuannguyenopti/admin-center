"use client";

import {useEffect, useMemo, useRef, useState, type ReactNode} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {
	Badge,
	Box,
	Button as AxiomButton,
	SearchInput,
	Switch,
	Text,
	Textarea,
	ToggleButton,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "@optiaxiom/react";
import {
	IconArrowBackUp,
	IconArrowForwardUp,
	IconAdjustmentsHorizontal,
	IconCheck,
	IconChevronDown,
	IconCopy,
	IconDownload,
	IconSparkles,
	IconUpload,
	IconWand,
	IconXmark,
	IconPlus,
} from "@/app/lib/axiom-icons";
import {useLayout} from "@/app/context/LayoutContext";
import {useOpalContext} from "@/app/context/OpalContext";
import type {ChatMessage} from "@/app/hooks/useOpalState";

type FlowMode = "create" | "edit";
type AssetMode = "image" | "video";
type SaveState = "saved" | "saving" | "unsaved";
type CreateStage = "panel" | "advanced";
type CanvasMode = "generate" | "edit";
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
	{label: "Create", value: "create"},
	{label: "Edit", value: "edit"},
] as const;

const mediumOptions = [
	{label: "Image", value: "image"},
	{label: "Video", value: "video"},
] as const;

const createIntentOptions = ["Social campaign", "Poster", "Product placement", "Trade booth"];

const intentOptions = ["Logo", "Photo", "Video", "Poster", "Illustrations", "Icons"];

const editToolOptions = ["Resize", "Reframe", "Upscale", "Variation pack"];

const aspectRatios = ["Auto", "1:1", "4:5", "16:9", "9:16"] as const;
const channelPacks = [
	"Social starter pack",
	"Paid social flight",
	"Event campaign pack",
	"Email + web hero",
];
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

const ratioDimensions: Record<
	(typeof aspectRatios)[number],
	{width: number; height: number} | null
> = {
	Auto: null,
	"1:1": {width: 1080, height: 1080},
	"4:5": {width: 1080, height: 1350},
	"16:9": {width: 1920, height: 1080},
	"9:16": {width: 1080, height: 1920},
};

const channelPackOutputs: Record<string, OutputVariant[]> = {
	"Social starter pack": [
		{label: "Instagram square", width: 1080, height: 1080, ratio: "1:1"},
		{label: "Instagram portrait", width: 1080, height: 1350, ratio: "4:5"},
		{label: "Stories", width: 1080, height: 1920, ratio: "9:16"},
	],
	"Paid social flight": [
		{label: "Feed portrait", width: 1080, height: 1350, ratio: "4:5"},
		{label: "Landscape display", width: 1200, height: 628, ratio: "16:9"},
		{label: "Reels / Shorts", width: 1080, height: 1920, ratio: "9:16"},
	],
	"Event campaign pack": [
		{label: "Poster key art", width: 1440, height: 1800, ratio: "4:5"},
		{label: "Hero landscape", width: 1920, height: 1080, ratio: "16:9"},
		{label: "Lobby screen", width: 1080, height: 1920, ratio: "9:16"},
	],
	"Email + web hero": [
		{label: "Email hero", width: 1200, height: 900, ratio: "4:5"},
		{label: "Homepage hero", width: 1920, height: 1080, ratio: "16:9"},
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
		<ToggleButton
			appearance="default"
			size="md"
			pressed={active}
			onPressedChange={() => onClick?.()}
		>
			{children}
		</ToggleButton>
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
			{open ? (
				<Box px="16" pb="16">
					{children}
				</Box>
			) : null}
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
			<Text
				color="fg.secondary"
				fontSize="xs"
				fontWeight="600"
				style={{letterSpacing: "0.02em", textTransform: "uppercase"}}
			>
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
				border: `1px solid ${selected ? "var(--ax-colors-border-default)" : "var(--ax-colors-border-tertiary)"}`,
				borderRadius: 18,
				cursor: "pointer",
				overflow: "hidden",
				padding: 0,
				textAlign: "left",
				width: "100%",
			}}
		>
			<img
				alt={asset.title}
				src={asset.image}
				style={{display: "block", height: 132, objectFit: "cover", width: "100%"}}
			/>
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
				border: `1px solid ${selected ? "var(--ax-colors-border-default)" : "var(--ax-colors-border-tertiary)"}`,
				borderRadius: 18,
				cursor: "pointer",
				overflow: "hidden",
				padding: 0,
				textAlign: "left",
				width: "100%",
			}}
		>
			<Box
				style={{
					aspectRatio: draft.ratio === "9:16" ? "9 / 16" : "4 / 5",
					overflow: "hidden",
				}}
			>
				<img
					alt={draft.title}
					src={draft.image}
					style={{display: "block", height: "100%", objectFit: "cover", width: "100%"}}
				/>
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
				border: `1px solid ${selected ? "var(--ax-colors-border-default)" : "var(--ax-colors-border-tertiary)"}`,
				borderRadius: 16,
				cursor: "pointer",
				overflow: "hidden",
				padding: 0,
				textAlign: "left",
				width: "100%",
			}}
		>
			<Box display="grid" style={{gridTemplateColumns: "120px minmax(0, 1fr)"}}>
				<Box style={{height: 96, overflow: "hidden"}}>
					<img
						alt={draft.title}
						src={draft.image}
						style={{
							display: "block",
							height: "100%",
							objectFit: "cover",
							width: "100%",
						}}
					/>
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

function OutputVariantCard({variant}: {variant: OutputVariant}) {
	return (
		<Box bg="bg.secondary" border="1" borderColor="border.tertiary" p="12" rounded="xl">
			<Box alignItems="center" display="flex" justifyContent="space-between">
				<Text fontSize="sm" fontWeight="600">
					{variant.label}
				</Text>
				<Badge intent="neutral">{variant.ratio}</Badge>
			</Box>
			<Text color="fg.secondary" fontSize="xs" style={{marginTop: 6}}>
				{variant.width} x {variant.height}
			</Text>
		</Box>
	);
}

function RatioChips({value, onChange}: {value: string; onChange: (value: string) => void}) {
	return (
		<Box
			alignItems="center"
			bg="bg.secondary"
			display="inline-flex"
			gap="4"
			p="4"
			rounded="full"
			style={{width: "fit-content"}}
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
						color:
							value === ratio
								? "var(--ax-colors-fg-default)"
								: "var(--ax-colors-fg-secondary)",
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
	return <Box flex="1" style={{minHeight: "calc(100vh - 57px)"}} />;
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
	return (
		<AxiomButton
			aria-label={ariaLabel}
			appearance="default"
			size="sm"
			icon={icon}
			onClick={onClick}
		/>
	);
}

function CanvasTopBar({
	canvasMode,
	onCanvasModeChange,
	saveState,
	onClose,
}: {
	canvasMode: CanvasMode;
	onCanvasModeChange: (mode: CanvasMode) => void;
	saveState: SaveState;
	onClose: () => void;
}) {
	const [addToMenuOpen, setAddToMenuOpen] = useState(false);

	return (
		<Box
			alignItems="center"
			borderB="1"
			borderColor="border.tertiary"
			bg="bg.default"
			display="flex"
			justifyContent="space-between"
			px="24"
			py="12"
			style={{minHeight: 64}}
		>
			{/* Left side: Mode toggle */}
			<Box alignItems="center" display="flex" gap="8">
				<Box
					alignItems="center"
					bg="bg.secondary"
					display="inline-flex"
					gap="4"
					p="4"
					rounded="full"
					style={{width: "fit-content"}}
				>
					<button
						type="button"
						onClick={() => onCanvasModeChange("generate")}
						style={{
							background:
								canvasMode === "generate"
									? "var(--ax-colors-bg-default)"
									: "transparent",
							border: 0,
							borderRadius: 999,
							color:
								canvasMode === "generate"
									? "var(--ax-colors-fg-default)"
									: "var(--ax-colors-fg-secondary)",
							cursor: "pointer",
							fontSize: 14,
							fontWeight: canvasMode === "generate" ? 600 : 500,
							height: 36,
							padding: "0 16px",
							transition: "all 0.2s ease",
						}}
					>
						Generate
					</button>
					<button
						type="button"
						onClick={() => onCanvasModeChange("edit")}
						style={{
							background:
								canvasMode === "edit"
									? "var(--ax-colors-bg-default)"
									: "transparent",
							border: 0,
							borderRadius: 999,
							color:
								canvasMode === "edit"
									? "var(--ax-colors-fg-default)"
									: "var(--ax-colors-fg-secondary)",
							cursor: "pointer",
							fontSize: 14,
							fontWeight: canvasMode === "edit" ? 600 : 500,
							height: 36,
							padding: "0 16px",
							transition: "all 0.2s ease",
						}}
					>
						Edit
					</button>
				</Box>
			</Box>

			{/* Right side: Actions */}
			<Box alignItems="center" display="flex" gap="8">
				<Text color="fg.secondary" fontSize="xs">
					{saveState === "saved"
						? "Changes saved"
						: saveState === "saving"
							? "Saving..."
							: "Unsaved changes"}
				</Text>
				<CanvasToolbarIconButton ariaLabel="Undo" icon={<IconArrowBackUp size={16} />} />
				<CanvasToolbarIconButton ariaLabel="Redo" icon={<IconArrowForwardUp size={16} />} />
				<CanvasToolbarIconButton ariaLabel="Copy" icon={<IconCopy size={16} />} />

				{/* Add to dropdown */}
				<Box style={{position: "relative"}}>
					<AxiomButton
						appearance="primary"
						size="sm"
						icon={<IconChevronDown size={14} />}
						onClick={() => setAddToMenuOpen(!addToMenuOpen)}
					>
						Add to
					</AxiomButton>
					{addToMenuOpen ? (
						<Box
							bg="bg.default"
							border="1"
							borderColor="border.tertiary"
							rounded="lg"
							shadow="lg"
							style={{
								position: "absolute",
								right: 0,
								top: 40,
								width: 200,
								zIndex: 100,
							}}
						>
							<Box display="flex" flexDirection="column" p="4">
								{[
									{label: "Add to Task", icon: <IconPlus size={16} />},
									{label: "Add to Library", icon: <IconDownload size={16} />},
									{label: "Download", icon: <IconDownload size={16} />},
								].map((item) => (
									<button
										key={item.label}
										type="button"
										onClick={() => {
											setAddToMenuOpen(false);
											// Handle action
										}}
										style={{
											alignItems: "center",
											background: "transparent",
											border: 0,
											borderRadius: 6,
											color: "var(--ax-colors-fg-default)",
											cursor: "pointer",
											display: "flex",
											fontSize: 14,
											gap: 8,
											padding: "8px 12px",
											textAlign: "left",
											transition: "background 0.15s ease",
											width: "100%",
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.background =
												"var(--ax-colors-bg-secondary)";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.background = "transparent";
										}}
									>
										{item.icon}
										{item.label}
									</button>
								))}
							</Box>
						</Box>
					) : null}
				</Box>

				<CanvasToolbarIconButton
					ariaLabel="Close canvas"
					icon={<IconXmark size={16} />}
					onClick={onClose}
				/>
			</Box>
		</Box>
	);
}

function CanvasSettingsSidebar({
	canvasMode,
	intent,
	onIntentChange,
	aspectRatio,
	onAspectRatioChange,
	channelPack,
	onChannelPackChange,
	themePack,
	onThemePackChange,
	brandPack,
	onBrandPackChange,
	referenceAssets,
	selectedReferenceId,
	onSelectReference,
	textOverlayEnabled,
	onTextOverlayChange,
	referenceStrength,
	onReferenceStrengthChange,
	outputVariants,
}: {
	canvasMode: CanvasMode;
	intent: string;
	onIntentChange: (value: string) => void;
	aspectRatio: string;
	onAspectRatioChange: (value: string) => void;
	channelPack: string;
	onChannelPackChange: (value: string) => void;
	themePack: string;
	onThemePackChange: (value: string) => void;
	brandPack: string;
	onBrandPackChange: (value: string) => void;
	referenceAssets: ReferenceAsset[];
	selectedReferenceId: string;
	onSelectReference: (id: string) => void;
	textOverlayEnabled: boolean;
	onTextOverlayChange: (enabled: boolean) => void;
	referenceStrength: number;
	onReferenceStrengthChange: (value: number) => void;
	outputVariants: OutputVariant[];
}) {
	const showAspectRatio = intent !== "Logo"; // Logos are always square
	const showChannelPack = intent === "Photo" || intent === "Poster";

	return (
		<Box
			bg="bg.default"
			borderL="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			style={{width: 400, minHeight: "100%", overflowY: "auto"}}
		>
			<Box borderB="1" borderColor="border.tertiary" p="24" pb="20">
				<Text fontSize="lg" fontWeight="700">
					Settings
				</Text>
			</Box>

			<Box flex="1" p="24" pt="20">
				<Tabs defaultValue="output">
					<TabsList>
						<TabsTrigger value="output">Output</TabsTrigger>
						<TabsTrigger value="brand">Brand</TabsTrigger>
						<TabsTrigger value="advanced">Advanced</TabsTrigger>
					</TabsList>

					{/* Output Tab */}
					<TabsContent value="output">
						<Box display="flex" flexDirection="column" gap="24" pt="20">
							{/* Intent - Always visible */}
							<Box display="flex" flexDirection="column" gap="12">
								<Text
									color="fg.secondary"
									fontSize="xs"
									fontWeight="600"
									style={{letterSpacing: "0.02em", textTransform: "uppercase"}}
								>
									Intent
								</Text>
								<select
									value={intent}
									onChange={(e) => onIntentChange(e.target.value)}
									style={{
										background: "var(--ax-colors-bg-default)",
										border: "1px solid var(--ax-colors-border-secondary)",
										borderRadius: 12,
										color: "var(--ax-colors-fg-default)",
										fontSize: 14,
										height: 44,
										outline: "none",
										padding: "0 14px",
									}}
								>
									{intentOptions.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
								<Text color="fg.secondary" fontSize="xs">
									{intent === "Logo" &&
										"AI will optimize for clean vectors and brand marks"}
									{intent === "Photo" &&
										"AI will load photorealistic rendering skills"}
									{intent === "Video" &&
										"AI will prepare motion and timing controls"}
									{intent === "Poster" &&
										"AI will focus on bold composition and copy space"}
									{intent === "Illustrations" &&
										"AI will use illustrative styles and treatments"}
									{intent === "Icons" &&
										"AI will create minimal, recognizable symbols"}
								</Text>
							</Box>

							{/* Aspect Ratio - Conditional */}
							{showAspectRatio && (
								<Box display="flex" flexDirection="column" gap="12">
									<Text
										color="fg.secondary"
										fontSize="xs"
										fontWeight="600"
										style={{
											letterSpacing: "0.02em",
											textTransform: "uppercase",
										}}
									>
										Aspect Ratio
									</Text>
									<RatioChips
										value={aspectRatio}
										onChange={onAspectRatioChange}
									/>
									<Text color="fg.secondary" fontSize="xs">
										{aspectRatio === "Auto" &&
											"Opal will choose the best ratio for your channel pack"}
										{aspectRatio === "1:1" &&
											"Square format • Instagram posts, profile images"}
										{aspectRatio === "4:5" &&
											"Portrait • Instagram feed, Facebook posts"}
										{aspectRatio === "16:9" &&
											"Landscape • YouTube, presentations, web heroes"}
										{aspectRatio === "9:16" &&
											"Vertical • Instagram stories, TikTok, Reels"}
									</Text>
								</Box>
							)}

							{/* Channel Pack - Conditional */}
							{showChannelPack && (
								<Box display="flex" flexDirection="column" gap="12">
									<Text
										color="fg.secondary"
										fontSize="xs"
										fontWeight="600"
										style={{
											letterSpacing: "0.02em",
											textTransform: "uppercase",
										}}
									>
										Channel Pack
									</Text>
									<select
										value={channelPack}
										onChange={(e) => onChannelPackChange(e.target.value)}
										style={{
											background: "var(--ax-colors-bg-default)",
											border: "1px solid var(--ax-colors-border-secondary)",
											borderRadius: 12,
											color: "var(--ax-colors-fg-default)",
											fontSize: 14,
											height: 44,
											outline: "none",
											padding: "0 14px",
										}}
									>
										{channelPacks.map((option) => (
											<option key={option} value={option}>
												{option}
											</option>
										))}
									</select>

									{/* Output Preview */}
									{outputVariants.length > 0 && (
										<Box
											bg="bg.secondary"
											border="1"
											borderColor="border.tertiary"
											p="12"
											rounded="xl"
										>
											<Text fontSize="xs" fontWeight="600" mb="8">
												Will generate {outputVariants.length} outputs:
											</Text>
											<Box display="flex" flexDirection="column" gap="6">
												{outputVariants.map((variant) => (
													<Box
														key={`${variant.label}-${variant.width}`}
														display="flex"
														alignItems="center"
														justifyContent="space-between"
													>
														<Text fontSize="xs" color="fg.secondary">
															{variant.label}
														</Text>
														<Badge intent="neutral" size="sm">
															{variant.width}×{variant.height}
														</Badge>
													</Box>
												))}
											</Box>
										</Box>
									)}
								</Box>
							)}
						</Box>
					</TabsContent>

					{/* Brand Tab */}
					<TabsContent value="brand">
						<Box display="flex" flexDirection="column" gap="24" pt="20">
							{/* Theme Package */}
							<Box display="flex" flexDirection="column" gap="12">
								<Text
									color="fg.secondary"
									fontSize="xs"
									fontWeight="600"
									style={{letterSpacing: "0.02em", textTransform: "uppercase"}}
								>
									Theme Package
								</Text>
								<select
									value={themePack}
									onChange={(e) => onThemePackChange(e.target.value)}
									style={{
										background: "var(--ax-colors-bg-default)",
										border: "1px solid var(--ax-colors-border-secondary)",
										borderRadius: 12,
										color: "var(--ax-colors-fg-default)",
										fontSize: 14,
										height: 44,
										outline: "none",
										padding: "0 14px",
									}}
								>
									{themePacks.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
								<Text color="fg.secondary" fontSize="xs">
									Campaign-specific visual direction and color palette
								</Text>
							</Box>

							{/* Brand Pack */}
							<Box display="flex" flexDirection="column" gap="12">
								<Text
									color="fg.secondary"
									fontSize="xs"
									fontWeight="600"
									style={{letterSpacing: "0.02em", textTransform: "uppercase"}}
								>
									Brand Pack
								</Text>
								<select
									value={brandPack}
									onChange={(e) => onBrandPackChange(e.target.value)}
									style={{
										background: "var(--ax-colors-bg-default)",
										border: "1px solid var(--ax-colors-border-secondary)",
										borderRadius: 12,
										color: "var(--ax-colors-fg-default)",
										fontSize: 14,
										height: 44,
										outline: "none",
										padding: "0 14px",
									}}
								>
									{brandPacks.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
								<Text color="fg.secondary" fontSize="xs">
									Applies Stride's brand guidelines and negative rules
								</Text>
							</Box>

							{/* Reference Images */}
							<Box display="flex" flexDirection="column" gap="12">
								<Box
									alignItems="center"
									display="flex"
									justifyContent="space-between"
								>
									<Text
										color="fg.secondary"
										fontSize="xs"
										fontWeight="600"
										style={{
											letterSpacing: "0.02em",
											textTransform: "uppercase",
										}}
									>
										Reference Images
									</Text>
									<AxiomButton
										appearance="default"
										size="sm"
										icon={<IconUpload size={14} />}
									>
										Upload
									</AxiomButton>
								</Box>
								<Box
									display="grid"
									gap="12"
									style={{gridTemplateColumns: "1fr 1fr"}}
								>
									{referenceAssets.slice(0, 4).map((asset) => (
										<button
											key={asset.id}
											type="button"
											onClick={() => onSelectReference(asset.id)}
											style={{
												background: "var(--ax-colors-bg-default)",
												border: `2px solid ${asset.id === selectedReferenceId ? "var(--ax-colors-border-default)" : "var(--ax-colors-border-tertiary)"}`,
												borderRadius: 12,
												cursor: "pointer",
												overflow: "hidden",
												padding: 0,
												textAlign: "left",
												transition: "border-color 0.2s ease",
											}}
										>
											<img
												alt={asset.title}
												src={asset.image}
												style={{
													display: "block",
													height: 96,
													objectFit: "cover",
													width: "100%",
												}}
											/>
											<Box p="10">
												<Text fontSize="xs" fontWeight="600">
													{asset.title}
												</Text>
												<Text color="fg.secondary" fontSize="xs">
													{asset.source}
												</Text>
											</Box>
										</button>
									))}
								</Box>

								{/* Reference Strength Slider */}
								{selectedReferenceId && (
									<Box display="flex" flexDirection="column" gap="8" mt="8">
										<Box
											alignItems="center"
											display="flex"
											justifyContent="space-between"
										>
											<Text
												color="fg.secondary"
												fontSize="xs"
												fontWeight="600"
												style={{
													letterSpacing: "0.02em",
													textTransform: "uppercase",
												}}
											>
												Reference Influence
											</Text>
											<Text color="fg.default" fontSize="xs" fontWeight="600">
												{referenceStrength}%
											</Text>
										</Box>
										<input
											type="range"
											min="0"
											max="100"
											value={referenceStrength}
											onChange={(e) =>
												onReferenceStrengthChange(Number(e.target.value))
											}
											style={{
												width: "100%",
												accentColor: "var(--ax-colors-fg-default)",
											}}
										/>
										<Text color="fg.secondary" fontSize="xs">
											{referenceStrength < 30 && "Subtle inspiration only"}
											{referenceStrength >= 30 &&
												referenceStrength < 70 &&
												"Balanced influence"}
											{referenceStrength >= 70 && "Strong style transfer"}
										</Text>
									</Box>
								)}
							</Box>
						</Box>
					</TabsContent>

					{/* Advanced Tab */}
					<TabsContent value="advanced">
						<Box display="flex" flexDirection="column" gap="24" pt="20">
							{/* Text Overlay */}
							<Box display="flex" flexDirection="column" gap="12">
								<Box
									display="flex"
									alignItems="center"
									justifyContent="space-between"
								>
									<Box flex="1">
										<Text fontSize="sm" fontWeight="600">
											Text Overlay
										</Text>
										<Text color="fg.secondary" fontSize="xs">
											Add text elements to the canvas
										</Text>
									</Box>
									<Switch
										checked={textOverlayEnabled}
										onCheckedChange={onTextOverlayChange}
										aria-label="Text Overlay"
									/>
								</Box>
							</Box>

							{/* Edit Mode Tools */}
							{canvasMode === "edit" && (
								<Box
									bg="bg.secondary"
									border="1"
									borderColor="border.tertiary"
									p="16"
									rounded="xl"
								>
									<Text fontSize="sm" fontWeight="600" mb="8">
										Transform Tools
									</Text>
									<Box display="flex" flexDirection="column" gap="8">
										<Text color="fg.secondary" fontSize="xs">
											• Upscale to higher resolution
										</Text>
										<Text color="fg.secondary" fontSize="xs">
											• Resize to different dimensions
										</Text>
										<Text color="fg.secondary" fontSize="xs">
											• Reframe with smart cropping
										</Text>
									</Box>
								</Box>
							)}

							<Box
								bg="bg.secondary"
								border="1"
								borderColor="border.tertiary"
								p="16"
								rounded="xl"
							>
								<Text fontSize="sm" fontWeight="600" mb="8">
									Quality Settings
								</Text>
								<Text color="fg.secondary" fontSize="xs">
									Generation uses{" "}
									{canvasMode === "generate" ? "standard" : "production"} quality.
									Higher quality uses more credits.
								</Text>
							</Box>
						</Box>
					</TabsContent>
				</Tabs>
			</Box>
		</Box>
	);
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
	const [canvasMode, setCanvasMode] = useState<CanvasMode>("generate");
	const [intent, setIntent] = useState(intentOptions[1]); // Default to "Photo"
	const [aspectRatio, setAspectRatio] = useState<(typeof aspectRatios)[number]>("4:5");
	const [channelPack, setChannelPack] = useState(channelPacks[0]);
	const [themePack, setThemePack] = useState(themePacks[0]);
	const [brandPack, setBrandPack] = useState(brandPacks[0]);
	const [selectedReferenceId, setSelectedReferenceId] = useState(referenceAssets[0].id);
	const [textOverlayEnabled, setTextOverlayEnabled] = useState(false);
	const [referenceStrength, setReferenceStrength] = useState(50);

	const outputVariants = useMemo(
		() => getOutputVariants(channelPack, "image", aspectRatio),
		[aspectRatio, channelPack]
	);
	const imageSrc = selectedDraft?.image || referenceAssets[0].image;
	const title = selectedDraft?.title || "Quick draft";

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				minHeight: 0,
				background: "var(--ax-colors-bg-page, #f8f9fb)",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "14px 24px",
					borderBottom: "1px solid var(--ax-colors-border-tertiary, #e5e7eb)",
					background: "var(--ax-colors-bg-default, #ffffff)",
					flexShrink: 0,
				}}
			>
				<div style={{display: "flex", alignItems: "center", gap: 8}}>
					<button
						type="button"
						onClick={() => setCanvasMode("generate")}
						style={{
							border: "1px solid var(--ax-colors-border-secondary, #cfd5e3)",
							background:
								canvasMode === "generate"
									? "var(--ax-colors-bg-secondary, #eef2ff)"
									: "var(--ax-colors-bg-default, #fff)",
							borderRadius: 999,
							padding: "8px 16px",
							fontSize: 14,
							fontWeight: 600,
							cursor: "pointer",
						}}
					>
						Generate
					</button>
					<button
						type="button"
						onClick={() => setCanvasMode("edit")}
						style={{
							border: "1px solid var(--ax-colors-border-secondary, #cfd5e3)",
							background:
								canvasMode === "edit"
									? "var(--ax-colors-bg-secondary, #eef2ff)"
									: "var(--ax-colors-bg-default, #fff)",
							borderRadius: 999,
							padding: "8px 16px",
							fontSize: 14,
							fontWeight: 600,
							cursor: "pointer",
						}}
					>
						Edit
					</button>
				</div>
				<div style={{display: "flex", alignItems: "center", gap: 12}}>
					<span style={{color: "var(--ax-colors-fg-secondary, #667085)", fontSize: 14}}>
						{saveState === "saved"
							? "Changes saved."
							: saveState === "saving"
								? "Saving..."
								: "Unsaved changes"}
					</span>
					<AxiomButton appearance="default" size="md">
						Preview
					</AxiomButton>
					<AxiomButton appearance="primary" size="md">
						Add to
					</AxiomButton>
					<button
						type="button"
						onClick={onCloseAdvanced}
						style={{
							border: "none",
							background: "transparent",
							fontSize: 22,
							lineHeight: 1,
							cursor: "pointer",
							color: "var(--ax-colors-fg-default, #1f2937)",
						}}
						aria-label="Close advanced editor"
					>
						×
					</button>
				</div>
			</div>

			<div style={{display: "flex", flex: 1, minHeight: 0}}>
				<div style={{flex: 1, minWidth: 0, overflow: "auto", padding: 24}}>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "minmax(0, 1fr) 320px",
							gap: 24,
							minHeight: "100%",
						}}
					>
						<div
							style={{
								background: "var(--ax-colors-bg-default, #fff)",
								border: "1px solid var(--ax-colors-border-tertiary, #e5e7eb)",
								borderRadius: 20,
								padding: 24,
								boxShadow: "0 8px 28px rgba(15, 23, 42, 0.06)",
								minHeight: "calc(100vh - 180px)",
								display: "flex",
								flexDirection: "column",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									marginBottom: 20,
								}}
							>
								<div>
									<div
										style={{
											fontSize: 13,
											color: "var(--ax-colors-fg-secondary, #667085)",
											marginBottom: 8,
										}}
									>
										Image generation
									</div>
									<h2
										style={{
											fontSize: 28,
											lineHeight: 1.2,
											margin: 0,
											fontWeight: 700,
										}}
									>
										{title}
									</h2>
									<p
										style={{
											fontSize: 14,
											color: "var(--ax-colors-fg-secondary, #667085)",
											margin: "8px 0 0",
										}}
									>
										{prompt}
									</p>
								</div>
								<div style={{display: "flex", gap: 8}}>
									<AxiomButton appearance="default" size="md">
										Regenerate
									</AxiomButton>
									<AxiomButton appearance="primary" size="md">
										Generate Pack
									</AxiomButton>
								</div>
							</div>

							<div
								style={{
									flex: 1,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									background: "linear-gradient(180deg, #f7fafc 0%, #eef3fb 100%)",
									border: "1px solid var(--ax-colors-border-tertiary, #e5e7eb)",
									borderRadius: 16,
									overflow: "hidden",
									padding: 24,
									minHeight: 520,
								}}
							>
								<img
									src={imageSrc}
									alt={title}
									style={{
										display: "block",
										width: "100%",
										height: "auto",
										maxHeight: "100%",
										objectFit: "contain",
										borderRadius: 14,
										boxShadow: "0 12px 40px rgba(15, 23, 42, 0.12)",
									}}
								/>
							</div>
						</div>

						<div style={{display: "flex", flexDirection: "column", gap: 16}}>
							<div
								style={{
									background: "var(--ax-colors-bg-default, #fff)",
									border: "1px solid var(--ax-colors-border-tertiary, #e5e7eb)",
									borderRadius: 16,
									padding: 20,
								}}
							>
								<div style={{fontSize: 16, fontWeight: 700, marginBottom: 16}}>
									Output
								</div>
								<div style={{display: "grid", gap: 14}}>
									<div>
										<div
											style={{
												fontSize: 12,
												fontWeight: 700,
												color: "var(--ax-colors-fg-secondary, #667085)",
												textTransform: "uppercase",
												marginBottom: 8,
											}}
										>
											Intent
										</div>
										<select
											value={intent}
											onChange={(event) => setIntent(event.target.value)}
											style={{
												width: "100%",
												height: 40,
												borderRadius: 10,
												border: "1px solid var(--ax-colors-border-secondary, #cfd5e3)",
												padding: "0 12px",
												fontSize: 14,
											}}
										>
											{intentOptions.map((option) => (
												<option key={option}>{option}</option>
											))}
										</select>
									</div>
									<div>
										<div
											style={{
												fontSize: 12,
												fontWeight: 700,
												color: "var(--ax-colors-fg-secondary, #667085)",
												textTransform: "uppercase",
												marginBottom: 8,
											}}
										>
											Aspect ratio
										</div>
										<div style={{display: "flex", flexWrap: "wrap", gap: 8}}>
											{aspectRatios.map((ratio) => (
												<button
													key={ratio}
													type="button"
													onClick={() => setAspectRatio(ratio)}
													style={{
														border: "1px solid var(--ax-colors-border-secondary, #cfd5e3)",
														background:
															ratio === aspectRatio
																? "var(--ax-colors-bg-secondary, #eef2ff)"
																: "var(--ax-colors-bg-default, #fff)",
														borderRadius: 999,
														padding: "6px 12px",
														fontSize: 13,
														cursor: "pointer",
													}}
												>
													{ratio}
												</button>
											))}
										</div>
									</div>
									<div>
										<div
											style={{
												fontSize: 12,
												fontWeight: 700,
												color: "var(--ax-colors-fg-secondary, #667085)",
												textTransform: "uppercase",
												marginBottom: 8,
											}}
										>
											Channel pack
										</div>
										<select
											value={channelPack}
											onChange={(event) => setChannelPack(event.target.value)}
											style={{
												width: "100%",
												height: 40,
												borderRadius: 10,
												border: "1px solid var(--ax-colors-border-secondary, #cfd5e3)",
												padding: "0 12px",
												fontSize: 14,
											}}
										>
											{channelPacks.map((option) => (
												<option key={option}>{option}</option>
											))}
										</select>
									</div>
								</div>
							</div>

							<div
								style={{
									background: "var(--ax-colors-bg-default, #fff)",
									border: "1px solid var(--ax-colors-border-tertiary, #e5e7eb)",
									borderRadius: 16,
									padding: 20,
								}}
							>
								<div style={{fontSize: 16, fontWeight: 700, marginBottom: 16}}>
									Brand
								</div>
								<div style={{display: "grid", gap: 14}}>
									<div>
										<div
											style={{
												fontSize: 12,
												fontWeight: 700,
												color: "var(--ax-colors-fg-secondary, #667085)",
												textTransform: "uppercase",
												marginBottom: 8,
											}}
										>
											Theme pack
										</div>
										<select
											value={themePack}
											onChange={(event) => setThemePack(event.target.value)}
											style={{
												width: "100%",
												height: 40,
												borderRadius: 10,
												border: "1px solid var(--ax-colors-border-secondary, #cfd5e3)",
												padding: "0 12px",
												fontSize: 14,
											}}
										>
											{themePacks.map((option) => (
												<option key={option}>{option}</option>
											))}
										</select>
									</div>
									<div>
										<div
											style={{
												fontSize: 12,
												fontWeight: 700,
												color: "var(--ax-colors-fg-secondary, #667085)",
												textTransform: "uppercase",
												marginBottom: 8,
											}}
										>
											Brand pack
										</div>
										<select
											value={brandPack}
											onChange={(event) => setBrandPack(event.target.value)}
											style={{
												width: "100%",
												height: 40,
												borderRadius: 10,
												border: "1px solid var(--ax-colors-border-secondary, #cfd5e3)",
												padding: "0 12px",
												fontSize: 14,
											}}
										>
											{brandPacks.map((option) => (
												<option key={option}>{option}</option>
											))}
										</select>
									</div>
								</div>
							</div>

							<div
								style={{
									background: "var(--ax-colors-bg-default, #fff)",
									border: "1px solid var(--ax-colors-border-tertiary, #e5e7eb)",
									borderRadius: 16,
									padding: 20,
								}}
							>
								<div style={{fontSize: 16, fontWeight: 700, marginBottom: 16}}>
									Advanced
								</div>
								<div style={{display: "grid", gap: 12}}>
									<div
										style={{
											fontSize: 13,
											color: "var(--ax-colors-fg-secondary, #667085)",
										}}
									>
										Selected reference:{" "}
										{referenceAssets.find(
											(asset) => asset.id === selectedReferenceId
										)?.title ?? referenceAssets[0].title}
									</div>
									<div
										style={{
											fontSize: 13,
											color: "var(--ax-colors-fg-secondary, #667085)",
										}}
									>
										Text overlay: {textOverlayEnabled ? "Enabled" : "Disabled"}
									</div>
									<div
										style={{
											fontSize: 13,
											color: "var(--ax-colors-fg-secondary, #667085)",
										}}
									>
										Reference strength: {referenceStrength}%
									</div>
									<div
										style={{
											fontSize: 13,
											color: "var(--ax-colors-fg-secondary, #667085)",
										}}
									>
										Output variants:{" "}
										{outputVariants.map((variant) => variant.label).join(", ")}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
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
				style={{maxWidth: 430, minHeight: 760, width: "100%"}}
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
							bg="bg.information.subtle"
							color="fg.information.strong"
							display="flex"
							justifyContent="center"
							rounded="full"
							style={{height: 28, width: 28}}
						>
							<IconSparkles size={16} />
						</Box>
						<Text fontSize="lg" fontWeight="600">
							Opal
						</Text>
					</Box>
					<Box alignItems="center" display="flex" gap="8">
						<Text color="fg.secondary" fontSize="xs">
							{saveState === "saved"
								? "Changes saved."
								: saveState === "saving"
									? "Saving..."
									: "Unsaved changes"}
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
							bg="bg.information.subtle"
							color="fg.information.strong"
							display="flex"
							justifyContent="center"
							rounded="full"
							style={{flexShrink: 0, height: 28, width: 28}}
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
									<Box display="grid" gap="8" style={{maxWidth: 320}}>
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
									<Box
										style={{
											aspectRatio: "4 / 5",
											borderRadius: 12,
											overflow: "hidden",
										}}
									>
										<img
											alt={selectedDraft.title}
											src={selectedDraft.image}
											style={{
												display: "block",
												height: "100%",
												objectFit: "cover",
												width: "100%",
											}}
										/>
									</Box>
									<Box
										alignItems="center"
										display="flex"
										justifyContent="space-between"
									>
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
											<AxiomButton
												appearance="default"
												size="md"
												onClick={onOpenAdvanced}
											>
												Use advanced editor
											</AxiomButton>
										</>
									) : (
										<Text color="fg.secondary" fontSize="xs">
											Keep iterating here. Advanced canvas is available for
											image creation.
										</Text>
									)}
								</Box>
							) : null}
						</Box>
					</Box>

					<Box display="grid" gap="10" style={{marginTop: "auto"}}>
						<Textarea
							value={prompt}
							onChange={(event) => onPromptChange(event.target.value)}
							placeholder={`Ask Opal to create a ${assetMode}`}
							style={{minHeight: 96}}
						/>
						<Box alignItems="center" display="flex" justifyContent="space-between">
							<Box alignItems="center" display="flex" gap="8">
								<Badge intent="neutral">
									{assetMode === "image" ? "Image" : "Video"}
								</Badge>
								<Badge intent="neutral">Quick draft</Badge>
							</Box>
							<AxiomButton
								appearance="primary"
								size="lg"
								icon={<IconSparkles size={16} />}
								onClick={onGenerate}
							>
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
			style={{overflow: "hidden"}}
		>
			<Box display="grid" style={{gridTemplateColumns: "minmax(0, 1fr) 420px"}}>
				<Box bg="bg.default" display="flex" flexDirection="column" style={{minWidth: 0}}>
					<Box
						alignItems="center"
						borderB="1"
						borderColor="border.tertiary"
						display="flex"
						justifyContent="space-between"
						px="24"
						py="12"
						style={{minHeight: 56}}
					>
						<Box alignItems="center" display="flex" gap="8">
							<Badge intent="neutral">{generated ? "Canvas ready" : "Canvas"}</Badge>
							<Badge intent="neutral">{channelPack}</Badge>
							<Badge intent="neutral">{aspectRatio}</Badge>
						</Box>
						<Box alignItems="center" display="flex" gap="8">
							<Text color="fg.secondary" fontSize="xs">
								{saveState === "saved"
									? "Changes saved."
									: saveState === "saving"
										? "Saving..."
										: "Unsaved changes"}
							</Text>
							<AxiomButton appearance="default" size="sm">
								Download
							</AxiomButton>
							<AxiomButton
								appearance="primary"
								size="sm"
								icon={<IconChevronDown size={14} />}
							>
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
							style={{minHeight: 640, overflow: "hidden"}}
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
										style={{
											display: "block",
											height: "100%",
											objectFit: "cover",
											width: "100%",
										}}
									/>
								) : (
									<Box
										alignItems="center"
										bg="bg.default"
										display="flex"
										flexDirection="column"
										gap="16"
										justifyContent="center"
										style={{height: "100%"}}
									>
										<Box
											alignItems="center"
											bg="bg.secondary"
											display="flex"
											justifyContent="center"
											rounded="full"
											style={{height: 64, width: 64}}
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
							<Box
								bg="bg.default"
								border="1"
								borderColor="border.tertiary"
								p="16"
								rounded="xl"
							>
								<Box
									alignItems="center"
									display="flex"
									justifyContent="space-between"
									mb="12"
								>
									<Text fontSize="sm" fontWeight="700">
										Output pack
									</Text>
									<Badge intent="success">Ready for DAM</Badge>
								</Box>
								<Box
									display="grid"
									gap="12"
									style={{gridTemplateColumns: "repeat(2, minmax(0, 1fr))"}}
								>
									{outputVariants.map((variant) => (
										<OutputVariantCard
											key={`${variant.label}-${variant.width}`}
											variant={variant}
										/>
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
					style={{minHeight: 900}}
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
								bg="bg.information.subtle"
								color="fg.information.strong"
								display="flex"
								justifyContent="center"
								rounded="full"
								style={{height: 28, width: 28}}
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
								bg="bg.information.subtle"
								color="fg.information.strong"
								display="flex"
								justifyContent="center"
								rounded="full"
								style={{flexShrink: 0, height: 28, width: 28}}
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
										<Box
											style={{
												aspectRatio: "4 / 5",
												borderRadius: 12,
												overflow: "hidden",
											}}
										>
											<img
												alt={selectedDraft.title}
												src={selectedDraft.image}
												style={{
													display: "block",
													height: "100%",
													objectFit: "cover",
													width: "100%",
												}}
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
									<SelectRow
										label="Intent"
										value={intent}
										options={createIntentOptions}
										onChange={onIntentChange}
									/>
									<SelectRow
										label="Channel pack"
										value={channelPack}
										options={channelPacks}
										onChange={onChannelPackChange}
									/>
									<Box display="flex" flexDirection="column" gap="8">
										<Text
											color="fg.secondary"
											fontSize="xs"
											fontWeight="600"
											style={{
												letterSpacing: "0.02em",
												textTransform: "uppercase",
											}}
										>
											Aspect ratio
										</Text>
										<RatioChips
											value={aspectRatio}
											onChange={onAspectRatioChange}
										/>
									</Box>
								</Box>
							</SettingsSection>
							<SettingsSection title="Brand and packs">
								<Box display="grid" gap="12">
									<SelectRow
										label="Theme pack"
										value={themePack}
										options={themePacks}
										onChange={onThemePackChange}
									/>
									<SelectRow
										label="Brand pack"
										value={brandPack}
										options={brandPacks}
										onChange={onBrandPackChange}
									/>
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
							<Textarea
								value={prompt}
								onChange={(event) => onPromptChange(event.target.value)}
								style={{minHeight: 100}}
							/>
							<Box alignItems="center" display="flex" justifyContent="space-between">
								<Box alignItems="center" display="flex" gap="8">
									<Badge intent="neutral">{brandPack}</Badge>
									{needsRefresh ? (
										<Badge intent="warning">Preview out of sync</Badge>
									) : null}
								</Box>
								<Box alignItems="center" display="flex" gap="10">
									<AxiomButton appearance="default" size="md">
										Enhance
									</AxiomButton>
									<AxiomButton
										appearance="primary"
										size="md"
										icon={
											generated ? (
												<IconCheck size={16} />
											) : (
												<IconSparkles size={16} />
											)
										}
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
		<Box display="grid" gap="20" style={{gridTemplateColumns: "minmax(0, 1fr) 320px"}}>
			<Box display="flex" flexDirection="column" gap="20" style={{minWidth: 0}}>
				<Box
					bg="bg.default"
					border="1"
					borderColor="border.tertiary"
					rounded="xl"
					shadow="md"
				>
					<Box
						borderB="1"
						borderColor="border.tertiary"
						display="flex"
						justifyContent="space-between"
						px="20"
						py="16"
					>
						<Box alignItems="center" display="flex" gap="8">
							<Badge intent="neutral">{intent}</Badge>
							<Badge intent="neutral">{aspectRatio}</Badge>
							<Badge intent="neutral">{channelPack}</Badge>
						</Box>
						<Box alignItems="center" display="flex" gap="10">
							<ModeChip active={referencesOpen} onClick={onToggleReferences}>
								References
							</ModeChip>
							<Badge intent="success">
								{draftMode ? "Draft mode" : "Production mode"}
							</Badge>
						</Box>
					</Box>

					<Box
						display="grid"
						gap="20"
						p="20"
						style={{
							gridTemplateColumns: referencesOpen
								? "260px minmax(0, 1fr)"
								: "minmax(0, 1fr)",
						}}
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
								style={{minHeight: 0}}
							>
								<Box
									alignItems="center"
									display="flex"
									justifyContent="space-between"
								>
									<Text fontSize="sm" fontWeight="700">
										Reference set
									</Text>
									<AxiomButton
										appearance="default"
										size="sm"
										icon={<IconUpload size={14} />}
									>
										Upload
									</AxiomButton>
								</Box>
								<SearchInput placeholder="Search images" size="md" />
								<Box display="grid" gap="12" style={{overflowY: "auto"}}>
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
								style={{minHeight: 20}}
							>
								<Text color="fg.secondary" fontSize="sm">
									{assetMode === "image"
										? "Image generation"
										: "Video generation"}
								</Text>
								<AxiomButton
									appearance="default"
									size="sm"
									icon={<IconAdjustmentsHorizontal size={14} />}
								>
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
												style={{
													display: "block",
													height: "100%",
													objectFit: "cover",
													width: "100%",
												}}
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
												style={{
													left: 16,
													position: "absolute",
													top: 16,
													width: 220,
												}}
											>
												<Text fontSize="sm" fontWeight="700">
													Selected draft
												</Text>
												<Text color="fg.secondary" fontSize="xs">
													{selectedDraft.title} scored{" "}
													{selectedDraft.score}% against brand and channel
													rules.
												</Text>
												<Box alignItems="center" display="flex" gap="8">
													<Badge intent="success">Brand safe</Badge>
													<Badge intent="neutral">
														{selectedDraft.ratio}
													</Badge>
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
											style={{maxWidth: 520, textAlign: "center"}}
										>
											<Box
												alignItems="center"
												bg="bg.default"
												border="1"
												borderColor="border.tertiary"
												display="flex"
												justifyContent="center"
												rounded="full"
												style={{height: 72, width: 72}}
											>
												<IconSparkles size={28} />
											</Box>
											<Text fontSize="xl" fontWeight="700">
												Start generating{" "}
												{assetMode === "image"
													? "images"
													: "video concepts"}
											</Text>
											<Text color="fg.secondary" fontSize="sm">
												Write a prompt, add a reference if useful, and
												generate two fast directions before producing the
												final output pack.
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
								<Box
									alignItems="center"
									display="flex"
									justifyContent="space-between"
								>
									<Text fontSize="sm" fontWeight="700">
										Prompt
									</Text>
									<Box alignItems="center" display="flex" gap="8">
										<ModeChip>
											<IconWand size={14} />
											Enhance
										</ModeChip>
										<ModeChip active={draftMode}>
											{draftMode ? "Draft" : "Production"}
										</ModeChip>
										<Badge
											intent={
												saveState === "saved"
													? "success"
													: saveState === "saving"
														? "warning"
														: "neutral"
											}
										>
											{saveState === "saved"
												? "Autosaved"
												: saveState === "saving"
													? "Saving..."
													: "Unsaved changes"}
										</Badge>
									</Box>
								</Box>
								<Textarea
									value={prompt}
									onChange={(event) => onPromptChange(event.target.value)}
									style={{minHeight: 100}}
								/>
								<Box
									alignItems="center"
									display="flex"
									justifyContent="space-between"
								>
									<Box
										alignItems="center"
										display="flex"
										gap="8"
										style={{flexWrap: "wrap"}}
									>
										<Badge intent="neutral">{brandPack}</Badge>
										<Badge intent="neutral">{themePack}</Badge>
										<Badge intent="neutral">Plan required</Badge>
										{needsRefresh ? (
											<Badge intent="warning">Preview out of sync</Badge>
										) : null}
										{produced ? (
											<Badge intent="success">Pack ready</Badge>
										) : null}
									</Box>
									<Box alignItems="center" display="flex" gap="10">
										<AxiomButton
											appearance="default"
											size="lg"
											onClick={onShowPlan}
										>
											Show plan
										</AxiomButton>
										<AxiomButton
											appearance="primary"
											size="lg"
											icon={
												generated ? (
													<IconCheck size={16} />
												) : (
													<IconSparkles size={16} />
												)
											}
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
					<Box
						bg="bg.default"
						border="1"
						borderColor="border.tertiary"
						p="20"
						rounded="xl"
						shadow="sm"
					>
						<Box
							alignItems="center"
							display="flex"
							justifyContent="space-between"
							mb="16"
						>
							<Text fontSize="lg" fontWeight="700">
								Draft directions
							</Text>
							<Badge intent="neutral">Choose one to continue</Badge>
						</Box>
						<Box
							display="grid"
							gap="12"
							style={{gridTemplateColumns: "repeat(2, minmax(0, 1fr))"}}
						>
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
					<Box
						bg="bg.default"
						border="1"
						borderColor="border.tertiary"
						p="20"
						rounded="xl"
						shadow="sm"
					>
						<Box
							alignItems="center"
							display="flex"
							justifyContent="space-between"
							mb="16"
						>
							<Text fontSize="lg" fontWeight="700">
								Output pack
							</Text>
							<Badge intent="success">Ready for DAM</Badge>
						</Box>
						<Box
							display="grid"
							gap="12"
							style={{gridTemplateColumns: "repeat(2, minmax(0, 1fr))"}}
						>
							{outputVariants.map((variant) => (
								<OutputVariantCard
									key={`${variant.label}-${variant.width}`}
									variant={variant}
								/>
							))}
						</Box>
					</Box>
				) : null}
			</Box>

			<Box display="flex" flexDirection="column" gap="12">
				<SettingsSection title="General settings">
					<Box display="grid" gap="12">
						<SelectRow
							label="Intent"
							value={intent}
							options={createIntentOptions}
							onChange={onIntentChange}
						/>
						<SelectRow
							label="Channel pack"
							value={channelPack}
							options={channelPacks}
							onChange={onChannelPackChange}
						/>
						<Box display="flex" flexDirection="column" gap="8">
							<Text
								color="fg.secondary"
								fontSize="xs"
								fontWeight="600"
								style={{letterSpacing: "0.02em", textTransform: "uppercase"}}
							>
								Aspect ratio
							</Text>
							<RatioChips value={aspectRatio} onChange={onAspectRatioChange} />
						</Box>
					</Box>
				</SettingsSection>
				<SettingsSection title="Brand and packs">
					<Box display="grid" gap="12">
						<SelectRow
							label="Theme pack"
							value={themePack}
							options={themePacks}
							onChange={onThemePackChange}
						/>
						<SelectRow
							label="Brand pack"
							value={brandPack}
							options={brandPacks}
							onChange={onBrandPackChange}
						/>
						<Box
							bg="bg.secondary"
							border="1"
							borderColor="border.tertiary"
							p="12"
							rounded="xl"
						>
							<Text fontSize="sm" fontWeight="600">
								Hard negative rules
							</Text>
							<Text color="fg.secondary" fontSize="sm" style={{marginTop: 6}}>
								No competitor logos, no off-brand neon palettes, no generic
								stock-office imagery.
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
						<Box
							bg="bg.secondary"
							border="1"
							borderColor="border.tertiary"
							p="12"
							rounded="xl"
						>
							<Text fontSize="sm" fontWeight="600">
								Plan approval
							</Text>
							<Text color="fg.secondary" fontSize="sm" style={{marginTop: 6}}>
								Opal enhances the prompt, applies brand and pack rules, then waits
								for approval before production.
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
		<Box display="grid" gap="20" style={{gridTemplateColumns: "minmax(0, 1fr) 320px"}}>
			<Box display="flex" flexDirection="column" gap="20" style={{minWidth: 0}}>
				<Box
					bg="bg.default"
					border="1"
					borderColor="border.tertiary"
					rounded="xl"
					shadow="md"
				>
					<Box
						borderB="1"
						borderColor="border.tertiary"
						display="flex"
						justifyContent="space-between"
						px="20"
						py="16"
					>
						<Box alignItems="center" display="flex" gap="8">
							<Badge intent="neutral">{editTool}</Badge>
							<Badge intent="neutral">{aspectRatio}</Badge>
							<Badge intent="neutral">{channelPack}</Badge>
						</Box>
						<Box alignItems="center" display="flex" gap="8">
							<Badge intent="neutral">
								{assetMode === "image" ? "Editing image" : "Editing video"}
							</Badge>
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
								<AxiomButton
									appearance="default"
									size="sm"
									icon={<IconAdjustmentsHorizontal size={14} />}
								>
									Transform settings
								</AxiomButton>
							</Box>

							<Box
								alignItems="center"
								display="grid"
								flex="1"
								gap="20"
								style={{
									gridTemplateColumns: generated
										? "minmax(0, 1fr) 220px"
										: "minmax(0, 1fr)",
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
											aspectRatio: getCanvasAspectRatio(
												assetMode,
												aspectRatio
											),
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
											style={{
												display: "block",
												height: "100%",
												objectFit: "cover",
												width: "100%",
											}}
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
										style={{
											left: 16,
											position: "absolute",
											top: 16,
											width: 220,
										}}
									>
										<Text fontSize="sm" fontWeight="700">
											Source asset
										</Text>
										<Text color="fg.secondary" fontSize="xs">
											Editing starts from the selected DAM asset and keeps
											brand-safe composition in view.
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
								<Box
									alignItems="center"
									display="flex"
									justifyContent="space-between"
								>
									<Text fontSize="sm" fontWeight="700">
										Describe the change
									</Text>
									<Box alignItems="center" display="flex" gap="8">
										<ModeChip>
											<IconWand size={14} />
											Enhance
										</ModeChip>
										<Badge
											intent={
												saveState === "saved"
													? "success"
													: saveState === "saving"
														? "warning"
														: "neutral"
											}
										>
											{saveState === "saved"
												? "Autosaved"
												: saveState === "saving"
													? "Saving..."
													: "Unsaved changes"}
										</Badge>
									</Box>
								</Box>
								<Textarea
									value={prompt}
									onChange={(event) => onPromptChange(event.target.value)}
									style={{minHeight: 96}}
								/>
								<Box
									alignItems="center"
									display="flex"
									justifyContent="space-between"
								>
									<Box
										alignItems="center"
										display="flex"
										gap="8"
										style={{flexWrap: "wrap"}}
									>
										<Badge intent="neutral">{brandPack}</Badge>
										<Badge intent="neutral">{themePack}</Badge>
										<Badge intent="neutral">Preview before apply</Badge>
										{needsRefresh ? (
											<Badge intent="warning">Preview out of sync</Badge>
										) : null}
										{produced ? (
											<Badge intent="success">Changes ready</Badge>
										) : null}
									</Box>
									<Box alignItems="center" display="flex" gap="10">
										<AxiomButton
											appearance="default"
											size="lg"
											onClick={onShowPlan}
										>
											Show plan
										</AxiomButton>
										<AxiomButton
											appearance="primary"
											size="lg"
											icon={
												generated ? (
													<IconCheck size={16} />
												) : (
													<IconSparkles size={16} />
												)
											}
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
					<Box
						bg="bg.default"
						border="1"
						borderColor="border.tertiary"
						p="20"
						rounded="xl"
						shadow="sm"
					>
						<Box
							alignItems="center"
							display="flex"
							justifyContent="space-between"
							mb="16"
						>
							<Text fontSize="lg" fontWeight="700">
								Applied outputs
							</Text>
							<Badge intent="success">Ready to map back</Badge>
						</Box>
						<Box
							display="grid"
							gap="12"
							style={{gridTemplateColumns: "repeat(2, minmax(0, 1fr))"}}
						>
							{outputVariants.map((variant) => (
								<OutputVariantCard
									key={`${variant.label}-${variant.width}`}
									variant={variant}
								/>
							))}
						</Box>
					</Box>
				) : null}
			</Box>

			<Box display="flex" flexDirection="column" gap="12">
				<SettingsSection title="Transform settings">
					<Box display="grid" gap="12">
						<SelectRow
							label="Edit tool"
							value={editTool}
							options={editToolOptions}
							onChange={onEditToolChange}
						/>
						<Box display="flex" flexDirection="column" gap="8">
							<Text
								color="fg.secondary"
								fontSize="xs"
								fontWeight="600"
								style={{letterSpacing: "0.02em", textTransform: "uppercase"}}
							>
								Output ratio
							</Text>
							<RatioChips value={aspectRatio} onChange={onAspectRatioChange} />
						</Box>
						<Box
							bg="bg.secondary"
							border="1"
							borderColor="border.tertiary"
							p="12"
							rounded="xl"
						>
							<Text fontSize="sm" fontWeight="600">
								Preview math
							</Text>
							<Text color="fg.secondary" fontSize="sm" style={{marginTop: 6}}>
								Changing the ratio immediately updates the canvas crop frame.
								Generation is still explicit.
							</Text>
						</Box>
					</Box>
				</SettingsSection>
				<SettingsSection title="Output and destinations">
					<Box display="grid" gap="12">
						<SelectRow
							label="Channel pack"
							value={channelPack}
							options={channelPacks}
							onChange={onChannelPackChange}
						/>
						<SelectRow
							label="Theme pack"
							value={themePack}
							options={themePacks}
							onChange={onThemePackChange}
						/>
						<SelectRow
							label="Brand pack"
							value={brandPack}
							options={brandPacks}
							onChange={onBrandPackChange}
						/>
						<Box
							bg="bg.secondary"
							border="1"
							borderColor="border.tertiary"
							p="12"
							rounded="xl"
						>
							<Text fontSize="sm" fontWeight="600">
								After approval
							</Text>
							<Text color="fg.secondary" fontSize="sm" style={{marginTop: 6}}>
								Apply the approved variation, generate requested ratios, and map
								metadata back into DAM fields.
							</Text>
						</Box>
					</Box>
				</SettingsSection>
				<SettingsSection title="Brand checks" defaultOpen={false}>
					<Box display="grid" gap="12">
						<Box
							bg="bg.secondary"
							border="1"
							borderColor="border.tertiary"
							p="12"
							rounded="xl"
						>
							<Text fontSize="sm" fontWeight="600">
								Compliance gate
							</Text>
							<Text color="fg.secondary" fontSize="sm" style={{marginTop: 6}}>
								Protect the hero athlete, keep clean copy zones, and block
								non-brand-safe edits.
							</Text>
						</Box>
					</Box>
				</SettingsSection>
			</Box>
		</Box>
	);
}

export default function OpalStudioPrototypePage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const routeFlow = searchParams.get("flow");
	const routeAsset = searchParams.get("asset");
	const routeStage = searchParams.get("stage");
	const routePrompt = searchParams.get("prompt");
	const routeDraft = searchParams.get("draft");
	const routeReturnTo = searchParams.get("returnTo") || "/cmp/library";
	const [resolvedRouteParams, setResolvedRouteParams] = useState<{
		flow: string | null;
		asset: string | null;
		stage: string | null;
		prompt: string | null;
		draft: string | null;
		returnTo: string;
	} | null>(null);
	const resolvedRouteFlow = resolvedRouteParams?.flow ?? null;
	const resolvedRouteAsset = resolvedRouteParams?.asset ?? null;
	const resolvedRouteStage = resolvedRouteParams?.stage ?? null;
	const resolvedRoutePrompt = resolvedRouteParams?.prompt ?? null;
	const resolvedRouteDraft = resolvedRouteParams?.draft ?? null;
	const resolvedRouteReturnTo = resolvedRouteParams?.returnTo || "/cmp/library";

	useEffect(() => {
		if (!resolvedRouteParams) {
			return;
		}

		if (resolvedRouteStage === "advanced" && resolvedRouteAsset === "image") {
			const params = new URLSearchParams(window.location.search);
			router.replace(`/cmp/opal-studio/canvas?${params.toString()}`);
		}
	}, [resolvedRouteAsset, resolvedRouteParams, resolvedRouteStage, router]);
	const {opalPanelControls, opalPanelWidth, setHidePageHeader} = useLayout();
	const opalContext = useOpalContext();
	const seededPanelKeyRef = useRef<string | null>(null);
	const [flowMode, setFlowMode] = useState<FlowMode>("create");
	const [assetMode, setAssetMode] = useState<AssetMode>("image");
	const [createStage, setCreateStage] = useState<CreateStage>("panel");
	const [createPrompt, setCreatePrompt] = useState(
		"Create a premium Stride campaign image for spring race season with clean headline space, high-end athletic photography, and brand-safe composition."
	);
	const [editPrompt, setEditPrompt] = useState(
		"Reframe this asset for paid social, preserve the athlete, and create two cleaner variants with stronger product focus."
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
	const chatDraftPayload = useMemo(
		() => extractLatestImageFromMessages(panelMessages),
		[panelMessages]
	);
	const chatDraft = chatDraftPayload?.draft ?? null;
	const [storedQuickDraft, setStoredQuickDraft] = useState<{
		prompt: string;
		image: string;
		returnTo?: string;
		messages?: Array<{role: "user" | "assistant"; content: string}>;
	} | null>(null);
	const [forceAdvancedImageEditor, setForceAdvancedImageEditor] = useState(false);

	useEffect(() => {
		setHidePageHeader(true);
		return () => setHidePageHeader(false);
	}, [setHidePageHeader]);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const params = new URLSearchParams(window.location.search);
		setForceAdvancedImageEditor(
			params.get("stage") === "advanced" && params.get("asset") === "image"
		);
	}, [searchParams]);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const urlParams = new URLSearchParams(window.location.search);
		setResolvedRouteParams({
			flow: urlParams.get("flow") || routeFlow,
			asset: urlParams.get("asset") || routeAsset,
			stage: urlParams.get("stage") || routeStage,
			prompt: urlParams.get("prompt") || routePrompt,
			draft: urlParams.get("draft") || routeDraft,
			returnTo: urlParams.get("returnTo") || routeReturnTo,
		});
	}, [routeAsset, routeDraft, routeFlow, routePrompt, routeReturnTo, routeStage, searchParams]);

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
				messages?: Array<{role: "user" | "assistant"; content: string}>;
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
		if (resolvedRouteFlow === "create" || resolvedRouteFlow === "edit") {
			setFlowMode(resolvedRouteFlow);
		}
		if (resolvedRouteAsset === "image" || resolvedRouteAsset === "video") {
			setAssetMode(resolvedRouteAsset);
		}
		if (resolvedRouteStage === "advanced" && resolvedRouteAsset === "image") {
			setFlowMode("create");
			setAssetMode("image");
			setCreateStage("advanced");
			setGenerated(true);
			setProduced(false);
			if (resolvedRoutePrompt) {
				setCreatePrompt(resolvedRoutePrompt);
			}
			if (resolvedRouteDraft) {
				setSelectedDraftId("chat-draft");
			}
		} else if (resolvedRouteFlow !== "edit") {
			setCreateStage("panel");
		}
	}, [
		resolvedRouteAsset,
		resolvedRouteDraft,
		resolvedRouteFlow,
		resolvedRoutePrompt,
		resolvedRouteStage,
	]);

	const isAdvancedImageRoute =
		forceAdvancedImageEditor ||
		(resolvedRouteStage === "advanced" && resolvedRouteAsset === "image");
	const drafts = useMemo(() => (assetMode === "image" ? imageDrafts : videoDrafts), [assetMode]);
	const effectiveDrafts = useMemo(() => {
		const sourceDraft =
			chatDraft ??
			(storedQuickDraft
				? {
						image: storedQuickDraft.image,
						title: "Quick draft",
						score: 96,
						ratio: "4:5",
					}
				: null);

		// If we're in advanced mode and have a source draft, prioritize it
		if (
			assetMode === "image" &&
			sourceDraft &&
			createStage === "advanced" &&
			flowMode === "create"
		) {
			const chatDraftObj = {
				...sourceDraft,
				id: "chat-draft",
				title: sourceDraft.title || "Quick draft",
			};
			console.log("[Opal Studio] Creating chat draft:", chatDraftObj);
			return [chatDraftObj, ...imageDrafts.filter((draft) => draft.id !== "chat-draft")];
		}

		// Default to standard drafts
		return drafts;
	}, [assetMode, chatDraft, createStage, drafts, flowMode, storedQuickDraft]);
	const handoffPrompt =
		resolvedRoutePrompt ||
		routePrompt ||
		chatDraftPayload?.prompt ||
		storedQuickDraft?.prompt ||
		createPrompt;
	const handoffDraftImage =
		resolvedRouteDraft || routeDraft || chatDraft?.image || storedQuickDraft?.image || "";
	const handoffDraft = useMemo<DraftResult | null>(() => {
		if (!handoffDraftImage) {
			return null;
		}

		return {
			id: "chat-draft",
			title: "Quick draft",
			image: handoffDraftImage,
			ratio: "4:5",
			score: 96,
		};
	}, [handoffDraftImage]);
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
		]
	);
	const configSignature = useMemo(() => JSON.stringify(draftConfig), [draftConfig]);
	const [lastGeneratedSignature, setLastGeneratedSignature] = useState<string | null>(null);
	const needsRefresh = generated && lastGeneratedSignature !== configSignature;
	const outputVariants = useMemo(
		() => getOutputVariants(channelPack, assetMode, aspectRatio),
		[assetMode, aspectRatio, channelPack]
	);

	useEffect(() => {
		try {
			const saved = window.localStorage.getItem("cmp-opal-studio-draft");
			if (!saved) {
				return;
			}

			const parsed = JSON.parse(saved) as Partial<typeof draftConfig>;
			if (
				!resolvedRouteFlow &&
				(parsed.flowMode === "create" || parsed.flowMode === "edit")
			) {
				setFlowMode(parsed.flowMode);
			}
			if (
				!resolvedRouteAsset &&
				(parsed.assetMode === "image" || parsed.assetMode === "video")
			) {
				setAssetMode(parsed.assetMode);
			}
			if (!resolvedRoutePrompt && typeof parsed.createPrompt === "string")
				setCreatePrompt(parsed.createPrompt);
			if (typeof parsed.editPrompt === "string") setEditPrompt(parsed.editPrompt);
			if (typeof parsed.intent === "string") setIntent(parsed.intent);
			if (typeof parsed.editTool === "string") setEditTool(parsed.editTool);
			if (typeof parsed.aspectRatio === "string")
				setAspectRatio(parsed.aspectRatio as (typeof aspectRatios)[number]);
			if (typeof parsed.channelPack === "string") setChannelPack(parsed.channelPack);
			if (typeof parsed.themePack === "string") setThemePack(parsed.themePack);
			if (typeof parsed.brandPack === "string") setBrandPack(parsed.brandPack);
			if (typeof parsed.showReferences === "boolean")
				setShowReferences(parsed.showReferences);
			if (typeof parsed.selectedReferenceId === "string")
				setSelectedReferenceId(parsed.selectedReferenceId);
			if (parsed.flowMode === "create" && resolvedRouteStage !== "advanced") {
				setCreateStage("panel");
			}
			if (resolvedRouteDraft) {
				setSelectedDraftId("chat-draft");
			}
		} catch {
			// Ignore invalid saved drafts in prototype mode.
		}
	}, [
		resolvedRouteAsset,
		resolvedRouteDraft,
		resolvedRouteFlow,
		resolvedRoutePrompt,
		resolvedRouteStage,
	]);

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
		if (flowMode === "create" && assetMode === "image" && resolvedRouteStage === "advanced") {
			setLastGeneratedSignature(configSignature);
		}
	}, [assetMode, configSignature, flowMode, resolvedRouteStage]);

	useEffect(() => {
		if (
			flowMode === "create" &&
			createStage === "advanced" &&
			assetMode === "image" &&
			handoffPrompt
		) {
			setCreatePrompt(handoffPrompt);
		}
	}, [assetMode, createStage, flowMode, handoffPrompt]);

	useEffect(() => {
		if (
			!isAdvancedImageRoute ||
			(resolvedRouteStage === "advanced" && resolvedRouteAsset === "image") ||
			!opalPanelControls ||
			(!storedQuickDraft?.messages?.length && (!handoffPrompt || !handoffDraftImage))
		) {
			return;
		}

		const alreadyHasDraftThread = panelMessages.some(
			(message) =>
				message.role === "assistant" &&
				(message.content.includes("I created a quick image draft for") ||
					(handoffDraftImage ? message.content.includes(handoffDraftImage) : false))
		);

		if (alreadyHasDraftThread) {
			opalPanelControls.openPanel();
			return;
		}

		opalPanelControls.clearHistory();
		if (storedQuickDraft?.messages?.length) {
			storedQuickDraft.messages.forEach((message) => {
				opalPanelControls.addMessage({
					role: message.role,
					content: message.content,
				});
			});
		} else if (handoffPrompt && handoffDraftImage) {
			opalPanelControls.addMessage({
				role: "user",
				content: handoffPrompt,
			});
			opalPanelControls.addMessage({
				role: "assistant",
				content: [
					`I created a quick image draft for: "${handoffPrompt}"`,
					"",
					"It follows Stride's athletic visual direction, preserves copy space, and stays inside brand-safe composition rules.",
					"",
					`![Triathlon draft](${handoffDraftImage})`,
					"",
					"[Use advanced editor](#)",
				].join("\n"),
			});
		}
		opalPanelControls.setInputValue("");
		opalPanelControls.openPanel();
	}, [
		handoffDraftImage,
		handoffPrompt,
		isAdvancedImageRoute,
		opalPanelControls,
		panelMessages,
		resolvedRouteAsset,
		resolvedRouteStage,
		storedQuickDraft,
	]);

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
				: "Create a launch teaser video for Stride spring race season"
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

	const canvasDraft = isAdvancedImageRoute
		? (handoffDraft ??
			effectiveDrafts.find((d) => d.id === selectedDraftId) ??
			effectiveDrafts[0] ??
			imageDrafts[0])
		: (effectiveDrafts.find((d) => d.id === selectedDraftId) ??
			effectiveDrafts[0] ??
			imageDrafts[0]);
	const canvasPrompt = handoffPrompt;

	if (!resolvedRouteParams && !forceAdvancedImageEditor) {
		return <CreatePanelOnlyState />;
	}

	if (resolvedRouteStage === "advanced" && resolvedRouteAsset === "image") {
		return null;
	}

	if (isAdvancedImageRoute) {
		return (
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					bottom: 0,
					right: opalPanelWidth > 0 ? opalPanelWidth : 0,
					background: "var(--ax-colors-bg-page, #f8f9fb)",
					minHeight: 0,
				}}
			>
				<AdvancedCanvasWorkspace
					prompt={canvasPrompt}
					selectedDraft={canvasDraft}
					saveState={saveState}
					onCloseAdvanced={() => router.push(resolvedRouteReturnTo)}
				/>
			</div>
		);
	}

	if (flowMode === "create") {
		return <CreatePanelOnlyState />;
	}

	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				bottom: 0,
				right: opalPanelWidth > 0 ? opalPanelWidth : 0,
				display: "flex",
				flexDirection: "column",
				background: "var(--ax-colors-bg-page, #f8f9fb)",
			}}
		>
			{/* Top Bar */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "12px 24px",
					borderBottom: "1px solid var(--ax-colors-border-tertiary, #e5e7eb)",
					background: "var(--ax-colors-bg-default, #fff)",
					minHeight: 56,
					flexShrink: 0,
				}}
			>
				<div style={{display: "flex", alignItems: "center", gap: 8}}>
					<div
						style={{
							display: "inline-flex",
							gap: 4,
							padding: 4,
							background: "var(--ax-colors-bg-secondary, #f3f4f6)",
							borderRadius: 999,
						}}
					>
						<button
							type="button"
							style={{
								background: "var(--ax-colors-bg-default, #fff)",
								border: 0,
								borderRadius: 999,
								cursor: "pointer",
								fontSize: 14,
								fontWeight: 600,
								height: 36,
								padding: "0 16px",
								color: "var(--ax-colors-fg-default, #111)",
							}}
						>
							Generate
						</button>
						<button
							type="button"
							style={{
								background: "transparent",
								border: 0,
								borderRadius: 999,
								cursor: "pointer",
								fontSize: 14,
								fontWeight: 500,
								height: 36,
								padding: "0 16px",
								color: "var(--ax-colors-fg-secondary, #6b7280)",
							}}
						>
							Edit
						</button>
					</div>
				</div>
				<div style={{display: "flex", alignItems: "center", gap: 8}}>
					<span style={{fontSize: 12, color: "var(--ax-colors-fg-secondary, #6b7280)"}}>
						{saveState === "saved" ? "Changes saved" : "Saving..."}
					</span>
					<AxiomButton
						appearance="default"
						size="sm"
						icon={<IconCopy size={16} />}
						aria-label="Copy"
					/>
					<AxiomButton
						appearance="primary"
						size="sm"
						icon={<IconChevronDown size={14} />}
					>
						Add to
					</AxiomButton>
				</div>
			</div>

			{/* Main Content Area */}
			<div style={{display: "flex", flex: 1, minHeight: 0, overflow: "hidden"}}>
				{/* Canvas */}
				<div
					style={{
						flex: 1,
						padding: 32,
						overflow: "auto",
						background: "var(--ax-colors-bg-page, #f8f9fb)",
					}}
				>
					{canvasDraft?.image ? (
						<>
							<div style={{marginBottom: 20}}>
								<h2 style={{fontSize: 24, fontWeight: 700, margin: "0 0 8px"}}>
									{canvasDraft.title}
								</h2>
								<p
									style={{
										fontSize: 14,
										color: "var(--ax-colors-fg-secondary, #6b7280)",
										margin: 0,
									}}
								>
									{canvasPrompt}
								</p>
							</div>
							<div
								style={{
									background: "var(--ax-colors-bg-default, #fff)",
									border: "1px solid var(--ax-colors-border-tertiary, #e5e7eb)",
									borderRadius: 16,
									padding: 24,
									textAlign: "center" as const,
								}}
							>
								<img
									src={canvasDraft.image}
									alt={canvasDraft.title}
									style={{
										maxWidth: "100%",
										maxHeight: "calc(100vh - 300px)",
										borderRadius: 12,
										objectFit: "contain" as const,
									}}
								/>
							</div>
							<div
								style={{
									display: "flex",
									justifyContent: "flex-end",
									gap: 8,
									marginTop: 16,
								}}
							>
								<AxiomButton
									appearance="default"
									size="sm"
									icon={<IconWand size={16} />}
								>
									Regenerate
								</AxiomButton>
								<AxiomButton
									appearance="primary"
									size="sm"
									icon={<IconCheck size={16} />}
								>
									Generate Pack
								</AxiomButton>
							</div>
						</>
					) : (
						<div
							style={{
								display: "flex",
								flexDirection: "column" as const,
								alignItems: "center",
								justifyContent: "center",
								height: "100%",
								textAlign: "center" as const,
								border: "2px dashed var(--ax-colors-border-tertiary, #e5e7eb)",
								borderRadius: 16,
							}}
						>
							<IconSparkles
								size={48}
								style={{
									color: "var(--ax-colors-fg-secondary, #7c3aed)",
									marginBottom: 16,
								}}
							/>
							<h2 style={{fontSize: 20, fontWeight: 700, margin: "0 0 8px"}}>
								Start Generating with Opal
							</h2>
							<p
								style={{
									fontSize: 14,
									color: "var(--ax-colors-fg-secondary, #6b7280)",
									maxWidth: 400,
								}}
							>
								Use the Opal chat to describe what you want to create, then open the
								advanced editor.
							</p>
						</div>
					)}
				</div>

				{/* Settings Sidebar */}
				<div
					style={{
						width: 340,
						flexShrink: 0,
						borderLeft: "1px solid var(--ax-colors-border-tertiary, #e5e7eb)",
						background: "var(--ax-colors-bg-default, #fff)",
						overflow: "auto",
						padding: 20,
					}}
				>
					<h3 style={{fontSize: 16, fontWeight: 700, margin: "0 0 20px"}}>Settings</h3>

					<div style={{marginBottom: 20}}>
						<label
							style={{
								fontSize: 11,
								fontWeight: 600,
								textTransform: "uppercase" as const,
								letterSpacing: "0.05em",
								color: "var(--ax-colors-fg-secondary, #6b7280)",
								display: "block",
								marginBottom: 8,
							}}
						>
							Intent
						</label>
						<select
							style={{
								width: "100%",
								height: 40,
								borderRadius: 10,
								border: "1px solid var(--ax-colors-border-secondary, #d1d5db)",
								padding: "0 12px",
								fontSize: 14,
							}}
						>
							{intentOptions.map((o) => (
								<option key={o}>{o}</option>
							))}
						</select>
						<p
							style={{
								fontSize: 12,
								color: "var(--ax-colors-fg-secondary, #6b7280)",
								marginTop: 6,
							}}
						>
							Determines AI skills and output style
						</p>
					</div>

					<div style={{marginBottom: 20}}>
						<label
							style={{
								fontSize: 11,
								fontWeight: 600,
								textTransform: "uppercase" as const,
								letterSpacing: "0.05em",
								color: "var(--ax-colors-fg-secondary, #6b7280)",
								display: "block",
								marginBottom: 8,
							}}
						>
							Aspect Ratio
						</label>
						<div
							style={{
								display: "flex",
								gap: 4,
								background: "var(--ax-colors-bg-secondary, #f3f4f6)",
								borderRadius: 999,
								padding: 4,
								width: "fit-content",
							}}
						>
							{aspectRatios.map((r) => (
								<button
									key={r}
									type="button"
									style={{
										background:
											r === aspectRatio
												? "var(--ax-colors-bg-default, #fff)"
												: "transparent",
										border: 0,
										borderRadius: 999,
										cursor: "pointer",
										fontSize: 13,
										fontWeight: r === aspectRatio ? 600 : 400,
										height: 32,
										padding: "0 12px",
									}}
									onClick={() => setAspectRatio(r)}
								>
									{r}
								</button>
							))}
						</div>
					</div>

					<div style={{marginBottom: 20}}>
						<label
							style={{
								fontSize: 11,
								fontWeight: 600,
								textTransform: "uppercase" as const,
								letterSpacing: "0.05em",
								color: "var(--ax-colors-fg-secondary, #6b7280)",
								display: "block",
								marginBottom: 8,
							}}
						>
							Channel Pack
						</label>
						<select
							style={{
								width: "100%",
								height: 40,
								borderRadius: 10,
								border: "1px solid var(--ax-colors-border-secondary, #d1d5db)",
								padding: "0 12px",
								fontSize: 14,
							}}
						>
							{channelPacks.map((o) => (
								<option key={o}>{o}</option>
							))}
						</select>
					</div>

					<div style={{marginBottom: 20}}>
						<label
							style={{
								fontSize: 11,
								fontWeight: 600,
								textTransform: "uppercase" as const,
								letterSpacing: "0.05em",
								color: "var(--ax-colors-fg-secondary, #6b7280)",
								display: "block",
								marginBottom: 8,
							}}
						>
							Theme Package
						</label>
						<select
							style={{
								width: "100%",
								height: 40,
								borderRadius: 10,
								border: "1px solid var(--ax-colors-border-secondary, #d1d5db)",
								padding: "0 12px",
								fontSize: 14,
							}}
						>
							{themePacks.map((o) => (
								<option key={o}>{o}</option>
							))}
						</select>
					</div>

					<div style={{marginBottom: 20}}>
						<label
							style={{
								fontSize: 11,
								fontWeight: 600,
								textTransform: "uppercase" as const,
								letterSpacing: "0.05em",
								color: "var(--ax-colors-fg-secondary, #6b7280)",
								display: "block",
								marginBottom: 8,
							}}
						>
							Brand Pack
						</label>
						<select
							style={{
								width: "100%",
								height: 40,
								borderRadius: 10,
								border: "1px solid var(--ax-colors-border-secondary, #d1d5db)",
								padding: "0 12px",
								fontSize: 14,
							}}
						>
							{brandPacks.map((o) => (
								<option key={o}>{o}</option>
							))}
						</select>
					</div>

					<div>
						<label
							style={{
								fontSize: 11,
								fontWeight: 600,
								textTransform: "uppercase" as const,
								letterSpacing: "0.05em",
								color: "var(--ax-colors-fg-secondary, #6b7280)",
								display: "block",
								marginBottom: 8,
							}}
						>
							Reference Images
						</label>
						<div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8}}>
							{referenceAssets.slice(0, 4).map((a) => (
								<div
									key={a.id}
									style={{
										borderRadius: 10,
										overflow: "hidden",
										border: "1px solid var(--ax-colors-border-tertiary, #e5e7eb)",
									}}
								>
									<img
										src={a.image}
										alt={a.title}
										style={{
											width: "100%",
											height: 72,
											objectFit: "cover" as const,
											display: "block",
										}}
									/>
									<div
										style={{padding: "6px 8px", fontSize: 11, fontWeight: 600}}
									>
										{a.title}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge, Box, Button, Field, Input, Text, Tooltip } from "@optiaxiom/react";
import { IconArrowLeft, IconArrowRight, IconArrowRightArrowLeft, IconCheckCircleSolid, IconChevronLeft, IconChevronRight, IconCircleInfo, IconComments, IconPen, IconXmark } from "@optiaxiom/icons";
import Image from "next/image";
import { DEFAULT_VAU_EXAMPLES, VAUS, type VAU, type VAUCandidate, type VAUExample } from "@/app/opal/data/vaus";
import { TOOL_ICONS } from "../tool-icons";
import { AMADrawer } from "./AMADrawer";

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 12,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase",
};

function SectionHeader({ title }: { title: string }) {
	return (
		<Box display="flex" alignItems="center" gap="12">
			<Text
				style={{
					fontFamily: "var(--ax-font-family-headings)",
					fontSize: 20,
					fontWeight: 600,
					lineHeight: "1.1",
					letterSpacing: "0.4px",
					whiteSpace: "nowrap",
					color: "#202320",
				}}
			>
				{title}
			</Text>
			<Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-secondary)" }} />
		</Box>
	);
}

function ToolCircle({ toolKey, index, total }: { toolKey: string; index: number; total: number }) {
	const tool = TOOL_ICONS[toolKey];
	if (!tool) return null;
	return (
		<Tooltip content={tool.name} delayDuration={200}>
			<Box
				style={{
					width: 22,
					height: 22,
					borderRadius: "50%",
					border: "1.5px solid var(--ax-colors-bg-default)",
					background: "#f3f7ee",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					marginLeft: index > 0 ? -6 : 0,
					position: "relative",
					zIndex: total - index,
					flexShrink: 0,
					color: tool.color,
					overflow: "hidden",
				}}
			>
				{tool.icon ?? (
					<span style={{ fontSize: 6, fontWeight: 700, fontFamily: "Roboto Mono, monospace", lineHeight: 1 }}>
						{(tool.textLabel ?? tool.name).slice(0, 2).toUpperCase()}
					</span>
				)}
			</Box>
		</Tooltip>
	);
}

function KpiCard({
	label,
	value,
	sub,
	subGreen,
	toolKeys,
}: {
	label: string;
	value: string;
	sub: string;
	subGreen?: boolean;
	toolKeys?: string[];
}) {
	const allTools = toolKeys ?? [];
	// Show tools with actual icons first, then text-label tools
	const sorted = [
		...allTools.filter((k) => TOOL_ICONS[k]?.icon),
		...allTools.filter((k) => !TOOL_ICONS[k]?.icon),
	];
	const visible = sorted.slice(0, 2);
	const overflow = allTools.length - visible.length;

	return (
		<Box
			bg="bg.default"
			style={{
				flex: 1,
				border: "1px solid var(--ax-colors-border-default)",
				borderRadius: 8,
				padding: 16,
				display: "flex",
				flexDirection: "column",
				gap: 8,
				height: 108,
				overflow: "hidden",
				minWidth: 0,
			}}
		>
			{/* Label row — always one line */}
			<Box display="flex" alignItems="center" gap="6" style={{ overflow: "hidden" }}>
				<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)", whiteSpace: "nowrap", flexShrink: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
					{label}
				</span>
				{visible.length > 0 && (
					<Box style={{ display: "flex", alignItems: "center", flexShrink: 0, marginLeft: "auto" }}>
						{visible.map((key, i) => (
							<ToolCircle key={key} toolKey={key} index={i} total={visible.length} />
						))}
						{overflow > 0 && (
							<Tooltip
								content={sorted.slice(2).map((k) => TOOL_ICONS[k]?.name ?? k).join(", ")}
								delayDuration={200}
							>
								<Box
									style={{
										width: 22,
										height: 22,
										borderRadius: "50%",
										border: "1.5px solid var(--ax-colors-bg-default)",
										background: "var(--ax-colors-bg-secondary)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										marginLeft: -6,
										position: "relative",
										zIndex: 0,
										flexShrink: 0,
									}}
								>
									<span style={{ fontSize: 6, fontFamily: "Roboto Mono, monospace", color: "var(--ax-colors-fg-tertiary)", fontWeight: 500 }}>
										+{overflow}
									</span>
								</Box>
							</Tooltip>
						)}
					</Box>
				)}
			</Box>
			{/* Value */}
			<Text
				style={{
					fontFamily: "var(--ax-font-family-headings)",
					fontSize: 28,
					fontWeight: 900,
					lineHeight: "1.04",
					letterSpacing: "0.56px",
					color: "#226b1e",
				}}
			>
				{value}
			</Text>
			{/* Subtitle */}
			<span
				style={{
					fontSize: 12,
					lineHeight: "1.33",
					color: subGreen ? "#226b1e" : "var(--ax-colors-fg-secondary)",
					whiteSpace: "nowrap",
				}}
			>
				{sub}
			</span>
		</Box>
	);
}

function ActionCard({ example, onClick }: { example: VAUExample; onClick?: () => void }) {
	const [hovered, setHovered] = useState(false);
	const description =
		example.description ??
		`I can help you stay on top of ${example.title.toLowerCase()} — making sure the right things get done by the right people at the right time. In addition to that I can do much more!`;
	return (
		<Box
			bg="bg.default"
			onClick={onClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{
				border: hovered ? "1px solid #A1AC8D" : "1px solid var(--ax-colors-border-default)",
				borderRadius: 12,
				padding: 24,
				display: "flex",
				flexDirection: "column",
				gap: 16,
				cursor: onClick ? "pointer" : "default",
				boxShadow: hovered
					? "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 2px 8px 0 rgb(0 0 0 / 0.06)"
					: "none",
				transition: "border-color 0.15s ease, box-shadow 0.15s ease",
			}}
		>
			<Box display="flex" gap="12" alignItems="start">
				<Box
					style={{
						width: 48,
						height: 48,
						minWidth: 48,
						background: "#0d3a29",
						borderRadius: 8,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: 22,
						flexShrink: 0,
					}}
				>
					{example.emoji}
				</Box>
				<Box display="flex" flexDirection="column" gap="8" style={{ flex: 1 }}>
					<Text
						style={{
							fontFamily: "var(--ax-font-family-headings)",
							fontSize: 20,
							fontWeight: 600,
							lineHeight: "1.1",
							letterSpacing: "0.4px",
							color: "#202320",
						}}
					>
						{example.title}
					</Text>
					<span style={{ ...CAPTION, color: "var(--ax-colors-fg-secondary)" }}>
						{example.frequency}
					</span>
				</Box>
			</Box>
			<Box style={{ background: "#f6faf3", borderRadius: 8, padding: 16 }}>
				<Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.43" }}>
					{description}
				</Text>
			</Box>
		</Box>
	);
}

function CandidateThumbnail({ candidate, onClick }: { candidate: VAUCandidate; onClick: () => void }) {
	const [hovered, setHovered] = useState(false);
	return (
		<Tooltip content={candidate.characterName ?? candidate.name} delayDuration={200}>
			<Box
				onClick={onClick}
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				style={{
					position: "relative",
					width: 92,
					height: 92,
					borderRadius: 12,
					border: "1px solid var(--ax-colors-border-default)",
					overflow: "hidden",
					cursor: "pointer",
					backgroundColor: candidate.avatarBg,
					flexShrink: 0,
				}}
			>
				<Image
					src={candidate.avatar}
					alt={candidate.name}
					width={92}
					height={92}
					unoptimized
					style={{ width: "100%", height: "100%", objectFit: "cover" }}
				/>
				<Box
					style={{
						position: "absolute",
						inset: 0,
						background: "rgba(57, 62, 50, 0.32)",
						opacity: hovered ? 0 : 1,
						transition: "opacity 0.15s ease",
					}}
				/>
			</Box>
		</Tooltip>
	);
}

const DAILY_BRIEFING_SKILLS = [
	"Calendar wrangling",
	"Meeting prep",
	"Inbox Triage",
	"Cross-team updates",
	"Weekly Reporting",
];

const PANEL_CONNECTORS = ["notion", "google", "teams"] as const;

function PanelConnector({ toolKey }: { toolKey: string }) {
	const tool = TOOL_ICONS[toolKey];
	if (!tool) return null;
	return (
		<Box display="flex" alignItems="center" gap="4">
			<Box
				style={{
					width: 24,
					height: 24,
					borderRadius: 12,
					border: "1px solid var(--ax-colors-border-secondary)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: tool.color,
					flexShrink: 0,
				}}
			>
				{tool.icon}
			</Box>
			<Text fontSize="sm" color="fg.default">{tool.name}</Text>
		</Box>
	);
}

function PanelSectionHeader({ label, count }: { label: string; count: number }) {
	return (
		<Box display="flex" alignItems="center" gap="8">
			<span style={{ ...CAPTION, color: "var(--ax-colors-fg-default)" }}>{label}</span>
			<Badge intent="primary" variant="strong">{count}</Badge>
		</Box>
	);
}

function PanelDivider() {
	return (
		<Box
			style={{
				height: 1,
				width: "100%",
				background: "var(--ax-colors-border-secondary)",
				flexShrink: 0,
			}}
		/>
	);
}

const BRIEFING_CARDS = [
	{ emoji: "📅", title: "Tuesday standup", body: "3 open items from last week — I've flagged them for you." },
	{ emoji: "✉️", title: "Sarah needs sign-off", body: "On the Q3 brief. Marked urgent, reply drafted and waiting." },
	{ emoji: "⚡", title: "2 assets overdue", body: "I nudged the team. Both confirmed EOD." },
];

function BriefingActionCards({ animKey }: { animKey: number }) {
	return (
		<Box
			style={{
				width: "100%",
				height: "100%",
				backgroundImage: "url('/avatars/nature4.png')",
			backgroundSize: "cover",
			backgroundPosition: "center",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 12,
				padding: "28px 28px",
			}}
		>
			{BRIEFING_CARDS.map((card, i) => (
				<Box
					key={`${animKey}-${i}`}
					style={{
						width: "100%",
						background: "rgba(0,0,0,0.55)",
						border: "1px solid rgba(255,255,255,0.18)",
						borderRadius: 12,
						padding: "14px 16px",
						display: "flex",
						gap: 12,
						alignItems: "flex-start",
						opacity: 0,
						animation: `brief-card-in 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 320 + 150}ms forwards`,
					}}
				>
					<span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{card.emoji}</span>
					<Box>
						<Box style={{ fontSize: 13, fontWeight: 600, color: "#e8f5e8", lineHeight: 1.3, marginBottom: 4 }}>
							{card.title}
						</Box>
						<Box style={{ fontSize: 12, color: "rgba(232,245,232,0.6)", lineHeight: 1.5 }}>
							{card.body}
						</Box>
					</Box>
				</Box>
			))}
			<style>{`
				@keyframes brief-card-in {
					from { opacity: 0; transform: translateY(10px) scale(0.96); }
					to   { opacity: 1; transform: translateY(0)   scale(1); }
				}
			`}</style>
		</Box>
	);
}

const BRIEFING_SLIDES: { component?: boolean; src?: string; alt?: string }[] = [
	{ component: true },
];

function DailyBriefingPanel({ onClose }: { onClose: () => void }) {
	const [slide, setSlide] = useState(0);
	return (
		<>
			{/* Backdrop */}
			<Box
				onClick={onClose}
				style={{
					position: "fixed",
					inset: 0,
					background: "rgba(57,62,50,0.32)",
					zIndex: 40,
				}}
			/>
			{/* Panel */}
			<Box
				style={{
					position: "fixed",
					top: 0,
					right: 0,
					height: "100vh",
					width: 513,
					background: "white",
					borderLeft: "1px solid var(--ax-colors-border-default)",
					zIndex: 50,
					overflowY: "auto",
					display: "flex",
					flexDirection: "column",
					gap: 12,
					padding: "24px 24px 37px",
				}}
			>
				{/* Header: PREVIEW badge + close */}
				<Box display="flex" alignItems="center" justifyContent="space-between">
					<Badge intent="primary">PREVIEW</Badge>
					<Button
						appearance="subtle"
						size="sm"
						icon={<IconXmark size={16} />}
						aria-label="Close panel"
						onClick={onClose}
					/>
				</Box>

				{/* Title */}
				<Text
					style={{
						fontFamily: "var(--ax-font-family-headings)",
						fontSize: 28,
						fontWeight: 800,
						lineHeight: "1.04",
						letterSpacing: "0.56px",
						color: "#202320",
					}}
				>
					Daily briefing
				</Text>

				{/* Description */}
				<Text
					fontSize="md"
					color="fg.secondary"
					style={{ lineHeight: "1.5", letterSpacing: "0.32px" }}
				>
					No more opening six tabs to figure out what happened overnight. Randy reads your inbox,
					calendar, and Slack while you slept — and tells you the three things that actually need
					you today.
				</Text>

				{/* Slideshow */}
				<Box
					style={{
						position: "relative",
						height: 407,
						borderRadius: 8,
						border: "1px solid var(--ax-colors-border-default)",
						overflow: "hidden",
						flexShrink: 0,
					}}
				>
					{BRIEFING_SLIDES[slide].component
						? <BriefingActionCards animKey={slide} />
						: <img
							key={slide}
							src={BRIEFING_SLIDES[slide].src}
							alt={BRIEFING_SLIDES[slide].alt}
							style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
						/>
					}
					{/* Back arrow — only on slide > 0 */}
					{slide > 0 && (
						<Box
							onClick={() => setSlide(slide - 1)}
							style={{
								position: "absolute",
								top: "50%",
								left: 8,
								transform: "translateY(-50%)",
								background: "rgba(57,62,50,0.32)",
								borderRadius: 21,
								width: 42,
								height: 42,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								cursor: "pointer",
							}}
						>
							<IconChevronLeft size={18} style={{ color: "white" }} />
						</Box>
					)}
					{/* Pagination dots */}
					<Box
						style={{
							position: "absolute",
							bottom: 12,
							left: "50%",
							transform: "translateX(-50%)",
							display: "flex",
							gap: 6,
						}}
					>
						{[0, 1, 2].map((i) => (
							<Box
								key={i}
								style={{
									width: i === 0 ? 20 : 6,
									height: 6,
									borderRadius: 3,
									background: i === 0 ? "white" : "rgba(255,255,255,0.35)",
									transition: "width 0.2s ease",
								}}
							/>
						))}
					</Box>
				</Box>

				<PanelDivider />

				{/* Connectors */}
				<Box display="flex" flexDirection="column" gap="8">
					<PanelSectionHeader label="CONNECTORS" count={3} />
					<Box display="flex" flexDirection="column" gap="8">
						{PANEL_CONNECTORS.map((key) => (
							<PanelConnector key={key} toolKey={key} />
						))}
					</Box>
				</Box>

				<PanelDivider />

				{/* Skills */}
				<Box display="flex" flexDirection="column" gap="8">
					<PanelSectionHeader label="SKILLS" count={9} />
					<Box display="flex" style={{ flexWrap: "wrap", gap: 6 }}>
						{DAILY_BRIEFING_SKILLS.map((skill) => (
							<span
								key={skill}
								style={{
									display: "inline-flex",
									alignItems: "center",
									height: 24,
									padding: "0 10px",
									borderRadius: 32,
									background: "#D8E4CB",
									border: "1px solid #D8E4CB",
									fontFamily: "Roboto Mono, monospace",
									fontSize: 11,
									fontWeight: 500,
									letterSpacing: "0.36px",
									textTransform: "uppercase",
									color: "var(--ax-colors-fg-default)",
								}}
							>
								{skill}
							</span>
						))}
						<span
							style={{
								display: "inline-flex",
								alignItems: "center",
								height: 24,
								padding: "0 10px",
								borderRadius: 32,
								background: "#D8E4CB",
								border: "1px solid #D8E4CB",
								fontFamily: "Roboto Mono, monospace",
								fontSize: 11,
								fontWeight: 500,
								letterSpacing: "0.36px",
								textTransform: "uppercase",
								color: "var(--ax-colors-fg-default)",
							}}
						>
							+4
						</span>
					</Box>
				</Box>

				<PanelDivider />

				{/* Files */}
				<Box display="flex" flexDirection="column" gap="8">
					<PanelSectionHeader label="FILES" count={1} />
					<Text fontSize="sm" color="fg.default">Brand_Guidelines.doc</Text>
				</Box>
			</Box>
		</>
	);
}

const PICKER_AVATARS = [
	{ src: "/avatars/vau-frank.png", bg: "#FAF6E8" },
	{ src: "/avatars/bub.png",       bg: "#E0F0F8" },
	{ src: "/avatars/bike.png",      bg: "#F5EDE0" },
	{ src: "/avatars/tat.png",       bg: "#F0EBF8" },
	{ src: "/avatars/chicken.png",   bg: "#FFF8E8" },
	{ src: "/avatars/vau-henry.png", bg: "#F5F0E8" },
	{ src: "/avatars/vau-tony.png",  bg: "#E4F3EC" },
	{ src: "/avatars/vau-kerby.png", bg: "#F5EBF8" },
	{ src: "/avatars/vau-mayling.png", bg: "#F0F5E8" },
	{ src: "/avatars/vau-poppy.png", bg: "#F0E8F8" },
];

function AvatarPickerCard({
	avatar,
	isSelected,
	onClick,
}: {
	avatar: { src: string; bg: string };
	isSelected: boolean;
	onClick: () => void;
}) {
	const [hovered, setHovered] = useState(false);
	return (
		<Box
			onClick={onClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{
				position: "relative",
				borderRadius: 12,
				overflow: "hidden",
				cursor: "pointer",
				border: isSelected ? "2.5px solid #14B8A6" : "2.5px solid transparent",
				backgroundColor: avatar.bg,
				aspectRatio: "1 / 1",
				transition: "border-color 0.15s ease",
			}}
		>
			<Image
				src={avatar.src}
				alt=""
				fill
				unoptimized
				style={{ objectFit: "cover" }}
			/>
			{!isSelected && (
				<Box
					style={{
						position: "absolute",
						inset: 0,
						background: hovered ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.32)",
						transition: "background 0.15s ease",
					}}
				/>
			)}
		</Box>
	);
}

export default function VAUDetailPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();

	const [activeCapability, setActiveCapability] = useState<string | null>(null);
	const [amaOpen, setAmaOpen] = useState(false);
	const [showOnboarding, setShowOnboarding] = useState(false);
	const [showKeyHandoff, setShowKeyHandoff] = useState(false);
	const [showToolConnect, setShowToolConnect] = useState(false);
	const [vauName, setVauName] = useState("");
	const [connectedTools, setConnectedTools] = useState<Set<string>>(new Set());
	const [showAvatarPicker, setShowAvatarPicker] = useState(false);
	const [pickerSelected, setPickerSelected] = useState<{ src: string; bg: string } | null>(null);
	const [customAvatar, setCustomAvatar] = useState<{ src: string; bg: string } | null>(null);

	const vau = useMemo(() => VAUS.find((v) => v.id === params?.id), [params?.id]);
	const candidates = useMemo<VAUCandidate[]>(() => {
		if (!vau) return [];
		if (vau.candidates && vau.candidates.length > 0) return vau.candidates;
		return VAUS.filter((v) => v.id !== vau.id).slice(0, 3).map((v) => ({
			avatar: v.avatar,
			avatarBg: v.avatarBg,
			name: v.name,
			characterName: v.characterName,
		}));
	}, [vau]);

	if (!vau) {
		return (
			<Box style={{ padding: "24px 40px" }} display="flex" flexDirection="column" gap="16">
				<Button
					appearance="subtle"
					size="md"
					onClick={() => router.push("/opal/virtual-teammates")}
				>
					← Back to Virtual Teammates
				</Button>
				<Text color="fg.tertiary">No teammate found.</Text>
			</Box>
		);
	}

	// ─── Tool connect (Stage 3) ───────────────────────────────────────────────────
	if (showToolConnect) {
		const displayName = vauName.trim() || vau.characterName || vau.name;
		const thirdPartyKeys = vau.tools.filter((k) => !k.startsWith("opti-")).slice(0, 3);
		const allConnected = thirdPartyKeys.every((k) => connectedTools.has(k));

		const TOOL_DESC: Record<string, string> = {
			google:  "For calendar, docs, and email",
			notion:  "For pulling context from your docs and wikis",
			slack:   "For surfacing messages and notifications",
			asana:   "For tracking tasks and workstreams",
			figma:   "For design files and visual references",
			jira:    "For tracking active tickets",
			teams:   "For surfacing messages and meetings",
			github:  "For code and pull request tracking",
			airtable: "For managing structured data and bases",
		};

		return (
			<Box
				style={{
					position: "fixed",
					inset: 0,
					zIndex: 100,
					background: "#F9FCF8",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "40px 24px",
				}}
			>
				<Box display="flex" flexDirection="column" alignItems="center" style={{ width: 610, gap: 32 }}>
					{/* Headline */}
					<Box display="flex" flexDirection="column" alignItems="center" gap="12" style={{ textAlign: "center" }}>
						<Text
							style={{
								fontFamily: "var(--ax-font-family-headings)",
								fontSize: 28,
								fontWeight: 800,
								lineHeight: "1.04",
								letterSpacing: "0.56px",
								color: "#202320",
								WebkitTextStroke: "1px #202320",
							}}
						>
							Day one essentials
						</Text>
						<Text color="fg.secondary" style={{ fontSize: 16, lineHeight: "1.5", letterSpacing: "0.32px" }}>
							Give {displayName} access to the tools they&apos;ll use every day. You can always connect more later.
						</Text>
					</Box>

					{/* Connectors card */}
					<Box style={{ width: 539 }}>
						<Box display="flex" alignItems="center" gap="6" style={{ marginBottom: 10 }}>
							<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)" }}>
								Required connectors
							</span>
							<Tooltip content="These tools are required for your teammate to function on day one" delayDuration={200}>
								<span style={{ display: "inline-flex" }}>
									<IconCircleInfo size={14} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
								</span>
							</Tooltip>
						</Box>
						<Box
							style={{
								background: "white",
								border: "1px solid var(--ax-colors-border-default)",
								borderRadius: 12,
								padding: 20,
							}}
						>
							<Box display="flex" flexDirection="column" style={{ gap: 12 }}>
								{thirdPartyKeys.map((key) => {
									const tool = TOOL_ICONS[key];
									if (!tool) return null;
									const isConnected = connectedTools.has(key);
									return (
										<Box
											key={key}
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												padding: 8,
												border: "1px solid var(--ax-colors-border-secondary)",
												borderRadius: 8,
												background: "white",
											}}
										>
											<Box display="flex" alignItems="center" gap="8" style={{ flex: 1, minWidth: 0 }}>
												{/* Icon box */}
												<Box
													style={{
														width: 40,
														height: 40,
														borderRadius: 12,
														border: "1px solid var(--ax-colors-border-secondary)",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														flexShrink: 0,
														color: tool.color,
													}}
												>
													{tool.iconLg ?? tool.icon ?? (
														<span style={{ fontSize: 10, fontWeight: 700, color: tool.color }}>{tool.textLabel}</span>
													)}
												</Box>
												{/* Name + description */}
												<Box display="flex" flexDirection="column" style={{ gap: 2 }}>
													<Text style={{ fontSize: 14, fontWeight: 600, color: "#202320", lineHeight: "1.43", letterSpacing: "0.28px" }}>
														{tool.name}
													</Text>
													<Text style={{ fontSize: 12, color: "var(--ax-colors-fg-tertiary)", lineHeight: "1.33", letterSpacing: "0.24px" }}>
														{TOOL_DESC[key] ?? "For day-to-day work"}
													</Text>
												</Box>
											</Box>
											{/* Connect / Connected button */}
											{isConnected ? (
												<Button
													size="md"
													icon={<IconCheckCircleSolid size={14} />}
													disabled
												>
													Connected
												</Button>
											) : (
												<Button
													size="md"
													onClick={() => setConnectedTools((prev) => new Set([...prev, key]))}
												>
													Connect
												</Button>
											)}
										</Box>
									);
								})}
							</Box>
						</Box>
					</Box>

					{/* Buttons */}
					<Box display="flex" gap="8" alignItems="center">
						<Button
							appearance="subtle"
							size="lg"
							onClick={() => { setShowToolConnect(false); setShowOnboarding(true); setShowKeyHandoff(true); }}
						>
							Back
						</Button>
						<Button
							appearance="primary"
							size="lg"
							addonAfter={<IconArrowRight size={16} />}
							disabled={!allConnected}
							onClick={() => {
								try {
									sessionStorage.setItem("im-initial-chat", "conv-demo-frank-dm");
									sessionStorage.setItem("im-vau-welcome", JSON.stringify({ name: vauName, avatar: vau.avatar }));
								} catch {}
								router.push("/opal/im");
							}}
						>
							Start working together
						</Button>
					</Box>
				</Box>
			</Box>
		);
	}

	// ─── Avatar picker ────────────────────────────────────────────────────────────
	if (showOnboarding && showAvatarPicker) {
		return (
			<Box
				style={{
					background: "#F9FCF8",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					padding: "40px 48px",
				}}
			>
				<Box style={{ width: "100%", maxWidth: 1100 }}>
					{/* Title */}
					<Text
						style={{
							fontFamily: "var(--ax-font-family-headings)",
							fontSize: 36,
							fontWeight: 900,
							lineHeight: "1.1",
							letterSpacing: "0.5px",
							color: "#202320",
							marginBottom: 8,
							display: "block",
						}}
					>
						Every teammate needs a look.
					</Text>
					<Text
						color="fg.secondary"
						style={{ fontSize: 16, lineHeight: "1.5", display: "block", marginBottom: 32 }}
					>
						Pick an avatar for your new co-worker.
					</Text>

					{/* Grid */}
					<Box
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(5, 1fr)",
							gap: 12,
						}}
					>
						{PICKER_AVATARS.map((avatar) => (
							<AvatarPickerCard
								key={avatar.src}
								avatar={avatar}
								isSelected={(pickerSelected?.src ?? (customAvatar?.src ?? vau.avatar)) === avatar.src}
								onClick={() => setPickerSelected(avatar)}
							/>
						))}
					</Box>

					{/* Actions */}
					<Box display="flex" justifyContent="flex-end" gap="8" style={{ marginTop: 32 }}>
						<Button
							size="lg"
							icon={<IconArrowLeft size={16} />}
							onClick={() => { setPickerSelected(null); setShowAvatarPicker(false); }}
						>
							Go back
						</Button>
						<Button
							appearance="primary"
							size="lg"
							onClick={() => {
								if (pickerSelected) setCustomAvatar(pickerSelected);
								setPickerSelected(null);
								setShowAvatarPicker(false);
							}}
						>
							Save appearance
						</Button>
					</Box>
				</Box>
			</Box>
		);
	}

	// ─── Onboarding flow ─────────────────────────────────────────────────────────
	if (showOnboarding) {
		const displayName = vauName.trim() || vau.characterName || vau.name;
		const suggestions = candidates.map((c) => c.characterName ?? c.name).filter(Boolean);
		const displayAvatarSrc = customAvatar?.src ?? vau.avatar;
		const displayAvatarBg = customAvatar?.bg ?? vau.avatarBg;

		const KeyHandoffOverlay = showKeyHandoff ? (
			<Box
				style={{
					position: "fixed", inset: 0, zIndex: 50,
					display: "flex", alignItems: "center", justifyContent: "center",
					backgroundColor: "rgba(57,62,50,0.32)",
				}}
			>
				<Box
					style={{
						display: "flex", overflow: "hidden",
						width: 960, maxWidth: "calc(100vw - 64px)", height: 480,
						background: "white", borderRadius: 31,
						border: "1px solid var(--ax-colors-border-default)",
					}}
				>
					{/* Left — copy + actions */}
					<Box style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
						{/* Main content */}
						<Box style={{ flex: 1, display: "flex", flexDirection: "column", gap: 43, alignItems: "center", justifyContent: "center", padding: 32 }}>
							<Box display="flex" flexDirection="column" gap="24" style={{ width: 416 }}>
								<Text
									style={{
										fontFamily: "var(--ax-font-family-headings)",
										fontSize: 50,
										fontWeight: 800,
										lineHeight: "1.04",
										letterSpacing: "0.5px",
										color: "#202320",
										WebkitTextStroke: "1px #202320",
									}}
								>
									Time to hand {displayName} the keys
								</Text>
								<Text color="fg.secondary" style={{ fontSize: 16, lineHeight: "1.5", letterSpacing: "0.32px" }}>
									Every new teammate gets their own account — {displayName}&apos;s no different. Sign in as {displayName} to connect the tools they&apos;ll use every day.
								</Text>
							</Box>
							<Box style={{ width: 416 }}>
								<Button
									appearance="primary"
									size="lg"
									icon={<IconArrowRightArrowLeft size={20} />}
									style={{ width: "100%", justifyContent: "center" }}
									onClick={() => { setShowKeyHandoff(false); setShowOnboarding(false); setShowToolConnect(true); }}
								>
									Sign in as {displayName}
								</Button>
							</Box>
						</Box>
						{/* Back footer */}
						<Box style={{ display: "flex", justifyContent: "center", padding: 24, borderTop: "1px solid var(--ax-colors-border-default)" }}>
							<Button
								size="lg"
								icon={<IconArrowLeft size={16} />}
								onClick={() => setShowKeyHandoff(false)}
							>
								Back
							</Button>
						</Box>
					</Box>
					{/* Right — illustration */}
					<Box style={{ width: 480, flexShrink: 0, backgroundColor: "#abf542", overflow: "hidden" }}>
						<Image src="/avatars/keys.png" alt="" width={480} height={480} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
					</Box>
				</Box>
			</Box>
		) : null;

		return (
			<>
				{KeyHandoffOverlay}
				<Box
					style={{
						background: "#F9FCF8",
						height: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "40px 24px",
					}}
				>
					<Box
						display="flex"
						flexDirection="column"
						alignItems="center"
						style={{ width: 493, gap: 32 }}
					>
						{/* Avatar + headline block — 38px gap between image and text */}
						<Box display="flex" flexDirection="column" alignItems="center" style={{ gap: 38, width: "100%" }}>
							{/* Avatar with pencil button */}
							<Box style={{ position: "relative", display: "inline-block" }}>
								<Box
									style={{
										width: 139,
										height: 153,
										borderRadius: 12,
										overflow: "hidden",
										border: "1px solid var(--ax-colors-border-default)",
										backgroundColor: displayAvatarBg,
									}}
								>
									<Image
										src={displayAvatarSrc}
										alt={vau.name}
										width={139}
										height={153}
										unoptimized
										style={{ width: "100%", height: "100%", objectFit: "cover" }}
									/>
								</Box>
								<Box
									onClick={() => setShowAvatarPicker(true)}
									style={{
										position: "absolute", top: -8, right: -16,
										width: 40, height: 40, borderRadius: "50%",
										background: "white",
										border: "1px solid var(--ax-colors-border-default)",
										display: "flex", alignItems: "center", justifyContent: "center",
										cursor: "pointer",
									}}
								>
									<IconPen size={14} style={{ color: "var(--ax-colors-fg-secondary)" }} />
								</Box>
							</Box>

							{/* Headline + subtext */}
							<Box display="flex" flexDirection="column" alignItems="center" gap="12" style={{ textAlign: "center" }}>
								<Text
									style={{
										fontFamily: "var(--ax-font-family-headings)",
										fontSize: 28,
										fontWeight: 800,
										lineHeight: "1.04",
										letterSpacing: "0.56px",
										color: "#202320",
									}}
								>
									First day on the job
								</Text>
								<Text color="fg.secondary" style={{ fontSize: 16, lineHeight: "1.5", letterSpacing: "0.32px" }}>
									Choose a name for your {vau.name.toLowerCase()}. Go with whatever feels right — you can update it anytime down the road.
								</Text>
							</Box>
						</Box>

						{/* Name input */}
						<Field description={`Suggestions: ${suggestions.join(", ")}`} style={{ width: "100%" }}>
							<Input
								size="lg"
								placeholder={`E.g. ${vau.characterName ?? vau.name}`}
								value={vauName}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVauName(e.target.value)}
								style={{ width: "100%" }}
							/>
						</Field>

						{/* Buttons */}
						<Box display="flex" gap="8" alignItems="center">
							<Button
								type="button"
								appearance="subtle"
								size="lg"
								onClick={() => router.push("/opal/virtual-teammates")}
							>
								Work with a different teammate
							</Button>
							<Button
								appearance="primary"
								size="lg"
								addonAfter={<IconArrowRight size={16} />}
								disabled={!vauName.trim()}
								onClick={() => { if (vauName.trim()) setShowKeyHandoff(true); }}
							>
								Next
							</Button>
						</Box>
					</Box>
				</Box>
			</>
		);
	}

	const examples = (vau.examples ?? DEFAULT_VAU_EXAMPLES).slice(0, 6);
	const heading = vau.characterName ? `${vau.name}, ${vau.characterName}` : vau.name;
	const thirdPartyTools = vau.tools.filter((k) => !k.startsWith("opti-"));

	return (
		<>
		<Box style={{ background: "#F9FCF8", height: "100%", overflowY: "auto" }}>
			{/* Breadcrumb */}
			<Box display="flex" alignItems="center" gap="4" style={{ padding: "16px 40px 0" }}>
				<Text
					fontSize="sm"
					color="fg.secondary"
					style={{ cursor: "pointer" }}
					onClick={() => router.push("/opal/virtual-teammates")}
				>
					Directory
				</Text>
				<Text fontSize="sm" color="fg.tertiary">/</Text>
				<Text fontSize="sm" color="fg.default">{vau.name}</Text>
			</Box>

			{/* Two-column grid: row1 = image | heading, row2 = candidates | pitch+whatido */}
			<Box
				style={{
					display: "grid",
					gridTemplateColumns: "auto 1fr",
					gridTemplateRows: "auto auto",
					columnGap: 40,
					rowGap: 12,
					padding: "24px 40px 0",
				}}
			>
				{/* Row 1, Col 1 — Avatar */}
				<Box style={{ gridRow: 1, gridColumn: 1 }}>
					<Box
						style={{
							border: "3px solid #197a94",
							borderRadius: 14,
							padding: 2,
							display: "inline-block",
						}}
					>
						<Box
							style={{
								width: 296,
								height: 284,
								border: "1px solid var(--ax-colors-border-default)",
								borderRadius: 10,
								overflow: "hidden",
								backgroundColor: vau.avatarBg,
							}}
						>
							<Image
								src={vau.avatar}
								alt={vau.name}
								width={296}
								height={284}
								unoptimized
								style={{ width: "100%", height: "100%", objectFit: "cover" }}
							/>
						</Box>
					</Box>
				</Box>

				{/* Row 1, Col 2 — Heading + traits + description + CTAs */}
				<Box style={{ gridRow: 1, gridColumn: 2, minWidth: 0 }}>
					<Box display="flex" flexDirection="column" gap="24">
						<Box display="flex" flexDirection="column" gap="12">
							<Text
								style={{
									fontFamily: "var(--ax-font-family-headings)",
									fontSize: 50,
									fontWeight: 800,
									lineHeight: "1.04",
									letterSpacing: "0.5px",
									color: "#202320",
									WebkitTextStroke: "1px #202320",
								}}
							>
								{heading}
							</Text>
							{vau.traits && vau.traits.length > 0 && (
								<Box display="flex" gap="8" style={{ flexWrap: "wrap" }}>
									{vau.traits.map((trait) => (
										<span
											key={trait}
											style={{
												display: "inline-flex",
												alignItems: "center",
												height: 24,
												padding: "0 10px",
												borderRadius: 32,
												background: "#D8E4CB",
												border: "1px solid #D8E4CB",
												fontFamily: "Roboto Mono, monospace",
												fontSize: 11,
												fontWeight: 500,
												letterSpacing: "0.36px",
												textTransform: "uppercase",
												color: "var(--ax-colors-fg-default)",
											}}
										>
											{trait}
										</span>
									))}
								</Box>
							)}
						</Box>

						<Text
							fontSize="md"
							color="fg.secondary"
							style={{ lineHeight: "1.5", letterSpacing: "0.32px", maxWidth: 580 }}
						>
							{vau.longDescription ?? vau.description}
						</Text>

						<Box display="flex" gap="16" alignItems="center">
							<Button
								appearance="primary"
								size="lg"
								addonAfter={<IconArrowRight />}
								style={{ paddingLeft: 32, paddingRight: 32 }}
								onClick={() => setShowOnboarding(true)}
							>
								Work together
							</Button>
							<Button
								size="lg"
								addonAfter={<IconComments />}
								style={{ paddingLeft: 32, paddingRight: 32 }}
								onClick={() => setAmaOpen(true)}
							>
								Ask me anything
							</Button>
						</Box>
					</Box>
				</Box>

				{/* Row 2, Col 1 — Explore other candidates */}
				<Box style={{ gridRow: 2, gridColumn: 1 }}>
					<Box display="flex" flexDirection="column" gap="8">
						<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)" }}>
							Explore other candidates
						</span>
						<Box display="flex" gap="12">
							{candidates.map((c) => (
								<CandidateThumbnail
									key={c.characterName ?? c.name}
									candidate={c}
									onClick={() => { if (c.id) router.push(`/opal/virtual-teammates/${c.id}`); }}
								/>
							))}
						</Box>
					</Box>
				</Box>

				{/* Row 2, Col 2 — My pitch + What I do */}
				<Box
					display="flex"
					flexDirection="column"
					gap="32"
					style={{ gridRow: 2, gridColumn: 2, minWidth: 0, paddingBottom: 64 }}
				>
					{/* My pitch — KPI cards */}
					<Box display="flex" flexDirection="column" gap="16">
						<Box display="flex" flexDirection="column" gap="4">
							<Text style={{ fontFamily: "var(--ax-font-family-headings)", fontSize: 20, fontWeight: 600, lineHeight: "1.1", letterSpacing: "0.4px", color: "#202320" }}>
								My pitch
							</Text>
							<Text fontSize="md" color="fg.tertiary" style={{ lineHeight: "1.5", letterSpacing: "0.32px" }}>
								{vau.pitchSubcopy ?? "Here's how Randy's will make your week easier"}
							</Text>
						</Box>
						<Box display="flex" gap="16">
							<KpiCard
								label={vau.kpi1?.label ?? "Never drops the ball"}
								value={vau.kpi1?.value ?? "Zero"}
								sub={vau.kpi1?.sub ?? "Missed follow-ups. Ever."}
							/>
							<KpiCard label="Runs" value="24/7" sub="No days off, no OOO" />
							<KpiCard
								label="Tools connected"
								value={String(vau.tools.length)}
								sub="On day one"
								toolKeys={vau.tools}
							/>
							<KpiCard
								label={vau.kpi4?.label ?? "Time back"}
								value={vau.kpi4?.value ?? "6 more hrs"}
								sub={vau.kpi4?.sub ?? "To cuddle your cat"}
							/>
						</Box>
					</Box>

					{/* Divider between KPI cards and What I do */}
					<Box style={{ height: 1, background: "var(--ax-colors-border-default)", margin: "0 0" }} />

					{/* What I do — action cards */}
					<Box display="flex" flexDirection="column" gap="16">
						<Box display="flex" flexDirection="column" gap="4">
							<Text style={{ fontFamily: "var(--ax-font-family-headings)", fontSize: 20, fontWeight: 600, lineHeight: "1.1", letterSpacing: "0.4px", color: "#202320" }}>
								What I do
							</Text>
							<Text fontSize="md" color="fg.tertiary" style={{ lineHeight: "1.5", letterSpacing: "0.32px" }}>
								Things {vau.characterName ?? vau.name} handles on your behalf
							</Text>
						</Box>
						<Box
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
								gap: 16,
							}}
						>
							{examples.map((ex) => (
								<ActionCard
									key={ex.title}
									example={ex}
									onClick={() => setActiveCapability(ex.title)}
								/>
							))}
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>

		{activeCapability === "Daily briefing" && (
			<DailyBriefingPanel onClose={() => setActiveCapability(null)} />
		)}
		{amaOpen && (
			<AMADrawer vau={vau} onClose={() => setAmaOpen(false)} />
		)}
	</>
	);
}

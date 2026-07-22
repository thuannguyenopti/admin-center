"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Box, Button, Field, Heading, Input, Text, Tooltip } from "@optiaxiom/react";
import { IconArrowLeft, IconArrowRight, IconArrowsRotate, IconCheckCircleSolid, IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronUp, IconCircleInfo, IconFolderBookmark, IconGear, IconMagnifyingGlass, IconPen, IconSparkles, IconUpload, IconUserGroup, IconXmark } from "@optiaxiom/icons";
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
					color: "var(--ax-colors-fg-default)",
				}}
			>
				{value}
			</Text>
			{/* Subtitle */}
			<span
				style={{
					fontSize: 12,
					lineHeight: "1.33",
					color: "var(--ax-colors-fg-secondary)",
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
			<Box display="flex" gap="12" alignItems="center">
				<Box
					style={{
						width: example.icon ? 64 : 48,
						height: example.icon ? 64 : 48,
						minWidth: example.icon ? 64 : 48,
						background: example.icon ? "transparent" : "#0d3a29",
						borderRadius: 8,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: 22,
						flexShrink: 0,
						overflow: "hidden",
					}}
				>
					{example.icon
						? <img src={example.icon} alt={example.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
						: example.emoji
					}
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

const PANEL_CONNECTORS = [
	{ name: "Jira",             icon: "/vau-icons/a.png" },
	{ name: "Descript",         icon: "/vau-icons/b.png" },
	{ name: "Figma",            icon: "/vau-icons/c.svg" },
	{ name: "Notion",           icon: "/vau-icons/d.png" },
	{ name: "Microsoft Teams",  icon: "/vau-icons/f.png" },
];

function PanelConnector({ index }: { toolKey: string; index: number }) {
	const connector = PANEL_CONNECTORS[index] ?? PANEL_CONNECTORS[PANEL_CONNECTORS.length - 1];
	return (
		<Box display="flex" alignItems="center" gap="8">
			<Box style={{ width: 24, height: 24, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "1px solid var(--ax-colors-border-secondary)", display: "flex", alignItems: "center", justifyContent: "center", background: "white" }}>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={connector.icon} alt={connector.name} style={{ width: "80%", height: "80%", objectFit: "contain" }} />
			</Box>
			<Text style={{ fontSize: 14 }} color="fg.default">{connector.name}</Text>
		</Box>
	);
}

function PanelSectionHeader({ label, count, info }: { label: string; count: number; info?: boolean }) {
	return (
		<Box display="flex" alignItems="center" gap="8">
			<span style={{ ...CAPTION, color: "var(--ax-colors-fg-default)" }}>{label}</span>
			{info
				? <Badge intent="information" variant="subtle">{count}</Badge>
				: <Badge intent="primary" variant="strong">{count}</Badge>
			}
		</Box>
	);
}

function PanelDivider({ spacing }: { spacing?: boolean } = {}) {
	return (
		<Box
			style={{
				height: 1,
				width: "100%",
				background: "var(--ax-colors-border-secondary)",
				flexShrink: 0,
				...(spacing ? { margin: "16px 0" } : {}),
			}}
		/>
	);
}

const BRIEFING_CARDS = [
	{ emoji: "📅", title: "Tuesday standup", body: "3 open items from last week — I've flagged them for you." },
	{ emoji: "✉️", title: "Sarah needs sign-off", body: "On the Q3 brief. Marked urgent, reply drafted and waiting." },
	{ emoji: "⚡", title: "2 assets overdue", body: "I nudged the team. Both confirmed EOD." },
];

function BriefingActionCards({ animKey, bg }: { animKey: number; bg?: string }) {
	return (
		<div key={animKey} style={{ width: "100%", height: "100%", background: bg ?? "#91dbda", display: "flex", alignItems: "center", justifyContent: "center" }}>
			<img src="/vau-icons/newspaper.png" alt="Daily briefing" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
		</div>
	);
}

const BRIEFING_SLIDES: { component?: boolean; src?: string; alt?: string }[] = [
	{ component: true },
];

function CapabilityPanel({ vau, title, onClose }: { vau: VAU; title: string; onClose: () => void }) {
	const example = (vau.examples ?? []).find((e) => e.title === title);
	const thirdPartyTools = vau.tools.filter((k) => !k.startsWith("opti-"));
	const allSkills = vau.cardSkills ?? vau.tags.map((t) => t.label);
	const visibleSkills = allSkills.slice(0, 5);
	const extraSkills = allSkills.length - visibleSkills.length;
	return (
		<>
			<Box onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(57,62,50,0.32)", zIndex: 40 }} />
			<Box style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: 513, background: "white", borderLeft: "1px solid var(--ax-colors-border-default)", zIndex: 50, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, padding: "24px 24px 40px" }}>
				<Box display="flex" alignItems="center" justifyContent="space-between">
					<Badge intent="primary">PREVIEW</Badge>
					<Button appearance="subtle" size="sm" icon={<IconXmark size={16} />} aria-label="Close panel" onClick={onClose} />
				</Box>
				<Box display="flex" gap="16">
					{example?.icon && (
						<Box style={{ width: 113, height: 116, flexShrink: 0, borderRadius: 8, border: "1px solid var(--ax-colors-border-default)", overflow: "hidden", background: vau.cardBg ?? vau.avatarBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
							<img src={example.icon} alt={title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
						</Box>
					)}
					<Box>
						<Text style={{ fontFamily: "var(--ax-font-family-headings)", fontSize: 28, fontWeight: 800, lineHeight: "1.04", letterSpacing: "0.56px", color: "#202320" }}>
							{title}
						</Text>
						{example?.description && (
							<Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.5", letterSpacing: "0.32px", display: "block", marginTop: 6 }}>
								{example.description}
							</Text>
						)}
					</Box>
				</Box>
				{thirdPartyTools.length > 0 && (
					<Box display="flex" flexDirection="column" gap="12" style={{ marginTop: 8 }}>
						<PanelSectionHeader label="Connectors" count={thirdPartyTools.length} info />
						<Box display="flex" flexDirection="column" gap="8">
							{thirdPartyTools.map((toolKey, idx) => <PanelConnector key={toolKey} toolKey={toolKey} index={idx} />)}
						</Box>
					</Box>
				)}
				{thirdPartyTools.length > 0 && allSkills.length > 0 && <PanelDivider spacing />}
				{allSkills.length > 0 && (
					<Box display="flex" flexDirection="column" gap="12">
						<PanelSectionHeader label="Skills" count={allSkills.length} info />
						<Box display="flex" style={{ flexWrap: "wrap", gap: 4 }}>
							{visibleSkills.map((skill) => <Badge key={skill} variant="subtle">{skill}</Badge>)}
							{extraSkills > 0 && <Badge variant="subtle">+{extraSkills}</Badge>}
						</Box>
					</Box>
				)}
			</Box>
		</>
	);
}

function DailyBriefingPanel({ vau, onClose }: { vau: VAU; onClose: () => void }) {
	const [slide, setSlide] = useState(0);
	const thirdPartyTools = vau.tools.filter((k) => !k.startsWith("opti-"));
	const allSkills = vau.cardSkills ?? vau.tags.map((t) => t.label);
	const visibleSkills = allSkills.slice(0, 5);
	const extraSkills = allSkills.length - visibleSkills.length;
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
					padding: "20px 20px 40px",
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

				{/* Thumbnail + title + description */}
				<Box display="flex" gap="16">
					<Box style={{ width: 113, height: 116, flexShrink: 0, borderRadius: 8, border: "1px solid var(--ax-colors-border-default)", overflow: "hidden", background: vau.cardBg ?? vau.avatarBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
						<img src="/vau-icons/newspaper.png" alt="Daily briefing" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
					</Box>
					<Box>
						<Text style={{ fontFamily: "var(--ax-font-family-headings)", fontSize: 28, fontWeight: 800, lineHeight: "1.04", letterSpacing: "0.56px", color: "#202320" }}>
							Daily briefing
						</Text>
						<Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.5", letterSpacing: "0.32px", display: "block", marginTop: 6 }}>
							No more opening six tabs to figure out what happened overnight. Randy reads your inbox,
							calendar, and Slack while you slept — and tells you the three things that actually need
							you today.
						</Text>
					</Box>
				</Box>

				{/* Slideshow (hidden — kept for slide state logic) */}
				<Box style={{ display: "none" }}>
					{BRIEFING_SLIDES[slide].component
						? <BriefingActionCards animKey={slide} bg={vau.cardBg ?? vau.avatarBg} />
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
				</Box>

				{/* Connectors */}
				{thirdPartyTools.length > 0 && (
					<Box display="flex" flexDirection="column" gap="12" style={{ marginTop: 8 }}>
						<PanelSectionHeader label="Connectors" count={thirdPartyTools.length} info />
						<Box display="flex" flexDirection="column" gap="8">
							{thirdPartyTools.map((toolKey, idx) => (
								<PanelConnector key={toolKey} toolKey={toolKey} index={idx} />
							))}
						</Box>
					</Box>
				)}

				{thirdPartyTools.length > 0 && allSkills.length > 0 && <PanelDivider spacing />}

				{/* Skills */}
				{allSkills.length > 0 && (
					<Box display="flex" flexDirection="column" gap="12">
						<PanelSectionHeader label="Skills" count={allSkills.length} info />
						<Box display="flex" style={{ flexWrap: "wrap", gap: 4 }}>
							{visibleSkills.map((skill) => (
								<Badge key={skill} variant="subtle">{skill}</Badge>
							))}
							{extraSkills > 0 && (
								<Badge variant="subtle">+{extraSkills}</Badge>
							)}
						</Box>
					</Box>
				)}

				{allSkills.length > 0 && vau.briefingFiles && vau.briefingFiles.length > 0 && <PanelDivider spacing />}

				{/* Files */}
				{vau.briefingFiles && vau.briefingFiles.length > 0 && (
					<Box display="flex" flexDirection="column" gap="12">
						<PanelSectionHeader label="Files" count={vau.briefingFiles.length} info />
						<Box display="flex" flexDirection="column" gap="8">
							{vau.briefingFiles.map((file) => (
								<Box key={file} display="flex" alignItems="center" gap="8">
									<IconFolderBookmark size={24} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
									<Text style={{ fontSize: 14 }} color="fg.secondary">{file}</Text>
								</Box>
							))}
						</Box>
					</Box>
				)}

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
	const searchParams = useSearchParams();

	const [activeCapability, setActiveCapability] = useState<string | null>(null);
	const [amaOpen, setAmaOpen] = useState(false);
	const [activePersonality, setActivePersonality] = useState(0);
	const [showOnboarding, setShowOnboarding] = useState(() => searchParams?.get("hire") === "true");
	const [showToolConnect, setShowToolConnect] = useState(false);
	const [vauName, setVauName] = useState("");
	const [connectedTools, setConnectedTools] = useState<Set<string>>(new Set());
	const [showAvatarPicker, setShowAvatarPicker] = useState(false);
	const [showPersonalityPicker, setShowPersonalityPicker] = useState(false);
	const [pickerSelected, setPickerSelected] = useState<{ src: string; bg: string } | null>(null);
	const [customAvatar, setCustomAvatar] = useState<{ src: string; bg: string } | null>(null);
	const [selectedPersonality, setSelectedPersonality] = useState<number | null>(null);
	const [expandedPersonality, setExpandedPersonality] = useState<number | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [typedText, setTypedText] = useState<string>("");
	const [isTyping, setIsTyping] = useState(false);
	const isFirstRender = useRef(true);

	const vau = useMemo(() => VAUS.find((v) => v.id === params?.id), [params?.id]);

	const currentSampleChat = vau?.personalities?.[activePersonality]?.sampleChat ?? "";

	// Typing animation: skip on first render, animate on personality swap
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			setTypedText(currentSampleChat);
			return;
		}
		if (!currentSampleChat) return;
		setIsTyping(true);
		setTypedText("");
		const dotTimer = setTimeout(() => {
			setIsTyping(false);
			let i = 0;
			const interval = setInterval(() => {
				i++;
				setTypedText(currentSampleChat.slice(0, i));
				if (i >= currentSampleChat.length) clearInterval(interval);
			}, 18);
			return () => clearInterval(interval);
		}, 420);
		return () => clearTimeout(dotTimer);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activePersonality]);
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
					height: "100%",
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
							Give {displayName}{" "}access to the tools they&apos;ll use every day. You can always connect more later.
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
													{tool.icon ?? (
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
							onClick={() => { setShowToolConnect(false); setShowOnboarding(true); }}
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
									const chosenAvatar = customAvatar?.src ?? vau.avatar;
									sessionStorage.setItem("im-vau-welcome", JSON.stringify({ name: vauName, avatar: chosenAvatar }));
									localStorage.setItem("vau-bubs-avatar", chosenAvatar);
									localStorage.setItem("active-vt", JSON.stringify({ name: vauName, avatar: chosenAvatar }));
								} catch {}
								router.push("/opal/messages?conversation=bubs");
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
		const currentSelection = pickerSelected?.src ?? customAvatar?.src ?? vau.avatar;
		return (
			<Box style={{ background: "#F9FCF8", height: "100%", display: "flex", flexDirection: "column", padding: "32px 48px 40px", boxSizing: "border-box" }}>
				{/* Breadcrumb */}
				<Box display="flex" alignItems="center" gap="4" style={{ marginBottom: 32 }}>
					<Button appearance="subtle" size="sm" style={{ padding: 0, height: "auto" }} onClick={() => setShowOnboarding(false)}>
						<Text fontSize="sm" color="fg.tertiary">First day on the job</Text>
					</Button>
					<Text fontSize="sm" color="fg.tertiary">/</Text>
					<Text fontSize="sm" color="fg.default" style={{ fontWeight: 500 }}>Avatar</Text>
				</Box>

				{/* Title */}
				<Text style={{ fontFamily: "var(--ax-font-family-headings)", fontSize: 36, fontWeight: 800, lineHeight: "1.1", letterSpacing: "0.5px", color: "#202320", WebkitTextStroke: "1px #202320", marginBottom: 8, display: "block" }}>
					Every teammate needs a look.
				</Text>
				<Text color="fg.secondary" style={{ fontSize: 16, lineHeight: "1.5", display: "block", marginBottom: 32 }}>
					Pick an avatar for your new co-worker.
				</Text>

				{/* Grid */}
				<Box style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, flex: 1, alignContent: "start" }}>
					{PICKER_AVATARS.map((avatar) => (
						<AvatarPickerCard
							key={avatar.src}
							avatar={avatar}
							isSelected={currentSelection === avatar.src}
							onClick={() => setPickerSelected(avatar)}
						/>
					))}
				</Box>

				{/* Hidden file input */}
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					style={{ display: "none" }}
					onChange={(e) => {
						const file = e.target.files?.[0];
						if (file) {
							const url = URL.createObjectURL(file);
							setCustomAvatar({ src: url, bg: "#F9FCF8" });
							setPickerSelected(null);
							setShowAvatarPicker(false);
							const hasPersonalities = (vau.personalities ?? []).length > 0;
							if (hasPersonalities) setShowPersonalityPicker(true);
						}
					}}
				/>

				{/* Actions */}
				<Box display="flex" justifyContent="flex-end" gap="8" style={{ marginTop: 32 }}>
					<Button
						size="lg"
						icon={<IconUpload size={16} />}
						onClick={() => fileInputRef.current?.click()}
					>
						Upload your own
					</Button>
					<Button
						appearance="primary"
						size="lg"
						addonAfter={<IconArrowRight size={16} />}
						disabled={!pickerSelected && !customAvatar}
						onClick={() => {
							if (pickerSelected) setCustomAvatar(pickerSelected);
							setPickerSelected(null);
							setShowAvatarPicker(false);
							const hasPersonalities = (vau.personalities ?? []).length > 0;
							if (hasPersonalities) setShowPersonalityPicker(true);
						}}
					>
						Next
					</Button>
				</Box>
			</Box>
		);
	}

	// ─── Personality picker ───────────────────────────────────────────────────────
	if (showOnboarding && showPersonalityPicker) {
		const personalities = vau.personalities ?? [];
		const displayAvatarSrc = customAvatar?.src ?? vau.cardImage ?? vau.avatar;
		const displayAvatarBg = customAvatar?.bg ?? vau.cardBg ?? vau.avatarBg;

		const PERSONALITY_ICONS: Record<string, React.ReactNode> = {
			gear:    <IconGear size={22} />,
			sparkle: <IconSparkles size={22} />,
			people:  <IconUserGroup size={22} />,
			search:  <IconMagnifyingGlass size={22} />,
		};

		const FLOATING_BADGES = [
			{ label: "Tastemaker", emoji: "🎨", top: "12%",  left: "8%"  },
			{ label: "Supportive", emoji: "🤝", top: "42%",  right: "8%" },
			{ label: "Hypemate",   emoji: "🔥", bottom: "14%", left: "4%" },
		];

		return (
			<Box style={{ height: "100%", display: "flex", minHeight: 0 }}>
				{/* ── Left panel ── */}
				<Box style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0, background: "#F9FCF8" }}>
					{/* Scrollable content */}
					<Box style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "32px 40px 48px", display: "flex", flexDirection: "column", alignItems: "center" }}>
					<Box style={{ width: "100%", maxWidth: 544 }}>
						{/* Breadcrumb */}
						<Box display="flex" alignItems="center" gap="4" style={{ marginBottom: 24 }}>
							<Button appearance="subtle" size="sm" style={{ padding: 0, height: "auto" }} onClick={() => { setShowPersonalityPicker(false); setShowOnboarding(false); }}>
								<Text fontSize="sm" color="fg.tertiary">First day on the job</Text>
							</Button>
							<Text fontSize="sm" color="fg.tertiary">/</Text>
							<Button appearance="subtle" size="sm" style={{ padding: 0, height: "auto" }} onClick={() => { setShowPersonalityPicker(false); setShowAvatarPicker(true); }}>
								<Text fontSize="sm" color="fg.tertiary">Avatar</Text>
							</Button>
							<Text fontSize="sm" color="fg.tertiary">/</Text>
							<Text fontSize="sm" color="fg.default" style={{ fontWeight: 500 }}>Personality</Text>
						</Box>

						{/* Title */}
						<Text style={{ fontFamily: "var(--ax-font-family-headings)", fontSize: 36, fontWeight: 800, lineHeight: "1.1", letterSpacing: "0.5px", color: "#202320", WebkitTextStroke: "1px #202320", marginBottom: 8, display: "block" }}>
							{"What's their personality?"}
						</Text>
						<Text color="fg.secondary" style={{ fontSize: 16, lineHeight: "1.5", display: "block", marginBottom: 20 }}>
							Are they a hype machine or a voice of reason? Your call.
						</Text>

						{/* Personality cards */}
						<Box display="flex" flexDirection="column" gap="16">
							{personalities.map((p, i) => {
								const isSelected = selectedPersonality === i;
								const isExpanded = expandedPersonality === i;
								return (
									<Box
										key={p.label}
										onClick={() => {
											setSelectedPersonality(i);
											setExpandedPersonality(isExpanded ? null : i);
										}}
										style={{
											border: isSelected ? "2px solid #197a94" : "1px solid var(--ax-colors-border-default)",
											borderRadius: 12,
											padding: isSelected ? "15px 15px" : "16px 16px",
											background: "white",
											cursor: "pointer",
											transition: "border-color 0.15s ease",
										}}
									>
										{/* Card header */}
										<Box display="flex" alignItems="stretch" gap="16">
											{/* Icon */}
											<Box style={{ width: 56, minHeight: 56, borderRadius: 10, background: "#E3F3F8", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ax-colors-fg-default)", flexShrink: 0, alignSelf: "stretch" }}>
												{PERSONALITY_ICONS[p.icon ?? "gear"]}
											</Box>
											{/* Text */}
											<Box style={{ flex: 1, minWidth: 0 }}>
												<Text style={{ fontFamily: "var(--ax-font-family-headings)", fontSize: 18, fontWeight: 600, color: "var(--ax-colors-fg-default)", display: "block", marginBottom: 4 }}>
													{p.label}
												</Text>
												<Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.5", fontWeight: 400 }}>
													{p.description}
												</Text>
											</Box>
											{/* Chevron */}
											<Box style={{ color: "var(--ax-colors-fg-default)", flexShrink: 0, display: "flex", alignItems: "center", alignSelf: "center" }}>
												{isExpanded ? <IconChevronUp size={22} /> : <IconChevronDown size={22} />}
											</Box>
										</Box>

										{/* Expanded content */}
										{isExpanded && (
											<Box style={{ marginTop: 16 }}>
												{/* Trait pills — Axiom default subtle badges */}
												{p.traits && p.traits.length > 0 && (
													<Box display="flex" gap="6" style={{ flexWrap: "wrap", marginBottom: 16 }}>
														{p.traits.map((trait) => (
															<Badge key={trait} variant="subtle">{trait}</Badge>
														))}
													</Box>
												)}
												{/* Sounds like */}
												{p.sampleChat && (
													<Box display="flex" flexDirection="column" gap="8">
														<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)" }}>Sounds like</span>
														<Box display="flex" alignItems="start" style={{ gap: 10 }}>
															<Box style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0, backgroundColor: displayAvatarBg, border: "1px solid var(--ax-colors-border-default)" }}>
																<Image src={displayAvatarSrc} alt="" width={32} height={32} unoptimized style={{ width: "100%", height: "100%", objectFit: "contain" }} />
															</Box>
															<Box style={{ background: "#EEFFD9", borderRadius: 8, padding: "10px 12px", flex: 1 }}>
																<Text fontSize="sm" color="fg.default" style={{ lineHeight: "1.5" }}>{p.sampleChat}</Text>
															</Box>
														</Box>
													</Box>
												)}
											</Box>
										)}
									</Box>
								);
							})}
						</Box>
					</Box>

					{/* Action buttons */}
					<Box display="flex" justifyContent="flex-end" alignItems="center" gap="8" style={{ marginTop: 32, width: "100%", maxWidth: 544 }}>
						<Button
							appearance="subtle"
							size="lg"
							onClick={() => { setShowPersonalityPicker(false); setSelectedPersonality(null); }}
						>
							Skip
						</Button>
						<Button
							appearance="primary"
							size="lg"
							addonBefore={<IconCheckCircleSolid size={16} />}
							disabled={selectedPersonality === null}
							onClick={() => { setShowPersonalityPicker(false); }}
						>
							Save
						</Button>
					</Box>
					</Box>
				</Box>

				{/* ── Right panel — nature background + floating badges ── */}
				<Box style={{ width: 440, flexShrink: 0, position: "relative", overflow: "hidden" }}>
					<Image src="/nature-bg.png" alt="" fill unoptimized style={{ objectFit: "cover" }} />
					{FLOATING_BADGES.map((badge) => (
						<Box
							key={badge.label}
							style={{
								position: "absolute",
								...(badge.top    ? { top:    badge.top    } : {}),
								...(badge.bottom ? { bottom: badge.bottom } : {}),
								...(badge.left   ? { left:   badge.left   } : {}),
								...(badge.right  ? { right:  badge.right  } : {}),
								background: "white",
								border: "2px solid #1a1a1a",
								borderRadius: 18,
								padding: "16px 28px",
								display: "flex",
								alignItems: "center",
								gap: 14,
								boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
							}}
						>
							<Text style={{ fontFamily: "var(--ax-font-family-headings)", fontSize: 28, fontWeight: 800, color: "#1a1a1a" }}>{badge.label}</Text>
							<span style={{ fontSize: 34 }}>{badge.emoji}</span>
						</Box>
					))}
				</Box>
			</Box>
		);
	}

	// ─── Onboarding flow ─────────────────────────────────────────────────────────
	if (showOnboarding) {
		const displayName = vauName.trim() || vau.characterName || vau.name;
		const suggestions = candidates.map((c) => c.characterName ?? c.name).filter(Boolean);
		const displayAvatarSrc = customAvatar?.src ?? vau.cardImage ?? vau.avatar;
		const displayAvatarBg = customAvatar?.bg ?? vau.cardBg ?? vau.avatarBg;

		return (
			<>
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
										style={{ width: "100%", height: "100%", objectFit: "contain" }}
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
								onClick={() => { if (vauName.trim()) { setShowOnboarding(false); setShowToolConnect(true); } }}
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
	const heading = vau.name;
	const thirdPartyTools = vau.tools.filter((k) => !k.startsWith("opti-"));
	const allSkills = vau.cardSkills ?? vau.tags.map((t) => t.label);
	const personalities = vau.personalities ?? [];
	const staticDescription = vau.longDescription ?? personalities[0]?.description ?? vau.description;

	const activePersonalityLabel = personalities[activePersonality]?.label ?? "";
	const personalityBadge = activePersonalityLabel.startsWith("The ")
		? activePersonalityLabel.slice(4).toUpperCase()
		: activePersonalityLabel.toUpperCase();
	const activeSampleChat = personalities[activePersonality]?.sampleChat;
	const activeAvatarSrc = activePersonalityLabel === "The Tastemaker" ? "/vau-icons/T.png"
		: activePersonalityLabel === "The Hype Machine" ? "/vau-icons/HM.png"
		: activePersonalityLabel === "The Stress Tester" ? "/vau-icons/ST.png"
		: (vau.cardImage ?? vau.avatar);

	return (
		<>
			<Box style={{ position: "absolute", inset: 0, overflowY: "auto", background: "#F9FCF8" }}>
				<Box style={{ maxWidth: 997, margin: "0 auto", padding: "32px 40px 64px" }}>

					{/* Breadcrumb */}
					<Box display="flex" alignItems="center" gap="4" style={{ marginBottom: 32 }}>
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

					{/* ── Two-column header ── */}
					<Box display="flex" gap="48" style={{ marginBottom: 48, alignItems: "flex-start" }}>

						{/* Left: avatar column */}
						<Box style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
							{/* Avatar with teal border + PRAGMATIST badge */}
							<Box style={{ position: "relative" }}>
								<Box style={{ border: "3px solid #197a94", borderRadius: 14, padding: 2 }}>
									<Box
										style={{
											width: "100%",
											aspectRatio: "1 / 1",
											border: "1px solid var(--ax-colors-border-default)",
											borderRadius: 10,
											overflow: "hidden",
											backgroundColor: vau.cardBg ?? vau.avatarBg,
											boxSizing: "border-box",
											display: "flex",
											alignItems: "flex-end",
											justifyContent: "center",
										}}
									>
										<Image
											src={activeAvatarSrc}
											alt={vau.name}
											width={294}
											height={294}
											unoptimized
											style={{ width: "92%", height: "92%", objectFit: "contain", display: "block" }}
										/>
									</Box>
								</Box>
								{/* Personality badge overlay */}
								{personalityBadge && (
									<Box style={{ position: "absolute", top: 12, right: 12 }}>
										<Badge variant="subtle">{personalityBadge}</Badge>
									</Box>
								)}
							</Box>

							</Box>

						{/* Right: content column */}
						<Box style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
							{/* Heading */}
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

							{/* Category badge — 8px below heading */}
							{vau.cardCategory && (
								<Box style={{ marginTop: -12 }}>
									<Badge intent="information" variant="subtle">{vau.cardCategory}</Badge>
								</Box>
							)}

							{/* Intro message bubble */}
							{activeSampleChat && (
								<Box display="flex" alignItems="center" gap="8">
									{/* Circle avatar */}
									<Box
										style={{
											width: 32,
											height: 32,
											borderRadius: "50%",
											overflow: "hidden",
											flexShrink: 0,
											backgroundColor: vau.cardBg ?? vau.avatarBg,
											border: "1px solid var(--ax-colors-border-default)",
										}}
									>
										<Image
											src={activeAvatarSrc}
											alt=""
											width={32}
											height={32}
											unoptimized
											style={{ width: "100%", height: "100%", objectFit: "contain" }}
										/>
									</Box>
									{/* Message bubble */}
									<Box
										style={{
											background: "#EEFFD9",
											borderRadius: 8,
											padding: "8px 12px",
											flex: 1,
											minHeight: 40,
											display: "flex",
											alignItems: "center",
										}}
									>
										{isTyping ? (
											<Box display="flex" alignItems="center" gap="4" style={{ padding: "2px 0" }}>
												<span className="vau-typing-dot" />
												<span className="vau-typing-dot" />
												<span className="vau-typing-dot" />
											</Box>
										) : (
											<Text
												fontSize="sm"
												color="fg.default"
												style={{
													lineHeight: "1.5",
													letterSpacing: "0.24px",
													display: "-webkit-box",
													WebkitLineClamp: 2,
													WebkitBoxOrient: "vertical",
													overflow: "hidden",
												}}
											>
												{typedText}
												{typedText.length > 0 && typedText.length < currentSampleChat.length && (
													<span className="vau-cursor" />
												)}
											</Text>
										)}
									</Box>
									{/* Swap button */}
									{personalities.length > 1 && (
										<Tooltip content="Try a different personality" delayDuration={300}>
											<Button
												appearance="subtle"
												size="lg"
												icon={<IconArrowsRotate />}
												aria-label="Try a different personality"
												style={{ flexShrink: 0 }}
												onClick={() => setActivePersonality((prev) => (prev + 1) % personalities.length)}
											/>
										</Tooltip>
									)}
								</Box>
							)}

							{/* Description */}
							<Text
								fontSize="md"
								color="fg.secondary"
								style={{ lineHeight: "1.6", letterSpacing: "0.32px", display: "block" }}
							>
								{staticDescription}
							</Text>

							{/* Work together CTA */}
							<Box style={{ alignSelf: "flex-start" }}>
								<Button
									appearance="primary"
									size="lg"
									addonAfter={<IconArrowRight />}
									style={{ paddingLeft: 62, paddingRight: 62 }}
									onClick={() => setShowOnboarding(true)}
								>
									Work together
								</Button>
							</Box>
						</Box>
					</Box>

					{/* My pitch */}
					{vau.pitchStats && vau.pitchStats.length > 0 && (
						<Box display="flex" flexDirection="column" gap="16" style={{ marginBottom: 32 }}>
							<Box display="flex" flexDirection="column" gap="4">
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
									My pitch
								</Text>
								<Text fontSize="md" color="fg.tertiary" style={{ lineHeight: "1.5", letterSpacing: "0.32px" }}>
									What your {vau.name.toLowerCase()} will bring to the table
								</Text>
							</Box>
							<Box style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
								{vau.pitchStats.map((stat) => {
									const cardContent = (
										<Box
											key={stat.label}
											style={{
												width: 226,
												minWidth: 226,
												height: 108,
												flexShrink: 0,
												boxSizing: "border-box",
												border: "1px solid var(--ax-colors-border-default)",
												borderRadius: 12,
												padding: "14px 20px",
												background: "white",
												display: "flex",
												flexDirection: "column",
												justifyContent: "space-between",
											}}
										>
											<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)" }}>{stat.label}</span>
											<Box display="flex" alignItems="center" gap="8">
												<Heading level="2" style={{ color: "var(--ax-colors-fg-default)", flexShrink: 0, lineHeight: 1 }}>
													{stat.value}
												</Heading>
												{stat.showTools && vau.tools.length > 0 && (
													<Box display="flex" alignItems="center">
														{vau.tools.filter((k) => !k.startsWith("opti-")).slice(0, 5).map((toolKey, idx) => {
															const connector = PANEL_CONNECTORS[idx] ?? PANEL_CONNECTORS[PANEL_CONNECTORS.length - 1];
															return (
																<Tooltip key={toolKey} content={connector.name} delayDuration={200}>
																	<Box
																		style={{
																			width: 24,
																			height: 24,
																			borderRadius: "50%",
																			border: "1.5px solid white",
																			backgroundColor: "white",
																			display: "flex",
																			alignItems: "center",
																			justifyContent: "center",
																			marginLeft: idx > 0 ? -6 : 0,
																			flexShrink: 0,
																			zIndex: 10 - idx,
																			overflow: "hidden",
																			position: "relative",
																		}}
																	>
																		<img src={connector.icon} alt={connector.name} style={{ width: "80%", height: "80%", objectFit: "contain" }} />
																	</Box>
																</Tooltip>
															);
														})}
														{vau.tools.filter((k) => !k.startsWith("opti-")).length > 5 && (
															<Box
																style={{
																	width: 24,
																	height: 24,
																	borderRadius: "50%",
																	border: "1.5px solid white",
																	backgroundColor: "var(--ax-colors-bg-neutral)",
																	display: "flex",
																	alignItems: "center",
																	justifyContent: "center",
																	marginLeft: -6,
																	fontSize: 10,
																	fontWeight: 700,
																	color: "var(--ax-colors-fg-secondary)",
																	flexShrink: 0,
																	position: "relative",
																}}
															>
																+{vau.tools.filter((k) => !k.startsWith("opti-")).length - 5}
															</Box>
														)}
													</Box>
												)}
											</Box>
											<Text fontSize="sm" color="fg.tertiary" style={{ lineHeight: "1.4", letterSpacing: "0.24px" }}>
												{stat.sub}
											</Text>
										</Box>
									);
									if (stat.showSkills && allSkills.length > 0) {
										return (
											<Tooltip key={stat.label} content={allSkills.join(", ")} delayDuration={200}>
												{cardContent}
											</Tooltip>
										);
									}
									return cardContent;
								})}
							</Box>
						</Box>
					)}

					{/* Divider */}
					{vau.pitchStats && vau.pitchStats.length > 0 && (
						<Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", marginBottom: 32 }} />
					)}

					{/* What I do */}
					<Box display="flex" flexDirection="column" gap="16">
						<Box display="flex" flexDirection="column" gap="4">
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
								What I do
							</Text>
							<Text fontSize="md" color="fg.tertiary" style={{ lineHeight: "1.5", letterSpacing: "0.32px" }}>
								The workflows they will run to keep things moving
							</Text>
						</Box>
						<Box
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(2, 1fr)",
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

			{activeCapability === "Daily briefing" && (
				<DailyBriefingPanel vau={vau} onClose={() => setActiveCapability(null)} />
			)}
			{activeCapability && activeCapability !== "Daily briefing" && (
				<CapabilityPanel vau={vau} title={activeCapability} onClose={() => setActiveCapability(null)} />
			)}
			{amaOpen && (
				<AMADrawer vau={vau} onClose={() => setAmaOpen(false)} />
			)}
		</>
	);
}

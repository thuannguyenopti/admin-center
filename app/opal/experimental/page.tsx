"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge, Box, Button, Text, Tooltip } from "@optiaxiom/react";
import { Input } from "@/app/components/Input";
import {
	IconSearch,
	IconChevronDown,
	IconCircleCheck,
	IconCheckCircleSolid,
	IconCircleCheckSolid,
} from "@optiaxiom/icons";
import { TOOL_ICONS } from "@/app/opal/virtual-teammates/tool-icons";

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 12,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase",
	color: "var(--ax-colors-fg-tertiary)",
};

const TOOL_CHIP: React.CSSProperties = {
	width: 24,
	height: 24,
	borderRadius: 8,
	border: "1px solid #e4f0da",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	flexShrink: 0,
	padding: 4,
	overflow: "hidden",
};

const DIVIDER = (
	<Box style={{ height: 1, background: "#e4f0da", width: "100%", flexShrink: 0, margin: "4px 0" }} />
);

const BROWSE_ITEMS = [
	{ label: "Virtual Teammates", count: 3 },
	{ label: "Agents", count: 48 },
	{ label: "Plugins", count: 12 },
	{ label: "Skills", count: 30 },
	{ label: "Connectors", count: 28 },
];

const CARDS = [
	{
		id: "chief-of-staff",
		name: "Chief of Staff",
		category: "Operations & Priorities",
		cardBg: "#91dbda",
		cardImage: "/chair.png",
		skills: ["Calendar wrangling", "Inbox triage", "Weekly reporting", "Cross-team updates"],
		tools: ["figma", "slack", "google", "notion"],
		installed: false,
	},
	{
		id: "content-producer",
		name: "Content Producer",
		category: "Creative & Content",
		cardBg: "#eeffd9",
		cardImage: "/vau-card-content-producer.png",
		skills: ["Calendar wrangling", "Inbox triage", "Weekly reporting", "Cross-team updates"],
		tools: ["figma", "slack", "google", "notion"],
		installed: false,
	},
	{
		id: "campaign-strategist",
		name: "Campaign Strategist",
		category: "Marketing & Growth",
		cardBg: "#fef1c6",
		cardImage: "/vau-card-campaign-strategist.png",
		skills: ["Calendar wrangling", "Inbox triage", "Weekly reporting", "Cross-team updates"],
		tools: ["figma", "slack", "google", "notion"],
		installed: true,
	},
];

function ToolChips({ tools }: { tools: string[] }) {
	const visible = tools.slice(0, 4);
	const overflow = tools.length - visible.length;
	return (
		<Box display="flex" alignItems="center" gap="4">
			{visible.map((toolKey) => {
				const tool = TOOL_ICONS[toolKey];
				if (!tool) return null;
				return (
					<Tooltip key={toolKey} content={tool.name} delayDuration={300}>
						<Box style={{ ...TOOL_CHIP, color: tool.color }}>
							{tool.icon}
						</Box>
					</Tooltip>
				);
			})}
			{overflow > 0 && (
				<Box style={{ ...TOOL_CHIP, fontFamily: "var(--ax-font-family)", fontSize: 12, color: "var(--ax-colors-fg-secondary)", padding: 0 }}>
					+{overflow}
				</Box>
			)}
		</Box>
	);
}

function VTCard({ card, onEnable, onDetails }: { card: typeof CARDS[0]; onEnable: () => void; onDetails: () => void }) {
	const [flipped, setFlipped] = useState(false);
	const [hovered, setHovered] = useState(false);

	const tilt = hovered && !flipped ? "rotateY(5deg) rotateX(-2deg)" : "";
	const rotation = flipped ? "rotateY(180deg)" : tilt;

	return (
		<div
			style={{ perspective: "1200px", width: 344, flexShrink: 0, height: 568, cursor: "pointer" }}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onClick={() => setFlipped((f) => !f)}
		>
			<div style={{
				position: "relative", width: "100%", height: "100%",
				transformStyle: "preserve-3d",
				transition: "transform 0.45s ease",
				transform: rotation,
			}}>
				{/* FRONT */}
				<div style={{
					position: "absolute", inset: 0,
					backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
					background: "white", border: "1px solid #d8e4cb",
					borderRadius: 12, padding: 20,
					display: "flex", flexDirection: "column", gap: 8, overflow: "hidden",
				}}>
					{card.installed && (
						<Box style={{ position: "absolute", top: 16, right: 16 }}>
							<IconCheckCircleSolid style={{ color: "#22c55e", width: 20, height: 20 }} />
						</Box>
					)}

					<Box display="flex" flexDirection="column" gap="8" style={{ alignItems: "flex-start" }}>
						<span style={CAPTION}>Resume</span>
						<Text style={{ fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)", fontSize: 28, fontWeight: 800, lineHeight: "1.04", letterSpacing: "0.56px", color: "#000" }}>
							{card.name}
						</Text>
						<Badge intent="information" variant="subtle">{card.category}</Badge>
					</Box>

					{DIVIDER}

					<Box style={{ width: "100%", flex: 1, minHeight: 140, borderRadius: 8, background: card.cardBg, overflow: "hidden" }}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={card.cardImage} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
					</Box>

					<Box display="flex" flexDirection="column" gap="8">
						<span style={CAPTION}>Responsibilities</span>
						<Box display="flex" style={{ flexWrap: "wrap", gap: 4, height: 44, overflow: "hidden", alignContent: "flex-start" }}>
							{card.skills.map((s) => <Badge key={s} variant="subtle">{s}</Badge>)}
						</Box>
					</Box>

					{DIVIDER}

					<Box display="flex" flexDirection="column" gap="8">
						<span style={CAPTION}>Works with your tools</span>
						<ToolChips tools={card.tools} />
					</Box>

					{DIVIDER}

					<Box>
						{card.installed ? (
							<Button appearance="default" size="lg" style={{ width: "100%", justifyContent: "center" }}>
								Work together
							</Button>
						) : (
							<Button
								appearance="primary"
								size="lg"
								style={{ width: "100%", justifyContent: "center" }}
								onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEnable(); }}
							>
								Enable for your team
							</Button>
						)}
					</Box>
				</div>

				{/* BACK */}
				<div style={{
					position: "absolute", inset: 0,
					backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
					transform: "rotateY(180deg)",
					background: "white", border: "1px solid #d8e4cb",
					borderRadius: 12, padding: 20,
					display: "flex", flexDirection: "column", gap: 8, overflow: "hidden",
				}}>
					{/* Header */}
					<Box display="flex" alignItems="center" gap="12">
						<Box style={{
							width: 52, height: 52, minWidth: 52, borderRadius: 8,
							border: "1px solid #e4f0da", overflow: "hidden",
							background: card.cardBg, flexShrink: 0,
						}}>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={card.cardImage} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
						</Box>
						<Box display="flex" flexDirection="column" gap="6" style={{ alignItems: "flex-start" }}>
							<Text style={{ fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)", fontSize: 22, fontWeight: 800, lineHeight: "1.1", letterSpacing: "0.44px", color: "#000" }}>
								{card.name}
							</Text>
							<Badge intent="information" variant="subtle">{card.category}</Badge>
						</Box>
					</Box>

					{DIVIDER}

					<Box display="flex" flexDirection="column" gap="4">
						<span style={CAPTION}>Responsibilities</span>
						<Box display="flex" style={{ flexWrap: "wrap", gap: 4 }}>
							{card.skills.map((s) => <Badge key={s} variant="subtle">{s}</Badge>)}
						</Box>
					</Box>

					{DIVIDER}

					<Box display="flex" flexDirection="column" gap="4">
						<span style={CAPTION}>Works with your tools</span>
						<ToolChips tools={card.tools} />
					</Box>

					{/* Buttons */}
					<Box display="flex" gap="8" style={{ paddingTop: 8, marginTop: "auto" }}>
						<Button
							appearance="primary"
							size="md"
							style={{ flex: 1, justifyContent: "center" }}
							onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEnable(); }}
						>
							Enable for your team
						</Button>
						<Button
							appearance="default"
							size="md"
							style={{ flex: 1, justifyContent: "center" }}
							onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDetails(); }}
						>
							Details
						</Button>
					</Box>
				</div>
			</div>
		</div>
	);
}

function NavRow({ active, icon, children, addonAfter, onClick }: {
	active?: boolean;
	icon?: React.ReactNode;
	children: React.ReactNode;
	addonAfter?: React.ReactNode;
	onClick?: () => void;
}) {
	const [hovered, setHovered] = useState(false);
	return (
		<Box
			display="flex"
			alignItems="center"
			gap="12"
			style={{
				height: 40,
				borderRadius: 8,
				padding: "8px 12px",
				cursor: "pointer",
				background: (active || hovered) ? "var(--ax-colors-bg-secondary)" : "transparent",
				transition: "background 0.1s ease",
			}}
			onClick={onClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{icon && (
				<Box style={{ width: 16, height: 16, flexShrink: 0, color: active ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
					{icon}
				</Box>
			)}
			<Text fontSize="md" color={active ? "fg.default" : "fg.secondary"} style={{ flex: 1, fontWeight: 500 }}>
				{children}
			</Text>
			{addonAfter}
		</Box>
	);
}

export default function ExperimentalDirectoryPage() {
	const [query, setQuery] = useState("");
	const [activeNav, setActiveNav] = useState("Virtual Teammates");
	const [installedIds, setInstalledIds] = useState<Set<string>>(new Set(CARDS.filter(c => c.installed).map(c => c.id)));
	const [toast, setToast] = useState<string | null>(null);
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const enabled = searchParams.get("enabled");
		if (enabled) {
			setInstalledIds(prev => new Set([...prev, enabled]));
			setToast("Chief of Staff has been enabled for your org.");
			const t = setTimeout(() => setToast(null), 4000);
			// Clean the param from the URL without a navigation
			router.replace("/opal/experimental", { scroll: false });
			return () => clearTimeout(t);
		}
	}, [searchParams, router]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return CARDS;
		return CARDS.filter((c) =>
			c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
		);
	}, [query]);

	return (
		<>
		<Box display="flex" style={{ height: "100%", minHeight: 0, overflow: "hidden" }}>
			{/* Browse panel */}
			<Box style={{
				width: 272, minWidth: 272, flexShrink: 0,
				borderLeft: "1px solid var(--ax-colors-border-secondary)",
				borderRight: "1px solid var(--ax-colors-border-secondary)",
				background: "var(--ax-colors-bg-default)",
				display: "flex", flexDirection: "column", gap: 4,
				padding: "16px 0", overflowY: "auto", boxSizing: "border-box",
			}}>
				<Box display="flex" alignItems="center" justifyContent="space-between" style={{ padding: "12px 12px 4px" }}>
					<Text color="fg.tertiary" style={{ fontSize: 12, letterSpacing: "0.24px" }}>Browse Directory</Text>
					<IconChevronDown style={{ color: "var(--ax-colors-fg-tertiary)", width: 14, height: 14 }} />
				</Box>

				{BROWSE_ITEMS.map((item) => (
					<NavRow
						key={item.label}
						active={activeNav === item.label}
						onClick={() => setActiveNav(item.label)}
						addonAfter={<Badge intent="information" variant="subtle">{item.count}</Badge>}
					>
						{item.label}
					</NavRow>
				))}

				<Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "4px 0" }} />

				<Box display="flex" alignItems="center" justifyContent="space-between" style={{ padding: "12px 12px 4px" }}>
					<Text color="fg.tertiary" style={{ fontSize: 12, letterSpacing: "0.24px" }}>Quick Filters</Text>
					<IconChevronDown style={{ color: "var(--ax-colors-fg-tertiary)", width: 14, height: 14 }} />
				</Box>

				<NavRow icon={<IconCircleCheck style={{ width: 16, height: 16 }} />}>
					Installed
				</NavRow>
			</Box>

			{/* Main content */}
			<Box display="flex" flexDirection="column" style={{ flex: 1, minHeight: 0, overflowY: "auto", background: "#F9FCF8" }}>
				<Box display="flex" flexDirection="column" style={{ padding: "16px 40px" }}>
					<Text style={{ fontFamily: "var(--ax-font-family-headings)", fontSize: 48, fontWeight: 900, lineHeight: "1.04", letterSpacing: "0.96px", color: "#000", marginBottom: 8 }}>
						Directory
					</Text>
					<Text color="fg.secondary" fontSize="md" mb="32">
						Meet your new favorite coworkers. They do the boring stuff. You get the glory.
					</Text>

					<Box display="flex" alignItems="center" gap="8" mb="24">
						<Box style={{ flex: 1, maxWidth: 264 }}>
							<Input
								placeholder="Enter name or description"
								addonBefore={<IconSearch />}
								value={query}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
							/>
						</Box>
					</Box>

					<Box style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
						{filtered.map((card) => (
							<VTCard
								key={card.id}
								card={{ ...card, installed: installedIds.has(card.id) }}
								onEnable={() => router.push("/opal/experimental/chief-of-staff/enable")}
								onDetails={() => router.push("/opal/experimental/chief-of-staff")}
							/>
						))}
					</Box>
				</Box>
			</Box>
		</Box>

		{/* Toast notification */}
		{toast && (
			<Box style={{
				position: "fixed",
				top: 20,
				right: 20,
				zIndex: 9999,
				background: "#202320",
				color: "white",
				borderRadius: 10,
				padding: "12px 16px",
				display: "flex",
				alignItems: "center",
				gap: 10,
				boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
				fontSize: 14,
				fontFamily: "var(--ax-font-family)",
				fontWeight: 500,
				maxWidth: 320,
			}}>
				<IconCircleCheckSolid style={{ color: "#86efac", width: 18, height: 18, flexShrink: 0 }} />
				{toast}
			</Box>
		)}
		</>
	);
}

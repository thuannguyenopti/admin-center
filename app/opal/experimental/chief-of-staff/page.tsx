"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Box, Button, Text, Tooltip } from "@optiaxiom/react";
import { IconArrowRight, IconChevronLeft } from "@optiaxiom/icons";
import Image from "next/image";
import { TOOL_ICONS } from "@/app/opal/virtual-teammates/tool-icons";

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 12,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase",
};

const VAU = {
	name: "Chief of Staff",
	category: "Operations & Priorities",
	cardBg: "#91dbda",
	cardImage: "/chair.png",
	avatar: "/avatars/chair.png",
	avatarBg: "#FAF6E8",
	description: "Less herding cats, more getting stuff done. Your Chief of Staff agent runs point on priorities so you can stop running on fumes. It drafts updates, preps meetings, and keeps every workstream moving — no nudging required.",
	tools: ["google", "notion", "slack", "asana", "figma"],
	pitchStats: [
		{ label: "Works for you", value: "24/7", sub: "& has never stolen your lunch" },
		{ label: "Skills", value: "24", sub: "& just getting started" },
		{ label: "Tools connected", value: "8", sub: "on day one" },
		{ label: "Time back", value: "6+ hrs", sub: "to snuggle your cat" },
	],
	personalities: [
		{ label: "Pragmatist", sampleChat: "Hi! I'm your new chief of staff. I noticed your inbox has 847 unread emails. I'm not judging. I'm just saying we have work to do." },
		{ label: "Tastemaker", sampleChat: "Good morning. I've taken the liberty of restructuring your week. You're welcome." },
		{ label: "Hype Machine", sampleChat: "🎉 OH. MY. GOODNESS. You have 847 unread emails and that means 847 OPPORTUNITIES. Let's DO this!!!" },
		{ label: "Stress Tester", sampleChat: "Flagged: 3 commitments at risk, 1 meeting with no prep doc, and your inbox has 847 unread. We should talk." },
	],
	examples: [
		{ title: "Daily briefing", frequency: "First thing in the morning", description: "I'll round up overnight changes, your day's calendar, and what needs you first — so you start the day knowing where to focus. In addition to that I can do much more!", icon: "/vau-icons/newspaper.png" },
		{ title: "Status nudges", frequency: "Sent when things stall", description: "I'll quietly nudge when a thread goes quiet or a commitment slips — to the right person, with the right context. In addition to that I can do much more!", icon: "/vau-icons/bell.png" },
		{ title: "Action item tracking", frequency: "Updated in real time", description: "I'll catch commitments from meetings, emails, and chats — and keep a running list of what's owed, who owes it, and when it's due. In addition to that I can do much more!", icon: "/vau-icons/action.png" },
		{ title: "Weekly recap", frequency: "Fridays at 4pm", description: "Every Friday, I'll recap what got done, what didn't, and what's worth sharing up in your team update — so nothing gets lost between meetings. In addition to that I can do much more!", icon: "/vau-icons/calendar.png" },
	],
};

function ToolCircle({ toolKey, index, total }: { toolKey: string; index: number; total: number }) {
	const tool = TOOL_ICONS[toolKey];
	if (!tool) return null;
	return (
		<Tooltip content={tool.name} delayDuration={200}>
			<Box style={{
				width: 22, height: 22, borderRadius: "50%",
				border: "1.5px solid var(--ax-colors-bg-default)",
				background: "#f3f7ee",
				display: "flex", alignItems: "center", justifyContent: "center",
				marginLeft: index > 0 ? -6 : 0,
				position: "relative", zIndex: total - index,
				flexShrink: 0, color: tool.color, overflow: "hidden",
			}}>
				{tool.icon ?? <span style={{ fontSize: 6, fontWeight: 700, fontFamily: "Roboto Mono, monospace" }}>{tool.name.slice(0, 2).toUpperCase()}</span>}
			</Box>
		</Tooltip>
	);
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub: string }) {
	return (
		<Box bg="bg.default" style={{
			flex: 1, border: "1px solid var(--ax-colors-border-default)",
			borderRadius: 8, padding: 16,
			display: "flex", flexDirection: "column", gap: 8,
			height: 108, overflow: "hidden", minWidth: 0,
		}}>
			<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)" }}>{label}</span>
			<Text style={{ fontFamily: "var(--ax-font-family-headings)", fontSize: 28, fontWeight: 900, lineHeight: "1.04", letterSpacing: "0.56px" }}>{value}</Text>
			<span style={{ fontSize: 12, lineHeight: "1.33", color: "var(--ax-colors-fg-secondary)", whiteSpace: "nowrap" }}>{sub}</span>
		</Box>
	);
}

function ActionCard({ example }: { example: typeof VAU.examples[0] }) {
	return (
		<Box bg="bg.default" style={{
			border: "1px solid var(--ax-colors-border-default)",
			borderRadius: 12, padding: 24,
			display: "flex", flexDirection: "column", gap: 16,
		}}>
			<Box display="flex" gap="12" alignItems="center">
				<Box style={{ width: 64, height: 64, minWidth: 64, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={example.icon} alt={example.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
				</Box>
				<Box display="flex" flexDirection="column" gap="8">
					<Text style={{ fontFamily: "var(--ax-font-family-headings)", fontSize: 20, fontWeight: 600, lineHeight: "1.1", letterSpacing: "0.4px", color: "#202320" }}>
						{example.title}
					</Text>
					<span style={{ ...CAPTION, color: "var(--ax-colors-fg-secondary)" }}>{example.frequency}</span>
				</Box>
			</Box>
			<Box style={{ background: "#f6faf3", borderRadius: 8, padding: 16 }}>
				<Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.43" }}>{example.description}</Text>
			</Box>
		</Box>
	);
}

export default function ChiefOfStaffDetailPage() {
	const router = useRouter();
	const [activePersonality, setActivePersonality] = useState(0);
	const personality = VAU.personalities[activePersonality];

	return (
		<Box display="flex" style={{ height: "100%", minHeight: 0, overflow: "hidden", background: "#F9FCF8" }}>
			{/* Left panel */}
			<Box style={{
				width: 360, minWidth: 360, flexShrink: 0,
				borderRight: "1px solid var(--ax-colors-border-secondary)",
				background: "var(--ax-colors-bg-default)",
				display: "flex", flexDirection: "column",
				overflowY: "auto", padding: 24, gap: 24,
			}}>
				{/* Illustration */}
				<Box style={{
					width: "100%", aspectRatio: "1 / 1",
					borderRadius: 16,
					border: "2px solid #14B8A6",
					background: VAU.cardBg,
					overflow: "hidden",
				}}>
					<Image src={VAU.cardImage} alt={VAU.name} width={312} height={312} unoptimized style={{ width: "100%", height: "100%", objectFit: "contain" }} />
				</Box>

				{/* Personality pills */}
				<Box display="flex" flexDirection="column" gap="12">
					<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)" }}>Explore other personalities</span>
					<Box display="flex" style={{ flexWrap: "wrap", gap: 8 }}>
						{VAU.personalities.map((p, i) => (
							<button
								key={p.label}
								onClick={() => setActivePersonality(i)}
								style={{
									fontFamily: "var(--ax-font-family)",
									fontSize: 13,
									fontWeight: 500,
									padding: "6px 14px",
									borderRadius: 20,
									border: i === activePersonality ? "1.5px solid #202320" : "1.5px solid var(--ax-colors-border-default)",
									background: i === activePersonality ? "#202320" : "transparent",
									color: i === activePersonality ? "white" : "var(--ax-colors-fg-default)",
									cursor: "pointer",
									transition: "all 0.15s ease",
								}}
							>
								{p.label}
							</button>
						))}
					</Box>
				</Box>

				{/* Sample chat */}
				<Box display="flex" flexDirection="column" gap="12">
					<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)" }}>Sample chat</span>
					<Box display="flex" gap="12" style={{ alignItems: "flex-start" }}>
						<Box style={{
							width: 36, height: 36, minWidth: 36, borderRadius: 8,
							background: VAU.avatarBg, overflow: "hidden", flexShrink: 0,
							border: "1px solid var(--ax-colors-border-secondary)",
						}}>
							<Image src={VAU.avatar} alt={VAU.name} width={36} height={36} unoptimized style={{ width: "100%", height: "100%", objectFit: "contain" }} />
						</Box>
						<Box style={{
							background: "var(--ax-colors-bg-secondary)",
							borderRadius: "0 12px 12px 12px",
							padding: "12px 16px",
							flex: 1,
						}}>
							<Text fontSize="sm" color="fg.default" style={{ lineHeight: "1.5" }}>
								{personality.sampleChat}
							</Text>
						</Box>
					</Box>
				</Box>
			</Box>

			{/* Right panel */}
			<Box style={{ flex: 1, overflowY: "auto", padding: "32px 48px 64px" }}>
				{/* Breadcrumb */}
				<Box display="flex" alignItems="center" gap="8" mb="24">
					<Button
						appearance="subtle"
						size="sm"
						icon={<IconChevronLeft size={14} />}
						onClick={() => router.push("/opal/experimental")}
					>
						Directory
					</Button>
					<Text color="fg.tertiary" fontSize="sm">/</Text>
					<Text color="fg.secondary" fontSize="sm">Chief of staff</Text>
				</Box>

				{/* Title + badge */}
				<Text style={{ fontFamily: "var(--ax-font-family-headings)", fontSize: 56, fontWeight: 900, lineHeight: "1.0", letterSpacing: "1.12px", color: "#000", marginBottom: 12 }}>
					{VAU.name}
				</Text>
				<Box mb="16">
					<Badge intent="information" variant="subtle">{VAU.category}</Badge>
				</Box>

				{/* Description */}
				<Text color="fg.secondary" style={{ fontSize: 16, lineHeight: "1.6", maxWidth: 640, display: "block", marginBottom: 24 }}>
					{VAU.description}
				</Text>

				{/* CTA */}
				<Box mb="40">
					<Button
						appearance="primary"
						size="lg"
						icon={<IconArrowRight />}
						iconPosition="end"
						onClick={() => router.push("/opal/experimental/chief-of-staff/enable")}
					>
						Enable for your team
					</Button>
				</Box>

				{/* My pitch */}
				<Box mb="32">
					<Text style={{ fontFamily: "var(--ax-font-family-headings)", fontSize: 22, fontWeight: 700, lineHeight: "1.1", color: "#202320", marginBottom: 4 }}>
						My pitch
					</Text>
					<Text color="fg.secondary" fontSize="md" style={{ marginBottom: 16 }}>What your chief of staff will bring to the table</Text>

					<Box display="flex" gap="12">
						{VAU.pitchStats.map((stat) => (
							<KpiCard key={stat.label} label={stat.label} value={stat.value} sub={stat.sub} />
						))}
					</Box>

					{/* Tool circles row under tools connected */}
					<Box display="flex" alignItems="center" gap="4" mt="12">
						{VAU.tools.map((key, i) => (
							<ToolCircle key={key} toolKey={key} index={i} total={VAU.tools.length} />
						))}
						<Text fontSize="sm" color="fg.tertiary" style={{ marginLeft: 8 }}>+3</Text>
					</Box>
				</Box>

				{/* What I do */}
				<Box>
					<Text style={{ fontFamily: "var(--ax-font-family-headings)", fontSize: 22, fontWeight: 700, lineHeight: "1.1", color: "#202320", marginBottom: 4 }}>
						What I do
					</Text>
					<Text color="fg.secondary" fontSize="md" style={{ marginBottom: 20 }}>The workflows they will run to keep things moving</Text>

					<Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
						{VAU.examples.map((ex) => (
							<ActionCard key={ex.title} example={ex} />
						))}
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

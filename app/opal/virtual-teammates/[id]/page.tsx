"use client";

import { useParams } from "next/navigation";
import { Box, Button, Heading, LabelMenuButton, Menu, MenuContent, MenuTrigger, Text } from "@optiaxiom/react";
import { IconArrowRight, IconComments } from "@optiaxiom/icons";
import Image from "next/image";
import { VAUS } from "@/app/opal/data/vaus";

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 10,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase" as const,
};

const KPIS = [
	{ label: "Time reclaimed", value: "4.5 hrs", sub: "+12% vs last week", subGreen: true },
	{ label: "Fires prevented", value: "9", sub: "Across 4 workstreams", subGreen: false },
	{ label: "Threads closed", value: "14", sub: "−4 min avg response time", subGreen: false },
	{ label: "Commitments tracked", value: "23", sub: "0% dropped", subGreen: false },
];

const APPROVALS = [
	{
		icon: "✉️",
		title: "Draft follow-up email",
		sub: '"Hi Sarah — circling back on the Q3 campaign brief…" · Today, 8:40 AM',
	},
	{
		icon: "📋",
		title: "Update CMP task status",
		sub: 'Mark "Spring launch creative" as in review · Today, 7:55 AM',
	},
	{
		icon: "🔔",
		title: "Send Slack reminder",
		sub: "Ping #marketing about deck review at 3PM · Today, 9:15 AM",
	},
];

const WORK_ITEMS = [
	{
		priority: "Urgent",
		priorityBg: "#FAD9E7",
		priorityColor: "#8B1A3A",
		title: "Q3 Marketing Roadmap Brief",
		source: "Meeting_Prep",
		description:
			"Review before 3 PM meeting today. Deck has 4 outstanding sections needing your input.",
		time: "10:15 AM",
	},
	{
		priority: "Medium Priority",
		priorityBg: "#FFF3C4",
		priorityColor: "#7A4F00",
		title: "Sarah Chen Follow-up Email",
		source: "Email_Triage",
		description: "Approve to send. HITL gated — will not send without your action.",
		time: "9:15 AM",
	},
	{
		priority: "No Rush",
		priorityBg: "var(--ax-colors-bg-secondary)",
		priorityColor: "var(--ax-colors-fg-secondary)",
		title: "Weekly Performance Summary",
		source: "Performance_Digest",
		description:
			"Acknowledge before Friday sync. Covers email open rate, CMP throughput, and campaign deltas.",
		time: "8:00 AM",
	},
];

const URGENCY_OPTIONS = ["All", "Urgent", "Medium Priority", "No Rush"];

function KpiCard({
	label,
	value,
	sub,
	subGreen,
}: {
	label: string;
	value: string;
	sub: string;
	subGreen: boolean;
}) {
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
				gap: 6,
				minWidth: 0,
			}}
		>
			<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)" }}>{label}</span>
			<Text
				style={{
					fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)",
					fontSize: 28,
					fontWeight: 900,
					lineHeight: "1",
					color: "#226b1e",
				}}
			>
				{value}
			</Text>
			<Text fontSize="sm" style={{ color: subGreen ? "#226b1e" : "var(--ax-colors-fg-secondary)" }}>
				{sub}
			</Text>
		</Box>
	);
}

const SECTION_HEADING: React.CSSProperties = {
	fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)",
	fontSize: 18,
	fontWeight: 600,
	lineHeight: "1.2",
	color: "var(--ax-colors-fg-default)",
};

function CountBadge({ count }: { count: number }) {
	return (
		<Box
			style={{
				width: 20,
				height: 20,
				borderRadius: "50%",
				background: "var(--ax-colors-fg-default)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexShrink: 0,
			}}
		>
			<span
				style={{
					color: "var(--ax-colors-bg-default)",
					fontSize: 11,
					fontWeight: 700,
					fontFamily: "Roboto Mono, monospace",
					lineHeight: 1,
				}}
			>
				{count}
			</span>
		</Box>
	);
}

export default function VATOverviewPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);

	if (!vau) return null;

	const name = vau.characterName ?? vau.name;

	return (
		<Box style={{ padding: "32px 40px", maxWidth: 960 }}>
			{/* Page header */}
			<Box mb="32">
				<Box display="flex" alignItems="center" gap="16" mb="16">
					<Box
						style={{
							width: 56,
							height: 56,
							minWidth: 56,
							borderRadius: 8,
							overflow: "hidden",
							backgroundColor: vau.avatarBg,
							flexShrink: 0,
						}}
					>
						<Image
							src={vau.avatar}
							alt={name}
							width={56}
							height={56}
							unoptimized
							style={{ width: "100%", height: "100%", objectFit: "cover" }}
						/>
					</Box>
					<Box style={{ flex: 1, minWidth: 0 }}>
						<Heading level="2" mb="4">
							{name}&apos;s standup
						</Heading>
						<Text color="fg.secondary" fontSize="md">
							What {name}&apos;s been up to and where they still need you.
						</Text>
					</Box>
				</Box>
				<Box display="flex" alignItems="center" gap="8">
					<Button appearance="default" size="md">
						Give {name} a break
					</Button>
					<Button appearance="primary" size="md" addonBefore={<IconComments />}>
						Chat with {name}
					</Button>
				</Box>
			</Box>

			{/* Impact */}
			<Box mb="32">
				<Text style={SECTION_HEADING} mb="4">
					{name}&apos;s Impact
				</Text>
				<Text color="fg.secondary" fontSize="sm" mb="16">
					Here&apos;s how {name}&apos;s been making your week easier.
				</Text>
				<Box style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
					{KPIS.map((kpi) => (
						<KpiCard key={kpi.label} {...kpi} />
					))}
				</Box>
			</Box>

			{/* Needs approvals */}
			<Box mb="32">
				<Box display="flex" alignItems="center" gap="8" mb="4">
					<Text style={SECTION_HEADING}>Needs approvals</Text>
					<CountBadge count={3} />
				</Box>
				<Text color="fg.secondary" fontSize="sm" mb="16">
					A few things {name} can't finish without you.
				</Text>
				<Box
					bg="bg.default"
					style={{
						border: "1px solid var(--ax-colors-border-default)",
						borderRadius: 8,
						overflow: "hidden",
					}}
				>
					{APPROVALS.map((item, i) => (
						<Box
							key={item.title}
							display="flex"
							alignItems="center"
							gap="16"
							style={{
								padding: "16px 20px",
								borderTop:
									i > 0 ? "1px solid var(--ax-colors-border-secondary)" : "none",
								cursor: "pointer",
							}}
						>
							<span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
							<Box style={{ flex: 1, minWidth: 0 }}>
								<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }} mb="2">
									{item.title}
								</Text>
								<Text fontSize="sm" color="fg.secondary">
									{item.sub}
								</Text>
							</Box>
							<IconArrowRight
								style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0, width: 16, height: 16 }}
							/>
						</Box>
					))}
				</Box>
			</Box>

			{/* Randy's work */}
			<Box>
				<Box display="flex" alignItems="center" justifyContent="space-between" mb="4">
					<Box display="flex" alignItems="center" gap="8">
						<Text style={SECTION_HEADING}>{name}&apos;s work</Text>
						<CountBadge count={8} />
					</Box>
					<Box display="flex" alignItems="center" gap="8">
						<Button appearance="subtle" size="sm">‹</Button>
						<Button appearance="subtle" size="sm">›</Button>
						<Menu options={URGENCY_OPTIONS.map((opt) => ({ label: opt }))}>
							<MenuTrigger asChild>
								<LabelMenuButton label="Urgency">All</LabelMenuButton>
							</MenuTrigger>
							<MenuContent />
						</Menu>
					</Box>
				</Box>
				<Text color="fg.secondary" fontSize="sm" mb="16">
					Here&apos;s what {name} got done on your behalf.
				</Text>
				<Box display="flex" gap="16">
					{WORK_ITEMS.map((item) => (
						<Box
							key={item.title}
							bg="bg.default"
							style={{
								flex: 1,
								border: "1px solid var(--ax-colors-border-default)",
								borderRadius: 8,
								padding: 16,
								display: "flex",
								flexDirection: "column",
								gap: 8,
								minWidth: 0,
							}}
						>
							<span
								style={{
									...CAPTION,
									fontSize: 9,
									background: item.priorityBg,
									color: item.priorityColor,
									padding: "2px 8px",
									borderRadius: 32,
									alignSelf: "flex-start",
								}}
							>
								{item.priority}
							</span>
							<Text fontSize="md" color="fg.default" style={{ fontWeight: 600, lineHeight: "1.3" }}>
								{item.title}
							</Text>
							<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)" }}>
								Created by {item.source}
							</span>
							<Text fontSize="sm" color="fg.secondary" style={{ flex: 1, lineHeight: "1.5" }}>
								{item.description}
							</Text>
							<Box display="flex" alignItems="center" justifyContent="space-between">
								<Text fontSize="sm" color="fg.tertiary">
									{item.time}
								</Text>
								<Button appearance="default" size="sm">
									Review
								</Button>
							</Box>
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	);
}

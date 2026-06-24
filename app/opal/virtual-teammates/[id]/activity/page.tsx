"use client";

import { useParams } from "next/navigation";
import { Box, Button, Heading, Text } from "@optiaxiom/react";
import { VAUS } from "@/app/opal/data/vaus";

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 10,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase" as const,
};

const SECTION_HEADING: React.CSSProperties = {
	fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)",
	fontSize: 18,
	fontWeight: 600,
	lineHeight: "1.2",
	color: "var(--ax-colors-fg-default)",
};

const ACTIVITY_ROWS = [
	{ task: "Email triage", runs: 142, pct: 96 },
	{ task: "Meeting prep", runs: 34, pct: 100 },
	{ task: "Follow-ups", runs: 28, pct: 82 },
	{ task: "Status nudges", runs: 19, pct: 95 },
	{ task: "Morning brief", runs: 90, pct: 100 },
	{ task: "Weekly recap", runs: 12, pct: 100 },
];

const QUEUE_ITEMS = [
	{ task: "Meeting Prep", sub: 'Pre-meeting brief: "Q3 Roadmap Review"', status: "next_up", time: "11:00 AM" },
	{ task: "Meeting Prep", sub: 'Pre-meeting brief: "Q3 Roadmap Review"', status: "queued", time: "11:30 AM" },
	{ task: "Meeting Prep", sub: 'Pre-meeting brief: "Q3 Roadmap Review"', status: "queued", time: "12:00 PM" },
	{ task: "Meeting Prep", sub: 'Pre-meeting brief: "Q3 Roadmap Review"', status: "queued", time: "1:00 PM" },
];

const PAST_ITEMS = [
	{
		task: "Meeting Prep Q3",
		sub: 'Pre-meeting brief for "Q3 Roadmap Review"',
		status: "completed",
		time: "11:00 AM",
	},
];

function StatusBadge({ status }: { status: string }) {
	if (status === "next_up") {
		return (
			<span
				style={{
					...CAPTION,
					background: "var(--ax-colors-fg-default)",
					color: "var(--ax-colors-bg-default)",
					padding: "3px 10px",
					borderRadius: 32,
					whiteSpace: "nowrap",
				}}
			>
				Next up
			</span>
		);
	}
	if (status === "completed") {
		return (
			<span style={{ ...CAPTION, color: "#226b1e" }}>Completed</span>
		);
	}
	return (
		<span style={{ ...CAPTION, color: "var(--ax-colors-fg-secondary)" }}>Queued</span>
	);
}

const TABLE_HEADER_CELL: React.CSSProperties = {
	...CAPTION,
	color: "var(--ax-colors-fg-tertiary)",
};

export default function VATActivityPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const name = vau?.characterName ?? vau?.name ?? "Randy";

	return (
		<Box style={{ padding: "32px 40px" }}>
			<Heading level="2" mb="4">
				Activity
			</Heading>
			<Text color="fg.secondary" fontSize="md" mb="32">
				A breakdown of how {name} spends their time.
			</Text>

			{/* Activity Overview */}
			<Box mb="40">
				<Text style={SECTION_HEADING} mb="4">
					Activity Overview
				</Text>
				<Text color="fg.secondary" fontSize="sm" mb="16">
					Where {name}&apos;s effort goes — and what&apos;s trending up.
				</Text>
				<Box
					bg="bg.default"
					style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, overflow: "hidden" }}
				>
					{/* Table header */}
					<Box
						display="flex"
						alignItems="center"
						style={{ padding: "10px 20px", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}
					>
						<span style={{ ...TABLE_HEADER_CELL, flex: 1 }}>Task</span>
						<span style={{ ...TABLE_HEADER_CELL, width: 60, textAlign: "right" as const }}>Runs</span>
						<span style={{ ...TABLE_HEADER_CELL, width: 340, paddingLeft: 20 }}>Handled Solo</span>
					</Box>
					{ACTIVITY_ROWS.map((row) => (
						<Box
							key={row.task}
							display="flex"
							alignItems="center"
							style={{
								padding: "14px 20px",
								borderBottom: "1px solid var(--ax-colors-border-secondary)",
							}}
						>
							<Text fontSize="md" color="fg.default" style={{ flex: 1 }}>
								{row.task}
							</Text>
							<Text
								fontSize="md"
								color="fg.secondary"
								style={{ width: 60, textAlign: "right" as const }}
							>
								{row.runs}
							</Text>
							<Box display="flex" alignItems="center" gap="8" style={{ width: 340, paddingLeft: 20 }}>
								<Box
									style={{
										flex: 1,
										height: 8,
										borderRadius: 4,
										background: "#2D3B2D",
										overflow: "hidden",
									}}
								>
									<Box
										style={{
											width: `${row.pct}%`,
											height: "100%",
											background: "#7EC06B",
											borderRadius: 4,
										}}
									/>
								</Box>
								<Text
									fontSize="sm"
									style={{ color: "#226b1e", fontWeight: 600, width: 36, textAlign: "right" as const }}
								>
									{row.pct}%
								</Text>
							</Box>
						</Box>
					))}
				</Box>
			</Box>

			{/* Queue */}
			<Box mb="40">
				<Text style={SECTION_HEADING} mb="4">
					{name}&apos;s queue
				</Text>
				<Text color="fg.secondary" fontSize="sm" mb="16">
					What&apos;s coming up and when it&apos;ll run.
				</Text>
				<Box
					bg="bg.default"
					style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, overflow: "hidden" }}
				>
					<Box
						display="flex"
						alignItems="center"
						style={{ padding: "10px 20px", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}
					>
						<span style={{ ...TABLE_HEADER_CELL, flex: 1 }}>Task</span>
						<span style={{ ...TABLE_HEADER_CELL, width: 140 }}>Status</span>
						<span style={{ ...TABLE_HEADER_CELL, width: 120 }}>Date/Time</span>
						<span style={{ ...TABLE_HEADER_CELL, width: 180 }}>Actions</span>
					</Box>
					{QUEUE_ITEMS.map((item, i) => (
						<Box
							key={`queue-${i}`}
							display="flex"
							alignItems="center"
							style={{
								padding: "14px 20px",
								borderBottom: "1px solid var(--ax-colors-border-secondary)",
							}}
						>
							<Box style={{ flex: 1, minWidth: 0 }}>
								<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }}>
									{item.task}
								</Text>
								<Text fontSize="sm" color="fg.secondary">
									{item.sub}
								</Text>
							</Box>
							<Box style={{ width: 140 }}>
								<StatusBadge status={item.status} />
							</Box>
							<Text fontSize="md" color="fg.secondary" style={{ width: 120 }}>
								{item.time}
							</Text>
							<Box display="flex" gap="8" style={{ width: 180 }}>
								<Button appearance="default" size="sm">
									View details
								</Button>
								<Button appearance="subtle" size="sm">
									Remove
								</Button>
							</Box>
						</Box>
					))}
				</Box>
			</Box>

			{/* Past 30 days */}
			<Box>
				<Text style={SECTION_HEADING} mb="4">
					Past 30 days
				</Text>
				<Text color="fg.secondary" fontSize="sm" mb="16">
					A record of what {name} handled in the past ~30 days
				</Text>
				<Box
					bg="bg.default"
					style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, overflow: "hidden" }}
				>
					<Box
						display="flex"
						alignItems="center"
						style={{ padding: "10px 20px", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}
					>
						<span style={{ ...TABLE_HEADER_CELL, flex: 1 }}>Task</span>
						<span style={{ ...TABLE_HEADER_CELL, width: 140 }}>Status</span>
						<span style={{ ...TABLE_HEADER_CELL, width: 120 }}>Date/Time</span>
						<span style={{ ...TABLE_HEADER_CELL, width: 180 }}>Actions</span>
					</Box>
					{PAST_ITEMS.map((item, i) => (
						<Box
							key={`past-${i}`}
							display="flex"
							alignItems="center"
							style={{
								padding: "14px 20px",
								borderBottom: "1px solid var(--ax-colors-border-secondary)",
							}}
						>
							<Box style={{ flex: 1, minWidth: 0 }}>
								<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }}>
									{item.task}
								</Text>
								<Text fontSize="sm" color="fg.secondary">
									{item.sub}
								</Text>
							</Box>
							<Box style={{ width: 140 }}>
								<StatusBadge status={item.status} />
							</Box>
							<Text fontSize="md" color="fg.secondary" style={{ width: 120 }}>
								{item.time}
							</Text>
							<Box display="flex" gap="8" style={{ width: 180 }}>
								<Button appearance="default" size="sm">
									View details
								</Button>
							</Box>
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	);
}

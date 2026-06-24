"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
	Box,
	Button,
	EllipsisMenuButton,
	Heading,
	LabelMenuButton,
	Menu,
	MenuContent,
	MenuTrigger,
	Text,
} from "@optiaxiom/react";
import { IconPlus, IconSearch } from "@optiaxiom/icons";
import {
	IconBrandFigma,
	IconBrandSlack,
	IconBrandNotion,
	IconBrandTeams,
} from "@tabler/icons-react";
import { Input } from "@/app/components/Input";
import { VAUS } from "@/app/opal/data/vaus";

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 10,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase" as const,
};

type ConnectorStatus = "connected" | "auth_expired";

type Connector = {
	id: string;
	name: string;
	description: string;
	icon: React.ReactNode;
	status: ConnectorStatus;
};

function ConnectorIcon({ color, children }: { color: string; children: React.ReactNode }) {
	return (
		<Box
			style={{
				width: 32,
				height: 32,
				borderRadius: 8,
				background: color,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexShrink: 0,
				color: "#fff",
			}}
		>
			{children}
		</Box>
	);
}

function TextIcon({ label, color }: { label: string; color: string }) {
	return (
		<Box
			style={{
				width: 32,
				height: 32,
				borderRadius: 8,
				background: color,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexShrink: 0,
			}}
		>
			<span
				style={{
					fontFamily: "Roboto Mono, monospace",
					fontSize: 10,
					fontWeight: 700,
					color: "#fff",
					letterSpacing: "0.04em",
				}}
			>
				{label}
			</span>
		</Box>
	);
}

const CONNECTORS: Connector[] = [
	{
		id: "figma",
		name: "Figma",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		icon: <ConnectorIcon color="#9b59b6"><IconBrandFigma size={18} /></ConnectorIcon>,
		status: "connected",
	},
	{
		id: "notion",
		name: "Notion",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		icon: <ConnectorIcon color="#2d2d2d"><IconBrandNotion size={18} /></ConnectorIcon>,
		status: "auth_expired",
	},
	{
		id: "descript",
		name: "Descript",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		icon: <TextIcon label="De" color="#1a1a2e" />,
		status: "connected",
	},
	{
		id: "gcal",
		name: "Google Calendar",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		icon: <TextIcon label="GC" color="#4285F4" />,
		status: "connected",
	},
	{
		id: "teams",
		name: "Microsoft Teams",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		icon: <ConnectorIcon color="#6264A7"><IconBrandTeams size={18} /></ConnectorIcon>,
		status: "connected",
	},
	{
		id: "m365",
		name: "Microsoft 365",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		icon: <TextIcon label="M3" color="#D83B01" />,
		status: "connected",
	},
	{
		id: "slack",
		name: "Slack",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		icon: <ConnectorIcon color="#4A154B"><IconBrandSlack size={18} /></ConnectorIcon>,
		status: "connected",
	},
	{
		id: "netsuite",
		name: "Netsuite",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		icon: <TextIcon label="NS" color="#009EDB" />,
		status: "connected",
	},
	{
		id: "postman",
		name: "Postman",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		icon: <TextIcon label="Po" color="#FF6C37" />,
		status: "connected",
	},
];

const ELLIPSIS_OPTIONS = [
	{ label: "Edit" },
	{ label: "Reconnect" },
	{ label: "Remove", intent: "danger" as const },
];

const FILTER_OPTIONS = ["All", "Connected", "Auth expired", "Disconnected"];
const SORT_OPTIONS = ["All", "Name A–Z", "Name Z–A", "Recently added"];

export default function VATConnectorsPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const name = vau?.characterName ?? vau?.name ?? "Randy";

	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState("All");
	const [sort, setSort] = useState("All");

	const filtered = CONNECTORS.filter((c) =>
		!query || c.name.toLowerCase().includes(query.toLowerCase()),
	);

	return (
		<Box style={{ padding: "32px 40px" }}>
			<Heading level="2" mb="4">Connectors</Heading>
			<Text color="fg.secondary" fontSize="md" mb="24">
				Who {name} works with and what {name}&apos;s allowed to do.
			</Text>

			{/* Tab */}
			<Box
				display="flex"
				alignItems="center"
				gap="8"
				style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)", marginBottom: 20 }}
			>
				<Box
					display="flex"
					alignItems="center"
					gap="6"
					style={{
						paddingBottom: 10,
						borderBottom: "2px solid var(--ax-colors-fg-default)",
						marginBottom: -1,
						cursor: "pointer",
					}}
				>
					<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }}>Connectors</Text>
					<Box
						style={{
							width: 18,
							height: 18,
							borderRadius: "50%",
							background: "var(--ax-colors-bg-secondary)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<span style={{ ...CAPTION, fontSize: 9, color: "var(--ax-colors-fg-secondary)" }}>
							{filtered.length}
						</span>
					</Box>
				</Box>
			</Box>

			{/* Search + filters */}
			<Box display="flex" alignItems="center" gap="8" mb="24">
				<Box style={{ width: 260 }}>
					<Input
						placeholder="Enter name or description"
						addonBefore={<IconSearch />}
						value={query}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
					/>
				</Box>
				<Menu options={FILTER_OPTIONS.map((o) => ({ label: o, onClick: () => setFilter(o) }))}>
					<MenuTrigger asChild>
						<LabelMenuButton label="Filter by">{filter}</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>
				<Menu options={SORT_OPTIONS.map((o) => ({ label: o, onClick: () => setSort(o) }))}>
					<MenuTrigger asChild>
						<LabelMenuButton label="Sort by">{sort}</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>
				<Box style={{ flex: 1 }} />
				<Button appearance="primary" size="md" addonBefore={<IconPlus />}>
					Add connector
				</Button>
			</Box>

			{/* Grid */}
			<Box
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
					gap: 16,
				}}
			>
				{filtered.map((connector) => (
					<Box
						key={connector.id}
						bg="bg.default"
						style={{
							border: "1px solid var(--ax-colors-border-secondary)",
							borderRadius: 8,
							padding: 16,
							display: "flex",
							flexDirection: "column",
							gap: 8,
						}}
					>
						{/* Header */}
						<Box display="flex" alignItems="center" justifyContent="space-between">
							<Box display="flex" alignItems="center" gap="10">
								{connector.icon}
								<Text fontSize="md" color="fg.default" style={{ fontWeight: 600 }}>
									{connector.name}
								</Text>
							</Box>
							{connector.status === "auth_expired" && (
								<span
									style={{
										...CAPTION,
										fontSize: 9,
										background: "#FAD9E7",
										color: "#8B1A3A",
										padding: "2px 8px",
										borderRadius: 32,
										whiteSpace: "nowrap",
									}}
								>
									Auth expired
								</span>
							)}
						</Box>

						{/* Description */}
						<Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.5", flex: 1 }}>
							{connector.description}
						</Text>

						{/* Footer */}
						<Box display="flex" alignItems="center" justifyContent="flex-end" gap="8">
							{connector.status === "auth_expired" && (
								<Button appearance="default" size="sm">Reconnect</Button>
							)}
							<Menu options={ELLIPSIS_OPTIONS}>
								<MenuTrigger asChild>
									<EllipsisMenuButton size="sm" aria-label="More options" />
								</MenuTrigger>
								<MenuContent />
							</Menu>
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
}

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
import { IconGear, IconSearch } from "@optiaxiom/icons";
import Image from "next/image";
import { Input } from "@/app/components/Input";
import { VAUS } from "@/app/opal/data/vaus";
import { SplitDialog } from "../SplitDialog";

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
	logo: string | null;
	logoBg?: string;
	logoLabel?: string;
	status: ConnectorStatus;
};

function ConnectorLogo({ connector }: { connector: Connector }) {
	if (connector.logo) {
		return (
			<Box
				style={{
					width: 32,
					height: 32,
					borderRadius: 8,
					overflow: "hidden",
					flexShrink: 0,
					background: "#fff",
					border: "1px solid var(--ax-colors-border-secondary)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Image
					src={connector.logo}
					alt={connector.name}
					width={24}
					height={24}
					unoptimized
					style={{ width: 24, height: 24, objectFit: "contain" }}
				/>
			</Box>
		);
	}
	return (
		<Box
			style={{
				width: 32,
				height: 32,
				borderRadius: 8,
				background: connector.logoBg ?? "#333",
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
				{connector.logoLabel ?? connector.name.slice(0, 2)}
			</span>
		</Box>
	);
}

const CONNECTORS: Connector[] = [
	{
		id: "figma",
		name: "Figma",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		logo: "/connectors/figma.svg",
		status: "connected",
	},
	{
		id: "notion",
		name: "Notion",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		logo: "/connectors/notion.png",
		status: "auth_expired",
	},
	{
		id: "descript",
		name: "Descript",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		logo: "/connectors/descript.png",
		status: "connected",
	},
	{
		id: "gcal",
		name: "Google Calendar",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		logo: "/connectors/gcal.png",
		status: "connected",
	},
	{
		id: "teams",
		name: "Microsoft Teams",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		logo: "/connectors/teams.png",
		status: "connected",
	},
	{
		id: "m365",
		name: "Microsoft 365",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		logo: "/connectors/m365.png",
		status: "connected",
	},
	{
		id: "slack",
		name: "Slack",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		logo: null,
		logoBg: "#4A154B",
		logoLabel: "Sl",
		status: "connected",
	},
	{
		id: "netsuite",
		name: "Netsuite",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		logo: "/connectors/netsuite.svg",
		status: "connected",
	},
	{
		id: "postman",
		name: "Postman",
		description: "Drafts compelling copy for emails, ads, landing pages, and social.",
		logo: "/connectors/postman.webp",
		status: "connected",
	},
];

const ELLIPSIS_OPTIONS = [
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
							background: "#000",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<span style={{ ...CAPTION, fontSize: 9, color: "#fff" }}>
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
				<Button
					appearance="primary"
					size="md"
					addonBefore={
						<Box style={{ width: 18, height: 18, borderRadius: 4, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
							<IconGear style={{ color: "#BBFF00", width: 12, height: 12 }} />
						</Box>
					}
				>
					Manage connectors
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
								<ConnectorLogo connector={connector} />
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
								<SplitDialog type="reconnect" name={name}>
									<Button appearance="default" size="sm">Reconnect</Button>
								</SplitDialog>
							)}
							<Menu options={ELLIPSIS_OPTIONS}>
								<MenuTrigger asChild>
									<EllipsisMenuButton appearance="subtle" size="sm" aria-label="More options" />
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

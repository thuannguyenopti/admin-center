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
	Switch,
	Text,
	Tooltip,
} from "@optiaxiom/react";
import { IconCircleCheckSolid, IconGear, IconSearch } from "@optiaxiom/icons";
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

const TABLE_HEADER: React.CSSProperties = {
	...CAPTION,
	color: "var(--ax-colors-fg-tertiary)",
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

type Tool = {
	id: string;
	name: string;
	description: string;
	externalProvider: boolean;
	activeOn: boolean;
	enabledInChat: boolean;
};

const TOOLS: Tool[] = [
	{
		id: "t1",
		name: "Email integration",
		description: "Reads, drafts, and sends email on your behalf via your connected provider.",
		externalProvider: true,
		activeOn: true,
		enabledInChat: false,
	},
	{
		id: "t2",
		name: "Calendar sync",
		description: "Pulls meeting context and blocks time based on your schedule.",
		externalProvider: true,
		activeOn: false,
		enabledInChat: true,
	},
	{
		id: "t3",
		name: "Task manager",
		description: "Creates, assigns, and tracks tasks across connected project tools.",
		externalProvider: true,
		activeOn: false,
		enabledInChat: true,
	},
];

const CONNECTORS: Connector[] = [
	{ id: "figma",   name: "Figma",           description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: "/connectors/figma.svg",    status: "connected" },
	{ id: "notion",  name: "Notion",           description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: "/connectors/notion.png",   status: "auth_expired" },
	{ id: "descript",name: "Descript",         description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: "/connectors/descript.png", status: "connected" },
	{ id: "gcal",    name: "Google Calendar",  description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: "/connectors/gcal.png",     status: "connected" },
	{ id: "teams",   name: "Microsoft Teams",  description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: "/connectors/teams.png",    status: "connected" },
	{ id: "m365",    name: "Microsoft 365",    description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: "/connectors/m365.png",     status: "connected" },
	{ id: "slack",   name: "Slack",            description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: null, logoBg: "#4A154B", logoLabel: "Sl", status: "connected" },
	{ id: "netsuite",name: "Netsuite",         description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: "/connectors/netsuite.svg", status: "connected" },
	{ id: "postman", name: "Postman",          description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: "/connectors/postman.webp", status: "connected" },
];

const ELLIPSIS_OPTIONS = [{ label: "Remove", intent: "danger" as const }];
const FILTER_OPTIONS = ["All", "Connected", "Auth expired", "Disconnected"];
const SORT_OPTIONS = ["All", "Name A–Z", "Name Z–A", "Recently added"];

const SWITCH_TOOLTIP = "In order to edit this feature, you need to switch into Randy's account.";

function ConnectorLogo({ connector }: { connector: Connector }) {
	if (connector.logo) {
		return (
			<Box style={{ width: 32, height: 32, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "var(--ax-colors-bg-default)", border: "1px solid var(--ax-colors-border-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
				<Image src={connector.logo} alt={connector.name} width={24} height={24} unoptimized style={{ width: 24, height: 24, objectFit: "contain" }} />
			</Box>
		);
	}
	return (
		<Box style={{ width: 32, height: 32, borderRadius: 8, background: connector.logoBg ?? "#333", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
			<span style={{ fontFamily: "Roboto Mono, monospace", fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>
				{connector.logoLabel ?? connector.name.slice(0, 2)}
			</span>
		</Box>
	);
}

function ReadOnlySwitch({ checked, onLabel, offLabel }: { checked: boolean; onLabel: string; offLabel: string }) {
	return (
		<Tooltip content={SWITCH_TOOLTIP}>
			<Box style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
				<Switch checked={checked} disabled onCheckedChange={() => {}} />
				<Text fontSize="sm" color={checked ? "fg.secondary" : "fg.tertiary"} style={{ fontWeight: checked ? 500 : 400 }}>
					{checked ? onLabel : offLabel}
				</Text>
			</Box>
		</Tooltip>
	);
}

export default function VATConnectorsPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const name = vau?.characterName ?? vau?.name ?? "Randy";

	const [activeTab, setActiveTab] = useState<"tools" | "connectors">("tools");
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState("All");
	const [sort, setSort] = useState("All");

	const filteredConnectors = CONNECTORS.filter((c) =>
		!query || c.name.toLowerCase().includes(query.toLowerCase()),
	);

	const connectedCount = CONNECTORS.filter((c) => c.status === "connected").length + 1; // include auth_expired in total

	return (
		<Box style={{ padding: "32px 40px" }}>
			<Heading level="2" mb="4">{name}&apos;s {activeTab === "connectors" ? "Connectors" : "Tools"}</Heading>
			<Text color="fg.secondary" fontSize="md" mb="24">
				Who {name} works with and what {name}&apos;s allowed to do.
			</Text>

			{/* Tab bar */}
			<Box display="flex" alignItems="center" gap="0" style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)", marginBottom: 24 }}>
				{(["tools", "connectors"] as const).map((tab) => (
					<Box
						key={tab}
						display="flex"
						alignItems="center"
						gap="6"
						onClick={() => setActiveTab(tab)}
						style={{
							padding: "0 4px 10px",
							marginRight: 20,
							borderBottom: activeTab === tab ? "2px solid var(--ax-colors-fg-default)" : "2px solid transparent",
							marginBottom: -1,
							cursor: "pointer",
						}}
					>
						<Text fontSize="md" color={activeTab === tab ? "fg.default" : "fg.secondary"} style={{ fontWeight: activeTab === tab ? 500 : 400, textTransform: "capitalize" }}>
							{tab === "connectors" ? "Connectors" : "Tools"}
						</Text>
						{tab === "connectors" && (
							<Box style={{ width: 18, height: 18, borderRadius: "50%", background: activeTab === "connectors" ? "var(--ax-colors-fg-default)" : "var(--ax-colors-bg-tertiary, #ccc)", display: "flex", alignItems: "center", justifyContent: "center" }}>
								<span style={{ ...CAPTION, fontSize: 9, color: activeTab === "connectors" ? "var(--ax-colors-bg-default)" : "var(--ax-colors-fg-secondary)" }}>
									{connectedCount}
								</span>
							</Box>
						)}
					</Box>
				))}
			</Box>

			{/* Search + filters row */}
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
			</Box>

			{/* ── Tools tab ── */}
			{activeTab === "tools" && (
				<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, overflow: "hidden" }}>
					{/* Header */}
					<Box display="flex" alignItems="center" style={{ padding: "10px 20px", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
						<span style={{ ...TABLE_HEADER, flex: 1 }}>Name</span>
						<span style={{ ...TABLE_HEADER, width: 160 }}>External Provider</span>
						<span style={{ ...TABLE_HEADER, width: 200 }}>Active Status</span>
						<span style={{ ...TABLE_HEADER, width: 200 }}>Enabled in Chat</span>
					</Box>
					{TOOLS.map((tool, i) => (
						<Box
							key={tool.id}
							display="flex"
							alignItems="center"
							style={{
								padding: "16px 20px",
								borderBottom: i < TOOLS.length - 1 ? "1px solid var(--ax-colors-border-secondary)" : "none",
							}}
						>
							{/* Name */}
							<Box style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
								<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }}>{tool.name}</Text>
								<Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.4", marginTop: 2 }}>{tool.description}</Text>
							</Box>
							{/* External provider */}
							<Box style={{ width: 160 }}>
								<Text fontSize="sm" color="fg.secondary">{tool.externalProvider ? "Yes" : "No"}</Text>
							</Box>
							{/* Active status */}
							<Box style={{ width: 200 }}>
								<ReadOnlySwitch checked={tool.activeOn} onLabel="Active" offLabel="Inactive" />
							</Box>
							{/* Enabled in chat */}
							<Box style={{ width: 200 }}>
								<ReadOnlySwitch checked={tool.enabledInChat} onLabel="Enabled" offLabel="Disabled" />
							</Box>
						</Box>
					))}
				</Box>
			)}

			{/* ── Connectors tab ── */}
			{activeTab === "connectors" && (
				<Box style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
					{filteredConnectors.map((connector) => (
						<Box
							key={connector.id}
							bg="bg.default"
							style={{ border: "1px solid var(--ax-colors-border-secondary)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}
						>
							{/* Header row */}
							<Box display="flex" alignItems="center" justifyContent="space-between">
								<Box display="flex" alignItems="center" gap="10">
									<ConnectorLogo connector={connector} />
									<Text fontSize="md" color="fg.default" style={{ fontWeight: 600 }}>{connector.name}</Text>
								</Box>
								{connector.status === "connected" ? (
									<IconCircleCheckSolid style={{ color: "#226B1E", width: 20, height: 20, flexShrink: 0 }} />
								) : (
									<span style={{ ...CAPTION, fontSize: 9, background: "var(--ax-colors-bg-error-subtle)", color: "var(--ax-colors-fg-error)", padding: "2px 8px", borderRadius: 32, whiteSpace: "nowrap" as const }}>
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
										<Button appearance="danger" size="sm">Reconnect</Button>
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
			)}
		</Box>
	);
}

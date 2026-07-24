"use client";

import {
	Box, Heading, Badge,
	Select, SelectContent, SelectTrigger,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Input } from "@/app/components/Input";
import {
	IconChevronDown,
	IconPuzzlePiece,
	IconBook,
	IconCircleCheck,
	IconSquareUser,
	IconAgent,
	IconGrid2Plus,
} from "@optimizely/axiom-icons";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { VAUS, type VAU } from "@/app/opal/data/vaus";
import { DirectoryCard } from "./DirectoryCard";

// ─── Types ────────────────────────────────────────────────────────────────────

type BrowseType = "virtual-teammates" | "agents" | "skills" | "connectors";

const BROWSE_ITEMS: Array<{ id: BrowseType; label: string; icon: React.ReactNode; count: number }> = [
	{ id: "virtual-teammates", label: "Virtual Teammates", icon: <IconSquareUser size={16} />,  count: VAUS.length },
	{ id: "agents",            label: "Agents",            icon: <IconAgent size={16} />,        count: 48 },
	{ id: "skills",            label: "Skills",            icon: <IconBook size={16} />,         count: 30 },
	{ id: "connectors",        label: "Connectors",        icon: <IconGrid2Plus size={16} />,    count: 28 },
];

// ─── Sidebar shared styles ────────────────────────────────────────────────────

const NAV_ITEM: React.CSSProperties = {
	display: "flex", alignItems: "center", gap: 12,
	height: 40, minHeight: 40, flexShrink: 0,
	padding: "0 12px", borderRadius: 8,
	border: "none", cursor: "pointer", width: "100%", textAlign: "left",
	fontFamily: "inherit", background: "transparent", transition: "background 0.1s",
};

const LABEL_STYLE: React.CSSProperties = {
	flex: 1,
	fontSize: "var(--ax-fontSize-md-fontSize, 14px)",
	lineHeight: 1.43,
	letterSpacing: "0.28px",
	fontWeight: 500,
	color: "var(--ax-colors-fg-secondary)",
};

function GroupHeader({ label, collapsed, onToggle }: { label: string; collapsed: boolean; onToggle: () => void }) {
	return (
		<button onClick={onToggle} style={{
			display: "flex", alignItems: "center", gap: 8,
			padding: "8px 12px", width: "100%", border: "none",
			background: "transparent", cursor: "pointer", fontFamily: "inherit",
			marginTop: 4, flexShrink: 0,
		}}>
			<span style={{
				flex: 1, textAlign: "left",
				fontSize: 12,
				color: "var(--ax-colors-fg-tertiary)",
				fontWeight: 400,
				letterSpacing: "0.36px",
				lineHeight: 1.25,
				textTransform: "uppercase",
			}}>{label}</span>
			<IconChevronDown size={14} style={{
				color: "var(--ax-colors-fg-tertiary)",
				flexShrink: 0,
				transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
				transition: "transform 0.15s",
			}} />
		</button>
	);
}

// ─── Filter options ───────────────────────────────────────────────────────────

const ALL_SKILLS = ["All", ...Array.from(new Set(VAUS.flatMap((v) => v.tags.map((t) => t.label))))];
const ALL_STATUSES = ["All", "Active", "Draft"];


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DirectoryPage() {
	const [query, setQuery] = useState("");
	const [browseType, setBrowseType] = useState<BrowseType>("virtual-teammates");
	const [installedOnly, setInstalledOnly] = useState(false);
	const [skillFilter, setSkillFilter] = useState("All");
	const [statusFilter, setStatusFilter] = useState("All");
	const [browseCollapsed, setBrowseCollapsed] = useState(false);
	const [quickCollapsed, setQuickCollapsed] = useState(false);
	const router = useRouter();

	const filtered = useMemo(() => {
		if (browseType !== "virtual-teammates") return [];
		const q = query.trim().toLowerCase();
		return VAUS.filter((vau) => {
			const matchesInstalled = !installedOnly || vau.status === "active";
			const matchesQuery =
				!q ||
				vau.name.toLowerCase().includes(q) ||
				vau.templateName.toLowerCase().includes(q) ||
				vau.description.toLowerCase().includes(q) ||
				vau.tags.some((t) => t.label.toLowerCase().includes(q));
			const matchesSkill =
				skillFilter === "All" || vau.tags.some((t) => t.label === skillFilter);
			const matchesStatus =
				statusFilter === "All" || vau.status === statusFilter.toLowerCase();
			return matchesInstalled && matchesQuery && matchesSkill && matchesStatus;
		});
	}, [query, browseType, installedOnly, skillFilter, statusFilter]);

	const handleSelect = (vau: VAU) => {
		router.push(`/opal/directory/${vau.id}`);
	};

	return (
		<Box display="flex" h="full" overflow="hidden">
			{/* Filter sidebar */}
			<Box style={{
				width: 272, flexShrink: 0,
				height: "100%", display: "flex", flexDirection: "column",
				overflowY: "auto", paddingBottom: 16, gap: 4,
				background: "var(--ax-colors-bg-default)",
				borderRight: "1px solid var(--ax-colors-border-secondary)",
			}}>
				{/* Browse Directory */}
				<GroupHeader
					label="Browse Directory"
					collapsed={browseCollapsed}
					onToggle={() => setBrowseCollapsed((v) => !v)}
				/>
				{!browseCollapsed && BROWSE_ITEMS.map(({ id, label, icon, count }) => {
					const isActive = browseType === id;
					return (
						<button
							key={id}
							onClick={() => { setBrowseType(id); setInstalledOnly(false); }}
							style={{
								...NAV_ITEM,
								background: isActive ? "var(--ax-colors-bg-secondary)" : "transparent",
							}}
						>
							<Box style={{ color: isActive ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)", lineHeight: 0, flexShrink: 0 }}>
								{icon}
							</Box>
							<span style={{ ...LABEL_STYLE, color: isActive ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)" }}>
								{label}
							</span>
							<Badge intent="information">{count}</Badge>
						</button>
					);
				})}

				{/* Quick Filters */}
				<GroupHeader
					label="Quick Filters"
					collapsed={quickCollapsed}
					onToggle={() => setQuickCollapsed((v) => !v)}
				/>
				{!quickCollapsed && (
					<button
						onClick={() => setInstalledOnly((v) => !v)}
						style={{
							...NAV_ITEM,
							background: installedOnly ? "var(--ax-colors-bg-secondary)" : "transparent",
						}}
					>
						<Box style={{ color: installedOnly ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)", lineHeight: 0, flexShrink: 0 }}>
							<IconCircleCheck size={16} />
						</Box>
						<span style={{ ...LABEL_STYLE, color: installedOnly ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)" }}>
							Installed
						</span>
					</button>
				)}
			</Box>

			{/* Main content */}
			<Box display="flex" flexDirection="column" gap="24" px="32" py="24" overflow="auto" style={{ flex: 1 }}>
				<Box display="flex" flexDirection="column" gap="8">
					<Heading level="1" fontSize="2xl">Directory</Heading>
					<Text fontSize="sm" color="fg.secondary">
						Browse and add AI virtual teammates your team can collaborate with.
					</Text>
				</Box>

				<Box display="flex" alignItems="center" gap="12">
					<Box style={{ width: 320 }}>
						<Input
							placeholder="Enter name or description"
							value={query}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
						/>
					</Box>
					<Select
						options={ALL_SKILLS.map((s) => ({ label: s, value: s }))}
						value={skillFilter}
						onValueChange={(val) => setSkillFilter(val)}
					>
						<SelectTrigger placeholder="Skill" />
						<SelectContent />
					</Select>
					<Select
						options={ALL_STATUSES.map((s) => ({ label: s, value: s }))}
						value={statusFilter}
						onValueChange={(val) => setStatusFilter(val)}
					>
						<SelectTrigger placeholder="Status" />
						<SelectContent />
					</Select>
				</Box>

				{browseType !== "virtual-teammates" ? (
					<Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap="8" style={{ flex: 1, opacity: 0.4 }}>
						<Text fontSize="lg" fontWeight="500" color="fg.secondary">
							{BROWSE_ITEMS.find((b) => b.id === browseType)?.label} coming soon
						</Text>
					</Box>
				) : filtered.length === 0 ? (
					<Text color="fg.tertiary">No teammates match your search.</Text>
				) : (
					<Box style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
						gap: "24px",
					}}>
						{filtered.map((vau) => (
							<DirectoryCard key={vau.id} vau={vau} onSelect={handleSelect} />
						))}
					</Box>
				)}
			</Box>
		</Box>
	);
}

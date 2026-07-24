"use client";

import { useState, useMemo, useRef, Fragment } from "react";
import { useParams } from "next/navigation";
import { Pill } from "@optiaxiom/react/unstable";
import {
	Badge,
	Box,
	Button,
	EllipsisMenuButton,
	Heading,
	LabelMenuButton,
	Menu,
	MenuContent,
	MenuTrigger,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Switch,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	Text,
	Tooltip,
} from "@optiaxiom/react";
import { IconAngleDown, IconCircleCheckSolid, IconGear, IconGlobe, IconPen, IconSearch, IconUser, IconUserGroup, IconUsers } from "@optiaxiom/icons";
import { Input } from "@/app/components/Input";
import Image from "next/image";
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

const SECTION_HEADING: React.CSSProperties = {
	fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)",
	fontSize: 16,
	fontWeight: 600,
	lineHeight: "1.2",
	color: "var(--ax-colors-fg-default)",
};

const CARD: React.CSSProperties = {
	background: "var(--ax-colors-bg-default)",
	border: "1px solid var(--ax-colors-border-default)",
	borderRadius: 8,
	padding: "16px 20px",
	marginBottom: 12,
};

// ─── Users ───────────────────────────────────────────────────────────────────

const ALL_USERS = [
	{ name: "Ana Shuleva",   avatar: "/avatar-user.png" },
	{ name: "Sarah Chen",    avatar: null },
	{ name: "Jordan Lee",    avatar: null },
	{ name: "Priya Patel",   avatar: null },
	{ name: "Alex Wu",       avatar: null },
	{ name: "Marcus Rivera", avatar: null },
	{ name: "Keiko Tanaka",  avatar: "/avatar-80.jpg" },
	{ name: "Lena Fischer",  avatar: null },
	{ name: "Omar Hassan",   avatar: null },
	{ name: "Chloe Martin",  avatar: "/avatar-125.jpg" },
	{ name: "Darius Webb",   avatar: null },
	{ name: "Sofia Rossi",   avatar: null },
];

function InitialsAvatar({ name, size = 28 }: { name: string; size?: number }) {
	const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
	return (
		<Box style={{ width: size, height: size, borderRadius: "50%", background: "#D8E4CB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
			<span style={{ ...CAPTION, fontSize: size <= 20 ? 8 : 9, color: "var(--ax-colors-fg-default)", lineHeight: 1 }}>
				{initials}
			</span>
		</Box>
	);
}

function Avatar({ user, size = 28 }: { user: { name: string; avatar: string | null }; size?: number }) {
	if (user.avatar) {
		return (
			<Box style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
				<Image src={user.avatar} alt={user.name} width={size} height={size} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
			</Box>
		);
	}
	return <InitialsAvatar name={user.name} size={size} />;
}

function UserChip({ user, onRemove }: { user: { name: string; avatar: string | null }; onRemove?: () => void }) {
	return (
		<Pill onDismiss={onRemove}>
			<Box asChild display="inline-flex" alignItems="center" gap="6">
				<span>
					<Avatar user={user} size={16} />
					{user.name}
				</span>
			</Box>
		</Pill>
	);
}

type Section = "reports-to" | "works-with";

function AddUserPopover({
	reportsTo,
	worksWith,
	onAdd,
}: {
	reportsTo: typeof ALL_USERS;
	worksWith: typeof ALL_USERS;
	onAdd: (user: typeof ALL_USERS[0], section: Section) => void;
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [pending, setPending] = useState<typeof ALL_USERS[0] | null>(null);

	const allExisting = [...reportsTo, ...worksWith];
	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return ALL_USERS.filter((u) => !allExisting.find((e) => e.name === u.name) && (!q || u.name.toLowerCase().includes(q)));
	}, [query, allExisting]);

	const reset = () => { setQuery(""); setPending(null); };

	return (
		<Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
			<PopoverTrigger asChild>
				<Button appearance="default" size="md">Add user</Button>
			</PopoverTrigger>
			<PopoverContent align="end" style={{ width: 300, padding: 0, overflow: "hidden" }}>
				{pending ? (
					<Box>
						<Box display="flex" alignItems="center" gap="12" style={{ padding: "14px 16px", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
							<Avatar user={pending} size={32} />
							<Box style={{ flex: 1, minWidth: 0 }}>
								<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }}>{pending.name}</Text>
								<Text fontSize="sm" color="fg.tertiary">Add to…</Text>
							</Box>
							<Box onClick={() => setPending(null)} style={{ cursor: "pointer", color: "var(--ax-colors-fg-tertiary)", padding: 4 }}>
								<svg width="10" height="10" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
							</Box>
						</Box>
						{(["reports-to", "works-with"] as Section[]).map((s) => (
							<Box
								key={s}
								display="flex"
								alignItems="center"
								gap="12"
								className="vat-nav-item"
								onClick={() => { onAdd(pending, s); setOpen(false); reset(); }}
								style={{ padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}
							>
								<Box style={{ width: 32, height: 32, borderRadius: 8, background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
									{s === "reports-to"
										? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M2 12c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
										: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="4.5" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/><circle cx="9.5" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M1 12c0-2.209 1.567-4 3.5-4M13 12c0-2.209-1.567-4-3.5-4M7 8c1.933 0 3.5 1.791 3.5 4H3.5C3.5 9.791 5.067 8 7 8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
									}
								</Box>
								<Box>
									<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }}>
										{s === "reports-to" ? "Reports to" : "Works with"}
									</Text>
									<Text fontSize="sm" color="fg.tertiary">
										{s === "reports-to" ? "Can direct, review and approve" : "Collaborates and receives updates"}
									</Text>
								</Box>
							</Box>
						))}
					</Box>
				) : (
					<Box>
						<Box style={{ padding: "10px 12px 8px", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
							<Input
								placeholder="Search people…"
								addonBefore={<IconSearch />}
								value={query}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
								autoFocus
							/>
						</Box>
						<Box style={{ maxHeight: 260, overflowY: "auto" }}>
							{filtered.length === 0 ? (
								<Box style={{ padding: "20px 16px", textAlign: "center" }}>
									<Text fontSize="sm" color="fg.tertiary">No users found</Text>
								</Box>
							) : (
								filtered.map((user) => (
									<Box
										key={user.name}
										display="flex"
										alignItems="center"
										gap="10"
										onClick={() => setPending(user)}
										className="vat-nav-item"
										style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}
									>
										<Avatar user={user} size={28} />
										<Text fontSize="md" color="fg.default" style={{ flex: 1 }}>{user.name}</Text>
									</Box>
								))
							)}
						</Box>
					</Box>
				)}
			</PopoverContent>
		</Popover>
	);
}

const INITIAL_REPORTS_TO: { name: string; avatar: string | null }[] = [{ name: "Mona Chen", avatar: null }];
const INITIAL_WORKS_WITH: { name: string; avatar: string | null }[] = [
	{ name: "Ana Shuleva", avatar: "/avatar-user.png" },
	{ name: "Sarah Chen",  avatar: null },
	{ name: "Jordan Lee",  avatar: null },
	{ name: "Priya Patel", avatar: null },
	{ name: "Alex Wu",     avatar: null },
];

// ─── Guardrails ──────────────────────────────────────────────────────────────

type GuardrailTag = { label: string; snippet: string };

const TIER_TAGS: Record<"principal" | "team" | "org" | "public", GuardrailTag[]> = {
	principal: [],
	team: [
		{ label: "Finances & salary",   snippet: "Do not discuss personal finances, salary, compensation details, or any private financial information." },
		{ label: "Private convos",       snippet: "Do not share private conversations, personal notes, or confidential 1:1 content." },
		{ label: "Emails",               snippet: "Do not draft, send, or access email content without explicit approval from the user." },
		{ label: "Health & personal",    snippet: "Do not discuss personal health, medical history, or private personal matters." },
		{ label: "Performance reviews",  snippet: "Do not share performance review content, ratings, feedback, or promotion discussions." },
		{ label: "Calendar details",     snippet: "Do not share calendar contents, meeting details, or scheduling information without approval." },
		{ label: "Legal matters",        snippet: "Do not discuss legal matters, litigation, compliance issues, or regulatory details." },
	],
	org: [
		{ label: "Internal info",        snippet: "Do not share internal company information, strategies, financial data, or internal communications." },
		{ label: "Team convos",          snippet: "Do not share team meeting notes, internal discussions, or project communications." },
		{ label: "Projects",             snippet: "Do not share project details, roadmaps, timelines, or work-in-progress information." },
		{ label: "Headcount",            snippet: "Do not discuss team headcount, hiring plans, layoffs, or org structure changes." },
		{ label: "Product roadmap",      snippet: "Do not share unannounced product features, development plans, or roadmap details." },
		{ label: "Customer data",        snippet: "Do not share customer names, account details, usage data, or any customer-specific information." },
		{ label: "Partnerships & deals", snippet: "Do not discuss partnership details, vendor relationships, contract terms, or commercial agreements." },
		{ label: "Financials",           snippet: "Do not share revenue figures, cost data, budgets, or any non-public financial information." },
	],
	public: [
		{ label: "Internal info",    snippet: "Do not share any internal company information. Limit all responses to publicly available information only." },
		{ label: "Financials",       snippet: "Do not share revenue figures, cost data, or any non-public financial information." },
		{ label: "Personnel",        snippet: "Do not discuss individual employees, their roles, compensation, or personal information." },
		{ label: "Strategic plans",  snippet: "Do not share business strategies, competitive intelligence, acquisition plans, or future direction." },
		{ label: "Unreleased work",  snippet: "Do not reference unreleased products, features, campaigns, or content." },
	],
};

type TierId = "principal" | "team" | "org" | "public";
type TierState = { rules: string[]; tags: string[] };

type TierConfig = {
	id: TierId;
	label: string;
	readOnly: boolean;
	icon: React.ReactNode;
};

const TIER_CONFIGS: TierConfig[] = [
	{ id: "principal", label: "Primary user", readOnly: true,  icon: <IconUser      style={{ width: 16, height: 16, flexShrink: 0 }} /> },
	{ id: "team",      label: "Team member",  readOnly: false, icon: <IconUsers     style={{ width: 16, height: 16, flexShrink: 0 }} /> },
	{ id: "org",       label: "Org member",   readOnly: false, icon: <IconUserGroup style={{ width: 16, height: 16, flexShrink: 0 }} /> },
	{ id: "public",    label: "Public",       readOnly: false, icon: <IconGlobe     style={{ width: 16, height: 16, flexShrink: 0 }} /> },
];

const INITIAL_TIER_STATES: Record<TierId, TierState> = {
	principal: { rules: [], tags: [] },
	team: {
		tags: ["Finances & salary", "Private convos", "Emails"],
		rules: [
			"Do not discuss personal finances, salary, compensation details, or any private financial information.",
			"Do not share private conversations, personal notes, or confidential 1:1 content.",
			"Do not draft, send, or access email content without explicit approval from the user.",
		],
	},
	org: {
		tags: ["Internal info", "Team convos", "Projects"],
		rules: [
			"Do not share internal company information, strategies, financial data, or internal communications.",
			"Do not share team meeting notes, internal discussions, or project communications.",
			"Do not share project details, roadmaps, timelines, or work-in-progress information.",
			"I can only share publicly available project information.",
		],
	},
	public: {
		tags: ["Internal info"],
		rules: [
			"Do not share any internal company information. Limit all responses to publicly available information only.",
		],
	},
};

const CHIP_LABEL: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 10,
	fontWeight: 400,
	letterSpacing: "0.08em",
	textTransform: "uppercase" as const,
};

type CustomGuardrail = {
	id: string;
	text: string;
	appliesTo: TierId | "all";
	category: string | null;
};

const TIER_LABEL: Record<TierId | "all", string> = {
	all: "All tiers",
	principal: "Primary user",
	team: "Team member",
	org: "Org member",
	public: "Public",
};

const QUICK_ADD_SUGGESTIONS = [
	"Never disclose ongoing legal disputes or litigation",
	"Don't share salary, equity, or compensation details",
	"Don't reveal unannounced product features or roadmap",
	"Avoid sharing internal headcount or org change plans",
	"Never reference customer data or account details",
	"Don't discuss acquisition or partnership plans",
	"Don't share performance review content or ratings",
];

const CATEGORY_OPTIONS = ["Finance", "Legal", "HR & Personnel", "Strategic", "Confidential", "Behavioral"];

function inferCategory(text: string): string | null {
	const t = text.toLowerCase();
	if (/salary|equity|compensation|financial|finance|budget|revenue|cost/.test(t)) return "Finance";
	if (/legal|litigation|dispute|lawsuit|contract/.test(t)) return "Legal";
	if (/headcount|org change|performance review|hr|personnel|hiring/.test(t)) return "HR & Personnel";
	if (/acquisition|partnership|roadmap|product feature|unannounced|strategic/.test(t)) return "Strategic";
	if (/customer data|account detail|confidential|private/.test(t)) return "Confidential";
	return null;
}

const APPLIES_TO_OPTIONS: { value: TierId | "all"; label: string }[] = [
	{ value: "all",       label: "All tiers" },
	{ value: "team",      label: "Team member" },
	{ value: "org",       label: "Org member" },
	{ value: "public",    label: "Public" },
];

function GuardrailsSection({ name, customGuardrails = [], onRemoveCustom, onAddCustom }: { name: string; customGuardrails?: CustomGuardrail[]; onRemoveCustom?: (id: string) => void; onAddCustom?: (text: string, appliesTo: TierId, category: string | null) => void }) {
	const [savedStates, setSavedStates] = useState<Record<TierId, TierState>>(INITIAL_TIER_STATES);
	const [expandedTier, setExpandedTier] = useState<TierId | null>(null);
	const [editingTier, setEditingTier] = useState<TierId | null>(null);
	const [inputValue, setInputValue] = useState("");
	const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const toggleExpand = (tierId: TierId) => {
		setExpandedTier((prev) => {
			if (prev === tierId) { setEditingTier(null); return null; }
			return tierId;
		});
	};

	const startEditing = (tierId: TierId, e: React.MouseEvent) => {
		e.stopPropagation();
		setExpandedTier(tierId);
		setEditingTier(tierId);
		setInputValue(savedStates[tierId].rules.join("\n\n"));
		setUsedSuggestions(new Set());
	};

	const commitEdit = (tierId: TierId) => {
		const rules = inputValue.split("\n").map((l) => l.trim()).filter(Boolean);
		setSavedStates((prev) => ({ ...prev, [tierId]: { ...prev[tierId], rules } }));
		setEditingTier(null);
		setInputValue("");
	};

	const accordionTiers = TIER_CONFIGS.filter((t) => !t.readOnly);

	return (
		<Box style={CARD}>
			{/* Primary user — flat, no accordion, distinct background */}
			<Box
				display="flex"
				alignItems="start"
				gap="10"
				style={{ padding: "8px 0", borderRadius: 6, marginBottom: 8 }}
			>
				<Box style={{ color: "var(--ax-colors-fg-secondary)", flexShrink: 0, marginTop: 3 }}>
					<IconUser style={{ width: 16, height: 16 }} />
				</Box>
				<Box>
					<Text fontSize="md" color="fg.default" style={{ fontWeight: 500, display: "block", marginBottom: 4 }}>Primary user</Text>
					<Text fontSize="sm" color="fg.tertiary">{name} shares everything with principals. No blocked topics.</Text>
				</Box>
			</Box>

			{/* Custom guardrails added by the user */}
			{customGuardrails.length > 0 && (
				<>
					<Box style={{ height: 1, background: "var(--ax-colors-border-secondary)" }} />
					<Box style={{ padding: "10px 0" }}>
						<Box style={{ display: "flex", flexDirection: "column", gap: 10 }}>
							{customGuardrails.map((g) => (
								<Box key={g.id} display="flex" alignItems="start" justifyContent="space-between" gap="8">
									<Box display="flex" alignItems="start" gap="8" style={{ flex: 1, minWidth: 0 }}>
										<Box style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--ax-colors-fg-tertiary)", flexShrink: 0, marginTop: 7 }} />
										<Box>
											<Text fontSize="sm" color="fg.secondary" style={{ display: "block" }}>{g.text}</Text>
											<Box display="flex" gap="4" style={{ marginTop: 5 }}>
												{g.appliesTo !== "all" && (
													<Badge variant="subtle" intent="information" style={CHIP_LABEL}>{TIER_LABEL[g.appliesTo]}</Badge>
												)}
												{g.category && (
													<Badge variant="subtle" style={CHIP_LABEL}>{g.category}</Badge>
												)}
											</Box>
										</Box>
									</Box>
									<button
										onClick={() => onRemoveCustom?.(g.id)}
										style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--ax-colors-fg-tertiary)", display: "flex", alignItems: "center", flexShrink: 0, marginTop: 2 }}
										aria-label="Remove guardrail"
									>
										<svg width="10" height="10" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
									</button>
								</Box>
							))}
						</Box>
					</Box>
				</>
			)}

			<Box style={{ height: 1, background: "var(--ax-colors-border-secondary)" }} />

			{/* Accordion tiers: Team member, Org member, Public */}
			{accordionTiers.map((tier, i) => {
				const isExpanded = expandedTier === tier.id;

				return (
					<Fragment key={tier.id}>
						{i > 0 && <Box style={{ height: 1, background: "var(--ax-colors-border-secondary)" }} />}

						{/* Accordion header row */}
						<Box
							display="flex"
							alignItems="start"
							onClick={() => toggleExpand(tier.id)}
							style={{ padding: "10px 0", cursor: "pointer", userSelect: "none" as const }}
						>
							{/* Left: icon */}
							<Box style={{ color: "var(--ax-colors-fg-secondary)", flexShrink: 0, marginRight: 10, marginTop: 3 }}>
								{tier.icon}
							</Box>
							{/* Middle: label + chips on separate line */}
							<Box style={{ flex: 1, minWidth: 0 }}>
								<Text fontSize="md" color="fg.default" style={{ fontWeight: 500, display: "block", marginBottom: 4 }}>{tier.label}</Text>
							</Box>
							{/* Right: edit + chevron */}
							<Box style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginLeft: 8 }}>
								<Button
									appearance="subtle"
									size="sm"
									icon={<IconPen />}
									aria-label="Edit"
									onClick={(e: React.MouseEvent) => startEditing(tier.id, e)}
								/>
								<Button
									appearance="subtle"
									size="sm"
									icon={<IconAngleDown style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms ease" }} />}
									aria-label={isExpanded ? "Collapse" : "Expand"}
								/>
							</Box>
						</Box>

						{/* Expandable content */}
						<Box
							style={{
								overflow: "hidden",
								maxHeight: isExpanded ? 800 : 0,
								opacity: isExpanded ? 1 : 0,
								transition: "max-height 220ms ease, opacity 180ms ease",
							}}
						>
							<Box style={{ paddingBottom: 12 }}>
								{editingTier === tier.id ? (
									<Box>
										<Box style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
											{QUICK_ADD_SUGGESTIONS.filter((s) => !usedSuggestions.has(s)).slice(0, 4).map((s) => (
												<button
													key={s}
													onClick={() => {
														setInputValue((v) => v ? v + "\n" + s : s);
														setUsedSuggestions((prev) => new Set([...prev, s]));
														setTimeout(() => {
															if (textareaRef.current) {
																textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
															}
														}, 0);
													}}
													style={{
														display: "inline-flex", alignItems: "center", gap: 4,
														padding: "4px 10px", borderRadius: 99,
														background: "transparent",
														border: "1px solid var(--ax-colors-border-default)",
														cursor: "pointer", fontSize: 12,
														color: "var(--ax-colors-fg-secondary)", fontFamily: "inherit",
													}}
													onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--ax-colors-bg-secondary)"; }}
													onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
												>
													+ {s}
												</button>
											))}
										</Box>
										<textarea
											ref={textareaRef}
											autoFocus
											value={inputValue}
											onChange={(e) => setInputValue(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Escape") { setEditingTier(null); setInputValue(""); }
											}}
											style={{
												width: "100%", minHeight: 120, padding: "10px 12px",
												border: "1px solid var(--ax-colors-border-default)",
												borderRadius: 6, background: "var(--ax-colors-bg-input)",
												fontSize: 14, color: "var(--ax-colors-fg-default)",
												fontFamily: "inherit", outline: "none", resize: "vertical",
												lineHeight: 1.6, boxSizing: "border-box" as const,
											}}
										/>
										<Box display="flex" gap="8" style={{ marginTop: 10 }}>
											<Button appearance="primary" size="sm" onClick={() => commitEdit(tier.id)}>Save</Button>
											<Button appearance="subtle" size="sm" onClick={() => { setEditingTier(null); setInputValue(""); }}>Cancel</Button>
										</Box>
									</Box>
								) : (
									<Box style={{ display: "flex", flexDirection: "column", gap: 6 }}>
										{savedStates[tier.id].rules.map((rule, rIdx) => (
											<Box key={rIdx} display="flex" alignItems="start" gap="8">
												<Box style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--ax-colors-fg-tertiary)", flexShrink: 0, marginTop: 6 }} />
												<Text fontSize="sm" color="fg.secondary">{rule}</Text>
											</Box>
										))}
									</Box>
								)}
							</Box>
						</Box>
					</Fragment>
				);
			})}
		</Box>
	);
}

// ─── Connectors tab data ─────────────────────────────────────────────────────

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
		name: "events_insert",
		description: "Creates a new event on the specified calendar.",
		externalProvider: true,
		activeOn: true,
		enabledInChat: false,
	},
	{
		id: "t2",
		name: "events_update",
		description: "Updates an existing event, replacing all properties with new values.",
		externalProvider: true,
		activeOn: false,
		enabledInChat: true,
	},
	{
		id: "t3",
		name: "events_delete",
		description: "Deletes a specific event from the calendar.",
		externalProvider: true,
		activeOn: false,
		enabledInChat: true,
	},
];

const CONNECTORS: Connector[] = [
	{ id: "figma",    name: "Figma",           description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: "/connectors/figma.svg",    status: "connected" },
	{ id: "notion",   name: "Notion",           description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: "/connectors/notion.png",   status: "auth_expired" },
	{ id: "descript", name: "Descript",         description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: "/connectors/descript.png", status: "connected" },
	{ id: "gcal",     name: "Google Calendar",  description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: "/connectors/gcal.png",     status: "connected" },
	{ id: "teams",    name: "Microsoft Teams",  description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: "/connectors/teams.png",    status: "connected" },
	{ id: "m365",     name: "Microsoft 365",    description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: "/connectors/m365.png",     status: "connected" },
	{ id: "slack",    name: "Slack",            description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: null, logoBg: "#4A154B", logoLabel: "Sl", status: "connected" },
	{ id: "netsuite", name: "Netsuite",         description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: "/connectors/netsuite.svg", status: "connected" },
	{ id: "postman",  name: "Postman",          description: "Drafts compelling copy for emails, ads, landing pages, and social.", logo: "/connectors/postman.webp", status: "connected" },
];

const ELLIPSIS_OPTIONS = [{ label: "Remove", intent: "danger" as const }];
const FILTER_OPTIONS = ["All", "Connected", "Auth expired", "Disconnected"];
const SORT_OPTIONS = ["All", "Name A–Z", "Name Z–A", "Recently added"];

const SWITCH_TOOLTIP = "In order to edit this feature, you need to switch into Randy's account.";

function ConnectorLogo({ connector }: { connector: Connector }) {
	if (connector.logo) {
		return (
			<Box style={{ width: 32, height: 32, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#fff", border: "1px solid var(--ax-colors-border-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function VATPermissionsPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const name = vau?.characterName ?? vau?.name ?? "Randy";

	const [reportsTo, setReportsTo] = useState(INITIAL_REPORTS_TO);
	const [worksWith, setWorksWith] = useState(INITIAL_WORKS_WITH);

	const [customGuardrails, setCustomGuardrails] = useState<CustomGuardrail[]>([]);

	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState("All");
	const [sort, setSort] = useState("All");

	const [toolQuery, setToolQuery] = useState("");
	const [toolFilter, setToolFilter] = useState("All");
	const [toolSort, setToolSort] = useState("All");

	const filteredConnectors = CONNECTORS.filter((c) =>
		!query || c.name.toLowerCase().includes(query.toLowerCase()),
	);

	const filteredTools = TOOLS.filter((t) =>
		!toolQuery || t.name.toLowerCase().includes(toolQuery.toLowerCase()) || t.description.toLowerCase().includes(toolQuery.toLowerCase()),
	);

	return (
		<Box style={{ padding: "32px 40px" }}>
			<Heading level="1" mb="4">Tools</Heading>
			<Text color="fg.secondary" fontSize="lg" mb="24">{"What " + name + " has access to and what's off limits"}</Text>

			<Tabs defaultValue="connectors">
				<TabsList mb="24">
					<TabsTrigger value="connectors">
						<Box asChild display="inline-flex" alignItems="center" gap="6">
							<span>
								Connectors
								<svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
									<circle cx="7" cy="7" r="7" fill="#8F4764" />
									<rect x="6.25" y="3.5" width="1.5" height="5" rx="0.75" fill="white" />
									<circle cx="7" cy="10.5" r="0.75" fill="white" />
								</svg>
							</span>
						</Box>
					</TabsTrigger>
					<TabsTrigger value="tools">Tools</TabsTrigger>
				</TabsList>

				{/* ── Connectors tab ── */}
				<TabsContent value="connectors">
					<Box display="flex" alignItems="center" gap="8" mb="24">
						<Box style={{ width: 260 }}>
							<Input
								placeholder="Enter name or description"
								addonBefore={<IconSearch />}
								value={query}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
							/>
						</Box>
						<Menu options={FILTER_OPTIONS.map((o) => ({ label: o, execute: () => setFilter(o) }))}>
							<MenuTrigger asChild>
								<LabelMenuButton label="Filter by">{filter}</LabelMenuButton>
							</MenuTrigger>
							<MenuContent />
						</Menu>
						<Menu options={SORT_OPTIONS.map((o) => ({ label: o, execute: () => setSort(o) }))}>
							<MenuTrigger asChild>
								<LabelMenuButton label="Sort by">{sort}</LabelMenuButton>
							</MenuTrigger>
							<MenuContent />
						</Menu>
						<Box style={{ flex: 1 }} />
					</Box>

					<Box style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
						{filteredConnectors.map((connector) => (
							<Box
								key={connector.id}
								bg="bg.default"
								style={{ border: "1px solid var(--ax-colors-border-secondary)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}
							>
								<Box display="flex" alignItems="center" justifyContent="space-between">
									<Box display="flex" alignItems="center" gap="10">
										<ConnectorLogo connector={connector} />
										<Text fontSize="md" color="fg.default" style={{ fontWeight: 600 }}>{connector.name}</Text>
									</Box>
									{connector.status === "connected" ? (
										<IconCircleCheckSolid style={{ color: "#226B1E", width: 20, height: 20, flexShrink: 0 }} />
									) : (
										<span style={{ ...CAPTION, fontSize: 9, background: "#FAD9E7", color: "#8B1A3A", padding: "2px 8px", borderRadius: 32, whiteSpace: "nowrap" as const }}>
											Auth expired
										</span>
									)}
								</Box>

								<Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.5", flex: 1 }}>
									{connector.description}
								</Text>

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
				</TabsContent>

				{/* ── Tools tab ── */}
				<TabsContent value="tools">
					<Box display="flex" alignItems="center" gap="8" mb="24">
						<Box style={{ width: 260 }}>
							<Input
								placeholder="Enter name or description"
								addonBefore={<IconSearch />}
								value={toolQuery}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToolQuery(e.target.value)}
							/>
						</Box>
						<Menu options={["All", "Active", "Inactive"].map((o) => ({ label: o, execute: () => setToolFilter(o) }))}>
							<MenuTrigger asChild>
								<LabelMenuButton label="Filter by">{toolFilter}</LabelMenuButton>
							</MenuTrigger>
							<MenuContent />
						</Menu>
						<Menu options={["All", "Name", "Status"].map((o) => ({ label: o, execute: () => setToolSort(o) }))}>
							<MenuTrigger asChild>
								<LabelMenuButton label="Sort by">{toolSort}</LabelMenuButton>
							</MenuTrigger>
							<MenuContent />
						</Menu>
						<Box style={{ flex: 1 }} />
					</Box>

					<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, overflow: "hidden" }}>
						<Box display="flex" alignItems="center" style={{ padding: "10px 20px", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
							<span style={{ ...TABLE_HEADER, flex: 1 }}>Name</span>
							<span style={{ ...TABLE_HEADER, width: 160 }}>External Provider</span>
							<span style={{ ...TABLE_HEADER, width: 200 }}>Active Status</span>
							<span style={{ ...TABLE_HEADER, width: 200 }}>Enabled in Chat</span>
						</Box>
						{filteredTools.map((tool, i) => (
							<Box
								key={tool.id}
								display="flex"
								alignItems="center"
								style={{
									padding: "16px 20px",
									borderBottom: i < filteredTools.length - 1 ? "1px solid var(--ax-colors-border-secondary)" : "none",
								}}
							>
								<Box style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
									<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }}>{tool.name}</Text>
									<Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.4", marginTop: 2 }}>{tool.description}</Text>
								</Box>
								<Box style={{ width: 160 }}>
									<Text fontSize="sm" color="fg.secondary">{tool.externalProvider ? "Yes" : "No"}</Text>
								</Box>
								<Box style={{ width: 200 }}>
									<ReadOnlySwitch checked={tool.activeOn} onLabel="Active" offLabel="Inactive" />
								</Box>
								<Box style={{ width: 200 }}>
									<ReadOnlySwitch checked={tool.enabledInChat} onLabel="Enabled" offLabel="Disabled" />
								</Box>
							</Box>
						))}
					</Box>
				</TabsContent>
			</Tabs>
		</Box>
	);
}

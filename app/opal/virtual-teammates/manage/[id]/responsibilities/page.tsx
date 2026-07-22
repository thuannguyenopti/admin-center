"use client";

import { useState, useRef, useMemo, Fragment } from "react";
import { useParams } from "next/navigation";
import { Pill } from "@optiaxiom/react/unstable";
import {
	Avatar,
	AvatarGroup,
	Badge,
	Box,
	Button,
	Heading,
	LabelMenuButton,
	Menu,
	MenuContent,
	MenuTrigger,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Switch,
	Text,
	Tooltip,
} from "@optiaxiom/react";
import { IconAngleDown, IconCalendar, IconCircleQuestion, IconEllipsisSolid, IconGlobe, IconPen, IconSearch, IconUser, IconUserGroup, IconUsers, IconXmark } from "@optiaxiom/icons";
import { Input } from "@/app/components/Input";
import Image from "next/image";
import { VAUS } from "@/app/opal/data/vaus";

// ─── Types ───────────────────────────────────────────────────────────────────

type ApprovalMode = "auto" | "ask-first" | "never";
type InteractionStatus = "active" | "disabled";
type JobStatus = "active" | "paused";

type Responsibility = {
	id: string;
	name: string;
	description: string;
	targetAgent: string;
	scheduledTime: string;
	scheduledDays: string;
	approvalMode: ApprovalMode;
	status: JobStatus;
};

type Interaction = {
	id: string;
	ability: string;
	description: string;
	targetAgent: string;
	status: InteractionStatus;
};

// ─── Access tab types ─────────────────────────────────────────────────────────

type Section = "reports-to" | "works-with";
type TierId = "principal" | "team" | "org" | "public";
type TierState = { rules: string[]; tags: string[] };
type TierConfig = { id: TierId; label: string; readOnly: boolean; icon: React.ReactNode };
type CustomGuardrail = { id: string; text: string; appliesTo: TierId | "all"; category: string | null };
type GuardrailTag = { label: string; snippet: string };

// ─── Data ────────────────────────────────────────────────────────────────────

const DEFAULT_RESPONSIBILITIES: Responsibility[] = [
	{
		id: "r1",
		name: "Daily brief",
		description: "Daily digest delivered",
		targetAgent: "IM_ability_MC",
		scheduledTime: "8:00 AM EST",
		scheduledDays: "Monday – Friday",
		approvalMode: "auto",
		status: "active",
	},
	{
		id: "r2",
		name: "Meeting prep",
		description: "Pre-meeting brief",
		targetAgent: "Meeting_agent",
		scheduledTime: "8:00 AM EST",
		scheduledDays: "Monday – Friday",
		approvalMode: "auto",
		status: "active",
	},
	{
		id: "r3",
		name: "Weekly wrap",
		description: "End-of-week performance summary",
		targetAgent: "Owner",
		scheduledTime: "5:00 PM EST",
		scheduledDays: "Friday",
		approvalMode: "ask-first",
		status: "paused",
	},
];

const DEFAULT_INTERACTIONS: Interaction[] = [
	{
		id: "i1",
		ability: "Instant message",
		description: "How Randy is able to communicate with you and get work done on a daily basis.",
		targetAgent: "IM_ability_MC",
		status: "active",
	},
];

// ─── Access tab data ──────────────────────────────────────────────────────────

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

const INITIAL_REPORTS_TO: { name: string; avatar: string | null }[] = [{ name: "Mona Chen", avatar: null }];
const INITIAL_WORKS_WITH: { name: string; avatar: string | null }[] = [
	{ name: "Ana Shuleva", avatar: "/avatar-user.png" },
	{ name: "Sarah Chen",  avatar: null },
	{ name: "Jordan Lee",  avatar: null },
	{ name: "Priya Patel", avatar: null },
	{ name: "Alex Wu",     avatar: null },
];

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
];

// ─── Shared styles ────────────────────────────────────────────────────────────

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 10,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase" as const,
};

const CHIP_LABEL: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 10,
	fontWeight: 400,
	letterSpacing: "0.08em",
	textTransform: "uppercase" as const,
};

const CARD: React.CSSProperties = {
	background: "var(--ax-colors-bg-default)",
	border: "1px solid var(--ax-colors-border-default)",
	borderRadius: 8,
	padding: "20px",
	marginBottom: 12,
};

// ─── Approval badge ───────────────────────────────────────────────────────────

const APPROVAL_CONFIG: Record<ApprovalMode, { label: string; intent: "success" | "warning" | "danger" | "neutral"; tooltip: string }> = {
	auto:       { label: "Auto",       intent: "neutral", tooltip: "Runs automatically without any approval." },
	"ask-first": { label: "Ask first", intent: "warning", tooltip: "Requires human approval before running." },
	never:      { label: "Never",      intent: "danger",  tooltip: "This responsibility will never run automatically." },
};

function ApprovalBadge({ mode }: { mode: ApprovalMode }) {
	const { label, intent, tooltip } = APPROVAL_CONFIG[mode];
	return (
		<Tooltip content={tooltip} delayDuration={300}>
			<span style={{ display: "inline-flex" }}>
				<Badge intent={intent} variant="subtle">{label}</Badge>
			</span>
		</Tooltip>
	);
}

// ─── Table header style ───────────────────────────────────────────────────────

const TH: React.CSSProperties = {
	padding: "8px 16px",
	textAlign: "left" as const,
	fontFamily: "var(--ax-font-family-mono, monospace)",
	fontSize: "0.75rem",
	textTransform: "uppercase" as const,
	letterSpacing: "0.04em",
	color: "var(--ax-colors-fg-tertiary)",
	fontWeight: 400,
	whiteSpace: "nowrap" as const,
};

const TABLE: React.CSSProperties = {
	borderRadius: 6,
	border: "1px solid var(--ax-colors-border-tertiary)",
	background: "var(--ax-colors-bg-default)",
	overflow: "hidden",
};

// ─── Access tab components ────────────────────────────────────────────────────

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

function UserAvatar({ user, size = 28 }: { user: { name: string; avatar: string | null }; size?: number }) {
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
					<UserAvatar user={user} size={16} />
					{user.name}
				</span>
			</Box>
		</Pill>
	);
}

function AddUserPopover({
	worksWith,
	onAdd,
}: {
	worksWith: typeof ALL_USERS;
	onAdd: (user: typeof ALL_USERS[0], section: Section) => void;
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return ALL_USERS.filter((u) => !worksWith.find((e) => e.name === u.name) && (!q || u.name.toLowerCase().includes(q)));
	}, [query, worksWith]);

	const reset = () => { setQuery(""); };

	return (
		<Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
			<PopoverTrigger asChild>
				<Button appearance="default" size="md">Add user</Button>
			</PopoverTrigger>
			<PopoverContent align="end" style={{ width: 300, padding: 0, overflow: "hidden" }}>
				{(
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
										onClick={() => { onAdd(user, "works-with"); setOpen(false); reset(); }}
										className="vat-nav-item"
										style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}
									>
										<UserAvatar user={user} size={28} />
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

const INITIAL_TEAM_RULES = [
	"Do not discuss personal finances, salary, compensation details, or any private financial information.",
	"Do not share private conversations, personal notes, or confidential 1:1 content.",
	"Do not draft, send, or access email content without explicit approval from the user.",
];
const INITIAL_ORG_RULES = [
	"Do not share internal company information, strategies, financial data, or internal communications.",
	"Do not share team meeting notes, internal discussions, or project communications.",
	"Do not share project details, roadmaps, timelines, or work-in-progress information.",
];

function AvatarStack({ users }: { users: { name: string; avatar: string | null }[] }) {
	return (
		<AvatarGroup size="sm">
			{users.map((u) => (
				<Tooltip key={u.name} content={u.name}>
					<Avatar
						name={u.name}
						src={u.avatar ?? undefined}
					/>
				</Tooltip>
			))}
		</AvatarGroup>
	);
}

function GuardrailsTier({
	icon,
	label,
	description,
	avatars,
	initialRules,
}: {
	icon: React.ReactNode;
	label: string;
	description: string;
	avatars?: React.ReactNode;
	initialRules: string[];
}) {
	const [expanded, setExpanded] = useState(false);
	const [editing, setEditing] = useState(false);
	const [rules, setRules] = useState(initialRules);
	const [inputValue, setInputValue] = useState("");
	const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const openEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		setExpanded(true);
		setEditing(true);
		setInputValue(rules.join("\n\n"));
		setUsedSuggestions(new Set());
	};

	const commitEdit = () => {
		setRules(inputValue.split("\n").map((l) => l.trim()).filter(Boolean));
		setEditing(false);
		setInputValue("");
	};

	return (
		<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "20px" }}>
			<Box
				display="flex"
				alignItems="start"
				onClick={() => { setExpanded((p) => !p); if (editing) setEditing(false); }}
				style={{ cursor: "pointer", userSelect: "none" as const }}
			>
				<Box style={{ color: "var(--ax-colors-fg-secondary)", flexShrink: 0, marginRight: 4, display: "flex", alignItems: "center", height: 24 }}>
					{icon}
				</Box>
				<Text fontSize="md" color="fg.default" style={{ fontWeight: 500, marginRight: 10, lineHeight: "24px" }}>{label}</Text>
				{avatars && <Box style={{ marginRight: 8, marginTop: 2 }}>{avatars}</Box>}
				<Box style={{ flex: 1 }} />
				<Box style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
					<Button appearance="default" size="md" onClick={openEdit}>Add rule</Button>
					<Button
						appearance="subtle"
						size="sm"
						icon={<IconAngleDown style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms ease" }} />}
						aria-label={expanded ? "Collapse" : "Expand"}
						onClick={(e) => { e.stopPropagation(); setExpanded((p) => !p); }}
					/>
				</Box>
			</Box>

			<Text fontSize="sm" color="fg.tertiary" style={{ marginTop: 6 }}>{description}</Text>

			<Box style={{ overflow: "hidden", maxHeight: expanded ? 800 : 0, opacity: expanded ? 1 : 0, transition: "max-height 220ms ease, opacity 180ms ease" }}>
				<Box style={{ paddingTop: 12 }}>
					{editing ? (
						<Box>
							<Box style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
								{QUICK_ADD_SUGGESTIONS.filter((s) => !usedSuggestions.has(s)).slice(0, 4).map((s) => (
									<button
										key={s}
										onClick={() => {
											setInputValue((v) => v ? v + "\n" + s : s);
											setUsedSuggestions((prev) => new Set([...prev, s]));
											setTimeout(() => { if (textareaRef.current) textareaRef.current.scrollTop = textareaRef.current.scrollHeight; }, 0);
										}}
										style={{
											display: "inline-flex", alignItems: "center", gap: 4,
											padding: "4px 10px", borderRadius: 99, background: "transparent",
											border: "1px solid var(--ax-colors-border-default)",
											cursor: "pointer", fontSize: 12,
											color: "var(--ax-colors-fg-secondary)", fontFamily: "inherit",
										}}
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
								onKeyDown={(e) => { if (e.key === "Escape") { setEditing(false); setInputValue(""); } }}
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
								<Button appearance="primary" size="sm" onClick={commitEdit}>Save</Button>
								<Button appearance="subtle" size="sm" onClick={() => { setEditing(false); setInputValue(""); }}>Cancel</Button>
							</Box>
						</Box>
					) : (
						<Box style={{ display: "flex", flexDirection: "column", gap: 6 }}>
							{rules.map((rule, i) => (
								<Box key={i} display="flex" alignItems="start" gap="8">
									<Box style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--ax-colors-fg-tertiary)", flexShrink: 0, marginTop: 6 }} />
									<Text fontSize="sm" color="fg.secondary">{rule}</Text>
								</Box>
							))}
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
}

function GuardrailsSection({ name, reportsTo, worksWith }: { name: string; reportsTo: typeof ALL_USERS; worksWith: typeof ALL_USERS }) {
	return (
		<Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			{/* Managers — flat card, no expand */}
			<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "20px" }}>
				<Box display="flex" alignItems="center" gap="4" style={{ marginBottom: 6 }}>
					<IconUser style={{ width: 16, height: 16, color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }} />
					<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }}>Managers</Text>
					<AvatarStack users={reportsTo} />
				</Box>
				<Text fontSize="sm" color="fg.tertiary">{name} shares everything with managers. No blocked topics.</Text>
			</Box>

			{/* Teammates */}
			<GuardrailsTier
				icon={<IconUsers style={{ width: 16, height: 16 }} />}
				label="Teammates"
				description="Teammates see what you choose to share — nothing more."
				avatars={<AvatarStack users={worksWith} />}
				initialRules={INITIAL_TEAM_RULES}
			/>

			{/* Org members */}
			<GuardrailsTier
				icon={<IconUserGroup style={{ width: 16, height: 16 }} />}
				label="Org members"
				description="Org-wide guardrails — what anyone at your company can access."
				initialRules={INITIAL_ORG_RULES}
			/>
		</Box>
	);
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ResponsibilitiesPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const name = vau?.characterName ?? vau?.name ?? "Randy";

	const [jobs, setJobs] = useState<Responsibility[]>(DEFAULT_RESPONSIBILITIES);
	const [dragId, setDragId] = useState<string | null>(null);
	const [dragOverId, setDragOverId] = useState<string | null>(null);
	const [interactions, setInteractions] = useState<Interaction[]>(DEFAULT_INTERACTIONS);
	const [rules, setRules] = useState<string[]>([
		"Surface blockers before they become fires",
		"Make sure nothing falls through the cracks",
		"Keep you one step ahead",
		"Keep meetings worth attending",
		"Draft first passes so you're editing, not starting from zero",
	]);
	const [newRule, setNewRule] = useState("");

	// Access section state
	const [reportsTo, setReportsTo] = useState(INITIAL_REPORTS_TO);
	const [worksWith, setWorksWith] = useState(INITIAL_WORKS_WITH);

	// Scroll-nav refs
	const rolesRef = useRef<HTMLDivElement>(null);
	const guardrailsRef = useRef<HTMLDivElement>(null);
	const jobsRef = useRef<HTMLDivElement>(null);
	const interactionsRef = useRef<HTMLDivElement>(null);
	const rulesRef = useRef<HTMLDivElement>(null);
	const scrollTo = (ref: React.RefObject<HTMLDivElement>) => setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);

	return (
		<Box style={{ padding: "32px 40px" }}>
			<Heading level="1" mb="4">Responsibilities</Heading>
			<Text color="fg.secondary" fontSize="lg" mb="24">
				How {name} works and when they kick into action
			</Text>

			{/* Scroll-nav */}
			<Box display="flex" gap="24" mb="32" style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
				{[
					{ label: "Roles",        onClick: () => scrollTo(rolesRef) },
					{ label: "Guardrails",   onClick: () => scrollTo(guardrailsRef) },
					{ label: "Jobs",         onClick: () => scrollTo(jobsRef) },
					{ label: "Interactions", onClick: () => scrollTo(interactionsRef) },
					{ label: "Rules",        onClick: () => scrollTo(rulesRef) },
				].map(({ label, onClick }, i) => (
					<Box
						key={label}
						onClick={onClick}
						style={{
							paddingBottom: 12,
							borderBottom: i === 0 ? "2px solid var(--ax-colors-fg-default)" : "2px solid transparent",
							cursor: "pointer",
							fontWeight: i === 0 ? 500 : 400,
							fontSize: 14,
							color: i === 0 ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)",
						}}
					>
						{label}
					</Box>
				))}
			</Box>

			{/* ── Roles section ── */}
			<Box ref={rolesRef}>
				{/* User roles */}
				<Heading level="3" mb="4">User roles</Heading>
				<Text fontSize="md" color="fg.secondary" style={{ display: "block", marginBottom: 20 }}>
					Anyone with visibility into, responsibility for, or collaboration with {name}.
				</Text>

				{/* Your role */}
				<Box style={{ ...CARD, marginBottom: 12 }}>
					<Text fontSize="md" color="fg.default" style={{ fontWeight: 500, display: "block", marginBottom: 4 }}>Your role</Text>
					<Text fontSize="sm" color="fg.tertiary" style={{ display: "block", marginBottom: 12 }}>Your role determines how you can work with {name}.</Text>
					<Badge intent="information" variant="subtle" style={{ fontFamily: "Roboto Mono, monospace", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>Manager</Badge>
				</Box>

				{/* Managers */}
				<Box style={{ ...CARD, marginBottom: 12 }}>
					<Box display="flex" alignItems="center" gap="8" style={{ marginBottom: 4 }}>
						<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }}>Managers</Text>
						<Tooltip content="Contact your admin to add additional users" delayDuration={300}>
							<span style={{ display: "inline-flex" }}>
								<IconCircleQuestion size={14} color="var(--ax-colors-fg-tertiary)" />
							</span>
						</Tooltip>
					</Box>
					<Text fontSize="sm" color="fg.tertiary" style={{ display: "block", marginBottom: 12 }}>
						Managers work hand-in-hand with {name}. Full access and no blocked topics.
					</Text>
					<Box display="flex" alignItems="center" gap="8" style={{ flexWrap: "wrap" }}>
						{reportsTo.map((u) => (
							<UserChip key={u.name} user={u} />
						))}
					</Box>
				</Box>

				{/* Teammates */}
				<Box style={{ ...CARD, marginBottom: 0 }}>
					<Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginBottom: 4 }}>
						<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }}>Teammates</Text>
						<AddUserPopover
							worksWith={worksWith}
							onAdd={(u) => setWorksWith((prev) => [...prev, u])}
						/>
					</Box>
					<Text fontSize="sm" color="fg.tertiary" style={{ display: "block", marginBottom: 12 }}>
						Teammates can message and chat with {name}, within the limits you set.
					</Text>
					<Box display="flex" alignItems="center" gap="8" style={{ flexWrap: "wrap" }}>
						{worksWith.map((u) => (
							<UserChip key={u.name} user={u} onRemove={() => setWorksWith((prev) => prev.filter((x) => x.name !== u.name))} />
						))}
					</Box>
				</Box>

				{/* Conversation guardrails */}
				<Box ref={guardrailsRef} mt="32">
					<Box display="flex" alignItems="center" gap="8" mb="4">
						<Heading level="3" mb="0">Conversation guardrails</Heading>
						<Tooltip content={`What ${name} shares, and what stays private.`} delayDuration={300}>
							<span style={{ display: "inline-flex" }}>
								<IconCircleQuestion size={14} color="var(--ax-colors-fg-tertiary)" />
							</span>
						</Tooltip>
					</Box>
					<Text fontSize="md" color="fg.secondary" style={{ display: "block", marginBottom: 20 }}>
						What {name} shares, and what stays private.
					</Text>
					<GuardrailsSection name={name} reportsTo={reportsTo} worksWith={worksWith} />
				</Box>
			</Box>

			<Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "32px 0" }} />

			{/* ── Jobs section ── */}
			<Box ref={jobsRef}>
				<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
					<Box>
						<Heading level="3" mb="0">Jobs</Heading>
						<Text fontSize="md" color="fg.secondary" style={{ marginTop: 4 }}>Scheduled tasks {name} runs automatically</Text>
					</Box>
					<Menu options={[{ label: "Create job" }, { label: "Install from catalog" }]}>
						<MenuTrigger asChild>
							<Button appearance="default" size="md" addonAfter={<IconAngleDown />}>
								Add job
							</Button>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Box>

				<div style={TABLE}>
					<table style={{ borderCollapse: "collapse", width: "100%" }}>
						<thead>
							<tr style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}>
								<th style={{ ...TH, width: 32, padding: "8px 4px 8px 12px" }}></th>
								{["Job", "Trigger", "Scheduled", "Approval mode", "Status", ""].map((col, i) => (
									<th key={i} style={{ ...TH, width: i === 5 ? 48 : undefined }}>{col}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{jobs.map((row, rowIdx) => {
								const isDragging = dragId === row.id;
								const isOver = dragOverId === row.id && dragId !== row.id;
								return (
									<tr
										key={row.id}
										draggable
										onDragStart={() => setDragId(row.id)}
										onDragEnd={() => { setDragId(null); setDragOverId(null); }}
										onDragOver={(e) => { e.preventDefault(); setDragOverId(row.id); }}
										onDrop={() => {
											if (!dragId || dragId === row.id) return;
											setJobs((prev) => {
												const from = prev.findIndex((r) => r.id === dragId);
												const to = prev.findIndex((r) => r.id === row.id);
												const next = [...prev];
												const [moved] = next.splice(from, 1);
												next.splice(to, 0, moved);
												return next;
											});
											setDragId(null);
											setDragOverId(null);
										}}
										style={{
											borderBottom: rowIdx < jobs.length - 1 ? "1px solid var(--ax-colors-border-tertiary)" : undefined,
											borderTop: isOver ? "2px solid #197A94" : undefined,
											opacity: isDragging ? 0.4 : 1,
											transition: "opacity 0.15s",
										}}
									>
										<td style={{ padding: "12px 4px 12px 12px", verticalAlign: "middle", color: "var(--ax-colors-fg-tertiary)", userSelect: "none", cursor: "grab" }}>
											<svg width="8" height="14" viewBox="0 0 8 14" fill="none"><circle cx="2" cy="2" r="1.5" fill="currentColor"/><circle cx="6" cy="2" r="1.5" fill="currentColor"/><circle cx="2" cy="7" r="1.5" fill="currentColor"/><circle cx="6" cy="7" r="1.5" fill="currentColor"/><circle cx="2" cy="12" r="1.5" fill="currentColor"/><circle cx="6" cy="12" r="1.5" fill="currentColor"/></svg>
										</td>
										<td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
											<Text fontSize="md" color="fg.default" fontWeight="500">{row.name}</Text>
											<Text fontSize="sm" color="fg.secondary" style={{ marginTop: 2 }}>{row.description}</Text>
										</td>
										<td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
											<Badge intent="information" variant="subtle">Scheduled</Badge>
										</td>
										<td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
											<Box display="flex" gap="6" style={{ alignItems: "flex-start" }}>
												<IconCalendar style={{ width: 14, height: 14, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0, marginTop: 2 }} />
												<Box>
													<Text fontSize="md" color="fg.default">{row.scheduledTime}</Text>
													<Text fontSize="sm" color="fg.secondary" style={{ marginTop: 2 }}>{row.scheduledDays}</Text>
												</Box>
											</Box>
										</td>
										<td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
											<ApprovalBadge mode={row.approvalMode} />
										</td>
										<td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
											{row.status === "active"
												? <Badge intent="success" variant="subtle">Active</Badge>
												: <Badge intent="danger" variant="subtle">Paused</Badge>
											}
										</td>
										<td style={{ padding: "12px 16px", verticalAlign: "middle", width: 48, textAlign: "right" }}>
											<Menu options={[{ label: "Edit" }, { label: "Pause" }, { label: "Delete", intent: "danger" as const }]}>
												<MenuTrigger asChild>
													<Button appearance="subtle" size="sm" icon={<IconEllipsisSolid />} aria-label="Row actions" />
												</MenuTrigger>
												<MenuContent />
											</Menu>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</Box>

			<Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "32px 0" }} />

			{/* ── Interactions section ── */}
			<Box ref={interactionsRef}>
				<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
					<Box>
						<Heading level="3" mb="0">Interactions</Heading>
						<Text fontSize="md" color="fg.secondary" style={{ marginTop: 4 }}>Channels and modes by which {name} can be reached</Text>
					</Box>
					<Button appearance="default" size="md">
						Add interaction
					</Button>
				</Box>

				<div style={TABLE}>
					<table style={{ borderCollapse: "collapse", width: "100%" }}>
						<thead>
							<tr style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}>
								{["Interaction", "Target agent", "Status", ""].map((col, i) => (
									<th key={i} style={{ ...TH, width: i === 3 ? 48 : undefined }}>{col}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{interactions.map((row, rowIdx) => (
								<tr key={row.id} style={{ borderBottom: rowIdx < interactions.length - 1 ? "1px solid var(--ax-colors-border-tertiary)" : undefined }}>
									<td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
										<Text fontSize="md" color="fg.default" fontWeight="500">{row.ability}</Text>
										<Text fontSize="sm" color="fg.secondary" style={{ marginTop: 2 }}>{row.description}</Text>
									</td>
									<td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
										<Text fontSize="md" color="fg.secondary">{row.targetAgent}</Text>
									</td>
									<td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
										{row.status === "active"
											? <Badge intent="success" variant="subtle">Active</Badge>
											: <Badge variant="subtle">Disabled</Badge>
										}
									</td>
									<td style={{ padding: "12px 16px", verticalAlign: "middle", width: 48, textAlign: "right" }}>
										<Menu options={[
											{ label: "Edit" },
											{ label: "Delete", intent: "danger" as const, execute: () => setInteractions((prev) => prev.filter((r) => r.id !== row.id)) },
										]}>
											<MenuTrigger asChild>
												<Button appearance="subtle" size="sm" icon={<IconEllipsisSolid />} aria-label="Row actions" />
											</MenuTrigger>
											<MenuContent />
										</Menu>
									</td>
								</tr>
							))}
							{interactions.length === 0 && (
								<tr>
									<td colSpan={4} style={{ padding: "32px 16px", textAlign: "center" }}>
										<Text fontSize="sm" color="fg.tertiary">No interactions configured</Text>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</Box>

			<Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "32px 0" }} />

			{/* ── Rules section ── */}
			<Box ref={rulesRef}>
				<Box mb="16">
					<Heading level="3" mb="0">Rules</Heading>
					<Text fontSize="md" color="fg.secondary" style={{ marginTop: 4 }}>Instructions your teammate follows — things like how to respond, what to prioritize, or what to avoid</Text>
				</Box>

				<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "20px 24px" }}>
					<Box display="flex" gap="8" mb="12">
						<input
							value={newRule}
							onChange={(e) => setNewRule(e.target.value)}
							placeholder="Create a rule..."
							onKeyDown={(e) => {
								if (e.key === "Enter" && newRule.trim()) {
									setRules((p) => [...p, newRule.trim()]);
									setNewRule("");
								}
							}}
							style={{
								flex: 1, height: 36, padding: "0 12px",
								border: "1px solid var(--ax-colors-border-default)",
								borderRadius: 6, background: "var(--ax-colors-bg-input)",
								fontSize: 14, color: "var(--ax-colors-fg-default)",
								fontFamily: "inherit", outline: "none",
							}}
						/>
						<Button size="md" style={{ height: 36, flexShrink: 0 }} onClick={() => {
							if (newRule.trim()) { setRules((p) => [...p, newRule.trim()]); setNewRule(""); }
						}}>Add</Button>
					</Box>

					<Box display="flex" flexDirection="column" gap="6" mb="16">
						{rules.map((rule) => (
							<Box key={rule} style={{
								display: "flex", alignItems: "center", justifyContent: "space-between",
								padding: "10px 14px",
								background: "#EFF5EB",
								borderRadius: 8,
							}}>
								<Text fontSize="md" color="fg.default">{rule}</Text>
								<button
									onClick={() => setRules((p) => p.filter((x) => x !== rule))}
									style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--ax-colors-fg-tertiary)", display: "flex", alignItems: "center", flexShrink: 0 }}
								>
									<IconXmark size={14} />
								</button>
							</Box>
						))}
					</Box>

					<Box>
						<span style={{
							fontFamily: "Roboto Mono, monospace", fontSize: 9, fontWeight: 400,
							lineHeight: "1.25", letterSpacing: "0.08em", textTransform: "uppercase",
							color: "var(--ax-colors-fg-tertiary)", display: "block", marginBottom: 8,
						}}>QUICK ADD</span>
						<Box display="flex" flexWrap="wrap" gap="6">
							{[
								"Flag urgent decisions",
								"Summarize threads",
								"Draft first passes",
								"Keep calendar clean",
								"Celebrate wins",
							].filter((v) => !rules.includes(v)).map((v) => (
								<button
									key={v}
									className="trait-pill-suggest"
									onClick={() => setRules((p) => [...p, v])}
									style={{
										display: "inline-flex", alignItems: "center", gap: 4,
										padding: "5px 10px", borderRadius: 99,
										background: "transparent",
										border: "1px solid var(--ax-colors-border-default)",
										cursor: "pointer", fontSize: 13,
										color: "var(--ax-colors-fg-secondary)", fontFamily: "inherit",
									}}
								>
									+ {v}
								</button>
							))}
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

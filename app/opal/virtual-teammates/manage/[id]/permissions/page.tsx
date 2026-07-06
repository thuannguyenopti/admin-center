"use client";

import { useState, useMemo, Fragment } from "react";
import { useParams } from "next/navigation";
import { Badge, Box, Button, Heading, Menu, MenuContent, MenuTrigger, Popover, PopoverContent, PopoverTrigger, Text, Textarea } from "@optiaxiom/react";
import { IconGlobe, IconPen, IconPlus, IconSearch, IconUser, IconUserGroup, IconUsers } from "@optiaxiom/icons";
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
	padding: "20px 24px",
	marginBottom: 12,
};

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
		<Box display="flex" alignItems="center" gap="6" style={{ background: "#D8E4CB", borderRadius: 32, padding: "4px 10px 4px 4px", flexShrink: 0 }}>
			<Avatar user={user} size={20} />
			<span style={{ ...CAPTION, fontSize: 9, color: "var(--ax-colors-fg-default)" }}>{user.name}</span>
			{onRemove && (
				<Box onClick={onRemove} style={{ width: 14, height: 14, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: "var(--ax-colors-fg-tertiary)" }}>
					<svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
				</Box>
			)}
		</Box>
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
					/* Step 2 — choose section */
					<Box>
						{/* Selected user header */}
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
						{/* Section choices */}
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
					/* Step 1 — search + pick user */
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



// ─── Guardrails ──────────────────────────────────────────────────────────────

type TierId = "principal" | "team" | "org" | "public";

type TierState = { rules: string; tags: string[] };

type TierConfig = {
	id: TierId;
	label: string;
	accessLabel: string;
	bodyText?: string;
	readOnly: boolean;
	icon: React.ReactNode;
};

const TIER_CONFIGS: TierConfig[] = [
	{
		id: "principal",
		label: "Primary user",
		accessLabel: "Full access — no overrides",
		bodyText: "Randy shares everything with principals. No blocked topics.",
		readOnly: true,
		icon: <IconUser style={{ width: 16, height: 16, flexShrink: 0 }} />,
	},
	{ id: "team",   label: "Team member", accessLabel: "Filtered",       readOnly: false, icon: <IconUserGroup style={{ width: 16, height: 16, flexShrink: 0 }} /> },
	{ id: "org",    label: "Org member",  accessLabel: "Restricted",     readOnly: false, icon: <IconUsers     style={{ width: 16, height: 16, flexShrink: 0 }} /> },
	{ id: "public", label: "Public",      accessLabel: "Most restricted", readOnly: false, icon: <IconGlobe     style={{ width: 16, height: 16, flexShrink: 0 }} /> },
];

const INITIAL_TIER_STATES: Record<TierId, TierState> = {
	principal: { rules: "", tags: [] },
	team: {
		tags: ["Finances & salary", "Private convos", "Emails"],
		rules: "Do not discuss personal finances, salary, compensation details, or any private financial information.\nDo not share private conversations, personal notes, or confidential 1:1 content.\nDo not draft, send, or access email content without explicit approval from the user.",
	},
	org: {
		tags: ["Internal info", "Team convos", "Projects"],
		rules: "Do not share internal company information, strategies, financial data, or internal communications.\nDo not share team meeting notes, internal discussions, or project communications.\nDo not share project details, roadmaps, timelines, or work-in-progress information.\n\nI can only share publicly available project information.",
	},
	public: {
		tags: ["Internal info"],
		rules: "Do not share any internal company information. Limit all responses to publicly available information only.",
	},
};

function GuardrailsSection({ name }: { name: string }) {
	const [savedStates, setSavedStates] = useState<Record<TierId, TierState>>(INITIAL_TIER_STATES);
	const [editingTier, setEditingTier] = useState<TierId | null>(null);
	const [draft, setDraft] = useState<TierState | null>(null);
	const [showConflict, setShowConflict] = useState(false);

	const isDirty =
		editingTier !== null &&
		draft !== null &&
		(draft.rules !== savedStates[editingTier].rules ||
			JSON.stringify(draft.tags) !== JSON.stringify(savedStates[editingTier].tags));

	const startEdit = (tierId: TierId) => {
		if (editingTier !== null && isDirty) {
			setShowConflict(true);
			return;
		}
		setEditingTier(tierId);
		setDraft({ ...savedStates[tierId] });
		setShowConflict(false);
	};

	const cancelEdit = () => {
		setEditingTier(null);
		setDraft(null);
		setShowConflict(false);
	};

	const saveEdit = () => {
		if (!editingTier || !draft) return;
		setSavedStates((prev) => ({ ...prev, [editingTier]: { ...draft } }));
		setEditingTier(null);
		setDraft(null);
		setShowConflict(false);
	};

	return (
		<Box style={CARD}>
			{/* Header */}
			<Box mb="20">
				<Text style={SECTION_HEADING} mb="4">Guardrails</Text>
				<Text fontSize="sm" color="fg.secondary">
					Lines {name}{" "}never crosses — set by who&apos;s asking. Changes kick in right away.
				</Text>
			</Box>

			{/* Unsaved-changes conflict warning */}
			{showConflict && (
				<Box
					bg="bg.secondary"
					mb="16"
					style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 6, padding: "8px 12px" }}
				>
					<Text fontSize="sm" color="fg.secondary">
						You have unsaved changes. Save or cancel before editing another tier.
					</Text>
				</Box>
			)}

			{/* Tier rows */}
			{TIER_CONFIGS.map((tier, i) => {
				const isEditing = editingTier === tier.id;
				const state = isEditing && draft ? draft : savedStates[tier.id];

				return (
					<Fragment key={tier.id}>
						{i > 0 && (
							<Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "16px 0" }} />
						)}
						<Box>
							{/* Row header */}
							<Box display="flex" alignItems="center" justifyContent="space-between" mb="10">
								<Box display="flex" alignItems="center" gap="4">
									<Box style={{ color: "var(--ax-colors-fg-secondary)" }}>{tier.icon}</Box>
									<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }}>{tier.label}</Text>
								</Box>
								{!tier.readOnly && (
									isEditing && TIER_TAGS[tier.id].filter((t) => !(draft?.tags ?? []).includes(t.label)).length > 0 ? (
										<Menu
											options={TIER_TAGS[tier.id]
												.filter((t) => !(draft?.tags ?? []).includes(t.label))
												.map((tag) => ({
													label: tag.label,
													execute: () => setDraft((prev) => prev ? {
														...prev,
														tags: [...prev.tags, tag.label],
														rules: prev.rules ? prev.rules.trim() + "\n" + tag.snippet : tag.snippet,
													} : prev),
												}))}
										>
											<MenuTrigger asChild>
												<Button appearance="subtle" size="sm" icon={<IconPlus />}>Add restriction</Button>
											</MenuTrigger>
											<MenuContent />
										</Menu>
									) : !isEditing ? (
										<Button
											appearance="subtle"
											size="sm"
											icon={<IconPen />}
											aria-label={`Edit ${tier.label} guardrails`}
											onClick={() => startEdit(tier.id)}
										/>
									) : null
								)}
							</Box>

							{/* Body */}
							{tier.bodyText ? (
								<Text fontSize="sm" color="fg.tertiary">{tier.bodyText}</Text>
							) : isEditing ? (
								<>
									{/* Current tags — removable (X inside badge) */}
									{(draft?.tags ?? []).length > 0 && (
										<Box style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
											{(draft?.tags ?? []).map((label) => (
												<Badge key={label} intent="danger" variant="subtle" style={{ display: "inline-flex", alignItems: "center", gap: 5, paddingRight: 6 }}>
													{label}
													<span
														onClick={() => setDraft((prev) => prev ? { ...prev, tags: prev.tags.filter((t) => t !== label) } : prev)}
														style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", opacity: 0.6, lineHeight: 0 }}
													>
														<svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
													</span>
												</Badge>
											))}
										</Box>
									)}

									<Textarea
										value={draft?.rules ?? ""}
										onChange={(e) => setDraft((prev) => prev ? { ...prev, rules: e.target.value } : prev)}
										rows={4}
										style={{ width: "100%", lineHeight: 1.6 }}
									/>
									<Box display="flex" alignItems="center" justifyContent="flex-end" gap="8" mt="12">
										<Button appearance="subtle" size="sm" onClick={cancelEdit}>Cancel</Button>
										<Button appearance="primary" size="sm" onClick={saveEdit}>Save changes</Button>
									</Box>
								</>
							) : (
								<>
									{state.tags.length > 0 && (
										<Box style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: state.rules ? 10 : 0 }}>
											{state.tags.map((label) => (
												<Badge key={label} intent="danger" variant="subtle">{label}</Badge>
											))}
										</Box>
									)}
									{state.rules && (
										<Box style={{ display: "flex", flexDirection: "column", gap: 6 }}>
											{state.rules.split("\n").filter(Boolean).map((line, i) => (
												<Box key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
													<Box style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--ax-colors-fg-tertiary)", flexShrink: 0, marginTop: 6 }} />
													<Text fontSize="sm" color="fg.secondary">{line}</Text>
												</Box>
											))}
										</Box>
									)}
								</>
							)}
						</Box>
					</Fragment>
				);
			})}
		</Box>
	);
}

export default function VATPermissionsPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const name = vau?.characterName ?? vau?.name ?? "Randy";

	const [reportsTo, setReportsTo] = useState(INITIAL_REPORTS_TO);
	const [worksWith, setWorksWith] = useState(INITIAL_WORKS_WITH);

	return (
		<Box style={{ padding: "32px 40px" }}>
			<Heading level="2" mb="4">Permissions</Heading>
			<Text color="fg.secondary" fontSize="md" mb="24">
				Who {name} works with and what {name}&apos;s allowed to do.
			</Text>

			{/* People — reports to + works with in one card */}
			<Box style={CARD}>
				{/* Reports to */}
				<Box mb="20">
					<Box display="flex" alignItems="start" justifyContent="space-between" mb="12">
						<Box>
							<Text style={SECTION_HEADING} mb="4">{name} reports to</Text>
							<Text fontSize="sm" color="fg.secondary">People who can direct {name}&apos;s priorities, review outputs, and approve work before it ships.</Text>
						</Box>
						<AddUserPopover
							reportsTo={reportsTo}
							worksWith={worksWith}
							onAdd={(u, section) => {
								if (section === "reports-to") setReportsTo((prev) => [...prev, u]);
								else setWorksWith((prev) => [...prev, u]);
							}}
						/>
					</Box>
					<Box display="flex" alignItems="center" gap="8" style={{ flexWrap: "wrap" }}>
						{reportsTo.map((u) => (
							<UserChip key={u.name} user={u} onRemove={() => setReportsTo((prev) => prev.filter((x) => x.name !== u.name))} />
						))}
					</Box>
				</Box>

				{/* Divider */}
				<Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "0 0 20px" }} />

				{/* Works with */}
				<Box>
					<Box mb="12">
						<Text style={SECTION_HEADING} mb="4">{name} works with</Text>
						<Text fontSize="sm" color="fg.secondary">Teammates {name} collaborates with, shares updates to, and can receive requests from.</Text>
					</Box>
					<Box display="flex" alignItems="center" gap="8" style={{ flexWrap: "wrap" }}>
						{worksWith.map((u) => (
							<UserChip key={u.name} user={u} onRemove={() => setWorksWith((prev) => prev.filter((x) => x.name !== u.name))} />
						))}
					</Box>
				</Box>
			</Box>

			{/* Manage actions */}
			<Box style={CARD}>
				<Box display="flex" alignItems="start" justifyContent="space-between">
					<Box>
						<Text style={SECTION_HEADING} mb="4">Manage actions</Text>
						<Text fontSize="sm" color="fg.secondary" style={{ maxWidth: 600 }}>
							Control what {name} handles alone and what comes to you first. To make changes, you&apos;ll need to switch into {name}&apos;s account.
						</Text>
					</Box>
					<SplitDialog type="manage" name={name}>
						<Button appearance="default" size="md" style={{ flexShrink: 0 }}>
							Manage as {name}
						</Button>
					</SplitDialog>
				</Box>
			</Box>

{/* Guardrails */}
			<GuardrailsSection name={name} />
		</Box>
	);
}

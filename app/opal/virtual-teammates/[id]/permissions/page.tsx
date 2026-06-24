"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Badge, Box, Button, Heading, Popover, PopoverContent, PopoverTrigger, Text } from "@optiaxiom/react";
import { IconSearch } from "@optiaxiom/icons";
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

const WORKFLOW_TAG_STYLE: React.CSSProperties = {
	...CAPTION,
	fontSize: 10,
	background: "var(--ax-colors-bg-secondary)",
	color: "var(--ax-colors-fg-secondary)",
	padding: "3px 10px",
	borderRadius: 4,
	border: "1px solid var(--ax-colors-border-default)",
	whiteSpace: "nowrap" as const,
};


export default function VATPermissionsPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const name = vau?.characterName ?? vau?.name ?? "Randy";

	const [reportsTo, setReportsTo] = useState(INITIAL_REPORTS_TO);
	const [worksWith, setWorksWith] = useState(INITIAL_WORKS_WITH);

	const WORKFLOWS = ["Meeting_Prep", "Email_Triage", "CMP/Review_Request", "Notifications"];

	return (
		<Box style={{ padding: "32px 40px" }}>
			<Heading level="2" mb="4">Permissions</Heading>
			<Text color="fg.secondary" fontSize="md" mb="24">
				Who {name} works with and what {name}&apos;s allowed to do.
			</Text>

			{/* People — reports to + works with in one card */}
			<Box style={CARD}>
				<Box display="flex" alignItems="start" justifyContent="space-between" mb="20">
					<Box>
						<Text style={SECTION_HEADING} mb="4">People</Text>
						<Text fontSize="sm" color="fg.secondary">Who {name} reports to and collaborates with.</Text>
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

				{/* Reports to */}
				<Box mb="20">
					<Text fontSize="sm" color="fg.tertiary" style={{ ...CAPTION, marginBottom: 10, display: "block" }}>
						Reports to
					</Text>
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
					<Text fontSize="sm" color="fg.tertiary" style={{ ...CAPTION, marginBottom: 10, display: "block" }}>
						Works with
					</Text>
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

			{/* Workflows */}
			<Box style={CARD}>
				<Box display="flex" alignItems="start" justifyContent="space-between" mb="16">
					<Box>
						<Text style={SECTION_HEADING} mb="4">{name}&apos;s workflows</Text>
						<Text fontSize="sm" color="fg.secondary">Tasks that your virtual teammate can run</Text>
					</Box>
					<SplitDialog type="workflow" name={name}>
						<Button appearance="default" size="md" style={{ flexShrink: 0 }}>
							Install workflow
						</Button>
					</SplitDialog>
				</Box>
				<Box display="flex" alignItems="center" gap="8" style={{ flexWrap: "wrap" }}>
					{WORKFLOWS.map((w) => (
						<Badge key={w} style={{ background: "#E2F5F5", color: "#036988", border: "none" }}>{w}</Badge>
					))}
				</Box>
			</Box>

			{/* Guardrails */}
			<Box style={CARD}>
				<Box display="flex" alignItems="start" justifyContent="space-between">
					<Box>
						<Text style={SECTION_HEADING} mb="4">Guardrails</Text>
						<Text fontSize="sm" color="fg.secondary" style={{ maxWidth: 600 }}>
							{name}&apos;s hard lines — set by the company handbook. Can&apos;t be overridden, but you can add your own on top.
						</Text>
					</Box>
					<SplitDialog type="guardrails" name={name}>
						<Button appearance="default" size="md" style={{ flexShrink: 0 }}>
							Configure
						</Button>
					</SplitDialog>
				</Box>
			</Box>
		</Box>
	);
}

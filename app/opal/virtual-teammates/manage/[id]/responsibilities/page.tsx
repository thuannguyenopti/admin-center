"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
	Badge,
	Box,
	Button,
	Heading,
	Menu,
	MenuContent,
	MenuTrigger,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	Text,
	Tooltip,
} from "@optiaxiom/react";
import { IconAngleDown, IconCalendar, IconEllipsisSolid, IconXmark } from "@optiaxiom/icons";
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

// ─── Approval badge ───────────────────────────────────────────────────────────

const APPROVAL_CONFIG: Record<ApprovalMode, { label: string; intent: "success" | "warning" | "danger"; tooltip: string }> = {
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

	return (
		<Box style={{ padding: "32px 40px" }}>
			<Heading level="1" mb="4">Responsibilities</Heading>
			<Text color="fg.secondary" fontSize="lg" mb="24">
				How {name} works and when they kick into action
			</Text>

			<Tabs defaultValue="jobs">
				<TabsList mb="24">
					<TabsTrigger value="jobs">Jobs</TabsTrigger>
					<TabsTrigger value="interactions">Interactions</TabsTrigger>
					<TabsTrigger value="rules">Rules</TabsTrigger>
				</TabsList>

				{/* ── Jobs tab ── */}
				<TabsContent value="jobs">
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
				</TabsContent>

				{/* ── Interactions tab ── */}
				<TabsContent value="interactions">
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
												{ label: "Disable" },
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
				</TabsContent>

				{/* ── Rules tab ── */}
				<TabsContent value="rules">
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
				</TabsContent>
			</Tabs>
		</Box>
	);
}

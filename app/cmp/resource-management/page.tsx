"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Avatar, Badge, Box, Button, Dialog, DialogBody, DialogContent, DialogHeader, SearchInput } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { useLayout } from "@/app/context/LayoutContext";
import { useTheme } from "@/app/hooks/useTheme";
import {
	IconChartBar, IconCheckbox, IconChevronLeft, IconChevronRight,
	IconClock, IconFilter, IconLayoutColumns, IconPlus, IconShare,
	IconTrendingUp, IconX,
} from "@tabler/icons-react";
import type { ResourceTab, PlannerCard } from "./types";
import { weekColumns } from "./constants";
import {
	normalizePlannerCardLanes,
	getPlannerViewportLabel,
	getPlannerViewportWeeks,
	buildWorkloadRows,
	generatePlannerCardsFromTargets,
} from "./utils";
import { WorkloadTabButton, WorkloadGrid } from "./components/WorkloadView";
import { PlannerGrid } from "./components/PlannerView";

// ── Report helpers ────────────────────────────────────────────────────────────

const ALLOC_ROWS = [
	{ member: "Alice T.", role: "Designer", assigned: 42, capacity: 40, overUnder: "+2", pct: "105%", over: true },
	{ member: "Ben K.", role: "Engineer", assigned: 38, capacity: 40, overUnder: "-2", pct: "95%", over: false },
	{ member: "Carla M.", role: "PM", assigned: 28, capacity: 40, overUnder: "-12", pct: "70%", over: false },
	{ member: "Derek J.", role: "Engineer", assigned: 44, capacity: 40, overUnder: "+4", pct: "110%", over: true },
	{ member: "Elena P.", role: "QA", assigned: 18, capacity: 40, overUnder: "-22", pct: "45%", over: false },
	{ member: "Frank W.", role: "DevOps", assigned: 35, capacity: 40, overUnder: "-5", pct: "88%", over: false },
];

const UTIL_BARS = [
	{ name: "Alice T.", value: 92, color: "#e07474" },
	{ name: "Ben K.", value: 75, color: "#3d4555" },
	{ name: "Carla M.", value: 62, color: "#4caf88" },
	{ name: "Derek J.", value: 88, color: "#8585c4" },
	{ name: "Elena P.", value: 42, color: "#aaaaaa" },
	{ name: "Frank W.", value: 68, color: "#e5a050" },
];

const PLANNED_ACTUAL_ROWS = [
	{ step: "SEO Optimization", substep: "Keyword Research and Integration", status: "Completed", loggedBy: "Mark Henderson", role: "SEO Specialist", avatar: "https://i.pravatar.cc/32?img=32", utilization: "85%", planned: 5, actual: 2 },
	{ step: "Social Media", substep: "Instagram Ad Campaign Setup", status: "Completed", loggedBy: "Jasmine Lee", role: "Social Media Manager", avatar: "https://i.pravatar.cc/32?img=47", utilization: "92%", planned: 6, actual: 3 },
	{ step: "Email Marketing", substep: "Newsletter Design and Distribution", status: "Completed", loggedBy: "David Park", role: "Email Marketing Specialist", avatar: "https://i.pravatar.cc/32?img=12", utilization: "78%", planned: 4, actual: 4 },
	{ step: "Analytics", substep: "Website Traffic Analysis", status: "Completed", loggedBy: "Sara Kim", role: "Data Analyst", avatar: "https://i.pravatar.cc/32?img=23", utilization: "90%", planned: 7, actual: 5 },
];

const STEPS_FREQ_ROWS = [
	{ step: "Code Review", member: "Ben K.", frequency: 18, avgTime: 45 },
	{ step: "Daily Standup", member: "All", frequency: 22, avgTime: 15 },
	{ step: "Design Approval", member: "Alice T.", frequency: 12, avgTime: 30 },
	{ step: "QA Sign-off", member: "Elena P.", frequency: 15, avgTime: 60 },
	{ step: "Deployment", member: "Frank W.", frequency: 8, avgTime: 90 },
	{ step: "Sprint Review", member: "Carla M.", frequency: 4, avgTime: 60 },
];

const PROGRESS_DETAIL = [
	{ task: "Content Creation", subtask: "Equinox Product Rollout", status: "In progress", assignee: "Alistair Lumley", role: "Copy Writer", avatar: "https://i.pravatar.cc/32?img=44", planned: "40h", dueDate: "Feb 3, 2026" },
	{ task: "Email Marketing", subtask: "Revamp Email Strategy", status: "In progress", assignee: "Jasper Beaufort", role: "Copy Writer", avatar: "https://i.pravatar.cc/32?img=49", planned: "38h", dueDate: "Feb 14, 2026" },
	{ task: "Social Media Promotion", subtask: "Viral Video Campaign", status: "In progress", assignee: "Zoya Carmichael", role: "Copy Writer", avatar: "https://i.pravatar.cc/32?img=29", planned: "30h", dueDate: "Mar 1, 2026" },
];

const REPORT_CARDS: Array<{
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
	badge: string;
	badgeIntent: "information" | "neutral" | "warning";
	configType: "chart" | "table" | "chart+table";
}> = [
	{ id: "utilization", title: "Utilization Report", description: "Shows total utilization per person across all active projects.", icon: <IconClock size={32} strokeWidth={1.5} />, badge: "Chart", badgeIntent: "information", configType: "chart" },
	{ id: "capacity", title: "Capacity Report", description: "Shows hours (or estimated hours) per person by role and employment type.", icon: <IconLayoutColumns size={32} strokeWidth={1.5} />, badge: "Chart", badgeIntent: "information", configType: "chart" },
	{ id: "allocation-vs-capacity", title: "Allocation vs Capacity", description: "Compare each member's assigned workload to their available capacity.", icon: <IconChartBar size={32} strokeWidth={1.5} />, badge: "Table", badgeIntent: "neutral", configType: "table" },
	{ id: "planned-vs-actual", title: "Planned vs Actual Hours", description: "Compare planned/estimated hours to actual hours logged to improve estimation accuracy.", icon: <IconTrendingUp size={32} strokeWidth={1.5} />, badge: "Table", badgeIntent: "neutral", configType: "table" },
	{ id: "steps-frequency", title: "Steps/Tasks Frequency", description: "Identify steps/tasks that repeat frequently per team member to find automation opportunities.", icon: <IconChartBar size={32} strokeWidth={1.5} />, badge: "Table", badgeIntent: "neutral", configType: "table" },
	{ id: "progress-report", title: "Progress Report", description: "Track progress per team member across tasks, workflows, and milestones.", icon: <IconCheckbox size={32} strokeWidth={1.5} />, badge: "Chart + Table", badgeIntent: "warning", configType: "chart+table" },
];

function ConfigLabel({ label, required, help }: { label: string; required?: boolean; help?: boolean }) {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 4 }}>
			<span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>{label}</span>
			{required && <span style={{ color: "#dc2626", fontSize: 14 }}>*</span>}
			{help && <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", border: "1px solid #d1d5db", fontSize: 10, color: "#9ca3af", cursor: "help", flexShrink: 0 }}>?</span>}
		</div>
	);
}

function ConfigSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
	return (
		<select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 36px 10px 14px", fontSize: 14, backgroundColor: "white", cursor: "pointer", outline: "none", color: "#374151", appearance: "none" as const, backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
			{options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
		</select>
	);
}

function ConfigRadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
	return (
		<div style={{ display: "flex", gap: 20, flexWrap: "wrap" as const }}>
			{options.map(opt => (
				<label key={opt} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14, color: "#374151" }}>
					<input type="radio" value={opt} checked={value === opt} onChange={() => onChange(opt)} style={{ accentColor: "#4f46e5", width: 16, height: 16 }} />
					{opt}
				</label>
			))}
		</div>
	);
}

function BarChartPreview({ title }: { title: string }) {
	const bars = UTIL_BARS;
	const maxVal = 100;
	const chartH = 180;
	const barW = 38;
	const barGap = 18;
	const padL = 44;
	const padB = 50;
	const padT = 16;
	const padR = 16;
	const totalW = bars.length * (barW + barGap) + padL + padR;
	const svgH = chartH + padT + padB;
	const yTicks = [0, 23, 46, 69, 92];
	return (
		<div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, background: "white", width: "100%", maxWidth: 560 }}>
			<div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500, color: "#374151" }}>{title || "Untitled"}</div>
			<svg width="100%" viewBox={`0 0 ${totalW} ${svgH}`} style={{ display: "block" }}>
				{yTicks.map(v => {
					const y = padT + chartH - (v / maxVal) * chartH;
					return (
						<g key={v}>
							<line x1={padL} x2={totalW - padR} y1={y} y2={y} stroke="#f3f4f6" strokeWidth={1} />
							<text x={padL - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{v}</text>
						</g>
					);
				})}
				<text transform={`translate(10, ${padT + chartH / 2}) rotate(-90)`} textAnchor="middle" fontSize={10} fill="#9ca3af">Utilization %</text>
				{bars.map((bar, i) => {
					const x = padL + i * (barW + barGap);
					const h = Math.max(2, (bar.value / maxVal) * chartH);
					const y = padT + chartH - h;
					return (
						<g key={bar.name}>
							<rect x={x} y={y} width={barW} height={h} fill={bar.color} rx={2} />
							<text x={x + barW / 2} y={padT + chartH + 16} textAnchor="middle" fontSize={10} fill="#6b7280">{bar.name}</text>
						</g>
					);
				})}
			</svg>
		</div>
	);
}

function AllocationPreview() {
	return (
		<div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "white", width: "100%" }}>
			<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
				<thead>
					<tr style={{ borderBottom: "1px solid #e5e7eb" }}>
						{["Team Member", "Role", "Assigned Hrs", "Capacity Hrs", "Over/Under", "% Allocated"].map(h => (
							<th key={h} style={{ padding: "10px 14px", fontWeight: 600, textAlign: "left", color: "#374151", whiteSpace: "nowrap" }}>{h}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{ALLOC_ROWS.map((row, i) => (
						<tr key={i} style={{ backgroundColor: row.over ? "#fef2f2" : "transparent", borderBottom: i < ALLOC_ROWS.length - 1 ? "1px solid #f3f4f6" : "none" }}>
							<td style={{ padding: "10px 14px", fontWeight: 500 }}>{row.member}</td>
							<td style={{ padding: "10px 14px", color: "#6b7280" }}>{row.role}</td>
							<td style={{ padding: "10px 14px" }}>{row.assigned}</td>
							<td style={{ padding: "10px 14px" }}>{row.capacity}</td>
							<td style={{ padding: "10px 14px", color: row.over ? "#dc2626" : "#16a34a", fontWeight: 500 }}>{row.overUnder}</td>
							<td style={{ padding: "10px 14px" }}>
								<span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 500, backgroundColor: row.over ? "#fee2e2" : "#dcfce7", color: row.over ? "#dc2626" : "#16a34a" }}>{row.pct}</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function PlannedActualPreview() {
	return (
		<div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "white", width: "100%" }}>
			<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
				<thead>
					<tr style={{ borderBottom: "1px solid #e5e7eb" }}>
						{["Step", "Status", "Logged By", "Utilization", "Planned", "Actual"].map(h => (
							<th key={h} style={{ padding: "10px 14px", fontWeight: 500, textAlign: "left", color: "#6b7280", whiteSpace: "nowrap" }}>{h}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{PLANNED_ACTUAL_ROWS.map((row, i) => (
						<tr key={i} style={{ borderBottom: i < PLANNED_ACTUAL_ROWS.length - 1 ? "1px solid #f3f4f6" : "none" }}>
							<td style={{ padding: "14px 14px" }}>
								<div style={{ fontWeight: 600, color: "#111827", marginBottom: 2 }}>{row.step}</div>
								<div style={{ fontSize: 12, color: "#6b7280" }}>{row.substep}</div>
							</td>
							<td style={{ padding: "14px 14px" }}>
								<span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: "#dcfce7", color: "#16a34a" }}>{row.status}</span>
							</td>
							<td style={{ padding: "14px 14px" }}>
								<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
									<img src={row.avatar} alt={row.loggedBy} style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0 }} />
									<div>
										<div style={{ fontWeight: 500, color: "#111827" }}>{row.loggedBy}</div>
										<div style={{ fontSize: 11, color: "#6b7280" }}>{row.role}</div>
									</div>
								</div>
							</td>
							<td style={{ padding: "14px 14px", color: "#374151" }}>{row.utilization}</td>
							<td style={{ padding: "14px 14px", color: "#374151" }}>{row.planned}</td>
							<td style={{ padding: "14px 14px", color: "#374151" }}>{row.actual}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function StepsFrequencyPreview() {
	return (
		<div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "white", width: "100%" }}>
			<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
				<thead>
					<tr style={{ borderBottom: "1px solid #e5e7eb" }}>
						{["Step Name", "Team Member", "Frequency", "Avg Time (min)"].map(h => (
							<th key={h} style={{ padding: "10px 14px", fontWeight: 600, textAlign: "left", color: "#374151" }}>{h}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{STEPS_FREQ_ROWS.map((row, i) => (
						<tr key={i} style={{ borderBottom: i < STEPS_FREQ_ROWS.length - 1 ? "1px solid #f3f4f6" : "none" }}>
							<td style={{ padding: "10px 14px", fontWeight: 500 }}>{row.step}</td>
							<td style={{ padding: "10px 14px", color: "#6b7280" }}>{row.member}</td>
							<td style={{ padding: "10px 14px" }}>{row.frequency}</td>
							<td style={{ padding: "10px 14px" }}>{row.avgTime}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function ProgressPreview() {
	return (
		<div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "white", width: "100%" }}>
			<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
				<thead>
					<tr style={{ borderBottom: "1px solid #e5e7eb" }}>
						{["Task", "Status", "Assignee", "Planned", "Due Date"].map(h => (
							<th key={h} style={{ padding: "10px 14px", fontWeight: 500, textAlign: "left", color: "#6b7280", whiteSpace: "nowrap" }}>{h}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{PROGRESS_DETAIL.map((row, i) => (
						<tr key={i} style={{ borderBottom: i < PROGRESS_DETAIL.length - 1 ? "1px solid #f3f4f6" : "none" }}>
							<td style={{ padding: "14px 14px" }}>
								<div style={{ fontWeight: 600, color: "#111827", marginBottom: 2 }}>{row.task}</div>
								<div style={{ fontSize: 12, color: "#6b7280" }}>{row.subtask}</div>
							</td>
							<td style={{ padding: "14px 14px" }}>
								<span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: "#eff6ff", color: "#3b82f6" }}>{row.status}</span>
							</td>
							<td style={{ padding: "14px 14px" }}>
								<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
									<img src={row.avatar} alt={row.assignee} style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0 }} />
									<div>
										<div style={{ fontWeight: 500, color: "#111827" }}>{row.assignee}</div>
										<div style={{ fontSize: 11, color: "#6b7280" }}>{row.role}</div>
									</div>
								</div>
							</td>
							<td style={{ padding: "14px 14px", color: "#374151" }}>{row.planned}</td>
							<td style={{ padding: "14px 14px", color: "#374151" }}>{row.dueDate}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CMPResourceManagementPage() {
	const { setHidePageHeader } = useLayout();
	const { theme } = useTheme();
	const [activeTab, setActiveTab] = useState<ResourceTab>("workload");
	const [plannerWeekIndex, setPlannerWeekIndex] = useState(0);
	const [selectedPlannerPersonId, setSelectedPlannerPersonId] = useState<string | undefined>();
	const [plannerCards, setPlannerCards] = useState<PlannerCard[]>(
		() => normalizePlannerCardLanes(generatePlannerCardsFromTargets())
	);
	const visiblePlannerWeeks = getPlannerViewportWeeks(plannerWeekIndex);
	const workloadRows = buildWorkloadRows(plannerCards);

	// Reports state
	const [reportsView, setReportsView] = useState<"list" | "detail" | "configure">("list");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [newDashboardTitle, setNewDashboardTitle] = useState("");
	const [dashboards, setDashboards] = useState<Array<{ id: string; title: string; lastModified: string; owner: string }>>([]);
	const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null);
	const [dashboardCards, setDashboardCards] = useState<Record<string, string[]>>({});
	const [showAddCard, setShowAddCard] = useState(false);
	const [configuringCardId, setConfiguringCardId] = useState<string | null>(null);
	const [reportTitle, setReportTitle] = useState("");
	const [chartType, setChartType] = useState("Column");
	const [groupBy, setGroupBy] = useState("Status");
	const [pivotBy, setPivotBy] = useState("Please select");
	const [filterRows, setFilterRows] = useState<Array<{ id: string; field: string; operator: string; value: string }>>([]);
	const addFilterRow = () => setFilterRows(prev => [...prev, { id: `f-${Date.now()}`, field: "Campaign", operator: "Is", value: "" }]);
	const removeFilterRow = (id: string) => setFilterRows(prev => prev.filter(r => r.id !== id));
	const updateFilterRow = (id: string, key: string, val: string) => setFilterRows(prev => prev.map(r => r.id === id ? { ...r, [key]: val } : r));

	const handleSelectWorkloadCell = (personId: string, weekIndex: number) => {
		setSelectedPlannerPersonId(personId);
		setPlannerWeekIndex(weekIndex);
		setActiveTab("planner");
	};

	const handlePlannerWeekChange = (direction: -1 | 1) => {
		setPlannerWeekIndex((current) =>
			Math.min(weekColumns.length - 1, Math.max(0, current + direction))
		);
	};

	useEffect(() => {
		setHidePageHeader(true);
		return () => setHidePageHeader(false);
	}, [setHidePageHeader]);

	const filterSection = (
		<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
			<ConfigLabel label="Filter by" help />
			{filterRows.map(row => (
				<div key={row.id} style={{ display: "flex", gap: 6, alignItems: "center" }}>
					<select value={row.field} onChange={e => updateFilterRow(row.id, "field", e.target.value)}
						style={{ flex: "0 0 130px", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "#374151", outline: "none", background: "white" }}>
						{["Campaign", "Step", "Status", "Team Member", "Role"].map(o => <option key={o}>{o}</option>)}
					</select>
					<select value={row.operator} onChange={e => updateFilterRow(row.id, "operator", e.target.value)}
						style={{ flex: "0 0 90px", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "#374151", outline: "none", background: "white" }}>
						{["Is", "Is not", "Contains"].map(o => <option key={o}>{o}</option>)}
					</select>
					<input value={row.value} onChange={e => updateFilterRow(row.id, "value", e.target.value)}
						placeholder="Value..."
						style={{ flex: 1, border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "#374151", outline: "none" }} />
					<button onClick={() => removeFilterRow(row.id)}
						style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "4px", display: "flex", alignItems: "center", flexShrink: 0 }}>
						<IconX size={16} />
					</button>
				</div>
			))}
			<button onClick={addFilterRow}
				style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151", padding: "4px 0" }}>
				<IconPlus size={14} /> Add Filter
			</button>
			<button onClick={addFilterRow}
				style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151", padding: "4px 0" }}>
				<IconPlus size={14} /> Add New Group
			</button>
		</div>
	);

	return (
		<Box
			bg="bg.page"
			display="flex"
			flexDirection="column"
			style={{
				height: "100%",
				overflow: "hidden",
				position: "relative",
			}}
		>
			{/* Tabs */}
			{reportsView !== "configure" && (
				<Box borderB="1" borderColor="border.tertiary" display="flex" style={{ gap: 28, padding: "32px 32px 0" }}>
					<WorkloadTabButton active={activeTab === "workload"} onClick={() => setActiveTab("workload")}>
						Workload
					</WorkloadTabButton>
					<WorkloadTabButton active={activeTab === "planner"} onClick={() => setActiveTab("planner")}>
						Planner
					</WorkloadTabButton>
					<WorkloadTabButton active={activeTab === "reports"} onClick={() => setActiveTab("reports")}>
						Reports
					</WorkloadTabButton>
				</Box>
			)}

			{/* Content area */}
			<Box
				display="flex"
				flex="1"
				flexDirection="column"
				px="32"
				pt="24"
				pb="24"
				style={{ minHeight: 0, overflow: "auto" }}
			>
				{/* Workload tab */}
				{activeTab === "workload" ? (
					<Box display="flex" flex="1" flexDirection="column" gap="16" w="full" style={{ minHeight: 0 }}>
						<Box alignItems="center" display="flex" gap="12" justifyContent="space-between" flexWrap="wrap">
							<Box alignItems="center" display="flex" gap="12" flexWrap="wrap">
								<div style={{ position: "relative" }}>
									<Button appearance="subtle" aria-label="Filter workload" size="md">
										<IconFilter size={16} />
									</Button>
									<div style={{ position: "absolute", right: -4, top: -6 }}>
										<Badge intent="primary">2</Badge>
									</div>
								</div>
								<Button appearance="default" onClick={() => setPlannerWeekIndex(0)} size="md">Today</Button>
								<Box alignItems="center" display="flex" gap="8">
									<Button appearance="subtle" aria-label="Previous date range" disabled={plannerWeekIndex === 0} onClick={() => handlePlannerWeekChange(-1)} size="sm">
										<IconChevronLeft size={16} />
									</Button>
									<Text color="fg.default" fontSize="sm" fontWeight="600" style={{ maxWidth: "none" }}>Jun 1 - Aug 30 2025</Text>
									<Button appearance="subtle" aria-label="Next date range" disabled={plannerWeekIndex === weekColumns.length - 1} onClick={() => handlePlannerWeekChange(1)} size="sm">
										<IconChevronRight size={16} />
									</Button>
								</Box>
							</Box>
						</Box>
						<Box flex="1" w="full" style={{ minHeight: 0 }}>
							<WorkloadGrid onSelectCell={handleSelectWorkloadCell} rows={workloadRows} selectedPersonId={selectedPlannerPersonId} selectedWeekIndex={plannerWeekIndex} theme={theme} />
						</Box>
					</Box>
				) : null}

				{/* Planner tab */}
				{activeTab === "planner" ? (
					<Box display="flex" flex="1" flexDirection="column" gap="16" w="full" style={{ minHeight: 0 }}>
						<Box alignItems="center" display="flex" gap="12" justifyContent="space-between" flexWrap="wrap">
							<Box alignItems="center" display="flex" gap="12" flexWrap="wrap">
								<div style={{ position: "relative" }}>
									<Button appearance="subtle" aria-label="Filter planner" size="md">
										<IconFilter size={16} />
									</Button>
									<div style={{ position: "absolute", right: -4, top: -6 }}>
										<Badge intent="primary">2</Badge>
									</div>
								</div>
								<Button appearance="default" onClick={() => setPlannerWeekIndex(0)} size="md">Today</Button>
								<Box alignItems="center" display="flex" gap="8">
									<Button appearance="subtle" aria-label="Previous planner range" disabled={plannerWeekIndex === 0} onClick={() => handlePlannerWeekChange(-1)} size="sm">
										<IconChevronLeft size={16} />
									</Button>
									<Text color="fg.default" fontSize="sm" fontWeight="600" style={{ maxWidth: "none" }}>{getPlannerViewportLabel(visiblePlannerWeeks)}</Text>
									<Button appearance="subtle" aria-label="Next planner range" disabled={plannerWeekIndex === weekColumns.length - 1} onClick={() => handlePlannerWeekChange(1)} size="sm">
										<IconChevronRight size={16} />
									</Button>
								</Box>
							</Box>
							<Box alignItems="center" display="flex" gap="8">
								<Text color="fg.default" fontSize="sm" style={{ maxWidth: "none" }}>Unscoped Steps</Text>
								<Badge intent="primary">24</Badge>
							</Box>
						</Box>
						<Box flex="1" style={{ minHeight: 0 }}>
							<PlannerGrid cards={plannerCards} selectedPersonId={selectedPlannerPersonId} setCards={setPlannerCards} theme={theme} visibleWeeks={visiblePlannerWeeks} />
						</Box>
					</Box>
				) : null}

				{/* Reports – list */}
				{activeTab === "reports" && reportsView === "list" ? (
					<Box display="flex" flexDirection="column" gap="16">
						<Box alignItems="center" display="flex" justifyContent="space-between" gap="12">
							<SearchInput placeholder="Search dashboards..." w="224" />
							<Button appearance="primary" icon={<IconPlus size={16} />} onClick={() => { setShowCreateModal(true); setNewDashboardTitle(""); }}>
								Create Dashboard
							</Button>
						</Box>
						{dashboards.length === 0 ? (
							<Box alignItems="center" bg="bg.default" border="1" borderColor="border.tertiary" display="flex" justifyContent="center" rounded="lg" style={{ minHeight: 320 }}>
								<Box display="flex" flexDirection="column" gap="8" textAlign="center" alignItems="center">
									<Text color="fg.default" fontSize="lg" fontWeight="600">No dashboards yet</Text>
									<Text color="fg.secondary" fontSize="sm" style={{ maxWidth: 320 }}>Create a dashboard to start building reports.</Text>
								</Box>
							</Box>
						) : (
							<div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "white" }}>
								<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
									<thead>
										<tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
											{["Title", "Last Modified", "Owner", ""].map(h => (
												<th key={h} style={{ padding: "10px 16px", fontWeight: 600, textAlign: "left", color: "#374151" }}>{h}</th>
											))}
										</tr>
									</thead>
									<tbody>
										{dashboards.map((d, i) => (
											<tr key={d.id} style={{ borderBottom: i < dashboards.length - 1 ? "1px solid #f3f4f6" : "none", cursor: "pointer" }}
												onClick={() => { setActiveDashboardId(d.id); setReportsView("detail"); }}>
												<td style={{ padding: "12px 16px", fontWeight: 500, color: "#3d63f5" }}>{d.title}</td>
												<td style={{ padding: "12px 16px", color: "#6b7280" }}>{d.lastModified}</td>
												<td style={{ padding: "12px 16px", color: "#6b7280" }}>{d.owner}</td>
												<td style={{ padding: "12px 16px", textAlign: "right" }}>
													<Button appearance="subtle" size="sm" onClick={e => { e.stopPropagation(); setDashboards(prev => prev.filter(x => x.id !== d.id)); }}>
														<IconX size={14} />
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</Box>
				) : null}

				{/* Reports – detail */}
				{activeTab === "reports" && reportsView === "detail" ? (() => {
					const dashboard = dashboards.find(d => d.id === activeDashboardId);
					const cards = dashboardCards[activeDashboardId || ""] || [];
					return (
						<Box display="flex" flexDirection="column" gap="24">
							<Box alignItems="center" display="flex" justifyContent="space-between">
								<Box alignItems="center" display="flex" gap="4">
									<button onClick={() => setReportsView("list")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 14, color: "#6b7280" }}>
										Dashboards
									</button>
									<span style={{ fontSize: 14, color: "#9ca3af", padding: "0 2px" }}>/</span>
									<span style={{ fontSize: 14, color: "#111827", fontWeight: 500 }}>{dashboard?.title}</span>
								</Box>
								<Box alignItems="center" display="flex" gap="8">
									<Avatar name="TT" size="sm" />
									<Button appearance="default" icon={<IconShare size={16} />}>Share</Button>
									<Button appearance="primary" icon={<IconPlus size={16} />} onClick={() => setShowAddCard(true)}>Add Card</Button>
								</Box>
							</Box>
							<Text color="fg.default" fontSize="xl" fontWeight="600" style={{ maxWidth: "none", textAlign: "center", display: "block" }}>{dashboard?.title}</Text>
							{cards.length === 0 ? (
								<Box border="1" borderColor="border.tertiary" rounded="lg" bg="bg.page" style={{ minHeight: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 32px", gap: 12 }}>
									<Text color="fg.default" fontSize="lg" fontWeight="600" style={{ maxWidth: "none", textAlign: "center" }}>Your dashboard is ready!</Text>
									<Text color="fg.secondary" fontSize="sm" style={{ maxWidth: 500, textAlign: "center", display: "block", lineHeight: 1.6 }}>
										Begin by adding a card to visualize your data. Remember, this dashboard is fully customizable—tailor it to your needs by adding, rearranging, and adjusting cards as you see fit.
									</Text>
									<svg width="260" height="200" viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: 16 }}>
										<ellipse cx="130" cy="168" rx="88" ry="14" fill="#b2dfdb" opacity="0.4" />
										<circle cx="72" cy="56" r="14" fill="#b2dfdb" /><rect x="59" y="70" width="26" height="36" rx="7" fill="#263238" /><rect x="57" y="103" width="11" height="26" rx="4" fill="#263238" /><rect x="72" y="103" width="11" height="26" rx="4" fill="#263238" />
										<rect x="83" y="82" width="30" height="30" rx="4" fill="#4dd0e1" /><rect x="94" y="74" width="9" height="9" rx="4.5" fill="#4dd0e1" /><rect x="94" y="112" width="9" height="9" rx="4.5" fill="#80deea" />
										<circle cx="130" cy="52" r="14" fill="#cfd8dc" /><rect x="117" y="66" width="26" height="36" rx="7" fill="#eceff1" /><rect x="115" y="99" width="11" height="26" rx="4" fill="#546e7a" /><rect x="130" y="99" width="11" height="26" rx="4" fill="#546e7a" />
										<rect x="113" y="78" width="30" height="30" rx="4" fill="#80deea" /><rect x="148" y="88" width="9" height="9" rx="4.5" fill="#80deea" /><rect x="104" y="88" width="9" height="9" rx="4.5" fill="#4dd0e1" />
										<circle cx="188" cy="56" r="14" fill="#b2dfdb" /><rect x="175" y="70" width="26" height="36" rx="7" fill="#1a237e" opacity="0.85" /><rect x="173" y="103" width="11" height="26" rx="4" fill="#1a237e" opacity="0.85" /><rect x="188" y="103" width="11" height="26" rx="4" fill="#1a237e" opacity="0.85" />
										<rect x="143" y="82" width="30" height="30" rx="4" fill="#26c6da" /><rect x="154" y="74" width="9" height="9" rx="4.5" fill="#26c6da" /><rect x="154" y="112" width="9" height="9" rx="4.5" fill="#4dd0e1" />
									</svg>
								</Box>
							) : (
								<Box display="flex" flexDirection="column" gap="12">
									{cards.map(cardId => {
										const rc = REPORT_CARDS.find(c => c.id === cardId);
										if (!rc) return null;
										return (
											<Box key={cardId} border="1" borderColor="border.tertiary" rounded="lg" p="20" bg="bg.default">
												<Text color="fg.default" fontWeight="600">{rc.title}</Text>
											</Box>
										);
									})}
								</Box>
							)}
						</Box>
					);
				})() : null}
			</Box>

			{/* Reports – configure (absolute overlay) */}
			{activeTab === "reports" && reportsView === "configure" && configuringCardId ? (() => {
				const card = REPORT_CARDS.find(c => c.id === configuringCardId);
				if (!card) return null;
				const isTitleValid = reportTitle.trim().length > 0;
				const goBack = () => { setReportsView("detail"); setConfiguringCardId(null); };

				const renderPreview = () => {
					if (card.configType === "chart") return <BarChartPreview title={reportTitle} />;
					if (card.configType === "table") {
						if (card.id === "allocation-vs-capacity") return <AllocationPreview />;
						if (card.id === "planned-vs-actual") return <PlannedActualPreview />;
						return <StepsFrequencyPreview />;
					}
					return <ProgressPreview />;
				};

				const renderConfig = () => (
					<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
						<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
							<ConfigLabel label="Title" required />
							<input value={reportTitle} onChange={e => setReportTitle(e.target.value.slice(0, 80))} placeholder="Please enter a title"
								style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", color: "#374151", boxSizing: "border-box" as const }} />
							<span style={{ fontSize: 12, color: "#9ca3af" }}>{reportTitle.length}/80</span>
						</div>
						{(card.configType === "chart" || card.configType === "chart+table") && (
							<>
								<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
									<ConfigLabel label="Chart Type" />
									<ConfigRadioGroup options={["Column", "Bar", "Line", "Pie"]} value={chartType} onChange={setChartType} />
								</div>
								<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
									<ConfigLabel label="Group by" required help />
									<ConfigSelect value={groupBy} onChange={setGroupBy} options={["Status", "Team Member", "Role", "Project", "Department"]} />
								</div>
								<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
									<ConfigLabel label="Pivot by" help />
									<ConfigSelect value={pivotBy} onChange={setPivotBy} options={["Please select", "Team Member", "Role", "Project"]} />
								</div>
							</>
						)}
						{filterSection}
					</div>
				);

				return (
					<div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: 50, background: "white", display: "flex", flexDirection: "column", overflow: "hidden" }}>
						<div style={{ padding: "24px 32px 20px", flexShrink: 0, textAlign: "center" }}>
							<div style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 4 }}>{card.title}</div>
							<div style={{ fontSize: 14, color: "#6b7280" }}>{card.description}</div>
						</div>
						<div style={{ display: "grid", gridTemplateColumns: "1fr 400px", flex: 1, minHeight: 0, overflow: "hidden" }}>
							<div style={{ overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, background: "#f9fafb" }}>
								{renderPreview()}
							</div>
							<div style={{ overflowY: "auto", padding: "28px 32px", background: "white" }}>
								{renderConfig()}
							</div>
						</div>
						<div style={{ flexShrink: 0, borderTop: "1px solid #e5e7eb", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "white" }}>
							<Button appearance="subtle" onClick={goBack} icon={<IconChevronLeft size={16} />}>Go Back</Button>
							<div style={{ display: "flex", gap: 12 }}>
								<Button appearance="default" onClick={goBack}>Cancel</Button>
								<Button appearance="primary" disabled={!isTitleValid} onClick={() => {
									if (!activeDashboardId) return;
									setDashboardCards(prev => ({ ...prev, [activeDashboardId]: [...(prev[activeDashboardId] || []), card.id] }));
									setReportsView("detail");
									setConfiguringCardId(null);
								}}>Save</Button>
							</div>
						</div>
					</div>
				);
			})() : null}

			{/* Create Dashboard modal */}
			{showCreateModal ? createPortal(
				<div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
					<div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} onClick={() => setShowCreateModal(false)} />
					<div style={{ position: "relative", background: "white", borderRadius: 12, width: 480, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", overflow: "hidden" }}>
						<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px" }}>
							<span style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Create Dashboard</span>
							<button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, display: "flex", alignItems: "center" }}>
								<IconX size={18} />
							</button>
						</div>
						<div style={{ padding: "8px 24px 20px" }}>
							<input autoFocus value={newDashboardTitle} onChange={e => setNewDashboardTitle(e.target.value)}
								onKeyDown={e => {
									if (e.key === "Enter" && newDashboardTitle.trim()) {
										const id = `db-${Date.now()}`;
										setDashboards(prev => [...prev, { id, title: newDashboardTitle.trim(), lastModified: "Just now", owner: "You" }]);
										setActiveDashboardId(id); setDashboardCards(prev => ({ ...prev, [id]: [] }));
										setShowCreateModal(false); setReportsView("detail");
									}
								}}
								placeholder="Enter a title here"
								style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", color: "#374151", boxSizing: "border-box" as const }} />
						</div>
						<div style={{ borderTop: "1px solid #e5e7eb", padding: "14px 24px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
							<Button appearance="subtle" onClick={() => setShowCreateModal(false)}>Cancel</Button>
							<Button appearance="primary" disabled={!newDashboardTitle.trim()} onClick={() => {
								const id = `db-${Date.now()}`;
								setDashboards(prev => [...prev, { id, title: newDashboardTitle.trim(), lastModified: "Just now", owner: "You" }]);
								setActiveDashboardId(id); setDashboardCards(prev => ({ ...prev, [id]: [] }));
								setShowCreateModal(false); setReportsView("detail");
							}}>Create</Button>
						</div>
					</div>
				</div>,
				document.body
			) : null}

			{/* Add Card modal */}
			<Dialog open={showAddCard} onOpenChange={setShowAddCard}>
				<DialogContent size="md">
					<DialogHeader textAlign="center" description="Choose a reporting card to add to your Resource Management dashboard">
						Add a Card
					</DialogHeader>
					<DialogBody>
						<Box display="grid" gap="16" style={{ gridTemplateColumns: "1fr 1fr" }}>
							{REPORT_CARDS.map(rc => (
								<Box key={rc.id} border="1" borderColor="border.default" rounded="lg" p="24"
									display="flex" flexDirection="column" alignItems="center"
									style={{ textAlign: "center", cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s" }}
									onClick={() => { setConfiguringCardId(rc.id); setReportTitle(""); setShowAddCard(false); setReportsView("configure"); }}>
									<Box color="fg.tertiary" mb="16">{rc.icon}</Box>
									<Box fontSize="md" fontWeight="600" color="fg.default" mb="8">{rc.title}</Box>
									<Box fontSize="sm" color="fg.secondary" mb="16" style={{ lineHeight: 1.6 }}>{rc.description}</Box>
									<Badge intent={rc.badgeIntent}>{rc.badge}</Badge>
								</Box>
							))}
						</Box>
					</DialogBody>
				</DialogContent>
			</Dialog>
		</Box>
	);
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import {
	Badge, Box, Button, Checkbox, Heading, LabelMenuButton, Menu, MenuContent, MenuTrigger,
	Tabs, TabsContent, TabsList, TabsTrigger, Text,
} from "@optiaxiom/react";
import { IconArrowDown, IconArrowRight, IconArrowUp, IconArrowUpRightFromSquare, IconDiagramSubtask, IconChevronLeft, IconChevronRight, IconGear, IconGripVertical, IconSearch } from "@optiaxiom/icons";
import { Input } from "@/app/components/Input";
import { VAUS } from "@/app/opal/data/vaus";

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 12,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase" as const,
};

const SECTION_HEADING: React.CSSProperties = {
	fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)",
	fontSize: 18,
	fontWeight: 600,
	lineHeight: "1.2",
	color: "var(--ax-colors-fg-default)",
};

const TABLE_HEADER: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 10,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase" as const,
	color: "var(--ax-colors-fg-tertiary)",
	display: "inline-flex",
	alignItems: "center",
	gap: 4,
};

const ACTIVITY_ROWS = [
	{ task: "Email triage",   runs: 142, pct: 96,  avgMin: 4 },
	{ task: "Morning brief",  runs: 90,  pct: 100, avgMin: 1 },
	{ task: "Meeting prep",   runs: 34,  pct: 100, avgMin: 6 },
	{ task: "Follow-ups",     runs: 28,  pct: 82,  avgMin: 8 },
	{ task: "Status nudges",  runs: 19,  pct: 95,  avgMin: 2 },
	{ task: "Weekly recap",   runs: 12,  pct: 100, avgMin: 5 },
];

const INITIAL_QUEUE = [
	{ id: "q1", task: "Meeting Prep",   sub: "Pre-meeting brief",         time: "11:00 AM" },
	{ id: "q2", task: "Email Triage",   sub: "Daily inbox sweep",         time: "11:30 AM" },
	{ id: "q3", task: "Status Nudges",  sub: "Follow-up reminders sent",  time: "12:00 PM" },
	{ id: "q4", task: "Meeting Prep",   sub: "Pre-meeting brief",         time: "1:00 PM" },
];

const COMPLETED_ITEMS = [
	{ id: "c1",  task: "Email Triage",     sub: "Daily inbox sweep",             dateIndex: 0,  executionTime: "Jul 6, 2026, 9:53 AM",  trigger: "scheduled" as const, type: "Workflow", credits: 118, duration: "2m 12s" },
	{ id: "c2",  task: "Meeting Prep",     sub: "Pre-meeting brief",             dateIndex: 1,  executionTime: "Jul 6, 2026, 8:01 AM",  trigger: "scheduled" as const, type: "Workflow", credits: 184, duration: "3m 41s" },
	{ id: "c3",  task: "Status Nudges",    sub: "Follow-up reminders sent",      dateIndex: 2,  executionTime: "Jul 5, 2026, 4:12 PM",  trigger: "message" as const,   type: "Workflow", credits: 92,  duration: "1m 28s" },
	{ id: "c4",  task: "Morning Brief",    sub: "Daily digest delivered",        dateIndex: 3,  executionTime: "Jul 5, 2026, 7:00 AM",  trigger: "scheduled" as const, type: "Workflow", credits: 163, duration: "2m 55s" },
	{ id: "c5",  task: "Follow-ups",       sub: "Feedback loop continued",       dateIndex: 4,  executionTime: "Jul 4, 2026, 2:45 PM",  trigger: "message" as const,   type: "Workflow", credits: 104, duration: "1m 50s" },
	{ id: "c6",  task: "Weekly Recap",     sub: "End-of-week performance summary", dateIndex: 5, executionTime: "Jul 4, 2026, 5:00 PM",  trigger: "scheduled" as const, type: "Workflow", credits: 228, duration: "4m 22s" },
	{ id: "c7",  task: "Meeting Prep",     sub: "Pre-meeting brief",             dateIndex: 6,  executionTime: "Jul 3, 2026, 9:30 AM",  trigger: "scheduled" as const, type: "Workflow", credits: 177, duration: "3m 38s" },
	{ id: "c8",  task: "Email Triage",     sub: "Daily inbox sweep",             dateIndex: 7,  executionTime: "Jul 3, 2026, 1:00 PM",  trigger: "scheduled" as const, type: "Workflow", credits: 121, duration: "2m 08s" },
	{ id: "c9",  task: "Status Nudges",    sub: "Follow-up reminders sent",      dateIndex: 8,  executionTime: "Jul 2, 2026, 3:20 PM",  trigger: "message" as const,   type: "Workflow", credits: 88,  duration: "1m 32s" },
	{ id: "c10", task: "Morning Brief",    sub: "Daily digest delivered",        dateIndex: 9,  executionTime: "Jul 2, 2026, 7:00 AM",  trigger: "scheduled" as const, type: "Workflow", credits: 158, duration: "2m 48s" },
	{ id: "c11", task: "Competitor Intel", sub: "Weekly landscape digest",            dateIndex: 10, executionTime: "Jul 1, 2026, 11:15 AM", trigger: "scheduled" as const, type: "Workflow", credits: 203, duration: "3m 57s" },
	{ id: "c12", task: "Follow-ups",       sub: "Feedback loop continued",           dateIndex: 11, executionTime: "Jul 1, 2026, 10:02 AM", trigger: "message" as const,   type: "Workflow", credits: 97,  duration: "1m 44s" },
];

const TIME_FRAME_OPTIONS = ["Past 7 days", "Past 30 days", "Past 90 days", "All time"];

const TOP_TASKS = [
	{ name: "Meeting prep", credits: "1,240" },
	{ name: "Daily brief", credits: "820" },
	{ name: "Weekly wrap", credits: "620" },
	{ name: "Status nudges", credits: "480" },
	{ name: "Email triage", credits: "240" },
];
const COMPLETED_PAGE_SIZE = 5;

type SortKey = "task" | "executionTime" | "trigger";
type SortDir = "asc" | "desc";

type ColKey = "executionTime" | "trigger" | "status" | "credits" | "type" | "duration";

const COL_META: Record<ColKey, { label: string; width: number; sortKey?: SortKey }> = {
	executionTime: { label: "Execution Time", width: 200, sortKey: "executionTime" },
	trigger:       { label: "Trigger",        width: 140, sortKey: "trigger" },
	status:        { label: "Status",         width: 120 },
	credits:       { label: "Credits",        width: 90 },
	type:          { label: "Type",           width: 110 },
	duration:      { label: "Duration",       width: 100 },
};
const DEFAULT_COL_ORDER: ColKey[] = ["executionTime", "trigger", "status", "credits", "type", "duration"];

function QueueStatusBadge({ status }: { status: "next_up" | "queued" }) {
	return <Badge intent="primary" variant="strong">{status === "next_up" ? "Next up" : "Queued"}</Badge>;
}


export default function VATActivityPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const name = vau?.characterName ?? vau?.name ?? "Randy";

	// Queue drag-and-drop
	const [queueItems, setQueueItems] = useState(INITIAL_QUEUE);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
	const dragIndexRef = useRef<number | null>(null);

	const handleDragStart = (index: number) => {
		dragIndexRef.current = index;
	};
	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		setDragOverIndex(index);
	};
	const handleDrop = (targetIndex: number) => {
		const from = dragIndexRef.current;
		if (from === null || from === targetIndex) { setDragOverIndex(null); return; }
		const updated = [...queueItems];
		const [moved] = updated.splice(from, 1);
		updated.splice(targetIndex, 0, moved);
		setQueueItems(updated);
		dragIndexRef.current = null;
		setDragOverIndex(null);
	};
	const handleDragEnd = () => {
		dragIndexRef.current = null;
		setDragOverIndex(null);
	};

	// Column visibility + order
	const [visibleCols, setVisibleCols] = useState<Set<ColKey>>(new Set(DEFAULT_COL_ORDER));
	const [colOrder, setColOrder] = useState<ColKey[]>([...DEFAULT_COL_ORDER]);
	const [colConfigOpen, setColConfigOpen] = useState(false);
	const colConfigRef = useRef<HTMLDivElement>(null);
	const [dragColKey, setDragColKey] = useState<ColKey | null>(null);
	const [dragOverColKey, setDragOverColKey] = useState<ColKey | null>(null);

	const toggleCol = (key: ColKey) =>
		setVisibleCols((prev) => {
			const next = new Set(prev);
			next.has(key) ? next.delete(key) : next.add(key);
			return next;
		});

	const handleColDragOver = (e: React.DragEvent, key: ColKey) => { e.preventDefault(); setDragOverColKey(key); };
	const handleColDrop = (targetKey: ColKey) => {
		if (!dragColKey || dragColKey === targetKey) return;
		setColOrder((prev) => {
			const from = prev.indexOf(dragColKey);
			const to = prev.indexOf(targetKey);
			const next = [...prev];
			const [moved] = next.splice(from, 1);
			next.splice(to, 0, moved);
			return next;
		});
		setDragColKey(null);
		setDragOverColKey(null);
	};

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (colConfigRef.current && !colConfigRef.current.contains(e.target as Node)) {
				setColConfigOpen(false);
			}
		};
		if (colConfigOpen) document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [colConfigOpen]);

	// Completed filters
	const [completedQuery, setCompletedQuery] = useState("");
	const [completedStatus, setCompletedStatus] = useState("All");
	const [completedDateRange, setCompletedDateRange] = useState("All time");

	// Completed sort + pagination
	const [sortKey, setSortKey] = useState<SortKey>("executionTime");
	const [sortDir, setSortDir] = useState<SortDir>("asc");
	const [completedPage, setCompletedPage] = useState(0);

	const handleSort = (key: SortKey) => {
		if (sortKey === key) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortKey(key);
			setSortDir("asc");
		}
		setCompletedPage(0);
	};

	// Column render helpers
	const renderHeaderCell = (key: ColKey) => {
		const meta = COL_META[key];
		if (meta.sortKey) {
			return (
				<Box key={key} style={{ width: meta.width, cursor: "pointer", userSelect: "none" as const }} onClick={() => handleSort(meta.sortKey!)}>
					<span style={TABLE_HEADER}>{meta.label}<SortIcon col={meta.sortKey!} /></span>
				</Box>
			);
		}
		return <span key={key} style={{ ...TABLE_HEADER, width: meta.width }}>{meta.label}</span>;
	};

	const renderRowCell = (item: (typeof COMPLETED_ITEMS)[0], key: ColKey) => {
		const { width } = COL_META[key];
		switch (key) {
			case "executionTime": return <Text key={key} fontSize="sm" color="fg.secondary" style={{ width }}>{item.executionTime}</Text>;
			case "trigger":       return <Box key={key} style={{ width }}>{item.trigger === "message" ? <Badge intent="information" variant="subtle">Message</Badge> : <Badge variant="subtle">Scheduled</Badge>}</Box>;
			case "status":        return <Box key={key} style={{ width }}><Badge intent="success" variant="subtle">Completed</Badge></Box>;
			case "credits":       return <Text key={key} fontSize="sm" color="fg.secondary" style={{ width }}>{item.credits.toLocaleString()}</Text>;
			case "type":          return <Box key={key} style={{ width }}><Badge variant="subtle">{item.type}</Badge></Box>;
			case "duration":      return <Text key={key} fontSize="sm" color="fg.secondary" style={{ width }}>{item.duration}</Text>;
		}
	};

	const filteredCompleted = COMPLETED_ITEMS.filter((item) => {
		const q = completedQuery.trim().toLowerCase();
		if (q && !item.task.toLowerCase().includes(q) && !item.sub.toLowerCase().includes(q)) return false;
		if (completedStatus !== "All" && completedStatus.toLowerCase() !== "completed") return false;
		return true;
	});

	const sortedCompleted = [...filteredCompleted].sort((a, b) => {
		const dir = sortDir === "asc" ? 1 : -1;
		if (sortKey === "task") return dir * a.task.localeCompare(b.task);
		if (sortKey === "trigger") return dir * a.trigger.localeCompare(b.trigger);
		return dir * (a.dateIndex - b.dateIndex);
	});

	const totalCompletedPages = Math.ceil(sortedCompleted.length / COMPLETED_PAGE_SIZE);
	const pagedCompleted = sortedCompleted.slice(
		completedPage * COMPLETED_PAGE_SIZE,
		(completedPage + 1) * COMPLETED_PAGE_SIZE,
	);
	const showingFrom = completedPage * COMPLETED_PAGE_SIZE + 1;
	const showingTo = Math.min((completedPage + 1) * COMPLETED_PAGE_SIZE, sortedCompleted.length);

	// Activity Overview time frame + chart hover
	const [timeFrame, setTimeFrame] = useState("Past 30 days");
	const [hoveredBar, setHoveredBar] = useState<string | null>(null);

	function SortIcon({ col }: { col: SortKey }) {
		if (sortKey !== col) return null;
		return sortDir === "asc"
			? <IconArrowUp style={{ width: 10, height: 10, marginLeft: 3, verticalAlign: "middle", color: "var(--ax-colors-fg-secondary)" }} />
			: <IconArrowDown style={{ width: 10, height: 10, marginLeft: 3, verticalAlign: "middle", color: "var(--ax-colors-fg-secondary)" }} />;
	}

	return (
		<Box style={{ padding: "32px 40px" }}>
			<Heading level="1" mb="4">
				Activity
			</Heading>
			<Text color="fg.secondary" fontSize="lg" mb="24">
				A breakdown of how {name} spends their time
			</Text>

			<Tabs defaultValue="overview">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="completed">Completed</TabsTrigger>
				</TabsList>

				{/* ─── Overview ──────────────────────────────────────────────── */}
				<TabsContent value="overview">
					<Box pt="32">
						{/* Upcoming work */}
						<Box mb="40">
							<Heading level="3" mb="4">
								Upcoming
							</Heading>
							<Text color="fg.secondary" fontSize="md" mb="16">
								Upcoming jobs and when they will run next
							</Text>
							<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, overflow: "hidden" }}>
								{/* Header */}
								<Box display="flex" alignItems="center" style={{ padding: "10px 20px", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
									<Box style={{ width: 24, flexShrink: 0 }} />
									<span style={{ ...TABLE_HEADER, flex: 1 }}>Job</span>
									<span style={{ ...TABLE_HEADER, width: 110 }}>Status</span>
									<span style={{ ...TABLE_HEADER, width: 100 }}>Priority</span>
									<span style={{ ...TABLE_HEADER, width: 110 }}>Trigger</span>
									<span style={{ ...TABLE_HEADER, width: 120 }}>Scheduled for</span>
									<Box style={{ width: 80, flexShrink: 0 }} />
								</Box>
								{queueItems.map((item, i) => (
									<Box
										key={item.id}
										display="flex"
										alignItems="center"
										draggable
										onDragStart={() => handleDragStart(i)}
										onDragOver={(e: React.DragEvent) => handleDragOver(e, i)}
										onDrop={() => handleDrop(i)}
										onDragEnd={handleDragEnd}
										style={{
											padding: "10px 20px",
											borderBottom: i < queueItems.length - 1 ? "1px solid var(--ax-colors-border-secondary)" : undefined,
											background: dragOverIndex === i
												? "var(--ax-colors-bg-secondary)"
												: "var(--ax-colors-bg-default)",
											cursor: "default",
											transition: "background 0.1s",
										}}
									>
										<Box style={{ width: 24, flexShrink: 0, display: "flex", alignItems: "center" }}>
											<IconGripVertical style={{ width: 14, height: 14, color: "var(--ax-colors-fg-tertiary)", cursor: "grab" }} />
										</Box>
										<Box style={{ flex: 1, minWidth: 0 }}>
											<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }}>{item.task}</Text>
											<Text fontSize="sm" color="fg.secondary">{item.sub}</Text>
										</Box>
										<Box style={{ width: 110 }}>
											<QueueStatusBadge status={i === 0 ? "next_up" : "queued"} />
										</Box>
										<Box style={{ width: 100 }}>
											<Badge intent="information" variant="subtle">Standard</Badge>
										</Box>
										<Box style={{ width: 110 }}>
											<Badge intent="neutral" variant="subtle">Scheduled</Badge>
										</Box>
										<Text fontSize="sm" color="fg.secondary" style={{ width: 120 }}>{item.time}</Text>
										<Box style={{ width: 80, flexShrink: 0 }}>
											<Button appearance="subtle" size="sm">Remove</Button>
										</Box>
									</Box>
								))}
							</Box>
						</Box>

						{/* Usage */}
						<Box mt="40">
							<Heading level="3" mb="4">Usage</Heading>
							<Text color="fg.secondary" fontSize="md" mb="16">
								{name}&apos;s credit usage for the current billing period
							</Text>
							<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "20px 24px" }}>
								<Text fontSize="sm" color="fg.tertiary" mb="4">Credits</Text>
								<Box style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 12 }}>
									<Text style={{ fontSize: 18, fontWeight: 700, lineHeight: "1", color: "var(--ax-colors-fg-default)" }}>3,400</Text>
									<Text fontSize="md" color="fg.tertiary" style={{ fontWeight: 400 }}>/ 20,000</Text>
								</Box>
								<Box
									style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}
									onMouseEnter={() => setHoveredBar("usage")}
									onMouseLeave={() => setHoveredBar(null)}
								>
									<Box style={{ flex: 1, height: 8, background: "var(--ax-colors-bg-secondary)", borderRadius: 999, overflow: "hidden", cursor: "default" }}>
										<Box style={{ width: "17%", height: "100%", background: "#616755", borderRadius: 999 }} />
									</Box>
									<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)", whiteSpace: "nowrap" as const }}>17% USED</span>
									{hoveredBar === "usage" && (
										<Box style={{
											position: "absolute",
											bottom: "calc(100% + 10px)",
											left: 0,
											background: "var(--ax-colors-fg-default)",
											color: "var(--ax-colors-bg-default)",
											borderRadius: 8,
											padding: "12px 16px",
											minWidth: 240,
											zIndex: 10,
											pointerEvents: "none",
											boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
										}}>
											<Text fontSize="sm" style={{ fontWeight: 600, color: "inherit", display: "block", marginBottom: 10 }}>Credit usage</Text>
											<Box style={{ display: "flex", flexDirection: "column", gap: 6 }}>
												<Box display="flex" justifyContent="space-between" gap="24">
													<Text fontSize="sm" style={{ color: "inherit", opacity: 0.7 }}>Used</Text>
													<Text fontSize="sm" style={{ color: "inherit", fontWeight: 500 }}>3,400 credits</Text>
												</Box>
												<Box display="flex" justifyContent="space-between" gap="24">
													<Text fontSize="sm" style={{ color: "inherit", opacity: 0.7 }}>Remaining</Text>
													<Text fontSize="sm" style={{ color: "inherit", fontWeight: 500 }}>16,600 credits</Text>
												</Box>
												<Box display="flex" justifyContent="space-between" gap="24">
													<Text fontSize="sm" style={{ color: "inherit", opacity: 0.7 }}>Plan limit</Text>
													<Text fontSize="sm" style={{ color: "inherit", fontWeight: 500 }}>20,000 credits</Text>
												</Box>
												<Box style={{ height: 1, background: "rgba(255,255,255,0.15)", margin: "2px 0" }} />
												<Box display="flex" justifyContent="space-between" gap="24">
													<Text fontSize="sm" style={{ color: "inherit", opacity: 0.7 }}>Billing period</Text>
													<Text fontSize="sm" style={{ color: "inherit", fontWeight: 500 }}>Jul 1 – Jul 31</Text>
												</Box>
												<Box display="flex" justifyContent="space-between" gap="24">
													<Text fontSize="sm" style={{ color: "inherit", opacity: 0.7 }}>Resets in</Text>
													<Text fontSize="sm" style={{ color: "inherit", fontWeight: 500 }}>15 days</Text>
												</Box>
											</Box>
										</Box>
									)}
								</Box>
							</Box>
						</Box>
					</Box>

					{/* Top jobs */}
					<Box mt="24">
						<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "20px 24px" }}>
							<Box display="flex" alignItems="center" justifyContent="space-between" mb="4">
								<Text style={{ ...SECTION_HEADING, fontSize: 16 }}>Top jobs</Text>
								<Text fontSize="sm" color="fg.tertiary">Last 30 days</Text>
							</Box>
							<Text fontSize="sm" color="fg.secondary" mb="16">Recurring tasks using the most credits</Text>
							<Box>
								{TOP_TASKS.map((task, i) => (
									<Box
										key={task.name}
										display="flex"
										alignItems="center"
										justifyContent="space-between"
										style={{
											padding: "12px 0",
											borderTop: i > 0 ? "1px solid var(--ax-colors-border-secondary)" : undefined,
										}}
									>
										<Box display="flex" alignItems="center" gap="12">
											<Box style={{ width: 32, height: 32, borderRadius: "50%", background: "#EEFFD9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
												<IconDiagramSubtask style={{ width: 16, height: 16, color: "var(--ax-colors-fg-secondary)" }} />
											</Box>
											<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }}>{task.name}</Text>
										</Box>
										<Text fontSize="md" color="fg.secondary">{task.credits} credits</Text>
									</Box>
								))}
							</Box>
						</Box>
					</Box>
				</TabsContent>

				{/* ─── Completed ─────────────────────────────────────────────── */}
				<TabsContent value="completed">
					<Box pt="32">
						<Heading level="3" mb="4">
							Completed
						</Heading>
						<Text color="fg.secondary" fontSize="md" mb="16">
							A record of what jobs {name} has completed to date
						</Text>

						{/* Filters */}
						<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
							<Box display="flex" alignItems="center" gap="8">
								<Box style={{ width: 260 }}>
									<Input
										placeholder="Search tasks or artifacts"
										addonBefore={<IconSearch />}
										value={completedQuery}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											setCompletedQuery(e.target.value);
											setCompletedPage(0);
										}}
									/>
								</Box>
								<Menu
									options={["All", "Completed", "Failed", "Canceled"].map((opt) => ({
										label: opt,
										onClick: () => { setCompletedStatus(opt); setCompletedPage(0); },
									}))}
								>
									<MenuTrigger asChild>
										<LabelMenuButton label="Status">{completedStatus}</LabelMenuButton>
									</MenuTrigger>
									<MenuContent />
								</Menu>
								<Menu
									options={["All time", "Today", "Past 7 days", "Past 30 days", "Past 90 days"].map((opt) => ({
										label: opt,
										onClick: () => { setCompletedDateRange(opt); setCompletedPage(0); },
									}))}
								>
									<MenuTrigger asChild>
										<LabelMenuButton label="Date range">{completedDateRange}</LabelMenuButton>
									</MenuTrigger>
									<MenuContent />
								</Menu>
							</Box>

							{/* Column configurator */}
							<Box ref={colConfigRef} style={{ position: "relative" }}>
								<Button
									appearance="subtle"
									size="sm"
									icon={<IconGear />}
									aria-label="Configure columns"
									onClick={() => setColConfigOpen((o) => !o)}
								/>
								{colConfigOpen && (
									<Box style={{
										position: "absolute", right: 0, top: "calc(100% + 6px)",
										background: "var(--ax-colors-bg-default)",
										border: "1px solid var(--ax-colors-border-default)",
										borderRadius: 10,
										boxShadow: "0 6px 20px rgba(0,0,0,0.10)",
										padding: "16px 20px",
										width: 240,
										zIndex: 50,
									}}>
										<Text fontSize="md" color="fg.default" style={{ fontWeight: 600, display: "block", marginBottom: 2 }}>
											Configure Columns
										</Text>
										<Text fontSize="sm" color="fg.tertiary" style={{ display: "block", marginBottom: 14 }}>
											Drag to reorder, toggle to show/hide
										</Text>
										<Box display="flex" flexDirection="column" gap="2">
											{colOrder.map((key) => {
												const on = visibleCols.has(key);
												const isDragging = dragColKey === key;
												const isOver = dragOverColKey === key && dragColKey !== key;
												return (
													<Box
														key={key}
														display="flex"
														alignItems="center"
														gap="10"
														draggable
														onDragStart={() => setDragColKey(key)}
														onDragEnd={() => { setDragColKey(null); setDragOverColKey(null); }}
														onDragOver={(e: React.DragEvent) => handleColDragOver(e, key)}
														onDrop={() => handleColDrop(key)}
														style={{
															padding: "6px 0",
															opacity: isDragging ? 0.4 : 1,
															borderTop: isOver ? "2px solid var(--ax-colors-border-focus)" : "2px solid transparent",
															transition: "opacity 0.15s",
															cursor: "default",
														}}
													>
														<Box style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0, display: "flex", cursor: "grab" }}>
															<IconGripVertical size={14} />
														</Box>
														<Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
															<Checkbox checked={on} onCheckedChange={() => toggleCol(key)} />
														</Box>
														<Text fontSize="sm" color="fg.default">{COL_META[key].label}</Text>
													</Box>
												);
											})}
										</Box>
									</Box>
								)}
							</Box>
						</Box>

						<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, overflow: "hidden" }}>
							{/* Sortable header */}
							<Box display="flex" alignItems="center" style={{ padding: "10px 20px", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
								<Box
									style={{ flex: 1, minWidth: 0, cursor: "pointer", userSelect: "none" as const }}
									onClick={() => handleSort("task")}
								>
									<span style={TABLE_HEADER}>
										Job
										<SortIcon col="task" />
									</span>
								</Box>
								{colOrder.filter(k => visibleCols.has(k)).map(renderHeaderCell)}
							</Box>

							{pagedCompleted.map((item) => (
								<Box key={item.id} display="flex" alignItems="center" style={{ padding: "14px 20px", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
									<Box style={{ flex: 1, minWidth: 0 }}>
										<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }}>{item.task}</Text>
										<Text fontSize="sm" color="fg.secondary">{item.sub}</Text>
									</Box>
									{colOrder.filter(k => visibleCols.has(k)).map(key => renderRowCell(item, key))}
								</Box>
							))}
						</Box>

						{/* Pagination */}
						<Box display="flex" alignItems="center" justifyContent="space-between" mt="16">
							<Text fontSize="sm" color="fg.tertiary">
								Showing {showingFrom}–{showingTo} of {sortedCompleted.length}
							</Text>
							<Box display="flex" alignItems="center" gap="8">
								<Button
									appearance="subtle"
									size="sm"
									icon={<IconChevronLeft />}
									disabled={completedPage === 0}
									aria-label="Previous page"
									onClick={() => setCompletedPage((p) => p - 1)}
								/>
								<Text fontSize="sm" color="fg.secondary">
									{completedPage + 1} / {totalCompletedPages}
								</Text>
								<Button
									appearance="subtle"
									size="sm"
									icon={<IconChevronRight />}
									disabled={completedPage >= totalCompletedPages - 1}
									aria-label="Next page"
									onClick={() => setCompletedPage((p) => p + 1)}
								/>
							</Box>
						</Box>
					</Box>
				</TabsContent>

			</Tabs>
		</Box>
	);
}

"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
	Box, Button, Heading, LabelMenuButton, Menu, MenuContent, MenuTrigger,
	Tabs, TabsContent, TabsList, TabsTrigger, Text,
} from "@optiaxiom/react";
import { IconArrowDown, IconArrowUp, IconChevronLeft, IconChevronRight, IconGripVertical } from "@optiaxiom/icons";
import { VAUS } from "@/app/opal/data/vaus";

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
	{ id: "q1", task: "Meeting Prep", sub: 'Pre-meeting brief: "Q3 Roadmap Review"', time: "11:00 AM" },
	{ id: "q2", task: "Email Triage", sub: "Morning inbox sweep — 22 unread flagged", time: "11:30 AM" },
	{ id: "q3", task: "Status Nudges", sub: "Follow-up pings to 3 open threads", time: "12:00 PM" },
	{ id: "q4", task: "Meeting Prep", sub: 'Pre-meeting brief: "Design Review"', time: "1:00 PM" },
];

const COMPLETED_ITEMS = [
	{ id: "c1",  task: "Email Triage",   sub: "Morning inbox sweep",               date: "Jun 24", dateIndex: 0,  durationMin: 4, outcome: "12 emails triaged" },
	{ id: "c2",  task: "Meeting Prep",   sub: '"Q3 Roadmap Review" brief',          date: "Jun 24", dateIndex: 1,  durationMin: 6, outcome: "Brief sent" },
	{ id: "c3",  task: "Status Nudges",  sub: "Follow-up pings to 3 threads",       date: "Jun 23", dateIndex: 2,  durationMin: 2, outcome: "3 replies received" },
	{ id: "c4",  task: "Morning Brief",  sub: "Daily digest delivered",             date: "Jun 23", dateIndex: 3,  durationMin: 1, outcome: "Delivered" },
	{ id: "c5",  task: "Follow-ups",     sub: "Sarah Chen feedback loop",           date: "Jun 22", dateIndex: 4,  durationMin: 8, outcome: "Response drafted" },
	{ id: "c6",  task: "Weekly Recap",   sub: "End-of-week performance summary",    date: "Jun 21", dateIndex: 5,  durationMin: 5, outcome: "Report published" },
	{ id: "c7",  task: "Meeting Prep",   sub: '"Design Review" brief',              date: "Jun 21", dateIndex: 6,  durationMin: 6, outcome: "Brief sent" },
	{ id: "c8",  task: "Email Triage",   sub: "Afternoon inbox sweep",              date: "Jun 20", dateIndex: 7,  durationMin: 3, outcome: "8 emails triaged" },
	{ id: "c9",  task: "Status Nudges",  sub: "CMP task deadline reminders",        date: "Jun 20", dateIndex: 8,  durationMin: 2, outcome: "2 replies received" },
	{ id: "c10", task: "Morning Brief",  sub: "Daily digest delivered",             date: "Jun 19", dateIndex: 9,  durationMin: 1, outcome: "Delivered" },
	{ id: "c11", task: "Competitor Intel", sub: "Weekly landscape digest",          date: "Jun 19", dateIndex: 10, durationMin: 7, outcome: "Report sent" },
	{ id: "c12", task: "Follow-ups",     sub: "Q3 campaign brief feedback",         date: "Jun 18", dateIndex: 11, durationMin: 5, outcome: "Thread closed" },
];

const TIME_FRAME_OPTIONS = ["Past 7 days", "Past 30 days", "Past 90 days", "All time"];
const COMPLETED_PAGE_SIZE = 5;

type SortKey = "task" | "date" | "duration";
type SortDir = "asc" | "desc";

function StatusBadge({ status }: { status: "next_up" | "queued" | "completed" }) {
	if (status === "next_up") {
		return (
			<span style={{ ...CAPTION, background: "var(--ax-colors-fg-default)", color: "var(--ax-colors-bg-default)", padding: "3px 10px", borderRadius: 32, whiteSpace: "nowrap" as const }}>
				Next up
			</span>
		);
	}
	if (status === "queued") {
		return (
			<span style={{ ...CAPTION, background: "var(--ax-colors-bg-secondary)", color: "var(--ax-colors-fg-secondary)", padding: "3px 10px", borderRadius: 32, whiteSpace: "nowrap" as const, border: "1px solid var(--ax-colors-border-default)" }}>
				Queued
			</span>
		);
	}
	return (
		<span style={{ ...CAPTION, background: "#E8F5E4", color: "#226b1e", padding: "3px 10px", borderRadius: 32, whiteSpace: "nowrap" as const }}>
			Completed
		</span>
	);
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

	// Completed sort + pagination
	const [sortKey, setSortKey] = useState<SortKey>("date");
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

	const sortedCompleted = [...COMPLETED_ITEMS].sort((a, b) => {
		const dir = sortDir === "asc" ? 1 : -1;
		if (sortKey === "task") return dir * a.task.localeCompare(b.task);
		if (sortKey === "duration") return dir * (a.durationMin - b.durationMin);
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
			<Heading level="2" mb="4">
				Activity
			</Heading>
			<Text color="fg.secondary" fontSize="md" mb="24">
				A breakdown of how {name} spends their time.
			</Text>

			<Tabs defaultValue="upcoming">
				<TabsList>
					<TabsTrigger value="upcoming">Upcoming</TabsTrigger>
					<TabsTrigger value="completed">Completed</TabsTrigger>
				</TabsList>

				{/* ─── Upcoming ──────────────────────────────────────────────── */}
				<TabsContent value="upcoming">
					<Box pt="32">
						{/* Randy's queue */}
						<Box mb="40">
							<Text style={SECTION_HEADING} mb="4">
								{name}&apos;s queue
							</Text>
							<Text color="fg.secondary" fontSize="sm" mb="16">
								What&apos;s coming up. Drag to reorder — whatever&apos;s first is up next.
							</Text>
							<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, overflow: "hidden" }}>
								{/* Header */}
								<Box display="flex" alignItems="center" style={{ padding: "10px 20px", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
									<Box style={{ width: 28, flexShrink: 0 }} />
									<span style={{ ...TABLE_HEADER, flex: 1 }}>Task</span>
									<span style={{ ...TABLE_HEADER, width: 140 }}>Status</span>
									<span style={{ ...TABLE_HEADER, width: 120 }}>Time</span>
									<span style={{ ...TABLE_HEADER, width: 200 }}>Actions</span>
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
											padding: "14px 20px",
											borderBottom: "1px solid var(--ax-colors-border-secondary)",
											background: dragOverIndex === i
												? "var(--ax-colors-bg-secondary)"
												: "var(--ax-colors-bg-default)",
											cursor: "default",
											transition: "background 0.1s",
										}}
									>
										<Box style={{ width: 28, flexShrink: 0, display: "flex", alignItems: "center" }}>
											<IconGripVertical style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)", cursor: "grab" }} />
										</Box>
										<Box style={{ flex: 1, minWidth: 0 }}>
											<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }}>{item.task}</Text>
											<Text fontSize="sm" color="fg.secondary">{item.sub}</Text>
										</Box>
										<Box style={{ width: 140 }}>
											<StatusBadge status={i === 0 ? "next_up" : "queued"} />
										</Box>
										<Text fontSize="md" color="fg.secondary" style={{ width: 120 }}>{item.time}</Text>
										<Box display="flex" gap="8" style={{ width: 200 }}>
											<Button appearance="default" size="sm">View details</Button>
											<Button appearance="subtle" size="sm">Remove</Button>
										</Box>
									</Box>
								))}
							</Box>
						</Box>

						{/* Activity Overview */}
						<Box>
							<Box display="flex" alignItems="center" justifyContent="space-between" mb="4">
								<Text style={SECTION_HEADING}>Activity Overview</Text>
								<Menu options={TIME_FRAME_OPTIONS.map((opt) => ({ label: opt, onClick: () => setTimeFrame(opt) }))}>
									<MenuTrigger asChild>
										<LabelMenuButton label="Time Frame">{timeFrame}</LabelMenuButton>
									</MenuTrigger>
									<MenuContent />
								</Menu>
							</Box>
							<Text color="fg.secondary" fontSize="sm" mb="20">
								Where {name}&apos;s effort goes — and what&apos;s trending up.
							</Text>
							<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "24px 24px 16px" }}>
								{/* Chart area */}
								<Box style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: 180, position: "relative" }}>
									{/* Y-axis gridlines */}
									{[0, 25, 50, 75, 100].map((pct) => (
										<Box key={pct} style={{
											position: "absolute",
											left: 0,
											right: 0,
											bottom: `${pct}%`,
											height: 1,
											background: pct === 0 ? "var(--ax-colors-border-default)" : "var(--ax-colors-border-secondary)",
											zIndex: 0,
										}} />
									))}
									{(() => {
										const maxRuns = Math.max(...ACTIVITY_ROWS.map((r) => r.runs));
										const CHART_H = 160;
										return ACTIVITY_ROWS.map((row) => {
											const soloRuns = Math.round(row.runs * row.pct / 100);
											const supportedRuns = row.runs - soloRuns;
											const totalPx = (row.runs / maxRuns) * CHART_H;
											const soloPx = totalPx * (soloRuns / row.runs);
											const supportedPx = totalPx * (supportedRuns / row.runs);
											const timeSavedHrs = ((soloRuns * row.avgMin) / 60).toFixed(1);
											const isHovered = hoveredBar === row.task;

											return (
												<Box
													key={row.task}
													style={{ width: 68, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}
													onMouseEnter={() => setHoveredBar(row.task)}
													onMouseLeave={() => setHoveredBar(null)}
												>
													{/* Tooltip */}
													{isHovered && (
														<Box style={{
															position: "absolute",
															bottom: `${totalPx + 12}px`,
															left: "50%",
															transform: "translateX(-50%)",
															background: "var(--ax-colors-fg-default)",
															color: "var(--ax-colors-bg-default)",
															borderRadius: 8,
															padding: "10px 14px",
															minWidth: 180,
															zIndex: 10,
															pointerEvents: "none",
															boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
														}}>
															<Text fontSize="sm" style={{ fontWeight: 600, color: "inherit", marginBottom: 8, display: "block" }}>
																{row.task}
															</Text>
															<Box style={{ display: "flex", flexDirection: "column", gap: 4 }}>
																<Box display="flex" justifyContent="space-between" gap="16">
																	<Text fontSize="sm" style={{ color: "inherit", opacity: 0.7 }}>Total runs</Text>
																	<Text fontSize="sm" style={{ color: "inherit", fontWeight: 500 }}>{row.runs}</Text>
																</Box>
																<Box display="flex" justifyContent="space-between" gap="16">
																	<Box display="flex" alignItems="center" gap="4">
																		<Box style={{ width: 8, height: 8, borderRadius: 2, background: "#226B1E", flexShrink: 0 }} />
																		<Text fontSize="sm" style={{ color: "inherit", opacity: 0.7 }}>Solo</Text>
																	</Box>
																	<Text fontSize="sm" style={{ color: "inherit", fontWeight: 500 }}>{soloRuns} ({row.pct}%)</Text>
																</Box>
																{supportedRuns > 0 && (
																	<Box display="flex" justifyContent="space-between" gap="16">
																		<Box display="flex" alignItems="center" gap="4">
																			<Box style={{ width: 8, height: 8, borderRadius: 2, background: "#D2DEC2", flexShrink: 0 }} />
																			<Text fontSize="sm" style={{ color: "inherit", opacity: 0.7 }}>Supported</Text>
																		</Box>
																		<Text fontSize="sm" style={{ color: "inherit", fontWeight: 500 }}>{supportedRuns} ({100 - row.pct}%)</Text>
																	</Box>
																)}
																<Box style={{ height: 1, background: "rgba(255,255,255,0.15)", margin: "4px 0" }} />
																<Box display="flex" justifyContent="space-between" gap="16">
																	<Text fontSize="sm" style={{ color: "inherit", opacity: 0.7 }}>Avg duration</Text>
																	<Text fontSize="sm" style={{ color: "inherit", fontWeight: 500 }}>{row.avgMin}m</Text>
																</Box>
																<Box display="flex" justifyContent="space-between" gap="16">
																	<Text fontSize="sm" style={{ color: "inherit", opacity: 0.7 }}>Time saved</Text>
																	<Text fontSize="sm" style={{ color: "inherit", fontWeight: 500 }}>{timeSavedHrs}h</Text>
																</Box>
															</Box>
														</Box>
													)}
													{/* Stacked bar segments — supported on top, solo on bottom */}
													{supportedRuns > 0 && (
														<Box style={{
															width: "100%",
															height: supportedPx,
															background: "#D2DEC2",
															borderRadius: "4px 4px 0 0",
															transition: "opacity 0.15s",
															opacity: hoveredBar && !isHovered ? 0.3 : 1,
														}} />
													)}
													<Box style={{
														width: "100%",
														height: soloPx,
														background: "#226B1E",
														borderRadius: supportedRuns > 0 ? 0 : "4px 4px 0 0",
														transition: "opacity 0.15s",
														opacity: hoveredBar && !isHovered ? 0.3 : 1,
													}} />
												</Box>
											);
										});
									})()}
								</Box>
								{/* X-axis labels */}
								<Box style={{ display: "flex", justifyContent: "space-around", marginTop: 8 }}>
									{ACTIVITY_ROWS.map((row) => (
										<Box key={row.task} style={{ width: 68, textAlign: "center" }}>
											<span style={{ ...TABLE_HEADER, fontSize: 9, whiteSpace: "nowrap" as const }}>{row.task}</span>
										</Box>
									))}
								</Box>
								{/* Legend */}
								<Box display="flex" alignItems="center" gap="16" style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--ax-colors-border-secondary)" }}>
									<Box display="flex" alignItems="center" gap="6">
										<Box style={{ width: 10, height: 10, borderRadius: 2, background: "#226B1E" }} />
										<Text fontSize="sm" color="fg.secondary">Solo</Text>
									</Box>
									<Box display="flex" alignItems="center" gap="6">
										<Box style={{ width: 10, height: 10, borderRadius: 2, background: "#D2DEC2" }} />
										<Text fontSize="sm" color="fg.secondary">Supported</Text>
									</Box>
								</Box>
							</Box>
						</Box>
					</Box>
				</TabsContent>

				{/* ─── Completed ─────────────────────────────────────────────── */}
				<TabsContent value="completed">
					<Box pt="32">
						<Text style={SECTION_HEADING} mb="4">
							Completed tasks
						</Text>
						<Text color="fg.secondary" fontSize="sm" mb="16">
							A record of what {name} handled — click a column header to sort.
						</Text>
						<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, overflow: "hidden" }}>
							{/* Sortable header */}
							<Box display="flex" alignItems="center" style={{ padding: "10px 20px", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
								<Box
									style={{ flex: 1, cursor: "pointer", userSelect: "none" as const }}
									onClick={() => handleSort("task")}
								>
									<span style={TABLE_HEADER}>
										Task
										<SortIcon col="task" />
									</span>
								</Box>
								<Box
									style={{ width: 100, cursor: "pointer", userSelect: "none" as const }}
									onClick={() => handleSort("date")}
								>
									<span style={TABLE_HEADER}>
										Date
										<SortIcon col="date" />
									</span>
								</Box>
								<Box
									style={{ width: 100, cursor: "pointer", userSelect: "none" as const }}
									onClick={() => handleSort("duration")}
								>
									<span style={TABLE_HEADER}>
										Duration
										<SortIcon col="duration" />
									</span>
								</Box>
								<span style={{ ...TABLE_HEADER, flex: 1 }}>Outcome</span>
							</Box>

							{pagedCompleted.map((item) => (
								<Box key={item.id} display="flex" alignItems="center" style={{ padding: "14px 20px", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
									<Box style={{ flex: 1, minWidth: 0 }}>
										<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }}>{item.task}</Text>
										<Text fontSize="sm" color="fg.secondary">{item.sub}</Text>
									</Box>
									<Text fontSize="sm" color="fg.secondary" style={{ width: 100 }}>{item.date}</Text>
									<Text fontSize="sm" color="fg.secondary" style={{ width: 100 }}>{item.durationMin}m</Text>
									<Text fontSize="sm" color="fg.secondary" style={{ flex: 1 }}>{item.outcome}</Text>
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

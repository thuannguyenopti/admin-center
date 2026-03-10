"use client";

import {
	Box,
	SearchInput,
	Button,
	Switch,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	Badge,
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
	Checkbox,
	Avatar,
} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {
	IconFilter,
	IconChevronDown,
	IconChevronRight,
	IconDots,
	IconPlus,
	IconCalendar,
	IconGripHorizontal,
	IconArrowsSort,
	IconSettings,
	IconUserPlus,
} from "@tabler/icons-react";
import {useState} from "react";
import {useRouter} from "next/navigation";

// Random avatar images for visual variety
const avatarImages = [
	"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
];

// Mock data for the plan view
const planData = [
	{
		id: "1",
		title: "Ironman Miami triathlon 2026 Sponsor Package task",
		type: "Task",
		reference: "TSK-2702",
		owner: {name: "David Steinberg", src: avatarImages[0]},
		creationDate: "Sep 15, 2025",
		startDate: "No start date",
		endDate: "No end date",
		dependsOn: null,
		status: "Not Started",
		parentCampaign: null,
		lastModified: "Nov 25, 2025",
		currentStep: "1 of 2",
		currentStepName: "Briefing",
	},
	{
		id: "2",
		title: "Content Rec",
		type: "Task",
		reference: "TSK-2695",
		owner: {name: "Hsiao-Pei Chien", src: avatarImages[1]},
		creationDate: "Mar 20, 2025",
		startDate: "No start date",
		endDate: "No end date",
		dependsOn: null,
		status: "In Progress",
		parentCampaign: null,
		lastModified: "Sep 15, 2025",
		currentStep: "1 of 1",
		currentStepName: "Review",
	},
	{
		id: "social",
		title: "Social",
		type: "Campaign",
		reference: "CPN-39",
		owner: {name: "Hsiao-Pei Chien", src: avatarImages[1]},
		creationDate: "Mar 20, 2025",
		startDate: "Mar 20, 2025",
		endDate: "No end date",
		dependsOn: null,
		status: "On Track",
		parentCampaign: null,
		lastModified: "Mar 20, 2025",
		currentStep: null,
		currentStepName: null,
		badge: 1,
		isGroup: true,
	},
	{
		id: "3",
		title: "Hotel Brochure",
		type: "Task",
		reference: "TSK-2691",
		owner: {name: "David Steinberg", src: avatarImages[0]},
		creationDate: "Feb 27, 2025",
		startDate: "No start date",
		endDate: "No end date",
		dependsOn: null,
		status: "At Risk",
		parentCampaign: null,
		lastModified: "May 5, 2025",
		currentStep: "0 of 0",
		currentStepName: null,
	},
	{
		id: "m",
		title: "m",
		type: "Campaign",
		reference: "CPN-38",
		owner: {name: "Md Nadim Sakib", src: avatarImages[2]},
		creationDate: "Feb 19, 2025",
		startDate: "Feb 19, 2025",
		endDate: "No end date",
		dependsOn: null,
		status: "Not Started",
		parentCampaign: null,
		lastModified: "Feb 19, 2025",
		currentStep: null,
		currentStepName: null,
		badge: 1,
		isGroup: true,
	},
	{
		id: "test-camp",
		title: "Test camp",
		type: "Campaign",
		reference: "CPN-37",
		owner: {name: "Md Nadim Sakib", src: avatarImages[2]},
		creationDate: "Feb 19, 2025",
		startDate: "Feb 19, 2025",
		endDate: "No end date",
		dependsOn: null,
		status: "Not Started",
		parentCampaign: null,
		lastModified: "Feb 19, 2025",
		currentStep: null,
		currentStepName: null,
	},
	{
		id: "4",
		title: "SC content testing",
		type: "Task",
		reference: "TSK-2689",
		owner: {name: "Kamrul Hasan", src: avatarImages[3]},
		creationDate: "Feb 18, 2025",
		startDate: "No start date",
		endDate: "No end date",
		dependsOn: null,
		status: "Overdue",
		parentCampaign: null,
		lastModified: "Feb 19, 2025",
		currentStep: "1 of 2",
		currentStepName: "Approval",
	},
	{
		id: "axiom",
		title: "Axiom",
		type: "Campaign",
		reference: "CPN-36",
		owner: {name: "Abu Jafar Safi", src: avatarImages[4]},
		creationDate: "Feb 17, 2025",
		startDate: "Feb 17, 2025",
		endDate: "No end date",
		dependsOn: null,
		status: "On Track",
		parentCampaign: null,
		lastModified: "Feb 17, 2025",
		currentStep: null,
		currentStepName: null,
		badge: 1,
		isGroup: true,
	},
	{
		id: "test",
		title: "Test",
		type: "Campaign",
		reference: "CPN-35",
		owner: {name: "Abu Jafar Safi", src: avatarImages[4]},
		creationDate: "Feb 13, 2025",
		startDate: "Feb 13, 2025",
		endDate: "No end date",
		dependsOn: null,
		status: "On Track",
		parentCampaign: null,
		lastModified: "Feb 18, 2025",
		currentStep: null,
		currentStepName: null,
		badge: 4,
		isGroup: true,
	},
];

const StatusBadge = ({status}: {status: string}) => {
	const getIntent = () => {
		switch (status) {
			case "On Track":
				return "success";
			case "Not Started":
				return "neutral";
			case "Overdue":
				return "danger";
			case "Completed":
				return "primary";
			case "In Progress":
				return "information";
			case "At Risk":
				return "warning";
			default:
				return "neutral";
		}
	};

	return <Badge intent={getIntent() as any}>{status}</Badge>;
};

const StepBadge = ({step}: {step: string | null}) => {
	if (!step) return <Text color="fg.tertiary">—</Text>;
	return (
		<Badge intent="neutral" className="font-normal">
			{step}
		</Badge>
	);
};

// Helper function to parse dates
const parseDate = (dateStr: string): Date | null => {
	if (dateStr === "No start date" || dateStr === "No end date" || !dateStr) return null;
	const date = new Date(dateStr);
	return isNaN(date.getTime()) ? null : date;
};

// Helper function to get status color
const getStatusColor = (status: string): string => {
	switch (status) {
		case "On Track":
			return "#10b981"; // green
		case "In Progress":
			return "#3b82f6"; // blue
		case "At Risk":
			return "#f59e0b"; // amber
		case "Overdue":
			return "#ef4444"; // red
		case "Completed":
			return "#8b5cf6"; // purple
		case "Not Started":
			return "#9ca3af"; // gray
		default:
			return "#9ca3af";
	}
};

// Timeline/Gantt View Component
const TimelineView = ({data}: {data: any[]}) => {
	const [expandedGroups, setExpandedGroups] = useState<string[]>(["social", "axiom", "test"]);
	const today = new Date();

	const toggleGroup = (id: string) => {
		setExpandedGroups((prev) =>
			prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
		);
	};

	// Get date range for timeline
	const dates = data
		.map((item) => [parseDate(item.startDate), parseDate(item.endDate)])
		.flat()
		.filter(Boolean) as Date[];

	let minDate = new Date(today.getFullYear(), today.getMonth(), 1);
	let maxDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);

	if (dates.length > 0) {
		const min = new Date(Math.min(...dates.map((d) => d.getTime())));
		const max = new Date(Math.max(...dates.map((d) => d.getTime())));
		minDate = new Date(Math.min(minDate.getTime(), min.getTime()));
		maxDate = new Date(Math.max(maxDate.getTime(), max.getTime()));
	}

	const months: { date: Date; label: string }[] = [];
	const current = new Date(minDate);
	while (current <= maxDate) {
		months.push({
			date: new Date(current),
			label: current.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
		});
		current.setMonth(current.getMonth() + 1);
	}

	const daysInRange = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
	const pixelsPerDay = 40;
	const timelineWidth = daysInRange * pixelsPerDay;

	const getBarPosition = (date: Date | null) => {
		if (!date) return 0;
		return Math.max(0, (date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * pixelsPerDay;
	};

	const getTodayPosition = () => {
		return (today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24) * pixelsPerDay;
	};

	const visibleItems = data.filter((item) => {
		if (!item.isGroup) return true;
		return expandedGroups.includes(item.id);
	});

	return (
		<Box
			display="flex"
			flexDirection="column"
			overflow="hidden"
			style={{ height: "100%", width: "100%" }}
		>
			{/* Timeline header with months */}
			<Box
				display="flex"
				overflow="auto"
				borderB="1"
				borderColor="border.tertiary"
				bg="bg.secondary"
			>
				<Box style={{ width: "280px", minWidth: "280px", flexShrink: 0 }} />
				<Box style={{ display: "flex", position: "relative", width: timelineWidth }}>
					{months.map((month, idx) => (
						<Box
							key={idx}
							style={{
								flex: 1,
								minWidth: "120px",
								padding: "12px 8px",
								borderRight: "1px solid var(--ax-colors-border-tertiary)",
								fontSize: "12px",
								fontWeight: 500,
								color: "var(--ax-colors-fg-secondary)",
							}}
						>
							{month.label}
						</Box>
					))}
				</Box>
			</Box>

			{/* Timeline content */}
			<Box
				display="flex"
				flex="1"
				overflow="auto"
				bg="bg.default"
			>
				{/* Left column with item names */}
				<Box
					style={{
						width: "280px",
						minWidth: "280px",
						flexShrink: 0,
						borderRight: "1px solid var(--ax-colors-border-tertiary)",
						overflow: "auto",
					}}
				>
					{data.map((item) => (
						<Box
							key={item.id}
							style={{
								padding: "12px 16px",
								height: "52px",
								display: "flex",
								alignItems: "center",
								gap: "8px",
								borderBottom: "1px solid var(--ax-colors-border-tertiary)",
								backgroundColor: item.isGroup
									? "var(--ax-colors-bg-secondary)"
									: "transparent",
								fontWeight: item.isGroup ? 500 : 400,
							}}
						>
							{item.isGroup && (
								<Button
									appearance="subtle"
									size="sm"
									icon={
										expandedGroups.includes(item.id) ? (
											<IconChevronDown size={16} />
										) : (
											<IconChevronRight size={16} />
										)
									}
									onClick={() => toggleGroup(item.id)}
									aria-label={expandedGroups.includes(item.id) ? "Collapse" : "Expand"}
									style={{ marginLeft: "-8px" }}
								/>
							)}
							<Text fontSize="sm" fontWeight={item.isGroup ? 500 : 400} className="truncate">
								{item.title}
							</Text>
							{item.badge && (
								<Badge intent="neutral">{item.badge}</Badge>
							)}
						</Box>
					))}
				</Box>

				{/* Timeline bars */}
				<Box style={{ position: "relative", flex: 1, overflow: "auto" }}>
					{/* Today line */}
					<Box
						style={{
							position: "absolute",
							left: `${getTodayPosition()}px`,
							top: 0,
							bottom: 0,
							width: "2px",
							backgroundColor: "#ef4444",
							zIndex: 10,
							pointerEvents: "none",
						}}
					/>

					{/* Timeline row background */}
					{data.map((item) => (
						<Box
							key={`bg-${item.id}`}
							style={{
								height: "52px",
								borderBottom: "1px solid var(--ax-colors-border-tertiary)",
								backgroundColor: item.isGroup
									? "var(--ax-colors-bg-secondary)"
									: "transparent",
								position: "relative",
							}}
						>
							{/* Gantt bars */}
							{!item.isGroup && parseDate(item.startDate) && parseDate(item.endDate) && (
								<Box
									style={{
										position: "absolute",
										top: "12px",
										left: `${getBarPosition(parseDate(item.startDate))}px`,
										height: "28px",
										backgroundColor: getStatusColor(item.status),
										borderRadius: "4px",
										width: `${Math.max(
											60,
											getBarPosition(parseDate(item.endDate)) -
											getBarPosition(parseDate(item.startDate))
										)}px`,
										opacity: 0.8,
										cursor: "pointer",
										transition: "opacity 0.2s",
									}}
									onMouseEnter={(e) => {
										(e.currentTarget as HTMLElement).style.opacity = "1";
									}}
									onMouseLeave={(e) => {
										(e.currentTarget as HTMLElement).style.opacity = "0.8";
									}}
									title={`${item.title}: ${item.startDate} to ${item.endDate}`}
								/>
							)}
						</Box>
					))}

					{/* Grid lines */}
					<Box
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							display: "flex",
							pointerEvents: "none",
						}}
					>
						{Array.from({ length: months.length }).map((_, idx) => (
							<Box
								key={idx}
								style={{
									flex: 1,
									minWidth: "120px",
									borderRight: "1px solid var(--ax-colors-border-tertiary)",
									opacity: 0.3,
								}}
							/>
						))}
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

// Board/Kanban View Component
const BoardView = ({data}: {data: any[]}) => {
	const statuses = ["Not Started", "In Progress", "On Track", "At Risk", "Overdue", "Completed"];

	const itemsByStatus = statuses.reduce((acc, status) => {
		acc[status] = data.filter((item) => !item.isGroup && item.status === status);
		return acc;
	}, {} as Record<string, any[]>);

	return (
		<Box
			display="flex"
			gap="12"
			overflow="auto"
			bg="bg.default"
			p="16"
			style={{ height: "100%", width: "100%" }}
		>
			{statuses.map((status) => (
				<Box
					key={status}
					style={{
						minWidth: "340px",
						maxWidth: "340px",
						display: "flex",
						flexDirection: "column",
						backgroundColor: "var(--ax-colors-bg-secondary)",
						borderRadius: "8px",
						border: "1px solid var(--ax-colors-border-tertiary)",
						overflow: "hidden",
					}}
				>
					{/* Column header */}
					<Box
						style={{
							padding: "12px 16px",
							borderBottom: "1px solid var(--ax-colors-border-tertiary)",
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<Text fontWeight="500" fontSize="sm">
							{status}
						</Text>
						<Badge intent="neutral">{itemsByStatus[status].length}</Badge>
					</Box>

					{/* Cards */}
					<Box
						style={{
							flex: 1,
							overflowY: "auto",
							padding: "12px",
							display: "flex",
							flexDirection: "column",
							gap: "12px",
						}}
					>
						{itemsByStatus[status].length === 0 ? (
							<Box
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									minHeight: "200px",
									color: "var(--ax-colors-fg-tertiary)",
									fontSize: "12px",
									textAlign: "center",
								}}
							>
								<Text color="fg.tertiary">No items</Text>
							</Box>
						) : (
							itemsByStatus[status].map((item) => (
								<Box
									key={item.id}
									style={{
										backgroundColor: "var(--ax-colors-bg-default)",
										borderRadius: "6px",
										border: "1px solid var(--ax-colors-border-tertiary)",
										padding: "12px",
										cursor: "pointer",
										transition: "all 0.2s",
									}}
									onMouseEnter={(e) => {
										const el = e.currentTarget as HTMLElement;
										el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
										el.style.transform = "translateY(-2px)";
									}}
									onMouseLeave={(e) => {
										const el = e.currentTarget as HTMLElement;
										el.style.boxShadow = "none";
										el.style.transform = "translateY(0)";
									}}
								>
									{/* Card title and type */}
									<Box
										style={{
											display: "flex",
											alignItems: "flex-start",
											gap: "8px",
											marginBottom: "8px",
										}}
									>
										<Box style={{ flex: 1 }}>
											<Text fontWeight="500" fontSize="sm" className="truncate">
												{item.title}
											</Text>
										</Box>
										<Badge intent="neutral" className="whitespace-nowrap">
											{item.type}
										</Badge>
									</Box>

									{/* Reference */}
									<Text fontSize="xs" color="fg.tertiary" className="mb-2">
										{item.reference}
									</Text>

									{/* Owner */}
									<Box
										style={{
											display: "flex",
											alignItems: "center",
											gap: "8px",
											marginTop: "8px",
										}}
									>
										<Avatar name={item.owner.name} src={item.owner.src} size="sm" />
										<Text fontSize="xs" color="fg.secondary" className="truncate">
											{item.owner.name}
										</Text>
									</Box>

									{/* Dates */}
									{(item.startDate !== "No start date" || item.endDate !== "No end date") && (
										<Box
											style={{
												marginTop: "8px",
												fontSize: "11px",
												color: "var(--ax-colors-fg-tertiary)",
											}}
										>
											{item.startDate !== "No start date" && (
												<Box style={{ marginBottom: "2px" }}>
													From: {item.startDate}
												</Box>
											)}
											{item.endDate !== "No end date" && (
												<Box>
													To: {item.endDate}
												</Box>
											)}
										</Box>
									)}
								</Box>
							))
						)}
					</Box>
				</Box>
			))}
		</Box>
	);
};

// Calendar View Component
const CalendarView = ({data}: {data: any[]}) => {
	const [currentDate, setCurrentDate] = useState(new Date());
	const today = new Date();

	const getDaysInMonth = (date: Date) => {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
	};

	const getFirstDayOfMonth = (date: Date) => {
		return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
	};

	const goToPreviousMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
	};

	const goToNextMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
	};

	const daysInMonth = getDaysInMonth(currentDate);
	const firstDay = getFirstDayOfMonth(currentDate);
	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
	const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

	const getItemsForDate = (day: number) => {
		const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
			.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
		return data.filter(
			(item) =>
				!item.isGroup &&
				(item.startDate === dateStr || item.endDate === dateStr)
		);
	};

	return (
		<Box
			display="flex"
			flexDirection="column"
			overflow="hidden"
			bg="bg.default"
			p="16"
			style={{ height: "100%", width: "100%" }}
		>
			{/* Month navigation */}
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				mb="16"
			>
				<Button appearance="subtle" onClick={goToPreviousMonth}>
					<IconChevronLeft size={20} />
				</Button>
				<Text fontWeight="600" fontSize="lg">
					{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
				</Text>
				<Button appearance="subtle" onClick={goToNextMonth}>
					<IconChevronRight size={20} />
				</Button>
			</Box>

			{/* Calendar grid */}
			<Box style={{ flex: 1, display: "flex", flexDirection: "column" }}>
				{/* Day headers */}
				<Box
					display="grid"
					style={{
						gridTemplateColumns: "repeat(7, 1fr)",
						gap: "8px",
						marginBottom: "8px",
					}}
				>
					{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
						<Box
							key={day}
							style={{
								textAlign: "center",
								fontWeight: 600,
								fontSize: "12px",
								color: "var(--ax-colors-fg-secondary)",
								padding: "8px",
							}}
						>
							{day}
						</Box>
					))}
				</Box>

				{/* Days */}
				<Box
					display="grid"
					style={{
						gridTemplateColumns: "repeat(7, 1fr)",
						gap: "8px",
						flex: 1,
					}}
				>
					{emptyDays.map((_, idx) => (
						<Box
							key={`empty-${idx}`}
							style={{
								backgroundColor: "var(--ax-colors-bg-secondary)",
								borderRadius: "6px",
								border: "1px solid transparent",
							}}
						/>
					))}

					{days.map((day) => {
						const isToday =
							day === today.getDate() &&
							currentDate.getMonth() === today.getMonth() &&
							currentDate.getFullYear() === today.getFullYear();
						const items = getItemsForDate(day);

						return (
							<Box
								key={day}
								style={{
									backgroundColor: isToday ? "var(--ax-colors-bg-tertiary)" : "var(--ax-colors-bg-secondary)",
									border: isToday
										? "2px solid var(--ax-colors-fg-accent)"
										: "1px solid var(--ax-colors-border-tertiary)",
									borderRadius: "6px",
									padding: "8px",
									display: "flex",
									flexDirection: "column",
									cursor: "pointer",
									transition: "all 0.2s",
									minHeight: "80px",
								}}
								onMouseEnter={(e) => {
									const el = e.currentTarget as HTMLElement;
									if (!isToday) el.style.backgroundColor = "var(--ax-colors-bg-default)";
								}}
								onMouseLeave={(e) => {
									const el = e.currentTarget as HTMLElement;
									if (!isToday) el.style.backgroundColor = "var(--ax-colors-bg-secondary)";
								}}
							>
								<Text fontWeight={isToday ? 600 : 500} fontSize="sm">
									{day}
								</Text>
								<Box
									style={{
										marginTop: "4px",
										display: "flex",
										flexDirection: "column",
										gap: "2px",
										flex: 1,
										overflow: "hidden",
									}}
								>
									{items.map((item) => (
										<Box
											key={item.id}
											style={{
												backgroundColor: getStatusColor(item.status),
												height: "6px",
												borderRadius: "2px",
												opacity: 0.7,
											}}
											title={item.title}
										/>
									))}
								</Box>
							</Box>
						);
					})}
				</Box>
			</Box>
		</Box>
	);
};

// Import IconChevronLeft (we need to add this to imports)
const IconChevronLeft = ({ size }: { size: number }) => (
	<IconChevronDown size={size} style={{ transform: "rotate(90deg)" }} />
);

export default function PlanViewPage() {
	const router = useRouter();
	const [showHierarchy, setShowHierarchy] = useState(true);
	const [expandedGroups, setExpandedGroups] = useState<string[]>(["social", "axiom", "test"]);
	const [activeView, setActiveView] = useState("list");

	const toggleGroup = (id: string) => {
		setExpandedGroups((prev) =>
			prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
		);
	};

	return (
		<Box style={{ height: '100vh', display: 'flex', flexDirection: 'column', margin: '-24px', marginTop: '-72px' }}>
		{/* Row 1 - Tab Navigation */}
		<Box borderB="1" borderColor="border.tertiary" bg="bg.default" px="16" display="flex" alignItems="center">
			<Tabs value={activeView} onValueChange={setActiveView}>
				<TabsList>
					<TabsTrigger value="list">List</TabsTrigger>
					<TabsTrigger value="calendar">Calendar</TabsTrigger>
					<TabsTrigger value="timeline">Timeline</TabsTrigger>
					<TabsTrigger value="board">Board</TabsTrigger>
				</TabsList>
			</Tabs>
			<Box display="flex" alignItems="center" gap="8" style={{cursor: "pointer", marginLeft: "16px"}}>
				<Text fontSize="sm" color="fg.tertiary">Saved Views</Text>
				<IconChevronDown size={14} />
			</Box>
		</Box>

		{/* Row 2 - Filter & Actions Bar */}
		<Box px="16" py="12" display="flex" alignItems="center" justifyContent="space-between" bg="bg.default">
			{/* Left - Filter & Search */}
			<Box display="flex" alignItems="center" gap="12">
				<Box display="inline-flex" className="relative">
					<Button icon={<IconFilter size={16} />} size="md" appearance="subtle" aria-label="Filter" />
					<Box style={{ position: 'absolute', top: '-4px', left: '-4px', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', borderRadius: '50%', backgroundColor: '#0037FF', color: 'white', fontWeight: 600, padding: '0 5px', zIndex: 1 }}>5</Box>
				</Box>
				<SearchInput placeholder="Search..." size="md" style={{width: '280px'}} />

				{/* Date range navigation - Calendar & Timeline only */}
				{(activeView === "calendar" || activeView === "timeline") && (
					<Box display="flex" alignItems="center" gap="8" style={{ marginLeft: '8px' }}>
						<Button appearance="subtle" size="sm" style={{ border: '1px solid var(--ax-colors-border-default)', borderRadius: '6px', padding: '4px 12px' }}>Today</Button>
						<Box display="flex" alignItems="center" gap="4">
							<Button appearance="subtle" size="sm" icon={<IconChevronLeft size={16} />} aria-label="Previous" />
							<Text fontSize="sm" fontWeight="500" style={{ whiteSpace: 'nowrap' }}>Feb 22 - Mar 23, 2026</Text>
							<Button appearance="subtle" size="sm" icon={<IconChevronRight size={16} />} aria-label="Next" />
						</Box>
					</Box>
				)}
			</Box>

			{/* Right - Actions */}
			<Box display="flex" alignItems="center" gap="8">
				<Button appearance="subtle" icon={<IconUserPlus size={20} />} aria-label="Share" style={{ border: '1px dashed var(--ax-colors-border-default)', borderRadius: '50%', width: '36px', height: '36px', padding: 0 }} />
				<Button appearance="subtle" size="md" style={{ border: '1px solid var(--ax-colors-border-default)', borderRadius: '6px' }}>Save View</Button>
				<Button appearance="subtle" icon={<IconDots size={20} />} aria-label="More options" />
			</Box>
		</Box>

		{/* Row 3 - View-specific Controls */}
		<Box px="16" py="8" display="flex" alignItems="center" justifyContent="space-between" borderB="1" borderColor="border.tertiary" bg="bg.default">
			{/* List view controls */}
			{activeView === "list" && (
				<>
					<Switch checked={showHierarchy} onCheckedChange={setShowHierarchy}>Show campaign hierarchy</Switch>
					<Box display="flex" alignItems="center" gap="8">
						<Button appearance="subtle" size="sm">Add <IconChevronDown size={14} style={{ marginLeft: '4px' }} /></Button>
						<Button appearance="subtle" size="sm">Columns <IconChevronDown size={14} style={{ marginLeft: '4px' }} /></Button>
					</Box>
				</>
			)}

			{/* Board view controls */}
			{activeView === "board" && (
				<>
					<Box display="flex" alignItems="center" gap="16">
						<Box display="flex" alignItems="center" gap="4">
							<Text fontSize="sm" color="fg.secondary">View</Text>
							<Text fontSize="sm" fontWeight="500">Tasks</Text>
							<IconChevronDown size={14} />
						</Box>
						<Box display="flex" alignItems="center" gap="4">
							<Text fontSize="sm" color="fg.secondary">Columns</Text>
							<Text fontSize="sm" fontWeight="500">Status</Text>
							<IconChevronDown size={14} />
						</Box>
						<Button appearance="subtle" size="sm" icon={<IconArrowsSort size={16} />} aria-label="Sort" />
						<Box display="flex" alignItems="center" gap="4">
							<Text fontSize="sm" color="fg.secondary">Group by</Text>
							<Text fontSize="sm" fontWeight="500">None</Text>
							<IconChevronDown size={14} />
						</Box>
						<Text fontSize="sm" color="fg.tertiary">Showing 5 tasks</Text>
					</Box>
					<Box display="flex" alignItems="center" gap="4" style={{ cursor: 'pointer' }}>
						<IconSettings size={16} />
						<Text fontSize="sm">Display</Text>
					</Box>
				</>
			)}

			{/* Calendar view controls */}
			{activeView === "calendar" && (
				<>
					<Box display="flex" alignItems="center" gap="16">
						<Box display="flex" alignItems="center" gap="4">
							<Text fontSize="sm" color="fg.secondary">View</Text>
							<Text fontSize="sm" fontWeight="500">Tasks</Text>
							<IconChevronDown size={14} />
						</Box>
						<Box display="flex" alignItems="center" gap="8">
							<Text fontSize="sm" color="fg.secondary">Planning</Text>
							<Switch checked={true} />
							<Text fontSize="sm" color="fg.secondary">Scheduled</Text>
						</Box>
					</Box>
					<Box display="flex" alignItems="center" gap="4" style={{ cursor: 'pointer' }}>
						<IconSettings size={16} />
						<Text fontSize="sm">Display</Text>
					</Box>
				</>
			)}

			{/* Timeline view controls */}
			{activeView === "timeline" && (
				<>
					<Box display="flex" alignItems="center" gap="16">
						<Switch checked={showHierarchy} onCheckedChange={setShowHierarchy}>Show campaign hierarchy</Switch>
						<Box display="flex" alignItems="center" gap="4">
							<Text fontSize="sm" color="fg.secondary">Color by</Text>
							<Text fontSize="sm" fontWeight="500">Campaign</Text>
							<IconChevronDown size={14} />
						</Box>
					</Box>
					<Box display="flex" alignItems="center" gap="16">
						<Box display="flex" alignItems="center" gap="4" style={{ cursor: 'pointer' }}>
							<IconSettings size={16} />
							<Text fontSize="sm">Zoom:</Text>
							<Text fontSize="sm" fontWeight="500" color="fg.accent">Month</Text>
							<IconChevronDown size={14} />
						</Box>
						<Button appearance="subtle" size="sm">Add <IconChevronDown size={14} style={{ marginLeft: '4px' }} /></Button>
					</Box>
				</>
			)}
		</Box>

			{/* Tab Content Container */}
			<Box bg="bg.default" style={{ flex: 1, overflow: "hidden", position: "relative" }}>
				{activeView === "list" && <Box style={{ position: "absolute", inset: 0, overflow: "auto" }}>
					{/* List View Table */}
					<Box bg="bg.default">
						<Table className="[&_td]:!align-middle [&_th]:!align-middle [&_tr]:h-[52px]" style={{minWidth: 'max-content'}}>
							<TableHeader>
								<TableRow className="align-middle">
									<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '48px'}}>
										<Checkbox />
									</TableHeaderCell>
									<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '280px', minWidth: '280px'}}>
										<Box display="flex" alignItems="center" gap="4">
											Title
											<IconPlus size={12} />
										</Box>
									</TableHeaderCell>
									<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '120px', minWidth: '120px'}}>Type</TableHeaderCell>
									<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '120px', minWidth: '120px'}}>Reference</TableHeaderCell>
									<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '200px', minWidth: '200px'}}>Owner</TableHeaderCell>
									<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '140px', minWidth: '140px'}}>Creation Date</TableHeaderCell>
									<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '140px', minWidth: '140px'}}>Start Date</TableHeaderCell>
									<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '140px', minWidth: '140px'}}>End/Due Date</TableHeaderCell>
									<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '120px', minWidth: '120px'}}>Depends On</TableHeaderCell>
									<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '130px', minWidth: '130px'}}>Status</TableHeaderCell>
									<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '160px', minWidth: '160px'}}>Parent Campaign</TableHeaderCell>
									<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '140px', minWidth: '140px'}}>Last Modified</TableHeaderCell>
									<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '120px', minWidth: '120px'}}>Current Step</TableHeaderCell>
									<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '150px', minWidth: '150px'}}>Current Step Name</TableHeaderCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								{planData.map((item) => (
									<TableRow
										key={item.id}
										className="align-middle cursor-pointer hover:bg-[var(--ax-colors-bg-default-hovered)]"
										onClick={(e) => {
											// Don't navigate if clicking on checkbox or expand button
											const target = e.target as HTMLElement;
											if (target.closest('button') || target.closest('input[type="checkbox"]')) {
												return;
											}
											// Only navigate for Task items, not Campaigns
											if (item.type === 'Task') {
												router.push(`/cmp/task/${item.id}`);
											}
										}}
									>
										<TableCell px="16" py="12" className="align-middle" style={{width: '48px'}}>
											<Box display="flex" alignItems="center" h="full">
												<Checkbox onClick={(e) => e.stopPropagation()} />
											</Box>
										</TableCell>
										<TableCell px="16" py="12" className="align-middle" style={{width: '280px', minWidth: '280px'}}>
											<Box display="flex" alignItems="center" gap="8">
												{item.isGroup && (
													<Button
														appearance="subtle"
														size="sm"
														icon={
															expandedGroups.includes(item.id) ? (
																<IconChevronDown size={16} />
															) : (
																<IconChevronRight size={16} />
															)
														}
														onClick={() => toggleGroup(item.id)}
														aria-label={expandedGroups.includes(item.id) ? "Collapse" : "Expand"}
													/>
												)}
												<Text fontWeight="500">{item.title}</Text>
												{item.badge && (
													<Badge intent="neutral">{item.badge}</Badge>
												)}
											</Box>
										</TableCell>
										<TableCell px="16" py="12" className="align-middle" style={{width: '120px', minWidth: '120px'}}>
											<Box display="flex" alignItems="center" h="full">
												<Text color="fg.secondary">{item.type}</Text>
											</Box>
										</TableCell>
										<TableCell px="16" py="12" className="align-middle" style={{width: '120px', minWidth: '120px'}}>
											<Box display="flex" alignItems="center" h="full">
												<Text color="fg.secondary">{item.reference}</Text>
											</Box>
										</TableCell>
										<TableCell px="16" py="12" className="align-middle" style={{width: '200px', minWidth: '200px'}}>
											<Box display="flex" alignItems="center" gap="8">
												<Avatar name={item.owner.name} src={item.owner.src} />
												<Text fontSize="sm" className="whitespace-nowrap overflow-hidden text-ellipsis">{item.owner.name}</Text>
											</Box>
										</TableCell>
										<TableCell px="16" py="12" className="align-middle" style={{width: '140px', minWidth: '140px'}}>
											<Box display="flex" alignItems="center" h="full">
												<Text color="fg.secondary" className="whitespace-nowrap">{item.creationDate}</Text>
											</Box>
										</TableCell>
										<TableCell px="16" py="12" className="align-middle" style={{width: '140px', minWidth: '140px'}}>
											<Box display="flex" alignItems="center" h="full">
												<Text color="fg.secondary" className="whitespace-nowrap">{item.startDate}</Text>
											</Box>
										</TableCell>
										<TableCell px="16" py="12" className="align-middle" style={{width: '140px', minWidth: '140px'}}>
											<Box display="flex" alignItems="center" h="full">
												<Text color="fg.secondary" className="whitespace-nowrap">{item.endDate}</Text>
											</Box>
										</TableCell>
										<TableCell px="16" py="12" className="align-middle" style={{width: '120px', minWidth: '120px'}}>
											<Box display="flex" alignItems="center" h="full">
												<Text color="fg.tertiary">—</Text>
											</Box>
										</TableCell>
										<TableCell px="16" py="12" className="align-middle" style={{width: '130px', minWidth: '130px'}}>
											<Box display="flex" alignItems="center" h="full">
												<StatusBadge status={item.status} />
											</Box>
										</TableCell>
										<TableCell px="16" py="12" className="align-middle" style={{width: '160px', minWidth: '160px'}}>
											<Box display="flex" alignItems="center" h="full">
												<Text color="fg.tertiary">{item.parentCampaign || "—"}</Text>
											</Box>
										</TableCell>
										<TableCell px="16" py="12" className="align-middle" style={{width: '140px', minWidth: '140px'}}>
											<Box display="flex" alignItems="center" h="full">
												<Text color="fg.secondary" className="whitespace-nowrap">{item.lastModified}</Text>
											</Box>
										</TableCell>
										<TableCell px="16" py="12" className="align-middle" style={{width: '120px', minWidth: '120px'}}>
											<Box display="flex" alignItems="center" h="full">
												<StepBadge step={item.currentStep} />
											</Box>
										</TableCell>
										<TableCell px="16" py="12" className="align-middle" style={{width: '150px', minWidth: '150px'}}>
											<Box display="flex" alignItems="center" h="full">
												{item.currentStepName ? (
													<Badge intent="information" className="font-normal">
														{item.currentStepName}
													</Badge>
												) : (
													<Text color="fg.tertiary">—</Text>
												)}
											</Box>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Box>
				</Box>}

				{activeView === "calendar" && <Box style={{ position: "absolute", inset: 0, overflow: "auto" }}>
					<CalendarView data={planData} />
				</Box>}

				{activeView === "timeline" && <Box style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
					<TimelineView data={planData} />
				</Box>}

				{activeView === "board" && <Box style={{ position: "absolute", inset: 0, overflow: "auto" }}>
					<BoardView data={planData} />
				</Box>}
			</Box>

			{/* Footer */}
			<Box
				px="16"
				py="8"
				borderT="1"
				borderColor="border.tertiary"
				bg="bg.default"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
			>
				<Box display="flex" alignItems="center" gap="8">
					<Text fontSize="sm" color="fg.tertiary">Page Size</Text>
					<Button appearance="subtle" size="sm">
						20 <IconChevronDown size={14} />
					</Button>
				</Box>
				<Box display="flex" alignItems="center" gap="4">
					<Button appearance="subtle" size="sm" disabled>
						&lt;
					</Button>
					<Button appearance="primary" size="sm">1</Button>
					<Button appearance="subtle" size="sm">2</Button>
					<Button appearance="subtle" size="sm">&gt;</Button>
				</Box>
			</Box>
		</Box>
	);
}

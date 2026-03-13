"use client";

import { type CSSProperties, type DragEvent, useEffect, useState } from "react";
import { Avatar, Badge, Box, Button } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { useLayout } from "@/app/context/LayoutContext";
import { useTheme } from "@/app/hooks/useTheme";
import { IconChevronLeft, IconChevronRight, IconFilter } from "@tabler/icons-react";

type ResourceTab = "workload" | "planner" | "reports";
type CellState = "default" | "over" | "under" | "pto";

type WorkloadCell = {
	value: number | null;
	state?: CellState;
};

type TeamMember = {
	id: string;
	name: string;
	role: string;
	weeklyCapacity: string;
	timezone: string;
	avatarSrc?: string;
	cells: WorkloadCell[];
};

type WeekColumn = {
	month: string;
	label: string;
};

type PlannerPerson = {
	id: string;
	name: string;
	role: string;
	weeklyCapacity: string;
	capacityHours: number;
	timezone?: string;
	avatarSrc?: string;
	isTeam?: boolean;
};

type PlannerDay = {
	dayLabel: string;
	dateLabel: string;
	isToday?: boolean;
};

type PlannerStatus = "done" | "not_started" | "in_progress";
type PlannerAccent = "blue" | "green" | "red" | "neutral";

type PlannerCard = {
	id: string;
	assigneeId: string;
	startDay: number;
	duration: number;
	lane: number;
	title: string;
	taskId: string;
	subtitle: string;
	status: PlannerStatus;
	hoursPerDay: number;
	accent: PlannerAccent;
	dueDay: number;
	draggable?: boolean;
};

type PlannerBlock = {
	id: string;
	assigneeId: string;
	startDay: number;
	duration: number;
	label: string;
	description?: string;
};

const weekColumns: WeekColumn[] = [
	{ month: "Jun", label: "1-7" },
	{ month: "Jun", label: "8-14" },
	{ month: "Jun", label: "15-22" },
	{ month: "Jun", label: "23-30" },
	{ month: "Jul", label: "1-7" },
	{ month: "Jul", label: "8-14" },
	{ month: "Jul", label: "15-22" },
	{ month: "Jul", label: "23-30" },
	{ month: "Aug", label: "1-7" },
	{ month: "Aug", label: "8-14" },
	{ month: "Aug", label: "15-22" },
	{ month: "Aug", label: "23-30" },
];

const groupedMonths = [
	{ label: "Jun", weeks: 4 },
	{ label: "Jul", weeks: 4 },
	{ label: "Aug", weeks: 4 },
];

const peopleColumnWidth = 278;
const workloadCellMinWidth = 68;
const workloadCellHeight = 68;
const workloadGridMinWidth = peopleColumnWidth + weekColumns.length * workloadCellMinWidth;

const plannerPeopleColumnWidth = 210;
const plannerDayMinWidth = 116;
const plannerCardHeight = 56;
const plannerLaneGap = 8;
const plannerRowPadding = 8;
const plannerGridMinWidth = plannerPeopleColumnWidth + 7 * plannerDayMinWidth;

const plannerPalette = {
	light: {
		cardBackground: "#FFFFFF",
		cardBorder: "#E8DFD2",
		cardText: "#3F4154",
		cardSubtext: "#7B7487",
		dropValidBackground: "rgba(140, 167, 241, 0.20)",
		dropValidBorder: "#84A7F4",
		dropInvalidBackground: "rgba(228, 181, 170, 0.22)",
		dropInvalidBorder: "#E0A093",
		accent: {
			blue: "#8FAFEF",
			green: "#9BC7A1",
			red: "#E0A7A0",
			neutral: "#D4C4E0",
		},
		badge: {
			done: { background: "#F3F4F7", text: "#A6ACB8" },
			in_progress: { background: "#E8EEFB", text: "#5873B8" },
			not_started: { background: "#F3F4F7", text: "#66708C" },
		},
	},
	dark: {
		cardBackground: "#1C1F2B",
		cardBorder: "#3A3A4D",
		cardText: "#F2EEE7",
		cardSubtext: "#B8B2C2",
		dropValidBackground: "rgba(112, 142, 214, 0.24)",
		dropValidBorder: "#90ACEA",
		dropInvalidBackground: "rgba(169, 101, 92, 0.26)",
		dropInvalidBorder: "#DD9A91",
		accent: {
			blue: "#8FAFEF",
			green: "#89B991",
			red: "#D6948B",
			neutral: "#B9A2CF",
		},
		badge: {
			done: { background: "#343844", text: "#8890A0" },
			in_progress: { background: "#27324C", text: "#B8CBF8" },
			not_started: { background: "#343844", text: "#C2C8D3" },
		},
	},
} as const;

const teamMembers: TeamMember[] = [
	{
		id: "matt-walsh",
		name: "Matt Walsh",
		role: "Principal PM",
		weeklyCapacity: "40h/week",
		timezone: "GMT-5",
		avatarSrc: "https://i.pravatar.cc/64?img=15",
		cells: [
			{ value: 39 },
			{ value: 38 },
			{ value: 40 },
			{ value: 36 },
			{ value: 39 },
			{ value: 36 },
			{ value: 35 },
			{ value: 39 },
			{ value: 40 },
			{ value: 40 },
			{ value: 47, state: "over" },
			{ value: 30 },
		],
	},
	{
		id: "jaquline-paris",
		name: "Jaquline Paris",
		role: "Senior Designer II",
		weeklyCapacity: "40h/week",
		timezone: "GMT-5",
		avatarSrc: "https://i.pravatar.cc/64?img=32",
		cells: [
			{ value: 58, state: "over" },
			{ value: 5, state: "under" },
			{ value: 39 },
			{ value: 3, state: "under" },
			{ value: 3, state: "under" },
			{ value: 35 },
			{ value: 39 },
			{ value: 38 },
			{ value: 38 },
			{ value: 39 },
			{ value: 40 },
			{ value: 40 },
		],
	},
	{
		id: "john-zoshak",
		name: "John Zoshak",
		role: "Principal Product Manager",
		weeklyCapacity: "20h/week",
		timezone: "GMT-5",
		avatarSrc: "https://i.pravatar.cc/64?img=13",
		cells: [
			{ value: 36 },
			{ value: 35 },
			{ value: 37 },
			{ value: 36 },
			{ value: 37 },
			{ value: 40 },
			{ value: 40 },
			{ value: 39 },
			{ value: 39 },
			{ value: 36 },
			{ value: 38 },
			{ value: 36 },
		],
	},
	{
		id: "zack-yee",
		name: "Zack Yee",
		role: "Staff Product Designer",
		weeklyCapacity: "40h/week",
		timezone: "GMT-5",
		avatarSrc: "https://i.pravatar.cc/64?img=12",
		cells: [
			{ value: 39 },
			{ value: 38 },
			{ value: null, state: "pto" },
			{ value: null, state: "pto" },
			{ value: 58, state: "over" },
			{ value: 53, state: "over" },
			{ value: 49, state: "over" },
			{ value: 39 },
			{ value: 5, state: "under" },
			{ value: 1, state: "under" },
			{ value: 9, state: "under" },
			{ value: 39 },
		],
	},
	{
		id: "tiffany-ballack",
		name: "Tiffany Ballack",
		role: "Staff Product Designer",
		weeklyCapacity: "15h/week",
		timezone: "GMT-5",
		avatarSrc: "https://i.pravatar.cc/64?img=28",
		cells: [
			{ value: 35 },
			{ value: 34 },
			{ value: 39 },
			{ value: 35 },
			{ value: 38 },
			{ value: null, state: "pto" },
			{ value: 39 },
			{ value: 38 },
			{ value: 38 },
			{ value: 39 },
			{ value: 2, state: "under" },
			{ value: 40 },
		],
	},
	{
		id: "jack-black",
		name: "Jack Black",
		role: "Product Manager",
		weeklyCapacity: "40h/week",
		timezone: "GMT-5",
		avatarSrc: "https://i.pravatar.cc/64?img=53",
		cells: [
			{ value: 36 },
			{ value: 35 },
			{ value: 37 },
			{ value: 36 },
			{ value: 37 },
			{ value: 40 },
			{ value: null, state: "pto" },
			{ value: null, state: "pto" },
			{ value: 39 },
			{ value: 36 },
			{ value: 38 },
			{ value: 36 },
		],
	},
	{
		id: "katie-perry",
		name: "Katie Perry",
		role: "Account Manager",
		weeklyCapacity: "40h/week",
		timezone: "GMT-5",
		avatarSrc: "https://i.pravatar.cc/64?img=47",
		cells: [
			{ value: null, state: "pto" },
			{ value: 38 },
			{ value: 40 },
			{ value: 36 },
			{ value: 39 },
			{ value: 36 },
			{ value: 35 },
			{ value: 39 },
			{ value: 40 },
			{ value: 0, state: "under" },
			{ value: 39 },
			{ value: 30 },
		],
	},
	{
		id: "alexandra-perez",
		name: "Alexandra Pérez",
		role: "Senior Copy Writer",
		weeklyCapacity: "40h/week",
		timezone: "GMT-5",
		avatarSrc: "https://i.pravatar.cc/64?img=36",
		cells: [
			{ value: 35 },
			{ value: 34 },
			{ value: 43, state: "over" },
			{ value: 44, state: "over" },
			{ value: 38 },
			{ value: 35 },
			{ value: 39 },
			{ value: 38 },
			{ value: 38 },
			{ value: 39 },
			{ value: 3, state: "under" },
			{ value: 40 },
		],
	},
	{
		id: "jeff-zucker",
		name: "Jeff Zucker",
		role: "Position at Company",
		weeklyCapacity: "40h/week",
		timezone: "GMT-5",
		avatarSrc: "https://i.pravatar.cc/64?img=60",
		cells: [
			{ value: 36 },
			{ value: 35 },
			{ value: 37 },
			{ value: 36 },
			{ value: 37 },
			{ value: 40 },
			{ value: 40 },
			{ value: 39 },
			{ value: 39 },
			{ value: 36 },
			{ value: 38 },
			{ value: 36 },
		],
	},
];

const plannerDays: PlannerDay[] = [
	{ dayLabel: "Sun", dateLabel: "Jun 1" },
	{ dayLabel: "Mon", dateLabel: "Jun 2" },
	{ dayLabel: "Tue", dateLabel: "Jun 3" },
	{ dayLabel: "Wed", dateLabel: "Jun 4", isToday: true },
	{ dayLabel: "Thu", dateLabel: "Jun 5" },
	{ dayLabel: "Fri", dateLabel: "Jun 6" },
	{ dayLabel: "Sat", dateLabel: "Jun 7" },
];

const plannerPeople: PlannerPerson[] = [
	{
		id: "matt-walsh",
		name: "Matt Walsh",
		role: "Principal PM",
		weeklyCapacity: "40h/week",
		capacityHours: 40,
		timezone: "UTC -5",
		avatarSrc: "https://i.pravatar.cc/64?img=15",
	},
	{
		id: "jaquline-paris",
		name: "Jaquline Paris",
		role: "Senior Designer II",
		weeklyCapacity: "40h/week",
		capacityHours: 40,
		timezone: "GMT+6",
		avatarSrc: "https://i.pravatar.cc/64?img=32",
	},
	{
		id: "john-zoshak",
		name: "John Zoshak",
		role: "Principal Product Manager",
		weeklyCapacity: "20h/week",
		capacityHours: 20,
		timezone: "GMT-5",
		avatarSrc: "https://i.pravatar.cc/64?img=13",
	},
	{
		id: "team-alpha",
		name: "Team Alpha",
		role: "Michelle Lopez, David Steinberg",
		weeklyCapacity: "Various",
		capacityHours: 60,
		isTeam: true,
	},
	{
		id: "zack-yee",
		name: "Zack Yee",
		role: "Staff Product Designer",
		weeklyCapacity: "40h/week",
		capacityHours: 40,
		timezone: "GMT-5",
		avatarSrc: "https://i.pravatar.cc/64?img=12",
	},
	{
		id: "tiffany-ballack",
		name: "Tiffany Ballack",
		role: "Staff Product Designer",
		weeklyCapacity: "15h/week",
		capacityHours: 15,
		timezone: "GMT-5",
		avatarSrc: "https://i.pravatar.cc/64?img=28",
	},
	{
		id: "jack-black",
		name: "Jack Black",
		role: "Product Manager",
		weeklyCapacity: "15h/week",
		capacityHours: 15,
		timezone: "GMT-5",
		avatarSrc: "https://i.pravatar.cc/64?img=53",
	},
	{
		id: "katie-perry",
		name: "Katie Perry",
		role: "Account Manager",
		weeklyCapacity: "40h/week",
		capacityHours: 40,
		timezone: "GMT-5",
		avatarSrc: "https://i.pravatar.cc/64?img=47",
	},
];

const plannerBlocks: PlannerBlock[] = [
	{
		id: "pto-katie",
		assigneeId: "katie-perry",
		startDay: 0,
		duration: 1,
		label: "PTO",
		description: "Summer Vacation",
	},
];

const initialPlannerCards: PlannerCard[] = [
	{
		id: "matt-q3-admin",
		assigneeId: "matt-walsh",
		startDay: 0,
		duration: 1,
		lane: 0,
		title: "Q3 Salesforce Admin Certification",
		taskId: "TSK-3349",
		subtitle: "Step 1: Review admin fundamentals.",
		status: "done",
		hoursPerDay: 5,
		accent: "neutral",
		dueDay: 0,
		draggable: false,
	},
	{
		id: "matt-q4-enterprise",
		assigneeId: "matt-walsh",
		startDay: 2,
		duration: 2,
		lane: 0,
		title: "Q4 Enterprise Sales Campaign",
		taskId: "TSK 4583",
		subtitle: "Step 4: Set up campaign automation.",
		status: "in_progress",
		hoursPerDay: 3,
		accent: "green",
		dueDay: 3,
	},
	{
		id: "matt-lead-nurturing",
		assigneeId: "matt-walsh",
		startDay: 6,
		duration: 1,
		lane: 0,
		title: "Lead Nurturing Workflow",
		taskId: "TSK-9271",
		subtitle: "Step 2: Design audience branch logic.",
		status: "not_started",
		hoursPerDay: 3,
		accent: "blue",
		dueDay: 6,
	},
	{
		id: "matt-nike-launch",
		assigneeId: "matt-walsh",
		startDay: 0,
		duration: 2,
		lane: 1,
		title: "Nike Global Marketing Launch",
		taskId: "TSK 1011",
		subtitle: "Copywriting",
		status: "in_progress",
		hoursPerDay: 6,
		accent: "blue",
		dueDay: 2,
	},
	{
		id: "jaq-q3-admin",
		assigneeId: "jaquline-paris",
		startDay: 0,
		duration: 2,
		lane: 0,
		title: "Q3 Salesforce Admin Certification",
		taskId: "TSK-3349",
		subtitle: "Step 2: Complete practice quiz.",
		status: "done",
		hoursPerDay: 8,
		accent: "neutral",
		dueDay: 1,
		draggable: false,
	},
	{
		id: "jaq-omni-prelaunch",
		assigneeId: "jaquline-paris",
		startDay: 2,
		duration: 2,
		lane: 0,
		title: "New Service Cloud Omni-Channel",
		taskId: "TSK-6055",
		subtitle: "Step 1: Conduct a pre-launch review.",
		status: "not_started",
		hoursPerDay: 3,
		accent: "neutral",
		dueDay: 4,
	},
	{
		id: "jaq-omni-routing",
		assigneeId: "jaquline-paris",
		startDay: 4,
		duration: 1,
		lane: 0,
		title: "New Service Cloud Omni-Channel",
		taskId: "TSK-6055",
		subtitle: "Step 2: Configure routing rules.",
		status: "not_started",
		hoursPerDay: 6,
		accent: "neutral",
		dueDay: 5,
	},
	{
		id: "jaq-write-copy",
		assigneeId: "jaquline-paris",
		startDay: 2,
		duration: 2,
		lane: 1,
		title: "Write Copy",
		taskId: "SUB Step 2",
		subtitle: "Develop core messaging.",
		status: "in_progress",
		hoursPerDay: 8,
		accent: "red",
		dueDay: 4,
	},
	{
		id: "jaq-lead-automation",
		assigneeId: "jaquline-paris",
		startDay: 4,
		duration: 1,
		lane: 1,
		title: "Lead Nurturing Workflow",
		taskId: "TSK-9271",
		subtitle: "Step 6: Finalize automation logic.",
		status: "not_started",
		hoursPerDay: 6,
		accent: "blue",
		dueDay: 5,
	},
	{
		id: "john-lead-map",
		assigneeId: "john-zoshak",
		startDay: 1,
		duration: 3,
		lane: 0,
		title: "Lead Nurturing Workflow Implementation",
		taskId: "TSK-9271",
		subtitle: "Step 1: Map out the lead lifecycle stages.",
		status: "in_progress",
		hoursPerDay: 3,
		accent: "blue",
		dueDay: 5,
	},
	{
		id: "team-q4-theme",
		assigneeId: "team-alpha",
		startDay: 0,
		duration: 3,
		lane: 0,
		title: "Q4 Enterprise Sales Campaign",
		taskId: "TSK 4583",
		subtitle: "Step 2: Develop core messaging and content themes.",
		status: "in_progress",
		hoursPerDay: 6,
		accent: "green",
		dueDay: 4,
	},
	{
		id: "team-nike-copy",
		assigneeId: "team-alpha",
		startDay: 4,
		duration: 2,
		lane: 0,
		title: "Nike Global Marketing Launch",
		taskId: "TSK 1011",
		subtitle: "Copywriting",
		status: "not_started",
		hoursPerDay: 9,
		accent: "blue",
		dueDay: 6,
	},
	{
		id: "zack-phase-two",
		assigneeId: "zack-yee",
		startDay: 2,
		duration: 2,
		lane: 0,
		title: "Phase 2",
		taskId: "TSK 4583",
		subtitle: "Q4 Enterprise Sales expansion.",
		status: "not_started",
		hoursPerDay: 6,
		accent: "green",
		dueDay: 4,
	},
	{
		id: "zack-customer-portal",
		assigneeId: "zack-yee",
		startDay: 4,
		duration: 3,
		lane: 0,
		title: "Customer Portal User Experience",
		taskId: "TSK-1102",
		subtitle: "Step 6: Hand off designs to the dev team.",
		status: "not_started",
		hoursPerDay: 6,
		accent: "red",
		dueDay: 5,
	},
	{
		id: "tiff-ux-audit",
		assigneeId: "tiffany-ballack",
		startDay: 1,
		duration: 2,
		lane: 1,
		title: "Customer Portal User Experience (UX) Audit",
		taskId: "TSK-1102",
		subtitle: "Step 2: Identify key pain points.",
		status: "not_started",
		hoursPerDay: 6,
		accent: "red",
		dueDay: 2,
	},
	{
		id: "tiff-complete-copy",
		assigneeId: "tiffany-ballack",
		startDay: 6,
		duration: 1,
		lane: 0,
		title: "Finalize Copy Notes",
		taskId: "TSK-9271",
		subtitle: "Wrap approvals and comments.",
		status: "done",
		hoursPerDay: 1,
		accent: "neutral",
		dueDay: 6,
		draggable: false,
	},
	{
		id: "jack-lead-implementation",
		assigneeId: "jack-black",
		startDay: 3,
		duration: 2,
		lane: 0,
		title: "Lead Nurturing Workflow Implementation",
		taskId: "TSK-9271",
		subtitle: "Step 3: Build and test the automation rules.",
		status: "not_started",
		hoursPerDay: 4,
		accent: "blue",
		dueDay: 6,
	},
	{
		id: "katie-lead-implementation",
		assigneeId: "katie-perry",
		startDay: 3,
		duration: 3,
		lane: 0,
		title: "Lead Nurturing Workflow Implementation",
		taskId: "TSK-9271",
		subtitle: "Step 3: Build and test the automation rules in Salesforce.",
		status: "not_started",
		hoursPerDay: 8,
		accent: "blue",
		dueDay: 6,
	},
	{
		id: "katie-review",
		assigneeId: "katie-perry",
		startDay: 6,
		duration: 1,
		lane: 1,
		title: "Account Review Sync",
		taskId: "TSK-3192",
		subtitle: "Confirm stakeholder approval path.",
		status: "in_progress",
		hoursPerDay: 2,
		accent: "green",
		dueDay: 6,
	},
];

function rangesOverlap(startA: number, endA: number, startB: number, endB: number) {
	return startA <= endB && startB <= endA;
}

function getAvailableLane(
	cards: PlannerCard[],
	assigneeId: string,
	startDay: number,
	duration: number,
	ignoreCardId?: string
) {
	if (startDay + duration > plannerDays.length) {
		return null;
	}

	const maxExistingLane = cards.reduce((highest, card) => {
		if (card.id === ignoreCardId || card.assigneeId !== assigneeId) {
			return highest;
		}

		return Math.max(highest, card.lane);
	}, -1);

	for (let lane = 0; lane <= maxExistingLane + 1; lane += 1) {
		const hasConflict = cards.some((card) => {
			if (card.id === ignoreCardId || card.assigneeId !== assigneeId || card.lane !== lane) {
				return false;
			}

			return rangesOverlap(
				card.startDay,
				card.startDay + card.duration - 1,
				startDay,
				startDay + duration - 1
			);
		});

		if (!hasConflict) {
			return lane;
		}
	}

	return null;
}

function getUtilizationPercent(person: PlannerPerson, cards: PlannerCard[]) {
	const totalHours = cards.reduce((sum, card) => {
		if (card.assigneeId !== person.id) {
			return sum;
		}

		return sum + card.hoursPerDay * card.duration;
	}, 0);

	return Math.round((totalHours / person.capacityHours) * 100);
}

function getPlannerStatusLabel(status: PlannerStatus) {
	switch (status) {
		case "done":
			return "Completed";
		case "in_progress":
			return "In Progress";
		default:
			return "Not Started";
	}
}

function getPlannerBadgeStyle(status: PlannerStatus, theme: "light" | "dark"): CSSProperties {
	const palette = plannerPalette[theme].badge;

	switch (status) {
		case "done":
			return {
				backgroundColor: palette.done.background,
				color: palette.done.text,
			};
		case "in_progress":
			return {
				backgroundColor: palette.in_progress.background,
				color: palette.in_progress.text,
			};
		default:
			return {
				backgroundColor: palette.not_started.background,
				color: palette.not_started.text,
			};
	}
}

function getPlannerAccentColor(accent: PlannerAccent, theme: "light" | "dark") {
	return plannerPalette[theme].accent[accent];
}

function WorkloadTabButton({
	active,
	children,
	onClick,
}: {
	active: boolean;
	children: string;
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			style={{
				background: "transparent",
				border: 0,
				borderBottom: `2px solid ${
					active ? "var(--ax-colors-border-accent)" : "transparent"
				}`,
				cursor: "pointer",
				padding: "12px 8px",
			}}
			type="button"
		>
			<Text color={active ? "fg.default" : "fg.secondary"} fontSize="sm" fontWeight={active ? "500" : "400"}>
				{children}
			</Text>
		</button>
	);
}

function WorkloadCellBox({
	cell,
	theme,
}: {
	cell: WorkloadCell;
	theme: "light" | "dark";
}) {
	const [isHovered, setIsHovered] = useState(false);

	const baseStyle: CSSProperties = {
		alignItems: "center",
		borderBottom: "1px solid var(--ax-colors-fg-white)",
		borderRight: "1px solid var(--ax-colors-fg-white)",
		display: "flex",
		height: workloadCellHeight,
		justifyContent: "center",
		padding: 24,
	};

	let backgroundColor = "var(--ax-colors-bg-secondary)";
	let backgroundImage: string | undefined;
	let textColor = "var(--ax-colors-fg-default)";

	if (cell.state === "over") {
		if (theme === "dark") {
			backgroundColor = isHovered ? "#4a2a2a" : "var(--ax-colors-bg-error-subtle)";
			textColor = "var(--ax-colors-fg-error)";
		} else {
			backgroundColor = isHovered ? "#e9c1c1" : "#f6d0d0";
			textColor = "#2e3442";
		}
	}

	if (cell.state === "under") {
		if (theme === "dark") {
			backgroundColor = isHovered ? "#294437" : "var(--ax-colors-bg-success-subtle)";
			textColor = "var(--ax-colors-fg-success)";
		} else {
			backgroundColor = isHovered ? "#b7d9b8" : "#c8e6c9";
			textColor = "#2e3442";
		}
	}

	if (cell.state === "pto") {
		backgroundColor =
			theme === "dark"
				? isHovered
					? "#434d5f"
					: "var(--ax-colors-bg-tertiary)"
				: isHovered
					? "#cfd6e3"
					: "#dadfeb";
		backgroundImage =
			"repeating-linear-gradient(-45deg, rgba(255,255,255,0.16) 0, rgba(255,255,255,0.16) 6px, rgba(255,255,255,0.04) 6px, rgba(255,255,255,0.04) 12px)";
	}

	if (!cell.state || cell.state === "default") {
		backgroundColor = isHovered
			? "var(--ax-colors-bg-tertiary)"
			: "var(--ax-colors-bg-secondary)";
	}

	return (
		<Box
			alignItems="center"
			display="flex"
			justifyContent="center"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={{
				...baseStyle,
				backgroundColor,
				backgroundImage,
				transition: "background-color 120ms ease",
			}}
		>
			{cell.value !== null ? (
				<Text color="fg.default" fontSize="md" fontWeight="600" style={{ color: textColor, maxWidth: "none" }}>
					{cell.value}
				</Text>
			) : null}
		</Box>
	);
}

function WorkloadGrid({ theme }: { theme: "light" | "dark" }) {
	const tableColumns = `${peopleColumnWidth}px repeat(${weekColumns.length}, minmax(${workloadCellMinWidth}px, 1fr))`;

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			rounded="lg"
			overflow="hidden"
			w="full"
		>
			<Box overflowX="auto" w="full">
				<Box
					style={{
						minWidth: workloadGridMinWidth,
						width: "100%",
					}}
				>
					<Box
						display="grid"
						style={{
							borderBottom: "1px solid var(--ax-colors-border-tertiary)",
							gridTemplateColumns: tableColumns,
						}}
					>
						<Box
							bg="bg.default"
							style={{
								left: 0,
								position: "sticky",
								zIndex: 4,
							}}
						/>
						{groupedMonths.map((month) => (
							<Box
								key={month.label}
								alignItems="center"
								bg="bg.default"
								display="flex"
								justifyContent="center"
								py="8"
								style={{
									borderLeft:
										month.label === "Jun"
											? "1px solid var(--ax-colors-border-tertiary)"
											: undefined,
									gridColumn: `span ${month.weeks}`,
								}}
							>
								<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: "16px", maxWidth: "none" }}>
									{month.label}
								</Text>
							</Box>
						))}
					</Box>

					<Box
						display="grid"
						style={{
							borderBottom: "1px solid var(--ax-colors-border-tertiary)",
							gridTemplateColumns: tableColumns,
						}}
					>
						<Box
							alignItems="center"
							bg="bg.secondary"
							display="flex"
							px="20"
							py="12"
							style={{
								borderRight: "1px solid var(--ax-colors-border-tertiary)",
								left: 0,
								position: "sticky",
								zIndex: 4,
							}}
						>
							<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: "20px", maxWidth: "none" }}>
								People
							</Text>
						</Box>
						{weekColumns.map((week, index) => (
							<Box
								key={`${week.month}-${week.label}`}
								alignItems="center"
								bg="bg.default"
								display="flex"
								justifyContent="center"
								py="8"
								style={{
									borderLeft:
										index === 0 || index === 4 || index === 8
											? "1px solid var(--ax-colors-border-tertiary)"
											: undefined,
									borderRight: "1px solid var(--ax-colors-border-tertiary)",
								}}
							>
								<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: "16px", maxWidth: "none" }}>
									{week.label}
								</Text>
							</Box>
						))}
					</Box>

					{teamMembers.map((member) => (
						<Box key={member.id} display="grid" style={{ gridTemplateColumns: tableColumns }}>
							<Box
								alignItems="center"
								bg="bg.default"
								display="flex"
								gap="12"
								px="12"
								py="12"
								style={{
									borderBottom: "1px solid var(--ax-colors-border-default)",
									borderRight: "1px solid var(--ax-colors-border-tertiary)",
									height: workloadCellHeight,
									left: 0,
									position: "sticky",
									zIndex: 3,
								}}
							>
								<Avatar name={member.name} size="md" src={member.avatarSrc} />
								<Box display="flex" flexDirection="column" style={{ gap: 1, minWidth: 0 }}>
									<Text color="fg.default" fontSize="md" fontWeight="600" style={{ lineHeight: "24px" }} truncate>
										{member.name}
									</Text>
									<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: "18px" }} truncate>
										{member.role}
									</Text>
									<Text color="fg.tertiary" fontSize="sm" style={{ lineHeight: "18px" }} truncate>
										{member.weeklyCapacity} · {member.timezone}
									</Text>
								</Box>
							</Box>

							{member.cells.map((cell, index) => (
								<WorkloadCellBox key={`${member.id}-${index}`} cell={cell} theme={theme} />
							))}
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	);
}

function PlannerCardTile({
	card,
	dragged,
	theme,
	onDragStart,
	onDragEnd,
}: {
	card: PlannerCard;
	dragged: boolean;
	theme: "light" | "dark";
	onDragStart: (event: DragEvent<HTMLDivElement>, cardId: string) => void;
	onDragEnd: () => void;
}) {
	const badgeStyle = getPlannerBadgeStyle(card.status, theme);
	const isComplete = card.status === "done";
	const palette = plannerPalette[theme];

	return (
		<div
			draggable={card.draggable !== false}
			onDragStart={(event) => onDragStart(event, card.id)}
			onDragEnd={onDragEnd}
			style={{
				backgroundColor: palette.cardBackground,
				border: "0",
				borderLeft: `3px solid ${getPlannerAccentColor(card.accent, theme)}`,
				borderRadius: 8,
				boxShadow:
					dragged
						? "0 10px 24px rgba(0, 0, 0, 0.18)"
						: "0 1px 2px rgba(16, 24, 40, 0.08)",
				cursor: card.draggable === false ? "default" : "grab",
				display: "flex",
				height: "100%",
				alignItems: "center",
				justifyContent: "space-between",
				opacity: isComplete ? 0.5 : dragged ? 0.66 : 1,
				overflow: "hidden",
				padding: "8px 12px",
				position: "relative",
				width: "100%",
			}}
		>
			<Box alignItems="center" display="flex" gap="12" justifyContent="space-between" style={{ flex: 1, minWidth: 0 }}>
				<Box display="flex" flexDirection="column" style={{ flex: 1, gap: 2, minWidth: 0 }}>
					<Text
						fontSize="sm"
						fontWeight="600"
						style={{
							color: palette.cardText,
							lineHeight: "20px",
							maxWidth: "none",
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{card.title}
					</Text>
					<Text
						fontSize="xs"
						style={{
							color: palette.cardSubtext,
							lineHeight: "16px",
							maxWidth: "none",
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{card.taskId} · {card.subtitle}
					</Text>
				</Box>

				<Box alignItems="end" display="flex" flexDirection="column" style={{ flexShrink: 0, gap: 6 }}>
					<Box
						alignItems="center"
						display="inline-flex"
						justifyContent="center"
						rounded="full"
						style={{
							...badgeStyle,
							flexShrink: 0,
							fontSize: 11,
							fontWeight: 500,
							lineHeight: "14px",
							padding: "3px 10px",
							whiteSpace: "nowrap",
						}}
					>
						{getPlannerStatusLabel(card.status)}
					</Box>
					<Text
						fontSize="xs"
						fontWeight="600"
						style={{ color: palette.cardText, lineHeight: "16px", maxWidth: "none" }}
					>
						{card.hoursPerDay}h day
					</Text>
				</Box>
			</Box>
		</div>
	);
}

function PlannerGrid({
	cards,
	setCards,
	theme,
}: {
	cards: PlannerCard[];
	setCards: React.Dispatch<React.SetStateAction<PlannerCard[]>>;
	theme: "light" | "dark";
}) {
	const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
	const activeCard = cards.find((card) => card.id === draggedCardId) ?? null;
	const dayColumnTemplate = `repeat(${plannerDays.length}, minmax(${plannerDayMinWidth}px, 1fr))`;

	const getPersonLaneCount = (assigneeId: string) => {
		const maxLane = cards.reduce((highest, card) => {
			if (card.assigneeId !== assigneeId) {
				return highest;
			}

			return Math.max(highest, card.lane);
		}, -1);

		return Math.max(1, maxLane + 1 + (activeCard ? 1 : 0));
	};

	const getPersonRowHeight = (laneCount: number) =>
		plannerRowPadding * 2 +
		plannerCardHeight * laneCount +
		Math.max(0, laneCount - 1) * plannerLaneGap;

	const handleDragStart = (event: DragEvent<HTMLDivElement>, cardId: string) => {
		event.dataTransfer.effectAllowed = "move";
		event.dataTransfer.setData("text/plain", cardId);
		setDraggedCardId(cardId);
	};

	const handleDragEnd = () => {
		setDraggedCardId(null);
	};

	const handleDrop = (assigneeId: string, startDay: number, lane: number | null, isValid: boolean) => {
		if (!activeCard || lane === null || !isValid) {
			setDraggedCardId(null);
			return;
		}

		setCards((currentCards) =>
			currentCards.map((card) =>
				card.id === activeCard.id
					? {
							...card,
							assigneeId,
							startDay,
							lane,
						}
					: card
			)
		);

		setDraggedCardId(null);
	};

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			rounded="lg"
			overflow="hidden"
			w="full"
		>
			<Box overflowX="auto" w="full">
				<Box style={{ minWidth: plannerGridMinWidth, width: "100%" }}>
					<Box
						display="grid"
						style={{
							borderBottom: "1px solid var(--ax-colors-border-tertiary)",
							gridTemplateColumns: `${plannerPeopleColumnWidth}px minmax(0, 1fr)`,
						}}
					>
						<Box
							alignItems="center"
							bg="bg.secondary"
							display="flex"
							px="20"
							py="12"
							style={{
								borderRight: "1px solid var(--ax-colors-border-tertiary)",
							}}
						>
							<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: "20px", maxWidth: "none" }}>
								People
							</Text>
						</Box>

						<Box
							bg="bg.default"
							display="grid"
							style={{
								gridTemplateColumns: dayColumnTemplate,
							}}
						>
							{plannerDays.map((day, index) => (
								<Box
									key={day.dateLabel}
									alignItems="center"
									display="flex"
									justifyContent="center"
									py="10"
									style={{
										borderRight:
											index === plannerDays.length - 1
												? undefined
												: "1px solid var(--ax-colors-border-tertiary)",
										gap: 6,
									}}
								>
									<Text color="fg.tertiary" fontSize="xs" style={{ lineHeight: "16px", maxWidth: "none" }}>
										{day.dayLabel}
									</Text>
									{day.isToday ? (
										<Box
											alignItems="center"
											bg="bg.accent"
											display="inline-flex"
											justifyContent="center"
											rounded="full"
											style={{ minWidth: 42, padding: "2px 10px" }}
										>
											<Text color="fg.white" fontSize="xs" fontWeight="600" style={{ lineHeight: "16px", maxWidth: "none" }}>
												{day.dateLabel}
											</Text>
										</Box>
									) : (
										<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: "16px", maxWidth: "none" }}>
											{day.dateLabel}
										</Text>
									)}
								</Box>
							))}
						</Box>
					</Box>

					{plannerPeople.map((person) => {
						const personCards = cards.filter((card) => card.assigneeId === person.id);
						const utilization = getUtilizationPercent(person, cards);
						const overCapacity = utilization > 100;
						const laneCount = getPersonLaneCount(person.id);
						const rowHeight = getPersonRowHeight(laneCount);

						return (
							<Box
								key={person.id}
								display="grid"
								style={{
									gridTemplateColumns: `${plannerPeopleColumnWidth}px minmax(0, 1fr)`,
								}}
							>
									<Box
										alignItems="start"
									bg="bg.default"
									display="flex"
									gap="12"
									px="12"
									py="12"
									style={{
										borderBottom: "1px solid var(--ax-colors-border-tertiary)",
										borderRight: "1px solid var(--ax-colors-border-tertiary)",
										left: 0,
										minHeight: rowHeight,
										position: "sticky",
										zIndex: 2,
									}}
								>
									{person.isTeam ? (
										<Box
											alignItems="center"
											bg="bg.secondary"
											display="flex"
											justifyContent="center"
											rounded="full"
											style={{ flexShrink: 0, height: 32, width: 32 }}
										>
											<Text color="fg.secondary" fontSize="xs" fontWeight="600" style={{ maxWidth: "none" }}>
												TA
											</Text>
										</Box>
									) : (
										<Avatar name={person.name} size="sm" src={person.avatarSrc} />
									)}

									<Box display="flex" flexDirection="column" style={{ flex: 1, gap: 2, minWidth: 0 }}>
										<Box alignItems="center" display="flex" gap="8" justifyContent="space-between">
											<Text color="fg.default" fontSize="md" fontWeight="600" style={{ lineHeight: "24px" }} truncate>
												{person.name}
											</Text>
											<Box
												alignItems="center"
												display="inline-flex"
												justifyContent="center"
												rounded="full"
												style={{
													backgroundColor: overCapacity
														? "var(--ax-colors-bg-error-subtle)"
														: "var(--ax-colors-bg-secondary)",
													color: overCapacity
														? "var(--ax-colors-fg-error)"
														: "var(--ax-colors-fg-secondary)",
													flexShrink: 0,
													fontSize: 12,
													fontWeight: 500,
													lineHeight: "16px",
													padding: "2px 8px",
												}}
											>
												{utilization}%
											</Box>
										</Box>
										<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: "18px" }} truncate>
											{person.role}
										</Text>
										<Text color="fg.tertiary" fontSize="xs" style={{ lineHeight: "16px" }} truncate>
											{person.weeklyCapacity}
											{person.timezone ? ` · ${person.timezone}` : ""}
										</Text>
									</Box>
								</Box>

								<Box
									bg="bg.default"
									style={{
										borderBottom: "1px solid var(--ax-colors-border-tertiary)",
										minHeight: rowHeight,
										position: "relative",
									}}
								>
									<Box
										display="grid"
										style={{
											gridTemplateColumns: dayColumnTemplate,
											height: "100%",
											position: "absolute",
											inset: 0,
										}}
									>
										{plannerDays.map((day, dayIndex) => {
											const block = plannerBlocks.find(
												(item) =>
													item.assigneeId === person.id &&
													dayIndex >= item.startDay &&
													dayIndex < item.startDay + item.duration
											);
											const isBlockStart = block ? dayIndex === block.startDay : false;

											return (
												<Box
													key={`${person.id}-${day.dateLabel}`}
													bg="bg.secondary"
													style={{
														backgroundColor: block
															? theme === "dark"
																? "#2a3142"
																: "#e3e8f4"
															: "var(--ax-colors-bg-secondary)",
														backgroundImage: block
															? "repeating-linear-gradient(-45deg, rgba(255,255,255,0.20) 0, rgba(255,255,255,0.20) 6px, rgba(255,255,255,0.06) 6px, rgba(255,255,255,0.06) 12px)"
															: undefined,
														borderRight:
															dayIndex === plannerDays.length - 1
																? undefined
																: "1px solid var(--ax-colors-border-tertiary)",
														padding: block ? 10 : 0,
													}}
												>
													{block && isBlockStart ? (
														<Box display="flex" flexDirection="column" style={{ gap: 2 }}>
															<Text color="fg.tertiary" fontSize="xs" fontWeight="500" style={{ lineHeight: "14px" }}>
																{block.label}
															</Text>
															{block.description ? (
																<Text color="fg.tertiary" fontSize="xs" style={{ lineHeight: "14px" }}>
																	{block.description}
																</Text>
															) : null}
														</Box>
													) : null}
												</Box>
											);
										})}
									</Box>

									<Box
										style={{
											display: "grid",
											gap: plannerLaneGap,
											gridTemplateColumns: dayColumnTemplate,
											gridTemplateRows: `repeat(${laneCount}, ${plannerCardHeight}px)`,
											inset: plannerRowPadding,
											position: "absolute",
										}}
									>
										{activeCard
											? plannerPeople.flatMap((slotPerson) =>
													plannerDays.map((day, startDay) => {
														const lane = getAvailableLane(
															cards,
															slotPerson.id,
															startDay,
															activeCard.duration,
															activeCard.id
														);
														if (lane === null) {
															return null;
														}

														const isValid = startDay + activeCard.duration - 1 <= activeCard.dueDay;
														return (
															<div
																key={`${slotPerson.id}-${startDay}`}
																onDragOver={(event) => {
																	event.preventDefault();
																	event.dataTransfer.dropEffect = isValid ? "move" : "none";
																}}
																onDrop={(event) => {
																	event.preventDefault();
																	if (slotPerson.id === person.id) {
																		handleDrop(slotPerson.id, startDay, lane, isValid);
																	}
																}}
																style={{
																	display: slotPerson.id === person.id ? "block" : "none",
																	gridColumn: `${startDay + 1} / span ${activeCard.duration}`,
																	gridRow: `${lane + 1}`,
																	pointerEvents: slotPerson.id === person.id ? "auto" : "none",
																	zIndex: 1,
																}}
															>
														<div
															style={{
																backgroundColor: isValid
																	? plannerPalette[theme].dropValidBackground
																	: plannerPalette[theme].dropInvalidBackground,
																border: `1px dashed ${
																	isValid
																		? plannerPalette[theme].dropValidBorder
																		: plannerPalette[theme].dropInvalidBorder
																}`,
																borderRadius: 10,
																height: "100%",
																		width: "100%",
																	}}
																/>
															</div>
														);
													})
												)
											: null}

										{personCards.map((card) => (
											<div
												key={card.id}
												style={{
													gridColumn: `${card.startDay + 1} / span ${card.duration}`,
													gridRow: `${card.lane + 1}`,
													position: "relative",
													zIndex: 2,
												}}
											>
												<PlannerCardTile
													card={card}
													dragged={draggedCardId === card.id}
													theme={theme}
													onDragEnd={handleDragEnd}
													onDragStart={handleDragStart}
												/>
											</div>
										))}
									</Box>
								</Box>
							</Box>
						);
					})}
				</Box>
			</Box>
		</Box>
	);
}

export default function CMPResourceManagementPage() {
	const { setHidePageHeader } = useLayout();
	const { theme } = useTheme();
	const [activeTab, setActiveTab] = useState<ResourceTab>("workload");
	const [plannerCards, setPlannerCards] = useState<PlannerCard[]>(initialPlannerCards);

	useEffect(() => {
		setHidePageHeader(true);
		return () => setHidePageHeader(false);
	}, [setHidePageHeader]);

	return (
		<Box w="full">
			<Box borderB="1" borderColor="border.tertiary" display="flex" style={{ gap: 28 }}>
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

			<Box pt="20">
				{activeTab === "workload" ? (
					<Box display="flex" flexDirection="column" gap="16" w="full">
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

								<Button appearance="default" size="md">
									Today
								</Button>

								<Box alignItems="center" display="flex" gap="8">
									<Button appearance="subtle" aria-label="Previous date range" size="sm">
										<IconChevronLeft size={16} />
									</Button>
									<Text color="fg.default" fontSize="sm" fontWeight="600" style={{ maxWidth: "none" }}>
										Jun 1 - Aug 30 2025
									</Text>
									<Button appearance="subtle" aria-label="Next date range" size="sm">
										<IconChevronRight size={16} />
									</Button>
								</Box>
							</Box>
						</Box>

						<Box w="full">
							<WorkloadGrid theme={theme} />
						</Box>
					</Box>
				) : null}

				{activeTab === "planner" ? (
					<Box display="flex" flexDirection="column" gap="16" w="full">
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

								<Button appearance="default" size="md">
									Today
								</Button>

								<Box alignItems="center" display="flex" gap="8">
									<Button appearance="subtle" aria-label="Previous planner range" size="sm">
										<IconChevronLeft size={16} />
									</Button>
									<Text color="fg.default" fontSize="sm" fontWeight="600" style={{ maxWidth: "none" }}>
										Jun 1 - Jun 7 2025
									</Text>
									<Button appearance="subtle" aria-label="Next planner range" size="sm">
										<IconChevronRight size={16} />
									</Button>
								</Box>
							</Box>

							<Box alignItems="center" display="flex" gap="8">
								<Text color="fg.default" fontSize="sm" style={{ maxWidth: "none" }}>
									Unscoped Steps
								</Text>
								<Badge intent="primary">24</Badge>
							</Box>
						</Box>

						<PlannerGrid cards={plannerCards} setCards={setPlannerCards} theme={theme} />
					</Box>
				) : null}

				{activeTab === "reports" ? (
					<Box
						alignItems="center"
						bg="bg.default"
						border="1"
						borderColor="border.tertiary"
						display="flex"
						justifyContent="center"
						rounded="lg"
						style={{ minHeight: 320 }}
					>
						<Box display="flex" flexDirection="column" gap="8" textAlign="center">
							<Text color="fg.default" fontSize="lg" fontWeight="600">
								Reports
							</Text>
							<Text color="fg.secondary" fontSize="sm" style={{ maxWidth: 320 }}>
								The Reports tab can be implemented next once we lock the Planner interactions and scheduling model.
							</Text>
						</Box>
					</Box>
				) : null}
			</Box>
		</Box>
	);
}

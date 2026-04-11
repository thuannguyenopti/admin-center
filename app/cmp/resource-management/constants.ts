import type { WeekColumn, PlannerDay } from "./types";

// Timeline configuration
export const demoTodayIndex = 3;
export const timelineStartDate = new Date("2025-06-01T12:00:00");
export const timelineEndDate = new Date("2025-08-30T12:00:00");
export const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Helper functions for timeline
export function addDays(date: Date, days: number) {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
}

export function diffInDays(start: Date, end: Date) {
	return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

function toTimelineDay(date: Date, index: number): PlannerDay {
	return {
		id: date.toISOString().slice(0, 10),
		index,
		dayLabel: dayLabels[date.getDay()],
		dateLabel: `${monthLabels[date.getMonth()]} ${date.getDate()}`,
		isToday: index === demoTodayIndex,
	};
}

export const fullTimelineDays: PlannerDay[] = Array.from(
	{ length: diffInDays(timelineStartDate, timelineEndDate) + 1 },
	(_, index) => toTimelineDay(addDays(timelineStartDate, index), index)
);

function getTimelineIndex(month: string, dayOfMonth: number) {
	const monthIndex = monthLabels.indexOf(month);
	return diffInDays(timelineStartDate, new Date(2025, monthIndex, dayOfMonth, 12));
}

export const weekColumns: WeekColumn[] = [
	{ id: "jun-1-7", month: "Jun", label: "1-7", startDay: getTimelineIndex("Jun", 1), duration: 7 },
	{ id: "jun-8-14", month: "Jun", label: "8-14", startDay: getTimelineIndex("Jun", 8), duration: 7 },
	{ id: "jun-15-22", month: "Jun", label: "15-22", startDay: getTimelineIndex("Jun", 15), duration: 8 },
	{ id: "jun-23-30", month: "Jun", label: "23-30", startDay: getTimelineIndex("Jun", 23), duration: 8 },
	{ id: "jul-1-7", month: "Jul", label: "1-7", startDay: getTimelineIndex("Jul", 1), duration: 7 },
	{ id: "jul-8-14", month: "Jul", label: "8-14", startDay: getTimelineIndex("Jul", 8), duration: 7 },
	{ id: "jul-15-22", month: "Jul", label: "15-22", startDay: getTimelineIndex("Jul", 15), duration: 8 },
	{ id: "jul-23-30", month: "Jul", label: "23-30", startDay: getTimelineIndex("Jul", 23), duration: 8 },
	{ id: "aug-1-7", month: "Aug", label: "1-7", startDay: getTimelineIndex("Aug", 1), duration: 7 },
	{ id: "aug-8-14", month: "Aug", label: "8-14", startDay: getTimelineIndex("Aug", 8), duration: 7 },
	{ id: "aug-15-22", month: "Aug", label: "15-22", startDay: getTimelineIndex("Aug", 15), duration: 8 },
	{ id: "aug-23-30", month: "Aug", label: "23-30", startDay: getTimelineIndex("Aug", 23), duration: 8 },
];

export const groupedMonths = [
	{ label: "Jun", weeks: 4 },
	{ label: "Jul", weeks: 4 },
	{ label: "Aug", weeks: 4 },
];

// Workload view dimensions
export const peopleColumnWidth = 278;
export const workloadCellMinWidth = 68;
export const workloadCellHeight = 68;
export const workloadGridMinWidth = peopleColumnWidth + weekColumns.length * workloadCellMinWidth;

// Planner view dimensions
export const plannerPeopleColumnDefaultWidth = 320;
export const plannerPeopleColumnMinWidth = 260;
export const plannerPeopleColumnMaxWidth = 420;
export const plannerDayMinWidth = 116;
export const plannerLaneHeight = 68;
export const plannerCardHeight = 56;
export const plannerCellInset = 6;
export const workloadUnderHoursThreshold = 25;
export const workloadOverHoursThreshold = 40;

// Planner color palette
export const plannerPalette = {
	light: {
		cardBackground: "#FFFFFF",
		cardBorder: "#E8DFD2",
		cardText: "#3F4154",
		cardSubtext: "#7B7487",
		overloadBackground: "#F6DEDE",
		dropValidBackground: "rgba(61, 99, 245, 0.14)",
		dropValidBorder: "#3D63F5",
		dropValidHoverBackground: "rgba(61, 99, 245, 0.22)",
		dropInvalidBackground: "rgba(232, 156, 156, 0.24)",
		dropInvalidBorder: "#E25757",
		dropInvalidHoverBackground: "rgba(228, 112, 112, 0.34)",
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
		overloadBackground: "rgba(190, 92, 92, 0.22)",
		dropValidBackground: "rgba(143, 175, 239, 0.18)",
		dropValidBorder: "#8FAFEF",
		dropValidHoverBackground: "rgba(143, 175, 239, 0.28)",
		dropInvalidBackground: "rgba(172, 86, 86, 0.28)",
		dropInvalidBorder: "#F09A9A",
		dropInvalidHoverBackground: "rgba(190, 92, 92, 0.40)",
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

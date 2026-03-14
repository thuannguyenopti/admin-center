"use client";

import { type CSSProperties, type DragEvent, type MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";
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
	id: string;
	month: string;
	label: string;
	startDay: number;
	duration: number;
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
	id: string;
	index: number;
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
	dueDay?: number;
	draggable?: boolean;
};

type PlannerInteractionMode = "move" | "resize-start" | "resize-end";

type PlannerInteraction = {
	cardId: string;
	mode: PlannerInteractionMode;
	originDuration?: number;
	originStartDay?: number;
	originEndDay?: number;
	startX?: number;
	draftDuration?: number;
	draftStartDay?: number;
	valid?: boolean;
};

type PlannerBlock = {
	id: string;
	assigneeId: string;
	startDay: number;
	duration: number;
	label: string;
	description?: string;
};

const demoTodayIndex = 3;
const timelineStartDate = new Date("2025-06-01T12:00:00");
const timelineEndDate = new Date("2025-08-30T12:00:00");
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function addDays(date: Date, days: number) {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
}

function diffInDays(start: Date, end: Date) {
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

const fullTimelineDays: PlannerDay[] = Array.from(
	{ length: diffInDays(timelineStartDate, timelineEndDate) + 1 },
	(_, index) => toTimelineDay(addDays(timelineStartDate, index), index)
);

function getTimelineIndex(month: string, dayOfMonth: number) {
	const monthIndex = monthLabels.indexOf(month);
	return diffInDays(timelineStartDate, new Date(2025, monthIndex, dayOfMonth, 12));
}

const weekColumns: WeekColumn[] = [
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

const groupedMonths = [
	{ label: "Jun", weeks: 4 },
	{ label: "Jul", weeks: 4 },
	{ label: "Aug", weeks: 4 },
];

const peopleColumnWidth = 278;
const workloadCellMinWidth = 68;
const workloadCellHeight = 68;
const workloadGridMinWidth = peopleColumnWidth + weekColumns.length * workloadCellMinWidth;

const plannerPeopleColumnDefaultWidth = 320;
const plannerPeopleColumnMinWidth = 260;
const plannerPeopleColumnMaxWidth = 420;
const plannerDayMinWidth = 116;
const plannerLaneHeight = 68;
const plannerCardHeight = 56;
const plannerCellInset = 6;
const workloadUnderHoursThreshold = 25;
const workloadOverHoursThreshold = 40;

const plannerPalette = {
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
	{
		id: "alexandra-perez",
		name: "Alexandra Pérez",
		role: "Senior Copy Writer",
		weeklyCapacity: "40h/week",
		capacityHours: 40,
		timezone: "GMT-5",
		avatarSrc: "https://i.pravatar.cc/64?img=36",
	},
	{
		id: "jeff-zucker",
		name: "Jeff Zucker",
		role: "Position at Company",
		weeklyCapacity: "40h/week",
		capacityHours: 40,
		timezone: "GMT-5",
		avatarSrc: "https://i.pravatar.cc/64?img=60",
	},
];

const autoCampaigns = [
	"STRIDE Miami Triathlon",
	"Runner Team Season Launch",
	"Open Water Swim Series",
	"Bike Team Sponsorship Push",
	"Gravel Worlds Campaign",
	"Alpine Series Registration Push",
	"Youth Football Camp Launch",
	"Athlete Portal Refresh",
	"Sponsor Communications Pack",
	"Race Weekend Operations",
	"Merchandise Launch Sprint",
	"Festival CRM Workflow",
	"Community Ride Series",
	"Marathon Weekend Toolkit",
	"Performance Team Hub",
	"Trail Run Ambassador Program",
];

const autoActions = [
	"Build launch brief and owners.",
	"Finalize paid social visual system.",
	"Draft segmented email sequence.",
	"Review task owners and due dates.",
	"Prepare sponsor approval pack.",
	"Configure workflow handoff rules.",
	"Write landing page and SMS copy.",
	"Design registration and travel flows.",
	"QA assets for brand compliance.",
	"Review reporting and retro inputs.",
	"Ship event-day operations checklist.",
	"Create race-week creative variants.",
	"Update hero messaging and CTA plan.",
	"Finalize merch and signage assets.",
	"Coordinate content approval workflow.",
	"Publish stakeholder recap and next steps.",
];

function getWorkingDayIndexesForWeek(week: WeekColumn) {
	return Array.from({ length: week.duration }, (_, offset) => week.startDay + offset).filter((dayIndex) => {
		const day = fullTimelineDays[dayIndex];
		return day ? day.dayLabel !== "Sat" && day.dayLabel !== "Sun" : false;
	});
}

function getWeeklyCapacityHours(capacityLabel: string) {
	const hours = Number.parseInt(capacityLabel, 10);
	return Number.isFinite(hours) ? hours : 40;
}

function splitSegment(dayIndexes: number[], hoursPerDay: number) {
	const segments: { duration: number; startDay: number }[] = [];
	let cursor = 0;

	while (cursor < dayIndexes.length) {
		const remaining = dayIndexes.length - cursor;
		const chunkDuration = remaining >= 4 ? 2 : remaining;
		segments.push({
			duration: chunkDuration,
			startDay: dayIndexes[cursor],
		});
		cursor += chunkDuration;
	}

	return segments.map((segment) => ({
		...segment,
		hoursPerDay,
	}));
}

function distributeWeeklyHoursForLowerCapacity(
	totalHours: number,
	workingDayIndexes: number[],
	dailyCapacity: number
) {
	const dayCount = workingDayIndexes.length;
	const overloadDayCount = Math.min(3, Math.max(2, dayCount - 2));
	const steadyDayCount = Math.max(0, dayCount - overloadDayCount);
	const steadyLoad = steadyDayCount * dailyCapacity;
	const overloadHours = Math.max(0, totalHours - steadyLoad);
	const baseOverloadHours = Math.floor(overloadHours / overloadDayCount);
	const overloadRemainder = overloadHours % overloadDayCount;

	const dailyHours = workingDayIndexes.map((_, index) => {
		if (index < overloadDayCount) {
			return baseOverloadHours + (index < overloadRemainder ? 1 : 0);
		}

		return dailyCapacity;
	});

	return dailyHours;
}

function distributeWeeklyHours(
	totalHours: number,
	workingDayIndexes: number[],
	dailyCapacity?: number
) {
	if (totalHours <= 0 || workingDayIndexes.length === 0) {
		return [];
	}

	const dayCount = workingDayIndexes.length;
	const shouldConcentrateOverload =
		dailyCapacity !== undefined &&
		dailyCapacity <= 4 &&
		totalHours > dailyCapacity * dayCount;

	const dailyHours = shouldConcentrateOverload
		? distributeWeeklyHoursForLowerCapacity(totalHours, workingDayIndexes, dailyCapacity)
		: (() => {
				const baseHours = Math.floor(totalHours / dayCount);
				const remainder = totalHours % dayCount;
				return workingDayIndexes.map((_, index) =>
					index < remainder ? baseHours + 1 : baseHours
				);
			})();

	const groupedSegments: { dayIndexes: number[]; hoursPerDay: number }[] = [];
	for (let index = 0; index < dailyHours.length; index += 1) {
		const hoursPerDay = dailyHours[index];
		if (hoursPerDay <= 0) {
			continue;
		}

		const previous = groupedSegments[groupedSegments.length - 1];
		if (previous && previous.hoursPerDay === hoursPerDay) {
			previous.dayIndexes.push(workingDayIndexes[index]);
		} else {
			groupedSegments.push({
				dayIndexes: [workingDayIndexes[index]],
				hoursPerDay,
			});
		}
	}

	return groupedSegments.flatMap((segment) =>
		splitSegment(segment.dayIndexes, segment.hoursPerDay)
	);
}

function getAutoCardStatus(memberIndex: number, weekIndex: number, segmentIndex: number): PlannerStatus {
	const mod = (memberIndex + weekIndex + segmentIndex) % 6;
	if (mod === 0) {
		return "done";
	}
	if (mod === 1 || mod === 2 || mod === 3) {
		return "in_progress";
	}
	return "not_started";
}

function getAutoCardAccent(memberIndex: number, weekIndex: number, segmentIndex: number): PlannerAccent {
	const accents: PlannerAccent[] = ["blue", "green", "neutral", "red"];
	return accents[(memberIndex + weekIndex + segmentIndex) % accents.length];
}

function isPlannerCardPlacementValid(
	card: PlannerCard,
	startDay: number,
	duration: number,
	visibleRangeStartDay: number,
	visibleRangeEndDay: number
) {
	const endDay = startDay + duration - 1;
	if (startDay < visibleRangeStartDay || endDay > visibleRangeEndDay) {
		return false;
	}

	if (card.dueDay === undefined) {
		return true;
	}

	return endDay <= card.dueDay;
}

function generatePlannerBlocksFromTargets(): PlannerBlock[] {
	return teamMembers.flatMap((member) =>
		member.cells.flatMap((cell, weekIndex) => {
			if (cell.state !== "pto") {
				return [];
			}

			const week = weekColumns[weekIndex];
			return [
				{
					id: `ooo-${member.id}-${week.id}`,
					assigneeId: member.id,
					startDay: week.startDay,
					duration: week.duration,
					label: "OOO",
					description: "Out of office",
				},
			];
		})
	);
}

function generatePlannerCardsFromTargets(): PlannerCard[] {
	let taskCounter = 6001;

	return teamMembers.flatMap((member, memberIndex) =>
		member.cells.flatMap((cell, weekIndex) => {
			if (cell.state === "pto" || cell.value === null || cell.value <= 0) {
				return [];
			}

			const week = weekColumns[weekIndex];
			const workingDayIndexes = getWorkingDayIndexesForWeek(week);
			const dailyCapacity = Math.max(1, Math.round(getWeeklyCapacityHours(member.weeklyCapacity) / 5));
			const segments = distributeWeeklyHours(cell.value, workingDayIndexes, dailyCapacity);

			return segments.map((segment, segmentIndex) => {
				const campaign = autoCampaigns[(memberIndex * 3 + weekIndex + segmentIndex) % autoCampaigns.length];
				const action = autoActions[(memberIndex * 5 + weekIndex + segmentIndex) % autoActions.length];
				const stepNumber = ((memberIndex + weekIndex + segmentIndex) % 6) + 1;

				return {
					id: `auto-${member.id}-${week.id}-${segmentIndex}`,
					assigneeId: member.id,
					startDay: segment.startDay,
					duration: segment.duration,
					lane: 0,
					title: campaign,
					taskId: `TSK-${taskCounter++}`,
					subtitle: `Step ${stepNumber}: ${action}`,
					status: getAutoCardStatus(memberIndex, weekIndex, segmentIndex),
					hoursPerDay: segment.hoursPerDay,
					accent: getAutoCardAccent(memberIndex, weekIndex, segmentIndex),
					draggable: getAutoCardStatus(memberIndex, weekIndex, segmentIndex) !== "done",
				};
			});
		})
	);
}

const plannerBlocks: PlannerBlock[] = generatePlannerBlocksFromTargets();

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
	{
		id: "matt-stride-miami-kickoff",
		assigneeId: "matt-walsh",
		startDay: getTimelineIndex("Jun", 16),
		duration: 4,
		lane: 0,
		title: "STRIDE Miami Triathlon",
		taskId: "TSK-5401",
		subtitle: "Step 1: Kick off launch brief and owners.",
		status: "in_progress",
		hoursPerDay: 4,
		accent: "green",
		dueDay: getTimelineIndex("Jun", 20),
	},
	{
		id: "matt-bike-team-sponsor",
		assigneeId: "matt-walsh",
		startDay: getTimelineIndex("Jul", 8),
		duration: 5,
		lane: 0,
		title: "Bike Team Sponsorship Push",
		taskId: "TSK-5478",
		subtitle: "Step 3: Align approvals and media mix.",
		status: "not_started",
		hoursPerDay: 5,
		accent: "blue",
		dueDay: getTimelineIndex("Jul", 14),
	},
	{
		id: "matt-fall-event-readout",
		assigneeId: "matt-walsh",
		startDay: getTimelineIndex("Aug", 18),
		duration: 4,
		lane: 0,
		title: "Fall Event Portfolio Readout",
		taskId: "TSK-5622",
		subtitle: "Step 2: Review launch readiness with leadership.",
		status: "not_started",
		hoursPerDay: 3,
		accent: "neutral",
		dueDay: getTimelineIndex("Aug", 22),
	},
	{
		id: "jaq-miami-visuals",
		assigneeId: "jaquline-paris",
		startDay: getTimelineIndex("Jun", 17),
		duration: 4,
		lane: 0,
		title: "STRIDE Miami Triathlon",
		taskId: "TSK-5401",
		subtitle: "Step 4: Finalize paid social visual system.",
		status: "in_progress",
		hoursPerDay: 6,
		accent: "green",
		dueDay: getTimelineIndex("Jun", 20),
	},
	{
		id: "jaq-runner-team-toolkit",
		assigneeId: "jaquline-paris",
		startDay: getTimelineIndex("Jul", 22),
		duration: 5,
		lane: 0,
		title: "Runner Team Ambassador Toolkit",
		taskId: "TSK-5514",
		subtitle: "Step 2: Produce event signage and race kit assets.",
		status: "not_started",
		hoursPerDay: 6,
		accent: "blue",
		dueDay: getTimelineIndex("Jul", 28),
	},
	{
		id: "jaq-ski-series-refresh",
		assigneeId: "jaquline-paris",
		startDay: getTimelineIndex("Aug", 12),
		duration: 4,
		lane: 1,
		title: "Alpine Series Brand Refresh",
		taskId: "TSK-5661",
		subtitle: "Step 5: Prep design system handoff for web.",
		status: "not_started",
		hoursPerDay: 5,
		accent: "red",
		dueDay: getTimelineIndex("Aug", 18),
	},
	{
		id: "john-event-ops-planning",
		assigneeId: "john-zoshak",
		startDay: getTimelineIndex("Jun", 24),
		duration: 4,
		lane: 0,
		title: "Summer Event Ops Rollup",
		taskId: "TSK-5430",
		subtitle: "Step 1: Map race weekend staffing and risk.",
		status: "in_progress",
		hoursPerDay: 4,
		accent: "blue",
		dueDay: getTimelineIndex("Jun", 27),
	},
	{
		id: "john-gravel-worlds-brief",
		assigneeId: "john-zoshak",
		startDay: getTimelineIndex("Jul", 15),
		duration: 5,
		lane: 0,
		title: "Gravel Worlds Campaign Brief",
		taskId: "TSK-5538",
		subtitle: "Step 2: Lock workflow steps and owners.",
		status: "not_started",
		hoursPerDay: 4,
		accent: "green",
		dueDay: getTimelineIndex("Jul", 21),
	},
	{
		id: "john-football-partner-recap",
		assigneeId: "john-zoshak",
		startDay: getTimelineIndex("Aug", 5),
		duration: 4,
		lane: 0,
		title: "Football Partner Recap",
		taskId: "TSK-5707",
		subtitle: "Step 3: Review approvals and recap tasks.",
		status: "not_started",
		hoursPerDay: 3,
		accent: "neutral",
		dueDay: getTimelineIndex("Aug", 8),
	},
	{
		id: "team-triathlon-site",
		assigneeId: "team-alpha",
		startDay: getTimelineIndex("Jun", 30),
		duration: 5,
		lane: 0,
		title: "STRIDE Miami Triathlon",
		taskId: "TSK-5401",
		subtitle: "Step 6: Build campaign landing page modules.",
		status: "in_progress",
		hoursPerDay: 7,
		accent: "green",
		dueDay: getTimelineIndex("Jul", 7),
	},
	{
		id: "team-ski-copy-ops",
		assigneeId: "team-alpha",
		startDay: getTimelineIndex("Aug", 4),
		duration: 5,
		lane: 0,
		title: "Alpine Series Registration Push",
		taskId: "TSK-5650",
		subtitle: "Step 4: Coordinate content locks and launch ops.",
		status: "not_started",
		hoursPerDay: 8,
		accent: "red",
		dueDay: getTimelineIndex("Aug", 11),
	},
	{
		id: "zack-gravel-worlds-ui",
		assigneeId: "zack-yee",
		startDay: getTimelineIndex("Jun", 23),
		duration: 5,
		lane: 0,
		title: "Gravel Worlds Digital Hub",
		taskId: "TSK-5462",
		subtitle: "Step 3: Design registration and itinerary flows.",
		status: "in_progress",
		hoursPerDay: 6,
		accent: "blue",
		dueDay: getTimelineIndex("Jun", 30),
	},
	{
		id: "zack-athlete-kit",
		assigneeId: "zack-yee",
		startDay: getTimelineIndex("Aug", 12),
		duration: 4,
		lane: 0,
		title: "Athlete Welcome Kit Refresh",
		taskId: "TSK-5718",
		subtitle: "Step 2: Polish onsite wayfinding and merch layouts.",
		status: "not_started",
		hoursPerDay: 5,
		accent: "green",
		dueDay: getTimelineIndex("Aug", 18),
	},
	{
		id: "tiff-runner-ads",
		assigneeId: "tiffany-ballack",
		startDay: getTimelineIndex("Jul", 1),
		duration: 4,
		lane: 0,
		title: "Runner Team Paid Media",
		taskId: "TSK-5489",
		subtitle: "Step 1: Audit creative copy and CTA coverage.",
		status: "in_progress",
		hoursPerDay: 3,
		accent: "blue",
		dueDay: getTimelineIndex("Jul", 4),
	},
	{
		id: "tiff-football-copy",
		assigneeId: "tiffany-ballack",
		startDay: getTimelineIndex("Aug", 6),
		duration: 3,
		lane: 0,
		title: "Football Camp Email Series",
		taskId: "TSK-5694",
		subtitle: "Step 2: Draft nurture copy for registrations.",
		status: "not_started",
		hoursPerDay: 4,
		accent: "red",
		dueDay: getTimelineIndex("Aug", 8),
	},
	{
		id: "jack-ski-logistics",
		assigneeId: "jack-black",
		startDay: getTimelineIndex("Jul", 8),
		duration: 4,
		lane: 0,
		title: "Alpine Series Logistics",
		taskId: "TSK-5542",
		subtitle: "Step 2: Confirm ops workflow and vendor timelines.",
		status: "in_progress",
		hoursPerDay: 3,
		accent: "green",
		dueDay: getTimelineIndex("Jul", 11),
	},
	{
		id: "jack-football-launch",
		assigneeId: "jack-black",
		startDay: getTimelineIndex("Aug", 19),
		duration: 4,
		lane: 0,
		title: "Youth Football Camp Launch",
		taskId: "TSK-5733",
		subtitle: "Step 1: Lock checklists, assets, and owners.",
		status: "not_started",
		hoursPerDay: 4,
		accent: "blue",
		dueDay: getTimelineIndex("Aug", 22),
	},
	{
		id: "katie-sponsor-comms",
		assigneeId: "katie-perry",
		startDay: getTimelineIndex("Jul", 15),
		duration: 4,
		lane: 0,
		title: "Sponsor Communications Pack",
		taskId: "TSK-5524",
		subtitle: "Step 3: Coordinate approvals with partner teams.",
		status: "in_progress",
		hoursPerDay: 6,
		accent: "green",
		dueDay: getTimelineIndex("Jul", 18),
	},
	{
		id: "katie-athlete-portal",
		assigneeId: "katie-perry",
		startDay: getTimelineIndex("Aug", 25),
		duration: 4,
		lane: 0,
		title: "Athlete Portal Messaging",
		taskId: "TSK-5758",
		subtitle: "Step 4: Final review of event support content.",
		status: "not_started",
		hoursPerDay: 7,
		accent: "red",
		dueDay: getTimelineIndex("Aug", 29),
	},
	{
		id: "alexandra-swim-series",
		assigneeId: "alexandra-perez",
		startDay: getTimelineIndex("Jun", 9),
		duration: 5,
		lane: 0,
		title: "Open Water Swim Series",
		taskId: "TSK-5362",
		subtitle: "Step 2: Draft campaign storytelling and CTA set.",
		status: "in_progress",
		hoursPerDay: 6,
		accent: "blue",
		dueDay: getTimelineIndex("Jun", 13),
	},
	{
		id: "alexandra-bike-team-stories",
		assigneeId: "alexandra-perez",
		startDay: getTimelineIndex("Jul", 21),
		duration: 5,
		lane: 0,
		title: "Bike Team Storytelling Sprint",
		taskId: "TSK-5569",
		subtitle: "Step 1: Build rider story arcs and headlines.",
		status: "not_started",
		hoursPerDay: 7,
		accent: "green",
		dueDay: getTimelineIndex("Jul", 25),
	},
	{
		id: "alexandra-ski-launch-copy",
		assigneeId: "alexandra-perez",
		startDay: getTimelineIndex("Aug", 13),
		duration: 4,
		lane: 0,
		title: "Alpine Series Launch Copy",
		taskId: "TSK-5684",
		subtitle: "Step 3: Finalize homepage, email, and SMS copy.",
		status: "not_started",
		hoursPerDay: 6,
		accent: "red",
		dueDay: getTimelineIndex("Aug", 18),
	},
	{
		id: "jeff-race-ops-dashboard",
		assigneeId: "jeff-zucker",
		startDay: getTimelineIndex("Jun", 16),
		duration: 4,
		lane: 0,
		title: "Race Ops Dashboard Setup",
		taskId: "TSK-5418",
		subtitle: "Step 2: Configure reporting workflow and handoff.",
		status: "in_progress",
		hoursPerDay: 5,
		accent: "neutral",
		dueDay: getTimelineIndex("Jun", 20),
	},
	{
		id: "jeff-runner-team-retro",
		assigneeId: "jeff-zucker",
		startDay: getTimelineIndex("Jul", 28),
		duration: 5,
		lane: 0,
		title: "Runner Team Campaign Retro",
		taskId: "TSK-5609",
		subtitle: "Step 1: Gather task outcomes and publish insights.",
		status: "not_started",
		hoursPerDay: 5,
		accent: "blue",
		dueDay: getTimelineIndex("Aug", 1),
	},
	{
		id: "jeff-fall-planning",
		assigneeId: "jeff-zucker",
		startDay: getTimelineIndex("Aug", 18),
		duration: 4,
		lane: 0,
		title: "Fall Festival Planning",
		taskId: "TSK-5742",
		subtitle: "Step 2: Build operations checklist for launch week.",
		status: "not_started",
		hoursPerDay: 6,
		accent: "green",
		dueDay: getTimelineIndex("Aug", 22),
	},
];

const stridePlannerCardAdditions: PlannerCard[] = [
	{
		id: "matt-spring-training-email",
		assigneeId: "matt-walsh",
		startDay: getTimelineIndex("Jun", 9),
		duration: 5,
		lane: 0,
		title: "Spring Training Email Launch",
		taskId: "TSK-5348",
		subtitle: "Step 2: Confirm workflow deadlines and approvals.",
		status: "in_progress",
		hoursPerDay: 6,
		accent: "blue",
		dueDay: getTimelineIndex("Jun", 13),
	},
	{
		id: "matt-runner-festival",
		assigneeId: "matt-walsh",
		startDay: getTimelineIndex("Jun", 30),
		duration: 5,
		lane: 0,
		title: "Runner Festival Launch",
		taskId: "TSK-5451",
		subtitle: "Step 1: Confirm budget, goals, and owners.",
		status: "in_progress",
		hoursPerDay: 4,
		accent: "green",
		dueDay: getTimelineIndex("Jul", 7),
	},
	{
		id: "matt-ski-brief",
		assigneeId: "matt-walsh",
		startDay: getTimelineIndex("Aug", 4),
		duration: 4,
		lane: 0,
		title: "Alpine Launch Brief",
		taskId: "TSK-5679",
		subtitle: "Step 1: Review market narrative and approvals.",
		status: "not_started",
		hoursPerDay: 5,
		accent: "neutral",
		dueDay: getTimelineIndex("Aug", 8),
	},
	{
		id: "matt-fall-sponsor-pack",
		assigneeId: "matt-walsh",
		startDay: getTimelineIndex("Aug", 25),
		duration: 5,
		lane: 0,
		title: "Fall Sponsor Pack",
		taskId: "TSK-5760",
		subtitle: "Step 2: Finalize approvals and team handoff.",
		status: "not_started",
		hoursPerDay: 6,
		accent: "green",
		dueDay: getTimelineIndex("Aug", 29),
	},
	{
		id: "jaq-swim-refresh",
		assigneeId: "jaquline-paris",
		startDay: getTimelineIndex("Jun", 9),
		duration: 5,
		lane: 0,
		title: "Swim Series Visual Refresh",
		taskId: "TSK-5352",
		subtitle: "Step 3: Build digital ads and kit layouts.",
		status: "in_progress",
		hoursPerDay: 6,
		accent: "blue",
		dueDay: getTimelineIndex("Jun", 13),
	},
	{
		id: "jaq-marathon-signage",
		assigneeId: "jaquline-paris",
		startDay: getTimelineIndex("Jun", 30),
		duration: 5,
		lane: 0,
		title: "City Marathon Signage System",
		taskId: "TSK-5459",
		subtitle: "Step 3: Build onsite route and sponsor signage.",
		status: "in_progress",
		hoursPerDay: 7,
		accent: "green",
		dueDay: getTimelineIndex("Jul", 7),
	},
	{
		id: "jaq-football-kit",
		assigneeId: "jaquline-paris",
		startDay: getTimelineIndex("Aug", 19),
		duration: 4,
		lane: 0,
		title: "Youth Football Camp Kit",
		taskId: "TSK-5736",
		subtitle: "Step 2: Finalize event identity and motion pack.",
		status: "not_started",
		hoursPerDay: 6,
		accent: "blue",
		dueDay: getTimelineIndex("Aug", 22),
	},
	{
		id: "john-workflow-audit",
		assigneeId: "john-zoshak",
		startDay: getTimelineIndex("Jul", 1),
		duration: 4,
		lane: 0,
		title: "Workflow Template Audit",
		taskId: "TSK-5484",
		subtitle: "Step 2: Standardize task and step durations.",
		status: "in_progress",
		hoursPerDay: 4,
		accent: "neutral",
		dueDay: getTimelineIndex("Jul", 4),
	},
	{
		id: "john-miami-playbook",
		assigneeId: "john-zoshak",
		startDay: getTimelineIndex("Jun", 16),
		duration: 5,
		lane: 0,
		title: "Miami Playbook Review",
		taskId: "TSK-5411",
		subtitle: "Step 2: Review owners, tasks, and launch blockers.",
		status: "in_progress",
		hoursPerDay: 4,
		accent: "green",
		dueDay: getTimelineIndex("Jun", 20),
	},
	{
		id: "john-camp-retro",
		assigneeId: "john-zoshak",
		startDay: getTimelineIndex("Aug", 25),
		duration: 4,
		lane: 0,
		title: "Camp Performance Retro",
		taskId: "TSK-5766",
		subtitle: "Step 1: Capture results and follow-up workflows.",
		status: "not_started",
		hoursPerDay: 3,
		accent: "green",
		dueDay: getTimelineIndex("Aug", 29),
	},
	{
		id: "team-event-hub",
		assigneeId: "team-alpha",
		startDay: getTimelineIndex("Jul", 21),
		duration: 5,
		lane: 0,
		title: "Event Hub Buildout",
		taskId: "TSK-5562",
		subtitle: "Step 4: Produce modules, approvals, and QA.",
		status: "in_progress",
		hoursPerDay: 8,
		accent: "green",
		dueDay: getTimelineIndex("Jul", 28),
	},
	{
		id: "team-crm-handoff",
		assigneeId: "team-alpha",
		startDay: getTimelineIndex("Aug", 18),
		duration: 5,
		lane: 0,
		title: "CRM Workflow Handoff",
		taskId: "TSK-5748",
		subtitle: "Step 5: Validate automations and stakeholder training.",
		status: "not_started",
		hoursPerDay: 7,
		accent: "blue",
		dueDay: getTimelineIndex("Aug", 25),
	},
	{
		id: "zack-bike-registration",
		assigneeId: "zack-yee",
		startDay: getTimelineIndex("Jul", 7),
		duration: 5,
		lane: 0,
		title: "Bike Team Registration UX",
		taskId: "TSK-5505",
		subtitle: "Step 2: Design reg flow states and edge cases.",
		status: "in_progress",
		hoursPerDay: 6,
		accent: "blue",
		dueDay: getTimelineIndex("Jul", 11),
	},
	{
		id: "zack-race-hub-refresh",
		assigneeId: "zack-yee",
		startDay: getTimelineIndex("Jun", 30),
		duration: 5,
		lane: 0,
		title: "Race Hub Refresh",
		taskId: "TSK-5454",
		subtitle: "Step 2: Update registration, travel, and FAQ flows.",
		status: "in_progress",
		hoursPerDay: 6,
		accent: "green",
		dueDay: getTimelineIndex("Jul", 4),
	},
	{
		id: "zack-marathon-merch",
		assigneeId: "zack-yee",
		startDay: getTimelineIndex("Aug", 4),
		duration: 5,
		lane: 0,
		title: "Marathon Merch Experience",
		taskId: "TSK-5681",
		subtitle: "Step 3: Finalize merch grid and checkout moments.",
		status: "not_started",
		hoursPerDay: 7,
		accent: "red",
		dueDay: getTimelineIndex("Aug", 8),
	},
	{
		id: "tiff-gear-guide",
		assigneeId: "tiffany-ballack",
		startDay: getTimelineIndex("Jun", 23),
		duration: 5,
		lane: 0,
		title: "Summer Gear Guide",
		taskId: "TSK-5440",
		subtitle: "Step 1: Draft product and race prep copy.",
		status: "in_progress",
		hoursPerDay: 3,
		accent: "green",
		dueDay: getTimelineIndex("Jun", 27),
	},
	{
		id: "tiff-triathlon-email",
		assigneeId: "tiffany-ballack",
		startDay: getTimelineIndex("Jul", 22),
		duration: 4,
		lane: 0,
		title: "Triathlon Email Countdown",
		taskId: "TSK-5573",
		subtitle: "Step 2: Build segmented launch copy.",
		status: "not_started",
		hoursPerDay: 3,
		accent: "blue",
		dueDay: getTimelineIndex("Jul", 25),
	},
	{
		id: "tiff-support-sequence",
		assigneeId: "tiffany-ballack",
		startDay: getTimelineIndex("Aug", 25),
		duration: 5,
		lane: 0,
		title: "Support Sequence Refresh",
		taskId: "TSK-5764",
		subtitle: "Step 1: Draft registration reminder sequence.",
		status: "not_started",
		hoursPerDay: 3,
		accent: "green",
		dueDay: getTimelineIndex("Aug", 29),
	},
	{
		id: "jack-race-weekend",
		assigneeId: "jack-black",
		startDay: getTimelineIndex("Jun", 16),
		duration: 5,
		lane: 0,
		title: "Race Weekend Ops",
		taskId: "TSK-5415",
		subtitle: "Step 3: Coordinate event staffing and task list.",
		status: "in_progress",
		hoursPerDay: 4,
		accent: "green",
		dueDay: getTimelineIndex("Jun", 20),
	},
	{
		id: "jack-sponsor-sync",
		assigneeId: "jack-black",
		startDay: getTimelineIndex("Jul", 28),
		duration: 4,
		lane: 0,
		title: "Sponsor Sync Sprint",
		taskId: "TSK-5607",
		subtitle: "Step 1: Prepare decisions and approvals.",
		status: "not_started",
		hoursPerDay: 4,
		accent: "neutral",
		dueDay: getTimelineIndex("Aug", 1),
	},
	{
		id: "jack-camp-planning",
		assigneeId: "jack-black",
		startDay: getTimelineIndex("Jun", 16),
		duration: 5,
		lane: 0,
		title: "Camp Planning Sprint",
		taskId: "TSK-5413",
		subtitle: "Step 1: Align staffing, vendors, and deliverables.",
		status: "in_progress",
		hoursPerDay: 4,
		accent: "blue",
		dueDay: getTimelineIndex("Jun", 20),
	},
	{
		id: "katie-registration-comms",
		assigneeId: "katie-perry",
		startDay: getTimelineIndex("Jun", 9),
		duration: 5,
		lane: 0,
		title: "Registration Comms Rollout",
		taskId: "TSK-5356",
		subtitle: "Step 4: Review reminders and confirmation flows.",
		status: "in_progress",
		hoursPerDay: 7,
		accent: "blue",
		dueDay: getTimelineIndex("Jun", 13),
	},
	{
		id: "katie-vip-support",
		assigneeId: "katie-perry",
		startDay: getTimelineIndex("Aug", 11),
		duration: 5,
		lane: 0,
		title: "VIP Athlete Support",
		taskId: "TSK-5709",
		subtitle: "Step 2: Coordinate comms and support content.",
		status: "not_started",
		hoursPerDay: 8,
		accent: "red",
		dueDay: getTimelineIndex("Aug", 15),
	},
	{
		id: "alexandra-merch-copy",
		assigneeId: "alexandra-perez",
		startDay: getTimelineIndex("Jun", 30),
		duration: 5,
		lane: 0,
		title: "Merch Launch Copy Sprint",
		taskId: "TSK-5456",
		subtitle: "Step 3: Write PDP, email, and social captions.",
		status: "in_progress",
		hoursPerDay: 6,
		accent: "green",
		dueDay: getTimelineIndex("Jul", 4),
	},
	{
		id: "alexandra-fall-campaign",
		assigneeId: "alexandra-perez",
		startDay: getTimelineIndex("Aug", 25),
		duration: 4,
		lane: 0,
		title: "Fall Campaign Narrative",
		taskId: "TSK-5761",
		subtitle: "Step 1: Build copy system for launch month.",
		status: "not_started",
		hoursPerDay: 7,
		accent: "red",
		dueDay: getTimelineIndex("Aug", 29),
	},
	{
		id: "alexandra-july-copy-pack",
		assigneeId: "alexandra-perez",
		startDay: getTimelineIndex("Jul", 7),
		duration: 5,
		lane: 0,
		title: "July Copy Pack",
		taskId: "TSK-5498",
		subtitle: "Step 2: Build race-week content for email and web.",
		status: "in_progress",
		hoursPerDay: 6,
		accent: "blue",
		dueDay: getTimelineIndex("Jul", 11),
	},
	{
		id: "jeff-dashboard-qa",
		assigneeId: "jeff-zucker",
		startDay: getTimelineIndex("Jul", 14),
		duration: 5,
		lane: 0,
		title: "Operations Dashboard QA",
		taskId: "TSK-5521",
		subtitle: "Step 2: Validate event reporting and alerts.",
		status: "in_progress",
		hoursPerDay: 6,
		accent: "blue",
		dueDay: getTimelineIndex("Jul", 18),
	},
	{
		id: "jeff-festival-compliance",
		assigneeId: "jeff-zucker",
		startDay: getTimelineIndex("Aug", 11),
		duration: 4,
		lane: 0,
		title: "Festival Compliance Review",
		taskId: "TSK-5713",
		subtitle: "Step 3: Finalize compliance workflow and logs.",
		status: "not_started",
		hoursPerDay: 6,
		accent: "neutral",
		dueDay: getTimelineIndex("Aug", 15),
	},
	{
		id: "jeff-reporting-cleanup",
		assigneeId: "jeff-zucker",
		startDay: getTimelineIndex("Jul", 1),
		duration: 5,
		lane: 0,
		title: "Reporting Cleanup Sprint",
		taskId: "TSK-5487",
		subtitle: "Step 2: QA ops dashboards and handoff notes.",
		status: "in_progress",
		hoursPerDay: 6,
		accent: "green",
		dueDay: getTimelineIndex("Jul", 7),
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
	if (startDay + duration > fullTimelineDays.length) {
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

function canPlaceCardInLane(
	cards: PlannerCard[],
	assigneeId: string,
	lane: number,
	startDay: number,
	duration: number,
	ignoreCardId?: string
) {
	if (startDay < 0 || duration < 1 || startDay + duration > fullTimelineDays.length) {
		return false;
	}

	return !cards.some((card) => {
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
}

function normalizePlannerCardLanes(cards: PlannerCard[]) {
	const groupedByAssignee = new Map<string, PlannerCard[]>();

	for (const card of cards) {
		const group = groupedByAssignee.get(card.assigneeId) ?? [];
		group.push(card);
		groupedByAssignee.set(card.assigneeId, group);
	}

	return Array.from(groupedByAssignee.values()).flatMap((group) => {
		const sorted = [...group].sort((left, right) => {
			if (left.startDay !== right.startDay) {
				return left.startDay - right.startDay;
			}
			if (left.duration !== right.duration) {
				return left.duration - right.duration;
			}
			return left.id.localeCompare(right.id);
		});

		const normalized: PlannerCard[] = [];

		for (const card of sorted) {
			const lane = getAvailableLane(
				normalized,
				card.assigneeId,
				card.startDay,
				card.duration
			);

			normalized.push({
				...card,
				lane: lane ?? 0,
			});
		}

		return normalized;
	});
}

function isWorkingTimelineDay(dayIndex: number) {
	const day = fullTimelineDays[dayIndex];
	if (!day) {
		return false;
	}

	const dayName = day.dayLabel;
	return dayName !== "Sat" && dayName !== "Sun";
}

function isPtoBlock(block: PlannerBlock) {
	return block.label.trim().toUpperCase() === "PTO";
}

function getPlannerDailyCapacity(person: PlannerPerson) {
	return person.capacityHours / 5;
}

function getPlannerDayLoad(personId: string, dayIndex: number, cards: PlannerCard[]) {
	return cards.reduce((sum, card) => {
		if (card.assigneeId !== personId) {
			return sum;
		}

		const coversDay =
			dayIndex >= card.startDay &&
			dayIndex < card.startDay + card.duration;
		return coversDay ? sum + card.hoursPerDay : sum;
	}, 0);
}

function getPtoDayIndexes(personId: string) {
	return new Set(
		plannerBlocks
			.filter((block) => block.assigneeId === personId && isPtoBlock(block))
			.flatMap((block) =>
				Array.from({ length: block.duration }, (_, offset) => block.startDay + offset)
			)
			.filter((dayIndex) => isWorkingTimelineDay(dayIndex))
	);
}

function getWorkingDayIndexesInRange(startDay: number, duration: number) {
	return Array.from({ length: duration }, (_, offset) => startDay + offset).filter((dayIndex) =>
		isWorkingTimelineDay(dayIndex)
	);
}

function getAvailableHoursForRange(person: PlannerPerson, startDay: number, duration: number) {
	if (person.isTeam) {
		return person.capacityHours;
	}

	const dailyCapacity = getPlannerDailyCapacity(person);
	const ptoDays = getPtoDayIndexes(person.id);
	const workingDays = getWorkingDayIndexesInRange(startDay, duration);
	const availableWorkingDays = workingDays.filter((dayIndex) => !ptoDays.has(dayIndex)).length;
	return Math.max(0, availableWorkingDays * dailyCapacity);
}

function getPlannedHoursForRange(personId: string, cards: PlannerCard[], startDay: number, duration: number) {
	const dayIndexes = Array.from({ length: duration }, (_, offset) => startDay + offset);

	return dayIndexes.reduce((sum, dayIndex) => {
		if (!isWorkingTimelineDay(dayIndex)) {
			return sum;
		}

		return sum + getPlannerDayLoad(personId, dayIndex, cards);
	}, 0);
}

function getUtilizationPercentForRange(
	person: PlannerPerson,
	cards: PlannerCard[],
	startDay: number,
	duration: number
) {
	const availableHours = getAvailableHoursForRange(person, startDay, duration);
	if (availableHours <= 0) {
		return 0;
	}

	const totalHours = getPlannedHoursForRange(person.id, cards, startDay, duration);
	return Math.round((totalHours / availableHours) * 100);
}

function isPlannerDayOverloaded(person: PlannerPerson, dayIndex: number, cards: PlannerCard[]) {
	if (person.isTeam || !isWorkingTimelineDay(dayIndex)) {
		return false;
	}

	const ptoDays = getPtoDayIndexes(person.id);
	const availableHours = ptoDays.has(dayIndex) ? 0 : getPlannerDailyCapacity(person);
	const plannedHours = getPlannerDayLoad(person.id, dayIndex, cards);

	return plannedHours > availableHours;
}

function getWorkloadCellForWeek(person: PlannerPerson, week: WeekColumn, cards: PlannerCard[]): WorkloadCell {
	const plannedHours = getPlannedHoursForRange(person.id, cards, week.startDay, week.duration);
	const availableHours = getAvailableHoursForRange(person, week.startDay, week.duration);
	const ptoDays = getWorkingDayIndexesInRange(week.startDay, week.duration).filter((dayIndex) =>
		getPtoDayIndexes(person.id).has(dayIndex)
	).length;

	if (availableHours === 0 && plannedHours === 0 && ptoDays > 0) {
		return { value: null, state: "pto" };
	}

	if (plannedHours > availableHours || plannedHours > workloadOverHoursThreshold) {
		return { value: Math.round(plannedHours), state: "over" };
	}

	if (plannedHours <= workloadUnderHoursThreshold) {
		return { value: Math.round(plannedHours), state: "under" };
	}

	return { value: Math.round(plannedHours), state: "default" };
}

function buildWorkloadRows(cards: PlannerCard[]): TeamMember[] {
	return plannerPeople
		.filter((person) => !person.isTeam)
		.map((person) => ({
			id: person.id,
			name: person.name,
			role: person.role,
			weeklyCapacity: person.weeklyCapacity,
			timezone: person.timezone ?? "",
			avatarSrc: person.avatarSrc,
			cells: weekColumns.map((week) => getWorkloadCellForWeek(person, week, cards)),
		}));
}

function getWeekRangeLabel(week: WeekColumn) {
	const start = fullTimelineDays[week.startDay];
	const end = fullTimelineDays[week.startDay + week.duration - 1];
	if (!start || !end) {
		return "";
	}

	return `${start.dateLabel} - ${end.dateLabel} 2025`;
}

function getPlannerViewportWeeks(selectedWeekIndex: number) {
	let start = Math.max(0, selectedWeekIndex - 1);
	let end = Math.min(weekColumns.length - 1, start + 2);
	start = Math.max(0, end - 2);

	return weekColumns.slice(start, end + 1);
}

function getPlannerViewportLabel(weeks: WeekColumn[]) {
	const firstWeek = weeks[0];
	const lastWeek = weeks[weeks.length - 1];
	if (!firstWeek || !lastWeek) {
		return "";
	}

	const start = fullTimelineDays[firstWeek.startDay];
	const end = fullTimelineDays[lastWeek.startDay + lastWeek.duration - 1];
	if (!start || !end) {
		return "";
	}

	return `${start.dateLabel} - ${end.dateLabel} 2025`;
}

type PackedVisibleCard = PlannerCard & {
	clippedDuration: number;
	localLane: number;
	showEndHandle: boolean;
	showStartHandle: boolean;
	visibleEndDay: number;
	visibleStartDay: number;
};

function packVisiblePlannerCards(cards: PlannerCard[], rangeStartDay: number, rangeEndDay: number): PackedVisibleCard[] {
	const overlappingCards = cards
		.filter((card) =>
			rangesOverlap(
				card.startDay,
				card.startDay + card.duration - 1,
				rangeStartDay,
				rangeEndDay
			)
		)
		.map((card) => {
			const visibleStartDay = Math.max(card.startDay, rangeStartDay);
			const visibleEndDay = Math.min(card.startDay + card.duration - 1, rangeEndDay);
			return {
				...card,
				clippedDuration: visibleEndDay - visibleStartDay + 1,
				localLane: 0,
				showEndHandle: visibleEndDay === card.startDay + card.duration - 1,
				showStartHandle: visibleStartDay === card.startDay,
				visibleEndDay,
				visibleStartDay,
			};
		})
		.sort((left, right) => {
			if (left.visibleStartDay !== right.visibleStartDay) {
				return left.visibleStartDay - right.visibleStartDay;
			}
			if (left.visibleEndDay !== right.visibleEndDay) {
				return left.visibleEndDay - right.visibleEndDay;
			}
			return left.id.localeCompare(right.id);
		});

	const laneEndDays: number[] = [];

	return overlappingCards.map((card) => {
		let localLane = 0;
		while (
			laneEndDays[localLane] !== undefined &&
			card.visibleStartDay <= laneEndDays[localLane]
		) {
			localLane += 1;
		}

		laneEndDays[localLane] = card.visibleEndDay;
		return {
			...card,
			localLane,
		};
	});
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
	active,
	onClick,
}: {
	cell: WorkloadCell;
	theme: "light" | "dark";
	active?: boolean;
	onClick?: () => void;
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
					? "#d5dceb"
					: "#DADFEB";
		backgroundImage =
			theme === "dark"
				? "repeating-linear-gradient(-63deg, rgba(255,255,255,0.30) 0 2px, rgba(255,255,255,0) 2px 16px)"
				: "repeating-linear-gradient(-63deg, rgba(255,255,255,0.30) 0 2px, rgba(255,255,255,0) 2px 16px)";
	}

	if (!cell.state || cell.state === "default") {
		backgroundColor = isHovered
			? "var(--ax-colors-bg-tertiary)"
			: "var(--ax-colors-bg-secondary)";
	}

	return (
		<button
			onClick={onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={{
				background: "transparent",
				border: 0,
				cursor: onClick ? "pointer" : "default",
				display: "block",
				padding: 0,
				width: "100%",
			}}
			type="button"
		>
			<Box
				alignItems="center"
				display="flex"
				justifyContent="center"
				style={{
					...baseStyle,
					backgroundColor,
					backgroundImage,
					boxShadow: active ? "inset 0 0 0 2px var(--ax-colors-border-accent)" : undefined,
					transition: "background-color 120ms ease, box-shadow 120ms ease",
				}}
			>
				{cell.value !== null ? (
					<Text color="fg.default" fontSize="md" fontWeight="600" style={{ color: textColor, maxWidth: "none" }}>
						{cell.value}
					</Text>
				) : null}
			</Box>
		</button>
	);
}

function WorkloadGrid({
	rows,
	theme,
	selectedWeekIndex,
	selectedPersonId,
	onSelectCell,
}: {
	rows: TeamMember[];
	theme: "light" | "dark";
	selectedWeekIndex?: number;
	selectedPersonId?: string;
	onSelectCell: (personId: string, weekIndex: number) => void;
}) {
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

					{rows.map((member) => (
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
									boxShadow:
										selectedPersonId === member.id
											? "inset 3px 0 0 var(--ax-colors-border-accent)"
											: undefined,
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
								<WorkloadCellBox
									key={`${member.id}-${index}`}
									active={selectedPersonId === member.id && selectedWeekIndex === index}
									cell={cell}
									onClick={() => onSelectCell(member.id, index)}
									theme={theme}
								/>
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
	showStartHandle,
	showEndHandle,
	onMouseDown,
	onResizeHandleMouseDown,
	onDragStart,
	onDragEnd,
}: {
	card: PlannerCard;
	dragged: boolean;
	theme: "light" | "dark";
	showStartHandle: boolean;
	showEndHandle: boolean;
	onMouseDown: (cardId: string) => void;
	onResizeHandleMouseDown: (
		event: ReactMouseEvent<HTMLDivElement>,
		cardId: string,
		edge: "start" | "end"
	) => void;
	onDragStart: (event: DragEvent<HTMLDivElement>, cardId: string) => void;
	onDragEnd: () => void;
}) {
	const badgeStyle = getPlannerBadgeStyle(card.status, theme);
	const isComplete = card.status === "done";
	const palette = plannerPalette[theme];
	const clippedDuration =
		"clippedDuration" in card
			? (card as PlannerCard & { clippedDuration: number }).clippedDuration
			: card.duration;
	const isCompactCard = clippedDuration <= 1;

	return (
		<div
			draggable={card.draggable !== false}
			onMouseDown={() => {
				if (card.draggable !== false) {
					onMouseDown(card.id);
				}
			}}
			onDragStart={(event) => onDragStart(event, card.id)}
			onDragEnd={onDragEnd}
			style={{
				backgroundColor: palette.cardBackground,
				border: "0",
				borderLeft: `3px solid ${getPlannerAccentColor(card.accent, theme)}`,
				borderRadius: 8,
				boxShadow:
					dragged
						? "0 18px 34px rgba(15, 23, 42, 0.20)"
						: "0 1px 2px rgba(16, 24, 40, 0.08)",
				cursor: card.draggable === false ? "default" : "grab",
				display: "flex",
				height: "100%",
				alignItems: "center",
				justifyContent: "space-between",
				opacity: isComplete ? 0.5 : dragged ? 0.84 : 1,
				overflow: "hidden",
				padding: "8px 12px",
				position: "relative",
				transform: dragged ? "scale(1.01)" : undefined,
				transition: "box-shadow 120ms ease, opacity 120ms ease, transform 120ms ease",
				userSelect: "none",
				WebkitUserDrag: card.draggable !== false ? "element" : "none",
				width: "100%",
			} as CSSProperties}
		>
			{showStartHandle ? (
				<div
					onMouseDown={(event) => {
						event.stopPropagation();
						event.preventDefault();
						onResizeHandleMouseDown(event, card.id, "start");
					}}
					style={{
						bottom: 0,
						cursor: "ew-resize",
						left: 0,
						position: "absolute",
						top: 0,
						width: 10,
						zIndex: 3,
					}}
				/>
			) : null}
			{showEndHandle ? (
				<div
					onMouseDown={(event) => {
						event.stopPropagation();
						event.preventDefault();
						onResizeHandleMouseDown(event, card.id, "end");
					}}
					style={{
						bottom: 0,
						cursor: "ew-resize",
						position: "absolute",
						right: 0,
						top: 0,
						width: 10,
						zIndex: 3,
					}}
				/>
			) : null}
			<Box
				alignItems="center"
				display="grid"
				style={{
					alignItems: "center",
					columnGap: isCompactCard ? 8 : 12,
					flex: 1,
					gridTemplateColumns: "minmax(0, 1fr) auto",
					minWidth: 0,
				}}
			>
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

				<Box
					alignItems="end"
					display="flex"
					flexDirection="column"
					style={{ flexShrink: 0, gap: 6, minWidth: isCompactCard ? 66 : 74 }}
				>
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
						{card.hoursPerDay}h/day
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
	visibleWeeks,
	selectedPersonId,
}: {
	cards: PlannerCard[];
	setCards: React.Dispatch<React.SetStateAction<PlannerCard[]>>;
	theme: "light" | "dark";
	visibleWeeks: WeekColumn[];
	selectedPersonId?: string;
}) {
	const [interaction, setInteraction] = useState<PlannerInteraction | null>(null);
	const [hoveredDropTarget, setHoveredDropTarget] = useState<string | null>(null);
	const [plannerPeopleColumnWidth, setPlannerPeopleColumnWidth] = useState(
		plannerPeopleColumnDefaultWidth
	);
	const [resizeState, setResizeState] = useState<{
		startWidth: number;
		startX: number;
	} | null>(null);
	const dragPreviewRef = useRef<HTMLDivElement | null>(null);
	const plannerContentRef = useRef<HTMLDivElement | null>(null);
	const activeCard = cards.find((card) => card.id === interaction?.cardId) ?? null;
	const interactionMode = interaction?.mode ?? null;
	const visibleRangeStartDay = visibleWeeks[0]?.startDay ?? 0;
	const visibleRangeEndDay =
		visibleWeeks[visibleWeeks.length - 1]?.startDay +
			(visibleWeeks[visibleWeeks.length - 1]?.duration ?? 1) -
			1;
	const visiblePlannerDays = fullTimelineDays.slice(
		visibleRangeStartDay,
		visibleRangeEndDay + 1
	);
	const dayColumnTemplate = `repeat(${visiblePlannerDays.length}, minmax(${plannerDayMinWidth}px, 1fr))`;
	const plannerGridMinWidth =
		plannerPeopleColumnWidth + visiblePlannerDays.length * plannerDayMinWidth;
	const effectiveCards = cards.map((card) =>
		interaction?.cardId === card.id &&
		(interactionMode === "resize-start" || interactionMode === "resize-end")
			? {
					...card,
					startDay: interaction.draftStartDay ?? card.startDay,
					duration: interaction.draftDuration ?? card.duration,
			  }
			: card
	);

	useEffect(() => {
		if (!resizeState) {
			return undefined;
		}

		const handlePointerMove = (event: MouseEvent) => {
			const nextWidth = resizeState.startWidth + event.clientX - resizeState.startX;
			setPlannerPeopleColumnWidth(
				Math.min(
					plannerPeopleColumnMaxWidth,
					Math.max(plannerPeopleColumnMinWidth, nextWidth)
				)
			);
		};

		const handlePointerUp = () => {
			setResizeState(null);
		};

		window.addEventListener("mousemove", handlePointerMove);
		window.addEventListener("mouseup", handlePointerUp);

		return () => {
			window.removeEventListener("mousemove", handlePointerMove);
			window.removeEventListener("mouseup", handlePointerUp);
		};
	}, [resizeState]);

	useEffect(() => {
		if (!interaction || interaction.mode !== "move") {
			return undefined;
		}

		const handleMouseUp = () => {
			window.setTimeout(() => {
				setInteraction(null);
				setHoveredDropTarget(null);
			}, 0);
		};

		window.addEventListener("mouseup", handleMouseUp);

		return () => {
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [interaction]);

	useEffect(() => {
		if (
			!interaction ||
			!activeCard ||
			(interaction.mode !== "resize-start" && interaction.mode !== "resize-end") ||
			interaction.startX === undefined ||
			interaction.originStartDay === undefined ||
			interaction.originEndDay === undefined
		) {
			return undefined;
		}

		const handleMouseMove = (event: MouseEvent) => {
			const timelineWidth = plannerContentRef.current
				? plannerContentRef.current.clientWidth - plannerPeopleColumnWidth
				: plannerDayMinWidth * visiblePlannerDays.length;
			const dayWidth = timelineWidth / visiblePlannerDays.length;
			const deltaDays = Math.round((event.clientX - interaction.startX!) / dayWidth);
			let nextStartDay = interaction.originStartDay!;
			let nextEndDay = interaction.originEndDay!;

			if (interaction.mode === "resize-start") {
				nextStartDay = Math.max(
					visibleRangeStartDay,
					Math.min(interaction.originEndDay!, interaction.originStartDay! + deltaDays)
				);
			} else {
				nextEndDay = Math.min(
					visibleRangeEndDay,
					Math.max(interaction.originStartDay!, interaction.originEndDay! + deltaDays)
				);
			}

			const nextDuration = nextEndDay - nextStartDay + 1;
			const isValid =
				isPlannerCardPlacementValid(
					activeCard,
					nextStartDay,
					nextDuration,
					visibleRangeStartDay,
					visibleRangeEndDay
				) &&
				canPlaceCardInLane(
					cards,
					activeCard.assigneeId,
					activeCard.lane,
					nextStartDay,
					nextDuration,
					activeCard.id
				);

			setInteraction((current) =>
				current
					? {
							...current,
							draftDuration: nextDuration,
							draftStartDay: nextStartDay,
							valid: isValid,
						}
					: current
			);
		};

		const handleMouseUp = () => {
			const nextStartDay = interaction.draftStartDay ?? interaction.originStartDay!;
			const nextDuration =
				interaction.draftDuration ?? interaction.originDuration ?? activeCard.duration;
			const isValid = interaction.valid ?? false;

			if (isValid) {
				setCards((currentCards) =>
					normalizePlannerCardLanes(currentCards.map((card) =>
						card.id === activeCard.id
							? {
									...card,
									startDay: nextStartDay,
									duration: nextDuration,
								}
							: card
					))
				);
			}

			setInteraction(null);
			setHoveredDropTarget(null);
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [activeCard, cards, interaction, plannerPeopleColumnWidth, visiblePlannerDays.length, visibleRangeEndDay, visibleRangeStartDay]);

	const getVisiblePersonCards = (assigneeId: string) =>
		packVisiblePlannerCards(
			effectiveCards.filter((card) => card.assigneeId === assigneeId),
			visibleRangeStartDay,
			visibleRangeEndDay
		);

	const getPersonLaneCount = (assigneeId: string) => {
		const visiblePersonCards = getVisiblePersonCards(assigneeId);
		const maxLane = visiblePersonCards.reduce(
			(highest, card) => Math.max(highest, card.localLane),
			-1
		);

		return Math.max(1, maxLane + 1 + (interactionMode === "move" && activeCard ? 1 : 0));
	};

	const getPersonRowHeight = (laneCount: number) =>
		plannerLaneHeight * laneCount;

	const handleResizeStart = (event: ReactMouseEvent<HTMLDivElement>) => {
		event.preventDefault();
		setResizeState({
			startWidth: plannerPeopleColumnWidth,
			startX: event.clientX,
		});
	};

	const handleMoveStart = (cardId: string) => {
		setInteraction({ cardId, mode: "move" });
		setHoveredDropTarget(null);
	};

	const handleResizeHandleMouseDown = (
		event: ReactMouseEvent<HTMLDivElement>,
		cardId: string,
		edge: "start" | "end"
	) => {
		const card = cards.find((item) => item.id === cardId);
		if (!card) {
			return;
		}

		setInteraction({
			cardId,
			mode: edge === "start" ? "resize-start" : "resize-end",
			originDuration: card.duration,
			originStartDay: card.startDay,
			originEndDay: card.startDay + card.duration - 1,
			startX: event.clientX,
			draftDuration: card.duration,
			draftStartDay: card.startDay,
			valid: true,
		});
		setHoveredDropTarget(null);
	};

	const handleDragStart = (event: DragEvent<HTMLDivElement>, cardId: string) => {
		const dragCard = cards.find((card) => card.id === cardId);
		event.dataTransfer.effectAllowed = "move";
		event.dataTransfer.setData("text/plain", cardId);
		event.dataTransfer.setData("text", cardId);
		setInteraction({ cardId, mode: "move" });
		setHoveredDropTarget(null);

		if (dragCard) {
			const preview = document.createElement("div");
			const palette = plannerPalette[theme];
			preview.style.background = palette.cardBackground;
			preview.style.borderLeft = `3px solid ${getPlannerAccentColor(dragCard.accent, theme)}`;
			preview.style.borderRadius = "8px";
			preview.style.boxShadow = "0 18px 34px rgba(15, 23, 42, 0.20)";
			preview.style.color = palette.cardText;
			preview.style.display = "flex";
			preview.style.alignItems = "center";
			preview.style.justifyContent = "space-between";
			preview.style.gap = "12px";
			preview.style.padding = "8px 12px";
			preview.style.pointerEvents = "none";
			preview.style.position = "fixed";
			preview.style.top = "-9999px";
			preview.style.left = "-9999px";
			preview.style.width = `${Math.max(200, dragCard.duration * plannerDayMinWidth - plannerCellInset * 2)}px`;
			preview.style.zIndex = "9999";
			preview.innerHTML = `
				<div style="display:flex; flex-direction:column; min-width:0; gap:2px; flex:1;">
					<div style="font-size:14px; font-weight:600; line-height:20px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${dragCard.title}</div>
					<div style="font-size:12px; line-height:16px; color:${palette.cardSubtext}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${dragCard.taskId} · ${dragCard.subtitle}</div>
				</div>
				<div style="font-size:12px; font-weight:600; line-height:16px; white-space:nowrap; margin-left:12px;">${dragCard.hoursPerDay}h/day</div>
			`;
			document.body.appendChild(preview);
			dragPreviewRef.current = preview;
			event.dataTransfer.setDragImage(preview, 24, 20);
			window.setTimeout(() => {
				preview.remove();
				if (dragPreviewRef.current === preview) {
					dragPreviewRef.current = null;
				}
			}, 0);
		}
	};

	const handleDragEnd = () => {
		setInteraction(null);
		setHoveredDropTarget(null);
		if (dragPreviewRef.current) {
			dragPreviewRef.current.remove();
			dragPreviewRef.current = null;
		}
	};

	const handleDrop = (assigneeId: string, startDay: number, lane: number | null, isValid: boolean) => {
		if (!activeCard || lane === null || !isValid) {
			setInteraction(null);
			setHoveredDropTarget(null);
			return;
		}

		setCards((currentCards) =>
			normalizePlannerCardLanes(currentCards.map((card) =>
				card.id === activeCard.id
					? {
							...card,
							assigneeId,
							startDay,
							lane,
						}
					: card
			))
		);

		setInteraction(null);
		setHoveredDropTarget(null);
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
				<Box ref={plannerContentRef} style={{ minWidth: plannerGridMinWidth, width: "100%" }}>
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
								left: 0,
								position: "sticky",
								zIndex: 5,
							}}
						>
							<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: "20px", maxWidth: "none" }}>
								People
							</Text>
							<div
								aria-label="Resize people column"
								onDoubleClick={() => setPlannerPeopleColumnWidth(plannerPeopleColumnDefaultWidth)}
								onMouseDown={handleResizeStart}
								role="separator"
								style={{
									bottom: 0,
									cursor: "col-resize",
									position: "absolute",
									right: -4,
									top: 0,
									width: 8,
									zIndex: 4,
								}}
							>
								<div
									style={{
										backgroundColor: resizeState
											? "var(--ax-colors-fg-accent)"
											: "var(--ax-colors-border-tertiary)",
										borderRadius: 999,
										height: 40,
										left: "50%",
										position: "absolute",
										top: "50%",
										transform: "translate(-50%, -50%)",
										width: 2,
									}}
								/>
							</div>
						</Box>

						<Box
							bg="bg.default"
							display="grid"
							style={{
								gridTemplateColumns: dayColumnTemplate,
							}}
						>
							{visiblePlannerDays.map((day, index) => (
								<Box
									key={day.id}
									alignItems="center"
									display="flex"
									justifyContent="center"
									py="10"
									style={{
										borderRight:
											index === visiblePlannerDays.length - 1
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
					const personCards = getVisiblePersonCards(person.id);
					const utilization = getUtilizationPercentForRange(
						person,
						cards,
						visibleRangeStartDay,
						visiblePlannerDays.length
					);
					const overCapacity = !person.isTeam && utilization > 100;
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
									alignItems={laneCount > 1 ? "start" : "center"}
									bg="bg.default"
									display="flex"
									gap="12"
									px="8"
									py="8"
								style={{
									backgroundColor:
										selectedPersonId === person.id
											? "var(--ax-colors-bg-secondary)"
											: undefined,
									borderBottom: "1px solid var(--ax-colors-border-tertiary)",
									borderRight: "1px solid var(--ax-colors-border-tertiary)",
									left: 0,
									height: rowHeight,
									overflow: "hidden",
									position: "sticky",
									zIndex: 5,
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
										<Avatar
											name={person.name}
											size="sm"
											src={person.avatarSrc}
											style={{ flexShrink: 0, height: 32, width: 32 }}
										/>
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
										height: rowHeight,
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
											{visiblePlannerDays.map((day, dayIndex) => {
											const globalDayIndex = visibleRangeStartDay + dayIndex;
											const block = plannerBlocks.find(
												(item) =>
													item.assigneeId === person.id &&
													globalDayIndex >= item.startDay &&
													globalDayIndex < item.startDay + item.duration
											);
											const isBlockStart = block ? globalDayIndex === block.startDay : false;
											const isOverloaded = isPlannerDayOverloaded(person, globalDayIndex, cards);

											return (
												<Box
													key={`${person.id}-${day.id}`}
													bg="bg.secondary"
													style={{
														backgroundColor: isOverloaded
															? plannerPalette[theme].overloadBackground
															: block
																? theme === "dark"
																	? "#2a3142"
																	: "#DADFEB"
																: "var(--ax-colors-bg-secondary)",
														backgroundImage: block
															? theme === "dark"
																? "repeating-linear-gradient(-63deg, rgba(255,255,255,0.30) 0 2px, rgba(255,255,255,0) 2px 16px)"
																: "repeating-linear-gradient(-63deg, rgba(255,255,255,0.30) 0 2px, rgba(255,255,255,0) 2px 16px)"
															: undefined,
														borderRight:
															dayIndex === visiblePlannerDays.length - 1
																? undefined
																: "1px solid var(--ax-colors-border-tertiary)",
														borderRadius: block ? 0 : undefined,
														padding: block ? "4px 8px" : 0,
													}}
												>
													{block && isBlockStart ? (
														<Box
															display="flex"
															flexDirection="column"
															style={{ alignItems: "flex-start", gap: 10, justifyContent: "center" }}
														>
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
											gridTemplateColumns: dayColumnTemplate,
											gridTemplateRows: `repeat(${laneCount}, ${plannerLaneHeight}px)`,
											inset: 0,
											position: "absolute",
										}}
									>
										{activeCard && interactionMode === "move"
											? plannerPeople.flatMap((slotPerson) =>
													visiblePlannerDays.map((day, localDayIndex) => {
														const startDay = visibleRangeStartDay + localDayIndex;
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

														const isValid = isPlannerCardPlacementValid(
															activeCard,
															startDay,
															activeCard.duration,
															visibleRangeStartDay,
															visibleRangeEndDay
														);
														const dropKey = `${slotPerson.id}-${startDay}-${lane}`;
														const isHovered = hoveredDropTarget === dropKey;
														return (
														<div
															key={`${slotPerson.id}-${startDay}`}
															onDragEnter={() => {
																if (slotPerson.id === person.id) {
																	setHoveredDropTarget(dropKey);
																}
															}}
															onDragLeave={() => {
																if (hoveredDropTarget === dropKey) {
																	setHoveredDropTarget(null);
																}
															}}
															onMouseEnter={() => {
																if (slotPerson.id === person.id && activeCard) {
																	setHoveredDropTarget(dropKey);
																}
															}}
															onMouseLeave={() => {
																if (hoveredDropTarget === dropKey) {
																	setHoveredDropTarget(null);
																}
															}}
															onMouseUp={(event) => {
																event.preventDefault();
																if (slotPerson.id === person.id) {
																	handleDrop(slotPerson.id, startDay, lane, isValid);
																}
															}}
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
																gridColumn: `${localDayIndex + 1} / span ${activeCard.duration}`,
																gridRow: `${lane + 1}`,
																padding: plannerCellInset,
																pointerEvents: slotPerson.id === person.id ? "auto" : "none",
																	zIndex: 1,
																}}
															>
														<div
															style={{
																backgroundColor: isValid
																	? isHovered
																		? plannerPalette[theme].dropValidHoverBackground
																		: plannerPalette[theme].dropValidBackground
																	: isHovered
																		? plannerPalette[theme].dropInvalidHoverBackground
																		: plannerPalette[theme].dropInvalidBackground,
																border: `1.5px dashed ${
																	isValid
																		? plannerPalette[theme].dropValidBorder
																		: plannerPalette[theme].dropInvalidBorder
																}`,
																borderRadius: 8,
																boxShadow: isHovered
																	? isValid
																		? "inset 0 0 0 1px rgba(255,255,255,0.24), 0 0 0 1px rgba(61, 99, 245, 0.10)"
																		: "inset 0 0 0 1px rgba(255,255,255,0.18), 0 0 0 1px rgba(226, 87, 87, 0.10)"
																	: isValid
																		? "inset 0 0 0 1px rgba(255,255,255,0.20)"
																		: "inset 0 0 0 1px rgba(255,255,255,0.14)",
																height: "100%",
																transition: "background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease",
																width: "100%",
															}}
														/>
															</div>
														);
													})
												)
											: null}

										{personCards.map((card) => {
											return (
											<div
												key={card.id}
												style={{
													alignItems: "center",
													display: "flex",
													gridColumn: `${
														card.visibleStartDay - visibleRangeStartDay + 1
													} / span ${card.clippedDuration}`,
													gridRow: `${card.localLane + 1}`,
													height: "100%",
													padding: plannerCellInset,
													position: "relative",
													zIndex: 2,
												}}
											>
												<PlannerCardTile
													card={card}
													dragged={interaction?.cardId === card.id}
													theme={theme}
													showEndHandle={card.showEndHandle}
													showStartHandle={card.showStartHandle}
													onMouseDown={handleMoveStart}
													onResizeHandleMouseDown={handleResizeHandleMouseDown}
													onDragEnd={handleDragEnd}
													onDragStart={handleDragStart}
												/>
											</div>
											);
										})}
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
	const [plannerWeekIndex, setPlannerWeekIndex] = useState(0);
	const [selectedPlannerPersonId, setSelectedPlannerPersonId] = useState<string | undefined>();
	const [plannerCards, setPlannerCards] = useState<PlannerCard[]>(
		() => normalizePlannerCardLanes(generatePlannerCardsFromTargets())
	);
	const visiblePlannerWeeks = getPlannerViewportWeeks(plannerWeekIndex);
	const workloadRows = buildWorkloadRows(plannerCards);

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

								<Button appearance="default" onClick={() => setPlannerWeekIndex(0)} size="md">
									Today
								</Button>

								<Box alignItems="center" display="flex" gap="8">
									<Button
										appearance="subtle"
										aria-label="Previous date range"
										disabled={plannerWeekIndex === 0}
										onClick={() => handlePlannerWeekChange(-1)}
										size="sm"
									>
										<IconChevronLeft size={16} />
									</Button>
									<Text color="fg.default" fontSize="sm" fontWeight="600" style={{ maxWidth: "none" }}>
										Jun 1 - Aug 30 2025
									</Text>
									<Button
										appearance="subtle"
										aria-label="Next date range"
										disabled={plannerWeekIndex === weekColumns.length - 1}
										onClick={() => handlePlannerWeekChange(1)}
										size="sm"
									>
										<IconChevronRight size={16} />
									</Button>
								</Box>
							</Box>
						</Box>

						<Box w="full">
							<WorkloadGrid
								onSelectCell={handleSelectWorkloadCell}
								rows={workloadRows}
								selectedPersonId={selectedPlannerPersonId}
								selectedWeekIndex={plannerWeekIndex}
								theme={theme}
							/>
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

								<Button appearance="default" onClick={() => setPlannerWeekIndex(0)} size="md">
									Today
								</Button>

								<Box alignItems="center" display="flex" gap="8">
									<Button
										appearance="subtle"
										aria-label="Previous planner range"
										disabled={plannerWeekIndex === 0}
										onClick={() => handlePlannerWeekChange(-1)}
										size="sm"
									>
										<IconChevronLeft size={16} />
									</Button>
									<Text color="fg.default" fontSize="sm" fontWeight="600" style={{ maxWidth: "none" }}>
										{getPlannerViewportLabel(visiblePlannerWeeks)}
									</Text>
									<Button
										appearance="subtle"
										aria-label="Next planner range"
										disabled={plannerWeekIndex === weekColumns.length - 1}
										onClick={() => handlePlannerWeekChange(1)}
										size="sm"
									>
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

						<PlannerGrid
							cards={plannerCards}
							selectedPersonId={selectedPlannerPersonId}
							setCards={setPlannerCards}
							theme={theme}
							visibleWeeks={visiblePlannerWeeks}
						/>
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

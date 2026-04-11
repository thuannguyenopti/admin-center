import type { WeekColumn, PlannerDay, PlannerCard, PlannerStatus, PlannerAccent, PlannerPerson, TeamMember, PlannerBlock, WorkloadCell } from "./types";
import { fullTimelineDays, weekColumns, workloadOverHoursThreshold, workloadUnderHoursThreshold, plannerPalette } from "./constants";
import { teamMembers, autoCampaigns, autoActions, plannerPeople, generatePlannerBlocksFromTargets } from "./mockData";
import { CSSProperties } from "react";

const plannerBlocks = generatePlannerBlocksFromTargets();

export function getWorkingDayIndexesForWeek(week: WeekColumn) {
	return Array.from({ length: week.duration }, (_, offset) => week.startDay + offset).filter((dayIndex) => {
		const day = fullTimelineDays[dayIndex];
		return day ? day.dayLabel !== "Sat" && day.dayLabel !== "Sun" : false;
	});
}

export function getWeeklyCapacityHours(capacityLabel: string) {
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

export function distributeWeeklyHours(
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

export function getAutoCardStatus(memberIndex: number, weekIndex: number, segmentIndex: number): PlannerStatus {
	const mod = (memberIndex + weekIndex + segmentIndex) % 6;
	if (mod === 0) {
		return "done";
	}
	if (mod === 1 || mod === 2 || mod === 3) {
		return "in_progress";
	}
	return "not_started";
}

export function getAutoCardAccent(memberIndex: number, weekIndex: number, segmentIndex: number): PlannerAccent {
	const accents: PlannerAccent[] = ["blue", "green", "neutral", "red"];
	return accents[(memberIndex + weekIndex + segmentIndex) % accents.length];
}

export function isPlannerCardPlacementValid(
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

function rangesOverlap(startA: number, endA: number, startB: number, endB: number) {
	return startA <= endB && startB <= endA;
}

export function getAvailableLane(
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

export function canPlaceCardInLane(
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

export function normalizePlannerCardLanes(cards: PlannerCard[]) {
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

			if (lane !== null) {
				normalized.push({ ...card, lane });
			}
		}

		return normalized;
	});
}

export function generatePlannerCardsFromTargets(): PlannerCard[] {
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

export function isWorkingTimelineDay(dayIndex: number) {
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

export function getPlannerDailyCapacity(person: PlannerPerson) {
	return person.capacityHours / 5;
}

export function getPlannerDayLoad(personId: string, dayIndex: number, cards: PlannerCard[]) {
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

export function getPtoDayIndexes(personId: string) {
	return new Set(
		plannerBlocks
			.filter((block) => block.assigneeId === personId && isPtoBlock(block))
			.flatMap((block) =>
				Array.from({ length: block.duration }, (_, offset) => block.startDay + offset)
			)
			.filter((dayIndex) => isWorkingTimelineDay(dayIndex))
	);
}

export function getWorkingDayIndexesInRange(startDay: number, duration: number) {
	return Array.from({ length: duration }, (_, offset) => startDay + offset).filter((dayIndex) =>
		isWorkingTimelineDay(dayIndex)
	);
}

export function getAvailableHoursForRange(person: PlannerPerson, startDay: number, duration: number) {
	if (person.isTeam) {
		return person.capacityHours;
	}

	const dailyCapacity = getPlannerDailyCapacity(person);
	const ptoDays = getPtoDayIndexes(person.id);
	const workingDays = getWorkingDayIndexesInRange(startDay, duration);
	const availableWorkingDays = workingDays.filter((dayIndex) => !ptoDays.has(dayIndex)).length;
	return Math.max(0, availableWorkingDays * dailyCapacity);
}

export function getPlannedHoursForRange(personId: string, cards: PlannerCard[], startDay: number, duration: number) {
	const dayIndexes = Array.from({ length: duration }, (_, offset) => startDay + offset);

	return dayIndexes.reduce((sum, dayIndex) => {
		if (!isWorkingTimelineDay(dayIndex)) {
			return sum;
		}

		return sum + getPlannerDayLoad(personId, dayIndex, cards);
	}, 0);
}

export function getUtilizationPercentForRange(
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

export function isPlannerDayOverloaded(person: PlannerPerson, dayIndex: number, cards: PlannerCard[]) {
	if (person.isTeam || !isWorkingTimelineDay(dayIndex)) {
		return false;
	}

	const ptoDays = getPtoDayIndexes(person.id);
	const availableHours = ptoDays.has(dayIndex) ? 0 : getPlannerDailyCapacity(person);
	const plannedHours = getPlannerDayLoad(person.id, dayIndex, cards);

	return plannedHours > availableHours;
}

export function getWorkloadCellForWeek(person: PlannerPerson, week: WeekColumn, cards: PlannerCard[]): WorkloadCell {
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

export function buildWorkloadRows(cards: PlannerCard[]): TeamMember[] {
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

export function getWeekRangeLabel(week: WeekColumn) {
	const start = fullTimelineDays[week.startDay];
	const end = fullTimelineDays[week.startDay + week.duration - 1];
	if (!start || !end) {
		return "";
	}

	return `${start.dateLabel} - ${end.dateLabel} 2025`;
}

export function getPlannerViewportWeeks(selectedWeekIndex: number) {
	let start = Math.max(0, selectedWeekIndex - 1);
	let end = Math.min(weekColumns.length - 1, start + 2);
	start = Math.max(0, end - 2);

	return weekColumns.slice(start, end + 1);
}

export function getPlannerViewportLabel(weeks: WeekColumn[]) {
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

export type PackedVisibleCard = PlannerCard & {
	clippedDuration: number;
	localLane: number;
	showEndHandle: boolean;
	showStartHandle: boolean;
	visibleEndDay: number;
	visibleStartDay: number;
};

export function packVisiblePlannerCards(cards: PlannerCard[], rangeStartDay: number, rangeEndDay: number): PackedVisibleCard[] {
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

export function getPlannerStatusLabel(status: PlannerStatus) {
	switch (status) {
		case "done":
			return "Completed";
		case "in_progress":
			return "In Progress";
		default:
			return "Not Started";
	}
}

export function getPlannerBadgeStyle(status: PlannerStatus, theme: "light" | "dark"): CSSProperties {
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

export function getPlannerAccentColor(accent: PlannerAccent, theme: "light" | "dark") {
	return plannerPalette[theme].accent[accent];
}

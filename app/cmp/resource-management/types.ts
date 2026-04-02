export type ResourceTab = "workload" | "planner" | "reports";
export type CellState = "default" | "over" | "under" | "pto";

export type WorkloadCell = {
	value: number | null;
	state?: CellState;
};

export type TeamMember = {
	id: string;
	name: string;
	role: string;
	weeklyCapacity: string;
	timezone: string;
	avatarSrc?: string;
	cells: WorkloadCell[];
};

export type WeekColumn = {
	id: string;
	month: string;
	label: string;
	startDay: number;
	duration: number;
};

export type PlannerPerson = {
	id: string;
	name: string;
	role: string;
	weeklyCapacity: string;
	capacityHours: number;
	timezone?: string;
	avatarSrc?: string;
	isTeam?: boolean;
};

export type PlannerDay = {
	id: string;
	index: number;
	dayLabel: string;
	dateLabel: string;
	isToday?: boolean;
};

export type PlannerStatus = "done" | "not_started" | "in_progress";
export type PlannerAccent = "blue" | "green" | "red" | "neutral";

export type PlannerCard = {
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

export type PlannerInteractionMode = "move" | "resize-start" | "resize-end";

export type PlannerInteraction = {
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

export type PlannerBlock = {
	id: string;
	assigneeId: string;
	startDay: number;
	duration: number;
	label: string;
	description?: string;
};

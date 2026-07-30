<<<<<<< HEAD
import type { WorkflowTemplate, WorkflowTemplateIconKind } from "./types";

export type { WorkflowTemplate, WorkflowTemplateIconKind };

export type ChecklistEntry = {
	id: string;
	label: string;
	checked: boolean;
};

export type TaskWorkflowStep = {
	id: string;
	title: string;
	date?: string;
	done: boolean;
	danger?: boolean;
	expanded?: boolean;
	assigneeUserId?: string;
	description?: string;
	checklist: ChecklistEntry[];
	badgeLabel?: string;
	showCalendarAction?: boolean;
};

export type TaskWorkflowState = {
	workflowTemplateId: string;
	steps: TaskWorkflowStep[];
};
=======
import type { WorkflowTemplate, WorkflowTemplateIconKind } from "./types";

export type { WorkflowTemplate, WorkflowTemplateIconKind };

export type ChecklistEntry = {
	id: string;
	label: string;
	checked: boolean;
};

export type TaskWorkflowStep = {
	id: string;
	title: string;
	date?: string;
	done: boolean;
	danger?: boolean;
	expanded?: boolean;
	assigneeUserId?: string;
	description?: string;
	checklist: ChecklistEntry[];
	badgeLabel?: string;
	showCalendarAction?: boolean;
};

export type TaskWorkflowState = {
	workflowTemplateId: string;
	steps: TaskWorkflowStep[];
};
>>>>>>> origin/main

import type { Scene, WorkflowTemplate } from "../types";
import type { ChecklistEntry, TaskWorkflowState, TaskWorkflowStep } from "../workflowTypes";
import { workflowTemplates } from "../mockData";

let idCounter = 0;
function nextId(): string {
	return `cl-${Date.now()}-${++idCounter}`;
}

/** Deep-copy a WorkflowTemplate into a mutable TaskWorkflowState. */
export function createTaskWorkflowFromTemplate(template: WorkflowTemplate): TaskWorkflowState {
	return {
		workflowTemplateId: template.id,
		steps: template.steps.map((step): TaskWorkflowStep => ({
			id: step.id,
			title: step.title,
			date: step.date,
			done: step.done ?? false,
			danger: step.danger,
			expanded: step.expanded,
			assigneeUserId: undefined,
			description: step.description,
			checklist: (step.checklist ?? []).map((label): ChecklistEntry => ({
				id: nextId(),
				label,
				checked: false,
			})),
			badgeLabel: step.badgeLabel,
			showCalendarAction: step.showCalendarAction,
		})),
	};
}

/** Per-task default workflow assignments (overrides the generic fallback). */
const defaultWorkflowByTask: Record<string, string> = {
	"6": "blog-cms",
};

/** Get the workflow state for a task, or derive one from the default template. */
export function resolveTaskWorkflow(
	taskId: string,
	workflowMap: Record<string, TaskWorkflowState>,
	scene: Scene,
): TaskWorkflowState {
	const existing = workflowMap[taskId];
	if (existing) return existing;

	const taskDefault = defaultWorkflowByTask[taskId];
	const defaultId = taskDefault ?? (scene === "content-empty" ? "starter" : "newsletter");
	const template = workflowTemplates.find((t) => t.id === defaultId) ?? workflowTemplates[0];
	return createTaskWorkflowFromTemplate(template);
}

/** Return a new TaskWorkflowState with a checklist item toggled. */
export function toggleChecklistItem(
	state: TaskWorkflowState,
	stepId: string,
	checklistItemId: string,
): TaskWorkflowState {
	return {
		...state,
		steps: state.steps.map((step) =>
			step.id !== stepId
				? step
				: {
						...step,
						checklist: step.checklist.map((item) =>
							item.id !== checklistItemId ? item : { ...item, checked: !item.checked },
						),
					},
		),
	};
}

/** Return a new TaskWorkflowState with a step's assignee changed. */
export function setStepAssignee(
	state: TaskWorkflowState,
	stepId: string,
	userId: string | undefined,
): TaskWorkflowState {
	return {
		...state,
		steps: state.steps.map((step) =>
			step.id !== stepId ? step : { ...step, assigneeUserId: userId },
		),
	};
}

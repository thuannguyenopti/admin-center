"use client";

import React from "react";
import type {MenuOption} from "@optiaxiom/react";
import {IconTrashCan as IconTrash, IconListCheck as IconChecklist} from "@optimizely/axiom-icons";
import type {CmpTask} from "@/app/db/cmpInitialData";

interface TaskAssignmentMenuOptionsArgs {
	currentTaskId: string | null;
	tasks: CmpTask[];
	onAddToTask: (taskId: string, taskName: string) => void;
	onRemoveFromTask?: () => void;
}

/** Returns the Axiom Menu `options` entries for the page → task-assignment action.
 *  When the page is already assigned to a task → a single "Remove from task" item.
 *  Otherwise → an "Add to task" item with a searchable sub-menu of tasks (Axiom Menu
 *  handles filtering via `subOptionsInputVisible` + `keywords` on each sub-option). */
export function taskAssignmentMenuOptions({
	currentTaskId,
	tasks,
	onAddToTask,
	onRemoveFromTask,
}: TaskAssignmentMenuOptionsArgs): MenuOption[] {
	if (currentTaskId && onRemoveFromTask) {
		return [
			{
				label: "Remove from task",
				addon: <IconTrash size={16} />,
				intent: "danger",
				execute: onRemoveFromTask,
			},
		];
	}

	return [
		{
			label: "Add to task",
			addon: <IconChecklist size={16} />,
			subOptionsInputVisible: true,
			subOptions: tasks.map((task) => ({
				label: task.title,
				description: task.reference,
				keywords: `${task.title} ${task.reference}`,
				execute: () => onAddToTask(task.id, task.title),
			})),
		},
	];
}

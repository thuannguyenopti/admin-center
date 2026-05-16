"use client";

import React, { useState } from "react";
import {
	Box,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
	DropdownMenuSeparator,
	DropdownMenuLabel,
	Input,
	Text,
} from "@optiaxiom/react";
import { IconTrashCan as IconTrash, IconListCheck as IconChecklist } from "@optimizely/axiom-icons";
import type { CmpTask } from "@/app/db/cmpInitialData";

interface TaskAssignmentMenuProps {
	currentTaskId: string | null;
	tasks: CmpTask[];
	onAddToTask: (taskId: string, taskName: string) => void;
	onRemoveFromTask?: () => void;
}

export default function TaskAssignmentMenu({
	currentTaskId,
	tasks,
	onAddToTask,
	onRemoveFromTask,
}: TaskAssignmentMenuProps) {
	const [taskSearchQuery, setTaskSearchQuery] = useState("");

	const filteredTasks = tasks.filter((task) =>
		task.title.toLowerCase().includes(taskSearchQuery.toLowerCase())
	);

	// If page is already in a task - show simple Remove option
	if (currentTaskId && onRemoveFromTask) {
		return (
			<DropdownMenuItem
				intent="danger"
				onSelect={onRemoveFromTask}
			>
				<Box display="flex" alignItems="center" gap="8">
					<IconTrash size={16} />
					Remove from task
				</Box>
			</DropdownMenuItem>
		);
	}

	// No task assigned - show Add to Task submenu
	return (
		<DropdownMenuSub onOpenChange={(open) => {
			if (!open) setTaskSearchQuery("");
		}}>
			<DropdownMenuSubTrigger>
				<Box display="flex" alignItems="center" gap="8">
					<IconChecklist size={16} />
					Add to task
				</Box>
			</DropdownMenuSubTrigger>
			<DropdownMenuSubContent
				style={{ minWidth: 280, maxHeight: 340, overflow: "auto" }}
			>
				{/* Search input */}
				<Box px="8" py="4">
					<Input
						placeholder="Search tasks..."
						value={taskSearchQuery}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setTaskSearchQuery(e.target.value)
						}
						onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
						size="md"
					/>
				</Box>
				<DropdownMenuSeparator />

				{/* Task list */}
				<DropdownMenuLabel>Tasks</DropdownMenuLabel>
				{filteredTasks.length === 0 ? (
					<Box px="12" py="8">
						<Text style={{ fontSize: 13 }} color="fg.tertiary">
							No tasks found
						</Text>
					</Box>
				) : (
					filteredTasks.map((task) => (
						<DropdownMenuItem
							key={task.id}
							onSelect={() => onAddToTask(task.id, task.title)}
						>
							<Box>
								<Text style={{ fontSize: 13, fontWeight: 500 }}>
									{task.title}
								</Text>
								<Text style={{ fontSize: 12 }} color="fg.tertiary">
									{task.reference}
								</Text>
							</Box>
						</DropdownMenuItem>
					))
				)}
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}

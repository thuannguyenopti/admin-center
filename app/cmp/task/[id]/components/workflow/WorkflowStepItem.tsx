"use client";

import { Avatar, Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconCalendar, IconCheck, IconChevronRight } from "@tabler/icons-react";
import { initialUsers } from "@/app/db/initialData";
import type { TaskWorkflowStep } from "../../workflowTypes";
import { DashedCircle } from "../shared/DashedCircle";
import { WorkflowExpandedStep } from "./WorkflowExpandedStep";

type WorkflowStepItemProps = {
	onSetAssignee: (stepId: string, userId: string | undefined) => void;
	onToggleChecklistItem: (stepId: string, checklistItemId: string) => void;
	step: TaskWorkflowStep;
};

export function WorkflowStepItem({ onSetAssignee, onToggleChecklistItem, step }: WorkflowStepItemProps) {
	if (step.expanded) {
		return (
			<WorkflowExpandedStep
				onSetAssignee={onSetAssignee}
				onToggleChecklistItem={onToggleChecklistItem}
				step={step}
			/>
		);
	}

	const assignee = step.assigneeUserId
		? initialUsers.find((u) => u.id === step.assigneeUserId)
		: undefined;

	return (
		<Box
			alignItems="center"
			display="flex"
			justifyContent="space-between"
			style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", padding: "14px 0" }}
		>
			<Box alignItems="center" display="flex" gap="12">
				<IconChevronRight color="var(--ax-colors-fg-secondary)" size={16} />
				{step.done ? (
					<Box
						alignItems="center"
						bg="bg.success.light"
						display="flex"
						justifyContent="center"
						rounded="full"
						style={{ height: 24, width: 24 }}
					>
						<IconCheck color="var(--ax-colors-fg-success-strong)" size={14} />
					</Box>
				) : (
					<DashedCircle />
				)}
				<Text color="fg.default" style={{ fontSize: 15, fontWeight: 500, lineHeight: "22px", maxWidth: "none" }}>
					{step.title}
				</Text>
			</Box>
			<Box alignItems="center" display="flex" gap="12">
				{step.date && (
					<Text
						color={step.danger ? "fg.error.strong" : "fg.secondary"}
						style={{ fontSize: 12, fontWeight: 500, lineHeight: "16px", maxWidth: "none" }}
					>
						{step.date}
					</Text>
				)}
				{step.showCalendarAction && (
					<DashedCircle>
						<IconCalendar size={12} />
					</DashedCircle>
				)}
				{assignee && (
					<Avatar name={assignee.name} size="xs" src={assignee.avatar} style={{ height: 20, width: 20 }} />
				)}
			</Box>
		</Box>
	);
}

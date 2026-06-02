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
	onToggleDone: (stepId: string) => void;
	onToggleExpanded: (stepId: string) => void;
	step: TaskWorkflowStep;
};

export function WorkflowStepItem({ onSetAssignee, onToggleChecklistItem, onToggleDone, onToggleExpanded, step }: WorkflowStepItemProps) {
	if (step.expanded) {
		return (
			<WorkflowExpandedStep
				onSetAssignee={onSetAssignee}
				onToggleChecklistItem={onToggleChecklistItem}
				onToggleDone={onToggleDone}
				onToggleExpanded={onToggleExpanded}
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
			aria-expanded={false}
			display="flex"
			justifyContent="space-between"
			onClick={() => onToggleExpanded(step.id)}
			onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggleExpanded(step.id); } }}
			role="button"
			style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", cursor: "pointer", padding: "14px 0" }}
			tabIndex={0}
		>
			<Box alignItems="center" display="flex" gap="12">
				<IconChevronRight color="var(--ax-colors-fg-secondary)" size={16} />
				{step.done ? (
					<Box
						alignItems="center"
						bg="bg.success.light"
						display="flex"
						justifyContent="center"
						onClick={(e) => { e.stopPropagation(); onToggleDone(step.id); }}
						onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onToggleDone(step.id); } }}
						role="button"
						rounded="full"
						style={{ cursor: "pointer", height: 24, width: 24 }}
						tabIndex={0}
					>
						<IconCheck color="var(--ax-colors-fg-success-strong)" size={14} />
					</Box>
				) : (
					<DashedCircle onClick={() => onToggleDone(step.id)} />
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

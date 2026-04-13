"use client";

import { Avatar, Badge, Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconCalendar, IconCheck, IconChevronDown, IconDots, IconPlus, IconX } from "@tabler/icons-react";
import { initialUsers } from "@/app/db/initialData";
import type { TaskWorkflowStep } from "../../workflowTypes";
import { DashedCircle } from "../shared/DashedCircle";
import { ChecklistItem } from "./ChecklistItem";

type WorkflowExpandedStepProps = {
	onSetAssignee: (stepId: string, userId: string | undefined) => void;
	onToggleChecklistItem: (stepId: string, checklistItemId: string) => void;
	onToggleDone: (stepId: string) => void;
	onToggleExpanded: (stepId: string) => void;
	step: TaskWorkflowStep;
};

export function WorkflowExpandedStep({ onSetAssignee, onToggleChecklistItem, onToggleDone, onToggleExpanded, step }: WorkflowExpandedStepProps) {
	const assignee = step.assigneeUserId
		? initialUsers.find((u) => u.id === step.assigneeUserId)
		: undefined;
	const assigneeName = assignee?.name ?? step.assigneeUserId ?? "Unassigned";

	return (
		<Box
			display="flex"
			flexDirection="column"
			style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", gap: 16, padding: "14px 0" }}
		>
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				onClick={() => onToggleExpanded(step.id)}
				style={{ cursor: "pointer" }}
			>
				<Box alignItems="center" display="flex" gap="12">
					<IconChevronDown color="var(--ax-colors-fg-secondary)" size={16} />
					{step.done ? (
						<Box
							alignItems="center"
							bg="bg.success.light"
							display="flex"
							justifyContent="center"
							onClick={(e) => { e.stopPropagation(); onToggleDone(step.id); }}
							rounded="full"
							style={{ cursor: "pointer", height: 24, width: 24 }}
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

			<Box display="flex" flexDirection="column" style={{ gap: 12, paddingLeft: 76 }}>
				<Box alignItems="center" display="flex" gap="10">
					<Text color="fg.tertiary" style={{ fontSize: 12, lineHeight: "16px", maxWidth: "none" }}>
						Assigned to
					</Text>
					<Text color="fg.default" style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}>
						{assigneeName}
					</Text>
				</Box>
				<Text color="fg.tertiary" style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}>
					{step.description ?? "Write description"}
				</Text>
				{step.checklist.map((item) => (
					<ChecklistItem
						key={item.id}
						checked={item.checked}
						label={item.label}
						onToggle={() => onToggleChecklistItem(step.id, item.id)}
					/>
				))}
				<Badge intent="neutral" w="fit">
					{step.badgeLabel ?? "Not Started"}
				</Badge>
				<Box alignItems="center" display="flex" gap="8" pt="4">
					<Button appearance="subtle" aria-label="Comment" icon={<IconPlus size={14} />} size="sm" style={{ height: 28, width: 28 }} />
					<Button appearance="subtle" aria-label="Delete" icon={<IconX size={14} />} size="sm" style={{ height: 28, width: 28 }} />
					<Button appearance="subtle" aria-label="More" icon={<IconDots size={14} />} size="sm" style={{ height: 28, width: 28 }} />
				</Box>
			</Box>
		</Box>
	);
}

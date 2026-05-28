"use client";

import { Avatar, Badge, Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconCalendar, IconChevronDown, IconDots, IconPlus, IconX } from "@tabler/icons-react";
import type { WorkflowStep } from "../../types";
import { DashedCircle } from "../shared/DashedCircle";
import { ChecklistItem } from "./ChecklistItem";

export function WorkflowExpandedStep({ step }: { step: WorkflowStep }) {
	return (
		<Box
			display="flex"
			flexDirection="column"
			style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", gap: 16, padding: "14px 0" }}
		>
			<Box alignItems="center" display="flex" justifyContent="space-between">
				<Box alignItems="center" display="flex" gap="12">
					<IconChevronDown color="var(--ax-colors-fg-secondary)" size={16} />
					<DashedCircle />
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
					<Avatar size="xs" src="/avatars/aamr-fakhry.png" style={{ height: 20, width: 20 }} />
					<Box
						alignItems="center"
						bg="bg.secondary"
						display="flex"
						justifyContent="center"
						rounded="full"
						style={{ height: 20, width: 20 }}
					>
						<Text fontSize="xs" style={{ fontSize: 10, lineHeight: "14px" }}>
							WM
						</Text>
					</Box>
				</Box>
			</Box>

			<Box display="flex" flexDirection="column" style={{ gap: 12, paddingLeft: 76 }}>
				<Box alignItems="center" display="flex" gap="10">
					<Text color="fg.tertiary" style={{ fontSize: 12, lineHeight: "16px", maxWidth: "none" }}>
						Assigned to
					</Text>
					<Text color="fg.default" style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}>
						{step.assignee ?? "Mary Anne"}
					</Text>
				</Box>
				<Text color="fg.tertiary" style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}>
					{step.description ?? "Write description"}
				</Text>
				{step.checklist?.map((item) => (
					<ChecklistItem key={item} label={item} />
				))}
				<Badge intent="neutral" style={{ fontSize: 12, height: 22, width: "fit-content" }}>
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

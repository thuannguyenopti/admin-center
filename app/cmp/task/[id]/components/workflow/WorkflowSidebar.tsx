"use client";

import { Badge, Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconChevronDown, IconChevronRight, IconDots, IconEye, IconPlus } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import type { WorkflowTemplate } from "../../types";
import type { TaskWorkflowState } from "../../workflowTypes";
import { WorkflowAvatarGroup } from "./WorkflowAvatarGroup";
import { WorkflowStepItem } from "./WorkflowStepItem";
import { WorkflowTab } from "./WorkflowTab";
import { InlineDate } from "./InlineDate";
import { WorkflowTemplateMenu } from "./WorkflowTemplateMenu";

type WorkflowSidebarProps = {
	filteredTemplates: WorkflowTemplate[];
	hasTaskContent: boolean;
	isAllDone: boolean;
	isMenuOpen: boolean;
	onMarkComplete: () => void;
	onRequestWorkflowChange: (workflowId: string) => void;
	onSetStepAssignee: (stepId: string, userId: string | undefined) => void;
	onToggleChecklistItem: (stepId: string, checklistItemId: string) => void;
	onToggleStepDone: (stepId: string) => void;
	onToggleStepExpanded: (stepId: string) => void;
	onToggleWorkflowMenu: () => void;
	onUndoComplete: () => void;
	onWorkflowSearchChange: (value: string) => void;
	progressPercent: number;
	searchValue: string;
	statusIntent: "neutral" | "information" | "success";
	statusLabel: string;
	workflowState: TaskWorkflowState;
	workflowTemplateName: string;
};

export function WorkflowSidebar({
	filteredTemplates,
	hasTaskContent,
	isAllDone,
	isMenuOpen,
	onMarkComplete,
	onRequestWorkflowChange,
	onSetStepAssignee,
	onToggleChecklistItem,
	onToggleStepDone,
	onToggleStepExpanded,
	onToggleWorkflowMenu,
	onUndoComplete,
	onWorkflowSearchChange,
	progressPercent,
	searchValue,
	statusIntent,
	statusLabel,
	workflowState,
	workflowTemplateName,
}: WorkflowSidebarProps) {
	const isStarter = workflowState.workflowTemplateId === "starter";
	const menuButtonRef = useRef<HTMLDivElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isMenuOpen) return;

		function handleClickOutside(event: MouseEvent) {
			if (
				menuRef.current &&
				menuButtonRef.current &&
				!menuRef.current.contains(event.target as Node) &&
				!menuButtonRef.current.contains(event.target as Node)
			) {
				onToggleWorkflowMenu();
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isMenuOpen, onToggleWorkflowMenu]);

	return (
		<Box bg="bg.default" display="flex" flexDirection="column" style={{ padding: "14px 16px 18px", position: "relative" }}>
			<Box display="flex" flexDirection="column" style={{ gap: 18 }}>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Box alignItems="center" display="flex" style={{ gap: 14 }}>
						<WorkflowAvatarGroup />
						<Box alignItems="center" display="flex" gap="8">
							<IconEye color="var(--ax-colors-fg-secondary)" size={18} />
							<Text color="fg.default" style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", maxWidth: "none" }}>
								8
							</Text>
						</Box>
					</Box>
					<Box alignItems="center" display="flex" gap="8">
						<Button
							appearance={isAllDone ? "subtle" : hasTaskContent ? "primary" : "default"}
							onClick={isAllDone ? onUndoComplete : onMarkComplete}
							size="sm"
							style={{ borderRadius: 6, height: 28, padding: "0 10px" }}
						>
							{isAllDone ? "Undo Complete" : hasTaskContent ? "Publish" : "Mark Complete"}
						</Button>
						<Button appearance="subtle" aria-label="More" icon={<IconDots size={16} />} size="sm" style={{ height: 28, width: 28 }} />
					</Box>
				</Box>

				<Box alignItems="center" display="flex" style={{ gap: 18 }}>
					<Badge intent={statusIntent}>
						{statusLabel}
					</Badge>
					<InlineDate label="Started • May 11" />
					<InlineDate label="Due • Jun 28" />
				</Box>

				<Box bg="bg.tertiary" rounded="full" style={{ height: 6, overflow: "hidden" }}>
					<Box
						bg={isAllDone ? "bg.success" : "bg.accent"}
						style={{ height: "100%", transition: "width 0.3s ease", width: `${progressPercent}%` }}
					/>
				</Box>
			</Box>

			<Box
				display="flex"
				flexDirection="column"
				mt="20"
				style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}
			>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Box alignItems="center" display="flex" style={{ gap: 18 }}>
						<WorkflowTab active>Workflow</WorkflowTab>
						<WorkflowTab>Comments</WorkflowTab>
						<WorkflowTab>Attachments</WorkflowTab>
					</Box>
					<Button appearance="subtle" aria-label="Collapse" icon={<IconChevronRight size={16} />} size="sm" style={{ height: 28, width: 28 }} />
				</Box>
			</Box>

			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", padding: "14px 0" }}
			>
				<div ref={menuButtonRef}>
					<Button
						appearance="subtle"
						onClick={onToggleWorkflowMenu}
						size="sm"
						style={{
							background: isStarter ? "var(--ax-colors-bg-secondary)" : "transparent",
							borderRadius: 8,
							height: 32,
							justifyContent: "flex-start",
							padding: isStarter ? "0 16px" : 0,
						}}
					>
						<Box alignItems="center" display="flex" gap="8">
							<Text color="fg.default" style={{ fontSize: 16, lineHeight: "24px", maxWidth: "none" }}>
								{workflowTemplateName}
							</Text>
							<IconChevronDown color="var(--ax-colors-fg-secondary)" size={16} />
						</Box>
					</Button>
				</div>
				<Button appearance="subtle" aria-label="Workflow menu" icon={<IconDots size={16} />} size="sm" style={{ height: 28, width: 28 }} />
			</Box>

			{isMenuOpen && (
				<WorkflowTemplateMenu
					onSearchChange={onWorkflowSearchChange}
					onSelect={onRequestWorkflowChange}
					ref={menuRef}
					searchValue={searchValue}
					templates={filteredTemplates}
				/>
			)}

			<Box display="flex" flexDirection="column">
				{workflowState.steps.map((step) => (
					<WorkflowStepItem
						key={step.id}
						onSetAssignee={onSetStepAssignee}
						onToggleChecklistItem={onToggleChecklistItem}
						onToggleDone={onToggleStepDone}
						onToggleExpanded={onToggleStepExpanded}
						step={step}
					/>
				))}
			</Box>

			<Button appearance="subtle" size="sm" style={{ justifyContent: "flex-start", marginTop: 10, paddingLeft: 0 }}>
				<Box alignItems="center" display="flex" gap="8">
					<IconPlus size={16} />
					<span>Add Step</span>
				</Box>
			</Button>
		</Box>
	);
}

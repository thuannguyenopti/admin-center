"use client";

import { Badge, Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconChevronDown, IconChevronRight, IconDots, IconEye, IconPlus } from "@tabler/icons-react";
import type { WorkflowTemplate } from "../../types";
import { WorkflowAvatarGroup } from "./WorkflowAvatarGroup";
import { WorkflowStepItem } from "./WorkflowStepItem";
import { WorkflowTab } from "./WorkflowTab";
import { InlineDate } from "./InlineDate";
import { WorkflowTemplateMenu } from "./WorkflowTemplateMenu";

type WorkflowSidebarProps = {
	filteredTemplates: WorkflowTemplate[];
	isMenuOpen: boolean;
	onRequestWorkflowChange: (workflowId: string) => void;
	onToggleWorkflowMenu: () => void;
	onWorkflowSearchChange: (value: string) => void;
	searchValue: string;
	workflow: WorkflowTemplate;
};

export function WorkflowSidebar({
	filteredTemplates,
	isMenuOpen,
	onRequestWorkflowChange,
	onToggleWorkflowMenu,
	onWorkflowSearchChange,
	searchValue,
	workflow,
}: WorkflowSidebarProps) {
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
						<Button appearance="default" size="sm" style={{ borderRadius: 6, height: 28, padding: "0 10px" }}>
							Mark Complete
						</Button>
						<Button appearance="subtle" aria-label="More" icon={<IconDots size={16} />} size="sm" style={{ height: 28, width: 28 }} />
					</Box>
				</Box>

				<Box alignItems="center" display="flex" style={{ gap: 18 }}>
					<Badge intent="information" style={{ fontSize: 12, height: 22, padding: "0 8px" }}>
						In Progress
					</Badge>
					<InlineDate label="Started • May 11" />
					<InlineDate label="Due • Jun 28" />
				</Box>

				<Box bg="bg.tertiary" rounded="full" style={{ height: 6, overflow: "hidden" }}>
					<Box bg="bg.accent" style={{ height: "100%", width: "70%" }} />
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
				<Button
					appearance="subtle"
					onClick={onToggleWorkflowMenu}
					size="sm"
					style={{
						background: workflow.id === "starter" ? "var(--ax-colors-bg-secondary)" : "transparent",
						borderRadius: 8,
						height: 32,
						justifyContent: "flex-start",
						padding: workflow.id === "starter" ? "0 16px" : 0,
					}}
				>
					<Box alignItems="center" display="flex" gap="8">
						<Text color="fg.default" style={{ fontSize: 16, lineHeight: "24px", maxWidth: "none" }}>
							{workflow.name}
						</Text>
						<IconChevronDown color="var(--ax-colors-fg-secondary)" size={16} />
					</Box>
				</Button>
				<Button appearance="subtle" aria-label="Workflow menu" icon={<IconDots size={16} />} size="sm" style={{ height: 28, width: 28 }} />
			</Box>

			{isMenuOpen && (
				<WorkflowTemplateMenu
					onSearchChange={onWorkflowSearchChange}
					onSelect={onRequestWorkflowChange}
					searchValue={searchValue}
					templates={filteredTemplates}
				/>
			)}

			<Box display="flex" flexDirection="column">
				{workflow.steps.map((step) => (
					<WorkflowStepItem key={step.id} step={step} />
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

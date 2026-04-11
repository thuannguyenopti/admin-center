"use client";

import type { ReactNode } from "react";
import { Avatar, Badge, Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { Text } from "@/app/components/Text";
import {
	IconCalendar,
	IconCheck,
	IconChevronDown,
	IconChevronRight,
	IconCopy,
	IconDots,
	IconEye,
	IconPlus,
	IconSearch,
	IconTag,
	IconX,
} from "@tabler/icons-react";
import SparklesIcon from "@/app/cmp/assets/sparkles 16.svg";
import type { WorkflowStep, WorkflowTemplate, WorkflowTemplateIconKind } from "../types";
import { ChecklistItem, DashedCircle, InlineDate } from "./shared/InlineDate";

function WorkflowAvatarGroup() {
	return (
		<Box alignItems="center" display="flex">
			<DashedCircle>
				<IconPlus size={12} stroke={1.8} />
			</DashedCircle>
			<Avatar size="sm" src="/avatars/aamr-fakhry.png" style={{ height: 24, marginLeft: 6, width: 24 }} />
			<Avatar size="sm" src="/avatars/benjamin-holme.svg" style={{ height: 24, marginLeft: -4, width: 24 }} />
			<Avatar size="sm" src="/avatars/stefan-svebeck.svg" style={{ height: 24, marginLeft: -4, width: 24 }} />
			<Box
				alignItems="center"
				bg="bg.secondary"
				display="flex"
				justifyContent="center"
				rounded="full"
				style={{ height: 24, marginLeft: -4, width: 24 }}
			>
				<Text style={{ fontSize: 12, fontWeight: 500, lineHeight: "16px", maxWidth: "none" }}>+3</Text>
			</Box>
		</Box>
	);
}

function WorkflowTemplateMenu({
	templates,
	onSearchChange,
	onSelect,
	searchValue,
}: {
	templates: WorkflowTemplate[];
	onSearchChange: (value: string) => void;
	onSelect: (workflowId: string) => void;
	searchValue: string;
}) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.default"
			rounded="lg"
			style={{
				boxShadow: "0 12px 32px rgba(22, 34, 51, 0.18)",
				left: 16,
				maxHeight: 560,
				overflow: "hidden",
				position: "absolute",
				right: 16,
				top: 164,
				zIndex: 30,
			}}
		>
			<Box display="flex" flexDirection="column" style={{ gap: 8, padding: 8 }}>
				<Input
					addonBefore={<IconSearch size={16} />}
					onChange={(event) => onSearchChange(event.target.value)}
					placeholder="Search by workflow Name"
					value={searchValue}
				/>
				<Box display="flex" flexDirection="column" overflow="auto" style={{ maxHeight: 470 }}>
					{templates.map((template) => (
						<button
							key={template.id}
							onClick={() => onSelect(template.id)}
							style={{
								alignItems: "flex-start",
								background: "transparent",
								border: "none",
								borderRadius: 8,
								cursor: "pointer",
								display: "flex",
								gap: 12,
								padding: "14px 12px",
								textAlign: "left",
								width: "100%",
							}}
						>
							<WorkflowTemplateIcon icon={template.icon} />
							<Box display="flex" flexDirection="column" style={{ gap: template.subtitle ? 4 : 0 }}>
								<Text color="fg.default" style={{ fontSize: 16, lineHeight: "24px", maxWidth: "none" }}>
									{template.name}
								</Text>
								{template.subtitle && (
									<Text color="fg.tertiary" style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}>
										{template.subtitle}
									</Text>
								)}
							</Box>
						</button>
					))}
				</Box>
			</Box>
		</Box>
	);
}

function WorkflowTemplateIcon({ icon }: { icon: WorkflowTemplateIconKind }) {
	const common = { color: "var(--ax-colors-fg-secondary)", size: 18 };

	switch (icon) {
		case "calendar":
			return <IconCalendar {...common} />;
		case "sparkles":
			return <SparklesIcon height={common.size} style={{ color: common.color }} width={common.size} />;
		case "tag":
			return <IconTag {...common} />;
		case "check":
			return <IconCheck {...common} />;
		case "copy":
		default:
			return <IconCopy {...common} />;
	}
}

function WorkflowTab({ active = false, children }: { active?: boolean; children: ReactNode }) {
	return (
		<Box
			style={{
				borderBottom: active ? "2px solid var(--ax-colors-border-accent)" : "2px solid transparent",
				paddingBottom: 10,
			}}
		>
			<Text
				color={active ? "fg.default" : "fg.tertiary"}
				style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", maxWidth: "none" }}
			>
				{children}
			</Text>
		</Box>
	);
}

function WorkflowStepItem({ step }: { step: WorkflowStep }) {
	if (step.expanded) {
		return <WorkflowExpandedStep step={step} />;
	}

	return (
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", padding: "14px 0" }}
			>
			<Box alignItems="center" display="flex" gap="12">
				<IconChevronRight size={16} color="var(--ax-colors-fg-secondary)" />
				{step.done ? (
					<Box
						alignItems="center"
						bg="bg.success.light"
						display="flex"
						justifyContent="center"
						rounded="full"
						style={{ height: 24, width: 24 }}
					>
						<IconCheck size={14} color="var(--ax-colors-fg-success-strong)" />
					</Box>
				) : (
					<DashedCircle />
				)}
				<Text color="fg.default" style={{ fontSize: 15, fontWeight: 500, lineHeight: "22px", maxWidth: "none" }}>{step.title}</Text>
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
				{step.showCalendarAction && <DashedCircle><IconCalendar size={12} /></DashedCircle>}
				<Avatar size="xs" src="/avatars/aamr-fakhry.png" style={{ height: 20, width: 20 }} />
				<Box
					alignItems="center"
					bg="bg.secondary"
					display="flex"
					justifyContent="center"
					rounded="full"
					style={{ height: 20, width: 20 }}
				>
					<Text fontSize="xs" style={{ fontSize: 10, lineHeight: "14px" }}>WM</Text>
				</Box>
			</Box>
		</Box>
	);
}

function WorkflowExpandedStep({ step }: { step: WorkflowStep }) {
	return (
			<Box
				display="flex"
				flexDirection="column"
				style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", gap: 16, padding: "14px 0" }}
			>
			<Box alignItems="center" display="flex" justifyContent="space-between">
				<Box alignItems="center" display="flex" gap="12">
					<IconChevronDown size={16} color="var(--ax-colors-fg-secondary)" />
					<DashedCircle />
					<Text color="fg.default" style={{ fontSize: 15, fontWeight: 500, lineHeight: "22px", maxWidth: "none" }}>{step.title}</Text>
				</Box>
				<Box alignItems="center" display="flex" gap="12">
					{step.showCalendarAction && <DashedCircle><IconCalendar size={12} /></DashedCircle>}
					<Avatar size="xs" src="/avatars/aamr-fakhry.png" style={{ height: 20, width: 20 }} />
					<Box
						alignItems="center"
						bg="bg.secondary"
						display="flex"
						justifyContent="center"
						rounded="full"
						style={{ height: 20, width: 20 }}
					>
						<Text fontSize="xs" style={{ fontSize: 10, lineHeight: "14px" }}>WM</Text>
					</Box>
				</Box>
			</Box>

				<Box display="flex" flexDirection="column" style={{ gap: 12, paddingLeft: 76 }}>
				<Box alignItems="center" display="flex" gap="10">
					<Text color="fg.tertiary" style={{ fontSize: 12, lineHeight: "16px", maxWidth: "none" }}>Assigned to</Text>
					<Text color="fg.default" style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}>{step.assignee ?? "Mary Anne"}</Text>
				</Box>
				<Text color="fg.tertiary" style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}>
					{step.description ?? "Write description"}
				</Text>
				{step.checklist?.map((item) => (
					<ChecklistItem key={item} label={item} />
				))}
				<Badge intent="neutral" style={{ fontSize: 12, height: 22, width: "fit-content" }}>{step.badgeLabel ?? "Not Started"}</Badge>
				<Box alignItems="center" display="flex" gap="8" pt="4">
					<Button appearance="subtle" aria-label="Comment" icon={<IconPlus size={14} />} size="sm" style={{ height: 28, width: 28 }} />
					<Button appearance="subtle" aria-label="Delete" icon={<IconX size={14} />} size="sm" style={{ height: 28, width: 28 }} />
					<Button appearance="subtle" aria-label="More" icon={<IconDots size={14} />} size="sm" style={{ height: 28, width: 28 }} />
				</Box>
			</Box>
		</Box>
	);
}

export function WorkflowSidebar({
	filteredTemplates,
	isMenuOpen,
	onRequestWorkflowChange,
	onToggleWorkflowMenu,
	onWorkflowSearchChange,
	searchValue,
	workflow,
}: {
	filteredTemplates: WorkflowTemplate[];
	isMenuOpen: boolean;
	onRequestWorkflowChange: (workflowId: string) => void;
	onToggleWorkflowMenu: () => void;
	onWorkflowSearchChange: (value: string) => void;
	searchValue: string;
	workflow: WorkflowTemplate;
}) {
	return (
		<Box bg="bg.default" display="flex" flexDirection="column" style={{ padding: "14px 16px 18px", position: "relative" }}>
			<Box display="flex" flexDirection="column" style={{ gap: 18 }}>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Box alignItems="center" display="flex" style={{ gap: 14 }}>
						<WorkflowAvatarGroup />
						<Box alignItems="center" display="flex" gap="8">
							<IconEye size={18} color="var(--ax-colors-fg-secondary)" />
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
					<Badge intent="information" style={{ fontSize: 12, height: 22, padding: "0 8px" }}>In Progress</Badge>
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
					<IconChevronDown size={16} color="var(--ax-colors-fg-secondary)" />
					</Box>
				</Button>
				<Button appearance="subtle" aria-label="Workflow menu" icon={<IconDots size={16} />} size="sm" style={{ height: 28, width: 28 }} />
			</Box>

			{isMenuOpen && (
				<WorkflowTemplateMenu
					templates={filteredTemplates}
					onSearchChange={onWorkflowSearchChange}
					onSelect={onRequestWorkflowChange}
					searchValue={searchValue}
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

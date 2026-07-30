"use client";

<<<<<<< HEAD
import { Badge, Box, Checkbox, Spinner, Tabs, TabsList, TabsTrigger, TabsContent } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import {
  IconXmark,
  IconCalendar,
  IconCircleCheckSolid,
  IconChevronRight,
  IconChevronDown,
  IconClock,
  IconComments,
  IconTrashCan,
  IconEllipsisStroke,
  IconUser,
  IconPlus,
  IconEye,
} from "@optiaxiom/icons";
import { useEffect, useRef, useState } from "react";
import { InitialsAvatar } from "./InitialsAvatar";
import { avatarFor } from "@/app/opal/im/lib/avatars";

type WorkflowStep = {
  id: string;
  number: number;
  title: string;
  hours: string;
  date: string;
  assignee: string;
  assigneeAvatar?: string;
  description?: string;
  done: boolean;
  loading?: boolean;
};

type ChecklistItem = { id: string; label: string; done: boolean };

type HeaderAvatar = { initials: string; src?: string };
=======
import {
	Badge,
	Box,
	Checkbox,
	Menu,
	MenuContent,
	MenuTrigger,
	Spinner,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {
	IconXmark,
	IconCalendar,
	IconCircleCheckSolid,
	IconChevronRight,
	IconChevronDown,
	IconClock,
	IconComments,
	IconTrashCan,
	IconEllipsisStroke,
	IconUser,
	IconPlus,
	IconEye,
} from "@optiaxiom/icons";
import {useEffect, useRef, useState} from "react";
import {InitialsAvatar} from "./InitialsAvatar";
import {avatarFor} from "@/app/opal/im/lib/avatars";

type WorkflowStep = {
	id: string;
	number: number;
	title: string;
	hours: string;
	date: string;
	assignee: string;
	assigneeAvatar?: string;
	description?: string;
	done: boolean;
	loading?: boolean;
};

type ChecklistItem = {id: string; label: string; done: boolean};

type HeaderAvatar = {initials: string; src?: string};
>>>>>>> origin/main

export type HeadlessTaskVariant = "newsletter-campaign" | "geo-qa";

type TaskData = {
<<<<<<< HEAD
  taskId: string;
  title: string;
  workflowName: string;
  startedLabel: string;
  dueLabel: string;
  headerAvatars: HeaderAvatar[];
  headerOverflow: number;
  steps: WorkflowStep[];
  expandedDefault: string;
  expandedDetail: {
    stepId: string;
    assignee: string;
    assigneeAvatar?: string;
    description: string;
    checklist: ChecklistItem[];
    statusLabel: string;
    plannedStart: string;
    plannedEnd: string;
    showPhases: boolean;
  };
};

const TASKS: Record<HeadlessTaskVariant, TaskData> = {
  "newsletter-campaign": {
    taskId: "TSK-4583",
    title: "Q4 Enterprise Sales Campaign",
    workflowName: "Newsletter Workflow",
    startedLabel: "Started • May 31",
    dueLabel: "Due • Jun 4",
    headerAvatars: [
      { initials: "MK" },
      { initials: "JP" },
      { initials: "SC" },
    ],
    headerOverflow: 3,
    steps: [
      { id: "1", number: 1, title: "Define target audience", hours: "40", date: "Nov 25", assignee: "MK", done: true },
      { id: "2", number: 2, title: "Develop core messaging", hours: "40", date: "Nov 25", assignee: "MK", done: false },
      { id: "3", number: 3, title: "Create campaign assets", hours: "40", date: "Nov 25", assignee: "MK", done: true },
      { id: "4", number: 4, title: "Set up campaign automation", hours: "8h", date: "Jul 30", assignee: "MW", done: false },
      { id: "5", number: 5, title: "Launch and monitor", hours: "40", date: "Nov 25", assignee: "MK", done: false },
    ],
    expandedDefault: "4",
    expandedDetail: {
      stepId: "4",
      assignee: "Matt Walsh",
      description:
        "Plan and facilitate a collaborative design workshop with key stakeholders to align on user needs and define the core user experience for the new multi-language product launch.",
      checklist: [
        { id: "c1", label: "Create UX Layout", done: false },
        { id: "c2", label: "Build Figma Prototype", done: false },
        { id: "c3", label: "Schedule workshop with all stakeholders", done: true },
        { id: "c4", label: "Prepare pre-read materials and agenda", done: true },
        { id: "c5", label: "Share workshop summary and action items", done: false },
      ],
      statusLabel: "Not Started",
      plannedStart: "Jul 18",
      plannedEnd: "Jul 30",
      showPhases: true,
    },
  },
  "geo-qa": {
    taskId: "TSK-4612",
    title: "Stride GEO Q&A — Discover the unknown",
    workflowName: "GEO Content Workflow",
    startedLabel: "Started • May 24",
    dueLabel: "Due • May 26",
    headerAvatars: [
      { initials: "FR", src: avatarFor("vau-frank") },
      { initials: "JC", src: avatarFor("jamie") },
      { initials: "MT", src: avatarFor("mary-anne") },
    ],
    headerOverflow: 0,
    steps: [
      { id: "1", number: 1, title: "Audit site and draft Q&A", hours: "3h", date: "May 25", assignee: "FR", assigneeAvatar: avatarFor("vau-frank"), done: true },
      { id: "2", number: 2, title: "Team review", hours: "1h", date: "May 26", assignee: "TM", done: false },
      { id: "3", number: 3, title: "Publish", hours: "10m", date: "May 26", assignee: "FR", assigneeAvatar: avatarFor("vau-frank"), description: "Publish to live", done: false },
    ],
    expandedDefault: "2",
    expandedDetail: {
      stepId: "2",
      assignee: "Digital Team",
      description:
        "Final review of the GEO Q&A article. Confirm Stride's adventurous voice, activity coverage, and team use cases before publishing to the answer-engine surface.",
      checklist: [
        { id: "c1", label: "Verify Stride voice on opening Q&As", done: true },
        { id: "c2", label: "Confirm Activities section coverage", done: true },
        { id: "c3", label: "Team approval", done: false },
      ],
      statusLabel: "In Review",
      plannedStart: "May 26",
      plannedEnd: "May 26",
      showPhases: false,
    },
  },
};

const Avatar = ({
  initials,
  src,
  size = 24,
  withBorder = true,
}: {
  initials: string;
  src?: string;
  size?: number;
  idx?: number;
  withBorder?: boolean;
}) => {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={initials}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: withBorder ? "2px solid var(--ax-colors-bg-default)" : "none",
          boxSizing: "border-box",
        }}
      />
    );
  }
  return <InitialsAvatar initials={initials} size={size} withBorder={withBorder} />;
};

function StatusBadge({ children, intent = "information" }: { children: React.ReactNode; intent?: "information" | "neutral" }) {
  const colors = intent === "information"
    ? { fg: "var(--ax-colors-fg-accent)", bg: "transparent" }
    : { fg: "var(--ax-colors-fg-secondary)", bg: "var(--ax-colors-bg-secondary)" };
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      rounded="sm"
      px="6"
      style={{
        fontSize: 12,
        fontWeight: 500,
        color: colors.fg,
        background: colors.bg,
        height: 22,
      }}
    >
      {children}
    </Box>
  );
}

function StepRow({
  step,
  expanded,
  onToggle,
  onToggleDone,
  children,
}: {
  step: WorkflowStep;
  expanded: boolean;
  onToggle: () => void;
  onToggleDone: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Box style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}>
      <Box
        display="flex"
        alignItems="center"
        gap="8"
        py="12"
        onClick={onToggle}
        style={{ cursor: "pointer" }}
      >
        <Box style={{ width: 14, flexShrink: 0, color: "var(--ax-colors-fg-tertiary)" }}>
          {expanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
        </Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          rounded="full"
          role="button"
          tabIndex={0}
          aria-label={step.done ? "Mark step as not done" : "Mark step as done"}
          aria-pressed={step.done}
          aria-busy={step.loading || undefined}
          onClick={(e) => {
            e.stopPropagation();
            if (step.loading) return;
            onToggleDone();
          }}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              if (step.loading) return;
              onToggleDone();
            }
          }}
          style={{
            width: 20,
            height: 20,
            flexShrink: 0,
            cursor: step.loading ? "default" : "pointer",
            border: step.done || step.loading ? "none" : "1.5px solid var(--ax-colors-border-default)",
          }}
        >
          {step.loading ? (
            <Spinner size="sm" />
          ) : step.done ? (
            <IconCircleCheckSolid size={20} color="var(--ax-colors-fg-success)" />
          ) : null}
        </Box>
        <Text
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 14,
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {step.number}. {step.title}
        </Text>
        <Text color="fg.secondary" style={{ fontSize: 12, width: 48, flexShrink: 0 }}>
          {step.date}
        </Text>
        <Avatar initials={step.assignee} src={step.assigneeAvatar} size={24} idx={step.number} withBorder={false} />
      </Box>
      {expanded && children && (
        <Box pb="16" style={{ paddingLeft: 36 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

function PhaseRow({ label }: { label: string }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap="8"
      py="12"
      style={{
        borderBottom: "1px solid var(--ax-colors-border-tertiary)",
        cursor: "pointer",
      }}
    >
      <Box style={{ width: 14, color: "var(--ax-colors-fg-tertiary)" }}>
        <IconChevronRight size={14} />
      </Box>
      <Box
        rounded="full"
        style={{
          width: 20,
          height: 20,
          border: "1.5px solid var(--ax-colors-border-default)",
        }}
      />
      <Text style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{label}</Text>
      <IconCalendar size={14} color="var(--ax-colors-fg-tertiary)" />
      <IconUser size={14} color="var(--ax-colors-fg-tertiary)" />
    </Box>
  );
}

export type TaskController = {
  task: (typeof TASKS)[HeadlessTaskVariant];
  variant: HeadlessTaskVariant;
  steps: WorkflowStep[];
  expandedStep: string;
  checklist: ChecklistItem[];
  toggleStep: (id: string) => void;
  toggleStepDone: (id: string) => void;
  toggleCheck: (id: string) => void;
  completeStep: (id: string) => void;
  allStepsDone: boolean;
=======
	taskId: string;
	title: string;
	workflowName: string;
	startedLabel: string;
	dueLabel: string;
	headerAvatars: HeaderAvatar[];
	headerOverflow: number;
	steps: WorkflowStep[];
	expandedDefault: string;
	expandedDetail: {
		stepId: string;
		assignee: string;
		assigneeAvatar?: string;
		description: string;
		checklist: ChecklistItem[];
		statusLabel: string;
		plannedStart: string;
		plannedEnd: string;
		showPhases: boolean;
	};
};

const TASKS: Record<HeadlessTaskVariant, TaskData> = {
	"newsletter-campaign": {
		taskId: "TSK-4583",
		title: "Q4 Enterprise Sales Campaign",
		workflowName: "Newsletter Workflow",
		startedLabel: "Started • May 31",
		dueLabel: "Due • Jun 4",
		headerAvatars: [{initials: "MK"}, {initials: "JP"}, {initials: "SC"}],
		headerOverflow: 3,
		steps: [
			{
				id: "1",
				number: 1,
				title: "Define target audience",
				hours: "40",
				date: "Nov 25",
				assignee: "MK",
				done: true,
			},
			{
				id: "2",
				number: 2,
				title: "Develop core messaging",
				hours: "40",
				date: "Nov 25",
				assignee: "MK",
				done: false,
			},
			{
				id: "3",
				number: 3,
				title: "Create campaign assets",
				hours: "40",
				date: "Nov 25",
				assignee: "MK",
				done: true,
			},
			{
				id: "4",
				number: 4,
				title: "Set up campaign automation",
				hours: "8h",
				date: "Jul 30",
				assignee: "MW",
				done: false,
			},
			{
				id: "5",
				number: 5,
				title: "Launch and monitor",
				hours: "40",
				date: "Nov 25",
				assignee: "MK",
				done: false,
			},
		],
		expandedDefault: "4",
		expandedDetail: {
			stepId: "4",
			assignee: "Matt Walsh",
			description:
				"Plan and facilitate a collaborative design workshop with key stakeholders to align on user needs and define the core user experience for the new multi-language product launch.",
			checklist: [
				{id: "c1", label: "Create UX Layout", done: false},
				{id: "c2", label: "Build Figma Prototype", done: false},
				{id: "c3", label: "Schedule workshop with all stakeholders", done: true},
				{id: "c4", label: "Prepare pre-read materials and agenda", done: true},
				{id: "c5", label: "Share workshop summary and action items", done: false},
			],
			statusLabel: "Not Started",
			plannedStart: "Jul 18",
			plannedEnd: "Jul 30",
			showPhases: true,
		},
	},
	"geo-qa": {
		taskId: "TSK-4612",
		title: "Stride GEO Q&A — Discover the unknown",
		workflowName: "GEO Content Workflow",
		startedLabel: "Started • May 24",
		dueLabel: "Due • May 26",
		headerAvatars: [
			{initials: "FR", src: avatarFor("vau-frank")},
			{initials: "JC", src: avatarFor("jamie")},
			{initials: "MT", src: avatarFor("mary-anne")},
		],
		headerOverflow: 0,
		steps: [
			{
				id: "1",
				number: 1,
				title: "Audit site and draft Q&A",
				hours: "3h",
				date: "May 25",
				assignee: "FR",
				assigneeAvatar: avatarFor("vau-frank"),
				done: true,
			},
			{
				id: "2",
				number: 2,
				title: "Team review",
				hours: "1h",
				date: "May 26",
				assignee: "TM",
				done: false,
			},
			{
				id: "3",
				number: 3,
				title: "Publish",
				hours: "10m",
				date: "May 26",
				assignee: "FR",
				assigneeAvatar: avatarFor("vau-frank"),
				description: "Publish to live",
				done: false,
			},
		],
		expandedDefault: "2",
		expandedDetail: {
			stepId: "2",
			assignee: "Digital Team",
			description:
				"Final review of the GEO Q&A article. Confirm Stride's adventurous voice, activity coverage, and team use cases before publishing to the answer-engine surface.",
			checklist: [
				{id: "c1", label: "Verify Stride voice on opening Q&As", done: true},
				{id: "c2", label: "Confirm Activities section coverage", done: true},
				{id: "c3", label: "Team approval", done: false},
			],
			statusLabel: "In Review",
			plannedStart: "May 26",
			plannedEnd: "May 26",
			showPhases: false,
		},
	},
};

const Avatar = ({
	initials,
	src,
	size = 24,
	withBorder = true,
}: {
	initials: string;
	src?: string;
	size?: number;
	idx?: number;
	withBorder?: boolean;
}) => {
	if (src) {
		return (
			// eslint-disable-next-line @next/next/no-img-element
			<img
				src={src}
				alt={initials}
				width={size}
				height={size}
				style={{
					width: size,
					height: size,
					borderRadius: "50%",
					objectFit: "cover",
					flexShrink: 0,
					border: withBorder ? "2px solid var(--ax-colors-bg-default)" : "none",
					boxSizing: "border-box",
				}}
			/>
		);
	}
	return <InitialsAvatar initials={initials} size={size} withBorder={withBorder} />;
};

function StatusBadge({
	children,
	intent = "information",
}: {
	children: React.ReactNode;
	intent?: "information" | "neutral";
}) {
	const colors =
		intent === "information"
			? {fg: "var(--ax-colors-fg-default)", bg: "transparent"}
			: {fg: "var(--ax-colors-fg-secondary)", bg: "var(--ax-colors-bg-secondary)"};
	return (
		<Box
			display="inline-flex"
			alignItems="center"
			rounded="sm"
			px="6"
			style={{
				fontSize: 12,
				fontWeight: 500,
				color: colors.fg,
				background: colors.bg,
				height: 22,
			}}
		>
			{children}
		</Box>
	);
}

function StepRow({
	step,
	expanded,
	onToggle,
	onToggleDone,
	children,
}: {
	step: WorkflowStep;
	expanded: boolean;
	onToggle: () => void;
	onToggleDone: () => void;
	children?: React.ReactNode;
}) {
	return (
		<Box style={{borderBottom: "1px solid var(--ax-colors-border-tertiary)"}}>
			<Box
				display="flex"
				alignItems="center"
				gap="8"
				py="12"
				onClick={onToggle}
				style={{cursor: "pointer"}}
			>
				<Box style={{width: 14, flexShrink: 0, color: "var(--ax-colors-fg-tertiary)"}}>
					{expanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
				</Box>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					rounded="full"
					role="button"
					tabIndex={0}
					aria-label={step.done ? "Mark step as not done" : "Mark step as done"}
					aria-pressed={step.done}
					aria-busy={step.loading || undefined}
					onClick={(e) => {
						e.stopPropagation();
						if (step.loading) return;
						onToggleDone();
					}}
					onKeyDown={(e) => {
						if (e.key === " " || e.key === "Enter") {
							e.preventDefault();
							e.stopPropagation();
							if (step.loading) return;
							onToggleDone();
						}
					}}
					style={{
						width: 20,
						height: 20,
						flexShrink: 0,
						cursor: step.loading ? "default" : "pointer",
						border:
							step.done || step.loading
								? "none"
								: "1.5px solid var(--ax-colors-border-default)",
					}}
				>
					{step.loading ? (
						<Spinner size="sm" />
					) : step.done ? (
						<IconCircleCheckSolid size={20} color="var(--ax-colors-fg-success)" />
					) : null}
				</Box>
				<Text
					style={{
						flex: 1,
						minWidth: 0,
						fontSize: 14,
						fontWeight: 500,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{step.number}. {step.title}
				</Text>
				<Text color="fg.secondary" style={{fontSize: 12, width: 48, flexShrink: 0}}>
					{step.date}
				</Text>
				<Avatar
					initials={step.assignee}
					src={step.assigneeAvatar}
					size={24}
					idx={step.number}
					withBorder={false}
				/>
			</Box>
			{expanded && children && (
				<Box pb="16" style={{paddingLeft: 36}}>
					{children}
				</Box>
			)}
		</Box>
	);
}

function PhaseRow({label}: {label: string}) {
	return (
		<Box
			display="flex"
			alignItems="center"
			gap="8"
			py="12"
			style={{
				borderBottom: "1px solid var(--ax-colors-border-tertiary)",
				cursor: "pointer",
			}}
		>
			<Box style={{width: 14, color: "var(--ax-colors-fg-tertiary)"}}>
				<IconChevronRight size={14} />
			</Box>
			<Box
				rounded="full"
				style={{
					width: 20,
					height: 20,
					border: "1.5px solid var(--ax-colors-border-default)",
				}}
			/>
			<Text style={{flex: 1, fontSize: 14, fontWeight: 500}}>{label}</Text>
			<IconCalendar size={14} color="var(--ax-colors-fg-tertiary)" />
			<IconUser size={14} color="var(--ax-colors-fg-tertiary)" />
		</Box>
	);
}

export type TaskController = {
	task: (typeof TASKS)[HeadlessTaskVariant];
	variant: HeadlessTaskVariant;
	steps: WorkflowStep[];
	expandedStep: string;
	checklist: ChecklistItem[];
	toggleStep: (id: string) => void;
	toggleStepDone: (id: string) => void;
	toggleCheck: (id: string) => void;
	completeStep: (id: string) => void;
	allStepsDone: boolean;
>>>>>>> origin/main
};

// Owns step + checklist + expansion state for a workflow task. Hoisted out of
// the panel so the parent can drive completeStep() even when the panel itself
// isn't currently mounted (e.g. approving from the action card before the
// task panel is opened).
export function useTaskController(
<<<<<<< HEAD
  variant: HeadlessTaskVariant = "newsletter-campaign",
  onStepComplete?: (stepId: string) => void,
): TaskController {
  const task = TASKS[variant];
  const [expandedStep, setExpandedStep] = useState<string>(task.expandedDefault);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(task.expandedDetail.checklist);
  const [steps, setSteps] = useState<WorkflowStep[]>(task.steps);
  const announcedDoneRef = useRef<Set<string>>(new Set());

  const completeStep = (id: string) => {
    setSteps((prev) => {
      const target = prev.find((s) => s.id === id);
      if (target?.done) return prev;
      const next = prev.map((s) => (s.id === id ? { ...s, done: true } : s));
      // Demo cascade: when "Team review" (step 2) flips to done in the geo-qa
      // variant, expand step 3, show its spinner for 1.5s, then mark "Publish" done.
      if (variant === "geo-qa" && id === "2") {
        setExpandedStep("3");
        setTimeout(() => {
          setSteps((curr) => curr.map((s) => (s.id === "3" ? { ...s, loading: true } : s)));
        }, 0);
        setTimeout(() => {
          setSteps((curr) => curr.map((s) => (s.id === "3" ? { ...s, loading: false, done: true } : s)));
        }, 1500);
      }
      return next;
    });
  };

  const toggleStep = (id: string) => setExpandedStep((prev) => (prev === id ? "" : id));
  const toggleCheck = (id: string) =>
    setChecklist((prev) => prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)));
  const toggleStepDone = (id: string) =>
    setSteps((prev) => {
      const wasDone = prev.find((s) => s.id === id)?.done ?? false;
      if (wasDone) {
        announcedDoneRef.current.delete(id);
        return prev.map((s) => (s.id === id ? { ...s, done: false } : s));
      }
      setTimeout(() => completeStep(id), 0);
      return prev;
    });

  // When all checklist items are done, auto-complete the step that owns them.
  useEffect(() => {
    if (variant !== "geo-qa") return;
    if (checklist.length === 0) return;
    if (!checklist.every((c) => c.done)) return;
    const checklistStepId = task.expandedDetail.stepId;
    const ownerStep = steps.find((s) => s.id === checklistStepId);
    if (ownerStep?.done) return;
    completeStep(checklistStepId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklist]);

  useEffect(() => {
    if (!onStepComplete) return;
    for (const s of steps) {
      if (s.done && !announcedDoneRef.current.has(s.id)) {
        announcedDoneRef.current.add(s.id);
        onStepComplete(s.id);
      }
    }
  }, [steps, onStepComplete]);

  const allStepsDone = steps.length > 0 && steps.every((s) => s.done);

  return {
    task,
    variant,
    steps,
    expandedStep,
    checklist,
    toggleStep,
    toggleStepDone,
    toggleCheck,
    completeStep,
    allStepsDone,
  };
}

export type HeadlessTaskPanelProps = {
  open: boolean;
  onClose: () => void;
  controller: TaskController;
};

export function HeadlessTaskPanel({ open, onClose, controller }: HeadlessTaskPanelProps) {
  const { task, steps, expandedStep, checklist, toggleStep, toggleStepDone, toggleCheck, allStepsDone } = controller;

  if (!open) return null;
  const { taskId, title, workflowName, dueLabel, expandedDetail, headerAvatars, headerOverflow } = task;

  return (
    <Box
      bg="bg.default"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        borderRight: "1px solid var(--ax-colors-border-secondary)",
      }}
    >
        {/* Header bar */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px="12"
          py="12"
          style={{ flexShrink: 0 }}
        >
          <Box display="flex" alignItems="center" gap="8">
            <Button appearance="subtle" size="md" icon={<IconXmark size={18} />} onClick={onClose} aria-label="Close" />
            <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0, margin: "0 4px" }} />
            <div style={{ display: "inline-flex", alignItems: "center" }}>
              {headerAvatars.map((a, i) => (
                <div key={i} style={{ marginLeft: i === 0 ? 0 : -6, display: "inline-flex" }}>
                  <Avatar initials={a.initials} src={a.src} size={24} idx={i} />
                </div>
              ))}
              {headerOverflow > 0 && (
                <div
                  style={{
                    width: 24,
                    height: 24,
                    minWidth: 24,
                    marginLeft: -6,
                    borderRadius: "50%",
                    background: "var(--ax-colors-bg-secondary)",
                    color: "var(--ax-colors-fg-secondary)",
                    fontSize: 10,
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid var(--ax-colors-bg-default)",
                    boxSizing: "border-box",
                  }}
                >
                  +{headerOverflow}
                </div>
              )}
            </div>
            <Box display="flex" alignItems="center" gap="4" style={{ color: "var(--ax-colors-fg-tertiary)" }}>
              <IconEye size={14} />
              <Text style={{ fontSize: 12 }}>8</Text>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap="8">
            {!allStepsDone && (
              <Button appearance="default" size="sm">Mark Complete</Button>
            )}
            <Button appearance="subtle" size="sm" icon={<IconEllipsisStroke size={14} />} aria-label="More" />
          </Box>
        </Box>

        {/* Status + dates */}
        <Box display="flex" alignItems="center" justifyContent="space-between" gap="16" px="20" pb="8" style={{ flexShrink: 0 }}>
          <Badge intent={allStepsDone ? "success" : "information"}>
            {allStepsDone ? "Completed" : "In Progress"}
          </Badge>
          <Box display="flex" alignItems="center" gap="6" style={{ color: "var(--ax-colors-fg-secondary)" }}>
            <IconCalendar size={14} />
            <Text style={{ fontSize: 12 }}>{dueLabel}</Text>
          </Box>
        </Box>

        {/* Title */}
        <Box px="20" pb="16" style={{ flexShrink: 0 }}>
          <Text style={{ fontSize: 18, fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>
            {taskId} - {title}
          </Text>
        </Box>

        {/* Tabs */}
        <Box px="20" style={{ flexShrink: 0 }}>
          <Tabs defaultValue="workflow">
            <TabsList>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
              <TabsTrigger value="brief">Brief</TabsTrigger>
            </TabsList>

            <TabsContent value="workflow">
              <Box pt="12" style={{ paddingBottom: 24 }}>
                {/* Workflow header */}
                <Box display="flex" alignItems="center" justifyContent="space-between" pb="8">
                  <Box display="flex" alignItems="center" gap="4" style={{ cursor: "pointer" }}>
                    <Text fontWeight="500" style={{ fontSize: 14 }}>{workflowName}</Text>
                    <IconChevronDown size={14} color="var(--ax-colors-fg-tertiary)" />
                  </Box>
                  <Button appearance="subtle" size="sm" icon={<IconEllipsisStroke size={14} />} aria-label="Workflow options" />
                </Box>

                {/* Steps */}
                {steps.map((step) => (
                  <StepRow
                    key={step.id}
                    step={step}
                    expanded={expandedStep === step.id}
                    onToggle={() => toggleStep(step.id)}
                    onToggleDone={() => toggleStepDone(step.id)}
                  >
                    {step.id !== expandedDetail.stepId && step.description && (
                      <Box pt="4">
                        <Box display="flex" alignItems="center" gap="8" pb="8">
                          <Text color="fg.tertiary" style={{ fontSize: 12 }}>Assigned to</Text>
                          <Avatar initials={step.assignee} src={step.assigneeAvatar} size={20} idx={step.number} withBorder={false} />
                          <Text style={{ fontSize: 13, fontWeight: 500 }}>{step.assignee === "FR" ? "Frank" : step.assignee}</Text>
                        </Box>
                        <Text color="fg.secondary" style={{ fontSize: 13, lineHeight: "20px" }}>
                          {step.description}
                        </Text>
                      </Box>
                    )}
                    {step.id === expandedDetail.stepId && (
                      <Box display="flex" flexDirection="column" gap="12" pt="4">
                        {/* Assigned to */}
                        <Box display="flex" alignItems="center" gap="8">
                          <Text color="fg.tertiary" style={{ fontSize: 12 }}>Assigned to</Text>
                          <Avatar initials={step.assignee} src={expandedDetail.assigneeAvatar ?? step.assigneeAvatar} size={20} idx={step.number} withBorder={false} />
                          <Text style={{ fontSize: 13, fontWeight: 500 }}>{expandedDetail.assignee}</Text>
                        </Box>

                        {/* Description */}
                        <Text color="fg.secondary" style={{ fontSize: 13, lineHeight: "20px" }}>
                          {expandedDetail.description}
                        </Text>

                        {/* Checklist */}
                        <Box display="flex" flexDirection="column" gap="8">
                          {checklist.map((c) => (
                            <Checkbox
                              key={c.id}
                              checked={c.done}
                              onCheckedChange={() => toggleCheck(c.id)}
                            >
                              <Text
                                color={c.done ? "fg.tertiary" : "fg.default"}
                                style={{
                                  fontSize: 13,
                                  lineHeight: "20px",
                                  maxWidth: "none",
                                  textDecoration: c.done ? "line-through" : "none",
                                }}
                              >
                                {c.label}
                              </Text>
                            </Checkbox>
                          ))}
                        </Box>

                        {/* Action row */}
                        <Box display="flex" alignItems="center" justifyContent="space-between" pt="4">
                          <StatusBadge intent="neutral">{expandedDetail.statusLabel}</StatusBadge>
                          <Box display="flex" alignItems="center" gap="4">
                            <Button appearance="subtle" size="sm" icon={<IconClock size={14} />} aria-label="Time" />
                            <Button appearance="subtle" size="sm" icon={<IconComments size={14} />} aria-label="Comments" />
                            <Button appearance="subtle" size="sm" icon={<IconTrashCan size={14} />} aria-label="Delete" />
                            <Button appearance="subtle" size="sm" icon={<IconEllipsisStroke size={14} />} aria-label="More" />
                          </Box>
                        </Box>

                        {/* Phases */}
                        {expandedDetail.showPhases && (
                          <Box pt="4">
                            <PhaseRow label="Phase 1" />
                            <PhaseRow label="Phase 2" />
                          </Box>
                        )}
                      </Box>
                    )}
                  </StepRow>
                ))}

                {/* Add Step */}
                <Box display="flex" alignItems="center" gap="6" pt="12" style={{ color: "var(--ax-colors-fg-tertiary)", cursor: "pointer" }}>
                  <IconPlus size={14} />
                  <Text style={{ fontSize: 13, fontWeight: 500 }}>Add Step</Text>
                </Box>
              </Box>
            </TabsContent>

            <TabsContent value="comments">
              <Box pt="24" pb="24">
                <Text color="fg.tertiary" style={{ fontSize: 13 }}>No comments yet.</Text>
              </Box>
            </TabsContent>

            <TabsContent value="attachments">
              <Box pt="24" pb="24">
                <Text color="fg.tertiary" style={{ fontSize: 13 }}>No attachments.</Text>
              </Box>
            </TabsContent>

            <TabsContent value="brief">
              <Box pt="24" pb="24">
                <Text color="fg.tertiary" style={{ fontSize: 13 }}>Brief content goes here.</Text>
              </Box>
            </TabsContent>
          </Tabs>
        </Box>
    </Box>
  );
=======
	variant: HeadlessTaskVariant = "newsletter-campaign",
	onStepComplete?: (stepId: string) => void
): TaskController {
	const task = TASKS[variant];
	const [expandedStep, setExpandedStep] = useState<string>(task.expandedDefault);
	const [checklist, setChecklist] = useState<ChecklistItem[]>(task.expandedDetail.checklist);
	const [steps, setSteps] = useState<WorkflowStep[]>(task.steps);
	const announcedDoneRef = useRef<Set<string>>(new Set());

	const completeStep = (id: string) => {
		setSteps((prev) => {
			const target = prev.find((s) => s.id === id);
			if (target?.done) return prev;
			const next = prev.map((s) => (s.id === id ? {...s, done: true} : s));
			// Demo cascade: when "Team review" (step 2) flips to done in the geo-qa
			// variant, expand step 3, show its spinner for 1.5s, then mark "Publish" done.
			if (variant === "geo-qa" && id === "2") {
				setExpandedStep("3");
				setTimeout(() => {
					setSteps((curr) => curr.map((s) => (s.id === "3" ? {...s, loading: true} : s)));
				}, 0);
				setTimeout(() => {
					setSteps((curr) =>
						curr.map((s) => (s.id === "3" ? {...s, loading: false, done: true} : s))
					);
				}, 1500);
			}
			return next;
		});
	};

	const toggleStep = (id: string) => setExpandedStep((prev) => (prev === id ? "" : id));
	const toggleCheck = (id: string) =>
		setChecklist((prev) => prev.map((c) => (c.id === id ? {...c, done: !c.done} : c)));
	const toggleStepDone = (id: string) =>
		setSteps((prev) => {
			const wasDone = prev.find((s) => s.id === id)?.done ?? false;
			if (wasDone) {
				announcedDoneRef.current.delete(id);
				return prev.map((s) => (s.id === id ? {...s, done: false} : s));
			}
			setTimeout(() => completeStep(id), 0);
			return prev;
		});

	// When all checklist items are done, auto-complete the step that owns them.
	useEffect(() => {
		if (variant !== "geo-qa") return;
		if (checklist.length === 0) return;
		if (!checklist.every((c) => c.done)) return;
		const checklistStepId = task.expandedDetail.stepId;
		const ownerStep = steps.find((s) => s.id === checklistStepId);
		if (ownerStep?.done) return;
		completeStep(checklistStepId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [checklist]);

	useEffect(() => {
		if (!onStepComplete) return;
		for (const s of steps) {
			if (s.done && !announcedDoneRef.current.has(s.id)) {
				announcedDoneRef.current.add(s.id);
				onStepComplete(s.id);
			}
		}
	}, [steps, onStepComplete]);

	const allStepsDone = steps.length > 0 && steps.every((s) => s.done);

	return {
		task,
		variant,
		steps,
		expandedStep,
		checklist,
		toggleStep,
		toggleStepDone,
		toggleCheck,
		completeStep,
		allStepsDone,
	};
}

export type HeadlessTaskPanelProps = {
	open: boolean;
	onClose: () => void;
	controller: TaskController;
};

export function HeadlessTaskPanel({open, onClose, controller}: HeadlessTaskPanelProps) {
	const {
		task,
		steps,
		expandedStep,
		checklist,
		toggleStep,
		toggleStepDone,
		toggleCheck,
		allStepsDone,
	} = controller;

	if (!open) return null;
	const {taskId, title, workflowName, dueLabel, expandedDetail, headerAvatars, headerOverflow} =
		task;

	return (
		<Box
			bg="bg.default"
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				overflow: "auto",
				borderRight: "1px solid var(--ax-colors-border-secondary)",
			}}
		>
			{/* Header bar */}
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				px="12"
				py="12"
				style={{flexShrink: 0}}
			>
				<Box display="flex" alignItems="center" gap="8">
					<Button
						appearance="subtle"
						size="md"
						icon={<IconXmark size={18} />}
						onClick={onClose}
						aria-label="Close"
					/>
					<Box
						style={{
							width: 1,
							height: 16,
							background: "var(--ax-colors-border-secondary)",
							flexShrink: 0,
							margin: "0 4px",
						}}
					/>
					<div style={{display: "inline-flex", alignItems: "center"}}>
						{headerAvatars.map((a, i) => (
							<div
								key={i}
								style={{marginLeft: i === 0 ? 0 : -6, display: "inline-flex"}}
							>
								<Avatar initials={a.initials} src={a.src} size={24} idx={i} />
							</div>
						))}
						{headerOverflow > 0 && (
							<div
								style={{
									width: 24,
									height: 24,
									minWidth: 24,
									marginLeft: -6,
									borderRadius: "50%",
									background: "var(--ax-colors-bg-secondary)",
									color: "var(--ax-colors-fg-secondary)",
									fontSize: 10,
									fontWeight: 600,
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									border: "2px solid var(--ax-colors-bg-default)",
									boxSizing: "border-box",
								}}
							>
								+{headerOverflow}
							</div>
						)}
					</div>
					<Box
						display="flex"
						alignItems="center"
						gap="4"
						style={{color: "var(--ax-colors-fg-tertiary)"}}
					>
						<IconEye size={14} />
						<Text style={{fontSize: 12}}>8</Text>
					</Box>
				</Box>

				<Box display="flex" alignItems="center" gap="8">
					<Menu
						options={
							allStepsDone
								? []
								: [
										{
											label: "Mark Complete",
											addon: <IconCircleCheckSolid size={14} />,
											execute: () => controller.completeStep("2"),
										},
									]
						}
					>
						<MenuTrigger asChild>
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconEllipsisStroke size={14} />}
								aria-label="More"
							/>
						</MenuTrigger>
						<MenuContent align="end" />
					</Menu>
				</Box>
			</Box>

			{/* Status + dates */}
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				gap="16"
				px="20"
				pb="8"
				style={{flexShrink: 0}}
			>
				<Badge intent={allStepsDone ? "success" : "information"}>
					{allStepsDone ? "Completed" : "In Progress"}
				</Badge>
				<Box
					display="flex"
					alignItems="center"
					gap="6"
					style={{color: "var(--ax-colors-fg-secondary)"}}
				>
					<IconCalendar size={14} />
					<Text style={{fontSize: 12}}>{dueLabel}</Text>
				</Box>
			</Box>

			{/* Title */}
			<Box px="20" pb="16" style={{flexShrink: 0}}>
				<Text style={{fontSize: 18, fontWeight: 600, color: "var(--ax-colors-fg-default)"}}>
					{taskId} - {title}
				</Text>
			</Box>

			{/* Tabs */}
			<Box px="20" style={{flexShrink: 0}}>
				<Tabs defaultValue="workflow">
					<TabsList>
						<TabsTrigger value="workflow">Workflow</TabsTrigger>
						<TabsTrigger value="comments">Comments</TabsTrigger>
						<TabsTrigger value="attachments">Attachments</TabsTrigger>
						<TabsTrigger value="brief">Brief</TabsTrigger>
					</TabsList>

					<TabsContent value="workflow">
						<Box pt="12" style={{paddingBottom: 24}}>
							{/* Workflow header */}
							<Box
								display="flex"
								alignItems="center"
								justifyContent="space-between"
								pb="8"
							>
								<Box
									display="flex"
									alignItems="center"
									gap="4"
									style={{cursor: "pointer"}}
								>
									<Text fontWeight="500" style={{fontSize: 14}}>
										{workflowName}
									</Text>
									<IconChevronDown
										size={14}
										color="var(--ax-colors-fg-tertiary)"
									/>
								</Box>
								<Button
									appearance="subtle"
									size="sm"
									icon={<IconEllipsisStroke size={14} />}
									aria-label="Workflow options"
								/>
							</Box>

							{/* Steps */}
							{steps.map((step) => (
								<StepRow
									key={step.id}
									step={step}
									expanded={expandedStep === step.id}
									onToggle={() => toggleStep(step.id)}
									onToggleDone={() => toggleStepDone(step.id)}
								>
									{step.id !== expandedDetail.stepId && step.description && (
										<Box pt="4">
											<Box display="flex" alignItems="center" gap="8" pb="8">
												<Text color="fg.tertiary" style={{fontSize: 12}}>
													Assigned to
												</Text>
												<Avatar
													initials={step.assignee}
													src={step.assigneeAvatar}
													size={20}
													idx={step.number}
													withBorder={false}
												/>
												<Text style={{fontSize: 13, fontWeight: 500}}>
													{step.assignee === "FR"
														? "Frank"
														: step.assignee}
												</Text>
											</Box>
											<Text
												color="fg.secondary"
												style={{fontSize: 13, lineHeight: "20px"}}
											>
												{step.description}
											</Text>
										</Box>
									)}
									{step.id === expandedDetail.stepId && (
										<Box display="flex" flexDirection="column" gap="12" pt="4">
											{/* Assigned to */}
											<Box display="flex" alignItems="center" gap="8">
												<Text color="fg.tertiary" style={{fontSize: 12}}>
													Assigned to
												</Text>
												<Avatar
													initials={step.assignee}
													src={
														expandedDetail.assigneeAvatar ??
														step.assigneeAvatar
													}
													size={20}
													idx={step.number}
													withBorder={false}
												/>
												<Text style={{fontSize: 13, fontWeight: 500}}>
													{expandedDetail.assignee}
												</Text>
											</Box>

											{/* Description */}
											<Text
												color="fg.secondary"
												style={{fontSize: 13, lineHeight: "20px"}}
											>
												{expandedDetail.description}
											</Text>

											{/* Checklist */}
											<Box display="flex" flexDirection="column" gap="8">
												{checklist.map((c) => (
													<Checkbox
														key={c.id}
														checked={c.done}
														onCheckedChange={() => toggleCheck(c.id)}
													>
														<Text
															color={
																c.done
																	? "fg.tertiary"
																	: "fg.default"
															}
															style={{
																fontSize: 13,
																lineHeight: "20px",
																maxWidth: "none",
																textDecoration: c.done
																	? "line-through"
																	: "none",
															}}
														>
															{c.label}
														</Text>
													</Checkbox>
												))}
											</Box>

											{/* Action row */}
											<Box
												display="flex"
												alignItems="center"
												justifyContent="space-between"
												pt="4"
											>
												<StatusBadge intent="neutral">
													{expandedDetail.statusLabel}
												</StatusBadge>
												<Box display="flex" alignItems="center" gap="4">
													<Button
														appearance="subtle"
														size="sm"
														icon={<IconClock size={14} />}
														aria-label="Time"
													/>
													<Button
														appearance="subtle"
														size="sm"
														icon={<IconComments size={14} />}
														aria-label="Comments"
													/>
													<Button
														appearance="subtle"
														size="sm"
														icon={<IconTrashCan size={14} />}
														aria-label="Delete"
													/>
													<Button
														appearance="subtle"
														size="sm"
														icon={<IconEllipsisStroke size={14} />}
														aria-label="More"
													/>
												</Box>
											</Box>

											{/* Phases */}
											{expandedDetail.showPhases && (
												<Box pt="4">
													<PhaseRow label="Phase 1" />
													<PhaseRow label="Phase 2" />
												</Box>
											)}
										</Box>
									)}
								</StepRow>
							))}

							{/* Add Step */}
							<Box
								display="flex"
								alignItems="center"
								gap="6"
								pt="12"
								style={{color: "var(--ax-colors-fg-tertiary)", cursor: "pointer"}}
							>
								<IconPlus size={14} />
								<Text style={{fontSize: 13, fontWeight: 500}}>Add Step</Text>
							</Box>
						</Box>
					</TabsContent>

					<TabsContent value="comments">
						<Box pt="24" pb="24">
							<Text color="fg.tertiary" style={{fontSize: 13}}>
								No comments yet.
							</Text>
						</Box>
					</TabsContent>

					<TabsContent value="attachments">
						<Box pt="24" pb="24">
							<Text color="fg.tertiary" style={{fontSize: 13}}>
								No attachments.
							</Text>
						</Box>
					</TabsContent>

					<TabsContent value="brief">
						<Box pt="24" pb="24">
							<Text color="fg.tertiary" style={{fontSize: 13}}>
								Brief content goes here.
							</Text>
						</Box>
					</TabsContent>
				</Tabs>
			</Box>
		</Box>
	);
>>>>>>> origin/main
}

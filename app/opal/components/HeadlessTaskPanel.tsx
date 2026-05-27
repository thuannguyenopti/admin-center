"use client";

import { Box, Tabs, TabsList, TabsTrigger, TabsContent } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import {
  IconXmark,
  IconCalendar,
  IconCheck,
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
import { useState } from "react";
import { InitialsAvatar } from "./InitialsAvatar";

type WorkflowStep = {
  id: string;
  number: number;
  title: string;
  hours: string;
  date: string;
  assignee: string;
  done: boolean;
};

type ChecklistItem = { id: string; label: string; done: boolean };

export type HeadlessTaskVariant = "newsletter-campaign" | "geo-qa";

type TaskData = {
  taskId: string;
  title: string;
  workflowName: string;
  startedLabel: string;
  dueLabel: string;
  steps: WorkflowStep[];
  expandedDefault: string;
  expandedDetail: {
    stepId: string;
    assignee: string;
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
    steps: [
      { id: "1", number: 1, title: "Audit site and draft Q&A", hours: "3h", date: "May 25", assignee: "FR", done: true },
      { id: "2", number: 2, title: "Team review and publish", hours: "1h", date: "May 26", assignee: "TM", done: false },
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
        { id: "c4", label: "Publish to live", done: false },
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
  size = 24,
  withBorder = true,
}: {
  initials: string;
  size?: number;
  idx?: number;
  withBorder?: boolean;
}) => <InitialsAvatar initials={initials} size={size} withBorder={withBorder} />;

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
  children,
}: {
  step: WorkflowStep;
  expanded: boolean;
  onToggle: () => void;
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
          style={{
            width: 20,
            height: 20,
            flexShrink: 0,
            border: step.done ? "none" : "1.5px solid var(--ax-colors-border-default)",
          }}
        >
          {step.done && (
            <IconCircleCheckSolid size={20} color="var(--ax-colors-fg-success)" />
          )}
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
        <Avatar initials={step.assignee} size={24} idx={step.number} withBorder={false} />
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

export type HeadlessTaskPanelProps = {
  open: boolean;
  onClose: () => void;
  variant?: HeadlessTaskVariant;
};

export function HeadlessTaskPanel({
  open,
  onClose,
  variant = "newsletter-campaign",
}: HeadlessTaskPanelProps) {
  const task = TASKS[variant];
  const [expandedStep, setExpandedStep] = useState<string>(task.expandedDefault);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(task.expandedDetail.checklist);

  const toggleStep = (id: string) => setExpandedStep((prev) => (prev === id ? "" : id));
  const toggleCheck = (id: string) =>
    setChecklist((prev) => prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)));

  if (!open) return null;
  const { taskId, title, workflowName, startedLabel, dueLabel, steps, expandedDetail } = task;

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
              <Avatar initials="MK" size={24} idx={0} />
              <div style={{ marginLeft: -6, display: "inline-flex" }}><Avatar initials="JP" size={24} idx={1} /></div>
              <div style={{ marginLeft: -6, display: "inline-flex" }}><Avatar initials="SC" size={24} idx={2} /></div>
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
                +3
              </div>
            </div>
            <Box display="flex" alignItems="center" gap="4" style={{ color: "var(--ax-colors-fg-tertiary)" }}>
              <IconEye size={14} />
              <Text style={{ fontSize: 12 }}>8</Text>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap="8">
            <Button appearance="default" size="sm">Mark Complete</Button>
            <Button appearance="subtle" size="sm" icon={<IconEllipsisStroke size={14} />} aria-label="More" />
          </Box>
        </Box>

        {/* Status + dates */}
        <Box display="flex" alignItems="center" gap="16" px="20" pb="8" style={{ flexShrink: 0 }}>
          <StatusBadge intent="information">In Progress</StatusBadge>
          <Box display="flex" alignItems="center" gap="6" style={{ color: "var(--ax-colors-fg-secondary)" }}>
            <IconCalendar size={14} />
            <Text style={{ fontSize: 12 }}>{startedLabel}</Text>
          </Box>
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
                  >
                    {step.id === expandedDetail.stepId && (
                      <Box display="flex" flexDirection="column" gap="12" pt="4">
                        {/* Assigned to */}
                        <Box display="flex" alignItems="center" gap="8">
                          <Text color="fg.tertiary" style={{ fontSize: 12 }}>Assigned to</Text>
                          <Avatar initials={step.assignee} size={20} idx={step.number} withBorder={false} />
                          <Text style={{ fontSize: 13, fontWeight: 500 }}>{expandedDetail.assignee}</Text>
                        </Box>

                        {/* Description */}
                        <Text color="fg.secondary" style={{ fontSize: 13, lineHeight: "20px" }}>
                          {expandedDetail.description}
                        </Text>

                        {/* Checklist */}
                        <Box display="flex" flexDirection="column" gap="8">
                          {checklist.map((c) => (
                            <Box
                              key={c.id}
                              display="flex"
                              alignItems="center"
                              gap="8"
                              onClick={() => toggleCheck(c.id)}
                              style={{ cursor: "pointer" }}
                            >
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: 4,
                                  flexShrink: 0,
                                  background: c.done ? "var(--ax-colors-bg-success)" : "transparent",
                                  border: c.done ? "none" : "1.5px solid var(--ax-colors-border-default)",
                                }}
                              >
                                {c.done && <IconCheck size={12} color="white" />}
                              </Box>
                              <Text
                                style={{
                                  fontSize: 13,
                                  color: c.done ? "var(--ax-colors-fg-tertiary)" : "var(--ax-colors-fg-default)",
                                  textDecoration: c.done ? "line-through" : "none",
                                }}
                              >
                                {c.label}
                              </Text>
                            </Box>
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
}

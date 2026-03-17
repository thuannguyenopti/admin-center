"use client";

import {
    Box,
    Heading,
    Text,
    Button,
    Badge,
    Avatar,
    LabelMenuButton,
    Disclosure,
    DisclosureTrigger,
    DisclosureContent,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    Link,
    Menu,
    MenuTrigger,
    MenuContent,
    Checkbox,
    Spinner,
    Tooltip,
} from "@optiaxiom/react";
import {
    HoverCard,
    HoverCardTrigger,
    HoverCardContent,
} from "@optiaxiom/react/unstable";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { PageTitle } from "@/app/components/PageTitle";
import {
    IconChevronDown,
    IconChevronRight,
    IconDownload,
    IconRefresh,
    IconHelp,
} from "@tabler/icons-react";
import {
    IconCircleCheck,
    IconCircleExclamation,
    IconTriangleExclamation,
    IconCirclePause,
    IconAgent,
    IconCodeBranch,
    IconColumns3,
} from "@optimizely/axiom-icons";
import { Input } from "@/app/components/Input";
import { useState, Fragment, useRef, useEffect } from "react";
import { TableColumnConfig, ColumnConfig } from "@/app/components/TableColumnConfig";
import DetailsPanel from "./DetailsPanel";

// Status icon mapping
const StatusIcon = ({ status, agentName, guardrailStatus, mode }: { status: string; agentName?: string; guardrailStatus?: string; mode?: string }) => {
    const iconProps = { size: 20 };

    // Determine the status to use for the tooltip description
    const tooltipStatus = (guardrailStatus && (guardrailStatus === "Failed" || guardrailStatus === "Terminated" || guardrailStatus === "Review Needed"))
        ? guardrailStatus
        : (status === "Failed" || status === "Terminated" || status === "Review Needed" ? status : null);

    let icon = null;

    // Show warning icon if the agent is marked for review or specifically for Success Plan Generator
    if ((agentName === "Success Plan Generator" && status === "Completed") || guardrailStatus === "Review Needed") {
        icon = <IconTriangleExclamation {...iconProps} color="#F79009" />;
    } else {
        switch (status) {
            case "Completed":
                icon = <IconCircleCheck {...iconProps} color="#17B26A" />;
                break;
            case "In Progress":
                icon = <Spinner style={{ width: 16, height: 16 }} />;
                break;
            case "Failed":
                icon = <IconCircleExclamation {...iconProps} color="#D92D20" />;
                break;
            case "Terminated":
                icon = <IconCirclePause {...iconProps} color="#D92D20" />;
                break;
            case "Paused":
                icon = <IconCirclePause {...iconProps} color="#667085" />;
                break;
            default:
                break;
        }
    }

    if (!icon) return null;

    if (tooltipStatus) {
        return (
            <HoverCard openDelay={200}>
                <HoverCardTrigger asChild>
                    <Box display="flex" style={{ cursor: 'help' }}>
                        {icon}
                    </Box>
                </HoverCardTrigger>
                <HoverCardContent style={{ maxWidth: "280px" }}>
                    <GuardrailHoverCardContent status={tooltipStatus} mode={mode} />
                </HoverCardContent>
            </HoverCard>
        );
    }

    return icon;
};


const GuardrailHoverCardContent = ({ status, mode, isHelp }: { status?: string, mode?: string, isHelp?: boolean }) => {
    if (isHelp) {
        return (
            <Box display="flex" flexDirection="column" gap="8">
                <Box display="flex" flexDirection="column" gap="4">
                    <Text fontSize="md" fontWeight="600">Guardrails Status</Text>
                    <Text fontSize="sm" color="fg.secondary">
                        Execution status based on the agent’s guardrails.
                    </Text>
                </Box>
                <Link
                    href="https://support.optimizely.com/hc/en-us/articles/39333562134413-Create-specialized-agents"
                    target="_blank"
                    fontSize="sm"
                    color="fg.accent"
                >
                    Learn more
                </Link>
            </Box>
        );
    }

    let content = "";
    if (status === "Passed") content = "This execution operated within the current guardrails for this agent.";
    if (status === "Failed") content = "The agent did not complete its execution due to a system or runtime failure.";
    if (status === "Terminated") content = "The execution was automatically stopped after anomalous tool call behavior was detected.";
    if (status === "Review Needed") content = "Anomalous tool call behavior was detected in Observer mode and flagged for review.";

    if (!content) return null;

    return (
        <Box display="flex" flexDirection="column" gap="8">
            <Box display="flex" flexDirection="column" gap="4">
                <Text fontSize="md" fontWeight="600">Guardrails Status: {status}</Text>
                <Text fontSize="sm" color="fg.secondary">{content}</Text>
                {mode && (
                    <Text fontSize="sm" color="fg.secondary" mt="4">
                        Agent Mode: <strong>{mode}</strong>
                    </Text>
                )}
            </Box>
            <Link
                href="https://support.optimizely.com/hc/en-us/articles/39333562134413-Create-specialized-agents"
                target="_blank"
                fontSize="sm"
                color="fg.accent"
            >
                Learn more
            </Link>
        </Box>
    );
};


const QualityScoreHoverCardContent = ({ score, baseScore, isHelp, isPassed: isPassedProp }: { score?: string, baseScore?: string, isHelp?: boolean, isPassed?: boolean }) => {
    if (isHelp) {
        return (
            <Box display="flex" flexDirection="column" gap="8">
                <Box display="flex" flexDirection="column" gap="4">
                    <Text fontSize="md" fontWeight="600">Evaluation Score</Text>
                    <Text fontSize="sm" color="fg.secondary">
                        An LLM-assessed score measuring how well the output meets the agent builder’s quality standards and examples.
                    </Text>
                </Box>
                <Link
                    href="https://support.optimizely.com/hc/en-us/articles/39333562134413-Create-specialized-agents#h_01KACEGNBW103Q3S521AN6YA5R"
                    target="_blank"
                    fontSize="sm"
                    color="fg.accent"
                >
                    Learn more
                </Link>
            </Box>
        );
    }

    const isPassed = isPassedProp ?? (score === "95%");
    const status = isPassed ? "Passed" : "Failed";

    return (
        <Box display="flex" flexDirection="column" gap="8">
            <Box display="flex" flexDirection="column" gap="4">
                <Text fontSize="md" fontWeight="600">Output Quality: {status}</Text>
                <Text fontSize="sm" color="fg.secondary">
                    {isPassed
                        ? "This output met the agent builder’s quality threshold based on LLM evaluation."
                        : "This output fell below the agent builder’s quality threshold based on LLM evaluation."}
                </Text>
                {baseScore && (
                    <Text fontSize="sm" color="fg.secondary">
                        Minimum base score: <strong>{baseScore}</strong>
                    </Text>
                )}
            </Box>
            <Link
                href="https://support.optimizely.com/hc/en-us/articles/39333562134413-Create-specialized-agents#h_01KACEGNBW103Q3S521AN6YA5R"
                target="_blank"
                fontSize="sm"
                color="fg.accent"
            >
                Learn more
            </Link>
        </Box>
    );
};

const activities = [
    {
        id: "1",
        started: "Oct 13, 2025\n03:50 PM",
        agent: {
            name: "ABM Campaign Workflow",
            handle: "@abm_workflow",
            type: "workflow",
            version: "v1.2.0",
            mode: "Observer",
            baseQualityScore: "85%"
        },
        trigger: "Chat",
        triggeredBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
        status: "In Progress",
        variables: "--",
        output: "--",
        duration: "--",
        qualityScore: "--",
        guardrails: "--",
        subRuns: [
            {
                id: "1-1",
                started: "Oct 13, 2025\n03:51 PM",
                agent: { name: "Target Research Agent", handle: "@target_research", type: "agent", version: "v1.0.0", mode: "Enforcer", baseQualityScore: "85%" },
                triggeredBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
                status: "Completed",
                variables: "Variables",
                output: "View Output",
                duration: "3m",
                qualityScore: "87%",
                guardrails: "Passed"
            },
            {
                id: "1-2",
                started: "Oct 13, 2025\n03:54 PM",
                agent: { name: "Campaign Builder", handle: "@campaign_builder", type: "agent", version: "v2.1.0", mode: "Learner", baseQualityScore: "88%" },
                triggeredBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
                status: "In Progress",
                variables: "Variables",
                output: "--",
                duration: "--",
                qualityScore: "--",
                guardrails: "--"
            }
        ]
    },
    {
        id: "2",
        started: "Oct 13, 2025\n03:42 PM",
        agent: {
            name: "Segment Research",
            handle: "@segment-research",
            type: "agent",
            version: "v2.1.3",
            mode: "Enforcer",
            baseQualityScore: "85%"
        },
        trigger: "--",
        triggeredBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
        status: "Completed",
        variables: "Variables when",
        output: "View Output",
        duration: "6m",
        qualityScore: "85%",
        guardrails: "Passed",
        subRuns: []
    },
    {
        id: "3",
        started: "Oct 13, 2025\n03:30 PM",
        agent: {
            name: "Experiment Planning Agent",
            handle: "@experiment_plan",
            type: "workflow",
            version: "v1.0.0",
            mode: "Learner",
            baseQualityScore: "90%"
        },
        trigger: "Webhook",
        triggeredBy: { name: "William Mo...", avatar: "/avatars/user2.png" },
        status: "Completed",
        variables: "Variables",
        output: "View Output",
        duration: "12m",
        qualityScore: "92%",
        guardrails: "Passed",
        subRuns: [
            {
                id: "3-1",
                started: "Oct 13, 2025\n03:31 PM",
                agent: { name: "Research Agent", handle: "@research", type: "agent", version: "v1.5.0", mode: "Learner", baseQualityScore: "85%" },
                triggeredBy: { name: "William Mo...", avatar: "/avatars/user2.png" },
                status: "Completed",
                variables: "Variables",
                output: "View Output",
                duration: "4m",
                qualityScore: "88%",
                guardrails: "Passed"
            },
            {
                id: "3-2",
                started: "Oct 13, 2025\n03:35 PM",
                agent: { name: "Planning Agent", handle: "@planning", type: "agent", version: "v2.0.1", mode: "Observer", baseQualityScore: "90%" },
                triggeredBy: { name: "William Mo...", avatar: "/avatars/user2.png" },
                status: "Completed",
                variables: "Variables",
                output: "View Output",
                duration: "8m",
                qualityScore: "95%",
                guardrails: "Review Needed"
            }
        ]
    },
    {
        id: "4",
        started: "Oct 13, 2025\n03:15 PM",
        agent: {
            name: "Success Plan Generator",
            handle: "@success_plan_generator",
            type: "agent",
            version: "v1.8.2",
            mode: "Observer",
            baseQualityScore: "85%"
        },
        trigger: "--",
        triggeredBy: { name: "William Mo...", avatar: "/avatars/user2.png" },
        status: "Completed",
        variables: "Variables",
        output: "View Output",
        duration: "6m",
        qualityScore: "79%",
        guardrails: "Review Needed",
        subRuns: []
    },
    {
        id: "5",
        started: "Oct 13, 2025\n02:50 PM",
        agent: {
            name: "Summarize meeting",
            handle: "@summarize-meeting",
            type: "workflow",
            version: "v1.3.0",
            mode: "Enforcer",
            baseQualityScore: "85%"
        },
        trigger: "Scheduler",
        triggeredBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
        status: "In Progress",
        variables: "Variables",
        output: "--",
        duration: "--",
        qualityScore: "--",
        guardrails: "--",
        subRuns: [
            {
                id: "5-1",
                started: "Oct 13, 2025\n02:51 PM",
                agent: { name: "Transcription Agent", handle: "@transcribe", type: "agent", version: "v1.4.0", mode: "Learner", baseQualityScore: "85%" },
                triggeredBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
                status: "Completed",
                variables: "Variables",
                output: "View Output",
                duration: "5m",
                qualityScore: "91%",
                guardrails: "Passed"
            },
            {
                id: "5-2",
                started: "Oct 13, 2025\n02:56 PM",
                agent: { name: "Summary Generator", handle: "@summarize", type: "agent", version: "v2.0.0", mode: "Learner" },
                triggeredBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
                status: "In Progress",
                variables: "Variables",
                output: "--",
                duration: "--",
                qualityScore: "--",
                guardrails: "--"
            }
        ]
    },
    {
        id: "6",
        started: "Oct 13, 2025\n02:10 PM",
        agent: {
            name: "Asset creation",
            handle: "Description",
            type: "workflow",
            version: "v2.0.0",
            mode: "Enforcer",
            baseQualityScore: "85%"
        },
        trigger: "Scheduler",
        triggeredBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
        status: "Terminated",
        variables: "Variables",
        output: "View execution log",
        duration: "--",
        qualityScore: "--",
        guardrails: "Terminated",
        subRuns: [
            {
                id: "6-1",
                started: "Oct 13, 2025\n02:11 PM",
                agent: { name: "Image Generator", handle: "@image_gen", type: "agent", version: "v1.2.0", mode: "Enforcer", baseQualityScore: "85%" },
                triggeredBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
                status: "Completed",
                variables: "Variables",
                output: "View Output",
                duration: "4m",
                qualityScore: "75%",
                guardrails: "Passed"
            },
            {
                id: "6-2",
                started: "Oct 13, 2025\n02:15 PM",
                agent: { name: "Asset Optimizer", handle: "@optimize", type: "agent", version: "v1.0.0", mode: "Enforcer" },
                triggeredBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
                status: "Terminated",
                variables: "Variables",
                output: "View execution log",
                duration: "--",
                qualityScore: "--",
                guardrails: "Terminated"
            }
        ]
    },
    {
        id: "7",
        started: "Oct 13, 2025\n01:50 PM",
        agent: {
            name: "Heatmap Agent",
            handle: "Description",
            type: "agent",
            version: "v1.1.0",
            mode: "Enforcer",
            baseQualityScore: "85%"
        },
        trigger: "--",
        triggeredBy: { name: "William Mo...", avatar: "/avatars/user2.png" },
        status: "Completed",
        variables: "Variables",
        output: "Foo",
        duration: "6m",
        qualityScore: "82%",
        guardrails: "Passed",
        subRuns: []
    },
    {
        id: "8",
        started: "Oct 13, 2025\n12:50 PM",
        agent: {
            name: "WCAG Workflow",
            handle: "@wcagworkflow",
            type: "workflow",
            version: "v1.0.5",
            mode: "Observer",
            baseQualityScore: "85%"
        },
        trigger: "--",
        triggeredBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
        status: "Failed",
        variables: "Variables",
        output: "Foo",
        duration: "6m",
        qualityScore: "41%",
        guardrails: "Failed",
        subRuns: [
            {
                id: "8-1",
                started: "Oct 13, 2025\n12:51 PM",
                agent: { name: "Accessibility Scanner", handle: "@a11y_scan", type: "agent", version: "v2.0.0", mode: "Enforcer", baseQualityScore: "85%" },
                triggeredBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
                status: "Completed",
                variables: "Variables",
                output: "View Output",
                duration: "3m",
                qualityScore: "80%",
                guardrails: "Passed"
            },
            {
                id: "8-2",
                started: "Oct 13, 2025\n12:54 PM",
                agent: { name: "Compliance Validator", handle: "@validate", type: "agent", version: "v1.5.0", mode: "Enforcer" },
                triggeredBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
                status: "Failed",
                variables: "Variables",
                output: "View execution log",
                duration: "3m",
                qualityScore: "25%",
                guardrails: "Failed"
            }
        ]
    }
];

// Column definitions
const allColumns: ColumnConfig[] = [
    { id: "starred", label: "", visible: true, movable: false },
    { id: "started", label: "Started", visible: true, movable: true },
    { id: "agent", label: "Agent", visible: true, movable: true },
    { id: "trigger", label: "Trigger", visible: true, movable: true },
    { id: "triggeredBy", label: "Triggered by", visible: true, movable: true },
    { id: "status", label: "Status", visible: true, movable: true },
    { id: "output", label: "Output", visible: true, movable: true },
    { id: "qualityScore", label: "Evaluation Score", visible: true, movable: true },
    { id: "guardrails", label: "Guardrails Status", visible: true, movable: true },
    { id: "duration", label: "Duration", visible: true, movable: true },
    { id: "variables", label: "Variables", visible: false, movable: true },
    { id: "agentVersion", label: "Agent Version", visible: false, movable: true },
    { id: "agentMode", label: "Agent Mode", visible: false, movable: true },
];

export default function ActivitiesPage() {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [selectedActivity, setSelectedActivity] = useState<any>(null);
    const [focusOutput, setFocusOutput] = useState(false);
    const [columns, setColumns] = useState(allColumns);
    const [agentTypeFilter, setAgentTypeFilter] = useState<string>("All");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [triggeredByFilter, setTriggeredByFilter] = useState<string[]>([]);
    const [agentFilter, setAgentFilter] = useState<string[]>([]);
    const [agentSearchTerm, setAgentSearchTerm] = useState("");
    const [showQualityBadges, setShowQualityBadges] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const users = [
        { name: "Mary Anne", avatar: "/avatars/user.png" },
        { name: "William Mo...", avatar: "/avatars/user2.png" }
    ];

    const uniqueAgents = Array.from(new Set(activities.map(a => a.agent.name)));

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    // Reset table scroll when details panel opens/closes
    useEffect(() => {
        if (tableContainerRef.current) {
            setTimeout(() => {
                if (tableContainerRef.current) {
                    tableContainerRef.current.scrollLeft = 0;
                }
            }, 0);
        }
    }, [selectedActivity]);

    const visibleColumns = columns.filter(col => col.visible);

    // Filter activities based on selected filters
    const filteredActivities = activities.filter(activity => {
        const matchesAgentType = agentTypeFilter === "All" ||
            (agentTypeFilter === "Specialized" && activity.agent.type === "agent") ||
            (agentTypeFilter === "Workflow" && activity.agent.type === "workflow");

        const matchesStatus = statusFilter === "All" || activity.status === statusFilter;

        const matchesTriggeredBy = triggeredByFilter.length === 0 || triggeredByFilter.includes(activity.triggeredBy.name);

        const matchesAgent = agentFilter.length === 0 || agentFilter.includes(activity.agent.name);

        return matchesAgentType && matchesStatus && matchesTriggeredBy && matchesAgent;
    });

    if (!isMounted) return null;

    return (
        <div suppressHydrationWarning className="flex h-screen overflow-hidden">
            <Box p="24" display="flex" flexDirection="column" gap="24" bg="bg.page" h="full" flex="1" overflow="hidden">
                {/* Header */}
                <PageTitle
                    title="Activities"
                    description="Track and monitor all agent executions and workflow runs."
                />

                {/* Toolbar */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" gap="12" alignItems="center">
                        <Box className="w-[300px]">
                            <Input placeholder="Enter name or description" />
                        </Box>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <LabelMenuButton label="Agent Type" h="40">
                                    {agentTypeFilter}
                                </LabelMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setAgentTypeFilter("All")}>
                                    All
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setAgentTypeFilter("Specialized")}>
                                    <Box display="flex" alignItems="center" gap="8">
                                        <IconAgent size={16} />
                                        Specialized
                                    </Box>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setAgentTypeFilter("Workflow")}>
                                    <Box display="flex" alignItems="center" gap="8">
                                        <IconCodeBranch size={16} />
                                        Workflow
                                    </Box>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <LabelMenuButton label="Status" h="40">
                                    {statusFilter}
                                </LabelMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setStatusFilter("All")}>
                                    All
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("Completed")}>
                                    Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("In Progress")}>
                                    In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("Failed")}>
                                    Failed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("Terminated")}>
                                    Terminated
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <LabelMenuButton label="Triggered by" h="40">
                                    {triggeredByFilter.length === 0 ? "All" : triggeredByFilter.length === 1 ? triggeredByFilter[0] : `${triggeredByFilter.length} selected`}
                                </LabelMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {users.map(user => (
                                    <DropdownMenuItem
                                        key={user.name}
                                        onSelect={(e) => e.preventDefault()}
                                        onClick={() => {
                                            setTriggeredByFilter(prev =>
                                                prev.includes(user.name)
                                                    ? prev.filter(n => n !== user.name)
                                                    : [...prev, user.name]
                                            );
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" gap="8" w="full">
                                            <Checkbox checked={triggeredByFilter.includes(user.name)} />
                                            <Avatar src={user.avatar} name={user.name} size="xs" />
                                            <Text fontSize="sm">{user.name}</Text>
                                        </Box>
                                    </DropdownMenuItem>
                                ))}
                                {triggeredByFilter.length > 0 && (
                                    <>
                                        <Box style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)" }} my="4" />
                                        <DropdownMenuItem onClick={() => setTriggeredByFilter([])}>
                                            <Text color="fg.accent" w="full" textAlign="center">Clear all</Text>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <LabelMenuButton label="Agent" h="40">
                                    {agentFilter.length === 0 ? "All" : agentFilter.length === 1 ? agentFilter[0] : `${agentFilter.length} selected`}
                                </LabelMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent style={{ minWidth: "240px" }}>
                                <Box p="8" style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}>
                                    <Input
                                        placeholder="Search agents..."
                                        value={agentSearchTerm}
                                        onChange={(e: any) => setAgentSearchTerm(e.currentTarget.value)}
                                        size="md"
                                        autoFocus
                                    />
                                </Box>
                                <Box style={{ maxHeight: "300px", overflowY: "auto" }}>
                                    {uniqueAgents
                                        .filter(name => name.toLowerCase().includes(agentSearchTerm.toLowerCase()))
                                        .map(agentName => (
                                            <DropdownMenuItem
                                                key={agentName}
                                                onSelect={(e) => e.preventDefault()}
                                                onClick={() => {
                                                    setAgentFilter(prev =>
                                                        prev.includes(agentName)
                                                            ? prev.filter(n => n !== agentName)
                                                            : [...prev, agentName]
                                                    );
                                                }}
                                            >
                                                <Box display="flex" alignItems="center" gap="8" w="full">
                                                    <Checkbox checked={agentFilter.includes(agentName)} />
                                                    <Text fontSize="md">{agentName}</Text>
                                                </Box>
                                            </DropdownMenuItem>
                                        ))}
                                </Box>
                                {agentFilter.length > 0 && (
                                    <>
                                        <Box style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)" }} my="4" />
                                        <DropdownMenuItem onClick={() => setAgentFilter([])}>
                                            <Text color="fg.accent" w="full" textAlign="center">Clear all</Text>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Menu placeholder="Select date range..." options={[{ label: "Past 30 days" }]}>
                            <MenuTrigger asChild>
                                <LabelMenuButton label="Date Range" h="40">
                                    Past 30 days
                                </LabelMenuButton>
                            </MenuTrigger>
                            <MenuContent />
                        </Menu>
                    </Box>

                    <Box display="flex" gap="8" suppressHydrationWarning>
                        <TableColumnConfig
                            columns={columns}
                            onColumnsChange={setColumns}
                            icon={<IconColumns3 />}
                            renderColumnExtra={(columnId: string) =>
                                columnId === "qualityScore" && (
                                    <Box pl="48" pr="12" pb="12" suppressHydrationWarning>
                                        <Checkbox
                                            checked={showQualityBadges}
                                            onCheckedChange={setShowQualityBadges}
                                        >
                                            Show Quality Badges
                                        </Checkbox>
                                    </Box>
                                )
                            }
                        />
                        <Button appearance="default" icon={<IconDownload />} aria-label="Download activities">
                            Download
                        </Button>
                    </Box>
                </Box>

                {/* Table */}
                <Box ref={tableContainerRef} overflow="auto" flex="1" className="axiom-scrollbar">
                    <Table style={{ minWidth: '1000px' }}>
                        <thead>
                            <Tr>
                                {visibleColumns.map(col => (
                                    <Th key={col.id} style={(col.id === "qualityScore" || col.id === "guardrails") ? { padding: 0 } : {}}>
                                        {col.id === "qualityScore" ? (
                                            <HoverCard openDelay={200}>
                                                <HoverCardTrigger asChild>
                                                    <Box display="flex" alignItems="start" gap="4" px="16" py="12" w="full" style={{ cursor: "help" }}>
                                                        {col.label}
                                                        <IconHelp size={14} style={{ marginTop: '2px' }} />
                                                    </Box>
                                                </HoverCardTrigger>
                                                <HoverCardContent style={{ maxWidth: "280px" }}>
                                                    <QualityScoreHoverCardContent isHelp />
                                                </HoverCardContent>
                                            </HoverCard>
                                        ) : col.id === "guardrails" ? (
                                            <HoverCard openDelay={200}>
                                                <HoverCardTrigger asChild>
                                                    <Box display="flex" alignItems="start" gap="4" px="16" py="12" w="full" style={{ cursor: "help" }}>
                                                        {col.label}
                                                        <IconHelp size={14} style={{ marginTop: '2px' }} />
                                                    </Box>
                                                </HoverCardTrigger>
                                                <HoverCardContent style={{ maxWidth: "280px" }}>
                                                    <GuardrailHoverCardContent isHelp />
                                                </HoverCardContent>
                                            </HoverCard>
                                        ) : (
                                            col.label
                                        )}
                                    </Th>
                                ))}
                                <Th></Th>
                            </Tr>
                        </thead>
                        <tbody suppressHydrationWarning>
                            {filteredActivities.map((activity) => (
                                <Fragment key={activity.id}>
                                    <Tr onClick={() => {
                                        setSelectedActivity(activity);
                                        setFocusOutput(false);
                                    }}>
                                        {visibleColumns.map(col => {
                                            if (col.id === "starred") {
                                                return (
                                                    <Td key={col.id} width="80px">
                                                        <Box display="flex" alignItems="center" gap="8">
                                                            <StatusIcon status={activity.status} agentName={activity.agent.name} guardrailStatus={activity.guardrails === "--" ? undefined : activity.guardrails} mode={activity.agent.mode} />
                                                            {activity.subRuns.length > 0 && (
                                                                <Box
                                                                    cursor="pointer"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleRow(activity.id);
                                                                    }}
                                                                    color="fg.secondary"
                                                                >
                                                                    {expandedRows.has(activity.id) ? (
                                                                        <IconChevronDown size={16} />
                                                                    ) : (
                                                                        <IconChevronRight size={16} />
                                                                    )}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Td>
                                                );
                                            }
                                            if (col.id === "started") {
                                                const [date, time] = activity.started.split("\n");
                                                return (
                                                    <Td key={col.id}>
                                                        <Box>
                                                            <Text>{date}</Text>
                                                            {time && (
                                                                <Text fontSize="sm" color="fg.secondary">
                                                                    {time}
                                                                </Text>
                                                            )}
                                                        </Box>
                                                    </Td>
                                                );
                                            }
                                            if (col.id === "agent") {
                                                return (
                                                    <Td key={col.id}>
                                                        <Box>
                                                            <Text fontWeight="500">{activity.agent.name}</Text>
                                                            <Text fontSize="sm" color="fg.secondary">
                                                                {activity.agent.handle}
                                                            </Text>
                                                        </Box>
                                                    </Td>
                                                );
                                            }
                                            if (col.id === "trigger") {
                                                return <Td key={col.id}>{activity.trigger}</Td>;
                                            }
                                            if (col.id === "triggeredBy") {
                                                return (
                                                    <Td key={col.id}>
                                                        <Box display="flex" alignItems="center" gap="8">
                                                            <Avatar
                                                                name={activity.triggeredBy.name}
                                                                src={activity.triggeredBy.avatar}
                                                                size="sm"
                                                            />
                                                            <Text>{activity.triggeredBy.name}</Text>
                                                        </Box>
                                                    </Td>
                                                );
                                            }
                                            if (col.id === "status") {
                                                const statusIntent =
                                                    activity.status === "Completed" ? "success" :
                                                        activity.status === "In Progress" ? "information" :
                                                            activity.status === "Failed" ? "danger" :
                                                                activity.status === "Terminated" ? "danger" :
                                                                    "neutral";
                                                return (
                                                    <Td key={col.id}>
                                                        <Badge intent={statusIntent as any} style={{ whiteSpace: "nowrap" }}>{activity.status}</Badge>
                                                    </Td>
                                                );
                                            }
                                            if (col.id === "variables") {
                                                return <Td key={col.id}>{activity.variables}</Td>;
                                            }
                                            if (col.id === "output") {
                                                return (
                                                    <Td key={col.id}>
                                                        {activity.output.startsWith("View") ? (
                                                            <Link
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setSelectedActivity(activity);
                                                                    setFocusOutput(true);
                                                                }}
                                                            >
                                                                {activity.output}
                                                            </Link>
                                                        ) : (
                                                            activity.output
                                                        )}
                                                    </Td>
                                                );
                                            }
                                            if (col.id === "duration") {
                                                return <Td key={col.id}>{activity.duration}</Td>;
                                            }
                                            if (col.id === "agentVersion") {
                                                return <Td key={col.id}>{activity.agent.version}</Td>;
                                            }
                                            if (col.id === "agentMode") {
                                                return <Td key={col.id}>{activity.agent.mode}</Td>;
                                            }
                                            if (col.id === "qualityScore") {
                                                const score = parseInt(activity.qualityScore);
                                                const isPassed = !isNaN(score) && score >= 85;
                                                return (
                                                    <Td key={col.id}>
                                                        <Box display="flex" alignItems="center" gap="8">
                                                            <Text>{activity.qualityScore}</Text>
                                                            {!isNaN(score) && showQualityBadges && (
                                                                <HoverCard openDelay={200}>
                                                                    <HoverCardTrigger asChild>
                                                                        <Box display="inline-block">
                                                                            <Badge intent={isPassed ? "success" : "danger"} style={{ whiteSpace: "nowrap" }}>
                                                                                {isPassed ? "Passed" : "Failed"}
                                                                            </Badge>
                                                                        </Box>
                                                                    </HoverCardTrigger>
                                                                    <HoverCardContent style={{ maxWidth: "280px" }}>
                                                                        <QualityScoreHoverCardContent
                                                                            score={activity.qualityScore}
                                                                            baseScore={(activity.agent as any).baseQualityScore}
                                                                            isPassed={isPassed}
                                                                        />
                                                                    </HoverCardContent>
                                                                </HoverCard>
                                                            )}
                                                        </Box>
                                                    </Td>
                                                );
                                            }
                                            if (col.id === "guardrails") {
                                                const status = (activity as any).guardrails;
                                                let intent: "success" | "danger" | "warning" | "neutral" = "neutral";
                                                if (status === "Passed") intent = "success";
                                                if (status === "Failed" || status === "Terminated") intent = "danger";
                                                if (status === "Review Needed") intent = "warning";

                                                return (
                                                    <Td key={col.id}>
                                                        {status && status !== "--" ? (
                                                            <HoverCard openDelay={200}>
                                                                <HoverCardTrigger asChild>
                                                                    <Box display="inline-block">
                                                                        <Badge intent={intent} style={{ whiteSpace: "nowrap" }}>{status}</Badge>
                                                                    </Box>
                                                                </HoverCardTrigger>
                                                                <HoverCardContent style={{ maxWidth: "280px" }}>
                                                                    <GuardrailHoverCardContent status={status} mode={activity.agent.mode} />
                                                                </HoverCardContent>
                                                            </HoverCard>
                                                        ) : "--"}
                                                    </Td>
                                                );
                                            }
                                            return null;
                                        })}
                                        <Td type="button" />
                                    </Tr>

                                    {/* Expandable sub-runs */}
                                    {expandedRows.has(activity.id) && activity.subRuns.map((subRun) => (
                                        <Tr key={subRun.id} className="bg-[var(--ax-colors-bg-secondary)]">
                                            {visibleColumns.map(col => {
                                                if (col.id === "starred") {
                                                    return (
                                                        <Td key={col.id} width="80px">
                                                            <Box pl="32">
                                                                <StatusIcon status={subRun.status} agentName={subRun.agent.name} guardrailStatus={subRun.guardrails} mode={subRun.agent.mode} />
                                                            </Box>
                                                        </Td>
                                                    );
                                                }
                                                if (col.id === "started") {
                                                    const [date, time] = subRun.started.split("\n");
                                                    return (
                                                        <Td key={col.id}>
                                                            <Box pl="32">
                                                                <Text>{date}</Text>
                                                                {time && (
                                                                    <Text fontSize="sm" color="fg.secondary">
                                                                        {time}
                                                                    </Text>
                                                                )}
                                                            </Box>
                                                        </Td>
                                                    );
                                                }
                                                if (col.id === "agent") {
                                                    return (
                                                        <Td key={col.id}>
                                                            <Box pl="32">
                                                                <Text fontWeight="500">{subRun.agent.name}</Text>
                                                                <Text fontSize="sm" color="fg.secondary">
                                                                    {subRun.agent.handle}
                                                                </Text>
                                                            </Box>
                                                        </Td>
                                                    );
                                                }
                                                if (col.id === "trigger") {
                                                    return <Td key={col.id}>--</Td>;
                                                }
                                                if (col.id === "triggeredBy") {
                                                    return (
                                                        <Td key={col.id}>
                                                            <Box display="flex" alignItems="center" gap="8">
                                                                <Avatar
                                                                    name={subRun.triggeredBy.name}
                                                                    src={subRun.triggeredBy.avatar}
                                                                    size="sm"
                                                                />
                                                                <Text>{subRun.triggeredBy.name}</Text>
                                                            </Box>
                                                        </Td>
                                                    );
                                                }
                                                if (col.id === "status") {
                                                    const statusIntent =
                                                        subRun.status === "Completed" ? "success" :
                                                            subRun.status === "In Progress" ? "information" :
                                                                subRun.status === "Failed" ? "danger" :
                                                                    subRun.status === "Terminated" ? "danger" :
                                                                        "neutral";
                                                    return (
                                                        <Td key={col.id}>
                                                            <Badge intent={statusIntent as any} style={{ whiteSpace: "nowrap" }}>{subRun.status}</Badge>
                                                        </Td>
                                                    );
                                                }
                                                if (col.id === "variables") {
                                                    return <Td key={col.id}>{subRun.variables}</Td>;
                                                }
                                                if (col.id === "output") {
                                                    return (
                                                        <Td key={col.id}>
                                                            {subRun.output.startsWith("View") ? (
                                                                <Link href="#">{subRun.output}</Link>
                                                            ) : (
                                                                subRun.output
                                                            )}
                                                        </Td>
                                                    );
                                                }
                                                if (col.id === "duration") {
                                                    return <Td key={col.id}>{subRun.duration}</Td>;
                                                }
                                                if (col.id === "agentVersion") {
                                                    return <Td key={col.id}>{subRun.agent.version}</Td>;
                                                }
                                                if (col.id === "agentMode") {
                                                    return <Td key={col.id}>{subRun.agent.mode}</Td>;
                                                }
                                                if (col.id === "qualityScore") {
                                                    const score = parseInt(subRun.qualityScore);
                                                    const isPassed = !isNaN(score) && score >= 85;
                                                    return (
                                                        <Td key={col.id}>
                                                            <Box display="flex" alignItems="center" gap="8">
                                                                <Text>{subRun.qualityScore}</Text>
                                                                {!isNaN(score) && showQualityBadges && (
                                                                    <HoverCard openDelay={200}>
                                                                        <HoverCardTrigger asChild>
                                                                            <Box display="inline-block">
                                                                                <Badge intent={isPassed ? "success" : "danger"} style={{ whiteSpace: "nowrap" }}>
                                                                                    {isPassed ? "Passed" : "Failed"}
                                                                                </Badge>
                                                                            </Box>
                                                                        </HoverCardTrigger>
                                                                        <HoverCardContent style={{ maxWidth: "280px" }}>
                                                                            <QualityScoreHoverCardContent
                                                                                score={subRun.qualityScore}
                                                                                baseScore={(subRun.agent as any).baseQualityScore}
                                                                                isPassed={isPassed}
                                                                            />
                                                                        </HoverCardContent>
                                                                    </HoverCard>
                                                                )}
                                                            </Box>
                                                        </Td>
                                                    );
                                                }
                                                if (col.id === "guardrails") {
                                                    const status = (subRun as any).guardrails;
                                                    let intent: "success" | "danger" | "warning" | "neutral" = "neutral";
                                                    if (status === "Passed") intent = "success";
                                                    if (status === "Failed" || status === "Terminated") intent = "danger";
                                                    if (status === "Review Needed") intent = "warning";

                                                    return (
                                                        <Td key={col.id}>
                                                            {status && status !== "--" ? (
                                                                <HoverCard openDelay={200}>
                                                                    <HoverCardTrigger asChild>
                                                                        <Box display="inline-block">
                                                                            <Badge intent={intent} style={{ whiteSpace: "nowrap" }}>{status}</Badge>
                                                                        </Box>
                                                                    </HoverCardTrigger>
                                                                    <HoverCardContent style={{ maxWidth: "280px" }}>
                                                                        <GuardrailHoverCardContent status={status} mode={subRun.agent.mode} />
                                                                    </HoverCardContent>
                                                                </HoverCard>
                                                            ) : "--"}
                                                        </Td>
                                                    );
                                                }
                                                return null;
                                            })}
                                            <Td type="button" />
                                        </Tr>
                                    ))}
                                </Fragment>
                            ))}
                        </tbody>
                    </Table>
                </Box>
            </Box>
            {selectedActivity && (
                <DetailsPanel
                    activity={selectedActivity}
                    onClose={() => setSelectedActivity(null)}
                    focusOutput={focusOutput}
                />
            )}
        </div>
    );
}

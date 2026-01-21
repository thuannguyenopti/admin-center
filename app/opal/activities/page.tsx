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
} from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { PageTitle } from "@/app/components/PageTitle";
import {
    IconChevronDown,
    IconChevronRight,
    IconDownload,
    IconRefresh,
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
const StatusIcon = ({ status, agentName }: { status: string; agentName?: string }) => {
    const iconProps = { size: 20 };

    // Special case: Success Plan Generator shows warning icon but keeps Completed status
    if (agentName === "Success Plan Generator" && status === "Completed") {
        return <IconTriangleExclamation {...iconProps} color="#F79009" />;
    }

    switch (status) {
        case "Completed":
            return <IconCircleCheck {...iconProps} color="#17B26A" />;
        case "In Progress":
            return <Spinner style={{ width: 16, height: 16 }} />;
        case "Failed":
            return <IconCircleExclamation {...iconProps} color="#D92D20" />;
        case "Terminated":
            return <IconCirclePause {...iconProps} color="#D92D20" />;
        case "Paused":
            return <IconCirclePause {...iconProps} color="#667085" />;
        default:
            return null;
    }
};

// Mock data for activities
const activities = [
    {
        id: "1",
        started: "Oct 13, 2025\n03:50 PM",
        agent: {
            name: "ABM Campaign Workflow",
            handle: "@abm_workflow",
            type: "workflow",
            version: "v1.2.0",
            mode: "Autonomous"
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
                agent: { name: "Target Research Agent", handle: "@target_research", type: "agent", version: "v1.0.0", mode: "Autonomous" },
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
                agent: { name: "Campaign Builder", handle: "@campaign_builder", type: "agent", version: "v2.1.0", mode: "Collaborative" },
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
            mode: "Collaborative"
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
            mode: "Autonomous"
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
                agent: { name: "Research Agent", handle: "@research", type: "agent", version: "v1.5.0", mode: "Autonomous" },
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
                agent: { name: "Planning Agent", handle: "@planning", type: "agent", version: "v2.0.1", mode: "Collaborative" },
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
            mode: "Autonomous"
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
            mode: "Collaborative"
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
                agent: { name: "Transcription Agent", handle: "@transcribe", type: "agent", version: "v1.4.0", mode: "Autonomous" },
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
                agent: { name: "Summary Generator", handle: "@summarize", type: "agent", version: "v2.0.0", mode: "Autonomous" },
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
            mode: "Autonomous"
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
                agent: { name: "Image Generator", handle: "@image_gen", type: "agent", version: "v1.2.0", mode: "Autonomous" },
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
                agent: { name: "Asset Optimizer", handle: "@optimize", type: "agent", version: "v1.0.0", mode: "Autonomous" },
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
            mode: "Collaborative"
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
            mode: "Autonomous"
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
                agent: { name: "Accessibility Scanner", handle: "@a11y_scan", type: "agent", version: "v2.0.0", mode: "Autonomous" },
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
                agent: { name: "Compliance Validator", handle: "@validate", type: "agent", version: "v1.5.0", mode: "Autonomous" },
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
    { id: "qualityScore", label: "Output Quality Score", visible: true, movable: true },
    { id: "guardrails", label: "Execution Guardrails", visible: true, movable: true },
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
    const tableContainerRef = useRef<HTMLDivElement>(null);

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
                                    <Th key={col.id}>{col.label}</Th>
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
                                                            <StatusIcon status={activity.status} agentName={activity.agent.name} />
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
                                                                <Badge intent={isPassed ? "success" : "danger"} style={{ whiteSpace: "nowrap" }}>
                                                                    {isPassed ? "Passed" : "Failed"}
                                                                </Badge>
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
                                                            <Badge intent={intent} style={{ whiteSpace: "nowrap" }}>{status}</Badge>
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
                                                                <StatusIcon status={subRun.status} agentName={subRun.agent.name} />
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
                                                                    <Badge intent={isPassed ? "success" : "danger"} style={{ whiteSpace: "nowrap" }}>
                                                                        {isPassed ? "Passed" : "Failed"}
                                                                    </Badge>
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
                                                                <Badge intent={intent} style={{ whiteSpace: "nowrap" }}>{status}</Badge>
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

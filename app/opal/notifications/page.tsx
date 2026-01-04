"use client";

import {
    Box,
    Heading,
    Text,
    Button,
    Badge,
    Avatar,
    Link,
    Menu,
    MenuTrigger,
    MenuContent,
    LabelMenuButton,
} from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
    IconClock,
} from "@tabler/icons-react";
import {
    IconEllipsisStroke,
    IconCircleExclamation,
    IconTriangleExclamation
} from "@optimizely/axiom-icons";
import { Input } from "@/app/components/Input";
import NextLink from "next/link";
import { useState } from "react";

const executions = [
    {
        id: "b2953c08",
        status: "failed",
        errorType: "Tool Timeout",
        errorSource: "Agent",
        agent: "Hypothesis Creator",
        version: "V15",
        startTime: "4:14:50 PM",
        duration: "62.45s",
        qualityScore: "75%",
        author: { name: "bigmonkiki", avatar: null },
    },
    {
        id: "d8k2o19s",
        status: "review",
        errorType: "Evaluation Error",
        errorSource: "Logic: Condition 1",
        agent: "Content Localizer",
        version: "V12",
        startTime: "2:30:15 PM",
        duration: "12.20s",
        qualityScore: "82%",
        author: { name: "bigmonkiki", avatar: null },
    },
    {
        id: "f9s2m10x",
        status: "failed",
        errorType: "Trigger Timeout",
        errorSource: "Trigger: In-app Event",
        agent: "Web Researcher",
        version: "V8",
        startTime: "11:05:42 AM",
        duration: "120.0s",
        qualityScore: "N/A",
        author: { name: "bigmonkiki", avatar: null },
    },
];

export default function NotificationsPage() {
    const [agentFilter, setAgentFilter] = useState("All Agents");
    const [statusFilter, setStatusFilter] = useState("All Statuses");
    const [timeFilter, setTimeFilter] = useState("Last 24 Hours");

    return (
        <Box p="32" display="flex" flexDirection="column" gap="24" h="full" bg="bg.default">
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Heading level="2">Notifications</Heading>
                </Box>
            </Box>

            {/* Filters */}
            <Box display="flex" gap="12" alignItems="center" flexWrap="wrap">
                <Box className="w-[300px]">
                    <Input placeholder="Search notifications..." />
                </Box>

                <Menu
                    placeholder="Search agents..."
                    options={[
                        { label: "All Agents", execute: () => setAgentFilter("All Agents") },
                        { label: "Hypothesis Creator", execute: () => setAgentFilter("Hypothesis Creator") },
                        { label: "Content Localizer", execute: () => setAgentFilter("Content Localizer") },
                        { label: "Web Researcher", execute: () => setAgentFilter("Web Researcher") }
                    ]}
                >
                    <MenuTrigger asChild>
                        <LabelMenuButton label="Agent" h="40">
                            {agentFilter}
                        </LabelMenuButton>
                    </MenuTrigger>
                    <MenuContent />
                </Menu>

                <Menu
                    placeholder="Search statuses..."
                    options={[
                        { label: "All Statuses", execute: () => setStatusFilter("All Statuses") },
                        { label: "Failed", execute: () => setStatusFilter("Failed") },
                        { label: "Review Needed", execute: () => setStatusFilter("Review Needed") }
                    ]}>
                    <MenuTrigger asChild>
                        <LabelMenuButton label="Status" h="40">
                            {statusFilter}
                        </LabelMenuButton>
                    </MenuTrigger>
                    <MenuContent />
                </Menu>

                <Menu options={[
                    { label: "Last Hour", execute: () => setTimeFilter("Last Hour") },
                    { label: "Last 24 Hours", execute: () => setTimeFilter("Last 24 Hours") },
                    { label: "Last 7 Days", execute: () => setTimeFilter("Last 7 Days") },
                    { label: "Last 30 Days", execute: () => setTimeFilter("Last 30 Days") }
                ]}>
                    <MenuTrigger asChild>
                        <LabelMenuButton label="Time" h="40">
                            <Box display="flex" alignItems="center" gap="8">
                                <IconClock size={16} />
                                {timeFilter}
                            </Box>
                        </LabelMenuButton>
                    </MenuTrigger>
                    <MenuContent />
                </Menu>
            </Box>

            {/* Table */}
            <Box overflow="hidden">
                <Table>
                    <thead>
                        <Tr>
                            <Th>Workflow Name</Th>
                            <Th>Timestamp</Th>
                            <Th>Status</Th>
                            <Th>Error Trace</Th>
                            <Th>Executed By</Th>
                            <Th></Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {executions.map((run) => (
                            <Tr key={run.id} url={`/opal/notifications/${run.id}`}>
                                <Td>
                                    <Link asChild color="fg.default" fontWeight="600" className="underline underline-offset-4 decoration-border-default hover:decoration-fg-default transition-colors">
                                        <NextLink href={`/opal/notifications/${run.id}`}>
                                            {run.agent}
                                        </NextLink>
                                    </Link>
                                    <Text fontSize="xs" color="fg.tertiary" mt="4">{run.id}</Text>
                                </Td>
                                <Td>
                                    <Text color="fg.default">{run.startTime}</Text>
                                </Td>
                                <Td>
                                    <Box display="flex" alignItems="center" gap="8">
                                        {run.status === 'failed' ? (
                                            <IconCircleExclamation size={16} color="fg.error" />
                                        ) : (
                                            <IconTriangleExclamation size={16} color="fg.warning" />
                                        )}
                                        <Box>
                                            <Text color={run.status === 'failed' ? 'fg.error' : 'fg.warning'} fontWeight="500">
                                                {run.status === 'failed' ? 'Failed' : 'Review Needed'}
                                            </Text>
                                            <Text fontSize="xs" color="fg.tertiary">{run.duration}</Text>
                                        </Box>
                                    </Box>
                                </Td>
                                <Td>
                                    <Box display="flex" flexDirection="column" gap="4">
                                        <Box display="flex" alignItems="center" gap="16">
                                            <Text fontSize="xs" color="fg.tertiary" fontWeight="600" textTransform="uppercase">{run.errorSource}</Text>
                                            <Text fontSize="xs" color="fg.tertiary">{run.version}</Text>
                                        </Box>
                                        <Text fontSize="sm" fontWeight="500" color={run.status === 'failed' ? 'fg.error' : 'fg.warning'}>
                                            {run.errorType}
                                        </Text>
                                    </Box>
                                </Td>
                                <Td>
                                    <Box display="flex" alignItems="center" gap="8">
                                        <Avatar name={run.author.name} size="xs" />
                                        <Text color="fg.tertiary" fontSize="sm">{run.author.name}</Text>
                                    </Box>
                                </Td>
                                <Td>
                                    <Button appearance="subtle" icon={<IconEllipsisStroke />} size="sm" aria-label="Options" />
                                </Td>
                            </Tr>
                        ))}
                    </tbody>
                </Table>
            </Box>
        </Box>
    );
}

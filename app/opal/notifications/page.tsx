"use client";

import {
    Box,
    Heading,
    Text,
    Button,
    Badge,
    Avatar,
    Select,
    SelectTrigger,
    SelectContent,
    Link,
} from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
    IconClock,
    IconSearch,
    IconAlertCircle,
    IconCopy,
    IconRefresh,
    IconCircleCheck,
} from "@tabler/icons-react";
import { IconEllipsisStroke, IconSparkles } from "@optimizely/axiom-icons";
import { Input } from "@/app/components/Input";
import NextLink from "next/link";

const executions = [
    {
        id: "b2953c08",
        status: "failed",
        errorType: "Tool Timeout",
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
        errorType: "Guardrail Breach",
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
        errorType: "Too many tool calls",
        agent: "Web Researcher",
        version: "V8",
        startTime: "11:05:42 AM",
        duration: "120.0s",
        qualityScore: "N/A",
        author: { name: "bigmonkiki", avatar: null },
    },
];

export default function NotificationsPage() {
    return (
        <Box p="32" display="flex" flexDirection="column" gap="24" h="full" bg="bg.default">
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Heading level="2">Execution Logs</Heading>
                    <Text color="fg.tertiary">Monitor agent runs and resolve execution errors.</Text>
                </Box>
                <Button appearance="primary" icon={<IconRefresh size={16} />}>Refresh Logs</Button>
            </Box>

            {/* Filters */}
            <Box display="flex" gap="12" alignItems="center" flexWrap="wrap">
                <Box className="w-[300px]">
                    <Input placeholder="Search execution IDs..." />
                </Box>
                <Select defaultValue="all" options={[{ label: "All Agents", value: "all" }, { label: "Hypothesis Creator", value: "hc" }]}>
                    <SelectTrigger className="w-[200px]">
                        All Agents
                    </SelectTrigger>
                    <SelectContent />
                </Select>
                <Select defaultValue="status" options={[{ label: "All Statuses", value: "status" }, { label: "Failed", value: "failed" }, { label: "Review Needed", value: "review" }]}>
                    <SelectTrigger className="w-[200px]">
                        All Statuses
                    </SelectTrigger>
                    <SelectContent />
                </Select>
                <Button appearance="subtle" icon={<IconClock size={16} />}>
                    Last 24 Hours
                </Button>
            </Box>

            {/* Table */}
            <Box border="1" borderColor="border.tertiary" rounded="md" overflow="hidden">
                <Table>
                    <Tr>
                        <Th>Execution ID</Th>
                        <Th>Status</Th>
                        <Th>Agent / Error Trace</Th>
                        <Th>Quality</Th>
                        <Th>Executed By</Th>
                        <Th></Th>
                    </Tr>
                    {executions.map((run) => (
                        <Tr key={run.id}>
                            <Td>
                                <NextLink href={`/opal/notifications/${run.id}`} passHref legacyBehavior>
                                    <Link color="fg.default" fontWeight="600" className="hover:underline">
                                        {run.id}
                                    </Link>
                                </NextLink>
                                <Text fontSize="xs" color="fg.tertiary" mt="4">{run.startTime}</Text>
                            </Td>
                            <Td>
                                <Box display="flex" alignItems="center" gap="8">
                                    <IconAlertCircle size={16} className={run.status === 'failed' ? 'text-fg-error' : 'text-fg-warning'} />
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
                                    <Box display="flex" alignItems="center" gap="8">
                                        <Text fontWeight="600" fontSize="sm">{run.agent}</Text>
                                        <Text fontSize="xs" color="fg.tertiary">{run.version}</Text>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap="6">
                                        <Badge intent={run.status === 'failed' ? 'danger' : 'warning'} size="sm">
                                            {run.errorType}
                                        </Badge>
                                    </Box>
                                </Box>
                            </Td>
                            <Td>
                                <Box display="flex" alignItems="center" gap="4">
                                    <Text fontWeight="600">{run.qualityScore}</Text>
                                    {run.qualityScore !== 'N/A' && <IconCircleCheck size={14} className="text-fg-success" />}
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
                </Table>
            </Box>
        </Box>
    );
}

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
    IconEllipsisStroke,
    IconCircleExclamation,
    IconTriangleExclamation,
    IconComments,
    IconCheckCircleSolid,
    IconFileArrowUp,
    IconTableCells,
    IconList,
    IconClock,
    IconEnvelope,
    IconHandPointer,
    IconUserCheck,
} from "@optimizely/axiom-icons";
import { Input } from "@/app/components/Input";
import NextLink from "next/link";
import { useState } from "react";

// Notification types
type NotificationType =
    | "agent_log_review"      // Agent log needs review (execution failed, guardrail triggered)
    | "agent_executed"        // Agent executed autonomously
    | "update_available"      // Update available in agent directory
    | "guardrail_triggered"   // Guardrail triggered
    | "execution_failed";     // Execution failed

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    status: "failed" | "review" | "success" | "info";
    agent?: string;
    version?: string;
    timestamp: string;
    date: string; // For grouping: "Today", "Yesterday", etc.
    executionStatus?: "success" | "failed";
    guardrailStatus?: "success" | "failed" | "triggered";
    errorType?: string;
    errorSource?: string;
    duration?: string;
    author?: { name: string; avatar: string | null };
    triggeredBy?: {
        type: "email" | "in_app" | "scheduler" | "user" | "api" | "system";
        name: string;
        username?: string;
    };
    unread?: boolean;
}

const notifications: Notification[] = [
    {
        id: "b2953c08",
        type: "agent_log_review",
        title: "Hypothesis Creator",
        message: "Agent log needs review - execution failed with tool timeout",
        status: "failed",
        agent: "Hypothesis Creator",
        version: "V15",
        timestamp: "4:14:50 PM",
        date: "Today",
        executionStatus: "failed",
        guardrailStatus: "success",
        errorType: "Tool Timeout",
        errorSource: "Agent",
        duration: "62.45s",
        author: { name: "bigmonkiki", avatar: null },
        triggeredBy: { type: "email", name: "Email trigger", username: "john.doe@example.com" },
        unread: true,
    },
    {
        id: "d8k2o19s",
        type: "guardrail_triggered",
        title: "Content Localizer",
        message: "Guardrail triggered - output quality below threshold",
        status: "review",
        agent: "Content Localizer",
        version: "V12",
        timestamp: "2:30:15 PM",
        date: "Today",
        executionStatus: "success",
        guardrailStatus: "triggered",
        errorType: "Evaluation Error",
        errorSource: "Logic: Condition 1",
        duration: "12.20s",
        author: { name: "bigmonkiki", avatar: null },
        triggeredBy: { type: "in_app", name: "Button click", username: "sarah.chen" },
        unread: true,
    },
    {
        id: "f9s2m10x",
        type: "execution_failed",
        title: "Web Researcher",
        message: "Execution failed - trigger timeout exceeded",
        status: "failed",
        agent: "Web Researcher",
        version: "V8",
        timestamp: "11:05:42 AM",
        date: "Today",
        executionStatus: "failed",
        guardrailStatus: "failed",
        errorType: "Trigger Timeout",
        errorSource: "Trigger: In-app Event",
        duration: "120.0s",
        author: { name: "bigmonkiki", avatar: null },
        triggeredBy: { type: "in_app", name: "Page load", username: "mike.wilson" },
        unread: true,
    },
    {
        id: "g7t3n22p",
        type: "agent_executed",
        title: "Email Composer",
        message: "Autonomous workflow completed successfully",
        status: "success",
        agent: "Email Composer",
        version: "V5",
        timestamp: "9:45:00 AM",
        date: "Today",
        executionStatus: "success",
        guardrailStatus: "success",
        duration: "8.32s",
        author: { name: "automation", avatar: null },
        triggeredBy: { type: "scheduler", name: "Daily 9AM" },
    },
    {
        id: "h1k4m33q",
        type: "update_available",
        title: "Data Analyzer",
        message: "New version available in agent directory (V6 → V7)",
        status: "info",
        agent: "Data Analyzer",
        version: "V6",
        timestamp: "Yesterday",
        date: "Yesterday",
        triggeredBy: { type: "system", name: "System update" },
    },
    {
        id: "i2l5n44r",
        type: "agent_executed",
        title: "Report Generator",
        message: "Scheduled workflow executed",
        status: "success",
        agent: "Report Generator",
        version: "V3",
        timestamp: "Yesterday",
        date: "Yesterday",
        executionStatus: "success",
        guardrailStatus: "success",
        duration: "45.20s",
        author: { name: "scheduler", avatar: null },
        triggeredBy: { type: "scheduler", name: "Weekly report" },
    },
];

// Group notifications by date
const groupNotificationsByDate = (items: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {};
    items.forEach(item => {
        if (!groups[item.date]) {
            groups[item.date] = [];
        }
        groups[item.date].push(item);
    });
    return groups;
};

// Get icon based on notification type
const getNotificationIcon = (notification: Notification) => {
    switch (notification.type) {
        case "agent_log_review":
        case "execution_failed":
            return <IconCircleExclamation size={20} />;
        case "guardrail_triggered":
            return <IconTriangleExclamation size={20} />;
        case "agent_executed":
            return <IconCheckCircleSolid size={20} />;
        case "update_available":
            return <IconFileArrowUp size={20} />;
        default:
            return <IconCircleExclamation size={20} />;
    }
};

// Get icon color based on status
const getIconColor = (status: string) => {
    switch (status) {
        case "failed":
            return "fg.error";
        case "review":
            return "fg.warning";
        case "success":
            return "fg.success";
        case "info":
            return "fg.accent";
        default:
            return "fg.tertiary";
    }
};

// Get trigger icon based on trigger type
const getTriggerIcon = (triggerType?: string) => {
    switch (triggerType) {
        case "email":
            return <IconEnvelope size={16} />;
        case "in_app":
            return <IconHandPointer size={16} />;
        case "scheduler":
            return <IconClock size={16} />;
        case "user":
            return <IconUserCheck size={16} />;
        case "api":
        case "system":
        default:
            return <IconClock size={16} />;
    }
};

export default function NotificationsPage() {
    const [typeFilter, setTypeFilter] = useState("All");
    const [placeholderFilter, setPlaceholderFilter] = useState("All");
    const [dateRangeFilter, setDateRangeFilter] = useState("All");
    const [viewMode, setViewMode] = useState<"table" | "card">("card");

    const groupedNotifications = groupNotificationsByDate(notifications);

    return (
        <Box p="32" display="flex" flexDirection="column" gap="24" h="full" bg="bg.page">
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Heading level="2">Notifications</Heading>
                </Box>
            </Box>

            {/* Filters and View Toggle */}
            <Box display="flex" gap="12" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                <Box display="flex" gap="12" alignItems="center" flexWrap="wrap">
                    <Box className="w-[200px]">
                        <Input placeholder="Search" />
                    </Box>

                    <Menu
                        options={[
                            { label: "All", execute: () => setTypeFilter("All") },
                            { label: "Agent Log Review", execute: () => setTypeFilter("Agent Log Review") },
                            { label: "Agent Executed", execute: () => setTypeFilter("Agent Executed") },
                            { label: "Update Available", execute: () => setTypeFilter("Update Available") },
                            { label: "Guardrail Triggered", execute: () => setTypeFilter("Guardrail Triggered") },
                            { label: "Execution Failed", execute: () => setTypeFilter("Execution Failed") },
                        ]}
                    >
                        <MenuTrigger asChild>
                            <LabelMenuButton label="Type" h="40">
                                {typeFilter}
                            </LabelMenuButton>
                        </MenuTrigger>
                        <MenuContent />
                    </Menu>

                    <Menu
                        options={[
                            { label: "All", execute: () => setPlaceholderFilter("All") },
                            { label: "Option 1", execute: () => setPlaceholderFilter("Option 1") },
                            { label: "Option 2", execute: () => setPlaceholderFilter("Option 2") },
                        ]}
                    >
                        <MenuTrigger asChild>
                            <LabelMenuButton label="Placeholder" h="40">
                                {placeholderFilter}
                            </LabelMenuButton>
                        </MenuTrigger>
                        <MenuContent />
                    </Menu>

                    <Menu
                        options={[
                            { label: "All", execute: () => setDateRangeFilter("All") },
                            { label: "Today", execute: () => setDateRangeFilter("Today") },
                            { label: "Last 7 Days", execute: () => setDateRangeFilter("Last 7 Days") },
                            { label: "Last 30 Days", execute: () => setDateRangeFilter("Last 30 Days") },
                        ]}
                    >
                        <MenuTrigger asChild>
                            <LabelMenuButton label="Date Range" h="40">
                                {dateRangeFilter}
                            </LabelMenuButton>
                        </MenuTrigger>
                        <MenuContent />
                    </Menu>
                </Box>

                {/* View Toggle */}
                <Box display="flex" gap="4" alignItems="center">
                    <Button
                        appearance={viewMode === "table" ? "default" : "subtle"}
                        icon={<IconList size={18} />}
                        size="sm"
                        aria-label="Table View"
                        onClick={() => setViewMode("table")}
                    />
                    <Button
                        appearance={viewMode === "card" ? "default" : "subtle"}
                        icon={<IconTableCells size={18} />}
                        size="sm"
                        aria-label="Card View"
                        onClick={() => setViewMode("card")}
                    />
                </Box>
            </Box>

            {/* Card View */}
            {viewMode === "card" && (
                <Box display="flex" flexDirection="column" gap="24" style={{ maxWidth: '980px' }}>
                    {Object.entries(groupedNotifications).map(([date, items]) => (
                        <Box key={date} display="flex" flexDirection="column" gap="12">
                            <Text fontSize="sm" fontWeight="500" color="fg.tertiary">{date}</Text>
                            <Box display="flex" flexDirection="column" gap="12">
                                {items.map((notification) => (
                                    <NextLink key={notification.id} href={`/opal/notifications/${notification.id}`} style={{ textDecoration: 'none' }}>
                                        <Box
                                            display="flex"
                                            alignItems="start"
                                            gap="16"
                                            p="16"
                                            bg="bg.default"
                                            border="1"
                                            borderColor="border.tertiary"
                                            rounded="md"
                                            className="cursor-pointer hover:bg-[var(--ax-colors-bg-default-hovered)] hover:border-[var(--ax-colors-border-default)] transition-colors"
                                        >
                                            {/* Unread indicator */}
                                            {notification.unread && (
                                                <Box
                                                    rounded="full"
                                                    bg="bg.error"
                                                    style={{ width: '8px', height: '8px', flexShrink: 0, marginTop: '6px' }}
                                                />
                                            )}
                                            {!notification.unread && (
                                                <Box style={{ width: '8px', flexShrink: 0 }} />
                                            )}

                                            {/* Icon */}
                                            <Box
                                                color={getIconColor(notification.status)}
                                                mt="2"
                                            >
                                                {getNotificationIcon(notification)}
                                            </Box>

                                            {/* Content */}
                                            <Box display="flex" flexDirection="column" gap="4" flex="1">
                                                {/* Title row with timestamp - vertically center aligned */}
                                                <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
                                                    <Box display="flex" alignItems="center" gap="8">
                                                        <Text fontWeight="500" color="fg.default">
                                                            {notification.title}
                                                        </Text>
                                                        {notification.status === 'failed' && (
                                                            <Button
                                                                appearance="subtle"
                                                                icon={<IconComments size={16} />}
                                                                size="sm"
                                                                aria-label="Comments"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        )}
                                                    </Box>
                                                    {/* Timestamp - vertically center aligned with title */}
                                                    <Text fontSize="xs" color="fg.tertiary" style={{ whiteSpace: 'nowrap' }}>
                                                        {notification.timestamp}
                                                    </Text>
                                                </Box>
                                                <Text fontSize="sm" color="fg.secondary">
                                                    {notification.message}
                                                </Text>
                                            </Box>

                                            {/* Actions */}
                                            <Button
                                                appearance="subtle"
                                                icon={<IconEllipsisStroke />}
                                                size="sm"
                                                aria-label="Options"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </Box>
                                    </NextLink>
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Table View */}
            {viewMode === "table" && (
                <Box overflow="hidden">
                    <Table>
                        <thead>
                            <Tr>
                                <Th>Type</Th>
                                <Th>Notification / Context</Th>
                                <Th>Status / Diagnostics</Th>
                                <Th>Triggered by</Th>
                                <Th>Time</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </thead>
                        <tbody>
                            {notifications.map((notification) => (
                                <Tr key={notification.id} url={`/opal/notifications/${notification.id}`}>
                                    {/* Type - Status icon only */}
                                    <Td>
                                        <Box display="flex" alignItems="center" justifyContent="center">
                                            {notification.status === 'failed' ? (
                                                <Box color="fg.error"><IconCircleExclamation size={20} /></Box>
                                            ) : notification.status === 'review' ? (
                                                <Box color="fg.warning"><IconTriangleExclamation size={20} /></Box>
                                            ) : notification.status === 'success' ? (
                                                <Box color="fg.success"><IconCheckCircleSolid size={20} /></Box>
                                            ) : (
                                                <Box color="fg.accent"><IconFileArrowUp size={20} /></Box>
                                            )}
                                        </Box>
                                    </Td>

                                    {/* Notification / Context */}
                                    <Td>
                                        <Link asChild color="fg.default" fontWeight="600" className="underline underline-offset-4 decoration-border-default hover:decoration-fg-default transition-colors">
                                            <NextLink href={`/opal/notifications/${notification.id}`}>
                                                {notification.agent || notification.title}
                                            </NextLink>
                                        </Link>
                                        <Text fontSize="sm" color="fg.secondary" mt="4">{notification.message}</Text>
                                        <Text fontSize="xs" color="fg.tertiary" mt="4">{notification.id}</Text>
                                    </Td>

                                    {/* Status / Diagnostics - Badge at top */}
                                    <Td>
                                        <Box display="flex" flexDirection="column" gap="8" alignItems="start">
                                            <Badge
                                                intent={
                                                    notification.type === "agent_executed" ? "success" :
                                                        notification.type === "update_available" ? "information" :
                                                            notification.type === "guardrail_triggered" ? "warning" :
                                                                "danger"
                                                }
                                            >
                                                {notification.type === "agent_log_review" && "Log Review"}
                                                {notification.type === "agent_executed" && "Executed"}
                                                {notification.type === "update_available" && "Update"}
                                                {notification.type === "guardrail_triggered" && "Guardrail"}
                                                {notification.type === "execution_failed" && "Failed"}
                                            </Badge>
                                            {notification.errorSource && (
                                                <Box display="flex" alignItems="center" gap="8">
                                                    <Text fontSize="xs" color="fg.tertiary" fontWeight="600" textTransform="uppercase">{notification.errorSource}</Text>
                                                    {notification.version && <Text fontSize="xs" color="fg.tertiary">{notification.version}</Text>}
                                                </Box>
                                            )}
                                            {notification.errorType && (
                                                <Text fontSize="sm" color={notification.status === 'failed' ? 'fg.error' : 'fg.warning'}>
                                                    {notification.errorType}
                                                </Text>
                                            )}
                                            {notification.duration && (
                                                <Text fontSize="xs" color="fg.tertiary">Duration: {notification.duration}</Text>
                                            )}
                                        </Box>
                                    </Td>

                                    {/* Triggered by */}
                                    <Td>
                                        {notification.triggeredBy ? (
                                            <Box display="flex" flexDirection="column" gap="4">
                                                <Box display="flex" alignItems="center" gap="8">
                                                    <Box color="fg.tertiary">
                                                        {getTriggerIcon(notification.triggeredBy.type)}
                                                    </Box>
                                                    <Text fontSize="sm" color="fg.default">{notification.triggeredBy.name}</Text>
                                                </Box>
                                                {notification.triggeredBy.username && (
                                                    <Box display="flex" alignItems="center" gap="8">
                                                        <Avatar name={notification.triggeredBy.username} size="xs" />
                                                        <Text fontSize="xs" color="fg.tertiary">{notification.triggeredBy.username}</Text>
                                                    </Box>
                                                )}
                                            </Box>
                                        ) : (
                                            <Text fontSize="sm" color="fg.tertiary">—</Text>
                                        )}
                                    </Td>

                                    {/* Time */}
                                    <Td>
                                        <Text color="fg.default">{notification.timestamp}</Text>
                                        <Text fontSize="xs" color="fg.tertiary" mt="4">{notification.date}</Text>
                                    </Td>

                                    {/* Actions */}
                                    <Td>
                                        <Button appearance="subtle" icon={<IconEllipsisStroke />} size="sm" aria-label="Options" />
                                    </Td>
                                </Tr>
                            ))}
                        </tbody>
                    </Table>
                </Box>
            )}
        </Box>
    );
}

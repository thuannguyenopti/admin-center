"use client";

import {
    Box,
    Heading,
    Text,
    Button,
    Badge,
    Menu,
    MenuTrigger,
    MenuContent,
    LabelMenuButton,
    Checkbox,
    Separator,
    Pagination,
} from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
    IconClock,
    IconCheck,
    IconChecks,
    IconTrash,
    IconBellOff,
    IconInbox,
    IconLayoutGrid,
    IconList,
    IconLayoutList,
} from "@tabler/icons-react";
import {
    IconEllipsisStroke,
    IconCircleExclamation,
    IconTriangleExclamation,
    IconUserGroup,
    IconCheck as IconCheckAxiom,
    IconToggleOff,
} from "@optimizely/axiom-icons";
import { Input } from "@/app/components/Input";
import NextLink from "next/link";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
    mockNotifications,
    filterNotifications,
    searchNotifications,
    getUnreadCount,
    getUniqueAgentNames,
    getCategoryLabel,
    type Notification,
} from "./mockData";

// ── Unread Indicator ──────────────────────────────────────────────────────────

function UnreadIndicator() {
    return (
        <Box
            rounded="full"
            style={{
                width: 8,
                height: 8,
                backgroundColor: "var(--ax-colors-fg-error)",
                flexShrink: 0,
            }}
        />
    );
}

// ── Priority Dot ──────────────────────────────────────────────────────────────

function PriorityDot({ priority }: { priority: Notification["priority"] }) {
    if (priority === "low" || priority === "medium") return null;
    const colors: Record<string, string> = {
        medium: "#3B82F6",
        high: "#F97316",
        critical: "#EF4444",
    };
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            className="relative"
        >
            <Box
                rounded="full"
                style={{
                    width: 8,
                    height: 8,
                    backgroundColor: colors[priority],
                    flexShrink: 0,
                }}
            />
            {priority === "critical" && (
                <Box
                    rounded="full"
                    className="absolute animate-ping"
                    style={{
                        width: 8,
                        height: 8,
                        backgroundColor: colors[priority],
                        opacity: 0.6,
                    }}
                />
            )}
        </Box>
    );
}

// ── Category Icon ─────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: Notification["category"] }) {
    const colorMap: Record<string, { intent: string; variant: "subtle" | "strong" }> = {
        agent_execution: { intent: "primary", variant: "subtle" },
        guardrail: { intent: "warning", variant: "subtle" },
        directory: { intent: "information", variant: "subtle" },
        tools: { intent: "success", variant: "subtle" },
        system: { intent: "neutral", variant: "subtle" },
        collaboration: { intent: "success", variant: "subtle" },
    };
    const config = colorMap[category] || { intent: "neutral", variant: "subtle" };
    return (
        <Badge variant={config.variant as any} intent={config.intent as any} className="whitespace-nowrap">
            {getCategoryLabel(category)}
        </Badge>
    );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 20;

const CATEGORY_OPTIONS = [
    "All",
    "agent_execution",
    "guardrail",
    "directory",
    "tools",
    "collaboration",
    "system",
];

const STATUS_OPTIONS = ["All", "Unread", "Read"];
const PRIORITY_OPTIONS = ["All", "Critical", "High", "Medium", "Low"];
const DATE_OPTIONS = [
    "All",
    "Last Hour",
    "Last 24 Hours",
    "Last 7 Days",
    "Last 30 Days",
];

// ── Notification Center Component ─────────────────────────────────────────────

export default function NotificationCenter({ sidebarMode = false }: { sidebarMode?: boolean }) {
    const [notifications, setNotifications] =
        useState<Notification[]>(mockNotifications);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [agentFilter, setAgentFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [dateRangeFilter, setDateRangeFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<"list" | "card" | "detailed">("detailed");
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading
    useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(t);
    }, []);



    // Agent names for filter
    const agentNames = useMemo(
        () => getUniqueAgentNames(notifications),
        [notifications]
    );

    // Filtered + searched results
    const filteredNotifications = useMemo(() => {
        let result = filterNotifications(notifications, {
            category: categoryFilter,
            status: statusFilter,
            agent: agentFilter,
            priority: priorityFilter,
            dateRange: dateRangeFilter,
        });
        result = searchNotifications(result, searchQuery);
        return result;
    }, [
        notifications,
        categoryFilter,
        statusFilter,
        agentFilter,
        priorityFilter,
        dateRangeFilter,
        searchQuery,
    ]);

    // Pagination
    const totalPages = Math.max(
        1,
        Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE)
    );
    const paginatedNotifications = sidebarMode
        ? filteredNotifications.filter((n) => n.status === "unread").slice(0, 4)
        : filteredNotifications.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [
        categoryFilter,
        statusFilter,
        agentFilter,
        priorityFilter,
        dateRangeFilter,
        searchQuery,
    ]);

    // Unread count
    const unreadCount = getUnreadCount(notifications);

    // Selection handlers
    const allOnPageSelected =
        paginatedNotifications.length > 0 &&
        paginatedNotifications.every((n) => selectedIds.has(n.id));

    const toggleSelectAll = () => {
        if (allOnPageSelected) {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                paginatedNotifications.forEach((n) => next.delete(n.id));
                return next;
            });
        } else {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                paginatedNotifications.forEach((n) => next.add(n.id));
                return next;
            });
        }
    };

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        if (isSelectionMode) {
            setSelectedIds(new Set()); // Clear selection when exiting mode
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Bulk actions
    const handleBulkMarkAsRead = useCallback(() => {
        setNotifications((prev) =>
            prev.map((n) =>
                selectedIds.has(n.id) ? { ...n, status: "read" as const } : n
            )
        );
        setSelectedIds(new Set());
    }, [selectedIds]);

    const handleBulkMarkAsUnread = useCallback(() => {
        setNotifications((prev) =>
            prev.map((n) =>
                selectedIds.has(n.id) ? { ...n, status: "unread" as const } : n
            )
        );
        setSelectedIds(new Set());
    }, [selectedIds]);

    const handleBulkDismiss = useCallback(() => {
        setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
        setSelectedIds(new Set());
    }, [selectedIds]);

    const handleMarkAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, status: "read" as const }))
        );
    };

    // Status icon
    const getStatusIcon = (n: Notification) => {
        if (n.executionStatus === "failed" || n.guardrailStatus === "terminated" || n.guardrailStatus === "failed") {
            return <IconCircleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-error)" }} />;
        }
        if (n.guardrailStatus === "warning" || n.guardrailStatus === "triggered") {
            return <IconTriangleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-warning)" }} />;
        }
        return null;
    };

    // Type icon (collaboration subtypes)
    const getTypeIcon = (n: Notification) => {
        switch (n.type) {
            case "collaboration_agent_modified":
                return <IconUserGroup style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)" }} />;
            case "collaboration_agent_activated":
                return <IconCheckAxiom style={{ width: 16, height: 16, color: "var(--ax-colors-fg-success)" }} />;
            case "collaboration_agent_deactivated":
                return <IconToggleOff style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)" }} />;
            default:
                return null;
        }
    };

    // ── Loading Skeleton ────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <Box
                p="32"
                display="flex"
                flexDirection="column"
                gap="24"
                h="full"
                bg="bg.default"
            >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box bg="bg.secondary" rounded="md" style={{ width: 200, height: 32 }} className="animate-pulse" />
                    <Box bg="bg.secondary" rounded="md" style={{ width: 120, height: 36 }} className="animate-pulse" />
                </Box>
                <Box display="flex" gap="12">
                    {[300, 140, 140, 140, 140].map((w, i) => (
                        <Box key={i} bg="bg.secondary" rounded="md" style={{ width: w, height: 40 }} className="animate-pulse" />
                    ))}
                </Box>
                <Box border="1" borderColor="border.tertiary" rounded="md" overflow="hidden">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Box key={i} display="flex" gap="16" p="16" borderB="1" borderColor="border.tertiary">
                            <Box bg="bg.secondary" rounded="sm" style={{ width: 20, height: 20 }} className="animate-pulse" />
                            <Box flex="1" display="flex" flexDirection="column" gap="8">
                                <Box bg="bg.secondary" rounded="sm" style={{ width: "60%", height: 16 }} className="animate-pulse" />
                                <Box bg="bg.secondary" rounded="sm" style={{ width: "90%", height: 14 }} className="animate-pulse" />
                            </Box>
                            <Box bg="bg.secondary" rounded="sm" style={{ width: 80, height: 16 }} className="animate-pulse" />
                        </Box>
                    ))}
                </Box>
            </Box>
        );
    }

    return (
        <Box
            p="32"
            display="flex"
            flexDirection="column"
            gap="24"
            h="full"
            bg="bg.default"
        >
            {/* ── Header ────────────────────────────────────────────────────────── */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap="12">
                    <Heading level="2">Inbox</Heading>
                    {unreadCount > 0 && (
                        <Badge intent="information">{unreadCount} unread</Badge>
                    )}
                </Box>
                <Box display="flex" gap="8">
                    <Button
                        appearance="subtle"
                        size="sm"
                        icon={<IconChecks size={16} />}
                        onClick={handleMarkAllAsRead}
                    >
                        Mark all as read
                    </Button>
                </Box>
            </Box>

            {/* ── Filters ───────────────────────────────────────────────────────── */}
            {!sidebarMode && (
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="12">
                    <Box display="flex" gap="12" alignItems="center" flexWrap="wrap">
                        <Box className="w-[300px]">
                            <Input
                                placeholder="Search notifications..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </Box>

                        <Menu
                            options={CATEGORY_OPTIONS.map((opt) => ({
                                label: opt === "All" ? "All Types" : getCategoryLabel(opt),
                                execute: () => setCategoryFilter(opt),
                            }))}
                        >
                            <MenuTrigger asChild>
                                <LabelMenuButton label="Type" h="40">
                                    {categoryFilter === "All"
                                        ? "All Types"
                                        : getCategoryLabel(categoryFilter)}
                                </LabelMenuButton>
                            </MenuTrigger>
                            <MenuContent />
                        </Menu>

                        <Menu
                            options={STATUS_OPTIONS.map((opt) => ({
                                label: opt,
                                execute: () => setStatusFilter(opt),
                            }))}
                        >
                            <MenuTrigger asChild>
                                <LabelMenuButton label="Status" h="40">
                                    {statusFilter}
                                </LabelMenuButton>
                            </MenuTrigger>
                            <MenuContent />
                        </Menu>

                        <Menu
                            options={["All", ...agentNames].map((opt) => ({
                                label: opt === "All" ? "All Agents" : opt,
                                execute: () => setAgentFilter(opt),
                            }))}
                        >
                            <MenuTrigger asChild>
                                <LabelMenuButton label="Agent" h="40">
                                    {agentFilter === "All" ? "All Agents" : agentFilter}
                                </LabelMenuButton>
                            </MenuTrigger>
                            <MenuContent />
                        </Menu>

                        <Menu
                            options={PRIORITY_OPTIONS.map((opt) => ({
                                label: opt,
                                execute: () => setPriorityFilter(opt),
                            }))}
                        >
                            <MenuTrigger asChild>
                                <LabelMenuButton label="Priority" h="40">
                                    {priorityFilter}
                                </LabelMenuButton>
                            </MenuTrigger>
                            <MenuContent />
                        </Menu>

                        <Menu
                            options={DATE_OPTIONS.map((opt) => ({
                                label: opt === "All" ? "All Time" : opt,
                                execute: () => setDateRangeFilter(opt),
                            }))}
                        >
                            <MenuTrigger asChild>
                                <LabelMenuButton label="Time" h="40">
                                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <IconClock size={16} />
                                        {dateRangeFilter === "All" ? "All Time" : dateRangeFilter}
                                    </span>
                                </LabelMenuButton>
                            </MenuTrigger>
                            <MenuContent />
                        </Menu>
                    </Box>

                    <Box display="flex" alignItems="center" gap="12">
                        {viewMode !== "list" && (
                            <Button
                                appearance={isSelectionMode ? "primary" : "subtle"}
                                size="sm"
                                onClick={toggleSelectionMode}
                            >
                                {isSelectionMode ? "Done" : "Bulk Select"}
                            </Button>
                        )}
                        <Box display="flex" bg="bg.secondary" p="2" rounded="md" gap="2">
                            <Button
                                appearance={viewMode === "list" ? "default" : "subtle"}
                                size="sm"
                                icon={<IconList size={16} />}
                                onClick={() => setViewMode("list")}
                                aria-label="Table view"
                            />
                            <Button
                                appearance={viewMode === "detailed" ? "default" : "subtle"}
                                size="sm"
                                icon={<IconLayoutList size={16} />}
                                onClick={() => setViewMode("detailed")}
                                aria-label="Detailed view"
                            />
                            <Button
                                appearance={viewMode === "card" ? "default" : "subtle"}
                                size="sm"
                                icon={<IconLayoutGrid size={16} />}
                                onClick={() => setViewMode("card")}
                                aria-label="Grid view"
                            />
                        </Box>
                    </Box>
                </Box>
            )}

            {/* ── Bulk Actions Bar ──────────────────────────────────────────────── */}
            {selectedIds.size > 0 && (
                <Box
                    display="flex"
                    alignItems="center"
                    gap="12"
                    p="12"
                    bg="bg.information.subtle"
                    rounded="md"
                    border="1"
                    borderColor="border.default"
                >
                    <Text fontWeight="600" fontSize="sm">
                        {selectedIds.size} selected
                    </Text>
                    <Separator orientation="vertical" />
                    <Button
                        appearance="subtle"
                        size="sm"
                        icon={<IconCheck size={14} />}
                        onClick={handleBulkMarkAsRead}
                    >
                        Mark as read
                    </Button>
                    <Button
                        appearance="subtle"
                        size="sm"
                        icon={<IconBellOff size={14} />}
                        onClick={handleBulkMarkAsUnread}
                    >
                        Mark as unread
                    </Button>
                    <Button
                        appearance="subtle"
                        size="sm"
                        icon={<IconTrash size={14} />}
                        onClick={handleBulkDismiss}
                    >
                        Dismiss
                    </Button>
                </Box>
            )}

            {/* ── Empty State ───────────────────────────────────────────────────── */}
            {filteredNotifications.length === 0 && (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    py="64"
                    gap="16"
                >
                    <Box
                        p="16"
                        bg="bg.secondary"
                        rounded="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <IconInbox size={40} color="var(--ax-colors-fg-tertiary)" />
                    </Box>
                    <Heading level="3" color="fg.secondary">
                        No notifications found
                    </Heading>
                    <Text color="fg.tertiary" textAlign="center" style={{ maxWidth: 400 }}>
                        {searchQuery
                            ? `No results for "${searchQuery}". Try a different search term or adjust your filters.`
                            : "You're all caught up! New notifications will appear here."}
                    </Text>
                    {(searchQuery ||
                        categoryFilter !== "All" ||
                        statusFilter !== "All" ||
                        agentFilter !== "All" ||
                        priorityFilter !== "All" ||
                        dateRangeFilter !== "All") && (
                            <Button
                                appearance="subtle"
                                onClick={() => {
                                    setSearchQuery("");
                                    setCategoryFilter("All");
                                    setStatusFilter("All");
                                    setAgentFilter("All");
                                    setPriorityFilter("All");
                                    setDateRangeFilter("All");
                                }}
                            >
                                Clear all filters
                            </Button>
                        )}
                </Box>
            )}

            {/* ── Notification Table / Grid ─────────────────────────────────────── */}
            {filteredNotifications.length > 0 && (
                <Box overflow="hidden" flex="1">
                    {viewMode === "list" ? (
                        <Table>
                            <thead>
                                <Tr>
                                    <Th style={{ width: 40 }}>
                                        <Checkbox
                                            checked={allOnPageSelected}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </Th>
                                    <Th style={{ width: 24 }}></Th>
                                    <Th>Notification</Th>
                                    <Th>Category</Th>
                                    <Th>Timestamp</Th>
                                    <Th>Priority</Th>
                                    <Th style={{ width: 40 }}></Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {paginatedNotifications.map((n) => (
                                    <Tr
                                        key={n.id}
                                        url={n.deepLink}
                                        style={{
                                            backgroundColor:
                                                n.status === "unread"
                                                    ? "var(--ax-colors-bg-secondary)"
                                                    : undefined,
                                        }}
                                    >
                                        <Td style={{ width: 40 }}>
                                            <Box onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedIds.has(n.id)}
                                                    onCheckedChange={() => toggleSelect(n.id)}
                                                />
                                            </Box>
                                        </Td>
                                        <Td style={{ width: 24, verticalAlign: "middle" }}>
                                            {/* Unread Indicator */}
                                            {n.status === "unread" && <UnreadIndicator />}
                                        </Td>
                                        <Td>
                                            <Box display="flex" flexDirection="column" gap="4">
                                                <Box display="flex" alignItems="center" gap="8">
                                                    {getStatusIcon(n)}
                                                    <Box
                                                        fontWeight={n.status === "unread" ? "600" : "400"}
                                                        color="fg.default"
                                                    >
                                                        {n.title}
                                                    </Box>
                                                    {n.actionRequired && (
                                                        <Badge intent="warning" variant="subtle">
                                                            Action
                                                        </Badge>
                                                    )}
                                                </Box>
                                                <Box
                                                    fontSize="sm"
                                                    color="fg.tertiary"
                                                    className="line-clamp-1"
                                                    style={{ maxWidth: 500 }}
                                                >
                                                    {n.message}
                                                </Box>
                                            </Box>
                                        </Td>
                                        <Td>
                                            <CategoryBadge category={n.category} />
                                        </Td>
                                        <Td>
                                            <Box display="flex" flexDirection="column" gap="2">
                                                <Text fontSize="sm" color="fg.default">
                                                    {n.timestamp}
                                                </Text>
                                                <Text fontSize="xs" color="fg.tertiary">
                                                    {n.date}
                                                </Text>
                                            </Box>
                                        </Td>
                                        <Td>
                                            <Text
                                                fontSize="sm"
                                                fontWeight="500"
                                                color={
                                                    n.priority === "critical"
                                                        ? "fg.error"
                                                        : n.priority === "high"
                                                            ? "fg.warning"
                                                            : "fg.tertiary"
                                                }
                                                textTransform="capitalize"
                                            >
                                                {n.priority}
                                            </Text>
                                        </Td>
                                        <Td style={{ width: 40 }}>
                                            <Box onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    appearance="subtle"
                                                    icon={<IconEllipsisStroke />}
                                                    size="sm"
                                                    aria-label="Options"
                                                />
                                            </Box>
                                        </Td>
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : viewMode === "card" ? (
                        <Box
                            display="grid"
                            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}
                        >
                            {paginatedNotifications.map((n) => (
                                <NextLink key={n.id} href={n.deepLink} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                                    <div
                                        className="hover:shadow-md transition-shadow cursor-pointer h-full"
                                        style={{
                                            position: "relative",
                                            display: "flex",
                                            gap: "12px",
                                            padding: "16px",
                                            backgroundColor: n.status === "unread" ? "var(--ax-colors-bg-secondary)" : "var(--ax-colors-bg-default)",
                                            border: "1px solid var(--ax-colors-border-tertiary)",
                                            borderRadius: "8px",
                                        }}
                                    >
                                        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10 }} onClick={(e: any) => e.stopPropagation()}>
                                            {isSelectionMode && (
                                                <Checkbox
                                                    checked={selectedIds.has(n.id)}
                                                    onCheckedChange={() => toggleSelect(n.id)}
                                                />
                                            )}
                                        </div>
                                        {/* Content column */}
                                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                                                    {getStatusIcon(n)}
                                                    <CategoryBadge category={n.category} />
                                                </div>
                                                <div style={{ fontWeight: n.status === "unread" ? "600" : "500" }} className="line-clamp-1">
                                                    {n.title}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: "14px", color: "var(--ax-colors-fg-secondary)", minHeight: "40px" }} className="line-clamp-2">
                                                {n.message}
                                            </div>
                                            <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <p style={{ fontSize: "12px", color: "var(--ax-colors-fg-tertiary)", margin: 0 }}>
                                                    {n.date}, {n.timestamp}
                                                </p>
                                                {n.actionRequired && (
                                                    <div>
                                                        <span style={{
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            padding: "2px 8px",
                                                            borderRadius: "9999px",
                                                            backgroundColor: "var(--ax-colors-bg-warning-subtle)",
                                                            color: "var(--ax-colors-fg-warning)",
                                                            fontSize: "12px",
                                                            fontWeight: 500,
                                                            whiteSpace: "nowrap"
                                                        }}>
                                                            Action Required
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Red dot column - moved to end */}
                                        <div style={{ display: "flex", alignItems: "flex-start", paddingTop: "6px", width: "16px", minWidth: "16px", flexShrink: 0, justifyContent: "center" }}>
                                            {n.status === "unread" && (
                                                <div style={{ width: "8px", height: "8px", borderRadius: "9999px", backgroundColor: "var(--ax-colors-fg-error)" }} />
                                            )}
                                        </div>
                                    </div>
                                </NextLink>
                            ))}
                        </Box>
                    ) : (
                        <Box display="flex" flexDirection="column" gap="24" pb="32">
                            {Object.entries(
                                paginatedNotifications.reduce((groups, n) => {
                                    const date = n.date;
                                    if (!groups[date]) groups[date] = [];
                                    groups[date].push(n);
                                    return groups;
                                }, {} as Record<string, Notification[]>)
                            ).map(([date, notifications]) => (
                                <Box key={date} display="flex" flexDirection="column" gap="16">
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Text fontSize="md" fontWeight="500" color="fg.tertiary">
                                            {date}
                                        </Text>
                                        {isSelectionMode && (
                                            <Button
                                                appearance="subtle"
                                                size="sm"
                                                onClick={() => {
                                                    const ids = notifications.map(n => n.id);
                                                    const allSelected = ids.every(id => selectedIds.has(id));
                                                    setSelectedIds(prev => {
                                                        const next = new Set(prev);
                                                        ids.forEach(id => {
                                                            if (allSelected) next.delete(id);
                                                            else next.add(id);
                                                        });
                                                        return next;
                                                    });
                                                }}
                                            >
                                                {notifications.every(n => selectedIds.has(n.id)) ? "Deselect group" : "Select group"}
                                            </Button>
                                        )}
                                    </Box>
                                    <Box display="flex" flexDirection="column" gap="16">
                                        {notifications.map((n) => (
                                            <NextLink key={n.id} href={n.deepLink} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                                                <Box
                                                    className="hover:shadow-sm transition-shadow cursor-pointer"
                                                    p="16"
                                                    bg={n.status === "unread" ? "bg.default" : "bg.secondary"}
                                                    border="1"
                                                    borderColor="border.tertiary"
                                                    rounded="xl"
                                                    display="flex"
                                                    gap="16"
                                                    alignItems="start"
                                                >
                                                    <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10 }} onClick={(e: any) => e.stopPropagation()}>
                                                        {isSelectionMode && (
                                                            <Checkbox
                                                                checked={selectedIds.has(n.id)}
                                                                onCheckedChange={() => toggleSelect(n.id)}
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Status Icon */}
                                                    <Box style={{ flexShrink: 0 }} pt="4">
                                                        {getStatusIcon(n) || getTypeIcon(n) || <IconInbox style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)" }} />}
                                                    </Box>

                                                    {/* Content Column */}
                                                    <Box flex="1" display="flex" flexDirection="column" gap="4" style={{ minWidth: 0 }}>
                                                        <Text
                                                            fontWeight={n.status === "unread" ? "600" : "500"}
                                                            fontSize="md"
                                                            color="fg.default"
                                                            className="line-clamp-1"
                                                        >
                                                            {n.title}
                                                        </Text>
                                                        <Box display="flex" alignItems="center" gap="4" flexWrap="wrap">
                                                            <Text fontSize="sm" color="fg.tertiary">
                                                                {getCategoryLabel(n.category)}
                                                            </Text>
                                                            <Text fontSize="sm" color="fg.tertiary">•</Text>
                                                            <Text fontSize="sm" color="fg.tertiary" className="line-clamp-1">
                                                                {n.message}
                                                            </Text>
                                                        </Box>
                                                    </Box>

                                                    {/* Meta Column */}
                                                    <Box display="flex" alignItems="center" gap="8" pt="6" style={{ flexShrink: 0 }}>
                                                        {n.actionRequired && (
                                                            <Badge intent="warning" variant="subtle" size="sm" className="whitespace-nowrap">
                                                                Action Required
                                                            </Badge>
                                                        )}
                                                        <Text fontSize="sm" color="fg.tertiary" className="whitespace-nowrap">
                                                            {n.timestamp}
                                                        </Text>
                                                        <Box style={{ width: 8, height: 8, flexShrink: 0 }}>
                                                            {n.status === "unread" && (
                                                                <UnreadIndicator />
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </NextLink>
                                        ))}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            )}

            {/* ── Pagination ────────────────────────────────────────────────────── */}
            {
                !sidebarMode && filteredNotifications.length > 0 && (
                    <Box display="flex" justifyContent="space-between" alignItems="center" pt="16">
                        <Text fontSize="sm" color="fg.tertiary">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                            {Math.min(currentPage * ITEMS_PER_PAGE, filteredNotifications.length)} of{" "}
                            {filteredNotifications.length} results
                        </Text>
                        {
                            totalPages > 1 && (
                                <Pagination
                                    page={currentPage}
                                    total={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            )
                        }
                    </Box >
                )
            }
        </Box >
    );
}


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
import { IconAgent } from "@optimizely/axiom-icons";
import {
    IconEllipsisSolid,
    IconCircleExclamation,
    IconTriangleExclamation,
    IconUserGroup,
    IconCheck,
    IconCheckDouble,
    IconCirclePause,
    IconScrewdriverWrench,
    IconMegaphone,
    IconArrowsRotate,
    IconCircleCheck,
    IconCircleInfo,
    IconSpinner,
    IconFileLines,
    IconInboxFull,
    IconGear,
    IconTrashCan,
    IconBellSlash,
    IconGrid,
    IconList,
    IconRectangleList,
    IconAngleRight,
    IconAngleDown,
    IconXmark,
} from "@optiaxiom/icons";
import { Input } from "@/app/components/Input";
import NextLink from "next/link";
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
    mockNotifications,
    filterNotifications,
    searchNotifications,
    getUnreadCount,
    getUniqueAgentNames,
    getCategoryLabel,
    getNotificationTypeLabel,
    type Notification,
} from "./mockData";

// ── Smart Grouping ────────────────────────────────────────────────────────────

const SMART_WINDOW_MS = 15 * 60 * 1000;

const TRIGGER_LABELS: Record<string, string> = {
    scheduler: "Scheduler",
    user: "User",
    webhook: "Webhook",
    api: "API",
    in_app: "In-App Event",
    email: "Email",
    system: "System",
};

type NotifGroup = {
    key: string;
    label: string;
    notifications: Notification[];
};

function buildSmartGroups(notifications: Notification[]): NotifGroup[] {
    const sorted = [...notifications].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    const result: NotifGroup[] = [];
    const keyToIdx = new Map<string, number>();

    for (const n of sorted) {
        const smartKey = `${n.agentId ?? n.agentName ?? ""}|${n.triggeredBy?.type ?? ""}|${n.type}`;
        const existingIdx = keyToIdx.get(smartKey);

        if (existingIdx !== undefined) {
            const grp = result[existingIdx];
            const gap = grp.notifications[0].createdAt.getTime() - n.createdAt.getTime();
            if (gap <= SMART_WINDOW_MS) {
                grp.notifications.push(n);
                continue;
            }
        }

        const parts: string[] = [];
        if (n.agentName) parts.push(n.agentName);
        parts.push(getNotificationTypeLabel(n.type));
        if (n.triggeredBy) parts.push(`via ${TRIGGER_LABELS[n.triggeredBy.type] ?? n.triggeredBy.name}`);
        const label = parts.join(" · ");

        const newIdx = result.length;
        result.push({ key: `${smartKey}|${n.id}`, label, notifications: [n] });
        keyToIdx.set(smartKey, newIdx);
    }
    return result;
}

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
        medium: "var(--ax-colors-fg-information)",
        high: "var(--ax-colors-fg-warning)",
        critical: "var(--ax-colors-fg-error)",
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
        guardrail: { intent: "neutral", variant: "strong" },
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

// ── Notification Row ──────────────────────────────────────────────────────────

function NotificationRow({
    n,
    selectedIds,
    toggleSelect,
    getStatusIcon,
    getTypeIcon,
    isChild = false,
}: {
    n: Notification;
    selectedIds: Set<string>;
    toggleSelect: (id: string) => void;
    getStatusIcon: (n: Notification) => React.ReactNode;
    getTypeIcon: (n: Notification) => React.ReactNode;
    isChild?: boolean;
}) {
    return (
        <Tr
            url={n.deepLink}
            style={{
                backgroundColor:
                    n.status === "unread" ? "var(--ax-colors-bg-secondary)" : "var(--ax-colors-bg-page)",
            }}
        >
            <Td style={{ paddingLeft: 4, paddingRight: 0, paddingTop: 8, paddingBottom: 8, verticalAlign: "middle" }}>
                <Box display="flex" alignItems="center" gap="4">
                    {/* dot placeholder always reserves space so checkbox stays aligned on read rows */}
                    <Box style={{ width: 8, height: 8, flexShrink: 0 }}>
                        {n.status === "unread" && <UnreadIndicator />}
                    </Box>
                    <Box onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                            checked={selectedIds.has(n.id)}
                            onCheckedChange={() => toggleSelect(n.id)}
                        />
                    </Box>
                </Box>
            </Td>
            <Td style={{ paddingLeft: isChild ? 48 : 4, paddingTop: 8, paddingBottom: 8 }}>
                <Box display="flex" flexDirection="row" gap="12" alignItems="center">
                    <Box style={{ flexShrink: 0 }}>
                        {getStatusIcon(n) ?? getTypeIcon(n)}
                    </Box>
                    <Box display="flex" flexDirection="column" gap="4">
                        <Box fontWeight={n.status === "unread" ? "600" : "400"} color="fg.default">
                            {n.title}
                        </Box>
                        <Box fontSize="sm" color="fg.tertiary" className="line-clamp-1">
                            {getCategoryLabel(n.category)} · {n.message}
                        </Box>
                        {n.actionRequired && (
                            <Badge intent="warning" variant="subtle" style={{ width: "fit-content" }}>
                                Action Required
                            </Badge>
                        )}
                    </Box>
                </Box>
            </Td>
            <Td style={{ paddingTop: 8, paddingBottom: 8, verticalAlign: "middle" }}>
                <CategoryBadge category={n.category} />
            </Td>
            <Td style={{ paddingTop: 8, paddingBottom: 8, verticalAlign: "middle" }}>
                <Box display="flex" flexDirection="column" gap="2">
                    <Text fontSize="sm" color="fg.default">{n.timestamp}</Text>
                    <Text fontSize="xs" color="fg.tertiary">{n.date}</Text>
                </Box>
            </Td>
            <Td style={{ paddingTop: 8, paddingBottom: 8, verticalAlign: "middle" }}>
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
            <Td style={{ width: n.actionRequired ? 80 : 40, paddingTop: 8, paddingBottom: 8, verticalAlign: "middle" }}>
                <Box onClick={(e) => e.stopPropagation()} display="flex" alignItems="center" gap="4">
                    {n.actionRequired ? (
                        <>
                            <Button appearance="subtle" icon={<IconXmark size={14} />} size="sm" aria-label="Reject" />
                            <Button appearance="subtle" icon={<IconCheck size={14} />} size="sm" aria-label="Approve" style={{ color: "var(--ax-colors-fg-success)" }} />
                        </>
                    ) : (
                        <Button appearance="subtle" icon={<IconEllipsisSolid />} size="sm" aria-label="Options" />
                    )}
                </Box>
            </Td>
        </Tr>
    );
}

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
    const [viewMode, setViewMode] = useState<"list" | "card" | "detailed">("list");
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
    const [isScrolled, setIsScrolled] = useState(false);
    const contentPaneRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = contentPaneRef.current;
        if (!el) return;
        const onScroll = (e: Event) => {
            setIsScrolled((e.target as Element).scrollTop > 20);
        };
        el.addEventListener("scroll", onScroll, true);
        return () => el.removeEventListener("scroll", onScroll, true);
    }, []);

    const toggleGroup = (key: string) => {
        setCollapsedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

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

    // Status icon — matches Figma status icon spec (circle-exclamation / triangle-exclamation / spinner / circle-check)
    const getStatusIcon = (n: Notification) => {
        if (n.executionStatus === "failed" || n.guardrailStatus === "terminated" || n.guardrailStatus === "failed") {
            return <IconCircleExclamation style={{ color: "var(--ax-colors-fg-error)" }} />;
        }
        if (n.guardrailStatus === "warning") {
            return <IconTriangleExclamation style={{ color: "var(--ax-colors-fg-warning)" }} />;
        }
        if (n.guardrailStatus === "triggered") {
            return <IconSpinner style={{ color: "var(--ax-colors-fg-information)" }} className="animate-spin" />;
        }
        if (n.executionStatus === "success" || n.guardrailStatus === "success") {
            return <IconCircleCheck style={{ color: "var(--ax-colors-fg-success)" }} />;
        }
        return null;
    };

    // Type icon — covers every NotificationType so the IconInbox fallback is never reached
    const getTypeIcon = (n: Notification) => {
        switch (n.type) {
            // ── Agent Directory ──────────────────────────────────────────────────
            case "directory_update_available":
                return <IconArrowsRotate style={{ color: "var(--ax-colors-fg-accent)" }} />;
            case "directory_new_agent":
            case "directory_install_request":
                return <IconAgent style={{ color: "var(--ax-colors-fg-tertiary)" }} />;

            // ── Approval (routes by category) ────────────────────────────────────
            case "approval_required":
                if (n.category === "directory")
                    return <IconAgent style={{ color: "var(--ax-colors-fg-tertiary)" }} />;
                if (n.category === "tools")
                    return <IconScrewdriverWrench style={{ color: "var(--ax-colors-fg-tertiary)" }} />;
                return <IconCircleInfo style={{ color: "var(--ax-colors-fg-information)" }} />;

            // ── Agent Execution ──────────────────────────────────────────────────
            case "agent_execution_chat":
            case "agent_execution_autonomous":
                return <IconCircleInfo style={{ color: "var(--ax-colors-fg-information)" }} />;
            case "agent_execution_failed":
                return <IconCircleExclamation style={{ color: "var(--ax-colors-fg-error)" }} />;
            case "agent_execution_long_running":
                return <IconSpinner style={{ color: "var(--ax-colors-fg-information)" }} className="animate-spin" />;

            // ── Guardrail ────────────────────────────────────────────────────────
            case "guardrail_observer":
            case "guardrail_enforcer":
            case "guardrail_quality":
            case "guardrail_support_ticket":
                return <IconCircleInfo style={{ color: "var(--ax-colors-fg-information)" }} />;

            // ── Tools ────────────────────────────────────────────────────────────
            case "tools_new_available":
            case "tools_deprecated":
            case "tools_auth_required":
            case "tools_auth_expired":
                return <IconScrewdriverWrench style={{ color: "var(--ax-colors-fg-tertiary)" }} />;

            // ── Collaboration ────────────────────────────────────────────────────
            case "collaboration_agent_modified":
                return <IconUserGroup style={{ color: "var(--ax-colors-fg-tertiary)" }} />;
            case "collaboration_agent_activated":
                return <IconCheck style={{ color: "var(--ax-colors-fg-success)" }} />;
            case "collaboration_agent_deactivated":
                return <IconCirclePause style={{ color: "var(--ax-colors-fg-error)" }} />;

            // ── System ───────────────────────────────────────────────────────────
            case "system_announcement":
                return <IconMegaphone style={{ color: "var(--ax-colors-fg-information)" }} />;
            case "system_maintenance":
                return <IconGear style={{ color: "var(--ax-colors-fg-tertiary)" }} />;

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
                style={{ height: "calc(100dvh - 48px)" }}
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
            display="flex"
            flexDirection="column"
            style={{ height: "calc(100dvh - 48px)", overflow: "hidden" }}
            bg="bg.default"
        >
            {/* ── Sticky collapsible header ─────────────────────────────────────── */}
            <Box
                px="32"
                style={{
                    flexShrink: 0,
                    background: "var(--ax-colors-bg-page)",
                    transition: "padding 0.2s ease",
                    paddingTop: isScrolled ? 12 : 24,
                    paddingBottom: isScrolled ? 12 : 0,
                }}
            >
                {/* Heading row — collapses on scroll */}
                <Box
                    style={{
                        overflow: "hidden",
                        maxHeight: isScrolled ? 0 : 80,
                        opacity: isScrolled ? 0 : 1,
                        marginBottom: isScrolled ? 0 : 16,
                        transition: "max-height 0.2s ease, opacity 0.15s ease, margin-bottom 0.2s ease",
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap="12">
                            <Heading level="1">Activities</Heading>
                            {unreadCount > 0 && (
                                <Badge intent="information">{unreadCount} unread</Badge>
                            )}
                        </Box>
                        <Box display="flex" gap="8">
                            {!sidebarMode && (
                                <NextLink href="/opal/notification-catalog" style={{ textDecoration: "none" }}>
                                    <Button
                                        appearance="subtle"
                                        size="sm"
                                        icon={<IconList />}
                                    >
                                        Notification catalog
                                    </Button>
                                </NextLink>
                            )}
                            <Button
                                appearance="subtle"
                                size="sm"
                                icon={<IconCheckDouble />}
                                onClick={handleMarkAllAsRead}
                            >
                                Mark all as read
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* ── Filters — stays visible when scrolled ─────────────────────── */}
            {!sidebarMode && (
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="12">
                    <Box display="flex" gap="12" alignItems="center" flexWrap="wrap">
                        <Box style={{ width: 264 }}>
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
                                    {dateRangeFilter === "All" ? "All Time" : dateRangeFilter}
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
                                icon={<IconList />}
                                onClick={() => setViewMode("list")}
                                aria-label="Table view"
                            />
                            <Button
                                appearance={viewMode === "detailed" ? "default" : "subtle"}
                                size="sm"
                                icon={<IconRectangleList />}
                                onClick={() => setViewMode("detailed")}
                                aria-label="Detailed view"
                            />
                            <Button
                                appearance={viewMode === "card" ? "default" : "subtle"}
                                size="sm"
                                icon={<IconGrid />}
                                onClick={() => setViewMode("card")}
                                aria-label="Grid view"
                            />
                        </Box>
                    </Box>
                </Box>
            )}
            </Box>{/* end sticky header */}

            {/* ── Scrollable content area ───────────────────────────────────────── */}
            <Box ref={contentPaneRef} flex="1" overflow="auto" px="32" pt="16" display="flex" flexDirection="column" gap="16" style={{ minHeight: 0 }}>

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
                        icon={<IconBellSlash size={14} />}
                        onClick={handleBulkMarkAsUnread}
                    >
                        Mark as unread
                    </Button>
                    <Button
                        appearance="subtle"
                        size="sm"
                        icon={<IconTrashCan size={14} />}
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
                        <IconInboxFull style={{ width: 40, height: 40, color: "var(--ax-colors-fg-tertiary)" }} />
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
                <Box>
                    {viewMode === "list" ? (
                        <Table tableStyle={{ tableLayout: "fixed", width: "100%" }}>
                            <thead>
                                {/* Native <tr>/<th> used intentionally: Axiom's TableHeaderCell
                                    puts box-shadow on an inner <div> (not the <th>), so padding on
                                    the outer <th> creates shadow gaps. Native elements give direct
                                    control over box-shadow and padding with no inner-div interference. */}
                                <tr>
                                    <th style={{
                                        width: 72, padding: "8px 0",
                                        boxShadow: "0 1px 0 var(--ax-colors-border-tertiary)",
                                        background: "var(--ax-colors-bg-default)",
                                        verticalAlign: "middle",
                                    }}>
                                        <Box display="flex" alignItems="center" gap="4" style={{ paddingLeft: 4 }}>
                                            <Box style={{ width: 8, flexShrink: 0 }} />
                                            <Checkbox
                                                checked={allOnPageSelected}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </Box>
                                    </th>
                                    {(["Notification", "Category", "Timestamp", "Priority", ""] as const).map((label, i) => (
                                        <th key={label || "actions"} style={{
                                            width: i === 1 ? 140 : i === 2 ? 120 : i === 3 ? 100 : i === 4 ? 40 : undefined,
                                            padding: i === 0 ? "8px 8px" : "8px 16px",
                                            boxShadow: "0 1px 0 var(--ax-colors-border-tertiary)",
                                            background: "var(--ax-colors-bg-default)",
                                            textAlign: "left",
                                            verticalAlign: "middle",
                                            fontSize: 11,
                                            fontWeight: 400,
                                            color: "var(--ax-colors-fg-tertiary)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                            fontFamily: "var(--ax-fonts-mono, monospace)",
                                        }}>{label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {buildSmartGroups(paginatedNotifications).map((group) => {
                                    const isCollapsed = collapsedGroups.has(group.key);
                                    const isSingleton = group.notifications.length === 1;

                                    // Singletons render as flat rows — no group header needed
                                    if (isSingleton) {
                                        return (
                                            <NotificationRow
                                                key={group.notifications[0].id}
                                                n={group.notifications[0]}
                                                selectedIds={selectedIds}
                                                toggleSelect={toggleSelect}
                                                getStatusIcon={getStatusIcon}
                                                getTypeIcon={getTypeIcon}
                                            />
                                        );
                                    }

                                    const firstN = group.notifications[0];
                                    const groupIcon = getStatusIcon(firstN) ?? getTypeIcon(firstN);
                                    return (
                                        <React.Fragment key={group.key}>
                                            <Tr
                                                onClick={() => toggleGroup(group.key)}
                                                suppressActiveStyle
                                                style={{ cursor: "pointer" }}
                                            >
                                                <Td style={{ paddingLeft: 16, paddingRight: 0, paddingTop: 6, paddingBottom: 6, verticalAlign: "middle" }}>
                                                    <Box display="flex" alignItems="center" gap="8">
                                                        <Box onClick={(e) => e.stopPropagation()}>
                                                            <Checkbox
                                                                checked={group.notifications.every((r) => selectedIds.has(r.id))}
                                                                onCheckedChange={(checked) => {
                                                                    group.notifications.forEach((r) => {
                                                                        if (checked && !selectedIds.has(r.id)) toggleSelect(r.id);
                                                                        else if (!checked && selectedIds.has(r.id)) toggleSelect(r.id);
                                                                    });
                                                                }}
                                                            />
                                                        </Box>
                                                        <Button
                                                            appearance="subtle"
                                                            size="sm"
                                                            icon={isCollapsed ? <IconAngleRight /> : <IconAngleDown />}
                                                            aria-label={isCollapsed ? "Expand group" : "Collapse group"}
                                                            onClick={(e) => { e.stopPropagation(); toggleGroup(group.key); }}
                                                        />
                                                    </Box>
                                                </Td>
                                                <Td colSpan={5} style={{ paddingLeft: 4, paddingTop: 6, paddingBottom: 6, verticalAlign: "middle" }}>
                                                    <Box display="flex" alignItems="center" gap="8">
                                                        <Box style={{ flexShrink: 0, color: "var(--ax-colors-fg-tertiary)" }}>
                                                            {groupIcon}
                                                        </Box>
                                                        <Text fontSize="md" fontWeight="500" color="fg.default">
                                                            {group.label}
                                                        </Text>
                                                        <Badge variant="subtle">{group.notifications.length}</Badge>
                                                    </Box>
                                                </Td>
                                            </Tr>
                                            {!isCollapsed && group.notifications.map((n) => (
                                                <NotificationRow
                                                    key={n.id}
                                                    n={n}
                                                    selectedIds={selectedIds}
                                                    toggleSelect={toggleSelect}
                                                    getStatusIcon={getStatusIcon}
                                                    getTypeIcon={getTypeIcon}
                                                    isChild
                                                />
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </Table>
                    ) : viewMode === "card" ? (
                        <Box
                            display="grid"
                            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}
                        >
                            {paginatedNotifications.map((n) => (
                                <NextLink key={n.id} href={n.deepLink} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                                    <Box
                                        className="hover:shadow-md transition-shadow cursor-pointer h-full"
                                        display="flex"
                                        gap="12"
                                        p="16"
                                        bg={n.status === "unread" ? "bg.secondary" : "bg.default"}
                                        border="1"
                                        borderColor="border.tertiary"
                                        rounded="lg"
                                        style={{ position: "relative" }}
                                    >
                                        <Box style={{ position: "absolute", top: 12, right: 12, zIndex: 10 }} onClick={(e: any) => e.stopPropagation()}>
                                            {isSelectionMode && (
                                                <Checkbox
                                                    checked={selectedIds.has(n.id)}
                                                    onCheckedChange={() => toggleSelect(n.id)}
                                                />
                                            )}
                                        </Box>
                                        {/* Content column */}
                                        <Box display="flex" flexDirection="column" gap="12" style={{ flex: 1, minWidth: 0 }}>
                                            <Box display="flex" flexDirection="column" gap="4">
                                                <Box display="flex" gap="8" alignItems="center" style={{ flexWrap: "wrap" }}>
                                                    {getStatusIcon(n)}
                                                    <CategoryBadge category={n.category} />
                                                </Box>
                                                <Text fontWeight={n.status === "unread" ? "600" : "500"} className="line-clamp-1">
                                                    {n.title}
                                                </Text>
                                            </Box>
                                            <Text fontSize="md" color="fg.secondary" style={{ minHeight: "40px" }} className="line-clamp-2">
                                                {n.message}
                                            </Text>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" style={{ marginTop: "auto" }}>
                                                <Text fontSize="sm" color="fg.tertiary">
                                                    {n.date}, {n.timestamp}
                                                </Text>
                                                {n.actionRequired && (
                                                    <Box display="flex" gap="4" onClick={(e) => e.preventDefault()}>
                                                        <Button appearance="subtle" icon={<IconXmark size={14} />} size="sm" aria-label="Reject" />
                                                        <Button appearance="subtle" icon={<IconCheck size={14} />} size="sm" aria-label="Approve" style={{ color: "var(--ax-colors-fg-success)" }} />
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                        {/* Red dot column */}
                                        <Box display="flex" alignItems="start" style={{ paddingTop: "6px", width: "16px", minWidth: "16px", flexShrink: 0, justifyContent: "center" }}>
                                            {n.status === "unread" && (
                                                <Box rounded="full" style={{ width: "8px", height: "8px", backgroundColor: "var(--ax-colors-fg-error)" }} />
                                            )}
                                        </Box>
                                    </Box>
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
                                                    <Box style={{ position: "absolute", top: 12, right: 12, zIndex: 10 }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                        {isSelectionMode && (
                                                            <Checkbox
                                                                checked={selectedIds.has(n.id)}
                                                                onCheckedChange={() => toggleSelect(n.id)}
                                                            />
                                                        )}
                                                    </Box>

                                                    {/* Status Icon */}
                                                    <Box style={{ flexShrink: 0 }} pt="4">
                                                        {getStatusIcon(n) || getTypeIcon(n) || <IconCircleInfo style={{ width: 16, height: 16, color: "var(--ax-colors-fg-information)" }} />}
                                                    </Box>

                                                    {/* Content Column */}
                                                    <Box flex="1" display="flex" flexDirection="column" gap="4" style={{ minWidth: 0 }}>
                                                        <Box display="flex" alignItems="center" gap="8" style={{ minWidth: 0 }}>
                                                            {n.status === "unread" && <UnreadIndicator />}
                                                            <Text
                                                                fontWeight={n.status === "unread" ? "600" : "500"}
                                                                fontSize="md"
                                                                color="fg.default"
                                                                className="line-clamp-1"
                                                                style={{ minWidth: 0, flex: 1 }}
                                                            >
                                                                {n.title}
                                                            </Text>
                                                        </Box>
                                                        <Box display="flex" alignItems="center" gap="4" flexWrap="wrap">
                                                            <Text fontSize="sm" color="fg.tertiary">
                                                                {getCategoryLabel(n.category)}
                                                            </Text>
                                                            <Text fontSize="sm" color="fg.tertiary">•</Text>
                                                            <Text fontSize="sm" color="fg.tertiary" className="line-clamp-1">
                                                                {n.message}
                                                            </Text>
                                                        </Box>
                                                        {n.actionRequired && (
                                                            <Box pt="4" display="flex" gap="4" onClick={(e) => e.preventDefault()}>
                                                                <Button appearance="subtle" icon={<IconXmark size={14} />} size="sm" aria-label="Reject" />
                                                                <Button appearance="subtle" icon={<IconCheck size={14} />} size="sm" aria-label="Approve" style={{ color: "var(--ax-colors-fg-success)" }} />
                                                            </Box>
                                                        )}
                                                    </Box>

                                                    {/* Meta Column */}
                                                    <Box display="flex" alignItems="center" gap="8" pt="4" style={{ flexShrink: 0 }}>
                                                        <Text fontSize="sm" color="fg.tertiary" className="whitespace-nowrap">
                                                            {n.timestamp}
                                                        </Text>
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

            </Box>{/* end scrollable content area */}
        </Box >
    );
}


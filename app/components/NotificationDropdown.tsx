"use client";

import { Box, Button, Text, Badge, Disclosure, DisclosureContent, DisclosureTrigger } from "@optiaxiom/react";
import { DetailsPanel, DetailsPanelHeader, DetailsPanelBody } from "@optiaxiom/react/unstable";
import { IconBell, IconX, IconSettings, IconChecks, IconPackage, IconSpeakerphone, IconLoader2, IconPlug, IconUsers } from "@tabler/icons-react";
import { IconCircleExclamation, IconTriangleExclamation, IconSpinner, IconFileLines, IconCircleCheck as AxiomCircleCheck } from "@optimizely/axiom-icons";
import { useMemo, useState, useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { mockNotifications, getUnreadCount, getCategoryLabel, type Notification } from "@/app/opal/notifications/mockData";
import { useLayout } from "@/app/context/LayoutContext";
import NextLink from "next/link";

const UnreadIndicator = () => (
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

// Compact notification card for sidebar
function CompactNotificationCard({ notification }: { notification: Notification }) {
    const isUnread = notification.status === "unread";
    const [isHovered, setIsHovered] = useState(false);

    // Status icon by notification type (matches Figma spec)
    const getAvatar = () => {
        let icon;
        switch (notification.type) {
            case "agent_execution_chat":
            case "agent_execution_autonomous":
                icon = <AxiomCircleCheck style={{ width: 16, height: 16, color: "var(--ax-colors-fg-success)" }} />;
                break;
            case "agent_execution_failed":
                icon = <IconCircleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-error)" }} />;
                break;
            case "agent_execution_long_running":
                icon = <IconLoader2 size={16} color="var(--ax-colors-fg-accent)" className="animate-spin" />;
                break;
            case "directory_new_agent":
            case "directory_update_available":
                icon = <IconPackage size={16} color="var(--ax-colors-fg-information)" />;
                break;
            case "directory_install_request":
            case "approval_required":
                icon = <IconPackage size={16} color="var(--ax-colors-fg-warning)" />;
                break;
            case "tools_new_available":
                icon = <IconPlug size={16} color="var(--ax-colors-fg-tertiary)" />;
                break;
            case "tools_auth_required":
            case "tools_auth_expired":
                icon = <IconCircleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-error)" }} />;
                break;
            case "tools_deprecated":
                icon = <IconTriangleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-warning)" }} />;
                break;
            case "collaboration_agent_modified":
                icon = <IconUsers size={16} color="var(--ax-colors-fg-information)" />;
                break;
            case "collaboration_agent_activated":
                icon = <AxiomCircleCheck style={{ width: 16, height: 16, color: "var(--ax-colors-fg-success)" }} />;
                break;
            case "collaboration_agent_deactivated":
                icon = <IconFileLines style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)" }} />;
                break;
            case "guardrail_observer":
            case "guardrail_enforcer":
            case "guardrail_quality":
                if (notification.guardrailStatus === "terminated" || notification.guardrailStatus === "failed") {
                    icon = <IconCircleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-error)" }} />;
                } else if (notification.guardrailStatus === "triggered") {
                    icon = <IconSpinner style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)" }} className="animate-spin" />;
                } else {
                    icon = <IconTriangleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-warning)" }} />;
                }
                break;
            case "system_announcement":
            case "system_maintenance":
                icon = <IconSpeakerphone size={16} color="var(--ax-colors-fg-information)" />;
                break;
            default:
                icon = <IconFileLines style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)" }} />;
        }
        return (
            <Box pt="2" style={{ flexShrink: 0 }}>
                {icon}
            </Box>
        );
    };

    return (
        <NextLink href={notification.deepLink} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
            <Box
                p="16"
                bg={isUnread ? "bg.default" : "bg.secondary"}
                className="hover:bg-[var(--ax-colors-bg-tertiary)] cursor-pointer transition-colors"
                display="flex"
                gap="12"
                style={{ position: "relative", borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Avatar */}
                {getAvatar()}

                {/* Content Column */}
                <Box flex="1" style={{ minWidth: 0 }} display="flex" flexDirection="column" gap="4">
                    {/* Header: Title + Timestamp + Dot */}
                    <Box display="flex" alignItems="start" justifyContent="space-between" gap="8">
                        <Text
                            fontSize="md"
                            fontWeight={isUnread ? "700" : "500"}
                            color="fg.default"
                            className="line-clamp-2"
                            flex="1"
                        >
                            {notification.title}
                        </Text>
                        <Box display="flex" alignItems="center" gap="4" style={{ flexShrink: 0 }}>
                            {notification.actionRequired && <Badge intent="warning" variant="subtle">Action Required</Badge>}
                            {isHovered ? (
                                <Button
                                    icon={<IconX size={14} />}
                                    appearance="subtle"
                                    size="sm"
                                    aria-label="Dismiss"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                />
                            ) : (
                                <>
                                    <Text fontSize="xs" color="fg.tertiary" className="whitespace-nowrap">
                                        {notification.timestamp}
                                    </Text>
                                    {isUnread && <UnreadIndicator />}
                                </>
                            )}
                        </Box>
                    </Box>

                    <Text fontSize="sm" color="fg.tertiary" className="line-clamp-2">
                        {notification.message}
                    </Text>

                    {notification.approvalRequired && (
                        <Box display="flex" gap="8" pt="8">
                            <Button size="sm" appearance="inverse">Approve</Button>
                            <Button size="sm" appearance="default">
                                {notification.approvalType === "opal_admin" ? "Deny" : "Send back"}
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>
        </NextLink>
    );
}

export function NotificationPanel({ onClose }: { onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<"all" | "action_required" | "unread">("all");
    const [panelWidth, setPanelWidth] = useState(560);
    const resizingStateRef = useRef<{ startX: number; startWidth: number } | null>(null);

    useEffect(() => {
        const handleMove = (event: MouseEvent) => {
            if (!resizingStateRef.current) return;
            const { startX, startWidth } = resizingStateRef.current;
            const deltaX = event.clientX - startX;
            const nextWidth = Math.max(400, Math.min(760, startWidth - deltaX));
            setPanelWidth(nextWidth);
        };

        const handleUp = () => {
            resizingStateRef.current = null;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };
    }, []);

    const startResize = (event: ReactMouseEvent<HTMLDivElement>) => {
        resizingStateRef.current = {
            startX: event.clientX,
            startWidth: panelWidth,
        };
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    };

    const actionRequiredCount = useMemo(() => mockNotifications.filter(n => n.actionRequired).length, []);
    const unreadCount = useMemo(() => mockNotifications.filter(n => n.status === "unread").length, []);

    const filtered = useMemo(() => {
        if (activeTab === "action_required") return mockNotifications.filter(n => n.actionRequired);
        if (activeTab === "unread") return mockNotifications.filter(n => n.status === "unread");
        return mockNotifications;
    }, [activeTab]);

    const groups = useMemo(() => {
        const g: Record<string, Notification[]> = {};
        filtered.forEach(n => {
            if (!g[n.category]) g[n.category] = [];
            g[n.category].push(n);
        });
        return g;
    }, [filtered]);

    return (
        <Box h="full" style={{ width: panelWidth, position: "relative" }}>
            <Box
                aria-label="Resize notification tray"
                onMouseDown={startResize}
                h="full"
                style={{ position: "absolute", left: 0, top: 0, width: 8, transform: "translateX(-50%)", cursor: "col-resize", zIndex: 20 }}
            >
                <Box
                    h="full"
                    bg="bg.tertiary"
                    style={{ position: "absolute", left: "50%", top: 0, width: 1, transform: "translateX(-50%)", opacity: 0.7 }}
                />
            </Box>
            <DetailsPanel
                h="full"
                bg="bg.page"
                borderL="1"
                borderColor="border.tertiary"
                overflow="hidden"
            >
                <DetailsPanelHeader
                    px="16"
                    py="12"
                    addonAfter={
                        <Box display="flex" gap="4" alignItems="center">
                            <Button icon={<IconSettings size={16} />} appearance="subtle" size="sm" aria-label="Settings" />
                            <Button
                                icon={<IconX size={16} />}
                                appearance="subtle"
                                aria-label="Close"
                                size="sm"
                                onClick={onClose}
                            />
                        </Box>
                    }
                >
                    <Text fontWeight="500" fontSize="lg">Notifications</Text>
                </DetailsPanelHeader>

                <DetailsPanelBody p="0" overflowY="auto">
                    {/* Tab Bar */}
                    <Box
                        px="8"
                        display="flex"
                        alignItems="center"
                        gap="0"
                        borderB="1"
                        borderColor="border.tertiary"
                        style={{ minHeight: 40 }}
                    >
                        {([
                            { key: "all" as const, label: "All", count: null },
                            { key: "action_required" as const, label: "Action Required", count: actionRequiredCount },
                            { key: "unread" as const, label: "Unread", count: unreadCount },
                        ]).map(tab => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    borderBottom: activeTab === tab.key ? "2px solid var(--ax-colors-fg-accent)" : "2px solid transparent",
                                    padding: "10px 8px",
                                    margin: 0,
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    transition: "color 0.15s, border-color 0.15s",
                                    flexShrink: tab.key === "all" ? 0 : 1,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    minWidth: 0,
                                }}
                            >
                                <Text
                                    fontSize="sm"
                                    fontWeight={activeTab === tab.key ? "600" : "400"}
                                    color={activeTab === tab.key ? "fg.default" : "fg.tertiary"}
                                >
                                    {tab.label}{tab.count !== null ? ` (${tab.count})` : ""}
                                </Text>
                            </button>
                        ))}
                        <Box flex="1" style={{ minWidth: 8 }} />
                        <Button
                            appearance="subtle"
                            size="sm"
                            icon={<IconChecks size={16} />}
                            aria-label="Mark all as read"
                            style={{ flexShrink: 0 }}
                        >
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Mark all as read</span>
                        </Button>
                    </Box>


                    <Box display="flex" flexDirection="column">
                        {Object.entries(groups).length > 0 ? (
                            Object.entries(groups).map(([category, ns]) => (
                                <Disclosure key={category} defaultOpen={category === "agent_execution" || category === "guardrail"}>
                                    <DisclosureTrigger>
                                        <Box px="16" py="12" bg="bg.secondary" display="flex" alignItems="center" justifyContent="space-between">
                                            <Text fontSize="md" fontWeight="400" color="fg.secondary">
                                                {getCategoryLabel(category)} ({ns.length})
                                            </Text>
                                        </Box>
                                    </DisclosureTrigger>
                                    <DisclosureContent>
                                        <Box display="flex" flexDirection="column">
                                            {ns.slice(0, 5).map((notification) => (
                                                <CompactNotificationCard
                                                    key={notification.id}
                                                    notification={notification}
                                                />
                                            ))}
                                        </Box>
                                    </DisclosureContent>
                                </Disclosure>
                            ))
                        ) : (
                            <Box p="40" display="flex" flexDirection="column" alignItems="center" gap="12">
                                <IconBell size={48} className="text-fg-tertiary" style={{ opacity: 0.2 }} />
                                <Text color="fg.tertiary">No notifications found</Text>
                            </Box>
                        )}
                    </Box>

                    {filtered.length > 0 && (
                        <NextLink href="/opal/notifications" style={{ textDecoration: "none" }} onClick={onClose}>
                            <Box
                                p="16"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                className="hover:bg-[var(--ax-colors-bg-secondary)] cursor-pointer transition-colors"
                            >
                                <Text fontSize="sm" fontWeight="600" color="fg.accent">
                                    View all notifications
                                </Text>
                            </Box>
                        </NextLink>
                    )}
                </DetailsPanelBody>
            </DetailsPanel>
        </Box>
    );
}

export default function NotificationDropdown() {
    const { asideContent, setAsideContent } = useLayout();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const unreadCount = useMemo(() => getUnreadCount(mockNotifications), []);

    const togglePanel = () => {
        if (asideContent) {
            setAsideContent(null);
        } else {
            setAsideContent(
                <Box h="full" style={{ position: "sticky", top: 0 }}>
                    <NotificationPanel onClose={() => setAsideContent(null)} />
                </Box>
            );
        }
    };

    return (
        <Box style={{ position: "relative", display: "inline-flex" }}>
            <Button
                appearance="subtle"
                size="lg"
                style={{ width: 40, height: 40 }}
                icon={<IconBell size={20} style={{ width: 20, height: 20 }} />}
                aria-label="Notifications"
                onClick={togglePanel}
            />
            {mounted && unreadCount > 0 && (
                <Box
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    className="absolute pointer-events-none"
                    style={{
                        top: 2,
                        right: 0,
                        backgroundColor: "var(--ax-colors-fg-error)",
                        minWidth: 14,
                        padding: "0 4px",
                        height: 14,
                        fontSize: 9,
                        fontWeight: 700,
                        color: "white",
                        zIndex: 10
                    }}
                >
                    {unreadCount > 99 ? "99+" : unreadCount}
                </Box>
            )}
        </Box>
    );
}

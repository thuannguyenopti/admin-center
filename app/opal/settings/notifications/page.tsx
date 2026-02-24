"use client";

import {
    Alert,
    Box,
    Button,
    Heading,
    Text,
    Switch,
    Separator,
} from "@optiaxiom/react";
import {
    IconBell,
    IconBellOff,
    IconChevronDown,
    IconChevronUp,
    IconCheck,
    IconEye,
} from "@tabler/icons-react";
import { useState } from "react";
import {
    mockUserPreferences,
    mockWatchedAgents,
    getNotificationTypeLabel,
    type UserPreferences,
    type WatchedAgent,
} from "@/app/opal/notifications/mockData";

// ─── Constants ────────────────────────────────────────────────────────────────

const CHANNELS = ["in-app", "email", "slack", "teams", "browser"] as const;
type Channel = (typeof CHANNELS)[number];

const CHANNEL_LABELS: Record<Channel, string> = {
    "in-app": "In-App",
    email: "Email",
    slack: "Slack",
    teams: "Teams",
    browser: "Browser",
};

const CATEGORY_GROUPS: { label: string; keys: string[] }[] = [
    {
        label: "Agent Execution",
        keys: [
            "agent_execution_chat",
            "agent_execution_autonomous",
            "agent_execution_failed",
            "agent_execution_long_running",
            "approval_required",
        ],
    },
    {
        label: "Guardrail & Quality",
        keys: [
            "guardrail_observer",
            "guardrail_enforcer",
            "guardrail_quality",
            "guardrail_support_ticket",
        ],
    },
    {
        label: "Directory",
        keys: [
            "directory_new_agent",
            "directory_update_available",
            "directory_install_request",
        ],
    },
    {
        label: "Tools & Integrations",
        keys: [
            "tools_new_available",
            "tools_deprecated",
            "tools_auth_required",
            "tools_auth_expired",
        ],
    },
    {
        label: "Collaboration",
        keys: [
            "collaboration_agent_modified",
            "collaboration_agent_activated",
            "collaboration_agent_deactivated",
        ],
    },
    {
        label: "System",
        keys: ["system_announcement", "system_maintenance"],
    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationPreferencesPage() {
    const [allPaused, setAllPaused] = useState(false);
    const [preferences, setPreferences] = useState<UserPreferences>(
        JSON.parse(JSON.stringify(mockUserPreferences))
    );
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [watchedAgents, setWatchedAgents] = useState<WatchedAgent[]>([
        ...mockWatchedAgents,
    ]);
    const [saved, setSaved] = useState(false);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const toggleRow = (key: string) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const toggleEnabled = (key: string) => {
        setPreferences((prev) => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [key]: {
                    ...prev.preferences[key],
                    enabled: !prev.preferences[key].enabled,
                },
            },
        }));
        setSaved(false);
    };

    const toggleChannel = (key: string, channel: Channel) => {
        setPreferences((prev) => {
            const current = prev.preferences[key].channels;
            const updated = current.includes(channel)
                ? current.filter((c) => c !== channel)
                : [...current, channel];
            return {
                ...prev,
                preferences: {
                    ...prev.preferences,
                    [key]: { ...prev.preferences[key], channels: updated },
                },
            };
        });
        setSaved(false);
    };

    const unwatchAgent = (id: string) => {
        setWatchedAgents((prev) => prev.filter((a) => a.id !== id));
        setSaved(false);
    };

    const savePreferences = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Box
            p="32"
            display="flex"
            flexDirection="column"
            gap="32"
            h="full"
            bg="bg.default"
            overflowY="auto"
        >
            {/* ── Page header ─────────────────────────────────────────────── */}
            <Box>
                <Heading level="2">Notifications</Heading>
                <Text color="fg.tertiary" mt="4">
                    Configure which notifications you receive and how they are
                    delivered.
                </Text>
            </Box>

            {/* ── Master toggle ───────────────────────────────────────────── */}
            <Box
                border="1"
                borderColor={allPaused ? "border.warning" : "border.tertiary"}
                rounded="lg"
                overflow="hidden"
            >
                {/* Paused banner — only visible when master is off */}
                {allPaused && (
                    <Alert intent="warning">
                        <Text fontSize="sm">
                            All notifications are paused. Toggle &ldquo;All
                            Notifications&rdquo; back on to resume delivery.
                        </Text>
                    </Alert>
                )}

                {/* Master toggle row */}
                <Box
                    display="flex"
                    alignItems="center"
                    gap="16"
                    p="20"
                    bg={allPaused ? "bg.warning.subtle" : "bg.secondary"}
                >
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        style={{ width: 36, height: 36, flexShrink: 0 }}
                        rounded="md"
                        bg={allPaused ? "bg.warning" : "bg.accent.subtle"}
                    >
                        {allPaused ? (
                            <IconBellOff
                                size={18}
                                color="var(--ax-colors-fg-warning)"
                            />
                        ) : (
                            <IconBell
                                size={18}
                                color="var(--ax-colors-fg-accent)"
                            />
                        )}
                    </Box>

                    <Box flex="1">
                        <Text fontWeight="600" fontSize="md">
                            All Notifications
                        </Text>
                        <Text fontSize="sm" color="fg.tertiary">
                            {allPaused
                                ? "Currently paused — no alerts will be delivered"
                                : "Receive notifications across all categories"}
                        </Text>
                    </Box>

                    <Switch
                        checked={!allPaused}
                        onCheckedChange={() => {
                            setAllPaused((p) => !p);
                            setSaved(false);
                        }}
                    />
                </Box>
            </Box>

            {/* ── Per-type rows grouped by category ───────────────────────── */}
            <Box display="flex" flexDirection="column" gap="24">
                {CATEGORY_GROUPS.map((group) => {
                    const groupKeys = group.keys.filter(
                        (k) => k in preferences.preferences
                    );
                    if (groupKeys.length === 0) return null;

                    return (
                        <Box key={group.label}>
                            {/* Category heading */}
                            <Text
                                fontSize="sm"
                                fontWeight="600"
                                color="fg.tertiary"
                                mb="8"
                            >
                                {group.label}
                            </Text>

                            {/* Rows container */}
                            <Box
                                border="1"
                                borderColor="border.tertiary"
                                rounded="lg"
                                overflow="hidden"
                                style={{
                                    opacity: allPaused ? 0.55 : 1,
                                    transition: "opacity 0.15s ease",
                                }}
                            >
                                {groupKeys.map((key, idx) => {
                                    const pref = preferences.preferences[key];
                                    const isExpanded = expandedRows.has(key);
                                    const activeChannels =
                                        pref.channels as Channel[];

                                    return (
                                        <Box key={key}>
                                            {idx > 0 && <Separator />}

                                            {/* ── Main row ──────────────── */}
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                gap="12"
                                                px="16"
                                                py="12"
                                            >
                                                {/* Label + channel summary */}
                                                <Box
                                                    flex="1"
                                                    display="flex"
                                                    flexDirection="column"
                                                    gap="2"
                                                >
                                                    <Text
                                                        fontSize="sm"
                                                        fontWeight="500"
                                                        color={
                                                            !pref.enabled
                                                                ? "fg.tertiary"
                                                                : "fg.default"
                                                        }
                                                    >
                                                        {getNotificationTypeLabel(
                                                            key as any
                                                        )}
                                                    </Text>
                                                    <Text
                                                        fontSize="xs"
                                                        color="fg.tertiary"
                                                    >
                                                        {pref.enabled &&
                                                        activeChannels.length > 0
                                                            ? activeChannels
                                                                  .map(
                                                                      (c) =>
                                                                          CHANNEL_LABELS[
                                                                              c
                                                                          ] ?? c
                                                                  )
                                                                  .join(" · ")
                                                            : pref.enabled
                                                              ? "No channels selected"
                                                              : "Disabled"}
                                                    </Text>
                                                </Box>

                                                {/* Configure expand button */}
                                                <Button
                                                    appearance="subtle"
                                                    size="sm"
                                                    disabled={allPaused}
                                                    onClick={() =>
                                                        toggleRow(key)
                                                    }
                                                    icon={
                                                        isExpanded ? (
                                                            <IconChevronUp
                                                                size={14}
                                                            />
                                                        ) : (
                                                            <IconChevronDown
                                                                size={14}
                                                            />
                                                        )
                                                    }
                                                >
                                                    Configure
                                                </Button>

                                                {/* Enabled switch */}
                                                <Switch
                                                    checked={pref.enabled}
                                                    disabled={allPaused}
                                                    onCheckedChange={() =>
                                                        toggleEnabled(key)
                                                    }
                                                />
                                            </Box>

                                            {/* ── Channel config (expanded) */}
                                            {isExpanded && !allPaused && (
                                                <Box
                                                    px="16"
                                                    pt="4"
                                                    pb="16"
                                                    bg="bg.secondary"
                                                    borderT="1"
                                                    borderColor="border.tertiary"
                                                    display="flex"
                                                    gap="8"
                                                    flexWrap="wrap"
                                                >
                                                    {CHANNELS.map((ch) => {
                                                        const isActive =
                                                            pref.channels.includes(
                                                                ch
                                                            );
                                                        return (
                                                            <Box
                                                                key={ch}
                                                                display="flex"
                                                                alignItems="center"
                                                                gap="8"
                                                                px="12"
                                                                py="8"
                                                                rounded="md"
                                                                border="1"
                                                                borderColor={
                                                                    isActive
                                                                        ? "border.accent"
                                                                        : "border.tertiary"
                                                                }
                                                                bg={
                                                                    isActive
                                                                        ? "bg.accent.subtle"
                                                                        : "bg.default"
                                                                }
                                                            >
                                                                <Switch
                                                                    checked={
                                                                        isActive
                                                                    }
                                                                    disabled={
                                                                        !pref.enabled
                                                                    }
                                                                    onCheckedChange={() =>
                                                                        toggleChannel(
                                                                            key,
                                                                            ch
                                                                        )
                                                                    }
                                                                />
                                                                <Text
                                                                    fontSize="sm"
                                                                    fontWeight="500"
                                                                    color={
                                                                        isActive
                                                                            ? "fg.default"
                                                                            : "fg.tertiary"
                                                                    }
                                                                >
                                                                    {
                                                                        CHANNEL_LABELS[
                                                                            ch
                                                                        ]
                                                                    }
                                                                </Text>
                                                            </Box>
                                                        );
                                                    })}
                                                </Box>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {/* ── Watched agents ──────────────────────────────────────────── */}
            <Box>
                <Heading level="3" mb="8">
                    Watched Agents
                </Heading>
                <Text color="fg.tertiary" mb="16">
                    You&apos;ll receive notifications about changes and
                    executions for these agents.
                </Text>

                {watchedAgents.length === 0 ? (
                    <Box
                        p="32"
                        border="1"
                        borderColor="border.tertiary"
                        rounded="md"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        gap="8"
                    >
                        <IconEye
                            size={32}
                            color="var(--ax-colors-fg-tertiary)"
                        />
                        <Text color="fg.tertiary">
                            You&apos;re not watching any agents yet.
                        </Text>
                        <Button appearance="subtle" size="sm">
                            Browse Agent Directory
                        </Button>
                    </Box>
                ) : (
                    <Box display="flex" flexDirection="column" gap="8">
                        {watchedAgents.map((agent) => (
                            <Box
                                key={agent.id}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                p="16"
                                border="1"
                                borderColor="border.tertiary"
                                rounded="md"
                                bg="bg.default"
                            >
                                <Box>
                                    <Text fontWeight="600">{agent.name}</Text>
                                    <Text fontSize="sm" color="fg.tertiary">
                                        Created by {agent.createdBy}
                                    </Text>
                                </Box>
                                <Button
                                    appearance="subtle"
                                    size="sm"
                                    onClick={() => unwatchAgent(agent.id)}
                                >
                                    Unwatch
                                </Button>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            {/* ── Save ────────────────────────────────────────────────────── */}
            <Box display="flex" alignItems="center" gap="12" pt="8">
                <Button appearance="primary" onClick={savePreferences}>
                    Save Preferences
                </Button>
                {saved && (
                    <Box
                        display="flex"
                        alignItems="center"
                        gap="4"
                        className="animate-in fade-in"
                    >
                        <IconCheck
                            size={16}
                            color="var(--ax-colors-fg-success)"
                        />
                        <Text color="fg.success" fontSize="sm" fontWeight="500">
                            Preferences saved
                        </Text>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

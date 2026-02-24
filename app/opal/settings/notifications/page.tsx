"use client";

import {
    Box,
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Heading,
    Switch,
    Text,
    Tooltip,
    Button,
} from "@optiaxiom/react";
import { IconBell, IconPen } from "@optimizely/axiom-icons";
import { useState } from "react";
import {
    mockUserPreferences,
    getNotificationTypeLabel,
    type UserPreferences,
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
            "agent_execution_failed",
            "agent_execution_chat",
            "agent_execution_autonomous",
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
    const [allEnabled, setAllEnabled] = useState(true);
    const [openKey, setOpenKey] = useState<string | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences>(
        JSON.parse(JSON.stringify(mockUserPreferences))
    );

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
    };

    const getChannelSummary = (key: string): string => {
        const channels = preferences.preferences[key]?.channels ?? [];
        return channels
            .map((c) => CHANNEL_LABELS[c as Channel] ?? c)
            .join(", ");
    };

    return (
        <Box py="24" px="32" display="flex" flexDirection="column" gap="24">
            {/* ── Page header ─────────────────────────────────────────── */}
            <Box>
                <Heading level="2">Notifications</Heading>
                <Text color="fg.tertiary" fontSize="sm" mt="4">
                    Configure which notifications you receive and how they are
                    delivered.
                </Text>
            </Box>

            {/* ── Master toggle card ──────────────────────────────────── */}
            <Box
                bg="bg.default"
                border="1"
                borderColor="border.tertiary"
                rounded="lg"
                display="flex"
                alignItems="center"
                gap="8"
                pl="16"
                pr="20"
                py="12"
            >
                <Box display="flex" flex="1" alignItems="center" pl="12">
                    <IconBell
                        style={{
                            color: "var(--ax-colors-fg-accent)",
                            flexShrink: 0,
                        }}
                    />
                    <Box display="flex" flexDirection="column" px="12">
                        <Text fontSize="md" fontWeight="500" color="fg.default">
                            Get Notifications
                        </Text>
                        <Text fontSize="sm" color="fg.tertiary">
                            Receive notifications across all categories
                        </Text>
                    </Box>
                </Box>
                <Switch
                    checked={allEnabled}
                    onCheckedChange={setAllEnabled}
                />
            </Box>

            {/* ── Notification rows ───────────────────────────────────── */}
            <Box border="1" borderColor="border.tertiary" rounded="md" overflow="hidden">
                {CATEGORY_GROUPS.map((group, gi) => {
                    const visibleKeys = group.keys.filter(
                        (k) => preferences.preferences[k]
                    );
                    if (visibleKeys.length === 0) return null;

                    const isLastGroup = gi === CATEGORY_GROUPS.length - 1;

                    return (
                        <Box key={group.label}>
                            {/* Category header row — table-header treatment */}
                            <Box
                                px="16"
                                py="6"
                                bg="bg.secondary"
                                style={{
                                    borderBottom:
                                        "1px solid var(--ax-colors-border-tertiary)",
                                }}
                            >
                                <Text
                                    fontSize="sm"
                                    fontWeight="400"
                                    color="fg.tertiary"
                                >
                                    {group.label}
                                </Text>
                            </Box>

                            {/* Notification type rows */}
                            {visibleKeys.map((key, i) => {
                                const pref = preferences.preferences[key];
                                const isLastInGroup =
                                    i === visibleKeys.length - 1;
                                const isVeryLast =
                                    isLastGroup && isLastInGroup;

                                return (
                                    <DropdownMenu
                                        key={key}
                                        open={openKey === key}
                                        onOpenChange={(o) =>
                                            setOpenKey(o ? key : null)
                                        }
                                    >
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            pl="16"
                                            pr="20"
                                            bg="bg.default"
                                            className="group"
                                            onClick={() =>
                                                allEnabled &&
                                                setOpenKey(
                                                    openKey === key
                                                        ? null
                                                        : key
                                                )
                                            }
                                            style={{
                                                minHeight: 44,
                                                cursor: allEnabled
                                                    ? "pointer"
                                                    : "default",
                                                borderBottom: isVeryLast
                                                    ? undefined
                                                    : "1px solid var(--ax-colors-border-tertiary)",
                                            }}
                                        >
                                            {/* Type label */}
                                            <Box flex="1" py="8">
                                                <Text
                                                    fontSize="md"
                                                    color="fg.default"
                                                >
                                                    {getNotificationTypeLabel(
                                                        key as any
                                                    )}
                                                </Text>
                                            </Box>

                                            {/* Right side: channels + pencil + switch grouped tightly */}
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                gap="8"
                                            >
                                                <Text
                                                    fontSize="sm"
                                                    color="fg.tertiary"
                                                >
                                                    {getChannelSummary(key)}
                                                </Text>

                                                {/* Pencil icon — hint, visible on hover */}
                                                <Tooltip content="Edit channels">
                                                    <DropdownMenuTrigger
                                                        appearance="subtle"
                                                        icon={<IconPen />}
                                                        size="sm"
                                                        disabled={!allEnabled}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                        aria-label="Edit channels"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    />
                                                </Tooltip>

                                                {/* Enabled switch — stopPropagation so it doesn't open the dropdown */}
                                                <Box
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <Switch
                                                        checked={
                                                            pref.enabled &&
                                                            allEnabled
                                                        }
                                                        onCheckedChange={() =>
                                                            toggleEnabled(key)
                                                        }
                                                        disabled={!allEnabled}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>

                                        {openKey === key && (
                                            <ChannelSelectorMenuContent
                                                channels={pref.channels}
                                                onApply={(updated) => {
                                                    setPreferences((prev) => ({
                                                        ...prev,
                                                        preferences: {
                                                            ...prev.preferences,
                                                            [key]: { ...prev.preferences[key], channels: updated },
                                                        },
                                                    }));
                                                    setOpenKey(null);
                                                }}
                                            />
                                        )}
                                    </DropdownMenu>
                                );
                            })}
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

function ChannelSelectorMenuContent({
    channels,
    onApply,
}: {
    channels: Channel[];
    onApply: (channels: Channel[]) => void;
}) {
    const [localChannels, setLocalChannels] = useState<Set<Channel>>(
        new Set(channels)
    );

    const toggleChannel = (ch: Channel) => {
        setLocalChannels((prev) => {
            const next = new Set(prev);
            if (next.has(ch)) next.delete(ch);
            else next.add(ch);
            return next;
        });
    };

    const isAllSelected = localChannels.size === CHANNELS.length;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setLocalChannels(new Set(CHANNELS));
        } else {
            setLocalChannels(new Set());
        }
    };

    return (
        <DropdownMenuContent align="end" style={{ minWidth: 200 }}>
            <DropdownMenuCheckboxItem
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                onSelect={(e) => {
                    e.preventDefault();
                }}
            >
                <Text fontWeight="600" fontSize="md">Select all</Text>
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />

            {CHANNELS.map((ch) => (
                <DropdownMenuCheckboxItem
                    key={ch}
                    checked={localChannels.has(ch)}
                    onCheckedChange={() => toggleChannel(ch)}
                    onSelect={(e) => {
                        e.preventDefault();
                    }}
                >
                    <Text fontSize="md">{CHANNEL_LABELS[ch]}</Text>
                </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />

            <Box px="8" py="8" display="flex" justifyContent="flex-end" gap="8">
                <Button
                    size="sm"
                    appearance="default"
                    onClick={(e) => {
                        e.preventDefault();
                        onApply(Array.from(localChannels));
                    }}
                >
                    Done
                </Button>
            </Box>
        </DropdownMenuContent>
    );
}

"use client";

import {
    Box,
    Heading,
    Text,
    Button,
    Switch,
    Separator,
} from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { IconCheck, IconTrash, IconEye } from "@tabler/icons-react";
import { useState } from "react";
import {
    mockUserPreferences,
    mockWatchedAgents,
    formatPreferenceKey,
    type UserPreferences,
    type WatchedAgent,
} from "@/app/opal/notifications/mockData";

const CHANNELS = ["in-app", "email", "slack", "teams", "browser"] as const;

function ChannelHeader({ channel }: { channel: string }) {
    const labels: Record<string, string> = {
        "in-app": "In-App",
        email: "Email",
        slack: "Slack",
        teams: "Teams",
        browser: "Browser",
    };
    return <>{labels[channel] || channel}</>;
}

export default function NotificationPreferencesPage() {
    const [preferences, setPreferences] = useState<UserPreferences>(
        JSON.parse(JSON.stringify(mockUserPreferences))
    );
    const [watchedAgents, setWatchedAgents] = useState<WatchedAgent[]>([
        ...mockWatchedAgents,
    ]);
    const [saved, setSaved] = useState(false);

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

    const toggleChannel = (key: string, channel: string) => {
        setPreferences((prev) => {
            const current = prev.preferences[key].channels;
            const updated = current.includes(channel as any)
                ? current.filter((c) => c !== channel)
                : [...current, channel as any];
            return {
                ...prev,
                preferences: {
                    ...prev.preferences,
                    [key]: {
                        ...prev.preferences[key],
                        channels: updated,
                    },
                },
            };
        });
        setSaved(false);
    };

    const setDigest = (value: UserPreferences["emailDigest"]) => {
        setPreferences((prev) => ({ ...prev, emailDigest: value }));
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
            <Box>
                <Heading level="2">Notification Preferences</Heading>
                <Text color="fg.tertiary" mt="4">
                    Customize which notifications you receive and how they are
                    delivered.
                </Text>
            </Box>

            {/* ── Notification Type Settings ──────────────────────────────────── */}
            <Box>
                <Heading level="3" mb="8">
                    Notification Types
                </Heading>
                <Text color="fg.tertiary" mb="16">
                    Choose which notifications you want to receive and through
                    which channels.
                </Text>

                <Box overflow="hidden">
                    <Table>
                        <thead>
                            <Tr>
                                <Th style={{ width: "30%" }}>Notification Type</Th>
                                <Th style={{ width: "10%", textAlign: "center" }}>Enabled</Th>
                                {CHANNELS.map((ch) => (
                                    <Th key={ch} style={{ textAlign: "center" }}>
                                        <ChannelHeader channel={ch} />
                                    </Th>
                                ))}
                            </Tr>
                        </thead>
                        <tbody>
                            {Object.entries(preferences.preferences).map(
                                ([key, pref]) => (
                                    <Tr key={key}>
                                        <Td>
                                            <Text fontWeight="500" fontSize="sm">
                                                {formatPreferenceKey(key)}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Box
                                                display="flex"
                                                justifyContent="center"
                                            >
                                                <Switch
                                                    checked={pref.enabled}
                                                    onCheckedChange={() =>
                                                        toggleEnabled(key)
                                                    }
                                                />
                                            </Box>
                                        </Td>
                                        {CHANNELS.map((ch) => (
                                            <Td key={ch}>
                                                <Box
                                                    display="flex"
                                                    justifyContent="center"
                                                >
                                                    <Switch
                                                        checked={pref.channels.includes(
                                                            ch
                                                        )}
                                                        disabled={!pref.enabled}
                                                        onCheckedChange={() =>
                                                            toggleChannel(key, ch)
                                                        }
                                                    />
                                                </Box>
                                            </Td>
                                        ))}
                                    </Tr>
                                )
                            )}
                        </tbody>
                    </Table>
                </Box>
            </Box>

            {/* ── Email Digest Settings ───────────────────────────────────────── */}
            <Box>
                <Heading level="3" mb="8">
                    Email Digest
                </Heading>
                <Text color="fg.tertiary" mb="16">
                    How often should we send you an email summary of your
                    notifications?
                </Text>
                <Box display="flex" gap="12">
                    {(
                        ["immediate", "hourly", "daily", "never"] as const
                    ).map((option) => (
                        <Box
                            key={option}
                            p="16"
                            border="1"
                            borderColor={
                                preferences.emailDigest === option
                                    ? "border.accent"
                                    : "border.tertiary"
                            }
                            rounded="md"
                            bg={
                                preferences.emailDigest === option
                                    ? "bg.accent.subtle"
                                    : "bg.default"
                            }
                            className="cursor-pointer hover:bg-[var(--ax-colors-bg-default-hovered)]"
                            onClick={() => setDigest(option)}
                            style={{ minWidth: 120 }}
                        >
                            <Text
                                fontWeight="600"
                                textTransform="capitalize"
                                fontSize="sm"
                            >
                                {option}
                            </Text>
                            <Text fontSize="xs" color="fg.tertiary" mt="4">
                                {option === "immediate" && "Get each notification as it happens"}
                                {option === "hourly" && "Batch notifications hourly"}
                                {option === "daily" && "One daily summary email"}
                                {option === "never" && "No email notifications"}
                            </Text>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* ── Watched Agents ──────────────────────────────────────────────── */}
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
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap="8"
                    >
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

            {/* ── Save ────────────────────────────────────────────────────────── */}
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

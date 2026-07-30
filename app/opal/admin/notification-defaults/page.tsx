<<<<<<< HEAD
"use client";

import {
    Box,
    Heading,
    Text,
    Button,
    Switch,
    Badge,
    Separator,
} from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { IconCheck, IconShieldCheck } from "@optiaxiom/icons";
import { useState } from "react";
import {
    mockOrgDefaultPreferences,
    formatPreferenceKey,
    type UserPreferences,
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

export default function NotificationDefaultsPage() {
    const [orgDefaults, setOrgDefaults] = useState<UserPreferences>(
        JSON.parse(JSON.stringify(mockOrgDefaultPreferences))
    );
    const [saved, setSaved] = useState(false);

    const toggleEnabled = (key: string) => {
        setOrgDefaults((prev) => ({
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
        setOrgDefaults((prev) => {
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
        setOrgDefaults((prev) => ({ ...prev, emailDigest: value }));
        setSaved(false);
    };

    const saveOrgDefaults = () => {
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
                <Box display="flex" alignItems="center" gap="12">
                    <Heading level="2">
                        Organization Notification Defaults
                    </Heading>
                    <Badge intent="information" variant="subtle">
                        Admin
                    </Badge>
                </Box>
                <Text color="fg.tertiary" mt="8">
                    These settings will be applied as defaults for all new users
                    in your organization. Individual users can override these in
                    their personal preferences.
                </Text>
            </Box>

            {/* Admin notice */}
            <Box
                p="16"
                bg="bg.information.subtle"
                border="1"
                borderColor="border.default"
                rounded="md"
                display="flex"
                alignItems="center"
                gap="12"
            >
                <IconShieldCheck
                    size={20}
                    color="var(--ax-colors-fg-information)"
                />
                <Text fontSize="sm" color="fg.information">
                    Changes here affect the default notification configuration
                    for new users. Existing users&apos; preferences will not be
                    modified.
                </Text>
            </Box>

            {/* ── Default Notification Settings ──────────────────────────────── */}
            <Box>
                <Heading level="3" mb="8">
                    Default Notification Types
                </Heading>
                <Text color="fg.tertiary" mb="16">
                    Set which notifications are enabled by default and through
                    which channels.
                </Text>

                <Box overflow="hidden">
                    <Table>
                        <thead>
                            <Tr>
                                <Th style={{ width: "30%" }}>
                                    Notification Type
                                </Th>
                                <Th
                                    style={{
                                        width: "10%",
                                        textAlign: "center",
                                    }}
                                >
                                    Enabled
                                </Th>
                                {CHANNELS.map((ch) => (
                                    <Th
                                        key={ch}
                                        style={{ textAlign: "center" }}
                                    >
                                        <ChannelHeader channel={ch} />
                                    </Th>
                                ))}
                            </Tr>
                        </thead>
                        <tbody>
                            {Object.entries(orgDefaults.preferences).map(
                                ([key, pref]) => (
                                    <Tr key={key}>
                                        <Td>
                                            <Text
                                                fontWeight="500"
                                                fontSize="sm"
                                            >
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

            {/* ── Default Email Digest ────────────────────────────────────────── */}
            <Box>
                <Heading level="3" mb="8">
                    Default Email Digest
                </Heading>
                <Text color="fg.tertiary" mb="16">
                    Default email digest frequency for new users.
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
                                orgDefaults.emailDigest === option
                                    ? "border.accent"
                                    : "border.tertiary"
                            }
                            rounded="md"
                            bg={
                                orgDefaults.emailDigest === option
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
                                {option === "immediate" &&
                                    "Send immediately"}
                                {option === "hourly" && "Batch hourly"}
                                {option === "daily" && "Daily summary"}
                                {option === "never" && "No emails"}
                            </Text>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* ── Save ────────────────────────────────────────────────────────── */}
            <Box display="flex" alignItems="center" gap="12" pt="8">
                <Button appearance="primary" onClick={saveOrgDefaults}>
                    Save Organization Defaults
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
                        <Text
                            color="fg.success"
                            fontSize="sm"
                            fontWeight="500"
                        >
                            Organization defaults saved
                        </Text>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
=======
"use client";

import {
    Box,
    Heading,
    Text,
    Button,
    Switch,
    Badge,
    Separator,
} from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { IconCheck, IconShieldCheck } from "@optiaxiom/icons";
import { useState } from "react";
import {
    mockOrgDefaultPreferences,
    formatPreferenceKey,
    type UserPreferences,
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

export default function NotificationDefaultsPage() {
    const [orgDefaults, setOrgDefaults] = useState<UserPreferences>(
        JSON.parse(JSON.stringify(mockOrgDefaultPreferences))
    );
    const [saved, setSaved] = useState(false);

    const toggleEnabled = (key: string) => {
        setOrgDefaults((prev) => ({
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
        setOrgDefaults((prev) => {
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
        setOrgDefaults((prev) => ({ ...prev, emailDigest: value }));
        setSaved(false);
    };

    const saveOrgDefaults = () => {
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
                <Box display="flex" alignItems="center" gap="12">
                    <Heading level="2">
                        Organization Notification Defaults
                    </Heading>
                    <Badge intent="information" variant="subtle">
                        Admin
                    </Badge>
                </Box>
                <Text color="fg.tertiary" mt="8">
                    These settings will be applied as defaults for all new users
                    in your organization. Individual users can override these in
                    their personal preferences.
                </Text>
            </Box>

            {/* Admin notice */}
            <Box
                p="16"
                bg="bg.information.subtle"
                border="1"
                borderColor="border.default"
                rounded="md"
                display="flex"
                alignItems="center"
                gap="12"
            >
                <IconShieldCheck
                    size={20}
                    color="var(--ax-colors-fg-information-strong)"
                />
                <Text fontSize="sm" color="fg.information.strong">
                    Changes here affect the default notification configuration
                    for new users. Existing users&apos; preferences will not be
                    modified.
                </Text>
            </Box>

            {/* ── Default Notification Settings ──────────────────────────────── */}
            <Box>
                <Heading level="3" mb="8">
                    Default Notification Types
                </Heading>
                <Text color="fg.tertiary" mb="16">
                    Set which notifications are enabled by default and through
                    which channels.
                </Text>

                <Box overflow="hidden">
                    <Table>
                        <thead>
                            <Tr>
                                <Th style={{ width: "30%" }}>
                                    Notification Type
                                </Th>
                                <Th
                                    style={{
                                        width: "10%",
                                        textAlign: "center",
                                    }}
                                >
                                    Enabled
                                </Th>
                                {CHANNELS.map((ch) => (
                                    <Th
                                        key={ch}
                                        style={{ textAlign: "center" }}
                                    >
                                        <ChannelHeader channel={ch} />
                                    </Th>
                                ))}
                            </Tr>
                        </thead>
                        <tbody>
                            {Object.entries(orgDefaults.preferences).map(
                                ([key, pref]) => (
                                    <Tr key={key}>
                                        <Td>
                                            <Text
                                                fontWeight="500"
                                                fontSize="sm"
                                            >
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

            {/* ── Default Email Digest ────────────────────────────────────────── */}
            <Box>
                <Heading level="3" mb="8">
                    Default Email Digest
                </Heading>
                <Text color="fg.tertiary" mb="16">
                    Default email digest frequency for new users.
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
                                orgDefaults.emailDigest === option
                                    ? "border.default"
                                    : "border.tertiary"
                            }
                            rounded="md"
                            bg={
                                orgDefaults.emailDigest === option
                                    ? "bg.default.pressed"
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
                                {option === "immediate" &&
                                    "Send immediately"}
                                {option === "hourly" && "Batch hourly"}
                                {option === "daily" && "Daily summary"}
                                {option === "never" && "No emails"}
                            </Text>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* ── Save ────────────────────────────────────────────────────────── */}
            <Box display="flex" alignItems="center" gap="12" pt="8">
                <Button appearance="primary" onClick={saveOrgDefaults}>
                    Save Organization Defaults
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
                        <Text
                            color="fg.success"
                            fontSize="sm"
                            fontWeight="500"
                        >
                            Organization defaults saved
                        </Text>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
>>>>>>> origin/main

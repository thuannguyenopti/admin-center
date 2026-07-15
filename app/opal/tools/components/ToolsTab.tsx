"use client";

import React, { useState, useMemo } from "react";
import {
    Box,
    Text,
    Button,
    Badge,
    Switch,
    Tooltip,
    Menu,
    MenuTrigger,
    MenuContent,
    LabelMenuButton,
} from "@optiaxiom/react";
import {
    IconChevronDown,
    IconChevronRight,
    IconSearch,
    IconCircleQuestion,
} from "@optiaxiom/icons";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { Input } from "@/app/components/Input";
import { ConnectorAvatar } from "./ConnectorAvatar";
import { CONNECTORS, type Connector, type ConnectorTool } from "../data/connectors";

type ToolAction = "Read" | "Create" | "Update" | "Delete";

const ACTION_INTENT: Record<ToolAction, "neutral" | "success" | "information" | "danger"> = {
    Read: "neutral",
    Create: "success",
    Update: "information",
    Delete: "danger",
};

interface ToolToggleState {
    activeForInstance: boolean;
    enabledInChat: boolean;
    activeForUser: boolean;
}

interface ToolRow {
    connector: Connector;
    tool: ConnectorTool;
}

// Seed demo state: Delete tools start instance-inactive; Create tools skip chat
function seedToggleState(tool: ConnectorTool): ToolToggleState {
    const instanceActive = tool.action !== "Delete";
    return {
        activeForInstance: instanceActive,
        enabledInChat: instanceActive && tool.action === "Read",
        activeForUser: true,
    };
}

export function ToolsTab({ isUserView = false }: { isUserView?: boolean }) {
    const [search, setSearch] = useState("");
    const [connectorFilter, setConnectorFilter] = useState<string | null>(null);
    const [actionFilter, setActionFilter] = useState<ToolAction | null>(null);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    const [toggles, setToggles] = useState<Map<string, ToolToggleState>>(() => {
        const map = new Map<string, ToolToggleState>();
        CONNECTORS.forEach(c => c.tools.forEach(t => map.set(t.id, seedToggleState(t))));
        return map;
    });

    const getToggle = (toolId: string): ToolToggleState =>
        toggles.get(toolId) ?? { activeForInstance: true, enabledInChat: true, activeForUser: true };

    const setToggleField = (toolId: string, field: keyof ToolToggleState, value: boolean) => {
        setToggles(prev => {
            const next = new Map(prev);
            const current = next.get(toolId) ?? { activeForInstance: true, enabledInChat: true, activeForUser: true };
            const updated = { ...current, [field]: value };
            // Cascade: chat requires both instance and user to be active
            if ((field === "activeForInstance" || field === "activeForUser") && !value) {
                updated.enabledInChat = false;
            }
            next.set(toolId, updated);
            return next;
        });
    };

    const toggleGroup = (id: string) =>
        setCollapsedGroups(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const allRows = useMemo<ToolRow[]>(
        () => CONNECTORS.flatMap(c => c.tools.map(tool => ({ connector: c, tool }))),
        []
    );

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return allRows.filter(({ connector, tool }) => {
            const matchesSearch =
                !q ||
                tool.name.toLowerCase().includes(q) ||
                tool.description.toLowerCase().includes(q) ||
                connector.name.toLowerCase().includes(q);
            const matchesConnector = !connectorFilter || connector.id === connectorFilter;
            const matchesAction = !actionFilter || tool.action === actionFilter;
            return matchesSearch && matchesConnector && matchesAction;
        });
    }, [allRows, search, connectorFilter, actionFilter]);

    const groups = useMemo(() => {
        const map = new Map<string, { connector: Connector; tools: ConnectorTool[] }>();
        for (const { connector, tool } of filteredRows) {
            if (!map.has(connector.id)) map.set(connector.id, { connector, tools: [] });
            map.get(connector.id)!.tools.push(tool);
        }
        return Array.from(map.values());
    }, [filteredRows]);

    const connectorOptions = useMemo(() => [
        {
            label: "All connectors",
            execute: () => setConnectorFilter(null),
            selected: () => !connectorFilter,
        },
        ...CONNECTORS.map(c => ({
            label: c.name,
            execute: () => setConnectorFilter(c.id),
            selected: () => connectorFilter === c.id,
        })),
    ], [connectorFilter]);

    const actionOptions = useMemo(() => [
        { label: "All actions", execute: () => setActionFilter(null), selected: () => !actionFilter },
        ...(["Read", "Create", "Update", "Delete"] as ToolAction[]).map(a => ({
            label: a,
            execute: () => setActionFilter(a),
            selected: () => actionFilter === a,
        })),
    ], [actionFilter]);

    const connectorLabel = connectorFilter
        ? (CONNECTORS.find(c => c.id === connectorFilter)?.name ?? "All")
        : "All";

    // admin: chevron + tool + desc + action + instance + chat + user = 7 cols, header spans 6
    // user:  chevron + tool + desc + action + chat + user = 6 cols, header spans 5
    const groupColSpan = isUserView ? 5 : 6;

    return (
        <Box display="flex" flexDirection="column" gap="16">
            {/* Filters */}
            <Box display="flex" gap="12" alignItems="center">
                <Box style={{ width: 280 }}>
                    <Input
                        placeholder="Search tools..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                        addonBefore={<IconSearch size={16} />}
                    />
                </Box>
                <Menu inputVisible="always" placeholder="Search connector..." options={connectorOptions}>
                    <MenuTrigger asChild>
                        <LabelMenuButton label="Connector" h="40">{connectorLabel}</LabelMenuButton>
                    </MenuTrigger>
                    <MenuContent style={{ maxHeight: 320, overflowY: "auto" }} />
                </Menu>
                <Menu options={actionOptions}>
                    <MenuTrigger asChild>
                        <LabelMenuButton label="Action" h="40">{actionFilter ?? "All"}</LabelMenuButton>
                    </MenuTrigger>
                    <MenuContent />
                </Menu>
                <Text fontSize="sm" color="fg.tertiary" style={{ marginLeft: "auto" }}>
                    {filteredRows.length} {filteredRows.length === 1 ? "tool" : "tools"}
                </Text>
            </Box>

            {/* Table */}
            {groups.length === 0 ? (
                <Box display="flex" justifyContent="center" py="48">
                    <Text color="fg.tertiary">No tools match your search.</Text>
                </Box>
            ) : (
                <Table>
                    <thead>
                        <Tr>
                            <Th style={{ width: 40, paddingLeft: 16, paddingRight: 0 }} />
                            <Th style={{ minWidth: 200, paddingLeft: 8 }}>Tool</Th>
                            <Th>Description</Th>
                            <Th style={{ width: 96 }}>Action</Th>
                            {!isUserView && (
                                <Th style={{ width: 148 }}>
                                    <ColHeader
                                        label="Active for Instance"
                                        tooltip="Org-wide master switch — enables this tool for all users in all contexts (primary chat, IMs, VAUs). Admin only."
                                    />
                                </Th>
                            )}
                            <Th style={{ width: 128 }}>
                                <ColHeader
                                    label="Active for Me"
                                    tooltip="Your personal setting, independent of the org-wide Active toggle. Turn it off to disable this tool for yourself only — you will not see it in your lists. Any tool can be disabled for you."
                                />
                            </Th>
                            <Th style={{ width: 168 }}>
                                <ColHeader
                                    label="Enabled in Primary Chat"
                                    tooltip="Makes this tool available in Opal's primary agent chat only. Does not affect IMs or VAUs. Requires both instance and user to be active. Admin only."
                                />
                            </Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {groups.map(({ connector, tools }) => {
                            const isCollapsed = collapsedGroups.has(connector.id);
                            return (
                                <React.Fragment key={connector.id}>
                                    {/* Group header row */}
                                    <Tr
                                        onClick={() => toggleGroup(connector.id)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <Td style={{ paddingLeft: 16, paddingRight: 0, verticalAlign: "middle" }}>
                                            <Button
                                                appearance="subtle"
                                                size="sm"
                                                icon={isCollapsed ? <IconChevronRight /> : <IconChevronDown />}
                                                aria-label={isCollapsed ? "Expand" : "Collapse"}
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    toggleGroup(connector.id);
                                                }}
                                            />
                                        </Td>
                                        <Td colSpan={groupColSpan} style={{ paddingLeft: 8, verticalAlign: "middle" }}>
                                            <Box display="flex" alignItems="center" gap="12">
                                                <ConnectorAvatar connector={connector} size={28} />
                                                <Text fontWeight="500">{connector.name}</Text>
                                                <Badge intent="neutral">{connector.category}</Badge>
                                                <Badge intent="neutral">
                                                    {tools.length} {tools.length === 1 ? "tool" : "tools"}
                                                </Badge>
                                            </Box>
                                        </Td>
                                    </Tr>

                                    {/* Tool rows */}
                                    {!isCollapsed && tools.map(tool => {
                                        const state = getToggle(tool.id);
                                        const instanceOn = state.activeForInstance;
                                        return (
                                            <Tr key={tool.id}>
                                                <Td style={{ paddingLeft: 16, paddingRight: 0 }}>
                                                    <Box style={{ width: 32, height: 32, flexShrink: 0 }} />
                                                </Td>
                                                <Td style={{ paddingLeft: 8, verticalAlign: "middle" }}>
                                                    <Text
                                                        fontSize="sm"
                                                        fontWeight="500"
                                                    >
                                                        {tool.name}
                                                    </Text>
                                                </Td>
                                                <Td style={{ verticalAlign: "middle" }}>
                                                    <Text fontSize="sm" color="fg.secondary">
                                                        {tool.description}
                                                    </Text>
                                                </Td>
                                                <Td style={{ verticalAlign: "middle" }}>
                                                    <Badge intent={ACTION_INTENT[tool.action as ToolAction]}>
                                                        {tool.action}
                                                    </Badge>
                                                </Td>

                                                {/* Col 1: Active for Instance — admin only */}
                                                {!isUserView && (
                                                    <Td style={{ verticalAlign: "middle" }}>
                                                        <Switch
                                                            checked={state.activeForInstance}
                                                            onCheckedChange={v =>
                                                                setToggleField(tool.id, "activeForInstance", v)
                                                            }
                                                        />
                                                    </Td>
                                                )}

                                                {/* Col 2: Active for You — greyed when instance is off */}
                                                <Td style={{ verticalAlign: "middle" }}>
                                                    {instanceOn ? (
                                                        <Switch
                                                            checked={state.activeForUser}
                                                            onCheckedChange={v =>
                                                                setToggleField(tool.id, "activeForUser", v)
                                                            }
                                                        />
                                                    ) : (
                                                        <Tooltip
                                                            content="Disabled at instance level — contact your admin"
                                                            delayDuration={200}
                                                        >
                                                            <span style={{ display: "inline-flex" }}>
                                                                <Switch checked={false} disabled />
                                                            </span>
                                                        </Tooltip>
                                                    )}
                                                </Td>

                                                {/* Col 3: Enabled in Primary Chat — requires instance + user both on */}
                                                <Td style={{ verticalAlign: "middle" }}>
                                                    {instanceOn && state.activeForUser && !isUserView ? (
                                                        <Switch
                                                            checked={state.enabledInChat}
                                                            onCheckedChange={v =>
                                                                setToggleField(tool.id, "enabledInChat", v)
                                                            }
                                                        />
                                                    ) : (
                                                        <Tooltip
                                                            content={
                                                                isUserView
                                                                    ? "Managed by your admin"
                                                                    : !instanceOn
                                                                        ? "Enable at instance level first"
                                                                        : "Enable for yourself first"
                                                            }
                                                            delayDuration={200}
                                                        >
                                                            <span style={{ display: "inline-flex" }}>
                                                                <Switch
                                                                    checked={instanceOn && state.activeForUser && state.enabledInChat}
                                                                    disabled
                                                                />
                                                            </span>
                                                        </Tooltip>
                                                    )}
                                                </Td>
                                            </Tr>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </Table>
            )}
        </Box>
    );
}

function ColHeader({ label, tooltip }: { label: string; tooltip: string }) {
    return (
        <Box display="flex" alignItems="center" gap="4">
            <span>{label}</span>
            <Tooltip content={tooltip} delayDuration={300}>
                <span style={{ display: "inline-flex" }}>
                    <IconCircleQuestion size={13} color="var(--ax-colors-fg-tertiary)" />
                </span>
            </Tooltip>
        </Box>
    );
}

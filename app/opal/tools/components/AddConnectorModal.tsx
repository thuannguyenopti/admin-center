"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Box,
    Text,
    Button,
    Badge,
    Dialog,
    DialogContent,
    Switch,
    Checkbox,
    toaster,
} from "@optiaxiom/react";
import {
    IconSearch,
    IconLock,
    IconCheck,
} from "@optimizely/axiom-icons";
import { Input } from "@/app/components/Input";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { ConnectorTile } from "./ConnectorTile";
import { ConnectorAvatar } from "./ConnectorAvatar";
import { CONNECTORS, type Connector, type ToolAction } from "../data/connectors";

// ── Types ─────────────────────────────────────────────────────────────────────

type Screen = "browse" | "detail" | "configure";

export interface ConnectedConnector {
    id: string;
    name: string;
    category: string;
    type: "auth_provider" | "mcp";
    status: "connected";
    managedBy: "User" | "Admin";
    toolCount: number;
    access: "All users" | "Select teams";
    addedOn: string;
}

interface AddConnectorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConnectorAdded: (connector: ConnectedConnector) => void;
    connectedIds?: string[];
    initialConnector?: Connector | null;
    initialScreen?: Screen;
}

function isUserLevelConnector(connector: Connector) {
    if (connector.id === "google-analytics") return false;
    return connector.category === "Google Workspace" || connector.category === "Microsoft 365";
}

// ── Stepper ───────────────────────────────────────────────────────────────────

const STEPS = ["PERMISSIONS", "TYPE", "TOOLS"] as const;

function StepperHeader({ step }: { step: number }) {
    return (
        <Box display="flex" alignItems="center" mb="32" mt="8">
            {STEPS.map((label, i) => (
                <Box key={label} display="flex" alignItems="center" style={{ flex: i < STEPS.length - 1 ? 1 : "initial" }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap="4">
                        <Box
                            rounded="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            style={{
                                width: 28,
                                height: 28,
                                background: i <= step
                                    ? "var(--ax-colors-bg-accent)"
                                    : "var(--ax-colors-bg-tertiary)",
                                flexShrink: 0,
                            }}
                        >
                            {i < step ? (
                                <IconCheck size={14} style={{ color: "var(--ax-colors-fg-default-inverse)" }} />
                            ) : (
                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    style={{
                                        color: i <= step
                                            ? "var(--ax-colors-fg-default-inverse)"
                                            : "var(--ax-colors-fg-secondary)",
                                        lineHeight: 1,
                                    }}
                                >
                                    {i + 1}
                                </Text>
                            )}
                        </Box>
                        <Text
                            fontSize="xs"
                            fontWeight={i === step ? "600" : "400"}
                            style={{ color: i <= step ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)", letterSpacing: "0.05em" }}
                        >
                            {label}
                        </Text>
                    </Box>
                    {i < STEPS.length - 1 && (
                        <Box
                            style={{
                                flex: 1,
                                height: 1,
                                background: i < step
                                    ? "var(--ax-colors-bg-accent)"
                                    : "var(--ax-colors-border-tertiary)",
                                marginBottom: 20,
                                marginLeft: 8,
                                marginRight: 8,
                            }}
                        />
                    )}
                </Box>
            ))}
        </Box>
    );
}

// ── Tool action badge intent ───────────────────────────────────────────────────

const actionIntent: Record<ToolAction, "information" | "warning" | "success" | "danger"> = {
    Read: "information",
    Update: "warning",
    Create: "success",
    Delete: "danger",
};

// ── SelectionCard ─────────────────────────────────────────────────────────────

function SelectionCard({
    selected,
    onClick,
    title,
    description,
}: {
    selected: boolean;
    onClick: () => void;
    title: string;
    description: string;
}) {
    return (
        <Box
            flex="1"
            p="16"
            rounded="md"
            onClick={onClick}
            style={{
                border: `2px solid ${selected ? "var(--ax-colors-border-focus)" : "var(--ax-colors-border-tertiary)"}`,
                cursor: "pointer",
                background: selected ? "var(--ax-colors-bg-accent-subtle)" : "var(--ax-colors-bg-default)",
                transition: "border-color 0.15s, background 0.15s",
            }}
        >
            <Text fontWeight="500" fontSize="sm">{title}</Text>
            <Text fontSize="sm" color="fg.secondary" mt="4">{description}</Text>
        </Box>
    );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export function AddConnectorModal({
    open,
    onOpenChange,
    onConnectorAdded,
    connectedIds = [],
    initialConnector = null,
    initialScreen = "browse",
}: AddConnectorModalProps) {
    const [screen, setScreen] = useState<Screen>(initialScreen);
    const [selected, setSelected] = useState<Connector | null>(initialConnector);
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [enabledForOrg, setEnabledForOrg] = useState(true);
    const [access, setAccess] = useState<"all" | "teams">("all");
    const [managedBy, setManagedBy] = useState<"user" | "admin">("user");
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [toolSearch, setToolSearch] = useState("");
    const [browseSearch, setBrowseSearch] = useState("");
    const [detailPage, setDetailPage] = useState(1);

    const TOOLS_PER_PAGE = 10;

    // Sync initial state when modal opens with new context
    useEffect(() => {
        if (open) {
            setScreen(initialScreen);
            setSelected(initialConnector);
            setStep(0);
            if (initialConnector) {
                setSelectedTools(initialConnector.tools.map(t => t.id));
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const resetModal = () => {
        setScreen("browse");
        setSelected(null);
        setStep(0);
        setEnabledForOrg(true);
        setAccess("all");
        setManagedBy("user");
        setSelectedTools([]);
        setToolSearch("");
        setBrowseSearch("");
        setDetailPage(1);
    };

    const handleOpenChange = (val: boolean) => {
        if (!val) resetModal();
        onOpenChange(val);
    };

    const handleDetails = (c: Connector) => {
        setSelected(c);
        setDetailPage(1);
        setScreen("detail");
    };

    const saveConnector = (
        connector: Connector,
        options?: {
            managedBy?: ConnectedConnector["managedBy"];
            access?: ConnectedConnector["access"];
            toolIds?: string[];
        }
    ) => {
        const nextTools = options?.toolIds ?? connector.tools.map(t => t.id);
        const connectedConnector: ConnectedConnector = {
            id: connector.id,
            name: connector.name,
            category: connector.category,
            type: connector.type,
            status: "connected",
            managedBy: options?.managedBy ?? (managedBy === "user" ? "User" : "Admin"),
            toolCount: nextTools.length,
            access: options?.access ?? (access === "all" ? "All users" : "Select teams"),
            addedOn: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        };
        onConnectorAdded(connectedConnector);
        toaster.create(`${connector.name} successfully connected`, { intent: "success" });
        handleOpenChange(false);
    };

    const handleConfigure = (c: Connector) => {
        if (isUserLevelConnector(c)) {
            saveConnector(c, {
                managedBy: "User",
                access: "All users",
                toolIds: c.tools.map(t => t.id),
            });
            return;
        }

        setSelected(c);
        setStep(0);
        setSelectedTools(c.tools.map(t => t.id)); // default all enabled
        setScreen("configure");
    };

    const handleSave = () => {
        if (!selected) return;
        saveConnector(selected, { toolIds: selectedTools });
    };

    // ── Filtered connectors for browse ────────────────────────────────────────
    const filteredConnectors = useMemo(() => {
        if (!browseSearch.trim()) return CONNECTORS;
        const q = browseSearch.toLowerCase();
        return CONNECTORS.filter(
            c => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
        );
    }, [browseSearch]);

    // ── Filtered tools for configure step 2 ──────────────────────────────────
    const filteredTools = useMemo(() => {
        if (!selected) return [];
        if (!toolSearch.trim()) return selected.tools;
        const q = toolSearch.toLowerCase();
        return selected.tools.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }, [selected, toolSearch]);

    // ── Detail pagination ─────────────────────────────────────────────────────
    const pagedTools = useMemo(() => {
        if (!selected) return [];
        const start = (detailPage - 1) * TOOLS_PER_PAGE;
        return selected.tools.slice(start, start + TOOLS_PER_PAGE);
    }, [selected, detailPage]);

    // ── Toggle tool ───────────────────────────────────────────────────────────
    const toggleTool = (id: string) => {
        setSelectedTools(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                style={{
                    width: "min(880px, 95vw)",
                    height: "82vh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    padding: 0,
                }}
            >
                {/* ── Screen A: Browse ─────────────────────────────────────── */}
                {screen === "browse" && (
                    <Box display="flex" flexDirection="column" style={{ height: "100%", overflow: "hidden" }}>
                        {/* Header */}
                        <Box p="24" style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", flexShrink: 0 }}>
                            <Text fontWeight="700" fontSize="xl" style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>
                                Add a connector to your org
                            </Text>
                            <Text color="fg.secondary" fontSize="sm" mt="4">
                                Connect tools for your entire org to use with their agents
                            </Text>
                            <Box mt="16">
                                <Input
                                    placeholder="Search connectors..."
                                    value={browseSearch}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrowseSearch(e.target.value)}
                                    addonBefore={<IconSearch size={16} />}
                                />
                            </Box>
                        </Box>

                        {/* Grid */}
                        <Box style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                            <Box
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(4, 1fr)",
                                    gap: "16px",
                                }}
                            >
                                {filteredConnectors.map(c => (
                                    <ConnectorTile
                                        key={c.id}
                                        connector={c}
                                        isConnected={connectedIds.includes(c.id)}
                                        onDetails={handleDetails}
                                        onConfigure={handleConfigure}
                                    />
                                ))}
                                {filteredConnectors.length === 0 && (
                                    <Box style={{ gridColumn: "1 / -1" }} display="flex" justifyContent="center" py="48">
                                        <Text color="fg.tertiary">No connectors match your search.</Text>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Footer */}
                        <Box
                            p="16"
                            display="flex"
                            justifyContent="flex-end"
                            style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)", flexShrink: 0 }}
                        >
                            <Button appearance="subtle" onClick={() => handleOpenChange(false)}>Cancel</Button>
                        </Box>
                    </Box>
                )}

                {/* ── Screen B: Detail ─────────────────────────────────────── */}
                {screen === "detail" && selected && (
                    <Box display="flex" flexDirection="column" style={{ height: "100%", overflow: "hidden" }}>
                        {/* Header */}
                        <Box p="24" style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", flexShrink: 0 }}>
                            <Box display="flex" alignItems="center" gap="16" flexWrap="wrap">
                                <ConnectorAvatar connector={selected} size={48} />
                                <Box flex="1">
                                    <Box display="flex" alignItems="center" gap="8">
                                        <Text fontWeight="700" fontSize="xl" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                            {selected.name}
                                        </Text>
                                        <Badge intent="neutral" >
                                            {selected.type === "mcp" ? "MCP Server" : "Connector built by Opal"}
                                        </Badge>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap="8" mt="4">
                                        <Box
                                            rounded="full"
                                            style={{ width: 8, height: 8, background: connectedIds.includes(selected.id) ? "var(--ax-colors-bg-success-strong)" : "var(--ax-colors-border-tertiary)", flexShrink: 0 }}
                                        />
                                        <Text fontSize="sm" color="fg.secondary">
                                            {connectedIds.includes(selected.id) ? "Connected" : "Not connected"}
                                        </Text>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Body */}
                        <Box style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                            {/* About */}
                            <Box display="flex" gap="48" mb="32">
                                <Box style={{ flex: 2 }}>
                                    <Text fontWeight="600" mb="8">About</Text>
                                    <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.6" }}>
                                        {selected.about}
                                    </Text>
                                </Box>
                                <Box style={{ flex: 1 }}>
                                    <Text fontWeight="600" mb="8">Authentication</Text>
                                    <Text fontSize="sm">{selected.authType}</Text>
                                </Box>
                            </Box>

                            {/* Tools table */}
                            {selected.tools.length > 0 ? (
                                <>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb="12">
                                        <Text fontWeight="600">Tools</Text>
                                        <Input
                                            placeholder="Search tools..."
                                            value={toolSearch}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToolSearch(e.target.value)}
                                            addonBefore={<IconSearch size={14} />}
                                            style={{ width: 200 }}
                                        />
                                    </Box>
                                    <Table>
                                        <thead>
                                            <Tr>
                                                <Th style={{ width: 32 }}></Th>
                                                <Th>Tools</Th>
                                                <Th>Type</Th>
                                                <Th>Descriptions</Th>
                                            </Tr>
                                        </thead>
                                        <tbody>
                                            {(toolSearch ? filteredTools : pagedTools).map(tool => (
                                                <Tr key={tool.id}>
                                                    <Td>
                                                        <IconLock size={14} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
                                                    </Td>
                                                    <Td type="header">{tool.name}</Td>
                                                    <Td>
                                                        <Badge intent={actionIntent[tool.action]} >
                                                            {tool.action}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <Text fontSize="sm" color="fg.secondary">{tool.description}</Text>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    {!toolSearch && selected.tools.length > TOOLS_PER_PAGE && (
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mt="16">
                                            <Text fontSize="sm" color="fg.secondary">
                                                {TOOLS_PER_PAGE} PER PAGE
                                            </Text>
                                            <Box display="flex" alignItems="center" gap="8">
                                                <Text fontSize="sm" color="fg.secondary">
                                                    PAGE {detailPage} OF {Math.ceil(selected.tools.length / TOOLS_PER_PAGE)}
                                                </Text>
                                                <Button
                                                    appearance="subtle"
                                                    
                                                    disabled={detailPage <= 1}
                                                    onClick={() => setDetailPage(p => Math.max(1, p - 1))}
                                                >
                                                    &lsaquo;
                                                </Button>
                                                <Button
                                                    appearance="subtle"
                                                    
                                                    disabled={detailPage >= Math.ceil(selected.tools.length / TOOLS_PER_PAGE)}
                                                    onClick={() => setDetailPage(p => p + 1)}
                                                >
                                                    &rsaquo;
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}
                                </>
                            ) : (
                                <Box p="24" textAlign="center">
                                    <Text color="fg.tertiary" fontSize="sm">
                                        Tools will be discovered automatically after connecting this MCP server.
                                    </Text>
                                </Box>
                            )}
                        </Box>

                        {/* Footer */}
                        <Box
                            p="16"
                            display="flex"
                            justifyContent="space-between"
                            style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)", flexShrink: 0 }}
                        >
                            <Button appearance="subtle" onClick={() => setScreen("browse")}>Back</Button>
                            <Button appearance="primary" onClick={() => handleConfigure(selected)}>
                                {isUserLevelConnector(selected) ? "Connect" : "Configure"}
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* ── Screen C: Configure (stepper) ────────────────────────── */}
                {screen === "configure" && selected && (
                    <Box display="flex" flexDirection="column" style={{ height: "100%", overflow: "hidden" }}>
                        {/* Header */}
                        <Box p="24" style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", flexShrink: 0 }}>
                            <Box display="flex" alignItems="center" gap="12" mb="20">
                                <ConnectorAvatar connector={selected} size={32} />
                                <Text fontWeight="700" fontSize="lg">Configure {selected.name}</Text>
                            </Box>

                            {/* Enable for org toggle */}
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                p="16"
                                rounded="md"
                                mb="8"
                                style={{ background: "var(--ax-colors-bg-secondary)", border: "1px solid var(--ax-colors-border-tertiary)" }}
                            >
                                <Box>
                                    <Text fontWeight="500" fontSize="sm">Enable for my org</Text>
                                    <Text fontSize="sm" color="fg.secondary">
                                        When off, the integration is visible but users must request access
                                    </Text>
                                </Box>
                                <Switch
                                    checked={enabledForOrg}
                                    onCheckedChange={setEnabledForOrg}
                                />
                            </Box>
                        </Box>

                        {/* Stepper + step content */}
                        <Box style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                            <StepperHeader step={step} />

                            {/* Step 0: Permissions */}
                            {step === 0 && (
                                <Box>
                                    <Text fontWeight="600" mb="4">Who has access by default?</Text>
                                    <Text fontSize="sm" color="fg.secondary" mb="16">
                                        Users can request access to connectors that aren't enabled by default.
                                    </Text>
                                    <Box display="flex" gap="16">
                                        <SelectionCard
                                            selected={access === "all"}
                                            onClick={() => setAccess("all")}
                                            title="All users"
                                            description="All users in your org will have immediate access"
                                        />
                                        <SelectionCard
                                            selected={access === "teams"}
                                            onClick={() => setAccess("teams")}
                                            title="Select teams"
                                            description="Choose teams with immediate access; others must request approval"
                                        />
                                    </Box>
                                </Box>
                            )}

                            {/* Step 1: Type */}
                            {step === 1 && (
                                <Box>
                                    <Text fontWeight="600" mb="4">How is authentication managed?</Text>
                                    <Text fontSize="sm" color="fg.secondary" mb="16">
                                        Choose how users authenticate when using this connector.
                                    </Text>
                                    <Box display="flex" gap="16">
                                        <SelectionCard
                                            selected={managedBy === "user"}
                                            onClick={() => setManagedBy("user")}
                                            title="User"
                                            description="Each user authenticates individually via OAuth. Tools run with their personal permissions."
                                        />
                                        <SelectionCard
                                            selected={managedBy === "admin"}
                                            onClick={() => setManagedBy("admin")}
                                            title="Admin"
                                            description="A shared service account is used for all users. Tools run with org-level permissions."
                                        />
                                    </Box>
                                </Box>
                            )}

                            {/* Step 2: Tools */}
                            {step === 2 && (
                                <Box>
                                    <Text fontWeight="600" mb="4">Which tools can be used by default?</Text>
                                    <Text fontSize="sm" color="fg.secondary" mb="16">
                                        Users can request access to tools that aren't enabled by default.
                                    </Text>

                                    {selected.tools.length === 0 ? (
                                        <Box
                                            p="24"
                                            rounded="md"
                                            textAlign="center"
                                            style={{ border: "1px solid var(--ax-colors-border-tertiary)" }}
                                        >
                                            <Text color="fg.tertiary" fontSize="sm">
                                                Tools will be discovered automatically after the server connects.
                                            </Text>
                                        </Box>
                                    ) : (
                                        <>
                                            <Box display="flex" alignItems="center" gap="12" mb="12">
                                                <Box style={{ flex: 1 }}>
                                                    <Input
                                                        placeholder={`Search ${selected.tools.length} tools`}
                                                        value={toolSearch}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToolSearch(e.target.value)}
                                                        addonBefore={<IconSearch size={14} />}
                                                    />
                                                </Box>
                                                <Button
                                                    appearance="subtle"
                                                    
                                                    onClick={() => setSelectedTools(filteredTools.map(t => t.id))}
                                                >
                                                    Select all
                                                </Button>
                                                <Button
                                                    appearance="subtle"
                                                    
                                                    onClick={() => setSelectedTools([])}
                                                >
                                                    Clear all
                                                </Button>
                                            </Box>

                                            <Box
                                                rounded="md"
                                                style={{
                                                    border: "1px solid var(--ax-colors-border-tertiary)",
                                                    overflowY: "auto",
                                                    maxHeight: "260px",
                                                }}
                                            >
                                                {filteredTools.map((tool, i) => (
                                                    <Box
                                                        key={tool.id}
                                                        display="flex"
                                                        alignItems="start"
                                                        gap="12"
                                                        p="12"
                                                        onClick={() => toggleTool(tool.id)}
                                                        style={{
                                                            borderTop: i > 0 ? "1px solid var(--ax-colors-border-tertiary)" : "none",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <Box pt="2">
                                                            <Checkbox
                                                                checked={selectedTools.includes(tool.id)}
                                                                onCheckedChange={() => toggleTool(tool.id)}
                                                                onClick={e => e.stopPropagation()}
                                                            />
                                                        </Box>
                                                        <Box flex="1">
                                                            <Box display="flex" alignItems="center" gap="8" mb="2">
                                                                <Text fontSize="sm" fontWeight="500">{tool.name}</Text>
                                                                <Badge intent={actionIntent[tool.action]} >
                                                                    {tool.action}
                                                                </Badge>
                                                            </Box>
                                                            <Text fontSize="sm" color="fg.secondary">
                                                                {tool.description}
                                                            </Text>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                            <Text fontSize="sm" color="fg.tertiary" mt="8">
                                                {selectedTools.length} of {selected.tools.length} tools enabled
                                            </Text>
                                        </>
                                    )}
                                </Box>
                            )}
                        </Box>

                        {/* Footer */}
                        <Box
                            p="16"
                            display="flex"
                            justifyContent="space-between"
                            style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)", flexShrink: 0 }}
                        >
                            <Button appearance="subtle" onClick={() => handleOpenChange(false)}>Cancel</Button>
                            <Box display="flex" gap="8">
                                {step > 0 && (
                                    <Button
                                        appearance="default"
                                        onClick={() => setStep(s => (s - 1) as 0 | 1 | 2)}
                                    >
                                        Previous
                                    </Button>
                                )}
                                {step < 2 ? (
                                    <Button
                                        appearance="primary"
                                        onClick={() => setStep(s => (s + 1) as 0 | 1 | 2)}
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button appearance="primary" onClick={handleSave}>
                                        Save
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Alert,
    Box,
    Text,
    Button,
    Badge,
    Disclosure,
    DisclosureContent,
    DisclosureTrigger,
    Dialog,
    DialogContent,
    Switch,
    Checkbox,
    toaster,
} from "@optiaxiom/react";
import {
    IconSearch,
    IconCheck,
    IconEye,
    IconPen,
    IconTrashCan,
} from "@optiaxiom/icons";
import { Input } from "@/app/components/Input";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { ConnectorTile } from "./ConnectorTile";
import { ConnectorAvatar } from "./ConnectorAvatar";
import { ModalStepper } from "./ModalStepper";
import { SalesforceConfig, GA4Config } from "./OCPConfigPanel";
import { CONNECTORS, type Connector, type ToolAction } from "../data/connectors";
import { requiresDeferredUserConnect, usesDirectUserConnect } from "../lib/connectorAuth";

// ── Types ─────────────────────────────────────────────────────────────────────

type Screen = "browse" | "detail" | "configure";

export interface ConnectedConnector {
    id: string;
    name: string;
    category: string;
    type: "auth_provider" | "mcp";
    status: "configured" | "connected";
    managedBy: "User" | "Admin";
    toolCount: number;
    access: "All users" | "Select teams";
    addedOn: string;
    toolIds: string[];
}

interface AddConnectorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConnectorAdded: (connector: ConnectedConnector) => void;
    onDisconnect: (id: string) => void;
    existingConnectors?: ConnectedConnector[];
    connectedIds?: string[];
    isUserView?: boolean;
    initialConnector?: Connector | null;
    initialScreen?: Screen;
    initialStep?: 0 | 1 | 2 | 3;
    initialToolsDisclosureOpen?: boolean;
    onConfigureInPanel?: (connector: Connector) => void;
}

const actionIcon: Record<ToolAction, React.ReactNode> = {
    Read: <IconEye size={14} />,
    Update: <IconPen size={14} />,
    Create: <IconPen size={14} />,
    Delete: <IconTrashCan size={14} />,
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
                border: `2px solid ${selected ? "var(--ax-colors-border-focus)" : "var(--ax-colors-border-secondary)"}`,
                cursor: "pointer",
                background: selected ? "var(--ax-colors-bg-information-subtle)" : "var(--ax-colors-bg-default)",
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
    onDisconnect,
    existingConnectors = [],
    connectedIds = [],
    isUserView = false,
    initialConnector = null,
    initialScreen = "browse",
    initialStep = 0,
    initialToolsDisclosureOpen = false,
    onConfigureInPanel,
}: AddConnectorModalProps) {
    const [screen, setScreen] = useState<Screen>(initialScreen);
    const [selected, setSelected] = useState<Connector | null>(initialConnector);
    const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
    const [enabledForOrg, setEnabledForOrg] = useState(true);
    const [access, setAccess] = useState<"all" | "teams">("all");
    const [managedBy, setManagedBy] = useState<"user" | "admin">(
        initialConnector?.authType === "API Key" ? "admin" : "user"
    );
    const [instanceUrl, setInstanceUrl] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [toolSearch, setToolSearch] = useState("");
    const [browseSearch, setBrowseSearch] = useState("");
    const [detailPage, setDetailPage] = useState(1);
    const [detailToolsDisclosureOpen, setDetailToolsDisclosureOpen] = useState(initialToolsDisclosureOpen);

    const getExistingConnector = (connector: Connector | null) => {
        if (!connector) return null;
        return existingConnectors.find(item => item.id === connector.id) ?? null;
    };

    const getDefaultToolIds = (connector: Connector) => {
        return getExistingConnector(connector)?.toolIds ?? connector.tools.map(t => t.id);
    };

    const TOOLS_PER_PAGE = 10;

    // Sync initial state when modal opens with new context
    useEffect(() => {
        if (open) {
            setScreen(initialScreen);
            setSelected(initialConnector);
            setStep(initialStep);
            setManagedBy(initialConnector?.authType === "API Key" ? "admin" : "user");
            setDetailToolsDisclosureOpen(initialToolsDisclosureOpen);
            if (initialConnector) {
                setSelectedTools(getDefaultToolIds(initialConnector));
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, initialStep, initialScreen, initialConnector, initialToolsDisclosureOpen]);

    const resetModal = () => {
        setScreen("browse");
        setSelected(null);
        setStep(0);
        setEnabledForOrg(true);
        setAccess("all");
        setManagedBy("user");
        setInstanceUrl("");
        setApiKey("");
        setSelectedTools([]);
        setToolSearch("");
        setBrowseSearch("");
        setDetailPage(1);
        setDetailToolsDisclosureOpen(false);
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
            status?: ConnectedConnector["status"];
            successMessage?: string;
            managedBy?: ConnectedConnector["managedBy"];
            access?: ConnectedConnector["access"];
            toolIds?: string[];
        }
    ) => {
        const existingConnector = getExistingConnector(connector);
        const nextTools = options?.toolIds ?? existingConnector?.toolIds ?? connector.tools.map(t => t.id);
        const connectedConnector: ConnectedConnector = {
            id: connector.id,
            name: connector.name,
            category: connector.category,
            type: connector.type,
            status: options?.status ?? "connected",
            managedBy: options?.managedBy ?? existingConnector?.managedBy ?? (managedBy === "user" ? "User" : "Admin"),
            toolCount: nextTools.length,
            access: options?.access ?? existingConnector?.access ?? (access === "all" ? "All users" : "Select teams"),
            addedOn: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            toolIds: nextTools,
        };
        onConnectorAdded(connectedConnector);
        toaster.create(options?.successMessage ?? `${connector.name} successfully connected`, { intent: "success" });
        handleOpenChange(false);
    };

    const handleConfigure = (c: Connector) => {
        const existingConnector = getExistingConnector(c);

        if (usesDirectUserConnect(c)) {
            saveConnector(c, {
                managedBy: "User",
                access: "All users",
                toolIds: c.tools.map(t => t.id),
            });
            return;
        }

        if (requiresDeferredUserConnect(c) && existingConnector?.status === "configured") {
            saveConnector(c, {
                status: "connected",
            });
            return;
        }

        if (onConfigureInPanel) {
            handleOpenChange(false);
            onConfigureInPanel(c);
            return;
        }

        setSelected(c);
        setStep(0);
        setSelectedTools(getDefaultToolIds(c));
        setScreen("configure");
    };

    const handleSave = () => {
        if (!selected) return;
        const existingConnector = getExistingConnector(selected);
        const shouldDeferConnection = requiresDeferredUserConnect(selected) && existingConnector?.status !== "connected";

        saveConnector(selected, {
            status: shouldDeferConnection ? "configured" : "connected",
            successMessage: shouldDeferConnection
                ? `${selected.name} setup saved. Users can connect from the connector details modal.`
                : undefined,
            toolIds: selectedTools,
        });
    };

    // ── Filtered connectors for browse ────────────────────────────────────────
    const filteredConnectors = useMemo(() => {
        if (!browseSearch.trim()) return CONNECTORS;
        const q = browseSearch.toLowerCase();
        return CONNECTORS
            .filter(
                c => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
            )
            .sort((a, b) => {
                if (a.id === "custom-mcp") return 1;
                if (b.id === "custom-mcp") return -1;
                return a.name.localeCompare(b.name);
            });
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

    const allFilteredToolsSelected = filteredTools.length > 0 && filteredTools.every(tool => selectedTools.includes(tool.id));

    // ── Toggle tool ───────────────────────────────────────────────────────────
    const toggleTool = (id: string) => {
        setSelectedTools(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    const isSelectedConnected = selected ? connectedIds.includes(selected.id) : false;
    const isSelectedConfigured = selected ? getExistingConnector(selected)?.status === "configured" : false;
    const isSelectedDirectConnect = selected ? usesDirectUserConnect(selected) : false;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                id="add-connector-modal"
                style={{
                    width: "min(760px, 92vw)",
                    height: "74vh",
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
                                        isConfigured={existingConnectors.some(item => item.id === c.id && item.status === "configured")}
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
                                        <Text fontWeight="700" fontSize="xl">
                                            {selected.name}
                                        </Text>
                                        <Badge intent="neutral" >
                                            {selected.type === "mcp" ? "MCP Server" : "Developed by Optimizely"}
                                        </Badge>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap="8" mt="4">
                                        <Box
                                            rounded="full"
                                            style={{ width: 8, height: 8, background: isSelectedConnected ? "var(--ax-colors-fg-success)" : "var(--ax-colors-border-tertiary)", flexShrink: 0 }}
                                        />
                                        <Text fontSize="sm" color="fg.secondary">
                                            {isSelectedConnected ? "Connected" : "Not connected"}
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
                                    <Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.6" }}>
                                        {selected.about}
                                    </Text>
                                </Box>
                                <Box style={{ flex: 1 }}>
                                    <Text fontWeight="600" mb="8">Authentication</Text>
                                    <Text fontSize="md">{selected.authType}</Text>
                                </Box>
                            </Box>

                            {/* Tools table */}
                            {selected.tools.length > 0 ? (
                                <Disclosure open={detailToolsDisclosureOpen} onOpenChange={setDetailToolsDisclosureOpen}>
                                    <DisclosureTrigger chevronPosition="start">
                                        <Box display="inline-flex" alignItems="center" gap="8">
                                            <Text fontWeight="600" color="fg.default">Tools</Text>
                                            <Badge intent="neutral">{selected.tools.length}</Badge>
                                        </Box>
                                    </DisclosureTrigger>
                                    <DisclosureContent>
                                        <Box mt="12">
                                            <Table>
                                                <thead>
                                                    <Tr>
                                                        <Th>Tools</Th>
                                                        <Th>Type</Th>
                                                        <Th>Descriptions</Th>
                                                    </Tr>
                                                </thead>
                                                <tbody>
                                                    {pagedTools.map(tool => (
                                                        <Tr key={tool.id}>
                                                            <Td type="header">{tool.name}</Td>
                                                            <Td>
                                                                <Box display="flex" alignItems="center" gap="8">
                                                                    <Box color="fg.secondary" display="flex" alignItems="center">
                                                                        {actionIcon[tool.action]}
                                                                    </Box>
                                                                    <Text fontSize="sm">{tool.action}</Text>
                                                                </Box>
                                                            </Td>
                                                            <Td>
                                                                <Text fontSize="sm" color="fg.secondary">{tool.description}</Text>
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                            {selected.tools.length > TOOLS_PER_PAGE && (
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
                                        </Box>
                                    </DisclosureContent>
                                </Disclosure>
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
                            alignItems="center"
                            justifyContent="space-between"
                            gap="16"
                            style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)", flexShrink: 0 }}
                        >
                            <Box display="flex" justifyContent="center" flex="1">
                                {isUserView && !isSelectedConnected && !isSelectedDirectConnect ? (
                                    <Alert intent="information" style={{ width: "100%" }}>
                                        Contact your Opal Admin for access.
                                    </Alert>
                                ) : null}
                            </Box>
                            <Box display="flex" justifyContent="flex-end" gap="8" style={{ flexShrink: 0 }}>
                                <Button appearance="subtle" onClick={() => handleOpenChange(false)}>Cancel</Button>
                                {isSelectedConnected ? (
                                    <Button
                                        appearance="inverse"
                                        onClick={() => {
                                            onDisconnect(selected.id);
                                            handleOpenChange(false);
                                        }}
                                    >
                                        Disconnect
                                    </Button>
                                ) : (
                                    <Button appearance="primary" onClick={() => handleConfigure(selected)} disabled={isUserView && !isSelectedDirectConnect}>
                                        {(usesDirectUserConnect(selected) || (requiresDeferredUserConnect(selected) && isSelectedConfigured)) ? "Connect" : "Configure"}
                                    </Button>
                                )}
                            </Box>
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
                                    <Text fontWeight="500" fontSize="md">Enable for my org</Text>
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
                            <ModalStepper
                                currentStep={step}
                                steps={["Permissions", "Type", "Connect", "Tools"]}
                            />

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

                            {/* Step 2: Connect */}
                            {step === 2 && selected && (
                                <Box>
                                    {selected.usesOCP ? (
                                        selected.id === "salesforce" ? <SalesforceConfig /> : <GA4Config />
                                    ) : (
                                        <>
                                            <Text fontWeight="600" mb="4">Enter connection credentials</Text>
                                            <Text fontSize="sm" color="fg.secondary" mb="20">
                                                Provide the credentials Opal will use to connect on behalf of all users.
                                            </Text>
                                            <Box display="flex" flexDirection="column" gap="16">
                                                <Box>
                                                    <Text fontSize="sm" fontWeight="500" mb="6">Instance URL</Text>
                                                    <Input
                                                        placeholder={`https://${selected.name.toLowerCase().replace(/\s+/g, "")}.example.com`}
                                                        value={instanceUrl}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstanceUrl(e.target.value)}
                                                    />
                                                    <Text fontSize="xs" color="fg.tertiary" mt="4">
                                                        The base URL of your {selected.name} instance
                                                    </Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="sm" fontWeight="500" mb="6">API Key</Text>
                                                    <Input
                                                        placeholder="sk-••••••••••••••••••••••••"
                                                        value={apiKey}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
                                                        type="password"
                                                    />
                                                    <Text fontSize="xs" color="fg.tertiary" mt="4">
                                                        Found in {selected.name} under Settings → API Keys
                                                    </Text>
                                                </Box>
                                            </Box>
                                        </>
                                    )}
                                </Box>
                            )}

                            {/* Step 3: Tools */}
                            {step === 3 && (
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
                                                    onClick={() => {
                                                        if (allFilteredToolsSelected) {
                                                            setSelectedTools(prev => prev.filter(id => !filteredTools.some(tool => tool.id === id)));
                                                            return;
                                                        }

                                                        setSelectedTools(prev => Array.from(new Set([...prev, ...filteredTools.map(t => t.id)])));
                                                    }}
                                                >
                                                    {allFilteredToolsSelected ? "Clear all" : "Select all"}
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
                                                        alignItems="center"
                                                        gap="12"
                                                        p="12"
                                                        onClick={() => toggleTool(tool.id)}
                                                        style={{
                                                            borderTop: i > 0 ? "1px solid var(--ax-colors-border-tertiary)" : "none",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <Box>
                                                            <Checkbox
                                                                checked={selectedTools.includes(tool.id)}
                                                                onCheckedChange={() => toggleTool(tool.id)}
                                                                onClick={e => e.stopPropagation()}
                                                            />
                                                        </Box>
                                                        <Box flex="1" style={{ minWidth: 0 }}>
                                                            <Box display="flex" alignItems="center" justifyContent="space-between" gap="8" mb="2">
                                                                <Text fontSize="sm" fontWeight="500">{tool.name}</Text>
                                                                <Box display="flex" alignItems="center" gap="6" style={{ flexShrink: 0 }}>
                                                                    <Box color="fg.secondary" display="flex" alignItems="center">
                                                                        {actionIcon[tool.action]}
                                                                    </Box>
                                                                    <Text fontSize="sm" color="fg.default">
                                                                        {tool.action}
                                                                    </Text>
                                                                </Box>
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
                            alignItems="center"
                            style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)", flexShrink: 0 }}
                        >
                            <Box>
                                {step > 0 ? (
                                    <Button
                                        appearance="default"
                                        onClick={() => setStep(s => (s - 1) as 0 | 1 | 2 | 3)}
                                    >
                                        Previous
                                    </Button>
                                ) : null}
                            </Box>
                            <Box display="flex" gap="12">
                                <Button appearance="subtle" onClick={() => handleOpenChange(false)}>Cancel</Button>
                                {step < 3 ? (
                                    <Button
                                        appearance="primary"
                                        onClick={() => setStep(s => (s + 1) as 0 | 1 | 2 | 3)}
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

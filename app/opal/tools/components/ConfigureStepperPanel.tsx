"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    Box,
    Button,
    Checkbox,
    Heading,
    Switch,
    Text,
    toaster,
} from "@optiaxiom/react";
import {
    IconSearch,
    IconEye,
    IconPen,
    IconTrashCan,
    IconXmark,
} from "@optiaxiom/icons";
import { Input } from "@/app/components/Input";
import { ConnectorAvatar } from "./ConnectorAvatar";
import { ModalStepper } from "./ModalStepper";
import { SalesforceConfig, GA4Config } from "./OCPConfigPanel";
import { type Connector, type ToolAction } from "../data/connectors";
import type { ConnectedConnector } from "./AddConnectorModal";
import { requiresDeferredUserConnect } from "../lib/connectorAuth";

// ── Selection card ─────────────────────────────────────────────────────────────

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

// ── Action icons ───────────────────────────────────────────────────────────────

const actionIcon: Record<ToolAction, React.ReactNode> = {
    Read: <IconEye size={14} />,
    Update: <IconPen size={14} />,
    Create: <IconPen size={14} />,
    Delete: <IconTrashCan size={14} />,
};

// ── Props ──────────────────────────────────────────────────────────────────────

interface ConfigureStepperPanelProps {
    connector: Connector;
    onClose: () => void;
    onSave: (connector: ConnectedConnector) => void;
    initialStep?: 0 | 1 | 2 | 3;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ConfigureStepperPanel({ connector, onClose, onSave, initialStep = 0 }: ConfigureStepperPanelProps) {
    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState<0 | 1 | 2 | 3>(initialStep);
    const [enabledForOrg, setEnabledForOrg] = useState(true);
    const [access, setAccess] = useState<"all" | "teams">("all");
    const [managedBy, setManagedBy] = useState<"user" | "admin">(
        connector.authType === "API Key" ? "admin" : "user"
    );
    const [instanceUrl, setInstanceUrl] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [selectedTools, setSelectedTools] = useState<string[]>(connector.tools.map(t => t.id));
    const [toolSearch, setToolSearch] = useState("");

    useEffect(() => { setMounted(true); }, []);

    const filteredTools = useMemo(() => {
        if (!toolSearch.trim()) return connector.tools;
        const q = toolSearch.toLowerCase();
        return connector.tools.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }, [connector.tools, toolSearch]);

    const allFilteredToolsSelected = filteredTools.length > 0 && filteredTools.every(t => selectedTools.includes(t.id));

    const toggleTool = (id: string) => {
        setSelectedTools(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    const handleSave = () => {
        const connectedConnector: ConnectedConnector = {
            id: connector.id,
            name: connector.name,
            category: connector.category,
            type: connector.type,
            status: requiresDeferredUserConnect(connector) ? "configured" : "connected",
            managedBy: managedBy === "user" ? "User" : "Admin",
            toolCount: selectedTools.length,
            access: access === "all" ? "All users" : "Select teams",
            addedOn: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            toolIds: selectedTools,
        };
        onSave(connectedConnector);
        toaster.create(
            requiresDeferredUserConnect(connector)
                ? `${connector.name} setup saved. Users can connect from the connector details modal.`
                : `${connector.name} successfully connected`,
            { intent: "success" }
        );
        onClose();
    };

    const panel = (
        <Box
            style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                width: 520,
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                background: "var(--ax-colors-bg-default)",
                borderLeft: "1px solid var(--ax-colors-border-tertiary)",
            }}
        >
            {/* Header */}
            <Box
                px="20"
                py="16"
                display="flex"
                flexDirection="column"
                gap="16"
                style={{ flexShrink: 0, borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}
            >
                <Box display="flex" alignItems="center" gap="12">
                    <ConnectorAvatar connector={connector} size={40} />
                    <Box flex="1" style={{ minWidth: 0 }}>
                        <Heading level="3" fontSize="lg">{connector.name}</Heading>
                        <Text fontSize="sm" color="fg.secondary">{connector.category}</Text>
                    </Box>
                    <Button
                        appearance="subtle"
                        size="sm"
                        icon={<IconXmark size={16} />}
                        aria-label="Close"
                        onClick={onClose}
                    />
                </Box>

                {/* Enable for org toggle */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    p="12"
                    rounded="md"
                    style={{
                        background: "var(--ax-colors-bg-secondary)",
                        border: "1px solid var(--ax-colors-border-tertiary)",
                    }}
                >
                    <Box>
                        <Text fontWeight="500" fontSize="sm">Enable for my org</Text>
                        <Text fontSize="xs" color="fg.secondary">
                            When off, the integration is visible but users must request access
                        </Text>
                    </Box>
                    <Switch checked={enabledForOrg} onCheckedChange={setEnabledForOrg} />
                </Box>
            </Box>

            {/* Body */}
            <Box
                px="20"
                py="20"
                display="flex"
                flexDirection="column"
                style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
            >
                <ModalStepper currentStep={step} steps={["Permissions", "Type", "Connect", "Tools"]} />

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
                {step === 2 && (
                    <Box>
                        {connector.usesOCP ? (
                            connector.id === "salesforce" ? <SalesforceConfig /> : <GA4Config />
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
                                            placeholder={`https://${connector.name.toLowerCase().replace(/\s+/g, "")}.example.com`}
                                            value={instanceUrl}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstanceUrl(e.target.value)}
                                        />
                                        <Text fontSize="xs" color="fg.tertiary" mt="4">
                                            The base URL of your {connector.name} instance
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
                                            Found in {connector.name} under Settings → API Keys
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

                        {connector.tools.length === 0 ? (
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
                                            placeholder={`Search ${connector.tools.length} tools`}
                                            value={toolSearch}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToolSearch(e.target.value)}
                                            addonBefore={<IconSearch size={14} />}
                                        />
                                    </Box>
                                    <Button
                                        appearance="subtle"
                                        onClick={() => {
                                            if (allFilteredToolsSelected) {
                                                setSelectedTools(prev => prev.filter(id => !filteredTools.some(t => t.id === id)));
                                            } else {
                                                setSelectedTools(prev => Array.from(new Set([...prev, ...filteredTools.map(t => t.id)])));
                                            }
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
                                        maxHeight: "280px",
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
                                                        <Text fontSize="sm" color="fg.default">{tool.action}</Text>
                                                    </Box>
                                                </Box>
                                                <Text fontSize="sm" color="fg.secondary">{tool.description}</Text>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>

                                <Text fontSize="sm" color="fg.tertiary" mt="8">
                                    {selectedTools.length} of {connector.tools.length} tools enabled
                                </Text>
                            </>
                        )}
                    </Box>
                )}
            </Box>

            {/* Footer */}
            <Box
                style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 20px",
                    height: 68,
                    borderTop: "1px solid var(--ax-colors-border-tertiary)",
                    background: "var(--ax-colors-bg-default)",
                }}
            >
                <Box>
                    {step > 0 && (
                        <Button appearance="default" onClick={() => setStep(s => (s - 1) as 0 | 1 | 2 | 3)}>
                            Previous
                        </Button>
                    )}
                </Box>
                <Box display="flex" gap="8">
                    <Button appearance="subtle" onClick={onClose}>Cancel</Button>
                    {step < 3 ? (
                        <Button appearance="primary" onClick={() => setStep(s => (s + 1) as 0 | 1 | 2 | 3)}>
                            Next
                        </Button>
                    ) : (
                        <Button appearance="primary" onClick={handleSave}>Save</Button>
                    )}
                </Box>
            </Box>
        </Box>
    );

    if (!mounted) return null;
    return createPortal(panel, document.body);
}

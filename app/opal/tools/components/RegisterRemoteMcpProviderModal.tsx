"use client";

import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    Input,
    Text,
    Textarea,
    toaster,
} from "@optiaxiom/react";
import { IconCheck, IconCircleInfo } from "@optimizely/axiom-icons";
import { ModalStepper } from "./ModalStepper";

export interface RemoteMcpProviderDraft {
    authUrl: string;
    description: string;
    mcpServerUrl: string;
    name: string;
    registrationEndpoint: string;
    requiredScopes: string;
    tokenUrl: string;
}

interface RegisterRemoteMcpProviderModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRegistered: (provider: RemoteMcpProviderDraft) => void;
}

type Step = 0 | 1 | 2;

const initialDraft: RemoteMcpProviderDraft = {
    authUrl: "",
    description: "",
    mcpServerUrl: "",
    name: "",
    registrationEndpoint: "",
    requiredScopes: "",
    tokenUrl: "",
};

function buildDiscoveredEndpoints(url: string) {
    try {
        const parsed = new URL(url);
        const base = parsed.origin;
        return {
            authUrl: `${base}/authorize`,
            registrationEndpoint: `${base}/register`,
            tokenUrl: `${base}/token`,
        };
    } catch {
        return null;
    }
}

export function RegisterRemoteMcpProviderModal({
    open,
    onOpenChange,
    onRegistered,
}: RegisterRemoteMcpProviderModalProps) {
    const [step, setStep] = useState<Step>(0);
    const [draft, setDraft] = useState<RemoteMcpProviderDraft>(initialDraft);
    const [hasDiscoveredEndpoints, setHasDiscoveredEndpoints] = useState(false);

    useEffect(() => {
        if (!open) {
            setStep(0);
            setDraft(initialDraft);
            setHasDiscoveredEndpoints(false);
        }
    }, [open]);

    const canContinueFromDiscovery = draft.mcpServerUrl.trim().length > 0 && hasDiscoveredEndpoints;
    const canRegister = draft.name.trim() && draft.authUrl.trim() && draft.requiredScopes.trim();

    const discoverEndpoints = () => {
        const endpoints = buildDiscoveredEndpoints(draft.mcpServerUrl.trim());
        if (!endpoints) {
            toaster.create("Enter a valid MCP server URL", { intent: "warning" });
            return;
        }

        setDraft(prev => ({
            ...prev,
            authUrl: endpoints.authUrl,
            tokenUrl: endpoints.tokenUrl,
            registrationEndpoint: endpoints.registrationEndpoint,
        }));
        setHasDiscoveredEndpoints(true);
    };

    const handleRegister = () => {
        if (!canRegister) return;
        onRegistered(draft);
        setStep(2);
        toaster.create("Provider registered successfully", { intent: "success" });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                style={{
                    width: "min(720px, 92vw)",
                    padding: 0,
                    overflow: "hidden",
                }}
            >
                <Box display="flex" flexDirection="column">
                    <Box p="24" style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}>
                        <Text fontSize="xl" fontWeight="600">Register Remote MCP Provider</Text>
                    </Box>

                    <Box px="24" pt="20">
                        <ModalStepper
                            currentStep={step}
                            steps={["Discover", "Configure", "Complete"]}
                        />
                    </Box>

                    {step === 0 && (
                        <>
                            <Box p="24" display="flex" flexDirection="column" gap="16">
                                <Text color="fg.secondary">
                                    Enter the MCP server URL. We&apos;ll attempt to auto-discover OAuth endpoints.
                                </Text>
                                <Box display="flex" flexDirection="column" gap="8">
                                    <Text fontSize="sm" fontWeight="500">MCP Server URL *</Text>
                                    <Input
                                        placeholder="https://mcp.notion.com/mcp"
                                        value={draft.mcpServerUrl}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setDraft(prev => ({ ...prev, mcpServerUrl: e.target.value }));
                                            setHasDiscoveredEndpoints(false);
                                        }}
                                    />
                                </Box>
                                <Box>
                                    <Button appearance="subtle" onClick={discoverEndpoints}>
                                        Discover OAuth Endpoints
                                    </Button>
                                </Box>
                                {hasDiscoveredEndpoints && (
                                    <Box
                                        p="16"
                                        rounded="md"
                                        display="flex"
                                        gap="12"
                                        style={{ background: "var(--ax-colors-bg-success-subtle)" }}
                                    >
                                        <Box color="fg.success" pt="2">
                                            <IconCheck size={16} />
                                        </Box>
                                        <Box>
                                            <Text fontSize="sm" fontWeight="500" color="fg.default">Found OAuth endpoints:</Text>
                                            <Text fontSize="sm" color="fg.secondary" mt="4">
                                                Auth URL: {draft.authUrl}
                                            </Text>
                                            <Text fontSize="sm" color="fg.secondary">
                                                Token URL: {draft.tokenUrl}
                                            </Text>
                                        </Box>
                                    </Box>
                                )}
                            </Box>

                            <Box
                                p="16"
                                display="flex"
                                justifyContent="flex-end"
                                gap="12"
                                style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)" }}
                            >
                                <Button appearance="subtle" onClick={() => onOpenChange(false)}>Cancel</Button>
                                <Button
                                    appearance="primary"
                                    disabled={!canContinueFromDiscovery}
                                    onClick={() => setStep(1)}
                                >
                                    Next
                                </Button>
                            </Box>
                        </>
                    )}

                    {step === 1 && (
                        <>
                            <Box p="24" display="flex" flexDirection="column" gap="16">
                                <Box display="flex" flexDirection="column" gap="8">
                                    <Text fontSize="sm" fontWeight="500">Provider Name *</Text>
                                    <Input
                                        placeholder="My MCP Provider"
                                        value={draft.name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </Box>
                                <Box display="flex" flexDirection="column" gap="8">
                                    <Text fontSize="sm" fontWeight="500">Description</Text>
                                    <Textarea
                                        placeholder="Optional description of this provider"
                                        value={draft.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(prev => ({ ...prev, description: e.target.value }))}
                                        resize="vertical"
                                    />
                                </Box>
                                <Box display="flex" flexDirection="column" gap="8">
                                    <Text fontSize="sm" fontWeight="500">OAuth Credentials</Text>
                                    <Box
                                        p="12"
                                        rounded="md"
                                        display="flex"
                                        gap="8"
                                        style={{ background: "var(--ax-colors-bg-info-subtle)" }}
                                    >
                                        <Box color="fg.secondary" pt="2">
                                            <IconCircleInfo size={16} />
                                        </Box>
                                        <Text fontSize="sm" color="fg.secondary">
                                            Credentials will be auto-generated during registration via Dynamic Client Registration (DCR).
                                        </Text>
                                    </Box>
                                </Box>
                                <Box display="flex" flexDirection="column" gap="12">
                                    <Box display="flex" flexDirection="column" gap="8">
                                        <Text fontSize="sm" fontWeight="500">Authorization URL *</Text>
                                        <Input
                                            value={draft.authUrl}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(prev => ({ ...prev, authUrl: e.target.value }))}
                                        />
                                    </Box>
                                    <Box display="flex" flexDirection="column" gap="8">
                                        <Text fontSize="sm" fontWeight="500">Token URL *</Text>
                                        <Input
                                            value={draft.tokenUrl}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(prev => ({ ...prev, tokenUrl: e.target.value }))}
                                        />
                                    </Box>
                                    <Box display="flex" flexDirection="column" gap="8">
                                        <Text fontSize="sm" fontWeight="500">Registration Endpoint</Text>
                                        <Input
                                            value={draft.registrationEndpoint}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(prev => ({ ...prev, registrationEndpoint: e.target.value }))}
                                        />
                                    </Box>
                                    <Box display="flex" flexDirection="column" gap="8">
                                        <Text fontSize="sm" fontWeight="500">Required Scopes (comma-separated) *</Text>
                                        <Input
                                            placeholder="scope1, scope2, scope3"
                                            value={draft.requiredScopes}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(prev => ({ ...prev, requiredScopes: e.target.value }))}
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            <Box
                                p="16"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)" }}
                            >
                                <Button appearance="default" onClick={() => setStep(0)}>
                                    Previous
                                </Button>
                                <Box display="flex" gap="12">
                                    <Button appearance="subtle" onClick={() => onOpenChange(false)}>Cancel</Button>
                                    <Button appearance="primary" disabled={!canRegister} onClick={handleRegister}>
                                        Register
                                    </Button>
                                </Box>
                            </Box>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <Box p="40" display="flex" flexDirection="column" alignItems="center" textAlign="center" gap="16">
                                <Box
                                    rounded="full"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    style={{
                                        width: 56,
                                        height: 56,
                                        background: "var(--ax-colors-bg-success-subtle)",
                                    }}
                                >
                                    <IconCheck size={24} style={{ color: "var(--ax-colors-fg-success)" }} />
                                </Box>
                                <Box>
                                    <Text fontSize="lg" fontWeight="600">Provider Registered Successfully</Text>
                                    <Text color="fg.secondary" mt="8">
                                        The Remote MCP provider has been registered. Scope bundles are created with pending approval status.
                                    </Text>
                                </Box>
                                <Box
                                    p="12"
                                    rounded="md"
                                    display="flex"
                                    gap="8"
                                    style={{ background: "var(--ax-colors-bg-info-subtle)", maxWidth: 560 }}
                                >
                                    <Box color="fg.secondary" pt="2">
                                        <IconCircleInfo size={16} />
                                    </Box>
                                    <Text fontSize="sm" color="fg.secondary">
                                        Next step: Find the provider in the Auth Providers table, expand it, and approve the scope bundles.
                                    </Text>
                                </Box>
                            </Box>

                            <Box
                                p="16"
                                display="flex"
                                justifyContent="flex-end"
                                style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)" }}
                            >
                                <Button appearance="subtle" onClick={() => onOpenChange(false)}>Close</Button>
                            </Box>
                        </>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}

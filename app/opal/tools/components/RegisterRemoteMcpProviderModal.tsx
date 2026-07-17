"use client";

import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    Field,
    Input,
    Text,
    Textarea,
    Tooltip,
    toaster,
} from "@optiaxiom/react";
import { IconCheck, IconCircleInfo, IconCircleQuestion } from "@optimizely/axiom-icons";
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
    initialStep?: Step;
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
        const base = `https://${parsed.host}`;
        return {
            authUrl: `${base}/authorize`,
            registrationEndpoint: `${base}/register`,
            tokenUrl: `${base}/token`,
        };
    } catch {
        return null;
    }
}

function inferProviderName(url: string) {
    try {
        const parsed = new URL(url);
        const hostParts = parsed.hostname.split(".").filter(Boolean);
        const wwwIndex = hostParts.findIndex(part => part.toLowerCase() === "www");
        const basePart =
            wwwIndex >= 0 && hostParts[wwwIndex + 1]
                ? hostParts[wwwIndex + 1]
                : hostParts.length > 2
                    ? hostParts[0]
                    : hostParts[hostParts.length - 2] ?? hostParts[0];
        const normalized = basePart
            .replace(/[-_]+/g, " ")
            .replace(/\bmcp\b/gi, "")
            .trim();

        const titled = (normalized || "Remote MCP")
            .split(/\s+/)
            .filter(Boolean)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(" ");

        return titled.includes("MCP") ? titled : `${titled} MCP`;
    } catch {
        return "";
    }
}

export function RegisterRemoteMcpProviderModal({
    open,
    onOpenChange,
    onRegistered,
    initialStep = 0,
}: RegisterRemoteMcpProviderModalProps) {
    const [step, setStep] = useState<0 | 1>(0);
    const [draft, setDraft] = useState<RemoteMcpProviderDraft>(initialDraft);
    const [hasDiscoveredEndpoints, setHasDiscoveredEndpoints] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const configureSectionRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) {
            setStep(0);
            setDraft(initialDraft);
            setHasDiscoveredEndpoints(false);
            setShowConfirmation(false);
            return;
        }

        const seededDraft =
            initialStep > 0
                ? {
                    authUrl: "https://mcp.notion.com/authorize",
                    description: "OAuth provider for Notion Remote MCP integration",
                    mcpServerUrl: "https://mcp.notion.com/mcp",
                    name: "Notion MCP",
                    registrationEndpoint: "https://mcp.notion.com/register",
                    requiredScopes: "scope1, scope2, scope3",
                    tokenUrl: "https://mcp.notion.com/token",
                }
                : initialDraft;

        setDraft(seededDraft);
        setHasDiscoveredEndpoints(initialStep > 0);
        setShowConfirmation(initialStep === 2);
        setStep(initialStep === 1 ? 1 : 0);
    }, [initialStep, open]);

    const canContinueFromDiscovery = draft.mcpServerUrl.trim().length > 0;
    const canRegister = draft.name.trim() && draft.authUrl.trim() && draft.requiredScopes.trim();

    const discoverEndpoints = () => {
        const endpoints = buildDiscoveredEndpoints(draft.mcpServerUrl.trim());
        if (!endpoints) {
            toaster.create("Enter a valid MCP server URL", { intent: "warning" });
            return false;
        }

        setDraft(prev => ({
            ...prev,
            authUrl: endpoints.authUrl,
            name: prev.name.trim() ? prev.name : inferProviderName(prev.mcpServerUrl),
            tokenUrl: endpoints.tokenUrl,
            registrationEndpoint: endpoints.registrationEndpoint,
        }));
        setHasDiscoveredEndpoints(true);
        return true;
    };

    const handleNext = () => {
        if (!canContinueFromDiscovery) return;

        const discovered = discoverEndpoints();
        if (!discovered) return;

        setStep(1);

        requestAnimationFrame(() => {
            configureSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });
    };

    const handleRegister = () => {
        if (!canRegister) return;
        onRegistered(draft);
        setShowConfirmation(true);
        toaster.create("Provider registered successfully", { intent: "success" });
    };

    const labelContent = (label: string, options?: { required?: boolean; tooltip?: string }) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span
                style={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: "var(--ax-colors-fg-secondary)",
                }}
            >
                {label}
            </span>
            {options?.required ? (
                <span aria-hidden="true" style={{ color: "var(--ax-colors-fg-danger)" }}>*</span>
            ) : null}
            {options?.tooltip ? (
                <Tooltip content={options.tooltip}>
                    <span style={{ display: "inline-flex", alignItems: "center", color: "var(--ax-colors-fg-tertiary)" }}>
                        <IconCircleQuestion size={16} />
                    </span>
                </Tooltip>
            ) : null}
        </span>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                id="remote-mcp-provider-modal"
                size="md"
                style={{ padding: 0, overflow: "hidden", maxHeight: "88vh" }}
            >
                <Box display="flex" flexDirection="column" style={{ height: "100%", minHeight: 0 }}>
                    {!showConfirmation ? (
                        <>
                            <DialogHeader>Register Remote MCP Provider</DialogHeader>
                            <DialogBody style={{ overflowY: "auto", minHeight: 0 }}>
                                <Box display="flex" flexDirection="column" gap="32">
                                    <ModalStepper
                                        currentStep={step}
                                        steps={["Discover", "Configure"]}
                                    />

                                    <Box display="flex" flexDirection="column" gap="16">
                                        <Text fontSize="md" color="fg.secondary">
                                            Enter the MCP server URL. We&apos;ll attempt to auto-discover OAuth endpoints.
                                        </Text>

                                        <Field label={labelContent("MCP Server URL", { required: true })}>
                                            <Input
                                                placeholder="https://mcp.url.com/mcp"
                                                value={draft.mcpServerUrl}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    setDraft(prev => ({ ...prev, mcpServerUrl: e.target.value }));
                                                    setHasDiscoveredEndpoints(false);
                                                    setStep(0);
                                                }}
                                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleNext();
                                                    }
                                                }}
                                            />
                                        </Field>
                                    </Box>

                                    {step === 1 ? (
                                        <Box ref={configureSectionRef} display="flex" flexDirection="column" gap="16">
                                            {hasDiscoveredEndpoints ? (
                                                <Alert intent="success">
                                                    <Box display="flex" flexDirection="column" gap="4">
                                                        <Text fontSize="sm" color="fg.default">
                                                            Found OAuth endpoints:
                                                        </Text>
                                                        <Text fontSize="sm" color="fg.secondary">
                                                            Auth URL: {draft.authUrl}
                                                        </Text>
                                                        <Text fontSize="sm" color="fg.secondary">
                                                            Token URL: {draft.tokenUrl}
                                                        </Text>
                                                    </Box>
                                                </Alert>
                                            ) : null}

                                            <Field label={labelContent("Provider Name", { required: true })}>
                                                <Input
                                                    placeholder="My MCP Provider"
                                                    value={draft.name}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(prev => ({ ...prev, name: e.target.value }))}
                                                />
                                            </Field>

                                            <Field label={labelContent("Description")}>
                                                <Textarea
                                                    placeholder="Text"
                                                    value={draft.description}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(prev => ({ ...prev, description: e.target.value }))}
                                                    resize="vertical"
                                                    rows={4}
                                                />
                                            </Field>

                                            <Box display="flex" flexDirection="column" gap="16">
                                                <Text fontSize="md" fontWeight="400" color="fg.secondary">OAuth Credentials</Text>
                                                <Alert intent="neutral">
                                                    <Text fontSize="sm" color="fg.secondary">
                                                        Credentials will be auto-generated during registration via Dynamic Client Registration (DCR).
                                                    </Text>
                                                </Alert>
                                            </Box>

                                            <Field label={labelContent("Authorization URL", { required: true })}>
                                                <Input
                                                    placeholder="https://mcp.name.com/authorize"
                                                    value={draft.authUrl}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(prev => ({ ...prev, authUrl: e.target.value }))}
                                                />
                                            </Field>

                                            <Field label={labelContent("Token URL", { required: true })}>
                                                <Input
                                                    placeholder="https://mcp.name.com/token"
                                                    value={draft.tokenUrl}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(prev => ({ ...prev, tokenUrl: e.target.value }))}
                                                />
                                            </Field>

                                            <Field
                                                label={labelContent("Required Scopes", {
                                                    required: true,
                                                    tooltip: "Comma-separated scope values required by this MCP provider.",
                                                })}
                                            >
                                                <Input
                                                    placeholder="scope 1, scope 2, scope 3"
                                                    value={draft.requiredScopes}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(prev => ({ ...prev, requiredScopes: e.target.value }))}
                                                />
                                            </Field>
                                            <Text fontSize="xs" color="fg.tertiary" style={{ marginTop: -12 }}>
                                                Comma-separated
                                            </Text>

                                            <Field label={labelContent("Registration Endpoint")}>
                                                <Input
                                                    placeholder="https://mcp.name.com/register"
                                                    value={draft.registrationEndpoint}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(prev => ({ ...prev, registrationEndpoint: e.target.value }))}
                                                />
                                            </Field>
                                        </Box>
                                    ) : null}
                                </Box>
                            </DialogBody>

                            <DialogFooter>
                                <Box style={{ flex: 1 }}>
                                    {step === 1 ? (
                                        <Button appearance="default" onClick={() => setStep(0)}>
                                            Previous
                                        </Button>
                                    ) : null}
                                </Box>
                                <Box display="flex" gap="12" justifyContent="flex-end">
                                    <Button appearance="subtle" onClick={() => onOpenChange(false)}>Cancel</Button>
                                    {step === 0 ? (
                                        <Button
                                            appearance="primary"
                                            disabled={!canContinueFromDiscovery}
                                            onClick={handleNext}
                                        >
                                            Next
                                        </Button>
                                    ) : (
                                        <Button appearance="primary" disabled={!canRegister} onClick={handleRegister}>
                                            Register
                                        </Button>
                                    )}
                                </Box>
                            </DialogFooter>
                        </>
                    ) : (
                        <>
                            <DialogBody>
                                <Box py="40" display="flex" flexDirection="column" alignItems="center" textAlign="center" gap="32">
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
                                    <Box display="flex" flexDirection="column" alignItems="center" gap="8">
                                        <Text fontSize="lg" fontWeight="600">Provider Registered Successfully</Text>
                                        <Text fontSize="sm" color="fg.secondary" style={{ maxWidth: 360 }}>
                                            The Remote MCP provider has been registered. Scope bundles are created with pending approval status.
                                        </Text>
                                    </Box>
                                    <Alert intent="neutral" style={{ maxWidth: 400 }}>
                                        <Text fontSize="sm" color="fg.default">
                                            Next step: Find the provider in the Auth Providers table, expand it, and approve the scope bundles.
                                        </Text>
                                    </Alert>
                                </Box>
                            </DialogBody>

                            <DialogFooter>
                                <Box
                                    display="flex"
                                    justifyContent="flex-end"
                                    style={{ width: "100%" }}
                                >
                                    <Button appearance="subtle" onClick={() => onOpenChange(false)}>Close</Button>
                                </Box>
                            </DialogFooter>
                        </>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}

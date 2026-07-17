"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    Box,
    Button,
    Field,
    Heading,
    Input,
    Radio,
    RadioGroup,
    Separator,
    Switch,
    Text,
} from "@optiaxiom/react";
import { IconXmark } from "@optimizely/axiom-icons";
import type { Connector } from "../data/connectors";
import { ConnectorAvatar } from "./ConnectorAvatar";

export function SectionHeading({ children }: { children: string }) {
    return (
        <Text
            fontSize="md"
            fontWeight="500"
            color="fg.default"
        >
            {children}
        </Text>
    );
}

export function ToggleRow({
    label,
    description,
    checked,
    onCheckedChange,
}: {
    label: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
}) {
    return (
        <Box display="flex" alignItems="start" justifyContent="space-between" gap="16">
            <Box display="flex" flexDirection="column" gap="4" style={{ flex: 1 }}>
                <Text fontSize="sm" fontWeight="500">{label}</Text>
                {description ? <Text fontSize="sm" color="fg.secondary">{description}</Text> : null}
            </Box>
            <Switch checked={checked} onCheckedChange={onCheckedChange} style={{ flexShrink: 0 }} />
        </Box>
    );
}

export function SalesforceConfig() {
    const [instanceOAuth, setInstanceOAuth] = useState(false);
    const [instanceUrl, setInstanceUrl] = useState("");
    const [enableReading, setEnableReading] = useState(true);
    const [enableModifications, setEnableModifications] = useState(false);

    return (
        <Box display="flex" flexDirection="column" gap="24">
            <Box display="flex" flexDirection="column" gap="24">
                <SectionHeading>Authentication</SectionHeading>
                <ToggleRow
                    label="Instance level OAuth"
                    description="Use a custom Salesforce Auth Provider connection configured in Opal instead of the default authentication method."
                    checked={instanceOAuth}
                    onCheckedChange={setInstanceOAuth}
                />
                {instanceOAuth ? (
                    <Field
                        label="Salesforce Instance URL"
                        description="e.g. https://yourcompany.my.salesforce.com"
                    >
                        <Input
                            value={instanceUrl}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstanceUrl(e.target.value)}
                        />
                    </Field>
                ) : null}
            </Box>

            <Separator />

            <Box display="flex" flexDirection="column" gap="24">
                <SectionHeading>Tool Permissions</SectionHeading>
                <ToggleRow
                    label="Enable data reading"
                    description="Allow agents to list, get, and query Salesforce objects and reports."
                    checked={enableReading}
                    onCheckedChange={setEnableReading}
                />
                <ToggleRow
                    label="Enable data modifications"
                    description="Allow agents to create and update Salesforce records."
                    checked={enableModifications}
                    onCheckedChange={setEnableModifications}
                />
            </Box>
        </Box>
    );
}

type GAAuthMethod = "oauth2" | "service-account" | "adc";

export function GA4Config() {
    const [authMethod, setAuthMethod] = useState<GAAuthMethod>("oauth2");
    const [oauthClientId, setOauthClientId] = useState("");
    const [oauthClientSecret, setOauthClientSecret] = useState("");
    const [gcpProjectId, setGcpProjectId] = useState("");
    const [gaPropertyId, setGaPropertyId] = useState("");
    const [hostnameFilter, setHostnameFilter] = useState("");

    return (
        <Box display="flex" flexDirection="column" gap="24">
            <Box display="flex" flexDirection="column" gap="24">
                <SectionHeading>Authentication Method</SectionHeading>
                <Field>
                    <RadioGroup value={authMethod} onValueChange={(value) => setAuthMethod(value as GAAuthMethod)}>
                        <Box display="flex" flexDirection="column" gap="10">
                            <Radio value="oauth2">OAuth 2.0 (User Authentication)</Radio>
                            <Radio value="service-account">Service Account</Radio>
                            <Radio value="adc">Application Default Credentials</Radio>
                        </Box>
                    </RadioGroup>
                </Field>
            </Box>

            {authMethod === "oauth2" ? (
                <>
                    <Separator />
                    <Box display="flex" flexDirection="column" gap="24">
                        <SectionHeading>OAuth 2.0 Credentials</SectionHeading>
                        <Field
                            label="OAuth Client ID"
                            description="From Google Cloud Console -> APIs & Services -> Credentials"
                        >
                            <Input
                                value={oauthClientId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOauthClientId(e.target.value)}
                            />
                        </Field>
                        <Field label="OAuth Client Secret">
                            <Input
                                type="password"
                                value={oauthClientSecret}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOauthClientSecret(e.target.value)}
                            />
                        </Field>
                        <Field
                            label="Google Cloud Project ID"
                            description="The GCP project associated with your GA4 property"
                        >
                            <Input
                                value={gcpProjectId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGcpProjectId(e.target.value)}
                            />
                        </Field>
                        <Field
                            label="Google Analytics Property ID"
                            description="Numeric property ID, e.g. 123456789"
                        >
                            <Input
                                value={gaPropertyId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGaPropertyId(e.target.value)}
                            />
                        </Field>
                    </Box>
                </>
            ) : null}

            {authMethod === "service-account" ? (
                <>
                    <Separator />
                    <Box display="flex" flexDirection="column" gap="24">
                        <SectionHeading>Service Account</SectionHeading>
                        <Field label="Google Cloud Project ID">
                            <Input
                                value={gcpProjectId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGcpProjectId(e.target.value)}
                            />
                        </Field>
                        <Field
                            label="Google Analytics Property ID"
                            description="Numeric property ID, e.g. 123456789"
                        >
                            <Input
                                value={gaPropertyId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGaPropertyId(e.target.value)}
                            />
                        </Field>
                    </Box>
                </>
            ) : null}

            <Separator />

            <Box display="flex" flexDirection="column" gap="24">
                <SectionHeading>Default Filter</SectionHeading>
                <Field
                    label="Hostname Filter"
                    description="Filter reports by hostname, e.g. www.optimizely.com. Leave empty to include all hostnames."
                >
                    <Input
                        value={hostnameFilter}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHostnameFilter(e.target.value)}
                    />
                </Field>
            </Box>
        </Box>
    );
}

interface OCPConfigPanelProps {
    connector: Connector;
    isInstalled: boolean;
    onClose: () => void;
    onInstall: () => void;
    onUninstall: () => void;
}

export function OCPConfigPanel({ connector, isInstalled, onClose, onInstall, onUninstall }: OCPConfigPanelProps) {
    const [active, setActive] = useState(isInstalled);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => { setActive(isInstalled); }, [isInstalled]);

    const handleSave = () => {
        if (active && !isInstalled) onInstall();
        if (!active && isInstalled) onUninstall();
        onClose();
    };

    const panel = (
        <Box
            id="ocp-config-panel"
            style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                width: 460,
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                background: "var(--ax-colors-bg-default)",
                borderLeft: "1px solid var(--ax-colors-border-tertiary)",
                boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
            }}
        >
            {/* Header — fixed height, never scrolls */}
            <Box
                display="flex"
                alignItems="center"
                gap="12"
                px="20"
                py="16"
                style={{ flexShrink: 0, borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}
            >
                <ConnectorAvatar connector={connector} size={40} />
                <Box display="flex" flexDirection="column" gap="4" style={{ flex: 1, minWidth: 0 }}>
                    <Heading level="3" fontSize="lg">{connector.name}</Heading>
                    <Text fontSize="sm" color="fg.secondary">{connector.category}</Text>
                </Box>
                <Button
                    appearance="subtle"
                    size="sm"
                    icon={<IconXmark size={16} />}
                    aria-label={`Close ${connector.name}`}
                    onClick={onClose}
                />
            </Box>

            {/* Body — flex: 1 + minHeight: 0 + overflowY: auto = reliable scroll */}
            <Box
                px="20"
                py="20"
                display="flex"
                flexDirection="column"
                gap="24"
                style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
            >
                {/* Activate toggle */}
                <Box
                    p="16"
                    rounded="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    gap="16"
                    bg="bg.secondary"
                >
                    <Box display="flex" flexDirection="column" gap="4">
                        <Text fontSize="md" fontWeight="500">Activate connector</Text>
                        <Text fontSize="sm" color="fg.secondary">
                            Make this connector available to your agents.
                        </Text>
                    </Box>
                    <Switch checked={active} onCheckedChange={setActive} />
                </Box>

                {connector.id === "salesforce" ? <SalesforceConfig /> : <GA4Config />}
            </Box>

            {/* Footer — fixed height, never scrolls */}
            <Box
                style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 8,
                    padding: "0 20px",
                    height: 68,
                    borderTop: "1px solid var(--ax-colors-border-tertiary)",
                    background: "var(--ax-colors-bg-default)",
                }}
            >
                <Button appearance="subtle" onClick={onClose}>Cancel</Button>
                <Button appearance="primary" onClick={handleSave}>Save Settings</Button>
            </Box>
        </Box>
    );

    // Portal to document.body so position:fixed escapes the template's
    // transform:translateX() stacking context
    if (!mounted) return null;
    return createPortal(panel, document.body);
}

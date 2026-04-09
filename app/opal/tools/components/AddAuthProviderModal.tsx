"use client";

import { useEffect, useMemo, useState } from "react";
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

export interface AuthProviderDraft {
    name: string;
    providerId: string;
    description: string;
    authType: string;
    authUrl: string;
    authUrlCustomParameters: string;
    tokenUrl: string;
    revokeUrl: string;
    refreshUrl: string;
    userInfoUrl: string;
    clientId: string;
    clientSecret: string;
}

interface AddAuthProviderModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved: (draft: AuthProviderDraft) => void;
}

const initialDraft: AuthProviderDraft = {
    name: "",
    providerId: "",
    description: "",
    authType: "oauth2",
    authUrl: "",
    authUrlCustomParameters: "",
    tokenUrl: "",
    revokeUrl: "",
    refreshUrl: "",
    userInfoUrl: "",
    clientId: "",
    clientSecret: "",
};

function toProviderId(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function AddAuthProviderModal({
    open,
    onOpenChange,
    onSaved,
}: AddAuthProviderModalProps) {
    const [draft, setDraft] = useState<AuthProviderDraft>(initialDraft);
    const [providerIdTouched, setProviderIdTouched] = useState(false);

    useEffect(() => {
        if (!open) {
            setDraft(initialDraft);
            setProviderIdTouched(false);
        }
    }, [open]);

    useEffect(() => {
        if (providerIdTouched) return;
        setDraft(prev => ({ ...prev, providerId: toProviderId(prev.name) }));
    }, [draft.name, providerIdTouched]);

    const canSave = useMemo(() => {
        return Boolean(
            draft.name.trim() &&
            draft.providerId.trim() &&
            draft.authType.trim() &&
            draft.authUrl.trim() &&
            draft.tokenUrl.trim() &&
            draft.clientId.trim() &&
            draft.clientSecret.trim()
        );
    }, [draft]);

    const updateField = <K extends keyof AuthProviderDraft>(key: K, value: AuthProviderDraft[K]) => {
        setDraft(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        if (!canSave) return;
        onSaved(draft);
        toaster.create("Authentication provider created", { intent: "success" });
        onOpenChange(false);
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
                <Box display="flex" flexDirection="column" style={{ maxHeight: "88vh" }}>
                    <Box p="24" style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}>
                        <Text fontSize="xl" fontWeight="600">Add Authentication Provider</Text>
                    </Box>

                    <Box
                        p="24"
                        display="flex"
                        flexDirection="column"
                        gap="16"
                        style={{ overflowY: "auto", flex: 1 }}
                    >
                        <Box display="flex" flexDirection="column" gap="8">
                            <Text fontSize="sm" fontWeight="500">Provider Name</Text>
                            <Input
                                placeholder="e.g., Google, Microsoft, GitHub"
                                value={draft.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("name", e.target.value)}
                            />
                        </Box>

                        <Box display="flex" flexDirection="column" gap="8">
                            <Text fontSize="sm" fontWeight="500">Provider ID</Text>
                            <Input
                                placeholder="e.g., google, microsoft, github"
                                value={draft.providerId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setProviderIdTouched(true);
                                    updateField("providerId", e.target.value);
                                }}
                            />
                            <Text fontSize="xs" color="fg.tertiary">
                                Used in URLs and code. Auto-generated from name.
                            </Text>
                        </Box>

                        <Box display="flex" flexDirection="column" gap="8">
                            <Text fontSize="sm" fontWeight="500">Description</Text>
                            <Input
                                placeholder="OAuth provider for Google services"
                                value={draft.description}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("description", e.target.value)}
                            />
                        </Box>

                        <Box display="flex" flexDirection="column" gap="8">
                            <Text fontSize="sm" fontWeight="500">Auth Type</Text>
                            <Input
                                value={draft.authType}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("authType", e.target.value)}
                            />
                        </Box>

                        <Box display="flex" flexDirection="column" gap="8">
                            <Text fontSize="sm" fontWeight="500">Authorization URL</Text>
                            <Input
                                placeholder="https://accounts.google.com/o/oauth2/v2/auth"
                                value={draft.authUrl}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("authUrl", e.target.value)}
                            />
                        </Box>

                        <Box display="flex" flexDirection="column" gap="6">
                            <Text fontSize="sm" fontWeight="500">Authorization URL Custom Parameters (Optional)</Text>
                            <Text fontSize="xs" color="fg.tertiary">
                                Additional query parameters to include in the authorization URL.
                            </Text>
                            <Textarea
                                placeholder="e.g., access_type=offline"
                                value={draft.authUrlCustomParameters}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("authUrlCustomParameters", e.target.value)}
                                resize="vertical"
                                rows={3}
                            />
                        </Box>

                        <Box display="flex" flexDirection="column" gap="8">
                            <Text fontSize="sm" fontWeight="500">Token URL</Text>
                            <Input
                                placeholder="https://oauth2.googleapis.com/token"
                                value={draft.tokenUrl}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("tokenUrl", e.target.value)}
                            />
                        </Box>

                        <Box display="flex" flexDirection="column" gap="8">
                            <Text fontSize="sm" fontWeight="500">Revoke URL (Optional)</Text>
                            <Input
                                placeholder="https://oauth2.googleapis.com/revoke"
                                value={draft.revokeUrl}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("revokeUrl", e.target.value)}
                            />
                        </Box>

                        <Box display="flex" flexDirection="column" gap="8">
                            <Text fontSize="sm" fontWeight="500">Refresh URL (Optional)</Text>
                            <Input
                                placeholder="https://oauth2.googleapis.com/token"
                                value={draft.refreshUrl}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("refreshUrl", e.target.value)}
                            />
                        </Box>

                        <Box display="flex" flexDirection="column" gap="8">
                            <Text fontSize="sm" fontWeight="500">UserInfo URL (Optional)</Text>
                            <Input
                                placeholder="https://openidconnect.googleapis.com/v1/userinfo"
                                value={draft.userInfoUrl}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("userInfoUrl", e.target.value)}
                            />
                            <Text fontSize="xs" color="fg.tertiary">
                                OIDC UserInfo endpoint for token validation when expiry is unknown.
                            </Text>
                        </Box>

                        <Box display="flex" flexDirection="column" gap="8">
                            <Text fontSize="sm" fontWeight="500">Client ID</Text>
                            <Input
                                placeholder="Enter OAuth client ID"
                                value={draft.clientId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("clientId", e.target.value)}
                            />
                        </Box>

                        <Box display="flex" flexDirection="column" gap="8">
                            <Text fontSize="sm" fontWeight="500">Client Secret</Text>
                            <Input
                                placeholder="Enter OAuth client secret"
                                value={draft.clientSecret}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("clientSecret", e.target.value)}
                            />
                        </Box>
                    </Box>

                    <Box
                        p="16"
                        display="flex"
                        justifyContent="flex-end"
                        gap="12"
                        style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)" }}
                    >
                        <Button appearance="subtle" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button appearance="primary" disabled={!canSave} onClick={handleSave}>
                            Save Provider
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

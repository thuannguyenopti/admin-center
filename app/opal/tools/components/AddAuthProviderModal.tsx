"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogForm,
    DialogHeader,
    Field,
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

    const labelContent = (label: string, required = false) => (
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
            {required ? (
                <span aria-hidden="true" style={{ color: "var(--ax-colors-fg-danger)" }}>*</span>
            ) : null}
        </span>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                size="md"
                style={{
                    padding: 0,
                    overflow: "hidden",
                    maxHeight: "88vh",
                }}
            >
                <Box display="flex" flexDirection="column" style={{ height: "100%", minHeight: 0 }}>
                    <DialogHeader>Add Authentication Provider</DialogHeader>
                    <DialogForm
                        style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
                        onSubmit={(event) => {
                            event.preventDefault();
                            handleSave();
                        }}
                    >
                        <DialogBody style={{ overflowY: "auto", minHeight: 0 }}>
                            <Box
                                display="flex"
                                flexDirection="column"
                                gap="16"
                                style={{ flex: 1, minHeight: 0 }}
                            >
                                <Field label={labelContent("Provider Name", true)}>
                                    <Input
                                        placeholder="e.g., Google, Microsoft, GitHub"
                                        value={draft.name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("name", e.target.value)}
                                    />
                                </Field>

                                <Field label={labelContent("Provider ID", true)}>
                                    <Input
                                        placeholder="e.g., google, microsoft, github"
                                        value={draft.providerId}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setProviderIdTouched(true);
                                            updateField("providerId", e.target.value);
                                        }}
                                    />
                                </Field>
                                <Text fontSize="xs" color="fg.tertiary" style={{ marginTop: -12 }}>
                                    Used in URLs and code. Auto-generated from name.
                                </Text>

                                <Field label={labelContent("Description")}>
                                    <Textarea
                                        placeholder="OAuth provider for Google services"
                                        value={draft.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("description", e.target.value)}
                                        resize="vertical"
                                        rows={3}
                                    />
                                </Field>

                                <Field label={labelContent("Auth Type", true)}>
                                    <Input
                                        value={draft.authType}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("authType", e.target.value)}
                                    />
                                </Field>

                                <Field label={labelContent("Authorization URL", true)}>
                                    <Input
                                        placeholder="https://accounts.google.com/o/oauth2/v2/auth"
                                        value={draft.authUrl}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("authUrl", e.target.value)}
                                    />
                                </Field>

                                <Field label={labelContent("Authorization URL Custom Parameters")}>
                                    <Textarea
                                        placeholder="e.g., access_type=offline"
                                        value={draft.authUrlCustomParameters}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("authUrlCustomParameters", e.target.value)}
                                        resize="vertical"
                                        rows={3}
                                    />
                                </Field>
                                <Text fontSize="xs" color="fg.tertiary" style={{ marginTop: -12 }}>
                                    Additional query parameters to include in the authorization URL.
                                </Text>

                                <Field label={labelContent("Token URL", true)}>
                                    <Input
                                        placeholder="https://oauth2.googleapis.com/token"
                                        value={draft.tokenUrl}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("tokenUrl", e.target.value)}
                                    />
                                </Field>

                                <Field label={labelContent("Revoke URL")}>
                                    <Input
                                        placeholder="https://oauth2.googleapis.com/revoke"
                                        value={draft.revokeUrl}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("revokeUrl", e.target.value)}
                                    />
                                </Field>

                                <Field label={labelContent("Refresh URL")}>
                                    <Input
                                        placeholder="https://oauth2.googleapis.com/token"
                                        value={draft.refreshUrl}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("refreshUrl", e.target.value)}
                                    />
                                </Field>

                                <Field label={labelContent("UserInfo URL")}>
                                    <Input
                                        placeholder="https://openidconnect.googleapis.com/v1/userinfo"
                                        value={draft.userInfoUrl}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("userInfoUrl", e.target.value)}
                                    />
                                </Field>
                                <Text fontSize="xs" color="fg.tertiary" style={{ marginTop: -12 }}>
                                    OIDC UserInfo endpoint for token validation when expiry is unknown.
                                </Text>

                                <Field label={labelContent("Client ID", true)}>
                                    <Input
                                        placeholder="Enter OAuth client ID"
                                        value={draft.clientId}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("clientId", e.target.value)}
                                    />
                                </Field>

                                <Field label={labelContent("Client Secret", true)}>
                                    <Input
                                        placeholder="Enter OAuth client secret"
                                        value={draft.clientSecret}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("clientSecret", e.target.value)}
                                    />
                                </Field>
                            </Box>
                        </DialogBody>

                        <DialogFooter>
                            <Button appearance="subtle" onClick={() => onOpenChange(false)} type="button">Cancel</Button>
                            <Button appearance="primary" disabled={!canSave} type="submit">
                                Save Provider
                            </Button>
                        </DialogFooter>
                    </DialogForm>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

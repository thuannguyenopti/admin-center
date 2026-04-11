"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    Switch,
    Text,
} from "@optiaxiom/react";
import { ConnectorAvatar } from "./ConnectorAvatar";
import { SalesforceConfig, GA4Config } from "./OCPConfigPanel";
import type { Connector } from "../data/connectors";

interface OCPConfigModalProps {
    connector: Connector;
    isInstalled: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInstall: () => void;
    onUninstall: () => void;
}

export function OCPConfigModal({
    connector,
    isInstalled,
    open,
    onOpenChange,
    onInstall,
    onUninstall,
}: OCPConfigModalProps) {
    const [active, setActive] = useState(isInstalled);

    useEffect(() => { setActive(isInstalled); }, [isInstalled]);

    const handleSave = () => {
        if (active && !isInstalled) onInstall();
        if (!active && isInstalled) onUninstall();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                style={{
                    width: "min(760px, 92vw)",
                    height: "74vh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    padding: 0,
                }}
            >
                {/* Header */}
                <Box
                    display="flex"
                    alignItems="center"
                    gap="12"
                    px="24"
                    py="20"
                    style={{ flexShrink: 0, borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}
                >
                    <ConnectorAvatar connector={connector} size={36} />
                    <Box flex="1">
                        <Text fontWeight="700" fontSize="lg">{connector.name}</Text>
                        <Text fontSize="sm" color="fg.secondary">{connector.category}</Text>
                    </Box>
                </Box>

                {/* Body */}
                <Box
                    px="24"
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

                {/* Footer */}
                <Box
                    px="24"
                    py="16"
                    display="flex"
                    justifyContent="flex-end"
                    gap="8"
                    style={{ flexShrink: 0, borderTop: "1px solid var(--ax-colors-border-tertiary)" }}
                >
                    <Button appearance="subtle" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button appearance="primary" onClick={handleSave}>Save Settings</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

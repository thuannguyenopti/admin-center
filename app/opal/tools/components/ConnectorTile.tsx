"use client";

import { Box, Text, Button } from "@optiaxiom/react";
import type { Connector } from "../data/connectors";
import { ConnectorAvatar } from "./ConnectorAvatar";
import { requiresDeferredUserConnect, usesDirectUserConnect } from "../lib/connectorAuth";

interface ConnectorTileProps {
    connector: Connector;
    isConnected?: boolean;
    isConfigured?: boolean;
    onDetails: (connector: Connector) => void;
    onConfigure: (connector: Connector) => void;
}

export function ConnectorTile({ connector, isConnected = false, isConfigured = false, onDetails, onConfigure }: ConnectorTileProps) {
    const showsConnectAction = usesDirectUserConnect(connector) || (requiresDeferredUserConnect(connector) && isConfigured);

    return (
        <Box
            border="1"
            borderColor="border.tertiary"
            rounded="md"
            pt="16"
            px="16"
            pb={isConnected ? "8" : "16"}
            display="flex"
            flexDirection="column"
            gap="12"
            className="group cursor-default"
            style={{ position: "relative", background: "var(--ax-colors-bg-default)", transition: "background 0.15s", minHeight: 152, height: "100%" }}
        >
            {/* Icon + name row */}
            <Box display="flex" alignItems="center" gap="12">
                <ConnectorAvatar connector={connector} size={40} />
                <Text fontWeight="500" fontSize="sm">
                    {connector.name}
                </Text>
            </Box>

            {/* Description */}
            <Text
                fontSize="sm"
                color="fg.secondary"
                style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: "1.4",
                    minHeight: "2.8em",
                }}
            >
                {connector.description}
            </Text>

            {isConnected && (
                <Box
                    display="flex"
                    alignItems="center"
                    gap="8"
                    pt="10"
                >
                    <Box
                        rounded="full"
                        style={{
                            width: 8,
                            height: 8,
                            background: "var(--ax-colors-fg-success)",
                            flexShrink: 0,
                        }}
                    />
                    <Text fontSize="sm" fontWeight="500" color="fg.success">
                        Connected
                    </Text>
                </Box>
            )}

            {/* Hover actions */}
            <Box
                display="flex"
                gap="8"
                className="opacity-0 group-hover:opacity-100"
                style={{ transition: "opacity 0.15s" }}
            >
                <Button
                    appearance="subtle"
                    size="sm"
                    onClick={() => onDetails(connector)}
                    style={{ flex: 1 }}
                >
                    Details
                </Button>
                <Button
                    appearance="primary"
                    size="sm"
                    onClick={() => onConfigure(connector)}
                    style={{ flex: 1 }}
                >
                    {showsConnectAction ? "Connect" : "Configure"}
                </Button>
            </Box>
        </Box>
    );
}

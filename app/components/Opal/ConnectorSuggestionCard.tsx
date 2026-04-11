"use client";

import { Box, Button } from "@optiaxiom/react";
import { Text } from "../Text";
import { IconArrowUpRightFromSquare, IconGrid2Plus } from "@/app/lib/axiom-icons";
import { CONNECTORS } from "@/app/opal/tools/data/connectors";
import { ConnectorAvatar } from "@/app/opal/tools/components/ConnectorAvatar";

const ATLASSIAN_CONNECTOR = CONNECTORS.find((connector) => connector.id === "atlassian-rovo");

type ConnectorSuggestionCardProps = {
  onBrowseAll: () => void;
  onConnect: () => void;
};

export function ConnectorSuggestionCard({
  onBrowseAll,
  onConnect,
}: ConnectorSuggestionCardProps) {
  if (!ATLASSIAN_CONNECTOR) return null;

  return (
    <Box
      border="1"
      borderColor="border.secondary"
      rounded="xl"
      p="20"
      display="flex"
      flexDirection="column"
      gap="12"
      style={{
        background: "var(--ax-colors-bg-default)",
        width: "100%",
      }}
    >
      <Box display="flex" alignItems="center" gap="4">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{
            width: 24,
            height: 24,
            color: "var(--ax-colors-fg-secondary)",
            flexShrink: 0,
          }}
        >
          <IconGrid2Plus size={16} />
        </Box>
        <Text fontSize="md" fontWeight="500" color="fg.secondary">
          Connect your tools
        </Text>
      </Box>

      <Box
        borderT="1"
        borderColor="border.secondary"
        pt="12"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap="12"
      >
        <Box display="flex" alignItems="center" gap="8" flex="1">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{ width: 40, height: 40, flexShrink: 0 }}
          >
            <ConnectorAvatar connector={ATLASSIAN_CONNECTOR} size={40} />
          </Box>
          <Box display="flex" flexDirection="column" gap="4" flex="1">
            <Text fontSize="md" fontWeight="600" color="fg.default">
              Atlassian
            </Text>
            <Text fontSize="sm" color="fg.tertiary">
              Search and act across Jira issues and Confluence pages in Atlassian.
            </Text>
          </Box>
        </Box>
        <Button appearance="primary" onClick={onConnect}>
          Connect
        </Button>
      </Box>

      <Box borderT="1" borderColor="border.secondary" pt="12" display="flex" alignItems="center" gap="4">
        <Text fontSize="md" color="fg.tertiary">
          Want to connect a different tool?
        </Text>
        <button
          type="button"
          onClick={onBrowseAll}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            color: "var(--ax-colors-fg-link-default)",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontSize: "14px",
            lineHeight: "20px",
          }}
        >
          <span>Browse all</span>
          <IconArrowUpRightFromSquare size={16} />
        </button>
      </Box>
    </Box>
  );
}

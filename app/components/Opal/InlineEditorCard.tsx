"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "../Text";
import { Button } from "../Button";
import {
  IconCode,
  IconArrowsMaximize,
  IconCopy,
  IconDownload,
  IconThumbsUp,
  IconThumbsDown,
} from "@optimizely/axiom-icons";

type InlineEditorCardProps = {
  filename: string;
  description?: string;
  onOpen: () => void;
  selected?: boolean;
};

export function InlineEditorCard({ filename, description, onOpen, selected }: InlineEditorCardProps) {
  return (
    <Box display="flex" flexDirection="column" gap="8" style={{ minWidth: "66.667%", width: "fit-content", maxWidth: "100%" }}>
      {/* Artifact card */}
      <Box
        display="flex"
        alignItems="center"
        gap="12"
        px="16"
        py="12"
        rounded="xl"
        onClick={onOpen}
        style={{
          cursor: "pointer",
          border: selected
            ? "1.5px solid var(--ax-colors-border-accent)"
            : "1px solid var(--ax-colors-border-secondary)",
          background: selected
            ? "var(--ax-colors-bg-accent-subtle)"
            : "var(--ax-colors-bg-default)",
          transition: "border 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
          boxShadow: selected ? "0 0 0 3px var(--ax-colors-bg-accent-subtle)" : "none",
        }}
      >
        {/* Icon thumbnail */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="bg.accent.subtle"
          rounded="lg"
          style={{ width: 40, height: 40, flexShrink: 0 }}
        >
          <IconCode size={18} style={{ color: "var(--ax-colors-fg-accent)" }} />
        </Box>

        {/* Text */}
        <Box flex="1" display="flex" flexDirection="column" gap="2">
          <Text fontSize="sm" fontWeight="600" color="fg.default">
            {filename}
          </Text>
          {description && (
            <Text fontSize="xs" color="fg.tertiary">
              {description}
            </Text>
          )}
        </Box>

        {/* Expand button */}
        <Button
          appearance="subtle"
          size="sm"
          icon={<IconArrowsMaximize size={14} />}
          onClick={onOpen}
          aria-label="Open in editor"
        />
      </Box>

      {/* Quick actions */}
      <Box display="flex" alignItems="center" gap="4">
        {!selected && (
          <>
            <Button
              appearance="subtle"
              size="sm"
              onClick={onOpen}
              icon={<IconArrowsMaximize size={13} />}
            >
              Open in editor
            </Button>
            <Box
              style={{
                width: 1,
                height: 14,
                background: "var(--ax-colors-border-secondary)",
                margin: "0 2px",
                flexShrink: 0,
              }}
            />
          </>
        )}
        <Button appearance="subtle" size="sm" icon={<IconCopy size={13} />} aria-label="Copy" />
        <Button appearance="subtle" size="sm" icon={<IconDownload size={13} />} aria-label="Download" />
        <Box style={{ flex: 1 }} />
        <Button appearance="subtle" size="sm" icon={<IconThumbsUp size={13} />} aria-label="Thumbs up" />
        <Button appearance="subtle" size="sm" icon={<IconThumbsDown size={13} />} aria-label="Thumbs down" />
      </Box>
    </Box>
  );
}

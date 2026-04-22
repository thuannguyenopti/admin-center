"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "../Text";
import { Button } from "../Button";
import {
  IconCode,
  IconPen,
  IconArrowsMaximize,
  IconArrowsRotate,
  IconCopy,
  IconDownload,
  IconThumbsUp,
  IconThumbsDown,
} from "@optimizely/axiom-icons";

// Matches the Figma "Island - contents" radial gradient thumb
const THUMB_GRADIENT =
  "radial-gradient(ellipse at 20% 20%, rgba(245,243,255,1) 5%, rgba(229,239,255,1) 61%, rgba(221,214,254,1) 85%)";

const BORDER_T = "1px solid var(--ax-colors-border-tertiary)";

type InlineEditorCardProps = {
  filename: string;
  description?: string;
  onOpen: () => void;
  selected?: boolean;
  onRegenerate?: () => void;
};

export function InlineEditorCard({ filename, description, onOpen, selected, onRegenerate }: InlineEditorCardProps) {
  return (
    <Box display="flex" flexDirection="column" gap="8" style={{ minWidth: "66.667%", width: "fit-content", maxWidth: "100%" }}>
      {/* Artifact card — matches IslandContentTile design */}
      <Box
        display="flex"
        alignItems="center"
        gap="8"
        p="16"
        style={{
          border: selected
            ? "1.5px solid var(--ax-colors-border-accent)"
            : BORDER_T,
          borderRadius: 12,
          overflow: "hidden",
          cursor: "pointer",
          background: selected
            ? "var(--ax-colors-bg-accent-subtle)"
            : "var(--ax-colors-bg-default)",
        }}
        onClick={onOpen}
      >
        {/* Icon thumb with gradient */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            background: THUMB_GRADIENT,
            flexShrink: 0,
            color: "#080736",
          }}
        >
          <IconCode size={20} />
        </Box>

        {/* Text */}
        <Box display="flex" flexDirection="column" style={{ flex: 1, minWidth: 0 }}>
          <Text
            fontWeight="600"
            style={{
              fontSize: 14,
              lineHeight: "24px",
              letterSpacing: "-0.154px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {filename}
          </Text>
          {description && (
            <Text
              color="fg.secondary"
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                letterSpacing: "-0.21px",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
              }}
            >
              {description}
            </Text>
          )}
        </Box>

        {/* Expand button */}
        <Box style={{ display: "inline-flex", flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); onOpen(); }}>
          <Button
            appearance="subtle"
            size="sm"
            icon={<IconArrowsMaximize size={14} />}
            aria-label="Open in canvas"
          />
        </Box>
      </Box>

      {/* Consolidated quick-actions row */}
      <Box display="flex" alignItems="center" gap="4">
        <Button
          appearance="subtle"
          size="sm"
          onClick={onOpen}
          disabled={selected}
          icon={<IconPen size={13} />}
        >
          Edit in Canvas
        </Button>
        <Box style={{ width: 1, height: 14, background: "var(--ax-colors-border-secondary)", margin: "0 2px", flexShrink: 0 }} />
        <Button appearance="subtle" size="sm" icon={<IconArrowsRotate size={13} />} aria-label="Regenerate" onClick={onRegenerate} />
        <Button appearance="subtle" size="sm" icon={<IconCopy size={13} />} aria-label="Copy" />
        <Button appearance="subtle" size="sm" icon={<IconDownload size={13} />} aria-label="Download" />
        <Box style={{ flex: 1 }} />
        <Button appearance="subtle" size="sm" icon={<IconThumbsUp size={13} />} aria-label="Thumbs up" />
        <Button appearance="subtle" size="sm" icon={<IconThumbsDown size={13} />} aria-label="Thumbs down" />
      </Box>
    </Box>
  );
}

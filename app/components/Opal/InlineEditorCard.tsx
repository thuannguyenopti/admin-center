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
} from "@optiaxiom/icons";

// Unselected thumb: brand/50 lime green (Figma node 146:8608)
const THUMB_BG = "#eeffd9";
const THUMB_COLOR = "#262b37";

// Selected thumb: sage palette
const THUMB_SELECTED_BG = "#d2dec2";
const THUMB_SELECTED_COLOR = "#071a14";
const CARD_SELECTED_BG = "#eff5eb";
const CARD_SELECTED_BORDER = "1.5px solid #d2dec2";

const BORDER_DEFAULT = "1px solid var(--ax-colors-border-secondary)";

type InlineEditorCardProps = {
  filename: string;
  description?: string;
  onOpen: () => void;
  selected?: boolean;
  onRegenerate?: () => void;
};

export function InlineEditorCard({ filename, description, onOpen, selected, onRegenerate }: InlineEditorCardProps) {
  return (
    <Box display="flex" flexDirection="column" gap="8" style={{ width: "100%" }}>
      {/* Artifact card — matches IslandContentTile design */}
      <Box
        display="flex"
        alignItems="center"
        gap="8"
        p="16"
        style={{
          border: selected ? CARD_SELECTED_BORDER : BORDER_DEFAULT,
          borderRadius: 12,
          overflow: "hidden",
          cursor: "pointer",
          background: selected ? CARD_SELECTED_BG : "var(--ax-colors-bg-default)",
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
            background: selected ? THUMB_SELECTED_BG : THUMB_BG,
            flexShrink: 0,
            color: selected ? THUMB_SELECTED_COLOR : THUMB_COLOR,
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

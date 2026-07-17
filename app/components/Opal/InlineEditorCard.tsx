"use client";

import { useState } from "react";
import { Badge, Box } from "@optiaxiom/react";
import { Text } from "../Text";
import { Button } from "../Button";
import {
  IconCode,
  IconArrowUpRightFromSquare,
  IconCircleCheckSolid,
  IconArrowLeft,
  IconSparkles,
} from "@optimizely/axiom-icons";

const THUMB_GRADIENT =
  "radial-gradient(ellipse at 20% 20%, rgba(245,243,255,1) 5%, rgba(229,239,255,1) 61%, rgba(221,214,254,1) 85%)";

type InlineEditorCardProps = {
  filename: string;
  description?: string;
  badge?: string;
  onOpen: () => void;
  onApprove?: () => void;
  onAskChanges?: () => void;
  onOpenTask?: () => void;
  approved?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  vauName?: string;
  vauAvatar?: string;
};

export function InlineEditorCard({
  filename,
  description,
  badge,
  onOpen,
  onApprove,
  onAskChanges,
  onOpenTask,
  approved = false,
  selected = false,
  dimmed = false,
  vauName,
  vauAvatar,
}: InlineEditorCardProps) {
  const [hoverOpen, setHoverOpen] = useState(false);

  return (
    <Box
      display="flex"
      flexDirection="column"
      onMouseEnter={() => setHoverOpen(true)}
      onMouseLeave={() => setHoverOpen(false)}
      style={{
        width: "100%",
        border: selected
          ? "1.5px solid var(--ax-colors-border-accent)"
          : "1px solid var(--ax-colors-border-default)",
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--ax-colors-bg-default)",
        opacity: dimmed ? 0.4 : 1,
        pointerEvents: dimmed ? "none" : undefined,
      }}
    >
      {/* File header */}
      <Box display="flex" flexDirection="column" gap="8" p="16" style={{ cursor: "pointer" }} onClick={onOpen}>
        {/* VAU eyebrow */}
        {vauName && (
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap="6">
              {vauAvatar ? (
                <img src={vauAvatar} alt={vauName} width={16} height={16} style={{ borderRadius: "50%", display: "block", flexShrink: 0 }} />
              ) : null}
              <Text style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: "var(--ax-colors-fg-tertiary)", textTransform: "uppercase" }}>
                {vauName}
              </Text>
              <IconSparkles size={10} style={{ color: "var(--ax-colors-fg-accent)", flexShrink: 0 }} />
            </Box>
            {badge && (
              <Badge intent="information" variant="subtle">
                {badge}
              </Badge>
            )}
          </Box>
        )}
        <Box display="flex" alignItems="center" gap="12">
        {/* Icon thumb */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: THUMB_GRADIENT,
            flexShrink: 0,
            color: "#080736",
          }}
        >
          <IconCode size={20} />
        </Box>

        {/* Filename + badge + description */}
        <Box display="flex" flexDirection="column" gap="2" style={{ flex: 1, minWidth: 0 }}>
          <Box display="flex" alignItems="center" gap="8" style={{ flexWrap: "wrap" }}>
            <Text
              fontWeight="600"
              style={{
                fontSize: 15,
                lineHeight: "22px",
                letterSpacing: "-0.2px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {filename}
            </Text>

          </Box>
          {description && (
            <Text
              color="fg.secondary"
              style={{ fontSize: 13, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {description}
            </Text>
          )}
        </Box>

        {/* External link — "Preview" label appears on card hover */}
        <Box
          style={{ display: "inline-flex", flexShrink: 0, alignSelf: "flex-start" }}
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
        >
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              borderRadius: 6,
              padding: "4px 6px",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--ax-colors-fg-secondary)",
            }}
          >
            {hoverOpen && <span>Preview</span>}
            <IconArrowUpRightFromSquare size={14} />
          </button>
        </Box>
        </Box>
      </Box>

      {/* Approval section — only shown when onApprove is wired */}
      {onApprove && (
        <Box
          display="flex"
          flexDirection="column"
          gap="12"
          p="16"
          style={{ borderTop: "1px solid var(--ax-colors-border-default)" }}
        >
          <Box display="flex" flexDirection="column" gap="4">
            <Text fontWeight="500" style={{ fontSize: 14, color: "var(--ax-colors-fg-default)", lineHeight: 1.43 }}>
              Team approval needed
            </Text>
            <Text style={{ fontSize: 14, color: "var(--ax-colors-fg-secondary)", lineHeight: 1.5 }}>
              Review the updated Q&amp;A article. Approve to proceed with publishing, or request further changes.
            </Text>
          </Box>

          {onOpenTask && (
            <button
              onClick={onOpenTask}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--ax-colors-fg-accent)",
                width: "fit-content",
              }}
            >
              <IconArrowLeft size={12} />
              View Task
            </button>
          )}

          <Box display="flex" justifyContent="end" gap="4">
            <Button appearance="subtle" size="md" onClick={onAskChanges} disabled={approved}>Ask Changes</Button>
            <Button appearance="primary" size="md" icon={<IconCircleCheckSolid size={14} />} onClick={onApprove} disabled={approved}>
              Approve
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

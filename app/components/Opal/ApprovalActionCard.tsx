"use client";

import { Badge, Box, Button, Text } from "@optiaxiom/react";
import {
  IconCheck,
  IconCode,
  IconArrowUpRightFromSquare,
  IconSparkles,
  IconListCheck,
} from "@optimizely/axiom-icons";
import { useState } from "react";

type ApprovalState = "pending" | "approved" | "changes-requested";

type ApprovalActionCardProps = {
  authorName: string;
  authorAvatar?: string;
  isVAU?: boolean;
  badge?: string;
  fileName: string;
  fileSubtitle: string;
  onPreview?: () => void;
  onViewTask?: () => void;
  approvalTitle: string;
  approvalDescription: string;
  onApprove?: () => void;
  onRequestChanges?: () => void;
  selected?: boolean;
  /** localStorage key — persists approval state across navigation until demo reset */
  persistKey?: string;
};

export function ApprovalActionCard({
  authorName,
  authorAvatar,
  isVAU,
  badge,
  fileName,
  fileSubtitle,
  onPreview,
  onViewTask,
  approvalTitle,
  approvalDescription,
  onApprove,
  onRequestChanges,
  selected = false,
  persistKey,
}: ApprovalActionCardProps) {
  const [state, setState] = useState<ApprovalState>(() => {
    if (!persistKey) return "pending";
    try {
      const saved = localStorage.getItem(persistKey);
      if (saved === "approved" || saved === "changes-requested") return saved;
    } catch {}
    return "pending";
  });
  const [hovered, setHovered] = useState(false);

  const setPersistedState = (next: ApprovalState) => {
    setState(next);
    if (persistKey) {
      try { localStorage.setItem(persistKey, next); } catch {}
    }
  };

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApprove?.();
    setPersistedState("approved");
  };

  const handleRequestChanges = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPersistedState("changes-requested");
    onRequestChanges?.();
  };

  return (
    <Box
      rounded="lg"
      onClick={onPreview}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: selected
          ? "1.5px solid var(--ax-colors-border-accent)"
          : "1px solid var(--ax-colors-border-default)",
        outline: selected ? "3px solid color-mix(in srgb, var(--ax-colors-border-accent) 30%, transparent)" : "none",
        outlineOffset: 0,
        background: hovered ? "var(--ax-colors-bg-secondary)" : "var(--ax-colors-bg-default)",
        overflow: "hidden",
        maxWidth: 560,
        cursor: onPreview ? "pointer" : "default",
        transition: "background 0.15s ease",
      }}
    >
      {/* Author + file section */}
      <Box px="16" py="12" display="flex" flexDirection="column" gap="10">
        {/* Author row */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap="6">
            <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  width={20}
                  height={20}
                  style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "var(--ax-colors-bg-avatar-green)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "var(--ax-colors-fg-avatar-green)",
                  }}
                >
                  {authorName[0]?.toUpperCase()}
                </span>
              )}
            </span>
            <Text
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--ax-colors-fg-default)",
              }}
            >
              {authorName}
            </Text>
            {isVAU && (
              <IconSparkles size={10} style={{ color: "#7c5cff", flexShrink: 0 }} />
            )}
          </Box>
          {badge && (
            <Badge
              intent={state === "approved" ? "success" : state === "changes-requested" ? "warning" : "primary"}
              variant="subtle"
            >
              {state === "approved" ? "APPROVED" : state === "changes-requested" ? "CHANGES" : badge}
            </Badge>
          )}
        </Box>

        {/* File row */}
        <Box display="flex" alignItems="center" gap="10" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap="10" style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "color-mix(in srgb, var(--ax-colors-bg-accent) 12%, var(--ax-colors-bg-secondary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconCode size={16} style={{ color: "var(--ax-colors-fg-secondary)" }} />
            </span>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Box display="flex" alignItems="center" gap="4">
                <Text
                  fontWeight="600"
                  style={{
                    fontSize: 13,
                    lineHeight: "18px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fileName}
                </Text>
                {onPreview && (
                  <IconArrowUpRightFromSquare
                    size={11}
                    style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }}
                  />
                )}
              </Box>
              <Text
                color="fg.secondary"
                style={{
                  fontSize: 12,
                  lineHeight: "16px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {fileSubtitle}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Approval section — no divider; instruction wrapped in neutral alert block */}
      <Box
        px="16"
        pb="12"
        display="flex"
        flexDirection="column"
        gap="10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Alert block */}
        <Box
          display="flex"
          flexDirection="column"
          gap="8"
          style={{
            background: "var(--ax-colors-bg-secondary)",
            borderRadius: 8,
            padding: "10px 12px",
          }}
        >
          <Box display="flex" flexDirection="column" gap="2">
            <Text
              fontWeight="600"
              style={{ fontSize: 13, lineHeight: "18px", display: "block" }}
            >
              {approvalTitle}
            </Text>
            <Text
              color="fg.secondary"
              style={{ fontSize: 12, lineHeight: "17px", display: "block" }}
            >
              {approvalDescription}
            </Text>
          </Box>

          {onViewTask && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onViewTask(); }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--ax-colors-fg-accent)",
              }}
            >
              <IconListCheck size={13} style={{ color: "var(--ax-colors-fg-accent)" }} />
              View Task
            </button>
          )}
        </Box>

        {state === "pending" ? (
          <Box display="flex" alignItems="center" gap="8" justifyContent="flex-end">
            <Button appearance="subtle" size="sm" onClick={handleRequestChanges}>
              Ask Changes
            </Button>
            <Button
              appearance="primary"
              size="sm"
              icon={<IconCheck size={14} />}
              onClick={handleApprove}
            >
              Approve
            </Button>
          </Box>
        ) : (
          <Text
            fontSize="sm"
            fontWeight="500"
            color={state === "approved" ? "fg.success" : "fg.warning"}
            style={{ textAlign: "right" }}
          >
            {state === "approved" ? "Approved" : "Changes requested"}
          </Text>
        )}
      </Box>
    </Box>
  );
}

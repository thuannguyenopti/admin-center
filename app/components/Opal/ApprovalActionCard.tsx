"use client";

import { Box, Button, Separator } from "@optiaxiom/react";
import { Text } from "../Text";
import {
  IconCheck,
  IconCode,
  IconArrowUpRightFromSquare,
  IconSparkles,
  IconListCheck,
} from "@optiaxiom/icons";
import { useState } from "react";

type ApprovalState = "pending" | "approved" | "changes-requested";

type ApprovalActionCardProps = {
  /** Author of the artifact */
  authorName: string;
  authorAvatar?: string;
  isVAU?: boolean;
  /** Pill badge shown in header row, e.g. "UPDATED" */
  badge?: string;

  /** Artifact file row */
  fileName: string;
  fileSubtitle: string;
  /** Clicking the card body (or Preview button) opens the preview panel */
  onPreview?: () => void;

  /** Task link — opens task panel on the right */
  onViewTask?: () => void;

  /** Approval prompt section */
  approvalTitle: string;
  approvalDescription: string;

  onApprove?: () => void;
  onRequestChanges?: () => void;
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
}: ApprovalActionCardProps) {
  const [state, setState] = useState<ApprovalState>("pending");
  const [hovered, setHovered] = useState(false);

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setState("approved");
    onApprove?.();
  };

  const handleRequestChanges = (e: React.MouseEvent) => {
    e.stopPropagation();
    setState("changes-requested");
    onRequestChanges?.();
  };

  return (
    <Box
      rounded="lg"
      onClick={onPreview}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: "1px solid var(--ax-colors-border-default)",
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
              {isVAU && (
                <span
                  style={{
                    position: "absolute",
                    bottom: -1,
                    right: -1,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--ax-colors-bg-accent)",
                    border: "1.5px solid var(--ax-colors-bg-default)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconSparkles style={{ width: 6, height: 6, color: "var(--ax-colors-fg-on-accent, #202320)" }} />
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
              <IconSparkles style={{ width: 10, height: 10, color: "var(--ax-colors-fg-accent)", flexShrink: 0 }} />
            )}
          </Box>
          {badge && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: state === "approved" ? "var(--ax-colors-fg-success)" : "var(--ax-colors-fg-accent)",
                background: state === "approved"
                  ? "color-mix(in srgb, var(--ax-colors-fg-success) 12%, transparent)"
                  : "color-mix(in srgb, var(--ax-colors-bg-accent) 15%, transparent)",
                borderRadius: 999,
                padding: "2px 8px",
              }}
            >
              {state === "approved" ? "APPROVED" : state === "changes-requested" ? "CHANGES" : badge}
            </span>
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
              <IconCode style={{ width: 16, height: 16, color: "var(--ax-colors-fg-secondary)" }} />
            </span>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text
                fontWeight="600"
                style={{
                  fontSize: 13,
                  lineHeight: "18px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {fileName}
              </Text>
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
          {onPreview && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onPreview(); }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--ax-colors-fg-secondary)",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              Preview
              <IconArrowUpRightFromSquare style={{ width: 11, height: 11 }} />
            </button>
          )}
        </Box>
      </Box>

      <Separator />

      {/* Approval section */}
      <Box
        px="16"
        py="12"
        display="flex"
        flexDirection="column"
        gap="12"
        onClick={(e) => e.stopPropagation()}
      >
        <Box
          px="12"
          py="10"
          rounded="md"
          style={{ background: "var(--ax-colors-bg-secondary)" }}
        >
          <Text
            fontWeight="600"
            style={{ fontSize: 13, lineHeight: "18px", display: "block" }}
          >
            {approvalTitle}
          </Text>
          <Text
            color="fg.secondary"
            mt="4"
            style={{ fontSize: 13, lineHeight: "18px", display: "block" }}
          >
            {approvalDescription}
          </Text>
        </Box>

        <Box display="flex" alignItems="center" justifyContent="space-between">
          {/* View task link */}
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
                color: "var(--ax-colors-fg-tertiary)",
              }}
            >
              <IconListCheck style={{ width: 13, height: 13 }} />
              View task
            </button>
          )}

          {state === "pending" ? (
            <Box display="flex" alignItems="center" gap="8" style={{ marginLeft: "auto" }}>
              <Button
                appearance="subtle"
                size="sm"
                onClick={handleRequestChanges}
              >
                Ask Changes
              </Button>
              <Button
                appearance="primary"
                size="sm"
                icon={<IconCheck />}
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
              style={{ marginLeft: "auto" }}
            >
              {state === "approved" ? "Approved" : "Changes requested"}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}

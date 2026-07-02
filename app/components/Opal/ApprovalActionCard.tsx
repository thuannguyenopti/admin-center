"use client";

import { Badge, Box, Button, Separator, Tooltip } from "@optiaxiom/react";
import { Text } from "../Text";
import {
  IconCheck,
  IconCode,
  IconArrowUpRightFromSquare,
  IconListCheck,
  IconMessageLines,
  IconThumbtack,
  IconEllipsisSolid,
} from "@optiaxiom/icons";
import { useEffect, useState } from "react";

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
  /** Controlled approval state — overrides internal state when provided */
  approvalState?: ApprovalState;
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
  approvalState: controlledState,
}: ApprovalActionCardProps) {
  const [state, setState] = useState<ApprovalState>(() => {
    if (controlledState) return controlledState;
    if (!persistKey) return "pending";
    try {
      const saved = localStorage.getItem(persistKey);
      if (saved === "approved" || saved === "changes-requested") return saved;
    } catch {}
    return "pending";
  });

  useEffect(() => {
    if (controlledState) setState(controlledState);
  }, [controlledState]);
  const [hovered, setHovered] = useState(false);

  const setPersistedState = (next: ApprovalState) => {
    setState(next);
    if (persistKey) {
      try { localStorage.setItem(persistKey, next); } catch {}
    }
  };

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Call onApprove before persisting so the handler's localStorage guard
    // hasn't been set yet and can run its send logic first.
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
      style={{ position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover action bar */}
      {hovered && (
        <Box
          rounded="lg"
          style={{
            position: "absolute", top: -44, right: 0,
            display: "flex", alignItems: "center", gap: 1,
            background: "var(--ax-colors-bg-default)",
            border: "1px solid var(--ax-colors-border-secondary)",
            padding: "5px 7px", zIndex: 10,
          }}
        >
          {["👍", "❤️", "😂"].map(e => (
            <Tooltip key={e} content={e} delayDuration={300}>
              <Box rounded="sm" style={{ cursor: "pointer", fontSize: 18, padding: "2px 4px", lineHeight: 1 }}>{e}</Box>
            </Tooltip>
          ))}
          <Tooltip content="Add reaction" delayDuration={300}>
            <Box rounded="sm" style={{ cursor: "pointer", fontSize: 18, padding: "2px 4px", color: "var(--ax-colors-fg-tertiary)", lineHeight: 1 }}>😊</Box>
          </Tooltip>
          <Box style={{ width: 1, height: 20, background: "var(--ax-colors-border-secondary)", margin: "0 3px", flexShrink: 0 }} />
          <Tooltip content="Reply in thread" delayDuration={300}>
            <Button size="sm" appearance="subtle" style={{ width: 30, height: 30, padding: 0 }} icon={<IconMessageLines size={15} />} />
          </Tooltip>
          <Tooltip content="Pin message" delayDuration={300}>
            <Button size="sm" appearance="subtle" style={{ width: 30, height: 30, padding: 0 }} icon={<IconThumbtack size={15} />} />
          </Tooltip>
          <Tooltip content="More options" delayDuration={300}>
            <Button size="sm" appearance="subtle" style={{ width: 30, height: 30, padding: 0 }} icon={<IconEllipsisSolid size={15} />} />
          </Tooltip>
        </Box>
      )}
    <Box
      rounded="lg"
      onClick={onPreview}
      style={{
        border: selected
          ? "1.5px solid var(--ax-colors-border-accent)"
          : "1px solid var(--ax-colors-border-default)",
        outline: selected
          ? "3px solid color-mix(in srgb, var(--ax-colors-border-accent) 30%, transparent)"
          : "none",
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
          </Box>
          {badge && (
            <Badge
              intent={state === "approved" ? "success" : state === "changes-requested" ? "warning" : "neutral"}
              variant="subtle"
            >
              {state === "approved" ? "APPROVED" : state === "changes-requested" ? "CHANGES" : badge}
            </Badge>
          )}
        </Box>

        {/* File row */}
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
                  style={{ width: 11, height: 11, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }}
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
        <Box>
          <Text
            fontWeight="600"
            style={{ fontSize: 13, lineHeight: "18px", display: "block" }}
          >
            {approvalTitle}
          </Text>
          <Text
            color="fg.secondary"
            style={{ fontSize: 13, lineHeight: "18px", display: "block", marginTop: 4 }}
          >
            {approvalDescription}
          </Text>
        </Box>

        {onViewTask && (
          <Button
            appearance="subtle"
            size="sm"
            icon={<IconListCheck />}
            onClick={(e) => { e.stopPropagation(); onViewTask(); }}
            style={{ alignSelf: "flex-start", color: "var(--ax-colors-fg-link)" }}
          >
            View Task
          </Button>
        )}

        {state === "pending" ? (
          <Box display="flex" alignItems="center" gap="8" justifyContent="flex-end">
            <Button appearance="subtle" size="sm" onClick={handleRequestChanges}>
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
            style={{ textAlign: "right" }}
          >
            {state === "approved" ? "Approved" : "Changes requested"}
          </Text>
        )}
      </Box>
    </Box>
    </Box>
  );
}

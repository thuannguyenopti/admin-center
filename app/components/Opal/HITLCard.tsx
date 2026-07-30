"use client";

import { Box, Button, Separator } from "@optiaxiom/react";
import { Text } from "../Text";
import {
  IconCheck,
  IconArrowUpRightFromSquare,
  IconListCheck,
  IconFileLines,
} from "@optiaxiom/icons";
import { useState } from "react";

type ApprovalState = "pending" | "approved" | "changes-requested";

type HITLCardProps = {
  /** e.g. "Content Checker" */
  taskType: string;
  /** e.g. "Content Review for Blog Post" */
  fileName: string;
  /** The question prompting the human reviewer */
  question: string;
  /** Supporting notes shown below the question */
  notes?: string;
  /** Accessible label for the view link */
  viewLabel?: string;
  /** URL to open when viewing the content */
  viewHref?: string;
  /**
   * Direction 1: icon-button — view icon lives in the header, action bar stays clean
   * Direction 4: preview-tile — content tile in the body replaces the view link entirely
   */
  viewVariant?: "icon-button" | "preview-tile";
  /** When provided, shows a View Task button on the left of the action bar */
  onViewTask?: () => void;
  onApprove?: () => void;
  onRequestChanges?: () => void;
};

export function HITLCard({
  taskType,
  fileName,
  question,
  notes,
  viewLabel = "Open in Opal",
  viewHref,
  viewVariant = "icon-button",
  onViewTask,
  onApprove,
  onRequestChanges,
}: HITLCardProps) {
  const [state, setState] = useState<ApprovalState>("pending");

  return (
    <Box
      rounded="lg"
      style={{
        border: "1px solid var(--ax-colors-border-default)",
        background: "var(--ax-colors-bg-default)",
        overflow: "hidden",
        maxWidth: 520,
      }}
    >
      {/* Header: thumb + title/type + optional icon-button */}
      <Box px="16" py="12" display="flex" alignItems="center" gap="10">
        <Box
          rounded="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{
            width: 36,
            height: 36,
            background: "color-mix(in srgb, var(--ax-colors-bg-accent) 18%, var(--ax-colors-bg-default))",
            flexShrink: 0,
          }}
        >
          <IconFileLines style={{ width: 16, height: 16, color: "var(--ax-colors-fg-secondary)" }} />
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text fontWeight="600" style={{ fontSize: 14, lineHeight: "20px", display: "block" }}>
            {fileName}
          </Text>
          <Text color="fg.secondary" style={{ fontSize: 12, lineHeight: "16px", display: "block" }}>
            {taskType}
          </Text>
        </Box>
        {viewVariant === "icon-button" && viewHref && (
          <Button
            appearance="subtle"
            size="sm"
            icon={<IconArrowUpRightFromSquare size={14} />}
            onClick={() => window.open(viewHref, "_blank")}
            aria-label={viewLabel}
            style={{ flexShrink: 0 }}
          />
        )}
      </Box>

      <Separator />

      {/* Body: question + optional preview tile + notes + actions */}
      <Box px="16" py="12" display="flex" flexDirection="column" gap="12">
        <Box display="flex" flexDirection="column" gap="8">
          <Text style={{ fontSize: 14, lineHeight: "20px", display: "block" }}>
            {question}
          </Text>

          {viewVariant === "preview-tile" && viewHref && (
            <Box
              rounded="md"
              display="flex"
              alignItems="center"
              gap="10"
              px="12"
              py="10"
              onClick={() => window.open(viewHref, "_blank")}
              style={{
                border: "1px solid var(--ax-colors-border-default)",
                background: "var(--ax-colors-bg-secondary)",
                cursor: "pointer",
              }}
            >
              <IconFileLines
                style={{ width: 18, height: 18, color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }}
              />
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text
                  fontWeight="500"
                  style={{
                    fontSize: 13,
                    lineHeight: "18px",
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fileName}
                </Text>
                <Text color="fg.tertiary" style={{ fontSize: 12, lineHeight: "16px", display: "block" }}>
                  opal.optimizely.com
                </Text>
              </Box>
              <IconArrowUpRightFromSquare
                style={{ width: 12, height: 12, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }}
              />
            </Box>
          )}

          {notes && (
            <Text color="fg.secondary" style={{ fontSize: 13, lineHeight: "18px", display: "block" }}>
              {notes}
            </Text>
          )}
        </Box>

        <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
          <Box>
            {onViewTask && (
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconListCheck />}
                onClick={onViewTask}
                style={{ color: "var(--ax-colors-fg-link)" }}
              >
                View Task
              </Button>
            )}
          </Box>

          {state === "pending" ? (
            <Box display="flex" alignItems="center" gap="8">
              <Button
                appearance="subtle"
                size="sm"
                onClick={() => { setState("changes-requested"); onRequestChanges?.(); }}
              >
                Request Changes
              </Button>
              <Button
                appearance="primary"
                size="sm"
                icon={<IconCheck />}
                onClick={() => { setState("approved"); onApprove?.(); }}
              >
                Approve
              </Button>
            </Box>
          ) : (
            <Text
              fontSize="sm"
              fontWeight="500"
              color={state === "approved" ? "fg.success" : "fg.warning"}
            >
              {state === "approved" ? "Approved" : "Changes requested"}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}

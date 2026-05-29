"use client";

import { Box, Button } from "@optiaxiom/react";
import { Text } from "../Text";
import { IconCheck, IconXmark, IconArrowUpRightFromSquare } from "@/app/lib/axiom-icons";
import { useState } from "react";

type ApprovalState = "pending" | "approved" | "rejected";

type ApprovalActionCardProps = {
  title: string;
  description: string;
  thumbnail?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onOpenTask?: () => void;
};

export function ApprovalActionCard({
  title,
  description,
  thumbnail,
  onApprove,
  onReject,
  onOpenTask,
}: ApprovalActionCardProps) {
  const [state, setState] = useState<ApprovalState>("pending");

  const handleApprove = () => {
    setState("approved");
    onApprove?.();
  };

  const handleReject = () => {
    setState("rejected");
    onReject?.();
  };

  return (
    <Box
      display="flex"
      alignItems="stretch"
      rounded="lg"
      border="1"
      borderColor="border.default"
      bg="bg.default"
      style={{
        minWidth: "66.667%",
        width: "fit-content",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {/* Thumbnail / preview area */}
      <Box
        bg="bg.secondary"
        display="flex"
        flexDirection="column"
        style={{ width: 120, flexShrink: 0, position: "relative" }}
      >
        {thumbnail ? (
          <img src={thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            gap="4"
            p="12"
            style={{ height: "100%" }}
          >
            {/* Mock doc preview lines */}
            <Box style={{ height: 6, borderRadius: 3, background: "var(--ax-colors-bg-tertiary)", width: "80%" }} />
            <Box style={{ height: 6, borderRadius: 3, background: "var(--ax-colors-bg-tertiary)", width: "60%" }} />
            <Box style={{ height: 6, borderRadius: 3, background: "var(--ax-colors-bg-tertiary)", width: "70%" }} />
            <Box style={{ height: 6, borderRadius: 3, background: "var(--ax-colors-bg-tertiary)", width: "50%" }} />
            <Box style={{ height: 6, borderRadius: 3, background: "var(--ax-colors-bg-tertiary)", width: "65%" }} />
            {/* Label */}
            <Box mt="auto">
              <Text fontSize="xs" color="fg.tertiary" fontWeight="500">Vari.</Text>
            </Box>
          </Box>
        )}
      </Box>

      {/* Content + actions */}
      <Box display="flex" flexDirection="column" justifyContent="space-between" p="16" style={{ flex: 1, minWidth: 0 }}>
        <Box display="flex" flexDirection="column" gap="4">
          <Text fontWeight="600" style={{ fontSize: 14, lineHeight: "20px" }}>
            {title}
          </Text>
          <Text
            color="fg.secondary"
            style={{
              fontSize: 13,
              lineHeight: "18px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
            }}
          >
            {description}
          </Text>
        </Box>

        {state === "pending" ? (
          <Box display="flex" alignItems="center" justifyContent="space-between" gap="8" mt="12">
            {onOpenTask ? (
              <button
                type="button"
                onClick={onOpenTask}
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
                View Task
                <IconArrowUpRightFromSquare size={12} />
              </button>
            ) : (
              <Box />
            )}
            <Box display="flex" alignItems="center" gap="8">
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconXmark size={14} />}
                onClick={handleReject}
                aria-label="Reject"
              />
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconCheck size={14} />}
                onClick={handleApprove}
                aria-label="Approve"
                style={{ color: "var(--ax-colors-fg-success)" }}
              />
            </Box>
          </Box>
        ) : (
          <Box mt="12">
            <Text
              fontSize="sm"
              fontWeight="500"
              color={state === "approved" ? "fg.success" : "fg.error"}
            >
              {state === "approved" ? "Approved" : "Rejected"}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

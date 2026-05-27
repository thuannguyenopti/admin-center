"use client";

import { Box, Text } from "@optiaxiom/react";
import { IconComment } from "@optiaxiom/icons";
import { UserAvatar } from "./UserAvatar";

function formatTimeAgo(iso?: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

type Props = {
  replyCount: number;
  participants: string[];
  profiles: Record<string, string>;
  lastReplyAt?: string;
  onClick: () => void;
};

export function ThreadReplyPill({
  replyCount,
  participants,
  profiles,
  lastReplyAt,
  onClick,
}: Props) {
  const shownParticipants = participants.slice(0, 3);
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap="8"
      px="8"
      py="4"
      onClick={onClick}
      style={{
        cursor: "pointer",
        borderRadius: 6,
        border: "1px solid transparent",
        transition: "background 0.15s ease, border-color 0.15s ease",
        marginLeft: 8,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--ax-colors-bg-secondary)";
        e.currentTarget.style.borderColor = "var(--ax-colors-border-secondary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "transparent";
      }}
    >
      <Box display="flex" alignItems="center" gap="4">
        {shownParticipants.length > 0 ? (
          shownParticipants.map((uid, i) => (
            <Box
              key={uid}
              style={{
                marginLeft: i === 0 ? 0 : -8,
                border: "2px solid var(--ax-colors-bg-default)",
                borderRadius: "50%",
                lineHeight: 0,
              }}
            >
              <UserAvatar userId={uid} name={profiles[uid] ?? uid} size={18} />
            </Box>
          ))
        ) : (
          <IconComment size={14} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
        )}
      </Box>
      <Text fontSize="sm" fontWeight="500" color="fg.accent">
        {replyCount} {replyCount === 1 ? "reply" : "replies"}
      </Text>
      {lastReplyAt && (
        <Text fontSize="sm" color="fg.tertiary">
          Last reply {formatTimeAgo(lastReplyAt)}
        </Text>
      )}
    </Box>
  );
}

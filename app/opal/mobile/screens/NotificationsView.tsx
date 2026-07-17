"use client";

import { useState } from "react";
import { Box, Text, Badge, Button } from "@optiaxiom/react";
import {
  IconTriangleExclamation,
  IconCircleInfo,
  IconCircleCheck,
  IconXmark,
  IconCheck,
} from "@optiaxiom/icons";
import { HITL_NOTIFICATIONS, type HITLNotification } from "../data";

// Maps directly from the web NotificationCenter's CategoryBadge + getStatusIcon pattern
const TYPE_CONFIG: Record<
  HITLNotification["type"],
  { icon: React.ReactNode; badgeIntent: "warning" | "information" | "success"; label: string }
> = {
  approval: {
    icon: <IconTriangleExclamation style={{ color: "var(--ax-colors-fg-warning)", width: 16, height: 16, flexShrink: 0 }} />,
    badgeIntent: "warning",
    label: "Needs approval",
  },
  question: {
    icon: <IconCircleInfo style={{ color: "var(--ax-colors-fg-information)", width: 16, height: 16, flexShrink: 0 }} />,
    badgeIntent: "information",
    label: "Needs your input",
  },
  review: {
    icon: <IconCircleInfo style={{ color: "var(--ax-colors-fg-information)", width: 16, height: 16, flexShrink: 0 }} />,
    badgeIntent: "information",
    label: "Ready to review",
  },
  complete: {
    icon: <IconCircleCheck style={{ color: "var(--ax-colors-fg-success)", width: 16, height: 16, flexShrink: 0 }} />,
    badgeIntent: "success",
    label: "Completed",
  },
};

// Only approval and review have a clear primary action
const HAS_PRIMARY_ACTION: Record<HITLNotification["type"], boolean> = {
  approval: true,
  question: false,
  review: true,
  complete: false,
};

export function NotificationsView() {
  const [notifications, setNotifications] = useState(HITL_NOTIFICATIONS);

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ height: "100%", background: "var(--ax-colors-bg-default)" }}
    >
      {/* ── Header ── */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px="16"
        style={{
          height: 56,
          flexShrink: 0,
          borderBottom: "1px solid var(--ax-colors-border-secondary)",
        }}
      >
        <Box display="flex" alignItems="center" gap="8">
          <Text fontWeight="700" color="fg.default" style={{ fontSize: 20 }}>
            Activity
          </Text>
          {unreadCount > 0 && (
            <Badge intent="information">{unreadCount} unread</Badge>
          )}
        </Box>
        <Button
          appearance="subtle"
          size="sm"
          icon={<IconCheck style={{ width: 14, height: 14 }} />}
          onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
        >
          Mark all read
        </Button>
      </Box>

      {/* ── Card grid (matches web card view layout) ── */}
      <Box
        style={{ flex: 1, overflowY: "auto", padding: "12px 12px 24px" }}
        display="flex"
        flexDirection="column"
        gap="8"
      >
        {notifications.map((notif, i) => (
          <HITLCard
            key={notif.id}
            notif={notif}
            delay={i * 40}
            onRead={() => markRead(notif.id)}
          />
        ))}
      </Box>
    </Box>
  );
}

function HITLCard({
  notif,
  delay,
  onRead,
}: {
  notif: HITLNotification;
  delay: number;
  onRead: () => void;
}) {
  const [actioned, setActioned] = useState<string | null>(null);

  const handleAction = (label: string) => {
    setActioned(label);
    onRead();
  };

  const cfg = TYPE_CONFIG[notif.type];
  const isComplete = notif.type === "complete";
  const hasPrimary = HAS_PRIMARY_ACTION[notif.type];

  return (
    // Matches web card: border="1", borderColor="border.tertiary", rounded="lg", p="16"
    // bg.secondary for unread, bg.default for read — exactly like web card view
    <Box
      className="mobile-hitl-in"
      display="flex"
      gap="12"
      p="16"
      border="1"
      borderColor="border.tertiary"
      rounded="lg"
      style={{
        animationDelay: `${delay}ms`,
        background: notif.read ? "var(--ax-colors-bg-default)" : "var(--ax-colors-bg-secondary)",
        position: "relative",
        cursor: "pointer",
        transition: "box-shadow 0.15s ease",
      }}
    >
      {/* Content column — flex: 1, same as web */}
      <Box display="flex" flexDirection="column" gap="12" style={{ flex: 1, minWidth: 0 }}>

        {/* Top: icon + badge (web: getStatusIcon + CategoryBadge) */}
        <Box display="flex" flexDirection="column" gap="4">
          <Box display="flex" gap="8" alignItems="center">
            {cfg.icon}
            <Badge intent={cfg.badgeIntent}>{cfg.label}</Badge>
          </Box>

          {/* Title — bold if unread, line-clamp-1, exactly like web */}
          <Text
            fontWeight={notif.read ? "500" : "600"}
            color="fg.default"
            style={{
              fontSize: 14,
              lineHeight: 1.35,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {notif.title}
          </Text>
        </Box>

        {/* Body — 2-line description (web: line-clamp-2, minHeight 40px) */}
        <Text
          color="fg.secondary"
          style={{
            fontSize: 13,
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 38,
          }}
        >
          {notif.description}
        </Text>

        {/* Artifact line — compact text, no bordered box */}
        {notif.artifact && (
          <Box display="flex" alignItems="center" gap="6">
            <Text color="fg.tertiary" style={{ fontSize: 12, flexShrink: 0 }}>
              {notif.artifact.type}
            </Text>
            <Text color="fg.tertiary" style={{ fontSize: 12 }}>·</Text>
            <Text
              color="fg.secondary"
              style={{
                fontSize: 12,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {notif.artifact.title}
            </Text>
          </Box>
        )}

        {/* Bottom: timestamp left + actions right (web pattern) */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          style={{ marginTop: "auto", gap: 8 }}
        >
          <Text color="fg.tertiary" style={{ fontSize: 12, flexShrink: 0 }}>
            {notif.timestamp}
          </Text>

          {/* Actions — compact, follows web action button row */}
          {notif.actions && !actioned && (
            <Box display="flex" gap="4" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
              {notif.actions.map((action, i) => {
                const isDanger = action.intent === "danger";
                const isPrimary = hasPrimary && i === 0 && !isDanger;
                return (
                  <Button
                    key={action.label}
                    appearance={isPrimary ? "primary" : isDanger ? "subtle" : "default"}
                    size="sm"
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleAction(action.label); }}
                    style={{
                      fontSize: 12,
                      height: 28,
                      padding: "0 10px",
                      borderRadius: 6,
                      color: isDanger ? "var(--ax-colors-fg-error)" : undefined,
                    }}
                  >
                    {action.label}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* Post-action confirmation */}
          {actioned && (
            <Box display="flex" alignItems="center" gap="4">
              <IconCheck style={{ width: 13, height: 13, color: "var(--ax-colors-fg-success)" }} />
              <Text color="fg.tertiary" style={{ fontSize: 12 }}>{actioned}</Text>
            </Box>
          )}

          {/* Complete-type: subtle view action */}
          {isComplete && notif.actions && !actioned && (
            <Box display="flex" gap="4">
              {notif.actions.map((action) => (
                <Button
                  key={action.label}
                  appearance="subtle"
                  size="sm"
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleAction(action.label); }}
                  style={{ fontSize: 12, height: 28, padding: "0 10px", borderRadius: 6 }}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Red dot column — top-right, only when unread. Exactly matches web card view. */}
      <Box
        display="flex"
        alignItems="start"
        style={{ paddingTop: 6, width: 16, minWidth: 16, flexShrink: 0, justifyContent: "center" }}
      >
        {!notif.read && (
          <Box
            rounded="full"
            style={{ width: 8, height: 8, backgroundColor: "var(--ax-colors-fg-error)", flexShrink: 0 }}
          />
        )}
      </Box>
    </Box>
  );
}

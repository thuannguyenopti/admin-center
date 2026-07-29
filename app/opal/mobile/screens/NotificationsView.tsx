"use client";

import { useState, useRef } from "react";
import { Box, Text, Button, Heading, Avatar } from "@optiaxiom/react";
import {
  IconTriangleExclamation,
  IconCircleInfo,
  IconCircleCheck,
  IconXmark,
  IconCheck,
  IconAt,
  IconFaceSmile,
  IconBell,
  IconGlassesRound,
  IconComment,
  IconComments,
} from "@optiaxiom/icons";

type ActivityFilter = "unread" | "mentions" | "reactions" | "needs" | "new_message" | "new_reply";

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <line x1="3" y1="5"  x2="17" y2="5"  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="3" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
import { HITL_NOTIFICATIONS, type HITLNotification } from "../data";
import { mobileType } from "../typography";

// Maps directly from the web NotificationCenter's CategoryBadge + getStatusIcon pattern
const TYPE_CONFIG: Record<
  HITLNotification["type"],
  { icon: React.ReactNode; badgeIntent: "warning" | "information" | "success"; label: string }
> = {
  approval: {
    icon: <IconTriangleExclamation style={{ color: "var(--ax-colors-fg-warning)", width: 20, height: 20, flexShrink: 0 }} />,
    badgeIntent: "warning",
    label: "Needs approval",
  },
  question: {
    icon: <IconCircleInfo style={{ color: "var(--ax-colors-fg-information)", width: 20, height: 20, flexShrink: 0 }} />,
    badgeIntent: "information",
    label: "Needs your input",
  },
  review: {
    icon: <IconCircleInfo style={{ color: "var(--ax-colors-fg-information)", width: 20, height: 20, flexShrink: 0 }} />,
    badgeIntent: "information",
    label: "Ready to review",
  },
  complete: {
    icon: <IconCircleCheck style={{ color: "var(--ax-colors-fg-success)", width: 20, height: 20, flexShrink: 0 }} />,
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

const FILTER_CHIPS: { key: ActivityFilter; label: string; icon: React.ReactNode }[] = [
  { key: "unread",       label: "Unread",       icon: <IconGlassesRound style={{ width: 16, height: 16 }} /> },
  { key: "mentions",     label: "Mentions",     icon: <IconAt style={{ width: 16, height: 16 }} /> },
  { key: "reactions",    label: "Reactions",    icon: <IconFaceSmile style={{ width: 16, height: 16 }} /> },
  { key: "needs",        label: "Needs Action", icon: <IconBell style={{ width: 16, height: 16 }} /> },
  { key: "new_message",  label: "New Message",  icon: <IconComment style={{ width: 16, height: 16 }} /> },
  { key: "new_reply",    label: "New Reply",    icon: <IconComments style={{ width: 16, height: 16 }} /> },
];

export function NotificationsView({
  onHamburger,
  onAvatarClick,
}: {
  onHamburger?: () => void;
  onAvatarClick?: () => void;
} = {}) {
  const [notifications, setNotifications] = useState(HITL_NOTIFICATIONS);
  const [filter, setFilter] = useState<ActivityFilter | null>(null);

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const visible = notifications.filter((n) => {
    if (!filter) return true;
    if (filter === "unread")      return !n.read;
    if (filter === "mentions")    return n.category === "mention";
    if (filter === "reactions")   return n.category === "reaction";
    if (filter === "needs")       return n.type === "approval" || n.type === "question" || n.type === "review";
    if (filter === "new_message") return n.category === "new_message";
    if (filter === "new_reply")   return n.category === "new_reply";
    return true;
  });

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ height: "100%", background: "var(--ax-colors-bg-page)" }}
    >
      {/* ── Header — avatar (Option A) or hamburger (Option B) ── */}
      <Box display="flex" alignItems="center" style={{ padding: "14px 20px 10px", flexShrink: 0 }}>
        {onHamburger ? (
          <Box onClick={onHamburger} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ax-colors-fg-secondary)", flexShrink: 0, marginRight: 8 }}>
            <IconMenu />
          </Box>
        ) : (
          <Box onClick={onAvatarClick} style={{ cursor: onAvatarClick ? "pointer" : "default", marginRight: 12, flexShrink: 0 }}>
            <Avatar name="Jamie Cohen" src="/avatars/jc.png" size="lg" />
          </Box>
        )}
        <Heading level="2" style={{ flex: 1 }}>Activity</Heading>
        {unreadCount > 0 && (
          <Button appearance="subtle" size="sm"
            onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
          >
            Mark all read
          </Button>
        )}
      </Box>

      {/* ── Filter chips — compact horizontal pills ── */}
      <Box style={{ flexShrink: 0, display: "flex", gap: 6, padding: "0 16px 12px", overflowX: "auto", scrollbarWidth: "none" }}>
        {FILTER_CHIPS.map(({ key, label, icon }) => {
          const isActive = filter === key;
          return (
            <Box
              key={key}
              onClick={() => setFilter(isActive ? null : key)}
              style={{
                flexShrink: 0,
                display: "flex", flexDirection: "row", alignItems: "center", gap: 6,
                padding: "7px 12px",
                borderRadius: 999,
                background: isActive ? "var(--ax-colors-bg-information-subtle)" : "var(--ax-colors-bg-secondary)",
                border: `1px solid ${isActive ? "var(--ax-colors-border-information)" : "transparent"}`,
                cursor: "pointer",
              }}
            >
              <Box style={{ color: isActive ? "var(--ax-colors-fg-information)" : "var(--ax-colors-fg-secondary)", display: "flex", alignItems: "center" }}>
                {icon}
              </Box>
              <Text style={{
                ...mobileType.secondary, fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--ax-colors-fg-information)" : "var(--ax-colors-fg-secondary)",
                whiteSpace: "nowrap",
              }}>
                {label}
              </Text>
            </Box>
          );
        })}
      </Box>

      {/* ── Activity list — edge-to-edge rows ── */}
      <Box
        style={{ flex: 1, overflowY: "auto" }}
        display="flex"
        flexDirection="column"
      >
        {visible.length === 0 && (
          <Box display="flex" alignItems="center" justifyContent="center" style={{ paddingTop: 64 }}>
            <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-tertiary)" }}>No notifications</Text>
          </Box>
        )}
        {visible.map((notif, i) => (
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
  const [requestingChanges, setRequestingChanges] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const [swipeX, setSwipeX] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const startX = useRef(0);
  const isSwiping = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    isSwiping.current = true;
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isSwiping.current) return;
    const dx = e.clientX - startX.current;
    if (dx < 0) setSwipeX(Math.max(dx, -100));
  };
  const handlePointerUp = () => {
    isSwiping.current = false;
    if (swipeX < -72) {
      setSwipeX(-400);
      setTimeout(() => { setDismissed(true); onRead(); }, 220);
    } else {
      setSwipeX(0);
    }
  };

  const handleAction = (label: string) => {
    setActioned(label);
    setRequestingChanges(false);
    onRead();
  };

  const cfg = TYPE_CONFIG[notif.type];
  const isComplete = notif.type === "complete";
  const hasPrimary = HAS_PRIMARY_ACTION[notif.type];

  const hasActions = !!notif.actions && !actioned;

  if (dismissed) return null;

  return (
    <Box style={{ position: "relative", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
      {/* Swipe reveal strip — sits behind, visible when card slides left */}
      <Box style={{
        position: "absolute", top: 0, bottom: 0, left: 0, right: 0,
        background: "var(--ax-colors-fg-success)",
        display: "flex", alignItems: "center", justifyContent: "flex-end",
        paddingRight: 24,
        zIndex: 0,
      }}>
        <IconCheck style={{ width: 20, height: 20, color: "white" }} />
      </Box>
      {/* Card content — slides over the strip */}
      <Box
        className="mobile-hitl-in"
        display="flex"
        flexDirection="column"
        gap="6"
        onPointerDown={notif.read ? undefined : handlePointerDown}
        onPointerMove={notif.read ? undefined : handlePointerMove}
        onPointerUp={notif.read ? undefined : handlePointerUp}
        onPointerCancel={notif.read ? undefined : handlePointerUp}
        style={{
          animationDelay: `${delay}ms`,
          background: notif.read ? "var(--ax-colors-bg-page)" : "var(--ax-colors-bg-secondary)",
          padding: "12px 20px",
          position: "relative",
          zIndex: 1,
          transform: `translateX(${swipeX}px)`,
          transition: isSwiping.current ? "none" : "transform 0.22s ease",
          touchAction: "pan-y",
          userSelect: "none",
        }}
      >
      {/* Title row: icon + title + timestamp + unread dot */}
      <Box display="flex" alignItems="start" justifyContent="space-between" gap="8">
        <Box display="flex" alignItems="start" gap="8" style={{ flex: 1, minWidth: 0 }}>
          <Box style={{ flexShrink: 0, marginTop: 2 }}>{cfg.icon}</Box>
          <Text fontWeight={notif.read ? "500" : "600"} color="fg.default" style={{ ...mobileType.body, lineHeight: 1.35 }}>
            {notif.title}
          </Text>
        </Box>
        <Box display="flex" alignItems="center" gap="6" style={{ flexShrink: 0 }}>
          <Text color="fg.tertiary" style={{ ...mobileType.label }}>{notif.timestamp}</Text>
          {!notif.read && <Box rounded="full" style={{ width: 6, height: 6, backgroundColor: "var(--ax-colors-fg-error)", flexShrink: 0 }} />}
        </Box>
      </Box>

      {/* Description — only shown when card has no artifact */}
      {!notif.artifact && (
        <Text
          color="fg.secondary"
          style={{
            ...mobileType.secondary, paddingLeft: 28,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {notif.description}
        </Text>
      )}

      {/* Artifact — always styled box when present */}
      {notif.artifact && (
        <Box style={{
          marginLeft: 28,
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid var(--ax-colors-border-secondary)",
          background: "var(--ax-colors-bg-default)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        }}>
          <Text color="fg.secondary" style={{ ...mobileType.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {notif.artifact.type} · {notif.artifact.title}
          </Text>
          <Text style={{ ...mobileType.secondary, fontWeight: 500, color: "var(--ax-colors-fg-accent-strong)", flexShrink: 0, cursor: "pointer" }}>
            View →
          </Text>
        </Box>
      )}

      {/* Action buttons */}
      {hasActions && !requestingChanges && (
        <Box display="flex" gap="6" style={{ flexWrap: "wrap", marginTop: 2, paddingLeft: 20 }}>
          {notif.actions!.map((action) => {
            const isRequestChanges = action.label === "Request changes";
            return (
              <Button
                key={action.label}
                appearance="subtle"
                size="sm"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (isRequestChanges) { setRequestingChanges(true); onRead(); }
                  else handleAction(action.label);
                }}
                style={{ ...mobileType.meta, height: 30, padding: "0 12px", borderRadius: 6 }}
              >
                {action.label}
              </Button>
            );
          })}
        </Box>
      )}

      {/* Request-changes form */}
      {requestingChanges && (
        <Box display="flex" flexDirection="column" gap="8">
          <textarea
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            placeholder="What needs to change?"
            rows={3}
            style={{
              width: "100%", boxSizing: "border-box",
              ...mobileType.secondary, lineHeight: 1.4, padding: "10px 12px",
              border: "1px solid var(--ax-colors-border-secondary)",
              borderRadius: 8, background: "var(--ax-colors-bg-default)",
              color: "var(--ax-colors-fg-default)", resize: "none",
              fontFamily: "inherit", outline: "none",
            }}
          />
          <Box display="flex" gap="8">
            <Button appearance="subtle" size="sm" style={{ flex: 1, ...mobileType.secondary, height: 34 }}
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleAction("Feedback sent"); }}>
              Send feedback
            </Button>
            <Button appearance="subtle" size="sm" style={{ ...mobileType.secondary, height: 34 }}
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); setRequestingChanges(false); }}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {actioned && (
        <Box display="flex" alignItems="center" gap="4">
          <IconCheck style={{ width: 12, height: 12, color: "var(--ax-colors-fg-success)" }} />
          <Text color="fg.tertiary" style={{ ...mobileType.meta }}>{actioned}</Text>
        </Box>
      )}
      </Box>
    </Box>
  );
}

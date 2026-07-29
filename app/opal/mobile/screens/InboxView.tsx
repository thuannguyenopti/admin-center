"use client";

import { useState } from "react";
import { Box, Text, Avatar, Badge } from "@optiaxiom/react";
import { IconFilter, IconSearch, IconPen, IconSparkles } from "@optiaxiom/icons";
import { mobileType } from "../typography";

type Filter = "all" | "opal" | "team" | "canvases";

type ConversationItem = {
  id: string;
  type: "opal" | "person" | "group";
  name: string;
  initials?: string;
  preview: string;
  time: string;
  unread?: number;
  attachment?: string;
  pinned?: boolean;
  accent?: boolean;
};

const PINNED: ConversationItem[] = [
  {
    id: "opal-main",
    type: "opal",
    name: "Opal",
    preview: "Pricing test hit 94% significance — want the recap?",
    time: "9:24",
    unread: 1,
    pinned: true,
    accent: true,
  },
];

const TODAY: ConversationItem[] = [
  {
    id: "jordan",
    type: "person",
    name: "Jordan Lee",
    initials: "JL",
    preview: "Let's launch the hero test Friday",
    time: "8:10",
    unread: 2,
  },
  {
    id: "website-team",
    type: "group",
    name: "Website team",
    preview: "Priya: dropped the results in the canvas",
    time: "7:52",
    attachment: "Checkout funnel analysis",
  },
  {
    id: "opal-q3",
    type: "opal",
    name: "Opal · Q3 test plan",
    preview: "Updated the homepage variation matrix",
    time: "Tue",
  },
  {
    id: "marcus",
    type: "person",
    name: "Marcus Chen",
    initials: "MC",
    preview: "Sounds good — thanks for the writeup",
    time: "Mon",
  },
];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "opal",     label: "Opal" },
  { key: "team",     label: "Team" },
  { key: "canvases", label: "Canvases" },
];

function ConvAvatar({ item }: { item: ConversationItem }) {
  if (item.type === "opal") {
    return (
      <Box style={{
        width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(165deg, var(--ax-colors-bg-information-subtle), var(--ax-colors-bg-success-subtle))",
        border: "1px solid var(--ax-colors-border-secondary)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <img src="/opal_avatar.png" alt="Opal" style={{ width: 28, height: 28, borderRadius: "50%" }} />
      </Box>
    );
  }
  if (item.type === "group") {
    return (
      <Box style={{
        width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
        background: "var(--ax-colors-bg-information-subtle)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <IconSparkles style={{ width: 22, height: 22, color: "var(--ax-colors-fg-information)" }} />
      </Box>
    );
  }
  return <Avatar name={item.name} size="lg" style={{ flexShrink: 0 }} />;
}

function ConversationRow({ item }: { item: ConversationItem }) {
  const isRead = !item.unread;
  return (
    <Box display="flex" alignItems="center" gap="12"
      style={{
        padding: "11px 20px",
        cursor: "pointer",
        ...(item.accent ? {
          background: "var(--ax-colors-bg-information-subtle)",
          borderLeft: "3px solid var(--ax-colors-fg-accent-strong)",
        } : {}),
      }}>
      <ConvAvatar item={item} />
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Box display="flex" justifyContent="space-between" gap="8" alignItems="center">
          <Text style={{ fontWeight: isRead ? 400 : 600, ...mobileType.primary, color: isRead ? "var(--ax-colors-fg-secondary)" : "var(--ax-colors-fg-default)" }}>
            {item.name}
          </Text>
          <Text style={{ ...mobileType.meta, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }}>
            {item.time}
          </Text>
        </Box>
        <Box display="flex" alignItems="center" gap="8" style={{ marginTop: 1 }}>
          <Text style={{
            ...mobileType.secondary,
            color: item.unread ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1,
          }}>
            {item.preview}
          </Text>
          {item.unread && (
            <Box style={{
              flexShrink: 0, minWidth: 20, height: 20,
              padding: "0 6px", borderRadius: 999,
              background: "var(--ax-colors-fg-accent-strong)",
              color: "white", ...mobileType.label, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {item.unread}
            </Box>
          )}
        </Box>
        {item.attachment && (
          <Box display="flex" alignItems="center" gap="6" style={{
            marginTop: 6, display: "inline-flex",
            background: "var(--ax-colors-bg-page)",
            border: "1px solid var(--ax-colors-border-secondary)",
            borderRadius: 8, padding: "4px 8px",
          }}>
            <IconSparkles style={{ width: 14, height: 14, color: "var(--ax-colors-fg-accent-strong)", flexShrink: 0 }} />
            <Text style={{ ...mobileType.meta, fontWeight: 500, color: "var(--ax-colors-fg-secondary)" }}>
              {item.attachment}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{
      padding: "6px 20px 8px",
      ...mobileType.caps, fontWeight: 600,
      color: "var(--ax-colors-fg-tertiary)",
      display: "block",
    }}>
      {children}
    </Text>
  );
}

export function InboxView() {
  const [filter, setFilter] = useState<Filter>("all");

  const filteredPinned = filter === "opal" || filter === "all" ? PINNED : [];
  const filteredToday = TODAY.filter((item) => {
    if (filter === "all") return true;
    if (filter === "opal") return item.type === "opal";
    if (filter === "team") return item.type === "group" || item.type === "person";
    if (filter === "canvases") return !!item.attachment;
    return true;
  });

  return (
    <Box display="flex" flexDirection="column" style={{ height: "100%", background: "var(--ax-colors-bg-default)", position: "relative" }}>

      {/* Header */}
      <Box style={{ flexShrink: 0, padding: "14px 20px 10px" }}>
        <Box display="flex" alignItems="center" gap="12" style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", color: "var(--ax-colors-fg-default)", flex: 1 }}>
            Inbox
          </Text>
          <Box style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "var(--ax-colors-bg-default)",
            border: "1px solid var(--ax-colors-border-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}>
            <IconFilter style={{ width: 20, height: 20, color: "var(--ax-colors-fg-secondary)" }} />
          </Box>
          <Avatar name="Pei Chien" size="md" style={{ flexShrink: 0, cursor: "pointer" }} />
        </Box>

        {/* Search */}
        <Box display="flex" alignItems="center" gap="10"
          style={{
            background: "var(--ax-colors-bg-page)",
            border: "1px solid var(--ax-colors-border-secondary)",
            borderRadius: 12, padding: "10px 14px",
          }}>
          <IconSearch style={{ width: 18, height: 18, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
          <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-tertiary)" }}>
            Search chats, people, canvases
          </Text>
        </Box>

        {/* Filter chips */}
        <Box display="flex" gap="8" style={{ marginTop: 12 }}>
          {FILTERS.map(({ key, label }) => {
            const isActive = filter === key;
            return (
              <Box key={key} onClick={() => setFilter(key)} style={{
                padding: "7px 15px", borderRadius: 999, cursor: "pointer",
                background: isActive ? "var(--ax-colors-fg-default)" : "var(--ax-colors-bg-default)",
                border: isActive ? "none" : "1px solid var(--ax-colors-border-secondary)",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                {key === "opal" && (
                  <img src="/opal_avatar.png" alt="" style={{ width: 14, height: 14, borderRadius: "50%" }} />
                )}
                <Text style={{ ...mobileType.secondary, fontWeight: isActive ? 600 : 500, color: isActive ? "var(--ax-colors-bg-default)" : "var(--ax-colors-fg-secondary)", whiteSpace: "nowrap" }}>
                  {label}
                </Text>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Feed */}
      <Box style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>
        {filteredPinned.length > 0 && (
          <>
            <SectionLabel>Pinned</SectionLabel>
            {filteredPinned.map((item) => <ConversationRow key={item.id} item={item} />)}
          </>
        )}
        {filteredToday.length > 0 && (
          <>
            <SectionLabel>Today</SectionLabel>
            {filteredToday.map((item) => <ConversationRow key={item.id} item={item} />)}
          </>
        )}
        {filteredPinned.length === 0 && filteredToday.length === 0 && (
          <Box display="flex" alignItems="center" justifyContent="center" style={{ padding: "40px 20px" }}>
            <Text color="fg.tertiary" fontSize="md">No conversations</Text>
          </Box>
        )}
      </Box>

      {/* FAB */}
      <Box style={{
        position: "absolute", right: 18, bottom: 18,
        width: 52, height: 52, borderRadius: 16,
        background: "var(--ax-colors-fg-accent-strong)",
        boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
      }}>
        <IconPen style={{ width: 24, height: 24, color: "white" }} />
      </Box>
    </Box>
  );
}

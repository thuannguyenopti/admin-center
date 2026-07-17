"use client";

import { useState } from "react";
import { Box, Text, Avatar, Badge } from "@optiaxiom/react";
import { IconSearch } from "@optiaxiom/icons";
import { PresenceDot } from "../components/MessageBubble";
import { DMS, GROUPS, THREADS, getMockTime, getUnreadQueue, type DMItem, type GroupItem } from "../data";

type Filter = "all" | "catchup" | "unread" | "mentions";

type Props = {
  onSelect: (id: string) => void;
  onCatchup: () => void;
};

function getLastMessage(id: string): string {
  const thread = THREADS[id] ?? [];
  const last = thread[thread.length - 1];
  if (!last) return "";
  if (last.type === "attachment") return "📎 Shared a file";
  return last.text.replace(/\n/g, " ").slice(0, 52) + (last.text.length > 52 ? "…" : "");
}

function getLastTime(id: string): string {
  const thread = THREADS[id] ?? [];
  if (!thread.length) return "";
  return getMockTime(thread.length - 1);
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "catchup",  label: "Catch up" },
  { key: "unread",   label: "Unread" },
  { key: "mentions", label: "Mentions" },
];

export function ConversationList({ onSelect, onCatchup }: Props) {
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const totalUnread = getUnreadQueue().length;
  const isUnreadMode = filter === "unread";

  const filteredDMs = isUnreadMode
    ? DMS.filter(d => (d.unread ?? 0) > 0)
    : DMS.filter(d => d.name.toLowerCase().includes(query.toLowerCase()));

  const filteredGroups = isUnreadMode
    ? GROUPS.filter(g => (g.unread ?? 0) > 0)
    : GROUPS.filter(g => g.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ height: "100%", background: "var(--ax-colors-bg-default)" }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px="16"
        style={{ height: 56, flexShrink: 0, borderBottom: "1px solid var(--ax-colors-border-secondary)" }}
      >
        <Text fontWeight="700" color="fg.default" style={{ fontSize: 20 }}>
          Messages
        </Text>
      </Box>

      {/* ── Search ──────────────────────────────────────────────────── */}
      <Box px="12" pt="10" pb="6" style={{ flexShrink: 0 }}>
        <Box
          display="flex"
          alignItems="center"
          gap="8"
          style={{
            background: "var(--ax-colors-bg-secondary)",
            borderRadius: 12,
            padding: "8px 12px",
            transition: "box-shadow 0.15s",
            boxShadow: searchFocused ? "0 0 0 2px var(--ax-colors-border-accent)" : "none",
          }}
        >
          <IconSearch style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search messages…"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "inherit",
              fontSize: 15,
              color: "var(--ax-colors-fg-default)",
            }}
          />
          {query && (
            <Box
              onClick={() => setQuery("")}
              style={{ fontSize: 12, color: "var(--ax-colors-fg-tertiary)", cursor: "pointer", padding: "0 4px" }}
            >
              ✕
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Filter chips ────────────────────────────────────────────── */}
      <Box
        style={{
          flexShrink: 0,
          overflowX: "auto",
          paddingBottom: 10,
          paddingLeft: 12,
          paddingRight: 12,
          display: "flex",
          gap: 8,
          scrollbarWidth: "none",
        }}
      >
        {FILTERS.map(({ key, label }) => {
          const isActive = filter === key;
          const isCatchupChip = key === "catchup";
          const showDot = isCatchupChip && totalUnread > 0;
          return (
            <Box
              key={key}
              onClick={() => isCatchupChip ? onCatchup() : setFilter(key)}
              style={{
                position: "relative",
                flexShrink: 0,
                padding: "5px 14px",
                paddingLeft: isCatchupChip ? 10 : 14,
                borderRadius: 20,
                fontSize: 13,
                fontWeight: isActive ? 600 : isCatchupChip ? 500 : 400,
                cursor: "pointer",
                backgroundImage: isActive
                  ? "none"
                  : isCatchupChip
                  ? "radial-gradient(ellipse at 100% 50%, rgba(186,158,245,0.20) 0%, rgba(168,184,240,0.17) 55%, rgba(144,210,187,0.155) 77%, rgba(119,236,133,0.14) 100%)"
                  : "none",
                background: isActive
                  ? "var(--ax-colors-fg-accent-strong)"
                  : isCatchupChip
                  ? "white"
                  : "var(--ax-colors-bg-secondary)",
                color: isActive ? "white" : "var(--ax-colors-fg-default)",
                border: isActive
                  ? "none"
                  : isCatchupChip
                  ? "1px solid var(--ax-colors-border-default)"
                  : "1px solid var(--ax-colors-border-secondary)",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {isCatchupChip && (
                <img
                  src="/opal-icon-nav.png"
                  alt=""
                  style={{ width: 14, height: 14, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                />
              )}
              {label}
              {showDot && (
                <Box
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--ax-colors-fg-error)",
                    border: "1.5px solid var(--ax-colors-bg-default)",
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {/* ── List ────────────────────────────────────────────────────── */}
      <Box style={{ flex: 1, overflowY: "auto" }}>
        {isUnreadMode && filteredDMs.length === 0 && filteredGroups.length === 0 && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" style={{ paddingTop: 64, gap: 8 }}>
            <Text color="fg.tertiary" style={{ fontSize: 32 }}>✓</Text>
            <Text fontWeight="600" color="fg.default" style={{ fontSize: 16 }}>All caught up!</Text>
            <Text color="fg.tertiary" style={{ fontSize: 14 }}>No unread conversations</Text>
          </Box>
        )}

        {/* In unread mode: flat list, no section labels */}
        {isUnreadMode ? (
          <>
            {filteredDMs.map((dm, i) => (
              <DMRow key={dm.id} dm={dm} onSelect={onSelect} delay={i * 22} />
            ))}
            {filteredGroups.map((g, i) => (
              <GroupRow key={g.id} group={g} onSelect={onSelect} delay={(filteredDMs.length + i) * 22} />
            ))}
          </>
        ) : (
          <>
            {filteredDMs.length > 0 && (
              <Section label="Direct Messages">
                {filteredDMs.map((dm, i) => (
                  <DMRow key={dm.id} dm={dm} onSelect={onSelect} delay={i * 22} />
                ))}
              </Section>
            )}
            {filteredGroups.length > 0 && (
              <Section label="Group Chats">
                {filteredGroups.map((g, i) => (
                  <GroupRow key={g.id} group={g} onSelect={onSelect} delay={i * 22} />
                ))}
              </Section>
            )}
            {filteredDMs.length === 0 && filteredGroups.length === 0 && query && (
              <Box display="flex" alignItems="center" justifyContent="center" pt="48">
                <Text color="fg.tertiary" fontSize="md">No results for "{query}"</Text>
              </Box>
            )}
          </>
        )}

        <Box style={{ height: 16 }} />
      </Box>
    </Box>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box style={{ marginBottom: 8 }}>
      <Box px="16" pt="16" pb="4">
        <Text
          fontSize="sm"
          fontWeight="600"
          color="fg.tertiary"
          style={{ textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 11 }}
        >
          {label}
        </Text>
      </Box>
      {children}
    </Box>
  );
}

function DMRow({ dm, onSelect, delay }: { dm: DMItem; onSelect: (id: string) => void; delay: number }) {
  const lastMsg = getLastMessage(dm.id);
  const lastTime = getLastTime(dm.id);
  const [pressed, setPressed] = useState(false);

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="12"
      px="16"
      py="10"
      className="mobile-bubble-stagger"
      onClick={() => onSelect(dm.id)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        cursor: "pointer",
        transform: pressed ? "scale(0.985)" : "scale(1)",
        transition: "transform 0.1s ease, background 0.1s",
        background: pressed ? "var(--ax-colors-bg-secondary)" : "transparent",
        animationDelay: `${delay}ms`,
      }}
    >
      <Box style={{ position: "relative", flexShrink: 0 }}>
        <Avatar name={dm.name} src={dm.avatar} size="lg" />
        {dm.status && <PresenceDot status={dm.status} />}
      </Box>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
          <Box display="flex" alignItems="center" gap="6" style={{ minWidth: 0 }}>
            <Text
              fontWeight={dm.unread ? "600" : "400"}
              color="fg.default"
              style={{ fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {dm.name}
            </Text>
            {dm.isVAU && <Badge intent="information" size="sm">AI</Badge>}
          </Box>
          <Text fontSize="sm" color="fg.tertiary" style={{ whiteSpace: "nowrap", flexShrink: 0, fontSize: 12 }}>
            {lastTime}
          </Text>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
          <Text
            color={dm.unread ? "fg.default" : "fg.tertiary"}
            style={{
              fontSize: 14,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontWeight: dm.unread ? 500 : 400,
              flex: 1,
              minWidth: 0,
            }}
          >
            {lastMsg || "No messages yet"}
          </Text>
          {dm.unread && (
            <Badge intent="success" size="sm" style={{ flexShrink: 0 }}>
              {dm.unread}
            </Badge>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function GroupRow({ group, onSelect, delay }: { group: GroupItem; onSelect: (id: string) => void; delay: number }) {
  const lastMsg = getLastMessage(group.id);
  const lastTime = getLastTime(group.id);
  const [pressed, setPressed] = useState(false);

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="12"
      px="16"
      py="10"
      className="mobile-bubble-stagger"
      onClick={() => onSelect(group.id)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        cursor: "pointer",
        transform: pressed ? "scale(0.985)" : "scale(1)",
        transition: "transform 0.1s ease, background 0.1s",
        background: pressed ? "var(--ax-colors-bg-secondary)" : "transparent",
        animationDelay: `${delay}ms`,
      }}
    >
      <Box
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "var(--ax-colors-bg-accent-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {group.emoji}
      </Box>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
          <Text
            fontWeight={group.unread ? "600" : "400"}
            color="fg.default"
            style={{ fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {group.name}
          </Text>
          <Text fontSize="sm" color="fg.tertiary" style={{ whiteSpace: "nowrap", flexShrink: 0, fontSize: 12 }}>
            {lastTime}
          </Text>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
          <Text
            color={group.unread ? "fg.default" : "fg.tertiary"}
            style={{
              fontSize: 14,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontWeight: group.unread ? 500 : 400,
              flex: 1,
              minWidth: 0,
            }}
          >
            {lastMsg || "No messages yet"}
          </Text>
          {group.unread && (
            <Badge intent="success" size="sm" style={{ flexShrink: 0 }}>
              {group.unread}
            </Badge>
          )}
        </Box>
      </Box>
    </Box>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Avatar, Badge, Box, Text } from "@optiaxiom/react";
import { IconBooks, IconBell, IconComments, IconSquareCheck, IconHouse } from "@optiaxiom/icons";
import { DMS, GROUPS, THREADS, PRESENCE_COLOR, getConversationName } from "../data";
import { mobileType } from "../typography";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPreview(id: string): string {
  const msgs = THREADS[id];
  if (!msgs || msgs.length === 0) return "No messages yet";
  const last = [...msgs].reverse().find((m) => m.text);
  const text = last?.text ?? "";
  return text.length > 50 ? text.slice(0, 50) + "…" : text;
}

// ── Inline SVGs (not confirmed in @optiaxiom/icons) ───────────────────────────

const IconCompose = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <path d="M12 2.5L14.5 5L5.5 14H3V11.5L12 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <line x1="10.2" y1="4.3" x2="12.7" y2="6.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      px="16"
      py="6"
      style={{
        display: "block",
        ...mobileType.caps,
        fontWeight: 600,
        color: "var(--ax-colors-fg-tertiary)",
        marginTop: 8,
      }}
    >
      {children}
    </Text>
  );
}

// ── Conversation row ──────────────────────────────────────────────────────────

function ConvRow({
  id,
  isActive,
  onClick,
  children,
}: {
  id: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap="10"
      onClick={onClick}
      style={{
        padding: "9px 12px",
        margin: "1px 6px",
        borderRadius: 10,
        cursor: "pointer",
        background: isActive ? "var(--ax-colors-bg-secondary)" : "transparent",
        transition: "background 0.12s",
      }}
    >
      {children}
    </Box>
  );
}

// ── Highlights card (inside drawer) ──────────────────────────────────────────

function DrawerHighlights({
  onSelect,
  onClose,
}: {
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const unreadDMs = DMS.filter((d) => d.unread && d.unread > 0);

  if (dismissed || unreadDMs.length === 0) return null;

  return (
    <Box
      border="1"
      borderColor="border.tertiary"
      rounded="lg"
      style={{ margin: "8px 10px", overflow: "hidden" }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px="12"
        style={{ paddingTop: 10, paddingBottom: 8 }}
      >
        <Box display="flex" alignItems="center" gap="6">
          <IconBell style={{ width: 14, height: 14, color: "var(--ax-colors-fg-tertiary)" }} />
          <Text fontWeight="600" color="fg.default" style={{ ...mobileType.secondary }}>
            What you missed
          </Text>
        </Box>
        <Box
          onClick={() => setDismissed(true)}
          style={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--ax-colors-fg-tertiary)",
            borderRadius: 4,
          }}
        >
          <IconClose />
        </Box>
      </Box>

      {/* Unread rows */}
      {unreadDMs.map((dm) => (
        <Box
          key={dm.id}
          display="flex"
          alignItems="center"
          gap="10"
          px="12"
          py="8"
          bg="bg.secondary"
          onClick={() => { onSelect(dm.id); onClose(); }}
          style={{ cursor: "pointer", borderTop: "1px solid var(--ax-colors-border-secondary)" }}
        >
          <Avatar name={dm.name} size="sm" style={{ flexShrink: 0 }} />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text fontWeight="600" color="fg.default" style={{ ...mobileType.secondary }}>{dm.name}</Text>
            <Text
              color="fg.tertiary"
              style={{ ...mobileType.meta, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {getPreview(dm.id)}
            </Text>
          </Box>
          <Badge intent="success" style={{ flexShrink: 0 }}>{dm.unread}</Badge>
        </Box>
      ))}
    </Box>
  );
}

// ── New message search overlay ────────────────────────────────────────────────

function NewMessagePane({
  onBack,
  onSelectConversation,
  onClose,
}: {
  onBack: () => void;
  onSelectConversation: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = DMS.filter(
    (d) => !query || d.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Box display="flex" flexDirection="column" style={{ height: "100%" }}>
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        gap="8"
        px="12"
        style={{
          height: 56,
          borderBottom: "1px solid var(--ax-colors-border-secondary)",
          flexShrink: 0,
        }}
      >
        <Text fontWeight="600" color="fg.default" style={{ ...mobileType.sectionHeader, flex: 1 }}>
          New message
        </Text>
      </Box>

      {/* Search input */}
      <Box
        display="flex"
        alignItems="center"
        gap="8"
        style={{
          margin: "10px 12px 6px",
          background: "var(--ax-colors-bg-secondary)",
          borderRadius: 10,
          padding: "8px 12px",
          flexShrink: 0,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--ax-colors-fg-tertiary)" strokeWidth="1.4" />
          <line x1="10" y1="10" x2="14" y2="14" stroke="var(--ax-colors-fg-tertiary)" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people…"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "inherit",
            ...mobileType.body,
            color: "var(--ax-colors-fg-default)",
          }}
        />
      </Box>

      {/* User list */}
      <Box style={{ flex: 1, overflowY: "auto", paddingTop: 4 }}>
        {filtered.map((dm) => (
          <Box
            key={dm.id}
            display="flex"
            alignItems="center"
            gap="10"
            style={{
              padding: "10px 14px",
              cursor: "pointer",
              transition: "background 0.1s",
            }}
            onClick={() => {
              onSelectConversation(dm.id);
              onClose();
            }}
          >
            <Box style={{ position: "relative", flexShrink: 0 }}>
              <Avatar name={dm.name} size="md" />
              {dm.status && (
                <Box
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: PRESENCE_COLOR[dm.status],
                    border: "2px solid var(--ax-colors-bg-default)",
                  }}
                />
              )}
            </Box>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Box display="flex" alignItems="center" gap="6">
                <Text fontWeight="500" color="fg.default" style={{ ...mobileType.body }}>
                  {dm.name}
                </Text>
                {dm.isVAU && <Badge intent="information">AI</Badge>}
              </Box>
              {dm.status && (
                <Text color="fg.tertiary" style={{ ...mobileType.meta }}>
                  {dm.status === "active" ? "Active now" : dm.status === "away" ? "Away" : "Busy"}
                </Text>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Main SideDrawer ───────────────────────────────────────────────────────────

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  activeId: string;
  initialMode?: "nav" | "newMsg";
  onCatchup?: () => void;
  onNavigateTasks?: () => void;
}

export function SideDrawer({
  open,
  onClose,
  onSelectConversation,
  onNewChat,
  activeId,
  initialMode = "nav",
  onCatchup,
  onNavigateTasks,
}: SideDrawerProps) {
  const [mode, setMode] = useState<"nav" | "newMsg">(initialMode);

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  const recentDMs = [
    ...DMS.filter(d => d.isVAU),
    ...DMS.filter(d => !d.isVAU).slice(0, 4),
  ];
  const totalUnread = DMS.filter(d => (d.unread ?? 0) > 0).length + GROUPS.filter(g => (g.unread ?? 0) > 0).length;

  const handleClose = () => {
    setMode("nav");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <Box
        onClick={handleClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 30,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* Drawer panel */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 272,
          background: "var(--ax-colors-bg-default)",
          zIndex: 31,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          display: "flex",
          flexDirection: "column",
          boxShadow: open ? "4px 0 24px rgba(0,0,0,0.18)" : "none",
        }}
      >
        {mode === "newMsg" ? (
          <NewMessagePane
            onBack={() => setMode("nav")}
            onSelectConversation={(id) => { onSelectConversation(id); setMode("nav"); }}
            onClose={handleClose}
          />
        ) : (
          <>
            {/* Nav header */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              px="16"
              style={{
                height: 56,
                borderBottom: "1px solid var(--ax-colors-border-secondary)",
                flexShrink: 0,
              }}
            >
              <Text fontWeight="700" color="fg.default" style={{ ...mobileType.title }}>
                Opal
              </Text>
              <Box display="flex" alignItems="center" gap="4">
                <Box
                  onClick={() => setMode("newMsg")}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--ax-colors-fg-secondary)",
                  }}
                >
                  <IconCompose />
                </Box>
                <Box
                  onClick={handleClose}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--ax-colors-fg-tertiary)",
                  }}
                >
                  <IconClose />
                </Box>
              </Box>
            </Box>

            {/* Scrollable nav content */}
            <Box style={{ flex: 1, overflowY: "auto", paddingTop: 4 }}>
              {/* Catch up entry */}
              {totalUnread > 0 && (
                <Box
                  display="flex"
                  alignItems="center"
                  gap="10"
                  onClick={() => { onCatchup?.(); handleClose(); }}
                  style={{
                    margin: "4px 6px 8px",
                    padding: "10px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: "var(--ax-colors-bg-secondary)",
                    transition: "background 0.1s",
                  }}
                >
                  <Box
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "var(--ax-colors-fg-accent-strong)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="white">
                      <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM8 4.5v4.25l2.8 1.6-.7 1.2-3.1-1.8V4.5H8z"/>
                    </svg>
                  </Box>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text fontWeight="600" color="fg.default" style={{ ...mobileType.body }}>Catch up</Text>
                    <Text color="fg.tertiary" style={{ ...mobileType.meta }}>
                      {totalUnread} unread conversation{totalUnread !== 1 ? "s" : ""}
                    </Text>
                  </Box>
                </Box>
              )}

              {/* Recent */}
              <SectionLabel>Recent</SectionLabel>
              {recentDMs.map((dm) => {
                const isActive = activeId === dm.id;
                return (
                  <ConvRow
                    key={dm.id}
                    id={dm.id}
                    isActive={isActive}
                    onClick={() => { onSelectConversation(dm.id); handleClose(); }}
                  >
                    <Avatar name={dm.name} src={dm.avatar} size="sm" style={{ flexShrink: 0 }} />
                    <Box style={{ minWidth: 0, flex: 1 }}>
                      <Box display="flex" alignItems="center" gap="6">
                        <Text
                          style={{
                            ...mobileType.body,
                            fontWeight: isActive ? 600 : 500,
                            color: "var(--ax-colors-fg-default)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getConversationName(dm.id)}
                        </Text>
                        {dm.isVAU && <Badge intent="information" size="sm">AI</Badge>}
                      </Box>
                      <Text
                        style={{
                          ...mobileType.meta,
                          color: "var(--ax-colors-fg-tertiary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: 1,
                        }}
                      >
                        {getPreview(dm.id)}
                      </Text>
                    </Box>
                  </ConvRow>
                );
              })}

              {/* Spaces (groups) */}
              {GROUPS.length > 0 && (
                <>
                  <SectionLabel>Spaces</SectionLabel>
                  {GROUPS.map((g) => {
                    const isActive = activeId === g.id;
                    return (
                      <ConvRow
                        key={g.id}
                        id={g.id}
                        isActive={isActive}
                        onClick={() => { onSelectConversation(g.id); handleClose(); }}
                      >
                        <Box
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "var(--ax-colors-bg-secondary)",
                            border: "1px solid var(--ax-colors-border-secondary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            flexShrink: 0,
                          }}
                        >
                          {g.emoji}
                        </Box>
                        <Text
                          style={{
                            ...mobileType.body,
                            fontWeight: 500,
                            color: isActive
                              ? "var(--ax-colors-fg-default)"
                              : "var(--ax-colors-fg-secondary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {g.name}
                        </Text>
                      </ConvRow>
                    );
                  })}
                </>
              )}
            </Box>

            {/* Bottom nav */}
            <Box
              style={{
                borderTop: "1px solid var(--ax-colors-border-secondary)",
                padding: "8px 6px 16px",
                flexShrink: 0,
              }}
            >
              {([
                {
                  label: "Opal",
                  icon: (
                    <Box style={{ width: 17, height: 17, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                      <img src="/opal_avatar.png" alt="Opal" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </Box>
                  ),
                  onClick: () => { onClose(); },
                },
                {
                  label: "Home",
                  icon: <IconHouse style={{ width: 17, height: 17 }} />,
                  onClick: () => { onClose(); },
                },
                {
                  label: "Messages",
                  icon: <IconComments style={{ width: 17, height: 17 }} />,
                  onClick: () => { onClose(); },
                },
                {
                  label: "Tasks",
                  icon: <IconSquareCheck style={{ width: 17, height: 17 }} />,
                  onClick: () => { onNavigateTasks?.(); onClose(); },
                },
                {
                  label: "Activity",
                  icon: <IconBell style={{ width: 17, height: 17 }} />,
                  onClick: () => { onClose(); },
                },
                {
                  label: "Artifacts",
                  icon: <IconBooks style={{ width: 17, height: 17 }} />,
                  onClick: () => { onClose(); },
                },
              ]).map(({ label, icon, onClick }) => (
                <Box
                  key={label}
                  display="flex"
                  alignItems="center"
                  gap="12"
                  onClick={onClick}
                  style={{
                    padding: "9px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    color: "var(--ax-colors-fg-secondary)",
                    transition: "background 0.12s",
                  }}
                >
                  <Box style={{ display: "flex", alignItems: "center", color: "var(--ax-colors-fg-tertiary)" }}>
                    {icon}
                  </Box>
                  <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-secondary)" }}>{label}</Text>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </>
  );
}

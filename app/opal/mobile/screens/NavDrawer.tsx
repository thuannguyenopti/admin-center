"use client";

import { useState } from "react";
import { Box, Avatar, Text } from "@optiaxiom/react";
import {
  IconHouse, IconComments, IconSquareCheck, IconBell, IconSquareUser, IconBooks,
} from "@optiaxiom/icons";
import { DMS, THREADS } from "../data";
import { mobileType } from "../typography";

export type NavTab = "home" | "opal" | "messages" | "tracker" | "activity" | "artifacts" | "me";

interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
  onSelectConversation?: (id: string) => void;
  activeTab: NavTab;
  showArtifacts?: boolean;
  showPreview?: boolean;
}

function getPreview(id: string): string {
  const thread = THREADS[id];
  if (!thread?.length) return "No messages yet";
  const last = [...thread].reverse().find((m) => m.text);
  const text = last?.text ?? "";
  return text.length > 46 ? text.slice(0, 46) + "…" : text;
}

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <line x1="3" y1="3" x2="15" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="15" y1="3" x2="3" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

export function NavDrawer({
  open, onClose, onNavigate, onSelectConversation, activeTab, showArtifacts = false, showPreview = true,
}: NavDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false);

  const recentItems = [
    ...DMS.filter((d) => d.isVAU).slice(0, 2),
    ...DMS.filter((d) => !d.isVAU).slice(0, 5),
  ];

  const searchResults = searchQuery
    ? DMS.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : DMS;

  const openSearch = () => { setSearchMode(true); setSearchQuery(""); };
  const closeSearch = () => { setSearchMode(false); setSearchQuery(""); };

  const handleSelectConv = (id: string) => {
    onSelectConversation?.(id);
    onClose();
    closeSearch();
  };

  const navItems: { tab: NavTab; label: string; icon: React.ReactNode }[] = [
    { tab: "home",      label: "Home",      icon: <IconHouse      style={{ width: 24, height: 24 }} /> },
    { tab: "opal",      label: "Opal",      icon: (
        <Box style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <img src="/opal_avatar.png" alt="Opal" style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }} />
        </Box>
    )},
    { tab: "messages",  label: "Messages",  icon: <IconComments   style={{ width: 24, height: 24 }} /> },
    { tab: "tracker",   label: "Tracker",   icon: <IconSquareCheck style={{ width: 24, height: 24 }} /> },
    { tab: "activity",  label: "Activity",  icon: <IconBell       style={{ width: 24, height: 24 }} /> },
    ...(showArtifacts ? [{ tab: "artifacts" as NavTab, label: "Artifacts", icon: <IconBooks style={{ width: 24, height: 24 }} /> }] : []),
    { tab: "me",        label: "Me",        icon: <IconSquareUser style={{ width: 24, height: 24 }} /> },
  ];

  return (
    <>
      {/* Scrim */}
      <Box
        onClick={onClose}
        style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)",
          zIndex: 40,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* Drawer */}
      <Box
        style={{
          position: "absolute", top: 0, left: 0, bottom: 0, width: 315,
          background: "var(--ax-colors-bg-default)",
          zIndex: 41,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          display: "flex", flexDirection: "column",
          boxShadow: open ? "4px 0 24px rgba(0,0,0,0.18)" : "none",
        }}
      >
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          style={{ height: 48, padding: "0 8px 0 16px", borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}
        >
          {searchMode ? (
            /* Search input */
            <>
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people…"
                style={{
                  flex: 1, border: "none", outline: "none", background: "transparent",
                  fontFamily: "inherit", ...mobileType.primary, color: "var(--ax-colors-fg-default)",
                }}
              />
              <Box onClick={closeSearch} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ax-colors-fg-tertiary)" }}>
                <IconClose />
              </Box>
            </>
          ) : (
            <>
              <Text style={{ ...mobileType.title, fontWeight: 700, color: "var(--ax-colors-fg-default)", flex: 1 }}>
                Opal
              </Text>
              {/* Compose / new message */}
              <Box onClick={openSearch} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ax-colors-fg-secondary)" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.6"/>
                  <line x1="11.5" y1="11.5" x2="16" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </Box>
              <Box onClick={onClose} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ax-colors-fg-tertiary)" }}>
                <IconClose />
              </Box>
            </>
          )}
        </Box>

        {/* Scrollable body */}
        <Box style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>

          {/* Search results — when in search mode */}
          {searchMode ? (
            <>
              <Text style={{ display: "block", ...mobileType.caps, fontWeight: 600, color: "var(--ax-colors-fg-tertiary)", padding: "16px 16px 6px" }}>
                {searchQuery ? "Results" : "All people"}
              </Text>
              {searchResults.map((dm) => (
                <Box key={dm.id} display="flex" alignItems="center" gap="10" onClick={() => handleSelectConv(dm.id)}
                  style={{ padding: "10px 14px", cursor: "pointer" }}>
                  <Avatar name={dm.name} src={dm.avatar || undefined} size="md"
                    colorScheme={dm.isVAU ? "purple" : "neutral"} style={{ flexShrink: 0 }} />
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ ...mobileType.body, fontWeight: 500, color: "var(--ax-colors-fg-default)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {dm.name}
                    </Text>
                  </Box>
                </Box>
              ))}
            </>
          ) : (
            <>
          {/* Recent label */}
          <Text
            style={{
              display: "block", ...mobileType.caps, fontWeight: 600,
              color: "var(--ax-colors-fg-tertiary)", padding: "16px 16px 6px",
            }}
          >
            Recent
          </Text>

          {/* Recent conversation rows */}
          {recentItems.map((dm) => (
            <Box
              key={dm.id}
              display="flex"
              alignItems="center"
              gap="10"
              onClick={() => { onNavigate("messages"); onClose(); }}
              style={{ padding: "9px 12px", margin: "1px 6px", borderRadius: 10, cursor: "pointer" }}
            >
              <Avatar
                name={dm.name}
                src={dm.avatar || undefined}
                size="sm"
                colorScheme={dm.isVAU ? "purple" : "neutral"}
                style={{ flexShrink: 0 }}
              />
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    ...mobileType.body, fontWeight: 500, color: "var(--ax-colors-fg-default)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}
                >
                  {dm.name}
                </Text>
                {showPreview && (
                  <Text
                    style={{
                      ...mobileType.meta, color: "var(--ax-colors-fg-tertiary)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1,
                    }}
                  >
                    {getPreview(dm.id)}
                  </Text>
                )}
              </Box>
            </Box>
          ))}

            </>
          )}

          {/* Separator + Nav items — always shown */}
          {!searchMode && <>
          <Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "12px 16px" }} />

          {/* Nav items */}
          {navItems.map(({ tab, label, icon }) => {
            const isActive = activeTab === tab;
            return (
              <Box
                key={tab}
                display="flex"
                alignItems="center"
                gap="12"
                onClick={() => { onNavigate(tab); onClose(); }}
                style={{
                  padding: "9px 12px", margin: "1px 6px", borderRadius: 10,
                  cursor: "pointer",
                  background: isActive ? "var(--ax-colors-bg-secondary)" : "transparent",
                  transition: "background 0.12s",
                }}
              >
                <Box
                  style={{
                    display: "flex", alignItems: "center",
                    color: isActive ? "var(--ax-colors-fg-accent-strong)" : "var(--ax-colors-fg-tertiary)",
                  }}
                >
                  {icon}
                </Box>
                <Text
                  style={{
                    ...mobileType.primary,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)",
                  }}
                >
                  {label}
                </Text>
              </Box>
            );
          })}
          </>}
        </Box>
      </Box>
    </>
  );
}

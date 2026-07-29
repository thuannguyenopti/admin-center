"use client";

import { useRef, useState } from "react";
import { Avatar, Box, Heading, Button, Text } from "@optiaxiom/react";
import {
  IconSearch, IconPenToSquare, IconPlus, IconRecordVoiceOver,
  IconArrowUp, IconSparkles, IconXmark, IconChevronLeft,
} from "@optiaxiom/icons";
import { OpalChatView } from "./OpalChatView";
import { mobileType } from "../typography";

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <line x1="3" y1="5"  x2="17" y2="5"  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="3" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

// ── Demo chat history ─────────────────────────────────────────────────────────

type ChatItem = { id: string; title: string; preview?: string };
type HistoryGroup = { label: string; items: ChatItem[] };

const HISTORY: HistoryGroup[] = [
  {
    label: "Today",
    items: [
      { id: "c1", title: "Generate content angles for our product launch",   preview: "Great picks — ODP for C-Suite, covering conversion + post-launch…" },
      { id: "c2", title: "Q3 blog post SEO meta descriptions",               preview: "Here are 3 variants optimized for 'AI content platform'…" },
      { id: "c3", title: "Draft newsletter A/B test subject lines",          preview: "Mayling proposed two variants for this week's send…" },
    ],
  },
  {
    label: "Yesterday",
    items: [
      { id: "c4", title: "Opal catch-up — Jul 26",                          preview: "3 items need your attention: Bubs, Kara, and 5 unread…" },
      { id: "c5", title: "Homepage hero CTA multivariate test",             preview: "Variant B is outperforming control by 23% on trial sign-ups…" },
      { id: "c6", title: "Opticon keynote talking points",                  preview: "Based on your calendar I drafted key points for next week…" },
    ],
  },
  {
    label: "Last 7 days",
    items: [
      { id: "c7", title: "Q3 content calendar strategy",                    preview: "LinkedIn, X, blog cadence ready for final sign-off…" },
      { id: "c8", title: "VAU onboarding brief for new teammates",           preview: "Structured the onboarding doc across 4 sections…" },
    ],
  },
];

// ── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  onHamburger?: () => void;
  onAvatarClick?: () => void;
  onOpenChat?: (id: string) => void;
  onBack?: () => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function OpalHomeView({ onHamburger, onAvatarClick, onOpenChat, onBack }: Props) {
  const [prompt, setPrompt] = useState("");
  const [focused, setFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [activeChat, setActiveChat] = useState<{ id: string; title: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const isTyping = prompt.trim().length > 0;

  const handleFocus = () => setFocused(true);
  const handleBlur = () => { if (!prompt) setFocused(false); };

  const handleSubmit = () => {
    if (!isTyping) return;
    const title = prompt.trim();
    setPrompt("");
    setFocused(false);
    setActiveChat({ id: "new-" + Date.now(), title });
  };

  const openSearch = () => {
    setSearchActive(true);
    setSearchQuery("");
    setTimeout(() => searchRef.current?.focus(), 60);
  };

  const closeSearch = () => {
    setSearchActive(false);
    setSearchQuery("");
  };

  const filteredGroups = searchQuery
    ? HISTORY.map((g) => ({ ...g, items: g.items.filter((i) => i.title.toLowerCase().includes(searchQuery.toLowerCase())) })).filter((g) => g.items.length > 0)
    : HISTORY;

  if (activeChat) {
    return (
      <OpalChatView
        chatId={activeChat.id}
        title={activeChat.title}
        onBack={() => setActiveChat(null)}
      />
    );
  }

  return (
    <Box display="flex" flexDirection="column" style={{ height: "100%", background: "var(--ax-colors-bg-page)" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Box display="flex" alignItems="center" style={{ padding: "14px 20px 10px", flexShrink: 0 }}>
        {searchActive ? (
          /* Search mode: replace header with inline search bar */
          <>
            <Box display="flex" alignItems="center" gap="8" style={{
              flex: 1, borderRadius: 9999, padding: "9px 14px",
              background: "var(--ax-colors-bg-secondary)",
            }}>
              <IconSearch style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
              <input ref={searchRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats…"
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", ...mobileType.primary, color: "var(--ax-colors-fg-default)" }}
              />
            </Box>
            <Box onClick={closeSearch} style={{ cursor: "pointer", color: "var(--ax-colors-fg-secondary)", flexShrink: 0, marginLeft: 12 }}>
              <IconXmark style={{ width: 18, height: 18 }} />
            </Box>
          </>
        ) : (
          /* Normal mode */
          <>
            {onBack ? (
              <Button appearance="subtle" size="sm"
                icon={<IconChevronLeft style={{ width: 20, height: 20 }} />}
                aria-label="Back"
                onClick={onBack}
                style={{ width: 40, height: 40, padding: 0, flexShrink: 0, marginLeft: -4 }}
              />
            ) : onHamburger ? (
              <Box onClick={onHamburger} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ax-colors-fg-secondary)", flexShrink: 0, marginRight: 8 }}>
                <IconMenu />
              </Box>
            ) : (
              <Box onClick={onAvatarClick} style={{ cursor: onAvatarClick ? "pointer" : "default", marginRight: 12, flexShrink: 0 }}>
                <Avatar name="Jamie Cohen" src="/avatars/jc.png" size="lg" />
              </Box>
            )}
            <Heading level="2" style={{ flex: 1 }}>Opal</Heading>
            <Box style={{ display: "flex", alignItems: "center", border: "1px solid var(--ax-colors-border-secondary)", borderRadius: 20, padding: "0 8px", flexShrink: 0 }}>
              <Button appearance="subtle" size="lg" aria-label="Search"
                icon={<IconSearch style={{ width: 22, height: 22 }} />}
                style={{ width: 40, height: 40, padding: 0 }}
                onClick={openSearch}
              />
              <Button appearance="subtle" size="lg" aria-label="New chat"
                icon={<IconPenToSquare style={{ width: 20, height: 20 }} />}
                style={{ width: 40, height: 40, padding: 0 }}
                onClick={() => { setFocused(true); setTimeout(() => textareaRef.current?.focus(), 50); }}
              />
            </Box>
          </>
        )}
      </Box>

      {/* ── Chat history list (filters inline when search active) ───────── */}
      <Box style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>

        {searchQuery && filteredGroups.every((g) => g.items.length === 0) && (
          <Box display="flex" alignItems="center" justifyContent="center" style={{ paddingTop: 48 }}>
            <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-tertiary)" }}>No chats found</Text>
          </Box>
        )}

        {filteredGroups.map((group) => (
          <Box key={group.label}>
            {!searchQuery && (
              <Box style={{ padding: "16px 20px 4px" }}>
                <Text style={{
                  fontFamily: "var(--ax-fontFamily-mono, 'Roboto Mono', monospace)",
                  ...mobileType.caps, fontWeight: 400, color: "var(--ax-colors-fg-tertiary)",
                }}>
                  {group.label}
                </Text>
              </Box>
            )}
            {group.items.map((item) => (
              <Box
                key={item.id}
                onClick={() => setActiveChat({ id: item.id, title: item.title })}
                style={{
                  padding: "9px 20px",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--ax-colors-border-secondary)",
                }}
              >
                <Text style={{
                  ...mobileType.body, fontWeight: 400,
                  color: "var(--ax-colors-fg-default)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  display: "block",
                }}>
                  {item.title}
                </Text>
              </Box>
            ))}
          </Box>
        ))}
      </Box>

      {/* ── Prompt input — compact → expanded on focus ─────────────────── */}
      <Box style={{
        padding: "8px 16px 12px",
        borderTop: "1px solid var(--ax-colors-border-secondary)",
        flexShrink: 0,
        background: "var(--ax-colors-bg-default)",
      }}>
        <Box style={{
          border: "1px solid var(--ax-colors-border-default)",
          borderRadius: 12,
          background: "var(--ax-colors-bg-default)",
          overflow: "hidden",
          boxShadow: focused ? "0 0 0 2px var(--ax-colors-border-focus)" : "none",
          transition: "box-shadow 0.15s",
        }}>
          {!focused ? (
            /* Compact: single-line row */
            <Box display="flex" alignItems="center" style={{ padding: "0 8px 0 12px", height: 44 }}>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={handleFocus}
                placeholder="Ask Opal"
                rows={1}
                style={{
                  flex: 1, border: "none", outline: "none",
                  background: "transparent", resize: "none",
                  fontFamily: "inherit", ...mobileType.body,
                  color: "var(--ax-colors-fg-default)",
                  padding: 0, height: 22, overflow: "hidden",
                }}
              />
              <Box
                style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: "var(--ax-colors-bg-accent, #abff44)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <IconRecordVoiceOver style={{ width: 16, height: 16, color: "var(--ax-colors-fg-default)" }} />
              </Box>
            </Box>
          ) : (
            /* Expanded: multi-row + toolbar */
            <>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                placeholder="Ask Opal"
                rows={3}
                style={{
                  width: "100%", border: "none", outline: "none",
                  background: "transparent", resize: "none",
                  fontFamily: "inherit", ...mobileType.body,
                  color: "var(--ax-colors-fg-default)",
                  padding: "12px 12px 8px",
                  display: "block", boxSizing: "border-box",
                }}
              />
              <Box display="flex" alignItems="center" style={{ padding: "4px 8px 8px", gap: 2 }}>
                <Button appearance="subtle" size="sm" aria-label="Add" icon={<IconPlus style={{ width: 16, height: 16 }} />} style={{ width: 32, height: 32, padding: 0 }} />
                <Button appearance="subtle" size="sm" aria-label="Agents" icon={<IconSparkles style={{ width: 16, height: 16 }} />} style={{ width: 32, height: 32, padding: 0 }} />
                <Box style={{ flex: 1 }} />
                <Button appearance="subtle" size="sm" aria-label="Voice"
                  icon={<IconRecordVoiceOver style={{ width: 18, height: 18 }} />}
                  style={{ width: 32, height: 32, padding: 0 }}
                />
                <Box
                  onClick={handleSubmit}
                  style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: isTyping ? "var(--ax-colors-bg-accent, #abff44)" : "var(--ax-colors-bg-secondary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: isTyping ? "pointer" : "default",
                    transition: "background 0.15s",
                  }}
                >
                  <IconArrowUp style={{ width: 16, height: 16, color: "var(--ax-colors-fg-default)" }} />
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

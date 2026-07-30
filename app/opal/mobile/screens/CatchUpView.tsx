"use client";

import { useState, useRef } from "react";
import { Avatar, Badge, Box, Button, Heading, Text } from "@optiaxiom/react";
import { IconSearch, IconRecordVoiceOver, IconSparkles, IconXmark, IconPlus, IconArrowUp, IconBell } from "@optiaxiom/icons";
import { mobileType } from "../typography";

type Props = {
  onBack?: () => void;
  onHamburger?: () => void;
  onAvatarClick?: () => void;
  onBellClick?: () => void;
  onSelect: (id: string) => void;
  title?: string;
  showPreview?: boolean;
  launchpadPrompt?: boolean;
};

// ── Section labels ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Box px="16" style={{ paddingTop: 20, paddingBottom: 4 }}>
      <Heading level="4">{children}</Heading>
    </Box>
  );
}

function VauSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Box px="16" style={{ paddingTop: 20, paddingBottom: 4 }}>
      <Heading level="4">{children}</Heading>
    </Box>
  );
}

// ── Tap row ────────────────────────────────────────────────────────────────────
function Row({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <Box
      display="flex"
      alignItems="start"
      gap="12"
      px="16"
      py="10"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      {children}
    </Box>
  );
}

// ── Emoji group avatar ─────────────────────────────────────────────────────────
function EmojiCircle({ emoji, size = 32 }: { emoji: string; size?: number }) {
  return (
    <Box style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "var(--ax-colors-bg-secondary)",
      border: "1px solid var(--ax-colors-border-secondary)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16, overflow: "hidden",
    }}>
      {emoji}
    </Box>
  );
}

// ── VAU avatar (purple) ────────────────────────────────────────────────────────
function VauAvatar({ initial }: { initial: string }) {
  return (
    <Box style={{
      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
      background: "var(--ax-colors-bg-accent-subtle, #ede9fe)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Text style={{ ...mobileType.body, fontWeight: 700, color: "var(--ax-colors-fg-accent-strong, #5b21b6)" }}>
        {initial}
      </Text>
    </Box>
  );
}

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <line x1="3" y1="5"  x2="17" y2="5"  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="3" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Main component ─────────────────────────────────────────────────────────────
export function CatchUpView({ onBack, onHamburger, onAvatarClick: _onAvatarClick, onBellClick, onSelect, title, showPreview = true, launchpadPrompt = false }: Props) {
  const [promptText, setPromptText] = useState("");
  const [promptFocused, setPromptFocused] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const openSearch = () => {
    setSearchOpen(true);
    setSearchQuery("");
    setTimeout(() => searchRef.current?.focus(), 60);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <Box display="flex" flexDirection="column" style={{ height: "100%", background: "var(--ax-colors-bg-page)" }}>

      {/* Search overlay */}
      {searchOpen && (
        <Box display="flex" flexDirection="column" style={{ position: "absolute", inset: 0, background: "var(--ax-colors-bg-default)", zIndex: 50 }}>
          <Box display="flex" alignItems="center" gap="8" style={{ padding: "12px 16px", flexShrink: 0 }}>
            <Box display="flex" alignItems="center" gap="8" style={{
              flex: 1, border: "1px solid var(--ax-colors-border-default)",
              borderRadius: 8, padding: "8px 12px", background: "var(--ax-colors-bg-default)",
            }}>
              <IconSearch style={{ width: 18, height: 18, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
              <input ref={searchRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activity…"
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", ...mobileType.body, color: "var(--ax-colors-fg-default)" }}
              />
            </Box>
            <Button appearance="subtle" size="sm" icon={<IconXmark style={{ width: 18, height: 18 }} />}
              onClick={closeSearch} aria-label="Close search" style={{ flexShrink: 0 }} />
          </Box>
          {!searchQuery && (
            <Box style={{ padding: "24px 20px" }}>
              <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-tertiary)" }}>
                Search mentions, groups, and VAU updates
              </Text>
            </Box>
          )}
          {searchQuery && (
            <Box style={{ padding: "24px 20px" }}>
              <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-tertiary)" }}>No results for "{searchQuery}"</Text>
            </Box>
          )}
        </Box>
      )}

      {/* Header */}
      {launchpadPrompt ? (
        <Box display="flex" alignItems="center" gap="12" style={{ padding: "14px 20px 10px", flexShrink: 0 }}>
          <Avatar name="Jamie Cohen" src="/avatars/jc.png" size="lg" onClick={_onAvatarClick} style={{ flexShrink: 0, cursor: _onAvatarClick ? "pointer" : "default" }} />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ ...mobileType.meta, color: "var(--ax-colors-fg-tertiary)", lineHeight: 1.33 }}>Good morning</Text>
            <Heading level="3">Jamie Cohen</Heading>
          </Box>
          <Box onClick={onBellClick} style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--ax-colors-bg-default)", border: "1px solid var(--ax-colors-border-secondary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: onBellClick ? "pointer" : "default", position: "relative", flexShrink: 0 }}>
            <IconBell style={{ width: 22, height: 22, color: "var(--ax-colors-fg-secondary)" }} />
            <Box style={{ position: "absolute", top: 9, right: 10, width: 7, height: 7, borderRadius: "50%", background: "var(--ax-colors-fg-information)", border: "1.5px solid var(--ax-colors-bg-default)" }} />
          </Box>
        </Box>
      ) : (
        <Box display="flex" alignItems="center" gap="4" style={{ padding: "14px 8px 10px 4px", flexShrink: 0 }}>
          {onBack && (
            <Box onClick={onBack} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }}>
              <IconBack />
            </Box>
          )}
          {onHamburger && !onBack && (
            <Box onClick={onHamburger} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }}>
              <IconMenu />
            </Box>
          )}
          <Heading level="2" style={{ flex: 1, marginLeft: (!onBack && !onHamburger) ? 12 : 0 }}>
            {title ?? "Home"}
          </Heading>
          <Box style={{ display: "flex", alignItems: "center", border: "1px solid var(--ax-colors-border-secondary)", borderRadius: 20, padding: "0 8px", flexShrink: 0, marginRight: 8 }}>
            <Button appearance="subtle" size="lg" aria-label="Search" icon={<IconSearch style={{ width: 22, height: 22 }} />} style={{ width: 40, height: 40, padding: 0 }} onClick={openSearch} />
          </Box>
        </Box>
      )}

      {/* Prompt input */}
      <Box style={{ padding: "0 16px 8px", flexShrink: 0 }}>
        {launchpadPrompt ? (
          <Box rounded="xl" style={{
            background: "linear-gradient(4deg, #e4f3ff 0%, #ffffff 44%, #e9ffe1 81%)",
            border: "1px solid var(--ax-colors-border-secondary)",
            padding: promptFocused ? "12px 12px 10px" : "10px 8px 10px 12px",
            display: promptFocused ? "block" : "flex",
            alignItems: promptFocused ? undefined : "center",
          }}>
            <input value={promptText} onChange={(e) => setPromptText(e.target.value)}
              onFocus={() => setPromptFocused(true)}
              onBlur={() => { if (!promptText) setPromptFocused(false); }}
              placeholder="Ask Opal"
              style={{ flex: promptFocused ? undefined : 1, width: promptFocused ? "100%" : undefined, border: "none", outline: "none", background: "transparent", ...mobileType.body, color: "var(--ax-colors-fg-default)", fontFamily: "inherit" }} />
            {promptFocused ? (
              <Box display="flex" alignItems="center" gap="4" style={{ marginTop: 10 }}>
                <Button appearance="subtle" size="lg" aria-label="Add" icon={<IconPlus style={{ width: 18, height: 18 }} />} />
                <Box style={{ flex: 1 }} />
                <Button appearance="primary" size="lg" aria-label={promptText ? "Send" : "Voice input"}
                  icon={promptText ? <IconArrowUp style={{ width: 18, height: 18 }} /> : <IconRecordVoiceOver style={{ width: 18, height: 18 }} />} />
              </Box>
            ) : (
              <Box style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: "var(--ax-colors-bg-accent, #abff44)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <IconRecordVoiceOver style={{ width: 16, height: 16, color: "var(--ax-colors-fg-default)" }} />
              </Box>
            )}
          </Box>
        ) : (
          <Box display="flex" alignItems="center" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "8px 8px 8px 12px", background: "var(--ax-colors-bg-default)" }}>
            <Text style={{ flex: 1, ...mobileType.body, color: "var(--ax-colors-fg-tertiary)" }}>Ask Opal</Text>
            <Box style={{ width: 32, height: 32, borderRadius: 8, background: "var(--ax-colors-bg-accent, #abff44)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <IconRecordVoiceOver style={{ width: 18, height: 18, color: "var(--ax-colors-fg-default)" }} />
            </Box>
          </Box>
        )}
      </Box>

      {/* Scrollable content */}
      <Box style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>

        {/* OpalAlert — hidden on launchpad home */}
        {!launchpadPrompt && <Box style={{ margin: "12px 12px 0" }}>
          <Box display="flex" alignItems="start" gap="8" style={{
            padding: "12px",
            borderRadius: 8,
            background: "linear-gradient(165deg, var(--ax-colors-bg-information-subtle) 0%, var(--ax-colors-bg-default) 50%, var(--ax-colors-bg-success-subtle) 100%)",
            border: "1px solid var(--ax-colors-border-secondary)",
          }}>
            <IconSparkles style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1, color: "var(--ax-colors-fg-accent-strong)" }} />
            <Box>
              <Text style={{ ...mobileType.body, fontWeight: 600, color: "var(--ax-colors-fg-default)", display: "block", marginBottom: 4 }}>
                3 items need your attention.
              </Text>
              <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-default)" }}>
                Bubs needs approval, Kara needs input, and you have 5 unread messages.
              </Text>
            </Box>
          </Box>
        </Box>}

        {/* Action Required */}
        <SectionLabel>Action Required</SectionLabel>

        <Row onClick={() => onSelect("bubs")}>
          <Avatar name="Bubs" src="/vau-bubs.svg" size="md" colorScheme="purple" style={{ flexShrink: 0 }} />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" gap="8" style={{ marginBottom: 4 }}>
              <Badge intent="warning">Needs Approval</Badge>
              <Text style={{ ...mobileType.meta, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }}>2 min ago</Text>
            </Box>
            <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-default)" }}>
              Ready to publish — needs your sign-off
            </Text>
          </Box>
        </Row>

        <Row onClick={() => onSelect("kara")}>
          <Avatar name="Kara" src="/vau-kara.svg" size="md" colorScheme="purple" style={{ flexShrink: 0 }} />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" gap="8" style={{ marginBottom: 4 }}>
              <Badge intent="information">Needs Input</Badge>
              <Text style={{ ...mobileType.meta, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }}>14 min ago</Text>
            </Box>
            <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-default)" }}>
              Direction needed before I proceed
            </Text>
          </Box>
        </Row>

        <Row onClick={() => onSelect("eric")}>
          <Avatar name="Eric" src="/vau-eric.svg" size="md" colorScheme="purple" style={{ flexShrink: 0 }} />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" gap="8" style={{ marginBottom: 4 }}>
              <Badge intent="success">Ready to Review</Badge>
              <Text style={{ ...mobileType.meta, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }}>1 hr ago</Text>
            </Box>
            <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-default)" }}>
              Test results ready for your review
            </Text>
          </Box>
        </Row>

        {/* You Were Mentioned */}
        <SectionLabel>You Were Mentioned</SectionLabel>

        <Row onClick={() => onSelect("bf")}>
          <EmojiCircle emoji="🛍️" size={32} />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
              <Text style={{ ...mobileType.body, fontWeight: 500, color: "var(--ax-colors-fg-default)" }}>Black Friday Campaign</Text>
              <Text style={{ ...mobileType.meta, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }}>10:42 AM</Text>
            </Box>
            {showPreview && <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-secondary)", marginTop: 2 }}>
              @Pei can you review the updated brief before Friday?
            </Text>}
          </Box>
        </Row>

        <Row onClick={() => onSelect("vw")}>
          <Avatar name="VAU Working Group" size="md" style={{ flexShrink: 0 }} />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
              <Text style={{ ...mobileType.body, fontWeight: 500, color: "var(--ax-colors-fg-default)" }}>VAU Working Group</Text>
              <Text style={{ ...mobileType.meta, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }}>11:05 AM</Text>
            </Box>
            {showPreview && <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-secondary)", marginTop: 2 }}>
              @Pei great insight — should we add this to the backlog?
            </Text>}
          </Box>
        </Row>

        {/* Group Highlights */}
        <SectionLabel>Group Highlights</SectionLabel>

        <Row onClick={() => onSelect("bf")}>
          <EmojiCircle emoji="🛍️" size={36} />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
              <Text style={{ ...mobileType.body, fontWeight: 500, color: "var(--ax-colors-fg-default)" }}>Black Friday Campaign</Text>
              <Text style={{ ...mobileType.meta, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }}>10:30 AM</Text>
            </Box>
            {showPreview && <Box display="flex" alignItems="center" justifyContent="space-between" gap="8" style={{ marginTop: 2 }}>
              <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Alex: Let's align on the final copy before launch tomorrow
              </Text>
              <Box style={{
                minWidth: 20, height: 20, borderRadius: 10, padding: "0 6px",
                background: "var(--ax-colors-fg-information-strong)",
                color: "white", ...mobileType.meta, fontWeight: 500,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                5
              </Box>
            </Box>}
          </Box>
        </Row>

        {/* VAU Updates */}
        <VauSectionLabel>VAU Updates</VauSectionLabel>

        <Row onClick={() => onSelect("bubs")}>
          <VauAvatar initial="B" />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ ...mobileType.body, fontWeight: 500, color: "var(--ax-colors-fg-default)", display: "block", marginBottom: 4 }}>
              Bubs
            </Text>
            {showPreview && <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-secondary)" }}>
              Q3 Content Strategy draft is ready for your review
            </Text>}
          </Box>
        </Row>

        <Row onClick={() => onSelect("kara")}>
          <VauAvatar initial="K" />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ ...mobileType.body, fontWeight: 500, color: "var(--ax-colors-fg-default)", display: "block", marginBottom: 4 }}>
              Kara
            </Text>
            {showPreview && <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-secondary)" }}>
              SEO meta descriptions for the Opal landing page — 3 variants ready
            </Text>}
          </Box>
        </Row>

      </Box>
    </Box>
  );
}

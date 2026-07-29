"use client";

import { useEffect, useRef, useState, useCallback, Fragment } from "react";
import { Box, Text, Avatar, Button, Badge } from "@optiaxiom/react";
import { IconChevronLeft, IconEllipsisSolid, IconSearch, IconPenToSquare } from "@optiaxiom/icons";
import { mobileType } from "../typography";
import { MessageBubble, PresenceDot } from "../components/MessageBubble";
import { Composer } from "../components/Composer";
import { TypingIndicator } from "../components/TypingIndicator";
import {
  type Message,
  THREADS,
  RESPONDERS,
  getDM,
  getGroup,
  getConversationName,
  getReply,
  getMockTime,
} from "../data";

const IconHamburger = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <line x1="3" y1="6"  x2="17" y2="6"  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);


type Props = {
  conversationId: string;
  onBack?: () => void;
  onHamburger?: () => void;
  onNewChat?: () => void;
  onGlobalSearch?: () => void;
  autoFocus?: boolean;
};

export function ChatView({ conversationId, onBack, onHamburger, onNewChat, onGlobalSearch, autoFocus = false }: Props) {
  const [messages, setMessages] = useState<Message[]>(
    () => (THREADS[conversationId] ?? []).map((m) => ({ ...m })),
  );
  const [typing, setTyping] = useState(false);
  const [showPill, setShowPill] = useState(false);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);

  const displayedMessages = searchQuery
    ? messages.filter((m) => m.text?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const dm    = getDM(conversationId);
  const group = getGroup(conversationId);
  const name  = getConversationName(conversationId);
  const responder = RESPONDERS[conversationId];

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "instant" });
    setShowPill(false);
    setNewMsgCount(0);
    atBottomRef.current = true;
  }, []);

  // Detect scroll position
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    atBottomRef.current = distFromBottom < 60;
    if (atBottomRef.current) {
      setShowPill(false);
      setNewMsgCount(0);
    }
  };

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (atBottomRef.current) {
      scrollToBottom(messages.length > 1);
    } else {
      setShowPill(true);
    }
  }, [messages.length, scrollToBottom]);

  // Reset when conversation changes
  useEffect(() => {
    setMessages((THREADS[conversationId] ?? []).map((m) => ({ ...m })));
    setTyping(false);
    setShowPill(false);
    setNewMsgCount(0);
    atBottomRef.current = true;
    setTimeout(() => scrollToBottom(false), 0);
  }, [conversationId, scrollToBottom]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = (text: string) => {
    const newMsg: Message = {
      id: `u-${Date.now()}`,
      from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text,
    };
    setMessages((prev) => [...prev, newMsg]);
    setTyping(true);

    // Auto-reply
    const delay = 900 + Math.random() * 800;
    setTimeout(() => {
      const reply: Message = {
        id: `r-${Date.now()}`,
        from: responder?.from ?? "human",
        senderName: responder?.name,
        senderAvatar: responder?.avatar,
        senderColor: responder?.color,
        text: getReply(conversationId),
      };
      setMessages((prev) => [...prev, reply]);
      setTyping(false);
      if (!atBottomRef.current) setNewMsgCount((n) => n + 1);
    }, delay);
  };

  const memberCount = group
    ? parseInt(group.members.match(/\d+/)?.[0] ?? "3") + 2
    : null;

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ height: "100%", background: "var(--ax-colors-bg-default)", position: "relative" }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <Box
        display="flex"
        alignItems="center"
        gap="4"
        px="8"
        style={{
          height: 56,
          flexShrink: 0,
          borderBottom: "1px solid var(--ax-colors-border-secondary)",
          background: "var(--ax-colors-bg-default)",
          zIndex: 10,
          position: "relative",
        }}
      >
        {onHamburger ? (
          <Button
            appearance="subtle"
            size="sm"
            icon={<IconHamburger />}
            aria-label="Open menu"
            onClick={onHamburger}
            style={{ width: 40, height: 40, padding: 0, flexShrink: 0 }}
          />
        ) : (
          <Button
            appearance="subtle"
            size="sm"
            icon={<IconChevronLeft style={{ width: 20, height: 20 }} />}
            aria-label="Back"
            onClick={onBack}
            style={{ width: 40, height: 40, padding: 0, flexShrink: 0, marginLeft: -4 }}
          />
        )}

        <Box
          display="flex"
          alignItems="center"
          gap="10"
          style={{
            flex: 1,
            minWidth: 0,
            cursor: "pointer",
            ...(onHamburger
              ? { justifyContent: "center" }
              : {}),
          }}
        >
          {!onHamburger && (
            <Box style={{ position: "relative", flexShrink: 0 }}>
              {dm ? (
                <>
                  <Avatar name={dm.name} src={dm.avatar} size="md" />
                  {dm.status && <PresenceDot status={dm.status} />}
                </>
              ) : group ? (
                <Box
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--ax-colors-bg-accent-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  {group.emoji}
                </Box>
              ) : null}
            </Box>
          )}

          <Box style={{ minWidth: 0, ...(onHamburger ? { textAlign: "center" } : {}) }}>
            <Box display="flex" alignItems="center" gap="6" style={onHamburger ? { justifyContent: "center" } : {}}>
              <Text
                fontWeight="600"
                color="fg.default"
                style={{
                  ...mobileType.sectionHeader,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </Text>
              {dm?.isVAU && (
                <Badge intent="information" size="sm">AI</Badge>
              )}
            </Box>
            <Text fontSize="sm" color="fg.tertiary">
              {dm?.status === "active"
                ? "Active now"
                : dm?.status === "away"
                ? "Away"
                : dm?.status === "busy"
                ? "Busy"
                : group
                ? group.members
                : ""}
            </Text>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap="2">
          {onHamburger ? (
            /* Option B: global search + new message */
            <>
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconSearch style={{ width: 18, height: 18 }} />}
                aria-label="Search all conversations"
                onClick={onGlobalSearch}
                style={{ width: 40, height: 40, padding: 0 }}
              />
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconPenToSquare style={{ width: 18, height: 18 }} />}
                aria-label="New message"
                onClick={onNewChat}
                style={{ width: 40, height: 40, padding: 0 }}
              />
            </>
          ) : (
            /* Option A: search + more */
            <>
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconSearch style={{ width: 18, height: 18 }} />}
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                style={{ width: 40, height: 40, padding: 0 }}
              />
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconEllipsisSolid style={{ width: 18, height: 18 }} />}
                aria-label="More options"
                style={{ width: 40, height: 40, padding: 0 }}
              />
            </>
          )}
        </Box>
      </Box>

      {/* ── Search bar (slides in below header when active) ── */}
      {searchOpen && (
        <Box
          display="flex"
          alignItems="center"
          gap="8"
          px="12"
          py="8"
          style={{
            borderBottom: "1px solid var(--ax-colors-border-secondary)",
            flexShrink: 0,
            background: "var(--ax-colors-bg-default)",
          }}
        >
          <IconSearch style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages…"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "inherit",
              ...mobileType.primary,
              color: "var(--ax-colors-fg-default)",
            }}
          />
          <Button
            appearance="subtle"
            size="sm"
            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
            style={{ ...mobileType.secondary, color: "var(--ax-colors-fg-tertiary)", height: 28, padding: "0 8px" }}
          >
            Cancel
          </Button>
        </Box>
      )}
      {searchOpen && searchQuery && (
        <Box
          px="16"
          py="4"
          style={{ flexShrink: 0, background: "var(--ax-colors-bg-secondary)" }}
        >
          <Text color="fg.tertiary" style={{ ...mobileType.meta }}>
            {displayedMessages.length} result{displayedMessages.length !== 1 ? "s" : ""}
          </Text>
        </Box>
      )}

      {/* ── Message list ────────────────────────────────────────────── */}
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 12px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          scrollBehavior: "smooth",
        }}
      >
        {/* Date separator */}
        <Box display="flex" alignItems="center" gap="10" style={{ marginBottom: 12 }}>
          <Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-secondary)" }} />
          <Text color="fg.tertiary" style={{ whiteSpace: "nowrap", ...mobileType.meta }}>
            Today
          </Text>
          <Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-secondary)" }} />
        </Box>

        {displayedMessages.map((msg, idx) => (
          <Fragment key={msg.id}>
            <Box style={{ marginBottom: shouldGroup(displayedMessages, idx) ? 2 : 10 }}>
              <MessageBubble
                msg={msg}
                time={getMockTime(idx)}
                animationDelay={idx * 28}
                isNew={false}
              />
            </Box>
          </Fragment>
        ))}

        {typing && responder && !searchQuery && (
          <Box style={{ marginTop: 4 }}>
            <TypingIndicator
              name={responder.name}
              avatar={responder.avatar}
              color={responder.color}
            />
          </Box>
        )}

        <div style={{ height: 8 }} />
      </Box>

      {/* ── New message pill ─────────────────────────────────────────── */}
      {showPill && (
        <Box
          className="mobile-pill-pop"
          onClick={() => scrollToBottom()}
          style={{
            position: "absolute",
            bottom: 88,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--ax-colors-bg-accent)",
            color: "white",
            borderRadius: 20,
            padding: "7px 16px",
            ...mobileType.secondary,
            fontWeight: 500,
            cursor: "pointer",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            whiteSpace: "nowrap",
          }}
        >
          {newMsgCount > 0 ? `${newMsgCount} new message${newMsgCount > 1 ? "s" : ""}` : "↓ Scroll to latest"}
        </Box>
      )}

      <Composer
        placeholder={`Message ${name}…`}
        onSend={handleSend}
      />
    </Box>
  );
}

// Collapse spacing between consecutive messages from the same sender
function shouldGroup(messages: Message[], idx: number): boolean {
  if (idx === 0) return false;
  return messages[idx].from === messages[idx - 1].from &&
    messages[idx].senderName === messages[idx - 1].senderName;
}

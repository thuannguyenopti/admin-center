"use client";

import { Box, Button, Avatar, Tooltip } from "@optiaxiom/react";
import { Text } from "../Text";
import { IconXmark, IconComments } from "@optimizely/axiom-icons";
import { useState, useRef, useEffect, type KeyboardEvent } from "react";

// ── Types & mock data ──────────────────────────────────────────────────────────

type ChatMessage = {
  id: string;
  author: string;
  avatar: string;
  isMe: boolean;
  text: string;
  timestamp: Date;
  reactions?: Record<string, string[]>; // emoji → author names
};

function makeDate(minutesAgo: number) {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "1", author: "Lisa Gray",     avatar: "https://i.pravatar.cc/150?img=5",  isMe: false, text: "The intro feels a bit long — maybe trim the first paragraph?", timestamp: makeDate(8) },
  { id: "2", author: "Marcus Santos", avatar: "https://i.pravatar.cc/150?img=12", isMe: false, text: "Agreed. Also the Q3 stats in section 2 need to be updated.",      timestamp: makeDate(6) },
  { id: "3", author: "You",           avatar: "",                                  isMe: true,  text: "On it! Updating those now.",                                       timestamp: makeDate(3), reactions: { "👍": ["Lisa Gray"] } },
];

const QUICK_REACTIONS = ["👍", "✅", "🔥", "😂", "❤️"];

function relativeTime(date: Date): string {
  const diffMs  = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1)  return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24)  return `${diffHr}h ago`;
  return date.toLocaleDateString();
}

// ── Component ──────────────────────────────────────────────────────────────────

type CollabRailProps = {
  open: boolean;
  onClose?: () => void;
};

export function CollabRail({ open, onClose }: CollabRailProps) {
  const [messages, setMessages]       = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft]             = useState("");
  const [hoveredId, setHoveredId]     = useState<string | null>(null);
  const [emojiPickerId, setEmojiPickerId] = useState<string | null>(null);
  const [isTyping, setIsTyping]       = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Simulate Lisa typing after 4s, then sending a follow-up
  useEffect(() => {
    const t1 = setTimeout(() => setIsTyping(true), 4000);
    const t2 = setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          author: "Lisa Gray",
          avatar: "https://i.pravatar.cc/150?img=5",
          isMe: false,
          text: "Also — the CTA at the end could be punchier. Maybe something like 'Start your AI content audit today'?",
          timestamp: new Date(),
        },
      ]);
    }, 7500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), author: "You", avatar: "", isMe: true, text, timestamp: new Date() },
    ]);
    setDraft("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const toggleReaction = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const existing = m.reactions?.[emoji] ?? [];
      const hasMe = existing.includes("You");
      const next = hasMe ? existing.filter(n => n !== "You") : [...existing, "You"];
      const reactions = { ...(m.reactions ?? {}), [emoji]: next };
      // clean up empty
      if (reactions[emoji].length === 0) delete reactions[emoji];
      return { ...m, reactions };
    }));
    setEmojiPickerId(null);
  };

  // Group consecutive messages from the same author
  const grouped = messages.map((msg, i) => {
    const prev = messages[i - 1];
    const isGrouped = !!prev && prev.author === msg.author &&
      (msg.timestamp.getTime() - prev.timestamp.getTime()) < 3 * 60 * 1000;
    return { msg, isGrouped };
  });

  return (
    <Box
      style={{
        width: open ? 360 : 0,
        flexShrink: 0,
        overflow: "hidden",
        transition: "width 0.35s cubic-bezier(0, 1, 0, 1)",
        borderLeft: open ? "1px solid var(--ax-colors-border-secondary)" : "none",
        height: "100%",
        background: "var(--ax-colors-bg-default)",
      }}
    >
      {/* Inner 360px container */}
      <Box display="flex" flexDirection="column" style={{ width: 360, height: "100%" }}>

        {/* Header */}
        <Box display="flex" alignItems="center" gap="8" px="16" style={{ height: 48, flexShrink: 0, borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
          <IconComments size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
          <Text fontWeight="500" color="fg.default" style={{ fontSize: 14 }}>Thread</Text>
          {/* Active presence dots */}
          <Box display="flex" alignItems="center" gap="4" style={{ marginLeft: 4 }}>
            {[
              { src: "https://i.pravatar.cc/150?img=5",  name: "Lisa Gray"     },
              { src: "https://i.pravatar.cc/150?img=12", name: "Marcus Santos" },
            ].map(c => (
              <Tooltip key={c.name} content={c.name} delayDuration={300}>
                <span style={{ position: "relative", display: "inline-flex" }}>
                  <img src={c.src} alt={c.name} style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid white" }} />
                  <span style={{ position: "absolute", bottom: -1, right: -1, width: 7, height: 7, borderRadius: "50%", background: "#22c55e", border: "1.5px solid white" }} />
                </span>
              </Tooltip>
            ))}
          </Box>
          <Box style={{ flex: 1 }} />
          {onClose && (
            <Tooltip content="Close" delayDuration={300}>
              <span>
                <Button appearance="subtle" size="sm" icon={<IconXmark size={14} />} aria-label="Close thread" onClick={onClose} style={{ width: 28, height: 28, padding: 0 }} />
              </span>
            </Tooltip>
          )}
        </Box>

        {/* Message list */}
        <Box
          ref={listRef}
          display="flex"
          flexDirection="column"
          py="8"
          style={{ flex: 1, overflowY: "auto", minHeight: 0, gap: 0 }}
        >
          {grouped.map(({ msg, isGrouped }, idx) => (
            <Box
              key={msg.id}
              onMouseEnter={() => setHoveredId(msg.id)}
              onMouseLeave={() => { setHoveredId(null); setEmojiPickerId(null); }}
              style={{
                position: "relative",
                paddingTop: isGrouped ? 2 : (idx === 0 ? 4 : 10),
                paddingBottom: 2,
                paddingLeft: 12,
                paddingRight: 12,
              }}
            >
              <Box
                display="flex"
                gap="8"
                alignItems="end"
                style={{ flexDirection: msg.isMe ? "row-reverse" as const : "row" as const }}
              >
                {/* Avatar — only on first in group */}
                {!msg.isMe && (
                  <Box style={{ width: 28, flexShrink: 0, alignSelf: "flex-end", marginBottom: 2 }}>
                    {!isGrouped && (
                      <Avatar name={msg.author} src={msg.avatar} size="xs" />
                    )}
                  </Box>
                )}

                {/* Bubble + meta */}
                <Box display="flex" flexDirection="column" gap="2" style={{ maxWidth: "75%" }}>
                  {/* Author name — only on first in group */}
                  {!msg.isMe && !isGrouped && (
                    <Text color="fg.secondary" style={{ fontSize: 11, fontWeight: 600, paddingLeft: 2 }}>
                      {msg.author}
                    </Text>
                  )}

                  <Box
                    style={{
                      padding: "7px 12px",
                      borderRadius: 10,
                      fontSize: 13,
                      lineHeight: 1.5,
                      background: msg.isMe
                        ? "var(--opal-user-message, #e4f0da)"
                        : "var(--ax-colors-bg-secondary)",
                      color: "var(--ax-colors-fg-default)",
                      borderBottomRightRadius: msg.isMe ? 3 : undefined,
                      borderBottomLeftRadius:  !msg.isMe ? 3 : undefined,
                    }}
                  >
                    {msg.text}
                  </Box>

                  {/* Reactions */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <Box display="flex" gap="4" style={{ flexWrap: "wrap", marginTop: 2 }}>
                      {Object.entries(msg.reactions).map(([emoji, authors]) =>
                        authors.length > 0 ? (
                          <Tooltip key={emoji} content={authors.join(", ")} delayDuration={200}>
                            <button
                              onClick={() => toggleReaction(msg.id, emoji)}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 3,
                                padding: "2px 7px", borderRadius: 12,
                                background: authors.includes("You") ? "#e4f0da" : "var(--ax-colors-bg-secondary)",
                                border: `1px solid ${authors.includes("You") ? "#b4d9a0" : "var(--ax-colors-border-secondary)"}`,
                                fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                              }}
                            >
                              {emoji}
                              <span style={{ fontSize: 11, color: "var(--ax-colors-fg-secondary)" }}>{authors.length}</span>
                            </button>
                          </Tooltip>
                        ) : null
                      )}
                    </Box>
                  )}

                  {/* Timestamp — show on last in group or on hover */}
                  {(hoveredId === msg.id || grouped[idx + 1]?.msg.author !== msg.author) && (
                    <Text color="fg.tertiary" style={{ fontSize: 10, paddingLeft: msg.isMe ? 0 : 2, textAlign: msg.isMe ? "right" : "left" }}>
                      {relativeTime(msg.timestamp)}
                    </Text>
                  )}
                </Box>
              </Box>

              {/* Hover action toolbar */}
              {hoveredId === msg.id && (
                <Box
                  onMouseDown={e => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    ...(msg.isMe ? { left: 12 } : { right: 12 }),
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    background: "white",
                    border: "1px solid var(--ax-colors-border-secondary)",
                    borderRadius: 20,
                    padding: "3px 6px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                    zIndex: 10,
                  }}
                >
                  {/* Quick emoji trigger */}
                  <Tooltip content="React" delayDuration={300}>
                    <button
                      onClick={() => setEmojiPickerId(id => id === msg.id ? null : msg.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "0 3px", lineHeight: 1 }}
                    >
                      😀
                    </button>
                  </Tooltip>
                  {/* Reply */}
                  <Tooltip content="Reply" delayDuration={300}>
                    <button
                      onClick={() => setDraft(`@${msg.isMe ? "You" : msg.author.split(" ")[0]} `)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "0 3px", lineHeight: 1, color: "var(--ax-colors-fg-secondary)" }}
                    >
                      ↩
                    </button>
                  </Tooltip>
                  {/* More */}
                  <Tooltip content="More" delayDuration={300}>
                    <button
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "0 3px", lineHeight: 1, color: "var(--ax-colors-fg-secondary)", letterSpacing: 1 }}
                    >
                      •••
                    </button>
                  </Tooltip>
                </Box>
              )}

              {/* Emoji picker popover */}
              {emojiPickerId === msg.id && (
                <Box
                  onMouseDown={e => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    top: "calc(50% - 60px)",
                    ...(msg.isMe ? { left: 12 } : { right: 12 }),
                    display: "flex",
                    gap: 4,
                    background: "white",
                    border: "1px solid var(--ax-colors-border-secondary)",
                    borderRadius: 20,
                    padding: "5px 8px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    zIndex: 20,
                  }}
                >
                  {QUICK_REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => toggleReaction(msg.id, emoji)}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 18, padding: "2px 3px", borderRadius: 6,
                        transition: "transform 0.1s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.3)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                    >
                      {emoji}
                    </button>
                  ))}
                </Box>
              )}
            </Box>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <Box display="flex" alignItems="end" gap="8" style={{ padding: "6px 12px 4px" }}>
              <Avatar name="Lisa Gray" src="https://i.pravatar.cc/150?img=5" size="xs" style={{ flexShrink: 0, marginBottom: 2 }} />
              <Box style={{
                padding: "9px 14px",
                borderRadius: 10,
                borderBottomLeftRadius: 3,
                background: "var(--ax-colors-bg-secondary)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}>
                <style>{`
                  @keyframes typingBounce {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-4px); opacity: 1; }
                  }
                `}</style>
                {[0, 1, 2].map(i => (
                  <Box key={i} style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "var(--ax-colors-fg-tertiary)",
                    animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Composer */}
        <Box px="12" py="10" style={{ flexShrink: 0, borderTop: "1px solid var(--ax-colors-border-secondary)" }}>
          <Box
            display="flex"
            alignItems="center"
            gap="8"
            style={{
              border: "1px solid var(--ax-colors-border-default, #d8e4cb)",
              borderRadius: 8,
              padding: "6px 10px",
              background: "var(--ax-colors-bg-default)",
            }}
          >
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reply in thread…"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 13,
                color: "var(--ax-colors-fg-default)",
                fontFamily: "inherit",
              }}
            />
            <Button
              appearance="primary"
              size="sm"
              onClick={handleSend}
              disabled={!draft.trim()}
              style={{ flexShrink: 0, padding: "0 10px", height: 28 }}
            >
              Send
            </Button>
          </Box>
        </Box>

      </Box>
    </Box>
  );
}

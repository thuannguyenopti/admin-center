"use client";

import { useState, useRef } from "react";
import { Box, Text, Avatar, Button } from "@optiaxiom/react";
import { IconFileLines, IconArrowUpRightFromSquare } from "@optiaxiom/icons";
import { type Message, type Reaction, QUICK_EMOJIS, PRESENCE_COLOR, type PresenceStatus } from "../data";
import { mobileType } from "../typography";

type Props = {
  msg: Message;
  time: string;
  animationDelay?: number;
  isNew?: boolean;
};

type LiveReaction = Reaction & { mine: boolean; animating: boolean };

export function MessageBubble({ msg, time, animationDelay = 0, isNew = false }: Props) {
  const isUser = msg.from === "user";
  const isVAU  = msg.from === "vau";

  const [reactions, setReactions] = useState<LiveReaction[]>(
    (msg.reactions ?? []).map((r) => ({ ...r, mine: false, animating: false })),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pressed, setPressed] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleReaction = (emoji: string) => {
    setPickerOpen(false);
    setReactions((prev) => {
      const idx = prev.findIndex((r) => r.emoji === emoji);
      if (idx >= 0) {
        const r = prev[idx];
        const newCount = r.mine ? r.count - 1 : r.count + 1;
        if (newCount === 0) return prev.filter((_, i) => i !== idx);
        return prev.map((r, i) =>
          i === idx ? { ...r, count: newCount, mine: !r.mine, animating: !r.mine } : r,
        );
      }
      return [...prev, { emoji, count: 1, mine: true, animating: true }];
    });
    setTimeout(() => {
      setReactions((prev) => prev.map((r) => ({ ...r, animating: false })));
    }, 400);
  };

  const handleMouseDown = () => {
    longPressTimer.current = setTimeout(() => setPressed(true), 400);
  };
  const handleMouseUp = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    setTimeout(() => setPressed(false), 120);
  };

  const animClass = isNew ? "mobile-bubble-in" : "mobile-bubble-stagger";

  if (msg.type === "attachment") {
    return (
      <Box
        display="flex"
        gap="8"
        alignItems="start"
        justifyContent="flex-end"
        className={animClass}
        style={{ animationDelay: `${animationDelay}ms`, paddingBottom: 4 }}
      >
        <Box display="flex" flexDirection="column" alignItems="end" gap="4">
          <Box
            style={{
              background: "var(--ax-colors-bg-default)",
              border: "1px solid var(--ax-colors-border-default)",
              borderRadius: 16,
              padding: "12px 14px",
              maxWidth: 260,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              cursor: "pointer",
              transform: pressed ? "scale(0.97)" : "scale(1)",
              transition: "transform 0.12s ease",
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            <Box display="flex" alignItems="start" gap="10">
              <Box
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "var(--ax-colors-bg-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconFileLines style={{ width: 18, height: 18, color: "var(--ax-colors-fg-secondary)" }} />
              </Box>
              <Box style={{ minWidth: 0 }}>
                <Text
                  fontSize="md"
                  fontWeight="500"
                  color="fg.default"
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {msg.attachment!.title}
                </Text>
                <Text fontSize="sm" color="fg.tertiary">{msg.attachment!.file}</Text>
              </Box>
            </Box>
            <Button appearance="default" size="sm" icon={<IconArrowUpRightFromSquare />} iconPosition="end">
              Preview
            </Button>
          </Box>
          <Text fontSize="sm" color="fg.tertiary" style={{ paddingRight: 4 }}>{time}</Text>
        </Box>
        <Box pt="6" style={{ flexShrink: 0 }}>
          <Avatar name="Me" src={msg.senderAvatar} size="sm" />
        </Box>
      </Box>
    );
  }

  if (isUser) {
    return (
      <Box
        display="flex"
        gap="8"
        alignItems="end"
        justifyContent="flex-end"
        className={animClass}
        style={{ animationDelay: `${animationDelay}ms`, paddingBottom: reactions.length > 0 ? 20 : 4 }}
      >
        <Box display="flex" flexDirection="column" alignItems="end" style={{ position: "relative" }}>
          <Box
            style={{
              background: "#e4f0da",
              borderRadius: "18px 18px 4px 18px",
              padding: "10px 14px",
              maxWidth: 260,
              ...mobileType.primary,
              lineHeight: 1.55,
              color: "var(--ax-colors-fg-default)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              cursor: "pointer",
              transform: pressed ? "scale(0.97)" : "scale(1)",
              transition: "transform 0.12s ease",
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            {msg.text}
          </Box>
          <Text fontSize="sm" color="fg.tertiary" style={{ marginTop: 3, paddingRight: 4 }}>{time}</Text>
          {/* Reactions */}
          {(reactions.length > 0 || pickerOpen) && (
            <Box
              style={{
                position: "absolute",
                bottom: -18,
                right: 0,
                display: "flex",
                gap: 4,
                flexWrap: "wrap",
                justifyContent: "flex-end",
                zIndex: 5,
              }}
            >
              {reactions.map((r) => (
                <ReactionChip
                  key={r.emoji}
                  emoji={r.emoji}
                  count={r.count}
                  mine={r.mine}
                  animating={r.animating}
                  onToggle={() => toggleReaction(r.emoji)}
                />
              ))}
              <EmojiPickerButton open={pickerOpen} onToggle={() => setPickerOpen((v) => !v)} onSelect={toggleReaction} />
            </Box>
          )}
        </Box>
        <Box pb="20" style={{ flexShrink: 0 }}>
          <Avatar name="Me" src={msg.senderAvatar} size="sm" />
        </Box>
      </Box>
    );
  }

  // Human / VAU (left side)
  return (
    <Box
      display="flex"
      gap="10"
      alignItems="end"
      className={animClass}
      style={{ animationDelay: `${animationDelay}ms`, paddingBottom: reactions.length > 0 ? 20 : 4 }}
    >
      <Box pb="20" style={{ flexShrink: 0 }}>
        {isVAU ? (
          <Box
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: msg.senderColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "white",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {msg.senderName?.[0]}
          </Box>
        ) : (
          <Avatar name={msg.senderName || ""} src={msg.senderAvatar} size="sm" />
        )}
      </Box>
      <Box style={{ display: "flex", flexDirection: "column", position: "relative" }}>
        {msg.senderName && (
          <Text
            fontSize="sm"
            fontWeight="500"
            color={isVAU ? undefined : "fg.secondary"}
            style={{
              marginBottom: 3,
              color: isVAU ? msg.senderColor : undefined,
            }}
          >
            {msg.senderName}
          </Text>
        )}
        <Box
          style={{
            background: "var(--ax-colors-bg-secondary)",
            borderRadius: "4px 18px 18px 18px",
            padding: "10px 14px",
            maxWidth: 260,
            ...mobileType.primary,
            lineHeight: 1.55,
            color: "var(--ax-colors-fg-default)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            cursor: "pointer",
            transform: pressed ? "scale(0.97)" : "scale(1)",
            transition: "transform 0.12s ease",
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          {msg.text}
        </Box>
        <Text fontSize="sm" color="fg.tertiary" style={{ marginTop: 3 }}>{time}</Text>
        {(reactions.length > 0 || pickerOpen) && (
          <Box
            style={{
              position: "absolute",
              bottom: -18,
              left: 0,
              display: "flex",
              gap: 4,
              flexWrap: "wrap",
              zIndex: 5,
            }}
          >
            {reactions.map((r) => (
              <ReactionChip
                key={r.emoji}
                emoji={r.emoji}
                count={r.count}
                mine={r.mine}
                animating={r.animating}
                onToggle={() => toggleReaction(r.emoji)}
              />
            ))}
            <EmojiPickerButton open={pickerOpen} onToggle={() => setPickerOpen((v) => !v)} onSelect={toggleReaction} align="left" />
          </Box>
        )}
      </Box>
    </Box>
  );
}

function ReactionChip({
  emoji, count, mine, animating, onToggle,
}: {
  emoji: string;
  count: number;
  mine: boolean;
  animating: boolean;
  onToggle: () => void;
}) {
  return (
    <Box
      onClick={onToggle}
      className={animating ? "mobile-reaction-add" : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 8px",
        borderRadius: 12,
        cursor: "pointer",
        fontSize: 13,
        userSelect: "none",
        border: mine
          ? "1.5px solid var(--ax-colors-border-accent)"
          : "1px solid var(--ax-colors-border-secondary)",
        background: mine ? "var(--ax-colors-bg-accent-subtle)" : "var(--ax-colors-bg-default)",
        transition: "transform 0.1s ease",
      }}
    >
      <span>{emoji}</span>
      <span style={{ ...mobileType.meta, color: "var(--ax-colors-fg-secondary)" }}>{count}</span>
    </Box>
  );
}

function EmojiPickerButton({
  open, onToggle, onSelect, align = "right",
}: {
  open: boolean;
  onToggle: () => void;
  onSelect: (e: string) => void;
  align?: "left" | "right";
}) {
  return (
    <Box style={{ position: "relative" }}>
      <Box
        onClick={onToggle}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 24,
          borderRadius: 12,
          cursor: "pointer",
          fontSize: 13,
          border: "1px solid var(--ax-colors-border-secondary)",
          background: "var(--ax-colors-bg-default)",
          color: "var(--ax-colors-fg-tertiary)",
          transition: "background 0.12s",
        }}
      >
        +
      </Box>
      {open && (
        <Box
          style={{
            position: "absolute",
            bottom: 32,
            ...(align === "right" ? { right: 0 } : { left: 0 }),
            display: "flex",
            gap: 6,
            padding: "8px 12px",
            borderRadius: 16,
            zIndex: 20,
            background: "var(--ax-colors-bg-default)",
            border: "1px solid var(--ax-colors-border-secondary)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          }}
        >
          {QUICK_EMOJIS.map((e) => (
            <span
              key={e}
              onClick={() => onSelect(e)}
              style={{ cursor: "pointer", fontSize: 20, padding: "0 2px", lineHeight: 1 }}
            >
              {e}
            </span>
          ))}
        </Box>
      )}
    </Box>
  );
}

// Presence dot used in header
export function PresenceDot({ status }: { status: PresenceStatus }) {
  return (
    <Box
      className={status === "active" ? "mobile-presence-active" : undefined}
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: PRESENCE_COLOR[status],
        border: "2px solid var(--ax-colors-bg-default)",
      }}
    />
  );
}

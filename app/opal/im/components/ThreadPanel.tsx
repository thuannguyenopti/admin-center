"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconXmark, IconArrowUp } from "@optiaxiom/icons";
import { OpalMessage } from "@/app/components/Opal/OpalMessage";
import { imToChatMessage } from "../lib/adapters";
import { useIMThread } from "../hooks/useIMThread";
import { formatQuoteMarkdown } from "../lib/quote";
import type { IMMessage } from "../lib/types";

type Props = {
  thread: ReturnType<typeof useIMThread>;
  currentUserId: string;
  conversationName: string;
};

export function ThreadPanel({ thread, currentUserId, conversationName }: Props) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [quotedId, setQuotedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const allMessages = useMemo(
    () => [thread.parent, ...thread.replies].filter((m): m is IMMessage => !!m),
    [thread.parent, thread.replies],
  );
  const quotedMessage = quotedId
    ? allMessages.find((m) => m.id === quotedId) ?? null
    : null;

  // Clear quote when the thread changes or closes.
  useEffect(() => {
    setQuotedId(null);
  }, [thread.parentMessageId]);

  const parentChat = useMemo(
    () => (thread.parent ? imToChatMessage(thread.parent, thread.profiles) : null),
    [thread.parent, thread.profiles],
  );
  const replyChats = useMemo(
    () => thread.replies.map((m) => imToChatMessage(m, thread.profiles)),
    [thread.replies, thread.profiles],
  );

  useEffect(() => {
    if (!thread.isOpen) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [thread.isOpen, replyChats.length]);

  if (!thread.isOpen) return null;

  const handleSend = async () => {
    const value = input.trim();
    if (!value || sending) return;
    setSending(true);
    setInput("");
    const quoteToSend = quotedMessage;
    setQuotedId(null);
    try {
      const finalContent = quoteToSend
        ? formatQuoteMarkdown(quoteToSend, thread.profiles) + value
        : value;
      await thread.sendReply(finalContent);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes threadPanelSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
      <Box
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          background: "var(--ax-colors-bg-default)",
          borderLeft: "1px solid var(--ax-colors-border-secondary)",
          boxShadow: "-12px 0 24px rgba(0,0,0,0.06)",
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
          animation: "threadPanelSlideIn 0.25s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px="16"
          py="12"
          style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}
        >
          <Box>
            <Text fontWeight="600" fontSize="md">
              Thread
            </Text>
            <Text fontSize="sm" color="fg.tertiary">
              {conversationName}
            </Text>
          </Box>
          <Button
            appearance="subtle"
            size="sm"
            icon={<IconXmark />}
            aria-label="Close thread"
            onClick={thread.close}
          />
        </Box>

        {/* Body */}
        <Box
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {parentChat && (
            <OpalMessage
              message={parentChat}
              imMode
              currentUserId={currentUserId}
              onQuoteReply={(id) => setQuotedId(id)}
            />
          )}
          <Box
            display="flex"
            alignItems="center"
            gap="8"
            my="8"
            style={{ flexShrink: 0 }}
          >
            <Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-secondary)" }} />
            <Text fontSize="sm" color="fg.tertiary">
              {replyChats.length === 0
                ? "No replies yet"
                : `${replyChats.length} ${replyChats.length === 1 ? "reply" : "replies"}`}
            </Text>
            <Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-secondary)" }} />
          </Box>
          {replyChats.map((m) => (
            <OpalMessage
              key={m.id}
              message={m}
              imMode
              currentUserId={currentUserId}
              onQuoteReply={(id) => setQuotedId(id)}
            />
          ))}
        </Box>

        {/* Composer */}
        <Box
          display="flex"
          flexDirection="column"
          gap="8"
          px="12"
          py="12"
          style={{ borderTop: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}
        >
          <Box display="flex" alignItems="center" gap="8">
            <Box
              style={{
                flex: 1,
                border: "1px solid var(--opal-border-input)",
                borderRadius: 8,
                background: "var(--ax-colors-bg-default)",
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {quotedMessage && (
                <Box
                  display="flex"
                  alignItems="start"
                  gap="8"
                  style={{
                    borderLeft: "3px solid var(--ax-colors-bg-accent)",
                    background: "var(--ax-colors-bg-secondary)",
                    borderRadius: 4,
                    padding: "6px 8px",
                  }}
                >
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text fontSize="sm" fontWeight="600" color="fg.default">
                      {thread.profiles[quotedMessage.sender_id] ?? quotedMessage.sender_id}
                    </Text>
                    <Text
                      fontSize="sm"
                      color="fg.tertiary"
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {quotedMessage.content}
                    </Text>
                  </Box>
                  <Button
                    appearance="subtle"
                    size="sm"
                    icon={<IconXmark size={14} />}
                    aria-label="Remove quote"
                    onClick={() => setQuotedId(null)}
                    style={{ width: 24, height: 24, padding: 0, minWidth: "auto", flexShrink: 0 }}
                  />
                </Box>
              )}
              <input
                type="text"
                placeholder={quotedMessage ? "Reply to quote..." : "Reply..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                disabled={sending}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 14,
                  color: "var(--opal-text-body)",
                  fontFamily: "var(--ax-fontFamily-sans, sans-serif)",
                }}
              />
            </Box>
            <Button
              appearance="primary"
              size="md"
              icon={<IconArrowUp />}
              aria-label="Send reply"
              disabled={!input.trim() || sending}
              onClick={() => void handleSend()}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
}

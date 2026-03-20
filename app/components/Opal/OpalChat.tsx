"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "../Text";
import { OpalMessage } from "./OpalMessage";
import { OpalSuggestions } from "./OpalSuggestions";
import { ChatMessage } from "@/app/hooks/useOpalState";
import { useEffect, useMemo, useRef } from "react";
import { opalTypography } from "@/app/styles/opalTypography";
import { useOpalContext } from "@/app/context/OpalContext";

type OpalChatProps = {
  messages: ChatMessage[];
  onSuggestionClick: (suggestion: string) => void;
  onRegenerate?: (id: string) => void;
  onVersionChange?: (id: string, versionIndex: number, content: string) => void;
  hideSuggestions?: boolean;
  variant?: 'assistant' | 'home';
  collapsedSessionIds?: Set<string>;
  onExpandSession?: (sessionStartId: string) => void;
};

export function OpalChat({ messages, onSuggestionClick, onRegenerate, onVersionChange, hideSuggestions, variant = 'assistant', collapsedSessionIds, onExpandSession }: OpalChatProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  let opalContext;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    opalContext = useOpalContext();
  } catch (e) {
    // Context might not be available in panel (assistant) mode
  }

  const isCMS = opalContext?.currentPage?.path?.startsWith('/cms') ||
    opalContext?.currentPage?.productArea?.includes('CMS');

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  // Compute per-message rendering context (agent header, opal header, collapsed)
  const augmented = useMemo(() => {
    const skipSet = new Set<number>();
    const collapsedAtIndex = new Map<number, { emoji: string; name: string; startId: string }>();

    if (collapsedSessionIds?.size) {
      messages.forEach((msg, i) => {
        if (msg.role === 'event' && msg.eventType === 'agent-start' && collapsedSessionIds.has(msg.id)) {
          let endIdx = -1;
          for (let j = i + 1; j < messages.length; j++) {
            if (messages[j].role === 'event' && messages[j].eventType === 'agent-end') {
              endIdx = j;
              break;
            }
          }
          collapsedAtIndex.set(i, { emoji: msg.agentEmoji!, name: msg.agentName!, startId: msg.id });
          for (let j = i + 1; j <= (endIdx >= 0 ? endIdx : messages.length - 1); j++) {
            skipSet.add(j);
          }
        }
      });
    }

    let agentCtx: { emoji: string; name: string } | null = null;
    let nextAssistantShowsOpal = false;

    return messages.map((msg, i) => {
      if (collapsedAtIndex.has(i)) {
        agentCtx = null;
        nextAssistantShowsOpal = true;
        return { message: msg, skip: false, collapsed: collapsedAtIndex.get(i), agentContext: null, showOpalHeader: false };
      }

      if (skipSet.has(i)) {
        if (msg.role === 'event' && msg.eventType === 'agent-end') {
          agentCtx = null;
          nextAssistantShowsOpal = true;
        }
        return { message: msg, skip: true, collapsed: undefined, agentContext: null, showOpalHeader: false };
      }

      if (msg.role === 'event') {
        if (msg.eventType === 'agent-start') {
          agentCtx = { emoji: msg.agentEmoji!, name: msg.agentName! };
          nextAssistantShowsOpal = false;
        } else if (msg.eventType === 'agent-end') {
          agentCtx = null;
          nextAssistantShowsOpal = true;
        }
        return { message: msg, skip: false, collapsed: undefined, agentContext: null, showOpalHeader: false };
      }

      let showOpalHeader = false;
      if (msg.role === 'assistant' && nextAssistantShowsOpal) {
        nextAssistantShowsOpal = false;
        showOpalHeader = true;
      }

      const result = { message: msg, skip: false, collapsed: undefined, agentContext: agentCtx ? { ...agentCtx } : null, showOpalHeader };
      return result;
    });
  }, [messages, collapsedSessionIds]);

  const hasMessages = messages.length > 0;

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="16"
      p={variant === 'assistant' ? "16" : "0"}
      style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: '300px',
        width: '100%',
      }}
    >
      {!hasMessages ? (
        !hideSuggestions && (
          <>
            <Text
              style={{
                ...opalTypography.body,
                margin: 0,
                color: 'var(--opal-text-body)',
              }}
            >
              Hi, I&apos;m Opal, Optimizely&apos;s AI. I can help answer your questions about using Optimizely, analyze your website and suggest effective tests, plus do web research to boost conversions.
              <br /><br />
              What can I help you with?
            </Text>
            <OpalSuggestions onSuggestionClick={onSuggestionClick} type={isCMS ? 'cms' : 'default'} />
          </>
        )
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          gap="16"
          w="full"
          style={{
            maxWidth: variant === 'home' ? '768px' : 'none',
            margin: variant === 'home' ? '0 auto' : '0',
            width: '100%',
          }}
        >
          {augmented.map(({ message, skip, collapsed, agentContext, showOpalHeader }) => {
            if (skip) return null;
            if (collapsed) {
              return (
                <button
                  key={message.id}
                  onClick={() => onExpandSession?.(collapsed.startId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: '1px solid #e9edf5',
                    background: '#f9fafc',
                    cursor: 'pointer',
                    color: '#4f576e',
                    fontSize: 13,
                    fontFamily: 'Inter, sans-serif',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 15 }}>{collapsed.emoji}</span>
                  <span>Conversation with {collapsed.name}</span>
                  <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 12 }}>›</span>
                </button>
              );
            }
            return (
              <OpalMessage
                key={message.id}
                message={message}
                agentContext={agentContext}
                showOpalHeader={showOpalHeader}
                onRegenerate={onRegenerate}
                onVersionChange={onVersionChange}
              />
            );
          })}
        </Box>
      )}
      <div ref={chatEndRef} />
    </Box>
  );
}

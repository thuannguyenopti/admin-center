"use client";

import { Alert, Box, Disclosure, DisclosureContent, DisclosureTrigger } from "@optiaxiom/react";
import { Text } from "../Text";
import { OpalMessage } from "./OpalMessage";
import { OpalSuggestions } from "./OpalSuggestions";
import { ChatMessage } from "@/app/hooks/useOpalState";
import { useEffect, useMemo, useRef, useState } from "react";
import { opalTypography } from "@/app/styles/opalTypography";
import { useOpalContext } from "@/app/context/OpalContext";

type OpalChatProps = {
  messages: ChatMessage[];
  onSuggestionClick: (suggestion: string) => void;
  onSubmitPrompt?: (message: string) => void;
  streamingMode?: "collapsed" | "expanded";
  threadKey?: string | null;
  isLoading?: boolean;
  onRegenerate?: (id: string) => void;
  onVersionChange?: (id: string, versionIndex: number, content: string) => void;
  hideSuggestions?: boolean;
  variant?: 'assistant' | 'home';
  collapsedSessionIds?: Set<string>;
  onExpandSession?: (sessionStartId: string) => void;
  opalDisclosureIds?: Set<string>;
  opalClosedIds?: Set<string>;
  collapsingOpalEndId?: string | null;
  highlightedOpalEndId?: string | null;
  onOpenOpalRange?: (agentEndId: string) => void;
  onCloseOpalRange?: (agentEndId: string) => void;
  activeAgentCtx?: { emoji: string; name: string } | null;
  contextChip?: string | null;
  contextualActionCard?: React.ReactNode;
  /** Cards keyed by cardAfterKey — rendered inline below the matching message */
  messageCards?: Record<string, React.ReactNode>;
};

export function OpalChat({ messages, onSuggestionClick, onSubmitPrompt, streamingMode = "collapsed", threadKey, isLoading, onRegenerate, onVersionChange, hideSuggestions, variant = 'assistant', collapsedSessionIds, onExpandSession, opalDisclosureIds, opalClosedIds, collapsingOpalEndId, highlightedOpalEndId, onOpenOpalRange, onCloseOpalRange, activeAgentCtx, contextChip, contextualActionCard, messageCards }: OpalChatProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [streamingExpandedByThreadKey, setStreamingExpandedByThreadKey] = useState<Record<string, boolean>>({});
  let opalContext;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    opalContext = useOpalContext();
  } catch (e) {
    // Context might not be available in panel (assistant) mode
  }

  const isCMS = opalContext?.currentPage?.path?.startsWith('/cms') ||
    opalContext?.currentPage?.productArea?.includes('CMS');
  const isImageGen = opalContext?.currentPage?.path?.startsWith('/cmp/opal-studio');

  // Auto-scroll to bottom when messages or the contextual action card change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages, contextualActionCard]);

  const resolvedThreadKey = threadKey ?? "default";
  const isThreadStreamingExpanded = streamingExpandedByThreadKey[resolvedThreadKey] ?? false;

  // When a contextualActionCard is present, suppress the action bar on the last
  // assistant message so there's only one consolidated row (in the card itself).
  const lastAssistantId = contextualActionCard
    ? [...messages].reverse().find(m => m.role === 'assistant' && !m.isLoading)?.id
    : undefined;

  // Compute per-message rendering context (agent header, opal header, collapsed)
  const augmented = useMemo(() => {
    const skipSet = new Set<number>();
    const collapsedAtIndex = new Map<number, { emoji: string; name: string; startId: string }>();
    const collapsedOpalAfter = new Map<number, { agentEndId: string; agentName: string; opalRangeMessages: ChatMessage[] }>(); // agent-end idx → Opal disclosure

    // Agent session collapses
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

    // Opal conversation disclosures (between agent-end and next agent-start)
    if (opalDisclosureIds?.size) {
      messages.forEach((msg, i) => {
        if (msg.role === 'event' && msg.eventType === 'agent-end' && opalDisclosureIds.has(msg.id)) {
          let nextAgentStartIdx = messages.length;
          for (let j = i + 1; j < messages.length; j++) {
            if (messages[j].role === 'event' && messages[j].eventType === 'agent-start') {
              nextAgentStartIdx = j;
              break;
            }
          }
          // Collect the Opal range messages to render inside DisclosureContent
          const opalRangeMessages = messages.slice(i + 1, nextAgentStartIdx);
          collapsedOpalAfter.set(i, { agentEndId: msg.id, agentName: msg.agentName ?? '', opalRangeMessages });
          // Keep messages visible in the DOM while they're animating out
          if (msg.id !== collapsingOpalEndId) {
            for (let j = i + 1; j < nextAgentStartIdx; j++) {
              skipSet.add(j);
            }
          }
        }
      });
    }

    let agentCtx: { emoji: string; name: string } | null = null;
    let nextAssistantShowsOpal = false;
    let seenAgentEnd = false; // prevent activeAgentCtx fallback from leaking into Opal messages

    return messages.map((msg, i) => {
      if (collapsedAtIndex.has(i)) {
        agentCtx = null;
        nextAssistantShowsOpal = true;
        return { message: msg, skip: false, collapsed: collapsedAtIndex.get(i), collapsedOpal: undefined, agentContext: null, showOpalHeader: false };
      }

      if (skipSet.has(i)) {
        if (msg.role === 'event' && msg.eventType === 'agent-end') {
          agentCtx = null;
          nextAssistantShowsOpal = true;
        }
        return { message: msg, skip: true, collapsed: undefined, collapsedOpal: undefined, agentContext: null, showOpalHeader: false };
      }

      if (msg.role === 'event') {
        if (msg.eventType === 'agent-start') {
          agentCtx = { emoji: msg.agentEmoji!, name: msg.agentName! };
          nextAssistantShowsOpal = false;
          seenAgentEnd = false;
        } else if (msg.eventType === 'agent-end') {
          agentCtx = null;
          nextAssistantShowsOpal = true;
          seenAgentEnd = true;
        }
        const opalCollapse = collapsedOpalAfter.get(i);
        return { message: msg, skip: false, collapsed: undefined, collapsedOpal: opalCollapse, agentContext: null, showOpalHeader: false };
      }

      let showOpalHeader = false;
      if (msg.role === 'assistant' && nextAssistantShowsOpal) {
        nextAssistantShowsOpal = false;
        showOpalHeader = true;
      }

      // Fall back to activeAgentCtx only if we haven't seen an agent-end (i.e. still in agent session with no event yet)
      const resolvedCtx = agentCtx ?? (!seenAgentEnd ? (activeAgentCtx || null) : null);
      const result = { message: msg, skip: false, collapsed: undefined, collapsedOpal: undefined, agentContext: resolvedCtx ? { ...resolvedCtx } : null, showOpalHeader };
      return result;
    });
  }, [messages, collapsedSessionIds, opalDisclosureIds, collapsingOpalEndId, activeAgentCtx]);

  // Map of messageId → stagger order for tidy-up animation
  // collapseAnimScale compresses all delays so total animation ≤ 3.5 s
  const MAX_COLLAPSE_MS = 1830; // 2500ms - 670ms post-collapse overhead
  const COLLAPSE_BASE_DELAY = 500;
  const collapsingOrder = useMemo(() => {
    const order = new Map<string, number>();
    if (!collapsingOpalEndId) return order;
    let startIdx = -1;
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === 'event' && messages[i].eventType === 'agent-end' && messages[i].id === collapsingOpalEndId) {
        startIdx = i + 1;
        break;
      }
    }
    if (startIdx === -1) return order;
    let rank = 0;
    for (let i = startIdx; i < messages.length; i++) {
      if (messages[i].role === 'event' && messages[i].eventType === 'agent-start') break;
      order.set(messages[i].id, rank++);
    }
    return order;
  }, [collapsingOpalEndId, messages]);

  // Scale factor to keep total collapse animation ≤ 3.5 s when there are many messages
  const collapseAnimScale = useMemo(() => {
    const N = collapsingOrder.size;
    if (N === 0) return 1;
    const posFromBottom = N - 1;
    const rawLastAnimEnd = COLLAPSE_BASE_DELAY + (
      posFromBottom < 3
        ? posFromBottom * 500 + 600
        : 1200 + (posFromBottom - 3) * 180 + 280
    );
    return rawLastAnimEnd > MAX_COLLAPSE_MS ? MAX_COLLAPSE_MS / rawLastAnimEnd : 1;
  }, [collapsingOrder.size]);

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
        paddingBottom: contextualActionCard && hasMessages ? '24px' : undefined,
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
              {contextChip ? (
                <>
                  I can help you refine your agent&apos;s prompt template. Share the section you want to improve and tell me what you&apos;re going for. I&apos;ll suggest specific changes.
                </>
              ) : isImageGen ? (
                <>
                  Hi, I&apos;m Opal, Optimizely&apos;s AI. I can help create brand-safe visuals for campaigns, social, and event content.
                  <br /><br />
                  Tell me what image you want to create. I&apos;ll generate a first draft here, and you can decide whether to open the advanced editor.
                </>
              ) : (
                <>
                  Hi, I&apos;m Opal, Optimizely&apos;s AI. I can help answer your questions about using Optimizely, analyze your website and suggest effective tests, plus do web research to boost conversions.
                  <br /><br />
                  What can I help you with?
                </>
              )}
            </Text>
            <OpalSuggestions onSuggestionClick={onSuggestionClick} type={contextChip ? 'agent-prompt-builder' : isImageGen ? 'image-gen' : isCMS ? 'cms' : 'default'} />
            {contextualActionCard && (
              <Box
                w="full"
                style={{
                  animation: "opal-card-fade-in 180ms ease-out",
                  transformOrigin: "bottom center",
                }}
              >
                {contextualActionCard}
              </Box>
            )}
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
          {augmented.map(({ message, skip, collapsed, collapsedOpal, agentContext, showOpalHeader }) => {
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
            const tidyRank = collapsingOrder.get(message.id);
            const isTidying = tidyRank !== undefined;
            const totalTidying = collapsingOrder.size;
            // posFromBottom: 0 = bottommost message, N-1 = topmost — bottom animates first
            const posFromBottom = isTidying ? (totalTidying - 1 - (tidyRank as number)) : 0;
            const isSlow = posFromBottom < 3;
            // 500ms head-start so disclosure slide-in is visible before messages begin moving
            // First 3 from bottom: 500ms apart (500, 1000, 1500ms); rest: 180ms apart starting at 1700ms
            // collapseAnimScale compresses all timings proportionally when N is large
            const rawStaggerDelay = isTidying
              ? COLLAPSE_BASE_DELAY + (posFromBottom < 3
                ? posFromBottom * 500
                : 1200 + (posFromBottom - 3) * 180)
              : 0;
            const staggerDelay = Math.round(rawStaggerDelay * collapseAnimScale);
            const animDuration = isTidying
              ? Math.round((isSlow ? 600 : 280) * collapseAnimScale)
              : undefined;
            return (
              <Box
                key={message.id}
                display="flex"
                flexDirection="column"
                gap="8"
                className={isTidying ? (isSlow ? 'opal-pull-slow' : 'opal-pull-fast') : undefined}
                style={isTidying ? {
                  animationDelay: `${staggerDelay}ms`,
                  animationDuration: `${animDuration}ms`,
                } : undefined}
              >
                <OpalMessage
                  message={message}
                  agentContext={agentContext}
                  showOpalHeader={showOpalHeader}
                  onRegenerate={onRegenerate}
                  onVersionChange={onVersionChange}
                  onSuggestionClick={onSuggestionClick}
                  onSubmitPrompt={onSubmitPrompt}
                  streamingMode={streamingMode}
                  isStreamingExpanded={isThreadStreamingExpanded}
                  onStreamingExpandedChange={(open) =>
                    setStreamingExpandedByThreadKey((prev) => ({ ...prev, [resolvedThreadKey]: open }))
                  }
                  isOpalLoading={isLoading}
                  hideActionBar={!!lastAssistantId && message.id === lastAssistantId}
                />
                {message.cardAfterKey && messageCards?.[message.cardAfterKey] && (
                  <Box mt="4">
                    {messageCards[message.cardAfterKey]}
                  </Box>
                )}
                {collapsedOpal && (
                  <Disclosure
                    my="16"
                    className={[
                      'opal-disclosure-collect',
                      highlightedOpalEndId === collapsedOpal.agentEndId ? 'opal-disclosure-highlight' : '',
                    ].filter(Boolean).join(' ')}
                    open={!opalClosedIds?.has(collapsedOpal.agentEndId)}
                    onOpenChange={(open) => {
                      if (open) onOpenOpalRange?.(collapsedOpal.agentEndId);
                      else onCloseOpalRange?.(collapsedOpal.agentEndId);
                    }}
                  >
                    <DisclosureTrigger>
                      <Box display="flex" alignItems="center" gap="8">
                        <img src="/opal.png" style={{ width: 16, height: 16, borderRadius: 4 }} alt="" />
                        <Text color="fg.secondary" fontSize="md">Conversation with Opal</Text>
                      </Box>
                    </DisclosureTrigger>
                    <DisclosureContent>
                      <Box display="flex" flexDirection="column" gap="16" pt="8" style={{ paddingLeft: 24 }}>
                        <Alert intent="neutral">
                          {collapsedOpal.agentName} is not aware of this conversation with Opal.
                        </Alert>
                        {collapsedOpal.opalRangeMessages.map((m) => (
                          <OpalMessage
                            key={m.id}
                            message={m}
                            showOpalHeader={m.role === 'assistant'}
                            onRegenerate={onRegenerate}
                            onVersionChange={onVersionChange}
                            streamingMode={streamingMode}
                            isStreamingExpanded={isThreadStreamingExpanded}
                            onStreamingExpandedChange={(open) =>
                              setStreamingExpandedByThreadKey((prev) => ({ ...prev, [resolvedThreadKey]: open }))
                            }
                          />
                        ))}
                      </Box>
                    </DisclosureContent>
                  </Disclosure>
                )}
              </Box>
            );
          })}
          {contextualActionCard && (
            <Box
              w="full"
              style={{
                animation: "opal-card-fade-in 180ms ease-out",
                transformOrigin: "bottom center",
              }}
            >
              {contextualActionCard}
            </Box>
          )}
        </Box>
      )}
      <div ref={chatEndRef} />
      <style jsx>{`
        @keyframes opal-card-fade-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  );
}

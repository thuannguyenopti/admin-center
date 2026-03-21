"use client";

import { useState, useCallback, useMemo } from "react";
import React from "react";
import { AgentBar } from "@/app/components/Opal/AgentBar";
import { FEATURED_AGENTS, AGENT_PROMPTS, type FeaturedAgent } from "@/app/opal/opalAgents";
import type { MentionableAgent } from "@/app/components/Opal/OpalInput";
import type { ChatMessage } from "@/app/hooks/useOpalState";

type AgentSession = { agent: FeaturedAgent; state: "default" | "in-chat" | "resume"; startEventId?: string };

interface AgentChatModeDeps {
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: (v: string) => void;
  sendMessage: (content: string) => void;
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => ChatMessage;
  /** Called when the collapse animation fully completes (after "Yes" on resume). */
  onCollapseComplete?: () => void;
}

export function useAgentChatMode({
  messages,
  inputValue,
  setInputValue,
  sendMessage,
  addMessage,
  onCollapseComplete,
}: AgentChatModeDeps) {
  const [showAgents, setShowAgents] = useState(false);
  const [showAllAgents, setShowAllAgents] = useState(false);
  const [recentAgentIds, setRecentAgentIds] = useState<string[]>([]);

  const [agentSession, setAgentSession] = useState<AgentSession | null>(null);
  const [lastEndedSession, setLastEndedSession] = useState<{
    agent: FeaturedAgent;
    startEventId: string;
    endEventId: string;
  } | null>(null);
  const [collapsedSessionIds, setCollapsedSessionIds] = useState<Set<string>>(new Set());
  const [opalDisclosureIds, setOpalDisclosureIds] = useState<Set<string>>(new Set());
  const [opalClosedIds, setOpalClosedIds] = useState<Set<string>>(new Set());
  const [collapsingOpalEndId, setCollapsingOpalEndId] = useState<string | null>(null);
  const [highlightedOpalEndId, setHighlightedOpalEndId] = useState<string | null>(null);

  const handleSelectAgent = useCallback(
    (agent: MentionableAgent | FeaturedAgent) => {
      const featuredAgent =
        FEATURED_AGENTS.find((a) => a.id === agent.id) ??
        ({ ...agent, emoji: agent.emoji ?? "", subtitle: (agent as FeaturedAgent).subtitle } as FeaturedAgent);
      if (lastEndedSession?.agent.id === agent.id) {
        setAgentSession({ agent: featuredAgent, state: "resume", startEventId: lastEndedSession.startEventId });
      } else {
        setAgentSession({ agent: featuredAgent, state: "default" });
      }
      setRecentAgentIds((prev) => [agent.id, ...prev.filter((id) => id !== agent.id)]);
      // Pre-fill input with a starter prompt template — but NOT when entering resume state
      // (the prompt will be set once the user clicks "No" in handleResumeNo)
      const isResume = lastEndedSession?.agent.id === agent.id;
      if (!isResume) {
        const prompt = AGENT_PROMPTS[featuredAgent.id];
        if (prompt) setInputValue(prompt);
      }
    },
    [lastEndedSession, setInputValue]
  );

  const handleSendMessage = useCallback(
    (content?: string) => {
      const text = (content ?? inputValue).trim();
      if (!text) return;

      if (agentSession && agentSession.state === "default") {
        const startEvent = addMessage({
          role: "event",
          eventType: "agent-start",
          agentEmoji: agentSession.agent.emoji,
          agentName: agentSession.agent.name,
          content: `Started conversation with ${agentSession.agent.name}`,
        });
        setAgentSession((prev) => (prev ? { ...prev, state: "in-chat", startEventId: startEvent.id } : null));
      }

      sendMessage(text);
    },
    [agentSession, addMessage, sendMessage, inputValue]
  );

  const handleAgentDone = useCallback(() => {
    if (!agentSession) return;
    const endEvent = addMessage({
      role: "event",
      eventType: "agent-end",
      agentEmoji: agentSession.agent.emoji,
      agentName: agentSession.agent.name,
      content: `Ended conversation with ${agentSession.agent.name}`,
    });
    setLastEndedSession(
      agentSession.startEventId
        ? { agent: agentSession.agent, startEventId: agentSession.startEventId, endEventId: endEvent.id }
        : null
    );
    setAgentSession(null);
  }, [agentSession, addMessage]);

  const handleResumeYes = useCallback(() => {
    if (!agentSession) return;
    if (lastEndedSession?.endEventId) {
      const endId = lastEndedSession.endEventId;
      setOpalDisclosureIds((prev) => new Set([...prev, endId]));
      setOpalClosedIds((prev) => new Set([...prev, endId]));
      setCollapsingOpalEndId(endId);

      const BASE_DELAY = 500;
      // Maximum ms allowed for the collapse animation (3500ms total - 670ms post-collapse overhead)
      const MAX_COLLAPSE_MS = 1830;
      const endIdx = messages.findIndex(
        (m) => m.role === "event" && m.eventType === "agent-end" && m.id === endId
      );
      let opalRangeCount = 0;
      if (endIdx !== -1) {
        for (let i = endIdx + 1; i < messages.length; i++) {
          if (messages[i].role === "event" && messages[i].eventType === "agent-start") break;
          opalRangeCount++;
        }
      }
      const N = opalRangeCount;
      let lastAnimEnd = 0;
      if (N > 0) {
        const posFromBottom = N - 1;
        if (posFromBottom < 3) {
          lastAnimEnd = BASE_DELAY + posFromBottom * 500 + 600;
        } else {
          lastAnimEnd = BASE_DELAY + 1200 + (posFromBottom - 3) * 180 + 280;
        }
      }
      // Cap total animation at 2.5 s — OpalChat scales per-message delays proportionally
      lastAnimEnd = Math.min(lastAnimEnd, MAX_COLLAPSE_MS);
      setTimeout(() => {
        setCollapsingOpalEndId(null);
        setHighlightedOpalEndId(endId);
        setTimeout(() => {
          setHighlightedOpalEndId(null);
          onCollapseComplete?.();
        }, 550);
      }, lastAnimEnd + 120);
    }
    const startEvent = addMessage({
      role: "event",
      eventType: "agent-start",
      agentEmoji: agentSession.agent.emoji,
      agentName: agentSession.agent.name,
      content: `Started conversation with ${agentSession.agent.name}`,
    });
    setAgentSession({ agent: agentSession.agent, state: "in-chat", startEventId: startEvent.id });
    setLastEndedSession(null);
  }, [agentSession, lastEndedSession, addMessage, messages]);

  const handleResumeNo = useCallback(() => {
    if (!agentSession) return;
    setAgentSession({ agent: agentSession.agent, state: "default" });
    setLastEndedSession(null);
    // User wants a fresh start — now pre-fill the template
    const prompt = AGENT_PROMPTS[agentSession.agent.id];
    if (prompt) setInputValue(prompt);
  }, [agentSession, setInputValue]);

  const handleExpandSession = useCallback((sessionStartId: string) => {
    setCollapsedSessionIds((prev) => {
      const next = new Set(prev);
      next.delete(sessionStartId);
      return next;
    });
  }, []);

  const handleOpenOpalRange = useCallback((agentEndId: string) => {
    setOpalClosedIds((prev) => {
      const n = new Set(prev);
      n.delete(agentEndId);
      return n;
    });
  }, []);

  const handleCloseOpalRange = useCallback((agentEndId: string) => {
    setOpalClosedIds((prev) => new Set([...prev, agentEndId]));
  }, []);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      const mentionMatch = suggestion.match(/@(\w+)/);
      if (mentionMatch) {
        const handle = mentionMatch[0];
        const agent = FEATURED_AGENTS.find((a) => a.handle === handle);
        if (agent) handleSelectAgent(agent);
        setInputValue(suggestion.replace(/\s+with\s+@\w+|@\w+/g, "").trim());
      } else {
        setInputValue(suggestion);
      }
    },
    [handleSelectAgent, setInputValue]
  );

  const sortedAgents = useMemo(
    () =>
      [...FEATURED_AGENTS].sort((a, b) => {
        const ai = recentAgentIds.indexOf(a.id);
        const bi = recentAgentIds.indexOf(b.id);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      }),
    [recentAgentIds]
  );

  const agentBarElement = agentSession
    ? React.createElement(AgentBar, {
        agent: agentSession.agent,
        state: agentSession.state,
        onDone: handleAgentDone,
        onDismiss: () => setAgentSession(null),
        onResumeYes: handleResumeYes,
        onResumeNo: handleResumeNo,
      })
    : undefined;

  return {
    // Agent bar
    agentSession,
    setAgentSession,
    lastEndedSession,
    agentBarElement,
    // Sorted agents for @mention
    sortedAgents,
    // Handlers
    handleSelectAgent,
    handleSendMessage,
    handleSuggestionClick,
    handleAgentDone,
    handleResumeYes,
    handleResumeNo,
    // View Agents pill state
    showAgents,
    setShowAgents,
    showAllAgents,
    setShowAllAgents,
    // Chat-view collapse/disclosure state
    collapsedSessionIds,
    handleExpandSession,
    opalDisclosureIds,
    opalClosedIds,
    collapsingOpalEndId,
    highlightedOpalEndId,
    handleOpenOpalRange,
    handleCloseOpalRange,
  };
}

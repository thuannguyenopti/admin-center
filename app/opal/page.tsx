"use client";

import { Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { IconAgent } from "@optimizely/axiom-icons";
import dynamic from "next/dynamic";
import { useOpalContext } from "@/app/context/OpalContext";
import { OpalInput } from "@/app/components/Opal/OpalInput";
import { useAgentChatMode } from "@/app/hooks/useAgentChatMode";
import { FEATURED_AGENTS, AGENT_PROMPTS } from "@/app/opal/opalAgents";
import { useAtlassianConnectorSuggestion } from "@/app/hooks/useAtlassianConnectorSuggestion";
import { useState, useCallback, useEffect, useRef } from "react";
import { InlineEditorCard } from "@/app/components/Opal/InlineEditorCard";

// Loaded client-side only — contains @codemirror/*, @tiptap/*, yjs which are
// browser-only and must not be included in the SSR bundle.
const CodeCanvasPanel = dynamic(
  () => import("@/app/components/Opal/CodeCanvasPanel").then((mod) => mod.CodeCanvasPanel),
  { ssr: false }
);

const OpalChatView = dynamic(
  () => import("@/app/components/Opal/OpalChatView").then((mod) => mod.OpalChatView)
);
const OpalLanding = dynamic(
  () => import("@/app/components/Opal/OpalLanding").then((mod) => mod.OpalLanding)
);

// ── Landing page flow constants ───────────────────────────────────────────────

const MOCK_LANDING_RESPONSE = `Sure! Here's your landing page. I've built a clean, conversion-focused HTML page for your product — hero section with a headline and CTA, a 3-column features grid, and a simple footer.

Open it in the editor to customize the copy, colors, and layout.`;

const LANDING_PAGE_STEPS = [
  'Analyzing product context…',
  'Generating hero section…',
  'Building features grid…',
  'Adding CTA and footer…',
  'Finalizing HTML…',
];

const STEP_MS = 700;

/** Pre-filled prompt shown in the input after clicking "Create a landing page" */
const LANDING_PAGE_PREFILL = 'Create a landing page for [product name] targeting [target audience] to showcase [key benefit]';

/** Detect when the user submits the landing page prompt (any variant of the prefill) */
function isLandingPagePrompt(text: string) {
  return text.startsWith('Create a landing page for ');
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OpalPage() {
  const opalContext = useOpalContext();
  const {
    messages,
    inputValue,
    isLoading,
    error,
    setInputValue,
    sendMessage,
    regenerate,
    switchVersion,
    addMessage,
    updateMessage,
  } = opalContext.chatState;
  const { actionCard: atlassianActionCard, modalElement } = useAtlassianConnectorSuggestion(inputValue);

  const {
    agentSession,
    lastEndedSession,
    isResuming,
    triggerResumeHighlight,
    agentBarElement,
    sortedAgents,
    handleSelectAgent,
    handleSendMessage,
    handleSuggestionClick: _handleSuggestionClick,
    showAgents,
    setShowAgents,
    showAllAgents,
    setShowAllAgents,
    collapsedSessionIds,
    handleExpandSession,
    opalDisclosureIds,
    opalClosedIds,
    collapsingOpalEndId,
    highlightedOpalEndId,
    handleOpenOpalRange,
    handleCloseOpalRange,
  } = useAgentChatMode({
    messages, inputValue, setInputValue, sendMessage, addMessage,
    onCollapseComplete: () => {
      (document.querySelector('textarea') as HTMLTextAreaElement | null)?.focus();
    },
    onResumeNoComplete: () => {
      (document.querySelector('textarea') as HTMLTextAreaElement | null)?.focus();
    },
  });

  const [editorOpen, setEditorOpen] = useState(false);
  const [landingPageReady, setLandingPageReady] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('canvas') === '1';
  });
  const isFirstMount = useRef(true);

  // ── Deep-link: ?canvas=1 opens the editor directly on page load ──────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('canvas') === '1') {
      addMessage({ role: 'user', content: LANDING_PAGE_PREFILL });
      addMessage({ role: 'assistant', content: MOCK_LANDING_RESPONSE });
      setLandingPageReady(true);
      // 500ms beat so the tile is visible before the canvas slides in
      setTimeout(() => setEditorOpen(true), 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only

  // ── Keep URL in sync with canvas open/closed state ────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (editorOpen) {
      params.set('canvas', '1');
    } else {
      params.delete('canvas');
    }
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [editorOpen]);

  // Landing page trigger — runs loader/streaming sequence, shows tile on completion
  const handleLandingPageTrigger = useCallback(async (userPrompt: string) => {

    addMessage({ role: 'user', content: userPrompt });

    const loadingMsg = addMessage({
      role: 'assistant',
      content: '',
      isLoading: true,
      loadingSteps: LANDING_PAGE_STEPS,
      loadingStepIndex: 0,
    });

    for (let i = 0; i < LANDING_PAGE_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, STEP_MS));
      updateMessage(loadingMsg.id, { loadingStepIndex: i });
    }

    await new Promise(r => setTimeout(r, STEP_MS));
    updateMessage(loadingMsg.id, {
      isLoading: false,
      content: MOCK_LANDING_RESPONSE,
      loadingSteps: undefined,
      loadingStepIndex: undefined,
    });

    // Tile appears immediately after streaming ends
    setLandingPageReady(true);
    // Short beat so the user sees the tile, then canvas opens
    await new Promise(r => setTimeout(r, 850));
    setEditorOpen(true);
  }, [addMessage, updateMessage]);

  // Clicking "Create a landing page" prefills the input — user fills variables, then submits
  const handleSuggestionClick = useCallback((suggestion: string) => {
    if (suggestion === '__landing_page__') {
      setInputValue(LANDING_PAGE_PREFILL);
      return;
    }
    _handleSuggestionClick(suggestion);
  }, [setInputValue, _handleSuggestionClick]);

  // Intercept submit — if it matches the landing page pattern, trigger the canvas flow
  const handleSend = useCallback((text?: string) => {
    if (isLandingPagePrompt(text ?? "")) {
      setInputValue('');
      handleLandingPageTrigger(text ?? "");
      return;
    }
    handleSendMessage(text ?? "");
  }, [handleLandingPageTrigger, handleSendMessage, setInputValue]);

  // Reset canvas state when chat is cleared (e.g. "New chat")
  // Skip initial mount — messages start empty but landingPageReady may be true from deep link
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (messages.length === 0) {
      setLandingPageReady(false);
      setEditorOpen(false);
    }
  }, [messages.length]);

  const inlineEditorCard = landingPageReady ? (
    <InlineEditorCard
      filename="landing-page.html"
      description="HTML landing page · ready to edit"
      onOpen={() => setEditorOpen(true)}
      selected={editorOpen}
      onRegenerate={() => {
        const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
        if (lastAssistant) regenerate(lastAssistant.id);
      }}
    />
  ) : null;

  const hasMessages = messages.length > 0;

  // Once a conversation starts, hand off to the full chat view
  if (hasMessages) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        h="full"
        w="full"
        style={{ backgroundColor: 'var(--opal-bg-page)', overflow: 'hidden', minHeight: 0 }}
      >
        {modalElement}
        <OpalChatView
          variant="home"
          streamingMode="expanded"
          messages={messages}
          inputValue={inputValue}
          isLoading={isLoading}
          error={error}
          setInputValue={setInputValue}
          onSend={handleSend}
          onSuggestionClick={sendMessage}
          onToggleHistory={opalContext.history.toggleHistory}
          onNewChat={opalContext.history.createNewChat}
          isHistoryVisible={opalContext.history.isHistoryVisible}
          groupedHistory={opalContext.history.groupedHistory}
          activeChat={opalContext.history.activeChat}
          searchQuery={opalContext.history.searchQuery}
          onSearchChange={opalContext.history.setSearchQuery}
          onDeleteChat={opalContext.history.deleteChat}
          onSelectChat={opalContext.history.selectChat}
          onMessageEdit={() => {}}
          onRegenerate={regenerate}
          onMessageVersionChange={switchVersion}
          agentBar={agentBarElement}
          collapsedSessionIds={collapsedSessionIds}
          onExpandSession={handleExpandSession}
          opalDisclosureIds={opalDisclosureIds}
          opalClosedIds={opalClosedIds}
          collapsingOpalEndId={collapsingOpalEndId}
          highlightedOpalEndId={highlightedOpalEndId}
          onOpenOpalRange={handleOpenOpalRange}
          onCloseOpalRange={handleCloseOpalRange}
          mentionableAgents={sortedAgents}
          onMentionSelect={handleSelectAgent}
          activeAgentCtx={agentSession?.state === 'in-chat' ? { emoji: agentSession.agent.emoji, name: agentSession.agent.name } : null}
          disabled={isResuming}
          onSubmitBlocked={triggerResumeHighlight}
          contextualActionCard={
            atlassianActionCard ??
            (inlineEditorCard ?? undefined)
          }
          leftCanvas={
            editorOpen ? (
              <CodeCanvasPanel
                onClose={() => setEditorOpen(false)}
                filename="landing-page.html"
                fileType="html"
                language="html"
              />
            ) : undefined
          }
        />
      </Box>
    );
  }

  // Landing state
  return (
    <Box h="full" style={{ overflowY: "auto", overflowX: "hidden", minHeight: 0 }}>
      {modalElement}
      <OpalLanding
        inputSlot={
          <OpalInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            disabled={isResuming}
            isLoading={isLoading}
            error={error}
            variant="home"
            agentBar={agentBarElement}
            mentionableAgents={sortedAgents}
            onMentionSelect={handleSelectAgent}
            onSubmitBlocked={triggerResumeHighlight}
          />
        }
        contextualActionCard={atlassianActionCard}
        onSuggestionClick={handleSuggestionClick}
      />
    </Box>
  );
}

"use client";

import { Alert, Box, Button as AxiomButton } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconAgent, IconCircleCheckSolid } from "@optimizely/axiom-icons";
import Image from "next/image";
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

// ── GEO Q&A mock thread ───────────────────────────────────────────────────────

const GEO_AGENT = { emoji: "🤖", name: "GEO Q&A Generator", avatar: "/avatars/mock-avatar-geo.svg" };

const VAU_MSG_1 = `Hi team — I've been monitoring our GEO content strategy for Stride and identified a gap in AI-searchable content for the _Discover the Unknown_ product line.

I've autonomously produced a **Q&A article** to help AI search engines accurately cite and surface Stride content in relevant queries.

**What I created:**
- 7 core Q&A pairs covering product overview, key activities, team use cases, and differentiators
- Written in GEO-optimized format with clear entity anchoring and direct answers
- Targeted to queries around multi-sport adventure gear and team challenges

I'm presenting this for team approval before it goes live. Please review the artifact below.`;

const JC_MSG = `Good start, thanks for taking the initiative on this! A couple of things before I can approve:

1. The "What activities does it support?" answer is too vague. Explicitly call out trail running, climbing, diving, and skydiving. Those are the core sport verticals.
2. The "How does it help teams?" section reads generic. Tie it specifically to multi-sport competitive challenges, not just "team building."`;

const TEAMMATE_MSG = `Agree with JC on both points. One more thing:

The opening Q&A ("What is Discover the Unknown?") is too formal. Stride's tone is way more adventurous and explorer-first. Can we reframe the first 2-3 answers to feel like a product story rather than a feature spec?`;

const VAU_MSG_2 = `Done — all three rounds of feedback incorporated:

✓ **Activities** — Explicitly listed trail running, climbing, diving, skydiving, and multi-terrain endurance challenges
✓ **Team use cases** — Rewired around competitive multi-sport group challenges, not generic team building
✓ **Opening tone** — Rewrote the first 3 Q&As in Stride's adventurous, explorer-first voice

The updated article is ready for final review. See the revised artifact below.`;

type ApprovalState = 'pending' | 'approved' | 'changes';

function ApprovalActionCard({ state, onApprove, onRequestChanges }: {
  state: ApprovalState;
  onApprove: () => void;
  onRequestChanges: () => void;
}) {
  if (state === 'approved') {
    return (
      <Box display="flex" flexDirection="column" gap="4" p="16" style={{ border: '1px solid var(--ax-colors-border-default)', borderRadius: 12, background: 'var(--ax-colors-bg-default)', opacity: 0.6 }}>
        <Text fontWeight="500" style={{ fontSize: 14, color: 'var(--ax-colors-fg-default)', lineHeight: 1.43 }}>
          Team approval needed for discover-the-unknown-qa.md
        </Text>
        <Text style={{ fontSize: 14, color: 'var(--ax-colors-fg-tertiary)', lineHeight: 1.43 }}>
          Jamie Chen: Approved
        </Text>
      </Box>
    );
  }
  if (state === 'changes') {
    return (
      <Box display="flex" flexDirection="column" gap="4" p="16" style={{ border: '1px solid var(--ax-colors-border-default)', borderRadius: 12, background: 'var(--ax-colors-bg-default)', opacity: 0.6 }}>
        <Text fontWeight="500" style={{ fontSize: 14, color: 'var(--ax-colors-fg-default)', lineHeight: 1.43 }}>
          Team approval needed for discover-the-unknown-qa.md
        </Text>
        <Text style={{ fontSize: 14, color: 'var(--ax-colors-fg-tertiary)', lineHeight: 1.43 }}>
          Jamie Chen: Ask changes
        </Text>
      </Box>
    );
  }
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="12"
      p="20"
      style={{
        border: '1px solid var(--ax-colors-border-default)',
        borderRadius: 12,
        background: 'var(--ax-colors-bg-default)',
      }}
    >
      {/* VAU product indicator */}
      <Box display="flex" alignItems="center" gap="4">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ width: 20, height: 20, borderRadius: 4, background: '#e4f0da', flexShrink: 0, overflow: 'hidden' }}
        >
          <Image src="/avatars/mock-avatar-geo.svg" alt="GEO" width={14} height={14} />
        </Box>
        <Text style={{ fontSize: 12, fontWeight: 400, letterSpacing: '0.36px', textTransform: 'uppercase', color: 'var(--ax-colors-fg-tertiary)', lineHeight: 1.25 }}>
          GEO Q&amp;A Generator
        </Text>
      </Box>

      {/* File info */}
      <Box display="flex" flexDirection="column" gap="4">
        <Text fontWeight="600" style={{ fontSize: 16, lineHeight: 1.3, color: 'var(--ax-colors-fg-default)' }}>
          discover-the-unknown-qa.md
        </Text>
        <Text style={{ fontSize: 14, letterSpacing: '0.28px', color: 'var(--ax-colors-fg-secondary)', lineHeight: 1.43 }}>
          GEO Q&amp;A article
        </Text>
      </Box>

      {/* Divider */}
      <Box style={{ height: 1, background: 'var(--ax-colors-border-default)', width: '100%' }} />

      {/* Key insight banner */}
      <Box
        display="flex"
        flexDirection="column"
        gap="8"
        p="16"
        style={{ background: '#f6faf3', borderRadius: 6 }}
      >
        <Text fontWeight="500" style={{ fontSize: 14, letterSpacing: '0.28px', color: 'var(--ax-colors-fg-default)', lineHeight: 1.43 }}>
          Team approval needed
        </Text>
        <Text style={{ fontSize: 14, letterSpacing: '0.28px', color: 'var(--ax-colors-fg-secondary)', lineHeight: 1.43 }}>
          Review the updated Q&amp;A article. Approve to proceed with publishing, or request further changes.
        </Text>
      </Box>

      {/* Actions */}
      <Box display="flex" justifyContent="flex-end" gap="4">
        <AxiomButton appearance="subtle" size="md" onClick={onRequestChanges}>Ask Changes</AxiomButton>
        <AxiomButton appearance="primary" size="md" onClick={onApprove} icon={<IconCircleCheckSolid size={14} />}>Approve</AxiomButton>
      </Box>
    </Box>
  );
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
  const [chatPanelVisible, setChatPanelVisible] = useState(true);
  const [approvalState, setApprovalState] = useState<ApprovalState>('pending');
  const [landingPageReady, setLandingPageReady] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('artifacts') === '1';
  });
  const isFirstMount = useRef(true);
  const hasSeededThread = useRef(false);

  // ── Deep-link: ?artifacts=1 seeds the GEO Q&A mock thread ─────────────
  useEffect(() => {
    if (hasSeededThread.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('artifacts') === '1') {
      hasSeededThread.current = true;

      const seedThread = () => {
        addMessage({ role: 'assistant', content: VAU_MSG_1, cardAfterKey: 'geo-initial' });
        addMessage({ role: 'user', content: JC_MSG, authorName: 'Jamie Chen' });
        addMessage({ role: 'user', content: TEAMMATE_MSG, authorAvatar: '/avatar-user.png', authorName: 'Mary Anne Torres' });
        addMessage({ role: 'assistant', content: VAU_MSG_2, cardAfterKey: 'geo-updated' });
        setLandingPageReady(true);
        setTimeout(() => setEditorOpen(true), 500);
      };

      if (messages.length > 0) {
        // Clear any persisted chat before seeding the demo thread
        opalContext.history.createNewChat();
        setTimeout(seedThread, 80);
      } else {
        seedThread();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only

  const editorWasOpen = useRef(false);

  // ── Keep URL in sync with canvas open/closed state ────────────────────────
  useEffect(() => {
    if (editorOpen) {
      editorWasOpen.current = true;
      const params = new URLSearchParams(window.location.search);
      params.set('artifacts', '1');
      const qs = params.toString();
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
    } else if (editorWasOpen.current) {
      // Closing canvas → navigate to artifacts page
      window.location.href = '/opal/artifacts';
    }
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
    if (text?.trim().toLowerCase() === 'approve') {
      setInputValue('');
      setApprovalState('approved');
      return;
    }
    handleSendMessage(text ?? "");
  }, [handleLandingPageTrigger, handleSendMessage, setApprovalState, setInputValue]);

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

  const messageCards = landingPageReady ? {
    'geo-initial': (
      <Box display="flex" flexDirection="column" gap="12">
        <InlineEditorCard
          filename="discover-the-unknown-qa.md"
          description="GEO Q&A article · 7 Q&A pairs · v1"
          onOpen={() => setEditorOpen(true)}
          selected={false}
        />
        <ApprovalActionCard
          state="changes"
          onApprove={() => {}}
          onRequestChanges={() => {}}
        />
      </Box>
    ),
    'geo-updated': (
      <Box display="flex" flexDirection="column" gap="12">
        <InlineEditorCard
          filename="discover-the-unknown-qa.md"
          description="GEO Q&A article · 7 Q&A pairs · updated"
          onOpen={() => setEditorOpen(true)}
          selected={editorOpen}
          onRegenerate={() => {
            const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
            if (lastAssistant) regenerate(lastAssistant.id);
          }}
        />
        <ApprovalActionCard
          state={approvalState}
          onApprove={() => setApprovalState('approved')}
          onRequestChanges={() => setApprovalState('changes')}
        />
      </Box>
    ),
  } : undefined;

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
          activeAgentCtx={landingPageReady ? GEO_AGENT : agentSession?.state === 'in-chat' ? { emoji: agentSession.agent.emoji, name: agentSession.agent.name } : null}
          inputAgentCtx={agentSession ? { name: agentSession.agent.name, handle: agentSession.agent.handle } : null}
          disabled={isResuming}
          onSubmitBlocked={triggerResumeHighlight}
          contextualActionCard={approvalState === 'approved' ? <Alert intent="success">Approved — submitting for publication</Alert> : (atlassianActionCard ?? undefined)}
          messageCards={messageCards}
          canvasMode={editorOpen}
          chatPanelVisible={chatPanelVisible}
          leftCanvas={
            editorOpen ? (
              <CodeCanvasPanel
                onClose={() => setEditorOpen(false)}
                filename="discover-the-unknown-qa.md"
                artifactTitle="Q and A: Discover the unknown"
                fileType="markdown"
                language="markdown"
                artifactCreator={{ name: "Jamie Chen" }}
                chatOpen={chatPanelVisible}
                onChatToggle={() => setChatPanelVisible(v => !v)}
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
        topSlot={agentSession ? null : (
          <Box
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: "768px",
              marginBottom: "16px",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              flexWrap: "wrap",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            <Button
              appearance="default-opal"
              size="md"
              onClick={() => { setShowAgents(!showAgents); setShowAllAgents(false); }}
              icon={<IconAgent />}
              style={{ borderRadius: "9999px" }}
            >
              View Agents
            </Button>
            {showAgents && (showAllAgents ? sortedAgents : sortedAgents.slice(0, 3)).map((agent) => (
              <Button
                key={agent.handle}
                appearance="default-opal"
                size="md"
                icon={<span style={{ fontSize: 14, lineHeight: 1 }}>{agent.emoji}</span>}
                style={{ borderRadius: "9999px" }}
                onClick={() => {
                  handleSelectAgent(agent);
                  const isResume = lastEndedSession?.agent.id === agent.id;
                  if (!isResume) {
                    const prompt = AGENT_PROMPTS[agent.id];
                    if (prompt) setInputValue(prompt);
                  }
                  setShowAgents(false);
                  setShowAllAgents(false);
                }}
              >
                {agent.name}
              </Button>
            ))}
            {showAgents && !showAllAgents && FEATURED_AGENTS.length > 3 && (
              <Button
                appearance="default-opal"
                size="md"
                style={{ borderRadius: "9999px" }}
                onClick={() => setShowAllAgents(true)}
              >
                More agents
              </Button>
            )}
          </Box>
        )}
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
            inputAgentCtx={agentSession ? { name: agentSession.agent.name, handle: agentSession.agent.handle } : null}
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

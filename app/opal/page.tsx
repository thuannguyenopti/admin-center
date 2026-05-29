"use client";

import { Box, Button as AxiomButton, Textarea } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconAgent, IconCircleCheckSolid, IconArrowLeft } from "@optimizely/axiom-icons";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useOpalContext } from "@/app/context/OpalContext";
import { OpalInput } from "@/app/components/Opal/OpalInput";
import { useAgentChatMode } from "@/app/hooks/useAgentChatMode";
import { useAtlassianConnectorSuggestion } from "@/app/hooks/useAtlassianConnectorSuggestion";
import { useState, useCallback, useEffect, useRef } from "react";
import { InlineEditorCard } from "@/app/components/Opal/InlineEditorCard";
import { HeadlessTaskPanel, useTaskController } from "./components/HeadlessTaskPanel";
import { GrabHandle } from "@/app/components/Opal/OpalChatView";
import { imToChatMessage } from "@/app/opal/im/lib/adapters";
import type { IMMessage } from "@/app/opal/im/lib/types";

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

// ── GEO Q&A editor content ────────────────────────────────────────────────────

const GEO_QA_HTML_V1 = `<h1>Q&amp;A: Discover the Unknown</h1>
<p><em>GEO-optimized Q&amp;A article for Stride · v1</em></p>

<h2>What is Discover the Unknown?</h2>
<p>Discover the Unknown is Stride's flagship multi-sport challenge series — a curated collection of adventure experiences designed to push individuals and teams beyond their comfort zones through coordinated outdoor activities.</p>

<h2>What activities does it support?</h2>
<p>The program supports a range of outdoor activities including trail running, orienteering, and team-based endurance events. Participants can tailor their challenge around available terrain and group preferences.</p>

<h2>Who is Discover the Unknown designed for?</h2>
<p>Stride's Discover the Unknown is built for teams and individuals who want structured adventure experiences. It suits corporate groups, competitive athletes, and anyone looking for a challenge that blends fitness with exploration.</p>

<h2>How does it help teams?</h2>
<p>The program provides a structured framework for team-building through shared challenge. Groups complete coordinated goals, debrief together, and build trust through shared effort in unfamiliar environments.</p>

<h2>What makes Discover the Unknown different from other adventure programs?</h2>
<p>Stride's experience-design methodology sets it apart — each challenge is sequenced to escalate difficulty, keeping participants engaged across multiple sessions. The program tracks progress and adapts to team performance over time.</p>

<h2>Is Discover the Unknown suitable for beginners?</h2>
<p>Yes. Challenge difficulty is scaled to participant ability. First-time participants complete an onboarding assessment that places them in the right tier, ensuring the experience is appropriately challenging without being inaccessible.</p>

<h2>How do I get started with Discover the Unknown?</h2>
<p>Teams can register through the Stride platform. After completing the onboarding profile, participants receive a tailored challenge roadmap, gear checklist, and access to the Stride coordination tools for scheduling and tracking.</p>`;

const GEO_QA_HTML_V2 = `<h1>Q&amp;A: Discover the Unknown</h1>
<p><em>GEO-optimized Q&amp;A article for Stride · v2 (updated)</em></p>

<h2>What is Discover the Unknown?</h2>
<p>Discover the Unknown is Stride's flagship multi-sport challenge series — an explorer-first adventure platform that throws individuals and teams into the wild unknown. It's not a checklist; it's a journey into terrain, weather, and limits you didn't know you had.</p>

<h2>What activities does it support?</h2>
<p>The program is built around trail running, rock climbing, free diving, skydiving, and multi-terrain endurance challenges. Each discipline can be combined into a multi-day expedition or tackled individually as a standalone challenge.</p>

<h2>Who is Discover the Unknown designed for?</h2>
<p>Stride's Discover the Unknown is built for teams and individuals who want structured adventure experiences. It suits corporate groups, competitive athletes, and anyone looking for a challenge that blends fitness with exploration.</p>

<h2>How does it help teams?</h2>
<p>The program is purpose-built for competitive multi-sport group challenges — not generic team building. Groups race, climb, and dive together toward shared goals, with Stride tracking performance across disciplines and adapting difficulty as teams improve.</p>

<h2>What makes Discover the Unknown different from other adventure programs?</h2>
<p>Stride's experience-design methodology sets it apart — each challenge is sequenced to escalate difficulty, keeping participants engaged across multiple sessions. The program tracks progress and adapts to team performance over time.</p>

<h2>Is Discover the Unknown suitable for beginners?</h2>
<p>Yes. Challenge difficulty is scaled to participant ability. First-time participants complete an onboarding assessment that places them in the right tier, ensuring the experience is appropriately challenging without being inaccessible.</p>

<h2>How do I get started with Discover the Unknown?</h2>
<p>Teams can register through the Stride platform. After completing the onboarding profile, participants receive a tailored challenge roadmap, gear checklist, and access to the Stride coordination tools for scheduling and tracking.</p>`;

// ── GEO Q&A mock thread ───────────────────────────────────────────────────────

const GEO_AGENT = { emoji: "🤖", name: "Frank", avatar: "/avatars/vau-frank.png", templateName: "GEO Content Strategist" };

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

const VAU_PUBLISHED_MSG = `🚀 **discover-the-unknown-qa.md** is live.

Published to the answer-engine surface just now. I'll monitor citation pickup over the next 24h and flag if anything looks off.`;

type ApprovalState = 'pending' | 'approved' | 'changes' | 'requesting';

function ApprovalActionCard({ state, changesMessage, noteValue, onApprove, onAskChanges, onNoteChange, onNoteSubmit, onNoteCancel, onOpenTask }: {
  state: ApprovalState;
  changesMessage?: string;
  noteValue?: string;
  onApprove: () => void;
  onAskChanges: () => void;
  onNoteChange: (v: string) => void;
  onNoteSubmit: () => void;
  onNoteCancel: () => void;
  onOpenTask?: () => void;
}) {
  if (state === 'approved') {
    return (
      <Box display="flex" flexDirection="column" gap="4" p="16" rounded="xl" style={{ border: '1px solid var(--ax-colors-border-default)', background: 'var(--ax-colors-bg-default)', opacity: 0.6 }}>
        <Text fontWeight="500" style={{ fontSize: 14, color: 'var(--ax-colors-fg-default)', lineHeight: 1.43 }}>
          Team approval needed for discover-the-unknown-qa.md
        </Text>
        <Text style={{ fontSize: 14, color: 'var(--ax-colors-fg-tertiary)', lineHeight: 1.43 }}>
          Jamie Chen: Approved
        </Text>
      </Box>
    );
  }

  if (state === 'requesting') {
    return (
      <Box
        display="flex"
        flexDirection="column"
        gap="12"
        p="16"
        rounded="xl"
        style={{ border: '1px solid var(--ax-colors-border-default)', background: 'var(--ax-colors-bg-default)' }}
      >
        <Box display="flex" flexDirection="column" gap="4">
          <Text fontWeight="500" style={{ fontSize: 14, color: 'var(--ax-colors-fg-default)', lineHeight: 1.43 }}>
            Request changes
          </Text>
          <Text style={{ fontSize: 13, color: 'var(--ax-colors-fg-secondary)', lineHeight: 1.43 }}>
            Let Frank know what needs to be updated before publishing.
          </Text>
        </Box>
        <Textarea
          autoFocus
          value={noteValue ?? ''}
          onChange={e => onNoteChange(e.target.value)}
          placeholder="Describe the changes needed…"
          rows={3}
          w="full"
        />
        <Box display="flex" justifyContent="flex-end" gap="4">
          <AxiomButton appearance="subtle" size="md" onClick={onNoteCancel}>Cancel</AxiomButton>
          <AxiomButton appearance="primary" size="md" onClick={onNoteSubmit}>Send</AxiomButton>
        </Box>
      </Box>
    );
  }

  if (state === 'changes') {
    return (
      <Box display="flex" flexDirection="column" gap="12" p="16" rounded="xl" style={{ border: '1px solid var(--ax-colors-border-default)', background: 'var(--ax-colors-bg-default)' }}>
        <Box display="flex" alignItems="center" gap="8">
          <Text fontWeight="500" style={{ fontSize: 14, color: 'var(--ax-colors-fg-default)', lineHeight: 1.43 }}>
            ✓ Changes requested
          </Text>
        </Box>
        {changesMessage && (
          <Box p="12" rounded="lg" style={{ background: 'var(--ax-colors-bg-page)', borderLeft: '3px solid var(--ax-colors-border-focus)' }}>
            <Text style={{ fontSize: 13, color: 'var(--ax-colors-fg-default)', lineHeight: 1.5 }}>
              {changesMessage}
            </Text>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="12"
      p="20"
      rounded="lg"
      style={{
        border: '1px solid var(--ax-colors-border-default)',
        background: 'var(--ax-colors-bg-default)',
      }}
    >
      {/* VAU product indicator */}
      <Box display="flex" alignItems="center" gap="4">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          rounded="xs"
          style={{ width: 20, height: 20, background: 'var(--ax-colors-bg-secondary)', flexShrink: 0, overflow: 'hidden' }}
        >
          <Image src="/avatars/vau-frank.png" alt="GEO" width={14} height={14} />
        </Box>
        <Text style={{ fontSize: 12, fontWeight: 400, letterSpacing: '0.36px', textTransform: 'uppercase', color: 'var(--ax-colors-fg-tertiary)', lineHeight: 1.25 }}>
          Frank
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
        rounded="sm"
        style={{ background: 'var(--ax-colors-bg-page)' }}
      >
        <Text fontWeight="500" style={{ fontSize: 14, letterSpacing: '0.28px', color: 'var(--ax-colors-fg-default)', lineHeight: 1.43 }}>
          Team approval needed
        </Text>
        <Text style={{ fontSize: 14, letterSpacing: '0.28px', color: 'var(--ax-colors-fg-secondary)', lineHeight: 1.43 }}>
          Review the updated Q&amp;A article. Approve to proceed with publishing, or request further changes.
        </Text>
        {onOpenTask && (
          <button
            type="button"
            onClick={onOpenTask}
            style={{
              alignSelf: 'flex-start',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--ax-colors-fg-accent)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <IconArrowLeft size={14} />
            View Task
          </button>
        )}
      </Box>

      {/* Actions */}
      <Box display="flex" alignItems="center" justifyContent="flex-end" gap="4">
        <AxiomButton appearance="subtle" size="md" onClick={onAskChanges}>Ask Changes</AxiomButton>
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
  const [editorVersion, setEditorVersion] = useState<'v1' | 'v2'>('v1');
  const [chatPanelVisible, setChatPanelVisible] = useState(true);
  const [headlessTaskOpen, setHeadlessTaskOpen] = useState(false);
  const [taskPanelWidth, setTaskPanelWidth] = useState(460);
  const handleTaskResize = useCallback((dx: number) => {
    setTaskPanelWidth(w => Math.max(320, Math.min(720, w + dx)));
  }, []);
  const [approvalState, setApprovalState] = useState<ApprovalState>('pending');
  const [approvalNote, setApprovalNote] = useState('');
  const [approvalChangesNote, setApprovalChangesNote] = useState('');
  const [landingPageReady, setLandingPageReady] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('artifacts') === '1';
  });
  const isFirstMount = useRef(true);
  const hasSeededThread = useRef(false);

  // Drive seeded/triggered messages through the IM adapter so avatars,
  // timestamps, and VAU template names render identically to the live IM module.
  const GEO_PROFILES = useRef<Record<string, string>>({
    'vau-frank': 'Frank',
    'jamie': 'Jamie Chen',
    'mary-anne': 'Mary Anne Torres',
  }).current;
  const pushIMMessage = useCallback((
    senderId: string,
    content: string,
    opts: { minutesAgo?: number; senderType?: 'agent' | 'user' } = {},
  ) => {
    const im: IMMessage = {
      id: crypto.randomUUID(),
      conversation_id: 'demo-geo-qa',
      instance_id: 'demo',
      sender_id: senderId,
      sender_type: opts.senderType ?? 'user',
      content,
      content_plain: content,
      format: 'markdown',
      created_at: new Date(Date.now() - (opts.minutesAgo ?? 0) * 60_000).toISOString(),
      deleted: false,
      thread_reply_count: 0,
      thread_participants: [],
    };
    const chat = imToChatMessage(im, GEO_PROFILES);
    const added = addMessage({
      role: chat.role,
      content: chat.content,
      metadata: chat.metadata,
    });
    updateMessage(added.id, { timestamp: chat.timestamp });
  }, [addMessage, updateMessage, GEO_PROFILES]);

  // Task workflow state lives at the page level so approving from the action
  // card persists into the panel — even if the panel is opened later.
  const taskController = useTaskController('geo-qa', (stepId) => {
    if (stepId === '2') {
      setApprovalState('approved');
      pushIMMessage('jamie', '✓ Approved');
    }
    if (stepId === '3') {
      pushIMMessage('vau-frank', VAU_PUBLISHED_MSG, { senderType: 'agent' });
    }
  });
  const handleApprove = useCallback(() => {
    taskController.completeStep('2');
  }, [taskController]);

  // ── Deep-link: ?artifacts=1 seeds the GEO Q&A mock thread ─────────────
  useEffect(() => {
    if (hasSeededThread.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('artifacts') === '1') {
      hasSeededThread.current = true;

      const seedThread = () => {
        pushIMMessage('vau-frank', VAU_MSG_1, { minutesAgo: 18, senderType: 'agent' });
        pushIMMessage('jamie', JC_MSG, { minutesAgo: 14 });
        pushIMMessage('mary-anne', TEAMMATE_MSG, { minutesAgo: 10 });
        pushIMMessage('vau-frank', VAU_MSG_2, { minutesAgo: 2, senderType: 'agent' });
        setLandingPageReady(true);
        setTimeout(() => { setEditorVersion('v2'); setEditorOpen(true); }, 500);
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
    if (text?.trim().toLowerCase() === 'show approval card') {
      setInputValue('');
      setApprovalState('pending');
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
          onOpen={() => { setEditorVersion('v1'); setEditorOpen(true); }}
          selected={editorOpen && editorVersion === 'v1'}
        />
        <ApprovalActionCard
          state="changes"
          changesMessage="The FAQ section needs more specific examples for each answer."
          onApprove={() => {}}
          onAskChanges={() => {}}
          onNoteChange={() => {}}
          onNoteSubmit={() => {}}
          onNoteCancel={() => {}}
          onOpenTask={() => setHeadlessTaskOpen(true)}
        />
      </Box>
    ),
    'geo-updated': (
      <Box display="flex" flexDirection="column" gap="12">
        <InlineEditorCard
          filename="discover-the-unknown-qa.md"
          description="GEO Q&A article · 7 Q&A pairs · updated"
          onOpen={() => { setEditorVersion('v2'); setEditorOpen(true); }}
          selected={editorOpen && editorVersion === 'v2'}
          onRegenerate={() => {
            const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
            if (lastAssistant) regenerate(lastAssistant.id);
          }}
        />
        <ApprovalActionCard
          state={approvalState}
          changesMessage={approvalChangesNote || undefined}
          noteValue={approvalNote}
          onApprove={handleApprove}
          onAskChanges={() => setApprovalState('requesting')}
          onNoteChange={setApprovalNote}
          onNoteSubmit={() => { const n = approvalNote; setApprovalChangesNote(n); setApprovalNote(''); setApprovalState('changes'); if (n.trim()) addMessage({ role: 'user', content: n, metadata: { authorName: 'Jamie Chen' } }); }}
          onNoteCancel={() => { setApprovalNote(''); setApprovalState('pending'); }}
          onOpenTask={() => setHeadlessTaskOpen(true)}
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
          headerTitle={landingPageReady ? "Threads" : undefined}
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
          contextualActionCard={
            approvalState === 'approved'
              ? undefined
              : landingPageReady && (approvalState === 'pending' || approvalState === 'requesting' || approvalState === 'changes')
              ? <ApprovalActionCard state={approvalState} changesMessage={approvalChangesNote || undefined} noteValue={approvalNote} onApprove={handleApprove} onAskChanges={() => setApprovalState('requesting')} onNoteChange={setApprovalNote} onNoteSubmit={() => { const n = approvalNote; setApprovalChangesNote(n); setApprovalNote(''); setApprovalState('changes'); if (n.trim()) addMessage({ role: 'user', content: n, metadata: { authorName: 'Jamie Chen' } }); }} onNoteCancel={() => { setApprovalNote(''); setApprovalState('pending'); }} onOpenTask={() => setHeadlessTaskOpen(true)} />
              : (atlassianActionCard ?? undefined)
          }
          messageCards={messageCards}
          canvasMode={editorOpen || headlessTaskOpen}
          chatPanelVisible={chatPanelVisible}
          onCloseChat={(editorOpen || headlessTaskOpen) ? () => setChatPanelVisible(false) : undefined}
          leftCanvas={
            editorOpen || headlessTaskOpen ? (
              <Box display="flex" flexDirection="row" h="full" w="full" style={{ minHeight: 0 }}>
                {editorOpen && (
                  <Box style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden' }}>
                    <CodeCanvasPanel
                      onClose={() => setEditorOpen(false)}
                      filename="discover-the-unknown-qa.md"
                      artifactTitle="Q and A: Discover the unknown"
                      artifactVersion={editorVersion}
                      fileType="markdown"
                      language="markdown"
                      artifactCreator={{ name: "Jamie Chen" }}
                      initialHtml={editorVersion === 'v2' ? GEO_QA_HTML_V2 : GEO_QA_HTML_V1}
                      chatOpen={chatPanelVisible}
                      onChatToggle={() => setChatPanelVisible(v => !v)}
                    />
                  </Box>
                )}
                {editorOpen && headlessTaskOpen && <GrabHandle onResize={handleTaskResize} />}
                {headlessTaskOpen && (
                  <Box
                    style={{
                      width: editorOpen ? taskPanelWidth : '100%',
                      flexShrink: 0,
                      flexGrow: editorOpen ? 0 : 1,
                      height: '100%',
                      minHeight: 0,
                      overflow: 'hidden',
                      transition: editorOpen ? 'none' : 'width 0.25s cubic-bezier(0.16,1,0.3,1)',
                    }}
                  >
                    <HeadlessTaskPanel
                      open={headlessTaskOpen}
                      onClose={() => setHeadlessTaskOpen(false)}
                      controller={taskController}
                    />
                  </Box>
                )}
              </Box>
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
        topSlot={null}
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

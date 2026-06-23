"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Badge, Box, Button, Text, Tooltip } from "@optiaxiom/react";
import Image from "next/image";
import { IconXmark, IconPen, IconArrowUpRightFromSquare } from "@optimizely/axiom-icons";
import {
  groupConversationsByType,
  imToChatMessage,
  conversationTitle,
} from "../lib/adapters";
import type { IMMessage } from "../lib/types";
import { avatarFor } from "../lib/avatars";
import { useIMData } from "../hooks/useIMData";
import { NewChatDialog } from "../components/NewChatDialog";
import { AddMemberButton } from "../components/AddMemberButton";
import { broadcastIMEvent } from "../lib/broadcast";
import { useLayout } from "@/app/context/LayoutContext";
import { formatQuoteMarkdown } from "../lib/quote";
import { sendMessageAsVAU, getVAU } from "../lib/virtualTeammates";
import { AskQuestionsActionCard } from "@/app/components/Opal/AskQuestionsActionCard";
import { ApprovalActionCard } from "@/app/components/Opal/ApprovalActionCard";
import { InlineEditorCard } from "@/app/components/Opal/InlineEditorCard";
import { HeadlessTaskPanel, useTaskController } from "@/app/opal/components/HeadlessTaskPanel";

const COS_CONV_IDS = ["conv-vau-chief-of-staff", "conv-vau-cos-empathetic", "conv-vau-cos-analytic"];

const WORKING_STEPS = [
  { emoji: "📅", label: "Checking your calendar" },
  { emoji: "💬", label: "Reading unread messages" },
  { emoji: "🔔", label: "Scanning Slack updates" },
  { emoji: "📋", label: "Reviewing open items" },
];

const COS_BRIEF_CSS = `
  @keyframes nh-step-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes nh-card-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .nh-step { animation: nh-step-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }
  .nh-card { animation: nh-card-in 0.4s cubic-bezier(0.22,1,0.36,1) both; }
  .cos-brief h2 { font-size: 17px; font-weight: 700; margin: 0 0 2px; color: var(--ax-colors-fg-default); }
  .cos-brief .doc-meta { font-size: 12px; color: var(--ax-colors-fg-tertiary); margin: 0 0 20px; }
  .cos-brief h3 { font-size: 13px; font-weight: 600; margin: 20px 0 8px; color: var(--ax-colors-fg-default); text-transform: uppercase; letter-spacing: 0.04em; }
  .cos-brief p { font-size: 13px; line-height: 1.6; color: var(--ax-colors-fg-secondary); margin: 0 0 10px; }
  .cos-brief ol, .cos-brief ul { font-size: 13px; line-height: 1.8; color: var(--ax-colors-fg-secondary); margin: 0 0 10px; padding-left: 0; list-style-position: inside; }
  .cos-brief li { margin-bottom: 2px; }
  .cos-brief strong { font-weight: 600; color: var(--ax-colors-fg-default); }
  .cos-brief .status-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--ax-colors-border-secondary); font-size: 13px; }
  .cos-brief .status-row:last-child { border-bottom: none; }
  .cos-brief .pill { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
  .cos-brief .pill-green { background: #dcfce7; color: #15803d; }
  .cos-brief .pill-yellow { background: #fef9c3; color: #854d0e; }
  .cos-brief .pill-red { background: #fee2e2; color: #b91c1c; }
`;

const COS_BRIEF_HTML_BY_VARIANT = [
  `<h2>Daily Brief</h2><p class="doc-meta">Mon &middot; Jun 16 &middot; 9:00 AM &nbsp;&middot;&nbsp; Launch in 12 days</p><h3>&#x1F6A6; Status pulse</h3><div><div class="status-row"><span style="flex:1"><strong>Product</strong></span><span class="pill pill-green">On track</span><span style="color:var(--ax-colors-fg-tertiary)">Jamie</span></div><div class="status-row"><span style="flex:1"><strong>Marketing</strong></span><span class="pill pill-yellow">Waiting on positioning</span><span style="color:var(--ax-colors-fg-tertiary)">Mia</span></div><div class="status-row"><span style="flex:1"><strong>Sales</strong></span><span class="pill pill-red">Blocked — day 5</span><span style="color:var(--ax-colors-fg-tertiary)">Mary Anne</span></div><div class="status-row"><span style="flex:1"><strong>Engineering</strong></span><span class="pill pill-yellow">4 days behind</span><span style="color:var(--ax-colors-fg-tertiary)">Alex</span></div></div><h3>&#x1F3AF; Top 3 today</h3><ol><li><strong>Reply to Mia's positioning draft before noon</strong> — Mary Anne can't start the enablement deck without it. Day 5 of this carry. This is the single action that unblocks two teams.</li><li><strong>Sync with Alex on scope trade-off</strong> — get a yes/no on Jun 28 before Thursday's PLT so leadership isn't blindsided. He may not raise it himself.</li><li><strong>Send PLT pre-read by EOD</strong> — three open decisions need framing before the room fills up. Aim for 4pm distribution.</li></ol><h3>&#x21A9;&#xFE0F; Carryover</h3><div><div class="status-row"><span style="flex:1"><strong>Positioning sign-off</strong></span><span class="pill pill-red">Day 5 carry</span></div><div class="status-row"><span style="flex:1"><strong>Engineering go/no-go Jun 28</strong></span><span class="pill pill-yellow">Day 2 carry</span></div><div class="status-row"><span style="flex:1"><strong>Sales enablement brief kickoff</strong></span><span class="pill pill-red">Blocked</span></div></div><h3>&#x1F4C5; Calendar</h3><div><div class="status-row"><span style="flex:1"><strong>Tue Jun 17 &middot; 2:00 PM</strong>&nbsp; Marketing Review</span><span style="color:var(--ax-colors-fg-tertiary);font-size:12px">Mia presenting positioning v2</span></div><div class="status-row"><span style="flex:1"><strong>Wed Jun 18 &middot; 11:00 AM</strong>&nbsp; Eng Sync</span><span style="color:var(--ax-colors-fg-tertiary);font-size:12px">Alex — scope finalization</span></div><div class="status-row"><span style="flex:1"><strong>Thu Jun 19 &middot; 10:00 AM</strong>&nbsp; PLT Sync</span><span style="color:var(--ax-colors-fg-tertiary);font-size:12px">Come with eng trade-off rec</span></div></div><h3>&#x1F511; Decisions pending</h3><ol><li><strong>Positioning sign-off</strong> — Mia is waiting. Decision owner: you. Input needed by noon.</li><li><strong>Engineering scope — Jun 28 commit</strong> — Alex needs a go/no-go before Thursday PLT. Scope cut may be required.</li><li><strong>PLT agenda framing</strong> — three items need an owner and a recommendation, not just a discussion.</li></ol>`,
  `<h2>Daily Brief</h2><p class="doc-meta">Mon &middot; Jun 16 &middot; 9:00 AM &nbsp;&middot;&nbsp; Launch in 12 days</p><h3>&#x1F331; Good morning</h3><p>The team is carrying a lot right now. Two workstreams are stuck and both are waiting on the same positioning decision. Your call today unblocks everyone downstream.</p><h3>&#x1F465; Where people are</h3><div><div class="status-row"><span style="flex:1"><strong>Mia</strong> — has a draft ready, waiting for your eyes</span><span class="pill pill-yellow">Needs you</span></div><div class="status-row"><span style="flex:1"><strong>Mary Anne</strong> — her team is prepared, just waiting</span><span class="pill pill-red">Day 5 wait</span></div><div class="status-row"><span style="flex:1"><strong>Alex</strong> — under pressure, may not surface the gap</span><span class="pill pill-yellow">Check in</span></div><div class="status-row"><span style="flex:1"><strong>Jamie</strong> — product is on track, no blockers</span><span class="pill pill-green">All good</span></div></div><h3>&#x1F49B; What needs you today</h3><ol><li><strong>Read Mia's positioning draft and reply by noon</strong> — this one action unblocks two teams. She's been patient for 5 days.</li><li><strong>Check in with Alex before EOD</strong> — create space for him to share where things really stand on Jun 28. He may not raise it on his own.</li><li><strong>Send the PLT pre-read by 4pm</strong> — give the room what they need to come prepared Thursday. Three decisions need framing.</li></ol><h3>&#x21A9;&#xFE0F; Still waiting from yesterday</h3><div><div class="status-row"><span style="flex:1">Positioning approval for Mia</span><span class="pill pill-red">Day 5</span></div><div class="status-row"><span style="flex:1">Engineering scope clarity for Alex</span><span class="pill pill-yellow">Day 2</span></div></div><h3>&#x1F4C5; Coming up</h3><div><div class="status-row"><span style="flex:1"><strong>Tue Jun 17 &middot; 2:00 PM</strong>&nbsp; Marketing Review</span><span style="color:var(--ax-colors-fg-tertiary);font-size:12px">Mia presenting positioning</span></div><div class="status-row"><span style="flex:1"><strong>Wed Jun 18 &middot; 11:00 AM</strong>&nbsp; Eng Sync</span><span style="color:var(--ax-colors-fg-tertiary);font-size:12px">Scope finalization with Alex</span></div><div class="status-row"><span style="flex:1"><strong>Thu Jun 19 &middot; 10:00 AM</strong>&nbsp; PLT Sync</span><span style="color:var(--ax-colors-fg-tertiary);font-size:12px">3 decisions to frame together</span></div></div>`,
  `<h2>Daily Brief</h2><p class=\"doc-meta\">Mon &middot; Jun 16 &middot; 9:00 AM &nbsp;&middot;&nbsp; Launch T−12d</p><h3>&#x1F6A6; Workstream RAG</h3><div><div class=\"status-row\"><span style=\"flex:1\"><strong>Product</strong></span><span class=\"pill pill-green\">✓ On track</span><span style=\"color:var(--ax-colors-fg-tertiary)\">Jamie</span></div><div class=\"status-row\"><span style=\"flex:1\"><strong>Marketing</strong></span><span class=\"pill pill-yellow\">⚠ Positioning D+5</span><span style=\"color:var(--ax-colors-fg-tertiary)\">Mia</span></div><div class=\"status-row\"><span style=\"flex:1\"><strong>Sales</strong></span><span class=\"pill pill-red\">⛔ Enablement blocked D+5</span><span style=\"color:var(--ax-colors-fg-tertiary)\">Mary Anne</span></div><div class=\"status-row\"><span style=\"flex:1\"><strong>Engineering</strong></span><span class=\"pill pill-yellow\">⚠ −4d vs. plan</span><span style=\"color:var(--ax-colors-fg-tertiary)\">Alex</span></div></div><h3>&#x26A0;&#xFE0F; Risk model</h3><p>2 of 4 workstreams blocked. Single point of failure: positioning decision (owner: you).</p><ul><li><strong>Sales stall at D+5</strong> — estimated 2-week lost pipeline prep if not resolved today</li><li><strong>Engineering −4d on 2 modules</strong> — Jun 28 ship date at risk without scope cut</li><li><strong>PLT Thursday</strong> — 3 open decisions unframed; meeting will be reactive without pre-read</li></ul><h3>&#x1F3AF; Decision queue (ranked by impact)</h3><ol><li><strong>Positioning sign-off → Mia, &lt;noon</strong> — unblocks marketing + sales simultaneously. D+5 stall resolution.</li><li><strong>Engineering scope → Alex, &lt;EOD</strong> — go/no-go on Jun 28; required input for PLT slide. Day 2.</li><li><strong>PLT pre-read → distribute &lt;4pm</strong> — 3 items need framing; execs arrive blind without it.</li></ol><h3>&#x21A9;&#xFE0F; Carryover log</h3><div><div class=\"status-row\"><span style=\"flex:1\"><strong>Positioning sign-off</strong></span><span class=\"pill pill-red\">D+5 · owner: you</span></div><div class=\"status-row\"><span style=\"flex:1\"><strong>Eng scope decision</strong></span><span class=\"pill pill-yellow\">D+2 · owner: you + Alex</span></div><div class=\"status-row\"><span style=\"flex:1\"><strong>Sales enablement kickoff</strong></span><span class=\"pill pill-red\">Blocked upstream</span></div></div><h3>&#x1F4C5; Calendar (today + 72h)</h3><div><div class=\"status-row\"><span style=\"flex:1\"><strong>Tue Jun 17 · 2:00 PM</strong>&nbsp; Marketing Review</span><span style=\"color:var(--ax-colors-fg-tertiary);font-size:12px\">Mia presenting positioning v2</span></div><div class=\"status-row\"><span style=\"flex:1\"><strong>Wed Jun 18 · 11:00 AM</strong>&nbsp; Eng Sync</span><span style=\"color:var(--ax-colors-fg-tertiary);font-size:12px\">Alex — scope finalization</span></div><div class=\"status-row\"><span style=\"flex:1\"><strong>Thu Jun 19 · 10:00 AM</strong>&nbsp; PLT Sync</span><span style=\"color:var(--ax-colors-fg-tertiary);font-size:12px\">3 framing decisions required</span></div></div>`,
];

const TONY_CONV_ID = "conv-vau-tony";
const TONY_FOLLOWUP_MSG_ID = "msg-vt3";
const HENRY_CONV_ID = "conv-vau-henry";

const GEO_QA_HTML = `<h1>Q&amp;A: Discover the Unknown</h1>
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

const OpalChatView = dynamic(
  () => import("@/app/components/Opal/OpalChatView").then((m) => m.OpalChatView),
  { ssr: false },
);

export function LayoutASidebar({ initialConvId }: { initialConvId?: string } = {}) {
  const router = useRouter();
  const {
    conversations,
    profiles,
    selectedId,
    setSelectedId,
    messages,
    messageReactions,
    selectedParticipantIds,
    selectedIsGroup,
    sendCurrent,
    toggleReaction,
    refreshSelected,
    refreshCurrentMessages,
    inputValue,
    setInputValue,
    insertMention,
    attachFile,
    currentUserId,
    isLoading,
  } = useIMData(initialConvId);

  const { pendingIMConvId, setPendingIMConvId } = useLayout();

  // Reset ?conv= URL param once user navigates to a different conversation.
  const urlResetDone = useRef(false);
  useEffect(() => {
    if (!initialConvId || urlResetDone.current) return;
    if (selectedId && selectedId !== initialConvId) {
      urlResetDone.current = true;
      router.replace("/opal/im");
    }
  }, [selectedId, initialConvId, router]);

  // Fallback: apply pendingIMConvId from context (already-mounted case).
  useEffect(() => {
    if (!pendingIMConvId || !conversations.length) return;
    const exists = conversations.some((c) => c.conversation_id === pendingIMConvId);
    if (exists) {
      setSelectedId(pendingIMConvId);
      setPendingIMConvId(null);
    }
  }, [pendingIMConvId, conversations, setSelectedId, setPendingIMConvId]);

  const [isHistoryVisible, setIsHistoryVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatMode, setNewChatMode] = useState<"dm" | "group" | "channel">("dm");
  const [quotedMsgId, setQuotedMsgId] = useState<string | null>(null);
  const [tonyCardAnswered, setTonyCardAnswered] = useState(false);
  const [frankCardApproved, setFrankCardApproved] = useState(() => {
    try { return typeof window !== 'undefined' && sessionStorage.getItem('opal_geo_qa_approved') === '1'; } catch { return false; }
  });
  // Follow-up messages visible after the 1800ms "publishing" delay; persisted to
  // localStorage so they survive navigation and Vercel's ephemeral per-instance cache.
  const [frankMsgVisible, setFrankMsgVisible] = useState(() => {
    try { return typeof window !== 'undefined' && !!localStorage.getItem('geo-qa-approval-ts'); } catch { return false; }
  });
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);
  const [taskPanelWidth, setTaskPanelWidth] = useState(380);
  const taskPanelDragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const [artifactPanelOpen, setArtifactPanelOpen] = useState(false);
  const [newHireStage, setNewHireStage] = useState<"idle" | "working" | "ready">("idle");
  const [workingStep, setWorkingStep] = useState(0);
  const [cosPreviewOpen, setCosPreviewOpen] = useState(false);
  const [artifactPanelWidth, setArtifactPanelWidth] = useState(420);
  const artifactPanelDragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const handleArtifactPanelDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    artifactPanelDragRef.current = { startX: e.clientX, startWidth: artifactPanelWidth };
    const onMove = (ev: MouseEvent) => {
      if (!artifactPanelDragRef.current) return;
      const delta = artifactPanelDragRef.current.startX - ev.clientX;
      setArtifactPanelWidth(Math.max(280, Math.min(700, artifactPanelDragRef.current.startWidth + delta)));
    };
    const onUp = () => {
      artifactPanelDragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleTaskPanelDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    taskPanelDragRef.current = { startX: e.clientX, startWidth: taskPanelWidth };
    const onMove = (ev: MouseEvent) => {
      if (!taskPanelDragRef.current) return;
      const delta = taskPanelDragRef.current.startX - ev.clientX;
      setTaskPanelWidth(Math.max(280, Math.min(600, taskPanelDragRef.current.startWidth + delta)));
    };
    const onUp = () => {
      taskPanelDragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // restoredIMTaskRef is set inside handleStepComplete so the messages.length effect
  // never re-triggers completeStep after the first call within a mount.
  const restoredIMTaskRef = useRef(false);

  const handleStepComplete = useCallback((stepId: string) => {
    if (stepId !== '2') return;
    restoredIMTaskRef.current = true;
    setFrankCardApproved(true);
    try {
      sessionStorage.setItem('opal_geo_qa_approved', '1');
      localStorage.setItem('geo-qa-approval', 'approved');
    } catch {}
    // Skip the timer if messages are already visible (remount after a completed approval).
    let alreadyVisible = false;
    try { alreadyVisible = !!localStorage.getItem('geo-qa-approval-ts'); } catch {}
    if (alreadyVisible) return;
    // 1800ms simulates Frank publishing, then inject approval messages client-side.
    // Client injection is Vercel-safe: no server round-trip, no ephemeral cache dependency.
    setTimeout(() => {
      try { localStorage.setItem('geo-qa-approval-ts', String(Date.now())); } catch {}
      setFrankMsgVisible(true);
    }, 1800);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const taskController = useTaskController('geo-qa', handleStepComplete);

  // On mount: if already approved in sessionStorage, advance task panel UI once messages load.
  // Uses messages.length (not frankCardApproved) so it only fires on mount, not mid-session.
  useEffect(() => {
    if (restoredIMTaskRef.current || !messages.length) return;
    let approved = false;
    try { approved = sessionStorage.getItem('opal_geo_qa_approved') === '1'; } catch {}
    if (!approved) return;
    taskController.completeStep('2');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const handleFrankApprove = () => {
    taskController.completeStep('2');
  };

  // Derive the active thread name and VAU flag for the IM header
  const selectedConv = conversations.find((c) => c.conversation_id === selectedId);
  const imThreadName = selectedConv ? conversationTitle(selectedConv, profiles) : undefined;
  const imIsVAU = selectedConv
    ? selectedConv.other_participant_ids.some((id) => !!getVAU(id))
    : false;
  const imIsChannel = selectedConv
    ? selectedConv.conversation_type === "public_channel" || selectedConv.conversation_type === "private_channel"
    : false;

  // Template name for VAU 1:1 DMs — shown below the name in the header
  const imTemplateName = (() => {
    if (!selectedConv || selectedConv.conversation_type !== "dm") return undefined;
    if (selectedConv.other_participant_ids.length !== 1) return undefined;
    return getVAU(selectedConv.other_participant_ids[0])?.template_name;
  })();

  // Use the participant's avatar for 1:1 DMs (human or VAU).
  // Groups/channels use name initials (no participant avatar).
  const imThreadAvatar = (() => {
    if (!selectedConv) return undefined;
    if (selectedConv.conversation_type !== "dm") return undefined;
    if (selectedConv.other_participant_ids.length !== 1) return undefined;
    return avatarFor(selectedConv.other_participant_ids[0]);
  })();

  // The Tony killswitch confirmation flow is "still pending" whenever Tony's
  // DM is in the conversation list AND the last message there is still Tony's
  // pre-confirmation prompt (msg-vt3 / "Got it -- killing the test now..."),
  // i.e. JC hasn't sent the confirmation summary yet. This computes from the
  // conversation index alone, so it works even when Tony's DM isn't open.
  const tonyConv = conversations.find((c) => c.conversation_id === TONY_CONV_ID);
  const tonyFlowPending =
    !!tonyConv &&
    tonyConv.last_message_sender_id === "vau-tony" &&
    (tonyConv.last_message_preview ?? "").startsWith(
      "Got it -- killing the test now",
    );

  // Henry asked JC whether to prep a competitive brief -- flag Henry's DM as
  // needing input until JC responds.
  const henryConv = conversations.find((c) => c.conversation_id === HENRY_CONV_ID);
  const henryFlowPending =
    !!henryConv && henryConv.last_message_sender_id === "vau-henry";

  // Hide the card once JC has already posted the confirmation summary --
  // otherwise a page refresh would re-show the card on top of a completed flow.
  const tonyCardAlreadyConfirmed = messages.some(
    (m) =>
      m.conversation_id === TONY_CONV_ID &&
      m.content?.startsWith("**Confirmed killswitch details:**"),
  );
  const showTonyCard =
    selectedId === TONY_CONV_ID &&
    messages.some((m) => m.id === TONY_FOLLOWUP_MSG_ID) &&
    !tonyCardAlreadyConfirmed;
  const tonyCardBlocking = showTonyCard && !tonyCardAnswered;

  // Drop the quote when switching conversations so it can't leak across chats.
  const quotedMessage = useMemo(
    () =>
      quotedMsgId ? messages.find((m) => m.id === quotedMsgId) ?? null : null,
    [quotedMsgId, messages],
  );

  const openNewChat = (mode: "dm" | "group" | "channel") => {
    setNewChatMode(mode);
    setNewChatOpen(true);
  };

  const handleCreateInSection = (sectionLabel: string) => {
    if (sectionLabel === "Channels") openNewChat("channel");
    else openNewChat("dm");
  };

  const groupedHistory = useMemo(() => {
    const grouped = groupConversationsByType(conversations, profiles);
    // Surface the action-card "Needs input" indicator on Tony's DM when the
    // confirmation flow is still pending -- derived from the conversation
    // index so it shows up regardless of whether Tony's DM is currently open.
    for (const section of Object.values(grouped)) {
      for (const item of section) {
        if (item.id === TONY_CONV_ID && tonyFlowPending) item.needsInput = true;
        if (item.id === HENRY_CONV_ID && henryFlowPending) item.needsInput = true;
      }
    }
    // Pin order: geo-qa first, Tony second.
    const dms = grouped["Direct messages"];
    if (dms) {
      const geoItem = dms.find((i) => i.id === "demo-geo-qa");
      if (geoItem && !frankCardApproved) geoItem.needsInput = true;
      const tonyIdx = dms.findIndex((i) => i.id === TONY_CONV_ID);
      if (tonyIdx >= 0) { const [tony] = dms.splice(tonyIdx, 1); dms.unshift(tony); }
      const geoIdx = dms.findIndex((i) => i.id === "demo-geo-qa");
      if (geoIdx > 0) { const [geo] = dms.splice(geoIdx, 1); dms.unshift(geo); }
    }
    return grouped;
  }, [conversations, profiles, tonyFlowPending, henryFlowPending, frankCardApproved]);

  const chatMessages = useMemo(() => {
    const converted = messages.map((m) => imToChatMessage(m, profiles));
    if (selectedId !== "demo-geo-qa") return converted;
    const mapped = converted.map((m) => {
      if (m.id === "msg-gq1") {
        return {
          ...m,
          metadata: {
            ...m.metadata,
            artifactCard: (
              <InlineEditorCard
                filename="discover-the-unknown-qa.md"
                description="GEO Q&A article · 7 Q&A pairs · v1"
                vauName="Frank"
                vauAvatar="/avatars/im-telescope.png"
                onOpen={() => setArtifactPanelOpen(true)}
                dimmed={true}
              />
            ),
          },
        };
      }
      if (m.id === "msg-gq4") {
        return {
          ...m,
          metadata: {
            ...m.metadata,
            artifactCard: (
              <ApprovalActionCard
                key={frankCardApproved ? 'approved' : 'pending'}
                authorName="Frank"
                authorAvatar="/avatars/im-telescope.png"
                isVAU={true}
                badge="UPDATED"
                fileName="discover-the-unknown-qa.md"
                fileSubtitle="GEO Q&A article · 7 Q&A pairs · updated"
                approvalTitle="Team approval needed"
                approvalDescription="Review the updated Q&A article. Approve to proceed with publishing, or request further changes."
                selected={artifactPanelOpen}
                onPreview={() => setArtifactPanelOpen(true)}
                onApprove={handleFrankApprove}
                onRequestChanges={() => setArtifactPanelOpen(true)}
                onViewTask={() => setTaskPanelOpen(true)}
                persistKey="geo-qa-approval"
              />
            ),
          },
        };
      }
      return m;
    });
    // Client-side approval follow-ups: injected from React state, not fetched from the server.
    // This is Vercel-safe — ephemeral per-instance caches can't drop client-derived messages.
    if (frankMsgVisible) {
      const frankAlreadyInList = mapped.some((m) => m.content?.includes('is live'));
      if (!frankAlreadyInList) {
        const approvedTs = (() => {
          try { return parseInt(localStorage.getItem('geo-qa-approval-ts') ?? '0', 10) || Date.now(); }
          catch { return Date.now(); }
        })();
        const approvedMsg: IMMessage = {
          id: 'client-geo-qa-approved',
          conversation_id: 'demo-geo-qa',
          instance_id: 'im-prototype',
          sender_id: currentUserId || 'jamie',
          sender_type: 'user',
          content: '✓ Approved',
          content_plain: '✓ Approved',
          format: 'markdown',
          created_at: new Date(approvedTs).toISOString(),
          deleted: false,
          thread_reply_count: 0,
          thread_participants: [],
        };
        const frankMsg: IMMessage = {
          id: 'client-geo-qa-frank-live',
          conversation_id: 'demo-geo-qa',
          instance_id: 'im-prototype',
          sender_id: 'vau-frank',
          sender_type: 'agent',
          content: '🚀 **discover-the-unknown-qa.md** is live.\n\nPublished to the answer-engine surface just now. I\'ll monitor citation pickup over the next 24h and flag if anything looks off.',
          content_plain: '🚀 discover-the-unknown-qa.md is live.',
          format: 'markdown',
          created_at: new Date(approvedTs + 500).toISOString(),
          deleted: false,
          thread_reply_count: 0,
          thread_participants: [],
        };
        mapped.push(imToChatMessage(approvedMsg, profiles));
        mapped.push(imToChatMessage(frankMsg, profiles));
      }
    }
    return mapped;
  }, [messages, profiles, selectedId, frankCardApproved, frankMsgVisible, taskPanelOpen, artifactPanelOpen, currentUserId]);

  const tonyCardQuestions = useMemo(
    () => [
      {
        id: "rollback-target",
        label: "What should traffic roll back to?",
        options: [
          {
            value: "control",
            label: "Original control (Variant A)",
            description: "Safe -- last known good state.",
          },
          {
            value: "hold",
            label: "Hold at current 50/50 split",
            description: "Pause both variants while we investigate.",
          },
        ],
      },
      {
        id: "notify",
        label: "Notify the campaign owner?",
        options: [
          {
            value: "yes",
            label: "Yes -- ping Mary Anne with the killswitch summary",
          },
          {
            value: "no",
            label: "No -- I'll loop her in directly",
          },
        ],
      },
      {
        id: "followup",
        label: "Open a follow-up investigation?",
        options: [
          {
            value: "open",
            label: "Open a ticket for root-cause analysis",
            description: "I'll attach the variant performance + funnel data.",
          },
          {
            value: "skip",
            label: "Skip -- cause already identified",
          },
        ],
      },
    ],
    [],
  );

  const handleTonyCardSubmit = async (answers: Record<string, string>) => {
    const lines: string[] = ["**Confirmed killswitch details:**", ""];
    for (const q of tonyCardQuestions) {
      const value = answers[q.id];
      const opt = q.options.find((o) => o.value === value);
      const label = opt ? opt.label : value === "__skipped__" ? "_(skipped)_" : value;
      lines.push(`- **${q.label}** ${label}`);
    }
    setTonyCardAnswered(true);
    const convId = selectedId;
    await sendCurrent(lines.join("\n"));
    // Tony follows up with the next step immediately once JC has confirmed.
    if (convId) {
      await sendMessageAsVAU(
        "vau-tony",
        convId,
        "On it. Killswitch firing now -- I'll ping you the moment the rollback is live and confirm conversion stabilizes.",
      );
      await refreshCurrentMessages();
    }
  };

  // Trigger daily brief sequence on any CoS conv landing
  useEffect(() => {
    if (!selectedId || !COS_CONV_IDS.includes(selectedId)) {
      setNewHireStage("idle");
      setWorkingStep(0);
      return;
    }
    // Post-hire: immediate trigger
    try {
      const flag = sessionStorage.getItem("im-new-hire");
      if (flag === selectedId) {
        sessionStorage.removeItem("im-new-hire");
        setNewHireStage("working");
        setWorkingStep(1);
        return;
      }
    } catch {}
    // Direct landing: 2s delay
    const t = setTimeout(() => {
      setNewHireStage("working");
      setWorkingStep(1);
    }, 2000);
    return () => clearTimeout(t);
  }, [selectedId]);

  // Advance working steps then reveal daily brief card
  useEffect(() => {
    if (newHireStage !== "working") return;
    const timers = [
      setTimeout(() => setWorkingStep(2), 700),
      setTimeout(() => setWorkingStep(3), 1400),
      setTimeout(() => setWorkingStep(4), 2100),
      setTimeout(() => setNewHireStage("ready"), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [newHireStage]);

  // Capture message count when card first becomes visible
  const cardReadyBaselineRef = useRef<number>(0);
  useEffect(() => {
    if (newHireStage === "ready") cardReadyBaselineRef.current = messages.length;
  }, [newHireStage]);

  // Dismiss card only when user sends a NEW message after it appeared
  useEffect(() => {
    if (newHireStage !== "ready") return;
    if (messages.length > cardReadyBaselineRef.current &&
        messages.slice(cardReadyBaselineRef.current).some((m) => m.sender_id === currentUserId)) {
      setNewHireStage("idle");
    }
  }, [messages.length, newHireStage, currentUserId]);

  const isCoSConv = !!selectedId && COS_CONV_IDS.includes(selectedId);
  const cosVariant = selectedId === "conv-vau-cos-empathetic" ? 1 : selectedId === "conv-vau-cos-analytic" ? 2 : 0;

  const cosNewHireCard = (() => {
    if (newHireStage === "idle" || !isCoSConv) return null;
    const briefLabels = ["Strategic", "Empathetic", "Data-led"];
    const briefStats =
      cosVariant === 2
        ? "2 workstreams blocked · −4d engineering · 3 decisions pending"
        : cosVariant === 1
        ? "2 teams need you · 3 conversations waiting · 1 decision due"
        : "3 meetings · 2 blockers · 4 items need your attention";
    if (newHireStage === "working") {
      return (
        <div style={{ paddingLeft: 48 }}>
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--ax-colors-bg-secondary)", fontSize: 14, lineHeight: "22px", maxWidth: 400 }}>
            <style>{COS_BRIEF_CSS}</style>
            <div style={{ fontSize: 13, color: "var(--ax-colors-fg-secondary)", marginBottom: 10 }}>
              On it — pulling your daily brief together.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {WORKING_STEPS.map((step, i) =>
                i < workingStep ? (
                  <div key={i} className="nh-step" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{step.emoji}</span>
                    <span style={{ fontSize: 13, color: "var(--ax-colors-fg-secondary)" }}>{step.label}</span>
                    {i < workingStep - 1 ? (
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ax-colors-fg-tertiary)" }}>✓</span>
                    ) : (
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "#7c5cff" }}>…</span>
                    )}
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div style={{ paddingLeft: 48 }}>
        <style>{COS_BRIEF_CSS}</style>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400 }}>
          <div style={{ padding: "8px 12px", borderRadius: 12, background: "var(--ax-colors-bg-secondary)", fontSize: 14, color: "var(--ax-colors-fg-default)", lineHeight: "22px" }}>
            Looks like a heavy day today - your daily brief is ready.
          </div>
          <div
            className="nh-card"
            onClick={() => setCosPreviewOpen(true)}
            style={{ border: "1px solid var(--ax-colors-border-secondary)", borderRadius: 12, overflow: "hidden", background: "var(--ax-colors-bg-default)", cursor: "pointer" }}
          >
            <div style={{ height: 72, overflow: "hidden" }}>
              <Image src="/cos-cover-daily-brief.png" alt="Daily Brief" width={400} height={72} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13 }}>📅</span>
                <Text style={{ fontSize: 11, fontWeight: 500, color: "var(--ax-colors-fg-tertiary)", letterSpacing: "0.4px", textTransform: "uppercase" }}>
                  Daily Brief
                </Text>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, borderTop: "1px solid var(--ax-colors-border-secondary)", paddingTop: 8 }}>
                {[
                  { label: "Product", status: "On track", bg: "#dcfce7", fg: "#15803d" },
                  { label: "Marketing", status: "Waiting on positioning", bg: "#fef9c3", fg: "#854d0e" },
                  { label: "Sales", status: "Blocked — day 5", bg: "#fee2e2", fg: "#b91c1c" },
                  { label: "Engineering", status: "4 days behind", bg: "#fef9c3", fg: "#854d0e" },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <span style={{ flex: 1, color: "var(--ax-colors-fg-default)", fontWeight: 500 }}>{row.label}</span>
                    <span style={{ padding: "1px 7px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: row.bg, color: row.fg, whiteSpace: "nowrap" }}>{row.status}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button size="md" appearance="primary" onClick={(e) => { e.stopPropagation(); setCosPreviewOpen(true); }}>
                  Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  })();

  const tonyActionCard = useMemo(() => {
    if (!tonyCardBlocking) return null;
    return (
      <AskQuestionsActionCard
        title="Confirm killswitch details"
        description="Quick confirmations before Tony shuts down the Homepage Pricing Test."
        submitLabel="Confirm and kill test"
        questions={tonyCardQuestions}
        onSubmit={handleTonyCardSubmit}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tonyCardBlocking, tonyCardQuestions]);


  const geoQAActionCard = null;

  const mentionableAgents = useMemo(
    () =>
      Object.entries(profiles).map(([id, name]) => ({
        id,
        emoji: "👤",
        name,
        handle: name.toLowerCase().replace(/\s+/g, ""),
      })),
    [profiles],
  );

  const handleSend = async (content: string) => {
    if (!content?.trim()) return;
    const quoteToSend = quotedMessage;
    setQuotedMsgId(null);
    setInputValue("");
    const finalContent = quoteToSend
      ? formatQuoteMarkdown(quoteToSend, profiles) + content
      : content;
    await sendCurrent(finalContent);
  };

  const quoteChip = quotedMessage ? (
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
          {profiles[quotedMessage.sender_id] ?? quotedMessage.sender_id}
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
        onClick={() => setQuotedMsgId(null)}
        style={{ width: 24, height: 24, padding: 0, minWidth: "auto", flexShrink: 0 }}
      />
    </Box>
  ) : null;

  return (
    <>
      <Box display="flex" h="full" w="full" style={{ minHeight: 0, overflowX: 'auto', overflowY: 'hidden' }}>
        <Box style={{ flex: 1, minWidth: 480, height: '100%', overflow: 'hidden' }}>
          <OpalChatView
            variant="home"
            streamingMode="expanded"
            messages={chatMessages}
            inputValue={inputValue}
            isLoading={isLoading}
            setInputValue={setInputValue}
            onSend={handleSend}
            onSuggestionClick={() => {}}
            onToggleHistory={() => setIsHistoryVisible((v) => !v)}
            onNewChat={() => openNewChat("dm")}
            isHistoryVisible={isHistoryVisible}
            groupedHistory={groupedHistory}
            activeChat={selectedId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectChat={setSelectedId}
            onDeleteChat={() => {}}
            mentionableAgents={mentionableAgents}
            onMentionSelect={(agent) => insertMention(agent.handle)}
            imMode={true}
            imSimplified={artifactPanelOpen}
            imThreadName={artifactPanelOpen ? "Threads" : imThreadName}
            imIsVAU={artifactPanelOpen ? false : imIsVAU}
            imIsChannel={artifactPanelOpen ? false : imIsChannel}
            imThreadAvatar={artifactPanelOpen ? undefined : imThreadAvatar}
            imTemplateName={artifactPanelOpen ? undefined : imTemplateName}
            onOpenBrief={isCoSConv ? () => setCosPreviewOpen(true) : undefined}
            onCloseChat={artifactPanelOpen ? () => setArtifactPanelOpen(false) : undefined}
            chatHeaderRight={artifactPanelOpen ? (
              <Tooltip content="View in Messaging">
                <Button
                  appearance="subtle"
                  size="sm"
                  icon={<IconArrowUpRightFromSquare size={15} />}
                  aria-label="View in Messaging"
                  onClick={() => window.open('/opal/im', '_blank')}
                  style={{ padding: 0, minWidth: 'auto', width: 32, height: 32 }}
                />
              </Tooltip>
            ) : selectedId && selectedParticipantIds.length > 0 ? (
              <AddMemberButton
                conversationId={selectedId}
                existingMemberIds={selectedParticipantIds}
                onAdded={refreshSelected}
              />
            ) : undefined}
            canvasMode={true}
            contextualActionCard={tonyActionCard ?? geoQAActionCard ?? cosNewHireCard}
            disabled={tonyCardBlocking}
            onReaction={toggleReaction}
            onQuote={setQuotedMsgId}
            preInputContent={quoteChip}
          />
        </Box>
        {artifactPanelOpen && (
          <Box style={{
            width: artifactPanelWidth,
            minWidth: 280,
            flexShrink: 0,
            height: '100%',
            overflow: 'hidden',
            borderLeft: '1px solid var(--ax-colors-border-secondary)',
            animation: 'chatSlideIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--ax-colors-bg-default)',
          }}>
            <div onMouseDown={handleArtifactPanelDragStart} style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', cursor: 'col-resize', zIndex: 10 }} />
            {/* Header */}
            <Box display="flex" alignItems="center" gap="8" style={{ padding: '0 12px 0 8px', height: 56, flexShrink: 0 }}>
              <Tooltip content="Close">
                <Button appearance="subtle" size="sm" icon={<IconXmark size={16} />} aria-label="Close" onClick={() => setArtifactPanelOpen(false)} style={{ padding: 0, minWidth: 'auto', width: 32, height: 32, flexShrink: 0 }} />
              </Tooltip>
              <Text fontWeight="500" style={{ fontSize: 14, color: 'var(--ax-colors-fg-default)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>discover-the-unknown-qa.md</Text>
              {/* CTAs */}
              <Box display="flex" alignItems="center" gap="4" style={{ flexShrink: 0 }}>
                <Tooltip content="Edit">
                  <Button appearance="subtle" size="sm" icon={<IconPen size={15} />} aria-label="Edit" onClick={() => window.open('/opal?artifacts=1', '_blank')} style={{ padding: 0, minWidth: 'auto', width: 32, height: 32 }} />
                </Tooltip>
                <Tooltip content="Detail View">
                  <Button appearance="subtle" size="sm" icon={<IconArrowUpRightFromSquare size={14} />} aria-label="Detail View" onClick={() => window.open('/opal?artifacts=1', '_blank')} style={{ padding: 0, minWidth: 'auto', width: 32, height: 32 }} />
                </Tooltip>
              </Box>
            </Box>
            {/* Content */}
            <style>{`
              .geo-qa-prose h1 { font-size: 20px; font-weight: 700; line-height: 1.3; margin: 0 0 4px; color: var(--ax-colors-fg-default); }
              .geo-qa-prose h2 { font-size: 14px; font-weight: 600; margin: 20px 0 6px; color: var(--ax-colors-fg-default); }
              .geo-qa-prose p { font-size: 14px; line-height: 1.6; color: var(--ax-colors-fg-secondary); margin: 0 0 10px; }
              .geo-qa-prose em { color: var(--ax-colors-fg-tertiary); font-style: italic; }
            `}</style>
            <div
              className="geo-qa-prose"
              style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}
              dangerouslySetInnerHTML={{ __html: GEO_QA_HTML }}
            />
          </Box>
        )}
        {cosPreviewOpen && isCoSConv && (
          <Box style={{
            width: 420,
            minWidth: 280,
            flexShrink: 0,
            height: '100%',
            overflow: 'hidden',
            borderLeft: '1px solid var(--ax-colors-border-secondary)',
            animation: 'chatSlideIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--ax-colors-bg-default)',
          }}>
            <Box display="flex" alignItems="center" gap="8" style={{ padding: '0 12px 0 8px', height: 56, flexShrink: 0, borderBottom: '1px solid var(--ax-colors-border-secondary)' }}>
              <Tooltip content="Close">
                <Button appearance="subtle" size="sm" icon={<IconXmark size={16} />} aria-label="Close" onClick={() => setCosPreviewOpen(false)} style={{ padding: 0, minWidth: 'auto', width: 32, height: 32, flexShrink: 0 }} />
              </Tooltip>
              <Text fontWeight="500" style={{ fontSize: 14, color: 'var(--ax-colors-fg-default)', flex: 1 }}>Daily Brief</Text>
            </Box>
            <div style={{ height: 120, overflow: 'hidden', flexShrink: 0 }}>
              <Image src="/cos-cover-daily-brief.png" alt="Daily Brief" width={640} height={120} unoptimized style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
            </div>
            <style>{COS_BRIEF_CSS}</style>
            <div
              className="cos-brief"
              style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}
              dangerouslySetInnerHTML={{ __html: COS_BRIEF_HTML_BY_VARIANT[cosVariant] }}
            />
          </Box>
        )}
        {taskPanelOpen && (
          <Box style={{
            width: taskPanelWidth,
            minWidth: 280,
            flexShrink: 0,
            height: '100%',
            overflow: 'hidden',
            borderLeft: '1px solid var(--ax-colors-border-secondary)',
            animation: 'chatSlideIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
            position: 'relative',
          }}>
            {/* Drag handle — left edge */}
            <div
              onMouseDown={handleTaskPanelDragStart}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 4,
                height: '100%',
                cursor: 'col-resize',
                zIndex: 10,
              }}
            />
            <HeadlessTaskPanel
              open={taskPanelOpen}
              onClose={() => setTaskPanelOpen(false)}
              controller={taskController}
            />
          </Box>
        )}
      </Box>
      <NewChatDialog
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        onCreated={(id) => {
          setSelectedId(id);
          broadcastIMEvent({ type: "conversation-created", conversationId: id });
        }}
        initialMode={newChatMode}
      />

    </>
  );
}

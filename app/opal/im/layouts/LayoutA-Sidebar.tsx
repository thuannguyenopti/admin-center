"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Box, Button, Text, Tooltip } from "@optiaxiom/react";
import { IconXmark, IconCode, IconArrowsMaximize, IconArrowUpRightFromSquare, IconEye, IconArrowRotateLeft, IconArrowRotateRight, IconCopy } from "@optiaxiom/icons";
import {
  groupConversationsByType,
  imToChatMessage,
  conversationToHistoryItem,
} from "../lib/adapters";
import { useIMData } from "../hooks/useIMData";
import { NewChatDialog } from "../components/NewChatDialog";
import { AddMemberButton } from "../components/AddMemberButton";
import { broadcastIMEvent } from "../lib/broadcast";
import { formatQuoteMarkdown } from "../lib/quote";
import { sendMessageAsVAU } from "../lib/virtualTeammates";
import { AskQuestionsActionCard } from "@/app/components/Opal/AskQuestionsActionCard";
import { ApprovalActionCard } from "@/app/components/Opal/ApprovalActionCard";
import { HeadlessTaskPanel, useTaskController } from "../../components/HeadlessTaskPanel";

const TONY_CONV_ID = "conv-vau-tony";
const TONY_FOLLOWUP_MSG_ID = "msg-vt3";
const HENRY_CONV_ID = "conv-vau-henry";
const GEO_QA_CONV_ID = "conv-demo-geo-qa";
const GEO_QA_ARTIFACT_MSG_ID = "msg-dg4";
const FRANK_DM_CONV_ID = "conv-demo-frank-dm";

const OpalChatView = dynamic(
  () => import("@/app/components/Opal/OpalChatView").then((m) => m.OpalChatView),
  { ssr: false },
);

const GEO_QA_ARTICLE = `# GEO Q&A: Discover the Unknown

**Brand:** Stride · **Format:** GEO Q&A · **Status:** Updated v2

---

**Q: What kinds of activities does Stride support?**
A: Stride is built for the full spectrum of endurance and adventure sport — trail running, climbing, open-water diving, skydiving, and multi-terrain endurance challenges. If the environment pushes you to your edge, Stride tracks it.

**Q: Can Stride be used for team challenges?**
A: Absolutely. Stride's group challenge engine is built around competitive multi-sport group formats — shared leaderboards, relay handoffs, and real-time crew rankings across disciplines. It's not generic team building; it's competitive co-operation.

**Q: How does Stride handle outdoor conditions?**
A: Stride integrates live weather, terrain difficulty, and elevation data into every session. The app surfaces real-time risk signals and adapts pacing targets based on conditions — no manual re-calibration needed.

**Q: What makes Stride different from other fitness apps?**
A: Most apps track movement. Stride tracks mastery. Every session is scored against your adaptive baseline — so a summit in a storm counts more than the same route on a clear day.

**Q: Is Stride designed for professionals or general adventurers?**
A: Both. Elite athletes use Stride's periodization tools and biometric integrations. Weekend explorers use the guided challenge packs. The core experience scales with your ambition.

**Q: How does Stride surface in AI-generated answers (GEO)?**
A: Stride's content is structured around high-intent query patterns — gear comparisons, discipline-specific training questions, and adventure planning. The Q&A format is optimised to appear in AI overview panels for queries like "best trail running watch for mountains" or "how to train for a multi-sport adventure race."

**Q: Where can I start?**
A: Discover the Unknown programme at stride.app/discover — seven disciplines, one adaptive plan.`;

/** Drag handle on the left edge of a right-side panel */
function PanelResizeHandle({ onDelta }: { onDelta: (delta: number) => void }) {
  const startX = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    const onMove = (ev: MouseEvent) => {
      const delta = startX.current - ev.clientX; // drag left → positive → wider
      startX.current = ev.clientX;
      onDelta(delta);
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    e.preventDefault();
  };

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        width: 4,
        height: "100%",
        cursor: "ew-resize",
        flexShrink: 0,
        background: "transparent",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--ax-colors-border-secondary)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
    />
  );
}

/** Shared header for right-side panels — matches IM header height */
function PanelHeader({
  icon,
  title,
  subtitle,
  onClose,
  actions,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClose: () => void;
  actions?: React.ReactNode;
}) {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap="8"
      px="12"
      style={{
        height: 52,
        flexShrink: 0,
        borderBottom: "1px solid var(--ax-colors-border-secondary)",
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: "color-mix(in srgb, var(--ax-colors-bg-accent) 12%, var(--ax-colors-bg-secondary))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text
          fontWeight="600"
          style={{
            fontSize: 13,
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            color="fg.tertiary"
            style={{
              fontSize: 11,
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {subtitle}
          </Text>
        )}
      </Box>
      {actions}
      <Button appearance="subtle" size="sm" icon={<IconXmark size={14} />} aria-label="Close" onClick={onClose} />
    </Box>
  );
}

const MIN_PANEL_WIDTH = 280;
const MAX_PANEL_WIDTH = 640;

/** Small preview panel — right side, resizable */
function IMPreviewPanel({
  width,
  onDelta,
  onClose,
  onLoadArtifact,
}: {
  width: number;
  onDelta: (delta: number) => void;
  onClose: () => void;
  onLoadArtifact: () => void;
}) {
  return (
    <Box
      display="flex"
      style={{
        width,
        flexShrink: 0,
        height: "100%",
        borderLeft: "1px solid var(--ax-colors-border-secondary)",
        overflow: "hidden",
        animation: "panelSlideIn 0.25s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      <style>{`@keyframes panelSlideIn { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:translateX(0); } }`}</style>
      <PanelResizeHandle onDelta={onDelta} />
      <Box display="flex" flexDirection="column" style={{ flex: 1, minWidth: 0, height: "100%", background: "var(--ax-colors-bg-default)" }}>
        <PanelHeader
          icon={<IconCode size={14} style={{ color: "var(--ax-colors-fg-secondary)" }} />}
          title="discover-the-unknown-qa.md"
          subtitle="GEO Q&A article · 7 Q&A pairs · updated"
          onClose={onClose}
          actions={
            <Tooltip content="Load in artifact view" delayDuration={300}>
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconArrowsMaximize size={14} />}
                aria-label="Load in artifact view"
                onClick={onLoadArtifact}
              />
            </Tooltip>
          }
        />
        <Box flex="1" style={{ overflow: "auto", padding: "20px 24px" }}>
          {GEO_QA_ARTICLE.split("\n\n").map((block, i) => {
            if (block.startsWith("# ")) {
              return <p key={i} style={{ fontSize: 16, fontWeight: 700, marginBottom: 2, marginTop: 0 }}>{block.slice(2)}</p>;
            }
            if (block.startsWith("**Brand:**")) {
              return <Text key={i} color="fg.tertiary" style={{ fontSize: 11, marginBottom: 16, display: "block" }}>{block.replace(/\*\*/g, "")}</Text>;
            }
            if (block === "---") {
              return <Box key={i} style={{ height: 1, background: "var(--ax-colors-border-secondary)", marginBottom: 16 }} />;
            }
            if (block.startsWith("**Q:")) {
              const [q, ...aParts] = block.split("\nA:");
              return (
                <Box key={i} mb="16">
                  <Text fontWeight="600" style={{ fontSize: 13, lineHeight: "20px", display: "block" }}>{q.replace(/\*\*/g, "")}</Text>
                  <Text color="fg.secondary" style={{ fontSize: 13, lineHeight: "20px", display: "block", marginTop: 2 }}>{aParts.join("A:").trim()}</Text>
                </Box>
              );
            }
            return null;
          })}
        </Box>
      </Box>
    </Box>
  );
}



const BRIEF_SECTIONS = [
  {
    label: "TODAY'S PRIORITIES",
    heading: "What needs your attention",
    bullets: [
      "Q3 campaign brief review - feedback to EOD",
      "Sync with content team on calendar finalization",
      "Approve 2 pending blog posts in the review queue",
    ],
  },
  {
    label: "CONTENT PIPELINE",
    heading: "Coming due this week",
    bullets: [
      "Q3 campaign brief due",
      "Finalize event merchandise for Glossier Foundation release",
      "Approve 2 pending blog posts in the review queue",
    ],
  },
  {
    label: "UPCOMING MEETINGS",
    heading: "On your calendar",
    bullets: [
      "10:00 AM — Q3 planning sync with content team",
      "2:30 PM — Stakeholder review: Glossier campaign assets",
      "4:00 PM — Weekly 1:1 with Jessica",
    ],
  },
];

function DailyBriefCanvas({ onClose }: { onClose: () => void }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{
        flex: 1,
        minWidth: 0,
        height: "100%",
        background: "var(--ax-colors-bg-default)",
        boxShadow: "0 1px 3px rgba(16,24,40,0.1), 0 1px 2px rgba(16,24,40,0.06)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <Box
        display="flex"
        alignItems="center"
        gap="8"
        px="24"
        style={{
          height: 48,
          flexShrink: 0,
          background: "var(--ax-colors-bg-secondary)",
          borderBottom: "1px solid var(--ax-colors-border-default)",
        }}
      >
        {/* Code / Preview toggles */}
        <Box display="flex" alignItems="center" gap="4">
          <Button appearance="subtle" size="sm" icon={<IconCode size={15} />} aria-label="Code" />
          <Button appearance="subtle" size="sm" icon={<IconEye size={15} />} aria-label="Preview" />
        </Box>
        {/* Spacer */}
        <Box style={{ flex: 1 }} />
        {/* Status + actions */}
        <Text color="fg.tertiary" style={{ fontSize: 12, whiteSpace: "nowrap" }}>Change saved.</Text>
        <Button appearance="subtle" size="sm" icon={<IconArrowRotateLeft size={14} />} aria-label="Undo" />
        <Button appearance="subtle" size="sm" icon={<IconArrowRotateRight size={14} />} aria-label="Redo" />
        <Button appearance="subtle" size="sm" icon={<IconCopy size={14} />} aria-label="Copy" />
        <Button appearance="subtle" size="sm" icon={<IconArrowsMaximize size={14} />} aria-label="Fullscreen" />
        <Button appearance="subtle" size="sm" icon={<IconXmark size={14} />} aria-label="Close" onClick={onClose} />
      </Box>

      {/* Canvas body */}
      <Box
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#f9fcf8",
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      >
        {/* Hero image — clipped to center strip showing the date */}
        <div style={{ width: "100%", height: 220, overflow: "hidden" }}>
          <img
            src="/avatars/june.png"
            alt="Daily brief"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 45%" }}
          />
        </div>

        {/* Content */}
        <Box style={{ padding: "32px 32px 48px" }}>
          {/* Tagline */}
          <Text style={{ fontSize: 16, color: "var(--ax-colors-fg-secondary)", lineHeight: "1.5", display: "block" }}>
            Happy Wednesday, here's what's on your plate today.
          </Text>

          {BRIEF_SECTIONS.map((section, i) => (
            <Box key={i}>
              <Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "24px 0" }} />
              <Text style={{ fontFamily: "Roboto Mono, monospace", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.36px", color: "var(--ax-colors-fg-secondary)", lineHeight: "1.25" }}>
                {section.label}
              </Text>
              <Text
                style={{
                  fontFamily: "var(--ax-font-family-headings)",
                  fontSize: 20,
                  fontWeight: 600,
                  lineHeight: "1.1",
                  letterSpacing: "0.4px",
                  color: "#202320",
                  marginTop: 12,
                  display: "block",
                }}
              >
                {section.heading}
              </Text>
              <ul style={{ marginTop: 16, paddingLeft: 24, display: "flex", flexDirection: "column", gap: 8 }}>
                {section.bullets.map((b, j) => (
                  <li key={j} style={{ fontSize: 16, color: "var(--ax-colors-fg-default)", lineHeight: "1.5", listStyleType: "disc" }}>
                    {b}
                  </li>
                ))}
              </ul>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export function LayoutASidebar() {
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
  } = useIMData();
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatMode, setNewChatMode] = useState<"dm" | "group" | "channel">("dm");
  const [quotedMsgId, setQuotedMsgId] = useState<string | null>(null);
  const [tonyCardAnswered, setTonyCardAnswered] = useState(false);

  const [briefOpen, setBriefOpen] = useState(false);

  // Welcome message injected when landing from the VAU hire flow
  const [frankWelcome, setFrankWelcome] = useState<{ name: string; avatar: string } | null>(() => {
    try {
      const raw = sessionStorage.getItem("im-vau-welcome");
      if (raw) { sessionStorage.removeItem("im-vau-welcome"); return JSON.parse(raw); }
    } catch {}
    return null;
  });

  // The Tony killswitch confirmation flow is "still pending" whenever Tony's
  // DM is in the conversation list AND the last message there is still Tony's
  // pre-confirmation prompt (msg-vt3 / "Got it — killing the test now..."),
  // i.e. JC hasn't sent the confirmation summary yet. This computes from the
  // conversation index alone, so it works even when Tony's DM isn't open.
  const tonyConv = conversations.find((c) => c.conversation_id === TONY_CONV_ID);
  const tonyFlowPending =
    !!tonyConv &&
    tonyConv.last_message_sender_id === "vau-tony" &&
    (tonyConv.last_message_preview ?? "").startsWith(
      "Got it — killing the test now",
    );

  // Henry asked JC whether to prep a competitive brief — flag Henry's DM as
  // needing input until JC responds.
  const henryConv = conversations.find((c) => c.conversation_id === HENRY_CONV_ID);
  const henryFlowPending =
    !!henryConv && henryConv.last_message_sender_id === "vau-henry";

  // Frank's geo-qa article is awaiting final approval from JC.
  const geoQaConv = conversations.find((c) => c.conversation_id === GEO_QA_CONV_ID);
  const geoQaFlowPending =
    !!geoQaConv && geoQaConv.last_message_sender_id === "vau-frank";
  const showGeoQaCard =
    selectedId === GEO_QA_CONV_ID &&
    messages.some((m) => m.id === GEO_QA_ARTIFACT_MSG_ID);

  // Hide the card once JC has already posted the confirmation summary —
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
    // Surface the action-card "Needs input" indicator when a flow is pending.
    for (const section of Object.values(grouped)) {
      for (const item of section) {
        if (item.id === TONY_CONV_ID && tonyFlowPending) item.needsInput = true;
        if (item.id === HENRY_CONV_ID && henryFlowPending) item.needsInput = true;
        if (item.id === GEO_QA_CONV_ID && geoQaFlowPending) item.needsInput = true;
      }
    }
    // Pin priority threads to the top of Direct messages: Frank DM first, geo-qa second, tony third.
    const dms = grouped["Direct messages"];
    if (dms) {
      const priority = [TONY_CONV_ID, GEO_QA_CONV_ID, FRANK_DM_CONV_ID]; // reverse order so Frank DM ends up first
      for (const id of priority) {
        const idx = dms.findIndex((i) => i.id === id);
        if (idx > 0) {
          const [item] = dms.splice(idx, 1);
          dms.unshift(item);
        }
      }
    }
    return grouped;
  }, [conversations, profiles, tonyFlowPending, henryFlowPending, geoQaFlowPending]);

  const showFrankWelcome = selectedId === FRANK_DM_CONV_ID;

  const chatMessages = useMemo(() => {
    const msgs = messages.map((m) => imToChatMessage(m, profiles));
    if (showGeoQaCard) {
      const idx = msgs.findIndex((m) => m.id === GEO_QA_ARTIFACT_MSG_ID);
      if (idx !== -1) msgs[idx] = { ...msgs[idx], cardAfterKey: "geo-qa-approval" };
    }
    if (showFrankWelcome) {
      const idx = msgs.findIndex((m) => m.id === "msg-fd1");
      if (idx !== -1) {
        const override = frankWelcome;
        msgs[idx] = {
          ...msgs[idx],
          cardAfterKey: "frank-welcome-brief",
          metadata: {
            ...msgs[idx].metadata,
            ...(override ? { authorName: override.name, authorAvatar: override.avatar } : {}),
          },
        };
      }
    }
    return msgs;
  }, [messages, profiles, showGeoQaCard, showFrankWelcome, frankWelcome]);

  // Derive IM header props from the selected conversation.
  const selectedConv = conversations.find((c) => c.conversation_id === selectedId);
  const selectedItem = useMemo(
    () => (selectedConv ? conversationToHistoryItem(selectedConv, profiles) : null),
    [selectedConv, profiles],
  );
  const imIsVAU = selectedItem?.isVAU ?? false;
  const imIsChannel = selectedItem?.isChannel ?? false;
  const imThreadAvatar = selectedItem?.avatarUrl;
  const imTemplateName = selectedItem?.vauTemplateName;
  const imThreadName = selectedConv
    ? (selectedConv.name ??
        profiles[selectedConv.other_participant_ids?.[0] ?? ""] ??
        selectedId ??
        "")
    : "";

  const tonyCardQuestions = useMemo(
    () => [
      {
        id: "rollback-target",
        label: "What should traffic roll back to?",
        options: [
          {
            value: "control",
            label: "Original control (Variant A)",
            description: "Safe — last known good state.",
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
            label: "Yes — ping Mary Anne with the killswitch summary",
          },
          {
            value: "no",
            label: "No — I'll loop her in directly",
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
            label: "Skip — cause already identified",
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
        "On it. Killswitch firing now — I'll ping you the moment the rollback is live and confirm conversion stabilizes.",
      );
      await refreshCurrentMessages();
    }
  };

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

  // Mirrors the geo-qa approval state so the card updates immediately when the
  // task panel (not the button) triggers the approval.
  const [geoQaApprovalState, setGeoQaApprovalState] = useState<"pending" | "approved" | "changes-requested">(() => {
    try {
      const saved = localStorage.getItem("geo-qa-approval");
      if (saved === "approved" || saved === "changes-requested") return saved;
    } catch {}
    return "pending";
  });

  // Always holds the latest messages so the guard below never reads a stale closure.
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const handleGeoQaApprove = async () => {
    // Primary guard: localStorage persists across navigation and survives Vercel
    // serverless resets (where the server-side message store is re-seeded).
    try {
      if (localStorage.getItem("geo-qa-approval") === "approved") return;
      localStorage.setItem("geo-qa-approval", "approved");
    } catch {}
    setGeoQaApprovalState("approved");
    // Secondary guard: check via ref so we always see the latest messages even
    // though this function may be captured in a stale geoQaMessageCards closure.
    const alreadySent = messagesRef.current.some(
      (m) => m.sender_id === "vau-frank" && m.content?.includes("handle publishing")
    );
    if (alreadySent) return;
    const convId = selectedId;
    await sendCurrent("**Approved** — great work, Frank. This is ready to publish.");
    if (convId) {
      await sendMessageAsVAU(
        "vau-frank",
        convId,
        "Perfect — I'll handle publishing now and send you the live link once it's indexed.",
      );
      await refreshCurrentMessages();
    }
  };

  const handleGeoQaReject = async () => {
    await sendCurrent("**Changes requested** — a few things to revise before we publish. Let me leave notes inline.");
    await refreshCurrentMessages();
  };

  const taskController = useTaskController("geo-qa", (stepId) => {
    if (stepId === "2") handleGeoQaApprove();
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(360);
  const [taskWidth, setTaskWidth] = useState(360);

  const geoQaMessageCards = useMemo(() => {
    if (!showGeoQaCard) return undefined;
    return {
      "geo-qa-approval": (
        <ApprovalActionCard
          authorName="Frank"
          authorAvatar="/avatars/vau-frank.png"
          isVAU
          badge="UPDATED"
          fileName="discover-the-unknown-qa.md"
          fileSubtitle="GEO Q&A article · 7 Q&A pairs · updated"
          onPreview={() => setPreviewOpen(true)}
          onViewTask={() => setTaskOpen(true)}
          approvalTitle="Team approval needed"
          approvalDescription="Review the updated Q&A article. Approve to proceed with publishing, or request further changes."
          onApprove={async () => { await handleGeoQaApprove(); taskController.completeStep("2"); }}
          onRequestChanges={handleGeoQaReject}
          selected={previewOpen}
          persistKey="geo-qa-approval"
          approvalState={geoQaApprovalState}
        />
      ),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGeoQaCard, previewOpen, taskOpen, geoQaApprovalState]);

  const frankWelcomeCards = useMemo(() => {
    if (selectedId !== FRANK_DM_CONV_ID) return undefined;
    return {
      "frank-welcome-brief": (
        <Box
          style={{
            background: "var(--ax-colors-bg-default)",
            border: "1px solid var(--ax-colors-border-default)",
            borderRadius: 12,
            padding: 20,
            maxWidth: 560,
          }}
        >
          <Box
            style={{
              width: "100%",
              borderRadius: 6,
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            <img
              src="/avatars/daily-brief.png"
              alt="Daily brief"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </Box>
          <Box display="flex" justifyContent="flex-end" gap="8">
            <Button size="md" addonAfter={<span style={{ fontSize: 12 }}>▾</span>}>
              Download
            </Button>
            <Button appearance="primary" size="md" onClick={() => setBriefOpen(true)}>
              Open brief
            </Button>
          </Box>
        </Box>
      ),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, setBriefOpen]);

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
      rounded="sm"
      style={{
        borderLeft: "3px solid var(--ax-colors-bg-accent)",
        background: "var(--ax-colors-bg-secondary)",
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

  if (briefOpen) {
    return (
      <>
        <Box display="flex" h="full" style={{ minHeight: 0, gap: 0 }}>
          {/* Daily Brief canvas — main area */}
          <Box style={{ flex: 1, minWidth: 0, height: "100%", padding: "8px 0 8px 8px", overflow: "hidden" }}>
            <DailyBriefCanvas onClose={() => setBriefOpen(false)} />
          </Box>

          {/* Randy IM chat — right drawer */}
          <Box style={{ width: 360, flexShrink: 0, height: "100%", borderLeft: "1px solid var(--ax-colors-border-secondary)", overflow: "hidden" }}>
            <OpalChatView
              variant="home"
              streamingMode="expanded"
              messages={chatMessages}
              inputValue={inputValue}
              isLoading={false}
              setInputValue={setInputValue}
              onSend={handleSend}
              onSuggestionClick={() => {}}
              onToggleHistory={() => {}}
              onNewChat={() => {}}
              onCreateInSection={() => {}}
              isHistoryVisible={false}
              groupedHistory={{}}
              activeChat={selectedId}
              searchQuery=""
              onSearchChange={() => {}}
              onSelectChat={setSelectedId}
              onDeleteChat={() => {}}
              mentionableAgents={mentionableAgents}
              onMentionSelect={(agent) => insertMention(agent.handle)}
              canvasMode={true}
              leftCanvas={undefined}
              currentUserId={currentUserId}
              messageReactions={messageReactions}
              onToggleReaction={toggleReaction}
              onQuoteReply={(msgId) => setQuotedMsgId(msgId)}
              aboveInputContent={null}
              messageCards={{ ...geoQaMessageCards, ...frankWelcomeCards }}
              onAttachFile={attachFile}
              headerTitle="Threads"
              newChatLabel="New Thread"
              imThreadName={imThreadName}
              imIsVAU={imIsVAU}
              imIsChannel={imIsChannel}
              imThreadAvatar={imThreadAvatar}
              imTemplateName={imTemplateName}
              imSimplified={true}
              onCloseChat={() => setBriefOpen(false)}
            />
          </Box>
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

  return (
    <>
      <Box display="flex" h="full" style={{ minHeight: 0 }}>
        <Box style={{ flex: 1, minWidth: 0, height: "100%", overflow: "hidden" }}>
          <OpalChatView
            variant="home"
            streamingMode="expanded"
            messages={chatMessages}
            inputValue={inputValue}
            isLoading={false}
            setInputValue={setInputValue}
            onSend={handleSend}
            onSuggestionClick={() => {}}
            onToggleHistory={() => setIsHistoryVisible((v) => !v)}
            onNewChat={() => openNewChat("dm")}
            onCreateInSection={handleCreateInSection}
            sectionAddTooltips={{
              Channels: "New channel",
              "Direct messages": "New message",
            }}
            isHistoryVisible={isHistoryVisible}
            groupedHistory={groupedHistory}
            activeChat={selectedId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectChat={setSelectedId}
            onDeleteChat={() => {}}
            mentionableAgents={mentionableAgents}
            onMentionSelect={(agent) => insertMention(agent.handle)}
            canvasMode={true}
            leftCanvas={undefined}
            currentUserId={currentUserId}
            messageReactions={messageReactions}
            onToggleReaction={toggleReaction}
            onQuoteReply={(msgId) => setQuotedMsgId(msgId)}
            aboveInputContent={quoteChip}
            inputOverride={tonyActionCard}
            disabled={tonyCardBlocking}
            messageCards={{ ...geoQaMessageCards, ...frankWelcomeCards }}
            onAttachFile={attachFile}
            headerTitle="Threads"
            newChatLabel="New Thread"
            imThreadName={imThreadName}
            imIsVAU={imIsVAU}
            imIsChannel={imIsChannel}
            imThreadAvatar={imThreadAvatar}
            imTemplateName={imTemplateName}
            imSimplified={previewOpen}
            onOpenArtifact={() => setPreviewOpen(true)}
            onCloseChat={previewOpen ? () => setPreviewOpen(false) : undefined}
            imHeaderRight={previewOpen ? (
              <Tooltip content="View in Messaging">
                <Button
                  appearance="subtle"
                  size="sm"
                  icon={<IconArrowUpRightFromSquare style={{ width: 15, height: 15 }} />}
                  aria-label="View in Messaging"
                  onClick={() => window.open('/opal/im', '_blank')}
                  style={{ padding: 0, minWidth: 'auto', width: 32, height: 32 }}
                />
              </Tooltip>
            ) : undefined}
          />
        </Box>

        {/* Right-side panels — both can be open simultaneously */}
        {previewOpen && (
          <IMPreviewPanel
            width={previewWidth}
            onDelta={(d) => setPreviewWidth((w) => Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, w + d)))}
            onClose={() => setPreviewOpen(false)}
            onLoadArtifact={() => { window.location.href = '/opal?artifacts=1'; }}
          />
        )}
        {taskOpen && (
          <Box
            display="flex"
            style={{
              width: taskWidth,
              flexShrink: 0,
              height: "100%",
              borderLeft: "1px solid var(--ax-colors-border-secondary)",
              overflow: "hidden",
              animation: "panelSlideIn 0.25s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <PanelResizeHandle onDelta={(d) => setTaskWidth((w) => Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, w + d)))} />
            <Box style={{ flex: 1, minWidth: 0, height: "100%", overflow: "hidden" }}>
              <HeadlessTaskPanel
                open={taskOpen}
                onClose={() => setTaskOpen(false)}
                controller={taskController}
              />
            </Box>
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
      {selectedIsGroup && selectedId && (
        <AddMemberButton
          conversationId={selectedId}
          existingMemberIds={selectedParticipantIds}
          onAdded={refreshSelected}
          style={{
            position: "fixed",
            top: 84,
            right:
              24 +
              (previewOpen ? previewWidth : 0) +
              (taskOpen ? taskWidth : 0),
            zIndex: 30,
            transition: "right 0.25s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      )}
    </>
  );
}

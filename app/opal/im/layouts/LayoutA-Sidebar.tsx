"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconXmark } from "@optiaxiom/icons";
import {
  groupConversationsByType,
  imToChatMessage,
} from "../lib/adapters";
import { useIMData } from "../hooks/useIMData";
import { NewChatDialog } from "../components/NewChatDialog";
import { AddMemberButton } from "../components/AddMemberButton";
import { broadcastIMEvent } from "../lib/broadcast";
import { formatQuoteMarkdown } from "../lib/quote";
import { sendMessageAsVAU } from "../lib/virtualTeammates";
import { AskQuestionsActionCard } from "@/app/components/Opal/AskQuestionsActionCard";

const TONY_CONV_ID = "conv-vau-tony";
const TONY_FOLLOWUP_MSG_ID = "msg-vt3";
const HENRY_CONV_ID = "conv-vau-henry";

const OpalChatView = dynamic(
  () => import("@/app/components/Opal/OpalChatView").then((m) => m.OpalChatView),
  { ssr: false },
);

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
    // Surface the action-card "Needs input" indicator on Tony's DM when the
    // confirmation flow is still pending — derived from the conversation
    // index so it shows up regardless of whether Tony's DM is currently open.
    for (const section of Object.values(grouped)) {
      for (const item of section) {
        if (item.id === TONY_CONV_ID && tonyFlowPending) item.needsInput = true;
        if (item.id === HENRY_CONV_ID && henryFlowPending) item.needsInput = true;
      }
    }
    // Pin Tony to the top of Direct messages — he has the latest update.
    const dms = grouped["Direct messages"];
    if (dms) {
      const tonyIdx = dms.findIndex((i) => i.id === TONY_CONV_ID);
      if (tonyIdx > 0) {
        const [tony] = dms.splice(tonyIdx, 1);
        dms.unshift(tony);
      }
    }
    return grouped;
  }, [conversations, profiles, tonyFlowPending, henryFlowPending]);

  const chatMessages = useMemo(
    () => messages.map((m) => imToChatMessage(m, profiles)),
    [messages, profiles],
  );

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
        currentUserId={currentUserId}
        messageReactions={messageReactions}
        onToggleReaction={toggleReaction}
        onQuoteReply={(msgId) => setQuotedMsgId(msgId)}
        aboveInputContent={quoteChip}
        inputOverride={tonyActionCard}
        disabled={tonyCardBlocking}
        onAttachFile={attachFile}
        headerTitle="Threads"
        newChatLabel="New Thread"
      />
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
          style={{ position: "fixed", top: 84, right: 24, zIndex: 30 }}
        />
      )}
    </>
  );
}

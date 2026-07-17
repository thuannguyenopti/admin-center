"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconXmark } from "@optimizely/axiom-icons";
import { imToChatMessage } from "../lib/adapters";
import { useIMData } from "../hooks/useIMData";
import { ConversationPicker } from "../components/ConversationPicker";
import { NewChatDialog } from "../components/NewChatDialog";
import { AddMemberButton } from "../components/AddMemberButton";
import { formatQuoteMarkdown } from "../lib/quote";

const OpalChatView = dynamic(
  () => import("@/app/components/Opal/OpalChatView").then((m) => m.OpalChatView),
  { ssr: false },
);

const PANEL_WIDTH = 440;

export function LayoutCPanel() {
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
    inputValue,
    setInputValue,
    insertMention,
    attachFile,
    currentUserId,
    isLoading,
  } = useIMData();
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [quotedMsgId, setQuotedMsgId] = useState<string | null>(null);

  const chatMessages = useMemo(
    () => messages.map((m) => imToChatMessage(m, profiles)),
    [messages, profiles],
  );

  const quotedMessage = useMemo(
    () => quotedMsgId ? messages.find((m) => m.id === quotedMsgId) ?? null : null,
    [quotedMsgId, messages],
  );

  const mentionableAgents = useMemo(
    () =>
      Object.entries(profiles).map(([id, name]) => ({
        id,
        emoji: "👤",
        name,
        handle: name.toLowerCase().replace(/\s+/g, ""),
        group: "user" as const,
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
        marginBottom: 4,
      }}
    >
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text fontSize="sm" fontWeight="600" color="fg.default">
          {profiles[quotedMessage.sender_id] ?? quotedMessage.sender_id}
        </Text>
        <Text
          fontSize="sm"
          color="fg.tertiary"
          style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
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
    <Box
      style={{
        height: "100vh",
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02))",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <Box
        style={{
          width: PANEL_WIDTH,
          height: "100%",
          background: "var(--ax-colors-bg-default)",
          borderLeft: "1px solid var(--ax-colors-border-secondary)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box display="flex" alignItems="center" gap="8" style={{ paddingRight: 12 }}>
          <Box style={{ flex: 1 }}>
            <ConversationPicker
              conversations={conversations}
              profiles={profiles}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onNewChat={() => setNewChatOpen(true)}
            />
          </Box>
          {selectedIsGroup && selectedId && (
            <AddMemberButton
              conversationId={selectedId}
              existingMemberIds={selectedParticipantIds}
              onAdded={refreshSelected}
            />
          )}
        </Box>
        <NewChatDialog
          open={newChatOpen}
          onOpenChange={setNewChatOpen}
          onCreated={(id) => setSelectedId(id)}
        />
        <Box style={{ flex: 1, minHeight: 0 }}>
          <OpalChatView
            variant="home"
            streamingMode="expanded"
            messages={chatMessages}
            inputValue={inputValue}
            isLoading={isLoading}
            setInputValue={setInputValue}
            onSend={handleSend}
            onSuggestionClick={() => {}}
            isHistoryVisible={false}
            activeChat={selectedId}
            mentionableAgents={mentionableAgents}
            onMentionSelect={(agent) => insertMention(agent.handle)}
            canvasMode={true}
            onReaction={toggleReaction}
            onQuote={setQuotedMsgId}
            preInputContent={quoteChip}
          />
        </Box>
      </Box>
    </Box>
  );
}

"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Box } from "@optiaxiom/react";
import { imToChatMessage } from "../lib/adapters";
import { useIMData } from "../hooks/useIMData";
import { ConversationPicker } from "../components/ConversationPicker";
import { NewChatDialog } from "../components/NewChatDialog";
import { AddMemberButton } from "../components/AddMemberButton";

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
  } = useIMData();
  const [newChatOpen, setNewChatOpen] = useState(false);

  const chatMessages = useMemo(
    () => messages.map((m) => imToChatMessage(m, profiles)),
    [messages, profiles],
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
    setInputValue("");
    await sendCurrent(content);
  };

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
            isLoading={false}
            setInputValue={setInputValue}
            onSend={handleSend}
            onSuggestionClick={() => {}}
            isHistoryVisible={false}
            activeChat={selectedId}
            mentionableAgents={mentionableAgents}
            onMentionSelect={(agent) => insertMention(agent.handle)}
            canvasMode={true}
            currentUserId={currentUserId}
            messageReactions={messageReactions}
            onToggleReaction={toggleReaction}
            onAttachFile={attachFile}
            headerTitle="Messages"
          />
        </Box>
      </Box>
    </Box>
  );
}

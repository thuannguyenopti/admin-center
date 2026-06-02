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

export function LayoutBFullPage() {
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
    <Box display="flex" flexDirection="column" style={{ height: "100vh" }}>
      <Box display="flex" alignItems="center" gap="8" style={{ paddingRight: 20 }}>
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
  );
}

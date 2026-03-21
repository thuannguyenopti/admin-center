"use client";

import { Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { IconAgent } from "@optimizely/axiom-icons";
import { useOpalContext } from "@/app/context/OpalContext";
import { OpalInput } from "@/app/components/Opal/OpalInput";
import { OpalChatView } from "@/app/components/Opal/OpalChatView";
import { OpalLanding } from "@/app/components/Opal/OpalLanding";
import { useAgentChatMode } from "@/app/hooks/useAgentChatMode";
import { FEATURED_AGENTS, AGENT_PROMPTS } from "@/app/opal/opalAgents";

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
  } = opalContext.chatState;

  const {
    agentSession,
    setAgentSession,
    lastEndedSession,
    isResuming,
    triggerResumeHighlight,
    agentBarElement,
    sortedAgents,
    handleSelectAgent,
    handleSendMessage,
    handleSuggestionClick,
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
        <OpalChatView
          variant="home"
          messages={messages}
          inputValue={inputValue}
          isLoading={isLoading}
          error={error}
          setInputValue={setInputValue}
          onSend={handleSendMessage}
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
        />
      </Box>
    );
  }

  // Landing state
  return (
    <Box h="full" style={{ overflowY: "auto", overflowX: "hidden", minHeight: 0 }}>
      <OpalLanding
        topSlot={
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
                  // Skip prompt if this is the resume flow — handleResumeNo will set it
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
        }
        inputSlot={
          <OpalInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
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
        onSuggestionClick={handleSuggestionClick}
      />
    </Box>
  );
}

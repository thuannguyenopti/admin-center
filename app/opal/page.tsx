"use client";

import { Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { IconAgent } from "@optimizely/axiom-icons";
import dynamic from "next/dynamic";
import { useOpalContext } from "@/app/context/OpalContext";
import { OpalInput } from "@/app/components/Opal/OpalInput";
import { useAgentChatMode } from "@/app/hooks/useAgentChatMode";
import { FEATURED_AGENTS, AGENT_PROMPTS } from "@/app/opal/opalAgents";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AddConnectorModal, type ConnectedConnector } from "@/app/opal/tools/components/AddConnectorModal";
import { CONNECTORS } from "@/app/opal/tools/data/connectors";
import { ConnectorSuggestionCard } from "@/app/components/Opal/ConnectorSuggestionCard";

const OpalChatView = dynamic(
  () => import("@/app/components/Opal/OpalChatView").then((mod) => mod.OpalChatView)
);
const OpalLanding = dynamic(
  () => import("@/app/components/Opal/OpalLanding").then((mod) => mod.OpalLanding)
);

export default function OpalPage() {
  const router = useRouter();
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
  const [connectedConnectors, setConnectedConnectors] = useState<ConnectedConnector[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialConnector, setModalInitialConnector] = useState(CONNECTORS.find((connector) => connector.id === "atlassian-rovo") ?? null);
  const STORAGE_KEY = "opal_connected_connectors";

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
  const connectedIds = connectedConnectors.map((connector) => connector.id);
  const atlassianConnector = useMemo(
    () => CONNECTORS.find((connector) => connector.id === "atlassian-rovo") ?? null,
    []
  );
  const atlassianIntentPattern = /\b(jira|ticket|tickets|sprint|backlog|confluence|atlassian|issue|issues)\b/i;
  const shouldShowAtlassianCard =
    Boolean(inputValue.trim()) &&
    atlassianIntentPattern.test(inputValue) &&
    !connectedIds.includes("atlassian-rovo");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setConnectedConnectors(JSON.parse(raw));
      }
    } catch {
      // no-op
    }
  }, []);

  const handleConnectorAdded = (connector: ConnectedConnector) => {
    setConnectedConnectors((prev) => {
      const next = prev.some((item) => item.id === connector.id)
        ? prev.map((item) => (item.id === connector.id ? connector : item))
        : [...prev, connector];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleDisconnect = (id: string) => {
    setConnectedConnectors((prev) => {
      const next = prev.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const atlassianActionCard = shouldShowAtlassianCard && atlassianConnector ? (
    <ConnectorSuggestionCard
      onBrowseAll={() => router.push("/opal/connectors?tab=connectors")}
      onConnect={() => {
        setModalInitialConnector(atlassianConnector);
        setModalOpen(true);
      }}
    />
  ) : null;

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
        <AddConnectorModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onConnectorAdded={handleConnectorAdded}
          onDisconnect={handleDisconnect}
          connectedIds={connectedIds}
          initialConnector={modalInitialConnector}
          initialScreen="configure"
          initialStep={0}
        />
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
          contextualActionCard={atlassianActionCard}
        />
      </Box>
    );
  }

  // Landing state
  return (
    <Box h="full" style={{ overflowY: "auto", overflowX: "hidden", minHeight: 0 }}>
      <AddConnectorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onConnectorAdded={handleConnectorAdded}
        onDisconnect={handleDisconnect}
        connectedIds={connectedIds}
        initialConnector={modalInitialConnector}
        initialScreen="configure"
        initialStep={0}
      />
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
        contextualActionCard={atlassianActionCard}
        onSuggestionClick={handleSuggestionClick}
      />
    </Box>
  );
}

"use client";

import { Box } from "@optiaxiom/react";
import { OpalHeader } from "./Opal/OpalHeader";
import { OpalChat } from "./Opal/OpalChat";
import { OpalInput } from "./Opal/OpalInput";
import { OpalHistorySidebar } from "./Opal/OpalHistorySidebar";
import { ChatMessage } from "@/app/hooks/useOpalState";
import { ChatHistoryItem, OpalMode } from "@/app/hooks/useOpalHistory";
import { useLayout } from "@/app/context/LayoutContext";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AddConnectorModal, type ConnectedConnector } from "@/app/opal/tools/components/AddConnectorModal";
import { CONNECTORS } from "@/app/opal/tools/data/connectors";
import { ConnectorSuggestionCard } from "@/app/components/Opal/ConnectorSuggestionCard";

type OpalPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  inputValue: string;
  isLoading: boolean;
  isInputDisabled?: boolean;
  error?: string;
  setInputValue: (value: string) => void;
  sendMessage: (content: string) => void;
  regenerate?: (id: string) => void;

  groupedHistory: { [key: string]: ChatHistoryItem[] };
  activeChat: string | null;
  searchQuery: string;
  isHistoryVisible: boolean;
  mode: OpalMode;
  setSearchQuery: (query: string) => void;
  toggleHistory: () => void;
  toggleMode: () => void;
  createNewChat: () => void;
  deleteChat: (id: string) => void;
  selectChat: (id: string) => void;
  contextChip?: string | null;
  contextContent?: string | null;
  onContextChipRemove?: () => void;
};

export function OpalPanel({
  isOpen,
  onClose,
  messages,
  inputValue,
  isLoading,
  isInputDisabled = false,
  error,
  setInputValue,
  sendMessage,
  regenerate,
  groupedHistory,
  activeChat,
  searchQuery,
  isHistoryVisible,
  mode,
  setSearchQuery,
  toggleHistory,
  toggleMode,
  createNewChat,
  deleteChat,
  selectChat,
  contextChip,
  contextContent,
  onContextChipRemove,
}: OpalPanelProps) {
  const router = useRouter();
  const { setOpalPanelWidth } = useLayout();
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [connectedConnectors, setConnectedConnectors] = useState<ConnectedConnector[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialConnector, setModalInitialConnector] = useState(
    CONNECTORS.find((connector) => connector.id === "atlassian-rovo") ?? null
  );
  const STORAGE_KEY = "opal_connected_connectors";

  const handleSend = (content?: string) => {
    const msg = content ?? inputValue;
    if (msg.trim() && !isLoading && !isInputDisabled) {
      sendMessage(msg);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const connectedIds = connectedConnectors.map((connector) => connector.id);
  const atlassianConnector = useMemo(
    () => CONNECTORS.find((connector) => connector.id === "atlassian-rovo") ?? null,
    []
  );
  const atlassianIntentPattern =
    /\b(jira|ticket|tickets|sprint|backlog|confluence|atlassian|issue|issues)\b/i;
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

  // Resize handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 300 && newWidth <= 800) {
      setCustomWidth(newWidth);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add/remove global mouse event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Calculate width - use custom width if set, otherwise use default
  const baseWidth = customWidth || 400;
  const historyWidth = 272;
  const totalWidth = isHistoryVisible ? baseWidth + historyWidth : baseWidth;

  // Update layout context with panel width
  useEffect(() => {
    if (isOpen) {
      setOpalPanelWidth(totalWidth);
    } else {
      setOpalPanelWidth(0);
    }
  }, [isOpen, totalWidth, setOpalPanelWidth]);

  if (!isOpen) return null;

  return (
    <Box
      className="opal-panel"
      style={{
        position: 'fixed',
        top: '57px',
        right: 0,
        bottom: 0,
        width: `${totalWidth}px`,
        backgroundColor: 'var(--opal-bg-primary)',
        borderLeft: '1px solid var(--opal-border-primary)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'row',
        overflowX: 'visible',
        overflowY: 'hidden',
        transition: 'width 0.3s cubic-bezier(0, 1, 0, 1)',
      }}
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
      {/* Grab Handle - only in docked mode */}
      {mode === 'docked' && (
        <Box
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            left: '0',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '10px',
            height: '52px',
            backgroundColor: 'var(--opal-bg-primary)',
            border: '1px solid var(--opal-border-secondary)',
            borderRadius: '4px',
            cursor: isResizing ? 'ew-resize' : 'ew-resize',
            zIndex: 100,
          }}
        />
      )}

      {/* History Sidebar - Always mounted for smooth transitions */}
      <OpalHistorySidebar
        groupedHistory={groupedHistory}
        activeChat={activeChat}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        mode={mode}
        isVisible={isHistoryVisible}
      />

      {/* Main Chat Area */}
      <Box
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <OpalHeader
          onClose={onClose}
          onToggleHistory={toggleHistory}
          onNewChat={createNewChat}
          onToggleMode={toggleMode}
        />
        <OpalChat
          messages={messages}
          onSuggestionClick={handleSuggestionClick}
          onRegenerate={regenerate}
          contextChip={contextChip}
          contextualActionCard={atlassianActionCard}
        />
        <div style={{ flexShrink: 0 }}>
          <OpalInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            disabled={isLoading || isInputDisabled}
            isLoading={isLoading}
            error={error}
            contextChip={contextChip}
            contextContent={contextContent}
            onContextChipRemove={onContextChipRemove}
          />
        </div>
      </Box>
    </Box>
  );
}

"use client";

import { Box } from "@optiaxiom/react";
import { OpalHeader } from "./Opal/OpalHeader";
import { OpalChat } from "./Opal/OpalChat";
import { OpalInput } from "./Opal/OpalInput";
import { OpalHistorySidebar } from "./Opal/OpalHistorySidebar";
import { ChatMessage } from "@/app/hooks/useOpalState";
import { ChatHistoryItem, OpalMode } from "@/app/hooks/useOpalHistory";

type OpalPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  inputValue: string;
  isLoading: boolean;
  error?: string;
  setInputValue: (value: string) => void;
  sendMessage: (content: string) => void;

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
};

export function OpalPanel({
  isOpen,
  onClose,
  messages,
  inputValue,
  isLoading,
  error,
  setInputValue,
  sendMessage,
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
}: OpalPanelProps) {
  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  if (!isOpen) return null;

  // Calculate width based on mode
  const baseWidth = mode === 'docked' ? 400 : 449;
  const historyWidth = mode === 'docked' ? 272 : 256;
  const totalWidth = isHistoryVisible ? baseWidth + historyWidth : baseWidth;

  const boxShadow = mode === 'docked' 
    ? '-6px 6px 25px rgba(12, 16, 29, 0.08)'
    : '0px 6px 18px rgba(9, 30, 66, 0.04), 0px 6px 12px rgba(9, 30, 66, 0.08), 0px 4px 4px 1px rgba(9, 30, 66, 0.04)';

  return (
    <Box
      className="opal-panel"
      style={{
        position: 'fixed',
        top: '64px',
        right: '20px',
        width: `${totalWidth}px`,
        height: 'calc(100vh - 84px)',
        backgroundColor: 'var(--opal-bg-primary)',
        border: '1px solid var(--opal-border-primary)',
        borderRadius: '8px',
        boxShadow,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        transition: 'width 0.3s cubic-bezier(0, 1, 0, 1)',
      }}
    >
      {/* Grab Handle - only in docked mode */}
      {mode === 'docked' && (
        <Box
          style={{
            position: 'absolute',
            left: '-5px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '10px',
            height: '52px',
            backgroundColor: 'var(--opal-bg-primary)',
            border: '1px solid var(--opal-border-secondary)',
            borderRadius: '4px',
            cursor: 'grab',
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
          mode={mode}
          isHistoryVisible={isHistoryVisible}
          onToggleHistory={toggleHistory}
          onToggleMode={toggleMode}
        />
        <OpalChat 
          messages={messages} 
          onSuggestionClick={handleSuggestionClick}
        />
        <OpalInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          disabled={isLoading}
          error={error}
        />
      </Box>
    </Box>
  );
}
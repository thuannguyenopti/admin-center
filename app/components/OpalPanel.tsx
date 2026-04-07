"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Box } from "@optiaxiom/react";
import { OpalHeader } from "./Opal/OpalHeader";
import { OpalChat } from "./Opal/OpalChat";
import { OpalInput } from "./Opal/OpalInput";
import { OpalHistorySidebar } from "./Opal/OpalHistorySidebar";
import { ChatMessage } from "@/app/hooks/useOpalState";
import { ChatHistoryItem, OpalMode } from "@/app/hooks/useOpalHistory";

const MIN_WIDTH = 320;
const MAX_WIDTH = 800;
const DEFAULT_TOP = 64;
const DEFAULT_RIGHT = 20;

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
  const baseWidth = mode === 'docked' ? 400 : 449;
  const historyWidth = mode === 'docked' ? 272 : 256;
  const defaultTotalWidth = isHistoryVisible ? baseWidth + historyWidth : baseWidth;

  const [position, setPosition] = useState<{ top: number; left: number | null }>({
    top: DEFAULT_TOP,
    left: null,
  });
  const [size, setSize] = useState({ width: defaultTotalWidth, height: 600 });

  useEffect(() => {
    setSize((s) => ({ ...s, height: window.innerHeight - 84 }));
  }, []);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; left: number; top: number }>({ x: 0, y: 0, left: 0, top: 0 });
  const resizeStartRef = useRef<{ x: number; width: number; left: number }>({ x: 0, width: 0, left: 0 });

  const totalWidth = size.width;
  const panelHeight = size.height;

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleHeaderMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      const left = position.left ?? (typeof window !== "undefined" ? window.innerWidth - totalWidth - DEFAULT_RIGHT : 0);
      dragStartRef.current = { x: e.clientX, y: e.clientY, left, top: position.top };
      setIsDragging(true);
    },
    [position.left, position.top, totalWidth],
  );

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const left = position.left ?? (typeof window !== "undefined" ? window.innerWidth - size.width - DEFAULT_RIGHT : 0);
    resizeStartRef.current = { x: e.clientX, width: size.width, left };
    setIsResizing(true);
  }, [size.width, position.left]);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      const delta = resizeStartRef.current.x - e.clientX;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, resizeStartRef.current.width + delta));
      const rightEdge = resizeStartRef.current.left + resizeStartRef.current.width;
      setSize((s) => ({ ...s, width: next }));
      setPosition((p) => ({ ...p, left: rightEdge - next }));
    };
    const onUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isResizing]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      setPosition({
        top: dragStartRef.current.top + e.clientY - dragStartRef.current.y,
        left: dragStartRef.current.left + e.clientX - dragStartRef.current.x,
      });
    };
    const onUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "move";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  const boxShadow = mode === 'docked'
    ? '-6px 6px 25px rgba(12, 16, 29, 0.08)'
    : '0px 6px 18px rgba(9, 30, 66, 0.04), 0px 6px 12px rgba(9, 30, 66, 0.08), 0px 4px 4px 1px rgba(9, 30, 66, 0.04)';

  const styleLeft = position.left;
  const styleRight = styleLeft == null ? DEFAULT_RIGHT : undefined;
  const styleTop = Math.max(0, position.top);

  return (
    <Box
      className="opal-panel"
      style={{
        position: 'fixed',
        top: `${styleTop}px`,
        ...(styleLeft != null ? { left: `${styleLeft}px` } : {}),
        ...(styleRight != null ? { right: `${styleRight}px` } : {}),
        width: `${totalWidth}px`,
        height: `${panelHeight}px`,
        backgroundColor: 'var(--opal-bg-sidebar)',
        border: '1px solid var(--opal-border-primary)',
        borderRadius: '8px',
        boxShadow,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
      }}
    >
      {/* Resize handle - only in docked mode */}
      {mode === 'docked' && (
        <Box
          role="separator"
          aria-label="Resize panel"
          onMouseDown={handleResizeMouseDown}
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
            cursor: 'col-resize',
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
        <Box
          onMouseDown={handleHeaderMouseDown}
          style={{
            cursor: isDragging ? "grabbing" : "move",
            flexShrink: 0,
          }}
        >
          <OpalHeader 
            onClose={onClose}
            mode={mode}
            isHistoryVisible={isHistoryVisible}
            onToggleHistory={toggleHistory}
            onToggleMode={toggleMode}
          />
        </Box>
        <OpalChat
          messages={messages}
          onSuggestionClick={handleSuggestionClick}
          onSubmitPrompt={sendMessage}
          isLoading={isLoading}
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
import { useState, useRef, useEffect, useCallback } from "react";
import { Box } from "@optiaxiom/react";
import { OpalHeader } from "./Opal/OpalHeader";
import { OpalChatView } from "./Opal/OpalChatView";
import { OpalHistorySidebar } from "./Opal/OpalHistorySidebar";
import { ChatMessage } from "@/app/hooks/useOpalState";
import { ChatHistoryItem, OpalMode } from "@/app/hooks/useOpalHistory";
import { motion, useDragControls } from "framer-motion";

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
  enableAI?: boolean;
  onEnableAIChange?: (enabled: boolean) => void;
  onMessageEdit?: (id: string, newContent: string) => void;
  onRegenerate?: (id: string) => void;
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
  enableAI,
  onEnableAIChange,
  onMessageEdit,
  onRegenerate
}: OpalPanelProps) {
  const dragControls = useDragControls();

  // Calculate default width based on mode
  const baseWidth = mode === 'docked' ? 400 : 449;
  const historyWidth = mode === 'docked' ? 272 : 256;
  const initialWidth = isHistoryVisible ? baseWidth + historyWidth : baseWidth;

  const [panelWidth, setPanelWidth] = useState(initialWidth);
  const [panelHeight, setPanelHeight] = useState(0); // Initialized in useEffect
  const [isResizing, setIsResizing] = useState<null | 'w' | 's' | 'sw'>(null);
  const [hasManuallyResized, setHasManuallyResized] = useState(false);
  const startRef = useRef({ x: 0, y: 0, w: initialWidth, h: 0 });

  // Initialize height on mount
  useEffect(() => {
    setPanelHeight(window.innerHeight - 84);
  }, []);

  // Sync width ONLY when initialWidth changes (e.g. toggle history/mode) 
  // and ONLY if the user hasn't manually resized it yet.
  useEffect(() => {
    if (!hasManuallyResized) {
      setPanelWidth(initialWidth);
    }
  }, [initialWidth, hasManuallyResized]);

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: 'w' | 's' | 'sw') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(direction);
    setHasManuallyResized(true);
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      w: panelWidth,
      h: panelHeight
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = direction === 'sw' ? 'sw-resize' : direction === 'w' ? 'ew-resize' : 'ns-resize';
  }, [panelWidth, panelHeight]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    setIsResizing(currentDir => {
      if (!currentDir) return null;

      const deltaX = startRef.current.x - e.clientX;
      const deltaY = e.clientY - startRef.current.y;

      if (currentDir === 'w' || currentDir === 'sw') {
        const newWidth = Math.min(Math.max(startRef.current.w + deltaX, 320), 1200);
        setPanelWidth(newWidth);
      }

      if (currentDir === 's' || currentDir === 'sw') {
        const newHeight = Math.min(Math.max(startRef.current.h + deltaY, 400), window.innerHeight - 84);
        setPanelHeight(newHeight);
      }

      return currentDir;
    });
  }, []);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(null);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'default';
  }, [handleResizeMove]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  if (!isOpen) return null;

  return (
    <Box
      asChild
      shadow="lg"
      style={{
        position: 'fixed',
        top: '64px',
        right: '20px',
        width: `${panelWidth}px`,
        height: panelHeight ? `${panelHeight}px` : 'calc(100vh - 84px)',
        backgroundColor: 'var(--opal-bg-primary)',
        border: '1px solid var(--opal-border-primary)',
        borderRadius: '8px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        transition: isResizing ? 'none' : 'width 0.3s cubic-bezier(0, 1, 0, 1), height 0.3s cubic-bezier(0, 1, 0, 1)',
      }}
    >
      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragListener={false}
      >
        {/* Width Resize Handle (Left Edge) */}
        <Box
          onMouseDown={(e) => handleResizeStart(e, 'w')}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 12,
            width: '6px',
            cursor: 'ew-resize',
            zIndex: 60,
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--opal-accent-purple-subtle)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        />

        {/* Height Resize Handle (Bottom Edge) */}
        <Box
          onMouseDown={(e) => handleResizeStart(e, 's')}
          style={{
            position: 'absolute',
            left: 12,
            right: 0,
            bottom: 0,
            height: '6px',
            cursor: 'ns-resize',
            zIndex: 60,
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--opal-accent-purple-subtle)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        />

        {/* Corner Resize Handle (Bottom-Left) */}
        <Box
          onMouseDown={(e) => handleResizeStart(e, 'sw')}
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '12px',
            height: '12px',
            cursor: 'sw-resize',
            zIndex: 70,
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--opal-accent-purple-subtle)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        />

        {/* History Sidebar */}
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
            style={{ cursor: 'grab', touchAction: 'none' }}
            onPointerDown={(e) => dragControls.start(e)}
          >
            <OpalHeader
              onClose={onClose}
              onNewChat={createNewChat}
              mode={mode}
              isHistoryVisible={isHistoryVisible}
              onToggleHistory={toggleHistory}
              onToggleMode={toggleMode}
            />
          </Box>
          <OpalChatView
            messages={messages}
            inputValue={inputValue}
            isLoading={isLoading}
            error={error}
            setInputValue={setInputValue}
            onSend={sendMessage}
            onSuggestionClick={handleSuggestionClick}
            variant="assistant"
            enableAI={enableAI}
            onEnableAIChange={onEnableAIChange}
            onMessageEdit={onMessageEdit}
            onRegenerate={onRegenerate}
          />
        </Box>
      </motion.div>
    </Box>
  );
}
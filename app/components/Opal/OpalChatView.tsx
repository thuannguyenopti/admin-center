"use client";

import { Box } from "@optiaxiom/react";
import { OpalChat } from "./OpalChat";
import { OpalInput, MentionableAgent } from "./OpalInput";
import { ChatMessage } from "@/app/hooks/useOpalState";
import { ChatHistoryItem } from "@/app/hooks/useOpalHistory";
import { ReactNode, useCallback, useRef, useState } from "react";
import { OpalHeader } from "./OpalHeader";
import { OpalHistorySidebar } from "./OpalHistorySidebar";
import { OpalLoaderDevPanel } from "@/app/opal/components/OpalLoaderDevPanel";

// ── Grab handle for resizing the canvas / chat split ─────────────────────────

function GrabHandle({ onResize }: { onResize: (dx: number) => void }) {
    const isDragging = useRef(false);
    const lastX = useRef(0);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        isDragging.current = true;
        lastX.current = e.clientX;
        e.preventDefault();

        const onMove = (ev: MouseEvent) => {
            if (!isDragging.current) return;
            onResize(ev.clientX - lastX.current);
            lastX.current = ev.clientX;
        };
        const onUp = () => {
            isDragging.current = false;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }, [onResize]);

    return (
        <Box
            onMouseDown={onMouseDown}
            style={{
                width: 4,
                flexShrink: 0,
                cursor: 'col-resize',
                background: 'var(--ax-colors-border-secondary)',
                transition: 'background 0.15s',
                zIndex: 10,
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--ax-colors-border-default)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--ax-colors-border-secondary)')}
        />
    );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type OpalChatViewProps = {
    messages: ChatMessage[];
    inputValue: string;
    isLoading: boolean;
    error?: string;
    setInputValue: (value: string) => void;
    onSend: (content: string) => void;
    onSuggestionClick: (suggestion: string) => void;
    streamingMode?: 'collapsed' | 'expanded';

    // History props
    onToggleHistory?: () => void;
    onNewChat?: () => void;
    isHistoryVisible?: boolean;
    groupedHistory?: { [key: string]: ChatHistoryItem[] };
    activeChat?: string | null;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    onDeleteChat?: (id: string) => void;
    onSelectChat?: (id: string) => void;

    landingHeader?: ReactNode;
    emptyState?: ReactNode;
    variant?: 'assistant' | 'home';
    enableAI?: boolean;
    onEnableAIChange?: (enabled: boolean) => void;
    onMessageEdit?: (id: string, newContent: string) => void;
    onRegenerate?: (id: string) => void;
    onMessageVersionChange?: (id: string, versionIndex: number, content: string) => void;
    agentBar?: ReactNode;
    collapsedSessionIds?: Set<string>;
    onExpandSession?: (sessionStartId: string) => void;
    opalDisclosureIds?: Set<string>;
    opalClosedIds?: Set<string>;
    collapsingOpalEndId?: string | null;
    highlightedOpalEndId?: string | null;
    onOpenOpalRange?: (agentEndId: string) => void;
    onCloseOpalRange?: (agentEndId: string) => void;
    mentionableAgents?: MentionableAgent[];
    onMentionSelect?: (agent: MentionableAgent) => void;
    activeAgentCtx?: { emoji: string; name: string } | null;
    inputAgentCtx?: { name: string; handle?: string } | null;
    /** Disables the input independently of isLoading (e.g. during resume flow). */
    disabled?: boolean;
    /** Called when the user tries to submit while blocked (e.g. resume flow). */
    onSubmitBlocked?: () => void;
    contextualActionCard?: ReactNode;
    /** When provided, renders as a full-width canvas on the left with chat as a right sidebar. */
    leftCanvas?: ReactNode;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function OpalChatView({
    messages,
    inputValue,
    isLoading,
    error,
    setInputValue,
    onSend,
    onSuggestionClick,
    streamingMode = 'collapsed',
    onToggleHistory,
    onNewChat,
    isHistoryVisible,
    groupedHistory,
    activeChat,
    searchQuery,
    onSearchChange,
    onDeleteChat,
    onSelectChat,
    landingHeader,
    emptyState,
    variant = 'assistant',
    enableAI,
    onEnableAIChange,
    onMessageEdit,
    onRegenerate,
    onMessageVersionChange,
    agentBar,
    collapsedSessionIds,
    onExpandSession,
    opalDisclosureIds,
    opalClosedIds,
    collapsingOpalEndId,
    highlightedOpalEndId,
    onOpenOpalRange,
    onCloseOpalRange,
    mentionableAgents,
    onMentionSelect,
    activeAgentCtx,
    inputAgentCtx,
    disabled,
    onSubmitBlocked,
    contextualActionCard,
    leftCanvas,
}: OpalChatViewProps) {
    const hasMessages = messages.length > 0;
    const [chatWidth, setChatWidth] = useState(400);

    const handleResize = useCallback((dx: number) => {
        // Dragging right = canvas grows, chat shrinks; left = canvas shrinks, chat grows
        setChatWidth(prev => Math.max(300, Math.min(600, prev - dx)));
    }, []);

    // ── Canvas layout (leftCanvas present) ───────────────────────────────────
    if (leftCanvas) {
        return (
            <Box
                display="flex"
                flexDirection="row"
                h="full"
                w="full"
                overflow="hidden"
                style={{ minHeight: 0 }}
            >
                {/* Left canvas — slides in from left */}
                <Box style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden', animation: 'canvasSlideIn 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>
                    <style>{`
                      @keyframes canvasSlideIn { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: translateX(0); } }
                      @keyframes chatSlideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
                    `}</style>
                    {leftCanvas}
                </Box>

                {/* Drag handle */}
                <GrabHandle onResize={handleResize} />

                {/* Right chat sidebar — animates width in */}
                <Box
                    display="flex"
                    flexDirection="column"
                    style={{
                        width: chatWidth,
                        flexShrink: 0,
                        height: '100%',
                        minHeight: 0,
                        overflow: 'hidden',
                        borderLeft: '1px solid var(--ax-colors-border-secondary)',
                        animation: 'chatSlideIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
                    }}
                >
                    {variant === 'home' && (
                        <Box style={{ flexShrink: 0 }}>
                            <OpalHeader
                                onToggleHistory={onToggleHistory || (() => {})}
                                onNewChat={onNewChat}
                            />
                        </Box>
                    )}
                    <Box
                        display="flex"
                        flexDirection="column"
                        style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
                    >
                        <OpalChat
                            messages={messages}
                            onSuggestionClick={onSuggestionClick}
                            streamingMode={streamingMode}
                            threadKey={activeChat}
                            onRegenerate={onRegenerate}
                            onVersionChange={onMessageVersionChange}
                            hideSuggestions
                            variant="assistant"
                            collapsedSessionIds={collapsedSessionIds}
                            onExpandSession={onExpandSession}
                            opalDisclosureIds={opalDisclosureIds}
                            opalClosedIds={opalClosedIds}
                            collapsingOpalEndId={collapsingOpalEndId}
                            highlightedOpalEndId={highlightedOpalEndId}
                            onOpenOpalRange={onOpenOpalRange}
                            onCloseOpalRange={onCloseOpalRange}
                            activeAgentCtx={activeAgentCtx}
                            contextualActionCard={contextualActionCard}
                        />
                    </Box>
                    <Box style={{ flexShrink: 0, padding: '12px' }}>
                        <OpalInput
                            variant="assistant"
                            value={inputValue}
                            onChange={setInputValue}
                            onSend={(content) => onSend(content ?? inputValue)}
                            disabled={isLoading || !!disabled}
                            isLoading={isLoading}
                            error={error}
                            agentBar={agentBar}
                            inputAgentCtx={inputAgentCtx}
                            mentionableAgents={mentionableAgents}
                            onMentionSelect={onMentionSelect}
                            onSubmitBlocked={onSubmitBlocked}
                        />
                    </Box>
                </Box>
                <OpalLoaderDevPanel />
            </Box>
        );
    }

    // ── No-canvas landing (home variant, no messages) ─────────────────────────
    if (variant === 'home' && !hasMessages) {
        return (
            <Box display="flex" flexDirection="row" h="full" w="full" overflow="hidden">
                <OpalHistorySidebar
                    groupedHistory={groupedHistory || {}}
                    activeChat={activeChat || null}
                    searchQuery={searchQuery || ''}
                    onSearchChange={onSearchChange || (() => { })}
                    onNewChat={onNewChat || (() => { })}
                    onSelectChat={onSelectChat || (() => { })}
                    onDeleteChat={onDeleteChat || (() => { })}
                    mode="docked"
                    isVisible={!!isHistoryVisible}
                />
                <Box display="flex" flexDirection="column" h="full" style={{ flex: 1, minWidth: 0 }}>
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        w="full"
                        style={{ flex: 1, overflowY: 'auto' }}
                    >
                        {landingHeader}
                        <OpalInput
                            variant="home"
                            value={inputValue}
                            onChange={setInputValue}
                            onSend={(content) => onSend(content ?? inputValue)}
                            disabled={isLoading || !!disabled}
                            isLoading={isLoading}
                            error={error}
                            enableAI={enableAI}
                            onEnableAIChange={onEnableAIChange}
                            inputAgentCtx={inputAgentCtx}
                            mentionableAgents={mentionableAgents}
                            onMentionSelect={onMentionSelect}
                            onSubmitBlocked={onSubmitBlocked}
                        />
                        {emptyState}
                    </Box>
                </Box>
                <OpalLoaderDevPanel />
            </Box>
        );
    }

    // ── Active chat (no canvas) ───────────────────────────────────────────────
    return (
        <Box
            display="flex"
            flexDirection="row"
            h="full"
            w="full"
            overflow="hidden"
            style={{ position: 'relative', minHeight: 0 }}
        >
            {variant === 'home' && (
                <OpalHistorySidebar
                    groupedHistory={groupedHistory || {}}
                    activeChat={activeChat || null}
                    searchQuery={searchQuery || ''}
                    onSearchChange={onSearchChange || (() => { })}
                    onNewChat={onNewChat || (() => { })}
                    onSelectChat={onSelectChat || (() => { })}
                    onDeleteChat={onDeleteChat || (() => { })}
                    mode="docked"
                    isVisible={!!isHistoryVisible}
                />
            )}
            <Box
                display="flex"
                flexDirection="column"
                style={{ flex: 1, minWidth: 0, height: '100%', minHeight: 0, overflow: 'hidden' }}
            >
                {variant === 'home' && (
                    <Box style={{ flexShrink: 0, width: '100%' }}>
                        <OpalHeader
                            onToggleHistory={onToggleHistory || (() => { })}
                            onNewChat={onNewChat}
                        />
                    </Box>
                )}

                <Box
                    display="flex"
                    flexDirection="column"
                    w="full"
                    style={{
                        flex: 1,
                        overflow: 'hidden',
                        width: '100%',
                        alignItems: variant === 'home' ? 'center' : 'stretch',
                        paddingTop: variant === 'home' ? '16px' : '0',
                        minHeight: 0,
                    }}
                >
                    <OpalChat
                        messages={messages}
                        onSuggestionClick={onSuggestionClick}
                        streamingMode={streamingMode}
                        threadKey={activeChat}
                        onRegenerate={onRegenerate}
                        onVersionChange={onMessageVersionChange}
                        hideSuggestions={!!emptyState}
                        variant={variant}
                        collapsedSessionIds={collapsedSessionIds}
                        onExpandSession={onExpandSession}
                        opalDisclosureIds={opalDisclosureIds}
                        opalClosedIds={opalClosedIds}
                        collapsingOpalEndId={collapsingOpalEndId}
                        highlightedOpalEndId={highlightedOpalEndId}
                        onOpenOpalRange={onOpenOpalRange}
                        onCloseOpalRange={onCloseOpalRange}
                        activeAgentCtx={activeAgentCtx}
                        contextualActionCard={contextualActionCard}
                    />
                </Box>

                <Box
                    w="full"
                    style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', width: '100%' }}
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap="16"
                        style={{ width: '100%', maxWidth: variant === 'home' ? '800px' : 'none' }}
                    >
                        <OpalInput
                            variant={variant}
                            value={inputValue}
                            onChange={setInputValue}
                            onSend={(content) => onSend(content ?? inputValue)}
                            disabled={isLoading || !!disabled}
                            isLoading={isLoading}
                            error={error}
                            enableAI={enableAI}
                            onEnableAIChange={onEnableAIChange}
                            agentBar={agentBar}
                            inputAgentCtx={inputAgentCtx}
                            mentionableAgents={mentionableAgents}
                            onMentionSelect={onMentionSelect}
                            onSubmitBlocked={onSubmitBlocked}
                        />
                    </Box>
                </Box>
            </Box>
            <OpalLoaderDevPanel />
        </Box>
    );
}

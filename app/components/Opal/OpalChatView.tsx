"use client";

import { Box } from "@optiaxiom/react";
import { OpalChat } from "./OpalChat";
import { OpalInput, MentionableAgent } from "./OpalInput";
import { ChatMessage } from "@/app/hooks/useOpalState";
import { ChatHistoryItem } from "@/app/hooks/useOpalHistory";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { IMActivityFeed } from "@/app/opal/im/components/IMActivityFeed";
import { IMFilesList } from "@/app/opal/im/components/IMFilesList";
import { OpalHeader } from "./OpalHeader";
import { OpalHistorySidebar } from "./OpalHistorySidebar";
import { OpalLoaderDevPanel } from "@/app/opal/components/OpalLoaderDevPanel";

// ── Grab handle for resizing the canvas / chat split ─────────────────────────

export function GrabHandle({ onResize }: { onResize: (dx: number) => void }) {
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
    chatHeaderRight?: ReactNode;
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
    activeAgentCtx?: { emoji: string; name: string; avatar?: string; templateName?: string } | null;
    inputAgentCtx?: { name: string; handle?: string } | null;
    /** Disables the input independently of isLoading (e.g. during resume flow). */
    disabled?: boolean;
    /** Called when the user tries to submit while blocked (e.g. resume flow). */
    onSubmitBlocked?: () => void;
    contextualActionCard?: ReactNode;
    /** When provided, renders as a full-width canvas on the left with chat as a right sidebar. */
    leftCanvas?: ReactNode;
    /** V3 inline message cards — accepted for compat, not rendered in V2. */
    messageCards?: Record<string, ReactNode>;
    /** V3 canvas mode flag — accepted for compat. */
    canvasMode?: boolean;
    /** V3 chat panel visibility — accepted for compat. */
    chatPanelVisible?: boolean;
    /** Quick-close handler for the chat panel header (X on the upper left). */
    onCloseChat?: () => void;
    /** IM mode: toggle an emoji reaction on a message */
    onReaction?: (messageId: string, emoji: string) => void;
    /** IM mode: quote/reply to a message */
    onQuote?: (messageId: string) => void;
    /** Content rendered just above the input box (e.g. quote chip) */
    preInputContent?: ReactNode;
    /** Force IM mode on — overrides URL-based detection */
    imMode?: boolean;
    /** IM mode: active thread/conversation name */
    imThreadName?: string;
    /** IM mode: true when talking to a VAU (adds Activities tab) */
    imIsVAU?: boolean;
    /** IM mode: true when viewing a channel (renders rounded-square avatar) */
    imIsChannel?: boolean;
    /** IM mode: avatar URL for the thread header */
    imThreadAvatar?: string;
    /** IM mode: VAU template name shown below the thread name */
    imTemplateName?: string;
    /** IM mode: simplified header — X instead of hamburger, no tabs */
    imSimplified?: boolean;
    /** IM mode: when set, clicking the avatar+name row navigates (e.g. artifact → /opal/im) */
    onImThreadNameClick?: () => void;
    /** IM mode: open the VAU's primary artifact (e.g. CoS daily brief) from the Activities tab */
    onOpenBrief?: () => void;
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
    chatHeaderRight,
    messageCards,
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
    chatPanelVisible,
    onCloseChat,
    onReaction,
    onQuote,
    preInputContent,
    imMode: imModeProp,
    imThreadName,
    imIsVAU,
    imIsChannel,
    imThreadAvatar,
    imTemplateName,
    imSimplified,
    onImThreadNameClick,
    onOpenBrief,
}: OpalChatViewProps) {
    const hasMessages = messages.length > 0;
    const [chatWidth, setChatWidth] = useState(400);
    const [imMode, setImMode] = useState(() => {
        if (imModeProp !== undefined) return imModeProp;
        if (typeof window === 'undefined') return false;
        if (window.location.pathname.startsWith('/opal/im')) return true;
        return new URLSearchParams(window.location.search).get('artifacts') === '1';
    });
    const [imActiveTab, setImActiveTab] = useState<'messages' | 'files' | 'activities'>('messages');

    // Reset to Messages tab whenever the selected conversation changes.
    useEffect(() => { setImActiveTab('messages'); }, [activeChat]);

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

                {/* Right chat sidebar — animates width in/out */}
                <Box
                    display="flex"
                    flexDirection="column"
                    style={{
                        width: chatPanelVisible === false ? 0 : chatWidth,
                        flexShrink: 0,
                        height: '100%',
                        minHeight: 0,
                        overflow: 'hidden',
                        borderLeft: chatPanelVisible === false ? 'none' : '1px solid var(--ax-colors-border-secondary)',
                        transition: 'width 0.25s ease, border 0.25s ease',
                        animation: chatPanelVisible !== false ? 'chatSlideIn 0.35s cubic-bezier(0.16,1,0.3,1) both' : undefined,
                    }}
                >
                    {variant === 'home' && (
                        <Box style={{ flexShrink: 0 }}>
                            <OpalHeader
                                onToggleHistory={onToggleHistory || (() => {})}
                                onNewChat={onNewChat}
                                imMode={imMode}
                                isHistoryVisible={isHistoryVisible}
                                onToggleImMode={() => setImMode(v => !v)}
                                imThreadName={imThreadName}
                                imIsVAU={imIsVAU}
                                imIsChannel={imIsChannel}
                                imTemplateName={imTemplateName}
                                imSimplified={imSimplified}
                                imThreadAvatar={imThreadAvatar}
                                onImThreadNameClick={onImThreadNameClick}
                                onCloseLeft={onCloseChat}
                                rightActions={chatHeaderRight}
                                imActiveTab={imActiveTab}
                                onImTabChange={setImActiveTab}
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
                            onReaction={onReaction}
                            onQuote={onQuote}
                            messageCards={messageCards}
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
                            mentionableAgents={mentionableAgents}
                            onMentionSelect={onMentionSelect}
                            onSubmitBlocked={onSubmitBlocked}
                            inputAgentCtx={inputAgentCtx}
                            imMode={imMode}
                            quoteContent={preInputContent}
                        />
                    </Box>
                </Box>
                <OpalLoaderDevPanel />
            </Box>
        );
    }

    // ── No-canvas landing (home variant, no messages, no active chat) ───────────
    if (variant === 'home' && !hasMessages && !activeChat) {
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
                            mentionableAgents={mentionableAgents}
                            onMentionSelect={onMentionSelect}
                            onSubmitBlocked={onSubmitBlocked}
                            inputAgentCtx={inputAgentCtx}
                            imMode={imMode}
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
                            imMode={imMode}
                            isHistoryVisible={isHistoryVisible}
                            onToggleImMode={() => setImMode(v => !v)}
                            imThreadName={imThreadName}
                            imIsVAU={imIsVAU}
                            imIsChannel={imIsChannel}
                            imTemplateName={imTemplateName}
                            imSimplified={imSimplified}
                            imThreadAvatar={imThreadAvatar}
                            onImThreadNameClick={onImThreadNameClick}
                            onCloseLeft={onCloseChat}
                            rightActions={chatHeaderRight}
                            imActiveTab={imActiveTab}
                            onImTabChange={setImActiveTab}
                        />
                    </Box>
                )}

                {/* Activities tab */}
                {imMode && imIsVAU && imActiveTab === 'activities' && (
                    <IMActivityFeed vauName={imThreadName} vauTemplateKey={imTemplateName} onOpenBrief={onOpenBrief} />
                )}

                {/* Files tab */}
                {imMode && imIsVAU && imActiveTab === 'files' && (
                    <IMFilesList vauName={imThreadName} />
                )}

                {/* Messages tab (default) */}
                {(!imMode || !imIsVAU || imActiveTab === 'messages') && (
                <Box
                    display="flex"
                    flexDirection="column"
                    w="full"
                    style={{
                        flex: 1,
                        overflow: 'hidden',
                        width: '100%',
                        alignItems: (variant === 'home' && !imMode) ? 'center' : 'stretch',
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
                        contextualActionCard={contextualActionCard && !disabled ? contextualActionCard : undefined}
                        onReaction={onReaction}
                        onQuote={onQuote}
                        messageCards={messageCards}
                    />
                </Box>
                )}

                {(!imMode || !imIsVAU || imActiveTab === 'messages') && (
                <Box
                    w="full"
                    style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', width: '100%' }}
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap="16"
                        style={{ width: '100%', maxWidth: variant === 'home' ? '800px' : 'none', minWidth: 0, paddingLeft: imMode ? '24px' : undefined, paddingRight: imMode ? '24px' : undefined }}
                    >
                        {contextualActionCard && disabled ? (
                            contextualActionCard
                        ) : (
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
                                mentionableAgents={mentionableAgents}
                                onMentionSelect={onMentionSelect}
                                onSubmitBlocked={onSubmitBlocked}
                                inputAgentCtx={inputAgentCtx}
                                imMode={imMode}
                                quoteContent={preInputContent}
                            />
                        )}
                    </Box>
                </Box>
                )}
            </Box>
            <OpalLoaderDevPanel />
        </Box>
    );
}

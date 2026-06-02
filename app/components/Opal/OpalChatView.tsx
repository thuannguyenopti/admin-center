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
    /** Per-message cards keyed by cardAfterKey */
    messageCards?: Record<string, ReactNode>;
    /** When provided, renders as a full-width canvas on the left with chat as a right sidebar. */
    leftCanvas?: ReactNode;
    /** When true, IM mode defaults to on (canvas is open). */
    canvasMode?: boolean;
    /** Controls visibility of the right chat sidebar when leftCanvas is active. Defaults to true. */
    chatPanelVisible?: boolean;
    /** Current user id — surfaces in IM mode for reactions. */
    currentUserId?: string;
    /** Reactions keyed by message id. */
    messageReactions?: Record<string, Record<string, string[]>>;
    /** Toggle reaction handler. */
    onToggleReaction?: (messageId: string, emoji: string) => void;
    /** Reply-in-thread handler — opens a thread panel for the message id. */
    onReplyInThread?: (messageId: string) => void;
    /** Quote-reply handler — pins a message as quote in the main composer. */
    onQuoteReply?: (messageId: string) => void;
    /** Node rendered just above the message composer (e.g. a quote chip). */
    aboveInputContent?: React.ReactNode;
    /** When provided, replaces the OpalInput entirely (e.g. a blocking action card). */
    inputOverride?: React.ReactNode;
    /** When provided in IM mode, the + menu "Upload from device" picks a file and calls this. */
    onAttachFile?: (file: File) => void;
    /** When set, overrides the "Opal" dropdown trigger in the header with static text. */
    headerTitle?: string;
    /** Label for the new-chat button (sidebar + header). Defaults to "New chat". */
    newChatLabel?: string;
    /** When provided, sidebar section headers render a + button that calls this with the section label. */
    onCreateInSection?: (sectionLabel: string) => void;
    /** Per-section tooltip labels for the + button. Keyed by section label. */
    sectionAddTooltips?: Record<string, string>;
    /** When provided, renders an X close button at the top-left of the chat sidebar (canvas mode only). */
    onCloseChat?: () => void;
    /** IM mode: active thread/conversation name */
    imThreadName?: string;
    /** IM mode: true when talking to a VAU (adds Activities tab) */
    imIsVAU?: boolean;
    /** IM mode: true when viewing a channel */
    imIsChannel?: boolean;
    /** IM mode: avatar URL for the thread header */
    imThreadAvatar?: string;
    /** IM mode: VAU template name shown below the thread name */
    imTemplateName?: string;
    /** IM mode: simplified header — X instead of hamburger, no tabs */
    imSimplified?: boolean;
    /** IM mode: extra actions on the right side of the simplified header */
    imHeaderRight?: React.ReactNode;
    /** IM mode: when set, clicking the avatar+name navigates */
    onImThreadNameClick?: () => void;
    /** IM mode: when set, the first file in the Files tab opens the artifact preview */
    onOpenArtifact?: () => void;
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
    messageCards,
    leftCanvas,
    canvasMode = false,
    chatPanelVisible = true,
    currentUserId,
    messageReactions,
    onToggleReaction,
    onReplyInThread,
    onQuoteReply,
    aboveInputContent,
    inputOverride,
    onAttachFile,
    headerTitle,
    newChatLabel,
    onCreateInSection,
    sectionAddTooltips,
    onCloseChat,
    imThreadName,
    imIsVAU,
    imIsChannel,
    imThreadAvatar,
    imTemplateName,
    imSimplified,
    imHeaderRight,
    onImThreadNameClick,
    onOpenArtifact,
}: OpalChatViewProps) {
    const hasMessages = messages.length > 0;
    const [chatWidth, setChatWidth] = useState(400);
    const [imMode, setImMode] = useState(canvasMode);
    const [imActiveTab, setImActiveTab] = useState<'messages' | 'files' | 'activities'>('messages');

    // Reset to Messages tab when the selected conversation changes.
    useEffect(() => { setImActiveTab('messages'); }, [activeChat]);

    // Sync imMode on when canvas opens
    useEffect(() => {
        if (canvasMode) setImMode(true);
    }, [canvasMode]);

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

                {/* Drag handle — only when chat panel is visible */}
                {chatPanelVisible && <GrabHandle onResize={handleResize} />}

                {/* Right chat sidebar — hidden when chatPanelVisible is false */}
                <Box
                    display="flex"
                    flexDirection="column"
                    style={{
                        width: chatPanelVisible ? chatWidth : 0,
                        flexShrink: 0,
                        height: '100%',
                        minHeight: 0,
                        overflow: 'hidden',
                        borderLeft: chatPanelVisible ? '1px solid var(--ax-colors-border-secondary)' : 'none',
                        animation: 'chatSlideIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
                        transition: 'width 0.25s cubic-bezier(0.16,1,0.3,1)',
                    }}
                >
                    {variant === 'home' && (
                        <Box style={{ flexShrink: 0 }}>
                            <OpalHeader
                                onToggleHistory={onToggleHistory || (() => {})}
                                onNewChat={isHistoryVisible ? undefined : onNewChat}
                                imMode={imMode}
                                onImModeChange={setImMode}
                                titleOverride={headerTitle}
                                newChatLabel={newChatLabel}
                                leadingClose={onCloseChat}
                                imThreadName={imThreadName}
                                imThreadAvatar={imThreadAvatar}
                                imIsVAU={imIsVAU}
                                imIsChannel={imIsChannel}
                                imTemplateName={imTemplateName}
                                imSimplified={imSimplified}
                                imHeaderRight={imHeaderRight}
                                onImThreadNameClick={onImThreadNameClick}
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
                            messageCards={messageCards}
                            imMode={imMode}
                            currentUserId={currentUserId}
                            messageReactions={messageReactions}
                            onToggleReaction={onToggleReaction}
                            onReplyInThread={onReplyInThread}
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
                            imMode={imMode}
                            onAttachFile={onAttachFile}
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
                    newChatLabel={newChatLabel}
                    onCreateInSection={onCreateInSection}
                    sectionAddTooltips={sectionAddTooltips}
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
                    newChatLabel={newChatLabel}
                    onCreateInSection={onCreateInSection}
                    sectionAddTooltips={sectionAddTooltips}
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
                            onNewChat={isHistoryVisible ? undefined : onNewChat}
                            imMode={imMode}
                            onImModeChange={setImMode}
                            titleOverride={headerTitle}
                            newChatLabel={newChatLabel}
                            leadingClose={onCloseChat}
                            imThreadName={imThreadName}
                            imIsVAU={imIsVAU}
                            imIsChannel={imIsChannel}
                            imThreadAvatar={imThreadAvatar}
                            imTemplateName={imTemplateName}
                            imSimplified={imSimplified}
                            imHeaderRight={imHeaderRight}
                            onImThreadNameClick={onImThreadNameClick}
                            imActiveTab={imActiveTab}
                            onImTabChange={setImActiveTab}
                        />
                    </Box>
                )}

                {/* Activities tab */}
                {imMode && imIsVAU && imActiveTab === 'activities' && (
                    <IMActivityFeed vauName={imThreadName} />
                )}

                {/* Files tab — available for all IM conversations */}
                {imMode && imActiveTab === 'files' && (
                    <IMFilesList vauName={imThreadName} onOpenArtifact={onOpenArtifact} />
                )}

                {/* Messages tab (default) — hidden when on a non-messages tab */}
                {(!imMode || imActiveTab === 'messages') && (
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
                        contextualActionCard={contextualActionCard}
                        messageCards={messageCards}
                        imMode={imMode}
                        currentUserId={currentUserId}
                        messageReactions={messageReactions}
                        onToggleReaction={onToggleReaction}
                        onReplyInThread={onReplyInThread}
                        onQuoteReply={onQuoteReply}
                    />
                </Box>
                )}

                {(!imMode || imActiveTab === 'messages') && (
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
                        {inputOverride ? (
                            inputOverride
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
                                inputAgentCtx={inputAgentCtx}
                                mentionableAgents={mentionableAgents}
                                onMentionSelect={onMentionSelect}
                                onSubmitBlocked={onSubmitBlocked}
                                imMode={imMode}
                                onAttachFile={onAttachFile}
                                topContent={aboveInputContent}
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

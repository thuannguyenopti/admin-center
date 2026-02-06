"use client";

import { Box } from "@optiaxiom/react";
import { OpalChat } from "./OpalChat";
import { OpalInput } from "./OpalInput";
import { ChatMessage } from "@/app/hooks/useOpalState";
import { ChatHistoryItem } from "@/app/hooks/useOpalHistory";
import { ReactNode } from "react";
import { OpalHomeHeader } from "./OpalHomeHeader";
import { OpalHistorySidebar } from "./OpalHistorySidebar";

type OpalChatViewProps = {
    messages: ChatMessage[];
    inputValue: string;
    isLoading: boolean;
    error?: string;
    setInputValue: (value: string) => void;
    onSend: (content: string) => void;
    onSuggestionClick: (suggestion: string) => void;

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
};

export function OpalChatView({
    messages,
    inputValue,
    isLoading,
    error,
    setInputValue,
    onSend,
    onSuggestionClick,
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
    onEnableAIChange
}: OpalChatViewProps) {
    const hasMessages = messages.length > 0;

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
                    <Box style={{ flexShrink: 0, width: '100%' }}>
                        <OpalHomeHeader
                            onToggleHistory={onToggleHistory || (() => { })}
                            onNewChat={onNewChat || (() => { })}
                        />
                    </Box>
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
                            onSend={() => onSend(inputValue)}
                            disabled={isLoading}
                            isLoading={isLoading}
                            error={error}
                            enableAI={enableAI}
                            onEnableAIChange={onEnableAIChange}
                        />
                        {emptyState}
                    </Box>
                </Box>
            </Box>
        );
    }

    // Active chat state or Assistant variant
    return (
        <Box
            display="flex"
            flexDirection="row"
            h="full"
            w="full"
            overflow="hidden"
            style={{
                position: 'relative'
            }}
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
                        <OpalHomeHeader
                            onToggleHistory={onToggleHistory || (() => { })}
                            onNewChat={onNewChat || (() => { })}
                        />
                    </Box>
                )}

                <Box
                    display="flex"
                    flexDirection="column"
                    w="full"
                    style={{
                        flex: 1,
                        overflowY: 'hidden',
                        width: '100%',
                        alignItems: variant === 'home' ? 'center' : 'stretch',
                        paddingTop: variant === 'home' ? '16px' : '0',
                        minHeight: 0
                    }}
                >
                    <OpalChat
                        messages={messages}
                        onSuggestionClick={onSuggestionClick}
                        hideSuggestions={!!emptyState}
                        variant={variant}
                    />
                </Box>

                <Box
                    w="full"
                    style={{
                        flexShrink: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%'
                    }}
                >
                    <OpalInput
                        variant={variant}
                        value={inputValue}
                        onChange={setInputValue}
                        onSend={() => onSend(inputValue)}
                        disabled={isLoading}
                        isLoading={isLoading}
                        error={error}
                        enableAI={enableAI}
                        onEnableAIChange={onEnableAIChange}
                    />
                </Box>
            </Box>
        </Box>
    );
}

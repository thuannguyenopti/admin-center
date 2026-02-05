"use client";

import { Box, Button, Heading, Tooltip, Text } from "@optiaxiom/react";
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconDots, IconArrowsMaximize, IconArrowsMinimize, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { ChatInput } from "./ChatInput";
import { MessageList, Message } from "./MessageList";
import { ThreadList } from "./ThreadList";
import { StartCanvas } from "./StartCanvas";

interface ChatWindowProps {
    initialMessages?: Message[];
    initialHistoryOpen?: boolean;
    isPoppedOut?: boolean;
    onClose?: () => void;
    onPopOut?: () => void;
}

export function ChatWindow({
    initialMessages = [],
    initialHistoryOpen = true,
    isPoppedOut = false,
    onClose,
    onPopOut
}: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    // Standalone view should probably have history closed if no messages
    const [historyOpen, setHistoryOpen] = useState(initialMessages.length > 0 || !isPoppedOut ? initialHistoryOpen : false);

    const handleSend = (content: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
        };
        setMessages(prev => [...prev, newMessage]);

        // Simulate response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Response to: "${content}"\n\nThis is where Opal would answer with an "Island" of content.`
            }]);
        }, 1000);
    };

    const handleCardClick = (prompt: string) => {
        handleSend(prompt);
    };

    return (
        <Box display="flex" h="full" w="full" bg="bg.default" overflow="hidden" rounded="lg" border="1" borderColor="border.tertiary" shadow="lg" style={{ height: '100vh' }}>

            {/* Sidebar (History) */}
            {historyOpen && (
                <ThreadList />
            )}

            {/* Main Chat Area */}
            <Box flex="1" display="flex" flexDirection="column" h="full" bg="bg.default" style={{ minWidth: 0 }}>

                {/* Header */}
                <Box px="16" py="8" style={{ minHeight: '56px' }} display="flex" justifyContent="space-between" alignItems="center" borderB="1" borderColor="border.tertiary" bg="bg.default">
                    <Box display="flex" alignItems="center" gap="12">
                        <Tooltip content={historyOpen ? "Close Sidebar" : "Open Sidebar"}>
                            <Button
                                appearance="subtle"
                                size="sm"
                                icon={historyOpen ? <IconLayoutSidebarLeftCollapse size={20} /> : <IconLayoutSidebarLeftExpand size={20} />}
                                onClick={() => setHistoryOpen(!historyOpen)}
                                aria-label="Toggle Sidebar"
                            />
                        </Tooltip>
                        <Heading level="4" fontSize="lg" style={{ margin: 0, padding: 0 }}>Opal</Heading>
                    </Box>
                    <Box display="flex" gap="4" alignItems="center">
                        {onPopOut && (
                            <Tooltip content={isPoppedOut ? "Pop in" : "Pop out"}>
                                <Button
                                    appearance="subtle"
                                    size="sm"
                                    icon={isPoppedOut ? <IconArrowsMinimize size={18} /> : <IconArrowsMaximize size={18} />}
                                    onClick={onPopOut}
                                    aria-label={isPoppedOut ? "Pop in" : "Pop out"}
                                />
                            </Tooltip>
                        )}
                        <Button appearance="subtle" size="sm" icon={<IconDots size={18} />} aria-label="More actions" />
                        {onClose && (
                            <Button appearance="subtle" size="sm" icon={<IconX size={18} />} onClick={onClose} aria-label="Close" />
                        )}
                    </Box>
                </Box>

                {/* Content */}
                <Box flex="1" overflowY="auto" display="flex" flexDirection="column" bg="bg.default">
                    {messages.length === 0 ? (
                        <Box flex="1" display="flex" flexDirection="column" justifyContent="center" py="48">
                            <StartCanvas onCardClick={handleCardClick} />
                        </Box>
                    ) : (
                        <MessageList messages={messages} />
                    )}
                </Box>

                {/* Input Area */}
                <Box p="16" pb="32" w="full" mx="auto" style={{ maxWidth: '800px' }}>
                    <ChatInput onSend={handleSend} />
                    <Box textAlign="center" mt="8">
                        <Text fontSize="xs" color="fg.tertiary">Opal can make mistakes. Check important info.</Text>
                    </Box>
                </Box>

            </Box>
        </Box>
    );
}

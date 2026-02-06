"use client";

import { Box } from "@optiaxiom/react";
import { ChatInput } from "./ChatInput";
import { MessageList, Message } from "./MessageList";
import { useState } from "react";

interface ChatInterfaceProps {
    initialMessages?: Message[];
}

export function ChatInterface({ initialMessages = [] }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);

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
                content: `I received: "${content}". This is a simulated response from Opal.`
            }]);
        }, 1000);
    };

    return (
        <Box display="flex" flexDirection="column" h="full" w="full" bg="bg.default">
            <Box flex="1" overflow="auto">
                <MessageList messages={messages} />
            </Box>
            <Box p="24" pb="32" mx="auto" w="full" style={{ maxWidth: '800px' }}>
                <ChatInput onSend={handleSend} />
            </Box>
        </Box>
    );
}

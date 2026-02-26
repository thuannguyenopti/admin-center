"use client";

import { Box, Text, Avatar } from "@optiaxiom/react";
import { IconSparkles } from "@tabler/icons-react";

export type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    type?: 'text' | 'code' | 'chart';
};

interface MessageListProps {
    messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
    return (
        <Box display="flex" flexDirection="column" gap="24" p="24" w="full" mx="auto" style={{ maxWidth: '800px' }}>
            {messages.map((msg) => (
                <Box
                    key={msg.id}
                    display="flex"
                    justifyContent={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                    w="full"
                >
                    {msg.role === 'assistant' ? (
                        <Box display="flex" gap="16" w="full">
                            <Box style={{ flexShrink: 0, marginTop: '4px' }}>
                                <Avatar name="Opal" src="/opal-orb.png" size="sm" />
                            </Box>
                            <Box display="flex" flexDirection="column" gap="8" w="full" style={{ maxWidth: '90%' }}>
                                <Box display="flex" alignItems="center" gap="8">
                                    <Text fontWeight="600" fontSize="md">Opal</Text>
                                    <Box display="flex" alignItems="center" gap="4" color="fg.tertiary">
                                        <IconSparkles size={14} />
                                        <Text fontSize="sm">AI Generated</Text>
                                    </Box>
                                </Box>
                                <Box
                                    bg="bg.default"
                                    border="1"
                                    borderColor="border.tertiary"
                                    rounded="lg"
                                    p="16"
                                    shadow="sm"
                                >
                                    <Text style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Text>
                                </Box>
                            </Box>
                        </Box>
                    ) : (
                        <Box
                            bg="bg.accent"
                            style={{ backgroundColor: "#F3F4F6", color: "#111827", maxWidth: '80%' }}
                            p="12"
                            rounded="lg"
                        >
                            <Text>{msg.content}</Text>
                        </Box>
                    )}
                </Box>
            ))}
        </Box>
    );
}

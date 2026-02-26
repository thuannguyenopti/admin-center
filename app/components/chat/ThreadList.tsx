"use client";

import { Box, Text, Button } from "@optiaxiom/react";
import { IconSearch, IconPlus, IconFilter } from "@tabler/icons-react";

export function ThreadList() {
    const threads = [
        { id: 1, title: "Campaign Plan Q3", date: "Today", active: true },
        { id: 2, title: "Website Optimization", date: "Yesterday", active: false },
        { id: 3, title: "Content Strategy", date: "2 days ago", active: false },
    ];

    return (
        <Box
            style={{ width: '224px', flexShrink: 0 }}
            h="full"
            borderR="1"
            borderColor="border.tertiary"
            display="flex"
            flexDirection="column"
            bg="bg.default"
        >
            {/* Header */}
            <Box p="12" display="flex" justifyContent="space-between" alignItems="center" borderB="1" borderColor="border.tertiary">
                <Text fontWeight="600" fontSize="md">History</Text>
                <Box display="flex" gap="2">
                    <Button appearance="subtle" size="sm" icon={<IconSearch size={14} />} aria-label="Search History" style={{ width: '28px', height: '28px', padding: 0 }} />
                    <Button appearance="subtle" size="sm" icon={<IconPlus size={14} />} aria-label="New Chat" style={{ width: '28px', height: '28px', padding: 0 }} />
                </Box>
            </Box>

            {/* List */}
            <Box display="flex" flexDirection="column" p="8" gap="4" overflowY="auto">
                {threads.map((thread) => (
                    <Box
                        key={thread.id}
                        p="8"
                        rounded="md"
                        bg={thread.active ? "bg.accent.subtle" : "transparent"}
                        style={{ cursor: 'pointer' }}
                        className="hover:bg-gray-100"
                    >
                        <Text
                            fontSize="sm"
                            fontWeight={thread.active ? "600" : "400"}
                            color="fg.default"
                            style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: 'block'
                            }}
                        >
                            {thread.title}
                        </Text>
                        <Text fontSize="xs" color="fg.tertiary">
                            {thread.date}
                        </Text>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

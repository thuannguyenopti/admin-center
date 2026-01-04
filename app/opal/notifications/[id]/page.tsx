"use client";

import {
    Box,
    Heading,
    Text,
    Button,
    Badge,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Avatar,
    Separator,
    Switch,
    Textarea,
    Link,
} from "@optiaxiom/react";
import {
    IconAlertCircle,
    IconClock,
    IconGitBranch,
    IconRefresh,
    IconCopy,
    IconDownload,
    IconHelp,
    IconPlayerStop,
    IconChevronLeft,
} from "@tabler/icons-react";
import { IconEllipsisStroke, IconSparkles } from "@optimizely/axiom-icons";
import NextLink from "next/link";
import { useState } from "react";

export default function NotificationDetailsPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const agentName = "Hypothesis Creator";

    const [comments, setComments] = useState([
        { author: "System", text: "Ticket #4928 created automatically due to execution failure (Tool Timeout).", time: "2h ago" },
        { author: "Support Team", text: "Investigating 'web_search' tool latency. It seems the external API is responding slowly today.", time: "1h ago" },
    ]);
    const [newComment, setNewComment] = useState("");

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        setComments([...comments, { author: "Me", text: newComment, time: "Just now" }]);
        setNewComment("");
    };

    return (
        <Box p="32" display="flex" flexDirection="column" gap="24" h="full" bg="bg.default" overflowY="auto">
            {/* Header */}
            <Box display="flex" flexDirection="column" gap="16">
                <Box display="flex" alignItems="center" gap="8">
                    <NextLink href="/opal/notifications" passHref legacyBehavior>
                        <Link color="fg.tertiary" display="flex" alignItems="center" gap="4">
                            <IconChevronLeft size={16} /> Notifications
                        </Link>
                    </NextLink>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap="12">
                        <Heading level="2">{agentName}</Heading>
                        <Badge intent="danger">Failed</Badge>
                    </Box>
                    <Box display="flex" gap="12">
                        <Button appearance="default" icon={<IconRefresh size={16} />}>Restart Execution</Button>
                        <Button appearance="subtle" icon={<IconEllipsisStroke size={16} />} aria-label="Options" />
                    </Box>
                </Box>
            </Box>

            <Box display="flex" gap="32" alignItems="start">
                {/* Main Content */}
                <Box flex="1" display="flex" flexDirection="column">
                    <Tabs defaultValue="details">
                        <TabsList>
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="ticket">Support Ticket</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" mt="24">
                            <Box border="1" borderColor="border.error" rounded="md" overflow="hidden">
                                <Box p="16" bg="bg.error.subtle" borderB="1" borderColor="border.error">
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box display="flex" alignItems="center" gap="8">
                                            <IconAlertCircle className="text-fg-error" size={20} />
                                            <Text color="fg.error" fontWeight="600">Execution Failed</Text>
                                        </Box>
                                        <Badge intent="danger">Tool Timeout</Badge>
                                    </Box>
                                    <Text mt="8" color="fg.default">The 'web_search' tool failed to respond within the 30s limit.</Text>
                                </Box>
                                <Box p="0" bg="bg.default" fontFamily="mono" fontSize="sm" display="flex" flexDirection="column" className="h-[500px]" overflowY="auto">
                                    {[
                                        { time: "14:14:50", type: "system", msg: "Initializing agent runtime..." },
                                        { time: "14:14:51", type: "system", msg: "Context loaded for @hypothesis_creator v15" },
                                        { time: "14:14:52", type: "call", msg: "Calling tool 'web_search' with params: { query: 'latest market trends' }" },
                                        { time: "14:15:22", type: "error", msg: "Error: Tool 'web_search' timed out after 30000ms" },
                                        { time: "14:15:22", type: "error", msg: "Retrying tool call (1/3)..." },
                                        { time: "14:15:52", type: "error", msg: "Error: Tool 'web_search' timed out after 30000ms" },
                                        { time: "14:15:52", type: "system", msg: "Execution halted. Generating error report." },
                                    ].map((step, i) => (
                                        <Box key={i} display="flex" gap="16" p="8" borderB="1" borderColor="border.tertiary" bg={step.type === 'error' ? 'bg.error.subtle' : undefined}>
                                            <Text color="fg.tertiary" style={{ width: '80px', flexShrink: 0 }}>{step.time}</Text>
                                            <Text color={step.type === 'error' ? 'fg.error' : step.type === 'call' ? 'fg.accent' : 'fg.default'} flex="1">
                                                {step.type === 'call' && <IconSparkles size={14} className="inline mr-2" />}
                                                {step.msg}
                                            </Text>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </TabsContent>

                        <TabsContent value="ticket" mt="24">
                            <Box border="1" borderColor="border.tertiary" rounded="md" p="24" display="flex" flexDirection="column" gap="24">
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Heading level="4">Ticket #4928</Heading>
                                        <Text color="fg.tertiary">Created 2h ago</Text>
                                    </Box>
                                    <Badge intent="success">Open</Badge>
                                </Box>

                                <Box display="flex" flexDirection="column" gap="16">
                                    {comments.map((comment, index) => (
                                        <Box key={index} display="flex" gap="12">
                                            <Avatar name={comment.author} size="sm" />
                                            <Box flex="1">
                                                <Box display="flex" justifyContent="space-between">
                                                    <Text fontWeight="600">{comment.author}</Text>
                                                    <Text fontSize="sm" color="fg.tertiary">{comment.time}</Text>
                                                </Box>
                                                <Text mt="4">{comment.text}</Text>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>

                                <Separator />

                                <Box display="flex" gap="12" flexDirection="column">
                                    <Textarea
                                        placeholder="Leave a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <Box display="flex" justifyContent="flex-end">
                                        <Button onClick={handleAddComment}>Comment</Button>
                                    </Box>
                                </Box>
                            </Box>
                        </TabsContent>
                    </Tabs>
                </Box>

                {/* Sidebar */}
                <Box className="w-[300px]" display="flex" flexDirection="column" gap="16">
                    <Box border="1" borderColor="border.tertiary" rounded="md" overflow="hidden">
                        <Box display="flex" flexDirection="column">
                            {[
                                { label: "Agent Name", value: agentName, version: "V15" },
                                { label: "Execution ID", value: id, copyable: true },
                                { label: "Execution Started", value: "Aug 4 2025, 14:14:50" },
                                { label: "Duration", value: "62.45 seconds" },
                            ].map((item, i) => (
                                <Box key={i} p="12" display="flex" flexDirection="column" gap="4" borderB={i < 3 ? "1" : "0"} borderColor="border.tertiary">
                                    <Text color="fg.tertiary" fontSize="sm" fontWeight="600">{item.label}</Text>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box display="flex" alignItems="center" gap="4">
                                            <Text fontWeight="500">{item.value}</Text>
                                            {item.version && <Text color="fg.tertiary" fontSize="xs" ml="4">{item.version}</Text>}
                                        </Box>
                                        {item.copyable && <IconCopy size={14} className="text-fg-tertiary cursor-pointer" />}
                                    </Box>
                                </Box>
                            ))}
                            <Separator />
                            <Box p="12" display="flex" flexDirection="column" gap="4">
                                <Text color="fg.tertiary" fontSize="sm" fontWeight="600">Executed By</Text>
                                <Box display="flex" alignItems="center" gap="8">
                                    <Avatar name="User Name" size="xs" />
                                    <Text fontWeight="500">User Name</Text>
                                </Box>
                            </Box>
                            <Separator />
                            <Box p="12" display="flex" flexDirection="column" gap="4">
                                <Box display="flex" alignItems="center" gap="4">
                                    <Text color="fg.tertiary" fontSize="sm" fontWeight="600">Output Quality Score</Text>
                                </Box>
                                <Box display="flex" alignItems="center" gap="8">
                                    <Text fontWeight="600" color="fg.error">75%</Text>
                                    <Badge intent="danger">Failed</Badge>
                                </Box>
                            </Box>
                            <Separator />
                            <Box p="12" display="flex" flexDirection="column" gap="4">
                                <Text color="fg.tertiary" fontSize="sm" fontWeight="600">Guardrail Status</Text>
                                <Badge intent="warning">Review Needed</Badge>
                            </Box>
                            <Separator />
                            <Box p="12" display="flex" flexDirection="column" gap="4">
                                <Text color="fg.tertiary" fontSize="sm" fontWeight="600">Credits</Text>
                                <Text fontWeight="500">20 credits</Text>
                            </Box>
                        </Box>
                    </Box>
                    <Box display="flex" gap="8">
                        <Button w="full" appearance="subtle" icon={<IconDownload size={16} />}>Download</Button>
                        <Button w="full" appearance="subtle" icon={<IconPlayerStop size={16} />} className="text-red-600">Stop</Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

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
    IconCircleCheck,
    IconCube,
    IconDots,
    IconCalendar,
    IconMessage,
    IconFileText,
    IconWorld,
    IconAnalyze,
    IconBell,
} from "@tabler/icons-react";
import { IconEllipsisStroke, IconSparkles } from "@optimizely/axiom-icons";
import NextLink from "next/link";
import { use, useState } from "react";

const WorkflowNode = ({ icon: Icon, title, description, status }: { icon: any, title: string, description: string, status?: 'success' | 'error' | 'pending' }) => (
    <Box
        p="12"
        bg="bg.default"
        border="1"
        borderColor={status === 'error' ? 'border.error' : 'border.tertiary'}
        rounded="md"
        shadow="sm"
        className="w-[200px] relative"
    >
        <Box display="flex" alignItems="center" gap="8" mb="4">
            <Box p="4" bg="bg.secondary" rounded="sm">
                <Icon size={16} />
            </Box>
            <Text fontWeight="600" fontSize="sm">{title}</Text>
        </Box>
        <Text fontSize="xs" color="fg.tertiary" className="line-clamp-2">{description}</Text>

        {status === 'success' && (
            <Box bg="bg.success" rounded="full" p="2" border="2" borderColor="border.default" className="absolute -top-1 -right-1">
                <IconCircleCheck size={10} className="text-white" />
            </Box>
        )}
        {status === 'error' && (
            <Box bg="bg.error" rounded="full" p="2" border="2" borderColor="border.default" className="absolute -top-1 -right-1">
                <IconAlertCircle size={10} className="text-white" />
            </Box>
        )}
    </Box>
);

export default function NotificationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const workflowName = "Campaign Strategy Workflow";
    const failingAgent = "Hypothesis Creator";

    const [comments, setComments] = useState([
        { author: "System", text: "Ticket #4928 created automatically. Workflow halted at node 'Hypothesis Creator'.", time: "2h ago" },
        { author: "Support Team", text: "The hypothesis agent is hitting a timeout. It might be due to the large context size of the collected data.", time: "1h ago" },
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
                    <Link asChild color="fg.tertiary">
                        <NextLink href="/opal/notifications">
                            <Box display="flex" alignItems="center" gap="4">
                                <IconChevronLeft size={16} /> Notifications
                            </Box>
                        </NextLink>
                    </Link>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap="12">
                        <Heading level="2">{workflowName}</Heading>
                        <Badge intent="danger">Failed</Badge>
                    </Box>
                    <Box display="flex" gap="12">
                        <Button appearance="default" icon={<IconRefresh size={16} />}>Restart Workflow</Button>
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
                            <TabsTrigger value="trace">Trace</TabsTrigger>
                            <TabsTrigger value="ticket">Support Ticket</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" mt="24">
                            <Box display="flex" flexDirection="column" gap="24">
                                {/* Visual Graph Reference */}
                                <Box
                                    border="1"
                                    borderColor="border.tertiary"
                                    rounded="lg"
                                    overflow="hidden"
                                    style={{
                                        background: 'radial-gradient(circle, #E5E7EB 1px, transparent 1px)',
                                        backgroundSize: '20px 20px',
                                        backgroundColor: '#F9FAFB'
                                    }}
                                >
                                    <Box p="12" bg="bg.default" borderB="1" borderColor="border.tertiary" display="flex" justifyContent="space-between" alignItems="center">
                                        <Text fontWeight="600" fontSize="sm">Workflow Map</Text>
                                        <Badge variant="subtle">Execution View</Badge>
                                    </Box>

                                    <Box p="32" display="flex" flexDirection="column" gap="32" overflow="hidden" className="relative h-[400px]">
                                        {/* Simple representative graph layout */}
                                        <Box display="flex" gap="48" alignItems="center" h="full" className="w-max">
                                            {/* Column 1: Triggers */}
                                            <Box display="flex" flexDirection="column" gap="24">
                                                <WorkflowNode icon={IconCalendar} title="Scheduler" description="Runs 7 AM everyday" />
                                                <WorkflowNode icon={IconMessage} title="Chat Input" description="When message is sent" status="success" />
                                            </Box>

                                            {/* Arrows Placeholder (Visual only) */}
                                            <Box bg="bg.tertiary" className="h-[1px] w-10 relative">
                                                <Box borderColor="border.tertiary" style={{ transform: 'rotate(-45deg)' }} className="absolute right-0 -top-1 w-2 h-2 border-b-2 border-r-2" />
                                            </Box>

                                            {/* Column 2: Data Agents */}
                                            <Box display="flex" flexDirection="column" gap="24">
                                                <WorkflowNode icon={IconWorld} title="Web Crawler" description="Extracts website data" status="success" />
                                                <WorkflowNode icon={IconCube} title="Test Idea Agent" description="Ideation for experiments" status="success" />
                                            </Box>

                                            <Box bg="bg.tertiary" className="h-[1px] w-10 relative" />

                                            {/* Column 3: Analysis & Final Steps */}
                                            <Box display="flex" flexDirection="column" gap="24">
                                                <WorkflowNode icon={IconAnalyze} title="Web Analytics" description="All website activities" />
                                                <WorkflowNode icon={IconSparkles} title="Hypothesis Creator" description="Final hypothesis generation" status="error" />
                                                <WorkflowNode icon={IconBell} title="Set Notifications" description="Notify team via email" />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Summary Cards */}
                                <Box display="flex" gap="16">
                                    <Box flex="1" p="16" border="1" borderColor="border.tertiary" rounded="md" bg="bg.default">
                                        <Text color="fg.tertiary" fontSize="sm" fontWeight="600">Failed Node</Text>
                                        <Box display="flex" alignItems="center" gap="8" mt="8">
                                            <IconSparkles size={18} className="text-fg-accent" />
                                            <Text fontWeight="600">{failingAgent}</Text>
                                        </Box>
                                    </Box>
                                    <Box flex="1" p="16" border="1" borderColor="border.error" rounded="md" bg="bg.error.subtle">
                                        <Text color="fg.error" fontSize="sm" fontWeight="600">Root Cause</Text>
                                        <Box display="flex" alignItems="center" gap="8" mt="8">
                                            <IconAlertCircle size={18} className="text-fg-error" />
                                            <Text color="fg.error" fontWeight="600">Computation Timeout (40s)</Text>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </TabsContent>

                        <TabsContent value="trace" mt="24">
                            <Box border="1" borderColor="border.tertiary" rounded="md" overflow="hidden">
                                <Box p="16" bg="bg.secondary" borderB="1" borderColor="border.tertiary" display="flex" justifyContent="space-between" alignItems="center">
                                    <Heading level="4" fontSize="md">Full Execution Trace</Heading>
                                    <Badge variant="subtle">Node: {failingAgent}</Badge>
                                </Box>
                                <Box p="0" bg="bg.default" fontFamily="mono" fontSize="sm" display="flex" flexDirection="column" className="h-[500px]" overflowY="auto">
                                    {[
                                        { time: "14:14:50", type: "system", msg: "Workflow Execution Started: ID b2953c08" },
                                        { time: "14:14:51", type: "agent", msg: "Entering Agent: 'Web Crawler'", status: "success" },
                                        { time: "14:14:54", type: "system", msg: "Agent 'Web Crawler' completed. Output passed to 'Test Idea Agent'." },
                                        { time: "14:14:55", type: "agent", msg: "Entering Agent: 'Test Idea Agent'", status: "success" },
                                        { time: "14:14:58", type: "system", msg: "Agent 'Test Idea Agent' completed. Data ready for hypothesis generation." },
                                        { time: "14:14:59", type: "agent", msg: "Entering Agent: 'Hypothesis Creator'", status: "failed" },
                                        { time: "14:15:00", type: "call", msg: "  ↳  Processing large context buffer (1.2MB)" },
                                        { time: "14:15:40", type: "error", msg: "  ↳  Error: Node timeout reached (40,000ms)" },
                                        { time: "14:15:40", type: "system", msg: "Critical: Workflow halted at 'Hypothesis Creator'." },
                                    ].map((step, i) => (
                                        <Box key={i} display="flex" gap="16" p="12" borderB="1" borderColor="border.tertiary" bg={step.status === 'failed' || step.type === 'error' ? 'bg.error.subtle' : undefined}>
                                            <Text color="fg.tertiary" style={{ width: '80px', flexShrink: 0 }}>{step.time}</Text>
                                            <Box flex="1" display="flex" alignItems="center" gap="8">
                                                {step.type === 'agent' && (step.status === 'success' ? <IconCircleCheck size={14} className="text-fg-success" /> : <IconAlertCircle size={14} className="text-fg-error" />)}
                                                {step.type === 'call' && <IconSparkles size={14} className="text-fg-accent" />}
                                                <Text color={step.type === 'error' ? 'fg.error' : step.type === 'agent' && step.status === 'success' ? 'fg.success' : 'fg.default'}>
                                                    {step.msg}
                                                </Text>
                                            </Box>
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
                                { label: "Workflow Name", value: workflowName },
                                { label: "Failing Agent", value: failingAgent, icon: <IconSparkles size={14} /> },
                                { label: "Execution ID", value: id, copyable: true },
                                { label: "Execution Started", value: "Aug 4 2025, 14:14:50" },
                                { label: "Duration", value: "50.1 seconds" },
                            ].map((item, i) => (
                                <Box key={i} p="12" display="flex" flexDirection="column" gap="4" borderB={i < 4 ? "1" : "0"} borderColor="border.tertiary">
                                    <Text color="fg.tertiary" fontSize="sm" fontWeight="600">{item.label}</Text>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box display="flex" alignItems="center" gap="4">
                                            {item.icon && <Box className="text-fg-tertiary">{item.icon}</Box>}
                                            <Text fontWeight="500">{item.value}</Text>
                                        </Box>
                                        {item.copyable && <IconCopy size={14} className="text-fg-tertiary cursor-pointer" />}
                                    </Box>
                                </Box>
                            ))}
                            <Separator />
                            <Box p="12" display="flex" flexDirection="column" gap="4">
                                <Text color="fg.tertiary" fontSize="sm" fontWeight="600">Triggered By</Text>
                                <Box display="flex" alignItems="center" gap="8">
                                    <Avatar name="User Name" size="xs" />
                                    <Text fontWeight="500">User Name</Text>
                                </Box>
                            </Box>
                            <Separator />
                            <Box p="12" display="flex" flexDirection="column" gap="4" bg="bg.error.subtle">
                                <Box display="flex" alignItems="center" gap="4">
                                    <Text color="fg.error" fontSize="sm" fontWeight="600" textTransform="uppercase">Status</Text>
                                </Box>
                                <Box display="flex" alignItems="center" gap="8">
                                    <Badge intent="danger">FAILED</Badge>
                                    <Text fontSize="xs" color="fg.error">at node: {failingAgent}</Text>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Box display="flex" gap="8">
                        <Button w="full" appearance="subtle" icon={<IconDownload size={16} />}>Download Log</Button>
                        <Button w="full" appearance="subtle" icon={<IconPlayerStop size={16} />} className="text-red-600">Stop</Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

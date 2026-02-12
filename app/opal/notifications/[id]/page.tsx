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
    Textarea,
    Link,
    Switch,
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
    IconShieldCheck,
    IconEye,
    IconShieldOff,
    IconPackage,
    IconUser,
    IconCheck,
    IconX,
    IconLink,
    IconAlertTriangle,
} from "@tabler/icons-react";
import { IconEllipsisStroke, IconSparkles } from "@optimizely/axiom-icons";
import NextLink from "next/link";
import { use, useState, useEffect, useMemo } from "react";
import { mockNotifications, type Notification, getNotificationTypeLabel, getCategoryLabel } from "../mockData";

// ── Workflow Node ─────────────────────────────────────────────────────────────

const WorkflowNode = ({
    icon: Icon,
    title,
    description,
    status,
}: {
    icon: any;
    title: string;
    description: string;
    status?: "success" | "error" | "pending";
}) => (
    <Box
        p="12"
        bg="bg.default"
        border="1"
        borderColor={status === "error" ? "border.error" : "border.tertiary"}
        rounded="md"
        shadow="sm"
        className="w-[200px] relative"
    >
        <Box display="flex" alignItems="center" gap="8" mb="4">
            <Box p="4" bg="bg.secondary" rounded="sm">
                <Icon size={16} />
            </Box>
            <Text fontWeight="600" fontSize="sm">
                {title}
            </Text>
        </Box>
        <Text fontSize="xs" color="fg.tertiary" className="line-clamp-2">
            {description}
        </Text>

        {status === "success" && (
            <Box
                bg="bg.success"
                rounded="full"
                p="2"
                border="2"
                borderColor="border.default"
                className="absolute -top-1 -right-1"
            >
                <IconCircleCheck size={10} className="text-white" />
            </Box>
        )}
        {status === "error" && (
            <Box
                bg="bg.error"
                rounded="full"
                p="2"
                border="2"
                borderColor="border.default"
                className="absolute -top-1 -right-1"
            >
                <IconAlertCircle size={10} className="text-white" />
            </Box>
        )}
    </Box>
);

// ── Related Notifications ─────────────────────────────────────────────────────

function RelatedNotifications({ current, all }: { current: Notification; all: Notification[] }) {
    const related = useMemo(() => {
        return all
            .filter(
                (n) =>
                    n.id !== current.id &&
                    (n.agentName === current.agentName ||
                        n.category === current.category)
            )
            .slice(0, 5);
    }, [current, all]);

    if (related.length === 0) return null;

    return (
        <Box border="1" borderColor="border.tertiary" rounded="md" overflow="hidden" mt="24">
            <Box p="12" borderB="1" borderColor="border.tertiary" bg="bg.secondary">
                <Text fontWeight="600" fontSize="sm">
                    Related Notifications
                </Text>
            </Box>
            {related.map((n, i) => (
                <Link asChild key={n.id} color="fg.default">
                    <NextLink href={n.deepLink}>
                        <Box
                            p="12"
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            borderB={i < related.length - 1 ? "1" : undefined}
                            borderColor="border.tertiary"
                            className="hover:bg-[var(--ax-colors-bg-default-hovered)] cursor-pointer"
                        >
                            <Box display="flex" flexDirection="column" gap="2">
                                <Text fontSize="sm" fontWeight="500">{n.title}</Text>
                                <Text fontSize="xs" color="fg.tertiary">{n.timestamp} · {n.date}</Text>
                            </Box>
                            <Badge variant="subtle" intent={n.priority === "critical" ? "danger" : n.priority === "high" ? "warning" : "neutral"}>
                                {n.priority}
                            </Badge>
                        </Box>
                    </NextLink>
                </Link>
            ))}
        </Box>
    );
}

// ── Failed Execution View ─────────────────────────────────────────────────────

function FailedExecutionView({ notification }: { notification: Notification }) {
    const [comments, setComments] = useState([
        {
            author: "System",
            text: `Ticket auto-created. Workflow halted at node '${notification.agentName || "Unknown"}'.`,
            time: "2h ago",
        },
        {
            author: "Support Team",
            text: "Investigating the timeout. Likely caused by large context payload.",
            time: "1h ago",
        },
    ]);
    const [newComment, setNewComment] = useState("");

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        setComments([
            ...comments,
            { author: "Me", text: newComment, time: "Just now" },
        ]);
        setNewComment("");
    };

    return (
        <Tabs defaultValue="details">
            <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="trace">Trace</TabsTrigger>
                <TabsTrigger value="diagnosis">Error Diagnosis</TabsTrigger>
                <TabsTrigger value="ticket">Support Ticket</TabsTrigger>
            </TabsList>

            <TabsContent value="details" mt="24">
                <Box display="flex" flexDirection="column" gap="24">
                    {/* Workflow Map */}
                    <Box
                        border="1"
                        borderColor="border.tertiary"
                        rounded="lg"
                        overflow="hidden"
                        style={{
                            background:
                                "radial-gradient(circle, #E5E7EB 1px, transparent 1px)",
                            backgroundSize: "20px 20px",
                            backgroundColor: "#F9FAFB",
                        }}
                    >
                        <Box
                            p="12"
                            bg="bg.default"
                            borderB="1"
                            borderColor="border.tertiary"
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Text fontWeight="600" fontSize="sm">
                                Workflow Map
                            </Text>
                            <Badge variant="subtle">Execution View</Badge>
                        </Box>

                        <Box
                            p="32"
                            display="flex"
                            flexDirection="column"
                            gap="32"
                            overflow="hidden"
                            className="relative h-[400px]"
                        >
                            <Box
                                display="flex"
                                gap="48"
                                alignItems="center"
                                h="full"
                                className="w-max"
                            >
                                <Box display="flex" flexDirection="column" gap="24">
                                    <WorkflowNode
                                        icon={IconCalendar}
                                        title="Scheduler"
                                        description="Runs 7 AM everyday"
                                    />
                                    <WorkflowNode
                                        icon={IconMessage}
                                        title="Chat Input"
                                        description="When message is sent"
                                        status="success"
                                    />
                                </Box>
                                <Box
                                    bg="bg.tertiary"
                                    className="h-[1px] w-10 relative"
                                >
                                    <Box
                                        borderColor="border.tertiary"
                                        style={{ transform: "rotate(-45deg)" }}
                                        className="absolute right-0 -top-1 w-2 h-2 border-b-2 border-r-2"
                                    />
                                </Box>
                                <Box display="flex" flexDirection="column" gap="24">
                                    <WorkflowNode
                                        icon={IconWorld}
                                        title="Web Crawler"
                                        description="Extracts website data"
                                        status="success"
                                    />
                                    <WorkflowNode
                                        icon={IconCube}
                                        title="Test Idea Agent"
                                        description="Ideation for experiments"
                                        status="success"
                                    />
                                </Box>
                                <Box bg="bg.tertiary" className="h-[1px] w-10 relative" />
                                <Box display="flex" flexDirection="column" gap="24">
                                    <WorkflowNode
                                        icon={IconAnalyze}
                                        title="Web Analytics"
                                        description="All website activities"
                                    />
                                    <WorkflowNode
                                        icon={IconSparkles}
                                        title={notification.agentName || "Agent"}
                                        description="Processing step"
                                        status="error"
                                    />
                                    <WorkflowNode
                                        icon={IconBell}
                                        title="Set Notifications"
                                        description="Notify team via email"
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* Summary Cards */}
                    <Box display="flex" gap="16">
                        <Box
                            flex="1"
                            p="16"
                            border="1"
                            borderColor="border.tertiary"
                            rounded="md"
                            bg="bg.default"
                        >
                            <Text color="fg.tertiary" fontSize="sm" fontWeight="600">
                                Failed Node
                            </Text>
                            <Box display="flex" alignItems="center" gap="8" mt="8">
                                <IconSparkles size={18} className="text-fg-accent" />
                                <Text fontWeight="600">
                                    {notification.agentName}
                                </Text>
                            </Box>
                        </Box>
                        <Box
                            flex="1"
                            p="16"
                            border="1"
                            borderColor="border.error"
                            rounded="md"
                            bg="bg.error.subtle"
                        >
                            <Text color="fg.error" fontSize="sm" fontWeight="600">
                                Root Cause
                            </Text>
                            <Box display="flex" alignItems="center" gap="8" mt="8">
                                <IconAlertCircle size={18} className="text-fg-error" />
                                <Text color="fg.error" fontWeight="600">
                                    {notification.errorType || "Unknown Error"}
                                </Text>
                            </Box>
                        </Box>
                    </Box>

                    {/* Suggested Actions */}
                    <Box border="1" borderColor="border.tertiary" rounded="md" p="16">
                        <Text fontWeight="600" mb="12">Suggested Actions</Text>
                        <Box display="flex" flexDirection="column" gap="8">
                            {[
                                "Increase timeout threshold for this agent",
                                "Reduce input context size by filtering irrelevant data",
                                "Enable retry logic with exponential backoff",
                                "Check if a newer agent version resolves this issue",
                            ].map((action, i) => (
                                <Box key={i} display="flex" alignItems="center" gap="8" p="8" bg="bg.secondary" rounded="sm">
                                    <IconCheck size={14} color="var(--ax-colors-fg-success)" />
                                    <Text fontSize="sm">{action}</Text>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </TabsContent>

            <TabsContent value="trace" mt="24">
                <Box
                    border="1"
                    borderColor="border.tertiary"
                    rounded="md"
                    overflow="hidden"
                >
                    <Box
                        p="16"
                        bg="bg.secondary"
                        borderB="1"
                        borderColor="border.tertiary"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Heading level="4" fontSize="md">
                            Full Execution Trace
                        </Heading>
                        <Badge variant="subtle">
                            Node: {notification.agentName}
                        </Badge>
                    </Box>
                    <Box
                        p="0"
                        bg="bg.default"
                        fontFamily="mono"
                        fontSize="sm"
                        display="flex"
                        flexDirection="column"
                        className="h-[500px]"
                        overflowY="auto"
                    >
                        {[
                            { time: "14:14:50", type: "system", msg: `Workflow Execution Started: ID ${notification.executionId || notification.id}` },
                            { time: "14:14:51", type: "agent", msg: "Entering Agent: 'Web Crawler'", status: "success" },
                            { time: "14:14:54", type: "system", msg: "Agent 'Web Crawler' completed. Output passed to 'Test Idea Agent'." },
                            { time: "14:14:55", type: "agent", msg: "Entering Agent: 'Test Idea Agent'", status: "success" },
                            { time: "14:14:58", type: "system", msg: "Agent 'Test Idea Agent' completed. Data ready for processing." },
                            { time: "14:14:59", type: "agent", msg: `Entering Agent: '${notification.agentName}'`, status: "failed" },
                            { time: "14:15:00", type: "call", msg: "  ↳  Processing large context buffer (1.2MB)" },
                            { time: "14:15:40", type: "error", msg: `  ↳  Error: ${notification.errorType || "Unknown error"}` },
                            { time: "14:15:40", type: "system", msg: `Critical: Workflow halted at '${notification.agentName}'.` },
                        ].map((step, i) => (
                            <Box
                                key={i}
                                display="flex"
                                gap="16"
                                p="12"
                                borderB="1"
                                borderColor="border.tertiary"
                                bg={
                                    step.status === "failed" || step.type === "error"
                                        ? "bg.error.subtle"
                                        : undefined
                                }
                            >
                                <Text
                                    color="fg.tertiary"
                                    style={{ width: "80px", flexShrink: 0 }}
                                >
                                    {step.time}
                                </Text>
                                <Box
                                    flex="1"
                                    display="flex"
                                    alignItems="center"
                                    gap="8"
                                >
                                    {step.type === "agent" &&
                                        (step.status === "success" ? (
                                            <IconCircleCheck
                                                size={14}
                                                className="text-fg-success"
                                            />
                                        ) : (
                                            <IconAlertCircle
                                                size={14}
                                                className="text-fg-error"
                                            />
                                        ))}
                                    {step.type === "call" && (
                                        <IconSparkles
                                            size={14}
                                            className="text-fg-accent"
                                        />
                                    )}
                                    <Text
                                        color={
                                            step.type === "error"
                                                ? "fg.error"
                                                : step.type === "agent" &&
                                                    step.status === "success"
                                                    ? "fg.success"
                                                    : "fg.default"
                                        }
                                    >
                                        {step.msg}
                                    </Text>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </TabsContent>

            <TabsContent value="diagnosis" mt="24">
                <Box display="flex" flexDirection="column" gap="24">
                    <Box border="1" borderColor="border.error" rounded="md" p="24" bg="bg.error.subtle">
                        <Box display="flex" alignItems="center" gap="8" mb="12">
                            <IconAlertCircle size={20} className="text-fg-error" />
                            <Heading level="4" color="fg.error">Error Diagnosis</Heading>
                        </Box>
                        <Box display="flex" flexDirection="column" gap="12">
                            <Box>
                                <Text fontSize="sm" fontWeight="600" color="fg.error">Error Type</Text>
                                <Text>{notification.errorType || "Tool Timeout"}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="sm" fontWeight="600" color="fg.error">Error Source</Text>
                                <Text>{notification.errorSource || "Agent Processing"}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="sm" fontWeight="600" color="fg.error">Stack Trace</Text>
                                <Box p="12" bg="bg.default" rounded="sm" fontFamily="mono" fontSize="sm" mt="4">
                                    <Text color="fg.error">TimeoutError: Agent execution exceeded 40000ms limit</Text>
                                    <Text color="fg.tertiary">    at AgentExecutor.run (executor.ts:142)</Text>
                                    <Text color="fg.tertiary">    at WorkflowEngine.processNode (engine.ts:89)</Text>
                                    <Text color="fg.tertiary">    at async Pipeline.execute (pipeline.ts:56)</Text>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Box border="1" borderColor="border.tertiary" rounded="md" p="24">
                        <Heading level="4" mb="12">Possible Root Causes</Heading>
                        <Box display="flex" flexDirection="column" gap="8">
                            {[
                                { cause: "Large context payload (1.2MB)", likelihood: "High" },
                                { cause: "External API slowness", likelihood: "Medium" },
                                { cause: "Prompt chain complexity", likelihood: "Low" },
                            ].map((item, i) => (
                                <Box key={i} display="flex" justifyContent="space-between" p="8" bg="bg.secondary" rounded="sm">
                                    <Text fontSize="sm">{item.cause}</Text>
                                    <Badge intent={item.likelihood === "High" ? "danger" : item.likelihood === "Medium" ? "warning" : "neutral"} variant="subtle">
                                        {item.likelihood}
                                    </Badge>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </TabsContent>

            <TabsContent value="ticket" mt="24">
                <Box
                    border="1"
                    borderColor="border.tertiary"
                    rounded="md"
                    p="24"
                    display="flex"
                    flexDirection="column"
                    gap="24"
                >
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
                                        <Text fontSize="sm" color="fg.tertiary">
                                            {comment.time}
                                        </Text>
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
    );
}

// ── Guardrail View ────────────────────────────────────────────────────────────

function GuardrailView({ notification }: { notification: Notification }) {
    const [exemptionRequested, setExemptionRequested] = useState(false);

    return (
        <Box display="flex" flexDirection="column" gap="24">
            {/* Guardrail Details */}
            <Box border="1" borderColor={notification.guardrailStatus === "terminated" ? "border.error" : "border.warning"} rounded="md" p="24">
                <Box display="flex" alignItems="center" gap="8" mb="16">
                    {notification.guardrailStatus === "terminated" ? (
                        <IconShieldOff size={20} className="text-fg-error" />
                    ) : (
                        <IconEye size={20} className="text-fg-warning" />
                    )}
                    <Heading level="4">
                        {notification.guardrailType || "Guardrail"} — {notification.guardrailStatus === "terminated" ? "Blocked" : "Flagged"}
                    </Heading>
                </Box>
                <Box display="flex" flexDirection="column" gap="12">
                    <Box display="flex" gap="16">
                        <Box flex="1">
                            <Text fontSize="sm" fontWeight="600" color="fg.tertiary">Guardrail Type</Text>
                            <Text mt="4">{notification.guardrailType}</Text>
                        </Box>
                        <Box flex="1">
                            <Text fontSize="sm" fontWeight="600" color="fg.tertiary">Mode</Text>
                            <Text mt="4">{notification.type === "guardrail_enforcer" ? "Enforcer" : notification.type === "guardrail_observer" ? "Observer" : "Quality"}</Text>
                        </Box>
                        <Box flex="1">
                            <Text fontSize="sm" fontWeight="600" color="fg.tertiary">Agent</Text>
                            <Text mt="4">{notification.agentName || "—"}</Text>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Input / Output Comparison */}
            <Box display="flex" gap="16">
                <Box flex="1" border="1" borderColor="border.tertiary" rounded="md" overflow="hidden">
                    <Box p="12" bg="bg.secondary" borderB="1" borderColor="border.tertiary">
                        <Text fontWeight="600" fontSize="sm">Agent Output (Original)</Text>
                    </Box>
                    <Box p="16" fontSize="sm" fontFamily="mono">
                        <Text>The promotional email includes customer data:</Text>
                        <Text color="fg.error" mt="4" style={{ textDecoration: "line-through" }}>
                            Contact john.doe@example.com for more info.
                        </Text>
                        <Text color="fg.error" mt="4" style={{ textDecoration: "line-through" }}>
                            Call us at 555-0123 to claim your offer.
                        </Text>
                    </Box>
                </Box>
                <Box flex="1" border="1" borderColor="border.success" rounded="md" overflow="hidden">
                    <Box p="12" bg="bg.success.subtle" borderB="1" borderColor="border.success">
                        <Text fontWeight="600" fontSize="sm" color="fg.success">Corrected Output</Text>
                    </Box>
                    <Box p="16" fontSize="sm" fontFamily="mono">
                        <Text>The promotional email includes customer data:</Text>
                        <Text color="fg.success" mt="4">
                            Contact [EMAIL_REDACTED] for more info.
                        </Text>
                        <Text color="fg.success" mt="4">
                            Call us at [PHONE_REDACTED] to claim your offer.
                        </Text>
                    </Box>
                </Box>
            </Box>

            {/* Evaluation Criteria */}
            <Box border="1" borderColor="border.tertiary" rounded="md" p="24">
                <Heading level="4" mb="12">Evaluation Criteria</Heading>
                <Box display="flex" flexDirection="column" gap="8">
                    {[
                        { criterion: "PII Detection", result: "Failed", detail: "2 email addresses, 1 phone number detected" },
                        { criterion: "Brand Voice", result: "Passed", detail: "Tone matches guidelines" },
                        { criterion: "Readability", result: "Passed", detail: "Score: 85/100" },
                        { criterion: "Factual Accuracy", result: "Warning", detail: "1 unverifiable claim detected" },
                    ].map((item, i) => (
                        <Box key={i} display="flex" alignItems="center" justifyContent="space-between" p="12" bg="bg.secondary" rounded="sm">
                            <Box display="flex" alignItems="center" gap="8">
                                {item.result === "Failed" ? (
                                    <IconX size={14} color="var(--ax-colors-fg-error)" />
                                ) : item.result === "Warning" ? (
                                    <IconAlertTriangle size={14} color="var(--ax-colors-fg-warning)" />
                                ) : (
                                    <IconCheck size={14} color="var(--ax-colors-fg-success)" />
                                )}
                                <Text fontSize="sm" fontWeight="500">{item.criterion}</Text>
                            </Box>
                            <Box display="flex" alignItems="center" gap="12">
                                <Text fontSize="xs" color="fg.tertiary">{item.detail}</Text>
                                <Badge intent={item.result === "Failed" ? "danger" : item.result === "Warning" ? "warning" : "success"} variant="subtle">
                                    {item.result}
                                </Badge>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Exemption Request */}
            <Box border="1" borderColor="border.tertiary" rounded="md" p="24">
                <Heading level="4" mb="12">Actions</Heading>
                <Box display="flex" gap="12">
                    {!exemptionRequested ? (
                        <>
                            <Button appearance="default" onClick={() => setExemptionRequested(true)}>
                                Request Exemption
                            </Button>
                            <Button appearance="primary">
                                Improve Agent
                            </Button>
                        </>
                    ) : (
                        <Box display="flex" alignItems="center" gap="8" p="12" bg="bg.success.subtle" rounded="md" border="1" borderColor="border.success">
                            <IconCheck size={16} color="var(--ax-colors-fg-success)" />
                            <Text color="fg.success" fontWeight="500">Exemption request submitted. An admin will review your request.</Text>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

// ── Install Request View (Admin) ──────────────────────────────────────────────

function InstallRequestView({ notification }: { notification: Notification }) {
    const [decision, setDecision] = useState<"pending" | "approved" | "denied">("pending");
    const [approvalNote, setApprovalNote] = useState("");

    return (
        <Box display="flex" flexDirection="column" gap="24">
            {/* Agent Info Card */}
            <Box border="1" borderColor="border.tertiary" rounded="md" p="24">
                <Box display="flex" alignItems="center" gap="16" mb="16">
                    <Box p="12" bg="bg.information.subtle" rounded="md">
                        <IconPackage size={24} color="var(--ax-colors-fg-information)" />
                    </Box>
                    <Box>
                        <Heading level="3">{notification.agentName}</Heading>
                        <Text color="fg.tertiary">Requested by {notification.author?.name || notification.triggeredBy?.name || "Unknown"}</Text>
                    </Box>
                </Box>
                <Text>
                    This agent analyzes structured and unstructured data from multiple sources to provide actionable business insights.
                </Text>
            </Box>

            {/* Requestor Info */}
            <Box border="1" borderColor="border.tertiary" rounded="md" p="24">
                <Heading level="4" mb="12">Requestor Information</Heading>
                <Box display="flex" gap="24">
                    <Box display="flex" alignItems="center" gap="8">
                        <Avatar name={notification.triggeredBy?.name || "User"} size="md" />
                        <Box>
                            <Text fontWeight="600">{notification.triggeredBy?.name || "John Doe"}</Text>
                            <Text fontSize="sm" color="fg.tertiary">{notification.triggeredBy?.username || "john.doe"}@company.com</Text>
                        </Box>
                    </Box>
                    <Box>
                        <Text fontSize="sm" color="fg.tertiary" fontWeight="600">Department</Text>
                        <Text>Marketing</Text>
                    </Box>
                    <Box>
                        <Text fontSize="sm" color="fg.tertiary" fontWeight="600">Requested</Text>
                        <Text>{notification.timestamp}</Text>
                    </Box>
                </Box>
            </Box>

            {/* Security Checklist */}
            <Box border="1" borderColor="border.tertiary" rounded="md" p="24">
                <Heading level="4" mb="12">Security & Compliance Checklist</Heading>
                <Box display="flex" flexDirection="column" gap="8">
                    {[
                        { item: "Data access permissions reviewed", checked: true },
                        { item: "PII handling policy compliant", checked: true },
                        { item: "API rate limits configured", checked: true },
                        { item: "Output guardrails enabled", checked: false },
                        { item: "Audit logging enabled", checked: true },
                    ].map((check, i) => (
                        <Box key={i} display="flex" alignItems="center" gap="8" p="8">
                            {check.checked ? (
                                <IconCheck size={16} color="var(--ax-colors-fg-success)" />
                            ) : (
                                <IconAlertTriangle size={16} color="var(--ax-colors-fg-warning)" />
                            )}
                            <Text fontSize="sm" color={check.checked ? "fg.default" : "fg.warning"}>
                                {check.item}
                            </Text>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Decision */}
            {decision === "pending" ? (
                <Box border="1" borderColor="border.tertiary" rounded="md" p="24">
                    <Heading level="4" mb="12">Decision</Heading>
                    <Box display="flex" flexDirection="column" gap="12">
                        <Textarea
                            placeholder="Add a note (optional)..."
                            value={approvalNote}
                            onChange={(e) => setApprovalNote(e.target.value)}
                        />
                        <Box display="flex" gap="12">
                            <Button appearance="primary" onClick={() => setDecision("approved")}>
                                Approve Installation
                            </Button>
                            <Button appearance="default" onClick={() => setDecision("denied")} className="text-red-600">
                                Deny Request
                            </Button>
                        </Box>
                    </Box>
                </Box>
            ) : (
                <Box
                    p="16"
                    rounded="md"
                    border="1"
                    borderColor={decision === "approved" ? "border.success" : "border.error"}
                    bg={decision === "approved" ? "bg.success.subtle" : "bg.error.subtle"}
                    display="flex"
                    alignItems="center"
                    gap="8"
                >
                    {decision === "approved" ? (
                        <IconCheck size={20} color="var(--ax-colors-fg-success)" />
                    ) : (
                        <IconX size={20} color="var(--ax-colors-fg-error)" />
                    )}
                    <Text fontWeight="600" color={decision === "approved" ? "fg.success" : "fg.error"}>
                        Request {decision === "approved" ? "approved" : "denied"}. Notification sent to requestor.
                    </Text>
                </Box>
            )}
        </Box>
    );
}

// ── Generic View ──────────────────────────────────────────────────────────────

function GenericDetailView({ notification }: { notification: Notification }) {
    return (
        <Box display="flex" flexDirection="column" gap="24">
            <Box border="1" borderColor="border.tertiary" rounded="md" p="24">
                <Heading level="4" mb="12">Details</Heading>
                <Box display="flex" flexDirection="column" gap="12">
                    <Box>
                        <Text fontSize="sm" fontWeight="600" color="fg.tertiary">Type</Text>
                        <Text mt="4">{getNotificationTypeLabel(notification.type)}</Text>
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="600" color="fg.tertiary">Message</Text>
                        <Text mt="4">{notification.message}</Text>
                    </Box>
                    {notification.agentName && (
                        <Box>
                            <Text fontSize="sm" fontWeight="600" color="fg.tertiary">Agent</Text>
                            <Text mt="4">{notification.agentName} {notification.agentVersion || ""}</Text>
                        </Box>
                    )}
                    {notification.deepLink && notification.deepLink !== `/opal/notifications/${notification.id}` && (
                        <Box>
                            <Text fontSize="sm" fontWeight="600" color="fg.tertiary">Related Link</Text>
                            <Link asChild mt="4" color="fg.accent">
                                <NextLink href={notification.deepLink}>
                                    <Box display="flex" alignItems="center" gap="4">
                                        <IconLink size={14} />
                                        <Text>View related page</Text>
                                    </Box>
                                </NextLink>
                            </Link>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function NotificationDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);

    // Find notification from mock data
    const notification = useMemo(
        () =>
            mockNotifications.find(
                (n) => n.id === id || n.executionId === id
            ) || null,
        [id]
    );

    // Auto-mark as read
    useEffect(() => {
        // In a real app this would call an API
        // Simulated: notification marked as read on view
    }, [id]);

    if (!notification) {
        return (
            <Box p="32" display="flex" flexDirection="column" gap="24" h="full" bg="bg.default" alignItems="center" justifyContent="center">
                <IconAlertCircle size={48} color="var(--ax-colors-fg-tertiary)" />
                <Heading level="3" color="fg.secondary">Notification not found</Heading>
                <Text color="fg.tertiary">The notification with ID &quot;{id}&quot; could not be found.</Text>
                <Link asChild color="fg.accent">
                    <NextLink href="/opal/notifications">← Back to Notifications</NextLink>
                </Link>
            </Box>
        );
    }

    // Determine which view to show
    const isFailedExecution =
        notification.type === "agent_execution_failed";
    const isGuardrail = notification.category === "guardrail";
    const isInstallRequest =
        notification.type === "directory_install_request";

    const getTitle = () => {
        if (isFailedExecution)
            return notification.agentName
                ? `${notification.agentName} — Failed Execution`
                : "Failed Execution";
        return notification.title;
    };

    const getBadge = () => {
        if (isFailedExecution) return <Badge intent="danger">Failed</Badge>;
        if (notification.guardrailStatus === "terminated")
            return <Badge intent="danger">Blocked</Badge>;
        if (notification.guardrailStatus === "warning" || notification.guardrailStatus === "triggered")
            return <Badge intent="warning">Review</Badge>;
        if (isInstallRequest) return <Badge intent="information">Pending</Badge>;
        if (notification.executionStatus === "success")
            return <Badge intent="success">Success</Badge>;
        return <Badge variant="subtle">{getCategoryLabel(notification.category)}</Badge>;
    };

    return (
        <Box
            p="32"
            display="flex"
            flexDirection="column"
            gap="24"
            h="full"
            bg="bg.default"
            overflowY="auto"
        >
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
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box display="flex" alignItems="center" gap="12">
                        <Heading level="2">{getTitle()}</Heading>
                        {getBadge()}
                    </Box>
                    <Box display="flex" gap="12">
                        {isFailedExecution && (
                            <Button
                                appearance="default"
                                icon={<IconRefresh size={16} />}
                            >
                                Restart Workflow
                            </Button>
                        )}
                        <Button
                            appearance="subtle"
                            icon={<IconEllipsisStroke size={16} />}
                            aria-label="Options"
                        />
                    </Box>
                </Box>
            </Box>

            <Box display="flex" gap="32" alignItems="start">
                {/* Main Content */}
                <Box flex="1" display="flex" flexDirection="column">
                    {isFailedExecution && (
                        <FailedExecutionView notification={notification} />
                    )}
                    {isGuardrail && (
                        <GuardrailView notification={notification} />
                    )}
                    {isInstallRequest && (
                        <InstallRequestView notification={notification} />
                    )}
                    {!isFailedExecution && !isGuardrail && !isInstallRequest && (
                        <GenericDetailView notification={notification} />
                    )}

                    {/* Related Notifications */}
                    <RelatedNotifications current={notification} all={mockNotifications} />
                </Box>

                {/* Sidebar */}
                <Box
                    className="w-[300px]"
                    display="flex"
                    flexDirection="column"
                    gap="16"
                >
                    <Box
                        border="1"
                        borderColor="border.tertiary"
                        rounded="md"
                        overflow="hidden"
                    >
                        <Box display="flex" flexDirection="column">
                            {[
                                { label: "Notification ID", value: notification.id },
                                notification.agentName
                                    ? {
                                        label: "Agent",
                                        value: `${notification.agentName}${notification.agentVersion ? ` ${notification.agentVersion}` : ""}`,
                                        icon: <IconSparkles size={14} />,
                                    }
                                    : null,
                                notification.executionId
                                    ? {
                                        label: "Execution ID",
                                        value: notification.executionId,
                                        copyable: true,
                                    }
                                    : null,
                                { label: "Created", value: `${notification.date}, ${notification.timestamp}` },
                                notification.duration
                                    ? { label: "Duration", value: notification.duration }
                                    : null,
                                { label: "Category", value: getCategoryLabel(notification.category) },
                                { label: "Priority", value: notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1) },
                            ]
                                .filter(Boolean)
                                .map((item: any, i: number, arr: any[]) => (
                                    <Box
                                        key={i}
                                        p="12"
                                        display="flex"
                                        flexDirection="column"
                                        gap="4"
                                        borderB={i < arr.length - 1 ? "1" : "0"}
                                        borderColor="border.tertiary"
                                    >
                                        <Text
                                            color="fg.tertiary"
                                            fontSize="sm"
                                            fontWeight="600"
                                        >
                                            {item.label}
                                        </Text>
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="space-between"
                                        >
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                gap="4"
                                            >
                                                {item.icon && (
                                                    <Box className="text-fg-tertiary">
                                                        {item.icon}
                                                    </Box>
                                                )}
                                                <Text fontWeight="500">
                                                    {item.value}
                                                </Text>
                                            </Box>
                                            {item.copyable && (
                                                <IconCopy
                                                    size={14}
                                                    className="text-fg-tertiary cursor-pointer"
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                ))}
                            <Separator />
                            {notification.triggeredBy && (
                                <>
                                    <Box p="12" display="flex" flexDirection="column" gap="4">
                                        <Text
                                            color="fg.tertiary"
                                            fontSize="sm"
                                            fontWeight="600"
                                        >
                                            Triggered By
                                        </Text>
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            gap="8"
                                        >
                                            <Avatar
                                                name={notification.triggeredBy.name}
                                                size="xs"
                                            />
                                            <Text fontWeight="500">
                                                {notification.triggeredBy.name}
                                            </Text>
                                        </Box>
                                    </Box>
                                    <Separator />
                                </>
                            )}
                            <Box
                                p="12"
                                display="flex"
                                flexDirection="column"
                                gap="4"
                                bg={
                                    notification.executionStatus === "failed" ||
                                        notification.guardrailStatus === "terminated"
                                        ? "bg.error.subtle"
                                        : notification.guardrailStatus === "warning"
                                            ? "bg.warning.subtle"
                                            : "bg.success.subtle"
                                }
                            >
                                <Text
                                    color={
                                        notification.executionStatus === "failed" ||
                                            notification.guardrailStatus === "terminated"
                                            ? "fg.error"
                                            : notification.guardrailStatus === "warning"
                                                ? "fg.warning"
                                                : "fg.success"
                                    }
                                    fontSize="sm"
                                    fontWeight="600"
                                    textTransform="uppercase"
                                >
                                    Status
                                </Text>
                                <Box display="flex" alignItems="center" gap="8">
                                    {getBadge()}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Box display="flex" gap="8">
                        <Button
                            w="full"
                            appearance="subtle"
                            icon={<IconDownload size={16} />}
                        >
                            Download Log
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

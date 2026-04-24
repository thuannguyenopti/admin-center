"use client";

import {
    Box,
    Text,
    Button,
    Badge,
    Avatar,
    Tooltip,
    Disclosure,
    DisclosureContent,
    DisclosureTrigger,
} from "@optiaxiom/react";
import {
    IconXmark,
    IconArrowRotateLeft,
    IconArrowRotateRight,
    IconCopy,
    IconDownload,
    IconArrowsMaximize,
    IconSparkles,
    IconAgent,
    IconCodeBranch,
    IconChevronDown,
    IconCircleCheck,
    IconFile,
    IconImage,
    IconCode,
    IconPresentationScreen,
    IconFileSpreadsheet,
    IconChartColumn,
} from "@optimizely/axiom-icons";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const BORDER_S = "1px solid var(--ax-colors-border-secondary)";
const BORDER_T = "1px solid var(--ax-colors-border-tertiary)";

// Matches the Figma "Island - contents" radial gradient thumb
const THUMB_GRADIENT =
    "radial-gradient(ellipse at 20% 20%, rgba(245,243,255,1) 5%, rgba(229,239,255,1) 61%, rgba(221,214,254,1) 85%)";

const TYPE_ICON: Record<string, React.ReactNode> = {
    Document:     <IconFile size={20} />,
    Image:        <IconImage size={20} />,
    Code:         <IconCode size={20} />,
    Presentation: <IconPresentationScreen size={20} />,
    Spreadsheet:  <IconFileSpreadsheet size={20} />,
    Report:       <IconChartColumn size={20} />,
};

/** Figma "Island - contents" card — used as the canvas tile in chat */
function IslandContentTile({
    name,
    type,
    description,
    onExpand,
}: {
    name: string;
    type: string;
    description?: string;
    onExpand?: () => void;
}) {
    return (
        <Box
            bg="bg.default"
            display="flex"
            alignItems="center"
            gap="8"
            p="16"
            style={{
                border: BORDER_T,
                borderRadius: 12,
                overflow: "hidden",
                cursor: "default",
            }}
        >
            {/* Icon thumb with gradient */}
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: THUMB_GRADIENT,
                    flexShrink: 0,
                    color: "#080736",
                }}
            >
                {TYPE_ICON[type] ?? <IconFile size={20} />}
            </Box>

            {/* Text */}
            <Box display="flex" flexDirection="column" style={{ flex: 1, minWidth: 0 }}>
                <Text
                    fontWeight="600"
                    style={{
                        fontSize: 14,
                        lineHeight: "24px",
                        letterSpacing: "-0.154px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {name}
                </Text>
                {description && (
                    <Text
                        color="fg.secondary"
                        style={{
                            fontSize: 14,
                            lineHeight: 1.6,
                            letterSpacing: "-0.21px",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2,
                        }}
                    >
                        {description}
                    </Text>
                )}
            </Box>

            {/* Expand button */}
            <Tooltip content="Open artifact" delayDuration={300}>
                <span style={{ display: "inline-flex", flexShrink: 0 }}>
                    <Button
                        appearance="subtle"
                        size="sm"
                        icon={<IconArrowsMaximize size={14} />}
                        aria-label="Open artifact"
                        onClick={onExpand}
                    />
                </span>
            </Tooltip>
        </Box>
    );
}

type ArtifactSource = "chat" | "agent" | "workflow";

export type ArtifactViewerArtifact = {
    id: string;
    name: string;
    type: string;
    sourceType: ArtifactSource;
    sourceName: string;
    sourceLink?: string;
    createdBy: { name: string; avatar?: string };
    created: string;
    status: string;
    version?: string;
    imageUrl?: string;
};

type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
};

// ─── Mock chat thread ────────────────────────────────────────────────────────

const mockChatMessages: ChatMessage[] = [
    {
        id: "1",
        role: "user",
        content: "Can you write a Q2 email campaign targeting enterprise customers who haven't renewed yet?",
        timestamp: "10:24 AM",
    },
    {
        id: "2",
        role: "assistant",
        content: "Sure! I'll draft a compelling renewal campaign. Let me tailor the tone and offer structure for enterprise accounts.",
        timestamp: "10:24 AM",
    },
    {
        id: "3",
        role: "user",
        content: "Focus on the ROI angle and include a limited-time discount offer.",
        timestamp: "10:25 AM",
    },
    {
        id: "4",
        role: "assistant",
        content: "Got it — here's the artifact I generated based on your brief. I've highlighted the ROI benefits in the opening and included a 15% renewal discount valid for 14 days.",
        timestamp: "10:26 AM",
    },
];

// ─── Agent Execution Log ─────────────────────────────────────────────────────

function ExecutionSection({
    label,
    children,
    open,
    onOpenChange,
}: {
    label: string;
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
    return (
        <Disclosure open={open} onOpenChange={onOpenChange}>
            <Box style={{ borderBottom: BORDER_S }}>
                <DisclosureTrigger
                    chevronPosition="end"
                    fontWeight="400"
                    fontSize="sm"
                    px="16"
                    py="12"
                >
                    {label}
                </DisclosureTrigger>
                <DisclosureContent>
                    <Box px="16" pb="12">
                        {children}
                    </Box>
                </DisclosureContent>
            </Box>
        </Disclosure>
    );
}

const EXEC_SECTIONS = [
    "Input Variables",
    "Output",
    "Execution Memory",
    "Output Quality Score",
    "Guardrail Status",
] as const;
type ExecSectionKey = typeof EXEC_SECTIONS[number];

function AgentExecutionLog({ artifact }: { artifact: ArtifactViewerArtifact }) {
    const [sectionOpen, setSectionOpen] = useState<Record<ExecSectionKey, boolean>>({
        "Input Variables": false,
        "Output": false,
        "Execution Memory": false,
        "Output Quality Score": false,
        "Guardrail Status": false,
    });

    const allExpanded = EXEC_SECTIONS.every((s) => sectionOpen[s]);

    const toggleAll = () => {
        const next = !allExpanded;
        setSectionOpen(Object.fromEntries(EXEC_SECTIONS.map((s) => [s, next])) as Record<ExecSectionKey, boolean>);
    };

    const toggleSection = (key: ExecSectionKey) =>
        setSectionOpen((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <Box display="flex" flexDirection="column" h="full" style={{ overflowY: "auto" }}>
            {/* Header */}
            <Box
                display="flex"
                alignItems="center"
                gap="10"
                px="16"
                py="12"
                style={{ borderBottom: BORDER_S, flexShrink: 0 }}
            >
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    rounded="md"
                    style={{ width: 32, height: 32, background: "#ede9fe", flexShrink: 0 }}
                >
                    <IconAgent size={16} color="var(--ax-colors-fg-accent)" />
                </Box>
                <Box display="flex" flexDirection="column" gap="2" style={{ flex: 1, minWidth: 0 }}>
                    <Text fontSize="sm" fontWeight="600">Agent Execution</Text>
                </Box>
                <Badge intent="success">Completed</Badge>
            </Box>

            {/* Tabs */}
            <Box display="flex" style={{ borderBottom: BORDER_S, flexShrink: 0 }}>
                {["Details", "Trace"].map((tab, i) => (
                    <Box
                        key={tab}
                        px="16"
                        py="10"
                        style={{
                            cursor: "pointer",
                            borderBottom: i === 0 ? "2px solid var(--ax-colors-fg-accent)" : "2px solid transparent",
                        }}
                    >
                        <Text
                            fontSize="sm"
                            fontWeight={i === 0 ? "600" : "400"}
                            color={i === 0 ? "fg.default" : "fg.secondary"}
                        >
                            {tab}
                        </Text>
                    </Box>
                ))}
            </Box>

            {/* Metadata table — bordered card */}
            <Box px="16" py="12">
                <Box border="1" borderColor="border.secondary" rounded="sm" style={{ overflow: "hidden" }}>
                    {[
                        { label: "Agent Name", value: `${artifact.sourceName} v1.2` },
                        { label: "Execution ID", value: "exec_4f2a9c81", copyable: true },
                        { label: "Execution Started", value: artifact.created },
                        { label: "Duration", value: "1m 24s" },
                        { label: "Executed By", value: artifact.createdBy.name, avatar: artifact.createdBy.avatar },
                        { label: "Output Quality Score", value: "95%", badge: "Passed", badgeIntent: "success" as const },
                        { label: "Guardrail Status", value: "", badge: "Passed", badgeIntent: "success" as const },
                        { label: "Credits", value: "20" },
                    ].map((row, i, arr) => (
                        <Box
                            key={row.label}
                            display="flex"
                            alignItems="center"
                            px="12"
                            py="8"
                            gap="8"
                            style={{ borderBottom: i < arr.length - 1 ? BORDER_T : undefined }}
                        >
                            <Text fontSize="sm" color="fg.secondary" style={{ minWidth: 148, flexShrink: 0 }}>
                                {row.label}
                            </Text>
                            <Box display="flex" alignItems="center" gap="6" style={{ flex: 1 }}>
                                {row.avatar && <Avatar name={row.value} src={row.avatar} size="sm" />}
                                {row.value && <Text fontSize="sm" fontWeight="500">{row.value}</Text>}
                                {row.badge && <Badge intent={row.badgeIntent}>{row.badge}</Badge>}
                                {row.copyable && (
                                    <Tooltip content="Copy ID" delayDuration={300}>
                                        <span style={{ display: "inline-flex" }}>
                                            <Button
                                                appearance="subtle"
                                                size="sm"
                                                icon={<IconCopy size={12} />}
                                                aria-label="Copy execution ID"
                                            />
                                        </span>
                                    </Tooltip>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Expand all */}
            <Box px="16" pb="8" style={{ borderBottom: BORDER_S }}>
                <Button appearance="subtle" size="sm" onClick={toggleAll}>
                    {allExpanded ? "Collapse all" : "Expand all"}
                </Button>
            </Box>

            {/* Collapsible sections */}
            <Box style={{ borderTop: BORDER_S }}>
                <ExecutionSection
                    label="Input Variables"
                    open={sectionOpen["Input Variables"]}
                    onOpenChange={() => toggleSection("Input Variables")}
                >
                    <Text fontSize="sm" color="fg.secondary">
                        target_segment: enterprise_renewal, offer: 15_pct_discount, tone: professional
                    </Text>
                </ExecutionSection>
                <ExecutionSection
                    label="Output"
                    open={sectionOpen["Output"]}
                    onOpenChange={() => toggleSection("Output")}
                >
                    <Text fontSize="sm" color="fg.secondary">Generated artifact: {artifact.name}</Text>
                </ExecutionSection>
                <ExecutionSection
                    label="Execution Memory"
                    open={sectionOpen["Execution Memory"]}
                    onOpenChange={() => toggleSection("Execution Memory")}
                >
                    <Text fontSize="sm" color="fg.secondary">3 memory entries used · 2 retrieved from long-term store</Text>
                </ExecutionSection>
                <ExecutionSection
                    label="Output Quality Score"
                    open={sectionOpen["Output Quality Score"]}
                    onOpenChange={() => toggleSection("Output Quality Score")}
                >
                    <Text fontSize="sm" color="fg.secondary">Coherence: 96 · Relevance: 94 · Tone alignment: 95</Text>
                </ExecutionSection>
                <ExecutionSection
                    label="Guardrail Status"
                    open={sectionOpen["Guardrail Status"]}
                    onOpenChange={() => toggleSection("Guardrail Status")}
                >
                    <Text fontSize="sm" color="fg.secondary">All 4 guardrails passed · No policy violations detected</Text>
                </ExecutionSection>
            </Box>

            {/* Footer */}
            <Box
                display="flex"
                gap="8"
                p="16"
                mt="auto"
                style={{ borderTop: BORDER_S }}
            >
                <Button appearance="subtle" size="sm" icon={<IconDownload size={14} />}>
                    Download
                </Button>
                <Button appearance="subtle" size="sm">
                    Close
                </Button>
            </Box>
        </Box>
    );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────

function ChatPanel({ artifact }: { artifact: ArtifactViewerArtifact }) {
    return (
        <Box display="flex" flexDirection="column" h="full">
            {/* Header */}
            <Box
                display="flex"
                alignItems="center"
                gap="8"
                px="16"
                py="12"
                style={{ borderBottom: BORDER_S, flexShrink: 0 }}
            >
                <img src="/opal-orb.png" alt="" width={20} height={20} style={{ display: "block", flexShrink: 0 }} />
                <Text fontSize="sm" fontWeight="600" style={{ flex: 1 }}>{artifact.sourceName}</Text>
                <Button appearance="subtle" size="sm">New Chat</Button>
            </Box>

            {/* Messages */}
            <Box
                display="flex"
                flexDirection="column"
                gap="16"
                p="16"
                style={{ flex: 1, overflowY: "auto" }}
            >
                {mockChatMessages.map((msg) => (
                    <Box key={msg.id} display="flex" flexDirection="column" gap="4">
                        <Box display="flex" alignItems="center" gap="8">
                            {msg.role === "user" ? (
                                <Avatar name={artifact.createdBy.name} src={artifact.createdBy.avatar} size="sm" />
                            ) : (
                                <img src="/opal-orb.png" alt="Opal" width={20} height={20} style={{ borderRadius: "50%" }} />
                            )}
                            <Text fontSize="xs" color="fg.tertiary">{msg.timestamp}</Text>
                        </Box>
                        <Box
                            bg={msg.role === "user" ? "bg.page" : "bg.default"}
                            border="1"
                            borderColor="border.tertiary"
                            p="12"
                            rounded="lg"
                            style={{ marginLeft: 28 }}
                        >
                            <Text fontSize="sm">{msg.content}</Text>
                        </Box>
                    </Box>
                ))}

                {/* Artifact canvas tile — Figma "Island - contents" style */}
                <Box style={{ marginLeft: 28 }}>
                    <IslandContentTile
                        name={artifact.name}
                        type={artifact.type}
                        description={`${artifact.type} · ${artifact.created}`}
                    />
                </Box>

                {/* Sources */}
                <Box display="flex" flexDirection="column" gap="6" style={{ marginLeft: 28 }}>
                    <Text fontSize="xs" color="fg.secondary" fontWeight="500">Sources</Text>
                    {["Brand guidelines", "Q1 campaign brief", "Customer data"].map((s) => (
                        <Box
                            key={s}
                            display="flex"
                            alignItems="center"
                            gap="6"
                            px="10"
                            py="6"
                            bg="bg.page"
                            border="1"
                            borderColor="border.tertiary"
                            rounded="md"
                        >
                            <Text fontSize="xs" color="fg.secondary">{s}</Text>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Input */}
            <Box p="12" style={{ borderTop: BORDER_S }}>
                <Box
                    bg="bg.page"
                    border="1"
                    borderColor="border.secondary"
                    rounded="lg"
                    p="10"
                    display="flex"
                    alignItems="center"
                    gap="8"
                >
                    <img src="/opal-orb.png" alt="" width={16} height={16} />
                    <Text fontSize="sm" color="fg.tertiary" style={{ flex: 1 }}>Ask Opal anything…</Text>
                </Box>
            </Box>
        </Box>
    );
}

// ─── Canvas Panel ─────────────────────────────────────────────────────────────

function CanvasPanel({ artifact }: { artifact: ArtifactViewerArtifact }) {
    return (
        <Box display="flex" flexDirection="column" h="full" bg="bg.page">
            {/* Canvas content — collab editor style */}
            <Box
                p="32"
                style={{ flex: 1, overflowY: "auto", background: "var(--ax-colors-bg-page)" }}
            >
                <Box style={{ maxWidth: 720, width: "100%", margin: "0 auto" }} display="flex" flexDirection="column" gap="16">

                    {/* Island header tile — consistent with IslandContentTile */}
                    <Box
                        bg="bg.default"
                        display="flex"
                        alignItems="center"
                        gap="12"
                        p="20"
                        style={{ border: BORDER_T, borderRadius: 12 }}
                    >
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            style={{
                                padding: "10px 14px",
                                borderRadius: 8,
                                background: THUMB_GRADIENT,
                                flexShrink: 0,
                                color: "#080736",
                            }}
                        >
                            {TYPE_ICON[artifact.type] ?? <IconFile size={20} />}
                        </Box>
                        <Box display="flex" flexDirection="column" gap="2" style={{ flex: 1 }}>
                            <Text fontWeight="600" style={{ fontSize: 16, lineHeight: "24px", letterSpacing: "-0.2px" }}>
                                {artifact.name}
                            </Text>
                            <Text color="fg.tertiary" fontSize="sm">
                                {artifact.type} · {artifact.created}{artifact.version ? ` · v${artifact.version}` : ""}
                            </Text>
                        </Box>
                    </Box>

                    {/* Document body */}
                    <Box
                        bg="bg.default"
                        display="flex"
                        flexDirection="column"
                        gap="16"
                        p="32"
                        style={{ border: BORDER_T, borderRadius: 12 }}
                    >
                        <Text style={{ lineHeight: "1.7" }}>
                            Dear valued customer, as we head into Q2 we want to acknowledge the partnership we&apos;ve built
                            together over the past year. Your investment in our platform has driven measurable results — and
                            we&apos;re confident the next chapter will deliver even more.
                        </Text>
                        <Text style={{ lineHeight: "1.7" }}>
                            To show our appreciation, we&apos;re extending an exclusive renewal offer:{" "}
                            <strong>15% off your enterprise subscription</strong> when you renew within the next 14 days.
                            This is our way of saying thank you for being part of the journey.
                        </Text>
                        <Text style={{ lineHeight: "1.7" }}>
                            Ready to continue building momentum? Your account team is standing by to walk you through
                            everything that&apos;s new — and everything that&apos;s coming.
                        </Text>

                        {/* Metadata fields */}
                        <Box
                            mt="8"
                            p="16"
                            style={{ background: "var(--ax-colors-bg-page)", border: BORDER_T, borderRadius: 8 }}
                            display="flex"
                            flexDirection="column"
                            gap="8"
                        >
                            {[
                                { label: "Author", value: artifact.createdBy.name },
                                { label: "Meta Title", value: `${artifact.name} | Optimizely` },
                                { label: "Meta Description", value: "Exclusive Q2 enterprise renewal offer — 15% off for 14 days." },
                                { label: "URL Slug", value: "q2-enterprise-renewal-campaign" },
                            ].map((field) => (
                                <Box key={field.label} display="flex" alignItems="start" gap="16">
                                    <Text
                                        fontSize="xs"
                                        color="fg.tertiary"
                                        style={{ minWidth: 130, flexShrink: 0, paddingTop: 2 }}
                                    >
                                        {field.label}
                                    </Text>
                                    <Text fontSize="sm" color="fg.secondary">{field.value}</Text>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

// ─── Main ArtifactViewer ──────────────────────────────────────────────────────

type ArtifactViewerProps = {
    artifact: ArtifactViewerArtifact;
    onClose: () => void;
    openMode?: "preview" | "with-panel";
};

export function ArtifactViewer({ artifact, onClose, openMode = "preview" }: ArtifactViewerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    const isWorkflow = artifact.sourceType === "workflow" || artifact.sourceType === "agent";
    const showPanel = openMode === "with-panel";

    const panel = (
        <Box
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                background: "var(--ax-colors-bg-default)",
            }}
        >
            {/* Unified toolbar — single 48px row matching opal canvas style */}
            <Box
                display="flex"
                alignItems="center"
                gap="4"
                px="12"
                bg="bg.default"
                style={{ flexShrink: 0, borderBottom: BORDER_S, height: 48, overflow: "hidden", zIndex: 1 }}
            >
                {/* Close */}
                <Button appearance="subtle" size="sm" icon={<IconXmark size={16} />} aria-label="Close" onClick={onClose} />

                {/* Divider */}
                <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0, margin: "0 4px" }} />

                {/* Title + badge + version */}
                <Box display="flex" alignItems="center" gap="8" style={{ flexShrink: 1, minWidth: 0, overflow: "hidden" }}>
                    <Box color="fg.secondary" display="flex" alignItems="center" style={{ flexShrink: 0 }}>
                        {isWorkflow ? <IconCodeBranch size={15} /> : <IconSparkles size={15} />}
                    </Box>
                    <Text fontSize="sm" fontWeight="600" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 240 }}>
                        {artifact.name}
                    </Text>
                    <Badge intent={artifact.status === "Ready" ? "success" : artifact.status === "Failed" ? "danger" : "information"}>
                        {artifact.status}
                    </Badge>
                    {artifact.version && (
                        <Text fontSize="xs" color="fg.tertiary" style={{ flexShrink: 0 }}>v{artifact.version}</Text>
                    )}
                </Box>

                {/* Spacer */}
                <Box style={{ flex: 1 }} />

                {/* Right cluster */}
                <Box display="flex" alignItems="center" gap="8" style={{ flexShrink: 0 }}>
                    {/* Saved indicator */}
                    <Box display="flex" alignItems="center" gap="4">
                        <IconCircleCheck size={15} color="var(--ax-colors-fg-success)" />
                        <Text fontSize="sm" color="fg.tertiary" style={{ whiteSpace: "nowrap" }}>Change saved.</Text>
                    </Box>

                    {/* Undo / Redo / Copy / Download */}
                    <Box display="flex" alignItems="center" gap="4">
                        <Tooltip content="Undo" delayDuration={300}>
                            <span style={{ display: "inline-flex" }}>
                                <Button appearance="subtle" size="sm" icon={<IconArrowRotateLeft size={15} />} aria-label="Undo" />
                            </span>
                        </Tooltip>
                        <Tooltip content="Redo" delayDuration={300}>
                            <span style={{ display: "inline-flex" }}>
                                <Button appearance="subtle" size="sm" icon={<IconArrowRotateRight size={15} />} aria-label="Redo" />
                            </span>
                        </Tooltip>
                        <Tooltip content="Copy" delayDuration={300}>
                            <span style={{ display: "inline-flex" }}>
                                <Button appearance="subtle" size="sm" icon={<IconCopy size={15} />} aria-label="Copy" />
                            </span>
                        </Tooltip>
                        <Tooltip content="Download" delayDuration={300}>
                            <span style={{ display: "inline-flex" }}>
                                <Button appearance="subtle" size="sm" icon={<IconDownload size={15} />} aria-label="Download" />
                            </span>
                        </Tooltip>
                    </Box>

                    {/* Divider */}
                    <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0 }} />

                    {/* Add to */}
                    <Button appearance="primary" size="sm" icon={<IconChevronDown size={13} />} iconPosition="end">
                        Add to
                    </Button>
                </Box>
            </Box>

            {/* Split panels */}
            <Box display="flex" style={{ flex: 1, overflow: "hidden" }}>
                {/* Left: Canvas */}
                <Box style={{ flex: "1 1 0", overflow: "hidden", borderRight: showPanel ? BORDER_S : undefined }}>
                    <CanvasPanel artifact={artifact} />
                </Box>

                {/* Right: Context panel — only shown when opened via source */}
                {showPanel && (
                    <Box style={{ width: 400, flexShrink: 0, overflow: "hidden" }}>
                        {isWorkflow ? (
                            <AgentExecutionLog artifact={artifact} />
                        ) : (
                            <ChatPanel artifact={artifact} />
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );

    return createPortal(panel, document.body);
}

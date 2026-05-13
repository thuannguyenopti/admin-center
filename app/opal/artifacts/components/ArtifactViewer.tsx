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
import { OpalChatView } from "@/app/components/Opal/OpalChatView";
import { CodeCanvasPanel } from "@/app/components/Opal/CodeCanvasPanel";
import type { ChatMessage as OpalChatMessage } from "@/app/hooks/useOpalState";
import {
    IconArrowsMaximize,
    IconCodeBranch,
    IconComments,
    IconCopy,
    IconDownload,
    IconFile,
    IconImage,
    IconCode,
    IconPresentationScreen,
    IconFileSpreadsheet,
    IconChartColumn,
} from "@optiaxiom/icons";
import { IconAgent } from "@optimizely/axiom-icons";
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
                rounded="sm"
                style={{
                    padding: "8px 12px",
                    background: THUMB_GRADIENT,
                    flexShrink: 0,
                    color: "var(--ax-colors-fg-default)",
                }}
            >
                {TYPE_ICON[type] ?? <IconFile size={20} />}
            </Box>

            {/* Text */}
            <Box display="flex" flexDirection="column" style={{ flex: 1, minWidth: 0 }}>
                <Text
                    fontSize="md"
                    fontWeight="600"
                    style={{
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
                        fontSize="md"
                        color="fg.secondary"
                        style={{
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

// ─── Mock content by artifact type ───────────────────────────────────────────

const MOCK_CONTENT: Record<string, string> = {
    Document: `<p>Dear valued customer, as we head into Q2 we want to acknowledge the partnership we've built together over the past year. Your investment in our platform has driven measurable results — and we're confident the next chapter will deliver even more.</p><p>To show our appreciation, we're extending an exclusive renewal offer: <strong>15% off your enterprise subscription</strong> when you renew within the next 14 days. This is our way of saying thank you for being part of the journey.</p><p>Ready to continue building momentum? Your account team is standing by to walk you through everything that's new — and everything that's coming.</p>`,
    Report: `<h1>Competitive Analysis Report</h1><p>This report provides a deep-dive into 5 key competitors, analyzing their positioning, pricing, and content strategies to uncover gaps and opportunities.</p><h2>Key Findings</h2><ul><li><strong>Competitor A</strong> leads on pricing transparency but lags in enterprise features.</li><li><strong>Competitor B</strong> has strong brand recognition but poor NPS scores.</li><li><strong>Competitor C</strong> is gaining traction in the mid-market with aggressive bundling.</li></ul><h2>Recommendations</h2><p>Focus messaging on enterprise reliability and workflow integrations where competitors are weakest. Prioritize case studies from the financial services vertical.</p>`,
    Spreadsheet: `<h2>Content Calendar — April</h2><p>This spreadsheet tracks all planned content across channels for April. Each row represents a published asset with its status, owner, and publish date.</p><h3>Summary</h3><ul><li>32 total assets planned</li><li>18 completed, 10 in review, 4 not started</li><li>Top channels: Blog (12), Social (8), Email (6), Video (4)</li></ul>`,
    Presentation: `<h1>Q1 Sales Deck</h1><p>Exec-level Q1 readout covering pipeline performance, ARR highlights, and strategic priorities for Q2.</p><h2>Q1 Highlights</h2><ul><li>ARR grew 23% YoY to $48M</li><li>Net new logos: 47 enterprise accounts</li><li>NRR: 118%</li></ul><h2>Q2 Priorities</h2><p>Expand into EMEA, accelerate partner channel, and launch the AI-powered workflow suite in June.</p>`,
    Code: `<h2>A/B Test Variants — Checkout CTA</h2><p>Three CTA copy variants optimized for checkout conversion, with tracking snippets for each.</p><pre><code>// Variant A
const CTA_A = "Start your free trial";

// Variant B
const CTA_B = "Get started — no credit card required";

// Variant C
const CTA_C = "Claim your 30-day trial";</code></pre><p>Deploy via feature flag <code>checkout_cta_test</code>. Target: 33% traffic split across all three variants.</p>`,
};

function getMockContent(type: string): string {
    return MOCK_CONTENT[type] ?? `<p>This artifact does not have a text preview.</p>`;
}

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
                    bg="bg.accent.subtle"
                    style={{ width: 32, height: 32, flexShrink: 0 }}
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

const SEED_MESSAGES: OpalChatMessage[] = [
    { id: "1", role: "user", content: "Can you write a Q2 email campaign targeting enterprise customers who haven't renewed yet?", timestamp: Date.now() - 120000 },
    { id: "2", role: "assistant", content: "Sure! I'll draft a compelling renewal campaign. Let me tailor the tone and offer structure for enterprise accounts.", timestamp: Date.now() - 119000 },
    { id: "3", role: "user", content: "Focus on the ROI angle and include a limited-time discount offer.", timestamp: Date.now() - 60000 },
    { id: "4", role: "assistant", content: "Got it — here's the artifact I generated based on your brief. I've highlighted the ROI benefits in the opening and included a 15% renewal discount valid for 14 days.", timestamp: Date.now() - 55000 },
];

function ChatPanel({ artifact }: { artifact: ArtifactViewerArtifact }) {
    const [messages, setMessages] = useState<OpalChatMessage[]>(SEED_MESSAGES);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = (content: string) => {
        if (!content.trim()) return;
        const userMsg: OpalChatMessage = { id: Date.now().toString(), role: "user", content, timestamp: Date.now() };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsLoading(true);
        setTimeout(() => {
            const reply: OpalChatMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: `I've noted your feedback on "${artifact.name}". Let me update the artifact accordingly.`, timestamp: Date.now() };
            setMessages((prev) => [...prev, reply]);
            setIsLoading(false);
        }, 1200);
    };

    return (
        <OpalChatView
            messages={messages}
            inputValue={inputValue}
            isLoading={isLoading}
            setInputValue={setInputValue}
            onSend={handleSend}
            onSuggestionClick={handleSend}
            variant="assistant"
        />
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
                            rounded="md"
                            style={{
                                padding: "10px 14px",
                                background: THUMB_GRADIENT,
                                flexShrink: 0,
                                color: "var(--ax-colors-fg-default)",
                            }}
                        >
                            {TYPE_ICON[artifact.type] ?? <IconFile size={20} />}
                        </Box>
                        <Box display="flex" flexDirection="column" gap="4" style={{ flex: 1 }}>
                            <Text fontSize="lg" fontWeight="600" style={{ lineHeight: "24px", letterSpacing: "-0.2px" }}>
                                {artifact.name}
                            </Text>
                            <Text color="fg.tertiary" fontSize="sm">
                                {artifact.type} · {artifact.created}{artifact.version ? ` · v${artifact.version}` : ""}
                            </Text>
                            <Box display="flex" alignItems="center" gap="4" color="fg.tertiary">
                                {artifact.sourceType === "workflow" ? (
                                    <IconCodeBranch size={13} />
                                ) : artifact.sourceType === "chat" ? (
                                    <IconComments size={13} />
                                ) : (
                                    <IconAgent size={13} />
                                )}
                                <Text fontSize="sm" color="fg.tertiary">
                                    {artifact.sourceType === "chat" ? "Chat" : artifact.sourceName}
                                </Text>
                            </Box>
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
                                        fontSize="sm"
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
                background: "var(--ax-colors-bg-default)",
            }}
        >
            {/* Left: canvas column — CodeCanvasPanel owns the toolbar */}
            <Box style={{ flex: "1 1 0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <CodeCanvasPanel
                    onClose={onClose}
                    artifactTitle={artifact.name}
                    artifactStatus={artifact.status}
                    artifactVersion={artifact.version}
                    artifactSource={{ type: artifact.sourceType, name: artifact.sourceName }}
                    initialHtml={getMockContent(artifact.type)}
                />
            </Box>

            {/* Right: context panel — only shown when opened via source */}
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
    );

    return createPortal(panel, document.body);
}

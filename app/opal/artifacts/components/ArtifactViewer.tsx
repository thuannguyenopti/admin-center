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
    IconAgent,
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
    IconCircleCheckSolid,
    IconPen,
} from "@optimizely/axiom-icons";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
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

// ─── Team Thread Panel ────────────────────────────────────────────────────────

type ApprovalState = "pending" | "approved" | "changes";

/** Inline approval action card — matches opal/page.tsx ApprovalActionCard */
function ThreadApprovalCard({
    state,
    onApprove,
    onRequestChanges,
}: {
    state: ApprovalState;
    onApprove: () => void;
    onRequestChanges: () => void;
}) {
    if (state !== "pending") {
        return (
            <Box
                display="flex"
                flexDirection="column"
                gap="4"
                p="16"
                rounded="lg"
                style={{
                    border: BORDER_S,
                    background: "var(--ax-colors-bg-default)",
                    opacity: 0.6,
                }}
            >
                <Text fontWeight="500" style={{ fontSize: 14, color: "var(--ax-colors-fg-default)", lineHeight: 1.43 }}>
                    Team approval needed for Q and A: Discover the unknown
                </Text>
                <Text style={{ fontSize: 14, color: "var(--ax-colors-fg-tertiary)", lineHeight: 1.43 }}>
                    Jamie Chen: {state === "approved" ? "Approved" : "Requested changes"}
                </Text>
            </Box>
        );
    }
    return (
        <Box
            display="flex"
            flexDirection="column"
            gap="12"
            p="20"
            rounded="lg"
            style={{ border: BORDER_S, background: "var(--ax-colors-bg-default)" }}
        >
            {/* Agent indicator */}
            <Box display="flex" alignItems="center" gap="4">
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    rounded="xs"
                    style={{ width: 20, height: 20, background: "#e4f0da", flexShrink: 0, overflow: "hidden" }}
                >
                    <Image src="/avatars/mock-avatar-geo.svg" alt="GEO" width={14} height={14} />
                </Box>
                <Text style={{ fontSize: 12, fontWeight: 400, letterSpacing: "0.36px", textTransform: "uppercase", color: "var(--ax-colors-fg-tertiary)", lineHeight: 1.25 }}>
                    Frank
                </Text>
            </Box>

            {/* File info */}
            <Box display="flex" flexDirection="column" gap="4">
                <Text fontWeight="600" style={{ fontSize: 16, lineHeight: 1.3, color: "var(--ax-colors-fg-default)" }}>
                    Q and A: Discover the unknown
                </Text>
                <Text style={{ fontSize: 14, letterSpacing: "0.28px", color: "var(--ax-colors-fg-secondary)", lineHeight: 1.43 }}>
                    GEO Q&amp;A article · v2.0
                </Text>
            </Box>

            <Box style={{ height: 1, background: "var(--ax-colors-border-default)", width: "100%" }} />

            {/* Key insight */}
            <Box
                display="flex"
                flexDirection="column"
                gap="8"
                p="16"
                rounded="sm"
                style={{ background: "#f6faf3" }}
            >
                <Text fontWeight="500" style={{ fontSize: 14, letterSpacing: "0.28px", color: "var(--ax-colors-fg-default)", lineHeight: 1.43 }}>
                    Team approval needed
                </Text>
                <Text style={{ fontSize: 14, letterSpacing: "0.28px", color: "var(--ax-colors-fg-secondary)", lineHeight: 1.43 }}>
                    Review the updated Q&amp;A article. Approve to proceed with publishing, or request further changes.
                </Text>
            </Box>

            {/* Actions */}
            <Box display="flex" justifyContent="flex-end" gap="4">
                <Button appearance="subtle" size="md" onClick={onRequestChanges}>Ask Changes</Button>
                <Button appearance="primary" size="md" onClick={onApprove} icon={<IconCircleCheckSolid size={14} />}>
                    Approve
                </Button>
            </Box>
        </Box>
    );
}

/** A single message bubble in the team thread */
function ThreadMessage({
    author,
    avatar,
    isAgent,
    time,
    children,
}: {
    author: string;
    avatar?: string;
    isAgent?: boolean;
    time: string;
    children: React.ReactNode;
}) {
    return (
        <Box display="flex" flexDirection="column" gap="8">
            {/* Row: avatar + name + time */}
            <Box display="flex" alignItems="center" gap="8">
                {isAgent ? (
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        rounded="sm"
                        style={{ width: 28, height: 28, background: "#e4f0da", flexShrink: 0, overflow: "hidden" }}
                    >
                        <Image src="/avatars/mock-avatar-geo.svg" alt={author} width={20} height={20} />
                    </Box>
                ) : (
                    <Avatar name={author} src={avatar} size="sm" style={{ flexShrink: 0 }} />
                )}
                <Text fontSize="sm" fontWeight="600" color="fg.default">{author}</Text>
                <Text fontSize="sm" color="fg.tertiary">{time}</Text>
            </Box>
            {/* Content */}
            <Box pl="32" display="flex" flexDirection="column" gap="10">
                {children}
            </Box>
        </Box>
    );
}

const GEO_V1_DESCRIPTION = "GEO-optimised Q&A article covering Stride Discover the Unknown — 7 core Q&A pairs targeting AI search citations.";
const GEO_V2_DESCRIPTION = "Updated v2: explicit activity callouts (trail running, climbing, diving, skydiving), adventure-first tone, competitive team challenges emphasis.";

const VAU_INITIAL_TEXT = `I've autonomously generated a Q&A article for the Stride "Discover the Unknown" campaign. The article is structured around 7 core question-and-answer pairs optimized for AI-powered search citations. I've aligned the content with Stride's adventure travel positioning and targeted long-tail queries across the outdoor activities vertical.

Please review and approve to proceed with publishing.`;

const VAU_UPDATED_TEXT = `I've incorporated your feedback:

✓ **Activities** — Explicitly listed trail running, climbing, diving, skydiving, and multi-terrain endurance challenges
✓ **Team use cases** — Rewired around competitive multi-sport group challenges, not generic team building
✓ **Opening tone** — Rewrote the first 3 Q&As in Stride's adventurous, explorer-first voice

The updated article is ready for final review.`;

function TeamThreadPanel({ artifact }: { artifact: ArtifactViewerArtifact }) {
    const [approvalState, setApprovalState] = useState<ApprovalState>("pending");
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [approvalState]);

    return (
        <Box
            display="flex"
            flexDirection="column"
            style={{ height: "100%", overflowY: "auto", background: "var(--ax-colors-bg-default)" }}
        >
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
                    style={{ width: 32, height: 32, background: "#e4f0da", flexShrink: 0, overflow: "hidden" }}
                >
                    <Image src="/avatars/mock-avatar-geo.svg" alt="GEO" width={22} height={22} />
                </Box>
                <Box display="flex" flexDirection="column" gap="2" style={{ flex: 1, minWidth: 0 }}>
                    <Text fontSize="sm" fontWeight="600">Frank</Text>
                    <Text fontSize="sm" color="fg.tertiary">Team approval thread</Text>
                </Box>
                <Badge intent="warning">In Review</Badge>
            </Box>

            {/* Thread messages */}
            <Box display="flex" flexDirection="column" gap="24" p="16">

                {/* ── Message 1: VAU initial ── */}
                <ThreadMessage author="Frank" isAgent time="Today at 9:02 AM">
                    <Text fontSize="sm" color="fg.secondary" style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>
                        {VAU_INITIAL_TEXT}
                    </Text>
                    {/* Canvas tile v1 */}
                    <IslandContentTile
                        name="Q and A: Discover the unknown"
                        type="Document"
                        description={GEO_V1_DESCRIPTION}
                    />
                    {/* First approval card — already actioned (collapsed) */}
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap="4"
                        p="16"
                        rounded="lg"
                        style={{ border: BORDER_S, background: "var(--ax-colors-bg-default)", opacity: 0.6 }}
                    >
                        <Text fontWeight="500" style={{ fontSize: 14, color: "var(--ax-colors-fg-default)", lineHeight: 1.43 }}>
                            Team approval needed for Q and A: Discover the unknown v1
                        </Text>
                        <Box display="flex" gap="12">
                            <Text style={{ fontSize: 14, color: "var(--ax-colors-fg-tertiary)", lineHeight: 1.43 }}>
                                Jamie Chen: Requested changes
                            </Text>
                            <Text style={{ fontSize: 14, color: "var(--ax-colors-fg-tertiary)", lineHeight: 1.43 }}>
                                Riley Park: Requested changes
                            </Text>
                        </Box>
                    </Box>
                </ThreadMessage>

                {/* ── Message 2: JC feedback ── */}
                <ThreadMessage author="Jamie Chen" avatar="/avatars/jc.png" time="Today at 9:18 AM">
                    <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: 1.6 }}>
                        Good start! The Q&amp;A structure is solid and the schema markup looks right. A few tweaks needed before we can approve:
                    </Text>
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap="6"
                        p="12"
                        rounded="md"
                        style={{ background: "var(--ax-colors-bg-page)", border: BORDER_T }}
                    >
                        {[
                            "The activities list is too generic — explicitly call out trail running, rock climbing, diving, skydiving, and multi-terrain endurance challenges to match Stride's positioning.",
                            "The opening tone needs to be more adventurous and explorer-first. It currently reads like a generic product FAQ.",
                        ].map((item, i) => (
                            <Box key={i} display="flex" gap="8" alignItems="start">
                                <Text fontSize="sm" color="fg.tertiary" style={{ flexShrink: 0, paddingTop: 2 }}>{i + 1}.</Text>
                                <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: 1.6 }}>{item}</Text>
                            </Box>
                        ))}
                    </Box>
                </ThreadMessage>

                {/* ── Message 3: Riley feedback ── */}
                <ThreadMessage author="Riley Park" avatar="/avatars/user2.png" time="Today at 9:24 AM">
                    <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: 1.6 }}>
                        +1 to JC&apos;s notes. Also the team-use section leans too much toward generic team building — it should emphasize competitive multi-sport group challenges, which is core to the Stride brand. Looking forward to the revision!
                    </Text>
                </ThreadMessage>

                {/* ── Message 4: VAU updated ── */}
                <ThreadMessage author="Frank" isAgent time="Today at 9:31 AM">
                    <Text fontSize="sm" color="fg.secondary" style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>
                        {VAU_UPDATED_TEXT}
                    </Text>
                    {/* Canvas tile v2 */}
                    <IslandContentTile
                        name="Q and A: Discover the unknown"
                        type="Document"
                        description={GEO_V2_DESCRIPTION}
                    />
                    {/* Final approval card — interactive */}
                    <ThreadApprovalCard
                        state={approvalState}
                        onApprove={() => setApprovalState("approved")}
                        onRequestChanges={() => setApprovalState("changes")}
                    />
                </ThreadMessage>

                {/* Approved / changes-requested confirmation */}
                {approvalState === "approved" && (
                    <Box
                        display="flex"
                        alignItems="center"
                        gap="8"
                        p="12"
                        rounded="md"
                        style={{ background: "#f0faf0", border: "1px solid var(--ax-colors-border-secondary)" }}
                    >
                        <IconCircleCheckSolid size={16} style={{ color: "var(--ax-colors-fg-accent)", flexShrink: 0 }} />
                        <Text fontSize="sm" fontWeight="500" color="fg.default">
                            You approved — submitting for publication.
                        </Text>
                    </Box>
                )}
                {approvalState === "changes" && (
                    <Box
                        display="flex"
                        alignItems="center"
                        gap="8"
                        p="12"
                        rounded="md"
                        style={{ background: "var(--ax-colors-bg-page)", border: BORDER_S }}
                    >
                        <IconPen size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
                        <Text fontSize="sm" color="fg.secondary">
                            Changes requested — VAU will revise and resubmit.
                        </Text>
                    </Box>
                )}

                <div ref={bottomRef} />
            </Box>
        </Box>
    );
}

type ArtifactSource = "chat" | "agent" | "workflow" | "thread";

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
    hasTeamThread?: boolean;
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
    const [chatOpen, setChatOpen] = useState(openMode === "with-panel");

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    const isWorkflow = artifact.sourceType === "workflow" || artifact.sourceType === "agent";
    const isThread = artifact.hasTeamThread || artifact.sourceType === "thread";

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
                    artifactCreator={artifact.createdBy}
                    initialHtml={getMockContent(artifact.type)}
                    chatOpen={chatOpen}
                    onChatToggle={() => setChatOpen(v => !v)}
                />
            </Box>

            {/* Right: context panel — toggled via chat button in toolbar */}
            {chatOpen && (
                <Box style={{ width: 400, flexShrink: 0, overflow: "hidden", borderLeft: BORDER_S }}>
                    {isThread ? (
                        <TeamThreadPanel artifact={artifact} />
                    ) : isWorkflow ? (
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

"use client";

import {
    Avatar,
    Box,
    Text,
    Button,
    Badge,
    Tooltip,
} from "@optiaxiom/react";
import {
    IconCopy,
    IconDownload,
    IconArrowsMaximize,
    IconAgent,
    IconChevronDown,
    IconChevronRight,
    IconFile,
    IconImage,
    IconCode,
    IconPresentationScreen,
    IconFileSpreadsheet,
    IconChartColumn,
    IconCheck,
    IconLightbulb,
    IconLink,
    IconFileLines,
    IconBolt,
} from "@optimizely/axiom-icons";
import { useState, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CodeCanvasPanel } from "@/app/components/Opal/CodeCanvasPanel";
import { OpalChat } from "@/app/components/Opal/OpalChat";
import { OpalInput } from "@/app/components/Opal/OpalInput";
import { OpalHeader } from "@/app/components/Opal/OpalHeader";
import type { ChatMessage } from "@/app/hooks/useOpalState";

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

const TYPE_EXT: Record<string, string> = {
    Document:     "doc",
    Image:        "png",
    Code:         "html",
    Presentation: "pptx",
    Spreadsheet:  "xlsx",
    Report:       "pdf",
};

/** Figma "Island - contents" card — used as the canvas tile in chat */
function IslandContentTile({
    name,
    type,
    description,
    onExpand,
    selected,
}: {
    name: string;
    type: string;
    description?: string;
    onExpand?: () => void;
    selected?: boolean;
}) {
    return (
        <Box
            display="flex"
            alignItems="center"
            gap="8"
            p="16"
            style={{
                border: selected
                    ? "1.5px solid var(--ax-colors-border-accent)"
                    : BORDER_T,
                borderRadius: 12,
                overflow: "hidden",
                cursor: "default",
                background: selected
                    ? "var(--ax-colors-bg-accent-subtle)"
                    : "var(--ax-colors-bg-default)",
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

// ─── Mock thread — typed as real ChatMessage so OpalChat renders them natively ──

const NOW = Date.now();
const MOCK_THREAD: ChatMessage[] = [
    { id: "m1", role: "user",      content: "Can you write a Q2 email campaign targeting enterprise customers who haven't renewed yet?", timestamp: NOW - 120_000 },
    { id: "m2", role: "assistant", content: "Sure! I'll draft a compelling renewal campaign. Let me tailor the tone and offer structure for enterprise accounts.", timestamp: NOW - 110_000 },
    { id: "m3", role: "user",      content: "Focus on the ROI angle and include a limited-time discount offer.", timestamp: NOW - 100_000 },
    { id: "m4", role: "assistant", content: "Got it — here's the artifact I generated based on your brief. I've highlighted the ROI benefits in the opening and included a 15% renewal discount valid for 14 days.", timestamp: NOW - 90_000 },
];

// ─── Agent Execution Log ─────────────────────────────────────────────────────

function ExecutionSection({ label, children }: { label: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <Box style={{ borderBottom: BORDER_S }}>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                px="16"
                py="12"
                style={{ cursor: "pointer" }}
                onClick={() => setOpen((v) => !v)}
            >
                <Text fontSize="sm" fontWeight="500">{label}</Text>
                {open ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
            </Box>
            {open && (
                <Box px="16" pb="12">
                    {children}
                </Box>
            )}
        </Box>
    );
}

function AgentExecutionLog({ artifact }: { artifact: ArtifactViewerArtifact }) {
    const [allExpanded, setAllExpanded] = useState(false);

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

            {/* Metadata table */}
            <Box display="flex" flexDirection="column" px="16" py="12">
                {[
                    { label: "Agent Name", value: `${artifact.sourceName} v1.2` },
                    { label: "Execution ID", value: "exec_4f2a9c81", copyable: true },
                    { label: "Execution Started", value: artifact.created },
                    { label: "Duration", value: "1m 24s" },
                    { label: "Executed By", value: artifact.createdBy.name, avatar: artifact.createdBy.avatar },
                    { label: "Output Quality Score", value: "95%", badge: "Passed", badgeIntent: "success" as const },
                    { label: "Guardrail Status", value: "", badge: "Passed", badgeIntent: "success" as const },
                    { label: "Credits", value: "20" },
                ].map((row) => (
                    <Box
                        key={row.label}
                        display="flex"
                        alignItems="center"
                        py="8"
                        gap="8"
                        style={{ borderBottom: BORDER_T }}
                    >
                        <Text fontSize="sm" color="fg.secondary" style={{ minWidth: 160, flexShrink: 0 }}>
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

            {/* Expand all */}
            <Box px="16" pb="8">
                <Button appearance="subtle" size="sm" onClick={() => setAllExpanded((v) => !v)}>
                    {allExpanded ? "Collapse all" : "Expand all"}
                </Button>
            </Box>

            {/* Collapsible sections */}
            <Box style={{ borderTop: BORDER_S }}>
                <ExecutionSection label="Input Variables">
                    <Text fontSize="sm" color="fg.secondary">
                        target_segment: enterprise_renewal, offer: 15_pct_discount, tone: professional
                    </Text>
                </ExecutionSection>
                <ExecutionSection label="Output">
                    <Text fontSize="sm" color="fg.secondary">Generated artifact: {artifact.name}</Text>
                </ExecutionSection>
                <ExecutionSection label="Execution Memory">
                    <Text fontSize="sm" color="fg.secondary">3 memory entries used · 2 retrieved from long-term store</Text>
                </ExecutionSection>
                <ExecutionSection label="Output Quality Score">
                    <Text fontSize="sm" color="fg.secondary">Coherence: 96 · Relevance: 94 · Tone alignment: 95</Text>
                </ExecutionSection>
                <ExecutionSection label="Guardrail Status">
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

// ─── Chat Panel — uses the real OpalChat component ───────────────────────────

function ChatPanel({ artifact }: { artifact: ArtifactViewerArtifact }) {
    const [inputValue, setInputValue] = useState("");

    const contextualCard = (
        <Box display="flex" flexDirection="column" gap="12">
            <IslandContentTile
                name={artifact.name}
                type={artifact.type}
                description={`${artifact.type} · ${artifact.created}`}
                selected
            />
            <Box display="flex" flexDirection="column" gap="6">
                <Text fontSize="xs" color="fg.secondary" fontWeight="500">Sources</Text>
                <Box display="flex" flexWrap="wrap" gap="6">
                    {["Brand guidelines", "Q1 campaign brief", "Customer data"].map((s) => (
                        <Box
                            key={s}
                            px="10"
                            py="4"
                            bg="bg.page"
                            style={{ border: BORDER_T, borderRadius: 6 }}
                        >
                            <Text fontSize="xs" color="fg.secondary">{s}</Text>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box display="flex" flexDirection="column" h="full" style={{ background: "var(--opal-bg-page, var(--ax-colors-bg-default))" }}>
            {/* Header — matches OpalChatView canvas sidebar */}
            <Box style={{ flexShrink: 0 }}>
                <OpalHeader
                    onToggleHistory={() => {}}
                    onNewChat={() => {}}
                />
            </Box>

            {/* Messages — same OpalChat used in the main canvas sidebar */}
            <Box display="flex" flexDirection="column" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            <OpalChat
                messages={MOCK_THREAD}
                onSuggestionClick={() => {}}
                hideSuggestions
                variant="assistant"
                contextualActionCard={contextualCard}
            />
            </Box>

            {/* Input — matches OpalChatView canvas sidebar exactly */}
            <Box style={{ flexShrink: 0, padding: "12px" }}>
                <OpalInput
                    variant="assistant"
                    value={inputValue}
                    onChange={setInputValue}
                    onSend={() => setInputValue("")}
                    isLoading={false}
                    disabled={false}
                />
            </Box>
        </Box>
    );
}

// ─── Custom content panels ────────────────────────────────────────────────────

function ImageViewerPanel({ src }: { src?: string }) {
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{ background: "#1a1a1a", height: "100%" }}
        >
            <img
                src={src ?? "/cmp/assets/recommendation/search-04-image.jpg"}
                alt=""
                style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }}
            />
        </Box>
    );
}

function DashboardPanel({ artifact }: { artifact: ArtifactViewerArtifact }) {
    const competitors = [
        { name: "AlphaCloud",  share: "34%", content: "45 posts", seo: 82, threat: "High",   threatIntent: "danger"  as const },
        { name: "CoreMetrics", share: "21%", content: "28 posts", seo: 71, threat: "Medium", threatIntent: "warning" as const },
        { name: "FlowStack",   share: "18%", content: "19 posts", seo: 65, threat: "Low",    threatIntent: "neutral" as const },
        { name: "Databridge",  share: "12%", content: "22 posts", seo: 60, threat: "Low",    threatIntent: "neutral" as const },
    ];

    const gaps = [
        {
            icon: <IconLightbulb size={16} />,
            title: "Pricing page clarity",
            body: "AlphaCloud leads with interactive calculator. Opportunity: add ROI estimator.",
            badge: "Gap",
            intent: "warning" as const,
        },
        {
            icon: <IconLink size={16} />,
            title: "Integration depth",
            body: "You lead with 48 native integrations vs competitor avg of 31.",
            badge: "Advantage",
            intent: "success" as const,
        },
        {
            icon: <IconFileLines size={16} />,
            title: "Case study volume",
            body: "Competitors average 24 case studies. You have 8. Priority: publish 4/month.",
            badge: "Priority",
            intent: "danger" as const,
        },
    ];

    const cols = ["Company", "Market share", "Monthly content", "SEO score", "Threat"];

    return (
        <Box style={{ overflowY: "auto", height: "100%", padding: "24px 32px", background: "var(--ax-colors-bg-secondary)" }}>
            {/* Header */}
            <Box display="flex" flexDirection="column" gap="4" mb="24">
                <Text fontSize="xl" fontWeight="700">{artifact.name}</Text>
                <Text color="fg.secondary" fontSize="sm">Competitor analysis · 5 companies · as of Mar 25, 2026</Text>
            </Box>

            {/* KPI cards */}
            <Box style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
                {[
                    { value: "5",        label: "Competitors tracked",        color: undefined },
                    { value: "−12%",     label: "Market share gap vs leader", color: "var(--ax-colors-fg-danger)" },
                    { value: "3.2×",     label: "Content velocity vs avg",    color: "var(--ax-colors-fg-success)" },
                    { value: "78 / 100", label: "Opportunity score",          color: undefined },
                ].map((kpi) => (
                    <Box
                        key={kpi.label}
                        bg="bg.default"
                        border="1"
                        borderColor="border.secondary"
                        rounded="xl"
                        p="16"
                        display="flex"
                        flexDirection="column"
                        gap="4"
                    >
                        <Text fontSize="2xl" fontWeight="700" style={{ color: kpi.color ?? "var(--ax-colors-fg-default)" }}>
                            {kpi.value}
                        </Text>
                        <Text fontSize="xs" color="fg.secondary">{kpi.label}</Text>
                    </Box>
                ))}
            </Box>

            {/* Competitor table */}
            <Text fontSize="sm" fontWeight="600" mt="24" mb="12" style={{ display: "block" }}>Competitive positioning</Text>
            <Box bg="bg.default" border="1" borderColor="border.secondary" rounded="xl" overflow="hidden">
                {/* Header row */}
                <Box
                    display="flex"
                    bg="bg.secondary"
                    style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)" }}
                >
                    {cols.map((h) => (
                        <Box key={h} style={{ flex: h === "Company" ? 2 : 1, padding: "10px 16px" }}>
                            <Text fontSize="xs" fontWeight="600" color="fg.secondary">{h}</Text>
                        </Box>
                    ))}
                </Box>
                {/* Your brand */}
                <Box
                    display="flex"
                    alignItems="center"
                    bg="bg.accent.subtle"
                    style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}
                >
                    <Box style={{ flex: 2, padding: "10px 16px" }}>
                        <Text fontSize="sm" fontWeight="600" color="fg.accent">Your brand</Text>
                    </Box>
                    {["15%", "38 posts", "78"].map((v) => (
                        <Box key={v} style={{ flex: 1, padding: "10px 16px" }}>
                            <Text fontSize="sm">{v}</Text>
                        </Box>
                    ))}
                    <Box style={{ flex: 1, padding: "10px 16px" }}>
                        <Text fontSize="sm" color="fg.tertiary">—</Text>
                    </Box>
                </Box>
                {/* Competitor rows */}
                {competitors.map((c, i) => (
                    <Box
                        key={c.name}
                        display="flex"
                        alignItems="center"
                        style={{ borderBottom: i < competitors.length - 1 ? "1px solid var(--ax-colors-border-tertiary)" : undefined }}
                    >
                        <Box style={{ flex: 2, padding: "10px 16px" }}>
                            <Text fontSize="sm">{c.name}</Text>
                        </Box>
                        {[c.share, c.content, String(c.seo)].map((v) => (
                            <Box key={v} style={{ flex: 1, padding: "10px 16px" }}>
                                <Text fontSize="sm">{v}</Text>
                            </Box>
                        ))}
                        <Box style={{ flex: 1, padding: "10px 16px" }}>
                            <Badge intent={c.threatIntent}>{c.threat}</Badge>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Feature & content gaps */}
            <Text fontSize="sm" fontWeight="600" mt="24" mb="12" style={{ display: "block" }}>Feature &amp; content gaps</Text>
            <Box style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
                {gaps.map((g) => (
                    <Box
                        key={g.title}
                        bg="bg.default"
                        border="1"
                        borderColor="border.secondary"
                        rounded="xl"
                        p="16"
                        display="flex"
                        flexDirection="column"
                        gap="8"
                    >
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            rounded="md"
                            style={{
                                width: 32,
                                height: 32,
                                background: THUMB_GRADIENT,
                                color: "#080736",
                                lineHeight: 0,
                            }}
                        >
                            {g.icon}
                        </Box>
                        <Box display="flex" flexDirection="column" gap="4">
                            <Text fontSize="sm" fontWeight="600">{g.title}</Text>
                            <Text fontSize="xs" color="fg.secondary">{g.body}</Text>
                        </Box>
                        <Badge intent={g.intent} style={{ alignSelf: "flex-start" }}>{g.badge}</Badge>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

function PresentationPanel() {
    const slideStyle: React.CSSProperties = {
        maxWidth: 640,
        margin: "0 auto",
        background: "var(--ax-colors-bg-default)",
        borderRadius: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        aspectRatio: "16/9",
        overflow: "hidden",
        position: "relative",
        width: "100%",
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            style={{ overflow: "auto", height: "100%", background: "var(--ax-colors-bg-secondary)", paddingTop: 32, paddingBottom: 32, gap: 16 }}
        >
            {/* Slide 1 — Title */}
            <Box style={slideStyle}>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="column"
                    style={{
                        height: "100%",
                        gap: 12,
                        background: "linear-gradient(135deg,#6d28d9 0%,#4338ca 100%)",
                        padding: 32,
                    }}
                >
                    <Text fontSize="xl" fontWeight="700" style={{ color: "white", textAlign: "center" }}>Q1 Sales Review</Text>
                    <Text fontSize="sm" style={{ color: "white", textAlign: "center", opacity: 0.85 }}>Exec Readout · Pipeline &amp; ARR Highlights · Q1 2026</Text>
                    <Box style={{ width: 40, height: 2, background: "rgba(255,255,255,0.3)" }} />
                    <Text fontSize="xs" style={{ color: "white", opacity: 0.7 }}>Stride · Confidential</Text>
                </Box>
            </Box>

            {/* Slide 2 — ARR */}
            <Box style={slideStyle}>
                <Box style={{ padding: 32, height: "100%", overflowY: "hidden" }}>
                    <Text fontSize="lg" fontWeight="700" mb="16" style={{ display: "block" }}>ARR Performance</Text>
                    <Box style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
                        {[
                            { value: "$4.2M", label: "ARR", sub: "vs $3.8M target", delta: "+10.5%", positive: true },
                            { value: "$1.1M", label: "New ARR", sub: "Q1 target $0.9M", delta: "+22%", positive: true },
                            { value: "$0.3M", label: "Churn", sub: "vs $0.4M budget", delta: "−25%", positive: true },
                        ].map((m) => (
                            <Box key={m.label} bg="bg.secondary" rounded="lg" p="16">
                                <Text fontSize="xl" fontWeight="700" style={{ display: "block" }}>{m.value}</Text>
                                <Text fontSize="xs" color="fg.secondary" style={{ display: "block" }}>{m.label}</Text>
                                <Text fontSize="xs" color="fg.secondary" style={{ display: "block" }}>{m.sub}</Text>
                                <Text fontSize="xs" style={{ color: "var(--ax-colors-fg-success)", display: "block", marginTop: 4 }}>{m.delta}</Text>
                            </Box>
                        ))}
                    </Box>
                    <Text fontSize="xs" fontWeight="600" color="fg.secondary" mb="8" style={{ display: "block" }}>Top performing segments</Text>
                    {[
                        { name: "Enterprise", pct: 58 },
                        { name: "Mid-market", pct: 30 },
                        { name: "SMB",        pct: 12 },
                    ].map((s) => (
                        <Box key={s.name} display="flex" alignItems="center" gap="8" mb="4">
                            <Text fontSize="xs" style={{ minWidth: 80 }}>{s.name}</Text>
                            <Box style={{ flex: 1, height: 6, background: "var(--ax-colors-bg-secondary)", borderRadius: 3, overflow: "hidden" }}>
                                <Box style={{ width: `${s.pct}%`, height: "100%", background: "var(--ax-colors-fg-accent)", borderRadius: 3 }} />
                            </Box>
                            <Text fontSize="xs" color="fg.secondary" style={{ minWidth: 28, textAlign: "right" }}>{s.pct}%</Text>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Slide 3 — Pipeline */}
            <Box style={slideStyle}>
                <Box style={{ padding: 32, height: "100%", overflowY: "hidden" }}>
                    <Text fontSize="lg" fontWeight="700" mb="16" style={{ display: "block" }}>Pipeline Snapshot</Text>
                    <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        <Box display="flex" flexDirection="column" gap="8">
                            {[
                                { stage: "Prospecting",  count: 142, pct: 100 },
                                { stage: "Qualification", count: 87,  pct: 61 },
                                { stage: "Proposal",     count: 44,  pct: 31 },
                                { stage: "Negotiation",  count: 18,  pct: 13 },
                            ].map((s) => (
                                <Box key={s.stage}>
                                    <Box display="flex" justifyContent="space-between" mb="4">
                                        <Text fontSize="xs">{s.stage}</Text>
                                        <Text fontSize="xs" color="fg.secondary">{s.count}</Text>
                                    </Box>
                                    <Box style={{ height: 6, background: "var(--ax-colors-bg-secondary)", borderRadius: 3, overflow: "hidden" }}>
                                        <Box style={{ width: `${s.pct}%`, height: "100%", background: "var(--ax-colors-fg-accent)", borderRadius: 3 }} />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                        <Box display="flex" flexDirection="column" gap="16">
                            <Box>
                                <Text fontSize="2xl" fontWeight="700" color="fg.accent" style={{ display: "block" }}>24%</Text>
                                <Text fontSize="xs" color="fg.secondary">Win rate</Text>
                            </Box>
                            <Box>
                                <Text fontSize="2xl" fontWeight="700" style={{ display: "block" }}>3.1×</Text>
                                <Text fontSize="xs" color="fg.secondary">Pipeline coverage</Text>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

type ContentType = "Blog" | "Social" | "Email";
type CalItem = { id: string; title: string; type: ContentType };
type CalRow  = { week: string; days: CalItem[][] };

const TYPE_CYCLE: ContentType[] = ["Blog", "Social", "Email"];
const TYPE_STYLES: Record<ContentType, { bg: string; color: string; dot: string }> = {
    Blog:   { bg: "var(--ax-colors-bg-accent-subtle)",  color: "var(--ax-colors-fg-accent)",    dot: "var(--ax-colors-fg-accent)" },
    Social: { bg: "rgba(16,185,129,0.12)",              color: "#059669",                        dot: "#059669" },
    Email:  { bg: "var(--ax-colors-bg-secondary)",      color: "var(--ax-colors-fg-secondary)",  dot: "var(--ax-colors-fg-tertiary)" },
};

const INITIAL_ROWS: CalRow[] = [
    { week: "Apr 7–11",  days: [
        [{ id:"a1", title:"Product launch post",     type:"Blog"   }],
        [{ id:"a2", title:"Renewal email",            type:"Email"  }],
        [{ id:"a3", title:"LinkedIn carousel",        type:"Social" }],
        [],
        [],
    ]},
    { week: "Apr 14–18", days: [
        [{ id:"b1", title:"Feature spotlight",        type:"Blog"   }],
        [],
        [],
        [{ id:"b2", title:"Twitter thread",           type:"Social" }],
        [{ id:"b3", title:"Nurture email #3",         type:"Email"  }],
    ]},
    { week: "Apr 21–25", days: [
        [{ id:"c1", title:"Case study: AlphaCloud",   type:"Blog"   }],
        [{ id:"c2", title:"Newsletter #12",           type:"Email"  }],
        [],
        [{ id:"c3", title:"Instagram reel",           type:"Social" }],
        [],
    ]},
    { week: "Apr 28–30+", days: [
        [{ id:"d1", title:"Q2 preview post",          type:"Blog"   }],
        [{ id:"d2", title:"Re-engagement email",      type:"Email"  }],
        [],
        [],
        [],
    ]},
];

let _uid = 100;
function uid() { return `item-${++_uid}`; }

function SpreadsheetPanel() {
    const [rows, setRows] = useState<CalRow[]>(INITIAL_ROWS);
    const [editing, setEditing] = useState<{ ri: number; di: number; ii: number } | null>(null);
    const [hovered, setHovered] = useState<{ ri: number; di: number } | null>(null);

    function updateTitle(ri: number, di: number, ii: number, val: string) {
        setRows(prev => prev.map((r, ri2) => ri2 !== ri ? r : {
            ...r, days: r.days.map((day, di2) => di2 !== di ? day : day.map((item, ii2) =>
                ii2 !== ii ? item : { ...item, title: val }
            ))
        }));
    }

    function cycleType(ri: number, di: number, ii: number) {
        setRows(prev => prev.map((r, ri2) => ri2 !== ri ? r : {
            ...r, days: r.days.map((day, di2) => di2 !== di ? day : day.map((item, ii2) => {
                if (ii2 !== ii) return item;
                const next = TYPE_CYCLE[(TYPE_CYCLE.indexOf(item.type) + 1) % TYPE_CYCLE.length];
                return { ...item, type: next };
            }))
        }));
    }

    function addItem(ri: number, di: number) {
        const id = uid();
        setRows(prev => prev.map((r, ri2) => ri2 !== ri ? r : {
            ...r, days: r.days.map((day, di2) => di2 !== di ? day : [...day, { id, title: "New item", type: "Blog" as ContentType }])
        }));
        // immediately open for editing
        setEditing({ ri, di, ii: rows[ri].days[di].length });
    }

    function deleteItem(ri: number, di: number, ii: number) {
        setRows(prev => prev.map((r, ri2) => ri2 !== ri ? r : {
            ...r, days: r.days.map((day, di2) => di2 !== di ? day : day.filter((_, ii2) => ii2 !== ii))
        }));
    }

    const headerCellStyle: React.CSSProperties = { padding: "10px 16px", textAlign: "left", whiteSpace: "nowrap", userSelect: "none" };
    const cellStyle: React.CSSProperties = { padding: "8px 12px", verticalAlign: "top", position: "relative", minWidth: 130, minHeight: 56 };

    return (
        <Box style={{ overflow: "auto", height: "100%", background: "var(--ax-colors-bg-secondary)", padding: 0, display: "flex", flexDirection: "column" }}>
            {/* Header bar */}
            <Box
                bg="bg.default"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)", padding: "12px 20px", flexShrink: 0 }}
            >
                <Text fontSize="md" fontWeight="600">Content Calendar — April 2026</Text>
                <Text fontSize="sm" color="fg.tertiary">
                    {rows.reduce((s, r) => s + r.days.reduce((ss, d) => ss + d.length, 0), 0)} items · 4 channels
                </Text>
            </Box>

            {/* Table */}
            <Box style={{ overflowX: "auto", flex: 1 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                    <colgroup>
                        <col style={{ width: 90 }} />
                        <col /><col /><col /><col /><col />
                    </colgroup>
                    <thead>
                        <tr style={{ background: "var(--ax-colors-bg-secondary)", position: "sticky", top: 0, zIndex: 1 }}>
                            {["Week", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((h) => (
                                <th key={h} style={headerCellStyle}>
                                    <Text fontSize="sm" fontWeight="600" color="fg.secondary">{h}</Text>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, ri) => (
                            <tr key={row.week} style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)", background: "var(--ax-colors-bg-default)" }}>
                                <td style={{ ...cellStyle, minWidth: 90 }}>
                                    <Text fontSize="sm" fontWeight="600" color="fg.secondary">{row.week}</Text>
                                </td>
                                {row.days.map((items, di) => {
                                    const isHov = hovered?.ri === ri && hovered?.di === di;
                                    return (
                                        <td
                                            key={di}
                                            style={cellStyle}
                                            onMouseEnter={() => setHovered({ ri, di })}
                                            onMouseLeave={() => setHovered(null)}
                                        >
                                            {items.map((item, ii) => {
                                                const s = TYPE_STYLES[item.type];
                                                const isEd = editing?.ri === ri && editing?.di === di && editing?.ii === ii;
                                                return (
                                                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                                                        {/* Type dot — click to cycle */}
                                                        <span
                                                            title={`Type: ${item.type} (click to change)`}
                                                            onClick={(e) => { e.stopPropagation(); cycleType(ri, di, ii); }}
                                                            style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0, cursor: "pointer", marginTop: 1 }}
                                                        />
                                                        {/* Pill / inline input */}
                                                        {isEd ? (
                                                            <input
                                                                autoFocus
                                                                defaultValue={item.title}
                                                                onBlur={(e) => { updateTitle(ri, di, ii, e.target.value || item.title); setEditing(null); }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                                                    if (e.key === "Escape") setEditing(null);
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                                style={{
                                                                    flex: 1, fontSize: 13, border: "1px solid var(--ax-colors-border-accent)",
                                                                    borderRadius: 5, padding: "2px 7px", outline: "none",
                                                                    background: s.bg, color: s.color, fontFamily: "inherit",
                                                                    minWidth: 0,
                                                                }}
                                                            />
                                                        ) : (
                                                            <span
                                                                onClick={() => setEditing({ ri, di, ii })}
                                                                style={{
                                                                    flex: 1, fontSize: 13, borderRadius: 5, padding: "3px 7px",
                                                                    background: s.bg, color: s.color, cursor: "text",
                                                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                                                    border: "1px solid transparent",
                                                                }}
                                                            >
                                                                {item.title}
                                                            </span>
                                                        )}
                                                        {/* Delete × */}
                                                        {isHov && !isEd && (
                                                            <span
                                                                onClick={(e) => { e.stopPropagation(); deleteItem(ri, di, ii); }}
                                                                title="Remove"
                                                                style={{ fontSize: 10, color: "var(--ax-colors-fg-tertiary)", cursor: "pointer", lineHeight: 1, flexShrink: 0, padding: "0 2px" }}
                                                            >×</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {/* Add + button — shown on hover */}
                                            {isHov && (
                                                <div
                                                    onClick={() => addItem(ri, di)}
                                                    title="Add item"
                                                    style={{
                                                        display: "inline-flex", alignItems: "center", gap: 3,
                                                        fontSize: 10, color: "var(--ax-colors-fg-tertiary)",
                                                        cursor: "pointer", marginTop: 2, padding: "2px 4px",
                                                        borderRadius: 4, userSelect: "none",
                                                    }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = "var(--ax-colors-bg-secondary)")}
                                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                                >
                                                    <span style={{ fontSize: 13, lineHeight: 1 }}>+</span> Add
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
        </Box>
    );
}

function getArtifactContentNode(artifact: ArtifactViewerArtifact): ReactNode | undefined {
    if (artifact.type === "Image")        return <ImageViewerPanel src={artifact.imageUrl} />;
    if (artifact.type === "Report")       return <DashboardPanel artifact={artifact} />;
    if (artifact.type === "Presentation") return <PresentationPanel />;
    if (artifact.type === "Spreadsheet")  return <SpreadsheetPanel />;
    return undefined; // Document, Code → use default WYSIWYG/CodeMirror
}

// ─── Canvas Panel is CodeCanvasPanel ─────────────────────────────────────────
// (see app/components/Opal/CodeCanvasPanel.tsx — same TipTap editor experience)

// ─── Main ArtifactViewer ──────────────────────────────────────────────────────

type ArtifactViewerProps = {
    artifact: ArtifactViewerArtifact;
    onClose: () => void;
};

export function ArtifactViewer({ artifact, onClose }: ArtifactViewerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    const isWorkflow = artifact.sourceType === "workflow" || artifact.sourceType === "agent";

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
            {/* No top header — title/status/version live in the CodeCanvasPanel toolbar */}

            {/* Split panels */}
            <Box display="flex" style={{ flex: 1, overflow: "hidden" }}>
                {/* Left: real CodeCanvasPanel — title + status shown in its toolbar */}
                <Box style={{ flex: "1 1 0", overflow: "hidden" }}>
                    <CodeCanvasPanel
                        onClose={onClose}
                        filename={`${artifact.name.toLowerCase().replace(/\s+/g, "-")}.${artifact.type === "Code" ? "html" : "doc"}`}
                        artifactTitle={artifact.name}
                        artifactStatus={artifact.status}
                        artifactVersion={artifact.version}
                        contentNode={getArtifactContentNode(artifact)}
                    />
                </Box>

                {/* Right: Context panel */}
                <Box style={{ width: 400, flexShrink: 0, overflow: "hidden" }}>
                    {isWorkflow ? (
                        <AgentExecutionLog artifact={artifact} />
                    ) : (
                        <ChatPanel artifact={artifact} />
                    )}
                </Box>
            </Box>
        </Box>
    );

    return createPortal(panel, document.body);
}

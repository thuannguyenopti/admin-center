"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { Box, Text, Button, Textarea } from "@optiaxiom/react";
import {
    IconSparkles,
    IconArrowRight,
    IconChevronLeft,
    IconPen,
    IconChevronDown,
    IconChevronUp,
    IconScrewdriverWrench,
} from "@optimizely/axiom-icons";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = "entry" | "designing" | "preview" | "building";

// ─── Template Agents (from opal-v3) ──────────────────────────────────────────

const TEMPLATE_AGENTS = [
    { emoji: "✍️", name: "Write an email campaign", desc: "Draft multi-step email sequences from a single brief, personalised per audience segment.", tags: ["Content strategy", "Copywriting"] },
    { emoji: "🌐", name: "Optimize my GEO", desc: "Audit your GEO footprint against competitors and generate localised messaging recommendations.", tags: ["SEO/GEO", "Analytics"] },
    { emoji: "📊", name: "Analyze my competitors", desc: "Map competitor messaging at scale and surface content gaps into an actionable brief.", tags: ["Competitive analysis", "Research"] },
    { emoji: "🧪", name: "Set up an A/B experiment", desc: "Define hypothesis, write variants, and configure your test without clunky back-and-forth.", tags: ["Testing", "Experimentation"] },
    { emoji: "🗓️", name: "Build a content calendar", desc: "Plan and schedule content across channels with smart timing recommendations.", tags: ["Content strategy", "Planning"] },
    { emoji: "⚡", name: "Generate ad variations", desc: "Create multiple ad copy variations from a single brief, scored by predicted performance.", tags: ["Paid media", "Testing"] },
    { emoji: "🔍", name: "Audit my SEO performance", desc: "Crawl your site for technical SEO issues and benchmark keyword rankings against competitors.", tags: ["Technical SEO", "Keywords"] },
    { emoji: "📱", name: "Create social media strategy", desc: "Build a channel-by-channel strategy with tone, cadence, and a 30-day content starter pack.", tags: ["Strategy", "Social media"] },
    { emoji: "🚀", name: "Launch a campaign from brief", desc: "Turn a creative brief into a fully configured campaign with copy, targeting, and scheduling.", tags: ["Automation", "Campaigns"] },
    { emoji: "🎯", name: "Personalize audience segments", desc: "Cluster your audience into high-value segments and generate tailored messaging for each.", tags: ["Personalization", "Segmentation"] },
];

// ─── Mock Preview Data ────────────────────────────────────────────────────────

const MOCK = {
    name: "Content Performance Audit Agent",
    desc: "Analyzes your published content and surfaces actionable optimization opportunities based on engagement signals and traffic data.",
    phases: [
        {
            title: "Content Inventory & Discovery",
            summary: "Scans your content library to catalog all published assets and their metadata.",
            detail: "Fetch all published pages using the CMS API. Extract metadata: titles, publish dates, tags, word count, and existing performance data.",
        },
        {
            title: "Performance Data Aggregation",
            summary: "Pulls engagement signals and traffic data for each content piece.",
            detail: "Query the analytics API for page views, time-on-page, bounce rate, and conversion events per URL. Normalize across sources into a unified performance snapshot.",
        },
        {
            title: "Gap & Opportunity Analysis",
            summary: "Cross-references performance data with goals to identify underperformers and quick wins.",
            detail: "Compare metrics against your benchmarks. Flag content below threshold. Surface topics with high search intent but low content coverage.",
        },
        {
            title: "Report & Recommendations",
            summary: "Compiles findings into a structured report with prioritized action items.",
            detail: "Generate a ranked list of optimization recommendations with effort and impact scores. Format output as a Canvas report for team review.",
        },
    ],
    tools: [
        { name: "cms_content_fetch", desc: "Retrieves all published pages and content assets from your CMS, including metadata like titles, dates, tags, and word count." },
        { name: "query_analytics_api", desc: "Queries your analytics platform for per-URL engagement data — page views, time-on-page, bounce rate, and conversion events." },
        { name: "web_search", desc: "Searches the web to surface competitor content and high-intent keywords missing from your current coverage." },
        { name: "create_canvas", desc: "Compiles audit findings and prioritized recommendations into a structured, shareable Canvas report for team review." },
    ],
    params: [
        { name: "content_scope", type: "string", required: true, desc: "The section, tag, or content type to audit.", example: "e.g. 'blog', 'product pages', 'help center'" },
        { name: "date_range", type: "string", required: true, desc: "Time window for performance data.", example: "e.g. 'last 90 days', '2025-01-01 to 2025-03-31'" },
        { name: "benchmark_threshold", type: "string", required: false, desc: "Minimum acceptable engagement score. Defaults to the team average if not set.", example: "e.g. '0.4', 'team_avg'" },
    ],
    edgeCases: [
        "If analytics API returns no data for a URL, mark as untracked and note it in the report.",
        "If CMS returns more than 500 pages, paginate and process in batches of 50.",
        "If benchmark_threshold is not set, calculate it dynamically from the median.",
        "If a content piece has no title or metadata, skip and log a warning in the report.",
    ],
};

const DESIGNING_MSGS = ["Reading your requirements...", "Mapping workflow phases...", "Selecting tools..."];
const BUILDING_MSGS = ["Fine-tuning instructions...", "Configuring parameters...", "Finalizing your agent..."];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ThreeDots() {
    return (
        <Box display="flex" gap="8" alignItems="center" justifyContent="center" mt="20">
            <style>{`
                @keyframes dotPulse {
                    0%, 100% { opacity: 0.25; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1); }
                }
            `}</style>
            {[0, 1, 2].map((i) => (
                <Box
                    key={i}
                    rounded="full"
                    style={{
                        width: 8,
                        height: 8,
                        background: "var(--ax-colors-fg-tertiary)",
                        animation: `dotPulse 1.4s ease-in-out ${i * 0.22}s infinite`,
                    }}
                />
            ))}
        </Box>
    );
}

function SectionToggle({
    label,
    count,
    open,
    onToggle,
    children,
}: {
    label: string;
    count: number;
    open: boolean;
    onToggle: () => void;
    children: ReactNode;
}) {
    return (
        <Box borderT="1" borderColor="border.tertiary" pt="16" mt="4">
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                cursor="pointer"
                pb={open ? "12" : "0"}
                onClick={onToggle}
            >
                <Text
                    fontSize="xs"
                    fontWeight="500"
                    color="fg.secondary"
                    style={{ letterSpacing: "0.07em", textTransform: "uppercase" }}
                >
                    {label} ({count})
                </Text>
                <Box color="fg.tertiary">
                    {open ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />}
                </Box>
            </Box>
            {open && children}
        </Box>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewAgentDialog({ open, onOpenChange }: Props) {
    const router = useRouter();
    const [step, setStep] = useState<Step>("entry");
    const [prompt, setPrompt] = useState("");
    const [msgIdx, setMsgIdx] = useState(0);
    const [editingPrompt, setEditingPrompt] = useState(false);
    const [editText, setEditText] = useState("");
    const [toolsOpen, setToolsOpen] = useState(false);
    const [paramsOpen, setParamsOpen] = useState(false);
    const [edgesOpen, setEdgesOpen] = useState(false);
    const [showAllTemplates, setShowAllTemplates] = useState(false);

    const msgs = step === "building" ? BUILDING_MSGS : DESIGNING_MSGS;

    // Cycle loading messages
    useEffect(() => {
        if (step !== "designing" && step !== "building") return;
        setMsgIdx(0);
        const iv = setInterval(() => setMsgIdx((i) => i + 1), 1500);
        return () => clearInterval(iv);
    }, [step]);

    // designing → preview after delay
    useEffect(() => {
        if (step !== "designing") return;
        const t = setTimeout(() => setStep("preview"), 3400);
        return () => clearTimeout(t);
    }, [step]);

    // building → navigate to setup
    useEffect(() => {
        if (step !== "building") return;
        const timer = setTimeout(() => {
            // Compose a prompt template from the MOCK phases and params
            const promptLines = [
                `You are a ${MOCK.name}. ${MOCK.desc}`,
                "",
                "{Instruction}",
                "Follow these workflow phases:",
                "",
                ...MOCK.phases.map((phase, i) => `${i + 1}. ${phase.title}\n   ${phase.detail}`),
                "",
                "Parameters:",
                ...MOCK.params.map((p) =>
                    `- [[${p.name}]]${!p.required ? " (optional)" : ""}: ${p.desc}`
                ),
                "",
                `Use the following tools: ${MOCK.tools.map((tool) => `\`${tool.name}\``).join(", ")}.`,
            ];

            const draft = {
                agentName: MOCK.name,
                description: MOCK.desc,
                promptTemplate: promptLines.join("\n"),
                tools: MOCK.tools.map((tool) => tool.name).join(", "),
                variables: MOCK.params.map((p) => ({
                    name: p.name,
                    description: p.desc,
                    type: "String",
                    required: p.required,
                })),
            };

            try {
                sessionStorage.setItem("ai_agent_draft", JSON.stringify(draft));
            } catch {
                // ignore storage errors
            }

            onOpenChange(false);
            setTimeout(() => setStep("entry"), 400);
            router.push("/opal/agents/setup?mode=create&from=ai");
        }, 2800);
        return () => clearTimeout(timer);
    }, [step, onOpenChange, router]);

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => {
            setStep("entry");
            setPrompt("");
            setEditingPrompt(false);
            setShowAllTemplates(false);
        }, 300);
    };

    if (!open) return null;

    const content = (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {/* Backdrop */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(2px)",
                }}
                onClick={handleClose}
            />
            {/* Modal panel */}
            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    maxWidth: 860,
                    width: "92vw",
                    maxHeight: "88vh",
                    background: "var(--ax-colors-bg-default)",
                    borderRadius: 12,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
                }}
            >
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>

                {/* Close button — always visible */}
                <button
                    onClick={handleClose}
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        zIndex: 10,
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(0,0,0,0.08)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        lineHeight: 1,
                        color: "#374151",
                    }}
                    aria-label="Close"
                >
                    ×
                </button>

                {/* ── ENTRY ─────────────────────────────────────────────── */}
                {step === "entry" && (
                    <Box display="flex" flexDirection="column" style={{ height: "100%" }}>
                        {/* Gradient hero — fixed */}
                        <Box
                            px="40"
                            pt="32"
                            style={{
                                background: "linear-gradient(140deg, #dbeafe 0%, #ede9fe 50%, #fce7f3 100%)",
                                flexShrink: 0,
                                paddingBottom: 40,
                            }}
                        >
                            <Text
                                fontWeight="700"
                                style={{
                                    fontSize: 32,
                                    lineHeight: 1.2,
                                    background: "linear-gradient(90deg, #111827 40%, #0069ff 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                    display: "block",
                                }}
                            >
                                Describe the work.
                            </Text>
                            <Text
                                fontWeight="700"
                                style={{
                                    fontSize: 32,
                                    lineHeight: 1.2,
                                    background: "linear-gradient(90deg, #0069ff 0%, #7c3aed 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                    display: "block",
                                    marginBottom: 10,
                                }}
                            >
                                Opal builds the agent.
                            </Text>
                            <Text color="fg.secondary" fontSize="sm">
                                Build agents that save you hours every week. Just describe what you need.
                            </Text>
                        </Box>

                        {/* Scrollable body */}
                        <Box style={{ flex: 1, overflowY: "auto" }}>
                            {/* Floating textarea card */}
                            <Box px="40" py="24">
                                <Box
                                    bg="bg.default"
                                    rounded="lg"
                                    p="20"
                                    style={{
                                        boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
                                        border: "1px solid var(--ax-colors-border-tertiary)",
                                    }}
                                >
                                    <Textarea
                                        placeholder="I need an agent to..."
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        style={{
                                            minHeight: 100,
                                            resize: "vertical",
                                            border: "none",
                                            outline: "none",
                                            boxShadow: "none",
                                            fontSize: 15,
                                            lineHeight: 1.65,
                                            padding: 0,
                                        }}
                                    />
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        mt="12"
                                        pt="12"
                                        borderT="1"
                                        borderColor="border.tertiary"
                                    >
                                        <Button
                                            appearance="subtle"
                                            size="sm"
                                            icon={<IconScrewdriverWrench size={13} />}
                                            onClick={() => {
                                                handleClose();
                                                router.push("/opal/agents/setup");
                                            }}
                                        >
                                            Build from scratch
                                        </Button>
                                        <Button
                                            appearance="primary"
                                            iconPosition="end"
                                            icon={<IconArrowRight size={13} />}
                                            onClick={() => setStep("designing")}
                                        >
                                            Generate Agent
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>

                            {/* ── Templates section ─────────────────────── */}
                            <Box px="40" pb="32">
                                {/* Divider label */}
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    gap="12"
                                    style={{ marginBottom: 20 }}
                                >
                                    <Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-tertiary)" }} />
                                    <Text
                                        fontSize="xs"
                                        fontWeight="500"
                                        color="fg.tertiary"
                                        style={{ letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}
                                    >
                                        Or start from a template
                                    </Text>
                                    <Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-tertiary)" }} />
                                </Box>

                                {/* Agent cards grid */}
                                <Box
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(3, 1fr)",
                                        gap: 12,
                                    }}
                                >
                                    {(showAllTemplates ? TEMPLATE_AGENTS : TEMPLATE_AGENTS.slice(0, 3)).map((agent) => (
                                        <Box
                                            key={agent.name}
                                            display="flex"
                                            flexDirection="column"
                                            rounded="lg"
                                            p="16"
                                            style={{
                                                border: "1px solid var(--ax-colors-border-tertiary)",
                                                background: "var(--ax-colors-bg-default)",
                                                transition: "box-shadow 0.15s ease, border-color 0.15s ease",
                                            }}
                                            onMouseEnter={(e) => {
                                                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                                                (e.currentTarget as HTMLElement).style.borderColor = "var(--ax-colors-border-default)";
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLElement).style.boxShadow = "";
                                                (e.currentTarget as HTMLElement).style.borderColor = "var(--ax-colors-border-tertiary)";
                                            }}
                                        >
                                            {/* Emoji + name */}
                                            <Box display="flex" alignItems="center" gap="10" mb="8">
                                                <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{agent.emoji}</span>
                                                <Text fontWeight="600" fontSize="sm" style={{ lineHeight: 1.3 }}>
                                                    {agent.name}
                                                </Text>
                                            </Box>

                                            {/* Description */}
                                            <Text
                                                fontSize="xs"
                                                color="fg.secondary"
                                                style={{ lineHeight: 1.55, flex: 1 }}
                                            >
                                                {agent.desc}
                                            </Text>

                                            {/* Tags */}
                                            <Box display="flex" gap="4" mt="10" mb="12" style={{ flexWrap: "wrap" }}>
                                                {agent.tags.map((tag) => (
                                                    <Box
                                                        key={tag}
                                                        px="6"
                                                        py="2"
                                                        rounded="full"
                                                        style={{
                                                            background: "var(--ax-colors-bg-secondary)",
                                                            fontSize: 10,
                                                            color: "var(--ax-colors-fg-tertiary)",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {tag}
                                                    </Box>
                                                ))}
                                            </Box>

                                            {/* CTAs */}
                                            <Box display="flex" gap="8" alignItems="center">
                                                <Button
                                                    appearance="subtle"
                                                    size="sm"
                                                    style={{
                                                        flex: 1,
                                                        border: "1px solid var(--ax-colors-border-default)",
                                                        justifyContent: "center",
                                                    }}
                                                    onClick={() => {
                                                        handleClose();
                                                        router.push("/opal/opal-v3");
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    appearance="primary"
                                                    size="sm"
                                                    style={{ flex: 1, justifyContent: "center" }}
                                                    onClick={() => {
                                                        try {
                                                            const draft = {
                                                                agentName: agent.name,
                                                                description: agent.desc,
                                                                promptTemplate: "",
                                                                tools: "",
                                                                variables: [],
                                                            };
                                                            sessionStorage.setItem("ai_agent_draft", JSON.stringify(draft));
                                                        } catch { /* ignore */ }
                                                        onOpenChange(false);
                                                        setTimeout(() => setStep("entry"), 400);
                                                        router.push("/opal/agents/setup?mode=create&from=template");
                                                    }}
                                                >
                                                    Select
                                                </Button>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Show more / Show less */}
                                <Box display="flex" justifyContent="center" mt="16">
                                    <Button
                                        appearance="subtle"
                                        size="sm"
                                        iconPosition="end"
                                        icon={showAllTemplates ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />}
                                        onClick={() => setShowAllTemplates((v) => !v)}
                                    >
                                        {showAllTemplates ? "Show less" : `Show more (${TEMPLATE_AGENTS.length - 3} more)`}
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* ── LOADING (designing / building) ─────────────────────── */}
                {(step === "designing" || step === "building") && (
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        p="40"
                        style={{ flex: 1 }}
                    >
                        <Box
                            bg="bg.default"
                            rounded="xl"
                            p="48"
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            style={{
                                width: "100%",
                                maxWidth: 460,
                                boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                                border: "1px solid var(--ax-colors-border-tertiary)",
                            }}
                        >
                            {step === "building" ? (
                                <span style={{ fontSize: 42, lineHeight: 1 }}>🎯</span>
                            ) : (
                                <Box
                                    rounded="full"
                                    style={{
                                        width: 40,
                                        height: 40,
                                        border: "3px solid var(--ax-colors-border-default)",
                                        borderTopColor: "#0069ff",
                                        animation: "spin 0.85s linear infinite",
                                    }}
                                />
                            )}
                            <Text fontWeight="600" fontSize="xl" mt="20" style={{ textAlign: "center" }}>
                                {step === "designing" ? "Designing your agent" : "Building your agent"}
                            </Text>
                            <Text color="fg.secondary" mt="8" fontSize="sm" style={{ textAlign: "center" }}>
                                {msgs[msgIdx % msgs.length]}
                            </Text>
                            <ThreeDots />
                        </Box>
                    </Box>
                )}

                {/* ── PREVIEW ───────────────────────────────────────────── */}
                {step === "preview" && (
                    <Box display="flex" flexDirection="column" style={{ height: "100%", overflow: "hidden" }}>
                        {/* Edit Prompt overlay */}
                        {editingPrompt && (
                            <Box
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    zIndex: 20,
                                    background: "rgba(0,0,0,0.45)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Box
                                    bg="bg.default"
                                    rounded="xl"
                                    style={{
                                        width: "min(480px, 88%)",
                                        boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
                                        padding: 28,
                                    }}
                                >
                                    <Text fontWeight="600" fontSize="lg">Edit Your Prompt</Text>
                                    <Text color="fg.secondary" fontSize="sm" mt="4">
                                        Modify your description below, then re-plan to get an updated agent blueprint.
                                    </Text>
                                    <Box mt="16">
                                        <Textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            style={{ minHeight: 96 }}
                                        />
                                    </Box>
                                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap="8" mt="16">
                                        <Button appearance="subtle" onClick={() => setEditingPrompt(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            appearance="primary"
                                            iconPosition="end"
                                            icon={<IconSparkles size={13} />}
                                            onClick={() => {
                                                setEditingPrompt(false);
                                                setStep("designing");
                                            }}
                                        >
                                            Re-plan
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        {/* Preview header */}
                        <Box
                            px="40"
                            borderB="1"
                            borderColor="border.tertiary"
                            display="flex"
                            alignItems="start"
                            justifyContent="space-between"
                            style={{ paddingTop: 28, paddingBottom: 20, flexShrink: 0 }}
                        >
                            <Box>
                                <Text fontWeight="700" fontSize="2xl">Your Agent Preview</Text>
                                <Text color="fg.secondary" fontSize="sm" mt="4">
                                    Here&apos;s what we&apos;ll build. Review the outline, then let&apos;s make it real.
                                </Text>
                            </Box>
                            <Box mt="4">
                                <Button
                                    appearance="subtle"
                                    size="sm"
                                    style={{ border: "1px solid var(--ax-colors-border-default)" }}
                                >
                                    Agent Plan
                                </Button>
                            </Box>
                        </Box>

                        {/* Scrollable content */}
                        <Box px="40" py="24" style={{ flex: 1, overflowY: "auto" }}>
                            {/* Agent identity card */}
                            <Box
                                bg="bg.secondary"
                                rounded="lg"
                                p="20"
                                mb="24"
                            >
                                <Text fontWeight="600" fontSize="lg">{MOCK.name}</Text>
                                <Text color="fg.secondary" fontSize="sm" mt="6">{MOCK.desc}</Text>
                                <Text
                                    fontSize="xs"
                                    color="fg.tertiary"
                                    mt="10"
                                    style={{ fontStyle: "italic" }}
                                >
                                    Click to edit name or description
                                </Text>
                            </Box>

                            {/* Workflow phases */}
                            <Text
                                fontSize="xs"
                                fontWeight="500"
                                color="fg.secondary"
                                style={{ letterSpacing: "0.07em", textTransform: "uppercase" }}
                            >
                                Workflow Phases
                            </Text>
                            <Box display="flex" flexDirection="column" gap="16" mt="12" mb="8">
                                {MOCK.phases.map((phase, i) => (
                                    <Box key={i} display="flex" gap="16" alignItems="start">
                                        <Box
                                            rounded="full"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            style={{
                                                width: 28,
                                                height: 28,
                                                flexShrink: 0,
                                                background: "#0f172a",
                                                color: "white",
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {i + 1}
                                        </Box>
                                        <Box>
                                            <Text fontWeight="600" fontSize="sm">{phase.title}</Text>
                                            <Text fontSize="sm" color="fg.secondary" mt="2">{phase.summary}</Text>
                                            <Text
                                                fontSize="xs"
                                                mt="4"
                                                style={{
                                                    color: "var(--ax-colors-fg-tertiary)",
                                                    fontStyle: "italic",
                                                    lineHeight: 1.65,
                                                }}
                                            >
                                                {phase.detail}
                                            </Text>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>

                            {/* Tools */}
                            <SectionToggle
                                label="Tools"
                                count={MOCK.tools.length}
                                open={toolsOpen}
                                onToggle={() => setToolsOpen((o) => !o)}
                            >
                                <Box display="flex" flexDirection="column" gap="8" pb="4">
                                    {MOCK.tools.map((t) => (
                                        <Box
                                            key={t.name}
                                            p="12"
                                            rounded="md"
                                            border="1"
                                            borderColor="border.secondary"
                                            bg="bg.default"
                                        >
                                            <Text
                                                fontSize="sm"
                                                fontWeight="500"
                                                style={{ fontFamily: "monospace" }}
                                            >
                                                {t.name}
                                            </Text>
                                            <Text fontSize="sm" color="fg.secondary" mt="4">
                                                {t.desc}
                                            </Text>
                                        </Box>
                                    ))}
                                </Box>
                            </SectionToggle>

                            {/* Parameters */}
                            <SectionToggle
                                label="Parameters"
                                count={MOCK.params.length}
                                open={paramsOpen}
                                onToggle={() => setParamsOpen((o) => !o)}
                            >
                                <Box display="flex" flexDirection="column" gap="8" pb="4">
                                    {MOCK.params.map((p, i) => (
                                        <Box
                                            key={i}
                                            p="12"
                                            rounded="md"
                                            border="1"
                                            borderColor="border.secondary"
                                            bg="bg.default"
                                        >
                                            <Box display="flex" gap="8" alignItems="center">
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="500"
                                                    style={{ fontFamily: "monospace" }}
                                                >
                                                    {p.name}
                                                </Text>
                                                <Box
                                                    px="6"
                                                    py="2"
                                                    rounded="full"
                                                    style={{
                                                        background: p.required ? "#eff6ff" : "#f9fafb",
                                                        color: p.required ? "#1d4ed8" : "#6b7280",
                                                        fontSize: 11,
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {p.type}
                                                </Box>
                                                {!p.required && (
                                                    <Box
                                                        px="6"
                                                        py="2"
                                                        rounded="full"
                                                        style={{
                                                            background: "#f9fafb",
                                                            color: "#9ca3af",
                                                            fontSize: 11,
                                                        }}
                                                    >
                                                        optional
                                                    </Box>
                                                )}
                                            </Box>
                                            <Text fontSize="sm" color="fg.secondary" mt="6">
                                                {p.desc}
                                            </Text>
                                            <Text
                                                fontSize="xs"
                                                color="fg.tertiary"
                                                mt="4"
                                                style={{ fontStyle: "italic" }}
                                            >
                                                {p.example}
                                            </Text>
                                        </Box>
                                    ))}
                                </Box>
                            </SectionToggle>

                            {/* Edge cases */}
                            <SectionToggle
                                label="Edge Cases"
                                count={MOCK.edgeCases.length}
                                open={edgesOpen}
                                onToggle={() => setEdgesOpen((o) => !o)}
                            >
                                <Box display="flex" flexDirection="column" gap="8" pb="4">
                                    {MOCK.edgeCases.map((e, i) => (
                                        <Box key={i} display="flex" gap="8" alignItems="start">
                                            <Box
                                                rounded="full"
                                                style={{
                                                    width: 6,
                                                    height: 6,
                                                    flexShrink: 0,
                                                    background: "#f59e0b",
                                                    marginTop: 6,
                                                }}
                                            />
                                            <Text fontSize="sm" color="fg.secondary">{e}</Text>
                                        </Box>
                                    ))}
                                </Box>
                            </SectionToggle>

                            <Box pb="8" />
                        </Box>

                        {/* Sticky footer */}
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            px="40"
                            py="16"
                            borderT="1"
                            borderColor="border.tertiary"
                            bg="bg.default"
                            style={{ flexShrink: 0 }}
                        >
                            <Button
                                appearance="subtle"
                                icon={<IconChevronLeft size={13} />}
                                onClick={() => setStep("entry")}
                            >
                                Back
                            </Button>
                            <Box display="flex" gap="12" alignItems="center">
                                <Button
                                    appearance="subtle"
                                    icon={<IconPen size={13} />}
                                    onClick={() => {
                                        setEditText(prompt);
                                        setEditingPrompt(true);
                                    }}
                                >
                                    Edit Prompt
                                </Button>
                                <Button
                                    appearance="primary"
                                    iconPosition="end"
                                    icon={<IconSparkles size={13} />}
                                    onClick={() => setStep("building")}
                                >
                                    Looks great — Create my Agent
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}
            </div>
        </div>
    );

    return createPortal(content, document.body);
}

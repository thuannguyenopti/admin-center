"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Box, Text, Button, Textarea, Disclosure, DisclosureTrigger, DisclosureContent, Input } from "@optiaxiom/react";
import {
    IconChevronLeft,
    IconChevronDown,
    IconChevronUp,
    IconScrewdriverWrench,
    IconPen,
} from "@optimizely/axiom-icons";
import Image from "next/image";
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

// (SectionToggle removed — replaced with Axiom Disclosure)

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
    const [localPhases, setLocalPhases] = useState(MOCK.phases.map((p) => ({ ...p })));
    const [editingPhaseIdx, setEditingPhaseIdx] = useState<number | null>(null);
    const [hoveredPhaseIdx, setHoveredPhaseIdx] = useState<number | null>(null);
    const [phaseEditTitle, setPhaseEditTitle] = useState("");
    const [phaseEditBody, setPhaseEditBody] = useState("");
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
            setEditingPhaseIdx(null);
            setHoveredPhaseIdx(null);
            setPhaseEditTitle("");
            setPhaseEditBody("");
            setLocalPhases(MOCK.phases.map((p) => ({ ...p })));
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
                data-new-agent-modal=""
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
                    fontFamily: "Inter, sans-serif",
                }}
            >
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                    [data-new-agent-modal] * { font-family: Inter, sans-serif !important; }
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
                                            appearance="primary-opal"
                                            icon={<Image src="/opal-orb.png" alt="Opal" width={18} height={18} />}
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
                                                style={{
                                                    lineHeight: 1.55,
                                                    overflow: "hidden",
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: "vertical",
                                                } as React.CSSProperties}
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
                                                    appearance="inverse"
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
                        </Box>

                        {/* Scrollable content */}
                        <Box px="40" py="24" style={{ flex: 1, overflowY: "auto" }}>
                            {/* Agent identity card */}
                            <Box bg="bg.secondary" rounded="lg" p="20" mb="24">
                                <Text fontWeight="600" fontSize="lg">{MOCK.name}</Text>
                                <Text color="fg.secondary" fontSize="sm" mt="6">{MOCK.desc}</Text>
                            </Box>

                            {/* Agent action plan — editable phases */}
                            <Text
                                fontSize="xs"
                                fontWeight="500"
                                color="fg.secondary"
                                style={{ letterSpacing: "0.07em", textTransform: "uppercase" }}
                            >
                                Agent action plan
                            </Text>
                            <Box display="flex" flexDirection="column" gap="12" mt="12" mb="8">
                                {localPhases.map((phase, i) => (
                                    <Box
                                        key={i}
                                        display="flex"
                                        gap="16"
                                        alignItems="start"
                                        rounded="lg"
                                        p="12"
                                        style={{
                                            position: "relative",
                                            border: "1px solid",
                                            borderColor: editingPhaseIdx === i
                                                ? "var(--ax-colors-border-accent)"
                                                : "var(--ax-colors-border-tertiary)",
                                            cursor: editingPhaseIdx === i ? "default" : "pointer",
                                            background: editingPhaseIdx === i
                                                ? "var(--ax-colors-bg-default)"
                                                : "var(--ax-colors-bg-secondary)",
                                            transition: "border-color 0.15s, background 0.15s",
                                        }}
                                        onMouseEnter={() => setHoveredPhaseIdx(i)}
                                        onMouseLeave={() => setHoveredPhaseIdx(null)}
                                        onClick={() => {
                                            if (editingPhaseIdx !== i) {
                                                setPhaseEditTitle(phase.title);
                                                setPhaseEditBody(
                                                    phase.summary + (phase.detail ? "\n\n" + phase.detail : "")
                                                );
                                                setEditingPhaseIdx(i);
                                            }
                                        }}
                                    >
                                        {/* Step number bubble */}
                                        <Box
                                            rounded="full"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            style={{
                                                width: 28,
                                                height: 28,
                                                flexShrink: 0,
                                                marginTop: 2,
                                                background: "#0f172a",
                                                color: "white",
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {i + 1}
                                        </Box>

                                        {editingPhaseIdx === i ? (
                                            /* Editing state — combined title + body */
                                            <Box display="flex" flexDirection="column" gap="8" style={{ flex: 1 }}>
                                                <Input
                                                    value={phaseEditTitle}
                                                    onChange={(e) => setPhaseEditTitle(e.target.value)}
                                                    style={{ fontWeight: 600 }}
                                                />
                                                <Textarea
                                                    value={phaseEditBody}
                                                    onChange={(e) => setPhaseEditBody(e.target.value)}
                                                    style={{ minHeight: 96, fontSize: 13, lineHeight: 1.6 }}
                                                />
                                                <Box display="flex" justifyContent="flex-end">
                                                    <Button
                                                        appearance="subtle"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setLocalPhases((prev) =>
                                                                prev.map((p, j) =>
                                                                    j === i
                                                                        ? { ...p, title: phaseEditTitle, summary: phaseEditBody, detail: "" }
                                                                        : p
                                                                )
                                                            );
                                                            setEditingPhaseIdx(null);
                                                        }}
                                                    >
                                                        Done
                                                    </Button>
                                                </Box>
                                            </Box>
                                        ) : (
                                            /* Read-only state */
                                            <Box style={{ flex: 1 }}>
                                                <Text fontWeight="600" fontSize="sm">{phase.title}</Text>
                                                <Text fontSize="sm" color="fg.secondary" mt="2">{phase.summary}</Text>
                                                {phase.detail ? (
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
                                                ) : null}
                                            </Box>
                                        )}

                                        {/* Hover edit indicator */}
                                        {hoveredPhaseIdx === i && editingPhaseIdx !== i && (
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                gap="4"
                                                style={{
                                                    position: "absolute",
                                                    top: 10,
                                                    right: 12,
                                                    background: "var(--ax-colors-bg-default)",
                                                    border: "1px solid var(--ax-colors-border-default)",
                                                    borderRadius: 6,
                                                    padding: "3px 8px",
                                                    pointerEvents: "none",
                                                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                                }}
                                            >
                                                <IconPen size={11} color="var(--ax-colors-fg-secondary)" />
                                                <Text fontSize="xs" color="fg.secondary" style={{ fontWeight: 500 }}>
                                                    Edit
                                                </Text>
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Box>

                            {/* Tools */}
                            <Box borderT="1" borderColor="border.tertiary" pt="16" mt="4">
                                <Disclosure>
                                    <DisclosureTrigger
                                        fontSize="xs"
                                        fontWeight="500"
                                        color="fg.secondary"
                                        style={{ letterSpacing: "0.07em", textTransform: "uppercase" as const }}
                                    >
                                        Tools ({MOCK.tools.length})
                                    </DisclosureTrigger>
                                    <DisclosureContent>
                                        <Box display="flex" flexDirection="column" gap="8" pt="12" pb="4">
                                            {MOCK.tools.map((t) => (
                                                <Box
                                                    key={t.name}
                                                    p="12"
                                                    rounded="md"
                                                    border="1"
                                                    borderColor="border.secondary"
                                                    bg="bg.default"
                                                >
                                                    <Text fontSize="sm" fontWeight="500" style={{ fontFamily: "monospace" }}>
                                                        {t.name}
                                                    </Text>
                                                    <Text fontSize="sm" color="fg.secondary" mt="4">
                                                        {t.desc}
                                                    </Text>
                                                </Box>
                                            ))}
                                        </Box>
                                    </DisclosureContent>
                                </Disclosure>
                            </Box>

                            {/* Parameters */}
                            <Box borderT="1" borderColor="border.tertiary" pt="16" mt="4">
                                <Disclosure>
                                    <DisclosureTrigger
                                        fontSize="xs"
                                        fontWeight="500"
                                        color="fg.secondary"
                                        style={{ letterSpacing: "0.07em", textTransform: "uppercase" as const }}
                                    >
                                        Parameters ({MOCK.params.length})
                                    </DisclosureTrigger>
                                    <DisclosureContent>
                                        <Box display="flex" flexDirection="column" gap="8" pt="12" pb="4">
                                            {MOCK.params.map((p, idx) => (
                                                <Box
                                                    key={idx}
                                                    p="12"
                                                    rounded="md"
                                                    border="1"
                                                    borderColor="border.secondary"
                                                    bg="bg.default"
                                                >
                                                    <Box display="flex" gap="8" alignItems="center">
                                                        <Text fontSize="sm" fontWeight="500" style={{ fontFamily: "monospace" }}>
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
                                                                style={{ background: "#f9fafb", color: "#9ca3af", fontSize: 11 }}
                                                            >
                                                                optional
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    <Text fontSize="sm" color="fg.secondary" mt="6">{p.desc}</Text>
                                                    <Text fontSize="xs" color="fg.tertiary" mt="4" style={{ fontStyle: "italic" }}>
                                                        {p.example}
                                                    </Text>
                                                </Box>
                                            ))}
                                        </Box>
                                    </DisclosureContent>
                                </Disclosure>
                            </Box>

                            {/* Edge Cases */}
                            <Box borderT="1" borderColor="border.tertiary" pt="16" mt="4">
                                <Disclosure>
                                    <DisclosureTrigger
                                        fontSize="xs"
                                        fontWeight="500"
                                        color="fg.secondary"
                                        style={{ letterSpacing: "0.07em", textTransform: "uppercase" as const }}
                                    >
                                        Edge Cases ({MOCK.edgeCases.length})
                                    </DisclosureTrigger>
                                    <DisclosureContent>
                                        <Box display="flex" flexDirection="column" gap="8" pt="12" pb="4">
                                            {MOCK.edgeCases.map((ec, idx) => (
                                                <Box key={idx} display="flex" gap="8" alignItems="start">
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
                                                    <Text fontSize="sm" color="fg.secondary">{ec}</Text>
                                                </Box>
                                            ))}
                                        </Box>
                                    </DisclosureContent>
                                </Disclosure>
                            </Box>

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
                            <Button
                                appearance="primary-opal"
                                icon={<Image src="/opal-orb.png" alt="Opal" width={18} height={18} />}
                                onClick={() => setStep("building")}
                            >
                                Build Agent
                            </Button>
                        </Box>
                    </Box>
                )}
            </div>
        </div>
    );

    return createPortal(content, document.body);
}

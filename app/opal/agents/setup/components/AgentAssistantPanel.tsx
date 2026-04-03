"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Alert, Box, Text, Button, Textarea } from "@optiaxiom/react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@optiaxiom/react/unstable";
import { IconBook, IconBookOpen, IconPlus, IconChevronRight, IconXmark, IconCircleCheck as IconCircleCheckAxiom, IconLightbulb, IconArrowUpRightFromSquare, IconGripVertical, IconCircleExclamation } from "@optimizely/axiom-icons";
import { LayoutGroup, motion } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

type CheckerCategory = {
    key: string;
    label: string;
    score: number;
    maxScore: number;
};

type CheckerResult = {
    total: number;
    maxTotal: number;
    passed: boolean;
    categories: CheckerCategory[];
    suggestions: string[];
    summary: string;
};

// ─── Wizard Step Data ─────────────────────────────────────────────────────────

const WIZARD_STEPS = [
    {
        step: 1,
        label: "Write Instructions",
        title: "Tell your agent what to do",
        intro: "The prompt is the instruction that tells the agent exactly how to behave.\n\nA strong prompt includes:",
        bullets: [
            { bold: "Role", text: `Who is the agent? ("You are a helpful customer support specialist...")` },
            { bold: "Task", text: `What should it do? ("Answer customer questions about our product...")` },
            { bold: "Guidelines", text: `How should it behave? ("Be friendly, concise, and accurate...")` },
            { bold: "Constraints", text: `What should it avoid? ("Don't make up information, don't discuss competitors...")` },
        ],
        keyConcept: `Think of it like writing a job description — the more specific you are, the better the results. You'll name your agent later. For now, focus on what it does.`,
        checkLabel: "Check my instructions",
    },
    {
        step: 2,
        label: "Add an Input Variable",
        title: "Make your agent dynamic with variables",
        intro: "Use variables to make the same instructions work with different inputs each time the agent runs.\n\nTo make one work, set it up in the Variables section below and reference it in the Prompt Template using double bracket syntax:",
        codeSnippet: "[[variable_name]]",
        keyConcept: `Variables only work when both pieces match: create the variable in the Variables section and use the same name in the Prompt Template with [[double_brackets]].`,
        checkLabel: "Check my variable",
    },
    {
        step: 3,
        label: "Add Tools",
        title: "Power your agent with tools",
        intro: "Tools let your agent take actions beyond just generating text — like creating files, sending emails, or browsing the web.",
        keyConcept: "Based on your prompt, here are tools that would help your agent. Add them in the tools section below.",
        checkLabel: "Continue",
    },
    {
        step: 4,
        label: "See It Live",
        title: "See your agent in action",
        intro: "Now enter a value for your variable and hit \"Run Preview\" to watch your creation come alive.\n\nThe preview uses AI to simulate what your agent would do in Opal. Try a few different inputs to see how the same instructions produce different results!",
        checkLabel: "Run Preview",
    },
];

// ─── Common Actions Data ──────────────────────────────────────────────────────

const COMMON_ACTIONS = [
    {
        id: "create-pdf",
        name: "Create PDF",
        description: "Export the full agent output as a formatted PDF document.",
        prompt: "`Create PDF`",
        details: `Put this entire report (including the overall assessment and both tables) into an HTML file using the write_content_to_file tool. Ensure the tables are properly formatted in HTML. Then, convert this HTML file to a PDF using convert_to_pdf tool.`,
    },
    {
        id: "export-csv",
        name: "Export to CSV",
        description: "Save structured data from the output to a downloadable CSV file.",
        prompt: "`Export to CSV`",
        details: `Export the data as a CSV file using the write_content_to_file tool. Ensure all columns are properly formatted and include a header row.`,
    },
    {
        id: "send-email",
        name: "Send Email",
        description: "Send the agent's output via email to a specified recipient.",
        prompt: "`Send Email`",
        details: `Send the output via email using the send_email tool. Include a clear subject line and format the body content for readability.`,
    },
];

const SHORTCUT_ITEMS = [
    {
        trigger: "/",
        label: "for all options",
    },
    {
        trigger: "[",
        label: "for variables",
    },
    {
        trigger: "{",
        label: "for instructions or RAG",
    },
    {
        trigger: "`",
        label: "for tools",
    },
];

// ─── Suggested Templates Data ─────────────────────────────────────────────────

const SUGGESTED_TEMPLATES = [
    {
        id: "competitive-researcher",
        name: "Competitive Researcher",
        emoji: "🔎",
        description: "Analyzes competitors and delivers structured insights on positioning, pricing, and strategy.",
        prompt: `You are a competitive intelligence researcher.\n\nAnalyze the following competitor: [[competitor]]\n\nProvide:\n1. Company overview and positioning\n2. Key products/services and pricing\n3. Strengths and weaknesses\n4. Strategic recommendations\n\nNever fabricate information. Cite sources where available.`,
    },
    {
        id: "seo-optimizer",
        name: "SEO Optimizer",
        emoji: "📈",
        description: "Reviews content and suggests improvements for better search engine visibility.",
        prompt: `You are an SEO expert.\n\nContent: [[content]]\nTarget keyword: [[keyword]]\n\nProvide:\n1. Keyword placement suggestions\n2. Meta description\n3. Header structure improvements\n4. Internal linking opportunities\n\nPrioritize by impact.`,
    },
    {
        id: "website-optimizer",
        name: "Website Optimizer",
        emoji: "🛠️",
        description: "Audits websites for performance, UX, and conversion rate opportunities.",
        prompt: `You are a website optimization specialist.\n\nWebsite URL: [[website_url]]\n\nAnalyze and recommend improvements for:\n1. Page load performance\n2. User experience and navigation\n3. Conversion rate optimization\n4. Content clarity\n\nPrioritize by impact and ease of implementation.`,
    },
];

// ─── Stepper Overview Data ────────────────────────────────────────────────────

const STEPPER_ITEMS = [
    { step: 1, label: "Write Instructions", description: "Define your agent's role and behavior" },
    { step: 2, label: "Add an Input Variable", description: "Make your agent dynamic with [[variables]]" },
    { step: 3, label: "Add Tools", description: "Extend your agent with actions and integrations" },
    { step: 4, label: "See It Live", description: "Test your agent with real inputs" },
];

// ─── Evaluator Functions ──────────────────────────────────────────────────────

function evaluateStep1(prompt: string): CheckerResult {
    const categories: CheckerCategory[] = [
        {
            key: "C",
            label: "Context",
            score: /(you are|your role is|as a)/i.test(prompt) ? 20 : 0,
            maxScore: 20,
        },
        {
            key: "L",
            label: "Layout & Logic",
            score: prompt.split("\n").filter(l => l.trim()).length > 2 ? 20 : 0,
            maxScore: 20,
        },
        {
            key: "E",
            label: "Examples",
            score: /(for example|such as|e\.g\.|example:)/i.test(prompt) ? 20 : 0,
            maxScore: 20,
        },
        {
            key: "A",
            label: "Actions",
            score: /\[\[/.test(prompt) ? 20 : 0,
            maxScore: 20,
        },
        {
            key: "R",
            label: "Review & Refine",
            score: /(don'?t|never|always|avoid|do not)/i.test(prompt) ? 20 : 0,
            maxScore: 20,
        },
    ];

    const total = categories.reduce((s, c) => s + c.score, 0);
    const passed = total >= 60;

    const suggestions: string[] = [];
    if (categories[0].score === 0) suggestions.push("Add a clear role/persona — e.g. 'You are a helpful support specialist...'");
    if (categories[2].score === 0) suggestions.push("Include an example to guide the model's output format");
    if (categories[3].score === 0) suggestions.push("Use [[variable]] syntax to make your prompt dynamic");
    if (categories[4].score === 0) suggestions.push("Add constraints — e.g. 'Never fabricate data' or 'Always respond in English'");

    const summary = passed
        ? "You did a fantastic job establishing a clear persona and setting firm constraints — the foundation of a great agent. To make this even better, consider the suggestions below."
        : "Your prompt is a good start. Adding a few key elements will make it significantly more reliable.";

    return { total, maxTotal: 100, passed, categories, suggestions, summary };
}

function evaluateStep2(prompt: string, variables: any[]): CheckerResult {
    const hasVariableSyntax = /\[\[.+?\]\]/.test(prompt);
    const hasVariableDefined = variables.length > 0;

    const categories: CheckerCategory[] = [
        {
            key: "S",
            label: "Variable syntax in prompt",
            score: hasVariableSyntax ? 50 : 0,
            maxScore: 50,
        },
        {
            key: "D",
            label: "Variable defined",
            score: hasVariableDefined ? 50 : 0,
            maxScore: 50,
        },
    ];

    const total = categories.reduce((s, c) => s + c.score, 0);
    const passed = total === 100;

    const suggestions: string[] = [];
    if (!hasVariableSyntax) suggestions.push("Add [[variable_name]] syntax in your Prompt Template above");
    if (!hasVariableDefined) suggestions.push("Define at least one variable in the Variables section");

    const summary = passed
        ? "You successfully implemented a variable and integrated it into your instructions. Your agent is now dynamic and ready for different inputs!"
        : "Almost there — complete both steps to make your agent reusable.";

    return { total, maxTotal: 100, passed, categories, suggestions, summary };
}

function suggestTools(prompt: string): { name: string; description: string; snippet: string }[] {
    const lower = prompt.toLowerCase();
    const tools: { name: string; description: string; snippet: string }[] = [];
    if (/email|send mail/.test(lower)) tools.push({ name: "send_email", description: "Send emails directly from your agent", snippet: "\n\nUse the send_email tool to send the output to the recipient." });
    if (/pdf|document/.test(lower)) tools.push({ name: "convert_to_pdf", description: "Convert agent output to PDF format", snippet: "\n\nUse the convert_to_pdf tool to export the result as a PDF document." });
    if (/search|browse|web/.test(lower)) tools.push({ name: "web_search", description: "Search the web for live information", snippet: "\n\nUse the web_search tool to look up current information when needed." });
    if (/file|write|export|save|csv/.test(lower)) tools.push({ name: "write_content_to_file", description: "Save output to a file", snippet: "\n\nUse the write_content_to_file tool to save the output to a file." });
    if (/image|screenshot|photo/.test(lower)) tools.push({ name: "take_screenshot", description: "Capture a screenshot", snippet: "\n\nUse the take_screenshot tool to capture a screenshot when needed." });
    if (tools.length === 0) {
        tools.push(
            { name: "web_search", description: "Search the web for live information", snippet: "\n\nUse the web_search tool to look up current information when needed." },
            { name: "write_content_to_file", description: "Save output to a file", snippet: "\n\nUse the write_content_to_file tool to save the output to a file." }
        );
    }
    return tools;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KeyConceptCallout({
    text,
    onViewExample,
}: {
    text: string;
    onViewExample?: () => void;
}) {
    return (
        <Box
            display="flex"
            gap="10"
            style={{
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.18)",
                borderRadius: "12px",
                padding: "12px 14px",
            }}
        >
            <IconBook size={16} style={{ flexShrink: 0, marginTop: "3px", color: "#5B5CEB" }} />
            <Box display="flex" flexDirection="column" gap="8">
                <Text fontSize="md" fontWeight="500" style={{ color: "#4338ca" }}>Key Concept:</Text>
                {text.split("\n").filter(Boolean).map((line, i) => (
                    <Text key={i} fontSize="md" style={{ color: "#4f576e", lineHeight: "1.55" }}>
                        {line}
                    </Text>
                ))}
                {onViewExample && (
                    <button
                        onClick={onViewExample}
                        style={{
                            alignSelf: "flex-start",
                            marginTop: "2px",
                            background: "none",
                            border: "none",
                            padding: 0,
                            color: "#4f576e",
                            fontSize: "12px",
                            lineHeight: "1.4",
                            textDecoration: "underline",
                            cursor: "pointer",
                            fontWeight: 400,
                        }}
                    >
                        View Example
                    </button>
                )}
            </Box>
        </Box>
    );
}

function SuggestedNextMovesCallout({ onOpenGuidedSetup }: { onOpenGuidedSetup: () => void }) {
    return (
        <Box
            display="flex"
            gap="10"
            style={{
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.18)",
                borderRadius: "12px",
                padding: "12px 14px",
            }}
        >
            <IconBook size={16} style={{ flexShrink: 0, marginTop: "3px", color: "#5B5CEB" }} />
            <Box display="flex" flexDirection="column" gap="8">
                <Text fontSize="md" fontWeight="500" style={{ color: "#4338ca" }}>
                    Suggested next moves
                </Text>
                <Text fontSize="md" style={{ color: "#4f576e", lineHeight: "1.55" }}>
                    A strong agent usually needs three things: clear instructions, the right inputs, and only the tools required to finish the task.
                </Text>
                <Text fontSize="md" style={{ color: "#4f576e", lineHeight: "1.55" }}>
                    If you already know the workflow, use{" "}
                    <button
                        type="button"
                        onClick={onOpenGuidedSetup}
                        style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            margin: 0,
                            color: "#4f576e",
                            textDecoration: "underline",
                            cursor: "pointer",
                            font: "inherit",
                        }}
                    >
                        the guided setup
                    </button>{" "}
                    to stitch the steps together. If you&apos;re still shaping the idea, ask Opal to help.
                </Text>
            </Box>
        </Box>
    );
}

function CheckerCard({ result }: { result: CheckerResult }) {
    const passedColor = result.passed ? "#166534" : "#92400e";
    const passBg = result.passed ? "#f0fdf4" : "#fffbeb";
    const passBorder = result.passed ? "#bbf7d0" : "#fde68a";

    return (
        <Box display="flex" flexDirection="column" gap="12">
            {/* Status pill */}
            <Box display="flex" alignItems="center" gap="6" style={{ alignSelf: "flex-start" }}>
                <Box
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        background: passBg,
                        border: `1px solid ${passBorder}`,
                        borderRadius: "20px",
                        padding: "3px 10px",
                    }}
                >
                    {result.passed
                        ? <IconCircleCheckAxiom size={13} color={passedColor} />
                        : <IconCircleExclamation size={13} color={passedColor} />
                    }
                    <Text fontSize="md" fontWeight="500" style={{ color: passedColor }}>
                        {result.passed ? "Passed" : "Needs work"}
                    </Text>
                </Box>
            </Box>

            {/* Score card */}
            <Box
                style={{
                    background: passBg,
                    border: `1px solid ${passBorder}`,
                    borderRadius: "10px",
                    padding: "14px",
                }}
                display="flex"
                flexDirection="column"
                gap="10"
            >
                {/* Header row */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap="6">
                        {result.passed
                            ? <IconCircleCheckAxiom size={16} color={passedColor} />
                            : <IconCircleExclamation size={16} color={passedColor} />
                        }
                        <Text fontWeight="600" fontSize="lg" style={{ color: passedColor }}>
                            {result.passed ? "Passed!" : "Needs work"}
                        </Text>
                    </Box>
                    <Box
                        style={{
                            background: passBg,
                            border: `1px solid ${passBorder}`,
                            borderRadius: "20px",
                            padding: "1px 10px",
                        }}
                    >
                        <Text fontWeight="600" fontSize="md" style={{ color: passedColor }}>
                            {result.total}/{result.maxTotal}
                        </Text>
                    </Box>
                </Box>

                {/* Summary text */}
                <Text fontSize="md" style={{ color: passedColor, lineHeight: "1.55" }}>
                    {result.summary}
                </Text>

                {/* Category rows */}
                <Box display="flex" flexDirection="column" gap="6">
                    {result.categories.map((cat) => {
                        const pct = (cat.score / cat.maxScore) * 100;
                        const catPassed = cat.score > 0;
                        return (
                            <Box key={cat.key} display="flex" alignItems="center" gap="8">
                                {/* Key badge */}
                                <Box
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        borderRadius: "50%",
                                        background: catPassed ? "rgba(22,101,52,0.12)" : "rgba(146,64,14,0.1)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <Text style={{ fontSize: "10px", fontWeight: 700, color: catPassed ? "#166534" : "#92400e" }}>
                                        {cat.key}
                                    </Text>
                                </Box>
                                {/* Label */}
                                <Text fontSize="md" style={{ flex: 1, color: "#4f576e", minWidth: 0 }}>{cat.label}</Text>
                                {/* Progress bar */}
                                <Box style={{ width: "60px", height: "4px", background: "rgba(0,0,0,0.08)", borderRadius: "2px", flexShrink: 0 }}>
                                    <Box style={{
                                        width: `${pct}%`,
                                        height: "100%",
                                        background: catPassed ? "#16a34a" : "#d97706",
                                        borderRadius: "2px",
                                        transition: "width 0.4s ease",
                                    }} />
                                </Box>
                                {/* Score */}
                                <Text style={{ fontSize: "12px", color: "#4f576e", width: "24px", textAlign: "right", flexShrink: 0 }}>
                                    {cat.score}
                                </Text>
                                {/* Check circle */}
                                {catPassed
                                    ? <IconCircleCheckAxiom size={13} color="#16a34a" style={{ flexShrink: 0 }} />
                                    : <Box style={{ width: 13, height: 13, borderRadius: "50%", border: "1.5px solid #d1d5db", flexShrink: 0 }} />
                                }
                            </Box>
                        );
                    })}
                </Box>

                {/* Suggestions */}
                {result.suggestions.length > 0 && (
                    <Box display="flex" flexDirection="column" gap="4">
                        {result.suggestions.map((s, i) => (
                            <Box key={i} display="flex" gap="6" style={{ alignItems: "flex-start" }}>
                                <Text style={{ color: passedColor, fontSize: "13px", flexShrink: 0, lineHeight: "1.6" }}>–</Text>
                                <Text style={{ fontSize: "13px", color: passedColor, lineHeight: "1.6" }}>{s}</Text>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

function CommonActionCard({
    action,
    onInsert,
}: {
    action: typeof COMMON_ACTIONS[0];
    onInsert: () => void;
}) {
    const promptInsertion = `${action.prompt} | ${action.details}`;

    return (
        <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
                <Box
                    draggable
                    onDragStart={(e: React.DragEvent) => {
                        e.dataTransfer.setData("text/plain", promptInsertion);
                        e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={onInsert}
                    display="inline-flex"
                    alignItems="center"
                    gap="8"
                    style={{
                        background: "#ffffff",
                        border: "1px solid #dadfeb",
                        borderRadius: "999px",
                        padding: "8px 12px",
                        cursor: "pointer",
                    }}
                >
                    <IconGripVertical
                        size={14}
                        color="var(--ax-colors-fg-tertiary)"
                        style={{ flexShrink: 0, cursor: "grab" }}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    />
                    <Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }}>
                        {action.name}
                    </Text>
                    <IconPlus size={13} color="var(--ax-colors-fg-tertiary)" />
                </Box>
            </HoverCardTrigger>
            <HoverCardContent side="top" align="start" style={{ maxWidth: "320px" }}>
                <Box display="flex" flexDirection="column" gap="8" p="4">
                    <Text fontWeight="600" fontSize="md">{action.name}</Text>
                    <Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.5" }}>
                        {action.description}
                    </Text>
                    <Box
                        style={{
                            background: "#f5f6fa",
                            border: "1px solid #dadfeb",
                            borderRadius: "8px",
                            padding: "8px 10px",
                        }}
                    >
                        <Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                            {action.details}
                        </Text>
                    </Box>
                </Box>
            </HoverCardContent>
        </HoverCard>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface AgentAssistantPanelProps {
    isOpen: boolean;
    onClose: () => void;
    view: "assistant" | "guide";
    onViewChange: (v: "assistant" | "guide") => void;
    hasAgentDetails: boolean;
    promptTemplate: string;
    tools: string;
    variables: any[];
    onInsertToPrompt: (text: string) => void;
    onAddTool: (toolName: string) => void;
    onApplyTemplate: (prompt: string) => void;
    activeFieldStep: number | null;
    onWizardStepChange: (step: number) => void;
    onAssistantFieldHover?: (field: "system-prompt" | "memory-limit" | "first-message" | null) => void;
    onRunPreview?: () => void;
    onAskOpal?: (prompt: string) => void;
    onOpenExample?: (step: 1 | 2) => void;
    multiTurnMode?: boolean;
    fromAi?: boolean;
    enhancePopoverOpen?: boolean;
}

// ─── Multi-turn Step 5 Data ───────────────────────────────────────────────────

const MULTITURN_STEP: typeof WIZARD_STEPS[0] = {
    step: 5,
    label: "Multi-Turn Settings",
    title: "Configure conversational settings",
    intro: "Great — you've enabled multi-turn. Now configure the three settings that shape how your agent behaves across a full conversation.",
    bullets: [
        { bold: "System Prompt", text: "A hidden, permanent instruction that sets the agent's persona and guardrails. Users never see it." },
        { bold: "Memory Limit", text: "How many conversation turns the agent keeps in context. More memory = better recall, higher cost." },
        { bold: "First Message", text: "A static greeting shown to the user before they type anything. Sets the tone immediately." },
    ],
    keyConcept: `The system prompt is the most powerful lever here: keep it authoritative and concise.\n\nExample: "You are a concise marketing assistant. Never fabricate data. Always ask for clarification when the request is ambiguous."`,
    checkLabel: "Continue",
};

export function AgentAssistantPanel({
    isOpen,
    onClose,
    view,
    onViewChange,
    hasAgentDetails,
    promptTemplate,
    tools,
    variables,
    onInsertToPrompt,
    onAddTool,
    onApplyTemplate,
    activeFieldStep,
    onWizardStepChange,
    onAssistantFieldHover,
    onRunPreview,
    onAskOpal,
    onOpenExample,
    multiTurnMode = false,
    fromAi = false,
    enhancePopoverOpen = false,
}: AgentAssistantPanelProps) {
    const router = useRouter();
    const DEFAULT_PANEL_WIDTH = 348;
    const MIN_PANEL_WIDTH = 320;
    const MAX_PANEL_WIDTH = 640;
    const [isOverview, setIsOverview] = useState(true);
    const [wizardStep, setWizardStep] = useState(1);
    const [visitedSteps, setVisitedSteps] = useState<number[]>([1]);
    const [checkerResult, setCheckerResult] = useState<CheckerResult | null>(null);
    const [hasChecked, setHasChecked] = useState(false);
    const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
    const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
    const [isResizing, setIsResizing] = useState(false);
    const [assistantFlow, setAssistantFlow] = useState<"landing" | "contextual" | "guided">("landing");
    const [assistantQuery, setAssistantQuery] = useState("");
    const [submittedAssistantQuery, setSubmittedAssistantQuery] = useState("");
    const [hasStartedGuidedFlow, setHasStartedGuidedFlow] = useState(false);

    // Keep the assistant in the right scenario:
    // - empty agent => landing
    // - in-progress guided setup => guided flow
    // - otherwise => contextual help
    useEffect(() => {
        if (hasStartedGuidedFlow) {
            setAssistantFlow("guided");
            setIsOverview(activeFieldStep === null || activeFieldStep === undefined);
            if (activeFieldStep !== null && activeFieldStep !== undefined) {
                setWizardStep(activeFieldStep);
                setVisitedSteps((prev) => prev.includes(activeFieldStep) ? prev : [...prev, activeFieldStep]);
            }
            setCheckerResult(null);
            setHasChecked(false);
            return;
        }

        if (!hasAgentDetails) {
            setAssistantFlow("landing");
            setIsOverview(true);
            return;
        }

        setAssistantFlow("contextual");
        setIsOverview(true);
    }, [activeFieldStep, hasAgentDetails, hasStartedGuidedFlow]);

    const goToStep = (step: number) => {
        setHasStartedGuidedFlow(true);
        setAssistantFlow("guided");
        setIsOverview(false);
        setWizardStep(step);
        setVisitedSteps((prev) => prev.includes(step) ? prev : [...prev, step]);
        setCheckerResult(null);
        setHasChecked(false);
        onWizardStepChange(step);
    };

    const goToStepAndHighlight = (step: number) => {
        goToStep(step);
    };

    const goToOverview = () => {
        if (hasStartedGuidedFlow) {
            setAssistantFlow("guided");
            setIsOverview(true);
        } else if (hasAgentDetails) {
            setAssistantFlow("contextual");
            setIsOverview(true);
        } else {
            setAssistantFlow("landing");
            setIsOverview(true);
        }
        setCheckerResult(null);
        setHasChecked(false);
    };

    const goToLanding = () => {
        setAssistantFlow("landing");
        setIsOverview(true);
        setCheckerResult(null);
        setHasChecked(false);
    };

    const goToGuidedHome = () => {
        setHasStartedGuidedFlow(true);
        setAssistantFlow("guided");
        setIsOverview(true);
        setCheckerResult(null);
        setHasChecked(false);
    };

    const exitGuide = () => {
        setAssistantFlow("contextual");
        setIsOverview(true);
        setCheckerResult(null);
        setHasChecked(false);
    };

    const handleCheck = () => {
        if (wizardStep === 1) setCheckerResult(evaluateStep1(promptTemplate));
        else if (wizardStep === 2) setCheckerResult(evaluateStep2(promptTemplate, variables));
        setHasChecked(true);
    };

    const handleResizeStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        const startX = event.clientX;
        const startWidth = panelWidth;
        setIsResizing(true);
        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";

        const handlePointerMove = (moveEvent: PointerEvent) => {
            const nextWidth = Math.min(
                MAX_PANEL_WIDTH,
                Math.max(MIN_PANEL_WIDTH, startWidth - (moveEvent.clientX - startX))
            );
            setPanelWidth(nextWidth);
        };

        const handlePointerUp = () => {
            setIsResizing(false);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
    }, [panelWidth]);

    const totalSteps = multiTurnMode ? 5 : 4;
    const allSteps = multiTurnMode
        ? [WIZARD_STEPS[0], WIZARD_STEPS[1], WIZARD_STEPS[2], MULTITURN_STEP, WIZARD_STEPS[3]]
        : WIZARD_STEPS;
    const currentStep = allSteps[wizardStep - 1] ?? WIZARD_STEPS[0];
    const suggestedTools = wizardStep === 3 ? suggestTools(promptTemplate) : [];
    const addedTools = new Set(
        tools
            .split(",")
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean)
    );
    const completedSteps = new Set<number>();

    if (promptTemplate.trim().length > 0) completedSteps.add(1);
    if (/\[\[.+?\]\]/.test(promptTemplate) && variables.length > 0) completedSteps.add(2);
    if (tools.trim().length > 0) completedSteps.add(3);
    if (Boolean((promptTemplate || "").trim()) && Boolean((variables[0]?.name || "").trim())) {
        completedSteps.add(4);
    }
    if (multiTurnMode && visitedSteps.includes(5)) {
        completedSteps.add(5);
    }

    const stepperItems = [
        { step: 1, label: "Write Instructions", description: "Define your agent's role and behavior" },
        { step: 2, label: "Add an Input Variable", description: "Make your agent dynamic with [[variables]]" },
        { step: 3, label: "Add Tools", description: "Extend your agent with actions and integrations" },
        ...(multiTurnMode
            ? [
                { step: 4, label: "Multi-Turn Settings", description: "System prompt, memory limit & first message" },
                { step: 5, label: "See It Live", description: "Test your agent with real inputs" },
            ]
            : [{ step: 4, label: "See It Live", description: "Test your agent with real inputs" }]),
    ];
    const multiTurnInfoCards = [
        {
            title: "System Prompt",
            text: "A hidden, permanent instruction that sets the agent's persona and guardrails. Users never see it.",
        },
        {
            title: "Memory Limit",
            text: "How many conversation turns the agent keeps in context. More memory = better recall, higher cost.",
        },
        {
            title: "First Message",
            text: "A static greeting shown to the user before they type anything. Sets the tone immediately.",
        },
    ];
    const memoryLevelCards = [
        {
            level: "LOW",
            range: "5–10",
            details: "Simple tasks, stateless queries and lookups.",
            chip: "Q&A · Calc",
            accent: "#0f9b8e",
            chipBackground: "#e8f7f4",
        },
        {
            level: "MEDIUM",
            range: "10–20",
            details: "Multi-step reasoning, 1–2 knowledge bases.",
            chip: "Research",
            accent: "#dd7a00",
            chipBackground: "#fff1db",
        },
        {
            level: "HIGH",
            range: "20–50",
            details: "Full history, deep iterative refinement.",
            chip: "Exploration",
            accent: "#e23d32",
            chipBackground: "#fde9e7",
        },
    ];
    const documentationButton = (
        <button
            type="button"
            onClick={() => onViewChange("guide")}
            style={{
                alignSelf: "flex-start",
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                padding: 0,
                background: "transparent",
                border: "none",
                color: "var(--ax-colors-fg-default)",
                cursor: "pointer",
            }}
        >
            <IconBookOpen size={16} />
            <Text fontSize="md" fontWeight="400" color="fg.default" style={{ lineHeight: "1.2" }}>
                Agent setup documentation
            </Text>
            <IconArrowUpRightFromSquare size={16} />
        </button>
    );

    return (
        <Box
            style={{
                width: isOpen ? `${panelWidth + 24}px` : "0px",
                height: isOpen ? "calc(100vh - 57px)" : "0px",
                transition: isResizing ? "none" : "width 0.3s ease-in-out",
                overflow: "hidden",
                display: "flex",
                flexShrink: 0,
                padding: isOpen ? "12px" : "0",
                alignItems: "stretch",
                minHeight: 0,
            }}
        >
            {isOpen && (
                    <LayoutGroup id="agent-assistant-steps">
                    <Box
                        id="figma-agent-assistant-panel"
                        display="flex"
                        flexDirection="column"
                        style={{
                            flex: 1,
                            position: "relative",
                            overflow: "hidden",
                            border: "1px solid var(--ax-colors-border-secondary)",
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                            backgroundColor: "var(--ax-colors-bg-default)",
                            height: "100%",
                        }}
                    >
                        <Box
                            role="separator"
                            aria-orientation="vertical"
                            aria-label="Resize assistant panel"
                            onPointerDown={handleResizeStart}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "18px",
                                height: "100%",
                                cursor: "col-resize",
                                zIndex: 3,
                            }}
                        />
                        {/* Purple gradient bg */}
                        <Box
                            style={{
                                position: "absolute",
                                width: "452px",
                                height: "452px",
                                top: "128px",
                                left: "-15px",
                                borderRadius: "50%",
                                background: "radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)",
                                filter: "blur(40px)",
                                pointerEvents: "none",
                                zIndex: 0,
                            }}
                        />

                        {/* Header */}
                        <Box
                            px="16"
                            pt="12"
                            pb="10"
                            display="flex"
                            flexDirection="column"
                            gap="4"
                            style={{
                                flexShrink: 0,
                                position: "relative",
                                zIndex: 1,
                            }}
                        >
                            {/* Title row */}
                            <Box display="flex" alignItems="center">
                                <Button
                                    appearance="subtle"
                                    size="md"
                                    icon={<IconLightbulb size={18} />}
                                    aria-label="Back to assistant landing page"
                                    onClick={goToLanding}
                                    style={{ flexShrink: 0, marginRight: "2px" }}
                                />
                                <Text fontWeight="500" fontSize="lg" color="fg.default" style={{ flex: 1 }}>
                                    Agent Setup Assistant
                                </Text>
                                <Button
                                    appearance="subtle"
                                    size="md"
                                    icon={<IconXmark size={16} />}
                                    aria-label="Close assistant"
                                    onClick={onClose}
                                />
                            </Box>
                            {assistantFlow === "guided" && isOverview ? (
                                <Text fontSize="md" color="fg.tertiary" mt="4">
                                    {`Build your agent in ${totalSteps} steps`}
                                </Text>
                            ) : assistantFlow === "guided" ? (
                                <Box display="flex" flexDirection="column" gap="12" mt="12">
                                    <Box display="flex" alignItems="center" justifyContent="space-between" gap="12">
                                        <Box display="flex" alignItems="center" gap="12">
                                        {stepperItems.map((item) => {
                                            const isActive = item.step === wizardStep;
                                            const isDone = visitedSteps.includes(item.step) && completedSteps.has(item.step);
                                            return (
                                                <motion.div
                                                    key={item.step}
                                                    layoutId={isResizing ? undefined : `assistant-step-${item.step}`}
                                                    onClick={() => goToStepAndHighlight(item.step)}
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        width: "32px",
                                                        height: "32px",
                                                        borderRadius: "999px",
                                                        boxShadow: isActive ? "0 0 0 2px rgba(99,102,241,0.28)" : "none",
                                                        background: isDone
                                                            ? "rgba(3,166,93,0.08)"
                                                            : isActive
                                                              ? "rgba(91,92,235,0.18)"
                                                              : "rgba(91,92,235,0.10)",
                                                        color: isDone
                                                            ? "var(--ax-colors-fg-success)"
                                                            : "#5B5CEB",
                                                        cursor: "pointer",
                                                        fontSize: "16px",
                                                        fontWeight: 600,
                                                        flexShrink: 0,
                                                    }}
                                                    transition={isResizing ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                                                >
                                                    {isDone ? <IconCircleCheckAxiom size={18} /> : item.step}
                                                </motion.div>
                                            );
                                        })}
                                        </Box>
                                        <button
                                            type="button"
                                            onClick={exitGuide}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                padding: 0,
                                                margin: 0,
                                                color: "var(--ax-colors-fg-secondary)",
                                                cursor: "pointer",
                                                fontSize: "14px",
                                                fontWeight: 400,
                                                lineHeight: "20px",
                                                textDecoration: "underline",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            Exit guide
                                        </button>
                                    </Box>
                                </Box>
                            ) : null}
                        </Box>

                        {/* Scrollable body */}
                        <Box
                            style={{
                                flex: 1,
                                minHeight: 0,
                                overflow: "hidden",
                                position: "relative",
                                zIndex: 1,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                        <Box
                            px="16"
                            py="16"
                            display="flex"
                            flexDirection="column"
                            gap="16"
                            style={{
                                flex: 1,
                                minHeight: 0,
                                overflowY: "auto",
                            }}
                        >
                            {/* ── Landing screen ─────────────────────────── */}
                            {assistantFlow === "landing" && (
                                <Box display="flex" flexDirection="column" gap="32">
                                    <Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.55" }}>
                                        Need help setting up your agent? Choose a guide, template, or ask Opal.
                                    </Text>

                                    <Box
                                        display="flex"
                                        flexDirection="column"
                                        gap="16"
                                    >
                                        <Text fontWeight="500" fontSize="md" color="fg.default">
                                            Step-by-step guides
                                        </Text>
                                        <Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.5" }}>
                                            Follow the stitched setup flow to move from instructions to variables, tools, and preview without losing context.
                                        </Text>
                                        <Button appearance="inverse" size="sm" style={{ alignSelf: "flex-start" }} onClick={goToGuidedHome}>
                                            Explore guided setup
                                        </Button>
                                    </Box>

                                    <Box display="flex" flexDirection="column" gap="8">
                                        <Text fontWeight="500" fontSize="md" color="fg.default">
                                            Start with a template
                                        </Text>
                                        <Box display="flex" flexDirection="column" gap="6">
                                            {SUGGESTED_TEMPLATES.map((tmpl) => (
                                                <Box
                                                    key={tmpl.id}
                                                    style={{
                                                        background: "#fff",
                                                        border: "1px solid #dadfeb",
                                                        borderRadius: "12px",
                                                    }}
                                                >
                                                    <Box
                                                        display="flex"
                                                        alignItems="center"
                                                        gap="8"
                                                        onClick={() => setExpandedTemplate(expandedTemplate === tmpl.id ? null : tmpl.id)}
                                                        style={{ padding: "12px 14px", cursor: "pointer" }}
                                                    >
                                                        <Box
                                                            display="inline-flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            style={{
                                                                width: "28px",
                                                                height: "28px",
                                                                borderRadius: "999px",
                                                                background: "rgba(91,92,235,0.10)",
                                                                flexShrink: 0,
                                                                fontSize: "15px",
                                                            }}
                                                        >
                                                            {tmpl.emoji}
                                                        </Box>
                                                        <Text fontWeight="500" fontSize="md" color="fg.default" style={{ flex: 1 }}>
                                                            {tmpl.name}
                                                        </Text>
                                                        <Box
                                                            style={{
                                                                flexShrink: 0,
                                                                transition: "transform 0.15s ease",
                                                                transform: expandedTemplate === tmpl.id ? "rotate(90deg)" : "rotate(0deg)",
                                                                display: "flex",
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            <IconChevronRight size={14} color="var(--ax-colors-fg-tertiary)" />
                                                        </Box>
                                                    </Box>
                                                    {expandedTemplate === tmpl.id && (
                                                        <Box display="flex" flexDirection="column" gap="10" style={{ padding: "0 14px 14px" }}>
                                                            <Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.5" }}>
                                                                {tmpl.description}
                                                            </Text>
                                                            <Button
                                                                appearance="inverse"
                                                                size="md"
                                                                icon={<IconCircleCheckAxiom size={14} />}
                                                                style={{ alignSelf: "flex-start" }}
                                                                onClick={() => {
                                                                    onApplyTemplate(tmpl.prompt);
                                                                    setHasStartedGuidedFlow(true);
                                                                    setAssistantFlow("guided");
                                                                    setIsOverview(false);
                                                                    setWizardStep(1);
                                                                    setCheckerResult(null);
                                                                    setHasChecked(false);
                                                                }}
                                                            >
                                                                Apply Template
                                                            </Button>
                                                        </Box>
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>

                                    <Box
                                        display="flex"
                                        flexDirection="column"
                                        gap="8"
                                        style={{
                                            background: "radial-gradient(circle at 10% 20%, rgba(245,243,255,1) 0%, rgba(229,239,255,1) 61%, rgba(221,214,254,1) 85%)",
                                            borderRadius: "8px",
                                            padding: "12px 14px 14px",
                                            opacity: enhancePopoverOpen ? 0.4 : 1,
                                            pointerEvents: enhancePopoverOpen ? "none" : undefined,
                                            transition: "opacity 0.2s ease",
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" gap="8">
                                            <Image src="/opal-orb.png" alt="Opal" width={18} height={18} />
                                            <Text fontWeight="600" fontSize="md" style={{ color: "#080736" }}>
                                                Ask Opal to help you build
                                            </Text>
                                        </Box>
                                        <Textarea
                                            resize="none"
                                            value={assistantQuery}
                                            onChange={(event) => setAssistantQuery(event.target.value)}
                                            placeholder="Describe the agent you want to build, what it should do, or where you're stuck..."
                                            style={{ minHeight: "82px" }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                                    if (assistantQuery.trim()) onAskOpal?.(assistantQuery.trim());
                                                }
                                            }}
                                        />
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            <Text fontSize="sm" color="fg.tertiary">⌘↵ to send</Text>
                                            <Button
                                                appearance="primary"
                                                size="sm"
                                                disabled={!assistantQuery.trim()}
                                                onClick={() => onAskOpal?.(assistantQuery.trim())}
                                            >
                                                Send
                                            </Button>
                                        </Box>
                                    </Box>
                                    {documentationButton}
                                </Box>
                            )}

                            {/* ── Contextual assistance ───────────────────── */}
                            {assistantFlow === "contextual" && (
                                <Box display="flex" flexDirection="column" gap="32">
                                    {fromAi ? (
                                        <Alert intent="success">
                                            Your Agent is ready
                                        </Alert>
                                    ) : (
                                        <Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.55" }}>
                                            The prompt is the instruction that tells the agent exactly how to behave.
                                        </Text>
                                    )}

                                        <Box display="flex" flexDirection="column" gap="32">
                                            <SuggestedNextMovesCallout onOpenGuidedSetup={goToGuidedHome} />

                                            <Box display="flex" flexDirection="column" gap="10">
                                                <Text fontSize="md" fontWeight="500" color="fg.default" style={{ lineHeight: "1.4" }}>
                                                    Shortcuts
                                                </Text>
                                                <Box display="flex" flexDirection="column" gap="6">
                                                    {SHORTCUT_ITEMS.map((shortcut) => (
                                                        <Box key={shortcut.trigger} display="flex" gap="6" style={{ alignItems: "center", flexWrap: "wrap" }}>
                                                            <Text
                                                                fontSize="md"
                                                                color="fg.tertiary"
                                                                style={{ flexShrink: 0, lineHeight: "1", width: "8px" }}
                                                            >
                                                                •
                                                            </Text>
                                                            <Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.3" }}>
                                                                Type
                                                            </Text>
                                                            <Box
                                                                display="inline-flex"
                                                                alignItems="center"
                                                                justifyContent="center"
                                                                style={{
                                                                    width: "32px",
                                                                    height: "32px",
                                                                    padding: 0,
                                                                    borderRadius: "10px",
                                                                    border: "1px solid #c8d0e0",
                                                                    background: "#ffffff",
                                                                    boxShadow: "0 1px 0 rgba(46,52,66,0.04)",
                                                                    userSelect: "text",
                                                                }}
                                                            >
                                                                <Text
                                                                    fontSize="md"
                                                                    color="fg.secondary"
                                                                    style={{
                                                                        lineHeight: "1",
                                                                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                                                                    }}
                                                                >
                                                                    {shortcut.trigger}
                                                                </Text>
                                                            </Box>
                                                            <Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.3" }}>
                                                                {shortcut.label}
                                                            </Text>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        </Box>

                                    <Box display="flex" flexDirection="column" gap="8">
                                        <Text fontWeight="500" fontSize="md" color="fg.default">
                                            Common Actions
                                        </Text>
                                        <Box display="flex" gap="8" style={{ flexWrap: "wrap" }}>
                                            {COMMON_ACTIONS.map((action) => (
                                                <CommonActionCard
                                                    key={action.id}
                                                    action={action}
                                                    onInsert={() => onInsertToPrompt(`${action.prompt} | ${action.details}`)}
                                                />
                                            ))}
                                        </Box>
                                    </Box>

                                    <Box
                                        display="flex"
                                        flexDirection="column"
                                        gap="8"
                                            style={{
                                                background: "radial-gradient(circle at 10% 20%, rgba(245,243,255,1) 0%, rgba(229,239,255,1) 61%, rgba(221,214,254,1) 85%)",
                                                borderRadius: "8px",
                                                padding: "12px 14px 14px",
                                                opacity: enhancePopoverOpen ? 0.4 : 1,
                                                pointerEvents: enhancePopoverOpen ? "none" : undefined,
                                                transition: "opacity 0.2s ease",
                                            }}
                                        >
                                        <Box display="flex" alignItems="center" gap="8">
                                            <Image src="/opal-orb.png" alt="Opal" width={18} height={18} />
                                            <Text fontWeight="600" fontSize="md" style={{ color: "#080736" }}>
                                                Ask Opal to help you build
                                            </Text>
                                        </Box>
                                        <Textarea
                                            resize="none"
                                            value={assistantQuery}
                                            onChange={(event) => setAssistantQuery(event.target.value)}
                                            placeholder="Describe the agent you want to build, what it should do, or where you're stuck..."
                                            style={{ minHeight: "82px" }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                                    if (assistantQuery.trim()) onAskOpal?.(assistantQuery.trim());
                                                }
                                            }}
                                        />
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            <Text fontSize="sm" color="fg.tertiary">⌘↵ to send</Text>
                                            <Button
                                                appearance="primary"
                                                size="sm"
                                                disabled={!assistantQuery.trim()}
                                                onClick={() => onAskOpal?.(assistantQuery.trim())}
                                            >
                                                Send
                                            </Button>
                                        </Box>
                                    </Box>

                                    {hasStartedGuidedFlow && (
                                        <Box display="flex" justifyContent="flex-start">
                                            <Button appearance="subtle" size="sm" onClick={() => goToStepAndHighlight(wizardStep)}>
                                                Resume guided setup
                                            </Button>
                                        </Box>
                                    )}

                                        {documentationButton}
                                    </Box>
                            )}

                            {/* ── Guided overview ─────────────────────────── */}

                            {assistantFlow === "guided" && isOverview && (
                                <Box display="flex" flexDirection="column" gap="4">
                                    {/* Mode badge */}
                                    {multiTurnMode && (
                                        <Box
                                            display="inline-flex"
                                            alignItems="center"
                                            gap="4"
                                            style={{
                                                alignSelf: "flex-start",
                                                background: "rgba(99,102,241,0.08)",
                                                border: "1px solid rgba(99,102,241,0.20)",
                                                borderRadius: "20px",
                                                padding: "2px 10px",
                                                marginBottom: "4px",
                                            }}
                                        >
                                            <Text style={{ fontSize: "12px", fontWeight: 600, color: "#4338ca" }}>Multi-turn enabled</Text>
                                        </Box>
                                    )}
                                    {/* Stepper */}
                                    <Box display="flex" flexDirection="column" gap="2">
                                        {stepperItems.map((item) => (
                                            <Box
                                                key={item.step}
                                                display="flex"
                                                alignItems="center"
                                                gap="10"
                                                onClick={() => goToStepAndHighlight(item.step)}
                                                onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                                                    (e.currentTarget as HTMLElement).style.background = "#f5f6fa";
                                                    onWizardStepChange(item.step);
                                                }}
                                                onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
                                                    (e.currentTarget as HTMLElement).style.background = "transparent";
                                                }}
                                                style={{
                                                    padding: "10px 12px",
                                                    borderRadius: "8px",
                                                    cursor: "pointer",
                                                    transition: "background 0.15s",
                                                }}
                                            >
                                                {/* Number badge */}
                                                <motion.div
                                                    layoutId={isResizing ? undefined : `assistant-step-${item.step}`}
                                                    style={{
                                                        width: "32px",
                                                        height: "32px",
                                                        borderRadius: "50%",
                                                        background: "rgba(91,92,235,0.10)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        flexShrink: 0,
                                                    }}
                                                    transition={isResizing ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                                                >
                                                    <Text style={{ fontSize: "15px", fontWeight: 600, color: "#5B5CEB" }}>
                                                        {item.step}
                                                    </Text>
                                                </motion.div>
                                                {/* Labels */}
                                                <Box display="flex" flexDirection="column" style={{ flex: 1, gap: "1px" }}>
                                                    <Text fontWeight="500" fontSize="md" color="fg.default">
                                                        {item.label}
                                                    </Text>
                                                    <Text style={{ fontSize: "13px", color: "var(--ax-colors-fg-tertiary)", lineHeight: "1.4" }}>
                                                        {item.description}
                                                    </Text>
                                                </Box>
                                                <IconChevronRight size={14} color="var(--ax-colors-fg-tertiary)" style={{ flexShrink: 0 }} />
                                            </Box>
                                        ))}
                                    </Box>

                                    {/* Suggested Templates */}
                                    <Box display="flex" flexDirection="column" gap="8" style={{ marginTop: "16px" }}>
                                        <Text fontWeight="500" fontSize="md" color="fg.default">
                                            Suggested Templates
                                        </Text>
                                        <Box display="flex" flexDirection="column" gap="6">
                                            {SUGGESTED_TEMPLATES.map((tmpl) => (
                                                <Box
                                                    key={tmpl.id}
                                                    style={{
                                                        background: "#fff",
                                                        border: "1px solid #dadfeb",
                                                        borderRadius: "12px",
                                                    }}
                                                >
                                                    {/* Card header row */}
                                                    <Box
                                                        display="flex"
                                                        alignItems="center"
                                                        gap="8"
                                                        onClick={() => setExpandedTemplate(expandedTemplate === tmpl.id ? null : tmpl.id)}
                                                        style={{ padding: "12px 14px", cursor: "pointer" }}
                                                    >
                                                        <Text fontWeight="500" fontSize="md" color="fg.default" style={{ flex: 1 }}>
                                                            {tmpl.name}
                                                        </Text>
                                                        <Box
                                                            style={{
                                                                flexShrink: 0,
                                                                transition: "transform 0.15s ease",
                                                                transform: expandedTemplate === tmpl.id ? "rotate(90deg)" : "rotate(0deg)",
                                                                display: "flex",
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            <IconChevronRight size={14} color="var(--ax-colors-fg-tertiary)" />
                                                        </Box>
                                                    </Box>
                                                    {/* Expanded content */}
                                                    {expandedTemplate === tmpl.id && (
                                                        <Box
                                                            display="flex"
                                                            flexDirection="column"
                                                            gap="10"
                                                            style={{ padding: "0 14px 14px" }}
                                                        >
                                                            <Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.5" }}>
                                                                {tmpl.description}
                                                            </Text>
                                                            <Button
                                                                appearance="inverse"
                                                                size="md"
                                                                icon={<IconCircleCheckAxiom size={14} />}
                                                                style={{ alignSelf: "flex-start" }}
                                                                onClick={() => {
                                                                    onApplyTemplate(tmpl.prompt);
                                                                    setHasStartedGuidedFlow(true);
                                                                    setIsOverview(false);
                                                                    setWizardStep(1);
                                                                    setCheckerResult(null);
                                                                    setHasChecked(false);
                                                                }}
                                                            >
                                                                Apply Template
                                                            </Button>
                                                        </Box>
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                        <Box display="flex" justifyContent="flex-end">
                                            <Button appearance="subtle" size="md">
                                                Load more
                                            </Button>
                                        </Box>
                                        {documentationButton}
                                    </Box>
                                </Box>
                            )}

                            {/* ── Wizard step content ──────────────────────── */}
                            {assistantFlow === "guided" && !isOverview && (
                            <Box display="flex" flexDirection="column" gap="16">

                            {/* Step title */}
                            <Text fontWeight="500" fontSize="md" color="fg.default" style={{ lineHeight: "1.4" }}>
                                {currentStep.title}
                            </Text>

                            {/* Step 1 content */}
                            {wizardStep === 1 && (
                                <Box display="flex" flexDirection="column" gap="12">
                                    {currentStep.intro?.split("\n\n").map((para, i) => (
                                        <Text key={i} fontSize="md" color="fg.secondary" style={{ lineHeight: "1.55" }}>
                                            {para}
                                        </Text>
                                    ))}
                                    <Box display="flex" flexDirection="column" gap="6">
                                        {WIZARD_STEPS[0].bullets?.map((b, i) => (
                                            <Box key={i} display="flex" gap="8" style={{ alignItems: "flex-start" }}>
                                                <Text fontSize="md" color="fg.tertiary" style={{ flexShrink: 0, lineHeight: "1.55" }}>•</Text>
                                                <Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.55" }}>
                                                    <strong>{b.bold}:</strong> {b.text}
                                                </Text>
                                            </Box>
                                        ))}
                                    </Box>
                                    <KeyConceptCallout
                                        text={WIZARD_STEPS[0].keyConcept!}
                                        onViewExample={() => onOpenExample?.(1)}
                                    />
                                </Box>
                            )}

                            {/* Step 2 content */}
                            {wizardStep === 2 && (
                                <Box display="flex" flexDirection="column" gap="12">
                                    {currentStep.intro?.split("\n\n").map((para, i) => (
                                        <Text key={i} fontSize="md" color="fg.secondary" style={{ lineHeight: "1.55" }}>
                                            {para}
                                        </Text>
                                    ))}
                                    {/* Code snippet */}
                                    <Box
                                        style={{
                                            display: "inline-block",
                                            background: "#f5f6fa",
                                            border: "1px solid #dadfeb",
                                            borderRadius: "6px",
                                            padding: "4px 10px",
                                            fontFamily: "ui-monospace, 'Menlo', monospace",
                                            fontSize: "14px",
                                            color: "#2e3442",
                                            alignSelf: "flex-start",
                                        }}
                                    >
                                        {WIZARD_STEPS[1].codeSnippet}
                                    </Box>
                                    <KeyConceptCallout
                                        text={WIZARD_STEPS[1].keyConcept!}
                                        onViewExample={() => onOpenExample?.(2)}
                                    />
                                </Box>
                            )}

                            {/* Step 3 content */}
                            {wizardStep === 3 && (
                                <Box display="flex" flexDirection="column" gap="12">
                                    <Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.55" }}>
                                        {currentStep.intro}
                                    </Text>
                                    <Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.55" }}>
                                        {WIZARD_STEPS[2].keyConcept}
                                    </Text>
                                    {/* Tool suggestion cards */}
                                    <Box display="flex" flexDirection="column" gap="6">
                                        {suggestedTools.map((tool) => (
                                            <Box
                                                key={tool.name}
                                                display="flex"
                                                alignItems="center"
                                                gap="8"
                                                style={{
                                                    background: "#f5f6fa",
                                                    border: "1px solid #dadfeb",
                                                    borderRadius: "8px",
                                                    padding: "8px 12px",
                                                }}
                                                >
                                                <Box style={{ flex: 1 }}>
                                                    <Text fontSize="md" fontWeight="500" color="fg.default"
                                                        style={{ fontFamily: "ui-monospace, monospace" }}>
                                                        {tool.name}
                                                    </Text>
                                                    <Text style={{ fontSize: "13.5px", color: "#66708c", lineHeight: "1.4" }}>
                                                        {tool.description}
                                                    </Text>
                                                </Box>
                                                <Button
                                                    appearance="subtle"
                                                    size="md"
                                                    style={{ flexShrink: 0 }}
                                                    onClick={() => onAddTool(tool.name)}
                                                    disabled={addedTools.has(tool.name.toLowerCase())}
                                                >
                                                    {addedTools.has(tool.name.toLowerCase()) ? "Added" : "Add"}
                                                </Button>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Step 4 content */}
                            {wizardStep === (multiTurnMode ? 5 : 4) && (
                                <Box display="flex" flexDirection="column" gap="12">
                                    {/* Summary of what was built */}
                                    <Box
                                        display="flex"
                                        flexDirection="column"
                                        gap="6"
                                        style={{
                                            background: "#f5f6fa",
                                            border: "1px solid #dadfeb",
                                            borderRadius: "8px",
                                            padding: "12px",
                                        }}
                                    >
                                        <Text fontSize="md" fontWeight="500" color="fg.default">You've built an agent with:</Text>
                                        <Box display="flex" gap="6" style={{ alignItems: "flex-start" }}>
                                            <Text fontSize="md" color="fg.tertiary" style={{ flexShrink: 0 }}>•</Text>
                                            <Text fontSize="md" color="fg.secondary">
                                                <strong>Instructions:</strong> Written
                                            </Text>
                                        </Box>
                                        {variables.length > 0 && (
                                            <Box display="flex" gap="6" style={{ alignItems: "flex-start" }}>
                                                <Text fontSize="md" color="fg.tertiary" style={{ flexShrink: 0 }}>•</Text>
                                                <Text fontSize="md" color="fg.secondary">
                                                    <strong>Variable:</strong> [[{variables[0]?.name ?? "variable"}]]
                                                </Text>
                                            </Box>
                                        )}
                                    </Box>
                                    {currentStep.intro?.split("\n\n").map((para, i) => (
                                        <Text key={i} fontSize="md" color="fg.secondary" style={{ lineHeight: "1.55" }}>
                                            {para}
                                        </Text>
                                    ))}
                                </Box>
                            )}

                            {/* Step 4 content — multi-turn only */}
                            {wizardStep === 4 && multiTurnMode && (
                                <Box display="flex" flexDirection="column" gap="12">
                                    {currentStep.intro && (
                                        <Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.55" }}>
                                            {currentStep.intro}
                                        </Text>
                                    )}
                                    <Box display="flex" flexDirection="column" gap="8">
                                        {multiTurnInfoCards.map((item) => (
                                            <Box
                                                key={item.title}
                                                display="flex"
                                                flexDirection="column"
                                                gap="4"
                                                onMouseEnter={() => onAssistantFieldHover?.(
                                                    item.title === "System Prompt"
                                                        ? "system-prompt"
                                                        : item.title === "Memory Limit"
                                                          ? "memory-limit"
                                                          : "first-message"
                                                )}
                                                onMouseLeave={() => onAssistantFieldHover?.(null)}
                                                style={{
                                                    padding: "10px 12px",
                                                    borderRadius: "10px",
                                                    border: "1px solid #e9edf5",
                                                    background: "#ffffff",
                                                    cursor: "default",
                                                    transition: "border-color 0.2s ease, background-color 0.2s ease",
                                                }}
                                            >
                                                <Text fontSize="md" fontWeight="500" color="fg.default">
                                                    {item.title}
                                                </Text>
                                                <Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.5" }}>
                                                    {item.text}
                                                </Text>
                                            </Box>
                                        ))}
                                    </Box>
                                    <Box display="flex" flexDirection="column" gap="8">
                                        <Text fontSize="md" fontWeight="500" color="fg.default" style={{ paddingTop: "4px" }}>
                                            Dial In Memory Limit
                                        </Text>
                                        <Text
                                            fontSize="md"
                                            color="fg.secondary"
                                            style={{ lineHeight: "1.55" }}
                                        >
                                            How many turns the agent retains. Start at 10 and increase only if needed.
                                        </Text>
                                        <Box
                                            display="flex"
                                            gap="12"
                                            style={{
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            {memoryLevelCards.map((card) => (
                                                <Box
                                                    key={card.level}
                                                    display="flex"
                                                    flexDirection="column"
                                                    gap="8"
                                                    style={{
                                                        flex: "1 1 0",
                                                        minWidth: "112px",
                                                        padding: "14px 14px 16px",
                                                        borderRadius: "14px",
                                                        border: "1px solid #dadfeb",
                                                        background: "#f7f8fc",
                                                    }}
                                                >
                                                    <Text
                                                        fontSize="sm"
                                                        fontWeight="700"
                                                        style={{
                                                            color: card.accent,
                                                            letterSpacing: "0.08em",
                                                        }}
                                                    >
                                                        {card.level}
                                                    </Text>
                                                    <Text fontSize="lg" fontWeight="700" color="fg.default">
                                                        {card.range}
                                                    </Text>
                                                    <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.5" }}>
                                                        {card.details}
                                                    </Text>
                                                    <Box>
                                                        <Box
                                                            display="inline-flex"
                                                            alignItems="center"
                                                            style={{
                                                                padding: "6px 10px",
                                                                borderRadius: "10px",
                                                                background: card.chipBackground,
                                                            }}
                                                        >
                                                            <Text
                                                                fontSize="sm"
                                                                fontWeight="600"
                                                                style={{ color: card.accent }}
                                                            >
                                                                {card.chip}
                                                            </Text>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                    <KeyConceptCallout text={MULTITURN_STEP.keyConcept!} />
                                </Box>
                            )}

                            </Box>
                            )} {/* end !isOverview */}

                            {/* Common Actions — only when working on prompt (step 1) */}
                            {assistantFlow === "guided" && !isOverview && wizardStep === 1 && (
                            <Box display="flex" flexDirection="column" gap="8" style={{ marginTop: "8px" }}>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    gap="6"
                                    style={{ paddingTop: "8px" }}
                                >
                                    <Text fontWeight="500" fontSize="md" color="fg.default">
                                        Common Actions
                                    </Text>
                                </Box>
                                <Box display="flex" gap="8" style={{ flexWrap: "wrap" }}>
                                    {COMMON_ACTIONS.map((action) => (
                                        <CommonActionCard
                                            key={action.id}
                                            action={action}
                                            onInsert={() => onInsertToPrompt(`${action.prompt} | ${action.details}`)}
                                        />
                                    ))}
                                </Box>
                            </Box>
                            )} {/* end common actions */}

                            {/* Checker result (steps 1–2) */}
                            {assistantFlow === "guided" && !isOverview && hasChecked && checkerResult && wizardStep <= 2 && (
                                <Box style={{ marginTop: wizardStep === 1 ? "8px" : "0" }}>
                                    <CheckerCard result={checkerResult} />
                                </Box>
                            )}

                            {assistantFlow === "guided" && !isOverview && (
                                <Box style={{ marginTop: "16px" }}>
                                    {documentationButton}
                                </Box>
                            )}

                        </Box>

                            {assistantFlow === "guided" && !isOverview && (
                                <Box
                                    px="16"
                                    py="12"
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    gap="8"
                                    style={{
                                        flexShrink: 0,
                                        background: "var(--ax-colors-bg-default)",
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap="8">
                                        {wizardStep === 1 && (
                                            <Button
                                                size="md"
                                                icon={<IconCircleCheckAxiom size={14} />}
                                                onClick={handleCheck}
                                            >
                                                {hasChecked ? "Review Again" : "Review Instruction"}
                                            </Button>
                                        )}
                                        {wizardStep === 2 && (
                                            <Button
                                                size="md"
                                                icon={<IconCircleCheckAxiom size={14} />}
                                                onClick={handleCheck}
                                            >
                                                {hasChecked ? "Review Again" : "Review Variable"}
                                            </Button>
                                        )}
                                        {wizardStep === 3 && (
                                            <Button
                                                appearance="subtle"
                                                size="md"
                                                onClick={() => suggestedTools.forEach((t) => onAddTool(t.name))}
                                            >
                                                Add all
                                            </Button>
                                        )}
                                    </Box>
                                    <Box display="flex" alignItems="center" gap="8">
                                        {(wizardStep === 1 || wizardStep === 2 || wizardStep === 3 || (wizardStep === 4 && multiTurnMode)) && (
                                            <Button
                                                appearance="inverse"
                                                size="md"
                                                onClick={() => goToStep(wizardStep + 1)}
                                            >
                                                Next Step
                                            </Button>
                                        )}
                                        {wizardStep === (multiTurnMode ? 5 : 4) && (
                                            <Button
                                                appearance="inverse"
                                                size="md"
                                                onClick={onRunPreview}
                                            >
                                                Run Preview
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                    </LayoutGroup>
            )}
        </Box>
    );
}

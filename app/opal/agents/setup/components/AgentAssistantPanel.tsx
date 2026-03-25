"use client";

import { useState, useEffect } from "react";
import { Box, Text, Button } from "@optiaxiom/react";
import { IconChevronLeft, IconPlus, IconChevronRight, IconXmark, IconCircleCheck as IconCircleCheckAxiom, IconLightbulb } from "@optimizely/axiom-icons";
import {
    IconX,
    IconGripVertical,
    IconCircleCheck,
    IconAlertCircle,
} from "@tabler/icons-react";

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
        intro: "The instructions (also called the prompt template) are the most important part of any agent. They tell the AI exactly how to behave.\n\nGreat instructions include:",
        bullets: [
            { bold: "Role", text: `Who is the agent? ("You are a helpful customer support specialist...")` },
            { bold: "Task", text: `What should it do? ("Answer customer questions about our product...")` },
            { bold: "Guidelines", text: `How should it behave? ("Be friendly, concise, and accurate...")` },
            { bold: "Constraints", text: `What should it avoid? ("Don't make up information, don't discuss competitors...")` },
        ],
        keyConcept: `Think of it like writing a job description — the more specific you are, the better the results. You'll name your agent later. For now, focus on what it does.\n\nClick "Use Example" to see a well-structured template you can customize.`,
        checkLabel: "Check my instructions",
    },
    {
        step: 2,
        label: "Add an Input Variable",
        title: "Make your agent dynamic with variables",
        intro: "Right now, your agent has fixed instructions. But real agents need to handle different inputs each time they run.\n\nInput variables are placeholders in your instructions that get filled in when someone uses the agent. They use double bracket syntax:",
        codeSnippet: "[[variable_name]]",
        keyConcept: `Input variables use [[double_brackets]] syntax. They turn a static prompt into a reusable tool that handles different inputs every time.\n\nFor example, if your agent answers customer questions, you'd add a variable called customer_question and use it like:\n\n"Answer the following customer question: [[customer_question]]"\n\nYour task: Define a variable below, then update your instructions to include [[variable_name]] at least once.`,
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
        prompt: `Put this entire report (including the overall assessment and both tables) into an HTML file using the write_content_to_file tool. Ensure the tables are properly formatted in HTML. Then, convert this HTML file to a PDF using convert_to_pdf tool.`,
    },
    {
        id: "export-csv",
        name: "Export to CSV",
        description: "Save structured data from the output to a downloadable CSV file.",
        prompt: `Export the data as a CSV file using the write_content_to_file tool. Ensure all columns are properly formatted and include a header row.`,
    },
    {
        id: "send-email",
        name: "Send Email",
        description: "Send the agent's output via email to a specified recipient.",
        prompt: `Send the output via email using the send_email tool. Include a clear subject line and format the body content for readability.`,
    },
];

// ─── Suggested Templates Data ─────────────────────────────────────────────────

const SUGGESTED_TEMPLATES = [
    {
        id: "competitive-researcher",
        name: "Competitive Researcher",
        description: "Analyzes competitors and delivers structured insights on positioning, pricing, and strategy.",
        prompt: `You are a competitive intelligence researcher.\n\nAnalyze the following competitor: [[competitor]]\n\nProvide:\n1. Company overview and positioning\n2. Key products/services and pricing\n3. Strengths and weaknesses\n4. Strategic recommendations\n\nNever fabricate information. Cite sources where available.`,
    },
    {
        id: "seo-optimizer",
        name: "SEO Optimizer",
        description: "Reviews content and suggests improvements for better search engine visibility.",
        prompt: `You are an SEO expert.\n\nContent: [[content]]\nTarget keyword: [[keyword]]\n\nProvide:\n1. Keyword placement suggestions\n2. Meta description\n3. Header structure improvements\n4. Internal linking opportunities\n\nPrioritize by impact.`,
    },
    {
        id: "website-optimizer",
        name: "Website Optimizer",
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

function suggestTools(prompt: string): { name: string; description: string }[] {
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

function KeyConceptCallout({ text }: { text: string }) {
    return (
        <Box
            display="flex"
            gap="8"
            style={{
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.18)",
                borderRadius: "8px",
                padding: "10px 12px",
            }}
        >
            <IconLightbulb size={15} style={{ flexShrink: 0, marginTop: "2px", color: "#6366f1" }} />
            <Box display="flex" flexDirection="column" gap="4">
                <Text fontSize="sm" fontWeight="500" style={{ color: "#4338ca" }}>Key Concept:</Text>
                {text.split("\n").filter(Boolean).map((line, i) => (
                    <Text key={i} fontSize="sm" style={{ color: "#4f576e", lineHeight: "1.55" }}>
                        {line}
                    </Text>
                ))}
            </Box>
        </Box>
    );
}

function CheckerCard({ result, onNextStep }: { result: CheckerResult; onNextStep: () => void }) {
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
                        ? <IconCircleCheck size={13} color={passedColor} />
                        : <IconAlertCircle size={13} color={passedColor} />
                    }
                    <Text fontSize="sm" fontWeight="500" style={{ color: passedColor }}>
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
                            ? <IconCircleCheck size={16} color={passedColor} />
                            : <IconAlertCircle size={16} color={passedColor} />
                        }
                        <Text fontWeight="600" fontSize="md" style={{ color: passedColor }}>
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
                        <Text fontWeight="600" fontSize="sm" style={{ color: passedColor }}>
                            {result.total}/{result.maxTotal}
                        </Text>
                    </Box>
                </Box>

                {/* Summary text */}
                <Text fontSize="sm" style={{ color: passedColor, lineHeight: "1.55" }}>
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
                                    <Text style={{ fontSize: "9px", fontWeight: 700, color: catPassed ? "#166534" : "#92400e" }}>
                                        {cat.key}
                                    </Text>
                                </Box>
                                {/* Label */}
                                <Text fontSize="sm" style={{ flex: 1, color: "#4f576e", minWidth: 0 }}>{cat.label}</Text>
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
                                <Text style={{ fontSize: "11px", color: "#4f576e", width: "24px", textAlign: "right", flexShrink: 0 }}>
                                    {cat.score}
                                </Text>
                                {/* Check circle */}
                                {catPassed
                                    ? <IconCircleCheck size={13} color="#16a34a" style={{ flexShrink: 0 }} />
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
                                <Text style={{ color: passedColor, fontSize: "12px", flexShrink: 0, lineHeight: "1.6" }}>–</Text>
                                <Text style={{ fontSize: "12px", color: passedColor, lineHeight: "1.6" }}>{s}</Text>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            {/* Next Step button */}
            <Button
                appearance="inverse"
                size="sm"
                style={{ alignSelf: "flex-start" }}
                onClick={onNextStep}
            >
                Next Step →
            </Button>
        </Box>
    );
}

function CommonActionCard({
    action,
    isExpanded,
    onToggle,
    onInsert,
}: {
    action: typeof COMMON_ACTIONS[0];
    isExpanded: boolean;
    onToggle: () => void;
    onInsert: () => void;
}) {
    return (
        <Box
            draggable
            onDragStart={(e: React.DragEvent) => {
                e.dataTransfer.setData("text/plain", action.prompt);
                e.dataTransfer.effectAllowed = "copy";
            }}
            style={{
                background: "#ffffff",
                border: "1px solid #e9edf5",
                borderRadius: "12px",
                cursor: "grab",
            }}
        >
            {/* Collapsed row */}
            <Box
                display="flex"
                alignItems="center"
                gap="8"
                style={{ padding: "10px 12px", cursor: "pointer" }}
                onClick={onToggle}
            >
                <IconGripVertical
                    size={16}
                    color="var(--ax-colors-fg-tertiary)"
                    style={{ flexShrink: 0, cursor: "grab" }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                />
                <Text fontSize="sm" color="fg.default" style={{ flex: 1, fontWeight: 500 }}>
                    {action.name}
                </Text>
                <Button
                    appearance="subtle"
                    size="sm"
                    icon={<IconPlus size={13} />}
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onInsert(); }}
                    style={{ flexShrink: 0 }}
                >
                    Add to prompt
                </Button>
                <Box
                    style={{
                        flexShrink: 0,
                        transition: "transform 0.15s ease",
                        transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <IconChevronRight size={14} color="var(--ax-colors-fg-tertiary)" />
                </Box>
            </Box>

            {/* Expanded content */}
            {isExpanded && (
                <Box
                    display="flex"
                    flexDirection="column"
                    gap="10"
                    style={{ padding: "0 12px 12px 12px" }}
                >
                    <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.5" }}>
                        {action.description}
                    </Text>
                    {/* Prompt capsule */}
                    <Box
                        style={{
                            background: "#f5f6fa",
                            border: "1px solid #dadfeb",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            fontFamily: "ui-monospace, 'Menlo', monospace",
                            fontSize: "11.5px",
                            color: "#4f576e",
                            lineHeight: "1.55",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}
                    >
                        {action.prompt}
                    </Box>
                </Box>
            )}
        </Box>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface AgentAssistantPanelProps {
    isOpen: boolean;
    onClose: () => void;
    view: "assistant" | "guide";
    onViewChange: (v: "assistant" | "guide") => void;
    promptTemplate: string;
    variables: any[];
    onInsertToPrompt: (text: string) => void;
    onApplyTemplate: (prompt: string) => void;
    activeFieldStep: number | null;
    onWizardStepChange: (step: number) => void;
    onRunPreview?: () => void;
    multiTurnMode?: boolean;
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
    promptTemplate,
    variables,
    onInsertToPrompt,
    onApplyTemplate,
    activeFieldStep,
    onWizardStepChange,
    onRunPreview,
    multiTurnMode = false,
}: AgentAssistantPanelProps) {
    const [isOverview, setIsOverview] = useState(true);
    const [wizardStep, setWizardStep] = useState(1);
    const [checkerResult, setCheckerResult] = useState<CheckerResult | null>(null);
    const [hasChecked, setHasChecked] = useState(false);
    const [expandedAction, setExpandedAction] = useState<string | null>(null);
    const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

    // Field focus → wizard step sync (exits overview)
    useEffect(() => {
        if (activeFieldStep !== null && activeFieldStep !== undefined) {
            setIsOverview(false);
            setWizardStep(activeFieldStep);
            setCheckerResult(null);
            setHasChecked(false);
        }
    }, [activeFieldStep]);

    const goToStep = (step: number) => {
        setIsOverview(false);
        setWizardStep(step);
        setCheckerResult(null);
        setHasChecked(false);
        onWizardStepChange(step);
    };

    const goToOverview = () => {
        setIsOverview(true);
        setCheckerResult(null);
        setHasChecked(false);
    };

    const handleCheck = () => {
        if (wizardStep === 1) setCheckerResult(evaluateStep1(promptTemplate));
        else if (wizardStep === 2) setCheckerResult(evaluateStep2(promptTemplate, variables));
        setHasChecked(true);
    };

    const totalSteps = multiTurnMode ? 5 : 4;
    const allSteps = multiTurnMode ? [...WIZARD_STEPS, MULTITURN_STEP] : WIZARD_STEPS;
    const currentStep = allSteps[wizardStep - 1] ?? WIZARD_STEPS[0];
    const suggestedTools = wizardStep === 3 ? suggestTools(promptTemplate) : [];

    const stepperItems = [
        { step: 1, label: "Write Instructions", description: "Define your agent's role and behavior" },
        { step: 2, label: "Add an Input Variable", description: "Make your agent dynamic with [[variables]]" },
        { step: 3, label: "Add Tools", description: "Extend your agent with actions and integrations" },
        { step: 4, label: "See It Live", description: "Test your agent with real inputs" },
        ...(multiTurnMode ? [{ step: 5, label: "Multi-Turn Settings", description: "System prompt, memory limit & first message" }] : []),
    ];

    return (
        <Box
            style={{
                width: isOpen ? "348px" : "0px",
                transition: "width 0.3s ease-in-out",
                overflow: "hidden",
                display: "flex",
                flexShrink: 0,
                padding: isOpen ? "16px 16px 16px 0" : "0",
                alignItems: "flex-start",
            }}
        >
            {isOpen && (
                view === "guide" ? (
                    /* ── Guide view ─────────────────────────────────────── */
                    <Box
                        display="flex"
                        flexDirection="column"
                        style={{
                            flex: 1,
                            border: "1px solid var(--ax-colors-border-secondary)",
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                            backgroundColor: "var(--ax-colors-bg-default)",
                            overflow: "hidden",
                            maxHeight: "calc(100vh - 112px)",
                        }}
                    >
                        <Box
                            px="16"
                            py="12"
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}
                        >
                            <Box display="flex" alignItems="center" gap="4">
                                <Button
                                    appearance="subtle"
                                    size="sm"
                                    icon={<IconChevronLeft size={16} />}
                                    aria-label="Back to assistant"
                                    onClick={() => onViewChange("assistant")}
                                />
                                <Text fontWeight="500" fontSize="md" color="fg.default">
                                    Quick-start guide
                                </Text>
                            </Box>
                            <Button
                                appearance="subtle"
                                size="sm"
                                icon={<IconX size={16} />}
                                aria-label="Close panel"
                                onClick={onClose}
                            />
                        </Box>
                        <Box style={{ flex: 1, overflow: "hidden" }}>
                            <iframe
                                src="/agent-cheat-sheet.html"
                                style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                                title="Multi-turn agent quick-start guide"
                            />
                        </Box>
                    </Box>
                ) : (
                    /* ── Wizard / Assistant view ─────────────────────────── */
                    <Box
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
                            maxHeight: "calc(100vh - 112px)",
                        }}
                    >
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
                                {isOverview && (
                                    <IconLightbulb size={18} style={{ flexShrink: 0, color: "var(--ax-colors-fg-tertiary)", marginRight: "6px" }} />
                                )}
                                <Text fontWeight="500" fontSize="md" color="fg.default" style={{ flex: 1 }}>
                                    Agent Setup Assistant
                                </Text>
                                <Button
                                    appearance="subtle"
                                    size="sm"
                                    icon={<IconXmark size={16} />}
                                    aria-label="Close assistant"
                                    onClick={onClose}
                                />
                            </Box>
                            {/* Step / subtitle row */}
                            <Box display="flex" alignItems="center" gap="4">
                                {!isOverview && (
                                    <Button
                                        appearance="subtle"
                                        size="sm"
                                        icon={<IconChevronLeft size={16} />}
                                        aria-label="Back"
                                        style={{ marginLeft: "-6px" }}
                                        onClick={() => wizardStep > 1 ? goToStep(wizardStep - 1) : goToOverview()}
                                    />
                                )}
                                <Text fontSize="sm" color="fg.tertiary">
                                    {isOverview
                                        ? `Build your first agent in ${totalSteps} steps`
                                        : `Step ${wizardStep} of ${totalSteps} · ${currentStep.label}`}
                                </Text>
                            </Box>
                        </Box>

                        {/* Scrollable body */}
                        <Box
                            px="16"
                            py="16"
                            display="flex"
                            flexDirection="column"
                            gap="16"
                            style={{
                                flex: 1,
                                overflowY: "auto",
                                position: "relative",
                                zIndex: 1,
                            }}
                        >
                            {/* ── Overview screen ─────────────────────────── */}
                            {isOverview && (
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
                                            <Text style={{ fontSize: "11px", fontWeight: 600, color: "#4338ca" }}>Multi-turn enabled</Text>
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
                                                onClick={() => {
                                                    onWizardStepChange(item.step);
                                                    goToStep(item.step);
                                                }}
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
                                                <Box
                                                    style={{
                                                        width: "24px",
                                                        height: "24px",
                                                        borderRadius: "50%",
                                                        background: "rgba(99,102,241,0.1)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <Text style={{ fontSize: "11px", fontWeight: 700, color: "#4338ca" }}>
                                                        {item.step}
                                                    </Text>
                                                </Box>
                                                {/* Labels */}
                                                <Box display="flex" flexDirection="column" style={{ flex: 1, gap: "1px" }}>
                                                    <Text fontWeight="500" fontSize="sm" color="fg.default">
                                                        {item.label}
                                                    </Text>
                                                    <Text style={{ fontSize: "12px", color: "var(--ax-colors-fg-tertiary)", lineHeight: "1.4" }}>
                                                        {item.description}
                                                    </Text>
                                                </Box>
                                                <IconChevronRight size={14} color="var(--ax-colors-fg-tertiary)" style={{ flexShrink: 0 }} />
                                            </Box>
                                        ))}
                                    </Box>

                                    {/* Suggested Templates */}
                                    <Box display="flex" flexDirection="column" gap="8" style={{ marginTop: "16px" }}>
                                        <Text fontWeight="500" fontSize="sm" color="fg.default">
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
                                                        <Text fontWeight="500" fontSize="sm" color="fg.default" style={{ flex: 1 }}>
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
                                                            <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.5" }}>
                                                                {tmpl.description}
                                                            </Text>
                                                            <Button
                                                                appearance="inverse"
                                                                size="sm"
                                                                icon={<IconCircleCheckAxiom size={14} />}
                                                                style={{ alignSelf: "flex-start" }}
                                                                onClick={() => {
                                                                    onApplyTemplate(tmpl.prompt);
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
                                            <Button appearance="subtle" size="sm">
                                                Load more
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            )}

                            {/* ── Wizard step content ──────────────────────── */}
                            {!isOverview && (
                            <Box display="flex" flexDirection="column" gap="16">

                            {/* Step title */}
                            <Text fontWeight="600" fontSize="md" color="fg.default" style={{ lineHeight: "1.4" }}>
                                {currentStep.title}
                            </Text>

                            {/* Step 1 content */}
                            {wizardStep === 1 && (
                                <Box display="flex" flexDirection="column" gap="12">
                                    {currentStep.intro?.split("\n\n").map((para, i) => (
                                        <Text key={i} fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.55" }}>
                                            {para}
                                        </Text>
                                    ))}
                                    <Box display="flex" flexDirection="column" gap="6">
                                        {WIZARD_STEPS[0].bullets?.map((b, i) => (
                                            <Box key={i} display="flex" gap="8" style={{ alignItems: "flex-start" }}>
                                                <Text fontSize="sm" color="fg.tertiary" style={{ flexShrink: 0, lineHeight: "1.55" }}>•</Text>
                                                <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.55" }}>
                                                    <strong>{b.bold}:</strong> {b.text}
                                                </Text>
                                            </Box>
                                        ))}
                                    </Box>
                                    <KeyConceptCallout text={WIZARD_STEPS[0].keyConcept!} />
                                    {!hasChecked && (
                                        <Button appearance="inverse"
                                        style={{ alignSelf: "flex-start" }} size="sm" onClick={handleCheck}>
                                            {currentStep.checkLabel}
                                        </Button>
                                    )}
                                </Box>
                            )}

                            {/* Step 2 content */}
                            {wizardStep === 2 && (
                                <Box display="flex" flexDirection="column" gap="12">
                                    {currentStep.intro?.split("\n\n").map((para, i) => (
                                        <Text key={i} fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.55" }}>
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
                                            fontSize: "13px",
                                            color: "#2e3442",
                                            alignSelf: "flex-start",
                                        }}
                                    >
                                        {WIZARD_STEPS[1].codeSnippet}
                                    </Box>
                                    <KeyConceptCallout text={WIZARD_STEPS[1].keyConcept!} />
                                    {!hasChecked && (
                                        <Button appearance="inverse"
                                        style={{ alignSelf: "flex-start" }} size="sm" onClick={handleCheck}>
                                            {currentStep.checkLabel}
                                        </Button>
                                    )}
                                </Box>
                            )}

                            {/* Step 3 content */}
                            {wizardStep === 3 && (
                                <Box display="flex" flexDirection="column" gap="12">
                                    <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.55" }}>
                                        {currentStep.intro}
                                    </Text>
                                    <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.55" }}>
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
                                                    <Text fontSize="sm" fontWeight="500" color="fg.default"
                                                        style={{ fontFamily: "ui-monospace, monospace" }}>
                                                        {tool.name}
                                                    </Text>
                                                    <Text style={{ fontSize: "11.5px", color: "#66708c", lineHeight: "1.4" }}>
                                                        {tool.description}
                                                    </Text>
                                                </Box>
                                                <Button
                                                    appearance="subtle"
                                                    size="sm"
                                                    style={{ flexShrink: 0 }}
                                                    onClick={() => onInsertToPrompt(tool.snippet)}
                                                >
                                                    Add to prompt
                                                </Button>
                                            </Box>
                                        ))}
                                    </Box>
                                    {/* Add all + Next Step row */}
                                    <Box display="flex" alignItems="center" gap="8">
                                        <Button
                                            appearance="subtle"
                                            size="sm"
                                            onClick={() => suggestedTools.forEach(t => onInsertToPrompt(t.snippet))}
                                        >
                                            Add all
                                        </Button>
                                        <Button
                                            appearance="inverse"
                                            size="sm"
                                            onClick={() => goToStep(4)}
                                        >
                                            Next Step →
                                        </Button>
                                    </Box>
                                </Box>
                            )}

                            {/* Step 4 content */}
                            {wizardStep === 4 && (
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
                                        <Text fontSize="sm" fontWeight="500" color="fg.default">You've built an agent with:</Text>
                                        <Box display="flex" gap="6" style={{ alignItems: "flex-start" }}>
                                            <Text fontSize="sm" color="fg.tertiary" style={{ flexShrink: 0 }}>•</Text>
                                            <Text fontSize="sm" color="fg.secondary">
                                                <strong>Instructions:</strong> Written
                                            </Text>
                                        </Box>
                                        {variables.length > 0 && (
                                            <Box display="flex" gap="6" style={{ alignItems: "flex-start" }}>
                                                <Text fontSize="sm" color="fg.tertiary" style={{ flexShrink: 0 }}>•</Text>
                                                <Text fontSize="sm" color="fg.secondary">
                                                    <strong>Variable:</strong> [[{variables[0]?.name ?? "variable"}]]
                                                </Text>
                                            </Box>
                                        )}
                                    </Box>
                                    {currentStep.intro?.split("\n\n").map((para, i) => (
                                        <Text key={i} fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.55" }}>
                                            {para}
                                        </Text>
                                    ))}
                                    <Box display="flex" gap="8" alignItems="center">
                                        <Button
                                            appearance="inverse"
                                            style={{ alignSelf: "flex-start" }}
                                            size="sm"
                                            onClick={onRunPreview}
                                        >
                                            Run Preview
                                        </Button>
                                        {multiTurnMode && (
                                            <Button
                                                appearance="subtle"
                                                size="sm"
                                                onClick={() => goToStep(5)}
                                            >
                                                Configure multi-turn →
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            )}

                            {/* Step 5 content — multi-turn only */}
                            {wizardStep === 5 && multiTurnMode && (
                                <Box display="flex" flexDirection="column" gap="12">
                                    {currentStep.intro && (
                                        <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.55" }}>
                                            {currentStep.intro}
                                        </Text>
                                    )}
                                    <Box display="flex" flexDirection="column" gap="6">
                                        {MULTITURN_STEP.bullets?.map((b, i) => (
                                            <Box key={i} display="flex" gap="8" style={{ alignItems: "flex-start" }}>
                                                <Text fontSize="sm" color="fg.tertiary" style={{ flexShrink: 0, lineHeight: "1.55" }}>•</Text>
                                                <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.55" }}>
                                                    <strong>{b.bold}:</strong> {b.text}
                                                </Text>
                                            </Box>
                                        ))}
                                    </Box>
                                    <KeyConceptCallout text={MULTITURN_STEP.keyConcept!} />
                                    {/* Quick-jump buttons */}
                                    <Box display="flex" flexDirection="column" gap="6">
                                        <Text fontSize="sm" fontWeight="500" color="fg.default">Jump to field</Text>
                                        {[
                                            { label: "System Prompt", step: 3 },
                                            { label: "Memory Limit", step: 4 },
                                            { label: "First Message", step: 5 },
                                        ].map((item) => (
                                            <Box
                                                key={item.label}
                                                display="flex"
                                                alignItems="center"
                                                gap="8"
                                                onClick={() => onWizardStepChange(item.step)}
                                                onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                                                    (e.currentTarget as HTMLElement).style.background = "#f5f6fa";
                                                }}
                                                onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
                                                    (e.currentTarget as HTMLElement).style.background = "transparent";
                                                }}
                                                style={{
                                                    padding: "8px 10px",
                                                    borderRadius: "8px",
                                                    cursor: "pointer",
                                                    transition: "background 0.15s",
                                                    border: "1px solid #e9edf5",
                                                }}
                                            >
                                                <Text fontSize="sm" fontWeight="500" color="fg.default" style={{ flex: 1 }}>
                                                    {item.label}
                                                </Text>
                                                <IconChevronRight size={13} color="var(--ax-colors-fg-tertiary)" />
                                            </Box>
                                        ))}
                                    </Box>
                                    <Button
                                        appearance="inverse"
                                        size="sm"
                                        style={{ alignSelf: "flex-start" }}
                                        onClick={() => onWizardStepChange(3)}
                                    >
                                        Start with System Prompt →
                                    </Button>
                                </Box>
                            )}

                            {/* Checker result (steps 1–2) */}
                            {hasChecked && checkerResult && wizardStep <= 2 && (
                                <CheckerCard result={checkerResult} onNextStep={() => goToStep(wizardStep + 1)} />
                            )}

                            </Box>
                            )} {/* end !isOverview */}

                            {/* Common Actions — only when working on prompt (step 1) */}
                            {!isOverview && wizardStep === 1 && (
                            <Box display="flex" flexDirection="column" gap="8" style={{ marginTop: "8px" }}>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    gap="6"
                                    style={{ paddingTop: "8px" }}
                                >
                                    <Text fontWeight="500" fontSize="sm" color="fg.default">
                                        Common Actions
                                    </Text>
                                </Box>
                                <Box display="flex" flexDirection="column" gap="6">
                                    {COMMON_ACTIONS.map((action) => (
                                        <CommonActionCard
                                            key={action.id}
                                            action={action}
                                            isExpanded={expandedAction === action.id}
                                            onToggle={() =>
                                                setExpandedAction(
                                                    expandedAction === action.id ? null : action.id
                                                )
                                            }
                                            onInsert={() => onInsertToPrompt(action.prompt)}
                                        />
                                    ))}
                                </Box>
                            </Box>
                            )} {/* end common actions */}
                        </Box>
                    </Box>
                )
            )}
        </Box>
    );
}

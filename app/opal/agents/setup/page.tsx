"use client";

import {
    Box,
    Heading,
    Text,
    Button,
    Alert,
    Textarea,
    Switch,
    Field,
    Disclosure,
    DisclosureTrigger,
    DisclosureContent,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Breadcrumb,
    Tooltip,
    Card,
    Badge,
    Link,
    Avatar,
    Menu,
    MenuTrigger,
    MenuContent,
    LabelMenuButton,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    Select,
    SelectTrigger,
    SelectContent,
    Progress,
    Input,
} from "@optiaxiom/react";
import {
    HoverCard,
    HoverCardTrigger,
    HoverCardContent,
} from "@optiaxiom/react/unstable";
import {
    IconHelp,
    IconSparkles,
    IconDots,
    IconX,
    IconCopy,
} from "@tabler/icons-react";
import {
    IconFileImport,
    IconPlay,
    IconClockRotateLeft,
    IconCircleCheck,
    IconCircleExclamation,
    IconTriangleExclamation,
    IconInputText,
    IconInputNumeric,
    IconBracketsCurly,
    IconCalendar,
    IconToggleOff,
    IconFile,
    IconBracketsSquare,
    IconEllipsisSolid,
    IconCircleQuestion,
    IconShieldCheck,
    IconEye,
    IconBook,
    IconLightbulb,
    IconChevronRight,
    IconChevronLeft,
    IconLink,
    IconPen,
    IconPlus,
    IconTrashCan,
} from "@optimizely/axiom-icons";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useLayout } from "@/app/context/LayoutContext";
import { Range, FileUpload, FileUploadDropzone } from "@optiaxiom/react/unstable";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import type { Version } from "./components/VersionHistory";
import { AgentAssistantPanel } from "./components/AgentAssistantPanel";
import { ResizableDetailsTray } from "./components/ResizableDetailsTray";

const VersionHistory = dynamic(
    () => import("./components/VersionHistory").then((mod) => mod.VersionHistory),
    { ssr: false }
);
const VersionPreviewBanner = dynamic(
    () => import("./components/VersionPreviewBanner").then((mod) => mod.VersionPreviewBanner)
);
const ComparisonBanner = dynamic(
    () => import("./components/ComparisonBanner").then((mod) => mod.ComparisonBanner)
);
const FieldComparison = dynamic(
    () => import("./components/FieldComparison").then((mod) => mod.FieldComparison)
);
const TestRunTray = dynamic(
    () => import("./components/TestRunTray").then((mod) => mod.TestRunTray),
    { ssr: false }
);

// Emoji lookup for agent avatars
const AGENT_EMOJIS: Record<string, string> = {
    "email-campaign": "✍️",
    "optimize-geo": "🌐",
    "analyze-competitors": "📊",
    "ab-experiment": "⚗️",
    "content-calendar": "📅",
    "ad-variations": "🎨",
    "seo-audit": "🔎",
    "social-media-strategy": "📱",
    "content-localizer": "🌍",
    "heatmap-analysis": "🔥",
    "experiment-planning": "🧪",
    "geo-recommendations": "📡",
    "resource-manager": "👥",
    "seo-keyword-research": "🔑",
    "cmp-workflow": "⚙️",
    "meeting-synthesizer": "📝",
};

// Mock data for agents
const MOCK_AGENTS_DATA: Record<string, any> = {
    "content-localizer": {
        name: "Content Localizer",
        agentId: "content_localizer",
        description: "Localize your content with specific regional context while maintaining brand voice.",
        promptTemplate: "You are a localization expert. Your task is to adapt the provided content for the target region: [[region]].\n\n{Instruction}\n- Use local terminology and cultural references.\n- Maintain the original brand voice and tone.\n- Ensure the length remains similar to the original.\n\nContent to localize: [[content]]\n\n`Translate` `Style Guide Checker`",
        tools: "Translate, Style Guide Checker, Regional Thesaurus",
        variables: [
            { name: "region", description: "The country or area to localize for", type: "String", required: true },
            { name: "content", description: "The text that needs localization", type: "String", required: true }
        ],
        creativity: 30
    },
    "heatmap-analysis": {
        name: "Heatmap Analysis",
        agentId: "heatmap_analysis",
        description: "Transforms a provided heatmap image and url into precise, tailored test ideas.",
        promptTemplate: "Analyze the attached heatmap image and the corresponding URL: [[url]].\n\n{RAG}\nIdentify patterns in user behavior from recent sessions.\n\n{Instruction}\n1. Areas of high friction (low engagement where expected)\n2. Elements causing confusion\n3. Opportunities for A/B testing\n\nProvide 3 specific test hypotheses based on the visual data using `Image Recognition`.",
        tools: "Image Recognition, Analytics Connector, Test Idea Lab",
        variables: [
            { name: "url", description: "The webpage URL matching the heatmap", type: "String", required: true },
            { name: "heatmap_image", description: "The uploaded heatmap screenshot", type: "File", required: true }
        ],
        creativity: 50
    },
    "experiment-planning": {
        name: "Experiment Planning Agent",
        agentId: "test_planning",
        description: "Transforms your raw ideas into a fully-formed test plan.",
        promptTemplate: "Based on the raw idea: [[raw_idea]], generate a comprehensive experiment plan.\n\n{Instruction}\nInclude:\n- Primary Hypothesis\n- Success Metrics (Primary & Secondary)\n- Target Audience\n- Estimated Duration\n- Technical Implementation Notes\n\nUse `Stats Calculator` to estimate duration.",
        tools: "Stats Calculator, Audience Segmenter, Jira Integrator",
        variables: [
            { name: "raw_idea", description: "The initial thought or problem statement", type: "String", required: true },
            { name: "previous_results", description: "Link to relevant past experiments", type: "String", required: false }
        ],
        creativity: 60
    },
    "geo-recommendations": {
        name: "GEO Recommendations",
        agentId: "geo_recommendations",
        description: "Provide recommendations based on geographic data.",
        promptTemplate: "Based on the location: [[location]], provide top recommendations.\n\nContent: [[content]]",
        tools: "Geo Service",
        variables: [
            { name: "location", description: "User's location", type: "String", required: true },
            { name: "content", description: "What to recommend", type: "String", required: true }
        ],
        creativity: 40
    },
    "market-analyzer": {
        name: "Market Analyzer",
        agentId: "market_analyzer",
        description: "Analyzes market trends for a specific region.",
        promptTemplate: "Analyze market trends for [[market]].\n\n{Instruction}\nFocus on:\n- Top competitors\n- Growth opportunities",
        tools: "Market Data Tool",
        variables: [
            { name: "market", description: "Target market (e.g. US, UK)", type: "String", required: true }
        ],
        creativity: 45
    },
    "meeting-synthesizer": {
        name: "Meeting Synthesizer",
        agentId: "meeting_synthesizer",
        description: "Summarize your meeting transcripts into actionable items.",
        promptTemplate: "Process the meeting transcript: [[transcript]].\n\n{Instruction}\nExtract:\n- Executive Summary\n- Key Decisions Made\n- Action Items (assigned to owner if mentioned)\n- Unresolved Questions\n\nUse `Natural Language Processor` for extraction.",
        tools: "Natural Language Processor, Slack Notifier, Task Creator",
        variables: [
            { name: "transcript", description: "The raw text of the meeting", type: "String", required: true }
        ],
        creativity: 25
    }
};

const PROMPT_TEMPLATE_PLACEHOLDER = [
    {
        title: "Role: 🕵️",
        body: "You are a market research analyst, responsible for conducting 30-day competitor and market research. You will monitor competitor activities, industry trends, and keyword opportunities, and synthesize your findings into a 30-day Competitive Intelligence Report with clear, actionable recommendations for marketing and sales.",
    },
    {
        title: "Goal: 🎯",
        body: "To assist users in generating on-brand, impactful content and strategies, making their work easier and more effective.",
    },
    {
        title: "Instruction Steps: 👇",
        body: "1. First, I'll carefully read your request to grasp the core task, desired tone, and any specific requirements.\n2. I'll access relevant information from our knowledge base (like product messaging or competitor intel) and past conversations to ensure context-aware and personalized responses.\n3. I'll generate content or suggestions that directly address your needs, always keeping your brand and your objectives in mind.\n4. Before presenting, I'll double-check for clarity, accuracy, and adherence to all your specifications.",
    },
    {
        title: "Output Specification: 📝",
        body: "Your response will be clear, concise, and actionable, delivered in a format that's easy to understand and use. I'll use Markdown for structure, and if applicable, I'll include relevant links or suggestions for next steps. Expect a friendly and professional tone. Here’s the example of how the output should be formatted.",
    },
];

const TOOL_DESCRIPTIONS: Record<string, string> = {
    send_email: "Send emails directly from your agent",
    convert_to_pdf: "Convert agent output to PDF format",
    web_search: "Search the web for live information",
    write_content_to_file: "Save output to a file",
    take_screenshot: "Capture a screenshot when needed",
    translate: "Translates text between languages with context awareness",
    "style-guide-checker": "Validates content against brand style guidelines and tone",
    "regional-thesaurus": "Provides region-specific synonyms and terminology alternatives",
    "Style Guide Checker": "Validates content against brand style guidelines and tone",
    "Regional Thesaurus": "Provides region-specific synonyms and terminology alternatives",
    "Email Validator": "Checks email content for formatting and delivery-readiness",
    "Template Gallery": "Provides reusable content templates for agent output",
};

const PROMPT_ACTION_DETAILS: Record<string, string> = {
    "Create PDF": "Export the full agent output as a formatted PDF document.",
    "Export to CSV": "Save structured data from the output to a downloadable CSV file.",
    "Send Email": "Send the agent's output via email to a specified recipient.",
};

const GUIDE_EXAMPLES = {
    1: {
        title: "Prompt example (Agent Instruction)",
        body: `You are a friendly customer support agent for Acme Software.

Task: Answer customer questions about our product.

{Response Rules}
- Be friendly and professional
- Keep answers under 200 words
- Use bullet points for lists
- If unsure, say "I'll need to check on that"
- Never make up information

Use \`help_center_search\` when you need to confirm a product detail before answering.`,
        footer: "Write clear instructions telling your agent how to behave",
    },
    2: {
        title: "Updated Instructions (with [[variable]])",
        body: `You are a friendly customer support agent for Acme Software.

Task: Answer the customer's question about [[product_name]].

{Response Rules}
- Be friendly and professional
- Keep answers under 200 words
- Use bullet points for lists
- If unsure, say "I'll need to check on that"
- Never make up information

Use \`help_center_search\` to look up the latest product information about [[product_name]] before responding.`,
        footer: "Your instructions must now include [[variable_name]] at least once",
    },
} as const;

const AUTO_GROW_TEXTAREA_MAX_VIEWPORT_OFFSET = 120;
const FIELD_HIGHLIGHT_DURATION_MS = 2200;

type AutoGrowTextareaProps = React.ComponentProps<typeof Textarea> & {
    minHeight?: string;
    textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
};

function AutoGrowTextarea({ minHeight = "256px", textareaRef, style, ...props }: AutoGrowTextareaProps) {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    const setTextareaNode = useCallback((node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (textareaRef) {
            textareaRef.current = node;
        }
    }, [textareaRef]);

    const syncHeight = useCallback(() => {
        const el = internalRef.current;
        if (!el) return;

        const maxHeight = Math.max(240, window.innerHeight - AUTO_GROW_TEXTAREA_MAX_VIEWPORT_OFFSET);
        el.style.height = "0px";
        el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
        el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    }, []);

    useEffect(() => {
        syncHeight();
    }, [props.value, syncHeight]);

    useEffect(() => {
        window.addEventListener("resize", syncHeight);
        return () => window.removeEventListener("resize", syncHeight);
    }, [syncHeight]);

    return (
        <Textarea
            {...props}
            ref={setTextareaNode}
            resize="none"
            style={{
                minHeight,
                maxHeight: "calc(100vh - 120px)",
                ...style,
            }}
        />
    );
}

function GuideExampleTray({
    step,
    isOpen,
    onClose,
}: {
    step: 1 | 2 | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    const example = step ? GUIDE_EXAMPLES[step] : null;
    const handleCopy = useCallback(async () => {
        if (!example) return;
        try {
            await navigator.clipboard.writeText(example.body);
        } catch (error) {
            console.error("Failed to copy example:", error);
        }
    }, [example]);

    return (
        <ResizableDetailsTray
            isOpen={isOpen}
            onClose={onClose}
            title="Example"
            defaultWidth={400}
            minWidth={360}
            maxWidth={720}
            insetPadding="0 0 12px 0"
            bodyPadding="16"
        >
            {example ? (
                    <Box display="flex" flexDirection="column" gap="8">
                        <Text fontSize="md" fontWeight="400" color="fg.default">
                            {example.title}
                        </Text>

                        <Box display="flex" justifyContent="flex-end">
                            <Button
                                appearance="subtle"
                                size="sm"
                                icon={<IconCopy size={16} />}
                                aria-label="Copy example"
                                onClick={handleCopy}
                            />
                        </Box>

                        <Textarea
                            readOnly
                            value={example.body}
                            resize="none"
                            style={{
                                minHeight: step === 1 ? "320px" : "420px",
                                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                                fontSize: "17px",
                                lineHeight: "1.55",
                                color: "var(--ax-colors-fg-tertiary)",
                            }}
                        />

                        <Text fontSize="md" color="fg.tertiary">
                            {example.footer}
                        </Text>
                    </Box>
            ) : null}
        </ResizableDetailsTray>
    );
}

export default function SpecializedAgentSetup() {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <Box h="full" bg="bg.page" display="flex" alignItems="center" justifyContent="center">
                <Box p="24"><Text>Loading...</Text></Box>
            </Box>
        );
    }

    return (
        <Suspense fallback={<Box p="24"><Text>Loading...</Text></Box>}>
            <SpecializedAgentSetupContent />
        </Suspense>
    );
}

function SpecializedAgentSetupContent() {
    const router = useRouter();
    const { opalPanelControls } = useLayout();
    const searchParams = useSearchParams();
    const shouldAutoOpenAssistant = searchParams.get("capturePanel") === "assistant";
    const promptTemplateRef = useRef<HTMLTextAreaElement | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
        // Only show coach mark if panel is closed and user hasn't dismissed it
        if (!localStorage.getItem("opal_coach_mark_dismissed") && !showGuidePanel) {
            setShowCoachMark(true);
        }
    }, []);

    const mode = searchParams.get("mode") || "create"; // 'create' or 'edit'
    const shouldDefaultGuideOpen = shouldAutoOpenAssistant || mode === "create";
    const defaultGuidePanelView: "assistant" | "guide" = "assistant";
    const activeTab = isMounted ? (searchParams.get("tab") || "setup") : "setup";
    const qualitySubTab = isMounted ? (searchParams.get("subtab") || "evaluation") : "evaluation";

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleSubTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("subtab", value);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    // State for collapsible sections
    const [detailsOpen, setDetailsOpen] = useState(true);
    const [inputOpen, setInputOpen] = useState(false);

    // Enforcer Mode Carousel State
    const [currentModeIndex, setCurrentModeIndex] = useState(2);
    const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

    const enforcerModes = [
        {
            title: "Learner mode",
            description: "Establishes baseline guardrails by learning from first 20 approved executions. No active monitoring or alerts are performed.",
            icon: <IconBook size={16} />,
            isCurrent: false
        },
        {
            title: "Observer mode",
            description: "Refines guardrails by flagging deviations with a 'Warning' status for review. Improves guardrail accuracy over the next 30 executions.",
            icon: <IconEye size={16} />,
            isCurrent: false
        },
        {
            title: "Enforcer mode",
            description: "Automates enforcement against guardrails, terminating agents that breach critical safety limits and escalating alerts.",
            icon: <IconShieldCheck size={16} />,
            isCurrent: true
        }
    ];

    const currentMode = enforcerModes[currentModeIndex];

    const handleNextMode = () => {
        setCurrentModeIndex((prev) => (prev + 1) % enforcerModes.length);
    };

    const handlePrevMode = () => {
        setCurrentModeIndex((prev) => (prev - 1 + enforcerModes.length) % enforcerModes.length);
    };
    const [outputOpen, setOutputOpen] = useState(false);

    // Setup Fields State
    const [agentName, setAgentName] = useState("");
    const [agentId, setAgentId] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [description, setDescription] = useState("");
    const [creativity, setCreativity] = useState(40);
    const [promptTemplate, setPromptTemplate] = useState("");
    const [multiTurnMode, setMultiTurnMode] = useState(true);
    const [enabledInChat, setEnabledInChat] = useState(true);
    const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant. You have access to tools and can use them to help users. Always be concise, accurate, and professional.");
    const [initialMessage, setInitialMessage] = useState("Hi! I can help you with this task. What would you like to work on?");
    const [suggestedPrompts, setSuggestedPrompts] = useState<{ label: string; prompt: string }[]>([
        { label: "Summarize", prompt: "Please summarize the key points." },
        { label: "Analyze", prompt: "Analyze this in detail." },
    ]);
    const [tools, setTools] = useState("");
    const [inferenceLevel, setInferenceLevel] = useState("balanced");
    const [variables, setVariables] = useState<any[]>([]);
    const [sensitivity, setSensitivity] = useState(3);

    // State for scroll
    const [isScrolled, setIsScrolled] = useState(false);

    // Test Run State
    const [isTestRunOpen, setIsTestRunOpen] = useState(false);
    const [activeGuideExampleStep, setActiveGuideExampleStep] = useState<1 | 2 | null>(null);
    const [shouldCollapseHeaderActions, setShouldCollapseHeaderActions] = useState(false);

    // Assistant panel
    const [showGuidePanel, setShowGuidePanel] = useState(shouldDefaultGuideOpen);
    const [guidePanelView, setGuidePanelView] = useState<"assistant" | "guide">(defaultGuidePanelView);
    const [activeGuideStep, setActiveGuideStep] = useState<number | null>(null);
    const [highlightedField, setHighlightedField] = useState<number | null>(null);
    const [assistantHoveredField, setAssistantHoveredField] = useState<"system-prompt" | "memory-limit" | "first-message" | null>(null);
    const [showCoachMark, setShowCoachMark] = useState(false);

    useEffect(() => {
        if (!shouldDefaultGuideOpen) return;
        setShowGuidePanel(true);
        setGuidePanelView(defaultGuidePanelView);
        setShowCoachMark(false);
    }, [defaultGuidePanelView, shouldDefaultGuideOpen]);

    useEffect(() => {
        const updateHeaderActions = () => {
            setShouldCollapseHeaderActions(window.innerWidth < 1240);
        };

        updateHeaderActions();
        window.addEventListener("resize", updateHeaderActions);
        return () => window.removeEventListener("resize", updateHeaderActions);
    }, []);

    const toggleVersionHistory = () => {
        setIsVersionHistoryOpen(!isVersionHistoryOpen);
        if (!isVersionHistoryOpen) {
            setIsTestRunOpen(false);
            setActiveGuideExampleStep(null);
        }
    };

    const toggleGuidePanel = () => {
        setShowGuidePanel(!showGuidePanel);
        if (!showGuidePanel) {
            setIsTestRunOpen(false);
            setIsVersionHistoryOpen(false);
            setActiveGuideExampleStep(null);
        }
    };

    const handleAskOpal = useCallback((prompt: string) => {
        const trimmed = prompt.trim();
        if (!trimmed) return;

        const opalPrompt = [
            "Help me set up an Opal agent.",
            "",
            "The agent prompt should be written clearly and practically.",
            "When you respond, help structure the agent around:",
            "- Role: who the agent is",
            "- Task: what it should do",
            "- Variables: any dynamic inputs it should use with [[double brackets]]",
            "- Tools: only the tools it actually needs",
            "- Guardrails: what it should avoid or how it should behave",
            "- Output: what the response should look like",
            "",
            "If helpful, suggest the exact prompt, recommended variables, and any tools to add in Opal.",
            "",
            `User request: ${trimmed}`,
        ].join("\n");

        opalPanelControls?.launchPrompt(opalPrompt);
    }, [opalPanelControls]);

    const handleOpenGuideExample = useCallback((step: 1 | 2) => {
        setActiveGuideExampleStep(step);
        setIsTestRunOpen(false);
        setIsVersionHistoryOpen(false);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!window.location.hash.includes("figmacapture=")) return;

        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const captureId = hashParams.get("figmacapture");
        const endpoint = hashParams.get("figmaendpoint");
        const selector = hashParams.get("figmaselector") || "#figma-agent-assistant-panel";

        if (!captureId || !endpoint) return;

        const submittedKey = `figma-capture-submitted:${captureId}`;
        if (window.sessionStorage.getItem(submittedKey)) return;

        let attempts = 0;
        const maxAttempts = 30;

        const tryCapture = () => {
            const figmaCapture = (window as any).figma?.captureForDesign;
            const target = document.querySelector(selector);

            if (typeof figmaCapture === "function" && target) {
                window.sessionStorage.setItem(submittedKey, "1");
                figmaCapture({
                    captureId,
                    endpoint,
                    selector,
                });
                return;
            }

            attempts += 1;
            if (attempts < maxAttempts) {
                window.setTimeout(tryCapture, 500);
            }
        };

        window.setTimeout(tryCapture, 1200);
    }, [showGuidePanel]);

    const handleInsertToPrompt = useCallback((text: string) => {
        setPromptTemplate(prev => {
            const trimmed = prev.trimEnd();
            return trimmed ? trimmed + "\n\n" + text : text;
        });
    }, []);

    const handleAddTool = useCallback((toolName: string) => {
        setTools((prev) => {
            const normalized = prev
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);

            if (normalized.some((item) => item.toLowerCase() === toolName.toLowerCase())) {
                return prev;
            }

            return [...normalized, toolName].join(", ");
        });
    }, []);

    const openInputDisclosure = useCallback(() => {
        setInputOpen(true);
    }, []);

    const openMultiTurnDisclosure = useCallback(() => {
        openInputDisclosure();
        const multiTurnTrigger = [...document.querySelectorAll<HTMLElement>("button")]
            .find((b) => b.textContent?.includes("Multi-turn agent settings"));
        if (multiTurnTrigger) {
            const disclosure = multiTurnTrigger.closest("[data-state]");
            if (disclosure?.getAttribute("data-state") === "closed") {
                multiTurnTrigger.click();
            }
        }
    }, [openInputDisclosure]);

    const handleWizardStepChange = useCallback((step: number) => {
        setHighlightedField(step);
        const fieldMap: Record<number, string> = multiTurnMode
            ? {
                1: "field-prompt-template",
                2: "field-variables",
                3: "field-tools",
                4: "field-multiturn-settings",
                5: "button-test-run",
            }
            : {
                1: "field-prompt-template",
                2: "field-variables",
                3: "field-tools",
                4: "button-test-run",
            };
        const fieldId = fieldMap[step];

        // Step 4: always visible toolbar — skip scroll
        if (!multiTurnMode && step === 4) {
            setTimeout(() => setHighlightedField(null), FIELD_HIGHLIGHT_DURATION_MS);
            return;
        }

        // Multi-turn settings step: open the disclosure first, then scroll
        if (multiTurnMode && step === 4) {
            openMultiTurnDisclosure();
            setTimeout(() => {
                const el = document.getElementById("field-system-prompt");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => setHighlightedField(null), FIELD_HIGHLIGHT_DURATION_MS);
            }, 250);
            return;
        }

        if (multiTurnMode && step === 5) {
            setTimeout(() => setHighlightedField(null), FIELD_HIGHLIGHT_DURATION_MS);
            return;
        }

        openInputDisclosure();
        if (fieldId) {
            setTimeout(() => {
                document.getElementById(fieldId)?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 150);
        }
        setTimeout(() => setHighlightedField(null), FIELD_HIGHLIGHT_DURATION_MS);
    }, [multiTurnMode, openInputDisclosure, openMultiTurnDisclosure]);

    const handleAssistantFieldHover = useCallback((field: "system-prompt" | "memory-limit" | "first-message" | null) => {
        setAssistantHoveredField(field);
        if (!field) return;
        openMultiTurnDisclosure();
    }, [openMultiTurnDisclosure]);

    // Version History State
    const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
    const [viewingVersion, setViewingVersion] = useState<string | null>(null);
    const [viewingVersionData, setViewingVersionData] = useState<{ name: string; timestamp: string } | null>(null);
    const [versions, setVersions] = useState<Version[]>([
        {
            id: "v6",
            version: "V6",
            mode: "Enforcer",
            timestamp: "Jan 12, 2026, 8:14 PM",
            author: "Pei Chien",
            authorInitials: "PC",
            isCurrent: true,
        },
        {
            id: "v5",
            version: "V5",
            mode: "Enforcer",
            timestamp: "Jan 08, 2026, 4:22 PM",
            author: "Pei Chien",
            authorInitials: "PC",
        },
        {
            id: "v4",
            version: "V4",
            mode: "Observer",
            timestamp: "Jan 07, 2026, 11:30 AM",
            author: "Pei Chien",
            authorInitials: "PC",
        },
        {
            id: "v3",
            version: "V3",
            mode: "Observer",
            timestamp: "Dec 23, 2025, 2:15 PM",
            author: "Pei Chien",
            authorInitials: "PC",
        },
        {
            id: "v2",
            version: "V2",
            mode: "Learner",
            timestamp: "Dec 20, 2025, 10:05 AM",
            author: "Pei Chien",
            authorInitials: "PC",
        },
        {
            id: "v1",
            version: "V1",
            mode: "Learner",
            timestamp: "Dec 18, 2025, 9:20 AM",
            author: "Pei Chien",
            authorInitials: "PC",
        },
    ]);

    // Comparison State
    const [isComparing, setIsComparing] = useState(false);
    const [comparisonVersionId, setComparisonVersionId] = useState<string | null>(null);
    const [comparisonData, setComparisonData] = useState<{
        name: string;
        description: string;
        promptTemplate: string;
        tools: string;
        inferenceLevel?: string;
        creativity?: number;
    } | null>(null);
    const [showDiffs, setShowDiffs] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop;
        setIsScrolled(scrollTop > 20);
    };

    // Version History Handlers
    const getVersionData = (versionId: string) => {
        const versionMockData: Record<string, any> = {
            "v6": {
                name: "Content Localizer Enterprise",
                description: "Localize your content with specific regional context while maintaining brand voice.\nEnsures cultural sensitivity and local relevance.\nSupports multiple language pairs and regional variants.\nAI-powered suggestions for optimal localization.\nQuality scoring and validation.",
                promptTemplate: "You are a localization expert. Your task is to adapt the provided content for the target region: [[region]].\n\n{Instruction}\n- Use local terminology and cultural references.\n- Maintain the original brand voice and tone.\n- Ensure the length remains similar to the original.\n- Consider cultural sensitivities and taboos.\n- Adapt idioms and metaphors appropriately.\n- Provide quality score and suggestions.\n- Validate against regional guidelines.\n\nContent to localize: [[content]]\n\n`Translate` `Style Guide Checker` `Cultural Analyzer` `Quality Scorer`",
                tools: "Translate, Style Guide Checker, Regional Thesaurus, Cultural Analyzer, Quality Scorer",
                inferenceLevel: "advanced",
                creativity: 0.4,
            },
            "v5": {
                name: "Content Localizer Pro",
                description: "Localize your content with specific regional context while maintaining brand voice.\n[LEGACY] Ensures cultural sensitivity and local relevance.",
                promptTemplate: "-- DUMMY DIFF CONTENT --\nThis header was removed in the current version.\n\nYou are a localization expert. Your task is to adapt the provided content for the target region: [[region]].\n\n{Instruction}\n- Use local terminology.\n- Maintain brand voice.\n- Ensure brevity.\n\nContent to localize: [[content]]",
                tools: "Translate, Style Guide Checker, Legacy Parser",
                variables: [
                    { name: "region", description: "The country or area to localize for", type: "String", required: true },
                    { name: "legacy_var", description: "DUMMY DIFF: This variable was removed.", type: "String", required: false }
                ],
                inferenceLevel: "fast",
                creativity: 0.2,
            },
            "v4": {
                name: "Content Localizer Advanced",
                description: "Localize your content with regional context.\nEnsures cultural sensitivity.\nSupports multiple languages.",
                promptTemplate: "You are a localization expert. Your task is to adapt the provided content for the target region: [[region]].\n\n{Instruction}\n- Use local terminology and cultural references.\n- Maintain the original brand voice and tone.\n- Ensure the length remains similar to the original.\n\nContent to localize: [[content]]\n\n`Translate` `Style Guide Checker`",
                tools: "Translate, Style Guide Checker, Regional Thesaurus",
                inferenceLevel: "balanced",
                creativity: 0.3,
            },
            "v3": {
                name: "Content Localizer",
                description: "Localize your content with regional context while maintaining brand voice.\nSupports multiple languages.",
                promptTemplate: "You are a localization expert. Adapt the content for: [[region]].\n\n{Instruction}\n- Use local terminology.\n- Maintain brand voice.\n\nContent: [[content]]\n\n`Translate`",
                tools: "Translate, Style Guide Checker",
                inferenceLevel: "balanced",
                creativity: 0.3,
            },
            "v2": {
                name: "Content Localizer Beta",
                description: "Localize your content for different regions.\nMaintains brand consistency.",
                promptTemplate: "Adapt the provided content for the target region: [[region]].\n\n{Instruction}\n- Use local terminology.\n- Keep the same tone.\n\nContent: [[content]]",
                tools: "Translate",
                inferenceLevel: "fast",
                creativity: 0.1,
            },
            "v1": {
                name: "Localizer",
                description: "Basic content localization tool.",
                promptTemplate: "Translate content for: [[region]].\n\nContent: [[content]]",
                tools: "Translate",
                inferenceLevel: "fast",
                creativity: 0.0,
            },
        };

        return versionMockData[versionId] || {
            name: agentName,
            description: description,
            promptTemplate: promptTemplate,
            tools: tools,
            inferenceLevel: inferenceLevel,
            creativity: creativity / 100,
        };
    };
    const handleViewVersion = (versionId: string) => {
        setViewingVersion(versionId);
        // Mock version data - in real app, fetch from API
        setViewingVersionData({
            name: versionId.toUpperCase(),
            timestamp: "Nov 17, 2025 9:00 PM"
        });




        const data = getVersionData(versionId);
        setAgentName(data.name);
        setDescription(data.description);
        setPromptTemplate(data.promptTemplate);
        setTools(data.tools || "");
        setVariables(data.variables || []);
        setInferenceLevel(data.inferenceLevel || "balanced");
        if (data.creativity !== undefined) setCreativity(Math.round(data.creativity * 100));
    };

    const handleCompareVersion = (versionId: string) => {
        console.log('Comparing version:', versionId, 'with current');
        setComparisonVersionId(versionId);
        setComparisonData(getVersionData(versionId));
        setIsComparing(true);
        setViewingVersion(null);
        setViewingVersionData(null);
    };

    const handleExitComparison = () => {
        setIsComparing(false);
        setComparisonVersionId(null);
        setComparisonData(null);
    };

    const isReadOnly = !!viewingVersion || isComparing;
    const configuredTools = tools
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    const hasAgentDetails = Boolean(
        agentName.trim() ||
        description.trim() ||
        promptTemplate.trim() ||
        variables.length > 0 ||
        configuredTools.length > 0
    );

    // Helper for syntax highlighting in prompt template
    const HighlightedPrompt = ({ text }: { text: string }) => {
        if (!text) return null;
        const parts = text.split(/(\[\[.*?\]\]|\{.*?\}|`.*?`)/g);
        return (
            <Box
                pt="12"
                pr="12"
                pb="12"
                pl="6"
                rounded="sm"
                bg="bg.secondary"
                style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    minHeight: "256px",
                    cursor: "text",
                    userSelect: "text"
                }}
                tabIndex={-1}
            >
                {parts.map((part, i) => {
                    if (part.startsWith("[[") && part.endsWith("]]")) {
                        return <span key={i} style={{ color: "var(--ax-colors-fg-warning-strong)", fontWeight: "600" }}>{part}</span>;
                    }
                    if (part.startsWith("{") && part.endsWith("}")) {
                        return <span key={i} style={{ color: "var(--ax-colors-fg-accent-strong)", fontWeight: "600" }}>{part}</span>;
                    }
                    if (part.startsWith("`") && part.endsWith("`")) {
                        const actionLabel = part.slice(1, -1);
                        const actionDescription = PROMPT_ACTION_DETAILS[actionLabel];
                        if (actionDescription) {
                            return (
                                <HoverCard key={i} openDelay={200}>
                                    <HoverCardTrigger asChild>
                                        <span style={{
                                            color: "var(--ax-colors-fg-secondary)",
                                            fontWeight: "600",
                                            backgroundColor: "var(--ax-colors-bg-tertiary)",
                                            padding: "1px 8px",
                                            borderRadius: "999px",
                                            border: "1px solid var(--ax-colors-border-secondary)",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            marginRight: "4px",
                                            cursor: "default",
                                        }}>
                                            {actionLabel}
                                        </span>
                                    </HoverCardTrigger>
                                    <HoverCardContent side="top" align="start" style={{ maxWidth: "260px" }}>
                                        <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.5" }}>
                                            {actionDescription}
                                        </Text>
                                    </HoverCardContent>
                                </HoverCard>
                            );
                        }
                        return (
                            <span key={i} style={{
                                color: "var(--ax-colors-fg-secondary)",
                                fontWeight: "600",
                                backgroundColor: "var(--ax-colors-bg-tertiary)",
                                padding: "0 4px",
                                borderRadius: "4px",
                                border: "1px solid var(--ax-colors-border-secondary)"
                            }}>
                                {part}
                            </span>
                        );
                    }
                    return <span key={i}>{part}</span>;
                })}
            </Box>
        );
    };

    const handleRestoreVersion = (versionId: string) => {
        console.log('Restoring version:', versionId);

        // 1. Immediately exit all specialized modes
        setIsComparing(false);
        setComparisonVersionId(null);
        setComparisonData(null);
        setViewingVersion(null);
        setViewingVersionData(null);
        setShowDiffs(false);
        setIsVersionHistoryOpen(false);

        // 2. Process data restoration
        const data = getVersionData(versionId);
        setAgentName(data.name);
        setDescription(data.description);
        setPromptTemplate(data.promptTemplate);
        setTools(data.tools || "");
        setVariables(data.variables || []);
        setInferenceLevel(data.inferenceLevel || "balanced");
        if (data.creativity !== undefined) setCreativity(data.creativity * 100);

        // 3. Update version history
        const nextVersionNum = versions.length + 1;
        const newVersion: Version = {
            id: `v${nextVersionNum}`,
            version: `V${nextVersionNum}`,
            mode: "Learner", // New versions always start as Learner (1-20 runs), then Observer (20-50), then Enforcer (50+)
            timestamp: new Date().toLocaleString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }),
            author: "Pei Chien",
            authorInitials: "PC",
            isCurrent: true,
        };

        setVersions(prev => [
            newVersion,
            ...prev.map(v => ({ ...v, isCurrent: false }))
        ]);
    };

    const handleExitVersionView = () => {
        setViewingVersion(null);
        setViewingVersionData(null);
        setShowDiffs(false);
    };



    const handleDuplicateVersion = (versionId: string) => {
        console.log('Duplicating version:', versionId);
        // In real app, duplicate as new agent
    };

    const handleHideVersion = (versionId: string) => {
        console.log('Hiding version:', versionId);
        // In real app, hide the version
    };

    const handleNameVersion = (versionId: string) => {
        console.log('Naming version:', versionId);
        // In real app, show dialog to name the version
    };

    // Listen for guide → page navigation (bi-directional)
    useEffect(() => {
        const STEP_MAP: Record<number, { fieldId: string; openInput?: boolean; openAdvanced?: boolean }> = {
            1: { fieldId: "field-multiturn-toggle" },
            2: { fieldId: "field-prompt-template", openInput: true },
            3: { fieldId: "field-system-prompt", openInput: true, openAdvanced: true },
            4: { fieldId: "field-memory-limit", openInput: true, openAdvanced: true },
            5: { fieldId: "field-first-message", openInput: true, openAdvanced: true },
        };

        function flashEl(el: HTMLElement) {
            el.style.transition = "box-shadow 0.2s ease";
            el.style.borderRadius = "8px";
            el.style.padding = "8px";
            el.style.margin = "-8px";
            el.style.boxShadow = "0 0 0 3px #c4b5fd, 0 0 0 1px #7c3aed22";
            setTimeout(() => {
                el.style.boxShadow = "";
                el.style.padding = "";
                el.style.margin = "";
            }, 1400);
        }

        function handleMessage(e: MessageEvent) {
            if (!e.data || e.data.type !== "focusStep") return;
            const step = e.data.step as number;
            const target = STEP_MAP[step];
            if (!target) return;

            // Open Input disclosure if needed
            if (target.openInput) {
                const inputTrigger = [...document.querySelectorAll<HTMLElement>("button")]
                    .find(b => b.textContent?.trim().startsWith("Input"));
                if (inputTrigger) {
                    const disclosure = inputTrigger.closest("[data-state]");
                    if (disclosure?.getAttribute("data-state") === "closed") {
                        inputTrigger.click();
                    }
                }
            }

            // Open Advanced Settings disclosure if needed
            if (target.openAdvanced) {
                setTimeout(() => {
                    const advBtn = [...document.querySelectorAll<HTMLElement>("button")]
                        .find(b => b.textContent?.includes("Multi-turn agent settings"));
                    if (advBtn) {
                        const disclosure = advBtn.closest("[data-state]");
                        if (disclosure?.getAttribute("data-state") === "closed") {
                            advBtn.click();
                        }
                    }
                }, 100);
            }

            // Scroll and flash the field
            setTimeout(() => {
                const el = document.getElementById(target.fieldId);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    flashEl(el);
                }
            }, target.openAdvanced ? 300 : 150);
        }

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    // Initialize state based on mode and search params
    useEffect(() => {
        const id = searchParams.get("id");
        if (mode === "edit") {
            setDetailsOpen(true);
            setInputOpen(true);
            setIsActive(true);

            if (id && MOCK_AGENTS_DATA[id]) {
                const data = MOCK_AGENTS_DATA[id];
                setAgentName(data.name);
                setAgentId(data.agentId);
                setDescription(data.description);
                setPromptTemplate(data.promptTemplate);
                setTools(data.tools);
                setVariables(data.variables);
                setCreativity(data.creativity || 40);
                setInferenceLevel(data.inferenceLevel || "balanced");
            } else {
                // Default fallback (Email Creation)
                setAgentName("Email Creation");
                setAgentId("email_creation");
                setDescription("Transforms a provided overview into a high-quality email draft.");
                setPromptTemplate("You are an expert email marketer. Generate a professional email based on the following overview:\n\n[[overview]]\n\n{Instruction}\n- Tone: Professional yet engaging\n- Length: Concise (under 200 words)\n- Include a clear call-to-action.\n\nUse `Email Validator`.");
                setTools("Email Validator, Template Gallery");
                setVariables([
                    { name: "overview", description: "what the email is about", type: "String", required: true }
                ]);
                setCreativity(40);
            }
        } else {
            // mode === 'create'
            setDetailsOpen(true);
            setInputOpen(false);

            setAgentName("");
            setAgentId("");
            setIsActive(false);
            setDescription("");
            setPromptTemplate("");
            setTools("");
            setVariables([]);
            setCreativity(40);
            setInferenceLevel("balanced");
        }
        setOutputOpen(false);
    }, [mode, searchParams]);



    return (
        <Box h="full" bg="bg.page" display="flex" flexDirection="row" suppressHydrationWarning>
            {/* Main Content */}
            <Box flex="1" display="flex" flexDirection="column" style={{ minWidth: 0 }}>
                <Tabs value={activeTab} onValueChange={handleTabChange} style={{ display: "flex", flexDirection: "column", height: "100%" }} suppressHydrationWarning>
                    {/* Sticky Header */}
                    <Box
                        style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 50,
                            transition: "all 0.2s ease-in-out"
                        }}
                    >
                        <Box
                            px="24"
                            style={{
                                transition: "all 0.2s ease-in-out",
                                height: isScrolled ? "64px" : "112px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center"
                            }}
                        >
                            <Box
                                display="flex"
                                flexDirection="column"
                                gap={isScrolled ? "0" : "4"}
                                style={{ transition: "all 0.2s ease-in-out" }}
                            >
                                {/* Breadcrumb Row - separate line when expanded */}
                                {!isScrolled && (
                                    <Breadcrumb
                                        items={[
                                            { label: "Agents", href: "/opal/agents" },
                                            { label: "" }
                                        ]}
                                    />
                                )}

                                {/* Main Content Row */}
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center" gap="12">
                                        {isScrolled && (
                                            <>
                                                <Link href="/opal/agents" color="fg.secondary" fontSize="md">
                                                    Agents
                                                </Link>
                                                <Text color="fg.tertiary">/</Text>
                                            </>
                                        )}
                                        {(() => {
                                            const agentId = searchParams.get("id");
                                            const emoji = agentId ? AGENT_EMOJIS[agentId] : undefined;
                                            return emoji ? (
                                                <Box style={{
                                                    flexShrink: 0,
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 10,
                                                    background: "radial-gradient(circle, rgba(245,243,255,1) 0%, rgba(229,239,255,1) 50%, rgba(221,214,254,1) 100%)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 22,
                                                    lineHeight: 1,
                                                }}>
                                                    {emoji}
                                                </Box>
                                            ) : null;
                                        })()}
                                        <Heading level="2">
                                            {agentName || (mode === "edit" ? "Email Creation" : "Specialized Agent")}
                                        </Heading>
                                    </Box>

                                    <Box display="flex" alignItems="center" gap="8">
                                        <Button
                                            appearance="primary"
                                            size="lg"
                                            onClick={() => {
                                                // Save logic here
                                                console.log('Saving...');
                                            }}
                                            disabled={isReadOnly}
                                        >
                                            Save
                                        </Button>
                                        <div
                                            id="button-test-run"
                                            style={{
                                                outline: highlightedField === 4 ? "2px solid var(--ax-colors-border-accent)" : "2px solid transparent",
                                                outlineOffset: "8px",
                                                borderRadius: "8px",
                                                transition: "outline-color 0.3s ease",
                                            }}
                                        >
                                            <Button
                                                appearance="default"
                                                size="lg"
                                                icon={<IconPlay />}
                                                disabled={isReadOnly}
                                                onClick={() => {
                                                    setIsTestRunOpen(!isTestRunOpen);
                                                    if (!isTestRunOpen) {
                                                        setIsVersionHistoryOpen(false);
                                                        setActiveGuideExampleStep(null);
                                                    }
                                                }}
                                            >
                                                Test Run
                                            </Button>
                                        </div>
                                        {!shouldCollapseHeaderActions && (
                                            <>
                                                <Tooltip delayDuration={300} content="Version History">
                                                    <Box display="inline-flex">
                                                        <Button
                                                            appearance="default"
                                                            size="lg"
                                                            icon={<IconClockRotateLeft />}
                                                            aria-label="Version History"
                                                            onClick={toggleVersionHistory}
                                                        />
                                                    </Box>
                                                </Tooltip>
                                                <Tooltip delayDuration={300} content={showGuidePanel ? "Hide Setup Guide" : "Setup Guide"}>
                                                    <Box display="inline-flex">
                                                        <Button
                                                            appearance="default"
                                                            size="lg"
                                                            icon={<IconLightbulb />}
                                                            aria-label={showGuidePanel ? "Hide Setup Guide" : "Setup Guide"}
                                                            onClick={toggleGuidePanel}
                                                        />
                                                    </Box>
                                                </Tooltip>
                                            </>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild suppressHydrationWarning>
                                                <Button appearance="default" size="lg" icon={<IconDots />} aria-label="More options" suppressHydrationWarning />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem icon={<IconFileImport size={16} />}>
                                                    Duplicate Agent
                                                </DropdownMenuItem>
                                                <DropdownMenuItem icon={<IconFileImport size={16} />}>
                                                    Copy as JSON
                                                </DropdownMenuItem>
                                                <DropdownMenuItem icon={<IconFile size={16} />}>
                                                    Export logs
                                                </DropdownMenuItem>
                                                {shouldCollapseHeaderActions && (
                                                    <>
                                                        <div style={{ margin: "8px 12px", height: "1px", background: "var(--ax-colors-border-secondary)" }} />
                                                        <DropdownMenuItem
                                                            icon={<IconClockRotateLeft size={16} />}
                                                            onClick={toggleVersionHistory}
                                                        >
                                                            Version History
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            icon={<IconLightbulb size={16} />}
                                                            onClick={toggleGuidePanel}
                                                        >
                                                            {showGuidePanel ? "Hide Setup Guide" : "Setup Guide"}
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                <div style={{ margin: "8px 12px", height: "1px", background: "var(--ax-colors-border-secondary)" }} />
                                                <DropdownMenuItem
                                                    icon={<IconTrashCan size={16} />}
                                                    style={{ color: "var(--ax-colors-fg-danger)" }}
                                                >
                                                    Delete Agent
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Version Preview Banner */}
                        {viewingVersion && viewingVersionData && !isComparing && (
                            <Box px="24">
                                <VersionPreviewBanner
                                    versionName={viewingVersionData.name}
                                    timestamp={viewingVersionData.timestamp}
                                    onRestore={() => handleRestoreVersion(viewingVersion)}
                                    onExit={handleExitVersionView}
                                    showDiffs={showDiffs}
                                    onToggleDiffs={setShowDiffs}
                                />
                            </Box>
                        )}

                        {/* Comparison Banner */}
                        {isComparing && comparisonVersionId && (
                            <Box px="24">
                                <ComparisonBanner
                                    versionName={comparisonVersionId.toUpperCase()}
                                    onExitComparison={handleExitComparison}
                                />
                            </Box>
                        )}

                        {/* Tabs List */}
                        <Box px="24">
                            <TabsList suppressHydrationWarning>
                                <TabsTrigger value="setup" suppressHydrationWarning>Setup</TabsTrigger>
                                <TabsTrigger value="triggers" suppressHydrationWarning>In-app Triggers</TabsTrigger>
                                <TabsTrigger value="quality" suppressHydrationWarning>Quality</TabsTrigger>
                                <TabsTrigger value="logs" suppressHydrationWarning>Logs</TabsTrigger>
                            </TabsList>
                        </Box>
                    </Box>



                    {/* Content Area */}
                    <Box flex="1" display="flex" flexDirection="column" style={{ minHeight: 0 }}>
                        <TabsContent value="setup" style={{ height: "100%" }} suppressHydrationWarning>
                            <Box
                                h="full"
                                display="flex"
                                flexDirection="column"
                                overflowY="auto"
                                onScroll={handleScroll}
                            >
                                <Box
                                    px="24"
                                    py="24"
                                    style={{
                                        maxWidth: "1464px",
                                        width: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "24px"
                                    }}
                                >
                                    {/* Details Section */}
                                    <Disclosure open={detailsOpen} onOpenChange={setDetailsOpen} bg="bg.secondary" rounded="md" pl="8" py="4" style={{ flexShrink: 0 }} suppressHydrationWarning>
                                        <DisclosureTrigger fontSize="md" fontWeight="500" suppressHydrationWarning>
                                            Details
                                        </DisclosureTrigger>
                                        <DisclosureContent pl="32" pb="32" suppressHydrationWarning>
                                            <Box style={{ maxWidth: isComparing ? "none" : "980px" }} display="flex" flexDirection="column" gap="24">
                                                <Field label="Name" required>
                                                    {isComparing && comparisonData ? (
                                                        <FieldComparison
                                                            previousValue={comparisonData.name}
                                                            currentValue={MOCK_AGENTS_DATA["content-localizer"].name}
                                                        />
                                                    ) : showDiffs && viewingVersion ? (
                                                        <FieldComparison
                                                            previousValue={agentName}
                                                            currentValue={MOCK_AGENTS_DATA["content-localizer"].name}
                                                            mode="stacked"
                                                        />
                                                    ) : (
                                                        <Box display="flex" gap="12" alignItems="center">
                                                            <Box flex="1">
                                                                <Input
                                                                    value={agentName}
                                                                    onChange={(e) => setAgentName(e.target.value)}
                                                                    placeholder="e.g. Email Creation"
                                                                    readOnly={isReadOnly}
                                                                />
                                                            </Box>
                                                            <Box display="flex" alignItems="center" gap="8">
                                                                <Switch checked={isActive} onCheckedChange={setIsActive} disabled={isReadOnly} tabIndex={isReadOnly ? -1 : 0} />
                                                                <Text color={isReadOnly ? "fg.tertiary" : "fg.default"}>{isActive ? "Active" : "Inactive"}</Text>
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </Field>

                                                <Field label="Id" required>
                                                    <Box display="flex" gap="8" alignItems="center">
                                                        <Box flex="1">
                                                            <Input
                                                                value={agentId}
                                                                onChange={(e) => setAgentId(e.target.value)}
                                                                placeholder="e.g. email_creation"
                                                                readOnly={isReadOnly}
                                                                tabIndex={isReadOnly ? -1 : 0}
                                                            />
                                                        </Box>
                                                        <Text color="fg.secondary">@{agentId || "email_creation"}</Text>
                                                    </Box>
                                                </Field>

                                                <Field label="Description" info="What does this agent do?">
                                                    {isComparing && comparisonData ? (
                                                        <FieldComparison
                                                            previousValue={comparisonData.description}
                                                            currentValue={MOCK_AGENTS_DATA["content-localizer"].description}
                                                            multiline
                                                        />
                                                    ) : showDiffs && viewingVersion ? (
                                                        <FieldComparison
                                                            previousValue={description}
                                                            currentValue={MOCK_AGENTS_DATA["content-localizer"].description}
                                                            multiline
                                                            mode="stacked"
                                                        />
                                                    ) : (
                                                        <Textarea
                                                            value={description}
                                                            onChange={(e) => setDescription(e.target.value)}
                                                            placeholder="What is the goal for this agent?"
                                                            className="h-24"
                                                            readOnly={isReadOnly}
                                                        />
                                                    )}
                                                </Field>

                                                {/* Interaction Mode */}
                                                <Box onFocus={() => setActiveGuideStep(1)} onBlur={() => setActiveGuideStep(null)}>
                                                    <Text fontWeight="600" fontSize="md" mb="4">Interaction Mode</Text>
                                                    <Text fontSize="sm" color="fg.secondary" mb="16">Configure how users interact with this agent</Text>
                                                    <Box display="flex" flexDirection="column" gap="12">
                                                        <Box id="field-multiturn-toggle" display="inline-flex" alignItems="center" gap="8">
                                                            <Switch checked={multiTurnMode} onCheckedChange={setMultiTurnMode} disabled={isReadOnly} />
                                                            <Tooltip delayDuration={300} content="Select this option for multi-turn conversations for this agent, facilitating interactive guidance, clarification, and personalized user experiences.">
                                                                <Box display="inline-flex" alignItems="center" gap="4" style={{ cursor: "default" }}>
                                                                    <Text>Support multi-turn conversation</Text>
                                                                    <Box style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                                                                        <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                        {showCoachMark && (
                                                                            <Box style={{ position: "absolute", left: "calc(100% + 14px)", top: "50%", transform: "translateY(-50%)", zIndex: 50 }}>
                                                                                {/* Left-pointing callout arrow */}
                                                                                <Box style={{ position: "absolute", left: "-9px", top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "9px solid transparent", borderBottom: "9px solid transparent", borderRight: "9px solid var(--ax-colors-border-secondary)" }} />
                                                                                <Box style={{ position: "absolute", left: "-8px", top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderRight: "8px solid var(--ax-colors-bg-default)" }} />
                                                                                <Box style={{ background: "var(--ax-colors-bg-default)", border: "1px solid var(--ax-colors-border-secondary)", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", color: "var(--ax-colors-fg-default)", lineHeight: 1.5, whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                                                                                    Get step-by-step help building your first multi-turn agent.{" "}
                                                                                    <button
                                                                                        onClick={() => { setShowGuidePanel(true); setGuidePanelView("assistant"); setActiveGuideStep(null); setShowCoachMark(false); localStorage.setItem("opal_coach_mark_dismissed", "1"); }}
                                                                                        style={{ color: "var(--ax-colors-fg-accent-strong)", background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit", fontSize: "12px", textDecoration: "underline" }}
                                                                                    >
                                                                                        Open Setup Assistant
                                                                                    </button>
                                                                                </Box>
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            </Tooltip>
                                                        </Box>
                                                        <Box display="flex" alignItems="center" gap="8">
                                                            <Switch checked={enabledInChat} onCheckedChange={setEnabledInChat} disabled={isReadOnly} />
                                                            <Tooltip delayDuration={300} content="Allow users to trigger this agent from the Chat interface">
                                                                <Box display="inline-flex" alignItems="center" gap="4" style={{ cursor: "default" }}>
                                                                    <Text>Enable in chat</Text>
                                                                    <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                </Box>
                                                            </Tooltip>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </DisclosureContent>
                                    </Disclosure>

                                    {/* Input Section */}
                                    <Disclosure open={inputOpen} onOpenChange={setInputOpen} bg="bg.secondary" rounded="md" pl="8" py="4" style={{ flexShrink: 0 }} suppressHydrationWarning>
                                        <DisclosureTrigger fontSize="md" fontWeight="500" suppressHydrationWarning>
                                            <Box display="flex" alignItems="center" gap="4">
                                                Input
                                                <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                            </Box>
                                        </DisclosureTrigger>
                                        <DisclosureContent pl="32" pb="32" suppressHydrationWarning>
                                            <Box style={{ maxWidth: isComparing ? "none" : "980px" }} display="flex" flexDirection="column" gap="24">
                                                <div
                                                    id="field-prompt-template"
                                                    onFocus={() => setActiveGuideStep(1)}
                                                    onBlur={() => setActiveGuideStep(null)}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => { e.preventDefault(); const t = e.dataTransfer.getData("text/plain"); if (t) handleInsertToPrompt(t); }}
                                                    style={{
                                                        outline: highlightedField === 1 ? "2px solid var(--ax-colors-border-accent)" : "2px solid transparent",
                                                        outlineOffset: "8px",
                                                        borderRadius: "8px",
                                                        transition: "outline-color 0.3s ease",
                                                    }}
                                                >
                                                <HoverCard openDelay={300}>
                                                <Field
                                                    label={
                                                        <HoverCardTrigger asChild>
                                                            <Box display="inline-flex" alignItems="center" gap="4" style={{ cursor: "default" }}>
                                                                <Text fontSize="md" fontWeight="400">Prompt</Text>
                                                                <span style={{ display: "inline-flex" }}><IconCircleQuestion size={14} color="var(--ax-colors-fg-tertiary)" /></span>
                                                            </Box>
                                                        </HoverCardTrigger>
                                                    }
                                                >
                                                    {isComparing && comparisonData ? (
                                                        <FieldComparison
                                                            previousValue={comparisonData.promptTemplate}
                                                            currentValue={MOCK_AGENTS_DATA["content-localizer"].promptTemplate}
                                                            multiline
                                                        />
                                                    ) : showDiffs && viewingVersion ? (
                                                        <FieldComparison
                                                            previousValue={promptTemplate}
                                                            currentValue={MOCK_AGENTS_DATA["content-localizer"].promptTemplate}
                                                            multiline
                                                            mode="stacked"
                                                        />
                                                    ) : isReadOnly ? (
                                                        <Box
                                                            p="12"
                                                            rounded="sm"
                                                            bg="bg.secondary"
                                                            style={{
                                                                whiteSpace: "pre-wrap",
                                                                wordBreak: "break-word",
                                                                minHeight: "256px",
                                                                cursor: "text",
                                                                userSelect: "text",
                                                                border: "1px solid var(--ax-colors-border-secondary)"
                                                            }}
                                                        >
                                                            <HighlightedPrompt text={promptTemplate} />
                                                        </Box>
                                                    ) : (
                                                        <Box style={{ position: "relative" }}>
                                                            {!promptTemplate && (
                                                                <Box
                                                                    onClick={() => promptTemplateRef.current?.focus()}
                                                                    style={{
                                                                        position: "absolute",
                                                                        inset: "1px",
                                                                        zIndex: 1,
                                                                        pointerEvents: "auto",
                                                                        padding: "10px 12px",
                                                                        color: "var(--ax-colors-fg-secondary)",
                                                                        whiteSpace: "pre-wrap",
                                                                        overflow: "hidden",
                                                                        cursor: "text",
                                                                        lineHeight: 1.45,
                                                                    }}
                                                                >
                                                                    {PROMPT_TEMPLATE_PLACEHOLDER.map((section, index) => (
                                                                        <Box key={section.title} mb={index === PROMPT_TEMPLATE_PLACEHOLDER.length - 1 ? "0" : "20"}>
                                                                            <Text
                                                                                fontSize="md"
                                                                                fontWeight="600"
                                                                                color="fg.tertiary"
                                                                                style={{ lineHeight: "1.35", marginBottom: "4px" }}
                                                                            >
                                                                                {section.title}
                                                                            </Text>
                                                                            <Text
                                                                                fontSize="md"
                                                                                color="fg.tertiary"
                                                                                style={{ lineHeight: "1.45", whiteSpace: "pre-wrap" }}
                                                                            >
                                                                                {section.body}
                                                                            </Text>
                                                                        </Box>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                            <AutoGrowTextarea
                                                                minHeight={!promptTemplate ? "540px" : "256px"}
                                                                textareaRef={promptTemplateRef}
                                                                value={promptTemplate}
                                                                onChange={(e) => setPromptTemplate(e.target.value)}
                                                                placeholder=""
                                                                color={!promptTemplate ? "transparent" : "fg.default"}
                                                                style={{
                                                                    position: "relative",
                                                                    zIndex: 0,
                                                                    caretColor: "var(--ax-colors-fg-default)",
                                                                }}
                                                            />
                                                        </Box>
                                                    )}
                                                </Field>
                                                <HoverCardContent side="right" align="start" style={{ maxWidth: "280px" }}>
                                                    <Box display="flex" flexDirection="column" gap="8" p="4">
                                                        <Text fontWeight="600" fontSize="sm">Step 2 of 6 — Prompt Template</Text>
                                                        <Text fontSize="sm" color="fg.secondary">Your main instruction to the agent. Describe the role, task, and output format.</Text>
                                                        <Text fontSize="sm" color="fg.secondary">Use <code style={{ background: "var(--ax-colors-bg-tertiary)", padding: "1px 4px", borderRadius: "3px" }}>{"[[variable]]"}</code> for dynamic inputs, <code style={{ background: "var(--ax-colors-bg-tertiary)", padding: "1px 4px", borderRadius: "3px" }}>{"{ Instruction }"}</code> for directives.</Text>
                                                        <button
                                                            onClick={() => { setShowGuidePanel(true); setGuidePanelView("assistant"); }}
                                                            style={{ color: "var(--ax-colors-fg-accent-strong)", background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit", fontSize: "12px", textAlign: "left", textDecoration: "underline" }}
                                                        >
                                                            View full guide →
                                                        </button>
                                                    </Box>
                                                </HoverCardContent>
                                                </HoverCard>
                                                </div>

                                                <div
                                                    id="field-variables"
                                                    onFocus={() => setActiveGuideStep(2)}
                                                    onBlur={() => setActiveGuideStep(null)}
                                                    style={{
                                                        outline: highlightedField === 2 ? "2px solid var(--ax-colors-border-accent)" : "2px solid transparent",
                                                        outlineOffset: "8px",
                                                        borderRadius: "8px",
                                                        transition: "outline-color 0.3s ease",
                                                    }}
                                                >
                                                <Box>
                                                    <Box display="flex" justifyContent="space-between" mb="8">
                                                        <Text fontWeight="400" fontSize="md">Variables</Text>
                                                        <Button appearance="subtle" size="sm" icon={<IconPlus />} disabled={isReadOnly}>Add Variable</Button>
                                                    </Box>
                                                    {/* Variables List */}
                                                    <Box display="flex" flexDirection="column" gap="8">
                                                        {variables.length > 0 ? (
                                                            variables.map((variable, index) => (
                                                                <Card key={index} p="12">
                                                                    <Box display="flex" alignItems="center" justifyContent="space-between" w="full">
                                                                        <Box display="flex" gap="12" alignItems="center" flex="1">
                                                                            <Box
                                                                                display="flex"
                                                                                alignItems="center"
                                                                                justifyContent="center"
                                                                                w="32"
                                                                                h="32"
                                                                                color="fg.secondary"
                                                                            >
                                                                                {(() => {
                                                                                    switch (variable.type.toLowerCase()) {
                                                                                        case "string": return <IconInputText size={20} />;
                                                                                        case "number": return <IconInputNumeric size={20} />;
                                                                                        case "json": return <IconBracketsCurly size={20} />;
                                                                                        case "date": return <IconCalendar size={20} />;
                                                                                        case "boolean": return <IconToggleOff size={20} />;
                                                                                        case "file": return <IconFile size={20} />;
                                                                                        default: return <IconBracketsSquare size={20} />;
                                                                                    }
                                                                                })()}
                                                                            </Box>
                                                                            <Box flex="1">
                                                                                <Text fontWeight="600">{variable.name}</Text>
                                                                                <Text fontSize="sm" color="fg.secondary">{variable.description}</Text>
                                                                            </Box>
                                                                        </Box>
                                                                        <Box display="flex" gap="8" alignItems="center" mr="32">
                                                                            {variable.required && (
                                                                                <Badge intent="information">Required</Badge>
                                                                            )}
                                                                            <Badge intent="neutral">{variable.type}</Badge>
                                                                        </Box>
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild suppressHydrationWarning>
                                                                                <Button appearance="subtle" size="sm" icon={<IconEllipsisSolid size={16} />} aria-label="Variable options" disabled={isReadOnly} suppressHydrationWarning />
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent>
                                                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                                                <DropdownMenuItem>Remove</DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </Box>
                                                                </Card>
                                                            ))
                                                        ) : (
                                                            <Text color="fg.tertiary" fontSize="sm">No variables defined.</Text>
                                                        )}
                                                    </Box>
                                                </Box>
                                                </div>

                                                <div
                                                    id="field-tools"
                                                    onFocus={() => setActiveGuideStep(3)}
                                                    onBlur={() => setActiveGuideStep(null)}
                                                    style={{
                                                        outline: highlightedField === 3 ? "2px solid var(--ax-colors-border-accent)" : "2px solid transparent",
                                                        outlineOffset: "8px",
                                                        borderRadius: "8px",
                                                        transition: "outline-color 0.3s ease",
                                                    }}
                                                >
                                                <Field label="Tools" info="Select tools for the agent">
                                                    {isComparing && comparisonData ? (
                                                        <FieldComparison
                                                            previousValue={comparisonData.tools}
                                                            currentValue={MOCK_AGENTS_DATA["content-localizer"].tools}
                                                        />
                                                    ) : showDiffs && viewingVersion ? (
                                                        <FieldComparison
                                                            previousValue={tools}
                                                            currentValue={MOCK_AGENTS_DATA["content-localizer"].tools}
                                                            mode="stacked"
                                                        />
                                                    ) : (
                                                        <Box display="flex" flexDirection="column" gap="8">
                                                            {configuredTools.length > 0 ? configuredTools.map((toolName, index) => (
                                                                <Box
                                                                    key={index}
                                                                    p="12"
                                                                    border="1"
                                                                    borderColor="border.secondary"
                                                                    rounded="md"
                                                                    bg="bg.default"
                                                                    display="flex"
                                                                    alignItems="center"
                                                                    justifyContent="space-between"
                                                                    gap="12"
                                                                >
                                                                    <Box flex="1">
                                                                        <Text fontWeight="500" fontSize="md">{toolName}</Text>
                                                                        <Text color="fg.secondary" fontSize="sm" mt="4">
                                                                            {TOOL_DESCRIPTIONS[toolName] || "Added from the assistant tool recommendations."}
                                                                        </Text>
                                                                    </Box>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild suppressHydrationWarning>
                                                                            <Button
                                                                                appearance="subtle"
                                                                                size="sm"
                                                                                icon={<IconEllipsisSolid size={16} />}
                                                                                aria-label="Tool options"
                                                                                suppressHydrationWarning
                                                                            />
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent>
                                                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                                                            <DropdownMenuItem>Remove</DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </Box>
                                                            )) : (
                                                                <Text color="fg.tertiary" fontSize="sm">No tools selected yet.</Text>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Field>
                                                </div>

                                                <Field label="Inference Level" info="Select model intelligence" style={{ maxWidth: "320px" }}>
                                                    {isComparing && comparisonData ? (
                                                        <FieldComparison
                                                            previousValue={comparisonData.inferenceLevel || "balanced"}
                                                            currentValue={MOCK_AGENTS_DATA["content-localizer"].inferenceLevel || "balanced"}
                                                        />
                                                    ) : showDiffs && viewingVersion ? (
                                                        <FieldComparison
                                                            previousValue={inferenceLevel}
                                                            currentValue={MOCK_AGENTS_DATA["content-localizer"].inferenceLevel || "balanced"}
                                                            mode="stacked"
                                                        />
                                                    ) : viewingVersion ? (
                                                        <Input
                                                            value={inferenceLevel === "fast" ? "Fast" : inferenceLevel === "advanced" ? "Advanced" : "Balanced (Default)"}
                                                            readOnly
                                                            size="md"
                                                        />
                                                    ) : (
                                                        <Select
                                                            value={(() => {
                                                                const opts = [
                                                                    { label: "Fast", value: "fast" },
                                                                    { label: "Balanced (Default)", value: "balanced" },
                                                                    { label: "Advanced", value: "advanced" },
                                                                ];
                                                                return opts.some((o) => o.value === inferenceLevel)
                                                                    ? inferenceLevel
                                                                    : "balanced";
                                                            })()}
                                                            onValueChange={setInferenceLevel}
                                                            disabled={isReadOnly}
                                                            options={[
                                                                { label: "Fast", value: "fast" },
                                                                { label: "Balanced (Default)", value: "balanced" },
                                                                { label: "Advanced", value: "advanced" },
                                                            ]}
                                                        >
                                                            <SelectTrigger size="md" suppressHydrationWarning>
                                                                {inferenceLevel === "fast"
                                                                    ? "Fast"
                                                                    : inferenceLevel === "advanced"
                                                                      ? "Advanced"
                                                                      : "Balanced (Default)"}
                                                            </SelectTrigger>
                                                            <SelectContent suppressHydrationWarning />
                                                        </Select>
                                                    )}
                                                </Field>

                                                {/* Multi-turn agent settings */}
                                                <Disclosure suppressHydrationWarning>
                                                    <DisclosureTrigger fontSize="md" fontWeight="500" suppressHydrationWarning>
                                                        <Tooltip delayDuration={300} content="Configure multi-turn agent settings including system prompt, memory limits, and first message.">
                                                            <Box display="inline-flex" alignItems="center" gap="4" style={{ cursor: "default" }}>
                                                                Multi-turn agent settings
                                                                <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                            </Box>
                                                        </Tooltip>
                                                    </DisclosureTrigger>
                                                    <DisclosureContent pb="8" suppressHydrationWarning>
                                                        <Box pl="24" display="flex" flexDirection="column" gap="24" pt="16">
                                                            {multiTurnMode ? (
                                                                <>
                                                                    {/* System Prompt */}
                                                                    <Box
                                                                        id="field-system-prompt"
                                                                        display="flex"
                                                                        flexDirection="column"
                                                                        gap="8"
                                                                        onFocus={() => setActiveGuideStep(3)}
                                                                        onBlur={() => setActiveGuideStep(null)}
                                                                        style={{
                                                                            outline: assistantHoveredField === "system-prompt" ? "2px solid var(--ax-colors-border-accent)" : "2px solid transparent",
                                                                            outlineOffset: "8px",
                                                                            borderRadius: "8px",
                                                                            transition: "outline-color 0.2s ease",
                                                                        }}
                                                                    >
                                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                            <HoverCard openDelay={300}>
                                                                                <HoverCardTrigger asChild>
                                                                                    <Box display="inline-flex" alignItems="center" gap="4" style={{ cursor: "default" }}>
                                                                                        <Text fontSize="md" fontWeight="400">System Prompt</Text>
                                                                                        <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                                    </Box>
                                                                                </HoverCardTrigger>
                                                                                <HoverCardContent side="right" align="start" style={{ maxWidth: "280px" }}>
                                                                                    <Box display="flex" flexDirection="column" gap="8" p="4">
                                                                                        <Text fontWeight="600" fontSize="sm">Step 3 of 6 — System Prompt</Text>
                                                                                        <Text fontSize="sm" color="fg.secondary">Sets the agent's permanent persona and guardrails — hidden from users, always active.</Text>
                                                                                        <Text fontSize="sm" color="fg.secondary">Keep it short and authoritative. e.g. <em>"You are a concise marketing assistant. Never fabricate data."</em></Text>
                                                                                        <button
                                                                                            onClick={() => { setShowGuidePanel(true); setGuidePanelView("assistant"); }}
                                                                                            style={{ color: "var(--ax-colors-fg-accent-strong)", background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit", fontSize: "12px", textAlign: "left", textDecoration: "underline" }}
                                                                                        >
                                                                                            View full guide →
                                                                                        </button>
                                                                                    </Box>
                                                                                </HoverCardContent>
                                                                            </HoverCard>
                                                                            {!isReadOnly && (
                                                                                <Button appearance="subtle" size="sm" onClick={() => setSystemPrompt("You are a helpful AI assistant. You have access to tools and can use them to help users. Always be concise, accurate, and professional.")}>
                                                                                    ↺ Reset
                                                                                </Button>
                                                                            )}
                                                                        </Box>
                                                                        <Field description="Wrap dynamic variables in double brackets, e.g. [[variable_name]].">
                                                                            <AutoGrowTextarea
                                                                                value={systemPrompt}
                                                                                onChange={(e) => setSystemPrompt(e.target.value)}
                                                                                placeholder="You are a helpful assistant..."
                                                                                readOnly={isReadOnly}
                                                                            />
                                                                        </Field>
                                                                    </Box>
                                                                    {/* Memory Limit */}
                                                                    <Box
                                                                        id="field-memory-limit"
                                                                        display="flex"
                                                                        flexDirection="column"
                                                                        gap="8"
                                                                        onFocus={() => setActiveGuideStep(4)}
                                                                        onBlur={() => setActiveGuideStep(null)}
                                                                        style={{
                                                                            outline: assistantHoveredField === "memory-limit" ? "2px solid var(--ax-colors-border-accent)" : "2px solid transparent",
                                                                            outlineOffset: "8px",
                                                                            borderRadius: "8px",
                                                                            transition: "outline-color 0.2s ease",
                                                                        }}
                                                                    >
                                                                        <HoverCard openDelay={300}>
                                                                            <HoverCardTrigger asChild>
                                                                                <Box display="inline-flex" alignItems="center" gap="4" style={{ cursor: "default" }}>
                                                                                    <Text fontSize="md" fontWeight="400">Memory Limit</Text>
                                                                                    <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                                </Box>
                                                                            </HoverCardTrigger>
                                                                            <HoverCardContent side="right" align="start" style={{ maxWidth: "280px" }}>
                                                                                <Box display="flex" flexDirection="column" gap="8" p="4">
                                                                                    <Text fontWeight="600" fontSize="sm">Step 4 of 6 — Token Budget</Text>
                                                                                    <Text fontSize="sm" color="fg.secondary">Max conversation turns kept in context. Higher values give the agent more memory but increase cost and latency.</Text>
                                                                                    <Text fontSize="sm" color="fg.secondary">Recommended: <strong>10</strong> turns for most agents. Use 20+ only for long research tasks.</Text>
                                                                                    <button
                                                                                        onClick={() => { setShowGuidePanel(true); setGuidePanelView("assistant"); }}
                                                                                        style={{ color: "var(--ax-colors-fg-accent-strong)", background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit", fontSize: "12px", textAlign: "left", textDecoration: "underline" }}
                                                                                    >
                                                                                        View full guide →
                                                                                    </button>
                                                                                </Box>
                                                                            </HoverCardContent>
                                                                        </HoverCard>
                                                                        <Input type="number" placeholder="10" readOnly={isReadOnly} />
                                                                    </Box>

                                                                    {/* First Message */}
                                                                    <Box
                                                                        id="field-first-message"
                                                                        display="flex"
                                                                        flexDirection="column"
                                                                        gap="8"
                                                                        onFocus={() => setActiveGuideStep(5)}
                                                                        onBlur={() => setActiveGuideStep(null)}
                                                                        style={{
                                                                            outline: assistantHoveredField === "first-message" ? "2px solid var(--ax-colors-border-accent)" : "2px solid transparent",
                                                                            outlineOffset: "8px",
                                                                            borderRadius: "8px",
                                                                            transition: "outline-color 0.2s ease",
                                                                        }}
                                                                    >
                                                                        <Box display="flex" gap="4" alignItems="center">
                                                                            <Text fontSize="md" fontWeight="400">First Message</Text>
                                                                            <Tooltip delayDuration={300} content="A static greeting shown to the user before they begin typing. Not sent to the model.">
                                                                                <Box display="inline-flex" suppressHydrationWarning>
                                                                                    <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                                </Box>
                                                                            </Tooltip>
                                                                        </Box>
                                                                        <Textarea
                                                                            value={initialMessage}
                                                                            onChange={(e) => setInitialMessage(e.target.value)}
                                                                            placeholder="Hi! I can help you with this task..."
                                                                            className="h-28"
                                                                            readOnly={isReadOnly}
                                                                        />
                                                                    </Box>

                                                                    {/* Configured Prompts */}
                                                                    <Box display="flex" flexDirection="column" gap="8">
                                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                            <Box display="flex" gap="4" alignItems="center">
                                                                                <Text fontSize="md" fontWeight="500">Configured Prompts</Text>
                                                                                <Tooltip delayDuration={300} content="Clickable suggestion buttons shown to users to guide the conversation.">
                                                                                    <Box display="inline-flex" suppressHydrationWarning>
                                                                                        <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                                    </Box>
                                                                                </Tooltip>
                                                                            </Box>
                                                                        </Box>
                                                                        <Text fontSize="sm" color="fg.secondary">Clickable buttons that offer suggested prompts to guide the conversation.</Text>
                                                                        <Box display="flex" flexDirection="column" gap="12">
                                                                            {suggestedPrompts.map((item, index) => (
                                                                                <Box key={index} display="flex" gap="12" alignItems="end">
                                                                                    <Box flex="1">
                                                                                        <Text fontSize="sm" mb="4" color="fg.secondary">Label</Text>
                                                                                        <Input
                                                                                            value={item.label}
                                                                                            onChange={(e) => {
                                                                                                const next = [...suggestedPrompts];
                                                                                                next[index] = { ...next[index], label: e.target.value };
                                                                                                setSuggestedPrompts(next);
                                                                                            }}
                                                                                            placeholder="Summarize"
                                                                                            readOnly={isReadOnly}
                                                                                        />
                                                                                    </Box>
                                                                                    <Box style={{ flex: 2 }}>
                                                                                        <Text fontSize="sm" mb="4" color="fg.secondary">Prompt to model</Text>
                                                                                        <Input
                                                                                            value={item.prompt}
                                                                                            onChange={(e) => {
                                                                                                const next = [...suggestedPrompts];
                                                                                                next[index] = { ...next[index], prompt: e.target.value };
                                                                                                setSuggestedPrompts(next);
                                                                                            }}
                                                                                            placeholder="Please summarize the key points."
                                                                                            readOnly={isReadOnly}
                                                                                        />
                                                                                    </Box>
                                                                                    {!isReadOnly && (
                                                                                        <Button appearance="subtle" size="sm" icon={<IconTrashCan size={14} />} aria-label="Remove prompt" onClick={() => setSuggestedPrompts(suggestedPrompts.filter((_, i) => i !== index))} />
                                                                                    )}
                                                                                </Box>
                                                                            ))}
                                                                        </Box>
                                                                        {!isReadOnly && (
                                                                            <Box display="flex" justifyContent="flex-end">
                                                                                <Button appearance="subtle" size="sm" icon={<IconPlus />} onClick={() => setSuggestedPrompts([...suggestedPrompts, { label: "", prompt: "" }])}>
                                                                                    Add
                                                                                </Button>
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                </>
                                                            ) : (
                                                                <Text fontSize="sm" color="fg.tertiary">Enable multi-turn conversation in the Interaction Mode section to configure advanced chat settings.</Text>
                                                            )}
                                                        </Box>
                                                    </DisclosureContent>
                                                </Disclosure>

                                                {/* Files Section nested inside Input per instruction */}
                                                <Box mt="8">
                                                    <Text fontWeight="400" fontSize="md" mb="8">Files</Text>
                                                    <FileUpload>
                                                        <FileUploadDropzone />
                                                    </FileUpload>
                                                </Box>
                                            </Box>
                                        </DisclosureContent>
                                    </Disclosure>

                                    {/* Output Section */}
                                    <Disclosure open={outputOpen} onOpenChange={setOutputOpen} bg="bg.secondary" rounded="md" pl="8" py="4" style={{ flexShrink: 0 }} suppressHydrationWarning>
                                        <DisclosureTrigger fontSize="md" fontWeight="500" suppressHydrationWarning>
                                            Output
                                        </DisclosureTrigger>
                                        <DisclosureContent pl="32" pb="32" suppressHydrationWarning>
                                            <Box style={{ maxWidth: isComparing ? "none" : "980px" }} display="flex" flexDirection="column" gap="24">
                                                <Text color="fg.secondary">Output configuration content goes here...</Text>
                                            </Box>
                                        </DisclosureContent>
                                    </Disclosure>

                                </Box>
                            </Box>
                        </TabsContent>

                        <TabsContent value="triggers" suppressHydrationWarning>
                            <Box p="24">
                                <Text>In-app Triggers Configuration</Text>
                            </Box>
                        </TabsContent>

                        <TabsContent value="quality" suppressHydrationWarning>
                            <Box
                                h="full"
                                display="flex"
                                flexDirection="column"
                                overflowY="auto"
                            >
                                <Box
                                    px="24"
                                    py="24"
                                    style={{
                                        maxWidth: "1464px",
                                        width: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "24px"
                                    }}
                                >
                                    {/* Sub-tabs for Output Evaluation and Execution Guardrails */}
                                    <Box display="flex" gap="4" p="4" bg="bg.secondary" rounded="md" style={{ width: "fit-content" }} suppressHydrationWarning>
                                        <Button
                                            appearance={qualitySubTab === "evaluation" ? "default" : "subtle"}
                                            size="md"
                                            onClick={() => handleSubTabChange("evaluation")}
                                            style={qualitySubTab === "evaluation" ? {
                                                backgroundColor: "var(--ax-colors-bg-default)",
                                                border: "1px solid var(--ax-colors-border-secondary)"
                                            } : {}}
                                            suppressHydrationWarning
                                        >
                                            Output Evaluation
                                        </Button>
                                        <Button
                                            appearance={qualitySubTab === "guardrails" ? "default" : "subtle"}
                                            size="md"
                                            onClick={() => handleSubTabChange("guardrails")}
                                            style={qualitySubTab === "guardrails" ? {
                                                backgroundColor: "var(--ax-colors-bg-default)",
                                                border: "1px solid var(--ax-colors-border-secondary)"
                                            } : {}}
                                            suppressHydrationWarning
                                        >
                                            Execution Guardrails
                                        </Button>
                                    </Box>

                                    {/* Output Evaluation Content */}
                                    {qualitySubTab === "evaluation" && (
                                        <Box display="flex" flexDirection="column" gap="24">
                                            {/* Summary Card and Explanation */}
                                            <Card pt="24" px="24" pb="16" suppressHydrationWarning style={{ maxWidth: "1280px" }}>
                                                <Box display="grid" gap="48" suppressHydrationWarning style={{ gridTemplateColumns: "1fr 1fr" }}>

                                                    <Box>
                                                        <Box display="flex" flexDirection="column" gap="16" style={{ width: "100%" }}>
                                                            <Text fontWeight="600" fontSize="md">Summary for V24</Text>

                                                            <Box display="flex" flexDirection="column" gap="8" style={{ width: "100%" }}>
                                                                <Box display="flex" justifyContent="space-between">
                                                                    <Text fontSize="sm" color="fg.secondary">Total Executions</Text>
                                                                    <Text fontSize="sm" fontWeight="500">75</Text>
                                                                </Box>
                                                                <Box display="flex" justifyContent="space-between">
                                                                    <Text fontSize="sm" color="fg.secondary">Avg. Output Quality Score</Text>
                                                                    <Text fontSize="sm" fontWeight="500">82%</Text>
                                                                </Box>
                                                                <Box
                                                                    display="flex"
                                                                    alignItems="center"
                                                                    gap="8"
                                                                    p="2"
                                                                    rounded="sm"
                                                                    bg={hoveredStatus === 'passed' ? 'bg.default.pressed' : 'transparent'}
                                                                    style={{ cursor: "pointer", transition: "background-color 0.2s" }}
                                                                    onMouseEnter={() => setHoveredStatus('passed')}
                                                                    onMouseLeave={() => setHoveredStatus(null)}
                                                                >
                                                                    <Box style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#17B26A" }} />
                                                                    <Text fontSize="sm" color="fg.secondary">Passed</Text>
                                                                    <Text fontSize="sm" fontWeight="500" ml="auto">65</Text>
                                                                </Box>
                                                                <Box
                                                                    display="flex"
                                                                    alignItems="center"
                                                                    gap="8"
                                                                    p="2"
                                                                    rounded="sm"
                                                                    bg={hoveredStatus === 'failed' ? 'bg.default.pressed' : 'transparent'}
                                                                    style={{ cursor: "pointer", transition: "background-color 0.2s" }}
                                                                    onMouseEnter={() => setHoveredStatus('failed')}
                                                                    onMouseLeave={() => setHoveredStatus(null)}
                                                                >
                                                                    <Box style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#D92D20" }} />
                                                                    <Text fontSize="sm" color="fg.secondary">Failed</Text>
                                                                    <Text fontSize="sm" fontWeight="500" ml="auto">10</Text>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Box>

                                                    <Box display="flex" flexDirection="column">
                                                        <Text fontWeight="600" fontSize="md" mb="12">Output Evaluation</Text>
                                                        <Text fontSize="md" color="fg.secondary" mb="16">
                                                            Opal automatically evaluates the quality of agent outputs based on your defined examples and baseline quality score. Outputs that meet or exceed your quality threshold are marked as passed, while those below are flagged for review or automatic retry.
                                                        </Text>
                                                        <Box style={{ height: "12px", width: "100%", display: "flex", alignItems: "end" }}>
                                                            <Box
                                                                style={{
                                                                    width: "87%",
                                                                    height: "8px",
                                                                    backgroundColor: "#17B26A",
                                                                    borderRadius: "4px 0 0 4px",
                                                                    cursor: "pointer",
                                                                    transform: hoveredStatus === 'passed' ? "scaleY(1.5)" : "scaleY(1)",
                                                                    transformOrigin: "bottom",
                                                                    transition: "transform 0.2s"
                                                                }}
                                                                onMouseEnter={() => setHoveredStatus('passed')}
                                                                onMouseLeave={() => setHoveredStatus(null)}
                                                            />
                                                            <Box
                                                                style={{
                                                                    width: "13%",
                                                                    height: "8px",
                                                                    backgroundColor: "#D92D20",
                                                                    borderRadius: "0 4px 4px 0",
                                                                    cursor: "pointer",
                                                                    transform: hoveredStatus === 'failed' ? "scaleY(1.5)" : "scaleY(1)",
                                                                    transformOrigin: "bottom",
                                                                    transition: "transform 0.2s"
                                                                }}
                                                                onMouseEnter={() => setHoveredStatus('failed')}
                                                                onMouseLeave={() => setHoveredStatus(null)}
                                                            />
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Card>

                                            {/* Output Evaluation Examples */}
                                            <Box bg="bg.secondary" p="24" rounded="md" style={{ maxWidth: "1280px" }} suppressHydrationWarning>
                                                <Box display="flex" alignItems="center" gap="8" mb="8">
                                                    <Text fontWeight="600" fontSize="lg">Output Evaluation Examples</Text>
                                                    <Tooltip content="Provide examples of good outputs to guide the evaluation">
                                                        <Box display="inline-flex" suppressHydrationWarning>
                                                            <IconCircleQuestion size={16} color="var(--ax-colors-fg-tertiary)" />
                                                        </Box>
                                                    </Tooltip>
                                                </Box>
                                                <Text fontSize="md" color="fg.secondary" mb="24">Add your preferred outputs (up to 5) to help Opal evaluate its responses.</Text>

                                                <Box display="flex" justifyContent="flex-end" mb="16" suppressHydrationWarning>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild suppressHydrationWarning>
                                                            <Button icon={<IconPlus size={16} />} appearance="subtle">Add Example</Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent suppressHydrationWarning>
                                                            <DropdownMenuItem>
                                                                <Box display="flex" alignItems="center" gap="8">
                                                                    <IconLink size={16} />
                                                                    <Text>Link from execution logs</Text>
                                                                </Box>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Box display="flex" alignItems="center" gap="8">
                                                                    <IconPen size={16} />
                                                                    <Text>Add manually</Text>
                                                                </Box>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </Box>

                                                <Box display="flex" flexDirection="column" gap="16" mb="24" suppressHydrationWarning>
                                                    <Card p="16" w="full">
                                                        <Box display="flex" flexDirection="column" gap="4" w="full">
                                                            <Box display="flex" justifyContent="space-between" alignItems="center" w="full">
                                                                <Text fontWeight="500">Example Name</Text>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild suppressHydrationWarning>
                                                                        <Button appearance="subtle" size="sm" icon={<IconEllipsisSolid />} aria-label="More actions" />
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent suppressHydrationWarning>
                                                                        <DropdownMenuItem>
                                                                            <Box display="flex" alignItems="center" gap="8">
                                                                                <IconPen size={16} />
                                                                                <Text>Edit</Text>
                                                                            </Box>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <Box display="flex" alignItems="center" gap="8">
                                                                                <IconPlus size={16} />
                                                                                <Text>Add example shot to prompt</Text>
                                                                            </Box>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <Box display="flex" alignItems="center" gap="8" color="fg.error">
                                                                                <IconTrashCan size={16} />
                                                                                <Text>Delete</Text>
                                                                            </Box>
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </Box>
                                                            <Text fontSize="sm" color="fg.secondary">The research topic statement.</Text>
                                                        </Box>
                                                    </Card>
                                                </Box>

                                                <Box display="flex" flexDirection="column" gap="24" suppressHydrationWarning>
                                                    <Box>
                                                        <Text fontSize="md" color="fg.secondary" mb="8">Set your baseline quality score to inform Opal's execution.</Text>
                                                        <Select defaultValue="85" options={[
                                                            { label: "85%", value: "85" },
                                                            { label: "80%", value: "80" },
                                                            { label: "75%", value: "75" },
                                                            { label: "70%", value: "70" },
                                                        ]}>
                                                            <SelectTrigger style={{ width: "80px" }} />
                                                            <SelectContent suppressHydrationWarning />
                                                        </Select>
                                                    </Box>

                                                    <Box>
                                                        <Text fontSize="md" color="fg.secondary" mb="8">Automatically retry if output quality is below the minimum quality score?</Text>
                                                        <Box display="flex" alignItems="center" gap="16">
                                                            <Switch defaultChecked>Auto Retry</Switch>
                                                            <Box display="flex" alignItems="center" gap="8">
                                                                <Text fontSize="sm" color="fg.secondary">Retry up to</Text>
                                                                <Select defaultValue="1" options={[
                                                                    { label: "1", value: "1" },
                                                                    { label: "2", value: "2" },
                                                                    { label: "3", value: "3" },
                                                                ]}>
                                                                    <SelectTrigger style={{ width: "60px" }} />
                                                                    <SelectContent suppressHydrationWarning />
                                                                </Select>
                                                                <Text fontSize="md" color="fg.secondary">attempt(s) if the output doesn't meet the baseline quality score.</Text>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Execution guardrail settings */}
                                    {qualitySubTab === "guardrails" && (
                                        <Box display="flex" flexDirection="column" gap="24">
                                            {/* Summary Card and Enforcer Mode */}
                                            <Card pt="24" px="24" pb="16" suppressHydrationWarning style={{ maxWidth: "1280px" }}>
                                                <Box display="grid" gap="48" suppressHydrationWarning style={{ gridTemplateColumns: "1fr 1fr" }}>

                                                    <Box>
                                                        <Text fontWeight="600" fontSize="md" mb="12">Summary for V24</Text>
                                                        <Box mb="12">
                                                            <Box display="flex" justifyContent="space-between" mb="8">
                                                                <Text fontSize="sm" color="fg.secondary">Total Executions</Text>
                                                                <Text fontSize="sm" fontWeight="500">75</Text>
                                                            </Box>
                                                            <Box
                                                                display="flex"
                                                                alignItems="center"
                                                                gap="8"
                                                                mb="4"
                                                                p="2"
                                                                rounded="sm"
                                                                bg={hoveredStatus === 'passed' ? 'bg.default.pressed' : 'transparent'}
                                                                style={{ cursor: "pointer", transition: "background-color 0.2s" }}
                                                                onMouseEnter={() => setHoveredStatus('passed')}
                                                                onMouseLeave={() => setHoveredStatus(null)}
                                                            >
                                                                <Box style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#17B26A" }} />
                                                                <Text fontSize="sm" color="fg.secondary">Passed</Text>
                                                                <Text fontSize="sm" fontWeight="500" ml="auto">68</Text>
                                                            </Box>
                                                            <Box
                                                                display="flex"
                                                                alignItems="center"
                                                                gap="8"
                                                                mb="4"
                                                                p="2"
                                                                rounded="sm"
                                                                bg={hoveredStatus === 'warning' ? 'bg.default.pressed' : 'transparent'}
                                                                style={{ cursor: "pointer", transition: "background-color 0.2s" }}
                                                                onMouseEnter={() => setHoveredStatus('warning')}
                                                                onMouseLeave={() => setHoveredStatus(null)}
                                                            >
                                                                <Box style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#F79009" }} />
                                                                <Text fontSize="sm" color="fg.secondary">Warning</Text>
                                                                <Text fontSize="sm" fontWeight="500" ml="auto">5</Text>
                                                            </Box>
                                                            <Box
                                                                display="flex"
                                                                alignItems="center"
                                                                gap="8"
                                                                mb="4"
                                                                p="2"
                                                                rounded="sm"
                                                                bg={hoveredStatus === 'failed' ? 'bg.default.pressed' : 'transparent'}
                                                                style={{ cursor: "pointer", transition: "background-color 0.2s" }}
                                                                onMouseEnter={() => setHoveredStatus('failed')}
                                                                onMouseLeave={() => setHoveredStatus(null)}
                                                            >
                                                                <Box style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#D92D20" }} />
                                                                <Text fontSize="sm" color="fg.secondary">Failed</Text>
                                                                <Text fontSize="sm" fontWeight="500" ml="auto">2</Text>
                                                            </Box>
                                                            <Box
                                                                display="flex"
                                                                alignItems="center"
                                                                gap="8"
                                                                p="2"
                                                                rounded="sm"
                                                                bg={hoveredStatus === 'terminated' ? 'bg.default.pressed' : 'transparent'}
                                                                style={{ cursor: "pointer", transition: "background-color 0.2s" }}
                                                                onMouseEnter={() => setHoveredStatus('terminated')}
                                                                onMouseLeave={() => setHoveredStatus(null)}
                                                            >
                                                                <Box style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#949494" }} />
                                                                <Text fontSize="sm" color="fg.secondary">Terminated</Text>
                                                                <Text fontSize="sm" fontWeight="500" ml="auto">2</Text>
                                                            </Box>
                                                        </Box>
                                                    </Box>

                                                    <Box display="flex" flexDirection="column">
                                                        <Box display="flex" alignItems="center" justifyContent="space-between" mb="8" style={{ width: "100%" }}>
                                                            <Box display="flex" alignItems="center" gap="8">
                                                                {currentMode.icon}
                                                                <Text fontWeight="600" fontSize="md">{currentMode.title}</Text>
                                                                {currentMode.isCurrent && <Badge variant="subtle" intent="information" ml="8">Current</Badge>}
                                                            </Box>
                                                            <Box display="flex" gap="8">
                                                                <Button appearance="subtle" size="sm" icon={<IconChevronLeft />} onClick={handlePrevMode} disabled={currentModeIndex === 0} aria-label="Previous mode" />
                                                                <Button appearance="subtle" size="sm" icon={<IconChevronRight />} onClick={handleNextMode} disabled={currentModeIndex === enforcerModes.length - 1} aria-label="Next mode" />
                                                            </Box>
                                                        </Box>
                                                        <Box mb="12" style={{ height: "80px" }}>
                                                            <Text fontSize="md" color="fg.secondary">
                                                                {currentMode.description}
                                                            </Text>
                                                        </Box>
                                                        <Box display="flex" alignItems="end" gap="4">
                                                            <Box flex="1" display="flex" style={{ height: "12px", alignItems: "end" }}>
                                                                <Box
                                                                    style={{
                                                                        flex: "1",
                                                                        height: "8px",
                                                                        backgroundColor: "#17B26A",
                                                                        borderRadius: "4px 0 0 4px",
                                                                        cursor: "pointer",
                                                                        transform: hoveredStatus === 'passed' ? "scaleY(1.5)" : "scaleY(1)",
                                                                        transformOrigin: "bottom",
                                                                        transition: "transform 0.2s"
                                                                    }}
                                                                    onMouseEnter={() => setHoveredStatus('passed')}
                                                                    onMouseLeave={() => setHoveredStatus(null)}
                                                                />
                                                                <Box
                                                                    style={{
                                                                        width: "40px",
                                                                        height: "8px",
                                                                        backgroundColor: "#F79009",
                                                                        cursor: "pointer",
                                                                        transform: hoveredStatus === 'warning' ? "scaleY(1.5)" : "scaleY(1)",
                                                                        transformOrigin: "bottom",
                                                                        transition: "transform 0.2s"
                                                                    }}
                                                                    onMouseEnter={() => setHoveredStatus('warning')}
                                                                    onMouseLeave={() => setHoveredStatus(null)}
                                                                />
                                                                <Box
                                                                    style={{
                                                                        width: "20px",
                                                                        height: "8px",
                                                                        backgroundColor: "#D92D20",
                                                                        cursor: "pointer",
                                                                        transform: hoveredStatus === 'failed' ? "scaleY(1.5)" : "scaleY(1)",
                                                                        transformOrigin: "bottom",
                                                                        transition: "transform 0.2s"
                                                                    }}
                                                                    onMouseEnter={() => setHoveredStatus('failed')}
                                                                    onMouseLeave={() => setHoveredStatus(null)}
                                                                />
                                                                <Box
                                                                    style={{
                                                                        width: "20px",
                                                                        height: "8px",
                                                                        backgroundColor: "#949494",
                                                                        borderRadius: "0 4px 4px 0",
                                                                        cursor: "pointer",
                                                                        transform: hoveredStatus === 'terminated' ? "scaleY(1.5)" : "scaleY(1)",
                                                                        transformOrigin: "bottom",
                                                                        transition: "transform 0.2s"
                                                                    }}
                                                                    onMouseEnter={() => setHoveredStatus('terminated')}
                                                                    onMouseLeave={() => setHoveredStatus(null)}
                                                                />
                                                            </Box>
                                                            <Button
                                                                appearance="subtle"
                                                                size="sm"
                                                                style={{ height: "16px", padding: "0 4px", fontSize: "12px", color: "var(--ax-colors-fg-secondary)" }}
                                                                onMouseEnter={() => setHoveredStatus('total')}
                                                                onMouseLeave={() => setHoveredStatus(null)}
                                                            >
                                                                75
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Card>

                                            <Box bg="bg.secondary" p="24" rounded="md" style={{ maxWidth: "1280px" }}>
                                                <Text fontWeight="600" fontSize="lg" mb="24">Execution guardrail settings</Text>
                                                <Box style={{ maxWidth: "980px" }} display="flex" flexDirection="column" gap="24">
                                                    <HoverCard openDelay={200}>
                                                        <Field
                                                            label={
                                                                <HoverCardTrigger asChild>
                                                                    <span style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                                                                        Sensitivity
                                                                        <span style={{ display: "inline-flex" }} suppressHydrationWarning>
                                                                            <IconCircleQuestion size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                        </span>
                                                                    </span>
                                                                </HoverCardTrigger>
                                                            }
                                                        >
                                                            <Box display="flex" alignItems="start" gap="12" style={{ maxWidth: "400px" }}>
                                                                <HoverCardTrigger asChild>
                                                                    <Box flex="1" pt="6">
                                                                        <Range
                                                                            value={sensitivity}
                                                                            onValueChange={setSensitivity}
                                                                            max={5}
                                                                            min={1}
                                                                            step={1}
                                                                            suppressHydrationWarning
                                                                            marks={[
                                                                                { value: 1, label: "1 (Strict)" },
                                                                                { value: 5, label: "5" },
                                                                            ]}
                                                                        />
                                                                    </Box>
                                                                </HoverCardTrigger>
                                                                <Input
                                                                    type="number"
                                                                    value={sensitivity}
                                                                    onChange={(e) => {
                                                                        const val = parseInt(e.target.value);
                                                                        if (!isNaN(val) && val >= 1 && val <= 5) {
                                                                            setSensitivity(val);
                                                                        }
                                                                    }}
                                                                    style={{ width: "80px" }}
                                                                    size="md"
                                                                    suppressHydrationWarning
                                                                />
                                                            </Box>

                                                        </Field>
                                                        <HoverCardContent style={{ maxWidth: "280px" }}>
                                                            <Box display="flex" flexDirection="column" gap="8">
                                                                <Text fontSize="md" fontWeight="500">Sensitivity</Text>
                                                                <Text fontSize="sm" color="fg.secondary">
                                                                    Adjusts how sensitive the guardrails are to anomalous behavior. Higher values are stricter and will flag deviations more quickly.
                                                                </Text>
                                                                <Text fontSize="sm" color="fg.secondary">
                                                                    <strong>Low</strong> (e.g., 1–2): More permissive. Allows for more variation before flagging an issue.
                                                                </Text>
                                                                <Text fontSize="sm" color="fg.secondary">
                                                                    <strong>High</strong> (e.g., 4–5): More conservative. Flags even minor deviations from the baseline.
                                                                </Text>
                                                                <Text fontSize="sm" color="fg.secondary">
                                                                    A setting of 2 is the recommended balance for most agents.
                                                                </Text>
                                                            </Box>
                                                        </HoverCardContent>
                                                    </HoverCard>

                                                    <Field>
                                                        <Box display="flex" alignItems="center" gap="8">
                                                            <Switch defaultChecked />
                                                            <Text>Automatically terminate executions in Enforcer mode</Text>
                                                            <Tooltip content="When enabled, executions that exceed critical guardrails will be terminated automatically in Enforcer mode. This prevents rogue agent runs, and credits for the terminated executions will be automatically refunded.">
                                                                <Box display="inline-flex" suppressHydrationWarning>
                                                                    <IconCircleQuestion size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                </Box>
                                                            </Tooltip>
                                                        </Box>
                                                    </Field>
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </TabsContent>

                        <TabsContent value="logs" suppressHydrationWarning>
                            <Box p="24">
                                <Text>Agent Activity Logs</Text>
                            </Box>
                        </TabsContent>
                    </Box>
                </Tabs>
            </Box>

            {/* Version History Sidebar */}
            <VersionHistory
                isOpen={isVersionHistoryOpen}
                onClose={() => setIsVersionHistoryOpen(false)}
                onViewVersion={handleViewVersion}
                onRestoreVersion={handleRestoreVersion}
                onCompareVersion={handleCompareVersion}
                onDuplicateVersion={handleDuplicateVersion}
                onHideVersion={handleHideVersion}
                onNameVersion={handleNameVersion}
                onExitVersionView={handleExitVersionView}
                viewingVersionId={viewingVersion}
                isComparing={isComparing}
                comparisonVersionId={comparisonVersionId}
                versions={versions}
            />

            <TestRunTray
                isOpen={isTestRunOpen}
                onClose={() => setIsTestRunOpen(false)}
                variables={variables}
            />

            <GuideExampleTray
                step={activeGuideExampleStep}
                isOpen={activeGuideExampleStep !== null}
                onClose={() => setActiveGuideExampleStep(null)}
            />

            {/* Agent builder assistant panel */}
            <div id="figma-agent-assistant-panel">
                <AgentAssistantPanel
                    isOpen={showGuidePanel}
                    onClose={() => setShowGuidePanel(false)}
                    view={guidePanelView}
                    onViewChange={setGuidePanelView}
                    hasAgentDetails={hasAgentDetails}
                    promptTemplate={promptTemplate}
                    tools={tools}
                    variables={variables}
                    onInsertToPrompt={handleInsertToPrompt}
                    onAddTool={handleAddTool}
                    onApplyTemplate={(prompt) => setPromptTemplate(prompt)}
                    activeFieldStep={activeGuideStep}
                    onWizardStepChange={handleWizardStepChange}
                    onAssistantFieldHover={handleAssistantFieldHover}
                    onRunPreview={() => setIsTestRunOpen(true)}
                    onAskOpal={handleAskOpal}
                    onOpenExample={handleOpenGuideExample}
                    multiTurnMode={multiTurnMode}
                />
            </div>
        </Box>
    );
}

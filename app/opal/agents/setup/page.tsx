"use client";

import {
    Box,
    Heading,
    Text,
    Button,
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
    IconSettings,
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
    IconChevronRight,
    IconChevronLeft,
    IconLink,
    IconPen,
    IconPlus,
    IconTrashCan,
    IconMessages,
} from "@optimizely/axiom-icons";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Range, FileUpload, FileUploadDropzone } from "@optiaxiom/react/unstable";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { VersionHistory, Version } from "./components/VersionHistory";
import { VersionPreviewBanner } from "./components/VersionPreviewBanner";
import { ComparisonBanner } from "./components/ComparisonBanner";
import { FieldComparison } from "./components/FieldComparison";
import { TestRunTray } from "./components/TestRunTray";
import { CustomizeChatModal } from "./components/CustomizeChatModal";

// Custom auto-resizing textarea component
const AutoResizeTextarea = (props: any) => {
    const ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = "auto";
            ref.current.style.height = `${ref.current.scrollHeight}px`;
        }
    }, [props.value]);

    return (
        <Textarea
            ref={ref}
            {...props}
            onChange={(e: any) => {
                if (ref.current) {
                    ref.current.style.height = "auto";
                    ref.current.style.height = `${ref.current.scrollHeight}px`;
                }
                props.onChange?.(e);
            }}
        />
    );
};

// Mock data for agents
const DEFAULT_SYSTEM_PROMPT = `You are a conversational agent interacting with a user.
The user can ask follow-up questions and you should respond in context of the ongoing conversation. Use the conversation history to maintain continuity across turns.

Important guidelines:
 - Stay within the scope of your defined capabilities and the tools available to you.
 - If a question is outside your area of expertise or capabilities, clearly say so rather than guessing or making up information.
 - Do not hallucinate facts, data, or capabilities you don't have.
 - If you need more information from the user to provide a good answer, ask for it.
 - Use the tools provided to you when they can help answer the user's question accurately.`;

const MOCK_AGENTS_DATA: Record<string, any> = {
    "content-localizer": {
        name: "Content Translation",
        agentId: "content_translation",
        description: "Converts content or PDFs into different languages, accounting for grammatical differences and adapting to cultural and company-specific terminology during the translation process. This ensures accurate and contextually appropriate linguistic conversion, enabling you to effectively communicate with diverse audiences and streamline your global content efforts.",
        promptTemplate: `Role:
You are an expert English-to-[[language]] translator with deep knowledge of both languages, cultural nuances, and technical terminology.

Input:
1. Source text: [[content]] or [[file]] (at least one needed)
2. Term-base: {instruction: translate to [[language]]}
3. Language to translate to: [[language]]

Goal:
Translate the provided content into [[language]] with maximum accuracy while maintaining the original meaning, tone, and style.
Term-base compliance:
* You may be provided with a term-base with the user's desired translation for specific words
* ALWAYS use the exact equivalent provided in the term-base for any word that appears in the source text
* Maintain the exact capitalization, spacing, and formatting of the original source text
* Do not modify, translate, or adapt term-base entries - use them exactly as specified
* If a term and equivalent are the same, it should be used as-is, including capitalization

Translation guidelines:
1. Accuracy: Preserve the exact meaning and intent of the source text.`,
        tools: "",
        variables: [
            { name: "language", description: "What language to translate to", type: "String", required: true },
            { name: "content", description: "Text or URL content that needs to be translated", type: "String", required: true },
            { name: "file", description: "File to translate, if content was provided", type: "String", required: true }
        ],
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
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
    const searchParams = useSearchParams();
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const mode = searchParams.get("mode") || "create"; // 'create' or 'edit'
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
    const [chatConfigOpen, setChatConfigOpen] = useState(true);

    // Setup Fields State
    const [agentName, setAgentName] = useState("");
    const [agentId, setAgentId] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [description, setDescription] = useState("");
    const [promptTemplate, setPromptTemplate] = useState("");
    const [tools, setTools] = useState("");
    const [variables, setVariables] = useState<any[]>([]);
    const [sensitivity, setSensitivity] = useState(3);

    // New Fields
    const [enabledInChat, setEnabledInChat] = useState(true);
    const [multiTurnMode, setMultiTurnMode] = useState(true);
    const [memoryTokenLimit, setMemoryTokenLimit] = useState(100000);
    const [initialMessage, setInitialMessage] = useState("Hi! I'm your assistant. How can I help?");
    const [conversationStarter, setConversationStarter] = useState("Once you summarize the article and present the takeaways, be prepared answer any follow up questions on the article if the reader needs further clarification.");
    const [suggestedPrompts, setSuggestedPrompts] = useState<{ label: string; prompt: string }[]>([
        { label: "Author Bio", prompt: "Who is the author?" },
        { label: "Tell me more about the...", prompt: "Tell me more about this topic..." }
    ]);

    const [restrictFirstTurn, setRestrictFirstTurn] = useState(true);
    const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);

    // State for scroll
    const [isScrolled, setIsScrolled] = useState(false);

    const [customizeChatModalOpen, setCustomizeChatModalOpen] = useState(false);

    // Test Run State
    const [isTestRunOpen, setIsTestRunOpen] = useState(false);

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
            memoryTokenLimit: memoryTokenLimit,
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

        // Handle creativity as either 0-1 (decimal) or 0-100 (percentage)
        const creativityVal = data.creativity !== undefined ? data.creativity : 0;
        const normalizedCreativity = creativityVal > 1 ? creativityVal / 100 : creativityVal;
        setMemoryTokenLimit(data.memoryTokenLimit || Math.round(100000 + (normalizedCreativity * 600000)));
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
        // Handle creativity as either 0-1 (decimal) or 0-100 (percentage)
        const creativityVal = data.creativity !== undefined ? data.creativity : 0;
        const normalizedCreativity = creativityVal > 1 ? creativityVal / 100 : creativityVal;
        setMemoryTokenLimit(data.memoryTokenLimit || Math.round(100000 + (normalizedCreativity * 600000)));

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
                // Handle creativity as either 0-1 (decimal) or 0-100 (percentage)
                const creativityVal = data.creativity !== undefined ? data.creativity : 40;
                const normalizedCreativity = creativityVal > 1 ? creativityVal / 100 : creativityVal;
                setMemoryTokenLimit(data.memoryTokenLimit || Math.round(100000 + (normalizedCreativity * 600000)));
                setSystemPrompt(data.systemPrompt || DEFAULT_SYSTEM_PROMPT);
            } else {
                // Default fallback (Content Translation)
                const data = MOCK_AGENTS_DATA["content-localizer"];
                setAgentName(data.name);
                setAgentId(data.agentId);
                setDescription(data.description);
                setPromptTemplate(data.promptTemplate);
                setTools(data.tools);
                setVariables(data.variables);
                // Handle creativity as either 0-1 (decimal) or 0-100 (percentage)
                const creativityVal = data.creativity !== undefined ? data.creativity : 40;
                const normalizedCreativity = creativityVal > 1 ? creativityVal / 100 : creativityVal;
                setMemoryTokenLimit(data.memoryTokenLimit || Math.round(100000 + (normalizedCreativity * 600000)));
                setSystemPrompt(data.systemPrompt || DEFAULT_SYSTEM_PROMPT);
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
            setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
            setVariables([]);
            setMemoryTokenLimit(100000);
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
                                        <Button
                                            appearance="default"
                                            size="lg"
                                            icon={<IconPlay />}
                                            disabled={isReadOnly}
                                            onClick={() => {
                                                setIsTestRunOpen(!isTestRunOpen);
                                                if (!isTestRunOpen) setIsVersionHistoryOpen(false);
                                            }}
                                        >
                                            Test Run
                                        </Button>
                                        <Tooltip delayDuration={300} content="Version History">
                                            <Button
                                                appearance="default"
                                                size="lg"
                                                icon={<IconClockRotateLeft size={20} />}
                                                aria-label="Version History"
                                                onClick={() => {
                                                    setIsVersionHistoryOpen(!isVersionHistoryOpen);
                                                    if (!isVersionHistoryOpen) setIsTestRunOpen(false);
                                                }}
                                                suppressHydrationWarning
                                            />
                                        </Tooltip>
                                        <Button appearance="default" size="lg" icon={<IconDots />} aria-label="More options" disabled={isReadOnly} />
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
                                <TabsTrigger value="setup2" suppressHydrationWarning>Setup 2</TabsTrigger>
                                <TabsTrigger value="setup3" suppressHydrationWarning>Setup 3</TabsTrigger>
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
                                    <Disclosure defaultOpen={detailsOpen} bg="bg.secondary" rounded="md" pl="8" py="4" style={{ flexShrink: 0 }} suppressHydrationWarning>
                                        <DisclosureTrigger fontSize="md" fontWeight="500" suppressHydrationWarning>
                                            Details
                                        </DisclosureTrigger>
                                        <DisclosureContent pl="24" pb="32" suppressHydrationWarning>
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
                                                <Box>
                                                    <Text fontWeight="500" fontSize="md" mb="4">Interaction Mode</Text>
                                                    <Text fontSize="sm" color="fg.secondary" mb="12">Configure how users interact with this agent</Text>

                                                    <Box display="flex" flexDirection="column" gap="16">
                                                        {/* Support back-and-forth dialogue */}
                                                        <Box display="flex" alignItems="center" gap="12">
                                                            <Switch checked={multiTurnMode} onCheckedChange={setMultiTurnMode} disabled={isReadOnly} />
                                                            <Text fontWeight="500">Support back-and-forth dialogue</Text>
                                                        </Box>

                                                        {/* Enable in Chat */}
                                                        <Box display="flex" alignItems="center" gap="12">
                                                            <Switch checked={enabledInChat} onCheckedChange={setEnabledInChat} disabled={isReadOnly} />
                                                            <Text fontWeight="500">Enable in Chat</Text>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </DisclosureContent>
                                    </Disclosure>

                                    {/* Input Section */}
                                    <Disclosure defaultOpen={inputOpen} bg="bg.secondary" rounded="md" pl="8" py="4" style={{ flexShrink: 0 }} suppressHydrationWarning>
                                        <DisclosureTrigger fontSize="md" fontWeight="500" suppressHydrationWarning>
                                            <Box display="flex" alignItems="center" gap="4">
                                                Input
                                                <Tooltip delayDuration={300} content="Define how the agent should behave and the inputs it accepts">
                                                    <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                </Tooltip>
                                            </Box>
                                        </DisclosureTrigger>
                                        <DisclosureContent pl="24" pb="32" suppressHydrationWarning>
                                            <Box style={{ maxWidth: isComparing ? "none" : "980px" }} display="flex" flexDirection="column" gap="24">

                                                <Field label={multiTurnMode ? "First Prompt" : "Prompt"} info="">
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
                                                            {promptTemplate.split(/(\[\[.*?\]\]|\{.*?\}|`.*?`)/g).map((part, i) => {
                                                                if (part.startsWith("[[") && part.endsWith("]]")) {
                                                                    return <span key={i} style={{ color: "var(--ax-colors-fg-warning-strong)", fontWeight: "600" }}>{part}</span>;
                                                                }
                                                                if (part.startsWith("{") && part.endsWith("}")) {
                                                                    return <span key={i} style={{ color: "var(--ax-colors-fg-accent-strong)", fontWeight: "600" }}>{part}</span>;
                                                                }
                                                                if (part.startsWith("`") && part.endsWith("`")) {
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
                                                    ) : (
                                                        <Textarea
                                                            value={promptTemplate}
                                                            onChange={(e) => setPromptTemplate(e.target.value)}
                                                            placeholder="Role: You are a marketing copy expert..."
                                                            className="h-64"
                                                        />
                                                    )}
                                                </Field>

                                                {/* System Prompt Template - Visible only when multiTurnMode is true */}
                                                {multiTurnMode && (
                                                    <>
                                                        <Box>
                                                            <Box display="flex" alignItems="center" justifyContent="space-between" mb="8">
                                                                <Box display="flex" alignItems="center" gap="4">
                                                                    <Text fontSize="md">Recurring Prompt</Text>
                                                                    <Tooltip delayDuration={300} content="Defines the agent's persona and behavioral guidelines. Supports variables and directives.">
                                                                        <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                    </Tooltip>
                                                                </Box>
                                                                <Box display="flex" gap="12">
                                                                    <Button appearance="subtle" size="sm" icon={<IconTrashCan size={16} />} onClick={() => setSystemPrompt("")}>Clear</Button>
                                                                    <Button
                                                                        appearance="subtle"
                                                                        size="sm"
                                                                        icon={<IconClockRotateLeft size={16} />}
                                                                        onClick={() => {
                                                                            if (MOCK_AGENTS_DATA[agentId]?.systemPrompt) {
                                                                                setSystemPrompt(MOCK_AGENTS_DATA[agentId].systemPrompt);
                                                                            }
                                                                        }}
                                                                    >
                                                                        Reset
                                                                    </Button>
                                                                </Box>
                                                            </Box>

                                                            <Textarea
                                                                value={systemPrompt}
                                                                onChange={(e) => {
                                                                    setSystemPrompt(e.target.value);
                                                                    e.target.style.height = "auto";
                                                                    e.target.style.height = `${Math.min(e.target.scrollHeight, 800)}px`;
                                                                }}
                                                                placeholder="You are a conversational agent interacting with a user..."
                                                                style={{
                                                                    minHeight: "192px", // kept the original h-48 look as min height
                                                                    maxHeight: "800px",
                                                                    resize: "none",
                                                                    overflowY: "auto"
                                                                }}
                                                                readOnly={isReadOnly}
                                                                ref={(ref) => {
                                                                    if (ref) {
                                                                        ref.style.height = "auto";
                                                                        ref.style.height = `${Math.min(ref.scrollHeight, 800)}px`;
                                                                    }
                                                                }}
                                                            />
                                                            <Text fontSize="sm" color="fg.tertiary" mt="8">
                                                                Wrap dynamic variables in double brackets and tools in backticks, e.g. [[variable_name]] or `tool_name`.
                                                            </Text>
                                                        </Box>

                                                        <Box>
                                                            <Button appearance="default" icon={<IconSettings />} onClick={() => setCustomizeChatModalOpen(true)}>Advanced Chat Settings</Button>
                                                        </Box>
                                                    </>
                                                )}





                                                <Box>
                                                    <Box display="flex" justifyContent="space-between" mb="8">
                                                        <Text fontWeight="500" fontSize="md">Input Variables</Text>
                                                        <Button appearance="subtle" size="sm" icon={<IconPlus />} disabled={isReadOnly}>Add Variable</Button>
                                                    </Box>
                                                    <Text fontSize="sm" color="fg.secondary" mb="12">Reference these in instructions using {"{{"}"variableName{"}}"}</Text>
                                                    {/* Variables List */}
                                                    <Box display="flex" flexDirection="column" gap="8">
                                                        {variables.length > 0 ? (
                                                            variables.map((variable, index) => (
                                                                <Card key={index} p="12">
                                                                    <Box display="flex" alignItems="center" justifyContent="space-between" w="full">
                                                                        <Box display="flex" gap="12" alignItems="center" flex="1">
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
                                                        tools ? (
                                                            <Box display="flex" flexDirection="column" gap="8">
                                                                {tools.split(",").map((toolName, index) => (
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
                                                                            <Text fontWeight="500" fontSize="md">{toolName.trim()}</Text>
                                                                            <Text color="fg.secondary" fontSize="sm" mt="4">Tool description placeholder</Text>
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
                                                                ))}
                                                            </Box>
                                                        ) : (
                                                            <Box
                                                                border="2"
                                                                borderColor="border.tertiary"
                                                                style={{ borderStyle: "dashed" }}
                                                                rounded="md"
                                                                p="32"
                                                                display="flex"
                                                                flexDirection="column"
                                                                alignItems="center"
                                                                justifyContent="center"
                                                                gap="16"
                                                                bg="transparent"
                                                            >
                                                                <Text color="fg.secondary" textAlign="center">
                                                                    Specify the tools via <span style={{ color: "var(--ax-colors-fg-default)", backgroundColor: "var(--ax-colors-bg-tertiary)", padding: "2px 4px", borderRadius: "4px", border: "1px solid var(--ax-colors-border-secondary)" }}>`tool_name`</span> in your prompt template.
                                                                </Text>
                                                                <Button icon={<IconPlus />} appearance="default" size="sm">Add Tool</Button>
                                                            </Box>
                                                        )
                                                    )}
                                                </Field>



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
                                    <Disclosure defaultOpen={outputOpen} bg="bg.secondary" rounded="md" pl="8" py="4" style={{ flexShrink: 0 }} suppressHydrationWarning>
                                        <DisclosureTrigger fontSize="md" fontWeight="500" suppressHydrationWarning>
                                            Output
                                        </DisclosureTrigger>
                                        <DisclosureContent pl="24" pb="32" suppressHydrationWarning>
                                            <Box style={{ maxWidth: isComparing ? "none" : "980px" }} display="flex" flexDirection="column" gap="24">
                                                <Text color="fg.secondary">Output configuration content goes here...</Text>
                                            </Box>
                                        </DisclosureContent>
                                    </Disclosure>

                                </Box>
                            </Box>
                        </TabsContent>

                        <TabsContent value="setup2" style={{ height: "100%" }} suppressHydrationWarning>
                            <Box
                                h="full"
                                display="flex"
                                flexDirection="column"
                                style={{
                                    overflowY: "auto",
                                    WebkitOverflowScrolling: "touch",
                                }}
                            >
                                <Box p="24" display="flex" flexDirection="column" gap="16">
                                    {/* Banner explaining this is alternative layout */}
                                    <Box p="16" bg="bg.information.subtle" rounded="md" borderL="2" style={{ borderLeftColor: "var(--ax-colors-border-information)", borderLeftWidth: "4px" }}>
                                        <Text fontWeight="600" mb="4">Alternative Layout (Setup 2)</Text>
                                        <Text fontSize="sm" color="fg.secondary">
                                            This is an alternative organization that groups Quick Start Prompts under Chat Experience since they're part of the chat UX, keeping Instructions section focused on the core agent behavior.
                                        </Text>
                                    </Box>

                                    {/* Details Section - Same as Setup 1 */}
                                    <Disclosure defaultOpen={true} bg="bg.secondary" rounded="md" pl="8" py="4" suppressHydrationWarning>
                                        <DisclosureTrigger fontSize="md" fontWeight="500" suppressHydrationWarning>
                                            Details
                                        </DisclosureTrigger>
                                        <DisclosureContent pl="24" pb="32" suppressHydrationWarning>
                                            <Text fontSize="sm" color="fg.secondary">
                                                (Same as Setup 1 - Name, Description, Icon, Category)
                                            </Text>
                                        </DisclosureContent>
                                    </Disclosure>

                                    {/* Interaction Mode Section */}
                                    <Disclosure defaultOpen={true} bg="bg.secondary" rounded="md" pl="8" py="4" suppressHydrationWarning>
                                        <DisclosureTrigger fontSize="md" fontWeight="500" suppressHydrationWarning>
                                            <Box display="flex" alignItems="center" gap="4">
                                                Interaction Mode
                                                <Tooltip delayDuration={300} content="Configure how users interact with this agent">
                                                    <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                </Tooltip>
                                            </Box>
                                        </DisclosureTrigger>
                                        <DisclosureContent pl="24" pb="32" suppressHydrationWarning>
                                            <Box display="flex" flexDirection="column" gap="24">
                                                {/* Interaction Mode Toggle */}
                                                <Box>
                                                    <Text fontWeight="500" fontSize="md" mb="4">Interaction Mode</Text>
                                                    <Text fontSize="sm" color="fg.secondary" mb="12">Configure how users interact with this agent</Text>

                                                    <Box display="flex" flexDirection="column" gap="16">
                                                        {/* Support back-and-forth dialogue */}
                                                        <Box display="flex" alignItems="center" gap="12">
                                                            <Switch checked={multiTurnMode} onCheckedChange={setMultiTurnMode} disabled={isReadOnly} />
                                                            <Box display="flex" alignItems="center" gap="4">
                                                                <Text fontWeight="500">Support back-and-forth dialogue</Text>
                                                                <Tooltip delayDuration={300} content="Select this option for multi-turn conversations for this agent, facilitating interactive guidance, clarification, and personalized user experiences.">
                                                                    <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                </Tooltip>
                                                            </Box>
                                                        </Box>

                                                        {/* Enable in Chat */}
                                                        <Box display="flex" alignItems="center" gap="12">
                                                            <Switch checked={enabledInChat} onCheckedChange={setEnabledInChat} disabled={isReadOnly} />
                                                            <Text fontWeight="500">Enable in Chat</Text>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </DisclosureContent>
                                    </Disclosure>

                                    {/* Input Section */}
                                    <Disclosure defaultOpen={true} bg="bg.secondary" rounded="md" pl="8" py="4" style={{ flexShrink: 0 }} suppressHydrationWarning>
                                        <DisclosureTrigger fontSize="md" fontWeight="500" suppressHydrationWarning>
                                            <Box display="flex" alignItems="center" gap="4">
                                                Input
                                                <Tooltip delayDuration={300} content="Define how the agent should behave and the inputs it accepts">
                                                    <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                </Tooltip>
                                            </Box>
                                        </DisclosureTrigger>
                                        <DisclosureContent pl="24" pb="32" suppressHydrationWarning>
                                            <Box style={{ maxWidth: isComparing ? "none" : "980px" }} display="flex" flexDirection="column" gap="24">

                                                <Field label={multiTurnMode ? "First Prompt" : "Prompt"} info="A prompt that automatically runs at the start of a conversation to prime the agent's initial response.">
                                                    <AutoResizeTextarea
                                                        value={promptTemplate}
                                                        onChange={(e: any) => setPromptTemplate(e.target.value)}
                                                        placeholder="Role: You are a marketing copy expert..."
                                                        style={{
                                                            minHeight: "200px",
                                                            maxHeight: "calc(100vh - 240px)",
                                                            resize: "none",
                                                            overflowY: "auto"
                                                        }}
                                                    />
                                                </Field>

                                                {/* System Prompt Template - Visible only when multiTurnMode is true */}
                                                {multiTurnMode && (
                                                    <>
                                                        <Box>
                                                            <Box display="flex" alignItems="center" justifyContent="space-between" mb="8">
                                                                <Box display="flex" alignItems="center" gap="4">
                                                                    <Text fontSize="md">System Prompt</Text>
                                                                    <Tooltip delayDuration={300} content="Defines the agent’s persona and behavioral guidelines. It supports variables and directives for dynamic instruction and customization.">
                                                                        <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                    </Tooltip>
                                                                </Box>
                                                                <Box display="flex" gap="12">
                                                                    <Button appearance="subtle" size="sm" icon={<IconTrashCan size={16} />} onClick={() => setSystemPrompt("")}>Clear</Button>
                                                                    <Button
                                                                        appearance="subtle"
                                                                        size="sm"
                                                                        icon={<IconClockRotateLeft size={16} />}
                                                                        onClick={() => {
                                                                            if (MOCK_AGENTS_DATA[agentId]?.systemPrompt) {
                                                                                setSystemPrompt(MOCK_AGENTS_DATA[agentId].systemPrompt);
                                                                            }
                                                                        }}
                                                                    >
                                                                        Reset
                                                                    </Button>
                                                                </Box>
                                                            </Box>

                                                            <AutoResizeTextarea
                                                                value={systemPrompt}
                                                                onChange={(e: any) => setSystemPrompt(e.target.value)}
                                                                placeholder="You are a conversational agent interacting with a user..."
                                                                style={{
                                                                    minHeight: "200px",
                                                                    maxHeight: "calc(100vh - 240px)",
                                                                    resize: "none",
                                                                    overflowY: "auto"
                                                                }}
                                                                readOnly={isReadOnly}
                                                            />
                                                            <Text fontSize="sm" color="fg.tertiary" mt="8">
                                                                Wrap dynamic variables in double brackets and tools in backticks, e.g. [[variable_name]] or `tool_name`.
                                                            </Text>
                                                        </Box>

                                                        {/* Advanced Chat Settings Toggle */}
                                                        <Box>
                                                            {!chatConfigOpen ? (
                                                                <Box display="flex" alignItems="center" gap="12">
                                                                    <Switch checked={false} onCheckedChange={() => setChatConfigOpen(true)} />
                                                                    <Text fontWeight="500">Advanced Chat Settings</Text>
                                                                </Box>
                                                            ) : (
                                                                <Box display="flex" flexDirection="column" gap="16">
                                                                    <Box display="flex" alignItems="center" gap="12">
                                                                        <Switch checked={true} onCheckedChange={() => setChatConfigOpen(false)} />
                                                                        <Text fontWeight="500">Advanced Chat Settings</Text>
                                                                    </Box>
                                                                    <Box ml="20" pl="32" display="flex" flexDirection="column" gap="16" borderL="2" borderColor="border.tertiary">
                                                                        {/* Advanced Chat Settings Content */}
                                                                        <Box display="flex" flexDirection="column" gap="16">

                                                                            <Box style={{ maxWidth: "360px" }}>
                                                                                <Box display="flex" alignItems="center" gap="4" mb="8">
                                                                                    <Text fontSize="md">Memory Token Limit</Text>
                                                                                    <Tooltip delayDuration={300} content="Defines the maximum token count for the agent's conversation memory. This limit ensures Opal's context window remains manageable by trimming older messages as the conversation grows.">
                                                                                        <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                                    </Tooltip>
                                                                                </Box>
                                                                                <Box display="flex" alignItems="center" gap="16">
                                                                                    <Box flex="1">
                                                                                        <Range
                                                                                            value={memoryTokenLimit}
                                                                                            onValueChange={setMemoryTokenLimit}
                                                                                            max={700000}
                                                                                            min={100000}
                                                                                            step={1000}
                                                                                            marks={[
                                                                                                { value: 100000, label: "Low" },
                                                                                                { value: 400000, label: "Medium" },
                                                                                                { value: 700000, label: "High" },
                                                                                            ]}
                                                                                        />
                                                                                    </Box>
                                                                                    <Input
                                                                                        type="number"
                                                                                        value={memoryTokenLimit}
                                                                                        onChange={(e) => setMemoryTokenLimit(parseInt(e.target.value) || 0)}
                                                                                        style={{ width: "100px", height: "32px", marginBottom: "20px" }}
                                                                                    />
                                                                                </Box>
                                                                            </Box>

                                                                            <Box borderT="1" borderColor="border.tertiary" />

                                                                            <Text fontWeight="600" color="fg.secondary" fontSize="md">Multi-turn Chat Experience</Text>

                                                                            <Box>
                                                                                <Box display="flex" gap="4" alignItems="center" mb="4">
                                                                                    <Text fontSize="md">First Message</Text>
                                                                                    <Tooltip delayDuration={300} content="A static greeting displayed to the user before they begin typing. This message is not sent to Opal.">
                                                                                        <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                                    </Tooltip>
                                                                                </Box>
                                                                                <Textarea
                                                                                    value={initialMessage}
                                                                                    onChange={(e) => setInitialMessage(e.target.value)}
                                                                                    placeholder="Hi! I can help you..."
                                                                                    style={{ height: "120px", resize: "none" }}
                                                                                />
                                                                            </Box>

                                                                            <Box flex="1" overflowY="visible" mt="16">
                                                                                <Box display="flex" flexDirection="column" gap="4" mb="12">
                                                                                    <Text fontSize="md">Quick Start Prompts</Text>
                                                                                    <Text fontSize="sm" color="fg.secondary">Clickable buttons that offer suggested prompts to guide the conversation.</Text>
                                                                                </Box>
                                                                                <Box display="flex" flexDirection="column" gap="16">
                                                                                    {suggestedPrompts.map((item, index) => (
                                                                                        <Box key={index} display="flex" gap="12" alignItems="end">
                                                                                            <Box flex="1">
                                                                                                <Text fontSize="md" mb="4">Suggested Prompt</Text>
                                                                                                <Input
                                                                                                    value={item.label}
                                                                                                    onChange={(e) => {
                                                                                                        const newPrompts = [...suggestedPrompts];
                                                                                                        newPrompts[index].label = e.target.value;
                                                                                                        setSuggestedPrompts(newPrompts);
                                                                                                    }}
                                                                                                    placeholder="Author Bio"
                                                                                                />
                                                                                            </Box>
                                                                                            <Box flex="1">
                                                                                                <Text fontSize="md" mb="4">Prompt to LLM</Text>
                                                                                                <Input
                                                                                                    value={item.prompt}
                                                                                                    onChange={(e) => {
                                                                                                        const newPrompts = [...suggestedPrompts];
                                                                                                        newPrompts[index].prompt = e.target.value;
                                                                                                        setSuggestedPrompts(newPrompts);
                                                                                                    }}
                                                                                                    placeholder="Tell me about..."
                                                                                                />
                                                                                            </Box>
                                                                                            <Button
                                                                                                appearance="subtle"
                                                                                                icon={<IconTrashCan />}
                                                                                                onClick={() => {
                                                                                                    const newPrompts = suggestedPrompts.filter((_, i) => i !== index);
                                                                                                    setSuggestedPrompts(newPrompts);
                                                                                                }}
                                                                                                aria-label="Remove prompt"
                                                                                            />
                                                                                        </Box>
                                                                                    ))}
                                                                                    <Button
                                                                                        appearance="subtle"
                                                                                        icon={<IconPlus />}
                                                                                        size="md"
                                                                                        onClick={() => setSuggestedPrompts([...suggestedPrompts, { label: "", prompt: "" }])}
                                                                                        style={{ alignSelf: "flex-start" }}
                                                                                    >
                                                                                        Add Prompt
                                                                                    </Button>
                                                                                </Box>
                                                                            </Box>

                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </>
                                                )}

                                                <Box>
                                                    <Box display="flex" justifyContent="space-between" mb="8">
                                                        <Text fontWeight="500" fontSize="md">Input Variables</Text>
                                                        <Button appearance="subtle" size="sm" icon={<IconPlus />} disabled={isReadOnly}>Add Variable</Button>
                                                    </Box>
                                                    <Text fontSize="sm" color="fg.secondary" mb="12">Reference these in instructions using {"{{"}"variableName{"}}"}</Text>
                                                    <Box display="flex" flexDirection="column" gap="8">
                                                        {variables.length > 0 ? (
                                                            variables.map((variable, index) => (
                                                                <Card key={index} p="12">
                                                                    <Box display="flex" alignItems="center" justifyContent="space-between" w="full">
                                                                        <Box display="flex" gap="12" alignItems="center" flex="1">
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

                                                <Field label="Tools" info="Select tools for the agent">
                                                    <Box
                                                        border="2"
                                                        borderColor="border.tertiary"
                                                        style={{ borderStyle: "dashed" }}
                                                        rounded="md"
                                                        p="32"
                                                        display="flex"
                                                        flexDirection="column"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        gap="16"
                                                        bg="transparent"
                                                    >
                                                        <Text color="fg.secondary" textAlign="center">
                                                            Specify the tools via <span style={{ color: "var(--ax-colors-fg-default)", backgroundColor: "var(--ax-colors-bg-tertiary)", padding: "2px 4px", borderRadius: "4px", border: "1px solid var(--ax-colors-border-secondary)" }}>`tool_name`</span> in your prompt template.
                                                        </Text>
                                                        <Button icon={<IconPlus />} appearance="default" size="sm">Add Tool</Button>
                                                    </Box>
                                                </Field>

                                                <Box mt="8">
                                                    <Text fontWeight="400" fontSize="md" mb="8">Files</Text>
                                                    <FileUpload>
                                                        <FileUploadDropzone />
                                                    </FileUpload>
                                                </Box>
                                            </Box>
                                        </DisclosureContent>
                                    </Disclosure>
                                </Box>
                            </Box>
                        </TabsContent>

                        <TabsContent value="setup3" style={{ height: "100%" }} suppressHydrationWarning>
                            <Box
                                h="full"
                                display="flex"
                                flexDirection="column"
                                style={{
                                    overflowY: "auto",
                                    WebkitOverflowScrolling: "touch",
                                }}
                            >
                                <Box p="24" display="flex" flexDirection="column" gap="16">
                                    {/* Banner explaining this is alternative layout */}
                                    <Box p="16" bg="bg.information.subtle" rounded="md" borderL="2" style={{ borderLeftColor: "var(--ax-colors-border-information)", borderLeftWidth: "4px" }}>
                                        <Text fontWeight="600" mb="4">Alternative Layout (Setup 3)</Text>
                                        <Text fontSize="sm" color="fg.secondary">
                                            This layout is identical to Setup 2 but uses a Disclosure component for Advanced Settings instead of a toggle switch.
                                        </Text>
                                    </Box>

                                    {/* Details Section - Same as Setup 1 */}
                                    <Disclosure defaultOpen={true} bg="bg.secondary" rounded="md" pl="8" py="4" suppressHydrationWarning>
                                        <DisclosureTrigger fontSize="md" fontWeight="500" suppressHydrationWarning>
                                            Details
                                        </DisclosureTrigger>
                                        <DisclosureContent pl="24" pb="32" suppressHydrationWarning>
                                            <Text fontSize="sm" color="fg.secondary">
                                                (Same as Setup 1 - Name, Description, Icon, Category)
                                            </Text>
                                        </DisclosureContent>
                                    </Disclosure>

                                    {/* Interaction Mode Section */}
                                    <Disclosure defaultOpen={true} bg="bg.secondary" rounded="md" pl="8" py="4" suppressHydrationWarning>
                                        <DisclosureTrigger fontSize="md" fontWeight="500" suppressHydrationWarning>
                                            <Box display="flex" alignItems="center" gap="4">
                                                Interaction Mode
                                                <Tooltip delayDuration={300} content="Configure how users interact with this agent">
                                                    <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                </Tooltip>
                                            </Box>
                                        </DisclosureTrigger>
                                        <DisclosureContent pl="24" pb="32" suppressHydrationWarning>
                                            <Box display="flex" flexDirection="column" gap="24">
                                                {/* Interaction Mode Toggle */}
                                                <Box>
                                                    <Text fontWeight="500" fontSize="md" mb="4">Interaction Mode</Text>
                                                    <Text fontSize="sm" color="fg.secondary" mb="12">Configure how users interact with this agent</Text>

                                                    <Box display="flex" flexDirection="column" gap="16">
                                                        {/* Support back-and-forth dialogue */}
                                                        <Box display="flex" alignItems="center" gap="12">
                                                            <Switch checked={multiTurnMode} onCheckedChange={setMultiTurnMode} disabled={isReadOnly} />
                                                            <Box display="flex" alignItems="center" gap="4">
                                                                <Text fontWeight="500">Support back-and-forth dialogue</Text>
                                                                <Tooltip delayDuration={300} content="Select this option for multi-turn conversations for this agent, facilitating interactive guidance, clarification, and personalized user experiences.">
                                                                    <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                </Tooltip>
                                                            </Box>
                                                        </Box>

                                                        {/* Enable in Chat */}
                                                        <Box display="flex" alignItems="center" gap="12">
                                                            <Switch checked={enabledInChat} onCheckedChange={setEnabledInChat} disabled={isReadOnly} />
                                                            <Text fontWeight="500">Enable in Chat</Text>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </DisclosureContent>
                                    </Disclosure>

                                    {/* Input Section */}
                                    <Disclosure defaultOpen={true} bg="bg.secondary" rounded="md" pl="8" py="4" style={{ flexShrink: 0 }} suppressHydrationWarning>
                                        <DisclosureTrigger fontSize="md" fontWeight="500" suppressHydrationWarning>
                                            <Box display="flex" alignItems="center" gap="4">
                                                Input
                                                <Tooltip delayDuration={300} content="Define how the agent should behave and the inputs it accepts">
                                                    <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                </Tooltip>
                                            </Box>
                                        </DisclosureTrigger>
                                        <DisclosureContent pl="24" pb="32" suppressHydrationWarning>
                                            <Box style={{ maxWidth: isComparing ? "none" : "980px" }} display="flex" flexDirection="column" gap="24">

                                                <Field label={multiTurnMode ? "First Prompt" : "Prompt"} info="A prompt that automatically runs at the start of a conversation to prime the agent's initial response.">
                                                    <AutoResizeTextarea
                                                        value={promptTemplate}
                                                        onChange={(e: any) => setPromptTemplate(e.target.value)}
                                                        placeholder="Role: You are a marketing copy expert..."
                                                        style={{
                                                            minHeight: "200px",
                                                            maxHeight: "calc(100vh - 240px)",
                                                            resize: "none",
                                                            overflowY: "auto"
                                                        }}
                                                    />
                                                </Field>

                                                {/* System Prompt Template - Visible only when multiTurnMode is true */}
                                                {multiTurnMode && (
                                                    <>
                                                        <Box>
                                                            <Box display="flex" alignItems="center" justifyContent="space-between" mb="8">
                                                                <Box display="flex" alignItems="center" gap="4">
                                                                    <Text fontSize="md">Recurring Prompt</Text>
                                                                    <Tooltip delayDuration={300} content="Defines the agent’s persona and behavioral guidelines. It supports variables and directives for dynamic instruction and customization.">
                                                                        <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                    </Tooltip>
                                                                </Box>
                                                                <Box display="flex" gap="12">
                                                                    <Button appearance="subtle" size="sm" icon={<IconTrashCan size={16} />} onClick={() => setSystemPrompt("")}>Clear</Button>
                                                                    <Button
                                                                        appearance="subtle"
                                                                        size="sm"
                                                                        icon={<IconClockRotateLeft size={16} />}
                                                                        onClick={() => {
                                                                            if (MOCK_AGENTS_DATA[agentId]?.systemPrompt) {
                                                                                setSystemPrompt(MOCK_AGENTS_DATA[agentId].systemPrompt);
                                                                            }
                                                                        }}
                                                                    >
                                                                        Reset
                                                                    </Button>
                                                                </Box>
                                                            </Box>

                                                            <AutoResizeTextarea
                                                                value={systemPrompt}
                                                                onChange={(e: any) => setSystemPrompt(e.target.value)}
                                                                placeholder="You are a conversational agent interacting with a user..."
                                                                style={{
                                                                    minHeight: "200px",
                                                                    maxHeight: "calc(100vh - 240px)",
                                                                    resize: "none",
                                                                    overflowY: "auto"
                                                                }}
                                                                readOnly={isReadOnly}
                                                            />
                                                            <Text fontSize="sm" color="fg.tertiary" mt="8">
                                                                Wrap dynamic variables in double brackets and tools in backticks, e.g. [[variable_name]] or `tool_name`.
                                                            </Text>
                                                        </Box>

                                                        {/* Advanced Settings Disclosure */}
                                                        <Disclosure defaultOpen={chatConfigOpen} onOpenChange={setChatConfigOpen} bg="transparent" p="0">
                                                            <DisclosureTrigger>
                                                                <Box display="flex" alignItems="center" gap="4">
                                                                    <Text fontWeight="500">Advanced Settings</Text>
                                                                    <Tooltip delayDuration={300} content="Configure multi-turn experience and memory token limit">
                                                                        <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                    </Tooltip>
                                                                </Box>
                                                            </DisclosureTrigger>
                                                            <DisclosureContent pt="16" pb="0">
                                                                <Box ml="20" pl="32" display="flex" flexDirection="column" gap="16" borderL="2" borderColor="border.tertiary">
                                                                    {/* Advanced Chat Settings Content */}
                                                                    <Box display="flex" flexDirection="column" gap="16">

                                                                        <Box style={{ maxWidth: "360px" }}>
                                                                            <Box display="flex" alignItems="center" gap="4" mb="8">
                                                                                <Text fontSize="md">Memory Token Limit</Text>
                                                                                <Tooltip delayDuration={300} content="Defines the maximum token count for the agent's conversation memory. This limit ensures Opal's context window remains manageable by trimming older messages as the conversation grows.">
                                                                                    <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                                </Tooltip>
                                                                            </Box>
                                                                            <Box display="flex" alignItems="center" gap="16">
                                                                                <Box flex="1">
                                                                                    <Range
                                                                                        value={memoryTokenLimit}
                                                                                        onValueChange={setMemoryTokenLimit}
                                                                                        max={700000}
                                                                                        min={100000}
                                                                                        step={1000}
                                                                                        marks={[
                                                                                            { value: 100000, label: "Low" },
                                                                                            { value: 400000, label: "Medium" },
                                                                                            { value: 700000, label: "High" },
                                                                                        ]}
                                                                                    />
                                                                                </Box>
                                                                                <Input
                                                                                    type="number"
                                                                                    value={memoryTokenLimit}
                                                                                    onChange={(e) => setMemoryTokenLimit(parseInt(e.target.value) || 0)}
                                                                                    style={{ width: "100px", height: "32px", marginBottom: "20px" }}
                                                                                />
                                                                            </Box>
                                                                        </Box>

                                                                        <Box borderT="1" borderColor="border.tertiary" />

                                                                        <Text fontWeight="600" color="fg.secondary" fontSize="md">Multi-turn Chat Experience</Text>

                                                                        <Box>
                                                                            <Box display="flex" gap="4" alignItems="center" mb="4">
                                                                                <Text fontSize="md">First Message</Text>
                                                                                <Tooltip delayDuration={300} content="A static greeting displayed to the user before they begin typing. This message is not sent to Opal.">
                                                                                    <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                                                                </Tooltip>
                                                                            </Box>
                                                                            <Textarea
                                                                                value={initialMessage}
                                                                                onChange={(e) => setInitialMessage(e.target.value)}
                                                                                placeholder="Hi! I can help you..."
                                                                                style={{ height: "120px", resize: "none" }}
                                                                            />
                                                                        </Box>

                                                                        <Box flex="1" overflowY="visible" mt="16">
                                                                            <Box display="flex" flexDirection="column" gap="4" mb="12">
                                                                                <Text fontSize="md">Quick Start Prompts</Text>
                                                                                <Text fontSize="sm" color="fg.secondary">Clickable buttons that offer suggested prompts to guide the conversation.</Text>
                                                                            </Box>
                                                                            <Box display="flex" flexDirection="column" gap="16">
                                                                                {suggestedPrompts.map((item, index) => (
                                                                                    <Box key={index} display="flex" gap="12" alignItems="end">
                                                                                        <Box flex="1">
                                                                                            <Text fontSize="md" mb="4">Suggested Prompt</Text>
                                                                                            <Input
                                                                                                value={item.label}
                                                                                                onChange={(e) => {
                                                                                                    const newPrompts = [...suggestedPrompts];
                                                                                                    newPrompts[index].label = e.target.value;
                                                                                                    setSuggestedPrompts(newPrompts);
                                                                                                }}
                                                                                                placeholder="Author Bio"
                                                                                            />
                                                                                        </Box>
                                                                                        <Box flex="1">
                                                                                            <Text fontSize="md" mb="4">Prompt to LLM</Text>
                                                                                            <Input
                                                                                                value={item.prompt}
                                                                                                onChange={(e) => {
                                                                                                    const newPrompts = [...suggestedPrompts];
                                                                                                    newPrompts[index].prompt = e.target.value;
                                                                                                    setSuggestedPrompts(newPrompts);
                                                                                                }}
                                                                                                placeholder="Tell me about..."
                                                                                            />
                                                                                        </Box>
                                                                                        <Button
                                                                                            appearance="subtle"
                                                                                            icon={<IconTrashCan />}
                                                                                            onClick={() => {
                                                                                                const newPrompts = suggestedPrompts.filter((_, i) => i !== index);
                                                                                                setSuggestedPrompts(newPrompts);
                                                                                            }}
                                                                                            aria-label="Remove prompt"
                                                                                        />
                                                                                    </Box>
                                                                                ))}
                                                                                <Button
                                                                                    appearance="subtle"
                                                                                    icon={<IconPlus />}
                                                                                    size="md"
                                                                                    onClick={() => setSuggestedPrompts([...suggestedPrompts, { label: "", prompt: "" }])}
                                                                                    style={{ alignSelf: "flex-start" }}
                                                                                >
                                                                                    Add Prompt
                                                                                </Button>
                                                                            </Box>
                                                                        </Box>

                                                                    </Box>
                                                                </Box>
                                                            </DisclosureContent>
                                                        </Disclosure>

                                                    </>
                                                )}

                                                <Box>
                                                    <Box display="flex" justifyContent="space-between" mb="8">
                                                        <Text fontWeight="500" fontSize="md">Input Variables</Text>
                                                        <Button appearance="subtle" size="sm" icon={<IconPlus />} disabled={isReadOnly}>Add Variable</Button>
                                                    </Box>
                                                    <Text fontSize="sm" color="fg.secondary" mb="12">Reference these in instructions using {"{{"}variableName{"}}"}</Text>
                                                    <Box display="flex" flexDirection="column" gap="8">
                                                        {variables.length > 0 ? (
                                                            variables.map((variable, index) => (
                                                                <Card key={index} p="12">
                                                                    <Box display="flex" alignItems="center" justifyContent="space-between" w="full">
                                                                        <Box display="flex" gap="12" alignItems="center" flex="1">
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

                                                <Field label="Tools" info="Select tools for the agent">
                                                    {isComparing && comparisonData ? (
                                                        <Box display="flex" flexDirection="column" gap="16">
                                                            {/* Show comparison tools */}
                                                        </Box>
                                                    ) : (
                                                        <Box
                                                            border="2"
                                                            borderColor="border.tertiary"
                                                            style={{ borderStyle: "dashed" }}
                                                            rounded="md"
                                                            p="32"
                                                            display="flex"
                                                            flexDirection="column"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            gap="16"
                                                            bg="transparent"
                                                        >
                                                            <Text color="fg.secondary" textAlign="center">
                                                                Specify the tools via <span style={{ color: "var(--ax-colors-fg-default)", backgroundColor: "var(--ax-colors-bg-tertiary)", padding: "2px 4px", borderRadius: "4px", border: "1px solid var(--ax-colors-border-secondary)" }}>`tool_name`</span> in your prompt template.
                                                            </Text>
                                                            <Button icon={<IconPlus />} appearance="default" size="sm">Add Tool</Button>
                                                        </Box>
                                                    )}
                                                </Field>

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
                                    <Disclosure defaultOpen={outputOpen} bg="bg.secondary" rounded="md" pl="8" py="4" style={{ flexShrink: 0 }} suppressHydrationWarning>
                                        <DisclosureTrigger fontSize="md" fontWeight="500" suppressHydrationWarning>
                                            Output
                                        </DisclosureTrigger>
                                        <DisclosureContent pl="24" pb="32" suppressHydrationWarning>
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
                                                    <Tooltip delayDuration={300} content="Provide examples of good outputs to guide the evaluation">
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
                                                            <Tooltip delayDuration={300} content="When enabled, executions that exceed critical guardrails will be terminated automatically in Enforcer mode. This prevents rogue agent runs, and credits for the terminated executions will be automatically refunded.">
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
                    </Box >
                </Tabs >
            </Box >

            {/* Version History Sidebar */}
            < VersionHistory
                isOpen={isVersionHistoryOpen}
                onClose={() => setIsVersionHistoryOpen(false)
                }
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

            <CustomizeChatModal
                isOpen={customizeChatModalOpen}
                onClose={() => setCustomizeChatModalOpen(false)}
                initialMessage={initialMessage}
                memoryTokenLimit={memoryTokenLimit}
                currentSuggestedPrompts={suggestedPrompts}
                onUpdate={(msg, prompts, newLimit) => {
                    setInitialMessage(msg);
                    setSuggestedPrompts(prompts);
                    setMemoryTokenLimit(newLimit);
                    setCustomizeChatModalOpen(false);
                }}
            />
        </Box >
    );
}

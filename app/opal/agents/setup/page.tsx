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
} from "@optiaxiom/react";
import { Input } from "@/app/components/Input";
import {
    IconChevronRight,
    IconTrash,
    IconPlus,
    IconHelp,
    IconSparkles,
    IconDots,
    IconDotsVertical,
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
} from "@optimizely/axiom-icons";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Range, FileUpload, FileUploadDropzone } from "@optiaxiom/react/unstable";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { VersionHistory, Version } from "./components/VersionHistory";
import { VersionPreviewBanner } from "./components/VersionPreviewBanner";
import { ComparisonBanner } from "./components/ComparisonBanner";
import { FieldComparison } from "./components/FieldComparison";

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
    const mode = searchParams.get("mode") || "create"; // 'create' or 'edit'



    // State for collapsible sections
    const [detailsOpen, setDetailsOpen] = useState(true);
    const [inputOpen, setInputOpen] = useState(false);
    const [outputOpen, setOutputOpen] = useState(false);

    // Setup Fields State
    const [agentName, setAgentName] = useState("");
    const [agentId, setAgentId] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [description, setDescription] = useState("");
    const [creativity, setCreativity] = useState(40);
    const [promptTemplate, setPromptTemplate] = useState("");
    const [tools, setTools] = useState("");
    const [inferenceLevel, setInferenceLevel] = useState("balanced");
    const [variables, setVariables] = useState<any[]>([]);

    // State for scroll
    const [isScrolled, setIsScrolled] = useState(false);

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

        const data = getVersionData(versionId);
        setAgentName(data.name);
        setDescription(data.description);
        setPromptTemplate(data.promptTemplate);
        setTools(data.tools || "");
        setVariables(data.variables || []);
        setInferenceLevel(data.inferenceLevel || "balanced");
        if (data.creativity !== undefined) setCreativity(data.creativity * 100);

        setViewingVersion(null);
        setViewingVersionData(null);

        // Add new version to history as the current version
        const nextVersionNum = versions.length + 1;
        const newVersion: Version = {
            id: `v${nextVersionNum}`,
            version: `V${nextVersionNum}`,
            mode: "Enforcer", // Defaulting to Enforcer for now
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
        <Box h="full" bg="bg.page" display="flex" flexDirection="row">
            {/* Main Content */}
            <Box flex="1" display="flex" flexDirection="column" style={{ minWidth: 0 }}>
                <Tabs defaultValue="setup" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
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
                                                <Breadcrumb
                                                    items={[{ label: "Agents", href: "/opal/agents" }]}
                                                />
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
                                        <Button appearance="default" size="lg" icon={<IconPlay />} disabled={isReadOnly}>Test Run</Button>
                                        <Tooltip content="Version History">
                                            <Button
                                                appearance="default"
                                                size="lg"
                                                icon={<IconClockRotateLeft size={20} />}
                                                aria-label="Version History"
                                                onClick={() => setIsVersionHistoryOpen(!isVersionHistoryOpen)}
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
                            <TabsList>
                                <TabsTrigger value="setup">Setup</TabsTrigger>
                                <TabsTrigger value="triggers">In-app Triggers</TabsTrigger>
                                <TabsTrigger value="logs">Logs</TabsTrigger>
                            </TabsList>
                        </Box>
                    </Box>



                    {/* Content Area */}
                    <Box flex="1" display="flex" flexDirection="column" style={{ minHeight: 0 }}>
                        <TabsContent value="setup" style={{ height: "100%" }}>
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
                                    <Disclosure defaultOpen={detailsOpen} bg="bg.secondary" rounded="md" pl="8" py="4" style={{ flexShrink: 0 }}>
                                        <DisclosureTrigger fontSize="md" fontWeight="500">
                                            Details
                                        </DisclosureTrigger>
                                        <DisclosureContent pl="32" pb="32">
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
                                            </Box>
                                        </DisclosureContent>
                                    </Disclosure>

                                    {/* Input Section */}
                                    <Disclosure defaultOpen={inputOpen} bg="bg.secondary" rounded="md" pl="8" py="4" style={{ flexShrink: 0 }}>
                                        <DisclosureTrigger fontSize="md" fontWeight="500">
                                            <Box display="flex" alignItems="center" gap="4">
                                                Input
                                                <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                            </Box>
                                        </DisclosureTrigger>
                                        <DisclosureContent pl="32" pb="32">
                                            <Box style={{ maxWidth: isComparing ? "none" : "980px" }} display="flex" flexDirection="column" gap="24">
                                                <Field label="Prompt Template" info="Define the system instructions">
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
                                                                            <DropdownMenuTrigger asChild>
                                                                                <Button appearance="subtle" size="sm" icon={<IconEllipsisSolid size={16} />} aria-label="Variable options" disabled={isReadOnly} />
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
                                                        <Box display="flex" flexDirection="column" gap="8">
                                                            {/* Mock tools data */}
                                                            {[
                                                                {
                                                                    name: "translate",
                                                                    description: "Translates text between languages with context awareness"
                                                                },
                                                                {
                                                                    name: "style-guide-checker",
                                                                    description: "Validates content against brand style guidelines and tone"
                                                                },
                                                                {
                                                                    name: "regional-thesaurus",
                                                                    description: "Provides region-specific synonyms and terminology alternatives"
                                                                }
                                                            ].map((tool, index) => (
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
                                                                        <Text fontWeight="500" fontSize="md">{tool.name}</Text>
                                                                        <Text color="fg.secondary" fontSize="sm" mt="4">{tool.description}</Text>
                                                                    </Box>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button
                                                                                appearance="subtle"
                                                                                size="sm"
                                                                                icon={<IconEllipsisSolid size={16} />}
                                                                                aria-label="Tool options"
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
                                                    )}
                                                </Field>

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
                                                            value={inferenceLevel}
                                                            onValueChange={setInferenceLevel}
                                                            disabled={isReadOnly}
                                                            options={[
                                                                { label: "Fast", value: "fast" },
                                                                { label: "Balanced (Default)", value: "balanced" },
                                                                { label: "Advanced", value: "advanced" },
                                                            ]}
                                                        >
                                                            <SelectTrigger size="md" />
                                                            <SelectContent />
                                                        </Select>
                                                    )}
                                                </Field>

                                                <Field label="Creativity" info="Adjust temperature" style={{ maxWidth: "320px" }}>
                                                    {isComparing && comparisonData ? (
                                                        <FieldComparison
                                                            previousValue={comparisonData.creativity?.toFixed(1) || (creativity / 100).toFixed(1)}
                                                            currentValue={(MOCK_AGENTS_DATA["content-localizer"].creativity / 100).toFixed(1)}
                                                        />
                                                    ) : showDiffs && viewingVersion ? (
                                                        <FieldComparison
                                                            previousValue={(creativity / 100).toFixed(1)}
                                                            currentValue={(MOCK_AGENTS_DATA["content-localizer"].creativity / 100).toFixed(1)}
                                                            mode="stacked"
                                                        />
                                                    ) : (
                                                        <Box display="flex" gap="8" alignItems="center">
                                                            {/* Custom Slider Mockup */}
                                                            <Box style={{ height: "4px", position: "relative" }} bg="bg.accent" flex="1" rounded="full">
                                                                <Box
                                                                    w="16"
                                                                    h="16"
                                                                    bg="bg.accent"
                                                                    rounded="full"
                                                                    border="2"
                                                                    style={{
                                                                        borderColor: "var(--ax-colors-bg-default)",
                                                                        position: "absolute",
                                                                        top: "-6px",
                                                                        left: `${creativity}%`
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Input
                                                                value={(creativity / 100).toFixed(1)}
                                                                onChange={(e) => {
                                                                    const val = parseFloat(e.target.value);
                                                                    if (!isNaN(val) && val >= 0 && val <= 1) {
                                                                        setCreativity(Math.round(val * 100));
                                                                    }
                                                                }}
                                                                style={{ width: "80px" }}
                                                                readOnly={isReadOnly}
                                                                tabIndex={isReadOnly ? -1 : 0}
                                                                size="md"
                                                            />
                                                        </Box>
                                                    )}
                                                </Field>

                                                {/* Files Section nested inside Input per instruction */}
                                                <Box mt="8">
                                                    <Text fontWeight="400" fontSize="md" mb="8">Files</Text>
                                                    <Box border="1" borderColor="border.tertiary" style={{ borderStyle: "dashed" }} p="24" rounded="md" display="flex" flexDirection="column" alignItems="center" justifyContent="center" bg="bg.secondary">
                                                        <IconFileImport size={24} color="var(--ax-colors-fg-tertiary)" />
                                                        <Text color="fg.tertiary" mt="8">Drag & drop files here, or click to browse</Text>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </DisclosureContent>
                                    </Disclosure>

                                    {/* Output Section */}
                                    <Disclosure defaultOpen={outputOpen} bg="bg.secondary" rounded="md" pl="8" py="4" style={{ flexShrink: 0 }}>
                                        <DisclosureTrigger fontSize="md" fontWeight="500">
                                            Output
                                        </DisclosureTrigger>
                                        <DisclosureContent pl="32" pb="32">
                                            <Box style={{ maxWidth: isComparing ? "none" : "980px" }} display="flex" flexDirection="column" gap="24">
                                                <Text color="fg.secondary">Output configuration content goes here...</Text>
                                            </Box>
                                        </DisclosureContent>
                                    </Disclosure>

                                </Box>
                            </Box>
                        </TabsContent>

                        <TabsContent value="triggers">
                            <Box p="24">
                                <Text>In-app Triggers Configuration</Text>
                            </Box>
                        </TabsContent>

                        <TabsContent value="logs">
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
        </Box>
    );
}

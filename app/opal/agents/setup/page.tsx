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
} from "@optiaxiom/react";
import { Input } from "@/app/components/Input";
import {
    IconChevronRight,
    IconTrash,
    IconPlus,
    IconHelp,
    IconSparkles,
    IconDots,
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
} from "@optimizely/axiom-icons";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Range, FileUpload, FileUploadDropzone } from "@optiaxiom/react/unstable";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { VersionHistory } from "./components/VersionHistory";
import { VersionPreviewBanner } from "./components/VersionPreviewBanner";
import { ComparisonBanner } from "./components/ComparisonBanner";
import { FieldComparison } from "./components/FieldComparison";

export default function SpecializedAgentSetup() {
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
    const [variables, setVariables] = useState<any[]>([]);

    // State for scroll
    const [isScrolled, setIsScrolled] = useState(false);

    // Version History State
    const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
    const [viewingVersion, setViewingVersion] = useState<string | null>(null);
    const [viewingVersionData, setViewingVersionData] = useState<{ name: string; timestamp: string } | null>(null);

    // Comparison State
    const [isComparing, setIsComparing] = useState(false);
    const [comparisonVersionId, setComparisonVersionId] = useState<string | null>(null);
    const [comparisonData, setComparisonData] = useState<{
        name: string;
        description: string;
        promptTemplate: string;
        tools: string;
    } | null>(null);
    const [showDiffs, setShowDiffs] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop;
        setIsScrolled(scrollTop > 20);
    };

    // Version History Handlers
    const handleViewVersion = (versionId: string) => {
        setViewingVersion(versionId);
        // Mock version data - in real app, fetch from API
        setViewingVersionData({
            name: versionId.toUpperCase(),
            timestamp: "Nov 17, 2025 9:00 PM"
        });

        // Simulate a version change in the prompt template for visual feedback
        // For V4 (which we used for comparison), let's simulate it specifically
        if (versionId === "v4") {
            setAgentName("Content Localizer Pro");
            setDescription("Localize your content with specific regional context while maintaining brand voice.\nEnsures cultural sensitivity and local relevance.\nSupports multiple language pairs and regional variants.");
            setPromptTemplate("You are a localization expert. Your task is to adapt the provided content for the target region: [[region]].\n\n{Instruction}\n- Use local terminology and cultural references.\n- Maintain the original brand voice and tone.\n- Ensure the length remains similar to the original.\n- Consider cultural sensitivities and taboos.\n- Adapt idioms and metaphors appropriately.\n\nContent to localize: [[content]]\n\n`Translate` `Style Guide Checker` `Cultural Analyzer`");
            setTools("Translate, Style Guide Checker, Regional Thesaurus, Cultural Analyzer");
        } else if (versionId === "v23") {
            setPromptTemplate("Process the meeting transcript: [[transcript]].\n\n{Instruction}\nExtract:\n1. Summary\n2. Key items\n\nUse `Natural Language Processor`.");
        } else if (versionId === "v22") {
            setPromptTemplate("Version 22 Prompt: [[overview]].\n\n{RAG}\nCheck documentation archive.\n\nUse `Translate`.");
        }
    };

    const handleCompareVersion = (versionId: string) => {
        console.log('Comparing version:', versionId, 'with current');
        setComparisonVersionId(versionId);

        // Load comparison data (mock data for now)
        // V4 has MORE content (showing removals when compared to current)
        const mockData = {
            name: versionId === "v4" ? "Content Localizer Pro" : agentName,
            description: versionId === "v4"
                ? "Localize your content with specific regional context while maintaining brand voice.\nEnsures cultural sensitivity and local relevance.\nSupports multiple language pairs and regional variants."
                : description,
            promptTemplate: versionId === "v4"
                ? "You are a localization expert. Your task is to adapt the provided content for the target region: [[region]].\n\n{Instruction}\n- Use local terminology and cultural references.\n- Maintain the original brand voice and tone.\n- Ensure the length remains similar to the original.\n- Consider cultural sensitivities and taboos.\n- Adapt idioms and metaphors appropriately.\n\nContent to localize: [[content]]\n\n`Translate` `Style Guide Checker` `Cultural Analyzer`"
                : promptTemplate,
            tools: versionId === "v4" ? "Translate, Style Guide Checker, Regional Thesaurus, Cultural Analyzer" : tools,
        };

        setComparisonData(mockData);
        setIsComparing(true);
        setViewingVersion(null);
        setViewingVersionData(null);
    };

    const handleExitComparison = () => {
        setIsComparing(false);
        setComparisonVersionId(null);
        setComparisonData(null);
    };

    const isReadOnly = !!viewingVersion;

    // Helper for syntax highlighting in prompt template
    const HighlightedPrompt = ({ text }: { text: string }) => {
        if (!text) return null;
        const parts = text.split(/(\[\[.*?\]\]|\{.*?\}|`.*?`)/g);
        return (
            <Box
                p="12"
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
        setViewingVersion(null);
        setViewingVersionData(null);
        // In real app, restore the version and refresh data
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
            description: "Audits webpages for LLM discoverability and delivers actionable recommendations.",
            promptTemplate: "Scan the provided domain: [[domain]] for generative engine optimization (GEO).\n\n{RAG}\nReference latest search engine documentation on GEO.\n\n{Instruction}\nFocus on:\n1. Content retrievability by LLMs\n2. Structured data verification\n3. Conversational search relevance\n\nGenerate prioritized SEO vs GEO recommendations using `Web Crawler`.",
            tools: "Web Crawler, Schema Auditor, LLM Predictor",
            variables: [
                { name: "domain", description: "The website domain to audit", type: "String", required: true }
            ],
            creativity: 20
        },
        "resource-manager": {
            name: "Resource Manager",
            agentId: "resource_manager",
            description: "Look up available team members for task assignment.",
            promptTemplate: "Find the best person for a task with the following requirements: [[task_requirements]].\n\n{Instruction}\nCheck for:\n- Availability in the next [[horizon]] days\n- Skill match scores\n- Current workload balance\n\nCross-reference with `Outlook Calendar`.",
            tools: "Outlook Calendar, HR Skill Matrix, Project Board",
            variables: [
                { name: "task_requirements", description: "Skills and seniority needed", type: "String", required: true },
                { name: "horizon", description: "Timeframe for the task (in days)", type: "Number", required: true }
            ],
            creativity: 10
        },
        "seo-keyword-research": {
            name: "SEO Keyword Research",
            agentId: "keyword_research",
            description: "Returns a curated list of keywords designed to maximize content reach.",
            promptTemplate: "Research high-intent keywords for the topic: [[topic]].\n\n{Instruction}\nAlgorithm:\n1. Identify seed keywords\n2. Analyze search volume and difficulty\n3. Find long-tail variants\n4. Map to user intent categories\n\nUse `Keyword Planner` and `Competitor Scout`.",
            tools: "Keyword Planner, Competitor Scout, SERP Analyzer",
            variables: [
                { name: "topic", description: "Main subject matter", type: "String", required: true },
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
                                                            currentValue={agentName}
                                                            previousValue={comparisonData.name}
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
                                                                    tabIndex={isReadOnly ? -1 : 0}
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
                                                            currentValue={description}
                                                            previousValue={comparisonData.description}
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
                                                            tabIndex={isReadOnly ? -1 : 0}
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
                                                            currentValue={promptTemplate}
                                                            previousValue={comparisonData.promptTemplate}
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
                                                            tabIndex={-1}
                                                        >
                                                            {promptTemplate.split(/(\\[\\[.*?\\]\\]|\\{.*?\\}|`.*?`)/g).map((part, i) => {
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
                                                                        <Box display="flex" gap="8" alignItems="center">
                                                                            {variable.required && (
                                                                                <Box bg="bg.accent.subtle" px="8" py="2" rounded="full"><Text fontSize="xs" color="fg.accent">Required</Text></Box>
                                                                            )}
                                                                            <Text fontSize="sm" color="fg.secondary">{variable.type}</Text>
                                                                            <Button appearance="subtle" size="sm" icon={<IconTrash />} aria-label="Delete variable" disabled={isReadOnly} />
                                                                        </Box>
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
                                                            currentValue={tools}
                                                            previousValue={comparisonData.tools}
                                                        />
                                                    ) : showDiffs && viewingVersion ? (
                                                        <FieldComparison
                                                            previousValue={tools}
                                                            currentValue={MOCK_AGENTS_DATA["content-localizer"].tools}
                                                            mode="stacked"
                                                        />
                                                    ) : (
                                                        <Input
                                                            value={tools}
                                                            onChange={(e) => setTools(e.target.value)}
                                                            placeholder="Select tools..."
                                                            readOnly={isReadOnly}
                                                            tabIndex={isReadOnly ? -1 : 0}
                                                        />
                                                    )}
                                                </Field>

                                                <Box display="flex" gap="24">
                                                    <Box flex="1">
                                                        <Field label="Inference Level" info="Select model intelligence">
                                                            <Input defaultValue="Balanced (Default)" readOnly={isReadOnly} tabIndex={isReadOnly ? -1 : 0} />
                                                        </Field>
                                                    </Box>
                                                    <Box flex="1">
                                                        <Field label="Creativity" info="Adjust temperature">
                                                            <Box display="flex" gap="8" alignItems="center" mt="8">
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
                                                                <Box border="1" borderColor="border.tertiary" px="8" py="2" rounded="sm">
                                                                    {(creativity / 100).toFixed(1)}
                                                                </Box>
                                                            </Box>
                                                        </Field>
                                                    </Box>
                                                </Box>

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
            />
        </Box>
    );
}

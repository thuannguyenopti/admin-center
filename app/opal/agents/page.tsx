"use client";

import {
    Box,
    Heading,
    Text,
    Button,
    Badge,
    Avatar,
    Menu,
    MenuTrigger,
    MenuContent,
    LabelMenuButton,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    Link,
    Tooltip,
} from "@optiaxiom/react";
import { Table, Tr, Td } from "@/app/components/Table";
import { DataTableHeaderCell } from "@optiaxiom/react/unstable";
import { useReactTable, getCoreRowModel, type ColumnDef } from "@tanstack/react-table";
import { IconAgent, IconCodeBranch, IconUpload, IconSearch, IconPlus, IconChevronDown, IconGripVertical } from "@optimizely/axiom-icons";
import { IconEye, IconEyeSlash } from "@/app/lib/axiom-icons";
import { Input } from "@/app/components/Input";
import { NewAgentDialog } from "./components/NewAgentDialog";
import { useMemo, useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const STATIC_AGENTS = [
    {
        id: "email-campaign",
        icon: <IconAgent />,
        emoji: "✍️",
        name: "Write an email campaign",
        handle: "@email_gen_agent",
        tag: "New",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Content strategy", bg: "#c6dbfa", color: "#0d46a0" }, { label: "Copywriting", bg: "#e9f7f1", color: "#17492b" }, { label: "Email marketing", bg: "#fdf4ff", color: "#701a75" }],
        description: "Generate compelling email campaigns tailored to your audience with strategic copy and subject lines.",
        activity: "0 Runs",
        lastModified: { date: "Mar 1, 2026", user: "John Smith" },
        status: "Active",
    },
    {
        id: "optimize-geo",
        icon: <IconAgent />,
        emoji: "🌐",
        name: "Optimize my GEO",
        handle: "@opal_GEO",
        tag: "New",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "SEO/GEO", bg: "#f5f3ff", color: "#4c1d95" }, { label: "Analytics", bg: "#c6dbfa", color: "#0d46a0" }],
        description: "Optimize your content for generative engine optimization to improve AI-driven discoverability and reach.",
        activity: "0 Runs",
        lastModified: { date: "Mar 1, 2026", user: "John Smith" },
        status: "Active",
    },
    {
        id: "analyze-competitors",
        icon: <IconAgent />,
        emoji: "📊",
        name: "Analyze my competitors",
        handle: "@competitors_are_dust",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Competitive analysis", bg: "#e9f7f1", color: "#17492b" }, { label: "Research", bg: "#f5f3ff", color: "#4c1d95" }],
        description: "Deep-dive into competitor strategies, positioning, and content to uncover opportunities for your brand.",
        activity: "2 Runs",
        lastModified: { date: "Feb 20, 2026", user: "John Smith" },
        status: "Active",
    },
    {
        id: "ab-experiment",
        icon: <IconAgent />,
        emoji: "⚗️",
        name: "Set up an A/B experiment",
        handle: "@ab_test_plan",
        tag: "New",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Testing", bg: "#e0f2fe", color: "#0369a1" }, { label: "Experimentation", bg: "#f5f3ff", color: "#4c1d95" }, { label: "CRO", bg: "#e9f7f1", color: "#17492b" }],
        description: "Design a rigorous A/B experiment with hypothesis, variants, metrics, and success criteria ready to run.",
        activity: "0 Runs",
        lastModified: { date: "Mar 1, 2026", user: "John Smith" },
        status: "Active",
    },
    {
        id: "content-calendar",
        icon: <IconAgent />,
        emoji: "📅",
        name: "Build a content calendar",
        handle: "@content_cal",
        tag: "New",
        creator: { name: "User Name", avatar: "/avatars/user.png" },
        tags: [{ label: "Content strategy", bg: "#c6dbfa", color: "#0d46a0" }, { label: "Planning", bg: "#fffaea", color: "#7a2e0d" }],
        description: "Plan and organize your content publishing schedule across channels for maximum impact and consistency.",
        activity: "1 Run",
        lastModified: { date: "Mar 5, 2026", user: "John Smith" },
        status: "Active",
    },
    {
        id: "ad-variations",
        icon: <IconAgent />,
        emoji: "🎨",
        name: "Generate ad variations",
        handle: "@ad_variants",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Paid media", bg: "#c6dbfa", color: "#0d46a0" }, { label: "Testing", bg: "#e0f2fe", color: "#0369a1" }],
        description: "Create multiple high-performing ad copy variations optimized for different audiences and placements.",
        activity: "3 Runs",
        lastModified: { date: "Feb 15, 2026", user: "John Smith" },
        status: "Active",
    },
    {
        id: "seo-audit",
        icon: <IconAgent />,
        emoji: "🔎",
        name: "Audit my SEO performance",
        handle: "@seo_audit",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Competitive analysis", bg: "#e9f7f1", color: "#17492b" }, { label: "Market review", bg: "#fffaea", color: "#7a2e0d" }, { label: "Keywords", bg: "#f5f3ff", color: "#4c1d95" }, { label: "Technical SEO", bg: "#e0f2fe", color: "#0369a1" }],
        description: "Audit your site's SEO health, identify gaps, and get prioritized recommendations to improve rankings.",
        activity: "4 Runs",
        lastModified: { date: "Feb 10, 2026", user: "John Smith" },
        status: "Active",
    },
    {
        id: "social-media-strategy",
        icon: <IconAgent />,
        emoji: "📱",
        name: "Create social media strategy",
        handle: "@social_strategy",
        creator: { name: "User Name", avatar: "/avatars/user.png" },
        tags: [{ label: "Strategy", bg: "#f5f3ff", color: "#4c1d95" }, { label: "Social media", bg: "#fdf4ff", color: "#701a75" }],
        description: "Build a comprehensive social media strategy with platform-specific content plans and engagement tactics.",
        activity: "5 Runs",
        lastModified: { date: "Jan 28, 2026", user: "John Smith" },
        status: "Active",
    },
    {
        id: "content-localizer",
        icon: <IconAgent />,
        emoji: "🌍",
        name: "Content Localizer",
        handle: "@content_localizer",
        creator: { name: "User Name", avatar: "/avatars/user.png" },
        tags: [{ label: "Content strategy", bg: "#c6dbfa", color: "#0d46a0" }, { label: "Localization", bg: "#e9f7f1", color: "#17492b" }],
        description: "Localize your content with specific regional context while maintaining brand voice.",
        activity: "1 Run",
        lastModified: { date: "Dec 1, 2025", user: "John Smith" },
        status: "Active",
    },
    {
        id: "heatmap-analysis",
        icon: <IconAgent />,
        emoji: "🔥",
        name: "Heatmap Analysis",
        handle: "@heatmap_analysis",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Testing", bg: "#e0f2fe", color: "#0369a1" }, { label: "Analytics", bg: "#c6dbfa", color: "#0d46a0" }],
        description:
            "Transforms a provided heatmap image and url into precise, tailored test ideas. It eliminates the burden of manual analysis, converting data into insights.",
        activity: "3 Runs",
        lastModified: { date: "Sep 15, 2025", user: "John Smith" },
        status: "Active",
    },
    {
        id: "experiment-planning",
        icon: <IconAgent />,
        emoji: "🧪",
        name: "Experiment Planning Agent",
        handle: "@test_planning",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Testing", bg: "#e0f2fe", color: "#0369a1" }, { label: "Experimentation", bg: "#f5f3ff", color: "#4c1d95" }],
        description:
            "Transforms your raw ideas into a fully-formed test plan, complete with suggested hypotheses, key metrics, identified risks, and more.",
        activity: "6 Runs",
        lastModified: { date: "Jul 29, 2025", user: "John Smith" },
        status: "Active",
    },
    {
        id: "geo-recommendations",
        icon: <IconAgent />,
        emoji: "📡",
        name: "GEO Recommendations",
        handle: "@opti_geo_recommendati...",
        tag: "Updated",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "SEO/GEO", bg: "#f5f3ff", color: "#4c1d95" }, { label: "Analytics", bg: "#c6dbfa", color: "#0d46a0" }],
        description:
            "Audits webpages for LLM discoverability, retrievability, and understandability to deliver actionable recommendations to optimize conversion.",
        activity: "4 Runs",
        lastModified: { date: "Oct 10, 2025", user: "John Smith" },
        status: "Inactive",
    },
    {
        id: "resource-manager",
        icon: <IconAgent />,
        emoji: "👥",
        name: "Resource Manager",
        handle: "@rm",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Planning", bg: "#fffaea", color: "#7a2e0d" }, { label: "Automation", bg: "#e9f7f1", color: "#17492b" }],
        description: "Look up available team members for task assignment based on workload and expertise.",
        activity: "7 Runs",
        lastModified: { date: "Jul 30, 2025", user: "John Smith" },
        status: "Inactive",
    },
    {
        id: "seo-keyword-research",
        icon: <IconAgent />,
        emoji: "🔑",
        name: "SEO Keyword Research",
        handle: "@seo_keyword_resaerch",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "SEO/GEO", bg: "#f5f3ff", color: "#4c1d95" }, { label: "Research", bg: "#e9f7f1", color: "#17492b" }],
        description:
            "Takes a topic, leverages data from Idea Lab and the broader web, and returns a curated list of keywords designed to maximize content reach.",
        activity: "2 Runs",
        lastModified: { date: "Nov 3, 2025", user: "John Smith" },
        status: "Active",
    },
    {
        id: "cmp-workflow",
        icon: <IconCodeBranch />,
        emoji: "⚙️",
        name: "CMP Workflow Agent",
        handle: "@cmp_workflow",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Automation", bg: "#fffaea", color: "#7a2e0d" }, { label: "Campaigns", bg: "#e9f7f1", color: "#17492b" }],
        description: "Orchestrate specialized agents to process CMP webhook payloads and generate enriched campaign content.",
        activity: "0 Runs",
        lastModified: { date: "Mar 13, 2026", user: "Pei Chien" },
        status: "Active",
    },
    {
        id: "meeting-synthesizer",
        icon: <IconAgent />,
        emoji: "📝",
        name: "Meeting Synthesizer",
        handle: "@meeting_synthesizer",
        creator: { name: "User Name", avatar: "/avatars/user.png" },
        tags: [{ label: "Automation", bg: "#fffaea", color: "#7a2e0d" }, { label: "Planning", bg: "#e9f7f1", color: "#17492b" }],
        description: "Summarize your meeting transcripts into actionable items and key takeaways.",
        activity: "5 Runs",
        lastModified: { date: "Aug 20, 2025", user: "John Smith" },
        status: "Inactive",
    },
];

// ─── Column definitions ───────────────────────────────────────────────────────

type ColId = "name" | "badge" | "creator" | "category" | "description" | "activity" | "lastModified" | "status";

const DEFAULT_COLUMN_ORDER: ColId[] = ["name", "badge", "creator", "category", "description", "activity", "lastModified", "status"];

type AgentRow = typeof STATIC_AGENTS[number];

const REORDERABLE_COLUMN_DEFS: ColumnDef<AgentRow>[] = [
    { id: "name",         header: "Name",          enableResizing: true,  size: 220, minSize: 120 },
    { id: "badge",        header: "",              enableResizing: false, size: 48,  minSize: 0   },
    { id: "creator",      header: "Created by",    enableResizing: true,  size: 160, minSize: 80  },
    { id: "category",     header: "Category",      enableResizing: true,  size: 180, minSize: 80  },
    { id: "description",  header: "Description",   enableResizing: true,  size: 300, minSize: 120 },
    { id: "activity",     header: "Activity",      enableResizing: true,  size: 100, minSize: 80  },
    { id: "lastModified", header: "Last Modified", enableResizing: true,  size: 140, minSize: 100 },
    { id: "status",       header: "Status",        enableResizing: true,  size: 100, minSize: 80  },
];

export default function AgentsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState("Your Agents");
    const [addAgentOpen, setAddAgentOpen] = useState(false);
    const [userAgents, setUserAgents] = useState<typeof STATIC_AGENTS>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("opal_user_agents");
            if (raw) {
                const parsed = JSON.parse(raw);
                setUserAgents(parsed.map((a: Record<string, unknown>) => ({
                    ...a,
                    icon: <IconAgent />,
                    tag: "Draft",
                })));
            }
        } catch { /* ignore */ }
    }, []);

    const agents = useMemo(() => [...userAgents, ...STATIC_AGENTS], [userAgents]);
    const [newAgentOpen, setNewAgentOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // ── Column reorder ────────────────────────────────────────────────────────
    const [columnOrder, setColumnOrder] = useState<ColId[]>(DEFAULT_COLUMN_ORDER);
    const dragColRef = useRef<ColId | null>(null);
    const [dragOverCol, setDragOverCol] = useState<ColId | null>(null);

    const reorderColumns = (from: ColId, to: ColId) => {
        setColumnOrder(prev => {
            const next = [...prev];
            const fi = next.indexOf(from);
            const ti = next.indexOf(to);
            if (fi < 0 || ti < 0 || fi === ti) return prev;
            next.splice(fi, 1);
            next.splice(ti, 0, from);
            return next;
        });
    };

    const categories = Array.from(new Set(agents.flatMap((agent) => agent.tags?.map((tag) => tag.label) ?? []))).sort();
    const showCategoryColors = searchParams.get("categoryPills") === "colored";
    const filteredAgents = agents.filter((agent) =>
        selectedCategories.length === 0 ? true : agent.tags?.some((tag) => selectedCategories.includes(tag.label))
    );

    // ── Column resizing (TanStack) ─────────────────────────────────────────────
    const table = useReactTable<AgentRow>({
        data: filteredAgents,
        columns: REORDERABLE_COLUMN_DEFS,
        getCoreRowModel: getCoreRowModel(),
        enableColumnResizing: true,
        columnResizeMode: "onChange",
        state: { columnOrder },
        onColumnOrderChange: (updater) =>
            setColumnOrder(prev =>
                typeof updater === "function" ? (updater(prev) as ColId[]) : (updater as ColId[])
            ),
    });

    const headerMap = Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        table.getHeaderGroups()[0]?.headers.map(h => [h.id, h as any]) ?? []
    ) as Record<string, any>;
    const categoryLabel = selectedCategories.length === 0
        ? "All"
        : selectedCategories.length === 1
            ? selectedCategories[0]
            : `${selectedCategories.length} selected`;
    const categoryOptions = useMemo(
        () => [
            {
                label: "All",
                execute: () => setSelectedCategories([]),
                multi: false,
                selected: () => selectedCategories.length === 0,
            },
            ...categories.map((category) => {
                const categoryTag = agents.flatMap((agent) => agent.tags ?? []).find((tag) => tag.label === category);

                return showCategoryColors
                    ? {
                        key: category,
                        label: "",
                        keywords: category,
                        addon: (
                            <span
                                style={{
                                    background: categoryTag?.bg,
                                    color: categoryTag?.color,
                                    borderRadius: 6,
                                    padding: "2px 6px",
                                    fontSize: 12,
                                    lineHeight: "16px",
                                    fontFamily: "Inter, sans-serif",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {category}
                            </span>
                        ),
                        execute: () =>
                            setSelectedCategories((current) =>
                                current.includes(category)
                                    ? current.filter((item) => item !== category)
                                    : [...current, category]
                            ),
                        multi: true,
                        selected: () => selectedCategories.includes(category),
                    }
                    : {
                        label: category,
                        execute: () =>
                            setSelectedCategories((current) =>
                                current.includes(category)
                                    ? current.filter((item) => item !== category)
                                    : [...current, category]
                            ),
                        multi: true,
                        selected: () => selectedCategories.includes(category),
                    };
            }),
        ],
        [categories, selectedCategories, showCategoryColors]
    );
    const toggleCategoryPills = () => {
        const nextParams = new URLSearchParams(searchParams.toString());

        if (showCategoryColors) {
            nextParams.delete("categoryPills");
        } else {
            nextParams.set("categoryPills", "colored");
        }

        const nextQuery = nextParams.toString();
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    };

    return (
        <>
        <NewAgentDialog open={newAgentOpen} onOpenChange={setNewAgentOpen} />
        <Box px="32" py="24" display="flex" flexDirection="column" gap="24" overflow="auto" h="full">
            {/* Header */}
            <Box display="flex" flexDirection="column" gap="8">
                <Heading level="1" fontSize="2xl">Agents</Heading>
                <Text color="fg.secondary">Empower your marketing team by customizing Opal agents to meet your specific needs.</Text>
            </Box>

            {/* Tabs */}
            <Box display="flex" gap="24" borderB="1" borderColor="border.tertiary">
                {["Your Agents", "Agent Directory"].map((tab) => (
                    <Box
                        key={tab}
                        pb="12"
                        cursor="pointer"
                        borderB={activeTab === tab ? "2" : "0"}
                        borderColor={activeTab === tab ? "border.default" : "transparent"}
                        onClick={() => setActiveTab(tab)}
                        style={activeTab === tab ? { borderBottomColor: "#0069ff" } : {}}
                    >
                        <Text
                            fontWeight={activeTab === tab ? "500" : "400"}
                            color={activeTab === tab ? "fg.default" : "fg.secondary"}
                        >
                            {tab}
                        </Text>
                    </Box>
                ))}
            </Box>

            {/* Toolbar */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" gap="12" alignItems="center">
                    <Box className="w-[300px]">
                        <Input placeholder="Enter name or description" />
                    </Box>

                    <Menu placeholder="Search type..." options={[{ label: "All" }]}>
                        <MenuTrigger asChild>
                            <LabelMenuButton label="Type" h="40">
                                All
                            </LabelMenuButton>
                        </MenuTrigger>
                        <MenuContent />
                    </Menu>

                    <Menu
                        placeholder="Search category..."
                        inputVisible="always"
                        options={categoryOptions}
                    >
                        <MenuTrigger asChild>
                            <LabelMenuButton label="Category" h="40">
                                {categoryLabel}
                            </LabelMenuButton>
                        </MenuTrigger>
                        <MenuContent style={{ maxHeight: "320px", overflowY: "auto" }} />
                    </Menu>

                    <Menu placeholder="Search created by..." options={[{ label: "All" }]}>
                        <MenuTrigger asChild>
                            <LabelMenuButton label="Created by" h="40">
                                All
                            </LabelMenuButton>
                        </MenuTrigger>
                        <MenuContent />
                    </Menu>

                    <Menu placeholder="Search modified by..." options={[{ label: "All" }]}>
                        <MenuTrigger asChild>
                            <LabelMenuButton label="Modified by" h="40">
                                All
                            </LabelMenuButton>
                        </MenuTrigger>
                        <MenuContent />
                    </Menu>
                </Box>
                <DropdownMenu open={addAgentOpen} onOpenChange={setAddAgentOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            appearance="primary"
                            iconPosition="end"
                            icon={<IconChevronDown />}
                            className="data-[state=open]:ring-2 data-[state=open]:ring-offset-2 data-[state=open]:ring-[#0069ff] outline-none focus:ring-0"
                        >
                            Add Agent
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <Box p="12" display="flex" flexDirection="row" gap="12" alignItems="start" cursor="pointer" className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md" onClick={() => { setAddAgentOpen(false); setTimeout(() => setNewAgentOpen(true), 150); }}>
                            <Box mt="2" style={{ flexShrink: 0 }}>
                                <img src="/opal.png" width={20} height={20} style={{ borderRadius: 5, display: "block" }} alt="Opal" />
                            </Box>
                            <Box>
                                <Text fontWeight="500" fontSize="md">Add with Opal</Text>
                                <Text fontSize="sm" color="fg.secondary">Describe the agent you want and Opal will configure it for you.</Text>
                            </Box>
                        </Box>
                        <Box style={{ height: 1, background: "var(--ax-colors-border-default)", margin: "4px 12px" }} />
                        <Box p="12" display="flex" flexDirection="row" gap="12" alignItems="start" cursor="pointer" className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md" onClick={() => { setAddAgentOpen(false); router.push("/opal/agents/setup"); }}>
                            <Box mt="2" color="fg.default"><IconAgent /></Box>
                            <Box>
                                <Text fontWeight="500" fontSize="md">Specialized Agent</Text>
                                <Text fontSize="sm" color="fg.secondary">Purpose-built to autonomously perform specific tasks creatively within guidelines...</Text>
                            </Box>
                        </Box>
                        <Box p="12" display="flex" flexDirection="row" gap="12" alignItems="start" cursor="pointer" className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md" onClick={() => { setAddAgentOpen(false); router.push("/opal/agents/workflow"); }}>
                            <Box mt="2" color="fg.default"><IconCodeBranch /></Box>
                            <Box>
                                <Text fontWeight="500" fontSize="md">Workflow</Text>
                                <Text fontSize="sm" color="fg.secondary">Orchestrate agents and tools to fulfill your requirements.</Text>
                            </Box>
                        </Box>
                        <Box p="12" display="flex" flexDirection="row" gap="12" alignItems="start" cursor="pointer" className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md" onClick={() => setAddAgentOpen(false)}>
                            <Box mt="2" color="fg.default"><IconUpload /></Box>
                            <Box>
                                <Text fontWeight="500" fontSize="md">Upload</Text>
                                <Text fontSize="sm" color="fg.secondary">Upload an agent from a JSON file.</Text>
                            </Box>
                        </Box>
                    </DropdownMenuContent>
                </DropdownMenu>
            </Box>

            {/* Table */}
            <Table tableStyle={{ tableLayout: "fixed" }}>
                <thead className="[&_th>div]:!shadow-none [&_th>div]:!border-b-0">
                    <Tr>
                        <th className="text-left p-4 text-xs font-normal py-3 align-top text-[var(--ax-colors-fg-tertiary)]">Type</th>
                        {columnOrder.map((colId) => {
                            const header = headerMap[colId];
                            if (!header) return null;
                            return (
                                <DataTableHeaderCell
                                    key={colId}
                                    header={header}
                                    onDragOver={(e: React.DragEvent) => { e.preventDefault(); setDragOverCol(colId); }}
                                    onDragLeave={() => setDragOverCol(null)}
                                    onDrop={(e: React.DragEvent) => {
                                        e.preventDefault();
                                        if (dragColRef.current && dragColRef.current !== colId) {
                                            reorderColumns(dragColRef.current, colId);
                                        }
                                        dragColRef.current = null;
                                        setDragOverCol(null);
                                    }}
                                    className="group"
                                    px={colId === "badge" ? "8" : "16"}
                                    style={{
                                        width: header.getSize(),
                                        borderBottom: "none",
                                        borderLeft: dragOverCol === colId ? "2px solid var(--ax-colors-border-focus)" : undefined,
                                    }}
                                >
                                    {colId === "category" ? (
                                        <Box display="inline-flex" alignItems="center" gap="8">
                                            <Box
                                                draggable
                                                onDragStart={(e: React.DragEvent) => { e.stopPropagation(); dragColRef.current = colId; }}
                                                onDragEnd={() => { dragColRef.current = null; }}
                                                className="opacity-0 group-hover:opacity-60 transition-opacity cursor-grab"
                                                color="fg.tertiary"
                                                style={{ lineHeight: 0 }}
                                            >
                                                <IconGripVertical size={12} />
                                            </Box>
                                            <span>Category</span>
                                            <Box
                                                className="opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto"
                                                onClick={(event: React.MouseEvent) => event.stopPropagation()}
                                            >
                                                <Tooltip content={showCategoryColors ? "Use neutral category pills" : "Use colored category pills"}>
                                                    <Button
                                                        size="sm"
                                                        appearance="subtle"
                                                        aria-label={showCategoryColors ? "Turn off category colors" : "Turn on category colors"}
                                                        icon={showCategoryColors ? <IconEyeSlash size={14} /> : <IconEye size={14} />}
                                                        onClick={toggleCategoryPills}
                                                    />
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    ) : colId === "badge" ? null : (
                                        <Box display="inline-flex" alignItems="center" gap="4">
                                            <Box
                                                draggable
                                                onDragStart={(e: React.DragEvent) => { e.stopPropagation(); dragColRef.current = colId; }}
                                                onDragEnd={() => { dragColRef.current = null; }}
                                                className="opacity-0 group-hover:opacity-60 transition-opacity cursor-grab"
                                                color="fg.tertiary"
                                                style={{ lineHeight: 0 }}
                                            >
                                                <IconGripVertical size={12} />
                                            </Box>
                                            <span>{typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : ""}</span>
                                        </Box>
                                    )}
                                </DataTableHeaderCell>
                            );
                        })}
                        <th className="text-left p-4 text-xs font-normal py-3 align-top text-[var(--ax-colors-fg-tertiary)]"></th>
                    </Tr>
                </thead>
                <tbody>
                    {filteredAgents.map((agent, index) => (
                        <Tr key={index} url={agent.id === 'cmp-workflow' ? '/opal/agents/workflow?preset=cmp-workflow' : `/opal/agents/setup?id=${agent.id}&mode=edit`}>
                            {/* Fixed: Type icon */}
                            <Td>
                                <Box color="fg.secondary">{agent.icon}</Box>
                            </Td>
                            {/* Dynamic reorderable columns */}
                            {columnOrder.map((colId) => {
                                if (colId === "name") return (
                                    <Td key="name" style={{ width: table.getColumn("name")?.getSize() }}>
                                        <Box display="flex" flexDirection="row" gap="12" alignItems="start">
                                            {agent.emoji && (
                                                <Box
                                                    style={{
                                                        flexShrink: 0,
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: 6,
                                                        background: "radial-gradient(circle, rgba(245,243,255,1) 0%, rgba(229,239,255,1) 50%, rgba(221,214,254,1) 100%)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: 13,
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    {agent.emoji}
                                                </Box>
                                            )}
                                            <Box>
                                                <Text fontWeight="500">{agent.name}</Text>
                                                <Text fontSize="sm" color="fg.secondary">{agent.handle}</Text>
                                            </Box>
                                        </Box>
                                    </Td>
                                );
                                if (colId === "badge") return (
                                    <Td key="badge" className="!px-2" style={{ width: table.getColumn("badge")?.getSize() }}>
                                        {agent.tag && agent.tag !== "Draft" && (
                                            agent.tag === "New" ? (
                                                <Box
                                                    display="inline-flex"
                                                    alignItems="center"
                                                    px="6"
                                                    py="2"
                                                    rounded="full"
                                                    style={{ background: "linear-gradient(90deg, #2647ff 0%, #7a3cff 100%)" }}
                                                >
                                                    <Text fontSize="xs" color="fg.default.inverse">{agent.tag}</Text>
                                                </Box>
                                            ) : (
                                                <Badge intent="success" variant="subtle">{agent.tag}</Badge>
                                            )
                                        )}
                                    </Td>
                                );
                                if (colId === "creator") return (
                                    <Td key="creator" style={{ width: table.getColumn("creator")?.getSize() }}>
                                        <Box display="flex" flexDirection="row" gap="8" alignItems="center">
                                            {agent.creator.type === "system" ? (
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    rounded="full"
                                                    bg="bg.default"
                                                    style={{ width: "24px", height: "24px" }}
                                                >
                                                    <Image src="/logo.svg" alt="Optimizely" width={16} height={16} />
                                                </Box>
                                            ) : (
                                                <Avatar name={agent.creator.name} src={agent.creator.avatar} size="sm" />
                                            )}
                                            <Text>{agent.creator.name}</Text>
                                        </Box>
                                    </Td>
                                );
                                if (colId === "category") return (
                                    <Td key="category" style={{ width: table.getColumn("category")?.getSize() }}>
                                        <Box display="flex" flexDirection="row" gap="4" style={{ flexWrap: "wrap" }}>
                                            {agent.tags?.map((tag) => (
                                                showCategoryColors ? (
                                                    <span key={tag.label} style={{
                                                        background: tag.bg,
                                                        color: tag.color,
                                                        borderRadius: 6,
                                                        padding: "2px 6px",
                                                        fontSize: 12,
                                                        lineHeight: "16px",
                                                        fontFamily: "Inter, sans-serif",
                                                        whiteSpace: "nowrap",
                                                    }}>
                                                        {tag.label}
                                                    </span>
                                                ) : (
                                                    <Badge key={tag.label}>{tag.label}</Badge>
                                                )
                                            ))}
                                        </Box>
                                    </Td>
                                );
                                if (colId === "description") return (
                                    <Td key="description" style={{ width: table.getColumn("description")?.getSize() }}>
                                        <Text fontSize="sm" color="fg.default" lineClamp="2">{agent.description}</Text>
                                    </Td>
                                );
                                if (colId === "activity") return <Td key="activity" style={{ width: table.getColumn("activity")?.getSize() }}>{agent.activity}</Td>;
                                if (colId === "lastModified") return (
                                    <Td key="lastModified" style={{ width: table.getColumn("lastModified")?.getSize() }}>
                                        <Box>
                                            <Text fontSize="sm">{agent.lastModified.date}</Text>
                                            <Text fontSize="xs" color="fg.secondary">by {agent.lastModified.user}</Text>
                                        </Box>
                                    </Td>
                                );
                                if (colId === "status") return (
                                    <Td key="status" type="badge" data={agent.status === "Active" ? "success" : "neutral"} style={{ width: table.getColumn("status")?.getSize() }}>
                                        {agent.status}
                                    </Td>
                                );
                                return null;
                            })}
                            {/* Fixed: Action button */}
                            <Td type="button" />
                        </Tr>
                    ))}
                </tbody>
            </Table>
        </Box>
        </>
    );
}

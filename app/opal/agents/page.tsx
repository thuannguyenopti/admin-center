"use client";

import {
    Box,
    Heading,
    Text,
    Button,
    Badge,
    Avatar,
    Checkbox,
    Field,
    Input,
    SearchInput,
    Switch,
    LabelMenuButton,
    Menu,
    MenuTrigger,
    MenuContent,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    Link,
    Separator,
    Tooltip,
} from "@optiaxiom/react";
import { Table, Tr, Td, Th } from "@/app/components/Table";
import { DataTableHeaderCell } from "@optiaxiom/react/unstable";
import { useReactTable, getCoreRowModel, type ColumnDef } from "@tanstack/react-table";
import { IconAgent, IconCodeBranch, IconUpload, IconSliders, IconXmark, IconPlus, IconCirclePlus, IconChevronDown, IconPen, IconTrashCan, IconDownload, IconEllipsisSolid, IconEye, IconEyeSlash, IconArrowRightArrowLeft, IconCircleStop, IconCircleQuestion } from "@optiaxiom/icons";
import { NewAgentDialog } from "./components/NewAgentDialog";
import { ImportAgentDialog } from "./components/ImportAgentDialog";
import { ExportAgentDialog } from "./components/ExportAgentDialog";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function MultiTurnIcon({ size = 14 }: { size?: number }) {
    return (
        <svg width={size} height={Math.round(size * 0.8)} viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.8516 4.35938L13.8516 7.35938C13.6641 7.54688 13.3203 7.54688 13.1328 7.35938C12.9453 7.17188 12.9453 6.82812 13.1328 6.64062L15.2891 4.48438H3.50781C3.22656 4.48438 3.00781 4.26562 3.00781 3.98438C3.00781 3.73438 3.22656 3.48438 3.50781 3.48438H15.2891L13.1328 1.35938C12.9453 1.17188 12.9453 0.828125 13.1328 0.640625C13.3203 0.453125 13.6641 0.453125 13.8516 0.640625L16.8516 3.64062C17.0391 3.82812 17.0391 4.17188 16.8516 4.35938ZM6.13281 15.3594L3.13281 12.3594C2.94531 12.1719 2.94531 11.8281 3.13281 11.6406L6.13281 8.64062C6.32031 8.45312 6.66406 8.45312 6.85156 8.64062C7.03906 8.82812 7.03906 9.17188 6.85156 9.35938L4.69531 11.4844H16.5078C16.7578 11.4844 17.0078 11.7344 17.0078 11.9844C17.0078 12.2656 16.7578 12.4844 16.5078 12.4844H4.69531L6.85156 14.6406C7.03906 14.8281 7.03906 15.1719 6.85156 15.3594C6.66406 15.5469 6.32031 15.5469 6.13281 15.3594Z" fill="currentColor"/>
        </svg>
    );
}

const STATIC_AGENTS = [
    {
        id: "email-campaign",
        icon: <IconAgent />,
        emoji: "✍️",
        name: "Write an email campaign",
        handle: "@email_gen_agent",
        tag: "New",
        multiTurn: true,
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Content strategy", intent: "information" }, { label: "Copywriting", intent: "success" }, { label: "Email marketing", intent: "primary" }],
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
        tags: [{ label: "SEO/GEO", intent: "primary" }, { label: "Analytics", intent: "information" }],
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
        multiTurn: true,
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Competitive analysis", intent: "success" }, { label: "Research", intent: "primary" }],
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
        multiTurn: true,
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Testing", intent: "information" }, { label: "Experimentation", intent: "primary" }, { label: "CRO", intent: "success" }],
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
        tags: [{ label: "Content strategy", intent: "information" }, { label: "Planning", intent: "warning" }],
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
        tags: [{ label: "Paid media", intent: "information" }, { label: "Testing", intent: "information" }],
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
        tags: [{ label: "Competitive analysis", intent: "success" }, { label: "Market review", intent: "warning" }, { label: "Keywords", intent: "primary" }, { label: "Technical SEO", intent: "information" }],
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
        tags: [{ label: "Strategy", intent: "primary" }, { label: "Social media", intent: "primary" }],
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
        tags: [{ label: "Content strategy", intent: "information" }, { label: "Localization", intent: "success" }],
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
        tags: [{ label: "Testing", intent: "information" }, { label: "Analytics", intent: "information" }],
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
        multiTurn: true,
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Testing", intent: "information" }, { label: "Experimentation", intent: "primary" }],
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
        tags: [{ label: "SEO/GEO", intent: "primary" }, { label: "Analytics", intent: "information" }],
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
        tags: [{ label: "Planning", intent: "warning" }, { label: "Automation", intent: "success" }],
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
        tags: [{ label: "SEO/GEO", intent: "primary" }, { label: "Research", intent: "success" }],
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
        tags: [{ label: "Automation", intent: "warning" }, { label: "Campaigns", intent: "success" }],
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
        tags: [{ label: "Automation", intent: "warning" }, { label: "Planning", intent: "success" }],
        description: "Summarize your meeting transcripts into actionable items and key takeaways.",
        activity: "5 Runs",
        lastModified: { date: "Aug 20, 2025", user: "John Smith" },
        status: "Inactive",
    },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type TagIntent = "primary" | "success" | "danger" | "warning" | "information" | "neutral";

// ─── Column definitions ───────────────────────────────────────────────────────

type ColId = "name" | "badge" | "multiTurn" | "creator" | "category" | "description" | "activity" | "lastModified" | "status";

const DEFAULT_COLUMN_ORDER: ColId[] = ["name", "badge", "multiTurn", "creator", "category", "description", "activity", "lastModified", "status"];

type AgentRow = typeof STATIC_AGENTS[number];

const REORDERABLE_COLUMN_DEFS: ColumnDef<AgentRow>[] = [
    { id: "name",         header: "Name",          enableResizing: true,  size: 220, minSize: 120 },
    { id: "badge",        header: "",              enableResizing: false, size: 48,  minSize: 0   },
    { id: "multiTurn",    header: "",              enableResizing: false, size: 32,  minSize: 0   },
    { id: "creator",      header: "Created by",    enableResizing: true,  size: 160, minSize: 80  },
    { id: "category",     header: "Category",      enableResizing: true,  size: 180, minSize: 80  },
    { id: "description",  header: "Description",   enableResizing: true,  size: 300, minSize: 120 },
    { id: "activity",     header: "Activity",      enableResizing: true,  size: 100, minSize: 80  },
    { id: "lastModified", header: "Last Modified", enableResizing: true,  size: 140, minSize: 100 },
    { id: "status",       header: "Status",        enableResizing: true,  size: 100, minSize: 80  },
];

// ─── Activity Log Data ────────────────────────────────────────────────────────

type LogStatus = "Completed" | "Failed" | "Pending" | "In Progress";

const ACTIVITY_LOGS_DATA = [
    { id: "alog-0a", agentId: "experiment-planning",   executionTime: "Jun 30, 2026, 4:31 AM",  trigger: "Message",   triggeredBy: { name: "John Smith",   initials: "JS" }, status: "In Progress" as LogStatus, modelProvider: "Instance Default", inferenceLevel: "Rudimentary", credits: null, evaluationScore: null,  duration: "—"      },
    { id: "alog-0b", agentId: "email-campaign",        executionTime: "Jun 30, 2026, 4:30 AM",  trigger: "Scheduled", triggeredBy: { name: "Sarah Connor", initials: "SC" }, status: "In Progress" as LogStatus, modelProvider: "Instance Default", inferenceLevel: "Standard",    credits: null, evaluationScore: null,  duration: "—"      },
    { id: "alog-0c", agentId: "seo-keyword-research",  executionTime: "Jun 30, 2026, 4:29 AM",  trigger: "Message",   triggeredBy: { name: "John Smith",   initials: "JS" }, status: "Pending"     as LogStatus, modelProvider: "Instance Default", inferenceLevel: "Rudimentary", credits: null, evaluationScore: null,  duration: "—"      },
    { id: "alog-1",  agentId: "experiment-planning",   executionTime: "Jun 30, 2026, 4:27 AM",  trigger: "Message",   triggeredBy: { name: "John Smith",   initials: "JS" }, status: "Completed" as LogStatus, modelProvider: "Instance Default", inferenceLevel: "Rudimentary", credits: 12,   evaluationScore: null,  duration: "57s"    },
    { id: "alog-2",  agentId: "experiment-planning",   executionTime: "Jun 30, 2026, 4:26 AM",  trigger: "Message",   triggeredBy: { name: "John Smith",   initials: "JS" }, status: "Completed" as LogStatus, modelProvider: "Instance Default", inferenceLevel: "Rudimentary", credits: 14,   evaluationScore: null,  duration: "44s"    },
    { id: "alog-3",  agentId: "analyze-competitors",   executionTime: "Jun 30, 2026, 4:25 AM",  trigger: "Message",   triggeredBy: { name: "John Smith",   initials: "JS" }, status: "Completed" as LogStatus, modelProvider: "Instance Default", inferenceLevel: "Rudimentary", credits: 2,    evaluationScore: null,  duration: "5s"     },
    { id: "alog-4",  agentId: "seo-audit",             executionTime: "Jun 30, 2026, 4:25 AM",  trigger: "Message",   triggeredBy: { name: "John Smith",   initials: "JS" }, status: "Completed" as LogStatus, modelProvider: "Instance Default", inferenceLevel: "Rudimentary", credits: 2,    evaluationScore: null,  duration: "7s"     },
    { id: "alog-5",  agentId: "ab-experiment",         executionTime: "Jun 30, 2026, 4:24 AM",  trigger: "Message",   triggeredBy: { name: "John Smith",   initials: "JS" }, status: "Completed" as LogStatus, modelProvider: "Instance Default", inferenceLevel: "Rudimentary", credits: 2,    evaluationScore: null,  duration: "7s"     },
    { id: "alog-6",  agentId: "email-campaign",        executionTime: "Jun 30, 2026, 4:23 AM",  trigger: "Message",   triggeredBy: { name: "John Smith",   initials: "JS" }, status: "Completed" as LogStatus, modelProvider: "Instance Default", inferenceLevel: "Rudimentary", credits: 2,    evaluationScore: null,  duration: "6s"     },
    { id: "alog-7",  agentId: "optimize-geo",          executionTime: "Jun 30, 2026, 4:23 AM",  trigger: "Message",   triggeredBy: { name: "John Smith",   initials: "JS" }, status: "Failed"    as LogStatus, modelProvider: "Instance Default", inferenceLevel: "Simple",      credits: null, evaluationScore: null,  duration: "37s"    },
    { id: "alog-8",  agentId: "geo-recommendations",   executionTime: "Jun 30, 2026, 4:15 AM",  trigger: "Message",   triggeredBy: { name: "Sarah Connor", initials: "SC" }, status: "Completed" as LogStatus, modelProvider: "Gemini",           inferenceLevel: "Rudimentary", credits: 4,    evaluationScore: null,  duration: "7s"     },
    { id: "alog-9",  agentId: "geo-recommendations",   executionTime: "Jun 30, 2026, 4:15 AM",  trigger: "Message",   triggeredBy: { name: "Sarah Connor", initials: "SC" }, status: "Completed" as LogStatus, modelProvider: "Gemini",           inferenceLevel: "Rudimentary", credits: 2,    evaluationScore: null,  duration: "3s"     },
    { id: "alog-10", agentId: "social-media-strategy", executionTime: "Jun 29, 2026, 3:55 PM",  trigger: "Scheduled", triggeredBy: { name: "Sarah Connor", initials: "SC" }, status: "Completed" as LogStatus, modelProvider: "Instance Default", inferenceLevel: "Standard",    credits: 28,   evaluationScore: 0.94,  duration: "2m 14s" },
    { id: "alog-11", agentId: "content-calendar",      executionTime: "Jun 29, 2026, 2:12 PM",  trigger: "Message",   triggeredBy: { name: "John Smith",   initials: "JS" }, status: "Failed"    as LogStatus, modelProvider: "Instance Default", inferenceLevel: "Rudimentary", credits: null, evaluationScore: null,  duration: "12s"    },
    { id: "alog-12", agentId: "ad-variations",         executionTime: "Jun 28, 2026, 11:40 AM", trigger: "Scheduled", triggeredBy: { name: "Sarah Connor", initials: "SC" }, status: "Completed" as LogStatus, modelProvider: "Instance Default", inferenceLevel: "Standard",    credits: 19,   evaluationScore: 0.87,  duration: "1m 32s" },
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
    const [importAgentOpen, setImportAgentOpen] = useState(false);
    const [exportAgentOpen, setExportAgentOpen] = useState(false);
    const [exportAgent, setExportAgent] = useState<typeof STATIC_AGENTS[number] | null>(null);

    const [showTypeCol, setShowTypeCol] = useState(true);
    const [typeHeaderHovered, setTypeHeaderHovered] = useState(false);
    const [showMultiTurnCol, setShowMultiTurnCol] = useState(false);
    const [showEmojis, setShowEmojis] = useState(false);

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

    // ── Search & filter ───────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [agentTypeFilter, setAgentTypeFilter] = useState<string[]>([]);
    const [filterOpen, setFilterOpen] = useState(false);
    const [logFilterOpen, setLogFilterOpen] = useState(false);

    // ── Bulk selection ────────────────────────────────────────────────────────
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

    // ── Activity log filters + selection ─────────────────────────────────────
    const [logSearchQuery, setLogSearchQuery] = useState("");
    const [logStatusFilter, setLogStatusFilter] = useState("All");
    const [logTriggeredByFilter, setLogTriggeredByFilter] = useState("All Users");
    const [logDateRangeFilter, setLogDateRangeFilter] = useState("Last 30 days");
    const [filterVariantB, setFilterVariantB] = useState(false);
    const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());
    const [hoveredLogId, setHoveredLogId] = useState<string | null>(null);
    const filteredLogs = useMemo(() => ACTIVITY_LOGS_DATA.filter(log => {
        if (logSearchQuery) {
            const a = STATIC_AGENTS.find(x => x.id === log.agentId);
            if (!(a?.name ?? log.agentId).toLowerCase().includes(logSearchQuery.toLowerCase())) return false;
        }
        if (logStatusFilter !== "All" && log.status !== logStatusFilter) return false;
        if (logTriggeredByFilter !== "All Users" && log.triggeredBy.name !== logTriggeredByFilter) return false;
        return true;
    }), [logSearchQuery, logStatusFilter, logTriggeredByFilter]);

    const cancellableLogs = useMemo(() => filteredLogs.filter(l => l.status === "Pending" || l.status === "In Progress"), [filteredLogs]);
    const allLogsSelected = filteredLogs.length > 0 && filteredLogs.every(l => selectedLogIds.has(l.id));
    const someLogsSelected = filteredLogs.some(l => selectedLogIds.has(l.id)) && !allLogsSelected;
    const canCancelSelection = selectedLogIds.size > 0 && [...selectedLogIds].every(id => {
        const log = filteredLogs.find(l => l.id === id);
        return log?.status === "Pending" || log?.status === "In Progress";
    });
    const nonCancellableSelectedCount = [...selectedLogIds].filter(id => {
        const log = filteredLogs.find(l => l.id === id);
        return log && log.status !== "Pending" && log.status !== "In Progress";
    }).length;
    const toggleLogSelect = (id: string) => setSelectedLogIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });
    const toggleAllLogs = () => {
        if (allLogsSelected) setSelectedLogIds(new Set());
        else setSelectedLogIds(new Set(cancellableLogs.map(l => l.id)));
    };
    const showCategoryColors = searchParams.get("categoryPills") === "colored";

    const filteredAgents = agents.filter((agent) => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            if (!agent.name.toLowerCase().includes(q) && !agent.description.toLowerCase().includes(q)) return false;
        }
        if (statusFilter.length > 0 && !statusFilter.includes(agent.status)) return false;
        return true;
    });

    const allSelected = filteredAgents.length > 0 && filteredAgents.every(a => selectedIds.has(a.id));
    const someSelected = selectedIds.size > 0 && !allSelected;
    const toggleSelect = (id: string) => setSelectedIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });
    const toggleAll = () => {
        if (allSelected) setSelectedIds(new Set());
        else setSelectedIds(new Set(filteredAgents.map(a => a.id)));
    };

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
        <ImportAgentDialog open={importAgentOpen} onOpenChange={setImportAgentOpen} />
        <ExportAgentDialog open={exportAgentOpen} onOpenChange={setExportAgentOpen} agent={exportAgent} />
        <Box px="32" pb="24" display="flex" flexDirection="column" gap="24" h="full" bg="bg.page" style={{ overflowY: "auto", overflowX: "hidden" }}>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" gap="16" style={{ paddingTop: 24 }}>
                <Box display="flex" flexDirection="column" gap="8">
                    <Heading level="1">Agents</Heading>
                    <Text color="fg.secondary">Empower your marketing team by customizing Opal agents to meet your specific needs.</Text>
                </Box>
                <Box display="flex" alignItems="center" gap="16" px="12" py="8" rounded="md" style={{ flexShrink: 0, background: "var(--ax-colors-bg-secondary)", border: "1px dashed var(--ax-colors-border-secondary)" }}>
                    <Text fontSize="xs" fontWeight="500" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>Feedback</Text>
                    <Box display="flex" alignItems="center" gap="8">
                        <Switch checked={filterVariantB} onCheckedChange={setFilterVariantB} />
                        <Text fontSize="sm" color="fg.secondary" style={{ whiteSpace: "nowrap" }}>Expanded filters</Text>
                    </Box>
                </Box>
            </Box>

            {/* Sticky header: tabs + conditional filter/toolbar */}
            <Box style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--ax-colors-bg-page)", marginLeft: -32, marginRight: -32, paddingLeft: 32, paddingRight: 32 }}>
                <Box display="flex" gap="24" borderB="1" borderColor="border.tertiary">
                {["Your Agents", "Agent Activity"].map((tab) => (
                    <Box
                        key={tab}
                        pb="12"
                        cursor="pointer"
                        borderB={activeTab === tab ? "2" : "0"}
                        borderColor={activeTab === tab ? "border.default" : "transparent"}
                        onClick={() => setActiveTab(tab)}
                        style={activeTab === tab ? { borderBottomColor: "var(--ax-colors-fg-default)" } : {}}
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
                {activeTab === "Agent Activity" ? (
                    <Box display="flex" flexDirection="column" gap="8" style={{ paddingTop: 16, paddingBottom: 0 }}>
                        <Box display="flex" gap="8" alignItems="center">
                            {filterVariantB ? (
                                <>
                                    <Box style={{ width: 400 }}>
                                        <SearchInput
                                            placeholder="Search by agent name"
                                            size="lg"
                                            value={logSearchQuery}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLogSearchQuery(e.target.value)}
                                        />
                                    </Box>
                                    <Menu options={[
                                        { label: "All Statuses", execute: () => setLogStatusFilter("All") },
                                        { label: "Completed", execute: () => setLogStatusFilter("Completed") },
                                        { label: "Failed", execute: () => setLogStatusFilter("Failed") },
                                    ]}>
                                        <MenuTrigger asChild>
                                            <LabelMenuButton label="Status">{logStatusFilter === "All" ? "All" : logStatusFilter}</LabelMenuButton>
                                        </MenuTrigger>
                                        <MenuContent />
                                    </Menu>
                                    <Menu options={[
                                        { label: "All Types", execute: () => {} },
                                        { label: "Specialized", execute: () => {} },
                                        { label: "Workflow", execute: () => {} },
                                    ]}>
                                        <MenuTrigger asChild>
                                            <LabelMenuButton label="Agent Type">All</LabelMenuButton>
                                        </MenuTrigger>
                                        <MenuContent />
                                    </Menu>
                                    <Menu options={[{ label: "All Users", execute: () => {} }]}>
                                        <MenuTrigger asChild>
                                            <LabelMenuButton label="Triggered By">All</LabelMenuButton>
                                        </MenuTrigger>
                                        <MenuContent />
                                    </Menu>
                                    <Menu options={[
                                        { label: "All Time", execute: () => setLogDateRangeFilter("All") },
                                        { label: "Last 7 days", execute: () => setLogDateRangeFilter("Last 7 days") },
                                        { label: "Last 30 days", execute: () => setLogDateRangeFilter("Last 30 days") },
                                        { label: "Last 90 days", execute: () => setLogDateRangeFilter("Last 90 days") },
                                    ]}>
                                        <MenuTrigger asChild>
                                            <LabelMenuButton label="Date Range">{logDateRangeFilter === "All" ? "All" : logDateRangeFilter}</LabelMenuButton>
                                        </MenuTrigger>
                                        <MenuContent />
                                    </Menu>
                                </>
                            ) : (
                                <>
                                    <Box style={{ width: 400 }}>
                                        <SearchInput
                                            placeholder="Search by agent name"
                                            size="lg"
                                            value={logSearchQuery}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLogSearchQuery(e.target.value)}
                                        />
                                    </Box>
                                    <DropdownMenu open={logFilterOpen} onOpenChange={setLogFilterOpen}>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                appearance="default"
                                                size="lg"
                                                icon={<IconSliders size={16} />}
                                                aria-label="Open filters"
                                            />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" style={{ width: 302 }}>
                                            <Box px="12" py="8" display="flex" flexDirection="column" gap="24">
                                                <Text fontWeight="500" fontSize="md">Filters</Text>
                                                <Box display="flex" gap="48">
                                                    <Box display="flex" flexDirection="column" gap="12">
                                                        <Text fontSize="sm" color="fg.secondary">Status</Text>
                                                        {(["Completed", "Failed"] as const).map(s => (
                                                            <Checkbox
                                                                key={s}
                                                                checked={logStatusFilter === s}
                                                                onCheckedChange={checked => setLogStatusFilter(checked ? s : "All")}
                                                            >{s}</Checkbox>
                                                        ))}
                                                    </Box>
                                                    <Box display="flex" flexDirection="column" gap="12">
                                                        <Text fontSize="sm" color="fg.secondary">Agent Type</Text>
                                                        {(["Specialized", "Workflow"] as const).map(t => (
                                                            <Checkbox key={t} checked={false} onCheckedChange={() => {}}>{t}</Checkbox>
                                                        ))}
                                                    </Box>
                                                </Box>
                                                <Field label="Triggered By">
                                                    <Input size="lg" placeholder="All users" />
                                                </Field>
                                                <Field label="Date Range">
                                                    <Input size="lg" placeholder="Last 30 days" />
                                                </Field>
                                            </Box>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            )}
                        </Box>
                        {selectedLogIds.size > 0 && (
                            <Box display="flex" alignItems="center" gap="8" px="12" bg="bg.secondary" rounded="md" style={{ height: 40 }}>
                                <Text fontWeight="600" fontSize="sm">{selectedLogIds.size} selected</Text>
                                <Button appearance="subtle" size="sm" icon={<IconXmark size={16} />} onClick={() => setSelectedLogIds(new Set())} aria-label="Clear selection" />
                                {nonCancellableSelectedCount > 0 && (
                                    <>
                                        <Box display="flex" alignItems="center" gap="4">
                                            <Text fontSize="sm" color="fg.secondary">{nonCancellableSelectedCount} can't be canceled</Text>
                                            <Tooltip content="Only running or pending executions can be canceled" delayDuration={100}>
                                                <Box style={{ display: "inline-flex", cursor: "default" }}>
                                                    <IconCircleQuestion size={14} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
                                                </Box>
                                            </Tooltip>
                                        </Box>
                                        <Button
                                            appearance="default"
                                            size="sm"
                                            onClick={() => setSelectedLogIds(new Set(
                                                [...selectedLogIds].filter(id => {
                                                    const log = filteredLogs.find(l => l.id === id);
                                                    return log?.status === "Pending" || log?.status === "In Progress";
                                                })
                                            ))}
                                        >
                                            Keep cancelable only
                                        </Button>
                                    </>
                                )}
                                <Box style={{ flex: 1 }} />
                                <Button appearance="danger-outline" size="md" icon={<IconCircleStop size={14} />} disabled={!canCancelSelection} onClick={() => setSelectedLogIds(new Set())}>
                                    Cancel Run
                                </Button>
                            </Box>
                        )}
                    </Box>
                ) : (
                    <Box display="flex" justifyContent="space-between" alignItems="start" gap="12" style={{ paddingTop: 16, paddingBottom: 0 }}>
                <Box display="flex" flexDirection="column" gap="8" style={{ flex: 1, minWidth: 0 }}>
                    <Box display="flex" gap="8" alignItems="center" style={{ flex: 1 }}>
                        {filterVariantB ? (
                            <>
                                <Box style={{ width: 400 }}>
                                    <SearchInput
                                        placeholder="Search agents"
                                        size="lg"
                                        value={searchQuery}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                    />
                                </Box>
                                <Menu options={[
                                    { label: "All Statuses", execute: () => setStatusFilter([]) },
                                    { label: "Active", execute: () => setStatusFilter(["Active"]) },
                                    { label: "Inactive", execute: () => setStatusFilter(["Inactive"]) },
                                ]}>
                                    <MenuTrigger asChild>
                                        <LabelMenuButton label="Status">{statusFilter.length === 0 ? "All" : statusFilter[0]}</LabelMenuButton>
                                    </MenuTrigger>
                                    <MenuContent />
                                </Menu>
                                <Menu options={[
                                    { label: "All Types", execute: () => setAgentTypeFilter([]) },
                                    { label: "Specialized", execute: () => setAgentTypeFilter(["Specialized"]) },
                                    { label: "Workflow", execute: () => setAgentTypeFilter(["Workflow"]) },
                                ]}>
                                    <MenuTrigger asChild>
                                        <LabelMenuButton label="Agent Type">{agentTypeFilter.length === 0 ? "All" : agentTypeFilter[0]}</LabelMenuButton>
                                    </MenuTrigger>
                                    <MenuContent />
                                </Menu>
                                <Menu options={[{ label: "All Users", execute: () => {} }]}>
                                    <MenuTrigger asChild>
                                        <LabelMenuButton label="Created By">All</LabelMenuButton>
                                    </MenuTrigger>
                                    <MenuContent />
                                </Menu>
                            </>
                        ) : (
                            <>
                                <Box style={{ width: 400 }}>
                                    <SearchInput
                                        placeholder="Search agents"
                                        size="lg"
                                        value={searchQuery}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                    />
                                </Box>
                                <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            appearance="default"
                                            size="lg"
                                            icon={<IconSliders size={16} />}
                                            aria-label="Open filters"
                                        />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" style={{ width: 302 }}>
                                        <Box px="12" py="8" display="flex" flexDirection="column" gap="24">
                                            <Text fontWeight="500" fontSize="md">Filters</Text>
                                            <Box display="flex" gap="48">
                                                <Box display="flex" flexDirection="column" gap="12">
                                                    <Text fontSize="sm" color="fg.secondary">Status</Text>
                                                    {(["Active", "Inactive"] as const).map(s => (
                                                        <Checkbox
                                                            key={s}
                                                            checked={statusFilter.includes(s)}
                                                            onCheckedChange={(checked) =>
                                                                setStatusFilter(prev =>
                                                                    checked === true ? [...prev, s] : prev.filter(x => x !== s)
                                                                )
                                                            }
                                                        >
                                                            {s}
                                                        </Checkbox>
                                                    ))}
                                                </Box>
                                                <Box display="flex" flexDirection="column" gap="12">
                                                    <Text fontSize="sm" color="fg.secondary">Agent Type</Text>
                                                    {(["Specialized", "Workflow"] as const).map(t => (
                                                        <Checkbox
                                                            key={t}
                                                            checked={agentTypeFilter.includes(t)}
                                                            onCheckedChange={(checked) =>
                                                                setAgentTypeFilter(prev =>
                                                                    checked === true ? [...prev, t] : prev.filter(x => x !== t)
                                                                )
                                                            }
                                                        >
                                                            {t}
                                                        </Checkbox>
                                                    ))}
                                                </Box>
                                            </Box>
                                            <Field label="Created by">
                                                <Input size="lg" placeholder="All users" />
                                            </Field>
                                            <Field label="Modified by">
                                                <Input size="lg" placeholder="All users" />
                                            </Field>
                                        </Box>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                        {selectedIds.size > 0 && (
                            <Box display="flex" alignItems="center" gap="8" px="12" bg="bg.secondary" rounded="md" style={{ height: 40, flex: 1 }}>
                                <Text fontWeight="600" fontSize="sm">{selectedIds.size} selected</Text>
                                <Button appearance="subtle" size="sm" icon={<IconXmark size={16} />} onClick={() => setSelectedIds(new Set())} aria-label="Clear selection" />
                                <Box style={{ flex: 1 }} />
                                <Button appearance="danger-outline" size="md" icon={<IconTrashCan size={14} />} onClick={() => {
                                    const toDelete = Array.from(selectedIds);
                                    const updated = userAgents.filter(a => !toDelete.includes(a.id));
                                    setUserAgents(updated);
                                    localStorage.setItem("opal_user_agents", JSON.stringify(updated.map(({ icon: _icon, ...rest }) => rest)));
                                    setSelectedIds(new Set());
                                }}>
                                    Delete
                                </Button>
                            </Box>
                        )}
                    </Box>
                    {!filterVariantB && (statusFilter.length > 0 || agentTypeFilter.length > 0) && (
                        <Box display="flex" gap="8" flexWrap="wrap">
                            {statusFilter.map(s => (
                                <Box
                                    key={s}
                                    display="inline-flex"
                                    alignItems="center"
                                    gap="4"
                                    style={{
                                        height: 24,
                                        paddingLeft: 8,
                                        paddingRight: 4,
                                        borderRadius: 8,
                                        background: "var(--ax-colors-bg-tertiary)",
                                        fontFamily: "var(--ax-font-family-caption)",
                                        fontSize: 11,
                                        letterSpacing: "0.04em",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    <strong>STATUS:</strong>&nbsp;{s}
                                    <Button size="sm" appearance="subtle" icon={<IconXmark size={10} />}
                                        onClick={() => setStatusFilter(prev => prev.filter(x => x !== s))}
                                        aria-label={`Remove ${s} status filter`}
                                        style={{ width: 16, height: 16 }}
                                    />
                                </Box>
                            ))}
                            {agentTypeFilter.map(t => (
                                <Box
                                    key={t}
                                    display="inline-flex"
                                    alignItems="center"
                                    gap="4"
                                    style={{
                                        height: 24,
                                        paddingLeft: 8,
                                        paddingRight: 4,
                                        borderRadius: 8,
                                        background: "var(--ax-colors-bg-tertiary)",
                                        fontFamily: "var(--ax-font-family-caption)",
                                        fontSize: 11,
                                        letterSpacing: "0.04em",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    <strong>AGENT TYPE:</strong>&nbsp;{t}
                                    <Button size="sm" appearance="subtle" icon={<IconXmark size={10} />}
                                        onClick={() => setAgentTypeFilter(prev => prev.filter(x => x !== t))}
                                        aria-label={`Remove ${t} type filter`}
                                        style={{ width: 16, height: 16 }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
                {selectedIds.size === 0 && <Box display="flex" gap="8" alignItems="center" style={{ flexShrink: 0 }}>
                    <DropdownMenu open={addAgentOpen} onOpenChange={setAddAgentOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                appearance="primary"
                                size="lg"
                                iconPosition="end"
                                icon={<IconChevronDown />}
                                addonBefore={
                                    <Box
                                        rounded="sm"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        style={{
                                            backgroundColor: "var(--_1bzuvea)",
                                            color: "var(--ze7z71)",
                                            padding: 4,
                                            width: 28,
                                            height: 28,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <IconCirclePlus size={16} />
                                    </Box>
                                }
                                className="data-[state=open]:ring-2 data-[state=open]:ring-offset-2 data-[state=open]:ring-[var(--ax-colors-border-accent)] outline-none focus:ring-0"
                            >
                                Add Agent
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <Box p="12" display="flex" flexDirection="row" gap="12" alignItems="start" cursor="pointer" className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md" onClick={() => { setAddAgentOpen(false); setTimeout(() => setNewAgentOpen(true), 150); }}>
                                <Box mt="2" style={{ flexShrink: 0 }}>
                                    <Box rounded="md" overflow="hidden" style={{ width: 20, height: 20, flexShrink: 0 }}>
                                            <img src="/opal.png" width={20} height={20} style={{ display: "block" }} alt="Opal" />
                                        </Box>
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
                                    <Text fontWeight="500" fontSize="md">Build with Opal</Text>
                                    <Text fontSize="sm" color="fg.secondary">Start with Opal in chat, use action cards to shape the brief, and then refine the draft.</Text>
                                </Box>
                            </Box>
                            <Box p="12" display="flex" flexDirection="row" gap="12" alignItems="start" cursor="pointer" className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md" onClick={() => { setAddAgentOpen(false); router.push("/opal/agents/workflow"); }}>
                                <Box mt="2" color="fg.default"><IconCodeBranch /></Box>
                                <Box>
                                    <Text fontWeight="500" fontSize="md">Workflow</Text>
                                    <Text fontSize="sm" color="fg.secondary">Orchestrate agents and tools to fulfill your requirements.</Text>
                                </Box>
                            </Box>
                            <Box p="12" display="flex" flexDirection="row" gap="12" alignItems="start" cursor="pointer" className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md" onClick={() => { setAddAgentOpen(false); setTimeout(() => setImportAgentOpen(true), 150); }}>
                                <Box mt="2" color="fg.default"><IconUpload /></Box>
                                <Box>
                                    <Text fontWeight="500" fontSize="md">Upload</Text>
                                    <Text fontSize="sm" color="fg.secondary">Upload an agent from a JSON file.</Text>
                                </Box>
                            </Box>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Box>}
                    </Box>
                )}
            </Box>

            {activeTab === "Agent Activity" ? (<>
                    <Table style={{ isolation: "isolate" }}>
                        <thead className="[&_th>div]:!shadow-none [&_th>div]:!border-b-0" style={{ position: "sticky", top: 93, zIndex: 10, background: "var(--ax-colors-bg-default)" }}>
                            <Tr className="hover:!bg-transparent cursor-default">
                                <Th style={{ width: 40, minWidth: 40, paddingLeft: 16, paddingRight: 8 }}>
                                    <Checkbox
                                        checked={allLogsSelected}
                                        indeterminate={someLogsSelected}
                                        onCheckedChange={() => toggleAllLogs()}
                                    />
                                </Th>
                                <Th style={{ minWidth: 48 }}>TYPE</Th>
                                {["EXECUTION TIME", "AGENT", "TRIGGER", "TRIGGERED BY", "STATUS", "MODEL PROVIDER", "INFERENCE LEVEL", "CREDITS", "EVALUATION SCORE", "DURATION"].map(col => (
                                    <Th key={col} style={{ whiteSpace: "nowrap" }}>{col}</Th>
                                ))}
                            </Tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => {
                                const logAgent = STATIC_AGENTS.find(a => a.id === log.agentId);
                                const isSelected = selectedLogIds.has(log.id);
                                return (
                                    <Tr
                                        key={log.id}
                                        style={isSelected ? { background: "var(--ax-colors-bg-accent-subtle)" } : undefined}
                                        onMouseEnter={() => setHoveredLogId(log.id)}
                                        onMouseLeave={() => setHoveredLogId(null)}
                                    >
                                        <Td style={{ width: 40, minWidth: 40, paddingLeft: 16 }}>
                                            <Box
                                                style={{ display: "inline-flex" }}
                                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                            >
                                                <Box style={{
                                                    opacity: selectedLogIds.size > 0 || hoveredLogId === log.id ? 1 : 0,
                                                    transition: "opacity 0.1s",
                                                }}>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleLogSelect(log.id)}
                                                    />
                                                </Box>
                                            </Box>
                                        </Td>
                                        <Td style={{ minWidth: 48 }}>
                                            <Box
                                                rounded="lg"
                                                style={{
                                                    width: 28, height: 28,
                                                    background: "radial-gradient(ellipse at 100% 50%, rgba(186,158,245,0.20) 0%, rgba(168,184,240,0.17) 55%, rgba(144,210,187,0.155) 77%, rgba(119,236,133,0.14) 100%), #fff",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                }}
                                                color="fg.secondary"
                                            >
                                                {logAgent?.icon ?? <IconAgent />}
                                            </Box>
                                        </Td>
                                        <Td style={{ whiteSpace: "nowrap" }}>
                                            <Text fontSize="sm">{log.executionTime}</Text>
                                        </Td>
                                        <Td style={{ minWidth: 180 }}>
                                            <Box>
                                                <Text fontWeight="500">{logAgent?.name ?? log.agentId}</Text>
                                                <Text fontSize="sm" color="fg.secondary">{logAgent?.handle}</Text>
                                            </Box>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm">{log.trigger}</Text>
                                        </Td>
                                        <Td style={{ minWidth: 160 }}>
                                            <Box display="flex" flexDirection="row" gap="8" alignItems="center">
                                                <Avatar name={log.triggeredBy.name} size="sm" />
                                                <Text fontSize="sm" style={{ whiteSpace: "nowrap" }}>{log.triggeredBy.name}</Text>
                                            </Box>
                                        </Td>
                                        <Td style={{ whiteSpace: "nowrap" }}>
                                            <Badge
                                                intent={
                                                    log.status === "Completed" ? "success" :
                                                    log.status === "Failed" ? "danger" :
                                                    log.status === "In Progress" ? "information" :
                                                    "warning"
                                                }
                                                variant="subtle"
                                            >
                                                {log.status}
                                            </Badge>
                                        </Td>
                                        <Td style={{ whiteSpace: "nowrap" }}>
                                            <Badge intent="neutral" variant="subtle">{log.modelProvider}</Badge>
                                        </Td>
                                        <Td style={{ whiteSpace: "nowrap" }}>
                                            <Badge intent="neutral" variant="subtle">{log.inferenceLevel}</Badge>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm">{log.credits != null ? log.credits : "—"}</Text>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm">{log.evaluationScore != null ? log.evaluationScore.toFixed(2) : "—"}</Text>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm">{log.duration}</Text>
                                        </Td>
                                    </Tr>
                                );
                            })}
                        </tbody>
                    </Table>
            </>) : (<>
            <Table style={{ isolation: "isolate" }}>
                <thead className="[&_th>div]:!shadow-none [&_th>div]:!border-b-0" style={{ position: "sticky", top: 93, zIndex: 10, background: "var(--ax-colors-bg-default)" }}>
                    <Tr className="hover:!bg-transparent cursor-default">
                        {/* Bulk select header checkbox */}
                        <th
                            className="text-left p-4 text-xs font-normal py-3 align-middle"
                            style={{ width: 40, minWidth: 40, paddingLeft: 16 }}
                        >
                            <Checkbox
                                checked={allSelected}
                                indeterminate={someSelected}
                                onCheckedChange={() => toggleAll()}
                            />
                        </th>
                        <th
                            className="text-left p-4 text-xs font-normal py-3 align-middle text-[var(--ax-colors-fg-tertiary)]"
                            style={{ width: 48, minWidth: 48 }}
                            onMouseEnter={() => setTypeHeaderHovered(true)}
                            onMouseLeave={() => setTypeHeaderHovered(false)}
                        >
                            {typeHeaderHovered ? (
                                <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                    <Tooltip content={showTypeCol ? "Hide column" : "Show Type column"}>
                                        <Button
                                            size="sm"
                                            appearance="subtle"
                                            aria-label={showTypeCol ? "Hide type column" : "Show type column"}
                                            icon={showTypeCol ? <IconEyeSlash size={14} /> : <IconEye size={14} />}
                                            onClick={() => setShowTypeCol((v) => !v)}
                                        />
                                    </Tooltip>
                                </Box>
                            ) : (
                                <span>Type</span>
                            )}
                        </th>
                        {columnOrder.map((colId) => {
                            const header = headerMap[colId];
                            if (!header) return null;
                            return (
                                <DataTableHeaderCell
                                    key={colId}
                                    header={header}
                                    draggable
                                    onDragStart={(e: React.DragEvent) => { dragColRef.current = colId; }}
                                    onDragEnd={() => { dragColRef.current = null; }}
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
                                    px={colId === "badge" || colId === "multiTurn" ? "8" : "16"}
                                    style={{
                                        width: header.getSize(),
                                        borderBottom: "none",
                                        borderLeft: dragOverCol === colId ? "2px solid var(--ax-colors-border-focus)" : undefined,
                                        cursor: "move",
                                    }}
                                >
                                    {colId === "name" ? (
                                        <Box display="inline-flex" alignItems="center" gap="8">
                                            <span>Name</span>
                                            <Box
                                                className="opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto"
                                                onClick={(event: React.MouseEvent) => event.stopPropagation()}
                                            >
                                                <Tooltip content={showEmojis ? "Hide emojis" : "Show emojis"}>
                                                    <Button
                                                        size="sm"
                                                        appearance="subtle"
                                                        aria-label={showEmojis ? "Hide emojis" : "Show emojis"}
                                                        icon={showEmojis ? <IconEyeSlash size={14} /> : <IconEye size={14} />}
                                                        onClick={() => setShowEmojis((v) => !v)}
                                                    />
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    ) : colId === "category" ? (
                                        <Box display="inline-flex" alignItems="center" gap="8">
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
                                    ) : colId === "multiTurn" ? (
                                        <Box display="inline-flex" alignItems="center" gap="4">
                                            <Box
                                                className="opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto"
                                                onClick={(event: React.MouseEvent) => event.stopPropagation()}
                                            >
                                                <Tooltip content={showMultiTurnCol ? "Hide multi-turn column" : "Show multi-turn column"}>
                                                    <Button
                                                        size="sm"
                                                        appearance="subtle"
                                                        aria-label={showMultiTurnCol ? "Hide multi-turn column" : "Show multi-turn column"}
                                                        icon={showMultiTurnCol ? <IconEyeSlash size={14} /> : <IconEye size={14} />}
                                                        onClick={() => setShowMultiTurnCol((v) => !v)}
                                                    />
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    ) : colId === "badge" ? null : (
                                        <span>{typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : ""}</span>
                                    )}
                                </DataTableHeaderCell>
                            );
                        })}
                        <th className="text-left p-4 text-xs font-normal py-3 align-middle text-[var(--ax-colors-fg-tertiary)]" style={{ position: "sticky", right: 0, zIndex: 2, background: "var(--ax-colors-bg-default)", boxShadow: "var(--ax-shadows-sm)" }}></th>
                    </Tr>
                </thead>
                <tbody>
                    {filteredAgents.map((agent, index) => (
                        <Tr
                            key={index}
                            url={agent.id === 'cmp-workflow' ? '/opal/agents/workflow?preset=cmp-workflow' : `/opal/agents/setup?id=${agent.id}&mode=edit`}
                            style={selectedIds.has(agent.id) ? { background: "var(--ax-colors-bg-accent-subtle)" } : undefined}
                            onMouseEnter={() => setHoveredRowId(agent.id)}
                            onMouseLeave={() => setHoveredRowId(null)}
                        >
                            {/* Bulk select checkbox — visible on hover or when any row is selected */}
                            <Td style={{ width: 40, minWidth: 40, paddingLeft: 16 }}>
                                <Box
                                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                    style={{
                                        opacity: selectedIds.size > 0 || hoveredRowId === agent.id ? 1 : 0,
                                        transition: "opacity 0.1s",
                                    }}
                                >
                                    <Checkbox
                                        checked={selectedIds.has(agent.id)}
                                        onCheckedChange={() => toggleSelect(agent.id)}
                                    />
                                </Box>
                            </Td>
                            {/* Fixed: Type icon */}
                            <Td style={{ width: 48, minWidth: 48 }}>
                                {showTypeCol && (
                                    <Box style={{ position: "relative", width: 28, height: 28, flexShrink: 0 }}>
                                        <Box
                                            rounded="lg"
                                            style={{
                                                width: 28,
                                                height: 28,
                                                background: "radial-gradient(ellipse at 100% 50%, rgba(186,158,245,0.20) 0%, rgba(168,184,240,0.17) 55%, rgba(144,210,187,0.155) 77%, rgba(119,236,133,0.14) 100%), #fff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                            color="fg.secondary"
                                        >
                                            {agent.emoji && showEmojis ? (
                                                <span style={{ fontSize: 15, lineHeight: 1 }}>{agent.emoji}</span>
                                            ) : (
                                                agent.icon
                                            )}
                                        </Box>
                                        {"multiTurn" in agent && agent.multiTurn && (
                                            <Tooltip content="Multi-turn conversation">
                                                <Box
                                                    rounded="full"
                                                    bg="bg.default"
                                                    color="fg.default"
                                                    style={{
                                                        position: "absolute",
                                                        bottom: -4,
                                                        right: -4,
                                                        width: 14,
                                                        height: 14,
                                                        outline: "1px solid var(--ax-colors-border-secondary)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <IconArrowRightArrowLeft size={8} />
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </Box>
                                )}
                            </Td>
                            {/* Dynamic reorderable columns */}
                            {columnOrder.map((colId) => {
                                if (colId === "name") return (
                                    <Td key="name" style={{ width: table.getColumn("name")?.getSize() }}>
                                        <Box>
                                            <Text fontWeight="500">{agent.name}</Text>
                                            <Text fontSize="sm" color="fg.secondary">{agent.handle}</Text>
                                        </Box>
                                    </Td>
                                );
                                if (colId === "badge") return (
                                    <Td key="badge" className="!px-2" style={{ width: table.getColumn("badge")?.getSize() }}>
                                        {agent.tag && agent.tag !== "Draft" && (
                                            agent.tag === "New" ? (
                                                <Badge intent="information" variant="subtle">{agent.tag}</Badge>
                                            ) : (
                                                <Badge intent="success" variant="subtle">{agent.tag}</Badge>
                                            )
                                        )}
                                    </Td>
                                );
                                if (colId === "multiTurn") return (
                                    <Td key="multiTurn" className="!px-2" style={{ width: table.getColumn("multiTurn")?.getSize() }}>
                                        {showMultiTurnCol && "multiTurn" in agent && agent.multiTurn && (
                                            <Tooltip content="Multi-turn conversation">
                                                <Box asChild display="inline-flex" color="fg.tertiary">
                                                    <span><MultiTurnIcon size={14} /></span>
                                                </Box>
                                            </Tooltip>
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
                                                    <Image src="/optimizely-favicon-new.svg" alt="Optimizely" width={20} height={20} />
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
                                                    <Badge key={tag.label} intent={tag.intent as TagIntent} variant="subtle">{tag.label}</Badge>
                                                ) : (
                                                    <Badge key={tag.label} intent="information" variant="subtle">{tag.label}</Badge>
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
                            <Td type="button" style={{ position: "sticky", right: 0, zIndex: 1, background: "var(--ax-colors-bg-default)", boxShadow: "var(--ax-shadows-sm)" }}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            appearance="subtle"
                                            size="sm"
                                            icon={<IconEllipsisSolid size={16} />}
                                            aria-label="Agent actions"
                                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                        />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={(e: React.MouseEvent) => {
                                                e.stopPropagation();
                                                router.push(agent.id === "cmp-workflow" ? "/opal/agents/workflow?preset=cmp-workflow" : `/opal/agents/setup?id=${agent.id}&mode=edit`);
                                            }}
                                        >
                                            <Box display="flex" alignItems="center" gap="8">
                                                <IconPen size={14} />
                                                Edit
                                            </Box>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e: React.MouseEvent) => {
                                                e.stopPropagation();
                                                setExportAgent(agent);
                                                setExportAgentOpen(true);
                                            }}
                                        >
                                            <Box display="flex" alignItems="center" gap="8">
                                                <IconDownload size={14} />
                                                Download
                                            </Box>
                                        </DropdownMenuItem>
                                        {!("type" in agent.creator && agent.creator.type === "system") && (
                                            <DropdownMenuItem
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    setUserAgents(prev => prev.filter(a => a.id !== agent.id));
                                                    localStorage.setItem("opal_user_agents", JSON.stringify(
                                                        userAgents.filter(a => a.id !== agent.id).map(({ icon: _icon, ...rest }) => rest)
                                                    ));
                                                }}
                                            >
                                                <Box display="flex" alignItems="center" gap="8" color="fg.error">
                                                    <IconTrashCan size={14} />
                                                    Delete
                                                </Box>
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </Td>
                        </Tr>
                    ))}
                </tbody>
            </Table>
            </>)}
        </Box>
</>
    );
}

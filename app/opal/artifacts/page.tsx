"use client";

import {
    Box,
    Text,
    Heading,
    Button,
    AngleMenuButton,
    Badge,
    Avatar,
    AvatarGroup,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    LabelMenuButton,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogBody,
    DialogFooter,
    DialogClose,
    Tooltip,
    SegmentedControl,
    SegmentedControlItem,
} from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
    IconFile,
    IconImage,
    IconCode,
    IconTrashCan,
    IconDownload,
    IconEllipsisSolid,
    IconAgent,
    IconCodeBranch,
    IconGrid,
    IconList,
    IconArrowsMaximize,
    IconPenLine,
    IconChevronUp,
    IconChevronDown,
    IconChartColumn,
    IconPresentationScreen,
    IconFileSpreadsheet,
    IconComments,
    IconInboxFull,
    IconShareNodes,
    IconUserPlus,
    IconAngleRight,
    IconXmark,
    IconSearch,
    IconLock,
    IconSlidersSimple,
    IconGear,
    IconThumbtack,
    IconThumbtackSolid,
} from "@optiaxiom/icons";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArtifactViewer, type ArtifactViewerArtifact } from "./components/ArtifactViewer";
import { useLayout } from "@/app/context/LayoutContext";
import { OpalShareDialog } from "@/app/components/Opal/CodeCanvasPanel";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(timestampSeconds: number): string {
    const now = Date.now() / 1000;
    const diff = now - timestampSeconds;
    if (diff < 60) return "just now";
    if (diff < 3600) { const m = Math.floor(diff / 60); return `${m}m ago`; }
    if (diff < 86400) { const h = Math.floor(diff / 3600); return `${h}h ago`; }
    if (diff < 7 * 86400) { const d = Math.floor(diff / 86400); return `${d}d ago`; }
    if (diff < 30 * 86400) { const w = Math.floor(diff / (7 * 86400)); return `${w}w ago`; }
    if (diff < 365 * 86400) { const mo = Math.floor(diff / (30 * 86400)); return `${mo}mo ago`; }
    const yr = Math.floor(diff / (365 * 86400)); return `${yr}y ago`;
}

function truncateMiddle(str: string, maxLength = 20): string {
    if (str.length <= maxLength) return str;
    const half = Math.floor((maxLength - 1) / 2);
    return str.slice(0, half) + "…" + str.slice(str.length - half);
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ArtifactType = "Document" | "Image" | "Code" | "Presentation" | "Spreadsheet" | "Report";
type ArtifactSourceType = "chat" | "agent" | "workflow";
type AgentBadgeIntent = "warning" | "danger" | "information" | "success" | "neutral";
type SortKey = "name" | "created" | "size" | "version" | "status";
type SortDir = "asc" | "desc";

type Artifact = {
    id: string;
    name: string;
    type: ArtifactType;
    source: { name: string; type: ArtifactSourceType; link?: string };
    agentBadgeIntent: AgentBadgeIntent;
    createdBy: { name: string; avatar: string };
    owner: { name: string; avatar: string };
    sharedWithTeam?: boolean;
    sharedWith?: Array<{ name: string; avatar: string }>;
    tags?: string[];
    created: string;
    createdRaw: number;
    size: string;
    sizeRaw: number;
    status: "Ready" | "Generating" | "Failed";
    version: string;
    description: string;
    imageUrl?: string;
    isPrivate?: boolean;
    lastViewedRaw?: number;
    isInProgress?: boolean;
    previewText?: string;
    activityText: string;
    directLink?: string;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const NOW = Math.floor(Date.now() / 1000);

const artifacts: Artifact[] = [
    {
        id: "geo-qa",
        name: "Q and A: Discover the unknown",
        type: "Document",
        source: { name: "Frank", type: "chat", link: "/opal?artifacts=1" },
        agentBadgeIntent: "success",
        createdBy: { name: "Frank", avatar: "" },
        owner: { name: "Jamie Chen", avatar: "" },
        sharedWithTeam: true,
        tags: ["GEO", "Q&A", "Stride"],
        created: "May 15, 2026",
        createdRaw: NOW - 600,
        lastViewedRaw: NOW - 60,
        isInProgress: true,
        size: "8 KB",
        sizeRaw: 8192,
        status: "Ready",
        version: "2.0",
        description: "GEO-optimised Q&A article covering Stride Discover the Unknown — 7 core Q&A pairs targeting AI search citations.",
        previewText: "What is Discover the Unknown by Stride?\nDiscover the Unknown is a Stride product line for tracking outdoor adventure and performance activity across land, sea, and air.\nWhat activities does it support?\nTrail running, climbing, diving, skydiving, and multi-terrain endurance challenges.\nWho is it designed for?\nRunners, climbers, divers, sky athletes, expedition teams, and active groups who want one place to record training and share adventure progress.\nWhat metrics can it track?\nRoute, elevation, ascent, depth, duration, altitude, heart rate, weather, pace, and activity history.",
        activityText: "Edited just now",
        directLink: "/opal?artifacts=1",
    },
    {
        id: "1",
        name: "Q2 Email Nurture Draft",
        type: "Document",
        source: { name: "Copywriter", type: "chat", link: "/opal/chat/1" },
        agentBadgeIntent: "warning",
        createdBy: { name: "Jamie Chen", avatar: "" },
        owner: { name: "Jamie Chen", avatar: "" },
        isPrivate: true,
        tags: ["Email", "Q2", "Nurture"],
        created: "May 13, 2026",
        createdRaw: NOW - 7200,
        size: "12 KB",
        sizeRaw: 12288,
        status: "Ready",
        version: "1.2",
        description: "Enterprise renewal email with ROI focus and 15% discount offer.",
        imageUrl: "/cmp/assets/recommendation/search-01-image.jpg",
        previewText: "Subject: Unlocking your team's potential\nHi {{first_name}},\n\nWe noticed you've been exploring ways to scale your marketing output.",
        activityText: "Edited 2 hours ago",
    },
    {
        id: "2",
        name: "Competitor Analysis Report",
        type: "Report",
        source: { name: "Scout", type: "agent", link: "/opal/agents/setup?id=2" },
        agentBadgeIntent: "danger",
        createdBy: { name: "Poppy", avatar: "" },
        owner: { name: "William Mo.", avatar: "/avatars/user2.png" },
        isPrivate: true,
        created: "May 13, 2026",
        createdRaw: NOW - 21600,
        lastViewedRaw: NOW - 3600,
        size: "48 KB",
        sizeRaw: 49152,
        status: "Ready",
        version: "1.0",
        tags: ["Research", "Strategy"],
        description: "Deep-dive on 5 key competitors with positioning matrix.",
        imageUrl: "/cmp/assets/recommendation/panel-05-image.jpg",
        activityText: "Viewed 1 hour ago",
    },
    {
        id: "3",
        name: "Hero Banner Variation 2025",
        type: "Image",
        source: { name: "Brand", type: "agent", link: "/opal/agents/setup?id=3" },
        agentBadgeIntent: "information",
        createdBy: { name: "Henry", avatar: "" },
        owner: { name: "William Mo.", avatar: "/avatars/user2.png" },
        sharedWithTeam: true,
        created: "May 12, 2026",
        createdRaw: NOW - 86400,
        lastViewedRaw: NOW - 10800,
        size: "1.2 MB",
        sizeRaw: 1258291,
        status: "Ready",
        version: "2.1",
        tags: ["Brand", "A/B", "Spring"],
        description: "Spring sale hero with 4 A/B variants.",
        imageUrl: "/cmp/assets/recommendation/search-04-image.jpg",
        activityText: "Viewed 3 hours ago",
    },
    {
        id: "4",
        name: "SEO Audit Summary",
        type: "Report",
        source: { name: "Insights", type: "agent", link: "/opal/agents/setup?id=4" },
        agentBadgeIntent: "success",
        createdBy: { name: "Tony", avatar: "" },
        owner: { name: "William Mo.", avatar: "/avatars/user2.png" },
        isPrivate: true,
        created: "May 13, 2026",
        createdRaw: NOW - 10800,
        size: "24 KB",
        sizeRaw: 24576,
        status: "Ready",
        version: "1.0",
        tags: ["SEO", "Q2"],
        description: "Site-wide SEO health report with recommendations.",
        imageUrl: "/cmp/assets/recommendation/panel-02-image.jpg",
        activityText: "Generated 3 hours ago",
    },
    {
        id: "5",
        name: "A/B Test Checkout CTA",
        type: "Code",
        source: { name: "Compass", type: "chat", link: "/opal/chat/5" },
        agentBadgeIntent: "neutral",
        createdBy: { name: "Jamie Chen", avatar: "" },
        owner: { name: "Jamie Chen", avatar: "" },
        isPrivate: true,
        created: "May 12, 2026",
        createdRaw: NOW - 86400,
        size: "3 KB",
        sizeRaw: 3072,
        status: "Ready",
        version: "1.3",
        description: "Three CTA copy variants with tracking snippets.",
        isInProgress: true,
        previewText: '<button\n  className="bg-emerald-500 hover:bg-emerald-600 t\n  onClick={handleCheckout}\n>\n  Complete Purchase\n</button>',
        activityText: "Created yesterday",
    },
    {
        id: "6",
        name: "Campaign Asset Bundle",
        type: "Image",
        source: { name: "Brand", type: "workflow", link: "/opal/workflows/6" },
        agentBadgeIntent: "information",
        createdBy: { name: "Kerby", avatar: "" },
        owner: { name: "Jamie Chen", avatar: "" },
        sharedWith: [{ name: "William Mo.", avatar: "" }],
        created: "May 11, 2026",
        createdRaw: NOW - 172800,
        size: "5.8 MB",
        sizeRaw: 6082150,
        status: "Ready",
        version: "3.0",
        tags: ["ABM", "Campaign"],
        description: "Full ABM campaign pack: banners, email headers, social.",
        imageUrl: "/cmp/assets/recommendation/search-07-image.jpg",
        activityText: "Shared 2 days ago",
    },
    {
        id: "7",
        name: "Localized Copy — FR",
        type: "Document",
        source: { name: "Copywriter", type: "agent", link: "/opal/agents/setup?id=7" },
        agentBadgeIntent: "warning",
        createdBy: { name: "Mayling", avatar: "" },
        owner: { name: "Jamie Chen", avatar: "" },
        isPrivate: true,
        created: "May 6, 2026",
        createdRaw: NOW - 604800,
        size: "10 KB",
        sizeRaw: 10240,
        status: "Failed",
        version: "1.0",
        description: "French localization of Q2 campaign copy.",
        imageUrl: "/cmp/assets/recommendation/search-05-image.jpg",
        activityText: "Edited 1 week ago",
    },
    {
        id: "8",
        name: "Q1 Sales Deck",
        type: "Presentation",
        source: { name: "Compass", type: "agent", link: "/opal/agents/setup?id=8" },
        agentBadgeIntent: "neutral",
        createdBy: { name: "Henry", avatar: "" },
        owner: { name: "Jamie Chen", avatar: "" },
        isPrivate: true,
        created: "May 12, 2026",
        createdRaw: NOW - 86400,
        lastViewedRaw: NOW - 86400,
        size: "2.4 MB",
        sizeRaw: 2516582,
        status: "Ready",
        version: "2.0",
        tags: ["Sales", "Q1"],
        description: "Exec-level Q1 readout with pipeline and ARR highlights.",
        imageUrl: "/cmp/assets/recommendation/panel-01-image.jpg",
        activityText: "Viewed 1 day ago",
    },
    {
        id: "9",
        name: "Instagram Carousel — Spring",
        type: "Image",
        source: { name: "Brand", type: "agent", link: "/opal/agents/setup?id=9" },
        agentBadgeIntent: "information",
        createdBy: { name: "Poppy", avatar: "" },
        owner: { name: "William Mo.", avatar: "/avatars/user2.png" },
        isPrivate: true,
        created: "May 12, 2026",
        createdRaw: NOW - 86400,
        lastViewedRaw: NOW - 86400,
        size: "3.1 MB",
        sizeRaw: 3250000,
        status: "Ready",
        version: "1.0",
        description: "Spring campaign carousel with 5 slides for Instagram.",
        imageUrl: "/cmp/assets/recommendation/search-02-image.jpg",
        activityText: "Viewed 1 day ago",
    },
    {
        id: "10",
        name: "Content Calendar — April",
        type: "Spreadsheet",
        source: { name: "Compass", type: "chat", link: "/opal/chat/10" },
        agentBadgeIntent: "neutral",
        createdBy: { name: "Jamie Chen", avatar: "" },
        owner: { name: "Jamie Chen", avatar: "" },
        isPrivate: true,
        created: "Apr 28, 2026",
        createdRaw: NOW - 1296000,
        size: "8 KB",
        sizeRaw: 8192,
        status: "Ready",
        version: "1.1",
        description: "April editorial schedule across all channels.",
        imageUrl: "/cmp/assets/recommendation/panel-03-image.jpg",
        activityText: "Viewed 2 weeks ago",
    },
    {
        id: "11",
        name: "GEO Keyword Recommendations",
        type: "Document",
        source: { name: "Insights", type: "workflow", link: "/opal/workflows/11" },
        agentBadgeIntent: "success",
        createdBy: { name: "Tony", avatar: "" },
        owner: { name: "William Mo.", avatar: "/avatars/user2.png" },
        sharedWithTeam: true,
        created: "Apr 21, 2026",
        createdRaw: NOW - 1900800,
        size: "16 KB",
        sizeRaw: 16384,
        status: "Ready",
        version: "1.0",
        tags: ["SEO", "GEO", "Keywords"],
        description: "Top 40 GEO keywords ranked by opportunity score.",
        imageUrl: "/cmp/assets/recommendation/search-03-image.jpg",
        activityText: "Viewed 3 weeks ago",
    },
    {
        id: "12",
        name: "Meeting Notes — Weekly Product Sync",
        type: "Document",
        source: { name: "Copywriter", type: "chat", link: "/opal/chat/12" },
        agentBadgeIntent: "warning",
        createdBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
        owner: { name: "Mary Anne", avatar: "/avatars/user.png" },
        sharedWithTeam: true,
        created: "Apr 5, 2026",
        createdRaw: NOW - 3456000,
        size: "6 KB",
        sizeRaw: 6144,
        status: "Generating",
        version: "1.0",
        description: "Structured action items and decisions from product sync.",
        imageUrl: "/cmp/assets/recommendation/panel-04-image.jpg",
        activityText: "Generated 1 month ago",
    },
];

// ─── Static lookups ──────────────────────────────────────────────────────────

const typeIcon: Record<ArtifactType, React.ReactNode> = {
    Document: <IconFile size={16} />,
    Image: <IconImage size={16} />,
    Code: <IconCode size={16} />,
    Presentation: <IconPresentationScreen size={16} />,
    Spreadsheet: <IconFileSpreadsheet size={16} />,
    Report: <IconChartColumn size={16} />,
};

const typeIconSm: Record<ArtifactType, React.ReactNode> = {
    Document: <IconFile size={16} />,
    Image: <IconImage size={16} />,
    Code: <IconCode size={16} />,
    Presentation: <IconPresentationScreen size={16} />,
    Spreadsheet: <IconFileSpreadsheet size={16} />,
    Report: <IconChartColumn size={16} />,
};

const typeIconMd: Record<ArtifactType, React.ReactNode> = {
    Document: <IconFile size={20} />,
    Image: <IconImage size={20} />,
    Code: <IconCode size={20} />,
    Presentation: <IconPresentationScreen size={20} />,
    Spreadsheet: <IconFileSpreadsheet size={20} />,
    Report: <IconChartColumn size={20} />,
};

const typeLabel: Record<ArtifactType, string> = {
    Document: "Document",
    Code: "Code",
    Image: "Media",
    Presentation: "Slide",
    Spreadsheet: "Spreadsheet",
    Report: "Report",
};

const sourceEmoji: Record<string, string> = {
    Copywriter: "✏️",
    Scout: "🔎",
    Brand: "🎨",
    Compass: "🧭",
    Insights: "📊",
    GEO: "🌐",
};

const sourceAvatar: Record<string, string> = {
    "GEO Q&A Generator": "/avatars/mock-avatar-geo.svg",
    "Frank": "/avatars/mock-avatar-geo.svg",
    "Mayling": "/avatars/mock-avatar-geo.svg",
    "Tony": "/avatars/mock-avatar-traffic.svg",
    "Poppy": "/avatars/mock-avatar-seo.svg",
    "Henry": "/avatars/mock-avatar-abu.svg",
    "Kerby": "/avatars/mock-avatar-geo.svg",
};

function AgentCell({ name }: { name: string }) {
    const avatar = sourceAvatar[name];
    return (
        <Box display="flex" alignItems="center" gap="8">
            {avatar ? (
                <span style={{ width: 18, height: 18, borderRadius: 4, background: "var(--ax-colors-bg-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                    <img src={avatar} alt={name} style={{ width: 13, height: 13, display: "block" }} />
                </span>
            ) : (
                <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>{sourceEmoji[name] ?? "🤖"}</span>
            )}
            <Text fontSize="sm" color="fg.secondary">{name}</Text>
        </Box>
    );
}

function PersonCell({ person }: { person: { name: string; avatar: string } }) {
    const isKnownAgent = sourceEmoji[person.name] !== undefined || sourceAvatar[person.name] !== undefined;
    if (!person.avatar && isKnownAgent) {
        return <AgentCell name={person.name} />;
    }
    return (
        <Box display="flex" alignItems="center" gap="8">
            <Avatar size="xs" name={person.name} {...(person.avatar ? { src: person.avatar } : {})} />
            <Text fontSize="sm" color="fg.secondary">{person.name}</Text>
        </Box>
    );
}

const DEFAULT_PINNED_IDS = new Set(["2", "3", "6", "8", "9"]);

const statusIntent = {
    Ready: "success",
    Generating: "information",
    Failed: "danger",
} as const;

const allTypes: Array<"All" | ArtifactType> = ["All", "Document", "Image", "Code", "Presentation", "Spreadsheet", "Report"];
const allCreators = [...new Set(artifacts.map((a) => a.createdBy.name))];
const allAgents = [...new Set(artifacts.map((a) => a.source.name))];

// ─── Sort header ─────────────────────────────────────────────────────────────

function SortHeader({
    label,
    sortKey,
    current,
    dir,
    onSort,
}: {
    label: string;
    sortKey: SortKey;
    current: SortKey;
    dir: SortDir;
    onSort: (k: SortKey) => void;
}) {
    const active = current === sortKey;
    return (
        <Th>
            <Box
                display="inline-flex"
                alignItems="center"
                gap="4"
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => onSort(sortKey)}
            >
                {label}
                {active ? (
                    dir === "asc" ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />
                ) : (
                    <IconChevronDown size={12} color="var(--ax-colors-fg-tertiary)" />
                )}
            </Box>
        </Th>
    );
}

// ─── Content thumbnails ──────────────────────────────────────────────────────

function DocThumbnail() {
    const line = (w: string, h = 6, mt = 0) => (
        <Box bg="bg.tertiary" rounded="sm" style={{ height: h, width: w, marginTop: mt }} />
    );
    return (
        <Box bg="bg.default" style={{ padding: "14px 16px", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", gap: 5 }}>
            {line("60%", 9)}
            <Box style={{ marginTop: 4 }} />
            {line("100%")}
            {line("95%")}
            {line("88%")}
            {line("72%")}
            <Box style={{ marginTop: 6 }} />
            {line("100%")}
            {line("90%")}
            {line("82%")}
            {line("40%")}
        </Box>
    );
}

function CodeThumbnail({ previewText }: { previewText?: string }) {
    const text = previewText ?? '<button\n  className="bg-emerald-500"\n>\n  Complete Purchase\n</button>';
    return (
        <Box style={{ padding: "12px 14px", height: "100%", background: "#1e1e1e", overflow: "hidden", display: "flex", flexDirection: "column", gap: 4 }}>
            {text.split("\n").slice(0, 6).map((line, i) => (
                <Text key={i} fontSize="sm" style={{ fontFamily: "monospace", color: i === 0 ? "#569cd6" : i === 1 ? "#9cdcfe" : "#4ec9b0", opacity: i > 3 ? 0.5 : 1, whiteSpace: "nowrap", overflow: "hidden" }}>
                    {line}
                </Text>
            ))}
        </Box>
    );
}

function ReportThumbnail() {
    const kpis = [{ v: "5", l: "Competitors" }, { v: "−12%", l: "Gap" }, { v: "3.2×", l: "Velocity" }];
    const rows = [
        { name: "AlphaCloud",  share: "34%", seo: 82, intent: "danger"  as const },
        { name: "CoreMetrics", share: "21%", seo: 71, intent: "warning" as const },
        { name: "FlowStack",   share: "18%", seo: 65, intent: "neutral" as const },
    ];
    return (
        <Box bg="bg.secondary" style={{ padding: "10px 12px", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", gap: 8 }}>
            <Box style={{ display: "flex", gap: 6 }}>
                {kpis.map((k) => (
                    <Box key={k.l} bg="bg.default" border="1" borderColor="border.tertiary" rounded="md" style={{ flex: 1, padding: "5px 7px" }}>
                        <Text fontSize="sm" fontWeight="700">{k.v}</Text>
                        <Text fontSize="sm" color="fg.tertiary">{k.l}</Text>
                    </Box>
                ))}
            </Box>
            <Box bg="bg.default" border="1" borderColor="border.tertiary" rounded="md" overflow="hidden">
                <Box bg="bg.secondary" style={{ display: "flex", padding: "3px 7px", borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}>
                    {["Company", "Share", "SEO"].map((h) => (
                        <Box key={h} style={{ flex: h === "Company" ? 2 : 1 }}>
                            <Text fontSize="sm" color="fg.tertiary" fontWeight="600">{h}</Text>
                        </Box>
                    ))}
                </Box>
                {rows.map((r, i) => (
                    <Box key={r.name} style={{ display: "flex", alignItems: "center", padding: "3px 7px", borderTop: i > 0 ? "1px solid var(--ax-colors-border-tertiary)" : undefined }}>
                        <Box style={{ flex: 2 }}><Text fontSize="sm">{r.name}</Text></Box>
                        <Box style={{ flex: 1 }}><Text fontSize="sm">{r.share}</Text></Box>
                        <Box style={{ flex: 1 }}><Badge intent={r.intent}>{r.seo}</Badge></Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

function SpreadsheetThumbnail() {
    const headers = ["Date", "Title", "Type", "Status", "Owner"];
    const rows = [
        ["Apr 1",  "Spring Campaign Launch", "Blog",   "Draft",     "Mary A."],
        ["Apr 3",  "Product Update Post",    "Social", "Scheduled", "Will M."],
        ["Apr 7",  "Q2 Newsletter",          "Email",  "Draft",     "Mary A."],
        ["Apr 10", "SEO Deep Dive",          "Blog",   "Review",    "Will M."],
    ];
    const statusColor: Record<string, string> = {
        Draft: "var(--ax-colors-fg-tertiary)",
        Scheduled: "var(--ax-colors-fg-success)",
        Review: "var(--ax-colors-fg-warning)",
    };
    return (
        <Box bg="bg.default" style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Box bg="bg.secondary" style={{ display: "flex", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
                {headers.map((h) => (
                    <Box key={h} style={{ flex: h === "Title" ? 2 : 1, padding: "4px 6px", borderRight: "1px solid var(--ax-colors-border-tertiary)" }}>
                        <Text fontSize="sm" fontWeight="600" color="fg.secondary">{h}</Text>
                    </Box>
                ))}
            </Box>
            {rows.map((row, i) => (
                <Box key={i} style={{ display: "flex", borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}>
                    {row.map((cell, j) => (
                        <Box key={j} style={{ flex: j === 1 ? 2 : 1, padding: "4px 6px", borderRight: "1px solid var(--ax-colors-border-tertiary)" }}>
                            <Text fontSize="sm" style={{ color: j === 3 ? statusColor[cell] ?? "inherit" : undefined, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", display: "block" }}>
                                {cell}
                            </Text>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
}

function ArtifactThumbnail({ artifact, height = 120 }: { artifact: Artifact; height?: number }) {
    if (artifact.type === "Image" || artifact.type === "Presentation") {
        return (
            <img
                alt={artifact.name}
                src={artifact.imageUrl ?? "/cmp/assets/recommendation/panel-01-image.jpg"}
                style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
            />
        );
    }
    if (artifact.type === "Report") return <ReportThumbnail />;
    if (artifact.type === "Spreadsheet") return <SpreadsheetThumbnail />;
    if (artifact.type === "Code") return <CodeThumbnail previewText={artifact.previewText} />;
    return <DocThumbnail />;
}

// ─── Avatar stack + privacy ───────────────────────────────────────────────────

function ArtifactAvatarStack({ artifact, size }: { artifact: Artifact; size: "2xs" | "xs" | "sm" }) {
    if (artifact.sharedWithTeam) {
        return (
            <AvatarGroup style={{ flexShrink: 0 }}>
                <Avatar name={artifact.createdBy.name} src={artifact.createdBy.avatar} size={size} colorScheme="purple" />
                <Avatar fallback="team" size={size} colorScheme="neutral" />
            </AvatarGroup>
        );
    }
    if (artifact.sharedWith && artifact.sharedWith.length > 0) {
        const overflow = artifact.sharedWith.length - 1;
        return (
            <AvatarGroup style={{ flexShrink: 0 }}>
                <Avatar name={artifact.createdBy.name} src={artifact.createdBy.avatar} size={size} colorScheme="purple" />
                <Avatar name={artifact.sharedWith[0].name} src={artifact.sharedWith[0].avatar} size={size} colorScheme="neutral" />
                {overflow > 0 && <Avatar size={size} colorScheme="neutral">+{overflow}</Avatar>}
            </AvatarGroup>
        );
    }
    return <Avatar name={artifact.createdBy.name} src={artifact.createdBy.avatar} size={size} colorScheme="purple" style={{ flexShrink: 0 }} />;
}

function PrivateBadge() {
    return (
        <Box display="inline-flex" alignItems="center" gap="4" color="fg.tertiary">
            <IconLock style={{ width: 12, height: 12, flexShrink: 0 }} />
            <Text fontSize="sm" color="fg.tertiary">Private</Text>
        </Box>
    );
}

// ─── Agent badge pill ─────────────────────────────────────────────────────────

function AgentBadgePill({ name, intent }: { name: string; intent: AgentBadgeIntent }) {
    return <Badge intent={intent}>{name}</Badge>;
}

// ─── Shared ellipsis menu ─────────────────────────────────────────────────────

function ArtifactEllipsisMenu({ artifact, onOpen, onShare, size = "sm" }: { artifact: Artifact; onOpen: (a: Artifact) => void; onShare: (a: Artifact) => void; size?: "sm" | "md" | "lg" }) {
    const btnStyle = { opacity: 1, padding: "0 6px", minWidth: 28, height: 28 } as const;
    return (
        <Box onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button appearance="subtle" size={size} aria-label="Options" style={btnStyle} icon={<IconEllipsisSolid size={13} />} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onOpen(artifact)}>
                        <Box display="flex" alignItems="center" gap="8"><IconArrowsMaximize size={14} />Open</Box>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onShare(artifact)}>
                        <Box display="flex" alignItems="center" gap="8"><IconUserPlus size={14} />Share</Box>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Box display="flex" alignItems="center" gap="8"><IconDownload size={14} />Download as</Box>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            {["Markdown (.md)", "PDF (.pdf)", "Word (.docx)", "Plain text (.txt)"].map((fmt) => (
                                <DropdownMenuItem key={fmt}>{fmt}</DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem><Box display="flex" alignItems="center" gap="8"><IconPenLine size={14} />Rename</Box></DropdownMenuItem>
                    <Box style={{ height: 1, background: "var(--ax-colors-border-default)", margin: "4px 12px" }} />
                    <DropdownMenuItem style={{ color: "var(--ax-colors-fg-error)" }}>
                        <Box display="flex" alignItems="center" gap="8"><IconTrashCan size={14} />Delete</Box>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </Box>
    );
}

// ─── Workspace artifact card (used in horizontal sections) ───────────────────

function WorkspaceArtifactCard({
    artifact,
    onOpen,
    onShare,
    pinned,
    onTogglePin,
    width,
}: {
    artifact: Artifact;
    onOpen: (a: Artifact) => void;
    onShare: (a: Artifact) => void;
    pinned: boolean;
    onTogglePin: (id: string) => void;
    width?: number;
}) {
    const [hovered, setHovered] = useState(false);
    const btnStyle: React.CSSProperties = {
        background: "var(--ax-colors-bg-default)",
        borderColor: "var(--ax-colors-border-secondary)",
        height: 28, width: 28, padding: 0,
    };
    return (
        <Box
            bg="bg.default"
            border="1"
            borderColor={hovered ? "border.secondary" : "border.tertiary"}
            rounded="xl"
            overflow="hidden"
            style={{ cursor: "pointer", ...(width ? { minWidth: width, maxWidth: width, flexShrink: 0 } : { width: "100%" }), transition: "border-color 0.15s", display: "flex", flexDirection: "column", height: 240 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onOpen(artifact)}
        >
            {/* Thumbnail */}
            <Box style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                <ArtifactThumbnail artifact={artifact} height={120} />
                {/* Persistent pin indicator — always visible for pinned cards */}
                {pinned && !hovered && (
                    <Box style={{ position: "absolute", top: 8, left: 8, pointerEvents: "auto" }} onClick={(e) => e.stopPropagation()}>
                        <Tooltip content="Unpin" delayDuration={300}>
                            <span style={{ display: "inline-flex" }}>
                                <Button
                                    appearance="default"
                                    size="sm"
                                    aria-label="Unpin"
                                    icon={<IconThumbtackSolid size={10} />}
                                    style={btnStyle}
                                    onClick={() => onTogglePin(artifact.id)}
                                />
                            </span>
                        </Tooltip>
                    </Box>
                )}
                {/* Hover overlay */}
                <Box style={{
                    position: "absolute", inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    opacity: hovered ? 1 : 0,
                    transition: "opacity 0.25s",
                    pointerEvents: hovered ? "auto" : "none",
                    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                    padding: "8px",
                }}>
                    {/* Top-left: pin / unpin button */}
                    <Box display="flex" gap="4" onClick={(e) => e.stopPropagation()}>
                        <Tooltip content={pinned ? "Unpin" : "Pin to workspace"} delayDuration={300}>
                            <span style={{ display: "inline-flex" }}>
                                <Button
                                    appearance="default"
                                    size="sm"
                                    aria-label={pinned ? "Unpin" : "Pin"}
                                    icon={pinned ? <IconThumbtackSolid size={10} /> : <IconThumbtack size={10} />}
                                    style={btnStyle}
                                    onClick={() => onTogglePin(artifact.id)}
                                />
                            </span>
                        </Tooltip>
                    </Box>
                    {/* Top-right: ellipsis */}
                    <Box onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button appearance="default" size="sm" aria-label="Options" style={btnStyle} icon={<IconEllipsisSolid size={13} />} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onOpen(artifact)}>
                                    <Box display="flex" alignItems="center" gap="8"><IconArrowsMaximize size={14} />Open</Box>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onShare(artifact)}>
                                    <Box display="flex" alignItems="center" gap="8"><IconUserPlus size={14} />Share</Box>
                                </DropdownMenuItem>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <Box display="flex" alignItems="center" gap="8"><IconDownload size={14} />Download as</Box>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        {["Markdown (.md)", "PDF (.pdf)", "Word (.docx)", "Plain text (.txt)"].map((fmt) => (
                                            <DropdownMenuItem key={fmt}>{fmt}</DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuItem><Box display="flex" alignItems="center" gap="8"><IconPenLine size={14} />Rename</Box></DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onTogglePin(artifact.id)}>
                                    <Box display="flex" alignItems="center" gap="8">{pinned ? <IconThumbtackSolid size={14} /> : <IconThumbtack size={14} />}{pinned ? "Unpin" : "Pin"}</Box>
                                </DropdownMenuItem>
                                <Box style={{ height: 1, background: "var(--ax-colors-border-default)", margin: "4px 12px" }} />
                                <DropdownMenuItem style={{ color: "var(--ax-colors-fg-error)" }}>
                                    <Box display="flex" alignItems="center" gap="8"><IconTrashCan size={14} />Delete</Box>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Box>
                </Box>
            </Box>

            {/* Card footer — expands upward on hover */}
            <Box
                display="flex"
                flexDirection="column"
                gap="8"
                style={{
                    flexShrink: 0,
                    borderTop: "1px solid var(--ax-colors-border-tertiary)",
                    padding: `10px 12px ${hovered ? 10 : 0}px`,
                    transition: "padding 0.25s ease",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Row 1: name + type icon */}
                <Box display="flex" justifyContent="space-between" alignItems="start" gap="8">
                    <Text
                        fontSize={hovered ? "lg" : "md"}
                        fontWeight="500"
                        style={{
                            overflow: "hidden",
                            textOverflow: hovered ? "clip" : "ellipsis",
                            whiteSpace: hovered ? "normal" : "nowrap",
                            transition: "font-size 0.2s ease",
                            lineHeight: 1.3,
                        }}
                    >
                        {artifact.name}
                    </Text>
                    <Box color="fg.tertiary" style={{ lineHeight: 0, flexShrink: 0 }}>
                        {typeIconSm[artifact.type]}
                    </Box>
                </Box>
                {/* Row 2: visibility (private badge or avatars) + activity text */}
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    {artifact.isPrivate && !artifact.sharedWith && !artifact.sharedWithTeam
                        ? <PrivateBadge />
                        : <ArtifactAvatarStack artifact={artifact} size="xs" />
                    }
                    <Text fontSize="sm" color="fg.tertiary" style={{ whiteSpace: "nowrap" }}>
                        {artifact.activityText}
                    </Text>
                </Box>
                {/* Row 3: tags (left) + source icon + View → (right) — slides in on hover */}
                <Box style={{
                    maxHeight: hovered ? 24 : 0,
                    opacity: hovered ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.25s ease, opacity 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                }}>
                    <Box display="flex" alignItems="center" gap="4" style={{ overflow: "hidden" }}>
                        {(artifact.tags ?? []).slice(0, 2).map((tag) => (
                            <Badge key={tag} intent="neutral">{tag}</Badge>
                        ))}
                    </Box>
                    <Box display="flex" alignItems="center" gap="6" style={{ flexShrink: 0 }}>
                        <Box color="fg.tertiary" style={{ lineHeight: 0 }}>
                            {artifact.source.type === "agent" ? <IconAgent size={16} /> :
                             artifact.source.type === "workflow" ? <IconCodeBranch size={16} /> :
                             <IconComments size={16} />}
                        </Box>
                        <Text fontSize="sm" color="fg.secondary" fontWeight="500">View →</Text>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

// ─── Resume card (Continue working) ──────────────────────────────────────────

function ResumeCard({ artifact, onOpen, onShare }: { artifact: Artifact; onOpen: (a: Artifact) => void; onShare: (a: Artifact) => void }) {
    const [hovered, setHovered] = useState(false);
    return (
        <Box
            bg="bg.default"
            border="1"
            borderColor={hovered ? "border.secondary" : "border.secondary"}
            rounded="xl"
            p="24"
            display="flex"
            flexDirection="column"
            gap="16"
            style={{ flex: 1, cursor: "pointer", position: "relative" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onOpen(artifact)}
        >
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" gap="10">
                <Box display="flex" alignItems="center" gap="8">
                    <Badge intent="success" style={{ textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11 }}>
                        Continue working
                    </Badge>
                    <Text fontSize="sm" color="fg.tertiary">{artifact.activityText}</Text>
                </Box>
                {/* Agent + visibility + ellipsis — fade in on hover */}
                <Box display="flex" alignItems="center" gap="10" style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.2s ease" }}>
                    <AgentCell name={artifact.source.name} />
                    <Box style={{ width: 1, height: 14, background: "var(--ax-colors-border-secondary)", flexShrink: 0 }} />
                    {artifact.isPrivate && !artifact.sharedWith && !artifact.sharedWithTeam
                        ? <PrivateBadge />
                        : <ArtifactAvatarStack artifact={artifact} size="xs" />
                    }
                    <Box style={{ width: 1, height: 14, background: "var(--ax-colors-border-secondary)", flexShrink: 0 }} />
                    <ArtifactEllipsisMenu artifact={artifact} onOpen={onOpen} onShare={onShare} />
                </Box>
            </Box>
            {/* Title + description */}
            <Box display="flex" flexDirection="column" gap="8">
                <Text fontSize="2xl" fontWeight="600">{artifact.name}</Text>
                <Text fontSize="sm" color="fg.secondary">{artifact.description}</Text>
            </Box>
            {/* Content preview — button floats over it */}
            {artifact.previewText && (
                <Box style={{ position: "relative", flex: 1 }}>
                    <Box
                        bg="bg.secondary"
                        border="1"
                        borderColor="border.tertiary"
                        rounded="lg"
                        px="16"
                        py="12"
                        style={{ overflow: "hidden", height: "100%" }}
                    >
                        {artifact.previewText.split("\n").slice(0, 8).map((line, i) => (
                            <Text key={i} fontSize="sm" color={i === 0 ? "fg.default" : "fg.secondary"} style={{ fontFamily: artifact.type === "Code" ? "monospace" : undefined, display: "block" }}>
                                {line}
                            </Text>
                        ))}
                    </Box>
                    <Button
                        appearance="inverse"
                        size="md"
                        aria-label="Edit"
                        style={{
                            position: "absolute",
                            bottom: 12,
                            right: 12,
                            borderRadius: "50%",
                            width: 40,
                            height: 40,
                            padding: 0,
                        }}
                        icon={<IconPenLine size={16} />}
                        onClick={(e) => { e.stopPropagation(); onOpen(artifact); }}
                    />
                </Box>
            )}
        </Box>
    );
}

// ─── Jump back in ─────────────────────────────────────────────────────────────

function JumpBackInCard({ artifact, onOpen, onShare }: { artifact: Artifact; onOpen: (a: Artifact) => void; onShare: (a: Artifact) => void }) {
    const [hovered, setHovered] = useState(false);
    return (
        <Box
            bg="bg.default"
            border="1"
            borderColor={hovered ? "border.secondary" : "border.tertiary"}
            rounded="xl"
            px="16"
            py="16"
            display="flex"
            alignItems="start"
            gap="12"
            style={{ cursor: "pointer", transition: "border-color 0.15s", position: "relative" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onOpen(artifact)}
        >
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                rounded="lg"
                bg="bg.secondary"
                color="fg.secondary"
                style={{ width: 36, height: 36, flexShrink: 0, marginTop: 2 }}
            >
                {typeIcon[artifact.type]}
            </Box>
            <Box display="flex" flexDirection="column" gap="6" style={{ flex: 1, minWidth: 0 }}>
                <Text fontSize="md" fontWeight="500" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {artifact.name}
                </Text>
                <Box display="flex" alignItems="center" gap="6">
                    {artifact.isPrivate && !artifact.sharedWith && !artifact.sharedWithTeam
                        ? <PrivateBadge />
                        : <ArtifactAvatarStack artifact={artifact} size="xs" />
                    }
                    <Text fontSize="sm" color="fg.tertiary" style={{ flexShrink: 0 }}>·</Text>
                    <Text fontSize="sm" color="fg.tertiary" style={{ whiteSpace: "nowrap" }}>{artifact.activityText}</Text>
                </Box>
                {/* Slides in on hover: tags + View → */}
                <Box style={{
                    maxHeight: hovered ? 24 : 0,
                    opacity: hovered ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.25s ease, opacity 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                }}>
                    <Box display="flex" alignItems="center" gap="4">
                        {(artifact.tags ?? []).slice(0, 2).map((tag) => (
                            <Badge key={tag} intent="neutral">{tag}</Badge>
                        ))}
                    </Box>
                    <Box display="flex" alignItems="center" gap="6" style={{ flexShrink: 0 }}>
                        <Box color="fg.tertiary" style={{ lineHeight: 0 }}>
                            {artifact.source.type === "agent" ? <IconAgent size={14} /> :
                             artifact.source.type === "workflow" ? <IconCodeBranch size={14} /> :
                             <IconComments size={14} />}
                        </Box>
                        <Text fontSize="sm" color="fg.secondary" fontWeight="500">View →</Text>
                    </Box>
                </Box>
            </Box>
            {/* Ellipsis — top-right, fades in on hover */}
            <Box style={{ position: "absolute", top: 10, right: 10, opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}>
                <ArtifactEllipsisMenu artifact={artifact} onOpen={onOpen} onShare={onShare} />
            </Box>
        </Box>
    );
}

function JumpBackIn({ items, onOpen, onShare }: { items: Artifact[]; onOpen: (a: Artifact) => void; onShare: (a: Artifact) => void }) {
    return (
        <Box display="flex" flexDirection="column" gap="12" style={{ width: 320, flexShrink: 0 }}>
            <Text fontSize="sm" fontWeight="600" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Jump back in
            </Text>
            {items.map((artifact) => (
                <JumpBackInCard key={artifact.id} artifact={artifact} onOpen={onOpen} onShare={onShare} />
            ))}
        </Box>
    );
}

// ─── Horizontal section ───────────────────────────────────────────────────────

function HorizontalSection({
    title,
    items,
    onOpen,
    onShare,
    pinnedIds,
    onTogglePin,
    cardWidth = 300,
    onSeeAll,
}: {
    title: string;
    items: Artifact[];
    onOpen: (a: Artifact) => void;
    onShare: (a: Artifact) => void;
    pinnedIds: Set<string>;
    onTogglePin: (id: string) => void;
    cardWidth?: number;
    onSeeAll?: () => void;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    function updateScrollState() {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 1);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }

    useEffect(() => {
        updateScrollState();
        const el = scrollRef.current;
        el?.addEventListener("scroll", updateScrollState, { passive: true });
        const ro = new ResizeObserver(updateScrollState);
        if (el) ro.observe(el);
        return () => {
            el?.removeEventListener("scroll", updateScrollState);
            ro.disconnect();
        };
    }, [items]);

    function scroll(dir: "left" | "right") {
        scrollRef.current?.scrollBy({ left: dir === "left" ? -(cardWidth + 16) : (cardWidth + 16), behavior: "smooth" });
    }

    if (items.length === 0) return null;

    return (
        <Box display="flex" flexDirection="column" gap="12">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Text fontSize="lg" fontWeight="600">{title}</Text>
                <Box display="flex" alignItems="center" gap="4">
                    {onSeeAll && <Button appearance="subtle" size="sm" onClick={onSeeAll}>See all</Button>}
                    <Button appearance="subtle" size="sm" aria-label="Scroll left" disabled={!canScrollLeft} icon={<IconAngleRight size={14} style={{ transform: "rotate(180deg)" }} />} onClick={() => scroll("left")} />
                    <Button appearance="subtle" size="sm" aria-label="Scroll right" disabled={!canScrollRight} icon={<IconAngleRight size={14} />} onClick={() => scroll("right")} />
                </Box>
            </Box>
            <Box
                ref={scrollRef}
                style={{
                    display: "flex",
                    gap: 16,
                    overflowX: "auto",
                    paddingBottom: 4,
                    scrollSnapType: "x mandatory",
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                }}
            >
                {items.map((artifact) => (
                    <Box key={artifact.id} style={{ scrollSnapAlign: "start" }}>
                        <WorkspaceArtifactCard
                            artifact={artifact}
                            onOpen={onOpen}
                            onShare={onShare}
                            pinned={pinnedIds.has(artifact.id)}
                            onTogglePin={onTogglePin}
                            width={cardWidth}
                        />
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// ─── Section customizer ───────────────────────────────────────────────────────

type SectionId = "jumpBackIn" | "lastViewed" | "pinned" | "lastEdited" | "allArtifacts";
type SectionDef = { id: SectionId; label: string; enabled: boolean };

const SECTION_DEFAULTS: SectionDef[] = [
    { id: "jumpBackIn",   label: "Jump back in", enabled: true  },
    { id: "lastViewed",   label: "Last Viewed",  enabled: false },
    { id: "pinned",       label: "Pinned",        enabled: true  },
    { id: "lastEdited",   label: "Last Edited",   enabled: false },
    { id: "allArtifacts", label: "All artifacts", enabled: true  },
];

function SectionCustomizerPanel({
    sections,
    setSections,
    sidebarEnabled,
    setSidebarEnabled,
    onClose,
}: {
    sections: SectionDef[];
    setSections: (s: SectionDef[]) => void;
    sidebarEnabled: boolean;
    setSidebarEnabled: (v: boolean) => void;
    onClose: () => void;
}) {
    const panelRef = useRef<HTMLDivElement>(null);
    const dragIndexRef = useRef<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    function toggleSection(id: SectionId) {
        setSections(sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
    }

    function handleDragOver(e: React.DragEvent, index: number) {
        e.preventDefault();
        setDragOverIndex(index);
    }

    function handleDrop(toIndex: number) {
        const from = dragIndexRef.current;
        if (from === null || from === toIndex) { setDragOverIndex(null); return; }
        const next = [...sections];
        const [item] = next.splice(from, 1);
        next.splice(toIndex, 0, item);
        setSections(next);
        dragIndexRef.current = null;
        setDragOverIndex(null);
    }

    return (
        <Box
            ref={panelRef}
            rounded="xl"
            shadow="md"
            style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: 240,
                zIndex: 200,
                background: "var(--ax-colors-bg-default)",
                border: "1px solid var(--ax-colors-border-default)",
                overflow: "hidden",
            }}
        >
            <Box style={{ padding: "10px 14px", borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}>
                <Text fontSize="sm" fontWeight="600" color="fg.secondary">Customize view</Text>
            </Box>
            <Box style={{ padding: "4px 0 0" }}>
                {sections.map((section, index) => (
                    <Box
                        key={section.id}
                        draggable
                        onDragStart={() => { dragIndexRef.current = index; }}
                        onDragOver={(e: React.DragEvent) => handleDragOver(e, index)}
                        onDrop={() => handleDrop(index)}
                        onDragEnd={() => setDragOverIndex(null)}
                        display="flex"
                        alignItems="center"
                        gap="8"
                        style={{
                            padding: "7px 14px",
                            cursor: "grab",
                            borderTop: dragOverIndex === index ? "2px solid var(--ax-colors-border-focus)" : "2px solid transparent",
                            background: dragOverIndex === index ? "var(--ax-colors-bg-secondary)" : undefined,
                            transition: "background 0.1s",
                        }}
                    >
                        {/* Grip dots */}
                        <svg width="10" height="14" viewBox="0 0 10 14" fill="var(--ax-colors-fg-tertiary)" style={{ flexShrink: 0 }}>
                            <circle cx="2.5" cy="2.5" r="1.5"/><circle cx="7.5" cy="2.5" r="1.5"/>
                            <circle cx="2.5" cy="7"   r="1.5"/><circle cx="7.5" cy="7"   r="1.5"/>
                            <circle cx="2.5" cy="11.5" r="1.5"/><circle cx="7.5" cy="11.5" r="1.5"/>
                        </svg>
                        <Text fontSize="sm" color="fg.default" style={{ flex: 1 }}>{section.label}</Text>
                        {/* Toggle */}
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleSection(section.id); }}
                            style={{
                                width: 34,
                                height: 18,
                                borderRadius: 9,
                                border: "none",
                                background: section.enabled ? "var(--ax-colors-bg-accent)" : "var(--ax-colors-bg-tertiary)",
                                cursor: "pointer",
                                position: "relative",
                                transition: "background 0.2s",
                                flexShrink: 0,
                            }}
                        >
                            <Box
                                rounded="full"
                                shadow="sm"
                                style={{
                                    position: "absolute",
                                    top: 2,
                                    left: section.enabled ? 16 : 2,
                                    width: 14,
                                    height: 14,
                                    background: "var(--ax-colors-bg-default)",
                                    transition: "left 0.2s",
                                }}
                            />
                        </button>
                    </Box>
                ))}
                {/* Sidebar toggle — separated by a divider */}
                <Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)", margin: "4px 0" }} />
                <Box
                    display="flex"
                    alignItems="center"
                    gap="8"
                    style={{ padding: "7px 14px" }}
                >
                    <Box style={{ width: 10, flexShrink: 0 }} />
                    <Text fontSize="sm" color="fg.default" style={{ flex: 1 }}>Sidebar</Text>
                    <button
                        onClick={(e) => { e.stopPropagation(); setSidebarEnabled(!sidebarEnabled); }}
                        style={{
                            width: 34, height: 18, borderRadius: 9, border: "none",
                            background: sidebarEnabled ? "var(--ax-colors-bg-accent)" : "var(--ax-colors-bg-tertiary)",
                            cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
                        }}
                    >
                        <Box rounded="full" shadow="sm" style={{
                            position: "absolute", top: 2,
                            left: sidebarEnabled ? 16 : 2,
                            width: 14, height: 14,
                            background: "var(--ax-colors-bg-default)",
                            transition: "left 0.2s",
                        }} />
                    </button>
                </Box>
            </Box>
        </Box>
    );
}

// ─── Filter sidebar ───────────────────────────────────────────────────────────

const SECTION_ICONS: Record<SectionId, React.ReactNode> = {
    jumpBackIn:   <IconInboxFull size={14} />,
    lastViewed:   <IconArrowsMaximize size={14} />,
    pinned:       <IconThumbtackSolid size={14} />,
    lastEdited:   <IconPenLine size={14} />,
    allArtifacts: <IconList size={14} />,
};

function CountBadge({ count }: { count: number }) {
    return <Badge>{count}</Badge>;
}

function FilterSidebar({
    sections,
    setSections,
    typeFilter, setTypeFilter,
    creatorFilter, setCreatorFilter,
    agentFilter, setAgentFilter,
    dateFilter, setDateFilter,
    pinnedFilter, setPinnedFilter,
    sectionCounts,
    typeCounts,
    ownerCounts,
    agentCounts,
    pinnedCount,
    activeQuick,
    setActiveQuick: _setActiveQuick,
    quickCollapsed,
    setQuickCollapsed,
    handleQuick,
}: {
    sections: SectionDef[];
    setSections: (s: SectionDef[]) => void;
    typeFilter: string; setTypeFilter: (v: "All" | ArtifactType) => void;
    creatorFilter: string; setCreatorFilter: (v: string) => void;
    agentFilter: string; setAgentFilter: (v: string) => void;
    dateFilter: string; setDateFilter: (v: string) => void;
    pinnedFilter: boolean; setPinnedFilter: (v: boolean) => void;
    sectionCounts: Record<SectionId, number>;
    typeCounts: Record<string, number>;
    ownerCounts: Record<string, number>;
    agentCounts: Record<string, number>;
    pinnedCount: number;
    activeQuick: SectionId | null;
    setActiveQuick: (v: SectionId | null) => void;
    quickCollapsed: boolean;
    setQuickCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
    handleQuick: (id: SectionId) => void;
}) {
    const [typeCollapsed, setTypeCollapsed] = useState(false);
    const [dateCollapsed, setDateCollapsed] = useState(false);
    const [creatorCollapsed, setCreatorCollapsed] = useState(true);
    const [agentsCollapsed, setAgentsCollapsed] = useState(true);

    const navItem: React.CSSProperties = {
        display: "flex", alignItems: "center", gap: 12,
        height: 40, minHeight: 40, flexShrink: 0,
        padding: "0 12px", borderRadius: 8,
        border: "none", cursor: "pointer", width: "100%", textAlign: "left",
        fontFamily: "inherit", background: "transparent", transition: "background 0.1s",
    };

    const labelStyle: React.CSSProperties = {
        flex: 1,
        fontSize: "var(--ax-fontSize-md-fontSize, 14px)",
        lineHeight: 1.43,
        letterSpacing: "0.28px",
        fontWeight: 500,
        color: "var(--ax-colors-fg-secondary)",
    };

    function SectionGroupHeader({ label, collapsed, onToggle }: { label: string; collapsed?: boolean; onToggle?: () => void }) {
        return (
            <button onClick={onToggle} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 12px", width: "100%", border: "none",
                background: "transparent", cursor: "pointer", fontFamily: "inherit",
                marginTop: 4, flexShrink: 0,
            }}>
                <span style={{
                    flex: 1, textAlign: "left",
                    fontSize: 12,
                    color: "var(--ax-colors-fg-tertiary)",
                    fontWeight: 400,
                    letterSpacing: "0.36px",
                    lineHeight: 1.25,
                    textTransform: "uppercase",
                }}>{label}</span>
                <IconChevronDown size={14} style={{
                    color: "var(--ax-colors-fg-tertiary)",
                    flexShrink: 0,
                    transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                    transition: "transform 0.15s",
                }} />
            </button>
        );
    }

    return (
        <Box style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflowY: "auto", paddingTop: 8, paddingBottom: 16, gap: 2, background: "var(--ax-colors-bg-default)" }}>

            {/* Quick Filters */}
            <SectionGroupHeader label="Quick Filters" collapsed={quickCollapsed} onToggle={() => setQuickCollapsed(v => !v)} />
            {!quickCollapsed && sections.map(section => {
                const isActive = activeQuick === section.id;
                const count = sectionCounts[section.id];
                return (
                    <button
                        key={section.id}
                        onClick={() => handleQuick(section.id)}
                        style={{ ...navItem, background: isActive ? "var(--ax-colors-bg-secondary)" : "transparent" }}
                    >
                        <Box style={{ color: isActive ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)", lineHeight: 0, flexShrink: 0 }}>
                            {SECTION_ICONS[section.id]}
                        </Box>
                        <span style={{ ...labelStyle, color: isActive ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)" }}>
                            {section.label}
                        </span>
                        {count !== undefined && <CountBadge count={count} />}
                    </button>
                );
            })}

            {/* Type — collapsible inline list */}
            <Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)", margin: "4px 0" }} />
            <SectionGroupHeader label="Type" collapsed={typeCollapsed} onToggle={() => setTypeCollapsed(v => !v)} />
            {!typeCollapsed && (
                <>
                    {(["Document", "Image", "Code", "Presentation", "Spreadsheet", "Report"] as ArtifactType[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(typeFilter === t ? "All" : t)}
                            style={{ ...navItem, background: typeFilter === t ? "var(--ax-colors-bg-secondary)" : "transparent", padding: "0 12px" }}
                        >
                            <Box style={{ color: typeFilter === t ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)", lineHeight: 0, flexShrink: 0 }}>
                                {typeIcon[t]}
                            </Box>
                            <span style={{ ...labelStyle, flex: 1, color: typeFilter === t ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)" }}>
                                {typeLabel[t]}
                            </span>
                            {typeCounts[t] !== undefined && <CountBadge count={typeCounts[t]} />}
                        </button>
                    ))}
                </>
            )}

            {/* Date — collapsible inline list */}
            <Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)", margin: "4px 0" }} />
            <SectionGroupHeader label="Date" collapsed={dateCollapsed} onToggle={() => setDateCollapsed(v => !v)} />
            {!dateCollapsed && (
                <>
                    {(["All", "Last 7 days", "Last 30 days", "Last 90 days"] as const).map(d => (
                        <button
                            key={d}
                            onClick={() => setDateFilter(d === "All" ? "All" : d)}
                            style={{ ...navItem, background: dateFilter === (d === "All" ? "All" : d) ? "var(--ax-colors-bg-secondary)" : "transparent", padding: "0 12px" }}
                        >
                            <span style={{ ...labelStyle, color: dateFilter === (d === "All" ? "All" : d) ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)" }}>
                                {d === "All" ? "All time" : d}
                            </span>
                        </button>
                    ))}
                </>
            )}

            {/* Creator — collapsible inline list (humans + VAUs) */}
            <Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)", margin: "4px 0" }} />
            <SectionGroupHeader label="Creator" collapsed={creatorCollapsed} onToggle={() => setCreatorCollapsed(v => !v)} />
            {!creatorCollapsed && (
                <>
                    {allCreators.map(c => {
                        const avatar = artifacts.find(a => a.createdBy.name === c)?.createdBy.avatar;
                        return (
                        <button
                            key={c}
                            onClick={() => { setCreatorFilter(creatorFilter === c ? "All" : c); setAgentFilter("All"); }}
                            style={{ ...navItem, background: creatorFilter === c ? "var(--ax-colors-bg-secondary)" : "transparent", padding: "0 12px" }}
                        >
                            <Avatar name={c} src={avatar} size="sm" colorScheme="purple" style={{ flexShrink: 0 }} />
                            <span style={{ ...labelStyle, flex: 1, color: creatorFilter === c ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)" }}>
                                {c}
                            </span>
                            {ownerCounts[c] !== undefined && <CountBadge count={ownerCounts[c]} />}
                        </button>
                        );
                    })}
                    {allAgents.map(name => {
                        const avatar = sourceAvatar[name];
                        const isActive = creatorFilter === name;
                        return (
                            <button
                                key={`vau-${name}`}
                                onClick={() => { setCreatorFilter(creatorFilter === name ? "All" : name); setAgentFilter("All"); }}
                                style={{ ...navItem, background: isActive ? "var(--ax-colors-bg-secondary)" : "transparent", padding: "0 12px" }}
                            >
                                {avatar ? (
                                    <span style={{ width: 20, height: 20, borderRadius: 4, background: "var(--ax-colors-bg-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                                        <img src={avatar} alt={name} style={{ width: 14, height: 14, display: "block" }} />
                                    </span>
                                ) : (
                                    <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>{sourceEmoji[name] ?? "🤖"}</span>
                                )}
                                <span style={{ ...labelStyle, flex: 1, color: isActive ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)" }}>
                                    {name}
                                </span>
                                {agentCounts[name] !== undefined && <CountBadge count={agentCounts[name]} />}
                            </button>
                        );
                    })}
                </>
            )}

            {/* Agents — collapsible inline list */}
            <Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)", margin: "4px 0" }} />
            <SectionGroupHeader label="Agents" collapsed={agentsCollapsed} onToggle={() => setAgentsCollapsed(v => !v)} />
            {!agentsCollapsed && (
                <>
                    {allAgents.map(name => {
                        const avatar = sourceAvatar[name];
                        const isActive = agentFilter === name;
                        return (
                            <button
                                key={name}
                                onClick={() => { setAgentFilter(agentFilter === name ? "All" : name); setCreatorFilter("All"); }}
                                style={{ ...navItem, background: isActive ? "var(--ax-colors-bg-secondary)" : "transparent", padding: "0 12px" }}
                            >
                                {avatar ? (
                                    <span style={{ width: 20, height: 20, borderRadius: 4, background: "var(--ax-colors-bg-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                                        <img src={avatar} alt={name} style={{ width: 14, height: 14, display: "block" }} />
                                    </span>
                                ) : (
                                    <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>{sourceEmoji[name] ?? "🤖"}</span>
                                )}
                                <span style={{ ...labelStyle, flex: 1, color: isActive ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)" }}>
                                    {name}
                                </span>
                                {agentCounts[name] !== undefined && <CountBadge count={agentCounts[name]} />}
                            </button>
                        );
                    })}
                </>
            )}
        </Box>
    );
}

export default function ArtifactsPage() {
    const { setSubNavContent, setSubNavWidth } = useLayout();
    const [sidebarEnabled, setSidebarEnabled] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const router = useRouter();
    const [search, setSearch] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [typeFilter, setTypeFilter] = useState<"All" | ArtifactType>("All");
    const [creatorFilter, setCreatorFilter] = useState("All");
    const [agentFilter, setAgentFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("All");
    const [pinnedFilter, setPinnedFilter] = useState(false);
    const [showFullFilters, setShowFullFilters] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [sortKey, setSortKey] = useState<SortKey>("created");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [deleteTarget, setDeleteTarget] = useState<Artifact | null>(null);
    const [shareArtifact, setShareArtifact] = useState<Artifact | null>(null);
    const [openArtifact, setOpenArtifact] = useState<Artifact | null>(null);
    const [openMode, setOpenMode] = useState<"preview" | "with-panel">("preview");
    const [pinnedIds, setPinnedIds] = useState<Set<string>>(DEFAULT_PINNED_IDS);
    const [sections, setSections] = useState<SectionDef[]>(SECTION_DEFAULTS);
    const [showCustomizer, setShowCustomizer] = useState(false);
    const [activeQuick, setActiveQuick] = useState<SectionId | null>(null);
    const [quickCollapsed, setQuickCollapsed] = useState(false);
    const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({});

    function togglePin(id: string) {
        setPinnedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function handleSort(key: SortKey) {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    }

    const handleQuick = useCallback((id: SectionId) => {
        // Toggle: clicking the active filter clears it (show all)
        setActiveQuick(prev => prev === id ? null : id);
    }, [setActiveQuick]);

    const hasActiveFilters = typeFilter !== "All" || creatorFilter !== "All" || dateFilter !== "All" || pinnedFilter || agentFilter !== "All" || activeQuick !== null;
    const nowSec = Date.now() / 1000;
    const dateFilterCutoff: Record<string, number> = {
        "Last 7 days": nowSec - 7 * 86400,
        "Last 30 days": nowSec - 30 * 86400,
        "Last 90 days": nowSec - 90 * 86400,
    };

    // ── Section slices ──────────────────────────────────────────────────────
    const recentlyViewed = useMemo(
        () => [...artifacts].filter((a) => a.lastViewedRaw).sort((a, b) => (b.lastViewedRaw ?? 0) - (a.lastViewedRaw ?? 0)),
        []
    );
    const lastEdited = useMemo(
        () => [...artifacts].filter((a) => a.activityText.startsWith("Edited")).sort((a, b) => b.createdRaw - a.createdRaw),
        []
    );
    const pinnedArtifacts = useMemo(() => artifacts.filter((a) => pinnedIds.has(a.id)), [pinnedIds]);

    // ── "All artifacts" filtered list ──────────────────────────────────────
    const filtered = useMemo(() => {
        // Quick filters narrow the base set first
        let base: Artifact[];
        if (activeQuick === "jumpBackIn") base = recentlyViewed.slice(0, 3);
        else if (activeQuick === "lastViewed") base = recentlyViewed;
        else if (activeQuick === "pinned") base = artifacts.filter((a) => pinnedIds.has(a.id));
        else if (activeQuick === "lastEdited") base = lastEdited;
        else base = artifacts;

        const q = search.trim().toLowerCase();
        return base
            .filter((a) => {
                if (pinnedFilter && !pinnedIds.has(a.id)) return false;
                if (typeFilter !== "All" && a.type !== typeFilter) return false;
                if (creatorFilter !== "All") {
                    const isVAU = allAgents.includes(creatorFilter);
                    if (isVAU ? a.source.name !== creatorFilter : a.createdBy.name !== creatorFilter) return false;
                }
                if (agentFilter !== "All" && a.source.name !== agentFilter) return false;
                if (dateFilter !== "All" && dateFilterCutoff[dateFilter] && a.createdRaw < dateFilterCutoff[dateFilter]) return false;
                if (q && !a.name.toLowerCase().includes(q) && !a.source.name.toLowerCase().includes(q)) return false;
                return true;
            })
            .sort((a, b) => {
                let cmp = 0;
                if (sortKey === "name") cmp = a.name.localeCompare(b.name);
                else if (sortKey === "created") cmp = a.createdRaw - b.createdRaw;
                else if (sortKey === "size") cmp = a.sizeRaw - b.sizeRaw;
                else if (sortKey === "version") cmp = a.version.localeCompare(b.version, undefined, { numeric: true });
                else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
                return sortDir === "asc" ? cmp : -cmp;
            });
    }, [activeQuick, recentlyViewed, pinnedIds, lastEdited, search, typeFilter, creatorFilter, agentFilter, pinnedFilter, sortKey, sortDir]);

    const resumeArtifact = useMemo(
        () => filtered.find((a) => a.isInProgress) ?? filtered[0] ?? null,
        [filtered]
    );

    const jumpBackInItems = useMemo(
        () => recentlyViewed.filter((a) => filtered.some((f) => f.id === a.id) && a.id !== resumeArtifact?.id).slice(0, 3),
        [recentlyViewed, filtered, resumeArtifact]
    );

    // ── Federated counts ────────────────────────────────────────────────────
    const sectionCounts = useMemo<Record<SectionId, number>>(() => ({
        jumpBackIn: recentlyViewed.slice(0, 3).length,
        lastViewed: recentlyViewed.length,
        pinned: pinnedArtifacts.length,
        lastEdited: lastEdited.length,
        allArtifacts: artifacts.length,
    }), [recentlyViewed, pinnedArtifacts, lastEdited]);

    const typeCounts = useMemo<Record<string, number>>(() => {
        const counts: Record<string, number> = {};
        artifacts.forEach(a => { counts[a.type] = (counts[a.type] ?? 0) + 1; });
        return counts;
    }, []);

    const ownerCounts = useMemo<Record<string, number>>(() => {
        const counts: Record<string, number> = {};
        artifacts.forEach(a => { counts[a.createdBy.name] = (counts[a.createdBy.name] ?? 0) + 1; });
        return counts;
    }, []);

    const agentCounts = useMemo<Record<string, number>>(() => {
        const counts: Record<string, number> = {};
        artifacts.forEach(a => { counts[a.source.name] = (counts[a.source.name] ?? 0) + 1; });
        return counts;
    }, []);

    // ── Inject sidebar into template secondary nav slot ─────────────────────
    useEffect(() => {
        setSubNavWidth(272);
        if (sidebarEnabled && sidebarOpen) {
            setSubNavContent(
                <FilterSidebar
                    sections={sections}
                    setSections={setSections}
                    typeFilter={typeFilter} setTypeFilter={setTypeFilter}
                    creatorFilter={creatorFilter} setCreatorFilter={setCreatorFilter}
                    agentFilter={agentFilter} setAgentFilter={setAgentFilter}
                    dateFilter={dateFilter} setDateFilter={setDateFilter}
                    pinnedFilter={pinnedFilter} setPinnedFilter={setPinnedFilter}
                    sectionCounts={sectionCounts}
                    typeCounts={typeCounts}
                    ownerCounts={ownerCounts}
                    agentCounts={agentCounts}
                    pinnedCount={pinnedArtifacts.length}
                    activeQuick={activeQuick}
                    setActiveQuick={setActiveQuick}
                    quickCollapsed={quickCollapsed}
                    setQuickCollapsed={setQuickCollapsed}
                    handleQuick={handleQuick}
                />
            );
        } else {
            setSubNavContent(null);
        }
        return () => setSubNavContent(null);
    }, [
        sidebarEnabled, sidebarOpen, sections, typeFilter, creatorFilter, agentFilter,
        dateFilter, pinnedFilter, sectionCounts, typeCounts, ownerCounts, agentCounts,
        pinnedArtifacts.length, setSubNavContent, setSubNavWidth, setSections,
        setTypeFilter, setCreatorFilter, setAgentFilter, setDateFilter, setPinnedFilter,
        activeQuick, quickCollapsed, handleQuick,
    ]);

    const viewerArtifact: ArtifactViewerArtifact | null = openArtifact
        ? {
              id: openArtifact.id,
              name: openArtifact.name,
              type: openArtifact.type as ArtifactViewerArtifact["type"],
              sourceType: openArtifact.source.type as ArtifactViewerArtifact["sourceType"],
              sourceName: openArtifact.source.name,
              sourceLink: openArtifact.source.link,
              createdBy: openArtifact.createdBy,
              created: openArtifact.created,
              status: openArtifact.status,
              version: openArtifact.version,
              imageUrl: openArtifact.imageUrl,
              hasTeamThread: openArtifact.sharedWithTeam && openArtifact.isInProgress,
          }
        : null;

    return (
        <>
            {/* Artifact Viewer */}
            {viewerArtifact && (
                <ArtifactViewer
                    artifact={viewerArtifact}
                    onClose={() => setOpenArtifact(null)}
                    openMode={openMode}
                />
            )}

            {/* Delete confirmation */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <DialogContent>
                    <DialogHeader>Delete artifact</DialogHeader>
                    <DialogBody>
                        <Text>
                            Are you sure you want to delete{" "}
                            <Text asChild fontWeight="600"><strong>{deleteTarget?.name}</strong></Text>? This action cannot be undone.
                        </Text>
                    </DialogBody>
                    <DialogFooter>
                        <DialogClose><Button appearance="subtle">Cancel</Button></DialogClose>
                        <Button
                            appearance="danger"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Box display="flex" flexDirection="column" gap="40" overflow="auto" style={{ flex: 1, minWidth: 0, minHeight: 0 }}>

                {/* ── Hero ── */}
                {!hasActiveFilters && (
                    <Box display="flex" flexDirection="column" alignItems={sidebarEnabled ? "start" : "center"} gap="12" pt="16">
                        <Heading level="1">Your Workspace</Heading>
                        {!sidebarEnabled && (
                            <Text color="fg.secondary" fontSize="lg">
                                Everything your agents are creating, analyzing, and optimizing.
                            </Text>
                        )}
                    </Box>
                )}

                {/* ── Search ── */}
                <Box display="flex" flexDirection="column" alignItems={sidebarEnabled ? "start" : "center"} gap="8" style={{ width: "100%", maxWidth: sidebarEnabled ? "none" : 600, alignSelf: sidebarEnabled ? "stretch" : "center" }}>
                    {/* Search input row + filter button */}
                    <Box display="flex" alignItems="center" gap="8" style={{ width: "100%" }}>
                        <Box
                            display="flex"
                            alignItems="center"
                            gap="8"
                            bg="bg.default"
                            border="1"
                            borderColor={searchFocused ? "border.focus" : "border.default"}
                            rounded="lg"
                            style={{ flex: 1, padding: "0 12px", minHeight: 44, cursor: "text", transition: "border-color 0.15s", flexWrap: "wrap", rowGap: 4, paddingTop: hasActiveFilters ? 6 : 0, paddingBottom: hasActiveFilters ? 6 : 0 }}
                            onClick={() => searchInputRef.current?.focus()}
                        >
                            <Box color={searchFocused ? "fg.secondary" : "fg.tertiary"} style={{ flexShrink: 0, lineHeight: 0, transition: "color 0.15s" }}>
                                <IconSearch size={16} />
                            </Box>
                            {/* Active filter chips */}
                            {creatorFilter !== "All" && (
                                <Box display="inline-flex" alignItems="center" gap="4" rounded="sm" px="8" py="2" style={{ background: "var(--ax-colors-bg-secondary)", height: 24, flexShrink: 0 }}>
                                    <Text fontSize="xs" color="fg.default">{creatorFilter === "Jamie Chen" ? "Created by me" : creatorFilter}</Text>
                                    <Box color="fg.default" style={{ cursor: "pointer", lineHeight: 0, width: 16, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => { e.stopPropagation(); setCreatorFilter("All"); }}>
                                        <IconXmark size={12} />
                                    </Box>
                                </Box>
                            )}
                            {dateFilter !== "All" && (
                                <Box display="inline-flex" alignItems="center" gap="4" rounded="sm" px="8" py="2" style={{ background: "var(--ax-colors-bg-secondary)", height: 24, flexShrink: 0 }}>
                                    <Text fontSize="xs" color="fg.default">{dateFilter}</Text>
                                    <Box color="fg.default" style={{ cursor: "pointer", lineHeight: 0, width: 16, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => { e.stopPropagation(); setDateFilter("All"); }}>
                                        <IconXmark size={12} />
                                    </Box>
                                </Box>
                            )}
                            {typeFilter !== "All" && (
                                <Box display="inline-flex" alignItems="center" gap="4" rounded="sm" px="8" py="2" style={{ background: "var(--ax-colors-bg-secondary)", height: 24, flexShrink: 0 }}>
                                    <Text fontSize="xs" color="fg.default">{typeLabel[typeFilter as ArtifactType]}</Text>
                                    <Box color="fg.default" style={{ cursor: "pointer", lineHeight: 0, width: 16, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => { e.stopPropagation(); setTypeFilter("All"); }}>
                                        <IconXmark size={12} />
                                    </Box>
                                </Box>
                            )}
                            {pinnedFilter && (
                                <Box display="inline-flex" alignItems="center" gap="4" rounded="sm" px="8" py="2" style={{ background: "var(--ax-colors-bg-secondary)", height: 24, flexShrink: 0 }}>
                                    <Text fontSize="xs" color="fg.default">Pinned</Text>
                                    <Box color="fg.default" style={{ cursor: "pointer", lineHeight: 0, width: 16, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => { e.stopPropagation(); setPinnedFilter(false); }}>
                                        <IconXmark size={12} />
                                    </Box>
                                </Box>
                            )}
                            <input
                                ref={searchInputRef}
                                style={{
                                    flex: 1,
                                    minWidth: 120,
                                    border: "none",
                                    outline: "none",
                                    background: "transparent",
                                    fontSize: "var(--ax-fontSize-md-fontSize)",
                                    color: "var(--ax-colors-fg-default)",
                                    fontFamily: "inherit",
                                    height: 32,
                                }}
                                placeholder={hasActiveFilters ? "" : "Search artifacts, ask your agents, or jump to..."}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                            />
                        </Box>
                        <div style={{ position: "relative", display: "flex", gap: 8 }}>
                            <Button
                                appearance="default"
                                size="lg"
                                icon={<IconSlidersSimple />}
                                onClick={() => sidebarEnabled ? setSidebarOpen(v => !v) : setShowFullFilters(v => !v)}
                                aria-label="Filters"
                                aria-pressed={sidebarEnabled ? sidebarOpen : showFullFilters}
                                style={(sidebarEnabled ? sidebarOpen : showFullFilters) ? { background: "var(--ax-colors-bg-default-pressed)" } : undefined}
                            />
                            <Button
                                appearance="subtle"
                                size="lg"
                                icon={<IconGear />}
                                onClick={() => setShowCustomizer((v) => !v)}
                                aria-label="Customize view"
                                style={showCustomizer ? { background: "var(--ax-colors-bg-default-pressed)" } : undefined}
                            />
                            {showCustomizer && (
                                <SectionCustomizerPanel
                                    sections={sections}
                                    setSections={setSections}
                                    sidebarEnabled={sidebarEnabled}
                                    setSidebarEnabled={(v) => { setSidebarEnabled(v); setSidebarOpen(v); }}
                                    onClose={() => setShowCustomizer(false)}
                                />
                            )}
                        </div>
                    </Box>

                    {/* Quick-filter toggle pills — shown when search is focused, hidden when full filter panel is open */}
                    {searchFocused && !showFullFilters && (
                        <Box display="flex" gap="6" alignItems="center" flexWrap="wrap" style={{ width: "100%" }}>
                            {(
                                [
                                    { label: "Pinned", active: pinnedFilter, onClick: () => setPinnedFilter((v) => !v) },
                                    { label: "Created by me", active: creatorFilter === "Jamie Chen", onClick: () => setCreatorFilter(creatorFilter === "Jamie Chen" ? "All" : "Jamie Chen") },
                                    { label: "Last 7 days", active: dateFilter === "Last 7 days", onClick: () => setDateFilter(dateFilter === "Last 7 days" ? "All" : "Last 7 days") },
                                    { label: "Document", active: typeFilter === "Document", onClick: () => setTypeFilter(typeFilter === "Document" ? "All" : "Document") },
                                    { label: "Media", active: typeFilter === "Image", onClick: () => setTypeFilter(typeFilter === "Image" ? "All" : "Image") },
                                    { label: "Presentation", active: typeFilter === "Presentation", onClick: () => setTypeFilter(typeFilter === "Presentation" ? "All" : "Presentation") },
                                ] as { label: string; active: boolean; onClick: () => void }[]
                            ).map(({ label, active, onClick }) => (
                                <button
                                    key={label}
                                    onClick={onClick}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        height: 32,
                                        padding: "0 14px",
                                        borderRadius: 9999,
                                        border: `1px solid ${active ? "var(--ax-colors-border-default)" : "var(--ax-colors-border-default)"}`,
                                        background: active ? "var(--ax-colors-bg-default-pressed)" : "var(--ax-colors-bg-default)",
                                        color: "var(--ax-colors-fg-default)",
                                        fontSize: "var(--ax-fontSize-sm-fontSize)",
                                        fontFamily: "inherit",
                                        fontWeight: active ? 500 : 400,
                                        cursor: "pointer",
                                        transition: "all 0.1s",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                            {hasActiveFilters && (
                                <Button appearance="subtle" size="sm" onClick={() => { setTypeFilter("All"); setCreatorFilter("All"); setAgentFilter("All"); setDateFilter("All"); setPinnedFilter(false); }}>
                                    Clear
                                </Button>
                            )}
                        </Box>
                    )}

                    {/* Full filter panel — shown when filter button is toggled */}
                    {showFullFilters && (
                        <Box display="flex" gap="8" alignItems="center" flexWrap="wrap" style={{ width: "100%" }}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <AngleMenuButton size="md">
                                        {typeFilter === "All" ? "Type" : typeLabel[typeFilter as ArtifactType]}
                                    </AngleMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {allTypes.map((t) => (
                                        <DropdownMenuItem key={t} onClick={() => setTypeFilter(t)}>
                                            <Box display="flex" alignItems="center" gap="8">
                                                {t !== "All" && typeIcon[t]}
                                                {t === "All" ? "All types" : typeLabel[t]}
                                            </Box>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <AngleMenuButton size="md">
                                        {creatorFilter === "All" ? "Creator" : creatorFilter.split(" ")[0]}
                                    </AngleMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {["All", ...allCreators].map((c) => (
                                        <DropdownMenuItem key={c} onClick={() => setCreatorFilter(c)}>
                                            <Box display="flex" alignItems="center" gap="8">
                                                {c !== "All" && <Avatar name={c} size="sm" colorScheme="purple" />}
                                                {c === "All" ? "All creators" : c}
                                            </Box>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <AngleMenuButton size="md">
                                        {dateFilter === "All" ? "Date" : dateFilter}
                                    </AngleMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {(["All", "Last 7 days", "Last 30 days", "Last 90 days"] as const).map((t) => (
                                        <DropdownMenuItem key={t} onClick={() => setDateFilter(t === "All" ? "All" : t)}>
                                            {t === "All" ? "All time" : t}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <AngleMenuButton size="md">
                                        {pinnedFilter ? "Pinned" : "Pinned: All"}
                                    </AngleMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setPinnedFilter(false)}>
                                        <Box display="flex" alignItems="center" gap="8">All</Box>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setPinnedFilter(true)}>
                                        <Box display="flex" alignItems="center" gap="8"><IconThumbtackSolid size={14} />Pinned</Box>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {hasActiveFilters && (
                                <Button appearance="subtle" size="sm" onClick={() => { setTypeFilter("All"); setCreatorFilter("All"); setAgentFilter("All"); setDateFilter("All"); setPinnedFilter(false); }}>
                                    Clear all
                                </Button>
                            )}
                        </Box>
                    )}
                </Box>

                {/* ── Dynamic sections — hidden when any filter is active ── */}
                {!hasActiveFilters && sections.filter((s) => s.enabled).map((s) => {
                    const openFn = (a: Artifact) => {
                        if (a.directLink) { router.push(a.directLink); return; }
                        setOpenArtifact(a); setOpenMode("preview");
                    };
                    if (s.id === "jumpBackIn") return (resumeArtifact || jumpBackInItems.length > 0) ? (
                        <Box key="jumpBackIn" ref={(el) => { sectionRefs.current.jumpBackIn = el; }} display="flex" gap="24" alignItems="stretch">
                            {resumeArtifact && <ResumeCard artifact={resumeArtifact} onOpen={openFn} onShare={setShareArtifact} />}
                            <JumpBackIn items={jumpBackInItems} onOpen={openFn} onShare={setShareArtifact} />
                        </Box>
                    ) : null;
                    if (s.id === "lastViewed") return (
                        <div key="lastViewed" ref={(el) => { sectionRefs.current.lastViewed = el; }}>
                            <HorizontalSection title="Recently viewed" items={recentlyViewed} onOpen={openFn} onShare={setShareArtifact} pinnedIds={pinnedIds} onTogglePin={togglePin} cardWidth={320} />
                        </div>
                    );
                    if (s.id === "pinned") return (
                        <div key="pinned" ref={(el) => { sectionRefs.current.pinned = el; }}>
                            <HorizontalSection title="Pinned to workspace" items={pinnedArtifacts} onOpen={openFn} onShare={setShareArtifact} pinnedIds={pinnedIds} onTogglePin={togglePin} cardWidth={320} onSeeAll={() => { setPinnedFilter(true); searchInputRef.current?.focus(); }} />
                        </div>
                    );
                    if (s.id === "lastEdited") return (
                        <div key="lastEdited" ref={(el) => { sectionRefs.current.lastEdited = el; }}>
                            <HorizontalSection title="Last edited" items={lastEdited} onOpen={openFn} onShare={setShareArtifact} pinnedIds={pinnedIds} onTogglePin={togglePin} cardWidth={320} />
                        </div>
                    );
                    return null;
                })}

                {/* ── All artifacts ── */}
                {sections.find((s) => s.id === "allArtifacts")?.enabled && <Box ref={(el) => { sectionRefs.current.allArtifacts = el; }} display="flex" flexDirection="column" gap="16">
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Text fontSize="lg" fontWeight="600">{hasActiveFilters ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : "All artifacts"}</Text>
                        <SegmentedControl
                            value={viewMode}
                            onValueChange={(v: string) => { if (v) setViewMode(v as "list" | "grid"); }}
                        >
                            <SegmentedControlItem value="list" icon={<IconList size={15} />} aria-label="List view" />
                            <SegmentedControlItem value="grid" icon={<IconGrid size={15} />} aria-label="Grid view" />
                        </SegmentedControl>
                    </Box>

                    {/* Empty state */}
                    {filtered.length === 0 && (
                        <Box display="flex" flexDirection="column" gap="8" py="48" alignItems="center">
                            <Box color="fg.tertiary"><IconInboxFull size={32} /></Box>
                            <Text fontWeight="500">No artifacts match your filters</Text>
                            <Button
                                appearance="subtle"
                                size="sm"
                                onClick={() => { setSearch(""); setTypeFilter("All"); setCreatorFilter("All"); setAgentFilter("All"); }}
                            >
                                Clear filters
                            </Button>
                        </Box>
                    )}

                    {/* List view */}
                    {viewMode === "list" && filtered.length > 0 && (
                        <Table>
                            <thead>
                                <Tr>
                                    <Th style={{ width: 110 }}>Type</Th>
                                    <SortHeader label="Name" sortKey="name" current={sortKey} dir={sortDir} onSort={handleSort} />
                                    <Th>Created by</Th>
                                    <Th>Owner</Th>
                                    <Th>Agent</Th>
                                    <Th>Tags</Th>
                                    <Th>Visibility</Th>
                                    <SortHeader label="Activity" sortKey="created" current={sortKey} dir={sortDir} onSort={handleSort} />
                                    <Th style={{ width: 40 }} />
                                </Tr>
                            </thead>
                            <tbody>
                                {filtered.map((artifact) => (
                                    <Tr
                                        key={artifact.id}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => { setOpenArtifact(artifact); setOpenMode("preview"); }}
                                    >
                                        <Td>
                                            <Box display="flex" alignItems="center" gap="8" color="fg.secondary">
                                                {typeIcon[artifact.type]}
                                                <Text fontSize="md">{typeLabel[artifact.type]}</Text>
                                            </Box>
                                        </Td>
                                        <Td>
                                            <Text fontWeight="500">{artifact.name}</Text>
                                        </Td>
                                        <Td>
                                            <PersonCell person={artifact.createdBy} />
                                        </Td>
                                        <Td>
                                            <PersonCell person={artifact.owner} />
                                        </Td>
                                        <Td>
                                            <AgentCell name={artifact.source.name} />
                                        </Td>
                                        <Td>
                                            <Box display="flex" alignItems="center" gap="4" flexWrap="wrap">
                                                {(artifact.tags ?? []).map((tag) => (
                                                    <Badge key={tag} intent="neutral">{tag}</Badge>
                                                ))}
                                            </Box>
                                        </Td>
                                        <Td>
                                            {artifact.isPrivate && !artifact.sharedWith && !artifact.sharedWithTeam ? (
                                                <PrivateBadge />
                                            ) : (
                                                <Box display="flex" alignItems="center" gap="8">
                                                    <ArtifactAvatarStack artifact={artifact} size="sm" />
                                                </Box>
                                            )}
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color="fg.secondary">{artifact.activityText}</Text>
                                        </Td>
                                        <Td>
                                            <Box onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button appearance="subtle" size="sm" aria-label="Options" icon={<IconEllipsisSolid size={13} />} />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => { setOpenArtifact(artifact); setOpenMode("preview"); }}>
                                                        <Box display="flex" alignItems="center" gap="8"><IconArrowsMaximize size={14} />Open</Box>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setShareArtifact(artifact)}>
                                                        <Box display="flex" alignItems="center" gap="8"><IconShareNodes size={14} />Share</Box>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                            <Box display="flex" alignItems="center" gap="8"><IconDownload size={14} />Download as</Box>
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            {["Markdown (.md)", "PDF (.pdf)", "Word (.docx)", "Plain text (.txt)"].map((fmt) => (
                                                                <DropdownMenuItem key={fmt}>{fmt}</DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuItem><Box display="flex" alignItems="center" gap="8"><IconPenLine size={14} />Rename</Box></DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => togglePin(artifact.id)}>
                                                        <Box display="flex" alignItems="center" gap="8">{pinnedIds.has(artifact.id) ? <IconThumbtackSolid size={14} /> : <IconThumbtack size={14} />}{pinnedIds.has(artifact.id) ? "Unpin" : "Pin"}</Box>
                                                    </DropdownMenuItem>
                                                    <Box style={{ height: 1, background: "var(--ax-colors-border-default)", margin: "4px 12px" }} />
                                                    <DropdownMenuItem style={{ color: "var(--ax-colors-fg-error)" }} onClick={() => setDeleteTarget(artifact)}>
                                                        <Box display="flex" alignItems="center" gap="8"><IconTrashCan size={14} />Delete</Box>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            </Box>
                                        </Td>
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>
                    )}

                    {/* Grid view */}
                    {viewMode === "grid" && filtered.length > 0 && (
                        <Box
                            display="grid"
                            gap="16"
                            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
                        >
                            {filtered.map((artifact) => (
                                <WorkspaceArtifactCard
                                    key={artifact.id}
                                    artifact={artifact}
                                    onOpen={(a) => { setOpenArtifact(a); setOpenMode("preview"); }}
                                    onShare={setShareArtifact}
                                    pinned={pinnedIds.has(artifact.id)}
                                    onTogglePin={togglePin}
                                />
                            ))}
                        </Box>
                    )}
                </Box>}

            </Box>

            {/* Share dialog */}
            <OpalShareDialog
                open={!!shareArtifact}
                onOpenChange={(open) => { if (!open) setShareArtifact(null); }}
                artifactTitle={shareArtifact?.name}
                artifactCreator={shareArtifact?.createdBy}
            />
        </>
    );
}

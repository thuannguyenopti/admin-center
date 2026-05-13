"use client";

import {
    Box,
    Text,
    Button,
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
    Card,
    SegmentedControl,
    SegmentedControlItem,
} from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { IconAgent } from "@optimizely/axiom-icons";
import {
    IconFile,
    IconImage,
    IconCode,
    IconTrashCan,
    IconDownload,
    IconEllipsisSolid,
    IconCodeBranch,
    IconGrid,
    IconList,
    IconArrowsMaximize,
    IconCheck,
    IconPenLine,
    IconChevronUp,
    IconChevronDown,
    IconArrowUpRightFromSquare,
    IconChartColumn,
    IconPresentationScreen,
    IconFileSpreadsheet,
    IconComments,
    IconInboxFull,
    IconThumbtack,
    IconUsers,
} from "@optiaxiom/icons";
import { Input } from "@/app/components/Input";
import { useState, useMemo } from "react";
import { ArtifactViewer, type ArtifactViewerArtifact } from "./components/ArtifactViewer";

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
type SortKey = "name" | "created" | "size" | "version" | "status";
type SortDir = "asc" | "desc";

type Artifact = {
    id: string;
    name: string;
    type: ArtifactType;
    source: { name: string; type: ArtifactSourceType; link?: string };
    createdBy: { name: string; avatar: string };
    sharedWithTeam?: boolean;
    sharedWith?: { name: string; avatar: string }[];
    created: string;
    createdRaw: number;   // timestamp for sorting
    size: string;
    sizeRaw: number;      // bytes for sorting
    status: "Ready" | "Generating" | "Failed";
    version: string;
    description: string;
    imageUrl?: string;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const artifacts: Artifact[] = [
    {
        id: "1",
        name: "Q2 Email Campaign Copy — Final Draft",
        type: "Document",
        source: { name: "Write an email campaign", type: "chat", link: "/opal/chat/1" },
        createdBy: { name: "Jamie Chen", avatar: "/avatars/jc.png" },
        sharedWithTeam: true,
        created: "May 5, 2026",
        createdRaw: 1777932000,   // 2h ago
        size: "12 KB",
        sizeRaw: 12288,
        status: "Ready",
        version: "1.2",
        description: "Enterprise renewal email with ROI focus and 15% discount offer.",
        imageUrl: "/cmp/assets/recommendation/search-01-image.jpg",
    },
    {
        id: "2",
        name: "Competitor Analysis Report",
        type: "Report",
        source: { name: "Analyze my competitors", type: "agent", link: "/opal/agents/setup?id=2" },
        createdBy: { name: "Jamie Chen", avatar: "/avatars/jc.png" },
        sharedWithTeam: true,
        created: "May 5, 2026",
        createdRaw: 1777917600,   // 6h ago
        size: "48 KB",
        sizeRaw: 49152,
        status: "Ready",
        version: "1.0",
        description: "Deep-dive on 5 key competitors with positioning matrix.",
        imageUrl: "/cmp/assets/recommendation/panel-05-image.jpg",
    },
    {
        id: "3",
        name: "Hero Banner — Spring Sale Promotion 2025",
        type: "Image",
        source: { name: "Generate ad variations", type: "agent", link: "/opal/agents/setup?id=3" },
        createdBy: { name: "William Mo.", avatar: "/avatars/user2.png" },
        sharedWithTeam: true,
        created: "May 4, 2026",
        createdRaw: 1777852800,   // 1d ago
        size: "1.2 MB",
        sizeRaw: 1258291,
        status: "Ready",
        version: "2.1",
        description: "Spring sale hero with 4 A/B variants.",
        imageUrl: "/cmp/assets/recommendation/search-04-image.jpg",
    },
    {
        id: "4",
        name: "SEO Audit Summary",
        type: "Document",
        source: { name: "Audit my SEO performance", type: "chat", link: "/opal/chat/4" },
        createdBy: { name: "William Mo.", avatar: "/avatars/user2.png" },
        sharedWithTeam: true,
        created: "May 2, 2026",
        createdRaw: 1777680000,   // 3d ago
        size: "24 KB",
        sizeRaw: 24576,
        status: "Ready",
        version: "1.0",
        description: "Site-wide SEO health report with recommendations.",
        imageUrl: "/cmp/assets/recommendation/panel-02-image.jpg",
    },
    {
        id: "5",
        name: "A/B Test Variants — Checkout CTA",
        type: "Code",
        source: { name: "Set up an A/B experiment", type: "chat", link: "/opal/chat/5" },
        createdBy: { name: "Jamie Chen", avatar: "/avatars/jc.png" },
        sharedWith: [{ name: "William Mo.", avatar: "/avatars/user2.png" }, { name: "Mary Anne", avatar: "/avatars/user.png" }, { name: "Sarah K.", avatar: "/avatars/user3.png" }],
        created: "Apr 30, 2026",
        createdRaw: 1777507200,   // 5d ago
        size: "3 KB",
        sizeRaw: 3072,
        status: "Ready",
        version: "1.3",
        description: "Three CTA copy variants with tracking snippets.",
        imageUrl: "/cmp/assets/recommendation/search-02-image.jpg",
    },
    {
        id: "6",
        name: "Content Calendar — April",
        type: "Spreadsheet",
        source: { name: "Build a content calendar", type: "chat", link: "/opal/chat/6" },
        createdBy: { name: "Jamie Chen", avatar: "/avatars/jc.png" },
        sharedWithTeam: true,
        created: "Apr 28, 2026",
        createdRaw: 1777334400,   // 1w ago
        size: "8 KB",
        sizeRaw: 8192,
        status: "Ready",
        version: "1.1",
        description: "April editorial schedule across all channels.",
        imageUrl: "/cmp/assets/recommendation/panel-03-image.jpg",
    },
    {
        id: "7",
        name: "GEO Keyword Recommendations",
        type: "Document",
        source: { name: "GEO Recommendations", type: "workflow", link: "/opal/workflows/7" },
        createdBy: { name: "William Mo.", avatar: "/avatars/user2.png" },
        sharedWithTeam: true,
        created: "Apr 21, 2026",
        createdRaw: 1776729600,   // 2w ago
        size: "16 KB",
        sizeRaw: 16384,
        status: "Ready",
        version: "1.0",
        description: "Top 40 GEO keywords ranked by opportunity score.",
        imageUrl: "/cmp/assets/recommendation/search-03-image.jpg",
    },
    {
        id: "8",
        name: "Campaign Asset Bundle",
        type: "Image",
        source: { name: "ABM Campaign Workflow", type: "workflow", link: "/opal/workflows/8" },
        createdBy: { name: "Jamie Chen", avatar: "/avatars/jc.png" },
        sharedWith: [{ name: "William Mo.", avatar: "/avatars/user2.png" }, { name: "Mary Anne", avatar: "/avatars/user.png" }],
        created: "Apr 14, 2026",
        createdRaw: 1776124800,   // 3w ago
        size: "5.8 MB",
        sizeRaw: 6082150,
        status: "Ready",
        version: "3.0",
        description: "Full ABM campaign pack: banners, email headers, social.",
        imageUrl: "/cmp/assets/recommendation/search-07-image.jpg",
    },
    {
        id: "9",
        name: "Meeting Notes — Weekly Product Sync",
        type: "Document",
        source: { name: "Summarize my meeting notes", type: "chat", link: "/opal/chat/9" },
        createdBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
        sharedWithTeam: true,
        created: "Apr 5, 2026",
        createdRaw: 1775347200,   // 1mo ago
        size: "6 KB",
        sizeRaw: 6144,
        status: "Generating",
        version: "1.0",
        description: "Structured action items and decisions from product sync.",
        imageUrl: "/cmp/assets/recommendation/panel-04-image.jpg",
    },
    {
        id: "10",
        name: "Localized Copy — FR",
        type: "Document",
        source: { name: "Content Localizer", type: "agent", link: "/opal/agents/setup?id=10" },
        createdBy: { name: "Jamie Chen", avatar: "/avatars/jc.png" },
        sharedWith: [{ name: "Sarah K.", avatar: "/avatars/user3.png" }],
        created: "Mar 21, 2026",
        createdRaw: 1774051200,   // 45d ago
        size: "10 KB",
        sizeRaw: 10240,
        status: "Failed",
        version: "1.0",
        description: "French localization of Q2 campaign copy.",
        imageUrl: "/cmp/assets/recommendation/search-05-image.jpg",
    },
    {
        id: "11",
        name: "Q1 Sales Deck",
        type: "Presentation",
        source: { name: "Sales enablement agent", type: "agent", link: "/opal/agents/setup?id=11" },
        createdBy: { name: "Jamie Chen", avatar: "/avatars/jc.png" },
        created: "Apr 25, 2026",
        createdRaw: 1777075200,   // 10d ago
        size: "2.4 MB",
        sizeRaw: 2516582,
        status: "Ready",
        version: "2.0",
        description: "Exec-level Q1 readout with pipeline and ARR highlights.",
        imageUrl: "/cmp/assets/recommendation/panel-01-image.jpg",
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const typeIcon: Record<ArtifactType, React.ReactNode> = {
    Document: <IconFile size={16} />,
    Image: <IconImage size={16} />,
    Code: <IconCode size={16} />,
    Presentation: <IconPresentationScreen size={16} />,
    Spreadsheet: <IconFileSpreadsheet size={16} />,
    Report: <IconChartColumn size={16} />,
};

const typeIconSm: Record<ArtifactType, React.ReactNode> = {
    Document:     <IconFile size={16} />,
    Image:        <IconImage size={16} />,
    Code:         <IconCode size={16} />,
    Presentation: <IconPresentationScreen size={16} />,
    Spreadsheet:  <IconFileSpreadsheet size={16} />,
    Report:       <IconChartColumn size={16} />,
};

const typeIconMd: Record<ArtifactType, React.ReactNode> = {
    Document:     <IconFile size={20} />,
    Image:        <IconImage size={20} />,
    Code:         <IconCode size={20} />,
    Presentation: <IconPresentationScreen size={20} />,
    Spreadsheet:  <IconFileSpreadsheet size={20} />,
    Report:       <IconChartColumn size={20} />,
};

// Type label shown in the badge on pinned cards (matches Figma)
const typeBadgeLabel: Record<ArtifactType, string> = {
    Document: "Text",
    Code: "Interactive",
    Image: "Image",
    Presentation: "Presentation",
    Spreadsheet: "Spreadsheet",
    Report: "Report",
};

// Default pinned IDs (seeded from artifacts that have a preview image)
// IDs 8 + 10 are JC-only (no team share); rest are shared — mix intentional for demo
const DEFAULT_PINNED_IDS = new Set(["1", "2", "3", "5", "8", "10"]);

const statusIntent = {
    Ready: "success",
    Generating: "information",
    Failed: "danger",
} as const;

const allCreators = [...new Set(artifacts.map((a) => a.createdBy.name))];
const allSourceTypes: Array<"All" | ArtifactSourceType> = ["All", "chat", "agent", "workflow"];
const allTypes: Array<"All" | ArtifactType> = ["All", "Document", "Image", "Code", "Presentation", "Spreadsheet", "Report"];

// ─── Pin toggle cell ─────────────────────────────────────────────────────────

function PinCell({ pinned, onToggle }: { pinned: boolean; onToggle: () => void }) {
    const [hovered, setHovered] = useState(false);
    const visible = pinned || hovered;
    return (
        <Box
            style={{
                width: 32,
                height: "100%",
                minHeight: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
        >
            <Tooltip content={pinned ? "Unpin" : "Pin"} delayDuration={300}>
                <span style={{
                    display: "inline-flex",
                    opacity: visible ? 1 : 0,
                    pointerEvents: visible ? "auto" : "none",
                    transition: "opacity 0.15s",
                }}>
                    <IconThumbtack
                        size={16}
                        color={pinned ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-tertiary)"}
                    />
                </span>
            </Tooltip>
        </Box>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SourceCell({ artifact, onOpen }: { artifact: Artifact; onOpen: (a: Artifact) => void }) {
    const [hovered, setHovered] = useState(false);
    return (
        <Box
            display="flex"
            flexDirection="column"
            gap="2"
            color="fg.secondary"
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={(e) => { e.stopPropagation(); onOpen(artifact); }}
        >
            <Box display="flex" alignItems="center" gap="6">
                {artifact.source.type === "workflow" ? (
                    <IconCodeBranch size={16} />
                ) : artifact.source.type === "chat" ? (
                    <IconComments size={16} />
                ) : (
                    <IconAgent size={16} />
                )}
                <Text fontSize="md" style={artifact.source.type !== "chat" ? { textDecorationLine: "underline", textDecorationColor: "var(--ax-colors-border-secondary)" } : undefined}>
                    {artifact.source.type === "chat" ? "Chat" : artifact.source.name}
                </Text>
                {artifact.source.type !== "chat" && (
                    <Box style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}>
                        <IconArrowUpRightFromSquare size={11} />
                    </Box>
                )}
            </Box>
            {artifact.source.type === "chat" && (
                <Box display="flex" alignItems="center">
                    <Box style={{
                        width: 16,
                        height: 10,
                        borderLeft: "1px solid var(--ax-colors-border-secondary)",
                        borderBottom: "1px solid var(--ax-colors-border-secondary)",
                        borderBottomLeftRadius: 3,
                        flexShrink: 0,
                        marginRight: 6,
                    }} />
                    <Text fontSize="sm" color="fg.tertiary" style={{ textDecorationLine: "underline", textDecorationColor: "var(--ax-colors-border-secondary)" }}>
                        {artifact.source.name}
                    </Text>
                </Box>
            )}
        </Box>
    );
}

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

// ─── Content thumbnails for non-image types ──────────────────────────────────

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

function ReportThumbnail() {
    const kpis = [{ v: "5", l: "Competitors" }, { v: "−12%", l: "Gap" }, { v: "3.2×", l: "Velocity" }];
    const rows = [
        { name: "AlphaCloud",  share: "34%", seo: 82, intent: "danger"  as const, t: "High"   },
        { name: "CoreMetrics", share: "21%", seo: 71, intent: "warning" as const, t: "Medium" },
        { name: "FlowStack",   share: "18%", seo: 65, intent: "neutral" as const, t: "Low"    },
    ];
    return (
        <Box style={{ padding: "10px 12px", height: "100%", background: "var(--ax-colors-bg-secondary)", overflow: "hidden", display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Mini KPIs */}
            <Box style={{ display: "flex", gap: 6 }}>
                {kpis.map((k) => (
                    <Box key={k.l} bg="bg.default" border="1" borderColor="border.tertiary" rounded="md" style={{ flex: 1, padding: "5px 7px" }}>
                        <Text fontSize="sm" fontWeight="700">{k.v}</Text>
                        <Text fontSize="sm" color="fg.tertiary">{k.l}</Text>
                    </Box>
                ))}
            </Box>
            {/* Mini table */}
            <Box bg="bg.default" border="1" borderColor="border.tertiary" rounded="md" overflow="hidden">
                <Box bg="bg.secondary" style={{ display: "flex", padding: "3px 7px", borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}>
                    {["Company", "Share", "SEO", "Threat"].map((h) => (
                        <Box key={h} style={{ flex: h === "Company" ? 2 : 1 }}>
                            <Text fontSize="sm" color="fg.tertiary" fontWeight="600">{h}</Text>
                        </Box>
                    ))}
                </Box>
                {rows.map((r, i) => (
                    <Box key={r.name} style={{ display: "flex", alignItems: "center", padding: "3px 7px", borderTop: i > 0 ? "1px solid var(--ax-colors-border-tertiary)" : undefined }}>
                        <Box style={{ flex: 2 }}><Text fontSize="sm">{r.name}</Text></Box>
                        <Box style={{ flex: 1 }}><Text fontSize="sm">{r.share}</Text></Box>
                        <Box style={{ flex: 1 }}><Text fontSize="sm">{r.seo}</Text></Box>
                        <Box style={{ flex: 1 }}>
                            <Badge intent={r.intent}>{r.t}</Badge>
                        </Box>
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
        ["Apr 14", "Instagram Stories",      "Social", "Scheduled", "Mary A."],
    ];
    const statusColor: Record<string, string> = {
        Draft: "var(--ax-colors-fg-tertiary)",
        Scheduled: "var(--ax-colors-fg-success)",
        Review: "var(--ax-colors-fg-warning)",
    };
    return (
        <Box bg="bg.default" style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {/* Header row */}
            <Box style={{ display: "flex", background: "var(--ax-colors-bg-secondary)", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
                {headers.map((h) => (
                    <Box key={h} style={{ flex: h === "Title" ? 2 : 1, padding: "4px 6px", borderRight: "1px solid var(--ax-colors-border-tertiary)" }}>
                        <Text fontSize="sm" fontWeight="600" color="fg.secondary">{h}</Text>
                    </Box>
                ))}
            </Box>
            {/* Data rows */}
            {rows.map((row, i) => (
                <Box key={i} style={{ display: "flex", borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}>
                    {row.map((cell, j) => (
                        <Box key={j} style={{ flex: j === 1 ? 2 : 1, padding: "4px 6px", borderRight: "1px solid var(--ax-colors-border-tertiary)" }}>
                            <Text fontSize="sm" color={j === 3 ? undefined : "fg.default"} style={{ color: j === 3 ? statusColor[cell] ?? "inherit" : undefined, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", display: "block" }}>
                                {cell}
                            </Text>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
}

// ─── Sharing avatar stack + Only You badge ────────────────────────────────────

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

function OnlyYouBadge() {
    return <Badge style={{ flexShrink: 0 }}>Only you</Badge>;
}

// ─── Grid view components ─────────────────────────────────────────────────────

function ArtifactPreviewCard({
    artifact,
    onOpen,
    pinned,
    onTogglePin,
    cardLayout = "thumbnail",
    timeOnNewRow = false,
}: {
    artifact: Artifact;
    onOpen: (a: Artifact) => void;
    pinned: boolean;
    onTogglePin: (id: string) => void;
    /** "thumbnail" — avatar on thumbnail; "footer" — avatar in footer row; "hover-expand" — footer expands on hover to show full name + avatar + time + source */
    cardLayout?: "thumbnail" | "footer" | "hover-expand";
    /** hover-expand only: time shows bottom-right at rest, drops to new row on hover */
    timeOnNewRow?: boolean;
}) {
    const [hovered, setHovered] = useState(false);
    const [sourceHovered, setSourceHovered] = useState(false);

    const btnStyle: React.CSSProperties = {
        background: "var(--ax-colors-bg-default)",
        borderColor: "var(--ax-colors-border-secondary)",
        height: 24, width: 24, padding: 0,
    };

    return (
        <Box
            bg="bg.default"
            border="1"
            borderColor={hovered ? "border.secondary" : "border.tertiary"}
            display="flex"
            flexDirection="column"
            overflow="hidden"
            rounded="xl"
            style={{
                cursor: "pointer",
                transition: "border-color 0.15s",
                ...(cardLayout === "hover-expand" ? { height: 240 } : {}),
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onOpen(artifact)}
        >
            {/* ── Thumbnail ── */}
            <Box style={{
                position: "relative",
                overflow: "hidden",
                ...(cardLayout === "hover-expand" ? { flex: 1 } : { height: 140, flexShrink: 0 }),
            }}>
                {/* Cover image / generated preview */}
                {artifact.type === "Image" || artifact.type === "Presentation" ? (
                    <img
                        alt={artifact.name}
                        src={artifact.imageUrl ?? "/cmp/assets/recommendation/panel-01-image.jpg"}
                        style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
                    />
                ) : artifact.type === "Report" ? (
                    <ReportThumbnail />
                ) : artifact.type === "Spreadsheet" ? (
                    <SpreadsheetThumbnail />
                ) : (
                    <DocThumbnail />
                )}

                {/* Hover overlay — ellipsis only */}
                <Box style={{
                    position: "absolute", inset: 0,
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: hovered ? "blur(3px)" : "blur(0px)",
                    opacity: hovered ? 1 : 0,
                    transition: "opacity 0.4s, backdrop-filter 0.4s",
                    pointerEvents: hovered ? "auto" : "none",
                    display: "flex", alignItems: "flex-start", justifyContent: "flex-end",
                    padding: "10px",
                }}>
                    <Box onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button appearance="default" size="sm" aria-label="Options" style={btnStyle} icon={<IconEllipsisSolid size={13} />} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onOpen(artifact)}>
                                    <Box display="flex" alignItems="center" gap="8"><IconArrowsMaximize size={14} />Open</Box>
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
                                <DropdownMenuItem>
                                    <Box display="flex" alignItems="center" gap="8"><IconPenLine size={14} />Rename</Box>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTogglePin(artifact.id); }}>
                                    <Box display="flex" alignItems="center" gap="8"><IconThumbtack size={14} />{pinned ? "Unpin" : "Pin"}</Box>
                                </DropdownMenuItem>
                                <Box style={{ height: 1, background: "var(--ax-colors-border-default)", margin: "4px 12px" }} />
                                <DropdownMenuItem style={{ color: "var(--ax-colors-fg-error)" }}>
                                    <Box display="flex" alignItems="center" gap="8"><IconTrashCan size={14} />Delete</Box>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Box>
                </Box>

                {/* Avatar + username — above blur, bottom-left (thumbnail layout only) */}
                {cardLayout === "thumbnail" && (
                    <Box style={{
                        position: "absolute", left: 12, bottom: 12,
                        display: "flex", alignItems: "center", gap: 6,
                        pointerEvents: "none",
                    }}>
                        {artifact.sharedWithTeam ? (
                            <AvatarGroup>
                                <Avatar name={artifact.createdBy.name} src={artifact.createdBy.avatar} size="sm" colorScheme="purple" border="2" style={{ borderColor: "white", flexShrink: 0 }} />
                                <Avatar fallback="team" size="sm" colorScheme="neutral" border="2" style={{ borderColor: "white", flexShrink: 0 }} />
                            </AvatarGroup>
                        ) : artifact.sharedWith && artifact.sharedWith.length > 0 ? (
                            <AvatarGroup>
                                <Avatar name={artifact.createdBy.name} src={artifact.createdBy.avatar} size="sm" colorScheme="purple" border="2" style={{ borderColor: "white", flexShrink: 0 }} />
                                <Avatar name={artifact.sharedWith[0].name} src={artifact.sharedWith[0].avatar} size="sm" colorScheme="neutral" border="2" style={{ borderColor: "white", flexShrink: 0 }} />
                                {artifact.sharedWith.length > 1 && <Avatar size="sm" colorScheme="neutral" border="2" style={{ borderColor: "white", flexShrink: 0 }}>{`+${artifact.sharedWith.length - 1}`}</Avatar>}
                            </AvatarGroup>
                        ) : (
                            <Avatar name={artifact.createdBy.name} src={artifact.createdBy.avatar} size="sm" colorScheme="purple" border="2" style={{ borderColor: "white", flexShrink: 0 }} />
                        )}
                        <Text
                            fontSize="sm"
                            fontWeight="400"
                            color="fg.white"
                            style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 100,
                                opacity: hovered ? 1 : 0,
                                transition: "opacity 0.3s ease",
                            }}
                        >
                            {(artifact.sharedWithTeam || artifact.sharedWith) ? "(Shared)" : artifact.createdBy.name}
                        </Text>
                    </Box>
                )}
            </Box>

            {/* ── Footer — static, no transition ── */}
            <Box
                display="flex"
                flexDirection="column"
                gap="4"
                style={{ flexShrink: 0, borderTop: "1px solid var(--ax-colors-border-tertiary)", padding: `10px 12px ${hovered ? 10 : 0}px` }}
                onClick={(e) => e.stopPropagation()}
            >
                {cardLayout === "hover-expand" ? (
                    /* hover-expand layout: compact default, expands on hover to show full name + avatar + time + source */
                    <Box display="flex" flexDirection="column" gap="8">
                        {/* Row 1: icon inline with text so wrapped lines start at the left edge */}
                        <Text
                            fontSize={hovered ? "lg" : "md"}
                            fontWeight="500"
                            style={{
                                overflow: "hidden",
                                whiteSpace: hovered ? "normal" : "nowrap",
                                wordBreak: "break-word",
                            }}
                        >
                            <Box asChild display="inline-flex" alignItems="center" color="fg.tertiary" style={{ marginRight: 6, verticalAlign: "middle" }}>
                                <span>{hovered ? typeIconMd[artifact.type] : typeIconSm[artifact.type]}</span>
                            </Box>
                            {hovered ? artifact.name : truncateMiddle(artifact.name)}
                        </Text>
                        {/* Row 2: avatar (left) + badge/name slides in on hover | time bottom-right always */}
                        <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
                            <Box display="flex" alignItems="center" gap="6" style={{ minWidth: 0 }}>
                                <ArtifactAvatarStack artifact={artifact} size="xs" />
                                {!artifact.sharedWithTeam && !artifact.sharedWith && (
                                    <OnlyYouBadge />
                                )}
                                {(artifact.sharedWithTeam || artifact.sharedWith) && (
                                    <Text fontSize="sm" color="fg.secondary" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: hovered ? 120 : 0, opacity: hovered ? 1 : 0, transition: "max-width 0.2s ease, opacity 0.2s ease" }}>
                                        (Shared)
                                    </Text>
                                )}
                            </Box>
                            {/* time: bottom-right always; hides and drops to new row on hover when timeOnNewRow */}
                            <Text fontSize="sm" color="fg.tertiary" style={{ flexShrink: 0, maxWidth: (timeOnNewRow && hovered) ? 0 : 80, opacity: (timeOnNewRow && hovered) ? 0 : 1, overflow: "hidden", transition: "max-width 0.2s ease, opacity 0.2s ease" }}>{timeAgo(artifact.createdRaw)}</Text>
                        </Box>
                        {/* Row 3: time on new row — only for timeOnNewRow cards, slides in on hover */}
                        {timeOnNewRow && (
                            <Box style={{ maxHeight: hovered ? 20 : 0, opacity: hovered ? 1 : 0, overflow: "hidden", transition: "max-height 0.2s ease, opacity 0.2s ease" }}>
                                <Text fontSize="sm" color="fg.tertiary">{timeAgo(artifact.createdRaw)}</Text>
                            </Box>
                        )}
                        {/* Row 3/4: source — fades in on hover */}
                        <Box
                            display="flex"
                            alignItems="center"
                            gap="4"
                            color="fg.tertiary"
                            style={{
                                maxHeight: hovered ? 24 : 0,
                                opacity: hovered ? 1 : 0,
                                overflow: "hidden",
                                transition: "max-height 0.2s ease, opacity 0.2s ease",
                            }}
                        >
                            <Box style={{ flexShrink: 0, lineHeight: 0 }}>
                                {artifact.source.type === "workflow" ? <IconCodeBranch size={13} /> : artifact.source.type === "chat" ? <IconComments size={13} /> : <IconAgent size={13} />}
                            </Box>
                            <Text fontSize="sm" color="fg.tertiary" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecorationLine: sourceHovered ? "underline" : "none", cursor: "pointer" }} onMouseEnter={() => setSourceHovered(true)} onMouseLeave={() => setSourceHovered(false)}>
                                {artifact.source.type === "chat" ? "Chat" : artifact.source.name} →
                            </Text>
                        </Box>
                    </Box>
                ) : (
                    <>
                        {/* Row 1: file type icon + name (middle-truncated) */}
                        <Box display="flex" alignItems="center" gap="6">
                            <Box color="fg.tertiary" style={{ flexShrink: 0, lineHeight: 0 }}>
                                {typeIconSm[artifact.type]}
                            </Box>
                            <Text fontSize="md" fontWeight="500" style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                                {truncateMiddle(artifact.name)}
                            </Text>
                        </Box>
                        {/* Row 2: differs by layout */}
                        {cardLayout === "footer" ? (
                            /* footer layout: avatar + name left | time right; source on hover */
                            <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
                                {hovered ? (
                                    <Box display="flex" alignItems="center" gap="4" color="fg.tertiary" style={{ minWidth: 0 }}>
                                        <Box style={{ flexShrink: 0, lineHeight: 0 }}>
                                            {artifact.source.type === "workflow" ? <IconCodeBranch size={13} /> : artifact.source.type === "chat" ? <IconComments size={13} /> : <IconAgent size={13} />}
                                        </Box>
                                        <Text fontSize="sm" color="fg.tertiary" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecorationLine: sourceHovered ? "underline" : "none", cursor: "pointer" }} onMouseEnter={() => setSourceHovered(true)} onMouseLeave={() => setSourceHovered(false)}>
                                            {artifact.source.type === "chat" ? "Chat" : artifact.source.name} →
                                        </Text>
                                    </Box>
                                ) : (
                                    <>
                                        <Box display="flex" alignItems="center" gap="6" style={{ minWidth: 0 }}>
                                            <ArtifactAvatarStack artifact={artifact} size="2xs" />
                                            <Text fontSize="sm" color="fg.secondary" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {artifact.createdBy.name}{artifact.sharedWithTeam ? " (Shared)" : ""}
                                            </Text>
                                        </Box>
                                        <Text fontSize="sm" color="fg.tertiary" style={{ flexShrink: 0 }}>{timeAgo(artifact.createdRaw)}</Text>
                                    </>
                                )}
                            </Box>
                        ) : (
                            /* thumbnail layout: time by default → source on hover */
                            <Box display="flex" alignItems="center" gap="4" color="fg.tertiary">
                                {hovered ? (
                                    <>
                                        <Box style={{ flexShrink: 0, lineHeight: 0 }}>
                                            {artifact.source.type === "workflow" ? <IconCodeBranch size={13} /> : artifact.source.type === "chat" ? <IconComments size={13} /> : <IconAgent size={13} />}
                                        </Box>
                                        <Text fontSize="sm" color="fg.tertiary" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecorationLine: sourceHovered ? "underline" : "none", cursor: "pointer" }} onMouseEnter={() => setSourceHovered(true)} onMouseLeave={() => setSourceHovered(false)}>
                                            {artifact.source.type === "chat" ? "Chat" : artifact.source.name} →
                                        </Text>
                                    </>
                                ) : (
                                    <Text fontSize="sm" color="fg.tertiary">{timeAgo(artifact.createdRaw)}</Text>
                                )}
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
}

function CanvasArtifactCard({
    artifact,
    onOpen,
    pinned,
    onTogglePin,
}: {
    artifact: Artifact;
    onOpen: (a: Artifact) => void;
    pinned: boolean;
    onTogglePin: (id: string) => void;
}) {
    const [hovered, setHovered] = useState(false);
    const icon = typeIcon[artifact.type];
    return (
        <Box
            bg="bg.default"
            border="1"
            borderColor={hovered ? "border.secondary" : "border.tertiary"}
            display="flex"
            gap="12"
            alignItems="center"
            px="16"
            py="12"
            rounded="xl"
            style={{ cursor: "pointer", transition: "border-color 0.15s" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onOpen(artifact)}
        >
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                rounded="lg"
                style={{
                    width: 40,
                    height: 40,
                    background: "radial-gradient(circle at 20% 20%, var(--ax-colors-bg-secondary) 10%, var(--ax-colors-bg-information-light) 61%, var(--ax-colors-bg-accent-light) 85%)",
                    flexShrink: 0,
                }}
            >
                <Box color="fg.default">{icon}</Box>
            </Box>
            <Box display="flex" flexDirection="column" gap="2" style={{ flex: 1, minWidth: 0 }}>
                <Text fontSize="sm" fontWeight="600" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {artifact.name}
                </Text>
                <Text fontSize="sm" color="fg.secondary" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {artifact.description}
                </Text>
            </Box>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        appearance="subtle"
                        size="sm"
                        icon={<IconEllipsisSolid size={16} />}
                        aria-label="Options"
                        onClick={(e) => e.stopPropagation()}
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpen(artifact); }}>
                        <Box display="flex" alignItems="center" gap="8"><IconArrowsMaximize size={14} />Open</Box>
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
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Box display="flex" alignItems="center" gap="8"><IconPenLine size={14} />Rename</Box>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTogglePin(artifact.id); }}>
                        <Box display="flex" alignItems="center" gap="8"><IconThumbtack size={14} />{pinned ? "Unpin" : "Pin"}</Box>
                    </DropdownMenuItem>
                    <Box style={{ height: 1, background: "var(--ax-colors-border-default)", margin: "4px 12px" }} />
                    <DropdownMenuItem style={{ color: "var(--ax-colors-fg-error)" }} onClick={(e) => e.stopPropagation()}>
                        <Box display="flex" alignItems="center" gap="8"><IconTrashCan size={14} />Delete</Box>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </Box>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ArtifactsPage() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<"All" | ArtifactType>("All");
    const [creatorFilter, setCreatorFilter] = useState("All");
    const [sourceFilter, setSourceFilter] = useState<"All" | ArtifactSourceType>("All");
    const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
    const [activeTab, setActiveTab] = useState<"my" | "shared">("my");
    const [sortKey, setSortKey] = useState<SortKey>("created");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [deleteTarget, setDeleteTarget] = useState<Artifact | null>(null);
    const [openArtifact, setOpenArtifact] = useState<Artifact | null>(null);
    const [openMode, setOpenMode] = useState<"preview" | "with-panel">("preview");

    function openPreview(artifact: Artifact) {
        setOpenArtifact(artifact);
        setOpenMode("preview");
    }
    function openWithPanel(artifact: Artifact) {
        setOpenArtifact(artifact);
        setOpenMode("with-panel");
    }
    const [pinnedIds, setPinnedIds] = useState<Set<string>>(DEFAULT_PINNED_IDS);

    function togglePin(id: string) {
        setPinnedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function handleSort(key: SortKey) {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    }

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return artifacts
            .filter((a) => {
                if (typeFilter !== "All" && a.type !== typeFilter) return false;
                if (creatorFilter !== "All" && a.createdBy.name !== creatorFilter) return false;
                if (sourceFilter !== "All" && a.source.type !== sourceFilter) return false;
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
    }, [search, typeFilter, creatorFilter, sourceFilter, sortKey, sortDir]);

    const pinnedArtifacts = filtered.filter((a) => pinnedIds.has(a.id));
    const recentlyUpdated = filtered.filter((a) => !pinnedIds.has(a.id));

    // List view: pinned items float to the top, then rest in sort order
    const filteredForList = [...pinnedArtifacts, ...recentlyUpdated];

    const viewerArtifact: ArtifactViewerArtifact | null = openArtifact
        ? {
              id: openArtifact.id,
              name: openArtifact.name,
              type: openArtifact.type,
              sourceType: openArtifact.source.type,
              sourceName: openArtifact.source.name,
              sourceLink: openArtifact.source.link,
              createdBy: openArtifact.createdBy,
              created: openArtifact.created,
              status: openArtifact.status,
              version: openArtifact.version,
              imageUrl: openArtifact.imageUrl,
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

            {/* Delete confirmation dialog */}
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
                        <DialogClose>
                            <Button appearance="subtle">Cancel</Button>
                        </DialogClose>
                        <Button
                            appearance="default"
                            style={{ background: "var(--ax-colors-bg-error)", color: "white", borderColor: "var(--ax-colors-border-error)" }}
                            onClick={() => setDeleteTarget(null)}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Box display="flex" flexDirection="column" gap="24" overflow="auto" h="full">
                {/* ── Tabs ── */}
                <Box display="flex" gap="24" borderB="1" borderColor="border.tertiary">
                    {(["my", "shared"] as const).map((tab) => (
                        <Box
                            key={tab}
                            pb="12"
                            cursor="pointer"
                            display="flex"
                            alignItems="center"
                            gap="6"
                            borderB={activeTab === tab ? "2" : "0"}
                            onClick={() => setActiveTab(tab)}
                            style={activeTab === tab ? { borderBottomColor: "var(--ax-colors-fg-default)" } : {}}
                        >
                            {tab === "shared" && <IconUsers size={14} color={activeTab === tab ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)"} />}
                            <Text
                                fontWeight={activeTab === tab ? "500" : "400"}
                                color={activeTab === tab ? "fg.default" : "fg.secondary"}
                            >
                                {tab === "my" ? "My Artifacts" : "Shared with me"}
                            </Text>
                        </Box>
                    ))}
                </Box>

                {/* ── Toolbar ── */}
                <Box display="flex" justifyContent="space-between" alignItems="center" gap="12">
                    <Box display="flex" gap="12" alignItems="center" style={{ flexWrap: "wrap" }}>
                        {/* Search */}
                        <Box style={{ width: 264 }}>
                            <Input
                                placeholder="Search artifacts…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </Box>

                        {/* Type filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <LabelMenuButton label="Type">{typeFilter}</LabelMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {allTypes.map((t) => (
                                    <DropdownMenuItem key={t} onClick={() => setTypeFilter(t)}>
                                        <Box display="flex" alignItems="center" gap="8">
                                            {t !== "All" && typeIcon[t]}
                                            {t}
                                        </Box>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Created by filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <LabelMenuButton label="Created by">{creatorFilter}</LabelMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {["All", ...allCreators].map((c) => (
                                    <DropdownMenuItem key={c} onClick={() => setCreatorFilter(c)}>
                                        <Box display="flex" alignItems="center" gap="8">
                                            {c !== "All" && <Avatar name={c} size="sm" colorScheme="neutral" />}
                                            {c}
                                        </Box>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Source filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <LabelMenuButton label="Source">{sourceFilter === "All" ? "All" : sourceFilter}</LabelMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {allSourceTypes.map((s) => (
                                    <DropdownMenuItem key={s} onClick={() => setSourceFilter(s)}>
                                        <Box display="flex" alignItems="center" gap="8">
                                            {s === "chat" && <IconComments size={14} />}
                                            {s === "agent" && <IconAgent size={14} />}
                                            {s === "workflow" && <IconCodeBranch size={14} />}
                                            {s === "All" ? "All sources" : s.charAt(0).toUpperCase() + s.slice(1)}
                                        </Box>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Box>

                    {/* Right side */}
                    <Box display="flex" alignItems="center" gap="8">
                        {viewMode === "grid" && (
                            <Button appearance="subtle" size="sm">
                                <Box display="flex" alignItems="center" gap="6">
                                    Last Modified
                                    <IconChevronDown size={12} />
                                </Box>
                            </Button>
                        )}
                        <SegmentedControl
                            value={viewMode}
                            onValueChange={(v: string) => { if (v) setViewMode(v as "list" | "grid"); }}
                        >
                            <SegmentedControlItem value="list" icon={<IconList size={15} />} aria-label="List view" />
                            <SegmentedControlItem value="grid" icon={<IconGrid size={15} />} aria-label="Grid view" />
                        </SegmentedControl>
                    </Box>
                </Box>

                {/* Empty state */}
                {filtered.length === 0 && (
                    <Card>
                        <Box display="flex" flexDirection="column" gap="8" p="48" alignItems="center">
                            <Box color="fg.tertiary"><IconInboxFull size={32} /></Box>
                            <Text fontWeight="500">No artifacts match your filters</Text>
                            <Text color="fg.secondary" fontSize="sm">
                                Try adjusting the search or filter criteria.
                            </Text>
                            <Button
                                appearance="subtle"
                                size="sm"
                                onClick={() => { setSearch(""); setTypeFilter("All"); setCreatorFilter("All"); setSourceFilter("All"); }}
                            >
                                Clear filters
                            </Button>
                        </Box>
                    </Card>
                )}

                {/* ── LIST VIEW ── */}
                {viewMode === "list" && filteredForList.length > 0 && (
                    <Table>
                        <thead>
                            <Tr>
                                {/* Pin column — narrow */}
                                <Th style={{ width: 32, paddingRight: 0 }}></Th>
                                <SortHeader label="Name" sortKey="name" current={sortKey} dir={sortDir} onSort={handleSort} />
                                <Th>Type</Th>
                                <Th>Source</Th>
                                <Th>Created by</Th>
                                <SortHeader label="Created" sortKey="created" current={sortKey} dir={sortDir} onSort={handleSort} />
                                <SortHeader label="Version" sortKey="version" current={sortKey} dir={sortDir} onSort={handleSort} />
                                <SortHeader label="Size" sortKey="size" current={sortKey} dir={sortDir} onSort={handleSort} />
                                <SortHeader label="Status" sortKey="status" current={sortKey} dir={sortDir} onSort={handleSort} />
                                <Th></Th>
                            </Tr>
                        </thead>
                        <tbody>
                            {filteredForList.map((artifact) => (
                                <Tr
                                    key={artifact.id}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => openPreview(artifact)}
                                >
                                    {/* Pin toggle */}
                                    <Td style={{ width: 32, paddingRight: 0, verticalAlign: "middle" }}>
                                        <PinCell pinned={pinnedIds.has(artifact.id)} onToggle={() => togglePin(artifact.id)} />
                                    </Td>
                                    <Td>
                                        <Text fontWeight="500">{artifact.name}</Text>
                                        {artifact.description && (
                                            <Text fontSize="sm" color="fg.tertiary" style={{ marginTop: 2 }}>
                                                {artifact.description}
                                            </Text>
                                        )}
                                    </Td>
                                    {/* Type — icon + label */}
                                    <Td>
                                        <Box display="flex" alignItems="center" gap="6" color="fg.secondary">
                                            {typeIcon[artifact.type]}
                                            <Text fontSize="md">{artifact.type}</Text>
                                        </Box>
                                    </Td>
                                    <Td><SourceCell artifact={artifact} onOpen={openWithPanel} /></Td>
                                    <Td>
                                        <Box display="flex" alignItems="center" gap="8">
                                            <ArtifactAvatarStack artifact={artifact} size="sm" />
                                            {!artifact.sharedWithTeam && !artifact.sharedWith && <Text fontSize="sm">{artifact.createdBy.name}</Text>}
                                            {(artifact.sharedWithTeam || artifact.sharedWith) && <Text fontSize="sm">{artifact.createdBy.name} (Shared)</Text>}
                                        </Box>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm">{artifact.created}</Text>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm" color="fg.secondary">v{artifact.version}</Text>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm" color="fg.secondary">{artifact.size}</Text>
                                    </Td>
                                    <Td>
                                        <Badge intent={statusIntent[artifact.status]}>
                                            {artifact.status}
                                        </Badge>
                                    </Td>
                                    <Td type="button">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    appearance="subtle"
                                                    size="sm"
                                                    icon={<IconEllipsisSolid size={16} />}
                                                    aria-label="Options"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openPreview(artifact); }}>
                                                    <Box display="flex" alignItems="center" gap="8">
                                                        <IconArrowsMaximize size={14} />
                                                        Open
                                                    </Box>
                                                </DropdownMenuItem>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>
                                                        <Box display="flex" alignItems="center" gap="8">
                                                            <IconDownload size={14} />
                                                            Download as
                                                        </Box>
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        {["Markdown (.md)", "PDF (.pdf)", "Word (.docx)", "Plain text (.txt)"].map((fmt) => (
                                                            <DropdownMenuItem key={fmt}>{fmt}</DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                    <Box display="flex" alignItems="center" gap="8">
                                                        <IconPenLine size={14} />
                                                        Rename
                                                    </Box>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); togglePin(artifact.id); }}>
                                                    <Box display="flex" alignItems="center" gap="8">
                                                        <IconThumbtack size={14} />
                                                        {pinnedIds.has(artifact.id) ? "Unpin" : "Pin"}
                                                    </Box>
                                                </DropdownMenuItem>
                                                <Box style={{ height: 1, background: "var(--ax-colors-border-default)", margin: "4px 12px" }} />
                                                <DropdownMenuItem
                                                    style={{ color: "var(--ax-colors-fg-error)" }}
                                                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(artifact); }}
                                                >
                                                    <Box display="flex" alignItems="center" gap="8">
                                                        <IconTrashCan size={14} />
                                                        Delete
                                                    </Box>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </Td>
                                </Tr>
                            ))}
                        </tbody>
                    </Table>
                )}

                {/* ── GRID VIEW ── */}
                {viewMode === "grid" && filtered.length > 0 && (
                    <Box display="flex" flexDirection="column" gap="24">
                        {/* Pinned section */}
                        {pinnedArtifacts.length > 0 && (
                            <Box display="flex" flexDirection="column" gap="12">
                                <Box display="flex" alignItems="center" gap="6">
                                    <Box color="fg.tertiary" style={{ lineHeight: 0 }}><IconThumbtack size={13} /></Box>
                                    <Text fontSize="md" fontWeight="600" color="fg.secondary">Pinned</Text>
                                </Box>
                                <Box
                                    display="grid"
                                    gap="12"
                                    style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
                                >
                                    {pinnedArtifacts.map((a) => (
                                        <ArtifactPreviewCard key={a.id} artifact={a} onOpen={setOpenArtifact} pinned={pinnedIds.has(a.id)} onTogglePin={togglePin} cardLayout="hover-expand" timeOnNewRow />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Recently Updated section */}
                        {recentlyUpdated.length > 0 && (
                            <Box display="flex" flexDirection="column" gap="12">
                                <Text fontSize="md" fontWeight="600" color="fg.secondary">Recently Updated</Text>
                                <Box
                                    display="grid"
                                    gap="10"
                                    style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
                                >
                                    {recentlyUpdated.map((a) => (
                                        <ArtifactPreviewCard key={a.id} artifact={a} onOpen={setOpenArtifact} pinned={pinnedIds.has(a.id)} onTogglePin={togglePin} cardLayout="hover-expand" timeOnNewRow />
                                    ))}
                                </Box>
                            </Box>
                        )}

                    </Box>
                )}
            </Box>
        </>
    );
}

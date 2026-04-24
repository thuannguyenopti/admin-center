"use client";

import {
    Box,
    Text,
    Button,
    Badge,
    Avatar,
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
    Tabs,
    TabsList,
    TabsTrigger,
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
    IconCheck,
    IconPenLine,
    IconChevronUp,
    IconChevronDown,
    IconArrowUpRightFromSquare,
    IconChartColumn,
    IconPresentationScreen,
    IconFileSpreadsheet,
    IconSearch,
    IconInboxFull,
    IconThumbtack,
    IconUsers,
} from "@optimizely/axiom-icons";
import { Input } from "@/app/components/Input";
import { useState, useMemo } from "react";
import { ArtifactViewer, type ArtifactViewerArtifact } from "./components/ArtifactViewer";

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
        name: "Q2 Email Campaign Copy",
        type: "Document",
        source: { name: "Write an email campaign", type: "chat", link: "/opal/chat/1" },
        createdBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
        created: "Mar 28, 2026",
        createdRaw: 1743120000,
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
        createdBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
        created: "Mar 25, 2026",
        createdRaw: 1742860800,
        size: "48 KB",
        sizeRaw: 49152,
        status: "Ready",
        version: "1.0",
        description: "Deep-dive on 5 key competitors with positioning matrix.",
        imageUrl: "/cmp/assets/recommendation/panel-05-image.jpg",
    },
    {
        id: "3",
        name: "Hero Banner — Spring Sale",
        type: "Image",
        source: { name: "Generate ad variations", type: "agent", link: "/opal/agents/setup?id=3" },
        createdBy: { name: "William Mo.", avatar: "/avatars/user2.png" },
        created: "Mar 22, 2026",
        createdRaw: 1742601600,
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
        source: { name: "Audit my SEO performance", type: "agent", link: "/opal/agents/setup?id=4" },
        createdBy: { name: "William Mo.", avatar: "/avatars/user2.png" },
        created: "Mar 20, 2026",
        createdRaw: 1742428800,
        size: "24 KB",
        sizeRaw: 24576,
        status: "Ready",
        version: "1.0",
        description: "Site-wide SEO health report with recommendations.",
    },
    {
        id: "5",
        name: "A/B Test Variants — Checkout CTA",
        type: "Code",
        source: { name: "Set up an A/B experiment", type: "chat", link: "/opal/chat/5" },
        createdBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
        created: "Mar 18, 2026",
        createdRaw: 1742256000,
        size: "3 KB",
        sizeRaw: 3072,
        status: "Ready",
        version: "1.3",
        description: "Three CTA copy variants with tracking snippets.",
    },
    {
        id: "6",
        name: "Content Calendar — April",
        type: "Spreadsheet",
        source: { name: "Build a content calendar", type: "chat", link: "/opal/chat/6" },
        createdBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
        created: "Mar 15, 2026",
        createdRaw: 1741996800,
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
        created: "Mar 12, 2026",
        createdRaw: 1741737600,
        size: "16 KB",
        sizeRaw: 16384,
        status: "Ready",
        version: "1.0",
        description: "Top 40 GEO keywords ranked by opportunity score.",
    },
    {
        id: "8",
        name: "Campaign Asset Bundle",
        type: "Image",
        source: { name: "ABM Campaign Workflow", type: "workflow", link: "/opal/workflows/8" },
        createdBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
        created: "Mar 10, 2026",
        createdRaw: 1741564800,
        size: "5.8 MB",
        sizeRaw: 6082150,
        status: "Ready",
        version: "3.0",
        description: "Full ABM campaign pack: banners, email headers, social.",
        imageUrl: "/cmp/assets/recommendation/search-07-image.jpg",
    },
    {
        id: "9",
        name: "Meeting Notes — Product Sync",
        type: "Document",
        source: { name: "Meeting Synthesizer", type: "agent", link: "/opal/agents/setup?id=9" },
        createdBy: { name: "William Mo.", avatar: "/avatars/user2.png" },
        created: "Mar 8, 2026",
        createdRaw: 1741392000,
        size: "6 KB",
        sizeRaw: 6144,
        status: "Generating",
        version: "1.0",
        description: "Structured action items and decisions from product sync.",
    },
    {
        id: "10",
        name: "Localized Copy — FR",
        type: "Document",
        source: { name: "Content Localizer", type: "agent", link: "/opal/agents/setup?id=10" },
        createdBy: { name: "Mary Anne", avatar: "/avatars/user.png" },
        created: "Mar 5, 2026",
        createdRaw: 1741132800,
        size: "10 KB",
        sizeRaw: 10240,
        status: "Failed",
        version: "1.0",
        description: "French localization of Q2 campaign copy.",
    },
    {
        id: "11",
        name: "Q1 Sales Deck",
        type: "Presentation",
        source: { name: "Sales enablement agent", type: "agent", link: "/opal/agents/setup?id=11" },
        createdBy: { name: "William Mo.", avatar: "/avatars/user2.png" },
        created: "Mar 1, 2026",
        createdRaw: 1740787200,
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
    Document:     <IconFile size={12} />,
    Image:        <IconImage size={12} />,
    Code:         <IconCode size={12} />,
    Presentation: <IconPresentationScreen size={12} />,
    Spreadsheet:  <IconFileSpreadsheet size={12} />,
    Report:       <IconChartColumn size={12} />,
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
const DEFAULT_PINNED_IDS = new Set(artifacts.filter((a) => a.imageUrl).map((a) => a.id).slice(0, 6));

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
        <Box style={{ height: h, width: w, background: "var(--ax-colors-bg-tertiary)", borderRadius: 3, marginTop: mt }} />
    );
    return (
        <Box style={{ padding: "14px 16px", height: "100%", background: "var(--ax-colors-bg-default)", overflow: "hidden", display: "flex", flexDirection: "column", gap: 5 }}>
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
        <Box style={{ height: "100%", background: "var(--ax-colors-bg-default)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
                            <Text fontSize="sm" style={{ color: j === 3 ? statusColor[cell] ?? "inherit" : "var(--ax-colors-fg-default)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", display: "block" }}>
                                {cell}
                            </Text>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
}

// ─── Grid view components ─────────────────────────────────────────────────────

function ArtifactPreviewCard({
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

    const btnStyle: React.CSSProperties = {
        background: "var(--ax-colors-bg-default)",
        borderColor: "var(--ax-colors-border-tertiary)",
        height: 26, width: 26, padding: 0,
    };

    return (
        <Box
            bg="bg.default"
            border="1"
            borderColor="border.tertiary"
            display="flex"
            flexDirection="column"
            overflow="hidden"
            rounded="xl"
            style={{ height: 180 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Clickable preview area */}
            <Box
                style={{ flex: 1, overflow: "hidden", position: "relative", minHeight: 0, cursor: "pointer" }}
                onClick={() => onOpen(artifact)}
            >
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

                {/* Top-right: ellipsis menu — always mounted, shown on hover via opacity */}
                <Box
                    style={{ position: "absolute", right: 8, top: 8, opacity: hovered ? 1 : 0, pointerEvents: hovered ? "auto" : "none", transition: "opacity 0.15s" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button appearance="default" size="sm" aria-label="Options" style={btnStyle} icon={<IconEllipsisSolid size={14} />} />
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
                                <DropdownMenuItem onClick={() => onTogglePin(artifact.id)}>
                                    <Box display="flex" alignItems="center" gap="8"><IconThumbtack size={14} />{pinned ? "Unpin" : "Pin"}</Box>
                                </DropdownMenuItem>
                                <Box style={{ height: 1, background: "var(--ax-colors-border-default)", margin: "4px 12px" }} />
                                <DropdownMenuItem style={{ color: "var(--ax-colors-fg-danger)" }}>
                                    <Box display="flex" alignItems="center" gap="8"><IconTrashCan size={14} />Delete</Box>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Box>
            </Box>

            {/* Footer */}
            <Box
                display="flex"
                flexDirection="column"
                gap="4"
                px="10"
                py="8"
                style={{ flexShrink: 0, borderTop: "1px solid var(--ax-colors-border-tertiary)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Badge row + pin toggle */}
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Badge intent="information">{typeBadgeLabel[artifact.type]}</Badge>
                    <Tooltip content={pinned ? "Unpin" : "Pin"} delayDuration={300}>
                        <span style={{ display: "inline-flex" }}>
                            <Button
                                appearance="subtle"
                                size="sm"
                                aria-label={pinned ? "Unpin" : "Pin"}
                                style={{
                                    height: 20, width: 20, padding: 0,
                                    color: pinned ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-tertiary)",
                                    opacity: hovered || pinned ? 1 : 0,
                                    transition: "opacity 0.15s",
                                }}
                                onClick={() => onTogglePin(artifact.id)}
                                icon={<IconThumbtack size={12} />}
                            />
                        </span>
                    </Tooltip>
                </Box>
                {/* Title row */}
                <Box display="flex" alignItems="center" gap="4" style={{ minWidth: 0 }}>
                    <Box color="fg.tertiary" style={{ lineHeight: 0, flexShrink: 0 }}>{typeIcon[artifact.type]}</Box>
                    <Text fontSize="sm" fontWeight="500" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {artifact.name}
                    </Text>
                </Box>
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
                    background: "radial-gradient(circle at 20% 20%, rgba(245,243,255,1) 10%, rgba(229,239,255,1) 61%, rgba(221,214,254,1) 85%)",
                    flexShrink: 0,
                }}
            >
                <Box style={{ color: "var(--ax-colors-fg-default)" }}>{icon}</Box>
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
                    <DropdownMenuItem style={{ color: "var(--ax-colors-fg-danger)" }} onClick={(e) => e.stopPropagation()}>
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
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
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
                            <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
                        </Text>
                    </DialogBody>
                    <DialogFooter>
                        <DialogClose>
                            <Button appearance="subtle">Cancel</Button>
                        </DialogClose>
                        <Button
                            appearance="default"
                            style={{ background: "var(--ax-colors-bg-danger)", color: "white", borderColor: "var(--ax-colors-border-danger)" }}
                            onClick={() => setDeleteTarget(null)}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Box display="flex" flexDirection="column" gap="24" overflow="auto" h="full">
                {/* Header */}
                <Box display="flex" flexDirection="column" gap="8">
                    <Text fontSize="2xl" fontWeight="600">Artifacts</Text>
                    <Text color="fg.secondary">
                        Browse and manage all files and outputs generated by your Opal agents.
                    </Text>
                </Box>

                {/* ── Tabs (apply to both views) ── */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "my" | "shared")}>
                    <TabsList>
                        <TabsTrigger value="my">My Artifacts</TabsTrigger>
                        <TabsTrigger value="shared">
                            <Box display="flex" alignItems="center" gap="6">
                                <IconUsers size={14} />
                                Shared with me
                            </Box>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* ── Toolbar ── */}
                <Box display="flex" justifyContent="space-between" alignItems="center" gap="12">
                    <Box display="flex" gap="8" alignItems="center" style={{ flexWrap: "wrap" }}>
                        {/* Search */}
                        <Box style={{ width: 240 }}>
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
                                            {c !== "All" && <Avatar name={c} size="sm" />}
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
                                            {s === "chat" && <IconSearch size={14} />}
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
                                    <Td>
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            gap="6"
                                            color="fg.secondary"
                                            style={{ cursor: "pointer" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openWithPanel(artifact);
                                            }}
                                        >
                                            {artifact.source.type === "workflow" ? (
                                                <IconCodeBranch size={13} />
                                            ) : artifact.source.type === "chat" ? (
                                                <IconSearch size={13} />
                                            ) : (
                                                <IconAgent size={13} />
                                            )}
                                            <Text fontSize="sm" style={{ textDecoration: "underline", textDecorationColor: "var(--ax-colors-border-secondary)" }}>
                                                {artifact.source.name}
                                            </Text>
                                            <IconArrowUpRightFromSquare size={11} />
                                        </Box>
                                    </Td>
                                    <Td>
                                        <Box display="flex" alignItems="center" gap="8">
                                            <Avatar name={artifact.createdBy.name} src={artifact.createdBy.avatar} size="sm" />
                                            <Text fontSize="sm">{artifact.createdBy.name}</Text>
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
                                                    style={{ color: "var(--ax-colors-fg-danger)" }}
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
                                        <ArtifactPreviewCard key={a.id} artifact={a} onOpen={setOpenArtifact} pinned={pinnedIds.has(a.id)} onTogglePin={togglePin} />
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
                                    style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
                                >
                                    {recentlyUpdated.map((a) => (
                                        <CanvasArtifactCard key={a.id} artifact={a} onOpen={setOpenArtifact} pinned={pinnedIds.has(a.id)} onTogglePin={togglePin} />
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

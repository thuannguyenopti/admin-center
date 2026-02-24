"use client";

import {
    Alert,
    Banner,
    Box,
    Heading,
    Text,
    Button,
    Badge,
    Checkbox,
    Switch,
    Separator,
    Pagination,
    Tooltip,
    toaster,
    LabelMenuButton,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@optiaxiom/react";
import { Pill } from "@optiaxiom/react/unstable";
import {
    IconBell,
    IconChecks,
    IconTrash,
    IconBellOff,
    IconInbox,
    IconSearch,
    IconFilter,
    IconChevronDown,
    IconChevronRight,
    IconPackage,
    IconPlug,
    IconUsers,
    IconSpeakerphone,
    IconRobot,
    IconClock,
    IconUser,
    IconSettings,
    IconRefresh,
    IconWifi,
    IconWifiOff,
    IconBrandSlack,
    IconMail,
    IconDeviceMobile,
    IconEye,
    IconEyeOff,
    IconChevronUp,
    IconLoader2,
} from "@tabler/icons-react";
import {
    IconCircleExclamation,
    IconTriangleExclamation,
    IconCircleCheck as AxiomCircleCheck,
    IconFileLines,

    IconEllipsisStroke,
    IconCheck,
    IconEnvelope,
    IconXmark,
} from "@optimizely/axiom-icons";
import { useState } from "react";
import { Input } from "@/app/components/Input";

// ── Shared helpers ────────────────────────────────────────────────────────────

const SECTIONS = [
    { id: "entry-point", label: "1. Entry Point" },
    { id: "notification-center", label: "2. Notification Center" },
    { id: "notification-items", label: "3. Notification Items" },
    { id: "bulk-actions", label: "4. Bulk Actions & States" },
    { id: "search-filter", label: "5. Search & Filter" },
    { id: "toast", label: "6. Toast Notifications" },
    { id: "preferences", label: "7. Preferences & Settings" },
    { id: "notification-types", label: "8. Notification Types" },
    { id: "grouping", label: "9. Rate Limiting & Grouping" },
    { id: "error-states", label: "10. Error & Fallback States" },
    { id: "accessibility", label: "11. Accessibility" },
    { id: "external-delivery", label: "12. External Delivery" },
    { id: "unblocking-modal", label: "13. Opt-in Popover" },
];

function SectionHeading({ id, number, title, subtitle }: { id: string; number: string; title: string; subtitle?: string }) {
    return (
        <Box id={id} mb="24" style={{ scrollMarginTop: 24 }}>
            <Box display="flex" alignItems="center" gap="12" mb="4">
                <Box
                    rounded="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    style={{ width: 28, height: 28, background: "var(--ax-colors-bg-accent-subtle)", flexShrink: 0 }}
                >
                    <Text fontSize="xs" fontWeight="700" color="fg.accent">{number}</Text>
                </Box>
                <Heading level="3">{title}</Heading>
            </Box>
            {subtitle && <Text color="fg.tertiary" fontSize="sm">{subtitle}</Text>}
            <Separator mt="16" />
        </Box>
    );
}

function CatalogItem({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
    return (
        <Box mb="32">
            <Box mb="8">
                <Text fontWeight="600" fontSize="sm">{label}</Text>
                {description && <Text fontSize="xs" color="fg.tertiary" mt="2">{description}</Text>}
            </Box>
            <Box
                p="24"
                border="1"
                borderColor="border.tertiary"
                rounded="lg"
                bg="bg.default"
                display="flex"
                flexDirection="column"
                gap="12"
                style={{ position: "relative" }}
            >
                {children}
            </Box>
        </Box>
    );
}

// ── Section 1: Entry Point ────────────────────────────────────────────────────

function EntryPointSection() {
    return (
        <Box>
            <SectionHeading id="entry-point" number="1" title="Notification Entry Point" subtitle="Bell icon in top navigation with badge variants" />

            <CatalogItem label="Bell icon — no unread" description="Default state when all notifications are read">
                <Box display="flex" gap="32" alignItems="center">
                    <Box style={{ position: "relative", display: "inline-flex" }}>
                        <Button appearance="subtle" size="md" icon={<IconBell size={20} />} aria-label="Notifications" />
                    </Box>
                    <Text fontSize="sm" color="fg.tertiary">No badge shown when count = 0</Text>
                </Box>
            </CatalogItem>

            <CatalogItem label="Bell icon — unread badge" description="Numeric badge overlaid on the bell icon">
                <Box display="flex" gap="48" alignItems="center" flexWrap="wrap">
                    {[1, 7, 12, 99, 100].map((count) => (
                        <Box key={count} display="flex" flexDirection="column" alignItems="center" gap="8">
                            <Box style={{ position: "relative", display: "inline-flex" }}>
                                <Button appearance="subtle" size="lg" style={{ width: 40, height: 40 }} icon={<IconBell size={20} style={{ width: 20, height: 20 }} />} aria-label="Notifications" />
                                {/* ⚠ Custom — no Axiom notification-badge overlay; absolutely-positioned Box over Button */}
                                <Box
                                    rounded="full"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    className="absolute pointer-events-none"
                                    style={{
                                        top: 2, right: 0,
                                        backgroundColor: "#EF4444",
                                        minWidth: 14,
                                        padding: "0 4px",
                                        height: 14,
                                        fontSize: 9, fontWeight: 700,
                                        color: "white", zIndex: 10,
                                    }}
                                >
                                    {count > 99 ? "99+" : count}
                                </Box>
                            </Box>
                            <Text fontSize="xs" color="fg.tertiary">{count > 99 ? "99+" : count} unread</Text>
                        </Box>
                    ))}
                </Box>
            </CatalogItem>
        </Box>
    );
}

// ── Section 2: Notification Center ───────────────────────────────────────────

function NotificationCenterSection() {
    return (
        <Box>
            <SectionHeading id="notification-center" number="2" title="Notification Center" subtitle="Panel layouts, loading states, and empty states" />

            <CatalogItem label="Flyout panel header" description="Anchored to the bell icon; includes tabs, Mark All, close button">
                <Box border="1" borderColor="border.tertiary" rounded="lg" overflow="hidden" style={{ maxWidth: 480 }}>
                    {/* Header */}
                    <Box px="16" py="12" borderB="1" borderColor="border.tertiary" display="flex" alignItems="center" justifyContent="space-between" bg="bg.default">
                        <Text fontWeight="600" fontSize="md">Notifications</Text>
                        <Box display="flex" gap="4" alignItems="center">
                            <Button icon={<IconSettings size={15} />} appearance="subtle" size="sm" aria-label="Settings" />
                            <Separator orientation="vertical" style={{ height: 16 }} />
                            <Button icon={<IconXmark size={15} />} appearance="subtle" size="sm" aria-label="Close" />
                        </Box>
                    </Box>
                    {/* Tab bar — ⚠ Custom; Axiom has no Tabs component — using styled Box elements */}
                    <Box px="8" display="flex" alignItems="center" gap="0" borderB="1" borderColor="border.tertiary" bg="bg.default">
                        {[
                            { key: "all", label: "All" },
                            { key: "action", label: "Action Required (3)" },
                            { key: "unread", label: "Unread (8)" },
                        ].map((tab, i) => (
                            <Box
                                key={tab.key}
                                px="8"
                                py="10"
                                style={{
                                    borderBottom: i === 0 ? "2px solid var(--ax-colors-fg-accent)" : "2px solid transparent",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: i === 0 ? 600 : 400,
                                    color: i === 0 ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {tab.label}
                            </Box>
                        ))}
                        <Box flex="1" />
                        <Button appearance="subtle" size="sm" icon={<IconChecks size={14} />}>Mark all read</Button>
                    </Box>
                    <Box p="16" bg="bg.default">
                        <Text fontSize="xs" color="fg.tertiary">↓ Notification list renders here</Text>
                    </Box>
                </Box>
            </CatalogItem>

            <CatalogItem label="Loading skeleton" description="Placeholder shown while notifications are fetching">
                {/* ⚠ Custom — no Axiom Skeleton component; using Box with Tailwind animate-pulse */}
                <Box display="flex" flexDirection="column" gap="0" border="1" borderColor="border.tertiary" rounded="lg" overflow="hidden" style={{ maxWidth: 480 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Box key={i} display="flex" gap="12" p="16" borderB={i < 3 ? "1" : undefined} borderColor="border.tertiary" bg="bg.default">
                            <Box bg="bg.secondary" rounded="full" className="animate-pulse" style={{ width: 32, height: 32, flexShrink: 0 }} />
                            <Box flex="1" display="flex" flexDirection="column" gap="8">
                                <Box bg="bg.secondary" rounded="sm" className="animate-pulse" style={{ width: "65%", height: 14 }} />
                                <Box bg="bg.secondary" rounded="sm" className="animate-pulse" style={{ width: "90%", height: 12 }} />
                                <Box bg="bg.secondary" rounded="sm" className="animate-pulse" style={{ width: "40%", height: 12 }} />
                            </Box>
                            <Box bg="bg.secondary" rounded="sm" className="animate-pulse" style={{ width: 36, height: 12, flexShrink: 0 }} />
                        </Box>
                    ))}
                </Box>
            </CatalogItem>

            <CatalogItem label="Empty state — inbox zero" description="Shown when user has no notifications at all">
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py="48" gap="16">
                    <Box p="16" bg="bg.secondary" rounded="full" display="flex" alignItems="center" justifyContent="center">
                        <IconInbox size={40} color="var(--ax-colors-fg-tertiary)" />
                    </Box>
                    <Heading level="4" color="fg.secondary">You're all caught up</Heading>
                    <Text color="fg.tertiary" textAlign="center" style={{ maxWidth: 320 }}>
                        No notifications yet. New activity will appear here.
                    </Text>
                </Box>
            </CatalogItem>

            <CatalogItem label="Empty state — filtered / no results" description="Shown when search or filters return nothing">
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py="48" gap="16">
                    <Box p="16" bg="bg.secondary" rounded="full" display="flex" alignItems="center" justifyContent="center">
                        <IconSearch size={40} color="var(--ax-colors-fg-tertiary)" />
                    </Box>
                    <Heading level="4" color="fg.secondary">No results found</Heading>
                    <Text color="fg.tertiary" textAlign="center" style={{ maxWidth: 320 }}>
                        No results for "agent failed". Try different keywords or clear your filters.
                    </Text>
                    <Button appearance="subtle" size="sm">Clear all filters</Button>
                </Box>
            </CatalogItem>

            <CatalogItem label="Pagination" description="Previous / next controls; 50 notifications per page">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color="fg.tertiary">Showing 1–20 of 55 results</Text>
                    <Pagination page={1} total={3} onPageChange={() => { }} />
                </Box>
            </CatalogItem>
        </Box>
    );
}

// ── Section 3: Individual Notification Items ──────────────────────────────────

// ⚠ Custom — no Axiom status indicator/dot primitive; using a styled Box
function UnreadDot() {
    return (
        <Box rounded="full" style={{ width: 8, height: 8, backgroundColor: "var(--ax-colors-fg-error)", flexShrink: 0 }} />
    );
}

function NotificationItemSection() {
    return (
        <Box>
            <SectionHeading id="notification-items" number="3" title="Individual Notification Items" subtitle="All variants: read/unread states, categories, inline actions" />

            <CatalogItem label="Unread item" description="Bold title, red dot, highlighted background">
                <Box
                    p="16"
                    rounded="xl"
                    border="1"
                    borderColor="border.tertiary"
                    bg="bg.default"
                    display="flex"
                    gap="12"
                    alignItems="start"
                    className="cursor-pointer"
                >
                    <Box pt="2" style={{ flexShrink: 0 }}>
                        <IconCircleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-error)" }} />
                    </Box>
                    <Box flex="1" display="flex" flexDirection="column" gap="4">
                        <Box display="flex" alignItems="center" gap="8">
                            <Text fontWeight="700" fontSize="sm">Hypothesis Creator failed</Text>
                        </Box>
                        <Text fontSize="xs" color="fg.tertiary">Execution b2953c08 hit a tool timeout after 62.45s.</Text>
                        <Box display="flex" alignItems="center" gap="4" mt="4">
                            <Badge intent="primary" variant="subtle">Agent Execution</Badge>
                        </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap="8" style={{ flexShrink: 0 }}>
                        <Badge intent="warning" variant="subtle">Action Required</Badge>
                        <Text fontSize="xs" color="fg.tertiary">2:05 PM</Text>
                        <UnreadDot />
                    </Box>
                </Box>
            </CatalogItem>

            <CatalogItem label="Read item" description="Normal weight, dimmed appearance">
                <Box
                    p="16"
                    rounded="xl"
                    border="1"
                    borderColor="border.tertiary"
                    bg="bg.secondary"
                    display="flex"
                    gap="12"
                    alignItems="start"
                    className="cursor-pointer"
                >
                    <Box pt="2" style={{ flexShrink: 0 }}>
                        <AxiomCircleCheck style={{ width: 16, height: 16, color: "var(--ax-colors-fg-success)" }} />
                    </Box>
                    <Box flex="1" display="flex" flexDirection="column" gap="4">
                        <Text fontWeight="500" fontSize="sm">Content Localizer completed</Text>
                        <Text fontSize="xs" color="fg.tertiary">Chat-triggered execution finished. Campaign copy translated to 4 languages.</Text>
                        <Box display="flex" alignItems="center" gap="4" mt="4">
                            <Badge intent="primary" variant="subtle">Agent Execution</Badge>
                        </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap="8" style={{ flexShrink: 0 }}>
                        <Text fontSize="xs" color="fg.tertiary">1:52 PM</Text>
                        <Box style={{ width: 8 }} />
                    </Box>
                </Box>
            </CatalogItem>

            <CatalogItem label="Approve / Deny inline actions" description="Admin-targeted notifications with approval buttons">
                <Box
                    p="16"
                    rounded="xl"
                    border="1"
                    borderColor="border.tertiary"
                    bg="bg.default"
                    display="flex"
                    gap="12"
                    alignItems="start"
                >
                    <Box pt="2" style={{ flexShrink: 0 }}>
                        <IconPackage size={16} color="var(--ax-colors-fg-information)" />
                    </Box>
                    <Box flex="1" display="flex" flexDirection="column" gap="8">
                        <Box>
                            <Text fontWeight="700" fontSize="sm">Install request: Voice-of-Customer Analyzer</Text>
                            <Text fontSize="xs" color="fg.tertiary" mt="2">David Kim has requested to install this agent. Review permissions and approve or deny.</Text>
                        </Box>
                        <Box display="flex" gap="8">
                            <Button size="sm" appearance="inverse">Approve</Button>
                            <Button size="sm" appearance="default">Deny</Button>
                        </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap="8" style={{ flexShrink: 0 }}>
                        <Text fontSize="xs" color="fg.tertiary">1:57 PM</Text>
                        <UnreadDot />
                    </Box>
                </Box>
            </CatalogItem>

            <CatalogItem label="Dismiss button" description="Per-item × control to remove a single notification">
                <Box
                    p="16"
                    rounded="xl"
                    border="1"
                    borderColor="border.tertiary"
                    bg="bg.default"
                    display="flex"
                    gap="12"
                    alignItems="start"
                    className="group"
                >
                    <Box pt="2" style={{ flexShrink: 0 }}>
                        <IconFileLines style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)" }} />
                    </Box>
                    <Box flex="1" display="flex" flexDirection="column" gap="4">
                        <Text fontWeight="500" fontSize="sm">New agent available: Competitor Monitor</Text>
                        <Text fontSize="xs" color="fg.tertiary">Tracks competitor pricing across 50+ sites.</Text>
                    </Box>
                    <Box display="flex" alignItems="center" gap="4" style={{ flexShrink: 0 }}>
                        <Text fontSize="xs" color="fg.tertiary">12:00 PM</Text>
                        <Tooltip content="Dismiss">
                            <Button appearance="subtle" size="sm" icon={<IconXmark size={14} />} aria-label="Dismiss" />
                        </Tooltip>
                    </Box>
                </Box>
            </CatalogItem>

            <CatalogItem label="Timestamp — relative + absolute tooltip" description='"2 min ago" with hover tooltip showing full date/time'>
                <Box display="flex" gap="24" alignItems="center" flexWrap="wrap">
                    {["Just now", "2 min ago", "1 hr ago", "Yesterday", "May 18"].map((t) => (
                        <Tooltip key={t} content="Mon, May 20, 2024 2:05 PM UTC">
                            <Box style={{ cursor: "default" }}>
                                <Text fontSize="sm" color="fg.tertiary">{t}</Text>
                            </Box>
                        </Tooltip>
                    ))}
                </Box>
            </CatalogItem>

            <CatalogItem label="Category badges / role labels" description="Chips indicating notification category">
                <Box display="flex" gap="8" flexWrap="wrap">
                    <Badge intent="primary" variant="subtle">Agent Execution</Badge>
                    <Badge intent="warning" variant="subtle">Guardrails</Badge>
                    <Badge intent="information" variant="subtle">Directory</Badge>
                    <Badge intent="success" variant="subtle">Tools & Connections</Badge>
                    <Badge intent="neutral" variant="subtle">System</Badge>
                    <Badge intent="success" variant="subtle">Collaboration</Badge>
                </Box>
            </CatalogItem>

            <CatalogItem label="Status icons" description="Icon indicates execution or guardrail result">
                <Box display="flex" gap="24" flexWrap="wrap">
                    {[
                        { icon: <IconCircleExclamation style={{ width: 18, height: 18, color: "var(--ax-colors-fg-error)" }} />, label: "Failed / Terminated" },
                        { icon: <IconTriangleExclamation style={{ width: 18, height: 18, color: "var(--ax-colors-fg-warning)" }} />, label: "Warning / Triggered" },
                        { icon: <AxiomCircleCheck style={{ width: 18, height: 18, color: "var(--ax-colors-fg-success)" }} />, label: "Success" },
                        { icon: <IconFileLines style={{ width: 18, height: 18, color: "var(--ax-colors-fg-tertiary)" }} />, label: "Informational" },
                    ].map(({ icon, label }) => (
                        <Box key={label} display="flex" alignItems="center" gap="8">
                            {icon}
                            <Text fontSize="sm" color="fg.tertiary">{label}</Text>
                        </Box>
                    ))}
                </Box>
            </CatalogItem>
        </Box>
    );
}

// ── Section 4: Bulk Actions & States ─────────────────────────────────────────

function BulkActionsSection() {
    const [selected, setSelected] = useState<Set<string>>(new Set(["n1", "n2"]));
    const items = [
        { id: "n1", title: "Hypothesis Creator failed", unread: true },
        { id: "n2", title: "Content Localizer completed", unread: false },
        { id: "n3", title: "Email Composer — Guardrail blocked", unread: true },
    ];
    const allSelected = items.every((i) => selected.has(i.id));

    const toggle = (id: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const toggleAll = () =>
        setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)));

    return (
        <Box>
            <SectionHeading id="bulk-actions" number="4" title="Notification States & Bulk Actions" subtitle="Multi-select, select all, and contextual action toolbar" />

            <CatalogItem label="Bulk action toolbar" description="Appears contextually when one or more items are selected">
                {selected.size > 0 && (
                    <Box
                        display="flex"
                        alignItems="center"
                        gap="12"
                        p="12"
                        bg="bg.secondary"
                        rounded="md"
                    >
                        <Text fontWeight="600" fontSize="sm">{selected.size} selected</Text>
                        <Separator orientation="vertical" style={{ height: 16 }} />
                        <Button appearance="subtle" size="sm" icon={<IconCheck size={14} />}>Mark as read</Button>
                        <Button appearance="subtle" size="sm" icon={<IconEnvelope size={14} />}>Mark as unread</Button>
                        <Button appearance="subtle" size="sm" icon={<IconXmark size={14} />}>Dismiss</Button>
                    </Box>
                )}
                <Box display="flex" flexDirection="column" gap="0" border="1" borderColor="border.tertiary" rounded="md" overflow="hidden">
                    {/* Header row */}
                    <Box display="flex" gap="12" px="16" py="10" bg="bg.secondary" borderB="1" borderColor="border.tertiary" alignItems="center">
                        <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                        <Text fontSize="xs" color="fg.tertiary" fontWeight="600" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {allSelected ? "Deselect all" : "Select all"}
                        </Text>
                    </Box>
                    {items.map((item, i) => (
                        <Box
                            key={item.id}
                            display="flex"
                            gap="12"
                            px="16"
                            py="16"
                            alignItems="center"
                            borderB={i < items.length - 1 ? "1" : undefined}
                            borderColor="border.tertiary"
                            bg={item.unread ? "bg.default" : "bg.secondary"}
                        >
                            <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggle(item.id)} />
                            {item.unread && <UnreadDot />}
                            {!item.unread && <Box style={{ width: 8 }} />}
                            <Text fontSize="sm" fontWeight={item.unread ? "600" : "400"} flex="1">{item.title}</Text>
                            <Button appearance="subtle" size="sm" icon={<IconEllipsisStroke />} aria-label="More options" />
                        </Box>
                    ))}
                </Box>
            </CatalogItem>

            <CatalogItem label="Clear all read" description="Bulk remove all read notifications">
                <Box display="flex" gap="8">
                    <Button appearance="subtle" size="sm" icon={<IconTrash size={14} />}>Clear all read</Button>
                    <Button appearance="subtle" size="sm" icon={<IconChecks size={14} />}>Mark all as read</Button>
                </Box>
            </CatalogItem>
        </Box>
    );
}

// ── Section 5: Search & Filter ────────────────────────────────────────────────

function SearchFilterSection() {
    const [query, setQuery] = useState("agent");
    const [activeFilters, setActiveFilters] = useState(["Type: Agent Execution", "Status: Unread", "Agent: Hypothesis Creator"]);

    return (
        <Box>
            <SectionHeading id="search-filter" number="5" title="Search & Filter" subtitle="Keyword search, dropdowns, active filter chips, clear all" />

            <CatalogItem label="Keyword search bar" description="Text input to search notification content">
                {/* ⚠ Custom composition — Axiom Input has no built-in leading-icon slot; icon is absolutely overlaid */}
                <Box className="w-[360px]" style={{ position: "relative" }}>
                    <Box style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 1, pointerEvents: "none" }}>
                        <IconSearch size={16} color="var(--ax-colors-fg-tertiary)" />
                    </Box>
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search notifications..."
                        style={{ paddingLeft: 36 }}
                    />
                    {query && (
                        <Box style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)" }}>
                            <Button
                                appearance="subtle"
                                size="sm"
                                icon={<IconXmark size={14} />}
                                aria-label="Clear search"
                                onClick={() => setQuery("")}
                            />
                        </Box>
                    )}
                </Box>
            </CatalogItem>

            <CatalogItem label="Filter dropdowns" description="Type, Status, Agent, Priority, Date Range selectors">
                <Box display="flex" gap="8" flexWrap="wrap">
                    {[
                        { label: "Type", value: "All Types", options: ["All Types", "Agent Execution", "Guardrail", "Directory", "System"] },
                        { label: "Status", value: "All", options: ["All", "Unread", "Read", "Dismissed"] },
                        { label: "Agent", value: "All Agents", options: ["All Agents", "Hypothesis Creator", "Content Localizer", "Email Composer"] },
                        { label: "Priority", value: "All", options: ["All", "High", "Medium", "Low"] },
                        { label: "Time", value: "All Time", options: ["All Time", "Last 24h", "Last 7 days", "Last 30 days"] },
                    ].map(({ label, value, options }) => (
                        <DropdownMenu key={label}>
                            <DropdownMenuTrigger asChild>
                                <LabelMenuButton label={label}>{value}</LabelMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {options.map((opt) => (
                                    <DropdownMenuItem key={opt}>{opt}</DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ))}
                </Box>
            </CatalogItem>

            <CatalogItem label="Active filter chips" description="Visible tags showing applied filters with × to remove">
                <Box display="flex" gap="8" flexWrap="wrap" alignItems="center">
                    {activeFilters.map((f) => (
                        <Pill
                            key={f}
                            onDismiss={() => setActiveFilters((prev) => prev.filter((x) => x !== f))}
                        >
                            {f}
                        </Pill>
                    ))}
                    {activeFilters.length > 0 && (
                        <Button appearance="subtle" size="sm" onClick={() => setActiveFilters([])}>
                            Clear all
                        </Button>
                    )}
                </Box>
            </CatalogItem>

            <CatalogItem label="No results state" description="Message when search/filter returns nothing">
                <Box display="flex" flexDirection="column" alignItems="center" gap="12" py="32">
                    <IconSearch size={36} color="var(--ax-colors-fg-tertiary)" style={{ opacity: 0.4 }} />
                    <Text fontWeight="500" color="fg.secondary">No notifications match your filters</Text>
                    <Text fontSize="sm" color="fg.tertiary" textAlign="center" style={{ maxWidth: 300 }}>
                        Try adjusting or clearing your filters to see more results.
                    </Text>
                    <Button appearance="subtle" size="sm">Clear all filters</Button>
                </Box>
            </CatalogItem>
        </Box>
    );
}

// ── Section 6: Toast Notifications ───────────────────────────────────────────

function ToastSection() {
    const variants: Array<{ intent: "danger" | "warning" | "success" | "information" | "neutral"; label: string; message: string }> = [
        { intent: "danger", label: "Danger", message: "Hypothesis Creator failed — Execution b2953c08 hit a tool timeout after 62.45s." },
        { intent: "warning", label: "Warning", message: "Guardrail Warning — Content Localizer output flagged by Brand Voice guardrail." },
        { intent: "success", label: "Success", message: "Content Localizer completed — Campaign copy translated to 4 languages." },
        { intent: "information", label: "Information", message: "New agent available: Competitor Monitor. Published to the directory." },
        { intent: "neutral", label: "Neutral", message: "Data Pipeline Agent paused — Awaiting user input to resume or abandon." },
    ];

    return (
        <Box>
            <SectionHeading id="toast" number="6" title="Toast / In-App Notifications" subtitle="Use toaster.create() from @optiaxiom/react — auto-dismiss, manual dismiss, action CTA" />

            <CatalogItem label="Toast variants — toaster.create()" description="Click Preview to fire each intent. Axiom's ToastProvider (via AxiomProvider) handles the floating UI, icon, and dismiss.">
                <Box display="flex" flexDirection="column" gap="8">
                    {variants.map(({ intent, label, message }) => (
                        <Box key={intent} display="flex" alignItems="center" gap="12" p="12" border="1" borderColor="border.tertiary" rounded="md" bg="bg.default">
                            <Text fontSize="sm" fontWeight="600" style={{ width: 96, flexShrink: 0 }}>{label}</Text>
                            <Text fontSize="sm" color="fg.tertiary" flex="1" className="line-clamp-1">{message}</Text>
                            <Button
                                size="sm"
                                appearance="default"
                                onClick={() => toaster.create(message, { intent })}
                            >
                                Preview ↗
                            </Button>
                        </Box>
                    ))}
                </Box>
            </CatalogItem>

            <CatalogItem label="Toast with action CTA" description='Pass action + onAction to toaster.create() — Axiom renders a clickable label button inside the toast'>
                <Box display="flex" alignItems="center" gap="12" p="12" border="1" borderColor="border.tertiary" rounded="md" bg="bg.default">
                    <Text fontSize="sm" color="fg.tertiary" flex="1">SEO Analyzer completed — Found 14 optimization opportunities.</Text>
                    <Button
                        size="sm"
                        appearance="default"
                        onClick={() =>
                            toaster.create("SEO Analyzer completed — Found 14 optimization opportunities.", {
                                intent: "success",
                                action: "View execution log",
                                onAction: () => { },
                            })
                        }
                    >
                        Preview ↗
                    </Button>
                </Box>
            </CatalogItem>

            <CatalogItem label="Context-aware suppression" description="Toast is NOT shown if user is on the relevant page">
                <Alert intent="warning">
                    Toast is suppressed when the user is viewing{" "}
                    <Text asChild fontWeight="600"><span>/opal/notifications</span></Text>{" "}
                    or the specific execution detail page.
                </Alert>
            </CatalogItem>
        </Box>
    );
}

// ── Section 7: Preferences & Settings ────────────────────────────────────────

function PreferencesSection() {
    const [globalEnabled, setGlobalEnabled] = useState(true);
    const [perType, setPerType] = useState<Record<string, boolean>>({
        agent_execution_failed: true,
        agent_execution_chat: true,
        guardrail_enforcer: true,
        guardrail_observer: false,
        directory_new_agent: true,
        system_announcement: true,
    });

    return (
        <Box>
            <SectionHeading id="preferences" number="7" title="Notification Preferences & Settings" subtitle="Global toggle, per-event toggles, delivery channels, Watch control" />

            <CatalogItem label="Global on/off toggle" description="Master switch to enable or disable all notifications">
                <Box display="flex" alignItems="center" justifyContent="space-between" p="16" border="1" borderColor="border.tertiary" rounded="md">
                    <Box>
                        <Text fontWeight="600">All Notifications</Text>
                        <Text fontSize="sm" color="fg.tertiary" mt="2">Receive notifications across all categories</Text>
                    </Box>
                    <Switch checked={globalEnabled} onCheckedChange={() => setGlobalEnabled(!globalEnabled)} />
                </Box>
            </CatalogItem>

            <CatalogItem label="Per-event-type toggles" description="Individual on/off switches for each notification event category">
                <Box display="flex" flexDirection="column" gap="0" border="1" borderColor="border.tertiary" rounded="md" overflow="hidden">
                    {Object.entries(perType).map(([key, enabled], i, arr) => (
                        <Box
                            key={key}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            px="16"
                            py="12"
                            borderB={i < arr.length - 1 ? "1" : undefined}
                            borderColor="border.tertiary"
                            bg="bg.default"
                        >
                            <Text fontSize="sm">{key.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}</Text>
                            <Switch
                                checked={enabled}
                                disabled={!globalEnabled}
                                onCheckedChange={() => setPerType((p) => ({ ...p, [key]: !p[key] }))}
                            />
                        </Box>
                    ))}
                </Box>
            </CatalogItem>

            <CatalogItem label="Delivery channel selector" description="Per-event choice: in-app, email, browser push, Slack, Teams">
                <Box display="flex" flexDirection="column" gap="0" border="1" borderColor="border.tertiary" rounded="md" overflow="hidden">
                    {/* Header */}
                    <Box display="flex" px="16" py="10" bg="bg.secondary" borderB="1" borderColor="border.tertiary">
                        <Text fontSize="xs" color="fg.tertiary" fontWeight="600" style={{ flex: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>Event Type</Text>
                        {["In-App", "Email", "Slack", "Teams", "Browser"].map((ch) => (
                            <Text key={ch} fontSize="xs" color="fg.tertiary" fontWeight="600" textAlign="center" style={{ width: 64, textTransform: "uppercase", letterSpacing: "0.05em" }}>{ch}</Text>
                        ))}
                    </Box>
                    {[
                        { label: "Agent Execution Failed", channels: [true, true, true, false, false] },
                        { label: "Guardrail Enforcer", channels: [true, true, false, false, false] },
                        { label: "Directory Install Request", channels: [true, true, true, false, false] },
                    ].map((row) => (
                        <Box key={row.label} display="flex" px="16" py="12" borderB="1" borderColor="border.tertiary" alignItems="center">
                            <Text fontSize="sm" style={{ flex: 1 }}>{row.label}</Text>
                            {row.channels.map((active, ci) => (
                                <Box key={ci} display="flex" justifyContent="center" style={{ width: 64 }}>
                                    <Checkbox checked={active} onCheckedChange={() => { }} />
                                </Box>
                            ))}
                        </Box>
                    ))}
                </Box>
            </CatalogItem>

            <CatalogItem label="Watch / Unwatch agent control" description="Toggle on agent detail pages to subscribe/unsubscribe from agent notifications">
                <Box display="flex" gap="12" flexWrap="wrap">
                    <Button appearance="default" size="sm" icon={<IconEye size={15} />}>Watch Agent</Button>
                    <Button appearance="subtle" size="sm" icon={<IconEyeOff size={15} />}>Unwatch Agent</Button>
                </Box>
            </CatalogItem>

            <CatalogItem label="Weekly wrap-up toggle" description="Opt-in/out of weekly digest notification">
                <Box display="flex" alignItems="center" justifyContent="space-between" p="16" border="1" borderColor="border.tertiary" rounded="md" style={{ maxWidth: 480 }}>
                    <Box>
                        <Text fontWeight="600" fontSize="sm">Weekly wrap-up digest</Text>
                        <Text fontSize="xs" color="fg.tertiary" mt="2">Receive a weekly summary of your team's agent activity every Monday morning.</Text>
                    </Box>
                    <Switch checked={true} onCheckedChange={() => { }} />
                </Box>
            </CatalogItem>
        </Box>
    );
}

// ── Section 8: Notification Types ────────────────────────────────────────────

const NOTIFICATION_TYPES = [
    {
        group: "Agent Execution — Chat-Triggered",
        intent: "primary",
        items: [
            { type: "Chat Trigger — Agent Execution Success", title: "Content Localizer completed", message: "Chat-triggered execution finished. Campaign copy translated to 4 languages.", icon: <AxiomCircleCheck style={{ width: 16, height: 16, color: "var(--ax-colors-fg-success)" }} /> },
            { type: "Chat Trigger — Agent Execution Failed", title: "Hypothesis Creator failed", message: "Execution b2953c08 hit a tool timeout after 62.45s.", icon: <IconCircleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-error)" }} /> },
            { type: "Chat Trigger — Long-Running Agent Progress", title: "Data Pipeline Agent in progress", message: "Processing 2.3M records. Currently at 72% completion.", icon: <IconLoader2 style={{ width: 16, height: 16, color: "var(--ax-colors-fg-information)" }} /> },
            { type: "Chat Trigger — Agent Paused", title: "Data Pipeline Agent paused", message: "Agent paused awaiting user input. Resume or abandon the session.", icon: <IconFileLines style={{ width: 16, height: 16, color: "var(--ax-colors-fg-warning)" }} /> },
        ],
    },
    {
        group: "Agent Execution — Autonomous Trigger",
        intent: "primary",
        items: [
            { type: "Autonomous — Execution Started", title: "Email Composer started autonomously", message: "Scheduled autonomous run started. Generating email variants for Spring Sale.", icon: <IconLoader2 style={{ width: 16, height: 16, color: "var(--ax-colors-fg-information)" }} /> },
            { type: "Autonomous — Execution Success", title: "Email Composer ran autonomously", message: "Scheduled autonomous run completed. Generated 12 email variants.", icon: <AxiomCircleCheck style={{ width: 16, height: 16, color: "var(--ax-colors-fg-success)" }} /> },
            { type: "Autonomous — Execution Failed", title: "Social Media Publisher failed", message: "API rate limit exceeded on X/Twitter. 3 of 8 posts were not published.", icon: <IconCircleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-error)" }} /> },
            { type: "Autonomous — Agent Paused", title: "Data Pipeline Agent paused after failures", message: "System automatically paused agent after 3 consecutive failures.", icon: <IconTriangleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-warning)" }} /> },
        ],
    },
    {
        group: "Guardrail & Quality",
        intent: "warning",
        items: [
            { type: "Guardrail Violation — Observer Mode (Warning)", title: "Guardrail Warning — Review recommended", message: "Content Localizer output flagged by Brand Voice guardrail. Score: 65/100.", icon: <IconTriangleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-warning)" }} /> },
            { type: "Guardrail Violation — Enforcer Mode (Warning)", title: "Guardrail enforcement — Content rewritten", message: "Social Media Publisher output modified by Compliance guardrail. Removed 2 unapproved claims.", icon: <IconTriangleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-warning)" }} /> },
            { type: "Guardrail Violation — Enforcer Mode (Terminated)", title: "Guardrail Blocked — Execution terminated", message: "Email Composer blocked by PII Detection guardrail. Found 3 unmasked email addresses.", icon: <IconCircleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-error)" }} /> },
            { type: "Output Quality Score Below Threshold", title: "Quality score dropped below threshold", message: "Hypothesis Creator quality score fell to 58% (threshold: 70%).", icon: <IconCircleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-error)" }} /> },
        ],
    },
    {
        group: "Collaborative / Multi-User",
        intent: "success",
        items: [
            { type: "Agent Modified by Another User", title: "Agent modified: Content Localizer", message: "Sarah Chen updated the prompt chain and added a new output format.", icon: <IconUsers style={{ width: 16, height: 16, color: "var(--ax-colors-fg-accent)" }} /> },
            { type: "Agent Activated", title: "Agent activated: Campaign Optimizer", message: "Mike Johnson activated Campaign Optimizer in the production environment.", icon: <AxiomCircleCheck style={{ width: 16, height: 16, color: "var(--ax-colors-fg-success)" }} /> },
            { type: "Agent Deactivated", title: "Agent deactivated: Legacy Email Writer", message: "Admin deactivated Legacy Email Writer. Reason: replaced by Email Composer V5.", icon: <IconFileLines style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)" }} /> },
        ],
    },
    {
        group: "Agent Directory",
        intent: "information",
        items: [
            { type: "New Agents in Agent Directory", title: "New agent available: Competitor Monitor", message: "Tracks competitor pricing and product changes across 50+ sites.", icon: <IconPackage style={{ width: 16, height: 16, color: "var(--ax-colors-fg-information)" }} /> },
            { type: "Agent Update Available", title: "Update available: Content Localizer V13", message: "Improved language detection and 40% faster translations.", icon: <IconPackage style={{ width: 16, height: 16, color: "var(--ax-colors-fg-information)" }} /> },
            { type: "Agent Install Request Submitted (Admin)", title: "Install request: Voice-of-Customer Analyzer", message: "David Kim has requested to install this agent. Review and approve or deny.", icon: <IconPackage style={{ width: 16, height: 16, color: "var(--ax-colors-fg-warning)" }} />, actions: true },
            { type: "Agent Install Request Approved (Requester)", title: "Install request approved: Data Analyzer", message: "Your request to install Data Analyzer was approved by the admin.", icon: <AxiomCircleCheck style={{ width: 16, height: 16, color: "var(--ax-colors-fg-success)" }} /> },
            { type: "Agent Install Request Denied (Requester)", title: "Install request denied: Customer Insights Engine", message: "Your request was denied. Contact your admin for more information.", icon: <IconCircleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-error)" }} /> },
        ],
    },
    {
        group: "Tools & Connections",
        intent: "success",
        items: [
            { type: "New Tools Available", title: "New tool: Google Analytics 4 Connector", message: "Connect your analytics data to enable audience insights agents.", icon: <IconPlug style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)" }} /> },
            { type: "New Connections Available", title: "New tool: Figma Design Importer", message: "Import Figma designs directly into your content workflows.", icon: <IconPlug style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)" }} /> },
            { type: "Tool Authentication Required", title: "Authentication required: Salesforce", message: "The Salesforce connection requires re-authentication. 3 agents depend on this.", icon: <IconCircleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-error)" }} /> },
            { type: "Connection Authentication Expired", title: "Auth expired: Slack Integration", message: "Your Slack OAuth token has expired. Notification delivery to Slack is paused.", icon: <IconCircleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-error)" }} /> },
            { type: "Tool Deprecation Notice", title: "Tool deprecation notice: Legacy CRM Connector", message: "Will be deprecated on March 1, 2026. Please migrate to CRM v2.", icon: <IconTriangleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-warning)" }} /> },
        ],
    },
    {
        group: "System",
        intent: "neutral",
        items: [
            { type: "System Announcement (role-specific)", title: "New feature: Workflow Builder V2", message: "Drag-and-drop, branching logic, and real-time collaboration are now available.", icon: <IconSpeakerphone style={{ width: 16, height: 16, color: "var(--ax-colors-fg-information)" }} /> },
        ],
    },
];

function NotificationTypesSection() {
    return (
        <Box>
            <SectionHeading id="notification-types" number="8" title="Notification Types — Content Templates" subtitle="All 30 notification types, grouped by category" />
            {NOTIFICATION_TYPES.map((group) => (
                <Box key={group.group} mb="24">
                    <Box mb="12">
                        <Badge intent={group.intent as any} variant="subtle">{group.group}</Badge>
                    </Box>
                    <Box display="flex" flexDirection="column" gap="8">
                        {group.items.map((item) => (
                            <Box
                                key={item.type}
                                p="16"
                                border="1"
                                borderColor="border.tertiary"
                                rounded="lg"
                                bg="bg.default"
                                display="flex"
                                gap="12"
                                alignItems="start"
                            >
                                <Box pt="2" style={{ flexShrink: 0 }}>{item.icon}</Box>
                                <Box flex="1" style={{ minWidth: 0 }}>
                                    <Box display="flex" alignItems="start" justifyContent="space-between" gap="8">
                                        <Text fontWeight="600" fontSize="sm">{item.title}</Text>
                                        <Text fontSize="xs" color="fg.tertiary" className="whitespace-nowrap">{item.type}</Text>
                                    </Box>
                                    <Text fontSize="xs" color="fg.tertiary" mt="2">{item.message}</Text>
                                    {(item as any).actions && (
                                        <Box display="flex" gap="8" mt="8">
                                            <Button size="sm" appearance="inverse">Approve</Button>
                                            <Button size="sm" appearance="default">Deny</Button>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

// ── Section 9: Rate Limiting & Grouping ──────────────────────────────────────

function GroupingSection() {
    const [expanded, setExpanded] = useState(false);

    return (
        <Box>
            <SectionHeading id="grouping" number="9" title="Rate Limiting & Grouping" subtitle="Digest items, expand control, queued indicator" />

            <CatalogItem label="Grouped / digest notification item" description='"Agent X failed 10+ times" digest instead of individual items'>
                <Box
                    p="16"
                    rounded="xl"
                    border="1"
                    borderColor="border.warning"
                    bg="bg.warning.subtle"
                    display="flex"
                    gap="12"
                    alignItems="start"
                >
                    <Box pt="2" style={{ flexShrink: 0 }}>
                        <IconTriangleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-warning)" }} />
                    </Box>
                    <Box flex="1" display="flex" flexDirection="column" gap="4">
                        <Box display="flex" alignItems="center" gap="8">
                            <Text fontWeight="700" fontSize="sm">Data Pipeline Agent failed 12 times</Text>
                            <Badge intent="warning" variant="subtle">Digest</Badge>
                        </Box>
                        <Text fontSize="xs" color="fg.tertiary">Multiple failures grouped in the last 2 hours. Latest: Memory limit exceeded.</Text>
                        <Box>
                            <Button
                                appearance="subtle"
                                size="sm"
                                icon={expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                                onClick={() => setExpanded(!expanded)}
                            >
                                {expanded ? "Collapse" : "Show 12 individual events"}
                            </Button>
                        </Box>
                        {expanded && (
                            <Box display="flex" flexDirection="column" gap="8" mt="4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Box key={i} p="10" bg="bg.default" rounded="md" border="1" borderColor="border.tertiary">
                                        <Text fontSize="xs" fontWeight="600">Execution ex-{100 + i} — Memory limit exceeded</Text>
                                        <Text fontSize="xs" color="fg.tertiary">{i === 0 ? "5 min ago" : i === 1 ? "32 min ago" : "1 hr ago"} · 90.00s</Text>
                                    </Box>
                                ))}
                                <Text fontSize="xs" color="fg.tertiary">+ 9 more events</Text>
                            </Box>
                        )}
                    </Box>
                    <Box display="flex" alignItems="center" gap="8" style={{ flexShrink: 0 }}>
                        <Text fontSize="xs" color="fg.tertiary">Today</Text>
                        <UnreadDot />
                    </Box>
                </Box>
            </CatalogItem>

            <CatalogItem label="Queued notification indicator" description="Visual indicator when notifications are queued due to throttling">
                <Box
                    p="12"
                    bg="bg.secondary"
                    rounded="md"
                    border="1"
                    borderColor="border.tertiary"
                    display="flex"
                    alignItems="center"
                    gap="8"
                >
                    <IconLoader2 size={16} color="var(--ax-colors-fg-tertiary)" className="animate-spin" />
                    <Text fontSize="sm" color="fg.tertiary">
                        <Text asChild fontWeight="600"><span>4 notifications queued</span></Text> — delivery is throttled. They will appear shortly.
                    </Text>
                </Box>
            </CatalogItem>
        </Box>
    );
}

// ── Section 10: Error & Fallback States ──────────────────────────────────────

function ErrorStatesSection() {
    return (
        <Box>
            <SectionHeading id="error-states" number="10" title="Error & Fallback States" subtitle="Broken deeplinks, service outages, external channel failures" />

            <CatalogItem label="Broken deeplink state" description="Target page no longer exists; shows error with fallback action">
                <Box
                    p="16"
                    rounded="xl"
                    border="1"
                    borderColor="border.tertiary"
                    bg="bg.default"
                    display="flex"
                    gap="12"
                    alignItems="start"
                >
                    <Box pt="2" style={{ flexShrink: 0 }}>
                        <IconCircleExclamation style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)" }} />
                    </Box>
                    <Box flex="1" display="flex" flexDirection="column" gap="4">
                        <Text fontWeight="600" fontSize="sm">Hypothesis Creator — Execution log</Text>
                        <Box p="10" bg="bg.error.subtle" rounded="md" border="1" borderColor="border.error" mt="4">
                            <Text fontSize="xs" color="fg.error" fontWeight="600">Page not found</Text>
                            <Text fontSize="xs" color="fg.tertiary" mt="2">The execution log for ex-b2953c08 is no longer available. The agent or execution may have been deleted.</Text>
                            <Box display="flex" gap="8" mt="8">
                                <Button appearance="subtle" size="sm">Search for agent</Button>
                                <Button appearance="subtle" size="sm">View all executions</Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </CatalogItem>

            <CatalogItem label="Notification service outage banner" description="Full-width Banner at top of panel when the notification service is degraded">
                <Banner intent="warning" onDismiss={() => { }}>
                    <Text asChild fontWeight="600"><span>Notification service degraded.</span></Text>{" "}
                    Some notifications may be delayed. We're working to resolve this.
                </Banner>
            </CatalogItem>

            <CatalogItem label="External channel failure notice" description="Slack/Teams delivery failed; fallback to email used">
                <Alert intent="neutral">
                    <Text asChild fontWeight="600"><span>Slack delivery failed.</span></Text>{" "}
                    Notifications were sent to your email instead.{" "}
                    <Text asChild color="fg.accent" fontWeight="600" style={{ cursor: "pointer" }}><span>Reconnect Slack →</span></Text>
                </Alert>
            </CatalogItem>
        </Box>
    );
}

// ── Section 11: Accessibility ─────────────────────────────────────────────────

function AccessibilitySection() {
    return (
        <Box>
            <SectionHeading id="accessibility" number="11" title="Accessibility & Interaction" subtitle="ARIA roles, keyboard navigation, focus management, screen reader announcements" />

            <CatalogItem label="ARIA roles & live regions" description="Correct roles for notification list and toast announcements">
                {/* ⚠ Custom — no Axiom Code component; using Box with monospace fontFamily for code labels */}
                <Box display="flex" flexDirection="column" gap="12">
                    {[
                        { role: 'role="log"', description: "Notification list container — announces new items to screen readers" },
                        { role: 'aria-live="polite"', description: "Unread count badge — announces count changes" },
                        { role: 'aria-live="assertive"', description: "Toast container — announces urgent toasts immediately" },
                        { role: 'aria-label="Notifications, 8 unread"', description: "Bell button — communicates full state" },
                        { role: 'role="status"', description: "Bulk action toolbar — announces selection count" },
                    ].map(({ role, description }) => (
                        <Box key={role} display="flex" gap="16" alignItems="start">
                            <Box
                                px="8"
                                py="4"
                                bg="bg.secondary"
                                rounded="sm"
                                style={{ flexShrink: 0, fontFamily: "monospace", fontSize: 12, color: "var(--ax-colors-fg-accent)" }}
                            >
                                {role}
                            </Box>
                            <Text fontSize="sm" color="fg.tertiary">{description}</Text>
                        </Box>
                    ))}
                </Box>
            </CatalogItem>

            <CatalogItem label="Keyboard navigation" description="Full keyboard accessibility for all interactive elements">
                {/* ⚠ Custom — no Axiom Kbd component; using Box with monospace fontFamily for key labels */}
                <Box display="flex" flexDirection="column" gap="8">
                    {[
                        { key: "Tab", action: "Move focus through bell icon, flyout panel, list items, buttons" },
                        { key: "Enter / Space", action: "Activate focused notification or button" },
                        { key: "Escape", action: "Close flyout panel; focus returns to bell icon" },
                        { key: "↑ / ↓ Arrow", action: "Navigate between notification items in list" },
                        { key: "Shift+Tab", action: "Reverse focus order" },
                    ].map(({ key, action }) => (
                        <Box key={key} display="flex" gap="12" alignItems="center">
                            <Box
                                px="8"
                                py="4"
                                border="1"
                                borderColor="border.secondary"
                                rounded="md"
                                bg="bg.secondary"
                                style={{ flexShrink: 0, fontFamily: "monospace", fontSize: 12, minWidth: 100, textAlign: "center" }}
                            >
                                {key}
                            </Box>
                            <Text fontSize="sm" color="fg.tertiary">{action}</Text>
                        </Box>
                    ))}
                </Box>
            </CatalogItem>

            <CatalogItem label="Focus management" description="Focus moves into flyout on open; returns to bell icon on close">
                <Box p="12" bg="bg.accent.subtle" rounded="md" border="1" borderColor="border.accent">
                    <Text fontSize="sm" color="fg.accent">
                        On flyout open: focus moves to first item or close button. On close: focus returns to the bell icon that triggered the panel.
                    </Text>
                </Box>
            </CatalogItem>
        </Box>
    );
}

// ── Section 12: External Delivery ─────────────────────────────────────────────

function ExternalDeliverySection() {
    const channels = [
        { name: "Slack", icon: <IconBrandSlack size={18} />, connected: true },
        { name: "Email", icon: <IconMail size={18} />, connected: true },
        { name: "Browser Push", icon: <IconDeviceMobile size={18} />, connected: false },
        { name: "Teams", icon: <IconUsers size={18} />, connected: false },
    ];

    return (
        <Box>
            <SectionHeading id="external-delivery" number="12" title="Notification Forwarding / External Delivery" subtitle="External channel connections, status indicators, webhook config" />

            <CatalogItem label="External channel connection status" description="Shows connected / disconnected state per channel">
                <Box display="flex" flexDirection="column" gap="8" style={{ maxWidth: 480 }}>
                    {channels.map((ch) => (
                        <Box
                            key={ch.name}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            p="16"
                            border="1"
                            borderColor="border.tertiary"
                            rounded="md"
                            bg="bg.default"
                        >
                            <Box display="flex" alignItems="center" gap="12">
                                <Box
                                    rounded="md"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    style={{ width: 36, height: 36, background: "var(--ax-colors-bg-secondary)", flexShrink: 0 }}
                                    color="fg.tertiary"
                                >
                                    {ch.icon}
                                </Box>
                                <Box>
                                    <Text fontWeight="600" fontSize="sm">{ch.name}</Text>
                                    <Box display="flex" alignItems="center" gap="4" mt="2">
                                        {ch.connected ? (
                                            <IconWifi size={12} color="var(--ax-colors-fg-success)" />
                                        ) : (
                                            <IconWifiOff size={12} color="var(--ax-colors-fg-tertiary)" />
                                        )}
                                        <Text fontSize="xs" color={ch.connected ? "fg.success" : "fg.tertiary"}>
                                            {ch.connected ? "Connected" : "Not connected"}
                                        </Text>
                                    </Box>
                                </Box>
                            </Box>
                            <Button appearance={ch.connected ? "subtle" : "default"} size="sm">
                                {ch.connected ? "Disconnect" : "Connect"}
                            </Button>
                        </Box>
                    ))}
                </Box>
            </CatalogItem>

            <CatalogItem label="Webhook / event bus config (Admin)" description="Settings to configure forwarding to host applications">
                <Box display="flex" flexDirection="column" gap="8" style={{ maxWidth: 520 }}>
                    <Box p="16" border="1" borderColor="border.tertiary" rounded="md" bg="bg.default">
                        <Text fontWeight="600" fontSize="sm" mb="12">Webhook Endpoint</Text>
                        <Box display="flex" gap="8">
                            <Box
                                flex="1"
                                px="12"
                                border="1"
                                borderColor="border.secondary"
                                rounded="md"
                                style={{ height: 40, display: "flex", alignItems: "center", background: "var(--ax-colors-bg-secondary)" }}
                            >
                                <Text fontSize="sm" color="fg.tertiary" className="line-clamp-1">https://your-app.com/api/opal-webhooks</Text>
                            </Box>
                            <Button size="sm" appearance="default">Save</Button>
                        </Box>
                        <Text fontSize="xs" color="fg.tertiary" mt="8">Events will be sent as JSON POST requests. Supports retry with exponential backoff.</Text>
                    </Box>
                </Box>
            </CatalogItem>
        </Box>
    );
}

/// ── Section 13: Opt-in Popover ────────────────────────────────────────────────

function UnblockingModalSection() {
    return (
        <Box>
            <SectionHeading
                id="unblocking-modal"
                number="13"
                title="Opt-in Popover"
                subtitle="Non-blocking contextual card prompting users to enable notifications when an agent starts running"
            />

            <CatalogItem
                label="Stay in the loop — Popover card"
                description="Rendered as a Popover anchored near its trigger. No scrim — page remains fully interactive."
            >
                <Box
                    bg="bg.default"
                    border="1"
                    borderColor="border.secondary"
                    rounded="lg"
                    p="24"
                    display="flex"
                    flexDirection="column"
                    gap="16"
                    style={{ maxWidth: 320, boxShadow: "0 6px 18px rgba(0,0,0,0.08), 0 6px 12px -3px rgba(0,0,0,0.06), 0 4px 4px 1px rgba(0,0,0,0.05)" }}
                >
                    <Box display="flex" alignItems="center" gap="8">
                        <IconBell size={18} />
                        <Text fontWeight="600" fontSize="md">Stay in the loop</Text>
                    </Box>
                    <Text fontSize="sm" color="fg.secondary">
                        Get notified when GEO Recommendations finishes its run. No need to stay on the page.
                    </Text>
                    <Box display="flex" justifyContent="flex-end" gap="8">
                        <Button appearance="subtle" size="sm">Not now</Button>
                        <Button appearance="inverse" size="sm">Turn on notifications</Button>
                    </Box>
                </Box>
            </CatalogItem>
        </Box>
    );
}

// ── Main Catalog ──────────────────────────────────────────────────────────────

export default function NotificationCatalog() {
    const [activeSection, setActiveSection] = useState("entry-point");

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: "smooth" });
        setActiveSection(id);
    };

    return (
        <Box display="flex" h="full" bg="bg.page">
            {/* ── Sidebar Nav ────────────────────────────────────────────────── */}
            <Box
                borderR="1"
                borderColor="border.tertiary"
                bg="bg.default"
                overflowY="auto"
                style={{ width: 240, flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}
            >
                <Box px="16" py="20" borderB="1" borderColor="border.tertiary">
                    <Heading level="4">Notification UI</Heading>
                    <Text fontSize="xs" color="fg.tertiary" mt="4">Component Inventory</Text>
                </Box>
                <Box p="8" display="flex" flexDirection="column" gap="2">
                    {SECTIONS.map((s) => (
                        <Button
                            key={s.id}
                            appearance="subtle"
                            size="sm"
                            onClick={() => scrollTo(s.id)}
                            style={{
                                width: "100%",
                                justifyContent: "flex-start",
                                fontWeight: activeSection === s.id ? 600 : 400,
                                color: activeSection === s.id ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-secondary)",
                                background: activeSection === s.id ? "var(--ax-colors-bg-accent-subtle)" : "transparent",
                                fontSize: 13,
                                lineHeight: 1.4,
                            }}
                        >
                            {s.label}
                        </Button>
                    ))}
                </Box>
            </Box>

            {/* ── Content ────────────────────────────────────────────────────── */}
            <Box
                flex="1"
                overflowY="auto"
                p="40"
                style={{ maxWidth: 900 }}
            >
                {/* Page header */}
                <Box mb="40">
                    <Heading level="2">Notification System — UI Catalog</Heading>
                    <Text color="fg.tertiary" mt="8" style={{ maxWidth: 640 }}>
                        A standalone inventory of all UI patterns and Axiom components required for the Opal notification system. Each section maps to the product checklist.
                    </Text>
                    <Separator mt="24" />
                </Box>

                <EntryPointSection />
                <NotificationCenterSection />
                <NotificationItemSection />
                <BulkActionsSection />
                <SearchFilterSection />
                <ToastSection />
                <PreferencesSection />
                <NotificationTypesSection />
                <GroupingSection />
                <ErrorStatesSection />
                <AccessibilitySection />
                <ExternalDeliverySection />
                <UnblockingModalSection />
            </Box>
        </Box>
    );
}

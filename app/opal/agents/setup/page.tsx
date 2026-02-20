"use client";

import {
    Alert,
    Box,
    Heading,
    Text,
    Button,
    Badge,
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
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogBody,
    DialogFooter,
    DialogClose,
    Checkbox,
    Select,
    SelectTrigger,
    SelectContent,
} from "@optiaxiom/react";
import { Input } from "@/app/components/Input";
import {
    IconChevronDown,
    IconChevronRight,
    IconTrash,
    IconPlus,
    IconHelp,
    IconSparkles,
    IconDownload,
} from "@tabler/icons-react";
import {
    IconFileImport,
    IconPlay,
    IconEllipsisStroke,
} from "@optimizely/axiom-icons";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

    const [exportDialogOpen, setExportDialogOpen] = useState(false);

    // State for collapsible sections
    const [detailsOpen, setDetailsOpen] = useState(true);
    const [inputOpen, setInputOpen] = useState(false);
    const [outputOpen, setOutputOpen] = useState(false);

    // Setup Fields State
    const [agentName, setAgentName] = useState("");
    const [agentId, setAgentId] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [description, setDescription] = useState("");

    // Initialize state based on mode
    useEffect(() => {
        if (mode === "edit") {
            setDetailsOpen(true);
            setInputOpen(true);

            // Mock data for edit mode
            setAgentName("Email Creation");
            setAgentId("email_creation");
            setIsActive(true);
            setDescription("Transforms a provided overview...");
        } else {
            // mode === 'create'
            setDetailsOpen(true);
            setInputOpen(false);

            setAgentName("");
            setAgentId("");
            setIsActive(false);
            setDescription("");
        }
        setOutputOpen(false);
    }, [mode]);

    return (
        <Box h="full" bg="bg.default" display="flex" flexDirection="column">
            {/* Header */}
            <Box
                h="56"
                px="24"
                borderB="1"
                borderColor="border.tertiary"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bg="bg.default"
            >
                <Box display="flex" alignItems="center" gap="8">
                    <Button appearance="subtle" onClick={() => router.push("/opal/agents")}>
                        Agents
                    </Button>
                    <Text color="fg.tertiary">/</Text>
                    <Text fontWeight="600">Specialized Agent</Text>
                </Box>
                <Box display="flex" alignItems="center" gap="8">
                    <Button appearance="primary">Save</Button>
                    <Button appearance="subtle" icon={<IconPlay />}>Test Run</Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button appearance="subtle" icon={<IconEllipsisStroke />} aria-label="More options" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Duplicate Agent</DropdownMenuItem>
                            <DropdownMenuItem>Copy as JSON</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setExportDialogOpen(true)}>
                                <Box display="flex" alignItems="center" justifyContent="space-between" w="full">
                                    Export Logs
                                    <Badge intent="information" variant="subtle">New</Badge>
                                </Box>
                            </DropdownMenuItem>
                            <Box style={{ height: "1px", background: "var(--ax-colors-border-secondary)", margin: "4px 0" }} />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                Delete Agent
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Box>
            </Box>

            {/* Content with Tabs */}
            <Box flex="1" overflow="hidden" display="flex" flexDirection="column">
                <Tabs defaultValue="setup" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Box px="24" borderB="1" borderColor="border.tertiary">
                        <TabsList>
                            <TabsTrigger value="setup">Setup</TabsTrigger>
                            <TabsTrigger value="triggers">In-app Triggers</TabsTrigger>
                            <TabsTrigger value="logs">Logs</TabsTrigger>
                        </TabsList>
                    </Box>

                    <TabsContent value="setup" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                        <Box p="24" display="flex" flexDirection="column" gap="24" style={{ maxWidth: "800px" }}>

                            {/* Details Section */}
                            <CollapsibleSection
                                title="Details"
                                isOpen={detailsOpen}
                                onToggle={() => setDetailsOpen(!detailsOpen)}
                            >
                                <Field label="Name" required>
                                    <Box display="flex" gap="12" alignItems="center">
                                        <Box flex="1">
                                            <Input
                                                value={agentName}
                                                onChange={(e) => setAgentName(e.target.value)}
                                                placeholder="e.g. Email Creation"
                                            />
                                        </Box>
                                        <Box display="flex" alignItems="center" gap="8">
                                            <Switch checked={isActive} onCheckedChange={setIsActive} />
                                            <Text>{isActive ? "Active" : "Inactive"}</Text>
                                        </Box>
                                    </Box>
                                </Field>

                                <Field label="Id" required>
                                    <Box display="flex" gap="8" alignItems="center">
                                        <Box flex="1">
                                            <Input
                                                value={agentId}
                                                onChange={(e) => setAgentId(e.target.value)}
                                                placeholder="e.g. email_creation"
                                            />
                                        </Box>
                                        <Text color="fg.secondary">@email_creation</Text>
                                    </Box>
                                </Field>

                                <Field label="Description" info="What does this agent do?">
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What is the goal for this agent?"
                                        className="h-24"
                                    />
                                </Field>
                            </CollapsibleSection>

                            {/* Input Section */}
                            <CollapsibleSection
                                title="Input"
                                isOpen={inputOpen}
                                onToggle={() => setInputOpen(!inputOpen)}
                                info="Define input configuration"
                                action={<Button appearance="subtle" size="sm" icon={<IconSparkles />}>Generate</Button>}
                            >
                                <Field label="Prompt Template" info="Define the system instructions">
                                    <Textarea
                                        placeholder="Role: You are a marketing copy expert..."
                                        className="h-64"
                                    />
                                </Field>

                                <Box>
                                    <Box display="flex" justifyContent="space-between" mb="8">
                                        <Text fontWeight="400" fontSize="md">Variables</Text>
                                        <Button appearance="subtle" size="sm" icon={<IconPlus />}>Add Variable</Button>
                                    </Box>
                                    {/* Mock Variables List */}
                                    <Box display="flex" flexDirection="column" gap="8">
                                        <Box border="1" borderColor="border.tertiary" rounded="sm" p="12" display="flex" alignItems="center" justifyContent="space-between">
                                            <Box>
                                                <Text fontWeight="600">overview</Text>
                                                <Text fontSize="sm" color="fg.secondary">what the email is about</Text>
                                            </Box>
                                            <Box display="flex" gap="8" alignItems="center">
                                                <Badge intent="information" variant="subtle">Required</Badge>
                                                <Badge variant="subtle">String</Badge>
                                                <IconTrash size={16} color="var(--ax-colors-fg-tertiary)" />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>

                                <Field label="Tools" info="Select tools for the agent">
                                    <Input placeholder="Select tools..." />
                                </Field>

                                <Box display="flex" gap="24">
                                    <Box flex="1">
                                        <Field label="Inference Level" info="Select model intelligence">
                                            <Input defaultValue="Balanced (Default)" />
                                        </Field>
                                    </Box>
                                    <Box flex="1">
                                        <Field label="Creativity" info="Adjust temperature">
                                            <Box display="flex" gap="8" alignItems="center" mt="8">
                                                <Box style={{ height: "4px", position: "relative" }} bg="bg.accent" flex="1" rounded="full">
                                                    <Box w="16" h="16" bg="bg.accent" rounded="full" border="2" style={{ borderColor: "var(--ax-colors-bg-default)", position: "absolute", top: "-6px", left: "30%" }} />
                                                </Box>
                                                <Box border="1" borderColor="border.tertiary" px="8" py="2" rounded="sm">
                                                    0.4
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

                            </CollapsibleSection>

                            {/* Output Section */}
                            <CollapsibleSection
                                title="Output"
                                isOpen={outputOpen}
                                onToggle={() => setOutputOpen(!outputOpen)}
                                info="Define output format"
                                action={<Button appearance="subtle" size="sm" icon={<IconSparkles />}>Generate</Button>}
                            >
                                <Text color="fg.secondary">Output configuration content goes here...</Text>
                            </CollapsibleSection>

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
                </Tabs>
            </Box>

            <ExportLogsDialog
                open={exportDialogOpen}
                onOpenChange={setExportDialogOpen}
                agentName="Specialized Agent"
                executionCount={47}
            />
        </Box>
    );
}

const COLUMN_GROUPS = [
    {
        label: "Execution Info",
        columns: [
            { key: "agentName", label: "Agent name" },
            { key: "executionId", label: "Execution ID" },
            { key: "executionTime", label: "Execution time" },
            { key: "user", label: "User" },
            { key: "version", label: "Version" },
        ],
    },
    {
        label: "Input & Output",
        columns: [
            { key: "variables", label: "Variables" },
            { key: "output", label: "Output" },
            { key: "artifacts", label: "Artifacts" },
        ],
    },
    {
        label: "Performance",
        columns: [
            { key: "status", label: "Status" },
            { key: "duration", label: "Duration" },
            { key: "evaluationScore", label: "Evaluation score" },
        ],
    },
] as const;

type ColumnKey = (typeof COLUMN_GROUPS)[number]["columns"][number]["key"];

const ALL_COLUMN_KEYS: ColumnKey[] = COLUMN_GROUPS.flatMap((g) => g.columns.map((c) => c.key));

function ExportLogsDialog({
    open,
    onOpenChange,
    agentName,
    executionCount,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    agentName: string;
    executionCount: number;
}) {
    const [columns, setColumns] = useState<Record<ColumnKey, boolean>>(
        Object.fromEntries(ALL_COLUMN_KEYS.map((k) => [k, true])) as Record<ColumnKey, boolean>
    );
    const [format, setFormat] = useState<"CSV" | "XLSX">("CSV");

    const allSelected = Object.values(columns).every(Boolean);
    const toggleAll = () =>
        setColumns(
            Object.fromEntries(ALL_COLUMN_KEYS.map((k) => [k, !allSelected])) as Record<ColumnKey, boolean>
        );
    const toggleColumn = (key: ColumnKey) =>
        setColumns((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="md">
                <DialogHeader>Export Execution Logs</DialogHeader>
                <DialogBody>
                    {/* Scope */}
                    <Alert intent="neutral" mb="20">
                        <Text>Exporting <strong>{executionCount} executions</strong> for <strong>{agentName}</strong></Text>
                    </Alert>

                    {/* Columns header */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb="12">
                        <Text fontWeight="600">Columns</Text>
                        <Button
                            appearance="subtle"
                            size="sm"
                            onClick={toggleAll}
                            style={{ color: "var(--ax-colors-fg-accent)", padding: 0 }}
                        >
                            {allSelected ? "Deselect all" : "Select all"}
                        </Button>
                    </Box>

                    {/* Column groups */}
                    {COLUMN_GROUPS.map((group) => (
                        <Box key={group.label} mb="16">
                            <Text
                                fontSize="sm"
                                fontWeight="500"
                                color="fg.tertiary"
                                mb="6"
                            >
                                {group.label}
                            </Text>
                            <Box
                                display="grid"
                                gap="2"
                                style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
                            >
                                {group.columns.map((col) => (
                                    <Box key={col.key} px="8" py="4" rounded="sm">
                                        <Checkbox
                                            checked={columns[col.key]}
                                            onCheckedChange={() => toggleColumn(col.key)}
                                        >
                                            {col.label}
                                        </Checkbox>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    ))}

                    {/* Format */}
                    <Box mt="4">
                        <Text fontWeight="600" mb="10">
                            Format
                        </Text>
                        <Select
                            value={format}
                            onValueChange={(v) => setFormat(v as "CSV" | "XLSX")}
                            options={[
                                { label: "CSV", value: "CSV" },
                                { label: "XLSX", value: "XLSX" },
                            ]}
                        >
                            <SelectTrigger mt="10" style={{ width: "160px" }}>
                                {format}
                            </SelectTrigger>
                            <SelectContent />
                        </Select>
                    </Box>
                </DialogBody>
                <DialogFooter>
                    <DialogClose>Cancel</DialogClose>
                    <Button
                        appearance="primary"
                        icon={<IconDownload size={16} />}
                        onClick={() => onOpenChange(false)}
                    >
                        Export
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function CollapsibleSection({
    title,
    children,
    isOpen,
    onToggle,
    info,
    action
}: {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    info?: string;
    action?: React.ReactNode;
}) {
    return (
        <Box bg="bg.secondary" rounded="md" overflow="hidden" style={{ flexShrink: 0 }}>
            <Box
                p="16"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                cursor="pointer"
                onClick={onToggle}
                className="hover:bg-[var(--ax-colors-bg-secondary-hovered)]"
            >
                <Box display="flex" alignItems="center" gap="8">
                    {isOpen ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />}
                    <Text fontSize="md" fontWeight="500">{title}</Text>
                    {info && <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />}
                </Box>
                {action && <Box onClick={(e) => e.stopPropagation()}>{action}</Box>}
            </Box>

            {isOpen && (
                <Box p="16" pt="0" style={{ paddingLeft: "44px", paddingRight: "24px" }} display="flex" flexDirection="column" gap="24">
                    {children}
                </Box>
            )}
        </Box>
    );
}

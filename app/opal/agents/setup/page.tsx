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
} from "@optiaxiom/react";
import { Input } from "@/app/components/Input";
import {
    IconChevronDown,
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
                    <Button appearance="subtle" icon={<IconDots />} aria-label="More options" />
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

                    <TabsContent value="setup" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <Box h="full" overflowY="auto" p="24" display="flex" flexDirection="column" gap="24" style={{ maxWidth: "800px" }}>

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
                                                <Box bg="bg.accent.subtle" px="8" py="2" rounded="full"><Text fontSize="xs" color="fg.accent">Required</Text></Box>
                                                <Text fontSize="sm" color="fg.secondary">String</Text>
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
        </Box>
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

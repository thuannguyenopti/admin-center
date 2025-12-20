"use client";

import {
    Box,
    Heading,
    Text,
    Button,
    Badge,
    Textarea,
    Disclosure,
    DisclosureTrigger,
    DisclosureContent,
    type BoxProps,
} from "@optiaxiom/react";
import { Input } from "@/app/components/Input";
import {
    IconSearch,
    IconMenu2,
    IconX,
    IconDots,
    IconGripVertical,
    IconChevronDown,
    IconWebhook,
} from "@tabler/icons-react";
import {
    IconAgent,
    IconCodeBranch,
    IconBook,
    IconTerminal,
    IconSplit,
    IconArrowsRepeat,
    IconUserCheck,
    IconComments,
    IconEnvelope,
    IconHandPointer,
    IconClock,
} from "@optimizely/axiom-icons";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ReactFlow,
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Custom Toggle Component using Axiom Box
function Switch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (c: boolean) => void }) {
    return (
        <Box
            onClick={() => onCheckedChange(!checked)}
            cursor="pointer"
            bg={checked ? "bg.accent" : "bg.tertiary"}
            className="transition-colors duration-200"
            style={{
                width: "36px",
                height: "20px",
                borderRadius: "9999px",
                position: "relative"
            }}
        >
            <Box
                bg="bg.default"
                rounded="full"
                className="absolute transition-all duration-200"
                style={{
                    top: "2px",
                    width: "16px",
                    height: "16px",
                    left: checked ? "18px" : "2px",
                }}
            />
        </Box>
    );
}

const initialNodes = [
    {
        id: '1',
        type: 'input',
        data: { label: 'Start' },
        position: { x: 250, y: 5 },
    },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

function WorkflowBuilder() {
    const router = useRouter();
    const [active, setActive] = useState(false);

    // React Flow hooks
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: any) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: any) => {
            event.preventDefault();

            if (!reactFlowInstance) {
                return;
            }

            const type = event.dataTransfer.getData('application/reactflow/type');
            const label = event.dataTransfer.getData('application/reactflow/label');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: getId(),
                type,
                position,
                data: { label: label || `${type} node` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    const onDragStart = (event: any, nodeType: string, label: string) => {
        event.dataTransfer.setData('application/reactflow/type', nodeType);
        event.dataTransfer.setData('application/reactflow/label', label);
        event.dataTransfer.effectAllowed = 'move';
    };

    // Sidebar Data
    const components = {
        Agents: [
            { name: "Design Analyst", icon: <IconAgent />, bg: "bg.avatar.purple" },
            { name: "Frontend Development...", icon: <IconCodeBranch />, bg: "bg.avatar.purple" },
        ],
        Data: [],
        Inputs: [
            { name: "Instruction", icon: <IconBook />, bg: "bg.accent.subtle" },
            { name: "Prompts", icon: <IconTerminal />, bg: "bg.accent.subtle" },
        ],
        Triggers: [
            { name: "Chat Input", icon: <IconComments />, bg: "bg.success.subtle" },
            { name: "Email", icon: <IconEnvelope />, bg: "bg.success.subtle" },
            { name: "In-app Event", icon: <IconHandPointer />, bg: "bg.success.subtle" },
            { name: "Scheduler", icon: <IconClock />, bg: "bg.success.subtle" },
            { name: "Webhook", icon: <IconWebhook />, bg: "bg.success.subtle" },
        ],
        Outputs: [],
        Logic: [
            { name: "Condition", icon: <IconSplit />, bg: "bg.accent.subtle" },
            { name: "Loop", icon: <IconArrowsRepeat />, bg: "bg.accent.subtle" },
            { name: "User Approval", icon: <IconUserCheck />, bg: "bg.accent.subtle" },
        ],
    };

    return (
        <Box display="flex" flexDirection="column" h="full" bg="bg.default">
            {/* Header */}
            <Box
                h="56"
                style={{ height: "56px" }}
                px="16"
                borderB="1"
                borderColor="border.tertiary"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bg="bg.default"
            >
                <Box display="flex" alignItems="center" gap="16">
                    <Button
                        icon={<IconMenu2 />}
                        appearance="subtle"
                        aria-label="Menu"
                        onClick={() => router.back()}
                    />
                    <Heading level="4">Untitled Workflow</Heading>
                </Box>
                <Box>
                    {/* Header Actions */}
                </Box>
            </Box>

            {/* Main Content */}
            <Box display="flex" flex="1" overflow="hidden">
                {/* Left Sidebar: Components */}
                <Box
                    style={{ width: "280px" }}
                    borderR="1"
                    borderColor="border.tertiary"
                    display="flex"
                    flexDirection="column"
                    bg="bg.default"
                >
                    <Box p="16" borderB="1" borderColor="border.tertiary">
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb="12">
                            <Text fontWeight="700">Components</Text>
                            <IconSearch size={16} color="var(--ax-colors-fg-tertiary)" />
                        </Box>
                    </Box>

                    <Box flex="1" overflowY="auto">
                        {Object.entries(components).map(([category, items]) => (
                            <Disclosure key={category} defaultOpen={["Agents", "Inputs", "Triggers", "Logic"].includes(category)}>
                                <DisclosureTrigger>
                                    <Box
                                        p="12"
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        cursor="pointer"
                                        className="hover:bg-[var(--ax-colors-bg-default-hovered)] w-full"
                                    >
                                        <Text fontWeight="500">{category}</Text>
                                        <IconChevronDown size={16} />
                                    </Box>
                                </DisclosureTrigger>
                                <DisclosureContent>
                                    <Box display="flex" flexDirection="column" gap="4">
                                        {items.length > 0 ? (
                                            items.map((item, index) => (
                                                <div
                                                    key={index}
                                                    draggable
                                                    onDragStart={(event) => onDragStart(event, 'default', item.name)}
                                                    style={{ cursor: 'grab' }}
                                                >
                                                    <Box
                                                        p="8"
                                                        display="flex"
                                                        alignItems="center"
                                                        gap="8"
                                                        className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md"
                                                        mx="8"
                                                    >
                                                        <Box
                                                            p="6"
                                                            rounded={(category === "Triggers" || category === "Logic") ? "full" : "sm"}
                                                            // @ts-ignore - explicitly ignoring type check for bg prop here as tokens are dynamically assigned and valid
                                                            bg={item.bg || "bg.tertiary"}
                                                            color="fg.default"
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                        >
                                                            {item.icon}
                                                        </Box>
                                                        <Text fontSize="sm">{item.name}</Text>
                                                        <Box ml="auto" color="fg.tertiary">
                                                            <IconGripVertical size={14} />
                                                        </Box>
                                                    </Box>
                                                </div>
                                            ))
                                        ) : (
                                            <Text fontSize="sm" color="fg.tertiary" px="16">
                                                No items
                                            </Text>
                                        )}
                                    </Box>
                                </DisclosureContent>
                            </Disclosure>
                        ))}
                    </Box>
                </Box>

                {/* Center Canvas */}
                <Box
                    flex="1"
                    className="relative"
                    style={{
                        backgroundColor: "#f9fafb",
                        height: '100%'
                    }}
                >
                    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onInit={setReactFlowInstance}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                        >
                            <Controls />
                            <MiniMap />
                            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                        </ReactFlow>
                    </div>
                </Box>

                {/* Right Sidebar: Setup */}
                <Box
                    style={{ width: "320px" }}
                    borderL="1"
                    borderColor="border.tertiary"
                    display="flex"
                    flexDirection="column"
                    bg="bg.default"
                >
                    <Box
                        style={{ height: "56px" }}
                        px="20"
                        borderB="1"
                        borderColor="border.tertiary"
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Box display="flex" alignItems="center" gap="8">
                            <IconCodeBranch size={20} color="var(--ax-colors-fg-secondary)" />
                            <Text fontWeight="700">Workflow Setup</Text>
                        </Box>
                        <Button
                            icon={<IconX size={16} />}
                            appearance="subtle"
                            aria-label="Close"
                            size="sm"
                        />
                    </Box>

                    <Box flex="1" overflowY="auto" p="20" display="flex" flexDirection="column" gap="20">
                        <Box display="flex" alignItems="center" gap="12">
                            <Switch checked={active} onCheckedChange={setActive} />
                            <Text asChild fontSize="sm" fontWeight="500">
                                <label>Active</label>
                            </Text>
                        </Box>

                        <Box display="flex" flexDirection="column" gap="8">
                            <Box display="flex" gap="4">
                                <Text asChild fontSize="sm" fontWeight="500">
                                    <label>Name</label>
                                </Text>
                                <Text fontSize="sm" color="fg.error">*</Text>
                            </Box>
                            <Input defaultValue="Untitled workflow" />
                        </Box>

                        <Box display="flex" flexDirection="column" gap="8">
                            <Box display="flex" gap="4">
                                <Text asChild fontSize="sm" fontWeight="500">
                                    <label>Id</label>
                                </Text>
                                <Text fontSize="sm" color="fg.error">*</Text>
                            </Box>
                            <Input defaultValue="workflow_id" />
                            <Text fontSize="xs" color="fg.tertiary">@workflow_id</Text>
                        </Box>

                        <Box display="flex" flexDirection="column" gap="8">
                            <Box display="flex" gap="4" alignItems="center">
                                <Text asChild fontSize="sm" fontWeight="500">
                                    <label>Description</label>
                                </Text>
                                <IconSearch size={14} color="var(--ax-colors-fg-tertiary)" />
                            </Box>
                            <Textarea
                                placeholder="What does this workflow agent do?"
                                resize="vertical"
                                className="h-20"
                            />
                        </Box>

                        <Box display="flex" flexDirection="column" gap="8">
                            <Box display="flex" gap="4" alignItems="center">
                                <Text asChild fontSize="sm" fontWeight="500">
                                    <label>Plan</label>
                                </Text>
                                <IconSearch size={14} color="var(--ax-colors-fg-tertiary)" />
                            </Box>
                            <Box
                                p="12"
                                border="1"
                                borderColor="border.tertiary"
                                rounded="md"
                                style={{ backgroundColor: "#f9fafb" }}
                            >
                                <Text fontSize="sm" color="fg.secondary">
                                    The plan outlines how this agent will complete its task—step-by-step.
                                    It will be auto-generated based on your agent description and selected tools.
                                </Text>
                                <Text fontSize="sm" color="fg.secondary" mt="12">
                                    You can review and customize it after generation.
                                </Text>
                            </Box>
                        </Box>
                    </Box>

                    <Box
                        p="16"
                        borderT="1"
                        borderColor="border.tertiary"
                        display="flex"
                        justifyContent="flex-end"
                        gap="8"
                    >
                        <Button appearance="subtle">Cancel</Button>
                        <Button appearance="primary">Save</Button>
                        <Button
                            icon={<IconDots size={16} />}
                            appearance="subtle"
                            aria-label="More options"
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default function WorkflowBuilderPageWrapper() {
    return (
        <ReactFlowProvider>
            <WorkflowBuilder />
        </ReactFlowProvider>
    );
}

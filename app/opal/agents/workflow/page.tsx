"use client";

import {
    Box,
    Heading,
    Text,
    Button,
    Badge,
    Textarea,
    type BoxProps,
    Disclosure,
    DisclosureTrigger,
    DisclosureContent,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    SearchInput,
} from "@optiaxiom/react";
import { Layout } from "@optiaxiom/react/unstable";
import {
    IconSearch,
    IconMenu2,
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
    IconPlay,
    IconXmark,
    IconEllipsisStroke,
} from "@optimizely/axiom-icons";
import { useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    EmailTriggerPanel,
    ConditionPanel,
    InAppEventPanel,
    SchedulerPanel,
    WorkflowSetupPanel
} from "./components/SidebarPanels";
import {
    ActionNode,
    LoopNode,
    AddTriggerNode,
    StepPlaceholderNode
} from "./components/WorkflowNodes";
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
    MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";



const initialNodes = [
    {
        id: 'add-trigger',
        type: 'addTrigger',
        data: { label: 'Add Trigger' },
        position: { x: 300, y: 50 },
    },
    {
        id: 'node-placeholder-step',
        type: 'stepPlaceholder',
        data: { label: 'Drag and drop step' },
        position: { x: 300, y: 250 },
    }
];

const initialEdges = [
    {
        id: 'e1-2',
        source: 'add-trigger',
        target: 'node-placeholder-step',
        type: 'default',
        markerEnd: {
            type: MarkerType.ArrowClosed,
        },
        style: { strokeDasharray: '5,5' } // Make edge dashed as per common design patterns for placeholders or future steps
    }
];

let id = 0;
const getId = () => `dndnode_${id++}`;

function WorkflowBuilder() {
    const router = useRouter();
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isSetupPanelOpen, setIsSetupPanelOpen] = useState(true);
    const [isLibraryOpen, setIsLibraryOpen] = useState(true);
    const [workflowName, setWorkflowName] = useState("Untitled Workflow");
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // React Flow hooks
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    const nodeTypes = useMemo(() => ({
        action: ActionNode,
        trigger: ActionNode, // Using ActionNode for triggers as they look similar
        loop: LoopNode,
        addTrigger: AddTriggerNode,
        stepPlaceholder: StepPlaceholderNode
    }), []);

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
            const iconKey = event.dataTransfer.getData('application/reactflow/iconKey');
            const bg = event.dataTransfer.getData('application/reactflow/bg');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // Reconstruct the icon component based on the key (this is a simplified way, ideally we'd pass serializable data)
            // Since we can't pass the React element through dataTransfer, we need to lookup from the components list again or a map.
            // For now, I'll essentially rely on finding the item in the components list.

            let iconNode = null;
            // Iterate over all components to find the matching name/icon.
            // This is slightly inefficient but fine for this scale.
            let foundItem: any = null;
            Object.values(components).flat().forEach((c: any) => {
                if (c.name === label) foundItem = c;
            })

            if (foundItem) {
                iconNode = foundItem.icon;
            }

            const newNode = {
                id: getId(),
                type,
                position,
                data: {
                    label: label,
                    icon: iconNode,
                    bg: bg,
                    description: "Description goes here" // Default description
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    const onNodeClick = useCallback((event: any, node: any) => {
        setSelectedNodeId(node.id);
        setIsSetupPanelOpen(false); // Close main setup panel when a node is selected
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
        // Do not automatically re-open setup panel, let user choose actions
    }, []);

    const onDragStart = (event: any, nodeType: string, item: any) => {
        event.dataTransfer.setData('application/reactflow/type', nodeType);
        event.dataTransfer.setData('application/reactflow/label', item.name);
        event.dataTransfer.setData('application/reactflow/bg', item.bg);
        event.dataTransfer.effectAllowed = 'move';
    };

    // Sidebar Data
    const components: Record<string, any[]> = {
        Agents: [
            { name: "Design Analyst", icon: <IconAgent />, bg: "bg.avatar.purple", type: 'action' },
            { name: "Frontend Development...", icon: <IconCodeBranch />, bg: "bg.avatar.purple", type: 'action' },
        ],
        Data: [],
        Inputs: [
            { name: "Instruction", icon: <IconBook />, bg: "bg.accent.subtle", type: 'action' },
            { name: "Prompts", icon: <IconTerminal />, bg: "bg.accent.subtle", type: 'action' },
        ],
        Triggers: [
            { name: "Chat Input", icon: <IconComments />, bg: "bg.success.subtle", type: 'trigger' },
            { name: "Email", icon: <IconEnvelope />, bg: "bg.success.subtle", type: 'trigger' },
            { name: "In-app Event", icon: <IconHandPointer />, bg: "bg.success.subtle", type: 'trigger' },
            { name: "Scheduler", icon: <IconClock />, bg: "bg.success.subtle", type: 'trigger' },
            { name: "Webhook", icon: <IconWebhook />, bg: "bg.success.subtle", type: 'trigger' },
        ],
        Outputs: [],
        Logic: [
            { name: "Condition", icon: <IconSplit />, bg: "bg.accent.subtle", type: 'action' },
            { name: "Loop", icon: <IconArrowsRepeat />, bg: "bg.accent.subtle", type: 'loop' },
            { name: "User Approval", icon: <IconUserCheck />, bg: "bg.accent.subtle", type: 'action' },
        ],
    };

    return (
        <Box h="full" bg="bg.default">
            <Layout
                resizable
                style={{ height: '100%' }}
                header={
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
                                appearance={isLibraryOpen ? "default" : "subtle"}
                                aria-label="Toggle Component Library"
                                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                            />
                            <Text fontSize="lg" fontWeight="600">{workflowName}</Text>
                        </Box>
                        <Box display="flex" alignItems="center" gap="8">
                            <Button appearance="primary">Save</Button>
                            <Button appearance="subtle" icon={<IconPlay />} aria-label="Test" />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button appearance="subtle" icon={<IconEllipsisStroke />} aria-label="Context Menu" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => {
                                        setSelectedNodeId(null);
                                        setIsSetupPanelOpen(true);
                                    }}>
                                        Edit Info
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button appearance="subtle" icon={<IconXmark />} onClick={() => router.push('/opal/agents')} aria-label="Close" />
                        </Box>
                    </Box>
                }
                sidebar={
                    isLibraryOpen ? (
                        <Box
                            style={{ width: "280px", height: "100%" }}
                            borderR="1"
                            borderColor="border.tertiary"
                            display="flex"
                            flexDirection="column"
                            bg="bg.default"
                        >
                            <Box p="16" borderB="1" borderColor="border.tertiary">
                                {isSearching ? (
                                    <SearchInput
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search components..."
                                        autoFocus
                                    />
                                ) : (
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        cursor="pointer"
                                        onClick={() => setIsSearching(true)}
                                    >
                                        <Text fontWeight="700">Components</Text>
                                        <IconSearch size={16} color="var(--ax-colors-fg-tertiary)" />
                                    </Box>
                                )}
                            </Box>

                            <Box flex="1" overflowY="auto">
                                {Object.entries(components).map(([category, items]) => {
                                    const isCategoryMatch = category.toLowerCase().includes(searchQuery.toLowerCase());
                                    const filteredItems = isCategoryMatch
                                        ? items
                                        : items.filter(item =>
                                            item.name.toLowerCase().includes(searchQuery.toLowerCase())
                                        );

                                    if (searchQuery && filteredItems.length === 0) {
                                        return null;
                                    }

                                    return (
                                        <Disclosure key={category} defaultOpen={["Agents", "Inputs", "Triggers", "Logic"].includes(category) || !!searchQuery}>
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
                                                    {filteredItems.length > 0 ? (
                                                        filteredItems.map((item, index) => (
                                                            <div
                                                                key={index}
                                                                draggable
                                                                onDragStart={(event) => onDragStart(event, item.type, item)}
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
                                    );
                                })}
                            </Box>
                        </Box>
                    ) : null
                }
                detailsPanel={
                    (() => {
                        const selectedNode = nodes.find((n) => n.id === selectedNodeId);
                        if (selectedNode) {
                            const label = selectedNode.data.label;

                            switch (label) {
                                case "Email":
                                    return <EmailTriggerPanel onClose={() => setSelectedNodeId(null)} />;
                                case "Condition":
                                    return <ConditionPanel onClose={() => setSelectedNodeId(null)} />;
                                case "In-app Event":
                                    return <InAppEventPanel onClose={() => setSelectedNodeId(null)} />;
                                case "Scheduler":
                                    return <SchedulerPanel onClose={() => setSelectedNodeId(null)} />;
                                default:
                                    return <WorkflowSetupPanel
                                        onClose={() => setSelectedNodeId(null)}
                                        workflowName={workflowName}
                                        onNameChange={setWorkflowName}
                                    />;
                            }
                        }

                        if (isSetupPanelOpen) {
                            return <WorkflowSetupPanel
                                onClose={() => setIsSetupPanelOpen(false)}
                                onSave={() => setIsSetupPanelOpen(false)}
                                workflowName={workflowName}
                                onNameChange={setWorkflowName}
                            />;
                        }

                        return null;
                    })()
                }
            >
                {/* Center Canvas */}
                <Box
                    flex="1"
                    className="relative"
                    style={{
                        backgroundColor: "#f9fafb",
                        height: '100%'
                    }}
                >
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        ref={reactFlowWrapper}
                    >
                        <Controls />
                        <MiniMap />
                        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                    </ReactFlow>
                </Box>
            </Layout>
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

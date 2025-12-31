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
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    EmailTriggerPanel,
    ConditionPanel,
    InAppEventPanel,
    SchedulerPanel,
    WorkflowSetupPanel
} from "./components/SidebarPanels";
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
    type Connection,
    type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";



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
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isSetupPanelOpen, setIsSetupPanelOpen] = useState(true);
    const [isLibraryOpen, setIsLibraryOpen] = useState(true);
    const [workflowName, setWorkflowName] = useState("Untitled Workflow");
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // React Flow hooks
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
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

    const onNodeClick = useCallback((event: any, node: any) => {
        setSelectedNodeId(node.id);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
        // Do not close setup panel here necessarily, or maybe yes if we want to deselect node? 
        // User request: "once users click on save, close the tray". 
        // We will keep 'isSetupPanelOpen' independent of node selection, but if a node is selected, it takes precedence in view.
        // Actually, usually selecting a node REPLACES the setup view. Deselecting might bring it back or empty. 
        // Let's assume clicking pane deselects node, effectively hiding node panel. 
        // If setup panel was open, it might show again, or we can say setup panel is "modal-ish" side panel. 
        // Let's stick to: Node Panel overrides Setup Panel.
    }, []);

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
                            onNodeClick={onNodeClick}
                            onPaneClick={onPaneClick}
                        >
                            <Controls />
                            <MiniMap />
                            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                        </ReactFlow>
                    </div>
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

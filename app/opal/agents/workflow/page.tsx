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
	Menu,
	MenuTrigger,
	MenuContent,
	SearchInput,
	Switch,
} from "@optiaxiom/react";
import {Layout} from "@optiaxiom/react/unstable";
import {IconSparkles as IconWand} from "@optimizely/axiom-icons";
import {IconAgent} from "@optimizely/axiom-icons";
import {
	IconSearch,
	IconBars,
	IconGripVertical,
	IconChevronDown,
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
	IconFileArrowUp,
} from "@optiaxiom/icons";
import {useState, useRef, useCallback, useMemo, useEffect, Suspense} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {
	EmailTriggerPanel,
	ConditionPanel,
	InAppEventPanel,
	SchedulerPanel,
	WorkflowSetupPanel,
	AgentNodePanel,
} from "./components/SidebarPanels";
import {
	ActionNode,
	TriggerNode,
	LoopNode,
	ConditionNode,
	AddTriggerNode,
	StepPlaceholderNode,
	ConditionEdge,
	ApprovalNode,
} from "./components/WorkflowNodes";
import WebhookIcon from "./icon/WebhookIcon";
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
	MarkerType,
	Panel,
	ControlButton,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ELK from "elkjs/lib/elk.bundled.js";

const elk = new ELK();

const getLayoutedElements = async (nodes: any[], edges: any[], options: any = {}) => {
	const isHorizontal = options?.["elk.direction"] === "RIGHT";
	const graph: any = {
		id: "root",
		layoutOptions: {
			...options,
			"elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
			"elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
		},
		children: nodes.map((node) => {
			const ports: any[] = [];

			// Define target port
			ports.push({
				id: `${node.id}-target`,
				properties: {
					"port.side": isHorizontal ? "WEST" : "NORTH",
				},
			});

			// Define source ports
			if (node.type === "condition" && node.data?.conditions) {
				node.data.conditions.forEach((_: any, index: number) => {
					ports.push({
						id: `${node.id}-rule-${index}`,
						properties: {
							"port.side": isHorizontal ? "EAST" : "SOUTH",
							"port.index": index,
						},
					});
				});
			} else {
				ports.push({
					id: `${node.id}-source`,
					properties: {
						"port.side": isHorizontal ? "EAST" : "SOUTH",
					},
				});
			}

			return {
				id: node.id,
				width: node.measured?.width ?? (node.type === "condition" ? 280 : 240),
				height:
					node.measured?.height ??
					(node.type === "condition"
						? 120 + (node.data?.conditions?.length || 0) * 40
						: 120),
				ports,
				// Pass through original node for mapping back
				originalNode: node,
			};
		}),
		edges: edges.map((edge) => {
			const sourcePortId = edge.sourceHandle || `${edge.source}-source`;
			const targetPortId = edge.targetHandle || `${edge.target}-target`;
			return {
				id: edge.id,
				sources: [sourcePortId],
				targets: [targetPortId],
			};
		}),
	};

	try {
		const layoutedGraph = await elk.layout(graph);
		return {
			nodes:
				layoutedGraph.children?.map((node: any) => ({
					...node.originalNode,
					targetPosition: isHorizontal ? "left" : "top",
					sourcePosition: isHorizontal ? "right" : "bottom",
					position: {x: node.x, y: node.y},
				})) || [],
			edges: edges,
		};
	} catch (e) {
		console.error("ELK Layout failed:", e);
		return {nodes, edges};
	}
};

const INITIAL_NODES: any[] = [
	{
		id: "add-trigger",
		type: "addTrigger",
		data: {label: "Add Trigger"},
		position: {x: 300, y: 50},
	},
	{
		id: "node-placeholder-step",
		type: "stepPlaceholder",
		data: {label: "Drag and drop step"},
		position: {x: 300, y: 250},
	},
];

const INITIAL_EDGES: any[] = [
	{
		id: "e-default-1",
		source: "add-trigger",
		target: "node-placeholder-step",
		type: "smoothstep",
		markerEnd: {type: MarkerType.ArrowClosed},
		style: {strokeDasharray: "5,5"},
	},
];

const WF_AGENT_NODES: any[] = [
	{
		id: "wf-start",
		type: "trigger",
		position: {x: 300, y: 50},
		data: {
			label: "Start",
			description: "Workflow triggered by CMP task submission",
			bg: "bg.success.subtle",
		},
	},
	{
		id: "wf-review",
		type: "action",
		position: {x: 300, y: 220},
		data: {
			label: "Review",
			description: "Opal agent reviews content and prepares approval request",
			bg: "bg.accent.subtle",
		},
	},
	{
		id: "wf-approval",
		type: "approval",
		position: {x: 300, y: 390},
		data: {label: "Approval", description: "Waiting for human review and sign-off"},
	},
	{
		id: "wf-end",
		type: "action",
		position: {x: 300, y: 560},
		data: {
			label: "End",
			description: "Workflow complete — artifact published",
			bg: "bg.tertiary",
		},
	},
];

const WF_AGENT_EDGES: any[] = [
	{
		id: "e-start-review",
		source: "wf-start",
		target: "wf-review",
		type: "smoothstep",
		markerEnd: {type: MarkerType.ArrowClosed},
	},
	{
		id: "e-review-approval",
		source: "wf-review",
		target: "wf-approval",
		type: "smoothstep",
		markerEnd: {type: MarkerType.ArrowClosed},
	},
	{
		id: "e-approval-end",
		source: "wf-approval",
		target: "wf-end",
		type: "smoothstep",
		markerEnd: {type: MarkerType.ArrowClosed},
	},
];

const CMP_NODES: any[] = [
	{
		id: "node-gate",
		type: "action",
		position: {x: 50, y: 200},
		data: {
			label: "CMP Workflow Gate",
			icon: <WebhookIcon />,
			bg: "bg.avatar.purple",
			description: "Inspects incoming CMP webhook payloads and routes to the correct agent.",
		},
	},
	{
		id: "node-condition",
		type: "condition",
		position: {x: 350, y: 150},
		data: {
			label: "Condition",
			description: "Click to configure conditions",
			conditions: [
				{matchType: "equals", value: "brief-enrichment"},
				{matchType: "equals", value: "campaign-strategy"},
				{matchType: "equals", value: "asset-requirements"},
				{matchType: "equals", value: "image-creation"},
				{matchType: "equals", value: "content-creation"},
			],
		},
	},
	{
		id: "agent-brief",
		type: "action",
		position: {x: 750, y: 20},
		data: {
			label: "Brief Enrichment Agent",
			icon: <IconAgent />,
			bg: "bg.avatar.purple",
			description: "Reads an incoming campaign brief, enriches it with seasonal context,...",
			outputType: "JSON",
		},
	},
	{
		id: "agent-strategy",
		type: "action",
		position: {x: 920, y: 220},
		data: {
			label: "Campaign Strategy Agent",
			icon: <IconAgent />,
			bg: "bg.avatar.purple",
			description:
				"Reads an enriched campaign brief and produces a full campaign strategy —...",
			outputType: "JSON",
		},
	},
	{
		id: "agent-requirements",
		type: "action",
		position: {x: 820, y: 400},
		data: {
			label: "Asset Requirements Agent",
			icon: <IconAgent />,
			bg: "bg.avatar.purple",
			description:
				"Translates a campaign strategy into a complete asset requirements list —...",
			outputType: "JSON",
		},
	},
	{
		id: "agent-image",
		type: "action",
		position: {x: 250, y: 620},
		data: {
			label: "Image Creation Agent",
			icon: <IconAgent />,
			bg: "bg.avatar.purple",
			description:
				"Reads the asset requirements from a campaign brief and generates chann...",
			outputType: "JSON",
		},
	},
	{
		id: "agent-content",
		type: "action",
		position: {x: 620, y: 620},
		data: {
			label: "Content Creation Agent",
			icon: <IconAgent />,
			bg: "bg.avatar.purple",
			description:
				"Reads a fully developed campaign brief and produces copy for every asset in...",
			outputType: "JSON",
		},
	},
];

const CMP_EDGES: any[] = [
	{
		id: "e-gate-condition",
		source: "node-gate",
		target: "node-condition",
		type: "smoothstep",
		markerEnd: {type: MarkerType.ArrowClosed},
	},
	{
		id: "e-cond-brief",
		source: "node-condition",
		sourceHandle: "node-condition-rule-0",
		target: "agent-brief",
		type: "condition",
		label: "equals: brief-enrichment",
		markerEnd: {type: MarkerType.ArrowClosed},
	},
	{
		id: "e-cond-strategy",
		source: "node-condition",
		sourceHandle: "node-condition-rule-1",
		target: "agent-strategy",
		type: "condition",
		label: "equals: campaign-strategy",
		markerEnd: {type: MarkerType.ArrowClosed},
	},
	{
		id: "e-cond-requirements",
		source: "node-condition",
		sourceHandle: "node-condition-rule-2",
		target: "agent-requirements",
		type: "condition",
		label: "equals: asset-requirements",
		markerEnd: {type: MarkerType.ArrowClosed},
	},
	{
		id: "e-cond-image",
		source: "node-condition",
		sourceHandle: "node-condition-rule-3",
		target: "agent-image",
		type: "condition",
		label: "equals: image-creation",
		markerEnd: {type: MarkerType.ArrowClosed},
	},
	{
		id: "e-cond-content",
		source: "node-condition",
		sourceHandle: "node-condition-rule-4",
		target: "agent-content",
		type: "condition",
		label: "equals: content-creation",
		markerEnd: {type: MarkerType.ArrowClosed},
	},
];

let id = 0;
const getId = () => `dndnode_${id++}`;

function WorkflowBuilder() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const preset = searchParams.get("preset");

	const isViewingExisting = !!preset;

	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [isSetupPanelOpen, setIsSetupPanelOpen] = useState(!isViewingExisting);
	const [isLibraryOpen, setIsLibraryOpen] = useState(!isViewingExisting);
	const [isEditing, setIsEditing] = useState(false);
	const [workflowName, setWorkflowName] = useState(
		preset === "cmp-workflow"
			? "CMP Workflow Agent"
			: preset === "wf-agent"
				? "WF Approval Agent"
				: "Untitled Workflow"
	);
	const [isSearching, setIsSearching] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isElkEnabled, setIsElkEnabled] = useState(false);

	// React Flow hooks
	const reactFlowWrapper = useRef(null);
	const [nodes, setNodes, onNodesChange] = useNodesState(
		preset === "cmp-workflow"
			? CMP_NODES
			: preset === "wf-agent"
				? WF_AGENT_NODES
				: INITIAL_NODES
	);
	const [edges, setEdges, onEdgesChange] = useEdgesState(
		preset === "cmp-workflow"
			? CMP_EDGES
			: preset === "wf-agent"
				? WF_AGENT_EDGES
				: INITIAL_EDGES
	);
	const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

	const nodeTypes = useMemo(
		() => ({
			action: ActionNode,
			trigger: TriggerNode,
			loop: LoopNode,
			condition: ConditionNode,
			addTrigger: AddTriggerNode,
			stepPlaceholder: StepPlaceholderNode,
			approval: ApprovalNode,
		}),
		[]
	);

	const edgeTypes = useMemo(
		() => ({
			condition: ConditionEdge,
		}),
		[]
	);

	const onConnect = useCallback(
		(params: Connection) => setEdges((eds) => addEdge(params, eds)),
		[setEdges]
	);

	const onDragOver = useCallback((event: any) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	// Sidebar Data
	const components: Record<string, any[]> = {
		Agents: [
			{
				name: "Design Analyst",
				icon: <IconAgent />,
				bg: "bg.avatar.purple",
				type: "action",
				outputType: "JSON",
			},
			{
				name: "Hypothesis Creator",
				icon: <IconCodeBranch />,
				bg: "bg.avatar.purple",
				type: "action",
				outputType: "JSON",
			},
		],
		Data: [
			{
				name: "Import (Upload)",
				icon: <IconFileArrowUp />,
				bg: "bg.accent.subtle",
				type: "action",
			},
		],
		Inputs: [
			{name: "Skill", icon: <IconBook />, bg: "bg.accent.subtle", type: "action"},
			{name: "Prompts", icon: <IconTerminal />, bg: "bg.accent.subtle", type: "action"},
		],
		Triggers: [
			{name: "Chat Input", icon: <IconComments />, bg: "bg.success.subtle", type: "trigger"},
			{name: "Email", icon: <IconEnvelope />, bg: "bg.success.subtle", type: "trigger"},
			{
				name: "In-app Event",
				icon: <IconHandPointer />,
				bg: "bg.success.subtle",
				type: "trigger",
			},
			{name: "Scheduler", icon: <IconClock />, bg: "bg.success.subtle", type: "trigger"},
			{name: "Webhook", icon: <WebhookIcon />, bg: "bg.success.subtle", type: "trigger"},
		],
		Outputs: [],
		Logic: [
			{
				name: "Condition",
				icon: <IconSplit />,
				bg: "bg.accent.subtle",
				type: "condition",
				category: "Logic",
			},
			{name: "Loop", icon: <IconArrowsRepeat />, bg: "bg.accent.subtle", type: "loop"},
			{
				name: "User Approval",
				icon: <IconUserCheck />,
				bg: "bg.accent.subtle",
				type: "approval",
				description: "Waiting for human review",
			},
		],
	};

	const onDrop = useCallback(
		(event: any) => {
			event.preventDefault();

			if (!reactFlowInstance) {
				return;
			}

			const type = event.dataTransfer.getData("application/reactflow/type");
			const label = event.dataTransfer.getData("application/reactflow/label");
			const iconKey = event.dataTransfer.getData("application/reactflow/iconKey");
			const bg = event.dataTransfer.getData("application/reactflow/bg");

			if (typeof type === "undefined" || !type) {
				return;
			}

			const position = reactFlowInstance.screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});

			// Find valid component info
			let iconNode = null;
			let foundItem: any = null;
			Object.values(components)
				.flat()
				.forEach((c: any) => {
					if (c.name === label) foundItem = c;
				});
			if (foundItem) {
				iconNode = foundItem.icon;
			}

			// --- HIT DETECTION ---
			const hitNode = nodes.find((n: any) => {
				const w = n.measured?.width || 240;
				const h = n.measured?.height || 80;
				return (
					position.x >= n.position.x &&
					position.x <= n.position.x + w &&
					position.y >= n.position.y &&
					position.y <= n.position.y + h
				);
			});

			// --- SCENARIO 1: Drop Trigger into 'Add Trigger' ---
			if (hitNode && hitNode.id === "add-trigger" && type === "trigger") {
				const newTriggerId = getId();
				const newTriggerNode = {
					id: newTriggerId,
					type: "trigger",
					position: hitNode.position,
					data: {
						label,
						icon: iconNode,
						bg,
						description: "Trigger configuration",
						active: true,
					},
				};

				setNodes((nds) => nds.map((n) => (n.id === "add-trigger" ? newTriggerNode : n)));
				setEdges((eds) =>
					eds.map((e) => {
						if (e.source === "add-trigger") {
							return {...e, source: newTriggerId};
						}
						return e;
					})
				);
				return;
			}

			// --- SCENARIO 2: Drop Step into Placeholder ---
			if (hitNode && hitNode.type === "stepPlaceholder") {
				const newNodeId = getId();
				const newNode = {
					id: newNodeId,
					type,
					position: hitNode.position,
					data: {
						label: label || "Step",
						icon: iconNode,
						bg,
						description:
							type === "condition" ? "All website activities" : "Step description",
						outputType: foundItem?.outputType,
						conditions:
							type === "condition"
								? [
										{matchType: "equals", value: ""},
										{matchType: "equals", value: ""},
									]
								: undefined,
					},
				};

				if (type === "condition") {
					const p1Id = `placeholder-${Date.now()}-1`;
					const p2Id = `placeholder-${Date.now()}-2`;
					const newPlaceholderY = hitNode.position.y + 160;

					const p1 = {
						id: p1Id,
						type: "stepPlaceholder",
						data: {label: "Drag and drop step"},
						position: {x: hitNode.position.x - 140, y: newPlaceholderY},
					};
					const p2 = {
						id: p2Id,
						type: "stepPlaceholder",
						data: {label: "Drag and drop step"},
						position: {x: hitNode.position.x + 140, y: newPlaceholderY},
					};

					setNodes((nds) => {
						const filtered = nds.filter((n) => n.id !== hitNode.id);
						return [...filtered, newNode, p1, p2];
					});

					setEdges((eds) => {
						const updatedEdges = eds.map((e) => {
							if (e.target === hitNode.id) {
								return {...e, target: newNodeId, style: {strokeDasharray: "0"}};
							}
							return e;
						});

						const e1 = {
							id: `e-${newNodeId}-${p1Id}`,
							source: newNodeId,
							target: p1Id,
							type: "condition",
							label: "",
							markerEnd: {type: MarkerType.ArrowClosed},
							style: {strokeDasharray: "5,5"},
						};
						const e2 = {
							id: `e-${newNodeId}-${p2Id}`,
							source: newNodeId,
							target: p2Id,
							type: "condition",
							label: "",
							markerEnd: {type: MarkerType.ArrowClosed},
							style: {strokeDasharray: "5,5"},
						};

						return [...updatedEdges, e1, e2];
					});
					return;
				}

				const newPlaceholderId = `placeholder-${Date.now()}`;
				const newPlaceholder = {
					id: newPlaceholderId,
					type: "stepPlaceholder",
					data: {label: "Drag and drop step"},
					position: {
						x: hitNode.position.x,
						y: hitNode.position.y + (foundItem?.outputType ? 240 : 160),
					},
				};

				setNodes((nds) => {
					const filtered = nds.filter((n) => n.id !== hitNode.id);
					return [...filtered, newNode, newPlaceholder];
				});

				setEdges((eds) => {
					const updatedEdges = eds.map((e) => {
						if (e.target === hitNode.id) {
							return {...e, target: newNodeId, style: {strokeDasharray: "0"}};
						}
						return e;
					});

					const newEdge = {
						id: `e-${newNodeId}-${newPlaceholderId}`,
						source: newNodeId,
						target: newPlaceholderId,
						type: "smoothstep",
						markerEnd: {type: MarkerType.ArrowClosed},
						style: {strokeDasharray: "5,5"},
					};

					return [...updatedEdges, newEdge];
				});
				return;
			}

			// --- SCENARIO 3: Default Drop ---
			const newNode = {
				id: getId(),
				type,
				position,
				data: {
					label: label,
					icon: iconNode,
					bg: bg,
					description: "Description goes here",
					outputType: foundItem?.outputType,
				},
			};

			setNodes((nds) => nds.concat(newNode));
		},
		[reactFlowInstance, setNodes, setEdges, nodes, components]
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
		event.dataTransfer.setData("application/reactflow/type", nodeType);
		event.dataTransfer.setData("application/reactflow/label", item.name);
		event.dataTransfer.setData("application/reactflow/bg", item.bg);
		event.dataTransfer.effectAllowed = "move";
	};

	const onLayout = useCallback(
		({direction}: {direction: string}) => {
			if (!reactFlowInstance) return;

			// Store current viewport to restore after layout
			const currentViewport = reactFlowInstance.getViewport();

			// Find the top-most node to use as anchor (min Y)
			const firstNode = nodes.reduce((highest, node) => {
				// Prefer non-placeholder nodes if at similar Y, but generally trust Y
				if (!highest) return node;
				return node.position.y < highest.position.y ? node : highest;
			}, null as any);

			const firstNodeOriginalPosition = firstNode ? {...firstNode.position} : null;

			const opts = {
				"elk.direction": direction,
				"elk.algorithm": "layered",
				"elk.spacing.nodeNode": "64",
				"elk.layered.spacing.nodeNodeBetweenLayers": "88",
			};

			getLayoutedElements(nodes, edges, opts).then(
				({nodes: layoutedNodes, edges: layoutedEdges}) => {
					if (!firstNode || !firstNodeOriginalPosition) {
						setNodes(layoutedNodes);
						setEdges(layoutedEdges);
						setTimeout(() => {
							reactFlowInstance.setViewport(currentViewport);
						}, 0);
						return;
					}

					// Find the first node in the layouted nodes
					const layoutedFirstNode = layoutedNodes.find((n) => n.id === firstNode.id);

					if (layoutedFirstNode) {
						// Calculate the offset needed to keep first node in place
						const offsetX = firstNodeOriginalPosition.x - layoutedFirstNode.position.x;
						const offsetY = firstNodeOriginalPosition.y - layoutedFirstNode.position.y;

						// Apply offset to all nodes to preserve first node position
						const adjustedNodes = layoutedNodes.map((node) => ({
							...node,
							position: {
								x: node.position.x + offsetX,
								y: node.position.y + offsetY,
							},
						}));

						setNodes(adjustedNodes);
					} else {
						setNodes(layoutedNodes);
					}

					setEdges(layoutedEdges);

					// Restore viewport to prevent shifting
					setTimeout(() => {
						reactFlowInstance.setViewport(currentViewport);
					}, 0);
				}
			);
		},
		[nodes, edges, setNodes, setEdges, reactFlowInstance]
	);

	const toggleLayout = useCallback(() => {
		setIsElkEnabled((prev) => {
			const next = !prev;
			if (next) {
				onLayout({direction: "RIGHT"});
			}
			return next;
		});
	}, [onLayout]);

	const onNodeDragStop = useCallback(
		(event: any, node: any) => {
			// Check if the node was dragged over a dropzone
			const nodeRect = event.target.getBoundingClientRect?.();
			if (!nodeRect) return;

			// Find if there's a dropzone at this position
			const hitNode = nodes.find((n: any) => {
				if (n.id === node.id) return false; // Skip self
				const w = n.measured?.width || 240;
				const h = n.measured?.height || 80;
				const centerX = node.position.x + (node.measured?.width || 240) / 2;
				const centerY = node.position.y + (node.measured?.height || 80) / 2;

				return (
					centerX >= n.position.x &&
					centerX <= n.position.x + w &&
					centerY >= n.position.y &&
					centerY <= n.position.y + h
				);
			});

			if (!hitNode) return;

			// Handle dropping on "Add Trigger"
			if (hitNode.id === "add-trigger" && node.type === "trigger") {
				setNodes((nds) =>
					nds
						.map((n) => {
							if (n.id === "add-trigger") {
								return {...node, position: hitNode.position};
							}
							if (n.id === node.id && n.id !== "add-trigger") {
								return null as any;
							}
							return n;
						})
						.filter(Boolean)
				);

				setEdges((eds) =>
					eds.map((e) => {
						if (e.source === "add-trigger") {
							return {...e, source: node.id};
						}
						return e;
					})
				);
				return;
			}

			// Handle dropping on step placeholder
			if (hitNode.type === "stepPlaceholder") {
				const newPlaceholderId = `placeholder-${Date.now()}`;
				const isTall = !!(node.data as any)?.outputType;

				const newPlaceholder = {
					id: newPlaceholderId,
					type: "stepPlaceholder",
					data: {label: "Drag and drop step"},
					position: {
						x: hitNode.position.x,
						y: hitNode.position.y + (isTall ? 240 : 160),
					},
				};

				setNodes((nds) =>
					nds.map((n) => {
						if (n.id === node.id) {
							return {...n, position: hitNode.position};
						}
						if (n.id === hitNode.id) {
							return newPlaceholder;
						}
						return n;
					})
				);

				setEdges((eds) => {
					const updatedEdges = eds.map((e) => {
						if (e.target === hitNode.id) {
							return {...e, target: node.id, style: {strokeDasharray: "0"}};
						}
						return e;
					});

					const newEdge = {
						id: `e-${node.id}-${newPlaceholderId}`,
						source: node.id,
						target: newPlaceholderId,
						type: "smoothstep",
						markerEnd: {type: MarkerType.ArrowClosed},
						style: {strokeDasharray: "5,5"},
					};

					return [...updatedEdges, newEdge];
				});
			}
		},
		[nodes, setNodes, setEdges]
	);

	return (
		<Box h="full" bg="bg.default">
			<Layout
				resizable
				style={{height: "100%"}}
				header={
					<Box
						h="56"
						style={{height: "56px"}}
						px="16"
						borderB="1"
						borderColor="border.tertiary"
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						bg="bg.default"
					>
						<Box display="flex" alignItems="center" gap="16">
							{(!isViewingExisting || isEditing) && (
								<Button
									icon={<IconBars />}
									appearance={isLibraryOpen ? "default" : "subtle"}
									aria-label="Toggle Component Library"
									onClick={() => setIsLibraryOpen(!isLibraryOpen)}
								/>
							)}
							<Text fontSize="lg" fontWeight="600">
								{workflowName}
							</Text>
							{isViewingExisting && !isEditing && (
								<Badge intent="neutral" variant="subtle">
									Workflow
								</Badge>
							)}
						</Box>
						<Box display="flex" alignItems="center" gap="8">
							{isViewingExisting && !isEditing ? (
								<>
									<Button
										appearance="subtle"
										icon={<IconPlay />}
										aria-label="Run"
									/>
									<Button
										appearance="primary"
										onClick={() => {
											setIsEditing(true);
											setIsLibraryOpen(true);
										}}
									>
										Edit
									</Button>
									<Menu
										options={[
											{
												label: "Edit Workflow",
												execute: () => {
													setIsEditing(true);
													setIsLibraryOpen(true);
												},
											},
										]}
									>
										<MenuTrigger asChild>
											<Button
												appearance="subtle"
												icon={<IconEllipsisStroke />}
												aria-label="Context Menu"
											/>
										</MenuTrigger>
										<MenuContent align="end" />
									</Menu>
								</>
							) : (
								<>
									<Button
										appearance="subtle"
										onClick={() => {
											if (isViewingExisting) {
												setIsEditing(false);
												setIsLibraryOpen(false);
											}
										}}
									>
										{isViewingExisting ? "Cancel" : "Discard"}
									</Button>
									<Button appearance="primary">Save</Button>
									<Button
										appearance="subtle"
										icon={<IconPlay />}
										aria-label="Test"
									/>
									<Menu
										options={[
											{
												label: "Edit Info",
												execute: () => {
													setSelectedNodeId(null);
													setIsSetupPanelOpen(true);
												},
											},
										]}
									>
										<MenuTrigger asChild>
											<Button
												appearance="subtle"
												icon={<IconEllipsisStroke />}
												aria-label="Context Menu"
											/>
										</MenuTrigger>
										<MenuContent align="end" />
									</Menu>
								</>
							)}
							<Button
								appearance="subtle"
								icon={<IconXmark />}
								onClick={() => router.push("/opal/agents")}
								aria-label="Close"
							/>
						</Box>
					</Box>
				}
				sidebar={
					isLibraryOpen && (!isViewingExisting || isEditing) ? (
						<Box
							style={{width: "280px", height: "100%"}}
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
										<IconSearch
											size={16}
											color="var(--ax-colors-fg-tertiary)"
										/>
									</Box>
								)}
							</Box>

							<Box flex="1" overflowY="auto">
								{Object.entries(components).map(([category, items]) => {
									const isCategoryMatch = category
										.toLowerCase()
										.includes(searchQuery.toLowerCase());
									const filteredItems = isCategoryMatch
										? items
										: items.filter((item) =>
												item.name
													.toLowerCase()
													.includes(searchQuery.toLowerCase())
											);

									if (searchQuery && filteredItems.length === 0) {
										return null;
									}

									return (
										<Disclosure
											key={category}
											defaultOpen={
												["Agents", "Inputs", "Triggers", "Logic"].includes(
													category
												) || !!searchQuery
											}
										>
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
												</Box>
											</DisclosureTrigger>
											<DisclosureContent>
												<Box display="flex" flexDirection="column" gap="4">
													{filteredItems.length > 0 ? (
														filteredItems.map((item, index) => (
															<div
																key={index}
																draggable
																onDragStart={(event) =>
																	onDragStart(
																		event,
																		item.type,
																		item
																	)
																}
																style={{cursor: "grab"}}
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
																		rounded={
																			category ===
																				"Triggers" ||
																			category === "Logic"
																				? "full"
																				: "sm"
																		}
																		// @ts-ignore - explicitly ignoring type check for bg prop here as tokens are dynamically assigned and valid
																		bg={
																			item.bg || "bg.tertiary"
																		}
																		color="fg.default"
																		display="flex"
																		alignItems="center"
																		justifyContent="center"
																	>
																		{item.icon}
																	</Box>
																	<Text fontSize="sm">
																		{item.name}
																	</Text>
																	<Box
																		ml="auto"
																		color="fg.tertiary"
																	>
																		<IconGripVertical
																			size={14}
																		/>
																	</Box>
																</Box>
															</div>
														))
													) : (
														<Text
															fontSize="sm"
															color="fg.tertiary"
															px="16"
														>
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
				detailsPanel={(() => {
					const selectedNode = nodes.find((n) => n.id === selectedNodeId);
					if (selectedNode) {
						const label = selectedNode.data?.label;

						switch (label) {
							case "Email":
								return (
									<EmailTriggerPanel onClose={() => setSelectedNodeId(null)} />
								);
							case "Condition":
								return (
									<ConditionPanel
										key={selectedNode.id}
										onClose={() => setSelectedNodeId(null)}
										node={selectedNode}
									/>
								);
							case "In-app Event":
								return <InAppEventPanel onClose={() => setSelectedNodeId(null)} />;
							case "Scheduler":
								return <SchedulerPanel onClose={() => setSelectedNodeId(null)} />;
							default:
								if ((selectedNode.data as any)?.outputType) {
									return (
										<AgentNodePanel
											onClose={() => setSelectedNodeId(null)}
											node={selectedNode}
										/>
									);
								}
								return (
									<WorkflowSetupPanel
										onClose={() => setSelectedNodeId(null)}
										workflowName={workflowName}
										onNameChange={setWorkflowName}
									/>
								);
						}
					}

					if (isSetupPanelOpen) {
						return (
							<WorkflowSetupPanel
								onClose={() => setIsSetupPanelOpen(false)}
								onSave={() => setIsSetupPanelOpen(false)}
								workflowName={workflowName}
								onNameChange={setWorkflowName}
							/>
						);
					}

					return null;
				})()}
			>
				{/* Center Canvas */}
				<Box
					flex="1"
					className="relative"
					style={{
						backgroundColor: "#f9fafb",
						height: "100%",
					}}
				>
					<ReactFlow
						nodes={nodes}
						edges={edges}
						nodeTypes={nodeTypes}
						edgeTypes={edgeTypes}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={isViewingExisting && !isEditing ? undefined : onConnect}
						onInit={setReactFlowInstance}
						onDrop={isViewingExisting && !isEditing ? undefined : onDrop}
						onDragOver={isViewingExisting && !isEditing ? undefined : onDragOver}
						onNodeClick={onNodeClick}
						onPaneClick={onPaneClick}
						onNodeDragStop={
							isViewingExisting && !isEditing ? undefined : onNodeDragStop
						}
						nodesDraggable={!isViewingExisting || isEditing}
						nodesConnectable={!isViewingExisting || isEditing}
						defaultEdgeOptions={{type: "smoothstep"}}
						ref={reactFlowWrapper}
					>
						<Controls>
							<ControlButton
								onClick={toggleLayout}
								title="Vertical Layout"
								aria-label="Vertical Layout"
								style={{
									backgroundColor: isElkEnabled
										? "var(--ax-colors-bg-accent-subtle)"
										: undefined,
								}}
							>
								<IconWand size={16} />
							</ControlButton>
						</Controls>
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
			<Suspense fallback={<Box p="24">Loading workflow...</Box>}>
				<WorkflowBuilder />
			</Suspense>
		</ReactFlowProvider>
	);
}

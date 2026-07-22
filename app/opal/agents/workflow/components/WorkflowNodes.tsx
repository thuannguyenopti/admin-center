import {
	Handle,
	Position,
	NodeProps,
	useReactFlow,
	MarkerType,
	BaseEdge,
	getSmoothStepPath,
	EdgeLabelRenderer,
	type EdgeProps,
} from "@xyflow/react";
import {
	Box,
	Text,
	Badge,
	Button,
	Menu,
	MenuTrigger,
	MenuContent,
	type BoxProps,
} from "@optiaxiom/react";
import {
	IconPlay,
	IconEllipsisStroke,
	IconSplit,
	IconPlus,
	IconHouse as IconHome,
	IconCode,
	IconUser,
} from "@optiaxiom/icons";
import {ReactNode} from "react";

// Common wrapper for nodes to handle selection state and basic styling
const NodeWrapper = ({
	selected,
	children,
	...props
}: {selected?: boolean; children: ReactNode} & any) => (
	<Box
		bg="bg.default"
		rounded="md"
		border="1"
		borderColor={selected ? "border.accent" : "border.tertiary"}
		shadow={selected ? "md" : "sm"}
		style={{width: "240px", position: "relative"}}
		className="group"
		{...props}
	>
		{children}
	</Box>
);

const NodeHeader = ({
	icon,
	title,
	actions,
	onRemove,
	onDuplicate,
}: {
	icon: ReactNode;
	title: string;
	actions?: ReactNode;
	onRemove?: () => void;
	onDuplicate?: () => void;
}) => (
	<Box
		display="flex"
		alignItems="center"
		justifyContent="space-between"
		p="12"
		borderB="1"
		borderColor="border.tertiary"
	>
		<Box display="flex" alignItems="center" gap="8">
			<Box color="fg.default">{icon}</Box>
			<Text fontWeight="600" fontSize="md">
				{title}
			</Text>
		</Box>
		{actions || (
			<Menu
				options={[
					{label: "Duplicate", execute: () => onDuplicate?.()},
					{label: "Remove", intent: "danger", execute: () => onRemove?.()},
				]}
			>
				<MenuTrigger asChild>
					<Button
						appearance="subtle"
						size="sm"
						icon={<IconEllipsisStroke size={16} />}
						aria-label="Options"
					/>
				</MenuTrigger>
				<MenuContent align="end" />
			</Menu>
		)}
	</Box>
);

const NodeBody = ({children}: {children: ReactNode}) => <Box p="12">{children}</Box>;

const NodeFooter = ({children}: {children: ReactNode}) => (
	<Box p="12" pt="0">
		{children}
	</Box>
);

export function ActionNode({id, data, selected}: NodeProps) {
	// data should contain: icon, label/name, description, isActive?
	const label = data?.label as string;
	const description = data?.description as string;
	const active = data?.active as boolean;

	const {deleteElements, addNodes, getNode, getNodes, getEdges, setNodes, setEdges} =
		useReactFlow();

	const onRemove = () => {
		const nodes = getNodes();
		const edges = getEdges();
		const incomingEdge = edges.find((e) => e.target === id);
		const outgoingEdge = edges.find((e) => e.source === id);
		const currentNode = nodes.find((n) => n.id === id);

		// Scenario 1: Removing the Root Trigger
		if (!incomingEdge && outgoingEdge && currentNode && currentNode.type === "trigger") {
			const targetNode = nodes.find((n) => n.id === outgoingEdge.target);
			if (targetNode) {
				const newPlaceholder = {
					id: "add-trigger",
					type: "addTrigger",
					data: {label: "Add Trigger"},
					position: currentNode.position,
				};

				const newEdge = {
					id: `e-add-trigger-${targetNode.id}`,
					source: "add-trigger",
					target: targetNode.id,
					type: "default",
					markerEnd: {type: MarkerType.ArrowClosed},
					style: {strokeDasharray: "5,5"},
				};

				const newNodes = nodes.map((n) => (n.id === id ? newPlaceholder : n));
				const newEdges = edges.filter((e) => e.id !== outgoingEdge.id).concat(newEdge);

				setNodes(newNodes);
				setEdges(newEdges);
				return;
			}
		}

		// Scenario 2: Removing a Middle Node (Graph Repair)
		if (incomingEdge && outgoingEdge && currentNode) {
			const sourceNode = nodes.find((n) => n.id === incomingEdge.source);
			const targetNode = nodes.find((n) => n.id === outgoingEdge.target);

			if (sourceNode && targetNode) {
				const isTall = !!sourceNode.data?.outputType;
				// Using 160/240 based on recent spacing adjustments
				const gap = isTall ? 240 : 160;
				const newTargetY = sourceNode.position.y + gap;
				const shift = newTargetY - targetNode.position.y;

				// Remove current node, shift others below it
				const newNodes = nodes
					.filter((n) => n.id !== id)
					.map((n) => {
						if (n.position.y > currentNode.position.y) {
							return {...n, position: {...n.position, y: n.position.y + shift}};
						}
						return n;
					});

				// Reconnect
				const newEdge = {
					id: `e-${sourceNode.id}-${targetNode.id}`,
					source: sourceNode.id,
					target: targetNode.id,
					type: "default",
					markerEnd: {type: MarkerType.ArrowClosed},
					style:
						targetNode.type === "stepPlaceholder"
							? {strokeDasharray: "5,5"}
							: {strokeDasharray: "0"},
				};

				const newEdges = edges
					.filter((e) => e.id !== incomingEdge.id && e.id !== outgoingEdge.id)
					.concat(newEdge);

				setNodes(newNodes);
				setEdges(newEdges);
				return;
			}
		}

		deleteElements({nodes: [{id}]});
	};

	const onDuplicate = () => {
		const node = getNode(id);
		if (!node) return;

		const newNode = {
			...node,
			id: `${node.id}-copy-${Date.now()}`,
			position: {
				x: node.position.x + 50,
				y: node.position.y + 50,
			},
			selected: true,
			data: {
				...node.data,
				label: `${node.data.label} (Copy)`,
			},
		};

		addNodes(newNode);
	};

	return (
		<NodeWrapper selected={selected}>
			<Handle type="target" position={Position.Top} />
			<Handle type="source" position={Position.Bottom} />

			<NodeHeader
				icon={
					<Box
						p="4"
						bg={(data.bg as BoxProps["bg"]) || "bg.tertiary"}
						rounded={
							data.type === "trigger" || data.category === "Logic" ? "full" : "md"
						}
					>
						{/* Render Icon component from data.icon which might be a React Element */}
						{data.icon as ReactNode}
					</Box>
				}
				title={label}
				onRemove={onRemove}
				onDuplicate={onDuplicate}
			/>

			<NodeBody>
				<Text fontSize="sm" color="fg.secondary">
					{description || "Description goes here"}
				</Text>
			</NodeBody>

			{(active || Boolean(data.outputType)) && (
				<NodeFooter>
					<Box display="flex" justifyContent="space-between" alignItems="center" w="full">
						{!!data.outputType && (
							<Box
								display="flex"
								alignItems="center"
								gap="4"
								px="8"
								py="2"
								rounded="full"
								border="1"
								borderColor="border.tertiary"
								bg="bg.default"
							>
								<IconCode size={12} className="text-fg-secondary" />
								<Text fontSize="xs" color="fg.secondary">
									{String(data.outputType)}
								</Text>
							</Box>
						)}
						{active && <Badge intent="success">Active</Badge>}
					</Box>
				</NodeFooter>
			)}
		</NodeWrapper>
	);
}

export function ConditionNode({id, data, selected}: NodeProps) {
	const label = data.label as string;
	const description = data.description as string;
	const conditions = (data.conditions as {matchType: string; value: string}[]) || [];
	const {deleteElements} = useReactFlow();

	// Standard removal logic
	const onRemove = () => {
		deleteElements({nodes: [{id}]});
	};

	return (
		<NodeWrapper
			selected={selected}
			borderColor={selected ? "border.accent" : "border.tertiary"}
			border={selected ? "2" : "1"}
			style={{width: "280px", position: "relative"}}
		>
			<Handle type="target" position={Position.Left} style={{left: "-4px"}} />

			<NodeHeader
				icon={
					<Box p="4" bg="bg.accent.subtle" rounded="full" color="fg.accent">
						<IconSplit size={16} />
					</Box>
				}
				title={label}
				onRemove={onRemove}
			/>

			<NodeBody>
				<Box display="flex" flexDirection="column" gap="4">
					<Text fontSize="sm" color="fg.secondary" mb="8">
						{description || "Click to configure conditions"}
					</Text>

					<Box display="flex" flexDirection="column" gap="8">
						{conditions.map((condition, index) => (
							<Box
								key={index}
								style={{position: "relative"}}
								h="32"
								display="flex"
								alignItems="center"
								px="8"
								rounded="sm"
								bg="bg.accent.subtle"
								border="1"
								borderColor="border.accent"
							>
								<Text fontSize="xs" fontWeight="700" color="fg.accent" truncate>
									{condition.matchType}: {condition.value}
								</Text>
								<Handle
									type="source"
									position={Position.Right}
									id={`${id}-rule-${index}`}
									style={{
										right: -8,
										top: "50%",
										transform: "translateY(-50%)",
										background: "#0a6abf",
										border: "2px solid white",
										width: 12,
										height: 12,
									}}
								/>
							</Box>
						))}
					</Box>
				</Box>
			</NodeBody>
		</NodeWrapper>
	);
}

// Similar to ActionNode but maybe different default styling or specific inputs
// The screenshot shows "Chat Input" with specific text "User inputs goal/KPI..."
export function TriggerNode(props: NodeProps) {
	return <ActionNode {...props} data={{...props.data, active: false}} />;
}

export function ApprovalNode({id, data, selected}: NodeProps) {
	const label = (data?.label as string) || "Approval";
	const description = (data?.description as string) || "Waiting for human review";
	const {deleteElements} = useReactFlow();

	const onRemove = () => deleteElements({nodes: [{id}]});

	return (
		<NodeWrapper
			selected={selected}
			borderColor={selected ? "border.accent" : "border.accent"}
			border="2"
			style={{width: "240px", position: "relative"}}
		>
			<Handle type="target" position={Position.Top} />
			<Handle type="source" position={Position.Bottom} />

			<NodeHeader
				icon={
					<Box p="4" bg="bg.accent.subtle" rounded="full" color="fg.accent">
						<IconUser size={16} />
					</Box>
				}
				title={label}
				onRemove={onRemove}
			/>

			<NodeBody>
				<Text fontSize="sm" color="fg.secondary">
					{description}
				</Text>
			</NodeBody>

			<NodeFooter>
				<Badge intent="information" variant="subtle">
					Pending
				</Badge>
			</NodeFooter>
		</NodeWrapper>
	);
}

export function LoopNode({data, selected}: NodeProps) {
	return (
		<Box
			bg="bg.secondary"
			rounded="md"
			border="1"
			borderColor={selected ? "border.accent" : "border.tertiary"}
			p="16"
			style={{
				minWidth: "240px",
				minHeight: "120px",
				borderStyle: "dashed",
				position: "relative",
			}}
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			className="group"
		>
			<Handle type="target" position={Position.Top} />
			<Handle type="source" position={Position.Bottom} />

			<Box display="flex" flexDirection="column" alignItems="center" gap="8">
				{/* Loop Icon centrally */}
				<Box color="fg.secondary">{data.icon as ReactNode}</Box>
				<Text fontWeight="600">{(data.label as string) || "Loop Name"}</Text>
				<Text fontSize="sm" color="fg.tertiary">
					Drag and drop here
				</Text>
			</Box>

			<Box style={{position: "absolute", top: "8px", right: "8px"}}>
				<IconEllipsisStroke size={16} className="text-fg-tertiary" />
			</Box>
		</Box>
	);
}

export function AddTriggerNode({data}: NodeProps) {
	return (
		<Box
			bg="bg.default"
			rounded="md"
			border="1"
			borderColor="border.tertiary"
			style={{
				width: "240px",
				height: "120px",
				borderStyle: "dashed",
			}}
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			gap="12"
		>
			<Handle type="source" position={Position.Bottom} />{" "}
			{/* Added handle for connecting downwards */}
			<Box p="8" rounded="full" bg="bg.success.subtle" color="fg.success">
				<IconPlus size={20} />
			</Box>
			<Box textAlign="center">
				<Text fontWeight="600">Add Trigger</Text>
				<Text fontSize="sm" color="fg.tertiary">
					Drag and drop here
				</Text>
			</Box>
		</Box>
	);
}

export function StepPlaceholderNode({data}: NodeProps) {
	return (
		<Box
			bg="bg.default"
			rounded="md"
			border="1"
			borderColor="border.tertiary"
			style={{
				width: "240px",
				height: "64px",
				borderStyle: "dashed",
			}}
			display="flex"
			alignItems="center"
			justifyContent="center"
		>
			<Handle type="target" position={Position.Top} />
			<Text fontSize="md" color="fg.tertiary">
				Drag and drop step
			</Text>
		</Box>
	);
}

export function ConditionEdge({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
	markerEnd,
	label,
}: EdgeProps) {
	const labelText = label as string;
	const [edgePath, labelX, labelY] = getSmoothStepPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	return (
		<>
			<BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
			{labelText && (
				<EdgeLabelRenderer>
					<div
						style={{
							position: "absolute",
							transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
							pointerEvents: "all",
						}}
						className="nodrag nopan"
					>
						<Box
							bg="bg.default"
							px="4"
							rounded="sm"
							border="1"
							borderColor="border.accent"
						>
							<Text fontSize="xs" fontWeight="700" color="fg.accent">
								{labelText}
							</Text>
						</Box>
					</div>
				</EdgeLabelRenderer>
			)}
		</>
	);
}

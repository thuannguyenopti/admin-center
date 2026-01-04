import { Handle, Position, NodeProps, useReactFlow, MarkerType } from '@xyflow/react';
import { Box, Text, Badge, Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, type BoxProps } from '@optiaxiom/react';
import { IconPlus, IconHome, IconCode } from '@tabler/icons-react';
import { IconPlay, IconEllipsisStroke } from '@optimizely/axiom-icons';
import { ReactNode } from 'react';

// Common wrapper for nodes to handle selection state and basic styling
const NodeWrapper = ({ selected, children, ...props }: { selected?: boolean, children: ReactNode } & any) => (
    <Box
        bg="bg.default"
        rounded="md"
        border="1"
        borderColor={selected ? "border.accent" : "border.tertiary"}
        shadow={selected ? "md" : "sm"}
        style={{ width: '240px', position: 'relative' }}
        className="group"
        {...props}
    >
        {children}
    </Box>
);

const NodeHeader = ({ icon, title, actions, onRemove, onDuplicate }: { icon: ReactNode, title: string, actions?: ReactNode, onRemove?: () => void, onDuplicate?: () => void }) => (
    <Box display="flex" alignItems="center" justifyContent="space-between" p="12" borderB="1" borderColor="border.tertiary">
        <Box display="flex" alignItems="center" gap="8">
            <Box color="fg.default">
                {icon}
            </Box>
            <Text fontWeight="600" fontSize="md">{title}</Text>
        </Box>
        {actions || (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button appearance="subtle" size="sm" icon={<IconEllipsisStroke size={16} />} aria-label="Options" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={onDuplicate}>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem onSelect={onRemove} className="text-red-600 focus:text-red-600 focus:bg-red-50">Remove</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )}
    </Box>
);

const NodeBody = ({ children }: { children: ReactNode }) => (
    <Box p="12">
        {children}
    </Box>
);

const NodeFooter = ({ children }: { children: ReactNode }) => (
    <Box p="12" pt="0">
        {children}
    </Box>
);

export function ActionNode({ id, data, selected }: NodeProps) {
    // data should contain: icon, label/name, description, isActive?
    const label = data.label as string;
    const description = data.description as string;
    const active = data.active as boolean;

    const { deleteElements, addNodes, getNode, getNodes, getEdges, setNodes, setEdges } = useReactFlow();

    const onRemove = () => {
        const nodes = getNodes();
        const edges = getEdges();
        const incomingEdge = edges.find(e => e.target === id);
        const outgoingEdge = edges.find(e => e.source === id);
        const currentNode = nodes.find(n => n.id === id);

        if (incomingEdge && outgoingEdge && currentNode) {
            const sourceNode = nodes.find(n => n.id === incomingEdge.source);
            const targetNode = nodes.find(n => n.id === outgoingEdge.target);

            if (sourceNode && targetNode) {
                const isTall = !!sourceNode.data?.outputType;
                // Using 160/240 based on recent spacing adjustments
                const gap = isTall ? 240 : 160;
                const newTargetY = sourceNode.position.y + gap;
                const shift = newTargetY - targetNode.position.y;

                // Remove current node, shift others below it
                const newNodes = nodes
                    .filter(n => n.id !== id)
                    .map(n => {
                        if (n.position.y > currentNode.position.y) {
                            return { ...n, position: { ...n.position, y: n.position.y + shift } };
                        }
                        return n;
                    });

                // Reconnect
                const newEdge = {
                    id: `e-${sourceNode.id}-${targetNode.id}`,
                    source: sourceNode.id,
                    target: targetNode.id,
                    type: 'default',
                    markerEnd: { type: MarkerType.ArrowClosed },
                    style: targetNode.type === 'stepPlaceholder' ? { strokeDasharray: '5,5' } : { strokeDasharray: '0' }
                };

                const newEdges = edges
                    .filter(e => e.id !== incomingEdge.id && e.id !== outgoingEdge.id)
                    .concat(newEdge);

                setNodes(newNodes);
                setEdges(newEdges);
                return;
            }
        }

        deleteElements({ nodes: [{ id }] });
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
                    <Box p="4" bg={(data.bg as BoxProps["bg"]) || "bg.tertiary"} rounded="sm">
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
                                <Text fontSize="xs" color="fg.secondary">{String(data.outputType)}</Text>
                            </Box>
                        )}
                        {active && <Badge intent="success">Active</Badge>}
                    </Box>
                </NodeFooter>
            )}
        </NodeWrapper>
    );
}

// Similar to ActionNode but maybe different default styling or specific inputs
// The screenshot shows "Chat Input" with specific text "User inputs goal/KPI..."
export function TriggerNode(props: NodeProps) {
    return <ActionNode {...props} data={{ ...props.data, active: false }} />;
}

export function LoopNode({ data, selected }: NodeProps) {
    return (
        <Box
            bg="bg.secondary"
            rounded="md"
            border="1"
            borderColor={selected ? "border.accent" : "border.tertiary"}
            p="16"
            style={{
                minWidth: '240px',
                minHeight: '120px',
                borderStyle: 'dashed',
                position: 'relative'
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
                <Box color="fg.secondary">
                    {data.icon as ReactNode}
                </Box>
                <Text fontWeight="600">{(data.label as string) || "Loop Name"}</Text>
                <Text fontSize="sm" color="fg.tertiary">Drag and drop here</Text>
            </Box>

            <Box style={{ position: 'absolute', top: '8px', right: '8px' }}>
                <IconEllipsisStroke size={16} className="text-fg-tertiary" />
            </Box>
        </Box>
    );
}

export function AddTriggerNode({ data }: NodeProps) {
    return (
        <Box
            bg="bg.default"
            rounded="md"
            border="1"
            borderColor="border.tertiary"
            style={{
                width: '240px',
                height: '120px',
                borderStyle: 'dashed'
            }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap="12"
        >
            <Handle type="source" position={Position.Bottom} /> {/* Added handle for connecting downwards */}
            <Box p="8" rounded="full" bg="bg.success.subtle" color="fg.success">
                <IconPlus size={20} />
            </Box>
            <Box textAlign="center">
                <Text fontWeight="600">Add Trigger</Text>
                <Text fontSize="sm" color="fg.tertiary">Drag and drop here</Text>
            </Box>
        </Box>
    )
}

export function StepPlaceholderNode({ data }: NodeProps) {
    return (
        <Box
            bg="bg.default"
            rounded="md"
            border="1"
            borderColor="border.tertiary"
            style={{
                width: '240px',
                height: '64px',
                borderStyle: 'dashed'
            }}
            display="flex"

            alignItems="center"
            justifyContent="center"
        >
            <Handle type="target" position={Position.Top} />
            <Text fontSize="md" color="fg.tertiary">Drag and drop step</Text>
        </Box>
    )
}

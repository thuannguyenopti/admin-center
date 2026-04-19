"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Box } from "@optiaxiom/react";
import { Layout } from "@optiaxiom/react/unstable";
import {
	ReactFlow,
	Background,
	BackgroundVariant,
	Controls,
	type Connection,
} from "@xyflow/react";
// @ts-ignore — CSS side-effect import, no type declarations needed
import "@xyflow/react/dist/style.css";
import { useRouter } from "next/navigation";

import { FormBuilderTopNav } from "./components/FormBuilderTopNav";
import { FormBuilderSidebar } from "./components/FormBuilderSidebar";
import { FormFieldNode } from "./components/nodes/FormFieldNode";
import { FormSectionNode } from "./components/nodes/FormSectionNode";
import { FormContentNode } from "./components/nodes/FormContentNode";
import { FormConditionEdge } from "./components/edges/FormConditionEdge";
import { FieldDetailsPanel, type NodeConditionLogic } from "./components/panels/FieldDetailsPanel";
import { useFormBuilderState, getNodeId } from "./hooks/useFormBuilderState";
import { ALL_COMPONENTS, WORK_REQUEST_FIELDS } from "./data";
import { validateFormGraph } from "./utils/validateFormGraph";
import type { ValidationWarning } from "./types";

// ─── Validation dialog ────────────────────────────────────────────────────────

function ValidationDialog({
	warnings,
	onSaveAnyway,
	onCancel,
}: {
	warnings: ValidationWarning[];
	onSaveAnyway: () => void;
	onCancel: () => void;
}) {
	const hasErrors = warnings.some((w) => w.severity === "error");
	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 1000,
				background: "rgba(0,0,0,0.4)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Box
				bg="bg.default"
				rounded="md"
				p="24"
				style={{ width: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
				display="flex"
				flexDirection="column"
				gap="16"
			>
				<Box fontSize="md" fontWeight="600" color="fg.default">
					{hasErrors ? "Cannot save — errors found" : "Warnings before saving"}
				</Box>
				<Box display="flex" flexDirection="column" gap="8">
					{warnings.map((w, i) => (
						<Box
							key={i}
							p="10"
							rounded="sm"
							style={{
								background: w.severity === "error"
									? "var(--ax-colors-bg-critical-subtle, #fef2f2)"
									: "var(--ax-colors-bg-warning-subtle, #fefce8)",
								border: `1px solid ${w.severity === "error"
									? "var(--ax-colors-border-critical, #fca5a5)"
									: "var(--ax-colors-border-warning, #fde047)"}`,
							}}
						>
							<Box
								fontSize="sm"
								color="fg.default"
							>
								{w.severity === "error" ? "⛔ Error" : "⚠️ Warning"}: {w.message}
							</Box>
						</Box>
					))}
				</Box>
				<Box display="flex" gap="8" justifyContent="end">
					<button
						onClick={onCancel}
						style={{
							border: "1px solid var(--ax-colors-border-default)",
							borderRadius: 6,
							padding: "6px 16px",
							background: "none",
							cursor: "pointer",
							fontSize: 14,
							color: "var(--ax-colors-fg-default)",
						}}
					>
						Cancel
					</button>
					{!hasErrors && (
						<button
							onClick={onSaveAnyway}
							style={{
								border: "none",
								borderRadius: 6,
								padding: "6px 16px",
								background: "var(--ax-colors-bg-accent)",
								cursor: "pointer",
								fontSize: 14,
								color: "#fff",
							}}
						>
							Save Anyway
						</button>
					)}
				</Box>
			</Box>
		</div>
	);
}

// ─── Main FormBuilder ─────────────────────────────────────────────────────────

export function FormBuilder() {
	const router = useRouter();
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
	const [formTitle, setFormTitle] = useState("Untitled Form");
	const [isLibraryOpen, setIsLibraryOpen] = useState(true);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[] | null>(null);
	const [highlightedNodeIds, setHighlightedNodeIds] = useState<Set<string>>(new Set());

	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		addNode,
		onConnect: onConnectBase,
		updateNodeData,
		updateEdgesForNode,
		onNodeDragStop,
		toggleSectionCollapse,
		duplicateSection,
		undo,
		redo,
		canUndo,
		canRedo,
	} = useFormBuilderState();

	// ─── Node types ──────────────────────────────────────────────────────────────

	const nodeTypes = useMemo(
		() => ({
			formField: FormFieldNode,
			formSection: FormSectionNode,
			formContent: FormContentNode,
		}),
		[],
	);

	const edgeTypes = useMemo(() => ({ formCondition: FormConditionEdge }), []);

	// ─── Drag and drop ───────────────────────────────────────────────────────────

	const onDragStart = useCallback((e: React.DragEvent, item: any) => {
		e.dataTransfer.setData("application/formbuilder/nodeType", item.nodeType);
		e.dataTransfer.setData("application/formbuilder/name", item.name);
		e.dataTransfer.setData("application/formbuilder/typeLabel", item.typeLabel ?? "");
		e.dataTransfer.setData("application/formbuilder/iconId", item.id);
		e.dataTransfer.effectAllowed = "move";
	}, []);

	const onDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			if (!reactFlowInstance) return;

			const nodeType = e.dataTransfer.getData("application/formbuilder/nodeType");
			const name = e.dataTransfer.getData("application/formbuilder/name");
			const typeLabel = e.dataTransfer.getData("application/formbuilder/typeLabel");
			const iconId = e.dataTransfer.getData("application/formbuilder/iconId");

			if (!nodeType || !name) return;

			const position = reactFlowInstance.screenToFlowPosition({
				x: e.clientX,
				y: e.clientY,
			});
			const item = ALL_COMPONENTS.find((c) => c.id === iconId);
			const fieldDef = WORK_REQUEST_FIELDS.find((f) => f.id === iconId);

			const newNode = {
				id: getNodeId(),
				type: nodeType,
				position,
				data: {
					label: name,
					typeLabel: typeLabel || undefined,
					icon: item?.icon,
					required: fieldDef?.required ?? false,
					fieldDefId: iconId,
					// Inject callbacks for section nodes
					...(nodeType === "formSection"
						? {
								onToggleCollapse: () => {},
								onDuplicate: () => {},
						  }
						: {}),
				},
			};

			addNode(newNode as any);
		},
		[reactFlowInstance, addNode],
	);

	// Inject live callbacks into section nodes, and isHighlighted into all nodes
	const patchedNodes = useMemo(
		() =>
			nodes.map((n) => {
				const isHighlighted = highlightedNodeIds.has(n.id);
				if (n.type !== "formSection") {
					return isHighlighted ? { ...n, data: { ...n.data, isHighlighted } } : n;
				}
				return {
					...n,
					data: {
						...n.data,
						isHighlighted,
						onToggleCollapse: () => toggleSectionCollapse(n.id),
						onDuplicate: () => duplicateSection(n.id),
					},
				};
			}),
		[nodes, highlightedNodeIds, toggleSectionCollapse, duplicateSection],
	);

	// ─── Connection ───────────────────────────────────────────────────────────────

	const onConnect = useCallback(
		(connection: Connection) => {
			onConnectBase(connection, nodes);
		},
		[onConnectBase, nodes],
	);

	// ─── Node click ───────────────────────────────────────────────────────────────

	const onNodeClick = useCallback((_: any, node: any) => {
		setSelectedNodeId(node.id);
	}, []);

	const onPaneClick = useCallback(() => {
		setSelectedNodeId(null);
	}, []);

	const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

	// ─── Save with validation ─────────────────────────────────────────────────────

	const handleSave = useCallback(() => {
		const warnings = validateFormGraph(nodes, edges);
		if (warnings.length > 0) {
			setValidationWarnings(warnings);
		} else {
			// TODO: persist form
			console.log("Form saved", { nodes, edges });
		}
	}, [nodes, edges]);

	// ─── Logic apply ─────────────────────────────────────────────────────────────

	const ACTION_LABELS: Record<string, string> = {
		jump_to: "Jump to",
		show: "Show",
		hide: "Hide",
		show_values: "Show values",
		hide_values: "Hide values",
	};

	const handleApplyLogic = useCallback(
		(nodeId: string, ruleSets: NodeConditionLogic[]) => {
			updateNodeData(nodeId, { ruleSets });

			// Count how many rule sets target each node; track the first action label seen
			const targetInfo = new Map<string, { count: number; actionLabel: string }>();

			for (const logic of ruleSets) {
				// Avoid double-counting if multiple THEN actions in one rule set target the same node
				const seenInThisRule = new Set<string>();
				for (const action of logic.thenActions) {
					if (!action.targetId.startsWith("node:")) continue;
					const targetNodeId = action.targetId.replace("node:", "");
					if (seenInThisRule.has(targetNodeId)) continue;
					seenInThisRule.add(targetNodeId);
					const actionLabel = ACTION_LABELS[action.type] ?? action.type;
					const existing = targetInfo.get(targetNodeId);
					if (!existing) {
						targetInfo.set(targetNodeId, { count: 1, actionLabel });
					} else {
						targetInfo.set(targetNodeId, { count: existing.count + 1, actionLabel: existing.actionLabel });
					}
				}
			}

			const edgeUpdates = Array.from(targetInfo.entries()).map(([targetNodeId, { count, actionLabel }]) => ({
				targetNodeId,
				label: count === 1 ? actionLabel : `${count} rules`,
			}));

			updateEdgesForNode(nodeId, edgeUpdates);
		},
		[updateNodeData, updateEdgesForNode],
	);

	// ─── Details panel ────────────────────────────────────────────────────────────

	const detailsPanel = useMemo(() => {
		if (!selectedNode) return null;

		// BFS: collect all nodes reachable downstream from selectedNode
		const visited = new Set<string>([selectedNode.id]);
		const queue = [selectedNode.id];
		const reachableNodes: any[] = [];

		while (queue.length > 0) {
			const current = queue.shift()!;
			for (const edge of edges) {
				if (edge.source !== current) continue;
				const targetNode = nodes.find((n) => n.id === edge.target);
				if (!targetNode || visited.has(targetNode.id)) continue;
				visited.add(targetNode.id);
				reachableNodes.push(targetNode);
				queue.push(targetNode.id);
			}
		}

		// Direct outgoing edges (for edgeId tracking)
		const outEdges = edges.filter((e) => e.source === selectedNode.id);

		// Build outgoingConnections: direct edges keep their edgeId; downstream nodes get a synthetic entry
		const outgoingConnections: Array<{ edgeId: string; targetNode: any }> = reachableNodes.map((targetNode) => {
			const directEdge = outEdges.find((e) => e.target === targetNode.id);
			return { edgeId: directEdge?.id ?? `synthetic-${targetNode.id}`, targetNode };
		});

		return (
			<FieldDetailsPanel
				key={selectedNode.id}
				node={selectedNode}
				onClose={() => setSelectedNodeId(null)}
				outgoingConnections={outgoingConnections}
				onApplyLogic={(ruleSets) => handleApplyLogic(selectedNode.id, ruleSets)}
				onHighlightNodes={(ids) => setHighlightedNodeIds(new Set(ids))}
				onClearHighlight={() => setHighlightedNodeIds(new Set())}
			/>
		);
	}, [selectedNode, edges, nodes, handleApplyLogic]);

	// ─── Render ───────────────────────────────────────────────────────────────────

	return (
		<Box h="full" bg="bg.default">
			<Layout
				resizable
				style={{ height: "100%" }}
				header={
					<FormBuilderTopNav
						formTitle={formTitle}
						isLibraryOpen={isLibraryOpen}
						canUndo={canUndo}
						canRedo={canRedo}
						onToggleLibrary={() => setIsLibraryOpen((v) => !v)}
						onTitleChange={setFormTitle}
						onUndo={undo}
						onRedo={redo}
						onSave={handleSave}
						onClose={() => router.push("/cmp/settings/templates")}
					/>
				}
				sidebar={isLibraryOpen ? <FormBuilderSidebar onDragStart={onDragStart} /> : null}
				detailsPanel={detailsPanel}
			>
				<Box
					ref={reactFlowWrapper}
					flex="1"
					style={{ height: "100%", position: "relative" }}
				>
					<ReactFlow
						nodes={patchedNodes}
						edges={edges}
						nodeTypes={nodeTypes}
						edgeTypes={edgeTypes}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						onInit={setReactFlowInstance}
						onDrop={onDrop}
						onDragOver={onDragOver}
						onNodeClick={onNodeClick}
						onPaneClick={onPaneClick}
						onNodeDragStop={(e, node, allNodes) => onNodeDragStop(e, node, allNodes)}
						fitView
						fitViewOptions={{ padding: 0.4 }}
						deleteKeyCode={["Delete", "Backspace"]}
					>
						<Controls />
						<Background variant={BackgroundVariant.Dots} gap={20} size={1} />
					</ReactFlow>
				</Box>
			</Layout>

			{validationWarnings && (
				<ValidationDialog
					warnings={validationWarnings}
					onSaveAnyway={() => {
						setValidationWarnings(null);
						console.log("Force-saved with warnings", { nodes, edges });
					}}
					onCancel={() => setValidationWarnings(null)}
				/>
			)}
		</Box>
	);
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@optiaxiom/react";
import { Layout } from "@optiaxiom/react/unstable";
import {
	ReactFlow,
	Background,
	BackgroundVariant,
	Controls,
	MarkerType,
	type Connection,
} from "@xyflow/react";
// @ts-ignore — CSS side-effect import, no type declarations needed
import "@xyflow/react/dist/style.css";
import { useRouter } from "next/navigation";

import { FormBuilderTopNav } from "./components/FormBuilderTopNav";
import { FormBuilderSidebar } from "./components/FormBuilderSidebar";
import { FormFieldNode } from "./components/nodes/FormFieldNode";
import { FormSectionNode, SECTION_HEADER_HEIGHT } from "./components/nodes/FormSectionNode";
import { FormContentNode } from "./components/nodes/FormContentNode";
import { FormConditionEdge } from "./components/edges/FormConditionEdge";
import { FormConflictEdge } from "./components/edges/FormConflictEdge";
import { FieldDetailsPanel, type NodeConditionLogic } from "./components/panels/FieldDetailsPanel";
import { ConflictsPanel } from "./components/panels/ConflictsPanel";
import { FormPreviewPanel } from "./components/panels/FormPreviewPanel";
import { FormContentPanel } from "./components/panels/FormContentPanel";
import { CreateTemplateModal } from "./components/CreateTemplateModal";
import { FormBuilderActionsProvider } from "./context/FormBuilderActionsContext";
import type { FormConflict } from "./utils/detectFormConflicts";
import { CONTENT_COMPONENTS, ALL_COMPONENTS, WORK_REQUEST_FIELDS } from "./data";
import { IconHeading } from "@tabler/icons-react";

const STARTING_NODE_ID = "form-title-start";

import { useFormBuilderState, getNodeId } from "./hooks/useFormBuilderState";
import { validateFormGraph } from "./utils/validateFormGraph";
import { detectFormConflicts } from "./utils/detectFormConflicts";
import { useLayout } from "@/app/context/LayoutContext";
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
							<Box fontSize="sm" color="fg.default">
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
	const { opalPanelControls, setFormBuilderControls } = useLayout();
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
	const [formTitle, setFormTitle] = useState("Untitled Form");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(true);
	const [isLibraryOpen, setIsLibraryOpen] = useState(true);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[] | null>(null);
	const [highlightedTargets, setHighlightedTargets] = useState<Array<{ nodeId: string; actionLabel: string }>>([]);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [isConflictsPanelOpen, setIsConflictsPanelOpen] = useState(false);
	const [activeConflictId, setActiveConflictId] = useState<string | null>(null);
	const [isAllConflictsHighlighted, setIsAllConflictsHighlighted] = useState(false);
	const [conflictHighlight, setConflictHighlight] = useState<{ nodeIds: string[]; edgeIds: string[] } | null>(null);

	const {
		nodes,
		edges,
		setNodes,
		setEdges,
		onNodesChange,
		onEdgesChange,
		addNode,
		addNodeWithEdge,
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

	const edgeTypes = useMemo(
		() => ({ formCondition: FormConditionEdge, formConflict: FormConflictEdge }),
		[],
	);

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

			const raw = reactFlowInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
		const snap = (v: number) => Math.round(v / 20) * 20;
		const position = { x: snap(raw.x), y: snap(raw.y) };
			const item = ALL_COMPONENTS.find((c) => c.id === iconId);
			const fieldDef = WORK_REQUEST_FIELDS.find((f) => f.id === iconId);

			let parentId: string | undefined;
			let finalPosition = position;
			let pendingSectionResize: { id: string; width: number; height: number } | undefined;

			if (nodeType !== "formSection") {
				for (const section of nodes.filter((n) => n.type === "formSection")) {
					const sw = Number(section.style?.width ?? 480);
					const sh = Number(section.style?.height ?? 220);
					if (
						position.x > section.position.x &&
						position.x < section.position.x + sw &&
						position.y > section.position.y + SECTION_HEADER_HEIGHT &&
						position.y < section.position.y + sh
					) {
						parentId = section.id;
						const siblings = nodes.filter((n) => n.parentId === section.id && !n.hidden);
						const FIELD_H = 72;
						const FIELD_W = 280;
						const GAP = 12;
						const PAD = 24;
						if (siblings.length === 0) {
							finalPosition = { x: 16, y: SECTION_HEADER_HEIGHT + 16 };
						} else {
							const lastBottom = Math.max(
								...siblings.map((s) => s.position.y + Number((s as any).measured?.height ?? FIELD_H)),
							);
							finalPosition = { x: 16, y: lastBottom + GAP };
						}
						const childBottom = finalPosition.y + FIELD_H;
						const newH = Math.max(sh, childBottom + PAD);
						const newW = Math.max(sw, finalPosition.x + FIELD_W + PAD);
						if (newH !== sh || newW !== sw) {
							pendingSectionResize = { id: section.id, width: newW, height: newH };
						}
						break;
					}
				}
			}

			const newNode: any = {
				id: getNodeId(),
				type: nodeType,
				position: finalPosition,
				...(parentId ? { parentId } : {}),
				...(nodeType === "formSection" ? { style: { width: 480, height: 220, overflow: "visible" } } : {}),
				data: {
					label: name,
					typeLabel: typeLabel || undefined,
					icon: item?.icon,
					required: fieldDef?.required ?? false,
					fieldDefId: iconId,
					...(nodeType === "formSection" ? { onToggleCollapse: () => {}, onDuplicate: () => {} } : {}),
				},
			};

			if (pendingSectionResize) {
				const { id: sId, width: rW, height: rH } = pendingSectionResize;
				setNodes((nds) => nds.map((n) =>
					n.id === sId ? { ...n, style: { ...(n.style ?? {}), width: rW, height: rH, overflow: "visible" } } : n,
				));
			}
			addNode(newNode);
		},
		[reactFlowInstance, addNode, setNodes, nodes],
	);

	const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

	// ─── Suggested next fields ───────────────────────────────────────────────────

	const fieldNodeIds = useMemo(
		() => new Set(nodes.map((n) => (n.data as any).fieldDefId).filter(Boolean)),
		[nodes],
	);

	const suggestedFields = useMemo(() => {
		if (!selectedNode) return [];
		if (nodes.filter((n) => n.type === "formField").length < 3) return [];
		const hasOutgoingEdge = edges.some((e) => e.source === selectedNode.id);
		if (hasOutgoingEdge) return [];
		return WORK_REQUEST_FIELDS.filter((f) => !fieldNodeIds.has(f.id)).slice(0, 3);
	}, [selectedNode, nodes, edges, fieldNodeIds]);

	const menuSuggestedFields = useMemo(() => {
		if (!selectedNode) return [];
		return WORK_REQUEST_FIELDS.filter((f) => !fieldNodeIds.has(f.id)).slice(0, 4);
	}, [selectedNode, fieldNodeIds]);

	// ─── Inline add-below (+ button on nodes) ───────────────────────────────────

	const handleAddNodeBelow = useCallback(
		(sourceNodeId: string, type: "text" | "section" | "field", fieldDefId?: string) => {
			const sourceNode = nodes.find((n) => n.id === sourceNodeId);
			if (!sourceNode) return;
			const offsetY = ((sourceNode as any).measured?.height ?? 60) + 80;
			const newId = getNodeId();
			let newNode: any;

			if (type === "text") {
				const c = CONTENT_COMPONENTS[0];
				newNode = {
					id: newId, type: "formContent",
					position: { x: sourceNode.position.x, y: sourceNode.position.y + offsetY },
					data: { label: c.name, icon: c.icon },
				};
			} else if (type === "section") {
				newNode = {
					id: newId, type: "formSection",
					position: { x: sourceNode.position.x, y: sourceNode.position.y + offsetY },
					style: { width: 480, height: 220, overflow: "visible" },
					data: { label: "New Section", onToggleCollapse: () => {}, onDuplicate: () => {} },
				};
			} else if (type === "field" && fieldDefId) {
				const f = WORK_REQUEST_FIELDS.find((fld) => fld.id === fieldDefId);
				if (!f) return;
				newNode = {
					id: newId, type: "formField",
					position: { x: sourceNode.position.x, y: sourceNode.position.y + offsetY },
					data: { label: f.name, typeLabel: f.typeLabel, icon: f.icon, required: f.required ?? false, fieldDefId: f.id },
				};
			}

			if (!newNode) return;
			addNodeWithEdge(newNode, {
				id: `e-quick-${sourceNodeId}-${newId}`,
				source: sourceNodeId,
				target: newId,
				type: "smoothstep",
				markerEnd: { type: MarkerType.ArrowClosed },
			} as any);
		},
		[nodes, addNodeWithEdge],
	);

	const handleAddSuggestedField = useCallback(
		(fieldId: string) => {
			if (!selectedNode) return;
			const fieldDef = WORK_REQUEST_FIELDS.find((f) => f.id === fieldId);
			if (!fieldDef) return;
			const newNode = {
				id: getNodeId(),
				type: fieldDef.nodeType,
				position: { x: selectedNode.position.x, y: selectedNode.position.y + 120 },
				data: { label: fieldDef.name, typeLabel: fieldDef.typeLabel, icon: fieldDef.icon, required: fieldDef.required ?? false, fieldDefId: fieldDef.id },
			};
			addNode(newNode as any);
		},
		[selectedNode, addNode],
	);

	const handleModalSave = useCallback(
		({ templateName }: { templateName: string; description: string; applicableTo: string[] }) => {
			setFormTitle(templateName);
			setIsCreateModalOpen(false);
			const startingNode = {
				id: STARTING_NODE_ID,
				type: "formField",
				position: { x: 0, y: 0 },
				deletable: false,
				data: {
					label: templateName,
					typeLabel: "Form Title",
					icon: <IconHeading size={16} />,
					isStartingNode: true,
				},
			};
			setNodes([startingNode as any]);
			setTimeout(() => reactFlowInstance?.fitView({ padding: 0.4 }), 50);
		},
		[setNodes, reactFlowInstance],
	);

	const handleContentNodeLabelChange = useCallback(
		(nodeId: string, label: string) => {
			setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, label } } : n));
		},
		[setNodes],
	);

	// ─── Highlight ────────────────────────────────────────────────────────────────

	const highlightedSet = useMemo(
		() => new Set(highlightedTargets.map((t) => t.nodeId)),
		[highlightedTargets],
	);

	const patchedNodes = useMemo(() => nodes.map((n) => {
		let isHighlighted = false;
		let isDimmed = false;
		const parentId = (n as any).parentId as string | undefined;

		if (conflictHighlight) {
			isHighlighted = conflictHighlight.nodeIds.includes(n.id);
			const parentHighlighted = !!parentId && conflictHighlight.nodeIds.includes(parentId);
			isDimmed = !isHighlighted && !parentHighlighted && conflictHighlight.nodeIds.length > 0;
		} else {
			isHighlighted = highlightedSet.has(n.id) || (highlightedTargets.length > 0 && n.id === selectedNodeId);
			const parentHighlighted = !!parentId && highlightedSet.has(parentId);
			isDimmed = highlightedTargets.length > 0 && !isHighlighted && !parentHighlighted;
		}

		const extra = { isHighlighted, isDimmed, isConflictHighlighted: isHighlighted && !!conflictHighlight };
		const addCallbacks = {
			menuSuggestedFields: n.id === selectedNodeId ? menuSuggestedFields : [],
			onAddNodeBelow: (type: string, fieldDefId?: string) => handleAddNodeBelow(n.id, type as any, fieldDefId),
		};

		if (n.type !== "formSection") {
			return { ...n, data: { ...n.data, ...extra, ...addCallbacks } };
		}
		return {
			...n,
			zIndex: -1,
			data: {
				...n.data,
				...extra,
				...addCallbacks,
				onToggleCollapse: () => toggleSectionCollapse(n.id),
				onDuplicate: () => duplicateSection(n.id),
				onLabelChange: (label: string) => updateNodeData(n.id, { label }),
			},
		};
	}), [nodes, conflictHighlight, highlightedSet, highlightedTargets, selectedNodeId,
		menuSuggestedFields, handleAddNodeBelow, toggleSectionCollapse, duplicateSection, updateNodeData]);

	const patchedEdges = useMemo(() => {
		// Identify undefined edges: source has 2+ outgoing edges but this one has no label
		const outgoingCounts = new Map<string, number>();
		for (const e of edges) outgoingCounts.set(e.source, (outgoingCounts.get(e.source) ?? 0) + 1);
		const undefinedEdgeIds = new Set(
			edges
				.filter((e) => (outgoingCounts.get(e.source) ?? 0) > 1 && !e.label)
				.map((e) => e.id),
		);

		// Base: apply persistent warning styling to undefined edges
		const base = edges.map((edge) => {
			if (undefinedEdgeIds.has(edge.id)) {
				return {
					...edge,
					type: "formConflict",
					data: { ...(edge.data ?? {}), conflictSeverity: "warning" },
					style: { stroke: "#ca8a04", strokeWidth: 2 },
				};
			}
			return edge;
		});

		// Overlay: conflict panel highlight
		if (conflictHighlight) {
			const conflictEdgeIds = new Set(conflictHighlight.edgeIds);
			const hasEdges = conflictEdgeIds.size > 0;
			return base.map((edge) => {
				if (hasEdges && conflictEdgeIds.has(edge.id)) {
					return { ...edge, animated: true, style: { stroke: "#ca8a04", strokeWidth: 2.5 } };
				}
				return { ...edge, style: { ...((edge.style as object) ?? {}), opacity: hasEdges ? 0.15 : 1 } };
			});
		}

		// Overlay: logic highlight from details panel
		if (highlightedTargets.length === 0 || !selectedNodeId) return base;
		const targetMap = new Map(highlightedTargets.map((t) => [t.nodeId, t.actionLabel]));
		return base.map((edge) => {
			if (edge.source === selectedNodeId && targetMap.has(edge.target)) {
				return {
					...edge,
					type: "formCondition",
					animated: true,
					style: { stroke: "var(--ax-colors-border-accent)", strokeWidth: 2.5 },
					label: targetMap.get(edge.target),
					data: { ...(edge.data ?? {}), isHighlighted: true },
				};
			}
			return { ...edge, style: { ...((edge.style as object) ?? {}), opacity: 0.15 } };
		});
	}, [edges, conflictHighlight, highlightedTargets, selectedNodeId]);

	// ─── Connection ───────────────────────────────────────────────────────────────

	const onConnect = useCallback(
		(connection: Connection) => onConnectBase(connection, nodes),
		[onConnectBase, nodes],
	);

	// ─── Node click ───────────────────────────────────────────────────────────────

	const onNodeClick = useCallback((_: any, node: any) => {
		setSelectedNodeId(node.id);
		setHighlightedTargets([]);
		setConflictHighlight(null);
		setActiveConflictId(null);
		setIsAllConflictsHighlighted(false);
	}, []);

	const onPaneClick = useCallback(() => {
		setSelectedNodeId(null);
		setHighlightedTargets([]);
		setConflictHighlight(null);
		setActiveConflictId(null);
		setIsAllConflictsHighlighted(false);
	}, []);

	// ─── Conflict detection ───────────────────────────────────────────────────────

	const conflicts = useMemo(() => detectFormConflicts(nodes, edges), [nodes, edges]);

	const handleOpenIssues = useCallback(() => {
		setSelectedNodeId(null);
		setHighlightedTargets([]);
		setConflictHighlight(null);
		setActiveConflictId(null);
		setIsAllConflictsHighlighted(false);
		setIsConflictsPanelOpen(true);
	}, []);

	const handleSuggestFixes = useCallback(() => {
		opalPanelControls?.openPanel();
		opalPanelControls?.addMessage({
			role: "assistant",
			content: `I found ${conflicts.length} issue${conflicts.length === 1 ? "" : "s"} in your form. Here are my suggested fixes.`,
			messageType: "form-conflicts",
			metadata: { conflicts },
		});
	}, [conflicts, opalPanelControls]);

	// ─── Save ─────────────────────────────────────────────────────────────────────

	const handleSave = useCallback(async () => {
		const warnings = validateFormGraph(nodes, edges);
		if (warnings.length > 0) {
			setValidationWarnings(warnings);
			return;
		}
		console.log("Form saved", { nodes, edges });
	}, [nodes, edges]);

	// ─── Optimize ────────────────────────────────────────────────────────────────

	const detectDuplicateFields = useCallback(() => {
		const fieldNodes = nodes.filter((n) => n.type === "formField");
		const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
		const groups: Array<{ fieldIds: string[]; labels: string[] }> = [];
		const grouped = new Set<string>();
		for (let i = 0; i < fieldNodes.length; i++) {
			if (grouped.has(fieldNodes[i].id)) continue;
			const wordsA = normalize((fieldNodes[i].data as any).label ?? "");
			const group = [fieldNodes[i]];
			for (let j = i + 1; j < fieldNodes.length; j++) {
				if (grouped.has(fieldNodes[j].id)) continue;
				const wordsB = normalize((fieldNodes[j].data as any).label ?? "");
				if (wordsA.filter((w) => wordsB.includes(w)).length / Math.max(wordsA.length, wordsB.length, 1) >= 0.7)
					group.push(fieldNodes[j]);
			}
			if (group.length > 1) {
				group.forEach((n) => grouped.add(n.id));
				groups.push({ fieldIds: group.map((n) => n.id), labels: group.map((n) => (n.data as any).label ?? n.id) });
			}
		}
		return groups;
	}, [nodes]);

	const handleOptimize = useCallback(async () => {
		const duplicates = detectDuplicateFields();
		const fieldSummary = nodes
			.filter((n) => n.type === "formField")
			.sort((a, b) => a.position.y - b.position.y)
			.map((n) => {
				const d = n.data as any;
				return `- ${d.label} (${d.typeLabel ?? "Field"}${d.required ? ", required" : ""})`;
			})
			.join("\n");
		let aiSuggestions: Array<{ id: string; type: string; message: string }> = [];
		try {
			const res = await fetch("/api/optimize-form", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ formSummary: fieldSummary }) });
			if (res.ok) aiSuggestions = (await res.json()).suggestions ?? [];
		} catch {}
		opalPanelControls?.openPanel();
		opalPanelControls?.addMessage({ role: "user", content: "Optimize form" });
		opalPanelControls?.addMessage({
			role: "assistant",
			content: `Here are some suggestions to improve your form (${nodes.filter((n) => n.type === "formField").length} fields).`,
			messageType: "form-optimize",
			metadata: { duplicates, suggestions: aiSuggestions },
		});
	}, [nodes, detectDuplicateFields, opalPanelControls]);

	// ─── Logic apply ─────────────────────────────────────────────────────────────

	const ACTION_LABELS: Record<string, string> = {
		jump_to: "Jump to", show: "Show", hide: "Hide", show_values: "Show values", hide_values: "Hide values",
	};

	const handleApplyLogic = useCallback(
		(nodeId: string, ruleSets: NodeConditionLogic[]) => {
			updateNodeData(nodeId, { ruleSets });
			const targetInfo = new Map<string, { count: number; actionLabel: string }>();
			for (const logic of ruleSets) {
				const allActions = [
					...logic.thenActions,
					...logic.elseIfs.flatMap((ei) => ei.actions),
					...(logic.elseActions ?? []),
				];
				const seenInThisRule = new Set<string>();
				for (const action of allActions) {
					if (!action.targetId.startsWith("node:")) continue;
					const targetNodeId = action.targetId.replace("node:", "");
					if (seenInThisRule.has(targetNodeId)) continue;
					seenInThisRule.add(targetNodeId);
					const actionLabel = ACTION_LABELS[action.type] ?? action.type;
					const existing = targetInfo.get(targetNodeId);
					targetInfo.set(targetNodeId, existing
						? { count: existing.count + 1, actionLabel: existing.actionLabel }
						: { count: 1, actionLabel });
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

	// ─── Section auto-resize ─────────────────────────────────────────────────────

	useEffect(() => {
		const sections = nodes.filter((n) => n.type === "formSection");
		if (sections.length === 0) return;
		const PAD = 24;
		let changed = false;
		const next = nodes.map((n) => {
			if (n.type !== "formSection") return n;
			const children = nodes.filter((c) => c.parentId === n.id && !c.hidden);
			if (children.length === 0) return n;
			let maxX = 0, maxY = 0;
			for (const child of children) {
				const cw = Number((child as any).measured?.width ?? child.width ?? 280);
				const ch = Number((child as any).measured?.height ?? child.height ?? 72);
				maxX = Math.max(maxX, child.position.x + cw);
				maxY = Math.max(maxY, child.position.y + ch);
			}
			const newW = Math.max(Number(n.style?.width ?? 480), maxX + PAD);
			const newH = Math.max(Number(n.style?.height ?? 220), maxY + PAD);
			if (newW === Number(n.style?.width) && newH === Number(n.style?.height)) return n;
			changed = true;
			return { ...n, style: { ...(n.style ?? {}), width: newW, height: newH, overflow: "visible" } };
		});
		if (changed) setNodes(next);
	}, [nodes, setNodes]);

	// ─── Details panel ────────────────────────────────────────────────────────────

	const detailsPanel = useMemo(() => {
		if (isPreviewOpen) {
			return (
				<FormPreviewPanel
					formTitle={formTitle}
					nodes={nodes}
					onClose={() => setIsPreviewOpen(false)}
				/>
			);
		}
		if (selectedNode && (selectedNode.data as any).isStartingNode) {
			return (
				<FormContentPanel
					key={selectedNode.id}
					node={selectedNode}
					onClose={() => setSelectedNodeId(null)}
					onLabelChange={handleContentNodeLabelChange}
				/>
			);
		}
		if (selectedNode && selectedNode.type !== "formSection") {
			const allCanvasNodes = nodes.filter((n) => n.id !== selectedNode.id);
			return (
				<FieldDetailsPanel
					key={selectedNode.id}
					node={selectedNode}
					onClose={() => setSelectedNodeId(null)}
					allCanvasNodes={allCanvasNodes}
					onApplyLogic={(ruleSets) => handleApplyLogic(selectedNode.id, ruleSets)}
					onHighlightNodes={(targets) => { setHighlightedTargets(targets); setConflictHighlight(null); }}
					onClearHighlight={() => setHighlightedTargets([])}
					suggestedFields={suggestedFields}
					onAddSuggestedField={handleAddSuggestedField}
				/>
			);
		}
		if (isConflictsPanelOpen && conflicts.length > 0) {
			return (
				<ConflictsPanel
					conflicts={conflicts}
					activeConflictId={activeConflictId}
					isAllHighlighted={isAllConflictsHighlighted}
					onHighlightConflict={(conflict: FormConflict) => {
						setActiveConflictId(conflict.id);
						setIsAllConflictsHighlighted(false);
						setConflictHighlight({ nodeIds: conflict.affectedNodeIds, edgeIds: conflict.affectedEdgeIds ?? [] });
					}}
					onHighlightAll={() => {
						setActiveConflictId(null);
						setIsAllConflictsHighlighted(true);
						setConflictHighlight({
							nodeIds: conflicts.flatMap((c) => c.affectedNodeIds),
							edgeIds: conflicts.flatMap((c) => c.affectedEdgeIds ?? []),
						});
					}}
					onClearHighlight={() => { setActiveConflictId(null); setIsAllConflictsHighlighted(false); setConflictHighlight(null); }}
					onSuggestFixes={handleSuggestFixes}
					onClose={() => { setIsConflictsPanelOpen(false); setConflictHighlight(null); setActiveConflictId(null); setIsAllConflictsHighlighted(false); }}
				/>
			);
		}
		return null;
	}, [
		isPreviewOpen, formTitle, selectedNode, nodes, handleApplyLogic, suggestedFields, handleAddSuggestedField,
		handleContentNodeLabelChange, isConflictsPanelOpen, conflicts, activeConflictId, isAllConflictsHighlighted, handleSuggestFixes,
	]);

	// ─── Opal panel actions ───────────────────────────────────────────────────────

	const formBuilderActions = useMemo(() => ({
		removeEdge: (edgeId: string) => setEdges((eds) => eds.filter((e) => e.id !== edgeId)),
		deleteNode: (nodeId: string) => {
			if (nodeId === STARTING_NODE_ID) return;
			setNodes((nds) => nds.filter((n) => n.id !== nodeId));
			setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
		},
		applyGraph: (newNodes: any[], newEdges: any[]) => {
			setNodes(newNodes);
			setEdges(newEdges);
			setTimeout(() => reactFlowInstance?.fitView({ padding: 0.4 }), 50);
		},
	}), [setEdges, setNodes, reactFlowInstance]);

	useEffect(() => {
		setFormBuilderControls(formBuilderActions);
		return () => setFormBuilderControls(null);
	}, [setFormBuilderControls, formBuilderActions]);

	// ─── Render ───────────────────────────────────────────────────────────────────

	return (
		<FormBuilderActionsProvider actions={formBuilderActions}>
			<Box h="full" bg="bg.default">
				<Layout
					resizable
					size="full"
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
							onOptimize={handleOptimize}
							conflictCount={conflicts.length}
							onViewIssues={handleOpenIssues}
							onShowPreview={() => setIsPreviewOpen(true)}
							onClose={() => router.push("/cmp/settings/templates")}
						/>
					}
					sidebar={isLibraryOpen ? (
						<FormBuilderSidebar
							onDragStart={onDragStart}
							onOpenOpal={() => {
								opalPanelControls?.openPanel();
								opalPanelControls?.addMessage({ role: "user", content: "Build a form" });
								opalPanelControls?.addMessage({ role: "assistant", content: "Sure! A few more details will help me build your form." });
								opalPanelControls?.addMessage({ role: "assistant", content: "", messageType: "form-build-questions", metadata: { blockType: "form-build-questions" } });
							}}
						/>
					) : null}
					detailsPanel={detailsPanel}
				>
					<Box
						ref={reactFlowWrapper}
						flex="1"
						style={{ height: "100%", position: "relative" }}
					>
						<ReactFlow
							nodes={patchedNodes}
							edges={patchedEdges}
							nodeTypes={nodeTypes}
							edgeTypes={edgeTypes}
							onNodesChange={(changes) =>
								onNodesChange(changes.filter((c) => !(c.type === "remove" && c.id === STARTING_NODE_ID)))
							}
							onEdgesChange={onEdgesChange}
							onConnect={onConnect}
							onInit={setReactFlowInstance}
							onDrop={onDrop}
							onDragOver={onDragOver}
							onNodeClick={onNodeClick}
							onPaneClick={onPaneClick}
							onNodeDragStop={(e, node, currentNodes) => onNodeDragStop(e, node, currentNodes)}
							snapToGrid
							snapGrid={[20, 20]}
							fitView
							fitViewOptions={{ padding: 0.4 }}
							deleteKeyCode={["Delete", "Backspace"]}
						>
							<Controls />
							<Background variant={BackgroundVariant.Dots} gap={20} size={1} />
						</ReactFlow>
					</Box>
				</Layout>

				<CreateTemplateModal
					open={isCreateModalOpen}
					onSave={handleModalSave}
					onCancel={() => router.push("/cmp/settings/templates")}
				/>

				{validationWarnings && (
					<ValidationDialog
						warnings={validationWarnings}
						onSaveAnyway={() => { setValidationWarnings(null); console.log("Force-saved", { nodes, edges }); }}
						onCancel={() => setValidationWarnings(null)}
					/>
				)}
			</Box>
		</FormBuilderActionsProvider>
	);
}

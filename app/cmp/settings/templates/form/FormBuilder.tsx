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
import { useRouter, useSearchParams } from "next/navigation";

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
import { CreateFieldModal } from "./components/CreateFieldModal";
import type { FormConflict } from "./utils/detectFormConflicts";
import { toaster } from "@optiaxiom/react";
import { CONTENT_COMPONENTS, ALL_COMPONENTS, WORK_REQUEST_FIELDS } from "./data";
import type { FormFieldDef } from "./types";
import { IconHeading } from "@tabler/icons-react";

const STARTING_NODE_ID = "form-title-start";

import { useFormBuilderState, getNodeId } from "./hooks/useFormBuilderState";
import { validateFormGraph } from "./utils/validateFormGraph";
import { detectFormConflicts } from "./utils/detectFormConflicts";
import usePersistentState from "@/app/usePersistentState";
import type { ValidationWarning, FormTemplate } from "./types";

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

function UnsavedChangesDialog({
	onSave,
	onDiscard,
	onCancel,
}: {
	onSave: () => void;
	onDiscard: () => void;
	onCancel: () => void;
}) {
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
				style={{ width: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
				display="flex"
				flexDirection="column"
				gap="16"
			>
				<Box fontSize="md" fontWeight="600" color="fg.default">
					Unsaved changes
				</Box>
				<Box fontSize="sm" color="fg.secondary">
					You have unsaved changes. If you close now, your changes will be lost.
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
					<button
						onClick={onDiscard}
						style={{
							border: "1px solid var(--ax-colors-border-default)",
							borderRadius: 6,
							padding: "6px 16px",
							background: "none",
							cursor: "pointer",
							fontSize: 14,
							color: "var(--ax-colors-fg-critical, #dc2626)",
						}}
					>
						Discard changes
					</button>
					<button
						onClick={onSave}
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
						Save and close
					</button>
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
	const [formTitle, setFormTitle] = useState("");
	const [formDescription, setFormDescription] = useState("");
	const [formApplicableTo, setFormApplicableTo] = useState<string[]>([]);
	const [isActive, setIsActive] = useState(false);
	const [customFields, setCustomFields] = useState<FormFieldDef[]>([]);
	const [isCanvasCreateFieldOpen, setIsCanvasCreateFieldOpen] = useState(false);
	const [createFieldSourceNodeId, setCreateFieldSourceNodeId] = useState<string | null>(null);
	const searchParams = useSearchParams();
	const editingFormId = searchParams.get("id");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(!editingFormId);
	const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);
	const [isLibraryOpen, setIsLibraryOpen] = useState(true);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[] | null>(null);
	const [highlightedTargets, setHighlightedTargets] = useState<Array<{ nodeId: string; actionLabel: string }>>([]);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [isConflictsPanelOpen, setIsConflictsPanelOpen] = useState(false);
	const [activeConflictId, setActiveConflictId] = useState<string | null>(null);
	const [isAllConflictsHighlighted, setIsAllConflictsHighlighted] = useState(false);
	const [conflictHighlight, setConflictHighlight] = useState<{ nodeIds: string[]; edgeIds: string[] } | null>(null);
	const [formId, setFormId] = useState<string | null>(null);
	const [lastSavedSig, setLastSavedSig] = useState<string>("");
	const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
	const [formTemplates, setFormTemplates] = usePersistentState("formTemplates", [] as FormTemplate[]) as [
		FormTemplate[] | undefined,
		(value: FormTemplate[]) => void,
	];

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

	const selectNode = useCallback((id: string | null) => {
		setSelectedNodeId(id);
		setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === id })));
	}, [setNodes]);

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
						const FIELD_W = 280;
						const GAP = 12;
						const PAD = 24;
						const childY = SECTION_HEADER_HEIGHT + 16;
						if (siblings.length === 0) {
							finalPosition = { x: 16, y: childY };
						} else {
							const lastRight = Math.max(
								...siblings.map((s) => s.position.x + Number((s as any).measured?.width ?? FIELD_W)),
							);
							finalPosition = { x: lastRight + GAP, y: childY };
						}
						const newH = sh;
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
					label: (nodeType === "formField" || nodeType === "formContent") ? "" : name,
					typeLabel: fieldDef?.typeLabel || typeLabel || undefined,
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
			if (nodeType === "formField" || nodeType === "formContent") selectNode(newNode.id);
		},
		[reactFlowInstance, addNode, setNodes, nodes],
	);

	const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

	// ─── Suggested next fields ───────────────────────────────────────────────────

	// ─── Inline add-below (+ button on nodes) ───────────────────────────────────

	const handleAddNodeBelow = useCallback(
		(sourceNodeId: string, type: "text" | "section" | "field", fieldDefId?: string) => {
			const sourceNode = nodes.find((n) => n.id === sourceNodeId);
			if (!sourceNode) return;

			const parentId = (sourceNode as any).parentId as string | undefined;
			const parentSection = parentId ? nodes.find((n) => n.id === parentId) : undefined;

			// Nodes inside a section stay inside; sections always land at canvas level
			const inSection = !!parentId && type !== "section";
			const GAP = inSection ? 12 : 80;
			const offsetY = ((sourceNode as any).measured?.height ?? 60) + GAP;
			const newId = getNodeId();
			let newNode: any;

			if (type === "text") {
				const c = CONTENT_COMPONENTS.find((x) => x.id === "paragraph") ?? CONTENT_COMPONENTS[0];
				newNode = {
					id: newId, type: "formContent",
					position: { x: sourceNode.position.x, y: sourceNode.position.y + offsetY },
					...(inSection ? { parentId } : {}),
					data: { label: "", icon: c.icon, contentType: "paragraph" },
				};
			} else if (type === "section") {
				// Place below the parent section (if source is inside one) or below source itself
				const refNode = parentSection ?? sourceNode;
				const refH = refNode.type === "formSection"
					? Number(refNode.style?.height ?? 220)
					: ((refNode as any).measured?.height ?? 60);
				const sectionY = refNode.position.y + refH + 80;

				// If sibling sections already exist, place to the right; otherwise center under source
				const SECTION_W = 480;
				const siblingTargetIds = new Set(edges.filter((e) => e.source === sourceNodeId).map((e) => e.target));
				const siblingSections = nodes.filter((n) => siblingTargetIds.has(n.id) && n.type === "formSection");
				const refNodeW = refNode.type === "formSection"
					? Number(refNode.style?.width ?? SECTION_W)
					: ((refNode as any).measured?.width ?? 280);
				const sectionX = siblingSections.length > 0
					? Math.max(...siblingSections.map((n) => n.position.x + Number(n.style?.width ?? SECTION_W))) + 40
					: refNode.position.x + refNodeW / 2 - SECTION_W / 2;

				newNode = {
					id: newId, type: "formSection",
					position: { x: sectionX, y: sectionY },
					style: { width: 480, height: 220, overflow: "visible" },
					data: { label: "New Section", onToggleCollapse: () => {}, onDuplicate: () => {} },
				};
			} else if (type === "field" && fieldDefId) {
				const f = WORK_REQUEST_FIELDS.find((fld) => fld.id === fieldDefId) ?? customFields.find((fld) => fld.id === fieldDefId);
				if (!f) return;
				newNode = {
					id: newId, type: "formField",
					position: { x: sourceNode.position.x, y: sourceNode.position.y + offsetY },
					...(inSection ? { parentId } : {}),
					data: { label: "", typeLabel: f.typeLabel, icon: f.icon, required: f.required ?? false, fieldDefId: f.id },
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
			if (type === "field" || type === "text") selectNode(newId);
		},
		[nodes, edges, customFields, addNodeWithEdge],
	);

	const handleAddSectionChild = useCallback(
		(sectionId: string, type: "text" | "field", fieldDefId?: string) => {
			const sectionNode = nodes.find((n) => n.id === sectionId);
			if (!sectionNode) return;

			const children = nodes.filter((n) => (n as any).parentId === sectionId);
			const newId = getNodeId();
			const FIELD_W = 280;
			const GAP = 12;
			const PAD = 24;
			const y = SECTION_HEADER_HEIGHT + 16;

			const x = children.length === 0
				? 16
				: Math.max(...children.map((c) => c.position.x + ((c as any).measured?.width ?? FIELD_W))) + GAP;

			// Expand section width if the new child would overflow
			const sw = Number(sectionNode.style?.width ?? 480);
			const sh = Number(sectionNode.style?.height ?? 220);
			const neededW = x + FIELD_W + PAD;
			if (neededW > sw) {
				setNodes((nds) => nds.map((n) =>
					n.id === sectionId ? { ...n, style: { ...(n.style ?? {}), width: neededW, height: sh, overflow: "visible" } } : n,
				));
			}

			let newNode: any;
			if (type === "text") {
				const c = CONTENT_COMPONENTS.find((x) => x.id === "paragraph") ?? CONTENT_COMPONENTS[0];
				newNode = { id: newId, type: "formContent", position: { x, y }, parentId: sectionId, data: { label: "", icon: c.icon, contentType: "paragraph" } };
			} else if (type === "field" && fieldDefId) {
				const f = WORK_REQUEST_FIELDS.find((fld) => fld.id === fieldDefId) ?? customFields.find((fld) => fld.id === fieldDefId);
				if (!f) return;
				newNode = { id: newId, type: "formField", position: { x, y }, parentId: sectionId, data: { label: "", typeLabel: f.typeLabel, icon: f.icon, required: f.required ?? false, fieldDefId: f.id } };
			}

			if (!newNode) return;
			addNode(newNode);

			// Connect to previous sibling
			if (children.length > 0) {
				const lastChild = [...children].sort((a, b) => b.position.x - a.position.x)[0];
				setEdges((prev) => [...prev, {
					id: `e-section-${lastChild.id}-${newId}`,
					source: lastChild.id,
					target: newId,
					type: "smoothstep",
					markerEnd: { type: MarkerType.ArrowClosed },
				} as any]);
			}

			selectNode(newId);
		},
		[nodes, customFields, addNode, setEdges, setNodes, selectNode],
	);

	const handleCreateCustomField = useCallback(
		(field: FormFieldDef, sourceNodeId?: string | null) => {
			setCustomFields((prev) => [...prev, field]);
			const newId = getNodeId();

			if (sourceNodeId) {
				const sourceNode = nodes.find((n) => n.id === sourceNodeId);
				if (sourceNode) {
					const parentId = (sourceNode as any).parentId as string | undefined;
					const inSection = !!parentId;
					const GAP = inSection ? 12 : 80;
					const offsetY = ((sourceNode as any).measured?.height ?? 60) + GAP;
					addNodeWithEdge(
						{
							id: newId, type: "formField",
							position: { x: sourceNode.position.x, y: sourceNode.position.y + offsetY },
							...(inSection ? { parentId } : {}),
							data: { label: field.name, typeLabel: field.typeLabel, icon: field.icon, required: field.required ?? false, fieldDefId: field.id },
						} as any,
						{
							id: `e-custom-${sourceNodeId}-${newId}`,
							source: sourceNodeId, target: newId,
							type: "smoothstep",
							markerEnd: { type: MarkerType.ArrowClosed },
						} as any,
					);
					selectNode(newId);
					return;
				}
			}

			const lastNode = [...nodes].sort((a, b) => b.position.y - a.position.y)[0];
			const y = lastNode ? lastNode.position.y + ((lastNode as any).measured?.height ?? 80) + 80 : 100;
			const x = lastNode ? lastNode.position.x : 240;
			addNode({
				id: newId, type: "formField",
				position: { x, y },
				data: { label: field.name, typeLabel: field.typeLabel, icon: field.icon, required: field.required ?? false, fieldDefId: field.id },
			} as any);
			selectNode(newId);
		},
		[nodes, addNode, addNodeWithEdge],
	);

	const handleModalSave = useCallback(
		({ templateName, description, applicableTo }: { templateName: string; description: string; applicableTo: string[] }) => {
			setFormTitle(templateName);
			setFormDescription(description);
			setFormApplicableTo(applicableTo);
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
			setTimeout(() => {
				reactFlowInstance?.fitView({ padding: 0.4 });
				selectNode(STARTING_NODE_ID);
			}, 50);
		},
		[setNodes, reactFlowInstance],
	);

	const handleEditDetailsSave = useCallback(
		({ templateName, description, applicableTo }: { templateName: string; description: string; applicableTo: string[] }) => {
			setFormTitle(templateName);
			setFormDescription(description);
			setFormApplicableTo(applicableTo);
			setIsEditDetailsOpen(false);
		},
		[],
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
			onAddNodeBelow: (type: string, fieldDefId?: string) => handleAddNodeBelow(n.id, type as any, fieldDefId),
			customFields,
			onOpenCreateField: () => {
				setCreateFieldSourceNodeId(n.id);
				setIsCanvasCreateFieldOpen(true);
			},
		};

		if (n.type !== "formSection") {
			return { ...n, data: { ...n.data, ...extra, ...addCallbacks } };
		}
		const childCount = nodes.filter((c) => (c as any).parentId === n.id).length;
		const sectionHeight = Number(n.style?.height ?? 220);
		return {
			...n,
			zIndex: -1,
			data: {
				...n.data,
				...extra,
				...addCallbacks,
				childCount,
				sectionHeight,
				onAddSectionChild: (type: string, fieldDefId?: string) => handleAddSectionChild(n.id, type as any, fieldDefId),
				onResizeSection: (height: number) => setNodes((nds) => nds.map((nd) =>
					nd.id === n.id ? { ...nd, style: { ...(nd.style ?? {}), height, overflow: "visible" } } : nd,
				)),
				onToggleCollapse: () => toggleSectionCollapse(n.id),
				onDuplicate: () => duplicateSection(n.id),
				onLabelChange: (label: string) => updateNodeData(n.id, { label }),
			},
		};
	}), [nodes, conflictHighlight, highlightedSet, highlightedTargets, selectedNodeId, customFields,
		handleAddNodeBelow, handleAddSectionChild, toggleSectionCollapse, duplicateSection, updateNodeData, setIsCanvasCreateFieldOpen]);

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
		selectNode(node.id);
		setHighlightedTargets([]);
		setConflictHighlight(null);
		setActiveConflictId(null);
		setIsAllConflictsHighlighted(false);
		// Selecting a node takes over the right panel; close the preview if open.
		setIsPreviewOpen(false);
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

	// ─── Save ─────────────────────────────────────────────────────────────────────

	// Strip non-serializable fields (icons, callbacks) before persisting.
	const serializableSnapshot = useCallback(() => {
		const stripData = (data: any): any => {
			if (!data || typeof data !== "object") return data;
			const out: any = {};
			for (const k of Object.keys(data)) {
				const v = (data as any)[k];
				if (typeof v === "function") continue;
				if (v && typeof v === "object" && (v as any).$$typeof) continue; // React elements (icons)
				out[k] = v;
			}
			return out;
		};
		const cleanNodes = nodes.map((n) => ({ ...n, data: stripData(n.data) }));
		const cleanCustom = customFields.map((f) => {
			const { icon: _icon, ...rest } = f as any;
			return rest;
		});
		return { nodes: cleanNodes, edges, customFields: cleanCustom };
	}, [nodes, edges, customFields]);

	const currentSig = useMemo(() => {
		const snap = serializableSnapshot();
		return JSON.stringify({
			formTitle,
			formDescription,
			formApplicableTo,
			isActive,
			...snap,
		});
	}, [formTitle, formDescription, formApplicableTo, isActive, serializableSnapshot]);

	const isDirty = currentSig !== lastSavedSig;

	const persistForm = useCallback(() => {
		const snap = serializableSnapshot();
		const now = new Date().toISOString();
		const id = formId ?? `form-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const existing = (formTemplates ?? []).find((t) => t.id === id);
		const template: FormTemplate = {
			id,
			name: formTitle,
			description: formDescription,
			applicableTo: formApplicableTo,
			isActive,
			nodes: snap.nodes,
			edges: snap.edges,
			customFields: snap.customFields,
			createdAt: existing?.createdAt ?? now,
			updatedAt: now,
		};
		const next = existing
			? (formTemplates ?? []).map((t) => (t.id === id ? template : t))
			: [...(formTemplates ?? []), template];
		setFormTemplates(next);
		setFormId(id);
		setLastSavedSig(currentSig);
	}, [formId, formTemplates, setFormTemplates, formTitle, formDescription, formApplicableTo, isActive, currentSig, serializableSnapshot]);

	const handleSave = useCallback(async () => {
		const warnings = validateFormGraph(nodes, edges);
		if (warnings.length > 0) {
			setValidationWarnings(warnings);
			return;
		}
		persistForm();
		toaster.create("Form template saved", { intent: "success" });
	}, [nodes, edges, persistForm]);

	const handleCloseRequest = useCallback(() => {
		if (isDirty) {
			setConfirmCloseOpen(true);
			return;
		}
		router.push("/cmp/settings/templates");
	}, [isDirty, router]);

	const handleConfirmDiscard = useCallback(() => {
		setConfirmCloseOpen(false);
		router.push("/cmp/settings/templates");
	}, [router]);

	const handleSaveAndClose = useCallback(() => {
		const warnings = validateFormGraph(nodes, edges);
		if (warnings.length > 0) {
			setConfirmCloseOpen(false);
			setValidationWarnings(warnings);
			return;
		}
		persistForm();
		setConfirmCloseOpen(false);
		toaster.create("Form template saved", { intent: "success" });
		router.push("/cmp/settings/templates");
	}, [nodes, edges, persistForm, router]);

	// ─── Logic apply ─────────────────────────────────────────────────────────────

	const ACTION_LABELS: Record<string, string> = {
		jump_to: "Jump to", show: "Show", hide: "Hide", show_values: "Show values", hide_values: "Hide values",
	};

	const handleUpdateFieldData = useCallback(
		(nodeId: string, data: Partial<Record<string, any>>) => {
			updateNodeData(nodeId, data);
		},
		[updateNodeData],
	);

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

	// ─── Load existing form when ?id=… is present ────────────────────────────────

	const hasLoadedRef = useRef(false);
	useEffect(() => {
		if (hasLoadedRef.current) return;
		if (!editingFormId) return;
		const template = (formTemplates ?? []).find((t) => t.id === editingFormId);
		if (!template) return;
		hasLoadedRef.current = true;
		setFormId(template.id);
		setFormTitle(template.name);
		setFormDescription(template.description);
		setFormApplicableTo(template.applicableTo);
		setIsActive(template.isActive);
		setCustomFields(template.customFields as FormFieldDef[]);
		setNodes(template.nodes as any);
		setEdges(template.edges as any);
		setIsCreateModalOpen(false);
		setTimeout(() => {
			setLastSavedSig(JSON.stringify({
				formTitle: template.name,
				formDescription: template.description,
				formApplicableTo: template.applicableTo,
				isActive: template.isActive,
				nodes: template.nodes,
				edges: template.edges,
				customFields: template.customFields,
			}));
			reactFlowInstance?.fitView({ padding: 0.4 });
			selectNode(STARTING_NODE_ID);
		}, 50);
	}, [editingFormId, formTemplates, setNodes, setEdges, reactFlowInstance]);

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
					edges={edges}
					customFields={customFields}
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
					onUpdateField={(data) => handleUpdateFieldData(selectedNode.id, data)}
					onHighlightNodes={(targets) => { setHighlightedTargets(targets); setConflictHighlight(null); }}
					onClearHighlight={() => setHighlightedTargets([])}
					customFields={customFields}
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
					onClose={() => { setIsConflictsPanelOpen(false); setConflictHighlight(null); setActiveConflictId(null); setIsAllConflictsHighlighted(false); }}
				/>
			);
		}
		return null;
	}, [
		isPreviewOpen, formTitle, selectedNode, nodes, handleApplyLogic, handleUpdateFieldData, customFields,
		handleContentNodeLabelChange, isConflictsPanelOpen, conflicts, activeConflictId, isAllConflictsHighlighted,
	]);

	// ─── Render ───────────────────────────────────────────────────────────────────

	return (
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
							isActive={isActive}
							onSave={handleSave}
							onToggleActive={() => {
							setIsActive((v) => {
								toaster.create(v ? "Template set to Inactive" : "Template set to Active", { intent: v ? "information" : "success" });
								return !v;
							});
						}}
							onEditDetails={() => setIsEditDetailsOpen(true)}
							conflictCount={conflicts.length}
							onViewIssues={handleOpenIssues}
							onShowPreview={() => setIsPreviewOpen(true)}
							onClose={handleCloseRequest}
						/>
					}
					sidebar={isLibraryOpen ? (
						<FormBuilderSidebar
						onDragStart={onDragStart}
						customFields={customFields}
						onCreateField={handleCreateCustomField}
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

				<CreateTemplateModal
					open={isEditDetailsOpen}
					title="Template Details"
					initialValues={{ templateName: formTitle, description: formDescription, applicableTo: formApplicableTo }}
					onSave={handleEditDetailsSave}
					onCancel={() => setIsEditDetailsOpen(false)}
				/>

				<CreateFieldModal
					open={isCanvasCreateFieldOpen}
					onSave={(field) => {
						handleCreateCustomField(field, createFieldSourceNodeId);
						setCreateFieldSourceNodeId(null);
						setIsCanvasCreateFieldOpen(false);
					}}
					onCancel={() => {
						setCreateFieldSourceNodeId(null);
						setIsCanvasCreateFieldOpen(false);
					}}
				/>

				{validationWarnings && (
					<ValidationDialog
						warnings={validationWarnings}
						onSaveAnyway={() => {
							setValidationWarnings(null);
							persistForm();
							toaster.create("Form template saved", { intent: "success" });
						}}
						onCancel={() => setValidationWarnings(null)}
					/>
				)}

				{confirmCloseOpen && (
					<UnsavedChangesDialog
						onSave={handleSaveAndClose}
						onDiscard={handleConfirmDiscard}
						onCancel={() => setConfirmCloseOpen(false)}
					/>
				)}
		</Box>
	);
}

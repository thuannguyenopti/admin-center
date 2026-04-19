"use client";

import { useState, useCallback, useEffect } from "react";
import { useNodesState, useEdgesState, addEdge, MarkerType } from "@xyflow/react";
import type { Node, Edge, Connection } from "@xyflow/react";
import type { Snapshot } from "../types";

const INITIAL_NODES: Node[] = [];
let nodeCounter = 0;
export const getNodeId = () => `form-node-${++nodeCounter}`;

const MAX_HISTORY = 50;

/**
 * Clone a value for undo/redo snapshots.
 * - Primitives: copied as-is
 * - Functions: stripped (callbacks are re-injected by FormBuilder via patchedNodes)
 * - React elements ($$typeof): kept by reference — they're immutable
 * - Arrays / plain objects: recursively cloned
 */
function cloneValue(val: unknown): unknown {
	if (val === null || val === undefined) return val;
	if (typeof val === "function") return undefined; // strip — re-injected at render
	if (typeof val !== "object") return val; // primitives

	// React elements are immutable — safe to share the reference
	if ((val as any).$$typeof) return val;

	if (Array.isArray(val)) {
		return (val as unknown[]).map(cloneValue);
	}

	const clone: Record<string, unknown> = {};
	for (const key of Object.keys(val as object)) {
		const cloned = cloneValue((val as any)[key]);
		if (cloned !== undefined) clone[key] = cloned;
	}
	return clone;
}

function deepClone<T>(val: T): T {
	return cloneValue(val) as T;
}

export function useFormBuilderState() {
	const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

	// ─── Undo / Redo ─────────────────────────────────────────────────────────────

	const [history, setHistory] = useState<Snapshot[]>([{ nodes: [], edges: [] }]);
	const [historyIndex, setHistoryIndex] = useState(0);
	const [isRestoring, setIsRestoring] = useState(false);

	const pushSnapshot = useCallback(
		(nextNodes: Node[], nextEdges: Edge[]) => {
			if (isRestoring) return;
			setHistory((prev) => {
				const truncated = prev.slice(0, historyIndex + 1);
				const next = [...truncated, { nodes: deepClone(nextNodes), edges: deepClone(nextEdges) }];
				return next.slice(-MAX_HISTORY);
			});
			setHistoryIndex((i) => Math.min(i + 1, MAX_HISTORY - 1));
		},
		[historyIndex, isRestoring],
	);

	const undo = useCallback(() => {
		if (historyIndex <= 0) return;
		const idx = historyIndex - 1;
		const snapshot = history[idx];
		setIsRestoring(true);
		setNodes(deepClone(snapshot.nodes));
		setEdges(deepClone(snapshot.edges));
		setHistoryIndex(idx);
		setTimeout(() => setIsRestoring(false), 0);
	}, [history, historyIndex, setNodes, setEdges]);

	const redo = useCallback(() => {
		if (historyIndex >= history.length - 1) return;
		const idx = historyIndex + 1;
		const snapshot = history[idx];
		setIsRestoring(true);
		setNodes(deepClone(snapshot.nodes));
		setEdges(deepClone(snapshot.edges));
		setHistoryIndex(idx);
		setTimeout(() => setIsRestoring(false), 0);
	}, [history, historyIndex, setNodes, setEdges]);

	const canUndo = historyIndex > 0;
	const canRedo = historyIndex < history.length - 1;

	// ─── Keyboard shortcuts ───────────────────────────────────────────────────────

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const meta = e.metaKey || e.ctrlKey;
			if (!meta) return;
			if (e.key === "z" && !e.shiftKey) {
				e.preventDefault();
				undo();
			} else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
				e.preventDefault();
				redo();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [undo, redo]);

	// ─── Node / edge helpers ──────────────────────────────────────────────────────

	const addNode = useCallback(
		(node: Node) => {
			setNodes((nds) => {
				const next = nds.concat(node);
				pushSnapshot(next, edges);
				return next;
			});
		},
		[setNodes, edges, pushSnapshot],
	);

	const onConnect = useCallback(
		(connection: Connection, currentNodes: Node[]) => {
			setEdges((eds) => {
				const next = addEdge(
					{
						...connection,
						type: "smoothstep",
						markerEnd: { type: MarkerType.ArrowClosed },
					},
					eds,
				);
				pushSnapshot(currentNodes, next);
				return next;
			});
		},
		[setEdges, pushSnapshot],
	);

	// Update edge labels based on logic rules configured on the source node
	const updateEdgesForNode = useCallback(
		(nodeId: string, logicRules: Array<{ targetNodeId: string; label: string }>) => {
			setEdges((eds) => {
				const next = eds.map((e) => {
					if (e.source !== nodeId) return e;
					const rule = logicRules.find((r) => r.targetNodeId === e.target);
					if (rule) {
						return {
							...e,
							type: "formCondition",
							label: rule.label,
						};
					}
					// No rule for this edge — reset
					return { ...e, type: "smoothstep", label: undefined };
				});
				return next;
			});
		},
		[setEdges],
	);

	const updateNodeData = useCallback(
		(id: string, data: any) => {
			setNodes((nds) => {
				const next = nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n));
				pushSnapshot(next, edges);
				return next;
			});
		},
		[setNodes, edges, pushSnapshot],
	);

	const onNodeDragStop = useCallback(
		(_: any, __: any, currentNodes: Node[]) => {
			pushSnapshot(currentNodes, edges);
		},
		[edges, pushSnapshot],
	);

	// ─── Section collapse ─────────────────────────────────────────────────────────

	const toggleSectionCollapse = useCallback(
		(sectionId: string) => {
			setNodes((nds) => {
				const section = nds.find((n) => n.id === sectionId);
				if (!section) return nds;
				const isCollapsed = !(section.data as any).isCollapsed;
				const next = nds.map((n) => {
					if (n.id === sectionId) {
						return { ...n, data: { ...n.data, isCollapsed } };
					}
					if ((n.data as any).sectionId === sectionId) {
						return { ...n, hidden: isCollapsed };
					}
					return n;
				});
				pushSnapshot(next, edges);
				return next;
			});
		},
		[setNodes, edges, pushSnapshot],
	);

	// ─── Duplicate section ────────────────────────────────────────────────────────

	const duplicateSection = useCallback(
		(sectionId: string) => {
			setNodes((nds) => {
				setEdges((eds) => {
					const section = nds.find((n) => n.id === sectionId);
					if (!section) return eds;

					const children = nds.filter((n) => (n.data as any).sectionId === sectionId);
					const allToDup = [section, ...children];

					// Build ID map
					const idMap: Record<string, string> = {};
					allToDup.forEach((n) => {
						idMap[n.id] = getNodeId();
					});

					const offsetY = 300;
					const clonedNodes = allToDup.map((n) => ({
						...deepClone(n),
						id: idMap[n.id],
						position: { x: n.position.x, y: n.position.y + offsetY },
						data: {
							...(deepClone(n.data) as any),
							sectionId: n.id === sectionId ? undefined : idMap[sectionId],
						},
					}));

					// Clone internal edges, re-map IDs
					const internalEdges = eds.filter(
						(e) => idMap[e.source] && idMap[e.target],
					);
					const clonedEdges = internalEdges.map((e) => ({
						...deepClone(e),
						id: `e-${Date.now()}-${Math.random()}`,
						source: idMap[e.source],
						target: idMap[e.target],
					}));

					const nextNodes = [...nds, ...clonedNodes];
					const nextEdges = [...eds, ...clonedEdges];
					pushSnapshot(nextNodes, nextEdges);
					setTimeout(() => setNodes(nextNodes), 0);
					return nextEdges;
				});
				return nds;
			});
		},
		[setNodes, setEdges, pushSnapshot],
	);

	return {
		nodes,
		edges,
		setNodes,
		setEdges,
		onNodesChange,
		onEdgesChange,
		addNode,
		onConnect,
		updateNodeData,
		updateEdgesForNode,
		onNodeDragStop,
		toggleSectionCollapse,
		duplicateSection,
		undo,
		redo,
		canUndo,
		canRedo,
	};
}

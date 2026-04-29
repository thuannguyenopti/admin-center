import type { Node, Edge } from "@xyflow/react";
import type { NodeConditionLogic } from "../components/panels/FieldDetailsPanel";

export type ConflictSeverity = "error" | "warning";

export type FormConflict = {
	id: string;
	type: "circular_edge" | "orphan_node" | "contradictory_rule" | "undefined_edge";
	severity: ConflictSeverity;
	message: string;
	affectedNodeIds: string[];
	affectedEdgeIds?: string[];
	fix?: { type: "remove_edge"; edgeId: string } | { type: "delete_node"; nodeId: string };
};

function hasCircularPath(startId: string, edges: Edge[]): string[] {
	const visited = new Set<string>();
	const path: string[] = [];

	function dfs(nodeId: string): boolean {
		if (nodeId === startId && path.length > 0) return true;
		if (visited.has(nodeId)) return false;
		visited.add(nodeId);
		path.push(nodeId);
		for (const edge of edges) {
			if (edge.source !== nodeId) continue;
			if (dfs(edge.target)) return true;
		}
		path.pop();
		return false;
	}

	const outgoing = edges.filter((e) => e.source === startId);
	for (const edge of outgoing) {
		visited.clear();
		path.length = 0;
		visited.add(startId);
		path.push(startId);
		if (dfs(edge.target)) return [startId, ...path];
	}
	return [];
}

function detectCircularEdges(nodes: Node[], edges: Edge[]): FormConflict[] {
	const conflicts: FormConflict[] = [];
	const reportedCycles = new Set<string>();

	for (const node of nodes) {
		const cycle = hasCircularPath(node.id, edges);
		if (cycle.length === 0) continue;
		const key = [...cycle].sort().join(",");
		if (reportedCycles.has(key)) continue;
		reportedCycles.add(key);

		const nodeLabel = (node.data as any).label ?? node.id;
		const cycleEdges = edges.filter((e) => cycle.includes(e.source) && cycle.includes(e.target));

		conflicts.push({
			id: `circular-${key}`,
			type: "circular_edge",
			severity: "error",
			message: `Circular logic detected starting from "${nodeLabel}" — this path loops back on itself and will never reach an end state.`,
			affectedNodeIds: cycle,
			affectedEdgeIds: cycleEdges.map((e) => e.id),
			fix: cycleEdges[0] ? { type: "remove_edge", edgeId: cycleEdges[0].id } : undefined,
		});
	}

	return conflicts;
}

function detectOrphanNodes(nodes: Node[], edges: Edge[]): FormConflict[] {
	if (nodes.length <= 1) return [];
	const connected = new Set<string>();
	for (const edge of edges) {
		connected.add(edge.source);
		connected.add(edge.target);
	}
	return nodes
		.filter((n) => !connected.has(n.id))
		.map((n) => ({
			id: `orphan-${n.id}`,
			type: "orphan_node" as const,
			severity: "warning" as const,
			message: `"${(n.data as any).label ?? n.id}" is not connected to any other node and will never be reached.`,
			affectedNodeIds: [n.id],
			fix: { type: "delete_node" as const, nodeId: n.id },
		}));
}

function detectContradictoryRules(nodes: Node[]): FormConflict[] {
	const conflicts: FormConflict[] = [];
	for (const node of nodes) {
		const ruleSets: NodeConditionLogic[] = (node.data as any).ruleSets ?? [];
		if (ruleSets.length < 2) continue;
		const showTargets = new Set<string>();
		const hideTargets = new Set<string>();
		for (const rule of ruleSets) {
			for (const action of rule.thenActions) {
				if (action.type === "show") showTargets.add(action.targetId);
				if (action.type === "hide") hideTargets.add(action.targetId);
			}
		}
		const contradictions = [...showTargets].filter((t) => hideTargets.has(t));
		if (contradictions.length === 0) continue;
		conflicts.push({
			id: `contradiction-${node.id}`,
			type: "contradictory_rule",
			severity: "warning",
			message: `"${(node.data as any).label ?? node.id}" has rules that both show and hide the same target — only one will take effect.`,
			affectedNodeIds: [node.id],
		});
	}
	return conflicts;
}

function detectUndefinedEdges(nodes: Node[], edges: Edge[]): FormConflict[] {
	const conflicts: FormConflict[] = [];
	const outgoingEdges = new Map<string, Edge[]>();
	for (const edge of edges) {
		if (!outgoingEdges.has(edge.source)) outgoingEdges.set(edge.source, []);
		outgoingEdges.get(edge.source)!.push(edge);
	}
	for (const [nodeId, outgoing] of outgoingEdges.entries()) {
		if (outgoing.length <= 1) continue;
		const undefinedEdges = outgoing.filter((e) => !e.label);
		if (undefinedEdges.length === 0) continue;
		const node = nodes.find((n) => n.id === nodeId);
		const nodeLabel = (node?.data as any)?.label ?? nodeId;
		for (const edge of undefinedEdges) {
			const targetNode = nodes.find((n) => n.id === edge.target);
			const targetLabel = (targetNode?.data as any)?.label ?? edge.target;
			conflicts.push({
				id: `undefined-edge-${edge.id}`,
				type: "undefined_edge",
				severity: "warning",
				message: `Connection from "${nodeLabel}" to "${targetLabel}" has no condition defined — when a node has multiple outgoing paths, all connections need logic.`,
				affectedNodeIds: [nodeId, edge.target],
				affectedEdgeIds: [edge.id],
				fix: { type: "remove_edge", edgeId: edge.id },
			});
		}
	}
	return conflicts;
}

export function detectFormConflicts(nodes: Node[], edges: Edge[]): FormConflict[] {
	return [
		...detectCircularEdges(nodes, edges),
		...detectOrphanNodes(nodes, edges),
		...detectContradictoryRules(nodes),
		...detectUndefinedEdges(nodes, edges),
	];
}

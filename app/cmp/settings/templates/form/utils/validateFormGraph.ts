import type { Node, Edge } from "@xyflow/react";
import type { ValidationWarning } from "../types";

export function validateFormGraph(nodes: Node[], edges: Edge[]): ValidationWarning[] {
	const warnings: ValidationWarning[] = [];

	for (const node of nodes) {
		if (node.type === "formCondition") {
			const incoming = edges.filter((e) => e.target === node.id);
			const outgoing = edges.filter((e) => e.source === node.id);
			const data = node.data as any;

			if (incoming.length === 0 && outgoing.length === 0) {
				warnings.push({
					nodeId: node.id,
					message: `Condition "${data.label ?? "Condition"}" has no connections`,
					severity: "warning",
				});
			}

			const hasThen =
				Array.isArray(data.thenActions) &&
				data.thenActions.some((a: any) => a.type);
			if (!hasThen) {
				warnings.push({
					nodeId: node.id,
					message: `Condition "${data.label ?? "Condition"}" has no THEN action defined`,
					severity: "warning",
				});
			}
		}
	}

	// Detect cycles via DFS
	const hasCycle = detectCycle(nodes, edges);
	if (hasCycle) {
		warnings.push({
			nodeId: "",
			message: "Logic contains a circular dependency",
			severity: "error",
		});
	}

	return warnings;
}

function detectCycle(nodes: Node[], edges: Edge[]): boolean {
	const adj: Record<string, string[]> = {};
	for (const n of nodes) adj[n.id] = [];
	for (const e of edges) {
		if (adj[e.source]) adj[e.source].push(e.target);
	}

	const visited = new Set<string>();
	const stack = new Set<string>();

	function dfs(id: string): boolean {
		if (stack.has(id)) return true;
		if (visited.has(id)) return false;
		visited.add(id);
		stack.add(id);
		for (const neighbor of adj[id] ?? []) {
			if (dfs(neighbor)) return true;
		}
		stack.delete(id);
		return false;
	}

	for (const n of nodes) {
		if (dfs(n.id)) return true;
	}
	return false;
}

// ─── Shared types for Form Builder V2 ─────────────────────────────────────────

export type FieldOption = { label: string; value: string };

export type FormFieldDef = {
	id: string;
	name: string;
	nodeType: string;
	typeLabel: string;
	icon: React.ReactNode;
	description: string;
	required: boolean;
	placeholder?: string;
	options?: FieldOption[];
};

// ─── Inline logic rule (per-node) ────────────────────────────────────────────

export type LogicRule = {
	id: string;
	operator: string; // equal, not_equal, contains, empty, filled, etc.
	value: string; // option value from field's options, or free text
	action: string; // show, hide, jump_to, require
	targetNodeId: string; // which connected node this rule applies to
};

// ─── Condition logic types (legacy, used by ConditionLogicPanel) ──────────────

export type LogicOperator =
	| "equal"
	| "not_equal"
	| "any_of"
	| "not_any_of"
	| "empty"
	| "filled"
	| "contains"
	| "not_contains"
	| "greater_than"
	| "less_than";

export type LogicJoin = "AND" | "OR";

export type ActionType =
	| "jump_to"
	| "show"
	| "hide"
	| "show_values"
	| "hide_values"
	| "require"
	| "set_value"
	| "skip_to";

export type ConditionClause = {
	id: string;
	fieldId?: string; // which field this clause references (branch-scoped)
	operator: LogicOperator | string;
	value: string;
	chain: LogicJoin; // chain to the NEXT clause (ignored for first)
};

export type ActionRow = {
	id: string;
	type: ActionType | string;
	targetId: string; // node this action applies to
	value?: string; // for set_value actions
};

export type ElseIfBlock = {
	id: string;
	clauses: ConditionClause[];
	actions: ActionRow[];
};

export type ConditionLogic = {
	ifClauses: ConditionClause[];
	thenActions: ActionRow[];
	elseIfBlocks: ElseIfBlock[];
	elseActions: ActionRow[] | null;
};

// ─── Validation ───────────────────────────────────────────────────────────────

export type ValidationSeverity = "error" | "warning";

export type ValidationWarning = {
	nodeId: string;
	message: string;
	severity: ValidationSeverity;
};

// ─── Submission storage ───────────────────────────────────────────────────────

export type FormSubmission = {
	id: string;
	formId: string;
	submittedAt: string;
	values: Record<string, unknown>; // fieldId → value
	branchPath: string[]; // nodeIds traversed
	taskId?: string;
	campaignId?: string;
};

// ─── Opal AI foundation ───────────────────────────────────────────────────────

export type OpalSuggestion = {
	type: "suggest_rule" | "detect_conflict" | "auto_filter";
	nodeId?: string;
	message: string;
	action?: Partial<ConditionLogic>;
};

// ─── History snapshot for undo/redo ──────────────────────────────────────────

import type { Node, Edge } from "@xyflow/react";

export type Snapshot = {
	nodes: Node[];
	edges: Edge[];
};

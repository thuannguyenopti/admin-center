"use client";

import { useState } from "react";
import { Box, Badge, Switch } from "@optiaxiom/react";
import {
	DetailsPanel,
	DetailsPanelBody,
	DetailsPanelHeader,
} from "@optiaxiom/react/unstable";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { IconX, IconPlus, IconTrash } from "@tabler/icons-react";
import { WORK_REQUEST_FIELDS } from "../../data";
import type { ConditionClause, ActionRow, ElseIfBlock, FieldOption } from "../../types";

// ─── Shared styles ────────────────────────────────────────────────────────────

const sx: React.CSSProperties = {
	border: "1px solid var(--ax-colors-border-default)",
	borderRadius: "6px",
	padding: "6px 8px",
	fontSize: "13px",
	color: "var(--ax-colors-fg-default)",
	background: "var(--ax-colors-bg-default)",
	width: "100%",
	cursor: "pointer",
	outline: "none",
};

const addBtn: React.CSSProperties = {
	background: "none",
	border: "1px solid var(--ax-colors-border-default)",
	borderRadius: "6px",
	padding: "4px 10px",
	fontSize: "12px",
	cursor: "pointer",
	color: "var(--ax-colors-fg-secondary)",
	display: "flex",
	alignItems: "center",
	gap: "4px",
};

const chipBtn = (active?: boolean): React.CSSProperties => ({
	background: active ? "var(--ax-colors-bg-accent-subtle)" : "none",
	border: "1px solid var(--ax-colors-border-default)",
	borderRadius: "4px",
	padding: "2px 8px",
	fontSize: "11px",
	fontWeight: 700,
	cursor: "pointer",
	color: active ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-secondary)",
});

// ─── Operators / Actions ──────────────────────────────────────────────────────

const OPERATORS = [
	{ value: "equal",      label: "Equal to",     hasValue: true  },
	{ value: "not_equal",  label: "Not equal to", hasValue: true  },
	{ value: "any_of",     label: "Any of",        hasValue: true  },
	{ value: "not_any_of", label: "Not any of",   hasValue: true  },
	{ value: "empty",      label: "Empty",         hasValue: false },
	{ value: "filled",     label: "Filled",        hasValue: false },
];

// Whether "End of form" is a valid target for each action
const INCLUDE_END_OF_FORM: Record<string, boolean> = {
	jump_to:     true,
	show:        false,
	hide:        false,
	show_values: false,
	hide_values: false,
};

const ACTIONS = [
	{ value: "jump_to",     label: "Jump to"       },
	{ value: "show",        label: "Show / Display" },
	{ value: "hide",        label: "Hide"           },
	{ value: "show_values", label: "Show values"   },
	{ value: "hide_values", label: "Hide values"   },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export type NodeConditionLogic = {
	id: string;
	ifClauses: ConditionClause[];
	thenActions: ActionRow[];
	elseIfs: ElseIfBlock[];
	elseActions: ActionRow[] | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractTargetNodeIds(logic: NodeConditionLogic): string[] {
	const allActions = [
		...logic.thenActions,
		...logic.elseIfs.flatMap((ei) => ei.actions),
		...(logic.elseActions ?? []),
	];
	return allActions
		.filter((a) => a.targetId.startsWith("node:"))
		.map((a) => a.targetId.replace("node:", ""));
}

const emptyClause = (): ConditionClause => ({
	id: `c${Date.now()}-${Math.random()}`,
	operator: "equal",
	value: "",
	chain: "AND",
});

const emptyAction = (): ActionRow => ({
	id: `a${Date.now()}-${Math.random()}`,
	type: "",
	targetId: "",
});

const emptyRuleSet = (): NodeConditionLogic => ({
	id: `rs${Date.now()}-${Math.random()}`,
	ifClauses: [emptyClause()],
	thenActions: [emptyAction()],
	elseIfs: [],
	elseActions: null,
});

// ─── SectionLabel ─────────────────────────────────────────────────────────────

function SectionLabel({ children, color, bg }: { children: string; color: string; bg: string }) {
	return (
		<span
			style={{
				background: bg,
				borderRadius: "4px",
				padding: "2px 8px",
				fontSize: "11px",
				fontWeight: 700,
				color,
			}}
		>
			{children}
		</span>
	);
}

// ─── ClauseRow ────────────────────────────────────────────────────────────────

function ClauseRow({
	clause,
	isFirst,
	fieldOptions,
	onChange,
	onRemove,
	onToggleChain,
}: {
	clause: ConditionClause;
	isFirst: boolean;
	fieldOptions: FieldOption[];
	onChange: (patch: Partial<ConditionClause>) => void;
	onRemove: () => void;
	onToggleChain: () => void;
}) {
	const op = OPERATORS.find((o) => o.value === clause.operator);
	return (
		<Box>
			{!isFirst && (
				<Box mb="4">
					<button style={chipBtn()} onClick={onToggleChain}>{clause.chain}</button>
				</Box>
			)}
			<Box
				display="flex"
				flexDirection="column"
				gap="6"
				p="10"
				rounded="sm"
				bg="bg.secondary"
				style={{ border: "1px solid var(--ax-colors-border-tertiary)" }}
			>
				<Box display="flex" alignItems="center" gap="6">
					<Text fontSize="xs" color="fg.tertiary" style={{ whiteSpace: "nowrap" }}>
						If value
					</Text>
					<select
						value={clause.operator}
						onChange={(e) => onChange({ operator: e.target.value, value: "" })}
						style={sx}
					>
						{OPERATORS.map((o) => (
							<option key={o.value} value={o.value}>{o.label}</option>
						))}
					</select>
				</Box>
				{op?.hasValue && (
					fieldOptions.length > 0 ? (
						<select
							value={clause.value}
							onChange={(e) => onChange({ value: e.target.value })}
							style={sx}
						>
							<option value="">Select value…</option>
							{fieldOptions.map((opt) => (
								<option key={opt.value} value={opt.value}>{opt.label}</option>
							))}
						</select>
					) : (
						<input
							value={clause.value}
							onChange={(e) => onChange({ value: e.target.value })}
							placeholder="Enter value…"
							style={sx}
						/>
					)
				)}
				<button
					onClick={onRemove}
					style={{
						background: "none",
						border: "none",
						cursor: "pointer",
						fontSize: "12px",
						color: "var(--ax-colors-fg-danger, #c0392b)",
						padding: 0,
						textAlign: "left" as const,
					}}
				>
					Remove
				</button>
			</Box>
		</Box>
	);
}

// ─── ActionRowComp ────────────────────────────────────────────────────────────

function ActionRowComp({
	action,
	onChange,
	onRemove,
	showRemove,
	connectedTargetNodes,
}: {
	action: ActionRow;
	onChange: (patch: Partial<ActionRow>) => void;
	onRemove: () => void;
	showRemove: boolean;
	connectedTargetNodes: any[];
}) {
	const includeEndOfForm = INCLUDE_END_OF_FORM[action.type] ?? true;

	const targets: { value: string; label: string }[] = [
		...connectedTargetNodes.map((n) => ({
			value: `node:${n.id}`,
			label: `${n.type === "formSection" ? "Section" : "Field"}: ${(n.data as any).label}`,
		})),
		...(includeEndOfForm ? [{ value: "end_of_form", label: "End of form" }] : []),
	];

	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="6"
			p="10"
			rounded="sm"
			bg="bg.secondary"
			style={{ border: "1px solid var(--ax-colors-border-tertiary)" }}
		>
			<select
				value={action.type}
				onChange={(e) => onChange({ type: e.target.value, targetId: "" })}
				style={sx}
			>
				<option value="">Select action…</option>
				{ACTIONS.map((a) => (
					<option key={a.value} value={a.value}>{a.label}</option>
				))}
			</select>
			{action.type && (
				<select
					value={action.targetId}
					onChange={(e) => onChange({ targetId: e.target.value })}
					style={sx}
				>
					<option value="">Select target…</option>
					{targets.map((t) => (
						<option key={t.value} value={t.value}>{t.label}</option>
					))}
				</select>
			)}
			{showRemove && (
				<button
					onClick={onRemove}
					style={{
						background: "none",
						border: "none",
						cursor: "pointer",
						fontSize: "12px",
						color: "var(--ax-colors-fg-danger, #c0392b)",
						padding: 0,
						textAlign: "left" as const,
					}}
				>
					Remove
				</button>
			)}
		</Box>
	);
}

// ─── ClauseGroup ──────────────────────────────────────────────────────────────

function ClauseGroup({
	clauses,
	fieldOptions,
	onChange,
}: {
	clauses: ConditionClause[];
	fieldOptions: FieldOption[];
	onChange: (clauses: ConditionClause[]) => void;
}) {
	const update = (id: string, patch: Partial<ConditionClause>) =>
		onChange(clauses.map((c) => (c.id === id ? { ...c, ...patch } : c)));
	const remove = (id: string) => onChange(clauses.filter((c) => c.id !== id));
	const add = (chain: "AND" | "OR") =>
		onChange([...clauses, { id: `c${Date.now()}`, operator: "equal", value: "", chain }]);
	const toggleChain = (id: string) =>
		update(id, { chain: clauses.find((c) => c.id === id)?.chain === "AND" ? "OR" : "AND" });

	return (
		<Box display="flex" flexDirection="column" gap="6">
			{clauses.map((clause, idx) => (
				<ClauseRow
					key={clause.id}
					clause={clause}
					isFirst={idx === 0}
					fieldOptions={fieldOptions}
					onChange={(patch) => update(clause.id, patch)}
					onRemove={() => remove(clause.id)}
					onToggleChain={() => toggleChain(clause.id)}
				/>
			))}
			<Box display="flex" gap="8" mt="4">
				{(["AND", "OR"] as const).map((chain) => (
					<button key={chain} style={addBtn} onClick={() => add(chain)}>
						<IconPlus size={12} /> {chain}
					</button>
				))}
			</Box>
		</Box>
	);
}

// ─── ActionGroup ──────────────────────────────────────────────────────────────

function ActionGroup({
	actions,
	connectedTargetNodes,
	onChange,
}: {
	actions: ActionRow[];
	connectedTargetNodes: any[];
	onChange: (actions: ActionRow[]) => void;
}) {
	const update = (id: string, patch: Partial<ActionRow>) =>
		onChange(actions.map((a) => (a.id === id ? { ...a, ...patch } : a)));
	const remove = (id: string) => onChange(actions.filter((a) => a.id !== id));
	const add = () =>
		onChange([...actions, { id: `a${Date.now()}`, type: "", targetId: "" }]);

	return (
		<Box display="flex" flexDirection="column" gap="6">
			{actions.map((action) => (
				<ActionRowComp
					key={action.id}
					action={action}
					onChange={(patch) => update(action.id, patch)}
					onRemove={() => remove(action.id)}
					showRemove={actions.length > 1}
					connectedTargetNodes={connectedTargetNodes}
				/>
			))}
			<button style={addBtn} onClick={add}>
				<IconPlus size={12} /> AND
			</button>
		</Box>
	);
}

// ─── SingleRuleSet (controlled, no internal state) ───────────────────────────

function SingleRuleSet({
	logic,
	fieldOptions,
	connectedTargetNodes,
	onChange,
}: {
	logic: NodeConditionLogic;
	fieldOptions: FieldOption[];
	connectedTargetNodes: any[];
	onChange: (logic: NodeConditionLogic) => void;
}) {
	const patch = (partial: Partial<NodeConditionLogic>) => onChange({ ...logic, ...partial });

	const addElseIf = () =>
		patch({
			elseIfs: [
				...logic.elseIfs,
				{ id: `ei${Date.now()}`, clauses: [emptyClause()], actions: [emptyAction()] },
			],
		});
	const removeElseIf = (id: string) =>
		patch({ elseIfs: logic.elseIfs.filter((e) => e.id !== id) });
	const updateElseIf = (id: string, p: Partial<ElseIfBlock>) =>
		patch({ elseIfs: logic.elseIfs.map((e) => (e.id === id ? { ...e, ...p } : e)) });

	const divider = (
		<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)", margin: "4px 0" }} />
	);

	return (
		<Box display="flex" flexDirection="column" gap="16">
			{/* IF */}
			<Box>
				<Box mb="8">
					<SectionLabel color="var(--ax-colors-fg-accent)" bg="var(--ax-colors-bg-accent-subtle)">
						IF
					</SectionLabel>
				</Box>
				<ClauseGroup
					clauses={logic.ifClauses}
					fieldOptions={fieldOptions}
					onChange={(ifClauses) => patch({ ifClauses })}
				/>
			</Box>

			{divider}

			{/* THEN */}
			<Box>
				<Box mb="8">
					<SectionLabel color="#1a7a4a" bg="#e8f7ef">THEN</SectionLabel>
				</Box>
				<ActionGroup
					actions={logic.thenActions}
					connectedTargetNodes={connectedTargetNodes}
					onChange={(thenActions) => patch({ thenActions })}
				/>
			</Box>

			{/* ELSE IF blocks */}
			{logic.elseIfs.map((ei) => (
				<Box key={ei.id}>
					{divider}
					<Box display="flex" alignItems="center" justifyContent="space-between" mb="8">
						<SectionLabel color="var(--ax-colors-fg-accent)" bg="var(--ax-colors-bg-accent-subtle)">
							ELSE IF
						</SectionLabel>
						<button
							onClick={() => removeElseIf(ei.id)}
							style={{
								background: "none",
								border: "none",
								cursor: "pointer",
								color: "var(--ax-colors-fg-danger, #c0392b)",
								fontSize: "12px",
							}}
						>
							Remove
						</button>
					</Box>
					<ClauseGroup
						clauses={ei.clauses}
						fieldOptions={fieldOptions}
						onChange={(clauses) => updateElseIf(ei.id, { clauses })}
					/>
					<Box mt="8">
						<Box mb="8">
							<SectionLabel color="#1a7a4a" bg="#e8f7ef">THEN</SectionLabel>
						</Box>
						<ActionGroup
							actions={ei.actions}
							connectedTargetNodes={connectedTargetNodes}
							onChange={(actions) => updateElseIf(ei.id, { actions })}
						/>
					</Box>
				</Box>
			))}

			{divider}

			{/* ELSE / add buttons */}
			<Box>
				{logic.elseActions === null ? (
					<Box display="flex" gap="8">
						<button style={addBtn} onClick={addElseIf}>
							<IconPlus size={12} /> ELSE IF
						</button>
						<button style={addBtn} onClick={() => patch({ elseActions: [emptyAction()] })}>
							<IconPlus size={12} /> ELSE
						</button>
					</Box>
				) : (
					<Box>
						<Box display="flex" alignItems="center" justifyContent="space-between" mb="8">
							<SectionLabel color="#b45309" bg="#fef3c7">ELSE</SectionLabel>
							<button
								onClick={() => patch({ elseActions: null })}
								style={{
									background: "none",
									border: "none",
									cursor: "pointer",
									color: "var(--ax-colors-fg-danger, #c0392b)",
									fontSize: "12px",
								}}
							>
								Remove
							</button>
						</Box>
						<ActionGroup
							actions={logic.elseActions}
							connectedTargetNodes={connectedTargetNodes}
							onChange={(elseActions) => patch({ elseActions })}
						/>
						<Box mt="8">
							<button style={addBtn} onClick={addElseIf}>
								<IconPlus size={12} /> ELSE IF
							</button>
						</Box>
					</Box>
				)}
			</Box>
		</Box>
	);
}

// ─── RuleSetSummary (read-only card) ─────────────────────────────────────────

function RuleSetSummary({
	logic,
	index,
	fieldOptions,
	connectedTargetNodes,
	onEdit,
	onRemove,
	onHighlightNodes,
	onClearHighlight,
}: {
	logic: NodeConditionLogic;
	index: number;
	fieldOptions: FieldOption[];
	connectedTargetNodes: any[];
	onEdit: () => void;
	onRemove: () => void;
	onHighlightNodes: (ids: string[]) => void;
	onClearHighlight: () => void;
}) {
	const opLabel = (op: string) =>
		OPERATORS.find((o) => o.value === op)?.label ?? op;

	const valLabel = (val: string) =>
		fieldOptions.find((o) => o.value === val)?.label ?? val;

	const targetLabel = (targetId: string) => {
		if (targetId === "end_of_form") return "End of form";
		const nodeId = targetId.replace("node:", "");
		const n = connectedTargetNodes.find((n) => n.id === nodeId);
		if (!n) return targetId;
		const prefix = n.type === "formSection" ? "Section" : "Field";
		return `${prefix}: ${(n.data as any).label}`;
	};

	const actionLabel = (type: string) =>
		ACTIONS.find((a) => a.value === type)?.label ?? type;

	const clauseSummary = logic.ifClauses
		.map((c, i) => {
			const op = opLabel(c.operator);
			const val = c.value ? ` "${valLabel(c.value)}"` : "";
			const chain = i > 0 ? `${c.chain} ` : "";
			return `${chain}${op}${val}`;
		})
		.join(" ");

	const thenSummary = logic.thenActions
		.filter((a) => a.type)
		.map((a) => `${actionLabel(a.type)}${a.targetId ? ` → ${targetLabel(a.targetId)}` : ""}`)
		.join(", ");

	const hasElseIf = logic.elseIfs.length > 0;
	const hasElse = logic.elseActions !== null;

	const targetNodeIds = extractTargetNodeIds(logic);

	return (
		<Box
			rounded="sm"
			style={{ border: "1px solid var(--ax-colors-border-default)", overflow: "hidden" }}
			onMouseEnter={() => targetNodeIds.length > 0 && onHighlightNodes(targetNodeIds)}
			onMouseLeave={onClearHighlight}
		>
			{/* Header */}
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				px="12"
				py="8"
				bg="bg.secondary"
				style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}
			>
				<Text fontSize="xs" fontWeight="600" color="fg.secondary">
					Rule {index + 1}
				</Text>
				<Box display="flex" alignItems="center" gap="8">
					<button
						onClick={onEdit}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							fontSize: "12px",
							color: "var(--ax-colors-fg-accent)",
							padding: 0,
						}}
					>
						Edit
					</button>
					<button
						onClick={onRemove}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							color: "var(--ax-colors-fg-tertiary)",
							padding: 0,
						}}
						aria-label="Remove rule"
					>
						<IconTrash size={13} />
					</button>
				</Box>
			</Box>

			{/* Summary body */}
			<Box display="flex" flexDirection="column" gap="6" px="12" py="10">
				{/* IF row */}
				<Box display="flex" gap="6" style={{ flexWrap: "wrap" as const, alignItems: "baseline" }}>
					<SectionLabel color="var(--ax-colors-fg-accent)" bg="var(--ax-colors-bg-accent-subtle)">
						IF
					</SectionLabel>
					<Text fontSize="xs" color="fg.default" style={{ flex: 1 }}>
						{clauseSummary || "—"}
					</Text>
				</Box>

				{/* THEN row */}
				{thenSummary && (
					<Box display="flex" gap="6" style={{ flexWrap: "wrap" as const, alignItems: "baseline" }}>
						<SectionLabel color="#1a7a4a" bg="#e8f7ef">THEN</SectionLabel>
						<Text fontSize="xs" color="fg.default" style={{ flex: 1 }}>
							{thenSummary}
						</Text>
					</Box>
				)}

				{/* ELSE IF / ELSE hints */}
				{hasElseIf && (
					<Text fontSize="xs" color="fg.tertiary">
						+{logic.elseIfs.length} ELSE IF block{logic.elseIfs.length > 1 ? "s" : ""}
					</Text>
				)}
				{hasElse && (
					<Box display="flex" gap="6" style={{ alignItems: "baseline" }}>
						<SectionLabel color="#b45309" bg="#fef3c7">ELSE</SectionLabel>
						<Text fontSize="xs" color="fg.tertiary">fallback defined</Text>
					</Box>
				)}
			</Box>
		</Box>
	);
}

// ─── LogicRulesManager ────────────────────────────────────────────────────────

function LogicRulesManager({
	initialRuleSets,
	fieldOptions,
	connectedTargetNodes,
	onApply,
}: {
	initialRuleSets: NodeConditionLogic[];
	fieldOptions: FieldOption[];
	connectedTargetNodes: any[];
	onApply: (ruleSets: NodeConditionLogic[]) => void;
}) {
	const [ruleSets, setRuleSets] = useState<NodeConditionLogic[]>(initialRuleSets);
	// null = all collapsed (view mode); string id = that rule set is open for editing
	const [editingId, setEditingId] = useState<string | null>(
		initialRuleSets.length === 0 ? null : null,
	);

	const addRuleSet = () => {
		const newSet = emptyRuleSet();
		setRuleSets((rs) => [...rs, newSet]);
		setEditingId(newSet.id);
	};
	const removeRuleSet = (id: string) => {
		setRuleSets((rs) => rs.filter((r) => r.id !== id));
		if (editingId === id) setEditingId(null);
	};
	const clearAll = () => {
		setRuleSets([]);
		setEditingId(null);
	};
	const updateRuleSet = (id: string, logic: NodeConditionLogic) =>
		setRuleSets((rs) => rs.map((r) => (r.id === id ? logic : r)));

	const handleApply = () => {
		setEditingId(null);
		onApply(ruleSets);
	};

	return (
		<Box display="flex" flexDirection="column" gap="16">
			{ruleSets.map((ruleSet, idx) =>
				editingId === ruleSet.id ? (
					<Box key={ruleSet.id}>
						{/* Editor header */}
						<Box display="flex" alignItems="center" justifyContent="space-between" mb="12">
							<Text fontSize="sm" fontWeight="600" color="fg.default">
								Rule {idx + 1}
							</Text>
							<button
								onClick={() => removeRuleSet(ruleSet.id)}
								style={{
									background: "none",
									border: "none",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									gap: 4,
									fontSize: "12px",
									color: "var(--ax-colors-fg-danger, #c0392b)",
									padding: "2px 4px",
								}}
							>
								<IconTrash size={13} /> Remove
							</button>
						</Box>
						<SingleRuleSet
							logic={ruleSet}
							fieldOptions={fieldOptions}
							connectedTargetNodes={connectedTargetNodes}
							onChange={(updated) => updateRuleSet(ruleSet.id, updated)}
						/>
					</Box>
				) : (
					<RuleSetSummary
						key={ruleSet.id}
						logic={ruleSet}
						index={idx}
						fieldOptions={fieldOptions}
						connectedTargetNodes={connectedTargetNodes}
						onEdit={() => setEditingId(ruleSet.id)}
						onRemove={() => removeRuleSet(ruleSet.id)}
						onHighlightNodes={() => {}}
						onClearHighlight={() => {}}
					/>
				),
			)}

			{/* Bottom actions */}
			<Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
				<button style={addBtn} onClick={addRuleSet}>
					<IconPlus size={12} /> Add Rule
				</button>
				{ruleSets.length > 0 && (
					<button
						onClick={clearAll}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							fontSize: "12px",
							color: "var(--ax-colors-fg-secondary)",
						}}
					>
						Clear All
					</button>
				)}
			</Box>

			{/* Apply — only when something is being edited or there are unsaved sets */}
			{(editingId !== null || ruleSets.length > 0) && (
				<Button
					appearance="primary"
					onClick={handleApply}
					style={{ width: "100%" }}
				>
					Apply Logic
				</Button>
			)}
		</Box>
	);
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function FieldDetailsPanel({
	node,
	onClose,
	outgoingConnections,
	onApplyLogic,
	onHighlightNodes,
	onClearHighlight,
}: {
	node: any;
	onClose: () => void;
	outgoingConnections: Array<{ edgeId: string; targetNode: any }>;
	onApplyLogic: (ruleSets: NodeConditionLogic[]) => void;
	onHighlightNodes?: (ids: string[]) => void;
	onClearHighlight?: () => void;
}) {
	const d = node.data as any;
	const fieldDef = WORK_REQUEST_FIELDS.find((f) => f.id === d.fieldDefId);
	const fieldOptions: FieldOption[] = fieldDef?.options ?? [];
	const connectedTargetNodes = outgoingConnections.map((c) => c.targetNode);
	const initialRuleSets: NodeConditionLogic[] = d.ruleSets ?? [];

	return (
		<DetailsPanel>
			<DetailsPanelHeader>
				<Box display="flex" alignItems="center" justifyContent="space-between" w="full">
					<Box display="flex" alignItems="center" gap="8">
						{d.icon && (
							<Box
								p="6"
								rounded="sm"
								bg="bg.accent.subtle"
								color="fg.default"
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								{d.icon}
							</Box>
						)}
						<Box>
							<Text fontWeight="600" color="fg.default" style={{ display: "block" }}>
								{d.label}
							</Text>
							{d.typeLabel && (
								<Text fontSize="xs" color="fg.tertiary">{d.typeLabel}</Text>
							)}
						</Box>
					</Box>
					<Button
						appearance="subtle"
						icon={<IconX size={16} />}
						onClick={onClose}
						aria-label="Close panel"
					/>
				</Box>
			</DetailsPanelHeader>

			<DetailsPanelBody>
				<Box display="flex" flexDirection="column" gap="24" p="16">

					{/* Description */}
					{fieldDef?.description && (
						<Box>
							<Text fontSize="sm" fontWeight="500" color="fg.default" mb="4" style={{ display: "block" }}>
								Description
							</Text>
							<Text fontSize="sm" color="fg.secondary">{fieldDef.description}</Text>
						</Box>
					)}

					{/* Type */}
					{d.typeLabel && (
						<Box>
							<Text fontSize="sm" fontWeight="500" color="fg.default" mb="8" style={{ display: "block" }}>
								Field Type
							</Text>
							<Badge intent="neutral">{d.typeLabel}</Badge>
						</Box>
					)}

					{/* Required */}
					{fieldDef && (
						<Box display="flex" alignItems="center" justifyContent="space-between">
							<Box>
								<Text fontSize="sm" fontWeight="500" color="fg.default" style={{ display: "block" }}>
									Required
								</Text>
								<Text fontSize="xs" color="fg.tertiary">
									Users must fill this field to submit
								</Text>
							</Box>
							<Switch checked={d.required ?? fieldDef?.required ?? false} onCheckedChange={() => {}} />
						</Box>
					)}

					{/* Placeholder */}
					{fieldDef?.placeholder && (
						<Box>
							<Text fontSize="sm" fontWeight="500" color="fg.default" mb="4" style={{ display: "block" }}>
								Placeholder Text
							</Text>
							<Text fontSize="sm" color="fg.tertiary" style={{ fontStyle: "italic" }}>
								{fieldDef.placeholder}
							</Text>
						</Box>
					)}

					{/* Options */}
					{fieldDef?.options && fieldDef.options.length > 0 && (
						<Box>
							<Text fontSize="sm" fontWeight="500" color="fg.default" mb="8" style={{ display: "block" }}>
								Options
							</Text>
							<Box display="flex" flexDirection="column" gap="4">
								{fieldDef.options.map((opt) => (
									<Box
										key={opt.value}
										px="10"
										py="6"
										rounded="sm"
										bg="bg.secondary"
										style={{ border: "1px solid var(--ax-colors-border-tertiary)" }}
									>
										<Text fontSize="sm" color="fg.default">{opt.label}</Text>
									</Box>
								))}
							</Box>
						</Box>
					)}

					{/* Divider */}
					<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)", margin: "0 -16px" }} />

					{/* Logic Rules */}
					<Box>
						<Text fontSize="sm" fontWeight="600" color="fg.default" mb="16" style={{ display: "block" }}>
							Logic Rules
						</Text>
						{connectedTargetNodes.length === 0 ? (
							<Text fontSize="sm" color="fg.tertiary">
								Connect this node to others on the canvas first, then configure logic rules here.
							</Text>
						) : (
							<LogicRulesManager
								key={node.id}
								initialRuleSets={initialRuleSets}
								fieldOptions={fieldOptions}
								connectedTargetNodes={connectedTargetNodes}
								onApply={onApplyLogic}
							/>
						)}
					</Box>
				</Box>
			</DetailsPanelBody>
		</DetailsPanel>
	);
}

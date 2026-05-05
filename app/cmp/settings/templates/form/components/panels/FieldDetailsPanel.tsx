"use client";

import { useState } from "react";
import { Box, Switch } from "@optiaxiom/react";
import {
	DetailsPanel,
	DetailsPanelBody,
	DetailsPanelHeader,
} from "@optiaxiom/react/unstable";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { IconX, IconPlus, IconTrash } from "@tabler/icons-react";
import { STANDARD_FIELDS } from "../../data";
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
	allFields,
	onChange,
	onRemove,
}: {
	clause: ConditionClause;
	isFirst: boolean;
	fieldOptions: FieldOption[];
	allFields: import("../../types").FormFieldDef[];
	onChange: (patch: Partial<ConditionClause>) => void;
	onRemove: () => void;
}) {
	const selectedField = allFields.find((f) => f.id === clause.fieldId);
	const dynamicOptions = selectedField?.options ?? (clause.fieldId ? [] : fieldOptions);
	const op = OPERATORS.find((o) => o.value === clause.operator);

	return (
		<Box>
			{!isFirst && (
				<Box display="flex" gap="4" mb="6">
					<button
						style={chipBtn(clause.chain === "AND")}
						onClick={() => onChange({ chain: "AND" })}
					>
						AND
					</button>
					<button
						style={chipBtn(clause.chain === "OR")}
						onClick={() => onChange({ chain: "OR" })}
					>
						OR
					</button>
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
				<Box display="flex" alignItems="center" gap="6" style={{ flexWrap: "wrap" }}>
					{isFirst ? (
						<>
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
						</>
					) : (
						<>
							<Text fontSize="xs" color="fg.tertiary" style={{ whiteSpace: "nowrap" }}>
								If
							</Text>
							<select
								value={clause.fieldId ?? ""}
								onChange={(e) => onChange({ fieldId: e.target.value, value: "" })}
								style={{ ...sx, flex: 1, minWidth: 0 }}
							>
								<option value="">Select field…</option>
								{allFields.map((f) => (
									<option key={f.id} value={f.id}>{f.name}</option>
								))}
							</select>
							<select
								value={clause.operator}
								onChange={(e) => onChange({ operator: e.target.value, value: "" })}
								style={{ ...sx, flex: 1, minWidth: 0 }}
							>
								{OPERATORS.map((o) => (
									<option key={o.value} value={o.value}>{o.label}</option>
								))}
							</select>
						</>
					)}
				</Box>
				{op?.hasValue && (
					dynamicOptions.length > 0 ? (
						<select
							value={clause.value}
							onChange={(e) => onChange({ value: e.target.value })}
							style={sx}
						>
							<option value="">Select value…</option>
							{dynamicOptions.map((opt) => (
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
	allFields,
	onChange,
}: {
	clauses: ConditionClause[];
	fieldOptions: FieldOption[];
	allFields: import("../../types").FormFieldDef[];
	onChange: (clauses: ConditionClause[]) => void;
}) {
	const update = (id: string, patch: Partial<ConditionClause>) =>
		onChange(clauses.map((c) => (c.id === id ? { ...c, ...patch } : c)));
	const remove = (id: string) => onChange(clauses.filter((c) => c.id !== id));
	const add = (chain: "AND" | "OR") =>
		onChange([...clauses, { id: `c${Date.now()}`, operator: "equal", value: "", chain }]);

	return (
		<Box display="flex" flexDirection="column" gap="6">
			{clauses.map((clause, idx) => (
				<ClauseRow
					key={clause.id}
					clause={clause}
					isFirst={idx === 0}
					fieldOptions={fieldOptions}
					allFields={allFields}
					onChange={(patch) => update(clause.id, patch)}
					onRemove={() => remove(clause.id)}
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
	allFields,
	connectedTargetNodes,
	onChange,
}: {
	logic: NodeConditionLogic;
	fieldOptions: FieldOption[];
	allFields: import("../../types").FormFieldDef[];
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
					allFields={allFields}
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
						allFields={allFields}
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
	isActive,
	onRemove,
	onClick,
}: {
	logic: NodeConditionLogic;
	index: number;
	fieldOptions: FieldOption[];
	connectedTargetNodes: any[];
	isActive: boolean;
	onRemove?: () => void;
	onClick: () => void;
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

	const actionsSummary = (actions: ActionRow[]) =>
		actions
			.filter((a) => a.type)
			.map((a) => `${actionLabel(a.type)}${a.targetId ? ` → ${targetLabel(a.targetId)}` : ""}`)
			.join(", ");

	const thenSummary = actionsSummary(logic.thenActions);
	const elseSummary = logic.elseActions ? actionsSummary(logic.elseActions) : null;
	const hasElseIf = logic.elseIfs.length > 0;

	return (
		<Box
			rounded="sm"
			style={{
				border: isActive
					? "1.5px solid var(--ax-colors-border-accent)"
					: "1px solid var(--ax-colors-border-default)",
				overflow: "hidden",
				cursor: "pointer",
				boxShadow: isActive ? "0 0 0 3px var(--ax-colors-bg-accent-subtle)" : undefined,
				transition: "box-shadow 0.15s ease, border-color 0.15s ease",
			}}
			onClick={onClick}
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
				{onRemove && (
					<button
						onClick={(e) => { e.stopPropagation(); onRemove(); }}
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
				)}
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

				{/* ELSE IF summaries */}
				{hasElseIf && logic.elseIfs.map((ei, i) => {
					const eiClause = ei.clauses.map((c, j) => {
						const op = opLabel(c.operator);
						const val = c.value ? ` "${valLabel(c.value)}"` : "";
						const chain = j > 0 ? `${c.chain} ` : "";
						return `${chain}${op}${val}`;
					}).join(" ");
					const eiThen = actionsSummary(ei.actions);
					return (
						<Box key={ei.id} display="flex" flexDirection="column" gap="4">
							<Box display="flex" gap="6" style={{ flexWrap: "wrap" as const, alignItems: "baseline" }}>
								<SectionLabel color="var(--ax-colors-fg-accent)" bg="var(--ax-colors-bg-accent-subtle)">
									ELSE IF
								</SectionLabel>
								<Text fontSize="xs" color="fg.default" style={{ flex: 1 }}>{eiClause || "—"}</Text>
							</Box>
							{eiThen && (
								<Box display="flex" gap="6" style={{ flexWrap: "wrap" as const, alignItems: "baseline" }}>
									<SectionLabel color="#1a7a4a" bg="#e8f7ef">THEN</SectionLabel>
									<Text fontSize="xs" color="fg.default" style={{ flex: 1 }}>{eiThen}</Text>
								</Box>
							)}
						</Box>
					);
				})}

				{/* ELSE */}
				{elseSummary && (
					<Box display="flex" gap="6" style={{ flexWrap: "wrap" as const, alignItems: "baseline" }}>
						<SectionLabel color="#b45309" bg="#fef3c7">ELSE</SectionLabel>
						<Text fontSize="xs" color="fg.default" style={{ flex: 1 }}>{elseSummary}</Text>
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
	allFields,
	connectedTargetNodes,
	isEditMode,
	onApply,
	onEnterEdit,
	onExitEdit,
	onHighlightRule,
	onClearHighlight,
}: {
	initialRuleSets: NodeConditionLogic[];
	fieldOptions: FieldOption[];
	allFields: import("../../types").FormFieldDef[];
	connectedTargetNodes: any[];
	isEditMode: boolean;
	onApply: (ruleSets: NodeConditionLogic[]) => void;
	onEnterEdit: () => void;
	onExitEdit: () => void;
	onHighlightRule?: (targets: Array<{ nodeId: string; actionLabel: string }>) => void;
	onClearHighlight?: () => void;
}) {
	const [ruleSets, setRuleSets] = useState<NodeConditionLogic[]>(initialRuleSets);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [activeRuleId, setActiveRuleId] = useState<string | null>(null);

	const addRuleSet = () => {
		const newSet = emptyRuleSet();
		setRuleSets((rs) => [...rs, newSet]);
		setEditingId(newSet.id);
		setActiveRuleId(null);
		onClearHighlight?.();
		onEnterEdit();
	};
	const removeRuleSet = (id: string) => {
		const next = ruleSets.filter((r) => r.id !== id);
		setRuleSets(next);
		if (editingId === id) setEditingId(null);
		if (activeRuleId === id) { setActiveRuleId(null); onClearHighlight?.(); }
		onApply(next);
	};
	const clearAll = () => {
		setRuleSets([]);
		setEditingId(null);
		setActiveRuleId(null);
		onClearHighlight?.();
		onApply([]);
	};
	const updateRuleSet = (id: string, logic: NodeConditionLogic) =>
		setRuleSets((rs) => rs.map((r) => (r.id === id ? logic : r)));

	const handleApply = () => {
		setEditingId(null);
		onApply(ruleSets);
		onExitEdit();
	};

	const handleCardClick = (ruleSet: NodeConditionLogic) => {
		// View mode only: toggle canvas highlight
		if (activeRuleId === ruleSet.id) {
			setActiveRuleId(null);
			onClearHighlight?.();
			return;
		}
		setActiveRuleId(ruleSet.id);

		const targets: Array<{ nodeId: string; actionLabel: string }> = [];
		const actionName = (type: string) => ACTIONS.find((a) => a.value === type)?.label ?? type;

		for (const a of ruleSet.thenActions) {
			if (!a.targetId.startsWith("node:")) continue;
			targets.push({ nodeId: a.targetId.replace("node:", ""), actionLabel: actionName(a.type) });
		}
		for (const ei of ruleSet.elseIfs) {
			for (const a of ei.actions) {
				if (!a.targetId.startsWith("node:")) continue;
				targets.push({ nodeId: a.targetId.replace("node:", ""), actionLabel: actionName(a.type) });
			}
		}
		for (const a of (ruleSet.elseActions ?? [])) {
			if (!a.targetId.startsWith("node:")) continue;
			targets.push({ nodeId: a.targetId.replace("node:", ""), actionLabel: actionName(a.type) });
		}

		if (targets.length > 0) onHighlightRule?.(targets);
		else onClearHighlight?.();
	};

	return (
		<Box display="flex" flexDirection="column" gap="16">
			{/* Rule cards — expanded in edit mode, summary cards in view mode */}
			{ruleSets.map((ruleSet, idx) =>
				isEditMode ? (
					<Box key={ruleSet.id} display="flex" flexDirection="column" gap="12">
						<Box display="flex" alignItems="center" justifyContent="space-between">
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
							allFields={allFields}
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
						isActive={activeRuleId === ruleSet.id}
						onRemove={undefined}
						onClick={() => handleCardClick(ruleSet)}
					/>
				),
			)}

			{/* Edit-mode controls only */}
			{isEditMode ? (
				<>
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
					{ruleSets.length > 0 && (() => {
						const first = ruleSets[0];
						const firstClause = first.ifClauses[0];
						const op = OPERATORS.find((o) => o.value === firstClause?.operator);
						const clauseOk = firstClause && (!op?.hasValue || (firstClause.value ?? "").trim() !== "");
						const firstAction = first.thenActions[0];
						const actionOk = firstAction && firstAction.type !== "" && firstAction.targetId !== "";
						const disabled = !clauseOk || !actionOk;
						return (
							<Button
								appearance="primary"
								onClick={handleApply}
								disabled={disabled}
								style={{ width: "100%", justifyContent: "center" }}
							>
								Apply Logic
							</Button>
						);
					})()}
				</>
			) : (
				/* View mode: only show Add Rule when no rules exist yet */
				ruleSets.length === 0 && (
					<button style={addBtn} onClick={addRuleSet}>
						<IconPlus size={12} /> Add Rule
					</button>
				)
			)}
		</Box>
	);
}

// ─── FieldPreview ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
	width: "100%",
	border: "1px solid var(--ax-colors-border-default)",
	borderRadius: "6px",
	padding: "7px 10px",
	fontSize: "14px",
	color: "var(--ax-colors-fg-default)",
	background: "var(--ax-colors-bg-default)",
	outline: "none",
	boxSizing: "border-box",
};

const uploadBox: React.CSSProperties = {
	border: "1px dashed var(--ax-colors-border-default)",
	borderRadius: "6px",
	padding: "16px",
	textAlign: "center",
	color: "var(--ax-colors-fg-tertiary)",
	fontSize: "13px",
};

function FieldPreview({ fieldDef, label, required, fallbackTypeLabel }: { fieldDef: any; label: string; required: boolean; fallbackTypeLabel?: string }) {
	const type = fieldDef?.typeLabel ?? fallbackTypeLabel ?? "";
	const options: { value: string; label: string }[] = fieldDef?.options ?? [];
	const helperText = fieldDef?.description ?? "";
	const isMultiSelect = fieldDef?.isMultiSelect ?? false;

	const optionFallback = [{ value: "option", label: "Option" }];
	const displayOptions = options.length > 0 ? options : optionFallback;

	return (
		<Box display="flex" flexDirection="column" gap="6">
			{/* Label */}
			<Text fontSize="sm" fontWeight="500" color="fg.default" style={{ display: "block" }}>
				{label}
				{required && (
					<span style={{ color: "var(--ax-colors-fg-danger, #e53e3e)", marginLeft: "2px" }}>*</span>
				)}
			</Text>

			{/* Text / URL / Number / Label */}
			{(type === "Text" || type === "URL" || type === "Number") && (
				<input style={inputStyle} type={type === "Number" ? "number" : type === "URL" ? "url" : "text"} placeholder={fieldDef?.placeholder ?? ""} readOnly />
			)}
			{type === "Label" && (
				<Text fontSize="sm" color="fg.secondary" style={{ display: "block" }}>Label text</Text>
			)}

			{/* Long text / Text Area / Rich Text */}
			{(type === "Long Text" || type === "Text Area" || type === "Rich Text") && (
				<textarea style={{ ...inputStyle, minHeight: "80px", resize: "none" }} placeholder={fieldDef?.placeholder ?? ""} readOnly />
			)}

			{/* Dropdown */}
			{type === "Dropdown" && (
				<>
					{isMultiSelect && options.length > 0 && (
						<Text fontSize="xs" color="fg.tertiary" style={{ display: "block" }}>Multi-select</Text>
					)}
					<select style={inputStyle} disabled>
						<option value="">{fieldDef?.placeholder ?? "Select an option"}</option>
						{options.map((o) => (
							<option key={o.value} value={o.value}>{o.label}</option>
						))}
					</select>
				</>
			)}

			{/* Checkbox */}
			{type === "Checkbox" && (
				<Box display="flex" flexDirection="column" gap="8">
					{displayOptions.map((o) => (
						<label key={o.value} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "default", color: "var(--ax-colors-fg-default)" }}>
							<input type="checkbox" disabled style={{ width: "16px", height: "16px", flexShrink: 0 }} />
							{o.label}
						</label>
					))}
				</Box>
			)}

			{/* Radio Button */}
			{type === "Radio Button" && (
				<Box display="flex" flexDirection="column" gap="8">
					{displayOptions.map((o) => (
						<label key={o.value} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "default", color: "var(--ax-colors-fg-default)" }}>
							<input type="radio" disabled style={{ width: "16px", height: "16px", flexShrink: 0 }} />
							{o.label}
						</label>
					))}
				</Box>
			)}

			{/* Date */}
			{type === "Date" && (
				<input style={inputStyle} type="date" readOnly />
			)}

			{/* File upload / Image / Video */}
			{(type === "File Upload" || type === "Image" || type === "Video") && (
				<Box style={uploadBox}>
					{type === "Video" ? "Click to upload video" : type === "Image" ? "Click to upload image" : "Click to upload or drag and drop"}
				</Box>
			)}

			{/* Toggle */}
			{type === "Toggle" && (
				<label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "default" }}>
					<input type="checkbox" disabled style={{ width: "16px", height: "16px" }} />
					<span style={{ color: "var(--ax-colors-fg-secondary)" }}>Off</span>
				</label>
			)}

			{/* Helper text */}
			{helperText && (
				<Text fontSize="xs" color="fg.tertiary" style={{ display: "block" }}>
					{helperText}
				</Text>
			)}
		</Box>
	);
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function FieldDetailsPanel({
	node,
	onClose,
	allCanvasNodes,
	onApplyLogic,
	onHighlightNodes,
	onClearHighlight,
	customFields = [],
}: {
	node: any;
	onClose: () => void;
	allCanvasNodes: any[];
	onApplyLogic: (ruleSets: NodeConditionLogic[]) => void;
	onHighlightNodes?: (targets: Array<{ nodeId: string; actionLabel: string }>) => void;
	onClearHighlight?: () => void;
	customFields?: import("../../types").FormFieldDef[];
}) {
	const [isLogicEditMode, setIsLogicEditMode] = useState(false);
	const d = node.data as any;
	const [isRequired, setIsRequired] = useState<boolean>(d.required ?? false);
	const allFields = [...STANDARD_FIELDS, ...customFields];
	const fieldDef = allFields.find((f) => f.id === d.fieldDefId);
	const fieldOptions: FieldOption[] = fieldDef?.options ?? [];
	const connectedTargetNodes = allCanvasNodes;
	const initialRuleSets: NodeConditionLogic[] = d.ruleSets ?? [];
	const OPTION_BASED_TYPES = ["Dropdown", "Checkbox", "Radio Button"];

	return (
		<DetailsPanel style={{ borderRadius: 0 }}>
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

					{/* Field preview */}
					<FieldPreview fieldDef={fieldDef} label={d.label} required={isRequired} fallbackTypeLabel={d.typeLabel} />

					{/* Divider */}
					<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)", margin: "0 -16px" }} />

					{/* Required */}
					{fieldDef && (
						<Box display="flex" alignItems="center" justifyContent="space-between">
							<Text fontSize="sm" fontWeight="500" color="fg.default">
								Required
							</Text>
							<Switch checked={isRequired} onCheckedChange={setIsRequired} />
						</Box>
					)}

					{/* Divider + Logic Rules — for option-based fields */}
					{OPTION_BASED_TYPES.includes(d.typeLabel) && <>
					<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)", margin: "0 -16px" }} />

					{/* Logic Rules */}
					<Box>
						<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
							<Text fontSize="sm" fontWeight="600" color="fg.default">
								Logic Rules
							</Text>
							{!isLogicEditMode && initialRuleSets.length > 0 && (
								<button
									onClick={() => setIsLogicEditMode(true)}
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
							)}
						</Box>
						<LogicRulesManager
							key={node.id}
							initialRuleSets={initialRuleSets}
							fieldOptions={fieldOptions}
							allFields={allFields}
							connectedTargetNodes={connectedTargetNodes}
							isEditMode={isLogicEditMode}
							onApply={onApplyLogic}
							onEnterEdit={() => setIsLogicEditMode(true)}
							onExitEdit={() => setIsLogicEditMode(false)}
							onHighlightRule={onHighlightNodes}
							onClearHighlight={onClearHighlight}
						/>
					</Box>
					</>}
				</Box>
			</DetailsPanelBody>
		</DetailsPanel>
	);
}

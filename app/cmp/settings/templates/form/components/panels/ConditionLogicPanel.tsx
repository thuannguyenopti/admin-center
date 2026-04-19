"use client";

import { useState } from "react";
import { Box } from "@optiaxiom/react";
import {
	DetailsPanel,
	DetailsPanelBody,
	DetailsPanelHeader,
} from "@optiaxiom/react/unstable";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { IconGitBranch, IconX, IconPlus } from "@tabler/icons-react";
import type { ConditionClause, ActionRow, ElseIfBlock, FieldOption } from "../../types";

// ─── Styles ───────────────────────────────────────────────────────────────────

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

// ─── Data ─────────────────────────────────────────────────────────────────────

export const OPERATORS = [
	{ value: "equal",      label: "Equal to",      hasValue: true  },
	{ value: "not_equal",  label: "Not equal to",  hasValue: true  },
	{ value: "any_of",     label: "Any of",         hasValue: true  },
	{ value: "not_any_of", label: "Not any of",    hasValue: true  },
	{ value: "contains",   label: "Contains",       hasValue: true  },
	{ value: "not_contains", label: "Does not contain", hasValue: true },
	{ value: "empty",      label: "Empty",          hasValue: false },
	{ value: "filled",     label: "Filled",         hasValue: false },
	{ value: "greater_than", label: "Greater than", hasValue: true  },
	{ value: "less_than",  label: "Less than",      hasValue: true  },
];

export const ACTIONS = [
	{ value: "jump_to",     label: "Jump to"       },
	{ value: "show",        label: "Show / Display" },
	{ value: "hide",        label: "Hide"           },
	{ value: "show_values", label: "Show values"   },
	{ value: "hide_values", label: "Hide values"   },
	{ value: "require",     label: "Require"        },
	{ value: "set_value",   label: "Set value"      },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const emptyClause = (): ConditionClause => ({
	id: `c${Date.now()}`,
	operator: "equal",
	value: "",
	chain: "AND",
});

const emptyAction = (): ActionRow => ({
	id: `a${Date.now()}`,
	type: "",
	targetId: "",
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({
	children,
	color,
	bg,
}: {
	children: string;
	color: string;
	bg: string;
}) {
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
					<button style={chipBtn()} onClick={onToggleChain}>
						{clause.chain}
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
							<option key={o.value} value={o.value}>
								{o.label}
							</option>
						))}
					</select>
				</Box>
				{op?.hasValue &&
					(fieldOptions.length > 0 ? (
						<select
							value={clause.value}
							onChange={(e) => onChange({ value: e.target.value })}
							style={sx}
						>
							<option value="">Select value…</option>
							{fieldOptions.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					) : (
						<input
							value={clause.value}
							onChange={(e) => onChange({ value: e.target.value })}
							placeholder="Enter value…"
							style={sx}
						/>
					))}
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
	const targets: { value: string; label: string }[] = [
		...connectedTargetNodes.map((n) => ({
			value: `node:${n.id}`,
			label: `${n.type === "formSection" ? "Section" : "Field"}: ${(n.data as any).label}`,
		})),
		{ value: "end_of_form", label: "End of form" },
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
					<option key={a.value} value={a.value}>
						{a.label}
					</option>
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
						<option key={t.value} value={t.value}>
							{t.label}
						</option>
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

function ClauseGroup({
	clauses,
	fieldOptions,
	onUpdate,
}: {
	clauses: ConditionClause[];
	fieldOptions: FieldOption[];
	onUpdate: (clauses: ConditionClause[]) => void;
}) {
	const update = (id: string, patch: Partial<ConditionClause>) =>
		onUpdate(clauses.map((c) => (c.id === id ? { ...c, ...patch } : c)));
	const remove = (id: string) => onUpdate(clauses.filter((c) => c.id !== id));
	const add = (chain: "AND" | "OR") =>
		onUpdate([
			...clauses,
			{ id: `c${Date.now()}`, operator: "equal", value: "", chain },
		]);
	const toggleChain = (id: string) =>
		update(id, {
			chain: clauses.find((c) => c.id === id)?.chain === "AND" ? "OR" : "AND",
		});

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

function ActionGroup({
	actions,
	onUpdate,
	connectedTargetNodes,
}: {
	actions: ActionRow[];
	onUpdate: (actions: ActionRow[]) => void;
	connectedTargetNodes: any[];
}) {
	const update = (id: string, patch: Partial<ActionRow>) =>
		onUpdate(actions.map((a) => (a.id === id ? { ...a, ...patch } : a)));
	const remove = (id: string) => onUpdate(actions.filter((a) => a.id !== id));
	const add = () =>
		onUpdate([...actions, { id: `a${Date.now()}`, type: "", targetId: "" }]);

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

// ─── Main panel ───────────────────────────────────────────────────────────────

export function ConditionLogicPanel({
	node,
	onClose,
	onUpdate,
	connectedFieldOptions,
	connectedTargetNodes,
}: {
	node: any;
	onClose: () => void;
	onUpdate: (id: string, data: any) => void;
	connectedFieldOptions: FieldOption[];
	connectedTargetNodes: any[];
}) {
	const d = node.data as any;

	const [ifClauses, setIfClauses] = useState<ConditionClause[]>(
		d.ifClauses?.length ? d.ifClauses : [emptyClause()],
	);
	const [thenActions, setThenActions] = useState<ActionRow[]>(
		d.thenActions?.length ? d.thenActions : [emptyAction()],
	);
	const [elseIfs, setElseIfs] = useState<ElseIfBlock[]>(d.elseIfs ?? []);
	const [elseActions, setElseActions] = useState<ActionRow[] | null>(
		d.elseActions ?? null,
	);

	const addElseIf = () =>
		setElseIfs((ei) => [
			...ei,
			{ id: `ei${Date.now()}`, clauses: [emptyClause()], actions: [emptyAction()] },
		]);
	const removeElseIf = (id: string) =>
		setElseIfs((ei) => ei.filter((e) => e.id !== id));
	const updateElseIf = (id: string, patch: Partial<ElseIfBlock>) =>
		setElseIfs((ei) => ei.map((e) => (e.id === id ? { ...e, ...patch } : e)));

	const apply = () => {
		onUpdate(node.id, { ifClauses, thenActions, elseIfs, elseActions });
	};

	const divider = (
		<Box
			style={{
				height: 1,
				background: "var(--ax-colors-border-tertiary)",
				margin: "4px 0",
			}}
		/>
	);

	return (
		<DetailsPanel>
			<DetailsPanelHeader>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					w="full"
				>
					<Box display="flex" alignItems="center" gap="8">
						<Box
							p="6"
							rounded="full"
							bg="bg.accent.subtle"
							color="fg.accent"
							display="flex"
							alignItems="center"
							justifyContent="center"
						>
							<IconGitBranch size={14} />
						</Box>
						<Text fontWeight="600" color="fg.default">
							Condition Logic
						</Text>
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
				<Box display="flex" flexDirection="column" gap="16" p="16">

					{/* ── IF ── */}
					<Box>
						<Box mb="8">
							<SectionLabel
								color="var(--ax-colors-fg-accent)"
								bg="var(--ax-colors-bg-accent-subtle)"
							>
								IF
							</SectionLabel>
						</Box>
						<ClauseGroup
							clauses={ifClauses}
							fieldOptions={connectedFieldOptions}
							onUpdate={setIfClauses}
						/>
					</Box>

					{divider}

					{/* ── THEN ── */}
					<Box>
						<Box mb="8">
							<SectionLabel color="#1a7a4a" bg="#e8f7ef">
								THEN
							</SectionLabel>
						</Box>
						<ActionGroup
							actions={thenActions}
							onUpdate={setThenActions}
							connectedTargetNodes={connectedTargetNodes}
						/>
					</Box>

					{/* ── ELSE IF blocks ── */}
					{elseIfs.map((ei) => (
						<Box key={ei.id}>
							{divider}
							<Box
								display="flex"
								alignItems="center"
								justifyContent="space-between"
								mb="8"
							>
								<SectionLabel
									color="var(--ax-colors-fg-accent)"
									bg="var(--ax-colors-bg-accent-subtle)"
								>
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
								fieldOptions={connectedFieldOptions}
								onUpdate={(clauses) => updateElseIf(ei.id, { clauses })}
							/>
							<Box mt="8">
								<Box mb="8">
									<SectionLabel color="#1a7a4a" bg="#e8f7ef">
										THEN
									</SectionLabel>
								</Box>
								<ActionGroup
									actions={ei.actions}
									onUpdate={(actions) => updateElseIf(ei.id, { actions })}
									connectedTargetNodes={connectedTargetNodes}
								/>
							</Box>
						</Box>
					))}

					{divider}

					{/* ── ELSE / Add buttons ── */}
					<Box>
						{elseActions === null ? (
							<Box display="flex" gap="8">
								<button style={addBtn} onClick={addElseIf}>
									<IconPlus size={12} /> ELSE IF
								</button>
								<button
									style={addBtn}
									onClick={() => setElseActions([emptyAction()])}
								>
									<IconPlus size={12} /> ELSE
								</button>
							</Box>
						) : (
							<Box>
								<Box
									display="flex"
									alignItems="center"
									justifyContent="space-between"
									mb="8"
								>
									<SectionLabel color="#b45309" bg="#fef3c7">
										ELSE
									</SectionLabel>
									<button
										onClick={() => setElseActions(null)}
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
									actions={elseActions}
									onUpdate={setElseActions}
									connectedTargetNodes={connectedTargetNodes}
								/>
								<Box mt="8">
									<button style={addBtn} onClick={addElseIf}>
										<IconPlus size={12} /> ELSE IF
									</button>
								</Box>
							</Box>
						)}
					</Box>

					<Button appearance="primary" onClick={apply} style={{ width: "100%" }}>
						Apply Logic
					</Button>
				</Box>
			</DetailsPanelBody>
		</DetailsPanel>
	);
}

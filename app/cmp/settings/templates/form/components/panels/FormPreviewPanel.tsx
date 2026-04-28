"use client";

import { useState, useMemo } from "react";
import { Box } from "@optiaxiom/react";
import {
	DetailsPanel,
	DetailsPanelBody,
	DetailsPanelHeader,
} from "@optiaxiom/react/unstable";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { IconX } from "@tabler/icons-react";
import type { Node } from "@xyflow/react";
import type { ConditionClause, ActionRow } from "../../types";
import type { NodeConditionLogic } from "./FieldDetailsPanel";
import { WORK_REQUEST_FIELDS } from "../../data";

// ─── Logic evaluation ─────────────────────────────────────────────────────────

function evalClause(clause: ConditionClause, value: string): boolean {
	switch (clause.operator) {
		case "equal":       return value === clause.value;
		case "not_equal":   return value !== clause.value;
		case "any_of":      return (clause.value ?? "").split(",").map((s) => s.trim()).includes(value);
		case "not_any_of":  return !(clause.value ?? "").split(",").map((s) => s.trim()).includes(value);
		case "empty":       return !value || value.trim() === "";
		case "filled":      return !!value && value.trim() !== "";
		case "contains":    return value.includes(clause.value ?? "");
		case "not_contains":return !value.includes(clause.value ?? "");
		default:            return false;
	}
}

function evalClauses(
	clauses: ConditionClause[],
	nodeId: string,
	values: Record<string, string>,
): boolean {
	if (clauses.length === 0) return false;
	const get = (c: ConditionClause, isFirst: boolean) =>
		!isFirst && c.fieldId ? (values[c.fieldId] ?? "") : (values[nodeId] ?? "");

	let result = evalClause(clauses[0], get(clauses[0], true));
	for (let i = 1; i < clauses.length; i++) {
		const c = clauses[i];
		const r = evalClause(c, get(c, false));
		result = c.chain === "AND" ? result && r : result || r;
	}
	return result;
}

function computeHidden(nodes: Node[], values: Record<string, string>): Set<string> {
	// "show" targets start hidden; "hide" targets start visible
	const showTargets = new Set<string>();
	for (const node of nodes) {
		for (const rule of (node.data as any).ruleSets as NodeConditionLogic[] ?? []) {
			const all: ActionRow[] = [
				...rule.thenActions,
				...rule.elseIfs.flatMap((ei) => ei.actions),
				...(rule.elseActions ?? []),
			];
			for (const a of all) {
				if (a.type === "show" && a.targetId.startsWith("node:"))
					showTargets.add(a.targetId.replace("node:", ""));
			}
		}
	}

	const hidden = new Set<string>(showTargets);

	for (const node of nodes) {
		for (const rule of (node.data as any).ruleSets as NodeConditionLogic[] ?? []) {
			const met = evalClauses(rule.ifClauses, node.id, values);
			let actions: ActionRow[] | undefined;
			if (met) {
				actions = rule.thenActions;
			} else {
				for (const ei of rule.elseIfs) {
					if (evalClauses(ei.clauses, node.id, values)) { actions = ei.actions; break; }
				}
				if (!actions && rule.elseActions) actions = rule.elseActions;
			}
			for (const a of actions ?? []) {
				if (!a.targetId.startsWith("node:")) continue;
				const id = a.targetId.replace("node:", "");
				if (a.type === "show") hidden.delete(id);
				if (a.type === "hide") hidden.add(id);
			}
		}
	}
	return hidden;
}

// ─── Shared input style ───────────────────────────────────────────────────────

const input: React.CSSProperties = {
	width: "100%",
	border: "1px solid var(--ax-colors-border-default)",
	borderRadius: "8px",
	padding: "8px 12px",
	fontSize: "14px",
	color: "var(--ax-colors-fg-default)",
	background: "var(--ax-colors-bg-default)",
	outline: "none",
	boxSizing: "border-box",
	fontFamily: "inherit",
};

// ─── Field renderer ───────────────────────────────────────────────────────────

function FieldRenderer({
	node,
	value,
	onChange,
}: {
	node: Node;
	value: string;
	onChange: (v: string) => void;
}) {
	const d = node.data as any;
	const fieldDef = WORK_REQUEST_FIELDS.find((f) => f.id === d.fieldDefId);
	const type = d.typeLabel ?? fieldDef?.typeLabel ?? "";
	const options = fieldDef?.options ?? [];
	const placeholder = fieldDef?.placeholder ?? "";
	const description = fieldDef?.description;

	return (
		<Box display="flex" flexDirection="column" gap="6">
			<Text fontSize="sm" fontWeight="500" color="fg.default">
				{d.label}
				{d.required && (
					<span style={{ color: "var(--ax-colors-fg-danger, #e53e3e)", marginLeft: 2 }}>*</span>
				)}
			</Text>

			{(type === "Text" || type === "Number" || type === "URL") && (
				<input
					style={input}
					type={type === "Number" ? "number" : type === "URL" ? "url" : "text"}
					placeholder={placeholder}
					value={value}
					onChange={(e) => onChange(e.target.value)}
				/>
			)}

			{type === "Long Text" && (
				<textarea
					style={{ ...input, minHeight: 96, resize: "vertical" }}
					placeholder={placeholder}
					value={value}
					onChange={(e) => onChange(e.target.value)}
				/>
			)}

			{type === "Dropdown" && (
				<select style={input} value={value} onChange={(e) => onChange(e.target.value)}>
					<option value="">{placeholder || "Select an option"}</option>
					{options.map((o: { value: string; label: string }) => (
						<option key={o.value} value={o.value}>{o.label}</option>
					))}
				</select>
			)}

			{type === "Checkbox" && (
				<Box display="flex" flexDirection="column" gap="8">
					{(options.length > 0 ? options : [{ value: "option", label: "Option" }]).map(
						(o: { value: string; label: string }) => (
							<label key={o.value} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", color: "var(--ax-colors-fg-default)" }}>
								<input
									type="checkbox"
									checked={value.split(",").includes(o.value)}
									onChange={(e) => {
										const current = value ? value.split(",") : [];
										const next = e.target.checked
											? [...current, o.value]
											: current.filter((v) => v !== o.value);
										onChange(next.join(","));
									}}
									style={{ width: 16, height: 16, flexShrink: 0 }}
								/>
								{o.label}
							</label>
						),
					)}
				</Box>
			)}

			{type === "Date" && (
				<Box style={{ position: "relative" }}>
					<input
						style={input}
						type="date"
						value={value}
						onChange={(e) => onChange(e.target.value)}
					/>
				</Box>
			)}

			{type === "File Upload" && (
				<Box
					style={{
						border: "1px dashed var(--ax-colors-border-default)",
						borderRadius: 8,
						padding: "20px 16px",
						textAlign: "center",
						color: "var(--ax-colors-fg-tertiary)",
						fontSize: 13,
						cursor: "pointer",
					}}
				>
					Click to upload or drag and drop
				</Box>
			)}

			{type === "Toggle" && (
				<label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
					<input
						type="checkbox"
						checked={value === "true"}
						onChange={(e) => onChange(e.target.checked ? "true" : "")}
						style={{ width: 16, height: 16 }}
					/>
					<span style={{ color: "var(--ax-colors-fg-secondary)" }}>
						{value === "true" ? "On" : "Off"}
					</span>
				</label>
			)}

			{description && (
				<Text fontSize="xs" color="fg.tertiary">{description}</Text>
			)}
		</Box>
	);
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function FormPreviewPanel({
	formTitle,
	nodes,
	onClose,
}: {
	formTitle: string;
	nodes: Node[];
	onClose: () => void;
}) {
	const [values, setValues] = useState<Record<string, string>>({});

	const hidden = useMemo(() => computeHidden(nodes, values), [nodes, values]);

	const set = (nodeId: string, val: string) =>
		setValues((prev) => ({ ...prev, [nodeId]: val }));

	// Build render list: top-level nodes sorted by y, sections interleaved with children
	const renderList = useMemo(() => {
		const sectionIds = new Set(
			nodes.filter((n) => n.type === "formSection").map((n) => n.id),
		);
		return nodes
			.filter((n) => !n.parentId || !sectionIds.has(n.parentId))
			.map((node) => ({
				node,
				children: node.type === "formSection"
					? nodes.filter((c) => c.parentId === node.id)
					: [],
			}));
	}, [nodes]);

	return (
		<DetailsPanel style={{ borderRadius: 0 }}>
			<DetailsPanelHeader>
				<Box display="flex" alignItems="center" justifyContent="space-between" w="full">
					<Text fontWeight="600" color="fg.default">Form Preview</Text>
					<Button
						appearance="subtle"
						icon={<IconX size={16} />}
						onClick={onClose}
						aria-label="Close preview"
					/>
				</Box>
			</DetailsPanelHeader>

			<DetailsPanelBody>
				<Box p="24" display="flex" flexDirection="column" gap="24">
					{/* Form title */}
					<Text fontSize="xl" fontWeight="700" color="fg.default">
						{formTitle}
					</Text>

					{renderList.map(({ node, children }) => {
						if (hidden.has(node.id)) return null;

						// Section
						if (node.type === "formSection") {
							const visibleChildren = children.filter((c) => !hidden.has(c.id) && c.type === "formField");
							return (
								<Box key={node.id} display="flex" flexDirection="column" gap="20">
									{/* Section divider */}
									<Box display="flex" alignItems="center" gap="12">
										<Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-default)" }} />
										<Text fontSize="sm" color="fg.secondary" style={{ whiteSpace: "nowrap" }}>
											{(node.data as any).label ?? "Section"}
										</Text>
										<Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-default)" }} />
									</Box>
									{/* Children with left accent border */}
									{visibleChildren.length > 0 && (
										<Box
											display="flex"
											flexDirection="column"
											gap="20"
										>
											{visibleChildren.map((child) => (
												<FieldRenderer
													key={child.id}
													node={child}
													value={values[child.id] ?? ""}
													onChange={(v) => set(child.id, v)}
												/>
											))}
										</Box>
									)}
								</Box>
							);
						}

						// Field
						if (node.type === "formField") {
							return (
								<FieldRenderer
									key={node.id}
									node={node}
									value={values[node.id] ?? ""}
									onChange={(v) => set(node.id, v)}
								/>
							);
						}

						return null;
					})}
				</Box>
			</DetailsPanelBody>
		</DetailsPanel>
	);
}

"use client";

import React, {useState} from "react";
import {Box, Text, Button, Badge} from "@optiaxiom/react";
import {
	IconXmark,
	IconPlus,
	IconTrashCan,
	IconPen,
	IconCircleCheckSolid,
} from "@optimizely/axiom-icons";
import {type DSRule} from "../useStrideDSState";

const CATEGORY_LABELS: Record<DSRule["category"], string> = {
	naming: "Naming",
	spacing: "Spacing",
	color: "Color",
	accessibility: "Accessibility",
	components: "Components",
	custom: "Custom",
};

const CATEGORY_COLORS: Record<DSRule["category"], string> = {
	naming: "var(--ax-colors-bg-information-subtle)",
	spacing: "var(--ax-colors-bg-primary-subtle)",
	color: "var(--ax-colors-bg-warning-subtle)",
	accessibility: "var(--ax-colors-bg-success-subtle)",
	components: "var(--ax-colors-bg-accent-subtle)",
	custom: "var(--ax-colors-bg-tertiary)",
};

type Props = {
	open: boolean;
	rules: DSRule[];
	onClose: () => void;
	onSave: (rules: DSRule[]) => void;
};

export function RulesPanel({open, rules, onClose, onSave}: Props) {
	const [editing, setEditing] = useState<DSRule[]>(rules);
	const [addingCategory, setAddingCategory] = useState<DSRule["category"]>("custom");
	const [addingLabel, setAddingLabel] = useState("");
	const [addingValue, setAddingValue] = useState("");
	const [showAddForm, setShowAddForm] = useState(false);

	const handleDelete = (id: string) => {
		setEditing((prev: DSRule[]) => prev.filter((r: DSRule) => r.id !== id));
	};

	const handleEdit = (id: string, field: "label" | "value", value: string) => {
		setEditing((prev: DSRule[]) =>
			prev.map((r: DSRule) => (r.id === id ? {...r, [field]: value} : r))
		);
	};

	const handleAdd = () => {
		if (!addingLabel.trim() || !addingValue.trim()) return;
		const newRule: DSRule = {
			id: `r-${Date.now()}`,
			category: addingCategory,
			label: addingLabel.trim(),
			value: addingValue.trim(),
		};
		setEditing((prev: DSRule[]) => [...prev, newRule]);
		setAddingLabel("");
		setAddingValue("");
		setShowAddForm(false);
	};

	const handleSave = () => {
		onSave(editing);
		onClose();
	};

	if (!open) return null;

	return (
		<>
			{/* Backdrop */}
			<Box
				onClick={onClose}
				style={{
					position: "fixed",
					inset: 0,
					background: "rgba(0,0,0,0.3)",
					zIndex: 100,
				}}
			/>

			{/* Drawer */}
			<Box
				style={{
					position: "fixed",
					right: 0,
					top: 0,
					bottom: 0,
					width: 420,
					background: "var(--ax-colors-bg-default)",
					borderLeft: "1px solid var(--ax-colors-border-default)",
					zIndex: 101,
					display: "flex",
					flexDirection: "column",
					boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
				}}
			>
				{/* Header */}
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					px="16"
					style={{
						height: 56,
						borderBottom: "1px solid var(--ax-colors-border-default)",
						flexShrink: 0,
					}}
				>
					<Box>
						<Text fontSize="md" fontWeight="600">
							Design System Rules
						</Text>
						<Text fontSize="xs" color="fg.secondary">
							Opal follows these automatically
						</Text>
					</Box>
					<Button
						appearance="subtle"
						size="sm"
						icon={<IconXmark />}
						onClick={onClose}
						aria-label="Close design system rules"
					/>
				</Box>

				{/* Rules list */}
				<Box style={{flex: 1, overflowY: "auto", padding: "16px"}}>
					<Box display="flex" flexDirection="column" gap="8">
						{editing.map((rule) => (
							<Box
								key={rule.id}
								style={{
									background: "var(--ax-colors-bg-page)",
									border: "1px solid var(--ax-colors-border-default)",
									borderRadius: "8px",
									padding: "12px",
								}}
							>
								<Box
									display="flex"
									alignItems="start"
									justifyContent="space-between"
									gap="8"
									mb="6"
								>
									<Box display="flex" alignItems="center" gap="6">
										<Badge
											style={{
												background: CATEGORY_COLORS[rule.category],
												fontSize: "11px",
												padding: "1px 6px",
												borderRadius: "4px",
												color: "var(--ax-colors-fg-default)",
											}}
										>
											{CATEGORY_LABELS[rule.category]}
										</Badge>
										<IconCircleCheckSolid
											size={12}
											color="var(--ax-colors-fg-success)"
										/>
									</Box>
									<Button
										appearance="subtle"
										size="sm"
										icon={<IconTrashCan />}
										aria-label={`Delete ${rule.label || "rule"}`}
										onClick={() => handleDelete(rule.id)}
										style={{flexShrink: 0}}
									/>
								</Box>
								<input
									value={rule.label}
									onChange={(e) => handleEdit(rule.id, "label", e.target.value)}
									style={{
										width: "100%",
										border: "none",
										outline: "none",
										background: "transparent",
										fontFamily: "inherit",
										fontSize: "13px",
										fontWeight: "600",
										color: "var(--ax-colors-fg-default)",
										marginBottom: "4px",
									}}
								/>
								<textarea
									value={rule.value}
									onChange={(e) => handleEdit(rule.id, "value", e.target.value)}
									style={{
										width: "100%",
										border: "none",
										outline: "none",
										background: "transparent",
										fontFamily: "inherit",
										fontSize: "12px",
										color: "var(--ax-colors-fg-secondary)",
										resize: "none",
										lineHeight: 1.5,
									}}
									rows={2}
								/>
							</Box>
						))}
					</Box>

					{/* Add rule form */}
					{showAddForm ? (
						<Box
							style={{
								marginTop: 12,
								background: "var(--ax-colors-bg-accent-subtle)",
								border: "1px solid var(--ax-colors-border-accent)",
								borderRadius: "8px",
								padding: "12px",
							}}
						>
							<Text
								fontSize="xs"
								fontWeight="600"
								color="fg.secondary"
								style={{marginBottom: 8, display: "block"}}
							>
								New Rule
							</Text>
							<select
								value={addingCategory}
								onChange={(e) =>
									setAddingCategory(e.target.value as DSRule["category"])
								}
								style={{
									width: "100%",
									marginBottom: 8,
									padding: "6px 8px",
									border: "1px solid var(--ax-colors-border-default)",
									borderRadius: "6px",
									fontFamily: "inherit",
									fontSize: "13px",
									background: "var(--ax-colors-bg-default)",
									color: "var(--ax-colors-fg-default)",
								}}
							>
								{(Object.keys(CATEGORY_LABELS) as DSRule["category"][]).map((k) => (
									<option key={k} value={k}>
										{CATEGORY_LABELS[k]}
									</option>
								))}
							</select>
							<input
								placeholder="Rule label (e.g. Icon size)"
								value={addingLabel}
								onChange={(e) => setAddingLabel(e.target.value)}
								style={{
									width: "100%",
									marginBottom: 8,
									padding: "6px 8px",
									border: "1px solid var(--ax-colors-border-default)",
									borderRadius: "6px",
									fontFamily: "inherit",
									fontSize: "13px",
									background: "var(--ax-colors-bg-default)",
									color: "var(--ax-colors-fg-default)",
								}}
							/>
							<textarea
								placeholder="Rule value (e.g. Use 16px icons for inline, 24px for standalone)"
								value={addingValue}
								onChange={(e) => setAddingValue(e.target.value)}
								rows={2}
								style={{
									width: "100%",
									marginBottom: 8,
									padding: "6px 8px",
									border: "1px solid var(--ax-colors-border-default)",
									borderRadius: "6px",
									fontFamily: "inherit",
									fontSize: "13px",
									background: "var(--ax-colors-bg-default)",
									color: "var(--ax-colors-fg-default)",
									resize: "none",
								}}
							/>
							<Box display="flex" gap="8">
								<Button appearance="primary" size="sm" onClick={handleAdd}>
									Add
								</Button>
								<Button
									appearance="subtle"
									size="sm"
									onClick={() => setShowAddForm(false)}
								>
									Cancel
								</Button>
							</Box>
						</Box>
					) : (
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconPlus />}
							onClick={() => setShowAddForm(true)}
							style={{marginTop: 12, width: "100%"}}
						>
							Add rule
						</Button>
					)}
				</Box>

				{/* Footer */}
				<Box
					display="flex"
					gap="8"
					px="16"
					py="12"
					style={{
						borderTop: "1px solid var(--ax-colors-border-default)",
						flexShrink: 0,
					}}
				>
					<Button
						appearance="primary"
						size="sm"
						onClick={handleSave}
						icon={<IconCircleCheckSolid />}
					>
						Save rules
					</Button>
					<Button appearance="subtle" size="sm" onClick={onClose}>
						Cancel
					</Button>
					<Box style={{flex: 1}} />
					<Text fontSize="xs" color="fg.tertiary" style={{alignSelf: "center"}}>
						{editing.length} rule{editing.length !== 1 ? "s" : ""}
					</Text>
				</Box>
			</Box>
		</>
	);
}

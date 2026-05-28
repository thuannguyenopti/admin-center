"use client";

import { useState, useEffect } from "react";
import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Handle, Position, NodeToolbar, type NodeProps } from "@xyflow/react";
import { IconPlus } from "@tabler/icons-react";
import { NodeAddMenu } from "../NodeAddMenu";
import { FieldPickerInline } from "../FieldPickerModal";

const handleStyle = {
	background: "var(--ax-colors-border-accent)",
	width: 10,
	height: 10,
	border: "2px solid var(--ax-colors-bg-default)",
};

export function FormFieldNode({ data, selected }: NodeProps) {
	const d = data as any;
	const ruleCount = (d.ruleSets as any[] | undefined)?.length ?? 0;
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [showFields, setShowFields] = useState(false);
	const [plusHovered, setPlusHovered] = useState(false);

	useEffect(() => { if (!selected) { setIsMenuOpen(false); setShowFields(false); } }, [selected]);

	return (
		<>
			<NodeToolbar position={Position.Bottom} isVisible={selected} align="center" offset={8}>
				<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
					<button
						className="nodrag nopan"
						onClick={(e) => { e.stopPropagation(); setIsMenuOpen((v) => { if (v) { setShowFields(false); } return !v; }); }}
						onMouseEnter={() => setPlusHovered(true)}
						onMouseLeave={() => setPlusHovered(false)}
						style={{
							width: 28,
							height: 28,
							borderRadius: 6,
							border: isMenuOpen || plusHovered ? "none" : "1px solid var(--ax-colors-border-default)",
							background: isMenuOpen || plusHovered ? "var(--ax-colors-bg-accent)" : "var(--ax-colors-bg-default)",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							padding: 0,
						}}
					>
						<IconPlus size={14} color={isMenuOpen || plusHovered ? "#fff" : "var(--ax-colors-fg-secondary)"} />
					</button>
					{isMenuOpen && (showFields ? (
						<FieldPickerInline
							onBack={() => setShowFields(false)}
							onSelect={(field) => { d.onAddNodeBelow?.("field", field.id); setIsMenuOpen(false); setShowFields(false); }}
							customFields={d.customFields}
							onOpenCreateField={() => { d.onOpenCreateField?.(); setIsMenuOpen(false); setShowFields(false); }}
						/>
					) : (
						<NodeAddMenu
							disableSection={!!d.parentId}
							onAddText={() => { d.onAddNodeBelow?.("text"); setIsMenuOpen(false); }}
							onAddSection={() => { d.onAddNodeBelow?.("section"); setIsMenuOpen(false); }}
							onOpenFieldPicker={() => setShowFields(true)}
							onClose={() => setIsMenuOpen(false)}
						/>
					))}
				</div>
			</NodeToolbar>

			<Box
				bg="bg.default"
				rounded="md"
				px="12"
				py="10"
				display="flex"
				alignItems="center"
				gap="10"
				style={{
					minWidth: "280px",
					border: d.isHighlighted
						? d.isConflictHighlighted
							? "2px solid #ca8a04"
							: "2px solid var(--ax-colors-border-accent)"
						: selected
						? "1.5px solid var(--ax-colors-border-accent)"
						: "1px solid var(--ax-colors-border-default)",
					boxShadow: d.isHighlighted
						? d.isConflictHighlighted
							? "0 0 0 3px #fefce8"
							: "0 0 0 3px var(--ax-colors-bg-accent-subtle)"
						: selected
						? "0 0 0 3px var(--ax-colors-bg-accent-subtle)"
						: "0 1px 4px rgba(0,0,0,0.06)",
					cursor: "pointer",
					position: "relative",
					opacity: d.isDimmed ? 0.3 : 1,
					transition: "opacity 0.2s ease",
				}}
			>
				<Handle type="target" position={Position.Top} style={handleStyle} />
				<Box
					p="6"
					rounded="sm"
					bg="bg.accent.subtle"
					color="fg.default"
					display="flex"
					alignItems="center"
					justifyContent="center"
					style={{ flexShrink: 0 }}
				>
					{d.icon}
				</Box>
				<Box style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
					<Text
						fontSize="sm"
						fontWeight="500"
						color="fg.default"
						style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
					>
						{d.label || <span style={{ color: "var(--ax-colors-fg-tertiary)", fontWeight: 400 }}>Your question</span>}
					</Text>
					{d.typeLabel && (
						<Text
							fontSize="xs"
							color="fg.tertiary"
							style={{ display: "block", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
						>
							{d.typeLabel}
						</Text>
					)}
				</Box>
				<Handle type="source" position={Position.Bottom} style={handleStyle} />

				{ruleCount > 0 && (
					<div
						style={{
							position: "absolute",
							top: -9,
							right: -9,
							background: "var(--ax-colors-bg-accent)",
							color: "#fff",
							borderRadius: 999,
							fontSize: "10px",
							fontWeight: 700,
							padding: "2px 7px",
							lineHeight: 1.5,
							whiteSpace: "nowrap",
							pointerEvents: "none",
						}}
					>
						{ruleCount} {ruleCount === 1 ? "rule" : "rules"}
					</div>
				)}
			</Box>
		</>
	);
}

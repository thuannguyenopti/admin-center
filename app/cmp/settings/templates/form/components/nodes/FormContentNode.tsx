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

export function FormContentNode({ data, selected }: NodeProps) {
	const d = data as any;
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
					width: "280px",
					border: d.isHighlighted
						? "2px solid var(--ax-colors-border-warning)"
						: selected
						? "1.5px solid var(--ax-colors-border-accent)"
						: "1px solid var(--ax-colors-border-tertiary)",
					boxShadow: d.isHighlighted
						? "0 0 0 3px var(--ax-colors-bg-warning-subtle, #fefce8)"
						: "none",
					cursor: "pointer",
					position: "relative",
				}}
			>
				<Handle type="target" position={Position.Top} style={handleStyle} />
				<Box
					color="fg.secondary"
					display="flex"
					alignItems="center"
					justifyContent="center"
					style={{ flexShrink: 0, width: 28, height: 28 }}
				>
					{d.icon}
				</Box>
				<Box style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
					<Text fontSize="sm" fontWeight="500" color={d.label ? "fg.default" : "fg.tertiary"} style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
						{(d.label as string) || "Your text"}
					</Text>
					<Text fontSize="xs" color="fg.tertiary" style={{ display: "block", marginTop: "1px" }}>
						Paragraph
					</Text>
				</Box>
				<Handle type="source" position={Position.Bottom} style={handleStyle} />
			</Box>
		</>
	);
}

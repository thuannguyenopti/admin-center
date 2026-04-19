"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { IconLayoutColumns, IconChevronDown, IconChevronUp, IconDots } from "@tabler/icons-react";
import { Menu, MenuTrigger, MenuContent } from "@optiaxiom/react";

const handleStyle = {
	background: "var(--ax-colors-border-accent)",
	width: 10,
	height: 10,
	border: "2px solid var(--ax-colors-bg-default)",
};

export function FormSectionNode({ data, selected }: NodeProps) {
	const d = data as any;
	const isCollapsed = d.isCollapsed ?? false;
	const onToggleCollapse = d.onToggleCollapse as (() => void) | undefined;
	const onDuplicate = d.onDuplicate as (() => void) | undefined;

	return (
		<Box
			bg="bg.secondary"
			rounded="md"
			px="12"
			py="10"
			display="flex"
			alignItems="center"
			gap="10"
			style={{
				minWidth: "280px",
				border: d.isHighlighted
					? "2px solid var(--ax-colors-border-warning)"
					: selected
					? "2px dashed var(--ax-colors-border-accent)"
					: "2px dashed var(--ax-colors-border-default)",
				boxShadow: d.isHighlighted
					? "0 0 0 3px var(--ax-colors-bg-warning-subtle, #fefce8)"
					: "none",
				cursor: "pointer",
				position: "relative",
			}}
		>
			<Handle type="target" position={Position.Top} style={handleStyle} />
			<Box color="fg.secondary" style={{ flexShrink: 0 }}>
				<IconLayoutColumns size={16} />
			</Box>
			<Text fontSize="sm" fontWeight="500" color="fg.secondary" style={{ flex: 1 }}>
				{d.label as string}
			</Text>

			{/* Collapse toggle */}
			<button
				onClick={(e) => {
					e.stopPropagation();
					onToggleCollapse?.();
				}}
				style={{
					background: "none",
					border: "none",
					cursor: "pointer",
					display: "flex",
					alignItems: "center",
					color: "var(--ax-colors-fg-tertiary)",
					padding: "2px",
				}}
				aria-label={isCollapsed ? "Expand section" : "Collapse section"}
				title={isCollapsed ? "Expand section" : "Collapse section"}
			>
				{isCollapsed ? <IconChevronDown size={14} /> : <IconChevronUp size={14} />}
			</button>

			{/* Three-dot context menu */}
			<Menu
				options={[
					{ label: "Duplicate Section", execute: () => onDuplicate?.() },
				]}
			>
				<MenuTrigger asChild>
					<button
						onClick={(e) => e.stopPropagation()}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							color: "var(--ax-colors-fg-tertiary)",
							padding: "2px",
						}}
						aria-label="Section options"
					>
						<IconDots size={14} />
					</button>
				</MenuTrigger>
				<MenuContent />
			</Menu>

			<Handle type="source" position={Position.Bottom} style={handleStyle} />
		</Box>
	);
}

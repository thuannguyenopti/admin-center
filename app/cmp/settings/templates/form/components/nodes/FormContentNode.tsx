"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Handle, Position, type NodeProps } from "@xyflow/react";

const handleStyle = {
	background: "var(--ax-colors-border-accent)",
	width: 10,
	height: 10,
	border: "2px solid var(--ax-colors-bg-default)",
};

export function FormContentNode({ data, selected }: NodeProps) {
	const d = data as any;
	return (
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
			<Box color="fg.tertiary" style={{ flexShrink: 0 }}>
				{d.icon}
			</Box>
			<Text fontSize="sm" color="fg.default">
				{d.label as string}
			</Text>
			<Handle type="source" position={Position.Bottom} style={handleStyle} />
		</Box>
	);
}

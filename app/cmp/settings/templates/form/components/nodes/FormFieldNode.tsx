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

export function FormFieldNode({ data, selected }: NodeProps) {
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
					: "1px solid var(--ax-colors-border-default)",
				boxShadow: d.isHighlighted
					? "0 0 0 3px var(--ax-colors-bg-warning-subtle, #fefce8)"
					: selected
					? "0 0 0 3px var(--ax-colors-bg-accent-subtle)"
					: "0 1px 4px rgba(0,0,0,0.06)",
				cursor: "pointer",
				position: "relative",
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
			<Box style={{ flex: 1, minWidth: 0 }}>
				<Text
					fontSize="sm"
					fontWeight="500"
					color="fg.default"
					style={{ display: "block" }}
				>
					{d.label}
				</Text>
				{d.typeLabel && (
					<Text
						fontSize="xs"
						color="fg.tertiary"
						style={{ display: "block", marginTop: "1px" }}
					>
						{d.typeLabel}
					</Text>
				)}
			</Box>
			<Handle type="source" position={Position.Bottom} style={handleStyle} />
		</Box>
	);
}

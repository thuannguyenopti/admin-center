"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { IconGitBranch } from "@tabler/icons-react";

const handleStyle = {
	background: "var(--ax-colors-border-accent)",
	width: 10,
	height: 10,
	border: "2px solid var(--ax-colors-bg-default)",
};

export function FormConditionNode({ data, selected }: NodeProps) {
	const d = data as any;
	const rulesCount = d.ifClauses?.filter((c: any) => c.operator).length ?? 0;

	return (
		<Box
			bg="bg.default"
			rounded="md"
			style={{
				minWidth: "280px",
				border: selected
					? "1.5px solid var(--ax-colors-border-accent)"
					: "1px solid var(--ax-colors-border-default)",
				boxShadow: selected
					? "0 0 0 3px var(--ax-colors-bg-accent-subtle)"
					: "0 1px 4px rgba(0,0,0,0.06)",
				position: "relative",
				cursor: "pointer",
			}}
		>
			<Handle type="target" position={Position.Top} style={handleStyle} />
			<Box display="flex" alignItems="center" gap="8" px="12" py="10">
				<Box
					p="6"
					rounded="full"
					bg="bg.accent.subtle"
					color="fg.accent"
					display="flex"
					alignItems="center"
					justifyContent="center"
					style={{ flexShrink: 0 }}
				>
					<IconGitBranch size={14} />
				</Box>
				<Box style={{ flex: 1, minWidth: 0 }}>
					<Text fontSize="sm" fontWeight="600" color="fg.default">
						Condition
					</Text>
					{rulesCount > 0 ? (
						<Text
							fontSize="xs"
							color="fg.tertiary"
							style={{ display: "block", marginTop: "1px" }}
						>
							{rulesCount} rule{rulesCount > 1 ? "s" : ""} defined
						</Text>
					) : (
						<Text
							fontSize="xs"
							color="fg.tertiary"
							style={{ display: "block", marginTop: "1px" }}
						>
							Click to configure
						</Text>
					)}
				</Box>
			</Box>
			<Handle type="source" position={Position.Bottom} style={handleStyle} />
		</Box>
	);
}

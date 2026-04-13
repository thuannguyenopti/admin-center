"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconCheck } from "@tabler/icons-react";

type ChecklistItemProps = {
	checked: boolean;
	label: string;
	onToggle: () => void;
};

export function ChecklistItem({ checked, label, onToggle }: ChecklistItemProps) {
	return (
		<Box
			alignItems="center"
			display="flex"
			gap="10"
			onClick={onToggle}
			style={{ cursor: "pointer" }}
		>
			<Box
				alignItems="center"
				display="flex"
				justifyContent="center"
				style={{
					background: checked ? "var(--ax-colors-bg-accent)" : "transparent",
					border: checked ? "none" : "1px solid var(--ax-colors-border-control)",
					borderRadius: 2,
					flexShrink: 0,
					height: 16,
					width: 16,
				}}
			>
				{checked && <IconCheck color="white" size={10} />}
			</Box>
			<Text
				color={checked ? "fg.tertiary" : "fg.default"}
				style={{
					fontSize: 14,
					lineHeight: "20px",
					maxWidth: "none",
					textDecoration: checked ? "line-through" : "none",
				}}
			>
				{label}
			</Text>
		</Box>
	);
}

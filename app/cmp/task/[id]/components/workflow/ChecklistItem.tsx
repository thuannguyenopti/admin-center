"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";

export function ChecklistItem({ label }: { label: string }) {
	return (
		<Box alignItems="center" display="flex" gap="10">
			<Box
				style={{
					border: "1px solid var(--ax-colors-border-control)",
					borderRadius: 2,
					height: 16,
					width: 16,
				}}
			/>
			<Text color="fg.default" style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}>
				{label}
			</Text>
		</Box>
	);
}

"use client";

import type { ReactNode } from "react";
import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import {IconCalendar} from "@/app/lib/axiom-icons";

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
			<Text color="fg.default" style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}>{label}</Text>
		</Box>
	);
}

export function InlineDate({ label }: { label: string }) {
	return (
		<Box alignItems="center" display="flex" gap="8">
			<Box
				alignItems="center"
				bg="bg.tertiary"
				display="flex"
				justifyContent="center"
				rounded="full"
				style={{ height: 20, width: 20 }}
			>
				<IconCalendar size={11} color="var(--ax-colors-fg-secondary)" />
			</Box>
			<Text
				color="fg.default"
				style={{
					fontSize: 12,
					fontWeight: 600,
					letterSpacing: "0.01px",
					lineHeight: "16px",
					maxWidth: "none",
					textAlign: "center",
					whiteSpace: "nowrap",
				}}
			>
				{label}
			</Text>
		</Box>
	);
}

export function DashedCircle({ children }: { children?: ReactNode }) {
	return (
		<Box
			alignItems="center"
			display="flex"
			justifyContent="center"
			rounded="full"
			style={{
				border: "1px dashed var(--ax-colors-border-default)",
				height: 24,
				width: 24,
			}}
		>
			{children}
		</Box>
	);
}

"use client";

import { Box } from "@optiaxiom/react";
import type { ReactNode } from "react";

export function TaskCanvas({ left, right }: { left: ReactNode; right?: ReactNode }) {
	if (!right) {
		return <Box style={{ minHeight: "calc(100vh - 48px)" }}>{left}</Box>;
	}

	return (
		<Box
			display="grid"
			style={{
				gridTemplateColumns: "minmax(0, 1fr) 392px",
				height: "calc(100vh - 48px)",
			}}
		>
			<Box overflow="auto">{left}</Box>
			<Box
				bg="bg.default"
				borderL="1"
				borderColor="border.tertiary"
				overflow="auto"
				style={{ boxShadow: "0 6px 24px rgba(16, 24, 40, 0.04)" }}
			>
				{right}
			</Box>
		</Box>
	);
}

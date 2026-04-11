"use client";

import { Box } from "@optiaxiom/react";
import type { ReactNode } from "react";

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

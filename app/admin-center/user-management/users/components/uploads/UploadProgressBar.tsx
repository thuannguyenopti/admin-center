"use client";

import { Box } from "@optiaxiom/react";

/** Thin linear progress bar with a configurable fill color token. */
export function UploadProgressBar({
	value,
	fill = "bg.warning",
}: {
	value: number;
	fill?: "bg.warning" | "bg.success" | "bg.error";
}) {
	const pct = Math.max(0, Math.min(100, value));
	return (
		<Box
			bg="bg.secondary"
			rounded="full"
			style={{ height: 8, width: "100%", overflow: "hidden" }}
		>
			<Box
				bg={fill}
				rounded="full"
				style={{ height: "100%", width: `${pct}%`, transition: "width 200ms" }}
			/>
		</Box>
	);
}

"use client";

import { Box, Text } from "@optiaxiom/react";
import { IconCheck } from "@optiaxiom/icons";

export function Stepper({
	step,
	labels,
}: {
	step: number;
	labels: readonly string[];
}) {
	return (
		<Box display="flex" alignItems="center" gap="8">
			{labels.map((label, i) => {
				const n = i + 1;
				const state = n < step ? "done" : n === step ? "current" : "todo";
				return (
					<Box key={label} display="flex" alignItems="center" gap="8" flex="1">
						<Box
							display="inline-flex"
							alignItems="center"
							justifyContent="center"
							rounded="full"
							style={{
								width: 24,
								height: 24,
								flexShrink: 0,
								background:
									state === "done"
										? "var(--ax-colors-bg-accent)"
										: "var(--ax-colors-bg-default)",
								border:
									state === "current"
										? "5px solid var(--ax-colors-fg-accent)"
										: state === "done"
											? "none"
											: "2px solid var(--ax-colors-border-default)",
								color: "var(--ax-colors-fg-default)",
							}}
						>
							{state === "done" && <IconCheck size={14} />}
						</Box>
						<Text
							fontSize="sm"
							fontWeight={state === "current" ? "600" : "500"}
							color={state === "todo" ? "fg.tertiary" : "fg.default"}
						>
							{label}
						</Text>
						{i < labels.length - 1 && (
							<Box
								flex="1"
								style={{
									height: 2,
									background:
										n < step
											? "var(--ax-colors-bg-accent)"
											: "var(--ax-colors-border-default)",
									minWidth: 16,
								}}
							/>
						)}
					</Box>
				);
			})}
		</Box>
	);
}

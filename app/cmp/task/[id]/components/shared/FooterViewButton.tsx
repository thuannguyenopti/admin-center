"use client";

import { Box } from "@optiaxiom/react";
import type { ReactNode } from "react";

export function FooterViewButton({
	active = false,
	disabled = false,
	icon,
	onClick,
}: {
	active?: boolean;
	disabled?: boolean;
	icon: ReactNode;
	onClick?: () => void;
}) {
	return (
		<Box
			alignItems="center"
			bg={active ? "bg.secondary" : undefined}
			display="flex"
			justifyContent="center"
			onClick={disabled ? undefined : onClick}
			rounded="md"
			style={{
				color: active ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
				cursor: disabled ? "default" : onClick ? "pointer" : "default",
				height: 32,
				opacity: disabled ? 0.28 : active ? 1 : 0.55,
				padding: 0,
				width: 32,
			}}
		>
			{icon}
		</Box>
	);
}

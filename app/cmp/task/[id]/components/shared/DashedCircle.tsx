"use client";

import { Box } from "@optiaxiom/react";
import type { ReactNode } from "react";

type DashedCircleProps = {
	children?: ReactNode;
	onClick?: () => void;
};

export function DashedCircle({ children, onClick }: DashedCircleProps) {
	return (
		<Box
			alignItems="center"
			display="flex"
			justifyContent="center"
			onClick={
				onClick
					? (e) => {
							e.stopPropagation();
							onClick();
						}
					: undefined
			}
			rounded="full"
			style={{
				border: "1px dashed var(--ax-colors-border-default)",
				cursor: onClick ? "pointer" : undefined,
				height: 24,
				width: 24,
			}}
		>
			{children}
		</Box>
	);
}

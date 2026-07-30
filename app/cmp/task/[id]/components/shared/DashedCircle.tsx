<<<<<<< HEAD
"use client";

import { Box } from "@optiaxiom/react";
import type { ReactNode } from "react";

type DashedCircleProps = {
	children?: ReactNode;
	onClick?: () => void;
};

export function DashedCircle({ children, onClick }: DashedCircleProps) {
	const handleClick = onClick
		? (e: React.MouseEvent) => {
				e.stopPropagation();
				onClick();
			}
		: undefined;

	const handleKeyDown = onClick
		? (e: React.KeyboardEvent) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					e.stopPropagation();
					onClick();
				}
			}
		: undefined;

	return (
		<Box
			alignItems="center"
			display="flex"
			justifyContent="center"
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			role={onClick ? "button" : undefined}
			rounded="full"
			style={{
				border: "1px dashed var(--ax-colors-border-default)",
				cursor: onClick ? "pointer" : undefined,
				height: 24,
				width: 24,
			}}
			tabIndex={onClick ? 0 : undefined}
		>
			{children}
		</Box>
	);
}
=======
"use client";

import { Box } from "@optiaxiom/react";
import type { ReactNode } from "react";

type DashedCircleProps = {
	children?: ReactNode;
	onClick?: () => void;
};

export function DashedCircle({ children, onClick }: DashedCircleProps) {
	const handleClick = onClick
		? (e: React.MouseEvent) => {
				e.stopPropagation();
				onClick();
			}
		: undefined;

	const handleKeyDown = onClick
		? (e: React.KeyboardEvent) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					e.stopPropagation();
					onClick();
				}
			}
		: undefined;

	return (
		<Box
			alignItems="center"
			display="flex"
			justifyContent="center"
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			role={onClick ? "button" : undefined}
			rounded="full"
			style={{
				border: "1px dashed var(--ax-colors-border-default)",
				cursor: onClick ? "pointer" : undefined,
				height: 24,
				width: 24,
			}}
			tabIndex={onClick ? 0 : undefined}
		>
			{children}
		</Box>
	);
}
>>>>>>> origin/main

"use client";

import { Box } from "@optiaxiom/react";
import type { BrandColor } from "../types";

type ColorSwatchBarProps = {
	colors: BrandColor[];
	height?: number;
	rounded?: boolean;
};

export function ColorSwatchBar({ colors, height = 10, rounded = true }: ColorSwatchBarProps) {
	return (
		<Box
			display="flex"
			overflow="hidden"
			style={{
				borderRadius: rounded ? "12px 12px 0 0" : 0,
				height,
				width: "100%",
			}}
		>
			{colors.map((color, index) => (
				<Box
					key={index}
					flex="1"
					style={{ background: color.hex, minWidth: 0 }}
					title={`${color.name} — ${color.hex}`}
				/>
			))}
		</Box>
	);
}

type ColorPaletteProps = {
	colors: BrandColor[];
	size?: "sm" | "md" | "lg";
};

export function ColorPalette({ colors, size = "md" }: ColorPaletteProps) {
	const dim = size === "sm" ? 24 : size === "lg" ? 48 : 32;
	const gap = size === "sm" ? 6 : size === "lg" ? 12 : 8;

	return (
		<Box display="flex" style={{ gap, flexWrap: "wrap" }}>
			{colors.map((color, index) => (
				<Box
					key={index}
					style={{
						background: color.hex,
						border: "1px solid rgba(0,0,0,0.08)",
						borderRadius: "50%",
						height: dim,
						width: dim,
						flexShrink: 0,
					}}
					title={`${color.name} — ${color.hex}`}
				/>
			))}
		</Box>
	);
}

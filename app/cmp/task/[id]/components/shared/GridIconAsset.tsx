"use client";

import type { ComponentType, SVGProps } from "react";

export function GridIconAsset({
	active = false,
	Icon,
}: {
	active?: boolean;
	Icon: ComponentType<SVGProps<SVGSVGElement>>;
}) {
	return (
		<Icon
			aria-hidden="true"
			style={{
				color: active ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
				display: "block",
				height: 14,
				flexShrink: 0,
				opacity: active ? 1 : 0.5,
				width: 18,
			}}
		/>
	);
}

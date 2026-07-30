"use client";

import { Text } from "@/app/components/Text";
import type { ComponentProps, CSSProperties } from "react";

/**
 * Caption text style — 12px Roboto Mono, uppercase, 3% letter-spacing, 125% line-height.
 * Approximates the project's Figma "Caption/Regular" spec (distinct from Body/Small,
 * which is Die Grotesk B with no case transform) until Axiom V3 ships a proper Caption
 * primitive — Ben is adding one; swap this out once it lands.
 */
export function Caption({ style, ...props }: ComponentProps<typeof Text>) {
	const captionStyle: CSSProperties = {
		fontFamily: "'Roboto Mono', monospace",
		letterSpacing: "0.03em",
		lineHeight: 1.25,
		textTransform: "uppercase",
		...style,
	};

	return <Text color="fg.tertiary" fontSize="sm" {...props} style={captionStyle} />;
}

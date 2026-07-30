"use client";

import { Box } from "@optiaxiom/react";
import type { CSSProperties } from "react";

// Plain image renderer on the canvas — Image Gen II's real canvas shows
// content full-bleed with no card chrome (title/alt-text-box/download all
// live only in the chat panel's compact reference, not here). Editing is
// handled by the canvas-wide comment tool (CanvasStage), not a per-image
// affordance: clicking this image while that tool is active drops a pin
// here like any other content. `data-edit-label` is how the pin-placement
// click handler resolves a human-readable label for this element.
export function EditableImage({
	aspectRatio,
	image,
	imageAlt,
	label,
	objectPosition = "50% 50%",
	style,
}: {
	aspectRatio: string;
	image: string;
	imageAlt: string;
	label: string;
	objectPosition?: string;
	style?: CSSProperties;
}) {
	return (
		<Box data-edit-label={label} style={{ aspectRatio, borderRadius: 8, overflow: "hidden", position: "relative", ...style }}>
			<img
				alt={imageAlt}
				src={image}
				style={{ height: "100%", inset: 0, objectFit: "cover", objectPosition, position: "absolute", width: "100%" }}
			/>
		</Box>
	);
}

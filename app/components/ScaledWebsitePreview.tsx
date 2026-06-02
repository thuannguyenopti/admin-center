"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@optiaxiom/react";
import type { Page } from "@/app/db/initialData";
import type { Outline } from "@/app/db/initialData";
import WebsitePagePreview from "./WebsitePagePreview";

type ScaledWebsitePreviewProps = {
	page: Page;
	outlines?: Outline[];
	/** Virtual desktop width to render at before scaling (default 1440) */
	renderWidth?: number;
};

/**
 * Renders a WebsitePagePreview at a fixed desktop width, then uses
 * CSS transform to scale it down to fit the actual container width.
 *
 * This ensures Tailwind responsive classes render at desktop breakpoints
 * regardless of the actual container size.
 */
export default function ScaledWebsitePreview({
	page,
	outlines,
	renderWidth = 1440,
}: ScaledWebsitePreviewProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(1);
	const [innerHeight, setInnerHeight] = useState(0);

	const updateDimensions = useCallback(() => {
		const container = containerRef.current;
		const inner = innerRef.current;
		if (!container || !inner) return;

		const containerWidth = container.offsetWidth;
		const newScale = renderWidth > 0
			? Math.min(1, Math.max(containerWidth / renderWidth, 0))
			: 1;
		setScale(newScale);
		setInnerHeight(inner.scrollHeight);
	}, [renderWidth]);

	useEffect(() => {
		updateDimensions();

		const observer = new ResizeObserver(updateDimensions);
		if (containerRef.current) observer.observe(containerRef.current);
		if (innerRef.current) observer.observe(innerRef.current);

		return () => observer.disconnect();
	}, [updateDimensions]);

	return (
		<Box
			ref={containerRef}
			overflow="hidden"
			w="full"
			style={{
				position: "relative",
				height: innerHeight * scale || "auto",
			}}
		>
			<Box
				ref={innerRef}
				style={{
					position: "absolute",
					left: 0,
					top: 0,
					width: renderWidth,
					transform: `scale(${scale})`,
					transformOrigin: "top left",
				}}
			>
				<WebsitePagePreview page={page} outlines={outlines} />
			</Box>
		</Box>
	);
}

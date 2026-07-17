"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Tooltip } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { IconArrowsMaximize, IconArrowsMinimize, IconChevronLeft, IconChevronRight } from "@optimizely/axiom-icons";
import { MarkerBadge, SEVERITY_META, visibleOpalFlags } from "./OpalReviewCard";
import { stepZoom } from "./AssetFocusToolbar";
import type { LibraryItem } from "../../page";

// Trackpads emit dozens of small-delta wheel events per second — without a floor between
// steps, one swipe would blow through every zoom level almost instantly.
const WHEEL_ZOOM_THROTTLE_MS = 120;

/**
 * Big-image stage for the asset focus view — the dominant region. Always object-fit:
 * contain (never crops) so the full asset stays visible regardless of its aspect ratio
 * — important both for reviewers judging the actual asset and for OPAL's percentage-
 * based markers, which assume the whole image is on screen. Rounded-12, with only the
 * prev/fullscreen-toggle/next cluster overlaid bottom-right; close and all other actions
 * live in AssetFocusToolbar, not here.
 *
 * Mouse wheel steps zoom in/out (matching the toolbar's +/- keyboard shortcuts); click
 * and hold pans the image once zoomed past Fit.
 *
 * Layout is three nested boxes on purpose: the outer box owns flex sizing and anchors
 * the nav cluster so it stays put at a fixed corner; the middle box is the actual
 * scroll/pan viewport once zoom goes beyond "fit"; the inner wrapper is sized to the
 * image's real displayed dimensions so percentage-based OPAL markers stay aligned to
 * the image itself instead of the (differently-sized) outer stage.
 */
export function AssetFocusStage({
	item,
	zoom,
	onZoomChange,
	activeMarkerIndex,
	onHoverMarker,
	chromeHidden,
	onToggleChrome,
	hasPrev,
	hasNext,
	onPrev,
	onNext,
}: {
	item: LibraryItem;
	zoom: "fit" | number;
	onZoomChange: (zoom: "fit" | number) => void;
	activeMarkerIndex: number | null;
	onHoverMarker: (index: number | null) => void;
	chromeHidden: boolean;
	onToggleChrome: () => void;
	hasPrev: boolean;
	hasNext: boolean;
	onPrev: () => void;
	onNext: () => void;
}) {
	const [naturalSize, setNaturalSize] = useState<{ height: number; width: number } | null>(null);
	const [isPanning, setIsPanning] = useState(false);
	const viewportRef = useRef<HTMLDivElement>(null);
	const panStart = useRef<{ left: number; top: number; x: number; y: number } | null>(null);
	const lastWheelStepAt = useRef(0);
	const flags = visibleOpalFlags(item);
	const isFit = zoom === "fit";
	const scale = isFit ? 1 : zoom / 100;

	// Native (non-passive) listener, not React's onWheel: React registers wheel handlers
	// passively by default, so e.preventDefault() there is a silent no-op and the page would
	// still scroll underneath the zoom. Re-subscribes on every zoom change so the closure
	// always steps from the current level.
	useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) return;

		function onWheel(e: WheelEvent) {
			e.preventDefault();
			const now = Date.now();
			if (now - lastWheelStepAt.current < WHEEL_ZOOM_THROTTLE_MS) return;
			lastWheelStepAt.current = now;
			onZoomChange(stepZoom(zoom, e.deltaY < 0 ? 1 : -1));
		}

		viewport.addEventListener("wheel", onWheel, { passive: false });
		return () => viewport.removeEventListener("wheel", onWheel);
	}, [zoom, onZoomChange]);

	useEffect(() => {
		if (!isPanning) return;

		function onMouseMove(e: MouseEvent) {
			const viewport = viewportRef.current;
			if (!viewport || !panStart.current) return;
			viewport.scrollLeft = panStart.current.left - (e.clientX - panStart.current.x);
			viewport.scrollTop = panStart.current.top - (e.clientY - panStart.current.y);
		}
		function onMouseUp() {
			setIsPanning(false);
			panStart.current = null;
		}

		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
		return () => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};
	}, [isPanning]);

	function startPan(e: React.MouseEvent) {
		if (isFit || !viewportRef.current) return;
		panStart.current = { left: viewportRef.current.scrollLeft, top: viewportRef.current.scrollTop, x: e.clientX, y: e.clientY };
		setIsPanning(true);
	}

	return (
		<Box style={{ flex: 1, minHeight: 0, minWidth: 0, position: "relative" }}>
			{/*
			  Grid + placeItems, not flex + align/justify-content: a centered flex container
			  clips/orphans the start-side overflow when its content is larger than the
			  container, making that portion of an oversized zoomed image unscrollable-to.
			  Grid's centering doesn't have that bug and still centers content smaller than
			  the viewport (e.g. a zoomed-out small image), so it works for both directions.
			*/}
			<Box
				ref={viewportRef}
				style={{
					cursor: isFit ? undefined : isPanning ? "grabbing" : "grab",
					display: isFit ? undefined : "grid",
					inset: 0,
					overflow: isFit ? "hidden" : "auto",
					placeItems: isFit ? undefined : "center",
					position: "absolute",
					userSelect: isPanning ? "none" : undefined,
				}}
				onMouseDown={startPan}
			>
				<Box
					style={{
						height: isFit || !naturalSize ? "100%" : naturalSize.height * scale,
						position: "relative",
						width: isFit || !naturalSize ? "100%" : naturalSize.width * scale,
					}}
				>
					{item.image ? (
						<img
							alt={item.title}
							draggable={false}
							src={item.image}
							style={{ borderRadius: 12, display: "block", height: "100%", objectFit: "contain", width: "100%" }}
							onLoad={(e) => {
								const img = e.currentTarget;
								if (img.naturalWidth && img.naturalHeight) setNaturalSize({ height: img.naturalHeight, width: img.naturalWidth });
							}}
						/>
					) : (
						<Box rounded="lg" style={{ background: item.bgColor ?? "var(--ax-colors-bg-secondary)", height: "100%", width: "100%" }} />
					)}

					{flags.map((flag, i) => flag.marker && (
						<Box
							key={i}
							role="button"
							tabIndex={0}
							style={{ cursor: "pointer", left: `${flag.marker.x}%`, position: "absolute", top: `${flag.marker.y}%`, transform: "translate(-50%, -50%)" }}
							onClick={() => onHoverMarker(i)}
							onMouseEnter={() => onHoverMarker(i)}
							onMouseLeave={() => onHoverMarker(null)}
						>
							<MarkerBadge active={activeMarkerIndex === i} index={i + 1} intent={SEVERITY_META[flag.severity].intent} />
						</Box>
					))}
				</Box>
			</Box>

			<Box display="flex" gap="8" style={{ position: "absolute", right: 16, bottom: 16 }}>
				<Tooltip content="Previous asset">
					<Button appearance="default" disabled={!hasPrev} icon={<IconChevronLeft size={14} />} aria-label="Previous asset" size="sm" onClick={onPrev} />
				</Tooltip>
				<Tooltip content={chromeHidden ? "Exit fullscreen" : "Fullscreen"}>
					<Button
						appearance="default"
						icon={chromeHidden ? <IconArrowsMinimize size={14} /> : <IconArrowsMaximize size={14} />}
						aria-label={chromeHidden ? "Exit fullscreen" : "Fullscreen"}
						size="sm"
						onClick={onToggleChrome}
					/>
				</Tooltip>
				<Tooltip content="Next asset">
					<Button appearance="default" disabled={!hasNext} icon={<IconChevronRight size={14} />} aria-label="Next asset" size="sm" onClick={onNext} />
				</Tooltip>
			</Box>
		</Box>
	);
}

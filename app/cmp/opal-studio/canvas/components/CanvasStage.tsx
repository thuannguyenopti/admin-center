"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Text } from "@optiaxiom/react";
import { GRID_SIZE, SNAP_THRESHOLD, type Artboard, type BrandPack, type CanvasSettings } from "../config";
import { ZoomControls } from "./ZoomControls";

interface TextLayoutStyle {
	position: "absolute";
	color: string;
	textShadow: string;
	textTransform: "uppercase";
	headlineSize: number;
	headlineWeight: number;
	headlineLetterSpacing: number;
	headlineLineHeight: number;
	subheadlineSize: number;
	subheadlineWeight: number;
	subheadlineLetterSpacing: number;
	subheadlineMarginTop: number;
	alignItems: "flex-start" | "center" | "flex-end";
	textAlign: "left" | "center" | "right";
	maxWidth: string;
	left?: number | string;
	top?: number | string;
	right?: number;
	bottom?: number;
	transform?: string;
}

const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.15;
const ZOOM_MAX = 2;
const TEXT_REF_WIDTH = 640; // reference artboard width for text scaling

export function CanvasStage({
	artboards,
	draft,
	textOverlayEnabled,
	textLayoutStyle,
	headline,
	subheadline,
	brandPack,
	animatingIds,
	onArtboardMove,
	canvasSettings,
	promptBarHeight = 160,
}: {
	artboards: Artboard[];
	draft: string;
	textOverlayEnabled: boolean;
	textLayoutStyle: TextLayoutStyle;
	headline: string;
	subheadline: string;
	brandPack: BrandPack;
	animatingIds: string[];
	onArtboardMove: (id: string, x: number, y: number) => void;
	canvasSettings: CanvasSettings;
	promptBarHeight?: number;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const [isPanning, setIsPanning] = useState(false);
	const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

	/* ── Dragging artboards ── */
	const [dragId, setDragId] = useState<string | null>(null);
	const dragStart = useRef({ x: 0, y: 0, abX: 0, abY: 0 });

	/* ── Alignment guides ── */
	const [guides, setGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });

	/* ── Fit all artboards into view ── */
	const fitToCanvas = useCallback(() => {
		if (!containerRef.current || artboards.length === 0) return;
		const container = containerRef.current;
		const cw = container.clientWidth;
		const ch = container.clientHeight - 140; // account for prompt bar

		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		for (const ab of artboards) {
			minX = Math.min(minX, ab.x);
			minY = Math.min(minY, ab.y);
			maxX = Math.max(maxX, ab.x + ab.width);
			maxY = Math.max(maxY, ab.y + ab.height + 32);
		}

		const contentW = maxX - minX;
		const contentH = maxY - minY;
		const padding = 60;
		const scaleX = (cw - padding * 2) / contentW;
		const scaleY = (ch - padding * 2) / contentH;
		const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), ZOOM_MIN), ZOOM_MAX);

		const centerX = (minX + maxX) / 2;
		const centerY = (minY + maxY) / 2;

		setZoom(newZoom);
		setPan({
			x: cw / 2 - centerX * newZoom,
			y: ch / 2 - centerY * newZoom,
		});
	}, [artboards]);

	/* Center on initial mount */
	const hasFittedOnMount = useRef(false);
	useEffect(() => {
		if (!hasFittedOnMount.current && containerRef.current && artboards.length > 0) {
			hasFittedOnMount.current = true;
			requestAnimationFrame(() => fitToCanvas());
		}
	}, [artboards, fitToCanvas]);


	/* Re-fit when artboard count changes (pack generation) */
	const prevCount = useRef(artboards.length);
	useEffect(() => {
		if (artboards.length !== prevCount.current) {
			const timer = setTimeout(fitToCanvas, 100);
			prevCount.current = artboards.length;
			return () => clearTimeout(timer);
		}
	}, [artboards.length, fitToCanvas]);

	/* ── Pointer handlers ── */
	const onPointerDown = useCallback((e: React.PointerEvent) => {
		if (e.button !== 0) return;

		// Check if clicking on an artboard
		const artboardEl = (e.target as HTMLElement).closest("[data-artboard-id]") as HTMLElement | null;
		if (artboardEl) {
			const id = artboardEl.dataset.artboardId!;
			const ab = artboards.find((a) => a.id === id);
			if (!ab) return;
			setDragId(id);
			dragStart.current = { x: e.clientX, y: e.clientY, abX: ab.x, abY: ab.y };
			artboardEl.setPointerCapture(e.pointerId);
			e.stopPropagation();
			return;
		}

		// Otherwise pan the canvas
		setIsPanning(true);
		panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}, [pan, artboards]);

	const onPointerMove = useCallback((e: React.PointerEvent) => {
		if (dragId) {
			const dx = (e.clientX - dragStart.current.x) / zoom;
			const dy = (e.clientY - dragStart.current.y) / zoom;
			let newX = dragStart.current.abX + dx;
			let newY = dragStart.current.abY + dy;

			const draggedAb = artboards.find((a) => a.id === dragId);
			if (!draggedAb) return;

			// Snap to grid
			if (canvasSettings.snapToGrid) {
				newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
				newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
			}

			// Compute alignment guides
			if (canvasSettings.showGuides) {
				const gx: number[] = [];
				const gy: number[] = [];
				const edges = {
					left: newX,
					right: newX + draggedAb.width,
					centerX: newX + draggedAb.width / 2,
					top: newY,
					bottom: newY + draggedAb.height,
					centerY: newY + draggedAb.height / 2,
				};

				for (const other of artboards) {
					if (other.id === dragId) continue;
					const otherEdges = {
						left: other.x, right: other.x + other.width, centerX: other.x + other.width / 2,
						top: other.y, bottom: other.y + other.height, centerY: other.y + other.height / 2,
					};

					// Vertical guides (x alignment)
					for (const ex of [edges.left, edges.right, edges.centerX]) {
						for (const ox of [otherEdges.left, otherEdges.right, otherEdges.centerX]) {
							if (Math.abs(ex - ox) < SNAP_THRESHOLD) {
								gx.push(ox);
								// Snap to the guide
								if (ex === edges.left) newX = ox;
								else if (ex === edges.right) newX = ox - draggedAb.width;
								else newX = ox - draggedAb.width / 2;
							}
						}
					}

					// Horizontal guides (y alignment)
					for (const ey of [edges.top, edges.bottom, edges.centerY]) {
						for (const oy of [otherEdges.top, otherEdges.bottom, otherEdges.centerY]) {
							if (Math.abs(ey - oy) < SNAP_THRESHOLD) {
								gy.push(oy);
								if (ey === edges.top) newY = oy;
								else if (ey === edges.bottom) newY = oy - draggedAb.height;
								else newY = oy - draggedAb.height / 2;
							}
						}
					}
				}
				setGuides({ x: gx, y: gy });
			}

			onArtboardMove(dragId, newX, newY);
			return;
		}
		if (!isPanning) return;
		setPan({
			x: panStart.current.panX + (e.clientX - panStart.current.x),
			y: panStart.current.panY + (e.clientY - panStart.current.y),
		});
	}, [isPanning, dragId, zoom, onArtboardMove, artboards, canvasSettings]);

	const onPointerUp = useCallback(() => {
		setIsPanning(false);
		setDragId(null);
		setGuides({ x: [], y: [] });
	}, []);

	/* ── Scroll to zoom ── */
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const handler = (e: WheelEvent) => {
			e.preventDefault();
			const rect = el.getBoundingClientRect();
			const mx = e.clientX - rect.left;
			const my = e.clientY - rect.top;

			const direction = e.deltaY > 0 ? -1 : 1;
			const newZoom = Math.min(Math.max(zoom + direction * ZOOM_STEP, ZOOM_MIN), ZOOM_MAX);
			const scale = newZoom / zoom;

			setPan({
				x: mx - (mx - pan.x) * scale,
				y: my - (my - pan.y) * scale,
			});
			setZoom(newZoom);
		};
		el.addEventListener("wheel", handler, { passive: false });
		return () => el.removeEventListener("wheel", handler);
	}, [zoom, pan]);

	const isInteracting = isPanning || dragId !== null;

	return (
		<div
			ref={containerRef}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			style={{
				position: "relative",
				width: "100%",
				height: "100%",
				overflow: "hidden",
				background: "var(--ax-colors-bg-page)",
				cursor: dragId ? "grabbing" : isPanning ? "grabbing" : "grab",
			}}
		>
			{/* Infinite canvas layer */}
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					transformOrigin: "0 0",
					transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
					transition: isInteracting ? "none" : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
				}}
			>
				{artboards.map((ab, index) => {
					const isAnimating = animatingIds.includes(ab.id);
					const isPrimary = index === 0 && artboards.length > 1;
					const isDragging = dragId === ab.id;

					return (
						<div
							key={ab.id}
							data-artboard-id={ab.id}
							style={{
								position: "absolute",
								left: ab.x,
								top: ab.y,
								width: ab.width,
								height: ab.height,
								borderRadius: 12,
								overflow: "hidden",
								boxShadow: isDragging
									? "0 24px 56px rgba(15, 23, 42, 0.2)"
									: "0 16px 40px rgba(15, 23, 42, 0.12)",
								background: "var(--ax-colors-bg-tertiary)",
								border: isPrimary ? "2px solid var(--ax-colors-border-accent)" : "1px solid var(--ax-colors-border-tertiary)",
								opacity: isAnimating ? 0 : 1,
								transform: isAnimating ? "scale(0.9)" : "scale(1)",
								transition: isDragging
									? "box-shadow 0.2s ease"
									: "opacity 0.5s ease, transform 0.5s ease, box-shadow 0.2s ease",
								cursor: isDragging ? "grabbing" : "move",
								zIndex: isDragging ? 10 : 1,
							}}
						>
							<img
								src={ab.image}
								alt={ab.label}
								draggable={false}
								style={{
									display: "block",
									width: "100%",
									height: "100%",
									objectFit: "cover",
									pointerEvents: "none",
								}}
							/>

							{/* Gradient overlay */}
							<div
								style={{
									position: "absolute",
									inset: 0,
									background:
										"linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)",
									pointerEvents: "none",
								}}
							/>

							{/* Text overlay — scales proportionally per artboard */}
							{textOverlayEnabled && (() => {
								const scale = ab.width / TEXT_REF_WIDTH;
								return (
									<div
										style={{
											...textLayoutStyle,
											display: "flex",
											flexDirection: "column",
											alignItems: textLayoutStyle.alignItems,
											pointerEvents: "none",
											// Scale position values
											...(typeof textLayoutStyle.left === "number" ? { left: textLayoutStyle.left * scale } : {}),
											...(typeof textLayoutStyle.top === "number" ? { top: textLayoutStyle.top * scale } : {}),
											...(typeof textLayoutStyle.right === "number" ? { right: textLayoutStyle.right * scale } : {}),
											...(typeof textLayoutStyle.bottom === "number" ? { bottom: textLayoutStyle.bottom * scale } : {}),
										}}
									>
										<div
											style={{
												fontSize: textLayoutStyle.headlineSize * scale,
												lineHeight: textLayoutStyle.headlineLineHeight,
												fontWeight: textLayoutStyle.headlineWeight,
												letterSpacing: textLayoutStyle.headlineLetterSpacing * scale,
												textTransform: "uppercase",
											}}
										>
											{headline}
										</div>
										<div
											style={{
												fontSize: textLayoutStyle.subheadlineSize * scale,
												lineHeight: 1.4,
												fontWeight: textLayoutStyle.subheadlineWeight,
												letterSpacing: textLayoutStyle.subheadlineLetterSpacing * scale,
												textTransform: "uppercase",
												opacity: 0.88,
												marginTop: textLayoutStyle.subheadlineMarginTop * scale,
												maxWidth: "92%",
											}}
										>
											{subheadline}
										</div>
									</div>
								);
							})()}

							{/* Stride watermark */}
							{brandPack === "Stride" && (
								<img
									src="/stride-wordmark.svg"
									alt="Stride"
									style={{
										position: "absolute",
										bottom: 16,
										left: 20,
										height: 14,
										width: "auto",
										opacity: 0.92,
										filter: "brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
										pointerEvents: "none",
									}}
								/>
							)}
						</div>
					);
				})}

				{/* Artboard labels */}
				{artboards.length > 1 &&
					artboards.map((ab) => {
						const isAnimating = animatingIds.includes(ab.id);
						return (
							<div
								key={`label-${ab.id}`}
								style={{
									position: "absolute",
									left: ab.x,
									top: ab.y + ab.height + 8,
									width: ab.width,
									opacity: isAnimating ? 0 : 1,
									transition: "opacity 0.5s ease",
									pointerEvents: "none",
								}}
							>
								<Text fontSize="xs" fontWeight="600" color="fg.secondary">
									{ab.label}
								</Text>
								<Text fontSize="xs" color="fg.tertiary">
									{ab.ratio}
								</Text>
							</div>
						);
					})}
			</div>

			{/* Grid overlay */}
			{canvasSettings.showGrid && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						pointerEvents: "none",
						backgroundImage: `
							linear-gradient(var(--ax-colors-border-tertiary) 1px, transparent 1px),
							linear-gradient(90deg, var(--ax-colors-border-tertiary) 1px, transparent 1px)
						`,
						backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
						backgroundPosition: `${pan.x % (GRID_SIZE * zoom)}px ${pan.y % (GRID_SIZE * zoom)}px`,
						opacity: 0.4,
						zIndex: 2,
					}}
				/>
			)}

			{/* Alignment guides */}
			{canvasSettings.showGuides && dragId && (
				<svg
					style={{
						position: "absolute",
						inset: 0,
						pointerEvents: "none",
						zIndex: 3,
						overflow: "visible",
					}}
				>
					{guides.x.map((gx, i) => (
						<line
							key={`gx-${i}`}
							x1={pan.x + gx * zoom}
							y1={0}
							x2={pan.x + gx * zoom}
							y2="100%"
							stroke="var(--ax-colors-fg-accent)"
							strokeWidth={1}
							strokeDasharray="4 4"
						/>
					))}
					{guides.y.map((gy, i) => (
						<line
							key={`gy-${i}`}
							x1={0}
							y1={pan.y + gy * zoom}
							x2="100%"
							y2={pan.y + gy * zoom}
							stroke="var(--ax-colors-fg-accent)"
							strokeWidth={1}
							strokeDasharray="4 4"
						/>
					))}
				</svg>
			)}

			{/* Zoom controls — positioned above the prompt bar */}
			<ZoomControls
				zoom={zoom}
				onZoomIn={() => setZoom((z) => Math.min(z + ZOOM_STEP, ZOOM_MAX))}
				onZoomOut={() => setZoom((z) => Math.max(z - ZOOM_STEP, ZOOM_MIN))}
				onFit={fitToCanvas}
				bottomOffset={promptBarHeight}
			/>
		</div>
	);
}

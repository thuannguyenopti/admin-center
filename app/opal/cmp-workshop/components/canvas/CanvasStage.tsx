"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button } from "@optiaxiom/react";
import { IconMagnifyingGlassMinus, IconMagnifyingGlassPlus } from "@optiaxiom/icons";
import { Text } from "@/app/components/Text";
import type { Scene } from "../../data";
import { Toolbar } from "./Toolbar";

export type ContentTab = "blog" | "social" | "email";
type CanvasTransform = { x: number; y: number; scale: number };

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 1.15;

const surfaceStyle = {
	background: "var(--ax-colors-bg-page)",
	containerType: "inline-size",
	display: "flex",
	flexDirection: "column" as const,
	height: "100%",
	minHeight: 0,
	overflow: "hidden",
};

const canvasBodyStyle = { flex: 1, minHeight: 0, overflow: "hidden", position: "relative" as const };

const canvasViewportStyle = {
	height: "100%",
	outline: "none",
	overflow: "hidden",
	position: "relative" as const,
	touchAction: "none",
	userSelect: "none" as const,
	width: "100%",
};

const canvasWorldStyle = {
	minHeight: "100%",
	minWidth: "100%",
	padding: 24,
	position: "absolute" as const,
	transformOrigin: "0 0",
	willChange: "transform",
};

export function CanvasStage({
	activeTab,
	children,
	onSceneChange,
	onTabChange,
	showRationale,
	showWorkflow = false,
}: {
	activeTab: ContentTab;
	children: React.ReactNode;
	onSceneChange: (scene: Scene) => void;
	onTabChange: (tab: ContentTab) => void;
	showRationale: boolean;
	showWorkflow?: boolean;
}) {
	const viewportRef = useRef<HTMLDivElement | null>(null);
	const panRef = useRef<{
		pointerId: number;
		startClientX: number;
		startClientY: number;
		startX: number;
		startY: number;
	} | null>(null);
	const [transform, setTransform] = useState<CanvasTransform>({ x: 0, y: 0, scale: 1 });
	const [spaceDown, setSpaceDown] = useState(false);
	const [panning, setPanning] = useState(false);

	const clampScale = useCallback((scale: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale)), []);

	const zoomAt = useCallback(
		(clientX: number, clientY: number, nextScale: number) => {
			const viewport = viewportRef.current;
			if (!viewport) return;
			const rect = viewport.getBoundingClientRect();
			setTransform((current) => {
				const scale = clampScale(nextScale);
				const worldX = (clientX - rect.left - current.x) / current.scale;
				const worldY = (clientY - rect.top - current.y) / current.scale;
				return {
					scale,
					x: clientX - rect.left - worldX * scale,
					y: clientY - rect.top - worldY * scale,
				};
			});
		},
		[clampScale],
	);

	const zoomFromCenter = useCallback(
		(factor: number) => {
			const viewport = viewportRef.current;
			if (!viewport) return;
			const rect = viewport.getBoundingClientRect();
			zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, transform.scale * factor);
		},
		[transform.scale, zoomAt],
	);

	const resetView = useCallback(() => {
		setTransform({ x: 0, y: 0, scale: 1 });
	}, []);

	useEffect(() => {
		setTransform({ x: 0, y: 0, scale: 1 });
		panRef.current = null;
		setPanning(false);
		setSpaceDown(false);
	}, [activeTab]);

	useEffect(() => {
		const isTypingTarget = (target: EventTarget | null) => {
			if (!(target instanceof HTMLElement)) return false;
			return (
				target.isContentEditable ||
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.tagName === "SELECT"
			);
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (isTypingTarget(event.target)) return;
			if (event.code === "Space") {
				event.preventDefault();
				setSpaceDown(true);
				return;
			}
			if (event.key === "+" || event.key === "=") {
				event.preventDefault();
				zoomFromCenter(ZOOM_STEP);
				return;
			}
			if (event.key === "-" || event.key === "_") {
				event.preventDefault();
				zoomFromCenter(1 / ZOOM_STEP);
				return;
			}
			if (event.key === "0") {
				event.preventDefault();
				resetView();
			}
		};

		const onKeyUp = (event: KeyboardEvent) => {
			if (event.code === "Space") {
				setSpaceDown(false);
			}
		};

		const onWindowBlur = () => {
			panRef.current = null;
			setPanning(false);
			setSpaceDown(false);
		};

		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
		window.addEventListener("blur", onWindowBlur);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
			window.removeEventListener("blur", onWindowBlur);
		};
	}, [resetView, zoomFromCenter]);

	const beginPan = (event: React.PointerEvent<HTMLDivElement>) => {
		const wantsPan = spaceDown || event.button === 1 || event.button === 2;
		if (!wantsPan) return;
		event.preventDefault();
		event.currentTarget.setPointerCapture(event.pointerId);
		panRef.current = {
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startClientY: event.clientY,
			startX: transform.x,
			startY: transform.y,
		};
		setPanning(true);
	};

	const movePan = (event: React.PointerEvent<HTMLDivElement>) => {
		const pan = panRef.current;
		if (!pan || pan.pointerId !== event.pointerId) return;
		event.preventDefault();
		setTransform((current) => ({
			...current,
			x: pan.startX + event.clientX - pan.startClientX,
			y: pan.startY + event.clientY - pan.startClientY,
		}));
	};

	const endPan = (event: React.PointerEvent<HTMLDivElement>) => {
		if (panRef.current?.pointerId === event.pointerId) {
			panRef.current = null;
			setPanning(false);
		}
	};

	const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
		event.preventDefault();
		const factor = Math.exp(-event.deltaY * 0.0012);
		zoomAt(event.clientX, event.clientY, transform.scale * factor);
	};

	return (
		<Box style={surfaceStyle}>
			<style>{`
				@media (max-width: 900px) {
					.cmp-canvas-toolbar-right { display: none !important; }
					.cmp-canvas-toolbar-short { display: flex !important; }
				}
				@media (max-width: 1180px) {
					.cmp-workflow-layout { flex-direction: column !important; overflow: auto !important; }
					.cmp-workflow-inline-panel { border-left: 0 !important; border-top: 1px solid var(--ax-colors-border-tertiary) !important; flex: 0 0 auto !important; min-height: 560px !important; width: 100% !important; }
					.cmp-workflow-canvas-column { flex: 0 0 620px !important; }
				}
			`}</style>
			<Toolbar
				activeTab={activeTab}
				onSceneChange={onSceneChange}
				onTabChange={onTabChange}
				showRationale={showRationale}
				showWorkflow={showWorkflow}
			/>
			<Box style={canvasBodyStyle}>
				<div
					ref={viewportRef}
					data-cmp-canvas-viewport="true"
					onContextMenu={(event) => {
						if (panRef.current || panning) event.preventDefault();
					}}
					onPointerCancel={endPan}
					onPointerDown={beginPan}
					onPointerLeave={endPan}
					onPointerMove={movePan}
					onPointerUp={endPan}
					onWheel={handleWheel}
					style={{ ...canvasViewportStyle, cursor: panning ? "grabbing" : spaceDown ? "grab" : "default" }}
				>
					<div
						style={{
							...canvasWorldStyle,
							transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
						}}
					>
						{children}
					</div>
				</div>
				<Box
					bg="bg.default"
					border="1"
					borderColor="border.secondary"
					rounded="md"
					shadow="sm"
					display="flex"
					alignItems="center"
					gap="4"
					px="6"
					py="4"
					style={{ bottom: 14, left: 14, position: "absolute", zIndex: 5 }}
				>
					<Button appearance="subtle" size="sm" icon={<IconMagnifyingGlassMinus size={14} />} aria-label="Zoom out" onClick={() => zoomFromCenter(1 / ZOOM_STEP)} />
					<Button appearance="subtle" size="sm" onClick={resetView}>
						{Math.round(transform.scale * 100)}%
					</Button>
					<Button appearance="subtle" size="sm" icon={<IconMagnifyingGlassPlus size={14} />} aria-label="Zoom in" onClick={() => zoomFromCenter(ZOOM_STEP)} />
					<Text fontSize="sm" color="fg.tertiary" style={{ paddingRight: 4 }}>
						Space + drag
					</Text>
				</Box>
			</Box>
		</Box>
	);
}

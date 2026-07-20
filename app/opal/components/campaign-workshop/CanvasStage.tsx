"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button } from "@optiaxiom/react";
import { IconMagnifyingGlassMinus, IconMagnifyingGlassPlus } from "@optiaxiom/icons";
import { Text } from "@/app/components/Text";
import { useLayout } from "@/app/context/LayoutContext";
import { Toolbar } from "./Toolbar";
import { EditPopover } from "./EditPopover";
import type { EditPin } from "./CampaignWorkshopCanvas";

export type ContentTab = "blog" | "social" | "email";
type CanvasTransform = { x: number; y: number; scale: number };
// A pin being placed but not yet confirmed — world coords for where it'll
// land, client coords for where to anchor the "describe your edit" popover
// (a fixed overlay, independent of pan/zoom).
type DraftPin = { clientX: number; clientY: number; label: string; x: number; y: number };

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 1.15;
const POPOVER_WIDTH = 320;
const POPOVER_HEIGHT_ESTIMATE = 220;

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

// Clamps a fixed-position overlay's top-left so it can't render off-screen.
function clampToViewport(x: number, y: number) {
	const maxX = typeof window !== "undefined" ? window.innerWidth - POPOVER_WIDTH - 16 : x;
	const maxY = typeof window !== "undefined" ? window.innerHeight - POPOVER_HEIGHT_ESTIMATE - 16 : y;
	return { x: Math.min(Math.max(x, 16), Math.max(maxX, 16)), y: Math.min(Math.max(y, 16), Math.max(maxY, 16)) };
}

export function CanvasStage({
	activeTab,
	children,
	commentMode,
	onAddPin,
	onAskOpal,
	onClose,
	onOpenWorkflow,
	onRemovePin,
	onRunQueuedEdits,
	onTabChange,
	onToggleCommentMode,
	onToggleRationale,
	onUpdatePin,
	pins,
	showRationale,
	showWorkflow = false,
}: {
	activeTab: ContentTab;
	children: React.ReactNode;
	commentMode: boolean;
	onAddPin: (label: string, x: number, y: number, description: string) => void;
	onAskOpal: () => void;
	onClose: () => void;
	onOpenWorkflow: () => void;
	onRemovePin: (id: string) => void;
	onRunQueuedEdits: () => void;
	onTabChange: (tab: ContentTab) => void;
	onToggleCommentMode: () => void;
	onToggleRationale: () => void;
	onUpdatePin: (id: string, description: string) => void;
	pins: EditPin[];
	showRationale: boolean;
	showWorkflow?: boolean;
}) {
	// The real Opal panel (app/components/OpalPanel.tsx) is a fixed overlay
	// that doesn't reflow this fullscreen canvas on its own — without this,
	// centered content (e.g. BlogPost's `margin: 0 auto` article) centers
	// against the FULL viewport width and can render underneath the panel.
	// opalPanelWidth is already published by OpalPanel via setOpalPanelWidth,
	// so inset the pannable area by that amount whenever it's open.
	const { opalPanelWidth } = useLayout();
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
	const [draftPin, setDraftPin] = useState<DraftPin | null>(null);
	const [editingPinId, setEditingPinId] = useState<string | null>(null);

	const clampScale = useCallback((scale: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale)), []);

	// Screen point -> world point, using the canvas's current pan/zoom — the
	// same inversion zoomAt() below already relies on to zoom at the cursor.
	const toWorldPoint = useCallback(
		(clientX: number, clientY: number) => {
			const viewport = viewportRef.current;
			if (!viewport) return { x: 0, y: 0 };
			const rect = viewport.getBoundingClientRect();
			return {
				x: (clientX - rect.left - transform.x) / transform.scale,
				y: (clientY - rect.top - transform.y) / transform.scale,
			};
		},
		[transform],
	);

	// World point -> screen point (the inverse), for anchoring an existing
	// pin's popover at its current on-screen position.
	const toScreenPoint = useCallback(
		(worldX: number, worldY: number) => {
			const viewport = viewportRef.current;
			if (!viewport) return { x: 0, y: 0 };
			const rect = viewport.getBoundingClientRect();
			return {
				x: rect.left + worldX * transform.scale + transform.x,
				y: rect.top + worldY * transform.scale + transform.y,
			};
		},
		[transform],
	);

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
		setDraftPin(null);
		setEditingPinId(null);
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

	// Universal pin placement: while the comment tool is active, a click
	// anywhere on the canvas content (image, text, blank page area) drops a
	// numbered pin exactly there — not gated to a specific element. Runs on
	// the capture phase so it fires before a clicked element's own handler
	// (e.g. EditableText's click-to-edit), which it then suppresses via
	// stopPropagation. Clicks on an existing pin badge are left alone so the
	// badge's own click handler can open that pin's popover instead.
	const handleCanvasClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
		if (!commentMode) return;
		const target = event.target as HTMLElement;
		if (target.closest("[data-pin-badge]")) return;
		event.preventDefault();
		event.stopPropagation();
		const label = target.closest<HTMLElement>("[data-edit-label]")?.dataset.editLabel ?? "Page Content";
		const { x, y } = toWorldPoint(event.clientX, event.clientY);
		setDraftPin({ clientX: event.clientX, clientY: event.clientY, label, x, y });
	};

	const editingPin = editingPinId ? pins.find((pin) => pin.id === editingPinId) ?? null : null;
	const editingPinScreen = editingPin ? toScreenPoint(editingPin.x, editingPin.y) : null;

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
				commentMode={commentMode}
				onAskOpal={onAskOpal}
				onClose={onClose}
				onOpenWorkflow={onOpenWorkflow}
				onRunQueuedEdits={onRunQueuedEdits}
				onTabChange={onTabChange}
				onToggleCommentMode={onToggleCommentMode}
				onToggleRationale={onToggleRationale}
				queuedEditsCount={pins.length}
				showRationale={showRationale}
				showWorkflow={showWorkflow}
			/>
			<Box style={{ ...canvasBodyStyle, paddingRight: opalPanelWidth }}>
				<div
					ref={viewportRef}
					data-cmp-canvas-viewport="true"
					onClickCapture={handleCanvasClickCapture}
					onContextMenu={(event) => {
						if (panRef.current || panning) event.preventDefault();
					}}
					onPointerCancel={endPan}
					onPointerDown={beginPan}
					onPointerLeave={endPan}
					onPointerMove={movePan}
					onPointerUp={endPan}
					onWheel={handleWheel}
					style={{ ...canvasViewportStyle, cursor: commentMode ? "crosshair" : panning ? "grabbing" : spaceDown ? "grab" : "default" }}
				>
					<div
						style={{
							...canvasWorldStyle,
							transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
						}}
					>
						{children}
						{pins.map((pin) => (
							<button
								key={pin.id}
								data-pin-badge="true"
								type="button"
								aria-label={`Edit ${pin.label}`}
								onClick={() => setEditingPinId(pin.id)}
								style={{
									alignItems: "center",
									background: "var(--ax-colors-fg-default)",
									border: "2px solid var(--ax-colors-bg-default)",
									borderRadius: "50%",
									boxShadow: "0 1px 4px rgba(16,24,40,0.3)",
									color: "var(--ax-colors-fg-default-inverse)",
									cursor: "pointer",
									display: "flex",
									fontSize: 12,
									fontWeight: 700,
									height: 24,
									justifyContent: "center",
									left: pin.x,
									position: "absolute",
									top: pin.y,
									transform: "translate(-50%, -50%)",
									width: 24,
									zIndex: 10,
								}}
							>
								{pin.number}
							</button>
						))}
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
						{commentMode ? "Click to comment" : "Space + drag"}
					</Text>
				</Box>

				{draftPin && (
					(() => {
						const anchor = clampToViewport(draftPin.clientX, draftPin.clientY);
						return (
							<Box style={{ left: anchor.x, position: "fixed", top: anchor.y, zIndex: 30 }}>
								<EditPopover
									title={`Edit ${draftPin.label}`}
									onCancel={() => setDraftPin(null)}
									onSubmit={(description) => {
										onAddPin(draftPin.label, draftPin.x, draftPin.y, description);
										setDraftPin(null);
									}}
								/>
							</Box>
						);
					})()
				)}

				{editingPin && editingPinScreen && (
					(() => {
						const anchor = clampToViewport(editingPinScreen.x, editingPinScreen.y);
						return (
							<Box style={{ left: anchor.x, position: "fixed", top: anchor.y, zIndex: 30 }}>
								<EditPopover
									initialValue={editingPin.description}
									title={`Edit ${editingPin.label}`}
									onCancel={() => setEditingPinId(null)}
									onRemove={() => {
										onRemovePin(editingPin.id);
										setEditingPinId(null);
									}}
									onSubmit={(description) => {
										onUpdatePin(editingPin.id, description);
										setEditingPinId(null);
									}}
								/>
							</Box>
						);
					})()
				)}
			</Box>
		</Box>
	);
}

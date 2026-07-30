"use client";

import React, {CSSProperties, MouseEvent, ReactNode, WheelEvent, useEffect, useLayoutEffect, useRef, useState} from "react";
import {Box, Text} from "@optiaxiom/react";

export type StorybookTileThumbnail = string | ReactNode;

function renderThumbnail(thumb: StorybookTileThumbnail | undefined, label: string): ReactNode {
	if (thumb == null) return null;
	if (typeof thumb === "string") {
		return (
			<img
				src={thumb}
				alt={label}
				style={{maxWidth: "100%", maxHeight: "100%", objectFit: "contain"}}
			/>
		);
	}
	return thumb;
}

/** Scale and offset values for fitting a story iframe inside a tile of `tileSize` px.
 *  Pass `nativeSize` from `STORY_SIZES` for accurate scaling; falls back to 300×300. */
export function iframeStyleForTileSize(
	tileSize: number,
	nativeSize?: {w: number; h: number}
): CSSProperties {
	const nW = nativeSize?.w ?? 300;
	const nH = nativeSize?.h ?? 300;
	const scale = Math.min(tileSize / nW, tileSize / nH);
	const scaledW = nW * scale;
	const scaledH = nH * scale;
	const left = (tileSize - scaledW) / 2;
	const top = (tileSize - scaledH) / 2;
	return {
		position: "absolute",
		top,
		left,
		width: nW,
		height: nH,
		transform: `scale(${scale.toFixed(4)})`,
		transformOrigin: "top left",
		pointerEvents: "none",
		border: "none",
	};
}

type StorybookTileProps = {
	label: string;
	icon?: ReactNode;
	/**
	 * Multi-URL mode — all template URLs pre-rendered and kept alive.
	 * Only the active one is visible; cycling plays slide-in + slide-out animations
	 * without ever reloading an iframe.
	 */
	urls?: string[];
	activeUrlIndex?: number;
	/** Slide direction when `activeUrlIndex` changes: 1 = next (up), -1 = prev (down). */
	animDir?: 1 | -1;
	/** Single-URL mode (ElementEditor / no template variants). */
	storybookUrl?: string;
	thumbnail?: StorybookTileThumbnail;
	isSelected?: boolean;
	/** Override iframe CSS. Use `iframeStyleForTileSize(px)` to compute values. Defaults to 130px. */
	iframeStyle?: CSSProperties;
	/** Single-URL mode animation — re-mounts the wrapper div. Unused in multi-URL mode. */
	iframeAnimKey?: {key: number; dir: 1 | -1};
	onClick: (e: MouseEvent<HTMLButtonElement>) => void;
	onWheel?: (e: WheelEvent<HTMLButtonElement>) => void;
	/** Rendered inside the tile box — use for HoverCard triggers, variant menus, etc. */
	overlayContent?: ReactNode;
};

export const StorybookTile: React.FC<StorybookTileProps> = ({
	label,
	icon,
	urls,
	activeUrlIndex = 0,
	animDir,
	storybookUrl,
	thumbnail,
	isSelected = false,
	iframeStyle,
	iframeAnimKey,
	onClick,
	onWheel,
	overlayContent,
}) => {
	const resolvedIframeStyle: CSSProperties = iframeStyle ?? iframeStyleForTileSize(130);
	const useMultiUrl = !!urls?.length;

	// Internal active index — lags one render behind the prop so the exiting frame
	// stays visible long enough to animate out.
	const [activeIdx, setActiveIdx] = useState(activeUrlIndex);
	const [exitingIdx, setExitingIdx] = useState<number | null>(null);
	const prevPropRef = useRef(activeUrlIndex);
	const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	// Per-index refs to the wrapper divs so we can replay CSS animations imperatively.
	const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);

	// Detect prop change → begin a transition
	useEffect(() => {
		if (!useMultiUrl || activeUrlIndex === prevPropRef.current) return;
		const oldIdx = prevPropRef.current;
		prevPropRef.current = activeUrlIndex;

		if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
		// Batch: make new frame visible and mark old frame as exiting.
		setActiveIdx(activeUrlIndex);
		setExitingIdx(oldIdx);
		exitTimerRef.current = setTimeout(() => setExitingIdx(null), 160);
		return () => {
			if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
		};
	}, [activeUrlIndex, useMultiUrl]);

	// Apply CSS animations before the browser paints so stale `forwards`-fill
	// classes never flash on screen when a frame switches roles.
	const ALL_ANIM = ["vb-slide-in-up", "vb-slide-in-down", "vb-slide-out-up", "vb-slide-out-down"];
	useLayoutEffect(() => {
		if (!useMultiUrl || exitingIdx === null) return;
		const enterEl = wrapperRefs.current[activeIdx];
		const exitEl = wrapperRefs.current[exitingIdx];
		if (enterEl) {
			enterEl.classList.remove(...ALL_ANIM);
			void enterEl.offsetWidth;
			if (animDir) enterEl.classList.add(animDir === 1 ? "vb-slide-in-up" : "vb-slide-in-down");
		}
		if (exitEl) {
			exitEl.classList.remove(...ALL_ANIM);
			void exitEl.offsetWidth;
			if (animDir) exitEl.classList.add(animDir === 1 ? "vb-slide-out-up" : "vb-slide-out-down");
		}
	}, [activeIdx, exitingIdx, animDir, useMultiUrl]);

	return (
		<button
			type="button"
			onClick={onClick}
			onWheel={onWheel}
			className="group flex flex-col items-stretch gap-1.5 rounded cursor-pointer transition-colors"
		>
			<Box
				bg="bg.secondary"
				border="1"
				rounded="md"
				borderColor={isSelected ? "border.control" : "border.tertiary"}
				className={`relative w-full aspect-square flex items-center justify-center overflow-hidden transition-shadow ${
					isSelected
						? "ring-2 ring-[var(--ax-colors-border-focus)] ring-offset-2"
						: "group-hover:shadow-[0_0_0_2px_var(--ax-colors-border-default)]"
				}`}
			>
				{useMultiUrl ? (
					urls!.map((url, i) => {
						const isActive = i === activeIdx;
						const isExiting = i === exitingIdx;
						return (
							<div
								key={i}
								ref={(el) => {
									wrapperRefs.current[i] = el;
								}}
								style={{
									position: "absolute",
									inset: 0,
									display: isActive || isExiting ? "block" : "none",
								}}
							>
								<iframe
									src={url}
									loading="eager"
									title={label}
									style={resolvedIframeStyle}
								/>
							</div>
						);
					})
				) : storybookUrl ? (
					<div
						key={iframeAnimKey?.key ?? 0}
						className={
							iframeAnimKey?.dir === 1
								? "vb-slide-in-up"
								: iframeAnimKey?.dir === -1
									? "vb-slide-in-down"
									: undefined
						}
						style={{position: "absolute", inset: 0}}
					>
						<iframe
							src={storybookUrl}
							loading="eager"
							title={label}
							style={resolvedIframeStyle}
						/>
					</div>
				) : (
					renderThumbnail(thumbnail, label)
				)}
				{overlayContent}
			</Box>
			<Box display="flex" alignItems="center" justifyContent="center" gap="4">
				{icon && <span style={{display: "inline-flex", flexShrink: 0}}>{icon}</span>}
				<Text fontSize="sm" fontWeight={isSelected ? "500" : undefined}>
					{label}
				</Text>
			</Box>
		</button>
	);
};

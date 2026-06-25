"use client";

import {Box, Text} from "@optiaxiom/react";
import type {CSSProperties, MouseEvent, ReactNode, WheelEvent} from "react";
import {useEffect, useLayoutEffect, useRef, useState} from "react";

/** Default iframe scaling: renders at 3× and shrinks to fit. */
export const DEFAULT_IFRAME_STYLE: CSSProperties = {
	position: "absolute",
	top: 0,
	left: 0,
	width: "300%",
	height: "300%",
	border: "none",
	pointerEvents: "none",
	transform: "scale(0.333)",
	transformOrigin: "top left",
};

/** Precise iframe scaling for a fixed-size tile when native story dimensions are known. */
export function iframeStyleForTileSize(
	tileW: number,
	tileH: number,
	nativeSize?: {w: number; h: number}
): CSSProperties {
	const nW = nativeSize?.w ?? 300;
	const nH = nativeSize?.h ?? 300;
	const scale = Math.min(tileW / nW, tileH / nH);
	return {
		position: "absolute",
		top: (tileH - nH * scale) / 2,
		left: (tileW - nW * scale) / 2,
		width: nW,
		height: nH,
		transform: `scale(${scale.toFixed(4)})`,
		transformOrigin: "top left",
		pointerEvents: "none",
		border: "none",
	};
}

const STRIDE_STORYBOOK_BASE = "https://stide-mock.vercel.app/storybook";

/** Convert a Storybook manager URL (?path=/story/...) to an isolated iframe URL. */
export function toIsolatedStoryUrl(storybookUrl: string): string {
	try {
		const url = new URL(storybookUrl);
		const pathParam = url.searchParams.get("path");
		if (!pathParam?.startsWith("/story/")) return storybookUrl;
		const storyId = pathParam.replace("/story/", "");
		const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
		const base = isLocal
			? STRIDE_STORYBOOK_BASE
			: `${url.origin}${url.pathname.replace(/\/?$/, "")}`;
		return `${base}/iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story`;
	} catch {
		return storybookUrl;
	}
}

/** Derive a variant's iframe URL by swapping the story slug suffix (e.g. `--h-1` → `--h-2`). */
export function deriveVariantStoryUrl(baseUrl: string, templateValue: string): string {
	const stripSuffix = (slug: string) => {
		const i = slug.lastIndexOf("--");
		return i >= 0 ? slug.slice(0, i) : slug;
	};
	try {
		const url = new URL(baseUrl);
		const pathParam = url.searchParams.get("path");
		if (pathParam?.startsWith("/story/")) {
			const slugBase = stripSuffix(pathParam.replace("/story/", ""));
			url.searchParams.set("path", `/story/${slugBase}--${templateValue}`);
			return url.toString();
		}
		const idParam = url.searchParams.get("id");
		if (idParam) {
			url.searchParams.set("id", `${stripSuffix(idParam)}--${templateValue}`);
			return url.toString();
		}
	} catch {}
	return baseUrl;
}

const ALL_ANIM = ["vb-slide-in-up", "vb-slide-in-down", "vb-slide-out-up", "vb-slide-out-down"];

type Props = {
	label: string;
	fallbackIcon?: ReactNode;
	isSelected?: boolean;
	onClick: (e: MouseEvent) => void;
	onWheel?: (e: WheelEvent<HTMLElement>) => void;
	previewHeight?: number;
	/** Slot rendered below the label, inside the card border. */
	footer?: ReactNode;
	/** Rendered on top of the preview area. Use for action buttons, hover cards, etc. */
	overlayContent?: ReactNode;

	// ── Single-URL mode ──────────────────────────────────────────────────────
	storybookUrl?: string | null;

	// ── Multi-URL mode (pre-renders all URLs, animates between them) ─────────
	urls?: string[];
	activeUrlIndex?: number;
	/** Slide direction when activeUrlIndex changes: 1 = next (up), -1 = prev (down). */
	animDir?: 1 | -1;

	// ── Custom iframe scaling (overrides DEFAULT_IFRAME_STYLE) ───────────────
	iframeStyle?: CSSProperties;
};

export function PreviewCard({
	label,
	fallbackIcon,
	isSelected = false,
	onClick,
	onWheel,
	previewHeight = 160,
	footer,
	overlayContent,
	storybookUrl,
	urls,
	activeUrlIndex = 0,
	animDir,
	iframeStyle,
}: Props) {
	const useMultiUrl = !!urls?.length;
	const resolvedIframeStyle = iframeStyle ?? DEFAULT_IFRAME_STYLE;

	// ── Multi-URL animation state ─────────────────────────────────────────────
	const [activeIdx, setActiveIdx] = useState(activeUrlIndex);
	const [exitingIdx, setExitingIdx] = useState<number | null>(null);
	const prevPropRef = useRef(activeUrlIndex);
	const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);

	useEffect(() => {
		if (!useMultiUrl || activeUrlIndex === prevPropRef.current) return;
		const oldIdx = prevPropRef.current;
		prevPropRef.current = activeUrlIndex;
		if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
		setActiveIdx(activeUrlIndex);
		setExitingIdx(oldIdx);
		exitTimerRef.current = setTimeout(() => setExitingIdx(null), 160);
		return () => {
			if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
		};
	}, [activeUrlIndex, useMultiUrl]);

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
		<Box
			onClick={onClick}
			onWheel={onWheel}
			rounded="lg"
			className="group"
			style={{
				cursor: "pointer",
				border: `1px solid ${isSelected ? "var(--ax-colors-border-focus)" : "var(--ax-colors-border-default)"}`,
				overflow: "hidden",
				boxShadow: isSelected ? "0 0 0 2px var(--ax-colors-border-focus)" : undefined,
			}}
		>
			<Box
				bg="bg.secondary"
				style={{height: previewHeight, overflow: "hidden", position: "relative"}}
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
								<iframe src={url} loading="eager" title={label} style={resolvedIframeStyle} />
							</div>
						);
					})
				) : storybookUrl ? (
					<>
						<iframe src={storybookUrl} title={label} style={resolvedIframeStyle} />
						<Box style={{position: "absolute", inset: 0}} />
					</>
				) : fallbackIcon ? (
					<Box
						display="flex"
						alignItems="center"
						justifyContent="center"
						style={{height: "100%"}}
					>
						{fallbackIcon}
					</Box>
				) : null}
				{overlayContent}
			</Box>
			<Box p="8" style={{borderTop: "1px solid var(--ax-colors-border-default)"}}>
				<Text fontWeight={isSelected ? "500" : undefined} fontSize="sm">
					{label}
				</Text>
			</Box>
			{footer && (
				<Box style={{borderTop: "1px solid var(--ax-colors-border-default)"}}>
					{footer}
				</Box>
			)}
		</Box>
	);
}

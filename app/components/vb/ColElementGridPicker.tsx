import React, {ReactNode, useEffect, useMemo, useState} from "react";
import {createPortal} from "react-dom";
import * as RawPopover from "@radix-ui/react-popover";
import {Box, Popover, PopoverContent, PopoverTrigger, SearchInput, Text} from "@optiaxiom/react";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@optiaxiom/react/unstable";
import {IconBook, IconPaint, IconX, IconCheck} from "@tabler/icons-react";
import {PreviewCard, iframeStyleForTileSize} from "@/app/components/PreviewCard";
import {STORY_SIZES} from "./storySizes";
import {Button} from "../Button";

type ElementOption = {type: string; label: string};
type TemplateOption = {label: string; value: string};

type ColElementGridPickerProps = {
	elementOptions: ElementOption[];
	addElement: (type: string, initialProps?: Record<string, any>) => void;
	iconForType: (type: string) => ReactNode;
	trigger: ReactNode;
	storybookUrls?: Record<string, string>;
	attemptedUrls?: Record<string, string>;
	templateOptionsByType?: Record<string, TemplateOption[]>;
	storybookUrlsByTemplate?: Record<string, Record<string, string>>;
	onOpenChange?: (open: boolean) => void;
};

/** Convert a Storybook `iframe.html?id=…` (or `?path=…`) URL into the matching
 *  full-UI Storybook URL (drops `iframe.html`, normalises to `?path=/story/…`). */
function toStorybookFullUrl(iframeUrl: string): string {
	try {
		const u = new URL(iframeUrl);
		const id = u.searchParams.get("id");
		const path = u.searchParams.get("path");
		u.pathname = u.pathname.replace(/iframe\.html$/, "");
		const params = new URLSearchParams();
		if (path) params.set("path", path);
		else if (id) params.set("path", `/story/${id}`);
		u.search = params.toString() ? `?${params.toString()}` : "";
		return u.toString();
	} catch {
		return iframeUrl;
	}
}

const ColElementGridPicker: React.FC<ColElementGridPickerProps> = ({
	elementOptions,
	addElement,
	iconForType,
	trigger,
	storybookUrls,
	attemptedUrls,
	templateOptionsByType,
	storybookUrlsByTemplate,
	onOpenChange,
}) => {
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [selectedTemplates, setSelectedTemplates] = useState<Record<string, string>>({});
	const [previewByType, setPreviewByType] = useState<Record<string, string>>({});
	const [animDirByType, setAnimDirByType] = useState<Record<string, 1 | -1>>({});

	/** All preloaded URLs for a tile — one per template option. */
	const getAllUrls = (type: string): string[] | undefined => {
		const tOpts = templateOptionsByType?.[type];
		if (!tOpts?.length) {
			const url = storybookUrls?.[type];
			return url ? [url] : undefined;
		}
		return tOpts.map(
			(t) => storybookUrlsByTemplate?.[type]?.[t.value] ?? storybookUrls?.[type] ?? ""
		);
	};

	/** Index into `getAllUrls(type)` for the currently active template. */
	const getActiveIndex = (type: string): number => {
		const tOpts = templateOptionsByType?.[type];
		if (!tOpts?.length) return 0;
		const active = previewByType[type] ?? selectedTemplates[type] ?? tOpts[0].value;
		const idx = tOpts.findIndex((t) => t.value === active);
		return idx >= 0 ? idx : 0;
	};

	const handleOptionHover = (type: string, value: string, newIdx: number) => {
		const tOpts = templateOptionsByType?.[type] ?? [];
		const currentValue = previewByType[type] ?? selectedTemplates[type] ?? tOpts[0]?.value;
		const currentIdx = tOpts.findIndex((t) => t.value === currentValue);
		const dir: 1 | -1 = newIdx > currentIdx ? 1 : -1;
		setPreviewByType((prev) => ({...prev, [type]: value}));
		setAnimDirByType((prev) => ({...prev, [type]: dir}));
	};

	const clearPreview = (type: string) => {
		setPreviewByType((prev) => {
			const next = {...prev};
			delete next[type];
			return next;
		});
		setAnimDirByType((prev) => {
			const next = {...prev};
			delete next[type];
			return next;
		});
	};

	const [templateMenuType, setTemplateMenuType] = useState<string | null>(null);
	const [fullPreviewType, setFullPreviewType] = useState<string | null>(null);
	// Drives the entrance animation: false on mount, flipped to true on next frame
	// so the scale+fade transition runs once the overlay is in the DOM.
	const [fullPreviewMounted, setFullPreviewMounted] = useState(false);
	// SSR-safe portal gate — only render the portal after first client mount,
	// otherwise document is undefined and createPortal throws.
	const [hasDocument, setHasDocument] = useState(false);
	useEffect(() => setHasDocument(true), []);

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		onOpenChange?.(next);
		if (!next) setInputValue("");
	};

	// With forceMount the SearchInput is always in DOM; focus it manually on open.
	useEffect(() => {
		if (!open) return;
		const t = setTimeout(() => {
			(
				document.getElementById("vb-element-picker-search") as HTMLInputElement | null
			)?.focus();
		}, 50);
		return () => clearTimeout(t);
	}, [open]);

	const closeFullPreview = () => setFullPreviewType(null);

	// Trigger entrance once the overlay has rendered with the closed transform.
	useEffect(() => {
		if (!fullPreviewType) {
			setFullPreviewMounted(false);
			return;
		}
		const id = requestAnimationFrame(() => setFullPreviewMounted(true));
		return () => cancelAnimationFrame(id);
	}, [fullPreviewType]);

	// ESC to close the full-page overlay.
	useEffect(() => {
		if (!fullPreviewType) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") closeFullPreview();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [fullPreviewType]);

	const fullPreviewOption = fullPreviewType
		? elementOptions.find((o) => o.type === fullPreviewType)
		: undefined;
	const fullPreviewIframeUrl = fullPreviewType
		? (getAllUrls(fullPreviewType) ?? [])[getActiveIndex(fullPreviewType)]
		: undefined;
	const fullPreviewStoryUrl = fullPreviewIframeUrl
		? toStorybookFullUrl(fullPreviewIframeUrl)
		: undefined;

	const handleSelect = (type: string) => {
		handleOpenChange(false);
		const sel = selectedTemplates[type] ?? templateOptionsByType?.[type]?.[0]?.value;
		addElement(type, sel ? {template: sel} : undefined);
	};

	const filteredOptions = useMemo(() => {
		const q = inputValue.trim().toLowerCase();
		if (!q) return elementOptions;
		return elementOptions.filter((opt) => opt.label.toLowerCase().includes(q));
	}, [elementOptions, inputValue]);

	return (
		<>
			<RawPopover.Root open={open} onOpenChange={handleOpenChange}>
				<RawPopover.Trigger asChild>{trigger}</RawPopover.Trigger>
				<RawPopover.Portal>
					<RawPopover.Content
						forceMount
						side="top"
						align="start"
						sideOffset={4}
						className="vb-picker-content"
						onClick={(e) => e.stopPropagation()}
						style={{
							padding: 8,
							width: 560,
							background: "var(--ax-colors-bg-default)",
							border: "1px solid var(--ax-colors-border-tertiary)",
							borderRadius: 8,
							boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
							zIndex: 50,
							outline: "none",
						}}
					>
						<Box mb="8" px="4">
							<Text
								fontSize="sm"
								color="fg.tertiary"
								fontFamily="mono"
								textTransform="uppercase"
							>
								Add Element
							</Text>
						</Box>
						<Box mb="8">
							<SearchInput
								id="vb-element-picker-search"
								placeholder="Filter..."
								value={inputValue}
								onValueChange={setInputValue}
								onValueClear={() => setInputValue("")}
							/>
						</Box>
						{filteredOptions.length === 0 ? (
							<Box py="8" textAlign="center">
								<Text fontSize="sm" color="fg.tertiary">
									No matching elements
								</Text>
							</Box>
						) : (
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(3, 1fr)",
									gap: 8,
								}}
							>
								{filteredOptions.map((opt, idx) => {
									// HoverCard offsets anchored to picker top-right.
									// Layout: 560px popover, 8px padding, 3-col grid (8px gap, ~176px tiles).
									const col = idx % 3;
									const row = Math.floor(idx / 3);
									const TILE_W = 176;
									const TILE_H = 100;
									const previewSideOffset = 560 - 8 - (col * (TILE_W + 8)) - TILE_W + 8;
									const previewAlignOffset = -(TILE_H + 28 + 8 + row * (TILE_H + 28 + 8));
									const tOpts = templateOptionsByType?.[opt.type];
									const hasTemplates = !!tOpts && tOpts.length > 1;
									const selectedTemplate =
										selectedTemplates[opt.type] ?? tOpts?.[0]?.value;
									const tileUrls = getAllUrls(opt.type);
									const tileActiveIndex = getActiveIndex(opt.type);
									const tileAnimDir = animDirByType[opt.type];

									return (
										<PreviewCard
											key={opt.type}
											label={opt.label}
											fallbackIcon={iconForType(opt.type)}
											urls={tileUrls}
											activeUrlIndex={tileActiveIndex}
											animDir={tileAnimDir}
											iframeStyle={iframeStyleForTileSize(
												TILE_W,
												TILE_H,
												STORY_SIZES[opt.type]
											)}
											previewHeight={TILE_H}
											onClick={(e) => {
												e.stopPropagation();
												handleSelect(opt.type);
											}}
											onWheel={(e) => {
												if (!hasTemplates || !tOpts) return;
												const i = tOpts.findIndex(
													(t) => t.value === selectedTemplate
												);
												const dir: 1 | -1 = e.deltaY > 0 ? 1 : -1;
												const next =
													dir === 1
														? (i + 1) % tOpts.length
														: (i - 1 + tOpts.length) % tOpts.length;
												setSelectedTemplates((prev) => ({
													...prev,
													[opt.type]: tOpts[next].value,
												}));
												setAnimDirByType((prev) => ({
													...prev,
													[opt.type]: dir,
												}));
											}}
											overlayContent={
												<>
													<HoverCard openDelay={120} closeDelay={80}>
														<HoverCardTrigger asChild>
															<span
																role="button"
																aria-label={`Preview ${opt.label}`}
																onClick={(e) => {
																	e.stopPropagation();
																	handleOpenChange(false);
																	setFullPreviewType(opt.type);
																}}
																className="absolute top-1 right-1 transition-opacity duration-500 group-hover:opacity-50 flex items-center justify-center w-5 h-5 rounded bg-[var(--ax-colors-fg-default)] text-[var(--ax-colors-bg-default)] group-hover:hover:opacity-100 opacity-0 shadow-sm"
															>
																<IconBook size={16} />
															</span>
														</HoverCardTrigger>
														<HoverCardContent
															side="right"
															align="start"
															sideOffset={previewSideOffset}
															alignOffset={previewAlignOffset}
															onClick={(e) => e.stopPropagation()}
															style={{
																padding: 0,
																width: 480,
																height: 320,
																overflow: "hidden",
															}}
														>
															<Box
																borderColor="border.tertiary"
																borderB="1"
																px="12"
																py="8"
																bg="bg.default"
															>
																<Text
																	fontSize="sm"
																	color="fg.default"
																	fontWeight="500"
																>
																	{opt.label}
																</Text>
															</Box>
															{tileUrls?.[tileActiveIndex] ? (
																<iframe
																	src={tileUrls[tileActiveIndex]}
																	title={`Storybook preview: ${opt.type}`}
																	style={{
																		width: "100%",
																		height: "calc(100% - 33px)",
																		border: 0,
																		background:
																			"var(--ax-colors-bg-default)",
																	}}
																/>
															) : (
																<Box
																	px="16"
																	textAlign="center"
																	style={{
																		height: "calc(100% - 33px)",
																		display: "flex",
																		alignItems: "center",
																		justifyContent: "center",
																	}}
																>
																	<Text
																		fontSize="sm"
																		color="fg.tertiary"
																	>
																		No Storybook URL for{" "}
																		{opt.type}
																		{attemptedUrls?.[opt.type] && (
																			<div
																				style={{
																					fontSize: "10px",
																					marginTop: "4px",
																					wordBreak: "break-all",
																				}}
																			>
																				{attemptedUrls[opt.type]}
																			</div>
																		)}
																	</Text>
																</Box>
															)}
														</HoverCardContent>
													</HoverCard>
													{hasTemplates && (
														<Popover
															open={templateMenuType === opt.type}
															onOpenChange={(o) => {
																if (!o) {
																	clearPreview(opt.type);
																	setTemplateMenuType(null);
																}
															}}
														>
															<PopoverTrigger asChild>
																<Button
																	size="sm"
																	appearance="subtle"
																	icon={<IconPaint />}
																	aria-label="Select template"
																	className="bottom-1 right-1"
																	style={{position: "absolute"}}
																	onClick={(e) => {
																		e.stopPropagation();
																		setTemplateMenuType(
																			(prev) =>
																				prev === opt.type
																					? null
																					: opt.type
																		);
																	}}
																/>
															</PopoverTrigger>
															<PopoverContent
																side="bottom"
																align="start"
																sideOffset={4}
																onClick={(e) => e.stopPropagation()}
																onMouseLeave={() =>
																	clearPreview(opt.type)
																}
																style={{
																	padding: 4,
																	minWidth: 0,
																	gap: 4,
																	width: "auto",
																	maxWidth: "none",
																}}
															>
																{tOpts.map((tOpt, tIdx) => (
																	<div
																		key={tOpt.value}
																		onMouseEnter={() =>
																			handleOptionHover(
																				opt.type,
																				tOpt.value,
																				tIdx
																			)
																		}
																		onClick={(e) => {
																			e.stopPropagation();
																			setSelectedTemplates(
																				(prev) => ({
																					...prev,
																					[opt.type]:
																						tOpt.value,
																				})
																			);
																			clearPreview(opt.type);
																			setTemplateMenuType(null);
																		}}
																		style={{
																			padding: "8px",
																			height: "40px",
																			display: "flex",
																			alignItems: "center",
																			cursor: "pointer",
																			borderRadius: 6,
																			minWidth: 120,
																			fontSize: 14,
																			whiteSpace: "nowrap",
																			color: "var(--ax-colors-fg-default)",
																		}}
																		className="hover:bg-[var(--ax-colors-bg-default-hovered)]"
																	>
																		{tOpt.label}
																		{selectedTemplates[opt.type] ===
																			tOpt.value && (
																			<IconCheck
																				size={16}
																				style={{marginLeft: "auto"}}
																			/>
																		)}
																	</div>
																))}
															</PopoverContent>
														</Popover>
													)}
												</>
											}
										/>
									);
								})}
							</div>
						)}
					</RawPopover.Content>
				</RawPopover.Portal>
			</RawPopover.Root>
			{fullPreviewType &&
				hasDocument &&
				createPortal(
					<div
						role="dialog"
						aria-modal="true"
						aria-label={`Storybook preview: ${fullPreviewOption?.label ?? fullPreviewType}`}
						onClick={closeFullPreview}
						style={{
							position: "fixed",
							inset: 0,
							zIndex: 9999,
							background: "rgba(0, 0, 0, 0.55)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							opacity: fullPreviewMounted ? 1 : 0,
							transition: "opacity 0.2s ease-out",
						}}
					>
						<div
							onClick={(e) => e.stopPropagation()}
							style={{
								position: "relative",
								width: "92vw",
								height: "92vh",
								background: "var(--ax-colors-bg-default)",
								borderRadius: 12,
								boxShadow: "0 24px 64px rgba(0, 0, 0, 0.35)",
								overflow: "hidden",
								transform: fullPreviewMounted ? "scale(1)" : "scale(0.4)",
								opacity: fullPreviewMounted ? 1 : 0,
								transition:
									"transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out",
								transformOrigin: "center center",
							}}
						>
							<button
								type="button"
								aria-label="Close preview"
								onClick={closeFullPreview}
								style={{
									position: "absolute",
									top: 12,
									right: 12,
									zIndex: 1,
									width: 32,
									height: 32,
									border: 0,
									borderRadius: 6,
									background: "var(--ax-colors-bg-secondary)",
									color: "var(--ax-colors-fg-default)",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
								}}
							>
								<IconX size={16} />
							</button>
							{fullPreviewStoryUrl ? (
								<iframe
									src={fullPreviewStoryUrl}
									title={`Storybook: ${fullPreviewOption?.label ?? fullPreviewType}`}
									style={{
										width: "100%",
										height: "100%",
										border: 0,
										background: "var(--ax-colors-bg-default)",
									}}
								/>
							) : (
								<Box
									style={{
										width: "100%",
										height: "100%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Text fontSize="sm" color="fg.tertiary">
										No Storybook URL for {fullPreviewType}
										{attemptedUrls?.[fullPreviewType] && (
											<div
												style={{
													fontSize: "10px",
													marginTop: "4px",
													wordBreak: "break-all",
												}}
											>
												{attemptedUrls[fullPreviewType]}
											</div>
										)}
									</Text>
								</Box>
							)}
						</div>
					</div>,
					document.body
				)}
		</>
	);
};

export default ColElementGridPicker;

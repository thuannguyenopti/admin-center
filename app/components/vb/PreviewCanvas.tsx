"use client";

import React, {useEffect, useRef, useState, useMemo, useCallback} from "react";
import PreviewWrapper from "./PreviewWrapper";
import type {PreviewSettings} from "./PreviewSettings"; // adjust path
import {siteConfig} from "../../db/initialData";
import {
	IconPilcrow,
	IconForms,
	IconRectangle,
	IconHeading,
	IconBrackets,
	IconPhoto,
	IconMenu2,
	IconX,
} from "@tabler/icons-react";

import styles from "../VBPrototype.module.css";
import {BlockRegistry} from "./blocks";
import {isImageDrag, isInternalDrag, isValidVBDrag, VB_INTERNAL_MIME} from "./blocks/utils";
import {Box} from "@optiaxiom/react";
import StrideHeaderContent from "../../site/StrideHeaderContent";
import {getSectionTemplateClasses} from "./blocks/templateUtils";

export type EleMap = Record<string, {type: string; properties: any}>;

export type Outline = {
	id: string;
	title: string;
	tree: any[];
	elements: EleMap;
};

type DropPosition = {outlineId: string; colId: string; position: number} | null;

const getDraggedImageUrl = (dt: DataTransfer) => {
	const url = dt.getData("image/url") || dt.getData("text/uri-list") || dt.getData("text/plain");
	return typeof url === "string" ? url.trim() : "";
};

const getDraggedAlt = (dt: DataTransfer) => {
	const alt = dt.getData("image/alt") || "";
	return typeof alt === "string" ? alt : "";
};

// Map content type IDs to display names for Visual Builder
const getElementDisplayName = (type: string): string => {
	const typeMap: Record<string, string> = {
		"ct-heading": "Heading",
		"ct-text": "Text",
		"ct-rich-text": "Rich Text",
		"ct-input": "Input",
		"ct-button": "Button",
		"ct-image": "Image",
		"ct-image-block": "Image",
		"ct-product": "Product",
		// Add more mappings as needed
	};
	return typeMap[type] || type;
};

export default function PreviewCanvas({
	outlines,
	theEles, // unused but kept for prop compatibility
	currentEle,
	currentHoverEle,
	setCurrentEle,
	setCurrentHoverEle,
	setOutlines,
	preview,
	scrollToSectionId,
	onScrollComplete,
	currentSection,
	currentHoverSection,
	setCurrentSection,
	setCurrentHoverSection,
	onSectionClick,
}: {
	outlines: Outline[];
	theEles: EleMap;
	currentEle: string;
	currentHoverEle: string;
	setCurrentEle: (value: React.SetStateAction<string>) => void;
	setCurrentHoverEle: (value: React.SetStateAction<string>) => void;
	setOutlines: React.Dispatch<React.SetStateAction<Outline[]>>;
	preview: PreviewSettings;
	scrollToSectionId?: string | null;
	onScrollComplete?: () => void;
	currentSection?: string | null;
	currentHoverSection?: string | null;
	setCurrentSection?: (value: string | null) => void;
	setCurrentHoverSection?: (value: string | null) => void;
	onSectionClick?: (sectionId: string) => void;
}) {
	const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
	const [dropPosition, setDropPosition] = useState<DropPosition>(null);

	// ✅ This MUST be the scroll container div inside PreviewWrapper
	const scrollRef = useRef<HTMLDivElement | null>(null);

	// Auto-scroll preview when a section is added in the outline
	useEffect(() => {
		if (scrollToSectionId && scrollRef.current) {
			// Wait for DOM to update with new section
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					const scrollContainer = scrollRef.current;
					if (!scrollContainer) {
						// Clear trigger even if container is gone
						onScrollComplete?.();
						return;
					}

					// Scope the query to this scroll container
					const sectionElement = scrollContainer.querySelector(
						`[data-preview-section-id="${scrollToSectionId}"]`
					) as HTMLElement | null;

					if (sectionElement) {
						// Get the section's position relative to the scroll container
						const containerRect = scrollContainer.getBoundingClientRect();
						const sectionRect = sectionElement.getBoundingClientRect();

						// Calculate how much to scroll
						const scrollTop = scrollContainer.scrollTop;
						const targetScroll = scrollTop + (sectionRect.top - containerRect.top) - 100; // 100px offset from top

						scrollContainer.scrollTo({
							top: targetScroll,
							behavior: 'smooth'
						});
					}

					// Always clear the scroll trigger (even if element not found)
					onScrollComplete?.();
				});
			});
		}
	}, [scrollToSectionId, onScrollComplete]);

	// "tablet/mobile" breakpoint
	const MOBILE_BP = 1024;

	const [viewportW, setViewportW] = useState<number>(() => {
		// fixed/scale should behave like that device width immediately
		return preview.mode === "responsive" ? 0 : preview.width;
	});

	useEffect(() => {
		if (preview.mode !== "responsive") {
			setViewportW(preview.width);
			return;
		}

		const el = scrollRef.current;
		if (!el) return;

		const update = () => setViewportW(el.clientWidth);
		update();

		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	}, [preview.mode, preview.width]);

	const isMobileViewport = viewportW > 0 && viewportW <= MOBILE_BP;


	const wrapperWidth = preview.width ?? 1100;
	const wrapperMaxWidth = preview.maxWidth ?? 1100;

	// Scroll the selected element into view
	useEffect(() => {
		if (!currentEle || currentEle === "none") return;

		const root = scrollRef.current;
		if (!root) return;

		const el = root.querySelector<HTMLElement>(`[data-element-id="${currentEle}"]`);
		if (!el) return;

		const r = el.getBoundingClientRect();
		const cr = root.getBoundingClientRect();

		const topVisible = r.top >= cr.top + 40;
		const bottomVisible = r.bottom <= cr.bottom - 40;
		if (topVisible && bottomVisible) return;

		const delta = r.top - cr.top - root.clientHeight / 2 + r.height / 2;
		root.scrollTo({top: root.scrollTop + delta, behavior: "smooth"});
	}, [currentEle]);

	const moveElementInOutlines = useCallback((eleId: string, dp: DropPosition) => {
		if (!dp) return;

		setOutlines((prev) => {
			let movedEleNode: any = null;
			let movedEleData: any = null;

			// Step 1: Remove from everywhere
			const nextOutlines = prev.map((outline: any) => {
				let foundInThisOutline = false;
				const nextTree = outline.tree.map((section: any) => ({
					...section,
					children: (section.children || []).map((row: any) => ({
						...row,
						children: (row.children || []).map((col: any) => {
							const colChildren = col.elements || col.children || [];
							const found = colChildren.find((e: any) => e.id === eleId);
							if (found) {
								movedEleNode = found;
								movedEleData = outline.elements[eleId];
								foundInThisOutline = true;
							}
							const nextChildren = colChildren.filter((e: any) => e.id !== eleId);
							return {...col, elements: nextChildren};
						}),
					})),
				}));

				if (foundInThisOutline) {
					const nextElements = {...outline.elements};
					delete nextElements[eleId];
					return {...outline, tree: nextTree, elements: nextElements};
				}
				return {...outline, tree: nextTree};
			});

			if (!movedEleNode) return prev;

			// Step 2: Insert into target
			return nextOutlines.map((outline: any) => {
				if (outline.id !== dp.outlineId) return outline;

				const nextElements = {
					...outline.elements,
					[eleId]: movedEleData,
				};

				const nextTree = outline.tree.map((section: any) => ({
					...section,
					children: (section.children || []).map((row: any) => ({
						...row,
						children: (row.children || []).map((col: any) => {
							if (col.id !== dp.colId) return col;
							const colChildren = col.elements || col.children || [];
							const nextChildren = [...colChildren];
							const safePos = Math.max(0, Math.min(nextChildren.length, dp.position));
							nextChildren.splice(safePos, 0, movedEleNode);
							return {...col, elements: nextChildren, open: true};
						}),
					})),
				}));

				return {...outline, tree: nextTree, elements: nextElements};
			});
		});
	}, [setOutlines]);

	const insertImageIntoOutline = useCallback((
		dp: NonNullable<DropPosition>,
		imageUrl: string,
		imageAlt: string
	) => {
		const uKey = `img-${dp.outlineId}-${Date.now()}`;

		setOutlines((prev) =>
			prev.map((o) => {
				if (o.id !== dp.outlineId) return o;

				const nextElements: EleMap = {
					...o.elements,
					[uKey]: {
						type: "ct-image-block",
						properties: {
							image: {value: imageUrl},
						},
					},
				};

				const nextTree = o.tree.map((section: any) => ({
					...section,
					children: (section.children || []).map((row: any) => ({
						...row,
						children: (row.children || []).map((col: any) => {
							if (col.id !== dp.colId) return col;
							const currentChildren = col.elements || col.children || [];
							const nextChildren = [...currentChildren];
							const safePos = Math.max(0, Math.min(nextChildren.length, dp.position));
							nextChildren.splice(safePos, 0, {id: uKey});
							// normalize to elements
							const {children: _old, ...rest} = col;
							return {...rest, elements: nextChildren};
						}),
					})),
				}));

				return {...o, elements: nextElements, tree: nextTree};
			})
		);
	}, [setOutlines]);

	// Outline-level aside detection
	const isAsideOutline = useCallback((o: any) => {
		if (!o || typeof o !== "object") return false;
		if (o.role === "aside") return true;
		if (o.isAside === true) return true;
		const t = (o.title ?? "").toString().trim().toLowerCase();
		return t === "aside" || t === "sidebar";
	}, []);

	const renderOutlineTree = useCallback((outline: Outline) => {
		const isAside = isAsideOutline(outline);
		return outline.tree.map((section: any, sindex: number) => {
			const hasBgImage = !!section.bgImage;
			const isFooterCTA = section.name === "Footer CTA";

			// Get template classes for section (background, padding, etc.)
			const templateClasses = getSectionTemplateClasses(section, {hasBgImage});

			// Base classes that apply to all sections
			const baseClasses = "mb-6 last:mb-0 overflow-hidden rounded-[10px]";

			// Additional classes when there's a background image
			const bgImageClasses = hasBgImage ? "relative min-h-[500px] flex items-center" : "shadow-sm";

			return (
				<section
					key={section.id ?? sindex}
					data-preview-section-id={section.id}
					className={`${baseClasses} ${bgImageClasses} ${hasBgImage ? "" : templateClasses} relative`}
					onClick={(e) => {
						// Only trigger if not clicking an element
						if (!(e.target as HTMLElement).closest('[data-element-id]')) {
							e.stopPropagation();
							setCurrentSection?.(section.id);
							onSectionClick?.(section.id);
						}
					}}
					onMouseEnter={(e) => {
						// Only trigger if not hovering an element
						if (!(e.target as HTMLElement).closest('[data-element-id]')) {
							setCurrentHoverSection?.(section.id);
						}
					}}
					onMouseLeave={() => {
						setCurrentHoverSection?.(null);
					}}
					style={
						hasBgImage
							? {
									backgroundImage: `linear-gradient(rgba(25, 75, 255, 0.8), rgba(25, 75, 255, 0.8)), url(${section.bgImage})`,
									backgroundSize: "cover",
									backgroundPosition: "center",
								}
							: {}
					}
				>
					{/* Blue border overlay for hover/selection */}
					{(currentHoverSection === section.id || currentSection === section.id) && (
						<div
							className="pointer-events-none absolute inset-0 border-2 border-[#0037FF] rounded-[10px]"
							style={{
								opacity: currentSection === section.id ? 1 : 0.5,
								zIndex: 5,
							}}
						/>
					)}
					<div
						className={
							hasBgImage
								? "relative z-10 w-full p-12 md:p-20"
								: `w-full ${isAside ? "p-8" : "p-8 md:p-12"}`
						}
					>
						{(section.children || []).map((row: any, rIndex: number) => (
							<section
								className={`grid ${isMobileViewport ? "grid-cols-1" : "grid-flow-col auto-cols-fr"} gap-4 ${hasBgImage ? "text-white" : "text-[#05051F]"}`}
								key={row.id ?? rIndex}
							>
								{(row.children || []).map((col: any, cIndex: number) => {
									const colChildren = col.elements || col.children || [];
									const isActiveDropCol =
										dragOverColumn === col.id &&
										dropPosition &&
										dropPosition.outlineId === outline.id &&
										dropPosition.colId === col.id;

									return (
										<div
											key={col.id ?? cIndex}
											onDragOver={(e) => {
												e.preventDefault();
												e.stopPropagation();

												// ✅ IMPORTANT: do NOT rely on only "image/url"
												if (!isValidVBDrag(e.dataTransfer)) return;

												setDragOverColumn(col.id);

												const elementDivs =
													e.currentTarget.querySelectorAll(
														"[data-element-id]"
													);
												const mouseY = e.clientY;

												let insertPosition = colChildren.length;

												for (let i = 0; i < elementDivs.length; i++) {
													const rect = (
														elementDivs[i] as HTMLElement
													).getBoundingClientRect();
													const middle = rect.top + rect.height / 2;
													if (mouseY < middle) {
														insertPosition = i;
														break;
													}
												}

												setDropPosition({
													outlineId: outline.id,
													colId: col.id,
													position: insertPosition,
												});
											}}
											onDragLeave={(e) => {
												e.stopPropagation();
												if (e.currentTarget === e.target) {
													setDragOverColumn(null);
													setDropPosition(null);
												}
											}}
											className={dragOverColumn === col.id ? "relative" : ""}
										>
											{/* list */}
											{colChildren.map((element: any, eleIndex: number) => {
												const ele = outline.elements[element.id];
												const type = ele?.type;

												return (
													<React.Fragment key={element.id ?? eleIndex}>
														{/* ✅ insert line BEFORE the element (middle positions now visible/usable) */}
														{isActiveDropCol &&
															dropPosition!.position === eleIndex && (
																<div
																	style={{
																		height: "2px",
																		backgroundColor: "#0037FF",
																		borderRadius: "2px",
																		margin: "6px 0",
																		pointerEvents: "none",
																	}}
																/>
															)}

														<div
															className="relative group"
															data-element-id={element.id}
														>
															{/* selection outline */}
															<div
																onClick={(e) => {
																	e.stopPropagation();
																	setCurrentEle(element.id);
																	setCurrentHoverEle("none");
																	setCurrentSection?.(null);
																}}
																style={{
																	visibility:
																		currentEle === element.id ||
																		currentHoverEle ===
																			element.id
																			? "visible"
																			: undefined,
																	opacity:
																		currentEle === element.id ||
																		currentHoverEle ===
																			element.id
																			? currentEle ===
																				element.id
																				? 1
																				: 0.5
																			: undefined,
																	top:
																		currentEle === element.id ||
																		currentHoverEle ===
																			element.id
																			? "-8px"
																			: undefined,
																	left:
																		currentEle === element.id ||
																		currentHoverEle ===
																			element.id
																			? "-8px"
																			: undefined,
																	right:
																		currentEle === element.id ||
																		currentHoverEle ===
																			element.id
																			? "-8px"
																			: undefined,
																	bottom:
																		currentEle === element.id ||
																		currentHoverEle ===
																			element.id
																			? "-8px"
																			: undefined,
																}}
																className="cursor-pointer group-hover:visible group-hover:-left-2 group-hover:-top-2 group-hover:-right-2 group-hover:-bottom-2 group-hover:opacity-50 transition-all duration-100 invisible opacity-0 absolute border-2 -left-1 -top-1 -right-1 -bottom-1 z-10 border-[#0037FF] rounded-[4px] rounded-tl-none"
															>
																<div className="bg-[#0037FF] flex gap-1 items-center text-white text-[9px] absolute px-2 py-[3px] rounded-[4px] -top-7 -left-[2px] rounded-b-none">
																	{(() => {
																		switch (type) {
																			case "Heading":
																			case "ct-heading":
																				return (
																					<IconHeading
																						size={12}
																					/>
																				);
																			case "Text":
																			case "ct-text":
																				return (
																					<IconPilcrow
																						size={12}
																					/>
																				);
																			case "Input":
																			case "ct-input":
																				return (
																					<IconForms
																						size={12}
																					/>
																				);
																			case "Button":
																			case "ct-button":
																				return (
																					<IconRectangle
																						size={12}
																					/>
																				);
																			case "Image":
																			case "ct-image":
																			case "ct-image-block":
																			return (
																				<IconPhoto
																						size={12}
																					/>
																				);
																			default:
																				return (
																					<IconBrackets
																						size={12}
																					/>
																				);
																		}
																	})()}
																	{getElementDisplayName(type) || "Unknown"}
																</div>
															</div>

															{/* element render */}
															{(() => {
																const BlockComponent =
																	BlockRegistry[type];
																if (BlockComponent) {
																	return (
																		<BlockComponent
																			properties={
																				ele.properties
																			}
																			hasBgImage={hasBgImage}
																		/>
																	);
																}
																return null;
															})()}
														</div>
													</React.Fragment>
												);
											})}

											{/* ✅ insert line at END of column */}
											{isActiveDropCol &&
												dropPosition!.position === colChildren.length && (
													<div
														style={{
															height: "2px",
															backgroundColor: "#0037FF",
															borderRadius: "2px",
															margin: "6px 0",
															pointerEvents: "none",
														}}
													/>
												)}
										</div>
									);
								})}
							</section>
						))}
					</div>
				</section>
			);
		});
	}, [isAsideOutline, isMobileViewport, currentEle, currentHoverEle, setCurrentEle, setCurrentHoverEle, dragOverColumn, dropPosition, setDragOverColumn, setDropPosition]);

	const mainOutlines = useMemo(() => outlines.filter((o) => !isAsideOutline(o)), [outlines, isAsideOutline]);
	const asideOutlines = useMemo(() => outlines.filter((o) => isAsideOutline(o)), [outlines, isAsideOutline]);
	const hasAside = useMemo(() => asideOutlines.length > 0 && mainOutlines.length > 0, [asideOutlines.length, mainOutlines.length]);

	// ✅ only break into 1 column on "mobile" preview widths
	const useTwoCol = useMemo(() => hasAside && !isMobileViewport, [hasAside, isMobileViewport]);

	return (
		<Box
			mt="8"
			mr="8"
			rounded="xl"
			className={`grow ${styles.canvas}`}
			border="1"
			borderColor="border.tertiary"
			style={{
				background: "var(--ax-colors-bg-tertiary)",
				height: "100%",
				minHeight: 0,
				overflow: "hidden",
				zIndex: 50,
				boxShadow: "inset 0 0 40px rgba(0,0,0,0.1), 0 20px 70px 0px rgba(0,0,0,0.05), 0 1px 1px 0 rgba(0,0,0,0.01)",
			}}
		>
			<PreviewWrapper
				contentRef={scrollRef}
				mode={preview.mode}
				width={wrapperWidth}
				maxWidth={wrapperMaxWidth}
				height="fill"
				className="h-full min-h-0"
				onClick={() => setCurrentEle("none")}
				onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
					e.preventDefault();
					if (isValidVBDrag(e.dataTransfer))
						(e.currentTarget as HTMLDivElement).style.opacity = "0.8";
				}}
				onDragLeave={(e: React.DragEvent<HTMLDivElement>) => {
					(e.currentTarget as HTMLDivElement).style.opacity = "1";
					setDragOverColumn(null);
					setDropPosition(null);
				}}
				onDrop={(e: React.DragEvent<HTMLDivElement>) => {
					e.preventDefault();
					(e.currentTarget as HTMLDivElement).style.opacity = "1";

					const imageUrl = getDraggedImageUrl(e.dataTransfer);
					const imageAlt = getDraggedAlt(e.dataTransfer);
					const internalId = e.dataTransfer.getData(VB_INTERNAL_MIME);

					const dp = dropPosition;
					setDragOverColumn(null);
					setDropPosition(null);

					if (imageUrl && dp) insertImageIntoOutline(dp, imageUrl, imageAlt);
					if (internalId && dp) moveElementInOutlines(internalId, dp);
				}}
				style={{transition: "opacity 0.2s"}}
			>
				{/* Fake Site Header */}
				<div className="w-full bg-white px-4 md:px-8 py-4 md:py-5 flex items-center justify-between border-b border-gray-100 shrink-0 sticky top-0 z-50 shadow-sm">
				<StrideHeaderContent
					isMobile={isMobileViewport}
					menuIcon={<IconMenu2 size={24} />}
					closeIcon={<IconX size={24} />}
				/>
				</div>

				<div
					className="w-full p-6 md:p-6 flex-1"
					style={{
						background: "#F3F4F6",
					}}
				>
					{useTwoCol ? (
						<div className="grid grid-cols-[minmax(0,1fr)_minmax(0,340px)] gap-6 items-start">
							<div className="space-y-6">
								{mainOutlines.map((outline) => (
									<div key={outline.id}>{renderOutlineTree(outline)}</div>
								))}
							</div>

							<aside className="space-y-6">
								{asideOutlines.map((outline) => (
									<div key={outline.id}>{renderOutlineTree(outline)}</div>
								))}
							</aside>
						</div>
					) : (
						<div className="space-y-6">
							{[...mainOutlines, ...asideOutlines].map((outline) => (
								<div key={outline.id}>{renderOutlineTree(outline)}</div>
							))}
						</div>
					)}
				</div>
			</PreviewWrapper>
		</Box>
	);
}

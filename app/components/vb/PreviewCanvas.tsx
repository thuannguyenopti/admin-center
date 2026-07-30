"use client";

import React, {useEffect, useRef, useState, useMemo, useCallback} from "react";
import PreviewWrapper from "./PreviewWrapper";
import type {PreviewSettings} from "./PreviewSettings"; // adjust path
import {siteConfig} from "../../db/initialData";
import {IconPilcrow, IconForms, IconRectangle, IconHeading, IconBracketsSquare, IconImage, IconBars, IconXmark} from "@/app/lib/axiom-icons";

import styles from "../VBPrototype.module.css";
import {BlockRegistry} from "./blocks";
import {isImageDrag, isInternalDrag, isValidVBDrag, VB_INTERNAL_MIME} from "./blocks/utils";
import {Box} from "@optiaxiom/react";
import StrideHeaderContent from "../../site/StrideHeaderContent";
import StrideHeaderWrapper from "../../site/StrideHeaderWrapper";
import StrideFooter from "../../site/StrideFooter";
import StrideColumnGrid from "../../site/StrideColumnGrid";
import "../../site/StrideGrid.css";
import {getDisplayTemplateClasses} from "./blocks/displayTemplateRenderer";
import {ContentType, getContentType, initialContentTypes} from "../../db/initialData";
import usePersistentState from "../../usePersistentState";

const SECTION_SPACING_MAP: Record<string, string> = {
	"exp-landing-page": "space-y-0", // Sections control their own spacing
	"ct-page": "space-y-0", // Sections control their own spacing
	default: "space-y-0",
};

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
	currentRow,
	currentHoverRow,
	setCurrentRow,
	setCurrentHoverRow,
	onRowClick,
	currentColumn,
	currentHoverColumn,
	setCurrentColumn,
	setCurrentHoverColumn,
	onColumnClick,
	scrollToRowId,
	scrollToColumnId,
	onRowScrollComplete,
	onColumnScrollComplete,
	contentTypeId,
}: {
	outlines: Outline[];
	theEles: EleMap;
	contentTypeId?: string;
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
	currentRow?: string | null;
	currentHoverRow?: string | null;
	setCurrentRow?: (value: string | null) => void;
	setCurrentHoverRow?: (value: string | null) => void;
	onRowClick?: (rowId: string) => void;
	currentColumn?: string | null;
	currentHoverColumn?: string | null;
	setCurrentColumn?: (value: string | null) => void;
	setCurrentHoverColumn?: (value: string | null) => void;
	onColumnClick?: (columnId: string) => void;
	scrollToRowId?: string | null;
	scrollToColumnId?: string | null;
	onRowScrollComplete?: () => void;
	onColumnScrollComplete?: () => void;
}) {
	const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
	const [dropPosition, setDropPosition] = useState<DropPosition>(null);
	const [runtimeContentTypes] = usePersistentState("contentTypes", initialContentTypes) as [
		ContentType[],
		unknown,
	];

	const getElementDisplayName = useCallback(
		(type: string): string => {
			const contentType =
				runtimeContentTypes?.find((ct) => ct.id === type) || getContentType(type);
			if (contentType?.displayName) return contentType.displayName;

			const normalizedType = type.replace(/^ct-/, "").replace(/-/g, " ").trim();
			if (!normalizedType) return type;

			return normalizedType.replace(/\b\w/g, (char) => char.toUpperCase());
		},
		[runtimeContentTypes]
	);

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
						const targetScroll =
							scrollTop + (sectionRect.top - containerRect.top) - 100; // 100px offset from top

						scrollContainer.scrollTo({
							top: targetScroll,
							behavior: "smooth",
						});
					}

					// Always clear the scroll trigger (even if element not found)
					onScrollComplete?.();
				});
			});
		}
	}, [scrollToSectionId, onScrollComplete]);

	// Auto-scroll preview when a row is clicked in outline
	useEffect(() => {
		if (scrollToRowId && scrollRef.current) {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					const scrollContainer = scrollRef.current;
					if (!scrollContainer) {
						onRowScrollComplete?.();
						return;
					}

					const rowElement = scrollContainer.querySelector(
						`[data-row-id="${scrollToRowId}"]`
					) as HTMLElement | null;

					if (rowElement) {
						const containerRect = scrollContainer.getBoundingClientRect();
						const rowRect = rowElement.getBoundingClientRect();
						const scrollTop = scrollContainer.scrollTop;
						const targetScroll = scrollTop + (rowRect.top - containerRect.top) - 100;

						scrollContainer.scrollTo({
							top: targetScroll,
							behavior: "smooth",
						});
					}

					onRowScrollComplete?.();
				});
			});
		}
	}, [scrollToRowId, onRowScrollComplete]);

	// Auto-scroll preview when a column is clicked in outline
	useEffect(() => {
		if (scrollToColumnId && scrollRef.current) {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					const scrollContainer = scrollRef.current;
					if (!scrollContainer) {
						onColumnScrollComplete?.();
						return;
					}

					const columnElement = scrollContainer.querySelector(
						`[data-column-id="${scrollToColumnId}"]`
					) as HTMLElement | null;

					if (columnElement) {
						const containerRect = scrollContainer.getBoundingClientRect();
						const columnRect = columnElement.getBoundingClientRect();
						const scrollTop = scrollContainer.scrollTop;
						const targetScroll = scrollTop + (columnRect.top - containerRect.top) - 100;

						scrollContainer.scrollTo({
							top: targetScroll,
							behavior: "smooth",
						});
					}

					onColumnScrollComplete?.();
				});
			});
		}
	}, [scrollToColumnId, onColumnScrollComplete]);

	// "tablet/mobile" breakpoint
	const MOBILE_BP = 768;

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
	const wrapperMaxWidth = preview.mode === "responsive" ? undefined : preview.maxWidth;

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

	const moveElementInOutlines = useCallback(
		(eleId: string, dp: DropPosition) => {
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
								const safePos = Math.max(
									0,
									Math.min(nextChildren.length, dp.position)
								);
								nextChildren.splice(safePos, 0, movedEleNode);
								return {...col, elements: nextChildren, open: true};
							}),
						})),
					}));

					return {...outline, tree: nextTree, elements: nextElements};
				});
			});
		},
		[setOutlines]
	);

	const insertImageIntoOutline = useCallback(
		(dp: NonNullable<DropPosition>, imageUrl: string, imageAlt: string) => {
			const uKey = `img-${dp.outlineId}-${Date.now()}`;

			setOutlines((prev) =>
				prev.map((o) => {
					if (o.id !== dp.outlineId) return o;

					const nextElements: EleMap = {
						...o.elements,
						[uKey]: {
							type: "ct-image-block",
							properties: {
								image: imageUrl,
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
								const safePos = Math.max(
									0,
									Math.min(nextChildren.length, dp.position)
								);
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
		},
		[setOutlines]
	);

	// Outline-level aside detection
	const isAsideOutline = useCallback((o: any) => {
		if (!o || typeof o !== "object") return false;
		if (o.role === "aside") return true;
		if (o.isAside === true) return true;
		const t = (o.title ?? "").toString().trim().toLowerCase();
		return t === "aside" || t === "sidebar";
	}, []);

	const renderOutlineTree = useCallback(
		(outline: Outline) => {
			const isAside = isAsideOutline(outline);
			return outline.tree.map((section: any, sindex: number) => {
				const hasBgImage = !!section.bgImage;
				const noPadding = section.noPadding === true;
				const isFooterCTA = section.name === "Footer CTA";

				// Check if this section contains a hero block
				const hasHeroBlock = (section.children || []).some((row: any) =>
					(row.children || []).some((col: any) =>
						(col.elements || []).some((element: any) => {
							const ele = outline.elements[element.id];
							return ele && ele.type === "ct-hero";
						})
					)
				);

				// Count app preview blocks in this section
				let appPreviewCount = 0;
				(section.children || []).forEach((row: any) => {
					(row.children || []).forEach((col: any) => {
						(col.elements || []).forEach((element: any) => {
							const ele = outline.elements[element.id];
							if (ele && ele.type === "ct-app-preview") {
								appPreviewCount++;
							}
						});
					});
				});

				const hasAppPreview = appPreviewCount > 0;
				// Showcase sections have multiple app previews (apply mask to section)
				const isShowcaseSection = appPreviewCount > 1;
				// Community sections have single app preview (apply mask to column)
				const isCommunitySection = appPreviewCount === 1;

				// Get display template classes for section (background, padding, etc.)
				const templateClasses = section.displayTemplateKey
					? getDisplayTemplateClasses(
							section.displayTemplateKey,
							section.displaySettings || [],
							{hasBgImage}
						)
					: "";

				// Debug logging
				console.log("[PreviewCanvas] Section:", {
					id: section.id,
					name: section.name,
					displayTemplateKey: section.displayTemplateKey,
					displaySettings: section.displaySettings,
					templateClasses,
				});

				// Base classes that apply to all sections
				const baseClasses = "";

				// Additional classes when there's a background image
				const bgImageClasses = hasBgImage
					? "relative min-h-[500px] flex items-center rounded-stride-lg"
					: "";

				// Add bottom margin to hero sections
				const heroBottomMargin = hasHeroBlock ? "mb-[100px]" : "";

				// App preview section padding - showcase needs more top padding to avoid clipping
				const appPreviewPadding = isShowcaseSection
					? "md:pt-180 pt-6 pb-20"
					: hasAppPreview
						? "md:pt-40 pt-20 pb-20"
						: "";

				// Add negative margins for showcase overlap effect
				const showcaseMargins = isShowcaseSection
					? "md:-mt-120 mt-6 md:-mb-100 -mb-20"
					: "";

				return (
					<section
						key={section.id ?? sindex}
						data-preview-section-id={section.id}
						className={`${baseClasses} ${bgImageClasses} ${heroBottomMargin} ${appPreviewPadding} ${showcaseMargins} ${templateClasses} relative`}
						onClick={(e) => {
							// Only trigger if not clicking an element
							if (!(e.target as HTMLElement).closest("[data-element-id]")) {
								e.stopPropagation();
								setCurrentSection?.(section.id);
								onSectionClick?.(section.id);
							}
						}}
						onMouseEnter={(e) => {
							// Only trigger if not hovering an element
							if (!(e.target as HTMLElement).closest("[data-element-id]")) {
								setCurrentHoverSection?.(section.id);
								// Clear higher-priority hovers
								setCurrentHoverRow?.(null);
								setCurrentHoverColumn?.(null);
							}
						}}
						onMouseLeave={() => {
							setCurrentHoverSection?.(null);
						}}
						style={
							hasBgImage
								? {
										backgroundImage: `linear-gradient(rgba(9, 128, 246, 0.8), rgba(9, 128, 246, 0.8)), url(${section.bgImage})`,
										backgroundSize: "cover",
										backgroundPosition: "center",
									}
								: isShowcaseSection
									? {
											WebkitMaskImage:
												"linear-gradient(black 60%, transparent 70%)",
											maskImage:
												"linear-gradient(black 60%, transparent 70%)",
										}
									: {}
						}
					>
						{/* Blue outline overlay for hover/selection */}
						{(currentHoverSection === section.id || currentSection === section.id) && (
							<div
								className="pointer-events-none absolute inset-0"
								style={{
									outline: "2px solid var(--ax-colors-border-focus)",
									outlineOffset: "-2px",
									borderRadius: "10px",
									opacity: currentSection === section.id ? 1 : 0.5,
									zIndex: 5,
								}}
							/>
						)}
						<div className="w-full">
							{(section.children || []).map((row: any, rIndex: number) => (
								<section
									className={`${hasAppPreview ? "w-full max-w-[1200px] mx-auto md:flex gap-6 items-start md:-mb-50 mb-6" : hasHeroBlock ? `grid ${isMobileViewport ? "grid-cols-1" : "grid-flow-col auto-cols-fr"}` : `max-w-[1200px] mx-auto grid ${isMobileViewport ? "grid-cols-1" : "grid-flow-col auto-cols-fr"} gap-6`} ${hasBgImage ? "text-white" : "text-[var(--ax-colors-fg-default)]"} relative`}
									key={row.id ?? rIndex}
									data-row-id={row.id}
									onClick={(e) => {
										// Only trigger if not clicking an element or column
										if (
											!(e.target as HTMLElement).closest(
												"[data-element-id]"
											) &&
											!(e.target as HTMLElement).closest("[data-column-id]")
										) {
											e.stopPropagation();
											setCurrentRow?.(row.id);
											setCurrentSection?.(null);
											onRowClick?.(row.id);
										}
									}}
									onMouseEnter={(e) => {
										// Only trigger if not hovering an element or column
										if (
											!(e.target as HTMLElement).closest(
												"[data-element-id]"
											) &&
											!(e.target as HTMLElement).closest("[data-column-id]")
										) {
											setCurrentHoverRow?.(row.id);
											// Clear lower-priority hovers
											setCurrentHoverSection?.(null);
											// Clear higher-priority hovers
											setCurrentHoverColumn?.(null);
										}
									}}
									onMouseLeave={() => {
										setCurrentHoverRow?.(null);
									}}
								>
									{/* Blue outline overlay for row hover/selection */}
									{(currentHoverRow === row.id || currentRow === row.id) && (
										<div
											className="pointer-events-none absolute inset-0"
											style={{
												outline: "2px solid var(--ax-colors-border-focus)",
												outlineOffset: "-2px",
												borderRadius: "10px",
												opacity: currentRow === row.id ? 1 : 0.5,
												zIndex: 4,
											}}
										/>
									)}
									{(row.children || []).map((col: any, cIndex: number) => {
										const colChildren = col.elements || col.children || [];
										const isActiveDropCol =
											dragOverColumn === col.id &&
											dropPosition &&
											dropPosition.outlineId === outline.id &&
											dropPosition.colId === col.id;

										// Check if this column contains an app preview
										const hasAppPreviewInCol = colChildren.some(
											(element: any) => {
												const ele = outline.elements[element.id];
												return ele && ele.type === "ct-app-preview";
											}
										);

										// Only apply column mask for community sections (single app preview)
										const applyColumnMask =
											isCommunitySection && hasAppPreviewInCol;

										const colTemplateClasses = col.displayTemplateKey
											? getDisplayTemplateClasses(
													col.displayTemplateKey,
													col.displaySettings || []
												)
											: "";

										return (
											<div
												key={col.id ?? cIndex}
												className={`relative ${hasAppPreview ? "basis-0 grow" : ""} ${colTemplateClasses}`}
												style={
													applyColumnMask
														? {
																marginTop: "-10%",
																WebkitMaskImage:
																	"linear-gradient(#000 40%, transparent 75%)",
																maskImage:
																	"linear-gradient(#000 40%, transparent 75%)",
															}
														: {}
												}
												data-column-id={col.id}
												onClick={(e) => {
													// Only trigger if not clicking an element
													if (
														!(e.target as HTMLElement).closest(
															"[data-element-id]"
														)
													) {
														e.stopPropagation();
														setCurrentColumn?.(col.id);
														setCurrentRow?.(null);
														setCurrentSection?.(null);
														onColumnClick?.(col.id);
													}
												}}
												onMouseEnter={(e) => {
													// Only trigger if not hovering an element
													if (
														!(e.target as HTMLElement).closest(
															"[data-element-id]"
														)
													) {
														setCurrentHoverColumn?.(col.id);
														// Clear lower-priority hovers
														setCurrentHoverSection?.(null);
														setCurrentHoverRow?.(null);
													}
												}}
												onMouseLeave={() => {
													setCurrentHoverColumn?.(null);
												}}
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
											>
												{/* Blue outline overlay for column hover/selection */}
												{(currentHoverColumn === col.id ||
													currentColumn === col.id) && (
													<div
														className="pointer-events-none absolute inset-0"
														style={{
															outline:
																"2px solid var(--ax-colors-border-focus)",
															outlineOffset: "-2px",
															borderRadius: "10px",
															opacity:
																currentColumn === col.id ? 1 : 0.5,
															zIndex: 3,
														}}
													/>
												)}
												{/* list */}
												{colChildren.map(
													(element: any, eleIndex: number) => {
														const ele = outline.elements[element.id];
														const type = ele?.type;

														return (
															<React.Fragment
																key={element.id ?? eleIndex}
															>
																{/* ✅ insert line BEFORE the element (middle positions now visible/usable) */}
																{isActiveDropCol &&
																	dropPosition!.position ===
																		eleIndex && (
																		<div
																			style={{
																				height: "2px",
																				backgroundColor:
																					"var(--ax-colors-border-focus)",
																				borderRadius: "2px",
																				margin: "6px 0",
																				pointerEvents:
																					"none",
																			}}
																		/>
																	)}

																<div
																	className="relative group"
																	data-element-id={element.id}
																	onMouseEnter={(e) => {
																		e.stopPropagation();
																		setCurrentHoverEle(
																			element.id
																		);
																		// Clear lower-priority hovers
																		setCurrentHoverSection?.(
																			null
																		);
																		setCurrentHoverRow?.(null);
																		setCurrentHoverColumn?.(
																			null
																		);
																	}}
																	onMouseLeave={() => {
																		setCurrentHoverEle("none");
																	}}
																>
																	{/* element render */}
																	{(() => {
																		const BlockComponent =
																			BlockRegistry[type];
																		if (BlockComponent) {
																			return (
																				<div style={{ pointerEvents: "none" }}>
																					<BlockComponent
																						properties={
																							ele.properties
																						}
																						hasBgImage={
																							hasBgImage
																						}
																					/>
																				</div>
																			);
																		}
																		return null;
																	})()}

																	{/* selection outline — rendered AFTER block so it sits on top in DOM order */}
																	<div
																		onClick={(e) => {
																			e.stopPropagation();
																			setCurrentEle(
																				element.id
																			);
																			setCurrentHoverEle(
																				"none"
																			);
																			setCurrentSection?.(
																				null
																			);
																			setCurrentRow?.(null);
																			setCurrentColumn?.(
																				null
																			);
																		}}
																		style={{
																			visibility:
																				currentEle ===
																					element.id ||
																				currentHoverEle ===
																					element.id
																					? "visible"
																					: undefined,
																			opacity:
																				currentEle ===
																					element.id ||
																				currentHoverEle ===
																					element.id
																					? currentEle ===
																						element.id
																						? 1
																						: 0.5
																					: undefined,
																			top:
																				currentEle ===
																					element.id ||
																				currentHoverEle ===
																					element.id
																					? "-8px"
																					: undefined,
																			left:
																				currentEle ===
																					element.id ||
																				currentHoverEle ===
																					element.id
																					? "-8px"
																					: undefined,
																			right:
																				currentEle ===
																					element.id ||
																				currentHoverEle ===
																					element.id
																					? "-8px"
																					: undefined,
																			bottom:
																				currentEle ===
																					element.id ||
																				currentHoverEle ===
																					element.id
																					? "-8px"
																					: undefined,
																		}}
																		className="cursor-pointer group-hover:visible group-hover:-left-2 group-hover:-top-2 group-hover:-right-2 group-hover:-bottom-2 group-hover:opacity-50 transition-all duration-100 invisible opacity-0 absolute border-2 -left-1 -top-1 -right-1 -bottom-1 z-10 border-[var(--ax-colors-border-focus)] rounded-[4px] rounded-tl-none"
																	>
																		<div className="bg-[var(--ax-colors-border-focus)] flex gap-1 items-center text-white text-[9px] absolute px-2 py-[3px] rounded-[4px] -top-7 -left-[2px] rounded-b-none">
																			{(() => {
																				switch (type) {
																					case "Heading":
																					case "ct-heading":
																						return (
																							<IconHeading
																								size={
																									12
																								}
																							/>
																						);
																					case "Text":
																					case "ct-text":
																						return (
																							<IconPilcrow
																								size={
																									12
																								}
																							/>
																						);
																					case "Input":
																					case "ct-input":
																						return (
																							<IconForms
																								size={
																									12
																								}
																							/>
																						);
																					case "Button":
																					case "ct-button":
																						return (
																							<IconRectangle
																								size={
																									12
																								}
																							/>
																						);
																					case "Image":
																					case "ct-image":
																					case "ct-image-block":
																						return (
																							<IconImage
																								size={
																									12
																								}
																							/>
																						);
																					default:
																						return (
																							<IconBracketsSquare
																								size={
																									12
																								}
																							/>
																						);
																				}
																			})()}
																			{getElementDisplayName(
																				type
																			) || "Unknown"}
																		</div>
																	</div>
																</div>
															</React.Fragment>
														);
													}
												)}

												{/* ✅ insert line at END of column */}
												{isActiveDropCol &&
													dropPosition!.position ===
														colChildren.length && (
														<div
															style={{
																height: "2px",
																backgroundColor:
																	"var(--ax-colors-border-focus)",
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
		},
		[
			isAsideOutline,
			isMobileViewport,
			currentEle,
			currentHoverEle,
			setCurrentEle,
			setCurrentHoverEle,
			dragOverColumn,
			dropPosition,
			setDragOverColumn,
			setDropPosition,
		]
	);

	// Detect if content type supports aside/sidenav outlines
	const contentType = useMemo(
		() => (contentTypeId ? getContentType(contentTypeId) : null),
		[contentTypeId]
	);
	const hasAsideProperty = useMemo(
		() => contentType?.properties?.some((p) => p.id === "asideOutline") ?? false,
		[contentType]
	);
	const hasSidenavProperty = useMemo(
		() => contentType?.properties?.some((p) => p.id === "sidenavOutline") ?? false,
		[contentType]
	);

	// Resolve spacing based on content type
	const sectionSpacing = useMemo(
		() =>
			contentTypeId
				? (SECTION_SPACING_MAP[contentTypeId] ?? SECTION_SPACING_MAP.default)
				: SECTION_SPACING_MAP.default,
		[contentTypeId]
	);

	const mainOutlines = useMemo(
		() => outlines.filter((o) => !isAsideOutline(o)),
		[outlines, isAsideOutline]
	);
	const asideOutlines = useMemo(
		() => outlines.filter((o) => isAsideOutline(o)),
		[outlines, isAsideOutline]
	);

	// Only show aside if content type supports it AND we have aside outlines
	const hasAside = useMemo(
		() => hasAsideProperty && asideOutlines.length > 0 && mainOutlines.length > 0,
		[hasAsideProperty, asideOutlines.length, mainOutlines.length]
	);
	const hasSidenav = useMemo(
		() => hasSidenavProperty && asideOutlines.length > 0 && mainOutlines.length > 0,
		[hasSidenavProperty, asideOutlines.length, mainOutlines.length]
	);

	// Check if first section has a hero block
	const firstSectionHasHero = useMemo(() => {
		if (mainOutlines.length === 0 || mainOutlines[0].tree.length === 0) return false;
		return (mainOutlines[0].tree[0].children || []).some((row: any) =>
			(row.children || []).some((col: any) =>
				(col.elements || []).some((element: any) => {
					const ele = mainOutlines[0].elements[element.id];
					return ele && ele.type === "ct-hero";
				})
			)
		);
	}, [mainOutlines]);

	// Extract hero section if present
	const heroSection = useMemo(
		() => (firstSectionHasHero && mainOutlines.length > 0 ? mainOutlines[0].tree[0] : null),
		[firstSectionHasHero, mainOutlines]
	);
	const heroElements = useMemo(
		() => (heroSection && mainOutlines.length > 0 ? mainOutlines[0].elements : {}),
		[heroSection, mainOutlines]
	);

	// Remaining sections after hero
	const remainingMainOutlines = useMemo(() => {
		if (!firstSectionHasHero || mainOutlines.length === 0) return mainOutlines;
		return [
			{...mainOutlines[0], tree: mainOutlines[0].tree.slice(1)},
			...mainOutlines.slice(1),
		];
	}, [firstSectionHasHero, mainOutlines]);

	// ✅ only break into 1 column on "mobile" preview widths
	const useTwoCol = useMemo(() => hasAside && !isMobileViewport, [hasAside, isMobileViewport]);
	const useSidenav = useMemo(
		() => hasSidenav && !isMobileViewport,
		[hasSidenav, isMobileViewport]
	);

	return (
		<Box
			mt="8"
			mr="8"
			rounded="xl"
			className={`grow ${styles.canvas}`}
			border="1"
			borderColor="border.tertiary"
			style={{
				background: "var(--ax-colors-bg-default)",
				height: "100%",
				minHeight: 0,
				overflow: "hidden",
				zIndex: 50,
				boxShadow: "0 20px 70px 0px rgba(0,0,0,0.15), 0 1px 1px 0 rgba(0,0,0,0.1)",
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
				{/* Wrapper to constrain absolutely positioned header within preview */}
				<div className="relative w-full h-full flex flex-col">
					{/* Site Header - positioned absolutely to overlay hero */}
					<StrideHeaderWrapper positioning="absolute" useMaxWidth={true}>
						<StrideHeaderContent
							isMobile={isMobileViewport}
							menuIcon={<IconBars size={24} />}
							closeIcon={<IconXmark size={24} />}
						/>
					</StrideHeaderWrapper>

					<div
						className="w-full font-stride-sans relative"
						style={{
							background: "#F2F8FC",
						}}
					>
						<StrideColumnGrid />
						{/* Render hero full-width if present */}
						{heroSection && (
							<section className="mb-[100px]">
								<div className="w-full">
									{(heroSection.children || []).map(
										(row: any, rIndex: number) => (
											<div
												className="grid grid-cols-1 md:grid-flow-col md:auto-cols-fr"
												key={row.id ?? rIndex}
											>
												{(row.children || []).map(
													(col: any, cIndex: number) => {
														const colChildren =
															col.elements || col.children || [];
														return (
															<div key={col.id ?? cIndex}>
																{colChildren.map(
																	(
																		element: any,
																		eleIndex: number
																	) => {
																		const ele =
																			heroElements[
																				element.id
																			];
																		if (!ele) return null;
																		const type = ele.type;
																		const BlockComponent =
																			BlockRegistry[type];
																		if (!BlockComponent)
																			return null;
																		const isActive =
																			currentEle ===
																				element.id ||
																			currentHoverEle ===
																				element.id;
																		const isSelected =
																			currentEle ===
																			element.id;
																		return (
																			<div
																				key={
																					element.id ??
																					eleIndex
																				}
																				className="relative group"
																				data-element-id={
																					element.id
																				}
																				onMouseEnter={(
																					e
																				) => {
																					e.stopPropagation();
																					setCurrentHoverEle(
																						element.id
																					);
																					setCurrentHoverSection?.(
																						null
																					);
																					setCurrentHoverRow?.(
																						null
																					);
																					setCurrentHoverColumn?.(
																						null
																					);
																				}}
																				onMouseLeave={() => {
																					setCurrentHoverEle(
																						"none"
																					);
																				}}
																			>
																				<div style={{ pointerEvents: "none" }}>
																					<BlockComponent
																						properties={
																							ele.properties
																						}
																					/>
																				</div>
																				<div
																					onClick={(
																						e
																					) => {
																						e.stopPropagation();
																						setCurrentEle(
																							element.id
																						);
																						setCurrentHoverEle(
																							"none"
																						);
																						setCurrentSection?.(
																							null
																						);
																						setCurrentRow?.(
																							null
																						);
																						setCurrentColumn?.(
																							null
																						);
																					}}
																					style={{
																						visibility:
																							isActive
																								? "visible"
																								: undefined,
																						opacity:
																							isActive
																								? isSelected
																									? 1
																									: 0.5
																								: undefined,
																						top: isActive
																							? "-8px"
																							: undefined,
																						left: isActive
																							? "-8px"
																							: undefined,
																						right: isActive
																							? "-8px"
																							: undefined,
																						bottom: isActive
																							? "-8px"
																							: undefined,
																					}}
																					className="cursor-pointer group-hover:visible group-hover:-left-2 group-hover:-top-2 group-hover:-right-2 group-hover:-bottom-2 group-hover:opacity-50 transition-all duration-100 invisible opacity-0 absolute border-2 -left-1 -top-1 -right-1 -bottom-1 z-10 border-[var(--ax-colors-border-focus)] rounded-[4px] rounded-tl-none"
																				>
																					<div className="bg-[var(--ax-colors-border-focus)] flex gap-1 items-center text-white text-[9px] absolute px-2 py-[3px] rounded-[4px] -top-7 -left-[2px] rounded-b-none">
																						{(() => {
																							switch (
																								type
																							) {
																								case "Heading":
																								case "ct-heading":
																									return (
																										<IconHeading
																											size={
																												12
																											}
																										/>
																									);
																								case "Text":
																								case "ct-text":
																									return (
																										<IconPilcrow
																											size={
																												12
																											}
																										/>
																									);
																								case "Input":
																								case "ct-input":
																									return (
																										<IconForms
																											size={
																												12
																											}
																										/>
																									);
																								case "Button":
																								case "ct-button":
																									return (
																										<IconRectangle
																											size={
																												12
																											}
																										/>
																									);
																								case "Image":
																								case "ct-image":
																								case "ct-image-block":
																									return (
																										<IconImage
																											size={
																												12
																											}
																										/>
																									);
																								default:
																									return (
																										<IconBracketsSquare
																											size={
																												12
																											}
																										/>
																									);
																							}
																						})()}
																						{getElementDisplayName(
																							type
																						) ||
																							"Unknown"}
																					</div>
																				</div>
																			</div>
																		);
																	}
																)}
															</div>
														);
													}
												)}
											</div>
										)
									)}
								</div>
							</section>
						)}

						{useSidenav ? (
							<div className="max-w-[1200px] mx-auto px-6 pt-32 pb-20 grid grid-cols-12 gap-6 items-start overflow-hidden">
								<aside className="col-span-3 sticky top-32 space-y-1">
									{asideOutlines.map((outline) => (
										<div key={outline.id}>{renderOutlineTree(outline)}</div>
									))}
								</aside>
								<div className={`col-span-8 col-start-5 ${sectionSpacing}`}>
									{remainingMainOutlines.map((outline) => (
										<div key={outline.id}>{renderOutlineTree(outline)}</div>
									))}
								</div>
							</div>
						) : useTwoCol ? (
							<div className="max-w-[1200px] mx-auto px-6 grid grid-cols-12 gap-6 items-start overflow-hidden">
								<div className={`col-span-8 ${sectionSpacing}`}>
									{remainingMainOutlines.map((outline) => (
										<div key={outline.id}>{renderOutlineTree(outline)}</div>
									))}
								</div>

								<aside className="col-span-4 space-y-6">
									{asideOutlines.map((outline) => (
										<div key={outline.id}>{renderOutlineTree(outline)}</div>
									))}
								</aside>
							</div>
						) : (
							<div
								className={
									heroSection
										? `max-w-[1200px] mx-auto px-6 mt-6 ${sectionSpacing}`
										: `max-w-[1200px] mx-auto px-6 ${sectionSpacing}`
								}
							>
								{[...remainingMainOutlines, ...asideOutlines].map((outline) => (
									<div key={outline.id}>{renderOutlineTree(outline)}</div>
								))}
							</div>
						)}
					</div>
					{/* Footer - outside grid container */}
					<StrideFooter />
				</div>
			</PreviewWrapper>
		</Box>
	);
}

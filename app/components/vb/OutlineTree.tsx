"use client";

import React, {useMemo, useState, useEffect, useRef} from "react";
import {Box, Button, Text} from "@optiaxiom/react";
import {IconPlus} from "@tabler/icons-react";

import Section from "./Section";
import Row from "./Row";
import Col from "./Col";
import Ele, {EleMap} from "./Ele";
import {getProperty, isImageDrag, isInternalDrag, VB_INTERNAL_MIME} from "./blocks/utils";
import {BLOCK_SCHEMAS} from "./blocks/schemas";
import {initialPages} from "@/app/db/initialData";

/** Extract plain text from a TipTap JSON document (or string) for outline labels. */
function extractPlainText(value: any): string {
	if (!value) return "";
	if (typeof value === "string") {
		try {
			const parsed = JSON.parse(value);
			return extractPlainText(parsed);
		} catch {
			// Strip HTML tags and return plain text
			return value.replace(/<[^>]*>/g, "").trim();
		}
	}
	if (value.type === "text") return value.text ?? "";
	if (Array.isArray(value.content)) return value.content.map(extractPlainText).join("");
	if (Array.isArray(value)) return value.map(extractPlainText).join("");
	return "";
}

/** Extract filename from image URL for image element labels. */
function getImageNameFromUrl(url: string): string {
	if (!url) return "";
	try {
		const urlObj = new URL(url);
		const pathname = urlObj.pathname;
		const parts = pathname.split('/').filter(Boolean);

		// Handle picsum.photos URLs with /seed/{name}/{width}/{height} pattern
		if (urlObj.hostname.includes("picsum.photos") && parts.includes("seed")) {
			const seedIndex = parts.indexOf("seed");
			if (seedIndex >= 0 && seedIndex + 1 < parts.length) {
				return parts[seedIndex + 1];
			}
		}

		return parts[parts.length - 1] || "Image";
	} catch {
		return "Image";
	}
}

interface OutlineProps {
	cloning?: boolean;
	currentHoverEle: string;
	dragging: string | null;
	theEles: EleMap;

	setCurrentEle: React.Dispatch<React.SetStateAction<string>>;
	setDragging: React.Dispatch<React.SetStateAction<string | null>>;
	setData: React.Dispatch<React.SetStateAction<any[]>>;
	setCurrentHoverEle: React.Dispatch<React.SetStateAction<string>>;
	setTheEles: React.Dispatch<React.SetStateAction<EleMap>>;
	onEditProperties?: (id: string) => void;
	onOpenStyleEditor?: (elementId: string) => void;

	data: any[];
}

type AssetDropPosition = {colId: string; position: number} | null;

const getDraggedImageUrl = (dt: DataTransfer) => {
	const url = dt.getData("image/url") || dt.getData("text/uri-list") || dt.getData("text/plain");
	return typeof url === "string" ? url.trim() : "";
};

const getDraggedAlt = (dt: DataTransfer) => {
	const alt = dt.getData("image/alt") || "";
	return typeof alt === "string" ? alt : "";
};

const INSERT_BAR_STYLE: React.CSSProperties = {
	height: "2px",
	backgroundColor: "#0037FF",
	borderRadius: "2px",
	margin: "-1px 0",
	pointerEvents: "none",
};

interface InsertIndicatorProps {
	onHover: (e: React.MouseEvent) => void;
	onAdd: () => void;
	ariaLabel?: string;
}

function InsertIndicator({onHover, onAdd, ariaLabel = "Add Section"}: InsertIndicatorProps) {
	return (
		<div className="ind group h-2 mx-1 relative z-10 -my-1 -mr-[20px]" onMouseEnter={onHover}>
			<Box
				rounded="full"
				className="gap-1 translate-y-0.5 transition duration-500 h-[4px] group-hover:opacity-100 opacity-0 flex items-center justify-center"
			>
				<Box className="bg-black/5 h-1 w-full" />
				<Button
					aria-label={ariaLabel}
					size="sm"
					appearance="subtle"
					className="min-w-6"
					onClick={onAdd}
					icon={<IconPlus size={16} />}
				/>
				<Box className="bg-black/5 h-1 w-full" />
			</Box>
		</div>
	);
}

export default function OutlineTree({
	cloning,
	setDragging,
	theEles,
	setCurrentEle,
	currentHoverEle,
	setCurrentHoverEle,
	data,
	setData,
	setTheEles,
	dragging,
	onEditProperties,
	onOpenStyleEditor,
}: OutlineProps) {
	const ASSET_DRAG_ID = "__asset:image__";

	// Support both old seeded ids (sec-*) and new ids (section-*)
	const isSectionId = (id: string) => id.startsWith("section-") || id.startsWith("sec-");
	const isRowId = (id: string) => id.startsWith("row-");
	const isColId = (id: string) => id.startsWith("col-");
	const isEleId = (id: string) => !isSectionId(id) && !isRowId(id) && !isColId(id);

	// "last" targets (append)
	const isSectionLast = (id: string) => id === "section-last" || id.startsWith("section-last");
	const isRowLast = (id: string) => id.startsWith("row-last-");
	const isColLast = (id: string) => id.startsWith("col-last-");
	const isLastEle = (id: string) => id.startsWith("last-ele-");

	const isAnyInternalDragging = !!dragging && dragging !== ASSET_DRAG_ID;

	const toTitle = (type: string) => {
		const base = type.replace(/^ct-/, "").replace(/-/g, " ");
		return base.charAt(0).toUpperCase() + base.slice(1);
	};

	const elementOptions = useMemo(() => {
		const types = new Set<string>();

		initialPages.forEach((page) => {
			(page.outlines || []).forEach((outline) => {
				Object.values(outline.elements || {}).forEach((ele: any) => {
					if (ele?.type) types.add(ele.type);
				});
			});
		});

		const source = types.size ? Array.from(types) : Object.keys(BLOCK_SCHEMAS);

		return source
			.map((type) => ({
				type,
				label: BLOCK_SCHEMAS[type]?.displayName ?? toTitle(type),
			}))
			.sort((a, b) => a.label.localeCompare(b.label));
	}, []);

	const [assetOverCol, setAssetOverCol] = useState<string | null>(null);
	const [assetDrop, setAssetDrop] = useState<AssetDropPosition>(null);

	type InternalDropPosition = {colId: string; position: number} | null;
	const [internalDrop, setInternalDrop] = useState<InternalDropPosition>(null);

	// Track newly added section for scrolling
	const [newSectionId, setNewSectionId] = useState<string | null>(null);
	const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

	const isInternalEleDrag = (id: string | null) => {
		if (!id) return false;
		if (id === ASSET_DRAG_ID) return false;
		return isEleId(id);
	};

	const clearAssetDnD = () => {
		setAssetOverCol(null);
		setAssetDrop(null);
		setInternalDrop(null);
		// only clear the shared dragging state if we were the one that set it
		setDragging((prev) => (prev === ASSET_DRAG_ID ? null : prev));
	};

	// Set open state for section, row, or col by id
	const setOpen = (id: string, open: boolean) => {
		setData((prev) =>
			prev.map((section) => {
				if (section.id === id) return {...section, open};

				return {
					...section,
					children: (section.children || []).map((row: any) => {
						if (row.id === id) return {...row, open};

						return {
							...row,
							children: (row.children || []).map((col: any) => {
								if (col.id === id) return {...col, open};
								return col;
							}),
						};
					}),
				};
			})
		);
	};

	const getColChildren = (col: any) => col.elements || col.children || [];

	// addSection: if 'at' is null/undefined, append; otherwise insert at index 'at'
	const addSection = (at: number | null | undefined = null) => {
		const t = Date.now();
		const newId = "section-" + t;

		setData((prev) => {
			const mk = () => {
				return {
					id: newId,
					open: true,
					children: [
						{
							id: "row-" + t,
							open: true,
							children: [
								{
									id: "col-" + t,
									open: true,
									elements: [],
								},
							],
						},
					],
				};
			};
			if (at === null || at === undefined) return [...prev, mk()];
			return [...prev.slice(0, at), mk(), ...prev.slice(at)];
		});

		// Set the new section ID to trigger scroll
		setNewSectionId(newId);
	};

	const addCol = (e: any, section: number, row: number, at: any) => {
		e?.stopPropagation();

		setData((prev) => {
			const updatedSection = {
				...prev[section],
				children: prev[section].children.map((r: any, idx: number) => {
					if (idx === row) {
						const newCol = {
							label: "Column",
							elements: [],
							isNew: true,
							open: true,
							id: "col-" + Date.now(),
						};
						const newChildren =
							at === null || at === undefined
								? [...r.children, newCol]
								: [...r.children.slice(0, at), newCol, ...r.children.slice(at)];
						return {...r, open: true, children: newChildren};
					}
					return r;
				}),
			};
			return [...prev.slice(0, section), updatedSection, ...prev.slice(section + 1)];
		});
	};

	const addRow = (e: any, section: number, at: any) => {
		e?.stopPropagation();

		setData((prev) => {
			const newRow = {
				label: "Row",
				open: true,
				isNew: true,
				children: [
					{
						label: "Column",
						elements: [],
						open: true,
						isNew: true,
						id: "col-" + Date.now(),
					},
				],
				id: "row-" + Date.now(),
			};

			const sectionObj = prev[section];
			const newChildren =
				at === null || at === undefined
					? [...sectionObj.children, newRow]
					: [
							...sectionObj.children.slice(0, at),
							newRow,
							...sectionObj.children.slice(at),
						];

			return [
				...prev.slice(0, section),
				{...sectionObj, open: true, children: newChildren},
				...prev.slice(section + 1),
			];
		});
	};

	// addElement used by Col "+" menu
	const addElement = (type: string, colIndex: number, rowIndex: number, sectionIndex: number) => {
		const uKey = `${type}-${Date.now()}`;

		const pendingImageData = (window as any).__pendingImageData;
		const imageUrl = pendingImageData?.url || "";
		const imageAlt = pendingImageData?.alt || "";

		setTheEles((prev) => ({
			...prev,
			[uKey]: {
				type,
				properties: (() => {
					const schema = BLOCK_SCHEMAS[type];
					if (schema) {
						const props: Record<string, {value: any}> = {};
						Object.entries(schema.properties).forEach(([key, def]) => {
							props[key] = {value: def.default ?? ""};
						});

						// Special case for image if we have pending data
						if (type === "ct-image" && imageUrl) {
							if (props["title"]) props["title"].value = imageAlt || "Untitled Image";
							if (props["altText"]) props["altText"].value = imageAlt;
							if (props["imageUrl"]) props["imageUrl"].value = imageUrl;
						}

						return props;
					}

					return {};
				})(),
			},
		}));

		setData((prev) =>
			prev.map((section, sIdx) => {
				if (sIdx !== sectionIndex) return section;
				return {
					...section,
					children: section.children.map((row: any, rIdx: number) => {
						if (rIdx !== rowIndex) return row;
						return {
							...row,
							children: row.children.map((col: any, cIdx: number) => {
								if (cIdx !== colIndex) return col;

								const nextChildren = [...(getColChildren(col) ?? [])];
								let insertAt = nextChildren.length;

								if (
									typeof currentHoverEle === "string" &&
									currentHoverEle.startsWith("last-ele-")
								) {
									const targetColId = currentHoverEle.replace("last-ele-", "");
									if (targetColId === col.id) insertAt = nextChildren.length;
								} else if (
									typeof currentHoverEle === "string" &&
									currentHoverEle !== "none"
								) {
									const idx = nextChildren.findIndex(
										(r: any) => r?.id === currentHoverEle
									);
									if (idx !== -1) insertAt = idx;
								}

								nextChildren.splice(insertAt, 0, {id: uKey});
								// Normalizing to use 'elements' for columns
								const {children: _old, ...rest} = col;
								return {...rest, open: true, elements: nextChildren};
							}),
						};
					}),
				};
			})
		);
	};

	const removeSection = (sectionIndex: number) => {
		setData((prev) => prev.filter((_, index: number) => index !== sectionIndex));
	};

	const removeRow = (id: string) => {
		setData((prev) =>
			prev.map((section) => ({
				...section,
				children: section.children.filter((row: any) => row.id !== id),
			}))
		);
	};

	const removeCol = (id: string) => {
		setData((prev) =>
			prev.map((section) => ({
				...section,
				children: section.children.map((row: any) => ({
					...row,
					children: row.children.filter((col: any) => col.id !== id),
				})),
			}))
		);
	};

	const removeEle = (id: string) => {
		setData((prev) =>
			prev.map((section) => ({
				...section,
				children: (section.children || []).map((row: any) => ({
					...row,
					children: (row.children || []).map((col: any) => {
						const nextElements = (getColChildren(col) || []).filter(
							(ele: any) => ele.id !== id
						);
						const {children: _old, ...rest} = col;
						return {...rest, elements: nextElements};
					}),
				})),
			}))
		);
	};

	const onDragHover = (e: any, id: string) => {
		e.preventDefault();
		e.stopPropagation();
		setCurrentHoverEle(id);
	};

	const onDragStart = (e: any, id: string) => {
		e.stopPropagation();
		try {
			if (e?.dataTransfer) {
				e.dataTransfer.setData(VB_INTERNAL_MIME, id);
				e.dataTransfer.effectAllowed = cloning ? "copy" : "move";
			}
		} catch {}
		setDragging(id);
	};

	const moveEle = (eleId: string, targetColId: string, position: number) => {
		setData((prev) => {
			let movedEleNode: any = null;

			// Step 1: Remove the element from its current position
			const dataWithoutEle = prev.map((section: any) => ({
				...section,
				children: (section.children || []).map((row: any) => ({
					...row,
					children: (row.children || []).map((col: any) => {
						const colChildren = getColChildren(col);
						const found = colChildren.find((e: any) => e.id === eleId);
						if (found) movedEleNode = found;
						const nextChildren = colChildren.filter((e: any) => e.id !== eleId);
						// Normalize to use elements
						const {children: _old, ...rest} = col;
						return {...rest, elements: nextChildren};
					}),
				})),
			}));

			if (!movedEleNode) return prev;

			// Step 2: Insert into the target column
			return dataWithoutEle.map((section: any) => ({
				...section,
				children: (section.children || []).map((row: any) => ({
					...row,
					children: (row.children || []).map((col: any) => {
						if (col.id !== targetColId) return col;
						const nextChildren = [...getColChildren(col)];
						const safePos = Math.max(0, Math.min(nextChildren.length, position));
						nextChildren.splice(safePos, 0, movedEleNode);
						return {...col, elements: nextChildren, open: true};
					}),
				})),
			}));
		});
	};

	// Scroll to newly added section
	useEffect(() => {
		if (newSectionId) {
			// Use requestAnimationFrame to ensure DOM is fully rendered
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					// Try using data attribute query as fallback
					const element = sectionRefs.current[newSectionId] ||
						document.querySelector(`[data-section-id="${newSectionId}"]`);
					if (element) {
						element.scrollIntoView({ behavior: 'smooth', block: 'start' });
					}
					// Clear the new section ID after scrolling
					setNewSectionId(null);
				});
			});
		}
	}, [newSectionId]);

	const insertImageIntoTree = (
		colId: string,
		position: number,
		imageUrl: string,
		imageAlt: string
	) => {
		const uKey = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

		setTheEles((prev) => ({
			...prev,
			[uKey]: {
				type: "ct-image",
				properties: {
					imageUrl: {value: imageUrl},
					altText: {value: imageAlt || "Untitled Image"},
					width: {value: "auto"},
					height: {value: "auto"},
				},
			},
		}));

		setData((prev) =>
			prev.map((section: any) => ({
				...section,
				children: (section.children || []).map((row: any) => ({
					...row,
					children: (row.children || []).map((col: any) => {
						if (col.id !== colId) return col;
						const nextChildren = [...(getColChildren(col) || [])];
						const safePos = Math.max(0, Math.min(nextChildren.length, position));
						nextChildren.splice(safePos, 0, {id: uKey});
						const {children: _old, ...rest} = col;
						return {...rest, elements: nextChildren, open: true};
					}),
				})),
			}))
		);
	};

	return (
		<div
			className="relative min-h-[300px] pr-3"
			onDragLeave={(e) => {
				if (e.currentTarget === e.target) clearAssetDnD();
			}}
		>
			<Box fontSize="sm" color="fg.secondary">
				{data.map((section: any, sindex: number) => {
					const showSectionBarAbove =
						isAnyInternalDragging &&
						dragging &&
						isSectionId(dragging) &&
						currentHoverEle === section.id;

					return (
						<div
							key={sindex}
							data-section-id={section.id}
							ref={(el) => {
								if (el && section.id) {
									sectionRefs.current[section.id] = el;
								}
							}}
							onDragOver={(e) => {
								// allow dropping section BEFORE this section
								if (dragging && isSectionId(dragging)) onDragHover(e, section.id);
							}}
						>
							{showSectionBarAbove && <div style={INSERT_BAR_STYLE} />}
							{!dragging && !data[sindex - 1]?.open && (
								<InsertIndicator
									onHover={(e) => onDragHover(e, section.id)}
									onAdd={() => addSection(sindex)}
								/>
							)}
							<Section
								setOpen={setOpen}
								section={section}
								onDragStart={(e: any) => onDragStart(e, section.id)}
								removeSection={() => removeSection(sindex)}
								onEditProperties={() => onEditProperties?.(section.id)}
								onOpenStyleEditor={() => onOpenStyleEditor?.(section.id)}
								// Add Section Before
								addSection={() => addSection(sindex)}
								// Add Section After
								addSectionAfter={() => addSection(sindex + 1)}
								addRow={(e: any) => addRow(e, sindex, null)}
							>
								{(section.children ?? []).map((row: any, rIndex: number) => {
									const showRowBarAbove =
										isAnyInternalDragging &&
										dragging &&
										isRowId(dragging) &&
										currentHoverEle === row.id;

									return (
										<div
											key={rIndex}
											onDragOver={(e) => {
												if (dragging && isRowId(dragging))
													onDragHover(e, row.id);
											}}
										>
											{showRowBarAbove && <div style={INSERT_BAR_STYLE} />}

											<Row
												row={row}
												addRow={(e: any) => addRow(e, sindex, rIndex)}
												addRowBelow={(e: any) =>
													addRow(e, sindex, rIndex + 1)
												}
												setOpen={setOpen}
												onDragStart={(e: any) => onDragStart(e, row.id)}
												removeRow={() => removeRow(row.id)}
												addCol={(e: any) => addCol(e, sindex, rIndex, null)}
											>
												{(row.children ?? []).map(
													(col: any, cIndex: number) => {
														const showColBarAbove =
															isAnyInternalDragging &&
															dragging &&
															isColId(dragging) &&
															currentHoverEle === col.id;

														return (
															<div
																key={cIndex}
																onDragOver={(e) => {
																	if (
																		dragging &&
																		isColId(dragging)
																	)
																		onDragHover(e, col.id);
																}}
															>
																{showColBarAbove && (
																	<div style={INSERT_BAR_STYLE} />
																)}

																<Col
																	col={col}
																	setOpen={setOpen}
																	onDragStart={(e: any) =>
																		onDragStart(e, col.id)
																	}
																	removeCol={() =>
																		removeCol(col.id)
																	}
																	addElement={(type: string) =>
																		addElement(
																			type,
																			cIndex,
																			rIndex,
																			sindex
																		)
																	}
																	elementOptions={elementOptions}
																>
																	<div
																		className={
																			assetOverCol === col.id
																				? "relative"
																				: ""
																		}
																		style={{
																			minHeight:
																				(
																					getColChildren(
																						col
																					) || []
																				).length === 0
																					? "32px"
																					: "8px",
																		}}
																		onDragEnter={(e) => {
																			if (
																				isImageDrag(
																					e.dataTransfer
																				)
																			) {
																				e.preventDefault();
																				e.stopPropagation();
																				setDragging(
																					ASSET_DRAG_ID
																				);
																				return;
																			}

																			if (
																				isInternalEleDrag(
																					dragging
																				)
																			) {
																				e.preventDefault();
																				e.stopPropagation();
																			}
																		}}
																		onDragOver={(e) => {
																			if (
																				isImageDrag(
																					e.dataTransfer
																				)
																			) {
																				e.preventDefault();
																				e.stopPropagation();

																				setDragging(
																					ASSET_DRAG_ID
																				);
																				setAssetOverCol(
																					col.id
																				);

																				const wrappers =
																					e.currentTarget.querySelectorAll<HTMLElement>(
																						"[data-tree-ele-id]"
																					);
																				const mouseY =
																					e.clientY;

																				let insertPosition =
																					(
																						getColChildren(
																							col
																						) || []
																					).length;
																				for (
																					let k = 0;
																					k <
																					wrappers.length;
																					k++
																				) {
																					const rect =
																						wrappers[
																							k
																						].getBoundingClientRect();
																					const middle =
																						rect.top +
																						rect.height /
																							2;
																					if (
																						mouseY <
																						middle
																					) {
																						insertPosition =
																							k;
																						break;
																					}
																				}

																				setAssetDrop({
																					colId: col.id,
																					position:
																						insertPosition,
																				});
																				return;
																			}

																			if (
																				isInternalEleDrag(
																					dragging
																				)
																			) {
																				e.preventDefault();
																				e.stopPropagation();

																				const wrappers =
																					e.currentTarget.querySelectorAll<HTMLElement>(
																						"[data-tree-ele-id]"
																					);
																				const mouseY =
																					e.clientY;

																				let insertPosition =
																					(
																						getColChildren(
																							col
																						) || []
																					).length;
																				for (
																					let k = 0;
																					k <
																					wrappers.length;
																					k++
																				) {
																					const rect =
																						wrappers[
																							k
																						].getBoundingClientRect();
																					const middle =
																						rect.top +
																						rect.height /
																							2;
																					if (
																						mouseY <
																						middle
																					) {
																						insertPosition =
																							k;
																						break;
																					}
																				}

																				setInternalDrop({
																					colId: col.id,
																					position:
																						insertPosition,
																				});

																				const colChildren =
																					getColChildren(
																						col
																					) || [];
																				const hoverId =
																					insertPosition >=
																					colChildren.length
																						? `last-ele-${col.id}`
																						: (colChildren[
																								insertPosition
																							]?.id ??
																							`last-ele-${col.id}`);

																				setCurrentHoverEle(
																					hoverId
																				);
																			}
																		}}
																		onDragLeave={(e) => {
																			e.stopPropagation();
																			if (
																				e.currentTarget ===
																				e.target
																			) {
																				setAssetOverCol(
																					null
																				);
																				setAssetDrop(null);
																				setInternalDrop(
																					null
																				);
																			}
																		}}
																		onDrop={(e) => {
																			if (
																				isImageDrag(
																					e.dataTransfer
																				)
																			) {
																				e.preventDefault();
																				e.stopPropagation();

																				const url =
																					getDraggedImageUrl(
																						e.dataTransfer
																					);
																				const alt =
																					getDraggedAlt(
																						e.dataTransfer
																					);

																				const dp =
																					assetDrop;
																				clearAssetDnD();

																				if (
																					!url ||
																					!dp ||
																					dp.colId !==
																						col.id
																				)
																					return;
																				insertImageIntoTree(
																					dp.colId,
																					dp.position,
																					url,
																					alt
																				);
																				return;
																			}

																			if (
																				isInternalEleDrag(
																					dragging
																				)
																			) {
																				e.preventDefault();
																				e.stopPropagation();
																				if (
																					internalDrop &&
																					internalDrop.colId ===
																						col.id
																				) {
																					moveEle(
																						dragging as string,
																						internalDrop.colId,
																						internalDrop.position
																					);
																				}
																				setInternalDrop(
																					null
																				);
																				setDragging(null);
																			}
																		}}
																	>
																		{/* Empty state for columns with no elements */}
																		{(getColChildren(col) ?? []).length === 0 && !dragging && (
																			<Box
																				display="flex"
																				flexDirection="column"
																				alignItems="center"
																				justifyContent="center"
																				gap="8"
																				p="16"
																				rounded="md"
																				bg="bg.default.hovered"
																				style={{
																					minHeight: "80px",
																					border: "1px dashed var(--border-secondary)",
																				}}
																			>
																				<Text fontSize="sm" color="fg.tertiary" textAlign="center">
																					Drop elements here or use the + button
																				</Text>
																			</Box>
																		)}

																		{(
																			getColChildren(col) ??
																			[]
																		).map(
																			(
																				element: any,
																				j: number
																			) => {
																				const isAssetActive =
																					assetOverCol ===
																						col.id &&
																					assetDrop?.colId ===
																						col.id;
																				const isInternalActive =
																					isInternalEleDrag(
																						dragging
																					) &&
																					internalDrop?.colId ===
																						col.id;

																				return (
																					<React.Fragment
																						key={
																							"ele-frag-" +
																							element.id
																						}
																					>
																						{isInternalActive &&
																							internalDrop?.position ===
																								j && (
																								<div
																									style={
																										INSERT_BAR_STYLE
																									}
																								/>
																							)}
																						{isAssetActive &&
																							assetDrop?.position ===
																								j && (
																								<div
																									style={
																										INSERT_BAR_STYLE
																									}
																								/>
																							)}

																						<div
																							data-tree-ele-id={
																								element.id
																							}
																						>
																							<Ele
																								removeEle={() =>
																									removeEle(
																										element.id
																									)
																								}
																								onDragStart={(
																									ev: any
																								) =>
																									onDragStart(
																										ev,
																										element.id
																									)
																								}
																								type={
																									theEles[
																										element
																											.id
																									]
																										?.type
																								}
																								element={
																									element
																								}
																								label={
																									getProperty(
																										theEles[
																											element
																												.id
																										]
																											?.properties,
																										"text",
																										"Text"
																									) ||
																									getProperty(
																										theEles[
																											element
																												.id
																										]
																											?.properties,
																										"label",
																										"Label"
																									) ||
																									getProperty(
																										theEles[
																											element
																												.id
																										]
																											?.properties,
																										"name",
																										"Name"
																									) ||
																									getProperty(
																										theEles[
																											element
																												.id
																										]
																											?.properties,
																										"alt",
																										"Alt Text"
																									) ||
																									getImageNameFromUrl(
																										getProperty(
																											theEles[
																												element
																													.id
																											]
																												?.properties,
																											"image",
																											"Image"
																										)
																									) ||
																									extractPlainText(
																										getProperty(
																											theEles[
																												element
																													.id
																											]
																												?.properties,
																											"richtext",
																											"Rich Text"
																										)
																									) ||
																									undefined
																								}
																								setCurrentEle={
																									setCurrentEle
																								}
																								setCurrentHoverEle={
																									setCurrentHoverEle
																								}
																								onOpenStyleEditor={
																									onOpenStyleEditor
																										? () => onOpenStyleEditor(element.id)
																										: undefined
																								}
																							/>
																						</div>
																					</React.Fragment>
																				);
																			}
																		)}

																		{isInternalEleDrag(
																			dragging
																		) &&
																			internalDrop?.colId ===
																				col.id &&
																			internalDrop?.position ===
																				(
																					getColChildren(
																						col
																					) ?? []
																				).length && (
																				<div
																					style={
																						INSERT_BAR_STYLE
																					}
																				/>
																			)}

																		{assetOverCol === col.id &&
																			assetDrop?.colId ===
																				col.id &&
																			assetDrop?.position ===
																				(
																					getColChildren(
																						col
																					) ?? []
																				).length && (
																				<div
																					style={
																						INSERT_BAR_STYLE
																					}
																				/>
																			)}
																	</div>
																</Col>

																{cIndex ===
																	(row.children ?? []).length -
																		1 && (
																	<div
																		onDragOver={(e) => {
																			if (
																				dragging &&
																				isColId(dragging)
																			)
																				onDragHover(
																					e,
																					`col-last-${row.id}`
																				);
																		}}
																	>
																		{isAnyInternalDragging &&
																			dragging &&
																			isColId(dragging) &&
																			currentHoverEle ===
																				`col-last-${row.id}` && (
																				<div
																					style={
																						INSERT_BAR_STYLE
																					}
																				/>
																			)}
																	</div>
																)}
															</div>
														);
													}
												)}

												{(row.children ?? []).length === 0 && (
													<div
														onDragOver={(e) => {
															if (dragging && isColId(dragging))
																onDragHover(
																	e,
																	`col-last-${row.id}`
																);
														}}
													>
														{isAnyInternalDragging &&
															dragging &&
															isColId(dragging) &&
															currentHoverEle ===
																`col-last-${row.id}` && (
																<div style={INSERT_BAR_STYLE} />
															)}
													</div>
												)}
											</Row>

											{rIndex === (section.children ?? []).length - 1 && (
												<div
													onDragOver={(e) => {
														if (dragging && isRowId(dragging))
															onDragHover(
																e,
																`row-last-${section.id}`
															);
													}}
												>
													{isAnyInternalDragging &&
														dragging &&
														isRowId(dragging) &&
														currentHoverEle ===
															`row-last-${section.id}` && (
															<div style={INSERT_BAR_STYLE} />
														)}
												</div>
											)}
										</div>
									);
								})}

								{(section.children ?? []).length === 0 && (
									<div
										onDragOver={(e) => {
											if (dragging && isRowId(dragging))
												onDragHover(e, `row-last-${section.id}`);
										}}
										style={{height: 10}}
									>
										{isAnyInternalDragging &&
											dragging &&
											isRowId(dragging) &&
											currentHoverEle === `row-last-${section.id}` && (
												<div style={INSERT_BAR_STYLE} />
											)}
									</div>
								)}
							</Section>
							{sindex === data.length - 1 && (
								<div
									onDragOver={(e) => {
										if (dragging && isSectionId(dragging))
											onDragHover(e, "section-last");
									}}
									style={{height: 10}}
								>
									{isAnyInternalDragging &&
										dragging &&
										isSectionId(dragging) &&
										currentHoverEle === "section-last" && (
											<div style={INSERT_BAR_STYLE} />
										)}
								</div>
							)}
						</div>
					);
				})}

				{data.length === 0 && !dragging && (
					<Box
						display="flex"
						flexDirection="column"
						alignItems="center"
						justifyContent="center"
						gap="12"
						p="32"
						rounded="md"
						bg="bg.default.hovered"
						style={{
							minHeight: "200px",
							border: "1px dashed var(--border-secondary)",
						}}
					>
						<Text fontSize="md" fontWeight="600" color="fg.secondary">
							No sections yet
						</Text>
						<Text fontSize="sm" color="fg.tertiary" textAlign="center">
							Click the + button above or drag elements to get started
						</Text>
					</Box>
				)}
				{data.length === 0 && dragging && (
					<div
						onDragOver={(e) => {
							if (dragging && isSectionId(dragging)) onDragHover(e, "section-last");
						}}
						style={{height: 10}}
					>
						{isAnyInternalDragging &&
							dragging &&
							isSectionId(dragging) &&
							currentHoverEle === "section-last" && <div style={INSERT_BAR_STYLE} />}
					</div>
				)}
			</Box>
		</div>
	);
}

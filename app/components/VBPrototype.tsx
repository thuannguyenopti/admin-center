"use client";

import {
	Box,
	Button,
	Field,
	Text,
	Input as Input2,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	Select,
	SelectTrigger,
	SelectContent,
	Textarea,
	NavBody,
	Heading,
	Menu,
	MenuTrigger,
	MenuContent,
} from "@optiaxiom/react";
import React, { useEffect, useRef, useState } from "react";
import {
	IconPlus,
	IconPilcrow,
	IconForms,
	IconRectangle,
	IconHeading,
	IconBrackets,
	IconArrowBarBoth,
	IconFile,
	IconPhoto,
	IconSparkles,
	IconSquare,
	IconSection,
} from "@tabler/icons-react";

import Section from "./vb/Section";
import Row from "./vb/Row";
import Col from "./vb/Col";
import Ele from "./vb/Ele";
import ElementEditor from "./vb/ElementEditor";
// import OutlineHeader from "./vb/OutlineHeader"; // intentionally not used (avoids nested tabs + duplicate tab bars)
import PreviewCanvas from "./vb/PreviewCanvas";
import RightToolbar from "./RightToolbar";
import CMSToolbar from "./CMSToolbar";
import ImageSelectorPanel from "./ImageSelector/ImageSelectorPanel";
import styles from "./VBPrototype.module.css";

/** -----------------------------
 * Types + helpers (normalize / prune)
 * ------------------------------*/

type EleMap = Record<string, { type: string; props: any[] }>;
type NormalizeResult = { data: any[]; theEles: EleMap };
type SplitPayload = { data: any[]; theEles: EleMap };

const isEleNode = (n: any) =>
	n &&
	typeof n === "object" &&
	typeof n.id === "string" &&
	typeof n.type === "string" &&
	Array.isArray(n.props);

const ensureOpen = (nodes: any[]): any[] => {
	return nodes.map((node) => ({
		...node,
		open: node.open ?? true,
		children: Array.isArray(node.children) ? ensureOpen(node.children) : node.children,
	}));
};

// only strips truly transient flags (keep `open`)
const stripTransientFlags = (nodes: any[]): any[] => {
	return nodes.map((n) => {
		const { isNew, ...rest } = n;
		return {
			...rest,
			children: Array.isArray(n.children) ? stripTransientFlags(n.children) : n.children,
		};
	});
};

const normalizePage = (input: any): NormalizeResult => {
	// Case A: already split
	if (
		input &&
		typeof input === "object" &&
		Array.isArray((input as SplitPayload).data) &&
		(input as SplitPayload).theEles
	) {
		return {
			data: ensureOpen(stripTransientFlags((input as SplitPayload).data)),
			theEles: (input as SplitPayload).theEles || {},
		};
	}

	// Case B: merged tree array
	if (!Array.isArray(input)) return { data: [], theEles: {} };

	const theEles: EleMap = {};

	const strip = (node: any): any => {
		if (isEleNode(node)) {
			theEles[node.id] = { type: node.type, props: node.props };
			return { id: node.id };
		}

		const out: any = { ...node };
		if (Array.isArray(node.children)) out.children = node.children.map(strip);
		return out;
	};

	return {
		data: ensureOpen(stripTransientFlags(input.map(strip))),
		theEles,
	};
};

const collectElementIds = (data: any[]): Set<string> => {
	const ids = new Set<string>();
	for (const section of data) {
		for (const row of section.children || []) {
			for (const col of row.children || []) {
				for (const ref of col.children || []) {
					if (ref?.id) ids.add(ref.id);
				}
			}
		}
	}
	return ids;
};

const pruneEles = (data: any[], theEles: EleMap): EleMap => {
	const used = collectElementIds(data);
	const out: EleMap = {};
	for (const id of used) if (theEles[id]) out[id] = theEles[id];
	return out;
};

/** -----------------------------
 * AnimatedText (kept; optional)
 * ------------------------------*/

const AnimatedText: React.FC<{ texts: string[]; interval?: number }> = ({
	texts,
	interval = 2000,
}) => {
	const [index, setIndex] = useState(0);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		timeoutRef.current = setTimeout(() => {
			setIndex((prev) => (prev + 1) % texts.length);
		}, interval);
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, [index, texts.length, interval]);

	return <span>{texts[index]}</span>;
};

type Outline = {
	id: string;
	title: string;
	tree: any[];
	elements: EleMap;
};

const isOutlineArray = (v: any): v is Outline[] => {
	if (!Array.isArray(v)) return false;
	if (v.length === 0) return true; // allow "0 outlines"
	const o = v[0];
	return (
		o &&
		typeof o === "object" &&
		typeof o.id === "string" &&
		typeof o.title === "string" &&
		Array.isArray(o.tree) &&
		typeof o.elements === "object"
	);
};

type PageProperties = {
	seoTitle?: string;
	keywords?: string;
	description?: string;
	meta?: string;
	campaignMode?: "no" | "yes";
	someOtherSetting?: "setting1" | "setting2";
};

type PageInput = {
	outlines?: Outline[] | any[] | SplitPayload; // allow legacy too
	properties?: PageProperties;
};

function PropertiesPanel({
	value,
	onChange,
}: {
	value: PageProperties;
	onChange: (patch: Partial<PageProperties>) => void;
}) {
	return (
		<Box py="16" fontSize="sm">
			<Box mb="16">
				<Text fontSize="sm" fontWeight="600" mb="8">
					SEO
				</Text>

				<Box display="flex" flexDirection="column" gap="8">
					<Field label="Title">
						<Input2
							placeholder="Enter page title"
							value={value.seoTitle ?? ""}
							onChange={(e: any) => onChange({ seoTitle: e.target.value })}
						/>
					</Field>

					<Field label="Keywords">
						<Input2
							placeholder="Enter keywords"
							value={value.keywords ?? ""}
							onChange={(e: any) => onChange({ keywords: e.target.value })}
						/>
					</Field>

					<Field label="Description">
						<Textarea
							placeholder="Enter description"
							rows={3}
							value={value.description ?? ""}
							onChange={(e: any) => onChange({ description: e.target.value })}
						/>
					</Field>

					<Field label="Meta">
						<Textarea
							placeholder="Enter meta information"
							rows={3}
							value={value.meta ?? ""}
							onChange={(e: any) => onChange({ meta: e.target.value })}
						/>
					</Field>
				</Box>
			</Box>

			<Box>
				<Text fontSize="sm" fontWeight="600" mb="8">
					Settings
				</Text>

				<Box display="flex" flexDirection="column" gap="8">
					<Field label="Campaign Mode">
						<Select
							value={value.campaignMode ?? "no"}
							onValueChange={(v: any) => onChange({ campaignMode: v })}
							options={[
								{ label: "No", value: "no" },
								{ label: "Yes", value: "yes" },
							]}
						>
							<SelectTrigger>{value.campaignMode ?? "no"}</SelectTrigger>
							<SelectContent />
						</Select>
					</Field>

					<Field label="Some other setting">
						<Select
							value={value.someOtherSetting ?? "setting1"}
							onValueChange={(v: any) => onChange({ someOtherSetting: v })}
							options={[
								{ label: "A setting", value: "setting1" },
								{ label: "Another setting", value: "setting2" },
							]}
						>
							<SelectTrigger>{value.someOtherSetting ?? "setting1"}</SelectTrigger>
							<SelectContent />
						</Select>
					</Field>
				</Box>
			</Box>
		</Box>
	);
}
/** -----------------------------
 * Outline (TREE ONLY)
 * ------------------------------*/

interface OutlineProps {
	cloning?: boolean;
	currentHoverEle: string;
	dragging: string | null;
	theEles: EleMap;

	setCurrentEle: React.Dispatch<React.SetStateAction<string>>;
	setDragging: React.Dispatch<React.SetStateAction<string>>;
	setData: React.Dispatch<React.SetStateAction<any[]>>;
	setCurrentHoverEle: React.Dispatch<React.SetStateAction<string>>;
	setTheEles: React.Dispatch<React.SetStateAction<EleMap>>;

	data: any[];
}

const Outline: React.FC<OutlineProps> = ({
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
}) => {
	// Set open state for section, row, or col by id
	const setOpen = (id: string, open: boolean) => {
		setData((prev) =>
			prev.map((section) => {
				if (section.id === id) {
					return { ...section, open };
				}
				return {
					...section,
					children: section.children.map((row: any) => {
						if (row.id === id) {
							return { ...row, open };
						}
						return {
							...row,
							children: row.children.map((col: any) => {
								if (col.id === id) {
									return { ...col, open };
								}
								return col;
							}),
						};
					}),
				};
			})
		);
	};

	const addSection = (id: string) => {
		setData((prev) => {
			const idx = prev.findIndex((section) => section.id === id);
			const mk = () => {
				const t = Date.now();
				return {
					id: "section-" + t,
					open: true,
					children: [
						{
							id: "row-" + t,
							open: true,
							children: [
								{
									id: "col-" + t,
									open: true,
									children: [],
								},
							],
						},
					],
				};
			};

			if (idx === -1) return [...prev, mk()];
			return [...prev.slice(0, idx), mk(), ...prev.slice(idx)];
		});
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
							children: [],
							isNew: true,
							open: true,
							id: "col-" + Date.now(),
						};
						const newChildren =
							at === null || at === undefined
								? [...r.children, newCol]
								: [...r.children.slice(0, at), newCol, ...r.children.slice(at)];
						return { ...r, open: true, children: newChildren };
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
						children: [],
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
					: [...sectionObj.children.slice(0, at), newRow, ...sectionObj.children.slice(at)];

			return [
				...prev.slice(0, section),
				{ ...sectionObj, open: true, children: newChildren },
				...prev.slice(section + 1),
			];
		});
	};

	const addElement = (type: string, colIndex: number, rowIndex: number, sectionIndex: number) => {
		const uKey = `${type}-${Date.now()}`;

		// Pending image data from drag-and-drop (optional)
		const pendingImageData = (window as any).__pendingImageData;
		const imageUrl = pendingImageData?.url || "";
		const imageAlt = pendingImageData?.alt || "";

		setTheEles((prev) => ({
			...prev,
			[uKey]: {
				type,
				props: (() => {
					switch (type) {
						case "Heading":
							return [{ type: "text", label: "Text" }];
						case "Text":
							return [{ type: "text", label: "Text" }];
						case "Input":
							return [
								{ type: "text", label: "Label" },
								{ type: "text", label: "Placeholder" },
								{ type: "text", label: "Tooltip" },
								{ type: "checkbox", label: "Required", value: false },
							];
						case "Button":
							return [{ type: "text", label: "Label" }];
						case "Image":
							return [
								{ type: "text", label: "Image URL", value: imageUrl },
								{ type: "text", label: "Title", value: imageAlt || "Untitled Image" },
								{ type: "text", label: "Alt Text", value: imageAlt },
								{ type: "text", label: "Width", value: "auto" },
								{ type: "text", label: "Height", value: "auto" },
							];
						default:
							return [];
					}
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
								return { ...col, children: [...col.children, { id: uKey }] };
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
				children: section.children.map((row: any) => ({
					...row,
					children: row.children.map((col: any) => ({
						...col,
						children: col.children.filter((ele: any) => ele.id !== id),
					})),
				})),
			}))
		);
	};

	const onDragStart = (e: any, id: string) => {
		e.stopPropagation();
		e.preventDefault();
		setDragging(id);
	};

	const onDragHover = (e: any, id: string) => {
		e.stopPropagation();
		e.preventDefault();
		if (dragging) setCurrentHoverEle("" + id);
	};

	return (
		<div className="relative min-h-[300px]">
			<Box fontSize="sm" color="fg.secondary">
				{data.map((section: any, sindex: number) => (
					<div key={sindex}>
						{/* add section above */}
						{!dragging && !data[sindex - 1]?.open && (
							<div
								className="ind group h-2 mx-1 relative z-10 -my-1 -mr-[20px]"
								onMouseEnter={(e) => onDragHover(e, section.id)}
							>
								<Box
									rounded="full"
									className="gap-1 translate-y-0.5 transition duration-500 h-[4px] group-hover:opacity-100 opacity-0 flex items-center justify-center"
								>
									<Box className="bg-black/5 h-1 w-full" />
									<Button
										aria-label="Add Section"
										size="sm"
										appearance="subtle"
										className="min-w-6"
										onClick={() => addSection(section.id)}
										icon={<IconPlus size={16} />}
									/>
									<Box className="bg-black/5 h-1 w-full" />
								</Box>
							</div>
						)}

						{/* dropping above section */}
						{dragging?.startsWith("section-") &&
							((section.id !== dragging && data[sindex - 1]?.id !== dragging) || cloning) && (
								<div
									className="ind group h-8 mx-1 relative z-10 -my-4 pt-[14px] -mr-[20px]"
									onMouseEnter={(e) => onDragHover(e, section.id)}
								>
									<Box
										bg="bg.accent"
										rounded="full"
										className="transition duration-500 h-[4px] group-hover:opacity-100 opacity-10"
									/>
								</div>
							)}

						<Section
							setOpen={setOpen}
							section={section}
							onDragStart={(e: any) => onDragStart(e, section.id)}
							removeSection={() => removeSection(sindex)}
							addSection={() => addSection(section.id)}
							addRow={(e: any) => addRow(e, sindex, null)}
						>
							{(section.children ?? []).map((row: any, index: number) => (
								<div key={index}>
									{/* add row above */}
									{!dragging && !section.children[index - 1]?.open && (
										<div
											className="ind group h-2 relative z-10 -my-1"
											onMouseEnter={(e) => onDragHover(e, section.id)}
										>
											<Box
												rounded="full"
												className="gap-1 translate-y-0.5 transition duration-500 h-[4px] group-hover:opacity-100 opacity-0 flex items-center justify-center"
											>
												<Box className="bg-black/5 h-1 w-full" />
												<Button
													aria-label="Add Row"
													size="sm"
													appearance="subtle"
													className="min-w-6"
													onClick={(e: any) => addRow(e, sindex, index)}
													icon={<IconPlus size={16} />}
												/>
												<Box className="bg-black/5 h-1 w-full" />
											</Box>
										</div>
									)}

									{/* dropping above row */}
									{dragging?.startsWith("row-") &&
										((row.id !== dragging && section.children[index - 1]?.id !== dragging) ||
											cloning) && (
											<div
												className="ind group h-8 mx-1 relative z-10 -my-4 pt-[14px] -mr-[20px] ml-5"
												onMouseEnter={(e) => onDragHover(e, row.id)}
											>
												<Box
													bg="bg.accent"
													rounded="full"
													className="transition duration-500 h-[4px] group-hover:opacity-100 opacity-10"
												/>
											</div>
										)}

									<Row
										row={row}
										addRow={(e: any) => addRow(e, sindex, index)}
										addRowBelow={(e: any) => addRow(e, sindex, index + 1)}
										setOpen={setOpen}
										onDragStart={(e: any) => onDragStart(e, row.id)}
										removeRow={() => removeRow(row.id)}
										addCol={(e: any) => addCol(e, sindex, index, null)}
									>
										{(row.children ?? []).map((col: any, i: number) => (
											<div key={i}>
												{/* add col above */}
												{!dragging && (
													<div
														className="ind group h-2 relative z-10 -my-1"
														onMouseEnter={(e) => onDragHover(e, section.id)}
													>
														<Box className="gap-1 transition duration-500 h-[4px] translate-y-0.5 group-hover:opacity-100 opacity-0 flex items-center justify-center">
															<Box className="bg-black/5 h-1 w-full" />
															<Button
																aria-label="Add Column"
																size="sm"
																appearance="subtle"
																className="min-w-6"
																onClick={(e: any) => addCol(e, sindex, index, i)}
																icon={<IconPlus size={16} />}
															/>
															<Box className="bg-black/5 h-1 w-full" />
														</Box>
													</div>
												)}

												{dragging?.startsWith("col-") &&
													col.id !== dragging &&
													row.children[i - 1]?.id !== dragging && (
														<div
															className="ind group h-8 mx-1 relative z-10 -my-4 pt-[14px] ml-9 mr-0"
															onMouseEnter={(e) => onDragHover(e, col.id)}
														>
															<Box
																bg="bg.accent"
																rounded="full"
																className="transition duration-500 h-[4px] group-hover:opacity-100 opacity-10"
															/>
														</div>
													)}

												<Col
													col={col}
													setOpen={setOpen}
													onDragStart={(e: any) => onDragStart(e, col.id)}
													removeCol={() => removeCol(col.id)}
													addElement={(type: string) => addElement(type, i, index, sindex)}
													key={"col" + i}
												>
													{(col.children ?? []).map((element: any, j: number) => (
														<div key={"ele" + j}>
															{dragging &&
																element.id !== dragging &&
																col.children[j - 1]?.id !== dragging &&
																!dragging.startsWith("section-") &&
																!dragging.startsWith("col-") &&
																!dragging.startsWith("row-") && (
																	<div
																		className="ind group h-[44px] mx-1 relative z-10 -my-[22px] pt-[20px] ml-10 mr-0"
																		onMouseEnter={(e) => onDragHover(e, element.id)}
																	>
																		<Box
																			bg="bg.accent"
																			rounded="full"
																			className="transition duration-500 h-[4px] group-hover:opacity-100 opacity-10"
																		/>
																	</div>
																)}

															<Ele
																removeEle={() => removeEle(element.id)}
																onDragStart={(e: any) => onDragStart(e, element.id)}
																type={theEles[element.id]?.type}
																element={element}
																label={theEles[element.id]?.props?.[0]?.value || undefined}
																setCurrentEle={setCurrentEle}
																setCurrentHoverEle={setCurrentHoverEle}
															/>
														</div>
													))}

													{dragging &&
														dragging !== col.children[col.children.length - 1]?.id &&
														!dragging.startsWith("section-") &&
														!dragging.startsWith("row-") &&
														!dragging.startsWith("col-") && (
															<div
																className="ind group h-[44px] mx-1 relative z-10 -my-[22px] pt-[20px] ml-10 mr-0"
																onMouseEnter={(e) => onDragHover(e, "last-ele-" + col.id)}
															>
																<Box
																	bg="bg.accent"
																	rounded="full"
																	className="transition duration-500 h-[4px] group-hover:opacity-100 opacity-10"
																/>
															</div>
														)}
												</Col>
											</div>
										))}

										{/* add column last */}
										{!dragging && (
											<div
												className="ind group h-2 relative z-10 -my-1"
												onMouseEnter={(e) => onDragHover(e, section.id)}
											>
												<Box className="gap-1 transition duration-500 h-[4px] translate-y-0.5 group-hover:opacity-100 opacity-0 flex items-center justify-center">
													<Box className="bg-black/5 h-1 w-full" />
													<Button
														aria-label="Add Column"
														size="sm"
														appearance="subtle"
														className="min-w-6"
														onClick={(e: any) => addCol(e, sindex, index, row.children.length)}
														icon={<IconPlus size={16} />}
													/>
													<Box className="bg-black/5 h-1 w-full" />
												</Box>
											</div>
										)}

										{dragging?.startsWith("col-") &&
											dragging !== row.children[row.children.length - 1]?.id && (
												<div
													className="ind group h-8 mx-1 relative z-10 -my-4 pt-[14px] -mr-[20px] ml-9"
													onMouseEnter={(e) => onDragHover(e, "col-last-" + row.id)}
												>
													<Box
														bg="bg.accent"
														rounded="full"
														className="transition duration-500 h-[4px] group-hover:opacity-100 opacity-10"
													/>
												</div>
											)}
									</Row>
								</div>
							))}

							{/* add row last */}
							{!dragging && !section.children[section.children.length - 1]?.open && (
								<div
									className="ind group h-2 relative z-10 -my-1"
									onMouseEnter={(e) => onDragHover(e, section.id)}
								>
									<Box
										rounded="full"
										className="gap-1 translate-y-0.5 transition duration-500 h-[4px] group-hover:opacity-100 opacity-0 flex items-center justify-center"
									>
										<Box className="bg-black/5 h-1 w-full" />
										<Button
											aria-label="Add Row"
											size="sm"
											appearance="subtle"
											className="min-w-6"
											onClick={(e: any) => addRow(e, sindex, section.children.length)}
											icon={<IconPlus size={16} />}
										/>
										<Box className="bg-black/5 h-1 w-full" />
									</Box>
								</div>
							)}
						</Section>
					</div>
				))}
			</Box>
		</div>
	);
};


/** -----------------------------
 * Existing mergeData (kept)
 * ------------------------------*/

const mergeData = (structure: any[], elements: EleMap) => {
	return structure.map((node) => {
		const newNode = { ...node };
		if (elements[node.id]) {
			newNode.type = elements[node.id].type;
			newNode.props = elements[node.id].props;
		}
		if (node.children) {
			newNode.children = mergeData(node.children, elements);
		}
		return newNode;
	});
};

/** -----------------------------
 * VBPrototype
 * ------------------------------*/

type SidebarTab = "outlines" | "outline" | "properties";
type OutlineView = "list" | "tree";

export default function VBPrototype({
	initialData,
	onSave,
	onPublish,
	pageName,
	pageStatus,
}: {
	initialData?: PageInput;
	onSave?: (page: PageInput) => void;
	onPublish?: () => void;
	pageName?: string;
	pageStatus?: string;
}) {
	const [dragging, setDragging] = useState<any>(null);
	const [cloning, setCloning] = useState<boolean>(false);

	const defaultProps: PageProperties = {
		seoTitle: "",
		keywords: "",
		description: "",
		meta: "",
		campaignMode: "no",
		someOtherSetting: "setting1",
	};

	const [properties, setProperties] = useState<PageProperties>(() => {
		return { ...defaultProps, ...(initialData?.properties ?? {}) };
	});

	const [outlines, _setOutlines] = useState<Outline[]>(() => {
		const raw = initialData?.outlines;

		if (isOutlineArray(raw)) {
			return (raw ?? []).map((o) => ({
				...o,
				tree: ensureOpen(stripTransientFlags(o.tree ?? [])),
				elements: o.elements ?? {},
			}));
		}

		if (raw == null) {
			return [{ id: "outline-main", title: "Main", tree: [], elements: {} }];
		}

		const norm = normalizePage(raw);
		return [{ id: "outline-main", title: "Main", tree: norm.data, elements: norm.theEles }];
	});

	const hasChanged = useRef(false);

	const setOutlines = (arg: React.SetStateAction<Outline[]>) => {
		hasChanged.current = true;
		_setOutlines(arg);
	};

	const setPropertiesPatch = (patch: Partial<PageProperties>) => {
		hasChanged.current = true;
		setProperties((p) => ({ ...p, ...patch }));
	};

	const isFirstRender = useRef(true);
	const onSaveRef = useRef(onSave);

	useEffect(() => {
		onSaveRef.current = onSave;
	}, [onSave]);

	// active outline
	const [activeOutlineId, setActiveOutlineId] = useState<string | null>(() => {
		return outlines.length ? outlines[0].id : null;
	});

	const [currentEle, setCurrentEle] = useState<string>("none");
	const [currentHoverEle, setCurrentHoverEle] = useState<string>("none");

	// VIEW STATE
	const [sidebarTab, setSidebarTab] = useState<SidebarTab>(() => {
		if (outlines.length === 0) return "properties"; // View 4
		if (outlines.length === 1) return "outline"; // View 3
		return "outlines"; // View 1
	});

	const [outlineView, setOutlineView] = useState<OutlineView>(() => {
		return outlines.length > 1 ? "list" : "tree";
	});

	useEffect(() => {
		// Keep active outline valid
		if (outlines.length === 0) {
			setActiveOutlineId(null);
			setCurrentEle("none");
			setCurrentHoverEle("none");
			setSidebarTab("properties");
			setOutlineView("list");
			return;
		}
		if (!activeOutlineId || !outlines.some((o) => o.id === activeOutlineId)) {
			setActiveOutlineId(outlines[0].id);
		}

		// Enforce tabs/view by outline count
		if (outlines.length === 1) {
			if (sidebarTab === "outlines") setSidebarTab("outline");
			setOutlineView("tree");
		} else {
			// multi
			if (sidebarTab === "outline") setSidebarTab("outlines");
			// keep current outlineView (list/tree)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [outlines.length]);

	const isZero = outlines.length === 0; // View 4
	const isSingle = outlines.length === 1; // View 3
	const isMulti = outlines.length > 1; // View 1/2
	const isEditingElement = currentEle !== "none";

	const activeOutline = activeOutlineId
		? outlines.find((o) => o.id === activeOutlineId) ?? null
		: null;

	const isTreeViewActive =
		(activeOutline &&
			((isMulti && outlineView === "tree" && sidebarTab === "outlines") ||
				(isSingle && sidebarTab === "outline"))) ?? false;

	const data = activeOutline?.tree ?? [];
	const theEles = activeOutline?.elements ?? {};

	const setData = (arg: React.SetStateAction<any[]>) => {
		hasChanged.current = true;
		setOutlines((prev) =>
			prev.map((o) =>
				o.id === activeOutlineId
					? { ...o, tree: typeof arg === "function" ? (arg as any)(o.tree) : arg }
					: o
			)
		);
	};

	const setTheEles = (arg: React.SetStateAction<EleMap>) => {
		hasChanged.current = true;
		setOutlines((prev) =>
			prev.map((o) =>
				o.id === activeOutlineId
					? { ...o, elements: typeof arg === "function" ? (arg as any)(o.elements) : arg }
					: o
			)
		);
	};

	const findOutlineIdForElement = (eleId: string) => {
		for (const o of outlines) {
			if (o.elements?.[eleId]) return o.id;
		}
		return null;
	};

	const setCurrentEleSmart = (value: React.SetStateAction<string>) => {
		const eleId = typeof value === "function" ? value(currentEle) : value;

		setCurrentEle(eleId);

		if (!eleId || eleId === "none") return;

		const owner = findOutlineIdForElement(eleId);
		if (owner && owner !== activeOutlineId) {
			setActiveOutlineId(owner);

			// If multi-outline, drilling into an element should force View 2.
			if (isMulti) {
				setSidebarTab("outlines");
				setOutlineView("tree");
			}
		}
	};

	const [AI, setAI] = useState(false);
	const [loadingAI, setLoadingAI] = useState(false);

	const addSectionToEndOfActiveOutline = () => {
		setData((prev) => {
			const t = Date.now();
			const mkSection = () => ({
				id: "section-" + t,
				open: true,
				children: [
					{
						id: "row-" + t,
						open: true,
						children: [
							{
								id: "col-" + t,
								open: true,
								children: [],
							},
						],
					},
				],
			});

			return [...(prev ?? []), mkSection()];
		});
	};

	const addRandomBlockToEndOfActiveOutline = () => {
		const blockNames = [
			"My Block",
			"CTA Block",
			"Form Block",
			"Hero Block",
			"Info Block",
			"Feature Block",
			"Footer Block",
			"Header Block",
			"Pricing Block",
			"Contact Block",
		];
		const randomName = blockNames[Math.floor(Math.random() * blockNames.length)];

		setData((prev) => [
			...(prev ?? []),
			{
				label: randomName,
				isBlock: true,
				id: "section-" + Date.now(),
				open: true,
				children: [],
			},
		]);
	};

	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);

	const onInputChange = (value: any, propIndex: number) => {
		if (currentEle !== "none" && currentEle in theEles) {
			setTheEles((prev) => {
				const oldProps = prev[currentEle].props;
				const newProps = [...oldProps];
				newProps[propIndex] = { ...oldProps[propIndex], value };
				return { ...prev, [currentEle]: { ...prev[currentEle], props: newProps } };
			});
		}
	};

	async function sendMessage(message: string) {
		setLoadingAI(true);
		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userMessage: message }),
			});

			const payload = await res.json();

			// payload.response is expected to be a JSON string
			const parsed = JSON.parse(payload.response);

			const norm = normalizePage(parsed);
			setData(norm.data);
			setTheEles(norm.theEles);
		} finally {
			setLoadingAI(false);
		}
	}

	// Header actions (AI + plus-menu)
	const HeaderActions = (
		<Box display="flex" alignItems="center" gap="2" className="relative">
			<Button
				onClick={() => setAI((v) => !v)}
				appearance="subtle"
				size="sm"
				aria-label="AI"
				icon={<IconSparkles size={16} />}
				disabled={loadingAI}
			/>

			<Menu
				options={[
					{
						addon: <IconSection size={16} />,
						label: "Section",
						execute: addSectionToEndOfActiveOutline,
					},
					{
						addon: <IconSquare size={16} />,
						label: "Random Block",
						execute: addRandomBlockToEndOfActiveOutline,
					},
				]}
			>
				<MenuTrigger
					icon={<IconPlus size={16} />}
					aria-label="add"
					appearance="subtle"
					size="sm"
					iconPosition="start"
				/>
				<MenuContent />
			</Menu>

			<div
				className={`absolute -right-[10px] top-[32px] opacity-0 invisible z-10 p-2 rounded-md ${styles.popupMenu} w-[200px] max-w-[80vw] mr-12`}
				style={{
					visibility: AI ? "visible" : undefined,
					opacity: AI ? 1 : 0,
					transform: AI ? "scale(1)" : "scale(0.9)",
					transformOrigin: "top center",
					transition: "0.3s",
				}}
			>
				<form /* ... */>
					<Textarea
						name="prompt"
						rows={3}
						className="w-full border rounded p-2 focus:outline-none focus:ring-2"
						placeholder="What do you want to build today?"
					/* ... */
					/>
				</form>
			</div>
		</Box>
	);

	/** -----------------------------
	 * Save sync
	 * ------------------------------*/
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		if (!hasChanged.current) return;

		const nextOutlines = outlines.map((o) => ({
			...o,
			elements: pruneEles(o.tree, o.elements),
			tree: stripTransientFlags(o.tree),
		}));

		onSaveRef.current?.({
			outlines: nextOutlines,
			properties,
		});

		setLastSaved(new Date());
	}, [outlines, properties]);

	/** -----------------------------
	 * Drag/drop + key handlers
	 * ------------------------------*/

	type DragApplyResult = {
		nextData: any[];
		elesPatch?: EleMap;
	};

	const isSectionId = (id: string) => id.startsWith("section-");
	const isRowId = (id: string) => id.startsWith("row-");
	const isColId = (id: string) => id.startsWith("col-");
	const isEleId = (id: string) => !isSectionId(id) && !isRowId(id) && !isColId(id);

	const isSectionLast = (id: string) => id === "section-last" || id.startsWith("section-last");
	const isRowLast = (id: string) => id.startsWith("row-last-");
	const isColLast = (id: string) => id.startsWith("col-last-");
	const isLastEle = (id: string) => id.startsWith("last-ele-");

	const mkId = (base: string) => `${base}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

	function cloneSectionWithRemap(section: any, theEles: EleMap): { cloned: any; elesPatch: EleMap } {
		const elesPatch: EleMap = {};

		const clonedSectionId = mkId(section.id);
		const cloned = {
			...section,
			id: clonedSectionId,
			children: (section.children || []).map((row: any) => {
				const newRowId = mkId(row.id);
				return {
					...row,
					id: newRowId,
					children: (row.children || []).map((col: any) => {
						const newColId = mkId(col.id);
						return {
							...col,
							id: newColId,
							children: (col.children || []).map((ref: any) => {
								const oldEleId = ref?.id;
								if (!oldEleId) return ref;

								const newEleId = mkId(oldEleId);
								if (theEles[oldEleId]) elesPatch[newEleId] = { ...theEles[oldEleId] };
								return { id: newEleId };
							}),
						};
					}),
				};
			}),
		};

		return { cloned, elesPatch };
	}

	function cloneRowWithRemap(row: any, theEles: EleMap): { cloned: any; elesPatch: EleMap } {
		const elesPatch: EleMap = {};

		const newRowId = mkId(row.id);
		const cloned = {
			...row,
			id: newRowId,
			children: (row.children || []).map((col: any) => {
				const newColId = mkId(col.id);
				return {
					...col,
					id: newColId,
					children: (col.children || []).map((ref: any) => {
						const oldEleId = ref?.id;
						if (!oldEleId) return ref;

						const newEleId = mkId(oldEleId);
						if (theEles[oldEleId]) elesPatch[newEleId] = { ...theEles[oldEleId] };
						return { id: newEleId };
					}),
				};
			}),
		};

		return { cloned, elesPatch };
	}

	function applySectionDrag(
		data: any[],
		draggingId: string,
		hoverId: string,
		cloning: boolean,
		theEles: EleMap
	): DragApplyResult | null {
		const fromIdx = data.findIndex((s) => s.id === draggingId);
		if (fromIdx === -1) return null;

		const source = data[fromIdx];

		let dragged = source;
		let elesPatch: EleMap | undefined;

		if (cloning) {
			const c = cloneSectionWithRemap(source, theEles);
			dragged = c.cloned;
			elesPatch = c.elesPatch;
		}

		let next = [...data];

		if (!cloning) next.splice(fromIdx, 1);

		if (isSectionLast(hoverId)) {
			next.push(dragged);
			return { nextData: next, elesPatch };
		}

		const hoverIdx = next.findIndex((s) => s.id === hoverId);
		if (hoverIdx === -1) return null;

		next.splice(hoverIdx, 0, dragged);
		return { nextData: next, elesPatch };
	}

	function applyRowDrag(
		data: any[],
		draggingId: string,
		hoverId: string,
		cloning: boolean,
		theEles: EleMap
	): DragApplyResult | null {
		let fromS = -1,
			fromR = -1;
		let sourceRow: any = null;

		for (let s = 0; s < data.length; s++) {
			const rIdx = (data[s].children || []).findIndex((r: any) => r.id === draggingId);
			if (rIdx !== -1) {
				fromS = s;
				fromR = rIdx;
				sourceRow = data[s].children[rIdx];
				break;
			}
		}
		if (!sourceRow) return null;

		let rowToInsert = sourceRow;
		let elesPatch: EleMap | undefined;

		if (cloning) {
			const c = cloneRowWithRemap(sourceRow, theEles);
			rowToInsert = c.cloned;
			elesPatch = c.elesPatch;
		}

		let toS = -1,
			hoverR = -1;

		if (isRowLast(hoverId)) {
			const sectionId = hoverId.replace("row-last-", "");
			toS = data.findIndex((s) => s.id === sectionId);
			if (toS === -1) return null;
			hoverR = (data[toS].children || []).length;
		} else {
			for (let s = 0; s < data.length; s++) {
				const rIdx = (data[s].children || []).findIndex((r: any) => r.id === hoverId);
				if (rIdx !== -1) {
					toS = s;
					hoverR = rIdx;
					break;
				}
			}
			if (toS === -1) return null;
		}

		const next = data.map((sec: any, sIdx: number) => {
			let children = [...(sec.children || [])];

			if (!cloning && sIdx === fromS) children.splice(fromR, 1);

			if (sIdx === toS) {
				let insertAt = hoverR;
				if (!cloning && fromS === toS && fromR < hoverR) insertAt = hoverR - 1;
				children.splice(insertAt, 0, rowToInsert);
			}

			return { ...sec, children };
		});

		return { nextData: next, elesPatch };
	}

	function applyColDrag(
		data: any[],
		draggingId: string,
		hoverId: string,
		cloning: boolean
	): DragApplyResult | null {
		let fromS = -1,
			fromR = -1,
			fromC = -1;
		let draggedCol: any = null;

		for (let s = 0; s < data.length; s++) {
			const rows = data[s].children || [];
			for (let r = 0; r < rows.length; r++) {
				const cols = rows[r].children || [];
				const cIdx = cols.findIndex((c: any) => c.id === draggingId);
				if (cIdx !== -1) {
					fromS = s;
					fromR = r;
					fromC = cIdx;
					draggedCol = cols[cIdx];
					break;
				}
			}
			if (draggedCol) break;
		}
		if (!draggedCol) return null;

		let toS = -1,
			toR = -1,
			hoverC = -1;

		if (isColLast(hoverId)) {
			const rowId = hoverId.replace("col-last-", "");
			for (let s = 0; s < data.length; s++) {
				const rows = data[s].children || [];
				const rIdx = rows.findIndex((r: any) => r.id === rowId);
				if (rIdx !== -1) {
					toS = s;
					toR = rIdx;
					hoverC = (rows[rIdx].children || []).length;
					break;
				}
			}
		} else {
			for (let s = 0; s < data.length; s++) {
				const rows = data[s].children || [];
				for (let r = 0; r < rows.length; r++) {
					const cols = rows[r].children || [];
					const cIdx = cols.findIndex((c: any) => c.id === hoverId);
					if (cIdx !== -1) {
						toS = s;
						toR = r;
						hoverC = cIdx;
						break;
					}
				}
				if (toS !== -1) break;
			}
		}

		if (toS === -1) return null;

		const next = data.map((sec: any, sIdx: number) => {
			const rows = (sec.children || []).map((row: any, rIdx: number) => {
				let cols = [...(row.children || [])];

				if (sIdx === fromS && rIdx === fromR) cols.splice(fromC, 1);

				if (sIdx === toS && rIdx === toR) {
					let insertAt = hoverC;
					if (fromS === toS && fromR === toR && fromC < hoverC) insertAt = hoverC - 1;
					cols.splice(insertAt, 0, draggedCol);
				}

				return { ...row, children: cols };
			});

			return { ...sec, children: rows };
		});

		return { nextData: next };
	}

	function applyElementDrag(
		data: any[],
		draggingId: string,
		hoverId: string,
		cloning: boolean,
		theEles: EleMap
	): DragApplyResult | null {
		const newEleId = cloning ? mkId(draggingId) : draggingId;
		const elesPatch =
			cloning && theEles[draggingId] ? { [newEleId]: { ...theEles[draggingId] } } : undefined;

		let draggedRef: any = null;

		const removed = data.map((sec: any) => ({
			...sec,
			children: (sec.children || []).map((row: any) => ({
				...row,
				children: (row.children || []).map((col: any) => {
					const nextChildren = (col.children || []).filter((ref: any) => {
						if (ref?.id === draggingId) {
							draggedRef = cloning ? { id: newEleId } : ref;
							return cloning;
						}
						return true;
					});
					return { ...col, children: nextChildren };
				}),
			})),
		}));

		if (!draggedRef) return null;

		if (isLastEle(hoverId)) {
			const targetColId = hoverId.replace("last-ele-", "");
			const next = removed.map((sec: any) => ({
				...sec,
				children: (sec.children || []).map((row: any) => ({
					...row,
					children: (row.children || []).map((col: any) => {
						if (col.id !== targetColId) return col;
						if ((col.children || []).some((r: any) => r?.id === draggedRef.id)) return col;
						return { ...col, children: [...(col.children || []), draggedRef] };
					}),
				})),
			}));

			return { nextData: next, elesPatch };
		}

		const next = removed.map((sec: any) => ({
			...sec,
			children: (sec.children || []).map((row: any) => ({
				...row,
				children: (row.children || []).map((col: any) => {
					const idx = (col.children || []).findIndex((r: any) => r?.id === hoverId);
					if (idx === -1) return col;

					if ((col.children || []).some((r: any) => r?.id === draggedRef.id)) return col;

					const copy = [...(col.children || [])];
					copy.splice(idx, 0, draggedRef);
					return { ...col, children: copy };
				}),
			})),
		}));

		return { nextData: next, elesPatch };
	}

	function applyDragDrop(
		data: any[],
		draggingId: string,
		hoverId: string,
		cloning: boolean,
		theEles: EleMap
	): DragApplyResult | null {
		if (!draggingId || !hoverId || hoverId === "none") return null;
		if (hoverId === draggingId && !cloning) return null;

		if (isSectionId(draggingId) && (isSectionId(hoverId) || isSectionLast(hoverId))) {
			return applySectionDrag(data, draggingId, hoverId, cloning, theEles);
		}

		if (isRowId(draggingId) && (isRowId(hoverId) || isRowLast(hoverId))) {
			return applyRowDrag(data, draggingId, hoverId, cloning, theEles);
		}

		if (isColId(draggingId) && (isColId(hoverId) || isColLast(hoverId))) {
			return applyColDrag(data, draggingId, hoverId, cloning);
		}

		if (
			isEleId(draggingId) &&
			(isEleId(hoverId) || isLastEle(hoverId)) &&
			!isSectionId(hoverId) &&
			!isRowId(hoverId) &&
			!isColId(hoverId)
		) {
			return applyElementDrag(data, draggingId, hoverId, cloning, theEles);
		}

		return null;
	}

	useEffect(() => {
		const handleMouseUp = () => {
			if (!dragging) {
				setDragging(null);
				return;
			}

			const res = applyDragDrop(data, dragging, currentHoverEle, cloning, theEles);

			if (res) {
				setData(res.nextData);
				if (res.elesPatch) {
					setTheEles((prev) => ({ ...prev, ...res.elesPatch! }));
				}
				setCurrentHoverEle("none");
			}

			setDragging(null);
		};

		window.addEventListener("mouseup", handleMouseUp);

		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key === "Alt" && event.location === 1) setCloning(false);
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setCurrentEle("none");
				setCurrentHoverEle("none");
				setAI(false);
			} else if (event.key === "Alt" && event.location === 1) {
				setCloning(true);
			}
		};

		window.addEventListener("keyup", handleKeyUp);
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [dragging, currentHoverEle, cloning, theEles, data, currentEle]);

	/** -----------------------------
	 * View 4: 0 outlines
	 * ------------------------------*/
	if (isZero) {
		return (
			<div className="select-none" style={{ height: "100%" }}>
				<Box
					bg="bg.page"
					w="full"
					className="grid grid-rows-[0fr_1fr]"
					style={{ height: "100%", overflow: "hidden" }}
				>
					<CMSToolbar
						pageName={pageName || "New Page"}
						lastSaved={lastSaved}
						pageStatus={pageStatus}
						onPublish={onPublish}
						contentTypeIcon={<IconFile size={16} />}
					/>
					<Box px="24" pt="4" style={{ overflowY: "auto" }}>
						<Heading level="4">Properties</Heading>
						<PropertiesPanel value={properties} onChange={setPropertiesPatch} />
					</Box>
				</Box>
			</div>
		);
	}

	/** -----------------------------
	 * Main layout
	 * ------------------------------*/
	return (
		<div className="select-none" style={{ height: "100%" }}>
			<Box
				bg="bg.page"
				w="full"
				className="grid grid-cols-[0fr_1fr] grid-rows-[0fr_1fr]"
				style={{ height: "100%", overflow: "hidden" }}
			>
				<CMSToolbar
					pageName={pageName || "New Page"}
					lastSaved={lastSaved}
					pageStatus={pageStatus}
					onPublish={onPublish}
					contentTypeIcon={<IconFile size={16} />}
				/>

				{/* LEFT SIDEBAR */}
				<Box
					px="24"
					pt="4"
					w="auto"
					className="vb-outline"
					bg="bg.page"
					style={{ width: 324, minWidth: 180, maxWidth: 600, position: "relative" }}
				>
					{/* Resizable handle */}
					<div
						className="absolute top-0 bottom-0 flex flex-col items-center gap-1 -right-5 w-4 cursor-ew-resize z-20 hover:opacity-100 opacity-0 transition-opacity duration-200"
						onMouseDown={(e) => {
							e.preventDefault();
							const startX = e.clientX;
							const outlineBox = e.currentTarget.parentElement as HTMLElement;
							const startWidth = outlineBox.offsetWidth;

							const onMouseMove = (moveEvent: MouseEvent) => {
								const newWidth = Math.max(
									180,
									Math.min(600, startWidth + (moveEvent.clientX - startX))
								);
								outlineBox.style.width = newWidth + "px";
							};

							const onMouseUp = () => {
								window.removeEventListener("mousemove", onMouseMove);
								window.removeEventListener("mouseup", onMouseUp);
							};

							window.addEventListener("mousemove", onMouseMove);
							window.addEventListener("mouseup", onMouseUp);
						}}
					>
						<div className={`w-1 h-full left-1.5 grow-1 ${styles.divider}`} />
						<Box color="fg.secondary">
							<IconArrowBarBoth size="16" />
						</Box>
						<div className={`w-1 h-full left-1.5 grow-1 ${styles.divider}`} />
					</div>

					<div className="h-full flex flex-col" style={{ overflow: "hidden" }}>
						{/* MULTI: View 1 <-> View 2 full-sidebar slide (header + tabs + content) */}
						{isMulti ? (
							<div className="h-full overflow-hidden">
								<div
									className="flex w-[200%] h-full transition-transform duration-300 ease-out will-change-transform"
									style={{
										transform: outlineView === "tree" ? "translateX(-50%)" : "translateX(0%)",
									}}
								>
									{/* PANE 1 = View 1 (Page header + Tabs) */}
									<div
										className={`min-w-[50%] w-[50%] h-full flex flex-col ${outlineView === "tree" ? "pointer-events-none" : "pointer-events-auto"
											}`}
									>
										{/* Header (slides with pane) */}
										<div className="pt-4 pb-2">
											<div className="flex items-center gap-2">
												<Heading level="4">Page</Heading>
												<div className="flex-1" />
											</div>
										</div>

										{/* Body */}
										<div className="flex-1 overflow-y-auto">
											<Tabs value={sidebarTab} onValueChange={setSidebarTab as any}>
												<div className="pt-2 pb-2">
													<TabsList>
														<TabsTrigger value="outlines">Outlines</TabsTrigger>
														<TabsTrigger value="properties">Properties</TabsTrigger>
													</TabsList>
												</div>

												<TabsContent value="outlines">
													<div className="pb-4">
														<div className="flex flex-col gap-2">
															{outlines.map((o) => (
																<Button
																	key={o.id}
																	appearance="subtle"
																	onClick={() => {
																		setActiveOutlineId(o.id);
																		setSidebarTab("outlines");
																		setCurrentEle("none");
																		setCurrentHoverEle("none");
																		setAI(false);

																		// Slide to View 2
																		setOutlineView("tree");
																	}}
																>
																	{o.title}
																</Button>
															))}
														</div>
													</div>
												</TabsContent>

												<TabsContent value="properties">
													<PropertiesPanel value={properties} onChange={setPropertiesPatch} />
												</TabsContent>
											</Tabs>
										</div>
									</div>

									{/* PANE 2 = View 2 (tree) <-> ElementEditor (full pane slide) */}
									<div
										className={`min-w-[50%] w-[50%] h-full overflow-hidden ${outlineView === "tree" ? "pointer-events-auto" : "pointer-events-none"
											}`}
									>
										<div
											className="flex w-[200%] h-full transition-transform duration-300 ease-out will-change-transform"
											style={{
												transform: isEditingElement ? "translateX(-50%)" : "translateX(0%)",
											}}
										>
											{/* VIEW 2 (Back + outline header + tree) */}
											<div
												className={`min-w-[50%] w-[50%] h-full flex flex-col ${isEditingElement ? "pointer-events-none" : "pointer-events-auto"
													}`}
											>
												{/* Header (slides with tree) */}
												<div className="pt-4 pb-2">
													{activeOutline ? (
														<div className="flex flex-col gap-1">
															<Text
																fontSize="sm"
																fontWeight="400"
																color="fg.accent"
																className="cursor-pointer"
																onClick={() => {
																	setOutlineView("list");
																	setCurrentEle("none");
																	setCurrentHoverEle("none");
																	setAI(false);
																}}
															>
																← Back
															</Text>

															<div className="flex items-center gap-2">
																<Heading level="4">{activeOutline.title}</Heading>
																<div className="flex-1" />
																{HeaderActions}
															</div>
														</div>
													) : (
														<div className="flex items-center gap-2">
															<Heading level="4">Outline</Heading>
															<div className="flex-1" />
															{HeaderActions}
														</div>
													)}
												</div>

												{/* Body */}
												<div className="flex-1 overflow-y-auto pb-4">
													{activeOutline ? (
														<Outline
															cloning={cloning}
															dragging={dragging}
															setDragging={setDragging}
															currentHoverEle={currentHoverEle}
															setCurrentEle={setCurrentEle}
															data={data}
															setTheEles={setTheEles}
															setData={setData}
															theEles={theEles}
															setCurrentHoverEle={setCurrentHoverEle}
														/>
													) : null}
												</div>
											</div>

											{/* ELEMENT EDITOR (slides in from right) */}
											<div className={`flex-none w-1/2 h-full ${isEditingElement ? "pointer-events-auto" : "pointer-events-none"}`}>
												<div className="h-full overflow-y-auto">
													<ElementEditor
														elementType={currentEle !== "none" ? theEles[currentEle]?.type || "" : ""}
														currentEle={currentEle}
														propsList={theEles[currentEle]?.props}
														onBack={() => {
															setCurrentEle("none");
															setCurrentHoverEle("none");
															setAI(false);
														}}
														onInputChange={onInputChange}
													/>
												</div>
											</div>

										</div>
									</div>
								</div>
							</div>
						) : null}

						{/* SINGLE: tree/properties (left) <-> ElementEditor (right) slide */}
						{isSingle && activeOutline ? (
							<div className="h-full overflow-hidden">
								<div
									className="flex w-[200%] h-full transition-transform duration-300 ease-out will-change-transform"
									style={{
										transform: isEditingElement ? "translateX(-50%)" : "translateX(0%)",
									}}
								>
									{/* LEFT = Single sidebar (header + tabs + content) */}
									<div
										className={`min-w-[50%] w-[50%] h-full flex flex-col ${isEditingElement ? "pointer-events-none" : "pointer-events-auto"
											}`}
									>
										{/* Header */}
										<div className="pt-4 pb-2">
											<div className="flex items-center gap-2">
												<Heading level="4">Page</Heading>
												<div className="flex-1" />
												{HeaderActions}
											</div>
										</div>

										{/* Body */}
										<div className="flex-1 overflow-y-auto">
											<Tabs
												value={isEditingElement ? "outline" : sidebarTab}
												onValueChange={setSidebarTab as any}
											>
												<div className="pt-2 pb-2">
													<TabsList>
														<TabsTrigger value="outline">{activeOutline.title}</TabsTrigger>
														<TabsTrigger value="properties">Properties</TabsTrigger>
													</TabsList>
												</div>

												<TabsContent value="outline">
													<div className="pb-4">
														<Outline
															cloning={cloning}
															dragging={dragging}
															setDragging={setDragging}
															currentHoverEle={currentHoverEle}
															setCurrentEle={setCurrentEle}
															data={data}
															setTheEles={setTheEles}
															setData={setData}
															theEles={theEles}
															setCurrentHoverEle={setCurrentHoverEle}
														/>
													</div>
												</TabsContent>

												<TabsContent value="properties">
													<PropertiesPanel value={properties} onChange={setPropertiesPatch} />
												</TabsContent>
											</Tabs>
										</div>
									</div>

									{/* ELEMENT EDITOR (slides in from right) */}
									<div className={`flex-none w-1/2 h-full ${isEditingElement ? "pointer-events-auto" : "pointer-events-none"}`}>
										<div className="h-full overflow-y-auto">
											<ElementEditor
												elementType={currentEle !== "none" ? theEles[currentEle]?.type || "" : ""}
												currentEle={currentEle}
												propsList={theEles[currentEle]?.props}
												onBack={() => {
													setCurrentEle("none");
													setCurrentHoverEle("none");
													setAI(false);
												}}
												onInputChange={onInputChange}
											/>
										</div>
									</div>

								</div>
							</div>
						) : null}
					</div>

				</Box>

				{/* RIGHT / CANVAS */}
				<div
					className="p-6 pr-0 pt-0 gap-2 flex items-stretch z-10"
					style={{ height: "100%", overflow: "hidden" }}
				>
					<PreviewCanvas
						outlines={outlines}
						theEles={theEles}
						currentEle={currentEle}
						currentHoverEle={currentHoverEle}
						setCurrentEle={setCurrentEleSmart}
						setCurrentHoverEle={setCurrentHoverEle}
						setOutlines={setOutlines}
					/>

					{isImageSelectorOpen && <ImageSelectorPanel onClose={() => setIsImageSelectorOpen(false)} />}

					<Box borderL="1" borderColor="border.tertiary">
						<RightToolbar
							onFolderClick={() => setIsImageSelectorOpen(!isImageSelectorOpen)}
							isFolderActive={isImageSelectorOpen}
						/>
					</Box>
				</div>
			</Box>
		</div>
	);
}

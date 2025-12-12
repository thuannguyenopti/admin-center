"use client";

import {
	Box,
	Button,
	Field,
	Text,
	Input as Input2,
	Tabs,
	TabsContent,
	Select,
	SelectTrigger,
	SelectContent,
	Textarea,
} from "@optiaxiom/react";
import React, { useEffect, useRef, SetStateAction, useState } from "react";
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
} from "@tabler/icons-react";

import Section from "./vb/Section";
import Row from "./vb/Row";
import Col from "./vb/Col";
import Ele from "./vb/Ele";
import ElementEditor from "./vb/ElementEditor";
import OutlineHeader from "./vb/OutlineHeader";
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

// only strips truly transient flags (keep `open` so you can persist collapse state if you want)
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
 * AnimatedText
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

/** -----------------------------
 * Outline
 * ------------------------------*/

interface OutlineProps {
	cloning?: boolean;
	currentEle: string;
	currentHoverEle: string;
	dragging: string;
	theEles: EleMap;
	onInputChange: (value: string, propIndex: number) => void;
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
	currentEle,
	theEles,
	onInputChange,
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

	const [AI, setAI] = useState(false);
	const [loadingAI, setLoadingAI] = useState(false);
	const [activeTab, setActiveTab] = useState("main");

	const onAddSection = () => addSection("section-last"); // append
	const onAddRandomBlock = () => {
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
			...prev,
			{ label: randomName, isBlock: true, id: "section-" + Date.now(), children: [] },
		]);
	};

	async function sendMessage(message: string) {
		setLoadingAI(true);

		const res = await fetch("/api/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userMessage: message }),
		});

		const payload = await res.json();
		setLoadingAI(false);

		// payload.response is expected to be a JSON string
		const parsed = JSON.parse(payload.response);

		// Normalize regardless of whether AI returns split or merged
		const norm = normalizePage(parsed);
		setData(norm.data);
		setTheEles(norm.theEles);
	}

	return (
		<div className="">
			<div
				className="flex w-[200%] transition duration-300"
				style={{
					transform: currentEle === "none" ? "translateX(0%)" : "translateX(-50%)",
				}}
			>
				<div className="min-w-[50%] w-[50%] relative min-h-[300px]">
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<OutlineHeader
							AI={AI}
							setAI={setAI}
							activeTab={activeTab}
							setActiveTab={setActiveTab}
							onAddSection={onAddSection}
							onAddRandomBlock={onAddRandomBlock}
							onSendAIMessage={sendMessage}
						/>

						<TabsContent value="main">
							{loadingAI && (
								<div
									className={`absolute left-0 top-0 right-0 bottom-0 flex items-center justify-center flex-col text-center z-50 ${styles.aiOverlay}`}
								>
									<div className="w-8 h-8 border-4 border-[#6846FF] border-t-transparent rounded-full animate-spin" />
									<div className="h-10 mt-4 animate-fade-in-out text-[#6846FF] font-semibold text-sm w-20 text-center">
										<AnimatedText
											texts={[
												"Building a form with magic",
												"Summoning fields",
												"Assembling your layout",
												"Almost there",
											]}
											interval={1800}
										/>
									</div>
								</div>
							)}

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
											((section.id !== dragging && data[sindex - 1]?.id !== dragging) ||
												cloning) && (
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
											{section.children.map((row: any, index: number) => (
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
														((row.id !== dragging &&
															section.children[index - 1]?.id !== dragging) ||
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
														{row.children &&
															row.children.map((col: any, i: number) => (
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
																		// FIX: Col should pass a "type", not an event
																		addElement={(type: string) =>
																			addElement(type, i, index, sindex)
																		}
																		key={"col" + i}
																	>
																		{col.children.map((element: any, j: number) => (
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

											{dragging?.startsWith("row-") &&
												(dragging !== section.children[section.children.length - 1]?.id ||
													cloning) && (
													<div
														className="ind group h-8 mx-1 relative z-10 -my-4 pt-[14px] -mr-[20px] ml-5"
														onMouseEnter={(e) => onDragHover(e, "row-last-" + section.id)}
													>
														<Box
															bg="bg.accent"
															rounded="full"
															className="transition duration-500 h-[4px] group-hover:opacity-100 opacity-10"
														/>
													</div>
												)}
										</Section>
									</div>
								))}

								{!dragging && !data[data.length - 1]?.open && (
									<div className="ind group h-2 mx-1 relative z-10 -my-1 -mr-[20px]">
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
												onClick={() =>
													setData((prev) => [
														...prev,
														{
															label: "",
															id: "section-" + Date.now(),
															open: true,
															children: [
																{
																	label: "",
																	id: "row-" + Date.now(),
																	open: true,
																	children: [
																		{
																			label: "",
																			id: "col-" + Date.now(),
																			open: true,
																			children: [],
																		},
																	],
																},
															],
														},
													])
												}
												icon={<IconPlus size={16} />}
											/>
											<Box className="bg-black/5 h-1 w-full" />
										</Box>
									</div>
								)}

								{dragging?.startsWith("section-") &&
									(dragging !== data[data.length - 1]?.id || cloning) && (
										<div
											className="ind group h-8 mx-1 relative z-10 -my-4 pt-[14px] -mr-[20px]"
											onMouseEnter={(e) => onDragHover(e, "section-last")}
										>
											<Box
												bg="bg.accent"
												rounded="full"
												className="transition duration-500 h-[4px] group-hover:opacity-100 opacity-10"
											/>
										</div>
									)}
							</Box>
						</TabsContent>

						<TabsContent value="properties">
							<Box px="24" py="16" fontSize="sm">
								<Box mb="16">
									<Text fontSize="sm" fontWeight="600" mb="8">
										SEO
									</Text>
									<Box display="flex" flexDirection="column" gap="8">
										<Field label="Title">
											<Input2 placeholder="Enter page title" />
										</Field>
										<Field label="Keywords">
											<Input2 placeholder="Enter keywords" />
										</Field>
										<Field label="Description">
											<Textarea placeholder="Enter description" rows={3} />
										</Field>
										<Field label="Meta">
											<Textarea placeholder="Enter meta information" rows={3} />
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
												defaultValue="no"
												options={[
													{ label: "No", value: "no" },
													{ label: "Yes", value: "yes" },
												]}
											>
												<SelectTrigger>No</SelectTrigger>
												<SelectContent />
											</Select>
										</Field>

										<Field label="Some other setting">
											<Select
												defaultValue="setting1"
												options={[
													{ label: "A setting", value: "setting1" },
													{ label: "Another setting", value: "setting2" },
												]}
											>
												<SelectTrigger>A setting</SelectTrigger>
												<SelectContent />
											</Select>
										</Field>
									</Box>
								</Box>
							</Box>
						</TabsContent>
					</Tabs>
				</div>

				<ElementEditor
					elementType={currentEle !== "none" ? theEles[currentEle]?.type || "" : ""}
					currentEle={currentEle}
					propsList={theEles[currentEle]?.props}
					onBack={() => setCurrentEle("none")}
					onInputChange={onInputChange}
				/>
			</div>
		</div>
	);
};

/** -----------------------------
 * Existing mergeData (kept for onSave compatibility)
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

export default function VBPrototype({
	initialData,
	onSave,
	onPublish,
	pageName,
	pageStatus,
}: {
	// Accept both merged tree array and split payload (AI / storage / etc.)
	initialData?: any[] | SplitPayload;
	onSave?: (data: any[]) => void;
	onPublish?: () => void;
	pageName?: string;
	pageStatus?: string;
}) {
	const [dragging, setDragging] = useState<any>(null);
	const [cloning, setCloning] = useState<boolean>(false);

	const [currentEle, setCurrentEle] = useState<string>("none");
	const [currentHoverEle, setCurrentHoverEle] = useState<string>("none");
	const hasChanged = useRef(false);

	const initialNorm = useRef<NormalizeResult | null>(null);
	if (!initialNorm.current) initialNorm.current = normalizePage(initialData ?? []);

	const [theEles, _setTheEles] = useState<EleMap>(() => initialNorm.current!.theEles);
	const setTheEles = (arg: SetStateAction<EleMap>) => {
		hasChanged.current = true;
		_setTheEles(arg);
	};

	const [data, _setData] = useState<any[]>(() => initialNorm.current!.data);
	const setData = (arg: SetStateAction<any[]>) => {
		hasChanged.current = true;
		_setData(arg);
	};

	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
	const isFirstRender = useRef(true);
	const onSaveRef = useRef(onSave);

	const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
	const [dropPosition, setDropPosition] = useState<{ colId: string; position: number } | null>(
		null
	);

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

	useEffect(() => {
		onSaveRef.current = onSave;
	}, [onSave]);

	// Sync data changes to parent (keep API: onSave gets merged tree array)
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		if (!hasChanged.current) return;

		const pruned = pruneEles(data, theEles);
		const mergedData = mergeData(stripTransientFlags(data), pruned);

		onSaveRef.current?.(mergedData);
		setLastSaved(new Date());
	}, [data, theEles]);

	// Drag/drop + key handlers
	useEffect(() => {
		const handleMouseUp = () => {
			if (
				currentHoverEle !== "none" &&
				dragging !== null &&
				(currentHoverEle !== dragging || cloning)
			) {
				// SECTION DRAGGING
				if (
					dragging.startsWith("section-") &&
					currentHoverEle.startsWith("section-") &&
					!currentHoverEle.startsWith("section-last")
				) {
					setData((prev) => {
						const draggingIdx = prev.findIndex((sec) => sec.id === dragging);
						const hoverIdx = prev.findIndex((sec) => sec.id === currentHoverEle);
						if (draggingIdx === -1 || hoverIdx === -1) return prev;

						const newArr = [...prev];
						let [draggedSection] = newArr.splice(draggingIdx, 1);

						if (cloning) {
							const newSectionId = `${dragging}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
							draggedSection = {
								...draggedSection,
								id: newSectionId,
								children: draggedSection.children.map((row: any) => {
									const newRowId = `${row.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
									return {
										...row,
										id: newRowId,
										children: row.children.map((col: any) => {
											const newColId = `${col.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
											return {
												...col,
												id: newColId,
												children: col.children.map((ele: any) => {
													const newEleId = `${ele.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
													if (theEles[ele.id]) {
														setTheEles((prevElements) => ({
															...prevElements,
															[newEleId]: { ...prevElements[ele.id] },
														}));
													}
													return { ...ele, id: newEleId };
												}),
											};
										}),
									};
								}),
							};
						}

						const insertIdx = draggingIdx < hoverIdx && !cloning ? hoverIdx - 1 : hoverIdx;
						newArr.splice(insertIdx, 0, draggedSection);
						return newArr;
					});
					setCurrentHoverEle("none");
				} else if (dragging.startsWith("section-") && currentHoverEle.startsWith("section-last")) {
					setData((prev) => {
						const draggingIdx = prev.findIndex((sec) => sec.id === dragging);
						if (draggingIdx === -1) return prev;
						const newArr = [...prev];
						const [draggedSection] = newArr.splice(draggingIdx, 1);
						newArr.push(draggedSection);
						return newArr;
					});
					setCurrentHoverEle("none");
				}
				// ROW DRAGGING
				else if (
					dragging.startsWith("row-") &&
					currentHoverEle.startsWith("row-") &&
					!currentHoverEle.startsWith("row-last")
				) {
					setData((prev) => {
						let draggedRow: any = null;
						let fromSectionIdx = -1;
						let draggingIdx = -1;

						const newArr = prev.map((section, sIdx) => {
							const idx = section.children.findIndex((row: any) => row.id === dragging);
							if (idx !== -1) {
								draggedRow = section.children[idx];
								fromSectionIdx = sIdx;
								draggingIdx = idx;
								const newChildren = [...section.children];
								if (!cloning) newChildren.splice(idx, 1);
								return { ...section, children: newChildren };
							}
							return section;
						});

						if (!draggedRow) return newArr;

						let rowToInsert = draggedRow;
						if (cloning) {
							const newRowId = `${dragging}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
							rowToInsert = {
								...draggedRow,
								id: newRowId,
								children: draggedRow.children.map((col: any) => {
									const newColId = `${col.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
									return {
										...col,
										id: newColId,
										children: col.children.map((ele: any) => {
											const newEleId = `${ele.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
											if (theEles[ele.id]) {
												setTheEles((prevEles) => ({
													...prevEles,
													[newEleId]: { ...prevEles[ele.id] },
												}));
											}
											return { ...ele, id: newEleId };
										}),
									};
								}),
							};
						}

						let toSectionIdx = -1;
						let hoverIdx = -1;
						prev.forEach((section, sIdx) => {
							const idx = section.children.findIndex((row: any) => row.id === currentHoverEle);
							if (idx !== -1) {
								toSectionIdx = sIdx;
								hoverIdx = idx;
							}
						});
						if (toSectionIdx === -1 || hoverIdx === -1) return newArr;

						const toSection = newArr[toSectionIdx];
						const newChildren = [...toSection.children];
						const insertIdx =
							fromSectionIdx === toSectionIdx && draggingIdx < hoverIdx && !cloning ? hoverIdx - 1 : hoverIdx;

						newChildren.splice(insertIdx, 0, rowToInsert);
						newArr[toSectionIdx] = { ...toSection, children: newChildren };
						return newArr;
					});
					setCurrentHoverEle("none");
				} else if (dragging.startsWith("row-") && currentHoverEle.startsWith("row-last")) {
					setData((prev) => {
						let draggedRow: any = null;
						let fromSectionIdx = -1;

						const newArr = prev.map((section, sIdx) => {
							const idx = section.children.findIndex((row: any) => row.id === dragging);
							if (idx !== -1) {
								draggedRow = section.children[idx];
								fromSectionIdx = sIdx;
								const newChildren = [...section.children];
								if (!cloning) newChildren.splice(idx, 1);
								return { ...section, children: newChildren };
							}
							return section;
						});

						if (!draggedRow) return newArr;

						let rowToInsert = draggedRow;
						if (cloning) {
							const newRowId = `${dragging}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
							rowToInsert = {
								...draggedRow,
								id: newRowId,
								children: draggedRow.children.map((col: any) => {
									const newColId = `${col.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
									return {
										...col,
										id: newColId,
										children: col.children.map((ele: any) => {
											const newEleId = `${ele.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
											if (theEles[ele.id]) {
												setTheEles((prevEles) => ({
													...prevEles,
													[newEleId]: { ...prevEles[ele.id] },
												}));
											}
											return { ...ele, id: newEleId };
										}),
									};
								}),
							};
						}

						let toSectionIdx = -1;
						prev.forEach((section, sIdx) => {
							if (`row-last-${section.id}` === currentHoverEle) toSectionIdx = sIdx;
						});
						if (toSectionIdx === -1) return newArr;

						const toSection = newArr[toSectionIdx];
						newArr[toSectionIdx] = { ...toSection, children: [...toSection.children, rowToInsert] };
						return newArr;
					});
					setCurrentHoverEle("none");
				}
				// COL DRAGGING
				else if (
					dragging.startsWith("col-") &&
					currentHoverEle.startsWith("col-") &&
					!currentHoverEle.startsWith("col-last")
				) {
					setData((prev) => {
						let draggedCol: any = null;
						let fromRowIdx = -1;
						let fromSectionIdx = -1;
						let draggingIdx = -1;

						const newArr = prev.map((section, sIdx) => {
							const rowIdx = section.children.findIndex((row: any) => {
								const idx = row.children.findIndex((col: any) => col.id === dragging);
								if (idx !== -1) {
									draggingIdx = idx;
									return true;
								}
								return false;
							});

							if (rowIdx !== -1) {
								fromRowIdx = rowIdx;
								fromSectionIdx = sIdx;
								const row = section.children[rowIdx];
								draggedCol = row.children[draggingIdx];
								const newCols = [...row.children];
								newCols.splice(draggingIdx, 1);
								const newRow = { ...row, children: newCols };
								const newChildren = [...section.children];
								newChildren[rowIdx] = newRow;
								return { ...section, children: newChildren };
							}

							return section;
						});

						if (!draggedCol) return newArr;

						let toSectionIdx = -1;
						let toRowIdx = -1;
						let hoverIdx = -1;

						prev.forEach((section, sIdx) => {
							section.children.forEach((row: any, rIdx: number) => {
								const idx = row.children.findIndex((col: any) => col.id === currentHoverEle);
								if (idx !== -1) {
									toSectionIdx = sIdx;
									toRowIdx = rIdx;
									hoverIdx = idx;
								}
							});
						});

						if (toSectionIdx === -1 || toRowIdx === -1 || hoverIdx === -1) return newArr;

						const toSection = newArr[toSectionIdx];
						const toRow = toSection.children[toRowIdx];
						const newCols = [...toRow.children];

						const insertIdx =
							fromSectionIdx === toSectionIdx && fromRowIdx === toRowIdx && draggingIdx < hoverIdx
								? hoverIdx - 1
								: hoverIdx;

						newCols.splice(insertIdx, 0, draggedCol);
						const newRow = { ...toRow, children: newCols };
						const newChildren = [...toSection.children];
						newChildren[toRowIdx] = newRow;
						newArr[toSectionIdx] = { ...toSection, children: newChildren };
						return newArr;
					});
					setCurrentHoverEle("none");
				} else if (dragging.startsWith("col-") && currentHoverEle.startsWith("col-last")) {
					setData((prev) => {
						let draggedCol: any = null;
						let draggingIdx = -1;

						const newArr = prev.map((section) => {
							const rowIdx = section.children.findIndex((row: any) => {
								const idx = row.children.findIndex((col: any) => col.id === dragging);
								if (idx !== -1) {
									draggingIdx = idx;
									return true;
								}
								return false;
							});

							if (rowIdx !== -1) {
								const row = section.children[rowIdx];
								draggedCol = row.children[draggingIdx];
								const newCols = [...row.children];
								newCols.splice(draggingIdx, 1);
								const newRow = { ...row, children: newCols };
								const newChildren = [...section.children];
								newChildren[rowIdx] = newRow;
								return { ...section, children: newChildren };
							}

							return section;
						});

						if (!draggedCol) return newArr;

						let toSectionIdx = -1;
						let toRowIdx = -1;
						prev.forEach((section, sIdx) => {
							section.children.forEach((row: any, rIdx: number) => {
								if (`col-last-${row.id}` === currentHoverEle) {
									toSectionIdx = sIdx;
									toRowIdx = rIdx;
								}
							});
						});
						if (toSectionIdx === -1 || toRowIdx === -1) return newArr;

						const toSection = newArr[toSectionIdx];
						const toRow = toSection.children[toRowIdx];
						const newCols = [...toRow.children, draggedCol];

						const newRow = { ...toRow, children: newCols };
						const newChildren = [...toSection.children];
						newChildren[toRowIdx] = newRow;
						newArr[toSectionIdx] = { ...toSection, children: newChildren };
						return newArr;
					});
					setCurrentHoverEle("none");
				}
				// ELEMENT DRAGGING
				else if (
					!dragging.startsWith("col-") &&
					!dragging.startsWith("row-") &&
					!dragging.startsWith("section-") &&
					!currentHoverEle.startsWith("col-") &&
					!currentHoverEle.startsWith("row-") &&
					!currentHoverEle.startsWith("section-") &&
					!currentHoverEle.startsWith("last-ele")
				) {
					const newid = `${dragging}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

					setData((prev) => {
						const updatedData = prev.map((section) => ({
							...section,
							children: section.children.map((row: any) => ({
								...row,
								children: row.children.map((col: any) => {
									const newChildren = col.children.filter((ele: any) => {
										if (ele.id === dragging) return cloning; // keep if cloning
										return true;
									});
									return { ...col, children: newChildren };
								}),
							})),
						}));

						let draggedElement: any = null;
						prev.forEach((section) => {
							section.children.forEach((row: any) => {
								row.children.forEach((col: any) => {
									col.children.forEach((ele: any) => {
										if (ele.id === dragging) draggedElement = cloning ? { ...ele } : ele;
									});
								});
							});
						});
						if (!draggedElement) return updatedData;

						if (cloning) {
							const originalEle = theEles[dragging];
							if (!originalEle) return updatedData;
							setTheEles((prevEles) => ({ ...prevEles, [newid]: { ...originalEle } }));
							draggedElement.id = newid;
						}

						return updatedData.map((section) => ({
							...section,
							children: section.children.map((row: any) => ({
								...row,
								children: row.children.map((col: any) => {
									const idx = col.children.findIndex((ele: any) => ele.id === currentHoverEle);
									if (idx !== -1) {
										const already = col.children.some((ele: any) => ele.id === draggedElement.id);
										if (!already) {
											const next = [...col.children];
											next.splice(idx, 0, draggedElement);
											return { ...col, children: next };
										}
									}
									return col;
								}),
							})),
						}));
					});

					setCurrentHoverEle("none");
				} else if (currentHoverEle.startsWith("last-ele")) {
					const newid = `${dragging}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

					setData((prev) => {
						let draggedElement: any = null;

						const updatedData = prev.map((section) => ({
							...section,
							children: section.children.map((row: any) => ({
								...row,
								children: row.children.map((col: any) => {
									const newChildren = col.children.filter((ele: any) => {
										if (ele.id === dragging) {
											draggedElement = cloning ? { ...ele } : ele;
											return cloning;
										}
										return true;
									});
									return { ...col, children: newChildren };
								}),
							})),
						}));

						if (!draggedElement) return updatedData;

						if (cloning) {
							const originalEle = theEles[dragging];
							if (!originalEle) return updatedData;
							setTheEles((prevEles) => ({ ...prevEles, [newid]: { ...originalEle } }));
							draggedElement.id = newid;
						}

						const targetColId = currentHoverEle.replace(/^last-ele-/, "");
						return updatedData.map((section) => ({
							...section,
							children: section.children.map((row: any) => ({
								...row,
								children: row.children.map((col: any) => {
									if (col.id === targetColId) {
										const already = col.children.some((ele: any) => ele.id === draggedElement.id);
										if (!already) return { ...col, children: [...col.children, draggedElement] };
									}
									return col;
								}),
							})),
						}));
					});

					setCurrentHoverEle("none");
				}
			}

			setDragging(null);
		};

		if (currentEle !== "none") {
			const firstInput = document.querySelector("input");
			firstInput?.focus();
		}

		window.addEventListener("mouseup", handleMouseUp);

		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key === "Alt" && event.location === 1) setCloning(false);
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setCurrentEle("none");
				setCurrentHoverEle("none");
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
	}, [currentEle, dragging, currentHoverEle, cloning, theEles]);

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

				<Box
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
								const newWidth = Math.max(180, Math.min(600, startWidth + (moveEvent.clientX - startX)));
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

					<Outline
						cloning={cloning}
						dragging={dragging}
						setDragging={setDragging}
						currentHoverEle={currentHoverEle}
						setCurrentEle={setCurrentEle}
						data={data}
						setTheEles={setTheEles}
						setData={setData}
						currentEle={currentEle}
						theEles={theEles}
						onInputChange={onInputChange}
						setCurrentHoverEle={setCurrentHoverEle}
					/>
				</Box>

				<div className="p-6 pr-0 pt-0 gap-2 flex items-stretch z-10" style={{ height: "100%", overflow: "hidden" }}>
					<div
						className={`rounded-lg grow w-full mt-3 ${styles.canvas}`}
						onClick={() => setCurrentEle("none")}
						onDragOver={(e) => {
							e.preventDefault();
							const hasImageData = e.dataTransfer.types.includes("image/url");
							if (hasImageData) e.currentTarget.style.opacity = "0.8";
						}}
						onDragLeave={(e) => {
							e.currentTarget.style.opacity = "1";
							setDragOverColumn(null);
							setDropPosition(null);
						}}
						onDrop={(e) => {
							e.preventDefault();
							e.currentTarget.style.opacity = "1";
							const imageUrl = e.dataTransfer.getData("image/url");
							const imageAlt = e.dataTransfer.getData("image/alt");

							setDragOverColumn(null);
							setDropPosition(null);

							if (imageUrl && dropPosition) {
								const uKey = `Image-${Date.now()}`;

								setTheEles((prev) => ({
									...prev,
									[uKey]: {
										type: "Image",
										props: [
											{ type: "text", label: "Image URL", value: imageUrl },
											{ type: "text", label: "Title", value: imageAlt || "Untitled Image" },
											{ type: "text", label: "Alt Text", value: imageAlt },
											{ type: "text", label: "Width", value: "auto" },
											{ type: "text", label: "Height", value: "auto" },
										],
									},
								}));

								setData((prev) =>
									prev.map((section) => ({
										...section,
										children: section.children.map((row: any) => ({
											...row,
											children: row.children.map((col: any) => {
												if (col.id === dropPosition.colId) {
													const next = [...col.children];
													next.splice(dropPosition.position, 0, { id: uKey });
													return { ...col, children: next };
												}
												return col;
											}),
										})),
									}))
								);
							}
						}}
						style={{
							background:
								"radial-gradient(112.7% 105.9% at 2.27% 5.46%, rgba(255, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.00) 100%), linear-gradient(180deg, #360041 0%, #002A3A 100%)",
							maxHeight: "100%",
							overflowY: "auto",
							transition: "opacity 0.2s",
						}}
					>
						<div className="w-[500px] m-auto p-4 pt-24" style={{ minHeight: "100%" }}>
							{data.map((section, sindex) => (
								<section className="" key={sindex}>
									{section.children.map((row: any, index: any) => (
										<section className="grid grid-flow-col auto-cols-fr gap-4 text-white" key={index}>
											{row.children.map((col: any, colIndex: any) => (
												<div
													key={"col" + colIndex}
													onDragOver={(e) => {
														e.preventDefault();
														e.stopPropagation();

														const hasImageData = e.dataTransfer.types.includes("image/url");
														if (!hasImageData) return;

														setDragOverColumn(col.id);

														const elementDivs = e.currentTarget.querySelectorAll("[data-element-id]");
														const mouseY = e.clientY;

														let insertPosition = col.children.length;
														for (let i = 0; i < elementDivs.length; i++) {
															const elemRect = elementDivs[i].getBoundingClientRect();
															const elemMiddle = elemRect.top + elemRect.height / 2;
															if (mouseY < elemMiddle) {
																insertPosition = i;
																break;
															}
														}

														setDropPosition({ colId: col.id, position: insertPosition });
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
													{dragOverColumn === col.id && dropPosition && dropPosition.colId === col.id && (
														<div
															style={{
																position: "absolute",
																left: 0,
																right: 0,
																top: dropPosition.position === 0 ? 0 : undefined,
																bottom: dropPosition.position === col.children.length ? 0 : undefined,
																height: "2px",
																backgroundColor: "#0037FF",
																zIndex: 1000,
																pointerEvents: "none",
															}}
														/>
													)}

													{col.children.length === 0 && dragOverColumn === col.id && (
														<div
															style={{
																border: "2px dashed #0037FF",
																borderRadius: "8px",
																padding: "20px",
																textAlign: "center",
																color: "#0037FF",
																fontSize: "14px",
																backgroundColor: "rgba(0, 55, 255, 0.05)",
															}}
														>
															Drop image here
														</div>
													)}

													{col.children.map((element: any, eleIndex: any) => (
														<div key={"ele" + eleIndex} className="relative group" data-element-id={element.id}>
															<div
																onClick={(e) => {
																	e.stopPropagation();
																	setCurrentEle(element.id);
																	setCurrentHoverEle("none");
																}}
																style={{
																	visibility:
																		currentEle === element.id || currentHoverEle === element.id ? "visible" : undefined,
																	opacity:
																		currentEle === element.id || currentHoverEle === element.id
																			? currentEle === element.id
																				? 1
																				: 0.5
																			: undefined,
																	top: currentEle === element.id || currentHoverEle === element.id ? "-8px" : undefined,
																	left: currentEle === element.id || currentHoverEle === element.id ? "-8px" : undefined,
																	right: currentEle === element.id || currentHoverEle === element.id ? "-8px" : undefined,
																	bottom: currentEle === element.id || currentHoverEle === element.id ? "-8px" : undefined,
																}}
																className="cursor-pointer group-hover:visible group-hover:-left-2 group-hover:-top-2 group-hover:-right-2 group-hover:-bottom-2 group-hover:opacity-50 transition-all duration-100 invisible opacity-0 absolute border-2 -left-1 -top-1 -right-1 -bottom-1 z-10 border-[#0037FF] rounded-[4px] rounded-tl-none"
															>
																<div className="bg-[#0037FF] flex gap-1 items-center text-white text-[9px] absolute px-2 py-[3px] rounded-[4px] -top-5 -left-[2px] rounded-b-none">
																	{(() => {
																		switch (theEles[element.id]?.type) {
																			case "Heading":
																				return <IconHeading size={12} />;
																			case "Text":
																				return <IconPilcrow size={12} />;
																			case "Input":
																				return <IconForms size={12} />;
																			case "Button":
																				return <IconRectangle size={12} />;
																			case "Image":
																				return <IconPhoto size={12} />;
																			default:
																				return <IconBrackets size={12} />;
																		}
																	})()}
																	{theEles[element.id]?.type}
																</div>
															</div>

															{(() => {
																switch (theEles[element.id]?.type) {
																	case "Heading":
																		return (
																			<h1 className="text-3xl mb-5 font-bold">
																				{theEles[element.id]?.props.find((prop: any) => prop.label === "Text")?.value || <>&nbsp;</>}
																			</h1>
																		);

																	case "Text":
																		return (
																			<p className="mb-2">
																				{theEles[element.id]?.props.find((prop: any) => prop.label === "Text")?.value || <>&nbsp;</>}
																			</p>
																		);

																	case "Input":
																		return (
																			<div className="group relative mt-4">
																				{theEles[element.id]?.props.find((prop: any) => prop.label === "Tooltip")?.value && (
																					<div className="text-sm group-hover:opacity-100 group-hover:scale-100 group-hover:delay-1000 delay-0 group-hover:visible group-hover:-translate-y-2 opacity-0 text-center invisible absolute left-1/2 -translate-x-1/2 bottom-10 scale-90 shadow-lg transition-[.3s] px-2 py-1 rounded-md bg-[#000] text-white">
																						{theEles[element.id]?.props.find((prop: any) => prop.label === "Tooltip")?.value}
																					</div>
																				)}
																				<label>
																					{theEles[element.id]?.props.find((prop: any) => prop.label === "Label")?.value || <>&nbsp;</>}
																				</label>
																				<input
																					type="text"
																					placeholder={theEles[element.id]?.props.find((prop: any) => prop.label === "Placeholder")?.value || undefined}
																					className="border border-[#ffffff22] rounded-[6px] p-2 w-full bg-[#ffffff11] placeholder:text-[#ffffff66]"
																				/>
																			</div>
																		);

																	case "Button":
																		return (
																			<div className="text-right mt-4">
																				<div className="rounded bg-[#6846FF] px-5 py-3 text-center text-white font-bold inline-block">
																					{theEles[element.id]?.props.find((prop: any) => prop.label === "Label")?.value || <>&nbsp;</>}
																				</div>
																			</div>
																		);

																	case "Image": {
																		const imageUrlRaw = theEles[element.id]?.props.find((p: any) => p.label === "Image URL")?.value;
																		const imageUrl = typeof imageUrlRaw === "string" ? imageUrlRaw.trim() : imageUrlRaw;
																		const imageAlt = theEles[element.id]?.props.find((p: any) => p.label === "Alt Text")?.value;
																		const imageWidth = theEles[element.id]?.props.find((p: any) => p.label === "Width")?.value;
																		const imageHeight = theEles[element.id]?.props.find((p: any) => p.label === "Height")?.value;

																		return (
																			<div className="mb-4">
																				{imageUrl ? (
																					<img
																						src={imageUrl}
																						alt={imageAlt || "Image"}
																						style={{
																							width: imageWidth === "auto" ? "100%" : imageWidth,
																							height: imageHeight === "auto" ? "auto" : imageHeight,
																							borderRadius: "8px",
																							objectFit: "cover",
																						}}
																					/>
																				) : (
																					<div className="border border-[#ffffff33] bg-[#ffffff0d] text-center text-white/80 rounded-[8px] p-6 text-sm">
																						No image selected
																					</div>
																				)}
																			</div>
																		);
																	}

																	default:
																		return null;
																}
															})()}
														</div>
													))}
												</div>
											))}
										</section>
									))}
								</section>
							))}
						</div>
					</div>

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

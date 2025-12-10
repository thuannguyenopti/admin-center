"use client";

import {
	Box,
	Button,
	Field,
	Heading,
	Text,
	Input as Input2,
	Checkbox,
	Menu,
	MenuContent,
	MenuTrigger,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	Select,
	SelectTrigger,
	SelectContent,
	Textarea,
} from "@optiaxiom/react";
import React, { ReactNode, useEffect, Fragment, Children, useRef, SetStateAction } from "react";
import { useState } from "react";
import {
	IconPlus,
	IconDots,
	IconSparkles,
	IconTrash,
	IconPilcrow,
	IconForms,
	IconRectangle,
	IconHeading,
	IconBrackets,
	IconSection,
	IconSquare,
	IconPencil,
	IconRowInsertBottom,
	IconRowInsertTop,
	IconFilter,
	IconLogout,
	IconUser,
	IconArrowBarBoth,
	IconFile,
	IconList,
	IconLayoutGrid,
	IconCloud,
	IconMessage,
	IconDevices,
	IconChevronDown,
} from "@tabler/icons-react";

// Simple AnimatedText component for cycling through texts

import { sep } from "path";
import RightToolbar from "./RightToolbar";
import CMSToolbar from "./CMSToolbar";
import ImageSelectorPanel from "./ImageSelector/ImageSelectorPanel";
import MediaCard from "./MediaCard";
import { IconPhoto } from "@tabler/icons-react";
const AnimatedText: React.FC<{ texts: string[]; interval?: number }> = ({ texts, interval = 2000 }) => {
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

const indentDistance = 8; // Distance in pixels for each indent level

const Input: React.FC<{ prop: any; onChange: any; propIndex: number }> = ({
	prop,
	onChange,
	propIndex,
}) => {
	return (
		<div className="p-6 pr-0 py-2">
			<Field label={prop.label}>
				<Input2
					placeholder={prop.placeholder || ""}
					value={prop.value || ""}
					onChange={(e) => onChange(e.currentTarget.value, propIndex)}
				/>
			</Field>
		</div>
	);
};

const Section: React.FC<{
	addSection: any;
	setOpen: any;
	section: any;
	children: ReactNode;
	addRow: any;
	removeSection: any;
	onDragStart: any;
}> = ({ addSection, setOpen, section, children, addRow, removeSection, onDragStart }) => {
	if (section.label) {
		return (
			<div className="p-0.5 pl-6 -mr-0.5">
				<div>
					<div
						className="group hover:border-[#838DA4] h-10 border-[#CACFDC] border bg-white cursor-pointer rounded-[4px] hover:bg-[#091E4208] flex gap-1 items-center w-full justify-between pr-2 pl-3 active:bg-[#0037FF10]"
						onDragStart={onDragStart}
						draggable
					>
						<div className="flex gap-2 items-center w-full group-hover:w-[calc(100%-24px)]">
							<Box
								color="fg.default"
								className=""
							>
								<IconSquare size={16} />
							</Box>
							<Box
								color="fg.default"
								className="truncate overflow-hidden text-ellipsis text-[14px]"
							>
								{section.label}
							</Box>
						</div>
						<div className="group-hover:visible invisible flex gap-0.5">
							<Menu
								options={[
									{
										addon: <IconPencil size={16} />,
										label: "Edit",
										execute: () => {
											removeSection();
										},
									},
									{
										addon: <IconTrash size={16} />,
										label: "Remove Block",
										intent: "danger",
										execute: () => {
											removeSection();
										},
									},
								]}
							>
								<MenuTrigger
									icon={<IconDots />}
									aria-label="add ele"
									appearance="subtle"
									size="sm"
									iconPosition="start"
								/>
								<MenuContent />
							</Menu>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const group = {
		label: "Add",
		separator: true,
	};

	return (
		<div className="p-1 py-0 -mr-[24px]">
			<div
				className="group p-1 cursor-pointer rounded-[4px] hover:bg-[#091E4208] flex gap-1 items-center w-full justify-between pr-5 active:bg-[#0037FF10]"
				onDragStart={onDragStart}
				onClick={() => setOpen(section.id, !section.open)}
				draggable
			>
				<div className="flex gap-1 items-center">
					<svg
						className="chevron"
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						style={{
							transform: section.open ? "rotate(0deg)" : "rotate(-90deg)",
						}}
					>
						<path
							d="M6.39844 8.64844C6.16406 8.88281 5.8125 8.88281 5.60156 8.64844L1.85156 4.89844C1.61719 4.6875 1.61719 4.33594 1.85156 4.125C2.0625 3.89062 2.41406 3.89062 2.625 4.125L5.97656 7.47656L9.35156 4.10156C9.5625 3.89062 9.91406 3.89062 10.125 4.10156C10.3594 4.33594 10.3594 4.6875 10.125 4.89844L6.39844 8.64844Z"
							fill="#66708C"
						/>
					</svg>
					<Text>Section</Text>
				</div>
				<div
					className="group-hover:visible invisible gap-0.5 flex"
					onClick={(e) => e.stopPropagation()}
				>
					<Menu
						options={[
							{
								addon: <IconPlus size={16} />,
								group: group,
								label: "Add Row Inside",
								execute: () => {
									addRow();
								},
								selected: false,
							},
							{
								addon: <IconRowInsertTop size={16} />,
								group: group,
								label: "Add Section Before",
								description:
									"lorem ipsum dolor sit amet. lorem ipsum dolor sit amet. lorem ipsum dolor sit amet. ",
								execute: () => {
									addSection();
								},
							},
							{
								addon: <IconRowInsertBottom size={16} />,
								group: group,
								label: "Add Section After",
								execute: () => {
									addSection();
								},
							},
							{
								addon: <IconTrash size={16} />,
								label: "Remove Section",
								intent: "danger",
								execute: () => {
									removeSection();
								},
							},
						]}
					>
						<MenuTrigger
							icon={<IconDots />}
							aria-label="add ele"
							appearance="subtle"
							size="sm"
							iconPosition="start"
							onClick={(e) => {
								e.stopPropagation();
							}}
						/>
						<MenuContent />
					</Menu>
				</div>
			</div>
			<div style={{ display: section.open ? "block" : "none" }}>{children}</div>
		</div>
	);
};

const Row: React.FC<{
	setOpen: any;
	row: any;
	children: ReactNode;
	addCol: any;
	addRow: any;
	addRowBelow: any;
	removeRow: any;
	onDragStart: any;
}> = ({ addRowBelow, addRow, setOpen, row, children, addCol, removeRow, onDragStart }) => {
	const group = { label: "Add", separator: true };
	return (
		<div className="py-0">
			<div
				className="newsection group p-1 cursor-pointer rounded-[4px] hover:bg-[#091E4208] flex gap-1 items-center w-full justify-between pr-5 active:bg-[#0037FF10]"
				style={{ paddingLeft: `${4 + indentDistance}px` }}
				onDragStart={onDragStart}
				onClick={() => setOpen(row.id, !row.open)}
				draggable
			>
				<div className="flex gap-1 items-center">
					<svg
						className="chevron"
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						style={{
							transform: row.open ? "rotate(0deg)" : "rotate(-90deg)",
						}}
					>
						<path
							d="M6.39844 8.64844C6.16406 8.88281 5.8125 8.88281 5.60156 8.64844L1.85156 4.89844C1.61719 4.6875 1.61719 4.33594 1.85156 4.125C2.0625 3.89062 2.41406 3.89062 2.625 4.125L5.97656 7.47656L9.35156 4.10156C9.5625 3.89062 9.91406 3.89062 10.125 4.10156C10.3594 4.33594 10.3594 4.6875 10.125 4.89844L6.39844 8.64844Z"
							fill="#66708C"
						/>
					</svg>
					<Text>Row</Text>
				</div>
				<div className="group-hover:visible invisible gap-0.5 flex">
					<Menu
						options={[
							{
								group: group,
								addon: <IconPlus size={16} />,
								label: "Add column inside",
								execute: (e) => {
									addCol();
								},
							},
							{
								group: group,
								addon: <IconRowInsertTop size={16} />,
								label: "Add row above",
								execute: (e) => {
									addRow();
								},
							},
							{
								group: group,
								addon: <IconRowInsertTop size={16} />,
								label: "Add row below",
								execute: (e) => {
									addRowBelow();
								},
							},
							{
								addon: <IconTrash size={16} />,
								label: "Remove Row",
								intent: "danger",
								execute: (e) => {
									removeRow(row.id);
								},
							},
						]}
					>
						<MenuTrigger
							icon={<IconDots />}
							aria-label="add ele"
							appearance="subtle"
							size="sm"
							iconPosition="start"
							onClick={(e) => {
								e.stopPropagation();
							}}
						/>
						<MenuContent
							onClick={(e) => {
								e.stopPropagation();
							}}
						/>
					</Menu>
				</div>
			</div>
			<div style={{ display: row.open ? "block" : "none" }}>{children}</div>
		</div>
	);
};

const Col: React.FC<{
	setOpen: any;
	col: any;
	children: ReactNode;
	addElement: any;
	removeCol: any;
	onDragStart: any;
}> = ({ setOpen, col, children, addElement, removeCol, onDragStart }) => {
	const [isDragOver, setIsDragOver] = React.useState(false);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const hasImageData = e.dataTransfer.types.includes("image/url");
		if (hasImageData) {
			setIsDragOver(true);
		}
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);

		const imageUrl = e.dataTransfer.getData("image/url");
		const imageAlt = e.dataTransfer.getData("image/alt");

		if (imageUrl) {
			// Call addElement with type, then pass image data via a special marker
			// The actual addElement function will be called with (type, colIndex, rowIndex, sectionIndex)
			// We'll store the image data temporarily and use it in the addElement function
			(window as any).__pendingImageData = { url: imageUrl, alt: imageAlt };
			addElement("Image");
			delete (window as any).__pendingImageData;
		}
	};

	return (
		<Box
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			style={{
				backgroundColor: isDragOver ? "#0037FF10" : "transparent",
				transition: "background-color 0.2s",
			}}
		>
			<div
				className="newsection group p-1 cursor-pointer rounded-[4px] hover:bg-[#091E4208] flex gap-1 items-center w-full justify-between pr-5 active:bg-[#0037FF10]"
				draggable
				style={{ paddingLeft: `${4 + indentDistance * 2}px` }}
				onClick={() => setOpen(col.id, !col.open)}
				onDragStart={onDragStart}
			>
				<div className="flex gap-1 items-center">
					<svg
						className="chevron"
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						style={{
							transform: col.open ? "rotate(0deg)" : "rotate(-90deg)",
						}}
					>
						<path
							d="M6.39844 8.64844C6.16406 8.88281 5.8125 8.88281 5.60156 8.64844L1.85156 4.89844C1.61719 4.6875 1.61719 4.33594 1.85156 4.125C2.0625 3.89062 2.41406 3.89062 2.625 4.125L5.97656 7.47656L9.35156 4.10156C9.5625 3.89062 9.91406 3.89062 10.125 4.10156C10.3594 4.33594 10.3594 4.6875 10.125 4.89844L6.39844 8.64844Z"
							fill="#66708C"
						/>
					</svg>
					<Text>Column</Text>
				</div>
				<div className="group-hover:visible invisible gap-0.5 flex">
					<Menu
						options={[
							{
								addon: <IconTrash size={16} />,
								label: "Remove Column",
								intent: "danger",
								execute: () => {
									removeCol();
								},
							},
						]}
					>
						<MenuTrigger
							icon={<IconDots />}
							aria-label="add ele"
							appearance="subtle"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
							}}
							iconPosition="start"
						/>
						<MenuContent />
					</Menu>
					<Menu
						options={[
							{
								group: { label: "Add Element" },
								addon: <IconHeading size={16} />,
								label: "Heading",
								execute: () => {
									addElement("Heading");
								},
							},
							{
								addon: <IconPilcrow size={16} />,
								label: "Text",
								execute: () => {
									addElement("Text");
								},
							},
							{
								addon: <IconForms size={16} />,
								label: "Input",
								execute: () => addElement("Input"),
							},
							{
								addon: <IconRectangle size={16} />,
								label: "Button",
								execute: () => addElement("Button"),
							},
							{
								addon: <IconPhoto size={16} />,
								label: "Image",
								execute: () => addElement("Image"),
							},
						]}
					>
						<MenuTrigger
							icon={<IconPlus />}
							aria-label="add ele"
							appearance="subtle"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
							}}
							iconPosition="start"
						/>
						<MenuContent
							onClick={(e) => {
								e.stopPropagation();
							}}
						/>
					</Menu>
				</div>
			</div>
			<div style={{ display: col.open ? "block" : "none" }}>{children}</div>
		</Box>
	);
};

const Ele: React.FC<{
	element: any;
	removeEle: any;
	setCurrentEle: any;
	type: any;
	setCurrentHoverEle: any;
	label: string;
	onDragStart: any;
}> = ({ element, removeEle, setCurrentEle, type, setCurrentHoverEle, label, onDragStart }) => {
	const [menuOpen, setMenuOpen] = useState(false);
	return (
		<Box
			style={{
				paddingLeft: `${4 + 16 + indentDistance * 3}px`,
			}}
			py="2"
			pr="20"
		>
			<div
				onMouseEnter={() => setCurrentHoverEle(element.id)}
				onMouseLeave={() => setCurrentHoverEle("none")}
				draggable
				onDragStart={onDragStart}
				onClick={() => {
					if (!menuOpen) setCurrentEle(element.id);
				}}
				className="active:bg-[#0037FF10] group p-2 py-0 text-sm h-[40px] pl-3 cursor-pointer border border-[#CACFDC] hover:border-[#838DA4] rounded-[4px] hover:bg-[#091E4208] gap-1 items-center w-full bg-white flex justify-between"
			>
				<div
					className="flex gap-2 items-center w-full group-hover:w-[calc(100%-24px)]"
					style={{ color: label ? "#2E3442" : "#66708C" }}
				>
					<div className="min-w-4">
						{(() => {
							switch (type) {
								case "Heading":
									return <IconHeading size={16} />;
								case "Text":
									return <IconPilcrow size={16} />;
								case "Input":
									return <IconForms size={16} />;
								case "Button":
									return <IconRectangle size={16} />;
								case "Image":
									return <IconPhoto size={16} />;
								default:
									return <IconBrackets size={16} />;
							}
						})()}
					</div>

					<span className="truncate overflow-hidden text-ellipsis">
						{label || <span className="italic text-[#66708C]">{`Empty ${type}`}</span>}
					</span>
				</div>
				<div
					className="min-w-[24px] invisible group-hover:visible"
					style={{
						visibility: menuOpen ? "visible" : undefined,
					}}
				>
					<Menu
						onOpenChange={(e) => setMenuOpen(!menuOpen)}
						open={menuOpen}
						options={[
							{
								addon: <IconTrash size={16} />,
								label: "Remove Element",
								intent: "danger",
								execute: () => {
									removeEle();
									setMenuOpen(false);
								},
							},
						]}
					>
						<MenuTrigger
							onClick={(e) => {
								e.stopPropagation();
								setMenuOpen(true);
							}}
							icon={<IconDots />}
							aria-label="add ele"
							appearance="subtle"
							size="sm"
							iconPosition="start"
						/>
						<MenuContent />
					</Menu>
				</div>
			</div>
		</Box>
	);
};

interface OutlineProps {
	cloning?: boolean;
	currentEle: string;
	currentHoverEle: string;
	dragging: string;
	theEles: Record<string, any>;
	onInputChange: (value: string, propIndex: number) => void;
	setCurrentEle: React.Dispatch<React.SetStateAction<string>>;
	setDragging: React.Dispatch<React.SetStateAction<string>>;
	setData: React.Dispatch<React.SetStateAction<any[]>>;
	setCurrentHoverEle: React.Dispatch<React.SetStateAction<string>>;
	setTheEles: React.Dispatch<React.SetStateAction<Record<string, any>>>;
	data: any;
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
			if (idx === -1) {
				// If not found, just append at end
				console.log("Adding section last");
				return [
					...prev,
					{
						id: "section-" + Date.now(),
						open: true,
						children: [
							{
								id: "row-" + Date.now(),
								open: true,
								children: [
									{
										id: "col-" + Date.now(),
										open: true,
										children: [],
									},
								],
							},
						],
					},
				];
			}
			// Insert above the found index
			console.log("Adding section above", id);
			return [
				...prev.slice(0, idx),
				{
					id: "section-" + Date.now(),
					open: true,
					children: [
						{
							id: "row-" + Date.now(),
							open: true,
							children: [
								{
									id: "col-" + Date.now(),
									open: true,
									children: [],
								},
							],
						},
					],
				},
				...prev.slice(idx),
			];
		});
	};
	const addCol = (e: any, section: number, row: number, at: any) => {
		e?.stopPropagation();

		setData((prev) => {
			// Find the correct section
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
						let newChildren;
						if (at === null || at === undefined) {
							newChildren = [...r.children, newCol];
						} else {
							newChildren = [
								...r.children.slice(0, at),
								newCol,
								...r.children.slice(at),
							];
						}
						return {
							...r,
							open: true,
							children: newChildren,
						};
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
			let newChildren;
			if (at === null || at === undefined) {
				newChildren = [...sectionObj.children, newRow];
			} else {
				newChildren = [
					...sectionObj.children.slice(0, at),
					newRow,
					...sectionObj.children.slice(at),
				];
			}

			return [
				...prev.slice(0, section),
				{
					...sectionObj,
					open: true,
					children: newChildren,
				},
				...prev.slice(section + 1),
			];
		});
	};

	const addElement = (type: string, colIndex: number, rowIndex: number, sectionIndex: number) => {
		const uKey = `${type}-${Date.now()}`;

		// Check for pending image data from drag-and-drop
		const pendingImageData = (window as any).__pendingImageData;
		const imageUrl = pendingImageData?.url || "";
		const imageAlt = pendingImageData?.alt || "";

		setTheEles((prev) => ({
			...prev,
			[uKey]: {
				type: type,
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
								{
									type: "checkbox",
									label: "Required",
									value: false,
								},
							];
						case "Button":
							return [{ type: "text", label: "Label" }];
						case "Image":
							return [
								{ type: "text", label: "Image URL", value: imageUrl },
								{ type: "text", label: "Title", value: imageAlt || "Untitled Image" },
								{ type: "text", label: "Alt Text", value: imageAlt },
							];
						default:
							return [];
					}
				})(),
			},
		}));
		setData((prev) => {
			return prev.map((section, sIdx) => {
				if (sIdx !== sectionIndex) return section;
				return {
					...section,
					children: section.children.map((row: any, rIdx: number) => {
						if (rIdx !== rowIndex) return row;
						return {
							...row,
							children: row.children.map((col: any, cIdx: number) => {
								if (cIdx !== colIndex) return col;
								return {
									...col,
									children: [...col.children, { id: uKey }],
								};
							}),
						};
					}),
				};
			});
		});
	};

	const removeSection = (sectionIndex: number) => {
		setData((prev) => prev.filter((_, index: number) => index !== sectionIndex));
	};

	const removeRow = (id: string) => {
		setData((prev) => {
			return prev.map((section) => ({
				...section,
				children: section.children.filter((row: any) => row.id !== id),
			}));
		});
	};

	const removeCol = (id: string) => {
		setData((prev) => {
			return prev.map((section) => ({
				...section,
				children: section.children.map((row: any) => ({
					...row,
					children: row.children.filter((ele: any) => ele.id !== id),
				})),
			}));
		});
	};

	const removeEle = (id: string) => {
		setData((prev) => {
			return prev.map((section) => ({
				...section,
				children: section.children.map((row: any) => ({
					...row,
					children: row.children.map((col: any) => ({
						...col,
						children: col.children.filter((ele: any) => ele.id !== id),
					})),
				})),
			}));
		});
	};

	const onDragStart = (e: any, id: string) => {
		e.stopPropagation();
		e.preventDefault();
		setDragging(id);
	};

	const onDragHover = (e: any, id: string) => {
		e.stopPropagation();
		e.preventDefault();
		if (dragging) {
			setCurrentHoverEle("" + id);
		}
	};

	const [AI, setAI] = useState(false);
	const [loadingAI, setLoadingAI] = useState(false);
	const [activeTab, setActiveTab] = useState("main");

	async function sendMessage(message: string) {
		setLoadingAI(true);
		const res = await fetch("/api/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userMessage: message }),
		});

		const data = await res.json();
		setLoadingAI(false);
		const parsed = JSON.parse(data.response);
		console.log("Parsed response:", parsed);
		setData(parsed.data || []);
		setTheEles(parsed.theEles || {});
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
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						gap="4"
						px="24"
						pr="0"
						py="8"
					>
						<Text
							fontSize="2xl"
							fontWeight="500"
							color="fg.default"
						>
							Page
						</Text>
						<Box
							display="flex"
							alignItems="center"
							gap="2"
						>
							<Button
								onClick={() => setAI(!AI)}
								appearance="subtle"
								size="sm"
								aria-label="add row"
								icon={<IconSparkles />}
							/>
							<Menu
								options={[
									{
										addon: <IconSection size={16} />,
										label: "Section",
										execute: () =>
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
											]),
									},
									{
										addon: <IconSquare size={16} />,
										label: "Random Block",
										execute: () => {
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
											const randomName =
												blockNames[
												Math.floor(Math.random() * blockNames.length)
												];
											setData((prev) => [
												...prev,
												{
													label: randomName,
													isBlock: true,
													id: "section-" + Date.now(),
													children: [],
												},
											]);
										},
									},
								]}
							>
								<MenuTrigger
									icon={<IconPlus />}
									aria-label="add ele"
									appearance="subtle"
									size="sm"
									iconPosition="start"
								/>
								<MenuContent />
							</Menu>
							<div
								className="absolute -right-[10px] top-[62px] opacity-0 invisible z-10 shadow-lg bg-white p-1 rounded-md"
								style={{
									visibility: AI ? "visible" : undefined,
									opacity: AI ? 1 : 0,
									transform: AI ? "scale(1)" : "scale(0.9)",
									transformOrigin: "top center",
									transition: "0.3s",
								}}
							>
								<form
									onSubmit={async (e) => {
										e.preventDefault();
										sendMessage(e.currentTarget.prompt.value);
										e.currentTarget.reset();
									}}
								>
									<Field>
										<textarea
											name="prompt"
											rows={3}
											className="w-full border rounded p-2 focus:outline-none focus:ring-2"
											placeholder="What do you want to build today?"
											ref={(el) => {
												if (AI && el) {
													el.focus();
												}
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter" && !e.shiftKey) {
													e.preventDefault();
													const form = (e.target as HTMLTextAreaElement)
														.form;
													if (form) {
														form.requestSubmit();
													}
													setAI(false);
												}
											}}
										/>
									</Field>
								</form>
							</div>
						</Box>
					</Box>
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
					>
						<Box display="flex">
							<Box w="20" />
							<Box
								flex="1"
								borderB="1"
								borderColor="border.tertiary"
							>
								<TabsList gap="24">
									<TabsTrigger
										value="main"
										fontSize="md"
										fontWeight="500"
										color={activeTab === "main" ? "fg.default" : "fg.secondary"}
									>
										Main
									</TabsTrigger>
									<TabsTrigger
										value="properties"
										fontSize="md"
										fontWeight="500"
										color={activeTab === "properties" ? "fg.default" : "fg.secondary"}
									>
										Properties
									</TabsTrigger>
								</TabsList>
							</Box>
						</Box>
						<TabsContent value="main">
							{loadingAI && (
								<div className="absolute left-0 top-0 right-0 bottom-0 flex items-center justify-center flex-col text-center bg-[#fff9] z-50">
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
							<Box
								fontSize="sm"
								className="text-[#66708C]"
							>
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
														onClick={(e) => addSection(section.id)}
														icon={<IconPlus size={16} />}
													/>
													<Box className="bg-black/5 h-1 w-full" />
												</Box>
											</div>
										)}
										{/* dropping above section */}
										{dragging?.startsWith("section-") &&
											((section.id !== dragging &&
												data[sindex - 1]?.id !== dragging) ||
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
											removeSection={(e: any) => removeSection(sindex)}
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
																	aria-label="Add Section"
																	size="sm"
																	appearance="subtle"
																	className="min-w-6"
																	onClick={(e: any) =>
																		addRow(e, sindex, index)
																	}
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
														addRowBelow={(e: any) =>
															addRow(e, sindex, index + 1)
														}
														setOpen={setOpen}
														onDragStart={(e: any) => onDragStart(e, row.id)}
														removeRow={(e: any) => removeRow(row.id)}
														addCol={(e: any) => addCol(e, sindex, index, null)}
													>
														{row.children &&
															row.children.map((col: any, i: number) => (
																<div key={i}>
																	{/* add col above */}
																	{!dragging && (
																		<div
																			className="ind group h-2 relative z-10 -my-1"
																			onMouseEnter={(e) =>
																				onDragHover(e, section.id)
																			}
																		>
																			<Box className="gap-1 transition duration-500 h-[4px] translate-y-0.5 group-hover:opacity-100 opacity-0 flex items-center justify-center">
																				<Box className="bg-black/5 h-1 w-full" />
																				<Button
																					aria-label="Add Section"
																					size="sm"
																					appearance="subtle"
																					className="min-w-6"
																					onClick={(e: any) =>
																						addCol(
																							e,
																							sindex,
																							index,
																							i
																						)
																					}
																					icon={
																						<IconPlus
																							size={16}
																						/>
																					}
																				/>
																				<Box className="bg-black/5 h-1 w-full" />
																			</Box>
																		</div>
																	)}
																	{dragging?.startsWith("col-") &&
																		col.id !== dragging &&
																		row.children[i - 1]?.id !==
																		dragging && (
																			<div
																				className="ind group h-8 mx-1 relative z-10 -my-4 pt-[14px] ml-9 mr-0"
																				onMouseEnter={(e) =>
																					onDragHover(e, col.id)
																				}
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
																		onDragStart={(e: any) =>
																			onDragStart(e, col.id)
																		}
																		removeCol={(e: any) =>
																			removeCol(col.id)
																		}
																		addElement={(e: any) =>
																			addElement(e, i, index, sindex)
																		}
																		key={"col" + i}
																	>
																		{col.children.map(
																			(element: any, j: number) => (
																				<div key={"ele" + j}>
																					{dragging &&
																						element.id !==
																						dragging &&
																						col.children[j - 1]
																							?.id !==
																						dragging &&
																						!dragging.startsWith(
																							"section-"
																						) &&
																						!dragging.startsWith(
																							"col-"
																						) &&
																						!dragging.startsWith(
																							"row-"
																						) && (
																							<div
																								className="ind group h-[44px] mx-1 relative z-10 -my-[22px] pt-[20px] ml-10 mr-0"
																								onMouseEnter={(
																									e
																								) =>
																									onDragHover(
																										e,
																										element.id
																									)
																								}
																							>
																								<Box
																									bg="bg.accent"
																									rounded="full"
																									className="transition duration-500 h-[4px] group-hover:opacity-100 opacity-10"
																								/>
																							</div>
																						)}
																					<Ele
																						removeEle={(
																							e: any
																						) =>
																							removeEle(
																								element.id
																							)
																						}
																						onDragStart={(
																							e: any
																						) =>
																							onDragStart(
																								e,
																								element.id
																							)
																						}
																						type={
																							theEles[
																								element.id
																							]?.type
																						}
																						element={element}
																						label={
																							theEles[
																								element.id
																							]?.props[0]
																								?.value ||
																							undefined
																						}
																						setCurrentEle={
																							setCurrentEle
																						}
																						setCurrentHoverEle={
																							setCurrentHoverEle
																						}
																					/>
																				</div>
																			)
																		)}
																		{dragging &&
																			dragging !==
																			col.children[
																				col.children.length - 1
																			]?.id &&
																			!dragging.startsWith(
																				"section-"
																			) &&
																			!dragging.startsWith("row-") &&
																			!dragging.startsWith(
																				"col-"
																			) && (
																				<div
																					className="ind group h-[44px] mx-1 relative z-10 -my-[22px] pt-[20px] ml-10 mr-0"
																					onMouseEnter={(e) =>
																						onDragHover(
																							e,
																							"last-ele-" +
																							col.id
																						)
																					}
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
																onMouseEnter={(e) =>
																	onDragHover(e, section.id)
																}
															>
																<Box className="gap-1 transition duration-500 h-[4px] translate-y-0.5 group-hover:opacity-100 opacity-0 flex items-center justify-center">
																	<Box className="bg-black/5 h-1 w-full" />
																	<Button
																		aria-label="Add Section"
																		size="sm"
																		appearance="subtle"
																		className="min-w-6"
																		onClick={(e: any) =>
																			addCol(
																				e,
																				sindex,
																				index,
																				row.children.length
																			)
																		}
																		icon={<IconPlus size={16} />}
																	/>
																	<Box className="bg-black/5 h-1 w-full" />
																</Box>
															</div>
														)}
														{dragging?.startsWith("col-") &&
															dragging !==
															row.children[row.children.length - 1]
																?.id && (
																<div
																	className="ind group h-8 mx-1 relative z-10 -my-4 pt-[14px] -mr-[20px] ml-9"
																	onMouseEnter={(e) =>
																		onDragHover(e, "col-last-" + row.id)
																	}
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
											{!dragging &&
												!section.children[section.children.length - 1]?.open && (
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
																aria-label="Add Section"
																size="sm"
																appearance="subtle"
																className="min-w-6"
																onClick={(e: any) =>
																	addRow(
																		e,
																		sindex,
																		section.children.length
																	)
																}
																icon={<IconPlus size={16} />}
															/>
															<Box className="bg-black/5 h-1 w-full" />
														</Box>
													</div>
												)}
											{dragging?.startsWith("row-") &&
												(dragging !==
													section.children[section.children.length - 1]?.id ||
													cloning) && (
													<div
														className="ind group h-8 mx-1 relative z-10 -my-4 pt-[14px] -mr-[20px] ml-5"
														onMouseEnter={(e) =>
															onDragHover(e, "row-last-" + section.id)
														}
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
												onClick={(e) =>
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
							<Box
								px="24"
								py="16"
								fontSize="sm"
							>
								<Box mb="16">
									<Text
										fontSize="sm"
										fontWeight="600"
										mb="8"
									>
										SEO
									</Text>
									<Box
										display="flex"
										flexDirection="column"
										gap="8"
									>
										<Field label="Title">
											<Input2 placeholder="Enter page title" />
										</Field>
										<Field label="Keywords">
											<Input2 placeholder="Enter keywords" />
										</Field>
										<Field label="Description">
											<Textarea
												placeholder="Enter description"
												rows={3}
											/>
										</Field>
										<Field label="Meta">
											<Textarea
												placeholder="Enter meta information"
												rows={3}
											/>
										</Field>
									</Box>
								</Box>
								<Box>
									<Text
										fontSize="sm"
										fontWeight="600"
										mb="8"
									>
										Settings
									</Text>
									<Box
										display="flex"
										flexDirection="column"
										gap="8"
									>
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
				<div className="min-w-[50%] w-[50%]">
					<Text
						fontSize="sm"
						px="24"
						pt="16"
						fontWeight="400"
						color="fg.accent"
						onClick={() => setCurrentEle("none")}
						className="cursor-pointer"
					>
						{"<-"} Outline
					</Text>
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						gap="8"
						px="24"
						pr="0"
						py="4"
					>
						<Text
							fontSize="lg"
							fontWeight="600"
						>
							{currentEle !== "none" ? theEles[currentEle]?.type || "" : ""}
						</Text>
						<Box
							display="flex"
							alignItems="center"
							gap="8"
						>
							<svg
								width="17"
								height="16"
								viewBox="0 0 17 16"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M9 14.5C11.3125 14.5 13.4375 13.2812 14.625 11.25C15.7812 9.25 15.7812 6.78125 14.625 4.75C13.4375 2.75 11.3125 1.5 9 1.5C6.65625 1.5 4.53125 2.75 3.34375 4.75C2.1875 6.78125 2.1875 9.25 3.34375 11.25C4.53125 13.2812 6.65625 14.5 9 14.5ZM9 0C11.8438 0 14.4688 1.53125 15.9062 4C17.3438 6.5 17.3438 9.53125 15.9062 12C14.4688 14.5 11.8438 16 9 16C6.125 16 3.5 14.5 2.0625 12C0.625 9.53125 0.625 6.5 2.0625 4C3.5 1.53125 6.125 0 9 0ZM10 8C10 8.5625 9.53125 9 9 9C8.4375 9 8 8.5625 8 8C8 7.46875 8.4375 7 9 7C9.53125 7 10 7.46875 10 8ZM12 7C12.5312 7 13 7.46875 13 8C13 8.5625 12.5312 9 12 9C11.4375 9 11 8.5625 11 8C11 7.46875 11.4375 7 12 7ZM7 8C7 8.5625 6.53125 9 6 9C5.4375 9 5 8.5625 5 8C5 7.46875 5.4375 7 6 7C6.53125 7 7 7.46875 7 8Z"
									fill="#2E3442"
								/>
							</svg>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M12 5.5C9.65625 5.5 7.53125 6.75 6.34375 8.75C5.1875 10.7812 5.1875 13.25 6.34375 15.25C7.53125 17.2812 9.65625 18.5 12 18.5C14.3125 18.5 16.4375 17.2812 17.625 15.25C18.7812 13.25 18.7812 10.7812 17.625 8.75C16.4375 6.75 14.3125 5.5 12 5.5ZM12 20C9.125 20 6.5 18.5 5.0625 16C3.625 13.5312 3.625 10.5 5.0625 8C6.5 5.53125 9.125 4 12 4C14.8438 4 17.4688 5.53125 18.9062 8C20.3438 10.5 20.3438 13.5312 18.9062 16C17.4688 18.5 14.8438 20 12 20ZM11.25 14.75V12.75H9.25C8.8125 12.75 8.5 12.4375 8.5 12C8.5 11.5938 8.8125 11.25 9.25 11.25H11.25V9.25C11.25 8.84375 11.5625 8.5 12 8.5C12.4062 8.5 12.75 8.84375 12.75 9.25V11.25H14.75C15.1562 11.25 15.5 11.5938 15.5 12C15.5 12.4375 15.1562 12.75 14.75 12.75H12.75V14.75C12.75 15.1875 12.4062 15.5 12 15.5C11.5625 15.5 11.25 15.1875 11.25 14.75Z"
									fill="#4F576E"
								/>
							</svg>
						</Box>
					</Box>
					{theEles[currentEle]?.props?.map((prop: any, ind: number) => (
						<Fragment key={ind}>
							{prop.type === "text" && (
								<Input
									prop={prop}
									propIndex={ind}
									onChange={onInputChange}
								/>
							)}
							{prop.type === "checkbox" && (
								<div className="p-6 pr-0 py-2">
									<Checkbox
										checked={prop.value === "true" ? true : false}
										onChange={(e) =>
											onInputChange(
												e.currentTarget.checked ? "true" : "false",
												ind
											)
										}
									>
										{prop.label}
									</Checkbox>
								</div>
							)}
						</Fragment>
					))}
				</div>
			</div>
		</div>
	);
};

const extractElements = (nodes: any[]) => {
	let elements: Record<string, any> = {};
	const traverse = (node: any) => {
		if (node.children) {
			node.children.forEach(traverse);
		}
		if (node.type && node.props) {
			elements[node.id] = { type: node.type, props: node.props };
		}
	};
	nodes.forEach(traverse);
	return elements;
};

const mergeData = (structure: any[], elements: Record<string, any>) => {
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

const ensureOpen = (nodes: any[]): any[] => {
	return nodes.map((node) => ({
		...node,
		open: node.open ?? true,
		children: node.children ? ensureOpen(node.children) : undefined,
	}));
};

export default function VBPrototype({
	initialData,
	onSave,
	onPublish,
	pageName,
	pageStatus,
}: {
	initialData?: any[];
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

	const [theEles, _setTheEles] = useState<any>(() => {
		if (initialData) {
			return extractElements(initialData);
		}
		return {};
	});
	const setTheEles = (arg: SetStateAction<any>) => {
		hasChanged.current = true;
		_setTheEles(arg);
	};

	const [data, _setData] = useState<any[]>(() => {
		return initialData ? ensureOpen(initialData) : [];
	});
	const setData = (arg: SetStateAction<any[]>) => {
		hasChanged.current = true;
		_setData(arg);
	};

	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
	const isFirstRender = useRef(true);
	const onSaveRef = useRef(onSave);
	const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
	const [dropPosition, setDropPosition] = useState<{ colId: string; position: number } | null>(null);

	const onInputChange = (value: any, propIndex: number) => {
		if (currentEle !== "none" && currentEle in theEles) {
			setTheEles((prev: any) => {
				const oldProps = prev[currentEle as keyof typeof prev].props;
				const newProps = [...oldProps];
				newProps[propIndex] = { ...oldProps[propIndex], value: value };

				return {
					...prev,
					[currentEle]: {
						...prev[currentEle as keyof typeof prev],
						props: newProps,
					},
				};
			});
		}
	};

	useEffect(() => {
		onSaveRef.current = onSave;
	}, [onSave]);

	// Sync data changes to parent
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		if (!hasChanged.current) return;

		if (onSaveRef.current) {
			const mergedData = mergeData(data, theEles);
			onSaveRef.current(mergedData);
			setLastSaved(new Date());
		}
	}, [data, theEles]);

	// Add escape key event listener
	useEffect(() => {
		const handleMouseUp = (e: MouseEvent) => {
			console.log("Mouse up, resetting dragging state");
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

						// If cloning, create a new id for the cloned section and its children
						if (cloning) {
							const newSectionId = `${dragging}-${Date.now()}-${Math.floor(
								Math.random() * 1000
							)}`;
							draggedSection = {
								...draggedSection,
								id: newSectionId,
								children: draggedSection.children.map((row: any) => {
									const newRowId = `${row.id}-${Date.now()}-${Math.floor(
										Math.random() * 1000
									)}`;
									return {
										...row,
										id: newRowId,
										children: row.children.map((col: any) => {
											const newColId = `${col.id}-${Date.now()}-${Math.floor(
												Math.random() * 1000
											)}`;
											return {
												...col,
												id: newColId,
												children: col.children.map((ele: any) => {
													const newEleId = `${ele.id
														}-${Date.now()}-${Math.floor(
															Math.random() * 1000
														)}`;
													// Clone theElements entry
													if (theEles[ele.id]) {
														setTheEles((prevElements: any) => ({
															...prevElements,
															[newEleId]: {
																...prevElements[ele.id],
															},
														}));
													}
													return {
														...ele,
														id: newEleId,
													};
												}),
											};
										}),
									};
								}),
							};
						}

						// If dragging down, insert after hoverIdx
						const insertIdx =
							draggingIdx < hoverIdx && !cloning ? hoverIdx - 1 : hoverIdx;
						newArr.splice(insertIdx, 0, draggedSection);
						return newArr;
					});
					setCurrentHoverEle("none");
				} else if (
					dragging.startsWith("section-") &&
					currentHoverEle.startsWith("section-last")
				) {
					setData((prev) => {
						const draggingIdx = prev.findIndex((sec) => sec.id === dragging);
						if (draggingIdx === -1) return prev;
						const newArr = [...prev];
						let [draggedSection] = newArr.splice(draggingIdx, 1);

						newArr.push(draggedSection);
						return newArr;
					});
					setCurrentHoverEle("none");
					// ROW DRAGGING (within a section or across sections)
				} else if (
					dragging.startsWith("row-") &&
					currentHoverEle.startsWith("row-") &&
					!currentHoverEle.startsWith("row-last")
				) {
					setData((prev) => {
						let draggedRow: any = null;
						let fromSectionIdx = -1;
						let draggingIdx = -1;
						// Find and remove the dragged row from its section
						const newArr = prev.map((section, sIdx) => {
							const idx = section.children.findIndex(
								(row: any) => row.id === dragging
							);
							if (idx !== -1) {
								draggedRow = section.children[idx];
								fromSectionIdx = sIdx;
								draggingIdx = idx;
								const newChildren = [...section.children];
								// If cloning, don't remove the original
								if (!cloning) {
									newChildren.splice(idx, 1);
								}
								return { ...section, children: newChildren };
							}
							return section;
						});
						if (!draggedRow) return newArr;
						// If cloning, create a new id for the cloned row and its children
						let rowToInsert = draggedRow;
						if (cloning) {
							console.log("Cloning row", dragging);
							const newRowId = `${dragging}-${Date.now()}-${Math.floor(
								Math.random() * 1000
							)}`;
							rowToInsert = {
								...draggedRow,
								id: newRowId,
								children: draggedRow.children.map((col: any) => {
									const newColId = `${col.id}-${Date.now()}-${Math.floor(
										Math.random() * 1000
									)}`;
									return {
										...col,
										id: newColId,
										children: col.children.map((ele: any) => {
											const newEleId = `${ele.id}-${Date.now()}-${Math.floor(
												Math.random() * 1000
											)}`;
											// Clone theEles entry
											if (theEles[ele.id]) {
												setTheEles((prevEles: any) => ({
													...prevEles,
													[newEleId]: {
														...prevEles[ele.id],
													},
												}));
											}
											return {
												...ele,
												id: newEleId,
											};
										}),
									};
								}),
							};
						}
						// Find the section and index to insert into
						let toSectionIdx = -1;
						let hoverIdx = -1;
						prev.forEach((section, sIdx) => {
							const idx = section.children.findIndex(
								(row: any) => row.id === currentHoverEle
							);
							if (idx !== -1) {
								toSectionIdx = sIdx;
								hoverIdx = idx;
							}
						});
						if (toSectionIdx === -1 || hoverIdx === -1) return newArr;
						// Insert the dragged row into the target section at the correct position
						const toSection = newArr[toSectionIdx];
						const newChildren = [...toSection.children];
						// If dragging down, insert after hoverIdx
						const insertIdx =
							fromSectionIdx === toSectionIdx && draggingIdx < hoverIdx && !cloning
								? hoverIdx - 1
								: hoverIdx;
						newChildren.splice(insertIdx, 0, rowToInsert);
						newArr[toSectionIdx] = {
							...toSection,
							children: newChildren,
						};
						return newArr;
					});
					setCurrentHoverEle("none");
				} else if (dragging.startsWith("row-") && currentHoverEle.startsWith("row-last")) {
					setData((prev) => {
						let draggedRow: any = null;
						let fromSectionIdx = -1;
						let draggingIdx = -1;
						// Remove the dragged row from its section
						const newArr = prev.map((section, sIdx) => {
							const idx = section.children.findIndex(
								(row: any) => row.id === dragging
							);
							if (idx !== -1) {
								draggedRow = section.children[idx];
								fromSectionIdx = sIdx;
								draggingIdx = idx;
								const newChildren = [...section.children];
								// If cloning, don't remove the original
								if (!cloning) {
									newChildren.splice(idx, 1);
								}
								return { ...section, children: newChildren };
							}
							return section;
						});
						if (!draggedRow) return newArr;
						// If cloning, create a new id for the cloned row and its children
						let rowToInsert = draggedRow;
						if (cloning) {
							const newRowId = `${dragging}-${Date.now()}-${Math.floor(
								Math.random() * 1000
							)}`;
							rowToInsert = {
								...draggedRow,
								id: newRowId,
								children: draggedRow.children.map((col: any) => {
									const newColId = `${col.id}-${Date.now()}-${Math.floor(
										Math.random() * 1000
									)}`;
									return {
										...col,
										id: newColId,
										children: col.children.map((ele: any) => {
											const newEleId = `${ele.id}-${Date.now()}-${Math.floor(
												Math.random() * 1000
											)}`;
											// Clone theEles entry
											if (theEles[ele.id]) {
												setTheEles((prevEles: any) => ({
													...prevEles,
													[newEleId]: {
														...prevEles[ele.id],
													},
												}));
											}
											return {
												...ele,
												id: newEleId,
											};
										}),
									};
								}),
							};
						}
						// Find the section to append to
						let toSectionIdx = -1;
						prev.forEach((section, sIdx) => {
							if (`row-last-${section.id}` === currentHoverEle) {
								toSectionIdx = sIdx;
							}
						});
						if (toSectionIdx === -1) return newArr;
						// Append the dragged row to the target section
						const toSection = newArr[toSectionIdx];
						const newChildren = [...toSection.children, rowToInsert];
						newArr[toSectionIdx] = {
							...toSection,
							children: newChildren,
						};
						return newArr;
					});
					setCurrentHoverEle("none");
				}
				// COLUMN DRAGGING (within a row and across rows)
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
						// Remove the dragged col from its row
						const newArr = prev.map((section, sIdx) => {
							const rowIdx = section.children.findIndex((row: any) => {
								const idx = row.children.findIndex(
									(col: any) => col.id === dragging
								);
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

						// Find the row and index to insert into
						let toSectionIdx = -1;
						let toRowIdx = -1;
						let hoverIdx = -1;
						prev.forEach((section, sIdx) => {
							section.children.forEach((row: any, rIdx: number) => {
								const idx = row.children.findIndex(
									(col: any) => col.id === currentHoverEle
								);
								if (idx !== -1) {
									toSectionIdx = sIdx;
									toRowIdx = rIdx;
									hoverIdx = idx;
								}
							});
						});
						if (toSectionIdx === -1 || toRowIdx === -1 || hoverIdx === -1)
							return newArr;

						// Insert the dragged col into the target row at the correct position
						const toSection = newArr[toSectionIdx];
						const toRow = toSection.children[toRowIdx];
						const newCols = [...toRow.children];
						// If dragging down in same row, insert after hoverIdx
						const insertIdx =
							fromSectionIdx === toSectionIdx &&
								fromRowIdx === toRowIdx &&
								draggingIdx < hoverIdx
								? hoverIdx - 1
								: hoverIdx;
						newCols.splice(insertIdx, 0, draggedCol);
						const newRow = { ...toRow, children: newCols };
						const newChildren = [...toSection.children];
						newChildren[toRowIdx] = newRow;
						newArr[toSectionIdx] = {
							...toSection,
							children: newChildren,
						};
						return newArr;
					});
					setCurrentHoverEle("none");
				} else if (dragging.startsWith("col-") && currentHoverEle.startsWith("col-last")) {
					setData((prev) => {
						let draggedCol: any = null;
						let fromRowIdx = -1;
						let fromSectionIdx = -1;
						let draggingIdx = -1;
						// Remove the dragged col from its row
						const newArr = prev.map((section, sIdx) => {
							const rowIdx = section.children.findIndex((row: any) => {
								const idx = row.children.findIndex(
									(col: any) => col.id === dragging
								);
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

						// Find the row to append to
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

						// Append the dragged col to the target row
						const toSection = newArr[toSectionIdx];
						const toRow = toSection.children[toRowIdx];
						const newCols = [...toRow.children, draggedCol];
						const newRow = { ...toRow, children: newCols };
						const newChildren = [...toSection.children];
						newChildren[toRowIdx] = newRow;
						newArr[toSectionIdx] = {
							...toSection,
							children: newChildren,
						};
						return newArr;
					});
					setCurrentHoverEle("none");
				}
				// ELEMENT DRAGGING (within and across a column)
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
									let draggedElement = null;
									// Remove or clone the dragged element
									const newChildren = col.children.filter((ele: any) => {
										if (ele.id === dragging) {
											draggedElement = cloning ? { ...ele } : ele;
											return cloning; // keep if cloning, remove if moving
										}
										return true;
									});
									return { ...col, children: newChildren };
								}),
							})),
						}));

						let draggedElement: any = null;
						// Find the dragged element (for cloning)
						prev.forEach((section) => {
							section.children.forEach((row: any) => {
								row.children.forEach((col: any) => {
									col.children.forEach((ele: any) => {
										if (ele.id === dragging) {
											draggedElement = cloning ? { ...ele } : ele;
										}
									});
								});
							});
						});

						if (!draggedElement) return updatedData;

						if (cloning) {
							const originalEle = theEles[dragging];
							if (!originalEle) return updatedData;
							const newElementClone = { ...originalEle, id: newid };
							setTheEles((prevEles: any) => ({
								...prevEles,
								[newid]: newElementClone,
							}));
							draggedElement.id = newid;
						}

						// Insert into the target position
						return updatedData.map((section) => ({
							...section,
							children: section.children.map((row: any) => ({
								...row,
								children: row.children.map((col: any) => {
									const idx = col.children.findIndex(
										(ele: any) => ele.id === currentHoverEle
									);
									if (idx !== -1) {
										const isAlreadyPresent = col.children.some(
											(ele: any) => ele.id === draggedElement.id
										);
										if (!isAlreadyPresent) {
											const newChildren = [...col.children];
											newChildren.splice(idx, 0, draggedElement);
											return {
												...col,
												children: newChildren,
											};
										}
									}
									return col;
								}),
							})),
						}));
					});
					setCurrentHoverEle("none");
				} else if (currentHoverEle.startsWith("last-ele")) {
					// Move to end of column
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
											return cloning; // keep if cloning, remove if moving
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
							const newElementClone = { ...originalEle, id: newid };
							setTheEles((prevEles: any) => ({
								...prevEles,
								[newid]: newElementClone,
							}));
							draggedElement.id = newid;
						}

						// Find the target column
						const targetColId = currentHoverEle.replace(/^last-ele-/, "");
						return updatedData.map((section) => ({
							...section,
							children: section.children.map((row: any) => ({
								...row,
								children: row.children.map((col: any) => {
									if (col.id === targetColId) {
										const isAlreadyPresent = col.children.some(
											(ele: any) => ele.id === draggedElement.id
										);
										if (!isAlreadyPresent) {
											return {
												...col,
												children: [...col.children, draggedElement],
											};
										}
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
			if (firstInput) {
				firstInput.focus();
			}
		}

		window.addEventListener("mouseup", handleMouseUp);

		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key === "Alt" && event.location === 1) {
				setCloning(false);
			}
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
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [currentEle, dragging, currentHoverEle]);

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
						<div className="bg-[#0000000d] w-1 h-full left-1.5 grow-1 " />
						<div>
							<IconArrowBarBoth
								size="16"
								color="#00000066"
							/>
						</div>
						<div className="bg-[#0000000d] w-1 h-full left-1.5 grow-1 " />
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
						className="rounded-lg bg-white shadow-lg grow w-full mt-3"
						onClick={() => setCurrentEle("none")}
						onDragOver={(e) => {
							e.preventDefault();
							const hasImageData = e.dataTransfer.types.includes("image/url");
							if (hasImageData) {
								e.currentTarget.style.opacity = "0.8";
							}
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

								// Add to theEles
								setTheEles((prev: any) => ({
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

								// Add to data structure at the drop position
								setData((prev) => {
									return prev.map((section) => ({
										...section,
										children: section.children.map((row: any) => ({
											...row,
											children: row.children.map((col: any) => {
												if (col.id === dropPosition.colId) {
													const newChildren = [...col.children];
													newChildren.splice(dropPosition.position, 0, { id: uKey });
													return {
														...col,
														children: newChildren,
													};
												}
												return col;
											}),
										})),
									}));
								});
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
								<section
									className=""
									key={sindex}
								>
									{section.children.map((row: any, index: any) => (
										<section
											className="grid grid-flow-col auto-cols-fr gap-4 text-white"
											key={index}
										>
											{row.children.map((col: any, colIndex: any) => (
												<div
													key={"col" + colIndex}
													onDragOver={(e) => {
														e.preventDefault();
														e.stopPropagation();
														const hasImageData = e.dataTransfer.types.includes("image/url");
														if (hasImageData) {
															setDragOverColumn(col.id);
															// Calculate drop position based on mouse Y position
															const rect = e.currentTarget.getBoundingClientRect();
															const elements = col.children;
															const mouseY = e.clientY;

															// Find insertion point
															let insertPosition = elements.length;
															const elementDivs = e.currentTarget.querySelectorAll('[data-element-id]');

															for (let i = 0; i < elementDivs.length; i++) {
																const elemRect = elementDivs[i].getBoundingClientRect();
																const elemMiddle = elemRect.top + elemRect.height / 2;

																if (mouseY < elemMiddle) {
																	insertPosition = i;
																	break;
																}
															}

															setDropPosition({
																colId: col.id,
																position: insertPosition
															});
														}
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
																transform: dropPosition.position === 0 ? "translateY(0)" : dropPosition.position === col.children.length ? "translateY(0)" : `translateY(${dropPosition.position * 60}px)`
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
																backgroundColor: "rgba(0, 55, 255, 0.05)"
															}}
														>
															Drop image here
														</div>
													)}
													{col.children.map(
														(element: any, eleIndex: any) => (
															<div
																key={"ele" + eleIndex}
																className="relative group"
																data-element-id={element.id}
															>
																<div
																	onClick={(e) => {
																		e.stopPropagation();
																		setCurrentEle(element.id);
																		setCurrentHoverEle("none");
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
																	className="cursor-pointer group-hover:visible group-hover:-left-2 group-hover:-top-2 group-hover:-right-2 group-hover:-bottom-2 group-hover:opacity-50 transition-all duration-100 invisible opacity-0 absolute border-2 -left-1 -top-1 -right-1 -bottom-1 z-10 border-[#0037FF] rounded-[4px] rounded-tl-none"
																>
																	<div className="bg-[#0037FF] flex gap-1 items-center text-white text-[9px] absolute px-2 py-[3px] rounded-[4px] -top-5 -left-[2px] rounded-b-none">
																		{(() => {
																			switch (
																			theEles[element.id]
																				?.type
																			) {
																				case "Heading":
																					return (
																						<IconHeading
																							size={
																								12
																							}
																						/>
																					);
																				case "Text":
																					return (
																						<IconPilcrow
																							size={
																								12
																							}
																						/>
																					);
																				case "Input":
																					return (
																						<IconForms
																							size={
																								12
																							}
																						/>
																					);
																				case "Button":
																					return (
																						<IconRectangle
																							size={
																								12
																							}
																						/>
																					);
																				case "Image":
																					return (
																						<IconPhoto
																							size={
																								12
																							}
																						/>
																					);
																				default:
																					return (
																						<IconBrackets
																							size={
																								12
																							}
																						/>
																					);
																			}
																		})()}
																		{theEles[element.id]?.type}
																	</div>
																</div>
																{(() => {
																	switch (
																	theEles[element.id]?.type
																	) {
																		case "Heading":
																			return (
																				<h1 className="text-3xl mb-5 font-bold">
																					{theEles[
																						element.id
																					]?.props.find(
																						(
																							prop: any
																						) =>
																							prop.label ===
																							"Text"
																					)?.value || (
																							<>&nbsp;</>
																						)}
																				</h1>
																			);
																		case "Text":
																			return (
																				<p className="mb-2">
																					{theEles[
																						element.id
																					]?.props.find(
																						(
																							prop: any
																						) =>
																							prop.label ===
																							"Text"
																					)?.value || (
																							<>&nbsp;</>
																						)}
																				</p>
																			);
																		case "Input":
																			return (
																				<div className="group relative mt-4">
																					{theEles[
																						element.id
																					]?.props.find(
																						(
																							prop: any
																						) =>
																							prop.label ===
																							"Tooltip"
																					)?.value && (
																							<div className="text-sm group-hover:opacity-100 group-hover:scale-100 group-hover:delay-1000 delay-0 group-hover:visible group-hover:-translate-y-2 opacity-0 text-center invisible absolute left-1/2 -translate-x-1/2 bottom-10 scale-90 shadow-lg transition-[.3s] px-2 py-1 rounded-md bg-[#000] text-white">
																								{
																									theEles[
																										element
																											.id
																									]?.props.find(
																										(
																											prop: any
																										) =>
																											prop.label ===
																											"Tooltip"
																									)
																										?.value
																								}
																							</div>
																						)}
																					<label>
																						{theEles[
																							element
																								.id
																						]?.props.find(
																							(
																								prop: any
																							) =>
																								prop.label ===
																								"Label"
																						)
																							?.value || (
																								<>
																									&nbsp;
																								</>
																							)}
																						{theEles[
																							element
																								.id
																						]?.props.find(
																							(
																								prop: any
																							) =>
																								prop.label ===
																								"Required"
																						)?.value ===
																							"true" && (
																								<span className="text-[#ff5500]">
																									{" "}
																									*
																								</span>
																							)}
																					</label>
																					<input
																						type="text"
																						placeholder={
																							theEles[
																								element
																									.id
																							]?.props.find(
																								(
																									prop: any
																								) =>
																									prop.label ===
																									"Placeholder"
																							)
																								?.value ||
																							null
																						}
																						className="border border-[#ffffff22] rounded-[6px] p-2 w-full bg-[#ffffff11] placeholder:text-[#ffffff66]"
																					/>
																				</div>
																			);
																		case "Button":
																			return (
																				<div className="text-right mt-4">
																					<div className="rounded bg-[#6846FF] px-5 py-3 text-center text-white font-bold inline-block">
																						{theEles[
																							element
																								.id
																						]?.props.find(
																							(
																								prop: any
																							) =>
																								prop.label ===
																								"Label"
																						)
																							?.value || (
																								<>
																									&nbsp;
																								</>
																							)}
																					</div>
																				</div>
																			);
																		case "Image":
																			const imageUrlRaw = theEles[element.id]?.props.find(
																				(prop: any) => prop.label === "Image URL"
																			)?.value;
																			const imageUrl =
																				typeof imageUrlRaw === "string"
																					? imageUrlRaw.trim()
																					: imageUrlRaw;
																			const imageAlt = theEles[element.id]?.props.find(
																				(prop: any) => prop.label === "Alt Text"
																			)?.value;
																			const imageWidth = theEles[element.id]?.props.find(
																				(prop: any) => prop.label === "Width"
																			)?.value;
																			const imageHeight = theEles[element.id]?.props.find(
																				(prop: any) => prop.label === "Height"
																			)?.value;

																			return (
																				<div className="mb-4">
																					{imageUrl ? (
																						<img
																							src={imageUrl}
																							alt={imageAlt || "Image"}
																							style={{
																								width:
																									imageWidth === "auto"
																										? "100%"
																										: imageWidth,
																								height:
																									imageHeight === "auto"
																										? "auto"
																										: imageHeight,
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
																		default:
																			return (
																				<svg
																					width="19"
																					height="16"
																					viewBox="0 0 19 16"
																					fill="none"
																					xmlns="http://www.w3.org/2000/svg"
																				>
																					<path
																						d="M5.75 1H7.25C7.65625 1 8 1.34375 8 1.75C8 2.1875 7.65625 2.5 7.25 2.5H5.75C5.03125 2.5 4.5 3.0625 4.5 3.75V5.1875C4.5 5.90625 4.1875 6.625 3.6875 7.125L2.78125 8L3.6875 8.90625C4.1875 9.40625 4.5 10.125 4.5 10.8438V12.25C4.5 12.9688 5.03125 13.5 5.75 13.5H7.25C7.65625 13.5 8 13.8438 8 14.25C8 14.6875 7.65625 15 7.25 15H5.75C4.21875 15 3 13.7812 3 12.25V10.8438C3 10.5 2.84375 10.1875 2.625 9.96875L1.21875 8.53125C0.90625 8.25 0.90625 7.78125 1.21875 7.46875L2.625 6.0625C2.84375 5.84375 3 5.53125 3 5.1875V3.75C3 2.25 4.21875 1 5.75 1ZM14.25 1C15.75 1 17 2.25 17 3.75V5.1875C17 5.53125 17.125 5.84375 17.3438 6.0625L18.7812 7.5C19.0625 7.78125 19.0625 8.25 18.7812 8.53125L17.3438 9.96875C17.125 10.1875 17 10.5 17 10.8438V12.25C17 13.7812 15.75 15 14.25 15H12.75C12.3125 15 12 14.6875 12 14.25C12 13.8438 12.3125 13.5 12.75 13.5H14.25C14.9375 13.5 15.5 12.9688 15.5 12.25V10.8438C15.5 10.125 15.7812 9.40625 16.2812 8.90625L17.1875 8L16.2812 7.125C15.7812 6.625 15.5 5.90625 15.5 5.1875V3.75C15.5 3.0625 14.9375 2.5 14.25 2.5H12.75C12.3125 2.5 12 2.1875 12 1.75C12 1.34375 12.3125 1 12.75 1H14.25Z"
																						fill="currentColor"
																					/>
																				</svg>
																			);
																	}
																})()}
															</div>
														)
													)}
												</div>
											))}
										</section>
									))}
								</section>
							))}
						</div>
					</div>
					{isImageSelectorOpen && (
						<ImageSelectorPanel onClose={() => setIsImageSelectorOpen(false)} />
					)}
					<Box
						borderL="1"
						borderColor="border.tertiary"
					>
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

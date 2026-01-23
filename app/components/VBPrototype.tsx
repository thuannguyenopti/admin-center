"use client";

import {
	Box,
	Button,
	Text,
	Textarea,
	Heading,
	Menu,
	MenuTrigger,
	MenuContent,
} from "@optiaxiom/react";
import React, { useEffect, useRef, useState } from "react";
import {
	IconPlus,
	IconArrowBarBoth,
	IconFile,
	IconSparkles,
	IconSquare,
	IconSection,
	IconDots,
	IconSettings,
	IconChevronLeft,
	IconCopy,
} from "@tabler/icons-react";

import { EleMap } from "./vb/Ele";
import ElementEditor from "./vb/ElementEditor";
import PreviewCanvas from "./vb/PreviewCanvas";
import RightToolbar from "./RightToolbar";
import CMSToolbar from "./CMSToolbar";
import { PreviewSettings } from "./vb/PreviewSettings";
import ImageSelectorPanel from "./ImageSelector/ImageSelectorPanel";
import styles from "./VBPrototype.module.css";
import PropertiesPanel, { PageProperties } from "./vb/PropertiesPanel";
import OutlineTree from "./vb/OutlineTree";

/** -----------------------------
 * Types + helpers (normalize / prune)
 * ------------------------------*/

type NormalizeResult = { data: any[]; theEles: EleMap };
type SplitPayload = { data: any[]; theEles: EleMap };

const isEleNode = (n: any) =>
	n &&
	typeof n === "object" &&
	typeof n.id === "string" &&
	typeof n.type === "string" &&
	(n.properties || Array.isArray(n.props));

const ensureOpen = (nodes: any[]): any[] => {
	return nodes.map((node) => ({
		...node,
		open: node.open ?? true,
		children: Array.isArray(node.children)
			? ensureOpen(node.children)
			: Array.isArray(node.elements)
				? ensureOpen(node.elements)
				: node.children,
	}));
};

// only strips truly transient flags (keep `open`)
const stripTransientFlags = (nodes: any[]): any[] => {
	return nodes.map((n) => {
		const { isNew, ...rest } = n;
		return {
			...rest,
			children: Array.isArray(n.children)
				? stripTransientFlags(n.children)
				: Array.isArray(n.elements)
					? stripTransientFlags(n.elements)
					: n.children,
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
			let properties = node.properties;
			if (!properties && Array.isArray(node.props)) {
				// Normalize legacy props array to properties map
				properties = {};
				node.props.forEach((p: any) => {
					// Use label-based mapping for legacy support
					const key = p.label.toLowerCase().includes("text") ? "text" :
						p.label.toLowerCase().includes("heading") ? "text" :
							p.label.toLowerCase().includes("label") ? "label" :
								p.label.toLowerCase().includes("image") ? "imageUrl" :
									p.label.toLowerCase().replace(/\s+/g, "");
					properties[key] = { value: p.value };
				});
			}
			theEles[node.id] = {
				type: node.type,
				properties: properties || {},
			};
			return { id: node.id };
		}

		const out: any = { ...node };
		if (Array.isArray(node.elements)) {
			out.elements = node.elements.map(strip);
		} else if (Array.isArray(node.children)) {
			// If it's likely a column but using 'children', normalize to 'elements'
			if (node.id && (node.id.startsWith("col-") || node.id.startsWith("c-"))) {
				out.elements = node.children.map(strip);
				delete out.children;
			} else {
				out.children = node.children.map(strip);
			}
		}
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
				const children = col.elements || col.children || [];
				for (const ref of children) {
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

type OutlineType = {
	id: string;
	title: string;
	tree: any[];
	elements: EleMap;
};

const isOutlineArray = (v: any): v is OutlineType[] => {
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

type PageInput = {
	outlines?: OutlineType[] | any[] | SplitPayload; // allow legacy too
	properties?: PageProperties;
};

/** -----------------------------
 * Existing mergeData (kept)
 * ------------------------------*/

const mergeData = (structure: any[], elements: EleMap) => {
	return structure.map((node) => {
		const newNode = { ...node };
		if (elements[node.id]) {
			newNode.type = elements[node.id].type;
			newNode.properties = elements[node.id].properties;
		}
		const children = node.elements || node.children;
		if (Array.isArray(children)) {
			newNode.children = mergeData(children, elements);
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
	// ✅ Fix TS mismatch: keep this consistently string|null everywhere
	const [dragging, setDragging] = useState<string | null>(null);
	const [cloning, setCloning] = useState<boolean>(false);

	const [preview, setPreview] = useState<PreviewSettings>({
		mode: "responsive",
		width: 1100,
		maxWidth: 1100,
	});

	const onPreviewChange = (patch: Partial<PreviewSettings>) => {
		setPreview((p) => ({ ...p, ...patch }));
	};

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

	const [outlines, _setOutlines] = useState<OutlineType[]>(() => {
		const raw = initialData?.outlines;

		if (isOutlineArray(raw)) {
			return (raw ?? []).map((o) => ({
				...o,
				tree: ensureOpen(stripTransientFlags(o.tree ?? [])),
				elements: o.elements ?? {},
			}));
		}

		if (raw == null) {
			return [];
		}

		const norm = normalizePage(raw);
		return [{ id: "outline-main", title: "Main", tree: norm.data, elements: norm.theEles }];
	});

	const hasChanged = useRef(false);

	const setOutlines = (arg: React.SetStateAction<OutlineType[]>) => {
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

	const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
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
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [outlines.length]);

	const isZero = outlines.length === 0; // View 4
	const isSingle = outlines.length === 1; // View 3
	const isMulti = outlines.length > 1; // View 1/2
	const isEditingElement = currentEle !== "none";

	const activeOutline = activeOutlineId ? outlines.find((o) => o.id === activeOutlineId) ?? null : null;

	const data = activeOutline?.tree ?? [];
	const theEles = activeOutline?.elements ?? {};

	const setData = (arg: React.SetStateAction<any[]>) => {
		hasChanged.current = true;
		setOutlines((prev) =>
			prev.map((o) =>
				o.id === activeOutlineId ? { ...o, tree: typeof arg === "function" ? (arg as any)(o.tree) : arg } : o
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

	const duplicateActiveOutline = () => {
		if (!activeOutline) return;
		const newId = `outline-${Date.now()}`;
		const newOutline: OutlineType = {
			...activeOutline,
			id: newId,
			title: `${activeOutline.title} (Copy)`,
		};
		setOutlines((prev) => [...prev, newOutline]);
		setActiveOutlineId(newId);
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

		// ✅ Always drill down from View 1 -> View 2 when multi-outline
		// (even if the element belongs to the currently active outline)
		if (isMulti) {
			setSidebarTab("outlines");  // keep your View 2 layout expectations
			setOutlineView("tree");
		}

		const owner = findOutlineIdForElement(eleId);
		if (owner && owner !== activeOutlineId) {
			setActiveOutlineId(owner);
		}
	};

	const [AI, setAI] = useState(false);
	const [loadingAI, setLoadingAI] = useState(false);
	const [aiPrompt, setAiPrompt] = useState("");

	async function sendMessage(message: string) {
		if (!message.trim()) return;
		setLoadingAI(true);
		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userMessage: message }),
			});

			const payload = await res.json();

			const parsed = JSON.parse(payload.response);

			const norm = normalizePage(parsed);
			setData(norm.data);
			setTheEles(norm.theEles);
		} finally {
			setLoadingAI(false);
		}
	}

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

	const onInputChange = (value: any, keyOrIndex: string | number) => {
		if (currentEle !== "none" && currentEle in theEles) {
			setTheEles((prev) => {
				const ele = prev[currentEle];
				const properties = { ...(ele.properties || {}) };

				if (typeof keyOrIndex === "string") {
					properties[keyOrIndex] = { ...properties[keyOrIndex], value };
				}

				return {
					...prev,
					[currentEle]: {
						...ele,
						properties,
					},
				};
			});
		}
	};

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

			{!isMulti && (
				<Menu
					options={[
						{
							addon: <IconSettings size={16} />,
							label: "Properties",
							execute: () => {
								setSidebarTab("properties");
								setEditingSectionId(null);
							},
						},
						{
							addon: <IconCopy size={16} />,
							label: "Duplicate",
							execute: duplicateActiveOutline,
						},
					]}
				>
					<MenuTrigger
						icon={<IconDots size={16} />}
						aria-label="more"
						appearance="subtle"
						size="sm"
						iconPosition="start"
					/>
					<MenuContent />
				</Menu>
			)}

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
				<form
					onSubmit={(e) => {
						e.preventDefault();
						sendMessage(aiPrompt);
					}}
				>
					<Textarea
						name="prompt"
						rows={3}
						className="w-full border rounded p-2 focus:outline-none focus:ring-2"
						placeholder="What do you want to build today?"
						value={aiPrompt}
						onChange={(e: any) => setAiPrompt(e.target.value)}
					/>
					<div className="mt-2 flex gap-2">
						<Button size="sm" onClick={() => sendMessage(aiPrompt)} disabled={loadingAI}>
							Run
						</Button>
						<Button
							size="sm"
							appearance="subtle"
							onClick={() => {
								setAI(false);
								setAiPrompt("");
							}}
						>
							Close
						</Button>
					</div>
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
	 * Drag/drop + key handlers (internal reorder)
	 * ------------------------------*/

	type DragApplyResult = {
		nextData: any[];
		elesPatch?: EleMap;
	};

	const isSectionId = (id: string) => id.startsWith("section-") || id.startsWith("sec-");
	const isRowId = (id: string) => id.startsWith("row-");
	const isColId = (id: string) => id.startsWith("col-");
	const isEleId = (id: string) => !isSectionId(id) && !isRowId(id) && !isColId(id);

	const isSectionLast = (id: string) => id === "sec-last" || id.startsWith("sec-last") || id === "section-last" || id.startsWith("section-last");
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
						const colChildren = col.elements || col.children || [];
						return {
							...col,
							id: newColId,
							elements: colChildren.map((ref: any) => {
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
				const colChildren = col.elements || col.children || [];
				return {
					...col,
					id: newColId,
					elements: colChildren.map((ref: any) => {
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

	function applyColDrag(data: any[], draggingId: string, hoverId: string, cloning: boolean): DragApplyResult | null {
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
		const elesPatch = cloning && theEles[draggingId] ? { [newEleId]: { ...theEles[draggingId] } } : undefined;

		let draggedRef: any = null;

		const removed = data.map((sec: any) => ({
			...sec,
			children: (sec.children || []).map((row: any) => ({
				...row,
				children: (row.children || []).map((col: any) => {
					const colChildren = col.elements || col.children || [];
					const nextChildren = colChildren.filter((ref: any) => {
						if (ref?.id === draggingId) {
							draggedRef = cloning ? { id: newEleId } : ref;
							return cloning;
						}
						return true;
					});
					return { ...col, elements: nextChildren };
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
						const colChildren = col.elements || col.children || [];
						if (colChildren.some((r: any) => r?.id === draggedRef.id)) return col;
						return { ...col, elements: [...colChildren, draggedRef] };
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
					const colChildren = col.elements || col.children || [];
					const idx = colChildren.findIndex((r: any) => r?.id === hoverId);
					if (idx === -1) return col;

					if (colChildren.some((r: any) => r?.id === draggedRef.id)) return col;

					const copy = [...colChildren];
					copy.splice(idx, 0, draggedRef);
					return { ...col, elements: copy };
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
		window.addEventListener("dragend", handleMouseUp);
		window.addEventListener("drop", handleMouseUp);

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
			window.removeEventListener("dragend", handleMouseUp);
			window.removeEventListener("drop", handleMouseUp);
		};
	}, [dragging, currentHoverEle, cloning, theEles, data]);

	/** -----------------------------
	 * View 4: 0 outlines
	 * ------------------------------*/
	if (isZero) {
		return (
			<div className="select-none" style={{ height: "100%" }}>
				<Box
					bg="bg.page"
					w="full"
					className="grid grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)]"
					style={{ height: "100%", overflow: "hidden" }}
				>
					<CMSToolbar
						pageName={pageName || "New Page"}
						lastSaved={lastSaved}
						pageStatus={pageStatus}
						onPublish={onPublish}
						contentTypeIcon={<IconFile size={16} />}
						preview={preview}
						onPreviewChange={onPreviewChange}
					/>

					{/* LEFT SIDEBAR (Properties only) */}
					<Box
						pt="4"
						w="auto"
						className="vb-outline"
						bg="bg.page"
						style={{ width: 324, minWidth: 180, maxWidth: 600, position: "relative" }}
					>
						{/* Resizable handle (kept consistent) */}
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

						<div className="h-full flex flex-col" style={{ overflow: "hidden" }}>
							<div className="pl-6 pt-4 pb-2">
								<Heading level="4">Properties</Heading>
							</div>

							<div className="flex-1 overflow-y-auto">
								<PropertiesPanel value={properties} onChange={setPropertiesPatch} />
							</div>
						</div>
					</Box>

					{/* RIGHT / CANVAS (still visible even with 0 outlines) */}
					<div
						className="p-6 pr-0 pt-0 gap-2 flex items-stretch z-10 min-h-0 flex-1"
						style={{ height: "100%", overflow: "hidden" }}
					>
						<PreviewCanvas
							outlines={outlines as any} // will be []
							theEles={{}}              // no active outline
							currentEle={currentEle}
							currentHoverEle={currentHoverEle}
							setCurrentEle={setCurrentEleSmart}
							setCurrentHoverEle={setCurrentHoverEle}
							setOutlines={setOutlines as any}
							preview={preview}
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

	/** -----------------------------
	 * Main layout
	 * ------------------------------*/
	return (
		<div className="select-none" style={{ height: "100%" }}>
			<Box
				bg="bg.page"
				w="full"
				className="grid grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)]"
				style={{ height: "100%", overflow: "hidden" }}
			>
				<CMSToolbar
					pageName={pageName || "New Page"}
					lastSaved={lastSaved}
					pageStatus={pageStatus}
					onPublish={onPublish}
					contentTypeIcon={<IconFile size={16} />}
					preview={preview}
					onPreviewChange={onPreviewChange}
				/>

				{/* LEFT SIDEBAR */}
				<Box
					pt="4"
					pr="0"
					w="auto"
					className="vb-outline"
					bg="bg.page"
					style={{ width: 324, minWidth: 180, maxWidth: 600, position: "relative" }}
				>
					{/* Resizable handle */}
					<div
						className="absolute top-0 bottom-0 flex flex-col items-center gap-1 -right-2 w-4 cursor-ew-resize z-20 hover:opacity-100 opacity-0 transition-opacity duration-200"
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

					<div className="h-full flex flex-col" style={{ overflow: "hidden" }}>
						{/* MULTI: list/tree/properties/ElementEditor drill-down slide */}
						{isMulti ? (
							<div className="h-full overflow-hidden">
								<div
									className="flex w-[400%] h-full transition-transform duration-300 ease-out will-change-transform"
									style={{
										transform: isEditingElement
											? "translateX(-75%)"
											: sidebarTab === "properties"
												? "translateX(-50%)"
												: outlineView === "tree"
													? "translateX(-25%)"
													: "translateX(0%)",
									}}
								>
									{/* PANE 1: Outlines List */}
									<div className="min-w-[25%] w-[25%] h-full flex flex-col">
										<Box px="24" pt="16" mb="16">
											<Box display="flex" alignItems="center" gap="8">
												<Heading level="4">Page</Heading>
												<Box flex="1" />
												<Box display="flex" alignItems="center" gap="4">
													<Menu
														options={[
															{
																addon: <IconSettings size={16} />,
																label: "Properties",
																execute: () => {
																	setSidebarTab("properties");
																	setEditingSectionId(null);
																},
															},
														]}
													>
														<MenuTrigger
															icon={<IconDots size={16} />}
															aria-label="more"
															appearance="subtle"
															size="sm"
															iconPosition="start"
														/>
														<MenuContent />
													</Menu>
												</Box>
											</Box>
										</Box>
										<div className="flex-1 overflow-y-auto pl-3 pr-3 pb-4">
											<div className="flex flex-col gap-1">
												{outlines.map((o) => (
													<Button
														key={o.id}
														appearance="subtle"
														w="full"
														justifyContent="flex-start"
														onClick={() => {
															setActiveOutlineId(o.id);
															setSidebarTab("outlines");
															setCurrentEle("none");
															setCurrentHoverEle("none");
															setAI(false);
															setOutlineView("tree");
														}}
													>
														{o.title}
													</Button>
												))}
											</div>
										</div>
									</div>

									{/* PANE 2: Outline Tree */}
									<div className="min-w-[25%] w-[25%] h-full flex flex-col">
										<div className="pt-4 pb-2">
											{activeOutline ? (
												<div className="pl-6 pr-6 flex flex-col gap-1">
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
														← Page
													</Text>

													<div className="flex items-center gap-2">
														<Heading level="4">{activeOutline.title}</Heading>
														<div className="flex-1" />
														<div className="flex items-center gap-1">
															{HeaderActions}
														</div>
													</div>
												</div>
											) : (
												<div className="pl-6 pr-6 flex items-center gap-2">
													<Heading level="4">Outline</Heading>
													<div className="flex-1" />
													{HeaderActions}
												</div>
											)}
										</div>
										<div className="flex-1 overflow-y-auto pb-4 pr-3 min-h-0">
											{activeOutline ? (
												<OutlineTree
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
													onEditProperties={(id) => {
														setSidebarTab("properties");
														setEditingSectionId(id);
													}}
												/>
											) : null}
										</div>
									</div>

									{/* PANE 3: Properties */}
									<div className="min-w-[25%] w-[25%] h-full flex flex-col">
										{!editingSectionId && (
											<div className="pl-6 pr-6 pt-4 pb-2">
												<Text
													fontSize="sm"
													fontWeight="400"
													color="fg.accent"
													className="cursor-pointer mb-1"
													onClick={() => {
														setSidebarTab("outlines");
														setOutlineView("list");
														setEditingSectionId(null);
													}}
												>
													← Page
												</Text>
												<div className="flex items-center gap-2">
													<Heading level="4">Properties</Heading>
													<div className="flex-1" />
												</div>
											</div>
										)}
										<div className="flex-1 overflow-y-auto">
											{editingSectionId ? (
												<Box p="24">
													<Text
														fontSize="sm"
														fontWeight="400"
														color="fg.accent"
														className="cursor-pointer mb-1"
														onClick={() => {
															setSidebarTab("outlines");
															setOutlineView("tree");
															setEditingSectionId(null);
														}}
													>
														← {activeOutline?.title || "Page"}
													</Text>
													<Heading level="4" mb="16">Section Properties</Heading>
													<Text fontSize="sm" color="fg.secondary">
														Editing properties for section: {editingSectionId}
													</Text>
													{/* Add section specific fields here later */}
												</Box>
											) : (
												<PropertiesPanel value={properties} onChange={setPropertiesPatch} />
											)}
										</div>
									</div>

									{/* PANE 4: Element Editor */}
									<div className="min-w-[25%] w-[25%] h-full">
										<div className="h-full overflow-y-auto">
											<ElementEditor
												outlineTitle={activeOutline?.title || "Outline"}
												elementType={currentEle !== "none" ? theEles[currentEle]?.type || "" : ""}
												currentEle={currentEle}
												properties={theEles[currentEle]?.properties}
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

						{/* SINGLE: tree/properties/ElementEditor drill-down slide */}
						{isSingle && activeOutline ? (
							<div className="h-full overflow-hidden">
								<div
									className="flex w-[300%] h-full transition-transform duration-300 ease-out will-change-transform"
									style={{
										transform: isEditingElement
											? "translateX(-66.666%)"
											: sidebarTab === "properties"
												? "translateX(-33.333%)"
												: "translateX(0%)",
									}}
								>
									{/* PANE 1: Outline Tree */}
									<div
										className="min-w-[33.333%] w-[33.333%] h-full flex flex-col"
									>
										<div className="pl-6 pr-6 pt-4 pb-2">
											<div className="flex items-center gap-2">
												<Heading level="4">{activeOutline.title}</Heading>
												<div className="flex-1" />
												<div className="flex items-center gap-1">
													{HeaderActions}
												</div>
											</div>
										</div>
										<div className="flex-1 overflow-y-auto pb-4 pr-3">
											<OutlineTree
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
												onEditProperties={(id) => {
													setSidebarTab("properties");
													setEditingSectionId(id);
												}}
											/>
										</div>
									</div>

									{/* PANE 2: Properties (Page or Section) */}
									<div
										className="min-w-[33.333%] w-[33.333%] h-full flex flex-col"
									>
										{!editingSectionId && (
											<div className="pl-6 pr-6 pt-4 pb-2">
												<Text
													fontSize="sm"
													fontWeight="400"
													color="fg.accent"
													className="cursor-pointer mb-1"
													onClick={() => {
														setSidebarTab("outline");
														setEditingSectionId(null);
													}}
												>
													← {activeOutline?.title || "Page"}
												</Text>
												<div className="flex items-center gap-2">
													<Heading level="4">Properties</Heading>
													<div className="flex-1" />
													<div className="flex items-center gap-1">
														{HeaderActions}
													</div>
												</div>
											</div>
										)}
										<div className="flex-1 overflow-y-auto">
											{editingSectionId ? (
												<Box p="24">
													<Text
														fontSize="sm"
														fontWeight="400"
														color="fg.accent"
														className="cursor-pointer mb-1"
														onClick={() => {
															setSidebarTab("outline");
															setEditingSectionId(null);
														}}
													>
														← {activeOutline?.title || "Page"}
													</Text>
													<Heading level="4" mb="16">Section Properties</Heading>
													<Text fontSize="sm" color="fg.secondary">
														Editing properties for section: {editingSectionId}
													</Text>
													{/* Add section specific fields here later */}
												</Box>
											) : (
												<PropertiesPanel value={properties} onChange={setPropertiesPatch} />
											)}
										</div>
									</div>

									{/* PANE 3: Element Editor */}
									<div className="min-w-[33.333%] w-[33.333%] h-full">
										<div className="h-full overflow-y-auto">
											<ElementEditor
												outlineTitle={activeOutline?.title || "Outline"}
												elementType={currentEle !== "none" ? theEles[currentEle]?.type || "" : ""}
												currentEle={currentEle}
												properties={theEles[currentEle]?.properties}
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
				<div className=" pr-0 pt-0 gap-2 flex items-stretch z-10 min-h-0 flex-1" style={{ height: "100%", overflow: "hidden" }}>
					<PreviewCanvas
						outlines={outlines as any}
						theEles={theEles}
						currentEle={currentEle}
						currentHoverEle={currentHoverEle}
						setCurrentEle={setCurrentEleSmart}
						setCurrentHoverEle={setCurrentHoverEle}
						setOutlines={setOutlines as any}
						preview={preview}
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

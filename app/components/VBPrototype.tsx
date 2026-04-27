"use client"; // --- SEO Block Types (from initialData) ---

import type {SEOBlock, ContentType} from "@/app/db/initialData";

import {Box, Button, Text, Heading, Menu, MenuTrigger, MenuContent, Tooltip, Spinner, Field, Select, SelectTrigger, SelectContent} from "@optiaxiom/react";
import React, {useEffect, useRef, useState, useCallback} from "react";
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

import {EleMap} from "./vb/Ele";
import ElementEditor from "./vb/ElementEditor";
import StyleEditor from "./vb/StyleEditor";
import PreviewCanvas from "./vb/PreviewCanvas";
import PropertyBasedPreview from "./vb/PropertyBasedPreview";
import RightToolbar, {RightToolbarTool} from "./RightToolbar";
import CMSToolbar from "./CMSToolbar";
import {PreviewSettings} from "./vb/PreviewSettings";
import VersionHistory from "./vb/versionHistory/VersionHistory";
import {useBrandTone} from "./ai/BrandToneProvider";
import {usePreflightContext} from "./ai/PreflightContext";

import {getExtensionById} from "@/app/extensions/registry";

import styles from "./VBPrototype.module.css";
import PropertiesPanel, {
	PageProperties,
	PropertySection,
} from "./vb/PropertiesPanel";
import OutlineTree from "./vb/OutlineTree";
import ExtensionPanel from "./ExtensionPanel";
import ConnectionStatus from "./ConnectionStatus";
// @ts-ignore
import usePersistentState from "@/app/usePersistentState";
import AbstractDialog from "@/app/components/AbstractDialog";
import {Input} from "@/app/components/Input";
import type {useVersionHistory} from "@/app/hooks/useVersionHistory";
import DragHandle from "@/app/components/DragHandle";
import {getCompatibleInstances} from "@/app/lib/contentConnection";
import {initialContentTypes} from "@/app/db/initialData";

/** -----------------------------
 * Types + helpers (normalize / prune)
 * ------------------------------*/

type NormalizeResult = {data: any[]; theEles: EleMap};
type SplitPayload = {data: any[]; theEles: EleMap};

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
		const {isNew, ...rest} = n;
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
	if (!Array.isArray(input)) return {data: [], theEles: {}};

	const theEles: EleMap = {};

	const strip = (node: any): any => {
		if (isEleNode(node)) {
			let properties = node.properties;
			if (!properties && Array.isArray(node.props)) {
				// Normalize legacy props array to properties map
				properties = {};
				node.props.forEach((p: any) => {
					// Use label-based mapping for legacy support
					const key = p.label.toLowerCase().includes("text")
						? "text"
						: p.label.toLowerCase().includes("heading")
							? "text"
							: p.label.toLowerCase().includes("label")
								? "label"
								: p.label.toLowerCase().includes("image")
									? "src"
									: p.label.toLowerCase().replace(/\s+/g, "");
					properties[key] = {value: p.value};
				});
			}
			theEles[node.id] = {
				type: node.type,
				properties: properties || {},
			};
			return {id: node.id};
		}

		const out: any = {...node};
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

type OutlineType = {
	id: string;
	title: string;
	tree: any[];
	elements: EleMap;
	sectionType?: string;
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
	properties?: PageProperties; // allow both
	data?: Record<string, any>;
	variationId?: string;
	contentTypeId?: string;
	id?: string;
	cmpConnection?: {
		instanceId: string;
		modelId: string;
		mappingId?: string;
		syncStatus: "synced" | "out-of-sync" | "manual-override";
		lastSyncedAt?: string;
		syncMode: "auto" | "manual";
	};
};

/** -----------------------------
 * Existing mergeData (kept)
 * ------------------------------*/

const mergeData = (structure: any[], elements: EleMap) => {
	return structure.map((node) => {
		const newNode = {...node};
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
	contentType,
	onSave,
	onPublish,
	pageName,
	pageId,
	pageStatus,
	variations,
	onAddVariation,
	onDeleteVariation,
	onRenameVariation,
	onTrash,
	onRenamePage,
	onViewOnWebsite,
	versionHistory,
	onRestoreVersion,
	isOpalGenerating,
	hasPendingGeneration,
	onConnectContent,
	onSyncContent,
	onDisconnectContent,
	hasConnection,
	boundPropertyIds,
	onAddToTask,
	onRemoveFromTask,
	currentTaskId,
}: {
	initialData?: PageInput;
	contentType?: ContentType | null;
	onSave?: (page: PageInput) => void;
	onPublish?: () => void;
	onTrash?: () => void;
	pageName?: string;
	pageId?: string;
	pageStatus?: string;
	onViewOnWebsite?: () => void;
	variations?: {
		id: string;
		name: string;
		status: string;
		outlines?: any[];
		data?: Record<string, any>;
	}[];
	onAddVariation?: (
		payload: string | {name: string; outlines?: any[]; data?: Record<string, any>}
	) => string | void;
	onDeleteVariation?: (id: string) => void;
	onRenameVariation?: (id: string, newName: string) => void;
	onRenamePage?: (newName: string) => void;
	versionHistory?: ReturnType<typeof useVersionHistory>;
	onRestoreVersion?: (version: any) => void;
	isOpalGenerating?: boolean;
	hasPendingGeneration?: boolean;
	onConnectContent?: () => void;
	onSyncContent?: () => void;
	onDisconnectContent?: () => void;
	hasConnection?: boolean;
	boundPropertyIds?: Set<string>;
	onAddToTask?: (taskId: string, taskName: string) => void;
	onRemoveFromTask?: () => void;
	currentTaskId?: string | null;
}) {
	// ✅ Fix TS mismatch: keep this consistently string|null everywhere
	const [dragging, setDragging] = useState<string | null>(null);
	const [cloning, setCloning] = useState<boolean>(false);
	const [selectedVariation, setSelectedVariation] = useState("original");
	const [isVariationDialogOpen, setIsVariationDialogOpen] = useState(false);
	const [isDeleteVariationDialogOpen, setIsDeleteVariationDialogOpen] = useState(false);
	const [isRenameVariationDialogOpen, setIsRenameVariationDialogOpen] = useState(false);
	const [isTrashDialogOpen, setIsTrashDialogOpen] = useState(false);
	const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
	const [newVariationName, setNewVariationName] = useState("");
	const [renameVariationName, setRenameVariationName] = useState("");

	const [isRenamePageDialogOpen, setIsRenamePageDialogOpen] = useState(false);
	const [newPageName, setNewPageName] = useState("");

	// Load persistent state for CMP connection
	const [cmpContentInstances] = usePersistentState("cmpContentInstances", []);
	const [persistentContentTypes] = usePersistentState("contentTypes", initialContentTypes);

	// Brand Tone integration - provide setCurrentEle to BrandToneProvider
	const brandTone = useBrandTone();

	// Preflight Audit integration - provide scroll function to PreflightContext
	const {registerScrollFunction: registerPreflightScroll} = usePreflightContext();

	const handleCreateVariation = () => {
		if (newVariationName && onAddVariation) {
			onAddVariation(newVariationName);
			setIsVariationDialogOpen(false);
			setNewVariationName("");
		}
	};

	const handleDeleteVariation = () => {
		if (onDeleteVariation && selectedVariation !== "original") {
			onDeleteVariation(selectedVariation);
			setSelectedVariation("original");
			setIsDeleteVariationDialogOpen(false);
		}
	};

	const handleRenameVariation = () => {
		if (onRenameVariation && renameVariationName && selectedVariation !== "original") {
			onRenameVariation(selectedVariation, renameVariationName);
			setIsRenameVariationDialogOpen(false);
		}
	};

	const openRenameDialog = () => {
		if (!variations) return;
		const v = variations.find((varItem) => varItem.id === selectedVariation);
		if (v) {
			setRenameVariationName(v.name);
			setIsRenameVariationDialogOpen(true);
		}
	};

	// Update outlines when variation changes
	// We use refs to access the latest data without triggering re-renders on every save/edit loop
	const latestData = useRef({initialData, variations});
	useEffect(() => {
		latestData.current = {initialData, variations};
	}, [initialData, variations]);

	useEffect(() => {
		const {variations, initialData} = latestData.current;

		const target = variations?.find((v) => v.id === selectedVariation);
		if (target) {
			// Restore properties
			if (target.data) {
				setProperties({...defaultProps, ...target.data});
			}

			const raw = target.outlines ?? [];
			// Allow empty array for new variations
			if (isOutlineArray(raw) || Array.isArray(raw)) {
				_setOutlines(
					(raw ?? []).map((o: any) => ({
						...o,
						tree: ensureOpen(stripTransientFlags(o.tree ?? [])),
						elements: o.elements ?? {},
					}))
				);
			}
		} else if (selectedVariation === "original") {
			// Restore properties
			const originalProps = initialData?.properties ?? initialData?.data ?? {};
			setProperties({...defaultProps, ...originalProps});

			// Fallback for when "Original" is not explicitly in variations array (backward compat)
			const raw = initialData?.outlines;
			if (isOutlineArray(raw)) {
				_setOutlines(
					(raw ?? []).map((o) => ({
						...o,
						tree: ensureOpen(stripTransientFlags(o.tree ?? [])),
						elements: o.elements ?? {},
					}))
				);
			}
		}
	}, [selectedVariation]);

	const variationOptions = React.useMemo(() => {
		if (!variations) return [{label: "Original", value: "original"}];
		// If variations includes "original", just map them all. Check by ID.
		const hasOriginal = variations.some((v) => v.id === "original");
		const mapped = variations.map((v) => ({label: v.name, value: v.id}));

		if (hasOriginal) return mapped;
		return [{label: "Original", value: "original"}, ...mapped];
	}, [variations]);

	// Get compatible instances count for toolbar
	const compatibleInstancesCount = React.useMemo(() => {
		if (!initialData?.contentTypeId || !onConnectContent) return 0;

		return getCompatibleInstances(
			{contentTypeId: initialData.contentTypeId} as any,
			cmpContentInstances,
			persistentContentTypes,
			[]
		).length;
	}, [initialData?.contentTypeId, onConnectContent, cmpContentInstances, persistentContentTypes]);

	const [preview, setPreview] = useState<PreviewSettings>({
		mode: "responsive",
		width: 1100,
		maxWidth: 1100,
	});

	const onPreviewChange = (patch: Partial<PreviewSettings>) => {
		setPreview((p) => ({...p, ...patch}));
	};

	const defaultProps: PageProperties = {};

	const [properties, setProperties] = useState<PageProperties>(() => {
		return {
			...defaultProps,
			...(initialData?.properties ?? initialData?.data ?? {}),
		};
	});

	const [activePropertiesSection, setActivePropertiesSection] = useState<PropertySection>("menu");
	const generateTriggerRef = useRef<(() => void) | null>(null);
	const [generateLoading, setGenerateLoading] = useState(false);

	// --- SEO Block Extraction ---
	const getSEO = (seo: SEOBlock | undefined, locale: string, variant: string) => {
		if (!seo) return {};
		return seo[locale]?.[variant] || seo[locale]?.original || {};
	};

	const currentLocale = "en"; // TODO: wire to actual locale
	const currentVariant = selectedVariation || "original";

	const seoBlock: SEOBlock | undefined = (() => {
		if (selectedVariation === "original") {
			return (initialData?.data as any)?.seo;
		}
		const v = variations?.find((v) => v.id === selectedVariation);
		return v?.data?.seo;
	})();

	const seo = getSEO(seoBlock, currentLocale, currentVariant);

	// Example usage: Render meta tags using the dynamic SEO block
	// <title>{seo.title}</title>
	// <meta name="description" content={seo.description} />
	// {seo.meta && Object.entries(seo.meta).map(([k, v]) => (
	//   <meta name={k} content={v} key={k} />
	// ))}

	const [outlines, _setOutlines] = useState<OutlineType[]>(() => {
		// Try to find "original" variation first
		const originalVar = variations?.find((v) => v.id === "original");
		let raw = originalVar?.outlines || initialData?.outlines;

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
		return [{id: "outline-main", title: "Main", tree: norm.data, elements: norm.theEles}];
	});

	const hasChanged = useRef(false);

	const setOutlines = (arg: React.SetStateAction<OutlineType[]>) => {
		hasChanged.current = true;
		_setOutlines(arg);
	};

	const setPropertiesPatch = (patch: Partial<PageProperties>) => {
		hasChanged.current = true;
		setProperties((p) => ({...p, ...patch}));
	};

	const isFirstRender = useRef(true);
	const onSaveRef = useRef(onSave);

	useEffect(() => {
		onSaveRef.current = onSave;
	}, [onSave]);

	// Track previous outline count to avoid resetting view on content changes
	const prevOutlineCount = useRef(outlines.length);

	// active outline
	const [activeOutlineId, setActiveOutlineId] = useState<string | null>(() => {
		return outlines.length ? outlines[0].id : null;
	});

	const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
	const [currentEle, setCurrentEle] = useState<string>("none");
	const [currentHoverEle, setCurrentHoverEle] = useState<string>("none");
	const [styleEditorEle, setStyleEditorEle] = useState<string | null>(null);
	const [styleEditorSource, setStyleEditorSource] = useState<"outline" | "elementEditor" | null>(null);
	const [scrollToSectionId, setScrollToSectionId] = useState<string | null>(null);
	const [currentSection, setCurrentSection] = useState<string | null>(null);
	const [currentHoverSection, setCurrentHoverSection] = useState<string | null>(null);
	const [scrollToOutlineSectionId, setScrollToOutlineSectionId] = useState<string | null>(null);
	const [currentRow, setCurrentRow] = useState<string | null>(null);
	const [currentHoverRow, setCurrentHoverRow] = useState<string | null>(null);
	const [currentColumn, setCurrentColumn] = useState<string | null>(null);
	const [currentHoverColumn, setCurrentHoverColumn] = useState<string | null>(null);
	const [scrollToRowId, setScrollToRowId] = useState<string | null>(null);
	const [scrollToColumnId, setScrollToColumnId] = useState<string | null>(null);
	const [scrollToPreviewSectionId, setScrollToPreviewSectionId] = useState<string | null>(null);

	// Wrapper to trigger scroll when section is added
	const handleSectionAdded = useCallback((sectionId: string) => {
		setScrollToSectionId(sectionId);
	}, []);

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
		const currentCount = outlines.length;
		const countChanged = currentCount !== prevOutlineCount.current;

		// Keep active outline valid
		if (currentCount === 0) {
			setActiveOutlineId(null);
			setCurrentEle("none");
			setCurrentHoverEle("none");
			setSidebarTab("properties");
			setOutlineView("list");
			prevOutlineCount.current = currentCount;
			return;
		}
		if (!activeOutlineId || !outlines.some((o) => o.id === activeOutlineId)) {
			setActiveOutlineId(outlines[0].id);
		}

		// Only enforce tabs/view when outline COUNT changes, not when content changes
		if (countChanged) {
			if (currentCount === 1) {
				if (sidebarTab === "outlines") setSidebarTab("outline");
				setOutlineView("tree");
			} else {
				// multi
				if (sidebarTab === "outline") setSidebarTab("outlines");
			}
			prevOutlineCount.current = currentCount;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [outlines]);

	const isZero = outlines.length === 0; // View 4
	const isSingle = outlines.length === 1; // View 3
	const isMulti = outlines.length > 1; // View 1/2
	const isEditingElement = currentEle !== "none" || styleEditorEle !== null;

	const activeOutline = activeOutlineId
		? (outlines.find((o) => o.id === activeOutlineId) ?? null)
		: null;

	const data = activeOutline?.tree ?? [];
	const theEles = activeOutline?.elements ?? {};

	const setData = (arg: React.SetStateAction<any[]>) => {
		hasChanged.current = true;
		setOutlines((prev) =>
			prev.map((o) =>
				o.id === activeOutlineId
					? {...o, tree: typeof arg === "function" ? (arg as any)(o.tree) : arg}
					: o
			)
		);
	};

	const setTheEles = (arg: React.SetStateAction<EleMap>) => {
		hasChanged.current = true;
		setOutlines((prev) =>
			prev.map((o) =>
				o.id === activeOutlineId
					? {...o, elements: typeof arg === "function" ? (arg as any)(o.elements) : arg}
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

	const findOutlineIdForSection = (sectionId: string) => {
		for (const o of outlines) {
			const sections = o.tree ?? [];
			if (sections.some((s: any) => s.id === sectionId)) {
				return o.id;
			}
		}
		return null;
	};

	const setCurrentEleSmart = useCallback((value: React.SetStateAction<string>) => {
		const eleId = typeof value === "function" ? value(currentEle) : value;

		setCurrentEle(eleId);

		if (!eleId || eleId === "none") return;

		// ✅ Always drill down from View 1 -> View 2 when multi-outline
		// (even if the element belongs to the currently active outline)
		if (isMulti) {
			setSidebarTab("outlines"); // keep your View 2 layout expectations
			setOutlineView("tree");
		}

		const owner = findOutlineIdForElement(eleId);
		if (owner && owner !== activeOutlineId) {
			setActiveOutlineId(owner);
		}
	}, [currentEle, isMulti, activeOutlineId, findOutlineIdForElement]);

	// Wire up Brand Tone provider with scroll-to functionality
	useEffect(() => {
		brandTone.registerScrollFunction(setCurrentEleSmart);
	}, [brandTone, setCurrentEleSmart]);

	// Wire up Preflight Audit context with scroll-to functionality
	useEffect(() => {
		registerPreflightScroll(setCurrentEleSmart);
	}, [registerPreflightScroll, setCurrentEleSmart]);

	const addSectionToEndOfActiveOutline = () => {
		const t = Date.now();
		const newSectionId = "section-" + t;

		setData((prev) => {
			const mkSection = () => ({
				id: newSectionId,
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

		// Trigger scroll to new section
		handleSectionAdded(newSectionId);
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
	const [activeRightTool, setActiveRightTool] = usePersistentState("active-right-tool", null);

	const onInputChange = useCallback((value: any, keyOrIndex: string | number) => {
		if (currentEle === "none") return;

		setTheEles((prev) => {
			// Check if currentEle exists in the previous state
			if (!prev[currentEle]) return prev;

			const ele = prev[currentEle];
			const properties = {...(ele.properties || {})};

			if (typeof keyOrIndex === "string") {
				properties[keyOrIndex] = {...properties[keyOrIndex], value};
			}

			return {
				...prev,
				[currentEle]: {
					...ele,
					properties,
				},
			};
		});
	}, [currentEle, setTheEles]);

	// Style editor handlers
	const onOpenStyleEditorFromOutline = useCallback((elementId: string) => {
		setStyleEditorEle(elementId);
		setStyleEditorSource("outline");
		setCurrentEle(elementId);
		setCurrentHoverEle("none");
	}, []);

	const onOpenStyleEditorFromElementEditor = useCallback(() => {
		if (currentEle === "none") return;
		setStyleEditorEle(currentEle);
		setStyleEditorSource("elementEditor");
	}, [currentEle]);

	const onStyleChange = useCallback((templateId: string) => {
		if (!styleEditorEle) return;

		setTheEles((prev) => {
			if (!prev[styleEditorEle]) return prev;

			const ele = prev[styleEditorEle];
			const properties = {...(ele.properties || {})};

			properties.template = {value: templateId};

			return {
				...prev,
				[styleEditorEle]: {
					...ele,
					properties,
				},
			};
		});
	}, [styleEditorEle, setTheEles]);

	// Update element by ID (for Brand Tone suggestions)
	const onUpdateElementById = useCallback((elementId: string, propertyKey: string, value: string) => {
		console.log("[VBPrototype] Updating element:", elementId, propertyKey, value);

		setTheEles((prev) => {
			if (!prev[elementId]) {
				console.warn("[VBPrototype] Element not found:", elementId);
				return prev;
			}

			const ele = prev[elementId];
			const properties = {...(ele.properties || {})};

			properties[propertyKey] = {...properties[propertyKey], value};

			return {
				...prev,
				[elementId]: {
					...ele,
					properties,
				},
			};
		});
	}, [setTheEles]);

	// Header actions (Generate only in Categories & Tags + plus-menu)
	const showGenerateInHeader =
		sidebarTab === "properties" && activePropertiesSection === "categories-tags";
	const HeaderActions = (
		<Box display="flex" alignItems="center" gap="2" className="relative">
			{showGenerateInHeader && (
				<Tooltip content="Generate tag and category suggestions using Opal">
					<Button
						onClick={() => generateTriggerRef.current?.()}
						appearance="default-opal"
						size="sm"
						rounded="sm"
						px="8"
						className="opalGenerateButton"
						aria-label="Generate tags and categories"
						icon={<IconSparkles size={16} />}
						disabled={generateLoading}
						loading={generateLoading}
					/>
				</Tooltip>
			)}

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
						...(onConnectContent ? [{
							addon: <IconPlus size={16} />,
							label: hasConnection ? "Change connected content..." : "Connect content...",
							execute: onConnectContent,
						}] : []),
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
			variationId: selectedVariation,
		});

		setLastSaved(new Date());
		hasChanged.current = false;
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

	const isSectionLast = (id: string) =>
		id === "sec-last" ||
		id.startsWith("sec-last") ||
		id === "section-last" ||
		id.startsWith("section-last");
	const isRowLast = (id: string) => id.startsWith("row-last-");
	const isColLast = (id: string) => id.startsWith("col-last-");
	const isLastEle = (id: string) => id.startsWith("last-ele-");

	const mkId = (base: string) => `${base}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

	function cloneSectionWithRemap(
		section: any,
		theEles: EleMap
	): {cloned: any; elesPatch: EleMap} {
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
								if (theEles[oldEleId]) elesPatch[newEleId] = {...theEles[oldEleId]};
								return {id: newEleId};
							}),
						};
					}),
				};
			}),
		};

		return {cloned, elesPatch};
	}

	function cloneRowWithRemap(row: any, theEles: EleMap): {cloned: any; elesPatch: EleMap} {
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
						if (theEles[oldEleId]) elesPatch[newEleId] = {...theEles[oldEleId]};
						return {id: newEleId};
					}),
				};
			}),
		};

		return {cloned, elesPatch};
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
			return {nextData: next, elesPatch};
		}

		const hoverIdx = next.findIndex((s) => s.id === hoverId);
		if (hoverIdx === -1) return null;

		next.splice(hoverIdx, 0, dragged);
		return {nextData: next, elesPatch};
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

			return {...sec, children};
		});

		return {nextData: next, elesPatch};
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

				return {...row, children: cols};
			});

			return {...sec, children: rows};
		});

		return {nextData: next};
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
			cloning && theEles[draggingId] ? {[newEleId]: {...theEles[draggingId]}} : undefined;

		let draggedRef: any = null;

		const removed = data.map((sec: any) => ({
			...sec,
			children: (sec.children || []).map((row: any) => ({
				...row,
				children: (row.children || []).map((col: any) => {
					const colChildren = col.elements || col.children || [];
					const nextChildren = colChildren.filter((ref: any) => {
						if (ref?.id === draggingId) {
							draggedRef = cloning ? {id: newEleId} : ref;
							return cloning;
						}
						return true;
					});
					return {...col, elements: nextChildren};
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
						return {...col, elements: [...colChildren, draggedRef]};
					}),
				})),
			}));

			return {nextData: next, elesPatch};
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
					return {...col, elements: copy};
				}),
			})),
		}));

		return {nextData: next, elesPatch};
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
					setTheEles((prev) => ({...prev, ...res.elesPatch!}));
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
			<div className="select-none" style={{height: "100%"}}>
				<Box
					bg="bg.page"
					w="full"
					className="grid grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)]"
					style={{height: "100%", overflow: "hidden"}}
				>
					<CMSToolbar
						pageName={pageName || "New Page"}
						pageId={pageId}
						lastSaved={lastSaved}
						pageStatus={pageStatus}
						onPublish={onPublish}
						onViewOnWebsite={onViewOnWebsite}
						onShowVersionHistory={() => setIsVersionHistoryOpen(true)}
						contentTypeIcon={<IconFile size={16} />}
						preview={preview}
						onPreviewChange={onPreviewChange}
						variationOptions={variationOptions}
						selectedVariation={selectedVariation}
						onVariationChange={setSelectedVariation}
						onAddVariation={() => setIsVariationDialogOpen(true)}
						onRenamePage={() => {
							setNewPageName(pageName || "");
							setIsRenamePageDialogOpen(true);
						}}
						pageElements={{}}
						onUpdateElement={onUpdateElementById}
						onConnectContent={onConnectContent}
						onSyncContent={onSyncContent}
						onDisconnectContent={onDisconnectContent}
						hasConnection={hasConnection}
						compatibleInstancesCount={compatibleInstancesCount}
						onAddToTask={onAddToTask}
						onRemoveFromTask={onRemoveFromTask}
						currentTaskId={currentTaskId}
					/>

					{/* LEFT SIDEBAR (Properties only) */}
					<Box
						pt="4"
						w="auto"
						className="vb-outline"
						bg="bg.page"
						style={{width: 324, minWidth: 180, maxWidth: 600, position: "relative", height: "100%"}}
					>
						<DragHandle position="right" minWidth={180} maxWidth={600} />

						<div className="h-full flex flex-col" style={{overflow: "hidden"}}>
							<div className="pl-6 pt-4 pb-2">
								<Heading level="4">Properties</Heading>
							</div>

							<div className="flex-1 overflow-y-auto">
								<PropertiesPanel
									value={properties}
									onChange={setPropertiesPatch}
									pageName={pageName ?? undefined}
									pageId={initialData?.id}
									contentTypeId={contentType?.id}
									boundPropertyIds={boundPropertyIds}
									onRegisterGenerateTrigger={(fn) => {
										generateTriggerRef.current = fn;
									}}
									onGenerateLoadingChange={setGenerateLoading}
								/>
							</div>
						</div>
					</Box>

					{/* RIGHT / CANVAS (still visible even with 0 outlines) */}
					<div
						className="p-6 pr-0 pt-0 gap-2 flex items-stretch z-10 min-h-0 flex-1"
						style={{height: "100%", overflow: "hidden"}}
					>
						{/* Check if this is a property-based page (has data but no outlines) */}
						{outlines.length === 0 && contentType?.id && Object.keys(properties).length > 0 ? (
							<PropertyBasedPreview
								contentTypeId={contentType.id}
								properties={properties}
								preview={preview}
							/>
						) : (
							<PreviewCanvas
								outlines={outlines as any}
								theEles={{}} // no active outline
								currentEle={currentEle}
								currentHoverEle={currentHoverEle}
								setCurrentEle={setCurrentEleSmart}
								setCurrentHoverEle={setCurrentHoverEle}
								setOutlines={setOutlines as any}
								preview={preview}
								scrollToSectionId={scrollToSectionId}
								onScrollComplete={() => setScrollToSectionId(null)}
								currentSection={currentSection}
								currentHoverSection={currentHoverSection}
								setCurrentSection={setCurrentSection}
								setCurrentHoverSection={setCurrentHoverSection}
								onSectionClick={(sectionId) => {
									// Find which outline this section belongs to
									const ownerOutlineId = findOutlineIdForSection(sectionId);

									// Clear element and section selection
									setCurrentEle("none");
									setCurrentHoverEle("none");
									setEditingSectionId(null);
									setStyleEditorEle(null);

									// Switch to the outline if needed
									if (ownerOutlineId && ownerOutlineId !== activeOutlineId) {
										setActiveOutlineId(ownerOutlineId);
									}

									// If multi-outline, switch to tree view
									if (isMulti) {
										setSidebarTab("outlines");
										setOutlineView("tree");
									} else {
										// Single outline mode - switch to outline view
										setSidebarTab("outline");
									}

									// Trigger scroll after transition completes
									setTimeout(() => setScrollToOutlineSectionId(sectionId), 350);
								}}
								currentRow={currentRow}
								currentHoverRow={currentHoverRow}
								setCurrentRow={setCurrentRow}
								setCurrentHoverRow={setCurrentHoverRow}
								currentColumn={currentColumn}
								currentHoverColumn={currentHoverColumn}
								setCurrentColumn={setCurrentColumn}
								setCurrentHoverColumn={setCurrentHoverColumn}
								scrollToRowId={scrollToRowId}
								scrollToColumnId={scrollToColumnId}
								onRowScrollComplete={() => setScrollToRowId(null)}
								onColumnScrollComplete={() => setScrollToColumnId(null)}
							/>
						)}
						<Box borderL="1" borderColor="border.tertiary">
							<RightToolbar
								activeTool={activeRightTool}
								onToggleTool={(tool) =>
									setActiveRightTool(activeRightTool === tool ? null : tool)
								}
							/>
						</Box>
					</div>
				</Box>
				<AbstractDialog
					title="Create Variation"
					description="Enter a name for the new variation."
					open={isVariationDialogOpen}
					setOpen={setIsVariationDialogOpen}
					footerPrimaryText="Create"
					footerPrimaryAction={handleCreateVariation}
					size="sm"
				>
					<Box pt="4">
						<Input
							autoFocus
							placeholder="Variation Name"
							value={newVariationName}
							onChange={(e: any) => setNewVariationName(e.target.value)}
							onKeyDown={(e: any) => {
								if (e.key === "Enter") handleCreateVariation();
							}}
						/>
					</Box>
				</AbstractDialog>
			</div>
		);
	}

	/** -----------------------------
	 * Main layout
	 * ------------------------------*/
	return (
		<div className="select-none" style={{height: "100%"}}>
			<Box
				w="full"
				className="grid grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)]"
				style={{height: "100%", overflow: "hidden"}}
			>
				<CMSToolbar
					pageName={pageName || "New Page"}
					pageId={pageId}
					lastSaved={lastSaved}
					pageStatus={pageStatus}
					onPublish={onPublish}
					onViewOnWebsite={onViewOnWebsite}
					onShowVersionHistory={() => setIsVersionHistoryOpen(true)}
					contentTypeIcon={<IconFile size={16} />}
					preview={preview}
					onPreviewChange={onPreviewChange}
					variationOptions={variationOptions}
					selectedVariation={selectedVariation}
					onVariationChange={setSelectedVariation}
					onAddVariation={() => setIsVariationDialogOpen(true)}
					onDeleteVariationRequest={() => setIsDeleteVariationDialogOpen(true)}
					onRenameVariation={() => openRenameDialog()}
					onTrash={() => setIsTrashDialogOpen(true)}
					onRenamePage={() => {
						setNewPageName(pageName || "");
						setIsRenamePageDialogOpen(true);
					}}
					pageElements={theEles}
					onUpdateElement={onUpdateElementById}
					onConnectContent={onConnectContent}
					onSyncContent={onSyncContent}
					onDisconnectContent={onDisconnectContent}
					hasConnection={hasConnection}
					compatibleInstancesCount={compatibleInstancesCount}
					onAddToTask={onAddToTask}
					onRemoveFromTask={onRemoveFromTask}
					currentTaskId={currentTaskId}
				/>

				{/* LEFT SIDEBAR */}
				<Box
					pt="4"
					pr="0"
					w="auto"
					className="vb-outline"
					bg="bg.page"
					style={{width: 324, minWidth: 180, maxWidth: 600, position: "relative"}}
				>
					<DragHandle position="right" minWidth={180} maxWidth={600} />

					<div className="h-full flex flex-col">
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
														}}
													>
														← Page
													</Text>

													<div className="flex items-center gap-2">
														<Heading level="4">
															{activeOutline.title}
														</Heading>
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
													onOpenStyleEditor={onOpenStyleEditorFromOutline}
													onSectionAdded={handleSectionAdded}
													scrollToSectionId={scrollToOutlineSectionId}
													onScrollComplete={() => setScrollToOutlineSectionId(null)}
													currentSection={currentSection}
													setCurrentHoverSection={setCurrentHoverSection}
													currentRow={currentRow}
													setCurrentHoverRow={setCurrentHoverRow}
													currentColumn={currentColumn}
													setCurrentHoverColumn={setCurrentHoverColumn}
													onScrollToSection={(sectionId, outlineId) => {
														if (outlineId !== activeOutlineId) {
															setActiveOutlineId(outlineId);
														}
														setScrollToSectionId(sectionId);
													}}
													onScrollToRow={setScrollToRowId}
													onScrollToColumn={setScrollToColumnId}
													outlineId={activeOutline?.id}
												/>
											) : null}
										</div>
									</div>

									{/* PANE 3: Properties */}
									<div className="min-w-[25%] w-[25%] h-full flex flex-col">
										{!editingSectionId && (
											<div className="pl-6 pr-6 pt-4 pb-2">
												<div
													className="relative mb-1"
													style={{height: "20px"}}
												>
													<Text
														fontSize="sm"
														fontWeight="400"
														color="fg.accent"
														className="cursor-pointer absolute top-0 left-0"
														onClick={() => {
															setActivePropertiesSection("menu");
														}}
														style={{
															visibility:
																activePropertiesSection === "menu"
																	? "hidden"
																	: "visible",
															pointerEvents:
																activePropertiesSection === "menu"
																	? "none"
																	: "auto",
														}}
													>
														← Properties
													</Text>
													<Text
														fontSize="sm"
														fontWeight="400"
														color="fg.accent"
														className="cursor-pointer absolute top-0 left-0"
														onClick={() => {
															setSidebarTab("outlines");
															setOutlineView("list");
															setEditingSectionId(null);
														}}
														style={{
															visibility:
																activePropertiesSection !== "menu"
																	? "hidden"
																	: "visible",
															pointerEvents:
																activePropertiesSection !== "menu"
																	? "none"
																	: "auto",
														}}
													>
														← Main
													</Text>
												</div>
												<div className="flex items-center gap-2">
													<Heading level="4">
														Properties
													</Heading>
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
													<Heading level="4" mb="16">
														Section Properties
													</Heading>
													{(() => {
														const currentSectionType = activeOutline?.sectionType || "content";
														const sectionTypeOptions = [
															{ label: "Hero", value: "hero" },
															{ label: "Features", value: "features" },
															{ label: "Benefits", value: "benefits" },
															{ label: "Testimonials", value: "testimonials" },
															{ label: "Pricing", value: "pricing" },
															{ label: "Call to Action", value: "cta" },
															{ label: "FAQ", value: "faq" },
															{ label: "Content", value: "content" },
														];

														return (
															<Box>
																<Field label="Section Type">
																	<Select
																		value={currentSectionType}
																		options={sectionTypeOptions}
																		onValueChange={(value: string) => {
																			// Update section type in active outline
																			setOutlines((prev) =>
																				prev.map((outline) =>
																					outline.id === activeOutlineId
																						? {...outline, sectionType: value}
																						: outline
																				)
																			);
																		}}
																	>
																		<SelectTrigger />
																		<SelectContent />
																	</Select>
																</Field>
																<Text fontSize="sm" color="fg.secondary" mt="8">
																	Section ID: {editingSectionId}
																</Text>
															</Box>
														);
													})()}
												</Box>
											) : (
												<PropertiesPanel
													value={properties}
													onChange={setPropertiesPatch}
													activeSection={activePropertiesSection}
													onSectionChange={setActivePropertiesSection}
													pageName={pageName ?? undefined}
													pageId={initialData?.id}
													contentTypeId={contentType?.id}
													boundPropertyIds={boundPropertyIds}
													onRegisterGenerateTrigger={(fn) => {
														generateTriggerRef.current = fn;
													}}
													onGenerateLoadingChange={setGenerateLoading}
												/>
											)}
										</div>
									</div>

									{/* PANE 4: Element Editor or Style Editor */}
									<div className="min-w-[25%] w-[25%] h-full">
										<div className="h-full overflow-y-auto">
											{styleEditorEle && theEles[styleEditorEle] ? (
												<StyleEditor
													outlineTitle={
														styleEditorSource === "elementEditor"
															? (theEles[styleEditorEle]?.type || "Element")
															: (activeOutline?.title || "Outline")
													}
													elementType={theEles[styleEditorEle]?.type || ""}
													currentEle={styleEditorEle}
													properties={theEles[styleEditorEle]?.properties}
													onBack={() => {
														setStyleEditorEle(null);
														setStyleEditorSource(null);
														// Only clear currentEle if coming from outline
														if (styleEditorSource === "outline") {
															setCurrentEle("none");
															setCurrentHoverEle("none");
														}
													}}
													onStyleChange={onStyleChange}
												/>
											) : (
												<ElementEditor
													outlineTitle={activeOutline?.title || "Outline"}
													elementType={
														currentEle !== "none"
															? theEles[currentEle]?.type || ""
															: ""
													}
													currentEle={currentEle}
													properties={theEles[currentEle]?.properties}
													onBack={() => {
														setCurrentEle("none");
														setCurrentHoverEle("none");
													}}
													onInputChange={onInputChange}
													onOpenStyleEditor={
														currentEle !== "none"
															? onOpenStyleEditorFromElementEditor
															: undefined
													}
												/>
											)}
										</div>
									</div>
								</div>
							</div>
						) : null}

						{/* SINGLE: tree/properties/ElementEditor drill-down slide */}
						{isSingle && activeOutline ? (
							<div className="h-full">
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
									<div className="min-w-[33.333%] w-[33.333%] h-full flex flex-col">
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
												onOpenStyleEditor={onOpenStyleEditorFromOutline}
												onSectionAdded={handleSectionAdded}
												scrollToSectionId={scrollToOutlineSectionId}
												onScrollComplete={() => setScrollToOutlineSectionId(null)}
												currentSection={currentSection}
												setCurrentHoverSection={setCurrentHoverSection}
												currentRow={currentRow}
												setCurrentHoverRow={setCurrentHoverRow}
												currentColumn={currentColumn}
												setCurrentHoverColumn={setCurrentHoverColumn}
												onScrollToSection={(sectionId, outlineId) => {
													if (outlineId !== activeOutlineId) {
														setActiveOutlineId(outlineId);
													}
													setScrollToSectionId(sectionId);
												}}
												onScrollToRow={setScrollToRowId}
												onScrollToColumn={setScrollToColumnId}
												outlineId={activeOutline?.id}
											/>
										</div>
									</div>

									{/* PANE 2: Properties (Page or Section) */}
									<div className="min-w-[33.333%] w-[33.333%] h-full flex flex-col">
										{!editingSectionId && (
											<div className="pl-6 pr-6 pt-4 pb-2">
												<div
													className="relative mb-1"
													style={{height: "20px"}}
												>
													<Text
														fontSize="sm"
														fontWeight="400"
														color="fg.accent"
														className="cursor-pointer absolute top-0 left-0"
														onClick={() => {
															setActivePropertiesSection("menu");
														}}
														style={{
															visibility:
																activePropertiesSection === "menu"
																	? "hidden"
																	: "visible",
															pointerEvents:
																activePropertiesSection === "menu"
																	? "none"
																	: "auto",
														}}
													>
														← Properties
													</Text>
													<Text
														fontSize="sm"
														fontWeight="400"
														color="fg.accent"
														className="cursor-pointer absolute top-0 left-0"
														onClick={() => {
															setSidebarTab("outline");
															setEditingSectionId(null);
														}}
														style={{
															visibility:
																activePropertiesSection !== "menu"
																	? "hidden"
																	: "visible",
															pointerEvents:
																activePropertiesSection !== "menu"
																	? "none"
																	: "auto",
														}}
													>
														← Main
													</Text>
												</div>
												<div className="flex items-center gap-2">
													<Heading level="4">
														Properties
													</Heading>
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
															setSidebarTab("outline");
															setEditingSectionId(null);
														}}
													>
														← {activeOutline?.title || "Page"}
													</Text>
													<Heading level="4" mb="16">
														Section Properties
													</Heading>
													<Text fontSize="sm" color="fg.secondary">
														Editing properties for section:{" "}
														{editingSectionId}
													</Text>
													{/* Add section specific fields here later */}
												</Box>
											) : (
												<>
													{hasConnection && initialData?.cmpConnection && (
														<ConnectionStatus
															instanceId={initialData.cmpConnection.instanceId}
															syncStatus={initialData.cmpConnection.syncStatus}
															lastSyncedAt={initialData.cmpConnection.lastSyncedAt}
															onSync={onSyncContent}
															onDisconnect={onDisconnectContent}
														/>
													)}
													<PropertiesPanel
														value={properties}
														onChange={setPropertiesPatch}
														activeSection={activePropertiesSection}
														onSectionChange={setActivePropertiesSection}
														pageName={pageName ?? undefined}
														pageId={initialData?.id}
														contentTypeId={contentType?.id}
														boundPropertyIds={boundPropertyIds}
														onRegisterGenerateTrigger={(fn) => {
															generateTriggerRef.current = fn;
														}}
														onGenerateLoadingChange={setGenerateLoading}
													/>
												</>
											)}
										</div>
									</div>

									{/* PANE 3: Element Editor or Style Editor */}
									<div className="min-w-[33.333%] w-[33.333%] h-full">
										<div className="h-full overflow-y-auto">
											{styleEditorEle && theEles[styleEditorEle] ? (
												<StyleEditor
													outlineTitle={
														styleEditorSource === "elementEditor"
															? (theEles[styleEditorEle]?.type || "Element")
															: (activeOutline?.title || "Outline")
													}
													elementType={theEles[styleEditorEle]?.type || ""}
													currentEle={styleEditorEle}
													properties={theEles[styleEditorEle]?.properties}
													onBack={() => {
														setStyleEditorEle(null);
														setStyleEditorSource(null);
														// Only clear currentEle if coming from outline
														if (styleEditorSource === "outline") {
															setCurrentEle("none");
															setCurrentHoverEle("none");
														}
													}}
													onStyleChange={onStyleChange}
												/>
											) : (
												<ElementEditor
													outlineTitle={activeOutline?.title || "Outline"}
													elementType={
														currentEle !== "none"
															? theEles[currentEle]?.type || ""
															: ""
													}
													currentEle={currentEle}
													properties={theEles[currentEle]?.properties}
													onBack={() => {
														setCurrentEle("none");
														setCurrentHoverEle("none");
													}}
													onInputChange={onInputChange}
													onOpenStyleEditor={
														currentEle !== "none"
															? onOpenStyleEditorFromElementEditor
															: undefined
													}
												/>
											)}
										</div>
									</div>
								</div>
							</div>
						) : null}
					</div>
				</Box>

				{/* RIGHT / CANVAS */}
				<div
					className="relative pr-0 pt-0 gap-0 flex items-stretch z-10 min-h-0 flex-1"
					style={{height: "100%"}}
				>
					<PreviewCanvas
						outlines={outlines as any}
						theEles={theEles}
						currentEle={currentEle}
						currentHoverEle={currentHoverEle}
						setCurrentEle={setCurrentEleSmart}
						setCurrentHoverEle={setCurrentHoverEle}
						setOutlines={setOutlines as any}
						preview={preview}
						scrollToSectionId={scrollToSectionId}
						onScrollComplete={() => setScrollToSectionId(null)}
						currentSection={currentSection}
						currentHoverSection={currentHoverSection}
						setCurrentSection={setCurrentSection}
						setCurrentHoverSection={setCurrentHoverSection}
						onSectionClick={(sectionId) => {
							// Find which outline this section belongs to
							const ownerOutlineId = findOutlineIdForSection(sectionId);

							// Clear element and section selection
							setCurrentEle("none");
							setCurrentHoverEle("none");
							setEditingSectionId(null);
							setStyleEditorEle(null);

							// Switch to the outline if needed
							if (ownerOutlineId && ownerOutlineId !== activeOutlineId) {
								setActiveOutlineId(ownerOutlineId);
							}

							// If multi-outline, switch to tree view
							if (isMulti) {
								setSidebarTab("outlines");
								setOutlineView("tree");
							} else {
								// Single outline mode - switch to outline view
								setSidebarTab("outline");
							}

							// Trigger scroll after transition completes
							setTimeout(() => setScrollToOutlineSectionId(sectionId), 350);
						}}
						currentRow={currentRow}
						currentHoverRow={currentHoverRow}
						setCurrentRow={setCurrentRow}
						setCurrentHoverRow={setCurrentHoverRow}
						currentColumn={currentColumn}
						currentHoverColumn={currentHoverColumn}
						setCurrentColumn={setCurrentColumn}
						setCurrentHoverColumn={setCurrentHoverColumn}
						scrollToRowId={scrollToRowId}
						scrollToColumnId={scrollToColumnId}
						onRowScrollComplete={() => setScrollToRowId(null)}
						onColumnScrollComplete={() => setScrollToColumnId(null)}
					/>

					{(() => {
						const activeExtension = activeRightTool
							? getExtensionById(activeRightTool)
							: null;
						const ActivePanel = activeExtension?.component;
						const activeManifest =
							activeExtension && "manifest" in activeExtension
								? (activeExtension as any).manifest
								: activeExtension;

						// Ensure "original" exists in variations for extensions
						const safeVariations = [...(variations || [])];
						if (!safeVariations.find((v) => v.id === "original")) {
							// fallback: construct "original" from top-level legacy outlines
							safeVariations.unshift({
								id: "original",
								name: "Original",
								status: pageStatus || "Published",
								outlines: initialData?.outlines as any[],
								data: initialData?.data || initialData?.properties,
							});
						}

						const extensionContext = {
							pageName,
							pageStatus,
							variations: safeVariations,
							selectedVariation,
							// mutation hooks
							onSelectVariation: setSelectedVariation,
							onAddVariation,
						};

						if (ActivePanel) {
							return (
								<ExtensionPanel
									title={activeManifest?.title || activeExtension?.label}
									width={activeManifest?.width}
									onClose={() => setActiveRightTool(null)}
								>
									<ActivePanel {...extensionContext} />
								</ExtensionPanel>
							);
						}
						return null;
					})()}

					<Box borderL="1" borderColor="border.tertiary">
						<RightToolbar
							activeTool={activeRightTool}
							onToggleTool={(tool) =>
								setActiveRightTool(activeRightTool === tool ? null : tool)
							}
						/>
					</Box>
				</div>
			</Box>
			<AbstractDialog
				title="Create Variation"
				description="Enter a name for the new variation."
				open={isVariationDialogOpen}
				setOpen={setIsVariationDialogOpen}
				footerPrimaryText="Create"
				footerPrimaryAction={handleCreateVariation}
				footerAppearance="primary"
				size="sm"
			>
				<Box pt="4">
					<Input
						autoFocus
						placeholder="Variation Name"
						value={newVariationName}
						onChange={(e: any) => setNewVariationName(e.target.value)}
						onKeyDown={(e: any) => {
							if (e.key === "Enter") handleCreateVariation();
						}}
					/>
				</Box>
			</AbstractDialog>

			<AbstractDialog
				isAlert
				title="Delete Variation"
				description={`Are you sure you want to delete this variation? This action cannot be undone.`}
				open={isDeleteVariationDialogOpen}
				setOpen={setIsDeleteVariationDialogOpen}
				footerPrimaryText="Delete"
				footerPrimaryAction={handleDeleteVariation}
				footerSecondaryText="Cancel"
				size="sm"
			>
				<Text>
					You are about to delete "
					{variations?.find((v) => v.id === selectedVariation)?.name}".
				</Text>
			</AbstractDialog>

			<AbstractDialog
				title="Rename Variation"
				description="Enter a new name for the variation."
				open={isRenameVariationDialogOpen}
				setOpen={setIsRenameVariationDialogOpen}
				footerPrimaryText="Rename"
				footerPrimaryAction={handleRenameVariation}
				size="sm"
			>
				<Box pt="4">
					<Input
						autoFocus
						placeholder="Variation Name"
						value={renameVariationName}
						onChange={(e: any) => setRenameVariationName(e.target.value)}
						onKeyDown={(e: any) => {
							if (e.key === "Enter") handleRenameVariation();
						}}
					/>
				</Box>
			</AbstractDialog>

			<AbstractDialog
				title="Rename Page"
				description="Enter a new name for the page."
				open={isRenamePageDialogOpen}
				setOpen={setIsRenamePageDialogOpen}
				footerPrimaryText="Rename"
				footerAppearance="primary"
				blockPrimaryAction={!newPageName.trim()}
				footerPrimaryAction={() => {
					if (newPageName.trim()) {
						onRenamePage?.(newPageName);
					}
				}}
				size="sm"
			>
				<Box pt="4">
					<Input
						autoFocus
						placeholder="Page Name"
						value={newPageName}
						onChange={(e: any) => setNewPageName(e.target.value)}
						onKeyDown={(e: any) => {
							if (e.key === "Enter") {
								if (newPageName.trim()) {
									onRenamePage?.(newPageName);
									setIsRenamePageDialogOpen(false);
								}
							}
						}}
					/>
				</Box>
			</AbstractDialog>

			<AbstractDialog
				isAlert
				title="Move Page to Trash"
				description="Are you sure you want to move this page to trash?"
				open={isTrashDialogOpen}
				setOpen={setIsTrashDialogOpen}
				footerPrimaryText="Move to Trash"
				footerPrimaryAction={() => {
					if (onTrash) onTrash();
					setIsTrashDialogOpen(false);
				}}
				footerSecondaryText="Cancel"
				size="sm"
			>
				<Text>This action will unpublish the page and move it to the trash.</Text>
			</AbstractDialog>

			{isVersionHistoryOpen && (
				<VersionHistory
					variations={variations}
					pageOutlines={outlines}
					onClose={() => setIsVersionHistoryOpen(false)}
					initialPreviewMode={preview.mode === "fixed" || preview.mode === "scale" ? "fixed" : "responsive"}
					versionHistory={versionHistory}
					pageId={pageId}
					onRestore={onRestoreVersion}
				/>
			)}

			{/* Opal Generation Overlay */}
			{(isOpalGenerating || hasPendingGeneration) && (
				<Box
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: "rgba(255, 255, 255, 0.7)",
						backdropFilter: "blur(8px)",
						zIndex: 9999,
						pointerEvents: "all",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Box
						display="flex"
						flexDirection="column"
						alignItems="center"
						gap="16"
						p="32"
						bg="bg.default"
						rounded="lg"
						shadow="lg"
						style={{border: "1px solid var(--ax-colors-border-default)"}}
					>
						<Spinner size="lg" />
						<Text fontSize="lg" fontWeight="500">
							Opal is generating your page...
						</Text>
						<Text fontSize="sm" color="fg.secondary">
							Please wait while we create your content
						</Text>
					</Box>
				</Box>
			)}
		</div>
	);
}

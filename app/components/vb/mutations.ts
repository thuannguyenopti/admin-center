import { EleDef } from "@/app/db/initialData";
import { ColumnNode, OutlineState, RowNode, SectionNode, Selection } from "./types";

export const idFor = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const ensureElements = (elements?: { id: string }[]): { id: string }[] => (elements ? [...elements] : []);

const coerceColumn = (node: any): ColumnNode => ({
	id: node?.id ?? idFor("col"),
	open: node?.open ?? true,
	elements: ensureElements(node?.elements),
});

const coerceRow = (node: any): RowNode => ({
	id: node?.id ?? idFor("row"),
	open: node?.open ?? true,
	children: Array.isArray(node?.children) && node.children.length > 0 ? node.children.map(coerceColumn) : [coerceColumn({})],
});

const coerceSection = (node: any): SectionNode => ({
	id: node?.id ?? idFor("sec"),
	name: node?.name ?? "Untitled Section",
	open: node?.open ?? true,
	bgImage: node?.bgImage,
	children: Array.isArray(node?.children) && node.children.length > 0 ? node.children.map(coerceRow) : [coerceRow({})],
});

export const coerceOutline = (outline: any | undefined, fallbackTitle: string): OutlineState => {
	const tree = Array.isArray(outline?.tree) && outline.tree.length > 0 ? outline.tree.map(coerceSection) : [coerceSection({})];
	return {
		id: outline?.id ?? idFor("ol"),
		title: outline?.title ?? fallbackTitle,
		tree,
		elements: outline?.elements ?? {},
	};
};

type Path = { sectionIndex: number; rowIndex: number; columnIndex: number; elementIndex: number };

const findPath = (outline: OutlineState, selection: Selection): Path | null => {
	if (outline.tree.length === 0) return null;

	const findSectionIndex = (sectionId: string) => outline.tree.findIndex((s: SectionNode) => s.id === sectionId);
	const findRowIndex = (sectionIdx: number, rowId: string) => outline.tree[sectionIdx]?.children.findIndex((r: RowNode) => r.id === rowId) ?? -1;
	const findColumnIndex = (sectionIdx: number, rowIdx: number, columnId: string) =>
		outline.tree[sectionIdx]?.children[rowIdx]?.children.findIndex((c: ColumnNode) => c.id === columnId) ?? -1;
	const findElementIndex = (sectionIdx: number, rowIdx: number, colIdx: number, elementId: string) =>
		outline.tree[sectionIdx]?.children[rowIdx]?.children[colIdx]?.elements.findIndex((e: { id: string }) => e.id === elementId) ?? -1;

	switch (selection.kind) {
		case "section": {
			const sectionIndex = findSectionIndex(selection.sectionId);
			if (sectionIndex < 0) return null;
			return { sectionIndex, rowIndex: 0, columnIndex: 0, elementIndex: -1 };
		}
		case "row": {
			const sectionIndex = findSectionIndex(selection.sectionId);
			const rowIndex = sectionIndex >= 0 ? findRowIndex(sectionIndex, selection.rowId) : -1;
			if (sectionIndex < 0 || rowIndex < 0) return null;
			return { sectionIndex, rowIndex, columnIndex: 0, elementIndex: -1 };
		}
		case "column": {
			const sectionIndex = findSectionIndex(selection.sectionId);
			const rowIndex = sectionIndex >= 0 ? findRowIndex(sectionIndex, selection.rowId) : -1;
			const columnIndex = sectionIndex >= 0 && rowIndex >= 0 ? findColumnIndex(sectionIndex, rowIndex, selection.columnId) : -1;
			if (sectionIndex < 0 || rowIndex < 0 || columnIndex < 0) return null;
			return { sectionIndex, rowIndex, columnIndex, elementIndex: -1 };
		}
		case "element": {
			const sectionIndex = findSectionIndex(selection.sectionId);
			const rowIndex = sectionIndex >= 0 ? findRowIndex(sectionIndex, selection.rowId) : -1;
			const columnIndex = sectionIndex >= 0 && rowIndex >= 0 ? findColumnIndex(sectionIndex, rowIndex, selection.columnId) : -1;
			const elementIndex = sectionIndex >= 0 && rowIndex >= 0 && columnIndex >= 0 ? findElementIndex(sectionIndex, rowIndex, columnIndex, selection.elementId) : -1;
			if (sectionIndex < 0 || rowIndex < 0 || columnIndex < 0 || elementIndex < 0) return null;
			return { sectionIndex, rowIndex, columnIndex, elementIndex };
		}
		case "none":
		default:
			return outline.tree.length > 0
				? { sectionIndex: 0, rowIndex: 0, columnIndex: 0, elementIndex: -1 }
				: null;
	}
};

const defaultProps: Record<string, EleDef["properties"]> = {
	"ct-text": { text: { value: "" } },
	"ct-heading": { text: { value: "Heading" } },
	"ct-rich-text": { richtext: { value: "" } },
	"ct-button": { label: { value: "Button" } },
	"ct-input": {
		label: { value: "Label" },
		placeholder: { value: "" },
		tooltip: { value: "" },
		required: { value: false },
	},
	"ct-image": {
		imageUrl: { value: "https://placehold.co/800x400" },
		altText: { value: "" },
		width: { value: "" },
		height: { value: "" },
	},
};

export const newElement = (type: string): EleDef => ({
	type,
	properties: defaultProps[type] ?? {},
});

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const insertRow = (tree: SectionNode[], sectionIndex: number, rowIndex: number | null, columns: number) => {
	const nextTree = clone(tree);
	const section = nextTree[sectionIndex];
	if (!section) return nextTree;
	const targetIndex = rowIndex === null ? section.children.length : rowIndex + 1;
	const row: RowNode = {
		id: idFor("row"),
		open: true,
		children: Array.from({ length: columns }, () => ({ id: idFor("col"), open: true, elements: [] })),
	};
	section.children.splice(targetIndex, 0, row);
	return nextTree;
};

export const addRowPreset = (outline: OutlineState, selection: Selection, columns: number): OutlineState => {
	const path = findPath(outline, selection);
	if (!path) return outline;
	const nextTree = insertRow(outline.tree, path.sectionIndex, selection.kind === "row" || selection.kind === "column" || selection.kind === "element" ? path.rowIndex : null, columns);
	return { ...outline, tree: nextTree };
};

export const insertElement = (outline: OutlineState, selection: Selection, type: string, overrideId?: string, position: 'before' | 'after' = 'after'): OutlineState => {
	const path = findPath(outline, selection);
	if (!path) return outline;
	const nextTree = clone(outline.tree);
	const section = nextTree[path.sectionIndex];
	const row = section?.children[path.rowIndex];
	const column = row?.children[path.columnIndex];
	if (!section || !row || !column) return outline;

	const newId = overrideId ?? idFor("ele");
	const isElementSelection = path.elementIndex >= 0;
	
	// If selecting an element, we can insert before or after.
	// If selecting a column/row, we typically append to end (which is elementIndex -1, so line below handles it as length).
	const targetIndex = isElementSelection 
		? (position === 'after' ? path.elementIndex + 1 : path.elementIndex) 
		: column.elements.length;

	const newElements = [...column.elements];
	newElements.splice(targetIndex, 0, { id: newId });

	const updatedColumn: ColumnNode = {
		...column,
		elements: newElements,
	};
	row.children.splice(path.columnIndex, 1, updatedColumn);

	return {
		...outline,
		tree: nextTree,
		elements: {
			...outline.elements,
			[newId]: newElement(type),
		},
	};
};

export const splitColumn = (outline: OutlineState, selection: Selection): OutlineState => {
	const path = findPath(outline, selection);
	if (!path) return outline;
	const nextTree = clone(outline.tree);
	const row = nextTree[path.sectionIndex]?.children[path.rowIndex];
	if (!row) return outline;
	const column = row.children[path.columnIndex];
	if (!column) return outline;
	const newColumn: ColumnNode = { id: idFor("col"), open: true, elements: [] };
	row.children.splice(path.columnIndex + 1, 0, newColumn);
	return { ...outline, tree: nextTree };
};

export const mergeColumnRight = (outline: OutlineState, selection: Selection): OutlineState => {
	const path = findPath(outline, selection);
	if (!path) return outline;
	const nextTree = clone(outline.tree);
	const row = nextTree[path.sectionIndex]?.children[path.rowIndex];
	if (!row) return outline;
	const column = row.children[path.columnIndex];
	const target = row.children[path.columnIndex + 1];
	if (!column || !target) return outline;
	const merged: ColumnNode = { ...column, elements: [...column.elements, ...target.elements] };
	row.children.splice(path.columnIndex, 2, merged);
	return { ...outline, tree: nextTree };
};

export const updateElementProperty = (
	outline: OutlineState,
	elementId: string,
	property: string,
	value: any
): OutlineState => {
	const current = outline.elements[elementId];
	if (!current) return outline;
	return {
		...outline,
		elements: {
			...outline.elements,
			[elementId]: {
				...current,
				properties: {
					...current.properties,
					[property]: { value },
				},
			},
		},
	};
};

export const changeElementType = (outline: OutlineState, elementId: string, nextType: string): OutlineState => {
	const current = outline.elements[elementId];
	if (!current) return outline;
	const nextProps = current.properties?.text && (nextType === "ct-heading" || nextType === "ct-text")
		? { text: { value: current.properties.text.value } }
		: defaultProps[nextType] ?? {};
	return {
		...outline,
		elements: {
			...outline.elements,
			[elementId]: {
				...current,
				type: nextType,
				properties: nextProps,
			},
		},
	};
};

export const ensureSectionRowColumn = (outline: OutlineState): OutlineState => {
	if (outline.tree.length > 0) return outline;
	const section = coerceSection({});
	return { ...outline, tree: [section] };
};

export const getSelectionForElement = (outline: OutlineState, elementId: string): Selection | null => {
	for (const [sIdx, section] of outline.tree.entries()) {
		for (const [rIdx, row] of section.children.entries()) {
			for (const [cIdx, column] of row.children.entries()) {
				const eIdx = column.elements.findIndex((e: { id: string }) => e.id === elementId);
				if (eIdx !== -1) {
					return {
						kind: "element",
						sectionId: section.id,
						rowId: row.id,
						columnId: column.id,
						elementId: elementId
					};
				}
			}
		}
	}
	return null;
};

export const generateId = (prefix: string) => idFor(prefix);

export const deleteElement = (outline: OutlineState, elementId: string): OutlineState => {
	const selection = getSelectionForElement(outline, elementId);
	if (!selection || selection.kind !== "element") return outline;
	const path = findPath(outline, selection);
	if (!path) return outline;

	const nextTree = clone(outline.tree);
	const column = nextTree[path.sectionIndex]?.children[path.rowIndex]?.children[path.columnIndex];
	if (!column) return outline;

	column.elements.splice(path.elementIndex, 1);

	// Optional: Clean up element from data map? Keeping it for undo history often simplier, but here we ignore.

	return { ...outline, tree: nextTree };
};
export const getPreviousElementId = (outline: OutlineState, elementId: string): string | null => {
	const selection = getSelectionForElement(outline, elementId);
	if (!selection || selection.kind !== "element") return null;
	const path = findPath(outline, selection);
	if (!path) return null;

	// Same column, previous element
	if (path.elementIndex > 0) {
		return outline.tree[path.sectionIndex].children[path.rowIndex].children[path.columnIndex].elements[path.elementIndex - 1].id;
	}
    // Previous column end? Previous Row? For now just simple prev in column
	return null;
};
export const getNextElementId = (outline: OutlineState, elementId: string): string | null => {
	const selection = getSelectionForElement(outline, elementId);
	if (!selection || selection.kind !== "element") return null;
	const path = findPath(outline, selection);
	if (!path) return null;

    const column = outline.tree[path.sectionIndex].children[path.rowIndex].children[path.columnIndex];
	if (path.elementIndex < column.elements.length - 1) {
		return column.elements[path.elementIndex + 1].id;
	}
	return null;
};

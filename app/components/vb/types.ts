import { EleMap } from "@/app/db/initialData";

export type ColumnNode = {
	id: string;
	open: boolean;
	elements: { id: string }[];
};

export type RowNode = {
	id: string;
	open: boolean;
	children: ColumnNode[];
};

export type SectionNode = {
	id: string;
	name: string;
	open: boolean;
	bgImage?: string;
	children: RowNode[];
};

export type OutlineState = {
	id: string;
	title: string;
	tree: SectionNode[];
	elements: EleMap;
};

export type Selection =
	| { kind: "none" }
	| { kind: "section"; sectionId: string }
	| { kind: "row"; sectionId: string; rowId: string }
	| { kind: "column"; sectionId: string; rowId: string; columnId: string }
	| { kind: "element"; sectionId: string; rowId: string; columnId: string; elementId: string };

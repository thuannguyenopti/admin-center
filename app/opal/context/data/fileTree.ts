import {
	IconFilePdf,
	IconFileImage,
	IconFileSpreadsheet,
	IconTableCells,
	IconFileWord,
	IconFileLines,
} from "@optiaxiom/icons";

export interface FileNode {
	id: string;
	label: string;
	type: "file" | "folder";
	contentType?: "markdown" | "pdf" | "image" | "spreadsheet" | "csv" | "word";
	owner?: "personal" | "team";
	expanded?: boolean;
	children?: FileNode[];
}

export const INITIAL_FILE_TREE: FileNode[] = [
	{
		id: "1",
		label: "Playbooks",
		type: "folder",
		expanded: true,
		children: [
			{
				id: "1-1",
				label: "Opal Agent Playbook.md",
				type: "file",
				contentType: "markdown",
				owner: "personal",
			},
			{
				id: "1-2",
				label: "Sales Enablement.md",
				type: "file",
				contentType: "markdown",
				owner: "team",
			},
		],
	},
	{
		id: "4",
		label: "Reports",
		type: "folder",
		expanded: true,
		children: [
			{
				id: "4-1",
				label: "Q1 Performance Report.md",
				type: "file",
				contentType: "markdown",
				owner: "team",
			},
		],
	},
	{
		id: "5",
		label: "Diagrams",
		type: "folder",
		expanded: true,
		children: [
			{
				id: "5-1",
				label: "Content Pipeline.md",
				type: "file",
				contentType: "markdown",
				owner: "personal",
			},
		],
	},
	{
		id: "6",
		label: "Assets",
		type: "folder",
		expanded: true,
		children: [
			{
				id: "6-1",
				label: "Brand Guidelines.pdf",
				type: "file",
				contentType: "pdf",
				owner: "team",
			},
			{
				id: "6-2",
				label: "Campaign Banner.png",
				type: "file",
				contentType: "image",
				owner: "team",
			},
			{
				id: "6-3",
				label: "Q1 Budget Tracker.xlsx",
				type: "file",
				contentType: "spreadsheet",
				owner: "personal",
			},
			{id: "6-4", label: "Leads Export.csv", type: "file", contentType: "csv", owner: "team"},
			{
				id: "6-5",
				label: "Product Brief.docx",
				type: "file",
				contentType: "word",
				owner: "personal",
			},
		],
	},
];

export function findFileById(tree: FileNode[], id: string): FileNode | null {
	for (const node of tree) {
		if (node.id === id) return node;
		if (node.children) {
			const found = findFileById(node.children, id);
			if (found) return found;
		}
	}
	return null;
}

export function getAllFileIds(tree: FileNode[]): string[] {
	const ids: string[] = [];
	for (const node of tree) {
		if (node.type === "file") ids.push(node.id);
		if (node.children) ids.push(...getAllFileIds(node.children));
	}
	return ids;
}

export function hasAnyFiles(tree: FileNode[]): boolean {
	for (const node of tree) {
		if (node.type === "file") return true;
		if (node.children && hasAnyFiles(node.children)) return true;
	}
	return false;
}

export function removeEmptyFolders(nodes: FileNode[]): FileNode[] {
	return nodes
		.map((n) => (n.children ? {...n, children: removeEmptyFolders(n.children)} : n))
		.filter((n) => n.type !== "folder" || (n.children !== undefined && n.children.length > 0));
}

export function getContentTypeIcon(contentType: FileNode["contentType"]) {
	switch (contentType) {
		case "pdf":
			return IconFilePdf;
		case "image":
			return IconFileImage;
		case "spreadsheet":
			return IconFileSpreadsheet;
		case "csv":
			return IconTableCells;
		case "word":
			return IconFileWord;
		case "markdown":
		default:
			return IconFileLines;
	}
}

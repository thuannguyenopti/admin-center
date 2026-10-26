"use client";

import { GROUPS_DATA } from "../../../groups/data";

const INPUT_HEADERS = [
	"Email (require)",
	"first_name(optional)",
	"last_name(optional)",
	"Group",
] as const;

const HOW_TO_USE_ROWS: string[] = [
	"How to use — Import by group access",
	"",
	"Sheets",
	"Input — enter users to import (one row per user).",
	"Group data — list of groups used for the Group dropdown (do not rename this sheet).",
	"How to use — these instructions.",
	"",
	"Input columns",
	"Email (require) — required. Must be a valid email.",
	"first_name(optional) — optional.",
	"last_name(optional) — optional.",
	"Group — required. Use the dropdown; values come from the Group data sheet.",
	"",
	"Steps",
	"1. Fill Email on the Input sheet.",
	"2. Optionally fill first_name and last_name.",
	"3. Select Group from the dropdown (sourced from Group data).",
	"4. Save the file (.xlsx) and upload it in Admin Center → Import User → Import by group access.",
	"",
	"Notes",
	"Group names must match an existing group exactly (dropdown values are already exact).",
	"Maximum 1,000 users per file; file size max 10MB.",
];

function triggerDownload(bytes: Uint8Array, fileName: string): void {
	const blob = new Blob([new Uint8Array(bytes)], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = fileName;
	a.rel = "noopener";
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

/**
 * Download Excel template for import-by-group-access:
 * Input (headers + sample) · Group data (all groups) · How to use.
 * Group column uses data validation from Group data.
 */
export async function downloadGroupAccessTemplate(): Promise<void> {
	const ExcelJS = (await import("exceljs")).default;

	const groups = GROUPS_DATA.map((g) => ({
		name: g.name,
		product: g.product,
		instance: g.instance,
		role: g.role,
	}));

	const sampleGroup =
		groups.find((g) => g.name.toLowerCase().includes("cms admin"))?.name ??
		groups[0]?.name ??
		"";

	const workbook = new ExcelJS.Workbook();
	workbook.creator = "Admin Center";
	workbook.created = new Date();

	// --- Input ---
	const input = workbook.addWorksheet("Input", {
		views: [{ state: "frozen", ySplit: 1 }],
	});
	input.columns = [
		{ width: 28 },
		{ width: 22 },
		{ width: 22 },
		{ width: 48 },
	];

	const headerRow = input.addRow([...INPUT_HEADERS]);
	headerRow.font = { bold: true };
	headerRow.eachCell((cell) => {
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFF2F2F2" },
		};
		cell.alignment = { vertical: "middle", wrapText: true };
	});

	// Sample row: empty email/names, prefilled Group (matches screenshot layout)
	input.addRow(["", "", "", sampleGroup]);

	const groupLastRow = Math.max(2, groups.length + 1);
	input.dataValidations.add("D2:D1001", {
		type: "list",
		allowBlank: true,
		showErrorMessage: true,
		showInputMessage: true,
		promptTitle: "Group",
		prompt: "Select a group from Group data",
		errorTitle: "Invalid group",
		error: "Please select a group from the list.",
		formulae: [`'Group data'!$A$2:$A$${groupLastRow}`],
	});

	// --- Group data ---
	const groupSheet = workbook.addWorksheet("Group data", {
		views: [{ state: "frozen", ySplit: 1 }],
	});
	groupSheet.columns = [
		{ width: 64 },
		{ width: 22 },
		{ width: 16 },
		{ width: 14 },
	];
	const groupHeader = groupSheet.addRow([
		"Group",
		"Product",
		"Instance",
		"Role",
	]);
	groupHeader.font = { bold: true };
	for (const g of groups) {
		groupSheet.addRow([g.name, g.product, g.instance, g.role]);
	}

	// --- How to use ---
	const how = workbook.addWorksheet("How to use");
	how.getColumn(1).width = 96;
	for (const line of HOW_TO_USE_ROWS) {
		how.addRow([line]);
	}
	how.getRow(1).font = { bold: true };

	const buffer = await workbook.xlsx.writeBuffer();
	const bytes =
		buffer instanceof Uint8Array
			? buffer
			: new Uint8Array(buffer as ArrayBuffer);

	triggerDownload(bytes, "user-import-by-group-access-template.xlsx");
}

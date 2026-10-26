"use client";

import * as XLSX from "xlsx";
import * as CFB from "cfb";
import { GROUPS_DATA } from "../../../groups/data";

const INPUT_HEADERS = [
	"Email (require)",
	"first_name(optional)",
	"last_name(optional)",
	"Group",
] as const;

const HOW_TO_USE_ROWS: string[][] = [
	["How to use — Import by group access"],
	[""],
	["Sheets"],
	["Input — enter users to import (one row per user)."],
	["Group data — list of groups used for the Group dropdown (do not rename this sheet)."],
	["How to use — these instructions."],
	[""],
	["Input columns"],
	["Email (require) — required. Must be a valid email."],
	["first_name(optional) — optional."],
	["last_name(optional) — optional."],
	["Group — required. Use the dropdown; values come from the Group data sheet."],
	[""],
	["Steps"],
	["1. Fill Email on the Input sheet."],
	["2. Optionally fill first_name and last_name."],
	["3. Select Group from the dropdown (sourced from Group data)."],
	["4. Save the file (.xlsx) and upload it in Admin Center → Import User → Import by group access."],
	[""],
	["Notes"],
	["Group names must match an existing group exactly (dropdown values are already exact)."],
	["Maximum 1,000 users per file; file size max 10MB."],
];

function toUtf8(content: string | number[] | Uint8Array): string {
	if (typeof content === "string") return content;
	return new TextDecoder("utf-8").decode(
		content instanceof Uint8Array ? content : new Uint8Array(content),
	);
}

/** Inject list validation on Input!D2:D1001 from Group data!A2:An. */
function injectGroupDropdown(
	xlsxBytes: Uint8Array,
	groupCount: number,
): Uint8Array {
	const cfb = CFB.read(xlsxBytes, { type: "array" });
	const sheetPath = "/xl/worksheets/sheet1.xml";
	const entry = CFB.find(cfb, sheetPath);
	if (!entry || entry.content == null) {
		return xlsxBytes;
	}

	let xml = toUtf8(entry.content as string | number[] | Uint8Array);
	if (xml.includes("<dataValidations")) {
		return xlsxBytes;
	}

	const lastRow = Math.max(2, groupCount + 1);
	const formula = `'Group data'!$A$2:$A$${lastRow}`;
	const dv =
		`<dataValidations count="1">` +
		`<dataValidation type="list" allowBlank="1" showDropDown="0" showInputMessage="1" showErrorMessage="1" sqref="D2:D1001">` +
		`<formula1>${formula}</formula1>` +
		`</dataValidation>` +
		`</dataValidations>`;

	if (!xml.includes("</worksheet>")) {
		return xlsxBytes;
	}
	xml = xml.replace("</worksheet>", `${dv}</worksheet>`);

	const bytes = new TextEncoder().encode(xml);
	entry.content = bytes;
	entry.size = bytes.length;

	const written = CFB.write(cfb, { type: "array", fileType: "zip" });
	return written instanceof Uint8Array
		? written
		: new Uint8Array(written as ArrayBuffer);
}

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
export function downloadGroupAccessTemplate(): void {
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

	const wb = XLSX.utils.book_new();

	const inputSheet = XLSX.utils.aoa_to_sheet([
		[...INPUT_HEADERS],
		["", "", "", sampleGroup],
	]);
	inputSheet["!cols"] = [
		{ wch: 28 },
		{ wch: 22 },
		{ wch: 22 },
		{ wch: 48 },
	];
	XLSX.utils.book_append_sheet(wb, inputSheet, "Input");

	const groupSheet = XLSX.utils.aoa_to_sheet([
		["Group", "Product", "Instance", "Role"],
		...groups.map((g) => [g.name, g.product, g.instance, g.role]),
	]);
	groupSheet["!cols"] = [
		{ wch: 64 },
		{ wch: 22 },
		{ wch: 16 },
		{ wch: 14 },
	];
	XLSX.utils.book_append_sheet(wb, groupSheet, "Group data");

	const howSheet = XLSX.utils.aoa_to_sheet(HOW_TO_USE_ROWS);
	howSheet["!cols"] = [{ wch: 96 }];
	XLSX.utils.book_append_sheet(wb, howSheet, "How to use");

	const raw = XLSX.write(wb, {
		type: "array",
		bookType: "xlsx",
	});
	// SheetJS may return ArrayBuffer; CFB needs a Uint8Array view.
	const bytes =
		raw instanceof Uint8Array ? raw : new Uint8Array(raw as ArrayBuffer);

	const withValidation = injectGroupDropdown(bytes, groups.length);
	triggerDownload(withValidation, "user-import-by-group-access-template.xlsx");
}

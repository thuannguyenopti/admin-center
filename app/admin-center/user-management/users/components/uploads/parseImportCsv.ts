import Papa from "papaparse";
import type { StagingUser } from "./data";
import {
	isZipOrXlsxBytes,
	parseImportExcelBuffer,
} from "./parseImportExcel";
import {
	buildParsedRows,
	headersHaveEmail,
	headersHaveGroup,
	normalizeHeader,
	type ImportParseMode,
	type ParsedImportRow,
} from "./parseImportRows";
import { resolveGroupByName, sampleGroupNames } from "./resolveGroupAccess";

export type { ParsedImportRow, ImportParseMode };

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_ROWS = 1000;

export type ParseImportResult =
	| {
			ok: true;
			fileName: string;
			rows: ParsedImportRow[];
			failedRecords: number;
			errors: string[];
	  }
	| {
			ok: false;
			fileName: string;
			message: string;
	  };

function sanitizeFileName(name: string): string {
	return name.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 120);
}

function looksLikeHtml(text: string): boolean {
	const sample = text.slice(0, 200).toLowerCase();
	return sample.includes("<html") || sample.includes("<!doctype");
}

function decodeTextBuffer(buf: ArrayBuffer): string {
	const u8 = new Uint8Array(buf);
	// UTF-16 LE BOM
	if (u8.length >= 2 && u8[0] === 0xff && u8[1] === 0xfe) {
		return new TextDecoder("utf-16le").decode(u8);
	}
	// UTF-16 BE BOM
	if (u8.length >= 2 && u8[0] === 0xfe && u8[1] === 0xff) {
		return new TextDecoder("utf-16be").decode(u8);
	}
	return new TextDecoder("utf-8").decode(u8).replace(/^\uFEFF/, "");
}

function parseCsvText(
	text: string,
	fileName: string,
	mode: ImportParseMode = "users",
): Promise<ParseImportResult> {
	return new Promise((resolve) => {
		Papa.parse<Record<string, unknown>>(text, {
			header: true,
			skipEmptyLines: "greedy",
			delimiter: "",
			transformHeader: normalizeHeader,
			complete: (results) => {
				if (
					results.errors.length > 0 &&
					(!results.data || results.data.length === 0)
				) {
					resolve({
						ok: false,
						fileName,
						message:
							results.errors[0]?.message ||
							"Could not parse the CSV file.",
					});
					return;
				}

				const headers = (results.meta.fields ?? [])
					.map(normalizeHeader)
					.filter(Boolean);
				if (!headersHaveEmail(headers)) {
					const found =
						headers.length > 0
							? ` Found columns: ${headers.join(", ")}.`
							: " No column headers were detected.";
					resolve({
						ok: false,
						fileName,
						message: `File must include an "email" column (any order is fine).${found}`,
					});
					return;
				}

				if (mode === "groupAccess" && !headersHaveGroup(headers)) {
					const found =
						headers.length > 0
							? ` Found columns: ${headers.join(", ")}.`
							: "";
					resolve({
						ok: false,
						fileName,
						message: `File must include a "group_name" column.${found}`,
					});
					return;
				}

				const raw = results.data ?? [];
				if (raw.length > MAX_ROWS) {
					resolve({
						ok: false,
						fileName,
						message: `File cannot exceed ${MAX_ROWS} users.`,
					});
					return;
				}

				const { rows, failedRecords, errors } = buildParsedRows(raw, mode);
				if (rows.length === 0) {
					resolve({
						ok: false,
						fileName,
						message:
							mode === "groupAccess"
								? "No valid users found. Check email and group_name columns."
								: "No valid users found. Check that emails are valid and the template columns are correct.",
					});
					return;
				}

				resolve({
					ok: true,
					fileName,
					rows,
					failedRecords,
					errors,
				});
			},
			error: (err: Error) => {
				resolve({
					ok: false,
					fileName,
					message: err.message || "Failed to read the CSV file.",
				});
			},
		});
	});
}

/**
 * Parse a user-import spreadsheet in the browser.
 * Accepts real CSV and Excel (.xlsx), including Excel files misnamed as .csv.
 * Column order does not matter. Headers: email + first/last name aliases.
 * Group-access mode also requires group_name.
 */
export function parseImportCsvFile(
	file: File,
	mode: ImportParseMode = "users",
): Promise<ParseImportResult> {
	const fileName = sanitizeFileName(file.name || "users.csv");
	const lower = fileName.toLowerCase();
	const extOk =
		lower.endsWith(".csv") ||
		lower.endsWith(".xlsx") ||
		lower.endsWith(".xls");

	if (!extOk) {
		return Promise.resolve({
			ok: false,
			fileName,
			message:
				"Only CSV or Excel (.xlsx) files are supported.",
		});
	}
	if (file.size > MAX_FILE_BYTES) {
		return Promise.resolve({
			ok: false,
			fileName,
			message: "File must be 10MB or smaller.",
		});
	}
	if (file.size === 0) {
		return Promise.resolve({
			ok: false,
			fileName,
			message: "The selected file is empty.",
		});
	}

	return file
		.arrayBuffer()
		.then(async (buf) => {
			// Excel workbook saved/renamed as .csv starts with ZIP magic "PK"
			if (
				isZipOrXlsxBytes(buf) ||
				lower.endsWith(".xlsx") ||
				lower.endsWith(".xls")
			) {
				const excel = parseImportExcelBuffer(buf, mode);
				if (!excel.ok) {
					return { ok: false as const, fileName, message: excel.message };
				}
				return {
					ok: true as const,
					fileName,
					rows: excel.rows,
					failedRecords: excel.failedRecords,
					errors: excel.errors,
				};
			}

			const text = decodeTextBuffer(buf);
			if (!text.trim()) {
				return {
					ok: false as const,
					fileName,
					message: "The selected file is empty.",
				};
			}
			if (looksLikeHtml(text)) {
				return {
					ok: false as const,
					fileName,
					message:
						"This looks like an HTML file, not a spreadsheet. Export CSV or Excel from Sheets/Excel.",
				};
			}

			return parseCsvText(text, fileName, mode);
		})
		.catch(() => ({
			ok: false as const,
			fileName,
			message: "Failed to read the file.",
		}));
}

export function parsedRowsToStaging(
	uploadId: string,
	fileName: string,
	rows: ParsedImportRow[],
	systemEmails: Iterable<string>,
	mode: ImportParseMode = "users",
): StagingUser[] {
	const existing = new Set(
		[...systemEmails].map((e) => e.trim().toLowerCase()),
	);
	const stamp = Date.now();
	return rows.map((r, i) => {
		const base: StagingUser = {
			id: `st-${stamp}-${i}`,
			uploadId,
			fileName,
			email: r.email,
			first: r.first,
			last: r.last,
			status: existing.has(r.email) ? "Duplicate" : "Valid",
			importMode: mode,
		};

		if (mode !== "groupAccess" || !r.groupName) {
			return base;
		}

		const matched = resolveGroupByName(r.groupName);
		if (!matched) {
			return {
				...base,
				groupName: r.groupName,
				groupMatch: "unknown" as const,
			};
		}

		return {
			...base,
			groupName: matched.groupName,
			groupId: matched.groupId,
			groupMatch: "matched" as const,
			product: matched.product,
			instance: matched.instance,
			role: matched.role,
		};
	});
}

function triggerCsvDownload(csv: string, downloadName: string): void {
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = downloadName;
	a.rel = "noopener";
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

export function downloadImportTemplate(): void {
	const csv =
		"email,first_name,last_name\n" +
		"ava.example@acme.com,Ava,Example\n" +
		"liam.example@acme.com,Liam,Example\n";
	triggerCsvDownload(csv, "user-import-template.csv");
}

export function downloadGroupAccessTemplate(): void {
	const [g1, g2] = sampleGroupNames(2);
	const groupA = g1 ?? "CMS Editors - Marketing Site";
	const groupB = g2 ?? "Brand Studio Reviewers";
	const csv =
		"email,first_name,last_name,group_name\n" +
		`ava.example@acme.com,Ava,Example,"${groupA.replace(/"/g, '""')}"\n` +
		`liam.example@acme.com,Liam,Example,"${groupB.replace(/"/g, '""')}"\n`;
	triggerCsvDownload(csv, "user-import-by-group-access-template.csv");
}

export function formatUploadDate(d = new Date()): string {
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

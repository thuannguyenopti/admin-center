import * as XLSX from "xlsx";
import {
	buildParsedRows,
	headersHaveEmail,
	normalizeHeader,
	type ParsedImportRow,
} from "./parseImportRows";

const MAX_ROWS = 1000;

export type ExcelParseOk = {
	ok: true;
	rows: ParsedImportRow[];
	failedRecords: number;
	errors: string[];
};

export type ExcelParseFail = { ok: false; message: string };

/** True when bytes look like a ZIP/XLSX container (common when Excel is renamed .csv). */
export function isZipOrXlsxBytes(buf: ArrayBuffer): boolean {
	if (buf.byteLength < 4) return false;
	const u8 = new Uint8Array(buf);
	// PK\x03\x04 — ZIP / XLSX
	return u8[0] === 0x50 && u8[1] === 0x4b;
}

/**
 * Parse first sheet of an .xlsx workbook (also works for Excel files misnamed .csv).
 */
export function parseImportExcelBuffer(
	buf: ArrayBuffer,
): ExcelParseOk | ExcelParseFail {
	try {
		const wb = XLSX.read(buf, { type: "array", cellDates: false });
		const sheetName = wb.SheetNames[0];
		if (!sheetName) {
			return { ok: false, message: "The Excel file has no sheets." };
		}
		const sheet = wb.Sheets[sheetName];
		const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
			defval: "",
			raw: false,
			blankrows: false,
		});

		if (raw.length === 0) {
			return {
				ok: false,
				message:
					"No data rows found. Put headers in row 1 (email, first_name, last_name).",
			};
		}

		const headers = Object.keys(raw[0] ?? {})
			.map(normalizeHeader)
			.filter(Boolean);

		if (!headersHaveEmail(headers)) {
			const found =
				headers.length > 0
					? ` Found columns: ${headers.join(", ")}.`
					: " No column headers were detected.";
			return {
				ok: false,
				message: `File must include an "email" column (any order is fine).${found}`,
			};
		}

		if (raw.length > MAX_ROWS) {
			return {
				ok: false,
				message: `File cannot exceed ${MAX_ROWS} users.`,
			};
		}

		const { rows, failedRecords, errors } = buildParsedRows(raw);
		if (rows.length === 0) {
			return {
				ok: false,
				message:
					"No valid users found. Check that emails are valid and the template columns are correct.",
			};
		}

		return { ok: true, rows, failedRecords, errors };
	} catch {
		return {
			ok: false,
			message:
				"Could not read this Excel file. Try File → Save As → CSV UTF-8, or download CSV from Google Sheets.",
		};
	}
}

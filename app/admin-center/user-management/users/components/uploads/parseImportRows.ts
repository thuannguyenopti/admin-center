export type ImportParseMode = "users" | "groupAccess";

export type ParsedImportRow = {
	email: string;
	first: string;
	last: string;
	/** Present when importing by group access. */
	groupName?: string;
};

/** Strip BOM / NBSP / zero-width / quotes so Sheets & Excel exports still match. */
export function normalizeHeader(h: string): string {
	return h
		.replace(/^\uFEFF/, "")
		.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, " ")
		.trim()
		.replace(/^["']+|["']+$/g, "")
		.toLowerCase()
		.replace(/[\s-]+/g, "_");
}

function pickField(row: Record<string, string>, keys: string[]): string {
	for (const key of keys) {
		const v = row[key];
		if (typeof v === "string" && v.trim()) return v.trim();
	}
	return "";
}

/** Remap row keys through normalizeHeader so pickField always uses clean names. */
export function normalizeRow(
	row: Record<string, unknown>,
): Record<string, string> {
	const out: Record<string, string> = {};
	for (const [key, value] of Object.entries(row)) {
		const nk = normalizeHeader(key);
		if (!nk || nk.startsWith("__parsed")) continue;
		out[nk] = value == null ? "" : String(value);
	}
	return out;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMAIL_KEYS = [
	"email",
	"e_mail",
	"mail",
	"user_email",
	"email_address",
];
const FIRST_KEYS = ["first_name", "firstname", "first", "given_name"];
const LAST_KEYS = [
	"last_name",
	"lastname",
	"last",
	"family_name",
	"surname",
];
export const GROUP_KEYS = [
	"group_name",
	"group",
	"groupname",
	"access_group",
	"group_access",
];

export function headersHaveEmail(headers: string[]): boolean {
	return headers.some((h) => EMAIL_KEYS.includes(h));
}

export function headersHaveGroup(headers: string[]): boolean {
	return headers.some((h) => GROUP_KEYS.includes(h));
}

export function buildParsedRows(
	raw: Record<string, unknown>[],
	mode: ImportParseMode = "users",
): {
	rows: ParsedImportRow[];
	failedRecords: number;
	errors: string[];
} {
	const rows: ParsedImportRow[] = [];
	const seen = new Set<string>();
	let failedRecords = 0;
	const errors: string[] = [];
	const requireGroup = mode === "groupAccess";

	for (let i = 0; i < raw.length; i++) {
		const row = normalizeRow(raw[i] ?? {});
		const email = pickField(row, EMAIL_KEYS).toLowerCase();
		const first = pickField(row, FIRST_KEYS);
		const last = pickField(row, LAST_KEYS);
		const groupName = pickField(row, GROUP_KEYS);

		if (!email || !EMAIL_RE.test(email)) {
			failedRecords += 1;
			errors.push(`Row ${i + 2}: invalid or missing email`);
			continue;
		}
		if (requireGroup && !groupName) {
			failedRecords += 1;
			errors.push(`Row ${i + 2}: missing group_name`);
			continue;
		}
		if (seen.has(email)) {
			failedRecords += 1;
			errors.push(`Row ${i + 2}: duplicate email in file (${email})`);
			continue;
		}
		seen.add(email);
		rows.push(
			requireGroup
				? { email, first, last, groupName }
				: { email, first, last },
		);
	}

	return { rows, failedRecords, errors: errors.slice(0, 20) };
}

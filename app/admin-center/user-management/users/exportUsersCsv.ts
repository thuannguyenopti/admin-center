import type { User } from "./data";

const HEADERS = [
	"first_name",
	"last_name",
	"email",
	"activation_status",
	"user_type",
	"created_date",
	"last_active_date",
	"product",
	"instance",
	"project",
	"role",
] as const;

/** Neutralize Excel/Sheets formula injection in CSV cells. */
function csvCell(value: string): string {
	const raw = value ?? "";
	const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
	if (/[",\n\r]/.test(safe)) {
		return `"${safe.replace(/"/g, '""')}"`;
	}
	return safe;
}

function userToRow(u: User): string[] {
	return [
		u.firstName,
		u.lastName,
		u.email,
		u.activationStatus,
		u.userType,
		u.createdDate,
		u.lastActiveDate ?? "",
		u.product,
		u.instance,
		u.project,
		u.role,
	];
}

export function buildUsersCsv(users: User[]): string {
	const lines = [
		HEADERS.join(","),
		...users.map((u) => userToRow(u).map(csvCell).join(",")),
	];
	// BOM helps Excel open UTF-8 correctly
	return `\uFEFF${lines.join("\n")}\n`;
}

export function downloadUsersCsv(users: User[], filename?: string): void {
	if (users.length === 0) return;
	const stamp = new Date().toISOString().slice(0, 10);
	const name = filename ?? `users-export-${stamp}.csv`;
	const blob = new Blob([buildUsersCsv(users)], {
		type: "text/csv;charset=utf-8",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = name;
	a.rel = "noopener";
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

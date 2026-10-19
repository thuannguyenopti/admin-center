import type { AccessEntry } from "../ProductAccessStep";

export type InvitedUser = { email: string; first: string; last: string };

/** A batch of users that share the same product/group access assignment. */
export type AccessCluster = {
	id: string;
	label: string;
	userEmails: string[];
	access: AccessEntry[];
};

export function flattenClusterAccess(clusters: AccessCluster[]): AccessEntry[] {
	const seen = new Set<string>();
	const out: AccessEntry[] = [];
	for (const cluster of clusters) {
		for (const entry of cluster.access) {
			const key = `${entry.kind}:${entry.name}:${entry.instances
				.map((i) => `${i.name}:${i.roles.join(",")}`)
				.join("|")}`;
			if (seen.has(key)) continue;
			seen.add(key);
			out.push(entry);
		}
	}
	return out;
}

export function summarizeAccess(access: AccessEntry[]): string {
	if (access.length === 0) return "No access";
	return access
		.map((a) => {
			const kind = a.kind === "group" ? "Group" : a.name;
			const roles = a.instances
				.flatMap((i) => i.roles)
				.filter(Boolean);
			const uniqueRoles = [...new Set(roles)];
			if (a.kind === "group") return a.name;
			if (uniqueRoles.length === 0) return kind;
			return `${kind} · ${uniqueRoles.slice(0, 2).join(", ")}${
				uniqueRoles.length > 2 ? ` +${uniqueRoles.length - 2}` : ""
			}`;
		})
		.join("; ");
}

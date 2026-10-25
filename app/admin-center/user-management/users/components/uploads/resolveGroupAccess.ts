import { GROUPS_DATA } from "../../../groups/data";

export type ResolvedGroupAccess = {
	groupId: string;
	groupName: string;
	product: string;
	instance: string;
	role: string;
};

/** Case-insensitive exact match against known groups. */
export function resolveGroupByName(
	name: string,
): ResolvedGroupAccess | null {
	const key = name.trim().toLowerCase();
	if (!key) return null;
	const group = GROUPS_DATA.find((g) => g.name.trim().toLowerCase() === key);
	if (!group) return null;
	return {
		groupId: group.id,
		groupName: group.name,
		product: group.product,
		instance: group.instance,
		role: group.role,
	};
}

/** Sample group names for the CSV template (known groups only). */
export function sampleGroupNames(limit = 2): string[] {
	return GROUPS_DATA.slice(0, limit).map((g) => g.name);
}

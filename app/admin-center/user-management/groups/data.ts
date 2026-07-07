import { PRODUCTS, INSTANCES, ROLES } from "../users/data";
import type { AccessEntry } from "../users/components/ProductAccessStep";

export type GroupType = "Product" | "Custom";

export type GroupMember = {
	email: string;
	first: string;
	last: string;
	/** Which existing group this member was copied from (null = added manually). */
	sourceGroupId: string | null;
};

export type Group = {
	id: string;
	name: string;
	description: string | null;
	users: number;
	groupType: GroupType;
	createdDate: string;
	createdTime: string;
	modifiedDate: string;
	modifiedTime: string;
	product: string;
	instance: string;
	role: string;
	/** Populated for groups created via the Create Group wizard. */
	members?: GroupMember[];
	access?: AccessEntry[];
};

export const GROUP_TYPES: GroupType[] = ["Product", "Custom"];

export type GroupFilters = {
	search: string;
	product: string;
	instance: string;
	role: string;
	groupType: string;
};

export const DEFAULT_GROUP_FILTERS: GroupFilters = {
	search: "",
	product: "All",
	instance: "All",
	role: "All",
	groupType: "All",
};

const GROUP_FILTER_KEYS = [
	"product",
	"instance",
	"role",
	"groupType",
] as const satisfies readonly (keyof GroupFilters)[];

export function countActiveGroupFilters(filters: GroupFilters): number {
	return GROUP_FILTER_KEYS.filter((k) => filters[k] !== "All").length;
}

const AUTO_DESC =
	"An automatically generated group for all users in this Organization.";

export const GROUPS_DATA: Group[] = [
	{ id: "g-001", name: "Admin Center Administrators", description: null, users: 30, groupType: "Product", createdDate: "Oct 6, 2025", createdTime: "09:31 PM", modifiedDate: "Oct 6, 2025", modifiedTime: "09:31 PM", product: "CMS", instance: "Production", role: "Admin" },
	{ id: "g-002", name: "Experimentation - Gareth Morton-Leatham - Account - Editor", description: AUTO_DESC, users: 30, groupType: "Product", createdDate: "Oct 6, 2025", createdTime: "09:31 PM", modifiedDate: "Oct 6, 2025", modifiedTime: "09:31 PM", product: "Web Experimentation", instance: "Production", role: "Editor" },
	{ id: "g-003", name: "Admin - Optimizely Collaboration - Production (Experiment Collaboration) - 6554", description: AUTO_DESC, users: 30, groupType: "Product", createdDate: "Oct 6, 2025", createdTime: "09:31 PM", modifiedDate: "Oct 6, 2025", modifiedTime: "09:31 PM", product: "Web Experimentation", instance: "Production", role: "Admin" },
	{ id: "g-004", name: "CMP - Optimizely Collaboration - Production (Experiment Collaboration) - 6554 - Admin", description: AUTO_DESC, users: 30, groupType: "Custom", createdDate: "Oct 6, 2025", createdTime: "09:31 PM", modifiedDate: "Oct 6, 2025", modifiedTime: "09:31 PM", product: "CMP", instance: "Production", role: "Admin" },
	{ id: "g-005", name: "Experimentation Creator - Optimizely Collaboration - Production (Experiment Collaboration) - 6554", description: AUTO_DESC, users: 30, groupType: "Product", createdDate: "Oct 6, 2025", createdTime: "09:31 PM", modifiedDate: "Oct 6, 2025", modifiedTime: "09:31 PM", product: "Web Experimentation", instance: "Production", role: "Contributor" },
	{ id: "g-006", name: "Guest - Optimizely Collaboration - Production (Experiment Collaboration) - 6554", description: AUTO_DESC, users: 30, groupType: "Product", createdDate: "Oct 6, 2025", createdTime: "09:31 PM", modifiedDate: "Oct 6, 2025", modifiedTime: "09:31 PM", product: "Web Experimentation", instance: "Production", role: "Viewer" },
	{ id: "g-007", name: "CMS Editors - Marketing Site", description: AUTO_DESC, users: 18, groupType: "Product", createdDate: "Sep 18, 2025", createdTime: "10:14 AM", modifiedDate: "Oct 2, 2025", modifiedTime: "03:21 PM", product: "CMS", instance: "Production", role: "Editor" },
	{ id: "g-008", name: "CMS Admins - All Projects", description: AUTO_DESC, users: 6, groupType: "Product", createdDate: "Sep 18, 2025", createdTime: "10:14 AM", modifiedDate: "Sep 30, 2025", modifiedTime: "11:02 AM", product: "CMS", instance: "Production", role: "Admin" },
	{ id: "g-009", name: "Brand Studio Reviewers", description: null, users: 9, groupType: "Custom", createdDate: "Aug 04, 2025", createdTime: "02:11 PM", modifiedDate: "Sep 11, 2025", modifiedTime: "04:48 PM", product: "CMP", instance: "Production", role: "Approver" },
	{ id: "g-010", name: "Opal Power Users", description: null, users: 14, groupType: "Custom", createdDate: "Jul 22, 2025", createdTime: "08:55 AM", modifiedDate: "Sep 02, 2025", modifiedTime: "01:39 PM", product: "Opal", instance: "Production", role: "Owner" },
	{ id: "g-011", name: "Mobile App QA - Staging", description: AUTO_DESC, users: 12, groupType: "Product", createdDate: "Jun 10, 2025", createdTime: "12:00 PM", modifiedDate: "Aug 15, 2025", modifiedTime: "05:10 PM", product: "CMP", instance: "Staging", role: "Viewer" },
	{ id: "g-012", name: "Frontend Hosting - Deploy Approvers", description: AUTO_DESC, users: 5, groupType: "Product", createdDate: "May 03, 2025", createdTime: "09:00 AM", modifiedDate: "Aug 01, 2025", modifiedTime: "10:30 AM", product: "Frontend Hosting", instance: "Production", role: "Approver" },
	{ id: "g-013", name: "Connect Platform Maintainers", description: AUTO_DESC, users: 7, groupType: "Product", createdDate: "Apr 19, 2025", createdTime: "04:45 PM", modifiedDate: "Jul 26, 2025", modifiedTime: "02:14 PM", product: "Connect Platform", instance: "Production", role: "Admin" },
	{ id: "g-014", name: "Sandbox Explorers", description: null, users: 22, groupType: "Custom", createdDate: "Mar 12, 2025", createdTime: "11:18 AM", modifiedDate: "Jul 03, 2025", modifiedTime: "09:50 AM", product: "Web Experimentation", instance: "Sandbox", role: "Contributor" },
	{ id: "g-015", name: "Documentation Writers", description: null, users: 4, groupType: "Custom", createdDate: "Feb 28, 2025", createdTime: "07:33 AM", modifiedDate: "Jun 19, 2025", modifiedTime: "03:27 PM", product: "CMS", instance: "Production", role: "Editor" },
];

export function filterGroups(groups: Group[], filters: GroupFilters): Group[] {
	const q = filters.search.trim().toLowerCase();
	return groups.filter((g) => {
		if (q && !g.name.toLowerCase().includes(q)) return false;
		if (filters.product !== "All" && g.product !== filters.product) return false;
		if (filters.instance !== "All" && g.instance !== filters.instance) return false;
		if (filters.role !== "All" && g.role !== filters.role) return false;
		if (filters.groupType !== "All" && g.groupType !== filters.groupType) return false;
		return true;
	});
}

export { PRODUCTS, INSTANCES, ROLES };

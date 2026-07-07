import { PRODUCTS, INSTANCES } from "../users/data";

export type TeamMember = {
	email: string;
	first: string;
	last: string;
	/** Which existing team this member was copied from (null = added manually). */
	sourceTeamId: string | null;
};

export type Team = {
	id: string;
	name: string;
	description: string | null;
	productName: string;
	instanceName: string;
	createdDate: string;
	createdTime: string;
	modifiedDate: string;
	modifiedTime: string;
	/** Populated for teams created via the Create Team wizard. */
	members?: TeamMember[];
};

export type TeamFilters = {
	search: string;
	product: string;
	instance: string;
};

export const DEFAULT_TEAM_FILTERS: TeamFilters = {
	search: "",
	product: "All",
	instance: "All",
};

const AUTO_DESC =
	"An automatically generated group for all users in this Organization.";

export const TEAMS_DATA: Team[] = [
	{ id: "t-001", name: "Admin Center Administrators", description: null, productName: "Content Marketing Platform", instanceName: "Instance name", createdDate: "Oct 6, 2025", createdTime: "09:31 PM", modifiedDate: "Oct 6, 2025", modifiedTime: "09:31 PM" },
	{ id: "t-002", name: "Experimentation - Gareth Morton-Leatham - Account - Editor", description: AUTO_DESC, productName: "Content Marketing Platform", instanceName: "Instance name", createdDate: "Oct 6, 2025", createdTime: "09:31 PM", modifiedDate: "Oct 6, 2025", modifiedTime: "09:31 PM" },
	{ id: "t-003", name: "Admin - Optimizely Collaboration - Production (Experiment Collaboration) - 6554", description: AUTO_DESC, productName: "Content Marketing Platform", instanceName: "Instance name", createdDate: "Oct 6, 2025", createdTime: "09:31 PM", modifiedDate: "Oct 6, 2025", modifiedTime: "09:31 PM" },
	{ id: "t-004", name: "Admin - Optimizely Collaboration - Production (Experiment Collaboration) - 6554", description: AUTO_DESC, productName: "Content Marketing Platform", instanceName: "Instance name", createdDate: "Oct 6, 2025", createdTime: "09:31 PM", modifiedDate: "Oct 6, 2025", modifiedTime: "09:31 PM" },
	{ id: "t-005", name: "Admin - Optimizely Collaboration - Production (Experiment Collaboration) - 6554", description: AUTO_DESC, productName: "Content Marketing Platform", instanceName: "Instance name", createdDate: "Oct 6, 2025", createdTime: "09:31 PM", modifiedDate: "Oct 6, 2025", modifiedTime: "09:31 PM" },
	{ id: "t-006", name: "CMS Editors - Marketing Site", description: AUTO_DESC, productName: "CMS", instanceName: "Production", createdDate: "Sep 18, 2025", createdTime: "10:14 AM", modifiedDate: "Oct 2, 2025", modifiedTime: "03:21 PM" },
	{ id: "t-007", name: "CMS Admins - All Projects", description: AUTO_DESC, productName: "CMS", instanceName: "Production", createdDate: "Sep 18, 2025", createdTime: "10:14 AM", modifiedDate: "Sep 30, 2025", modifiedTime: "11:02 AM" },
	{ id: "t-008", name: "Brand Studio Reviewers", description: null, productName: "CMP", instanceName: "Production", createdDate: "Aug 04, 2025", createdTime: "02:11 PM", modifiedDate: "Sep 11, 2025", modifiedTime: "04:48 PM" },
	{ id: "t-009", name: "Opal Power Users", description: null, productName: "Opal", instanceName: "Production", createdDate: "Jul 22, 2025", createdTime: "08:55 AM", modifiedDate: "Sep 02, 2025", modifiedTime: "01:39 PM" },
	{ id: "t-010", name: "Mobile App QA - Staging", description: AUTO_DESC, productName: "CMP", instanceName: "Staging", createdDate: "Jun 10, 2025", createdTime: "12:00 PM", modifiedDate: "Aug 15, 2025", modifiedTime: "05:10 PM" },
	{ id: "t-011", name: "Frontend Hosting - Deploy Approvers", description: AUTO_DESC, productName: "Frontend Hosting", instanceName: "Production", createdDate: "May 03, 2025", createdTime: "09:00 AM", modifiedDate: "Aug 01, 2025", modifiedTime: "10:30 AM" },
	{ id: "t-012", name: "Connect Platform Maintainers", description: AUTO_DESC, productName: "Connect Platform", instanceName: "Production", createdDate: "Apr 19, 2025", createdTime: "04:45 PM", modifiedDate: "Jul 26, 2025", modifiedTime: "02:14 PM" },
	{ id: "t-013", name: "Sandbox Explorers", description: null, productName: "Web Experimentation", instanceName: "Sandbox", createdDate: "Mar 12, 2025", createdTime: "11:18 AM", modifiedDate: "Jul 03, 2025", modifiedTime: "09:50 AM" },
	{ id: "t-014", name: "Documentation Writers", description: null, productName: "CMS", instanceName: "Production", createdDate: "Feb 28, 2025", createdTime: "07:33 AM", modifiedDate: "Jun 19, 2025", modifiedTime: "03:27 PM" },
];

export function filterTeams(teams: Team[], filters: TeamFilters): Team[] {
	const q = filters.search.trim().toLowerCase();
	return teams.filter((t) => {
		if (q && !t.name.toLowerCase().includes(q)) return false;
		if (filters.product !== "All" && t.productName !== filters.product) return false;
		if (filters.instance !== "All" && t.instanceName !== filters.instance) return false;
		return true;
	});
}

export { PRODUCTS, INSTANCES };

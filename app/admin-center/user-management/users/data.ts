export type ActivationStatus = "Active" | "N/A" | "Password Expired";
export type UserType = "Local" | "SSO";

export type User = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	activationStatus: ActivationStatus;
	createdDate: string;
	lastActiveDate: string | null;
	userType: UserType;
	product: string;
	instance: string;
	project: string;
	role: string;
};

export const PRODUCTS = [
	"CMS",
	"CMP",
	"Opal",
	"Web Experimentation",
	"Connect Platform",
	"Frontend Hosting",
] as const;

export const INSTANCES = [
	"Production",
	"Sandbox",
	"Staging",
	"Development",
] as const;

export const PROJECTS = [
	"Marketing Site",
	"Mobile App",
	"E-commerce Store",
	"Customer Portal",
	"Internal Tools",
	"Documentation",
] as const;

export const ROLES = [
	"Admin",
	"Editor",
	"Viewer",
	"Approver",
	"Contributor",
	"Owner",
] as const;

export const GROUPS = [
	"Engineering",
	"Marketing",
	"Sales",
	"Customer Success",
	"Product",
	"Operations",
] as const;

export const USER_TYPES: UserType[] = ["Local", "SSO"];

export const ACTIVATION_STATUSES: ActivationStatus[] = [
	"Active",
	"N/A",
	"Password Expired",
];

export type UserFilters = {
	search: string;
	product: string;
	instance: string;
	project: string;
	role: string;
	userType: string;
	activationStatus: string;
};

export const DEFAULT_FILTERS: UserFilters = {
	search: "",
	product: "All",
	instance: "All",
	project: "All",
	role: "All",
	userType: "All",
	activationStatus: "All",
};

export const FILTER_DROPDOWN_KEYS = [
	"product",
	"instance",
	"project",
	"role",
	"userType",
	"activationStatus",
] as const satisfies readonly (keyof UserFilters)[];

export function countActiveFilters(filters: UserFilters): number {
	return FILTER_DROPDOWN_KEYS.filter((key) => filters[key] !== "All").length;
}

export const USERS: User[] = [
	{ id: "u-001", firstName: "Liam", lastName: "Smith", email: "liam@gmail.com", activationStatus: "Active", createdDate: "Jul 21, 2022", lastActiveDate: "May 19, 2026", userType: "SSO", product: "CMS", instance: "Production", project: "Marketing Site", role: "Admin" },
	{ id: "u-002", firstName: "Emma", lastName: "Johnson", email: "emma@yahoo.com", activationStatus: "Active", createdDate: "Jul 21, 2022", lastActiveDate: "May 20, 2026", userType: "SSO", product: "CMP", instance: "Production", project: "E-commerce Store", role: "Editor" },
	{ id: "u-003", firstName: "Noah", lastName: "Williams", email: "noah@outlook.com", activationStatus: "Active", createdDate: "Jul 21, 2022", lastActiveDate: "May 18, 2026", userType: "Local", product: "Opal", instance: "Sandbox", project: "Internal Tools", role: "Contributor" },
	{ id: "u-004", firstName: "Olivia", lastName: "Jones", email: "olivia@icloud.com", activationStatus: "Active", createdDate: "Jul 21, 2022", lastActiveDate: "May 21, 2026", userType: "SSO", product: "Web Experimentation", instance: "Production", project: "Marketing Site", role: "Owner" },
	{ id: "u-005", firstName: "Ava", lastName: "Brown", email: "ava@hotmail.com", activationStatus: "N/A", createdDate: "Jul 21, 2022", lastActiveDate: null, userType: "Local", product: "CMS", instance: "Staging", project: "Documentation", role: "Viewer" },
	{ id: "u-006", firstName: "Ethan", lastName: "Davis", email: "ethan@live.com", activationStatus: "N/A", createdDate: "Jul 21, 2022", lastActiveDate: null, userType: "SSO", product: "Connect Platform", instance: "Production", project: "Customer Portal", role: "Approver" },
	{ id: "u-007", firstName: "Sophia", lastName: "Miller", email: "sophia@aol.com", activationStatus: "N/A", createdDate: "Jul 21, 2022", lastActiveDate: null, userType: "Local", product: "CMP", instance: "Development", project: "Mobile App", role: "Editor" },
	{ id: "u-008", firstName: "Mason", lastName: "Wilson", email: "mason@protonmail.com", activationStatus: "Password Expired", createdDate: "Jul 21, 2022", lastActiveDate: "Feb 03, 2026", userType: "SSO", product: "Opal", instance: "Production", project: "Marketing Site", role: "Admin" },
	{ id: "u-009", firstName: "Isabella", lastName: "Moore", email: "isabella@zoho.com", activationStatus: "Password Expired", createdDate: "Jul 21, 2022", lastActiveDate: "Jan 14, 2026", userType: "Local", product: "Frontend Hosting", instance: "Sandbox", project: "Mobile App", role: "Contributor" },
	{ id: "u-010", firstName: "Lucas", lastName: "Taylor", email: "lucas@fastmail.com", activationStatus: "Password Expired", createdDate: "Jul 21, 2022", lastActiveDate: "Mar 11, 2026", userType: "SSO", product: "CMS", instance: "Production", project: "E-commerce Store", role: "Editor" },
	{ id: "u-011", firstName: "Mia", lastName: "Anderson", email: "mia@tutanota.com", activationStatus: "Password Expired", createdDate: "Jul 21, 2022", lastActiveDate: "Dec 20, 2025", userType: "Local", product: "CMP", instance: "Staging", project: "Documentation", role: "Viewer" },
	{ id: "u-012", firstName: "Duy", lastName: "Kieu", email: "duy.kieu@optimizely.com", activationStatus: "Active", createdDate: "Jan 20, 2025", lastActiveDate: "Sep 12, 2025", userType: "SSO", product: "Opal", instance: "Production", project: "Internal Tools", role: "Admin" },
	{ id: "u-013", firstName: "Charlotte", lastName: "Thomas", email: "charlotte@gmail.com", activationStatus: "Active", createdDate: "Mar 15, 2023", lastActiveDate: "May 19, 2026", userType: "SSO", product: "Web Experimentation", instance: "Production", project: "Customer Portal", role: "Owner" },
	{ id: "u-014", firstName: "James", lastName: "Jackson", email: "james@outlook.com", activationStatus: "Active", createdDate: "May 02, 2024", lastActiveDate: "May 20, 2026", userType: "Local", product: "Connect Platform", instance: "Development", project: "Mobile App", role: "Approver" },
	{ id: "u-015", firstName: "Amelia", lastName: "White", email: "amelia@icloud.com", activationStatus: "N/A", createdDate: "Aug 09, 2024", lastActiveDate: null, userType: "SSO", product: "CMS", instance: "Sandbox", project: "Marketing Site", role: "Editor" },
	{ id: "u-016", firstName: "Benjamin", lastName: "Harris", email: "benjamin@yahoo.com", activationStatus: "Active", createdDate: "Oct 30, 2023", lastActiveDate: "May 21, 2026", userType: "SSO", product: "CMP", instance: "Production", project: "E-commerce Store", role: "Admin" },
	{ id: "u-017", firstName: "Harper", lastName: "Martin", email: "harper@protonmail.com", activationStatus: "Password Expired", createdDate: "Nov 11, 2023", lastActiveDate: "Feb 28, 2026", userType: "Local", product: "Opal", instance: "Sandbox", project: "Documentation", role: "Contributor" },
	{ id: "u-018", firstName: "Henry", lastName: "Thompson", email: "henry@gmail.com", activationStatus: "Active", createdDate: "Jan 04, 2024", lastActiveDate: "May 18, 2026", userType: "SSO", product: "Web Experimentation", instance: "Staging", project: "Mobile App", role: "Viewer" },
	{ id: "u-019", firstName: "Evelyn", lastName: "Garcia", email: "evelyn@aol.com", activationStatus: "Active", createdDate: "Feb 22, 2024", lastActiveDate: "May 17, 2026", userType: "Local", product: "Frontend Hosting", instance: "Production", project: "Marketing Site", role: "Editor" },
	{ id: "u-020", firstName: "Alexander", lastName: "Martinez", email: "alexander@live.com", activationStatus: "N/A", createdDate: "Apr 18, 2024", lastActiveDate: null, userType: "SSO", product: "CMS", instance: "Development", project: "Internal Tools", role: "Approver" },
	{ id: "u-021", firstName: "Abigail", lastName: "Robinson", email: "abigail@zoho.com", activationStatus: "Active", createdDate: "Jun 07, 2024", lastActiveDate: "May 21, 2026", userType: "SSO", product: "CMP", instance: "Production", project: "Customer Portal", role: "Admin" },
	{ id: "u-022", firstName: "Sebastian", lastName: "Clark", email: "sebastian@fastmail.com", activationStatus: "Password Expired", createdDate: "Jul 25, 2024", lastActiveDate: "Apr 09, 2026", userType: "Local", product: "Opal", instance: "Sandbox", project: "Documentation", role: "Viewer" },
	{ id: "u-023", firstName: "Emily", lastName: "Rodriguez", email: "emily@tutanota.com", activationStatus: "Active", createdDate: "Sep 13, 2024", lastActiveDate: "May 20, 2026", userType: "SSO", product: "Connect Platform", instance: "Production", project: "Mobile App", role: "Contributor" },
	{ id: "u-024", firstName: "Michael", lastName: "Lewis", email: "michael@hotmail.com", activationStatus: "Active", createdDate: "Dec 02, 2024", lastActiveDate: "May 19, 2026", userType: "SSO", product: "CMS", instance: "Production", project: "Marketing Site", role: "Owner" },
	{ id: "u-025", firstName: "Elizabeth", lastName: "Lee", email: "elizabeth@gmail.com", activationStatus: "N/A", createdDate: "Jan 28, 2025", lastActiveDate: null, userType: "Local", product: "Web Experimentation", instance: "Staging", project: "E-commerce Store", role: "Editor" },
];

export function filterUsers(users: User[], filters: UserFilters): User[] {
	const q = filters.search.trim().toLowerCase();
	return users.filter((u) => {
		if (q && !`${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q)) return false;
		if (filters.product !== "All" && u.product !== filters.product) return false;
		if (filters.instance !== "All" && u.instance !== filters.instance) return false;
		if (filters.project !== "All" && u.project !== filters.project) return false;
		if (filters.role !== "All" && u.role !== filters.role) return false;
		if (filters.userType !== "All" && u.userType !== filters.userType) return false;
		if (filters.activationStatus !== "All" && u.activationStatus !== filters.activationStatus) return false;
		return true;
	});
}

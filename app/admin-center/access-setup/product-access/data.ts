import {
	USERS,
	INSTANCES,
	PROJECTS,
	ROLES,
	type ActivationStatus,
	type User,
	type UserType,
} from "../../user-management/users/data";

export type ProductAccess = {
	id: string;
	name: string;
	/** Matches User.product so we can filter the existing USERS list. */
	productKey: string;
	instances: number;
	users: number;
	technicalContact: string;
	seatTotal: number;
};

export const PRODUCT_ACCESS_LIST: ProductAccess[] = [
	{ id: "content-management-system", name: "Content Management System", productKey: "CMS", instances: 3, users: 20, technicalContact: "michael.chen@capita.com", seatTotal: 40 },
	{ id: "admin-center", name: "Admin center", productKey: "Admin center", instances: 12, users: 15, technicalContact: "lisa.anderson@capita.com", seatTotal: 20 },
	{ id: "customer-support-portal", name: "Customer Support Portal", productKey: "Customer Support Portal", instances: 1, users: 25, technicalContact: "emma.williams@capita.com", seatTotal: 30 },
	{ id: "marketing-automation", name: "Marketing Automation", productKey: "CMP", instances: 2, users: 18, technicalContact: "johan.larsson@capita.com", seatTotal: 25 },
	{ id: "financial-reporting-tool", name: "Financial Reporting Tool", productKey: "Financial Reporting Tool", instances: 12, users: 10, technicalContact: "takashi.suzuki@capita.com", seatTotal: 15 },
	{ id: "hr-management-system", name: "HR Management System", productKey: "Connect Platform", instances: 4, users: 12, technicalContact: "emily.jones@capita.com", seatTotal: 20 },
	{ id: "project-collaboration", name: "Project Collaboration", productKey: "Opal", instances: 6, users: 17, technicalContact: "carlos.martinez@capita.com", seatTotal: 25 },
	{ id: "sales-analytics", name: "Sales Analytics", productKey: "Web Experimentation", instances: 3, users: 14, technicalContact: "oliver.gray@capita.com", seatTotal: 20 },
	{ id: "employee-onboarding", name: "Employee Onboarding", productKey: "Frontend Hosting", instances: 7, users: 19, technicalContact: "sophia.kim@capita.com", seatTotal: 25 },
];

export const ACCOUNT_EXECUTIVE = {
	name: "Test",
	phone: "(850) 000-0022",
	email: "TestAccountExecutive@example.org",
};

export const CUSTOMER_SUCCESS_MANAGER = {
	name: "Test",
	phone: "035 885 8990",
	email: "TestCSMEmail@example.org",
};

export function getProductById(id: string): ProductAccess | undefined {
	return PRODUCT_ACCESS_LIST.find((p) => p.id === id);
}

const FIRST_NAMES = [
	"Liam", "Emma", "Noah", "Olivia", "Ava", "Ethan", "Sophia", "Mason",
	"Isabella", "Lucas", "Mia", "Charlotte", "James", "Amelia", "Benjamin",
	"Harper", "Henry", "Evelyn", "Alexander", "Abigail", "Sebastian", "Emily",
	"Michael", "Elizabeth", "Daniel", "Sofia", "Matthew", "Aria", "Aiden",
	"Scarlett",
];
const LAST_NAMES = [
	"Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller",
	"Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White",
	"Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark",
	"Rodriguez", "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "King",
	"Wright",
];
const EMAIL_DOMAINS = [
	"gmail.com", "yahoo.com", "outlook.com", "icloud.com", "hotmail.com",
	"live.com", "aol.com", "protonmail.com", "zoho.com", "fastmail.com",
];
const CREATED_DATES = [
	"Jul 21, 2022", "Mar 15, 2023", "May 02, 2024", "Aug 09, 2024",
	"Oct 30, 2023", "Nov 11, 2023", "Jan 04, 2024", "Feb 22, 2024",
	"Apr 18, 2024", "Jun 07, 2024", "Sep 13, 2024", "Dec 02, 2024",
	"Jan 28, 2025", "Feb 28, 2025", "Mar 12, 2025",
];
const LAST_ACTIVE_DATES = [
	"May 19, 2026", "May 20, 2026", "May 21, 2026", "May 18, 2026",
	"Feb 03, 2026", "Jan 14, 2026", "Mar 11, 2026", "Apr 09, 2026",
];

function hash(str: string): number {
	let h = 0;
	for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
	return Math.abs(h);
}

function pick<T>(arr: readonly T[], n: number): T {
	return arr[n % arr.length];
}

function synthesizeUsers(product: ProductAccess, count: number): User[] {
	const seed = hash(product.id);
	const STATUSES: ActivationStatus[] = ["Active", "Active", "Active", "N/A", "Password Expired"];
	return Array.from({ length: count }, (_, i) => {
		const s = seed + i * 17;
		const first = pick(FIRST_NAMES, s);
		const last = pick(LAST_NAMES, s + 7);
		const domain = pick(EMAIL_DOMAINS, s + i);
		const status = pick(STATUSES, s + i * 3);
		return {
			id: `${product.id}-u-${i + 1}`,
			firstName: first,
			lastName: last,
			email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`,
			activationStatus: status,
			createdDate: pick(CREATED_DATES, s + i),
			lastActiveDate: status === "Active" ? pick(LAST_ACTIVE_DATES, s + i * 5) : null,
			userType: (i % 2 === 0 ? "SSO" : "Local") as UserType,
			product: product.productKey,
			instance: pick(INSTANCES, s + i * 2),
			project: pick(PROJECTS, s + i * 3),
			role: pick(ROLES, s + i * 5),
		};
	});
}

export function getUsersForProduct(product: ProductAccess): User[] {
	const existing = USERS.filter((u) => u.product === product.productKey);
	if (existing.length >= 5) return existing;
	const needed = Math.max(0, product.users - existing.length);
	return [...existing, ...synthesizeUsers(product, needed || 10)];
}

export type ProductDetailStats = {
	activeUsers: number;
	seatTotal: number;
	totalInstances: number;
	seatUsed: number;
	pendingInvites: number;
};

export function getProductStats(
	product: ProductAccess,
	users: User[],
): ProductDetailStats {
	const active = users.filter((u) => u.activationStatus === "Active").length;
	const pending = users.filter((u) => u.activationStatus === "N/A").length;
	return {
		activeUsers: active,
		seatTotal: product.seatTotal,
		totalInstances: product.instances,
		seatUsed: Math.max(active, Math.min(product.users, product.seatTotal)),
		pendingInvites: pending,
	};
}

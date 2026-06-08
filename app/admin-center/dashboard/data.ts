import { PRODUCTS } from "../user-management/users/data";

export type BillingPlan = "Starter" | "Growth" | "Enterprise";

export type BillingInfo = {
	plan: BillingPlan;
	cycle: "Monthly" | "Annual";
	currency: string;
	amount: number;
	nextRenewalDate: string;
	nextRenewalDaysAway: number;
	paymentMethod: string;
};

export type SeatsInfo = {
	total: number;
	used: number;
	pendingInvites: number;
};

export type EntitySummary = {
	key: string;
	label: string;
	count: number;
	delta?: number;
	href?: string;
};

export const BILLING: BillingInfo = {
	plan: "Growth",
	cycle: "Annual",
	currency: "USD",
	amount: 18000,
	nextRenewalDate: "Jun 03, 2026",
	nextRenewalDaysAway: 13,
	paymentMethod: "Visa •••• 4242",
};

export const SEATS: SeatsInfo = {
	total: 25,
	used: 28,
	pendingInvites: 4,
};

export const GROUPS_SUMMARY: EntitySummary = {
	key: "groups",
	label: "Groups",
	count: 12,
	delta: 2,
	href: "/admin-center/user-management/groups",
};

export const AGENTS_SUMMARY: EntitySummary = {
	key: "agents",
	label: "Agents",
	count: 8,
	delta: 1,
	href: "/admin-center/user-management/agents",
};

export const TEAMS_SUMMARY: EntitySummary = {
	key: "teams",
	label: "Teams",
	count: 5,
	delta: 0,
	href: "/admin-center/user-management/teams",
};

export const PRODUCTS_SUMMARY: EntitySummary = {
	key: "products",
	label: "Products in use",
	count: PRODUCTS.length,
	href: "/admin-center/access-setup/product-access",
};

export type SeatStatus = "ok" | "near-limit" | "overage";

export function seatStatus(seats: SeatsInfo): SeatStatus {
	const usage = seats.used / seats.total;
	if (seats.used > seats.total) return "overage";
	if (usage >= 0.9) return "near-limit";
	return "ok";
}

export function billingDueSoon(billing: BillingInfo): boolean {
	return billing.nextRenewalDaysAway <= 14;
}

export function formatAmount(amount: number, currency: string): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(amount);
}

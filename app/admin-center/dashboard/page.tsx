"use client";

import { useMemo } from "react";
import {
	Alert,
	Box,
	Button,
	Heading,
	Link,
	Text,
} from "@optiaxiom/react";
import {
	IconUser,
	IconRobot,
	IconUserGroup,
	IconPeopleSimple,
	IconGrid,
	IconEnvelopeOpen,
	IconCircleDollar,
	IconArrowRight,
} from "@optiaxiom/icons";

import { USERS } from "../user-management/users/data";
import {
	BILLING,
	SEATS,
	GROUPS_SUMMARY,
	AGENTS_SUMMARY,
	TEAMS_SUMMARY,
	PRODUCTS_SUMMARY,
	seatStatus,
	billingDueSoon,
	formatAmount,
} from "./data";

type StatCardProps = {
	icon: React.ReactNode;
	label: string;
	value: string | number;
	helper?: string;
	href?: string;
};

function StatCard({ icon, label, value, helper, href }: StatCardProps) {
	const inner = (
		<Box
			display="flex"
			flexDirection="column"
			gap="8"
			p="20"
			rounded="md"
			border="1"
			borderColor="border.tertiary"
			bg="bg.default"
			style={{ height: "100%" }}
		>
			<Box display="flex" alignItems="center" justifyContent="space-between">
				<Text fontSize="sm" color="fg.secondary">
					{label}
				</Text>
				<Box
					display="inline-flex"
					alignItems="center"
					justifyContent="center"
					rounded="full"
					bg="bg.accent.subtle"
					color="fg.accent"
					style={{ width: 28, height: 28 }}
				>
					{icon}
				</Box>
			</Box>
			<Heading level="2">{value}</Heading>
			{helper && (
				<Text fontSize="sm" color="fg.tertiary">
					{helper}
				</Text>
			)}
		</Box>
	);
	if (!href) return inner;
	return (
		<Link href={href} style={{ textDecoration: "none", color: "inherit", height: "100%" }}>
			{inner}
		</Link>
	);
}

function SeatUsageBar({ used, total }: { used: number; total: number }) {
	const pct = Math.min(100, Math.round((used / total) * 100));
	const isOver = used > total;
	const fillColor = isOver
		? "var(--ax-colors-fg-error)"
		: pct >= 90
			? "var(--ax-colors-fg-warning)"
			: "var(--ax-colors-fg-accent-strong)";
	return (
		<Box
			rounded="full"
			bg="bg.tertiary"
			style={{ height: 8, width: "100%", overflow: "hidden" }}
		>
			<Box
				style={{
					height: "100%",
					width: `${pct}%`,
					background: fillColor,
					transition: "width 200ms ease",
				}}
			/>
		</Box>
	);
}

export default function AdminCenterDashboardPage() {
	const userStats = useMemo(() => {
		const total = USERS.length;
		const active = USERS.filter((u) => u.activationStatus === "Active").length;
		const pending = USERS.filter((u) => u.activationStatus === "N/A").length;
		const expired = USERS.filter((u) => u.activationStatus === "Password Expired").length;
		return { total, active, pending, expired };
	}, []);

	const seatState = seatStatus(SEATS);
	const seatOverage = SEATS.used - SEATS.total;
	const dueSoon = billingDueSoon(BILLING);

	return (
		<Box>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="24">
				<Box>
					<Heading level="1">Dashboard</Heading>
					<Text color="fg.secondary" fontSize="md">
						Overview of users, access, and billing for your organization.
					</Text>
				</Box>
				<Box display="flex" gap="8">
					<Link href="/admin-center/user-management/users" style={{ textDecoration: "none" }}>
						<Button appearance="default">Manage users</Button>
					</Link>
					<Button appearance="primary">Invite User</Button>
				</Box>
			</Box>

			{(seatState !== "ok" || dueSoon) && (
				<Box display="flex" flexDirection="column" gap="12" mb="24">
					{seatState === "overage" && (
						<Alert intent="danger" rounded="md">
							<Box display="flex" alignItems="center" justifyContent="space-between" w="full" gap="16">
								<Box>
									<Text fontWeight="600">Seat limit exceeded</Text>
									<Text fontSize="sm" color="fg.secondary">
										You are using {SEATS.used} of {SEATS.total} seats ({seatOverage} over your plan limit). Additional seats will be billed at the per-seat rate.
									</Text>
								</Box>
								<Button appearance="primary" size="sm">
									Upgrade plan
								</Button>
							</Box>
						</Alert>
					)}
					{seatState === "near-limit" && (
						<Alert intent="warning" rounded="md">
							<Box display="flex" alignItems="center" justifyContent="space-between" w="full" gap="16">
								<Box>
									<Text fontWeight="600">Approaching seat limit</Text>
									<Text fontSize="sm" color="fg.secondary">
										{SEATS.used} of {SEATS.total} seats in use. Consider upgrading before inviting more users.
									</Text>
								</Box>
								<Button appearance="default" size="sm">
									Review plan
								</Button>
							</Box>
						</Alert>
					)}
					{dueSoon && (
						<Alert intent="information" rounded="md">
							<Box display="flex" alignItems="center" justifyContent="space-between" w="full" gap="16">
								<Box>
									<Text fontWeight="600">Renewal in {BILLING.nextRenewalDaysAway} days</Text>
									<Text fontSize="sm" color="fg.secondary">
										Your {BILLING.plan} plan renews on {BILLING.nextRenewalDate} for {formatAmount(BILLING.amount, BILLING.currency)}.
									</Text>
								</Box>
								<Button appearance="default" size="sm">
									View billing
								</Button>
							</Box>
						</Alert>
					)}
				</Box>
			)}

			<Box mb="32">
				<Heading level="4">At a glance</Heading>
				<Text fontSize="sm" color="fg.secondary" mb="16">
					Live counts across your admin center.
				</Text>
				<Box
					display="grid"
					gap="16"
					style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
				>
					<StatCard
						icon={<IconUser size={14} />}
						label="Total users"
						value={userStats.total}
						helper={`${userStats.active} active`}
						href="/admin-center/user-management/users"
					/>
					<StatCard
						icon={<IconEnvelopeOpen size={14} />}
						label="Pending invitations"
						value={userStats.pending}
						helper="Awaiting activation"
						href="/admin-center/user-management/users"
					/>
					<StatCard
						icon={<IconUserGroup size={14} />}
						label={GROUPS_SUMMARY.label}
						value={GROUPS_SUMMARY.count}
						helper={GROUPS_SUMMARY.delta ? `+${GROUPS_SUMMARY.delta} this month` : undefined}
						href={GROUPS_SUMMARY.href}
					/>
					<StatCard
						icon={<IconRobot size={14} />}
						label={AGENTS_SUMMARY.label}
						value={AGENTS_SUMMARY.count}
						helper={AGENTS_SUMMARY.delta ? `+${AGENTS_SUMMARY.delta} this month` : undefined}
						href={AGENTS_SUMMARY.href}
					/>
					<StatCard
						icon={<IconPeopleSimple size={14} />}
						label={TEAMS_SUMMARY.label}
						value={TEAMS_SUMMARY.count}
						helper="No change this month"
						href={TEAMS_SUMMARY.href}
					/>
					<StatCard
						icon={<IconGrid size={14} />}
						label={PRODUCTS_SUMMARY.label}
						value={PRODUCTS_SUMMARY.count}
						helper="Across your org"
						href={PRODUCTS_SUMMARY.href}
					/>
				</Box>
			</Box>

			<Box
				display="grid"
				gap="16"
				style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}
			>
				<Box
					p="20"
					rounded="md"
					border="1"
					borderColor="border.tertiary"
					bg="bg.default"
				>
					<Box display="flex" alignItems="center" justifyContent="space-between" mb="12">
						<Box display="flex" alignItems="center" gap="8">
							<IconCircleDollar size={14} color="var(--ax-colors-fg-accent)" />
							<Heading level="4">Billing</Heading>
						</Box>
						<Link href="#" fontSize="md">
							View invoices
						</Link>
					</Box>
					<Box
						display="grid"
						gap="12"
						style={{ gridTemplateColumns: "1fr 1fr" }}
					>
						<Box>
							<Text fontSize="sm" color="fg.tertiary">
								Plan
							</Text>
							<Text fontWeight="600">
								{BILLING.plan} · {BILLING.cycle}
							</Text>
						</Box>
						<Box>
							<Text fontSize="sm" color="fg.tertiary">
								Amount
							</Text>
							<Text fontWeight="600">{formatAmount(BILLING.amount, BILLING.currency)}</Text>
						</Box>
						<Box>
							<Text fontSize="sm" color="fg.tertiary">
								Next renewal
							</Text>
							<Text fontWeight="600">{BILLING.nextRenewalDate}</Text>
							<Text fontSize="sm" color={dueSoon ? "fg.warning" : "fg.tertiary"}>
								In {BILLING.nextRenewalDaysAway} days
							</Text>
						</Box>
						<Box>
							<Text fontSize="sm" color="fg.tertiary">
								Payment method
							</Text>
							<Text fontWeight="600">{BILLING.paymentMethod}</Text>
						</Box>
					</Box>
					<Box mt="16" display="flex" gap="8">
						<Button appearance="default" size="sm">
							Update payment
						</Button>
						<Button
							appearance="subtle"
							size="sm"
							addonAfter={<IconArrowRight size={14} />}
						>
							Manage subscription
						</Button>
					</Box>
				</Box>

				<Box
					p="20"
					rounded="md"
					border="1"
					borderColor="border.tertiary"
					bg="bg.default"
				>
					<Box display="flex" alignItems="center" justifyContent="space-between" mb="12">
						<Heading level="4">Seats</Heading>
						<Text
							fontSize="sm"
							color={
								seatState === "overage"
									? "fg.error"
									: seatState === "near-limit"
										? "fg.warning"
										: "fg.tertiary"
							}
							fontWeight="500"
						>
							{seatState === "overage"
								? `${seatOverage} over limit`
								: seatState === "near-limit"
									? "Approaching limit"
									: "Within limit"}
						</Text>
					</Box>
					<Box display="flex" alignItems="end" gap="4" mb="8">
						<Heading level="2">{SEATS.used}</Heading>
						<Text color="fg.tertiary" fontSize="md">
							/ {SEATS.total} seats used
						</Text>
					</Box>
					<SeatUsageBar used={SEATS.used} total={SEATS.total} />
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						mt="16"
					>
						<Box>
							<Text fontSize="sm" color="fg.tertiary">
								Pending invitations
							</Text>
							<Text fontWeight="600">{SEATS.pendingInvites}</Text>
						</Box>
						<Box>
							<Text fontSize="sm" color="fg.tertiary">
								Available
							</Text>
							<Text fontWeight="600">
								{Math.max(0, SEATS.total - SEATS.used)}
							</Text>
						</Box>
						<Box>
							<Text fontSize="sm" color="fg.tertiary">
								Password expired
							</Text>
							<Text fontWeight="600">{userStats.expired}</Text>
						</Box>
					</Box>
					{seatState !== "ok" && (
						<Box mt="16">
							<Button appearance="primary" size="sm">
								{seatState === "overage" ? "Upgrade plan" : "Add seats"}
							</Button>
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
}

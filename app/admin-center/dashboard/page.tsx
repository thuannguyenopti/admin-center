"use client";

import { useMemo, useState } from "react";
import {
	Badge,
	Box,
	Button,
	Heading,
	Link,
	Text,
} from "@optiaxiom/react";
import {
	IconUser,
	IconRobot,
	IconGrid,
	IconEnvelopeOpen,
	IconCircleDollar,
	IconArrowRight,
	IconUsers,
	IconWavePulse,
	IconChartColumn,
	IconBell,
} from "@optiaxiom/icons";

import {
	NotificationsPanel,
	UNREAD_NOTIFICATION_COUNT,
} from "./components/NotificationsPanel";

import { USERS } from "../user-management/users/data";
import {
	BILLING,
	SEATS,
	AGENTS_SUMMARY,
	PRODUCTS_SUMMARY,
} from "./data";

type StatCardProps = {
	icon: React.ReactNode;
	label: string;
	value: string | number;
	helper?: React.ReactNode;
	href?: string;
	extra?: React.ReactNode;
};

function ProgressBar({ pct }: { pct: number }) {
	const capped = Math.min(100, pct);
	return (
		<Box
			rounded="full"
			bg="bg.tertiary"
			style={{ height: 8, width: "100%", overflow: "hidden" }}
		>
			<Box
				style={{
					height: "100%",
					width: `${capped}%`,
					background:
						pct >= 95
							? "var(--ax-colors-fg-error)"
							: pct >= 80
								? "var(--ax-colors-fg-warning)"
								: "var(--ax-colors-fg-accent-strong)",
					transition: "width 200ms ease",
				}}
			/>
		</Box>
	);
}

function StatCard({ icon, label, value, helper, href, extra }: StatCardProps) {
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
			{extra}
		</Box>
	);
	if (!href) return inner;
	return (
		<Link href={href} style={{ textDecoration: "none", color: "inherit", height: "100%" }}>
			{inner}
		</Link>
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

	const [notifPanelOpen, setNotifPanelOpen] = useState(false);

	return (
		<Box>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="24">
				<Box>
					<Heading level="2">Dashboard</Heading>
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

			<Box
				onClick={() => setNotifPanelOpen(true)}
				cursor="pointer"
				display="flex"
				alignItems="center"
				gap="12"
				p="16"
				mb="24"
				rounded="md"
				border="1"
				borderColor="border.tertiary"
				bg="bg.default"
			>
				<Box
					display="inline-flex"
					alignItems="center"
					justifyContent="center"
					rounded="full"
					style={{
						width: 36,
						height: 36,
						flexShrink: 0,
						position: "relative",
						backgroundColor: "rgba(255, 93, 82, 0.16)",
						color: "rgba(143, 71, 100, 1)",
					}}
				>
					<IconBell size={18} />
					{UNREAD_NOTIFICATION_COUNT > 0 && (
						<Box
							rounded="full"
							display="flex"
							alignItems="center"
							justifyContent="center"
							style={{
								position: "absolute",
								top: -4,
								right: -4,
								minWidth: 18,
								height: 18,
								padding: "0 5px",
								background: "var(--ax-colors-fg-error)",
								color: "var(--ax-colors-fg-white)",
								fontSize: 10,
								fontWeight: 700,
								lineHeight: "18px",
								border: "2px solid var(--ax-colors-bg-default)",
								boxShadow: "0 0 0 0 var(--ax-colors-fg-error)",
								animation: "noti-pulse 1.8s ease-out infinite",
							}}
							aria-label={`${UNREAD_NOTIFICATION_COUNT} unread`}
						>
							{UNREAD_NOTIFICATION_COUNT > 9
								? "9+"
								: UNREAD_NOTIFICATION_COUNT}
						</Box>
					)}
				</Box>
				<style>{`
					@keyframes noti-pulse {
						0%   { box-shadow: 0 0 0 0   rgba(217, 45, 32, 0.5); }
						70%  { box-shadow: 0 0 0 8px rgba(217, 45, 32, 0);   }
						100% { box-shadow: 0 0 0 0   rgba(217, 45, 32, 0);   }
					}
				`}</style>
				<Box flex="1">
					<Text fontWeight="600">
						{UNREAD_NOTIFICATION_COUNT > 0
							? `${UNREAD_NOTIFICATION_COUNT} new notification${UNREAD_NOTIFICATION_COUNT === 1 ? "" : "s"}`
							: "You're all caught up"}
					</Text>
					<Text fontSize="sm" color="fg.tertiary">
						{UNREAD_NOTIFICATION_COUNT > 0
							? "Click to view recent activity."
							: "No new notifications."}
					</Text>
				</Box>
				<IconArrowRight
					size={16}
					color="var(--ax-colors-fg-tertiary)"
				/>
			</Box>

			<Box mb="32">
				<Heading level="4">Organization Overview</Heading>
				<Text fontSize="sm" color="fg.secondary" mb="16">
					Live counts across your admin center.
				</Text>
				<Box
					display="grid"
					gap="16"
					style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
				>
					<StatCard
						icon={<IconUser size={14} />}
						label="Users"
						value={userStats.total}
						helper={`${userStats.active} active`}
						href="/admin-center/user-management/users"
					/>
					<StatCard
						icon={<IconEnvelopeOpen size={14} />}
						label="Pending Invites"
						value={userStats.pending}
						helper="Awaiting activation"
						href="/admin-center/user-management/users"
					/>
					<StatCard
						icon={<IconRobot size={14} />}
						label={AGENTS_SUMMARY.label}
						value={AGENTS_SUMMARY.count}
						helper={
							AGENTS_SUMMARY.delta
								? `+${AGENTS_SUMMARY.delta} this month`
								: undefined
						}
						href={AGENTS_SUMMARY.href}
					/>
					<StatCard
						icon={<IconGrid size={14} />}
						label="Products"
						value={PRODUCTS_SUMMARY.count}
						helper="Across your org"
						href="/admin-center/access-setup/product-access"
					/>
				</Box>
			</Box>

			<Box mb="32">
				<Heading level="4">Subscription & Usage</Heading>
				<Text fontSize="sm" color="fg.secondary" mb="16">
					Click any card to view full usage & billing details.
				</Text>
				<Box
					display="grid"
					gap="16"
					style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
				>
					<StatCard
						icon={<IconChartColumn size={14} />}
						label="Opal credits"
						value="8.2K / 15K"
						helper="+5% WoW"
						href="/admin-center/settings/usage-billing"
						extra={<ProgressBar pct={Math.round((8200 / 15000) * 100)} />}
					/>
					<StatCard
						icon={<IconWavePulse size={14} />}
						label="MAU"
						value="50K / 100K"
						helper="+12% MoM"
						href="/admin-center/settings/usage-billing"
						extra={<ProgressBar pct={Math.round((50000 / 100000) * 100)} />}
					/>
					<StatCard
						icon={<IconUsers size={14} />}
						label="Seats"
						value={`${SEATS.used} / ${SEATS.total}`}
						helper={`${SEATS.used} of ${SEATS.total} seats used`}
						href="/admin-center/settings/usage-billing"
						extra={
							<Box display="flex" flexDirection="column" gap="6">
								<ProgressBar
									pct={Math.round((SEATS.used / SEATS.total) * 100)}
								/>
								{SEATS.used > SEATS.total && (
									<Text fontSize="sm" color="fg.error">
										{SEATS.used - SEATS.total} over limit
									</Text>
								)}
							</Box>
						}
					/>
					<StatCard
						icon={<IconCircleDollar size={14} />}
						label="Plan"
						value={BILLING.plan}
						helper={`${BILLING.cycle} · Renews ${BILLING.nextRenewalDate}`}
						href="/admin-center/settings/usage-billing"
						extra={
							<Box>
								<Badge intent="success" variant="strong">
									Active
								</Badge>
							</Box>
						}
					/>
				</Box>
			</Box>

			<NotificationsPanel
				open={notifPanelOpen}
				onClose={() => setNotifPanelOpen(false)}
			/>
		</Box>
	);
}

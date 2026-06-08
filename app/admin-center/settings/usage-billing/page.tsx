"use client";

import { useState, useMemo } from "react";
import {
	Badge,
	Box,
	Button,
	Heading,
	Link,
	Menu,
	MenuContent,
	MenuTrigger,
	LabelMenuButton,
	Text,
} from "@optiaxiom/react";
import {
	IconDownload,
	IconCircleDollar,
	IconUsers,
	IconWavePulse,
	IconChartColumn,
} from "@optiaxiom/icons";

import { Table, Tr, Th, Td } from "@/app/components/Table";
import { PRODUCTS, INSTANCES } from "../../user-management/users/data";

type Tab =
	| "All"
	| "Experimentation"
	| "CMP"
	| "CMS"
	| "Collaboration"
	| "Opal";

const TABS: Tab[] = ["All", "Experimentation", "CMP", "CMS", "Collaboration", "Opal"];

type StatCardProps = {
	icon: React.ReactNode;
	label: string;
	value: string;
	helper?: React.ReactNode;
	extra?: React.ReactNode;
};

function StatCard({ icon, label, value, helper, extra }: StatCardProps) {
	return (
		<Box
			p="16"
			rounded="md"
			border="1"
			borderColor="border.tertiary"
			bg="bg.default"
			display="flex"
			flexDirection="column"
			gap="8"
			style={{ height: "100%" }}
		>
			<Box display="flex" alignItems="center" gap="8">
				<Box
					display="inline-flex"
					alignItems="center"
					justifyContent="center"
					color="fg.tertiary"
					style={{ width: 20, height: 20 }}
				>
					{icon}
				</Box>
				<Text fontSize="sm" color="fg.tertiary">
					{label}
				</Text>
			</Box>
			<Heading level="2">{value}</Heading>
			{helper ? (
				<Text fontSize="sm" color="fg.tertiary">
					{helper}
				</Text>
			) : null}
			{extra}
		</Box>
	);
}

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

type SeatRow = {
	product: string;
	instance: string;
	total: number;
	used: number;
};

const SEAT_ROWS: SeatRow[] = [
	{ product: "CMS", instance: "Production", total: 12, used: 11 },
	{ product: "CMS", instance: "Sandbox", total: 8, used: 5 },
	{ product: "CMP", instance: "Production", total: 10, used: 9 },
	{ product: "Opal", instance: "Production", total: 15, used: 12 },
	{ product: "Web Experimentation", instance: "Production", total: 6, used: 4 },
	{ product: "Frontend Hosting", instance: "Staging", total: 5, used: 2 },
];

type Invoice = {
	id: string;
	number: string;
	date: string;
	amount: string;
	status: "Paid" | "Pending" | "Overdue";
};

const INVOICES: Invoice[] = [
	{ id: "i1", number: "INV-2026-006", date: "May 03, 2026", amount: "$18,000", status: "Pending" },
	{ id: "i2", number: "INV-2026-005", date: "Apr 03, 2026", amount: "$18,000", status: "Paid" },
	{ id: "i3", number: "INV-2026-004", date: "Mar 03, 2026", amount: "$18,000", status: "Paid" },
	{ id: "i4", number: "INV-2026-003", date: "Feb 03, 2026", amount: "$2,400", status: "Overdue" },
	{ id: "i5", number: "INV-2026-002", date: "Jan 03, 2026", amount: "$18,000", status: "Paid" },
	{ id: "i6", number: "INV-2025-012", date: "Dec 03, 2025", amount: "$18,000", status: "Paid" },
];

const TAB_SEATS: Record<Tab, { instance: string; used: number; total: number }[]> = {
	All: SEAT_ROWS.map((r) => ({ instance: `${r.product} · ${r.instance}`, used: r.used, total: r.total })),
	Experimentation: [{ instance: "Production", used: 4, total: 6 }],
	CMP: [{ instance: "Production", used: 9, total: 10 }],
	CMS: [
		{ instance: "Production", used: 11, total: 12 },
		{ instance: "Sandbox", used: 5, total: 8 },
	],
	Collaboration: [{ instance: "Production", used: 7, total: 10 }],
	Opal: [{ instance: "Production", used: 12, total: 15 }],
};

function FilterDropdown({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: string;
	options: readonly string[];
	onChange: (v: string) => void;
}) {
	return (
		<Menu
			options={options.map((opt) => ({
				label: opt,
				execute: () => onChange(opt),
			}))}
		>
			<MenuTrigger asChild>
				<LabelMenuButton label={label}>{value}</LabelMenuButton>
			</MenuTrigger>
			<MenuContent />
		</Menu>
	);
}

function GaugeCard({
	icon,
	label,
	used,
	total,
	unit,
	trend,
}: {
	icon: React.ReactNode;
	label: string;
	used: number;
	total: number;
	unit: string;
	trend: string;
}) {
	const pct = Math.round((used / total) * 100);
	const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`);
	return (
		<Box
			p="16"
			rounded="md"
			border="1"
			borderColor="border.tertiary"
			bg="bg.default"
			display="flex"
			flexDirection="column"
			gap="12"
		>
			<Box display="flex" alignItems="center" gap="8">
				<Box
					display="inline-flex"
					alignItems="center"
					justifyContent="center"
					color="fg.tertiary"
					style={{ width: 20, height: 20 }}
				>
					{icon}
				</Box>
				<Text fontSize="sm" color="fg.tertiary">
					{label}
				</Text>
			</Box>
			<Box display="flex" alignItems="end" justifyContent="space-between" gap="8">
				<Heading level="2">
					{fmt(used)} {unit}
				</Heading>
				<Text fontSize="sm" color="fg.tertiary">
					of {fmt(total)} {unit} ({pct}%)
				</Text>
			</Box>
			<ProgressBar pct={pct} />
			<Text fontSize="sm" color="fg.tertiary">
				{trend}
			</Text>
		</Box>
	);
}

export default function UsageBillingPage() {
	const [activeTab, setActiveTab] = useState<Tab>("All");
	const [dateRange, setDateRange] = useState("Last 12 months");
	const [statusFilter, setStatusFilter] = useState("All");

	const filteredInvoices = useMemo(
		() => (statusFilter === "All" ? INVOICES : INVOICES.filter((i) => i.status === statusFilter)),
		[statusFilter],
	);

	const SEAT_USED = 28;
	const SEAT_TOTAL = 25;
	const seatPct = Math.round((SEAT_USED / SEAT_TOTAL) * 100);

	return (
		<Box>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
				<Box display="flex" alignItems="center" gap="12">
					<Heading level="2">Usage & Billing</Heading>
					<Link href="#" fontSize="md">
						Learn more
					</Link>
				</Box>
			</Box>

			{/* Section 1 — Summary cards */}
			<Box mb="32">
				<Box
					display="grid"
					gap="16"
					style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
				>
					<StatCard
						icon={<IconChartColumn size={16} />}
						label="Opal credits"
						value="8.2K / 15K"
						helper="+5% WoW"
						extra={<ProgressBar pct={Math.round((8200 / 15000) * 100)} />}
					/>
					<StatCard
						icon={<IconWavePulse size={16} />}
						label="MAU"
						value="50K / 100K"
						helper="+12% MoM"
						extra={<ProgressBar pct={Math.round((50000 / 100000) * 100)} />}
					/>
					<StatCard
						icon={<IconUsers size={16} />}
						label="Seats"
						value={`${SEAT_USED} / ${SEAT_TOTAL}`}
						helper={`${SEAT_USED} of ${SEAT_TOTAL} seats used`}
						extra={
							<Box display="flex" flexDirection="column" gap="6">
								<ProgressBar pct={seatPct} />
								<Text fontSize="sm" color="fg.error">
									3 over limit
								</Text>
							</Box>
						}
					/>
					<StatCard
						icon={<IconCircleDollar size={16} />}
						label="Plan"
						value="Growth"
						helper="Annual · Renews Jun 03, 2026"
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

			{/* Section 2 — Usage by product */}
			<Box mb="32">
				<Heading level="4">Usage by product</Heading>
				<Box
					display="flex"
					gap="24"
					borderB="1"
					borderColor="border.tertiary"
					mt="12"
					mb="16"
				>
					{TABS.map((tab) => (
						<Box
							key={tab}
							pb="12"
							cursor="pointer"
							borderB={activeTab === tab ? "2" : "0"}
							onClick={() => setActiveTab(tab)}
							style={
								activeTab === tab
									? { borderBottomColor: "var(--ax-colors-fg-default)" }
									: {}
							}
						>
							<Text
								fontWeight={activeTab === tab ? "500" : "400"}
								color={activeTab === tab ? "fg.default" : "fg.tertiary"}
							>
								{tab}
							</Text>
						</Box>
					))}
				</Box>

				{activeTab === "All" ? (
					<Box
						display="grid"
						gap="16"
						mb="16"
						style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}
					>
						<GaugeCard
							icon={<IconWavePulse size={16} />}
							label="Monthly active users"
							used={50000}
							total={100000}
							unit="MAU"
							trend="+12% MoM"
						/>
						<GaugeCard
							icon={<IconChartColumn size={16} />}
							label="Opal credits"
							used={8200}
							total={15000}
							unit="credits"
							trend="+5% WoW"
						/>
					</Box>
				) : (
					<Box mb="16">
						<Text fontSize="sm" color="fg.tertiary">
							Usage details for {activeTab}.
						</Text>
					</Box>
				)}

				<Table>
					<thead>
						<Tr>
							<Th>Instance</Th>
							<Th>Seats Used</Th>
							<Th>Seats Allotted</Th>
						</Tr>
					</thead>
					<tbody>
						{TAB_SEATS[activeTab].map((row, i) => (
							<Tr key={i}>
								<Td>{row.instance}</Td>
								<Td>{row.used}</Td>
								<Td>{row.total}</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			</Box>

			{/* Section 3 — Seat detail */}
			<Box mb="32">
				<Heading level="4">Seat detail</Heading>
				<Box mt="12">
					<Table>
						<thead>
							<Tr>
								<Th>Product</Th>
								<Th>Instance</Th>
								<Th>Total Seats</Th>
								<Th>Used</Th>
								<Th>Available</Th>
								<Th>Utilization</Th>
							</Tr>
						</thead>
						<tbody>
							{SEAT_ROWS.map((r, i) => {
								const pct = Math.round((r.used / r.total) * 100);
								return (
									<Tr key={i}>
										<Td>{r.product}</Td>
										<Td>{r.instance}</Td>
										<Td>{r.total}</Td>
										<Td>{r.used}</Td>
										<Td>{Math.max(0, r.total - r.used)}</Td>
										<Td>
											<Box
												display="flex"
												alignItems="center"
												gap="8"
												style={{ minWidth: 160 }}
											>
												<Box style={{ flex: 1 }}>
													<ProgressBar pct={pct} />
												</Box>
												<Text fontSize="sm" color="fg.tertiary">
													{pct}%
												</Text>
											</Box>
										</Td>
									</Tr>
								);
							})}
						</tbody>
					</Table>
				</Box>
			</Box>

			{/* Section 4 — Invoices */}
			<Box mb="32">
				<Heading level="4">Invoices</Heading>
				<Box display="flex" alignItems="center" gap="8" mt="12" mb="16">
					<FilterDropdown
						label="Date range"
						value={dateRange}
						options={["Last 30 days", "Last 90 days", "Last 12 months", "All time"]}
						onChange={setDateRange}
					/>
					<FilterDropdown
						label="Status"
						value={statusFilter}
						options={["All", "Paid", "Pending", "Overdue"]}
						onChange={setStatusFilter}
					/>
				</Box>
				<Table>
					<thead>
						<Tr>
							<Th>Invoice #</Th>
							<Th>Date</Th>
							<Th>Amount</Th>
							<Th>Status</Th>
							<Th style={{ width: 120 }}>Download</Th>
						</Tr>
					</thead>
					<tbody>
						{filteredInvoices.map((inv) => (
							<Tr key={inv.id}>
								<Td type="raw">
									<Link href="#">{inv.number}</Link>
								</Td>
								<Td>{inv.date}</Td>
								<Td>{inv.amount}</Td>
								<Td type="raw">
									<Badge
										intent={
											inv.status === "Paid"
												? "success"
												: inv.status === "Pending"
													? "warning"
													: "danger"
										}
										variant="subtle"
									>
										{inv.status}
									</Badge>
								</Td>
								<Td type="raw">
									<Button
										appearance="subtle"
										size="sm"
										icon={<IconDownload size={14} />}
										aria-label={`Download ${inv.number}`}
									/>
								</Td>
							</Tr>
						))}
					</tbody>
				</Table>
				{/* keep PRODUCTS / INSTANCES imports referenced for type completeness */}
				<Box display="none">
					{PRODUCTS.length}
					{INSTANCES.length}
				</Box>
			</Box>
		</Box>
	);
}

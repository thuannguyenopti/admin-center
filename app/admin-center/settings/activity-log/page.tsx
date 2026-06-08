"use client";

import React, { useState, useMemo } from "react";
import {
	Box,
	Button,
	Heading,
	Link,
	Menu,
	MenuContent,
	MenuTrigger,
	LabelMenuButton,
	Pagination,
	SearchInput,
	Text,
} from "@optiaxiom/react";
import { IconDownload } from "@optiaxiom/icons";

import { Table, Tr, Th, Td } from "@/app/components/Table";

const PAGE_SIZE = 10;

const ACTION_TYPES = [
	"User invited",
	"User deleted",
	"Role changed",
	"SSO enabled",
	"Group created",
	"Login",
	"Logout",
] as const;

type ActionType = (typeof ACTION_TYPES)[number];

type LogEntry = {
	id: string;
	timestamp: string;
	actorName: string;
	actorEmail: string;
	action: ActionType;
	resource: string;
	details: string;
	ip: string;
	resourceType: "User" | "Role" | "Group" | "Setting" | "Session";
};

const ENTRIES: LogEntry[] = [
	{
		id: "l1",
		timestamp: "2 min ago",
		actorName: "Ada Lovelace",
		actorEmail: "ada@optimizely.com",
		action: "User invited",
		resource: "tom.curtis@acme.com",
		details: "Invited as Editor on CMS Production",
		ip: "10.0.4.21",
		resourceType: "User",
	},
	{
		id: "l2",
		timestamp: "14 min ago",
		actorName: "Grace Hopper",
		actorEmail: "grace@optimizely.com",
		action: "Role changed",
		resource: "alex.kim@acme.com",
		details: "Role changed from Viewer to Editor",
		ip: "10.0.4.55",
		resourceType: "Role",
	},
	{
		id: "l3",
		timestamp: "1 hour ago",
		actorName: "Alan Turing",
		actorEmail: "alan@optimizely.com",
		action: "Group created",
		resource: "marketing-leads",
		details: "Group created with 4 members",
		ip: "10.0.4.10",
		resourceType: "Group",
	},
	{
		id: "l4",
		timestamp: "3 hours ago",
		actorName: "Margaret Hamilton",
		actorEmail: "margaret@optimizely.com",
		action: "SSO enabled",
		resource: "Okta IdP",
		details: "SSO configured against Okta",
		ip: "10.0.4.11",
		resourceType: "Setting",
	},
	{
		id: "l5",
		timestamp: "5 hours ago",
		actorName: "Linus Torvalds",
		actorEmail: "linus@optimizely.com",
		action: "Login",
		resource: "Session #88231",
		details: "Successful sign-in via SSO",
		ip: "10.0.4.92",
		resourceType: "Session",
	},
	{
		id: "l6",
		timestamp: "Yesterday, 16:42",
		actorName: "Ada Lovelace",
		actorEmail: "ada@optimizely.com",
		action: "User deleted",
		resource: "old.user@acme.com",
		details: "User and all sessions removed",
		ip: "10.0.4.21",
		resourceType: "User",
	},
	{
		id: "l7",
		timestamp: "Yesterday, 11:08",
		actorName: "Brendan Eich",
		actorEmail: "brendan@optimizely.com",
		action: "Logout",
		resource: "Session #88102",
		details: "Manual sign-out",
		ip: "10.0.4.32",
		resourceType: "Session",
	},
	{
		id: "l8",
		timestamp: "May 30, 2026, 09:20",
		actorName: "Grace Hopper",
		actorEmail: "grace@optimizely.com",
		action: "User invited",
		resource: "rita.li@acme.com",
		details: "Invited as Admin on Opal",
		ip: "10.0.4.55",
		resourceType: "User",
	},
	{
		id: "l9",
		timestamp: "May 29, 2026, 14:12",
		actorName: "Alan Turing",
		actorEmail: "alan@optimizely.com",
		action: "Role changed",
		resource: "priya.s@acme.com",
		details: "Promoted to Owner",
		ip: "10.0.4.10",
		resourceType: "Role",
	},
	{
		id: "l10",
		timestamp: "May 29, 2026, 08:45",
		actorName: "Margaret Hamilton",
		actorEmail: "margaret@optimizely.com",
		action: "Group created",
		resource: "release-managers",
		details: "Group created with 2 members",
		ip: "10.0.4.11",
		resourceType: "Group",
	},
	{
		id: "l11",
		timestamp: "May 28, 2026, 17:01",
		actorName: "Linus Torvalds",
		actorEmail: "linus@optimizely.com",
		action: "Login",
		resource: "Session #87990",
		details: "Successful sign-in via SSO",
		ip: "10.0.4.92",
		resourceType: "Session",
	},
	{
		id: "l12",
		timestamp: "May 28, 2026, 09:33",
		actorName: "Ada Lovelace",
		actorEmail: "ada@optimizely.com",
		action: "SSO enabled",
		resource: "Azure AD",
		details: "Secondary IdP added",
		ip: "10.0.4.21",
		resourceType: "Setting",
	},
	{
		id: "l13",
		timestamp: "May 27, 2026, 13:54",
		actorName: "Grace Hopper",
		actorEmail: "grace@optimizely.com",
		action: "User invited",
		resource: "noor.k@acme.com",
		details: "Invited as Contributor on CMP",
		ip: "10.0.4.55",
		resourceType: "User",
	},
	{
		id: "l14",
		timestamp: "May 27, 2026, 10:12",
		actorName: "Brendan Eich",
		actorEmail: "brendan@optimizely.com",
		action: "Logout",
		resource: "Session #87811",
		details: "Idle session expired",
		ip: "10.0.4.32",
		resourceType: "Session",
	},
	{
		id: "l15",
		timestamp: "May 26, 2026, 18:09",
		actorName: "Alan Turing",
		actorEmail: "alan@optimizely.com",
		action: "User deleted",
		resource: "stale.user@acme.com",
		details: "Quarterly access review cleanup",
		ip: "10.0.4.10",
		resourceType: "User",
	},
];

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
	const items = ["All", ...options];
	return (
		<Menu
			options={items.map((opt) => ({
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

export default function ActivityLogPage() {
	const [search, setSearch] = useState("");
	const [dateRange, setDateRange] = useState("All");
	const [actionType, setActionType] = useState("All");
	const [resourceType, setResourceType] = useState("All");
	const [expanded, setExpanded] = useState<Set<string>>(new Set());
	const [page, setPage] = useState(1);

	const activeFilters =
		(dateRange !== "All" ? 1 : 0) +
		(actionType !== "All" ? 1 : 0) +
		(resourceType !== "All" ? 1 : 0);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return ENTRIES.filter((e) => {
			if (actionType !== "All" && e.action !== actionType) return false;
			if (resourceType !== "All" && e.resourceType !== resourceType) return false;
			if (
				q &&
				!e.actorName.toLowerCase().includes(q) &&
				!e.actorEmail.toLowerCase().includes(q) &&
				!e.resource.toLowerCase().includes(q)
			)
				return false;
			return true;
		});
	}, [search, actionType, resourceType]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

	const toggleExpand = (id: string) =>
		setExpanded((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});

	const clearFilters = () => {
		setDateRange("All");
		setActionType("All");
		setResourceType("All");
		setPage(1);
	};

	return (
		<Box>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
				<Box display="flex" alignItems="center" gap="12">
					<Heading level="2">Activity Log</Heading>
					<Link href="#" fontSize="md">
						Learn more
					</Link>
				</Box>
				<Box display="flex" alignItems="center" gap="8">
					<Button appearance="default" addonBefore={<IconDownload size={16} />}>
						Export
					</Button>
				</Box>
			</Box>

			<Box display="flex" alignItems="center" gap="8" mb="16" flexWrap="wrap">
				<Box style={{ width: 280 }}>
					<SearchInput
						size="lg"
						placeholder="Search actor or resource"
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
					/>
				</Box>
				<FilterDropdown
					label="Date range"
					value={dateRange}
					options={["Last 24 hours", "Last 7 days", "Last 30 days", "Last 90 days"]}
					onChange={(v) => {
						setDateRange(v);
						setPage(1);
					}}
				/>
				<FilterDropdown
					label="Action type"
					value={actionType}
					options={ACTION_TYPES}
					onChange={(v) => {
						setActionType(v);
						setPage(1);
					}}
				/>
				<FilterDropdown
					label="Resource type"
					value={resourceType}
					options={["User", "Role", "Group", "Setting", "Session"]}
					onChange={(v) => {
						setResourceType(v);
						setPage(1);
					}}
				/>
				{activeFilters > 0 ? (
					<Link
						href="#"
						fontSize="md"
						onClick={(e) => {
							e.preventDefault();
							clearFilters();
						}}
					>
						Clear filters
					</Link>
				) : null}
			</Box>

			<Table>
				<thead>
					<Tr>
						<Th>Timestamp</Th>
						<Th>Actor</Th>
						<Th>Action</Th>
						<Th>Resource</Th>
						<Th>Details</Th>
						<Th>IP Address</Th>
					</Tr>
				</thead>
				<tbody>
					{pageRows.length === 0 ? (
						<tr>
							<td colSpan={6}>
								<Box p="32" textAlign="center">
									<Text color="fg.tertiary">No activity matches the current filters.</Text>
								</Box>
							</td>
						</tr>
					) : (
						pageRows.map((e) => {
							const isOpen = expanded.has(e.id);
							const diffText = `{
  "action": "${e.action}",
  "resource": "${e.resource}",
  "before": ${e.action === "Role changed" ? '"Viewer"' : "null"},
  "after": ${e.action === "Role changed" ? '"Editor"' : `"${e.resourceType}"`},
  "actor": "${e.actorEmail}",
  "ip": "${e.ip}"
}`;
							return (
								<React.Fragment key={e.id}>
									<Tr onClick={() => toggleExpand(e.id)} style={{ cursor: "pointer" }}>
										<Td>{e.timestamp}</Td>
										<Td type="raw">
											<Box display="flex" flexDirection="column">
												<Text fontSize="md" color="fg.default">
													{e.actorName}
												</Text>
												<Text fontSize="sm" color="fg.tertiary">
													{e.actorEmail}
												</Text>
											</Box>
										</Td>
										<Td>{e.action}</Td>
										<Td>{e.resource}</Td>
										<Td>{e.details}</Td>
										<Td>{e.ip}</Td>
									</Tr>
									{isOpen ? (
										<tr>
											<td colSpan={6}>
												<Box p="16">
													<Box bg="bg.secondary" p="16" rounded="md">
														<Text asChild fontFamily="mono" fontSize="sm">
															<pre style={{ whiteSpace: "pre", margin: 0 }}>
																{diffText}
															</pre>
														</Text>
													</Box>
												</Box>
											</td>
										</tr>
									) : null}
								</React.Fragment>
							);
						})
					)}
				</tbody>
			</Table>

			<Box display="flex" justifyContent="center" mt="16">
				<Pagination page={safePage} total={totalPages} onPageChange={setPage} />
			</Box>
		</Box>
	);
}

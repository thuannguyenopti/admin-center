"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
	Avatar,
	Badge,
	Box,
	Button,
	Checkbox,
	EllipsisMenuButton,
	Heading,
	LabelMenuButton,
	Link,
	Menu,
	MenuContent,
	MenuTrigger,
	Pagination,
	SearchInput,
	Text,
	Tooltip,
	AlertDialog,
	AlertDialogAction,
	AlertDialogBody,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
} from "@optiaxiom/react";
import {
	IconAngleDown,
	IconAngleRight,
	IconCircleInfo,
	IconPen,
	IconTrashCan,
	IconXmark,
} from "@optiaxiom/icons";

import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
	INSTANCES,
	PRODUCTS,
	PROJECTS,
	ROLES,
} from "../users/data";

const PAGE_SIZE = 10;
const PANEL_WIDTH = 700;

type AgentStatus = "Active" | "Paused" | "Deprovisioned";
type AgentCategory = "Personal" | "Team" | "Public";

type AgentAccess = {
	product: string;
	instances: { name: string; role: string }[];
};

type Agent = {
	id: string;
	firstName: string;
	agentName: string;
	email: string;
	product: string;
	category: AgentCategory;
	createdBy: string;
	createdDate: string;
	updatedDate: string;
	lastActive: string;
	status: AgentStatus;
	productAccess: AgentAccess[];
};

const AGENTS: Agent[] = [
	{
		id: "a-001",
		firstName: "Atlas",
		agentName: "Atlas Research",
		email: "atlas.research@agents.optimizely.com",
		product: "Opal",
		createdBy: "Liam Smith",
		category: "Public",
		createdDate: "Feb 12, 2026",
		updatedDate: "May 22, 2026",
		lastActive: "May 21, 2026",
		status: "Active",
		productAccess: [
			{ product: "Opal", instances: [{ name: "Production", role: "Admin" }, { name: "Sandbox", role: "Editor" }] },
			{ product: "CMS", instances: [{ name: "Production", role: "Viewer" }] },
		],
	},
	{
		id: "a-002",
		firstName: "Nova",
		agentName: "Nova Insights",
		email: "nova.insights@agents.optimizely.com",
		product: "CMP",
		createdBy: "Emma Johnson",
		category: "Team",
		createdDate: "Jan 30, 2026",
		updatedDate: "May 20, 2026",
		lastActive: "May 20, 2026",
		status: "Active",
		productAccess: [
			{ product: "CMP", instances: [{ name: "Production", role: "Editor" }] },
		],
	},
	{
		id: "a-003",
		firstName: "Orion",
		agentName: "Orion Content",
		email: "orion.content@agents.optimizely.com",
		product: "CMS",
		createdBy: "Noah Williams",
		category: "Personal",
		createdDate: "Mar 04, 2026",
		updatedDate: "May 19, 2026",
		lastActive: "May 19, 2026",
		status: "Active",
		productAccess: [
			{ product: "CMS", instances: [{ name: "Production", role: "Contributor" }, { name: "Staging", role: "Editor" }] },
		],
	},
	{
		id: "a-004",
		firstName: "Sage",
		agentName: "Sage Reviewer",
		email: "sage.reviewer@agents.optimizely.com",
		product: "Opal",
		createdBy: "Olivia Jones",
		category: "Personal",
		createdDate: "Mar 18, 2026",
		updatedDate: "May 18, 2026",
		lastActive: "May 18, 2026",
		status: "Paused",
		productAccess: [	
			{ product: "Opal", instances: [{ name: "Sandbox", role: "Approver" }] },
		],
	},
	{
		id: "a-005",
		firstName: "Echo",
		agentName: "Echo Personalize",
		email: "echo.personalize@agents.optimizely.com",
		product: "Web Experimentation",
		createdBy: "Ava Brown",
		category: "Team",
		createdDate: "Apr 02, 2026",
		updatedDate: "May 21, 2026",
		lastActive: "May 21, 2026",
		status: "Active",
		productAccess: [
			{ product: "Web Experimentation", instances: [{ name: "Production", role: "Owner" }] },
		],
	},
	{
		id: "a-006",
		firstName: "Vega",
		agentName: "Vega Translate",
		email: "vega.translate@agents.optimizely.com",
		product: "CMP",
		createdBy: "Ethan Davis",
		category: "Public",
		createdDate: "Apr 15, 2026",
		updatedDate: "May 17, 2026",
		lastActive: "May 17, 2026",
		status: "Active",
		productAccess: [
			{ product: "CMP", instances: [{ name: "Production", role: "Editor" }, { name: "Development", role: "Contributor" }] },
		],
	},
	{
		id: "a-007",
		firstName: "Lyra",
		agentName: "Lyra SEO",
		email: "lyra.seo@agents.optimizely.com",
		product: "CMS",
		createdBy: "Sophia Miller",
		category: "Team",
		createdDate: "Apr 28, 2026",
		updatedDate: "May 20, 2026",
		lastActive: "May 20, 2026",
		status: "Paused",
		productAccess: [
			{ product: "CMS", instances: [{ name: "Production", role: "Editor" }] },
			{ product: "CMP", instances: [{ name: "Production", role: "Viewer" }] },
		],
	},
	{
		id: "a-008",
		firstName: "Cypher",
		agentName: "Cypher Compliance",
		email: "cypher.compliance@agents.optimizely.com",
		product: "Connect Platform",
		createdBy: "Mason Wilson",
		category: "Public",
		createdDate: "May 02, 2026",
		updatedDate: "May 19, 2026",
		lastActive: "May 19, 2026",
		status: "Deprovisioned",
		productAccess: [
			{ product: "Connect Platform", instances: [{ name: "Production", role: "Admin" }] },
		],
	},
	{
		id: "a-009",
		firstName: "Iris",
		agentName: "Iris Analytics",
		email: "iris.analytics@agents.optimizely.com",
		product: "Web Experimentation",
		createdBy: "Isabella Moore",
		category: "Team",
		createdDate: "May 06, 2026",
		updatedDate: "May 21, 2026",
		lastActive: "May 21, 2026",
		status: "Active",
		productAccess: [
			{ product: "Web Experimentation", instances: [{ name: "Production", role: "Editor" }, { name: "Staging", role: "Viewer" }] },
		],
	},
	{
		id: "a-010",
		firstName: "Drift",
		agentName: "Drift Outreach",
		email: "drift.outreach@agents.optimizely.com",
		product: "CMP",
		createdBy: "Lucas Taylor",
		category: "Personal",
		createdDate: "May 10, 2026",
		updatedDate: "May 18, 2026",
		lastActive: "May 18, 2026",
		status: "Deprovisioned",
		productAccess: [
			{ product: "CMP", instances: [{ name: "Sandbox", role: "Contributor" }] },
		],
	},
	{
		id: "a-011",
		firstName: "Pulse",
		agentName: "Pulse Monitor",
		email: "pulse.monitor@agents.optimizely.com",
		product: "Frontend Hosting",
		createdBy: "Mia Anderson",
		category: "Public",
		createdDate: "May 12, 2026",
		updatedDate: "May 21, 2026",
		lastActive: "May 21, 2026",
		status: "Active",
		productAccess: [
			{ product: "Frontend Hosting", instances: [{ name: "Production", role: "Admin" }] },
		],
	},
	{
		id: "a-012",
		firstName: "Quill",
		agentName: "Quill Editor",
		email: "quill.editor@agents.optimizely.com",
		product: "CMS",
		createdBy: "Duy Kieu",
		category: "Personal",
		createdDate: "May 14, 2026",
		updatedDate: "May 20, 2026",
		lastActive: "May 20, 2026",
		status: "Active",
		productAccess: [
			{ product: "CMS", instances: [{ name: "Production", role: "Editor" }] },
		],
	},
];

const STATUSES: AgentStatus[] = ["Active", "Paused", "Deprovisioned"];
const CATEGORIES: AgentCategory[] = ["Personal", "Team", "Public"];

type AgentFilters = {
	search: string;
	product: string;
	instance: string;
	project: string;
	role: string;
	status: string;
	category: string;
};

const DEFAULT_FILTERS: AgentFilters = {
	search: "",
	product: "All",
	instance: "All",
	project: "All",
	role: "All",
	status: "All",
	category: "All",
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

const STATUS_INTENT: Record<AgentStatus, "success" | "warning" | "neutral"> = {
	Active: "success",
	Paused: "warning",
	Deprovisioned: "neutral",
};

function StatusBadge({ status }: { status: AgentStatus }) {
	return (
		<Badge intent={STATUS_INTENT[status]} variant="subtle">
			{status}
		</Badge>
	);
}

const CATEGORY_INTENT: Record<AgentCategory, "information" | "primary" | "success"> = {
	Personal: "information",
	Team: "primary",
	Public: "success",
};

function CategoryBadge({ category }: { category: AgentCategory }) {
	return (
		<Badge intent={CATEGORY_INTENT[category]} variant="subtle">
			{category}
		</Badge>
	);
}

function AccessCard({ access }: { access: AgentAccess }) {
	const [open, setOpen] = useState(true);
	return (
		<Box border="1" borderColor="border.tertiary" rounded="md">
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				p="12"
				cursor="pointer"
				onClick={() => setOpen((v) => !v)}
			>
				<Box display="flex" alignItems="center" gap="8">
					<Box
						display="inline-flex"
						alignItems="center"
						justifyContent="center"
						style={{
							width: 16,
							height: 16,
							transform: open ? "rotate(90deg)" : "rotate(0deg)",
							transition: "transform 120ms",
						}}
					>
						<IconAngleRight size={14} />
					</Box>
					<Text fontWeight="600">{access.product}</Text>
					<Badge intent="neutral" variant="subtle">
						{access.instances.length}
					</Badge>
				</Box>
			</Box>
			{open && (
				<Box borderT="1" borderColor="border.tertiary" p="12" display="flex" flexDirection="column" gap="8">
					{access.instances.map((inst) => (
						<Box key={inst.name} display="flex" alignItems="center" justifyContent="space-between">
							<Text fontSize="sm" color="fg.default">
								{inst.name}
							</Text>
							<Text fontSize="sm" color="fg.secondary">
								{inst.role}
							</Text>
						</Box>
					))}
				</Box>
			)}
		</Box>
	);
}

function AgentDetailPanel({
	agent,
	onClose,
	onRequestDelete,
}: {
	agent: Agent | null;
	onClose: () => void;
	onRequestDelete: () => void;
}) {
	const open = !!agent;

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
		};
	}, [open, onClose]);

	if (!open || !agent || typeof document === "undefined") return null;

	return createPortal(
		<>
			<Box
				onClick={onClose}
				style={{
					position: "fixed",
					inset: 0,
					zIndex: 1000,
					background: "var(--ax-colors-bg-overlay)",
				}}
			/>
			<Box
				role="dialog"
				aria-modal="true"
				aria-label="Agent details"
				bg="bg.default"
				display="flex"
				flexDirection="column"
				style={{
					position: "fixed",
					top: 0,
					right: 0,
					bottom: 0,
					width: PANEL_WIDTH,
					maxWidth: "100vw",
					zIndex: 1001,
					boxShadow: "var(--ax-shadows-xl)",
				}}
			>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					px="24"
					py="20"
					borderB="1"
					borderColor="border.tertiary"
				>
					<Heading level="2">Agent details</Heading>
					<Button
						appearance="subtle"
						size="md"
						icon={<IconXmark size={20} />}
						aria-label="Close"
						onClick={onClose}
					/>
				</Box>

				<Box flex="1" overflow="auto" px="24" py="20">
					<Box display="flex" flexDirection="column" gap="20">
						<Box bg="bg.page" rounded="md" p="16">
							<Box display="flex" alignItems="center" gap="16">
								<Avatar name={agent.agentName} size="lg" colorScheme="purple" />
								<Box flex="1" style={{ minWidth: 0 }}>
									<Box display="flex" alignItems="center" gap="8">
										<Heading level="4" truncate>
											{agent.agentName}
										</Heading>
										<Badge intent="primary" variant="strong">
											Agent
										</Badge>
									</Box>
									<Box mt="4" display="flex" alignItems="center" gap="8">
										<StatusBadge status={agent.status} />
										<Text fontSize="sm" color="fg.tertiary" truncate>
											{agent.email}
										</Text>
									</Box>
								</Box>
							</Box>
						</Box>

						<Box>
							<Heading level="4">Info</Heading>
							<Box
								mt="12"
								display="grid"
								gap="16"
								style={{ gridTemplateColumns: "1fr 1fr" }}
							>
								<Box>
									<Text fontSize="sm" color="fg.secondary">
										Email
									</Text>
									<Text fontWeight="600">{agent.email}</Text>
								</Box>
								<Box>
									<Text fontSize="sm" color="fg.secondary">
										Created by
									</Text>
									<Text fontWeight="600">{agent.createdBy}</Text>
								</Box>
								<Box>
									<Text fontSize="sm" color="fg.secondary">
										Created
									</Text>
									<Text fontWeight="600">{agent.createdDate}</Text>
								</Box>
								<Box>
									<Text fontSize="sm" color="fg.secondary">
										Last active
									</Text>
									<Text fontWeight="600">{agent.lastActive}</Text>
								</Box>
								<Box>
									<Text fontSize="sm" color="fg.secondary">
										Updated at
									</Text>
									<Text fontWeight="600">{agent.updatedDate}</Text>
								</Box>
								<Box>
									<Text fontSize="sm" color="fg.secondary">
										Category
									</Text>
									<Box mt="4">
										<CategoryBadge category={agent.category} />
									</Box>
								</Box>
							</Box>
						</Box>

						<Box>
							<Heading level="4">Product access</Heading>
							<Box mt="12" display="flex" flexDirection="column" gap="8">
								{agent.productAccess.map((access) => (
									<AccessCard key={access.product} access={access} />
								))}
							</Box>
						</Box>
					</Box>
				</Box>

				<Box
					display="flex"
					justifyContent="end"
					gap="12"
					px="24"
					py="16"
					borderT="1"
					borderColor="border.tertiary"
					bg="bg.page"
				>
					<Button appearance="default" addonBefore={<IconPen size={14} />}>
						Edit Access
					</Button>
					<Button appearance="default">Deactivate</Button>
					<Button
						appearance="danger-outline"
						addonBefore={<IconTrashCan size={14} />}
						onClick={onRequestDelete}
					>
						Delete
					</Button>
				</Box>
			</Box>
		</>,
		document.body,
	);
}

export default function VirtualTeammatesPage() {
	const [agents, setAgents] = useState<Agent[]>(AGENTS);
	const [filters, setFilters] = useState<AgentFilters>(DEFAULT_FILTERS);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [currentPage, setCurrentPage] = useState(1);
	const [detailAgent, setDetailAgent] = useState<Agent | null>(null);
	const [confirmDelete, setConfirmDelete] = useState<Agent | null>(null);

	const filtered = useMemo(() => {
		const q = filters.search.trim().toLowerCase();
		return agents.filter((a) => {
			if (q && !`${a.firstName} ${a.agentName} ${a.email}`.toLowerCase().includes(q))
				return false;
			if (filters.product !== "All" && a.product !== filters.product) return false;
			if (
				filters.instance !== "All" &&
				!a.productAccess.some((p) => p.instances.some((i) => i.name === filters.instance))
			)
				return false;
			if (
				filters.role !== "All" &&
				!a.productAccess.some((p) => p.instances.some((i) => i.role === filters.role))
			)
				return false;
			if (filters.status !== "All" && a.status !== filters.status) return false;
			if (filters.category !== "All" && a.category !== filters.category) return false;
			return true;
		});
	}, [agents, filters]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(currentPage, totalPages);
	const pageRows = useMemo(
		() => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
		[filtered, safePage],
	);

	const updateFilter = (key: keyof AgentFilters) => (v: string) => {
		setFilters((f) => ({ ...f, [key]: v }));
		setCurrentPage(1);
	};

	const toggleRow = (id: string) =>
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});

	const pageRowIds = pageRows.map((r) => r.id);
	const allOnPageSelected =
		pageRowIds.length > 0 && pageRowIds.every((id) => selectedIds.has(id));
	const togglePageSelectAll = () => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (allOnPageSelected) pageRowIds.forEach((id) => next.delete(id));
			else pageRowIds.forEach((id) => next.add(id));
			return next;
		});
	};

	const deleteAgent = (a: Agent) => {
		setAgents((list) => list.filter((x) => x.id !== a.id));
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.delete(a.id);
			return next;
		});
		if (detailAgent?.id === a.id) setDetailAgent(null);
		setConfirmDelete(null);
	};

	const toggleStatus = (a: Agent) => {
		const updated: Agent = {
			...a,
			status: a.status === "Active" ? "Paused" : "Active",
		};
		setAgents((list) => list.map((x) => (x.id === a.id ? updated : x)));
		if (detailAgent?.id === a.id) setDetailAgent(updated);
	};

	return (
		<Box>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
				<Box display="flex" alignItems="center" gap="12">
					<Heading level="2">Virtual Teammates</Heading>
					<Link href="#" fontSize="md">
						Learn more
					</Link>
					<Tooltip content="Virtual Teammates are AI agents granted access to your Optimizely products.">
						<span style={{ display: "inline-flex" }}>
							<IconCircleInfo size={16} color="var(--ax-colors-fg-tertiary)" />
						</span>
					</Tooltip>
				</Box>
				<Box display="flex" alignItems="center" gap="8">
					<Button appearance="primary">Invite User</Button>
				</Box>
			</Box>

			<Box display="flex" flexDirection="column" gap="12" mb="16">
				<Box display="flex" alignItems="center" gap="8" flexWrap="wrap">
					<Box style={{ width: 320 }}>
						<SearchInput
							size="lg"
							placeholder="Search agents by name or email"
							value={filters.search}
							onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
						/>
					</Box>
					<FilterDropdown
						label="Product"
						value={filters.product}
						options={PRODUCTS}
						onChange={updateFilter("product")}
					/>
					<FilterDropdown
						label="Instance"
						value={filters.instance}
						options={INSTANCES}
						onChange={updateFilter("instance")}
					/>
					<FilterDropdown
						label="Project"
						value={filters.project}
						options={PROJECTS}
						onChange={updateFilter("project")}
					/>
					<FilterDropdown
						label="Role"
						value={filters.role}
						options={ROLES}
						onChange={updateFilter("role")}
					/>
					<FilterDropdown
						label="Status"
						value={filters.status}
						options={STATUSES}
						onChange={updateFilter("status")}
					/>
					<FilterDropdown
						label="Category"
						value={filters.category}
						options={CATEGORIES}
						onChange={updateFilter("category")}
					/>
				</Box>
			</Box>

			<Table>
				<thead>
					<Tr>
						<Th style={{ width: 48 }}>
							<Checkbox
								checked={allOnPageSelected}
								onCheckedChange={togglePageSelectAll}
								aria-label="Select all on this page"
							/>
						</Th>
						<Th>Name</Th>
						<Th>Email</Th>
						<Th>Product access</Th>
						<Th>Owner</Th>
						<Th>Status</Th>
						<Th>Created at</Th>
						<Th style={{ width: 60 }} />
					</Tr>
				</thead>
				<tbody>
					{pageRows.length === 0 ? (
						<tr>
							<td colSpan={8}>
								<Box p="32" textAlign="center">
									<Text color="fg.tertiary">No agents match the current filters.</Text>
								</Box>
							</td>
						</tr>
					) : (
						pageRows.map((a) => (
							<Tr key={a.id} onClick={() => setDetailAgent(a)}>
								<Td style={{ width: 48 }}>
									<Box onClick={(e) => e.stopPropagation()} display="inline-flex">
										<Checkbox
											checked={selectedIds.has(a.id)}
											onCheckedChange={() => toggleRow(a.id)}
											aria-label={`Select ${a.agentName}`}
										/>
									</Box>
								</Td>
								<Td>
									<Text fontWeight="500">{a.agentName}</Text>
								</Td>
								<Td>{a.email}</Td>
								<Td>{a.productAccess.map((p) => p.product).join(", ")}</Td>
								<Td>{a.createdBy}</Td>
								<Td type="raw">
									<StatusBadge status={a.status} />
								</Td>
								<Td>{a.createdDate}</Td>
								<Td type="raw" style={{ width: 60 }}>
									<Box
										onClick={(e) => e.stopPropagation()}
										display="flex"
										justifyContent="end"
									>
										<Menu
											options={[
												{ label: "View details", execute: () => setDetailAgent(a) },
												{ label: "Edit access", execute: () => setDetailAgent(a) },
												{
													label: a.status === "Active" ? "Deactivate" : "Activate",
													execute: () => toggleStatus(a),
												},
												{
													intent: "danger",
													label: "Delete",
													execute: () => setConfirmDelete(a),
												},
											]}
										>
											<MenuTrigger asChild>
												<EllipsisMenuButton
													appearance="subtle"
													size="sm"
													aria-label={`Actions for ${a.agentName}`}
												/>
											</MenuTrigger>
											<MenuContent />
										</Menu>
									</Box>
								</Td>
							</Tr>
						))
					)}
				</tbody>
			</Table>

			<Box display="flex" justifyContent="center" mt="16">
				<Pagination page={safePage} total={totalPages} onPageChange={setCurrentPage} />
			</Box>

			<AgentDetailPanel
				agent={detailAgent}
				onClose={() => setDetailAgent(null)}
				onRequestDelete={() => detailAgent && setConfirmDelete(detailAgent)}
			/>

			<AlertDialog
				open={!!confirmDelete}
				onOpenChange={(v) => !v && setConfirmDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>Delete agent?</AlertDialogHeader>
					<AlertDialogBody>
						{confirmDelete
							? `${confirmDelete.agentName} (${confirmDelete.email}) will be permanently removed.`
							: ""}
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel />
						<AlertDialogAction
							appearance="danger"
							onClick={() => confirmDelete && deleteAgent(confirmDelete)}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Box>
	);
}

"use client";

import { useMemo, useState } from "react";
import {
	Badge,
	Box,
	Button,
	Heading,
	Link,
	Menu,
	MenuContent,
	MenuTrigger,
	EllipsisMenuButton,
	Pagination,
	SearchInput,
	Text,
	AlertDialog,
	AlertDialogAction,
	AlertDialogBody,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
} from "@optiaxiom/react";
import { IconPlus } from "@optiaxiom/icons";

import { Table, Tr, Th, Td } from "@/app/components/Table";

const PAGE_SIZE = 10;

type RoleType = "System" | "Custom";

type Role = {
	id: string;
	name: string;
	description: string;
	type: RoleType;
	products: number;
	users: number;
	createdDate: string;
};

const ROLES_DATA: Role[] = [
	{
		id: "r-001",
		name: "Admin",
		description: "Full administrative access across products and instances.",
		type: "System",
		products: 6,
		users: 12,
		createdDate: "Jan 01, 2022",
	},
	{
		id: "r-002",
		name: "Editor",
		description: "Can create, edit, and publish content across assigned projects.",
		type: "System",
		products: 5,
		users: 38,
		createdDate: "Jan 01, 2022",
	},
	{
		id: "r-003",
		name: "Viewer",
		description: "Read-only access to all content and analytics.",
		type: "System",
		products: 6,
		users: 47,
		createdDate: "Jan 01, 2022",
	},
	{
		id: "r-004",
		name: "Approver",
		description: "Reviews and approves content before publishing.",
		type: "System",
		products: 4,
		users: 9,
		createdDate: "Jan 01, 2022",
	},
	{
		id: "r-005",
		name: "Contributor",
		description: "Can create and edit drafts, but cannot publish.",
		type: "System",
		products: 5,
		users: 24,
		createdDate: "Jan 01, 2022",
	},
	{
		id: "r-006",
		name: "Owner",
		description: "Full ownership and billing access for the organization.",
		type: "System",
		products: 6,
		users: 3,
		createdDate: "Jan 01, 2022",
	},
	{
		id: "r-007",
		name: "Marketing Lead",
		description: "Custom role for marketing leads with CMP and CMS access.",
		type: "Custom",
		products: 2,
		users: 6,
		createdDate: "Feb 14, 2024",
	},
	{
		id: "r-008",
		name: "Experiment Analyst",
		description: "Read and analyze experiments without editing rights.",
		type: "Custom",
		products: 1,
		users: 11,
		createdDate: "May 03, 2024",
	},
	{
		id: "r-009",
		name: "Localization Editor",
		description: "Manage translations and locale-specific content.",
		type: "Custom",
		products: 2,
		users: 4,
		createdDate: "Aug 22, 2024",
	},
	{
		id: "r-010",
		name: "Sandbox Tester",
		description: "Access only to sandbox instances for QA.",
		type: "Custom",
		products: 3,
		users: 8,
		createdDate: "Nov 11, 2024",
	},
];

export default function RolesPage() {
	const [roles, setRoles] = useState<Role[]>(ROLES_DATA);
	const [search, setSearch] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [confirmDelete, setConfirmDelete] = useState<Role | null>(null);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return roles;
		return roles.filter((r) => r.name.toLowerCase().includes(q));
	}, [roles, search]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(currentPage, totalPages);
	const pageRows = useMemo(
		() => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
		[filtered, safePage],
	);

	const deleteRole = (r: Role) => {
		setRoles((list) => list.filter((x) => x.id !== r.id));
		setConfirmDelete(null);
	};

	return (
		<Box>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
				<Box display="flex" alignItems="center" gap="12">
					<Heading level="2">Roles</Heading>
					<Link href="#" fontSize="md">
						Learn more
					</Link>
				</Box>
				<Box display="flex" alignItems="center" gap="8">
					<Button appearance="primary" addonBefore={<IconPlus size={16} />}>
						Create new Role
					</Button>
				</Box>
			</Box>

			<Box display="flex" alignItems="center" gap="8" mb="16">
				<Box style={{ width: 320 }}>
					<SearchInput
						size="lg"
						placeholder="Search by role name"
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setCurrentPage(1);
						}}
					/>
				</Box>
			</Box>

			<Table>
				<thead>
					<Tr>
						<Th>Role Name</Th>
						<Th>Description</Th>
						<Th>Type</Th>
						<Th>Products</Th>
						<Th>Users</Th>
						<Th>Created</Th>
						<Th style={{ width: 60 }} />
					</Tr>
				</thead>
				<tbody>
					{pageRows.length === 0 ? (
						<tr>
							<td colSpan={7}>
								<Box p="32" textAlign="center">
									<Text color="fg.tertiary">No roles match the current search.</Text>
								</Box>
							</td>
						</tr>
					) : (
						pageRows.map((r) => {
							const isSystem = r.type === "System";
							return (
								<Tr key={r.id}>
									<Td>
										<Text fontWeight="500">{r.name}</Text>
									</Td>
									<Td>
										<Text color="fg.secondary">{r.description}</Text>
									</Td>
									<Td type="raw">
										<Box display="inline-flex">
											<Badge
												intent={isSystem ? "information" : "neutral"}
												variant="subtle"
											>
												{r.type}
											</Badge>
										</Box>
									</Td>
									<Td>{r.products}</Td>
									<Td>{r.users}</Td>
									<Td>{r.createdDate}</Td>
									<Td type="raw" style={{ width: 60 }}>
										<Box
											onClick={(e) => e.stopPropagation()}
											display="flex"
											justifyContent="end"
										>
											<Menu
												options={[
													{ label: "View details", execute: () => {} },
													{
														label: "Edit role",
														disabledReason: isSystem
															? "System roles cannot be edited"
															: undefined,
														execute: () => {},
													},
													{ label: "Duplicate", execute: () => {} },
													{
														intent: "danger",
														label: "Delete",
														disabledReason: isSystem
															? "System roles cannot be deleted"
															: undefined,
														execute: () => setConfirmDelete(r),
													},
												]}
											>
												<MenuTrigger asChild>
													<EllipsisMenuButton
														appearance="subtle"
														size="sm"
														aria-label={`Actions for ${r.name}`}
													/>
												</MenuTrigger>
												<MenuContent />
											</Menu>
										</Box>
									</Td>
								</Tr>
							);
						})
					)}
				</tbody>
			</Table>

			<Box display="flex" justifyContent="center" mt="16">
				<Pagination page={safePage} total={totalPages} onPageChange={setCurrentPage} />
			</Box>

			<AlertDialog
				open={!!confirmDelete}
				onOpenChange={(v) => !v && setConfirmDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>Delete role?</AlertDialogHeader>
					<AlertDialogBody>
						{confirmDelete
							? `${confirmDelete.name} will be permanently removed. Users assigned to this role will lose its permissions.`
							: ""}
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel />
						<AlertDialogAction
							appearance="danger"
							onClick={() => confirmDelete && deleteRole(confirmDelete)}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Box>
	);
}

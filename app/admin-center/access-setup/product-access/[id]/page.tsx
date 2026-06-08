"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import NextLink from "next/link";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogBody,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
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
	SearchInput,
	Text,
	Tooltip,
} from "@optiaxiom/react";
import {
	IconAngleDown,
	IconUsers,
	IconDatabase,
	IconWavePulse,
	IconCalendar,
	IconCircleInfo,
} from "@optiaxiom/icons";

import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
	INSTANCES,
	PROJECTS,
	ROLES,
	USER_TYPES,
	ACTIVATION_STATUSES,
	type ActivationStatus,
	type User,
} from "../../../user-management/users/data";
import {
	InviteUserPanel,
	type AccessEntry,
	type InvitedUser,
} from "../../../user-management/users/components/InviteUserPanel";
import { UserDetailPanel } from "../../../user-management/users/components/UserDetailPanel";
import { type UserType } from "../../../user-management/users/data";
import {
	getProductById,
	getProductStats,
	getUsersForProduct,
} from "../data";

const PAGE_SIZE = 12;

type DetailFilters = {
	search: string;
	instance: string;
	role: string;
	userType: string;
	activationStatus: string;
};

const DEFAULT_FILTERS: DetailFilters = {
	search: "",
	instance: "All",
	role: "All",
	userType: "All",
	activationStatus: "All",
};

function StatusText({ status }: { status: ActivationStatus }) {
	if (status === "Active")
		return (
			<Text asChild color="fg.success" fontWeight="500">
				<span>Active</span>
			</Text>
		);
	if (status === "Password Expired")
		return (
			<Text asChild color="fg.warning" fontWeight="500">
				<span>Password Expired</span>
			</Text>
		);
	return (
		<Text asChild color="fg.tertiary">
			<span>N/A</span>
		</Text>
	);
}

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

function StatCard({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
}) {
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
		</Box>
	);
}

export default function ProductAccessDetailPage() {
	const params = useParams();
	const id = (params?.id as string) ?? "";
	const product = getProductById(id);
	const productUsers = useMemo(
		() => (product ? getUsersForProduct(product) : []),
		[product],
	);
	const stats = useMemo(
		() => (product ? getProductStats(product, productUsers) : null),
		[product, productUsers],
	);

	const [users, setUsers] = useState<User[]>(productUsers);
	const [filters, setFilters] = useState<DetailFilters>(DEFAULT_FILTERS);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [currentPage, setCurrentPage] = useState(1);
	const [invitePanelOpen, setInvitePanelOpen] = useState(false);
	const [detailUser, setDetailUser] = useState<User | null>(null);
	const [detailTab, setDetailTab] = useState<"info" | "product" | "group">("info");
	const [isEditing, setIsEditing] = useState(false);
	const [editDraft, setEditDraft] = useState<{ firstName: string; lastName: string } | null>(null);
	const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

	const openDetail = (u: User) => {
		setDetailUser(u);
		setDetailTab("info");
		setIsEditing(false);
		setEditDraft(null);
	};

	const startEdit = () => {
		if (!detailUser) return;
		setEditDraft({ firstName: detailUser.firstName, lastName: detailUser.lastName });
		setIsEditing(true);
	};

	const saveEdit = () => {
		if (!detailUser || !editDraft) return;
		const updated: User = { ...detailUser, ...editDraft };
		setUsers((list) => list.map((u) => (u.id === detailUser.id ? updated : u)));
		setDetailUser(updated);
		setIsEditing(false);
		setEditDraft(null);
	};

	const setDetailField = <K extends keyof User>(key: K, value: User[K]) => {
		if (!detailUser) return;
		const updated: User = { ...detailUser, [key]: value };
		setUsers((list) => list.map((u) => (u.id === detailUser.id ? updated : u)));
		setDetailUser(updated);
	};

	const deleteUser = (u: User) => {
		setUsers((list) => list.filter((x) => x.id !== u.id));
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.delete(u.id);
			return next;
		});
		if (detailUser?.id === u.id) setDetailUser(null);
		setConfirmDelete(null);
	};

	const filtered = useMemo(() => {
		const q = filters.search.trim().toLowerCase();
		return users.filter((u) => {
			if (q && !`${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q)) return false;
			if (filters.instance !== "All" && u.instance !== filters.instance) return false;
			if (filters.role !== "All" && u.role !== filters.role) return false;
			if (filters.userType !== "All" && u.userType !== filters.userType) return false;
			if (filters.activationStatus !== "All" && u.activationStatus !== filters.activationStatus)
				return false;
			return true;
		});
	}, [users, filters]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(currentPage, totalPages);
	const pageRows = useMemo(
		() => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
		[filtered, safePage],
	);

	const updateFilter = (key: keyof DetailFilters) => (v: string) => {
		setFilters((f) => ({ ...f, [key]: v }));
		setCurrentPage(1);
		setSelectedIds(new Set());
	};

	const toggleRow = (rowId: string) =>
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.has(rowId) ? next.delete(rowId) : next.add(rowId);
			return next;
		});

	const pageRowIds = pageRows.map((r) => r.id);
	const allOnPageSelected =
		pageRowIds.length > 0 && pageRowIds.every((rid) => selectedIds.has(rid));
	const togglePageSelectAll = () => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (allOnPageSelected) {
				pageRowIds.forEach((rid) => next.delete(rid));
			} else {
				pageRowIds.forEach((rid) => next.add(rid));
			}
			return next;
		});
	};

	const clearSelection = () => setSelectedIds(new Set());
	const removeAccess = () => {
		setUsers((list) => list.filter((u) => !selectedIds.has(u.id)));
		clearSelection();
	};

	const handleInviteSubmit = (
		invited: InvitedUser[],
		access: AccessEntry[],
	) => {
		if (!product) return;
		const today = new Date().toLocaleDateString("en-US", {
			month: "short",
			day: "2-digit",
			year: "numeric",
		});
		const firstAccess = access.find((a) => a.kind === "product");
		const firstInstance = firstAccess?.instances[0];
		const newUsers: User[] = invited.map((u, i) => ({
			id: `${product.id}-invited-${Date.now()}-${i}`,
			firstName: u.first,
			lastName: u.last,
			email: u.email,
			activationStatus: "N/A",
			createdDate: today,
			lastActiveDate: null,
			userType: "Local",
			product: product.productKey,
			instance: firstInstance?.name ?? INSTANCES[0],
			project: PROJECTS[0],
			role: firstInstance?.roles[0] ?? ROLES[0],
		}));
		setUsers((prev) => [...newUsers, ...prev]);
		setFilters(DEFAULT_FILTERS);
		setCurrentPage(1);
	};

	if (!product) {
		return (
			<Box p="32" textAlign="center">
				<Text color="fg.tertiary">
					Product not found.{" "}
					<Link asChild fontSize="md">
						<NextLink href="/admin-center/access-setup/product-access">
							Back to Product access
						</NextLink>
					</Link>
				</Text>
			</Box>
		);
	}

	return (
		<Box>
			<Box display="flex" alignItems="center" gap="6" mb="12" fontSize="sm">
				<Link asChild fontSize="sm">
					<NextLink href="/admin-center/access-setup/product-access">
						Product access
					</NextLink>
				</Link>
				<Text fontSize="sm" color="fg.tertiary">
					/
				</Text>
				<Text fontSize="sm" color="fg.secondary">
					{product.name}
				</Text>
			</Box>

			<Heading level="1">{product.name}</Heading>

			{stats && (
				<Box
					display="grid"
					gap="16"
					mt="20"
					mb="24"
					style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
				>
					<StatCard
						icon={<IconUsers size={16} />}
						label="Active Users"
						value={`${stats.activeUsers}/${stats.seatTotal}`}
					/>
					<StatCard
						icon={<IconDatabase size={16} />}
						label="Total instances"
						value={String(stats.totalInstances)}
					/>
					<StatCard
						icon={<IconWavePulse size={16} />}
						label="Seat usage"
						value={`${stats.seatUsed}/${stats.seatTotal}`}
					/>
					<StatCard
						icon={<IconCalendar size={16} />}
						label="Pending invites"
						value={String(stats.pendingInvites)}
					/>
				</Box>
			)}

			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				gap="12"
				mb="16"
				flexWrap="wrap"
			>
				<Box display="flex" alignItems="center" gap="16" flexWrap="wrap">
					<Text fontSize="md" fontWeight="600">
						User list
					</Text>
					<Box style={{ width: 260 }}>
						<SearchInput
							size="lg"
							placeholder="Search users by name or email"
							value={filters.search}
							onChange={(e) =>
								setFilters((f) => ({ ...f, search: e.target.value }))
							}
						/>
					</Box>
					<FilterDropdown
						label="Instance"
						value={filters.instance}
						options={INSTANCES}
						onChange={updateFilter("instance")}
					/>
					<FilterDropdown
						label="Role"
						value={filters.role}
						options={ROLES}
						onChange={updateFilter("role")}
					/>
					<FilterDropdown
						label="User type"
						value={filters.userType}
						options={USER_TYPES}
						onChange={updateFilter("userType")}
					/>
					<FilterDropdown
						label="Activation status"
						value={filters.activationStatus}
						options={ACTIVATION_STATUSES}
						onChange={updateFilter("activationStatus")}
					/>
				</Box>
				<Button appearance="primary" onClick={() => setInvitePanelOpen(true)}>
					Invite user
				</Button>
			</Box>

			<Box mb="16">
				{selectedIds.size > 0 ? (
					<Box
						display="flex"
						alignItems="center"
						gap="16"
						p="12"
						bg="bg.default"
						border="1"
						borderColor="border.secondary"
						rounded="md"
					>
						<Text fontSize="sm" color="fg.default">
							{selectedIds.size} user{selectedIds.size === 1 ? "" : "s"} selected
						</Text>
						<Box display="flex" alignItems="center" gap="8">
							<Button appearance="default" size="sm">
								Edit access
							</Button>
							<Button appearance="default" size="sm">
								Add access
							</Button>
							<Button appearance="default" size="sm" onClick={removeAccess}>
								Remove access
							</Button>
							<Menu
								options={[
									{ label: "Export selected", execute: () => {} },
									{ label: "Reset password", execute: () => {} },
									{
										intent: "danger",
										label: "Delete users",
										execute: removeAccess,
									},
								]}
							>
								<MenuTrigger asChild>
									<Button
										appearance="default"
										size="sm"
										icon={<IconAngleDown size={14} />}
										iconPosition="end"
									>
										More actions
									</Button>
								</MenuTrigger>
								<MenuContent />
							</Menu>
							<Button appearance="subtle" size="sm" onClick={clearSelection}>
								Clear
							</Button>
						</Box>
					</Box>
				) : null}
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
						<Th>First Name</Th>
						<Th>Last Name</Th>
						<Th>Email</Th>
						<Th>
							<Box display="inline-flex" alignItems="center" gap="4">
								<span>Activation Status</span>
								<Tooltip content="Whether this user's account is active, expired, or has never been activated.">
									<span style={{ display: "inline-flex" }}>
										<IconCircleInfo
											size={14}
											color="var(--ax-colors-fg-tertiary)"
										/>
									</span>
								</Tooltip>
							</Box>
						</Th>
						<Th>Created</Th>
						<Th style={{ width: 60 }} />
					</Tr>
				</thead>
				<tbody>
					{pageRows.length === 0 ? (
						<tr>
							<td colSpan={7}>
								<Box p="32" textAlign="center">
									<Text color="fg.tertiary">
										No users have access to this product yet.
									</Text>
								</Box>
							</td>
						</tr>
					) : (
						pageRows.map((u) => (
							<Tr key={u.id} onClick={() => openDetail(u)}>
								<Td style={{ width: 48 }}>
									<Box
										onClick={(e) => e.stopPropagation()}
										display="inline-flex"
									>
										<Checkbox
											checked={selectedIds.has(u.id)}
											onCheckedChange={() => toggleRow(u.id)}
											aria-label={`Select ${u.firstName} ${u.lastName}`}
										/>
									</Box>
								</Td>
								<Td>{u.firstName}</Td>
								<Td>{u.lastName}</Td>
								<Td>{u.email}</Td>
								<Td>
									<StatusText status={u.activationStatus} />
								</Td>
								<Td>{u.createdDate}</Td>
								<Td type="raw" style={{ width: 60 }}>
									<Box
										onClick={(e) => e.stopPropagation()}
										display="flex"
										justifyContent="end"
									>
										<Menu
											options={[
												{
													label: "View details",
													execute: () => openDetail(u),
												},
												{
													label: "Edit user",
													execute: () => {
														openDetail(u);
														setTimeout(startEdit, 0);
													},
												},
												{
													intent: "danger",
													label: "Remove access",
													execute: () => setConfirmDelete(u),
												},
											]}
										>
											<MenuTrigger asChild>
												<EllipsisMenuButton
													appearance="subtle"
													size="sm"
													aria-label={`Actions for ${u.firstName} ${u.lastName}`}
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

			{totalPages > 1 && (
				<Box display="flex" justifyContent="center" mt="16">
					<Text fontSize="sm" color="fg.tertiary">
						Page {safePage} of {totalPages}
					</Text>
				</Box>
			)}

			<InviteUserPanel
				open={invitePanelOpen}
				onClose={() => setInvitePanelOpen(false)}
				onSubmit={handleInviteSubmit}
				presetProduct={product.productKey}
			/>

			<UserDetailPanel
				user={detailUser}
				tab={detailTab}
				onTabChange={setDetailTab}
				isEditing={isEditing}
				editDraft={editDraft}
				onEditDraftChange={setEditDraft}
				onStartEdit={startEdit}
				onSaveEdit={saveEdit}
				onCancelEdit={() => {
					setIsEditing(false);
					setEditDraft(null);
				}}
				onClose={() => setDetailUser(null)}
				onRequestDelete={() =>
					detailUser && setConfirmDelete(detailUser)
				}
				onUserTypeChange={(t: UserType) => setDetailField("userType", t)}
			/>

			<AlertDialog
				open={!!confirmDelete}
				onOpenChange={(v) => !v && setConfirmDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>Remove user?</AlertDialogHeader>
					<AlertDialogBody>
						{confirmDelete
							? `${confirmDelete.firstName} ${confirmDelete.lastName} (${confirmDelete.email}) will lose access to ${product.name}.`
							: ""}
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel />
						<AlertDialogAction
							appearance="danger"
							onClick={() => confirmDelete && deleteUser(confirmDelete)}
						>
							Remove
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Box>
	);
}

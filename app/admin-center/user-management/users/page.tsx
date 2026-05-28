"use client";

import { useState, useMemo } from "react";
import {
	Box,
	Button,
	Checkbox,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogBody,
	Heading,
	Input,
	Link,
	Menu,
	MenuContent,
	MenuTrigger,
	LabelMenuButton,
	EllipsisMenuButton,
	Pagination,
	SearchInput,
	SegmentedControl,
	SegmentedControlItem,
	Text,
	ToggleButton,
	Tooltip,
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogAction,
	AlertDialogCancel,
} from "@optiaxiom/react";
import {
	IconFileExport,
	IconFileImport,
	IconAngleDown,
	IconFilter,
	IconTrashCan,
	IconCircleInfo,
	IconPen,
} from "@optiaxiom/icons";

import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
	USERS,
	PRODUCTS,
	INSTANCES,
	PROJECTS,
	ROLES,
	USER_TYPES,
	ACTIVATION_STATUSES,
	DEFAULT_FILTERS,
	countActiveFilters,
	filterUsers,
	type User,
	type ActivationStatus,
	type UserFilters,
	type UserType,
} from "./data";

const PAGE_SIZE = 12;

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

export default function AdminCenterUsersPage() {
	const [users, setUsers] = useState<User[]>(USERS);
	const [filters, setFilters] = useState<UserFilters>(DEFAULT_FILTERS);
	const [activeTab, setActiveTab] = useState<"all" | "invitations" | "upload">("all");
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [currentPage, setCurrentPage] = useState(1);
	const [detailUser, setDetailUser] = useState<User | null>(null);
	const [detailTab, setDetailTab] = useState<"info" | "product" | "group">("info");
	const [isEditing, setIsEditing] = useState(false);
	const [editDraft, setEditDraft] = useState<{ firstName: string; lastName: string } | null>(null);
	const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
	const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
	const [filtersOpen, setFiltersOpen] = useState(false);

	const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

	const filtered = useMemo(() => filterUsers(users, filters), [users, filters]);
	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(currentPage, totalPages);
	const pageRows = useMemo(
		() => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
		[filtered, safePage],
	);

	const updateFilter = (key: keyof UserFilters) => (v: string) => {
		setFilters((f) => ({ ...f, [key]: v }));
		setCurrentPage(1);
		setSelectedIds(new Set());
	};

	const clearFilters = () => {
		setFilters((f) => ({ ...f, ...DEFAULT_FILTERS, search: f.search }));
		setCurrentPage(1);
		setSelectedIds(new Set());
	};

	const toggleRow = (id: string) =>
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});

	const pageRowIds = pageRows.map((r) => r.id);
	const allOnPageSelected = pageRowIds.length > 0 && pageRowIds.every((id) => selectedIds.has(id));
	const togglePageSelectAll = () => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (allOnPageSelected) {
				pageRowIds.forEach((id) => next.delete(id));
			} else {
				pageRowIds.forEach((id) => next.add(id));
			}
			return next;
		});
	};

	const clearSelection = () => setSelectedIds(new Set());

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

	const bulkDelete = () => {
		setUsers((list) => list.filter((u) => !selectedIds.has(u.id)));
		clearSelection();
		setConfirmBulkDelete(false);
	};

	return (
		<Box>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
				<Box display="flex" alignItems="center" gap="12">
					<Heading level="1">Users</Heading>
					<Link href="#" fontSize="md">
						Learn more
					</Link>
				</Box>
				<Box display="flex" alignItems="center" gap="8">
					<Button appearance="default" addonBefore={<IconFileExport size={16} />}>
						Export User
					</Button>
					<Button appearance="default" addonBefore={<IconFileImport size={16} />}>
						Import User
					</Button>
					<Menu
						options={[
							{ label: "Invite via email", execute: () => {} },
							{ label: "Invite via SSO", execute: () => {} },
							{ label: "Bulk invite", execute: () => {} },
						]}
					>
						<MenuTrigger asChild>
							<Button
								appearance="primary"
								icon={<IconAngleDown size={16} />}
								iconPosition="end"
							>
								Invite User
							</Button>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Box>
			</Box>

			<Box display="flex" gap="24" borderB="1" borderColor="border.tertiary" mb="16">
				{(["all", "invitations", "upload"] as const).map((tab) => (
					<Box
						key={tab}
						pb="12"
						cursor="pointer"
						borderB={activeTab === tab ? "2" : "0"}
						onClick={() => setActiveTab(tab)}
						style={activeTab === tab ? { borderBottomColor: "var(--ax-colors-fg-default)" } : {}}
					>
						<Text
							fontWeight={activeTab === tab ? "500" : "400"}
							color={activeTab === tab ? "fg.default" : "fg.tertiary"}
						>
							{tab === "all" ? "All users" : tab === "invitations" ? "Invitations" : "Upload"}
						</Text>
					</Box>
				))}
			</Box>

			{activeTab !== "all" ? (
				<Box
					p="32"
					textAlign="center"
					rounded="md"
					borderColor="border.tertiary"
					border="1"
				>
					<Text color="fg.tertiary">
						{activeTab === "invitations" ? "Invitations" : "Upload"} view is not yet
						implemented.
					</Text>
				</Box>
			) : (
				<>
					<Box display="flex" flexDirection="column" gap="12" mb="16">
						<Box display="flex" alignItems="center" gap="16">
							<Box style={{ width: 280 }}>
								<SearchInput
									placeholder="Search users by name or email"
									value={filters.search}
									onChange={(e) =>
										setFilters((f) => ({ ...f, search: e.target.value }))
									}
								/>
							</Box>
							<Box style={{ position: "relative", display: "inline-flex" }}>
								<ToggleButton
									appearance="subtle"
									size="md"
									pressed={filtersOpen}
									onPressedChange={setFiltersOpen}
									aria-expanded={filtersOpen}
									icon={
										<Box asChild display="inline-flex" alignItems="center" gap="4">
											<span>
												<IconFilter size={16} />
												<IconAngleDown size={16} />
											</span>
										</Box>
									}
									iconPosition="end"
								>
									Filter
								</ToggleButton>
								{activeFilterCount > 0 ? (
									<Box
										aria-label={`${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}`}
										bg="bg.accent"
										color="fg.default"
										style={{
											position: "absolute",
											top: -4,
											right: -4,
											minWidth: 18,
											height: 18,
											padding: "0 4px",
											borderRadius: 9,
											fontSize: 11,
											fontWeight: 600,
											lineHeight: "18px",
											textAlign: "center",
											pointerEvents: "none",
										}}
									>
										{activeFilterCount}
									</Box>
								) : null}
							</Box>
							{activeFilterCount > 0 && !filtersOpen ? (
								<Link
									href="#"
									fontSize="md"
									onClick={(e) => {
										e.preventDefault();
										clearFilters();
									}}
								>
									Clear filter
								</Link>
							) : null}
						</Box>
						{filtersOpen ? (
						<Box display="flex" alignItems="center" gap="8" flexWrap="wrap">
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
							{activeFilterCount > 0 ? (
								<Link
									href="#"
									fontSize="md"
									onClick={(e) => {
										e.preventDefault();
										clearFilters();
									}}
								>
									Clear filter
								</Link>
							) : null}
						</Box>
						) : null}
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
							>
								<Text fontSize="sm" color="fg.default">
									{selectedIds.size} user{selectedIds.size === 1 ? "" : "s"}{" "}
									selected
								</Text>
								<Box display="flex" alignItems="center" gap="8">
									<Button appearance="default" size="sm">
										Edit access
									</Button>
									<Button appearance="default" size="sm">
										Add access
									</Button>
									<Button appearance="default" size="sm">
										Remove access
									</Button>
									<Menu
										options={[
											{
												label: "Export selected",
												execute: () => {},
											},
											{
												label: "Reset password",
												execute: () => {},
											},
											{
												intent: "danger",
												label: "Delete users",
												execute: () => setConfirmBulkDelete(true),
											},
										]}
									>
										<MenuTrigger asChild>
											<Button appearance="default" size="sm">
												More actions
												<IconAngleDown size={14} />
											</Button>
										</MenuTrigger>
										<MenuContent />
									</Menu>
									<Button appearance="subtle" size="sm" onClick={clearSelection}>
										Clear
									</Button>
								</Box>
							</Box>
						) : (
							<Box p="12" border="1" borderColor="border.secondary">
								<Text fontSize="sm" color="fg.secondary">
									Select users from the list to manage them in bulk.
								</Text>
							</Box>
						)}
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
								<Th tooltip="Whether this user's account is active, expired, or has never been activated.">
									Activation Status
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
												No users match the current filters.
											</Text>
										</Box>
									</td>
								</tr>
							) : (
								pageRows.map((u) => (
									<Tr key={u.id} onClick={() => openDetail(u)}>
										<Td style={{ width: 48 }}>
											<Box onClick={(e) => e.stopPropagation()} display="inline-flex">
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
															label: "Delete user",
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

					<Box display="flex" justifyContent="center" mt="16">
						<Pagination
							page={safePage}
							total={totalPages}
							onPageChange={setCurrentPage}
						/>
					</Box>
				</>
			)}

			<UserDetailDialog
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
				onRequestDelete={() => detailUser && setConfirmDelete(detailUser)}
				onUserTypeChange={(t) => setDetailField("userType", t)}
			/>

			<AlertDialog
				open={!!confirmDelete}
				onOpenChange={(v) => !v && setConfirmDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>Delete user?</AlertDialogHeader>
					<AlertDialogBody>
						{confirmDelete
							? `${confirmDelete.firstName} ${confirmDelete.lastName} (${confirmDelete.email}) will be permanently removed.`
							: ""}
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel />
						<AlertDialogAction
							appearance="danger"
							onClick={() => confirmDelete && deleteUser(confirmDelete)}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
				<AlertDialogContent>
					<AlertDialogHeader>Delete {selectedIds.size} users?</AlertDialogHeader>
					<AlertDialogBody>
						This will permanently remove the selected users. This action cannot be
						undone.
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel />
						<AlertDialogAction appearance="danger" onClick={bulkDelete}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Box>
	);
}

function UserDetailDialog({
	user,
	tab,
	onTabChange,
	isEditing,
	editDraft,
	onEditDraftChange,
	onStartEdit,
	onSaveEdit,
	onCancelEdit,
	onClose,
	onRequestDelete,
	onUserTypeChange,
}: {
	user: User | null;
	tab: "info" | "product" | "group";
	onTabChange: (t: "info" | "product" | "group") => void;
	isEditing: boolean;
	editDraft: { firstName: string; lastName: string } | null;
	onEditDraftChange: (d: { firstName: string; lastName: string }) => void;
	onStartEdit: () => void;
	onSaveEdit: () => void;
	onCancelEdit: () => void;
	onClose: () => void;
	onRequestDelete: () => void;
	onUserTypeChange: (t: UserType) => void;
}) {
	return (
		<Dialog open={!!user} onOpenChange={(v) => !v && onClose()}>
			<DialogContent size="lg">
				{user && (
					<>
						<DialogHeader>User details</DialogHeader>
						<DialogBody>
							<Box display="flex" flexDirection="column" gap="16">
								<Box bg="bg.page" rounded="md" p="12">
									<Box
										display="flex"
										alignItems="start"
										justifyContent="space-between"
										gap="16"
									>
										<Box flex="1" style={{ minWidth: 0 }}>
											<Heading level="4" truncate>
												{user.email}
											</Heading>
											<Box display="flex" alignItems="end" gap="32" mt="8">
												<Box>
													<Text fontSize="sm" color="fg.tertiary">
														First name
													</Text>
													{isEditing && editDraft ? (
														<Input
															value={editDraft.firstName}
															onChange={(e) =>
																onEditDraftChange({
																	...editDraft,
																	firstName: e.target.value,
																})
															}
															aria-label="First name"
														/>
													) : (
														<Text fontWeight="600">{user.firstName}</Text>
													)}
												</Box>
												<Box>
													<Text fontSize="sm" color="fg.tertiary">
														Last name
													</Text>
													{isEditing && editDraft ? (
														<Input
															value={editDraft.lastName}
															onChange={(e) =>
																onEditDraftChange({
																	...editDraft,
																	lastName: e.target.value,
																})
															}
															aria-label="Last name"
														/>
													) : (
														<Text fontWeight="600">{user.lastName}</Text>
													)}
												</Box>
												{!isEditing && (
													<Tooltip content="Edit name">
														<Button
															appearance="subtle"
															size="sm"
															icon={<IconPen size={14} />}
															onClick={onStartEdit}
															aria-label="Edit name"
														/>
													</Tooltip>
												)}
											</Box>
											{isEditing && (
												<Box display="flex" gap="8" mt="12">
													<Button
														appearance="primary"
														size="sm"
														onClick={onSaveEdit}
													>
														Save
													</Button>
													<Button
														appearance="subtle"
														size="sm"
														onClick={onCancelEdit}
													>
														Cancel
													</Button>
												</Box>
											)}
										</Box>
										<Button
											appearance="danger-outline"
											size="sm"
											addonBefore={<IconTrashCan size={14} />}
											onClick={onRequestDelete}
										>
											Delete this user
										</Button>
									</Box>
								</Box>

								<Box display="flex" gap="24" borderB="1" borderColor="border.tertiary">
									{(["info", "product", "group"] as const).map((t) => (
										<Box
											key={t}
											pb="12"
											cursor="pointer"
											borderB={tab === t ? "2" : "0"}
											onClick={() => onTabChange(t)}
											style={tab === t ? { borderBottomColor: "var(--ax-colors-fg-default)" } : {}}
										>
											<Text
												fontWeight={tab === t ? "500" : "400"}
												color={tab === t ? "fg.default" : "fg.tertiary"}
											>
												{t === "info" ? "User info" : t === "product" ? "Product access" : "Group access"}
											</Text>
										</Box>
									))}
								</Box>

								{tab === "info" && (
									<Box
										display="grid"
										gap="16"
										style={{ gridTemplateColumns: "1fr 1fr" }}
									>
										<Box display="flex" flexDirection="column" gap="16">
											<Box>
												<Box display="flex" alignItems="center" gap="4">
													<Text fontSize="sm" color="fg.secondary">
														Activation Status
													</Text>
													<Tooltip content="Whether this user's account is active, expired, or has never been activated.">
														<span style={{ display: "inline-flex" }}>
															<IconCircleInfo
																size={14}
																color="var(--ax-colors-fg-tertiary)"
															/>
														</span>
													</Tooltip>
												</Box>
												<Box mt="4">
													<StatusText status={user.activationStatus} />
												</Box>
											</Box>
											<Box>
												<Text fontSize="sm" color="fg.secondary">
													User type
												</Text>
												<Box mt="8">
													<SegmentedControl
														value={user.userType}
														onValueChange={(v: string | undefined) =>
															v && onUserTypeChange(v as UserType)
														}
													>
														<SegmentedControlItem value="Local">
															Local
														</SegmentedControlItem>
														<SegmentedControlItem value="SSO">
															SSO
														</SegmentedControlItem>
													</SegmentedControl>
												</Box>
											</Box>
											<Box>
												<Text fontSize="sm" color="fg.secondary">
													Role
												</Text>
												<Text fontWeight="600">{user.role}</Text>
											</Box>
										</Box>
										<Box display="flex" flexDirection="column" gap="16">
											<Box>
												<Text fontSize="sm" color="fg.secondary">
													Created date
												</Text>
												<Text fontWeight="600">{user.createdDate}</Text>
											</Box>
											<Box>
												<Text fontSize="sm" color="fg.secondary">
													Last active date
												</Text>
												<Text fontWeight="600">
													{user.lastActiveDate ?? "Never"}
												</Text>
											</Box>
											<Box>
												<Text fontSize="sm" color="fg.secondary">
													Product
												</Text>
												<Text fontWeight="600">{user.product}</Text>
											</Box>
										</Box>
									</Box>
								)}

								{tab === "product" && (
									<Box display="flex" flexDirection="column" gap="8">
										<Text fontSize="sm" color="fg.secondary">
											Granted on
										</Text>
										<Box
											display="flex"
											alignItems="center"
											justifyContent="space-between"
											p="12"
											rounded="md"
											border="1"
											borderColor="border.tertiary"
										>
											<Box>
												<Text fontWeight="600">{user.product}</Text>
												<Text fontSize="sm" color="fg.tertiary">
													{user.instance} · {user.project}
												</Text>
											</Box>
											<Text fontSize="sm" color="fg.secondary">
												{user.role}
											</Text>
										</Box>
									</Box>
								)}

								{tab === "group" && (
									<Box p="32" textAlign="center">
										<Text color="fg.tertiary">
											This user is not a member of any groups yet.
										</Text>
									</Box>
								)}
							</Box>
						</DialogBody>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

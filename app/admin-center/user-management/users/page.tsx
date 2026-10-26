"use client";

import { useState, useMemo } from "react";
import {
	Box,
	Button,
	Checkbox,
	Heading,
	Link,
	Menu,
	MenuContent,
	MenuTrigger,
	LabelMenuButton,
	EllipsisMenuButton,
	Pagination,
	SearchInput,
	Text,
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogAction,
	AlertDialogCancel,
} from "@optiaxiom/react";
import { IconAngleDown, IconFileExport, IconFileImport, IconFilter } from "@optimizely/axiom-icons";

import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
	InviteUserPanel,
	type AccessEntry,
	type InvitedUser,
} from "./components/InviteUserPanel";
import { UserDetailPanel } from "./components/UserDetailPanel";
import {
	BulkActionModals,
	type BulkModal,
} from "./components/bulk/BulkActionModals";
import { UploadsTab } from "./components/uploads/UploadsTab";
import { ImportUsersPanel } from "./components/uploads/ImportUsersPanel";
import { UploadDetailsModal } from "./components/uploads/UploadDetailsModal";
import {
	upsertUpload,
	type StagingUser,
	type Upload,
} from "./components/uploads/data";
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
import { downloadUsersCsv } from "./exportUsersCsv";

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
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [invitePanelOpen, setInvitePanelOpen] = useState(false);
	const [inviteMode, setInviteMode] = useState<"manual" | "upload">("manual");
	const [bulkModal, setBulkModal] = useState<BulkModal>(null);
	const [importPanelOpen, setImportPanelOpen] = useState(false);
	const [importMode, setImportMode] = useState<"users" | "groupAccess">(
		"users",
	);
	const [detailUpload, setDetailUpload] = useState<Upload | null>(null);
	const [uploadFiles, setUploadFiles] = useState<Upload[]>([]);
	const [stagingUsers, setStagingUsers] = useState<StagingUser[]>([]);

	const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);
	const systemEmails = useMemo(() => users.map((u) => u.email), [users]);

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

	const selectedUsers = useMemo(
		() => users.filter((u) => selectedIds.has(u.id)),
		[users, selectedIds],
	);

	const handleExportUsers = () => {
		const rows = selectedUsers.length > 0 ? selectedUsers : filtered;
		downloadUsersCsv(rows);
	};

	const applyInfoUpdate = (
		updates: { id: string; firstName: string; lastName: string }[],
	) => {
		const map = new Map(updates.map((u) => [u.id, u]));
		setUsers((list) =>
			list.map((u) =>
				map.has(u.id)
					? { ...u, firstName: map.get(u.id)!.firstName, lastName: map.get(u.id)!.lastName }
					: u,
			),
		);
		clearSelection();
	};

	const applyTypeUpdate = (updates: { id: string; userType: User["userType"] }[]) => {
		const map = new Map(updates.map((u) => [u.id, u.userType]));
		setUsers((list) =>
			list.map((u) => (map.has(u.id) ? { ...u, userType: map.get(u.id)! } : u)),
		);
		clearSelection();
	};

	const applyBulkDelete = (ids: string[]) => {
		const set = new Set(ids);
		setUsers((list) => list.filter((u) => !set.has(u.id)));
		clearSelection();
	};

	const handleInviteSubmit = (invited: InvitedUser[], access: AccessEntry[]) => {
		const today = new Date().toLocaleDateString("en-US", {
			month: "short",
			day: "2-digit",
			year: "numeric",
		});
		const productAccess = access.find((a) => a.kind === "product");
		const firstInstance = productAccess?.instances[0];
		const newUsers: User[] = invited.map((u, i) => ({
			id: `u-new-${Date.now()}-${i}`,
			firstName: u.first,
			lastName: u.last,
			email: u.email,
			activationStatus: "N/A",
			createdDate: today,
			lastActiveDate: null,
			userType: "Local",
			product: productAccess?.name ?? PRODUCTS[0],
			instance: firstInstance?.name ?? INSTANCES[0],
			project: PROJECTS[0],
			role: firstInstance?.roles[0] ?? ROLES[0],
		}));
		setUsers((prev) => [...newUsers, ...prev]);
		setActiveTab("all");
		setFilters(DEFAULT_FILTERS);
		setCurrentPage(1);
	};

	const handleStagingImport = (staged: StagingUser[]) => {
		const today = new Date().toLocaleDateString("en-US", {
			month: "short",
			day: "2-digit",
			year: "numeric",
		});

		const accessFromStaging = (u: StagingUser) => ({
			product:
				u.groupMatch === "matched" && u.product
					? u.product
					: u.product || PRODUCTS[0],
			instance:
				u.groupMatch === "matched" && u.instance
					? u.instance
					: u.instance || INSTANCES[0],
			role:
				u.groupMatch === "matched" && u.role
					? u.role
					: u.role || ROLES[0],
		});

		const overrides = staged.filter((u) => u.resolution === "override");
		const creates = staged.filter((u) => u.resolution !== "override");

		setUsers((prev) => {
			let next = prev.map((ex) => {
				const hit = overrides.find(
					(u) => u.email.toLowerCase() === ex.email.toLowerCase(),
				);
				if (!hit) return ex;
				const access = accessFromStaging(hit);
				return {
					...ex,
					firstName: hit.first || ex.firstName,
					lastName: hit.last || ex.lastName,
					product: access.product,
					instance: access.instance,
					role: access.role,
				};
			});

			const existingEmails = new Set(
				next.map((u) => u.email.toLowerCase()),
			);
			const newUsers: User[] = creates
				.filter((u) => !existingEmails.has(u.email.toLowerCase()))
				.map((u, i) => {
					const access = accessFromStaging(u);
					return {
						id: `u-import-${Date.now()}-${i}`,
						firstName: u.first,
						lastName: u.last,
						email: u.email,
						activationStatus: "N/A" as const,
						createdDate: today,
						lastActiveDate: null,
						userType: "Local" as const,
						product: access.product,
						instance: access.instance,
						project: PROJECTS[0],
						role: access.role,
					};
				});

			return newUsers.length > 0 ? [...newUsers, ...next] : next;
		});

		if (overrides.length === 0 && creates.length === 0) return;
		setActiveTab("all");
		setFilters(DEFAULT_FILTERS);
		setCurrentPage(1);
	};

	const existingUserAccess = useMemo(
		() =>
			users.map((u) => ({
				email: u.email,
				product: u.product,
				instance: u.instance,
				role: u.role,
			})),
		[users],
	);

	return (
		<Box>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
				<Box display="flex" alignItems="center" gap="12">
					<Heading level="2">Users</Heading>
				</Box>
				<Box display="flex" alignItems="center" gap="8">
					<Button
						appearance="default"
						addonBefore={<IconFileExport size={16} />}
						onClick={handleExportUsers}
						disabled={selectedUsers.length === 0 && filtered.length === 0}
					>
						Export User
					</Button>
					<Menu
						options={[
							{
								label: "Import users",
								execute: () => {
									setImportMode("users");
									setImportPanelOpen(true);
								},
							},
							{
								label: "Import by group access",
								execute: () => {
									setImportMode("groupAccess");
									setImportPanelOpen(true);
								},
							},
						]}
					>
						<MenuTrigger asChild>
							<Button
								appearance="default"
								addonBefore={<IconFileImport size={16} />}
								icon={<IconAngleDown size={16} />}
								iconPosition="end"
							>
								Import User
							</Button>
						</MenuTrigger>
						<MenuContent />
					</Menu>
					<Menu
						options={[
							{
								label: "Invite manually",
								execute: () => {
									setInviteMode("manual");
									setInvitePanelOpen(true);
								},
							},
							{
								label: "Bulk invite",
								execute: () => {
									setInviteMode("upload");
									setInvitePanelOpen(true);
								},
							},
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

			{activeTab === "upload" ? (
				<UploadsTab
					files={uploadFiles}
					staging={stagingUsers}
					setStaging={setStagingUsers}
					onViewDetails={setDetailUpload}
					onImportUsers={handleStagingImport}
					existingUsers={existingUserAccess}
					onOpenImport={() => {
						setImportMode("users");
						setImportPanelOpen(true);
					}}
				/>
			) : activeTab === "invitations" ? (
				<Box
					p="32"
					textAlign="center"
					rounded="md"
					borderColor="border.tertiary"
					border="1"
				>
					<Text color="fg.tertiary">
						Invitations view is not yet implemented.
					</Text>
				</Box>
			) : (
				<>
					<Box display="flex" flexDirection="column" gap="12" mb="16">
						<Box display="flex" alignItems="center" gap="16" > 
							<Box style={{ width: 280 }}>
								<SearchInput
									size="lg"
									placeholder="Search users by name or email"
									value={filters.search}
									onChange={(e) =>
										setFilters((f) => ({ ...f, search: e.target.value }))
									}
								/>
							</Box>
							<Box
								display="inline-flex"
								border="1"
								rounded="sm"
								style={{
									position: "relative",
									borderColor: "var(--ax-colors-bg-accent-subtle-hovered)",
								}}
							>
								<Button
									appearance="subtle"
									size="lg"
									icon={<IconFilter />}
									onClick={() => setFiltersOpen((open) => !open)}
									aria-expanded={filtersOpen}
								>
									Filter
								</Button>
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
									<Button
										appearance="default"
										size="sm"
										onClick={() => setBulkModal("editAccess")}
									>
										Edit access
									</Button>
									<Button
										appearance="default"
										size="sm"
										onClick={() => setBulkModal("addAccess")}
									>
										Add access
									</Button>
									<Button
										appearance="default"
										size="sm"
										onClick={() => setBulkModal("removeAccess")}
									>
										Remove access
									</Button>
									<Menu
										options={[
											{
												label: "Edit user info",
												execute: () => setBulkModal("editInfo"),
											},
											{
												label: "Edit user type",
												execute: () => setBulkModal("editType"),
											},
											{
												label: "Reset password",
												execute: () => setBulkModal("resetPw"),
											},
											{
												intent: "danger",
												label: "Delete selected users",
												execute: () => setBulkModal("delete"),
											},
										]}
									>
										<MenuTrigger asChild>
											<Button
												appearance="default"
												size="sm"
												addonAfter={<IconAngleDown size={14} />}
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
						) : (
							<Box p="12" border="1" borderColor="border.secondary" rounded="md">
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

			<InviteUserPanel
				open={invitePanelOpen}
				mode={inviteMode}
				onClose={() => setInvitePanelOpen(false)}
				onSubmit={handleInviteSubmit}
			/>

			<BulkActionModals
				modal={bulkModal}
				users={selectedUsers}
				onClose={() => setBulkModal(null)}
				onUpdateInfo={applyInfoUpdate}
				onUpdateType={applyTypeUpdate}
				onDeleteUsers={applyBulkDelete}
				onClearSelection={clearSelection}
			/>

			<ImportUsersPanel
				open={importPanelOpen}
				onClose={() => setImportPanelOpen(false)}
				onViewDetails={setDetailUpload}
				recentUploads={uploadFiles}
				systemEmails={systemEmails}
				mode={importMode}
				onJobUpdate={(job) => {
					setUploadFiles((prev) => upsertUpload(prev, job));
					setDetailUpload((cur) => (cur?.id === job.id ? job : cur));
				}}
				onJobComplete={(job, staged) => {
					setUploadFiles((prev) => upsertUpload(prev, job));
					setStagingUsers((prev) => {
						const without = prev.filter((u) => u.uploadId !== job.id);
						return [...staged, ...without];
					});
					setActiveTab("upload");
					setImportPanelOpen(false);
				}}
				onGoToUploadTab={() => setActiveTab("upload")}
			/>

			{detailUpload && (
				<UploadDetailsModal
					upload={detailUpload}
					onClose={() => setDetailUpload(null)}
				/>
			)}
		</Box>
	);
}

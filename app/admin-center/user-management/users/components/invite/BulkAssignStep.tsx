"use client";

import { useEffect, useMemo, useState } from "react";
import {
	Badge,
	Banner,
	Box,
	Button,
	Heading,
	SearchInput,
	Text,
} from "@optiaxiom/react";
import {
	IconAngleDown,
	IconPen,
	IconTrashCan,
	IconUsers,
} from "@optiaxiom/icons";
import {
	AccessCard,
	ProductAccessStep,
	type AccessEntry,
} from "../ProductAccessStep";
import { CollapsibleUserList } from "./CollapsibleUserList";
import {
	summarizeAccess,
	type AccessCluster,
	type InvitedUser,
} from "./types";

type Phase = "select" | "access" | "edit";

export type BulkSelectBarState = {
	count: number;
	onSetProduct: () => void;
	onSetGroup: () => void;
} | null;

export function BulkAssignStep({
	users,
	clusters,
	setClusters,
	onBusyChange,
	onSelectBarChange,
	presetProduct,
}: {
	users: InvitedUser[];
	clusters: AccessCluster[];
	setClusters: (c: AccessCluster[]) => void;
	onBusyChange?: (busy: boolean) => void;
	onSelectBarChange?: (bar: BulkSelectBarState) => void;
	presetProduct?: string;
}) {
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [pendingAccess, setPendingAccess] = useState<AccessEntry[]>([]);
	const [phase, setPhase] = useState<Phase>("select");
	const [accessKind, setAccessKind] = useState<"product" | "group">("product");
	const [editorOpen, setEditorOpen] = useState(false);
	const [expandedCluster, setExpandedCluster] = useState<string | null>(null);
	const [editingClusterId, setEditingClusterId] = useState<string | null>(null);
	const [accessKey, setAccessKey] = useState(0);
	const [userQuery, setUserQuery] = useState("");

	const assignedEmails = useMemo(() => {
		const set = new Set<string>();
		for (const c of clusters) {
			for (const email of c.userEmails) set.add(email);
		}
		return set;
	}, [clusters]);

	const remaining = useMemo(
		() => users.filter((u) => !assignedEmails.has(u.email)),
		[users, assignedEmails],
	);

	const filteredRemaining = useMemo(() => {
		const q = userQuery.trim().toLowerCase();
		if (!q) return remaining;
		return remaining.filter((u) => {
			const fullName = `${u.first} ${u.last}`.toLowerCase();
			return (
				u.email.toLowerCase().includes(q) ||
				fullName.includes(q) ||
				u.first.toLowerCase().includes(q) ||
				u.last.toLowerCase().includes(q)
			);
		});
	}, [remaining, userQuery]);

	const selectedUsers = useMemo(
		() => remaining.filter((u) => selected.has(u.email)),
		[remaining, selected],
	);

	const editingCluster = useMemo(
		() => clusters.find((c) => c.id === editingClusterId) ?? null,
		[clusters, editingClusterId],
	);

	const editingUsers = useMemo(() => {
		if (!editingCluster) return [] as InvitedUser[];
		const map = new Map(users.map((u) => [u.email, u]));
		return editingCluster.userEmails
			.map((e) => map.get(e))
			.filter(Boolean) as InvitedUser[];
	}, [editingCluster, users]);

	const toggle = (email: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(email)) next.delete(email);
			else next.add(email);
			return next;
		});
	};

	const toggleAll = (checked: boolean) => {
		setSelected((prev) => {
			if (!checked) {
				// Deselect only the currently visible (filtered) rows.
				const next = new Set(prev);
				for (const u of filteredRemaining) next.delete(u.email);
				return next;
			}
			const next = new Set(prev);
			for (const u of filteredRemaining) next.add(u.email);
			return next;
		});
	};

	const setBusy = (busy: boolean) => onBusyChange?.(busy);

	const goToAccess = (kind: "product" | "group") => {
		if (selected.size === 0) return;
		setAccessKind(kind);
		setEditingClusterId(null);
		setPhase("access");
		setPendingAccess([]);
		setAccessKey((k) => k + 1);
		setBusy(true);
	};

	useEffect(() => {
		if (phase === "select" && selected.size > 0) {
			onSelectBarChange?.({
				count: selected.size,
				onSetProduct: () => goToAccess("product"),
				onSetGroup: () => goToAccess("group"),
			});
		} else {
			onSelectBarChange?.(null);
		}
		return () => onSelectBarChange?.(null);
	}, [phase, selected.size, onSelectBarChange]);

	const startEditCluster = (cluster: AccessCluster) => {
		setEditingClusterId(cluster.id);
		setExpandedCluster(cluster.id);
		setPendingAccess(cluster.access.map((a) => ({
			...a,
			instances: a.instances.map((i) => ({ ...i, roles: [...i.roles] })),
		})));
		setPhase("edit");
		setAccessKey((k) => k + 1);
		setEditorOpen(false);
		setBusy(true);
	};

	const handleEditorChange = (open: boolean) => {
		setEditorOpen(open);
		setBusy(open || phase === "access" || phase === "edit");
	};

	const applyCluster = () => {
		if (selectedUsers.length === 0 || pendingAccess.length === 0 || editorOpen) {
			return;
		}
		const next: AccessCluster = {
			id: `cluster-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
			label: `Batch ${clusters.length + 1}`,
			userEmails: selectedUsers.map((u) => u.email),
			access: pendingAccess,
		};
		setClusters([...clusters, next]);
		setSelected(new Set());
		setPendingAccess([]);
		setPhase("select");
		setEditingClusterId(null);
		setEditorOpen(false);
		setBusy(false);
	};

	const saveEditedCluster = () => {
		if (!editingClusterId || pendingAccess.length === 0 || editorOpen) return;
		setClusters(
			clusters.map((c) =>
				c.id === editingClusterId ? { ...c, access: pendingAccess } : c,
			),
		);
		setPendingAccess([]);
		setEditingClusterId(null);
		setPhase("select");
		setEditorOpen(false);
		setBusy(false);
	};

	const removeCluster = (id: string) => {
		if (editingClusterId === id) {
			setEditingClusterId(null);
			setPendingAccess([]);
			setPhase("select");
			setBusy(false);
		}
		setClusters(clusters.filter((c) => c.id !== id));
		if (expandedCluster === id) setExpandedCluster(null);
	};

	const cancelAccess = () => {
		setPendingAccess([]);
		setEditingClusterId(null);
		setPhase("select");
		setEditorOpen(false);
		setBusy(false);
	};

	const usersByEmail = useMemo(() => {
		const map = new Map(users.map((u) => [u.email, u]));
		return map;
	}, [users]);

	const isEditing = phase === "edit";
	const isAccessing = phase === "access" || isEditing;

	return (
		<Box display="flex" flexDirection="column" gap="20">
			<Box display="flex" flexDirection="column" gap="4">
				<Heading level="4">Assign access by batch</Heading>
				<Text fontSize="md" color="fg.secondary">
					Select users, set product access or group access, then apply as a
					batch. Repeat for other users. You can edit any saved batch before
					continuing.
				</Text>
			</Box>

			<Box display="flex" alignItems="center" gap="8" flexWrap="wrap">
				<Badge variant="subtle">{users.length} imported</Badge>
				<Badge intent="primary" variant="subtle">
					{assignedEmails.size} in batches
				</Badge>
				<Badge variant="subtle">{remaining.length} remaining</Badge>
			</Box>

			{clusters.length > 0 && !isAccessing && (
				<Box display="flex" flexDirection="column" gap="8">
					<Text fontWeight="600" fontSize="sm" color="fg.secondary">
						Saved batches
					</Text>
					{clusters.map((cluster) => {
						const open = expandedCluster === cluster.id;
						const clusterUsers = cluster.userEmails
							.map((e) => usersByEmail.get(e))
							.filter(Boolean) as InvitedUser[];
						return (
							<Box
								key={cluster.id}
								rounded="md"
								border="1"
								borderColor="border.default"
								bg="bg.default"
							>
								<Box
									display="flex"
									alignItems="center"
									gap="12"
									px="16"
									py="12"
									cursor="pointer"
									onClick={() =>
										setExpandedCluster(open ? null : cluster.id)
									}
								>
									<IconUsers
										size={16}
										color="var(--ax-colors-fg-tertiary)"
									/>
									<Box flex="1" minW="0">
										<Text fontWeight="600">{cluster.label}</Text>
										<Text fontSize="sm" color="fg.secondary">
											{`${cluster.userEmails.length} user${
												cluster.userEmails.length === 1 ? "" : "s"
											} · ${summarizeAccess(cluster.access)}`}
										</Text>
									</Box>
									<Box
										style={{
											display: "inline-flex",
											transform: open ? "rotate(180deg)" : "rotate(0deg)",
											transition: "transform 150ms ease",
										}}
									>
										<IconAngleDown
											size={16}
											color="var(--ax-colors-fg-secondary)"
										/>
									</Box>
								</Box>
								{open && (
									<Box
										px="16"
										pb="16"
										display="flex"
										flexDirection="column"
										gap="12"
										borderT="1"
										borderColor="border.tertiary"
										pt="12"
									>
										<Box display="flex" flexDirection="column" gap="8">
											<Text fontSize="sm" fontWeight="600" color="fg.secondary">
												Users
											</Text>
											<CollapsibleUserList users={clusterUsers} limit={4} />
										</Box>
										<Box display="flex" flexDirection="column" gap="8">
											<Text fontSize="sm" fontWeight="600" color="fg.secondary">
												Access
											</Text>
											{cluster.access.map((entry) => (
												<AccessCard
													key={entry.id}
													entry={entry}
													defaultOpen
													readOnly
												/>
											))}
										</Box>
										<Box display="flex" justifyContent="end" gap="8">
											<Button
												appearance="default"
												size="sm"
												icon={<IconPen size={14} />}
												iconPosition="start"
												onClick={() => startEditCluster(cluster)}
											>
												Edit access
											</Button>
											<Button
												appearance="subtle"
												size="sm"
												icon={<IconTrashCan size={14} />}
												iconPosition="start"
												onClick={() => removeCluster(cluster.id)}
											>
												Remove batch
											</Button>
										</Box>
									</Box>
								)}
							</Box>
						);
					})}
				</Box>
			)}

			{phase === "select" && (
				<Box display="flex" flexDirection="column" gap="12">
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						gap="12"
					>
						<Box display="flex" flexDirection="column" gap="2">
							<Text fontWeight="600">1. Select users</Text>
							<Text fontSize="sm" color="fg.secondary">
								{selected.size > 0
									? `${selected.size} selected`
									: "Choose who gets the same access"}
							</Text>
						</Box>
					</Box>

					{remaining.length === 0 ? (
						<Banner intent="success">
							<Text fontSize="sm">
								All imported users are in a batch. Edit any batch above, or
								continue to preview.
							</Text>
						</Banner>
					) : (
						<>
							<SearchInput
								placeholder="Search by name or email"
								value={userQuery}
								onChange={(e) => setUserQuery(e.target.value)}
								aria-label="Search users by name or email"
							/>
							{filteredRemaining.length === 0 ? (
								<Text fontSize="sm" color="fg.tertiary">
									No users match “{userQuery.trim()}”.
								</Text>
							) : (
								<CollapsibleUserList
									users={filteredRemaining}
									limit={8}
									selectable
									selectedEmails={selected}
									onToggle={toggle}
									onToggleAll={toggleAll}
									emptyLabel="No users"
								/>
							)}
							{userQuery.trim() && filteredRemaining.length > 0 && (
								<Text fontSize="sm" color="fg.tertiary">
									{`Showing ${filteredRemaining.length} of ${remaining.length} remaining`}
								</Text>
							)}
						</>
					)}
				</Box>
			)}

			{isAccessing && (
				<Box display="flex" flexDirection="column" gap="16">
					<Box display="flex" flexDirection="column" gap="8">
						<Text fontWeight="600">
							{isEditing
								? `Edit access · ${editingCluster?.label ?? "Batch"}`
								: `2. Set access for ${selectedUsers.length} user${
										selectedUsers.length === 1 ? "" : "s"
									}`}
						</Text>
						<Text fontSize="sm" color="fg.secondary">
							{isEditing
								? "Update product access, group access, or roles for this batch, then save."
								: "Add product access or group access. You can edit roles after saving the batch."}
						</Text>
						<Box
							rounded="md"
							border="1"
							borderColor="border.tertiary"
							bg="bg.page"
							p="12"
						>
							<CollapsibleUserList
								users={isEditing ? editingUsers : selectedUsers}
								limit={4}
							/>
						</Box>
					</Box>

					<ProductAccessStep
						key={accessKey}
						accessList={pendingAccess}
						setAccessList={setPendingAccess}
						onEditorChange={handleEditorChange}
						presetProduct={presetProduct}
						autoOpenWhenEmpty={!isEditing}
						showGroupAccess
						initialKind={accessKind}
					/>

					<Box display="flex" justifyContent="end" gap="8">
						<Button appearance="subtle" onClick={cancelAccess}>
							{isEditing ? "Cancel" : "Back to selection"}
						</Button>
						<Button
							appearance="primary"
							disabled={
								pendingAccess.length === 0 ||
								editorOpen ||
								(!isEditing && selectedUsers.length === 0)
							}
							onClick={isEditing ? saveEditedCluster : applyCluster}
						>
							{isEditing ? "Save changes" : "Apply to selected"}
						</Button>
					</Box>
				</Box>
			)}
		</Box>
	);
}

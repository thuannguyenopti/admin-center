"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogBody,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	Badge,
	Box,
	Button,
	Field,
	Heading,
	Input,
	Text,
	Textarea,
	Tooltip,
	toaster,
} from "@optiaxiom/react";
import { IconXmark, IconTrashCan, IconCircleInfo } from "@optiaxiom/icons";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
	ProductAccessStep,
	type AccessEntry,
} from "../../users/components/ProductAccessStep";
import { BULK_IMPORT_USERS } from "../../users/data";
import { lookupUserByEmail, UserSearchInput } from "../../users/components/UserSearchInput";
import type { Group, GroupMember } from "../data";

const PANEL_WIDTH = 700;
type Tab = "info" | "users" | "access";

/** Fallback members/access for static seed groups that have no stored detail. */
function deriveMembers(group: Group): GroupMember[] {
	if (group.members) return group.members;
	return BULK_IMPORT_USERS.slice(0, Math.min(group.users, BULK_IMPORT_USERS.length)).map(
		(u) => ({ ...u, sourceGroupId: null }),
	);
}

function deriveAccess(group: Group): AccessEntry[] {
	if (group.access) return group.access;
	return [
		{
			id: `${group.id}-access`,
			kind: "product",
			name: group.product,
			instances: [{ name: group.instance, roles: [group.role] }],
		},
	];
}

export function GroupDetailPanel({
	group,
	onClose,
	onSave,
	onDelete,
}: {
	group: Group | null;
	onClose: () => void;
	onSave: (updated: Group) => void;
	onDelete: (group: Group) => void;
}) {
	const open = !!group;
	const [tab, setTab] = useState<Tab>("info");
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [members, setMembers] = useState<GroupMember[]>([]);
	const [access, setAccessList] = useState<AccessEntry[]>([]);
	const [editorOpen, setEditorOpen] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);

	// Snapshot of the original values to detect unsaved changes.
	const initial = useMemo(
		() =>
			group
				? JSON.stringify({
						name: group.name,
						description: group.description ?? "",
						members: deriveMembers(group),
						access: deriveAccess(group),
					})
				: "",
		[group],
	);

	useEffect(() => {
		if (!group) return;
		setTab("info");
		setName(group.name);
		setDescription(group.description ?? "");
		setMembers(deriveMembers(group));
		setAccessList(deriveAccess(group));
		setEditorOpen(false);
	}, [group]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prevOverflow;
		};
	}, [open, onClose]);

	if (!open || !group || typeof document === "undefined") return null;

	const dirty =
		JSON.stringify({ name, description, members, access }) !== initial &&
		name.trim().length > 0;

	const handleSave = () => {
		const now = new Date();
		const updated: Group = {
			...group,
			name: name.trim(),
			description: description.trim() || null,
			users: members.length,
			members,
			access,
			modifiedDate: now.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			}),
			modifiedTime: now.toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: true,
			}),
		};
		onSave(updated);
		toaster.create("Group updated", { intent: "success" });
		onClose();
	};

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
				aria-label="Group details"
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
					<Heading level="2">Group details</Heading>
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
						{/* Summary card */}
						<Box
							bg="bg.page"
							rounded="md"
							p="16"
							display="flex"
							flexDirection="column"
							gap="12"
						>
							<Box>
								<Text fontWeight="600">{group.name}</Text>
								{group.description && (
									<Text fontSize="sm" color="fg.secondary">
										{group.description}
									</Text>
								)}
							</Box>
							<Box display="flex" justifyContent="end">
								<Button
									appearance="danger-outline"
									size="sm"
									icon={<IconTrashCan size={14} />}
									iconPosition="start"
									onClick={() => setConfirmDelete(true)}
								>
									Delete this group
								</Button>
							</Box>
						</Box>

						{/* Tabs */}
						<Box
							display="flex"
							gap="24"
							borderB="1"
							borderColor="border.tertiary"
						>
							{(
								[
									["info", "Group info"],
									["users", "User list"],
									["access", "Product access"],
								] as const
							).map(([key, label]) => (
								<Box
									key={key}
									pb="12"
									cursor="pointer"
									borderB={tab === key ? "2" : "0"}
									onClick={() => setTab(key)}
									style={
										tab === key
											? { borderBottomColor: "var(--ax-colors-fg-default)" }
											: {}
									}
								>
									<Text
										fontWeight={tab === key ? "600" : "400"}
										color={tab === key ? "fg.default" : "fg.tertiary"}
									>
										{label}
									</Text>
								</Box>
							))}
						</Box>

						{tab === "info" && (
							<GroupInfoTab
								group={group}
								name={name}
								setName={setName}
								description={description}
								setDescription={setDescription}
							/>
						)}
						{tab === "users" && (
							<UserListTab members={members} setMembers={setMembers} />
						)}
						{tab === "access" && (
							<ProductAccessStep
								accessList={access}
								setAccessList={setAccessList}
								onEditorChange={setEditorOpen}
								autoOpenWhenEmpty={false}
								showGroupAccess={false}
							/>
						)}
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
					<Button appearance="subtle" onClick={onClose}>
						Cancel
					</Button>
					<Button
						appearance="primary"
						disabled={!dirty || editorOpen}
						onClick={handleSave}
					>
						Save
					</Button>
				</Box>
			</Box>

			<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
				<AlertDialogContent>
					<AlertDialogHeader>Delete this group</AlertDialogHeader>
					<AlertDialogBody>
						Are you sure you want to delete this group? Deleting this group will remove
						all assigned users and product access associated with it. Users will lose
						access granted through this group. This action cannot be undone.
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel />
						<AlertDialogAction
							appearance="danger"
							onClick={() => {
								setConfirmDelete(false);
								onDelete(group);
								onClose();
							}}
						>
							Delete group
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>,
		document.body,
	);
}

function GroupInfoTab({
	group,
	name,
	setName,
	description,
	setDescription,
}: {
	group: Group;
	name: string;
	setName: (v: string) => void;
	description: string;
	setDescription: (v: string) => void;
}) {
	return (
		<Box display="flex" flexDirection="column" gap="16">
			<Field
				label={
					<Box display="inline-flex" alignItems="center" gap="4">
						<span>Group name</span>
						<Text asChild color="fg.error">
							<span>*</span>
						</Text>
					</Box>
				}
			>
				<Input
					value={name}
					placeholder="Enter a group name"
					onChange={(e) => setName(e.target.value)}
				/>
			</Field>

			<Field label="Description">
				<Textarea
					value={description}
					placeholder="Enter description"
					rows={4}
					onChange={(e) => setDescription(e.target.value)}
				/>
			</Field>

			<Box>
				<Box display="inline-flex" alignItems="center" gap="4" mb="4">
					<Text fontSize="sm" color="fg.secondary">
						Group type
					</Text>
					<Tooltip content="Custom groups are created manually. Product groups are generated automatically for a product instance.">
						<span style={{ display: "inline-flex" }}>
							<IconCircleInfo size={14} color="var(--ax-colors-fg-tertiary)" />
						</span>
					</Tooltip>
				</Box>
				<Box>
					<Badge intent={group.groupType === "Custom" ? "primary" : "neutral"} variant="strong">
						{group.groupType}
					</Badge>
				</Box>
			</Box>

			<Box>
				<Text fontSize="sm" color="fg.secondary">
					Created date
				</Text>
				<Text fontWeight="600">
					{group.createdDate} at {group.createdTime}
				</Text>
			</Box>

			<Box>
				<Text fontSize="sm" color="fg.secondary">
					Modified
				</Text>
				<Text fontWeight="600">
					{group.modifiedDate} at {group.modifiedTime}
				</Text>
			</Box>
		</Box>
	);
}

function UserListTab({
	members,
	setMembers,
}: {
	members: GroupMember[];
	setMembers: (m: GroupMember[]) => void;
}) {
	const [query, setQuery] = useState("");

	const addUser = (user: { email: string; first: string; last: string }) => {
		if (members.some((m) => m.email === user.email)) {
			setQuery("");
			return;
		}
		setMembers([...members, { ...user, sourceGroupId: null }]);
		setQuery("");
	};

	const addManual = (raw: string) => {
		const email = raw.trim();
		const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
		if (!emailValid || members.some((m) => m.email === email)) {
			setQuery("");
			return;
		}
		const existing = lookupUserByEmail(email);
		setMembers([
			...members,
			{
				email,
				first: existing?.first ?? "",
				last: existing?.last ?? "",
				sourceGroupId: null,
			},
		]);
		setQuery("");
	};

	const filtered = members
		.map((m, i) => ({ m, i }))
		.filter(({ m }) =>
			query.trim()
				? `${m.email} ${m.first} ${m.last}`.toLowerCase().includes(query.trim().toLowerCase())
				: true,
		);

	return (
		<Box display="flex" flexDirection="column" gap="16">
			<Field
				label={
					<Box display="inline-flex" alignItems="center" gap="4">
						<span>Search and select user to add</span>
						<Tooltip content="Search by name or email to find and add an existing user, or filter the list below.">
							<span style={{ display: "inline-flex" }}>
								<IconCircleInfo size={14} color="var(--ax-colors-fg-tertiary)" />
							</span>
						</Tooltip>
					</Box>
				}
			>
				<UserSearchInput
					value={query}
					onChange={setQuery}
					onSelectUser={addUser}
					excludeEmails={members.map((m) => m.email)}
					placeholder="Search by name or email"
					onEnterManual={addManual}
				/>
			</Field>

			{members.length > 0 ? (
				<Table>
					<thead>
						<Tr>
							<Th>Email</Th>
							<Th>First name</Th>
							<Th>Last name</Th>
							<Th style={{ width: 48 }} />
						</Tr>
					</thead>
					<tbody>
						{filtered.map(({ m, i }) => (
							<Tr key={`${m.email}-${i}`}>
								<Td>{m.email}</Td>
								<Td>
									{m.first || (
										<Text asChild color="fg.tertiary">
											<span>—</span>
										</Text>
									)}
								</Td>
								<Td>
									{m.last || (
										<Text asChild color="fg.tertiary">
											<span>—</span>
										</Text>
									)}
								</Td>
								<Td type="raw" style={{ width: 48, textAlign: "right" }}>
									<Button
										appearance="subtle"
										size="sm"
										icon={<IconTrashCan size={16} />}
										aria-label={`Remove ${m.email}`}
										onClick={() => setMembers(members.filter((_, j) => j !== i))}
									/>
								</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			) : (
				<Box py="32" textAlign="center">
					<Text color="fg.tertiary">No user is added</Text>
				</Box>
			)}
		</Box>
	);
}

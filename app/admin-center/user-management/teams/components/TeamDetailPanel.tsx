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
import { SingleSelectMenu } from "../../users/components/ProductAccessStep";
import { BULK_IMPORT_USERS, INSTANCES } from "../../users/data";
import { lookupUserByEmail, UserSearchInput } from "../../users/components/UserSearchInput";
import type { Team, TeamMember } from "../data";

const PANEL_WIDTH = 700;
const TEAM_PRODUCT = "Content Marketing Platform";
type Tab = "info" | "users" | "access";

/** Fallback members for seed teams that have no stored member list. */
function deriveMembers(team: Team): TeamMember[] {
	if (team.members) return team.members;
	return BULK_IMPORT_USERS.slice(0, 10).map((u) => ({ ...u, sourceTeamId: null }));
}

export function TeamDetailPanel({
	team,
	onClose,
	onSave,
	onDelete,
}: {
	team: Team | null;
	onClose: () => void;
	onSave: (updated: Team) => void;
	onDelete: (team: Team) => void;
}) {
	const open = !!team;
	const [tab, setTab] = useState<Tab>("info");
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [instance, setInstance] = useState("");
	const [members, setMembers] = useState<TeamMember[]>([]);
	const [confirmDelete, setConfirmDelete] = useState(false);

	const initial = useMemo(
		() =>
			team
				? JSON.stringify({
						name: team.name,
						description: team.description ?? "",
						instance: team.instanceName,
						members: deriveMembers(team),
					})
				: "",
		[team],
	);

	useEffect(() => {
		if (!team) return;
		setTab("info");
		setName(team.name);
		setDescription(team.description ?? "");
		setInstance(team.instanceName);
		setMembers(deriveMembers(team));
	}, [team]);

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

	if (!open || !team || typeof document === "undefined") return null;

	const dirty =
		JSON.stringify({ name, description, instance, members }) !== initial &&
		name.trim().length > 0;

	const handleSave = () => {
		const now = new Date();
		const updated: Team = {
			...team,
			name: name.trim(),
			description: description.trim() || null,
			productName: TEAM_PRODUCT,
			instanceName: instance,
			members,
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
		toaster.create("Team updated", { intent: "success" });
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
				aria-label="Team details"
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
					<Heading level="2">Team details</Heading>
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
								<Text fontWeight="600">{team.name}</Text>
								{team.description && (
									<Text fontSize="sm" color="fg.secondary">
										{team.description}
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
									Delete this team
								</Button>
							</Box>
						</Box>

						{/* Tabs */}
						<Box display="flex" gap="24" borderB="1" borderColor="border.tertiary">
							{(
								[
									["info", "Team info"],
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
							<TeamInfoTab
								team={team}
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
							<ProductAccessTab instance={instance} setInstance={setInstance} />
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
					<Button appearance="primary" disabled={!dirty} onClick={handleSave}>
						Save
					</Button>
				</Box>
			</Box>

			<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
				<AlertDialogContent>
					<AlertDialogHeader>Delete this team</AlertDialogHeader>
					<AlertDialogBody>
						Are you sure you want to delete this team? Deleting this team will remove
						all assigned users and product access associated with it. Users will lose
						access granted through this team. This action cannot be undone.
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel />
						<AlertDialogAction
							appearance="danger"
							onClick={() => {
								setConfirmDelete(false);
								onDelete(team);
								onClose();
							}}
						>
							Delete team
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>,
		document.body,
	);
}

function TeamInfoTab({
	team,
	name,
	setName,
	description,
	setDescription,
}: {
	team: Team;
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
						<span>Team name</span>
						<Text asChild color="fg.error">
							<span>*</span>
						</Text>
					</Box>
				}
			>
				<Input
					value={name}
					placeholder="Enter a team name"
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
				<Text fontSize="sm" color="fg.secondary">
					Product name
				</Text>
				<Text fontWeight="600">{team.productName}</Text>
			</Box>

			<Box>
				<Text fontSize="sm" color="fg.secondary">
					Created date
				</Text>
				<Text fontWeight="600">
					{team.createdDate} at {team.createdTime}
				</Text>
			</Box>

			<Box>
				<Text fontSize="sm" color="fg.secondary">
					Modified
				</Text>
				<Text fontWeight="600">
					{team.modifiedDate} at {team.modifiedTime}
				</Text>
			</Box>
		</Box>
	);
}

function UserListTab({
	members,
	setMembers,
}: {
	members: TeamMember[];
	setMembers: (m: TeamMember[]) => void;
}) {
	const [query, setQuery] = useState("");

	const addUser = (user: { email: string; first: string; last: string }) => {
		if (members.some((m) => m.email === user.email)) {
			setQuery("");
			return;
		}
		setMembers([...members, { ...user, sourceTeamId: null }]);
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
				sourceTeamId: null,
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

function ProductAccessTab({
	instance,
	setInstance,
}: {
	instance: string;
	setInstance: (v: string) => void;
}) {
	return (
		<Box display="flex" flexDirection="column" gap="16">
			<Field
				label={
					<Box display="inline-flex" alignItems="center" gap="4">
						<span>Product</span>
						<Text asChild color="fg.error">
							<span>*</span>
						</Text>
					</Box>
				}
			>
				<SingleSelectMenu
					label="Product"
					value={TEAM_PRODUCT}
					options={[TEAM_PRODUCT]}
					onChange={() => {}}
				/>
			</Field>

			<Field
				label={
					<Box display="inline-flex" alignItems="center" gap="4">
						<span>Instance</span>
						<Text asChild color="fg.error">
							<span>*</span>
						</Text>
					</Box>
				}
			>
				<SingleSelectMenu
					label="Instance"
					value={instance}
					options={INSTANCES as readonly string[]}
					onChange={setInstance}
				/>
			</Field>
		</Box>
	);
}

"use client";

import { useState } from "react";
import { Banner, Box, Button, Text, toaster } from "@optiaxiom/react";
import { IconAngleDown, IconAngleRight, IconUsers } from "@optiaxiom/icons";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { ROLES, type User } from "../../data";
import { SingleSelectMenu } from "../ProductAccessStep";
import { BulkModalShell } from "./BulkModalShell";

type EAUser = { email: string; first: string; last: string };
type EARoleGroup = { id: string; role: string; affected: EAUser[] };
type EAProject = { project: string; roleGroups: EARoleGroup[] };
type EAInstance = { instance: string; projects: EAProject[] };
type EAProduct = { id: string; product: string; sharedBy: number; instances: EAInstance[] };

const SAMPLE_AFFECTED: EAUser[] = [
	{ email: "morgan.clark@optimizely.com", first: "Morgan", last: "Ella" },
	{ email: "riley.green@optimizely.com", first: "Riley", last: "Tara" },
	{ email: "casey.white@optimizely.com", first: "Casey", last: "Zara" },
];

// Prototype: shared access aggregated across the selected users.
const SHARED_ACCESS: EAProduct[] = [
	{
		id: "admin-center",
		product: "Admin center",
		sharedBy: 5,
		instances: [
			{
				instance: "Admin Center",
				projects: [
					{
						project: "Admin Center",
						roleGroups: [
							{ id: "ac-superadmin", role: "Super Admin", affected: SAMPLE_AFFECTED },
						],
					},
				],
			},
		],
	},
	{
		id: "experimentation",
		product: "Experimentation",
		sharedBy: 5,
		instances: [
			{
				instance: "Capita Experimentation",
				projects: [
					{
						project: "Capita 1",
						roleGroups: [
							{ id: "exp-admin", role: "Administrator", affected: SAMPLE_AFFECTED },
							{ id: "exp-editor", role: "Editor", affected: SAMPLE_AFFECTED },
							{ id: "exp-publisher", role: "Publisher", affected: SAMPLE_AFFECTED.slice(0, 2) },
						],
					},
				],
			},
			{
				instance: "Capita Experimentation 2",
				projects: [
					{
						project: "Capita 2",
						roleGroups: [
							{ id: "exp2-admin", role: "Administrator", affected: SAMPLE_AFFECTED },
						],
					},
				],
			},
			{
				instance: "Capita Experimentation 3",
				projects: [
					{
						project: "Capita 3",
						roleGroups: [
							{ id: "exp3-editor", role: "Editor", affected: SAMPLE_AFFECTED.slice(0, 2) },
						],
					},
				],
			},
		],
	},
];

function useExpandable(initial: string[] = []) {
	const [set, setSet] = useState<Set<string>>(new Set(initial));
	const toggle = (key: string) =>
		setSet((prev) => {
			const next = new Set(prev);
			next.has(key) ? next.delete(key) : next.add(key);
			return next;
		});
	return [set, toggle] as const;
}

export function EditAccessModal({
	users,
	onClose,
	onSuccess,
}: {
	users: User[];
	onClose: () => void;
	onSuccess: () => void;
}) {
	const total = users.length;
	const [step, setStep] = useState<1 | 2>(1);
	const [draftRoles, setDraftRoles] = useState<Record<string, string>>({});
	const [openProducts, toggleProduct] = useExpandable(["experimentation"]);
	const [openInstances, toggleInstance] = useExpandable(["Capita Experimentation"]);
	const [openGroups, toggleGroup] = useExpandable([]);

	const roleOf = (g: EARoleGroup) => draftRoles[g.id] ?? g.role;
	const isChanged = (g: EARoleGroup) =>
		draftRoles[g.id] !== undefined && draftRoles[g.id] !== g.role;

	const handleApply = () => {
		toaster.create(`Access updated for ${total} user${total === 1 ? "" : "s"}`, {
			intent: "success",
		});
		onSuccess();
		onClose();
	};

	return (
		<BulkModalShell
			title="Edit access"
			variant="panel"
			onClose={onClose}
			footer={
				step === 1 ? (
					<Button appearance="primary" onClick={() => setStep(2)}>
						Continue
					</Button>
				) : (
					<>
						<Button appearance="subtle" onClick={() => setStep(1)}>
							Back
						</Button>
						<Button appearance="primary" onClick={handleApply}>
							Apply changes
						</Button>
					</>
				)
			}
		>
			<Box display="flex" flexDirection="column" gap="16">
				<Text fontWeight="600" fontSize="lg">
					Share access from selected users
				</Text>

				{step === 2 && (
					<Banner intent="success">
						<Text fontSize="sm">
							Any updated access will be highlighted to help you review changes before
							continuing.
						</Text>
					</Banner>
				)}

				{SHARED_ACCESS.map((product) => {
					const productOpen = openProducts.has(product.id);
					return (
						<Box
							key={product.id}
							rounded="md"
							border="1"
							borderColor="border.default"
						>
							{/* Product header */}
							<Box
								display="flex"
								alignItems="center"
								gap="12"
								px="16"
								py="12"
								cursor="pointer"
								onClick={() => toggleProduct(product.id)}
							>
								<IconUsers size={18} color="var(--ax-colors-fg-secondary)" />
								<Text fontWeight="600">{product.product}</Text>
								<Box flex="1" />
								<Text fontSize="sm" color="fg.tertiary">
									Access shared by {product.sharedBy} of {total} selected users.
								</Text>
								{productOpen ? (
									<IconAngleDown size={16} color="var(--ax-colors-fg-secondary)" />
								) : (
									<IconAngleRight size={16} color="var(--ax-colors-fg-secondary)" />
								)}
							</Box>

							{productOpen && (
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
									{product.instances.map((inst) => {
										const instOpen = openInstances.has(inst.instance);
										return (
											<Box key={inst.instance}>
												<Box
													display="flex"
													alignItems="center"
													gap="8"
													cursor="pointer"
													onClick={() => toggleInstance(inst.instance)}
												>
													{instOpen ? (
														<IconAngleDown size={16} color="var(--ax-colors-fg-secondary)" />
													) : (
														<IconAngleRight size={16} color="var(--ax-colors-fg-secondary)" />
													)}
													<Text>
														Instance:{" "}
														<Text asChild fontWeight="600">
															<span>{inst.instance}</span>
														</Text>
													</Text>
												</Box>

												{instOpen &&
													inst.projects.map((proj) => (
														<Box
															key={proj.project}
															pl="24"
															mt="8"
															display="flex"
															flexDirection="column"
															gap="8"
														>
															<Text>
																Project:{" "}
																<Text asChild fontWeight="600">
																	<span>{proj.project}</span>
																</Text>
															</Text>

															{proj.roleGroups.map((g) =>
																step === 1 ? (
																	<RoleGroupEdit
																		key={g.id}
																		group={g}
																		role={roleOf(g)}
																		onRole={(r) =>
																			setDraftRoles((prev) => ({ ...prev, [g.id]: r }))
																		}
																		open={openGroups.has(g.id)}
																		onToggle={() => toggleGroup(g.id)}
																	/>
																) : (
																	<RoleGroupReview
																		key={g.id}
																		role={roleOf(g)}
																		affected={g.affected.length}
																		changed={isChanged(g)}
																		open={openGroups.has(g.id)}
																		onToggle={() => toggleGroup(g.id)}
																		users={g.affected}
																	/>
																),
															)}
														</Box>
													))}
											</Box>
										);
									})}
								</Box>
							)}
						</Box>
					);
				})}
			</Box>
		</BulkModalShell>
	);
}

function AffectedTable({ users }: { users: EAUser[] }) {
	return (
		<Table>
			<thead>
				<Tr>
					<Th>Email</Th>
					<Th>First name</Th>
					<Th>Last name</Th>
				</Tr>
			</thead>
			<tbody>
				{users.map((u) => (
					<Tr key={u.email}>
						<Td>{u.email}</Td>
						<Td>{u.first}</Td>
						<Td>{u.last}</Td>
					</Tr>
				))}
			</tbody>
		</Table>
	);
}

function RoleGroupEdit({
	group,
	role,
	onRole,
	open,
	onToggle,
}: {
	group: EARoleGroup;
	role: string;
	onRole: (r: string) => void;
	open: boolean;
	onToggle: () => void;
}) {
	return (
		<Box display="flex" flexDirection="column" gap="8">
			<Box display="flex" alignItems="center" gap="12">
				<Box style={{ width: 220 }}>
					<SingleSelectMenu
						label="Role"
						value={role}
						options={ROLES as readonly string[]}
						onChange={onRole}
					/>
				</Box>
				<Box flex="1" />
				<Box
					display="flex"
					alignItems="center"
					gap="4"
					cursor="pointer"
					onClick={onToggle}
				>
					<Text fontSize="sm" color="fg.success" fontWeight="500">
						{group.affected.length} affected users
					</Text>
					{open ? (
						<IconAngleDown size={14} color="var(--ax-colors-fg-success)" />
					) : (
						<IconAngleRight size={14} color="var(--ax-colors-fg-success)" />
					)}
				</Box>
			</Box>
			{open && <AffectedTable users={group.affected} />}
		</Box>
	);
}

function RoleGroupReview({
	role,
	affected,
	changed,
	open,
	onToggle,
	users,
}: {
	role: string;
	affected: number;
	changed: boolean;
	open: boolean;
	onToggle: () => void;
	users: EAUser[];
}) {
	return (
		<Box
			rounded="sm"
			px="8"
			py="8"
			style={
				changed ? { background: "var(--ax-colors-bg-success-subtle)" } : undefined
			}
			display="flex"
			flexDirection="column"
			gap="8"
		>
			<Box display="flex" alignItems="center" gap="12">
				<Text>{role}</Text>
				<Box flex="1" />
				<Box
					display="flex"
					alignItems="center"
					gap="4"
					cursor="pointer"
					onClick={onToggle}
				>
					<Text fontSize="sm" color="fg.success" fontWeight="500">
						{affected} affected users
					</Text>
					{open ? (
						<IconAngleDown size={14} color="var(--ax-colors-fg-success)" />
					) : (
						<IconAngleRight size={14} color="var(--ax-colors-fg-success)" />
					)}
				</Box>
			</Box>
			{open && <AffectedTable users={users} />}
		</Box>
	);
}

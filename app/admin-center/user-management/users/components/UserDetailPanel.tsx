"use client";

import { useEffect, useState } from "react";
import {
	Box,
	Button,
	Heading,
	Input,
	SegmentedControl,
	SegmentedControlItem,
	Text,
	Tooltip,
} from "@optiaxiom/react";
import {
	IconPen,
	IconTrashCan,
	IconCircleInfo,
} from "@optiaxiom/icons";
import { PanelShell } from "@/app/admin-center/components/PanelShell";
import { type User, type UserType } from "../data";
import { ProductAccessStep, type AccessEntry } from "./ProductAccessStep";

const PANEL_WIDTH = 700;

/** Seed the editable access list from the user's granted product/instance/role. */
function deriveUserAccess(user: User): AccessEntry[] {
	return [
		{
			id: `${user.product}-0`,
			kind: "product",
			name: user.product,
			instances: [{ name: user.instance, roles: [user.role] }],
		},
	];
}

function StatusText({ status }: { status: User["activationStatus"] }) {
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

export function UserDetailPanel({
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
	const open = !!user;
	const [accessEntries, setAccessEntries] = useState<AccessEntry[]>([]);

	// Re-seed the editable access list only when a different user is opened
	// (keyed on id), so edits aren't reset while the panel stays open.
	useEffect(() => {
		if (user) setAccessEntries(deriveUserAccess(user));
	}, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<PanelShell
			open={open && !!user}
			onClose={onClose}
			title="User details"
			footer={<Button appearance="default" onClick={onClose}>Close</Button>}
		>
			{user && (
			<Box display="flex" flexDirection="column" gap="20">
						<Box bg="bg.page" rounded="md" p="16">
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
									<Box display="flex" alignItems="end" gap="32" mt="12">
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

						<Box
							display="flex"
							gap="24"
							borderB="1"
							borderColor="border.tertiary"
						>
							{(["info", "product", "group"] as const).map((t) => (
								<Box
									key={t}
									pb="12"
									cursor="pointer"
									borderB={tab === t ? "2" : "0"}
									onClick={() => onTabChange(t)}
									style={
										tab === t
											? { borderBottomColor: "var(--ax-colors-fg-default)" }
											: {}
									}
								>
									<Text
										fontWeight={tab === t ? "500" : "400"}
										color={tab === t ? "fg.default" : "fg.tertiary"}
									>
										{t === "info"
											? "User info"
											: t === "product"
												? "Product access"
												: "Group access"}
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
							<ProductAccessStep
								accessList={accessEntries}
								setAccessList={setAccessEntries}
								autoOpenWhenEmpty={false}
								showGroupAccess={false}
							/>
						)}

						{tab === "group" && (
							<Box p="32" textAlign="center">
								<Text color="fg.tertiary">
									This user is not a member of any groups yet.
								</Text>
							</Box>
						)}
				</Box>
			)}
		</PanelShell>
	);
}

"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
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
	IconXmark,
	IconPen,
	IconTrashCan,
	IconCircleInfo,
} from "@optiaxiom/icons";
import { type User, type UserType } from "../data";

const PANEL_WIDTH = 700;

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

	if (!open || !user || typeof document === "undefined") return null;

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
				aria-label="User details"
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
					<Heading level="2">User details</Heading>
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
					<Button appearance="default" onClick={onClose}>
						Close
					</Button>
				</Box>
			</Box>
		</>,
		document.body,
	);
}

"use client";

import { useRef, useState } from "react";
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
	LabelMenuButton,
	Menu,
	MenuContent,
	MenuTrigger,
	Text,
} from "@optiaxiom/react";
import {
	IconAngleDown,
	IconLock,
	IconPen,
	IconShieldCheck,
	IconTrashCan,
	IconUserGroup,
	IconUpload,
} from "@optiaxiom/icons";

import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
	FALLBACK_AVATAR_SRC,
	useAccountProfile,
	type AccountProfile,
} from "@/app/hooks/useAccountProfile";

const TIMEZONES = [
	"America/Los_Angeles",
	"America/Denver",
	"America/Chicago",
	"America/New_York",
	"Europe/London",
	"Europe/Berlin",
	"Asia/Singapore",
	"Asia/Tokyo",
] as const;

const LANGUAGES = [
	"English (US)",
	"English (UK)",
	"Deutsch",
	"Français",
	"日本語",
	"中文",
] as const;

type ProductInstance = { instance: string; role: string };
type ExperimentationInstance = {
	instance: string;
	projects: { project: string; role: string }[];
};

const MY_PRODUCTS: {
	name: string;
	standard: ProductInstance[];
}[] = [
	{
		name: "Content Management System",
		standard: [
			{ instance: "Stride", role: "Admin" },
			{ instance: "Mosey Bank", role: "Editor" },
		],
	},
	{
		name: "Content Marketing Platform",
		standard: [{ instance: "Stride", role: "Editor" }],
	},
	{
		name: "Opal",
		standard: [{ instance: "Stride", role: "Owner" }],
	},
];

const MY_EXPERIMENTATION: {
	name: string;
	instances: ExperimentationInstance[];
} = {
	name: "Web Experimentation",
	instances: [
		{
			instance: "Stride",
			projects: [
				{ project: "Marketing Site", role: "Admin" },
				{ project: "E-commerce Store", role: "Editor" },
			],
		},
		{
			instance: "Alloy",
			projects: [{ project: "Mobile App", role: "Contributor" }],
		},
	],
};

const MY_GROUPS_AND_TEAMS = [
	{ kind: "group" as const, name: "Engineering", members: 24, role: "Admin" },
	{ kind: "group" as const, name: "Product", members: 12, role: "Member" },
	{ kind: "team" as const, name: "Platform Squad", members: 6, role: "Lead" },
	{ kind: "team" as const, name: "Brand Studio", members: 9, role: "Member" },
];

const ACTIVE_SESSIONS = [
	{ id: "s-1", device: "MacBook Pro", browser: "Chrome 121", location: "Stockholm, SE", lastActive: "Active now", current: true },
	{ id: "s-2", device: "iPhone 15", browser: "Safari 17", location: "Stockholm, SE", lastActive: "2 hours ago", current: false },
	{ id: "s-3", device: "Windows Desktop", browser: "Firefox 122", location: "London, UK", lastActive: "Yesterday", current: false },
];

function ReadField({ label, value }: { label: string; value: string }) {
	return (
		<Box display="flex" flexDirection="column" gap="4">
			<Text fontSize="sm" color="fg.tertiary">
				{label}
			</Text>
			<Text fontWeight="500">{value}</Text>
		</Box>
	);
}

export default function AccountPage() {
	const { profile, setProfile } = useAccountProfile();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState<AccountProfile>(profile);
	const [openProduct, setOpenProduct] = useState<string | null>(
		"Content Management System",
	);
	const [expandedInstance, setExpandedInstance] = useState<string | null>(null);
	const [passwordOpen, setPasswordOpen] = useState(false);
	const [passwordForm, setPasswordForm] = useState({
		current: "",
		next: "",
		confirm: "",
	});

	const avatarSrc = profile.avatarDataUrl || FALLBACK_AVATAR_SRC;

	const startEdit = () => {
		setDraft(profile);
		setEditing(true);
	};
	const cancelEdit = () => {
		setDraft(profile);
		setEditing(false);
	};
	const saveEdit = () => {
		setProfile(draft);
		setEditing(false);
	};

	const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const next = { ...profile, avatarDataUrl: reader.result as string };
			setProfile(next);
			setDraft(next);
		};
		reader.readAsDataURL(file);
	};

	const removeAvatar = () => {
		const next = { ...profile, avatarDataUrl: null };
		setProfile(next);
		setDraft(next);
	};

	const closePasswordModal = () => {
		setPasswordOpen(false);
		setPasswordForm({ current: "", next: "", confirm: "" });
	};

	return (
		<Box>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
				<Box display="flex" alignItems="center" gap="12">
					<Heading level="2">Account</Heading>
				</Box>
			</Box>

			{/* === Profile === */}
			<Box
				bg="bg.default"
				rounded="md"
				border="1"
				borderColor="border.tertiary"
				p="20"
				mb="24"
			>
				<Box display="flex" justifyContent="space-between" mb="16">
					<Heading level="4">Profile</Heading>
					{!editing ? (
						<Button
							appearance="default"
							size="sm"
							icon={<IconPen size={14} />}
							iconPosition="start"
							onClick={startEdit}
						>
							Edit Profile
						</Button>
					) : (
						<Box display="flex" gap="8">
							<Button appearance="subtle" size="sm" onClick={cancelEdit}>
								Cancel
							</Button>
							<Button appearance="primary" size="sm" onClick={saveEdit}>
								Save
							</Button>
						</Box>
					)}
				</Box>

				<Box display="flex" gap="20" mb="20" alignItems="center">
					<Box
						style={{
							width: 96,
							height: 96,
							borderRadius: 999,
							overflow: "hidden",
							background: "var(--ax-colors-bg-secondary)",
							flexShrink: 0,
						}}
					>
						{/* Use plain <img> so data: URLs render without next/image's loader. */}
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={avatarSrc}
							alt={`${profile.firstName} ${profile.lastName}`}
							width={96}
							height={96}
							style={{ width: "100%", height: "100%", objectFit: "cover" }}
						/>
					</Box>
					<Box display="flex" flexDirection="column" gap="8">
						<Box display="flex" gap="8">
							<Button
								appearance="default"
								size="sm"
								icon={<IconUpload size={14} />}
								iconPosition="start"
								onClick={() => fileInputRef.current?.click()}
							>
								Upload avatar
							</Button>
							{profile.avatarDataUrl && (
								<Button
									appearance="subtle"
									size="sm"
									icon={<IconTrashCan size={14} />}
									iconPosition="start"
									onClick={removeAvatar}
								>
									Remove
								</Button>
							)}
						</Box>
						<Text fontSize="sm" color="fg.tertiary">
							PNG, JPG, or GIF. Max 2MB.
						</Text>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/png,image/jpeg,image/gif"
							style={{ display: "none" }}
							onChange={handleAvatarPick}
						/>
					</Box>
				</Box>

				<Box
					display="grid"
					gap="20"
					style={{ gridTemplateColumns: "1fr 1fr" }}
				>
					{editing ? (
						<>
							<Field label="First Name">
								<Input
									value={draft.firstName}
									onChange={(e) =>
										setDraft({ ...draft, firstName: e.target.value })
									}
								/>
							</Field>
							<Field label="Last Name">
								<Input
									value={draft.lastName}
									onChange={(e) =>
										setDraft({ ...draft, lastName: e.target.value })
									}
								/>
							</Field>
							<ReadField label="Email" value={profile.email} />
							<Field label="Job Title">
								<Input
									value={draft.jobTitle}
									onChange={(e) =>
										setDraft({ ...draft, jobTitle: e.target.value })
									}
								/>
							</Field>
							<Field label="Department">
								<Input
									value={draft.department}
									onChange={(e) =>
										setDraft({ ...draft, department: e.target.value })
									}
								/>
							</Field>
							<Field label="Phone">
								<Input
									value={draft.phone}
									onChange={(e) =>
										setDraft({ ...draft, phone: e.target.value })
									}
								/>
							</Field>
							<Field label="Timezone">
								<Menu
									options={TIMEZONES.map((tz) => ({
										label: tz,
										execute: () => setDraft({ ...draft, timezone: tz }),
									}))}
								>
									<MenuTrigger asChild>
										<LabelMenuButton label="Timezone">
											{draft.timezone}
										</LabelMenuButton>
									</MenuTrigger>
									<MenuContent />
								</Menu>
							</Field>
							<Field label="Language">
								<Menu
									options={LANGUAGES.map((lang) => ({
										label: lang,
										execute: () => setDraft({ ...draft, language: lang }),
									}))}
								>
									<MenuTrigger asChild>
										<LabelMenuButton label="Language">
											{draft.language}
										</LabelMenuButton>
									</MenuTrigger>
									<MenuContent />
								</Menu>
							</Field>
						</>
					) : (
						<>
							<ReadField label="First Name" value={profile.firstName} />
							<ReadField label="Last Name" value={profile.lastName} />
							<ReadField label="Email" value={profile.email} />
							<ReadField label="Job Title" value={profile.jobTitle} />
							<ReadField label="Department" value={profile.department} />
							<ReadField label="Phone" value={profile.phone} />
							<ReadField label="Timezone" value={profile.timezone} />
							<ReadField label="Language" value={profile.language} />
						</>
					)}
					<Box display="flex" flexDirection="column" gap="4">
						<Text fontSize="sm" color="fg.tertiary">
							User Type
						</Text>
						<Box>
							<Badge variant="strong">{profile.userType}</Badge>
						</Box>
					</Box>
					<Box display="flex" flexDirection="column" gap="4">
						<Text fontSize="sm" color="fg.tertiary">
							Auth Type
						</Text>
						<Box>
							<Badge intent="primary" variant="strong">
								{profile.authType}
							</Badge>
						</Box>
					</Box>
					<ReadField label="Last Login" value={profile.lastLogin} />
				</Box>
			</Box>

			{/* === My Product Access === */}
			<Box
				bg="bg.default"
				rounded="md"
				border="1"
				borderColor="border.tertiary"
				p="20"
				mb="24"
			>
				<Heading level="4">My Product Access</Heading>
				<Text fontSize="sm" color="fg.tertiary" mb="16">
					Read-only. Contact your admin to request changes.
				</Text>

				<Box display="flex" flexDirection="column" gap="12">
					{MY_PRODUCTS.map((product) => {
						const open = openProduct === product.name;
						return (
							<Box
								key={product.name}
								rounded="md"
								border="1"
								borderColor="border.default"
							>
								<Box
									display="flex"
									alignItems="center"
									gap="12"
									px="16"
									py="12"
									cursor="pointer"
									onClick={() =>
										setOpenProduct(open ? null : product.name)
									}
								>
									<Text fontWeight="600">{product.name}</Text>
									<Box flex="1" />
									<Text fontSize="sm" color="fg.tertiary">
										{product.standard.length}{" "}
										{product.standard.length === 1
											? "instance"
											: "instances"}
									</Text>
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
									<Box px="16" pb="16">
										<Table>
											<thead>
												<Tr>
													<Th>Instance</Th>
													<Th>Role</Th>
												</Tr>
											</thead>
											<tbody>
												{product.standard.map((row) => (
													<Tr key={row.instance}>
														<Td>{row.instance}</Td>
														<Td>{row.role}</Td>
													</Tr>
												))}
											</tbody>
										</Table>
									</Box>
								)}
							</Box>
						);
					})}

					{/* Experimentation (nested) */}
					<Box
						rounded="md"
						border="1"
						borderColor="border.default"
					>
						<Box
							display="flex"
							alignItems="center"
							gap="12"
							px="16"
							py="12"
							cursor="pointer"
							onClick={() =>
								setOpenProduct(
									openProduct === MY_EXPERIMENTATION.name
										? null
										: MY_EXPERIMENTATION.name,
								)
							}
						>
							<Text fontWeight="600">{MY_EXPERIMENTATION.name}</Text>
							<Box flex="1" />
							<Text fontSize="sm" color="fg.tertiary">
								{MY_EXPERIMENTATION.instances.length} instances
							</Text>
							<Box
								style={{
									display: "inline-flex",
									transform:
										openProduct === MY_EXPERIMENTATION.name
											? "rotate(180deg)"
											: "rotate(0deg)",
									transition: "transform 150ms ease",
								}}
							>
								<IconAngleDown
									size={16}
									color="var(--ax-colors-fg-secondary)"
								/>
							</Box>
						</Box>
						{openProduct === MY_EXPERIMENTATION.name && (
							<Box px="16" pb="16" display="flex" flexDirection="column" gap="8">
								{MY_EXPERIMENTATION.instances.map((inst) => {
									const expanded = expandedInstance === inst.instance;
									return (
										<Box
											key={inst.instance}
											rounded="md"
											border="1"
											borderColor="border.tertiary"
										>
											<Box
												display="flex"
												alignItems="center"
												gap="8"
												px="12"
												py="10"
												cursor="pointer"
												onClick={() =>
													setExpandedInstance(
														expanded ? null : inst.instance,
													)
												}
											>
												<Text fontWeight="500">{inst.instance}</Text>
												<Box flex="1" />
												<Text fontSize="sm" color="fg.tertiary">
													{inst.projects.length} projects
												</Text>
												<Box
													style={{
														display: "inline-flex",
														transform: expanded
															? "rotate(180deg)"
															: "rotate(0deg)",
														transition: "transform 150ms ease",
													}}
												>
													<IconAngleDown
														size={14}
														color="var(--ax-colors-fg-secondary)"
													/>
												</Box>
											</Box>
											{expanded && (
												<Box px="12" pb="12">
													<Table>
														<thead>
															<Tr>
																<Th>Project</Th>
																<Th>Role</Th>
															</Tr>
														</thead>
														<tbody>
															{inst.projects.map((p) => (
																<Tr key={p.project}>
																	<Td>{p.project}</Td>
																	<Td>{p.role}</Td>
																</Tr>
															))}
														</tbody>
													</Table>
												</Box>
											)}
										</Box>
									);
								})}
							</Box>
						)}
					</Box>
				</Box>
			</Box>

			{/* === Groups & Teams === */}
			<Box
				bg="bg.default"
				rounded="md"
				border="1"
				borderColor="border.tertiary"
				p="20"
				mb="24"
			>
				<Heading level="4">Groups & Teams</Heading>
				<Text fontSize="sm" color="fg.tertiary" mb="16">
					Your memberships across the organization.
				</Text>

				<Table>
					<thead>
						<Tr>
							<Th style={{ width: 40 }} />
							<Th>Name</Th>
							<Th>Members</Th>
							<Th>Role</Th>
						</Tr>
					</thead>
					<tbody>
						{MY_GROUPS_AND_TEAMS.map((item) => (
							<Tr key={item.name}>
								<Td style={{ width: 40 }}>
									<IconUserGroup
										size={16}
										color="var(--ax-colors-fg-tertiary)"
									/>
								</Td>
								<Td>
									<Box display="flex" alignItems="center" gap="8">
										<Text fontWeight="500">{item.name}</Text>
										<Badge variant="subtle">
											{item.kind === "group" ? "Group" : "Team"}
										</Badge>
									</Box>
								</Td>
								<Td>{item.members}</Td>
								<Td>{item.role}</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			</Box>

			{/* === Security === */}
			<Box
				bg="bg.default"
				rounded="md"
				border="1"
				borderColor="border.tertiary"
				p="20"
				mb="24"
			>
				<Heading level="4">Security</Heading>

				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					py="16"
					borderB="1"
					borderColor="border.tertiary"
				>
					<Box>
						<Text fontWeight="500">Password</Text>
						<Text fontSize="sm" color="fg.tertiary">
							{profile.authType === "Local"
								? "Last changed 3 months ago."
								: "Managed by your identity provider (SSO)."}
						</Text>
					</Box>
					<Button
						appearance="default"
						size="sm"
						icon={<IconLock size={14} />}
						iconPosition="start"
						disabled={profile.authType !== "Local"}
						onClick={() => setPasswordOpen(true)}
					>
						Change Password
					</Button>
				</Box>

				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					py="16"
					borderB="1"
					borderColor="border.tertiary"
				>
					<Box>
						<Box display="flex" alignItems="center" gap="8">
							<Text fontWeight="500">Multi-factor Authentication</Text>
							<Badge intent="success" variant="strong">
								Enabled
							</Badge>
						</Box>
						<Text fontSize="sm" color="fg.tertiary">
							Authenticator app · Last verified 2 days ago.
						</Text>
					</Box>
					<Button
						appearance="default"
						size="sm"
						icon={<IconShieldCheck size={14} />}
						iconPosition="start"
					>
						Manage MFA
					</Button>
				</Box>

				<Box pt="16">
					<Text fontWeight="500" mb="4">
						Active Sessions
					</Text>
					<Text fontSize="sm" color="fg.tertiary" mb="12">
						You're currently signed in on these devices.
					</Text>
					<Table>
						<thead>
							<Tr>
								<Th>Device</Th>
								<Th>Browser</Th>
								<Th>Location</Th>
								<Th>Last active</Th>
								<Th style={{ width: 80 }} />
							</Tr>
						</thead>
						<tbody>
							{ACTIVE_SESSIONS.map((s) => (
								<Tr key={s.id}>
									<Td>
										<Box display="flex" alignItems="center" gap="8">
											<Text fontWeight="500">{s.device}</Text>
											{s.current && (
												<Badge intent="success" variant="subtle">
													This device
												</Badge>
											)}
										</Box>
									</Td>
									<Td>{s.browser}</Td>
									<Td>{s.location}</Td>
									<Td>{s.lastActive}</Td>
									<Td type="raw" style={{ width: 80, textAlign: "right" }}>
										{!s.current && (
											<Button appearance="subtle" size="sm">
												Revoke
											</Button>
										)}
									</Td>
								</Tr>
							))}
						</tbody>
					</Table>
				</Box>
			</Box>

			<AlertDialog
				open={passwordOpen}
				onOpenChange={(v) => !v && closePasswordModal()}
			>
				<AlertDialogContent>
					<AlertDialogHeader>Change password</AlertDialogHeader>
					<AlertDialogBody>
						<Box display="flex" flexDirection="column" gap="12">
							<Field label="Current password">
								<Input
									type="password"
									value={passwordForm.current}
									onChange={(e) =>
										setPasswordForm({
											...passwordForm,
											current: e.target.value,
										})
									}
								/>
							</Field>
							<Field label="New password">
								<Input
									type="password"
									value={passwordForm.next}
									onChange={(e) =>
										setPasswordForm({
											...passwordForm,
											next: e.target.value,
										})
									}
								/>
							</Field>
							<Field label="Confirm new password">
								<Input
									type="password"
									value={passwordForm.confirm}
									onChange={(e) =>
										setPasswordForm({
											...passwordForm,
											confirm: e.target.value,
										})
									}
								/>
							</Field>
						</Box>
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={closePasswordModal} />
						<AlertDialogAction
							appearance="primary"
							disabled={
								!passwordForm.current ||
								!passwordForm.next ||
								passwordForm.next !== passwordForm.confirm
							}
							onClick={closePasswordModal}
						>
							Update password
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Box>
	);
}

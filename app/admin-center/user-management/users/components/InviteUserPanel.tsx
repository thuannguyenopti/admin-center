"use client";

import { useEffect, useRef, useState } from "react";
import { PanelShell } from "@/app/admin-center/components/PanelShell";
import {
	Box,
	Button,
	Checkbox,
	Field,
	Heading,
	Input,
	Link,
	Text,
	Tooltip,
	toaster,
} from "@optiaxiom/react";
import {
	IconPlus,
	IconTrashCan,
	IconCheck,
	IconCircleInfo,
	IconPaperPlaneTop,
	IconUpload,
	IconXmark,
} from "@optiaxiom/icons";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { BULK_IMPORT_USERS } from "../data";
import { lookupUserByEmail, UserSearchInput } from "./UserSearchInput";
import {
	ProductAccessStep,
	AccessCard,
	type AccessEntry,
} from "./ProductAccessStep";

export type InvitedUser = { email: string; first: string; last: string };

// Re-export the access primitives so existing consumers (bulk action modals,
// etc.) can keep importing them from here.
export { AccessCard };
export { AccessEditor, SingleSelectMenu, MultiSelectMenu } from "./ProductAccessStep";
export type { AccessEntry, AccessKind, AccessInstance } from "./ProductAccessStep";

const STEP_LABELS = ["User list", "Product access", "Review"] as const;
const PANEL_WIDTH = 700;

export function InviteUserPanel({
	open,
	onClose,
	onSubmit,
	presetProduct,
	mode = "manual",
}: {
	open: boolean;
	onClose: () => void;
	onSubmit?: (invited: InvitedUser[], access: AccessEntry[]) => void;
	/** Pre-fill the product field on Step 2 (e.g. when invoked from a product detail page). */
	presetProduct?: string;
	/** "manual" = type users one by one; "upload" = import a CSV on step 1. */
	mode?: "manual" | "upload";
}) {
	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [users, setUsers] = useState<InvitedUser[]>([]);
	const [accessList, setAccessList] = useState<AccessEntry[]>([]);
	const [editorOpen, setEditorOpen] = useState(false);
	const [requireAccept, setRequireAccept] = useState(false);
	const [sendEmail, setSendEmail] = useState(false);

	useEffect(() => {
		if (!open) return;
	}, [open, onClose]);

	useEffect(() => {
		if (open) {
			setStep(1);
			setUsers([]);
			setAccessList([]);
			setEditorOpen(false);
			setRequireAccept(false);
			setSendEmail(false);
		}
	}, [open]);

	const canContinue =
		step === 1 ? users.length > 0 :
		step === 2 ? accessList.length > 0 && !editorOpen :
		true;

	const handleSend = () => {
		const count = users.length;
		onSubmit?.(users, accessList);
		toaster.create(
			`${count} invitation${count === 1 ? "" : "s"} sent`,
			{ intent: "success" },
		);
		onClose();
	};

	return (
		<PanelShell
			open={open}
			onClose={onClose}
			title="Invite user"
			subHeader={<Box py="20"><Stepper step={step} /></Box>}
			footer={
				<>
					{step > 1 && (
						<Button appearance="subtle" onClick={() => setStep((s) => (s - 1) as 1 | 2)}>
							Back
						</Button>
					)}
					{step < 3 ? (
						<Button
							appearance="primary"
							disabled={!canContinue}
							onClick={() => setStep((s) => (s + 1) as 2 | 3)}
						>
							Continue
						</Button>
					) : (
						<Button
							appearance="primary"
							icon={<IconPaperPlaneTop size={16} />}
							iconPosition="start"
							onClick={handleSend}
						>
							Send invite
						</Button>
					)}
				</>
			}
		>
			{step === 1 &&
				(mode === "upload" ? (
					<StepUploadUsers users={users} setUsers={setUsers} />
				) : (
					<StepUsers users={users} setUsers={setUsers} />
				))}
			{step === 2 && (
				<ProductAccessStep
					accessList={accessList}
					setAccessList={setAccessList}
					onEditorChange={setEditorOpen}
					presetProduct={presetProduct}
				/>
			)}
			{step === 3 && (
				<StepReview
					users={users}
					accessList={accessList}
					requireAccept={requireAccept}
					setRequireAccept={setRequireAccept}
					sendEmail={sendEmail}
					setSendEmail={setSendEmail}
				/>
			)}
		</PanelShell>
	);
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
	return (
		<Box display="flex" alignItems="center" gap="8">
			{STEP_LABELS.map((label, i) => {
				const n = (i + 1) as 1 | 2 | 3;
				const state = n < step ? "done" : n === step ? "current" : "todo";
				return (
					<Box key={label} display="flex" alignItems="center" gap="8" flex="1">
						<Box
							display="inline-flex"
							alignItems="center"
							justifyContent="center"
							rounded="full"
							style={{
								width: 24,
								height: 24,
								flexShrink: 0,
								background:
									state === "done" ? "var(--ax-colors-bg-accent)" :
									state === "current" ? "var(--ax-colors-bg-default)" :
									"var(--ax-colors-bg-default)",
								border:
									state === "current"
										? "5px solid var(--ax-colors-fg-accent)"
										: state === "done"
											? "none"
											: "2px solid var(--ax-colors-border-default)",
								color: "var(--ax-colors-fg-default)",
							}}
						>
							{state === "done" && <IconCheck size={14} />}
						</Box>
						<Text
							fontSize="sm"
							fontWeight={state === "current" ? "600" : "500"}
							color={state === "todo" ? "fg.tertiary" : "fg.default"}
						>
							{label}
						</Text>
						{i < STEP_LABELS.length - 1 && (
							<Box
								flex="1"
								style={{
									height: 2,
									background:
										n < step
											? "var(--ax-colors-bg-accent)"
											: "var(--ax-colors-border-default)",
									minWidth: 16,
								}}
							/>
						)}
					</Box>
				);
			})}
		</Box>
	);
}

function StepUsers({
	users,
	setUsers,
}: {
	users: InvitedUser[];
	setUsers: (u: InvitedUser[]) => void;
}) {
	const [email, setEmail] = useState("");
	const [first, setFirst] = useState("");
	const [last, setLast] = useState("");
	const existingUser = lookupUserByEmail(email);
	const isExisting = existingUser !== null;
	const valid =
		/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) &&
		first.trim() !== "" &&
		last.trim() !== "";

	const applyUser = (user: { email: string; first: string; last: string }) => {
		setEmail(user.email);
		setFirst(user.first);
		setLast(user.last);
	};

	const handleEmailChange = (value: string) => {
		const prevMatch = lookupUserByEmail(email);
		setEmail(value);
		const match = lookupUserByEmail(value);
		if (match) {
			setFirst(match.first);
			setLast(match.last);
		} else if (prevMatch) {
			setFirst("");
			setLast("");
		}
	};

	const add = () => {
		if (!valid) return;
		setUsers([
			...users,
			{ email: email.trim(), first: first.trim(), last: last.trim() },
		]);
		setEmail("");
		setFirst("");
		setLast("");
	};

	return (
		<Box display="flex" flexDirection="column" gap="16">
			<Field
				label={
					<Box display="inline-flex" alignItems="center" gap="4">
						<span>Email</span>
						<Text asChild color="fg.error">
							<span>*</span>
						</Text>
						<Tooltip content="Search by name or email. Existing users will have their name filled in automatically.">
							<span style={{ display: "inline-flex" }}>
								<IconCircleInfo size={14} color="var(--ax-colors-fg-tertiary)" />
							</span>
						</Tooltip>
					</Box>
				}
			>
				<UserSearchInput
					value={email}
					onChange={handleEmailChange}
					onSelectUser={applyUser}
					excludeEmails={users.map((u) => u.email)}
					placeholder="Search by name or email"
					clearOnSelect={false}
					onEnterManual={(value) => {
						handleEmailChange(value);
					}}
				/>
			</Field>

			<Box
				display="grid"
				gap="16"
				style={{ gridTemplateColumns: "1fr 1fr" }}
			>
				<Field
					label={
						<Box display="inline-flex" alignItems="center" gap="4">
							<span>First name</span>
							<Text asChild color="fg.error">
								<span>*</span>
							</Text>
						</Box>
					}
				>
					<Input
						value={first}
						placeholder="Enter the user's first name"
						readOnly={isExisting}
						onChange={(e) => setFirst(e.target.value)}
					/>
				</Field>
				<Field
					label={
						<Box display="inline-flex" alignItems="center" gap="4">
							<span>Last name</span>
							<Text asChild color="fg.error">
								<span>*</span>
							</Text>
						</Box>
					}
				>
					<Input
						value={last}
						placeholder="Enter the user's last name"
						readOnly={isExisting}
						onChange={(e) => setLast(e.target.value)}
					/>
				</Field>
			</Box>

			<Box display="flex" justifyContent="end">
				<Button
					appearance="default"
					icon={<IconPlus size={16} />}
					iconPosition="start"
					disabled={!valid}
					onClick={add}
				>
					Add user
				</Button>
			</Box>

			{users.length > 0 ? (
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
						{users.map((u, i) => (
							<Tr key={i}>
								<Td>{u.email}</Td>
								<Td>
									{u.first || (
										<Text asChild color="fg.tertiary">
											<span>—</span>
										</Text>
									)}
								</Td>
								<Td>
									{u.last || (
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
										aria-label={`Remove ${u.email}`}
										onClick={() =>
											setUsers(users.filter((_, j) => j !== i))
										}
									/>
								</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			) : (
				<Text fontSize="sm" color="fg.tertiary">
					Add at least one user to continue. Press Enter or click Add user.
				</Text>
			)}
		</Box>
	);
}

function StepUploadUsers({
	users,
	setUsers,
}: {
	users: InvitedUser[];
	setUsers: (u: InvitedUser[]) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [fileName, setFileName] = useState("");
	const [bannerOpen, setBannerOpen] = useState(true);

	const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setFileName(file.name);
		// Prototype: simulate parsing the uploaded spreadsheet into a list of users.
		setUsers(BULK_IMPORT_USERS.map((u) => ({ ...u })));
		setBannerOpen(true);
		e.target.value = "";
	};

	return (
		<Box display="flex" flexDirection="column" gap="16">
			<Text fontSize="md" color="fg.secondary">
				Please use{" "}
				<Link href="#" onClick={(e) => e.preventDefault()}>
					this template
				</Link>{" "}
				to format your CSV file (max 10MB and 1,000 users).
			</Text>

			<input
				ref={inputRef}
				type="file"
				accept=".csv"
				style={{ display: "none" }}
				onChange={handleFile}
			/>

			{users.length === 0 ? (
				<Field
					label={
						<Box display="inline-flex" alignItems="center" gap="4">
							<span>Upload your CSV file</span>
							<Text asChild color="fg.error">
								<span>*</span>
							</Text>
						</Box>
					}
				>
					<Box display="flex" alignItems="center" gap="12">
						<Box flex="1">
							<Input value={fileName} placeholder="No file chosen" readOnly />
						</Box>
						<Button
							appearance="primary"
							icon={<IconUpload size={16} />}
							iconPosition="start"
							onClick={() => inputRef.current?.click()}
						>
							Select file
						</Button>
					</Box>
				</Field>
			) : (
				<>
					{bannerOpen && (
						<Box
							display="flex"
							alignItems="center"
							justifyContent="space-between"
							gap="12"
							px="16"
							py="12"
							rounded="md"
							border="1"
							style={{
								background: "var(--ax-colors-bg-success-subtle)",
								borderColor: "var(--ax-colors-border-success)",
							}}
						>
							<Text fontSize="md" color="fg.default">
								{users.length} user{users.length === 1 ? " is" : "s are"} imported.
							</Text>
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconXmark size={16} />}
								aria-label="Dismiss"
								onClick={() => setBannerOpen(false)}
							/>
						</Box>
					)}

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
							{users.map((u, i) => (
								<Tr key={i}>
									<Td>{u.email}</Td>
									<Td>
										{u.first || (
											<Text asChild color="fg.tertiary">
												<span>—</span>
											</Text>
										)}
									</Td>
									<Td>
										{u.last || (
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
											aria-label={`Remove row ${i + 1}`}
											onClick={() => setUsers(users.filter((_, j) => j !== i))}
										/>
									</Td>
								</Tr>
							))}
						</tbody>
					</Table>
				</>
			)}
		</Box>
	);
}

function StepReview({
	users,
	accessList,
	requireAccept,
	setRequireAccept,
	sendEmail,
	setSendEmail,
}: {
	users: InvitedUser[];
	accessList: AccessEntry[];
	requireAccept: boolean;
	setRequireAccept: (v: boolean) => void;
	sendEmail: boolean;
	setSendEmail: (v: boolean) => void;
}) {
	const collapseLimit = 4;
	const [showAll, setShowAll] = useState(false);
	const showToggle = users.length > collapseLimit;
	const shown = showAll || !showToggle ? users : users.slice(0, collapseLimit);

	return (
		<Box display="flex" flexDirection="column" gap="20">
			<Box display="flex" flexDirection="column" gap="12">
				<Text fontWeight="600">You're about to invite:</Text>
				<Table>
					<thead>
						<Tr>
							<Th>Email</Th>
							<Th>First name</Th>
							<Th>Last name</Th>
						</Tr>
					</thead>
					<tbody>
						{shown.map((u, i) => (
							<Tr key={i}>
								<Td>{u.email}</Td>
								<Td>{u.first || "—"}</Td>
								<Td>{u.last || "—"}</Td>
							</Tr>
						))}
					</tbody>
				</Table>
				{showToggle && (
					<Box display="flex" justifyContent="center">
						<Button
							appearance="subtle"
							size="sm"
							onClick={() => setShowAll((s) => !s)}
						>
							{showAll ? "View less" : `View all ${users.length}`}
						</Button>
					</Box>
				)}
			</Box>

			<Box display="flex" flexDirection="column" gap="12">
				<Text fontWeight="600">
					with the following access
					{accessList.length === 1 ? "" : "es"}:
				</Text>
				{accessList.length > 0 ? (
					accessList.map((entry) => (
						<AccessCard
							key={entry.id}
							entry={entry}
							defaultOpen
							readOnly
						/>
					))
				) : (
					<Text fontSize="sm" color="fg.tertiary">
						No access was added.
					</Text>
				)}
			</Box>

			<Box
				borderT="1"
				borderColor="border.tertiary"
				pt="16"
				display="flex"
				flexDirection="column"
				gap="12"
			>
				<Box display="flex" alignItems="start" gap="12">
					<Box mt="2">
						<Checkbox
							checked={requireAccept}
							onCheckedChange={(v) => setRequireAccept(!!v)}
							aria-label="Require acceptance"
						/>
					</Box>
					<Box
						cursor="pointer"
						onClick={() => setRequireAccept(!requireAccept)}
					>
						<Text fontWeight="600">Require acceptance</Text>
						<Text fontSize="sm" color="fg.secondary">
							The user must accept the invitation sent to their inbox.
						</Text>
					</Box>
				</Box>

				<Box display="flex" alignItems="start" gap="12">
					<Box mt="2">
						<Checkbox
							checked={sendEmail && requireAccept}
							disabled={!requireAccept}
							onCheckedChange={(v) => setSendEmail(!!v)}
							aria-label="Send invitation email with password creation link"
						/>
					</Box>
					<Box
						cursor={requireAccept ? "pointer" : "default"}
						onClick={() => requireAccept && setSendEmail(!sendEmail)}
					>
						<Text
							fontWeight="600"
							color={requireAccept ? "fg.default" : "fg.disabled"}
						>
							Send invitation email with password creation link
						</Text>
						<Text
							fontSize="sm"
							color={requireAccept ? "fg.secondary" : "fg.disabled"}
						>
							Includes a secure link so the user can set their password right away.
						</Text>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}


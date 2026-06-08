"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
	Box,
	Button,
	Checkbox,
	Field,
	Heading,
	Input,
	Link,
	Menu,
	MenuContent,
	MenuTrigger,
	LabelMenuButton,
	Text,
	Tooltip,
	toaster,
} from "@optiaxiom/react";
import {
	IconXmark,
	IconPlus,
	IconTrashCan,
	IconCheck,
	IconAngleDown,
	IconCircleInfo,
	IconPaperPlaneTop,
	IconPen,
	IconUpload,
} from "@optiaxiom/icons";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
	PRODUCTS,
	INSTANCES,
	ROLES,
	GROUPS,
	BULK_IMPORT_USERS,
} from "../data";

export type InvitedUser = { email: string; first: string; last: string };
export type AccessKind = "product" | "group";
export type AccessInstance = { name: string; roles: string[] };
export type AccessEntry = {
	id: string;
	kind: AccessKind;
	name: string;
	instances: AccessInstance[];
};

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

	if (!open || typeof document === "undefined") return null;

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
				aria-label="Invite user"
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
					<Heading level="2">Invite user</Heading>
					<Button
						appearance="subtle"
						size="md"
						icon={<IconXmark size={20} />}
						aria-label="Close"
						onClick={onClose}
					/>
				</Box>

				<Box px="24" py="20" borderB="1" borderColor="border.tertiary">
					<Stepper step={step} />
				</Box>

				<Box flex="1" overflow="auto" px="24" py="20">
					{step === 1 &&
						(mode === "upload" ? (
							<StepUploadUsers users={users} setUsers={setUsers} />
						) : (
							<StepUsers users={users} setUsers={setUsers} />
						))}
					{step === 2 && (
						<StepAccess
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
					{step > 1 && (
						<Button
							appearance="subtle"
							onClick={() => setStep((s) => (s - 1) as 1 | 2)}
						>
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
				</Box>
			</Box>
		</>,
		document.body,
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
	const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

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
						<Tooltip content="The user's primary email address. They'll receive the invitation here.">
							<span style={{ display: "inline-flex" }}>
								<IconCircleInfo size={14} color="var(--ax-colors-fg-tertiary)" />
							</span>
						</Tooltip>
					</Box>
				}
			>
				<Input
					value={email}
					placeholder="Enter the user's email"
					onChange={(e) => setEmail(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") add();
					}}
				/>
			</Field>

			<Box
				display="grid"
				gap="16"
				style={{ gridTemplateColumns: "1fr 1fr" }}
			>
				<Field label="First name">
					<Input
						value={first}
						placeholder="Optional"
						onChange={(e) => setFirst(e.target.value)}
					/>
				</Field>
				<Field label="Last name">
					<Input
						value={last}
						placeholder="Optional"
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

function StepAccess({
	accessList,
	setAccessList,
	onEditorChange,
	presetProduct,
}: {
	accessList: AccessEntry[];
	setAccessList: (a: AccessEntry[]) => void;
	onEditorChange: (open: boolean) => void;
	presetProduct?: string;
}) {
	const [editor, setEditor] = useState<
		| { mode: "new" | "edit"; kind: AccessKind; id?: string; initial: AccessEntry | null }
		| null
	>(
		accessList.length === 0
			? {
					mode: "new",
					kind: "product",
					initial: presetProduct
						? {
								id: "preset",
								kind: "product",
								name: presetProduct,
								instances: [],
							}
						: null,
				}
			: null,
	);

	useEffect(() => {
		onEditorChange(!!editor);
	}, [editor, onEditorChange]);

	const startNew = (kind: AccessKind) => setEditor({ mode: "new", kind, initial: null });
	const startEdit = (entry: AccessEntry) =>
		setEditor({ mode: "edit", kind: entry.kind, id: entry.id, initial: entry });

	const handleSave = (data: Omit<AccessEntry, "id">) => {
		if (editor?.mode === "edit" && editor.id) {
			setAccessList(
				accessList.map((a) =>
					a.id === editor.id ? { ...data, id: editor.id! } : a,
				),
			);
		} else {
			setAccessList([
				...accessList,
				{ ...data, id: `${Date.now()}-${Math.random()}` },
			]);
		}
		setEditor(null);
	};

	return (
		<Box display="flex" flexDirection="column" gap="16">
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				gap="12"
			>
				<Heading level="4">Access</Heading>
				<Box display="flex" gap="8">
					<Button
						appearance="default"
						size="sm"
						disabled={!!editor}
						onClick={() => startNew("product")}
					>
						Add product
					</Button>
					<Button
						appearance="default"
						size="sm"
						disabled={!!editor}
						onClick={() => startNew("group")}
					>
						Add group
					</Button>
				</Box>
			</Box>

			{accessList.map((entry) =>
				editor && editor.mode === "edit" && editor.id === entry.id ? (
					<Box
						key={entry.id}
						p="16"
						rounded="md"
						border="1"
						borderColor="border.default"
					>
						<AccessEditor
							kind={editor.kind}
							initial={editor.initial}
							onSave={handleSave}
							onCancel={() => setEditor(null)}
						/>
					</Box>
				) : (
					<AccessCard
						key={entry.id}
						entry={entry}
						onEdit={() => startEdit(entry)}
						onDelete={() =>
							setAccessList(accessList.filter((a) => a.id !== entry.id))
						}
					/>
				),
			)}

			{editor && editor.mode === "new" && (
				<Box p="16" rounded="md" border="1" borderColor="border.default">
					<AccessEditor
						kind={editor.kind}
						initial={null}
						onSave={handleSave}
						onCancel={() => setEditor(null)}
					/>
				</Box>
			)}

			{accessList.length === 0 && !editor && (
				<Text fontSize="sm" color="fg.tertiary">
					No access granted yet. Add product or group access to continue.
				</Text>
			)}
		</Box>
	);
}

export function AccessEditor({
	kind,
	initial,
	onSave,
	onCancel,
}: {
	kind: AccessKind;
	initial: AccessEntry | null;
	onSave: (entry: Omit<AccessEntry, "id">) => void;
	onCancel: () => void;
}) {
	const productLabel = kind === "group" ? "Group" : "Product";
	const sourceList = kind === "group" ? GROUPS : PRODUCTS;
	const [name, setName] = useState(initial?.name ?? "");
	const [instances, setInstances] = useState<AccessInstance[]>(
		initial?.instances.map((i) => ({ ...i, roles: [...i.roles] })) ?? [],
	);

	const setSelectedInstances = (names: string[]) => {
		setInstances(
			names.map(
				(n) => instances.find((i) => i.name === n) ?? { name: n, roles: [] },
			),
		);
	};

	const setRoles = (idx: number, roles: string[]) => {
		setInstances(instances.map((i, j) => (j === idx ? { ...i, roles } : i)));
	};

	const canSave =
		!!name &&
		instances.length > 0 &&
		instances.every((i) => i.roles.length > 0);

	return (
		<Box display="flex" flexDirection="column" gap="12">
			<Field
				label={
					<Box display="inline-flex" alignItems="center" gap="4">
						<span>{productLabel}</span>
						<Text asChild color="fg.error">
							<span>*</span>
						</Text>
					</Box>
				}
			>
				<SingleSelectMenu
					label={productLabel}
					value={name}
					options={sourceList as readonly string[]}
					onChange={setName}
				/>
			</Field>

			<Field
				label={
					<Box display="inline-flex" alignItems="center" gap="4">
						<span>Instance</span>
						{name && (
							<Text asChild color="fg.error">
								<span>*</span>
							</Text>
						)}
					</Box>
				}
			>
				<MultiSelectMenu
					label="Instance"
					values={instances.map((i) => i.name)}
					options={INSTANCES as readonly string[]}
					onChange={setSelectedInstances}
					disabled={!name}
				/>
			</Field>

			{instances.length > 0 && (
				<Table>
					<thead>
						<Tr>
							<Th>Instance</Th>
							<Th style={{ width: 220 }}>Role</Th>
						</Tr>
					</thead>
					<tbody>
						{instances.map((inst, idx) => (
							<Tr key={inst.name}>
								<Td>{inst.name}</Td>
								<Td>
									<MultiSelectMenu
										label="Role"
										values={inst.roles}
										options={ROLES as readonly string[]}
										onChange={(roles) => setRoles(idx, roles)}
									/>
								</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			)}

			<Box display="flex" justifyContent="end" gap="8" mt="4">
				<Button appearance="subtle" size="sm" onClick={onCancel}>
					Cancel
				</Button>
				<Button
					appearance="primary"
					size="sm"
					disabled={!canSave}
					onClick={() =>
						onSave({ kind, name, instances })
					}
				>
					Save {productLabel.toLowerCase()} access
				</Button>
			</Box>
		</Box>
	);
}

export function AccessCard({
	entry,
	onEdit,
	onDelete,
	defaultOpen = false,
	readOnly = false,
}: {
	entry: AccessEntry;
	onEdit?: () => void;
	onDelete?: () => void;
	defaultOpen?: boolean;
	readOnly?: boolean;
}) {
	const [open, setOpen] = useState(defaultOpen);
	const label = entry.kind === "group" ? "group" : "product";

	return (
		<Box rounded="md" border="1" borderColor="border.default" bg="bg.default">
			<Box
				display="flex"
				alignItems="center"
				gap="12"
				px="16"
				py="12"
				cursor="pointer"
				onClick={() => setOpen((o) => !o)}
			>
				<Text fontWeight="600">{entry.name}</Text>
				<Box flex="1" />
				<Text fontSize="sm" color="fg.tertiary">
					{entry.instances.length}{" "}
					{entry.instances.length === 1 ? "instance" : "instances"}
				</Text>
				<Box
					style={{
						display: "inline-flex",
						transform: open ? "rotate(180deg)" : "rotate(0deg)",
						transition: "transform 150ms ease",
					}}
				>
					<IconAngleDown size={16} color="var(--ax-colors-fg-secondary)" />
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
							{entry.instances.map((inst) => (
								<Tr key={inst.name}>
									<Td>{inst.name}</Td>
									<Td>{inst.roles.join(", ") || "—"}</Td>
								</Tr>
							))}
						</tbody>
					</Table>
					{!readOnly && (onEdit || onDelete) && (
						<Box display="flex" justifyContent="end" gap="8" mt="12">
							{onEdit && (
								<Button
									appearance="default"
									size="sm"
									icon={<IconPen size={14} />}
									iconPosition="start"
									onClick={onEdit}
								>
									Edit {label} access
								</Button>
							)}
							{onDelete && (
								<Button
									appearance="default"
									size="sm"
									icon={<IconTrashCan size={14} />}
									iconPosition="start"
									onClick={onDelete}
								>
									Delete
								</Button>
							)}
						</Box>
					)}
				</Box>
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

export function SingleSelectMenu({
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
	return (
		<Menu
			options={options.map((opt) => ({
				label: opt,
				execute: () => onChange(opt),
			}))}
		>
			<MenuTrigger asChild>
				<LabelMenuButton label={label}>
					{value || `Select ${label.toLowerCase()}`}
				</LabelMenuButton>
			</MenuTrigger>
			<MenuContent />
		</Menu>
	);
}

export function MultiSelectMenu({
	label,
	values,
	options,
	onChange,
	disabled,
}: {
	label: string;
	values: string[];
	options: readonly string[];
	onChange: (v: string[]) => void;
	disabled?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const toggle = (opt: string) => {
		if (values.includes(opt)) onChange(values.filter((v) => v !== opt));
		else onChange([...values, opt]);
	};
	const summary =
		values.length === 0
			? `Select ${label.toLowerCase()}`
			: values.length === 1
				? values[0]
				: `${values.length} selected`;

	return (
		<Menu
			open={open}
			onOpenChange={setOpen}
			options={options.map((opt) => ({
				label: opt,
				execute: () => toggle(opt),
				addon: (
					<Checkbox
						checked={values.includes(opt)}
						aria-label={opt}
						onCheckedChange={() => toggle(opt)}
					/>
				),
			}))}
		>
			<MenuTrigger asChild>
				<LabelMenuButton label={label} disabled={disabled}>
					{summary}
				</LabelMenuButton>
			</MenuTrigger>
			<MenuContent />
		</Menu>
	);
}

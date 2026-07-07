"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
	Box,
	Button,
	Checkbox,
	Field,
	Heading,
	Input,
	Link,
	Text,
	Textarea,
	Tooltip,
	toaster,
} from "@optiaxiom/react";
import {
	IconXmark,
	IconCheck,
	IconAngleDown,
	IconTrashCan,
	IconCircleInfo,
} from "@optiaxiom/icons";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { SingleSelectMenu } from "../../users/components/ProductAccessStep";
import { BULK_IMPORT_USERS, INSTANCES } from "../../users/data";
import { lookupUserByEmail, UserSearchInput } from "../../users/components/UserSearchInput";
import { TEAMS_DATA, type TeamMember } from "../data";

const PANEL_WIDTH = 700;
const STEP_LABELS = ["Team info", "User list", "Product access", "Review"] as const;
const TEAM_PRODUCT = "Content Marketing Platform";

// Teams can only be created for CMP, so the existing-team picker lists CMP teams.
const CMP_TEAMS = TEAMS_DATA.filter(
	(t) => t.productName === "CMP" || t.productName === TEAM_PRODUCT,
);

export type CreateTeamPayload = {
	name: string;
	description: string;
	members: TeamMember[];
	product: string;
	instance: string;
};

export function CreateTeamPanel({
	open,
	onClose,
	onSubmit,
}: {
	open: boolean;
	onClose: () => void;
	onSubmit?: (payload: CreateTeamPayload) => void;
}) {
	const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [members, setMembers] = useState<TeamMember[]>([]);
	const [instance, setInstance] = useState("");

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
			setName("");
			setDescription("");
			setMembers([]);
			setInstance("");
		}
	}, [open]);

	if (!open || typeof document === "undefined") return null;

	const canContinue =
		step === 1 ? name.trim().length > 0 :
		step === 3 ? instance.length > 0 :
		true;

	const handleCreate = () => {
		onSubmit?.({
			name: name.trim(),
			description: description.trim(),
			members,
			product: TEAM_PRODUCT,
			instance,
		});
		toaster.create("Team created", { intent: "success" });
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
				aria-label="Create team"
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
					<Heading level="2">Create team</Heading>
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
					{step === 1 && (
						<StepTeamInfo
							name={name}
							setName={setName}
							description={description}
							setDescription={setDescription}
						/>
					)}
					{step === 2 && <StepUserList members={members} setMembers={setMembers} />}
					{step === 3 && (
						<StepProductAccess instance={instance} setInstance={setInstance} />
					)}
					{step === 4 && (
						<StepReview
							name={name}
							description={description}
							members={members}
							instance={instance}
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
							onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
						>
							Back
						</Button>
					)}
					{step < 4 ? (
						<Button
							appearance="primary"
							disabled={!canContinue}
							onClick={() => setStep((s) => (s + 1) as 2 | 3 | 4)}
						>
							Continue
						</Button>
					) : (
						<Button appearance="primary" onClick={handleCreate}>
							Create team
						</Button>
					)}
				</Box>
			</Box>
		</>,
		document.body,
	);
}

function Stepper({ step }: { step: number }) {
	return (
		<Box display="flex" alignItems="center" gap="8">
			{STEP_LABELS.map((label, i) => {
				const n = i + 1;
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
									state === "done"
										? "var(--ax-colors-bg-accent)"
										: "var(--ax-colors-bg-default)",
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

function StepTeamInfo({
	name,
	setName,
	description,
	setDescription,
}: {
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
		</Box>
	);
}

function StepUserList({
	members,
	setMembers,
}: {
	members: TeamMember[];
	setMembers: (m: TeamMember[]) => void;
}) {
	const [query, setQuery] = useState("");
	const [existingOpen, setExistingOpen] = useState(false);
	const [listOpen, setListOpen] = useState(true);
	const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set());

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
		if (!emailValid) return;
		if (members.some((m) => m.email === email)) {
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

	const toggleTeam = (teamId: string) => {
		const next = new Set(selectedTeamIds);
		if (next.has(teamId)) {
			next.delete(teamId);
			setMembers(members.filter((m) => m.sourceTeamId !== teamId));
		} else {
			next.add(teamId);
			const existing = new Set(members.map((m) => m.email));
			const added = BULK_IMPORT_USERS.slice(0, 10)
				.filter((u) => !existing.has(u.email))
				.map((u) => ({ ...u, sourceTeamId: teamId }));
			setMembers([...members, ...added]);
		}
		setSelectedTeamIds(next);
	};

	const removeMember = (idx: number) => setMembers(members.filter((_, i) => i !== idx));

	return (
		<Box display="flex" flexDirection="column" gap="16">
			<Field
				label={
					<Box display="inline-flex" alignItems="center" gap="4">
						<span>Search and select user to add</span>
						<Tooltip content="Search by name or email to find and add an existing user to this team.">
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

			<Box display="flex" alignItems="center" gap="8">
				<Link
					href="#"
					fontWeight="600"
					onClick={(e) => {
						e.preventDefault();
						setExistingOpen((o) => !o);
					}}
				>
					Or add users from existing Team
				</Link>
				<Tooltip content="Select one or more existing CMP teams to copy their members into this new team. Duplicate users will be added only once.">
					<span style={{ display: "inline-flex" }}>
						<IconCircleInfo size={14} color="var(--ax-colors-fg-tertiary)" />
					</span>
				</Tooltip>
			</Box>

			{existingOpen && (
				<Box display="flex" flexDirection="column" gap="8">
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						px="16"
						py="12"
						rounded="md"
						border="1"
						borderColor="border.default"
						cursor="pointer"
						onClick={() => setListOpen((o) => !o)}
					>
						<Text color={selectedTeamIds.size > 0 ? "fg.default" : "fg.tertiary"}>
							{selectedTeamIds.size > 0
								? `${selectedTeamIds.size} team${selectedTeamIds.size === 1 ? "" : "s"} selected`
								: "Select Team"}
						</Text>
						<Box
							style={{
								display: "inline-flex",
								transform: listOpen ? "rotate(180deg)" : "rotate(0deg)",
								transition: "transform 150ms ease",
							}}
						>
							<IconAngleDown size={16} color="var(--ax-colors-fg-secondary)" />
						</Box>
					</Box>

					{listOpen && (
						<Box
							rounded="md"
							border="1"
							borderColor="border.default"
							overflow="auto"
							style={{ maxHeight: 320 }}
						>
							{CMP_TEAMS.map((t) => (
								<Box
									key={t.id}
									display="flex"
									alignItems="start"
									gap="12"
									px="16"
									py="12"
									cursor="pointer"
									borderB="1"
									borderColor="border.tertiary"
									onClick={() => toggleTeam(t.id)}
								>
									<Box mt="2" onClick={(e) => e.stopPropagation()}>
										<Checkbox
											checked={selectedTeamIds.has(t.id)}
											onCheckedChange={() => toggleTeam(t.id)}
											aria-label={t.name}
										/>
									</Box>
									<Box display="flex" flexDirection="column" gap="2">
										<Text fontWeight="500" color="fg.default">
											{t.name}
										</Text>
										<Text fontSize="sm" color="fg.tertiary">
											{t.productName} · {t.instanceName}
										</Text>
									</Box>
								</Box>
							))}
						</Box>
					)}
				</Box>
			)}

			<Box display="flex" flexDirection="column" gap="8">
				<Heading level="4">User list</Heading>
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
							{members.map((m, i) => (
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
											onClick={() => removeMember(i)}
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
		</Box>
	);
}

function StepProductAccess({
	instance,
	setInstance,
}: {
	instance: string;
	setInstance: (v: string) => void;
}) {
	// Teams are scoped to CMP only — product is fixed, instance is selectable,
	// and there is no role assignment.
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

function StepReview({
	name,
	description,
	members,
	instance,
}: {
	name: string;
	description: string;
	members: TeamMember[];
	instance: string;
}) {
	const collapseLimit = 5;
	const [showAll, setShowAll] = useState(false);
	const showToggle = members.length > collapseLimit;
	const shown = showAll || !showToggle ? members : members.slice(0, collapseLimit);

	return (
		<Box display="flex" flexDirection="column" gap="20">
			<Box display="flex" flexDirection="column" gap="12">
				<Text fontWeight="600">Team info</Text>
				<Box display="grid" gap="12" style={{ gridTemplateColumns: "1fr 1fr" }}>
					<Box>
						<Text fontSize="sm" color="fg.secondary">
							Team name
						</Text>
						<Text fontWeight="600">{name || "—"}</Text>
					</Box>
					<Box>
						<Text fontSize="sm" color="fg.secondary">
							Description
						</Text>
						<Text fontWeight="600">{description || "—"}</Text>
					</Box>
				</Box>
			</Box>

			<Box display="flex" flexDirection="column" gap="12">
				<Text fontWeight="600">Members ({members.length})</Text>
				{members.length > 0 ? (
					<>
						<Table>
							<thead>
								<Tr>
									<Th>Email</Th>
									<Th>First name</Th>
									<Th>Last name</Th>
								</Tr>
							</thead>
							<tbody>
								{shown.map((m, i) => (
									<Tr key={`${m.email}-${i}`}>
										<Td>{m.email}</Td>
										<Td>{m.first || "—"}</Td>
										<Td>{m.last || "—"}</Td>
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
									{showAll ? "View less" : `View all ${members.length}`}
								</Button>
							</Box>
						)}
					</>
				) : (
					<Text fontSize="sm" color="fg.tertiary">
						No members added.
					</Text>
				)}
			</Box>

			<Box display="flex" flexDirection="column" gap="12">
				<Text fontWeight="600">Product access</Text>
				<Box display="grid" gap="12" style={{ gridTemplateColumns: "1fr 1fr" }}>
					<Box>
						<Text fontSize="sm" color="fg.secondary">
							Product
						</Text>
						<Text fontWeight="600">{TEAM_PRODUCT}</Text>
					</Box>
					<Box>
						<Text fontSize="sm" color="fg.secondary">
							Instance
						</Text>
						<Text fontWeight="600">{instance || "—"}</Text>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

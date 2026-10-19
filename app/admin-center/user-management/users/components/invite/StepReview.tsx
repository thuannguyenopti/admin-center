"use client";

import { useState } from "react";
import { Box, Button, Checkbox, Text } from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { AccessCard, type AccessEntry } from "../ProductAccessStep";
import type { InvitedUser } from "./types";

export function StepReview({
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
				<Text fontWeight="600">You&apos;re about to invite:</Text>
				<Table>
					<thead>
						<Tr>
							<Th>Email</Th>
							<Th>First name</Th>
							<Th>Last name</Th>
						</Tr>
					</thead>
					<tbody>
						{shown.map((u) => (
							<Tr key={u.email}>
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

			<InviteOptions
				requireAccept={requireAccept}
				setRequireAccept={setRequireAccept}
				sendEmail={sendEmail}
				setSendEmail={setSendEmail}
			/>
		</Box>
	);
}

export function InviteOptions({
	requireAccept,
	setRequireAccept,
	sendEmail,
	setSendEmail,
}: {
	requireAccept: boolean;
	setRequireAccept: (v: boolean) => void;
	sendEmail: boolean;
	setSendEmail: (v: boolean) => void;
}) {
	return (
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
	);
}

"use client";

import { useState } from "react";
import { Box, Button, Field, Input, Text, Tooltip } from "@optiaxiom/react";
import { IconCircleInfo, IconPlus, IconTrashCan } from "@optiaxiom/icons";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { lookupUserByEmail, UserSearchInput } from "../UserSearchInput";
import type { InvitedUser } from "./types";

export function StepUsers({
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

			<Box display="grid" gap="16" style={{ gridTemplateColumns: "1fr 1fr" }}>
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
							<Tr key={u.email}>
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

"use client";

import { useState } from "react";
import { Box, Button, Input, Text, toaster } from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import type { User } from "../../data";
import { BulkModalShell } from "./BulkModalShell";

export type UserInfoUpdate = { id: string; firstName: string; lastName: string };

export function EditUserInfoModal({
	users,
	onClose,
	onApply,
}: {
	users: User[];
	onClose: () => void;
	onApply: (updates: UserInfoUpdate[]) => void;
}) {
	const [draft, setDraft] = useState<Record<string, { firstName: string; lastName: string }>>(
		() =>
			Object.fromEntries(
				users.map((u) => [u.id, { firstName: u.firstName, lastName: u.lastName }]),
			),
	);

	const setField = (id: string, key: "firstName" | "lastName", value: string) =>
		setDraft((d) => ({ ...d, [id]: { ...d[id], [key]: value } }));

	const handleUpdate = () => {
		onApply(users.map((u) => ({ id: u.id, ...draft[u.id] })));
		toaster.create("User info updated", { intent: "success" });
		onClose();
	};

	return (
		<BulkModalShell
			title="Update user info"
			variant="panel"
			onClose={onClose}
			footer={
				<>
					<Button appearance="subtle" onClick={onClose}>
						Cancel
					</Button>
					<Button appearance="primary" onClick={handleUpdate}>
						Update
					</Button>
				</>
			}
		>
			<Table>
				<thead>
					<Tr>
						<Th>Email</Th>
						<Th style={{ width: 200 }}>First name</Th>
						<Th style={{ width: 200 }}>Last name</Th>
					</Tr>
				</thead>
				<tbody>
					{users.map((u) => (
						<Tr key={u.id}>
							<Td>
								<Text color="fg.secondary">{u.email}</Text>
							</Td>
							<Td>
								<Input
									value={draft[u.id]?.firstName ?? ""}
									onChange={(e) => setField(u.id, "firstName", e.target.value)}
									aria-label={`First name for ${u.email}`}
								/>
							</Td>
							<Td>
								<Input
									value={draft[u.id]?.lastName ?? ""}
									onChange={(e) => setField(u.id, "lastName", e.target.value)}
									aria-label={`Last name for ${u.email}`}
								/>
							</Td>
						</Tr>
					))}
				</tbody>
			</Table>
		</BulkModalShell>
	);
}

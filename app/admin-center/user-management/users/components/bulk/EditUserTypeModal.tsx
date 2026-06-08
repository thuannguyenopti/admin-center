"use client";

import { useState } from "react";
import {
	Banner,
	Box,
	Button,
	Radio,
	RadioGroup,
	Text,
	toaster,
} from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import type { User, UserType } from "../../data";
import { BulkModalShell } from "./BulkModalShell";

export type UserTypeUpdate = { id: string; userType: UserType };

export function EditUserTypeModal({
	users,
	onClose,
	onApply,
}: {
	users: User[];
	onClose: () => void;
	onApply: (updates: UserTypeUpdate[]) => void;
}) {
	const [draft, setDraft] = useState<Record<string, UserType>>(() =>
		Object.fromEntries(users.map((u) => [u.id, u.userType])),
	);

	const handleSave = () => {
		onApply(users.map((u) => ({ id: u.id, userType: draft[u.id] })));
		toaster.create("User type updated", { intent: "success" });
		onClose();
	};

	return (
		<BulkModalShell
			title="Update user type"
			variant="panel"
			onClose={onClose}
			footer={
				<>
					<Button appearance="subtle" onClick={onClose}>
						Cancel
					</Button>
					<Button appearance="primary" onClick={handleSave}>
						Confirm and save
					</Button>
				</>
			}
		>
			<Box display="flex" flexDirection="column" gap="16">
				<Banner intent="information">
					<Box display="flex" flexDirection="column" gap="4">
						<Text fontSize="sm">
							Changing user type to <strong>Local</strong> will send a password setup
							email to all selected users.
						</Text>
						<Text fontSize="sm">
							SSO users can&rsquo;t be edited or managed locally. Authentication is
							handled externally.
						</Text>
					</Box>
				</Banner>

				<Table>
					<thead>
						<Tr>
							<Th>Email</Th>
							<Th style={{ width: 240 }}>User type</Th>
						</Tr>
					</thead>
					<tbody>
						{users.map((u) => {
							// SSO users are managed externally and cannot be toggled locally.
							const locked = u.userType === "SSO";
							return (
								<Tr key={u.id}>
									<Td>
										<Text color="fg.secondary">{u.email}</Text>
									</Td>
									<Td>
										<RadioGroup
											value={draft[u.id]}
											onValueChange={(v) =>
												setDraft((d) => ({ ...d, [u.id]: v as UserType }))
											}
											disabled={locked}
										>
											<Box display="flex" alignItems="center" gap="24">
												<Radio value="Local">Local</Radio>
												<Radio value="SSO">SSO</Radio>
											</Box>
										</RadioGroup>
									</Td>
								</Tr>
							);
						})}
					</tbody>
				</Table>
			</Box>
		</BulkModalShell>
	);
}

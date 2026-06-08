"use client";

import { Banner, Box, Button, Text, toaster } from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import type { ActivationStatus, User } from "../../data";
import { BulkModalShell } from "./BulkModalShell";

function StatusText({ status }: { status: ActivationStatus }) {
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

export function DeleteUsersModal({
	users,
	onClose,
	onApply,
}: {
	users: User[];
	onClose: () => void;
	onApply: (ids: string[]) => void;
}) {
	const handleDelete = () => {
		const count = users.length;
		onApply(users.map((u) => u.id));
		toaster.create(`${count} user${count === 1 ? "" : "s"} deleted`, {
			intent: "success",
		});
		onClose();
	};

	return (
		<BulkModalShell
			title="Delete selected users"
			variant="panel"
			onClose={onClose}
			footer={
				<>
					<Button appearance="subtle" onClick={onClose}>
						Cancel
					</Button>
					<Button appearance="danger" onClick={handleDelete}>
						Confirm and delete
					</Button>
				</>
			}
		>
			<Box display="flex" flexDirection="column" gap="16">
				<Banner intent="warning">
					<Text fontSize="sm">
						This action will permanently remove selected users from your organization
						in Opti ID, and they will lose access to all previously assigned product
						access.
					</Text>
				</Banner>

				<Table>
					<thead>
						<Tr>
							<Th>Email</Th>
							<Th>First name</Th>
							<Th>Last name</Th>
							<Th>Activation status</Th>
						</Tr>
					</thead>
					<tbody>
						{users.map((u) => (
							<Tr key={u.id}>
								<Td>{u.email}</Td>
								<Td>{u.firstName}</Td>
								<Td>{u.lastName}</Td>
								<Td>
									<StatusText status={u.activationStatus} />
								</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			</Box>
		</BulkModalShell>
	);
}

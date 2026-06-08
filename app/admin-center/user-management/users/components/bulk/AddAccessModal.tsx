"use client";

import { useState } from "react";
import { Banner, Box, Button, Heading, Link, Text, toaster } from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import type { User } from "../../data";
import {
	AccessCard,
	AccessEditor,
	type AccessEntry,
	type AccessKind,
} from "../InviteUserPanel";
import { BulkModalShell } from "./BulkModalShell";

export function AddAccessModal({
	users,
	onClose,
	onSuccess,
}: {
	users: User[];
	onClose: () => void;
	onSuccess: () => void;
}) {
	const [step, setStep] = useState<1 | 2>(1);
	const [accessList, setAccessList] = useState<AccessEntry[]>([]);
	const [editor, setEditor] = useState<
		| { mode: "new" | "edit"; kind: AccessKind; id?: string; initial: AccessEntry | null }
		| null
	>(null);

	const startNew = (kind: AccessKind) => setEditor({ mode: "new", kind, initial: null });
	const startEdit = (entry: AccessEntry) =>
		setEditor({ mode: "edit", kind: entry.kind, id: entry.id, initial: entry });

	const handleSave = (data: Omit<AccessEntry, "id">) => {
		if (editor?.mode === "edit" && editor.id) {
			setAccessList((list) =>
				list.map((a) => (a.id === editor.id ? { ...data, id: editor.id! } : a)),
			);
		} else {
			setAccessList((list) => [...list, { ...data, id: `${Date.now()}-${Math.random()}` }]);
		}
		setEditor(null);
	};

	const handleConfirm = () => {
		const count = users.length;
		toaster.create(`Access added for ${count} user${count === 1 ? "" : "s"}`, {
			intent: "success",
		});
		onSuccess();
		onClose();
	};

	const canContinue = accessList.length > 0 && !editor;

	return (
		<BulkModalShell
			title="Add access"
			variant="panel"
			onClose={onClose}
			footer={
				step === 1 ? (
					<>
						<Button appearance="subtle" onClick={onClose}>
							Back
						</Button>
						<Button appearance="primary" disabled={!canContinue} onClick={() => setStep(2)}>
							Continue
						</Button>
					</>
				) : (
					<>
						<Button appearance="subtle" onClick={() => setStep(1)}>
							Back
						</Button>
						<Button appearance="primary" onClick={handleConfirm}>
							Confirm
						</Button>
					</>
				)
			}
		>
			{step === 1 ? (
				<Box display="flex" flexDirection="column" gap="16">
					<Banner intent="information">
						<Box display="flex" flexDirection="column" gap="4">
							<Text fontSize="sm">
								All access from current selected users cannot be added again.
							</Text>
							<Text fontSize="sm">
								If you cannot find a Role to an access entity, it&rsquo;s likely that
								one of the selected users already has it, individually or via{" "}
								<Link href="#" onClick={(e) => e.preventDefault()}>
									Group Access
								</Link>
								.
							</Text>
						</Box>
					</Banner>

					<Box display="flex" alignItems="center" justifyContent="space-between" gap="12">
						<Heading level="4">Access</Heading>
						<Box display="flex" gap="8">
							<Button
								appearance="default"
								size="sm"
								disabled={!!editor}
								onClick={() => startNew("product")}
							>
								Add product access
							</Button>
							<Button
								appearance="default"
								size="sm"
								disabled={!!editor}
								onClick={() => startNew("group")}
							>
								Add group access
							</Button>
						</Box>
					</Box>

					{accessList.map((entry) =>
						editor && editor.mode === "edit" && editor.id === entry.id ? (
							<Box key={entry.id} p="16" rounded="md" border="1" borderColor="border.default">
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
									setAccessList((list) => list.filter((a) => a.id !== entry.id))
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
						<Box py="40" textAlign="center">
							<Text color="fg.tertiary">No access added yet.</Text>
							<Text color="fg.tertiary">
								Choose one of the options to define what this user can do
							</Text>
						</Box>
					)}
				</Box>
			) : (
				<Box display="flex" flexDirection="column" gap="20">
					<Box display="flex" flexDirection="column" gap="12">
						<Text fontWeight="600">
							Adding access for {users.length} user{users.length === 1 ? "" : "s"}:
						</Text>
						<Table>
							<thead>
								<Tr>
									<Th>Email</Th>
									<Th>First name</Th>
									<Th>Last name</Th>
								</Tr>
							</thead>
							<tbody>
								{users.map((u) => (
									<Tr key={u.id}>
										<Td>{u.email}</Td>
										<Td>{u.firstName || "—"}</Td>
										<Td>{u.lastName || "—"}</Td>
									</Tr>
								))}
							</tbody>
						</Table>
					</Box>

					<Box display="flex" flexDirection="column" gap="12">
						<Text fontWeight="600">
							with the following access{accessList.length === 1 ? "" : "es"}:
						</Text>
						{accessList.map((entry) => (
							<AccessCard key={entry.id} entry={entry} defaultOpen readOnly />
						))}
					</Box>
				</Box>
			)}
		</BulkModalShell>
	);
}

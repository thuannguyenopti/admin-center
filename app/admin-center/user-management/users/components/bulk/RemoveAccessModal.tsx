"use client";

import { useState } from "react";
import { Box, Button, Field, Text, toaster } from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { PRODUCTS, INSTANCES, ROLES, type User } from "../../data";
import { SingleSelectMenu, MultiSelectMenu } from "../InviteUserPanel";
import { BulkModalShell } from "./BulkModalShell";

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<Box display="grid" gap="16" style={{ gridTemplateColumns: "120px 1fr" }}>
			<Text color="fg.secondary">{label}</Text>
			<Box display="flex" flexDirection="column" gap="2">
				{children}
			</Box>
		</Box>
	);
}

export function RemoveAccessModal({
	users,
	onClose,
	onSuccess,
}: {
	users: User[];
	onClose: () => void;
	onSuccess: () => void;
}) {
	const [step, setStep] = useState<1 | 2>(1);
	const [product, setProduct] = useState("");
	const [role, setRole] = useState("");
	const [instances, setInstances] = useState<string[]>([]);

	const canContinue = !!product && !!role && instances.length > 0;

	const handleRemove = () => {
		const count = users.length;
		toaster.create(`Access removed for ${count} user${count === 1 ? "" : "s"}`, {
			intent: "success",
		});
		onSuccess();
		onClose();
	};

	return (
		<BulkModalShell
			title="Remove access"
			variant="panel"
			onClose={onClose}
			footer={
				step === 1 ? (
					<>
						<Button appearance="subtle" onClick={onClose}>
							Cancel
						</Button>
						<Button appearance="primary" disabled={!canContinue} onClick={() => setStep(2)}>
							Continue
						</Button>
					</>
				) : (
					<>
						<Button appearance="subtle" onClick={() => setStep(1)}>
							Cancel
						</Button>
						<Button appearance="danger" onClick={handleRemove}>
							Remove access
						</Button>
					</>
				)
			}
		>
			{step === 1 ? (
				<Box display="flex" flexDirection="column" gap="16">
					<Text color="fg.secondary">
						Choose the role you want to remove and where it applies.
					</Text>

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
							value={product}
							options={PRODUCTS as readonly string[]}
							onChange={(v) => {
								setProduct(v);
								setRole("");
								setInstances([]);
							}}
						/>
					</Field>

					<Field label="Role to remove">
						<SingleSelectMenu
							label="Role"
							value={role}
							options={product ? (ROLES as readonly string[]) : []}
							onChange={setRole}
						/>
					</Field>

					<Field label="Apply to instances">
						<MultiSelectMenu
							label="Instance"
							values={instances}
							options={INSTANCES as readonly string[]}
							onChange={setInstances}
							disabled={!product}
						/>
					</Field>
				</Box>
			) : (
				<Box display="flex" flexDirection="column" gap="20">
					<Box display="flex" flexDirection="column" gap="12">
						<Text fontWeight="600">I want to:</Text>
						<Box
							p="16"
							rounded="md"
							bg="bg.page"
							display="flex"
							flexDirection="column"
							gap="12"
						>
							<SummaryRow label="Remove role">
								<Text fontWeight="600">{role}</Text>
							</SummaryRow>
							<SummaryRow label="From Product">
								<Text fontWeight="600">{product}</Text>
							</SummaryRow>
							<SummaryRow label="Instance">
								{instances.map((inst) => (
									<Text key={inst} fontWeight="600">
										{inst}
									</Text>
								))}
							</SummaryRow>
						</Box>
					</Box>

					<Box display="flex" flexDirection="column" gap="12">
						<Text fontWeight="600">Apply on selected users</Text>
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
				</Box>
			)}
		</BulkModalShell>
	);
}

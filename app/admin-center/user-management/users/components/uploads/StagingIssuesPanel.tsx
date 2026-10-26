"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
	Banner,
	Box,
	Button,
	Checkbox,
	Heading,
	Text,
} from "@optiaxiom/react";
import { IconTrashCan, IconXmark } from "@optiaxiom/icons";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { stagingStatusColor, type StagingUser } from "./data";

const PANEL_WIDTH = 640;

export function StagingIssuesPanel({
	open,
	issues,
	onClose,
	onDelete,
	onOverride,
}: {
	open: boolean;
	issues: StagingUser[];
	onClose: () => void;
	onDelete: (ids: string[]) => void;
	onOverride: (ids: string[]) => void;
}) {
	const [selected, setSelected] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (open) setSelected(new Set());
	}, [open, issues]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	if (!open || typeof document === "undefined") return null;

	const allSelected =
		issues.length > 0 && issues.every((u) => selected.has(u.id));

	const overrideableSelected = issues.filter(
		(u) =>
			selected.has(u.id) &&
			(u.status === "Duplicate" || u.status === "Conflict"),
	);

	const toggle = (id: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	};

	const toggleAll = (checked: boolean) => {
		setSelected(checked ? new Set(issues.map((u) => u.id)) : new Set());
	};

	const handleDelete = () => {
		const ids = [...selected];
		if (ids.length === 0) return;
		onDelete(ids);
		setSelected(new Set());
	};

	const handleOverride = () => {
		const ids = overrideableSelected.map((u) => u.id);
		if (ids.length === 0) return;
		onOverride(ids);
		setSelected(new Set());
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
				aria-label="Staging issues"
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
					<Heading level="2">Staging issues</Heading>
					<Button
						appearance="subtle"
						size="md"
						icon={<IconXmark size={20} />}
						aria-label="Close"
						onClick={onClose}
					/>
				</Box>

				<Box
					flex="1"
					overflow="auto"
					px="24"
					py="20"
					display="flex"
					flexDirection="column"
					gap="16"
				>
					<Banner intent="warning">
						<Text fontSize="sm">
							Duplicates and conflicts: Remove to skip, or Override to
							overwrite the existing user&rsquo;s access. Unknown groups: fix
							the group on the staging table first.
						</Text>
					</Banner>

					{issues.length === 0 ? (
						<Text fontSize="sm" color="fg.tertiary">
							No issues in staging.
						</Text>
					) : (
						<Table>
							<thead>
								<Tr>
									<Th style={{ width: 40, paddingLeft: 16, paddingRight: 0 }}>
										<Checkbox
											checked={allSelected}
											onCheckedChange={(v) => toggleAll(!!v)}
											aria-label="Select all issues"
										/>
									</Th>
									<Th style={{ paddingLeft: 8 }}>Email</Th>
									<Th>Group</Th>
									<Th>Status</Th>
								</Tr>
							</thead>
							<tbody>
								{issues.map((u) => (
									<Tr key={u.id}>
										<Td
											style={{
												width: 40,
												paddingLeft: 16,
												paddingRight: 0,
												verticalAlign: "middle",
											}}
										>
											<Checkbox
												checked={selected.has(u.id)}
												onCheckedChange={() => toggle(u.id)}
												aria-label={`Select ${u.email}`}
											/>
										</Td>
										<Td style={{ paddingLeft: 8 }}>
											<Box display="flex" flexDirection="column" gap="2">
												<Text color="fg.error" fontWeight="500">
													{u.email}
												</Text>
												<Text fontSize="sm" color="fg.secondary">
													{u.first} {u.last}
												</Text>
											</Box>
										</Td>
										<Td>
											<Text fontSize="sm">{u.groupName || "—"}</Text>
										</Td>
										<Td>
											<Text
												asChild
												color={stagingStatusColor(u.status)}
												fontWeight="500"
											>
												<span>
													{u.status}
													{u.resolution === "override" ? " · override" : ""}
												</span>
											</Text>
										</Td>
									</Tr>
								))}
							</tbody>
						</Table>
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
					flexWrap="wrap"
				>
					<Button appearance="subtle" onClick={onClose}>
						Close
					</Button>
					<Button
						appearance="default"
						disabled={overrideableSelected.length === 0}
						onClick={handleOverride}
					>
						{`Override${overrideableSelected.length > 0 ? ` (${overrideableSelected.length})` : ""}`}
					</Button>
					<Button
						appearance="danger-outline"
						icon={<IconTrashCan size={16} />}
						iconPosition="start"
						disabled={selected.size === 0}
						onClick={handleDelete}
					>
						{`Remove${selected.size > 0 ? ` (${selected.size})` : ""}`}
					</Button>
				</Box>
			</Box>
		</>,
		document.body,
	);
}

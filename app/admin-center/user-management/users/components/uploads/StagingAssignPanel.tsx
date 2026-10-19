"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Button, Heading, Text, toaster } from "@optiaxiom/react";
import { IconXmark } from "@optiaxiom/icons";
import {
	ProductAccessStep,
	type AccessEntry,
} from "../ProductAccessStep";
import { CollapsibleUserList } from "../invite/CollapsibleUserList";
import { InviteOptions } from "../invite/StepReview";
import type { InvitedUser } from "../invite/types";
import type { StagingUser } from "./data";

const PANEL_WIDTH = 720;

export function StagingAssignPanel({
	open,
	users,
	onClose,
	onComplete,
}: {
	open: boolean;
	users: StagingUser[];
	onClose: () => void;
	/** Called with staging ids that received access and were imported. */
	onComplete: (stagingIds: string[]) => void;
}) {
	const [accessList, setAccessList] = useState<AccessEntry[]>([]);
	const [editorOpen, setEditorOpen] = useState(false);
	const [requireAccept, setRequireAccept] = useState(false);
	const [sendEmail, setSendEmail] = useState(false);

	const invited: InvitedUser[] = users.map((u) => ({
		email: u.email,
		first: u.first,
		last: u.last,
	}));

	useEffect(() => {
		if (!open) return;
		setAccessList([]);
		setEditorOpen(false);
		setRequireAccept(false);
		setSendEmail(false);
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== "Escape") return;
			const layerOpen = document.querySelector(
				'[role="listbox"], [data-radix-popper-content-wrapper]',
			);
			if (layerOpen) return;
			onClose();
		};
		document.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
		};
	}, [open, onClose]);

	if (!open || typeof document === "undefined") return null;

	const canImport =
		users.length > 0 && accessList.length > 0 && !editorOpen;

	const handleConfirm = () => {
		if (!canImport) return;
		const count = users.length;
		toaster.create(
			`${count} user${count === 1 ? "" : "s"} imported with access`,
			{ intent: "success" },
		);
		onComplete(users.map((u) => u.id));
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
				aria-label="Assign access to staged users"
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
					<Box display="flex" flexDirection="column" gap="4">
						<Heading level="2">Assign access</Heading>
						<Text fontSize="sm" color="fg.secondary">
							{`${users.length} staged user${users.length === 1 ? "" : "s"} selected`}
						</Text>
					</Box>
					<Button
						appearance="subtle"
						size="md"
						icon={<IconXmark size={20} />}
						aria-label="Close"
						onClick={onClose}
					/>
				</Box>

				<Box flex="1" overflow="auto" px="24" py="20">
					<Box display="flex" flexDirection="column" gap="20">
						<Box display="flex" flexDirection="column" gap="8">
							<Text fontWeight="600">Users</Text>
							<CollapsibleUserList users={invited} limit={6} />
						</Box>

						{/* Selection already happened on Upload tab — open access editor immediately */}
						<ProductAccessStep
							accessList={accessList}
							setAccessList={setAccessList}
							onEditorChange={setEditorOpen}
							autoOpenWhenEmpty
							initialKind="product"
						/>

						<InviteOptions
							requireAccept={requireAccept}
							setRequireAccept={setRequireAccept}
							sendEmail={sendEmail}
							setSendEmail={setSendEmail}
						/>
					</Box>
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
					<Button appearance="subtle" onClick={onClose}>
						Cancel
					</Button>
					<Button
						appearance="primary"
						disabled={!canImport}
						onClick={handleConfirm}
					>
						Import with access
					</Button>
				</Box>
			</Box>
		</>,
		document.body,
	);
}

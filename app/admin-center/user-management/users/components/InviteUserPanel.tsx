"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Button, Heading, Text, toaster } from "@optiaxiom/react";
import { IconPaperPlaneTop, IconPlus, IconXmark } from "@optiaxiom/icons";
import { ProductAccessStep, type AccessEntry } from "./ProductAccessStep";
import { Stepper } from "./invite/Stepper";
import { StepUsers } from "./invite/StepUsers";
import { StepUploadUsers } from "./invite/StepUploadUsers";
import { StepReview } from "./invite/StepReview";
import {
	BulkAssignStep,
	type BulkSelectBarState,
} from "./invite/BulkAssignStep";
import { BulkReviewStep } from "./invite/BulkReviewStep";
import {
	flattenClusterAccess,
	type AccessCluster,
	type InvitedUser,
} from "./invite/types";

export type { InvitedUser } from "./invite/types";
export type { AccessCluster } from "./invite/types";

// Re-export the access primitives so existing consumers (bulk action modals,
// etc.) can keep importing them from here.
export {
	AccessCard,
	AccessEditor,
	SingleSelectMenu,
	MultiSelectMenu,
} from "./ProductAccessStep";
export type { AccessEntry, AccessKind, AccessInstance } from "./ProductAccessStep";

const MANUAL_STEPS = ["User list", "Product access", "Review"] as const;
const BULK_STEPS = ["Upload", "Assign by batch", "Preview"] as const;
const PANEL_WIDTH = 720;

export function InviteUserPanel({
	open,
	onClose,
	onSubmit,
	presetProduct,
	mode = "manual",
}: {
	open: boolean;
	onClose: () => void;
	onSubmit?: (invited: InvitedUser[], access: AccessEntry[]) => void;
	/** Pre-fill the product field on Step 2 (e.g. when invoked from a product detail page). */
	presetProduct?: string;
	/** "manual" = type users one by one; "upload" = CSV → select batches → assign access. */
	mode?: "manual" | "upload";
}) {
	const isBulk = mode === "upload";
	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [users, setUsers] = useState<InvitedUser[]>([]);
	const [accessList, setAccessList] = useState<AccessEntry[]>([]);
	const [clusters, setClusters] = useState<AccessCluster[]>([]);
	const [editorOpen, setEditorOpen] = useState(false);
	const [assignBusy, setAssignBusy] = useState(false);
	const [selectBar, setSelectBar] = useState<BulkSelectBarState>(null);
	const [requireAccept, setRequireAccept] = useState(false);
	const [sendEmail, setSendEmail] = useState(false);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== "Escape") return;
			// Let open menus/popovers consume Escape before closing the panel.
			const layerOpen = document.querySelector(
				'[role="listbox"], [data-radix-popper-content-wrapper], [data-state="open"][role="dialog"]',
			);
			if (layerOpen) return;
			onClose();
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
			setUsers([]);
			setAccessList([]);
			setClusters([]);
			setEditorOpen(false);
			setAssignBusy(false);
			setSelectBar(null);
			setRequireAccept(false);
			setSendEmail(false);
		}
	}, [open, mode]);

	if (!open || typeof document === "undefined") return null;

	const canContinue = isBulk
		? step === 1
			? users.length > 0
			: step === 2
				? clusters.length > 0 && !assignBusy
				: true
		: step === 1
			? users.length > 0
			: step === 2
				? accessList.length > 0 && !editorOpen
				: true;

	const handleSend = () => {
		const access = isBulk ? flattenClusterAccess(clusters) : accessList;
		const count = users.length;
		onSubmit?.(users, access);
		toaster.create(
			`${count} invitation${count === 1 ? "" : "s"} sent`,
			{ intent: "success" },
		);
		onClose();
	};

	const title = isBulk ? "Bulk invite" : "Invite user";

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
				aria-label={title}
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
					<Heading level="2">{title}</Heading>
					<Button
						appearance="subtle"
						size="md"
						icon={<IconXmark size={20} />}
						aria-label="Close"
						onClick={onClose}
					/>
				</Box>

				<Box px="24" py="20" borderB="1" borderColor="border.tertiary">
					<Stepper
						step={step}
						labels={isBulk ? BULK_STEPS : MANUAL_STEPS}
					/>
				</Box>

				<Box flex="1" overflow="auto" px="24" py="20">
					{step === 1 &&
						(isBulk ? (
							<StepUploadUsers users={users} setUsers={setUsers} />
						) : (
							<StepUsers users={users} setUsers={setUsers} />
						))}
					{step === 2 &&
						(isBulk ? (
							<BulkAssignStep
								users={users}
								clusters={clusters}
								setClusters={setClusters}
								onBusyChange={setAssignBusy}
								onSelectBarChange={setSelectBar}
								presetProduct={presetProduct}
							/>
						) : (
							<ProductAccessStep
								accessList={accessList}
								setAccessList={setAccessList}
								onEditorChange={setEditorOpen}
								presetProduct={presetProduct}
							/>
						))}
					{step === 3 &&
						(isBulk ? (
							<BulkReviewStep
								users={users}
								clusters={clusters}
								requireAccept={requireAccept}
								setRequireAccept={setRequireAccept}
								sendEmail={sendEmail}
								setSendEmail={setSendEmail}
							/>
						) : (
							<StepReview
								users={users}
								accessList={accessList}
								requireAccept={requireAccept}
								setRequireAccept={setRequireAccept}
								sendEmail={sendEmail}
								setSendEmail={setSendEmail}
							/>
						))}
				</Box>

				{selectBar && step === 2 && isBulk && (
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						gap="12"
						px="24"
						py="12"
						borderT="1"
						borderColor="border.tertiary"
						bg="bg.default"
						flexWrap="wrap"
					>
						<Text fontSize="sm" fontWeight="500">
							{`${selectBar.count} user${selectBar.count === 1 ? "" : "s"} selected`}
						</Text>
						<Box display="flex" gap="8" flexWrap="wrap">
							<Button
								appearance="default"
								size="sm"
								icon={<IconPlus size={16} />}
								iconPosition="start"
								onClick={selectBar.onSetProduct}
							>
								Set product access
							</Button>
							<Button
								appearance="default"
								size="sm"
								icon={<IconPlus size={16} />}
								iconPosition="start"
								onClick={selectBar.onSetGroup}
							>
								Set group access
							</Button>
						</Box>
					</Box>
				)}

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
							onClick={() => setStep((s) => (s - 1) as 1 | 2)}
						>
							Back
						</Button>
					)}
					{step < 3 ? (
						<Button
							appearance="primary"
							disabled={!canContinue}
							onClick={() => setStep((s) => (s + 1) as 2 | 3)}
						>
							Continue
						</Button>
					) : (
						<Button
							appearance="primary"
							icon={<IconPaperPlaneTop size={16} />}
							iconPosition="start"
							onClick={handleSend}
						>
							Send invite
						</Button>
					)}
				</Box>
			</Box>
		</>,
		document.body,
	);
}

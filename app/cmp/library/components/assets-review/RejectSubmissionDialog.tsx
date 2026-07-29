"use client";

import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogBody,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	Box,
	Field,
	Textarea,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";

/** Confirmation for rejecting a Drop Zone submission — requires a reason, since it's
 * shown back to the submitter on the public drop-zone page they uploaded through
 * (see [token]/page.tsx's "Your submissions" section). Same AlertDialog/Field/Textarea
 * shape as app/cmp/library/components/assets/OverrideReasonDialog.tsx (this repo's
 * existing "confirm with a required reason" pattern). Stays mounted (parent just flips
 * `open`) rather than being conditionally rendered, so its own reset logic — not
 * unmount — clears state between uses. */
export function RejectSubmissionDialog({
	open,
	submitterName,
	onCancel,
	onConfirm,
}: {
	open: boolean;
	submitterName: string;
	onCancel: () => void;
	onConfirm: (reason: string) => void;
}) {
	const [reason, setReason] = useState("");

	if (!open) return null;

	function reset() {
		setReason("");
	}

	function handleCancel() {
		reset();
		onCancel();
	}

	function handleConfirm() {
		onConfirm(reason.trim());
		reset();
	}

	return (
		<>
			<Box style={{ backdropFilter: "blur(8px)", background: "rgba(231, 239, 255, 0.42)", inset: 0, position: "fixed", zIndex: 79 }} />
			<AlertDialog open onOpenChange={(next) => { if (!next) handleCancel(); }}>
				<AlertDialogContent size="md" style={{ maxWidth: 440, width: "min(440px, calc(100vw - 48px))" }}>
					<AlertDialogHeader addonBefore={null}>
						<Text color="fg.default" fontSize="lg" fontWeight="600">Reject this submission?</Text>
					</AlertDialogHeader>
					<AlertDialogBody>
						<Box display="flex" flexDirection="column" gap="16">
							<Text color="fg.secondary" fontSize="md">
								Your reason is shown to {submitterName} back on the Drop Zone page they submitted through.
							</Text>
							<Field label="Reason for rejection" required>
								<Textarea
									autoFocus
									placeholder="e.g. RAW file needs color grading before we can use it — please resubmit a graded export."
									rows={3}
									value={reason}
									onChange={(e) => setReason(e.target.value)}
								/>
							</Field>
						</Box>
					</AlertDialogBody>
					<AlertDialogFooter alignItems="center" display="flex" justifyContent="flex-end" style={{ gap: 8 }}>
						<AlertDialogCancel appearance="subtle" onClick={handleCancel}>Cancel</AlertDialogCancel>
						<AlertDialogAction appearance="primary" disabled={!reason.trim()} onClick={handleConfirm} style={{ color: "var(--ax-colors-fg-error)" }}>
							Reject
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

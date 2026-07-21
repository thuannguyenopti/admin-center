"use client";

import { useState } from "react";
import { Box, Dialog, DialogContent, DialogHeader } from "@optiaxiom/react";
import { ChangeSummaryPanel, type ActionKey } from "@/app/dam/versions/components/ChangeSummaryPanel";
import { DiffCanvas } from "@/app/dam/versions/components/DiffCanvas";
import { FeedbackComposeView } from "@/app/dam/components/FeedbackComposeView";
import { Text } from "@/app/components/Text";
import type { VersionSubmission } from "@/app/dam/versions/data";
import { CURRENT_USER, recordDecision, type DecisionAction } from "../../auditTrail";
import type { LibraryItem } from "../../page";
import styles from "./VersionReviewDialog.module.css";

const ACTION_BY_KEY: Record<ActionKey, DecisionAction> = {
	approved: "approved",
	changes: "changes-requested",
	rejected: "rejected",
};

const DRAFT_CONFIG: Record<ActionKey, {
	actionLabel: string;
	fieldLabel: string;
	intent?: "success" | "warning" | "danger";
	defaultMsg: (s: VersionSubmission) => string;
}> = {
	rejected: { actionLabel: "Rejecting", fieldLabel: "Rejection reason", intent: "danger", defaultMsg: (s) => s.rejectDraft },
	changes: { actionLabel: "Requesting changes on", fieldLabel: "Feedback to submitter", defaultMsg: (s) => s.changesDraft },
	approved: { actionLabel: "Approving", fieldLabel: "Version log note", intent: "success", defaultMsg: (s) => s.approveNote },
};

export function toVersionSubmission(item: LibraryItem): VersionSubmission | null {
	if (!item.pendingVersion) return null;
	return {
		id: item.id,
		assetName: item.title,
		currentImage: item.image ?? item.pendingVersion.pendingImage,
		...item.pendingVersion,
	};
}

/**
 * Version diff + approve/reject/request-changes dialog for a pending edit submission.
 * Reused by both AssetFocusPanel's persistent "Pending version" banner and the
 * Edit Submissions queue, so the diff-viewer and audit-trail wiring exist in exactly one
 * place rather than drifting across two call sites.
 *
 * Reject/Request Changes/Approve open a full-width FeedbackComposeView in place of the
 * comparison split view — judging the change and writing to the submitter are different
 * tasks, so each gets the dialog's full width rather than the compose step being
 * squeezed into ChangeSummaryPanel's narrow sidebar column.
 */
export function VersionReviewDialog({ item, open, onClose }: { item: LibraryItem; open: boolean; onClose: () => void }) {
	const submission = toVersionSubmission(item);
	const [draftAction, setDraftAction] = useState<ActionKey | null>(null);
	const [draftMsg, setDraftMsg] = useState("");

	if (!submission) return null;

	function requestDraft(action: ActionKey) {
		setDraftMsg(DRAFT_CONFIG[action].defaultMsg(submission!));
		setDraftAction(action);
	}

	function send() {
		if (!draftAction) return;
		recordDecision({
			action: ACTION_BY_KEY[draftAction],
			actor: CURRENT_USER,
			itemId: item.id,
			itemTitle: item.title,
			note: draftMsg,
		});
		setDraftAction(null);
		onClose();
	}

	function handleOpenChange(next: boolean) {
		if (!next) {
			setDraftAction(null);
			onClose();
		}
	}

	const draft = draftAction ? DRAFT_CONFIG[draftAction] : null;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				size="lg"
				style={{ display: "flex", flexDirection: "column", height: "84vh", maxHeight: 860, maxWidth: 1280, width: "calc(100vw - 96px)" }}
			>
				<DialogHeader
					addonAfter={submission.reviewDeadline && !draft && (
						<Text color="fg.tertiary" fontSize="sm">Due {submission.reviewDeadline}</Text>
					)}
				>
					<Box display="flex" flexDirection="column" gap="2">
						<Text fontSize="lg" fontWeight="600">{submission.assetName}</Text>
						<Text color="fg.secondary" fontSize="sm">
							{submission.versionLabel} · submitted by {submission.submitter}, {submission.submittedAt}
						</Text>
					</Box>
				</DialogHeader>

				{draft ? (
					<FeedbackComposeView
						actionLabel={draft.actionLabel}
						assetImage={submission.pendingImage}
						assetName={submission.assetName}
						fieldLabel={draft.fieldLabel}
						intent={draft.intent}
						onCancel={() => setDraftAction(null)}
						onChange={setDraftMsg}
						onSend={send}
						value={draftMsg}
					/>
				) : (
					<div className={styles.body}>
						<DiffCanvas submission={submission} />
						<div className={styles.sidePanel}>
							<ChangeSummaryPanel onRequestDraft={requestDraft} submission={submission} />
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

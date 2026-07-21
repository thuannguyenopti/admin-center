"use client";

import { IconPaperPlaneTop, IconXmark } from "@optimizely/axiom-icons";
import { OpalAssessmentPanel, type AssessmentAction, type AssessmentCompletedState } from "@/app/dam/components/OpalAssessmentPanel";
import { STATUS_BADGE } from "./OpalReviewCard";
import type { LibraryItem } from "../../page";

/** Drafts synthesized from the asset itself — mirrors VersionReviewDialog's toVersionSubmission, since LibraryItem has no stored draft text the way VersionSubmission does. */
function buildDrafts(item: LibraryItem) {
	const who = item.submittedBy ?? "there";
	const flags = item.opalFlags ?? [];
	const bullets = flags.map((f) => `- ${f.category}: ${f.detail}${f.fix ? ` (Recommended: ${f.fix})` : ""}`).join("\n");

	const changesDraft = flags.length
		? `Hi ${who} — OPAL flagged the following before "${item.title}" can be approved:\n\n${bullets}\n\nPlease review and resubmit.\n\n— Optimizely DAM`
		: `Hi ${who} — OPAL flagged issues with "${item.title}". Please review before resubmitting.\n\n— Optimizely DAM`;

	const rejectDraft = `Hi ${who} — "${item.title}" has been rejected and will not be published.\n\n— Optimizely DAM`;

	return { changesDraft, rejectDraft };
}

/** Wraps the shared OpalAssessmentPanel (app/dam/components) for the Request Changes / Reject flow on a LibraryItem. Deliberately excludes an "Approve" action — approval is a structured override (see auditTrail.ts + OverrideReasonDialog), not a free-text draft. */
export function AssetReviewActionsPanel({ item, onAction }: { item: LibraryItem; onAction: (key: string, draft?: string) => void }) {
	const flags = item.opalFlags ?? [];
	const badge = STATUS_BADGE[item.opalStatus ?? "pending"];
	const { changesDraft, rejectDraft } = buildDrafts(item);

	const reasoning = flags.length
		? `OPAL found ${flags.length} brand issue${flags.length === 1 ? "" : "s"} that need addressing before this asset can be approved.`
		: "This asset is awaiting its first automated brand review.";

	const actions: AssessmentAction[] = [
		{
			key: "rejected",
			label: "Reject",
			icon: <IconXmark size={14} />,
			appearance: "danger",
			requiresDraft: true,
			draftDefault: rejectDraft,
			draftLabel: "Rejection reason",
			draftEyebrow: "Rejecting",
			draftIntent: "danger",
		},
		{
			key: "changes",
			label: "Request Changes",
			icon: <IconPaperPlaneTop size={14} />,
			appearance: "default",
			requiresDraft: true,
			draftDefault: changesDraft,
			draftLabel: "Feedback to submitter",
			draftEyebrow: "Requesting changes on",
		},
	];

	const completedStates: Record<string, AssessmentCompletedState> = {
		rejected: { intent: "danger", label: "Rejected", sub: "Submitter notified. Asset will not be published.", icon: <IconXmark size={18} /> },
		changes: { intent: "warning", label: "Changes requested", sub: "OPAL-drafted feedback sent to the submitter.", icon: <IconPaperPlaneTop size={18} /> },
	};

	return (
		<OpalAssessmentPanel
			actions={actions}
			assetImage={item.image}
			assetName={item.title}
			completedStates={completedStates}
			eyebrow="OPAL Brand Review"
			flags={flags}
			onAction={onAction}
			reasoning={reasoning}
			score={item.opalConfidence ?? 90}
			scoreLabel="compliance"
			status={{ label: badge.label, intent: "warning" }}
		/>
	);
}

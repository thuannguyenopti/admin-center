"use client";

import { useState } from "react";
import {
	Badge,
	Box,
	Disclosure,
	DisclosureContent,
	DisclosureTrigger,
} from "@optiaxiom/react";
import { IconCircleCheckSolid, IconTriangleExclamation } from "@optimizely/axiom-icons";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { Caption } from "@/app/dam/components/Caption";
import type { Intent } from "../../data";
import type { VersionSubmission } from "../data";

export type ActionKey = "rejected" | "changes" | "approved";

const RECOMMENDATION_STATUS: Record<VersionSubmission["recommendation"], { label: string; intent: Intent }> = {
	approve: { label: "Recommend approve", intent: "success" },
	flag: { label: "Mixed signals", intent: "warning" },
	reject: { label: "Recommend reject", intent: "danger" },
};

const CHANGE_TYPE_LABEL: Record<string, string> = {
	added: "Added",
	removed: "Removed",
	modified: "Modified",
};

/**
 * Version-comparison decision panel — plain-language verdict, submitter's own note,
 * what changed, flags and the approve/reject/request-changes action bar. Purpose-built
 * for version review rather than sharing OpalAssessmentPanel, which stays focused on
 * Pillar 1 asset pre-screening. The reject/request-changes/approve compose step lives
 * one level up in VersionReviewDialog (see FeedbackComposeView) so it can take over
 * the dialog's full width instead of being squeezed into this panel's sidebar column.
 */
export function ChangeSummaryPanel({
	submission,
	onRequestDraft,
}: {
	submission: VersionSubmission;
	onRequestDraft: (action: ActionKey) => void;
}) {
	const [clearancesOpen, setClearancesOpen] = useState(false);
	const status = RECOMMENDATION_STATUS[submission.recommendation];

	return (
		<Box display="flex" flexDirection="column" style={{ height: "100%", minHeight: 0 }}>
			<Box display="flex" flexDirection="column" gap="10" px="24" py="24" borderB="1" borderColor="border.secondary">
				<Box alignItems="center" display="flex" gap="10" justifyContent="space-between">
					<Badge intent={status.intent}>{status.label}</Badge>
					<Text color="fg.tertiary" fontSize="sm">{submission.confidence}% confidence</Text>
				</Box>
				<Text color="fg.secondary" fontSize="md" style={{ lineHeight: 1.65 }}>{submission.reasoning}</Text>
			</Box>

			<Box className="version-panel-scroll" style={{ flex: 1, overflowY: "auto" }}>
				<Box display="flex" flexDirection="column" gap="24" px="24" py="24">
					<Box>
						<Caption style={{ display: "block", marginBottom: 8 }}>
							What {submission.submitter.split(" ")[0]} said
						</Caption>
						<Text color="fg.secondary" fontSize="md" style={{ lineHeight: 1.65, fontStyle: "italic" }}>
							&ldquo;{submission.whatChanged}&rdquo;
						</Text>
					</Box>

					{submission.discrepancy && (
						<Box display="flex" gap="10" p="16" rounded="md" style={{ background: "var(--ax-colors-bg-warning-subtle)" }}>
							<IconTriangleExclamation size={16} style={{ color: "var(--ax-colors-fg-warning)", flexShrink: 0, marginTop: 2 }} />
							<Text color="fg.default" fontSize="md" style={{ lineHeight: 1.6 }}>{submission.discrepancy}</Text>
						</Box>
					)}

					{!!submission.changesSummary.length && (
						<Box>
							<Caption style={{ display: "block", marginBottom: 12 }}>What changed</Caption>
							<Box display="flex" flexDirection="column" gap="10">
								{submission.changesSummary.map((c, i) => (
									<Box key={i} display="flex" gap="10">
										<Caption style={{ flexShrink: 0 }}>{CHANGE_TYPE_LABEL[c.type]}</Caption>
										<Text color="fg.secondary" fontSize="md" style={{ lineHeight: 1.5 }}>{c.detail}</Text>
									</Box>
								))}
							</Box>
						</Box>
					)}

					{!!submission.brandRegressions.length && (
						<Box>
							<Caption style={{ display: "block", marginBottom: 12 }}>Flags</Caption>
							<Box display="flex" flexDirection="column" gap="12">
								{submission.brandRegressions.map((flag, i) => (
									<Box key={i} style={{ paddingLeft: 10, borderLeft: `2px solid var(--ax-colors-fg-${flag.severity === "high" ? "error" : flag.severity === "medium" ? "warning" : "tertiary"})` }}>
										<Caption fontWeight="600" style={{ display: "block", marginBottom: 3 }}>{flag.severity} · {flag.category}</Caption>
										<Text color="fg.secondary" fontSize="md" style={{ lineHeight: 1.6 }}>{flag.detail}</Text>
									</Box>
								))}
							</Box>
						</Box>
					)}

					{!!submission.clearances.length && (
						<Disclosure open={clearancesOpen} onOpenChange={setClearancesOpen}>
							<DisclosureTrigger chevronPosition="end" fontSize="sm" fontWeight="600">
								Passed checks ({submission.clearances.length})
							</DisclosureTrigger>
							<DisclosureContent>
								<Box display="flex" flexDirection="column" gap="8" pt="12">
									{submission.clearances.map((c, i) => (
										<Box key={i} alignItems="center" display="flex" gap="8">
											<IconCircleCheckSolid size={14} style={{ color: "var(--ax-colors-fg-success)", flexShrink: 0 }} />
											<Text color="fg.secondary" fontSize="md">{c}</Text>
										</Box>
									))}
								</Box>
							</DisclosureContent>
						</Disclosure>
					)}
				</Box>
			</Box>

			<Box borderT="1" borderColor="border.secondary" display="flex" gap="8" justifyContent="space-between" px="16" py="12" style={{ flexShrink: 0 }}>
				<Button appearance="danger" size="md" onClick={() => onRequestDraft("rejected")}>
					Reject
				</Button>
				<Box display="flex" gap="8">
					<Button appearance="default" size="md" onClick={() => onRequestDraft("changes")}>
						Request Changes
					</Button>
					<Button appearance="primary" size="md" onClick={() => onRequestDraft("approved")}>
						Approve
					</Button>
				</Box>
			</Box>
		</Box>
	);
}

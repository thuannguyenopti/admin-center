"use client";

import { useState, type ReactNode } from "react";
import {
	Badge,
	Box,
	Disclosure,
	DisclosureContent,
	DisclosureTrigger,
	Field,
	Textarea,
} from "@optiaxiom/react";
import { IconCheck, IconCircleCheckSolid, IconPaperPlaneTop, IconTriangleExclamation, IconXmark } from "@optimizely/axiom-icons";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { Caption } from "@/app/dam/components/Caption";
import type { Intent } from "../../data";
import type { VersionSubmission } from "../data";

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

type ActionKey = "rejected" | "changes" | "approved";

const COMPLETED_STATE: Record<ActionKey, { intent: Intent; label: string; sub: string; icon: ReactNode }> = {
	approved: { intent: "success", label: "Approved & published", sub: "New version now live in the DAM library.", icon: <IconCheck size={18} /> },
	rejected: { intent: "danger", label: "Rejected", sub: "Live asset unchanged. Submitter notified.", icon: <IconXmark size={18} /> },
	changes: { intent: "warning", label: "Changes requested", sub: "OPAL-drafted feedback sent.", icon: <IconPaperPlaneTop size={18} /> },
};

/** Version-comparison decision panel — plain-language verdict, submitter's own note, what changed, flags and the approve/reject/request-changes action bar. Purpose-built for version review rather than sharing OpalAssessmentPanel, which stays focused on Pillar 1 asset pre-screening. */
export function ChangeSummaryPanel({
	submission,
	onAction,
}: {
	submission: VersionSubmission;
	onAction: (key: string, draft?: string) => void;
}) {
	const [done, setDone] = useState<ActionKey | null>(null);
	const [draftAction, setDraftAction] = useState<ActionKey | null>(null);
	const [draftMsg, setDraftMsg] = useState("");
	const [clearancesOpen, setClearancesOpen] = useState(false);

	const status = RECOMMENDATION_STATUS[submission.recommendation];

	function openDraft(action: ActionKey, defaultMsg: string) {
		setDraftMsg(defaultMsg);
		setDraftAction(action);
	}

	function send() {
		if (!draftAction) return;
		setDone(draftAction);
		onAction(draftAction, draftMsg);
		setDraftAction(null);
	}

	if (done) {
		const cfg = COMPLETED_STATE[done];
		return (
			<Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap="16" p="32" style={{ flex: 1, textAlign: "center" }}>
				<Box
					alignItems="center"
					display="flex"
					justifyContent="center"
					style={{ width: 48, height: 48, borderRadius: "50%", background: `var(--ax-colors-bg-${cfg.intent}-subtle)`, color: `var(--ax-colors-fg-${cfg.intent})` }}
				>
					{cfg.icon}
				</Box>
				<Box display="flex" flexDirection="column" gap="4">
					<Text color="fg.default" fontWeight="600" fontSize="md">{cfg.label}</Text>
					<Text color="fg.secondary" fontSize="md">{cfg.sub}</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box display="flex" flexDirection="column" style={{ height: "100%", minHeight: 0, position: "relative" }}>
			<Box display="flex" flexDirection="column" gap="8" px="20" py="16" borderB="1" borderColor="border.secondary">
				<Box alignItems="center" display="flex" gap="8" justifyContent="space-between">
					<Badge intent={status.intent}>{status.label}</Badge>
					<Text color="fg.tertiary" fontSize="sm">{submission.confidence}% confidence</Text>
				</Box>
				<Text color="fg.secondary" fontSize="md" style={{ lineHeight: 1.6 }}>{submission.reasoning}</Text>
			</Box>

			<Box className="version-panel-scroll" style={{ flex: 1, overflowY: "auto" }}>
				<Box px="20" py="16" borderB="1" borderColor="border.secondary">
					<Text fontWeight="600" fontSize="sm" style={{ display: "block", marginBottom: 6 }}>
						What {submission.submitter.split(" ")[0]} said
					</Text>
					<Text color="fg.secondary" fontSize="md" style={{ lineHeight: 1.6, fontStyle: "italic" }}>
						&ldquo;{submission.whatChanged}&rdquo;
					</Text>
				</Box>

				{submission.discrepancy && (
					<Box px="20" py="16" borderB="1" borderColor="border.secondary" display="flex" gap="10" style={{ background: "var(--ax-colors-bg-warning-subtle)" }}>
						<IconTriangleExclamation size={16} style={{ color: "var(--ax-colors-fg-warning)", flexShrink: 0, marginTop: 2 }} />
						<Text color="fg.default" fontSize="md" style={{ lineHeight: 1.6 }}>{submission.discrepancy}</Text>
					</Box>
				)}

				{!!submission.changesSummary.length && (
					<Box px="20" py="16" borderB="1" borderColor="border.secondary">
						<Text fontWeight="600" fontSize="sm" style={{ display: "block", marginBottom: 10 }}>What changed</Text>
						<Box display="flex" flexDirection="column" gap="8">
							{submission.changesSummary.map((c, i) => (
								<Box key={i} display="flex" gap="8">
									<Caption style={{ flexShrink: 0 }}>{CHANGE_TYPE_LABEL[c.type]}</Caption>
									<Text color="fg.secondary" fontSize="md" style={{ lineHeight: 1.5 }}>{c.detail}</Text>
								</Box>
							))}
						</Box>
					</Box>
				)}

				{!!submission.brandRegressions.length && (
					<Box px="20" py="16" borderB="1" borderColor="border.secondary">
						<Text fontWeight="600" fontSize="sm" style={{ display: "block", marginBottom: 10 }}>Flags</Text>
						{submission.brandRegressions.map((flag, i) => (
							<Box key={i} mb="10" style={{ paddingLeft: 10, borderLeft: `2px solid var(--ax-colors-fg-${flag.severity === "high" ? "error" : flag.severity === "medium" ? "warning" : "tertiary"})` }}>
								<Caption fontWeight="600" style={{ display: "block", marginBottom: 3 }}>{flag.severity} · {flag.category}</Caption>
								<Text color="fg.secondary" fontSize="md" style={{ lineHeight: 1.6 }}>{flag.detail}</Text>
							</Box>
						))}
					</Box>
				)}

				{!!submission.clearances.length && (
					<Disclosure open={clearancesOpen} onOpenChange={setClearancesOpen}>
						<DisclosureTrigger chevronPosition="end" fontSize="sm" fontWeight="600" px="20" py="16">
							Passed checks ({submission.clearances.length})
						</DisclosureTrigger>
						<DisclosureContent>
							<Box display="flex" flexDirection="column" gap="8" px="20" pb="16">
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

			<Box borderT="1" borderColor="border.secondary" display="flex" gap="8" justifyContent="space-between" px="16" py="12" style={{ flexShrink: 0 }}>
				<Button appearance="danger" size="md" onClick={() => openDraft("rejected", submission.rejectDraft)}>
					Reject
				</Button>
				<Box display="flex" gap="8">
					<Button appearance="default" size="md" onClick={() => openDraft("changes", submission.changesDraft)}>
						Request Changes
					</Button>
					<Button appearance="primary" size="md" onClick={() => openDraft("approved", submission.approveNote)}>
						Approve
					</Button>
				</Box>
			</Box>

			{draftAction && (
				<Box
					shadow="lg"
					style={{
						position: "absolute",
						bottom: 0,
						left: 0,
						right: 0,
						background: "var(--ax-colors-bg-default)",
						borderTop: "1px solid var(--ax-colors-border-secondary)",
						padding: "18px 20px 16px",
						zIndex: 20,
						animation: "versionDraftIn 0.2s cubic-bezier(.2,0,.2,1)",
					}}
				>
					<style>{`@keyframes versionDraftIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>
					<Field
						info="OPAL drafted this — edit before sending."
						label={draftAction === "rejected" ? "Rejection reason" : draftAction === "changes" ? "Feedback to submitter" : "Version log note"}
					>
						<Textarea onChange={(e) => setDraftMsg(e.target.value)} rows={4} value={draftMsg} />
					</Field>
					<Box display="flex" gap="8" mt="12">
						<Button appearance="primary" size="md" onClick={send}>Send &amp; continue</Button>
						<Button appearance="default" size="md" onClick={() => setDraftAction(null)}>Cancel</Button>
					</Box>
				</Box>
			)}
		</Box>
	);
}

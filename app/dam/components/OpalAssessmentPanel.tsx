"use client";

import { Badge, Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconCircleCheckSolid } from "@optimizely/axiom-icons";
import { type ReactNode, useState } from "react";
import { Caption } from "./Caption";
import { FeedbackComposeView } from "./FeedbackComposeView";
import { OpalScoreCircle } from "./OpalScoreCircle";
import { ScoreBar, DupRiskBar } from "./OpalScoreBar";
import type { AssetItem, Intent, OpalFlag } from "../data";

export type AssessmentAction = {
	key: string;
	label: string;
	icon: ReactNode;
	appearance: "primary" | "danger" | "default";
	disabled?: boolean;
	disabledReason?: string;
	/** When set, clicking opens a full-width compose view (pre-filled, editable) instead of firing immediately. */
	requiresDraft?: boolean;
	draftDefault?: string;
	draftLabel?: string;
	draftHint?: string;
	/** Eyebrow shown above the asset name in the compose view, e.g. "Rejecting". Falls back to `label`. */
	draftEyebrow?: string;
	draftIntent?: "success" | "warning" | "danger";
};

export type AssessmentCompletedState = {
	intent: Intent;
	label: string;
	sub: string;
	icon: ReactNode;
};

const SEVERITY_BORDER = {
	high: "var(--ax-colors-fg-danger)",
	medium: "var(--ax-colors-fg-warning)",
	low: "var(--ax-colors-fg-tertiary)",
};

function FlagRow({ flag }: { flag: OpalFlag }) {
	return (
		<Box mb="10" style={{ paddingLeft: 10, borderLeft: `2px solid ${SEVERITY_BORDER[flag.severity]}` }}>
			<Caption fontWeight="600" style={{ display: "block", marginBottom: 3 }}>
				{flag.severity} · {flag.category}
			</Caption>
			<Text color="fg.secondary" fontSize="md" style={{ lineHeight: 1.6 }}>
				{flag.detail}
			</Text>
		</Box>
	);
}

/**
 * Shared OPAL verdict/change-analysis panel — used by both Pillar 1 (asset pre-screening)
 * and Pillar 3 (version change analysis). Content is fully parameterized; only the shell
 * (score, metrics, reasoning/suggestions/flags/clearances, action bar) is shared.
 */
export function OpalAssessmentPanel({
	assetImage,
	assetName,
	eyebrow,
	score,
	scoreLabel,
	status,
	statusNote,
	metrics,
	dupRisk,
	reasoning,
	suggestionsTitle = "OPAL suggests",
	suggestions,
	flags,
	clearances,
	actions,
	onAction,
	completedStates,
}: {
	assetImage?: string;
	assetName?: string;
	eyebrow: string;
	score: number;
	scoreLabel: string;
	status: { label: string; intent: Intent };
	statusNote?: string;
	metrics?: { label: string; value: number; intent: "success" | "warning" | "danger" }[];
	dupRisk?: AssetItem["duplicateRisk"];
	reasoning: string;
	suggestionsTitle?: string;
	suggestions?: string[];
	flags?: OpalFlag[];
	clearances?: string[];
	actions: AssessmentAction[];
	onAction: (key: string, draft?: string) => void;
	completedStates: Record<string, AssessmentCompletedState>;
}) {
	const [done, setDone] = useState<string | null>(null);
	const [showDrawer, setShowDrawer] = useState<AssessmentAction | null>(null);
	const [draftMsg, setDraftMsg] = useState("");

	function fire(action: AssessmentAction) {
		if (action.requiresDraft) {
			setDraftMsg(action.draftDefault ?? "");
			setShowDrawer(action);
			return;
		}
		setDone(action.key);
		onAction(action.key);
	}

	function sendDraft() {
		if (!showDrawer) return;
		setDone(showDrawer.key);
		onAction(showDrawer.key, draftMsg);
		setShowDrawer(null);
	}

	if (done) {
		const cfg = completedStates[done];
		return (
			<Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap="16" p="32" style={{ flex: 1, textAlign: "center" }}>
				<Box
					style={{
						width: 48,
						height: 48,
						borderRadius: "50%",
						background: `var(--ax-colors-bg-${cfg.intent}-subtle)`,
						color: `var(--ax-colors-fg-${cfg.intent})`,
					}}
					display="flex"
					alignItems="center"
					justifyContent="center"
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

	if (showDrawer) {
		return (
			<FeedbackComposeView
				actionLabel={showDrawer.draftEyebrow ?? showDrawer.label}
				assetImage={assetImage}
				assetName={assetName ?? eyebrow}
				fieldLabel={showDrawer.draftLabel ?? "Feedback to submitter"}
				hint={showDrawer.draftHint}
				intent={showDrawer.draftIntent}
				onCancel={() => setShowDrawer(null)}
				onChange={setDraftMsg}
				onSend={sendDraft}
				value={draftMsg}
			/>
		);
	}

	return (
		<Box display="flex" flexDirection="column" style={{ height: "100%", minHeight: 0 }}>

			{/* Score + status — a subtle intent-tinted wash gives the AI's headline verdict some
			presence instead of sitting on the same flat white as everything below it. */}
			<Box
				display="flex"
				gap="16"
				alignItems="center"
				px="20"
				py="24"
				borderB="1"
				borderColor="border.secondary"
				style={{ background: `var(--ax-colors-bg-${status.intent}-subtle)` }}
			>
				<OpalScoreCircle value={score} label={scoreLabel} />
				<Box display="flex" flexDirection="column" gap="8" style={{ flex: 1, minWidth: 0 }}>
					<Caption>{eyebrow}</Caption>
					<Badge intent={status.intent}>{status.label}</Badge>
					{statusNote && (
						<Text color="fg.tertiary" fontSize="sm" style={{ lineHeight: 1.5 }}>
							{statusNote}
						</Text>
					)}
				</Box>
			</Box>

			{/* Metrics */}
			{(metrics?.length || dupRisk) && (
				<Box display="flex" flexDirection="column" gap="12" px="20" py="16" borderB="1" borderColor="border.secondary">
					{metrics?.map((m) => (
						<ScoreBar key={m.label} label={m.label} value={m.value} intent={m.intent} />
					))}
					{dupRisk && <DupRiskBar risk={dupRisk} />}
				</Box>
			)}

			{/* Scrollable body */}
			<Box className="opal-panel-scroll" style={{ flex: 1, overflowY: "auto" }}>
				<Box px="20" py="16" borderB="1" borderColor="border.secondary">
					<Text color="fg.secondary" fontSize="md" style={{ lineHeight: 1.7 }}>
						{reasoning}
					</Text>
				</Box>

				{!!suggestions?.length && (
					<Box px="20" py="16" borderB="1" borderColor="border.secondary">
						<Caption fontWeight="600" style={{ display: "block", marginBottom: 10 }}>
							{suggestionsTitle}
						</Caption>
						{suggestions.map((s, i) => (
							<Text key={i} color="fg.secondary" fontSize="md" style={{ lineHeight: 1.6, display: "block", marginBottom: 8 }}>
								{s}
							</Text>
						))}
					</Box>
				)}

				{!!flags?.length && (
					<Box px="20" py="16" borderB="1" borderColor="border.secondary">
						<Caption fontWeight="600" style={{ display: "block", marginBottom: 10 }}>
							Flags
						</Caption>
						{flags.map((flag, i) => <FlagRow flag={flag} key={i} />)}
					</Box>
				)}

				{!!clearances?.length && (
					<Box px="20" py="16">
						<Caption fontWeight="600" style={{ display: "block", marginBottom: 10 }}>
							Clearances
						</Caption>
						<Box display="flex" flexDirection="column" gap="8">
							{clearances.map((c, i) => (
								<Box
									key={i}
									alignItems="center"
									display="flex"
									gap="10"
									px="12"
									py="10"
									rounded="md"
									style={{ background: "var(--ax-colors-bg-success-subtle)" }}
								>
									<IconCircleCheckSolid size={15} style={{ color: "var(--ax-colors-fg-success-strong)", flexShrink: 0 }} />
									<Text color="fg.default" fontSize="md" fontWeight="500">{c}</Text>
								</Box>
							))}
						</Box>
					</Box>
				)}
			</Box>

			{/* Action bar — real Axiom Buttons at their natural width, not stretched to fill the
				bar. `size="sm"` here is the dense-toolbar exception (up to 3 buttons in a 340px
				panel), not a standalone-CTA size. The destructive action sits apart from the
				constructive ones so the two kinds of decision don't read as one undifferentiated
				row of equal-weight buttons. */}
			<Box borderT="1" borderColor="border.secondary" display="flex" gap="8" justifyContent="space-between" px="16" py="12" style={{ flexShrink: 0 }}>
				<Box display="flex" gap="8">
					{actions.filter((action) => action.appearance === "danger").map((action) => (
						<Button
							key={action.key}
							appearance={action.appearance}
							disabled={action.disabled}
							onClick={() => fire(action)}
							size="sm"
							title={action.disabledReason}
						>
							{action.label}
						</Button>
					))}
				</Box>
				<Box display="flex" gap="8">
					{actions.filter((action) => action.appearance !== "danger").map((action) => (
						<Button
							key={action.key}
							appearance={action.appearance}
							disabled={action.disabled}
							onClick={() => fire(action)}
							size="sm"
							title={action.disabledReason}
						>
							{action.label}
						</Button>
					))}
				</Box>
			</Box>
		</Box>
	);
}

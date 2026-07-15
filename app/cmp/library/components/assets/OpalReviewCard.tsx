"use client";

import { useState } from "react";
import { Badge, Box, Separator } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import {
	IconChevronDown,
	IconChevronRight,
	IconCircleCheckSolid,
	IconCircleExclamation,
	IconClock,
	IconFlag,
} from "@optimizely/axiom-icons";
import type { OpalFlag, OpalFlagSeverity } from "@/app/shared/types/opal";
import { DuplicateMatchCard } from "./DuplicateMatchCard";
import type { LibraryItem } from "../../page";

/**
 * The findings list and the on-image marker overlay (AssetFocusStage) both iterate an
 * item's flags and must agree index-for-index so hovering one highlights the other. A
 * "Duplicate Risk" flag is dropped here — that fact is already fully owned by the
 * DuplicateMatchCard comparison — so both call sites filter through this one function
 * rather than risk drifting out of sync with two separate filters.
 */
export function visibleOpalFlags(item: LibraryItem): OpalFlag[] {
	return (item.opalFlags ?? []).filter((flag) => flag.category !== "Duplicate Risk");
}

export type ScoreIntent = "success" | "warning" | "error";

export function scoreIntent(score: number): ScoreIntent {
	return score >= 80 ? "success" : score >= 50 ? "warning" : "error";
}

export function confidenceLevelLabel(level: LibraryItem["opalConfidenceLevel"]) {
	const resolved = level ?? "high";
	return resolved.charAt(0).toUpperCase() + resolved.slice(1);
}

export const STATUS_BADGE = {
	cleared: { label: "Cleared", intent: "success" as const },
	flagged: { label: "Flagged", intent: "warning" as const },
	pending: { label: "Pending review", intent: "warning" as const },
	processing: { label: "Processing", intent: "information" as const },
	rejected: { label: "Rejected", intent: "danger" as const },
	"changes-requested": { label: "Changes requested", intent: "warning" as const },
};

export const SEVERITY_META: Record<OpalFlagSeverity, { label: string; intent: "danger" | "warning" | "neutral"; variant: "strong" | "subtle" }> = {
	high: { label: "Major", intent: "danger", variant: "subtle" },
	medium: { label: "Moderate", intent: "warning", variant: "subtle" },
	low: { label: "Minor", intent: "neutral", variant: "subtle" },
};

const SEVERITY_LABEL_PLURAL: Record<OpalFlagSeverity, string> = {
	high: "major",
	medium: "moderate",
	low: "minor",
};

/** Badge `intent` names don't all match the raw `--ax-colors-*` CSS variable family names (`danger` → `error`, `neutral` → `secondary`, no `-subtle` suffix) — this resolves the pair actually used for marker/icon backgrounds. */
function markerColors(intent: "danger" | "warning" | "neutral") {
	if (intent === "neutral") {
		return { bg: "var(--ax-colors-bg-secondary)", fg: "var(--ax-colors-fg-secondary)" };
	}
	const family = intent === "danger" ? "error" : intent;
	return { bg: `var(--ax-colors-bg-${family}-subtle)`, fg: `var(--ax-colors-fg-${family})` };
}

export function summarizeSeverity(flags: OpalFlag[]) {
	const counts: Record<OpalFlagSeverity, number> = { high: 0, medium: 0, low: 0 };
	flags.forEach((flag) => { counts[flag.severity] += 1; });
	return (["high", "medium", "low"] as const)
		.filter((severity) => counts[severity] > 0)
		.map((severity) => `${counts[severity]} ${SEVERITY_LABEL_PLURAL[severity]}`)
		.join(" · ");
}

/** Small numbered circle — reused both as an absolutely-positioned marker over the asset preview (in AssetFocusStage) and inline at the start of each finding row, so the two stay visually linked. */
export function MarkerBadge({ index, intent, active, size = 22 }: { index: number; intent: "danger" | "warning" | "neutral"; active?: boolean; size?: number }) {
	const colors = markerColors(intent);
	return (
		<Box
			alignItems="center"
			display="flex"
			justifyContent="center"
			rounded="full"
			style={{
				background: colors.bg,
				boxShadow: active ? "0 0 0 4px rgba(255,255,255,0.9), 0 2px 10px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.15)",
				color: colors.fg,
				flexShrink: 0,
				fontSize: 12,
				fontWeight: 700,
				height: size,
				transform: active ? "scale(1.15)" : "scale(1)",
				transition: "transform 0.15s ease, box-shadow 0.15s ease",
				width: size,
			}}
		>
			{index}
		</Box>
	);
}

function IssueRow({
	flag,
	index,
	isActive,
	onHover,
}: {
	flag: OpalFlag;
	index: number;
	isActive: boolean;
	onHover: (index: number | null) => void;
}) {
	const [expanded, setExpanded] = useState(false);
	const meta = SEVERITY_META[flag.severity];
	const severityColor = meta.intent === "neutral" ? "fg.tertiary" : meta.intent === "danger" ? "fg.error" : "fg.warning";

	return (
		<Box
			py="12"
			role="button"
			tabIndex={0}
			style={{ background: isActive ? "var(--ax-colors-bg-secondary)" : undefined, cursor: "pointer", transition: "background 0.15s" }}
			onClick={() => setExpanded((v) => !v)}
			onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded((v) => !v); } }}
			onMouseEnter={() => onHover(index)}
			onMouseLeave={() => onHover(null)}
		>
			<Box alignItems="center" display="flex" gap="10">
				<MarkerBadge index={index + 1} intent={meta.intent} />
				<Box style={{ flex: 1, minWidth: 0 }}>
					<Box alignItems="center" display="flex" gap="8" justifyContent="space-between">
						<Text color="fg.default" fontSize="md" fontWeight="600">{flag.category}</Text>
						<Text color={severityColor} fontSize="sm" fontWeight="600" style={{ flexShrink: 0 }}>{meta.label}</Text>
					</Box>
					<Box alignItems="center" display="flex" gap="6" justifyContent="space-between">
						<Text color="fg.secondary" fontSize="sm" style={{ flex: 1, minWidth: 0 }}>{flag.detail}</Text>
						{expanded
							? <IconChevronDown size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
							: <IconChevronRight size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />}
					</Box>
					{expanded && flag.fix && (
						<Text color="fg.default" fontSize="sm" fontWeight="500" style={{ display: "block", marginTop: 6 }}>
							Recommended: {flag.fix}
						</Text>
					)}
				</Box>
			</Box>
		</Box>
	);
}

/** OPAL findings panel — compact confidence summary and the findings list. The asset preview with issue markers lives in AssetFocusStage; activeIndex is lifted to AssetFocusViewer so stage markers and these rows cross-highlight each other. */
export function OpalFindingsPanel({
	item,
	activeIndex,
	onHoverIndex,
}: {
	item: LibraryItem;
	activeIndex: number | null;
	onHoverIndex: (index: number | null) => void;
}) {
	const status = item.opalStatus ?? "cleared";
	const confidence = item.opalConfidence ?? 90;
	const confidenceLevel = confidenceLevelLabel(item.opalConfidenceLevel);
	const visibleFlags = visibleOpalFlags(item);
	const intent = scoreIntent(confidence);
	const badge = STATUS_BADGE[status];
	const complianceLine = `Brand compliance ${confidence}/100 · ${confidenceLevel} confidence`;

	const isProcessing = status === "processing";
	const isCleared = status === "cleared" && visibleFlags.length === 0;

	let SummaryIcon = IconCircleExclamation;
	let summaryIconColor = `var(--ax-colors-fg-${intent})`;
	let summaryHeadline = "Awaiting review";
	let summarySub = `No automated flags yet · ${complianceLine}`;
	if (visibleFlags.length > 0) {
		summaryHeadline = `${visibleFlags.length} brand issue${visibleFlags.length === 1 ? "" : "s"} found`;
		summarySub = `${summarizeSeverity(visibleFlags)} · ${complianceLine}`;
	} else if (isCleared) {
		SummaryIcon = IconCircleCheckSolid;
		summaryIconColor = "var(--ax-colors-fg-success)";
		summaryHeadline = "No brand issues found";
		summarySub = `Passed automated brand review · ${complianceLine}`;
	} else if (isProcessing) {
		SummaryIcon = IconClock;
		summaryIconColor = "var(--ax-colors-fg-tertiary)";
		summaryHeadline = "Scan in progress";
		summarySub = "Results will appear when the scan completes";
	} else if (item.duplicateOf) {
		// Flagged status here comes solely from the duplicate above — say so plainly
		// rather than showing a disconnected empty "no flags" state next to it.
		summaryHeadline = "Resolve the duplicate above to continue";
		summarySub = `No other brand issues found · ${complianceLine}`;
	}

	return (
		<Box display="flex" flexDirection="column" gap="16">
			<Separator />

			<Box display="flex" flexDirection="column" gap="4">
				<Box alignItems="center" display="flex" gap="8">
					<SummaryIcon size={18} style={{ color: summaryIconColor, flexShrink: 0 }} />
					<Text color="fg.default" fontSize="lg" fontWeight="600" style={{ flex: 1, minWidth: 0 }}>{summaryHeadline}</Text>
					<Badge alignItems="center" gap="4" intent={badge.intent} style={{ flexShrink: 0 }}>
						{status === "flagged" && <IconFlag size={11} />}
						{badge.label}
					</Badge>
				</Box>
				<Text color="fg.secondary" fontSize="sm">{summarySub}</Text>
			</Box>

			{item.duplicateOf && <DuplicateMatchCard current={item} match={item.duplicateOf} />}

			{visibleFlags.length > 0 && (
				<Box>
					<Text color="fg.default" fontSize="md" fontWeight="600" style={{ display: "block", marginBottom: 4 }}>Findings</Text>
					{visibleFlags.map((flag, i) => (
						<Box key={i}>
							{i > 0 && <Separator />}
							<IssueRow flag={flag} index={i} isActive={activeIndex === i} onHover={onHoverIndex} />
						</Box>
					))}
				</Box>
			)}
		</Box>
	);
}

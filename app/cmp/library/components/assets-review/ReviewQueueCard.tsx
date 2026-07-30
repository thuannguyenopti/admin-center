"use client";

import { Badge, Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { STATUS_BADGE, scoreIntent, summarizeSeverity } from "../assets/OpalReviewCard";
import { reviewStatus } from "./ReviewQueueView";
import type { LibraryItem } from "../../page";

/** Card-view tile for the Assets Review queue — thumbnail, OPAL status, brand compliance, and a Review action that opens the shared AssetFocusViewer. */
export function ReviewQueueCard({ item, onReview }: { item: LibraryItem; onReview: () => void }) {
	const status = reviewStatus(item);
	const badge = STATUS_BADGE[status];
	const flags = item.opalFlags ?? [];
	const confidence = item.opalConfidence;
	const intent = confidence !== undefined ? scoreIntent(confidence) : "warning";
	const isProcessing = status === "processing";

	return (
		<Box border="1" borderColor="border.tertiary" display="flex" flexDirection="column" overflow="hidden" rounded="lg">
			<Box style={{ background: item.bgColor ?? "var(--ax-colors-bg-secondary)", height: 140, position: "relative" }}>
				{item.image && (
					<img alt={item.title} src={item.image} style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }} />
				)}
				<Badge intent={badge.intent} style={{ left: 8, position: "absolute", top: 8 }}>{badge.label}</Badge>
			</Box>
			<Box display="flex" flexDirection="column" gap="8" p="12" style={{ flex: 1 }}>
				<Text
					color="fg.default"
					fontSize="md"
					fontWeight="600"
					style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
				>
					{item.title}
				</Text>
				{(item.submittedBy || item.pendingVersion) && (
					<Text color="fg.tertiary" fontSize="sm">
						Submitted by {item.submittedBy ?? item.pendingVersion?.submitter}
						{(item.submittedAt ?? item.pendingVersion?.submittedAt) ? ` · ${item.submittedAt ?? item.pendingVersion?.submittedAt}` : ""}
					</Text>
				)}

				{isProcessing ? (
					<Text color="fg.secondary" fontSize="sm">Analyzing…</Text>
				) : (
					<>
						<Text color="fg.secondary" fontSize="sm">
							{flags.length > 0
								? `${flags.length} issue${flags.length === 1 ? "" : "s"} · ${summarizeSeverity(flags)}`
								: item.pendingVersion && !item.opalStatus
									? item.pendingVersion.versionLabel
									: "No issues found"}
						</Text>
						{confidence !== undefined && (
							<Box alignItems="center" display="flex" gap="8">
								<Text color="fg.default" fontSize="sm" fontWeight="600" style={{ flexShrink: 0 }}>{confidence}/100</Text>
								<Box style={{ background: "var(--ax-colors-bg-secondary)", borderRadius: 999, flex: 1, height: 6, overflow: "hidden" }}>
									<Box style={{ background: `var(--ax-colors-fg-${intent})`, borderRadius: 999, height: "100%", width: `${confidence}%` }} />
								</Box>
							</Box>
						)}
					</>
				)}

				<Button appearance="default" disabled={isProcessing} size="md" style={{ alignSelf: "flex-start", marginTop: 4 }} onClick={onReview}>
					{isProcessing ? "Processing…" : "Review"}
				</Button>
			</Box>
		</Box>
	);
}

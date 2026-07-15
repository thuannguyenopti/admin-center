"use client";

import { Badge, Box } from "@optiaxiom/react";
import { Table, Td, Th, Tr } from "@/app/components/Table";
import { Text } from "@/app/components/Text";
import { STATUS_BADGE, confidenceLevelLabel, scoreIntent, summarizeSeverity } from "../assets/OpalReviewCard";
import { reviewStatus } from "./ReviewQueueView";
import type { LibraryItem } from "../../page";

/** Table-view row for the Assets Review queue — denser than the card view, for bulk triage. Row click opens the shared AssetFocusViewer. */
export function ReviewQueueTable({ items, onReview }: { items: LibraryItem[]; onReview: (item: LibraryItem) => void }) {
	return (
		<Table>
			<thead>
				<Tr>
					<Th>Asset</Th>
					<Th>Status</Th>
					<Th>Issues</Th>
					<Th>Brand compliance</Th>
					<Th>AI confidence</Th>
					<Th>Submitted by</Th>
				</Tr>
			</thead>
			<tbody>
				{items.map((item) => {
					const status = reviewStatus(item);
					const badge = STATUS_BADGE[status];
					const flags = item.opalFlags ?? [];
					const confidence = item.opalConfidence;
					const intent = confidence !== undefined ? scoreIntent(confidence) : "warning";

					return (
						<Tr key={item.id} onClick={() => onReview(item)}>
							<Td style={{ verticalAlign: "middle" }}>
								<Box alignItems="center" display="flex" gap="10">
									<Box
										rounded="sm"
										style={{ background: item.bgColor ?? "var(--ax-colors-bg-secondary)", flexShrink: 0, height: 32, overflow: "hidden", width: 32 }}
									>
										{item.image && (
											<img alt="" src={item.image} style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }} />
										)}
									</Box>
									<Text color="fg.default" fontSize="md" fontWeight="500">{item.title}</Text>
								</Box>
							</Td>
							<Td style={{ verticalAlign: "middle" }}><Badge intent={badge.intent}>{badge.label}</Badge></Td>
							<Td style={{ verticalAlign: "middle" }}>
								{status === "processing" ? (
									<Text color="fg.tertiary" fontSize="sm">Analyzing…</Text>
								) : flags.length > 0 ? (
									<Text color="fg.secondary" fontSize="sm">{flags.length} · {summarizeSeverity(flags)}</Text>
								) : (
									<Text color="fg.secondary" fontSize="sm">No issues</Text>
								)}
							</Td>
							<Td style={{ verticalAlign: "middle" }}>
								{confidence !== undefined ? (
									<Box alignItems="center" display="flex" gap="8">
										<Text color="fg.default" fontSize="sm" fontWeight="600">{confidence}/100</Text>
										<Box style={{ background: "var(--ax-colors-bg-secondary)", borderRadius: 999, height: 6, overflow: "hidden", width: 60 }}>
											<Box style={{ background: `var(--ax-colors-fg-${intent})`, borderRadius: 999, height: "100%", width: `${confidence}%` }} />
										</Box>
									</Box>
								) : (
									<Text color="fg.tertiary" fontSize="sm">—</Text>
								)}
							</Td>
							<Td style={{ verticalAlign: "middle" }}>
								<Text color="fg.secondary" fontSize="sm">
									{status === "processing" ? "—" : confidenceLevelLabel(item.opalConfidenceLevel)}
								</Text>
							</Td>
							<Td style={{ verticalAlign: "middle" }}>
								<Text color="fg.secondary" fontSize="sm">
									{item.submittedBy ?? item.pendingVersion?.submitter ?? "—"}{(item.submittedAt ?? item.pendingVersion?.submittedAt) ? ` · ${item.submittedAt ?? item.pendingVersion?.submittedAt}` : ""}
								</Text>
							</Td>
						</Tr>
					);
				})}
			</tbody>
		</Table>
	);
}

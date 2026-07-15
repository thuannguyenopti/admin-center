"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Box, Button as AxiomButton, Pagination, SegmentedControl, SegmentedControlItem } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { getAllDecisionEvents, getLatestDecision, subscribeDecisions } from "../../auditTrail";
import { ReviewQueueCard } from "./ReviewQueueCard";
import { ReviewQueueTable } from "./ReviewQueueTable";
import type { LibraryItem } from "../../page";

type StatusFilter = "all" | "needs-attention" | "pending" | "flagged" | "processing" | "rejected" | "changes-requested";
type ViewMode = "cards" | "table";

const PAGE_SIZE = 20;

const FILTERS: Array<{ label: string; value: StatusFilter }> = [
	{ label: "All", value: "all" },
	{ label: "Needs attention", value: "needs-attention" },
	{ label: "Processing", value: "processing" },
	{ label: "Rejected", value: "rejected" },
	{ label: "Changes requested", value: "changes-requested" },
];

// A pending edit submission needs a decision just as much as an OPAL flag does, so an
// approved asset with a pendingVersion is treated as "pending" here even though its own
// opalStatus is unset — that's what keeps it out of Assets Approved (see page.tsx) and
// gives it a home in the queue instead of leaving it unreachable from either tab.
//
// A recorded reject/changes-requested decision takes priority over the raw opalStatus:
// nothing about the underlying LibraryItem ever changes when a decision is made (it's a
// plain mock array, never mutated), so without this the item would stay "flagged"/"pending"
// forever, indistinguishable from one nobody has looked at. Checking the audit trail first
// is what makes "reject" actually remove the item from the active queue without deleting it
// from the library — it just becomes reachable only via the Rejected/Changes requested/All
// filters instead of Needs attention.
export function reviewStatus(item: LibraryItem): NonNullable<LibraryItem["opalStatus"]> | "cleared" | "rejected" | "changes-requested" {
	const decision = getLatestDecision(item.id);
	if (decision === "rejected") return "rejected";
	if (decision === "changes-requested") return "changes-requested";
	if (item.opalStatus) return item.opalStatus;
	return item.pendingVersion ? "pending" : "cleared";
}

function matchesFilter(item: LibraryItem, filter: StatusFilter) {
	const status = reviewStatus(item);
	switch (filter) {
		case "all": return true;
		case "needs-attention": return status === "pending" || status === "flagged";
		default: return status === filter;
	}
}

function StatCard({
	label,
	count,
	intent,
	active,
	onClick,
}: {
	label: string;
	count: number;
	intent: "warning" | "danger" | "information";
	active: boolean;
	onClick: () => void;
}) {
	// Badge/Text `intent` names don't all match the raw `--ax-colors-*` CSS variable
	// family names (`danger` → `error`) — same mapping used in OpalReviewCard.
	const family = intent === "danger" ? "error" : intent;

	return (
		<Box
			role="button"
			tabIndex={0}
			display="flex"
			flexDirection="column"
			gap="4"
			p="16"
			rounded="lg"
			style={{
				background: active ? `var(--ax-colors-bg-${family}-subtle)` : "var(--ax-colors-bg-default)",
				border: `1px solid ${active ? `var(--ax-colors-fg-${family})` : "var(--ax-colors-border-tertiary)"}`,
				cursor: "pointer",
			}}
			onClick={onClick}
			onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
		>
			<Text color="fg.default" fontSize="2xl" fontWeight="700">{count}</Text>
			<Text color="fg.secondary" fontSize="sm">{label}</Text>
		</Box>
	);
}

/** Main content of the Assets Review tab's "Review Queue" view — items still awaiting an OPAL decision. Cleared items can never appear here (they live exclusively in Assets Approved), so there's no "Cleared" stat or filter. */
export function ReviewQueueView({ items, onOpenItem }: { items: LibraryItem[]; onOpenItem: (item: LibraryItem) => void }) {
	// Subscribes this component to the audit trail so recording a decision elsewhere (the
	// asset viewer, closed and returned from) re-renders the queue with the item's new
	// effective status — reviewStatus() itself is a plain synchronous read, not a hook, so
	// this is the one place that needs to establish reactivity.
	useSyncExternalStore(subscribeDecisions, getAllDecisionEvents, getAllDecisionEvents);
	const [filter, setFilter] = useState<StatusFilter>("needs-attention");
	const [view, setView] = useState<ViewMode>("cards");
	const [currentPage, setCurrentPage] = useState(1);

	const counts = useMemo(() => ({
		pending: items.filter((item) => reviewStatus(item) === "pending").length,
		flagged: items.filter((item) => reviewStatus(item) === "flagged").length,
		processing: items.filter((item) => reviewStatus(item) === "processing").length,
	}), [items]);

	const filteredItems = useMemo(
		() => items.filter((item) => matchesFilter(item, filter)),
		[items, filter],
	);

	const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
	const paginatedItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

	useEffect(() => {
		setCurrentPage(1);
	}, [filteredItems]);

	return (
		<Box display="flex" flexDirection="column" gap="20">
			<Box display="grid" gap="12" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
				<StatCard active={filter === "pending"} count={counts.pending} intent="warning" label="Pending" onClick={() => setFilter("pending")} />
				<StatCard active={filter === "flagged"} count={counts.flagged} intent="danger" label="Flagged" onClick={() => setFilter("flagged")} />
				<StatCard active={filter === "processing"} count={counts.processing} intent="information" label="Processing" onClick={() => setFilter("processing")} />
			</Box>

			<Box alignItems="center" display="flex" gap="16" justifyContent="space-between">
				<Box display="flex" gap="4">
					{FILTERS.map((f) => (
						<AxiomButton
							key={f.value}
							appearance="default"
							size="md"
							style={filter === f.value ? { background: "var(--ax-colors-bg-default-pressed)" } : undefined}
							onClick={() => setFilter(f.value)}
						>
							{f.label}
						</AxiomButton>
					))}
				</Box>
				<SegmentedControl value={view} onValueChange={(value: string) => setView(value as ViewMode)}>
					<SegmentedControlItem value="cards">Cards</SegmentedControlItem>
					<SegmentedControlItem value="table">Table</SegmentedControlItem>
				</SegmentedControl>
			</Box>

			{filteredItems.length === 0 ? (
				<Box alignItems="center" bg="bg.secondary" display="flex" justifyContent="center" p="48" rounded="lg">
					<Text color="fg.secondary" fontSize="md">No assets match this filter.</Text>
				</Box>
			) : view === "cards" ? (
				<Box display="grid" gap="16" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
					{paginatedItems.map((item) => (
						<ReviewQueueCard item={item} key={item.id} onReview={() => onOpenItem(item)} />
					))}
				</Box>
			) : (
				<ReviewQueueTable items={paginatedItems} onReview={onOpenItem} />
			)}

			{totalPages > 1 && (
				<Box display="flex" justifyContent="center">
					<Pagination page={currentPage} total={totalPages} onPageChange={setCurrentPage} />
				</Box>
			)}
		</Box>
	);
}

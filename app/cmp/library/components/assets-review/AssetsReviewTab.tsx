"use client";

import { useState } from "react";
import { Box, SegmentedControl, SegmentedControlItem } from "@optiaxiom/react";
import { DropZonesView } from "./DropZonesView";
import { ReviewQueueView } from "./ReviewQueueView";
import type { LibraryItem } from "../../page";

type ReviewView = "queue" | "drop-zones";

/** Content of the "Assets Review" tab — Review Queue and Drop Zones, switched via SegmentedControl. Pending-version edits surface inside Review Queue itself (an item's detail panel shows its pending version under Version History) rather than a separate queue — a dedicated "Edit Submissions" tab was tried and removed for feeling redundant with Review Queue. */
export function AssetsReviewTab({ items, onOpenItem }: { items: LibraryItem[]; onOpenItem: (item: LibraryItem) => void }) {
	const [view, setView] = useState<ReviewView>("queue");

	return (
		<Box display="flex" flexDirection="column" gap="20">
			<SegmentedControl value={view} onValueChange={(value: string) => setView(value as ReviewView)}>
				<SegmentedControlItem value="queue">Review Queue</SegmentedControlItem>
				<SegmentedControlItem value="drop-zones">Drop Zones</SegmentedControlItem>
			</SegmentedControl>
			{view === "queue" && <ReviewQueueView items={items} onOpenItem={onOpenItem} />}
			{view === "drop-zones" && <DropZonesView />}
		</Box>
	);
}

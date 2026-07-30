"use client";

import { useState } from "react";
import { Avatar, AvatarGroup, Badge, Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconEye, IconStar } from "@optimizely/axiom-icons";
import { AccordionRow } from "./AccordionRow";
import { OpalFindingsPanel } from "./OpalReviewCard";
import { PendingVersionBanner } from "./PendingVersionBanner";
import type { LibraryItem } from "../../page";

const WATCHERS = ["Wanda Maximoff", "David Steinberg", "Maya Chen"];

/**
 * Metadata panel for the asset focus view — docked flush next to AssetFocusStage in the
 * same row (no shadow, no floating margin), matching Figma's "Detail view" panel exactly:
 * divider, identity row, social row, then 7 disclosure sections with Tags open by default.
 * OPAL findings and the pending-version banner are additive content with no Figma
 * equivalent — they only ever render for Assets Review items (see page.tsx routing), never
 * for a plain approved asset, so they never contradict the reference.
 */
export function AssetFocusPanel({
	item,
	activeMarkerIndex,
	onHoverMarker,
	onReviewChanges,
}: {
	item: LibraryItem;
	activeMarkerIndex: number | null;
	onHoverMarker: (index: number | null) => void;
	onReviewChanges: () => void;
}) {
	const [favorited, setFavorited] = useState(false);
	const [watching, setWatching] = useState(true);
	// A plain "cleared" verdict doesn't change any decision once an asset is already
	// approved, and re-showing it there would violate the same "no review chrome outside
	// Review" rule that pendingVersion is routed around — so this only renders for the
	// three statuses that mean "still needs a decision," which (thanks to the Assets
	// Approved/Review routing in page.tsx) only ever occur for Assets Review items anyway.
	const showOpalReview = item.opalStatus === "flagged" || item.opalStatus === "pending" || item.opalStatus === "processing";

	return (
		<Box bg="bg.default" display="flex" flexDirection="column" rounded="lg" style={{ overflow: "hidden", width: 360, flexShrink: 0 }}>
			<Box display="flex" flexDirection="column" gap="24" p="16" style={{ flex: 1, overflowY: "auto" }}>
				<Box display="flex" flexDirection="column" gap="4">
					<Box alignItems="center" display="flex" gap="8">
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconStar color={favorited ? "var(--ax-colors-fg-warning)" : undefined} size={16} />}
							aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
							onClick={() => setFavorited((v) => !v)}
						/>
						<Text color="fg.default" fontSize="lg" fontWeight="600">{item.title}</Text>
					</Box>
					<Text color="fg.tertiary" fontSize="sm">Original Image (Jul 10, 2026)</Text>
				</Box>

				<Box alignItems="center" display="flex" justifyContent="space-between">
					<AvatarGroup size="xs">
						{WATCHERS.map((name) => <Avatar key={name} name={name} size="xs" />)}
					</AvatarGroup>
					<Button
						appearance="subtle"
						icon={<IconEye size={14} />}
						iconPosition="start"
						size="sm"
						onClick={() => setWatching((v) => !v)}
					>
						{watching ? WATCHERS.length : WATCHERS.length - 1} watching
					</Button>
				</Box>

				{showOpalReview && (
					<OpalFindingsPanel activeIndex={activeMarkerIndex} item={item} onHoverIndex={onHoverMarker} />
				)}

				{item.pendingVersion && (
					<PendingVersionBanner onReviewChanges={onReviewChanges} pendingVersion={item.pendingVersion} showStatusBadge={!showOpalReview} />
				)}

				<Box display="flex" flexDirection="column" gap="4">
					<AccordionRow title="Image Information">
						<Box display="flex" flexDirection="column" gap="6">
							<Text color="fg.secondary" fontSize="sm">Format: {item.label}</Text>
							<Text color="fg.secondary" fontSize="sm">Dimensions: 2400 × 1600px</Text>
							<Text color="fg.secondary" fontSize="sm">File size: 4.2 MB</Text>
						</Box>
					</AccordionRow>

					<AccordionRow title="Related Assets">
						<Text color="fg.secondary" fontSize="sm">No related assets linked yet.</Text>
					</AccordionRow>

					<AccordionRow title="Fields">
						<Box display="flex" flexDirection="column" gap="6">
							<Text color="fg.secondary" fontSize="sm">Attribution — Stride Media Team</Text>
							<Text color="fg.secondary" fontSize="sm">Alt text — Not set</Text>
						</Box>
					</AccordionRow>

					<AccordionRow title="Facial Recognition">
						<Text color="fg.secondary" fontSize="sm">No people tagged in this asset yet.</Text>
					</AccordionRow>

					<AccordionRow title="Tags" defaultOpen>
						<Box display="flex" gap="6" style={{ flexWrap: "wrap" }}>
							<Badge intent="neutral">stride</Badge>
							<Badge intent="neutral">{item.type}</Badge>
						</Box>
					</AccordionRow>

					<AccordionRow title="Usage">
						<Text color="fg.secondary" fontSize="sm">Used in 2 campaigns.</Text>
					</AccordionRow>

					<AccordionRow title="Destinations">
						<Text color="fg.secondary" fontSize="sm">Not published to any destination.</Text>
					</AccordionRow>
				</Box>
			</Box>
		</Box>
	);
}

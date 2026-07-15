"use client";

import { useState } from "react";
import { Badge, Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconFile, IconFileImage, IconFolder } from "@optimizely/axiom-icons";
import type { LibraryItem } from "../../page";

const ROW_HEIGHT = 180;
const DEFAULT_ASPECT = 1.4;

const BADGE_INTENT: Record<string, "success" | "information" | "warning" | "neutral"> = {
	JPG: "success",
	PNG: "success",
	TIFF: "success",
	Folder: "information",
	Word: "information",
	File: "information",
	"Structured Content": "information",
	Article: "information",
	PDF: "warning",
	MSG: "neutral",
	ZIP: "neutral",
};

/**
 * Masonry (justified-row) card — width follows the source image's real aspect ratio at a
 * fixed row height, matching Figma's variable-width media cards. Approximates a true
 * justified-gallery layout via flex-wrap rather than stretching each row to fill the
 * container exactly — a reasonable simplification of that packing algorithm, not a
 * structural difference from the reference (same card anatomy, same variable widths).
 */
function MasonryCard({ item, onOpen }: { item: LibraryItem; onOpen: () => void }) {
	const [aspect, setAspect] = useState(DEFAULT_ASPECT);
	const isFolder = item.type === "folder";
	const hasImage = item.type === "image" && !!item.image;
	const width = Math.round(ROW_HEIGHT * aspect);
	const badgeIntent = BADGE_INTENT[item.label] ?? "neutral";

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			overflow="hidden"
			rounded="lg"
			role="button"
			tabIndex={0}
			style={{ cursor: "pointer", height: ROW_HEIGHT, width }}
			onClick={onOpen}
			onKeyDown={(e) => { if (e.key === "Enter") onOpen(); }}
		>
			<Box style={{ flex: 1, minHeight: 0, position: "relative" }}>
				{hasImage ? (
					<img
						alt={item.title}
						src={item.image}
						style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
						onLoad={(e) => {
							const img = e.currentTarget;
							if (img.naturalWidth && img.naturalHeight) setAspect(img.naturalWidth / img.naturalHeight);
						}}
					/>
				) : isFolder ? (
					<Box alignItems="center" display="flex" justifyContent="center" style={{ background: "#6B7280", height: "100%", width: "100%" }}>
						<IconFolder color="rgba(255,255,255,0.8)" size={32} strokeWidth={1.5} />
					</Box>
				) : (
					<Box alignItems="center" display="flex" justifyContent="center" style={{ background: item.bgColor ?? "#6B7280", height: "100%", width: "100%" }}>
						<IconFile color="rgba(255,255,255,0.85)" size={32} strokeWidth={1.5} />
					</Box>
				)}
			</Box>
			<Box display="flex" flexDirection="column" gap="6" px="10" py="8" style={{ flexShrink: 0 }}>
				<Box alignItems="center" display="flex" gap="6" justifyContent="space-between">
					<Badge intent={badgeIntent}>{item.label}</Badge>
					<IconFileImage color="var(--ax-colors-fg-tertiary)" size={13} style={{ flexShrink: 0 }} />
				</Box>
				<Text fontSize="sm" fontWeight="500" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
					{item.title}
				</Text>
			</Box>
		</Box>
	);
}

export function MasonryGrid({ items, onOpen }: { items: LibraryItem[]; onOpen: (item: LibraryItem) => void }) {
	return (
		<Box display="flex" gap="16" style={{ flexWrap: "wrap" }}>
			{items.map((item) => <MasonryCard key={item.id} item={item} onOpen={() => onOpen(item)} />)}
		</Box>
	);
}

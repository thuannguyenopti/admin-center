"use client";

import { Box, Tooltip } from "@optiaxiom/react";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import type { SearchAssetItem } from "../../types";
import { AssetTooltipContent } from "../shared/AssetTooltipContent";
import { AssetBadge, ScoreBadge } from "../shared/AssetBadges";

type SearchAssetCardProps = {
	asset: SearchAssetItem;
	height: number;
	onClick: () => void;
	onToggleSelect: () => void;
	showTooltip?: boolean;
	width?: number | string;
};

export function SearchAssetCard({
	asset,
	height,
	onClick,
	onToggleSelect,
	showTooltip = false,
	width,
}: SearchAssetCardProps) {
	const [isHovered, setIsHovered] = useState(false);
	const card = (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			onClick={onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			overflow="hidden"
			rounded="lg"
			style={{
				cursor: "pointer",
				height,
				position: "relative",
				width: width ?? "100%",
			}}
		>
			{"thumbnailSrc" in asset && asset.thumbnailSrc && (
				<img
					alt={asset.title}
					src={asset.thumbnailSrc}
					style={{ height: "100%", inset: 0, objectFit: "cover", position: "absolute", width: "100%" }}
				/>
			)}
			<img
				alt={asset.title}
				src={asset.src}
				style={{ height: "100%", inset: 0, objectFit: "cover", position: "absolute", width: "100%" }}
			/>
			<button
				aria-label={asset.selected ? `Deselect ${asset.title}` : `Select ${asset.title}`}
				onClick={(event) => {
					event.stopPropagation();
					onToggleSelect();
				}}
				style={{
					alignItems: "center",
					background: asset.selected ? "var(--ax-colors-bg-accent)" : "var(--ax-colors-bg-default)",
					border: asset.selected ? "none" : "1px solid var(--ax-colors-border-control)",
					borderRadius: 4,
					boxShadow: asset.selected ? "0 0 0 1px rgba(0,0,0,0.02)" : "0 1px 2px rgba(16,24,40,0.12)",
					cursor: "pointer",
					display: "flex",
					height: 18,
					justifyContent: "center",
					opacity: isHovered || asset.selected ? 1 : 0,
					padding: 0,
					pointerEvents: isHovered || asset.selected ? "auto" : "none",
					position: "absolute",
					right: 16,
					top: 16,
					transition: "opacity 120ms ease",
					width: 18,
					zIndex: 1,
				}}
				type="button"
			>
				{asset.selected && <IconCheck color="white" size={11} stroke={3} />}
			</button>
			<Box alignItems="center" display="flex" gap="8" style={{ bottom: 16, left: 16, position: "absolute" }}>
				<AssetBadge kind={asset.label} label={asset.label} />
				<ScoreBadge score={asset.match} />
			</Box>
		</Box>
	);

	if (!showTooltip) {
		return card;
	}

	return (
		<Tooltip align="start" content={<AssetTooltipContent asset={asset} />} side="top">
			{card}
		</Tooltip>
	);
}

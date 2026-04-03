"use client";

import { Box, Tooltip } from "@optiaxiom/react";
import { IconCheck } from "@tabler/icons-react";
import type { AssetItem } from "../../types";
import { AssetTooltipContent } from "../shared/AssetTooltipContent";
import { AssetBadge, ScoreBadge } from "../shared/AssetBadges";
import { useState } from "react";

type PanelAssetCardProps = {
	asset: AssetItem;
	onToggleSelect: () => void;
	span: 4 | 6;
};

export function PanelAssetCard({ asset, onToggleSelect, span }: PanelAssetCardProps) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="8"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={{
				gridColumn: `span ${span}`,
				position: "relative",
			}}
		>
			<Tooltip align="start" content={<AssetTooltipContent asset={asset} />} side="top">
				<Box
					rounded="lg"
					style={{
						background: `url(${asset.src}) center / cover`,
						height: 116,
						position: "relative",
					}}
				>
					<button
						aria-label={asset.selected ? `Deselect ${asset.title}` : `Select ${asset.title}`}
						onClick={onToggleSelect}
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
							right: 8,
							top: 8,
							transition: "opacity 120ms ease",
							width: 18,
							zIndex: 1,
						}}
						type="button"
					>
						{asset.selected && <IconCheck color="white" size={12} stroke={3} />}
					</button>
					<Box alignItems="center" display="flex" gap="8" style={{ bottom: 8, left: 8, position: "absolute" }}>
						<AssetBadge kind={asset.label} label={asset.label} />
						<ScoreBadge score={asset.match} />
					</Box>
				</Box>
			</Tooltip>
		</Box>
	);
}

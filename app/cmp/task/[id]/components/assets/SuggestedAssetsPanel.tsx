"use client";

import { Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconChevronDown, IconPencil, IconX } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import type { AssetItem } from "../../types";
import { PanelAssetCard } from "./PanelAssetCard";

type SuggestedAssetsPanelProps = {
	assets: AssetItem[];
	onAddToTask: () => void;
	onClearSelection: () => void;
	onClose: () => void;
	onEditSearch: () => void;
	onToggleSelect: (assetId: string) => void;
};

export function SuggestedAssetsPanel({
	assets,
	onAddToTask,
	onClearSelection,
	onClose,
	onEditSearch,
	onToggleSelect,
}: SuggestedAssetsPanelProps) {
	const pageSize = 8;
	const [visibleCount, setVisibleCount] = useState(pageSize);
	const selectedAssetsCount = assets.filter((asset) => asset.selected).length;

	useEffect(() => {
		setVisibleCount((current) => {
			if (assets.length === 0) {
				return pageSize;
			}

			return Math.min(Math.max(current, pageSize), assets.length);
		});
	}, [assets.length]);

	const visibleAssets = useMemo(() => assets.slice(0, visibleCount), [assets, visibleCount]);
	const hasMoreAssets = visibleCount < assets.length;
	const masonryRows = useMemo(() => {
		const rows: AssetItem[][] = [];

		for (let index = 0; index < visibleAssets.length; index += 2) {
			rows.push(visibleAssets.slice(index, index + 2));
		}

		return rows;
	}, [visibleAssets]);

	return (
		<Box display="flex" flexDirection="column" style={{ gap: 16, padding: 20 }}>
			<Box alignItems="start" display="flex" justifyContent="space-between">
				<Box display="flex" flexDirection="column" gap="4">
					<Text
						color="fg.default"
						style={{
							fontFamily: "Inter, sans-serif",
							fontSize: 20,
							fontWeight: 500,
							letterSpacing: "-0.35px",
							lineHeight: "28px",
							maxWidth: "none",
						}}
					>
						Suggested Assets
					</Text>
					<Text color="fg.tertiary" fontSize="md">
						Based on your brief
					</Text>
				</Box>
				<Button appearance="subtle" aria-label="Close" icon={<IconX size={18} />} onClick={onClose} size="sm" />
			</Box>

			{selectedAssetsCount > 0 && (
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Box alignItems="center" display="flex" gap="8">
						<Text
							color="fg.default"
							style={{
								fontFamily: "Inter, sans-serif",
								fontSize: 14,
								fontWeight: 500,
								letterSpacing: "-0.1px",
								lineHeight: "20px",
								maxWidth: "none",
							}}
						>
							{selectedAssetsCount} {selectedAssetsCount === 1 ? "asset" : "assets"} selected
						</Text>
						<Button
							appearance="subtle"
							aria-label="Clear selected assets"
							icon={<IconX size={16} />}
							onClick={onClearSelection}
							size="sm"
						/>
					</Box>
					<Button appearance="primary" onClick={onAddToTask} size="sm">
						Add to task
					</Button>
				</Box>
			)}

			<Box display="grid" gap="10" style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}>
				{masonryRows.flatMap((row, rowIndex) =>
					row.map((asset, itemIndex) => {
						const useNarrowCard = rowIndex % 2 === itemIndex;

						return (
							<PanelAssetCard
								asset={asset}
								key={asset.id}
								onToggleSelect={() => onToggleSelect(asset.id)}
								span={useNarrowCard ? 4 : 6}
							/>
						);
					}),
				)}
			</Box>

			<Box alignItems="center" display="flex" justifyContent="space-between" pt="6" style={{ gap: 12 }}>
				<Box alignItems="center" display="flex" gap="8" style={{ minHeight: 32 }}>
					{hasMoreAssets && (
						<Button
							appearance="subtle"
							icon={<IconChevronDown size={16} />}
							iconPosition="end"
							onClick={() => setVisibleCount((current) => Math.min(current + pageSize, assets.length))}
							size="sm"
						>
							Show more
						</Button>
					)}
				</Box>
				<Box alignItems="center" display="flex" gap="8">
					<Button appearance="subtle" icon={<IconPencil size={16} />} onClick={onEditSearch} size="sm">
						Edit Search
					</Button>
				</Box>
			</Box>
		</Box>
	);
}

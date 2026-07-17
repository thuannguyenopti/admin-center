"use client";

import {useEffect, useMemo, useState} from "react";
import {Box, Tooltip} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Text} from "@/app/components/Text";
import {IconCheck, IconChevronDown, IconPen, IconXmark} from "@/app/lib/axiom-icons";
import type {AssetItem} from "../types";
import {AssetBadge, ScoreBadge} from "./shared/AssetBadge";
import {AssetTooltipContent} from "./shared/AssetTooltipContent";

function PanelAssetCard({
	asset,
	onToggleSelect,
	span,
}: {
	asset: AssetItem;
	onToggleSelect: () => void;
	span: 4 | 6;
}) {
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
						aria-label={
							asset.selected ? `Deselect ${asset.title}` : `Select ${asset.title}`
						}
						onClick={onToggleSelect}
						style={{
							alignItems: "center",
							background: asset.selected
								? "var(--ax-colors-bg-default-pressed)"
								: "var(--ax-colors-bg-default)",
							border: asset.selected
								? "none"
								: "1px solid var(--ax-colors-border-control)",
							borderRadius: 4,
							boxShadow: asset.selected
								? "0 0 0 1px rgba(0,0,0,0.02)"
								: "0 1px 2px rgba(16,24,40,0.12)",
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
					<Box
						alignItems="center"
						display="flex"
						gap="8"
						style={{left: 8, bottom: 8, position: "absolute"}}
					>
						<AssetBadge label={asset.label} kind={asset.label} />
						<ScoreBadge score={asset.match} />
					</Box>
				</Box>
			</Tooltip>
		</Box>
	);
}

export function SuggestedAssetsPanel({
	assets,
	onAddToTask,
	onClearSelection,
	onClose,
	onEditSearch,
	onToggleSelect,
}: {
	assets: AssetItem[];
	onAddToTask: () => void;
	onClearSelection: () => void;
	onClose: () => void;
	onEditSearch: () => void;
	onToggleSelect: (assetId: string) => void;
}) {
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
		<Box display="flex" flexDirection="column" style={{gap: 16, padding: 20}}>
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
				<Button
					appearance="subtle"
					aria-label="Close"
					icon={<IconXmark size={18} />}
					onClick={onClose}
					size="sm"
				/>
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
							{selectedAssetsCount} {selectedAssetsCount === 1 ? "asset" : "assets"}{" "}
							selected
						</Text>
						<Button
							appearance="subtle"
							aria-label="Clear selected assets"
							icon={<IconXmark size={16} />}
							onClick={onClearSelection}
							size="sm"
						/>
					</Box>
					<Button appearance="primary" onClick={onAddToTask} size="sm">
						Add to task
					</Button>
				</Box>
			)}

			<Box
				display="grid"
				gap="10"
				style={{gridTemplateColumns: "repeat(10, minmax(0, 1fr))"}}
			>
				{masonryRows.flatMap((row, rowIndex) =>
					row.map((asset, itemIndex) => {
						const useNarrowCard = rowIndex % 2 === itemIndex;

						return (
							<PanelAssetCard
								key={asset.id}
								asset={asset}
								onToggleSelect={() => onToggleSelect(asset.id)}
								span={useNarrowCard ? 4 : 6}
							/>
						);
					})
				)}
			</Box>

			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				pt="6"
				style={{gap: 12}}
			>
				<Box alignItems="center" display="flex" gap="8" style={{minHeight: 32}}>
					{hasMoreAssets && (
						<Button
							appearance="subtle"
							icon={<IconChevronDown size={16} />}
							iconPosition="end"
							onClick={() =>
								setVisibleCount((current) =>
									Math.min(current + pageSize, assets.length)
								)
							}
							size="sm"
						>
							Show more
						</Button>
					)}
				</Box>
				<Box alignItems="center" display="flex" gap="8">
					<Button
						appearance="subtle"
						icon={<IconPen size={16} />}
						onClick={onEditSearch}
						size="sm"
					>
						Edit Search
					</Button>
				</Box>
			</Box>
		</Box>
	);
}

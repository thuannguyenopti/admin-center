"use client";

import {useState} from "react";
import {Box, Textarea, Tooltip} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Text} from "@/app/components/Text";
import {IconCheck, IconChevronLeft} from "@/app/lib/axiom-icons";
import Grid1Icon from "@/app/cmp/assets/Grid1.svg";
import Grid2Icon from "@/app/cmp/assets/grid2.svg";
import Grid3Icon from "@/app/cmp/assets/grid3.svg";
import Grid4Icon from "@/app/cmp/assets/grid4.svg";
import type {AssetItem, SearchAssetItem} from "../types";
import {AssetBadge, ScoreBadge} from "./shared/AssetBadge";
import {AssetTooltipContent} from "./shared/AssetTooltipContent";
import {FooterViewButton, GridIconAsset} from "./shared/GridIconAsset";

function SearchAssetCard({
	asset,
	height,
	onClick,
	onToggleSelect,
	showTooltip = false,
	width,
}: {
	asset: SearchAssetItem;
	height: number;
	onClick: () => void;
	onToggleSelect: () => void;
	showTooltip?: boolean;
	width?: number | string;
}) {
	const [isHovered, setIsHovered] = useState(false);
	const card = (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={onClick}
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
					style={{
						height: "100%",
						inset: 0,
						objectFit: "cover",
						position: "absolute",
						width: "100%",
					}}
				/>
			)}
			<img
				alt={asset.title}
				src={asset.src}
				style={{
					height: "100%",
					inset: 0,
					objectFit: "cover",
					position: "absolute",
					width: "100%",
				}}
			/>
			<button
				aria-label={asset.selected ? `Deselect ${asset.title}` : `Select ${asset.title}`}
				onClick={(event) => {
					event.stopPropagation();
					onToggleSelect();
				}}
				style={{
					alignItems: "center",
					background: asset.selected
						? "var(--ax-colors-bg-default-pressed)"
						: "var(--ax-colors-bg-default)",
					border: asset.selected ? "none" : "1px solid var(--ax-colors-border-control)",
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
			<Box
				alignItems="center"
				display="flex"
				gap="8"
				style={{bottom: 16, left: 16, position: "absolute"}}
			>
				<AssetBadge label={asset.label} kind={asset.label} />
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

export function SearchPage({
	assets,
	exclude,
	onAdd,
	onAssetClick,
	onBack,
	onExcludeChange,
	onPerspectiveChange,
	onToggleSelect,
	perspectives,
}: {
	assets: SearchAssetItem[];
	exclude: string;
	onAdd: () => void;
	onAssetClick: (asset: AssetItem) => void;
	onBack: () => void;
	onExcludeChange: (value: string) => void;
	onPerspectiveChange: (index: number, value: string) => void;
	onToggleSelect: (assetId: string) => void;
	perspectives: string[];
}) {
	const [layoutMode, setLayoutMode] = useState<"masonry" | "grid">("masonry");
	return (
		<Box display="flex" flexDirection="column" style={{height: "calc(100vh - 48px)"}}>
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{padding: "20px 28px"}}
			>
				<Text color="fg.default" fontSize="4xl" fontWeight="600">
					Suggested Assets
				</Text>
			</Box>

			<Box
				display="grid"
				flex="1"
				gap="20"
				style={{
					gridTemplateColumns: "minmax(0, 1fr) 444px",
					minHeight: 0,
					paddingLeft: 28,
					paddingRight: 28,
				}}
			>
				{layoutMode === "masonry" ? (
					<Box
						display="flex"
						flexDirection="column"
						gap="10"
						overflow="auto"
						pb="20"
						style={{
							alignContent: "start",
						}}
					>
						{Array.from({length: Math.ceil(assets.length / 3)}, (_, rowIndex) => {
							const rowAssets = assets.slice(rowIndex * 3, rowIndex * 3 + 3);

							return (
								<Box
									key={`search-row-${rowIndex}`}
									display="grid"
									gap="10"
									style={{
										gridTemplateColumns: rowAssets
											.map((asset) => `minmax(0, ${asset.width}fr)`)
											.join(" "),
										width: "100%",
									}}
								>
									{rowAssets.map((asset) => (
										<SearchAssetCard
											key={asset.id}
											asset={asset}
											height={asset.height}
											onClick={() => onAssetClick(asset)}
											onToggleSelect={() => onToggleSelect(asset.id)}
											showTooltip
											width="100%"
										/>
									))}
								</Box>
							);
						})}
					</Box>
				) : (
					<Box
						display="grid"
						gap="10"
						overflow="auto"
						pb="20"
						style={{
							alignContent: "start",
							gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
						}}
					>
						{assets.map((asset) => (
							<SearchAssetCard
								key={asset.id}
								asset={asset}
								height={180}
								onClick={() => onAssetClick(asset)}
								onToggleSelect={() => onToggleSelect(asset.id)}
								width="100%"
							/>
						))}
					</Box>
				)}

				<Box
					bg="bg.default"
					border="1"
					borderColor="border.tertiary"
					rounded="lg"
					style={{padding: 16}}
				>
					<Text color="fg.default" fontSize="4xl" fontWeight="600">
						Edit Search Perspectives
					</Text>
					<Box display="flex" flexDirection="column" mt="24" style={{gap: 24}}>
						{perspectives.map((item, index) => (
							<Box key={index} display="flex" flexDirection="column" style={{gap: 4}}>
								<Text color="fg.secondary" fontSize="lg">
									#{index + 1}
								</Text>
								<Textarea
									onChange={(event) =>
										onPerspectiveChange(index, event.target.value)
									}
									style={{minHeight: index === 0 || index === 2 ? 72 : 40}}
									value={item}
									w="full"
								/>
							</Box>
						))}
						<Box display="flex" flexDirection="column" mt="8" style={{gap: 4}}>
							<Text color="fg.secondary" fontSize="lg">
								Exclude
							</Text>
							<Textarea
								onChange={(event) => onExcludeChange(event.target.value)}
								style={{minHeight: 40}}
								value={exclude}
								w="full"
							/>
						</Box>
					</Box>
				</Box>
			</Box>

			<Box
				alignItems="center"
				bg="bg.default"
				borderT="1"
				borderColor="border.tertiary"
				display="grid"
				style={{
					backgroundColor: "var(--ax-colors-bg-default)",
					bottom: 0,
					flexShrink: 0,
					gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
					padding: "12px",
					position: "sticky",
					width: "100%",
					zIndex: 4,
				}}
			>
				<Box style={{minWidth: 0}}>
					<Button appearance="subtle" onClick={onBack} size="lg">
						<Box alignItems="center" display="flex" gap="8">
							<IconChevronLeft size={16} />
							<span>Go Back</span>
						</Box>
					</Button>
				</Box>
				<Box
					alignItems="center"
					display="flex"
					gap="16"
					justifyContent="center"
					style={{padding: "0 12px"}}
				>
					<FooterViewButton
						active={layoutMode === "masonry"}
						icon={<GridIconAsset active={layoutMode === "masonry"} Icon={Grid1Icon} />}
						onClick={() => setLayoutMode("masonry")}
					/>
					<FooterViewButton
						active={layoutMode === "grid"}
						icon={<GridIconAsset active={layoutMode === "grid"} Icon={Grid2Icon} />}
						onClick={() => setLayoutMode("grid")}
					/>
					<FooterViewButton disabled icon={<GridIconAsset Icon={Grid3Icon} />} />
					<FooterViewButton disabled icon={<GridIconAsset Icon={Grid4Icon} />} />
				</Box>
				<Box
					alignItems="center"
					display="flex"
					gap="8"
					justifyContent="flex-end"
					style={{minWidth: 0}}
				>
					<Button appearance="subtle" size="lg">
						Cancel
					</Button>
					<Button
						appearance="primary"
						disabled={!assets.some((asset) => asset.selected)}
						onClick={onAdd}
						size="lg"
					>
						Add to Content
					</Button>
				</Box>
			</Box>
		</Box>
	);
}

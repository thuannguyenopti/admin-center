"use client";

import { Box, Textarea } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import Grid1Icon from "@/app/cmp/assets/Grid1.svg";
import Grid2Icon from "@/app/cmp/assets/grid2.svg";
import Grid3Icon from "@/app/cmp/assets/grid3.svg";
import Grid4Icon from "@/app/cmp/assets/grid4.svg";
import {IconChevronLeft} from "@/app/lib/axiom-icons";
import { useState } from "react";
import type { AssetItem, SearchAssetItem } from "../../types";
import { FooterViewButton } from "../shared/FooterViewButton";
import { GridIconAsset } from "../shared/GridIconAsset";
import { SearchAssetCard } from "./SearchAssetCard";

type SearchPageProps = {
	assets: SearchAssetItem[];
	exclude: string;
	onAdd: () => void;
	onAssetClick: (asset: AssetItem) => void;
	onBack: () => void;
	onExcludeChange: (value: string) => void;
	onPerspectiveChange: (index: number, value: string) => void;
	onToggleSelect: (assetId: string) => void;
	perspectives: string[];
};

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
}: SearchPageProps) {
	const [layoutMode, setLayoutMode] = useState<"masonry" | "grid">("masonry");

	return (
		<Box display="flex" flexDirection="column" style={{ height: "calc(100vh - 48px)" }}>
			<Box alignItems="center" display="flex" justifyContent="space-between" style={{ padding: "20px 28px" }}>
				<Text color="fg.default" fontSize="4xl" fontWeight="600">
					Suggested Assets
				</Text>
			</Box>

			<Box
				display="grid"
				flex="1"
				gap="20"
				style={{ gridTemplateColumns: "minmax(0, 1fr) 444px", minHeight: 0, paddingLeft: 28, paddingRight: 28 }}
			>
				{layoutMode === "masonry" ? (
					<Box display="flex" flexDirection="column" gap="10" overflow="auto" pb="20" style={{ alignContent: "start" }}>
						{Array.from({ length: Math.ceil(assets.length / 3) }, (_, rowIndex) => {
							const rowAssets = assets.slice(rowIndex * 3, rowIndex * 3 + 3);

							return (
								<Box
									display="grid"
									gap="10"
									key={`search-row-${rowIndex}`}
									style={{
										gridTemplateColumns: rowAssets.map((asset) => `minmax(0, ${asset.width}fr)`).join(" "),
										width: "100%",
									}}
								>
									{rowAssets.map((asset) => (
										<SearchAssetCard
											asset={asset}
											height={asset.height}
											key={asset.id}
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
								asset={asset}
								height={180}
								key={asset.id}
								onClick={() => onAssetClick(asset)}
								onToggleSelect={() => onToggleSelect(asset.id)}
								width="100%"
							/>
						))}
					</Box>
				)}

				<Box bg="bg.default" border="1" borderColor="border.tertiary" rounded="lg" style={{ padding: 16 }}>
					<Text color="fg.default" fontSize="4xl" fontWeight="600">
						Edit Search Perspectives
					</Text>
					<Box display="flex" flexDirection="column" mt="24" style={{ gap: 24 }}>
						{perspectives.map((item, index) => (
							<Box display="flex" flexDirection="column" key={index} style={{ gap: 4 }}>
								<Text color="fg.secondary" fontSize="lg">
									#{index + 1}
								</Text>
								<Textarea
									onChange={(event) => onPerspectiveChange(index, event.target.value)}
									style={{ minHeight: index === 0 || index === 2 ? 72 : 40 }}
									value={item}
									w="full"
								/>
							</Box>
						))}
						<Box display="flex" flexDirection="column" mt="8" style={{ gap: 4 }}>
							<Text color="fg.secondary" fontSize="lg">
								Exclude
							</Text>
							<Textarea
								onChange={(event) => onExcludeChange(event.target.value)}
								style={{ minHeight: 40 }}
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
				borderColor="border.tertiary"
				borderT="1"
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
				<Box style={{ minWidth: 0 }}>
					<Button appearance="subtle" onClick={onBack} size="lg">
						<Box alignItems="center" display="flex" gap="8">
							<IconChevronLeft size={16} />
							<span>Go Back</span>
						</Box>
					</Button>
				</Box>
				<Box alignItems="center" display="flex" gap="16" justifyContent="center" style={{ padding: "0 12px" }}>
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
				<Box alignItems="center" display="flex" gap="8" justifyContent="flex-end" style={{ minWidth: 0 }}>
					<Button appearance="subtle" size="lg">
						Cancel
					</Button>
					<Button appearance="primary" disabled={!assets.some((asset) => asset.selected)} onClick={onAdd} size="lg">
						Add to Content
					</Button>
				</Box>
			</Box>
		</Box>
	);
}

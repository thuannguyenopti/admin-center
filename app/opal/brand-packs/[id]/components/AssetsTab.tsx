"use client";

import {useState} from "react";
import {Box, Button, Text} from "@optiaxiom/react";
import {IconArrowUpRightFromSquare, IconCopy, IconDownload} from "@optimizely/axiom-icons";
import type {BrandPack, BrandAsset} from "../../types";

type AssetsTabProps = {
	pack: BrandPack;
};

const assetTypeLabel: Record<BrandAsset["type"], string> = {
	logo: "Logo",
	photo: "Photo",
	icon: "Icon",
	illustration: "Illustration",
};

const assetTypeColor: Record<BrandAsset["type"], {bg: string; text: string}> = {
	logo: {bg: "var(--ax-colors-bg-secondary)", text: "var(--ax-colors-fg-default)"},
	photo: {bg: "#E3F2FD", text: "#0D47A1"},
	icon: {bg: "#EDE7F6", text: "#4527A0"},
	illustration: {bg: "#FFF3E0", text: "#E65100"},
};

function AssetTypeBadge({type}: {type: BrandAsset["type"]}) {
	const colors = assetTypeColor[type];
	return (
		<Box
			rounded="full"
			style={{
				background: colors.bg,
				color: colors.text,
				display: "inline-block",
				fontSize: 11,
				fontWeight: 600,
				padding: "2px 8px",
			}}
		>
			{assetTypeLabel[type]}
		</Box>
	);
}

function AssetCard({asset}: {asset: BrandAsset}) {
	const [hovered, setHovered] = useState(false);

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			overflow="hidden"
			rounded="xl"
			shadow={hovered ? "md" : "sm"}
			style={{
				cursor: "pointer",
				transform: hovered ? "translateY(-2px)" : "none",
				transition: "box-shadow 0.18s ease, transform 0.18s ease",
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{/* Preview */}
			<Box
				alignItems="center"
				bg="bg.secondary"
				display="flex"
				justifyContent="center"
				overflow="hidden"
				style={{height: 120, position: "relative"}}
			>
				<img
					alt={asset.name}
					src={asset.url}
					style={{
						height: "100%",
						maxHeight: 96,
						maxWidth: "80%",
						objectFit: "contain",
						width: "auto",
					}}
				/>
				{hovered && (
					<Box
						alignItems="center"
						display="flex"
						gap="6"
						justifyContent="center"
						style={{
							background: "rgba(0,0,0,0.35)",
							bottom: 0,
							left: 0,
							position: "absolute",
							right: 0,
							top: 0,
						}}
					>
						<Button
							appearance="default"
							size="sm"
							icon={<IconArrowUpRightFromSquare />}
							aria-label="View asset"
							onClick={(e) => e.stopPropagation()}
						/>
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconDownload />}
							aria-label="Download"
							onClick={(e) => e.stopPropagation()}
							style={{background: "rgba(255,255,255,0.15)", color: "#fff"}}
						/>
					</Box>
				)}
			</Box>

			{/* Info */}
			<Box display="flex" flexDirection="column" gap="4" p="12">
				<Text
					fontWeight="500"
					style={{
						fontSize: 13,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{asset.name}
				</Text>
				<Box alignItems="center" display="flex" gap="6">
					<AssetTypeBadge type={asset.type} />
					<Text color="fg.tertiary" fontSize="xs">
						{asset.format}
					</Text>
				</Box>
			</Box>
		</Box>
	);
}

export function AssetsTab({pack}: AssetsTabProps) {
	const [activeType, setActiveType] = useState<BrandAsset["type"] | "all">("all");

	const assetTypes = Array.from(new Set(pack.assets.map((a) => a.type))) as BrandAsset["type"][];
	const filters: Array<{label: string; value: BrandAsset["type"] | "all"}> = [
		{label: "All", value: "all"},
		...assetTypes.map((t) => ({label: assetTypeLabel[t], value: t})),
	];

	const filtered =
		activeType === "all" ? pack.assets : pack.assets.filter((a) => a.type === activeType);

	return (
		<Box display="flex" flexDirection="column" gap="20">
			{/* Header row */}
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{flexWrap: "wrap", gap: 12}}
			>
				{/* Filter pills */}
				<Box
					alignItems="center"
					bg="bg.secondary"
					display="inline-flex"
					gap="2"
					p="2"
					rounded="full"
				>
					{filters.map((f) => (
						<button
							key={f.value}
							type="button"
							onClick={() => setActiveType(f.value)}
							style={{
								background:
									activeType === f.value
										? "var(--ax-colors-bg-default)"
										: "transparent",
								border: 0,
								borderRadius: 999,
								color:
									activeType === f.value
										? "var(--ax-colors-fg-default)"
										: "var(--ax-colors-fg-secondary)",
								cursor: "pointer",
								fontSize: 13,
								fontWeight: activeType === f.value ? 600 : 400,
								padding: "4px 12px",
								transition: "all 0.15s ease",
							}}
						>
							{f.label}
						</button>
					))}
				</Box>

				<Box alignItems="center" display="flex" gap="8">
					<Text color="fg.secondary" fontSize="sm">
						{filtered.length} asset{filtered.length !== 1 ? "s" : ""}
					</Text>
					<Button appearance="default" size="sm" icon={<IconCopy />}>
						Download all
					</Button>
				</Box>
			</Box>

			{/* Grid */}
			{filtered.length > 0 ? (
				<Box
					display="grid"
					gap="12"
					style={{gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))"}}
				>
					{filtered.map((asset) => (
						<AssetCard key={asset.id} asset={asset} />
					))}
				</Box>
			) : (
				<Box
					alignItems="center"
					bg="bg.secondary"
					display="flex"
					flexDirection="column"
					gap="8"
					justifyContent="center"
					py="48"
					rounded="xl"
				>
					<Text fontWeight="500">No assets yet</Text>
					<Text color="fg.secondary" fontSize="sm">
						Upload logos, photos, and illustrations to this brand pack
					</Text>
				</Box>
			)}
		</Box>
	);
}

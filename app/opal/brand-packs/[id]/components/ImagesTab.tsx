"use client";

import { useState } from "react";
import { Box, Button, Select, Text, Textarea } from "@optiaxiom/react";
import { IconArrowUpRightFromSquare, IconDownload } from "@optimizely/axiom-icons";
import type { BrandAsset, BrandPack } from "../../types";

type ImagesTabProps = {
	pack: BrandPack;
};

type Classification = "style-ref" | "logo";

const CLASSIFICATION_OPTIONS = [
	{ label: "Style reference", value: "style-ref" },
	{ label: "Logo", value: "logo" },
];

const ASSET_TYPE_LABEL: Record<BrandAsset["type"], string> = {
	logo: "Logo",
	photo: "Photo",
	icon: "Icon",
	illustration: "Illustration",
};

function ImageCard({
	asset,
	classification,
	onClassify,
	constraint,
	onConstraintChange,
}: {
	asset: BrandAsset;
	classification: Classification;
	onClassify: (v: Classification) => void;
	constraint: string;
	onConstraintChange: (v: string) => void;
}) {
	const [hovered, setHovered] = useState(false);
	const [constraintExpanded, setConstraintExpanded] = useState(!!constraint);

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
				transition: "box-shadow 0.18s ease",
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<Box
				alignItems="center"
				bg="bg.secondary"
				display="flex"
				justifyContent="center"
				overflow="hidden"
				style={{ height: 120, position: "relative" }}
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
							background: "rgba(0,0,0,0.32)",
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
							aria-label="View"
							onClick={(e) => e.stopPropagation()}
						/>
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconDownload />}
							aria-label="Download"
							onClick={(e) => e.stopPropagation()}
							style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
						/>
					</Box>
				)}
			</Box>

			<Box display="flex" flexDirection="column" gap="8" p="12">
				<Box display="flex" flexDirection="column" gap="2">
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
					<Text color="fg.tertiary" fontSize="xs">
						{ASSET_TYPE_LABEL[asset.type]} · {asset.format}
					</Text>
				</Box>

				<Select
					value={classification}
					onValueChange={(value) => onClassify(value as Classification)}
					options={CLASSIFICATION_OPTIONS}
				/>

				{constraintExpanded ? (
					<Textarea
						value={constraint}
						onChange={(e) => onConstraintChange(e.target.value)}
						placeholder="LLM guidance: do not recreate this artwork; resize/crop only; use as composition reference."
						rows={2}
						style={{
							fontSize: 11,
							lineHeight: 1.5,
							resize: "none",
						}}
						onBlur={(e) => {
							if (!constraint) setConstraintExpanded(false);
						}}
					/>
				) : (
					<button
						type="button"
						onClick={(e) => { e.stopPropagation(); setConstraintExpanded(true); }}
						style={{
							background: "transparent",
							border: 0,
							color: "var(--ax-colors-fg-tertiary)",
							cursor: "pointer",
							fontSize: 11,
							padding: 0,
							textAlign: "left",
							transition: "color 0.15s",
						}}
						onMouseEnter={(e) => { e.currentTarget.style.color = "var(--ax-colors-fg-accent)"; }}
						onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ax-colors-fg-tertiary)"; }}
					>
						+ Add LLM guidance
					</button>
				)}
			</Box>
		</Box>
	);
}

export function ImagesTab({ pack }: ImagesTabProps) {
	const images = pack.assets.filter((a) => a.type !== "logo");

	const [classifications, setClassifications] = useState<Record<string, Classification>>(() =>
		Object.fromEntries(images.map((a) => [a.id, "style-ref"]))
	);
	const [constraints, setConstraints] = useState<Record<string, string>>(() =>
		Object.fromEntries(images.map((a) => [a.id, ""]))
	);
	const [activeType, setActiveType] = useState<"all" | BrandAsset["type"]>("all");

	const filtered =
		activeType === "all"
			? images
			: images.filter((a) => a.type === activeType);

	const types = Array.from(new Set(images.map((a) => a.type)));

	return (
		<Box display="flex" flexDirection="column" gap="20">
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{ flexWrap: "wrap", gap: 12 }}
			>
				<Box
					alignItems="center"
					bg="bg.secondary"
					display="inline-flex"
					gap="2"
					p="2"
					rounded="full"
				>
					{(["all", ...types] as Array<"all" | BrandAsset["type"]>).map((t) => (
						<button
							key={t}
							type="button"
							onClick={() => setActiveType(t)}
							style={{
								background: activeType === t ? "var(--ax-colors-bg-default)" : "transparent",
								border: 0,
								borderRadius: 999,
								color: activeType === t ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)",
								cursor: "pointer",
								fontSize: 13,
								fontWeight: activeType === t ? 600 : 400,
								padding: "4px 12px",
								transition: "all 0.12s ease",
							}}
						>
							{t === "all" ? "All" : ASSET_TYPE_LABEL[t]}
						</button>
					))}
				</Box>

				<Box alignItems="center" display="flex" gap="8">
					<Text color="fg.secondary" fontSize="sm">
						{filtered.length} image{filtered.length !== 1 ? "s" : ""}
					</Text>
					<Button appearance="default" size="sm">
						Upload images
					</Button>
				</Box>
			</Box>

			<Box
				alignItems="center"
				bg="bg.secondary"
				borderColor="border.tertiary"
				display="flex"
				gap="8"
				p="12"
				rounded="lg"
			>
				<Box
					bg="bg.accent.subtle"
					display="flex"
					rounded="full"
					style={{ flexShrink: 0, height: 6, width: 6 }}
				/>
				<Text color="fg.secondary" fontSize="xs">
					Classify every asset where it appears. Use <strong>Style reference</strong> for mood/composition and <strong>Logo</strong> only for marks Opal may place. Add constraints when an image should be resized or referenced, not recreated.
				</Text>
			</Box>

			{filtered.length > 0 ? (
				<Box
					display="grid"
					gap="12"
					style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
				>
					{filtered.map((asset) => (
						<ImageCard
							key={asset.id}
							asset={asset}
							classification={classifications[asset.id] ?? "style-ref"}
							onClassify={(v) => setClassifications((p) => ({ ...p, [asset.id]: v }))}
							constraint={constraints[asset.id] ?? ""}
							onConstraintChange={(v) => setConstraints((p) => ({ ...p, [asset.id]: v }))}
						/>
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
					<Text fontWeight="500">No images yet</Text>
					<Text color="fg.secondary" fontSize="sm">
						Upload photos and illustrations to guide Opal's visual style
					</Text>
					<Button appearance="default" size="sm" style={{ marginTop: 4 }}>
						Upload images
					</Button>
				</Box>
			)}
		</Box>
	);
}

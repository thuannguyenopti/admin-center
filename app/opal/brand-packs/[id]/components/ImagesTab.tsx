"use client";

import { useState } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconArrowUpRightFromSquare, IconDownload } from "@optimizely/axiom-icons";
import type { BrandAsset, BrandPack } from "../../types";

type ImagesTabProps = {
	pack: BrandPack;
};

type Classification = "style-ref" | "logo";

const ASSET_TYPE_LABEL: Record<BrandAsset["type"], string> = {
	logo: "Logo",
	photo: "Photo",
	icon: "Icon",
	illustration: "Illustration",
};

/**
 * Segmented classification control — always visible on each card.
 * Persistent state (type classification) should never be buried in a menu.
 */
function ClassificationControl({
	value,
	onChange,
}: {
	value: Classification;
	onChange: (v: Classification) => void;
}) {
	return (
		<Box
			alignItems="center"
			bg="bg.secondary"
			display="inline-flex"
			gap="2"
			p="2"
			rounded="full"
			style={{ alignSelf: "flex-start" }}
		>
			{(["style-ref", "logo"] as Classification[]).map((opt) => (
				<button
					key={opt}
					type="button"
					onClick={(e) => { e.stopPropagation(); onChange(opt); }}
					style={{
						background: value === opt ? "var(--ax-colors-bg-default)" : "transparent",
						border: 0,
						borderRadius: 999,
						boxShadow: value === opt ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
						color: value === opt ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
						cursor: "pointer",
						fontSize: 11,
						fontWeight: value === opt ? 600 : 400,
						padding: "3px 10px",
						transition: "all 0.12s ease",
					}}
				>
					{opt === "style-ref" ? "Style Ref" : "Logo"}
				</button>
			))}
		</Box>
	);
}

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
			{/* Image preview */}
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

			{/* Card body */}
			<Box display="flex" flexDirection="column" gap="8" p="12">
				{/* Name + type */}
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

				{/* Classification — always visible */}
				<ClassificationControl value={classification} onChange={onClassify} />

				{/* LLM constraint field */}
				{constraintExpanded ? (
					<textarea
						value={constraint}
						onChange={(e) => onConstraintChange(e.target.value)}
						placeholder="LLM guidance — e.g. Do not recreate this artwork, use only for composition reference."
						rows={2}
						style={{
							background: "var(--ax-colors-bg-secondary)",
							border: "1px solid var(--ax-colors-border-default)",
							borderRadius: 6,
							color: "var(--ax-colors-fg-default)",
							fontFamily: "inherit",
							fontSize: 11,
							lineHeight: 1.5,
							outline: "none",
							padding: "6px 8px",
							resize: "none",
							transition: "border-color 0.15s",
							width: "100%",
						}}
						onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)"; }}
						onBlur={(e) => {
							e.currentTarget.style.borderColor = "var(--ax-colors-border-default)";
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
			{/* Header */}
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{ flexWrap: "wrap", gap: 12 }}
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

			{/* Constraint explainer — contextual, single line */}
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
					Classify images as <strong>Style Ref</strong> (composition/mood reference) or <strong>Logo</strong>. Add LLM guidance to control how Opal uses each image in generation.
				</Text>
			</Box>

			{/* Image grid */}
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

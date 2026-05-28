"use client";

import { useState } from "react";
import { Box, Button, Select, Text } from "@optiaxiom/react";
import { IconArrowUpRightFromSquare, IconDownload } from "@optimizely/axiom-icons";
import type { BrandPack } from "../../types";

type LogosTabProps = {
	pack: BrandPack;
};

type Classification = "logo" | "style-ref";

const CLASSIFICATION_OPTIONS = [
	{ label: "Logo", value: "logo" },
	{ label: "Style reference", value: "style-ref" },
];

function LogoCard({ asset }: { asset: BrandPack["assets"][0] }) {
	const [hovered, setHovered] = useState(false);
	const [classification, setClassification] = useState<Classification>("logo");

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
			{/* Preview — checkered background for transparency */}
			<Box
				alignItems="center"
				display="flex"
				justifyContent="center"
				overflow="hidden"
				style={{
					backgroundImage:
						"linear-gradient(45deg, var(--ax-colors-bg-secondary) 25%, transparent 25%), linear-gradient(-45deg, var(--ax-colors-bg-secondary) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--ax-colors-bg-secondary) 75%), linear-gradient(-45deg, transparent 75%, var(--ax-colors-bg-secondary) 75%)",
					backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
					backgroundSize: "16px 16px",
					height: 120,
					position: "relative",
				}}
			>
				<img
					alt={asset.name}
					src={asset.url}
					style={{
						height: "100%",
						maxHeight: 80,
						maxWidth: "70%",
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
							background: "rgba(0,0,0,0.3)",
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
				<Text color="fg.tertiary" fontSize="xs">
					{asset.format}
				</Text>
				<Select
					value={classification}
					onValueChange={(value) => setClassification(value as Classification)}
					options={CLASSIFICATION_OPTIONS}
				/>
			</Box>
		</Box>
	);
}

function UploadZone() {
	const [dragOver, setDragOver] = useState(false);

	return (
		<Box
			alignItems="center"
			display="flex"
			flexDirection="column"
			gap="8"
			justifyContent="center"
			rounded="xl"
			style={{
				border: `1.5px dashed ${dragOver ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-default)"}`,
				cursor: "pointer",
				minHeight: 120,
				padding: "24px 16px",
				transition: "border-color 0.15s, background 0.15s",
				background: dragOver ? "var(--ax-colors-bg-accent-subtle)" : "transparent",
			}}
			onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
			onDragLeave={() => setDragOver(false)}
			onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
		>
			<Text
				color={dragOver ? "fg.accent" : "fg.secondary"}
				fontSize="sm"
				fontWeight="500"
				style={{ transition: "color 0.15s" }}
			>
				Drop logo files here
			</Text>
			<Text color="fg.tertiary" fontSize="xs">
				SVG, PNG, or WebP. Classify questionable artwork after upload.
			</Text>
			<Button appearance="default" size="md" style={{ marginTop: 4 }}>
				Browse files
			</Button>
		</Box>
	);
}

export function LogosTab({ pack }: LogosTabProps) {
	const logos = pack.assets.filter((a) => a.type === "logo");

	return (
		<Box display="flex" flexDirection="column" gap="20">
			{/* Header */}
			<Box alignItems="center" display="flex" gap="12" justifyContent="space-between">
				<Text color="fg.secondary" fontSize="sm">
					{logos.length} logo{logos.length !== 1 ? "s" : ""}
				</Text>
				<Button appearance="default" size="md">
					Upload logo
				</Button>
			</Box>

			{/* Logo grid */}
			{logos.length > 0 ? (
				<Box
					display="grid"
					gap="12"
					style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
				>
					{logos.map((asset) => (
						<LogoCard key={asset.id} asset={asset} />
					))}
				</Box>
			) : null}

			{/* Upload zone */}
			<UploadZone />

			{logos.length === 0 && (
				<Box
					alignItems="center"
					display="flex"
					flexDirection="column"
					gap="4"
					justifyContent="center"
					style={{ marginTop: -8 }}
				>
					<Text color="fg.tertiary" fontSize="xs">
						Logos are used by Opal for documents, email headers, and on-brand assets
					</Text>
				</Box>
			)}
		</Box>
	);
}

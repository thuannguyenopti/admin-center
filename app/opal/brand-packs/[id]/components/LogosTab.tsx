"use client";

import {useState} from "react";
import {Badge, Box, Button, Select, Text} from "@optiaxiom/react";
import {IconArrowUpRightFromSquare, IconDownload, IconPlus} from "@optimizely/axiom-icons";
import type {BrandPack} from "../../types";

type LogosTabProps = {
	pack: BrandPack;
};

type Classification = "logo" | "style-ref";

const CLASSIFICATION_OPTIONS = [
	{label: "Logo", value: "logo"},
	{label: "Style reference", value: "style-ref"},
];

function logoPreviewStyle(asset: BrandPack["assets"][0]) {
	const isWhite = /white|light/i.test(asset.name);
	return {
		background: isWhite ? "var(--ax-colors-fg-default)" : "var(--ax-colors-bg-secondary)",
		filter: isWhite ? "invert(1)" : undefined,
	};
}

function LogoCard({asset}: {asset: BrandPack["assets"][0]}) {
	const [classification, setClassification] = useState<Classification>("logo");
	const preview = logoPreviewStyle(asset);

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			overflow="hidden"
			rounded="xl"
			shadow="sm"
			style={{
				cursor: "pointer",
				transition: "box-shadow 0.18s ease, transform 0.18s ease",
			}}
		>
			<Box
				alignItems="center"
				display="flex"
				justifyContent="center"
				overflow="hidden"
				style={{background: preview.background, height: 144, padding: 24}}
			>
				<img
					alt={asset.name}
					src={asset.url}
					style={{
						filter: preview.filter,
						maxHeight: "100%",
						maxWidth: "82%",
						objectFit: "contain",
						width: "100%",
					}}
				/>
			</Box>

			<Box display="flex" flexDirection="column" gap="10" p="16">
				<Text
					fontWeight="600"
					style={{
						fontSize: 14,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{asset.name}
				</Text>
				<Box alignItems="center" display="flex" gap="6">
					<Badge intent="neutral" variant="subtle">
						{asset.format}
					</Badge>
					<Badge
						intent={classification === "logo" ? "success" : "neutral"}
						variant="subtle"
					>
						{classification === "logo" ? "Logo" : "Style reference"}
					</Badge>
				</Box>
				<Select
					value={classification}
					onValueChange={(value) => setClassification(value as Classification)}
					options={CLASSIFICATION_OPTIONS}
				/>
				<Box alignItems="center" display="flex" gap="6">
					<Button
						appearance="subtle"
						aria-label={`View ${asset.name}`}
						icon={<IconArrowUpRightFromSquare />}
						size="sm"
					/>
					<Button
						appearance="subtle"
						aria-label={`Download ${asset.name}`}
						icon={<IconDownload />}
						size="sm"
					/>
				</Box>
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
				border: `1.5px dashed ${dragOver ? "var(--ax-colors-border-focus)" : "var(--ax-colors-border-default)"}`,
				cursor: "pointer",
				minHeight: 120,
				padding: "24px 16px",
				transition: "border-color 0.15s, background 0.15s",
				background: dragOver ? "var(--ax-colors-bg-secondary)" : "transparent",
			}}
			onDragOver={(e) => {
				e.preventDefault();
				setDragOver(true);
			}}
			onDragLeave={() => setDragOver(false)}
			onDrop={(e) => {
				e.preventDefault();
				setDragOver(false);
			}}
		>
			<Text
				color={dragOver ? "fg.accent" : "fg.secondary"}
				fontSize="sm"
				fontWeight="500"
				style={{transition: "color 0.15s"}}
			>
				Drop logo files here
			</Text>
			<Text color="fg.tertiary" fontSize="xs">
				SVG, PNG, or WebP. Classify questionable artwork after upload.
			</Text>
			<Button appearance="default" size="md" style={{marginTop: 4}}>
				Browse files
			</Button>
		</Box>
	);
}

export function LogosTab({pack}: LogosTabProps) {
	const logos = pack.assets.filter((a) => a.type === "logo");

	return (
		<Box display="flex" flexDirection="column" gap="16">
			<Box alignItems="center" display="flex" gap="12" justifyContent="space-between">
				<Text color="fg.secondary" fontSize="sm">
					{logos.length} logo{logos.length !== 1 ? "s" : ""}
				</Text>
				<Button appearance="primary" icon={<IconPlus />} size="md">
					Upload logo
				</Button>
			</Box>

			{logos.length > 0 ? (
				<Box
					display="grid"
					gap="12"
					style={{gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))"}}
				>
					{logos.map((asset) => (
						<LogoCard key={asset.id} asset={asset} />
					))}
				</Box>
			) : null}

			<UploadZone />

			{logos.length === 0 && (
				<Box
					alignItems="center"
					display="flex"
					flexDirection="column"
					gap="4"
					justifyContent="center"
					style={{marginTop: -8}}
				>
					<Text color="fg.tertiary" fontSize="xs">
						Logos are used by Opal for documents, email headers, and on-brand assets
					</Text>
				</Box>
			)}
		</Box>
	);
}

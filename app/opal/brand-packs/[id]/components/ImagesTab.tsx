"use client";

import {type ChangeEvent, useRef, useState} from "react";
import {Badge, Box, Button, Select, Text, Textarea} from "@optiaxiom/react";
import {IconArrowUpRightFromSquare, IconDownload, IconPlus} from "@optiaxiom/icons";
import type {BrandAsset, BrandPack} from "../../types";
import {getImageAssets} from "../../adapters";

type ImagesTabProps = {
	pack: BrandPack;
};

type Classification = "style-ref" | "logo";

const CLASSIFICATION_OPTIONS = [
	{label: "Style reference", value: "style-ref"},
	{label: "Logo", value: "logo"},
];

const ASSET_TYPE_LABEL: Record<BrandAsset["type"], string> = {
	logo: "Logo",
	photo: "Photo",
	icon: "Icon",
	illustration: "Illustration",
	background: "Background",
};

function openAsset(asset: BrandAsset) {
	window.open(asset.url, "_blank", "noopener,noreferrer");
}

function downloadAsset(asset: BrandAsset) {
	const link = document.createElement("a");
	link.href = asset.url;
	link.download = asset.name;
	document.body.appendChild(link);
	link.click();
	link.remove();
}

function imageAssetFromFile(file: File): BrandAsset {
	const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";
	return {
		bucket: "style_references",
		format: extension,
		id: `uploaded-image-${Date.now()}-${file.name}`,
		name: file.name,
		type: "photo",
		url: URL.createObjectURL(file),
	};
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
			<Box
				alignItems="center"
				display="flex"
				justifyContent="center"
				overflow="hidden"
				style={{height: 172, position: "relative"}}
			>
				<img
					alt={asset.name}
					src={asset.url}
					style={{
						height: "100%",
						objectFit: "cover",
						width: "100%",
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
							onClick={(e) => {
								e.stopPropagation();
								openAsset(asset);
							}}
						/>
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconDownload />}
							aria-label="Download"
							onClick={(e) => {
								e.stopPropagation();
								downloadAsset(asset);
							}}
							style={{background: "rgba(255,255,255,0.15)", color: "#fff"}}
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
					<Box alignItems="center" display="flex" gap="6">
						<Badge intent="neutral" variant="subtle">
							{ASSET_TYPE_LABEL[asset.type]}
						</Badge>
						<Badge
							intent={classification === "style-ref" ? "success" : "neutral"}
							variant="subtle"
						>
							{classification === "style-ref" ? "Style reference" : "Logo"}
						</Badge>
					</Box>
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
							fontSize: 12,
							lineHeight: 1.5,
							resize: "none",
						}}
						onBlur={(e) => {
							if (!constraint) setConstraintExpanded(false);
						}}
					/>
				) : (
					<Button
						appearance="subtle"
						onClick={(e) => {
							e.stopPropagation();
							setConstraintExpanded(true);
						}}
						size="sm"
					>
						Add LLM guidance
					</Button>
				)}
			</Box>
		</Box>
	);
}

export function ImagesTab({pack}: ImagesTabProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [images, setImages] = useState(() => getImageAssets(pack));

	const [classifications, setClassifications] = useState<Record<string, Classification>>(() =>
		Object.fromEntries(images.map((a) => [a.id, "style-ref"]))
	);
	const [constraints, setConstraints] = useState<Record<string, string>>(() =>
		Object.fromEntries(images.map((a) => [a.id, ""]))
	);
	const [activeType, setActiveType] = useState<"all" | BrandAsset["type"]>("all");

	const addFiles = (files: FileList) => {
		const nextImages = Array.from(files).map(imageAssetFromFile);
		if (nextImages.length === 0) return;
		setImages((current) => [...nextImages, ...current]);
		setClassifications((current) => ({
			...Object.fromEntries(nextImages.map((a) => [a.id, "style-ref" as Classification])),
			...current,
		}));
		setConstraints((current) => ({
			...Object.fromEntries(nextImages.map((a) => [a.id, ""])),
			...current,
		}));
	};

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) addFiles(event.target.files);
		event.target.value = "";
	};

	const filtered = activeType === "all" ? images : images.filter((a) => a.type === activeType);

	const types = Array.from(new Set(images.map((a) => a.type)));

	return (
		<Box display="flex" flexDirection="column" gap="16">
			<input
				ref={fileInputRef}
				accept="image/png,image/jpeg,image/webp,image/svg+xml"
				aria-label="Upload image files"
				multiple
				onChange={handleFileChange}
				style={{display: "none"}}
				type="file"
			/>
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{flexWrap: "wrap", gap: 12}}
			>
				<Box alignItems="center" display="flex" gap="6" style={{flexWrap: "wrap"}}>
					{(["all", ...types] as Array<"all" | BrandAsset["type"]>).map((t) => (
						<Button
							key={t}
							onClick={() => setActiveType(t)}
							appearance={activeType === t ? "default" : "subtle"}
							size="sm"
						>
							{t === "all" ? "All" : ASSET_TYPE_LABEL[t]}
						</Button>
					))}
				</Box>

				<Box alignItems="center" display="flex" gap="8">
					<Text color="fg.secondary" fontSize="sm">
						{filtered.length} image{filtered.length !== 1 ? "s" : ""}
					</Text>
					<Button
						appearance="primary"
						icon={<IconPlus />}
						onClick={() => fileInputRef.current?.click()}
						size="md"
					>
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
					style={{flexShrink: 0, height: 6, width: 6}}
				/>
				<Text color="fg.secondary" fontSize="xs">
					Classify every asset where it appears. Use <strong>Style reference</strong> for
					mood/composition and <strong>Logo</strong> only for marks Opal may place. Add
					constraints when an image should be resized or referenced, not recreated.
				</Text>
			</Box>

			{filtered.length > 0 ? (
				<Box
					display="grid"
					gap="16"
					style={{gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))"}}
				>
					{filtered.map((asset) => (
						<ImageCard
							key={asset.id}
							asset={asset}
							classification={classifications[asset.id] ?? "style-ref"}
							onClassify={(v) => setClassifications((p) => ({...p, [asset.id]: v}))}
							constraint={constraints[asset.id] ?? ""}
							onConstraintChange={(v) =>
								setConstraints((p) => ({...p, [asset.id]: v}))
							}
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
					<Button
						appearance="primary"
						icon={<IconPlus />}
						onClick={() => fileInputRef.current?.click()}
						size="md"
						style={{marginTop: 4}}
					>
						Upload images
					</Button>
				</Box>
			)}
		</Box>
	);
}

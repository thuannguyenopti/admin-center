"use client";

import { useEffect, useRef, useState } from "react";
import { Badge, Box, Button, Text, Textarea } from "@optiaxiom/react";
import { IconPlus } from "@optimizely/axiom-icons";
import type { BrandAsset, BrandPack } from "../../types";

type ImageType = "style-reference" | "element";

type ImageEntry = {
	asset: BrandAsset;
	imageType: ImageType;
	llmGuidance: string;
	guidanceOpen: boolean;
};

const ASSET_TYPE_LABEL: Record<BrandAsset["type"], string> = {
	logo: "Logo",
	photo: "Photo",
	icon: "Icon",
	illustration: "Illustration",
	background: "Background",
};

type Props = { pack: BrandPack; onSave: () => void };

export function ImagesSection({ pack, onSave }: Props) {
	const images = pack.assets.filter((a) => a.type !== "logo");
	const [entries, setEntries] = useState<ImageEntry[]>(
		images.map((a) => ({ asset: a, imageType: "style-reference", llmGuidance: "", guidanceOpen: false }))
	);
	const [filter, setFilter] = useState<"all" | "style-reference" | "element">("all");

	const updateEntry = (id: string, updates: Partial<Omit<ImageEntry, "asset">>) => {
		setEntries((prev) => prev.map((e) => (e.asset.id === id ? { ...e, ...updates } : e)));
		if ("llmGuidance" in updates) onSave();
	};

	const filtered =
		filter === "all"
			? entries
			: entries.filter((e) => e.imageType === filter);

	return (
		<Box
			bg="bg.default"
			display="flex"
			flexDirection="column"
			id="section-images"
			overflow="hidden"
			rounded="xl"
			style={{ border: "1px solid rgba(0,0,0,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
		>
			{/* Header bar — filters + upload */}
			<Box alignItems="center" display="flex" justifyContent="space-between" p="16" px="20">
				<Box display="flex" gap="6">
					<FilterPill active={filter === "all"} label="All" onClick={() => setFilter("all")} />
					<FilterPill active={filter === "style-reference"} label="Style Reference" onClick={() => setFilter("style-reference")} />
					<FilterPill active={filter === "element"} label="Elements" onClick={() => setFilter("element")} />
				</Box>
				<Box alignItems="center" display="flex" gap="12">
					<Text color="fg.tertiary" fontSize="sm">{entries.length} images</Text>
					<UploadDropdown />
				</Box>
			</Box>

			{/* Divider */}
			<Box style={{ background: "rgba(0,0,0,0.08)", height: 1 }} />

			{/* Info banner */}
			<Box p="16" pb="0">
				<Box
					rounded="lg"
					style={{
						background: "var(--ax-colors-bg-accent-subtle)",
						border: "1px solid var(--ax-colors-border-accent)",
						padding: "10px 14px",
					}}
				>
					<Text color="fg.secondary" fontSize="xs" style={{ lineHeight: 1.6 }}>
						Classify every asset where it appears. Use{" "}
						<span style={{ color: "var(--ax-colors-fg-accent)", fontWeight: 600 }}>Style reference</span>{" "}
						for mood/composition and <span style={{ fontWeight: 600 }}>Element</span> only for marks Opal may place.
						Add constraints when an image should be referenced, not recreated.
					</Text>
				</Box>
			</Box>

			{/* Image grid */}
			<Box display="grid" gap="16" p="16" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
				{filtered.map((entry) => (
					<ImageCard
						key={entry.asset.id}
						entry={entry}
						onTypeChange={(imageType) => updateEntry(entry.asset.id, { imageType })}
						onGuidanceChange={(llmGuidance) => updateEntry(entry.asset.id, { llmGuidance })}
						onToggleGuidance={() =>
							updateEntry(entry.asset.id, { guidanceOpen: !entry.guidanceOpen })
						}
					/>
				))}
			</Box>
		</Box>
	);
}

function UploadDropdown() {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [open]);

	return (
		<Box ref={ref} style={{ position: "relative" }}>
			<Button appearance="primary" icon={<IconPlus />} onClick={() => setOpen((v) => !v)} size="sm">
				Upload images
			</Button>
			{open && (
				<Box
					bg="bg.default"
					rounded="lg"
					style={{
						border: "1px solid rgba(0,0,0,0.12)",
						boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
						minWidth: 200,
						overflow: "hidden",
						position: "absolute",
						right: 0,
						top: "calc(100% + 6px)",
						zIndex: 50,
					}}
				>
					<DropdownItem
						label="Upload from disk"
						description="JPG, PNG, WebP up to 20 MB"
						onClick={() => setOpen(false)}
					/>
					<Box style={{ background: "rgba(0,0,0,0.06)", height: 1 }} />
					<DropdownItem
						label="Import from Figma"
						description="Connect and pull assets directly"
						onClick={() => setOpen(false)}
					/>
				</Box>
			)}
		</Box>
	);
}

function DropdownItem({
	description,
	label,
	onClick,
}: {
	description: string;
	label: string;
	onClick: () => void;
}) {
	const [hovered, setHovered] = useState(false);
	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="2"
			onClick={onClick}
			px="16"
			py="12"
			style={{
				background: hovered ? "var(--ax-colors-bg-secondary)" : "transparent",
				cursor: "pointer",
				transition: "background 0.1s",
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<Text fontWeight="500" style={{ fontSize: 13 }}>{label}</Text>
			<Text color="fg.tertiary" fontSize="xs">{description}</Text>
		</Box>
	);
}

function ImageCard({
	entry,
	onGuidanceChange,
	onToggleGuidance,
	onTypeChange,
}: {
	entry: ImageEntry;
	onGuidanceChange: (v: string) => void;
	onToggleGuidance: () => void;
	onTypeChange: (v: ImageType) => void;
}) {
	const showGuidance = entry.guidanceOpen || entry.llmGuidance.length > 0;

	return (
		<Box
			bg="bg.default"
			display="flex"
			flexDirection="column"
			overflow="hidden"
			rounded="xl"
			style={{ border: "1px solid rgba(0,0,0,0.1)" }}
		>
			<Box style={{ aspectRatio: "4/3", overflow: "hidden" }}>
				<img
					alt={entry.asset.name}
					src={entry.asset.url}
					style={{ height: "100%", objectFit: "cover", width: "100%" }}
				/>
			</Box>

			<Box display="flex" flexDirection="column" gap="8" p="10">
				<Text fontWeight="500" style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
					{entry.asset.name}
				</Text>

				<Box display="flex" style={{ flexWrap: "wrap", gap: 4 }}>
					<Badge intent="neutral" variant="subtle" style={{ fontSize: 10, textTransform: "uppercase" }}>
						{ASSET_TYPE_LABEL[entry.asset.type]}
					</Badge>
					<TypePill
						active={entry.imageType === "style-reference"}
						label="Style Ref"
						onClick={() => onTypeChange("style-reference")}
					/>
					<TypePill
						active={entry.imageType === "element"}
						label="Element"
						onClick={() => onTypeChange("element")}
					/>
				</Box>

				{showGuidance ? (
					<Textarea
						value={entry.llmGuidance}
						onChange={(e) => onGuidanceChange(e.target.value)}
						placeholder="Describe how this image should be referenced or used…"
						rows={2}
						style={{ fontSize: 11, lineHeight: 1.55, resize: "none" }}
					/>
				) : (
					<Box onClick={onToggleGuidance} style={{ cursor: "pointer" }}>
						<Text color="fg.tertiary" fontSize="xs" style={{ textDecoration: "underline" }}>
							Add LLM guidance
						</Text>
					</Box>
				)}
			</Box>
		</Box>
	);
}

function TypePill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
	return (
		<Box
			onClick={onClick}
			style={{
				background: active ? "var(--ax-colors-bg-accent-subtle)" : "transparent",
				border: `1px solid ${active ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-default)"}`,
				borderRadius: 4,
				color: active ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-tertiary)",
				cursor: "pointer",
				fontSize: 10,
				fontWeight: active ? 700 : 400,
				letterSpacing: "0.04em",
				padding: "2px 6px",
				textTransform: "uppercase",
				userSelect: "none",
			}}
		>
			{label}
		</Box>
	);
}

function FilterPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
	return (
		<Box
			onClick={onClick}
			rounded="full"
			style={{
				background: active ? "var(--ax-colors-fg-default)" : "transparent",
				border: `1px solid ${active ? "var(--ax-colors-fg-default)" : "var(--ax-colors-border-default)"}`,
				color: active ? "var(--ax-colors-bg-default)" : "var(--ax-colors-fg-secondary)",
				cursor: "pointer",
				fontSize: 13,
				fontWeight: active ? 600 : 400,
				padding: "4px 12px",
				userSelect: "none",
			}}
		>
			{label}
		</Box>
	);
}

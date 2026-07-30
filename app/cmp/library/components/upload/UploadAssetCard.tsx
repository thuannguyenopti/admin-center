"use client";

import { Box, Button, Checkbox, Text } from "@optiaxiom/react";
import {
	IconCheck,
	IconFileImage,
	IconTrashCan,
} from "@optimizely/axiom-icons";
import type { UploadAsset } from "./types";

type Props = {
	asset: UploadAsset;
	selected: boolean;
	active: boolean;
	onSelect: () => void;
	onOpen: () => void;
	onDragStart?: () => void;
	onDragEnd?: () => void;
};

export function UploadAssetCard({
	asset,
	selected,
	active,
	onSelect,
	onOpen,
	onDragStart,
	onDragEnd,
}: Props) {
	const faceCount = asset.faces.length;

	return (
		<Box display="flex" flexDirection="column" gap="12" style={{ minWidth: 0 }}>
			<Box
				bg="bg.default"
				border="1"
				borderColor={active ? "border.accent" : "border.tertiary"}
				className="cmp-upload-asset-card"
				display="flex"
				flexDirection="column"
				overflow="hidden"
				rounded="lg"
				role="button"
				tabIndex={0}
				draggable
				style={{
					cursor: "pointer",
					boxShadow: active ? "0 0 0 2px var(--ax-colors-border-accent)" : undefined,
				}}
				onClick={onOpen}
				onDragEnd={onDragEnd}
				onDragStart={(event) => {
					event.dataTransfer.effectAllowed = "copy";
					event.dataTransfer.setData("text/plain", asset.id);
					onDragStart?.();
				}}
				onKeyDown={(event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						onOpen();
					}
				}}
			>
				<Box style={{ aspectRatio: "1.48 / 1", overflow: "hidden", position: "relative" }}>
					<img
						alt={asset.title}
						src={asset.image}
						style={{
							display: "block",
							height: "100%",
							objectFit: "cover",
							width: "100%",
						}}
					/>
					<Box style={{ left: 10, position: "absolute", top: 10 }}>
						<Checkbox
							checked={selected}
							aria-label={`Select ${asset.title}`}
							onCheckedChange={onSelect}
							onClick={(event) => event.stopPropagation()}
						/>
					</Box>
					<Box style={{ position: "absolute", right: 10, top: 10 }}>
						<Button
							appearance="default"
							size="sm"
							icon={<IconTrashCan size={13} />}
							aria-label={`Remove ${asset.title}`}
							style={{
								background: "var(--ax-colors-bg-default)",
								height: 28,
								minWidth: 28,
								padding: 0,
								width: 28,
							}}
							onClick={(event) => event.stopPropagation()}
						/>
					</Box>
				</Box>
				<Box alignItems="start" display="flex" gap="8" px="12" py="10">
					<IconFileImage size={14} style={{ color: "var(--ax-colors-fg-secondary)" }} />
					<Box display="flex" flex="1" flexDirection="column" gap="2" style={{ minWidth: 0 }}>
						<Text
							fontSize="sm"
							style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
						>
							{asset.title}
						</Text>
						<Text color="fg.secondary" fontSize="xs">
							{asset.statusLabel} · {faceCount} {faceCount === 1 ? "face" : "faces"}
						</Text>
					</Box>
					{selected ? (
						<IconCheck size={12} style={{ color: "var(--ax-colors-fg-accent)", flexShrink: 0 }} />
					) : null}
				</Box>
			</Box>
			<Box display="flex" flexDirection="column" gap="8">
				<Text color="fg.secondary" fontSize="sm" lineClamp="2">
					{asset.tags.join(", ")}
				</Text>
			</Box>
		</Box>
	);
}
